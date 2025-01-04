import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/database.types"; // Importuj swoją definicję Database

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("insert_cv_user_data", {
      email: body.email,
      full_name: body.full_name,
      phone: body.phone,
      city: body.city || null,
      additional_skills: body.additional_skills || null,
      profile_photo_url: body.profile_photo_url || null,
      language_list: body.language_list || [],
      education_list: body.education_list || [],
      experience_list: body.experience_list || [],
    } as Database["public"]["Functions"]["insert_cv_user_data"]["Args"]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
