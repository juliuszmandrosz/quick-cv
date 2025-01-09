import { Tables } from "@/database.types";

export type CvUserDataFull = Tables<"cv_user_data"> & {
  job_offers: Tables<"job_offers">[];
  education: Tables<"education">[];
  experience: Tables<"experience">[];
  languages: Tables<"languages">[];
};
