import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { EyeIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { ShipForm } from '../components/forms/ShipForm';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { inputClass } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { RowActions } from '../components/ui/RowActions';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import { useEntityParam } from '../hooks/useEntityParam';
import type { Ship, ShipStatus } from '../types/fleet';
import { removeWithUndo, upsert } from '../utils/collections';
import { fmtDate, fmtInt } from '../utils/format';
import { shipStatusMeta } from '../utils/status';

export function Ships() {
  const { ships, setShips, missionById, ports } = useFleetData();
  const [form, setForm] = useState<{open: boolean;ship: Ship | null;}>({ open: false, ship: null });
  const [missionId, setMissionId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ShipStatus>('all');

  const openNew = useCallback(() => setForm({ open: true, ship: null }), []);
  const openEdit = useCallback((id: string) => {
    const s = ships.find((x) => x.id === id);
    if (s) setForm({ open: true, ship: s });
  }, [ships]);
  useEntityParam(openNew, openEdit);

  const rows = ships.filter((s) => (status === 'all' || s.status === status) && `${s.name} ${s.imo} ${s.missionId ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const portName = (id: string) => ports.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Gestion des navires"
        description="Navires attendus, à quai et en chargement, rattachés à leur mission."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openNew}>
            Ajouter un navire
          </Button>
        } />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <div className="relative md:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, IMO, mission…" aria-label="Rechercher un navire" className={`${inputClass} pl-9`} />
          </div>
          <Tabs
            value={status}
            onChange={setStatus}
            items={[
            { id: 'all', label: 'Tous', count: ships.length },
            ...(Object.keys(shipStatusMeta) as ShipStatus[]).map((k) => ({ id: k, label: shipStatusMeta[k].label, count: ships.filter((s) => s.status === k).length }))]
            } />
          
        </div>
        <DataTable
          rows={rows}
          rowKey={(s) => s.id}
          onRowClick={(s) => s.missionId ? setMissionId(s.missionId) : setForm({ open: true, ship: s })}
          columns={[
          {
            key: 'name',
            header: 'Nom du navire',
            render: (s) =>
            <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink-subtle">
                    {s.imo} · {s.flag}
                  </p>
                </div>

          },
          { key: 'mission', header: 'Mission', render: (s) => s.missionId ? <span className="font-medium text-brand-700">{s.missionId}</span> : <span className="text-ink-subtle">—</span> },
          { key: 'date', header: 'Date', render: (s) => fmtDate(s.date) },
          { key: 'port', header: 'Port', render: (s) => portName(s.portId) },
          { key: 'trucks', header: 'Nombre de camions', align: 'right', render: (s) => <span className="tabular-nums">{s.missionId ? missionById[s.missionId]?.truckIds.length ?? 0 : 0}</span> },
          { key: 'tonnage', header: 'Tonnage', align: 'right', render: (s) => <span className="tabular-nums text-ink-muted">{fmtInt(s.tonnage)} t</span> },
          { key: 'status', header: 'Statut', render: (s) => <Badge tone={shipStatusMeta[s.status].tone} dot>{shipStatusMeta[s.status].label}</Badge> },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (s) =>
            <RowActions
              inline={[
              { label: 'Voir', icon: EyeIcon, onClick: () => s.missionId ? setMissionId(s.missionId) : setForm({ open: true, ship: s }) },
              { label: 'Modifier', icon: PencilIcon, onClick: () => setForm({ open: true, ship: s }) },
              { label: 'Supprimer', icon: Trash2Icon, danger: true, onClick: () => removeWithUndo(setShips, s, 'Navire') }]
              } />


          }]
          } />
        
      </div>

      <ShipForm
        open={form.open}
        initial={form.ship}
        onClose={() => setForm({ open: false, ship: null })}
        onSubmit={(s) => {
          upsert(setShips, s);
          setForm({ open: false, ship: null });
          toast.success(form.ship ? 'Navire mis à jour' : 'Navire ajouté', { description: s.name });
        }} />
      
      <MissionDrawer missionId={missionId} onClose={() => setMissionId(null)} />
    </div>);

}