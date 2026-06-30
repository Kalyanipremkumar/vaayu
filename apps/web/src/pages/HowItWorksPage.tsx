import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { VALUATION_DISCLAIMER } from '@vaayu/shared';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

/** Public page explaining Vaayu's valuation methodology and the gallerist's checklist. */
export function HowItWorksPage() {
  const { t } = useTranslation();
  const layers = [1, 2, 3].map((n) => ({
    n: String(n).padStart(2, '0'),
    title: t(`howItWorks.layer${n}Title`),
    body: t(`howItWorks.layer${n}Body`),
  }));
  const questions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => t(`howItWorks.q${n}`));

  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-body text-sm font-medium uppercase tracking-[0.3em] text-ink">
          Vaayu
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/signup"
            className="font-body text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {t('common.getStarted')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-gold">
          {t('howItWorks.kicker')}
        </p>
        <h1 className="mt-3 font-heading text-4xl text-ink md:text-5xl">
          <Trans
            i18nKey="howItWorks.title"
            components={{ 1: <em className="italic text-gold" /> }}
          />
        </h1>
        <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-muted">
          {t('howItWorks.intro')}
        </p>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-ink">{t('howItWorks.layersTitle')}</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {layers.map((l) => (
              <div key={l.n} className="bg-cream p-6">
                <span className="font-heading text-4xl text-gold">{l.n}</span>
                <h3 className="mt-3 font-heading text-xl text-ink">{l.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{l.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-sm text-muted">{t('howItWorks.formula')}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-ink">{t('howItWorks.checklistTitle')}</h2>
          <p className="mt-2 font-body text-sm text-muted">{t('howItWorks.checklistLead')}</p>
          <ol className="mt-6 space-y-3">
            {questions.map((q, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-heading text-lg text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-body text-sm leading-relaxed text-ink">{q}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl border border-border bg-gold/[0.05] p-4 font-body text-sm text-ink">
            <span className="font-medium">{t('howItWorks.hypeLabel')}</span>{' '}
            {t('howItWorks.hypeBody')}
          </p>
        </section>

        <section className="mt-14 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="font-heading text-3xl text-cream">{t('howItWorks.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-cream/70">
            {t('howItWorks.ctaLead')}
          </p>
          <div className="mt-6">
            <Link to="/signup">
              <Button variant="orange">{t('common.getStarted')}</Button>
            </Link>
          </div>
        </section>

        <p className="mt-10 font-body text-xs leading-relaxed text-muted">{VALUATION_DISCLAIMER}</p>
      </main>
    </div>
  );
}
