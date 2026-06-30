import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ModeToggle } from '../components/ModeToggle';
import { useAppMode } from '../store/appModeStore';
import { env } from '../lib/env';

/**
 * Landing page. A dark ink hero with gold accents over Vaayu's cream canvas,
 * Cormorant Garamond display type, then the three-layer methodology. Bilingual
 * (English / Hindi) via react-i18next.
 */
export function HomePage() {
  const { t } = useTranslation();
  const { mode } = useAppMode();
  const isArtist = mode === 'artist';
  const layers = [1, 2, 3].map((n) => ({
    n: String(n).padStart(2, '0'),
    title: t(`landing.layer${n}Title`),
    body: t(`landing.layer${n}Body`),
  }));

  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-body text-sm font-medium uppercase tracking-[0.3em] text-ink">
          Vaayu
        </span>
        <nav className="flex items-center gap-5">
          <Link
            to="/how-it-works"
            className="font-body text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {t('common.howItWorks')}
          </Link>
          <Link
            to="/login"
            className="font-body text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {t('common.signIn')}
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="overflow-hidden rounded-2xl bg-ink px-8 py-16 text-center md:px-16 md:py-24">
          <div className="mb-8 flex justify-center">
            <ModeToggle variant="light" />
          </div>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-gold">
            {t(isArtist ? 'landingArtist.eyebrow' : 'landing.eyebrow')}
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-5xl font-medium leading-[1.05] text-cream md:text-7xl">
            <Trans
              i18nKey={isArtist ? 'landingArtist.headline' : 'landing.headline'}
              components={{ 1: <em className="italic text-gold" /> }}
            />
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-cream/70 md:text-lg">
            {t(isArtist ? 'landingArtist.lead' : 'landing.lead')}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="gold">
                {isArtist ? t('landingArtist.cta') : t('landing.getStartedFree')}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outlineLight">{t('common.signIn')}</Button>
            </Link>
          </div>
          <p className="mt-6 font-body text-xs text-cream/40">
            {isArtist
              ? t('landingArtist.freeNote')
              : t('landing.freeNote', { count: env.freeValuationLimit })}
          </p>
        </section>

        <section className="mt-20">
          <p className="text-center font-body text-xs uppercase tracking-[0.25em] text-gold">
            {t('landing.methodologyKicker')}
          </p>
          <h2 className="mt-3 text-center font-heading text-4xl font-medium text-ink md:text-5xl">
            <Trans
              i18nKey="landing.methodologyTitle"
              components={{ 1: <em className="italic text-gold" /> }}
            />
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center font-body text-sm leading-relaxed text-muted">
            {t('landing.methodologyLead')}
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {layers.map((layer) => (
              <div key={layer.n} className="bg-cream p-8">
                <span className="font-heading text-4xl font-medium text-gold">{layer.n}</span>
                <h3 className="mt-4 font-heading text-2xl text-ink">{layer.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{layer.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <p className="text-center font-body text-xs uppercase tracking-[0.25em] text-gold">
            {t('whyVaayu.kicker')}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center font-heading text-4xl font-medium text-ink md:text-5xl">
            <Trans
              i18nKey="whyVaayu.title"
              components={{ 1: <em className="italic text-gold" /> }}
            />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-body text-base leading-relaxed text-muted">
            <Trans i18nKey="whyVaayu.body" components={{ 1: <em className="italic text-ink" /> }} />
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-cream p-8">
                <h3 className="font-heading text-xl text-ink">{t(`whyVaayu.p${n}Title`)}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                  {t(`whyVaayu.p${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-medium leading-tight text-ink md:text-4xl">
            {t('landing.closingTitle')}
          </h2>
          <div className="mt-8">
            <Link to="/signup">
              <Button variant="primary">{t('landing.startValuation')}</Button>
            </Link>
          </div>
          <p className="mt-16 font-heading text-lg italic text-gold">{t('landing.tagline')}</p>
        </section>
      </main>
    </div>
  );
}
