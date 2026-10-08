import { scrapeNoFluffJobs } from "@/utils/scrapers/no-fluff-jobs-scrapper";
import { Tables } from "@/database.types";
import { scrapeJustJoinIt } from "@/utils/scrapers/just-join-it-scrapper";

/** Thrown for input the caller can fix, so the route can answer 400 with the message. */
export class UnsupportedJobUrlError extends Error {}

export default async function scrapeJobOffer(
  url: string,
): Promise<Tables<"job_offers">> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UnsupportedJobUrlError("Invalid URL");
  }
  const { protocol, hostname: domain } = parsed;

  // Match the exact domain or a real subdomain of it. A substring check would
  // let "nofluffjobs.com.attacker.example" through and make the server fetch
  // an arbitrary host.
  const isDomain = (base: string) =>
    domain === base || domain.endsWith(`.${base}`);

  if (protocol !== "https:") {
    throw new UnsupportedJobUrlError("Unsupported protocol: " + protocol);
  }

  if (isDomain("nofluffjobs.com")) {
    return await scrapeNoFluffJobs(url);
  } else if (isDomain("justjoin.it")) {
    return await scrapeJustJoinIt(url);
  } else {
    throw new UnsupportedJobUrlError("Unsupported domain: " + domain);
  }
}
