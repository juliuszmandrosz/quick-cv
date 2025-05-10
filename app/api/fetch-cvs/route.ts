import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GeneratedCvFull } from "@/types/generated-cv-full";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generated_cv")
    .select(
      `
      *,
      generated_education(*),
      generated_experience(*),
      generated_language(*),
      generated_personal_data(*)
    `,
    )
    .eq("id", cvId)
    .single<GeneratedCvFull>();

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
      error: "CV data not found",
      status: 404,
    });
  }

  data.generated_personal_data = Array.isArray(data.generated_personal_data)
    ? (data.generated_personal_data[0] ?? null)
    : null;

  return NextResponse.json({ success: true, data, status: 200 });
}
