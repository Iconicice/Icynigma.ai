import { describe, expect, it } from "vitest";
import { getOfficialImeReference, IME_OFFICIAL_SOURCE_URL, isOfficialImeQuestion } from "./ime-reference";

describe("official I.M.E. reference", () => {
  it("detects the requested official identity topics", () => {
    expect(isOfficialImeQuestion("Who is Iconic.ice?")).toBe(true);
    expect(isOfficialImeQuestion("What does I.M.E. offer artists?")).toBe(true);
    expect(isOfficialImeQuestion("Tell me about Inolofatseng Mokgoko")).toBe(true);
  });

  it("does not attach official context to unrelated philosophy prompts", () => {
    expect(isOfficialImeQuestion("What does freedom mean?")).toBe(false);
    expect(getOfficialImeReference("What does freedom mean?")).toBeNull();
  });

  it("provides only the designated source and curated official facts", () => {
    const reference = getOfficialImeReference("Who founded Ice Media Entertainment?");
    expect(reference).toContain(IME_OFFICIAL_SOURCE_URL);
    expect(reference).toContain("Inolofatseng G. Mokgoko");
    expect(reference).toContain("Do not invent");
  });
});
