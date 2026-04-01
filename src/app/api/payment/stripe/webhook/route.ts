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

    await admin
      .from("orders")
      .update({
        status: "PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    // Restore stock
    const { data: orderItems } = await admin
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", orderId);

    if (orderItems) {
      for (const item of orderItems) {
        const { data: variant } = await admin
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await admin
            .from("product_variants")
            .update({ stock_quantity: variant.stock_quantity + item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    await admin.from("orders").update({ status: "CANCELLED" }).eq("id", orderId);
  }

  return NextResponse.json({ received: true });
}
