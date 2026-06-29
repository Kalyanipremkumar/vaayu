import { Link } from 'react-router-dom';
import { VALUATION_DISCLAIMER } from '@vaayu/shared';
import { Button } from '../components/Button';

const LAYERS = [
  {
    n: '01',
    title: 'Base value',
    body: 'Every tradition and medium has a market rate — often expressed per square foot. Vaayu starts from that benchmark (e.g. Mithila, Warli, oil, print), the same square-foot logic galleries use.',
  },
  {
    n: '02',
    title: 'Artist multiplier',
    body: 'The artist’s standing moves the price up or down. Vaayu weighs the gallerist’s checklist (below) and places the work on a tier — emerging, mid-career, established, or renowned.',
  },
  {
    n: '03',
    title: 'Work-level adjustment',
    body: 'Finally, the specific piece: condition, size, materials, theme rarity, and provenance. A standout example earns a premium; problems earn a discount — what curators have always done by intuition.',
  },
];

const CHECKLIST = [
  'What is the artist’s education and training?',
  'Where have they exhibited, and with whom?',
  'Do they show range across styles, subjects, and mediums?',
  'Who are their collectors? Any institutions or respected names?',
  'Is the artist’s work featured in credible publications?',
  'Does the per-square-foot rate align with all of the above?',
  'Are you buying from a reputed gallery or curator?',
  'Having seen enough other work, does the price feel right to your conviction?',
  'Is the price grounded in quality — or inflated by hype?',
];

/** Public page explaining Vaayu's valuation methodology and the gallerist's checklist. */
export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-body text-sm font-medium uppercase tracking-[0.3em] text-ink">
          Vaayu
        </Link>
        <Link
          to="/signup"
          className="font-body text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Get started
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-gold">How it works</p>
        <h1 className="mt-3 font-heading text-4xl text-ink md:text-5xl">
          Professional-grade valuation, <em className="italic text-gold">made transparent</em>.
        </h1>
        <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-muted">
          Valuing art has always needed experienced gallerists — the parameters are complex and
          qualitative. Vaayu applies that same discipline with AI: consistently, transparently, and
          at scale. Here is exactly how the number is built.
        </p>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-ink">The three layers</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {LAYERS.map((l) => (
              <div key={l.n} className="bg-cream p-6">
                <span className="font-heading text-4xl text-gold">{l.n}</span>
                <h3 className="mt-3 font-heading text-xl text-ink">{l.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{l.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-sm text-muted">
            <span className="text-ink">Estimate</span> = base value × artist multiplier × work
            adjustment, shown as a low–mid–high range with a confidence score.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-ink">The questions a gallerist asks</h2>
          <p className="mt-2 font-body text-sm text-muted">
            Before paying for a work, run through these. Vaayu weighs the same parameters in Layer 2
            — and the more of this you can add (in the artist name and provenance notes), the
            sharper and more confident the estimate.
          </p>
          <ol className="mt-6 space-y-3">
            {CHECKLIST.map((q, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-heading text-lg text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-body text-sm leading-relaxed text-ink">{q}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl border border-border bg-gold/[0.05] p-4 font-body text-sm text-ink">
            <span className="font-medium">The hype check:</span> a high price should be grounded in
            quality and verifiable standing — not hype. When the inputs don’t justify a high figure,
            Vaayu keeps the estimate conservative <em>and</em> lowers the confidence score, rather
            than inflating both.
          </p>
        </section>

        <section className="mt-14 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="font-heading text-3xl text-cream">See it on your own work</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-cream/70">
            Your first three valuations are free.
          </p>
          <div className="mt-6">
            <Link to="/signup">
              <Button variant="gold">Get started</Button>
            </Link>
          </div>
        </section>

        <p className="mt-10 font-body text-xs leading-relaxed text-muted">{VALUATION_DISCLAIMER}</p>
      </main>
    </div>
  );
}
