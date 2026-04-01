CREATE TABLE public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pants','jacket','shirt','coat','dress','knit','other')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  budget_min BIGINT,
  budget_max BIGINT,
  desired_date DATE,
  reference_images TEXT[],
  size_info TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','REVIEWING','QUOTED','ACCEPTED','IN_PRODUCTION','COMPLETED','CANCELLED')),
  admin_reply TEXT,
  quoted_price BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custom_orders_user ON public.custom_orders(user_id);
CREATE INDEX idx_custom_orders_status ON public.custom_orders(status);

CREATE TRIGGER custom_orders_updated_at
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom orders"
  ON public.custom_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create custom orders"
  ON public.custom_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending custom orders"
  ON public.custom_orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'PENDING')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all custom orders"
  ON public.custom_orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
