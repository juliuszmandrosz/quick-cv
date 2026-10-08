import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { chromium } from "playwright";
import { createPdfRenderToken } from "@/lib/pdf-render-token";

export async function POST(req: Request) {
  const { cvId, language } = await req.json();
  if (!cvId) {
    return new Response(null, {
      status: 400,
      statusText: "Missing cvId",
    });
  }

  const supabase = await createClient();
  // Auth stays on the cookie-backed client; data access bypasses RLS, so every
  // query below must filter by the authenticated user itself.
  const db = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const { data: cv } = await db
    .from("generated_cv")
    .select("token_consumed, user_id, cv_user_data_id")
    .eq("id", cvId)
    .single();

  if (!cv) return new Response("CV not found", { status: 404 });

  // The renderer below is let past the owner check in /api/cv-data, so the
  // owner check has to happen here.
  if (cv.user_id && cv.user_id !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!cv.token_consumed) {
    const charged = await chargeTokenForCv(db, user.id, cvId);
    if (!charged) {
      return new Response("Insufficient tokens", { status: 402 });
    }

    // The source data the CV was generated from follows the CV to its new
    // owner. The id comes from the CV row, never from the request body.
    if (cv.cv_user_data_id) {
      const { error: claimDataError } = await db
        .from("cv_user_data")
        .update({ user_id: user.id })
        .eq("id", cv.cv_user_data_id)
        .is("user_id", null);
      if (claimDataError) {
        console.error("Claim cv_user_data error:", claimDataError.message);
      }
    }
  }

  try {
    // The remote browser has no session cookie; the token lets it read this
    // one CV now that it belongs to the user.
    const renderToken = createPdfRenderToken(cvId);
    const url =
      `${process.env.NEXT_PUBLIC_BASE_URL}/cv-download?cvId=${encodeURIComponent(cvId)}&lang=${encodeURIComponent(language ?? "en")}` +
      (renderToken ? `&renderToken=${renderToken}` : "");
    const apiKey = process.env.BROWSERLESS_API_KEY;
    const browser = await chromium.connectOverCDP(
      `wss://production-sfo.browserless.io/?token=${apiKey}`,
    );
    let pdfBuffer: Buffer;
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.emulateMedia({ media: "print" });
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      // Fail instead of returning a PDF of the "CV not found" message.
      await page.waitForSelector("[data-cv-ready]", { timeout: 10000 });
      await page.waitForTimeout(1000);

      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
        scale: 0.8,
        preferCSSPageSize: true,
      });
    } finally {
      await browser.close();
    }

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cv.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF error:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Spends one token on a CV, safely under concurrent requests.
 *
 * 1. Claim the CV by flipping token_consumed false -> true. Only one request
 *    can win that conditional update, so a double click never charges twice.
 * 2. Decrement the newest subscription that still has tokens, guarded by the
 *    value just read (optimistic locking), retrying a few times if another
 *    request got there first.
 * 3. If no token could be taken, release the claim so the CV stays locked.
 *
 * Returns true when the CV is paid for, including when a parallel request
 * already paid for it.
 */
async function chargeTokenForCv(
  db: AdminClient,
  userId: string,
  cvId: string,
): Promise<boolean> {
  const { data: claimed, error: claimError } = await db
    .from("generated_cv")
    .update({ token_consumed: true, user_id: userId })
    .eq("id", cvId)
    .eq("token_consumed", false)
    .select("id");

  if (claimError) {
    console.error("Claim CV error:", claimError.message);
    return false;
  }
  // Someone else flipped the flag first: the CV is already paid for.
  if (!claimed?.length) return true;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: sub } = await db
      .from("subscriptions")
      .select("id, tokens_left")
      .eq("user_id", userId)
      .gt("tokens_left", 0)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub || sub.tokens_left === null) break;

    const { data: decremented } = await db
      .from("subscriptions")
      .update({ tokens_left: sub.tokens_left - 1 })
      .eq("id", sub.id)
      .eq("tokens_left", sub.tokens_left)
      .select("id");

    if (decremented?.length) return true;
  }

  await db
    .from("generated_cv")
    .update({ token_consumed: false })
    .eq("id", cvId);
  return false;
}
