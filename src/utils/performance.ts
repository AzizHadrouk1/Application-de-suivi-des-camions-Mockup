import type { Tone } from '../components/ui/Badge';
import type { LiveTruck, Mission } from '../types/fleet';

export function performanceScore(cycleAvg: number, delays: number, standard = 35): number {
  if (!cycleAvg) return 0;
  return Math.max(0, Math.min(100, Math.round(standard / cycleAvg * 100 - delays * 4)));
}

export function scoreTone(score: number): Tone {
  if (score >= 90) return 'ok';
  if (score >= 75) return 'warn';
  return 'danger';
}

export function trucksInZone(
live: LiveTruck[],
missions: Mission[],
kind: 'stock' | 'port' | 'workshop' | 'pause',
zoneId: string,
isPrimarySite = true)
: LiveTruck[] {
  if (kind === 'workshop') return isPrimarySite ? live.filter((t) => t.stage === 'workshop') : [];
  if (kind === 'pause') return isPrimarySite ? live.filter((t) => t.stage === 'pause') : [];
  return live.filter((t) => {
    const m = missions.find((x) => x.id === t.missionId);
    if (!m) return false;
    if (kind === 'stock') return t.stage === 'loading' && m.stockZoneId === zoneId;
    return t.stage === 'unloading' && m.portId === zoneId;
  });
}