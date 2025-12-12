/**
 * AI Model Selector Component
 * 
 * Allows users to choose between different AI models:
 * - OpenAI (ChatGPT/GPT-4)
 * - Google Gemini
 * - DeepSeek
 * - Anthropic Claude
 */

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export type AIModelId = "openai" | "gemini" | "deepseek" | "claude";

export interface AIModel {
  id: AIModelId;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

interface AIModelSelectorProps {
  models: AIModel[];
  selectedModel: AIModelId;
  onSelectModel: (modelId: AIModelId) => void;
  isLoading?: boolean;
}

export default function AIModelSelector({
  models,
  selectedModel,
  onSelectModel,
  isLoading = false,
}: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <div className="relative">
      {/* Model Selector Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full justify-between border-border/30 hover:border-accent/50 hover:bg-card/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentModel?.icon}</span>
          <div className="text-left">
            <div className="text-sm font-medium">{currentModel?.name}</div>
            <div className="text-xs text-muted-foreground">
              {currentModel?.description}
            </div>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-accent" />
      </Button>

      {/* Model List Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 border border-border/30 rounded-lg bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelectModel(model.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left border-b border-border/20 hover:bg-accent/10 transition-colors last:border-b-0 ${
                selectedModel === model.id ? "bg-accent/20 border-l-2 border-l-accent" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{model.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{model.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {model.description}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-block px-2 py-0.5 text-xs bg-accent/20 text-accent rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
