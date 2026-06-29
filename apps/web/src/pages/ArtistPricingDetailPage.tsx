import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ArtistResult } from '../components/artist/ArtistResult';
import { useArtistPricing } from '../hooks/useArtistPricings';

/** View a single saved Artist Mode pricing from history. */
export function ArtistPricingDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError } = useArtistPricing(id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
          ← {t('dashboard.artistTitle')}
        </Link>
        <LanguageSwitcher />
      </div>

      {isLoading ? (
        <p className="py-12 text-center font-body text-sm text-muted">{t('dashboard.loading')}</p>
      ) : isError || !record ? (
        <p className="py-12 text-center font-body text-sm text-red-700">{t('report.notFound')}</p>
      ) : (
        <>
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={record.tradition}
              className="mb-8 max-h-72 w-auto self-center rounded-md border border-border object-contain"
            />
          ) : null}
          <ArtistResult result={record.result} />
          <div className="mt-8 border-t border-border pt-6">
            <Link to="/price">
              <Button>{t('dashboard.priceArtPlus')}</Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
