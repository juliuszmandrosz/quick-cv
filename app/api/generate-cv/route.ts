import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/database.types";

export async function POST(request: Request) {
  try {
    const { cvUserDataId } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const supabase = await createClient();

    const { data: userData, userDataError } = await supabase
      .from("cv_user_data")
      .select()
      .eq("id", cvUserDataId)
      .single<Tables<"cv_user_data">>();

    if (userDataError) {
      throw new Error(`Supabase error: ${userDataError.message}`);
    }

    if (!userData) {
      return NextResponse.json({
        success: false,
        error: "User data not found",
      });
    }

    const { data: jobOffer, jobOfferError } = await supabase
      .from("job_offers")
      .select()
      .eq("cv_user_data_id", cvUserDataId)
      .single<Tables<"job_offers">>();

    if (jobOfferError) {
      throw new Error(`Supabase error: ${jobOfferError.message}`);
    }

    if (!jobOffer) {
      return NextResponse.json({
        success: false,
        error: "Job offer not found",
      });
    }

    const prompt = `
      Napisz zwięzłe CV na bazie następujących danych użytkownika:
      Imię i nazwisko: ${userData.full_name}
      Umiejętności: ${userData.additional_skills}
      Miasto: ${userData.city}
      Email: ${userData.email}
      Numer telefonu: ${userData.phone}
      Oferta pracy:
      Stanowisko: ${jobOffer.title}
      Wymagania: ${jobOffer.requirements}
      Opis: ${jobOffer.description}
      Zakres obowiązków: ${jobOffer.tasks}
    `;

    // const openAiResponse = await openai.({
    //   model: "gpt-3.5-turbo", // lub inny model
    //   messages: [
    //     {
    //       role: "system",
    //       content: "Jesteś asystentem do pisania CV.",
    //     },
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   temperature: 0.7,
    // });

    // const { choices } = openAiResponse.data;
    // const generatedCV = choices[0]?.message?.content;

    return NextResponse.json({});
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
