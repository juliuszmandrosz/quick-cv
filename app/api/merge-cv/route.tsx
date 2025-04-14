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
    console.log(profilePhoto + "XDDDDD");
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
      - additional_skills (optional): string
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

    console.log(extractedData);

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

    const generationSystemPrompt = `
      You are an assistant that writes professional CVs.
      Generate a professional CV based on the user's provided details and job offer information.
      Return the response ONLY AS A VALID JSON OBJECT that strictly adheres to the schema specified in the user prompt.
      Do not include any commentary, explanations, apologies, or markdown formatting (like \`\`\`json ... \`\`\`) in your response. Output only the raw JSON object.
    `;

    const generationUserPrompt = `
      Generate an ATS-optimized, professional CV tailored specifically for the target JOB OFFER, presented in JSON format in ${language || "en"}.
      Use the candidate's PERSONAL DETAILS, EDUCATION, EXPERIENCE, and LANGUAGES as the factual basis, but significantly enhance and tailor the content (summary, skills, responsibilities) to maximize the candidate's perceived fit for the role and pass ATS screening.
      
      **Core Task: Optimization and Tailoring**
      
      **Instructions:**
      1.  Deeply analyze the target JOB OFFER (Title, Description, Requirements, Tasks) to identify key skills, keywords, responsibilities, and desired candidate profile.
      2.  Generate a compelling, ATS-friendly professional summary/description for the "candidate_description" field (around 3-5 sentences). This summary must directly address the JOB OFFER, using keywords from the requirements/tasks and highlighting how the candidate's most relevant qualifications and experience (including experience gained under their previous **positions**) make them a strong fit for the target role.
      3.  Generate an optimized list of skills for the "additional_skills" array (aim for 8-15 skills). This list should **primarily** consist of skills explicitly mentioned or strongly implied in the JOB OFFER's Requirements, Tasks, and Description. **Integrate** relevant skills from the user's provided PERSONAL DETAILS ('Additional skills' input) where they align with the job offer, placing the most relevant skills first. Ensure the final list strongly reflects the target role.
      4.  For **each** entry in the candidate's EXPERIENCE:
          a.  Analyze the user's provided base details (**Position**, Company, Start/End Date, and original Responsibilities/Details input). Use the provided **Position** as the factual title for that role.
          b.  Generate an array of 3-6 concise, action-oriented bullet points for the "responsibilities" field.
          c.  These bullet points **must be tailored** to the target JOB OFFER. They should demonstrate how the experience gained in the candidate's listed **\`Position\`** at that \`Company\` is **directly relevant** to the requirements and tasks of the *target job*. Use strong action verbs and incorporate keywords from the JOB OFFER.
          d.  The generated responsibilities should be plausible given the candidate's actual **\`Position\`** and \`Company\` for that experience entry.
          e.  Use the candidate's original input Responsibilities/Details string as **inspiration or context**, but **prioritize rewriting or generating responsibilities** that demonstrate experience relevant to the *target job*. Do not simply copy the input.
          f.  **(Optional Refinement - Use with Caution):** If the user's provided \`Position\` title is extremely informal or non-standard (e.g., "Web Ninja"), you may slightly adjust it to a more professional, standard equivalent (e.g., "Web Developer") IF AND ONLY IF it accurately reflects the generated responsibilities and context. Do NOT invent or significantly inflate titles (e.g., changing 'Junior' to 'Senior'). If unsure, use the original title provided by the user.
      5.  Populate the generated_personal_data, generated_education, and generated_language fields accurately based on the provided input data.
      6.  Format all dates ("start_date", "end_date") as strings strictly in 'YYYY-MM-DD' format. If only the year and month are available in the input for a date, use the first day of that month (e.g., output '2024-02-01' for '2024-02'). If an end date is null or empty in the input, represent it as an empty string "" in the output JSON.
      
      **Input Data:**
      
      PERSONAL DETAILS:
      - Full name: ${fullCvData.full_name}
      - Email: ${fullCvData.email}
      - Phone: ${fullCvData.phone}
      - City: ${fullCvData.city || ""}
      - Additional skills: ${fullCvData.additional_skills || "N/A"} // Base skills provided by user (use as input/inspiration for optimized list)
      
      JOB OFFER (CRITICAL context for optimization):
      - Title: ${jobOffer.title || "N/A"}
      - Description: ${jobOffer.description || "N/A"}
      - Requirements: ${jobOffer.requirements ? jobOffer.requirements.join(", ") : "N/A"} // Key source for skills/keywords
      - Tasks: ${jobOffer.tasks ? jobOffer.tasks.join(", ") : "N/A"} // Key source for responsibilities/keywords
      
      EDUCATION:
      ${
        fullCvData.education && fullCvData.education.length > 0
          ? fullCvData.education
              .map(
                (edu: any, index: number) => `
      ${index + 1}.
        - School Name: ${edu.school_name || ""}
        - Field of Study: ${edu.field_of_study || ""}
        - Start Date: ${edu.start_date || ""} // Ensure AI outputs YYYY-MM-DD
        - End Date: ${edu.end_date || ""}`, // Ensure AI outputs YYYY-MM-DD or ""
              )
              .join("\\n") // Use \\n for literal newline in JS template literal string
          : "N/A"
      }
      
      EXPERIENCE:
      ${
        fullCvData.experience && fullCvData.experience.length > 0
          ? fullCvData.experience
              .map(
                (exp: any, index: number) => `
      ${index + 1}.
        - Position: ${exp.position || ""} // User's original title - use as primary title & context
        - Company: ${exp.company_name || ""}
        - Start Date: ${exp.start_date || ""} // Ensure AI outputs YYYY-MM-DD
        - End Date: ${exp.end_date || ""}     // Ensure AI outputs YYYY-MM-DD or ""
        - Original Responsibilities/Details: ${exp.details || "N/A"} // Base details provided by user (use as input/inspiration for optimized list of responsibilities)`,
                // Ensure fullCvData.experience objects have a 'details' field
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
              .join("\\n") // Use \\n for literal newline in JS template literal string
          : "N/A"
      }
      
      **Schema for the output JSON (Strictly adhere to this structure, do not include any extra fields):**
      {
        "generated_personal_data": {
          "full_name": "", // String
          "email": "", // String
          "phone": "", // String
          "city": "", // String
          "additional_skills": [] // Array of strings expected (OPTIMIZED based on Job Offer + User Input)
        },
        "candidate_description": "", // String (Generated ATS-friendly professional summary, 3-5 sentences) expected
        "generated_education": [
          {
            "school_name": "", // String
            "field_of_study": "", // String
            "start_date": "", // String 'YYYY-MM-DD' expected
            "end_date": "" // String 'YYYY-MM-DD' or empty string "" expected
          }
        ],
        "generated_experience": [
          {
            "position": "", // String (Based on user input, potentially slightly refined for professionalism)
            "company_name": "", // String
            "start_date": "", // String 'YYYY-MM-DD' expected
            "end_date": "", // String 'YYYY-MM-DD' or empty string "" expected
            "responsibilities": [] // Array of strings expected (OPTIMIZED & Tailored action-oriented bullet points relevant to target job)
          }
        ],
        "generated_language": [
          {
            "name": "", // String
            "level": "" // String
          }
        ]
      }
    `;

    console.log(generationUserPrompt);

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

    console.log(generatedCV);

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
