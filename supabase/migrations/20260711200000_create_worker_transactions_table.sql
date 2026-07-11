-- Database migration for Worker Transactions
-- Creates the worker_transactions table, enables RLS, and adds policies and indexes.

CREATE TABLE IF NOT EXISTS public.worker_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'PHP',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'processing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reference_number TEXT UNIQUE,
  receipt_url TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.worker_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Workers can view their own transactions' AND tablename = 'worker_transactions'
  ) THEN
    CREATE POLICY "Workers can view their own transactions" ON public.worker_transactions 
      FOR SELECT USING (auth.uid() = worker_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Workers can manage their own transactions' AND tablename = 'worker_transactions'
  ) THEN
    CREATE POLICY "Workers can manage their own transactions" ON public.worker_transactions 
      FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_worker_transactions_worker_id ON public.worker_transactions(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_transactions_status ON public.worker_transactions(status);
CREATE INDEX IF NOT EXISTS idx_worker_transactions_created_at ON public.worker_transactions(created_at);
