import React from 'react';
import {lerp, rnd} from '../qq50/kit50';
import {Look4} from '../qq44/figure44';
import {FLAME, CLOUD, METAL, WOOD} from './palette52';
/* ep52 《从一支箭，到火箭云》 shared props. Builder A owns this file; Builder B imports it (never edits; copy locally to change).
   Put <Defs52 /> ONCE inside every <svg> that draws any of these (gradients + blur filters, all ids end in 52).
   STABLE EXPORTS (add, don't change):
   - Defs52
   - Flame {x, y, L, w, rot, k, seed}            a rocket flame / exhaust jet from a nozzle at (x, y); rot = direction it points (deg, 90 = down)
   - RocketBody {x, y, h, w, boosters, nose, fins, flame, rot, tone, id}   a generic rocket (no logos, no flags); (x, y) = centre of the core's base
     rocketNozzles(...) → the nozzle exits in screen space (same args), for hanging your own flames
   - RocketCloud {ax, ay, x0, y0, bw, bh, k, sun, id, t}   the 火箭云: twisting trail from (x0, y0) on the horizon up to the rocket at (ax, ay),
     where the plume opens into the glowing jellyfish bell (half-width bw, height bh below the apex). sun = -1 / 1: side the sunlight comes from.
   - Billow {x, y, w, h, lit, col, seed}         a launch-smoke billow, lit warm from below (lit 0..1)
   - FireArrow {x, y, L, rot, lit, burn, id}      the 宋 fire arrow: (x, y) = the nock (tail end), rot = tail→head direction (deg, -90 = up);
     a small paper-wrapped powder tube just behind the head, its fuse at the tube's rear. arrowAt(x, y, L, rot, u) = point at u (0 tail … 1 tip)
   - Bow {x, y, L, aim, draw}                     a Chinese recurve bow: (x, y) = the grip, aim = shooting direction (deg, 0 = +x, −30 = up-right),
     draw 0..1. bowNock(...) = where the string's nock point is (put the arrow's tail and the drawing hand there)
   - Capsule {x, y, s, rot, heat, chute}          a small return capsule (generic), heat 0..1 = re-entry glow on the shield
   - Glint52 {x, y, r, o}, Spark {x, y, r, o}     a 4-point glint / a hot spark with glow
   - LOOKS52: walker costumes per era (song, ming, worker, today) for Walker51 */
type P2 = [number, number];
const D2R = Math.PI / 180;
const rotP = (p: P2, a: number, o: P2 = [0, 0]): P2 => { const c = Math.cos(a * D2R), s = Math.sin(a * D2R); return [o[0] + p[0] * c - p[1] * s, o[1] + p[0] * s + p[1] * c]; };
const f1 = (v: number) => v.toFixed(1);

/* ---------- defs ---------- */
export const Defs52: React.FC = () => <defs>
	{/* flame layers along the local +x axis (nozzle at 0) */}
	<linearGradient id="flO52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={FLAME.gold} /><stop offset="0.35" stopColor={FLAME.amber} /><stop offset="0.75" stopColor={FLAME.orange} stopOpacity="0.7" /><stop offset="1" stopColor={FLAME.red} stopOpacity="0" /></linearGradient>
	<linearGradient id="flM52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={FLAME.white} /><stop offset="0.45" stopColor={FLAME.hot} /><stop offset="1" stopColor={FLAME.gold} stopOpacity="0" /></linearGradient>
	<linearGradient id="flC52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor={FLAME.white} /><stop offset="1" stopColor={FLAME.hot} stopOpacity="0" /></linearGradient>
	<radialGradient id="flG52"><stop offset="0" stopColor={FLAME.hot} stopOpacity="0.9" /><stop offset="0.35" stopColor={FLAME.amber} stopOpacity="0.45" /><stop offset="1" stopColor={FLAME.orange} stopOpacity="0" /></radialGradient>
	<radialGradient id="spk52"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.25" stopColor={FLAME.hot} stopOpacity="0.95" /><stop offset="0.6" stopColor={FLAME.amber} stopOpacity="0.35" /><stop offset="1" stopColor={FLAME.orange} stopOpacity="0" /></radialGradient>
	{/* rocket skin across the body (local x: left → right), lit from the left */}
	<linearGradient id="met52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={METAL.mid} /><stop offset="0.18" stopColor={METAL.hi} /><stop offset="0.4" stopColor={METAL.body} /><stop offset="0.78" stopColor={METAL.mid} /><stop offset="1" stopColor={METAL.shade} /></linearGradient>
	<linearGradient id="metG52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8E9298" /><stop offset="0.2" stopColor="#C8CCD0" /><stop offset="0.45" stopColor="#A8ACB2" /><stop offset="1" stopColor="#5A5E66" /></linearGradient>
	<linearGradient id="noz52" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A2C30" /><stop offset="0.3" stopColor="#7A7E86" /><stop offset="1" stopColor="#1E2024" /></linearGradient>
	{/* paper powder tube */}
	<linearGradient id="pap52" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6EAC8" /><stop offset="0.5" stopColor={WOOD.paper} /><stop offset="1" stopColor={WOOD.paperD} /></linearGradient>
	{/* blur filters (generous regions so wide glows are not clipped) */}
	{/* the 火箭云 texture: turbulence-displaced, softened (wisp52 for filaments, wispB52 for the bell body, wispS52 for the trail) */}
	<filter id="wisp52" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.009" numOctaves={2} seed={7} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={34} xChannelSelector="R" yChannelSelector="G" result="d" /><feGaussianBlur in="d" stdDeviation={4} /></filter>
	<filter id="wispB52" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.016" numOctaves={3} seed={3} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={60} xChannelSelector="R" yChannelSelector="G" result="d" /><feGaussianBlur in="d" stdDeviation={7} /></filter>
	<filter id="wispS52" x="-60%" y="-10%" width="220%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.01" numOctaves={2} seed={5} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={18} xChannelSelector="R" yChannelSelector="G" result="d" /><feGaussianBlur in="d" stdDeviation={2} /></filter>
	{[2, 4, 8, 14, 24, 40, 70].map((s) => <filter key={s} id={`b${s}_52`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={s} /></filter>)}
</defs>;
/** the nearest blur filter id for a softness in px */
export const blur52 = (px: number) => { const ss = [2, 4, 8, 14, 24, 40, 70]; let b = ss[0]; for (const s of ss) if (Math.abs(s - px) < Math.abs(b - px)) b = s; return `url(#b${b}_52)`; };

/* ---------- glints and sparks ---------- */
export const Glint52: React.FC<{x: number; y: number; r: number; o?: number; rot?: number}> = ({x, y, r, o = 1, rot = 0}) => o <= 0 ? null : <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
	<circle r={r * 0.9} fill="url(#spk52)" />
	<path d={`M0,${-r} L${r * 0.08},${-r * 0.08} L${r},0 L${r * 0.08},${r * 0.08} L0,${r} L${-r * 0.08},${r * 0.08} L${-r},0 L${-r * 0.08},${-r * 0.08} Z`} fill="#FFFFFF" /></g>;
export const Spark: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => o <= 0 ? null : <g opacity={o}>
	<circle cx={x} cy={y} r={r * 3.2} fill="url(#spk52)" opacity={0.75} />
	<circle cx={x} cy={y} r={r} fill="#FFFFFF" /></g>;

/* ---------- flame ---------- */
const tear = (L: number, w: number, j = 0) => `M0,${f1(-w / 2)} C${f1(L * 0.18)},${f1(-w * 0.78)} ${f1(L * 0.5)},${f1(-w * 0.42 + j)} ${f1(L)},${f1(j)} C${f1(L * 0.5)},${f1(w * 0.42 + j)} ${f1(L * 0.18)},${f1(w * 0.78)} 0,${f1(w / 2)} Z`;
/** a rocket flame / exhaust from a nozzle at (x, y), pointing along rot (deg; 90 = straight down). L = length, w = width at the nozzle,
    k = intensity 0..1.4 (scales the halo), seed = flicker */
export const Flame: React.FC<{x: number; y: number; L: number; w: number; rot?: number; k?: number; seed?: number; halo?: boolean}> = ({x, y, L, w, rot = 90, k = 1, seed = 1, halo = true}) => {
	if (k <= 0) return null;
	const j = (i: number) => (rnd(seed, i) - 0.5) * w * 0.25;
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${rot})`}>
		{halo && <ellipse cx={L * 0.32} cy={0} rx={L * 0.85 + w} ry={w * 2.2 + L * 0.12} fill="url(#flG52)" opacity={0.55 * Math.min(1, k)} filter={blur52(Math.max(8, w * 0.8))} />}
		<path d={tear(L, w * 1.05, j(1))} fill="url(#flO52)" filter={blur52(Math.max(2, w * 0.12))} />
		<path d={tear(L * 0.68, w * 0.8, j(2))} fill="url(#flM52)" filter={blur52(Math.max(2, w * 0.06))} />
		<path d={tear(L * 0.36, w * 0.58, j(3) * 0.4)} fill="url(#flC52)" />
		<ellipse cx={w * 0.08} cy={0} rx={w * 0.22} ry={w * 0.46} fill="#FFFFFF" />
	</g>; };

/* ---------- smoke billow (launch pad / ground cloud), lit warm from below ---------- */
export const Billow: React.FC<{x: number; y: number; w: number; h: number; lit?: number; col?: string; seed?: number; o?: number}> = ({x, y, w, h, lit = 1, col = '#8A8690', seed = 1, o = 1}) => {
	const n = 9;
	return <g opacity={o}>
		{Array.from({length: n}, (_, i) => { const u = (i + 0.5) / n, cx = x - w / 2 + w * u + (rnd(i, seed) - 0.5) * w * 0.08, r = h * (0.35 + 0.35 * Math.sin(Math.PI * u)) * (0.8 + 0.4 * rnd(i, seed + 1)), cy = y - r * 0.7;
			return <g key={i}><circle cx={cx} cy={cy} r={r} fill={col} filter={blur52(Math.max(2, r * 0.08))} />
				<circle cx={cx} cy={cy + r * 0.35} r={r * 0.78} fill={FLAME.amber} opacity={0.55 * lit} filter={blur52(Math.max(4, r * 0.25))} /></g>; })}
		<ellipse cx={x} cy={y - h * 0.1} rx={w * 0.42} ry={h * 0.25} fill={FLAME.hot} opacity={0.5 * lit} filter={blur52(Math.max(8, h * 0.2))} />
	</g>; };

/* ---------- generic rocket ---------- */
type RocketArgs = {x: number; y: number; h: number; w: number; boosters?: 0 | 2 | 4; rot?: number};
/** nozzle exits (screen space) and their widths: core first, then boosters */
export const rocketNozzles = ({x, y, h, w, boosters = 0, rot = 0}: RocketArgs): {p: P2; w: number}[] => {
	const bw = w * 0.42, out: {p: P2; w: number}[] = [{p: rotP([0, w * 0.32], rot, [x, y]), w: w * 0.5}];
	if (boosters >= 2) for (const s of [-1, 1]) out.push({p: rotP([s * (w / 2 + bw * 0.35), w * 0.26], rot, [x, y]), w: bw * 0.6});
	if (boosters === 4) out.push({p: rotP([0, w * 0.3], rot, [x, y]), w: bw * 0.6});
	return out; };
/** a generic rocket, upright (rot = tilt in deg). (x, y) = centre of the core's base; h = core height incl. the nose; w = core diameter.
    nose: 'fairing' (a wider payload fairing, modern), 'cone' (pointed, sounding rocket), 'ogive'. fins: 4 tail fins (sounding rocket).
    flame 0..1.4: flames from every nozzle (drawn behind the body). Generic markings only: dark interstage bands. */
export const RocketBody: React.FC<RocketArgs & {nose?: 'fairing' | 'cone' | 'ogive'; fins?: boolean; flame?: number; tone?: 'white' | 'grey'; id?: string; flameL?: number; seed?: number}> =
	({x, y, h, w, boosters = 0, rot = 0, nose = 'fairing', fins = false, flame = 0, tone = 'white', id = 'rk', flameL = 3.2, seed = 1}) => {
		const skin = tone === 'white' ? 'url(#met52)' : 'url(#metG52)', sw = Math.max(1, w * 0.025), lineC = METAL.dark;
		const noseH = nose === 'fairing' ? h * 0.2 : h * 0.16, fw = nose === 'fairing' ? w * 1.18 : w, top = -h, bodyTop = top + noseH;
		const bw = w * 0.42, bh = h * 0.34;
		const cyl = (cx: number, ww: number, y0: number, y1: number) => `M${f1(cx - ww / 2)},${f1(y1)} L${f1(cx - ww / 2)},${f1(y0)} L${f1(cx + ww / 2)},${f1(y0)} L${f1(cx + ww / 2)},${f1(y1)} Z`;
		const ogive = (cx: number, ww: number, yb: number, ht: number) => `M${f1(cx - ww / 2)},${f1(yb)} C${f1(cx - ww / 2)},${f1(yb - ht * 0.55)} ${f1(cx - ww * 0.18)},${f1(yb - ht * 0.95)} ${f1(cx)},${f1(yb - ht)} C${f1(cx + ww * 0.18)},${f1(yb - ht * 0.95)} ${f1(cx + ww / 2)},${f1(yb - ht * 0.55)} ${f1(cx + ww / 2)},${f1(yb)} Z`;
		const nozzle = (cx: number, nw: number, yb: number) => `M${f1(cx - nw * 0.3)},${f1(yb)} L${f1(cx + nw * 0.3)},${f1(yb)} L${f1(cx + nw / 2)},${f1(yb + nw * 0.62)} L${f1(cx - nw / 2)},${f1(yb + nw * 0.62)} Z`;
		const booster = (cx: number, k: number) => <g key={cx}>
			<path d={nozzle(cx, bw * 0.62, -bw * 0.12)} fill="url(#noz52)" />
			<path d={cyl(cx, bw, -bh + bw * 0.9, -bw * 0.12)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.5} />
			<path d={ogive(cx, bw, -bh + bw * 0.9, bw * 1.3)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.5} />
			<rect x={cx - bw / 2} y={-bw * 0.62} width={bw} height={bw * 0.18} fill={METAL.band} opacity={0.85} />
			{k < 1 && <path d={`${cyl(cx, bw, -bh + bw * 0.9, -bw * 0.12)} ${ogive(cx, bw, -bh + bw * 0.9, bw * 1.3)}`} fill="#1A1C22" opacity={1 - k} />}
		</g>;
		const fls = flame > 0 ? rocketNozzles({x: 0, y: 0, h, w, boosters, rot: 0}) : [];
		return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${rot})`}>
			{/* flames behind everything */}
			{fls.map((n, i) => <Flame key={i} x={n.p[0]} y={n.p[1] + n.w * 0.2} L={n.w * flameL * 2 * (i === 0 ? 1.15 : 1) * Math.min(1.3, flame)} w={n.w * 1.25} rot={90} k={flame} seed={seed + i} />)}
			{/* boosters behind (left / right) */}
			{boosters >= 2 && [-1, 1].map((s) => booster(s * (w / 2 + bw * 0.35), 0.82))}
			{/* the core */}
			<path d={nozzle(0, w * 0.55, -w * 0.06)} fill="url(#noz52)" />
			<path d={cyl(0, w, bodyTop, 0)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.55} />
			{nose === 'fairing' ? <>
				<path d={`M${f1(-w / 2)},${f1(bodyTop)} L${f1(-fw / 2)},${f1(bodyTop - noseH * 0.12)} L${f1(fw / 2)},${f1(bodyTop - noseH * 0.12)} L${f1(w / 2)},${f1(bodyTop)} Z`} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.55} />
				<path d={cyl(0, fw, bodyTop - noseH * 0.55, bodyTop - noseH * 0.12)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.55} />
				<path d={ogive(0, fw, bodyTop - noseH * 0.55, noseH * 0.45)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.55} />
			</> : <path d={ogive(0, w, bodyTop, nose === 'cone' ? noseH * 1.1 : noseH)} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.55} />}
			{/* generic markings: dark interstage bands, a thin gold hairline */}
			{[0.36, 0.64].map((u) => <rect key={u} x={-w / 2} y={lerp(0, bodyTop, u)} width={w} height={Math.max(2, h * 0.018)} fill={METAL.band} opacity={0.85} />)}
			<rect x={-w / 2} y={lerp(0, bodyTop, 0.12)} width={w} height={Math.max(1, h * 0.006)} fill={METAL.gold} opacity={0.6} />
			{/* the long highlight down the lit side */}
			<path d={`M${f1(-w * 0.26)},${f1(bodyTop + h * 0.02)} L${f1(-w * 0.26)},${f1(-h * 0.03)}`} stroke="#FFFFFF" strokeWidth={Math.max(1, w * 0.07)} strokeOpacity={0.5} strokeLinecap="round" />
			{/* tail fins (sounding rocket): two in profile, one edge-on */}
			{fins && <>
				{[-1, 1].map((s) => <path key={s} d={`M${f1(s * w / 2)},${f1(-h * 0.2)} L${f1(s * w * 1.25)},${f1(-h * 0.02)} L${f1(s * w * 1.25)},${f1(w * 0.12)} L${f1(s * w / 2)},${f1(-h * 0.01)} Z`} fill={skin} stroke={lineC} strokeWidth={sw} strokeOpacity={0.6} />)}
				<rect x={-w * 0.06} y={-h * 0.2} width={w * 0.12} height={h * 0.2 + w * 0.12} fill={METAL.mid} stroke={lineC} strokeWidth={sw * 0.6} strokeOpacity={0.6} />
			</>}
			{/* the front booster (4 boosters: left, right, front; the back one is hidden) */}
			{boosters === 4 && booster(0, 1)}
		</g>; };

/* ---------- the 火箭云 ---------- */
/** the twisting trail from (x0, y0) to the apex: centre-line points at s = 0..1 (bottom → top); the wobble dies at both ends */
const trailPts = (x0: number, y0: number, ax: number, ay: number, amp: number, n = 40, ph = 0): P2[] => Array.from({length: n + 1}, (_, i) => {
	const s = i / n, env = Math.pow(Math.sin(Math.PI * s), 0.7), wob = env * (amp * Math.sin(2 * Math.PI * 1.35 * s + ph) + amp * 0.35 * Math.sin(2 * Math.PI * 3.1 * s + ph * 2));
	return [lerp(x0, ax, Math.pow(s, 1.25)) + wob, lerp(y0, ay, s)]; });
/** a filled ribbon round a centre line with a half-width per point */
const ribbonD = (pts: P2[], hw: (s: number) => number, off: (s: number) => number = () => 0) => {
	const L: P2[] = [], R: P2[] = [], n = pts.length - 1;
	for (let i = 0; i <= n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, s = i / n, o = off(s), h = hw(s);
		L.push([pts[i][0] + nx * (o + h), pts[i][1] + ny * (o + h)]); R.push([pts[i][0] + nx * (o - h), pts[i][1] + ny * (o - h)]); }
	return 'M' + [...L, ...R.reverse()].map((p) => `${f1(p[0])},${f1(p[1])}`).join('L') + 'Z'; };
/** the bell's outline: a teardrop opening down from the apex, a little wind-skewed, its lower margin scalloped */
const bellPts = (ax: number, ay: number, bw: number, bh: number, sun: number): {d: string; rim: P2[]} => {
	const yb = ay + bh, rim: P2[] = [], N = 9;
	for (let i = 0; i <= N * 4; i++) { const u = i / (N * 4), th = Math.PI * (1 - u), sc = Math.abs(Math.sin(Math.PI * N * u));
		rim.push([ax + bw * Math.cos(th) * (u < 0.5 ? (sun < 0 ? 1.04 : 0.94) : (sun < 0 ? 0.94 : 1.04)), yb - bh * 0.08 + bh * 0.16 * Math.sin(th) + bh * 0.035 * sc - bh * 0.05 * (u - 0.5) * sun]); }
	const l = rim[0], r = rim[rim.length - 1];
	const d = `M${f1(ax)},${f1(ay)} C${f1(ax - bw * 0.1)},${f1(ay + bh * 0.1)} ${f1(l[0] - bw * 0.06)},${f1(ay + bh * 0.4)} ${f1(l[0])},${f1(l[1])} ` + rim.slice(1).map((p) => `L${f1(p[0])},${f1(p[1])}`).join(' ') + ` C${f1(r[0] + bw * 0.04)},${f1(ay + bh * 0.42)} ${f1(ax + bw * 0.1)},${f1(ay + bh * 0.1)} ${f1(ax)},${f1(ay)} Z`;
	return {d, rim}; };
/** the 火箭云: (ax, ay) = the rocket at the top of the plume; (x0, y0) = where the trail leaves the horizon; bw / bh = the bell's
    half-width / height below the apex; k = brightness (1 = frame 0, 1.25 = brighter); sun = the side the sunlight comes from (-1 left);
    t = time (slow drift of the wisps) */
export const RocketCloud: React.FC<{ax: number; ay: number; x0: number; y0: number; bw: number; bh: number; k?: number; sun?: -1 | 1; id?: string; t?: number; amp?: number; rocket?: boolean}> =
	({ax, ay, x0, y0, bw, bh, k = 1, sun = -1, id = 'rc', t = 0, amp, rocket = true}) => {
		const A = amp ?? bw * 0.2, yb = ay + bh;
		const pts = trailPts(x0, y0, ax, ay, A, 56, 0.6);
		const {d: bell, rim} = bellPts(ax, ay, bw, bh, sun);
		const lit = sun, gid = `${id}g`, kk = Math.min(1.4, k), k1 = Math.min(1, kk);
		/* wisps: curved, uneven filaments fanning from the apex, some ending short of the rim */
		const stri = Array.from({length: 13}, (_, i) => { const u = -0.95 + 1.9 * (i + 0.5 * rnd(i, 17)) / 12.5, len = 0.62 + 0.38 * rnd(i, 18), ex = ax + u * bw * 0.95 * len, ey = ay + (bh * 1.02) * len - bh * 0.06 * u * u,
			cx = ax + u * bw * (0.35 + 0.25 * rnd(i, 19)) + Math.sin(t * 0.3 + i) * bw * 0.02, cy = ay + bh * (0.38 + 0.1 * rnd(i, 20));
			return {d: `M${f1(ax + u * 6)},${f1(ay + bh * 0.04)} Q${f1(cx)},${f1(cy)} ${f1(ex)},${f1(ey)}`, w: bw * (0.008 + 0.022 * rnd(i, 21)), o: 0.22 + 0.3 * rnd(i, 22), cyan: rnd(i, 23) > 0.7}; });
		const tent = Array.from({length: 6}, (_, i) => { const p = rim[4 + Math.floor(rnd(i, 7) * (rim.length - 8))], L = bh * (0.18 + 0.32 * rnd(i, 8)), sw = (rnd(i, 3) - 0.5) * bw * 0.12;
			return `M${f1(p[0])},${f1(p[1] - 4)} q${f1(sw)},${f1(L * 0.5)} ${f1(sw * 0.4)},${f1(L)}`; });
		const rimD = 'M' + rim.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L');
		return <g>
			<defs>
				<radialGradient id={gid} gradientUnits="userSpaceOnUse" cx={ax + lit * bw * 0.32} cy={ay + bh * 0.34} r={Math.max(bw, bh) * 1.05}>
					<stop offset="0" stopColor={CLOUD.core} /><stop offset="0.22" stopColor={CLOUD.bright} /><stop offset="0.48" stopColor={CLOUD.gold} /><stop offset="0.72" stopColor={CLOUD.peach} stopOpacity="0.8" /><stop offset="1" stopColor={CLOUD.cyan} stopOpacity="0.65" /></radialGradient>
				<linearGradient id={`${id}t`} gradientUnits="userSpaceOnUse" x1={0} y1={y0} x2={0} y2={ay}>
					<stop offset="0" stopColor={CLOUD.peach} stopOpacity="0.55" /><stop offset="0.3" stopColor={CLOUD.gold} stopOpacity="0.95" /><stop offset="0.7" stopColor={CLOUD.bright} /><stop offset="1" stopColor={CLOUD.core} /></linearGradient>
				<linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1={ax - lit * bw} y1={0} x2={ax + lit * bw} y2={0}>
					<stop offset="0" stopColor={CLOUD.core} stopOpacity="0.9" /><stop offset="0.4" stopColor={CLOUD.bright} stopOpacity="0.25" /><stop offset="0.72" stopColor={CLOUD.cyan} stopOpacity="0.15" /><stop offset="1" stopColor={CLOUD.cyan} stopOpacity="0.8" /></linearGradient>
				<radialGradient id={`${id}k`}><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="0.5" stopColor={CLOUD.bright} stopOpacity="0.45" /><stop offset="1" stopColor={CLOUD.gold} stopOpacity="0" /></radialGradient>
				<clipPath id={`${id}c`}><path d={bell} /></clipPath>
			</defs>
			{/* the sky glow around the whole plume */}
			<ellipse cx={ax} cy={ay + bh * 0.55} rx={bw * 1.7} ry={bh * 1.15} fill={CLOUD.violet} opacity={0.3 * kk} filter={blur52(70)} />
			<ellipse cx={ax + lit * bw * 0.2} cy={ay + bh * 0.42} rx={bw * 1.15} ry={bh * 0.8} fill={CLOUD.gold} opacity={0.2 * kk} filter={blur52(70)} />
			{/* the twisting trail: a soft veil, two braided ribbons, a bright thread */}
			<path d={ribbonD(pts, (s) => bw * (0.03 + 0.1 * s))} fill={`url(#${id}t)`} opacity={0.42 * kk} filter={blur52(14)} />
			<g filter="url(#wispS52)">
				<path d={ribbonD(pts, (s) => bw * (0.012 + 0.03 * s), (s) => bw * 0.045 * Math.sin(2 * Math.PI * 2.6 * s))} fill={`url(#${id}t)`} opacity={0.95 * k1} />
				<path d={ribbonD(pts, (s) => bw * (0.009 + 0.024 * s), (s) => -bw * 0.045 * Math.sin(2 * Math.PI * 2.6 * s))} fill={`url(#${id}t)`} opacity={0.8 * k1} />
			</g>
			<path d={'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L')} fill="none" stroke={CLOUD.core} strokeWidth={Math.max(1.5, bw * 0.006)} strokeOpacity={0.6 * k1} />
			{/* the bell: soft outer veil, body, lit and shade sides, wisps, the hollow underside, the glowing lower margin */}
			<path d={bell} fill={`url(#${gid})`} opacity={0.36 * kk} filter={blur52(40)} transform={`translate(${ax},${ay}) scale(1.12) translate(${-ax},${-ay})`} />
			<path d={bell} fill={`url(#${gid})`} opacity={0.82 * k1} filter="url(#wispB52)" />
			<g clipPath={`url(#${id}c)`}>
				<ellipse cx={ax} cy={yb + bh * 0.02} rx={bw * 0.8} ry={bh * 0.12} fill={CLOUD.violet} opacity={0.3} filter={blur52(24)} />
				<path d={bell} fill={`url(#${id}s)`} opacity={0.7} filter={blur52(24)} />
				<ellipse cx={ax + lit * bw * 0.08} cy={ay + bh * 0.3} rx={bw * 0.22} ry={bh * 0.34} fill={`url(#${id}k)`} opacity={k1} />
			</g>
			<g filter="url(#wisp52)">
				{stri.map((s, i) => <path key={i} d={s.d} fill="none" stroke={s.cyan ? CLOUD.cyan : '#FFFFFF'} strokeWidth={s.w} strokeOpacity={s.o * k1} strokeLinecap="round" />)}
				<path d={rimD} fill="none" stroke={CLOUD.cyan} strokeWidth={bw * 0.04} strokeOpacity={0.4 * k1} strokeLinecap="round" />
				<path d={rimD} fill="none" stroke="#FFFFFF" strokeWidth={bw * 0.01} strokeOpacity={0.35 * k1} strokeLinecap="round" />
				{tent.map((d, i) => <path key={i} d={d} fill="none" stroke={CLOUD.bright} strokeWidth={bw * 0.014} strokeOpacity={0.28 * k1} strokeLinecap="round" />)}
			</g>
			{/* the rocket: a white point with a hot glow, still climbing */}
			{rocket && <>
				<circle cx={ax} cy={ay - 4} r={Math.max(20, bw * 0.09)} fill="url(#spk52)" opacity={0.95} />
				<circle cx={ax} cy={ay - 4} r={Math.max(4, bw * 0.012)} fill="#FFFFFF" />
				<path d={`M${f1(ax)},${f1(ay - 4 - bw * 0.06)} L${f1(ax)},${f1(ay - 4 + bw * 0.06)} M${f1(ax - bw * 0.06)},${f1(ay - 4)} L${f1(ax + bw * 0.06)},${f1(ay - 4)}`} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.8} />
			</>}
		</g>; };

/* ---------- 宋 fire arrow ---------- */
/** a point along a FireArrow drawn with the same (x, y, L, rot): u = 0 tail (nock) … 1 tip */
export const arrowAt = (x: number, y: number, L: number, rot: number, u: number): P2 => rotP([L * u, 0], rot, [x, y]);
/** where the fuse end is (the spark when lit) */
export const ARROW_FUSE_U = 0.6;
/** the 宋 fire arrow: shaft, two fletching vanes, an iron head, and just behind the head a small paper-wrapped powder tube bound with
    cord; its fuse leaves the tube's rear end. lit 0..1: the fuse spark; burn 0..1: the tube burning in flight (a small flame at the head,
    trailing back) */
export const FireArrow: React.FC<{x: number; y: number; L: number; rot: number; lit?: number; burn?: number; id?: string; o?: number}> = ({x, y, L, rot, lit = 0, burn = 0, o = 1}) => {
	const sw = Math.max(2.2, L * 0.012), tr = Math.max(4.5, L * 0.03), t0 = L * 0.64, t1 = L * 0.83, hd = L * 0.85;
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${rot})`} opacity={o}>
		{burn > 0 && <Flame x={t0} y={0} L={L * 0.5 * burn} w={tr * 2.6} rot={180} k={burn} seed={3} />}
		{/* fletching (two vanes seen from the side) and the nock */}
		<path d={`M${f1(L * 0.01)},0 L${f1(L * 0.03)},${f1(-tr * 1.5)} Q${f1(L * 0.1)},${f1(-tr * 1.55)} ${f1(L * 0.16)},${f1(-sw * 0.5)} Z`} fill={WOOD.feather} opacity={0.95} />
		<path d={`M${f1(L * 0.01)},0 L${f1(L * 0.03)},${f1(tr * 1.5)} Q${f1(L * 0.1)},${f1(tr * 1.55)} ${f1(L * 0.16)},${f1(sw * 0.5)} Z`} fill="#CFC4B0" opacity={0.95} />
		<path d={`M${f1(L * 0.04)},${f1(-tr * 1.2)} L${f1(L * 0.13)},${f1(-sw)} M${f1(L * 0.04)},${f1(tr * 1.2)} L${f1(L * 0.13)},${f1(sw)}`} stroke={WOOD.shaftD} strokeWidth={1.2} opacity={0.6} />
		{/* shaft */}
		<rect x={0} y={-sw / 2} width={hd} height={sw} fill={WOOD.shaft} />
		<rect x={0} y={-sw / 2} width={hd} height={sw * 0.35} fill="#F0D8A8" opacity={0.7} />
		<rect x={-L * 0.012} y={-sw * 0.7} width={L * 0.02} height={sw * 1.4} fill={WOOD.shaftD} />
		{/* the powder tube: paper wrapped, tied with cord, a short fuse from its rear end */}
		<rect x={t0} y={-tr} width={t1 - t0} height={tr * 2} rx={tr * 0.5} fill="url(#pap52)" stroke={WOOD.paperD} strokeWidth={1} />
		{[0.18, 0.5, 0.82].map((u) => <rect key={u} x={lerp(t0, t1, u) - sw * 0.35} y={-tr * 1.04} width={sw * 0.7} height={tr * 2.08} fill={WOOD.cord} />)}
		<path d={`M${f1(t0 + tr * 0.1)},${f1(-tr * 0.6)} h${f1(t1 - t0 - tr * 0.3)}`} stroke="#FFFFFF" strokeWidth={Math.max(1, tr * 0.28)} strokeOpacity={0.5} strokeLinecap="round" />
		<path d={`M${f1(t0)},${f1(-tr * 0.2)} Q${f1(t0 - L * 0.025)},${f1(-tr * 0.6)} ${f1(L * ARROW_FUSE_U)},${f1(-tr * 1.4)}`} fill="none" stroke="#3A2A1A" strokeWidth={Math.max(1.2, sw * 0.55)} strokeLinecap="round" />
		{/* the iron head */}
		<path d={`M${f1(hd)},${f1(-tr * 0.9)} L${f1(L)},0 L${f1(hd)},${f1(tr * 0.9)} L${f1(hd + L * 0.02)},0 Z`} fill={WOOD.iron} stroke={WOOD.ironL} strokeWidth={1} />
		<path d={`M${f1(hd + L * 0.015)},${f1(-tr * 0.4)} L${f1(L * 0.985)},0`} stroke={WOOD.ironL} strokeWidth={1.4} />
		{/* the lit fuse */}
		{lit > 0 && <g>
			<circle cx={L * ARROW_FUSE_U} cy={-tr * 1.4} r={tr * 3.6 * lit} fill="url(#spk52)" />
			{Array.from({length: 7}, (_, i) => { const a = (-160 + 140 * rnd(i, 5)) * D2R, d = tr * (1.2 + 2.6 * rnd(i, 6)) * lit;
				return <circle key={i} cx={L * ARROW_FUSE_U + Math.cos(a) * d} cy={-tr * 1.4 + Math.sin(a) * d} r={Math.max(1, tr * 0.18)} fill="#FFFFFF" opacity={0.9} />; })}
			<circle cx={L * ARROW_FUSE_U} cy={-tr * 1.4} r={Math.max(2, tr * 0.5)} fill="#FFFFFF" />
		</g>}
	</g>; };

/* ---------- the bow (Chinese composite recurve) ---------- */
const bowLocal = (L: number, draw: number) => { const s = L / 2, d = draw;
	const tipY = s * (0.98 - 0.08 * d), tipX = -s * (0.2 + 0.22 * d);
	return {s, tipX, tipY, nock: [-s * 0.26 - d * s * 0.62, 0] as P2, // string's nock point
		limb: (sg: number) => `M0,${f1(sg * s * 0.1)} C${f1(s * 0.05)},${f1(sg * s * 0.4)} ${f1(-s * 0.02 - d * s * 0.05)},${f1(sg * s * 0.72)} ${f1(tipX * 0.7)},${f1(sg * tipY * 0.88)} L${f1(tipX)},${f1(sg * tipY)} Q${f1(tipX + s * 0.03)},${f1(sg * (tipY + s * 0.06))} ${f1(tipX + s * 0.1)},${f1(sg * (tipY + s * 0.08))}`,
		tip: (sg: number): P2 => [tipX + s * 0.02, sg * (tipY + s * 0.02)]}; };
/** the string's nock point in screen space for a Bow drawn with the same args */
export const bowNock = (x: number, y: number, L: number, aim: number, draw: number): P2 => rotP(bowLocal(L, draw).nock, aim, [x, y]);
/** a point on the bow in screen space (local coords: x forward along aim, y down the bow) */
export const bowAt = (x: number, y: number, aim: number, lx: number, ly: number): P2 => rotP([lx, ly], aim, [x, y]);
/** a Chinese recurve bow: (x, y) = grip; L = tip-to-tip; aim = shooting direction (deg); draw 0..1 */
export const Bow: React.FC<{x: number; y: number; L: number; aim?: number; draw?: number; o?: number}> = ({x, y, L, aim = 0, draw = 0, o = 1}) => {
	const B = bowLocal(L, draw), lw = Math.max(3, L * 0.022), up = B.tip(-1), dn = B.tip(1);
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${aim})`} opacity={o}>
		{/* the string (to the nock point when drawn) */}
		<path d={`M${f1(up[0])},${f1(up[1])} L${f1(B.nock[0])},0 L${f1(dn[0])},${f1(dn[1])}`} fill="none" stroke={WOOD.string} strokeWidth={Math.max(1.2, L * 0.005)} strokeOpacity={0.95} />
		{/* the limbs: dark horn belly, a lighter back line, the recurved ears */}
		{[-1, 1].map((sg) => <g key={sg}>
			<path d={B.limb(sg)} fill="none" stroke={WOOD.horn} strokeWidth={lw * 1.25} strokeLinecap="round" />
			<path d={B.limb(sg)} fill="none" stroke={WOOD.bow} strokeWidth={lw} strokeLinecap="round" />
			<path d={B.limb(sg)} fill="none" stroke={WOOD.bowL} strokeWidth={lw * 0.3} strokeLinecap="round" transform={`translate(${lw * 0.25},0)`} opacity={0.8} />
		</g>)}
		{/* the grip wrap */}
		<rect x={-lw * 0.9} y={-B.s * 0.13} width={lw * 1.8} height={B.s * 0.26} rx={lw * 0.6} fill={WOOD.cord} />
	</g>; };

/* ---------- a return capsule (generic) ---------- */
/** a small return capsule: (x, y) = centre, s = height; rot = tilt (deg, 0 = heat shield down); heat 0..1 = the re-entry glow on the
    shield and a short bright wake; chute 0..1 = the parachute open above */
export const Capsule: React.FC<{x: number; y: number; s: number; rot?: number; heat?: number; chute?: number}> = ({x, y, s, rot = 0, heat = 0, chute = 0}) => {
	const w = s * 1.15;
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${rot})`}>
		{heat > 0 && <>
			<ellipse cx={0} cy={s * 0.75} rx={w * 1.2} ry={s * 1.1} fill="url(#spk52)" opacity={0.85 * heat} />
		</>}
		{chute > 0 && <g opacity={chute}>
			{[-1, -0.4, 0.4, 1].map((u) => <path key={u} d={`M0,${f1(-s * 0.5)} L${f1(u * s * 1.7)},${f1(-s * 2.6)}`} stroke={WOOD.string} strokeWidth={1.2} opacity={0.8} />)}
			<path d={`M${f1(-s * 1.9)},${f1(-s * 2.6)} Q0,${f1(-s * 4.4)} ${f1(s * 1.9)},${f1(-s * 2.6)} Q${f1(s * 0.95)},${f1(-s * 2.85)} 0,${f1(-s * 2.62)} Q${f1(-s * 0.95)},${f1(-s * 2.85)} ${f1(-s * 1.9)},${f1(-s * 2.6)} Z`} fill="#E8E2D6" stroke="#C8402A" strokeWidth={2} />
			<path d={`M0,${f1(-s * 3.5)} L0,${f1(-s * 2.62)} M${f1(-s * 1.0)},${f1(-s * 3.3)} L${f1(-s * 0.95)},${f1(-s * 2.75)} M${f1(s * 1.0)},${f1(-s * 3.3)} L${f1(s * 0.95)},${f1(-s * 2.75)}`} stroke="#C8402A" strokeWidth={2} opacity={0.6} />
		</g>}
		<path d={`M${f1(-w * 0.22)},${f1(-s * 0.5)} L${f1(w * 0.22)},${f1(-s * 0.5)} L${f1(w * 0.5)},${f1(s * 0.38)} L${f1(-w * 0.5)},${f1(s * 0.38)} Z`} fill="url(#metG52)" stroke={METAL.dark} strokeWidth={1.2} />
		<path d={`M${f1(-w * 0.52)},${f1(s * 0.36)} Q0,${f1(s * 0.62)} ${f1(w * 0.52)},${f1(s * 0.36)} Z`} fill={heat > 0 ? FLAME.amber : '#5A4030'} />
		{heat > 0 && <path d={`M${f1(-w * 0.52)},${f1(s * 0.36)} Q0,${f1(s * 0.62)} ${f1(w * 0.52)},${f1(s * 0.36)} Z`} fill={FLAME.hot} opacity={heat} />}
		<path d={`M${f1(-w * 0.14)},${f1(-s * 0.42)} L${f1(-w * 0.34)},${f1(s * 0.28)}`} stroke="#FFFFFF" strokeWidth={Math.max(1, s * 0.06)} strokeOpacity={0.45} strokeLinecap="round" />
	</g>; };

/* ---------- walker costumes ---------- */
export const LOOKS52: Record<'song' | 'ming' | 'worker' | 'today', {look: Look4; label: string; note: string}> = {
	song: {look: {dress: 'tunic', legs: 'trousers', head: 'futou'}, label: '北宋', note: '短褐 · 软脚幞头'},
	ming: {look: {dress: 'robe', head: 'futou'}, label: '明', note: '袍 · 幞头'},
	worker: {look: {dress: 'jacket', legs: 'trousers', head: 'cap'}, label: '1956–1960', note: '工作服 · 帽'},
	today: {look: {dress: 'jacket', legs: 'trousers', head: 'short'}, label: '今天', note: '夹克 · 短发'},
};
