import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IDLE_POINT, MAP_CENTER, OFFLINE_POINT, TRUCK_PARK } from '../data/geo';
import { STANDARD_CYCLE } from '../data/missions';
import type { LatLng, LiveTruck, Truck } from '../types/fleet';
import { centroid } from '../utils/geo';
import { computeTruckState, lastUpdateSeconds, type SimContext } from '../utils/simulation';
import { useFleetData } from './FleetDataContext';

interface LiveFleet {
  tick: number;
  live: LiveTruck[];
  liveById: Record<string, LiveTruck>;
  contextFor: (truck: Truck) => SimContext;
  getTrail: (id: string, points?: number) => LatLng[];
}

const LiveFleetCtx = createContext<LiveFleet | null>(null);

export function LiveFleetProvider({ children }: {children: React.ReactNode;}) {
  const { trucks, missionById, stockZones, ports, routes, workshops, pauseZones } = useFleetData();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const contextFor = useCallback(
    (truck: Truck): SimContext => {
      const mission = truck.missionId ? missionById[truck.missionId] : undefined;
      const zone = stockZones.find((z) => z.id === mission?.stockZoneId) ?? stockZones[0];
      const port = ports.find((p) => p.id === mission?.portId) ?? ports[0];
      const stock = zone ? centroid(zone.coords) : MAP_CENTER;
      const portC = port ? centroid(port.coords) : MAP_CENTER;
      const allerR = routes.find((r) => r.direction === 'aller');
      const retourR = routes.find((r) => r.direction === 'retour');
      return {
        stock,
        port: portC,
        aller: [stock, ...(allerR?.coords ?? []), portC],
        retour: [portC, ...(retourR?.coords ?? []), stock],
        workshop: workshops[0]?.coords[0] ?? stock,
        pause: pauseZones[0]?.coords[0] ?? stock,
        park: TRUCK_PARK,
        idle: IDLE_POINT,
        offline: OFFLINE_POINT,
        cycle: mission?.standardCycle ?? STANDARD_CYCLE,
        workshopMax: workshops[0]?.maxMin ?? 60,
        pauseMax: pauseZones[0]?.maxMin ?? 30
      };
    },
    [missionById, stockZones, ports, routes, workshops, pauseZones]
  );

  const live = useMemo<LiveTruck[]>(
    () =>
    trucks.map((tr) => ({
      ...tr,
      ...computeTruckState(tr, tick, contextFor(tr)),
      lastUpdateSec: lastUpdateSeconds(tr, tick)
    })),
    [trucks, tick, contextFor]
  );

  const liveById = useMemo(() => Object.fromEntries(live.map((t) => [t.id, t])), [live]);

  const getTrail = useCallback(
    (id: string, points = 40): LatLng[] => {
      const truck = trucks.find((t) => t.id === id);
      if (!truck || truck.status !== 'mission' || truck.fixedStage) return [];
      const ctx = contextFor(truck);
      const out: LatLng[] = [];
      for (let k = points; k >= 0; k--) out.push(computeTruckState(truck, tick - k * 4, ctx).position);
      return out;
    },
    [trucks, tick, contextFor]
  );

  const value = useMemo(() => ({ tick, live, liveById, contextFor, getTrail }), [tick, live, liveById, contextFor, getTrail]);

  return <LiveFleetCtx.Provider value={value}>{children}</LiveFleetCtx.Provider>;
}

export function useLiveFleet(): LiveFleet {
  const ctx = useContext(LiveFleetCtx);
  if (!ctx) throw new Error('useLiveFleet must be used inside LiveFleetProvider');
  return ctx;
}