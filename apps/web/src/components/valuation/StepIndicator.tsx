import { useTranslation } from 'react-i18next';
import type { ValuationStep } from '../../store/valuationStore';

/** Ordered, user-facing steps shown in the wizard header. */
const STEPS: { key: ValuationStep; labelKey: string }[] = [
  { key: 'upload', labelKey: 'wizard.stepUpload' },
  { key: 'context', labelKey: 'wizard.stepContext' },
  { key: 'review', labelKey: 'wizard.stepReview' },
];

/** Minimal numbered progress indicator for the valuation wizard. */
export function StepIndicator({ current }: { current: ValuationStep }) {
  const { t } = useTranslation();
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-3">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border font-body text-xs ${
                isCurrent
                  ? 'border-ink bg-ink text-cream'
                  : isDone
                    ? 'border-gold bg-gold text-ink'
                    : 'border-border bg-cream text-muted'
              }`}
            >
              {index + 1}
            </span>
            <span className={`font-body text-sm ${isCurrent ? 'text-ink' : 'text-muted'}`}>
              {t(step.labelKey)}
            </span>
            {index < STEPS.length - 1 ? <span className="h-px w-8 bg-border" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
