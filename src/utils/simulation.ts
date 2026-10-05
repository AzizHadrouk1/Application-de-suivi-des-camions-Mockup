import type { CycleStandard, LatLng, Stage, Truck } from '../types/fleet';
import { hash, jitter, pointAlong } from './geo';

export interface SimContext {
  stock: LatLng;
  port: LatLng;
  aller: LatLng[];
  retour: LatLng[];
  workshop: LatLng;
  pause: LatLng;
  park: LatLng;
  idle: LatLng;
  offline: LatLng;
  cycle: CycleStandard;
  workshopMax: number;
  pauseMax: number;
}

export interface TruckState {
  position: LatLng;
  stage: Stage;
  stageElapsed: number;
  stageExpected: number;
  stageDelay: number;
}

export const CYCLE_STAGES: Stage[] = ['loading', 'outbound', 'unloading', 'return'];
const SIM_SPEED = 0.08;

export function cycleLengths(c: CycleStandard): number[] {
  return [c.loading, c.outbound, c.unloading, c.return];
}

export function cycleTotal(c: CycleStandard): number {
  return c.loading + c.outbound + c.unloading + c.return;
}

export function stageFactor(truck: Truck, idx: number): number {
  const base = truck.health === 'alert' ? 1.45 : truck.health === 'warning' ? 1.2 : 0.88;
  const variation = (hash(`${truck.id}-${idx}`) % 17 - 8) / 100;
  return base + variation;
}

export function cycleT(truck: Truck, tick: number, total: number): number {
  const raw = truck.cycleOffset + tick * SIM_SPEED * truck.speedFactor;
  return (raw % total + total) % total;
}

export function locateInCycle(truck: Truck, tick: number, cycle: CycleStandard) {
  const lens = cycleLengths(cycle);
  const t = cycleT(truck, tick, cycleTotal(cycle));
  let start = 0;
  let idx = 0;
  while (idx < 3 && t >= start + lens[idx]) {
    start += lens[idx];
    idx++;
  }
  return { t, start, idx, lens };
}

export function computeTruckState(truck: Truck, tick: number, ctx: SimContext): TruckState {
  const fixed = (position: LatLng, stage: Stage, elapsed = 0, expected = 0): TruckState => ({
    position,
    stage,
    stageElapsed: elapsed,
    stageExpected: expected,
    stageDelay: Math.max(0, elapsed - expected)
  });

  if (truck.status === 'available') return fixed(jitter(ctx.park, truck.id, 0.00032), 'parked');
  if (truck.status === 'off_mission') return fixed(truck.health === 'offline' ? ctx.offline : ctx.idle, 'parked');

  const fixedElapsed = truck.cycleOffset + tick / 60;
  if (truck.fixedStage === 'workshop') return fixed(jitter(ctx.workshop, truck.id, 0.00012), 'workshop', fixedElapsed, ctx.workshopMax);
  if (truck.fixedStage === 'pause') return fixed(jitter(ctx.pause, truck.id, 0.00012), 'pause', fixedElapsed, ctx.pauseMax);

  const { t, start, idx, lens } = locateInCycle(truck, tick, ctx.cycle);
  const frac = (t - start) / lens[idx];
  const stage = CYCLE_STAGES[idx];
  let position: LatLng;
  if (stage === 'loading') position = jitter(ctx.stock, truck.id);else
  if (stage === 'outbound') position = pointAlong(ctx.aller, frac);else
  if (stage === 'unloading') position = jitter(ctx.port, truck.id, 0.00022);else
  position = pointAlong(ctx.retour, frac);

  const elapsed = (t - start) * stageFactor(truck, idx);
  return { position, stage, stageElapsed: elapsed, stageExpected: lens[idx], stageDelay: Math.max(0, elapsed - lens[idx]) };
}

export function lastUpdateSeconds(truck: Truck, tick: number): number {
  if (truck.health === 'offline') return 1080 + tick;
  const h = hash(truck.id);
  return (h + tick) % (6 + h % 10) + 1;
}