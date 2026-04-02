-- ======================================
-- LIKELIHOOD FULL DATABASE MIGRATION
-- Copy this entire file into Supabase SQL Editor
-- ======================================


-- === 00001_create_profiles.sql ===
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  default_address_id UUID,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  tier TEXT NOT NULL DEFAULT 'STANDARD' CHECK (tier IN ('STANDARD','SILVER','GOLD','VIP')),
  total_spent BIGINT NOT NULL DEFAULT 0,
  points_balance INT NOT NULL DEFAULT 0,
  locale TEXT NOT NULL DEFAULT 'ko',
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Admin check helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());


-- === 00002_create_addresses.sql ===
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON public.addresses(user_id);

ALTER TABLE public.profiles ADD CONSTRAINT fk_default_address
  FOREIGN KEY (default_address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT
  USING (public.is_admin());


-- === 00003_create_categories.sql ===
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- === 00004_create_products.sql ===
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  sku_prefix TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,
  material_ko TEXT,
  material_en TEXT,
  care_instructions_ko TEXT,
  care_instructions_en TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  base_price BIGINT NOT NULL,
  compare_at_price BIGINT,
  currency TEXT NOT NULL DEFAULT 'KRW',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  gender TEXT CHECK (gender IN ('M','F','U')),
  season TEXT,
  weight_grams INT,
  meta_title_ko TEXT,
  meta_title_en TEXT,
  meta_description_ko TEXT,
  meta_description_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_new ON public.products(is_new) WHERE is_new = TRUE;

-- Full-text search
ALTER TABLE public.products ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name_ko, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(name_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description_ko, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description_en, '')), 'B')
  ) STORED;

CREATE INDEX idx_products_search ON public.products USING GIN(search_vector);
CREATE INDEX idx_products_name_ko_trgm ON public.products USING GIN(name_ko gin_trgm_ops);
CREATE INDEX idx_products_name_en_trgm ON public.products USING GIN(name_en gin_trgm_ops);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Product Images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text_ko TEXT,
  alt_text_en TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Product Variants
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT NOT NULL,
  color_name_ko TEXT NOT NULL,
  color_name_en TEXT NOT NULL,
  color_hex TEXT,
  price_override BIGINT,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  barcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_variants_stock ON public.product_variants(stock_quantity) WHERE stock_quantity > 0;

CREATE TRIGGER variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- === 00005_create_orders.sql ===
-- Coupons first (orders reference them)
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PERCENTAGE','FIXED_AMOUNT','FREE_SHIPPING')),
  value BIGINT NOT NULL,
  min_order_amount BIGINT DEFAULT 0,
  max_discount_amount BIGINT,
  applicable_category_id UUID REFERENCES public.categories(id),
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE AND starts_at <= NOW() AND expires_at > NOW());

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  guest_email TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN (
      'PENDING_PAYMENT','PAID','PREPARING','SHIPPED',
      'DELIVERED','CANCELLED','REFUND_REQUESTED','REFUNDED'
    )),
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_memo TEXT,
  shipping_carrier TEXT,
  tracking_number TEXT,
  subtotal BIGINT NOT NULL,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  discount_amount BIGINT NOT NULL DEFAULT 0,
  points_used INT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  payment_method TEXT,
  payment_key TEXT,
  paid_at TIMESTAMPTZ,
  coupon_id UUID REFERENCES public.coupons(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  product_name_ko TEXT NOT NULL,
  product_name_en TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price BIGINT NOT NULL,
  subtotal BIGINT NOT NULL,
  product_image_url TEXT
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  ));

CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Coupon Usages
CREATE TABLE public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usages"
  ON public.coupon_usages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage coupon usages"
  ON public.coupon_usages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- === 00006_create_reviews_wishlists.sql ===
-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  order_item_id UUID REFERENCES public.order_items(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  size_feedback TEXT CHECK (size_feedback IN ('SMALL','TRUE_TO_SIZE','LARGE')),
  purchased_size TEXT,
  height_cm INT,
  weight_kg INT,
  image_urls TEXT[],
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews"
  ON public.reviews FOR SELECT
  USING (is_visible = TRUE);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON public.wishlists(user_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlists"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- === 00007_create_points_inventory.sql ===
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


-- === 00008_seed_data.sql ===
-- Seed categories
INSERT INTO public.categories (slug, name_ko, name_en, sort_order) VALUES
  ('outer', '아우터', 'Outer', 1),
  ('tops', '상의', 'Tops', 2),
  ('bottoms', '하의', 'Bottoms', 3),
  ('dresses', '원피스', 'Dresses', 4),
  ('accessories', '액세서리', 'Accessories', 5),
  ('bags', '가방', 'Bags', 6);

-- Seed sub-categories
INSERT INTO public.categories (slug, name_ko, name_en, parent_id, sort_order)
SELECT 'coats', '코트', 'Coats', id, 1 FROM public.categories WHERE slug = 'outer'
UNION ALL
SELECT 'jackets', '재킷', 'Jackets', id, 2 FROM public.categories WHERE slug = 'outer'
UNION ALL
SELECT 't-shirts', '티셔츠', 'T-Shirts', id, 1 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'shirts', '셔츠', 'Shirts', id, 2 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'knit', '니트', 'Knit', id, 3 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'pants', '팬츠', 'Pants', id, 1 FROM public.categories WHERE slug = 'bottoms'
UNION ALL
SELECT 'skirts', '스커트', 'Skirts', id, 2 FROM public.categories WHERE slug = 'bottoms'
UNION ALL
SELECT 'denim', '데님', 'Denim', id, 3 FROM public.categories WHERE slug = 'bottoms';


-- === 00009_create_custom_orders.sql ===
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


-- === 00010_fix_security.sql ===
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


-- === 00011_additional_fixes.sql ===
-- Atomic coupon usage increment
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PENDING_PAYMENT order cleanup (TTL)
-- Orders pending for more than 30 minutes get cancelled and stock restored
CREATE OR REPLACE FUNCTION public.cleanup_pending_orders()
RETURNS INTEGER AS $$
DECLARE
  cancelled_count INTEGER := 0;
  pending_order RECORD;
  order_item RECORD;
BEGIN
  FOR pending_order IN
    SELECT id FROM public.orders
    WHERE status = 'PENDING_PAYMENT'
    AND created_at < NOW() - INTERVAL '30 minutes'
  LOOP
    -- Restore stock for each item
    FOR order_item IN
      SELECT variant_id, quantity FROM public.order_items
      WHERE order_id = pending_order.id
    LOOP
      PERFORM public.restore_stock(order_item.variant_id, order_item.quantity);
    END LOOP;

    -- Cancel the order
    UPDATE public.orders SET status = 'CANCELLED', updated_at = NOW()
    WHERE id = pending_order.id AND status = 'PENDING_PAYMENT';

    cancelled_count := cancelled_count + 1;
  END LOOP;

  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for inactive product variants in orders
CREATE OR REPLACE FUNCTION public.validate_variant_active(p_variant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = p_variant_id
    AND pv.is_active = TRUE
    AND p.is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

