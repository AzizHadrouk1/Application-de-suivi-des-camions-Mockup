import React from 'react';
import { toneText, type Tone } from './Badge';

export interface StatItem {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
}

export function StatStrip({ items }: {items: StatItem[];}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-card sm:grid-cols-3 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
      {items.map((it) =>
      <div key={it.label} className="bg-white px-5 py-4">
          <p className="text-xs font-medium text-ink-muted">{it.label}</p>
          <p className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${it.tone ? toneText[it.tone] : 'text-ink'}`}>{it.value}</p>
          {it.hint && <p className="mt-1 text-xs text-ink-subtle">{it.hint}</p>}
        </div>
      )}
    </div>);

}