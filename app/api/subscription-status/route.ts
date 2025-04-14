import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: data, error: subError } = await supabase
    .from("subscriptions")
    .select("tokens_left")
    .eq("user_id", user.id)
    .single();

  if (subError) {
    return NextResponse.json({ tokens_left: 0 });
  }

  return NextResponse.json({ tokens_left: data.tokens_left || 0 });
}
