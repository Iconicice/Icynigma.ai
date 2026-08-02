/**
 * Enhanced Settings Modal
 * User customization for themes, backgrounds, fonts, and TTS settings
 */

import { useEffect, useState } from 'react';
import { X, Moon, Sun, Palette, Type, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export type ThemeOption = 'dark' | 'light' | 'auto';
export type BackgroundOption = 'gradient' | 'solid' | 'pattern' | 'glass';
export type FontOption = 'default' | 'elegant' | 'modern' | 'futuristic';

export interface UserSettings {
  theme: ThemeOption;
  background: BackgroundOption;
  font: FontOption;
  ttsProvider: 'piper' | 'web-speech';
  ttsSpeed: number;
  accentColor: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  background: 'gradient',
  font: 'default',
  ttsProvider: 'piper',
  ttsSpeed: 1.0,
  accentColor: '#a78bfa', // purple
};

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'auto', label: 'Auto', icon: <Palette className="w-4 h-4" /> },
];

const BACKGROUND_OPTIONS = [
  { value: 'gradient', label: 'Gradient', preview: 'bg-gradient-to-br from-purple-900 to-indigo-900' },
  { value: 'solid', label: 'Solid', preview: 'bg-slate-950' },
  { value: 'pattern', label: 'Pattern', preview: 'bg-slate-900' },
  { value: 'glass', label: 'Glass', preview: 'bg-white/10 backdrop-blur' },
];

const FONT_OPTIONS = [
  { value: 'default', label: 'Default', family: 'font-sans' },
  { value: 'elegant', label: 'Elegant', family: 'font-serif' },
  { value: 'modern', label: 'Modern', family: 'font-mono' },
  { value: 'futuristic', label: 'Futuristic', family: 'font-sans' },
];

const ACCENT_COLORS = [
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#34d399' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Orange', value: '#fb923c' },
];

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onSettingsChange?: (settings: UserSettings) => void;
}

export function EnhancedSettingsModal({
  isOpen,
  onClose,
  onClearHistory,
  onSettingsChange,
}: EnhancedSettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('icynigma-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSettingChange = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('icynigma-settings', JSON.stringify(updated));
    onSettingsChange?.(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-accent/20">
        <DialogHeader className="border-b border-accent/10 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            Icynigma Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Moon className="w-4 h-4" />
              Theme
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.theme === option.value ? 'default' : 'outline'}
                  className={cn(
                    'gap-2 transition-all',
                    settings.theme === option.value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => handleSettingChange({ theme: option.value })}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Palette className="w-4 h-4" />
              Background
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSettingChange({ background: option.value as BackgroundOption })}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all',
                    settings.background === option.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50',
                    option.preview
                  )}
                >
                  <div className="text-sm font-medium text-foreground">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Type className="w-4 h-4" />
              Font Style
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.font === option.value ? 'default' : 'outline'}
                  className={cn(
                    'gap-2 transition-all',
                    settings.font === option.value && 'bg-accent text-accent-foreground',
                    option.family
                  )}
                  onClick={() => handleSettingChange({ font: option.value as FontOption })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Palette className="w-4 h-4" />
              Accent Color
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleSettingChange({ accentColor: color.value })}
                  className={cn(
                    'w-full aspect-square rounded-lg border-2 transition-all hover:scale-110',
                    settings.accentColor === color.value
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* TTS Provider */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Volume2 className="w-4 h-4" />
              Text-to-Speech Provider
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={settings.ttsProvider === 'piper' ? 'default' : 'outline'}
                className={settings.ttsProvider === 'piper' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => handleSettingChange({ ttsProvider: 'piper' })}
              >
                Piper (Neural)
              </Button>
              <Button
                variant={settings.ttsProvider === 'web-speech' ? 'default' : 'outline'}
                className={settings.ttsProvider === 'web-speech' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => handleSettingChange({ ttsProvider: 'web-speech' })}
              >
                Web Speech
              </Button>
            </div>
          </div>

          {/* TTS Speed */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between text-sm font-semibold">
              <span>Speech Speed</span>
              <span className="text-accent">{settings.ttsSpeed.toFixed(1)}x</span>
            </Label>
            <Slider
              value={[settings.ttsSpeed]}
              onValueChange={(value) => handleSettingChange({ ttsSpeed: value[0] })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-accent/10 pt-4 space-y-3">
            <Label className="text-sm font-semibold text-red-400">Danger Zone</Label>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                onClearHistory();
                onClose();
              }}
            >
              Clear Chat History
            </Button>
          </div>

          {/* Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-xs text-muted-foreground">
            <p>Settings are saved locally in your browser. Changes apply immediately.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
