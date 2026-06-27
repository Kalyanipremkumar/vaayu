import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StepIndicator } from '../components/valuation/StepIndicator';
import { UploadStep } from '../components/valuation/UploadStep';
import { ContextStep } from '../components/valuation/ContextStep';
import { ReviewStep } from '../components/valuation/ReviewStep';
import { useValuationStore } from '../store/valuationStore';

/**
 * The valuation wizard (Phase 2, steps 1–3). Renders the active step from the
 * Zustand store. Resets the draft when the page first mounts so each visit
 * starts clean.
 */
export function NewValuationPage() {
  const { step, reset } = useValuationStore();

  // Start each new visit from a clean draft.
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <StepIndicator current={step} />
      </div>

      <h1 className="font-heading text-3xl text-ink">
        {step === 'upload' && 'Upload your artwork'}
        {step === 'context' && 'Tell us about the work'}
        {step === 'review' && 'Review your submission'}
      </h1>

      <div className="mt-8">
        {step === 'upload' && <UploadStep />}
        {step === 'context' && <ContextStep />}
        {step === 'review' && <ReviewStep />}
      </div>
    </main>
  );
}
