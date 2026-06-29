/**
 * User and subscription domain types, mirroring the `user_profiles` and
 * `subscriptions` tables. The auth user itself is managed by Supabase Auth.
 */

/** The user's stated relationship to art, captured during onboarding. */
export type UserRole = 'individual' | 'artist' | 'gallery' | 'enterprise';

/** camelCase view of a `user_profiles` row. */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  freeValuationsUsed: number;
  /** Whether the user has completed onboarding (role + tour). */
  onboarded: boolean;
  createdAt: string;
}

/** Number of free valuations every new user gets before the paywall. */
export const FREE_VALUATION_LIMIT = 3;

/** Subscription tiers (only 'free' is live initially; rest are designed ahead). */
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

/** Lifecycle status of a subscription. */
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

/** camelCase view of a `subscriptions` row. */
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  valuationsPerMonth: number;
  priceInr: number;
  startedAt: string;
  expiresAt: string | null;
}
