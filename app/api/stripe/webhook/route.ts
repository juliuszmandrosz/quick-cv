import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient();

    // const { user_id, plan, tokens } = session.metadata;
    const metadata = session.metadata as any;

    (await supabase).from("subscriptions").insert({
      user_id: metadata.user_id,
      plan: metadata.plan,
      tokens_left: metadata.tokens,
      total_tokens: metadata.tokens,
      stripe_checkout_id: session.id,
    });
  }

  return NextResponse.json({ received: true });
}
