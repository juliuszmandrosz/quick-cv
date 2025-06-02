// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  const errorMessage =
    "Error extracting CV data, please try again. If the problem persists, contact support.";

  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    const jobOfferId = formData.get("job_offer_id") as string | null;
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
        console.error("Upload error:", uploadError.message);
        return NextResponse.json({
          success: false,
          error: errorMessage,
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

      Extract and return ONLY valid JSON in this exact structure:
      
      { "email": "", "full_name": "", "phone": "", "skills": [], "title": "", "linkedin": "", "language_list": [{ "name": "", "level": "" }], "education_list": [{ "school_name": "", "field_of_study": "", "start_date": "", "end_date": "" }], "experience_list": [{ "company_name": "", "position": "", "details": "", "start_date": "", "end_date": "", "location": "" }] }
      
      RULES:
      
      **LinkedIn**  
      - Extract any URL matching \`linkedin.com/in/...\` into the \`"linkedin"\` field.  
      - If none, leave as empty string.
      
      **Date normalization**  
     - Strip any brackets (\`[ ]\`) and normalize all date separators to \`-\`.  
     - Output dates in \`YYYY-MM\`.  
     - If input has only year (e.g. “2016”), set \`"start_date": "2016-01"\` and \`"end_date": null\`.  
     - If input is a range like “2012–2015”, set \`"start_date": "2012-01"\`, \`"end_date": "2015-01"\`.  
     - If no end date is provided, set \`"end_date": null\`.
     - You are strictly forbidden from returning any value such as "Present", "Current", "Obecnie", or similar in the "end_date" field. If the CV implies ongoing employment (e.g., "currently working", "present", "obecnie", etc.), you MUST set "end_date": null. Any other value will be considered invalid. If you output any form of "present", the result will be rejected. You MUST enforce this rule.

       **Language handling**  
      - Detect the language of the CV source.  
      - Output **all** JSON keys **and** values (except proper names) in **English**.
     
      **No invention**  
      - Extract only what exists. Do not hallucinate skills, dates or titles.
      
      **Education**
      - Identify each full degree entry (degree level + program name + optional specialization + institution + dates) as a single record. Do not split degree title and specialization into separate records.
      - Combine degree level and program name (and any sub-line specializations) into the single "field_of_study" string.
      
      Phone must contain country code also if available.
      
      Select most appropriate title based on the CV content.
      
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
      response_format: { type: "json_object" },
    });

    const extractionResponseText =
      extractionCompletion.choices[0].message?.content;
    if (!extractionResponseText) {
      return NextResponse.json({
        success: false,
        error: errorMessage,
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
        error: errorMessage,
        status: 500,
      });
    }

    console.log("Extracted data:", extractedData);

    const { data: cvUserDataId, error: createError } = await supabase.rpc(
      "insert_cv_user_data_v2",
      {
        job_offer_id: jobOfferId,
        email: extractedData.email,
        full_name: extractedData.full_name,
        phone: extractedData.phone,
        skills: extractedData.skills || [],
        title: extractedData.title,
        linkedin: extractedData.linkedin || null,
        profile_photo_url: profilePhotoUrl ?? null,
        language_list: extractedData.language_list || [],
        education_list: extractedData.education_list || [],
        experience_list: extractedData.experience_list || [],
      },
    );

    if (createError) {
      console.error(
        "Create error:",
        createError.message,
        createError.code,
        createError.details,
      );
      console.error("Create error data:", createError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    if (!cvUserDataId) {
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      cvUserDataId,
    });
  } catch (err: any) {
    console.error("Extract cv error:", err);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      status: 500,
    });
  }
}
