/// <reference types="vite/client" />

/** Typed Vite env vars for the Vaayu web app. */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  /** Overrides the free-valuation count shown in the UI. Defaults to 3. */
  readonly VITE_FREE_VALUATION_LIMIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
