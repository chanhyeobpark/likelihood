import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    const admin = createAdminClient();

    // Find order by order_number
    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("order_number", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
    }

    // Check order status before confirming payment
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: "이미 처리된 주문입니다" }, { status: 400 });
    }

    if (order.total !== amount) {
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다" }, { status: 400 });
    }

    // Confirm with Toss
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      // Restore stock for all items in the order
      const { data: orderItems } = await admin
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", order.id);

      if (orderItems) {
        for (const item of orderItems) {
          await admin.rpc("restore_stock", {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          });
        }
      }
      await admin.from("orders").update({ status: "CANCELLED" }).eq("id", order.id);
      return NextResponse.json({ error: tossData.message || "결제 확인 실패" }, { status: 400 });
    }

    // Update order status
    await admin
      .from("orders")
      .update({
        status: "PAID",
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toss confirm error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
