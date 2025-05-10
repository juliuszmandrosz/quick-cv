import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectToRaw = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectTo = redirectToRaw
    ? decodeURIComponent(redirectToRaw)
    : "/dashboard";

  const origin = process.env.NEXT_PUBLIC_BASE_URL!;

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
