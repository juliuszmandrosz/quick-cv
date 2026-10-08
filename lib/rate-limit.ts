/**
 * Per-IP rate limiting for the endpoints that cost money (OpenAI calls).
 *
 * This is an in-process counter. On Vercel each running instance keeps its own
 * map, so the effective limit is (limit x number of warm instances) and it
 * resets whenever an instance is recycled. That is deliberately a first line of
 * defence, not a guarantee: it stops a naive loop hammering one endpoint, which
 * is the realistic abuse case, without adding an external dependency.
 *
 * If this ever needs to be exact - or the traffic grows enough that the slack
 * matters - move the counter into Upstash Redis or a Supabase table keyed by
 * ip + window; the call sites below do not change.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Keep the map from growing without bound on a long-lived instance.
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitRule = {
  /** Requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export const RATE_LIMITS = {
  /** Full CV generation - the most expensive call in the app. */
  generate: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Cheaper preparatory calls, still billed per token. */
  analyze: { limit: 15, windowMs: 60 * 60 * 1000 },
  /** Job offer scraping and linking: no OpenAI cost, but each POST makes an
   *  outbound request and writes a row, so it still needs a ceiling. */
  jobOffers: { limit: 30, windowMs: 60 * 60 * 1000 },
} satisfies Record<string, RateLimitRule>;

/**
 * Vercel puts the client address in x-forwarded-for. The first entry is the
 * original client; later ones are proxies. Falls back to a shared bucket when
 * no header is present, which is the safe direction - it throttles rather than
 * letting an unidentified caller through.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  request: Request,
  scope: string,
  rule: RateLimitRule,
): RateLimitResult {
  const key = clientKey(request, scope);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      buckets.forEach((b, k) => {
        if (b.resetAt <= now) buckets.delete(k);
      });
      if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, remaining: rule.limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  if (bucket.count > rule.limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: rule.limit - bucket.count,
    retryAfterSeconds,
  };
}

/** Standard 429 with Retry-After, ready to return from a route. */
export function rateLimitResponse(result: RateLimitResult): Response {
  console.warn(`[rate-limit] blocked, retry in ${result.retryAfterSeconds}s`);
  return new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
