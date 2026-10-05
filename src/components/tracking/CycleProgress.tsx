import React from 'react';
import { AnchorIcon, WarehouseIcon } from 'lucide-react';
import type { CycleStandard, Stage } from '../../types/fleet';
import { fmtMin, fmtSignedMin } from '../../utils/format';
import { cycleTotal } from '../../utils/simulation';
import { delayTone } from '../../utils/status';
import { Badge } from '../ui/Badge';

interface CycleProgressProps {
  standard: CycleStandard;
  actual: CycleStandard;
  counts: Partial<Record<Stage, number>>;
  stockName: string;
  portName: string;
}

type Step = {type: 'point';label: string;sub: string;port?: boolean;} | {type: 'stage';key: keyof CycleStandard;stage: Stage;label: string;};

export function CycleProgress({ standard, actual, counts, stockName, portName }: CycleProgressProps) {
  const steps: Step[] = [
  { type: 'point', label: 'Stock', sub: stockName },
  { type: 'stage', key: 'loading', stage: 'loading', label: 'Chargement' },
  { type: 'stage', key: 'outbound', stage: 'outbound', label: 'Trajet aller' },
  { type: 'point', label: 'Port', sub: portName, port: true },
  { type: 'stage', key: 'unloading', stage: 'unloading', label: 'Déchargement' },
  { type: 'stage', key: 'return', stage: 'return', label: 'Retour' },
  { type: 'point', label: 'Stock', sub: 'Fin du cycle' }];

  const started = cycleTotal(actual) > 0;
  const totalDelta = cycleTotal(actual) - cycleTotal(standard);

  return (
    <div>
      <ol>
        {steps.map((s, i) => {
          if (s.type === 'point') {
            const Icon = s.port ? AnchorIcon : WarehouseIcon;
            return (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy-900 text-white">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-ink">
                  {s.label} <span className="font-normal text-ink-muted">· {s.sub}</span>
                </p>
              </li>);

          }
          const std = standard[s.key];
          const real = actual[s.key];
          const delta = real - std;
          const scale = Math.max(std, real) * 1.2 || 1;
          const count = counts[s.stage] ?? 0;
          return (
            <li key={i} className="ml-[13px] border-l-2 border-line py-3 pl-6">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ink">{s.label}</p>
                {count > 0 &&
                <span className="rounded bg-brand-50 px-1.5 text-[11px] font-medium leading-5 text-brand-700">
                    {count} camion{count > 1 ? 's' : ''}
                  </span>
                }
                <span className="ml-auto text-xs tabular-nums text-ink-muted">
                  {started ? fmtMin(real) : '—'} <span className="text-ink-subtle">/ std {fmtMin(std)}</span>
                </span>
                {started &&
                <Badge tone={delayTone(delta)} className="w-[70px] justify-center">
                    {fmtSignedMin(delta)}
                  </Badge>
                }
              </div>
              {started &&
              <div className="relative mt-2 h-1.5 rounded-full bg-canvas">
                  <span className={`absolute inset-y-0 left-0 rounded-full ${delta > 0.05 ? 'bg-danger-500' : 'bg-ok-500'}`} style={{ width: `${real / scale * 100}%` }} />
                  <span className="absolute -top-1 h-3.5 w-0.5 rounded bg-ink" style={{ left: `${std / scale * 100}%` }} title="Temps standard" />
                </div>
              }
            </li>);

        })}
      </ol>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-canvas px-4 py-3">
        <span className="text-sm font-medium text-ink">Cycle total</span>
        <span className="flex items-center gap-3 text-sm tabular-nums">
          <span className="font-semibold text-ink">{started ? fmtMin(Math.round(cycleTotal(actual) * 10) / 10) : '—'}</span>
          <span className="text-ink-subtle">std {fmtMin(cycleTotal(standard))}</span>
          {started && <Badge tone={delayTone(totalDelta)}>{fmtSignedMin(totalDelta)}</Badge>}
        </span>
      </div>
    </div>);

}