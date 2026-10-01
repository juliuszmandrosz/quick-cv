import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { GeneratedCvFull } from "@/types/generated-cv-full";
import { verifyPdfRenderToken } from "@/lib/pdf-render-token";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cvId = searchParams.get("cvId");
  const renderToken = searchParams.get("renderToken");

  if (!cvId) {
    return NextResponse.json({
      success: false,
      error: "cvId is missing",
      status: 400,
    });
  }

  const supabase = await createClient();
  // Auth stays on the cookie-backed client; data access bypasses RLS, so every
  // query below must filter by the authenticated user itself.
  const db = createAdminClient();
  const { data, error } = await db
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
    .order("end_date", {
      referencedTable: "generated_experience",
      ascending: false,
    })
    .order("end_date", {
      referencedTable: "generated_education",
      ascending: false,
    })
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

  // A freshly generated CV has no owner yet - the visitor is not signed in at
  // that point, so the flow has to stay open. Once a CV is claimed it carries
  // full personal data, and only its owner may read it back: the cvId travels
  // in the URL and therefore leaks into history, logs and referrers.
  // The one exception is the PDF renderer: it has no session, so generate-pdf
  // checks ownership and passes it a short-lived token for this cvId.
  if (data.user_id && !verifyPdfRenderToken(cvId, renderToken)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== data.user_id) {
      return NextResponse.json({
        success: false,
        error: "Not authorized to view this CV",
        status: 403,
      });
    }
  }

  const { data: jobOffer, error: jobError } = await db
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
