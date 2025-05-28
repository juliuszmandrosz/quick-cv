export type CVData = {
  id: string;
  candidate_description: string;
  profile_photo_url: string;
  cv_user_data_id: string;
  title: string;
  file_name: string;
  job_url: string;
  token_consumed: boolean;
  generated_skills: {
    soft_skills: string[];
    technical_skills: string[];
    power_skills: string[];
  };
  generated_personal_data: {
    full_name: string;
    email: string;
    phone: string;
    linkedin?: string | null;
  };
  generated_education: {
    school_name: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
  }[];
  generated_experience: {
    position: string;
    company_name: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
    location?: string | null;
  }[];
  generated_language: {
    name: string;
    level: string;
  }[];
};
