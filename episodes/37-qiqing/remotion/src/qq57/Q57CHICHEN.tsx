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

/* ---------- shot 1: the stone calendar, built ---------- */
const Calendar: React.FC<{t: number}> = ({t}) => {
	const u = eio(t / SHOT), e = (62 - 12 * u) * Math.PI / 180, az = (-16 + 26 * u) * Math.PI / 180, D = 1000;
	const cam = new Cam([D * Math.cos(e) * Math.sin(az), -D * Math.cos(e) * Math.cos(az), D * Math.sin(e) + 8], [0, 0, 8], (10.2 + 1.2 * u) * D, [900, 610]);
	const terr = (k: number) => { const t0 = BEAT * (.25 + k * .5); return (t - t0) / (.45 * BEAT); };   // two terraces per beat
	const stairU = cl((t - BEAT * 4.9) / (BEAT * 3.8));                                                    // the four stairs climb together
	const tTemple = BEAT * 9, tEq = BEAT * 10.2;
	const lit: Record<string, [string, string, string]> = {W: ['#A9AFA6', '#C9CBBF', '#7A8884'], S: ['#7E9496', '#9FB0AD', '#5A6E72'], E: ['#4E666D', '#67797C', '#3A4F55'], N: ['#4E666D', '#67797C', '#3A4F55']};
	const RR = 44, ring = (r: number) => Array.from({length: 181}, (_, i) => [r * Math.cos(2 * Math.PI * i / 180), r * Math.sin(2 * Math.PI * i / 180), 0] as V3);
	const count = Math.round(91 * eo(stairU)), days = 4 * count + (t > tTemple ? 1 : 0);
	const ticks: React.ReactNode[] = [];
	for (let i = 0; i < 365; i++) { const a = -Math.PI / 2 + 2 * Math.PI * i / 365, ca = Math.cos(a), sa = Math.sin(a), on = i < days;
		ticks.push(<Line key={i} cam={cam} P={[[RR * ca, RR * sa, 0], [(RR + (on ? 3.4 : 2.4)) * ca, (RR + (on ? 3.4 : 2.4)) * sa, 0]]} stroke={on ? '#FFE3A0' : GOLD} sw={on ? 2.2 : 1.4} op={on ? .95 : .35} />); }
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
	// a few blocks being lifted while it is built (fall away when finished)
	return <g>
		<defs><radialGradient id="lawn" cx={925} cy={640} r={1000} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8E9A5E" /><stop offset=".55" stopColor="#6E7B48" /><stop offset="1" stopColor="#3C4A2E" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#lawn)" />
		{[[60, '#2E3F2A', '#1F2C1C', 34], [150, '#3B5034', '#24331F', 40]].map(([y0, col, edge, r], row) => <g key={row} transform={`translate(${(az * 180 / Math.PI) * (row ? 3 : 1.6)},0)`}>
			{Array.from({length: 46}, (_, i) => { const x = -120 + i * 47 + ((i * 37) % 19), yy = (y0 as number) + ((i * 53) % 30) - 15, rr = (r as number) * (.8 + ((i * 29) % 10) / 25);
				return <circle key={i} cx={x} cy={yy} r={rr} fill={col as string} stroke={edge as string} strokeWidth={2.5} />; })}
			<rect x={-200} y={-200} width={2400} height={(y0 as number) + 182} fill={col as string} />
		</g>)}
		<Poly cam={cam} P={[[-S0 + 5, -S0 - 4, 0], [S0 + 9, -S0 - 4, 0], [S0 + 10, S0 - 5, 0], [-S0 + 5, S0 - 2, 0]]} fill="#2E3A22" stroke="none" sw={0} op={.5 * cl(t / (BEAT * 4))} />
		<Line cam={cam} P={ring(RR)} stroke={GOLD} sw={2.5} op={.55} /><Line cam={cam} P={ring(RR + 2.4)} stroke={GOLD} sw={1.5} op={.35} />
		{ticks}
		{parts}
		{order.map((side) => <Stair key={side} cam={cam} side={side} c={sc} step={3} upto={stairU} />)}
		{stairU > 0 && order.map((side) => <Poly key={`g${side}`} cam={cam} P={[P3(side, RF, -WS, 0), P3(side, RF, WS, 0), P3(side, rz(ZT * stairU), WS, ZT * stairU + BH), P3(side, rz(ZT * stairU), -WS, ZT * stairU + BH)]} fill="none" stroke={GOLD} sw={3.5} />)}
		{tu > 0 && <Temple cam={cam} c={tc} dz={8 * (1 - eo(tu))} op={cl(tu * 3)} />}
		{tu > 1 && <Poly cam={cam} P={plat} fill="none" stroke={GOLD} sw={4} />}
		{stairU > 0 && Object.keys(SIDES).map((side) => { const [x, y] = cam.p(P3(side, RF + 5.4, 0, 0)); return <Txt key={side} x={x} y={y + 22} s={String(count)} size={64} />; })}
		{tu > 0 && (() => { const [x, y] = cam.p([0, 0, ZT + TZ]); return <Txt x={x} y={y + 18} s="+1" size={56} op={cl(tu * 2)} sc={.6 + .4 * back(tu)} />; })()}
		{eu > 0 && <Txt x={1660} y={700} s="= 365" size={150} sc={1.8 - .8 * eo(eu)} op={cl(eu * 2)} />}
	</g>;
};

/* ---------- shot 2: the equinox serpent ---------- */
const Serpent: React.FC<{t: number}> = ({t}) => {
	const u = eio(t / SHOT), phi = (40 - 8 * u) * Math.PI / 180, D = 96 - 8 * u;
	const cam = new Cam([-D * Math.sin(phi), D * Math.cos(phi), 4.0], [0, 0, 13.5], 1630, [1160, 652]);
	const sun: V2 = [1880 - 40 * u, 470 + 120 * eo(t / SHOT)];
	const lit: Record<string, [string, string, string]> = {W: ['#DE9C62', '#F3C58E', '#B57446'], N: ['#625E7C', '#7A7592', '#4C4864'], E: ['#5A5470', '#6E6886', '#45405C'], S: ['#5A5470', '#6E6886', '#45405C']};
	const tc = {W: {wall: '#E8AE74', corn: '#B77A4C', frieze: '#D49A66', joint: '#B57E52'}, N: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'},
		E: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'}, S: {wall: '#706A86', corn: '#4E4964', frieze: '#625C79', joint: '#57516C'}, door: '#231B22', roof: '#C48E6A'};
	const zc = cam.C[2], walls: React.ReactNode[] = [];
	[...Array(NT).keys()].sort((a, b) => Math.abs(zk(b) + HT / 2 - zc) - Math.abs(zk(a) + HT / 2 - zc)).forEach((k) => {
		for (const side of Object.keys(SIDES)) if (cam.sees(P3(side, (sb(k) + st(k)) / 2, 0, zk(k) + HT / 2), wallN(side))) walls.push(<TerraceWall key={`w${k}${side}`} cam={cam} side={side} k={k} c={lit[side]} />);
		if (cam.sees([0, 0, zk(k + 1)], [0, 0, 1])) walls.push(<TerraceTop key={`t${k}`} cam={cam} k={k} col="#B98564" />); });
	const tri: React.ReactNode[] = [];
	for (let k = 1; k < 8; k++) { const p = (t - BEAT * (1.5 + (8 - k))) / .25; if (p <= 0) continue;   // from the top down, one per beat
		const z0 = zk(k), r0 = rz(z0 - BH), w = HT * (RF - SP) / ZT * .97, A: [number, number] = [r0, z0], B: [number, number] = [r0 - w, z0], C: [number, number] = [r0 - w, zr(r0 - w) + BH];
		const P = [A, B, C].map(([r, z]) => P3('N', r, WS, z)), op = cl(p);
		tri.push(<g key={k} opacity={op}><Poly cam={cam} P={P} fill="none" stroke="#FFC56E" sw={16} op={.4} /><Poly cam={cam} P={P} fill="#FFDC8E" stroke="#C98A3E" sw={1.5} /></g>); }
	const nc: SC = {ramp: '#857C93', tread: '#6B6380', top: '#9C93A9', out_p: '#2F2A45', out_m: '#3F3A55', end: '#585170', in: '#5C5672'};
	const wc: SC = {ramp: '#EDB57A', tread: '#C48550', top: '#F6CB92', out_p: '#D99860', out_m: '#D99860', end: '#E2A46C', in: '#C98A58'};
	const head = cl((t - BEAT * 9.6) / .3), hp = cam.p(P3('N', RF + 1.2, WS - .5, 1.2));
	const dusk = sm(t / SHOT);
	return <g>
		<defs><linearGradient id="sky2" x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5E6C93" /><stop offset=".45" stopColor="#B98A86" /><stop offset=".75" stopColor="#E9AC78" /><stop offset="1" stopColor="#F7CF8E" /></linearGradient>
			<radialGradient id="glow2" cx={sun[0]} cy={sun[1]} r={760} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF1C4" stopOpacity=".95" /><stop offset=".18" stopColor="#FFD58A" stopOpacity=".75" /><stop offset=".5" stopColor="#F2A866" stopOpacity=".28" /><stop offset="1" stopColor="#F2A866" stopOpacity="0" /></radialGradient>
			<linearGradient id="field2" x1="0" y1="640" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#B07A55" /><stop offset="1" stopColor="#5E4436" /></linearGradient>
			<filter id="bl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter></defs>
		<rect width={W} height={H} fill="url(#sky2)" /><rect width={W} height={H} fill="#3A2A44" opacity={.22 * dusk} /><rect width={W} height={H} fill="url(#glow2)" />
		<circle cx={sun[0]} cy={sun[1]} r={62} fill="#FFF3CF" stroke="#F7C77E" strokeWidth={3} />
		<g transform={`translate(${-60 * u},0)`}>{Array.from({length: 70}, (_, i) => { const x = -60 + i * 33 + ((i * 17) % 11), r = 16 + ((i * 41) % 18); return <circle key={i} cx={x} cy={655 - ((i * 23) % 26) - (x > 1500 ? 12 : 0)} r={r} fill="#4A3F3E" stroke="#2E2628" strokeWidth={2.5} />; })}</g>
		<rect x={-20} y={661} width={W + 40} height={H} fill="url(#field2)" stroke={INK} strokeWidth={2.5} />
		<Temple cam={cam} c={tc} />
		{walls}
		<Stair cam={cam} side="W" c={wc} />
		<Stair cam={cam} side="N" c={nc} light={tri} />
		{head > 0 && <circle cx={hp[0]} cy={hp[1]} r={70 + 12 * Math.sin(t * 8)} fill="#FFE7A8" opacity={.6 * head} filter="url(#bl2)" />}
	</g>;
};

const Scene: React.FC = () => {
	const f = useCurrentFrame(), n1 = Math.round(SHOT * FPS);
	return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}>{f < n1 ? <Calendar t={f / FPS} /> : <Serpent t={(f - n1) / FPS} />}</svg></AbsoluteFill>;
};
registerRoot(() => <Composition id="Q57CHICHEN" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />);
