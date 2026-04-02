CREATE OR REPLACE FUNCTION public.decrement_coupon_usage(p_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = GREATEST(0, usage_count - 1)
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
