import { describe, expect, it } from "vitest";
import { analyzeRIPrompt } from "./ri-policy";

describe("R.I. sandbox policy", () => {
  it("extracts explicit preferences without applying them", () => {
    const result = analyzeRIPrompt("Please remember that I prefer concise answers.");
    expect(result.memorySuggestions.some((item) => item.key === "user_preference")).toBe(true);
    expect(result.requiresApproval).toBe(true);
    expect(result.boundaries.join(" ")).toContain("production");
  });

  it("creates a reviewable proposal rather than executable code", () => {
    const result = analyzeRIPrompt("Improve ElevenLabs voice fallback and privacy.");
    expect(result.codeProposal.files.length).toBeGreaterThan(0);
    expect(result.codeProposal.patchPlan.length).toBeGreaterThan(0);
    expect(result.codeProposal.title).not.toMatch(/execute|deploy|run automatically/i);
  });

  it("does not invent memory for ordinary messages", () => {
    const result = analyzeRIPrompt("What is consciousness?");
    expect(result.memorySuggestions).toHaveLength(0);
    expect(result.mode).toBe("sandboxed-creative");
  });
});
