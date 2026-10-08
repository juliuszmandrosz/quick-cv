import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { describeError } from "@/lib/errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { parseGeneratedCv } from "@/lib/cv-schemas";
import {
  GENERATE_CV_SYSTEM_PROMPT,
  generateCvUserPrompt,
} from "@/lib/prompts/generate-cv";
import OpenAI from "openai";
import {
  CV_GENERATION_MODEL,
  LOW_REASONING,
  MAX_COMPLETION_TOKENS,
  logModelUsage,
  resolveLanguageName,
} from "@/lib/ai-model";

export async function POST(request: Request) {
  // These endpoints call OpenAI without requiring a session, so they are
  // the ones an unauthenticated loop could run up a bill on.
  const rateLimit = checkRateLimit(
    request,
    "generate-cv",
    RATE_LIMITS.generate,
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const errorMessage =
    "Error generating CV, please try again. If the problem persists, contact support.";

  try {
    const { language, cvUserDataId, jobOfferId, promptPlanId } =
      await request.json();

    const supabase = createAdminClient();

    const { data: fullCvData, error: selectError } = await supabase
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

    if (selectError) {
      console.error("Select user data error:", selectError.message);
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

    const { data: jobOffer, error: jobError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", jobOfferId)
      .single();

    if (jobError) {
      console.error("Job offer select error:", jobError.message);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    if (!jobOffer) {
      console.error("Job offer not found for ID:", jobOfferId);
      return NextResponse.json(
        {
          success: false,
          error: "Job offer not found",
        },
        { status: 404 },
      );
    }

    const { data: promptPlan, error: promptPlanError } = await supabase
      .from("generated_prompt_plan")
      .select(
        `
      *,
      generated_experience_rewrite_instruction(*)
    `,
      )
      .eq("id", promptPlanId)
      .single();

    if (promptPlanError) {
      console.error("Prompt plan select error:", promptPlanError.message);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    if (!promptPlan) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 404 },
      );
    }

    // "pl" -> "Polish": naming the language beats passing a bare code.
    const languageName = resolveLanguageName(language);

    const experienceInstructions: Record<string, string> = {};
    for (const item of promptPlan.generated_experience_rewrite_instruction ||
      []) {
      experienceInstructions[item.company_name] = item.instruction;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    logModelUsage("generate-cv");

    const generationCompletion = await openai.chat.completions.create({
      model: CV_GENERATION_MODEL,
      messages: [
        { role: "system", content: GENERATE_CV_SYSTEM_PROMPT },
        {
          role: "user",
          content: generateCvUserPrompt({
            languageName,
            fullCvData,
            jobOffer,
            promptPlan,
            experienceInstructions,
          }),
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      // The prompt plan already carries the strategy; this call executes it.
      reasoning_effort: LOW_REASONING,
    });

    logModelUsage("generate-cv", generationCompletion);

    const generationResponse = generationCompletion.choices[0].message?.content;
    if (!generationResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "No generated CV content",
        },
        { status: 500 },
      );
    }

    const generatedCV = parseGeneratedCv(generationResponse);
    if (!generatedCV) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 502 },
      );
    }

    const { data: generatedCvId, error: saveError } = await supabase.rpc(
      "save_generated_cv",
      {
        cv_user_data_id: cvUserDataId,
        cv_lang: language.trim(),
        job_offer_id: jobOffer.id,
        candidate_description: generatedCV.candidate_description,
        profile_photo_url: fullCvData.profile_photo_url || null,
        title: generatedCV.title,
        file_name: generatedCV.file_name,
        personal_data: {
          full_name: generatedCV.generated_personal_data.full_name,
          email: generatedCV.generated_personal_data.email,
          phone: generatedCV.generated_personal_data.phone,
          linkedin: generatedCV.generated_personal_data.linkedin,
        },
        skill_list: {
          technical_skills: generatedCV.generated_skills.technical_skills,
          soft_skills: generatedCV.generated_skills.soft_skills,
          power_skills: generatedCV.generated_skills.power_skills,
        },
        education_list: generatedCV.generated_education.map((edu) => ({
          school_name: edu.school_name,
          field_of_study: edu.field_of_study,
          start_date: isValidDate(edu.start_date) ? edu.start_date : null,
          end_date: isValidDate(edu.end_date) ? edu.end_date : null,
        })),
        experience_list: generatedCV.generated_experience.map((exp) => ({
          position: exp.position,
          company_name: exp.company_name,
          start_date: isValidDate(exp.start_date) ? exp.start_date : null,
          end_date: isValidDate(exp.end_date) ? exp.end_date : null,
          responsibilities: exp.responsibilities,
          location: exp.location,
        })),
        language_list: generatedCV.generated_language.map((lang) => ({
          name: lang.name,
          level: lang.level,
        })),
      },
    );

    if (saveError) {
      console.error("Save generated CV error:", saveError.message);
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
      cvId: generatedCvId,
    });
  } catch (err) {
    console.error("Generate cv error:", describeError(err));
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

function isValidDate(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}$/.test(value);
}
