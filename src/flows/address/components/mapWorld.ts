import { CURRENT_LOCATION, places, type MapPoint, type Place } from '../data';

/**
 * Geometry of the local, stylised "Dubai Marina" map (no tiles, no network).
 * World is WORLD×WORLD px; the pin reverse-geocodes against `places` and the water/road shapes below.
 */
export const WORLD = 1800;

/** Coastline: points with y < coastY(x) are in the Gulf. */
export const coastY = (x: number) => 820 - 0.62 * x;
/** Sheikh Zayed Road runs along x + y = SZR. */
export const SZR = 2400;
/** King Salman Bin Abdulaziz Al Saud St (Al Sufouh Rd), parallel to the coast. */
export const sufouhY = (x: number) => 1080 - 0.62 * x;

/** Dubai Marina canal centre line (smoothed when drawn). */
export const canal: MapPoint[] = [
  { x: 250, y: 560 },
  { x: 470, y: 690 },
  { x: 640, y: 790 },
  { x: 800, y: 930 },
  { x: 960, y: 980 },
  { x: 1120, y: 1020 },
  { x: 1185, y: 1085 },
];
export const CANAL_HALF = 38;

/** Bluewaters island + JLT lakes. */
export const island = { x: 300, y: 450, r: 78 };
export const lakes = [
  { x: 1215, y: 1475, rx: 95, ry: 52 },
  { x: 1420, y: 1395, rx: 80, ry: 46 },
  { x: 1050, y: 1610, rx: 70, ry: 40 },
];
/** Emirates Golf Club */
export const golf = { x: 1640, y: 1470, rx: 190, ry: 140 };

/** unit vectors of the street grid (along the coast / inland) */
const len = Math.hypot(1, -0.62);
export const U = { x: 1 / len, y: -0.62 / len };
export const N = { x: 0.62 / len, y: 1 / len };
export const GRID_ANGLE = (Math.atan2(U.y, U.x) * 180) / Math.PI;

function distToSegment(p: MapPoint, a: MapPoint, b: MapPoint) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function distToCanal(p: MapPoint) {
  let d = Infinity;
  for (let i = 0; i < canal.length - 1; i++) d = Math.min(d, distToSegment(p, canal[i], canal[i + 1]));
  return d;
}

const inEllipse = (p: MapPoint, e: { x: number; y: number; rx: number; ry: number }, pad = 0) => ((p.x - e.x) / (e.rx + pad)) ** 2 + ((p.y - e.y) / (e.ry + pad)) ** 2 <= 1;

export function isOnIsland(p: MapPoint, pad = 0) {
  return Math.hypot(p.x - island.x, p.y - island.y) <= island.r + pad;
}

/** Sea / canal / lakes → not serviceable. */
export function isWater(p: MapPoint, pad = 0) {
  if (p.y < coastY(p.x) + pad && !isOnIsland(p, -pad)) return true;
  if (distToCanal(p) < CANAL_HALF + pad) return true;
  return lakes.some((l) => inEllipse(p, l, pad));
}

export function isGolf(p: MapPoint, pad = 0) {
  return inEllipse(p, golf, pad);
}

export const distToSzr = (p: MapPoint) => Math.abs(p.x + p.y - SZR) / Math.SQRT2;
export const distToSufouh = (p: MapPoint) => Math.abs(p.y - sufouhY(p.x)) / Math.hypot(1, 0.62);

export interface PinDetails {
  placeName: string;
  area: string;
  propertyName: string;
  streetName: string;
  isServiceable: boolean;
  /** matched POI (for the building polygon highlight) */
  placeId?: string;
}

function area(p: MapPoint) {
  if (isOnIsland(p, 10)) return { area: 'Bluewaters Island, Dubai', street: 'Bluewaters Island' };
  if (p.x + p.y > SZR) {
    if (isGolf(p, 40)) return { area: 'Emirates Hills, Dubai', street: 'Emirates Golf Club' };
    if (p.x > 1450 && p.y < 1150) return { area: 'Barsha Heights, Dubai', street: 'Al Thanya Street' };
    if (p.x > 1400) return { area: 'Emirates Living, Dubai', street: 'Street 1' };
    return { area: 'Jumeirah Lakes Towers, Dubai', street: 'Cluster Road' };
  }
  if (p.y < sufouhY(p.x) && p.x < 820) return { area: 'Jumeirah Beach Residence, Dubai', street: 'The Walk' };
  if (p.x > 1180 && p.y < 900) return { area: 'Al Sufouh, Dubai', street: 'Al Sufouh Road' };
  return { area: 'Dubai Marina, Dubai', street: p.y < 980 - 0.4 * (p.x - 800) ? 'Al Marsa Street' : 'Al Gharbi Street' };
}

/** Fake AddressService.getPinLocationDetailsByLocation. */
export function reverseGeocode(p: MapPoint): PinDetails {
  if (isWater(p)) {
    return { placeName: '', area: '', propertyName: '', streetName: '', isServiceable: false };
  }
  let best: Place | null = null;
  let bestD = Infinity;
  for (const pl of places) {
    const d = Math.hypot(pl.x - p.x, pl.y - p.y);
    if (d < bestD) {
      bestD = d;
      best = pl;
    }
  }
  if (best && bestD < 90) {
    return { placeName: best.placeName, area: best.area, propertyName: best.propertyName, streetName: best.streetName, isServiceable: true, placeId: best.id };
  }
  const a = area(p);
  return { placeName: a.street, area: a.area, propertyName: '', streetName: a.street, isServiceable: true };
}

/** Human distance of the pin from the user's current location (1 world px ≈ 4 m). */
export function distanceFromCurrent(p: MapPoint) {
  return (Math.hypot(p.x - CURRENT_LOCATION.x, p.y - CURRENT_LOCATION.y) * 4) / 1000;
}

/** Mulberry32 — deterministic layout. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Catmull-Rom → cubic Bézier path through points. */
export function smoothPath(pts: MapPoint[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
