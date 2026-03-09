
-- Fix RLS policies: Change from RESTRICTIVE to PERMISSIVE for tables with conflicting policies

-- 1. Fix profiles UPDATE policies
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix investments SELECT policies
DROP POLICY IF EXISTS "Admins can read all investments" ON public.investments;
DROP POLICY IF EXISTS "Users can read own investments" ON public.investments;

CREATE POLICY "Admins can read all investments"
ON public.investments FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own investments"
ON public.investments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix transactions SELECT policies
DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;

CREATE POLICY "Admins can read all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix transactions UPDATE - admin needs to update transaction status
CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix investments UPDATE - admin needs to update investments
CREATE POLICY "Admins can update investments"
ON public.investments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
