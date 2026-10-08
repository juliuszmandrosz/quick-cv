import pdf from "pdf-parse/lib/pdf-parse";
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { describeError } from "@/lib/errors";
import { parseExtractedCv } from "@/lib/cv-schemas";
import {
  EXTRACT_CV_SYSTEM_PROMPT,
  extractCvUserPrompt,
} from "@/lib/prompts/extract-cv";
import { createAdminClient } from "@/utils/supabase/admin";
import OpenAI from "openai";

const MAX_CV_BYTES = 10 * 1024 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_CV_TEXT_CHARS = 40_000;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  // Calls OpenAI without requiring a session: throttle per IP so an
  // unauthenticated loop cannot run up the bill.
  const rateLimit = checkRateLimit(request, "extract-cv", RATE_LIMITS.analyze);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const errorMessage =
    "Error extracting CV data, please try again. If the problem persists, contact support.";

  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    const jobOfferId = formData.get("job_offer_id") as string | null;
    const profilePhoto = formData.get("profile_photo") as File | null;

    if (!cvFile) {
      return NextResponse.json(
        {
          success: false,
          error: "No cv file provided",
        },
        { status: 400 },
      );
    }

    // pdf-parse happily chews on anything handed to it, so bound the input
    // before it reaches the parser: an oversized or crafted file would
    // otherwise exhaust the function's memory.
    if (cvFile.size > MAX_CV_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "CV file is too large. Maximum size is 10 MB.",
        },
        { status: 413 },
      );
    }

    if (cvFile.type && cvFile.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "CV must be a PDF file.",
        },
        { status: 415 },
      );
    }

    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // A PDF always starts with %PDF-; refuse anything else regardless of the
    // declared content type.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return NextResponse.json(
        {
          success: false,
          error: "CV must be a PDF file.",
        },
        { status: 415 },
      );
    }

    let cvText: string;
    try {
      const cvData = await pdf(buffer);
      cvText = cvData.text;
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Could not read this PDF. Try exporting it again.",
        },
        { status: 400 },
      );
    }

    // Cap what reaches the model: a text-heavy PDF can carry far more than a
    // CV ever needs, and every character is billed.
    if (cvText.length > MAX_CV_TEXT_CHARS) {
      cvText = cvText.slice(0, MAX_CV_TEXT_CHARS);
    }

    if (!cvText || typeof cvText !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid 'cvText'",
        },
        { status: 400 },
      );
    }
    if (!jobOfferId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'job_offer_id'",
        },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    let profilePhotoUrl: string | null = null;
    if (profilePhoto && profilePhoto instanceof File && profilePhoto.size > 0) {
      if (profilePhoto.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: "Profile photo is too large. Maximum size is 5 MB.",
          },
          { status: 413 },
        );
      }

      if (!ALLOWED_PHOTO_TYPES.has(profilePhoto.type)) {
        return NextResponse.json(
          {
            success: false,
            error: "Profile photo must be a JPEG, PNG or WebP image.",
          },
          { status: 415 },
        );
      }

      const originalFileName = profilePhoto.name;
      const contentType = profilePhoto.type;
      // The name is user-controlled; keep only safe characters for the storage key.
      const safeName = originalFileName
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-100);
      const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(uniqueFileName, profilePhoto, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });
      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 500 },
        );
      }
      const { data: publicUrlData } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(uniqueFileName);
      profilePhotoUrl = publicUrlData?.publicUrl || null;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const extractionCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: EXTRACT_CV_SYSTEM_PROMPT },
        { role: "user", content: extractCvUserPrompt(cvText) },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const extractionResponseText =
      extractionCompletion.choices[0].message?.content;
    if (!extractionResponseText) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    const extractedData = parseExtractedCv(extractionResponseText);
    if (!extractedData) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 502 },
      );
    }

    const { data: cvUserDataId, error: createError } = await supabase.rpc(
      "insert_cv_user_data_v2",
      {
        job_offer_id: jobOfferId,
        email: extractedData.email,
        full_name: extractedData.full_name,
        phone: extractedData.phone,
        skills: extractedData.skills,
        title: extractedData.title,
        linkedin: extractedData.linkedin || null,
        profile_photo_url: profilePhotoUrl ?? null,
        language_list: extractedData.language_list,
        education_list: extractedData.education_list,
        experience_list: extractedData.experience_list,
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
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    if (!cvUserDataId) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cvUserDataId,
    });
  } catch (err) {
    console.error("Extract cv error:", describeError(err));
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
