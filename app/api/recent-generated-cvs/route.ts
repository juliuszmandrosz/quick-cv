import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data, error } = await supabase
    .from("generated_cv")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

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
