import { Link } from 'react-router-dom';

interface LogoProps {
  /** Where the logo links to. Defaults to the home page. */
  to?: string;
  /** Tailwind height class for the emblem, e.g. 'h-8'. */
  markClass?: string;
  /** Show the "Vaayu" wordmark next to the emblem. */
  wordmark?: boolean;
  /** Wordmark colour class (e.g. 'text-ink' on cream, 'text-cream' on dark). */
  wordmarkClass?: string;
  /** Wordmark size class. */
  wordmarkSize?: string;
  className?: string;
}

/**
 * Vaayu brand lockup — the two-feather emblem (warm + cool, mirroring the
 * Artist / Collector duality) beside the serif wordmark. Links home by default.
 */
export function Logo({
  to = '/',
  markClass = 'h-9',
  wordmark = true,
  wordmarkClass = 'text-ink',
  wordmarkSize = 'text-2xl',
  className = '',
}: LogoProps) {
  return (
    <Link
      to={to}
      aria-label="Vaayu — home"
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 ${className}`}
    >
      <img src="/vaayu-mark.png" alt="Vaayu" className={`${markClass} w-auto`} />
      {wordmark ? (
        <span className={`font-heading ${wordmarkSize} font-medium tracking-wide ${wordmarkClass}`}>
          Vaayu
        </span>
      ) : null}
    </Link>
  );
}
