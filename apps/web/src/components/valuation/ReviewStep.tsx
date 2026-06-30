import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TRADITIONS, MEDIUMS } from '@vaayu/shared';
import { Button } from '../Button';
import { useValuationStore } from '../../store/valuationStore';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { env } from '../../lib/env';
import { payForValuation, type RazorpayPayment } from '../../lib/payments';

const CONDITION_LABEL_KEYS: Record<string, string> = {
  excellent: 'wizard.condExcellent',
  good: 'wizard.condGood',
  fair: 'wizard.condFair',
  poor: 'wizard.condPoor',
};

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
  /** Kick off the valuation (upload + server call), with payment when required. */
  onSubmit: (payment?: RazorpayPayment) => void;
  submitting: boolean;
  error: string | null;
}

/**
 * Step 3 — review the submission, show free-valuations remaining, and submit.
 * When the free quota is exhausted, the user pays ₹99 via Razorpay; the verified
 * payment is passed to the server, which re-checks the signature before valuing.
 */
export function ReviewStep({ onSubmit, submitting, error }: ReviewStepProps) {
  const { t } = useTranslation();
  const store = useValuationStore();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const used = profile?.freeValuationsUsed ?? 0;
  const remaining = Math.max(0, env.freeValuationLimit - used);
  const needsPayment = remaining === 0;

  async function handlePayAndSubmit() {
    setPayError(null);
    setPaying(true);
    try {
      const payment = await payForValuation(user?.email);
      onSubmit(payment);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : t('wizard.paymentCancelled'));
    } finally {
      setPaying(false);
    }
  }

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
          <SummaryRow
            label={t('wizard.summaryTradition')}
            value={labelFor(TRADITIONS, store.tradition)}
          />
          <SummaryRow label={t('wizard.summaryMedium')} value={labelFor(MEDIUMS, store.medium)} />
          <SummaryRow
            label={t('wizard.summaryDimensions')}
            value={`${store.dimensions.heightCm} × ${store.dimensions.widthCm} cm`}
          />
          {store.yearCreated ? (
            <SummaryRow label={t('wizard.summaryYear')} value={String(store.yearCreated)} />
          ) : null}
          <SummaryRow
            label={t('wizard.summaryCondition')}
            value={t(CONDITION_LABEL_KEYS[store.condition] ?? store.condition)}
          />
          <SummaryRow
            label={t('wizard.summaryArtist')}
            value={store.artistKnown ? store.artistName || '—' : t('wizard.unknown')}
          />
        </dl>
      </div>

      {store.provenanceNotes.trim() ? (
        <div>
          <p className="font-body text-sm font-medium text-ink">
            {t('wizard.provenanceNotesLabel')}
          </p>
          <p className="mt-1 font-body text-sm text-muted">{store.provenanceNotes}</p>
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-gold/5 p-4">
        {needsPayment ? (
          <p className="font-body text-sm text-ink">
            {t('wizard.paywall', { total: env.freeValuationLimit })}
          </p>
        ) : (
          <p className="font-body text-sm text-ink">
            {t('wizard.freeRemaining', { count: remaining, total: env.freeValuationLimit })}
          </p>
        )}
      </div>

      {error ? <p className="font-body text-sm text-red-700">{error}</p> : null}
      {payError ? <p className="font-body text-sm text-red-700">{payError}</p> : null}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => store.setStep('context')}
          disabled={submitting || paying}
        >
          {t('common.back')}
        </Button>
        {needsPayment ? (
          <Button variant="orange" onClick={handlePayAndSubmit} loading={paying || submitting}>
            {t('wizard.payAndValue')}
          </Button>
        ) : (
          <Button variant="orange" onClick={() => onSubmit()} loading={submitting}>
            {t('wizard.getValuation')}
          </Button>
        )}
      </div>
    </div>
  );
}
