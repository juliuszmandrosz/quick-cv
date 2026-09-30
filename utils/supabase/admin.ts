import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that bypasses Row Level Security.
 *
 * Background: every table in this project is reachable with the public `anon`
 * key, which ships in the browser bundle. The fix is to turn RLS on and grant
 * the browser nothing - all data access happens here, inside API routes, where
 * the service-role key never leaves the server.
 *
 * NEVER import this from a client component, and never return its raw results
 * to a caller without checking that the caller owns the rows.
 *
 * Accepts either key style Supabase offers:
 *   SUPABASE_SECRET_KEY        - current "sb_secret_..." secret key
 *   SUPABASE_SERVICE_ROLE_KEY  - legacy service_role JWT
 * Set one of them; the secret key is the one Supabase now steers you towards.
 *
 * Falls back to the anon key when neither is present, so that deploying this
 * file cannot break the app before the key is configured. Once RLS is enabled
 * that fallback stops working - which is the point at which the key must be set.
 */
export const createAdminClient = () => {
  const privilegedKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!privilegedKey) {
    console.warn(
      "[supabase] neither SUPABASE_SECRET_KEY nor SUPABASE_SERVICE_ROLE_KEY " +
        "is set - falling back to the anon key. This only works while RLS is " +
        "disabled.",
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    privilegedKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
};
