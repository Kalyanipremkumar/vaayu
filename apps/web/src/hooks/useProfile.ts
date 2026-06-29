/**
 * Loads the signed-in user's profile row (role, free valuations used). Returns
 * null gracefully if the row/table isn't available yet (e.g. before the schema
 * migration has been applied), so the UI can still render.
 */
import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@vaayu/shared';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user } = useAuth();

  return useQuery<UserProfile | null>({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, free_valuations_used, onboarded, created_at')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) {
        // Table may not exist yet during early setup — don't crash the UI.
        console.warn('useProfile: could not load profile —', error.message);
        return null;
      }
      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        freeValuationsUsed: data.free_valuations_used,
        onboarded: data.onboarded,
        createdAt: data.created_at,
      };
    },
  });
}
