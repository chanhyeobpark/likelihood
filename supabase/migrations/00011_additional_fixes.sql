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
