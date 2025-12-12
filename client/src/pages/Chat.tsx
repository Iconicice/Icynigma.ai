/**
 * Chat Page
 * 
 * Full-screen chat interface with multi-AI support
 * Features:
 * - AI model selection (OpenAI, Gemini, DeepSeek, Claude)
 * - Conversation modes (Quick, Deep Thinking, Creative, Analytical)
 * - Real-time chat with streaming responses
 * - Conversation history
 */

import { useAuth } from "@/_core/hooks/useAuth";
import AIModelSelector, { type AIModelId } from "@/components/AIModelSelector";
import ConversationModeSelector, { type ConversationModeId } from "@/components/ConversationModeSelector";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelId>("openai");
  const [selectedMode, setSelectedMode] = useState<ConversationModeId>("quick");

  // Fetch chat history on mount
  const { data: history } = trpc.chat.getHistory.useQuery();
  const { data: availableModels } = trpc.chat.getAvailableModels.useQuery();
  const { data: conversationModes } = trpc.chat.getConversationModes.useQuery();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Load chat history
  useEffect(() => {
    if (history) {
      const formattedMessages = history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [history]);

  const handleSendMessage = async (content: string) => {
    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: content,
        model: selectedModel,
        mode: selectedMode,
      });
      // Add AI response to UI
      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-accent/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-accent">Icynigma.ai</h1>
              <p className="text-xs text-muted-foreground">
                Unified AI Assistant with {user?.name || "Guest"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="border-b border-border/30 bg-card/30 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          {/* AI Model Selector */}
          {availableModels && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                AI Model
              </label>
              <AIModelSelector
                models={availableModels as any}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Conversation Mode Selector */}
          {conversationModes && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Conversation Mode
              </label>
              <ConversationModeSelector
                modes={conversationModes as any}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full w-full">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={`Ask Icynigma anything using ${selectedModel} in ${selectedMode} mode...`}
            height="100%"
            className="rounded-none"
          />
        </div>
      </main>
    </div>
  );
}
