import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, setLanguage } from '../i18n';

/** Compact EN / हिं language toggle. */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.split('-')[0];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-full px-2.5 py-1 font-body text-xs transition-colors ${
            current === lang.code ? 'bg-ink text-cream' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={current === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
