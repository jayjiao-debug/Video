import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
/* ep57 · 奇琴伊察 history, built live in Remotion in the episode's look (flat colour + ink line, like the history drawings):
   El Castillo is the 3D model from tools/hist_a.py (real proportions), projected every frame by a pinhole camera.
   Shot 1 「石头日历」: the camera descends and circles while the pyramid is built — terraces rise 2 per beat, the four
   stairs climb tread by tread counting to 91, the dial's 365 days light with the count, the temple (+1), 「= 365」.
   Shot 2 「春分蛇影」: low from the north-west, the sun sinks, the light triangles form down the balustrade one per beat,
   the serpent head catches the light.   Each shot 5.016 s = 3 bars at 143.6 BPM (t = 0 on a downbeat, beat 0.418 s). */
const W = 1920, H = 1080, FPS = 30, SHOT = 5.016, BEAT = 0.418, INK = '#2A211B', GOLD = '#F2C66E';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
type V3 = [number, number, number]; type V2 = [number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.sqrt(dot(a, a)); return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
class Cam { C: V3; F: V3; R: V3; U: V3; f: number; c: V2;
	constructor(pos: V3, look: V3, f: number, c: V2) { this.C = pos; this.F = norm(sub(look, pos)); this.R = norm(cross(this.F, [0, 0, 1])); this.U = cross(this.R, this.F); this.f = f; this.c = c; }
	p(P: V3): V2 { const v = sub(P, this.C), d = dot(v, this.F); return [this.c[0] + this.f * dot(v, this.R) / d, this.c[1] - this.f * dot(v, this.U) / d]; }
	sees(P: V3, n: V3) { return dot(n, sub(this.C, P)) > 0; } }
const pts = (ps: V2[]) => ps.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
const Poly: React.FC<{cam: Cam; P: V3[]; fill: string; stroke?: string; sw?: number; op?: number}> = ({cam, P, fill, stroke = INK, sw = 2.5, op}) =>
	<polygon points={pts(P.map((q) => cam.p(q)))} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" opacity={op} />;
const Line: React.FC<{cam: Cam; P: V3[]; stroke?: string; sw?: number; op?: number; dash?: string}> = ({cam, P, stroke = INK, sw = 2, op, dash}) =>
	<polyline points={pts(P.map((q) => cam.p(q)))} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity={op} strokeDasharray={dash} />;

/* ---------- El Castillo (metres; hist_a.py) ---------- */
const S0 = 27.65, SP = 9.8, ZT = 24.0, NT = 9, HT = ZT / NT, BAT = .4, DS = (S0 - SP - BAT) / 8;
const WS = 4.4, BW = .95, BH = .8, RF = 33.0, TQ = 6.4, TZ = 6.0;
const SIDES: Record<string, [number, number]> = {S: [0, -1], E: [1, 0], N: [0, 1], W: [-1, 0]};
const sb = (k: number) => S0 - DS * k, st = (k: number) => sb(k) - BAT, zk = (k: number) => HT * k;
const P3 = (side: string, r: number, u: number, z: number): V3 => { const [nx, ny] = SIDES[side]; return [nx * r - ny * u, ny * r + nx * u, z]; };
const zr = (r: number) => ZT * (RF - r) / (RF - SP), rz = (z: number) => RF - (RF - SP) * z / ZT;
const PROFILE: [number, number][] = [[sb(0), 0]];
for (let k = 0; k < NT; k++) { PROFILE.push([st(k), zk(k + 1)]); if (k < NT - 1) PROFILE.push([sb(k + 1), zk(k + 1)]); }
const wallN = (side: string): V3 => { const [nx, ny] = SIDES[side]; return norm([nx * HT, ny * HT, BAT]); };

const TerraceWall: React.FC<{cam: Cam; side: string; k: number; c: [string, string, string]; dz?: number}> = ({cam, side, k, c, dz = 0}) => {
	const a0 = sb(k), a1 = st(k), b0 = zk(k) + dz, b1 = zk(k + 1) + dz;
	const at = (t: number, d: number) => lerp3(P3(side, a1, -a1 + 2 * a1 * t, b1), P3(side, a0, -a0 + 2 * a0 * t, b0), d);
	const n = Math.max(4, Math.floor(2 * a0 / 3.2)), joints: React.ReactNode[] = [];
	for (let j = 1; j < n; j++) { const t = j / n, u = -a0 + 2 * a0 * t; if (Math.abs(u) < WS + .6) continue; joints.push(<Line key={j} cam={cam} P={[at(t, .17), at(t, .44)]} stroke={c[2]} sw={1.4} op={.6} />); }
	return <g><Poly cam={cam} P={[at(0, 1), at(1, 1), at(1, 0), at(0, 0)]} fill={c[0]} />
		<Poly cam={cam} P={[at(0, 0), at(1, 0), at(1, .17), at(0, .17)]} fill={c[1]} stroke="none" sw={0} />
		<Line cam={cam} P={[at(0, .44), at(1, .44)]} stroke={c[2]} sw={1.6} op={.8} />{joints}
		<Poly cam={cam} P={[at(0, 1), at(1, 1), at(1, 0), at(0, 0)]} fill="none" /></g>;
};
const TerraceTop: React.FC<{cam: Cam; k: number; col: string; dz?: number}> = ({cam, k, col, dz = 0}) => { const q = st(k), z = zk(k + 1) + dz;
	return <Poly cam={cam} P={[[-q, -q, z], [q, -q, z], [q, q, z], [-q, q, z]]} fill={col} />; };
type SC = {ramp: string; tread: string; top: string; out_p: string; out_m: string; end: string; in: string};
/* a staircase; `upto` (0–1) builds it from the foot: ramp, treads and balustrades only as far as they are laid */
const Stair: React.FC<{cam: Cam; side: string; c: SC; step?: number; upto?: number; light?: React.ReactNode}> = ({cam, side, c, step = 2, upto = 1, light}) => {
	const ui = WS - BW, zt = ZT * upto, rt = rz(zt), o: React.ReactNode[] = [];
	if (upto <= 0) return null;
	([[1, 'out_p'], [-1, 'out_m']] as [number, keyof SC][]).forEach(([sgn, key]) => { const [nx, ny] = SIDES[side], tn: V3 = [-ny * sgn, nx * sgn, 0];
		if (!cam.sees(P3(side, (RF + SP) / 2, sgn * WS, 6), tn)) return;
		const prof = PROFILE.filter(([r, z]) => z <= zt + .01);
		const rzz: [number, number][] = [[RF, 0], ...prof, [Math.max(SP, rt), Math.min(zt, ZT) + BH], [RF, BH]];
		o.push(<Poly key={key} cam={cam} P={rzz.map(([r, z]) => P3(side, r, sgn * WS, z))} fill={c[key]} />);
		if (light && key === 'out_p') o.push(<g key="light">{light}</g>); });
	o.push(<Poly key="ramp" cam={cam} P={[P3(side, RF, -ui, 0), P3(side, RF, ui, 0), P3(side, rt, ui, zt), P3(side, rt, -ui, zt)]} fill={c.ramp} />);
	for (let i = step; i < 91; i += step) { const z = ZT * i / 91; if (z > zt) break; const r = rz(z);
		o.push(<Line key={`t${i}`} cam={cam} P={[P3(side, r, -ui, z), P3(side, r, ui, z)]} stroke={c.tread} sw={i % (step * 2) ? 1.6 : 2.2} />); }
	for (const sgn of [1, -1]) { const [nx, ny] = SIDES[side], tn: V3 = [ny * sgn, -nx * sgn, 0];
		if (cam.sees(P3(side, (RF + SP) / 2, sgn * ui, 6), tn)) o.push(<Poly key={`in${sgn}`} cam={cam} P={[P3(side, RF, sgn * ui, 0), P3(side, rt, sgn * ui, zt), P3(side, rt, sgn * ui, zt + BH), P3(side, RF, sgn * ui, BH)]} fill={c.in} sw={1.8} />);
		o.push(<Poly key={`top${sgn}`} cam={cam} P={[P3(side, RF, sgn * ui, BH), P3(side, RF, sgn * WS, BH), P3(side, rt, sgn * WS, zt + BH), P3(side, rt, sgn * ui, zt + BH)]} fill={c.top} />); }
	return <g>{o}</g>;
};
type TC = Record<string, any>;
const Temple: React.FC<{cam: Cam; c: TC; dz?: number; op?: number}> = ({cam, c, dz = 0, op = 1}) => {
	const z0 = ZT + dz, o: React.ReactNode[] = [];
	for (const side of Object.keys(SIDES)) { const [nx, ny] = SIDES[side]; if (!cam.sees(P3(side, TQ, 0, z0 + 3), [nx, ny, 0])) continue; const col = c[side];
		o.push(<Poly key={`w${side}`} cam={cam} P={[P3(side, TQ, -TQ, z0), P3(side, TQ, TQ, z0), P3(side, TQ, TQ, z0 + 3.6), P3(side, TQ, -TQ, z0 + 3.6)]} fill={col.wall} />);
		const doors = side === 'N' ? [[-2.6, -1.6], [-.7, .7], [1.6, 2.6]] : [[-.8, .8]];
		doors.forEach(([u0, u1], i) => o.push(<Poly key={`d${side}${i}`} cam={cam} P={[P3(side, TQ, u0, z0), P3(side, TQ, u1, z0), P3(side, TQ, u1, z0 + 2.6), P3(side, TQ, u0, z0 + 2.6)]} fill={c.door} sw={2} />));
		o.push(<Poly key={`c${side}`} cam={cam} P={[P3(side, TQ + .25, -TQ - .25, z0 + 3.6), P3(side, TQ + .25, TQ + .25, z0 + 3.6), P3(side, TQ + .25, TQ + .25, z0 + 4), P3(side, TQ + .25, -TQ - .25, z0 + 4)]} fill={col.corn} sw={2} />);
		o.push(<Poly key={`f${side}`} cam={cam} P={[P3(side, TQ, -TQ, z0 + 4), P3(side, TQ, TQ, z0 + 4), P3(side, TQ, TQ, z0 + 5.5), P3(side, TQ, -TQ, z0 + 5.5)]} fill={col.frieze} sw={2} />);
		o.push(<Poly key={`k${side}`} cam={cam} P={[P3(side, TQ + .35, -TQ - .35, z0 + 5.5), P3(side, TQ + .35, TQ + .35, z0 + 5.5), P3(side, TQ + .35, TQ + .35, z0 + TZ), P3(side, TQ + .35, -TQ - .35, z0 + TZ)]} fill={col.corn} />); }
	if (cam.sees([0, 0, z0 + TZ], [0, 0, 1])) { const q = TQ + .35; o.push(<Poly key="roof" cam={cam} P={[[-q, -q, z0 + TZ], [q, -q, z0 + TZ], [q, q, z0 + TZ], [-q, q, z0 + TZ]]} fill={c.roof} />); }
	return <g opacity={op}>{o}</g>;
};
const Txt: React.FC<{x: number; y: number; s: string; size: number; op?: number; sc?: number}> = ({x, y, s, size, op = 1, sc = 1}) =>
	<g transform={`translate(${x},${y}) scale(${sc})`} opacity={op}><text x={0} y={0} textAnchor="middle" fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={size} fill={GOLD} stroke={INK} strokeWidth={size * .16} paintOrder="stroke" strokeLinejoin="round">{s}</text></g>;


const SerpentHead: React.FC<{cam: Cam; sgn: number; lit: boolean; op?: number}> = ({cam, sgn, lit, op = 1}) => {
	const c = lit ? {top: '#F6CC8E', end: '#D9965E', cheek: '#FFD999', line: '#B9783E', mouth: '#4A2422', eye: '#3A2A24'}
		: {top: '#7D7795', end: '#5C5674', cheek: '#6A6484', line: '#4C4864', mouth: '#2A2233', eye: '#2A2233'};
	const [uo, ui] = sgn > 0 ? [WS + .3, WS - BW - .3] : [-(WS - BW - .3), -(WS + .3)];
	const r0 = RF - .6, r1 = RF + 3.3, Q = (r: number, z: number, u: number) => P3('N', r, u, z);
	const prof: [number, number][] = [[r0, 0], [r1, 0], [r1, .55], [r0 + 1.5, .98], [r1 + .2, 1.2], [r1 + .1, 1.8], [r1 - .35, 2.05], [r0 + 1.3, 2.3], [r0, 2.45]];
	const o: React.ReactNode[] = [];
	o.push(<Poly key="top" cam={cam} P={[Q(r1 - .35, 2.05, uo), Q(r0 + 1.3, 2.3, uo), Q(r0, 2.45, uo), Q(r0, 2.45, ui), Q(r0 + 1.3, 2.3, ui), Q(r1 - .35, 2.05, ui)]} fill={c.top} />);
	o.push(<Poly key="snt" cam={cam} P={[Q(r1 + .1, 1.8, uo), Q(r1 - .35, 2.05, uo), Q(r1 - .35, 2.05, ui), Q(r1 + .1, 1.8, ui)]} fill={c.top} sw={2} />);
	o.push(<Poly key="jaw" cam={cam} P={[Q(r1, 0, uo), Q(r1, .55, uo), Q(r1, .55, ui), Q(r1, 0, ui)]} fill={c.end} sw={2} />);
	o.push(<Poly key="snf" cam={cam} P={[Q(r1 + .2, 1.2, uo), Q(r1 + .1, 1.8, uo), Q(r1 + .1, 1.8, ui), Q(r1 + .2, 1.2, ui)]} fill={c.end} sw={2} />);
	o.push(<Poly key="mouth" cam={cam} P={[[r1 + .05, .5], [r0 + 1.4, .98], [r1 + .15, 1.22]].map(([r, z]) => Q(r, z, uo - .05 * sgn))} fill={c.mouth} sw={2} />);
	if (lit) { o.push(<Line key="tg1" cam={cam} P={[[r1 - .3, .82], [r1 + .7, .8], [r1 + 1.2, .62]].map(([r, z]) => Q(r, z, uo - .4))} stroke="#C2463A" sw={5} />);
		o.push(<Line key="tg2" cam={cam} P={[[r1 + .7, .8], [r1 + 1.25, .95]].map(([r, z]) => Q(r, z, uo - .4))} stroke="#C2463A" sw={4} />); }
	o.push(<Poly key="cheek" cam={cam} P={prof.map(([r, z]) => Q(r, z, uo))} fill={c.cheek} />);
	[r1 - .1, r1 - .55].forEach((fr, i) => { o.push(<Poly key={`fa${i}`} cam={cam} P={[[fr, 1.12], [fr - .14, .78], [fr - .28, 1.08]].map(([r, z]) => Q(r, z, uo))} fill="#FFF6E6" sw={1.3} />);
		o.push(<Poly key={`fb${i}`} cam={cam} P={[[fr - .05, .6], [fr - .17, .86], [fr - .3, .64]].map(([r, z]) => Q(r, z, uo))} fill="#FFF6E6" sw={1.3} />); });
	const ex = r0 + 1.0, ez = 1.72;
	o.push(<Poly key="eye" cam={cam} P={Array.from({length: 16}, (_, i) => Q(ex + .42 * Math.cos(i * Math.PI / 8), ez + .3 * Math.sin(i * Math.PI / 8), uo))} fill={c.eye} sw={2} />);
	o.push(<Line key="brow" cam={cam} P={Array.from({length: 9}, (_, i) => Q(r0 + .3 + .9 * i / 8, 2.05 + .25 * Math.sin(Math.PI * i / 8), uo))} stroke={c.line} sw={3} />);
	for (let i = 0; i < 3; i++) { const rr = r0 + .35 + i * .45; o.push(<Line key={`sc${i}`} cam={cam} P={[Q(rr, .25, uo), Q(rr + .25, .55, uo), Q(rr, .8, uo)]} stroke={c.line} sw={2} />); }
	return <g opacity={op}>{o}</g>;
};

/* ---------- shared: seeded random, natural ground and trees, the HUD-style widgets ---------- */
const mul = (seed: number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const blob = (R: () => number, cx: number, cy: number, r: number, n = 10, j = .25): [number, number][] => Array.from({length: n}, (_, i) => { const a = 2 * Math.PI * i / n, rr = r * (1 + j * (R() - .5) * 2); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
type Tree = {x: number; y: number; h: number; r: number; c: number};
const TREES: Tree[] = (() => { const R = mul(57), o: Tree[] = [];
	for (let i = 0; i < 900; i++) { const a = R() * 2 * Math.PI, d = 92 + Math.pow(R(), .7) * 330; const x = d * Math.cos(a), y = d * Math.sin(a);
		if (Math.abs(x) < 6 && y > 60) continue; if (Math.abs(y) < 5 && x < -60) continue;   // the sacbé causeways stay open
		o.push({x, y, h: 9 + R() * 8, r: 3.6 + R() * 3.4, c: Math.floor(R() * 4)}); }
	for (let i = 0; i < 18; i++) { const a = R() * 2 * Math.PI, d = 62 + R() * 26; o.push({x: d * Math.cos(a), y: d * Math.sin(a), h: 7 + R() * 5, r: 2.6 + R() * 2, c: Math.floor(R() * 4)}); }
	return o; })();
const CROWN = [['#3F5A2E', '#5C7A3C'], ['#46632F', '#6A8A44'], ['#36502A', '#527034'], ['#4E6A32', '#76944A']];
const PATCH = (() => { const R = mul(91); return Array.from({length: 40}, () => { const a = R() * 2 * Math.PI, d = 50 + R() * 60; return {pts: blob(R, d * Math.cos(a), d * Math.sin(a), 6 + R() * 12, 9, .3), c: ['#879A58', '#7A8C4E', '#94A562', '#6F8247'][Math.floor(R() * 4)]}; }); })();
const PLAZA = blob(mul(5), 0, 0, 78, 22, .12);
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, s, size, col = '#FFF6E6', anchor = 'start', w = 900}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: V2; to: V2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };

/* ---------- shot 1: the stone calendar, built ---------- */
const Calendar: React.FC<{t: number}> = ({t}) => {
	const u = eio(t / SHOT), e = (62 - 12 * u) * Math.PI / 180, az = (-16 + 26 * u) * Math.PI / 180, D = 1000;
	const cam = new Cam([D * Math.cos(e) * Math.sin(az), -D * Math.cos(e) * Math.cos(az), D * Math.sin(e) + 8], [0, 0, 8], (10.2 + 1.2 * u) * D, [900, 610]);
	const terr = (k: number) => { const t0 = BEAT * (.25 + k * .5); return (t - t0) / (.45 * BEAT); };
	const stairU = cl((t - BEAT * 4.9) / (BEAT * 3.8));
	const tTemple = BEAT * 9, tEq = BEAT * 10.2;
	const lit: Record<string, [string, string, string]> = {W: ['#A9AFA6', '#C9CBBF', '#7A8884'], S: ['#7E9496', '#9FB0AD', '#5A6E72'], E: ['#4E666D', '#67797C', '#3A4F55'], N: ['#4E666D', '#67797C', '#3A4F55']};
	const RR = 44, ring = (r: number) => Array.from({length: 181}, (_, i) => [r * Math.cos(2 * Math.PI * i / 180), r * Math.sin(2 * Math.PI * i / 180), 0] as V3);
	const count = Math.round(91 * eo(stairU)), days = 4 * count + (t > tTemple ? 1 : 0);
	const ticks: React.ReactNode[] = [];
	for (let i = 0; i < 365; i++) { const a = -Math.PI / 2 + 2 * Math.PI * i / 365, ca = Math.cos(a), sa = Math.sin(a), on = i < days;
		ticks.push(<Line key={i} cam={cam} P={[[RR * ca, RR * sa, .05], [(RR + (on ? 3.4 : 2.4)) * ca, (RR + (on ? 3.4 : 2.4)) * sa, .05]]} stroke={on ? '#FFE3A0' : GOLD} sw={on ? 2.2 : 1.4} op={on ? .95 : .35} />); }
	const parts: React.ReactNode[] = [];
	for (let k = 0; k < NT; k++) { const p = terr(k); if (p <= 0) continue; const dz = -HT * (1 - eo(p));
		if (k) parts.push(<TerraceTop key={`tt${k}`} cam={cam} k={k - 1} col="#AEB6AE" />);
		for (const side of ['N', 'E', 'W', 'S']) if (cam.sees(P3(side, (sb(k) + st(k)) / 2, 0, zk(k) + HT / 2), wallN(side))) parts.push(<TerraceWall key={`w${k}${side}`} cam={cam} side={side} k={k} c={lit[side]} dz={dz} />);
		if (k === NT - 1 && p >= 1) parts.push(<TerraceTop key="ttop" cam={cam} k={NT - 1} col="#D6D2C0" />); }
	const sc: SC = {ramp: '#E7D7B0', tread: '#B79B68', top: '#F4E6C4', out_p: '#9C8256', out_m: '#B39A6A', end: '#C9AE7E', in: '#BFA77A'};
	const order = Object.keys(SIDES).sort((a, b) => Math.hypot(...sub(cam.C, P3(b, RF, 0, 0))) - Math.hypot(...sub(cam.C, P3(a, RF, 0, 0))));
	const tc = {S: {wall: '#C2B6A2', corn: '#7D8683', frieze: '#A9A497', joint: '#8A857A'}, E: {wall: '#A59A86', corn: '#68716E', frieze: '#8F8A7D', joint: '#76716A'},
		W: {wall: '#D0C5B0', corn: '#8C9490', frieze: '#B7B2A4', joint: '#958F84'}, N: {wall: '#A59A86', corn: '#68716E', frieze: '#8F8A7D', joint: '#76716A'}, door: '#2A2622', roof: '#9AA29D'};
	const tu = (t - tTemple) / (.3 * BEAT), eu = (t - tEq) / .18;
	const q = st(NT - 1), plat: V3[] = [[-q, -q, ZT], [q, -q, ZT], [q, q, ZT], [-q, q, ZT]];
	// the ground: grass, a pale limestone plaza, the causeways, then the jungle (crowns at their real height, shadows on the ground)
	const SUN: V3 = [-.45, .25, 1];
	const trees = TREES.map((tr) => ({tr, d: Math.hypot(...sub(cam.C, [tr.x, tr.y, tr.h]))})).sort((a, b) => b.d - a.d);
	return <g>
		<defs><radialGradient id="grass" cx={900} cy={610} r={1300} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A9A58" /><stop offset=".6" stopColor="#748648" /><stop offset="1" stopColor="#56683A" /></radialGradient>
			<radialGradient id="vig" cx={900} cy={600} r={1150} gradientUnits="userSpaceOnUse"><stop offset=".55" stopColor="#0E120A" stopOpacity="0" /><stop offset="1" stopColor="#0E120A" stopOpacity=".5" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#grass)" />
		{PATCH.map((pt, i) => <Poly key={i} cam={cam} P={pt.pts.map(([x, y]) => [x, y, 0] as V3)} fill={pt.c} stroke="none" sw={0} op={.7} />)}
		<Poly cam={cam} P={PLAZA.map(([x, y]) => [x, y, 0] as V3)} fill="#CBBE92" stroke="#A9996C" sw={2} op={.95} />
		<Poly cam={cam} P={[[-5, 70, 0], [5, 70, 0], [5, 480, 0], [-5, 480, 0]]} fill="#D3C69C" stroke="#A9996C" sw={1.5} />
		<Poly cam={cam} P={[[-70, -4.5, 0], [-480, -4.5, 0], [-480, 4.5, 0], [-70, 4.5, 0]]} fill="#D3C69C" stroke="#A9996C" sw={1.5} />
		{trees.map(({tr}, i) => { const [sx, sy] = cam.p([tr.x + SUN[0] * tr.h * .9, tr.y + SUN[1] * tr.h * .9, 0]); const rr = tr.r * cam.f / Math.hypot(...sub(cam.C, [tr.x, tr.y, 0]));
			return <ellipse key={`s${i}`} cx={sx} cy={sy} rx={rr * 1.1} ry={rr * .8} fill="#1F2A16" opacity={.35} />; })}
		<Poly cam={cam} P={[[-S0 + 5, -S0 - 4, 0], [S0 + 9, -S0 - 4, 0], [S0 + 10, S0 - 5, 0], [-S0 + 5, S0 - 2, 0]]} fill="#2E3A22" stroke="none" sw={0} op={.45 * cl(t / (BEAT * 4))} />
		<Line cam={cam} P={ring(RR)} stroke={GOLD} sw={2.5} op={.55} /><Line cam={cam} P={ring(RR + 2.4)} stroke={GOLD} sw={1.5} op={.35} />
		{ticks}
		{trees.map(({tr, d}, i) => { const [x, y] = cam.p([tr.x, tr.y, tr.h]), rr = tr.r * cam.f / d, [c0, c1] = CROWN[tr.c];
			return <g key={i}><circle cx={x} cy={y} r={rr} fill={c0} stroke={INK} strokeWidth={1.6} /><circle cx={x - rr * .28} cy={y - rr * .3} r={rr * .55} fill={c1} /></g>; })}
		{parts}
		{order.map((side) => <Stair key={side} cam={cam} side={side} c={sc} step={3} upto={stairU} />)}
		{stairU > 0 && order.map((side) => <Poly key={`g${side}`} cam={cam} P={[P3(side, RF, -WS, 0), P3(side, RF, WS, 0), P3(side, rz(ZT * stairU), WS, ZT * stairU + BH), P3(side, rz(ZT * stairU), -WS, ZT * stairU + BH)]} fill="none" stroke={GOLD} sw={3.5} />)}
		{tu > 0 && <Temple cam={cam} c={tc} dz={8 * (1 - eo(tu))} op={cl(tu * 3)} />}
		{tu > 1 && <Poly cam={cam} P={plat} fill="none" stroke={GOLD} sw={4} />}
		<rect width={W} height={H} fill="url(#vig)" />
		{stairU > 0 && Object.keys(SIDES).map((side) => { const [x, y] = cam.p(P3(side, RF + 5.4, 0, 0)); return <Txt key={side} x={x} y={y + 22} s={String(count)} size={64} />; })}
		{tu > 0 && (() => { const [x, y] = cam.p([0, 0, ZT + TZ]); return <Txt x={x} y={y + 18} s="+1" size={56} op={cl(tu * 2)} sc={.6 + .4 * back(tu)} />; })()}
		{/* the counting widget: days lit on the dial, and the sum building up */}
		<Widget x={1430} y={380} w={400} h={300} op={cl(t / .4)}>
			<T2 x={1460} y={432} s="日历刻度" size={30} col={GOLD} />
			<T2 x={1460} y={500} s={`第 ${days} 天`} size={56} />
			<rect x={1460} y={520} width={340} height={12} rx={6} fill="rgba(255,246,230,.2)" /><rect x={1460} y={520} width={340 * days / 365} height={12} rx={6} fill={GOLD} />
			<T2 x={1460} y={590} s={stairU > 0 ? `${count} × 4 = ${4 * count}` : '91 × 4'} size={40} col={stairU >= 1 ? '#FFF6E6' : '#CFC3AE'} />
			{eu > 0 && <g transform={`translate(1460,652) scale(${1.4 - .4 * eo(eu)})`} opacity={cl(eu * 2)}><T2 x={0} y={0} s="+ 1 = 365" size={48} col={GOLD} /></g>}
		</Widget>
	</g>;
};

/* ---------- shot 2: the equinox serpent — the sun, the terrace corners and the light on the balustrade ---------- */
const Serpent: React.FC<{t: number}> = ({t}) => {
	const u = eio(t / SHOT), phi = (40 - 8 * u) * Math.PI / 180, D = 96 - 8 * u;
	const cam = new Cam([-D * Math.sin(phi), D * Math.cos(phi), 4.0], [0, 0, 13.5], 1630, [1160, 652]);
	const sun: V2 = [1840 - 40 * u, 430 + 160 * eo(t / SHOT)], elev = 19 - 12 * eo(t / SHOT);
	const lit: Record<string, [string, string, string]> = {W: ['#DE9C62', '#F3C58E', '#B57446'], N: ['#625E7C', '#7A7592', '#4C4864'], E: ['#5A5470', '#6E6886', '#45405C'], S: ['#5A5470', '#6E6886', '#45405C']};
	const tc = {W: {wall: '#E8AE74', corn: '#B77A4C', frieze: '#D49A66', joint: '#B57E52'}, N: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'},
		E: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'}, S: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'}, door: '#231B22', roof: '#C48E6A'};
	const zc = cam.C[2], walls: React.ReactNode[] = [];
	[...Array(NT).keys()].sort((a, b) => Math.abs(zk(b) + HT / 2 - zc) - Math.abs(zk(a) + HT / 2 - zc)).forEach((k) => {
		for (const side of Object.keys(SIDES)) if (cam.sees(P3(side, (sb(k) + st(k)) / 2, 0, zk(k) + HT / 2), wallN(side))) walls.push(<TerraceWall key={`w${k}${side}`} cam={cam} side={side} k={k} c={lit[side]} />);
		if (cam.sees([0, 0, zk(k + 1)], [0, 0, 1])) walls.push(<TerraceTop key={`t${k}`} cam={cam} k={k} col="#B98564" />); });
	const tri: React.ReactNode[] = [], rays: React.ReactNode[] = []; let shown = 0;
	for (let k = 1; k < 8; k++) { const t0 = BEAT * (1.5 + (8 - k)), p = (t - t0) / .25; if (p <= 0) continue; shown++;
		const z0 = zk(k), r0 = rz(z0 - BH), w = HT * (RF - SP) / ZT * .97, A: [number, number] = [r0, z0], B: [number, number] = [r0 - w, z0], C: [number, number] = [r0 - w, zr(r0 - w) + BH];
		const P = [A, B, C].map(([r, z]) => P3('N', r, WS, z));
		tri.push(<g key={k} opacity={cl(p)}><Poly cam={cam} P={P} fill="none" stroke="#FFC56E" sw={16} op={.4} /><Poly cam={cam} P={P} fill="#FFDC8E" stroke="#C98A3E" sw={1.5} /></g>);
		// the ray: from the sun, skimming the terrace corner, onto the balustrade where it makes this triangle
		const corner = cam.p([-st(k - 1), st(k - 1) - 1.2, zk(k)]), tip = cam.p(P3('N', (A[0] + C[0]) / 2, WS, (A[1] + C[1]) / 2)), ru = cl((t - t0 + .15) / .3), fade = 1 - .65 * cl((t - t0 - .6) / .6);
		const mx = sun[0] + (tip[0] - sun[0]) * ru, my = sun[1] + (tip[1] - sun[1]) * ru;
		rays.push(<g key={k} opacity={fade}><line x1={sun[0]} y1={sun[1]} x2={mx} y2={my} stroke="#FFE7A8" strokeWidth={3.5} strokeDasharray="14 10" />
			{ru >= 1 && <circle cx={corner[0]} cy={corner[1]} r={8} fill={GOLD} stroke={INK} strokeWidth={2} />}</g>); }
	const nc: SC = {ramp: '#857C93', tread: '#6B6380', top: '#9C93A9', out_p: '#2F2A45', out_m: '#3F3A55', end: '#585170', in: '#5C5672'};
	const wc: SC = {ramp: '#EDB57A', tread: '#C48550', top: '#F6CB92', out_p: '#D99860', out_m: '#D99860', end: '#E2A46C', in: '#C98A58'};
	const head = cl((t - BEAT * 9.6) / .3), hp = cam.p(P3('N', RF + 1.2, WS - .5, 1.2)), dusk = sm(t / SHOT);
	const R = mul(3); const far = Array.from({length: 80}, (_, i) => ({x: -80 + i * 27 + R() * 10, y: 640 - R() * 26, r: 14 + R() * 16}));
	const near = Array.from({length: 60}, (_, i) => ({x: -80 + i * 36 + R() * 14, y: 664 - R() * 30, r: 18 + R() * 20}));
	const TR = mul(77), tufts: {P: V3; s: number}[] = [];
	while (tufts.length < 150) { const x = -150 + TR() * 260, y = -120 + TR() * 280, sz = .7 + TR() * .9;
		if (Math.max(Math.abs(x), Math.abs(y)) < S0 + 9) continue;                 // not under or against the pyramid
		if (Math.abs(x) < WS + 4 && y > 0 && y < RF + 12) continue;                 // not at the north stair's foot / serpent heads
		if (Math.abs(y) < WS + 4 && x < 0 && x > -RF - 12) continue;                // nor the west stair's
		tufts.push({P: [x, y, 0], s: sz}); }
	const clouds = [[300, 210, 1.2], [760, 150, .9], [1260, 250, 1.0], [1560, 170, .8], [520, 330, .7]];
	const foot: V2 = [Math.max(1690, sun[0] - 300), 662], clock = 16 * 60 + 35 + Math.round(50 * t / SHOT);
	return <g>
		<defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5E6C93" /><stop offset=".45" stopColor="#B98A86" /><stop offset=".75" stopColor="#E9AC78" /><stop offset="1" stopColor="#F7CF8E" /></linearGradient>
			<radialGradient id="glow2" cx={sun[0]} cy={sun[1]} r={760} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF1C4" stopOpacity=".95" /><stop offset=".18" stopColor="#FFD58A" stopOpacity=".75" /><stop offset=".5" stopColor="#F2A866" stopOpacity=".28" /><stop offset="1" stopColor="#F2A866" stopOpacity="0" /></radialGradient>
			<linearGradient id="field2" x1="0" y1="660" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#A08A56" /><stop offset=".5" stopColor="#7E6E42" /><stop offset="1" stopColor="#4E4630" /></linearGradient>
			<filter id="bl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter></defs>
		<rect width={W} height={H} fill="url(#sky2)" /><rect width={W} height={H} fill="#3A2A44" opacity={.22 * dusk} /><rect width={W} height={H} fill="url(#glow2)" />
		{clouds.map(([x, y, k], i) => <g key={i} transform={`translate(${x + 18 * t - 40 * u},${y}) scale(${k})`} opacity={.85}>
			<ellipse cx={0} cy={0} rx={130} ry={26} fill="#E9B190" /><ellipse cx={-50} cy={-14} rx={70} ry={24} fill="#F2C4A0" /><ellipse cx={40} cy={-18} rx={60} ry={22} fill="#F2C4A0" /><ellipse cx={0} cy={10} rx={110} ry={10} fill="#C98A86" opacity={.6} /></g>)}
		<circle cx={sun[0]} cy={sun[1]} r={62} fill="#FFF3CF" stroke="#F7C77E" strokeWidth={3} />
		<g transform={`translate(${-30 * u},0)`}>{far.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#9A7E86" />)}</g>
		<g transform={`translate(${-70 * u},0)`}>{near.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#4F4044" stroke="#2E2628" strokeWidth={2} />)}</g>
		<rect x={-20} y={662} width={W + 40} height={H} fill="url(#field2)" />
		{tufts.map((f, i) => { const d = Math.hypot(...sub(cam.C, f.P)); if (dot(sub(f.P, cam.C), cam.F) < 8) return null; const [x, y] = cam.p(f.P), k = f.s * 60 / d;
			return y < 664 ? null : <g key={i} transform={`translate(${x},${y}) scale(${k})`}>
			<ellipse cx={-30} cy={2} rx={34} ry={3} fill="#2E2420" opacity={.35} /><path d="M-6,0 L-2,-16 L0,0 L3,-20 L5,0 L9,-13 L11,0 Z" fill="#5E6A3A" stroke={INK} strokeWidth={1} /></g>; })}
		<Temple cam={cam} c={tc} />
		{walls}
		<Stair cam={cam} side="W" c={wc} />
		<Stair cam={cam} side="N" c={nc} light={tri} />
		<SerpentHead cam={cam} sgn={-1} lit={false} />
		<SerpentHead cam={cam} sgn={1} lit={false} />
		{head > 0 && <SerpentHead cam={cam} sgn={1} lit op={head} />}
		{rays}
		{head > 0 && <circle cx={hp[0]} cy={hp[1]} r={70 + 12 * Math.sin(t * 8)} fill="#FFE7A8" opacity={.6 * head} filter="url(#bl2)" />}
		{/* the sun's height: an angle at the pyramid's foot between the horizon and the ray */}
		{(() => { const ang = Math.atan2(sun[1] - foot[1], sun[0] - foot[0]); const r = 90;
			return <g opacity={cl(t / .5)}><line x1={foot[0]} y1={foot[1]} x2={W} y2={foot[1]} stroke="#FFF6E6" strokeWidth={2.5} strokeDasharray="8 8" />
				<line x1={foot[0]} y1={foot[1]} x2={sun[0] - 62 * Math.cos(ang)} y2={sun[1] - 62 * Math.sin(ang)} stroke={GOLD} strokeWidth={3} />
				<path d={`M${foot[0] + r},${foot[1]} A${r},${r} 0 0 0 ${foot[0] + r * Math.cos(ang)},${foot[1] + r * Math.sin(ang)}`} fill="none" stroke={GOLD} strokeWidth={4} />
				<T2 x={foot[0] + r + 14} y={foot[1] - 12} s={`${elev.toFixed(0)}°`} size={40} col={GOLD} /></g>; })()}
		<Callout from={cam.p(P3('N', rz(zk(4)), WS, zk(4)))} to={[620, 470]} label="台阶边的影子" u={(t - BEAT * 3) / .6} side={-1} />
		{head > 0 && <Callout from={hp} to={[560, 880]} label="蛇头" u={head * 2} side={-1} />}
		{/* the date and time widget, and the triangle counter */}
		<Widget x={1440} y={160} w={380} h={200} op={cl(t / .4)}>
			<T2 x={1468} y={210} s="春分 · 3月20日" size={32} col={GOLD} />
			<T2 x={1468} y={278} s={`${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, '0')}`} size={60} />
			<T2 x={1468} y={334} s={`太阳高度 ${elev.toFixed(0)}°`} size={30} col="#CFC3AE" />
		</Widget>
		<Widget x={1440} y={380} w={380} h={120} op={cl((t - BEAT * 2) / .4)}>
			<T2 x={1468} y={455} s={`光三角 ${shown} / 7`} size={44} col={shown === 7 ? GOLD : '#FFF6E6'} />
		</Widget>
	</g>;
};

const Scene: React.FC = () => {
	const f = useCurrentFrame(), n1 = Math.round(SHOT * FPS);
	return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}>{f < n1 ? <Calendar t={f / FPS} /> : <Serpent t={(f - n1) / FPS} />}</svg></AbsoluteFill>;
};
registerRoot(() => <Composition id="Q57CHICHEN" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />);
