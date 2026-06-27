/**
 * Database types for the Vaayu Postgres schema.
 *
 * INTERIM, HAND-AUTHORED to match migrations/20260627120000_initial_schema.sql.
 * Once the migration is applied, regenerate this file (it will be overwritten):
 *   supabase gen types typescript --project-id kvfnijojzmtvjjqxfnly > src/types.ts
 *
 * Keep this in sync with the migration until generation takes over.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'individual' | 'artist' | 'gallery' | 'enterprise';
export type ArtworkCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          free_valuations_used: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          free_valuations_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          free_valuations_used?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      valuations: {
        Row: {
          id: string;
          user_id: string;
          artwork_image_url: string;
          artist_name: string | null;
          artist_known: boolean;
          tradition: string | null;
          medium: string | null;
          dimensions_height_cm: number | null;
          dimensions_width_cm: number | null;
          year_created: number | null;
          condition: ArtworkCondition | null;
          provenance_notes: string | null;
          estimated_low_inr: number | null;
          estimated_mid_inr: number | null;
          estimated_high_inr: number | null;
          confidence_score: number | null;
          ai_reasoning: Json | null;
          full_report: string | null;
          was_paid: boolean;
          payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artwork_image_url: string;
          artist_name?: string | null;
          artist_known?: boolean;
          tradition?: string | null;
          medium?: string | null;
          dimensions_height_cm?: number | null;
          dimensions_width_cm?: number | null;
          year_created?: number | null;
          condition?: ArtworkCondition | null;
          provenance_notes?: string | null;
          estimated_low_inr?: number | null;
          estimated_mid_inr?: number | null;
          estimated_high_inr?: number | null;
          confidence_score?: number | null;
          ai_reasoning?: Json | null;
          full_report?: string | null;
          was_paid?: boolean;
          payment_id?: string | null;
          created_at?: string;
        };
        Update: {
          estimated_low_inr?: number | null;
          estimated_mid_inr?: number | null;
          estimated_high_inr?: number | null;
          confidence_score?: number | null;
          ai_reasoning?: Json | null;
          full_report?: string | null;
          was_paid?: boolean;
          payment_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: SubscriptionTier;
          status: SubscriptionStatus;
          valuations_per_month: number;
          price_inr: number;
          started_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          valuations_per_month?: number;
          price_inr?: number;
          started_at?: string;
          expires_at?: string | null;
        };
        Update: {
          tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          valuations_per_month?: number;
          price_inr?: number;
          expires_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      artwork_condition: ArtworkCondition;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
