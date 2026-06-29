import { useTranslation } from 'react-i18next';

/**
 * Step 5 — the "moment of magic" loading state shown while Claude applies the
 * three-layer methodology. Real work (30–60s), not a faked delay.
 */
export function ProcessingStep() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ink" />
      <div>
        <p className="font-heading text-2xl text-ink">{t('wizard.processingTitle')}</p>
        <p className="mt-2 font-body text-sm text-muted">{t('wizard.processingSub')}</p>
      </div>
    </div>
  );
}
