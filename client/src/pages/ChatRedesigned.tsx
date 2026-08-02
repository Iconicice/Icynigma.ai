/**
 * Chat Page - Redesigned with 3D Glass-Morphism
 * 
 * Full aesthetic overhaul with:
 * - 3D glass-morphism design throughout
 * - Animated gradient backgrounds
 * - Futuristic typography (Orbitron)
 * - Glass-effect cards and components
 * - Smooth animations and transitions
 * - Professional UX flows
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/ChatLayout";
import { EnhancedSettingsModal } from "@/components/EnhancedSettingsModal";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/contexts/NotificationContext";
import { ArrowLeft, Settings, LogOut, HelpCircle, Sparkles, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  messageCount?: number;
};

export default function ChatRedesigned() {
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

    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({ message: content });
      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
      success("Response received", "Icynigma has responded");
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showError("Failed to send message", errorMessage);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-foreground flex flex-col overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="glass-effect-dark sticky top-0 z-50 transition-all duration-300 border-b border-purple-500/20 backdrop-blur-md">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-accent/10 transition-colors rounded-lg"
              aria-label="Back to home"
              title="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <div>
                <h1 className="text-lg font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Icynigma
                </h1>
                <p className="text-xs text-purple-300/60">Philosophical AI</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
              className="hover:bg-accent/10 transition-colors rounded-lg"
              aria-label="Help"
              title="Get help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="hover:bg-accent/10 transition-colors rounded-lg"
              aria-label="Settings"
              title="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Help Banner */}
        {showHelp && (
          <div className="border-t border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm text-purple-300/80 relative z-10 backdrop-blur-sm">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-purple-400 mt-0.5" />
              <div>
                <p className="font-medium text-purple-200 mb-2">💡 Tips for better conversations:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc text-purple-300/70">
                  <li>Ask philosophical questions about consciousness, existence, and meaning</li>
                  <li>Customize your experience in settings (theme, font, voice)</li>
                  <li>Create new conversations to organize different topics</li>
                  <li>Use text-to-speech to listen to Icynigma's responses</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Loading State */}
      {historyLoading || conversationsLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
            </div>
            <p className="text-purple-300/70">Loading your conversations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Area with Sidebar */}
          <main className="flex-1 overflow-hidden flex flex-col relative z-10">
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
                    <div className="text-center space-y-8 max-w-md">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
                        <div className="relative text-6xl">🧠</div>
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">
                          Welcome to Icynigma
                        </h2>
                        <p className="text-purple-300/80 mb-6 leading-relaxed">
                          Start a philosophical conversation about existence, consciousness, meaning, and the nature of reality.
                        </p>
                        <p className="text-sm text-purple-400/80 font-medium">
                          ✨ Ask me anything philosophical...
                        </p>
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
                    className="rounded-xl border border-purple-500/20 glass-effect-dark"
                  />
                )}
              </div>
            </ChatLayout>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-gradient-to-r from-purple-950/50 to-blue-950/50 backdrop-blur-sm px-4 py-3 text-center text-xs text-purple-300/60 relative z-10">
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
