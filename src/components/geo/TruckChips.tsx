import React from 'react';
import type { LiveTruck } from '../../types/fleet';
import { healthMeta } from '../../utils/status';
import { toneDot } from '../ui/Badge';

export function TruckChips({ trucks }: {trucks: LiveTruck[];}) {
  if (trucks.length === 0) return <span className="font-normal text-ink-subtle">Aucun</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {trucks.map((t) =>
      <span key={t.id} className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink ring-1 ring-inset ring-line">
          <span className={`h-1.5 w-1.5 rounded-full ${toneDot[healthMeta[t.health].tone]}`} />
          {t.id}
        </span>
      )}
    </span>);

}