import { z } from "zod";

/**
 * Shape of the JSON the CV generation prompt asks the model for.
 *
 * The model is told to return exactly this, but nothing enforces it, so the
 * response is validated before any of it reaches the database. Fields the
 * template can live without are lenient (missing, null or empty all become
 * null / []), while the sections that make up a CV are required: a CV without
 * them is a failed generation, not a partial success.
 */
const optionalText = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);

const textList = z
  .array(z.string())
  .nullish()
  .transform((value) => value ?? []);

export const generatedCvSchema = z.object({
  generated_personal_data: z.object({
    full_name: z.string().min(1),
    email: optionalText,
    phone: optionalText,
    linkedin: optionalText,
  }),
  file_name: z.string().min(1),
  title: z.string().min(1),
  candidate_description: z.string().min(1),
  generated_experience: z.array(
    z.object({
      position: z.string(),
      company_name: z.string(),
      location: optionalText,
      start_date: optionalText,
      end_date: optionalText,
      responsibilities: textList,
    }),
  ),
  generated_education: z
    .array(
      z.object({
        school_name: z.string(),
        field_of_study: optionalText,
        start_date: optionalText,
        end_date: optionalText,
      }),
    )
    .nullish()
    .transform((value) => value ?? []),
  generated_language: z
    .array(z.object({ name: z.string(), level: optionalText }))
    .nullish()
    .transform((value) => value ?? []),
  generated_skills: z.object({
    technical_skills: textList,
    soft_skills: textList,
    power_skills: textList,
  }),
});

export type GeneratedCv = z.infer<typeof generatedCvSchema>;

/** Validates the raw JSON of a CV generation response. */
export function parseGeneratedCv(raw: string): GeneratedCv | null {
  return parseModelJson(raw, generatedCvSchema, "generate-cv");
}

/**
 * Shape of the JSON the extraction prompt asks for when reading an uploaded
 * CV. Everything is optional, since a sparse CV is still a valid upload.
 * Text columns that are NOT NULL in cv_user_data fall back to "" rather than
 * null, and list entries are passed through untouched to the database
 * function, exactly as the model returned them.
 */
const requiredText = z
  .string()
  .nullish()
  .transform((value) => value?.trim() ?? "");

const rawText = z.string().nullish();

export const extractedCvSchema = z.object({
  email: requiredText,
  full_name: requiredText,
  phone: requiredText,
  title: requiredText,
  linkedin: optionalText,
  skills: textList,
  language_list: z
    .array(z.object({ name: z.string(), level: rawText }).passthrough())
    .nullish()
    .transform((value) => value ?? []),
  education_list: z
    .array(
      z
        .object({
          school_name: rawText,
          field_of_study: rawText,
          start_date: rawText,
          end_date: rawText,
        })
        .passthrough(),
    )
    .nullish()
    .transform((value) => value ?? []),
  experience_list: z
    .array(
      z
        .object({
          company_name: rawText,
          position: rawText,
          details: rawText,
          start_date: rawText,
          end_date: rawText,
          location: rawText,
        })
        .passthrough(),
    )
    .nullish()
    .transform((value) => value ?? []),
});

export type ExtractedCv = z.infer<typeof extractedCvSchema>;

/** Validates the raw JSON of a CV extraction response. */
export function parseExtractedCv(raw: string): ExtractedCv | null {
  return parseModelJson(raw, extractedCvSchema, "extract-cv");
}

/**
 * Shape of the strategy the planning step returns. The skill lists, tone and
 * summary focus are what the generation step builds on, so they are required.
 * Rewrite instructions are optional per role.
 */
export const promptPlanSchema = z.object({
  technical_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  power_skills: z.array(z.string()),
  ats_keywords: z.array(z.string()),
  tone: z.string().min(1),
  summary_focus: z.string().min(1),
  experience_rewrite_instructions: z
    .array(z.object({ company_name: z.string(), instruction: z.string() }))
    .nullish()
    .transform((value) => value ?? []),
});

export type PromptPlan = z.infer<typeof promptPlanSchema>;

/** Validates the raw JSON of a planning response. */
export function parsePromptPlan(raw: string): PromptPlan | null {
  return parseModelJson(raw, promptPlanSchema, "generate-prompt-plan");
}

/**
 * Parses and validates raw model output against a schema. Returns null on any
 * problem. The reason is logged with issue paths only, so the CV content
 * itself (personal data) never ends up in the logs.
 */
function parseModelJson<T extends z.ZodTypeAny>(
  raw: string,
  schema: T,
  route: string,
): z.infer<T> | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error(`[${route}] model returned invalid JSON`);
    return null;
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    console.error(
      `[${route}] model output failed validation:`,
      result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
    return null;
  }

  return result.data;
}
