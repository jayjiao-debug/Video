import React from 'react';
import {Stage60, Cam, camPath, CAM0, Grade, FC, F_SERIF, PIC_T, PIC_B, FW, rng} from '../qq60/frame60';
import {PAL, poly, cl, sm, lerp} from '../qq60/geo60';
import {SetDefs61} from './sets61_kit';
import {NODES, NodeId, LIT, TW, TH} from './tree61';
import {sigOf} from './cast61';

/* ep61 · shared pieces for the 22 film shots (shot61_*.tsx).
   Every shot is a component <C t dur n /> (t = seconds since the shot's start; negative while it transitions in).
   Scene61 = Stage60 (camera, painted finish, grade, wobble) + the set gradients + the animated family-tree chip (screen space, top left). */
export type ShotProps = {t: number; dur: number; n: number};
export type ShotDef = {C: React.FC<ShotProps>; tin?: 'cut' | 'dissolve' | 'own'; ov?: number; /** 'own' reveal: iris from a point, or a wipe */ iris?: [number, number]; wipe?: 'L' | 'R' | 'D' | 'U' | 'open'; irisC?: string};
export const GY = 868, CX = 720, MID = (PIC_T + PIC_B) / 2;
export {sm, cl, lerp, PAL, FC, F_SERIF, PIC_T, PIC_B, FW, rng, poly, camPath, CAM0};
export type {Cam, Grade};

/** u in [0,1] over [a, a + d] (smoothstep) */
export const ease = (t: number, a: number, d: number) => sm((t - a) / d);
/** linear 0..1 over [a, a + d] */
export const lin = (t: number, a: number, d: number) => cl((t - a) / d);
/** a pulse: 0 → 1 over `up`, hold, 1 → 0 over `down` */
export const pulse = (t: number, a: number, up: number, hold: number, down: number) => t < a ? 0 : t < a + up ? sm((t - a) / up) : t < a + up + hold ? 1 : 1 - sm((t - a - up - hold) / down);
/** ease out back (a small overshoot) for pops */
export const pop = (u: number) => { const v = cl(u), c = 1.70158; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };

/* ---------------- the family-tree chip (screen space) ---------------- */
const K = 0.225, CX0 = 24, CY0 = 56;
const KIDS: [NodeId, NodeId][] = [['atum', 'shu'], ['atum', 'tefnut'], ['shu', 'geb'], ['tefnut', 'nut'], ['nut', 'osiris'], ['nut', 'isis'], ['nut', 'set'], ['nut', 'nephthys'], ['osiris', 'horus'], ['nephthys', 'anubis']];
const WED: [NodeId, NodeId][] = [['shu', 'tefnut'], ['geb', 'nut'], ['osiris', 'isis'], ['set', 'nephthys']];
const LINK: [NodeId, NodeId][] = [['atum', 'sekhmet'], ['sekhmet', 'bastet'], ['bastet', 'maat'], ['thoth', 'shu']];
/** the mini tree: gods lit before shot n are lit; the ones introduced in shot n light up at their `at` time (s, shot clock) with a pop and a
 *  red-orange ring; o = chip opacity (fade in / out with the shot) */
export const Chip61: React.FC<{n: number; t: number; at?: Partial<Record<NodeId, number>>; o?: number}> = ({n, t, at = {}, o = 1}) => {
	const before = new Set(LIT[n - 1] ?? []), now = new Set(LIT[n] ?? []);
	const litU = (id: NodeId) => before.has(id) ? 1 : now.has(id) ? (at[id] === undefined ? 1 : ease(t, at[id]!, 0.35)) : 0;
	const P = (id: NodeId): [number, number] => [CX0 + 14 + NODES[id].x * K, CY0 + 14 + NODES[id].y * K];
	const ids = Object.keys(NODES) as NodeId[];
	return <g opacity={o}>
		<rect x={CX0} y={CY0} width={TW * K + 28} height={TH * K + 20} rx={10} fill={FC.lapis2} opacity={0.84} stroke={FC.gold2} strokeWidth={2} />
		<rect x={CX0 + 4} y={CY0 + 4} width={TW * K + 20} height={TH * K + 12} rx={8} fill="none" stroke={FC.gold} strokeWidth={1} opacity={0.5} />
		{KIDS.map(([a, b]) => { const p = P(a), q = P(b), u = Math.min(litU(a), litU(b)); return <g key={a + b}>
			<path d={`M${p[0]} ${p[1]}V${(p[1] + q[1]) / 2}H${q[0]}V${q[1]}`} stroke="#55618F" strokeWidth={1.6} fill="none" />
			{u > 0 && <path d={`M${p[0]} ${p[1]}V${(p[1] + q[1]) / 2}H${q[0]}V${q[1]}`} stroke={FC.gold} strokeWidth={2.6} fill="none" opacity={u} />}</g>; })}
		{WED.map(([a, b]) => { const p = P(a), q = P(b), u = Math.min(litU(a), litU(b)); return <g key={a + b} opacity={0.35 + 0.65 * u}>
			<line x1={p[0]} y1={p[1] - 2} x2={q[0]} y2={q[1] - 2} stroke={u > 0.5 ? FC.gold : '#55618F'} strokeWidth={1.3} /><line x1={p[0]} y1={p[1] + 2} x2={q[0]} y2={q[1] + 2} stroke={u > 0.5 ? FC.gold : '#55618F'} strokeWidth={1.3} /></g>; })}
		{LINK.map(([a, b]) => { const p = P(a), q = P(b), u = Math.min(litU(a), litU(b)); return <line key={a + b} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={u > 0.5 ? FC.gold : '#55618F'} strokeWidth={1.4} strokeDasharray="2 4" />; })}
		{ids.map((id) => { const p = P(id), u = litU(id), fresh = now.has(id) && !before.has(id), k = fresh && at[id] !== undefined ? pop((t - at[id]!) / 0.45) : 1;
			const ring = fresh ? cl((t - (at[id] ?? -9)) / 0.3) : 0;
			return <g key={id}>
				{fresh && ring > 0 && <circle cx={p[0]} cy={p[1]} r={13 + 10 * (1 - ring)} fill="none" stroke={FC.key} strokeWidth={3} opacity={ring} />}
				<circle cx={p[0]} cy={p[1]} r={8} fill="#2A3566" stroke="#55618F" strokeWidth={1.6} />
				{u > 0 && <circle cx={p[0]} cy={p[1]} r={8 * Math.max(0.2, k)} fill={sigOf(NODES[id].who).c} stroke={FC.gold} strokeWidth={2.4} opacity={u} />}</g>; })}
	</g>;
};

/* ---------------- the scene wrapper ---------------- */
export type Scene61P = {t: number; n: number; cam?: Cam | [number, number, number, number][]; grade?: Grade; bg?: string; ground?: string; children?: React.ReactNode; light?: React.ReactNode; screen?: React.ReactNode;
	chip?: boolean; chipAt?: Partial<Record<NodeId, number>>; dark?: number; darkC?: string; wear?: number; stain?: number; fadeIn?: number; fadeC?: string};
/** a film shot: world under the camera (keys [t, x, y, z] or a fixed Cam), the painted finish and grade, the chip; fadeIn = s of a fade up
 *  from fadeC (black) at the start, for the moments that come out of the dark */
export const Scene61: React.FC<Scene61P> = ({t, n, cam = CAM0, grade = 'plaster', bg = 'plaster', ground, children, light, screen, chip = true, chipAt, dark = 0, darkC, wear = 0.55, stain = 0.3, fadeIn = 0, fadeC = '#05060c'}) => {
	const c: Cam = Array.isArray(cam) ? camPath(t, cam) : cam;
	return <Stage60 t={t} cam={c} grade={grade} bg={bg} ground={ground} wear={wear} stain={stain} dark={dark} darkC={darkC}
		children={<><SetDefs61 />{children}</>} light={light}
		screen={<>{screen}{chip && <Chip61 n={n} t={t} at={chipAt} />}{fadeIn > 0 && <rect x={0} y={0} width={FW} height={1080} fill={fadeC} opacity={1 - ease(t, 0, fadeIn)} />}</>} />;
};

/* ---------------- labels, rings, mist, sparkles ---------------- */
/** a name label: cream plate edged in the god's signature colour, rising in at `at` (world space) */
export const Tag61: React.FC<{x: number; y: number; t: number; at: number; text: string; who?: string; size?: number; sub?: string; out?: number}> = ({x, y, t, at, text, who, size = 34, sub, out = 1e9}) => {
	const u = ease(t, at, 0.4) * (1 - ease(t, out, 0.4)); if (u <= 0) return null;
	const sig = who ? sigOf(who) : {c: FC.gold, c2: FC.gold2}, w = (text.length + (sub ? sub.length * 0.62 + 0.8 : 0)) * size + 34, h = size + 20;
	return <g opacity={u} transform={`translate(${x},${y + (1 - u) * 14})`}>
		<rect x={-w / 2} y={-h / 2 + 3} width={w} height={h} rx={10} fill="#2A1912" opacity={0.35} />
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#F4E8CC" stroke={FC.ink} strokeWidth={7} />
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="none" stroke={sig.c} strokeWidth={4} />
		<text x={sub ? -w / 2 + 17 : 0} y={size * 0.36} textAnchor={sub ? 'start' : 'middle'} fontSize={size} fontFamily={F_SERIF} fontWeight={900} fill={FC.ink}>{text}
			{sub && <tspan fontSize={size * 0.62} fill="#7A4A22" dx={size * 0.3}>· {sub}</tspan>}</text>
	</g>;
};
/** big caption text in the picture (numbers, "1500 多位神") */
export const Big: React.FC<{x: number; y: number; text: string; size: number; c?: string; o?: number; k?: number; sw?: number}> = ({x, y, text, size, c = PAL.goldHi, o = 1, k = 1, sw}) => o <= 0 ? null :
	<text x={x} y={y} textAnchor="middle" fontSize={size} fontFamily={F_SERIF} fontWeight={900} fill={c} stroke={FC.ink} strokeWidth={sw ?? size * 0.09} paintOrder="stroke" opacity={o}
		transform={k !== 1 ? `translate(${x},${y}) scale(${k}) translate(${-x},${-y})` : undefined}>{text}</text>;
/** sound rings from a mouth, travelling out over `dur` s from `at` (dir +1 = right) */
export const Rings61: React.FC<{x: number; y: number; t: number; at: number; dur: number; dir?: 1 | -1; n?: number; c?: string; r0?: number; gap?: number; w?: number}> = ({x, y, t, at, dur, dir = 1, n = 4, c = FC.cream, r0 = 30, gap = 0.22, w = 6}) => {
	if (t < at || t > at + dur + 0.8) return null;
	return <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
		{Array.from({length: n * 2}, (_, i) => { const st = at + i * gap; if (st > at + dur) return null; const u = (t - st) / 0.8; if (u < 0 || u > 1) return null;
			const r = r0 + u * 170, a = 0.85;
			return <path key={i} d={`M${x + dir * r * Math.cos(a)} ${y - r * Math.sin(a)}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x + dir * r * Math.cos(a)} ${y + r * Math.sin(a)}`} opacity={(1 - u) * 0.95} />; })}</g>;
};
/** a soft gold cloud (breath / mist): a cluster of glowing puffs centred at x, y */
export const Puff: React.FC<{x: number; y: number; r: number; t: number; o?: number; seed?: number; c?: string}> = ({x, y, r, t, o = 1, seed = 1, c = 'gold'}) => {
	if (o <= 0) return null; const R = rng(seed);
	return <g opacity={o} style={{mixBlendMode: 'screen'}}>{Array.from({length: 7}, (_, i) => { const a = R() * 6.28, d = R() * r * 0.6, ph = R() * 6.28;
		return <circle key={i} cx={x + Math.cos(a) * d + 6 * Math.sin(t * 1.3 + ph)} cy={y + Math.sin(a) * d * 0.7 + 5 * Math.cos(t * 1.1 + ph)} r={r * (0.45 + 0.35 * R())} fill={`url(#g60-${c})`} />; })}
		<circle cx={x} cy={y} r={r * 0.32} fill="#FFF3C4" opacity={0.75} /></g>;
};
/** twinkling 4-point sparkles in a box; u = how many are on (0..1) */
export const Sparkles61: React.FC<{box: [number, number, number, number]; t: number; n?: number; seed?: number; c?: string; r?: number; u?: number; rise?: number}> = ({box, t, n = 20, seed = 3, c = PAL.goldHi, r = 9, u = 1, rise = 0}) => {
	const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => { const x = box[0] + R() * (box[2] - box[0]), y0 = box[1] + R() * (box[3] - box[1]), ph = R() * 6.28, on = R() < u;
		const y = y0 - ((rise * t * (0.5 + R())) % (box[3] - box[1] + 1)), q = r * (0.5 + 0.5 * Math.abs(Math.sin(t * 2.2 + ph)));
		if (!on) return null;
		return <path key={i} d={`M${x} ${y - q}L${x + q * 0.28} ${y - q * 0.28}L${x + q} ${y}L${x + q * 0.28} ${y + q * 0.28}L${x} ${y + q}L${x - q * 0.28} ${y + q * 0.28}L${x - q} ${y}L${x - q * 0.28} ${y - q * 0.28}Z`} fill={c} opacity={0.6 + 0.4 * Math.sin(t * 3 + ph)} />; })}</g>;
};
/** horizontal wind streaks drifting (dir +1 = to the right) */
export const Wind61: React.FC<{box: [number, number, number, number]; t: number; n?: number; seed?: number; o?: number; dir?: 1 | -1; speed?: number; c?: string; w?: number}> = ({box, t, n = 8, seed = 2, o = 0.85, dir = 1, speed = 420, c = '#FFFFFF', w = 6}) => {
	const R = rng(seed), [x0, y0, x1, y1] = box, W = x1 - x0 + 400;
	return <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o}>{Array.from({length: n}, (_, i) => {
		const y = y0 + R() * (y1 - y0), off = R() * W, len = 140 + R() * 160, sp = speed * (0.7 + 0.6 * R());
		const xx = x0 - 200 + ((((dir > 0 ? 1 : -1) * t * sp + off) % W) + W) % W, X = dir > 0 ? xx : x1 + x0 - xx;
		return <path key={i} d={`M${X} ${y}q${len / 4} ${-14} ${len / 2} 0t${len / 2} 0`} opacity={0.5 + 0.5 * Math.sin((xx / W) * Math.PI)} />; })}</g>;
};
/** a radial burst of rays (sun) */
export const Rays61: React.FC<{x: number; y: number; r0: number; r1: number; n?: number; c?: string; o?: number; rot?: number}> = ({x, y, r0, r1, n = 24, c = PAL.goldHi, o = 0.8, rot = 0}) => <g opacity={o}>{Array.from({length: n}, (_, i) => {
	const a = (i / n) * Math.PI * 2 + rot, w = 0.055, rr = r1 * (i % 2 ? 0.86 : 1);
	return <path key={i} d={poly([[x + Math.cos(a - w) * r0, y + Math.sin(a - w) * r0], [x + Math.cos(a) * rr, y + Math.sin(a) * rr], [x + Math.cos(a + w) * r0, y + Math.sin(a + w) * r0]])} fill={c} />; })}</g>;
/** the red sun disc with a gold inner ring */
export const Disc61: React.FC<{x: number; y: number; r: number; c?: string}> = ({x, y, r, c = PAL.red}) => <g><circle cx={x} cy={y} r={r + 5} fill={PAL.ink} /><circle cx={x} cy={y} r={r} fill={c} />
	<circle cx={x} cy={y} r={r * 0.8} fill="none" stroke={PAL.gold} strokeWidth={Math.max(3, r * 0.05)} /></g>;
/** a plain picture background (vertical gradient) across the visible world; id must be unique */
export const Sky61: React.FC<{id: string; a: string; b: string; x0?: number; x1?: number; y0?: number; y1?: number; mid?: string}> = ({id, a, b, mid, x0 = -400, x1 = 1840, y0 = -200, y1 = 1200}) => <g>
	<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} />{mid && <stop offset="0.55" stopColor={mid} />}<stop offset="1" stopColor={b} /></linearGradient></defs>
	<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${id})`} /></g>;
/** the floor band from y down (with an ink edge) */
export const Floor61: React.FC<{y?: number; c?: string; c2?: string; x0?: number; x1?: number}> = ({y = GY, c = PAL.mat, c2 = PAL.mat2, x0 = -400, x1 = 1840}) => <g>
	<rect x={x0} y={y} width={x1 - x0} height={1200 - y} fill={c} /><rect x={x0} y={y} width={x1 - x0} height={7} fill={c2} /><rect x={x0} y={y - 2} width={x1 - x0} height={3} fill={PAL.ink} opacity={0.75} /></g>;
/** a simple running / fleeing silhouette (legs cycle), facing +x; k varies the headdress */
export const Runner: React.FC<{x: number; y: number; s: number; t: number; k?: number; c?: string; ph?: number; arms?: boolean}> = ({x, y, s, t, k = 0, c = '#1A0402', ph = 0, arms = true}) => {
	const a = Math.sin(t * 9 + ph), b = Math.cos(t * 9 + ph);
	return <g transform={`translate(${x},${y}) scale(${s})`} fill={c} stroke={c} strokeLinecap="round">
		<path d={`M0 -4.1L${1.3 * a} -0.1M0 -4.1L${-1.3 * a} -0.1`} strokeWidth={0.62} fill="none" />
		<path d={poly([[-0.55, -4.2], [0.75, -4.4], [1.05, -7.4], [-0.25, -7.5]])} stroke="none" />
		{arms && <path d={`M0.6 -7.0L${0.6 + 1.5 * b} ${-5.6 - 0.9 * a}M0.4 -7.0L${0.4 - 1.4 * b} ${-5.4 + 0.8 * a}`} strokeWidth={0.45} fill="none" />}
		<circle cx={0.75} cy={-8.35} r={0.82} stroke="none" />
		{k % 3 === 0 && <path d={poly([[-0.2, -8.6], [-0.9, -7.5], [0.2, -7.9]])} stroke="none" />}
		{k % 3 === 1 && <path d="M0.3 -9.1L1.4 -9.1" strokeWidth={0.3} />}
	</g>;
};
