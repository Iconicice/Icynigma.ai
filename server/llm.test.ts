import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const response = (body: unknown, ok = true, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("latest LLM configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "test-key");
    vi.stubEnv("ICYNIGMA_LLM_MODEL", "gemini-3.8-flash");
    vi.stubEnv("ICYNIGMA_LLM_FALLBACK_MODEL", "gemini-3.5-flash-lite");
    vi.stubEnv("ICYNIGMA_LLM_THINKING_BUDGET", "256");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the current stable primary model with bounded reasoning", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        id: "primary-response",
        created: 1,
        model: "gemini-3.8-flash",
        choices: [{ index: 0, message: { role: "assistant", content: "A considered answer." }, finish_reason: "stop" }],
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const { invokeLLM } = await import("./_core/llm");

    const result = await invokeLLM({ messages: [{ role: "user", content: "What is meaning?" }] });
    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);

    expect(result.model).toBe("gemini-3.8-flash");
    expect(request.model).toBe("gemini-3.8-flash");
    expect(request.thinking).toEqual({ budget_tokens: 256 });
  });

  it("falls back only when the configured primary model is unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "model not found" }, false, 404))
      .mockResolvedValueOnce(
        response({
          id: "fallback-response",
          created: 1,
          model: "gemini-3.5-flash-lite",
          choices: [{ index: 0, message: { role: "assistant", content: "Fallback answer." }, finish_reason: "stop" }],
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    const { invokeLLM } = await import("./_core/llm");

    const result = await invokeLLM({ messages: [{ role: "user", content: "Continue." }] });

    expect(result.model).toBe("gemini-3.5-flash-lite");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string).model).toBe("gemini-3.5-flash-lite");
  });

  it("does not retry ordinary invalid requests as another model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ error: "invalid request schema" }, false, 400));
    vi.stubGlobal("fetch", fetchMock);
    const { invokeLLM } = await import("./_core/llm");

    await expect(invokeLLM({ messages: [{ role: "user", content: "Test" }] })).rejects.toThrow("400");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
