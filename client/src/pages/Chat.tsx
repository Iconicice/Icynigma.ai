/**
 * Chat Page - Icynigma Original AI Agent
 * 
 * A philosophical dialogue interface with Icynigma
 * Features:
 * - Real-time conversation with the original AI agent
 * - Thinking process visualization
 * - Concept exploration
 * - Conversation history
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState<any>(null);

  // Fetch chat history on mount
  const { data: history } = trpc.chat.getHistory.useQuery();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const clearHistoryMutation = trpc.chat.clearHistory.useMutation();

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
    setShowThinking(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: content,
      });

      // Show thinking process
      setThinkingProcess(response.thinking);

      // Add AI response to UI
      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I encountered an error in my contemplation. Please try again." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      try {
        await clearHistoryMutation.mutateAsync();
        setMessages([]);
        setThinkingProcess(null);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
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
                Philosophical Dialogue with {user?.name || "Guest"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearHistory}
            className="hover:bg-destructive/10 hover:text-destructive"
            title="Clear conversation history"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Thinking Process Display */}
      {showThinking && thinkingProcess && (
        <div className="border-b border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="text-xs font-medium text-accent mb-2">Icynigma's Thinking Process</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {thinkingProcess.reasoning.map((step: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-accent">→</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-accent">
              Confidence: {Math.round(thinkingProcess.confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full w-full">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask Icynigma about philosophy, existence, consciousness, or anything on your mind..."
            height="100%"
            className="rounded-none"
          />
        </div>
      </main>
    </div>
  );
}
