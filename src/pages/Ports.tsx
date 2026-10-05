import React from 'react';
import { GeofenceWorkspace } from '../components/geo/GeofenceWorkspace';
import { TruckChips } from '../components/geo/TruckChips';
import { InfoList } from '../components/ui/InfoList';
import { PageHeader } from '../components/ui/PageHeader';
import { StatStrip } from '../components/ui/StatStrip';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import type { Port } from '../types/fleet';
import { nextId } from '../utils/collections';
import { fmtMin, fmtNum } from '../utils/format';
import { areaHa } from '../utils/geo';
import { trucksInZone } from '../utils/performance';

export function Ports() {
  const { ports, setPorts, missions } = useFleetData();
  const { live } = useLiveFleet();
  const inside = (id: string) => trucksInZone(live, missions, 'port', id);
  const atPort = ports.reduce((s, p) => s + inside(p.id).length, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Gestion des ports" description="Zones de déchargement géo-délimitées. Chaque entrée et sortie de camion est horodatée automatiquement." />
      <StatStrip
        items={[
        { label: 'Ports actifs', value: `${ports.filter((p) => p.active).length} / ${ports.length}` },
        { label: 'Camions au port', value: atPort, hint: 'En déchargement maintenant' },
        { label: 'Temps moyen de déchargement', value: '5,9 min', hint: 'Standard 5 min', tone: 'warn' },
        { label: 'Déchargements aujourd’hui', value: 87 }]
        } />
      
      <GeofenceWorkspace<Port>
        kind="polygon"
        entityLabel="port"
        items={ports}
        onItemsChange={setPorts}
        createItem={(name, coords) => ({ id: nextId('PRT-', ports.map((p) => p.id), 2), name, coords, active: true, location: 'Port commercial de Sfax', avgUnloading: 0, berth: '' })}
        renderRowMeta={(p) => `${inside(p.id).length} camion(s) présents · ${p.berth || 'Quai non défini'}`}
        renderDetails={(p) =>
        <InfoList
          items={[
          { label: 'Localisation', value: p.location, span: true },
          { label: 'Polygone', value: `${p.coords.length} sommets · ${fmtNum(areaHa(p.coords))} ha` },
          { label: 'Statut', value: p.active ? 'Actif' : 'Inactif' },
          { label: 'Déchargement moyen', value: p.avgUnloading ? fmtMin(p.avgUnloading) : '—' },
          { label: 'Quai', value: p.berth || '—' },
          { label: 'Camions présents', value: <TruckChips trucks={inside(p.id)} />, span: true }]
          } />

        } />
      
    </div>);

}