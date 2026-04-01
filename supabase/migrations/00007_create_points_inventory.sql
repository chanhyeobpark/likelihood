-- Points Transactions
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'PURCHASE_EARN','REVIEW_EARN','SIGNUP_BONUS',
    'PURCHASE_SPEND','ADMIN_ADJUST','EXPIRED'
  )),
  reference_id UUID,
  description_ko TEXT,
  description_en TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_points_user ON public.points_transactions(user_id);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage points"
  ON public.points_transactions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Inventory Logs
CREATE TABLE public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  change_quantity INT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('ORDER','RESTOCK','ADJUSTMENT','RETURN','CANCEL')),
  reference_id UUID,
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_logs_variant ON public.inventory_logs(variant_id);

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory logs"
  ON public.inventory_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tier recalculation function
CREATE OR REPLACE FUNCTION public.recalculate_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET tier = CASE
    WHEN total_spent >= 3000000 THEN 'VIP'
    WHEN total_spent >= 1000000 THEN 'GOLD'
    WHEN total_spent >= 300000  THEN 'SILVER'
    ELSE 'STANDARD'
  END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Order number generator
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
  RETURN 'LK-' || date_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;
