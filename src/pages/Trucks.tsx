import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ClipboardListIcon, EyeIcon, MapPinIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { AssignModal } from '../components/forms/AssignModal';
import { TruckForm } from '../components/forms/TruckForm';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { TruckDetailDrawer } from '../components/tracking/TruckDetailDrawer';
import { Badge, toneDot } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { inputClass } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { RowActions } from '../components/ui/RowActions';
import { StatStrip } from '../components/ui/StatStrip';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import { useEntityParam } from '../hooks/useEntityParam';
import type { LiveTruck, Truck, TruckStatus } from '../types/fleet';
import type { TruckDetailTab } from '../types/map';
import { removeWithUndo, upsert } from '../utils/collections';
import { gpsMeta, healthMeta, stageMeta, truckStatusMeta } from '../utils/status';

export function Trucks() {
  const { trucks, setTrucks, setDrivers, drivers, driverById, missions, missionById, setMissions } = useFleetData();
  const { live } = useLiveFleet();
  const navigate = useNavigate();
  const [form, setForm] = useState<{open: boolean;truck: Truck | null;}>({ open: false, truck: null });
  const [assign, setAssign] = useState<{kind: 'driver' | 'mission';truck: Truck;} | null>(null);
  const [detail, setDetail] = useState<{id: string;tab: TruckDetailTab;} | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | TruckStatus>('all');

  const openNew = useCallback(() => setForm({ open: true, truck: null }), []);
  const openEdit = useCallback((id: string) => {
    const t = trucks.find((x) => x.id === id);
    if (t) setForm({ open: true, truck: t });
  }, [trucks]);
  useEntityParam(openNew, openEdit);

  const rows = live.filter((t) => {
    const d = t.driverId ? driverById[t.driverId]?.name ?? '' : '';
    return (status === 'all' || t.status === status) && `${t.id} ${t.plate} ${t.name} ${d}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  const assignDriver = (truck: Truck, driverId: string) => {
    setTrucks((prev) => prev.map((t) => t.id === truck.id ? { ...t, driverId: driverId || null } : driverId && t.driverId === driverId ? { ...t, driverId: null } : t));
    setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, truckId: truck.id } : d.truckId === truck.id ? { ...d, truckId: null } : d));
    toast.success('Chauffeur affecté', { description: `${truck.id} · ${driverId ? driverById[driverId]?.name : 'aucun'}` });
  };

  const assignMission = (truck: Truck, mId: string) => {
    const m = mId ? missionById[mId] : null;
    setTrucks((prev) =>
    prev.map((t) => {
      if (t.id !== truck.id) return t;
      if (!m) return { ...t, missionId: null, status: t.status === 'mission' ? 'available' : t.status };
      return { ...t, missionId: m.id, status: m.status === 'running' ? 'mission' : t.status === 'mission' ? 'available' : t.status, tripsTarget: t.tripsTarget || Math.ceil(m.tripsTarget / Math.max(1, m.truckIds.length + 1)) };
    })
    );
    setMissions((prev) => prev.map((x) => x.id === mId ? { ...x, truckIds: Array.from(new Set([...x.truckIds, truck.id])) } : { ...x, truckIds: x.truckIds.filter((id) => id !== truck.id) }));
    toast.success('Mission affectée', { description: `${truck.id} → ${mId || 'aucune'}` });
  };

  const counts = (s: TruckStatus) => live.filter((t) => t.status === s).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Gestion des camions"
        description="Parc de camions, chauffeurs affectés, missions et état du boîtier GPS."
        actions={
        <Button variant="primary" icon={PlusIcon} onClick={openNew}>
            Ajouter un camion
          </Button>
        } />
      
      <StatStrip
        items={[
        { label: 'Camions', value: live.length },
        { label: 'En mission', value: counts('mission'), tone: 'brand' },
        { label: 'Disponibles', value: counts('available'), tone: 'ok' },
        { label: 'Hors mission', value: counts('off_mission') },
        { label: 'GPS hors ligne', value: live.filter((t) => t.gps === 'offline').length, tone: 'danger' }]
        } />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center">
          <div className="relative md:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Code, immatriculation, chauffeur…" aria-label="Rechercher un camion" className={`${inputClass} pl-9`} />
          </div>
          <Tabs
            value={status}
            onChange={setStatus}
            items={[
            { id: 'all', label: 'Tous', count: live.length },
            { id: 'mission', label: 'En mission', count: counts('mission') },
            { id: 'available', label: 'Disponibles', count: counts('available') },
            { id: 'off_mission', label: 'Hors mission', count: counts('off_mission') }]
            } />
          
        </div>
        <DataTable<LiveTruck>
          rows={rows}
          rowKey={(t) => t.id}
          onRowClick={(t) => setDetail({ id: t.id, tab: 'overview' })}
          columns={[
          { key: 'plate', header: 'Immatriculation', render: (t) => <span className="font-medium">{t.plate}</span> },
          {
            key: 'id',
            header: 'Code camion',
            render: (t) =>
            <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${toneDot[healthMeta[t.health].tone]}`} title={healthMeta[t.health].label} />
                  <span className="font-mono text-xs font-semibold">{t.id}</span>
                </span>

          },
          { key: 'type', header: 'Type', render: (t) => <span className="text-ink-muted">{t.type}</span> },
          { key: 'driver', header: 'Chauffeur', render: (t) => t.driverId ? driverById[t.driverId]?.name : <span className="text-ink-subtle">Non affecté</span> },
          {
            key: 'status',
            header: 'Statut',
            render: (t) =>
            <div>
                  <Badge tone={truckStatusMeta[t.status].tone}>{truckStatusMeta[t.status].label}</Badge>
                  {t.status === 'mission' && <p className="mt-0.5 text-[11px] text-ink-subtle">{stageMeta[t.stage].label}</p>}
                </div>

          },
          { key: 'mission', header: 'Mission', render: (t) => t.missionId ? <span className="font-medium text-brand-700">{t.missionId}</span> : <span className="text-ink-subtle">—</span> },
          { key: 'gps', header: 'GPS', render: (t) => <Badge tone={gpsMeta[t.gps].tone} dot>{gpsMeta[t.gps].label}</Badge> },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (t) =>
            <RowActions
              inline={[
              { label: 'Voir', icon: EyeIcon, onClick: () => setDetail({ id: t.id, tab: 'overview' }) },
              { label: 'Suivre sur la carte', icon: MapPinIcon, onClick: () => navigate(`/suivi?truck=${t.id}`) }]
              }
              menu={[
              { label: 'Modifier', icon: PencilIcon, onClick: () => setForm({ open: true, truck: t }) },
              { label: 'Affecter un chauffeur', icon: UserPlusIcon, onClick: () => setAssign({ kind: 'driver', truck: t }) },
              { label: 'Affecter une mission', icon: ClipboardListIcon, onClick: () => setAssign({ kind: 'mission', truck: t }) },
              { label: 'Supprimer', icon: Trash2Icon, danger: true, onClick: () => removeWithUndo(setTrucks, trucks.find((x) => x.id === t.id) as Truck, 'Camion') }]
              } />


          }]
          } />
        
      </div>

      <TruckForm
        open={form.open}
        initial={form.truck}
        onClose={() => setForm({ open: false, truck: null })}
        onSubmit={(t) => {
          upsert(setTrucks, t);
          setForm({ open: false, truck: null });
          toast.success(form.truck ? 'Camion mis à jour' : 'Camion ajouté', { description: `${t.id} · ${t.plate}` });
        }} />
      
      <AssignModal
        open={assign?.kind === 'driver'}
        title={`Affecter un chauffeur · ${assign?.truck.id ?? ''}`}
        label="Chauffeur"
        emptyLabel="Aucun chauffeur"
        initialValue={assign?.truck.driverId ?? ''}
        options={drivers.map((d) => ({ value: d.id, label: `${d.name}${d.truckId && d.truckId !== assign?.truck.id ? ` · actuellement ${d.truckId}` : ''}` }))}
        onClose={() => setAssign(null)}
        onSubmit={(v) => {
          if (assign) assignDriver(assign.truck, v);
          setAssign(null);
        }} />
      
      <AssignModal
        open={assign?.kind === 'mission'}
        title={`Affecter une mission · ${assign?.truck.id ?? ''}`}
        description="Seules les missions planifiées, en préparation ou en cours sont proposées."
        label="Mission"
        emptyLabel="Aucune mission"
        initialValue={assign?.truck.missionId ?? ''}
        options={missions.filter((m) => ['planned', 'preparing', 'running'].includes(m.status)).map((m) => ({ value: m.id, label: `${m.id} · ${m.date} ${m.start}` }))}
        onClose={() => setAssign(null)}
        onSubmit={(v) => {
          if (assign) assignMission(assign.truck, v);
          setAssign(null);
        }} />
      
      <TruckDetailDrawer
        truckId={detail?.id ?? null}
        tab={detail?.tab ?? 'overview'}
        onTabChange={(tab) => setDetail(detail ? { ...detail, tab } : null)}
        onClose={() => setDetail(null)}
        onOpenMission={(id) => {
          setDetail(null);
          setMissionId(id);
        }}
        onShowOnMap={(id) => navigate(`/suivi?truck=${id}`)} />
      
      <MissionDrawer
        missionId={missionId}
        onClose={() => setMissionId(null)}
        onSelectTruck={(id) => {
          setMissionId(null);
          setDetail({ id, tab: 'overview' });
        }} />
      
    </div>);

}