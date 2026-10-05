import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
  compact?: boolean;
}

export function SelectInput({ options, placeholder, compact = false, className = '', ...rest }: SelectInputProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        className={`w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-8 text-ink transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${compact ? 'h-8 text-xs' : 'h-9 text-sm'}`}
        {...rest}>
        
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) =>
        <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
    </div>);

}