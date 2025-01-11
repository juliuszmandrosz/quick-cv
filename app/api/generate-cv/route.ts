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

    const systemPrompt = `
      Jesteś asystentem do pisania CV. 
      Zwróć odpowiedź TYLKO jako poprawny JSON – bez dodatkowych opisów, bez bloków kodu i bez markdown. 
      Upewnij się, że klucze w JSON mają dokładnie takie nazwy, jak w podanym schemacie.
    `;

    const prompt = `
      Napisz zwięzłe, profesjonalne CV w formacie JSON na podstawie poniższych danych użytkownika. Skup się na podkreśleniu umiejętności kandydata oraz jego
      doświadczenia zawodowego, 
      a także dopasowaniu do wymagań stanowiska. Nie kopiuj dosłownie opisu oferty pracy. 
      Zamiast tego, opracuj spersonalizowany profil zawodowy, który podkreśli kluczowe kompetencje kandydata w kontekście oferty pracy.
      Jeśli czegoś brakuje w danych kandydata, uzupełnij na podstawie wymagań oferty.
    
    {
      "personal_data": {
        "full_name": "",
        "email": "",
        "phone": "",
        "city": "",
        "additional_skills": []
      },
      "candidate_description": "",
      "education": [
        {
          "school_name": "",
          "field_of_study": "",
          "start_date": "",
          "end_date": ""
        }
      ],
      "experience": [
        {
          "position": "",
          "company_name": "",
          "start_date": "",
          "end_date": "",
          "responsibilities": []
        }
      ],
      "languages": [
        {
          "name": "",
          "level": ""
        }
      ]
    }
      
      DANE OSOBOWE
      - Imię i nazwisko: ${data.full_name}
      - Dodatkowe umiejętności (dodatkowe od uytkownika, dodaj równiez niezbedne na podstawie oferty pracy): 
        ${data.additional_skills ?? "Uzupełnij na podstawie oferty pracy"}
      - Miasto: ${data.city ?? "zostaw puste"}
      - Email: ${data.email}
      - Numer telefonu: ${data.phone}
      
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
        - Nazwa szkoły: ${edu.school_name}
        - Kierunek: ${edu.field_of_study}
        - Data rozpoczęcia (rok): ${edu.start_date}
        - Data zakończenia (rok): ${edu.end_date ?? "w trakcie"}\
      `,
              )
              .join("\n")
          : "Brak danych o wykształceniu, zostaw puste"
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
        - Data rozpoczęcia (rok i miesiąc): ${exp.start_date ?? "brak danych"}
        - Data zakończenia (rok i miesiąc): ${exp.end_date ?? "w trakcie"}
        - Zakres obowiązków (to jest dodatkowe, na podstawie tego dopasuj to do oferty pracy): 
        ${exp.details ?? "uzupełnij na podstawie oferty pracy"}\
      `,
              )
              .join("\n")
          : "Brak danych o doświadczeniu, wymyśl na podstawie oferty pracy"
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
          : "zostaw puste"
      }
      
      Zadanie: 
      Użyj powyższych informacji do stworzenia profesjonalnego CV w formacie JSON, które będzie wyglądało atrakcyjnie dla pracodawcy. 
      Uwzględnij wymagania oferty pracy, ale nie kopiuj ich dosłownie. Zamiast tego podkreśl mocne strony kandydata i jego zdolności do sprostania obowiązkom. 
      
      Nie używaj polskich znaków w kluczach JSON. Nie dodawaj żadnych dodatkowych pól.
      Nie dodawaj code blocków, markdown itp. Po prostu zwróć czysty JSON.
  `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
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
