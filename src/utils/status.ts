import type { Tone } from '../components/ui/Badge';
import type {
  AlertLevel,
  AlertStatus,
  AlertType,
  DriverStatus,
  GpsStatus,
  HealthLevel,
  MissionStatus,
  ShipStatus,
  Stage,
  TruckStatus } from
'../types/fleet';

type Meta = {label: string;tone: Tone;};

export const healthMeta: Record<HealthLevel, Meta> = {
  normal: { label: 'Normal', tone: 'ok' },
  warning: { label: 'Attention', tone: 'warn' },
  alert: { label: 'Alerte', tone: 'danger' },
  offline: { label: 'Hors ligne', tone: 'neutral' }
};

export const healthOrder: Record<HealthLevel, number> = { alert: 0, warning: 1, offline: 2, normal: 3 };

export const truckStatusMeta: Record<TruckStatus, Meta> = {
  mission: { label: 'En mission', tone: 'brand' },
  available: { label: 'Disponible', tone: 'ok' },
  off_mission: { label: 'Hors mission', tone: 'neutral' }
};

export const gpsMeta: Record<GpsStatus, Meta> = {
  online: { label: 'Connecté', tone: 'ok' },
  weak: { label: 'Signal faible', tone: 'warn' },
  offline: { label: 'Hors ligne', tone: 'danger' }
};

export const stageMeta: Record<Stage, {label: string;location: string;}> = {
  loading: { label: 'Chargement', location: 'Zone de stock' },
  outbound: { label: 'Trajet vers port', location: 'Zone de stock → Port' },
  unloading: { label: 'Déchargement port', location: 'Port de Sfax' },
  return: { label: 'Retour vers stock', location: 'Port → Zone de stock' },
  workshop: { label: 'Passage atelier', location: 'Atelier mécanique' },
  pause: { label: 'En pause', location: 'Zone pause' },
  parked: { label: 'Stationné', location: 'Parc camions Salin' }
};

export const missionStatusMeta: Record<MissionStatus, Meta> = {
  planned: { label: 'Planifiée', tone: 'neutral' },
  preparing: { label: 'En préparation', tone: 'accent' },
  running: { label: 'En cours', tone: 'brand' },
  done: { label: 'Terminée', tone: 'ok' },
  cancelled: { label: 'Annulée', tone: 'danger' }
};

export const alertLevelMeta: Record<AlertLevel, Meta> = {
  critical: { label: 'Critique', tone: 'danger' },
  warning: { label: 'Warning', tone: 'warn' },
  info: { label: 'Information', tone: 'info' }
};

export const alertStatusMeta: Record<AlertStatus, Meta> = {
  open: { label: 'Ouverte', tone: 'danger' },
  acknowledged: { label: 'Prise en compte', tone: 'accent' },
  resolved: { label: 'Résolue', tone: 'ok' }
};

export const alertTypeLabel: Record<AlertType, string> = {
  route_delay: 'Retard trajet',
  stock_excess: 'Temps excessif zone de stock',
  port_excess: 'Temps excessif port',
  workshop_excess: 'Temps excessif atelier',
  pause_excess: 'Pause excessive',
  zone_exit: 'Sortie de zone',
  off_mission: 'Camion hors mission',
  gps_offline: 'GPS offline',
  long_stop: 'Arrêt prolongé'
};

export const shipStatusMeta: Record<ShipStatus, Meta> = {
  expected: { label: 'Attendu', tone: 'neutral' },
  berthed: { label: 'À quai', tone: 'accent' },
  loading: { label: 'En chargement', tone: 'brand' },
  departed: { label: 'Parti', tone: 'ok' }
};

export const driverStatusMeta: Record<DriverStatus, Meta> = {
  on_duty: { label: 'En service', tone: 'ok' },
  break: { label: 'En pause', tone: 'warn' },
  off_duty: { label: 'Hors service', tone: 'neutral' }
};

export function delayTone(deltaMin: number): Tone {
  if (deltaMin > 0.05) return 'danger';
  return 'ok';
}