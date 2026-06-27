import { type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  /** Placeholder shown as a disabled first option when no value is selected. */
  placeholder?: string;
  error?: string;
}

/** Labelled native select styled to match Vaayu forms. */
export function SelectField({
  label,
  options,
  placeholder,
  error,
  id,
  className = '',
  value,
  ...rest
}: SelectFieldProps) {
  const selectId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="font-body text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        className={`rounded-md border bg-cream px-3.5 py-2.5 font-body text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          error ? 'border-red-700' : 'border-border'
        } ${className}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
