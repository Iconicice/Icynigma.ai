export type ThemeOption = "dark" | "light" | "auto";
export type BackgroundOption = "gradient" | "solid" | "pattern" | "glass";
export type FontOption = "default" | "elegant" | "modern" | "futuristic";
export type TTSProviderOption = "piper" | "web-speech" | "elevenlabs";
export type VoiceInputProviderOption = "browser" | "elevenlabs";

export interface UserSettings {
  theme: ThemeOption;
  background: BackgroundOption;
  font: FontOption;
  ttsProvider: TTSProviderOption;
  ttsSpeed: number;
  accentColor: string;
  voiceInputEnabled: boolean;
  voiceInputProvider: VoiceInputProviderOption;
  sidebarMode: "smart" | "compact";
}

export const SETTINGS_STORAGE_KEY = "icynigma-settings";

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  background: "gradient",
  font: "futuristic",
  ttsProvider: "elevenlabs",
  ttsSpeed: 1,
  accentColor: "#a78bfa",
  voiceInputEnabled: true,
  voiceInputProvider: "elevenlabs",
  sidebarMode: "smart",
};

const themes: ThemeOption[] = ["dark", "light", "auto"];
const backgrounds: BackgroundOption[] = ["gradient", "solid", "pattern", "glass"];
const fonts: FontOption[] = ["default", "elegant", "modern", "futuristic"];
const ttsProviders: TTSProviderOption[] = ["piper", "web-speech", "elevenlabs"];
const voiceInputProviders: VoiceInputProviderOption[] = ["browser", "elevenlabs"];

export function normalizeSettings(value: unknown): UserSettings {
  const candidate = value && typeof value === "object" ? value as Partial<UserSettings> : {};
  return {
    theme: themes.includes(candidate.theme as ThemeOption) ? candidate.theme as ThemeOption : DEFAULT_SETTINGS.theme,
    background: backgrounds.includes(candidate.background as BackgroundOption) ? candidate.background as BackgroundOption : DEFAULT_SETTINGS.background,
    font: fonts.includes(candidate.font as FontOption) ? candidate.font as FontOption : DEFAULT_SETTINGS.font,
    ttsProvider: ttsProviders.includes(candidate.ttsProvider as TTSProviderOption) ? candidate.ttsProvider as TTSProviderOption : DEFAULT_SETTINGS.ttsProvider,
    ttsSpeed: typeof candidate.ttsSpeed === "number" && candidate.ttsSpeed >= 0.5 && candidate.ttsSpeed <= 2 ? candidate.ttsSpeed : DEFAULT_SETTINGS.ttsSpeed,
    accentColor: typeof candidate.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(candidate.accentColor) ? candidate.accentColor : DEFAULT_SETTINGS.accentColor,
    voiceInputEnabled: typeof candidate.voiceInputEnabled === "boolean" ? candidate.voiceInputEnabled : DEFAULT_SETTINGS.voiceInputEnabled,
    voiceInputProvider: voiceInputProviders.includes(candidate.voiceInputProvider as VoiceInputProviderOption) ? candidate.voiceInputProvider as VoiceInputProviderOption : DEFAULT_SETTINGS.voiceInputProvider,
    sidebarMode: candidate.sidebarMode === "compact" ? "compact" : "smart",
  };
}

export function settingsEqual(left: UserSettings, right: UserSettings) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function readStoredSettings() {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}"));
  } catch {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }
}
