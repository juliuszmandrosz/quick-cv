import { createClient } from "@/utils/supabase/server";
import { chromium } from "playwright";

// Rendering alone is quick, but give it room beyond the default limit.
export const maxDuration = 60;
import { generateCoverLetterForCv } from "@/lib/cover-letter-server";
import { buildCoverLetterHtml } from "@/lib/cover-letter-html";

export async function POST(req: Request) {
  const { cvId, language, coverLetter, fileName } = await req.json();

  if (!cvId) {
    return new Response(null, { status: 400, statusText: "Missing cvId" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  }

  const { data: cv } = await supabase
    .from("generated_cv")
    .select("token_consumed")
    .eq("id", cvId)
    .single();

  if (!cv) return new Response("CV not found", { status: 404 });

  // The cover letter ships with a paid CV. It never consumes a token of its
  // own - the CV download already did that.
  if (!cv.token_consumed) {
    return new Response("Insufficient tokens", { status: 402 });
  }

  try {
    // Reuse the text generated right after the CV when the client still has
    // it; only fall back to a fresh generation when it is gone.
    let letter = {
      coverLetter,
      fileName,
      fullName: "",
      title: null as string | null,
      email: null as string | null,
      phone: null as string | null,
      linkedin: null as string | null,
    };

    const { data: personal } = await supabase
      .from("generated_personal_data")
      .select("*")
      .eq("generated_cv_id", cvId)
      .single();

    const { data: cvRow } = await supabase
      .from("generated_cv")
      .select("title, file_name")
      .eq("id", cvId)
      .single();

    if (!coverLetter) {
      // Writing the letter and rendering it in one request overruns the
      // function time limit, so the client generates the text first via
      // /api/generate-cover-letter and posts it here.
      console.error("[generate-cover-letter-pdf] no cover letter text supplied");
      return new Response("Missing cover letter text", { status: 400 });
    } else {
      letter.fullName = personal?.full_name ?? "";
      letter.title = cvRow?.title ?? null;
      letter.email = personal?.email ?? null;
      letter.phone = personal?.phone ?? null;
      letter.linkedin = personal?.linkedin ?? null;
      letter.fileName = fileName || `${cvRow?.file_name ?? "cover"}_Cover_Letter`;
    }

    const html = buildCoverLetterHtml({
      fullName: letter.fullName,
      title: letter.title,
      email: letter.email,
      phone: letter.phone,
      linkedin: letter.linkedin,
      body: letter.coverLetter,
      date: new Date().toISOString().slice(0, 10),
    });

    const apiKey = process.env.BROWSERLESS_API_KEY;
    const browser = await chromium.connectOverCDP(
      `wss://production-sfo.browserless.io/?token=${apiKey}`,
    );
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.emulateMedia({ media: "print" });
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });

    await browser.close();

    // HTTP headers are latin-1 only, and the generated file name can carry
    // Polish characters, so keep the header ASCII. The browser names the file
    // from the anchor's download attribute anyway.
    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Cover letter PDF error:", error);
    // Must be a real 500: a 200 with a JSON body would be saved as a broken PDF.
    return new Response("Cover letter PDF generation failed", { status: 500 });
  }
}
