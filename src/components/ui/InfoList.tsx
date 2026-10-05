import React from 'react';

export interface InfoItem {
  label: string;
  value: React.ReactNode;
  span?: boolean;
}

export function InfoList({ items, columns = 2 }: {items: InfoItem[];columns?: 2 | 3;}) {
  return (
    <dl className={`grid gap-x-6 gap-y-3.5 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
      {items.map((it) =>
      <div key={it.label} className={it.span ? 'col-span-full' : ''}>
          <dt className="text-xs text-ink-muted">{it.label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{it.value}</dd>
        </div>
      )}
    </dl>);

}