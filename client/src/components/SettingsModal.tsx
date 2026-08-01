import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Volume2, Zap } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory?: () => void;
}

export function SettingsModal({ isOpen, onClose, onClearHistory }: SettingsModalProps) {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsProvider, setTtsProvider] = useState<"piper" | "web-speech">("piper");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-accent/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent">
            <Settings className="h-5 w-5" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Text-to-Speech Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">Text-to-Speech</h3>
            </div>

            {/* TTS Toggle */}
            <div className="flex items-center justify-between pl-7">
              <label className="text-sm text-muted-foreground">Enable TTS</label>
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ttsEnabled ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ttsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* TTS Provider */}
            {ttsEnabled && (
              <div className="pl-7 space-y-2">
                <label className="text-sm text-muted-foreground">Provider</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTtsProvider("piper")}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      ttsProvider === "piper"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Piper (Neural)
                  </button>
                  <button
                    onClick={() => setTtsProvider("web-speech")}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      ttsProvider === "web-speech"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Web Speech
                  </button>
                </div>
              </div>
            )}

            {/* TTS Speed */}
            {ttsEnabled && (
              <div className="pl-7 space-y-2">
                <label className="text-sm text-muted-foreground">
                  Speed: {ttsSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            )}
          </div>

          {/* AI Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">AI Settings</h3>
            </div>

            <div className="pl-7 space-y-2">
              <p className="text-sm text-muted-foreground">
                Using Manus LLM with philosophical system prompt
              </p>
              <p className="text-xs text-muted-foreground/70">
                "from the plethora he came" - Icynigma explores the nature of existence, consciousness, and meaning.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-accent/10 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
                  onClearHistory?.();
                  onClose();
                }
              }}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Clear All Chat History
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-accent/10">
          <Button variant="outline" onClick={onClose} className="border-accent/20">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
