import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient();

    const { user_id, plan, tokens } = session.metadata;

    (await supabase).from("subscriptions").insert({
      user_id,
      plan,
      tokens_left: tokens,
      total_tokens: tokens,
      stripe_checkout_id: session.id,
    });
  }

  return NextResponse.json({ received: true });
}
