import { Tables } from "@/database.types";
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeJustJoinIt(url: string) {
  const { data: html } = await axios.get<string>(url);
  const $ = cheerio.load(html);

  const og = $('meta[property="og:title"]').attr("content") || "";
  const title = og.split("|")[0].trim() || $("h1").first().text().trim();

  const descHeader = $("h3").filter(
    (_, el) => $(el).text().trim() === "Job description",
  );
  const descContainer = descHeader.parent().next().next().next();
  const description = descContainer
    .find("p, li")
    .map((_, p) => $(p).text().trim())
    .get()
    .join("\n");

  const techHeader = $("h3").filter(
    (_, el) => $(el).text().trim() === "Tech stack",
  );
  const techContainer = techHeader.next().next();
  const requirements = techContainer
    .find("h4")
    .map((_, h4) => $(h4).text().trim())
    .get();

  const tasks: string[] = [];

  return {
    title,
    description,
    requirements,
    tasks,
  } as Tables<"job_offers">;
}
