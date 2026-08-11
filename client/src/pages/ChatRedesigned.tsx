import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { ChatLayout } from "@/components/ChatLayout";
import { DEFAULT_SETTINGS, EnhancedSettingsModal, type UserSettings } from "@/components/EnhancedSettingsModal";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";
import { useNotification } from "@/contexts/NotificationContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, HelpCircle, LogOut, Settings, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
  messageCount: number;
};

const backgroundClasses: Record<UserSettings["background"], string> = {
  gradient: "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900",
  solid: "bg-slate-950",
  pattern: "bg-[radial-gradient(circle_at_18%_20%,rgba(139,92,246,.34),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(6,182,212,.20),transparent_34%),linear-gradient(135deg,#020617,#1e1b4b,#020617)]",
  glass: "bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950",
};
const lightBackgroundClasses: Record<UserSettings["background"], string> = {
  gradient: "bg-gradient-to-br from-slate-100 via-violet-100 to-cyan-100",
  solid: "bg-slate-100",
  pattern: "bg-[radial-gradient(circle_at_18%_20%,rgba(139,92,246,.24),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(6,182,212,.18),transparent_34%),linear-gradient(135deg,#f8fafc,#ede9fe,#ecfeff)]",
  glass: "bg-gradient-to-br from-white via-violet-50 to-slate-100",
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

export default function ChatRedesigned() {
  const { user, isAuthenticated, logout } = useAuth();
  const { success, error: showError } = useNotification();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const conversationsQuery = trpc.conversations.list.useQuery(undefined, { enabled: isAuthenticated });
  const historyInput = useMemo(() => ({ conversationId: activeConversationId ?? 0 }), [activeConversationId]);
  const historyQuery = trpc.chat.getHistory.useQuery(historyInput, { enabled: Boolean(activeConversationId) });
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const createConversationMutation = trpc.conversations.create.useMutation();
  const deleteConversationMutation = trpc.conversations.delete.useMutation();
  const clearConversationMutation = trpc.chat.clear.useMutation();

  const conversations = (conversationsQuery.data ?? []) as Conversation[];
  const isLoading = sendMessageMutation.isPending || createConversationMutation.isPending;

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
      const response = await sendMessageMutation.mutateAsync({ message: content, conversationId });
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

  const handleSettingsChange = (next: UserSettings) => setSettings(next);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  const isLightTheme = settings.theme === "light" || (settings.theme === "auto" && !prefersDark);
  const activeBackground = isLightTheme ? lightBackgroundClasses[settings.background] : backgroundClasses[settings.background];
  const shellTone = isLightTheme ? "border-slate-300/70 bg-white/75 text-slate-900" : "border-purple-400/15 bg-slate-950/55";
  const contentTone = isLightTheme ? "border-slate-300/70 bg-white/45" : "border-purple-400/15 bg-slate-950/25";


  if (!isAuthenticated) return null;

  return (
    <div className={`${activeBackground} ${fontClasses[settings.font]} min-h-screen overflow-hidden ${isLightTheme ? "text-slate-900" : "text-foreground"}`} style={{ "--icynigma-accent": settings.accentColor, boxShadow: `inset 0 3px 0 ${settings.accentColor}` } as React.CSSProperties}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 size-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-16 right-6 size-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className={`border-b backdrop-blur-xl ${shellTone}`} style={{ borderTopColor: settings.accentColor, borderTopWidth: 2 }}>
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => setLocation("/")} className="shrink-0 text-purple-100 hover:bg-purple-500/10" aria-label="Back to home" title="Back to home"><ArrowLeft className="size-4" /></Button>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-purple-400/25 bg-purple-500/10"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663240321743/zJmlXyrDRYNPrYwS.webp" alt="" aria-hidden="true" className="size-8 object-contain drop-shadow-[0_0_7px_rgba(192,132,252,.65)]" /></div>
                <div className="min-w-0">
                  <h1 className="truncate text-base font-futuristic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">Icynigma</h1>
                  <p className="hidden text-[11px] text-purple-100/55 sm:block">from the plethora he came</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <InstallAppButton compact className="border-purple-300/20 bg-slate-950/30 text-purple-100 hover:bg-purple-500/10" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowHelp((visible) => !visible)} className="text-purple-100 hover:bg-purple-500/10" aria-label="Show chat help" title="Help"><HelpCircle className="size-4" /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-purple-100 hover:bg-purple-500/10" aria-label="Open settings" title="Settings"><Settings className="size-4" /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => { if (window.confirm("Sign out of Icynigma?")) { logout(); setLocation("/"); } }} className="text-purple-100 hover:bg-red-500/10 hover:text-red-200" aria-label="Sign out" title="Sign out"><LogOut className="size-4" /></Button>
            </div>
          </div>
          {showHelp && (
            <div className="border-t border-purple-400/10 bg-purple-500/5 px-4 py-3 text-xs text-purple-100/75">
              <div className="mx-auto flex max-w-4xl gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-purple-300" /><p>Ask one question at a time, use the sidebar to keep ideas distinct, select the microphone to speak instead of type, and open Settings to personalize the atmosphere.</p></div>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 p-0 md:p-3">
          <div className={`mx-auto h-[calc(100vh-65px)] max-w-[1600px] overflow-hidden border-y md:rounded-2xl md:border ${contentTone}`}>
            <ChatLayout
              conversations={conversations.map((conversation) => ({ ...conversation, id: String(conversation.id) }))}
              activeConversationId={activeConversationId ? String(activeConversationId) : undefined}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onUsePrompt={handleSendMessage}
              compact={settings.sidebarMode === "compact"}
            >
              <div className="h-full p-3 pt-14 sm:p-4 sm:pt-4">
                {conversationsQuery.isLoading ? (
                  <div className="flex h-full items-center justify-center"><div className="text-center text-sm text-purple-100/65"><div className="mx-auto mb-3 size-9 animate-spin rounded-full border-2 border-purple-300/30 border-t-purple-300" />Opening your thought space…</div></div>
                ) : (
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading || historyQuery.isLoading}
                    placeholder="Ask Icynigma about consciousness, meaning, freedom…"
                    height="100%"
                    className="h-full"
                    emptyStateMessage={activeConversationId ? "This thread is quiet. What question should wake it?" : "Begin with a question, and Icynigma will create a new thread for it."}
                    suggestedPrompts={undefined}
                    voiceInputEnabled={settings.voiceInputEnabled}
                    voiceInputProvider={settings.voiceInputProvider}
                    ttsProvider={settings.ttsProvider}
                    ttsSpeed={settings.ttsSpeed}
                  />
                )}
              </div>
            </ChatLayout>
          </div>
        </main>

        <footer className={`border-t px-4 py-2 text-center text-[11px] backdrop-blur ${isLightTheme ? "border-slate-300/70 bg-white/45 text-slate-600" : "border-purple-400/10 bg-slate-950/35 text-purple-100/50"}`}>
          Icynigma.ai • Created by Inolofatseng Mokgoko • {user?.name || "Guest"}
        </footer>
      </div>

      <EnhancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onClearHistory={handleClearHistory}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
