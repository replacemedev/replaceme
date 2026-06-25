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
          application_subject: string | null
          candidate_id: string
          contact_methods: Json
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          match_score: number
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_subject?: string | null
          candidate_id: string
          contact_methods?: Json
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          match_score?: number
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_subject?: string | null
          candidate_id?: string
          contact_methods?: Json
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          status?: Database["public"]["Enums"]["application_status"]
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
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
      audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
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
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "chat_threads_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_threads_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "company_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "company_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
            foreignKeyName: "contracts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "contracts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "earnings_overview_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "earnings_overview_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "employer_credits_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "employer_credits_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
            foreignKeyName: "employer_subscriptions_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "employer_subscriptions_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "employer_testimonials_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "employer_testimonials_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          location: string | null
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
          location?: string | null
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
          location?: string | null
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
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          metadata: Json
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
          metadata?: Json
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
          metadata?: Json
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
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
            foreignKeyName: "pinned_workers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "pinned_workers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "pinned_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "pinned_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          auth_user_id: string | null
          availability: string | null
          avatar_url: string | null
          bio: string | null
          birth_year: number | null
          created_at: string
          cv_url: string | null
          email: string | null
          experience_years: number | null
          first_name: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_remote: boolean | null
          is_top_rated: boolean | null
          is_verified: boolean
          last_name: string | null
          location: string | null
          phone_number: string | null
          portfolio_url: string | null
          professional_title: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          updated_at: string
          username: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          auth_user_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_remote?: boolean | null
          is_top_rated?: boolean | null
          is_verified?: boolean
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string
          username?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          auth_user_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          cv_url?: string | null
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_remote?: boolean | null
          is_top_rated?: boolean | null
          is_verified?: boolean
          last_name?: string | null
          location?: string | null
          phone_number?: string | null
          portfolio_url?: string | null
          professional_title?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string
          username?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
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
            foreignKeyName: "unlocked_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
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
            foreignKeyName: "unlocked_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "unlocked_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "unlocked_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocked_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "unlocked_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size_bytes: number
          id: string
          mime_type: string
          storage_path: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size_bytes: number
          id?: string
          mime_type: string
          storage_path: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size_bytes?: number
          id?: string
          mime_type?: string
          storage_path?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "verification_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "worker_projects_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "worker_projects_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      worker_saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
    }
    Views: {
      job_applications: {
        Row: {
          application_subject: string | null
          contact_methods: Json | null
          cover_letter: string | null
          created_at: string | null
          id: string | null
          job_id: string | null
          match_score: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          worker_id: string | null
        }
        Insert: {
          application_subject?: string | null
          contact_methods?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          worker_id?: string | null
        }
        Update: {
          application_subject?: string | null
          contact_methods?: Json | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          match_score?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
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
          location: string | null
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
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string | null
          job_id: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          job_id?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "worker_saved_jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      worker_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          first_name: string | null
          full_name: string | null
          hourly_rate: number | null
          is_verified: boolean | null
          last_name: string | null
          professional_title: string | null
          profile_id: string | null
          skills: string[] | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          worker_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          is_verified?: boolean | null
          last_name?: string | null
          professional_title?: string | null
          profile_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          worker_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          is_verified?: boolean | null
          last_name?: string | null
          professional_title?: string | null
          profile_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          worker_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_admin_user_ids: { Args: never; Returns: string[] }
      get_platform_metrics: { Args: never; Returns: Json }
      increment_job_clicks: {
        Args: { target_job_id: string }
        Returns: undefined
      }
      increment_job_views: {
        Args: { target_job_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      notify_admins: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "active" | "suspended"
      application_status:
        | "PENDING"
        | "UNDER_REVIEW"
        | "INTERVIEW_SCHEDULED"
        | "REJECTED"
        | "HIRED"
      user_role: "employer" | "worker" | "admin"
      verification_status:
        | "unverified"
        | "personal_complete"
        | "documents_submitted"
        | "under_review"
        | "approved"
        | "rejected"
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
      account_status: ["active", "suspended"],
      application_status: [
        "PENDING",
        "UNDER_REVIEW",
        "INTERVIEW_SCHEDULED",
        "REJECTED",
        "HIRED",
      ],
      user_role: ["employer", "worker", "admin"],
      verification_status: [
        "unverified",
        "personal_complete",
        "documents_submitted",
        "under_review",
        "approved",
        "rejected",
      ],
    },
  },
} as const
