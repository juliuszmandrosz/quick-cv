import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe treats any 2xx as "delivered" and stops retrying, so every failure
 * that should be retried has to answer with a real 4xx/5xx status. A 500 here
 * means Stripe redelivers the event, which is what makes a transient database
 * error recoverable instead of a payment with no tokens.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error(
      "[stripe-webhook] signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Delayed payment methods complete the session before the money arrives.
  if (session.payment_status !== "paid") {
    console.warn(
      `[stripe-webhook] session ${session.id} completed unpaid, skipping`,
    );
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;
  const tokens = Number.parseInt(session.metadata?.tokens ?? "", 10);

  if (!userId || !plan || !Number.isInteger(tokens) || tokens <= 0) {
    // Retrying cannot fix bad metadata, so acknowledge and log loudly.
    console.error(
      `[stripe-webhook] session ${session.id} has invalid metadata, no tokens granted`,
    );
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  // Stripe delivers at least once. A redelivered event must not grant the
  // same purchase twice.
  const { data: existing, error: lookupError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_checkout_id", session.id)
    .maybeSingle();

  if (lookupError) {
    console.error("[stripe-webhook] lookup error:", lookupError.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { error: insertError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan,
    tokens_left: tokens,
    total_tokens: tokens,
    stripe_checkout_id: session.id,
  });

  if (insertError) {
    // 23505: a parallel delivery inserted it first (unique index on
    // stripe_checkout_id, see supabase/migrations).
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe-webhook] insert error:", insertError.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.info(
    `[stripe-webhook] granted ${tokens} tokens for session ${session.id}`,
  );
  return NextResponse.json({ received: true });
}
