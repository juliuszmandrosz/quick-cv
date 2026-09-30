import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  // Auth stays on the cookie-backed client; data access bypasses RLS, so every
  // query below must filter by the authenticated user itself.
  const db = createAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: data, error: subError } = await db
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .gt("tokens_left", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subError || !data) {
    return NextResponse.json({ tokens_left: 0 });
  }

  return NextResponse.json({ tokens_left: data.tokens_left || 0 });
}
