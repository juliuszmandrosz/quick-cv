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
          additional_skills: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          profile_photo_url: string | null
          user_id: string | null
        }
        Insert: {
          additional_skills?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          profile_photo_url?: string | null
          user_id?: string | null
        }
        Update: {
          additional_skills?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          profile_photo_url?: string | null
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
          {
            foreignKeyName: "experience_cv_user_data_id_fkey1"
            columns: ["cv_user_data_id"]
            isOneToOne: false
            referencedRelation: "cv_user_data"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          created_at: string | null
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
          description?: string | null
          id?: string
          job_url?: string | null
          requirements?: string[] | null
          tasks?: string[] | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_cv_user_data: {
        Args: {
          email: string
          full_name: string
          phone: string
          city?: string
          additional_skills?: string
          profile_photo_url?: string
          language_list?: Database["public"]["CompositeTypes"]["language_input"][]
          education_list?: Database["public"]["CompositeTypes"]["education_input"][]
          experience_list?: Database["public"]["CompositeTypes"]["experience_input"][]
        }
        Returns: undefined
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
      language_input: {
        name: string | null
        level: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
