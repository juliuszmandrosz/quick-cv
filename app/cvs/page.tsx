import { createClient } from '@/utils/supabase/server'
import CVForm from "@/components/cvs/cv-form";
export const revalidate = 0; // Wyłącza domyślne cachowanie Next.js

export default async function Page() {
    const supabase = await createClient();
    const { data: cvs } = await supabase
        .from("cvs")
        .select()
        .setHeader('Cache-Control', 'no-cache')

    return <CVForm />;
}
