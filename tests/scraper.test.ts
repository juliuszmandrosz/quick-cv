import { describe, expect, it } from "vitest";
import scrapeJobOffer, { UnsupportedJobUrlError } from "@/utils/scraper";

describe("scrapeJobOffer URL guard", () => {
  // Every case below must be rejected before any network request is made.
  it.each([
    ["a lookalike domain", "https://nofluffjobs.com.attacker.example/job/1"],
    ["a domain with the name as a prefix", "https://evil-justjoin.it/offers/1"],
    ["an unrelated domain", "https://example.com/job"],
    ["plain http", "http://nofluffjobs.com/job/1"],
    ["a non-http protocol", "file:///etc/passwd"],
    ["an invalid URL", "not a url"],
  ])("rejects %s", async (_label, url) => {
    await expect(scrapeJobOffer(url)).rejects.toBeInstanceOf(
      UnsupportedJobUrlError,
    );
  });
});
