import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FileDownIcon, FileSpreadsheetIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import type { LiveTruck, TruckStatus } from '../../types/fleet';
import { healthMeta, healthOrder, stageMeta } from '../../utils/status';
import { toneDot } from '../ui/Badge';
import { inputClass } from '../ui/Field';
import { ProgressBar } from '../ui/ProgressBar';
import { SelectInput } from '../ui/SelectInput';
import { TruckTableRow } from './TruckTableRow';

interface TruckListPanelProps {
  trucks: LiveTruck[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenMission: (id: string) => void;
  className?: string;
}

type StatusFilter = 'all' | TruckStatus;
type SortKey = 'health' | 'plate' | 'speed' | 'update' | 'driver';

const CHIPS: {id: StatusFilter;label: string;}[] = [
{ id: 'all', label: 'Tous' },
{ id: 'mission', label: 'En mission' },
{ id: 'available', label: 'Disponibles' },
{ id: 'off_mission', label: 'Hors mission' }];


const COLUMNS: {key: SortKey | null;label: string;className: string;}[] = [
{ key: 'plate', label: 'Véhicule', className: 'pl-4 pr-3' },
{ key: 'speed', label: 'Vitesse', className: 'px-3' },
{ key: 'update', label: 'Date / heure', className: 'px-3' },
{ key: 'driver', label: 'Chauffeur', className: 'px-3' },
{ key: null, label: 'Mission · étape', className: 'px-3' },
{ key: null, label: 'Actions', className: 'pl-2 pr-3 text-right' }];


export function TruckListPanel({ trucks, selectedId, onSelect, onOpenMission, className = '' }: TruckListPanelProps) {
  const { missions, drivers, driverById, shipById } = useFleetData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [mission, setMission] = useState('');
  const [driver, setDriver] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<{key: SortKey;dir: 1 | -1;}>({ key: 'health', dir: 1 });
  const running = missions.filter((m) => m.status === 'running');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const driverName = (t: LiveTruck) => t.driverId ? driverById[t.driverId]?.name ?? '' : '';
    const cmp: Record<SortKey, (a: LiveTruck, b: LiveTruck) => number> = {
      health: (a, b) => healthOrder[a.health] - healthOrder[b.health] || a.id.localeCompare(b.id),
      plate: (a, b) => a.plate.localeCompare(b.plate),
      speed: (a, b) => truckSpeed(a) - truckSpeed(b),
      update: (a, b) => b.lastUpdateSec - a.lastUpdateSec,
      driver: (a, b) => driverName(a).localeCompare(driverName(b))
    };
    return trucks.
    filter((t) => status === 'all' ? true : t.status === status).
    filter((t) => mission ? t.missionId === mission : true).
    filter((t) => driver ? t.driverId === driver : true).
    filter((t) => !q || `${t.id} ${t.plate} ${t.name} ${driverName(t)} ${t.missionId ?? ''}`.toLowerCase().includes(q)).
    sort((a, b) => cmp[sort.key](a, b) * sort.dir);
  }, [trucks, status, mission, driver, query, driverById, sort]);

  const counts: Record<StatusFilter, number> = {
    all: trucks.length,
    mission: trucks.filter((t) => t.status === 'mission').length,
    available: trucks.filter((t) => t.status === 'available').length,
    off_mission: trucks.filter((t) => t.status === 'off_mission').length
  };
  const secondary = [mission, driver].filter(Boolean).length;

  const toggleSort = (key: SortKey) => setSort((s) => s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 });

  const exportCsv = () => {
    const rows = [
    ['Véhicule', 'Immatriculation', 'Vitesse (km/h)', 'Chauffeur', 'Mission', 'Étape'],
    ...filtered.map((t) => [t.id, t.plate, String(truckSpeed(t)), t.driverId ? driverById[t.driverId]?.name ?? '' : '', t.missionId ?? '', stageMeta[t.stage].label])];

    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suivi-vehicules.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export Excel', { description: `${filtered.length} véhicules exportés.` });
  };

  return (
    <aside aria-label="Liste des véhicules" className={`flex h-full min-h-0 flex-col border-r border-line bg-white ${className}`}>
      <div className="space-y-2.5 border-b border-line p-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher dans le tableau…" aria-label="Rechercher un véhicule" className={`${inputClass} pl-9`} />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            aria-label="Filtres"
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors duration-150 ${showFilters || secondary ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line text-ink hover:bg-canvas'}`}>
            
            <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
            {secondary > 0 && <span className="tabular-nums">{secondary}</span>}
          </button>
          <button type="button" onClick={() => toast('Export PDF', { description: 'Génération du rapport de suivi (démo).' })} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-canvas">
            <FileDownIcon className="h-4 w-4" aria-hidden />
            PDF
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-canvas">
            <FileSpreadsheetIcon className="h-4 w-4" aria-hidden />
            Excel
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Statut">
          {CHIPS.map((c) => {
            const active = status === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStatus(c.id)}
                className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-semibold ring-1 ring-inset transition-colors duration-150 ${active ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-muted ring-line hover:text-ink'}`}>
                
                {c.label}
                <span className={`tabular-nums ${active ? 'text-white/75' : 'text-ink-subtle'}`}>{counts[c.id]}</span>
              </button>);

          })}
        </div>

        {showFilters &&
        <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <SelectInput compact aria-label="Mission" placeholder="Toutes missions" value={mission} onChange={(e) => setMission(e.target.value)} options={running.map((m) => ({ value: m.id, label: m.id }))} />
              <SelectInput compact aria-label="Chauffeur" placeholder="Tous chauffeurs" value={driver} onChange={(e) => setDriver(e.target.value)} options={drivers.map((d) => ({ value: d.id, label: d.name }))} />
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {running.map((m) =>
            <li key={m.id}>
                  <div className={`rounded-lg px-2.5 py-2 ring-1 ring-inset transition-colors duration-150 ${mission === m.id ? 'bg-brand-50 ring-brand-200' : 'ring-line'}`}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <button type="button" onClick={() => setMission(mission === m.id ? '' : m.id)} aria-pressed={mission === m.id} className="min-w-0 truncate text-left">
                        <span className="font-semibold text-ink">{m.id}</span> <span className="text-ink-muted">· {shipById[m.shipId]?.name}</span>
                      </button>
                      <button type="button" onClick={() => onOpenMission(m.id)} className="shrink-0 font-semibold text-brand-700 hover:underline">
                        Voir
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={m.tripsDone / m.tripsTarget} className="flex-1" label={`Progression ${m.id}`} />
                      <span className="shrink-0 text-[11px] tabular-nums text-ink-subtle">
                        {m.tripsDone}/{m.tripsTarget}
                      </span>
                    </div>
                  </div>
                </li>
            )}
            </ul>
          </div>
        }
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {COLUMNS.map((c) => {
                const active = c.key !== null && sort.key === c.key;
                const SortIcon = !active ? ArrowUpDownIcon : sort.dir === 1 ? ArrowUpIcon : ArrowDownIcon;
                return (
                  <th
                    key={c.label}
                    scope="col"
                    aria-sort={active ? sort.dir === 1 ? 'ascending' : 'descending' : undefined}
                    className={`sticky top-0 z-[1] whitespace-nowrap bg-brand-600 py-3 text-left text-[13px] font-semibold text-white ${c.className}`}>
                    
                    {c.key ?
                    <button type="button" onClick={() => toggleSort(c.key as SortKey)} className="inline-flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-80">
                        {c.label}
                        <SortIcon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-white/60'}`} aria-hidden />
                      </button> :

                    c.label
                    }
                  </th>);

              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) =>
            <TruckTableRow
              key={t.id}
              truck={t}
              driver={t.driverId ? driverById[t.driverId] : undefined}
              speed={truckSpeed(t)}
              selected={t.id === selectedId}
              onSelect={onSelect}
              onOpenMission={onOpenMission} />

            )}
            {filtered.length === 0 &&
            <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-sm text-ink-muted">
                  Aucun véhicule ne correspond aux filtres.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-[11px] text-ink-muted">
        <span className="font-semibold text-ink">
          {filtered.length} <span className="font-normal text-ink-muted">/ {trucks.length} véhicules</span>
        </span>
        {(['normal', 'warning', 'alert', 'offline'] as const).map((h) =>
        <span key={h} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className={`h-2 w-2 rounded-full ${toneDot[healthMeta[h].tone]}`} />
            {healthMeta[h].label} <span className="tabular-nums text-ink-subtle">{trucks.filter((t) => t.health === h).length}</span>
          </span>
        )}
      </footer>
    </aside>);

}

function truckSpeed(t: LiveTruck): number {
  if (t.gps === 'offline') return 0;
  if (t.stage !== 'outbound' && t.stage !== 'return') return 0;
  const seed = t.id.charCodeAt(t.id.length - 1) * 7 % 12;
  return Math.round(Math.min(78, 38 + seed + 20 * t.speedFactor));
}