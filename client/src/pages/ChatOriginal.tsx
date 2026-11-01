import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { ChatLayout } from "@/components/ChatLayout";
import { EnhancedSettingsModal, DEFAULT_SETTINGS, type UserSettings } from "@/components/EnhancedSettingsModal";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, HelpCircle, LogOut, Settings, Sparkles, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
  messageCount: number;
};

const fontClasses: Record<UserSettings["font"], string> = {
  default: "font-sans",
  elegant: "font-serif",
  modern: "font-mono",
  futuristic: "font-futuristic",
};

function titleFromMessage(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  return compact.length > 52 ? `${compact.slice(0, 49)}…` : compact || "New conversation";
}

export default function ChatOriginal() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success, error: showError } = useNotification();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const conversationsQuery = trpc.conversations.list.useQuery(undefined, { enabled: isAuthenticated });
  const historyInput = useMemo(() => ({ conversationId: activeConversationId ?? 0 }), [activeConversationId]);
  const historyQuery = trpc.chat.getHistory.useQuery(historyInput, { enabled: Boolean(activeConversationId) });
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const createConversationMutation = trpc.conversations.create.useMutation();
  const deleteConversationMutation = trpc.conversations.delete.useMutation();
  const clearConversationMutation = trpc.chat.clear.useMutation();
  const conversations = (conversationsQuery.data ?? []) as Conversation[];

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("icynigma-settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {
      localStorage.removeItem("icynigma-settings");
    }
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
    const dark = settings.theme === "dark" || (settings.theme === "auto" && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.setProperty("--icynigma-accent", settings.accentColor);
  }, [settings]);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) setActiveConversationId(conversations[0].id);
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!historyQuery.data) return;
    setMessages(historyQuery.data.map((message) => ({
      role: message.role as Message["role"],
      content: message.content,
    })));
  }, [historyQuery.data]);

  const createConversation = async (title = "New conversation") => {
    const conversation = await createConversationMutation.mutateAsync({ title });
    setActiveConversationId(conversation.id);
    setMessages([]);
    await utils.conversations.list.invalidate();
    return conversation.id;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    try {
      const conversationId = activeConversationId ?? await createConversation(titleFromMessage(content));
      setMessages((previous) => [...previous, { role: "user", content }]);
      const response = await sendMessageMutation.mutateAsync({
        message: content,
        conversationId,
        useLocalAI: offlineMode,
        provider: offlineMode ? "ollama" : undefined,
        model: offlineMode ? "liquid/lfm3-omni" : undefined,
      });
      setMessages((previous) => [...previous, { role: "assistant", content: response.message }]);
      await Promise.all([
        utils.chat.getHistory.invalidate({ conversationId }),
        utils.conversations.list.invalidate(),
      ]);
    } catch (error) {
      showError("Message not sent", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleNewConversation = async () => {
    try {
      await createConversation();
      success("New conversation", "A fresh space for your next question is ready.");
    } catch (error) {
      showError("Could not create a conversation", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleSelectConversation = (id: string) => {
    const nextId = Number(id);
    if (!Number.isFinite(nextId) || nextId === activeConversationId) return;
    setActiveConversationId(nextId);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    const conversationId = Number(id);
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation || !window.confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return;
    try {
      const result = await deleteConversationMutation.mutateAsync({ conversationId });
      if (!result.success) throw new Error("The conversation could not be deleted.");
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
      await utils.conversations.list.invalidate();
      success("Conversation deleted", "The thread and its messages were removed.");
    } catch (error) {
      showError("Could not delete conversation", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleClearHistory = async () => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    if (!window.confirm("Clear every message in this conversation? This cannot be undone.")) return;
    try {
      await clearConversationMutation.mutateAsync({ conversationId: activeConversationId });
      setMessages([]);
      await Promise.all([
        utils.chat.getHistory.invalidate({ conversationId: activeConversationId }),
        utils.conversations.list.invalidate(),
      ]);
      success("Conversation cleared", "This thread is ready for a new direction.");
    } catch (error) {
      showError("Could not clear conversation", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`aurora-shell min-h-screen text-foreground ${fontClasses[settings.font]} flex flex-col`}>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => setLocation("/")} className="hover:bg-accent/10" aria-label="Back to home" title="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden min-w-0 sm:block">
              <h1 className="truncate font-futuristic text-sm tracking-[0.2em] text-foreground">ICYNIGMA <span className="text-accent">/</span> WORKSPACE</h1>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span className="signal-pulse" />Reflective channel</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <InstallAppButton compact className="border-accent/20 bg-transparent hover:bg-accent/10" />
            <Button type="button" variant={offlineMode ? "default" : "ghost"} size="icon" onClick={() => setOfflineMode((current) => !current)} className="hover:bg-accent/10" aria-label={offlineMode ? "Use cloud AI" : "Use offline AI"} title={offlineMode ? "Offline AI enabled" : "Enable offline AI"}>
              <WifiOff className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowHelp((visible) => !visible)} className="hover:bg-accent/10" aria-label="Show chat help" title="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="hover:bg-accent/10" aria-label="Open settings" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => { if (window.confirm("Sign out of Icynigma?")) { logout(); setLocation("/"); } }} className="hover:bg-red-500/10 hover:text-red-400" aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {showHelp && (
          <div className="border-t border-accent/10 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">
            <div className="mx-auto flex max-w-3xl gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><p>Ask one question at a time, use the sidebar to keep ideas distinct, select the microphone to speak, or enable Live Voice for hands-free conversation.</p></div>
          </div>
        )}
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatLayout
          conversations={conversations.map((conversation) => ({ ...conversation, id: String(conversation.id) }))}
          activeConversationId={activeConversationId ? String(activeConversationId) : undefined}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onUsePrompt={handleSendMessage}
          compact={settings.sidebarMode === "compact"}
        >
          <div className="mx-auto h-full w-full max-w-5xl px-3 py-3 sm:px-5 sm:py-5">
            {conversationsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />Opening your thought space…</div></div>
            ) : (
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={sendMessageMutation.isPending || createConversationMutation.isPending || historyQuery.isLoading}
                placeholder="Ask Icynigma anything... (e.g., 'What is the nature of consciousness?')"
                height="100%"
                className="h-full rounded-[24px] border border-border/60 bg-card/55 shadow-2xl"
                emptyStateMessage={activeConversationId ? "This thread is quiet. What question should wake it?" : "Begin with a question, and Icynigma will create a new thread for it."}
                voiceInputEnabled={settings.voiceInputEnabled}
                liveVoiceEnabled={settings.liveVoiceEnabled}
                voiceInputProvider={settings.voiceInputProvider}
                ttsProvider={settings.ttsProvider}
                ttsSpeed={settings.ttsSpeed}
              />
            )}
          </div>
        </ChatLayout>
      </main>

      <footer className="border-t border-border/70 bg-background/70 px-4 py-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm">
        <p>Icynigma.ai • Created by Inolofatseng Mokgoko • {user?.name || "Guest"}</p>
      </footer>

      <EnhancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onClearHistory={handleClearHistory}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
