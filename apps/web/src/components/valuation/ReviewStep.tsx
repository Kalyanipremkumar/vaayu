import { FREE_VALUATION_LIMIT, TRADITIONS, MEDIUMS } from '@vaayu/shared';
import { Button } from '../Button';
import { useValuationStore } from '../../store/valuationStore';
import { useProfile } from '../../hooks/useProfile';

function labelFor(list: readonly { key: string; label: string }[], key: string): string {
  return list.find((item) => item.key === key)?.label ?? key;
}

/** A single label/value row in the review summary. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="font-body text-sm text-muted">{label}</dt>
      <dd className="font-body text-sm text-ink">{value}</dd>
    </div>
  );
}

/**
 * Step 3 — review the submission and show how many free valuations remain.
 * The actual AI submission + paywall are wired in the next phase, so the submit
 * action is intentionally disabled with a note here.
 */
export function ReviewStep() {
  const store = useValuationStore();
  const { data: profile } = useProfile();

  const used = profile?.freeValuationsUsed ?? 0;
  const remaining = Math.max(0, FREE_VALUATION_LIMIT - used);
  const needsPayment = remaining === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        {store.imagePreviewUrl ? (
          <img
            src={store.imagePreviewUrl}
            alt="Artwork to value"
            className="h-40 w-40 shrink-0 rounded-md border border-border object-cover"
          />
        ) : null}
        <dl className="flex-1">
          <SummaryRow label="Tradition" value={labelFor(TRADITIONS, store.tradition)} />
          <SummaryRow label="Medium" value={labelFor(MEDIUMS, store.medium)} />
          <SummaryRow
            label="Dimensions"
            value={`${store.dimensions.heightCm} × ${store.dimensions.widthCm} cm`}
          />
          {store.yearCreated ? <SummaryRow label="Year" value={String(store.yearCreated)} /> : null}
          <SummaryRow label="Condition" value={store.condition} />
          <SummaryRow
            label="Artist"
            value={store.artistKnown ? store.artistName || '—' : 'Unknown'}
          />
        </dl>
      </div>

      {store.provenanceNotes.trim() ? (
        <div>
          <p className="font-body text-sm font-medium text-ink">Provenance notes</p>
          <p className="mt-1 font-body text-sm text-muted">{store.provenanceNotes}</p>
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-gold/5 p-4">
        {needsPayment ? (
          <p className="font-body text-sm text-ink">
            You’ve used all {FREE_VALUATION_LIMIT} free valuations. Your next valuation is ₹99.
          </p>
        ) : (
          <p className="font-body text-sm text-ink">
            {remaining} free valuation{remaining === 1 ? '' : 's'} remaining (of{' '}
            {FREE_VALUATION_LIMIT}).
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => store.setStep('context')}>
          Back
        </Button>
        <div className="flex flex-col items-end gap-1">
          <Button disabled title="The AI valuation is wired up in the next phase.">
            {needsPayment ? 'Pay ₹99 & value artwork' : 'Get my valuation'}
          </Button>
          <span className="font-body text-xs text-muted">AI valuation arrives in Phase 2.</span>
        </div>
      </div>
    </div>
  );
}
