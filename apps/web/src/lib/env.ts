/**
 * Reads and validates the web app's public environment variables once, at
 * startup, so a misconfigured deploy fails loudly instead of at a random call
 * site. Only VITE_-prefixed (client-safe) vars are read here.
 */

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var "${name}". Copy apps/web/.env.example to apps/web/.env and fill it in.`,
    );
  }
  return value;
}

import { FREE_VALUATION_LIMIT } from '@vaayu/shared';

/** Parse a positive-integer env var, falling back to a default when unset/invalid. */
function intEnv(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  /**
   * Free valuations shown in the UI. Override with VITE_FREE_VALUATION_LIMIT
   * (build-time). The SERVER enforces its own limit via VAAYU_FREE_VALUATION_LIMIT
   * on the edge function — keep the two in sync.
   */
  freeValuationLimit: intEnv(import.meta.env.VITE_FREE_VALUATION_LIMIT, FREE_VALUATION_LIMIT),
} as const;
