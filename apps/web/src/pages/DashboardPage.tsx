import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/auth';

/**
 * Authenticated dashboard placeholder. The valuations list, filters, and the
 * "New valuation" entry point are built in Phase 2; this confirms the auth gate
 * and session wiring work end to end.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">Vaayu</p>
          <h1 className="mt-1 font-heading text-3xl text-ink">Your valuations</h1>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>

      <p className="mt-6 font-body text-sm text-muted">
        Signed in as {user?.email}. Your valuation history will appear here.
      </p>

      <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
        <p className="font-heading text-xl text-ink">No valuations yet</p>
        <p className="mt-2 font-body text-sm text-muted">
          Upload an artwork to get your first AI-powered valuation.
        </p>
        <Link
          to="/valuations/new"
          className="mt-6 inline-flex rounded-md bg-ink px-5 py-2.5 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
        >
          New valuation
        </Link>
      </div>
    </main>
  );
}
