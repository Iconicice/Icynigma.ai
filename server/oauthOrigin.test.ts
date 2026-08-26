import { describe, expect, it } from "vitest";
import { getOAuthOrigin } from "../client/src/const";

describe("OAuth redirect origin", () => {
  it("uses the registered live application origin for temporary preview hosts", () => {
    expect(getOAuthOrigin({ hostname: "3000-preview.manus.computer", origin: "https://3000-preview.manus.computer" })).toBe("https://icynigma-xkxmkqhz.manus.space");
  });

  it("preserves the deployed app origin outside temporary preview hosts", () => {
    expect(getOAuthOrigin({ hostname: "icynigma-xkxmkqhz.manus.space", origin: "https://icynigma-xkxmkqhz.manus.space" })).toBe("https://icynigma-xkxmkqhz.manus.space");
  });
});
