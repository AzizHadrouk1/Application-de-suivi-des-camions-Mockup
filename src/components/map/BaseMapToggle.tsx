import React from 'react';
import { MapIcon, SatelliteIcon } from 'lucide-react';
import type { BaseMap } from '../../types/map';

const OPTIONS: {id: BaseMap;label: string;icon: typeof MapIcon;}[] = [
{ id: 'plan', label: 'Plan', icon: MapIcon },
{ id: 'satellite', label: 'Satellite', icon: SatelliteIcon }];


export function BaseMapToggle({ value, onChange }: {value: BaseMap;onChange: (v: BaseMap) => void;}) {
  return (
    <div role="radiogroup" aria-label="Fond de carte" className="flex gap-0.5 rounded-lg bg-white p-1 shadow-pop ring-1 ring-line">
      {OPTIONS.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors duration-150 ${active ? 'bg-navy-900 text-white' : 'text-ink-muted hover:text-ink'}`}>
            
            <o.icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{o.label}</span>
          </button>);

      })}
    </div>);

}