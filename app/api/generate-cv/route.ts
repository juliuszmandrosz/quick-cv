// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { language, cvUserDataId } = await request.json();

    const supabase = await createClient();

    const { data: fullCvData, error: selectError } = await supabase
      .from("cv_user_data")
      .select(
        `
        *,
        job_offers(*),
        education(*),
        experience(*),
        languages(*),
        generated_prompt_plan(
          *,
          generated_experience_rewrite_instruction(*)
        )
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

    const promptPlan = Array.isArray(fullCvData.generated_prompt_plan)
      ? fullCvData.generated_prompt_plan[0]
      : fullCvData.generated_prompt_plan;
    if (!promptPlan) {
      return NextResponse.json({
        success: false,
        error: "Prompt plan not found for this user",
        status: 404,
      });
    }

    const experienceInstructions: Record<string, string> = {};
    for (const item of promptPlan.generated_experience_rewrite_instruction ||
      []) {
      experienceInstructions[item.company_name] = item.instruction;
    }

    const systemPrompt = `
      You are an expert CV writing assistant and career strategist specializing in optimizing resumes for Applicant Tracking Systems (ATS) and human recruiters. Your expertise lies in strategically aligning candidate experience with specific job requirements.
      
      GOALS:
      
      Generate a highly effective, ATS-optimized CV, meticulously tailored to the target job description, while remaining 100% authentic to the candidate's history and natural in tone. The final output must be perceived as entirely human-written.
      
      Preserve all original work experiences provided by the candidate, maintaining their exact chronological order. Do not add, remove, or reorder any distinct job entries.
      
      Strategically rewrite ONLY the responsibilities/details within each preserved experience to maximize relevance to the job offer, quantifying achievements where possible and highlighting impact using strong action verbs. Base these modifications strictly on the provided candidate data and specific rewriting instructions. *Crucially, do not invent experiences, skills, or exaggerate claims beyond verifiable facts derived from the original CV.* Focus solely on rephrasing and highlighting existing information effectively.
      
      Consolidate and refine the skills section, limiting the 'additional_skills' list to a strategic selection of 8–15 key technical and soft skills most pertinent to the job description. Prioritize skills explicitly mentioned or implied in the job offer and candidate data.
      
      Generate a concise, compelling personal summary (candidate_description) that immediately highlights the candidate's most relevant qualifications, key strengths, and unique value proposition specifically for this role, integrating keywords from the job offer naturally.
      
      Employ sophisticated, high-impact action verbs (e.g., Spearheaded, Architected, Transformed, Quantified, Optimized, Mentored, Negotiated) and strategically chosen adjectives to convey competence and achievement. Frame accomplishments positively, focusing on the results and positive impact of the candidate's actions. Incorporate subtle humanizing phrases naturally where appropriate (e.g., 'Collaborated closely with cross-functional teams to achieve X...', 'Successfully navigated complex challenges by implementing Y...', 'Played a key role in improving Z...').
      
      STRICT JSON OUTPUT ONLY — Adhere rigidly to the specified JSON structure. Output only the JSON object. Do not include any explanatory text, markdown formatting (like \\\`), comments, or any characters outside the final JSON structure. Ensure correct JSON syntax, including proper quoting of keys and string values.
      
      OUTPUT STRUCTURE: 
      {
        "generated_personal_data": {
          "full_name": "",
          "email": "",
          "phone": "",
          "city": "",
          "additional_skills": []
        },
        "candidate_description": "",
        "generated_education": [
          {
            "school_name": "",
            "field_of_study": "",
            "start_date": "",
            "end_date": ""
          }
        ],
        "generated_experience": [
          {
            "position": "",
            "company_name": "",
            "start_date": "",
            "end_date": "",
            "responsibilities": []
          }
        ],
        "generated_language": [
          {
            "name": "",
            "level": ""
          }
        ]
      }
    `;

    console.log(promptPlan);

    const userPrompt = `
      TASK: Generate a professional CV in perfect ${language}.

      CANDIDATE DATA:
      ${JSON.stringify(fullCvData)}
      
      JOB OFFER:
      ${JSON.stringify(jobOffer)}

      PROMPT PLAN STRATEGY:

      Highlight these skills: ${promptPlan.highlight_skills.join(", ")}
      Optional skills: ${promptPlan.optional_skills.join(", ")}
      ATS keywords to inject: ${promptPlan.ats_keywords.join(", ")}
      Writing tone: ${promptPlan.tone}
      Focus in summary: ${promptPlan.summary_focus}

      Experience rewrite instructions:
      ${JSON.stringify(experienceInstructions)}
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const generationCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
    });

    const generationResponse = generationCompletion.choices[0].message?.content;
    if (!generationResponse) {
      return NextResponse.json({
        success: false,
        error: "No generated CV content",
        status: 500,
      });
    }

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

    console.log("GENERATED CV", generatedCV);

    const { data: generatedCvId, error: saveError } = await supabase.rpc(
      "save_generated_cv",
      {
        cv_user_data_id: cvUserDataId,
        job_offer_id: jobOffer.id,
        candidate_description: generatedCV.candidate_description,
        profile_photo_url: fullCvData.profile_photo_url || null,
        personal_data: {
          full_name: generatedCV.generated_personal_data.full_name,
          email: generatedCV.generated_personal_data.email,
          phone: generatedCV.generated_personal_data.phone,
          city: generatedCV.generated_personal_data.city,
          additional_skills:
            generatedCV.generated_personal_data.additional_skills,
        },
        education_list: generatedCV.generated_education.map((edu: any) => ({
          school_name: edu.school_name,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date,
          end_date: edu.end_date,
        })),
        experience_list: generatedCV.generated_experience.map((exp: any) => ({
          position: exp.position,
          company_name: exp.company_name,
          start_date: exp.start_date,
          end_date: exp.end_date,
          responsibilities: exp.responsibilities,
        })),
        language_list: generatedCV.generated_language.map((lang: any) => ({
          name: lang.name,
          level: lang.level,
        })),
      },
    );

    if (saveError) {
      return NextResponse.json({
        success: false,
        error: saveError.message,
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      cvId: generatedCvId,
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
