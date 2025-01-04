import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/database.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();

    let profilePhotoUrl: string | null = null;
    if (body.profile_photo_file) {
      const { name, content } = body.profile_photo_file;

      const fileName = `${Date.now()}-${name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile_photos") // Bucket 'profile-photos'
        .upload(fileName, Buffer.from(content, "base64"), {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({
          success: false,
          error: `Błąd uploadu zdjęcia: ${uploadError.message}`,
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(fileName);

      profilePhotoUrl = publicUrlData?.publicUrl || null;
    }

    const { data, error } = await supabase.rpc("insert_cv_user_data", {
      email: body.email,
      full_name: body.full_name,
      phone: body.phone,
      city: body.city || null,
      additional_skills: body.additional_skills || null,
      profile_photo_url: profilePhotoUrl || null,
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
