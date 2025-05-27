import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/database.types";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { jobDesc } = await request.json();

    if (!jobDesc || typeof jobDesc !== "string") {
      return NextResponse.json({
        success: false,
        error: "Job desc is required",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
      You are an expert in job offers and CV analysis. Your task is to analyze a job offer and a CV, and generate valid JSON data.
      You must return ONLY a valid JSON object adhering strictly to the following structure. No other text, commentary, explanations, or markdown formatting should precede or follow the JSON output.
    `;

    const userPrompt = `
      Generate a JOB OFFER in the following JSON format:
      {
        "title": "string", 
        "requirements": ["string"], 
        "description": "string", 
        "tasks": ["string"]
      }
      
      JOB OFFER:
      ${JSON.stringify(jobDesc)}
    `;

    const planCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const jobOffer = JSON.parse(
      planCompletion.choices[0].message?.content || "{}",
    );

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_offers")
      .insert<Tables<"job_offers">>({
        ...jobOffer,
      })
      .select("id");

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error analyzing the job description", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
