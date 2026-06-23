import { Database } from "./database";

export type DbChatThread = Database["public"]["Tables"]["chat_threads"]["Row"];
export type DbChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

export type MessagingRole = "worker" | "employer";

/** Display info for the other party in a thread (company for workers, worker for employers). */
export interface MessagingParty {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Role-agnostic thread for shared inbox UI. */
export interface MessagingThread {
  id: string;
  worker_id: string;
  company_profile_id: string;
  job_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  oppositeParty: MessagingParty;
  jobTitle: string | null;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
    read_at: string | null;
  } | null;
  unread_count: number;
}

export interface MessagingMessage extends DbChatMessage {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "employer" | "worker" | "admin";
  } | null;
}

// ponytail: legacy aliases kept so existing imports don't break during migration
export type ChatThread = MessagingThread & {
  company_profiles?: {
    id: string;
    company_name: string;
    logo_url: string | null;
    website_url: string | null;
  };
  jobs?: { id: string; title: string } | null;
};
export type ChatMessage = MessagingMessage;
