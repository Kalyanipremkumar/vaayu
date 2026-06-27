import { FREE_VALUATION_LIMIT } from '@vaayu/shared';

/**
 * Landing page placeholder. Demonstrates the Vaayu design system (cream / ink /
 * gold, serif headings, generous whitespace, no shadows) and confirms the
 * @vaayu/shared workspace link resolves. Real marketing + auth entry come later.
 */
export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-4 font-body text-sm uppercase tracking-[0.2em] text-gold">Vaayu</p>
      <h1 className="font-heading text-5xl leading-tight text-ink md:text-6xl">
        Know what your art is worth.
      </h1>
      <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-muted">
        Upload a photo, add a little context, and receive an AI-powered valuation with a defensible,
        layer-by-layer pricing report — grounded in Indian folk art and global fine-art markets.
      </p>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-heading text-2xl text-ink">The three-layer methodology</h2>
        <ol className="mt-4 space-y-3 font-body text-muted">
          <li>
            <span className="font-semibold text-ink">1 — Base value.</span> A benchmark from the
            tradition and medium.
          </li>
          <li>
            <span className="font-semibold text-ink">2 — Artist multiplier.</span> Recognition tier,
            from emerging to blue-chip.
          </li>
          <li>
            <span className="font-semibold text-ink">3 — Work adjustment.</span> Condition, size,
            materials, provenance.
          </li>
        </ol>
      </div>

      <p className="mt-10 font-body text-sm text-muted">
        Your first {FREE_VALUATION_LIMIT} valuations are free.
      </p>
    </main>
  );
}
