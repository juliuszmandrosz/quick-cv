/**
 * Single source of truth for the OpenAI model used by the generation pipeline
 * (prompt plan -> CV -> cover letter). Keep every generation route on this
 * constant so a model switch is a one-line change.
 */
export const CV_GENERATION_MODEL = "gpt-6-astra";

/**
 * Do NOT pass `temperature`, `top_p`, `logprobs` or `top_logprobs` to this
 * model. Astra rejects those fields with a 400 as soon as they are present -
 * it does not merely ignore them. Steer the output through the prompt instead.
 * `max_completion_tokens` replaces `max_tokens` if a cap is ever needed.
 */

/**
 * Logs which model a generation route is about to call, and what the API
 * actually answered with. `completion.model` is the model id returned by
 * OpenAI itself, so it is the proof the request really ran on the model we
 * asked for (it can differ if the alias resolves to a dated snapshot).
 */
export function logModelUsage(
  route: string,
  completion?: { model?: string; usage?: unknown },
) {
  if (!completion) {
    console.log(`[${route}] requesting OpenAI model: ${CV_GENERATION_MODEL}`);
    return;
  }

  console.log(
    `[${route}] OpenAI responded with model: ${completion.model ?? "unknown"} ` +
      `(requested: ${CV_GENERATION_MODEL})`,
    completion.usage ?? {},
  );
}

/**
 * The app stores CV languages as short codes ("pl", "en", "es"). Prompts are
 * far more reliable when they name the language explicitly, so resolve the code
 * to its English name before interpolating it into a prompt.
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
