import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateCoverLetterForCv } from "@/lib/cover-letter-server";

export async function POST(request: Request) {
  const errorMessage =
    "Error generating cover letter, please try again. If the problem persists, contact support.";

  try {
    const { cvId, language } = await request.json();

    if (!cvId) {
      return NextResponse.json({
        success: false,
        error: "cvId is required",
        status: 400,
      });
    }

    const supabase = await createClient();
    const result = await generateCoverLetterForCv(supabase, cvId, language);

    return NextResponse.json({
      success: true,
      fileName: result.fileName,
      coverLetter: result.coverLetter,
    });
  } catch (err: any) {
    console.error("Generate cover letter error:", err);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      status: 500,
    });
  }
}
