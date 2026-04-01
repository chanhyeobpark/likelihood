-- =============================================================================
-- Security Migration: Fix role escalation, atomic stock, and stock restore
-- =============================================================================

-- 1. Prevent users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND auth.uid() = NEW.id THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_self_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- Also restrict what fields users can update via RLS
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 2. Atomic stock decrement function (prevents overselling via race condition)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id UUID, p_quantity INT)
RETURNS VOID AS $$
DECLARE
  current_stock INT;
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_variant_id AND stock_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic stock restore function (for cancellations / payment failures)
CREATE OR REPLACE FUNCTION public.restore_stock(p_variant_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = stock_quantity + p_quantity,
      updated_at = NOW()
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
