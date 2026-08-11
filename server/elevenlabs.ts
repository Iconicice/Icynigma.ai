import { Buffer } from "node:buffer";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

function getApiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ElevenLabs is not configured");
  return key;
}

async function readError(response: Response) {
  const body = await response.text().catch(() => "");
  return body.slice(0, 300) || response.statusText;
}

export async function synthesizeWithElevenLabs(input: { text: string; voiceId?: string }) {
  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${encodeURIComponent(input.voiceId || DEFAULT_VOICE_ID)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": getApiKey(),
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: input.text, model_id: "eleven_multilingual_v2" }),
    },
  );

  if (!response.ok) throw new Error(`ElevenLabs synthesis failed: ${await readError(response)}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function transcribeWithElevenLabs(input: { audio: Buffer; mimeType: string; filename?: string; language?: string }) {
  const form = new FormData();
  form.set("model_id", "scribe_v2");
  form.set("file", new Blob([new Uint8Array(input.audio)], { type: input.mimeType || "audio/webm" }), input.filename || "icynigma-voice.webm");
  if (input.language) form.set("language_code", input.language);
  form.set("timestamps_granularity", "none");

  const response = await fetch(`${ELEVENLABS_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": getApiKey() },
    body: form,
  });

  if (!response.ok) throw new Error(`ElevenLabs transcription failed: ${await readError(response)}`);
  const payload = await response.json() as { text?: string; language_code?: string };
  return { text: payload.text?.trim() ?? "", language: payload.language_code ?? null };
}
