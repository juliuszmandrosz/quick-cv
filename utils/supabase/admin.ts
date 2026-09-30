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
 * Falls back to the anon key when SUPABASE_SERVICE_ROLE_KEY is absent, so that
 * deploying this file cannot break the app before the key is configured. Once
 * RLS is enabled that fallback stops working - which is the point at which the
 * key must be set.
 */
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set - falling back to the " +
        "anon key. This only works while RLS is disabled.",
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
};
