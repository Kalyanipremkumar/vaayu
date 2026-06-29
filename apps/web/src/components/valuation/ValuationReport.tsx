import { useTranslation } from 'react-i18next';
import {
  formatInr,
  formatInrRange,
  VALUATION_DISCLAIMER,
  type ValuationResult,
} from '@vaayu/shared';

interface ValuationReportProps {
  result: ValuationResult;
  /** Optional preview image (local object URL or signed URL). */
  imageUrl?: string | null;
  /** Which value this represents, e.g. "Insurance / replacement". */
  purposeLabel?: string;
}

/** A single methodology layer card. */
function LayerCard({
  label,
  headline,
  rationale,
}: {
  label: string;
  headline: string;
  rationale: string;
}) {
  return (
    <div className="border-t border-border py-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-body text-sm uppercase tracking-wider text-gold">{label}</p>
        <p className="font-heading text-lg text-ink">{headline}</p>
      </div>
      <p className="mt-2 font-body text-sm leading-relaxed text-muted">{rationale}</p>
    </div>
  );
}

/**
 * The valuation report. Reused by the wizard's result step and the standalone
 * report page. Renders the price range prominently, the confidence score, the
 * three methodology layers, comparables, and the full narrative report.
 */
export function ValuationReport({ result, imageUrl, purposeLabel }: ValuationReportProps) {
  const { t } = useTranslation();
  const { reasoning } = result;
  return (
    <article className="flex flex-col gap-8">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Valued artwork"
          className="max-h-80 w-auto self-center rounded-lg border border-border object-contain"
        />
      ) : null}

      <header className="text-center">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-muted">
          {purposeLabel
            ? t('report.estimatedPurpose', { purpose: purposeLabel.toLowerCase() })
            : t('report.estimatedValue')}
        </p>
        <p className="mt-2 font-heading text-4xl text-ink md:text-5xl">
          {formatInr(result.estimatedMidInr)}
        </p>
        <p className="mt-2 font-body text-sm text-muted">
          {t('report.range', {
            range: formatInrRange(result.estimatedLowInr, result.estimatedHighInr),
          })}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 font-body text-xs text-ink">
          {t('report.confidence', { score: Math.round(result.confidenceScore) })}
        </p>
      </header>

      <section>
        <h2 className="font-heading text-2xl text-ink">{t('report.howWeGotThere')}</h2>
        <div className="mt-2">
          <LayerCard
            label={`${t('report.layer1')}`}
            headline={formatInr(reasoning.baseValue.amount)}
            rationale={reasoning.baseValue.rationale}
          />
          <LayerCard
            label={`${t('report.layer2')}`}
            headline={`× ${reasoning.artistMultiplier.multiplier}${
              reasoning.artistMultiplier.tier ? ` · ${reasoning.artistMultiplier.tier}` : ''
            }`}
            rationale={reasoning.artistMultiplier.rationale}
          />
          <LayerCard
            label={`${t('report.layer3')}`}
            headline={`× ${reasoning.workAdjustment.multiplier}`}
            rationale={reasoning.workAdjustment.rationale}
          />
        </div>
      </section>

      {reasoning.comparables?.length ? (
        <section>
          <h2 className="font-heading text-2xl text-ink">{t('report.comparables')}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-muted">
            {reasoning.comparables.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.fullReport ? (
        <section>
          <h2 className="font-heading text-2xl text-ink">{t('report.fullReport')}</h2>
          <p className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-muted">
            {result.fullReport}
          </p>
        </section>
      ) : null}

      <p className="border-t border-border pt-4 font-body text-xs text-muted">
        {VALUATION_DISCLAIMER}
      </p>
    </article>
  );
}
