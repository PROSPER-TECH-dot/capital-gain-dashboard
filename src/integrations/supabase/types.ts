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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_code_redemptions: {
        Row: {
          amount: number
          created_at: string
          gift_code_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          gift_code_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          gift_code_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_code_redemptions_gift_code_id_fkey"
            columns: ["gift_code_id"]
            isOneToOne: false
            referencedRelation: "gift_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          max_amount: number
          max_redemptions: number
          min_amount: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          max_amount?: number
          max_redemptions?: number
          min_amount?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          max_amount?: number
          max_redemptions?: number
          min_amount?: number
        }
        Relationships: []
      }
      investments: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          daily_return: number
          end_date: string
          id: string
          start_date: string
          total_earned: number
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          daily_return: number
          end_date: string
          id?: string
          start_date?: string
          total_earned?: number
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          daily_return?: number
          end_date?: string
          id?: string
          start_date?: string
          total_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_balance: number
          created_at: string
          cumulative_income: number
          email: string
          id: string
          is_banned: boolean
          phone: string
          profile_photo: string | null
          recharge_balance: number
          referral_code: string
          updated_at: string
          upline_user_id: string | null
          user_id: string
          username: string
        }
        Insert: {
          account_balance?: number
          created_at?: string
          cumulative_income?: number
          email: string
          id?: string
          is_banned?: boolean
          phone?: string
          profile_photo?: string | null
          recharge_balance?: number
          referral_code: string
          updated_at?: string
          upline_user_id?: string | null
          user_id: string
          username: string
        }
        Update: {
          account_balance?: number
          created_at?: string
          cumulative_income?: number
          email?: string
          id?: string
          is_banned?: boolean
          phone?: string
          profile_photo?: string | null
          recharge_balance?: number
          referral_code?: string
          updated_at?: string
          upline_user_id?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_upline"
            columns: ["upline_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          check_in_amount: number
          daily_earnings: number
          id: string
          investment_period: number
          message_popup_style: string
          min_deposit: number
          min_investment: number
          min_withdrawal: number
          support_numbers: Json
          website_name: string
          whatsapp_group: string
        }
        Insert: {
          check_in_amount?: number
          daily_earnings?: number
          id?: string
          investment_period?: number
          message_popup_style?: string
          min_deposit?: number
          min_investment?: number
          min_withdrawal?: number
          support_numbers?: Json
          website_name?: string
          whatsapp_group?: string
        }
        Update: {
          check_in_amount?: number
          daily_earnings?: number
          id?: string
          investment_period?: number
          message_popup_style?: string
          min_deposit?: number
          min_investment?: number
          min_withdrawal?: number
          support_numbers?: Json
          website_name?: string
          whatsapp_group?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
