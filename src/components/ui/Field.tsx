import React from 'react';

export const inputClass =
'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-subtle">{hint}</span>}
    </label>);

}