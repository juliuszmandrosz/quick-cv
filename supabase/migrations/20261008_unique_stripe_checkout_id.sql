-- One subscription row per Stripe Checkout session.
--
-- Stripe delivers webhooks at least once, so the same checkout.session.completed
-- event can arrive twice, sometimes in parallel. The webhook checks for an
-- existing row first; this index closes the race between two deliveries that
-- both pass that check at the same moment.
--
-- If this fails with a duplicate key error, duplicates already exist. Find them
-- with the query below and remove the extra rows before re-running:
--
--   select stripe_checkout_id, count(*)
--   from public.subscriptions
--   where stripe_checkout_id is not null
--   group by 1 having count(*) > 1;

create unique index if not exists subscriptions_stripe_checkout_id_key
  on public.subscriptions (stripe_checkout_id)
  where stripe_checkout_id is not null;
