import { useEffect, useState } from "react";
import { Mic, Moon, Palette, PanelLeft, Sun, Type, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type ThemeOption = "dark" | "light" | "auto";
export type BackgroundOption = "gradient" | "solid" | "pattern" | "glass";
export type FontOption = "default" | "elegant" | "modern" | "futuristic";

export interface UserSettings {
  theme: ThemeOption;
  background: BackgroundOption;
  font: FontOption;
  ttsProvider: "piper" | "web-speech";
  ttsSpeed: number;
  accentColor: string;
  voiceInputEnabled: boolean;
  sidebarMode: "smart" | "compact";
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  background: "gradient",
  font: "futuristic",
  ttsProvider: "piper",
  ttsSpeed: 1,
  accentColor: "#a78bfa",
  voiceInputEnabled: true,
  sidebarMode: "smart",
};

const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon className="size-4" /> },
  { value: "light", label: "Light", icon: <Sun className="size-4" /> },
  { value: "auto", label: "Auto", icon: <Palette className="size-4" /> },
];

const backgroundOptions: { value: BackgroundOption; label: string; preview: string }[] = [
  { value: "gradient", label: "Gradient", preview: "bg-gradient-to-br from-purple-900 to-blue-950" },
  { value: "solid", label: "Solid", preview: "bg-slate-950" },
  { value: "pattern", label: "Aurora", preview: "bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,.65),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,.4),transparent_46%),#020617]" },
  { value: "glass", label: "Glass", preview: "bg-slate-950/70 backdrop-blur" },
];

const fontOptions: { value: FontOption; label: string; family: string }[] = [
  { value: "default", label: "Balanced", family: "font-sans" },
  { value: "elegant", label: "Elegant", family: "font-serif" },
  { value: "modern", label: "Mono", family: "font-mono" },
  { value: "futuristic", label: "Futuristic", family: "font-futuristic" },
];

const accentColors = [
  { name: "Purple", value: "#a78bfa" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Cyan", value: "#22d3ee" },
  { name: "Green", value: "#34d399" },
  { name: "Pink", value: "#f472b6" },
  { name: "Amber", value: "#fbbf24" },
];

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onSettingsChange?: (settings: UserSettings) => void;
}

export function EnhancedSettingsModal({ isOpen, onClose, onClearHistory, onSettingsChange }: EnhancedSettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("icynigma-settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {
      localStorage.removeItem("icynigma-settings");
    }
  }, []);

  const update = (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    localStorage.setItem("icynigma-settings", JSON.stringify(next));
    onSettingsChange?.(next);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border border-purple-400/25 bg-slate-950/95 text-slate-50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-purple-400/15 pb-4">
          <DialogTitle className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-2xl font-semibold text-transparent">Icynigma Settings</DialogTitle>
          <p className="text-sm text-purple-100/60">Preferences are stored only in this browser and applied immediately.</p>
        </DialogHeader>

        <div className="space-y-7 py-2">
          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Moon className="size-4" /> Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <Button key={option.value} type="button" variant={settings.theme === option.value ? "default" : "outline"} onClick={() => update({ theme: option.value })} className={cn("gap-2", settings.theme === option.value && "bg-purple-500 text-white hover:bg-purple-400")}>{option.icon}{option.label}</Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Palette className="size-4" /> Background</Label>
            <div className="grid grid-cols-2 gap-2">
              {backgroundOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => update({ background: option.value })} className={cn("h-20 rounded-xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300", option.preview, settings.background === option.value ? "border-purple-300 shadow-[0_0_18px_rgba(167,139,250,.2)]" : "border-white/10 hover:border-purple-300/45")}>
                  <span className="text-sm font-medium text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Type className="size-4" /> Typography</Label>
            <div className="grid grid-cols-2 gap-2">
              {fontOptions.map((option) => (
                <Button key={option.value} type="button" variant={settings.font === option.value ? "default" : "outline"} onClick={() => update({ font: option.value })} className={cn(option.family, settings.font === option.value && "bg-purple-500 text-white hover:bg-purple-400")}>{option.label}</Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Palette className="size-4" /> Accent color</Label>
            <div className="grid grid-cols-6 gap-2">
              {accentColors.map((color) => (
                <button key={color.value} type="button" onClick={() => update({ accentColor: color.value })} title={color.name} aria-label={`${color.name} accent color`} style={{ backgroundColor: color.value }} className={cn("aspect-square rounded-lg border-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", settings.accentColor === color.value ? "border-white scale-105" : "border-transparent")} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Mic className="size-4" /> Voice input</Label>
            <Button type="button" variant={settings.voiceInputEnabled ? "default" : "outline"} onClick={() => update({ voiceInputEnabled: !settings.voiceInputEnabled })} className={cn("w-full justify-between", settings.voiceInputEnabled && "bg-purple-500 text-white hover:bg-purple-400")}>
              <span>{settings.voiceInputEnabled ? "Enabled" : "Disabled"}</span>
              <span className="text-xs opacity-75">{settings.voiceInputEnabled ? "Microphone button is shown" : "Type-only composer"}</span>
            </Button>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><PanelLeft className="size-4" /> Conversation sidebar</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={settings.sidebarMode === "smart" ? "default" : "outline"} onClick={() => update({ sidebarMode: "smart" })} className={settings.sidebarMode === "smart" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Smart context</Button>
              <Button type="button" variant={settings.sidebarMode === "compact" ? "default" : "outline"} onClick={() => update({ sidebarMode: "compact" })} className={settings.sidebarMode === "compact" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Compact rail</Button>
            </div>
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2"><Volume2 className="size-4" /> Text-to-speech</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={settings.ttsProvider === "piper" ? "default" : "outline"} onClick={() => update({ ttsProvider: "piper" })} className={settings.ttsProvider === "piper" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Piper neural</Button>
              <Button type="button" variant={settings.ttsProvider === "web-speech" ? "default" : "outline"} onClick={() => update({ ttsProvider: "web-speech" })} className={settings.ttsProvider === "web-speech" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Browser speech</Button>
            </div>
            <div className="space-y-2">
              <Label className="flex justify-between text-xs"><span>Speech speed</span><span className="text-purple-200">{settings.ttsSpeed.toFixed(1)}×</span></Label>
              <Slider value={[settings.ttsSpeed]} onValueChange={(value) => update({ ttsSpeed: value[0] })} min={0.5} max={2} step={0.1} />
            </div>
          </section>

          <section className="border-t border-red-400/15 pt-5">
            <Button type="button" variant="destructive" className="w-full" onClick={() => { onClearHistory(); onClose(); }}>Clear active conversation</Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
