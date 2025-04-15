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

    const extractionSystemPrompt = `
      You are an assistant that extracts CV details.
      Extract and return the following fields in valid JSON format without any markdown formatting (no triple backticks, no code blocks):
      - email: string
      - full_name: string
      - phone: string
      - additional_skills (optional): array of strings — Extract all relevant technical skills, programming languages, technologies, tools, and methodologies mentioned in the CV text. Each skill must be a separate item in the array. Do not invent skills.
      - profile_photo_url (optional): string
      - language_list (optional): an array of language_input objects
      - education_list (optional): an array of education_input objects
      - experience_list (optional): an array of experience_input objects
      
      Ensure all \`start_date\` and \`end_date\` values in the output JSON are valid date strings formatted as \`YYYY-MM-DD\`.
      If the source CV text for a date provides only the year and month (e.g., 'October 2019', '2019-10'), 
      infer the date as the **first day** of that month and format it accordingly (e.g., output \`'2019-10-01'\`). If a full date is provided, use it directly but ensure the \`YYYY-MM-DD\` format.
      
      Where language_input is defined as:
      {
        "name": string,
        "level": string
      }
      
      Where education_input is defined as:
      {
        "school_name": string,
        "field_of_study": string,
        "start_date": string, // Must be YYYY-MM-DD format
        "end_date": string or null // Must be YYYY-MM-DD format or null
      }
      
      Where experience_input is defined as:
      {
        "company_name": string,
        "position": string,
        "details": string or null,
        "start_date": string, // Must be YYYY-MM-DD format
        "end_date": string or null // Must be YYYY-MM-DD format or null
      }
      
      Do not include any extra commentary.
      Return your response strictly as a JSON object using the exact format example below:
      
      {
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "phone": "+48123456789",
        "additional_skills": "Skill 1, Skill 2",
        "language_list": [
          { "name": "English", "level": "C2" },
          { "name": "Polish", "level": "Native" }
        ],
        "education_list": [
          {
            "school_name": "XYZ University",
            "field_of_study": "Bachelor in Computer Science",
            "start_date": "2023-01-15",
            "end_date": "2025-01-15"
          }
        ],
        "experience_list": [
          {
            "company_name": "ABC Corp",
            "position": "Developer",
            "details": "Worked on various projects",
            "start_date": "2023-01-15",
            "end_date": "2025-01-15"
          }
        ]
      }
    `;

    const extractionUserPrompt = `Analyze the following CV text and extract the data as specified:\n\n${cvText}`;

    const extractionCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: extractionSystemPrompt },
        { role: "user", content: extractionUserPrompt },
      ],
      temperature: 0.4,
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

    const { data: cvUserDataId, error: createError } = await supabase.rpc(
      "create_default_cv_user_data",
      {
        email: extractedData.email,
        full_name: extractedData.full_name,
        phone: extractedData.phone,
        city: null,
        additional_skills: extractedData.additional_skills || [],
        profile_photo_url: profilePhotoUrl || null,
        language_list: extractedData.language_list || [],
        education_list: extractedData.education_list || [],
        experience_list: extractedData.experience_list || [],
        job_offer_id: jobOfferId,
      } as Database["public"]["Functions"]["create_default_cv_user_data"]["Args"],
    );

    console.log(extractedData.additional_skills);

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

    console.log(jobOffer.requirements);

    const generationSystemPrompt = `
      You are an assistant that writes professional CVs.
      Generate a professional CV based on the user's provided details and job offer information.
      Return the response ONLY AS A VALID JSON OBJECT that strictly adheres to the schema specified in the user prompt.
      Do not include any commentary, explanations, apologies, or markdown formatting (like \`\`\`json ... \`\`\`) in your response. Output only the raw JSON object.
    `;

    const generationUserPrompt = `
      Your task is to generate a perfect, natural-sounding, ATS-optimized CV tailored strictly for the provided JOB OFFER.

      GOALS:
      1. This CV must pass Applicant Tracking Systems (ATS) — include keywords from the job offer naturally.
      2. It must sound like a real human — experienced candidate writing about themselves.
      3. It must feel clean, modern, and ready to send without any edits.
      4. You can slightly adjust and expand skills if they realistically fit the job offer — but do not invent fake experience or projects.
      5. Style must be universal — works for Software Engineers, Product Managers, Sales, Marketing, Designers, etc.
      
      WRITING STYLE:
      - Honest, confident, natural tone.
      - Not robotic, not copy-paste AI vibes.
      - Strong action verbs like: built, designed, improved, optimized, led, created, delivered.
      - Small human touches like: "Together with the team...", "I focused on...", "In this project..."
      - Summary = 3-5 sentences — engaging, humble, convincing.
      - Responsibilities = specific, clear, value-driven bullet points.
      - Vary sentence structure.
      
      SKILLS SECTION:
      - For the "additional_skills" array:
        - Combine candidate's existing skills with the most relevant skills/keywords from the JOB OFFER.
        - If a skill is required in the job offer, and the candidate's background allows it, include it.
        - Prioritize relevance over completeness.
        - Output 8-15 most important skills.
        - No categories. Just a clean array of skills.
      
      RULES:
      - NEVER include markdown or code formatting.
      - Output ONLY a valid JSON matching the provided SCHEMA.
      - All dates strictly in YYYY-MM-DD format. If only year/month is available, use the 1st day of that month.
      - End date should be empty string "" if the experience is current.
      - No empty arrays — if there is no data, just provide an empty array [].
      
      SCHEMA:
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
      
      INPUT DATA:
      
      PERSONAL DETAILS:
      Full name: ${fullCvData.full_name}
      Email: ${fullCvData.email}
      Phone: ${fullCvData.phone}
      City: ${fullCvData.city || ""}
      Additional skills: ${fullCvData.additional_skills || "N/A"}
      
      JOB OFFER:
      Title: ${jobOffer.title || "N/A"}
      Description: ${jobOffer.description || "N/A"}
      Requirements: ${jobOffer.requirements ? jobOffer.requirements.join(", ") : "N/A"}
      Tasks: ${jobOffer.tasks ? jobOffer.tasks.join(", ") : "N/A"}
      
      EDUCATION:
      ${
        fullCvData.education && fullCvData.education.length > 0
          ? fullCvData.education
              .map(
                (edu: any, index: number) => `
      ${index + 1}.
      - School Name: ${edu.school_name || ""}
      - Field of Study: ${edu.field_of_study || ""}
      - Start Date: ${edu.start_date || ""}
      - End Date: ${edu.end_date || ""}`,
              )
              .join("\\n")
          : "N/A"
      }
      
      EXPERIENCE:
      ${
        fullCvData.experience && fullCvData.experience.length > 0
          ? fullCvData.experience
              .map(
                (exp: any, index: number) => `
      ${index + 1}.
      - Position: ${exp.position || ""}
      - Company: ${exp.company_name || ""}
      - Start Date: ${exp.start_date || ""}
      - End Date: ${exp.end_date || ""}
      - Original Responsibilities/Details: ${exp.details || "N/A"}`,
              )
              .join("\\n")
          : "N/A"
      }
      
      LANGUAGES:
      ${
        fullCvData.languages && fullCvData.languages.length > 0
          ? fullCvData.languages
              .map(
                (lang: any, index: number) => `
      ${index + 1}.
      - Language: ${lang.name || ""}
      - Level: ${lang.level || ""}`,
              )
              .join("\\n")
          : "N/A"
      }
      
      REMEMBER:
      - This CV must feel like a real person wrote it for this exact job.
      - Natural > robotic.
      - Clarity > fluff.
      - Human-first, but ATS-optimized.
      - Don't be afraid to gently stretch skills if reasonable.
      - Never add fake jobs or projects.
    `;

    const generationCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: generationSystemPrompt },
        { role: "user", content: generationUserPrompt },
      ],
      temperature: 0.4,
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
