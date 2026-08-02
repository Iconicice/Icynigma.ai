/**
 * Chat Page - UX Improved
 * 
 * Enhanced user experience with:
 * - Better error handling and messaging
 * - Improved loading states
 * - Better empty states
 * - Optimized user flows
 * - Accessibility improvements
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/ChatLayout";
import { EnhancedSettingsModal } from "@/components/EnhancedSettingsModal";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/contexts/NotificationContext";
import { ArrowLeft, Settings, LogOut, HelpCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  messageCount?: number;
};

export default function ChatImproved() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success, error: showError } = useNotification();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch chat history on mount
  const { data: history, isLoading: historyLoading } = trpc.chat.getHistory.useQuery();
  const { data: conversationsList, isLoading: conversationsLoading } = trpc.conversations.list.useQuery();
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
    if (!content.trim()) {
      showError("Empty message", "Please type something before sending");
      return;
    }

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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
    if (confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
      setMessages([]);
      success("History cleared", "Your chat history has been deleted");
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
    if (confirm("Delete this conversation? This action cannot be undone.")) {
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
    if (confirm("Are you sure you want to log out?")) {
      logout();
      setLocation("/");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 text-foreground flex flex-col">
      {/* Header */}
      <header className="glass-effect-dark sticky top-0 z-50 transition-all duration-300 border-b border-accent/10">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-accent/10 transition-colors"
              aria-label="Back to home"
              title="Back to home"
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
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
              className="hover:bg-accent/10 transition-colors"
              aria-label="Help"
              title="Get help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-xs hover:bg-accent/10 transition-colors hidden sm:inline-flex"
              aria-label="Clear chat history"
              title="Clear all messages"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="hover:bg-accent/10 transition-colors"
              aria-label="Settings"
              title="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-500/10 hover:text-red-400 transition-colors"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Help Banner */}
        {showHelp && (
          <div className="border-t border-accent/10 bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Tips for better conversations:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Ask philosophical questions about existence, consciousness, and meaning</li>
                  <li>Use the settings to customize your experience (theme, font, TTS)</li>
                  <li>Create new conversations to organize different topics</li>
                  <li>Enable text-to-speech to listen to responses</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Loading State */}
      {historyLoading || conversationsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
            <p className="text-muted-foreground">Loading your conversations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Area with Sidebar */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <ChatLayout
              conversations={conversations.map((c) => ({
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
                {/* Empty State */}
                {messages.length === 0 && !isLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="text-6xl">🧠</div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Icynigma</h2>
                        <p className="text-muted-foreground mb-6">
                          Start a philosophical conversation about existence, consciousness, meaning, and reality.
                        </p>
                        <p className="text-sm text-accent font-medium">Ask me anything philosophical...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Box */}
                {(messages.length > 0 || isLoading) && (
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Ask Icynigma anything... (e.g., 'What is the nature of consciousness?')"
                    height="100%"
                    className="rounded-lg border border-accent/10"
                  />
                )}
              </div>
            </ChatLayout>
          </main>
        </>
      )}

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
