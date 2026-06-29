import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatInr, TRADITIONS } from '@vaayu/shared';
import { Button } from '../components/Button';
import { SelectField } from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { useValuations } from '../hooks/useValuations';
import { signOut } from '../lib/auth';
import type { ValuationRecord } from '../lib/valuations';

function traditionLabel(key: string): string {
  return TRADITIONS.find((t) => t.key === key)?.label ?? (key || 'Artwork');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** One valuation in the history list. */
function ValuationCard({ record }: { record: ValuationRecord }) {
  return (
    <Link
      to={`/valuations/${record.id}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-cream p-3 transition-colors hover:border-gold"
    >
      {record.imageUrl ? (
        <img
          src={record.imageUrl}
          alt={traditionLabel(record.tradition)}
          className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-lg border border-border bg-[#F3ECDE]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-lg text-ink">{traditionLabel(record.tradition)}</p>
        <p className="font-body text-xs text-muted">
          {formatDate(record.createdAt)} · Confidence {Math.round(record.result.confidenceScore)}
        </p>
      </div>
      <p className="shrink-0 font-heading text-lg text-gold">
        {formatInr(record.result.estimatedMidInr)}
      </p>
    </Link>
  );
}

/**
 * Authenticated dashboard — the user's valuation history with a tradition filter
 * and a stats summary, plus the entry point to a new valuation.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: valuations, isLoading, isError } = useValuations();
  const [tradition, setTradition] = useState('all');

  const traditionsPresent = useMemo(() => {
    const keys = new Set((valuations ?? []).map((v) => v.tradition).filter(Boolean));
    return [
      { value: 'all', label: 'All traditions' },
      ...TRADITIONS.filter((t) => keys.has(t.key)).map((t) => ({ value: t.key, label: t.label })),
    ];
  }, [valuations]);

  const filtered = useMemo(
    () => (valuations ?? []).filter((v) => tradition === 'all' || v.tradition === tradition),
    [valuations, tradition],
  );

  const totalMid = useMemo(
    () => (valuations ?? []).reduce((sum, v) => sum + v.result.estimatedMidInr, 0),
    [valuations],
  );

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">Vaayu</p>
          <h1 className="mt-1 font-heading text-3xl text-ink">Your valuations</h1>
          {valuations && valuations.length > 0 ? (
            <p className="mt-1 font-body text-sm text-muted">
              {valuations.length} valued · {formatInr(totalMid)} total mid-value
            </p>
          ) : null}
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <Link
          to="/valuations/new"
          className="inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
        >
          + New valuation
        </Link>
        {valuations && valuations.length > 0 ? (
          <div className="w-56">
            <SelectField
              label="Filter"
              name="tradition-filter"
              options={traditionsPresent}
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="py-12 text-center font-body text-sm text-muted">Loading your valuations…</p>
        ) : isError ? (
          <p className="py-12 text-center font-body text-sm text-red-700">
            Could not load your valuations. Please refresh.
          </p>
        ) : !valuations || valuations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-heading text-xl text-ink">No valuations yet</p>
            <p className="mt-2 font-body text-sm text-muted">
              Upload an artwork to get your first AI-powered valuation.
            </p>
            <Link
              to="/valuations/new"
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
            >
              New valuation
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((record) => (
              <ValuationCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 font-body text-xs text-muted">Signed in as {user?.email}</p>
    </main>
  );
}
