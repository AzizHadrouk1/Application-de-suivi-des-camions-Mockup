import React, { useRef } from 'react';
import { toast } from 'sonner';
import { DownloadIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import type { LiveTruck, Mission, Stage } from '../../types/fleet';
import { fmtDate, fmtMin } from '../../utils/format';
import { cycleTotal } from '../../utils/simulation';
import { alertTypeLabel, healthMeta, missionStatusMeta, stageMeta } from '../../utils/status';
import { Badge, toneDot } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DataTable } from '../ui/DataTable';
import { Drawer } from '../ui/Drawer';
import { InfoList } from '../ui/InfoList';
import { ProgressBar } from '../ui/ProgressBar';
import { CycleProgress } from './CycleProgress';

interface MissionDrawerProps {
  missionId: string | null;
  onClose: () => void;
  onSelectTruck?: (id: string) => void;
}

export function MissionDrawer({ missionId, onClose, onSelectTruck }: MissionDrawerProps) {
  const { missionById, shipById, stockZones, ports, driverById, alerts } = useFleetData();
  const { liveById } = useLiveFleet();
  const current = missionId ? missionById[missionId] : null;
  const lastRef = useRef<Mission | null>(null);
  if (current) lastRef.current = current;
  const mission = current ?? lastRef.current;
  if (!mission) return null;

  const ship = shipById[mission.shipId];
  const stock = stockZones.find((z) => z.id === mission.stockZoneId);
  const port = ports.find((p) => p.id === mission.portId);
  const trucks = mission.truckIds.map((id) => liveById[id]).filter((t): t is LiveTruck => !!t);
  const counts = trucks.reduce<Partial<Record<Stage, number>>>((acc, t) => ({ ...acc, [t.stage]: (acc[t.stage] ?? 0) + 1 }), {});
  const status = missionStatusMeta[mission.status];
  const remaining = Math.max(0, mission.tripsTarget - mission.tripsDone);
  const openAlerts = alerts.filter((a) => a.missionId === mission.id && a.status !== 'resolved');

  return (
    <Drawer
      open={!!current}
      onClose={onClose}
      width="lg"
      title={
      <span className="flex items-center gap-2">
          Mission {mission.id}
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        </span>
      }
      subtitle={`${ship?.name ?? '—'} · ${fmtDate(mission.date)} · ${stock?.name ?? '—'} → ${port?.name ?? '—'}`}
      footer={
      <Button icon={DownloadIcon} onClick={() => toast.success('Export PDF généré', { description: `Rapport ${mission.id}` })}>
          Exporter le rapport
        </Button>
      }>
      
      <div className="space-y-8">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">Voyages réalisés</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-ink">
                {mission.tripsDone} <span className="text-lg font-normal text-ink-subtle">/ {mission.tripsTarget}</span>
              </p>
            </div>
            <p className="pb-1 text-sm text-ink-muted">
              <span className="font-semibold tabular-nums text-ink">{remaining}</span> restants · {Math.round(mission.tripsDone / mission.tripsTarget * 100)} %
            </p>
          </div>
          <ProgressBar value={mission.tripsDone / mission.tripsTarget} className="mt-3 h-2" label="Progression de la mission" />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">Vue d’ensemble</h3>
          <InfoList
            columns={3}
            items={[
            { label: 'Navire', value: ship?.name ?? '—' },
            { label: 'Statut', value: status.label },
            { label: 'Date', value: fmtDate(mission.date) },
            { label: 'Heure de début', value: mission.start },
            { label: 'Heure de fin prévue', value: mission.end },
            { label: 'Camions affectés', value: mission.truckIds.length },
            { label: 'Zone de stock', value: stock?.name ?? '—' },
            { label: 'Port', value: port?.name ?? '—' },
            { label: 'Cycle standard', value: fmtMin(cycleTotal(mission.standardCycle)) }]
            } />
          
          {mission.notes && <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-sm text-ink-muted">{mission.notes}</p>}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Progression du cycle · réel vs standard</h3>
            <span className="text-xs text-ink-subtle">Moyenne de la mission</span>
          </div>
          <CycleProgress standard={mission.standardCycle} actual={mission.actualCycle} counts={counts} stockName={stock?.name.split(' · ')[0] ?? 'Stock'} portName={port?.berth ?? 'Port'} />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">
            Camions affectés <span className="font-normal text-ink-subtle">({trucks.length})</span>
          </h3>
          {trucks.length === 0 ?
          <p className="rounded-lg bg-canvas px-4 py-6 text-center text-sm text-ink-muted">Aucun camion affecté pour l’instant.</p> :

          <div className="overflow-hidden rounded-lg ring-1 ring-line">
              <DataTable
              dense
              rows={trucks}
              rowKey={(t) => t.id}
              onRowClick={onSelectTruck ? (t) => onSelectTruck(t.id) : undefined}
              columns={[
              {
                key: 'truck',
                header: 'Camion',
                render: (t) =>
                <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${toneDot[healthMeta[t.health].tone]}`} />
                        <span className="font-mono text-xs font-semibold">{t.id}</span>
                      </span>

              },
              { key: 'driver', header: 'Chauffeur', render: (t) => t.driverId ? driverById[t.driverId]?.name : '—' },
              { key: 'status', header: 'Statut', render: (t) => <span className="text-ink-muted">{stageMeta[t.stage].label}</span> },
              { key: 'trip', header: 'Voyage', render: (t) => <span className="tabular-nums">{t.tripsDone}/{t.tripsTarget}</span> },
              {
                key: 'cycle',
                header: 'Temps cycle',
                render: (t) => <span className={`tabular-nums ${t.cycleAvg > cycleTotal(mission.standardCycle) ? 'font-medium text-danger-600' : 'text-ok-600'}`}>{fmtMin(t.cycleAvg)}</span>
              },
              {
                key: 'alert',
                header: 'Alerte',
                render: (t) => {
                  const a = openAlerts.find((x) => x.truckId === t.id);
                  return a ? <Badge tone={a.level === 'critical' ? 'danger' : 'warn'}>{alertTypeLabel[a.type]}</Badge> : <span className="text-ink-subtle">—</span>;
                }
              }]
              } />
            
            </div>
          }
        </section>
      </div>
    </Drawer>);

}