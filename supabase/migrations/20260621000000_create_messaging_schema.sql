-- Create Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Participants link table
CREATE TABLE IF NOT EXISTS public.participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, profile_id)
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.participants 
        WHERE participants.conversation_id = id 
        AND participants.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

-- Participants RLS Policies
CREATE POLICY "Users can view participants in their conversations" 
ON public.participants 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.participants p 
        WHERE p.conversation_id = conversation_id 
        AND p.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Users can join conversations" 
ON public.participants 
FOR INSERT 
WITH CHECK (
    profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.participants p 
        WHERE p.conversation_id = conversation_id 
        AND p.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

-- Messages RLS Policies
CREATE POLICY "Users can read messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.participants 
        WHERE participants.conversation_id = conversation_id 
        AND participants.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    sender_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    AND
    EXISTS (
        SELECT 1 FROM public.participants 
        WHERE participants.conversation_id = conversation_id 
        AND participants.profile_id = sender_id
    )
);

CREATE POLICY "Users can update read receipts in their conversations" 
ON public.messages 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.participants 
        WHERE participants.conversation_id = conversation_id 
        AND participants.profile_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
)
WITH CHECK (true);
