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

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
} as const;
