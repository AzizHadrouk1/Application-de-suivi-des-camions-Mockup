import React from 'react';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import type { LiveTruck } from '../../types/fleet';
import { fmtClock, fmtMin, fmtNum, fmtSignedMin } from '../../utils/format';
import { cycleTotal } from '../../utils/simulation';
import { delayTone, stageMeta } from '../../utils/status';
import { addMin, buildCycleHistory, buildCycleTimeline } from '../../utils/timeline';
import { Badge } from '../ui/Badge';

export function TruckTimeline({ truck }: {truck: LiveTruck;}) {
  const { tick, contextFor } = useLiveFleet();
  const ctx = contextFor(truck);
  const now = new Date();
  const events = buildCycleTimeline(truck, tick, ctx.cycle, now);
  const history = buildCycleHistory(truck, cycleTotal(ctx.cycle), now);
  const fixedStage = truck.stage === 'workshop' || truck.stage === 'pause';

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{fixedStage ? stageMeta[truck.stage].label : `Voyage en cours · ${Math.min(truck.tripsDone + 1, truck.tripsTarget || 1)}`}</h3>
          <span className="text-xs text-ink-subtle">Réel · prévu · écart</span>
        </div>

        {fixedStage &&
        <div className={`rounded-lg p-4 ring-1 ring-inset ${truck.stageDelay > 0 ? 'bg-danger-50 ring-danger-100' : 'bg-canvas ring-line'}`}>
            <p className="text-sm font-medium text-ink">Entrée {stageMeta[truck.stage].location.toLowerCase()} à {fmtClock(addMin(now, -truck.stageElapsed))}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Présent depuis {fmtMin(Math.round(truck.stageElapsed))} · durée maximale {fmtMin(truck.stageExpected)}
            </p>
            {truck.stageDelay > 0 && <p className="mt-2 text-sm font-medium text-danger-700">Dépassement de {fmtNum(Math.round(truck.stageDelay))} min</p>}
          </div>
        }

        {!fixedStage && events.length === 0 && <p className="text-sm text-ink-muted">Ce camion n’est affecté à aucune mission en cours.</p>}

        {events.length > 0 &&
        <ol>
            {events.map((e, i) => {
            const late = e.state === 'done' && e.delayMin > 0.05;
            const dot =
            e.state === 'done' ? late ? 'bg-danger-500 ring-danger-500' : 'bg-ok-500 ring-ok-500' : e.state === 'current' ? 'bg-white ring-2 ring-brand-600' : 'bg-white ring-1 ring-line';
            return (
              <li key={e.id} className="flex gap-4">
                  <div className="w-14 shrink-0 pt-0.5 text-right">
                    <p className={`text-sm font-semibold tabular-nums ${e.actual ? late ? 'text-danger-600' : 'text-ink' : 'text-ink-subtle'}`}>{e.actual ? fmtClock(e.actual) : '—'}</p>
                    <p className="text-[11px] tabular-nums text-ink-subtle">prévu {fmtClock(e.expected)}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ring-inset ${dot}`} aria-hidden />
                    {i < events.length - 1 && <span className={`my-1 w-px flex-1 ${e.state === 'done' ? 'bg-ok-500/40' : 'bg-line'}`} aria-hidden />}
                  </div>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pb-6">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${e.state === 'upcoming' ? 'text-ink-muted' : 'text-ink'}`}>{e.label}</p>
                      <p className="text-xs text-ink-subtle">{e.detail}</p>
                    </div>
                    {e.state === 'done' && i > 0 && <Badge tone={delayTone(e.delayMin)}>{fmtSignedMin(e.delayMin)}</Badge>}
                    {e.state === 'current' && (
                  truck.stageDelay > 0.05 ? <Badge tone="danger">+{fmtNum(truck.stageDelay)} min</Badge> : <Badge tone="brand" dot>En cours</Badge>)}
                  </div>
                </li>);

          })}
          </ol>
        }
      </section>

      {history.length > 0 &&
      <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Voyages précédents</h3>
          <ul className="divide-y divide-line rounded-lg ring-1 ring-line">
            {history.map((r) =>
          <li key={r.trip} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="w-20 font-medium text-ink">Voyage {r.trip}</span>
                <span className="tabular-nums text-ink-muted">{fmtClock(r.start)}</span>
                <span className="ml-auto tabular-nums text-ink">{fmtMin(Math.round(r.durationMin * 10) / 10)}</span>
                <Badge tone={delayTone(r.deltaMin)} className="w-[72px] justify-center">
                  {fmtSignedMin(r.deltaMin)}
                </Badge>
              </li>
          )}
          </ul>
        </section>
      }
    </div>);

}