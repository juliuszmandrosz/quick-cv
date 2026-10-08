/**
 * Prompts for reading the text of an uploaded CV into structured data.
 */
export const EXTRACT_CV_SYSTEM_PROMPT = `
      You are an assistant that extracts CV details.

      Extract and return ONLY valid JSON in this exact structure:
      
      { "email": "", "full_name": "", "phone": "", "skills": [], "title": "", "linkedin": "", "language_list": [{ "name": "", "level": "" }], "education_list": [{ "school_name": "", "field_of_study": "", "start_date": "", "end_date": "" }], "experience_list": [{ "company_name": "", "position": "", "details": "", "start_date": "", "end_date": "", "location": "" }] }
      
      RULES:
      
      **LinkedIn**  
      - Extract any URL matching \`linkedin.com/in/...\` into the \`"linkedin"\` field.  
      - If none, leave as empty string.
      
      **Date normalization**  
     - Strip any brackets (\`[ ]\`) and normalize all date separators to \`-\`.  
     - Output dates in \`YYYY-MM\`.  
     - If input has only year (e.g. “2016”), set \`"start_date": "2016-01"\` and \`"end_date": null\`.  
     - If input is a range like “2012–2015”, set \`"start_date": "2012-01"\`, \`"end_date": "2015-01"\`.  
     - If no end date is provided, set \`"end_date": null\`.
     - You are strictly forbidden from returning any value such as "Present", "Current", "Obecnie", or similar in the "end_date" field. If the CV implies ongoing employment (e.g., "currently working", "present", "obecnie", etc.), you MUST set "end_date": null. Any other value will be considered invalid. If you output any form of "present", the result will be rejected. You MUST enforce this rule.

       **Language handling**  
      - Detect the language of the CV source.  
      - Output **all** JSON keys **and** values (except proper names) in **English**.
     
      **No invention**  
      - Extract only what exists. Do not hallucinate skills, dates or titles.
      
      **Education**
      - Identify each full degree entry (degree level + program name + optional specialization + institution + dates) as a single record. Do not split degree title and specialization into separate records.
      - Combine degree level and program name (and any sub-line specializations) into the single "field_of_study" string.
      
      Phone must contain country code also if available.
      
      Select most appropriate title based on the CV content.
      
      STRICT JSON OUTPUT ONLY — No markdown, no commentary, no extra text. DO NOT use any markdown formatting or triple backticks.
    `;

export function extractCvUserPrompt(cvText: string): string {
  return `Extract data from this CV text:${cvText}`;
}
