/**
 * Manus-Style Chat Layout
 * Sidebar with conversation list + main chat area
 */

import { useState } from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export type Conversation = {
  id: string;
  title: string;
  createdAt: Date;
  messageCount: number;
};

export type ChatLayoutProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  children: React.ReactNode;
};

export function ChatLayout({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  children,
}: ChatLayoutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-64 border-r border-border bg-card/50 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button
            onClick={onNewConversation}
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    'group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors',
                    activeConversationId === conversation.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.messageCount} messages
                    </p>
                  </div>
                  {hoveredId === conversation.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      className="p-1 hover:bg-destructive/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
