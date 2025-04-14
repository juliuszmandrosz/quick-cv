import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { chromium } from "playwright";

export async function POST(req: Request) {
  console.log("siema");
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

  console.log(user);

  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const { data: sub } = (await supabase)
    .from("subscriptions")
    .select("tokens")
    .eq("user_id", user.id)
    .single();

  console.log(sub);

  if (!sub || sub.tokens <= 0) {
    return new Response("Insufficient tokens", { status: 402 });
  }

  // Generate PDF
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/cv-download?cvId=${cvId}&language=${language}`;
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      scale: 1.0,
      preferCSSPageSize: true,
    });

    await browser.close();

    (await supabase)
      .from("subscriptions")
      .update({ tokens: sub.tokens - 1 })
      .eq("user_id", user.id);

    const { error: updatePaymentError } = await supabase
      .from("generated_cv")
      .update({ payment_completed: true })
      .eq("id", cvId);

    const { error: updateUserIdError } = await supabase
      .from("cv_user_data")
      .update({ user_id: user.id })
      .eq("id", cvDataId);

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
