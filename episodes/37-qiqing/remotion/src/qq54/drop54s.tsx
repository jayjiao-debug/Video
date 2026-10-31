import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {Npc} from './npc54b';
import {ACC, Banner, Qun, Store, Palisade} from './set54bs';
import {CaoFront, RunnerF, runTop, Flame3, FIRE, RunKind} from './front54s';
/* ep54 · THE DROP in look B, drawn in code (owner: "keep the style consistent throughout the video" — no AI picture anywhere).
   `Drop` = film 100.26–108.22 (t = film time, s). The world ignites: fire orange appears for the first time in the film.
   D1 100.256 (the hit, card 26): reverse angle of K6 — 曹操 turns to face us, low and close, his 环首刀 pointed at the lens;
      behind him the charge in depth (near runners with torches and 戟, the far river of torches) and 乌巢 burning on the horizon.
   D2 102.248: wider — the charge streams past him on both sides toward the camera, 曹 banners whipping past; he is the still centre.
   D3 104.240 (card 27): the 乌巢 depot burning — 囷 granaries and raised stores, a wall of fire, smoke, 袁 guards running.
   D4 106.232: the 袁 army breaking — 袁 banners toppling, men fleeing across a fire-lit field, one 曹 banner advancing.
   Overlay-safe zones kept calm: subtitles x 150–1150 / y 90–300, stamp x 1200–1800 / y 30–200, counter x 150–460 / y 900–1010. */
const BAR = (n: number) => 0.654 + 1.99203 * n;
const T1 = BAR(50), T2 = BAR(51), T3 = BAR(52), T4 = BAR(53);
const cl = (v: number) => Math.min(1, Math.max(0, v));
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const Blur: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={s} /></filter>;
/** a layer push toward (fx, fy): z scaled by depth p */
const pl = (z: number, p: number, fx: number, fy: number, dx = 0, dy = 0) => { const s = 1 + z * (0.25 + 0.75 * p);
	return `translate(${f1(fx + dx * (0.25 + 0.75 * p))},${f1(fy + dy * (0.25 + 0.75 * p))}) scale(${s.toFixed(5)}) translate(${-fx},${-fy})`; };

/* ---------- shared: the fire sky, smoke, the charge ---------- */
const Sky: React.FC<{id: string; hz: number; hot?: number}> = ({id, hz, hot = 1}) => <>
	<defs><linearGradient id={id} x1="0" y1={-240} x2="0" y2={hz + 40} gradientUnits="userSpaceOnUse">
		<stop offset="0" stopColor="#080505" /><stop offset="0.4" stopColor="#170B0B" /><stop offset="0.72" stopColor="#3E1812" /><stop offset="0.9" stopColor={hot > 0.5 ? '#A8401A' : '#7A2E18'} /><stop offset="1" stopColor="#E0702A" />
	</linearGradient></defs>
	<rect x={-300} y={-300} width={W + 600} height={hz + 340} fill={`url(#${id})`} /></>;
type Blob = {x: number; y: number; r: number; vx: number; vy: number; lit: number};
const smokeBlobs = (n: number, seed: number, x0: number, x1: number, y0: number, y1: number, r0: number, r1: number): Blob[] => Array.from({length: n}, (_, i) => ({
	x: x0 + rnd(i, seed) * (x1 - x0), y: y0 + rnd(i, seed + 1) * (y1 - y0), r: r0 + rnd(i, seed + 2) * (r1 - r0), vx: 6 + rnd(i, seed + 3) * 16, vy: -(8 + rnd(i, seed + 4) * 22), lit: rnd(i, seed + 5)}));
/** rolling smoke: dark masses (#3A2224) lit from below by the fire; drifting up and to the right */
const Smoke: React.FC<{b: Blob[]; t: number; id: string; blur: number; o?: number; hz: number}> = ({b, t, id, blur, o = 1, hz}) => <g filter={`url(#${id})`} opacity={o}>
	{b.map((s, i) => { const x = s.x + s.vx * t, y = s.y + s.vy * t, lit = cl((y - hz * 0.25) / (hz * 0.8)) * (0.4 + s.lit * 0.6);
		return <g key={i}><circle cx={x} cy={y} r={s.r} fill={FIRE.smoke} /><ellipse cx={x} cy={y + s.r * 0.5} rx={s.r * 0.8} ry={s.r * 0.42} fill="#A4441E" opacity={lit * 0.85} /></g>; })}
</g>;
/** a man in the charge: lateral X (m), depth Z at the shot start (m), run phase, kind */
type Man = {X: number; Z: number; ph: number; kind: RunKind; i: number};
const charge = (seed: number, rows: number, dz: number, z0: number, xs: number[], banners = 0): Man[] => { const m: Man[] = [];
	for (let r = 0; r < rows; r++) xs.forEach((x, j) => { const i = r * xs.length + j, q = rnd(i, seed + 3);
		const Z = z0 + r * dz + rnd(i, seed + 1) * dz * 0.6; m.push({X: x + (rnd(i, seed) - 0.5) * 0.5, Z, ph: rnd(i, seed + 2) * 6.28, kind: banners && q < banners && x > 0 && Z > 6.2 && Z < 22 ? 'banner' : q < 0.62 ? 'torch' : q < 0.9 ? 'ji' : 'plain', i}); });
	return m; };
type Cam3 = {f: number; vx: number; hz: number; ch: number; bend?: number};
/** where a man is on screen: foot (x, y) and k = px per cm; the river meanders a little in the distance */
const place = (m: Man, z: number, c: Cam3) => { const X = m.X * Math.min(1, 26 / z + 0.25) - (c.bend ?? 0) * z * z + 0.05 * z * Math.sin(z / 42);
	return {x: c.vx + (c.f * X) / z, y: c.hz + (c.f * c.ch) / z, k: c.f / (100 * z)}; };
/** the charge: far = the river of torches (points); mid / near = rimmed front-running silhouettes with fire torches and 戟 */
const Charge: React.FC<{men: Man[]; t: number; v: number; c: Cam3; id: string; zMin: number; split: number; flags?: boolean}> = ({men, t, v, c, id, zMin, split, flags}) => {
	const live = men.map((m) => ({m, z: m.Z - v * t})).filter((o) => o.z > zMin).sort((a, b) => b.z - a.z);
	const far = live.filter((o) => o.z > 34), mid = live.filter((o) => o.z <= 34 && o.z > split), near = live.filter((o) => o.z <= split);
	const run = (o: {m: Man; z: number}) => { const p = place(o.m, o.z, c), ph = o.m.ph + t * 7.4;
		return {p, ph, el: <g key={o.m.i} transform={`translate(${f1(p.x)},${f1(p.y)}) scale(${(o.m.X < 0 ? -p.k : p.k).toFixed(4)},${p.k.toFixed(4)})`}><RunnerF ph={ph} kind={o.m.kind} /></g>}; };
	const fl = (o: {m: Man; z: number}) => { if (o.m.kind !== 'torch') return null; const p = place(o.m, o.z, c), ph = o.m.ph + t * 7.4, q = runTop(ph, 'torch');
		const x = p.x + (o.m.X < 0 ? -q[0] : q[0]) * p.k, y = p.y + q[1] * p.k, s = p.k * 100;
		return <g key={'f' + o.m.i}><circle cx={x} cy={y - 0.12 * s} r={0.55 * s} fill={`url(#${id}g)`} /><Flame3 x={x} y={y} w={0.16 * s} h={0.42 * s} t={t + o.m.i * 0.37} seed={o.m.i} /></g>; };
	const flag = (o: {m: Man; z: number}) => { if (o.m.kind !== 'banner') return null; const p = place(o.m, o.z, c), ph = o.m.ph + t * 7.4, q = runTop(ph, 'banner'), sg = o.m.X < 0 ? -1 : 1;
		const x = p.x + sg * q[0] * p.k, y = p.y + q[1] * p.k, k = p.k * 100, wv = Math.sin(t * 7 + o.m.i) * 0.12 * k, wv2 = Math.sin(t * 9.3 + o.m.i * 2) * 0.1 * k;
		const fw = 0.62 * k * sg, fh = 1.5 * k;
		return <g key={'b' + o.m.i}>
			<rect x={Math.min(x, x + fw * 1.08)} y={y + 0.04 * k} width={Math.abs(fw * 1.08)} height={0.04 * k} fill="#140A08" />
			<path d={`M${f1(x)},${f1(y + 0.06 * k)} L${f1(x + fw)},${f1(y + 0.06 * k + wv * 0.3)} C${f1(x + fw + wv)},${f1(y + fh * 0.35)} ${f1(x + fw - wv2)},${f1(y + fh * 0.7)} ${f1(x + fw + wv * 0.6)},${f1(y + fh)} L${f1(x)},${f1(y + fh - 0.04 * k)} Z`} fill="#6E241A" />
			<path d={`M${f1(x + fw * 0.7)},${f1(y + 0.06 * k)} L${f1(x + fw)},${f1(y + 0.06 * k + wv * 0.3)} C${f1(x + fw + wv)},${f1(y + fh * 0.35)} ${f1(x + fw - wv2)},${f1(y + fh * 0.7)} ${f1(x + fw + wv * 0.6)},${f1(y + fh)} L${f1(x + fw * 0.7)},${f1(y + fh)} Z`} fill="#E0703A" opacity={0.55} />
			<text x={x + fw * 0.5} y={y + fh * 0.5} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={0.5 * k} fill="#F2DDB0">曹</text>
		</g>; };
	return <g>
		{/* the river of torches */}
		{far.map((o) => { const p = place(o.m, o.z, c), s = Math.max(0.5, 4200 / o.z), fk = 0.75 + 0.25 * Math.sin(t * 11 + o.m.i * 1.7);
			return <g key={o.m.i}>{o.z < 90 && <rect x={p.x - 0.12 * p.k * 100} y={p.y - 1.7 * p.k * 100} width={Math.max(1, 0.24 * p.k * 100)} height={1.7 * p.k * 100} fill="#160A08" opacity={0.85} />}
				{o.m.kind === 'torch' && <><circle cx={p.x} cy={p.y - 2.15 * p.k * 100} r={s * 0.12 + 4} fill={`url(#${id}g)`} opacity={fk} /><circle cx={p.x} cy={p.y - 2.15 * p.k * 100} r={Math.max(1.6, s * 0.014)} fill={FIRE.core} /></>}</g>; })}
		<g fill="#160C0A" filter={`url(#${id}rm)`}>{mid.map((o) => run(o).el)}</g>
		{mid.map(fl)}{flags && mid.map(flag)}
		<g fill="#140A08" filter={`url(#${id}rn)`}>{near.map((o) => run(o).el)}</g>
		{near.map(fl)}{flags && near.map(flag)}
	</g>; };
const ChargeDefs: React.FC<{id: string; kn: number}> = ({id, kn}) => <>
	<radialGradient id={`${id}g`}><stop offset="0" stopColor="#FFD08A" stopOpacity="0.7" /><stop offset="0.3" stopColor="#FF9A40" stopOpacity="0.28" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<RimF id={`${id}rm`} lx={1} ly={-0.3} k={1.6} c={FIRE.mid} o={0.9} lx2={-1} ly2={-0.3} k2={1.6} c2={FIRE.out} o2={0.75} blur={0.6} />
	<RimF id={`${id}rn`} lx={1} ly={-0.3} k={kn} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={kn * 0.8} c2={FIRE.out} o2={0.8} blur={1} />
</>;
/** a burning horizon: a band of small flames, a glow, granaries in silhouette catching fire */
const Horizon: React.FC<{hz: number; t: number; id: string; qx: number[]; qs: number}> = ({hz, t, id, qx, qs}) => <g>
	<ellipse cx={W / 2} cy={hz} rx={1500} ry={90} fill={`url(#${id}hg)`} />
	<path d={`M-300,${hz} L${W + 300},${hz} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill={`url(#${id}gd)`} />
	{Array.from({length: 70}, (_, i) => { const x = -60 + i * 30 + rnd(i, 81) * 20, h = 8 + rnd(i, 82) * 22 + (qx.some((q) => Math.abs(q - x) < 120) ? 26 : 0);
		return <Flame3 key={i} x={x} y={hz + 2} w={h * 0.7} h={h} t={t} seed={i * 1.3} />; })}
	{qx.map((x, i) => <g key={x}>
		<g transform={`translate(${x},${hz + 2}) scale(${qs * (0.85 + (i % 2) * 0.2)})`}><Qun drum="#1C0E0A" thatch="#160A08" edge="#E0702A" /></g>
		<Flame3 x={x + 4} y={hz - 150 * qs} w={110 * qs} h={190 * qs} t={t} seed={i * 7 + 1} />
		<Flame3 x={x - 40 * qs} y={hz - 80 * qs} w={70 * qs} h={110 * qs} t={t + 0.3} seed={i * 7 + 3} />
	</g>)}
</g>;
const HorizonDefs: React.FC<{id: string; hz: number}> = ({id, hz}) => <>
	<radialGradient id={`${id}hg`}><stop offset="0" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="0.5" stopColor="#EA6028" stopOpacity="0.2" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<linearGradient id={`${id}gd`} x1="0" y1={hz} x2="0" y2={H + 200} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3A1A10" /><stop offset="0.12" stopColor="#1E0E0A" /><stop offset="1" stopColor="#0A0605" /></linearGradient>
</>;

/* ================= D1 · the hit: he turns to face us, the 宝剑 at the lens ================= */
const MEN1 = charge(11, 160, 1.3, 6.2, [-2.4, -3.3, 2.4, 3.3, -1.6, 1.7]);
const SM1 = smokeBlobs(30, 3, -200, 2100, -200, 560, 100, 240);
/** D1's camera and the arm pose at t (shared by the scene layer and the sword layer above the letterbox) */
const d1Pose = (t: number) => { const d = t - T1, z = 0.075 * eout(d / 2.1);
	/* the thrust on the hit: the arm snaps toward the lens over 5 frames, then holds with a small tremble */
	const sn = eout(d / 0.17), tr = Math.sin(t * 23) * 1.2 * cl(d / 0.3);
	const arm = {F: [-236 - 12 * sn, 222 + 14 * sn + tr] as P, fs: 1.6 + 0.4 * sn, T: [-520 - 140 * sn, 380 + 165 * sn + tr] as P, bw: 24, tipK: 2.5};
	return {d, z, arm, tf: `${pl(z, 1, 1150, 520)} translate(1180,470)`};
};
export const D1: React.FC<{t: number; layer?: 'scene' | 'sword'}> = ({t, layer = 'scene'}) => { const {d, z, arm, tf} = d1Pose(t), HZ = 800, c: Cam3 = {f: 1000, vx: 1180, hz: HZ, ch: 0.7, bend: 0.003};
	const FX = 1150, FY = 520;
	if (layer === 'sword') {
		/* the sword over the letterbox, and its glint: big on the black first frames, then a short star */
		const ga = d < 0.05 ? 1.6 : 0.55 + 0.45 * Math.exp(-(d - 0.05) / 0.35), gl = (d < 0 ? 0 : 1) * (0.85 + 0.15 * Math.sin(t * 9)), L = 70 * ga, V = 46 * ga;
		const T = arm.T;
		return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<defs><radialGradient id="d1tg"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
			<g transform={tf}>
				<CaoFront id="d1s" t={t} arm={arm} part="sword" />
				{gl > 0.01 && <g opacity={gl}><circle cx={T[0]} cy={T[1]} r={70 * ga} fill="url(#d1tg)" />
					<path d={`M${T[0] - L},${T[1]} L${T[0]},${T[1] - 3} L${T[0] + L},${T[1]} L${T[0]},${T[1] + 3} Z M${T[0]},${T[1] - V} L${T[0] + 2.6},${T[1]} L${T[0]},${T[1] + V} L${T[0] - 2.6},${T[1]} Z`} fill="#FFF6E0" /></g>}
			</g>
		</svg>; }
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<defs><HorizonDefs id="d1" hz={HZ} /><ChargeDefs id="d1" kn={2.6} /><Blur id="d1sb" s={22} />
			<RimF id="d1hero" lx={1} ly={-0.35} k={5} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.25} k2={4} c2={ACC} o2={0.9} blur={1} />
			<radialGradient id="d1vig" cx="0.58" cy="0.48" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.62" /></radialGradient>
			<radialGradient id="d1back" cx="1190" cy="330" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.42" /><stop offset="0.45" stopColor="#EA6028" stopOpacity="0.16" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
		</defs>
		<g transform={pl(z, 0, FX, FY)}><Sky id="d1sky" hz={HZ} /><Smoke b={SM1} t={d} id="d1sb" blur={22} hz={HZ} /></g>
		<g transform={pl(z, 0.12, FX, FY)}><Horizon hz={HZ} t={t} id="d1" qx={[150, 300, 1660, 1820]} qs={0.62} /></g>
		<g transform={pl(z, 0.4, FX, FY)}><Charge men={MEN1} t={d} v={1.3} c={c} id="d1" zMin={2.2} split={8} /></g>
		<g transform={pl(z, 1, FX, FY)}><rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#d1back)" /></g>
		<g filter="url(#d1hero)"><g transform={tf}><CaoFront id="d1c" t={t} arm={arm} part="body" /></g></g>
		<rect width={W} height={H} fill="url(#d1vig)" />
	</svg>; };
/** the letterbox on the hit: black, then the bars snap open in about 4 frames; the bottom bar stays (the sword crosses over it) */
export const BAR_REST = 930;
const Letterbox: React.FC<{t: number}> = ({t}) => { const d = t - T1, u = eout((d - 0.03) / 0.12);
	const top = 540 * (1 - u), bot = 540 + (BAR_REST - 540) * u;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{top > 0.5 && <rect x={0} y={0} width={W} height={top} fill="#000" />}
		<rect x={0} y={bot} width={W} height={H - bot} fill="#000" />
	</svg>; };

/* ================= D2 · wider: the charge streams past him on both sides; 曹 banners whip past ================= */
const MEN2 = charge(23, 110, 1.15, 3.3, [-1.5, -2.3, -3.2, 1.5, 2.3, 3.2], 0.3);
const SM2 = smokeBlobs(30, 9, -200, 2100, -160, 520, 90, 220);
const D2: React.FC<{t: number}> = ({t}) => { const d = t - T2, HZ = 840, c: Cam3 = {f: 1000, vx: 960, hz: HZ, ch: 0.55};
	const z = 0.05 * ease(d / 2.0), FX = 960, FY = 600, S = 0.405, ZH = 2.36;
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<defs><HorizonDefs id="d2" hz={HZ} /><ChargeDefs id="d2" kn={3.4} /><Blur id="d2sb" s={24} />
			<RimF id="d2hero" lx={1} ly={-0.35} k={3.4} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.25} k2={3} c2={ACC} o2={0.9} blur={0.9} />
			<radialGradient id="d2vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
			<radialGradient id="d2back" cx="960" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FF9A40" stopOpacity="0.3" /><stop offset="1" stopColor="#FF9A40" stopOpacity="0" /></radialGradient>
		</defs>
		<g transform={pl(z, 0, FX, FY)}><Sky id="d2sky" hz={HZ} /><Smoke b={SM2} t={d + 2} id="d2sb" blur={24} hz={HZ} /></g>
		<g transform={pl(z, 0.12, FX, FY)}><Horizon hz={HZ} t={t} id="d2" qx={[240, 420, 1480, 1660, 1830]} qs={0.36} /></g>
		<g transform={pl(z, 0.5, FX, FY)}>
			<Charge men={MEN2} t={d} v={1.15} c={c} id="d2" zMin={0.6} split={6} flags />
			<circle cx={960} cy={520} r={520} fill="url(#d2back)" />
			<ellipse cx={960} cy={1038} rx={180} ry={16} fill="#000" opacity={0.6} />
			<g filter="url(#d2hero)"><g transform={`translate(960,${f1(1040 - 1620 * S)}) scale(${S})`}><CaoFront id="d2c" t={t} legs capeK={1.1} arm={{F: [-222, 40], fs: 1.25, T: [-500, -600], bw: 30, tipK: 1.3}} /></g></g>
		</g>
		<rect width={W} height={H} fill="url(#d2vig)" />
	</svg>; };

/* ================= D3 · 乌巢 burning: the granaries, the raised stores, a wall of fire, 袁 guards running ================= */
const SM3 = smokeBlobs(46, 17, -200, 2200, -260, 560, 100, 260);
const GUARDS = Array.from({length: 9}, (_, i) => ({x0: 120 + rnd(i, 91) * 1700, y: 880 + rnd(i, 92) * 120, k: 2.0 + rnd(i, 93) * 1.1, dir: rnd(i, 94) < 0.6 ? -1 : 1, sp: 160 + rnd(i, 95) * 120, kind: rnd(i, 96) < 0.5 ? 'ji' as const : 'plain' as const, ph: rnd(i, 97) * 6}));
const D3: React.FC<{t: number}> = ({t}) => { const d = t - T3, HZ = 800, z = 0.06 * ease(d / 2.0), FX = 1000, FY = 640, px = -40 * ease(d / 2);
	const qs: [number, number, number][] = [[230, 1.2, 0], [600, 1.5, 1], [1040, 1.35, 2], [1460, 1.55, 3], [1800, 1.2, 4]];
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<defs><Blur id="d3sb" s={28} /><Blur id="d3b6" s={6} />
			<linearGradient id="d3gd" x1="0" y1={HZ} x2="0" y2={H + 100} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A1E10" /><stop offset="0.2" stopColor="#24100A" /><stop offset="1" stopColor="#0A0605" /></linearGradient>
			<radialGradient id="d3glow" cx="960" cy={HZ - 60} r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="0.35" stopColor="#EA6028" stopOpacity="0.28" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
			<RimF id="d3rim" lx={1} ly={-0.4} k={2.6} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.4} k2={2} c2={FIRE.out} o2={0.8} />
			<RimF id="d3rimS" lx={0} ly={-1} k={3} c={FIRE.mid} o={0.9} />
			<radialGradient id="d3vig" cx="0.5" cy="0.55" r="0.78"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.62" /></radialGradient>
		</defs>
		<g transform={pl(z, 0, FX, FY, px)}><Sky id="d3sky" hz={HZ} /><rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#d3glow)" /><Smoke b={SM3} t={d + 1} id="d3sb" blur={28} hz={HZ} /></g>
		<g transform={pl(z, 0.3, FX, FY, px)}>
			{/* the fire behind the depot: tall thin tongues */}
			{Array.from({length: 46}, (_, i) => { const x = -140 + i * 48 + rnd(i, 55) * 30, h = 170 + rnd(i, 56) * 200 + 60 * Math.sin(i * 0.53);
				return <Flame3 key={i} x={x} y={HZ - 20} w={h * 0.34} h={h} t={t + i * 0.13} seed={i * 1.9 + 80} />; })}
		</g>
		<g transform={pl(z, 0.4, FX, FY, px)}>
			{/* the depot in silhouette against it: round thatched 囷 and raised stores, their roofs catching */}
			{qs.map(([x, s]) => <g key={x} filter="url(#d3rim)"><g transform={`translate(${x},${HZ}) scale(${s})`}><Qun drum="#1E0E0A" thatch="#140906" edge="#FFB04E" /></g></g>)}
			{[[420, 1.0], [1250, 1.1]].map(([x, s]) => <g key={x} filter="url(#d3rim)"><g transform={`translate(${x},${HZ}) scale(${s})`}><Store body="#1E0E0A" roof="#140906" /></g></g>)}
			{qs.map(([x, s, i]) => <g key={'f' + x}>
				<Flame3 x={x + 30 * s} y={HZ - 118 * s} w={70 * s} h={150 * s} t={t} seed={i * 5} />
				<Flame3 x={x - 34 * s} y={HZ - 100 * s} w={50 * s} h={100 * s} t={t + 0.4} seed={i * 5 + 2} />
				{i % 2 === 0 && <Flame3 x={x + 2} y={HZ - 166 * s} w={40 * s} h={90 * s} t={t + 0.8} seed={i * 5 + 3} />}
			</g>)}
			{[[420, 1.0], [1250, 1.1]].map(([x, s], i) => <Flame3 key={x} x={x + 50 * s} y={HZ - 150 * s} w={80 * s} h={140 * s} t={t + 0.2} seed={30 + i * 3} />)}
		</g>
		<g transform={pl(z, 0.55, FX, FY, px)}>
			{/* a low fire along the palisade, the palisade, the ground */}
			{Array.from({length: 44}, (_, i) => { const x = -120 + i * 50 + rnd(i, 51) * 30, h = 50 + rnd(i, 52) * 90;
				return <Flame3 key={i} x={x} y={HZ + 44} w={h * 0.5} h={h} t={t} seed={i * 2.1 + 40} />; })}
			<g fill="#120806" filter="url(#d3rim)"><Palisade x0={-120} x1={2040} y={HZ + 48} h={110} gap={22} seed={7} w={12} /></g>
			<path d={`M-300,${HZ + 46} L${W + 300},${HZ + 46} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill="url(#d3gd)" />
		</g>
		<g transform={pl(z, 0.9, FX, FY, px)}>
			{/* 袁 guards running, silhouetted against the fire */}
			<g fill="#100806" filter="url(#d3rim)">{GUARDS.map((g, i) => { const x = g.x0 + g.dir * g.sp * d, st = Math.sin(t * 9 + g.ph) * 0.9, by = -Math.abs(Math.cos(t * 9 + g.ph)) * 4 * g.k;
				return <g key={i} transform={`translate(${f1(x)},${f1(g.y)}) skewX(${g.dir < 0 ? 9 : -9}) translate(${f1(-x)},${f1(-g.y)})`}><Npc x={x} y={g.y + by} k={g.k} flip={g.dir < 0} kind={g.kind} stride={st} /></g>; })}</g>
		</g>
		<rect width={W} height={H} fill="url(#d3vig)" />
	</svg>; };

/* ================= D4 · the 袁 army breaks: banners topple, men flee, one 曹 banner advances ================= */
const SM4 = smokeBlobs(34, 29, -200, 2200, -200, 520, 90, 230);
const FALL = [[300, 760, 1.0, 0.1], [610, 720, 0.8, 0.5], [880, 700, 0.7, -0.2], [1120, 730, 0.85, 0.9], [1380, 700, 0.7, 0.3]];
const FLEE = Array.from({length: 26}, (_, i) => ({x0: 200 + rnd(i, 71) * 1500, y: 690 + rnd(i, 72) * 150, kind: rnd(i, 73) < 0.4 ? 'ji' as const : 'plain' as const, sp: 70 + rnd(i, 74) * 80, ph: rnd(i, 75) * 6}));
const D4: React.FC<{t: number}> = ({t}) => { const d = t - T4, HZ = 640, z = 0.04 * ease(d / 2.0), FX = 960, FY = 600;
	const bx = 1620 - 130 * ease(d / 2.0), wave = Math.sin(t * 6.4) * 16;
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<defs><HorizonDefs id="d4" hz={HZ} /><Blur id="d4sb" s={24} />
			<RimF id="d4rim" lx={-1} ly={-0.4} k={2.2} c={FIRE.mid} o={0.95} lx2={1} ly2={-0.3} k2={1.6} c2={FIRE.out} o2={0.7} />
			<RimF id="d4rimN" lx={-1} ly={-0.4} k={4} c={FIRE.mid} o={0.95} lx2={1} ly2={-0.2} k2={3} c2={ACC} o2={0.5} />
			<radialGradient id="d4vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
			<radialGradient id="d4pool"><stop offset="0" stopColor="#FF9A40" stopOpacity="0.35" /><stop offset="1" stopColor="#FF9A40" stopOpacity="0" /></radialGradient>
		</defs>
		<g transform={pl(z, 0, FX, FY)}><Sky id="d4sky" hz={HZ} /><Smoke b={SM4} t={d + 3} id="d4sb" blur={24} hz={HZ} /></g>
		<g transform={pl(z, 0.15, FX, FY)}><Horizon hz={HZ} t={t} id="d4" qx={[160, 330, 520]} qs={0.5} /></g>
		<g transform={pl(z, 0.45, FX, FY)}>
			{/* fires dotting the field */}
			{[[250, 880, 1.0], [760, 820, 0.7], [1240, 900, 1.1], [1700, 800, 0.6], [520, 760, 0.5]].map(([x, y, s], i) => <g key={i}><ellipse cx={x} cy={y} rx={260 * s} ry={50 * s} fill="url(#d4pool)" /><Flame3 x={x} y={y} w={70 * s} h={130 * s} t={t} seed={60 + i} /><Flame3 x={x + 40 * s} y={y + 4} w={46 * s} h={80 * s} t={t + 0.5} seed={64 + i} /></g>)}
			{/* 袁 banners toppling */}
			<g fill="#120806" color="#120806" filter="url(#d4rim)">
				{FALL.map(([x, y, s, dl], i) => { const u = cl((d - dl) / 1.5), a = -4 - 82 * u * u * (dl < 0 ? 1 : 1) - (dl < 0 ? 30 : 0);
					return <g key={i} transform={`translate(${x},${y}) rotate(${f1(i % 2 ? -a : a)}) scale(${s})`}><Banner h={380} w={70} ch="袁" cloth="#3A1A12" clothS="#24100C" ink="#C8A070" lit={1} wave={Math.sin(t * 5 + i) * 8} /></g>; })}
				{/* men fleeing, away from us and to the left */}
				{FLEE.map((m, i) => { const k = 0.5 + (m.y - 690) / 150 * 0.7, x = m.x0 - m.sp * d * k, st = Math.sin(t * 9.5 + m.ph) * 0.9;
					return <g key={i} transform={`translate(${f1(x)},${f1(m.y)}) skewX(10) translate(${f1(-x)},${f1(-m.y)})`}><Npc x={x} y={m.y - Math.abs(Math.cos(t * 9.5 + m.ph)) * 4 * k} k={k} flip kind={m.kind} stride={st} /></g>; })}
			</g>
		</g>
		<g transform={pl(z, 1, FX, FY)}>
			{/* the one 曹 banner advancing in the foreground */}
			<g fill="#100806" color="#100806" filter="url(#d4rimN)">
				<Npc x={bx - 30} y={1240} k={4.6} flip kind="hold" stride={Math.sin(t * 6) * 0.5} />
				<rect x={bx - 4} y={210} width={9} height={900} />
				<path d={`M${bx},190 L${bx - 9},214 L${bx + 9},214 Z`} />
				<rect x={bx - 4} y={226} width={240} height={8} />
			</g>
			<path d={`M${bx + 6},234 L${bx + 236},236 C${bx + 230 + wave},${360} ${bx + 246 - wave},${480} ${bx + 232 + wave * 0.6},${600} L${bx + 6},${598} Z`} fill="#7A2418" />
			<path d={`M${bx + 6},234 L${bx + 90},234 L${bx + 90},${599} L${bx + 6},${598} Z`} fill="#E0703A" opacity={0.45} />
			{[0, 1, 2].map((i) => <path key={i} d={`M${bx + 20 + i * 76},598 C${bx + 16 + i * 76 + wave},640 ${bx + 30 + i * 76},670 ${bx + 20 + i * 76 + wave},710 L${bx + 40 + i * 76 + wave},706 C${bx + 46 + i * 76},670 ${bx + 34 + i * 76 + wave},640 ${bx + 44 + i * 76},598 Z`} fill="#5A1A12" />)}
			<text x={bx + 122} y={470} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={170} fill="#F2DDB0">曹</text>
		</g>
		<rect width={W} height={H} fill="url(#d4vig)" />
	</svg>; };

/* ================= the drop: shots on the downbeats, the hit (flash, shake), embers over everything ================= */
const EMB = Array.from({length: 120}, (_, i) => ({x: rnd(i, 41) * W, sp: 70 + rnd(i, 42) * 190, ph: rnd(i, 43), sw: 10 + rnd(i, 44) * 50, fq: 0.6 + rnd(i, 45) * 1.6, r: 1.2 + rnd(i, 46) * 2.8, spark: rnd(i, 47) < 0.3, hot: rnd(i, 48)}));
const Embers: React.FC<{t: number; n: number}> = ({t, n}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
	<defs><radialGradient id="drEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.6" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient></defs>
	{EMB.slice(0, n).map((e, i) => { const yy = H + 60 - (((t - 99) * e.sp + e.ph * (H + 160)) % (H + 160)), xx = e.x + Math.sin(t * e.fq + e.ph * 6) * e.sw + (t - 99) * 14 * (e.ph - 0.4);
		const o = (0.55 + 0.45 * Math.sin(t * (5 + e.fq * 4) + i)) * Math.min(1, (yy + 40) / 300);
		if (o <= 0.02) return null;
		return e.spark ? <line key={i} x1={xx} y1={yy} x2={xx - Math.cos(t * e.fq + e.ph * 6) * e.sw * e.fq * 0.12} y2={yy + 10 + e.sp * 0.06} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={e.r * 0.6} strokeLinecap="round" opacity={o} />
			: <circle key={i} cx={xx} cy={yy} r={e.r * 3} fill="url(#drEm)" opacity={o} />; })}
</svg>;
export const Drop: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - T1);
	const A = 13 * Math.exp(-d / 0.13) * cl((0.55 - d) / 0.1);
	const shx = A * Math.sin(d * 97 + 0.7) * Math.cos(d * 31), shy = A * 0.7 * Math.sin(d * 83 + 2.1);
	const S = t < T2 ? D1 : t < T3 ? D2 : t < T4 ? D3 : D4, d1 = t < T2;
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(shx)}px,${f1(shy)}px) scale(1.024)`, transformOrigin: '50% 50%'};
	const open = d1 ? eout((d - 0.03) / 0.12) : 1;
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0605'}}>
		<div style={shake}><S t={t} /></div>
		{open > 0.001 && <div style={{opacity: open}}><Embers t={t} n={t < T3 ? 90 : 120} /></div>}
		{d1 && <Letterbox t={t} />}
		{d1 && <div style={shake}><D1 t={t} layer="sword" /></div>}
	</div>; };
void (null as unknown as P);
