-- Inbox order should follow last message activity, not metadata writes.
-- The generic BEFORE UPDATE trigger bumped chat_threads.updated_at on every
-- row change (mark-read, pin, soft-delete flags), which reshuffled the inbox
-- when a user merely opened a conversation.
-- New messages still bump updated_at via on_new_chat_message / handle_new_chat_message.

DROP TRIGGER IF EXISTS update_chat_threads_updated_at ON public.chat_threads;
