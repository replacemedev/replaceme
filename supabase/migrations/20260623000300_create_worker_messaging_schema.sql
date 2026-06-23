-- Create Chat Threads Table
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_profile_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (worker_id, company_profile_id, job_id)
);

-- Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS chat_threads_worker_id_idx ON public.chat_threads(worker_id);
CREATE INDEX IF NOT EXISTS chat_threads_company_profile_id_idx ON public.chat_threads(company_profile_id);
CREATE INDEX IF NOT EXISTS chat_threads_job_id_idx ON public.chat_threads(job_id);
CREATE INDEX IF NOT EXISTS chat_messages_thread_id_idx ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop Existing Policies if any
DROP POLICY IF EXISTS "Users can view threads they participate in" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can insert threads they participate in" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can update threads they participate in" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.chat_messages;

-- Chat Threads RLS Policies
CREATE POLICY "Users can view threads they participate in" ON public.chat_threads
    FOR SELECT USING (
        worker_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.company_profiles cp
            WHERE cp.id = company_profile_id
            AND cp.employer_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert threads they participate in" ON public.chat_threads
    FOR INSERT WITH CHECK (
        worker_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.company_profiles cp
            WHERE cp.id = company_profile_id
            AND cp.employer_id = auth.uid()
        )
    );

CREATE POLICY "Users can update threads they participate in" ON public.chat_threads
    FOR UPDATE USING (
        worker_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.company_profiles cp
            WHERE cp.id = company_profile_id
            AND cp.employer_id = auth.uid()
        )
    );

-- Chat Messages RLS Policies
CREATE POLICY "Users can view messages in their threads" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_threads t
            WHERE t.id = thread_id
            AND (
                t.worker_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.company_profiles cp
                    WHERE cp.id = t.company_profile_id
                    AND cp.employer_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert messages to their threads" ON public.chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.chat_threads t
            WHERE t.id = thread_id
            AND (
                t.worker_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.company_profiles cp
                    WHERE cp.id = t.company_profile_id
                    AND cp.employer_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can update messages in their threads" ON public.chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat_threads t
            WHERE t.id = thread_id
            AND (
                t.worker_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.company_profiles cp
                    WHERE cp.id = t.company_profile_id
                    AND cp.employer_id = auth.uid()
                )
            )
        )
    ) WITH CHECK (true);

-- Triggers for Updated At
CREATE TRIGGER update_chat_threads_updated_at 
    BEFORE UPDATE ON public.chat_threads 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update chat_threads.updated_at when a new message is sent
CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_threads
    SET updated_at = timezone('utc'::text, now())
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_chat_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_chat_message();
