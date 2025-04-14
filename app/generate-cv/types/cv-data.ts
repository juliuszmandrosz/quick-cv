export type CVData = {
  id: string;
  paymentCompleted: boolean;
  candidate_description: string;
  profile_photo_url: string;
  cv_user_data_id: string;
  generated_personal_data: {
    full_name: string;
    email: string;
    phone: string;
    city: string;
    additional_skills: string[];
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
  }[];
  generated_language: {
    name: string;
    level: string;
  }[];
};
