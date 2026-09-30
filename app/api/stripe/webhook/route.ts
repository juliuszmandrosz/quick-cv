import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createAdminClient();

    console.log("🚀 Session completed:", {
      id: session.id,
      metadata: session.metadata,
    });

    const metadata = session.metadata as any;

    const { data, error } = await supabase.from("subscriptions").insert({
      user_id: metadata.user_id,
      plan: metadata.plan,
      tokens_left: metadata.tokens,
      total_tokens: metadata.tokens,
      stripe_checkout_id: session.id,
    });

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        status: 500,
      });
    }

    console.log("✅ Subscription record created:", data);
  }

  return NextResponse.json({ received: true });
}
