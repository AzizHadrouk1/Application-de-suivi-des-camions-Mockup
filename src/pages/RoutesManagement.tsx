import React from 'react';
import { GeofenceWorkspace } from '../components/geo/GeofenceWorkspace';
import { TruckChips } from '../components/geo/TruckChips';
import { InfoList } from '../components/ui/InfoList';
import { PageHeader } from '../components/ui/PageHeader';
import { StatStrip } from '../components/ui/StatStrip';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import type { RouteLine } from '../types/fleet';
import { nextId } from '../utils/collections';
import { fmtNum } from '../utils/format';
import { pathLengthKm } from '../utils/geo';

const DIRECTION = { aller: 'Aller · vers le port', retour: 'Retour · vers le stock', alternatif: 'Itinéraire alternatif' };

export function RoutesManagement() {
  const { routes, setRoutes } = useFleetData();
  const { live } = useLiveFleet();
  const onRoute = (r: RouteLine) => live.filter((t) => r.direction === 'aller' ? t.stage === 'outbound' : r.direction === 'retour' ? t.stage === 'return' : false);
  const moving = live.filter((t) => t.stage === 'outbound' || t.stage === 'return').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Gestion des trajets" description="Itinéraires autorisés entre le salin et le port. Tracez-les directement sur la carte ; toute sortie du corridor déclenche une alerte." />
      <StatStrip
        items={[
        { label: 'Trajets actifs', value: `${routes.filter((r) => r.active).length} / ${routes.length}` },
        { label: 'Camions en circulation', value: moving, hint: 'Aller + retour' },
        { label: 'Trajet aller moyen', value: '9,2 min', hint: 'Standard 10 min', tone: 'ok' },
        { label: 'Trajet retour moyen', value: '8,3 min', hint: 'Standard 10 min', tone: 'ok' }]
        } />
      
      <GeofenceWorkspace<RouteLine>
        kind="polyline"
        entityLabel="trajet"
        items={routes}
        onItemsChange={setRoutes}
        createItem={(name, coords) => {
          const km = Math.round(pathLengthKm(coords) * 10) / 10;
          return { id: nextId('R-', routes.map((r) => r.id), 2), name, coords, active: true, origin: 'À définir', destination: 'À définir', distanceKm: km, expectedMin: Math.max(1, Math.round(km / 16 * 60)), direction: 'alternatif' };
        }}
        renderRowMeta={(r) => `${fmtNum(r.distanceKm)} km · ${r.expectedMin} min prévues`}
        renderDetails={(r) =>
        <InfoList
          items={[
          { label: 'Origine', value: r.origin },
          { label: 'Destination', value: r.destination },
          { label: 'Distance', value: `${fmtNum(r.distanceKm)} km` },
          { label: 'Durée prévue', value: `${r.expectedMin} min` },
          { label: 'Sens', value: DIRECTION[r.direction] },
          { label: 'Statut', value: r.active ? 'Actif' : 'Inactif' },
          { label: 'Camions sur le trajet', value: <TruckChips trucks={onRoute(r)} />, span: true }]
          } />

        } />
      
    </div>);

}