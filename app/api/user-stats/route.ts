import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  // Auth stays on the cookie-backed client; data access bypasses RLS, so every
  // query below must filter by the authenticated user itself.
  const db = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const { data: sub, error: subError } = await db
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .gt("tokens_left", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subError) {
    return NextResponse.json(
      {
        success: false,
        error: "Error occurred while fetching subscription data",
      },
      { status: 500 },
    );
  }

  const { count, error: cvsError } = await db
    .from("generated_cv")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (cvsError) {
    return NextResponse.json(
      {
        success: false,
        error: "Error occurred while fetching CV data",
      },
      { status: 500 },
    );
  }

  const data = {
    tokens_left: sub?.tokens_left || 0,
    total_tokens: sub?.total_tokens || 0,
    plan: sub?.plan || "",
    total_cvs: count || 0,
  };

  return NextResponse.json({ success: true, data });
}
