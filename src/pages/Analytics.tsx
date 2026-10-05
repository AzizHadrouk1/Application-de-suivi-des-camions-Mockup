import React, { useState } from 'react';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FileSpreadsheetIcon, FileTextIcon } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { emptyFilters, FilterBar, type FilterValues } from '../components/ui/FilterBar';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { useFleetData } from '../contexts/FleetDataContext';
import { postePerformance, zoneTimesByHour } from '../data/analytics';
import { fmtMin, fmtNum, fmtSignedMin } from '../utils/format';
import { performanceScore, scoreTone } from '../utils/performance';
import { cycleTotal } from '../utils/simulation';
import { delayTone, missionStatusMeta } from '../utils/status';

type View = 'trucks' | 'drivers' | 'missions' | 'zones';
const tooltipStyle = { borderRadius: 8, border: '1px solid #E3E8F0', fontSize: 12 };
const axis = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: '#8A93A6' } };

export function Analytics() {
  const { trucks, drivers, missions, shipById, alerts } = useFleetData();
  const [view, setView] = useState<View>('trucks');
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);

  const activeTrucks = trucks.
  filter((t) => t.tripsDone > 0).
  filter((t) => (!filters.mission || t.missionId === filters.mission) && (!filters.truck || t.id === filters.truck) && (!filters.driver || t.driverId === filters.driver));
  const rankedDrivers = drivers.
  filter((d) => d.trips > 0 && (!filters.driver || d.id === filters.driver)).
  map((d) => ({ ...d, score: performanceScore(d.cycleAvg, d.delays) })).
  sort((a, b) => b.score - a.score);
  const missionRows = missions.filter((m) => (!filters.mission || m.id === filters.mission) && (!filters.ship || m.shipId === filters.ship));

  const exportBtns =
  <>
      <Button icon={FileSpreadsheetIcon} onClick={() => toast.success('Export Excel prêt', { description: `analytique-${view}.xlsx` })}>
        Excel
      </Button>
      <Button icon={FileTextIcon} onClick={() => toast.success('Export PDF prêt', { description: `analytique-${view}.pdf` })}>
        PDF
      </Button>
    </>;


  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Analytique de performance" description="Camions, chauffeurs, missions et zones · temps réels mesurés à partir des entrées/sorties géolocalisées." actions={exportBtns} />
      <FilterBar value={filters} onChange={setFilters} />
      <Tabs
        value={view}
        onChange={setView}
        items={[
        { id: 'trucks', label: 'Camions', count: activeTrucks.length },
        { id: 'drivers', label: 'Chauffeurs', count: rankedDrivers.length },
        { id: 'missions', label: 'Missions', count: missionRows.length },
        { id: 'zones', label: 'Zones' }]
        } />
      

      {view === 'trucks' &&
      <>
          <Card title="Temps cumulé par zone et par camion" subtitle="Minutes aujourd’hui · stock, port, atelier, pause">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeTrucks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E3E8F0" />
                  <XAxis dataKey="id" {...axis} tickFormatter={(v: string) => v.replace('TRK-', '')} />
                  <YAxis {...axis} />
                  <Tooltip cursor={{ fill: '#F4F6FA' }} contentStyle={tooltipStyle} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="timeStock" name="Stock" stackId="z" fill="#0B8FC8" />
                  <Bar dataKey="timePort" name="Port" stackId="z" fill="#1E50D8" />
                  <Bar dataKey="timeWorkshop" name="Atelier" stackId="z" fill="#0E1A48" />
                  <Bar dataKey="timePause" name="Pause" stackId="z" fill="#B9CCFD" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Performance des camions" bodyClassName="px-0 pb-0">
            <DataTable
            rows={activeTrucks}
            rowKey={(t) => t.id}
            columns={[
            { key: 'id', header: 'Camion', render: (t) => <span className="font-mono text-xs font-semibold">{t.id}</span> },
            { key: 'trips', header: 'Voyages', align: 'right', render: (t) => <span className="tabular-nums">{t.tripsDone}</span> },
            { key: 'tph', header: 'Voyages/h', align: 'right', render: (t) => <span className="tabular-nums">{fmtNum(t.tripsDone / 6.5)}</span> },
            { key: 'cycle', header: 'Cycle moyen', align: 'right', render: (t) => <span className={`tabular-nums ${t.cycleAvg > 35 ? 'font-medium text-danger-600' : 'text-ok-600'}`}>{fmtMin(t.cycleAvg)}</span> },
            { key: 'delay', header: 'Retards', align: 'right', render: (t) => <span className={`tabular-nums ${t.delays ? 'text-danger-600' : 'text-ink-subtle'}`}>{t.delays}</span> },
            { key: 'stock', header: 'Stock', align: 'right', render: (t) => <span className="tabular-nums text-ink-muted">{t.timeStock} min</span> },
            { key: 'port', header: 'Port', align: 'right', render: (t) => <span className="tabular-nums text-ink-muted">{t.timePort} min</span> },
            { key: 'ws', header: 'Atelier', align: 'right', render: (t) => <span className="tabular-nums text-ink-muted">{t.timeWorkshop} min</span> },
            { key: 'pause', header: 'Pause', align: 'right', render: (t) => <span className="tabular-nums text-ink-muted">{t.timePause} min</span> }]
            } />
          
          </Card>
        </>
      }

      {view === 'drivers' &&
      <Card title="Classement des chauffeurs" subtitle="Score = cycle standard ÷ cycle moyen, pénalisé par les retards" bodyClassName="px-0 pb-0">
          <DataTable
          rows={rankedDrivers}
          rowKey={(d) => d.id}
          columns={[
          {
            key: 'rank',
            header: 'Rang',
            render: (d) => {
              const r = rankedDrivers.indexOf(d) + 1;
              return <span className={`grid h-6 w-6 place-items-center rounded-md text-xs font-semibold tabular-nums ${r <= 3 ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-muted'}`}>{r}</span>;
            }
          },
          { key: 'name', header: 'Chauffeur', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'truck', header: 'Camion', render: (d) => <span className="font-mono text-xs">{d.truckId}</span> },
          { key: 'trips', header: 'Voyages', align: 'right', render: (d) => <span className="tabular-nums">{d.trips}</span> },
          { key: 'cycle', header: 'Cycle moyen', align: 'right', render: (d) => <span className={`tabular-nums ${d.cycleAvg > 35 ? 'text-danger-600' : 'text-ok-600'}`}>{fmtMin(d.cycleAvg)}</span> },
          { key: 'delays', header: 'Retards', align: 'right', render: (d) => <span className="tabular-nums">{d.delays}</span> },
          { key: 'alerts', header: 'Alertes', align: 'right', render: (d) => <span className="tabular-nums">{d.alerts}</span> },
          {
            key: 'score',
            header: 'Score',
            render: (d) =>
            <span className="flex items-center gap-2">
                    <ProgressBar value={d.score / 100} tone={scoreTone(d.score)} className="w-24" label={`Score ${d.name}`} />
                    <span className="w-7 text-right text-xs font-semibold tabular-nums">{d.score}</span>
                  </span>

          }]
          } />
        
        </Card>
      }

      {view === 'missions' &&
      <>
          <Card title="Voyages réalisés vs objectif" subtitle="Par mission">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missionRows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E3E8F0" />
                  <XAxis dataKey="id" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip cursor={{ fill: '#F4F6FA' }} contentStyle={tooltipStyle} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="tripsTarget" name="Objectif" fill="#DCE6FE" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="tripsDone" name="Réalisés" fill="#1E50D8" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Performance des missions" bodyClassName="px-0 pb-0">
            <DataTable
            rows={missionRows}
            rowKey={(m) => m.id}
            columns={[
            { key: 'id', header: 'Mission', render: (m) => <span className="font-semibold">{m.id}</span> },
            { key: 'ship', header: 'Navire', render: (m) => shipById[m.shipId]?.name ?? '—' },
            { key: 'status', header: 'Statut', render: (m) => <Badge tone={missionStatusMeta[m.status].tone}>{missionStatusMeta[m.status].label}</Badge> },
            { key: 'trucks', header: 'Camions', align: 'right', render: (m) => <span className="tabular-nums">{m.truckIds.length}</span> },
            { key: 'trips', header: 'Voyages', align: 'right', render: (m) => <span className="tabular-nums">{m.tripsDone}/{m.tripsTarget}</span> },
            {
              key: 'cycle',
              header: 'Cycle moyen',
              align: 'right',
              render: (m) => {
                const real = cycleTotal(m.actualCycle);
                if (!real) return <span className="text-ink-subtle">—</span>;
                const d = real - cycleTotal(m.standardCycle);
                return (
                  <span className="inline-flex items-center gap-2 tabular-nums">
                        {fmtMin(Math.round(real * 10) / 10)}
                        <Badge tone={delayTone(d)}>{fmtSignedMin(d)}</Badge>
                      </span>);

              }
            },
            {
              key: 'delays',
              header: 'Retards',
              align: 'right',
              render: (m) => <span className="tabular-nums">{alerts.filter((a) => a.missionId === m.id && ['route_delay', 'port_excess', 'stock_excess', 'long_stop'].includes(a.type)).length}</span>
            }]
            } />
          
          </Card>
        </>
      }

      {view === 'zones' &&
      <>
          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line shadow-card sm:grid-cols-2 lg:grid-cols-4">
            {postePerformance.
          filter((p) => p.id !== 'trajet').
          map((p) => {
            const d = p.avg - p.standard;
            return (
              <div key={p.id} className="bg-white p-5">
                    <p className="text-xs font-medium text-ink-muted">Temps moyen · {p.label.toLowerCase()}</p>
                    <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{fmtMin(p.avg)}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-ink-subtle">
                      standard {p.standard} min <Badge tone={delayTone(d)}>{fmtSignedMin(d)}</Badge>
                    </p>
                  </div>);

          })}
          </div>
          <Card title="Évolution horaire du temps passé" subtitle="Zone de stock et port · minutes par passage">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={zoneTimesByHour} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E3E8F0" />
                  <XAxis dataKey="hour" {...axis} />
                  <YAxis {...axis} domain={[0, 12]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={10} stroke="#0B8FC8" strokeDasharray="4 4" />
                  <ReferenceLine y={5} stroke="#1E50D8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="stock" name="Zone de stock" stroke="#0B8FC8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="port" name="Port" stroke="#1E50D8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      }
    </div>);

}