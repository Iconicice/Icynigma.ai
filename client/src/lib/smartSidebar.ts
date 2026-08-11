export type SidebarConversation = {
  id: string;
  title: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  messageCount: number;
};

export type ConversationGroup = {
  label: "Today" | "Previous 7 days" | "Earlier";
  conversations: SidebarConversation[];
};

const philosophicalPrompts = [
  "What makes a life meaningful?",
  "Is consciousness more than information?",
  "How should we live with uncertainty?",
  "Can freedom exist without responsibility?",
  "What does it mean to know oneself?",
];

function asDate(value: Date | string | undefined): Date {
  const parsed = value ? new Date(value) : new Date(0);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

export function filterConversations(
  conversations: SidebarConversation[],
  query: string,
): SidebarConversation[] {
  const normalized = query.trim().toLocaleLowerCase();
  const sorted = [...conversations].sort(
    (left, right) => asDate(right.updatedAt ?? right.createdAt).getTime() - asDate(left.updatedAt ?? left.createdAt).getTime(),
  );

  if (!normalized) return sorted;
  return sorted.filter((conversation) => conversation.title.toLocaleLowerCase().includes(normalized));
}

export function groupConversations(
  conversations: SidebarConversation[],
  now: Date = new Date(),
): ConversationGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const groups: ConversationGroup[] = [
    { label: "Today", conversations: [] },
    { label: "Previous 7 days", conversations: [] },
    { label: "Earlier", conversations: [] },
  ];

  filterConversations(conversations, "").forEach((conversation) => {
    const timestamp = asDate(conversation.updatedAt ?? conversation.createdAt).getTime();
    if (timestamp >= startOfToday) groups[0].conversations.push(conversation);
    else if (timestamp >= sevenDaysAgo) groups[1].conversations.push(conversation);
    else groups[2].conversations.push(conversation);
  });

  return groups.filter((group) => group.conversations.length > 0);
}

export function getSuggestedPrompts(context?: string): string[] {
  if (!context?.trim()) return philosophicalPrompts.slice(0, 3);

  const normalized = context.toLocaleLowerCase();
  if (normalized.includes("conscious") || normalized.includes("mind")) {
    return [
      "How might consciousness change the way we understand identity?",
      "Can an artificial mind have a point of view?",
      "Where does awareness begin?",
    ];
  }
  if (normalized.includes("meaning") || normalized.includes("purpose")) {
    return [
      "Can meaning be created rather than discovered?",
      "What survives when certainty disappears?",
      "How do personal values become a way of life?",
    ];
  }
  if (normalized.includes("freedom") || normalized.includes("choice")) {
    return [
      "How do freedom and responsibility shape each other?",
      "Can a choice be authentic when it is influenced?",
      "What would a freer life look like today?",
    ];
  }

  return philosophicalPrompts.slice(0, 3);
}

export function getContextSummary(conversation?: SidebarConversation): string {
  if (!conversation) return "Create a thread to give Icynigma a place to keep this line of inquiry.";
  const count = conversation.messageCount;
  return `${count} ${count === 1 ? "message" : "messages"} in “${conversation.title}”. Keep the next question connected, or begin a fresh thread for a new thought.`;
}
