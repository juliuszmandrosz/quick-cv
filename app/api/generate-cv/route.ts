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
      Użyj powyższych informacji do stworzenia profesjonalnego CV w formacie JSON, w języku angielskim (nagłówki równiez w jezyku angielskim), 
      które będzie wyglądało atrakcyjnie dla pracodawcy. 
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
      temperature: 0.4,
    });

    const cvResponse = completion.choices[0].message;

    if (!cvResponse?.content) {
      return NextResponse.json({ success: false, error: "No cv generated" });
    }

    let cvJson: {
      candidate_description: string;
      personal_data: {
        full_name: string;
        email: string;
        phone: string;
        city: string;
        additional_skills: string[];
      };
      education: {
        school_name: string;
        field_of_study: string;
        start_date: string;
        end_date: string;
      }[];
      experience: {
        position: string;
        company_name: string;
        start_date: string;
        end_date: string;
        responsibilities: string[];
      }[];
      languages: {
        name: string;
        level: string;
      }[];
    } = JSON.parse(cvResponse.content);

    const {
      candidate_description,
      personal_data,
      education,
      experience,
      languages,
    } = cvJson;

    const { data: generatedCvId, error: transactionError } = await supabase.rpc(
      "save_generated_cv",
      {
        cv_user_data_id: cvUserDataId,
        job_offer_id: jobOffer.id,
        candidate_description,
        personal_data: {
          full_name: personal_data.full_name,
          email: personal_data.email,
          phone: personal_data.phone,
          city: personal_data.city,
          additional_skills: personal_data.additional_skills,
        },
        education_list: education.map((edu) => ({
          school_name: edu.school_name,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date,
          end_date: edu.end_date,
        })),
        experience_list: experience.map((exp) => ({
          position: exp.position,
          company_name: exp.company_name,
          start_date: exp.start_date,
          end_date: exp.end_date,
          responsibilities: exp.responsibilities,
        })),
        language_list: languages.map((lang) => ({
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

    return NextResponse.json({
      success: true,
      cv: cvJson ?? "No CV generated",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
