import { createHmac, timingSafeEqual } from "crypto";

/**
 * Short-lived token that lets the headless browser read one CV while rendering
 * its PDF.
 *
 * /api/generate-pdf opens /cv-download in a remote browser (Browserless), and
 * that browser has no session cookie. Once a CV is claimed, /api/cv-data only
 * serves it to its owner, so the render would get a 403 and print the "CV not
 * found" message into the PDF. generate-pdf checks ownership itself and then
 * hands the renderer this token instead of the user's session.
 *
 * The token is an HMAC over the cvId and an expiry, keyed with the privileged
 * Supabase key - a secret that already exists wherever RLS is on, so no extra
 * variable has to be configured. The public anon key is never used: without a
 * real secret no token is issued and none verifies.
 */
const TTL_MS = 2 * 60 * 1000;

const signingKey = () =>
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const sign = (cvId: string, expiresAt: number, key: string) =>
  createHmac("sha256", key)
    .update(`pdf-render:${cvId}:${expiresAt}`)
    .digest("hex");

export const createPdfRenderToken = (cvId: string): string | null => {
  const key = signingKey();
  if (!key) return null;

  const expiresAt = Date.now() + TTL_MS;
  return `${expiresAt}.${sign(cvId, expiresAt, key)}`;
};

export const verifyPdfRenderToken = (
  cvId: string,
  token: string | null,
): boolean => {
  const key = signingKey();
  if (!key || !token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const expected = Buffer.from(sign(cvId, expiresAt, key));
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
};
