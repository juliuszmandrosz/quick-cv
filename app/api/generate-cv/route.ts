// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
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

    const { data: jobOffer, error: jobError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", jobOfferId)
      .single();

    if (jobError) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch job offer",
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
      return NextResponse.json({
        success: false,
        error: promptPlanError.message,
        status: 500,
      });
    }

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
      
	##CONTEXT:
      You are an expert CV writing assistant and career strategist specializing in optimizing resumes for Applicant Tracking Systems (ATS) and human recruiters. Your expertise lies in strategically aligning candidate experience with specific job requirements.
      
	##GOALS:
      Generate a highly effective, ATS-optimized CV, meticulously tailored to the target job description, while remaining 100% authentic to the candidate's history and experience. The entire narrative must be credible and strategically focused.

    ##TONE:
      The final output must be perceived as entirely human-written. It is key to maintain a professional and natural tone throughout all adapted content.
    
    ##CHRONOLOGICAL ORDER:
      Use the original order work experiences provided by the candidate, maintaining their exact chronological order date descending. Do not add, remove, or reorder any distinct job entries. The last experience chronologically should be placed at the top and go down in the same order.
    
    ##EXPERIENCE & RESPONSIBILITIES:
      Strategically rewrite ONLY the responsibilities/details within each preserved experience to maximize relevance to the job offer, quantifying achievements where possible and highlighting impact using strong action verbs. Base these modifications strictly on the provided candidate data and specific rewriting instructions. 
      Crucially, do not invent experiences, skills, or exaggerate claims beyond verifiable facts derived from the original CV.
      Focus solely on rephrasing and highlighting existing information effectively.
    
    ##ACCOMPLISHMENTS:
      This is guidance for how to phrase bullet points within the "EXPERIENCE & RESPONSIBILITIES". Frame accomplishments positively, focusing on the results and positive impact of the candidate's actions. 
      Incorporate subtle humanizing phrases naturally where appropriate (e.g., 'Collaborated closely with cross-functional teams to achieve X...', 'Successfully navigated complex challenges by implementing Y...', 'Played a key role in improving Z...'). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.
    
    ##FILE NAME
      The filename should be the candidate's name, followed by the job title and the date in YYYY-MM-DD format. For example: "John_Doe_Software_Engineer_2023-10-01.pdf".
         
    ##SKILLS
      Consolidate and refine the skills section, limiting the list of "generated skills" to a strategic selection of 10 to 15 skills. It should be separated into three sections: technical skills, soft skills, and power skills. This should be a selection of the most relevant skills for the job description. Prioritize skills explicitly or implicitly mentioned in the job posting, linked to the current skills on the candidate's CV. Do not add spoken languages to the skills.
    
    ##TITLE:
        Craft a high-impact, concise CV title in ${language} that accurately reflects the candidate's core strengths and aligns seamlessly with the provided Job Description. The title must consist of no more than 5 words and effectively capture the candidate's professional identity
    
    ##PERSONAL SUMMARY:
      Generate a concise, compelling personal summary (candidate_description) that immediately highlights the candidate's most relevant qualifications, key strengths, and unique value proposition specifically for this role, integrating keywords from the job offer naturally.
    
    ##VERBS:
      Employ sophisticated, high-impact action verbs (e.g., Accelerated, Advocated, Amplified, Architected, Attained, Authored, Capitalized, Catalyzed, Championed, Commanded, Conceptualized, Cultivated, Deciphered, Delivered, Devised, Directed, Drove, Elevated, Engineered, Established, Executed, Forged, Fortified, Founded, Generated, Governed, Guided, Harmonized, Ignited, Influenced, Innovated, Instituted, Launched, Masterminded, Mobilized, Modernized, Navigated, Negotiated, Orchestrated, Overhauled, Pioneered, Piloted, Quantified, Reconciled, Rectified, Revitalized, Secured, Spearheaded, Steered, Transformed). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.
    
    ##ADJECTIVES:
      Employ sophisticated, high-impact and strategically chosen adjectives to convey competence and achievement (e.g., Adaptable, Analytical, Articulate, Assertive, Astute, Attentive, Authentic, Client-Focused, Collaborative, Compelling, Comprehensive, Conscientious, Constructive, Creative, Data-Driven, Decisive, Dedicated, Determined, Diligent, Diplomatic, Disciplined, Dynamic, Effective, Efficient, Empathetic, Enterprising, Exceptional, Forward-Thinking, Impactful, Incisive, Influential, Ingenious, Innovative, Inquisitive, Insightful, Integrative, Methodical, Meticulous, Perceptive, Persuasive, Pioneering, Pragmatic, Proactive, Proficient, Resilient, Resourceful, Results-Oriented, Rigorous, Strategic, Transformative). These are non-strict examples for your reference; you can use other words that fit perfectly with the context of the sentence.

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
      TASK: Generate a professional CV in perfect ${language}.

      The user's current CV that has been uploaded:
      ${JSON.stringify(fullCvData)}
      
      The job description of the position being applied for:
      ${JSON.stringify(jobOffer)}

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

    console.log(language, "LANGUAGE");

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
    console.error("Generate cv error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 500,
    });
  }
}
