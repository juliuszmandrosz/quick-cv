// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
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

      Extract and return ONLY valid JSON in this exact structure:
      
      { "email": "", "full_name": "", "phone": "", "skills": [], "title": "", "language_list": [{ "name": "", "level": "" }], "education_list": [{ "school_name": "", "field_of_study": "", "start_date": "", "end_date": "" }], "experience_list": [{ "company_name": "", "position": "", "details": "", "start_date": "", "end_date": "" }] }
      
      RULES:
      
      Extract only what exists in the CV text.
      
      Select most appropriate title based on the CV content.
      
      Dates must be in YYYY-MM-DD format; if only month and year are provided, assume day 01; if end_date is missing or is not a real date or some random text, put null for end_date
      
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

    const { data: cvUserDataId, error: createError } = await supabase.rpc(
      "insert_cv_user_data",
      {
        job_offer_id: jobOfferId,
        email: extractedData.email,
        full_name: extractedData.full_name,
        phone: extractedData.phone,
        skills: extractedData.skills || [],
        title: extractedData.title,
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

    return NextResponse.json({
      success: true,
      cvUserDataId,
    });
  } catch (err: any) {
    console.error("Extract cv error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      status: 500,
    });
  }
}
