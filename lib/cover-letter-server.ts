import OpenAI from "openai";
import { CV_GENERATION_MODEL, logModelUsage, resolveLanguageName } from "@/lib/ai-model";
import { GeneratedCvFull } from "@/types/generated-cv-full";

export type CoverLetterResult = {
  fileName: string;
  coverLetter: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
};

/**
 * Loads the generated CV plus its job offer and writes a cover letter from
 * them. Shared by the JSON route and the PDF route so the prompt lives in one
 * place.
 */
export async function generateCoverLetterForCv(
  supabase: any,
  cvId: string,
  language?: string,
): Promise<CoverLetterResult> {
  const { data: cv, error: cvError } = await supabase
    .from("generated_cv")
    .select(
      `
      *,
      generated_education(*),
      generated_experience(*),
      generated_language(*),
      generated_personal_data(*),
      generated_skills(*)
    `,
    )
    .eq("id", cvId)
    .single();

  const cvData = cv as GeneratedCvFull | null;

  if (cvError || !cvData) {
    throw new Error(`Generated CV not found: ${cvError?.message ?? cvId}`);
  }

  const { data: jobOffer, error: jobError } = await supabase
    .from("job_offers")
    .select("*")
    .eq("id", cvData.job_offer_id)
    .single();

  if (jobError) {
    throw new Error(`Job offer not found: ${jobError.message}`);
  }

  const personalData: any = Array.isArray(cvData.generated_personal_data)
    ? ((cvData.generated_personal_data as any[])[0] ?? null)
    : cvData.generated_personal_data;

  // "pl" -> "Polish": the prompt must name the language, not its code.
  const cvLanguage = resolveLanguageName(language || cvData.lang);

  console.log(
    `[cover-letter] language: ${cvLanguage} ` +
      `(requested: ${language ?? "-"}, cv: ${cvData.lang ?? "-"})`,
  );

  const systemPrompt = `
    ##CONTEXT:
    You are an expert career writer. You write cover letters that sound like a
    real person wrote them, not a template and not an AI.

    ##GOAL:
    Write a cover letter in perfect ${cvLanguage}, tailored to the job offer,
    based strictly on the candidate's generated CV. Never invent experience,
    employers, skills or numbers that are not in the CV.

    ##RULES:
    - Write the ENTIRE letter in ${cvLanguage}. Every sentence, the greeting and
      the sign-off included. Never fall back to English unless ${cvLanguage} is
      English. Proper nouns (company and university names) keep their original
      form; everything else is written in ${cvLanguage}.
    - Address the hiring team of the company from the job offer. If the company
      name is unknown, use a neutral greeting appropriate for ${cvLanguage}.
    - 3 to 4 short paragraphs, maximum 300 words in total.
    - First person singular, confident and professional, no buzzword stuffing.
    - Paragraph 1: who the candidate is and why this specific role.
    - Paragraph 2: the two or three most relevant proofs from the CV, with the
      technologies and outcomes that match the job requirements.
    - Paragraph 3: motivation and what the candidate brings to this team.
    - Closing line with a call to action, then the sign-off with the candidate's
      name as the final short paragraph.
    - Use precise, restrained language. No markdown, no headers, no placeholders
      such as [Company].

    ##OUTPUT:
    Return only a valid JSON object, parsable by JSON.parse():
    {
      "file_name": "string",
      "cover_letter": "string"
    }
    "file_name" follows the CV naming convention: candidate name, job title and
    today's date, suffixed with "_Cover_Letter", e.g.
    "John_Doe_Software_Engineer_2023-10-01_Cover_Letter".
    "cover_letter" is the full letter text, paragraphs separated by "\\n\\n".
  `;

  const userPrompt = `
    TASK: Write a cover letter in perfect ${cvLanguage}.

    Candidate (generated CV):
    ${JSON.stringify({
      personal_data: personalData,
      title: cvData.title,
      candidate_description: cvData.candidate_description,
      experience: cvData.generated_experience,
      education: cvData.generated_education,
      skills: cvData.generated_skills,
      languages: cvData.generated_language,
    })}

    Job offer:
    ${JSON.stringify(jobOffer)}
  `;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  logModelUsage("cover-letter");

  const completion = await openai.chat.completions.create({
    model: CV_GENERATION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  logModelUsage("cover-letter", completion);

  const response = completion.choices[0].message?.content;
  if (!response) {
    throw new Error("No generated cover letter content");
  }

  const generated = JSON.parse(response);

  return {
    fileName: generated.file_name || `${cvData.file_name}_Cover_Letter`,
    coverLetter: generated.cover_letter,
    fullName: personalData?.full_name ?? "",
    title: cvData.title ?? null,
    email: personalData?.email ?? null,
    phone: personalData?.phone ?? null,
    linkedin: personalData?.linkedin ?? null,
  };
}
