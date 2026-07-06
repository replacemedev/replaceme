import { Database } from "./database";

export type DbChatThread = Database["public"]["Tables"]["chat_threads"]["Row"];
export type DbChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

export type MessagingRole = "worker" | "employer";

/** Sentinel value for the "All Roles" dropdown option. */
export const ALL_JOB_ROLES = "all" as const;
export type JobRoleFilterValue = typeof ALL_JOB_ROLES | string;

/** Unique job tied to the user's active chat threads (from jobs / job_posts). */
export interface MessagingJobRole {
  id: string;
  title: string;
}

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
  /** Job title from jobs table (job_posts view). */
  jobTitle: string | null;
  /** Header context, e.g. "Application for Shopify Developer". */
  contextTitle: string;
  blocked_reason: string | null;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
    read_at: string | null;
  } | null;
  unread_count: number;
  marked_unread: boolean;
}

export interface MessagingMessage extends DbChatMessage {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "employer" | "worker" | "admin";
  } | null;
}

/** Derive unique job roles from real thread data — no mock hydration. */
export function extractJobRolesFromThreads(
  threads: MessagingThread[]
): MessagingJobRole[] {
  const byId = new Map<string, string>();
  for (const thread of threads) {
    if (thread.job_id && thread.jobTitle) {
      byId.set(thread.job_id, thread.jobTitle);
    }
  }
  return Array.from(byId, ([id, title]) => ({ id, title })).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function buildContextTitle(jobTitle: string | null): string {
  return jobTitle ? `Application for ${jobTitle}` : "Application Conversation";
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
