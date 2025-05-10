import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GeneratedCvFull } from "@/types/generated-cv-full";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cvId = searchParams.get("cvId");

  if (!cvId) {
    return NextResponse.json({
      success: false,
      error: "cvId is missing",
      status: 400,
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generated_cv")
    .select(
      `
      *,
      generated_education(*),
      generated_experience(*),
      generated_language(*),
      generated_personal_data(*),
      generated_skills(*)
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

  const { data: jobOffer, error: jobError } = await supabase
    .from("job_offers")
    .select("job_url")
    .eq("id", data.job_offer_id)
    .single();

  if (jobError) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch job offer",
      status: 500,
    });
  }

  data.generated_personal_data = Array.isArray(data.generated_personal_data)
    ? (data.generated_personal_data[0] ?? null)
    : null;

  data.generated_skills = Array.isArray(data.generated_skills)
    ? (data.generated_skills[0] ?? null)
    : null;

  data.job_url = jobOffer.job_url;

  return NextResponse.json({ success: true, data, status: 200 });
}
