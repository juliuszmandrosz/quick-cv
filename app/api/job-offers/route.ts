import { NextResponse } from "next/server";
import { describeError } from "@/lib/errors";
import scrapeJobOffer, { UnsupportedJobUrlError } from "@/utils/scraper";
import { createAdminClient } from "@/utils/supabase/admin";
import { Tables } from "@/database.types";
import {
  checkRateLimit,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  // No session required: throttle per IP so a loop cannot fill job_offers or
  // use the scraper to hammer the job boards.
  const rateLimit = checkRateLimit(
    request,
    "job-offers",
    RATE_LIMITS.jobOffers,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const { jobUrl } = await request.json();

    if (!jobUrl || typeof jobUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "A valid job offer URL is required",
        },
        { status: 400 },
      );
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
      console.error("Insert job offer error:", error.message);
      return NextResponse.json(
        { success: false, error: "Could not save the job offer" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof UnsupportedJobUrlError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    console.error("Job offer scraping error:", describeError(error));
    return NextResponse.json(
      { success: false, error: "Could not read the job offer from this link" },
      { status: 502 },
    );
  }
}

export async function PATCH(req: Request) {
  const rateLimit = checkRateLimit(
    req,
    "job-offers-link",
    RATE_LIMITS.jobOffers,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const body = await req.json();
  const { jobOfferId, cvUserDataId } = body;

  if (!cvUserDataId) {
    return NextResponse.json(
      {
        success: false,
        error: "CvDataId is required",
      },
      { status: 400 },
    );
  }

  if (!jobOfferId) {
    return NextResponse.json(
      {
        success: false,
        error: "JobOfferId is required",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("job_offers")
    .update({ cv_user_data_id: cvUserDataId })
    .eq("id", jobOfferId);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error updating job offer",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
