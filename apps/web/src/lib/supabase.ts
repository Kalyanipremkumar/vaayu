/**
 * The singleton Supabase client for the web app, built from validated env vars.
 * Import this everywhere rather than calling the factory again.
 */
import { createVaayuClient } from '@vaayu/supabase';
import { env } from './env';

export const supabase = createVaayuClient(env.supabaseUrl, env.supabaseAnonKey, {
  persistSession: true,
});
