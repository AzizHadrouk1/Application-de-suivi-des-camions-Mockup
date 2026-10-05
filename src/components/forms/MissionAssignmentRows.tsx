import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { Driver, MissionAssignment, Truck } from '../../types/fleet';
import { Field, inputClass } from '../ui/Field';
import { SelectInput } from '../ui/SelectInput';

interface MissionAssignmentRowsProps {
  rows: MissionAssignment[];
  trucks: Truck[];
  drivers: Driver[];
  missionId: string;
  tripsTarget: number;
  onChange: (rows: MissionAssignment[]) => void;
}

export function MissionAssignmentRows({ rows, trucks, drivers, missionId, tripsTarget, onChange }: MissionAssignmentRowsProps) {
  const assigned = rows.reduce((s, r) => s + (r.truckId ? r.trips : 0), 0);
  const diff = assigned - tripsTarget;

  const update = (i: number, patch: Partial<MissionAssignment>) => onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const insertAfter = (i: number) => onChange([...rows.slice(0, i + 1), { truckId: '', driverId: '', trips: 1 }, ...rows.slice(i + 1)]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-2 text-xs">
        <span className="text-ink-muted">
          Voyages répartis <span className="font-semibold tabular-nums text-ink">{assigned}</span> / <span className="tabular-nums">{tripsTarget}</span>
        </span>
        {diff !== 0 &&
        <span className={`font-medium ${diff > 0 ? 'text-warn-700' : 'text-ink-muted'}`}>
            {diff > 0 ? `${diff} voyage(s) au-delà de l’objectif` : `${-diff} voyage(s) restant(s) à répartir`}
          </span>
        }
        {diff === 0 && <span className="font-medium text-ok-700">Objectif entièrement réparti</span>}
      </div>

      <ul className="divide-y divide-line">
        {rows.map((r, i) => {
          const usedTrucks = rows.filter((_, idx) => idx !== i).map((x) => x.truckId);
          const usedDrivers = rows.filter((_, idx) => idx !== i).map((x) => x.driverId);
          return (
            <li key={i} className="grid grid-cols-[1fr_1fr] gap-3 py-4 first:pt-0 sm:grid-cols-[1fr_1fr_150px_auto] sm:items-end">
              <Field label="Camion">
                <SelectInput
                  value={r.truckId}
                  placeholder="Choisir un camion"
                  onChange={(e) => {
                    const t = trucks.find((x) => x.id === e.target.value);
                    update(i, { truckId: e.target.value, driverId: r.driverId || (t?.driverId && !usedDrivers.includes(t.driverId) ? t.driverId : '') });
                  }}
                  options={trucks.
                  filter((t) => !usedTrucks.includes(t.id)).
                  map((t) => {
                    const busy = t.missionId && t.missionId !== missionId;
                    return { value: t.id, label: `${t.id} · ${t.plate}${busy ? ` (${t.missionId})` : t.status === 'available' ? ' · disponible' : ''}` };
                  })} />
                
              </Field>
              <Field label="Chauffeur">
                <SelectInput
                  value={r.driverId}
                  placeholder="Choisir un chauffeur"
                  onChange={(e) => update(i, { driverId: e.target.value })}
                  options={drivers.filter((d) => !usedDrivers.includes(d.id)).map((d) => ({ value: d.id, label: d.name }))} />
                
              </Field>
              <Field label="Nombre de voyages">
                <input type="number" min={1} value={r.trips} onChange={(e) => update(i, { trips: Math.max(1, Number(e.target.value) || 1) })} className={`${inputClass} tabular-nums`} />
              </Field>
              <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
                {rows.length > 1 &&
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Retirer la ligne ${i + 1}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted transition-colors duration-150 hover:border-danger-100 hover:bg-danger-50 hover:text-danger-600">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                }
                <button
                  type="button"
                  onClick={() => insertAfter(i)}
                  aria-label="Ajouter un camion"
                  title="Ajouter un camion"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line text-brand-600 transition-colors duration-150 hover:border-brand-200 hover:bg-brand-50">
                  
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}