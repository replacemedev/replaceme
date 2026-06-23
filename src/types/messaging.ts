import { Database } from "./database"

export type DbChatThread = Database["public"]["Tables"]["chat_threads"]["Row"]
export type DbChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"]

export interface ChatThread extends DbChatThread {
  company_profiles: {
    id: string
    company_name: string
    logo_url: string | null
    website_url: string | null
  }
  jobs: {
    id: string
    title: string
  } | null
  last_message?: {
    content: string
    created_at: string
    sender_id: string
    read_at: string | null
  } | null
  unread_count?: number
}

export interface ChatMessage extends DbChatMessage {
  sender?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: "employer" | "worker" | "admin"
  } | null
}
