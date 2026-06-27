import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Field-level error message, shown beneath the input. */
  error?: string;
}

/** Labelled text input matching the Vaayu form style. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-body text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`rounded-md border bg-cream px-3.5 py-2.5 font-body text-ink placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          error ? 'border-red-700' : 'border-border'
        } ${className}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? <p className="font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
});
