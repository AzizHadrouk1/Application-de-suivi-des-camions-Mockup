import React from 'react';
import { motion } from 'framer-motion';
import { CircleAlertIcon, CircleCheckIcon, CrosshairIcon, HistoryIcon, TruckIcon, XIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import type { LiveTruck } from '../../types/fleet';
import type { TruckDetailTab } from '../../types/map';
import { fmtNum } from '../../utils/format';
import { alertTypeLabel, healthMeta, stageMeta, truckStatusMeta } from '../../utils/status';
import { Badge, toneDot } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TruckSummaryCardProps {
  truck: LiveTruck;
  onClose: () => void;
  onOpenDetails: (tab: TruckDetailTab) => void;
  onOpenMission: (id: string) => void;
  follow: boolean;
  onToggleFollow: () => void;
}

export function TruckSummaryCard({ truck, onClose, onOpenDetails, onOpenMission, follow, onToggleFollow }: TruckSummaryCardProps) {
  const { driverById, missionById, shipById, alerts } = useFleetData();
  const driver = truck.driverId ? driverById[truck.driverId] : undefined;
  const mission = truck.missionId ? missionById[truck.missionId] : undefined;
  const ship = mission ? shipById[mission.shipId] : undefined;
  const openAlerts = alerts.filter((a) => a.truckId === truck.id && a.status !== 'resolved');
  const late = truck.stageDelay > 0.05;
  const status = truckStatusMeta[truck.status];

  const rows: {label: string;value: React.ReactNode;span?: boolean;}[] = [
  { label: 'Chauffeur', value: driver?.name ?? '—' },
  {
    label: 'Mission',
    value: mission ?
    <button type="button" onClick={() => onOpenMission(mission.id)} className="text-left font-medium text-brand-700 hover:underline">
          Chargement {mission.id}
        </button> :

    'Aucune'

  },
  { label: 'Étape actuelle', value: stageMeta[truck.stage].label },
  { label: 'Voyage', value: truck.status === 'mission' ? `${Math.min(truck.tripsDone + 1, truck.tripsTarget)} / ${truck.tripsTarget}` : '—' },
  { label: 'Position actuelle', value: `${stageMeta[truck.stage].location}${ship ? ` · ${ship.name}` : ''}`, span: true }];


  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      role="region"
      aria-label={`Camion ${truck.id}`}
      className="pointer-events-auto w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-xl bg-white shadow-pop ring-1 ring-line">
      
      <div className="flex items-start gap-3 px-4 pt-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white ${toneDot[healthMeta[truck.health].tone]}`}>
          <TruckIcon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[15px] font-semibold text-ink">{truck.id}</p>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>
          <p className="truncate text-xs text-ink-muted">
            {truck.plate} · {truck.type}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink">
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 px-4">
        {rows.map((r) =>
        <div key={r.label} className={r.span ? 'col-span-2' : ''}>
            <dt className="text-[11px] text-ink-muted">{r.label}</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-ink">{r.value}</dd>
          </div>
        )}
      </dl>

      {truck.stageExpected > 0 &&
      <div className="mx-4 mt-3 grid grid-cols-3 divide-x divide-line rounded-lg bg-canvas py-2 text-center">
          <div>
            <p className="text-[11px] text-ink-muted">Durée actuelle</p>
            <p className="text-sm font-semibold tabular-nums text-ink">{fmtNum(truck.stageElapsed)} min</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted">Prévue</p>
            <p className="text-sm font-semibold tabular-nums text-ink">{fmtNum(truck.stageExpected)} min</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted">Retard</p>
            <p className={`text-sm font-semibold tabular-nums ${late ? 'text-danger-600' : 'text-ok-600'}`}>{late ? `+${fmtNum(truck.stageDelay)} min` : 'À l’heure'}</p>
          </div>
        </div>
      }

      <div className="mx-4 mt-3 flex items-center gap-2 text-xs">
        {openAlerts.length > 0 ?
        <>
            <CircleAlertIcon className="h-4 w-4 shrink-0 text-danger-600" aria-hidden />
            <span className="truncate font-medium text-danger-700">{alertTypeLabel[openAlerts[0].type]}</span>
            {openAlerts.length > 1 && <span className="text-ink-muted">+{openAlerts.length - 1}</span>}
          </> :

        <>
            <CircleCheckIcon className="h-4 w-4 shrink-0 text-ok-600" aria-hidden />
            <span className="text-ink-muted">Aucune alerte active</span>
          </>
        }
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-line px-4 py-3">
        <Button variant="primary" size="sm" className="flex-1" onClick={() => onOpenDetails('overview')}>
          Voir détails
        </Button>
        <Button size="sm" icon={HistoryIcon} onClick={() => onOpenDetails('timeline')}>
          Timeline
        </Button>
        <Button size="sm" variant={follow ? 'dark' : 'secondary'} icon={CrosshairIcon} aria-pressed={follow} onClick={onToggleFollow}>
          Suivre
        </Button>
      </div>
    </motion.div>);

}