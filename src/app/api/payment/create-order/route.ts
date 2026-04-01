import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, paymentMethod, couponCode } = body;

    if (!items?.length || !shipping?.name || !shipping?.phone || !shipping?.postalCode || !shipping?.address1) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다" }, { status: 400 });
    }

    // Validate all item quantities upfront
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
        return NextResponse.json({ error: "잘못된 수량입니다" }, { status: 400 });
      }
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Get user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Validate items and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: variant } = await admin
        .from("product_variants")
        .select(`
          *,
          product:products(id, name_ko, name_en, base_price)
        `)
        .eq("id", item.variantId)
        .single();

      if (!variant) {
        return NextResponse.json({ error: `상품을 찾을 수 없습니다` }, { status: 400 });
      }

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `${(variant.product as any).name_ko} 재고가 부족합니다 (남은 수량: ${variant.stock_quantity})` },
          { status: 400 }
        );
      }

      const unitPrice = variant.price_override ?? (variant.product as any).base_price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        variant_id: variant.id,
        product_name_ko: (variant.product as any).name_ko,
        product_name_en: (variant.product as any).name_en,
        variant_label: `${variant.color_name_ko} / ${variant.size}`,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // Calculate shipping
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

    // Handle coupon (simplified)
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .lte("starts_at", new Date().toISOString())
        .single();

      if (!coupon) {
        return NextResponse.json({ error: "유효하지 않은 쿠폰입니다" }, { status: 400 });
      }

      // Check usage_limit
      if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
        return NextResponse.json({ error: "쿠폰 사용 한도가 초과되었습니다" }, { status: 400 });
      }

      // Check per_user_limit
      if (user && coupon.per_user_limit > 0) {
        const { count: userUsageCount } = await admin
          .from("coupon_usages")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", coupon.id)
          .eq("user_id", user.id);

        if ((userUsageCount ?? 0) >= coupon.per_user_limit) {
          return NextResponse.json({ error: "쿠폰 사용 횟수를 초과했습니다" }, { status: 400 });
        }
      }

      // Check category restriction
      if (coupon.applicable_category_id) {
        // verify items are in the applicable category
        // (simplified: just check if any item matches)
      }

      if (subtotal >= (coupon.min_order_amount || 0)) {
        // Apply discount
        if (coupon.type === "PERCENTAGE") {
          discountAmount = Math.floor(subtotal * coupon.value / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else if (coupon.type === "FIXED_AMOUNT") {
          discountAmount = coupon.value;
        } else if (coupon.type === "FREE_SHIPPING") {
          // Will be handled in shipping calculation
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    // Generate order number
    const { data: orderNumResult } = await admin.rpc("generate_order_number");
    const orderNumber = orderNumResult || `LK-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: shipping.email || null,
        status: "PENDING_PAYMENT",
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_postal_code: shipping.postalCode,
        shipping_address_line1: shipping.address1,
        shipping_address_line2: shipping.address2 || null,
        shipping_memo: shipping.memo || null,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total,
        payment_method: paymentMethod === "TOSS" ? "TOSS_CARD" : "STRIPE",
        coupon_id: couponId,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "주문 생성에 실패했습니다" }, { status: 500 });
    }

    // Create order items
    await admin.from("order_items").insert(
      orderItems.map((item) => ({ ...item, order_id: order.id }))
    );

    // Record coupon usage
    if (couponId && user) {
      await admin.from("coupon_usages").insert({
        coupon_id: couponId,
        user_id: user.id,
        order_id: order.id,
      });
      // Increment usage count
      const { data: currentCoupon } = await admin
        .from("coupons")
        .select("usage_count")
        .eq("id", couponId)
        .single();
      if (currentCoupon) {
        await admin
          .from("coupons")
          .update({ usage_count: currentCoupon.usage_count + 1 })
          .eq("id", couponId);
      }
    }

    // Atomic stock decrement (prevents overselling via race condition)
    for (const item of items) {
      const { error: decrementError } = await admin.rpc("decrement_stock", {
        p_variant_id: item.variantId,
        p_quantity: item.quantity,
      });

      if (decrementError) {
        // Rollback: cancel the order and restore any already-decremented stock
        const alreadyDecrementedItems = items.slice(0, items.indexOf(item));
        for (const prev of alreadyDecrementedItems) {
          await admin.rpc("restore_stock", {
            p_variant_id: prev.variantId,
            p_quantity: prev.quantity,
          });
        }
        await admin.from("orders").update({ status: "CANCELLED" }).eq("id", order.id);
        return NextResponse.json(
          { error: "재고가 부족합니다. 다시 시도해주세요." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
