/**
 * Single source of truth for the OpenAI model used by the generation pipeline.
 * Keep every generation route on this constant so a model switch is one line.
 *
 * VERIFY THIS ID against /v1/models before trusting a deploy: an unknown model
 * fails the whole request at runtime, not at build time. The logs below print
 * the id OpenAI answers with, which is the real confirmation.
 */
export const CV_GENERATION_MODEL = "gpt-6.1-sol";

/**
 * Do NOT pass `temperature`, `top_p`, `logprobs` or `top_logprobs` to the
 * reasoning models. They reject those fields with a 400 as soon as they are
 * present - they do not merely ignore them. Steer the output through the
 * prompt instead. `max_completion_tokens` replaces `max_tokens`.
 */
export const MAX_COMPLETION_TOKENS = 6000;

/**
 * Verified against the API: "low" is accepted and roughly halves latency,
 * "none" is rejected. Use it where the model executes an existing plan; leave
 * the default where it has to reason its way to one.
 */
export const LOW_REASONING = "low" as const;

/**
 * Logs which model a generation route is about to call, and what the API
 * actually answered with. `completion.model` is the model id returned by
 * OpenAI itself, so it is the proof the request really ran on the model we
 * asked for. Cached prompt tokens are logged too: they cost ~90% less, so a
 * `cached` figure stuck at 0 means the prompt cache is not being hit.
 */
export function logModelUsage(
  route: string,
  completion?: {
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      prompt_tokens_details?: { cached_tokens?: number } | null;
      completion_tokens_details?: { reasoning_tokens?: number } | null;
    } | null;
  },
) {
  if (!completion) {
    console.log(`[${route}] requesting OpenAI model: ${CV_GENERATION_MODEL}`);
    return;
  }

  const usage = completion.usage ?? {};
  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const reasoning = usage.completion_tokens_details?.reasoning_tokens ?? 0;

  console.log(
    `[${route}] model: ${completion.model ?? "unknown"} ` +
      `(requested: ${CV_GENERATION_MODEL}) ` +
      `in=${usage.prompt_tokens ?? "?"} (cached=${cached}) ` +
      `out=${usage.completion_tokens ?? "?"} (reasoning=${reasoning})`,
  );
}

/**
 * The app stores CV languages as short codes ("pl", "en", "es"). Prompts are
 * far more reliable when they name the language explicitly, so resolve the code
 * to its name before interpolating it into a prompt.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  pl: "Polish",
  es: "Spanish",
};

export function resolveLanguageName(language?: string | null): string {
  if (!language) return LANGUAGE_NAMES.en;

  const code = language.trim().toLowerCase();
  return LANGUAGE_NAMES[code] ?? language.trim();
}

/**
 * Strips the database bookkeeping columns before a row is serialised into a
 * prompt. UUIDs alone cost ~15 tokens each and the model has no use for them,
 * nor for timestamps, foreign keys or photo URLs.
 */
const OMITTED_FIELDS = new Set([
  "id",
  "user_id",
  "cv_user_data_id",
  "generated_cv_id",
  "job_offer_id",
  "created_at",
  "updated_at",
  "profile_photo_url",
  "token_consumed",
]);

export function slimForPrompt<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => slimForPrompt(item)) as unknown as T;
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (OMITTED_FIELDS.has(key)) continue;
      if (val === null || val === undefined || val === "") continue;
      out[key] = slimForPrompt(val);
    }
    return out as unknown as T;
  }

  return value;
}
