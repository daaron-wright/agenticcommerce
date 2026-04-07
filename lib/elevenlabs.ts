/**
 * ElevenLabs Text-to-Speech client service.
 * Requests audio from the app's server-side proxy and plays it via the browser.
 */

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let currentRequestController: AbortController | null = null;

export async function isElevenLabsConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as { configured?: boolean };
    return !!data.configured;
  } catch {
    return false;
  }
}

export async function speak(text: string): Promise<void> {
  stop(); // stop any previous playback or in-flight request

  const controller = new AbortController();
  currentRequestController = controller;

  let res: Response;
  try {
    res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("[ElevenLabs] TTS request failed.");
    }
    return;
  } finally {
    if (currentRequestController === controller) {
      currentRequestController = null;
    }
  }

  if (!res.ok) {
    console.error("[ElevenLabs] TTS request failed:", res.status);
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
  if (currentRequestController) {
    currentRequestController.abort();
    currentRequestController = null;
  }

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
