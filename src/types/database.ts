export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          school_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          school_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          academic_year_id: string
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          created_at: string
          created_by: string
          id: string
          learning_area_id: string
          max_score: number
          name: string
          school_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          term_id: string
        }
        Insert: {
          academic_year_id: string
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          created_at?: string
          created_by: string
          id?: string
          learning_area_id: string
          max_score: number
          name: string
          school_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          term_id: string
        }
        Update: {
          academic_year_id?: string
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          created_at?: string
          created_by?: string
          id?: string
          learning_area_id?: string
          max_score?: number
          name?: string
          school_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_academic_year_id_academic_years_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_profiles_id_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_learning_area_id_learning_areas_id_fkey"
            columns: ["learning_area_id"]
            isOneToOne: false
            referencedRelation: "learning_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_term_id_terms_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teacher_assignments: {
        Row: {
          academic_year_id: string
          id: string
          stream_id: string
          teacher_id: string
        }
        Insert: {
          academic_year_id: string
          id?: string
          stream_id: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string
          id?: string
          stream_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teacher_assignments_4uXUQkeZcUtP_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teacher_assignments_stream_id_streams_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teacher_assignments_teacher_id_profiles_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          id: string
          level: number
          name: string
          school_id: string
        }
        Insert: {
          id?: string
          level: number
          name: string
          school_id: string
        }
        Update: {
          id?: string
          level?: number
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          grade: string
          id: string
          max_score: number
          min_score: number
          name: string
          remark: string | null
          school_id: string
        }
        Insert: {
          grade: string
          id?: string
          max_score: number
          min_score: number
          name: string
          remark?: string | null
          school_id: string
        }
        Update: {
          grade?: string
          id?: string
          max_score?: number
          min_score?: number
          name?: string
          remark?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_scales_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_areas: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
          school_id: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_areas_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_profiles_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_students_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_verified_by_profiles_id_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      schools: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      streams: {
        Row: {
          grade_id: string
          id: string
          name: string
        }
        Insert: {
          grade_id: string
          id?: string
          name: string
        }
        Update: {
          grade_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "streams_grade_id_grades_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          academic_year_id: string
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          stream_id: string
          student_id: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date: string
          stream_id: string
          student_id: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          stream_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_academic_year_id_academic_years_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_stream_id_streams_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_students_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_results: {
        Row: {
          assessment_id: string
          entered_by: string
          grade: string | null
          id: string
          remark: string | null
          score: number
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          entered_by: string
          grade?: string | null
          id?: string
          remark?: string | null
          score: number
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          entered_by?: string
          grade?: string | null
          id?: string
          remark?: string | null
          score?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_results_assessment_id_assessments_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_entered_by_profiles_id_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_student_id_students_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_number: string
          created_at: string
          full_name: string
          id: string
          school_id: string
          status: Database["public"]["Enums"]["student_status"]
        }
        Insert: {
          admission_number: string
          created_at?: string
          full_name: string
          id?: string
          school_id: string
          status?: Database["public"]["Enums"]["student_status"]
        }
        Update: {
          admission_number?: string
          created_at?: string
          full_name?: string
          id?: string
          school_id?: string
          status?: Database["public"]["Enums"]["student_status"]
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_teacher_assignments: {
        Row: {
          academic_year_id: string
          id: string
          learning_area_id: string
          stream_id: string
          teacher_id: string
        }
        Insert: {
          academic_year_id: string
          id?: string
          learning_area_id: string
          stream_id: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string
          id?: string
          learning_area_id?: string
          stream_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_teacher_assignments_BYLCh24iwKQZ_fkey"
            columns: ["learning_area_id"]
            isOneToOne: false
            referencedRelation: "learning_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_QYCoJ5i3eg75_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_stream_id_streams_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_teacher_id_profiles_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          end_date: string
          id: string
          start_date: string
          term_number: number
        }
        Insert: {
          academic_year_id: string
          end_date: string
          id?: string
          start_date: string
          term_number: number
        }
        Update: {
          academic_year_id?: string
          end_date?: string
          id?: string
          start_date?: string
          term_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_academic_years_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          school_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          school_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_roles_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_school_id_schools_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "principal" | "class_teacher" | "teacher" | "parent"
      assessment_status: "draft" | "published" | "archived"
      assessment_type:
        | "Classroom Assessment"
        | "School Based Assessment"
        | "National Examinations"
      student_status: "active" | "transferred" | "graduated" | "inactive"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["principal", "class_teacher", "teacher", "parent"],
      assessment_status: ["draft", "published", "archived"],
      assessment_type: [
        "Classroom Assessment",
        "School Based Assessment",
        "National Examinations",
      ],
      student_status: ["active", "transferred", "graduated", "inactive"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
