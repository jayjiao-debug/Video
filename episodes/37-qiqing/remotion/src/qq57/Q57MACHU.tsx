import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import data from '../../public/ep57/machu/machu.json';
/* ep57 · 马丘比丘 history, built live in Remotion in the episode's flat-colour + ink look (owner 09:54).
   Still layers are hist_a.py's own drawings split by depth (tools/export_machu.py); everything that moves is built here.
   Shot A 「山顶行宫」 (machu_palace framing): the camera cranes up out of the clouds past the farming terraces (crops
   coming up, a terrace wall being laid course by course) to the citadel, with parallax; the altitude gauge climbs to
   约2350米 and lands on bar 2; clouds drift at mid-height and fill the valley below; hearth smoke rises; the Inca's litter
   procession walks along the top terrace and halts on bar 3; beside it a house is built (walls, gable, rafters, thatch).
   Shot B 「没找到它」 (machu_hidden framing, wide side view): the city on its ridge above the sea of clouds, the Spanish
   column marching along the river far below; their lines of sight end in the cloud deck (✕); a cloud bank slides over
   the city; the year widget steps 1532 → 1572 (bar 3) and jumps to 1911.
   Each shot 5.016 s = 3 bars at 143.6 BPM (t = 0 on a downbeat, beat 0.418 s). */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, BAR = 4 * BEAT, SHOT = 3 * BAR, INK = '#2A211B', GOLD = '#F2C66E', CREAM = '#FFF6E6';
const D: any = data;
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
type V2 = [number, number];
const pts = (ps: V2[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const lerp = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const add = (a: V2, b: V2, k = 1): V2 => [a[0] + b[0] * k, a[1] + b[1] * k];
const mul = (seed: number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- the reference widgets ---------- */
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, s, size, col = CREAM, anchor = 'start', w = 900}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: V2; to: V2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };

/* ---------- silhouettes with a warm rim (hist_a.py sil(): the rim is the same shape nudged toward the light) ---------- */
type Part = {k: 'p'; p: V2[]} | {k: 'l'; p: V2[]; w: number} | {k: 'e'; c: [number, number, number, number]};
const Pp = (p: V2[]): Part => ({k: 'p', p}), Ll = (p: V2[], w: number): Part => ({k: 'l', p, w}), Ee = (cx: number, cy: number, rx: number, ry: number): Part => ({k: 'e', c: [cx, cy, rx, ry]});
const shift = (ps: Part[], dx: number, dy: number): Part[] => ps.map((q) => q.k === 'e' ? Ee(q.c[0] + dx, q.c[1] + dy, q.c[2], q.c[3]) : q.k === 'p' ? Pp(q.p.map(([x, y]) => [x + dx, y + dy] as V2)) : Ll(q.p.map(([x, y]) => [x + dx, y + dy] as V2), q.w));
const paint = (ps: Part[], col: string, dx: number, dy: number) => ps.map((q, i) => q.k === 'p' ? <polygon key={i} points={pts(q.p.map(([x, y]) => [x + dx, y + dy] as V2))} fill={col} />
	: q.k === 'l' ? <polyline key={i} points={pts(q.p.map(([x, y]) => [x + dx, y + dy] as V2))} fill="none" stroke={col} strokeWidth={q.w} strokeLinecap="round" strokeLinejoin="round" />
	: <ellipse key={i} cx={q.c[0] + dx} cy={q.c[1] + dy} rx={q.c[2]} ry={q.c[3]} fill={col} />);
const Sil: React.FC<{parts: Part[]; x: number; y: number; s: number; flip?: boolean; rim?: V2; rimc?: string; dark?: string; children?: React.ReactNode}> = ({parts, x, y, s, flip = false, rim = [-4.6, -2.6], rimc = '#FFCB80', dark = '#211A17', children}) => {
	const fx = flip ? -1 : 1;
	return <g transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${fx * s},${s})`}>{paint(parts, rimc, fx * rim[0] / s, rim[1] / s)}{paint(parts, dark, 0, 0)}{children}</g>; };
const fan = (cx: number, cy: number, rIn: number, rOut: number, a0: number, a1: number, n: number): Part => {
	const R = (a: number) => a * Math.PI / 180, q: V2[] = [[cx + Math.cos(R(a0 - 6)) * 3, cy + Math.sin(R(a0 - 6)) * 3]];
	for (let i = 0; i < n; i++) { const a = R(a0 + (a1 - a0) * i / (n - 1)), h = R((a1 - a0) / (n - 1) / 2);
		q.push([cx + Math.cos(a - h) * rIn, cy + Math.sin(a - h) * rIn], [cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut], [cx + Math.cos(a + h) * rIn, cy + Math.sin(a + h) * rIn]); }
	q.push([cx + Math.cos(R(a1 + 6)) * 3, cy + Math.sin(R(a1 + 6)) * 3]); return Pp(q); };
/* legs that swing from the hips (angle a, radians; the second leg opposite), feet stay level */
const legs = (a: number, hips: V2[] = [[-4.5, -31], [4, -31]], len = 29, w = 5.2): Part[] => hips.flatMap(([hx, hy], i) => {
	const ai = i ? -a : a, ax = hx - len * Math.sin(ai), ay = hy + len * Math.cos(ai), kx = hx - len * .52 * Math.sin(ai) - 1.2, ky = hy + len * .52 * Math.cos(ai);
	return [Ll([[hx, hy], [kx, ky], [ax, ay]], w), Pp([[ax - 6, ay - 1.5], [ax + 2.5, ay - 1.5], [ax + 2.5, ay + 3], [ax - 6, ay + 3]])]; });
const HEAD = (hx = 0, hy = -82): Part[] => [Ee(hx, hy, 6, 7), Pp([[hx - 7, hy - 3], [hx + 6.6, hy - 3], [hx + 6.8, hy + .5], [hx - 7.2, hy + .5]]), Pp([[-3, -76], [3, -76], [3.5, -71], [-3.5, -71]]),
	Pp([[-9.5, -72], [9, -72], [11.5, -66], [12.5, -30], [-12, -30], [-11, -66]])];
/* hist_a attendant_parts without legs: a parasol bearer (pole_to) or hands together */
const attendant = (poleTo?: V2): Part[] => { const o = HEAD();
	if (poleTo) { const hand: V2 = [-9, -62], [px, py] = poleTo;
		o.push(Ll([[-6, -68], [-10, -60], hand], 5), Ll([[5, -68], [-2, -76], [-8, -80]], 5), Ll([[hand[0] + 2, hand[1] + 14], [px, py]], 2.4));
		const q: V2[] = [[px - 24, py + 1], [px - 15, py - 6], [px, py - 8.5], [px + 15, py - 6], [px + 24, py + 1]];
		for (let i = 0; i < 13; i++) q.push([px + 24 - 48 * i / 12 - (i % 2 ? 2 : 0), py + (i % 2 ? 6.5 : 2)]); o.push(Pp(q)); }
	else o.push(Ll([[-6, -68], [-9, -52], [-4, -46]], 5), Ll([[6, -68], [2, -52], [-3, -47]], 5));
	return o; };
const BEARER: Part[] = [...HEAD(), Ll([[-6, -69], [-13, -61], [-15, -75]], 5), Ll([[6, -69], [12, -61], [11, -75]], 5)];
/* the Sapa Inca seated on a stool (hist_a ruler_parts, upper body lowered onto the seat): feather fan, fringe, tunic, cloak, star staff */
const RULER_SEATED: Part[] = (() => { const up: Part[] = [fan(.5, -93, 9, 19, 200, 340, 9), Ee(0, -86, 6.5, 7.6), Pp([[-7.6, -90], [7.2, -90], [7.4, -85.5], [-7.8, -85.5]]),
	Pp([[-9.4, -86], [-5.6, -86], [-5.2, -79.5], [-8.8, -79.5]]), Pp([[-3.2, -80], [3.2, -80], [3.8, -75], [-3.8, -75]]),
	Pp([[-10.5, -76.5], [9.5, -76.5], [12.5, -70], [14, -30], [-13.5, -30], [-12.5, -70]]), Pp([[4, -77.5], [11, -76], [17, -62], [20.5, -40], [22, -26], [9, -26], [11, -50]]),
	Ll([[-9, -72], [-15.5, -58], [-22, -55]], 5.5), Ll([[-23, -66], [-23, -14]], 2.6),
	Pp(Array.from({length: 8}, (_, t) => [-23 + 5.5 * Math.cos(t * Math.PI / 4) * (t % 2 ? 1 : .45), -70 + 5.5 * Math.sin(t * Math.PI / 4) * (t % 2 ? 1 : .45)] as V2))];
	return [Pp([[-8, -16], [12, -16], [9, 0], [-5, 0]]), ...shift(up, 0, 16), Ll([[-3, -15], [-19, -14]], 6.5), Ll([[-19, -14], [-20, -3]], 5.6), Pp([[-26, -3.5], [-17, -3.5], [-17, .5], [-26, .5]])]; })();
const LITTER: Part[] = (() => { const can: V2[] = [[-50, -206], [50, -206], [64, -190]];
	for (let i = 0; i <= 16; i++) can.push([64 - 128 * i / 16, -190 + (i % 2 ? 7 : 0)]);
	return [Ll([[-48, -86], [-48, -190]], 3), Ll([[48, -86], [48, -190]], 3), Pp([[-56, -86], [56, -86], [56, -77], [-56, -77]]), Pp([[-54, -77], [54, -77], [50, -64], [-50, -64]]),
		Pp(can), fan(0, -206, 4, 13, 215, 325, 7)]; })();
const CARRIER: Part[] = [...HEAD(), Pp([[8, -76], [25, -75], [26, -42], [10, -43]]), Ll([[-5, -87], [3, -91], [12, -76]], 2.2), Ll([[-6, -69], [-12, -60], [-6, -74]], 5), Ll([[6, -69], [2, -58], [-4, -72]], 5)];
const BUILDER: Part[] = [...HEAD(-1, -80), Ll([[-6, -69], [-14, -82], [-16, -96]], 5), Ll([[6, -69], [-2, -84], [-6, -98]], 5), Pp([[-24, -112], [-2, -112], [-2, -96], [-24, -96]])];
const PLOUGHMAN: Part[] = [...HEAD(-2, -80), Ll([[-14, -70], [-31, 4]], 3.2), Ll([[-31, -12], [-22, -12]], 3), Ll([[-6, -68], [-12, -62], [-16, -66]], 5), Ll([[6, -68], [-2, -60], [-12, -56]], 5)];

/* ---------- clouds in the drawings' language: round billows merged into one scalloped outline ---------- */
type Cloud = {d: string; caps: string[]; id: string};
const mass = (id: string, seed: number, x0: number, x1: number, yc: (x: number) => number, rmin: number, rmax: number, flat = .55, base?: number, lift = .5): Cloud => {
	const R = mul(seed), cs: [number, number, number][] = [], env = (x: number) => Math.pow(Math.sin(Math.PI * cl((x - x0) / (x1 - x0))), .5);
	const ph = 6.28 * R(), clump = (x: number) => .62 + .38 * Math.abs(Math.sin((x - x0) / 150 + ph));
	for (let x = x0; x < x1;) { const e = base === undefined ? env(x) * clump(x) : 1, r = (rmin + (rmax - rmin) * R()) * (.3 + .7 * e); cs.push([x, yc(x) - lift * r * R(), r]); x += r * (.7 + .4 * R()); }
	const top: V2[] = [], bot: V2[] = [];
	for (let xi = x0 - rmax; xi <= x1 + rmax; xi += 4) { let a = Infinity, b = -Infinity;
		for (const [cx, cy, r] of cs) { const dx = xi - cx; if (Math.abs(dx) < r) { const h = Math.sqrt(r * r - dx * dx); a = Math.min(a, cy - h); b = Math.max(b, cy + h * flat); } }
		if (a < Infinity) { top.push([xi, a]); bot.push([xi, b]); } }
	const ring: V2[] = base === undefined ? [...top, ...bot.reverse()] : [...top, [top[top.length - 1][0], base], [top[0][0], base]];
	const caps = cs.filter(() => R() < .75).map(([cx, cy, r]) => `M${(cx - r * .82).toFixed(1)},${(cy - r * .2).toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${(cx + r * .25).toFixed(1)},${(cy - r * .97).toFixed(1)} A${(r * 1.25).toFixed(1)},${(r * 1.25).toFixed(1)} 0 0 0 ${(cx - r * .82).toFixed(1)},${(cy - r * .2).toFixed(1)} Z`);
	return {d: `M${pts(ring).replace(/ /g, ' L')} Z`, caps, id}; };
type CPal = {body: string; under: string; line: string; cap: string};
const SKYC: CPal = {body: '#F3F5F8', under: '#C3CCD8', line: '#7F8BA0', cap: '#FFFFFF'}, WARMC: CPal = {body: '#F7F2E9', under: '#D8D1C4', line: '#B3AC9F', cap: '#FFE9C2'};
const CloudG: React.FC<{c: Cloud; dx?: number; dy?: number; pal: CPal; k?: number; op?: number; sw?: number}> = ({c, dx = 0, dy = 0, pal, k = 16, op = 1, sw = 2}) =>
	<g transform={`translate(${dx.toFixed(2)},${dy.toFixed(2)})`} opacity={op}>
		<clipPath id={c.id}><path d={c.d} /></clipPath>
		<path d={c.d} fill={pal.under} />
		<g clipPath={`url(#${c.id})`}><path d={c.d} transform={`translate(0,${-k})`} fill={pal.body} />{c.caps.map((p, i) => <path key={i} d={p} fill={pal.cap} opacity={.8} />)}</g>
		<path d={c.d} fill="none" stroke={pal.line} strokeWidth={sw} strokeLinejoin="round" /></g>;

/* =====================================================================================================
   SHOT A · 山顶行宫
   ===================================================================================================== */
const TC = BAR;                                        // the crane lands (and the gauge reads 约2350米) on bar 2
const OFF = {back: 36, c1: 190, mid: 120, city: 290, c2: 400, near: 520, fore: 800};
const PUSH = {back: .01, c1: .03, mid: .022, city: .045, c2: .055, near: .07, fore: .07};
type LK = keyof typeof OFF;
const ANCH: V2 = [880, 720];
const craneU = (t: number) => Math.sin(Math.PI / 2 * cl(t / TC));
type Xf = {off: number; z: number};
const xf = (k: LK, t: number): Xf => ({off: OFF[k] * (1 - craneU(t)), z: 1 + PUSH[k] * sm((t - 1.2) / (SHOT - 1.2))});
const cssA = (f: Xf) => `translate(${(ANCH[0] * (1 - f.z)).toFixed(2)}px, ${(ANCH[1] * (1 - f.z) - f.z * f.off).toFixed(2)}px) scale(${f.z.toFixed(5)})`;
const mapA = (f: Xf, [x, y]: V2): V2 => [ANCH[0] + f.z * (x - ANCH[0]), ANCH[1] + f.z * (y - f.off - ANCH[1])];
const LayerA: React.FC<{f: Xf; h?: number; children: React.ReactNode}> = ({f, h = H, children}) =>
	<div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, transformOrigin: '0 0', transform: cssA(f)}}>{children}</div>;
const NH: number = D.NH;
const edgeY = (lv: number, x: number) => D.levels[lv].top + (x < 1330 ? 0 : (x - 1330) * .07);

/* clouds: wisps at mid-height (in front of the far ridges, behind the citadel), the valley's cloud sea, and the bank the camera rises out of */
const WISPS: [Cloud, number, number][] = [[mass('w1', 11, -260, 330, (x) => 500 + 8 * Math.sin(x / 90), 22, 46, .5, undefined, 1), 0, 20],
	[mass('w2', 12, 1240, 1760, (x) => 476 + 10 * Math.sin(x / 120), 24, 48, .5, undefined, 1), 0, 28], [mass('w3', 13, 640, 1010, (x) => 336 + 6 * Math.sin(x / 70), 16, 34, .5, undefined, 1), 0, 15],
	[mass('w4', 14, 1720, 2180, (x) => 560 + 8 * Math.sin(x / 80), 20, 40, .5, undefined, 1), 0, 24], [mass('w5', 15, 260, 560, (x) => 418 + 6 * Math.sin(x / 60), 14, 28, .5, undefined, 1), 0, 18]];
const VALLEY = mass('vs', 21, 1180, 2400, (x) => 1110 - 190 * sm((x - 1240) / 560) + 14 * Math.sin(x / 55), 24, 50, .55, 1700, .9);
const FORE = mass('fc', 31, -260, 2200, (x) => 1790 - 200 * Math.exp(-(((x - 260) / 230) ** 2)) - 170 * Math.exp(-(((x - 1640) / 250) ** 2)) + 14 * Math.sin(x / 70), 34, 70, .55, 2600, .7);
const FORE2 = mass('fc2', 32, 760, 1360, (x) => 1590 + 8 * Math.sin(x / 50), 20, 40, .5, undefined, .8);

const Smoke: React.FC<{t: number; x: number; y: number; ph: number}> = ({t, x, y, ph}) => {
	const o: React.ReactNode[] = [], LIFE = 2.6, EVERY = .26;
	for (let k = Math.floor((t - LIFE) / EVERY); k <= Math.floor(t / EVERY); k++) { const a = t - k * EVERY; if (a < 0 || a > LIFE) continue;
		const u = a / LIFE, cx = x + 34 * u * u + 3.5 * Math.sin(1.9 * a + ph + k * 1.7), cy = y - 44 * a, r = 3.5 + 8.5 * a;
		o.push(<circle key={k} cx={cx} cy={cy} r={r} fill="#F2EEE6" opacity={(.66 - .6 * u) * cl(a / .25)} />); }
	return <g>{o}</g>; };

/* the lower terraces: maize coming up on the treads, farmers, and the first terrace's wall being laid on the right */
const Maize: React.FC<{x: number; y: number; g: number; h: number; f: number}> = ({x, y, g, h, f}) => g <= 0 ? null :
	<g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(g * f).toFixed(3)},${g.toFixed(3)})`}>
		<polygon points={pts([[-1.6, 0], [1.6, 0], [1, -h], [-1, -h]])} fill="#5E7A2A" stroke={INK} strokeWidth={1.2} />
		<polygon points={pts([[0, -h * .3], [-h * .32, -h * .52], [-h * .5, -h * .46], [-h * .3, -h * .4]])} fill="#8FAE45" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
		<polygon points={pts([[0, -h * .55], [h * .3, -h * .78], [h * .46, -h * .72], [h * .26, -h * .64]])} fill="#7E9A3C" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
		<polygon points={pts([[0, -h * .16], [h * .26, -h * .3], [h * .38, -h * .25], [h * .2, -h * .2]])} fill="#8FAE45" stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
		<ellipse cx={-2.5} cy={-h * .5} rx={2.6} ry={5} fill="#E8C860" stroke={INK} strokeWidth={1} />
		<polygon points={pts([[0, -h], [-4, -h - 7], [0, -h - 4], [4, -h - 8]])} fill="#D9B85A" stroke={INK} strokeWidth={1} strokeLinejoin="round" /></g>;
const CROPS = (() => { const R = mul(404), o: {lv: number; x: number; h: number; f: number}[] = [];
	for (const [lv, x1] of [[0, 1300], [1, 1960]] as [number, number][]) for (let x = 14; x < x1; x += 30 + 8 * R()) { const h = 30 + 10 * R(), f = R() < .5 ? -1 : 1;
		if (lv === 0 && x > D.wall1_x[0] - 70 && x < D.wall1_x[1] + 70) continue; o.push({lv, x, h, f}); }
	return o; })();
const WALL1 = (() => { const R = mul(77), PAL = ['#7A6F5E', '#857A67', '#6E6454', '#8C806C'], rows: {x: number; w: number; y: number; c: string}[][] = [];
	for (let i = 0; i < 6; i++) { const r: {x: number; w: number; y: number; c: string}[] = [], [a, b] = D.wall1_gap[i], n = Math.max(1, Math.round((b - a) / 100));
		for (let j = 0; j < n; j++) { const x = a + (b - a) * j / n, w = (b - a) / n; r.push({x, w, y: edgeY(0, x + w / 2) + 32 + i * 25, c: PAL[Math.floor(R() * 4)]}); }
		rows.push(r); }
	return rows; })();
const Terraces: React.FC<{t: number}> = ({t}) => {
	const o: React.ReactNode[] = [];
	WALL1.forEach((row, i) => { const tr = (2 - i) * BEAT;                // rows 5–3 are laid; rows 2, 1, 0 go on beats 0, 1, 2
		row.forEach((b, j) => { const p = i >= 3 ? 1 : (t - tr - .85 * BEAT * j / row.length) / .2; if (p <= 0) return;
			o.push(<rect key={`w${i}_${j}`} x={b.x + 2} y={b.y - 20 * (1 - eo(p))} width={b.w - 4} height={21} rx={6} fill={b.c} stroke="#4E4538" strokeWidth={2} opacity={cl(p * 5)} />); }); });
	CROPS.forEach((c, i) => { const g = eo((t - (c.lv ? 0 : .15) - c.x / 1920 * .7) / .45); o.push(<Maize key={`m${i}`} x={c.x} y={edgeY(c.lv, c.x) + 27} g={g} h={c.h} f={c.f} />); });
	const g2 = (x: number) => edgeY(1, x) + 24;
	o.push(<Sil key="f1" parts={[...PLOUGHMAN, ...legs(.22)]} x={300} y={g2(300)} s={1.3} />);
	o.push(<Sil key="f2" parts={[...CARRIER, ...legs(.14)]} x={560} y={g2(560)} s={1.3} flip />);
	o.push(<Sil key="f3" parts={[...PLOUGHMAN, ...legs(.18)]} x={1310} y={g2(1310)} s={1.3} flip />);
	o.push(<Sil key="f4" parts={[...BUILDER, ...legs(.1)]} x={980} y={g2(980)} s={1.3} />);
	return <g>{o}</g>; };

/* the house built beside the procession: fitted-stone walls course by course with a trapezoid door, the gable,
   the rafters, three bands of ichu thatch on each slope, the ridge (hist_a roof_row's thatched A-frame, scaled up) */
const HX0 = 1112, HX1 = 1262, HYB = 930, HCH = 23, HYT = HYB - 4 * HCH, AP: V2 = [1187, 740], DV: V2 = [44, -40];
const doorL = (y: number) => 1170 + (HYB - y) / 69 * 4, doorR = (y: number) => 1204 - (HYB - y) / 69 * 4;
type Blk = {q: V2[]; c: string; t: number};
const HOUSE = (() => { const R = mul(9), LIT = ['#A89B83', '#9C8F78', '#B0A389', '#968A73'], SH = ['#625849', '#6B604F', '#5A5143'], GB = ['#B5A78D', '#A89B83', '#BCAE93'];
	const walls: Blk[] = [], gable: Blk[] = [];
	const split = (a: number, b: number) => { const n = Math.max(1, Math.round((b - a) / 30)), xs = [a]; for (let i = 1; i < n; i++) xs.push(a + (b - a) * (i + (R() - .5) * .5) / n); xs.push(b); return xs; };
	for (let c = 0; c < 4; c++) { const y0 = HYB - c * HCH, y1 = y0 - HCH, t0 = (2 + c) * BEAT; const row: {a: (y: number) => number; b: (y: number) => number}[] = [];
		const segs: [number, number][] = c < 3 ? [[HX0, -1], [-2, HX1]] : [[HX0, 1160], [1160, 1214], [1214, HX1]];
		segs.forEach(([a, b]) => { const fa = a === -2 ? doorR : () => a, fb = b === -1 ? doorL : () => b;
			if (c === 3 && a === 1160) { row.push({a: fa, b: fb}); return; }
			const xs = split(a === -2 ? doorR(y0) : a, b === -1 ? doorL(y0) : b);
			for (let i = 0; i < xs.length - 1; i++) { const A = i === 0 ? fa : () => xs[i], B = i === xs.length - 2 ? fb : () => xs[i + 1]; row.push({a: A, b: B}); } });
		row.forEach((r, i) => walls.push({q: [[r.a(y0), y0], [r.b(y0), y0], [r.b(y1), y1], [r.a(y1), y1]], c: LIT[Math.floor(R() * 4)], t: t0 + .7 * BEAT * i / row.length}));
		const sx: V2 = [HX1, y0], sx1: V2 = [HX1, y1];                      // the side wall going back
		walls.push({q: [sx, add(sx, DV, .5), add(sx1, DV, .5), sx1], c: SH[Math.floor(R() * 3)], t: t0 + .55 * BEAT});
		walls.push({q: [add(sx, DV, .5), add(sx, DV), add(sx1, DV), add(sx1, DV, .5)], c: SH[Math.floor(R() * 3)], t: t0 + .65 * BEAT}); }
	const gl = (y: number) => HX0 + (HYT - y) * (AP[0] - HX0) / (HYT - AP[1]), gr = (y: number) => HX1 - (HYT - y) * (HX1 - AP[0]) / (HYT - AP[1]);
	for (let k = 0; k < 3; k++) { const y0 = HYT - k * (HYT - AP[1]) / 3, y1 = HYT - (k + 1) * (HYT - AP[1]) / 3, xs = split(gl(y0), gr(y0)).slice(0, k === 2 ? 2 : undefined);
		if (k === 2) gable.push({q: [[gl(y0), y0], [gr(y0), y0], AP], c: GB[0], t: 6 * BEAT + .5 * BEAT});
		else for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], b = xs[i + 1], ta = (a - gl(y0)) / (gr(y0) - gl(y0)), tb = (b - gl(y0)) / (gr(y0) - gl(y0));
			gable.push({q: [[a, y0], [b, y0], [gl(y1) + (gr(y1) - gl(y1)) * tb, y1], [gl(y1) + (gr(y1) - gl(y1)) * ta, y1]], c: GB[Math.floor(R() * 3)], t: 6 * BEAT + (k * .25 + .2 * i / xs.length) * BEAT}); } }
	return {walls, gable}; })();
const LE = lerp(AP, [HX0, HYT], 1.16), RE = lerp(AP, [HX1, HYT], 1.16), DVR: V2 = [DV[0] * 1.12, DV[1] * 1.12], FWD: V2 = [-DV[0] * .1, -DV[1] * .1];
const House: React.FC<{t: number}> = ({t}) => {
	const o: React.ReactNode[] = [], drop = (t0: number, h = 22, d = .2) => { const p = (t - t0) / d; return p <= 0 ? null : {dy: -h * (1 - eo(p)), op: cl(p * 5)}; };
	const wallTop = HYB - HCH * cl(Math.floor((t - 2 * BEAT) / BEAT + .7) + 0, 0, 4);
	const dTop = Math.max(wallTop, HYB - 69);
	if (t > 2 * BEAT) o.push(<polygon key="door" points={pts([[doorL(HYB), HYB], [doorR(HYB), HYB], [doorR(dTop), dTop], [doorL(dTop), dTop]])} fill="#3B342C" />);
	// thatch first (it is behind the front gable), then walls and gable
	const band = (side: number, k: number) => { const E = side > 0 ? RE : LE, a = add(lerp(E, AP, k / 3), FWD), b = add(lerp(E, AP, Math.min(1, (k + 1) / 3 + .05)), FWD);
		return [a, b, add(b, DVR), add(a, DVR)] as V2[]; };
	const rafter = (from: V2, to: V2, t0: number, key: string) => { const p = eo((t - t0) / .22); if (p <= 0) return; const e = lerp(from, to, p);
		o.push(<line key={key} x1={from[0]} y1={from[1]} x2={e[0]} y2={e[1]} stroke={INK} strokeWidth={6} strokeLinecap="round" />, <line key={key + 'w'} x1={from[0]} y1={from[1]} x2={e[0]} y2={e[1]} stroke="#7A5A3A" strokeWidth={3.4} strokeLinecap="round" />); };
	const tr = 7 * BEAT;
	rafter(add(AP, DVR), add(LE, DVR), tr + .06, 'r0'); rafter(add(AP, DVR), add(RE, DVR), tr + .1, 'r1'); rafter(AP, add(AP, DVR), tr, 'rr');
	rafter(add(AP, DVR, .5), add(RE, DVR, .5), tr + .14, 'r2'); rafter(AP, LE, tr + .04, 'r3'); rafter(AP, RE, tr + .08, 'r4');
	const LITC = ['#CDB273', '#D6BC7C', '#C3A66A'], SHC = ['#A9894D', '#B39552', '#9C7E46'];
	for (const side of [-1, 1]) for (let k = 0; k < 3; k++) { const dd = drop((8 + k) * BEAT + (side > 0 ? .08 : 0), 16, .22); if (!dd) continue; const q = band(side, k);
		o.push(<g key={`th${side}${k}`} transform={`translate(0,${dd.dy.toFixed(2)})`} opacity={dd.op}>
			<polygon points={pts(q)} fill={(side > 0 ? SHC : LITC)[k]} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
			{[.2, .42, .64, .86].map((f) => { const a = lerp(q[0], q[3], f), b = lerp(q[1], q[2], f); return <line key={f} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={side > 0 ? '#7A5F34' : '#A8894E'} strokeWidth={1.6} />; })}
			<line x1={q[0][0]} y1={q[0][1] + 3} x2={q[3][0]} y2={q[3][1] + 3} stroke={side > 0 ? '#7A5F34' : '#A8894E'} strokeWidth={2.4} /></g>); }
	const ridge = drop(11 * BEAT, 12, .2);
	if (ridge) { const a = add(AP, FWD, 1.3), b = add(add(AP, DVR), [-FWD[0], -FWD[1]], .6);
		o.push(<g key="ridge" transform={`translate(0,${ridge.dy})`} opacity={ridge.op}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={13} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8A6E3C" strokeWidth={8} strokeLinecap="round" /></g>); }
	for (const b of [...HOUSE.walls, ...HOUSE.gable]) { const dd = drop(b.t); if (!dd) continue;
		o.push(<polygon key={`b${b.t.toFixed(4)}${b.q[0][0].toFixed(1)}${b.q[0][1]}`} points={pts(b.q.map(([x, y]) => [x, y + dd.dy] as V2))} fill={b.c} stroke="#4E4538" strokeWidth={2} strokeLinejoin="round" opacity={dd.op} />); }
	// the stone pile shrinks as the courses go up, the straw pile as the thatch goes on
	const stones = Math.round(5 * (1 - cl((t - 2 * BEAT) / (4 * BEAT)))), straw = Math.round(3 * (1 - cl((t - 8 * BEAT) / (3 * BEAT))));
	for (let i = 0; i < stones; i++) o.push(<rect key={`s${i}`} x={1074 + (i % 3) * 13 - (i > 2 ? -6 : 0)} y={i > 2 ? 916 : 926} width={14} height={10} rx={3} fill="#9C8F78" stroke="#4E4538" strokeWidth={1.5} />);
	for (let i = 0; i < straw; i++) o.push(<g key={`st${i}`}><ellipse cx={1290 + i * 10} cy={930 - (i === 2 ? 9 : 0)} rx={12} ry={6} fill="#CDB273" stroke={INK} strokeWidth={1.6} /><line x1={1280 + i * 10} y1={930 - (i === 2 ? 9 : 0)} x2={1300 + i * 10} y2={928 - (i === 2 ? 9 : 0)} stroke="#A8894E" strokeWidth={1.4} /></g>);
	return <g>{o}</g>; };

/* the procession: four bearers carry the litter with the seated Inca under its feathered canopy, a parasol bearer
   and an attendant follow. They walk in from the left and halt on bar 3; legs swing from the hips, bodies stay level */
const PS = 1.45, PY = 926, PSTOP = 780, PDIST = 330;
const procX = (t: number) => PSTOP - PDIST * Math.pow(1 - cl(t / (2 * BAR)), 1.6);
const Procession: React.FC<{t: number}> = ({t}) => {
	const u = cl(t / (2 * BAR)), x = procX(t), d = PDIST - PDIST * Math.pow(1 - u, 1.6), v = Math.pow(1 - u, .6);
	const ph = 2 * Math.PI * d / 62, amp = .27 * v;
	const fig = (parts: Part[], lx: number, off: number, key: string, extra: Part[] = []) =>
		<Sil key={key} parts={[...parts, ...legs(amp * Math.sin(ph + off)), ...extra]} x={x - PS * lx} y={PY} s={PS} flip />;
	return <g>
		{fig(attendant(), 258, 2.1, 'att')}
		{fig(attendant([-14, -150]), 198, 1.3, 'par')}
		{fig(BEARER, 118, .6 + Math.PI, 'rb2')}
		{fig(BEARER, -100, Math.PI, 'fb2')}
		<Sil parts={LITTER} x={x} y={PY} s={PS} flip />
		<Sil parts={shift(RULER_SEATED, 2, -86)} x={x} y={PY} s={PS} flip />
		<Sil parts={[Ll([[-134, -74], [134, -74]], 5)]} x={x} y={PY} s={PS} flip />
		{fig(BEARER, 104, .6, 'rb1')}
		{fig(BEARER, -112, 0, 'fb1')}
	</g>; };

const ShotA: React.FC<{t: number}> = ({t}) => {
	const F = {back: xf('back', t), c1: xf('c1', t), mid: xf('mid', t), city: xf('city', t), c2: xf('c2', t), near: xf('near', t), fore: xf('fore', t)};
	const u = craneU(t), alt = 2350 * u, landed = t >= TC, pu = (t - TC) / .35;
	const GY = (m: number) => 920 - m * .132, my = GY(alt);
	const ticks: React.ReactNode[] = [];
	for (let mm = 0; mm <= 2500; mm += 250) { const y = GY(mm), big = mm % 500 === 0;
		ticks.push(<line key={mm} x1={1566} x2={1566 - (big ? 16 : 9)} y1={y} y2={y} stroke={CREAM} strokeWidth={2.5} opacity={.8} />);
		if (big) ticks.push(<T2 key={`l${mm}`} x={1544} y={y + 8} s={String(mm)} size={22} col="#CFC3AE" anchor="end" w={700} />); }
	const lvl = mapA(F.city, [1215, 610]), lu = eo((t - TC) / .35), lx = 1476 + (lvl[0] - 1476) * lu;
	const head = mapA(F.near, [procX(t) - PS * 1, PY - PS * (86 + 36)]);
	return <AbsoluteFill style={{background: '#6A9BD2'}}>
		<LayerA f={F.back}><Img src={staticFile('ep57/machu/a_back.svg')} style={{position: 'absolute', width: W, height: H}} /></LayerA>
		<LayerA f={F.mid}><Img src={staticFile('ep57/machu/a_mid.svg')} style={{position: 'absolute', width: W, height: H}} /></LayerA>
		<LayerA f={F.c1}><svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
			{WISPS.map(([c, x0, v]) => <CloudG key={c.id} c={c} dx={x0 + v * t} pal={SKYC} k={13} op={.95} />)}</svg></LayerA>
		<LayerA f={F.city}><Img src={staticFile('ep57/machu/a_city.svg')} style={{position: 'absolute', width: W, height: H}} />
			<svg width={W} height={H} style={{position: 'absolute'}}>{D.smoke.map(([x, y]: number[], i: number) => <Smoke key={i} t={t} x={x} y={y - 12} ph={i * 2.1} />)}</svg></LayerA>
		<LayerA f={F.c2}><svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}><CloudG c={VALLEY} dx={-14 * t} pal={SKYC} k={22} /></svg></LayerA>
		<LayerA f={F.near} h={NH}><Img src={staticFile('ep57/machu/a_near.svg')} style={{position: 'absolute', width: W, height: NH}} />
			<svg width={W} height={NH} style={{position: 'absolute'}}><Terraces t={t} /><House t={t} />
				<Sil parts={[...CARRIER, ...legs(.12)]} x={1066} y={932} s={1.36} flip />
				<Procession t={t} /></svg></LayerA>
		<LayerA f={F.fore}><svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}><CloudG c={FORE2} dx={30 * t} pal={SKYC} k={14} /><CloudG c={FORE} dx={-20 * t} pal={SKYC} k={30} sw={2.5} /></svg></LayerA>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{landed && <g><line x1={1476} y1={610} x2={lx} y2={lvl[1]} stroke={CREAM} strokeWidth={3} strokeDasharray="10 9" opacity={.9} />
				{lu >= 1 && <circle cx={lvl[0]} cy={lvl[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />}</g>}
			<Callout from={head} to={[650, 548]} label="帕查库特克" u={(t - 2 * BAR) / .6} side={-1} />
			<Widget x={1460} y={160} w={370} h={150} op={sm((t - 2 * BEAT) / .3)}>
				<T2 x={1488} y={210} s="皇家行宫" size={32} col={GOLD} />
				<T2 x={1488} y={282} s="约 1450 年" size={52} />
			</Widget>
			<Widget x={1476} y={488} w={350} h={450} op={sm(t / .3)}>
				<T2 x={1500} y={538} s="海拔" size={32} col={GOLD} />
				<rect x={1572} y={GY(2500)} width={12} height={920 - GY(2500)} rx={6} fill="rgba(255,246,230,.18)" />
				<rect x={1572} y={my} width={12} height={920 - my} rx={6} fill={GOLD} />
				{ticks}
				<polygon points={`1590,${my} 1604,${my - 9} 1604,${my + 9}`} fill={GOLD} />
				<g transform={`translate(1612,${my + 14}) scale(${landed ? 1.2 - .2 * back(pu) : 1})`}>
					<T2 x={0} y={0} s={landed ? '约2350米' : `${Math.round(alt / 10) * 10} 米`} size={40} col={landed ? GOLD : CREAM} /></g>
			</Widget>
		</svg>
	</AbsoluteFill>; };

/* =====================================================================================================
   SHOT B · 没找到它
   ===================================================================================================== */
const MG: number = D.MG;
const BRATE = {sky: 0, far: .12, city: .3, mass: .36, sea: .45, valley: .8, near: 1};
type BK = keyof typeof BRATE;
type Bf = {dx: number; z: number};
const bxf = (k: BK, t: number): Bf => ({dx: 70 * BRATE[k] * t / SHOT, z: 1 + .045 * t / SHOT});
const cssB = (f: Bf) => `translate(${(960 * (1 - f.z) + f.z * f.dx).toFixed(2)}px, ${(540 * (1 - f.z)).toFixed(2)}px) scale(${f.z.toFixed(5)})`;
const mapB = (f: Bf, [x, y]: V2): V2 => [960 + f.z * (x + f.dx - 960), 540 + f.z * (y - 540)];
const LayerB: React.FC<{f: Bf; src?: string; children?: React.ReactNode}> = ({f, src, children}) =>
	<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: cssB(f)}}>
		{src && <Img src={staticFile(`ep57/machu/${src}.svg`)} style={{position: 'absolute', left: -MG, top: -MG, width: W + 2 * MG, height: H + 2 * MG}} />}{children}</div>;
const morion = (cx: number, cy: number): Part => Pp(([[-12, -5], [-9, -1], [-4, .5], [4, .5], [9, -1], [12, -5], [8, -3], [5, -3.5], [5, -7], [3, -10.5], [0, -13], [-3, -10.5], [-5, -7], [-5, -3.5], [-8, -3]] as V2[]).map(([x, y]) => [cx + x, cy + y] as V2));
const lance = (a: V2, b: V2, w = 2.2): Part[] => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
	return [Ll([a, b], w), Pp([[b[0] + nx * 2.4 + ux * 3, b[1] + ny * 2.4 + uy * 3], [b[0] + ux * 11, b[1] + uy * 11], [b[0] - nx * 2.4 + ux * 3, b[1] - ny * 2.4 + uy * 3], b])]; };
const soldier = (step: number): Part[] => { const k = step % 2 ? 1 : -1;
	return [morion(0, -60), Ee(-.5, -55.5, 4.6, 5.4), Pp([[-5, -54], [-3.5, -49.5], [1, -51]]), Pp([[-6, -51], [6, -51], [7.5, -44], [5, -37], [-6, -37], [-9.5, -41.5], [-8, -47]]), Pp([[4, -51.5], [9.5, -49], [12.5, -38], [6, -37]]),
		Pp([[-7.5, -38.5], [7, -38.5], [9.5, -31.5], [6, -27], [-6, -27], [-9.5, -31.5]]), Ll([[-3, -29], [-5 - 2 * k, -14], [-9 - 3 * k, -1]], 4), Ll([[3, -29], [4 + k, -14], [7 + 2 * k, -1]], 4),
		Pp([[-14 - 3 * k, -3], [-6 - 3 * k, -3], [-6 - 3 * k, 1], [-14 - 3 * k, 1]]), Pp([[3 + 2 * k, -3], [11 + 2 * k, -3], [11 + 2 * k, 1], [3 + 2 * k, 1]]), Ll([[-3, -49], [-8, -42], [-11.5, -40]], 3.8), ...lance([-10, -6], [-17.5, -128])]; };
const rider = (step: number): Part[] => { const k = step % 2 ? 1 : -1;
	return [Pp([[-22, -54], [-8, -57], [12, -56], [24, -52], [27, -44], [24, -35], [12, -32], [-14, -32], [-23, -38], [-25, -46]]), Pp([[-17, -52], [-26, -66], [-31, -74], [-36, -76], [-47, -64], [-45, -59.5], [-37, -61], [-30, -58], [-21, -44]]),
		Pp([[-32, -74], [-31, -81], [-28.5, -74]]), Pp([[-24, -66], [-31, -76.5], [-26, -78], [-18, -60]]), Pp([[24, -53], [31, -47], [33, -32], [29, -29], [26, -44]]),
		Ll([[-18, -36], [-20 - 2 * k, -18], [-22 - 3 * k, 0]], 4.6), Ll([[-12, -36], [-8 + k, -20], [-11 + 2 * k, -2]], 4.6), Ll([[15, -38], [20, -21], [17 - 2 * k, 0]], 5), Ll([[20, -38], [24, -22], [27 + 2 * k, -3]], 5),
		morion(1, -91), Ee(.5, -86.5, 4.6, 5.4), Pp([[-4, -85], [-2.5, -80.5], [2, -82]]), Pp([[-5, -82], [6, -82], [8, -66], [-4, -63], [-8, -72]]), Pp([[4, -82.5], [10, -79], [14, -64], [7, -63]]),
		Ll([[1, -63], [-4, -50], [-2, -38]], 5.2), Ll([[-2, -79], [-7, -70], [-10.5, -68]], 3.8), Pp([[-12, -58], [14, -58], [12, -53], [-11, -53]]), ...lance([-9, -50], [-16, -168])]; };
const colX = (t: number) => 150 - 62 * t;
const groundB = (xb: number) => 941 - (xb - 760) * .0105;
const REEDS = (() => { const R = mul(31), o: {x: number; h: number; c: string}[] = []; for (let x = 380; x < 2000; x += 7 + 16 * R()) if (R() < .55) o.push({x, h: 8 + 8 * R(), c: R() < .5 ? '#3E4A36' : '#55644A'}); return o; })();
/* the Spanish flag (Cross of Burgundy) on one pikeman's lance, streaming back, a slow wave along its free edge */
const Flag: React.FC<{t: number}> = ({t}) => { const P = (fx: number, fy: number): V2 => [-17 + 34 * fx, -124 + 22 * fy + 2.4 * fx * Math.sin(2 * Math.PI * t / BAR * 1.0 - fx * 2.4)];
	const q: V2[] = [P(0, 0), P(.25, 0), P(.5, 0), P(.75, 0), P(1, 0), P(1, 1), P(.75, 1), P(.5, 1), P(.25, 1), P(0, 1)];
	return <g><polygon points={pts(q)} fill="#F4EFE4" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
		<polyline points={pts([P(.06, .08), P(.5, .5), P(.94, .92)])} fill="none" stroke="#B0302A" strokeWidth={3.6} /><polyline points={pts([P(.06, .92), P(.5, .5), P(.94, .08)])} fill="none" stroke="#B0302A" strokeWidth={3.6} /></g>; };
/* a heap of the cloud sea rolling over the city (its foot stays inside the sea), and a puff passing Huayna Picchu's summit */
const BMASS = mass('bm', 41, -300, 300, (x) => 540 - 225 * Math.pow(Math.cos(Math.PI / 2 * cl(Math.abs(x) / 300)), .8) + 8 * Math.sin(x / 37), 22, 46, .55, 560, .8);
const BMASS2 = mass('bm2', 42, -170, 170, (x) => 236 + 5 * Math.sin(x / 30), 14, 28, .5, undefined, 1);
const ShotB: React.FC<{t: number}> = ({t}) => {
	const F = {sky: bxf('sky', t), far: bxf('far', t), city: bxf('city', t), mass: bxf('mass', t), sea: bxf('sea', t), valley: bxf('valley', t), near: bxf('near', t)};
	const cx = colX(t), figs = D.column.map((f: any) => { const xb = f.x - (f.k === 'r' ? 28 : 0) + cx; return {...f, X: f.x + cx, Y: groundB(xb)}; });
	const headOf = (f: any): V2 => mapB(F.valley, [f.X + (f.k === 'r' ? 1 : -1), f.Y - (f.k === 'r' ? 92 : 58) * 1.08]);
	const target = mapB(F.city, [1340, 318]);
	const sight = ([[0, 2], [5, 3], [4, 4]] as [number, number][]).map(([fi, b], i) => { const a = headOf(figs[fi]), x = a[0] + (target[0] - a[0]) * .4,
		yh = mapB(F.sea, [x, 694 + 14 * Math.sin(x / 150)])[1], s = (a[1] - yh) / (a[1] - target[1]), hit = lerp(a, target, s), p = eo((t - b * BEAT) / .28), e = lerp(a, hit, p), xp = back((t - b * BEAT - .22) / .3);
		return <g key={i} opacity={1 - .35 * cl((t - b * BEAT - 1.2) / .6)}>{p > 0 && <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={GOLD} strokeWidth={3.5} strokeDasharray="12 9" />}
			{t > b * BEAT + .22 && <g transform={`translate(${hit[0].toFixed(1)},${hit[1].toFixed(1)}) scale(${xp.toFixed(3)})`}>
				<path d="M-11,-11 L11,11 M11,-11 L-11,11" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M-11,-11 L11,11 M11,-11 L-11,11" stroke="#E8644A" strokeWidth={5} strokeLinecap="round" /></g>}</g>; });
	const step = Math.min(8, Math.floor(t / BEAT + .001)), y1572 = 1532 + 5 * step, roll = eo((t - 10 * BEAT) / .4), year = t < 10 * BEAT ? y1572 : Math.round(1572 + (1911 - 1572) * roll);
	const punch = (t0: number) => { const p = (t - t0) / .3; return p > 0 && p < 1 ? 1.18 - .18 * back(p) : 1; };
	const YX = (y: number) => 1490 + (y - 1532) / (1911 - 1532) * 310, mx = YX(year);
	const mxc = 1880 - 220 * t;
	return <AbsoluteFill style={{background: '#7FA0CA'}}>
		<LayerB f={F.sky} src="b_sky" />
		<LayerB f={F.far} src="b_far" />
		<LayerB f={F.city} src="b_city" />
		<LayerB f={F.mass}><svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
			<CloudG c={BMASS2} dx={1980 - 110 * t} pal={WARMC} k={10} op={.96} sw={1.6} />
			<CloudG c={BMASS} dx={mxc} pal={WARMC} k={20} /></svg></LayerB>
		<LayerB f={F.sea} src="b_sea" />
		<LayerB f={F.valley} src="b_valley"><svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
			{figs.map((f: any, i: number) => f.k === 'r'
				? <Sil key={i} parts={rider(f.step)} x={f.X} y={f.Y} s={1.08} rim={[2.4, -1.8]} rimc="#E9B27A" />
				: <Sil key={i} parts={soldier(f.step)} x={f.X} y={f.Y} s={1.08} rim={[2.4, -1.8]} rimc="#E9B27A">{i === 3 && <Flag t={t} />}</Sil>)}
			{REEDS.map((r, i) => { const y = groundB(r.x) + 9; return <path key={i} d={`M${r.x - 5},${y} L${r.x - 3},${y - r.h * .7} L${r.x},${y} L${r.x + 1},${y - r.h} L${r.x + 3},${y} L${r.x + 6},${y - r.h * .6} L${r.x + 7},${y} Z`} fill={r.c} />; })}
		</svg></LayerB>
		<LayerB f={F.near} src="b_near" />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{sight}
			<Callout from={mapB(F.valley, [figs[0].X + 2, figs[0].Y - 72 * 1.08])} to={[700, 770]} label="西班牙征服者" u={(t - BEAT) / .6} side={-1} />
			<Callout from={mapB(F.city, [1430, 318])} to={[1690, 420]} label="马丘比丘" u={(t - 10 * BEAT) / .5} side={1} />
			<Widget x={1460} y={500} w={370} h={290} op={sm(t / .3)}>
				<T2 x={1486} y={546} s={t < 10 * BEAT ? '西班牙征服印加' : '才为外界所知'} size={30} col={GOLD} />
				<g transform={`translate(1486,620) scale(${(t < 10 * BEAT ? punch(step * BEAT) : punch(10 * BEAT)).toFixed(3)})`}><T2 x={0} y={0} s={`${year} 年`} size={62} col={step >= 8 && t < 10 * BEAT ? GOLD : CREAM} /></g>
				<rect x={1490} y={646} width={310} height={10} rx={5} fill="rgba(255,246,230,.16)" />
				<rect x={1490} y={646} width={Math.max(0, YX(Math.min(year, 1572)) - 1490)} height={10} rx={5} fill="#E07A4E" />
				{year > 1572 && <line x1={YX(1572)} y1={651} x2={mx} y2={651} stroke={CREAM} strokeWidth={3} strokeDasharray="6 6" />}
				<circle cx={mx} cy={651} r={9} fill={GOLD} stroke={INK} strokeWidth={2} />
				<T2 x={1490} y={686} s="1532–1572" size={22} col="#CFC3AE" w={700} />
				<T2 x={1800} y={686} s="1911" size={22} col={year >= 1911 ? GOLD : '#CFC3AE'} anchor="end" w={700} />
				{t >= 8 * BEAT && <g opacity={sm((t - 8 * BEAT) / .25)}><T2 x={1486} y={746} s="西班牙记录里没有它" size={28} col={CREAM} /></g>}
			</Widget>
			{t > 3 * BEAT + .25 && (() => { const a = headOf(figs[5]), x = a[0] + (target[0] - a[0]) * .4, yh = mapB(F.sea, [x, 694 + 14 * Math.sin(x / 150)])[1], s = (a[1] - yh) / (a[1] - target[1]), hit = lerp(a, target, s);
				const o = sm((t - 3 * BEAT - .25) / .25); return <g opacity={o}><rect x={hit[0] + 22} y={hit[1] - 26} width={124} height={46} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} /><T2 x={hit[0] + 84} y={hit[1] + 8} s="看不见" size={28} col={GOLD} anchor="middle" /></g>; })()}
		</svg>
	</AbsoluteFill>; };

const Scene: React.FC = () => {
	const f = useCurrentFrame(), n1 = Math.round(SHOT * FPS);
	return f < n1 ? <ShotA t={f / FPS} /> : <ShotB t={(f - n1) / FPS} />;
};
registerRoot(() => <Composition id="Q57MACHU" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />);
