import { Tables } from "@/database.types";
import * as cheerio from "cheerio";
import axios from "axios";

export async function scrapeNoFluffJobs(url: string) {
  const { data: html } = await axios.get<string>(url);
  const $ = cheerio.load(html);

  const title = $("div.posting-details-head h1").text()?.trim();

  const requirements: string[] = [];
  $("#posting-requirements section ul li").each((_, element) => {
    requirements.push($(element).text().trim());
  });
  $('[data-cy-section="JobOffer_Requirements"] ul li').each((_, element) => {
    requirements.push($(element).text().trim());
  });

  const description = $('section[data-cy-section="JobOffer_Project"]')
    .find("nfj-read-more")
    .text()
    ?.trim();

  const tasks: string[] = [];
  $('[data-cy-section="JobOffer_DailyTasks"] ol li').each((_, element) => {
    tasks.push($(element).text().trim());
  });

  return {
    title,
    description,
    requirements,
    tasks,
  } as Tables<"job_offers">;
}
