import React from 'react';
import { GeofenceWorkspace } from '../components/geo/GeofenceWorkspace';
import { TruckChips } from '../components/geo/TruckChips';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { InfoList } from '../components/ui/InfoList';
import { PageHeader } from '../components/ui/PageHeader';
import { StatStrip } from '../components/ui/StatStrip';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import { pauseSessions } from '../data/siteVisits';
import type { FixedSite } from '../types/fleet';
import { nextId } from '../utils/collections';
import { fmtMin } from '../utils/format';
import { trucksInZone } from '../utils/performance';

export function PauseZones() {
  const { pauseZones, setPauseZones, missions } = useFleetData();
  const { live } = useLiveFleet();
  const inside = (p: FixedSite) => trucksInZone(live, missions, 'pause', p.id, pauseZones[0]?.id === p.id);
  const site = (id: string) => pauseZones.find((p) => p.id === id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Zones pause" description="Stationnement chauffeurs et réfectoire, séparés de l’atelier mécanique pour distinguer une pause d’une immobilisation technique." />
      <StatStrip
        items={[
        { label: 'Camions en pause', value: pauseZones.reduce((s, p) => s + inside(p).length, 0) },
        { label: 'Durée moyenne de pause', value: '24 min', hint: 'Maximum 30 min' },
        { label: 'Nombre de pauses', value: pauseZones.reduce((s, p) => s + p.visitsToday, 0), hint: 'Aujourd’hui' },
        { label: 'Pauses excessives', value: pauseZones.reduce((s, p) => s + p.excessAlerts, 0), tone: 'warn', hint: 'Alertes déclenchées' }]
        } />
      
      <GeofenceWorkspace<FixedSite>
        kind="point"
        entityLabel="zone pause"
        items={pauseZones}
        onItemsChange={setPauseZones}
        createItem={(name, coords) => ({ id: nextId('PZ-', pauseZones.map((p) => p.id), 2), name, coords, active: true, kind: 'pause', radiusM: 40, visitsToday: 0, avgMin: 0, totalVisits: 0, maxMin: 30, excessAlerts: 0, description: 'Nouvelle zone de stationnement' })}
        renderRowMeta={(p) => `${inside(p).length} présent(s) · pause moy. ${fmtMin(p.avgMin)}`}
        renderDetails={(p) =>
        <InfoList
          items={[
          { label: 'Description', value: p.description, span: true },
          { label: 'Pauses aujourd’hui', value: p.visitsToday },
          { label: 'Durée moyenne', value: p.avgMin ? fmtMin(p.avgMin) : '—' },
          { label: 'Durée maximale', value: fmtMin(p.maxMin) },
          { label: 'Alertes pause excessive', value: p.excessAlerts },
          { label: 'Camions présents', value: <TruckChips trucks={inside(p)} />, span: true }]
          } />

        } />
      
      <Card title="Pauses · aujourd’hui" subtitle="Les pauses au-delà de la durée maximale déclenchent une alerte" bodyClassName="px-0 pb-0">
        <DataTable
          rows={pauseSessions}
          rowKey={(v) => v.id}
          columns={[
          { key: 'truck', header: 'Camion', render: (v) => <span className="font-mono text-xs font-semibold">{v.truckId}</span> },
          { key: 'site', header: 'Zone', render: (v) => site(v.siteId)?.name ?? v.siteId },
          { key: 'entry', header: 'Début', render: (v) => <span className="tabular-nums">{v.entry}</span> },
          { key: 'exit', header: 'Fin', render: (v) => v.exit ? <span className="tabular-nums">{v.exit}</span> : <Badge tone="brand" dot>En cours</Badge> },
          {
            key: 'dur',
            header: 'Durée',
            align: 'right',
            render: (v) => {
              const excess = v.durationMin > (site(v.siteId)?.maxMin ?? 30);
              return (
                <span className="inline-flex items-center gap-2">
                    <span className={`tabular-nums ${excess ? 'font-medium text-danger-600' : ''}`}>{fmtMin(v.durationMin)}</span>
                    {excess && <Badge tone="danger">Excessive</Badge>}
                  </span>);

            }
          },
          { key: 'reason', header: 'Motif', render: (v) => <span className="text-ink-muted">{v.reason}</span> }]
          } />
        
      </Card>
    </div>);

}