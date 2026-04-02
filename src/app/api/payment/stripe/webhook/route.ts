import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    // Idempotency: only process PENDING_PAYMENT orders
    const { data: order } = await admin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (!order || order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ received: true }); // Already processed
    }

    await admin
      .from("orders")
      .update({ status: "PAID", paid_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "PENDING_PAYMENT"); // Double-check with WHERE clause
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    const { data: order } = await admin
      .from("orders")
      .select("status, coupon_id")
      .eq("id", orderId)
      .single();

    if (!order || order.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ received: true });
    }

    // Restore stock using atomic function
    const { data: orderItems } = await admin
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", orderId);

    if (orderItems) {
      for (const item of orderItems) {
        await admin.rpc("restore_stock", {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      }
    }

    // Restore coupon usage
    if (order.coupon_id) {
      await admin.from("coupon_usages").delete().eq("order_id", orderId);
      await admin.rpc("decrement_coupon_usage", { p_coupon_id: order.coupon_id });
    }

    await admin
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId)
      .eq("status", "PENDING_PAYMENT");
  }

  return NextResponse.json({ received: true });
}
