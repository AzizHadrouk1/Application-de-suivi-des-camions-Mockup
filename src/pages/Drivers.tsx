import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { EyeIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { DriverDetailDrawer } from '../components/fleet/DriverDetailDrawer';
import { DriverForm } from '../components/forms/DriverForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { inputClass } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RowActions } from '../components/ui/RowActions';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import { useEntityParam } from '../hooks/useEntityParam';
import type { Driver, DriverStatus } from '../types/fleet';
import { removeWithUndo, upsert } from '../utils/collections';
import { performanceScore, scoreTone } from '../utils/performance';
import { driverStatusMeta } from '../utils/status';

export function Drivers() {
  const { drivers, setDrivers, setTrucks, truckById } = useFleetData();
  const [form, setForm] = useState<{open: boolean;driver: Driver | null;}>({ open: false, driver: null });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | DriverStatus>('all');

  const openNew = useCallback(() => setForm({ open: true, driver: null }), []);
  const openEdit = useCallback((id: string) => {
    const d = drivers.find((x) => x.id === id);
    if (d) setForm({ open: true, driver: d });
  }, [drivers]);
  useEntityParam(openNew, openEdit);

  const rows = drivers.filter((d) => (status === 'all' || d.status === status) && `${d.name} ${d.phone} ${d.truckId ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Gestion des chauffeurs"
        description="Chauffeurs, camions affectés et performance du jour."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openNew}>
            Ajouter un chauffeur
          </Button>
        } />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <div className="relative md:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, téléphone, camion…" aria-label="Rechercher un chauffeur" className={`${inputClass} pl-9`} />
          </div>
          <Tabs
            value={status}
            onChange={setStatus}
            items={[
            { id: 'all', label: 'Tous', count: drivers.length },
            ...(Object.keys(driverStatusMeta) as DriverStatus[]).map((k) => ({ id: k, label: driverStatusMeta[k].label, count: drivers.filter((d) => d.status === k).length }))]
            } />
          
        </div>
        <DataTable
          rows={rows}
          rowKey={(d) => d.id}
          onRowClick={(d) => setDetailId(d.id)}
          columns={[
          { key: 'name', header: 'Nom', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'phone', header: 'Téléphone', render: (d) => <span className="tabular-nums text-ink-muted">{d.phone}</span> },
          { key: 'truck', header: 'Camion', render: (d) => d.truckId ? <span className="font-mono text-xs font-semibold">{d.truckId}</span> : <span className="text-ink-subtle">—</span> },
          { key: 'status', header: 'Statut', render: (d) => <Badge tone={driverStatusMeta[d.status].tone} dot>{driverStatusMeta[d.status].label}</Badge> },
          {
            key: 'mission',
            header: 'Mission actuelle',
            render: (d) => {
              const m = d.truckId ? truckById[d.truckId]?.missionId : null;
              return m ? <span className="font-medium text-brand-700">{m}</span> : <span className="text-ink-subtle">—</span>;
            }
          },
          { key: 'trips', header: 'Nombre de voyages', align: 'right', render: (d) => <span className="tabular-nums">{d.trips}</span> },
          {
            key: 'perf',
            header: 'Performance',
            render: (d) => {
              if (!d.trips) return <span className="text-ink-subtle">—</span>;
              const s = performanceScore(d.cycleAvg, d.delays);
              return (
                <span className="flex items-center gap-2">
                    <ProgressBar value={s / 100} tone={scoreTone(s)} className="w-20" label={`Score ${d.name}`} />
                    <span className="w-7 text-right text-xs font-semibold tabular-nums">{s}</span>
                  </span>);

            }
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (d) =>
            <RowActions
              inline={[
              { label: 'Voir', icon: EyeIcon, onClick: () => setDetailId(d.id) },
              { label: 'Modifier', icon: PencilIcon, onClick: () => setForm({ open: true, driver: d }) },
              { label: 'Supprimer', icon: Trash2Icon, danger: true, onClick: () => removeWithUndo(setDrivers, d, 'Chauffeur') }]
              } />


          }]
          } />
        
      </div>

      <DriverForm
        open={form.open}
        initial={form.driver}
        onClose={() => setForm({ open: false, driver: null })}
        onSubmit={(d) => {
          upsert(setDrivers, d);
          if (d.truckId) setTrucks((prev) => prev.map((t) => t.id === d.truckId ? { ...t, driverId: d.id } : t.driverId === d.id ? { ...t, driverId: null } : t));
          setForm({ open: false, driver: null });
          toast.success(form.driver ? 'Chauffeur mis à jour' : 'Chauffeur ajouté', { description: d.name });
        }} />
      
      <DriverDetailDrawer driverId={detailId} onClose={() => setDetailId(null)} />
    </div>);

}