// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import {
  CV_GENERATION_MODEL,
  LOW_REASONING,
  MAX_COMPLETION_TOKENS,
  logModelUsage,
  resolveLanguageName,
  slimForPrompt,
} from "@/lib/ai-model";

export async function POST(request: Request) {
  // These endpoints call OpenAI without requiring a session, so they are
  // the ones an unauthenticated loop could run up a bill on.
  const rateLimit = checkRateLimit(request, "generate-cv", RATE_LIMITS.generate);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const errorMessage =
    "Error generating CV, please try again. If the problem persists, contact support.";

  try {
    const { language, cvUserDataId, jobOfferId, promptPlanId } =
      await request.json();

    const supabase = await createClient();

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

    const { data: jobOffer, error: jobError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", jobOfferId)
      .single();

    if (jobError) {
      console.error("Job offer select error:", jobError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    if (!jobOffer) {
      console.error("Job offer not found for ID:", jobOfferId);
      return NextResponse.json({
        success: false,
        error: "Job offer not found",
        status: 404,
      });
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
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    if (!promptPlan) {
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 404,
      });
    }

    // "pl" -> "Polish": naming the language beats passing a bare code.
    const languageName = resolveLanguageName(language);

    const experienceInstructions: Record<string, string> = {};
    for (const item of promptPlan.generated_experience_rewrite_instruction ||
      []) {
      experienceInstructions[item.company_name] = item.instruction;
    }

    const systemPrompt = `
      ##TARGET_LANGUAGE:
      Wherever this prompt says TARGET_LANGUAGE, it means the language named
      in the TARGET LANGUAGE line of the user message. Everything you write
      must be in that language.

	##CONTEXT:
      You are an expert CV writing assistant and career strategist specializing in optimizing resumes for Applicant Tracking Systems (ATS) and human recruiters. Your expertise lies in strategically aligning candidate experience with specific job requirements.
      
	##GOALS:
      Generate a highly effective, ATS-optimized CV, meticulously tailored to the target job description, while remaining 100% authentic to the candidate's history and experience. The entire narrative must be credible and strategically focused.

    ##TONE:
      The final output must be perceived as entirely human-written. It is key to maintain a professional and natural tone throughout all adapted content.
      
    ##DATE HANDLING:
      All dates already normalized to YYYY-MM.
    
    ##CHRONOLOGICAL ORDER:
      Use the original order work experiences provided by the candidate, maintaining their exact chronological order date descending. Do not add, remove, or reorder any distinct job entries. The last experience chronologically should be placed at the top and go down in the same order.
    
    ##EXPERIENCE & RESPONSIBILITIES:
      Strategically rewrite ONLY the responsibilities/details within each preserved experience to maximize relevance to the job offer, quantifying achievements where possible and highlighting impact using strong action verbs. Base these modifications strictly on the provided candidate data and specific rewriting instructions. 
      Do NOT invent experiences, skills, or exaggerate claims beyond verifiable facts from the original CV. Focus solely on rephrasing and highlighting existing information effectively.
      Translate all job titles ("position") into TARGET_LANGUAGE. Avoid literal translations. Use culturally appropriate role names.
      For example, if TARGET_LANGUAGE is Polish:
      - "Senior .NET Developer" → "Starszy Programista .NET"
      - "Fullstack .NET / Angular Developer" → "Programista .NET / Angular (Fullstack)"
      - "Co-Founder & CTO" → "Współzałożyciel i CTO"
      Make sure the position titles feel natural and realistic in TARGET_LANGUAGE, especially for technical and senior-level roles. Do not mix languages in a single title.
      Avoid vague or informal phrases such as "on the frontend" or "on the backend" without context. Always provide specific technical details and results. Replace generic expressions with professional and precise language such as "in the frontend layer", "within backend services", or "in server-side logic", depending on the context. Clarify what was built, optimized, or improved, and what the outcome was.
      **Write all bullet points using the first person singular in TARGET_LANGUAGE**, maintaining a natural and professional tone (e.g., "Zaprojektowałem", "Wdrożyłem", "Koordynowałem"). Avoid passive voice or third-person formulations.
      Rewrite responsibilities into concise, high-impact one-liners.  
      - Use strong action verbs (e.g., Built, Integrated, Optimized, Delivered).  
      - Include technology + business outcome in each line.  
      - Limit to exactly 3 bullets per role.  
      - Each bullet must be no longer than 20 words.  
      - Remove filler, narrative phrases, and redundancies.  
      Focus on impact, technologies, and measurable results only.
      **Ideal bullet point examples in English** (for tone, structure, and clarity):
      - Collaborated with Product and Data Science teams to implement A/B tests, resulting in a 10% increase in company revenue.
      - Led the migration of legacy APIs to a microservices architecture, reducing system downtime by 30%.
      - Developed a real-time dashboard used by 3 departments, improving decision-making speed by 25%.
    
    ##ACCOMPLISHMENTS:
      This is guidance for how to phrase bullet points within the "EXPERIENCE & RESPONSIBILITIES". Frame accomplishments positively, focusing on the results and positive impact of the candidate's actions. 
      Incorporate subtle humanizing phrases naturally where appropriate (e.g., 'Collaborated closely with cross-functional teams to achieve X...', 'Successfully navigated complex challenges by implementing Y...', 'Played a key role in improving Z...'). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.
    
    ##FILE NAME
      The filename should be the candidate's name, followed by the job title and the date in YYYY-MM-DD format. For example: "John_Doe_Software_Engineer_2023-10-01.pdf".
         
    ##SKILLS
      Consolidate and refine the skills section, limiting the list of "generated skills" to a strategic selection of 10 to 15 skills. It should be separated into three sections: technical skills, soft skills, and power skills. This should be a selection of the most relevant skills for the job description. Prioritize skills explicitly or implicitly mentioned in the job posting, linked to the current skills on the candidate's CV. Do not add spoken languages to the skills.
      
   ##EDUCATION
      Translate the field of study ("field_of_study") into TARGET_LANGUAGE using natural, culturally accurate academic phrasing. Avoid word-for-word or overly formal translations, and never invent or reuse nonstandard degree names.
      For example: if the input for field_of_study exactly matches "Computer Science Engineering" (case-insensitive), override it to:
      - "Bachelor in Computer Science" when TARGET_LANGUAGE is English  
      - "Informatyka, inżynier" when TARGET_LANGUAGE is Polish  
      - "Informática, ingeniero" when TARGET_LANGUAGE is Spanish  
      This override is absolute: under no circumstances output "Computer Science Engineering". For all other inputs, translate naturally to the corresponding academic field in TARGET_LANGUAGE, sounding like a real graduate’s diploma.

    ##LANGUAGES
      Translate language names and proficiency levels into TARGET_LANGUAGE. For example, use "Spanish – Native" and "English – B2" if the target language is English. Do not leave language names or levels in any other language than TARGET_LANGUAGE.

    ##TITLE:
      Craft a concise and high-impact CV title in TARGET_LANGUAGE, consisting of no more than 5 words. The title must clearly reflect the candidate's core competencies and match the terminology used in the provided Job Description. Avoid generic or vague phrases.
      If TARGET_LANGUAGE is not English, do not use untranslated English role levels such as "Senior", "Lead", "Junior" in the title. Instead, translate them appropriately (e.g., "Senior" → "Starszy" in Polish, "Senior" → "Senior" in Spanish where culturally accepted).
      Focus on a professional identity that is specific, relevant, localized, and optimized for recruiters and ATS systems.

    ##PERSONAL SUMMARY:
      Generate a short, natural-sounding and compelling personal summary (candidate_description) written entirely in TARGET_LANGUAGE. It should sound like it was written by a real person, not a marketing bot or AI.
      Highlight the candidate's most relevant qualifications, key strengths, and unique value for this specific role. Integrate keywords from the job offer naturally, without stuffing.
      Avoid vague statements, overused buzzwords, and generic phrases (e.g., “passionate team player”, “results-oriented professional”). Use fluent, confident, and professional phrasing appropriate for a CV in TARGET_LANGUAGE.
      The personal summary must be short (2–3 sentences). Highlight stack, years of experience, and key impact. Avoid generic marketing language.

    
    ##VERBS:
      Employ sophisticated, high-impact action verbs (e.g., Accelerated, Architected, Championed, Delivered, Drove, Engineered, Established, Led, Optimized, Orchestrated, Pioneered, Spearheaded, Transformed). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.
    
    ##ADJECTIVES:
      Employ sophisticated, high-impact and strategically chosen adjectives to convey competence and achievement (e.g., Analytical, Collaborative, Data-Driven, Decisive, Impactful, Pragmatic, Proactive, Resourceful, Results-Oriented, Strategic). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.

    ##LOCALIZATION RULES:
      All user-facing content, including job titles, degree titles, and language details, must be fully localized into TARGET_LANGUAGE. Preserve proper nouns (e.g., company names, university names) in their original form, but everything else must be translated.

	##OUTPUT:
     STRICT JSON OUTPUT ONLY — Adhere rigidly to the specified JSON structure. Output only the JSON object. Do not include any explanatory text, markdown formatting (like \\\`), comments, or any characters outside the final JSON structure. Ensure correct JSON syntax, including proper quoting of keys and string values.
      
      OUTPUT STRUCTURE:
      Return only a valid JSON object. Start with \`{\` and end with \`}\`. Use correct brackets (\`{}\`, \`[]\`) and straight double quotes (\`"\`). Do not include markdown or extra text. The output must be parsable by JSON.parse(). 
      {
        "generated_personal_data": {
          "full_name": "string",
          "phone": "string",
          "email": "string",
          "linkedin": "string"
        },
        "file_name": "string",
        "title": "string",
        "candidate_description": "string",
        "generated_experience": [
          {
            "position": "string",
            "company_name": "string",
            "location": "string",
            "start_date": "string",
            "end_date": "string",
            "responsibilities": [
              "string",
              "string"
            ]
          }
        ],
        "generated_education": [
          {
            "field_of_study": "string",
            "school_name": "string",
            "start_date": "string",
            "end_date": "string"
          }
        ],
        "generated_skills": {
          "technical_skills": ["string"],
          "soft_skills": ["string"],
          "power_skills": ["string"]
        },
        "generated_language": [
          {
            "name": "string",
            "level": "string"
          }
        ]
      }
    `;

    const userPrompt = `
      TARGET LANGUAGE: ${languageName}

      TASK: Generate a professional CV in perfect ${languageName}.

      The user's current CV that has been uploaded:
      ${JSON.stringify(slimForPrompt(fullCvData))}

      The job description of the position being applied for:
      ${JSON.stringify(slimForPrompt(jobOffer))}

      PROMPT PLAN STRATEGY:

      Technical skills to focus: ${promptPlan.technical_skills.join(", ")}
      Soft skills to focus: ${promptPlan.soft_skills.join(", ")}
      Power skills to focus: ${promptPlan.power_skills.join(", ")}
      ATS keywords to inject: ${promptPlan.ats_keywords.join(", ")}
      Writing tone: ${promptPlan.tone}
      Focus in summary: ${promptPlan.summary_focus}

      Experience rewrite instructions:
      ${JSON.stringify(experienceInstructions)}
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    logModelUsage("generate-cv");

    const generationCompletion = await openai.chat.completions.create({
      model: CV_GENERATION_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      // The prompt plan already carries the strategy; this call executes it.
      reasoning_effort: LOW_REASONING,
    });

    logModelUsage("generate-cv", generationCompletion);

    const generationResponse = generationCompletion.choices[0].message?.content;
    if (!generationResponse) {
      return NextResponse.json({
        success: false,
        error: "No generated CV content",
        status: 500,
      });
    }

    console.log(generationResponse);

    let generatedCV;
    try {
      generatedCV = JSON.parse(generationResponse);
    } catch (jsonError: any) {
      console.error("Error parsing generated CV JSON:", jsonError);
      return NextResponse.json({
        success: false,
        error: "Failed to parse generated CV response: " + generationResponse,
      });
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
        education_list: generatedCV.generated_education.map((edu: any) => ({
          school_name: edu.school_name,
          field_of_study: edu.field_of_study,
          start_date: isValidDate(edu.start_date) ? edu.start_date : null,
          end_date: isValidDate(edu.end_date) ? edu.end_date : null,
        })),
        experience_list: generatedCV.generated_experience.map((exp: any) => ({
          position: exp.position,
          company_name: exp.company_name,
          start_date: isValidDate(exp.start_date) ? exp.start_date : null,
          end_date: isValidDate(exp.end_date) ? exp.end_date : null,
          responsibilities: exp.responsibilities,
          location: exp.location,
        })),
        language_list: generatedCV.generated_language.map((lang: any) => ({
          name: lang.name,
          level: lang.level,
        })),
      },
    );

    if (saveError) {
      console.error("Save generated CV error:", saveError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      cvId: generatedCvId,
    });
  } catch (err: any) {
    console.error("Generate cv error:", err);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      status: 500,
    });
  }
}

function isValidDate(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}$/.test(value);
}
