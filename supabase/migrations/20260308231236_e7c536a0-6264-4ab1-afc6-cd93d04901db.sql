
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ref_code TEXT;
  upline UUID;
BEGIN
  ref_code := public.generate_referral_code();

  -- Find upline from referral code
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL AND NEW.raw_user_meta_data->>'referral_code' != '' THEN
    SELECT user_id INTO upline FROM public.profiles WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;

  INSERT INTO public.profiles (user_id, username, email, phone, referral_code, upline_user_id, account_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    ref_code,
    upline,
    3000
  );

  INSERT INTO public.transactions (user_id, type, amount, status, description)
  VALUES (NEW.id, 'gift', 3000, 'completed', 'Welcome bonus');

  RETURN NEW;
END;
$$;
