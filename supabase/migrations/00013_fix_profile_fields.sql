-- Restrict which fields users can update on their own profile
-- Only allow: full_name, phone, phone_verified, default_address_id, locale, marketing_consent
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND points_balance = (SELECT points_balance FROM public.profiles WHERE id = auth.uid())
    AND total_spent = (SELECT total_spent FROM public.profiles WHERE id = auth.uid())
    AND tier = (SELECT tier FROM public.profiles WHERE id = auth.uid())
  );
