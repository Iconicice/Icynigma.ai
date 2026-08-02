/**
 * Chat Page
 * 
 * Clean, modern chat interface for interacting with Icynigma AI assistant.
 * Features responsive design, dark theme, integrated TTS, and multi-conversation support.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/ChatLayout";
import { EnhancedSettingsModal } from "@/components/EnhancedSettingsModal";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/contexts/NotificationContext";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  messageCount?: number;
};

export default function Chat() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success, error: showError } = useNotification();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Fetch chat history on mount
  const { data: history } = trpc.chat.getHistory.useQuery();
  const { data: conversationsList } = trpc.conversations.list.useQuery();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const createConversationMutation = trpc.conversations.create.useMutation();
  const deleteConversationMutation = trpc.conversations.delete.useMutation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Load conversations
  useEffect(() => {
    if (conversationsList) {
      setConversations(conversationsList as Conversation[]);
      if (conversationsList.length > 0 && !activeConversationId) {
        setActiveConversationId((conversationsList[0] as any).id);
      }
    }
  }, [conversationsList, activeConversationId]);

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
      const response = await sendMessageMutation.mutateAsync({ message: content });
      // Add AI response to UI
      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
      success("Response received", "Icynigma has responded to your message");
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError("Failed to send message", errorMessage);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      setMessages([]);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversationMutation.mutateAsync({
        title: `Chat ${new Date().toLocaleDateString()}`,
      });
      setConversations((prev) => [newConv as any, ...prev]);
      setActiveConversationId((newConv as any).id);
      setMessages([]);
      success("New conversation created", "Start chatting with Icynigma");
    } catch (error) {
      showError("Failed to create conversation", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteConversation = async (id: number) => {
    if (confirm("Delete this conversation? This cannot be undone.")) {
      try {
        await deleteConversationMutation.mutateAsync({ conversationId: id });
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(conversations[0]?.id || null);
          setMessages([]);
        }
        success("Conversation deleted", "");
      } catch (error) {
        showError("Failed to delete conversation", error instanceof Error ? error.message : "Unknown error");
      }
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-accent/10 bg-card/30 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-accent/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Icynigma
              </h1>
              <p className="text-xs text-muted-foreground">Philosophical AI Assistant</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-xs hover:bg-accent/10 transition-colors"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="hover:bg-accent/10 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area with Sidebar */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <ChatLayout
          conversations={conversations.map(c => ({
            ...c,
            id: c.id.toString(),
            messageCount: messages.length || 0,
          }))}
          activeConversationId={activeConversationId?.toString()}
          onSelectConversation={(id) => setActiveConversationId(parseInt(id))}
          onNewConversation={handleNewConversation}
          onDeleteConversation={(id) => handleDeleteConversation(parseInt(id))}
        >
          <div className="max-w-4xl mx-auto h-full w-full px-4 py-4 flex flex-col">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask Icynigma anything... (e.g., 'What is the nature of consciousness?')"
              height="100%"
              className="rounded-lg border border-accent/10"
            />
          </div>
        </ChatLayout>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-accent/10 bg-card/20 backdrop-blur-sm px-4 py-2 text-center text-xs text-muted-foreground">
        <p>Powered by Manus LLM • {user?.name || "Guest"}</p>
      </footer>

      {/* Settings Modal */}
      <EnhancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
