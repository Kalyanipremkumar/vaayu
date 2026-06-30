import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional footer link row beneath the card. */
  footer?: ReactNode;
}

/** Centered, editorial shell shared by all auth screens. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center gap-2">
          <img src="/vaayu-mark.png" alt="Vaayu" className="h-14 w-auto" />
          <span className="font-heading text-2xl font-medium tracking-wide text-ink">Vaayu</span>
        </Link>
        <div className="rounded-lg border border-border bg-cream p-8">
          <h1 className="font-heading text-3xl text-ink">{title}</h1>
          {subtitle ? <p className="mt-2 font-body text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-center font-body text-sm text-muted">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
