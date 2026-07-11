-- Migration to deprecate and clean up contract offers from database constraints & policies

-- 1. Safely update any legacy pending or declined offers to 'terminated' 
-- so they do not violate the updated check constraint.
UPDATE public.contracts 
SET status = 'terminated', updated_at = now()
WHERE status IN ('offered', 'declined');

-- 2. Drop the custom update policy that allowed workers to accept/decline offers.
DROP POLICY IF EXISTS "Workers can respond to offered contracts" ON public.contracts;

-- 3. Revert check constraint to exclude 'offered' and 'declined' statuses.
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('active', 'paused', 'terminated'));
