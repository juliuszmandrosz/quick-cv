import { scrapeNoFluffJobs } from "@/utils/scrapers/no-fluff-jobs-scrapper";
import { Tables } from "@/database.types";
import { scrapeJustJoinIt } from "@/utils/scrapers/just-join-it-scrapper";

export default async function scrapeJobOffer(
  url: string,
): Promise<Tables<"job_offers">> {
  const domain = new URL(url).hostname;

  if (domain.includes("nofluffjobs.com")) {
    return await scrapeNoFluffJobs(url);
  } else if (domain.includes("justjoin.it")) {
    return await scrapeJustJoinIt(url);
  } else {
    throw new Error("Unsupported domain: " + domain);
  }
}
