import { NextRequest } from "next/server";

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const ELEVENLABS_MODEL = "eleven_turbo_v2";

function getConfig() {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID,
  };
}

export async function GET() {
  const { apiKey, voiceId } = getConfig();

  return Response.json(
    { configured: Boolean(apiKey && voiceId) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(req: NextRequest) {
  const { apiKey, voiceId } = getConfig();

  if (!apiKey || !voiceId) {
    return Response.json(
      { error: "ElevenLabs voiceover is not configured." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${ELEVENLABS_URL}/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });
  } catch {
    return Response.json(
      { error: "ElevenLabs voiceover request failed." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: "ElevenLabs voiceover request failed." },
      { status: upstream.status || 502 },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
    },
  });
}
