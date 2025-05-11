import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { chromium } from "playwright";

export async function POST(req: Request) {
  const { cvId, cvDataId, language } = await req.json();
  if (!cvId) {
    return new Response(null, {
      status: 400,
      statusText: "Missing cvId",
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const { data: cv } = await supabase
    .from("generated_cv")
    .select("token_consumed")
    .eq("id", cvId)
    .single();

  if (!cv) return new Response("CV not found", { status: 404 });

  if (!cv.token_consumed) {
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .gt("tokens_left", 0)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      return new Response("Insufficient tokens", { status: 402 });
    }

    await supabase
      .from("subscriptions")
      .update({ tokens_left: sub.tokens_left - 1 })
      .eq("id", sub.id);

    await supabase
      .from("generated_cv")
      .update({ token_consumed: true })
      .eq("id", cvId);

    const { error: updateUserIdError } = await supabase
      .from("cv_user_data")
      .update({ user_id: user.id })
      .eq("id", cvDataId);
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/cv-download?cvId=${cvId}&language=${language}`;
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.emulateMedia({ media: "print" });
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      scale: 0.8,
      preferCSSPageSize: true,
    });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cv.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF error:", error);
    return NextResponse.json({ error: "PDF generation failed", status: 500 });
  }
}
