import React from 'react';
import { GeofenceWorkspace } from '../components/geo/GeofenceWorkspace';
import { TruckChips } from '../components/geo/TruckChips';
import { Badge } from '../components/ui/Badge';
import { InfoList } from '../components/ui/InfoList';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatStrip } from '../components/ui/StatStrip';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import type { StockZone } from '../types/fleet';
import { nextId } from '../utils/collections';
import { fmtInt, fmtNum } from '../utils/format';
import { areaHa } from '../utils/geo';
import { trucksInZone } from '../utils/performance';

const ACTIVITY = {
  loading: { label: 'Chargement actif', tone: 'brand' as const },
  idle: { label: 'Inactive', tone: 'neutral' as const },
  saturated: { label: 'Saturée', tone: 'warn' as const }
};

export function StockZones() {
  const { stockZones, setStockZones, missions } = useFleetData();
  const { live } = useLiveFleet();
  const inside = (id: string) => trucksInZone(live, missions, 'stock', id);
  const loading = stockZones.reduce((s, z) => s + inside(z.id).length, 0);
  const totalStock = stockZones.reduce((s, z) => s + z.stockLevel, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Zones de stock" description="Zones de stockage de sel géo-délimitées. Le temps passé en zone mesure la durée de chargement de chaque camion." />
      <StatStrip
        items={[
        { label: 'Zones actives', value: `${stockZones.filter((z) => z.active).length} / ${stockZones.length}` },
        { label: 'Camions en chargement', value: loading, hint: 'En zone maintenant' },
        { label: 'Temps moyen en zone', value: '8,6 min', hint: 'Standard 10 min', tone: 'ok' },
        { label: 'Stock disponible', value: `${fmtInt(totalStock)} t` }]
        } />
      
      <GeofenceWorkspace<StockZone>
        kind="polygon"
        entityLabel="zone de stock"
        items={stockZones}
        onItemsChange={setStockZones}
        createItem={(name, coords) => ({ id: nextId('STK-', stockZones.map((z) => z.id), 2), name, coords, active: true, capacity: 50000, stockLevel: 0, activity: 'idle', loadingStatus: 'Aucun chargement' })}
        renderRowMeta={(z) => `${inside(z.id).length} camion(s) · ${fmtInt(z.stockLevel)} t en stock`}
        renderDetails={(z) =>
        <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-ink-muted">Niveau de stock</span>
                <span className="font-medium tabular-nums text-ink">
                  {fmtInt(z.stockLevel)} / {fmtInt(z.capacity)} t
                </span>
              </div>
              <ProgressBar value={z.stockLevel / z.capacity} tone="accent" className="h-2" label="Niveau de stock" />
            </div>
            <InfoList
            items={[
            { label: 'Activité', value: <Badge tone={ACTIVITY[z.activity].tone}>{ACTIVITY[z.activity].label}</Badge> },
            { label: 'Polygone', value: `${z.coords.length} sommets · ${fmtNum(areaHa(z.coords))} ha` },
            { label: 'Statut de chargement', value: z.loadingStatus, span: true },
            { label: 'Camions présents', value: <TruckChips trucks={inside(z.id)} />, span: true }]
            } />
          
          </div>
        } />
      
    </div>);

}