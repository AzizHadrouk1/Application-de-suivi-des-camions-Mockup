import React, { useState } from 'react';
import { CalendarIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { inputClass } from './Field';
import { SelectInput } from './SelectInput';

export interface FilterValues {
  period: string;
  from: string;
  to: string;
  ship: string;
  mission: string;
  truck: string;
  driver: string;
  zone: string;
  status: string;
}

export const emptyFilters: FilterValues = { period: 'today', from: '', to: '', ship: '', mission: '', truck: '', driver: '', zone: '', status: '' };

interface FilterBarProps {
  value: FilterValues;
  onChange: (v: FilterValues) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const { ships, missions, trucks, drivers, stockZones, ports } = useFleetData();
  const [more, setMore] = useState(false);
  const set = (k: keyof FilterValues) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  const secondaryCount = [value.truck, value.driver, value.zone, value.status].filter(Boolean).length;
  const dirty = JSON.stringify(value) !== JSON.stringify(emptyFilters);

  return (
    <div className="rounded-xl border border-line bg-white p-3 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <SelectInput
            aria-label="Période"
            className="sm:w-48 [&_select]:pl-9"
            value={value.period}
            onChange={set('period')}
            options={[
            { value: 'today', label: 'Aujourd’hui · 05 oct.' },
            { value: 'yesterday', label: 'Hier' },
            { value: '7d', label: '7 derniers jours' },
            { value: '30d', label: '30 derniers jours' },
            { value: 'custom', label: 'Période personnalisée' }]
            } />
          
        </div>
        {value.period === 'custom' &&
        <div className="flex items-center gap-2">
            <input type="date" aria-label="Du" value={value.from} onChange={set('from')} className={`${inputClass} w-40`} />
            <span className="text-xs text-ink-subtle">au</span>
            <input type="date" aria-label="Au" value={value.to} onChange={set('to')} className={`${inputClass} w-40`} />
          </div>
        }
        <SelectInput aria-label="Navire" className="w-full sm:w-44" placeholder="Tous les navires" value={value.ship} onChange={set('ship')} options={ships.map((s) => ({ value: s.id, label: s.name }))} />
        <SelectInput aria-label="Mission" className="w-full sm:w-44" placeholder="Toutes les missions" value={value.mission} onChange={set('mission')} options={missions.map((m) => ({ value: m.id, label: m.id }))} />
        <button
          type="button"
          onClick={() => setMore((m) => !m)}
          aria-expanded={more}
          className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium ring-1 ring-inset transition-colors duration-150 ${more || secondaryCount ? 'bg-brand-50 text-brand-700 ring-brand-100' : 'bg-white text-ink ring-line hover:bg-canvas'}`}>
          
          <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
          Plus de filtres
          {secondaryCount > 0 && <span className="rounded bg-brand-600 px-1.5 text-[11px] font-semibold text-white">{secondaryCount}</span>}
        </button>
        {dirty &&
        <button type="button" onClick={() => onChange(emptyFilters)} className="ml-auto text-sm font-medium text-ink-muted hover:text-ink">
            Réinitialiser
          </button>
        }
      </div>
      {more &&
      <div className="mt-2 grid gap-2 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectInput aria-label="Camion" placeholder="Tous les camions" value={value.truck} onChange={set('truck')} options={trucks.map((t) => ({ value: t.id, label: `${t.id} · ${t.plate}` }))} />
          <SelectInput aria-label="Chauffeur" placeholder="Tous les chauffeurs" value={value.driver} onChange={set('driver')} options={drivers.map((d) => ({ value: d.id, label: d.name }))} />
          <SelectInput aria-label="Zone" placeholder="Toutes les zones" value={value.zone} onChange={set('zone')} options={[...stockZones, ...ports].map((z) => ({ value: z.id, label: z.name }))} />
          <SelectInput
          aria-label="Statut"
          placeholder="Tous les statuts"
          value={value.status}
          onChange={set('status')}
          options={[
          { value: 'mission', label: 'En mission' },
          { value: 'available', label: 'Disponible' },
          { value: 'off_mission', label: 'Hors mission' }]
          } />
        
        </div>
      }
    </div>);

}