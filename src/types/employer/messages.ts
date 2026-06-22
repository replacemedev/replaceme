export interface Conversation {
  id: string;
  participantNames: string[];
  lastMessageSnippet: string | null;
  updatedAt: string;
  isUnread: boolean;
  
  // UI presentation helper fields (optional)
  candidateRole?: string;
  avatarUrl?: string | null;
  pinned?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";

  // UI presentation helper fields (optional)
  senderName?: string;
  senderAvatarUrl?: string | null;
  readReceipt?: boolean;
}
