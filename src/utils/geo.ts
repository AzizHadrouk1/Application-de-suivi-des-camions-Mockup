import type { LatLng } from '../types/fleet';

export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

export function jitter(p: LatLng, id: string, scale = 0.00028): LatLng {
  const h = hash(id);
  const a = h % 360 * Math.PI / 180;
  const r = scale * (0.4 + (h >> 3) % 60 / 100);
  return [p[0] + Math.sin(a) * r, p[1] + Math.cos(a) * r * 1.2];
}

export function centroid(coords: LatLng[]): LatLng {
  if (coords.length === 0) return [0, 0];
  const s = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]] as LatLng, [0, 0] as LatLng);
  return [s[0] / coords.length, s[1] / coords.length];
}

export function distKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const la1 = a[0] * Math.PI / 180;
  const la2 = b[0] * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function pathLengthKm(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += distKm(path[i - 1], path[i]);
  return total;
}

export function pointAlong(path: LatLng[], frac: number): LatLng {
  if (path.length === 0) return [0, 0];
  if (path.length === 1) return path[0];
  const f = Math.min(1, Math.max(0, frac));
  const target = pathLengthKm(path) * f;
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const seg = distKm(path[i - 1], path[i]);
    if (acc + seg >= target) {
      const r = seg === 0 ? 0 : (target - acc) / seg;
      return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * r, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * r];
    }
    acc += seg;
  }
  return path[path.length - 1];
}

export function areaHa(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  const lat0 = coords[0][0] * Math.PI / 180;
  const pts = coords.map((c) => [c[1] * 111320 * Math.cos(lat0), c[0] * 110540]);
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    s += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.abs(s / 2) / 10000;
}