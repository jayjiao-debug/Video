import React, {useMemo} from 'react';
import {geoOrthographic, geoPath, geoInterpolate, geoDistance, geoGraticule} from 'd3-geo';
import {feature} from 'topojson-client';
import type {Topology, GeometryCollection} from 'topojson-specification';
import land50 from 'world-atlas/land-50m.json';
/* ep59 globe: borderless (land only, one flat colour, no countries), night ocean, a thin atmosphere, sphere shading,
   and his route in gold: a great-circle-ish path through real waypoints (Punta Arenas → Darién Gap → Alaska / Bering Strait →
   Russia → Mongolia → China → Caspian → Europe → Dover → Hull). Longitudes are unwrapped westward (he walked west the whole way:
   −71° → −360°), so a camera that follows the head turns continuously. Every part takes plain numbers, so any scene can drive it. */
type LL = [number, number];
const topo = land50 as unknown as Topology<{land: GeometryCollection}>;
export const LAND = feature(topo, topo.objects.land);
const GRAT = geoGraticule().step([15, 15])();

/* ---------- the route ---------- */
/** waypoints [lon, lat, key?]; real longitudes (unwrapped below) */
const WP: [number, number, string?][] = [
	[-70.91, -53.16, 'pa'], [-72.5, -51.7], [-72.1, -46.6], [-72.9, -41.5], [-71.0, -36.8], [-70.65, -33.45], [-70.4, -23.6], [-70.3, -18.5], [-77.0, -12.05], [-79.9, -2.2],
	[-78.5, -0.2], [-75.6, 6.25], [-77.4, 7.9, 'darien'], [-79.5, 9.0], [-84.1, 9.9], [-87.2, 14.1], [-90.5, 14.6], [-96.7, 17.1], [-99.1, 19.4], [-106.1, 28.6],
	[-106.6, 35.1], [-111.9, 40.8], [-114.1, 51.0], [-120.8, 56.2], [-135.0, 60.7], [-147.7, 64.8], [-165.4, 64.5], [-168.1, 65.6, 'bering'], [-169.8, 66.15, 'chukotka'],
	[-177.5, 64.7], [166.4, 68.05], [150.9, 65.7], [129.7, 62.0], [113.0, 57.0], [104.3, 52.3], [106.9, 47.9, 'mongolia'], [111.9, 43.7], [105.0, 41.0, 'china'], [94.0, 40.5],
	[87.6, 43.8], [80.4, 44.2], [76.9, 43.25], [69.2, 41.3], [58.4, 37.95], [51.2, 43.65, 'caspian'], [49.87, 40.41, 'baku'], [44.8, 41.7], [39.7, 41.0], [32.9, 39.9],
	[29.0, 41.0, 'istanbul'], [24.7, 42.15], [23.8, 44.3], [21.2, 45.75], [19.05, 47.5], [17.6, 47.7], [16.4, 48.2], [14.3, 48.3], [11.1, 49.45], [8.7, 50.1], [6.96, 50.94],
	[4.35, 50.85], [3.06, 50.63], [1.86, 50.95, 'calais'], [1.31, 51.13, 'dover'], [-0.13, 51.5], [0.12, 52.2], [-0.54, 53.23], [-0.45, 53.71], [-0.33, 53.745, 'hull'],
];
const unwrapTo = (lon: number, prev: number) => { let l = lon; while (l - prev > 180) l -= 360; while (l - prev < -180) l += 360; return l; };
export type Route = {pts: LL[]; cum: number[]; total: number; key: Record<string, number>};
const buildRoute = (): Route => {
	const pts: LL[] = [], key: Record<string, number> = {};
	for (let i = 0; i < WP.length; i++) {
		const a: LL = [WP[i][0], WP[i][1]];
		if (i === 0) { pts.push(a); if (WP[i][2]) key[WP[i][2]!] = 0; continue; }
		const p0: LL = [WP[i - 1][0], WP[i - 1][1]], ip = geoInterpolate(p0, a), n = Math.max(1, Math.ceil(geoDistance(p0, a) * 180 / Math.PI / 0.4));
		for (let j = 1; j <= n; j++) { const q = ip(j / n), prev = pts[pts.length - 1]; pts.push([unwrapTo(q[0], prev[0]), q[1]]); }
		if (WP[i][2]) key[WP[i][2]!] = pts.length - 1;
	}
	const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + geoDistance(pts[i - 1], pts[i]));
	const total = cum[cum.length - 1];
	for (const k of Object.keys(key)) key[k] = cum[key[k]] / total;   // keys → route fraction
	return {pts, cum, total, key};
};
export const ROUTE = buildRoute();
/** the route point at fraction p (unwrapped lon) */
export const routeAt = (p: number): LL => { const R = ROUTE, d = Math.max(0, Math.min(1, p)) * R.total;
	let lo = 0, hi = R.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (R.cum[m] <= d) lo = m; else hi = m; }
	const span = R.cum[hi] - R.cum[lo] || 1, u = (d - R.cum[lo]) / span, a = R.pts[lo], b = R.pts[hi];
	return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
/** the coordinates between fractions p0 < p1 */
export const routeSlice = (p0: number, p1: number): LL[] => { const R = ROUTE, a = Math.max(0, Math.min(p0, p1)), b = Math.min(1, Math.max(p0, p1));
	if (b - a < 1e-5) return []; const out: LL[] = [routeAt(a)];
	for (let i = 0; i < R.pts.length; i++) { const f = R.cum[i] / R.total; if (f > a && f < b) out.push(R.pts[i]); }
	out.push(routeAt(b)); return out; };
/** a smoothed camera centre that trails the head at fraction p (a moving average over the route ahead/behind) */
export const followAt = (p: number, back = 0.05, ahead = 0.02): LL => { let x = 0, y = 0; const n = 12;
	for (let i = 0; i <= n; i++) { const q = routeAt(p - back + (back + ahead) * i / n); x += q[0]; y += q[1]; } return [x / (n + 1), y / (n + 1)]; };
export const HULL: LL = [-0.33, 53.745], PUNTA: LL = [-70.91, -53.16];

/* ---------- drawing ---------- */
export type GlobeView = {cx: number; cy: number; r: number; lon: number; lat: number; roll?: number};
export const projOf = (v: GlobeView) => geoOrthographic().rotate([-v.lon, -v.lat, v.roll ?? 0]).scale(v.r).translate([v.cx, v.cy]).clipAngle(90).precision(v.r > 2500 ? 0.12 : 0.3)
	.clipExtent([[-60, -60], [1980, 1140]]);
/** is a lon/lat on the visible hemisphere (with a margin in radians)? */
export const facing = (v: GlobeView, ll: LL, margin = 0.02) => geoDistance(ll, [v.lon, v.lat]) < Math.PI / 2 - margin;
export const PAL = {ocean0: '#1b3044', ocean1: '#0a1420', land: '#4a4035', landEdge: '#6a5a46', grat: '#cfe0ff', atm: '#6ea6d8', gold: '#FFC24A', goldHi: '#FFE9B0', glow: '#FFA62E', plan: '#F4EAD8'};
export type RouteDraw = {p0: number; p1: number; o?: number; w?: number; head?: number; headO?: number};
export type Pin = {ll: LL; label?: string; o?: number; kind?: 'start' | 'home'; dy?: number};
/** the globe; `route` draws the gold line (p0 → p1, a comet head at `head`); `plan` a dashed cream line; `home` = the light of Hull */
export const Globe: React.FC<{id: string; v: GlobeView; route?: RouteDraw; plan?: {p: number; o?: number; head?: boolean}; pins?: Pin[]; home?: number; o?: number; gratO?: number}> = ({id, v, route, plan, pins = [], home = 0, o = 1, gratO = 0.06}) => {
	const pr = projOf(v), path = geoPath(pr);
	const landD = path(LAND) ?? '', gratD = gratO > 0 ? path(GRAT) ?? '' : '';
	const line = (cs: LL[]) => (cs.length > 1 ? path({type: 'LineString', coordinates: cs}) ?? '' : '');
	const routeD = route ? line(routeSlice(route.p0, route.p1)) : '';
	const planD = plan ? line(routeSlice(0, plan.p)) : '';
	const pt = (ll: LL): [number, number] | null => (facing(v, ll) ? (pr(ll) as [number, number]) : null);
	const w = route?.w ?? Math.max(3.2, Math.min(6, v.r / 90));
	const headLL = route?.head !== undefined ? routeAt(route.head) : null, headP = headLL ? pt(headLL) : null;
	const planHead = plan?.head ? pt(routeAt(plan.p)) : null;
	const homeP = home > 0 ? pt(HULL) : null;
	return <g opacity={o}>
		<defs>
			<radialGradient id={`${id}oc`} cx="0.36" cy="0.32" r="0.78"><stop offset="0" stopColor={PAL.ocean0} /><stop offset="1" stopColor={PAL.ocean1} /></radialGradient>
			<radialGradient id={`${id}at`}><stop offset="0.86" stopColor={PAL.atm} stopOpacity="0" /><stop offset="0.93" stopColor={PAL.atm} stopOpacity="0.32" /><stop offset="1" stopColor={PAL.atm} stopOpacity="0" /></radialGradient>
			<radialGradient id={`${id}sh`} cx="0.34" cy="0.3" r="0.82"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
			<radialGradient id={`${id}hg`}><stop offset="0" stopColor={PAL.goldHi} stopOpacity="1" /><stop offset="0.35" stopColor={PAL.glow} stopOpacity="0.55" /><stop offset="1" stopColor={PAL.glow} stopOpacity="0" /></radialGradient>
			<clipPath id={`${id}cp`}><circle cx={v.cx} cy={v.cy} r={v.r} /></clipPath>
		</defs>
		{v.r < 2400 && <circle cx={v.cx} cy={v.cy} r={v.r * 1.1} fill={`url(#${id}at)`} />}
		<circle cx={v.cx} cy={v.cy} r={v.r} fill={`url(#${id}oc)`} />
		{gratD && <path d={gratD} stroke={PAL.grat} strokeOpacity={gratO} strokeWidth={1} fill="none" />}
		<path d={landD} fill={PAL.land} />
		<g clipPath={`url(#${id}cp)`}><circle cx={v.cx} cy={v.cy} r={v.r} fill={`url(#${id}sh)`} /></g>
		{planD && <g opacity={plan?.o ?? 1}><path d={planD} stroke="#0a0d14" strokeOpacity={0.55} strokeWidth={7} fill="none" strokeLinecap="round" />
			<path d={planD} stroke={PAL.plan} strokeWidth={3.4} fill="none" strokeDasharray="10 9" strokeLinecap="round" /></g>}
		{routeD && <g opacity={route?.o ?? 1}>
			<path d={routeD} stroke={PAL.glow} strokeOpacity={0.16} strokeWidth={w * 4.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={routeD} stroke={PAL.glow} strokeOpacity={0.32} strokeWidth={w * 2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={routeD} stroke={PAL.gold} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={routeD} stroke={PAL.goldHi} strokeOpacity={0.6} strokeWidth={w * 0.35} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
		{headP && (route?.headO ?? 1) > 0.01 && <g opacity={route?.headO ?? 1}><circle cx={headP[0]} cy={headP[1]} r={w * 9} fill={`url(#${id}hg)`} /><circle cx={headP[0]} cy={headP[1]} r={w * 1.1} fill="#fffaf0" /></g>}
		{planHead && <g opacity={plan?.o ?? 1}><circle cx={planHead[0]} cy={planHead[1]} r={26} fill={`url(#${id}hg)`} opacity={0.6} /><circle cx={planHead[0]} cy={planHead[1]} r={5.5} fill={PAL.plan} /></g>}
		{homeP && <g opacity={home}><circle cx={homeP[0]} cy={homeP[1]} r={46} fill={`url(#${id}hg)`} /><circle cx={homeP[0]} cy={homeP[1]} r={6} fill="#fff6e0" /></g>}
		{pins.map((p, i) => { const q = pt(p.ll); if (!q || (p.o ?? 1) < 0.01) return null; const home1 = p.kind === 'home';
			return <g key={i} opacity={p.o ?? 1} transform={`translate(${q[0].toFixed(1)},${q[1].toFixed(1)})`}>
				<circle r={home1 ? 9 : 7} fill={home1 ? PAL.gold : PAL.plan} stroke="#0a0d14" strokeWidth={3} />
				{p.label && <text x={0} y={p.dy ?? (home1 ? -24 : 38)} textAnchor="middle" style={{fontFamily: "'LXGW WenKai','Noto Serif CJK SC',serif", fontWeight: 700, fontSize: 30, letterSpacing: '0.06em'}}
					fill="#FFF4E2" stroke="rgba(8,8,12,0.8)" strokeWidth={6} paintOrder="stroke">{p.label}</text>}</g>; })}
	</g>;
};
/** space behind the globe: a deep gradient and a fixed star field (screen space) */
export const Space: React.FC<{id: string; o?: number; drift?: number}> = ({id, o = 1, drift = 0}) => {
	const stars = useMemo(() => Array.from({length: 170}, (_, i) => { const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
		return {x: r(1) * 2100 - 90, y: r(2) * 1180 - 50, s: 0.6 + 1.6 * r(3) ** 2, o: 0.2 + 0.6 * r(4)}; }), []);
	return <g opacity={o}>
		<defs><linearGradient id={`${id}sp`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#060912" /><stop offset="1" stopColor="#111a2c" /></linearGradient></defs>
		<rect x={-20} y={-20} width={1960} height={1120} fill={`url(#${id}sp)`} />
		<g transform={`translate(${-drift},0)`}>{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#eef2ff" opacity={s.o} />)}</g>
	</g>;
};
