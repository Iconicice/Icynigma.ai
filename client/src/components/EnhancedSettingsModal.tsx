import { useEffect, useMemo, useState } from "react";
import { Check, Mic, Moon, Palette, PanelLeft, Sun, Type, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SETTINGS,
  readStoredSettings,
  settingsEqual,
  SETTINGS_STORAGE_KEY,
  type BackgroundOption,
  type FontOption,
  type ThemeOption,
  type UserSettings,
} from "@/lib/settings";

export { DEFAULT_SETTINGS, type UserSettings } from "@/lib/settings";
export type { ThemeOption, BackgroundOption, FontOption } from "@/lib/settings";

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
  { name: "Purple", value: "#a78bfa" }, { name: "Blue", value: "#60a5fa" },
  { name: "Cyan", value: "#22d3ee" }, { name: "Green", value: "#34d399" },
  { name: "Pink", value: "#f472b6" }, { name: "Amber", value: "#fbbf24" },
];

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onSettingsChange?: (settings: UserSettings) => void;
}

export function EnhancedSettingsModal({ isOpen, onClose, onClearHistory, onSettingsChange }: EnhancedSettingsModalProps) {
  const [savedSettings, setSavedSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isOpen) return;
    const next = readStoredSettings();
    setSavedSettings(next);
    setDraft(next);
  }, [isOpen]);

  const hasChanges = useMemo(() => !settingsEqual(savedSettings, draft), [draft, savedSettings]);
  const update = (partial: Partial<UserSettings>) => setDraft((current) => ({ ...current, ...partial }));
  const closeWithoutApplying = () => { setDraft(savedSettings); onClose(); };
  const apply = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(draft));
    setSavedSettings(draft);
    onSettingsChange?.(draft);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeWithoutApplying()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border border-purple-400/25 bg-slate-950/95 text-slate-50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-purple-400/15 pb-4">
          <DialogTitle className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-2xl font-semibold text-transparent">Icynigma Settings</DialogTitle>
          <p className="text-sm text-purple-100/60">Adjust preferences, then select <strong>Apply changes</strong>. Settings remain only in this browser.</p>
        </DialogHeader>

        <div className="space-y-7 py-2">
          <section className="space-y-3"><Label className="flex items-center gap-2"><Moon className="size-4" /> Theme</Label><div className="grid grid-cols-3 gap-2">{themeOptions.map((option) => <Button key={option.value} type="button" variant={draft.theme === option.value ? "default" : "outline"} onClick={() => update({ theme: option.value })} className={cn("gap-2", draft.theme === option.value && "bg-purple-500 text-white hover:bg-purple-400")}>{option.icon}{option.label}</Button>)}</div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><Palette className="size-4" /> Background</Label><div className="grid grid-cols-2 gap-2">{backgroundOptions.map((option) => <button key={option.value} type="button" onClick={() => update({ background: option.value })} className={cn("h-20 rounded-xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300", option.preview, draft.background === option.value ? "border-purple-300 shadow-[0_0_18px_rgba(167,139,250,.2)]" : "border-white/10 hover:border-purple-300/45")}><span className="text-sm font-medium text-white">{option.label}</span></button>)}</div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><Type className="size-4" /> Typography</Label><div className="grid grid-cols-2 gap-2">{fontOptions.map((option) => <Button key={option.value} type="button" variant={draft.font === option.value ? "default" : "outline"} onClick={() => update({ font: option.value })} className={cn(option.family, draft.font === option.value && "bg-purple-500 text-white hover:bg-purple-400")}>{option.label}</Button>)}</div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><Palette className="size-4" /> Accent color</Label><div className="grid grid-cols-6 gap-2">{accentColors.map((color) => <button key={color.value} type="button" onClick={() => update({ accentColor: color.value })} title={color.name} aria-label={`${color.name} accent color`} style={{ backgroundColor: color.value }} className={cn("aspect-square rounded-lg border-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", draft.accentColor === color.value ? "border-white scale-105" : "border-transparent")} />)}</div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><Mic className="size-4" /> Voice input</Label><Button type="button" variant={draft.voiceInputEnabled ? "default" : "outline"} onClick={() => update({ voiceInputEnabled: !draft.voiceInputEnabled })} className={cn("w-full justify-between", draft.voiceInputEnabled && "bg-purple-500 text-white hover:bg-purple-400")}><span>{draft.voiceInputEnabled ? "Enabled" : "Disabled"}</span><span className="text-xs opacity-75">{draft.voiceInputEnabled ? "Microphone button is shown" : "Type-only composer"}</span></Button><div className="grid grid-cols-2 gap-2"><Button type="button" variant={draft.voiceInputProvider === "elevenlabs" ? "default" : "outline"} onClick={() => update({ voiceInputProvider: "elevenlabs" })} className={draft.voiceInputProvider === "elevenlabs" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>ElevenLabs transcription</Button><Button type="button" variant={draft.voiceInputProvider === "browser" ? "default" : "outline"} onClick={() => update({ voiceInputProvider: "browser" })} className={draft.voiceInputProvider === "browser" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Browser recognition</Button></div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><PanelLeft className="size-4" /> Conversation sidebar</Label><div className="grid grid-cols-2 gap-2"><Button type="button" variant={draft.sidebarMode === "smart" ? "default" : "outline"} onClick={() => update({ sidebarMode: "smart" })} className={draft.sidebarMode === "smart" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Smart context</Button><Button type="button" variant={draft.sidebarMode === "compact" ? "default" : "outline"} onClick={() => update({ sidebarMode: "compact" })} className={draft.sidebarMode === "compact" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Compact rail</Button></div></section>
          <section className="space-y-3"><Label className="flex items-center gap-2"><Volume2 className="size-4" /> Text-to-speech</Label><div className="grid grid-cols-3 gap-2"><Button type="button" variant={draft.ttsProvider === "elevenlabs" ? "default" : "outline"} onClick={() => update({ ttsProvider: "elevenlabs" })} className={draft.ttsProvider === "elevenlabs" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>ElevenLabs</Button><Button type="button" variant={draft.ttsProvider === "piper" ? "default" : "outline"} onClick={() => update({ ttsProvider: "piper" })} className={draft.ttsProvider === "piper" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Piper neural</Button><Button type="button" variant={draft.ttsProvider === "web-speech" ? "default" : "outline"} onClick={() => update({ ttsProvider: "web-speech" })} className={draft.ttsProvider === "web-speech" ? "bg-purple-500 text-white hover:bg-purple-400" : ""}>Browser speech</Button></div><div className="space-y-2"><Label className="flex justify-between text-xs"><span>Speech speed</span><span className="text-purple-200">{draft.ttsSpeed.toFixed(1)}×</span></Label><Slider value={[draft.ttsSpeed]} onValueChange={(value) => update({ ttsSpeed: value[0] })} min={0.5} max={2} step={0.1} /></div></section>
          <section className="border-t border-red-400/15 pt-5"><Button type="button" variant="destructive" className="w-full" onClick={() => { onClearHistory(); closeWithoutApplying(); }}>Clear active conversation</Button></section>
        </div>
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-purple-400/15 bg-slate-950/95 pt-4"><p className="text-xs text-purple-100/55" aria-live="polite">{hasChanges ? "You have unapplied changes." : "All settings are applied."}</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={closeWithoutApplying}>Cancel</Button><Button type="button" disabled={!hasChanges} onClick={apply} className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-400 hover:to-cyan-400"><Check className="mr-2 size-4" />Apply changes</Button></div></div>
      </DialogContent>
    </Dialog>
  );
}
