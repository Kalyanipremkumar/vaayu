/**
 * Thin wrappers around Supabase Auth used by the web auth screens. Keeping the
 * calls here (rather than inline in components) means the flows are easy to
 * unit-test and to mirror on mobile later.
 */
import { supabase } from './supabase';

/** Where Google sends the user back to after OAuth. */
const oauthRedirectTo = `${window.location.origin}/dashboard`;

/** Where the password-reset email link lands. */
const passwordResetRedirectTo = `${window.location.origin}/reset-password`;

/** Sign up with email + password, storing the full name in user metadata so the
 * on_auth_user_created trigger can copy it into user_profiles. */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName.trim() } },
  });
  if (error) throw error;
  return data;
}

/** Sign in with email + password. */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Begin the Google OAuth flow (redirects away from the app). */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: oauthRedirectTo },
  });
  if (error) throw error;
}

/** Send a password-reset email. */
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: passwordResetRedirectTo,
  });
  if (error) throw error;
}

/** Set a new password (used on the reset-password page after the email link). */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Sign the current user out. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
