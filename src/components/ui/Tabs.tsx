import React from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: 'segmented' | 'underline';
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, variant = 'segmented', className = '' }: TabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div role="tablist" className={`-mb-px flex gap-5 overflow-x-auto ${className}`}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(it.id)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ${active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-muted hover:text-ink'}`}>
              
              {it.label}
              {it.count !== undefined && <span className="ml-1.5 tabular-nums text-ink-subtle">{it.count}</span>}
            </button>);

        })}
      </div>);

  }
  return (
    <div className={`max-w-full overflow-x-auto ${className}`}>
      <div role="tablist" className="inline-flex items-center gap-1 rounded-lg bg-canvas p-1 ring-1 ring-inset ring-line">
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(it.id)}
              className={`h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors duration-150 ${active ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}>
              
              {it.label}
              {it.count !== undefined && <span className={`ml-1.5 tabular-nums ${active ? 'text-ink-muted' : 'text-ink-subtle'}`}>{it.count}</span>}
            </button>);

        })}
      </div>
    </div>);

}