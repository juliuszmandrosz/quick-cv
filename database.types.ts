export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cv_user_data: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          profile_photo_url: string | null
          skills: string[]
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          profile_photo_url?: string | null
          skills: string[]
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          profile_photo_url?: string | null
          skills?: string[]
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          cv_user_data_id: string
          end_date: string | null
          field_of_study: string
          id: string
          school_name: string
          start_date: string
        }
        Insert: {
          cv_user_data_id: string
          end_date?: string | null
          field_of_study: string
          id?: string
          school_name: string
          start_date: string
        }
        Update: {
          cv_user_data_id?: string
          end_date?: string | null
          field_of_study?: string
          id?: string
          school_name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company_name: string
          cv_user_data_id: string
          details: string | null
          end_date: string | null
          id: string
          position: string
          start_date: string
        }
        Insert: {
          company_name: string
          cv_user_data_id: string
          details?: string | null
          end_date?: string | null
          id?: string
          position: string
          start_date: string
        }
        Update: {
          company_name?: string
          cv_user_data_id?: string
          details?: string | null
          end_date?: string | null
          id?: string
          position?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_cv: {
        Row: {
          candidate_description: string
          created_at: string
          cv_user_data_id: string
          file_name: string | null
          id: string
          job_offer_id: string
          lang: string | null
          profile_photo_url: string | null
          title: string
          token_consumed: boolean
          user_id: string | null
        }
        Insert: {
          candidate_description: string
          created_at?: string
          cv_user_data_id: string
          file_name?: string | null
          id?: string
          job_offer_id: string
          lang?: string | null
          profile_photo_url?: string | null
          title: string
          token_consumed?: boolean
          user_id?: string | null
        }
        Update: {
          candidate_description?: string
          created_at?: string
          cv_user_data_id?: string
          file_name?: string | null
          id?: string
          job_offer_id?: string
          lang?: string | null
          profile_photo_url?: string | null
          title?: string
          token_consumed?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_cv_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_cv_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_education: {
        Row: {
          end_date: string | null
          field_of_study: string
          generated_cv_id: string
          id: string
          school_name: string
          start_date: string
        }
        Insert: {
          end_date?: string | null
          field_of_study: string
          generated_cv_id: string
          id?: string
          school_name: string
          start_date: string
        }
        Update: {
          end_date?: string | null
          field_of_study?: string
          generated_cv_id?: string
          id?: string
          school_name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_education_generated_cv_id_fkey"
            columns: ["generated_cv_id"]
            isOneToOne: false
            referencedRelation: "generated_cv"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_experience: {
        Row: {
          company_name: string
          end_date: string | null
          generated_cv_id: string
          id: string
          location: string | null
          position: string
          responsibilities: string[]
          start_date: string
        }
        Insert: {
          company_name: string
          end_date?: string | null
          generated_cv_id: string
          id?: string
          location?: string | null
          position: string
          responsibilities?: string[]
          start_date: string
        }
        Update: {
          company_name?: string
          end_date?: string | null
          generated_cv_id?: string
          id?: string
          location?: string | null
          position?: string
          responsibilities?: string[]
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_experience_generated_cv_id_fkey"
            columns: ["generated_cv_id"]
            isOneToOne: false
            referencedRelation: "generated_cv"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_experience_rewrite_instruction: {
        Row: {
          company_name: string
          generated_prompt_plan_id: string
          id: string
          instruction: string
        }
        Insert: {
          company_name: string
          generated_prompt_plan_id?: string
          id?: string
          instruction: string
        }
        Update: {
          company_name?: string
          generated_prompt_plan_id?: string
          id?: string
          instruction?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_experience_rewrite_inst_generated_prompt_plan_id_fkey"
            columns: ["generated_prompt_plan_id"]
            isOneToOne: false
            referencedRelation: "generated_prompt_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_language: {
        Row: {
          generated_cv_id: string
          id: string
          level: string
          name: string
        }
        Insert: {
          generated_cv_id: string
          id?: string
          level: string
          name: string
        }
        Update: {
          generated_cv_id?: string
          id?: string
          level?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_language_generated_cv_id_fkey"
            columns: ["generated_cv_id"]
            isOneToOne: false
            referencedRelation: "generated_cv"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_personal_data: {
        Row: {
          email: string
          full_name: string
          generated_cv_id: string
          id: string
          linkedin: string | null
          phone: string
        }
        Insert: {
          email: string
          full_name: string
          generated_cv_id: string
          id?: string
          linkedin?: string | null
          phone: string
        }
        Update: {
          email?: string
          full_name?: string
          generated_cv_id?: string
          id?: string
          linkedin?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_personal_data_generated_cv_id_fkey"
            columns: ["generated_cv_id"]
            isOneToOne: false
            referencedRelation: "generated_cv"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_prompt_plan: {
        Row: {
          ats_keywords: string[]
          created_at: string
          cv_user_data_id: string
          id: string
          power_skills: string[]
          soft_skills: string[]
          summary_focus: string
          technical_skills: string[]
          tone: string
          user_id: string | null
        }
        Insert: {
          ats_keywords: string[]
          created_at?: string
          cv_user_data_id?: string
          id?: string
          power_skills: string[]
          soft_skills: string[]
          summary_focus: string
          technical_skills: string[]
          tone: string
          user_id?: string | null
        }
        Update: {
          ats_keywords?: string[]
          created_at?: string
          cv_user_data_id?: string
          id?: string
          power_skills?: string[]
          soft_skills?: string[]
          summary_focus?: string
          technical_skills?: string[]
          tone?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_prompt_plan_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_skills: {
        Row: {
          generated_cv_id: string
          id: string
          power_skills: string[]
          soft_skills: string[]
          technical_skills: string[]
        }
        Insert: {
          generated_cv_id?: string
          id?: string
          power_skills: string[]
          soft_skills: string[]
          technical_skills: string[]
        }
        Update: {
          generated_cv_id?: string
          id?: string
          power_skills?: string[]
          soft_skills?: string[]
          technical_skills?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "generated_skills_generated_cv_id_fkey"
            columns: ["generated_cv_id"]
            isOneToOne: false
            referencedRelation: "generated_cv"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          created_at: string | null
          cv_user_data_id: string | null
          description: string | null
          id: string
          job_url: string | null
          requirements: string[] | null
          tasks: string[] | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cv_user_data_id?: string | null
          description?: string | null
          id?: string
          job_url?: string | null
          requirements?: string[] | null
          tasks?: string[] | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cv_user_data_id?: string | null
          description?: string | null
          id?: string
          job_url?: string | null
          requirements?: string[] | null
          tasks?: string[] | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          cv_user_data_id: string
          id: string
          level: string
          name: string
        }
        Insert: {
          cv_user_data_id?: string
          id?: string
          level: string
          name: string
        }
        Update: {
          cv_user_data_id?: string
          id?: string
          level?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "languages_cv_user_data_id_fkey"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan: string
          stripe_checkout_id: string | null
          tokens_left: number
          total_tokens: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan: string
          stripe_checkout_id?: string | null
          tokens_left: number
          total_tokens: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan?: string
          stripe_checkout_id?: string | null
          tokens_left?: number
          total_tokens?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_cv_user_data: {
        Args: {
          job_offer_id: string
          email: string
          full_name: string
          phone: string
          skills: string[]
          title: string
          profile_photo_url: string
          language_list: Database["public"]["CompositeTypes"]["language_input"][]
          education_list: Database["public"]["CompositeTypes"]["education_input"][]
          experience_list: Database["public"]["CompositeTypes"]["experience_input"][]
        }
        Returns: string
      }
      insert_prompt_plan_with_instructions: {
        Args: {
          technical_skills: string[]
          soft_skills: string[]
          power_skills: string[]
          ats_keywords: string[]
          tone: string
          summary_focus: string
          instructions: Database["public"]["CompositeTypes"]["instructions_input"][]
          cv_user_data_id: string
        }
        Returns: string
      }
      save_generated_cv: {
        Args: {
          cv_user_data_id: string
          cv_lang: string
          job_offer_id: string
          candidate_description: string
          title: string
          file_name: string
          personal_data: Json
          education_list: Json[]
          experience_list: Json[]
          language_list: Json[]
          skill_list: Json
          profile_photo_url: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      education_input: {
        school_name: string | null
        field_of_study: string | null
        start_date: string | null
        end_date: string | null
      }
      experience_input: {
        company_name: string | null
        position: string | null
        details: string | null
        start_date: string | null
        end_date: string | null
      }
      instructions_input: {
        company_name: string | null
        instruction: string | null
      }
      language_input: {
        name: string | null
        level: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
