import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StepIndicator } from '../components/valuation/StepIndicator';
import { UploadStep } from '../components/valuation/UploadStep';
import { ContextStep } from '../components/valuation/ContextStep';
import { ReviewStep } from '../components/valuation/ReviewStep';
import { ProcessingStep } from '../components/valuation/ProcessingStep';
import { ResultStep } from '../components/valuation/ResultStep';
import { useValuationStore } from '../store/valuationStore';
import { useAuth } from '../hooks/useAuth';
import { submitValuation } from '../lib/valuation';
import type { RazorpayPayment } from '../lib/payments';

/**
 * The valuation wizard. Renders the active step from the Zustand store and owns
 * the submission mutation (upload → server valuation → result).
 */
export function NewValuationPage() {
  const { t } = useTranslation();
  const store = useValuationStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Start each visit from a clean draft.
  useEffect(() => {
    store.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: async (payment?: RazorpayPayment) => {
      if (!user) throw new Error('You must be signed in.');
      if (!store.imageFile) throw new Error('Please choose an image first.');
      return submitValuation({
        imageFile: store.imageFile,
        userId: user.id,
        artistKnown: store.artistKnown,
        artistName: store.artistName,
        tradition: store.tradition,
        medium: store.medium,
        dimensions: store.dimensions,
        yearCreated: store.yearCreated,
        condition: store.condition,
        provenanceNotes: store.provenanceNotes,
        purpose: store.purpose,
        criteria: store.criteria,
        payment,
      });
    },
    onMutate: () => store.setStep('processing'),
    onSuccess: (result) => {
      store.setResult(result);
      store.setStep('result');
      void queryClient.invalidateQueries({ queryKey: ['valuations'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => store.setStep('review'),
  });

  const submitError = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : t('wizard.submitError')
    : null;

  const showWizardChrome = store.step !== 'result';

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {showWizardChrome ? (
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
            ← {t('wizard.dashboard')}
          </Link>
          {store.step !== 'processing' ? <StepIndicator current={store.step} /> : null}
        </div>
      ) : null}

      {showWizardChrome && store.step !== 'processing' ? (
        <h1 className="font-heading text-3xl text-ink">
          {store.step === 'upload' && t('wizard.titleUpload')}
          {store.step === 'context' && t('wizard.titleContext')}
          {store.step === 'review' && t('wizard.titleReview')}
        </h1>
      ) : null}

      <div className="mt-8">
        {store.step === 'upload' && <UploadStep />}
        {store.step === 'context' && <ContextStep />}
        {store.step === 'review' && (
          <ReviewStep
            onSubmit={(payment) => mutation.mutate(payment)}
            submitting={mutation.isPending}
            error={submitError}
          />
        )}
        {store.step === 'processing' && <ProcessingStep />}
        {store.step === 'result' && <ResultStep />}
      </div>
    </main>
  );
}
