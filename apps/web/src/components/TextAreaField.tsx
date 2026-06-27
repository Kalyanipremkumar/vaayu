import { type TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled textarea matching the Vaayu form style. */
export function TextAreaField({
  label,
  error,
  hint,
  id,
  className = '',
  ...rest
}: TextAreaFieldProps) {
  const fieldId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="font-body text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={4}
        className={`resize-y rounded-md border bg-cream px-3.5 py-2.5 font-body text-ink placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          error ? 'border-red-700' : 'border-border'
        } ${className}`}
        {...rest}
      />
      {hint && !error ? <p className="font-body text-xs text-muted">{hint}</p> : null}
      {error ? <p className="font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
