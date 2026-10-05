import React from 'react';
import { ClipboardListIcon, EyeIcon } from 'lucide-react';
import type { Driver, LiveTruck } from '../../types/fleet';
import { fmtNum } from '../../utils/format';
import { healthMeta, stageMeta, truckStatusMeta } from '../../utils/status';
import { toneDot } from '../ui/Badge';

interface TruckTableRowProps {
  truck: LiveTruck;
  driver?: Driver;
  speed: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpenMission: (id: string) => void;
}

export function TruckTableRow({ truck, driver, speed, selected, onSelect, onOpenMission }: TruckTableRowProps) {
  const h = healthMeta[truck.health];
  const stale = truck.lastUpdateSec > 300;
  const at = new Date(Date.now() - truck.lastUpdateSec * 1000);

  return (
    <tr
      onClick={() => onSelect(truck.id)}
      aria-selected={selected}
      className={`cursor-pointer transition-colors duration-150 ${selected ? 'bg-brand-50' : 'hover:bg-canvas'}`}>
      
      <td className={`relative border-b border-line py-3 pl-4 pr-3 align-middle ${selected ? 'shadow-[inset_3px_0_0_theme(colors.brand.600)]' : ''}`}>
        <button type="button" onClick={() => onSelect(truck.id)} aria-current={selected ? 'true' : undefined} className="flex items-center gap-2 text-left focus-visible:outline-none">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[h.tone]}`} title={h.label} aria-label={h.label} />
          <span>
            <span className="block whitespace-nowrap text-[13px] font-semibold text-ink">{truck.plate}</span>
            <span className="block font-mono text-[11px] text-ink-subtle">{truck.id}</span>
          </span>
        </button>
      </td>
      <td className="border-b border-line px-3 py-3 align-middle">
        <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2 text-[11px] font-bold tabular-nums ${speed > 0 ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-ink-muted'}`}>
          {speed} km/h
        </span>
      </td>
      <td className="border-b border-line px-3 py-3 align-middle text-xs tabular-nums">
        <span className={`block whitespace-nowrap ${stale ? 'text-danger-600' : 'text-ink'}`}>{at.toLocaleDateString('fr-FR')}</span>
        <span className={`block whitespace-nowrap ${stale ? 'text-danger-600' : 'text-ink-muted'}`}>{at.toLocaleTimeString('fr-FR')}</span>
      </td>
      <td className="max-w-[140px] border-b border-line px-3 py-3 align-middle text-xs text-ink">
        <span className="line-clamp-2">{driver?.name ?? <span className="text-ink-subtle">Sans chauffeur</span>}</span>
      </td>
      <td className="border-b border-line px-3 py-3 align-middle text-xs">
        <span className={`block whitespace-nowrap font-semibold ${truck.missionId ? 'text-brand-700' : 'text-ink-muted'}`}>{truck.missionId ?? truckStatusMeta[truck.status].label}</span>
        <span className="block whitespace-nowrap text-ink-muted">
          {stageMeta[truck.stage].label}
          {truck.stageDelay > 0.05 && <span className="ml-1 font-semibold tabular-nums text-danger-600">+{fmtNum(truck.stageDelay)} min</span>}
        </span>
      </td>
      <td className="border-b border-line py-3 pl-2 pr-3 align-middle">
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="Localiser sur la carte"
            aria-label={`Localiser ${truck.plate}`}
            onClick={() => onSelect(truck.id)}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700">
            
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={truck.missionId ? `Voir mission ${truck.missionId}` : 'Aucune mission'}
            aria-label={truck.missionId ? `Voir mission ${truck.missionId}` : 'Aucune mission'}
            disabled={!truck.missionId}
            onClick={() => truck.missionId && onOpenMission(truck.missionId)}
            className="grid h-8 w-8 place-items-center rounded-md text-brand-600 transition-colors duration-150 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-line disabled:hover:bg-transparent">
            
            <ClipboardListIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>);

}