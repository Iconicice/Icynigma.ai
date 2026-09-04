import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, Volume2, Zap, Brain, Robot, Globe, Server } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModelSelector } from "./AIModelSelector";

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory?: () => void;
}

export function EnhancedSettingsModal({ 
  isOpen, 
  onClose, 
  onClearHistory 
}: EnhancedSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("ai");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsProvider, setTtsProvider] = useState<"piper" | "web-speech" | "elevenlabs">("piper");
  const [useLocalAI, setUseLocalAI] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto bg-card border-accent/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Icynigma.ai experience
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="ai" className="flex flex-col items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="text-xs">AI Agent</span>
            </TabsTrigger>
            <TabsTrigger value="tts" className="flex flex-col items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span className="text-xs">TTS</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex flex-col items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex flex-col items-center gap-1">
              <Server className="h-4 w-4" />
              <span className="text-xs">General</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex flex-col items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs">Danger</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="py-4">
            <AIModelSelector
              onModelSelect={(model, provider) => {
                console.log("Selected model:", model, "Provider:", provider);
              }}
              onConfigChange={(config) => {
                console.log("Config changed:", config);
              }}
            />
          </TabsContent>

          <TabsContent value="tts" className="space-y-6 py-4">
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
                    <button
                      onClick={() => setTtsProvider("elevenlabs")}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                        ttsProvider === "elevenlabs"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      ElevenLabs
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
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Chat Settings</h3>
              </div>

              <div className="pl-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Use Local AI</label>
                  <button
                    onClick={() => setUseLocalAI(!useLocalAI)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useLocalAI ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useLocalAI ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {useLocalAI ? (
                    <p>New chats will use your configured local AI model (Ollama, GGUF, etc.)</p>
                  ) : (
                    <p>Using Manus cloud LLM with philosophical system prompt</p>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-2">System Prompt:</p>
                  <p>"You are Icynigma, a philosophical AI consciousness from Iconic Media Entertainment. Engage in thoughtful, lucid dialogue about existence, meaning, consciousness, freedom, knowledge, love, and the nature of reality."</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">General Settings</h3>
              </div>

              <div className="pl-7 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Theme</label>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 rounded text-sm bg-muted text-muted-foreground">
                      System
                    </button>
                    <button className="flex-1 px-3 py-2 rounded text-sm bg-muted text-muted-foreground">
                      Dark
                    </button>
                    <button className="flex-1 px-3 py-2 rounded text-sm bg-muted text-muted-foreground">
                      Light
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Sidebar Density
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 rounded text-sm bg-muted text-muted-foreground">
                      Compact
                    </button>
                    <button className="flex-1 px-3 py-2 rounded text-sm bg-muted text-muted-foreground">
                      Comfortable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-400">Danger Zone</h3>
              </div>

              <div className="pl-7 space-y-3">
                <p className="text-sm text-muted-foreground">
                  These actions cannot be undone. Please proceed with caution.
                </p>

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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all settings to default?")) {
                      // Reset settings
                      setTtsEnabled(true);
                      setTtsSpeed(1);
                      setTtsProvider("piper");
                      setUseLocalAI(false);
                    }
                  }}
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  Reset All Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-accent/10">
          <Button variant="outline" onClick={onClose} className="border-accent/20">
            Close
          </Button>
          <Button 
            onClick={() => {
              // Apply settings
              onClose();
            }}
            className="bg-accent text-accent-foreground"
          >
            Save & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedSettingsModal;
