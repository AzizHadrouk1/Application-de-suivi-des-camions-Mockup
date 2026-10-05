import React, { useRef } from 'react';
import { MapPinIcon, PhoneIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import type { LiveTruck } from '../../types/fleet';
import type { TruckDetailTab } from '../../types/map';
import { fmtAgo } from '../../utils/format';
import { driverStatusMeta, gpsMeta, healthMeta, stageMeta, truckStatusMeta } from '../../utils/status';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { InfoList } from '../ui/InfoList';
import { Tabs } from '../ui/Tabs';
import { StageTracker } from './StageTracker';
import { TruckPerformance } from './TruckPerformance';
import { TruckTimeline } from './TruckTimeline';

interface TruckDetailDrawerProps {
  truckId: string | null;
  tab: TruckDetailTab;
  onTabChange: (t: TruckDetailTab) => void;
  onClose: () => void;
  onOpenMission?: (id: string) => void;
  onShowOnMap?: (id: string) => void;
}

export function TruckDetailDrawer({ truckId, tab, onTabChange, onClose, onOpenMission, onShowOnMap }: TruckDetailDrawerProps) {
  const { liveById } = useLiveFleet();
  const { driverById, missionById, shipById } = useFleetData();
  const current = truckId ? liveById[truckId] : null;
  const lastRef = useRef<LiveTruck | null>(null);
  if (current) lastRef.current = current;
  const truck = current ?? lastRef.current;

  if (!truck) return null;
  const driver = truck.driverId ? driverById[truck.driverId] : undefined;
  const mission = truck.missionId ? missionById[truck.missionId] : undefined;
  const ship = mission ? shipById[mission.shipId] : undefined;
  const h = healthMeta[truck.health];

  const section = (title: string, body: React.ReactNode) =>
  <section>
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {body}
    </section>;


  return (
    <Drawer
      open={!!current}
      onClose={onClose}
      title={
      <span className="flex items-center gap-2">
          <span className="font-mono">{truck.id}</span>
          <Badge tone={h.tone} dot>
            {h.label}
          </Badge>
        </span>
      }
      subtitle={`${truck.plate} · ${truck.name}`}
      headerExtra={
      <Tabs
        variant="underline"
        value={tab}
        onChange={onTabChange}
        items={[
        { id: 'overview', label: 'Aperçu' },
        { id: 'timeline', label: 'Timeline opérationnelle' },
        { id: 'performance', label: 'Performance' }]
        } />

      }
      footer={
      <>
          {mission && onOpenMission &&
        <Button variant="primary" onClick={() => onOpenMission(mission.id)}>
              Voir mission {mission.id}
            </Button>
        }
          {onShowOnMap &&
        <Button icon={MapPinIcon} onClick={() => onShowOnMap(truck.id)}>
              Voir sur la carte
            </Button>
        }
          {driver &&
        <a href={`tel:${driver.phone.replace(/\s/g, '')}`} className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium text-ink-muted hover:bg-canvas hover:text-ink">
              <PhoneIcon className="h-4 w-4" aria-hidden />
              Appeler
            </a>
        }
        </>
      }>
      
      {tab === 'overview' &&
      <div className="space-y-7">
          {section('Statut opérationnel', <StageTracker truck={truck} />)}
          {section(
          'Véhicule',
          <InfoList
            items={[
            { label: 'Immatriculation', value: truck.plate },
            { label: 'Type', value: truck.type },
            { label: 'Statut', value: <Badge tone={truckStatusMeta[truck.status].tone}>{truckStatusMeta[truck.status].label}</Badge> },
            { label: 'GPS', value: <Badge tone={gpsMeta[truck.gps].tone} dot>{gpsMeta[truck.gps].label}</Badge> },
            {
              label: 'Dernière position',
              value:
              <span className="tabular-nums">
                      {truck.position[0].toFixed(5)}, {truck.position[1].toFixed(5)} <span className="font-normal text-ink-muted">· il y a {fmtAgo(truck.lastUpdateSec)}</span>
                    </span>,

              span: true
            }]
            } />

        )}
          {section(
          'Chauffeur',
          driver ?
          <InfoList
            items={[
            { label: 'Nom', value: driver.name },
            { label: 'Téléphone', value: <a className="text-brand-700 hover:underline" href={`tel:${driver.phone.replace(/\s/g, '')}`}>{driver.phone}</a> },
            { label: 'Statut', value: <Badge tone={driverStatusMeta[driver.status].tone}>{driverStatusMeta[driver.status].label}</Badge> },
            { label: 'Permis', value: driver.licence }]
            } /> :


          <p className="text-sm text-ink-muted">Aucun chauffeur affecté.</p>

        )}
          {section(
          'Mission',
          mission ?
          <InfoList
            items={[
            { label: 'Mission', value: mission.id },
            { label: 'Navire', value: ship?.name ?? '—' },
            { label: 'Heure de début', value: mission.start },
            { label: 'Étape actuelle', value: stageMeta[truck.stage].label },
            { label: 'Voyages prévus', value: truck.tripsTarget },
            { label: 'Réalisés · restants', value: `${truck.tripsDone} · ${Math.max(0, truck.tripsTarget - truck.tripsDone)}` }]
            } /> :


          <p className="text-sm text-ink-muted">Ce camion n’est affecté à aucune mission.</p>

        )}
        </div>
      }
      {tab === 'timeline' && <TruckTimeline truck={truck} />}
      {tab === 'performance' && <TruckPerformance truck={truck} />}
    </Drawer>);

}