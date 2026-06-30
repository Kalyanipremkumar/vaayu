import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatInr, TRADITIONS } from '@vaayu/shared';
import { Button } from '../components/Button';
import { SelectField } from '../components/SelectField';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ModeToggle } from '../components/ModeToggle';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useValuations } from '../hooks/useValuations';
import { useArtistPricings } from '../hooks/useArtistPricings';
import { useAppMode } from '../store/appModeStore';
import { signOut } from '../lib/auth';
import type { ValuationRecord } from '../lib/valuations';
import type { ArtistPricingRecord } from '../lib/artistPricings';

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

const cardClass =
  'flex items-center gap-4 rounded-xl border border-border bg-cream p-3 transition-colors hover:border-gold';
const thumbClass = 'h-16 w-16 shrink-0 rounded-lg border border-border object-cover';
const placeholderClass = 'h-16 w-16 shrink-0 rounded-lg border border-border bg-[#F3ECDE]';

/** One collector valuation in the history list. */
function ValuationCard({ record }: { record: ValuationRecord }) {
  const { t } = useTranslation();
  return (
    <Link to={`/valuations/${record.id}`} className={cardClass}>
      {record.imageUrl ? (
        <img src={record.imageUrl} alt={traditionLabel(record.tradition)} className={thumbClass} />
      ) : (
        <div className={placeholderClass} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-lg text-ink">{traditionLabel(record.tradition)}</p>
        <p className="font-body text-xs text-muted">
          {formatDate(record.createdAt)} · {t('dashboard.confidence')}{' '}
          {Math.round(record.result.confidenceScore)}
        </p>
      </div>
      <p className="shrink-0 font-heading text-lg text-gold">
        {formatInr(record.result.estimatedMidInr)}
      </p>
    </Link>
  );
}

/** One artist pricing in the history list. */
function PricingCard({ record }: { record: ArtistPricingRecord }) {
  const { t } = useTranslation();
  return (
    <Link to={`/pricings/${record.id}`} className={cardClass}>
      {record.imageUrl ? (
        <img src={record.imageUrl} alt={traditionLabel(record.tradition)} className={thumbClass} />
      ) : (
        <div className={placeholderClass} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-lg text-ink">{traditionLabel(record.tradition)}</p>
        <p className="font-body text-xs text-muted">
          {formatDate(record.createdAt)}
          {record.perSqFtInr
            ? ` · ${t('dashboard.perSqFtShort', { rate: formatInr(record.perSqFtInr) })}`
            : ''}
        </p>
      </div>
      <p className="shrink-0 font-heading text-lg text-gold">{formatInr(record.askInr)}</p>
    </Link>
  );
}

/** Collector view: valuation history with a tradition filter and stats. */
function CollectorBody() {
  const { t } = useTranslation();
  const { data: valuations, isLoading, isError } = useValuations();
  const [tradition, setTradition] = useState('all');

  const traditionsPresent = useMemo(() => {
    const keys = new Set((valuations ?? []).map((v) => v.tradition).filter(Boolean));
    return [
      { value: 'all', label: t('dashboard.allTraditions') },
      ...TRADITIONS.filter((tr) => keys.has(tr.key)).map((tr) => ({
        value: tr.key,
        label: tr.label,
      })),
    ];
  }, [valuations, t]);

  const filtered = useMemo(
    () => (valuations ?? []).filter((v) => tradition === 'all' || v.tradition === tradition),
    [valuations, tradition],
  );
  const totalMid = useMemo(
    () => (valuations ?? []).reduce((sum, v) => sum + v.result.estimatedMidInr, 0),
    [valuations],
  );
  const hasAny = Boolean(valuations && valuations.length > 0);

  return (
    <>
      {hasAny ? (
        <p className="mt-1 font-body text-sm text-muted">
          {t('dashboard.stats', { count: valuations!.length, total: formatInr(totalMid) })}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/valuations/new"
            className="inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
          >
            {t('dashboard.newValuationPlus')}
          </Link>
        </div>
        {hasAny ? (
          <div className="w-56">
            <SelectField
              label={t('dashboard.filter')}
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
          <p className="py-12 text-center font-body text-sm text-muted">{t('dashboard.loading')}</p>
        ) : isError ? (
          <p className="py-12 text-center font-body text-sm text-red-700">{t('dashboard.error')}</p>
        ) : !hasAny ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-heading text-xl text-ink">{t('dashboard.emptyTitle')}</p>
            <p className="mt-2 font-body text-sm text-muted">{t('dashboard.emptyBody')}</p>
            <Link
              to="/valuations/new"
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
            >
              {t('dashboard.newValuation')}
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
    </>
  );
}

/** Artist view: pricing history. */
function ArtistBody() {
  const { t } = useTranslation();
  const { data: pricings, isLoading, isError } = useArtistPricings();
  const hasAny = Boolean(pricings && pricings.length > 0);

  return (
    <>
      {hasAny ? (
        <p className="mt-1 font-body text-sm text-muted">
          {t('dashboard.artistStats', { count: pricings!.length })}
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          to="/price"
          className="inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
        >
          {t('dashboard.priceArtPlus')}
        </Link>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="py-12 text-center font-body text-sm text-muted">{t('dashboard.loading')}</p>
        ) : isError ? (
          <p className="py-12 text-center font-body text-sm text-red-700">{t('dashboard.error')}</p>
        ) : !hasAny ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-heading text-xl text-ink">{t('dashboard.artistEmptyTitle')}</p>
            <p className="mt-2 font-body text-sm text-muted">{t('dashboard.artistEmptyBody')}</p>
            <Link
              to="/price"
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-ink/90"
            >
              {t('dashboard.priceArtPlus')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pricings!.map((record) => (
              <PricingCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Authenticated dashboard. A Collector / Artist toggle switches between the
 * user's valuation history and their pricing history. The default view is taken
 * from the onboarding role (artist → artist) but the user can flip it freely.
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const { mode, setDefaultMode } = useAppMode();

  // Default the view from the onboarding role, unless the user already chose.
  useEffect(() => {
    if (profile?.role === 'artist') setDefaultMode('artist');
  }, [profile?.role, setDefaultMode]);

  const isArtist = mode === 'artist';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <p className="font-body text-sm uppercase tracking-[0.2em] text-gold">Vaayu</p>
          <h1 className="mt-1 font-heading text-3xl text-ink">
            {isArtist ? t('dashboard.artistTitle') : t('dashboard.title')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/settings"
            className="font-body text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {t('common.settings')}
          </Link>
          <Button variant="outline" onClick={handleSignOut}>
            {t('common.signOut')}
          </Button>
        </div>
      </header>

      <div className="mt-6">
        <ModeToggle />
      </div>

      {isArtist ? <ArtistBody /> : <CollectorBody />}

      <p className="mt-10 font-body text-xs text-muted">
        {t('dashboard.signedInAs', { email: user?.email })}
      </p>
    </main>
  );
}
