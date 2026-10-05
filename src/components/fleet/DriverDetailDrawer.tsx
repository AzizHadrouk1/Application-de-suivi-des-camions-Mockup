import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, PhoneIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import type { Driver } from '../../types/fleet';
import { fmtClock, fmtMin, fmtSignedMin } from '../../utils/format';
import { performanceScore, scoreTone } from '../../utils/performance';
import { alertLevelMeta, alertStatusMeta, alertTypeLabel, delayTone, driverStatusMeta, stageMeta } from '../../utils/status';
import { buildCycleHistory } from '../../utils/timeline';
import { Badge, toneText } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { InfoList } from '../ui/InfoList';

interface DriverDetailDrawerProps {
  driverId: string | null;
  onClose: () => void;
}

export function DriverDetailDrawer({ driverId, onClose }: DriverDetailDrawerProps) {
  const { driverById, missionById, shipById, alerts } = useFleetData();
  const { liveById } = useLiveFleet();
  const navigate = useNavigate();
  const current = driverId ? driverById[driverId] : null;
  const lastRef = useRef<Driver | null>(null);
  if (current) lastRef.current = current;
  const driver = current ?? lastRef.current;
  if (!driver) return null;

  const truck = driver.truckId ? liveById[driver.truckId] : undefined;
  const mission = truck?.missionId ? missionById[truck.missionId] : undefined;
  const score = performanceScore(driver.cycleAvg, driver.delays);
  const history = truck ? buildCycleHistory(truck, 35, new Date(), 5) : [];
  const driverAlerts = alerts.filter((a) => a.driverId === driver.id);
  const status = driverStatusMeta[driver.status];

  return (
    <Drawer
      open={!!current}
      onClose={onClose}
      title={
      <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {driver.name.
          split(' ').
          map((p) => p[0]).
          slice(0, 2).
          join('')}
          </span>
          <span>
            {driver.name}
            <span className="ml-2 align-middle">
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
            </span>
          </span>
        </span>
      }
      footer={
      <>
          {truck &&
        <Button variant="primary" icon={MapPinIcon} onClick={() => navigate(`/suivi?truck=${truck.id}`)}>
              Suivre {truck.id}
            </Button>
        }
          <a href={`tel:${driver.phone.replace(/\s/g, '')}`} className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium text-ink ring-1 ring-inset ring-line hover:bg-canvas">
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {driver.phone}
          </a>
        </>
      }>
      
      <div className="space-y-7">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">Profil</h3>
          <InfoList
            items={[
            { label: 'Téléphone', value: driver.phone },
            { label: 'Permis', value: driver.licence || '—' },
            { label: 'Chauffeur depuis', value: driver.since },
            { label: 'Identifiant', value: <span className="font-mono">{driver.id}</span> }]
            } />
          
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">Camion et mission actuelle</h3>
          <InfoList
            items={[
            { label: 'Camion affecté', value: truck ? `${truck.id} · ${truck.plate}` : 'Aucun' },
            { label: 'Étape actuelle', value: truck ? stageMeta[truck.stage].label : '—' },
            { label: 'Mission', value: mission ? mission.id : 'Aucune' },
            { label: 'Navire', value: mission ? shipById[mission.shipId]?.name ?? '—' : '—' }]
            } />
          
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">Performance du jour</h3>
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line">
            {[
            { label: 'Score', value: driver.trips ? score : '—', className: driver.trips ? toneText[scoreTone(score)] : 'text-ink-subtle' },
            { label: 'Voyages', value: driver.trips, className: 'text-ink' },
            { label: 'Cycle moyen', value: driver.cycleAvg ? fmtMin(driver.cycleAvg) : '—', className: driver.cycleAvg > 35 ? 'text-danger-600' : 'text-ink' },
            { label: 'Retards', value: driver.delays, className: driver.delays ? 'text-danger-600' : 'text-ink' }].
            map((s) =>
            <div key={s.label} className="bg-white p-3">
                <p className="text-[11px] text-ink-muted">{s.label}</p>
                <p className={`mt-0.5 text-lg font-semibold tabular-nums ${s.className}`}>{s.value}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Historique des voyages</h3>
          {history.length === 0 ?
          <p className="text-sm text-ink-muted">Aucun voyage aujourd’hui.</p> :

          <ul className="divide-y divide-line rounded-lg ring-1 ring-line">
              {history.map((r) =>
            <li key={r.trip} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-20 font-medium text-ink">Voyage {r.trip}</span>
                  <span className="tabular-nums text-ink-muted">{fmtClock(r.start)}</span>
                  <span className="ml-auto tabular-nums">{fmtMin(Math.round(r.durationMin * 10) / 10)}</span>
                  <Badge tone={delayTone(r.deltaMin)} className="w-[72px] justify-center">
                    {fmtSignedMin(r.deltaMin)}
                  </Badge>
                </li>
            )}
            </ul>
          }
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Alertes</h3>
          {driverAlerts.length === 0 ?
          <p className="text-sm text-ink-muted">Aucune alerte aujourd’hui.</p> :

          <ul className="divide-y divide-line rounded-lg ring-1 ring-line">
              {driverAlerts.map((a) =>
            <li key={a.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-11 tabular-nums text-ink-subtle">{a.time}</span>
                  <span className="min-w-0 flex-1 truncate text-ink">{alertTypeLabel[a.type]}</span>
                  <Badge tone={alertLevelMeta[a.level].tone}>{alertLevelMeta[a.level].label}</Badge>
                  <Badge tone={alertStatusMeta[a.status].tone}>{alertStatusMeta[a.status].label}</Badge>
                </li>
            )}
            </ul>
          }
        </section>
      </div>
    </Drawer>);

}