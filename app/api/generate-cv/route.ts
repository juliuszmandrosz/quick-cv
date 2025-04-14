import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { CvUserDataFull } from "@/types/cv-user-data-full";
import { CVData } from "@/app/generate-cv/types/cv-data";

export async function POST(request: Request) {
  try {
    const { cvUserDataId, language } = await request.json();

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
      Napisz zwięzłe, profesjonalne CV w formacie JSON w języku ${language ?? "en"} na podstawie poniższych danych użytkownika. 
      Skup się na podkreśleniu umiejętności kandydata oraz jego doświadczenia zawodowego, 
      a także dopasowaniu do wymagań stanowiska. Nie kopiuj dosłownie opisu oferty pracy. 
      Zamiast tego, opracuj spersonalizowany profil zawodowy, który podkreśli kluczowe kompetencje kandydata w kontekście oferty pracy.
      Jeśli czegoś brakuje w danych kandydata, uzupełnij na podstawie wymagań oferty.
      
      DANE OSOBOWE
      - Imię i nazwisko: ${data.full_name}
      - Dodatkowe umiejętności (dodatkowe od uytkownika, dodaj równiez niezbedne na podstawie oferty pracy): 
        ${data.additional_skills ?? "Uzupełnij na podstawie oferty pracy"}
      - Miasto: ${data.city ?? "zostaw puste"}
      - Email: ${data.email}
      - Numer telefonu: ${data.phone}
      
      OFERTA PRACY (przetłumacz nagłówek w zależności od języka ${language})
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
        - Data zakończenia (rok): ${edu.end_date}\
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
        - Data zakończenia (rok i miesiąc): ${exp.end_date}
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
      Użyj powyższych informacji do stworzenia profesjonalnego CV w formacie JSON, w języku ${language ?? "en"}, 
      które będzie wyglądało atrakcyjnie dla pracodawcy. 
      Uwzględnij wymagania oferty pracy, ale nie kopiuj ich dosłownie. Zamiast tego podkreśl mocne strony kandydata i jego zdolności do sprostania obowiązkom. 
      Do kazdego doswiadczenia wygeneruj conajmniej 4 obowiazki.
      
      Nie używaj polskich znaków w kluczach JSON. Nie dodawaj żadnych dodatkowych pól.
      Nie dodawaj code blocków, markdown itp. Po prostu zwróć czysty JSON.
      Zwróć response w dokładnie takim formacie json jak ponizej:
      {
      "generated_personal_data": {
        "full_name": "",
        "email": "",
        "phone": "",
        "city": "",
        "additional_skills": []
      },
      "candidate_description": "",
      "generated_education": [
        {
          "school_name": "",
          "field_of_study": "",
          "start_date": "",
          "end_date": ""
        }
      ],
      "generated_experience": [
        {
          "position": "",
          "company_name": "",
          "start_date": "",
          "end_date": "",
          "responsibilities": []
        }
      ],
      "generated_language": [
        {
          "name": "",
          "level": ""
        }
      ]
    }
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
      temperature: 0.4,
    });

    const cvResponse = completion.choices[0].message;

    if (!cvResponse?.content) {
      return NextResponse.json({ success: false, error: "No cv generated" });
    }

    console.log(JSON.parse(cvResponse.content));

    console.log("aaaaaa");

    let cvJson: CVData = JSON.parse(cvResponse.content);

    const {
      candidate_description,
      generated_personal_data,
      generated_education,
      generated_experience,
      generated_language,
    } = cvJson;

    console.log(cvJson);

    const { data: generatedCvId, error: transactionError } = await supabase.rpc(
      "save_generated_cv",
      {
        cv_user_data_id: cvUserDataId,
        job_offer_id: jobOffer.id,
        candidate_description,
        personal_data: {
          full_name: generated_personal_data.full_name,
          email: generated_personal_data.email,
          phone: generated_personal_data.phone,
          city: generated_personal_data.city,
          additional_skills: generated_personal_data.additional_skills,
        },
        education_list: generated_education.map((edu) => ({
          school_name: edu.school_name,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date,
          end_date: edu.end_date,
        })),
        experience_list: generated_experience.map((exp) => ({
          position: exp.position,
          company_name: exp.company_name,
          start_date: exp.start_date,
          end_date: exp.end_date,
          responsibilities: exp.responsibilities,
        })),
        language_list: generated_language.map((lang) => ({
          name: lang.name,
          level: lang.level,
        })),
      },
    );

    if (transactionError) {
      return NextResponse.json({
        success: false,
        error: transactionError.message,
      });
    }

    if (!cvJson) {
      return NextResponse.json({ success: false, error: "No CV generated" });
    }

    cvJson.id = generatedCvId;

    console.log(cvJson.id);

    return NextResponse.json({
      success: true,
      cvData: cvJson,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
