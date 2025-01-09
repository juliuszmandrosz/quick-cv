import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { CvUserDataFull } from "@/types/cv-user-data-full";

export async function POST(request: Request) {
  try {
    const { cvUserDataId } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cv_user_data")
      .select(
        `
    *,
    job_offers(*),
    education(*),
    experience(*),
    languages(*)
  `,
      )
      .eq("id", cvUserDataId)
      .single<CvUserDataFull>();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: "User data not found",
      });
    }

    const jobOffer = data.job_offers[0];

    if (!jobOffer) {
      return NextResponse.json({
        success: false,
        error: "Job offer not found",
      });
    }

    const prompt = `
      Napisz zwięzłe, profesjonalne CV na podstawie poniższych danych użytkownika. Skup się na podkreśleniu umiejętności kandydata oraz jego doświadczenia zawodowego, 
      a także dopasowaniu do wymagań stanowiska. Nie kopiuj dosłownie opisu oferty pracy. 
      Zamiast tego, opracuj spersonalizowany profil zawodowy, który podkreśli kluczowe kompetencje kandydata w kontekście oferty pracy.
      
      DANE OSOBOWE
      - Imię i nazwisko: ${data.full_name ?? "brak danych"}
      - Umiejętności: ${data.additional_skills ?? "brak danych"}
      - Miasto: ${data.city ?? "brak danych"}
      - Email: ${data.email ?? "brak danych"}
      - Numer telefonu: ${data.phone ?? "brak danych"}
      
      OFERTA PRACY
      - Stanowisko: ${jobOffer.title ?? "brak danych"}
      - Opis: ${jobOffer.description ?? "brak danych"}
      - Wymagania: ${jobOffer.requirements?.join(", ") || "brak danych"}
      - Zakres obowiązków: ${jobOffer.tasks?.join(", ") || "brak danych"}
      
      WYKSZTAŁCENIE
      ${
        data.education?.length
          ? data.education
              .map(
                (edu, index) => `\
      ${index + 1}.
        - Nazwa szkoły: ${edu.school_name ?? "brak danych"}
        - Kierunek: ${edu.field_of_study ?? "brak danych"}
        - Data rozpoczęcia (rok): ${edu.start_date ?? "brak danych"}
        - Data zakończenia (rok): ${edu.end_date ?? "brak danych"}\
      `,
              )
              .join("\n")
          : "Brak danych o wykształceniu"
      }
      
      DOŚWIADCZENIE ZAWODOWE
      ${
        data.experience?.length
          ? data.experience
              .map(
                (exp, index) => `\
      ${index + 1}.
        - Stanowisko: ${exp.position ?? "brak danych"}
        - Firma: ${exp.company_name ?? "brak danych"}
        - Data rozpoczęcia (rok): ${exp.start_date ?? "brak danych"}
        - Data zakończenia (rok): ${exp.end_date ?? "brak danych"}
        - Zakres obowiązków: ${exp.details ?? "brak danych"}\
      `,
              )
              .join("\n")
          : "Brak danych o doświadczeniu"
      }
      
      JĘZYKI OBCE
      ${
        data.languages?.length
          ? data.languages
              .map(
                (lang, index) => `\
      ${index + 1}.
        - Język: ${lang.name ?? "brak danych"}
        - Poziom: ${lang.level ?? "brak danych"}\
      `,
              )
              .join("\n")
          : "Brak danych o językach obcych"
      }
      
      Zadanie: 
      Użyj powyższych informacji do stworzenia profesjonalnego CV, które będzie wyglądało atrakcyjnie dla pracodawcy. 
      Uwzględnij wymagania oferty pracy, ale nie kopiuj ich dosłownie. Zamiast tego podkreśl mocne strony kandydata i jego zdolności do sprostania obowiązkom. 
  `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Jesteś asystentem do pisania CV.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const cv = completion.choices[0].message;

    return NextResponse.json({
      success: true,
      cv: cv?.content ?? "No CV generated",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
