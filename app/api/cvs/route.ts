import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createClient();
  // Auth stays on the cookie-backed client; data access bypasses RLS, so every
  // query below must filter by the authenticated user itself.
  const db = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data, error } = await db
    .from("cv_user_data")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({
      success: false,
      error: "Error occurred while fetching CV data",
      status: 500,
    });
  }
  if (!data) {
    return NextResponse.json({
      success: false,
      error: "CVs not found",
      status: 404,
    });
  }

  return NextResponse.json({ success: true, data, status: 200 });
}
