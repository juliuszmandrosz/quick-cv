import { Tables } from "@/database.types";

export type GeneratedCvFull = Tables<"generated_cv"> & {
  generated_personal_data: Tables<"generated_personal_data">;
  generated_education: Tables<"generated_education">[];
  generated_experience: Tables<"generated_experience">[];
  generated_language: Tables<"generated_language">[];
  generated_skills: Tables<"generated_skills">;
  job_url: string;
};
