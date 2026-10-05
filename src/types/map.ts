export type BaseMap = 'plan' | 'satellite';

export interface LayerState {
  trucks: boolean;
  routes: boolean;
  ports: boolean;
  stock: boolean;
  workshops: boolean;
  pause: boolean;
  missions: boolean;
  alerts: boolean;
  trails: boolean;
}

export type TruckDetailTab = 'overview' | 'timeline' | 'performance';

export type GeoTool = 'navire' | 'camion' | 'chauffeur' | 'trajet' | 'port' | 'stock' | 'atelier' | 'pause';