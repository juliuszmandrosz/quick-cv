import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import {
  CV_GENERATION_MODEL,
  logModelUsage,
  resolveLanguageName,
} from "@/lib/ai-model";
import { GeneratedCvFull } from "@/types/generated-cv-full";

export async function POST(request: Request) {
  const errorMessage =
    "Error generating cover letter, please try again. If the problem persists, contact support.";

  try {
    const { cvId, language } = await request.json();

    if (!cvId) {
      return NextResponse.json({
        success: false,
        error: "cvId is required",
        status: 400,
      });
    }

    const supabase = await createClient();

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
      .single<GeneratedCvFull>();

    if (cvError || !cv) {
      console.error("Generated CV select error:", cvError?.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    const { data: jobOffer, error: jobError } = await supabase
      .from("job_offers")
      .select("*")
      .eq("id", cv.job_offer_id)
      .single();

    if (jobError) {
      console.error("Job offer select error:", jobError.message);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 500,
      });
    }

    const personalData = Array.isArray(cv.generated_personal_data)
      ? ((cv.generated_personal_data as any[])[0] ?? null)
      : cv.generated_personal_data;

    // "pl" -> "Polish": the prompt must name the language, not its code.
    const cvLanguage = resolveLanguageName(language || cv.lang);

    console.log(
      `[generate-cover-letter] language: ${cvLanguage} ` +
        `(requested: ${language ?? "-"}, cv: ${cv.lang ?? "-"})`,
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
      - Closing line with a call to action and a sign-off with the candidate's name.
      - Plain text only. No markdown, no headers, no placeholders such as [Company].

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
        title: cv.title,
        candidate_description: cv.candidate_description,
        experience: cv.generated_experience,
        education: cv.generated_education,
        skills: cv.generated_skills,
        languages: cv.generated_language,
      })}

      Job offer:
      ${JSON.stringify(jobOffer)}
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    logModelUsage("generate-cover-letter");

    const coverLetterCompletion = await openai.chat.completions.create({
      model: CV_GENERATION_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    logModelUsage("generate-cover-letter", coverLetterCompletion);

    const response = coverLetterCompletion.choices[0].message?.content;
    if (!response) {
      return NextResponse.json({
        success: false,
        error: "No generated cover letter content",
        status: 500,
      });
    }

    let generated;
    try {
      generated = JSON.parse(response);
    } catch (jsonError: any) {
      console.error("Error parsing generated cover letter JSON:", jsonError);
      return NextResponse.json({
        success: false,
        error: "Failed to parse generated cover letter response: " + response,
      });
    }

    return NextResponse.json({
      success: true,
      fileName: generated.file_name || `${cv.file_name}_Cover_Letter`,
      coverLetter: generated.cover_letter,
    });
  } catch (err: any) {
    console.error("Generate cover letter error:", err);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      status: 500,
    });
  }
}
