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
import { workshopVisits } from '../data/siteVisits';
import type { FixedSite } from '../types/fleet';
import { nextId } from '../utils/collections';
import { fmtMin } from '../utils/format';
import { trucksInZone } from '../utils/performance';

export function Workshops() {
  const { workshops, setWorkshops, missions } = useFleetData();
  const { live } = useLiveFleet();
  const inside = (w: FixedSite) => trucksInZone(live, missions, 'workshop', w.id, workshops[0]?.id === w.id);
  const present = workshops.reduce((s, w) => s + inside(w).length, 0);
  const siteName = (id: string) => workshops.find((w) => w.id === id)?.name ?? id;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Zones atelier" description="Ateliers mécaniques définis comme points fixes. Chaque passage est détecté et chronométré, distinctement des zones de pause." />
      <StatStrip
        items={[
        { label: 'Camions à l’atelier', value: present, tone: present ? 'warn' : undefined, hint: 'Immobilisés maintenant' },
        { label: 'Passages aujourd’hui', value: workshops.reduce((s, w) => s + w.visitsToday, 0) },
        { label: 'Temps moyen passé', value: '42 min', hint: 'Maximum 60 min' },
        { label: 'Total des passages', value: workshops.reduce((s, w) => s + w.totalVisits, 0), hint: 'Depuis le début de la campagne' }]
        } />
      
      <GeofenceWorkspace<FixedSite>
        kind="point"
        entityLabel="atelier"
        items={workshops}
        onItemsChange={setWorkshops}
        createItem={(name, coords) => ({ id: nextId('WS-', workshops.map((w) => w.id), 2), name, coords, active: true, kind: 'workshop', radiusM: 50, visitsToday: 0, avgMin: 0, totalVisits: 0, maxMin: 60, excessAlerts: 0, description: 'Nouvel atelier' })}
        renderRowMeta={(w) => `${inside(w).length} présent(s) · ${w.visitsToday} passages aujourd’hui`}
        renderDetails={(w) =>
        <InfoList
          items={[
          { label: 'Description', value: w.description, span: true },
          { label: 'Passages aujourd’hui', value: w.visitsToday },
          { label: 'Temps moyen passé', value: w.avgMin ? fmtMin(w.avgMin) : '—' },
          { label: 'Total des passages', value: w.totalVisits },
          { label: 'Alerte au-delà de', value: fmtMin(w.maxMin) },
          { label: 'Camions présents', value: <TruckChips trucks={inside(w)} />, span: true }]
          } />

        } />
      
      <Card title="Passages atelier · aujourd’hui" subtitle="Entrées et sorties détectées par géolocalisation" bodyClassName="px-0 pb-0">
        <DataTable
          rows={workshopVisits}
          rowKey={(v) => v.id}
          columns={[
          { key: 'truck', header: 'Camion', render: (v) => <span className="font-mono text-xs font-semibold">{v.truckId}</span> },
          { key: 'site', header: 'Atelier', render: (v) => siteName(v.siteId) },
          { key: 'entry', header: 'Entrée', render: (v) => <span className="tabular-nums">{v.entry}</span> },
          { key: 'exit', header: 'Sortie', render: (v) => v.exit ? <span className="tabular-nums">{v.exit}</span> : <Badge tone="warn" dot>Présent</Badge> },
          { key: 'dur', header: 'Durée', align: 'right', render: (v) => <span className={`tabular-nums ${v.durationMin > 60 ? 'font-medium text-danger-600' : ''}`}>{fmtMin(v.durationMin)}</span> },
          { key: 'reason', header: 'Motif', render: (v) => <span className="text-ink-muted">{v.reason}</span> }]
          } />
        
      </Card>
    </div>);

}