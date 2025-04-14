import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { cvId } = body;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ success: false, message: "Unauthorized" });
  }

  // Pobierz cv_user_data_id z generated_cv
  const { data: cvRow, error: cvError } = await supabase
    .from("generated_cv")
    .select("cv_user_data_id")
    .eq("id", cvId)
    .single();

  if (cvError || !cvRow?.cv_user_data_id) {
    return NextResponse.json({ success: false, message: "CV not found" });
  }

  const cvUserDataId = cvRow.cv_user_data_id;

  const { error: updatePaymentError } = await supabase
    .from("generated_cv")
    .update({ payment_completed: true })
    .eq("id", cvId);

  const { error: updateUserIdError } = await supabase
    .from("cv_user_data")
    .update({ user_id: user.id })
    .eq("id", cvUserDataId);

  const { error: decrementError } = await supabase.rpc("decrement_tokens", {
    user_id: user.id,
  });

  if (updatePaymentError || updateUserIdError || decrementError) {
    return NextResponse.json({ success: false, message: "Error updating" });
  }

  return NextResponse.json({ success: true });
}
