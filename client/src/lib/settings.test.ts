import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings, settingsEqual } from "./settings";

describe("Icynigma settings", () => {
  it("adds safe defaults for legacy saved settings", () => {
    const settings = normalizeSettings({ theme: "light", ttsProvider: "piper", ttsSpeed: 1.4 });
    expect(settings.theme).toBe("light");
    expect(settings.ttsProvider).toBe("piper");
    expect(settings.ttsSpeed).toBe(1.4);
    expect(settings.voiceInputProvider).toBe("elevenlabs");
    expect(settings.accentColor).toBe(DEFAULT_SETTINGS.accentColor);
  });

  it("rejects unsafe or unsupported preference values", () => {
    const settings = normalizeSettings({ theme: "neon", ttsSpeed: 12, accentColor: "url(javascript:alert(1))" });
    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(settings.ttsSpeed).toBe(DEFAULT_SETTINGS.ttsSpeed);
    expect(settings.accentColor).toBe(DEFAULT_SETTINGS.accentColor);
  });

  it("detects unapplied changes", () => {
    expect(settingsEqual(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS })).toBe(true);
    expect(settingsEqual(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, background: "glass" })).toBe(false);
  });
});
