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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          event_type: Database["public"]["Enums"]["ad_event_type"]
          id: string
          placement: string
          provider: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          event_type: Database["public"]["Enums"]["ad_event_type"]
          id?: string
          placement: string
          provider: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          event_type?: Database["public"]["Enums"]["ad_event_type"]
          id?: string
          placement?: string
          provider?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_configs: {
        Row: {
          active: boolean | null
          agent_name: string
          id: string
          model_name: string | null
          parameters: Json | null
          updated_at: string | null
          updated_by: string | null
          version: string
        }
        Insert: {
          active?: boolean | null
          agent_name: string
          id?: string
          model_name?: string | null
          parameters?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version: string
        }
        Update: {
          active?: boolean | null
          agent_name?: string
          id?: string
          model_name?: string | null
          parameters?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          agent_name: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input: Json | null
          output: Json | null
          status: Database["public"]["Enums"]["agent_status"]
          timestamp: string | null
        }
        Insert: {
          agent_name: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          status: Database["public"]["Enums"]["agent_status"]
          timestamp?: string | null
        }
        Update: {
          agent_name?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          status?: Database["public"]["Enums"]["agent_status"]
          timestamp?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          context: string | null
          created_at: string | null
          feedback: Json | null
          game_id: string
          gems: Json | null
          id: string
          items: Json | null
          metaforge_flag: boolean | null
          name: string
          type: Database["public"]["Enums"]["build_type"] | null
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          feedback?: Json | null
          game_id: string
          gems?: Json | null
          id?: string
          items?: Json | null
          metaforge_flag?: boolean | null
          name: string
          type?: Database["public"]["Enums"]["build_type"] | null
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          feedback?: Json | null
          game_id?: string
          gems?: Json | null
          id?: string
          items?: Json | null
          metaforge_flag?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["build_type"] | null
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "builds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      game_suggestions: {
        Row: {
          created_at: string | null
          details: string | null
          game_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          game_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          game_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      games_info: {
        Row: {
          active: boolean | null
          created_at: string | null
          game_name: string
          gems: Json
          id: string
          needs_review: boolean | null
          perks: Json
          rarities: Json
          slots: Json
          stats: Json
          updated_at: string | null
          version: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          game_name: string
          gems?: Json
          id?: string
          needs_review?: boolean | null
          perks?: Json
          rarities?: Json
          slots?: Json
          stats?: Json
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          game_name?: string
          gems?: Json
          id?: string
          needs_review?: boolean | null
          perks?: Json
          rarities?: Json
          slots?: Json
          stats?: Json
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      gems: {
        Row: {
          created_at: string | null
          effect: Json | null
          game_id: string
          gem_type: string | null
          id: string
          name: string
          rarity: string
          stats: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          effect?: Json | null
          game_id: string
          gem_type?: string | null
          id?: string
          name: string
          rarity: string
          stats?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          effect?: Json | null
          game_id?: string
          gem_type?: string | null
          id?: string
          name?: string
          rarity?: string
          stats?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gems_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      item_categories: {
        Row: {
          category_key: string
          created_at: string | null
          display_order: number | null
          game_id: string
          id: string
          label: string
        }
        Insert: {
          category_key: string
          created_at?: string | null
          display_order?: number | null
          game_id: string
          id?: string
          label: string
        }
        Update: {
          category_key?: string
          created_at?: string | null
          display_order?: number | null
          game_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_categories_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_info"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          game_id: string
          id: string
          item_category: string | null
          name: string
          perks: Json | null
          rarity: string
          set_affiliation: string | null
          slot: string
          socket_count: number | null
          sockets: number | null
          source_screenshot: string | null
          stats: Json | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          game_id: string
          id?: string
          item_category?: string | null
          name: string
          perks?: Json | null
          rarity: string
          set_affiliation?: string | null
          slot: string
          socket_count?: number | null
          sockets?: number | null
          source_screenshot?: string | null
          stats?: Json | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          game_id?: string
          id?: string
          item_category?: string | null
          name?: string
          perks?: Json | null
          rarity?: string
          set_affiliation?: string | null
          slot?: string
          socket_count?: number | null
          sockets?: number | null
          source_screenshot?: string | null
          stats?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_login: string | null
          premium: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          username: string
          username_changed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_login?: string | null
          premium?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          username: string
          username_changed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_login?: string | null
          premium?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          username?: string
          username_changed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          message: string
          screenshot_url: string | null
          severity: Database["public"]["Enums"]["report_severity"] | null
          status: Database["public"]["Enums"]["report_status"] | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message: string
          screenshot_url?: string | null
          severity?: Database["public"]["Enums"]["report_severity"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string
          screenshot_url?: string | null
          severity?: Database["public"]["Enums"]["report_severity"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string | null
          refresh_token_hash: string | null
          terminated: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          refresh_token_hash?: string | null
          terminated?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          refresh_token_hash?: string | null
          terminated?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      training_data: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          correction: Json
          created_at: string | null
          expires_at: string | null
          id: string
          item_id: string | null
          manual_upload: boolean | null
          original_output: Json
          screenshot_url: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          correction: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_id?: string | null
          manual_upload?: boolean | null
          original_output: Json
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          correction?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_id?: string | null
          manual_upload?: boolean | null
          original_output?: Json
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_data_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_data_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      training_runs: {
        Row: {
          approved_corrections: number | null
          deployed_by: string | null
          game_id: string
          id: string
          model_version: string
          notes: string | null
          rollback_flag: boolean | null
          run_date: string | null
          started_by: string | null
          status: string | null
        }
        Insert: {
          approved_corrections?: number | null
          deployed_by?: string | null
          game_id: string
          id?: string
          model_version: string
          notes?: string | null
          rollback_flag?: boolean | null
          run_date?: string | null
          started_by?: string | null
          status?: string | null
        }
        Update: {
          approved_corrections?: number | null
          deployed_by?: string | null
          game_id?: string
          id?: string
          model_version?: string
          notes?: string | null
          rollback_flag?: boolean | null
          run_date?: string | null
          started_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_runs_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_runs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_runs_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "v_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_users_overview: {
        Row: {
          auth_created_at: string | null
          auth_metadata_username: string | null
          email: string | null
          id: string | null
          last_sign_in_at: string | null
          premium: boolean | null
          profile_created_at: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          total_builds: number | null
          total_uploads: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_created_at: string | null
          auth_metadata_username: string | null
          email: string | null
          id: string | null
          last_sign_in_at: string | null
          premium: boolean | null
          profile_created_at: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          total_builds: number | null
          total_uploads: number | null
          username: string | null
        }[]
      }
      gen_available_username: {
        Args: { base_input: string }
        Returns: string
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_active_agent_version: {
        Args: { p_agent_name: string; p_version: string }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          p_reason?: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      username_available: {
        Args: { p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      ad_event_type: "impression" | "click" | "loaded"
      agent_status: "success" | "error"
      app_role: "user" | "premium" | "mod" | "trainer" | "admin"
      build_type: "forge" | "metaforge"
      report_severity: "low" | "medium" | "high"
      report_status: "open" | "triaged" | "closed"
      report_type: "bug" | "feature"
      training_status: "pending" | "approved" | "rejected"
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
      ad_event_type: ["impression", "click", "loaded"],
      agent_status: ["success", "error"],
      app_role: ["user", "premium", "mod", "trainer", "admin"],
      build_type: ["forge", "metaforge"],
      report_severity: ["low", "medium", "high"],
      report_status: ["open", "triaged", "closed"],
      report_type: ["bug", "feature"],
      training_status: ["pending", "approved", "rejected"],
    },
  },
} as const
