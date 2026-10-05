import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRightIcon, FileSpreadsheetIcon, FileTextIcon, MapPinnedIcon } from 'lucide-react';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { TruckDetailDrawer } from '../components/tracking/TruckDetailDrawer';
import { Badge, toneDot } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { emptyFilters, FilterBar, type FilterValues } from '../components/ui/FilterBar';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useFleetData } from '../contexts/FleetDataContext';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import { postePerformance, TRIPS_TARGET_PER_HOUR, tripsPerHour } from '../data/analytics';
import { STANDARD_CYCLE } from '../data/missions';
import type { CycleStandard } from '../types/fleet';
import type { TruckDetailTab } from '../types/map';
import { fmtMin, fmtNum, fmtSignedMin } from '../utils/format';
import { performanceScore, scoreTone } from '../utils/performance';
import { cycleTotal } from '../utils/simulation';
import { alertLevelMeta, alertTypeLabel, delayTone, healthMeta } from '../utils/status';

const STAGE_LABELS: {key: keyof CycleStandard;label: string;}[] = [
{ key: 'loading', label: 'Chargement' },
{ key: 'outbound', label: 'Trajet aller' },
{ key: 'unloading', label: 'Déchargement port' },
{ key: 'return', label: 'Retour' }];


export function Dashboard() {
  const { missions, alerts, driverById, shipById, missionById } = useFleetData();
  const { live } = useLiveFleet();
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);
  const [detail, setDetail] = useState<{id: string;tab: TruckDetailTab;} | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);

  const scoped = live.filter((t) => {
    const m = t.missionId ? missionById[t.missionId] : undefined;
    return (
      (!filters.mission || t.missionId === filters.mission) && (
      !filters.ship || m?.shipId === filters.ship) && (
      !filters.truck || t.id === filters.truck) && (
      !filters.driver || t.driverId === filters.driver) && (
      !filters.status || t.status === filters.status) && (
      !filters.zone || m?.stockZoneId === filters.zone || m?.portId === filters.zone));

  });
  const ids = new Set(scoped.map((t) => t.id));
  const inMission = scoped.filter((t) => t.status === 'mission').length;
  const available = scoped.filter((t) => t.status === 'available').length;
  const offMission = scoped.filter((t) => t.status === 'off_mission').length;
  const running = missions.filter((m) => m.status === 'running' && (!filters.mission || m.id === filters.mission) && (!filters.ship || m.shipId === filters.ship));
  const trips = scoped.reduce((s, t) => s + t.tripsDone, 0);
  const avgCycle = trips ? scoped.reduce((s, t) => s + t.cycleAvg * t.tripsDone, 0) / trips : 0;
  const cycleDelta = avgCycle - cycleTotal(STANDARD_CYCLE);
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved' && ids.has(a.truckId));
  const critical = activeAlerts.filter((a) => a.level === 'critical').length;
  const delays = scoped.reduce((s, t) => s + t.delays, 0);
  const perHour = trips / 9;

  const weight = running.reduce((s, m) => s + m.tripsDone, 0) || 1;
  const stageReal = STAGE_LABELS.map((s) => ({
    ...s,
    standard: STANDARD_CYCLE[s.key],
    real: running.reduce((acc, m) => acc + m.actualCycle[s.key] * m.tripsDone, 0) / weight
  }));

  const ranking = scoped.
  filter((t) => t.tripsDone > 0).
  map((t) => ({ ...t, score: performanceScore(t.cycleAvg, t.delays) })).
  sort((a, b) => b.score - a.score).
  slice(0, 8);
  const recentAlerts = alerts.filter((a) => ids.has(a.truckId)).slice(0, 7);
  const fleetTotal = scoped.length || 1;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Centre de contrôle"
        description="Opérations de chargement navire · Salin de Sfax → Port de Sfax · poste de 12 h (06:00 – 18:00)"
        actions={
        <>
            <Button icon={FileSpreadsheetIcon} onClick={() => toast.success('Export Excel prêt', { description: 'tableau-de-bord-05-10-2026.xlsx' })}>
              Excel
            </Button>
            <Button icon={FileTextIcon} onClick={() => toast.success('Export PDF prêt', { description: 'tableau-de-bord-05-10-2026.pdf' })}>
              PDF
            </Button>
            <Link to="/suivi" className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-brand-700">
              <MapPinnedIcon className="h-4 w-4" aria-hidden />
              Suivi en direct
            </Link>
          </>
        } />
      

      <FilterBar value={filters} onChange={setFilters} />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-ink-muted">Camions actifs</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-ink">{scoped.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink-muted">Missions actives</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-ink">{running.length}</p>
            </div>
          </div>
          <div className="mt-5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            <span className="bg-brand-600" style={{ width: `${inMission / fleetTotal * 100}%` }} />
            <span className="bg-ok-500" style={{ width: `${available / fleetTotal * 100}%` }} />
            <span className="bg-offline-400" style={{ width: `${offMission / fleetTotal * 100}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {[
            { label: 'En mission', value: inMission, dot: 'bg-brand-600' },
            { label: 'Disponibles', value: available, dot: 'bg-ok-500' },
            { label: 'Hors mission', value: offMission, dot: 'bg-offline-400' }].
            map((s) =>
            <div key={s.label}>
                <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{s.value}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="lg:col-span-3">
          <p className="text-sm font-medium text-ink-muted">Voyages réalisés aujourd’hui</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-ink">{trips}</p>
          <div className="mt-5 border-t border-line pt-3">
            <p className="text-xs text-ink-muted">Voyages / heure</p>
            <p className="mt-0.5 flex items-center gap-2 text-lg font-semibold tabular-nums text-ink">
              {fmtNum(perHour)}
              <Badge tone={perHour >= TRIPS_TARGET_PER_HOUR ? 'ok' : 'warn'}>objectif {TRIPS_TARGET_PER_HOUR}/h</Badge>
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="text-sm font-medium text-ink-muted">Temps moyen du cycle</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-ink">
            {fmtNum(Math.round(avgCycle * 10) / 10)}
            <span className="ml-1 text-base font-medium text-ink-subtle">min</span>
          </p>
          <div className="mt-5 border-t border-line pt-3">
            <p className="text-xs text-ink-muted">Standard 35 min</p>
            <Badge tone={delayTone(cycleDelta)} className="mt-1">
              {fmtSignedMin(cycleDelta)}
            </Badge>
          </div>
        </Card>

        <Link to="/alertes" className="group rounded-xl border border-danger-100 bg-danger-50 p-5 shadow-card transition-colors duration-150 hover:border-danger-500/40 lg:col-span-2">
          <p className="text-sm font-medium text-danger-700">Alertes actives</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-danger-600">{activeAlerts.length}</p>
          <div className="mt-5 border-t border-danger-100 pt-3 text-xs text-danger-700">
            <p>
              <span className="font-semibold tabular-nums">{critical}</span> critiques
            </p>
            <p className="mt-0.5">
              <span className="font-semibold tabular-nums">{delays}</span> retards aujourd’hui
            </p>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card
          className="lg:col-span-8"
          title="Voyages par heure"
          subtitle="Voyages terminés par tranche horaire · flotte complète"
          action={
          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brand-600" />Objectif atteint</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brand-300" />Sous l’objectif</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent-500" />Heure en cours</span>
            </div>
          }>
          
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripsPerHour} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E8F0" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A93A6' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A93A6' }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F4F6FA' }} contentStyle={{ borderRadius: 8, border: '1px solid #E3E8F0', fontSize: 12 }} formatter={(v) => [`${v} voyages`, 'Réalisés']} />
                <ReferenceLine y={TRIPS_TARGET_PER_HOUR} stroke="#F79009" strokeDasharray="4 4" label={{ value: `Objectif ${TRIPS_TARGET_PER_HOUR}/h`, position: 'insideTopRight', fontSize: 11, fill: '#B54708' }} />
                <Bar dataKey="trips" radius={[4, 4, 0, 0]} maxBarSize={38}>
                  {tripsPerHour.map((d) =>
                  <Cell key={d.hour} fill={d.current ? '#1FB2EE' : (d.trips ?? 0) >= TRIPS_TARGET_PER_HOUR ? '#1E50D8' : '#8AA8FA'} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4" title="Cycle · standard vs réel" subtitle="Moyenne des missions en cours">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className="pb-2 text-left font-medium">Étape</th>
                <th className="pb-2 text-right font-medium">Std</th>
                <th className="pb-2 text-right font-medium">Réel</th>
                <th className="pb-2 text-right font-medium">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {stageReal.map((s) =>
              <tr key={s.key}>
                  <td className="py-2.5 text-ink">{s.label}</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">{s.standard}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums text-ink">{fmtNum(s.real)}</td>
                  <td className="py-2.5 text-right">
                    <Badge tone={delayTone(s.real - s.standard)}>{fmtSignedMin(s.real - s.standard)}</Badge>
                  </td>
                </tr>
              )}
              <tr>
                <td className="pt-3 font-semibold text-ink">Cycle total</td>
                <td className="pt-3 text-right tabular-nums text-ink-muted">35</td>
                <td className="pt-3 text-right font-semibold tabular-nums text-ink">{fmtNum(stageReal.reduce((a, s) => a + s.real, 0))}</td>
                <td className="pt-3 text-right">
                  <Badge tone={delayTone(stageReal.reduce((a, s) => a + s.real - s.standard, 0))}>{fmtSignedMin(stageReal.reduce((a, s) => a + s.real - s.standard, 0))}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-muted">
            Temps standards paramétrables par mission ou type de camion.{' '}
            <Link to="/missions" className="font-medium text-brand-700 hover:underline">
              Configurer
            </Link>
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card
          className="lg:col-span-8"
          title="Performance par camion"
          subtitle="Classement du jour · score basé sur le cycle et les retards"
          action={
          <Link to="/analytique" className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-brand-700 hover:underline">
              Analyse complète <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName="px-0 pb-0">
          
          <DataTable
            rows={ranking}
            rowKey={(t) => t.id}
            onRowClick={(t) => setDetail({ id: t.id, tab: 'performance' })}
            columns={[
            { key: 'rank', header: '#', render: (t) => <span className="tabular-nums text-ink-subtle">{ranking.indexOf(t) + 1}</span> },
            {
              key: 'truck',
              header: 'Camion',
              render: (t) =>
              <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${toneDot[healthMeta[t.health].tone]}`} />
                    <span className="font-mono text-xs font-semibold">{t.id}</span>
                  </span>

            },
            { key: 'driver', header: 'Chauffeur', render: (t) => t.driverId ? driverById[t.driverId]?.name : '—' },
            { key: 'trips', header: 'Voyages', align: 'right', render: (t) => <span className="tabular-nums">{t.tripsDone}</span> },
            { key: 'cycle', header: 'Cycle moyen', align: 'right', render: (t) => <span className={`tabular-nums ${t.cycleAvg > 35 ? 'font-medium text-danger-600' : 'text-ok-600'}`}>{fmtMin(t.cycleAvg)}</span> },
            { key: 'delays', header: 'Retards', align: 'right', render: (t) => <span className={`tabular-nums ${t.delays ? 'text-danger-600' : 'text-ink-subtle'}`}>{t.delays}</span> },
            {
              key: 'score',
              header: 'Performance',
              render: (t) =>
              <span className="flex items-center gap-2">
                    <ProgressBar value={t.score / 100} tone={scoreTone(t.score)} className="w-20" label={`Score ${t.id}`} />
                    <span className="w-7 text-right text-xs font-semibold tabular-nums">{t.score}</span>
                  </span>

            }]
            } />
          
        </Card>

        <Card
          className="lg:col-span-4"
          title="Alertes récentes"
          action={
          <Link to="/alertes" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
              Tout voir <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          }>
          
          <ol>
            {recentAlerts.map((a, i) => {
              const lvl = alertLevelMeta[a.level];
              const resolved = a.status === 'resolved';
              return (
                <li key={a.id} className="flex gap-3">
                  <span className="w-11 shrink-0 pt-0.5 text-xs tabular-nums text-ink-subtle">{a.time}</span>
                  <div className="flex flex-col items-center">
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${resolved ? 'bg-offline-100 ring-1 ring-offline-400' : toneDot[lvl.tone]}`} aria-label={lvl.label} />
                    {i < recentAlerts.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
                  </div>
                  <button type="button" onClick={() => setDetail({ id: a.truckId, tab: 'timeline' })} className="min-w-0 flex-1 pb-4 text-left">
                    <p className={`text-sm font-medium ${resolved ? 'text-ink-muted' : 'text-ink'}`}>{alertTypeLabel[a.type]}</p>
                    <p className="truncate text-xs text-ink-muted">
                      <span className="font-mono">{a.truckId}</span> · {a.zone} · {a.durationMin} min
                    </p>
                  </button>
                </li>);

            })}
          </ol>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7" title="Performance par poste" subtitle="Temps moyen passé vs temps standard · barre noire = standard">
          <ul className="space-y-4">
            {postePerformance.map((p) => {
              const scale = Math.max(p.avg, p.standard) * 1.15;
              const over = p.avg > p.standard;
              return (
                <li key={p.id} className="grid grid-cols-[150px_1fr_120px] items-center gap-4 text-sm">
                  <div>
                    <p className="font-medium text-ink">{p.label}</p>
                    <p className="text-xs text-ink-subtle">{p.visits} passages</p>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-canvas">
                    <span className={`absolute inset-y-0 left-0 rounded-full ${over ? 'bg-danger-500' : 'bg-ok-500'}`} style={{ width: `${p.avg / scale * 100}%` }} />
                    <span className="absolute -top-1 h-[18px] w-0.5 rounded bg-ink" style={{ left: `${p.standard / scale * 100}%` }} />
                  </div>
                  <p className="text-right tabular-nums">
                    <span className="font-semibold text-ink">{fmtMin(p.avg)}</span> <span className="text-xs text-ink-subtle">/ {p.standard}</span>
                  </p>
                </li>);

            })}
          </ul>
        </Card>

        <Card className="lg:col-span-5" title="Missions actives" bodyClassName="px-0 pb-2">
          <ul className="divide-y divide-line">
            {running.map((m) =>
            <li key={m.id}>
                <button type="button" onClick={() => setMissionId(m.id)} className="w-full px-5 py-3 text-left transition-colors duration-150 hover:bg-canvas">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-semibold text-ink">{m.id}</span> <span className="text-ink-muted">· {shipById[m.shipId]?.name}</span>
                    </p>
                    <span className="text-xs tabular-nums text-ink-muted">
                      {m.truckIds.length} camions · début {m.start}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar value={m.tripsDone / m.tripsTarget} label={`Progression ${m.id}`} />
                    <span className="shrink-0 text-xs font-medium tabular-nums text-ink">
                      {m.tripsDone}/{m.tripsTarget}
                    </span>
                  </div>
                </button>
              </li>
            )}
            {running.length === 0 && <li className="px-5 py-8 text-center text-sm text-ink-muted">Aucune mission en cours pour ces filtres.</li>}
          </ul>
        </Card>
      </div>

      <TruckDetailDrawer
        truckId={detail?.id ?? null}
        tab={detail?.tab ?? 'overview'}
        onTabChange={(tab) => setDetail(detail ? { ...detail, tab } : null)}
        onClose={() => setDetail(null)}
        onOpenMission={(id) => {
          setDetail(null);
          setMissionId(id);
        }} />
      
      <MissionDrawer
        missionId={missionId}
        onClose={() => setMissionId(null)}
        onSelectTruck={(id) => {
          setMissionId(null);
          setDetail({ id, tab: 'overview' });
        }} />
      
    </div>);

}