import { formatInr, formatInrRange, type ValuationResult } from '@vaayu/shared';

interface ValuationReportProps {
  result: ValuationResult;
  /** Optional preview image (local object URL or signed URL). */
  imageUrl?: string | null;
}

/** A single methodology layer card. */
function LayerCard({
  index,
  title,
  headline,
  rationale,
}: {
  index: number;
  title: string;
  headline: string;
  rationale: string;
}) {
  return (
    <div className="border-t border-border py-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-body text-sm uppercase tracking-wider text-gold">
          Layer {index} · {title}
        </p>
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
export function ValuationReport({ result, imageUrl }: ValuationReportProps) {
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
        <p className="font-body text-sm uppercase tracking-[0.2em] text-muted">Estimated value</p>
        <p className="mt-2 font-heading text-4xl text-ink md:text-5xl">
          {formatInr(result.estimatedMidInr)}
        </p>
        <p className="mt-2 font-body text-sm text-muted">
          Range {formatInrRange(result.estimatedLowInr, result.estimatedHighInr)}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 font-body text-xs text-ink">
          Confidence {Math.round(result.confidenceScore)} / 100
        </p>
      </header>

      <section>
        <h2 className="font-heading text-2xl text-ink">How we got here</h2>
        <div className="mt-2">
          <LayerCard
            index={1}
            title="Base value"
            headline={formatInr(reasoning.baseValue.amount)}
            rationale={reasoning.baseValue.rationale}
          />
          <LayerCard
            index={2}
            title="Artist multiplier"
            headline={`× ${reasoning.artistMultiplier.multiplier}${
              reasoning.artistMultiplier.tier ? ` · ${reasoning.artistMultiplier.tier}` : ''
            }`}
            rationale={reasoning.artistMultiplier.rationale}
          />
          <LayerCard
            index={3}
            title="Work adjustment"
            headline={`× ${reasoning.workAdjustment.multiplier}`}
            rationale={reasoning.workAdjustment.rationale}
          />
        </div>
      </section>

      {reasoning.comparables?.length ? (
        <section>
          <h2 className="font-heading text-2xl text-ink">Comparables</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-muted">
            {reasoning.comparables.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.fullReport ? (
        <section>
          <h2 className="font-heading text-2xl text-ink">Full report</h2>
          <p className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-muted">
            {result.fullReport}
          </p>
        </section>
      ) : null}

      <p className="border-t border-border pt-4 font-body text-xs text-muted">
        This is an AI-generated estimate for guidance only, not a certified appraisal.
      </p>
    </article>
  );
}
