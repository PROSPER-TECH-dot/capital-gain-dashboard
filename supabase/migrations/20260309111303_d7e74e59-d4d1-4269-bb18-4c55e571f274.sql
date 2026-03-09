
-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE

-- ========== PROFILES ==========
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Anyone authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== TRANSACTIONS ==========
DROP POLICY IF EXISTS "Read own or admin all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can insert any transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;

CREATE POLICY "Read own or admin all transactions" ON public.transactions FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert any transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== INVESTMENTS ==========
DROP POLICY IF EXISTS "Read own or admin all investments" ON public.investments;
DROP POLICY IF EXISTS "Users can create own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can update investments" ON public.investments;

CREATE POLICY "Read own or admin all investments" ON public.investments FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update investments" ON public.investments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== SETTINGS ==========
DROP POLICY IF EXISTS "Anyone authenticated can read settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

CREATE POLICY "Anyone authenticated can read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== GIFT CODES ==========
DROP POLICY IF EXISTS "Authenticated can read gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can insert gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can update gift codes" ON public.gift_codes;

CREATE POLICY "Authenticated can read gift codes" ON public.gift_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert gift codes" ON public.gift_codes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update gift codes" ON public.gift_codes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== CHECK-INS ==========
DROP POLICY IF EXISTS "Users can create own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can read own check-ins" ON public.check_ins;

CREATE POLICY "Users can create own check-ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own check-ins" ON public.check_ins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ========== GIFT CODE REDEMPTIONS ==========
DROP POLICY IF EXISTS "Users can create own redemptions" ON public.gift_code_redemptions;
DROP POLICY IF EXISTS "Users can read own redemptions" ON public.gift_code_redemptions;

CREATE POLICY "Users can create own redemptions" ON public.gift_code_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own redemptions" ON public.gift_code_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ========== USER ROLES ==========
DROP POLICY IF EXISTS "Read own or admin all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Read own or admin all roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
