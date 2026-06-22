-- Migration for Pricing and Applicant Flow security assertions
-- Ensures RLS policies are strictly set for zero-trust authorization on unlocked states

-- Make sure RLS is enabled
ALTER TABLE public.unlocked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy assertions or fresh policy creations
DROP POLICY IF EXISTS "Employers can view their own unlocked profiles" ON public.unlocked_profiles;
CREATE POLICY "Employers can view their own unlocked profiles" ON public.unlocked_profiles 
  FOR SELECT USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can insert unlocks for themselves" ON public.unlocked_profiles;
CREATE POLICY "Employers can insert unlocks for themselves" ON public.unlocked_profiles 
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can update their own unlocked profile rows" ON public.unlocked_profiles;
CREATE POLICY "Employers can update their own unlocked profile rows" ON public.unlocked_profiles 
  FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can delete their own unlocked profile rows" ON public.unlocked_profiles;
CREATE POLICY "Employers can delete their own unlocked profile rows" ON public.unlocked_profiles 
  FOR DELETE USING (auth.uid() = employer_id);
