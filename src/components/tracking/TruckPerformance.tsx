import React from 'react';
import type { LiveTruck } from '../../types/fleet';
import { fmtMin, fmtSignedMin } from '../../utils/format';
import { performanceScore, scoreTone } from '../../utils/performance';
import { toneDot, toneText } from '../ui/Badge';

export function TruckPerformance({ truck }: {truck: LiveTruck;}) {
  const score = performanceScore(truck.cycleAvg, truck.delays);
  const delta = truck.cycleAvg ? truck.cycleAvg - 35 : 0;
  const zones = [
  { label: 'Zone de stock', value: truck.timeStock },
  { label: 'Port', value: truck.timePort },
  { label: 'Atelier', value: truck.timeWorkshop },
  { label: 'Pause', value: truck.timePause }];

  const max = Math.max(1, ...zones.map((z) => z.value));

  if (!truck.tripsDone) {
    return <p className="text-sm text-ink-muted">Aucun voyage réalisé aujourd’hui par ce camion.</p>;
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line">
        <div className="bg-white p-4">
          <p className="text-xs text-ink-muted">Score de performance</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${toneText[scoreTone(score)]}`}>{score}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-ink-muted">Temps moyen du cycle</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">{fmtMin(truck.cycleAvg)}</p>
          <p className={`text-xs font-medium ${delta > 0 ? 'text-danger-600' : 'text-ok-600'}`}>{fmtSignedMin(delta)} vs standard 35 min</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-ink-muted">Voyages aujourd’hui</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
            {truck.tripsDone} <span className="text-sm font-normal text-ink-subtle">/ {truck.tripsTarget}</span>
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-ink-muted">Retards · passages atelier</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
            <span className={truck.delays ? 'text-danger-600' : ''}>{truck.delays}</span> <span className="text-ink-subtle">·</span> {truck.workshopVisits}
          </p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">Temps cumulé par zone · aujourd’hui</h3>
        <ul className="space-y-3">
          {zones.map((z) =>
          <li key={z.label} className="grid grid-cols-[110px_1fr_56px] items-center gap-3 text-sm">
              <span className="text-ink-muted">{z.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-canvas">
                <span className={`block h-full rounded-full ${toneDot.brand}`} style={{ width: `${z.value / max * 100}%` }} />
              </span>
              <span className="text-right tabular-nums text-ink">{z.value} min</span>
            </li>
          )}
        </ul>
      </section>
    </div>);

}