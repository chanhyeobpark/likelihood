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

      if (coupon && subtotal >= (coupon.min_order_amount || 0)) {
        if (coupon.type === "PERCENTAGE") {
          discountAmount = Math.floor(subtotal * coupon.value / 100);
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else if (coupon.type === "FIXED_AMOUNT") {
          discountAmount = coupon.value;
        }
        couponId = coupon.id;
      }
    }

    const total = subtotal + shippingFee - discountAmount;

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

    // Decrement stock
    for (const item of items) {
      const { data: currentVariant } = await admin
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variantId)
        .single();

      if (currentVariant) {
        await admin
          .from("product_variants")
          .update({ stock_quantity: currentVariant.stock_quantity - item.quantity })
          .eq("id", item.variantId);
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
