import {
  AnchorIcon,
  CoffeeIcon,
  RouteIcon,
  ShipIcon,
  TruckIcon,
  UserRoundIcon,
  WarehouseIcon,
  WrenchIcon,
  type LucideIcon } from
'lucide-react';
import type { GeoTool, LayerState } from '../types/map';

export const mapTools: {id: GeoTool;label: string;icon: LucideIcon;group: 'fleet' | 'zones';}[] = [
{ id: 'navire', label: 'Navire', icon: ShipIcon, group: 'fleet' },
{ id: 'camion', label: 'Camion', icon: TruckIcon, group: 'fleet' },
{ id: 'chauffeur', label: 'Chauffeur', icon: UserRoundIcon, group: 'fleet' },
{ id: 'trajet', label: 'Trajet', icon: RouteIcon, group: 'zones' },
{ id: 'port', label: 'Port', icon: AnchorIcon, group: 'zones' },
{ id: 'stock', label: 'Zone de Stock', icon: WarehouseIcon, group: 'zones' },
{ id: 'atelier', label: 'Zone Atelier', icon: WrenchIcon, group: 'zones' },
{ id: 'pause', label: 'Zone Pause', icon: CoffeeIcon, group: 'zones' }];


export const layerOptions: {key: keyof LayerState;label: string;swatch: string;}[] = [
{ key: 'trucks', label: 'Camions', swatch: 'bg-ok-500' },
{ key: 'routes', label: 'Trajets', swatch: 'bg-brand-600' },
{ key: 'ports', label: 'Ports', swatch: 'bg-navy-800' },
{ key: 'stock', label: 'Zones de stock', swatch: 'bg-accent-600' },
{ key: 'workshops', label: 'Ateliers', swatch: 'bg-navy-950' },
{ key: 'pause', label: 'Zones pause', swatch: 'bg-ink-muted' },
{ key: 'missions', label: 'Missions (étiquettes)', swatch: 'bg-brand-300' },
{ key: 'alerts', label: 'Alertes', swatch: 'bg-danger-500' },
{ key: 'trails', label: 'Historique des positions', swatch: 'bg-navy-900' }];


export const defaultLayers: LayerState = {
  trucks: true,
  routes: true,
  ports: true,
  stock: true,
  workshops: true,
  pause: true,
  missions: true,
  alerts: true,
  trails: true
};