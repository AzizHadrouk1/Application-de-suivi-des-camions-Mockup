import React, { useState } from 'react';
import { toast } from 'sonner';
import { BanIcon, EyeIcon, PencilIcon, PlayIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { MissionForm } from '../components/forms/MissionForm';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { inputClass } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RowActions, type RowAction } from '../components/ui/RowActions';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import type { Mission, MissionStatus } from '../types/fleet';
import { removeWithUndo } from '../utils/collections';
import { fmtDate } from '../utils/format';
import { missionStatusMeta } from '../utils/status';

export function Missions() {
  const { missions, setMissions, setTrucks, setShips, shipById, stockZones, ports, alerts } = useFleetData();
  const [form, setForm] = useState<{open: boolean;mission: Mission | null;}>({ open: false, mission: null });
  const [viewId, setViewId] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | MissionStatus>('all');
  const [query, setQuery] = useState('');

  const save = (m: Mission, launch: boolean) => {
    if (launch && m.truckIds.length === 0) {
      toast.error('Affectez au moins un camion avant de lancer la mission');
      setForm({ open: true, mission: m });
      return;
    }
    const next: Mission = launch ? { ...m, status: 'running' } : m;
    setMissions((prev) => {
      const cleaned = launch ? prev.map((x) => x.id !== m.id && x.status === 'running' ? { ...x, truckIds: x.truckIds.filter((id) => !m.truckIds.includes(id)) } : x) : prev;
      return cleaned.some((x) => x.id === m.id) ? cleaned.map((x) => x.id === m.id ? next : x) : [...cleaned, next];
    });
    if (launch) {
      const perTruck = Math.ceil(m.tripsTarget / m.truckIds.length);
      const byTruck = Object.fromEntries((m.assignments ?? []).map((a) => [a.truckId, a]));
      const assignedDrivers = new Set((m.assignments ?? []).map((a) => a.driverId).filter(Boolean));
      setTrucks((prev) =>
      prev.map((t) => {
        const a = byTruck[t.id];
        if (m.truckIds.includes(t.id)) return { ...t, missionId: m.id, status: 'mission', driverId: a?.driverId || t.driverId, tripsTarget: a?.trips ?? (t.missionId === m.id && t.tripsTarget ? t.tripsTarget : perTruck) };
        return t.driverId && assignedDrivers.has(t.driverId) ? { ...t, driverId: null } : t;
      })
      );
      setShips((prev) => prev.map((s) => s.id === m.shipId ? { ...s, missionId: m.id, status: 'loading' } : s));
    } else {
      setShips((prev) => prev.map((s) => s.id === m.shipId ? { ...s, missionId: m.id } : s));
    }
    setForm({ open: false, mission: null });
    toast.success(launch ? `Mission ${m.id} lancée` : `Mission ${m.id} enregistrée`, { description: `${shipById[m.shipId]?.name ?? ''} · ${m.truckIds.length} camion(s) · début ${m.start}` });
  };

  const cancel = (m: Mission) => {
    setMissions((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'cancelled' } : x));
    toast(`Mission ${m.id} annulée`);
  };

  const rows = missions.filter((m) => (status === 'all' || m.status === status) && `${m.id} ${shipById[m.shipId]?.name ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const zoneName = (id: string) => stockZones.find((z) => z.id === id)?.name.split(' · ')[0] ?? '—';
  const portName = (id: string) => ports.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Gestion des missions"
        description="Missions de chargement navire · lancement manuel, suivi de progression et temps standards par mission."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={() => setForm({ open: true, mission: null })}>
            Créer une mission
          </Button>
        } />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <div className="relative md:w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mission ou navire…" aria-label="Rechercher une mission" className={`${inputClass} pl-9`} />
          </div>
          <Tabs
            value={status}
            onChange={setStatus}
            items={[
            { id: 'all', label: 'Toutes', count: missions.length },
            ...(['running', 'preparing', 'planned', 'done', 'cancelled'] as MissionStatus[]).map((k) => ({ id: k, label: missionStatusMeta[k].label, count: missions.filter((m) => m.status === k).length }))]
            } />
          
        </div>
        <DataTable
          rows={rows}
          rowKey={(m) => m.id}
          onRowClick={(m) => setViewId(m.id)}
          columns={[
          {
            key: 'id',
            header: 'Mission',
            render: (m) =>
            <div>
                  <p className="font-semibold text-ink">{m.id}</p>
                  <p className="text-xs text-ink-subtle">{shipById[m.shipId]?.name ?? '—'}</p>
                </div>

          },
          { key: 'date', header: 'Date', render: (m) => fmtDate(m.date) },
          { key: 'start', header: 'Début', render: (m) => <span className="tabular-nums">{m.start}</span> },
          { key: 'end', header: 'Fin', render: (m) => <span className="tabular-nums text-ink-muted">{m.end}</span> },
          { key: 'stock', header: 'Stock', render: (m) => zoneName(m.stockZoneId) },
          { key: 'port', header: 'Port', render: (m) => <span className="text-ink-muted">{portName(m.portId)}</span> },
          { key: 'trucks', header: 'Camions', align: 'right', render: (m) => <span className="tabular-nums">{m.truckIds.length}</span> },
          {
            key: 'progress',
            header: 'Progression',
            render: (m) =>
            <span className="flex items-center gap-2">
                  <ProgressBar value={m.tripsTarget ? m.tripsDone / m.tripsTarget : 0} tone={m.status === 'done' ? 'ok' : 'brand'} className="w-24" label={`Progression ${m.id}`} />
                  <span className="text-xs tabular-nums text-ink-muted">
                    {m.tripsDone}/{m.tripsTarget}
                  </span>
                </span>

          },
          { key: 'status', header: 'Statut', render: (m) => <Badge tone={missionStatusMeta[m.status].tone} dot>{missionStatusMeta[m.status].label}</Badge> },
          {
            key: 'alerts',
            header: 'Alertes',
            align: 'right',
            render: (m) => {
              const n = alerts.filter((a) => a.missionId === m.id && a.status !== 'resolved').length;
              return n ? <Badge tone="danger">{n}</Badge> : <span className="text-ink-subtle">—</span>;
            }
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (m) => {
              const inline: RowAction[] = [{ label: 'Voir', icon: EyeIcon, onClick: () => setViewId(m.id) }];
              if (m.status === 'planned' || m.status === 'preparing') inline.push({ label: 'Lancer la mission', icon: PlayIcon, onClick: () => save(m, true) });
              const menu: RowAction[] = [{ label: 'Modifier', icon: PencilIcon, onClick: () => setForm({ open: true, mission: m }) }];
              if (m.status !== 'done' && m.status !== 'cancelled') menu.push({ label: 'Annuler la mission', icon: BanIcon, danger: true, onClick: () => cancel(m) });
              menu.push({ label: 'Supprimer', icon: Trash2Icon, danger: true, onClick: () => removeWithUndo(setMissions, m, 'Mission') });
              return <RowActions inline={inline} menu={menu} />;
            }
          }]
          } />
        
      </div>

      <MissionForm open={form.open} initial={form.mission} onClose={() => setForm({ open: false, mission: null })} onSubmit={save} />
      <MissionDrawer missionId={viewId} onClose={() => setViewId(null)} />
    </div>);

}