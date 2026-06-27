import type { ValuationStep } from '../../store/valuationStore';

/** Ordered, user-facing steps shown in the wizard header. */
const STEPS: { key: ValuationStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'context', label: 'Context' },
  { key: 'review', label: 'Review' },
];

/** Minimal numbered progress indicator for the valuation wizard. */
export function StepIndicator({ current }: { current: ValuationStep }) {
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
              {step.label}
            </span>
            {index < STEPS.length - 1 ? <span className="h-px w-8 bg-border" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
