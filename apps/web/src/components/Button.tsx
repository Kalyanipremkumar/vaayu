import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'gold' | 'orange' | 'outline' | 'outlineLight' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 font-body text-sm font-medium tracking-wide transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

const variants: Record<Variant, string> = {
  // Deep ink, cream text — the default editorial button.
  primary: 'bg-ink text-cream hover:bg-ink/90',
  // Warm gold, ink text — for primary CTAs, especially on the dark hero.
  gold: 'bg-gold text-ink hover:bg-gold/90',
  // Vivid orange, cream text — the highest-emphasis conversion CTA.
  orange: 'bg-orange text-cream hover:bg-orange/90',
  // Hairline outline on light backgrounds.
  outline: 'border border-border bg-transparent text-ink hover:bg-ink/[0.04]',
  // Outline for dark backgrounds (cream border + text).
  outlineLight: 'border border-cream/40 bg-transparent text-cream hover:bg-cream/10',
  // Quiet text button.
  ghost: 'bg-transparent text-ink hover:bg-ink/[0.04]',
};

/** Brand button. Pill shape, ink/cream/gold palette, quiet motion, no shadows. */
export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
