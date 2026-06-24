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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          match_score: number
          status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          match_score?: number
          status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          candidate_unlocks: number
          created_at: string
          id: string
          job_post_limit: number
          name: string
          price: number
        }
        Insert: {
          candidate_unlocks: number
          created_at?: string
          id?: string
          job_post_limit: number
          name: string
          price: number
        }
        Update: {
          candidate_unlocks?: number
          created_at?: string
          id?: string
          job_post_limit?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          company_profile_id: string
          created_at: string
          id: string
          is_pinned: boolean
          job_id: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          company_profile_id: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          job_id?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          company_profile_id?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          job_id?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          company_bio: string | null
          company_name: string
          company_size: string | null
          created_at: string
          employer_id: string
          id: string
          industry: string | null
          logo_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          company_bio?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          employer_id: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          company_bio?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          employer_id?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          employer_id: string
          employment_type: string
          hourly_rate: number
          id: string
          job_id: string | null
          start_date: string
          status: string
          updated_at: string
          weekly_hours: number
          worker_id: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          employment_type: string
          hourly_rate: number
          id?: string
          job_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          weekly_hours: number
          worker_id: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          employment_type?: string
          hourly_rate?: number
          id?: string
          job_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          weekly_hours?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings_overview: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_highlighted: boolean
          month_name: string
          worker_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_highlighted?: boolean
          month_name: string
          worker_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_highlighted?: boolean
          month_name?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_overview_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_credits: {
        Row: {
          created_at: string
          credits_balance: number
          employer_id: string
          id: string
          job_posts_used: number
          unlocks_used: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          employer_id: string
          id?: string
          job_posts_used?: number
          unlocks_used?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          employer_id?: string
          id?: string
          job_posts_used?: number
          unlocks_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_credits_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          employer_id: string
          id: string
          job_posts_used: number
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          unlocks_used: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          employer_id: string
          id?: string
          job_posts_used?: number
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          unlocks_used?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          employer_id?: string
          id?: string
          job_posts_used?: number
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          unlocks_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_subscriptions_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_testimonials: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          rating: number
          review_text: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          rating: number
          review_text: string
          worker_id: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          rating?: number
          review_text?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_testimonials_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "employer_testimonials_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          question?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          clicks_count: number
          created_at: string
          description: string
          employer_id: string
          employment_type: string
          hiring_manager_email: string | null
          hiring_manager_name: string | null
          hiring_manager_role: string | null
          hours_per_week: number
          id: string
          is_premium_path: boolean
          monthly_salary: number
          skills: string[]
          status: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          clicks_count?: number
          created_at?: string
          description: string
          employer_id: string
          employment_type: string
          hiring_manager_email?: string | null
          hiring_manager_name?: string | null
          hiring_manager_role?: string | null
          hours_per_week: number
          id?: string
          is_premium_path?: boolean
          monthly_salary: number
          skills?: string[]
          status?: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          clicks_count?: number
          created_at?: string
          description?: string
          employer_id?: string
          employment_type?: string
          hiring_manager_email?: string | null
          hiring_manager_name?: string | null
          hiring_manager_role?: string | null
          hours_per_week?: number
          id?: string
          is_premium_path?: boolean
          monthly_salary?: number
          skills?: string[]
          status?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Record<string, unknown> | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Record<string, unknown> | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Record<string, unknown> | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          conversation_id: string
          id: string
          last_read_at: string | null
          profile_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          last_read_at?: string | null
          profile_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          last_read_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_workers: {
        Row: {
          employer_id: string
          id: string
          pinned_at: string
          worker_id: string
        }
        Insert: {
          employer_id: string
          id?: string
          pinned_at?: string
          worker_id: string
        }
        Update: {
          employer_id?: string
          id?: string
          pinned_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_workers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          availability: string | null
          avatar_url: string | null
          bio: string | null
          birth_year: number | null
          created_at: string
          email: string | null
          experience_years: number | null
          first_name: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_remote: boolean | null
          is_top_rated: boolean | null
          last_name: string | null
          location: string | null
          portfolio_url: string | null
          professional_title: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          auth_user_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_remote?: boolean | null
          is_top_rated?: boolean | null
          last_name?: string | null
          location?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          auth_user_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_remote?: boolean | null
          is_top_rated?: boolean | null
          last_name?: string | null
          location?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_company: string
          author_name: string
          author_title: string
          avatar_url: string | null
          created_at: string
          display_order: number
          id: string
          quote: string
        }
        Insert: {
          author_company: string
          author_name: string
          author_title: string
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          quote: string
        }
        Update: {
          author_company?: string
          author_name?: string
          author_title?: string
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          quote?: string
        }
        Relationships: []
      }
      unlocked_profiles: {
        Row: {
          application_id: string | null
          candidate_id: string | null
          credits_deducted: number
          employer_id: string
          id: string
          unlocked_at: string
        }
        Insert: {
          application_id?: string | null
          candidate_id?: string | null
          credits_deducted?: number
          employer_id: string
          id?: string
          unlocked_at?: string
        }
        Update: {
          application_id?: string | null
          candidate_id?: string | null
          credits_deducted?: number
          employer_id?: string
          id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_projects: {
        Row: {
          created_at: string
          description: string
          id: string
          role: string
          title: string
          worker_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          role: string
          title: string
          worker_id: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          role?: string
          title?: string
          worker_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "worker_projects_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_skills: {
        Row: {
          category: string | null
          created_at: string
          experience_duration: string | null
          id: string
          proficiency: number
          proficiency_label: string | null
          skill_name: string
          worker_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          experience_duration?: string | null
          id?: string
          proficiency: number
          proficiency_label?: string | null
          skill_name: string
          worker_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          experience_duration?: string | null
          id?: string
          proficiency?: number
          proficiency_label?: string | null
          skill_name?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      job_posts: {
        Row: {
          company_name: string | null
          created_at: string | null
          description: string | null
          employer_id: string | null
          employment_type: string | null
          hours_per_week: number | null
          id: string | null
          is_premium_path: boolean | null
          logo_url: string | null
          monthly_salary: number | null
          skills: string[] | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      increment_job_clicks: {
        Args: { target_job_id: string }
        Returns: undefined
      }
      increment_job_views: {
        Args: { target_job_id: string }
        Returns: undefined
      }
      is_conversation_member: {
        Args: { conv_id: string; user_id: string }
        Returns: boolean
      }
      seed_worker_dashboard_data: {
        Args: { worker_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "employer" | "worker" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      user_role: ["employer", "worker", "admin"],
    },
  },
} as const
