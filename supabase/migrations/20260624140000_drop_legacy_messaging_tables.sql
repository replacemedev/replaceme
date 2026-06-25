-- Phase 4: Drop legacy messaging tables after app migration to chat_threads / chat_messages.
-- App code no longer references conversations, participants, or messages.

DROP POLICY IF EXISTS "Users can update read receipts in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

DROP POLICY IF EXISTS "Users can join conversations" ON public.participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they are in" ON public.participants;
DROP POLICY IF EXISTS "Users can update their own participant details" ON public.participants;
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.participants;

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_participants" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON public.conversations;

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

DROP FUNCTION IF EXISTS public.is_conversation_member(uuid, uuid);
