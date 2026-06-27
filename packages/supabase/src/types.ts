export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      subscriptions: {
        Row: {
          expires_at: string | null;
          id: string;
          price_inr: number;
          started_at: string;
          status: Database['public']['Enums']['subscription_status'];
          tier: Database['public']['Enums']['subscription_tier'];
          user_id: string;
          valuations_per_month: number;
        };
        Insert: {
          expires_at?: string | null;
          id?: string;
          price_inr?: number;
          started_at?: string;
          status?: Database['public']['Enums']['subscription_status'];
          tier?: Database['public']['Enums']['subscription_tier'];
          user_id: string;
          valuations_per_month?: number;
        };
        Update: {
          expires_at?: string | null;
          id?: string;
          price_inr?: number;
          started_at?: string;
          status?: Database['public']['Enums']['subscription_status'];
          tier?: Database['public']['Enums']['subscription_tier'];
          user_id?: string;
          valuations_per_month?: number;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          email: string;
          free_valuations_used: number;
          full_name: string | null;
          id: string;
          role: Database['public']['Enums']['user_role'];
        };
        Insert: {
          created_at?: string;
          email: string;
          free_valuations_used?: number;
          full_name?: string | null;
          id: string;
          role?: Database['public']['Enums']['user_role'];
        };
        Update: {
          created_at?: string;
          email?: string;
          free_valuations_used?: number;
          full_name?: string | null;
          id?: string;
          role?: Database['public']['Enums']['user_role'];
        };
        Relationships: [];
      };
      valuations: {
        Row: {
          ai_reasoning: Json | null;
          artist_known: boolean;
          artist_name: string | null;
          artwork_image_url: string;
          condition: Database['public']['Enums']['artwork_condition'] | null;
          confidence_score: number | null;
          created_at: string;
          dimensions_height_cm: number | null;
          dimensions_width_cm: number | null;
          estimated_high_inr: number | null;
          estimated_low_inr: number | null;
          estimated_mid_inr: number | null;
          full_report: string | null;
          id: string;
          medium: string | null;
          payment_id: string | null;
          provenance_notes: string | null;
          tradition: string | null;
          user_id: string;
          was_paid: boolean;
          year_created: number | null;
        };
        Insert: {
          ai_reasoning?: Json | null;
          artist_known?: boolean;
          artist_name?: string | null;
          artwork_image_url: string;
          condition?: Database['public']['Enums']['artwork_condition'] | null;
          confidence_score?: number | null;
          created_at?: string;
          dimensions_height_cm?: number | null;
          dimensions_width_cm?: number | null;
          estimated_high_inr?: number | null;
          estimated_low_inr?: number | null;
          estimated_mid_inr?: number | null;
          full_report?: string | null;
          id?: string;
          medium?: string | null;
          payment_id?: string | null;
          provenance_notes?: string | null;
          tradition?: string | null;
          user_id: string;
          was_paid?: boolean;
          year_created?: number | null;
        };
        Update: {
          ai_reasoning?: Json | null;
          artist_known?: boolean;
          artist_name?: string | null;
          artwork_image_url?: string;
          condition?: Database['public']['Enums']['artwork_condition'] | null;
          confidence_score?: number | null;
          created_at?: string;
          dimensions_height_cm?: number | null;
          dimensions_width_cm?: number | null;
          estimated_high_inr?: number | null;
          estimated_low_inr?: number | null;
          estimated_mid_inr?: number | null;
          full_report?: string | null;
          id?: string;
          medium?: string | null;
          payment_id?: string | null;
          provenance_notes?: string | null;
          tradition?: string | null;
          user_id?: string;
          was_paid?: boolean;
          year_created?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      artwork_condition: 'excellent' | 'good' | 'fair' | 'poor';
      subscription_status: 'active' | 'cancelled' | 'past_due';
      subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
      user_role: 'individual' | 'artist' | 'gallery' | 'enterprise';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      artwork_condition: ['excellent', 'good', 'fair', 'poor'],
      subscription_status: ['active', 'cancelled', 'past_due'],
      subscription_tier: ['free', 'starter', 'pro', 'enterprise'],
      user_role: ['individual', 'artist', 'gallery', 'enterprise'],
    },
  },
} as const;
