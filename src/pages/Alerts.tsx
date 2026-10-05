import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCheckIcon, CheckIcon, ClipboardListIcon, FileSpreadsheetIcon, MapPinIcon, TruckIcon } from 'lucide-react';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { TruckDetailDrawer } from '../components/tracking/TruckDetailDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { RowActions, type RowAction } from '../components/ui/RowActions';
import { SelectInput } from '../components/ui/SelectInput';
import { StatStrip } from '../components/ui/StatStrip';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import type { AlertLevel, AlertStatus, AlertType, FleetAlert } from '../types/fleet';
import type { TruckDetailTab } from '../types/map';
import { alertLevelMeta, alertStatusMeta, alertTypeLabel } from '../utils/status';

type StatusTab = 'active' | AlertStatus | 'all';

export function Alerts() {
  const { alerts, setAlerts, driverById } = useFleetData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<StatusTab>('active');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('');
  const [detail, setDetail] = useState<{id: string;tab: TruckDetailTab;} | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);

  const setStatus = (a: FleetAlert, status: AlertStatus) => {
    setAlerts((prev) => prev.map((x) => x.id === a.id ? { ...x, status } : x));
    toast.success(status === 'resolved' ? 'Alerte résolue' : 'Alerte prise en compte', { description: `${a.id} · ${alertTypeLabel[a.type]}` });
  };

  const active = alerts.filter((a) => a.status !== 'resolved');
  const rows = alerts.filter((a) => {
    const statusOk = tab === 'all' ? true : tab === 'active' ? a.status !== 'resolved' : a.status === tab;
    return statusOk && (!level || a.level === level) && (!type || a.type === type);
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Centre d’alertes"
        description="Dépassements des temps standards, sorties de zone, arrêts et pertes GPS détectés automatiquement."
        actions={
        <Button icon={FileSpreadsheetIcon} onClick={() => toast.success('Export Excel prêt', { description: 'alertes-05-10-2026.xlsx' })}>
            Exporter
          </Button>
        } />
      
      <StatStrip
        items={[
        { label: 'Critiques ouvertes', value: active.filter((a) => a.level === 'critical').length, tone: 'danger', hint: 'Action immédiate requise' },
        { label: 'Warnings', value: active.filter((a) => a.level === 'warning').length, tone: 'warn' },
        { label: 'Informations', value: active.filter((a) => a.level === 'info').length, tone: 'info' },
        { label: 'Prises en compte', value: alerts.filter((a) => a.status === 'acknowledged').length, tone: 'accent' },
        { label: 'Résolues aujourd’hui', value: alerts.filter((a) => a.status === 'resolved').length, tone: 'ok' }]
        } />
      
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-line p-3 lg:flex-row lg:items-center">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
            { id: 'active', label: 'Actives', count: active.length },
            { id: 'open', label: 'Ouvertes', count: alerts.filter((a) => a.status === 'open').length },
            { id: 'acknowledged', label: 'Prises en compte', count: alerts.filter((a) => a.status === 'acknowledged').length },
            { id: 'resolved', label: 'Résolues', count: alerts.filter((a) => a.status === 'resolved').length },
            { id: 'all', label: 'Toutes', count: alerts.length }]
            } />
          
          <div className="flex gap-2 lg:ml-auto">
            <SelectInput
              aria-label="Niveau"
              className="w-40"
              placeholder="Tous niveaux"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={(Object.keys(alertLevelMeta) as AlertLevel[]).map((k) => ({ value: k, label: alertLevelMeta[k].label }))} />
            
            <SelectInput
              aria-label="Catégorie"
              className="w-60"
              placeholder="Toutes catégories"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={(Object.keys(alertTypeLabel) as AlertType[]).map((k) => ({ value: k, label: alertTypeLabel[k] }))} />
            
          </div>
        </div>
        <DataTable
          rows={rows}
          rowKey={(a) => a.id}
          empty="Aucune alerte pour ces filtres."
          columns={[
          { key: 'time', header: 'Heure', render: (a) => <span className="tabular-nums text-ink-muted">{a.time}</span> },
          { key: 'truck', header: 'Camion', render: (a) => <span className="font-mono text-xs font-semibold">{a.truckId}</span> },
          { key: 'driver', header: 'Chauffeur', render: (a) => a.driverId ? driverById[a.driverId]?.name : '—' },
          { key: 'mission', header: 'Mission', render: (a) => a.missionId ? <span className="text-brand-700">{a.missionId}</span> : <span className="text-ink-subtle">—</span> },
          {
            key: 'type',
            header: 'Type',
            render: (a) =>
            <div className="max-w-[260px]">
                  <p className="font-medium text-ink">{alertTypeLabel[a.type]}</p>
                  <p className="truncate text-xs text-ink-subtle" title={a.message}>
                    {a.message}
                  </p>
                </div>

          },
          { key: 'zone', header: 'Zone', render: (a) => <span className="text-ink-muted">{a.zone}</span> },
          { key: 'dur', header: 'Durée', align: 'right', render: (a) => <span className="tabular-nums">{a.durationMin} min</span> },
          { key: 'level', header: 'Niveau', render: (a) => <Badge tone={alertLevelMeta[a.level].tone} dot>{alertLevelMeta[a.level].label}</Badge> },
          { key: 'status', header: 'Statut', render: (a) => <Badge tone={alertStatusMeta[a.status].tone}>{alertStatusMeta[a.status].label}</Badge> },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (a) => {
              const inline: RowAction[] = [{ label: 'Voir sur la carte', icon: MapPinIcon, onClick: () => navigate(`/suivi?truck=${a.truckId}`) }];
              if (a.status === 'open') inline.push({ label: 'Prendre en compte', icon: CheckIcon, onClick: () => setStatus(a, 'acknowledged') });
              if (a.status !== 'resolved') inline.push({ label: 'Résoudre', icon: CheckCheckIcon, onClick: () => setStatus(a, 'resolved') });
              const menu: RowAction[] = [{ label: 'Voir le camion', icon: TruckIcon, onClick: () => setDetail({ id: a.truckId, tab: 'timeline' }) }];
              if (a.missionId) menu.push({ label: 'Voir la mission', icon: ClipboardListIcon, onClick: () => setMissionId(a.missionId) });
              return <RowActions inline={inline} menu={menu} />;
            }
          }]
          } />
        
      </div>

      <TruckDetailDrawer
        truckId={detail?.id ?? null}
        tab={detail?.tab ?? 'overview'}
        onTabChange={(t) => setDetail(detail ? { ...detail, tab: t } : null)}
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