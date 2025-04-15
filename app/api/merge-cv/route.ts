// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/database.types";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    const language = formData.get("language") as string | null;
    const jobOfferId = formData.get("job_offer_id") as string | null;
    const additionalDetails = formData.get("additional_details") as
      | string
      | null;
    const profilePhoto = formData.get("profile_photo") as File | null;

    if (!cvFile) {
      return NextResponse.json({
        success: false,
        error: "No cv file provided",
      });
    }

    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cvData = await pdf(buffer);
    const cvText = cvData.text;

    if (!cvText || typeof cvText !== "string") {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid 'cvText'",
        status: 400,
      });
    }
    if (!jobOfferId) {
      return NextResponse.json({
        success: false,
        error: "Missing 'job_offer_id'",
        status: 400,
      });
    }

    const supabase = await createClient();

    let profilePhotoUrl: string | null = null;
    if (profilePhoto && profilePhoto instanceof File && profilePhoto.size > 0) {
      const originalFileName = profilePhoto.name;
      const contentType = profilePhoto.type;
      const uniqueFileName = `${Date.now()}-${originalFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(uniqueFileName, profilePhoto, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });
      if (uploadError) {
        return NextResponse.json({
          success: false,
          error: `Photo upload error: ${uploadError.message}`,
          status: 500,
        });
      }
      const { data: publicUrlData } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(uniqueFileName);
      profilePhotoUrl = publicUrlData?.publicUrl || null;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = "gpt-4.1-mini";

    const extractionSystemPrompt = `
      You are an assistant that extracts CV details.

      Extract and return ONLY valid JSON in this exact structure:
      
      { "email": "", "full_name": "", "phone": "", "additional_skills": [], "language_list": [{ "name": "", "level": "" }], "education_list": [{ "school_name": "", "field_of_study": "", "start_date": "", "end_date": "" }], "experience_list": [{ "company_name": "", "position": "", "details": "", "start_date": "", "end_date": "" }] }
      
      RULES:
      
      Extract only what exists in the CV text.
      
      Dates must be in YYYY-MM-DD format; if only month and year are provided, assume day 01; if end_date is missing put null for end_date
      
      Do not invent any skills or data.
      
      STRICT JSON OUTPUT ONLY — No markdown, no commentary, no extra text. DO NOT use any markdown formatting or triple backticks.
    `;

    const extractionUserPrompt = `Extract data from this CV text:${cvText}`;

    const extractionCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: extractionSystemPrompt },
        { role: "user", content: extractionUserPrompt },
      ],
      temperature: 0,
    });

    const extractionResponseText =
      extractionCompletion.choices[0].message?.content;
    if (!extractionResponseText) {
      return NextResponse.json({
        success: false,
        error: "No response from GPT extraction",
        status: 500,
      });
    }

    let extractedData;
    try {
      extractedData = JSON.parse(extractionResponseText);
    } catch (jsonError: any) {
      console.error("Error parsing extraction response:", jsonError);
      return NextResponse.json({
        success: false,
        error:
          "Failed to parse GPT extraction response: " + extractionResponseText,
        status: 500,
      });
    }

    console.log("EXTRACTED DATA", extractedData);

    const { data: cvUserDataId, error: createError } = await supabase.rpc(
      "create_default_cv_user_data",
      {
        email: extractedData.email,
        full_name: extractedData.full_name,
        phone: extractedData.phone,
        city: undefined,
        additional_skills: extractedData.additional_skills || [],
        profile_photo_url: profilePhotoUrl || undefined,
        language_list: extractedData.language_list || [],
        education_list: extractedData.education_list || [],
        experience_list: extractedData.experience_list || [],
        job_offer_id: jobOfferId,
      } as Database["public"]["Functions"]["create_default_cv_user_data"]["Args"],
    );

    console.log("USER SKILLS" + extractedData.additional_skills);

    if (createError) {
      return NextResponse.json({
        success: false,
        error: createError.message,
        status: 500,
      });
    }

    if (!cvUserDataId) {
      return NextResponse.json({
        success: false,
        error: "Failed to create CV user data",
        status: 500,
      });
    }

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
      model: model,
      messages: [
        { role: "system", content: planSystemPrompt },
        { role: "user", content: planUserPrompt },
      ],
      temperature: 1.0,
    });

    const promptPlan = JSON.parse(
      planCompletion.choices[0].message?.content || "{}",
    );

    console.log("PROMPT PLAN", promptPlan);

    const generationSystemPrompt = `
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

    const generationUserPrompt = `
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
      
      For each experience, follow these rewriting instructions to modify the responsibilities (do not remove any experience or change the company/position): 
      ${JSON.stringify(promptPlan.experience_rewrite_instructions)}
    `;

    const generationCompletion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: generationSystemPrompt },
        { role: "user", content: generationUserPrompt },
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
        profile_photo_url: profilePhotoUrl || null,
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
