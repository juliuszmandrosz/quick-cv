/**
 * Single source of truth for the OpenAI model used by the generation pipeline
 * (prompt plan -> CV -> cover letter). Keep every generation route on this
 * constant so a model switch is a one-line change.
 */
export const CV_GENERATION_MODEL = "gpt-6-astra";

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
