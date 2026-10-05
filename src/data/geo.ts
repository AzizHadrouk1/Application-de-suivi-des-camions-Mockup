import type { FixedSite, LatLng, Port, RouteLine, StockZone } from '../types/fleet';

export const MAP_CENTER: LatLng = [34.7268, 10.7555];
export const TRUCK_PARK: LatLng = [34.7212, 10.7442];
export const IDLE_POINT: LatLng = [34.7318, 10.7528];
export const OFFLINE_POINT: LatLng = [34.7271, 10.7588];

export const stockZones: StockZone[] = [
{
  id: 'STK-01',
  name: 'Stock 01 · Salin Principal',
  coords: [[34.7249, 10.7377], [34.7254, 10.7406], [34.724, 10.7424], [34.7219, 10.7421], [34.7208, 10.7399], [34.7221, 10.7375]],
  active: true,
  capacity: 120000,
  stockLevel: 84200,
  activity: 'loading',
  loadingStatus: 'Chargement actif · 2 chargeuses'
},
{
  id: 'STK-02',
  name: 'Stock 02 · Salin Est',
  coords: [[34.7286, 10.741], [34.7293, 10.7441], [34.7266, 10.7451], [34.7259, 10.7421]],
  active: true,
  capacity: 80000,
  stockLevel: 51600,
  activity: 'loading',
  loadingStatus: 'Chargement actif · 1 chargeuse'
},
{
  id: 'STK-03',
  name: 'Stock 03 · Réserve Nord',
  coords: [[34.7312, 10.7372], [34.7318, 10.7398], [34.7302, 10.7405], [34.7296, 10.738]],
  active: false,
  capacity: 60000,
  stockLevel: 12400,
  activity: 'idle',
  loadingStatus: 'Aucun chargement'
}];


export const ports: Port[] = [
{
  id: 'PRT-01',
  name: 'Port de Sfax · Quai 4',
  coords: [[34.7293, 10.7671], [34.7341, 10.7699], [34.733, 10.7737], [34.7301, 10.7722], [34.7287, 10.7704]],
  active: true,
  location: 'Port commercial de Sfax · déchargement vrac',
  avgUnloading: 5.9,
  berth: 'Quai 4'
},
{
  id: 'PRT-02',
  name: 'Port de Sfax · Quai 2',
  coords: [[34.7352, 10.765], [34.7366, 10.7668], [34.7356, 10.7684], [34.7343, 10.7666]],
  active: false,
  location: 'Port commercial de Sfax · quai céréalier',
  avgUnloading: 6.4,
  berth: 'Quai 2'
}];


export const routes: RouteLine[] = [
{
  id: 'R-01',
  name: 'Trajet aller · Salin → Port',
  coords: [[34.7232, 10.7428], [34.7246, 10.7452], [34.7258, 10.7481], [34.7266, 10.7522], [34.7273, 10.7563], [34.7284, 10.7598], [34.7268, 10.7627], [34.7262, 10.766], [34.7266, 10.769], [34.729, 10.77], [34.7305, 10.7697]],
  active: true,
  origin: 'Stock 01 · Salin Principal',
  destination: 'Port de Sfax · Quai 4',
  distanceKm: 2.6,
  expectedMin: 10,
  direction: 'aller'
},
{
  id: 'R-02',
  name: 'Trajet retour · Port → Salin',
  coords: [[34.7305, 10.7697], [34.7282, 10.7708], [34.7255, 10.7692], [34.7249, 10.7655], [34.7255, 10.7622], [34.7276, 10.7596], [34.7265, 10.756], [34.7257, 10.752], [34.7249, 10.7483], [34.7237, 10.7456], [34.7228, 10.743]],
  active: true,
  origin: 'Port de Sfax · Quai 4',
  destination: 'Stock 01 · Salin Principal',
  distanceKm: 2.7,
  expectedMin: 10,
  direction: 'retour'
},
{
  id: 'R-03',
  name: 'Itinéraire alternatif · Rue Okba Ibn Nafaa',
  coords: [[34.7232, 10.7428], [34.7224, 10.748], [34.7231, 10.756], [34.7244, 10.763], [34.7254, 10.7688], [34.729, 10.77]],
  active: false,
  origin: 'Stock 01 · Salin Principal',
  destination: 'Port de Sfax · Quai 4',
  distanceKm: 2.9,
  expectedMin: 12,
  direction: 'alternatif'
}];


export const workshops: FixedSite[] = [
{
  id: 'WS-01',
  name: 'Atelier mécanique Salin',
  coords: [[34.7203, 10.7417]],
  active: true,
  kind: 'workshop',
  radiusM: 55,
  visitsToday: 5,
  avgMin: 42,
  totalVisits: 186,
  maxMin: 60,
  excessAlerts: 1,
  description: 'Maintenance préventive et dépannage · point fixe'
},
{
  id: 'WS-02',
  name: 'SAROST Atelier · Port',
  coords: [[34.7272, 10.7652]],
  active: true,
  kind: 'workshop',
  radiusM: 40,
  visitsToday: 1,
  avgMin: 35,
  totalVisits: 41,
  maxMin: 60,
  excessAlerts: 0,
  description: 'Atelier externe conventionné · pneumatiques'
}];


export const pauseZones: FixedSite[] = [
{
  id: 'PZ-01',
  name: 'Parking réfectoire Salin',
  coords: [[34.7262, 10.7392]],
  active: true,
  kind: 'pause',
  radiusM: 45,
  visitsToday: 14,
  avgMin: 24,
  totalVisits: 612,
  maxMin: 30,
  excessAlerts: 2,
  description: 'Zone de stationnement chauffeurs · séparée de l’atelier'
},
{
  id: 'PZ-02',
  name: 'Zone d’attente Port',
  coords: [[34.7281, 10.7676]],
  active: true,
  kind: 'pause',
  radiusM: 40,
  visitsToday: 6,
  avgMin: 11,
  totalVisits: 238,
  maxMin: 20,
  excessAlerts: 0,
  description: 'Stationnement tampon avant entrée quai'
}];