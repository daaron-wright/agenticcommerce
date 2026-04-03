/**
 * ElevenLabs Text-to-Speech client service.
 * Streams audio from the ElevenLabs REST API and plays it via the browser.
 */

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function getApiKey(): string | null {
  return typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? null)
    : null;
}

function getVoiceId(): string {
  return (
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID) ||
    DEFAULT_VOICE_ID
  );
}

export function isElevenLabsConfigured(): boolean {
  return !!getApiKey();
}

export async function speak(text: string): Promise<void> {
  stop(); // stop any previous playback

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[ElevenLabs] No API key configured — skipping TTS playback.");
    return;
  }

  const voiceId = getVoiceId();

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("[ElevenLabs] TTS request failed:", res.status, await res.text());
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  currentObjectUrl = url;

  const audio = new Audio(url);
  currentAudio = audio;

  return new Promise<void>((resolve) => {
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      resolve();
    };
    audio.play().catch(() => {
      cleanup();
      resolve();
    });
  });
}

export function stop(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  cleanup();
}

function cleanup() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  currentAudio = null;
}
