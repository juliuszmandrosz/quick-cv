import { NextResponse } from "next/server";
import scrapeJobOffer from "@/utils/scraper";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/database.types";

export async function POST(request: Request) {
  try {
    const { jobUrl } = await request.json();

    if (!jobUrl || typeof jobUrl !== "string") {
      return NextResponse.json({
        success: false,
        error: "Brak poprawnego URL.",
      });
    }

    const parsedData = await scrapeJobOffer(jobUrl);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_offers")
      .insert<Tables<"job_offers">>({
        ...parsedData,
        job_url: jobUrl,
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Błąd podczas przetwarzania linku:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
