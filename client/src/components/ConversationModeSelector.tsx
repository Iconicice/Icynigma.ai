/**
 * Conversation Mode Selector Component
 * 
 * Allows users to choose conversation style:
 * - Quick Chat: Fast, focused responses
 * - Deep Thinking: Extended reasoning
 * - Creative: Imaginative and poetic
 * - Analytical: Rigorous logic
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConversationModeId = "quick" | "deep-thinking" | "creative" | "analytical";

export interface ConversationMode {
  id: ConversationModeId;
  name: string;
  description: string;
  icon: string;
}

interface ConversationModeSelectorProps {
  modes: ConversationMode[];
  selectedMode: ConversationModeId;
  onSelectMode: (modeId: ConversationModeId) => void;
  isLoading?: boolean;
}

export default function ConversationModeSelector({
  modes,
  selectedMode,
  onSelectMode,
  isLoading = false,
}: ConversationModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          variant={selectedMode === mode.id ? "default" : "outline"}
          onClick={() => onSelectMode(mode.id)}
          disabled={isLoading}
          className={cn(
            "flex flex-col items-center justify-center h-auto py-3 px-2 transition-all",
            selectedMode === mode.id
              ? "bg-accent text-accent-foreground border-accent"
              : "border-border/30 hover:border-accent/50"
          )}
        >
          <span className="text-2xl mb-1">{mode.icon}</span>
          <div className="text-xs font-medium text-center">{mode.name}</div>
          <div className="text-xs opacity-70 text-center mt-1 hidden md:block">
            {mode.description}
          </div>
        </Button>
      ))}
    </div>
  );
}
