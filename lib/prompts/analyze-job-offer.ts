/**
 * Prompts for turning a pasted job description into a structured job offer.
 */
export const ANALYZE_JOB_OFFER_SYSTEM_PROMPT = `
      You are an expert in job offers and CV analysis. Your task is to analyze a job offer and a CV, and generate valid JSON data.
      You must return ONLY a valid JSON object adhering strictly to the following structure. No other text, commentary, explanations, or markdown formatting should precede or follow the JSON output.
    `;

export function analyzeJobOfferUserPrompt(jobDesc: string): string {
  return `
      Generate a JOB OFFER in the following JSON format:
      {
        "title": "string", 
        "requirements": ["string"], 
        "description": "string", 
        "tasks": ["string"]
      }
      
      JOB OFFER:
      ${JSON.stringify(jobDesc)}
    `;
}
