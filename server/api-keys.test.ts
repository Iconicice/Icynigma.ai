import { describe, expect, it } from "vitest";

describe("API Keys Validation", () => {
  it("OpenAI API key is set", () => {
    const key = process.env.OPENAI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-proj-/);
  });

  it("Gemini API key is set", () => {
    const key = process.env.GEMINI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^AIza/);
  });

  it("DeepSeek API key is set", () => {
    const key = process.env.DEEPSEEK_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-/);
  });

  it("Claude API key is set", () => {
    const key = process.env.CLAUDE_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-ant-/);
  });

  it("All required API keys are available", () => {
    const requiredKeys = [
      "OPENAI_API_KEY",
      "GEMINI_API_KEY",
      "DEEPSEEK_API_KEY",
      "CLAUDE_API_KEY",
    ];

    requiredKeys.forEach((key) => {
      expect(process.env[key]).toBeDefined();
    });
  });
});
