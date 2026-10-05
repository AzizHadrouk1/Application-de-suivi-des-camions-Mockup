import type { CycleStandard, Truck } from '../types/fleet';
import { hash } from './geo';
import { locateInCycle, stageFactor } from './simulation';

export interface TimelineEvent {
  id: string;
  label: string;
  detail: string;
  expected: Date;
  actual: Date | null;
  delayMin: number;
  state: 'done' | 'current' | 'upcoming';
}

export interface CycleRecord {
  trip: number;
  start: Date;
  durationMin: number;
  deltaMin: number;
}

const MILESTONES = [
{ label: 'Chargement démarré', detail: 'Entrée zone de stock' },
{ label: 'Chargement terminé · départ', detail: 'Sortie zone de stock' },
{ label: 'Arrivée au port', detail: 'Entrée zone de déchargement' },
{ label: 'Déchargement terminé · retour', detail: 'Sortie du port' },
{ label: 'Arrivée zone de stock', detail: 'Fin du voyage' }];


export function addMin(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000);
}

export function buildCycleTimeline(truck: Truck, tick: number, cycle: CycleStandard, now: Date): TimelineEvent[] {
  if (truck.status !== 'mission' || truck.fixedStage) return [];
  const { t, start, idx, lens } = locateInCycle(truck, tick, cycle);
  const factors = lens.map((_, i) => stageFactor(truck, i));
  const realDone = lens.slice(0, idx).reduce((acc, l, i) => acc + l * factors[i], 0);
  const realElapsed = realDone + (t - start) * factors[idx];
  const cycleStart = addMin(now, -realElapsed);

  return MILESTONES.map((m, k) => {
    const expectedOffset = lens.slice(0, k).reduce((a, b) => a + b, 0);
    const actualOffset = lens.slice(0, k).reduce((acc, l, i) => acc + l * factors[i], 0);
    const done = k <= idx;
    return {
      id: `${truck.id}-${k}`,
      label: m.label,
      detail: m.detail,
      expected: addMin(cycleStart, expectedOffset),
      actual: done ? addMin(cycleStart, actualOffset) : null,
      delayMin: done ? actualOffset - expectedOffset : 0,
      state: done ? 'done' : k === idx + 1 ? 'current' : 'upcoming'
    };
  });
}

export function buildCycleHistory(truck: Truck, standardTotal: number, now: Date, count = 6): CycleRecord[] {
  const records: CycleRecord[] = [];
  let cursor = addMin(now, -20);
  for (let trip = truck.tripsDone; trip >= 1 && records.length < count; trip--) {
    const duration = Math.max(24, truck.cycleAvg + (hash(`${truck.id}-${trip}`) % 70 - 35) / 10);
    cursor = addMin(cursor, -duration);
    records.push({ trip, start: cursor, durationMin: duration, deltaMin: duration - standardTotal });
  }
  return records;
}