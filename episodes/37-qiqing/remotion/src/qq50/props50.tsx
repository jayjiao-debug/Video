import React from 'react';
import {W, H, bubi, grounded, shop, lerp, cl, rnd, KAI, SERIF, furrows, treeD} from './kit50';
import {B, BG, RimFig, IronLoop, NearArm} from './styleB';
import {Pose, Look4} from '../qq44/figure44';
/* ep50 shared props and sets (copied from the approved KF50 key frames, exported so PartA and PartB can use them without
   importing KF50.tsx, which registers its own root). Add only; don't change these signatures. */
type P2 = [number, number];
export type {P2};
export const LOOKS: Record<string, {look: Look4; label: string; note: string}> = {
	shang: {look: {dress: 'tunic', legs: 'bare', head: 'bun'}, label: '商', note: '短衣 · 发髻'},
	zhou: {look: {dress: 'robe', head: 'bun'}, label: '东周 · 战国', note: '深衣 · 发髻'},
	qin: {look: {dress: 'tunic', legs: 'trousers', head: 'bun'}, label: '秦', note: '短襦 · 侧髻'},
	han: {look: {dress: 'robe', head: 'guan'}, label: '汉', note: '袍 · 小冠'},
	tang: {look: {dress: 'robe', head: 'futou'}, label: '唐', note: '圆领袍 · 幞头'},
	song: {look: {dress: 'tunic', legs: 'trousers', head: 'futou'}, label: '北宋', note: '短褐 · 软脚幞头'},
	ming: {look: {dress: 'robe', head: 'cylcap'}, label: '明', note: '直身 · 四方巾'},
	y1948: {look: {dress: 'jacket', legs: 'trousers', head: 'cap'}, label: '1948', note: '布褂 · 便帽'},
	today: {look: {dress: 'jacket', legs: 'trousers', head: 'short'}, label: '今天', note: '夹克 · 短发'},
};
export const CLERK: Look4 = {dress: 'robe', head: 'futou', beard: 'short', build: 1.06};
export const NOODLE: Look4 = {dress: 'dress', head: 'bun', build: 1.04};


/* ---------- pose helpers: a 2-bone arm IK so hands land on what they hold (body units: x forward, y up, feet at 0) ---------- */
export const UP = 0.194, FO = 0.135;
export const ikArm = (p: Pose, s: 'L' | 'R', grip: P2, elbowDown = true): Pose => {
	const sh = p[`${s}Sh`], dx0 = grip[0] - sh[0], dy0 = grip[1] - sh[1], d0 = Math.hypot(dx0, dy0) || 1;
	const tx = grip[0] - dx0 / d0 * 0.03, ty = grip[1] - dy0 / d0 * 0.03;   // the wrist sits a little short of the grip; the mitten closes on it
	const dx = tx - sh[0], dy = ty - sh[1], L = Math.min(Math.hypot(dx, dy), UP + FO - 1e-3), ph = Math.atan2(dy, dx);
	const al = Math.acos(cl((UP * UP + L * L - FO * FO) / (2 * UP * L), -1, 1));
	const e1: P2 = [sh[0] + UP * Math.cos(ph + al), sh[1] + UP * Math.sin(ph + al)], e2: P2 = [sh[0] + UP * Math.cos(ph - al), sh[1] + UP * Math.sin(ph - al)];
	const el = elbowDown ? (e1[1] < e2[1] ? e1 : e2) : (e1[1] < e2[1] ? e2 : e1);
	return {...p, [`${s}Elb`]: el, [`${s}Hand`]: [sh[0] + L * Math.cos(ph), sh[1] + L * Math.sin(ph)]};
};
export const toBody = (X: number, Y: number, x: number, g: number, h: number, flip = false): P2 => [(flip ? -1 : 1) * (X - x) / h, (g - Y) / h];
export const J = (p: Pose, n: string, x: number, g: number, h: number, flip = false): P2 => [x + (flip ? -1 : 1) * p[n][0] * h, g - p[n][1] * h];


export const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={KAI} fontWeight={700} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={6} style={{paintOrder: 'stroke'}}>{s}</text>;


/* ---------- money props (accent: the brightest things in frame) ---------- */
export const BronzeDefs: React.FC = () => <defs>
	<linearGradient id="brz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2C98A" /><stop offset="0.35" stopColor="#C98E4A" /><stop offset="0.6" stopColor="#A86E34" /><stop offset="0.8" stopColor="#E0AE6C" /><stop offset="1" stopColor="#8A5626" /></linearGradient>
	<linearGradient id="slv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F8FA" /><stop offset="0.35" stopColor="#C4CDD3" /><stop offset="0.55" stopColor="#FFFFFF" /><stop offset="0.75" stopColor="#B0BAC1" /><stop offset="1" stopColor="#8D979E" /></linearGradient>
	<linearGradient id="ironF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8D949A" /><stop offset="0.5" stopColor="#5A6066" /><stop offset="1" stopColor="#3E4348" /></linearGradient>
</defs>;
/** round coin with a square hole; legend = [top, bottom, right, left] (any may be ''), read in period order */
export const RoundCoin: React.FC<{x: number; y: number; r: number; legend?: string[]; fill?: string; sy?: number; rot?: number; hole?: 'sq' | 'round'}> = ({x, y, r, legend = [], fill = 'url(#brz)', sy = 1, rot = 0, hole = 'sq'}) => {
	const fs = r * 0.62, pos: P2[] = [[0, -r * 0.6], [0, r * 0.6], [r * 0.6, 0], [-r * 0.6, 0]];
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(1,${sy})`}>
		<circle r={r} fill={fill} stroke="#5A3A18" strokeWidth={Math.max(1.5, r * 0.04)} />
		<circle r={r * 0.86} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} />
		{hole === 'sq' ? <><rect x={-r * 0.22} y={-r * 0.22} width={r * 0.44} height={r * 0.44} fill={B.lac} /><rect x={-r * 0.3} y={-r * 0.3} width={r * 0.6} height={r * 0.6} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} /></>
			: <circle r={r * 0.2} fill={B.lac} />}
		{legend.map((c, i) => c && <text key={i} x={pos[i][0]} y={pos[i][1] + fs * 0.36} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={fs} fill="#5A3414" opacity={0.9}>{c}</text>)}
	</g>; };
export const knifeD = (L: number) => { const k = L / 10; return `M${0},${-k * 0.5} Q${k * 4},${-k * 1.2} ${k * 7.6},${-k * 0.9} Q${k * 9.6},${-k * 0.8} ${k * 10},${-k * 2.2} Q${k * 10.2},${k * 0.8} ${k * 7.2},${k * 0.7} Q${k * 3.8},${k * 0.6} ${k * 0.2},${k * 0.9} L${-k * 1.6},${k * 0.9} L${-k * 1.6},${-k * 0.5} Z`; };
export const KnifeCoin: React.FC<{x: number; y: number; L: number; rot?: number}> = ({x, y, L, rot = 0}) => { const k = L / 10;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}><path d={knifeD(L)} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} />
		<circle cx={-k * 2.6} cy={k * 0.2} r={k * 1.1} fill="none" stroke="url(#brz)" strokeWidth={k * 0.55} /><circle cx={-k * 2.6} cy={k * 0.2} r={k * 1.1} fill="none" stroke="#5A3A18" strokeWidth={1} />
		<path d={`M${k * 0.6},${-k * 0.2} L${k * 7.4},${-k * 0.25}`} stroke="#6B4520" strokeWidth={1.5} opacity={0.7} /></g>; };
export const AntCoin: React.FC<{x: number; y: number; L: number; rot?: number}> = ({x, y, L, rot = 0}) =>
	<g transform={`translate(${x},${y}) rotate(${rot})`}><ellipse rx={L * 0.36} ry={L * 0.5} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} />
		<path d={`M${-L * 0.12},${-L * 0.18} q${L * 0.12},${-L * 0.1} ${L * 0.24},0 M${-L * 0.1},${L * 0.02} l${L * 0.2},0 M0,${L * 0.1} l0,${L * 0.22}`} stroke="#5A3414" strokeWidth={Math.max(1.5, L * 0.05)} fill="none" strokeLinecap="round" />
		<circle cx={0} cy={-L * 0.38} r={L * 0.06} fill={B.lac} /></g>;
export const BuCoin: React.FC<{x: number; y: number; Hh: number; rot?: number; fill?: string}> = ({x, y, Hh, rot = 0, fill = 'url(#brz)'}) => { const b = bubi(Hh);
	return <g transform={`translate(${x},${y}) rotate(${rot})`}><path d={b.body} fill={fill} stroke="#5A3A18" strokeWidth={2} /><path d={b.hole} fill={B.lac} /><path d={b.ribs} stroke="#6B4520" strokeWidth={Math.max(1.5, Hh * 0.012)} opacity={0.6} fill="none" /></g>; };
/** Ming silver ingot (boat-shaped 银锭) with chiselled marks (abstract) */
export const Ingot: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => { const k = w / 10;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-k * 5},${-k * 2.4} Q${-k * 4.4},${-k * 0.4} ${-k * 3},${k * 0.4} Q${-k * 2.2},${k * 1.6} 0,${k * 1.7} Q${k * 2.2},${k * 1.6} ${k * 3},${k * 0.4} Q${k * 4.4},${-k * 0.4} ${k * 5},${-k * 2.4} Q${k * 3.6},${-k * 1.5} ${k * 2.4},${-k * 1.1} Q0,${-k * 0.8} ${-k * 2.4},${-k * 1.1} Q${-k * 3.6},${-k * 1.5} ${-k * 5},${-k * 2.4} Z`} fill="url(#slv)" stroke="#59636A" strokeWidth={2} />
		<ellipse cx={0} cy={-k * 1.15} rx={k * 2.3} ry={k * 0.7} fill="url(#slv)" stroke="#6D777E" strokeWidth={1.5} />
		<path d={`M${-k * 1.4},${-k * 1.3} l${k * 0.5},${k * 0.25} M${-k * 0.4},${-k * 1.45} l0,${k * 0.5} M${k * 0.5},${-k * 1.35} l${k * 0.45},${k * 0.3} M${k * 1.3},${-k * 1.2} l${-k * 0.3},${k * 0.35} M${-k * 0.9},${k * 0.6} l${k * 1.8},0`} stroke="#4E585F" strokeWidth={Math.max(1.4, k * 0.12)} strokeLinecap="round" />
	</g>; };
export const PhoneP: React.FC<{x: number; y: number; w: number; rot?: number; check?: boolean; glow?: number}> = ({x, y, w, rot = 0, check = true, glow = 1}) => { const hh = w * 1.9;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={w * 0.14} fill={B.lac} stroke={B.gold} strokeWidth={2.5} />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#3A2A20" />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#FFD9A0" opacity={0.22 * glow} />
		{check && <><circle cx={0} cy={0} r={w * 0.26} fill="none" stroke={B.goldL} strokeWidth={w * 0.06} /><path d={`M${-w * 0.13},0 l${w * 0.1},${w * 0.11} l${w * 0.19},${-w * 0.22}`} fill="none" stroke={B.goldL} strokeWidth={w * 0.07} strokeLinecap="round" strokeLinejoin="round" /></>}
	</g>; };
/** a standing balance (the film's motif: 半两 → 五铢 → 开元 → silver). tilt in degrees (+ = left pan down) */
export const Balance: React.FC<{x: number; g: number; post: number; arm: number; tilt?: number; left?: React.ReactNode; right?: React.ReactNode; tagR?: string}> = ({x, g, post, arm, tilt = 0, left, right, tagR}) => {
	const top: P2 = [x, g - post], a = -tilt * Math.PI / 180, L: P2 = [top[0] - arm * Math.cos(a), top[1] + arm * Math.sin(a) * -1], R: P2 = [top[0] + arm * Math.cos(a), top[1] - arm * Math.sin(a) * -1];
	const pan = (p: P2, child: React.ReactNode, tag?: string) => { const py = p[1] + 150;
		return <g><path d={`M${p[0]},${p[1]} L${p[0] - 80},${py} M${p[0]},${p[1]} L${p[0] + 80},${py} M${p[0]},${p[1]} L${p[0]},${py - 6}`} stroke={B.gold} strokeOpacity={0.55} strokeWidth={1.6} />
			<path d={`M${p[0] - 96},${py} Q${p[0]},${py + 46} ${p[0] + 96},${py} Z`} fill="#3A2116" stroke={B.gold} strokeOpacity={0.7} strokeWidth={2} />
			<g transform={`translate(${p[0]},${py})`}>{child}</g>
			{tag && <g transform={`translate(${p[0] + 70},${py - 120})`}><path d={`M-40,60 L0,0`} stroke={B.cream} strokeOpacity={0.5} strokeWidth={1.5} /><rect x={-4} y={-30} width={96} height={46} rx={5} fill={B.cream} opacity={0.92} /><text x={44} y={4} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={30} fill={B.lac}>{tag}</text></g>}
		</g>; };
	return <g>
		<path d={`M${x - 110},${g} L${x + 110},${g} L${x + 70},${g - 26} L${x - 70},${g - 26} Z`} fill="#2A1710" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<rect x={x - 7} y={g - post} width={14} height={post - 24} fill="#3A2116" stroke={B.gold} strokeOpacity={0.5} strokeWidth={1.5} />
		<path d={`M${L[0]},${L[1]} L${R[0]},${R[1]}`} stroke="#C69A55" strokeWidth={9} strokeLinecap="round" />
		<path d={`M${x},${g - post - 30} L${x - 9},${g - post + 4} L${x + 9},${g - post + 4} Z`} fill="#C69A55" />
		<circle cx={x} cy={g - post} r={9} fill={B.lac} stroke="#C69A55" strokeWidth={3} />
		{pan(L, left)}{pan(R, right, tagR)}
	</g>; };


/* ---------- shared dark sets ---------- */
export const Ground: React.FC<{g: number; lattice?: boolean}> = ({g, lattice = true}) => <g>
	<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={BG.ground} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: 24}, (_, i) => `M${-60 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
export const Street: React.FC<{g: number; dx?: number; shops?: number[]}> = ({g, dx = 0, shops = [-170, 440, 1060, 1720]}) => <g transform={`translate(${dx},0)`}>
	<rect x={-200} y={575} width={2600} height={g - 575} fill={BG.wall} />
	{shops.map((x0, i) => { const s = shop(x0, g - 4, 560 - (i % 2) * 40, 390 - (i % 2) * 30); return <g key={i}>
		<path d={s.roof} fill={BG.roof} stroke={BG.lineS} strokeWidth={2} /><path d={s.tiles} stroke={BG.line} strokeWidth={1.4} opacity={0.6} />
		<path d={s.posts} fill={BG.post} stroke={BG.line} strokeWidth={1} /><path d={s.beam} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={s.sign} fill={BG.roof} stroke={BG.line} strokeWidth={1.5} /><path d={s.counter} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={s.shutter} stroke="#170B08" strokeWidth={7} /></g>; })}
</g>;
export const FarRoofs: React.FC<{y?: number}> = ({y = 560}) => { const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, y, 300, 120 + 50 * rnd(i, 3)));
	return <g><g fill={B.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><g fill="none" stroke={B.ochre} strokeWidth={1.5} opacity={0.16}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><rect x={-200} y={y} width={2600} height={H - y} fill={B.far} /></g>; };
/** rammed-earth wall (Shang): stacked dim courses */
export const EarthWall: React.FC<{g: number; top: number}> = ({g, top}) => <g>
	<rect x={-40} y={top} width={W + 80} height={g - top} fill="#21110C" />
	{Array.from({length: Math.floor((g - top) / 34)}, (_, i) => <path key={i} d={`M-40,${top + 34 * (i + 1)} H${W + 40}`} stroke={B.ochre} strokeOpacity={0.12} strokeWidth={1.5} />)}
	<path d={`M-40,${top} H${W + 40}`} stroke={B.gold} strokeOpacity={0.22} strokeWidth={2} />
</g>;

/* the iron-string carrier (profile rig): the torso leans back, away from the load, the loaded (near) shoulder drops, that arm
   hangs plumb with the fist closed on the cord; knees bent in a short stagger; the free arm swings out behind for balance */
export const carrierPose = (sway = 0): Pose => {
	const p = grounded({lean: -14 - 0.3 * sway, neck: 16, lt: 18, lk: 28, rt: -16, rk: 24, la: 0, le: 0, ra: -40, re: 16});
	const sh = p.LSh, s2: P2 = [sh[0] - 0.012, sh[1] - 0.045];
	p.LSh = s2; p.LElb = [s2[0], s2[1] - UP]; p.LHand = [s2[0], s2[1] - UP - FO];
	return p; };
/** the carrier + his string: the cord runs from the fist into the loop, the loop drags on the ground and swings */
export const Carrier: React.FC<{x: number; g: number; h: number; look: Look4; sway?: number; id: string}> = ({x, g, h, look, sway = 6, id}) => {
	const p = carrierPose(sway), lh = J(p, 'LHand', x, g, h), sh = J(p, 'LSh', x, g, h), cordTop = lh[1] + 0.03 * h, loopTop = lh[1] + 0.058 * h + 26;
	return <g>
		<RimFig x={x} ground={g} h={h} pose={p} look={look} col={B.lac} dx={3} dy={-2.5} />
		{/* the cord: two strands from the fist into the coins */}
		<path d={`M${lh[0] - 3},${cordTop} L${lh[0] - 5},${loopTop + 4} M${lh[0] + 3},${cordTop} L${lh[0] + 5},${loopTop + 4}`} stroke="#B08850" strokeWidth={4} strokeLinecap="round" />
		<IronLoop x={lh[0]} y={loopTop} L={g - loopTop + 2} th={sway} />
		{/* where the loop drags on the street: a scuff of dust */}
		<path d={`M${lh[0] - 60},${g + 3} q50,-16 140,-2 M${lh[0] + 40},${g - 2} q16,-10 36,-6`} stroke="#C8A070" strokeOpacity={0.35} strokeWidth={2.5} fill="none" strokeLinecap="round" />
		<NearArm sh={sh} hand={lh} h={h} />
		<title>{id}</title>
	</g>; };

void furrows; void treeD; void cl;
