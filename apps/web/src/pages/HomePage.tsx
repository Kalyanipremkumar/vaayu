import { Link } from 'react-router-dom';
import { FREE_VALUATION_LIMIT } from '@vaayu/shared';
import { Button } from '../components/Button';

const LAYERS = [
  {
    n: '01',
    title: 'Base value',
    body: 'A market benchmark drawn from the tradition and medium — Mithila, Warli, oil, print, and beyond.',
  },
  {
    n: '02',
    title: 'Artist multiplier',
    body: 'Recognition tier, from emerging to blue-chip, applied with conservative, defensible bands.',
  },
  {
    n: '03',
    title: 'Work adjustment',
    body: 'Condition, dimensions, materials, theme rarity, and provenance — the qualities that move a price.',
  },
];

/**
 * Landing page. A dark ink hero with gold accents over Vaayu's cream canvas,
 * Cormorant Garamond display type, then the three-layer methodology, editorial
 * and quiet but premium.
 */
export function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-body text-sm font-medium uppercase tracking-[0.3em] text-ink">
          Vaayu
        </span>
        <nav className="flex items-center gap-6">
          <Link
            to="/how-it-works"
            className="font-body text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            How it works
          </Link>
          <Link
            to="/login"
            className="font-body text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {/* Hero */}
        <section className="overflow-hidden rounded-2xl bg-ink px-8 py-16 text-center md:px-16 md:py-24">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-gold">
            AI · Art Valuation
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-5xl font-medium leading-[1.05] text-cream md:text-7xl">
            Know what your art is <em className="italic text-gold">worth</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-cream/70 md:text-lg">
            Upload a photograph, add a little context, and receive an AI valuation with a
            defensible, layer-by-layer pricing report — grounded in Indian folk art and global
            fine-art markets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="gold">Get started — it’s free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outlineLight">Sign in</Button>
            </Link>
          </div>
          <p className="mt-6 font-body text-xs text-cream/40">
            Your first {FREE_VALUATION_LIMIT} valuations are free. AI-generated guidance, not a
            certified appraisal.
          </p>
        </section>

        {/* Methodology */}
        <section className="mt-20">
          <p className="text-center font-body text-xs uppercase tracking-[0.25em] text-gold">
            The methodology
          </p>
          <h2 className="mt-3 text-center font-heading text-4xl font-medium text-ink md:text-5xl">
            Three layers, <em className="italic text-gold">fully shown</em>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center font-body text-sm leading-relaxed text-muted">
            Every valuation is transparent. You see exactly how the number was built — no black box.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {LAYERS.map((layer) => (
              <div key={layer.n} className="bg-cream p-8">
                <span className="font-heading text-4xl font-medium text-gold">{layer.n}</span>
                <h3 className="mt-4 font-heading text-2xl text-ink">{layer.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{layer.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="mt-20 text-center">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-medium leading-tight text-ink md:text-4xl">
            Value your first piece in under a minute.
          </h2>
          <div className="mt-8">
            <Link to="/signup">
              <Button variant="primary">Start a valuation</Button>
            </Link>
          </div>
          <p className="mt-16 font-heading text-lg italic text-gold">
            Where every work finds its worth.
          </p>
        </section>
      </main>
    </div>
  );
}
