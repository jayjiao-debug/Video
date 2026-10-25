import React from 'react';
import {W, H, bubi, grounded, walkPose, shop, lerp, cl, rnd, KAI, SANS, SERIF, seg, ease} from './kit50';
import {B, BG, thB, RimFig, NearArm, Cowrie} from './styleB';
import {Pose, Look4} from '../qq44/figure44';
/* ep50 PartB props and helpers. Copies of the KF50 helpers that are not exported there (KF50.tsx registers its own root,
   so it cannot be imported into the film), plus the second-half props: the 宝钞, a generic 1948 note, the passing pillar,
   lanterns, the cart, the lying iron string. Builder B owns this file. */
export type P2 = [number, number];
export const STRIDE = 0.9759, GAIT_S = 1.325;
/** natural walking speed in px/s for a walker h px tall */
export const vNat = (h: number) => STRIDE * h / GAIT_S;

/* ---------- the walker's costumes (same table as KF50) ---------- */
export const LOOKS: Record<string, Look4> = {
	song: {dress: 'tunic', legs: 'trousers', head: 'futou'},
	ming: {dress: 'robe', head: 'cylcap'},
	y1948: {dress: 'jacket', legs: 'trousers', head: 'cap'},
	today: {dress: 'jacket', legs: 'trousers', head: 'short'},
};
export const CLERK: Look4 = {dress: 'robe', head: 'futou', beard: 'short', build: 1.06};
export const OFFICIAL: Look4 = {dress: 'robe', head: 'futou', beard: 'long', build: 1.1};
export const NOODLE: Look4 = {dress: 'dress', head: 'bun', build: 1.04};
export const SILVERSMITH: Look4 = {dress: 'robe', head: 'cylcap', beard: 'short', build: 1.06};

/* ---------- pose helpers (copied from KF50) ---------- */
export const UP = 0.194, FO = 0.135;
export const ikArm = (p: Pose, s: 'L' | 'R', grip: P2, elbowDown = true): Pose => {
	const sh = p[`${s}Sh`], dx0 = grip[0] - sh[0], dy0 = grip[1] - sh[1], d0 = Math.hypot(dx0, dy0) || 1;
	const tx = grip[0] - dx0 / d0 * 0.03, ty = grip[1] - dy0 / d0 * 0.03;
	const dx = tx - sh[0], dy = ty - sh[1], L = Math.min(Math.hypot(dx, dy), UP + FO - 1e-3), ph = Math.atan2(dy, dx);
	const al = Math.acos(cl((UP * UP + L * L - FO * FO) / (2 * UP * L), -1, 1));
	const e1: P2 = [sh[0] + UP * Math.cos(ph + al), sh[1] + UP * Math.sin(ph + al)], e2: P2 = [sh[0] + UP * Math.cos(ph - al), sh[1] + UP * Math.sin(ph - al)];
	const el = elbowDown ? (e1[1] < e2[1] ? e1 : e2) : (e1[1] < e2[1] ? e2 : e1);
	return {...p, [`${s}Elb`]: el, [`${s}Hand`]: [sh[0] + L * Math.cos(ph), sh[1] + L * Math.sin(ph)]};
};
export const toBody = (X: number, Y: number, x: number, g: number, h: number, flip = false): P2 => [(flip ? -1 : 1) * (X - x) / h, (g - Y) / h];
export const J = (p: Pose, n: string, x: number, g: number, h: number, flip = false): P2 => [x + (flip ? -1 : 1) * p[n][0] * h, g - p[n][1] * h];
export const mix = (a: Pose, b: Pose, k: number): Pose => { const o: Pose = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
const UPPER = ['Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'LElb', 'LHand', 'RSh', 'RElb', 'RHand'];
/** legs from a, upper body from b (re-attached at a's hips) */
export const graft = (a: Pose, b: Pose, k = 1): Pose => { const dx = a.Hips[0] - b.Hips[0], dy = a.Hips[1] - b.Hips[1], o: Pose = {...a};
	for (const n of UPPER) o[n] = [lerp(a[n][0], b[n][0] + dx, k), lerp(a[n][1], b[n][1] + dy, k)]; return o; };
/** a grip point relative to the hips (body units) */
export const rel = (p: Pose, dx: number, dy: number): P2 => [p.Hips[0] + dx, p.Hips[1] + dy];
export const STAND = grounded({lean: 3, neck: 4, lt: 3, lk: 3, rt: -4, rk: 4, la: 4, le: 12, ra: 4, re: 14});
/** the iron-string carrier (KF07): torso back, loaded shoulder dropped, near arm plumb */
export const carrierPose = (sway = 0): Pose => {
	const p = grounded({lean: -14 - 0.3 * sway, neck: 16, lt: 18, lk: 28, rt: -16, rk: 24, la: 0, le: 0, ra: -40, re: 16});
	const sh = p.LSh, s2: P2 = [sh[0] - 0.012, sh[1] - 0.045];
	p.LSh = s2; p.LElb = [s2[0], s2[1] - UP]; p.LHand = [s2[0], s2[1] - UP - FO];
	return p; };
/** walking under the string: the walk's legs, the carrier's upper body; the free arm swings a little */
export const carryWalk = (phase: number, sway: number): Pose => { const w = walkPose(phase), c = carrierPose(sway);
	const o = graft(w, c, 1), ra = -40 + 14 * Math.sin(2 * Math.PI * phase), sh = o.RSh, a = ra * Math.PI / 180, e: P2 = [sh[0] + Math.sin(a) * UP, sh[1] - Math.cos(a) * UP], a2 = (ra + 16) * Math.PI / 180;
	o.RElb = e; o.RHand = [e[0] + Math.sin(a2) * FO, e[1] - Math.cos(a2) * FO];
	/* heavy steps: the body sinks a little on each stride */
	const sink = 0.012 * Math.abs(Math.sin(2 * Math.PI * phase));
	for (const n of UPPER.concat(['Hips'])) o[n] = [o[n][0], o[n][1] - sink];
	return o; };

/* ---------- the iron loop (copy of styleB's, with the shadow optional so it can lie on a counter) ---------- */
export const IronLoopB: React.FC<{x: number; y: number; L: number; th: number; shadow?: boolean; sc?: number}> = ({x, y, L, th, shadow = true, sc = 1}) => {
	const cl2: P2[] = [], N = 80, br = 30 * sc;
	for (let i = 0; i <= N; i++) { const u = i / N; let p: P2;
		if (u < 0.4) { const v = u / 0.4; p = [lerp(-3 * sc, -br, Math.pow(v, 0.8)), lerp(0, L - br, v)]; }
		else if (u > 0.6) { const v = (1 - u) / 0.4; p = [lerp(3 * sc, br, Math.pow(v, 0.8)), lerp(0, L - br, v)]; }
		else { const a = Math.PI * (1 - (u - 0.4) / 0.2); p = [br * Math.cos(a), L - br + br * Math.sin(a) * 0.9]; }
		cl2.push(p); }
	const rot = (p: P2): P2 => { const d = Math.hypot(p[0], p[1]), a = th * (0.75 + 0.25 * d / L) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
		return [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c]; };
	const P = cl2.map(rot), coins: React.ReactNode[] = [];
	let acc = 0, next = 0, k = 0;
	for (let i = 1; i < P.length; i++) { const [ax, ay] = P[i - 1], [bx, by] = P[i], s2 = Math.hypot(bx - ax, by - ay);
		while (next <= acc + s2) { const f = (next - acc) / s2, cx = lerp(ax, bx, f), cy = lerp(ay, by, f), ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
			coins.push(<ellipse key={k} cx={cx} cy={cy} rx={3.4 * sc} ry={13 * sc} transform={`rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cy.toFixed(1)})`} fill={k % 2 ? '#545B61' : '#737C83'} stroke="#1E2023" strokeWidth={1} />); k++; next += 4.4 * sc; }
		acc += s2; }
	const bot = rot([0, L - 2]);
	return <g>
		{shadow && <ellipse cx={bot[0]} cy={y + L + 26 * sc} rx={40 * sc} ry={6 * sc} fill="#000" opacity={0.28} />}
		{coins}
		{[[-15, -14, -20], [0, -6, 8], [15, -14, 24]].map(([dx, dy, r], i) => { const [cx, cy] = rot([dx * sc, L + dy * sc]);
			return <g key={i} transform={`rotate(${r + th},${cx},${cy})`}><circle cx={cx} cy={cy} r={14 * sc} fill="#636A70" stroke="#A9B1B7" strokeWidth={2} /><rect x={cx - 4.5 * sc} y={cy - 4.5 * sc} width={9 * sc} height={9 * sc} fill={B.lac} /></g>; })}
	</g>;
};
/** the walker with the string in the near fist: cords from the fist into the loop, the loop to the ground, dust where it drags */
export const CarrierFig: React.FC<{x: number; g: number; h: number; pose: Pose; look: Look4; sway: number; T?: number; drag?: number}> = ({x, g, h, pose, look, sway, T = 0, drag = 0}) => {
	const lh = J(pose, 'LHand', x, g, h), sh = J(pose, 'LSh', x, g, h), cordTop = lh[1] + 0.03 * h, loopTop = lh[1] + 0.058 * h + 26;
	return <g>
		<RimFig x={x} ground={g} h={h} pose={pose} look={look} col={B.lac} T={T} dx={3} dy={-2.5} />
		<path d={`M${lh[0] - 3},${cordTop} L${lh[0] - 5},${loopTop + 4} M${lh[0] + 3},${cordTop} L${lh[0] + 5},${loopTop + 4}`} stroke="#B08850" strokeWidth={4} strokeLinecap="round" />
		<IronLoopB x={lh[0]} y={loopTop} L={g - loopTop + 2} th={sway} />
		<path d={`M${lh[0] - 60 - 30 * drag},${g + 3} q50,-16 140,-2 M${lh[0] + 40},${g - 2} q16,-10 36,-6`} stroke="#C8A070" strokeOpacity={0.35} strokeWidth={2.5} fill="none" strokeLinecap="round" />
		<NearArm sh={sh} hand={lh} h={h} />
	</g>; };

/* ---------- money props (copied from KF50) ---------- */
export const BronzeDefs: React.FC = () => <defs>
	<linearGradient id="brz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2C98A" /><stop offset="0.35" stopColor="#C98E4A" /><stop offset="0.6" stopColor="#A86E34" /><stop offset="0.8" stopColor="#E0AE6C" /><stop offset="1" stopColor="#8A5626" /></linearGradient>
	<linearGradient id="slv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F8FA" /><stop offset="0.35" stopColor="#C4CDD3" /><stop offset="0.55" stopColor="#FFFFFF" /><stop offset="0.75" stopColor="#B0BAC1" /><stop offset="1" stopColor="#8D979E" /></linearGradient>
	<linearGradient id="ironF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8D949A" /><stop offset="0.5" stopColor="#5A6066" /><stop offset="1" stopColor="#3E4348" /></linearGradient>
</defs>;
export const RoundCoin: React.FC<{x: number; y: number; r: number; legend?: string[]; fill?: string; sy?: number; rot?: number; hole?: 'sq' | 'round'; ink?: string}> = ({x, y, r, legend = [], fill = 'url(#brz)', sy = 1, rot = 0, hole = 'sq', ink = '#5A3414'}) => {
	const fs = r * 0.62, pos: P2[] = [[0, -r * 0.6], [0, r * 0.6], [r * 0.6, 0], [-r * 0.6, 0]];
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(1,${sy})`}>
		<circle r={r} fill={fill} stroke="#5A3A18" strokeWidth={Math.max(1.5, r * 0.04)} />
		<circle r={r * 0.86} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} />
		{hole === 'sq' ? <><rect x={-r * 0.22} y={-r * 0.22} width={r * 0.44} height={r * 0.44} fill={B.lac} /><rect x={-r * 0.3} y={-r * 0.3} width={r * 0.6} height={r * 0.6} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} /></>
			: <circle r={r * 0.2} fill={B.lac} />}
		{legend.map((c, i) => c && <text key={i} x={pos[i][0]} y={pos[i][1] + fs * 0.36} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={fs} fill={ink} opacity={0.9}>{c}</text>)}
	</g>; };
export const BuCoin: React.FC<{x: number; y: number; Hh: number; rot?: number}> = ({x, y, Hh, rot = 0}) => { const b = bubi(Hh);
	return <g transform={`translate(${x},${y}) rotate(${rot})`}><path d={b.body} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><path d={b.hole} fill={B.lac} /><path d={b.ribs} stroke="#6B4520" strokeWidth={Math.max(1.5, Hh * 0.012)} opacity={0.6} fill="none" /></g>; };
export const Ingot: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => { const k = w / 10;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		<path d={`M${-k * 5},${-k * 2.4} Q${-k * 4.4},${-k * 0.4} ${-k * 3},${k * 0.4} Q${-k * 2.2},${k * 1.6} 0,${k * 1.7} Q${k * 2.2},${k * 1.6} ${k * 3},${k * 0.4} Q${k * 4.4},${-k * 0.4} ${k * 5},${-k * 2.4} Q${k * 3.6},${-k * 1.5} ${k * 2.4},${-k * 1.1} Q0,${-k * 0.8} ${-k * 2.4},${-k * 1.1} Q${-k * 3.6},${-k * 1.5} ${-k * 5},${-k * 2.4} Z`} fill="url(#slv)" stroke="#59636A" strokeWidth={2} />
		<ellipse cx={0} cy={-k * 1.15} rx={k * 2.3} ry={k * 0.7} fill="url(#slv)" stroke="#6D777E" strokeWidth={1.5} />
		<path d={`M${-k * 1.4},${-k * 1.3} l${k * 0.5},${k * 0.25} M${-k * 0.4},${-k * 1.45} l0,${k * 0.5} M${k * 0.5},${-k * 1.35} l${k * 0.45},${k * 0.3} M${k * 1.3},${-k * 1.2} l${-k * 0.3},${k * 0.35} M${-k * 0.9},${k * 0.6} l${k * 1.8},0`} stroke="#4E585F" strokeWidth={Math.max(1.4, k * 0.12)} strokeLinecap="round" />
	</g>; };
export const PhoneP: React.FC<{x: number; y: number; w: number; rot?: number; check?: number; glow?: number; num?: string}> = ({x, y, w, rot = 0, check = 1, glow = 1, num}) => { const hh = w * 1.9;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={w * 0.14} fill={B.lac} stroke={B.gold} strokeWidth={Math.max(1.5, w * 0.04)} />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#3A2A20" />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#FFD9A0" opacity={0.22 * glow} />
		{check > 0 && <g opacity={check}><circle cx={0} cy={0} r={w * 0.26} fill="none" stroke={B.goldL} strokeWidth={w * 0.06} /><path d={`M${-w * 0.13},0 l${w * 0.1},${w * 0.11} l${w * 0.19},${-w * 0.22}`} fill="none" stroke={B.goldL} strokeWidth={w * 0.07} strokeLinecap="round" strokeLinejoin="round" /></g>}
		{num && <text x={0} y={w * 0.12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={w * 0.32} fill={B.goldL}>{num}</text>}
	</g>; };
/** a standing balance; tilt in degrees (+ = left pan down). Pan contents are placed at the pan's bottom centre. */
export const Bal: React.FC<{x: number; g: number; post: number; arm: number; tilt?: number; left?: React.ReactNode; right?: React.ReactNode; o?: number; drop?: number}> = ({x, g, post, arm, tilt = 0, left, right, o = 1, drop = 150}) => {
	const top: P2 = [x, g - post], a = tilt * Math.PI / 180, L: P2 = [top[0] - arm * Math.cos(a), top[1] + arm * Math.sin(a)], R: P2 = [top[0] + arm * Math.cos(a), top[1] - arm * Math.sin(a)];
	const pan = (p: P2, child: React.ReactNode) => { const py = p[1] + drop;
		return <g><path d={`M${p[0]},${p[1]} L${p[0] - 80},${py} M${p[0]},${p[1]} L${p[0] + 80},${py} M${p[0]},${p[1]} L${p[0]},${py - 6}`} stroke={B.gold} strokeOpacity={0.55} strokeWidth={1.6} />
			<path d={`M${p[0] - 96},${py} Q${p[0]},${py + 46} ${p[0] + 96},${py} Z`} fill="#3A2116" stroke={B.gold} strokeOpacity={0.7} strokeWidth={2} />
			<g transform={`translate(${p[0]},${py})`}>{child}</g></g>; };
	return <g opacity={o}>
		<path d={`M${x - 110},${g} L${x + 110},${g} L${x + 70},${g - 26} L${x - 70},${g - 26} Z`} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<rect x={x - 7} y={g - post} width={14} height={post - 24} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<path d={`M${L[0]},${L[1]} L${R[0]},${R[1]}`} stroke="#C69A55" strokeWidth={9} strokeLinecap="round" />
		<path d={`M${x},${g - post - 30} L${x - 9},${g - post + 4} L${x + 9},${g - post + 4} Z`} fill="#C69A55" />
		<circle cx={x} cy={g - post} r={9} fill={B.lac} stroke="#C69A55" strokeWidth={3} />
		{pan(L, left)}{pan(R, right)}
	</g>; };
/** where a pan's bottom centre is (for placing things that fly onto it) */
export const panAt = (x: number, g: number, post: number, arm: number, tilt: number, side: 'L' | 'R', drop = 150): P2 => { const a = tilt * Math.PI / 180, s = side === 'L' ? -1 : 1;
	return [x + s * arm * Math.cos(a), g - post - s * arm * Math.sin(a) + drop]; };
export const Weight: React.FC<{s?: number}> = ({s = 1}) => <g transform={`scale(${s})`}><path d="M-30,-4 L-26,-40 L26,-40 L30,-4 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><path d="M-18,-40 L-14,-62 L14,-62 L18,-40 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /></g>;

/* ---------- labels ---------- */
export const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={KAI} fontWeight={700} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={6} style={{paintOrder: 'stroke'}}>{s}</text>;
/** a cream tag on a thin string (the film's label style) */
export const Tag: React.FC<{x: number; y: number; s: string; fs?: number; o?: number; rot?: number; w?: number}> = ({x, y, s, fs = 32, o = 1, rot = 0, w}) => { const ww = w ?? fs * s.length * 1.02 + 30;
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}><rect x={-ww / 2} y={-fs * 0.95} width={ww} height={fs * 1.45} rx={6} fill={B.cream} opacity={0.94} />
		<text x={0} y={fs * 0.22} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={fs} fill={B.lac}>{s}</text></g>; };

/* ---------- sets ---------- */
export const GroundW: React.FC<{g: number; x0?: number; x1?: number; lattice?: boolean}> = ({g, x0 = -60, x1 = W + 60, lattice = true}) => { const n = Math.ceil((x1 - x0) / 90) + 1, s0 = Math.floor(x0 / 90) * 90;
	return <g>
		<rect x={x0} y={g} width={x1 - x0} height={H - g + 300} fill={BG.ground} /><rect x={x0} y={g} width={x1 - x0} height={3} fill={B.gold} opacity={0.28} />
		{lattice && <path d={Array.from({length: n}, (_, i) => `M${s0 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
	</g>; };
/** a Song shopfront row; shops = [x, w, h] in world px */
export const ShopRow: React.FC<{g: number; shops: [number, number, number][]; wall?: [number, number]; noCounter?: number[]}> = ({g, shops, wall, noCounter = []}) => <g>
	{wall && <rect x={wall[0]} y={575} width={wall[1] - wall[0]} height={g - 575} fill={BG.wall} />}
	{shops.map(([x0, w, h], i) => { const s = shop(x0, g - 4, w, h); return <g key={i}>
		<path d={s.roof} fill={BG.roof} stroke={BG.lineS} strokeWidth={2} /><path d={s.tiles} stroke={BG.line} strokeWidth={1.4} opacity={0.6} />
		<path d={s.posts} fill={BG.post} stroke={BG.line} strokeWidth={1} /><path d={s.beam} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={s.sign} fill={BG.roof} stroke={BG.line} strokeWidth={1.5} />{!noCounter.includes(i) && <path d={s.counter} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />}
		<path d={s.shutter} stroke="#170B08" strokeWidth={7} /></g>; })}
</g>;
export const FarRoofsW: React.FC<{y?: number; x0?: number; n?: number}> = ({y = 560, x0 = -260, n = 8}) => { const far = Array.from({length: n}, (_, i) => shop(x0 + i * 330, y, 300, 120 + 50 * rnd(i, 3)));
	return <g><g fill={B.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><g fill="none" stroke={B.ochre} strokeWidth={1.5} opacity={0.16}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><rect x={x0 - 100} y={y} width={n * 330 + 400} height={H - y + 200} fill={B.far} /></g>; };
/** a foreground pillar passing the camera (era wipes): dark lacquer (or vermilion) with gold edge lines, full height */
export const Pillar: React.FC<{x: number; w: number; red?: boolean}> = ({x, w, red}) => <g>
	<defs><linearGradient id={`pil${red ? 'r' : 'd'}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={red ? '#3A120B' : '#0B0503'} /><stop offset="0.35" stopColor={red ? '#6A2414' : '#1E0F0A'} /><stop offset="0.55" stopColor={red ? '#5A1E10' : '#170B07'} /><stop offset="1" stopColor={red ? '#2A0C07' : '#080302'} /></linearGradient></defs>
	<rect x={x} y={-40} width={w} height={H + 80} fill={`url(#pil${red ? 'r' : 'd'})`} />
	<rect x={x + w * 0.08} y={-40} width={2.5} height={H + 80} fill={B.gold} opacity={0.35} /><rect x={x + w * 0.92} y={-40} width={2.5} height={H + 80} fill={B.gold} opacity={0.25} />
	{[0.18, 0.82].map((v, i) => <rect key={i} x={x - 6} y={H * v} width={w + 12} height={26} fill={red ? '#2A0C07' : '#0A0402'} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />)}
</g>;
/** a hanging lantern; lit 0..1 */
export const Lantern: React.FC<{x: number; y: number; r?: number; lit: number}> = ({x, y, r = 14, lit}) => <g>
	<rect x={x - 1} y={y - r * 2} width={2} height={r * 0.9} fill={BG.post} />
	<ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill={lit > 0.02 ? `rgb(${Math.round(lerp(62, 255, lit))},${Math.round(lerp(26, 168, lit))},${Math.round(lerp(18, 80, lit))})` : BG.red} stroke={B.gold} strokeOpacity={0.25 + 0.4 * lit} strokeWidth={1.2} />
	<ellipse cx={x - r * 0.25} cy={y - r * 0.3} rx={r * 0.35} ry={r * 0.5} fill="#FFF1C8" opacity={0.6 * lit} />
	<rect x={x - r * 0.45} y={y + r * 1.15} width={r * 0.9} height={r * 0.25} fill={BG.post} />
</g>;

/* ---------- paper money (our own generic designs; no real note is copied) ---------- */
const marks = (x: number, y: number, c: number, seed: number) => { const r = (k: number) => rnd(seed * 7 + k, 11), d: string[] = [], f = (v: number) => v.toFixed(1), n = 3 + Math.floor(r(0) * 2);
	for (let i = 0; i < n; i++) { const cy = y + c * (0.15 + 0.7 * (i + 0.5) / n), cx = x + c * (0.25 + 0.5 * r(i + 1)), len = c * (0.28 + 0.4 * r(i + 7)), a = (r(i + 13) > 0.5 ? 1 : -1) * (12 + 50 * r(i + 19)) * Math.PI / 180;
		d.push(`M${f(cx - Math.cos(a) * len / 2)},${f(cy - Math.sin(a) * len / 2)}l${f(Math.cos(a) * len)},${f(Math.sin(a) * len)}`); }
	return d.join(''); };
/** the 交子 in printing passes: 'red' = paper + red band (+ the small seal), 'black' = the black layer, 'seal' = the big red seal */
export const JiaoziPass: React.FC<{w: number; h: number; pass: 'paper' | 'red' | 'black' | 'seal'}> = ({w, h, pass}) => {
	const red = '#BF3420', ink = '#22150F', paper = '#F5E9CB', X = (u: number) => u * w, Y = (v: number) => v * h;
	const bw = X(0.075), bx = X(0.025) + bw / 2;
	const diamonds = (x0: number, y0: number, x1: number, y1: number, n: number) => Array.from({length: n}, (_, i) => { const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u), s = X(0.022);
		return `M${x.toFixed(1)},${(y - s).toFixed(1)}l${s.toFixed(1)},${s.toFixed(1)}l${(-s).toFixed(1)},${s.toFixed(1)}l${(-s).toFixed(1)},${(-s).toFixed(1)}Z`; }).join('');
	if (pass === 'paper') return <g><rect width={w} height={h} fill={paper} /><rect width={w} height={h} fill="#C9A76A" opacity={0.12} /></g>;
	if (pass === 'red') return <g>
		<rect x={bx} y={bx} width={w - 2 * bx} height={h - 2 * bx} fill="none" stroke={red} strokeWidth={bw} />
		<path d={diamonds(bx, bx, bx, h - bx, 13) + diamonds(w - bx, bx, w - bx, h - bx, 13) + diamonds(bx, bx, w - bx, bx, 6) + diamonds(bx, h - bx, w - bx, h - bx, 6)} fill={paper} />
		<rect x={X(0.2)} y={Y(0.205)} width={X(0.15)} height={X(0.15)} fill={red} opacity={0.88} /></g>;
	if (pass === 'seal') return <g opacity={0.88}><rect x={X(0.47)} y={Y(0.39)} width={X(0.34)} height={X(0.34)} fill={red} />
		<path d={`M${X(0.5)},${Y(0.39) + X(0.03)}h${X(0.28)}v${X(0.28)}h${-X(0.28)}Z M${X(0.54)},${Y(0.39) + X(0.09)}h${X(0.08)} M${X(0.54)},${Y(0.39) + X(0.15)}h${X(0.06)} M${X(0.54)},${Y(0.39) + X(0.21)}h${X(0.08)} M${X(0.67)},${Y(0.39) + X(0.08)}h${X(0.07)} M${X(0.68)},${Y(0.39) + X(0.14)}h${X(0.05)} M${X(0.67)},${Y(0.39) + X(0.2)}h${X(0.07)}`} stroke={paper} strokeWidth={Math.max(1, X(0.026))} fill="none" /></g>;
	const cols = 6, c = X(0.088), colW = X(0.62) / cols, mk: string[] = [];
	for (let k = 0; k < cols; k++) { const x = X(0.19) + (cols - 1 - k) * colW + (colW - c) / 2, n = k === 0 ? 5 : 4 + (k % 3 === 0 ? 0 : 1) + (k === 3 ? -1 : 0) + 1;
		for (let j = 0; j < n; j++) mk.push(marks(x, Y(0.215) + j * c * 1.14, c, k * 13 + j)); }
	const P = (u: number, v: number) => `${X(0.17 + 0.66 * u).toFixed(1)},${Y(0.625 + 0.255 * v).toFixed(1)}`;
	return <g>
		<rect x={X(0.13)} y={X(0.13)} width={X(0.74)} height={h - X(0.26)} fill="none" stroke={ink} strokeWidth={Math.max(1.4, X(0.018))} />
		<rect x={X(0.17)} y={Y(0.1)} width={X(0.66)} height={Y(0.085)} fill={ink} />
		<g stroke={paper} strokeWidth={Math.max(1.4, X(0.022))} strokeLinecap="round" fill="none">{[0, 1, 2].map((k) => <path key={k} d={marks(X(0.24) + k * X(0.19), Y(0.11), Y(0.065), 90 + k)} />)}</g>
		<path d={mk.join('')} stroke={ink} strokeWidth={Math.max(1, c * 0.13)} strokeLinecap="round" fill="none" />
		<rect x={X(0.17)} y={Y(0.625)} width={X(0.66)} height={Y(0.255)} fill="none" stroke={ink} strokeWidth={Math.max(1.2, X(0.014))} />
		<g fill={ink}>
			<path d={`M${P(0.04, 0.42)} Q${P(0.1, 0.36)} ${P(0.16, 0.18)} L${P(0.36, 0.18)} Q${P(0.42, 0.36)} ${P(0.5, 0.42)} Z`} />
			<path d={`M${P(0.08, 0.42)} H${X(0.17 + 0.66 * 0.46)} V${Y(0.625 + 0.255 * 0.9)} H${X(0.17 + 0.66 * 0.08)} Z`} />
			<circle cx={X(0.17 + 0.66 * 0.86)} cy={Y(0.625 + 0.255 * 0.36)} r={X(0.075)} />
			{[0.58, 0.72].map((u, k) => <g key={k}><circle cx={X(0.17 + 0.66 * u)} cy={Y(0.625 + 0.255 * 0.42)} r={X(0.028)} /><path d={`M${P(u - 0.045, 0.9)} L${P(u - 0.03, 0.52)} L${P(u + 0.035, 0.52)} L${P(u + 0.05, 0.9)} Z`} /></g>)}
			<rect x={X(0.17)} y={Y(0.625 + 0.255 * 0.9)} width={X(0.66)} height={Y(0.255 * 0.1)} />
		</g>
	</g>; };
/** the Ming 宝钞 (generic): grey mulberry paper, a heavy ink frame with a cloud band, a dark header, 壹貫 in the period face,
    ten strings of coins drawn as a picture, text columns of abstract strokes, two red seals. age 0..1 yellows and frays it */
export const Baochao: React.FC<{w: number; h: number; age?: number; id: string}> = ({w, h, age = 0, id}) => {
	const X = (u: number) => u * w, Y = (v: number) => v * h, ink = '#1E1612', red = '#B23A22';
	const paper = `rgb(${Math.round(lerp(226, 196, age))},${Math.round(lerp(219, 170, age))},${Math.round(lerp(200, 112, age))})`;
	/* the frayed outline: a ragged polygon whose teeth grow with age */
	const edge: string[] = [], N = 40;
	for (let i = 0; i < N; i++) { const u = i / N, j = age * (3 + 9 * rnd(i, 21)) * (w / 120);
		const p = u < 0.25 ? [X(u * 4), j] : u < 0.5 ? [w - j, Y((u - 0.25) * 4)] : u < 0.75 ? [X(1 - (u - 0.5) * 4), h - j] : [j, Y(1 - (u - 0.75) * 4)];
		edge.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`); }
	const coins: React.ReactNode[] = [];
	for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const cx = X(0.27 + c * 0.115), cy = Y(0.6 + r * 0.1);
		coins.push(<g key={`${r}${c}`}><path d={`M${cx},${cy - Y(0.035)} v${Y(0.07)}`} stroke={ink} strokeWidth={Math.max(1, X(0.012))} />{[-1, 0, 1].map((k) => <ellipse key={k} cx={cx} cy={cy + k * Y(0.022)} rx={X(0.035)} ry={Y(0.009)} fill="none" stroke={ink} strokeWidth={Math.max(0.8, X(0.01))} />)}</g>); }
	return <g>
		<defs><clipPath id={`bc${id}`}><polygon points={edge.join(' ')} /></clipPath></defs>
		<g clipPath={`url(#bc${id})`}>
			<rect width={w} height={h} fill={paper} />
			<rect x={X(0.05)} y={X(0.05)} width={X(0.9)} height={h - X(0.1)} fill="none" stroke={ink} strokeWidth={X(0.07)} />
			<path d={Array.from({length: 9}, (_, i) => `M${X(0.05)},${Y(0.08 + i * 0.105)} q${X(0.035)},${Y(0.025)} 0,${Y(0.05)} M${X(0.95)},${Y(0.08 + i * 0.105)} q${-X(0.035)},${Y(0.025)} 0,${Y(0.05)}`).join(' ')} stroke={paper} strokeWidth={Math.max(1, X(0.014))} fill="none" />
			<rect x={X(0.16)} y={Y(0.1)} width={X(0.68)} height={Y(0.075)} fill={ink} />
			<g stroke={paper} strokeWidth={Math.max(1.2, X(0.02))} strokeLinecap="round" fill="none">{[0, 1, 2, 3].map((k) => <path key={k} d={marks(X(0.2) + k * X(0.15), Y(0.105), Y(0.06), 40 + k)} />)}</g>
			<text x={X(0.5)} y={Y(0.39)} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={X(0.2)} fill={ink} letterSpacing={X(0.02)}>壹貫</text>
			<path d={[0, 1].map((k) => marks(X(0.2) + k * X(0.48), Y(0.21), X(0.12), 60 + k) + marks(X(0.2) + k * X(0.48), Y(0.21) + X(0.13), X(0.12), 63 + k)).join('')} stroke={ink} strokeWidth={Math.max(1, X(0.012))} strokeLinecap="round" fill="none" />
			<rect x={X(0.2)} y={Y(0.53)} width={X(0.6)} height={Y(0.235)} fill="none" stroke={ink} strokeWidth={Math.max(1, X(0.012))} />
			{coins}
			<path d={Array.from({length: 4}, (_, k) => marks(X(0.22 + k * 0.15), Y(0.79), X(0.11), 80 + k)).join('')} stroke={ink} strokeWidth={Math.max(1, X(0.012))} strokeLinecap="round" fill="none" />
			<rect x={X(0.52)} y={Y(0.74)} width={X(0.28)} height={X(0.28)} fill={red} opacity={0.82} />
			{age > 0 && <rect width={w} height={h} fill="#6B4A1E" opacity={0.25 * age} />}
			{age > 0.3 && [0, 1, 2].map((k) => <circle key={k} cx={X(0.25 + 0.3 * rnd(k, 31))} cy={Y(0.2 + 0.6 * rnd(k, 33))} r={X(0.04) * (age - 0.3) * 2} fill={B.lac} opacity={0.8} />)}
		</g>
	</g>; };
/** a generic modern paper note (1948 on): no portrait, no emblem, no text; a frame, a rosette and guilloche lines */
export const PlainNote: React.FC<{w: number; h: number}> = ({w, h}) => <g>
	<rect width={w} height={h} rx={w * 0.02} fill="#D9D6B8" stroke="#6E6A4A" strokeWidth={1.5} />
	<rect x={w * 0.05} y={h * 0.1} width={w * 0.9} height={h * 0.8} fill="none" stroke="#5F6E52" strokeWidth={Math.max(1, w * 0.012)} />
	<circle cx={w * 0.72} cy={h * 0.5} r={h * 0.27} fill="none" stroke="#7A5A3A" strokeWidth={Math.max(1, w * 0.01)} />
	<circle cx={w * 0.72} cy={h * 0.5} r={h * 0.16} fill="none" stroke="#7A5A3A" strokeWidth={Math.max(1, w * 0.008)} />
	<path d={Array.from({length: 4}, (_, i) => `M${w * 0.1},${h * (0.3 + i * 0.13)} q${w * 0.1},${-h * 0.08} ${w * 0.2},0 t${w * 0.2},0`).join(' ')} stroke="#5F6E52" strokeWidth={Math.max(0.8, w * 0.008)} fill="none" opacity={0.8} />
</g>;
export {Cowrie, thB, seg, ease};
