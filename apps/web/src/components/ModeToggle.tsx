import { useTranslation } from 'react-i18next';
import type { AppMode } from '@vaayu/shared';
import { useAppMode } from '../store/appModeStore';

interface ModeToggleProps {
  /** 'light' for dark backgrounds (the ink hero), 'dark' for the cream canvas. */
  variant?: 'light' | 'dark';
  /** Called after the mode changes — e.g. to navigate. */
  onChange?: (mode: AppMode) => void;
}

const MODES: AppMode[] = ['collector', 'artist'];

/** Segmented "For Collectors / For Artists" toggle backed by the app-mode store. */
export function ModeToggle({ variant = 'dark', onChange }: ModeToggleProps) {
  const { t } = useTranslation();
  const { mode, setMode } = useAppMode();
  const light = variant === 'light';

  return (
    <div
      className={`inline-flex rounded-full p-1 ${light ? 'bg-cream/10' : 'border border-border bg-cream'}`}
      role="tablist"
      aria-label={t('mode.toggleLabel')}
    >
      {MODES.map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => {
              setMode(m);
              onChange?.(m);
            }}
            className={`rounded-full px-4 py-1.5 font-body text-sm transition-colors ${
              active
                ? 'bg-gold text-ink'
                : light
                  ? 'text-cream/70 hover:text-cream'
                  : 'text-muted hover:text-ink'
            }`}
          >
            {t(m === 'collector' ? 'mode.forCollectors' : 'mode.forArtists')}
          </button>
        );
      })}
    </div>
  );
}
