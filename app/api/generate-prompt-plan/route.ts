import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { describeError } from "@/lib/errors";
import { createAdminClient } from "@/utils/supabase/admin";
import OpenAI from "openai";
import { parsePromptPlan } from "@/lib/cv-schemas";
import {
  PROMPT_PLAN_SYSTEM_PROMPT,
  promptPlanUserPrompt,
} from "@/lib/prompts/prompt-plan";
import {
  CV_GENERATION_MODEL,
  MAX_COMPLETION_TOKENS,
  logModelUsage,
} from "@/lib/ai-model";

export async function POST(request: Request) {
  // Calls OpenAI without requiring a session: throttle per IP so an
  // unauthenticated loop cannot run up the bill.
  const rateLimit = checkRateLimit(
    request,
    "generate-prompt-plan",
    RATE_LIMITS.generate,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const errorMessage =
    "Error generating CV, please try again. If the problem persists, contact support.";

  try {
    const { cvUserDataId, jobOfferId } = await request.json();

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
          error: "jobOfferId is required",
        },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { data: fullCvData, error: selectUserDataError } = await supabase
      .from("cv_user_data")
      .select(
        `
        *,
        education(*),
        experience(*),
        languages(*)
      `,
      )
      .eq("id", cvUserDataId)
      .single();

    if (selectUserDataError) {
      console.error("Select user data error:", selectUserDataError.message);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }
    if (!fullCvData) {
      console.error("CV user data not found for ID:", cvUserDataId);
      return NextResponse.json(
        {
          success: false,
          error: "CV user data not found",
        },
        { status: 404 },
      );
    }

    const { data: jobOffer, error: jobOfferError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", jobOfferId)
      .single();

    if (jobOfferError) {
      console.error("Job offer select error:", jobOfferError.message);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    if (!jobOffer) {
      return NextResponse.json(
        {
          success: false,
          error: "Job offer not found",
        },
        { status: 404 },
      );
    }

    logModelUsage("generate-prompt-plan");

    const planCompletion = await openai.chat.completions.create({
      model: CV_GENERATION_MODEL,
      messages: [
        { role: "system", content: PROMPT_PLAN_SYSTEM_PROMPT },
        { role: "user", content: promptPlanUserPrompt(fullCvData, jobOffer) },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    });

    logModelUsage("generate-prompt-plan", planCompletion);

    const promptPlan = parsePromptPlan(
      planCompletion.choices[0].message?.content ?? "",
    );
    if (!promptPlan) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 502 },
      );
    }

    const { data: promptPlanId, error: insertError } = await supabase.rpc(
      "insert_prompt_plan_with_instructions",
      {
        technical_skills: promptPlan.technical_skills,
        soft_skills: promptPlan.soft_skills,
        power_skills: promptPlan.power_skills,
        ats_keywords: promptPlan.ats_keywords,
        tone: promptPlan.tone,
        summary_focus: promptPlan.summary_focus,
        instructions: promptPlan.experience_rewrite_instructions,
        cv_user_data_id: cvUserDataId,
      },
    );

    if (insertError) {
      console.error("Insert prompt plan error:", insertError.message);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      promptPlanId,
    });
  } catch (err) {
    console.error("Generate prompt plan error:", describeError(err));
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
