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

interface ReviewStepProps {
  /** Kick off the valuation (upload + server call). */
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

/**
 * Step 3 — review the submission and show how many free valuations remain, then
 * submit for valuation. The paywall (when no free valuations remain) is wired in
 * Phase 3; for now a user with credits remaining proceeds straight to the AI.
 */
export function ReviewStep({ onSubmit, submitting, error }: ReviewStepProps) {
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

      {error ? <p className="font-body text-sm text-red-700">{error}</p> : null}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => store.setStep('context')} disabled={submitting}>
          Back
        </Button>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={onSubmit}
            loading={submitting}
            disabled={needsPayment}
            title={needsPayment ? 'Payment checkout arrives in Phase 3.' : undefined}
          >
            {needsPayment ? 'Pay ₹99 & value artwork' : 'Get my valuation'}
          </Button>
          {needsPayment ? (
            <span className="font-body text-xs text-muted">
              Payment checkout arrives in Phase 3.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
