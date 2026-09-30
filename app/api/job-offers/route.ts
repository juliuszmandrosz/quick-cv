import { NextResponse } from "next/server";
import scrapeJobOffer from "@/utils/scraper";
import { createAdminClient } from "@/utils/supabase/admin";
import { Tables } from "@/database.types";

export async function POST(request: Request) {
  try {
    const { jobUrl } = await request.json();

    if (!jobUrl || typeof jobUrl !== "string") {
      return NextResponse.json({
        success: false,
        error: "Brak poprawnego URL.",
      });
    }

    const parsedData = await scrapeJobOffer(jobUrl);

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("job_offers")
      .insert<Tables<"job_offers">>({
        ...parsedData,
        job_url: jobUrl,
      })
      .select("id");

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Błąd podczas przetwarzania linku:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { jobOfferId, cvUserDataId } = body;

  if (!cvUserDataId) {
    return NextResponse.json({
      success: false,
      error: "CvDataId is required",
    });
  }

  if (!jobOfferId) {
    return NextResponse.json({
      success: false,
      error: "JobOfferId is required",
    });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("job_offers")
    .update({ cv_user_data_id: cvUserDataId })
    .eq("id", jobOfferId);

  if (error) {
    return NextResponse.json({
      success: false,
      message: "Error updating job offer",
    });
  }

  return NextResponse.json({ success: true });
}
