import { useMemo, useState } from "react";
import { Brain, ChevronLeft, Compass, Menu, MessageSquare, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  filterConversations,
  getContextSummary,
  getSuggestedPrompts,
  groupConversations,
  type SidebarConversation,
} from "@/lib/smartSidebar";

export type Conversation = SidebarConversation;

export type ChatLayoutProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUsePrompt?: (prompt: string) => void;
  children: React.ReactNode;
  compact?: boolean;
};

export function ChatLayout({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUsePrompt,
  children,
  compact = false,
}: ChatLayoutProps) {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const visibleConversations = useMemo(() => filterConversations(conversations, query), [conversations, query]);
  const groups = useMemo(() => groupConversations(visibleConversations), [visibleConversations]);
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const prompts = getSuggestedPrompts(activeConversation?.title);

  const selectConversation = (id: string) => {
    onSelectConversation(id);
    setMobileOpen(false);
  };

  const createConversation = () => {
    onNewConversation();
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="border-b border-purple-400/15 p-3">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-purple-100">
            <div className="flex size-8 items-center justify-center rounded-lg border border-purple-400/25 bg-purple-500/10">
              <Brain className="size-4 text-purple-300" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Thought space</p>
              <p className="text-[11px] text-purple-200/55">Your living archive</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close conversations"
          >
            <X className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          onClick={createConversation}
          className="h-10 w-full gap-2 border border-purple-300/25 bg-gradient-to-r from-purple-500/90 to-blue-600/90 text-white shadow-[0_0_16px_rgba(139,92,246,0.22)] hover:from-purple-400 hover:to-blue-500"
        >
          <Plus className="size-4" aria-hidden="true" />
          New conversation
        </Button>
      </div>

      <div className="border-b border-purple-400/10 p-3">
        <label className="relative block" aria-label="Search conversations">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-purple-200/50" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your thoughts"
            className="h-9 w-full rounded-lg border border-purple-400/15 bg-slate-950/35 pl-8 pr-3 text-xs text-purple-50 placeholder:text-purple-200/40 outline-none transition focus:border-purple-300/45 focus:ring-2 focus:ring-purple-300/20"
          />
        </label>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-purple-400/20 bg-purple-500/5 px-4 py-7 text-center">
              <MessageSquare className="mx-auto mb-2 size-5 text-purple-300/60" aria-hidden="true" />
              <p className="text-xs text-purple-100/75">{query ? "No conversations match that search." : "Your first conversation will appear here."}</p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200/45">{group.label}</p>
                <div className="space-y-1">
                  {group.conversations.map((conversation) => {
                    const active = activeConversationId === conversation.id;
                    return (
                      <div
                        key={conversation.id}
                        onMouseEnter={() => setHoveredId(conversation.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "group flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2.5 transition",
                          active
                            ? "border-purple-300/35 bg-gradient-to-r from-purple-500/20 to-blue-500/10 shadow-[0_0_18px_rgba(139,92,246,0.12)]"
                            : "border-transparent hover:border-purple-400/15 hover:bg-purple-500/5",
                        )}
                        onClick={() => selectConversation(conversation.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectConversation(conversation.id);
                          }
                        }}
                      >
                        <MessageSquare className={cn("size-3.5 shrink-0", active ? "text-purple-200" : "text-purple-300/55")} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-xs font-medium", active ? "text-purple-50" : "text-purple-100/85")}>{conversation.title}</p>
                          <p className="mt-0.5 text-[10px] text-purple-200/45">{conversation.messageCount} {conversation.messageCount === 1 ? "message" : "messages"}</p>
                        </div>
                        {(hoveredId === conversation.id || active) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="rounded-md p-1 text-purple-200/45 transition hover:bg-red-500/15 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
                            aria-label={`Delete ${conversation.title}`}
                            title="Delete conversation"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </ScrollArea>

      {!compact && (
        <div className="space-y-3 border-t border-purple-400/15 p-3">
          <section className="rounded-xl border border-purple-400/15 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-3" aria-label="Active context">
            <div className="mb-1.5 flex items-center gap-1.5 text-purple-100">
              <Sparkles className="size-3.5 text-purple-300" aria-hidden="true" />
              <p className="text-xs font-semibold">Active context</p>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-100/65">{getContextSummary(activeConversation)}</p>
          </section>
          <section aria-label="Suggested prompts">
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <Compass className="size-3.5 text-cyan-300" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-200/50">Explore next</p>
            </div>
            <div className="space-y-1">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onUsePrompt?.(prompt)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-[11px] leading-snug text-purple-100/70 transition hover:bg-purple-500/10 hover:text-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );

  return (
    <div className="relative flex h-full min-h-0 bg-transparent">
      <aside className={cn("hidden shrink-0 flex-col border-r border-purple-400/15 bg-slate-950/45 backdrop-blur-xl md:flex", compact ? "w-16" : "w-72")}>
        {compact ? (
          <div className="flex h-full flex-col items-center gap-3 p-3">
            <Button type="button" size="icon" onClick={createConversation} aria-label="New conversation" title="New conversation"><Plus className="size-4" /></Button>
            <Button type="button" size="icon" variant="outline" onClick={() => onUsePrompt?.(prompts[0])} aria-label="Use a suggested prompt" title="Explore a prompt"><Compass className="size-4" /></Button>
          </div>
        ) : sidebarContent}
      </aside>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-3 top-3 z-20 size-10 border-purple-300/25 bg-slate-950/80 text-purple-100 shadow-lg backdrop-blur md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open conversations"
        title="Open conversations"
      >
        <Menu className="size-4" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Conversations">
          <button type="button" aria-label="Close conversations" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(88vw,21rem)] flex-col border-r border-purple-400/20 bg-slate-950/95 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
