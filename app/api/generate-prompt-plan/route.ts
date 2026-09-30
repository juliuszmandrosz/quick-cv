// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import OpenAI from "openai";
import {
  CV_GENERATION_MODEL,
  MAX_COMPLETION_TOKENS,
  logModelUsage,
  slimForPrompt,
} from "@/lib/ai-model";

export async function POST(request: Request) {
  // Calls OpenAI without requiring a session: throttle per IP so an
  // unauthenticated loop cannot run up the bill.
  const rateLimit = checkRateLimit(request, "generate-prompt-plan", RATE_LIMITS.generate);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const errorMessage =
    "Error generating CV, please try again. If the problem persists, contact support.";

  try {
    const { cvUserDataId, jobOfferId } = await request.json();

    if (!cvUserDataId) {
      return NextResponse.json({
        success: false,
        error: "CvDataId is required",
      });
    }

    if (!jobOfferId) {
      return NextResponse.json({
        success: false,
        error: "jobOfferId is required",
      });
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
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }
    if (!fullCvData) {
      console.error("CV user data not found for ID:", cvUserDataId);
      return NextResponse.json({
        success: false,
        error: "CV user data not found",
        status: 404,
      });
    }

    const { data: jobOffer, error: jobOfferError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", jobOfferId)
      .single();

    if (jobOfferError) {
      console.error("Job offer select error:", jobOfferError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    if (!jobOffer) {
      return NextResponse.json({
        success: false,
        error: "Job offer not found",
        status: 404,
      });
    }

    const planSystemPrompt = `
      You are a strategic CV and Talent Acquisition AI specialist.
      Your primary mission is to analyze the provided candidate's comprehensive data against a specific job offer and generate a detailed JSON 'PROMPT PLAN'. 
      This plan will serve as the blueprint for rewriting the candidate's CV to maximize its alignment and impact for the target role, significantly increasing the chances of 
      passing Applicant Tracking Systems (ATS) and capturing the recruiter's attention.
      Carefully evaluate both the candidate's profile (experience, skills, achievements) and the job description (requirements, responsibilities, desired qualifications, company context).
      You must return ONLY a valid JSON object adhering strictly to the following structure. No other text, commentary, explanations, or markdown formatting should precede or follow the JSON output.
    `;

    const planUserPrompt = `
      Generate a PROMPT PLAN in the following JSON format:
      {
        "technical_skills": [], 
        "soft_skills": [], 
        "power_skills": [], 
        "ats_keywords": [], 
        "tone": "", 
        "summary_focus": "", 
        "experience_rewrite_instructions": [
          {
            "company_name": "BELLTECH S.A. (CHILE)",
            "instruction": "Skoncentruj się na sprzedaży rozwiązań samoobsługowych i zarządzaniu kontraktami"
          },
          {
            "company_name": "LATAM AIRLINES (CHILE)",
            "instruction": "Podkreśl kompetencje projektowe i znajomość środowiska lotniczego"
          }     
        ]
      }
      
      INPUT DATA:
      
      CANDIDATE DATA:
      ${JSON.stringify(slimForPrompt(fullCvData))}
      
      JOB OFFER:
      ${JSON.stringify(slimForPrompt(jobOffer))}
      
      RULES AND GUIDELINES FOR GENERATING THE JSON PLAN:
      
      **technical_skills:**
      - Identify and list precisely 5 to 6 of the candidate's technical skills that are most critical and directly relevant to the core requirements and responsibilities listed in the job offer.
      - Prioritize skills explicitly mentioned in the "Requirements" or "Must-Have" sections of the job description.
      - Ensure these skills are genuinely possessed by the candidate according to their provided data.
      - Output: Array of strings.
      
      **soft_skills:**
      - Select 3 to 4 of the candidate's soft skills that are most critical and directly relevant to the core requirements and responsibilities listed in the job offer.
      - Examples: Clear Communication, Active Listening, Empathy, Collaboration, Teamwork, Interpersonal Networking, Foundational Negotiation, Everyday Problem-Solving, Creativity, Adaptability, Flexibility, Resilience, Stress Management, Growth Mindset, Curiosity, Time Management, Organizational Skills, Work Ethic, Dependability, Integrity, Inclusive Behavior, Attention to Detail, Self-Awareness, Customer Focus, Openness to Feedback, Presentation Delivery, Public Engagement
      - Output: Array of strings.
      
      **power_skills:**
      - Select 3 to 4 of the candidate's power skills that are most critical and directly relevant to the core requirements and responsibilities listed in the job offer.
      - Examples: Strategic Communication, Emotional Intelligence, Critical & Analytical Thinking, Complex Problem-Solving, Strategic Vision & Execution, Visionary Leadership, Talent Development, Influence & Persuasion, Advanced Negotiation, Dealmaking, Conflict Transformation, Change Catalysis, Strategic Prioritization & Execution, Learning Agility & Innovation Mindset, Cross-Cultural Competence, Inclusive & Empowering Leadership, Strategic Alliance Building, Driving Innovation, Data-Informed Decision-Making
      - Output: Array of strings.
      
      **ats_keywords:**
      - Extract the most impactful keywords and specific terminology directly from the job offer text. Focus on nouns, technical terms, methodologies, and qualifications frequently mentioned or emphasized.
      - These keywords are crucial for ATS compatibility. Include variations if appropriate.
      - Output: Array of strings.
      
      **tone:**
      - Analyze the language, context, and potential company culture implied by the job offer.
      - Choose exactly one of the following: ["professional", "technical", "salesy"].
      
      **summary_focus:**
      - Based on the job offer’s core requirements and the candidate’s strongest matching qualifications, formulate a concise, single-sentence directive outlining the central theme or key selling point for the candidate's professional summary.
      
      **experience_rewrite_instructions:**
      - Iterate through every work experience entry from the candidate's data, maintaining chronological order.
      - For each experience, provide specific, actionable instructions for rewriting responsibilities/achievements.
      - Do NOT alter company names, titles, or dates.
      - Focus on:
        - Alignment with job offer
        - Transferable skills
        - Quantifiable results
        - Impactful action verbs
        - Incorporation of ATS keywords
        - Use of the selected tone
      
      CRITICAL OUTPUT REQUIREMENT:
      Your entire response must be only the valid JSON object defined above. No introductory phrases, no concluding remarks, no explanations, no markdown code fences, just the raw JSON.
    `;

    logModelUsage("generate-prompt-plan");

    const planCompletion = await openai.chat.completions.create({
      model: CV_GENERATION_MODEL,
      messages: [
        { role: "system", content: planSystemPrompt },
        { role: "user", content: planUserPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    });

    logModelUsage("generate-prompt-plan", planCompletion);

    const promptPlan = JSON.parse(
      planCompletion.choices[0].message?.content || "{}",
    );

    console.log(promptPlan);

    const instructionsArray = Array.isArray(
      promptPlan.experience_rewrite_instructions,
    )
      ? promptPlan.experience_rewrite_instructions
      : [];

    const { data: promptPlanId, error: insertError } = await supabase.rpc(
      "insert_prompt_plan_with_instructions",
      {
        technical_skills: promptPlan.technical_skills,
        soft_skills: promptPlan.soft_skills,
        power_skills: promptPlan.power_skills,
        ats_keywords: promptPlan.ats_keywords,
        tone: promptPlan.tone,
        summary_focus: promptPlan.summary_focus,
        instructions: instructionsArray,
        cv_user_data_id: cvUserDataId,
      },
    );

    if (insertError) {
      console.error("Insert prompt plan error:", insertError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      promptPlanId,
    });
  } catch (err: any) {
    console.error("Generate prompt plan error:", err);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      status: 500,
    });
  }
}
