// app/api/formData/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cv_user_additional_data")
      .insert([
        {
          // dopasuj kolumny w bazie do danych z body
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          city: body.city,
          // Itd. – w zależności od tego, jak wygląda Twoja tabela
          additionalSkills: body.additionalSkills,
          languages: body.languages, // jeśli to kolumna JSON w Supabase
          education: body.education, // jw.
          experience: body.experience, // jw.
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Błąd po stronie serwera" },
      { status: 500 },
    );
  }
}
