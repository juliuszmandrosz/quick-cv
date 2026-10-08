import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { describeError } from "@/lib/errors";
import {
  ANALYZE_JOB_OFFER_SYSTEM_PROMPT,
  analyzeJobOfferUserPrompt,
} from "@/lib/prompts/analyze-job-offer";
import { createAdminClient } from "@/utils/supabase/admin";
import { Tables } from "@/database.types";
import OpenAI from "openai";

export async function POST(request: Request) {
  // Calls OpenAI without requiring a session: throttle per IP so an
  // unauthenticated loop cannot run up the bill.
  const rateLimit = checkRateLimit(
    request,
    "analyze-job-offer",
    RATE_LIMITS.analyze,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const { jobDesc } = await request.json();

    if (!jobDesc || typeof jobDesc !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Job desc is required",
        },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const planCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: ANALYZE_JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: analyzeJobOfferUserPrompt(jobDesc) },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const jobOffer = JSON.parse(
      planCompletion.choices[0].message?.content || "{}",
    );

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("job_offers")
      .insert<Tables<"job_offers">>({
        ...jobOffer,
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
    console.error("Error analyzing the job description:", describeError(error));
    return NextResponse.json(
      { success: false, error: "Could not analyze the job description" },
      { status: 500 },
    );
  }
}
