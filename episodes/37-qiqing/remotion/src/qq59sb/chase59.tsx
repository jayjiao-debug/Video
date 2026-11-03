import React from 'react';
import {Globe, Space, GlobeView, projOf, routeAt, followAt, Pin, PAL, Earth, SatView, satPt, satR, satProj, headingAt, HULL, PUNTA} from '../qq59/globe59';
import {geoPath} from 'd3-geo';
/* ep59 part 2 · globe moments where the story crosses continents (Russia → Mongolia → China, the Caspian, Europe, the payoff).
   Built only on qq59/globe59's public API (Globe, routeAt, followAt, projOf), read-only.
   chaseView: a chase camera behind the gold head: the globe's centre sits `alpha` (radians) behind the head along the route, the
   view is rolled so the route ahead points up the screen toward the curved horizon, and the head is held at screen (hx, hy).
   alpha → 0 with r growing = the dive in onto the head (and the reverse = the dive out). */
type LL = [number, number];
const DEG = Math.PI / 180;
/** the point `dist` (radians) from `ll` along bearing `brg` (degrees clockwise from north) */
export const dest = (ll: LL, brg: number, dist: number): LL => {
	const f1 = ll[1] * DEG, l1 = ll[0] * DEG, b = brg * DEG;
	const f2 = Math.asin(Math.sin(f1) * Math.cos(dist) + Math.cos(f1) * Math.sin(dist) * Math.cos(b));
	const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(dist) * Math.cos(f1), Math.cos(dist) - Math.sin(f1) * Math.sin(f2));
	return [l2 / DEG, f2 / DEG]; };
/** initial bearing a → b (degrees) */
export const bearing = (a: LL, b: LL) => { const f1 = a[1] * DEG, f2 = b[1] * DEG, dl = (b[0] - a[0]) * DEG;
	return Math.atan2(Math.sin(dl) * Math.cos(f2), Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)) / DEG; };
/** the smoothed direction of travel at route fraction p (degrees) */
export const routeBearing = (p: number, w = 0.02) => bearing(followAt(p - w * 0.6, w, w), followAt(p + w * 0.6, w, w));
/** unwrap an angle toward a reference (degrees) */
const near = (a: number, ref: number) => { let x = a; while (x - ref > 180) x -= 360; while (x - ref < -180) x += 360; return x; };
/** the chase view: head at (hx, hy), globe radius r, centre `alpha` behind the head, the route ahead (bearing `brg`) pointing up-screen,
    tilted by `tilt` degrees (dutch angle) */
export const chaseView = (head: LL, brg: number, alpha: number, r: number, hx: number, hy: number, tilt = 0): GlobeView => {
	const C = alpha > 1e-4 ? dest(head, brg + 180, alpha) : head, b = alpha > 1e-4 ? bearing(C, head) : brg;
	const cx = hx - r * Math.sin(alpha) * Math.sin(tilt * DEG), cy = hy + r * Math.sin(alpha) * Math.cos(tilt * DEG);
	// d3's third rotation angle: pick the sign that puts the head straight above the centre (then add the tilt)
	let best: GlobeView = {cx, cy, r, lon: C[0], lat: C[1], roll: 0}, err = 1e9;
	for (const s of [1, -1]) { const v: GlobeView = {cx, cy, r, lon: C[0], lat: C[1], roll: s * b + tilt};
		const q = projOf(v)(head as [number, number]); if (!q) continue; const e = Math.hypot(q[0] - hx, q[1] - hy); if (e < err) { err = e; best = v; } }
	return best;
};
/** keep a roll continuous over time (call with the previous frame's value) */
export const rollNear = near;

/** a chase shot: the gold line drawn up to the head at p, the head glowing, optional pins; `blaze` brightens the whole line */
export const ChaseGlobe: React.FC<{id: string; v: GlobeView; p: number; p0?: number; pins?: Pin[]; headO?: number; o?: number; space?: number; drift?: number; full?: boolean; comet?: {p: number; len: number}; home?: number; gratO?: number}> =
	({id, v, p, p0 = 0, pins = [], headO = 1, o = 1, space = 1, drift = 0, full = false, comet, home = 0, gratO = 0.05}) => <g opacity={o}>
		{space > 0 && <Space id={`${id}s`} o={space} drift={drift} />}
		<Globe id={id} v={v} route={{p0, p1: full ? 1 : p, head: full ? undefined : p, headO}} comet={comet} pins={pins} home={home} gratO={gratO} />
	</g>;

/** screen position of a lon/lat in a view (null if behind the globe) */
export const screenOf = (v: GlobeView, ll: LL): [number, number] | null => { const q = projOf(v)(ll as [number, number]); return q ? [q[0], q[1]] : null; };
/* ---------- the perspective chase (qq59/globe59 Earth): look down at the gold head from `alt` Earth radii, tilted forward so the
   horizon shows, rolled to the route's heading so the way ahead points up the screen; the head sits at (cx, cy) ---------- */
/** a chase view at route fraction p; `lead` (route fraction) looks a little ahead of the head */
export const chaseSat = (p: number, alt: number, tilt: number, cx = 960, cy = 700, lead = 0, F?: number, roll?: number): SatView => {
	const c = routeAt(Math.min(1, p + lead)); return {lon: c[0], lat: c[1], alt, tilt, roll: roll ?? headingAt(Math.min(0.995, Math.max(0.005, p)), 0.04), cx, cy, F}; };
/** the heading from route fraction a to b (degrees clockwise from north): a fixed roll for a whole chase, so the picture never spins */
export const legHeading = (a: number, b: number) => bearing(routeAt(a), routeAt(b));
/** blend two views (log-altitude, angles unwrapped) */
export const mixSat = (a: SatView, b: SatView, k: number): SatView => { const L = (x: number, y: number) => x + (y - x) * k, rb = near(b.roll ?? 0, a.roll ?? 0), lb = near(b.lon, a.lon);
	return {lon: L(a.lon, lb), lat: L(a.lat, b.lat), alt: Math.exp(L(Math.log(a.alt), Math.log(b.alt))), tilt: L(a.tilt ?? 0, b.tilt ?? 0), roll: L(a.roll ?? 0, rb), cx: L(a.cx ?? 960, b.cx ?? 960), cy: L(a.cy ?? 540, b.cy ?? 540), F: L(a.F ?? 1100, b.F ?? 1100)}; };
/** the Caspian Sea (the borderless land layer fills it in as land): an approximate coastline, drawn in the ocean colour over the land.
    Draw it right after <Earth> with the same view; the gold line is redrawn on top by passing `route` again (the sea would cover it). */
const CASPIAN: LL[] = [[47.5, 45.6], [48.5, 46.3], [49.5, 46.6], [51.3, 47.0], [52.5, 46.8], [53.1, 46.4], [53.2, 45.5], [52.6, 45.3], [51.3, 45.2], [50.4, 44.9], [50.3, 44.4], [51.0, 44.0], [51.2, 43.6],
	[51.6, 43.2], [52.2, 42.6], [52.6, 41.9], [52.9, 41.3], [53.6, 41.5], [54.0, 41.2], [53.8, 40.6], [53.0, 40.0], [53.4, 39.3], [53.9, 38.6], [54.0, 37.4], [53.8, 36.9], [52.8, 36.7], [51.5, 36.8], [50.4, 37.1],
	[49.4, 37.5], [48.9, 38.2], [48.9, 38.9], [49.3, 39.3], [49.4, 40.0], [50.3, 40.4], [49.8, 40.6], [49.5, 40.9], [48.9, 41.5], [48.3, 42.0], [47.7, 42.6], [47.5, 43.0], [47.3, 43.5], [47.5, 44.3], [47.0, 44.6],
	[46.8, 44.8], [47.2, 45.2], [47.5, 45.6]];
export const CaspianSea: React.FC<{v: SatView; route?: {p0: number; p1: number}}> = ({v, route}) => {
	const path = geoPath(satProj(v)), d = path({type: 'Polygon', coordinates: [CASPIAN]}) ?? '';
	const w = Math.max(3.4, Math.min(9, 2.4 + 1100 / v.alt / 420));
	const rd = route ? path({type: 'LineString', coordinates: routeSliceLL(route.p0, route.p1)}) ?? '' : '';
	return <g>{d && <path d={d} fill={PAL.ocean0} stroke="#1a2c40" strokeWidth={1} />}{d && <path d={d} fill="#08111c" opacity={0.35} />}
		{rd && <g><path d={rd} stroke={PAL.glow} strokeOpacity={0.3} strokeWidth={w * 2.4} fill="none" strokeLinecap="round" /><path d={rd} stroke={PAL.gold} strokeWidth={w} fill="none" strokeLinecap="round" />
			<path d={rd} stroke={PAL.goldHi} strokeOpacity={0.6} strokeWidth={w * 0.35} fill="none" strokeLinecap="round" /></g>}</g>;
};
/** the route between two fractions, as lon/lat points */
const routeSliceLL = (p0: number, p1: number): LL[] => { const out: LL[] = []; const n = 60; for (let i = 0; i <= n; i++) out.push(routeAt(p0 + (p1 - p0) * i / n)); return out; };
export {routeAt, followAt, PAL, Earth, satPt, satR, headingAt, HULL, PUNTA, Space};
export type {GlobeView, Pin, LL, SatView};
