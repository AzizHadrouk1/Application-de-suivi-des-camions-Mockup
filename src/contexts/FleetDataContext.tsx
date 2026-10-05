import React, { createContext, useContext, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { alerts as initialAlerts } from '../data/alerts';
import { drivers as initialDrivers } from '../data/drivers';
import { pauseZones as initialPause, ports as initialPorts, routes as initialRoutes, stockZones as initialStock, workshops as initialWorkshops } from '../data/geo';
import { missions as initialMissions } from '../data/missions';
import { ships as initialShips } from '../data/ships';
import { trucks as initialTrucks } from '../data/trucks';
import type { Driver, FixedSite, FleetAlert, Mission, Port, RouteLine, Ship, StockZone, Truck } from '../types/fleet';

type Setter<T> = Dispatch<SetStateAction<T[]>>;

interface FleetData {
  trucks: Truck[];
  setTrucks: Setter<Truck>;
  drivers: Driver[];
  setDrivers: Setter<Driver>;
  missions: Mission[];
  setMissions: Setter<Mission>;
  ships: Ship[];
  setShips: Setter<Ship>;
  alerts: FleetAlert[];
  setAlerts: Setter<FleetAlert>;
  stockZones: StockZone[];
  setStockZones: Setter<StockZone>;
  ports: Port[];
  setPorts: Setter<Port>;
  routes: RouteLine[];
  setRoutes: Setter<RouteLine>;
  workshops: FixedSite[];
  setWorkshops: Setter<FixedSite>;
  pauseZones: FixedSite[];
  setPauseZones: Setter<FixedSite>;
  driverById: Record<string, Driver>;
  missionById: Record<string, Mission>;
  shipById: Record<string, Ship>;
  truckById: Record<string, Truck>;
}

const FleetDataCtx = createContext<FleetData | null>(null);

function indexBy<T extends {id: string;}>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((i) => [i.id, i]));
}

export function FleetDataProvider({ children }: {children: React.ReactNode;}) {
  const [trucks, setTrucks] = useState(initialTrucks);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [missions, setMissions] = useState(initialMissions);
  const [ships, setShips] = useState(initialShips);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [stockZones, setStockZones] = useState(initialStock);
  const [ports, setPorts] = useState(initialPorts);
  const [routes, setRoutes] = useState(initialRoutes);
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [pauseZones, setPauseZones] = useState(initialPause);

  const value = useMemo<FleetData>(
    () => ({
      trucks, setTrucks, drivers, setDrivers, missions, setMissions, ships, setShips, alerts, setAlerts,
      stockZones, setStockZones, ports, setPorts, routes, setRoutes, workshops, setWorkshops, pauseZones, setPauseZones,
      driverById: indexBy(drivers),
      missionById: indexBy(missions),
      shipById: indexBy(ships),
      truckById: indexBy(trucks)
    }),
    [trucks, drivers, missions, ships, alerts, stockZones, ports, routes, workshops, pauseZones]
  );

  return <FleetDataCtx.Provider value={value}>{children}</FleetDataCtx.Provider>;
}

export function useFleetData(): FleetData {
  const ctx = useContext(FleetDataCtx);
  if (!ctx) throw new Error('useFleetData must be used inside FleetDataProvider');
  return ctx;
}