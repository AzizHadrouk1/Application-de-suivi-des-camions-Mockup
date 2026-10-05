import L from 'leaflet';
import type { HealthLevel } from '../types/fleet';

export const MAP_COLORS = {
  aller: '#1E50D8',
  retour: '#1FB2EE',
  port: '#13215A',
  stock: '#0B8FC8',
  inactive: '#98A2B3',
  trail: '#0E1A48',
  draft: '#F79009'
};

const svg = (paths: string, size = 15) =>
`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const TRUCK = svg(
  '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'
);
const WRENCH = svg(
  '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
);
const COFFEE = svg(
  '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>'
);

const cache = new Map<string, L.DivIcon>();

export function truckIcon(health: HealthLevel, selected: boolean, pulse: boolean): L.DivIcon {
  const key = `t-${health}-${selected}-${pulse}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const icon = L.divIcon({
    className: 'truck-marker-wrap',
    html: `<div class="tm tm-${health}${selected ? ' tm-selected' : ''}${pulse ? ' tm-pulse' : ''}"><span class="tm-body">${TRUCK}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
  cache.set(key, icon);
  return icon;
}

export function siteIcon(kind: 'workshop' | 'pause', active: boolean): L.DivIcon {
  const key = `s-${kind}-${active}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const icon = L.divIcon({
    className: 'site-marker-wrap',
    html: `<div class="site-marker site-${kind}${active ? '' : ' site-inactive'}">${kind === 'workshop' ? WRENCH : COFFEE}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  cache.set(key, icon);
  return icon;
}

export function vertexIcon(): L.DivIcon {
  const hit = cache.get('vertex');
  if (hit) return hit;
  const icon = L.divIcon({ className: 'vertex-marker-wrap', html: '<div class="vertex"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
  cache.set('vertex', icon);
  return icon;
}