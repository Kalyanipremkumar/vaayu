import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

function FullPageMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <p className="font-body text-sm text-muted">{text}</p>
    </div>
  );
}

/**
 * Gate a route behind authentication, and behind onboarding: a signed-in user
 * who hasn't completed onboarding is sent to /onboarding first. The /onboarding
 * route itself is exempt (path check) to avoid a redirect loop.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading) return <FullPageMessage text="Loading…" />;
  if (!session) return <Navigate to="/login" replace />;

  // Wait for the profile before deciding on the onboarding redirect.
  if (profileLoading) return <FullPageMessage text="Loading…" />;

  const needsOnboarding = profile && !profile.onboarded;
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
