import { afterEach, describe, expect, it, vi } from "vitest";
import { synthesizeWithElevenLabs } from "./elevenlabs";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("ElevenLabs speech service", () => {
  it("sends synthesis requests server-side with the configured key", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "unit-test-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    const audio = await synthesizeWithElevenLabs({ text: "A question enters the silence." });

    expect(Buffer.from(audio)).toEqual(Buffer.from([1, 2, 3]));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/text-to-speech/"),
      expect.objectContaining({ headers: expect.objectContaining({ "xi-api-key": "unit-test-key" }) }),
    );
  });
});
