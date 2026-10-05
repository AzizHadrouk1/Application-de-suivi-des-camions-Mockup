import React from "react";
import { AnchorIcon, CoffeeIcon, RouteIcon, WarehouseIcon, WrenchIcon, BoxIcon } from "lucide-react";
import { LiveTruck, Stage } from "../../types/fleet";
import { fmtNum } from "../../utils/format";
interface Node {
  id: string;
  label: string;
  icon: BoxIcon;
  stages: Stage[];
}
const CYCLE: Node[] = [{
  id: 'stock',
  label: 'Zone de stock',
  icon: WarehouseIcon,
  stages: ['loading']
}, {
  id: 'trajet',
  label: 'Trajet',
  icon: RouteIcon,
  stages: ['outbound', 'return']
}, {
  id: 'port',
  label: 'Port',
  icon: AnchorIcon,
  stages: ['unloading']
}];
const OFF_CYCLE: Node[] = [{
  id: 'atelier',
  label: 'Atelier',
  icon: WrenchIcon,
  stages: ['workshop']
}, {
  id: 'pause',
  label: 'Pause',
  icon: CoffeeIcon,
  stages: ['pause']
}];
export function StageTracker({
  truck


}: {truck: LiveTruck;}) {
  const late = truck.stageDelay > 0.05;
  const renderNode = (n: Node) => {
    const active = n.stages.includes(truck.stage);
    return <li key={n.id} aria-current={active ? 'step' : undefined} className={`flex flex-col items-center rounded-lg px-1.5 py-2.5 text-center ring-1 ring-inset ${active ? late ? 'bg-danger-600 text-white ring-danger-600' : 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-muted ring-line'}`}>
        <n.icon className="h-4 w-4" aria-hidden />
        <span className="mt-1 whitespace-nowrap text-xs font-medium">{n.label}</span>
        <span className={`mt-0.5 text-[11px] tabular-nums ${active ? 'text-white/80' : 'text-transparent'}`}>
          {active && truck.stageExpected ? `${fmtNum(truck.stageElapsed)} / ${fmtNum(truck.stageExpected)} min` : '—'}
        </span>
      </li>;
  };
  return <div>
      <div className="flex items-stretch gap-2">
        <div className="flex-[3]">
          <p className="mb-1.5 text-[11px] text-ink-subtle">Cycle de transport</p>
          <ol className="grid grid-cols-3 gap-1.5">{CYCLE.map(renderNode)}</ol>
        </div>
        <div className="w-px bg-line" aria-hidden />
        <div className="flex-[2]">
          <p className="mb-1.5 text-[11px] text-ink-subtle">Hors cycle</p>
          <ol className="grid grid-cols-2 gap-1.5">{OFF_CYCLE.map(renderNode)}</ol>
        </div>
      </div>
      {truck.stage === 'parked' && <p className="mt-2 text-xs text-ink-muted">Camion stationné · aucune étape opérationnelle en cours.</p>}
    </div>;
}