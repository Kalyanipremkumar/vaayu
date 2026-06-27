/**
 * Typed Supabase client factory for Vaayu.
 *
 * The shared package cannot read app-specific env vars (Vite uses VITE_*, Expo
 * uses EXPO_PUBLIC_*), so each app passes its own URL + anon key in. This keeps
 * the client strongly typed against the generated `Database` shape while
 * staying environment-agnostic.
 *
 * Only the ANON (publishable) key belongs here — it is safe in client bundles
 * because Row Level Security enforces access. The service-role key must never
 * be passed to this factory in client code.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type VaayuSupabaseClient = SupabaseClient<Database>;

export interface CreateClientOptions {
  /** Persist the auth session (true for apps, false for stateless servers). */
  persistSession?: boolean;
}

/**
 * Create a typed Supabase client for Vaayu.
 * @param supabaseUrl  Your project URL (e.g. https://xyz.supabase.co)
 * @param anonKey      The anon / publishable key (RLS-protected, client-safe)
 */
export function createVaayuClient(
  supabaseUrl: string,
  anonKey: string,
  options: CreateClientOptions = {},
): VaayuSupabaseClient {
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'createVaayuClient: missing supabaseUrl or anonKey. Check your environment variables.',
    );
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      persistSession: options.persistSession ?? true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
