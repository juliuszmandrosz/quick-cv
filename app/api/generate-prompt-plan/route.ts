// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { cvUserDataId } = await request.json();

    if (!cvUserDataId) {
      return NextResponse.json({
        success: false,
        error: "CvDataId is required",
      });
    }

    const supabase = await createClient();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { data: fullCvData, error: selectError } = await supabase
      .from("cv_user_data")
      .select(
        `
        *,
        job_offers(*),
        education(*),
        experience(*),
        languages(*)
      `,
      )
      .eq("id", cvUserDataId)
      .single();

    if (selectError) {
      return NextResponse.json({
        success: false,
        error: selectError.message,
        status: 500,
      });
    }
    if (!fullCvData) {
      return NextResponse.json({
        success: false,
        error: "CV user data not found",
        status: 404,
      });
    }

    const jobOffer = Array.isArray(fullCvData.job_offers)
      ? fullCvData.job_offers[0]
      : fullCvData.job_offers;
    if (!jobOffer) {
      return NextResponse.json({
        success: false,
        error: "Job offer not found",
        status: 404,
      });
    }

    console.log("JOB SKILLS" + jobOffer.requirements);

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
        "highlight_skills": [], 
        "optional_skills": [], 
        "ats_keywords": [], 
        "tone": "", 
        "summary_focus": "", 
        "experience_rewrite_instructions": {
          "CompanyNameFromCandidateData1": "Instruction for rewriting responsibilities for this specific experience.",
          "CompanyNameFromCandidateData2": "Instruction for rewriting responsibilities for this specific experience."
        }
      }
      
      INPUT DATA:
      
      CANDIDATE DATA:
      ${JSON.stringify(fullCvData)}
      
      JOB OFFER:
      ${JSON.stringify(jobOffer)}
      
      RULES AND GUIDELINES FOR GENERATING THE JSON PLAN:
      
      **highlight_skills:**
      - Identify and list precisely 5 to 8 of the candidate's skills that are most critical and directly relevant to the core requirements and responsibilities listed in the job offer.
      - Prioritize skills explicitly mentioned in the "Requirements" or "Must-Have" sections of the job description.
      - Ensure these skills are genuinely possessed by the candidate according to their provided data.
      - Output: Array of strings.
      
      **optional_skills:**
      - Select 3 to 7 additional relevant skills from the candidate's data that, while perhaps not primary requirements, add significant value or align with "Nice-to-Have" qualifications mentioned in the job offer.
      - These could include transferable skills, specific tools, or secondary competencies that differentiate the candidate.
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

    const planCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: planSystemPrompt },
        { role: "user", content: planUserPrompt },
      ],
      temperature: 0.4,
    });

    const promptPlan = JSON.parse(
      planCompletion.choices[0].message?.content || "{}",
    );

    console.log(promptPlan);

    const instructionsArray = Object.entries(
      promptPlan.experience_rewrite_instructions || {},
    ).map(([company_name, instruction]) => ({
      company_name,
      instruction,
    }));

    const { data: promptPlanId, error: insertError } = await supabase.rpc(
      "insert_prompt_plan_with_instructions",
      {
        highlight_skills: promptPlan.highlight_skills,
        optional_skills: promptPlan.optional_skills,
        ats_keywords: promptPlan.ats_keywords,
        tone: promptPlan.tone,
        summary_focus: promptPlan.summary_focus,
        instructions: instructionsArray,
        cv_user_data_id: cvUserDataId,
      },
    );

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: insertError.message,
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      promptPlanId,
    });
  } catch (err: any) {
    console.error("Merged endpoint error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 500,
    });
  }
}
