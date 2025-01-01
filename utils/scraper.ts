import { scrapeNoFluffJobs } from "@/utils/scrapers/no-fluff-jobs-scrapper";
import { Tables } from "@/database.types";

export default async function scrapeJobOffer(
  url: string,
): Promise<Tables<"job_offers">> {
  const domain = new URL(url).hostname;

  if (domain.includes("nofluffjobs.com")) {
    return await scrapeNoFluffJobs(url);
  } else {
    throw new Error("Nieobsługiwana domena: " + domain);
  }
}
