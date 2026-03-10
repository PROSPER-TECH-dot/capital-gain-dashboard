
-- Drop ALL existing restrictive policies and recreate as PERMISSIVE

-- PROFILES table
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Anyone authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SETTINGS table
DROP POLICY IF EXISTS "Anyone authenticated can read settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

CREATE POLICY "Anyone authenticated can read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GIFT_CODES table
DROP POLICY IF EXISTS "Authenticated can read gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can insert gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can update gift codes" ON public.gift_codes;

CREATE POLICY "Authenticated can read gift codes" ON public.gift_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert gift codes" ON public.gift_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gift codes" ON public.gift_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TRANSACTIONS table
DROP POLICY IF EXISTS "Read own or admin all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert any transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;

CREATE POLICY "Read own or admin all transactions" ON public.transactions FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert any transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- INVESTMENTS table
DROP POLICY IF EXISTS "Read own or admin all investments" ON public.investments;
DROP POLICY IF EXISTS "Users can create own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can update investments" ON public.investments;

CREATE POLICY "Read own or admin all investments" ON public.investments FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update investments" ON public.investments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CHECK_INS table
DROP POLICY IF EXISTS "Users can create own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can read own check-ins" ON public.check_ins;

CREATE POLICY "Users can create own check-ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own check-ins" ON public.check_ins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- GIFT_CODE_REDEMPTIONS table
DROP POLICY IF EXISTS "Users can create own redemptions" ON public.gift_code_redemptions;
DROP POLICY IF EXISTS "Users can read own redemptions" ON public.gift_code_redemptions;

CREATE POLICY "Users can create own redemptions" ON public.gift_code_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own redemptions" ON public.gift_code_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- USER_ROLES table
DROP POLICY IF EXISTS "Read own or admin all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Read own or admin all roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable pg_cron and pg_net for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
