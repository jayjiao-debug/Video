import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Img} from 'remotion';
import {W, H, Subs, Counter, Glyph, cowrie, bubi, spade, QR, grounded, walkPose, shop, lerp, cl, rnd, KAI, SANS, SERIF, SAFE_X, SAFE_Y, furrows, treeD} from './kit50';
import {B, BG, thB, curl, LacDefs, Lacquer, Vignette, Pool, SealB, ScrollBand, RimFig, IronLoop, NearArm, heavyPose, JiaoziB, Cowrie, SilverGrad, HookB} from './styleB';
import {Pose, Look4} from '../qq44/figure44';
import {useStampFonts, YEAR, SEAL_SRC} from '../qq44/skin44';
/* ep50 key frames in look B v3 (漆, night): dark lacquer ground, receding dark-on-dark sets, one warm pool of light on the
   subject, a rim-lit one-tone walker, and the money as the brightest, most saturated thing in frame.
   KF50-ALL renders frame i = key frame i (0 = the character sheet). */
type P2 = [number, number];
const TL = (s: string) => s;   // subtitles are copied verbatim from 50-qian/lines_read.json

/* ---------- the walker's costumes, era by era (one build, one gait, one silhouette family) ---------- */
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
const CLERK: Look4 = {dress: 'robe', head: 'futou', beard: 'short', build: 1.06};
const NOODLE: Look4 = {dress: 'dress', head: 'bun', build: 1.04};

/* ---------- pose helpers: a 2-bone arm IK so hands land on what they hold (body units: x forward, y up, feet at 0) ---------- */
const UP = 0.194, FO = 0.135;
export const ikArm = (p: Pose, s: 'L' | 'R', grip: P2, elbowDown = true): Pose => {
	const sh = p[`${s}Sh`], dx0 = grip[0] - sh[0], dy0 = grip[1] - sh[1], d0 = Math.hypot(dx0, dy0) || 1;
	const tx = grip[0] - dx0 / d0 * 0.03, ty = grip[1] - dy0 / d0 * 0.03;   // the wrist sits a little short of the grip; the mitten closes on it
	const dx = tx - sh[0], dy = ty - sh[1], L = Math.min(Math.hypot(dx, dy), UP + FO - 1e-3), ph = Math.atan2(dy, dx);
	const al = Math.acos(cl((UP * UP + L * L - FO * FO) / (2 * UP * L), -1, 1));
	const e1: P2 = [sh[0] + UP * Math.cos(ph + al), sh[1] + UP * Math.sin(ph + al)], e2: P2 = [sh[0] + UP * Math.cos(ph - al), sh[1] + UP * Math.sin(ph - al)];
	const el = elbowDown ? (e1[1] < e2[1] ? e1 : e2) : (e1[1] < e2[1] ? e2 : e1);
	return {...p, [`${s}Elb`]: el, [`${s}Hand`]: [sh[0] + L * Math.cos(ph), sh[1] + L * Math.sin(ph)]};
};
const toBody = (X: number, Y: number, x: number, g: number, h: number, flip = false): P2 => [(flip ? -1 : 1) * (X - x) / h, (g - Y) / h];
const J = (p: Pose, n: string, x: number, g: number, h: number, flip = false): P2 => [x + (flip ? -1 : 1) * p[n][0] * h, g - p[n][1] * h];

/* ---------- the 3/4 view (the rig is profile-only): a simple one-tone body built from capsules, turned toward the viewer
   and to screen-right. 'load' = an iron string in his right hand (screen-left): that shoulder drops, the arm hangs plumb,
   the torso leans away, the free arm swings out for balance, knees bent. ---------- */
type Q34 = Record<string, P2>;
const Q_STAND: Q34 = {pel: [0, 0.53], hR: [-0.058, 0.53], hL: [0.058, 0.53], kR: [-0.062, 0.29], kL: [0.064, 0.29], aR: [-0.066, 0.055], aL: [0.07, 0.055],
	nk: [0.008, 0.84], sR: [-0.1, 0.81], sL: [0.105, 0.815], eR: [-0.118, 0.645], wR: [-0.124, 0.49], eL: [0.125, 0.645], wL: [0.13, 0.49], hd: [0.014, 0.925], tilt: [0, 0]};
const Q_LOAD: Q34 = {pel: [-0.012, 0.5], hR: [-0.075, 0.5], hL: [0.048, 0.505], kR: [-0.09, 0.275], kL: [0.07, 0.275], aR: [-0.1, 0.052], aL: [0.1, 0.052],
	nk: [0.05, 0.8], sR: [-0.066, 0.738], sL: [0.15, 0.79], eR: [-0.076, 0.578], wR: [-0.082, 0.43], eL: [0.225, 0.665], wL: [0.27, 0.53], hd: [0.078, 0.885], tilt: [9, 0]};
export const Fig34: React.FC<{x: number; g: number; h: number; q: Q34; col: string; hat?: 'futou' | 'bun'; rim?: boolean}> = ({x, g, h, q, col, hat = 'futou', rim = true}) => {
	const S = (n: string): P2 => [x + q[n][0] * h, g - q[n][1] * h];
	const ln = (pts: P2[]) => 'M' + pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join('L');
	const body = (c: string) => { const pel = S('pel'), nk = S('nk'), sR = S('sR'), sL = S('sL'), kR = S('kR'), kL = S('kL'), hd = S('hd'), tl = q.tilt[0];
		const hem = Math.max(kR[1], kL[1]) - 0.03 * h;
		const tunic = `M${sR[0]},${sR[1] - 0.012 * h} Q${nk[0]},${nk[1] - 0.03 * h} ${sL[0]},${sL[1] - 0.012 * h} Q${sL[0] + 0.03 * h},${sL[1] + 0.06 * h} ${pel[0] + 0.085 * h},${pel[1] - 0.09 * h} L${kL[0] + 0.07 * h},${hem} Q${(kL[0] + kR[0]) / 2},${hem + 0.025 * h} ${kR[0] - 0.07 * h},${hem} L${pel[0] - 0.085 * h},${pel[1] - 0.09 * h} Q${sR[0] - 0.03 * h},${sR[1] + 0.06 * h} ${sR[0]},${sR[1] - 0.012 * h} Z`;
		const shoe = (a: P2) => <ellipse cx={a[0] + 0.022 * h} cy={a[1] + 0.03 * h} rx={0.05 * h} ry={0.022 * h} transform={`rotate(12,${a[0] + 0.022 * h},${a[1] + 0.03 * h})`} />;
		return <g fill={c} stroke={c} strokeLinecap="round" strokeLinejoin="round">
			<path d={ln([S('hR'), kR, S('aR')])} fill="none" strokeWidth={0.068 * h} /><path d={ln([S('hL'), kL, S('aL')])} fill="none" strokeWidth={0.068 * h} />
			{shoe(S('aR'))}{shoe(S('aL'))}
			<path d={tunic} strokeWidth={2} />
			<rect x={pel[0] - 0.088 * h} y={pel[1] - 0.105 * h} width={0.176 * h} height={0.02 * h} rx={3} transform={`rotate(${-tl * 0.5},${pel[0]},${pel[1] - 0.095 * h})`} />
			<path d={ln([sR, S('eR'), S('wR')])} fill="none" strokeWidth={0.052 * h} /><path d={ln([sL, S('eL'), S('wL')])} fill="none" strokeWidth={0.05 * h} />
			<circle cx={S('wR')[0]} cy={S('wR')[1] + 0.022 * h} r={0.027 * h} /><circle cx={S('wL')[0] + 0.01 * h} cy={S('wL')[1] + 0.012 * h} r={0.025 * h} />
			<path d={ln([nk, [lerp(nk[0], hd[0], 0.6), lerp(nk[1], hd[1], 0.6)]])} fill="none" strokeWidth={0.045 * h} />
			<g transform={`rotate(${tl},${hd[0]},${hd[1]})`}>
				<ellipse cx={hd[0]} cy={hd[1]} rx={0.05 * h} ry={0.062 * h} />
				<path d={`M${hd[0] + 0.044 * h},${hd[1] - 0.012 * h} l${0.016 * h},${0.022 * h} l${-0.014 * h},${0.006 * h} Z`} strokeWidth={1} />
				{hat === 'futou' ? <path d={`M${hd[0] - 0.054 * h},${hd[1] - 0.012 * h} Q${hd[0] - 0.056 * h},${hd[1] - 0.085 * h} ${hd[0]},${hd[1] - 0.086 * h} Q${hd[0] + 0.054 * h},${hd[1] - 0.082 * h} ${hd[0] + 0.052 * h},${hd[1] - 0.02 * h} Z M${hd[0] - 0.02 * h},${hd[1] - 0.08 * h} Q${hd[0]},${hd[1] - 0.125 * h} ${hd[0] + 0.024 * h},${hd[1] - 0.08 * h} Z`} strokeWidth={1} />
					: <circle cx={hd[0] - 0.006 * h} cy={hd[1] - 0.075 * h} r={0.024 * h} />}
			</g>
		</g>; };
	return <g>{rim && <g transform="translate(3,-2.5)" opacity={0.9}>{body(BG.rim)}</g>}{body(col)}</g>;
};

/* ---------- small screen furniture ---------- */
/** stamp with an optional place (line 1 = `year · place`, line 2 = a short dim note) */
const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·—〃`);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: /^[0-9.]+$/.test(y) ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 27, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.06em', opacity: thB.dim}}>{note}</div>
	</div>; };
/** a centred subtitle row (C1, the end-card question) with the same scrim and key underline as layout D */
const SubsC: React.FC<{s: string; y: number; fs?: number}> = ({s, y, fs = 65}) => { const parts = s.split(/(\[[^\]]+\])/).filter(Boolean), len = s.replace(/[[\]]/g, '').length, tw = fs * len * 1.03;
	return <>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: y - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{parts.map((p, i) => p.startsWith('[') ? <span key={i} style={{position: 'relative', display: 'inline-block'}}><span style={{position: 'absolute', left: '0.05em', right: '0.05em', bottom: '0.1em', height: '0.13em', borderRadius: '0.06em', background: thB.key}} /><span style={{position: 'relative'}}>{p.slice(1, -1)}</span></span> : <span key={i}>{p}</span>)}
		</div></>; };
const rows = (s: string) => s.split('\n').map((r) => ({s: r}));
const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number}> = ({x, y, s, fs = 40, col = B.cream, anchor = 'start', o = 1}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={KAI} fontWeight={700} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={6} style={{paintOrder: 'stroke'}}>{s}</text>;

/* ---------- money props (accent: the brightest things in frame) ---------- */
const BronzeDefs: React.FC = () => <defs>
	<linearGradient id="brz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2C98A" /><stop offset="0.35" stopColor="#C98E4A" /><stop offset="0.6" stopColor="#A86E34" /><stop offset="0.8" stopColor="#E0AE6C" /><stop offset="1" stopColor="#8A5626" /></linearGradient>
	<linearGradient id="slv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4F8FA" /><stop offset="0.35" stopColor="#C4CDD3" /><stop offset="0.55" stopColor="#FFFFFF" /><stop offset="0.75" stopColor="#B0BAC1" /><stop offset="1" stopColor="#8D979E" /></linearGradient>
	<linearGradient id="ironF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8D949A" /><stop offset="0.5" stopColor="#5A6066" /><stop offset="1" stopColor="#3E4348" /></linearGradient>
</defs>;
/** round coin with a square hole; legend = [top, bottom, right, left] (any may be ''), read in period order */
const RoundCoin: React.FC<{x: number; y: number; r: number; legend?: string[]; fill?: string; sy?: number; rot?: number; hole?: 'sq' | 'round'}> = ({x, y, r, legend = [], fill = 'url(#brz)', sy = 1, rot = 0, hole = 'sq'}) => {
	const fs = r * 0.62, pos: P2[] = [[0, -r * 0.6], [0, r * 0.6], [r * 0.6, 0], [-r * 0.6, 0]];
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(1,${sy})`}>
		<circle r={r} fill={fill} stroke="#5A3A18" strokeWidth={Math.max(1.5, r * 0.04)} />
		<circle r={r * 0.86} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} />
		{hole === 'sq' ? <><rect x={-r * 0.22} y={-r * 0.22} width={r * 0.44} height={r * 0.44} fill={B.lac} /><rect x={-r * 0.3} y={-r * 0.3} width={r * 0.6} height={r * 0.6} fill="none" stroke="#6B4520" strokeWidth={Math.max(1, r * 0.03)} opacity={0.7} /></>
			: <circle r={r * 0.2} fill={B.lac} />}
		{legend.map((c, i) => c && <text key={i} x={pos[i][0]} y={pos[i][1] + fs * 0.36} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={fs} fill="#5A3414" opacity={0.9}>{c}</text>)}
	</g>; };
const knifeD = (L: number) => { const k = L / 10; return `M${0},${-k * 0.5} Q${k * 4},${-k * 1.2} ${k * 7.6},${-k * 0.9} Q${k * 9.6},${-k * 0.8} ${k * 10},${-k * 2.2} Q${k * 10.2},${k * 0.8} ${k * 7.2},${k * 0.7} Q${k * 3.8},${k * 0.6} ${k * 0.2},${k * 0.9} L${-k * 1.6},${k * 0.9} L${-k * 1.6},${-k * 0.5} Z`; };
const KnifeCoin: React.FC<{x: number; y: number; L: number; rot?: number}> = ({x, y, L, rot = 0}) => { const k = L / 10;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}><path d={knifeD(L)} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} />
		<circle cx={-k * 2.6} cy={k * 0.2} r={k * 1.1} fill="none" stroke="url(#brz)" strokeWidth={k * 0.55} /><circle cx={-k * 2.6} cy={k * 0.2} r={k * 1.1} fill="none" stroke="#5A3A18" strokeWidth={1} />
		<path d={`M${k * 0.6},${-k * 0.2} L${k * 7.4},${-k * 0.25}`} stroke="#6B4520" strokeWidth={1.5} opacity={0.7} /></g>; };
const AntCoin: React.FC<{x: number; y: number; L: number; rot?: number}> = ({x, y, L, rot = 0}) =>
	<g transform={`translate(${x},${y}) rotate(${rot})`}><ellipse rx={L * 0.36} ry={L * 0.5} fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} />
		<path d={`M${-L * 0.12},${-L * 0.18} q${L * 0.12},${-L * 0.1} ${L * 0.24},0 M${-L * 0.1},${L * 0.02} l${L * 0.2},0 M0,${L * 0.1} l0,${L * 0.22}`} stroke="#5A3414" strokeWidth={Math.max(1.5, L * 0.05)} fill="none" strokeLinecap="round" />
		<circle cx={0} cy={-L * 0.38} r={L * 0.06} fill={B.lac} /></g>;
const BuCoin: React.FC<{x: number; y: number; Hh: number; rot?: number; fill?: string}> = ({x, y, Hh, rot = 0, fill = 'url(#brz)'}) => { const b = bubi(Hh);
	return <g transform={`translate(${x},${y}) rotate(${rot})`}><path d={b.body} fill={fill} stroke="#5A3A18" strokeWidth={2} /><path d={b.hole} fill={B.lac} /><path d={b.ribs} stroke="#6B4520" strokeWidth={Math.max(1.5, Hh * 0.012)} opacity={0.6} fill="none" /></g>; };
/** Ming silver ingot (boat-shaped 银锭) with chiselled marks (abstract) */
const Ingot: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => { const k = w / 10;
	return <g transform={`translate(${x},${y})`}>
		<path d={`M${-k * 5},${-k * 2.4} Q${-k * 4.4},${-k * 0.4} ${-k * 3},${k * 0.4} Q${-k * 2.2},${k * 1.6} 0,${k * 1.7} Q${k * 2.2},${k * 1.6} ${k * 3},${k * 0.4} Q${k * 4.4},${-k * 0.4} ${k * 5},${-k * 2.4} Q${k * 3.6},${-k * 1.5} ${k * 2.4},${-k * 1.1} Q0,${-k * 0.8} ${-k * 2.4},${-k * 1.1} Q${-k * 3.6},${-k * 1.5} ${-k * 5},${-k * 2.4} Z`} fill="url(#slv)" stroke="#59636A" strokeWidth={2} />
		<ellipse cx={0} cy={-k * 1.15} rx={k * 2.3} ry={k * 0.7} fill="url(#slv)" stroke="#6D777E" strokeWidth={1.5} />
		<path d={`M${-k * 1.4},${-k * 1.3} l${k * 0.5},${k * 0.25} M${-k * 0.4},${-k * 1.45} l0,${k * 0.5} M${k * 0.5},${-k * 1.35} l${k * 0.45},${k * 0.3} M${k * 1.3},${-k * 1.2} l${-k * 0.3},${k * 0.35} M${-k * 0.9},${k * 0.6} l${k * 1.8},0`} stroke="#4E585F" strokeWidth={Math.max(1.4, k * 0.12)} strokeLinecap="round" />
	</g>; };
const PhoneP: React.FC<{x: number; y: number; w: number; rot?: number; check?: boolean; glow?: number}> = ({x, y, w, rot = 0, check = true, glow = 1}) => { const hh = w * 1.9;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={w * 0.14} fill={B.lac} stroke={B.gold} strokeWidth={2.5} />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#3A2A20" />
		<rect x={-w / 2 + w * 0.08} y={-hh / 2 + w * 0.15} width={w * 0.84} height={hh - w * 0.3} rx={w * 0.06} fill="#FFD9A0" opacity={0.22 * glow} />
		{check && <><circle cx={0} cy={0} r={w * 0.26} fill="none" stroke={B.goldL} strokeWidth={w * 0.06} /><path d={`M${-w * 0.13},0 l${w * 0.1},${w * 0.11} l${w * 0.19},${-w * 0.22}`} fill="none" stroke={B.goldL} strokeWidth={w * 0.07} strokeLinecap="round" strokeLinejoin="round" /></>}
	</g>; };
/** a standing balance (the film's motif: 半两 → 五铢 → 开元 → silver). tilt in degrees (+ = left pan down) */
const Balance: React.FC<{x: number; g: number; post: number; arm: number; tilt?: number; left?: React.ReactNode; right?: React.ReactNode; tagR?: string}> = ({x, g, post, arm, tilt = 0, left, right, tagR}) => {
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
const Ground: React.FC<{g: number; lattice?: boolean}> = ({g, lattice = true}) => <g>
	<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill={BG.ground} /><rect x={-40} y={g} width={W + 80} height={3} fill={B.gold} opacity={0.28} />
	{lattice && <path d={Array.from({length: 24}, (_, i) => `M${-60 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={1.5} opacity={0.1} />}
</g>;
const Street: React.FC<{g: number; dx?: number; shops?: number[]}> = ({g, dx = 0, shops = [-170, 440, 1060, 1720]}) => <g transform={`translate(${dx},0)`}>
	<rect x={-200} y={575} width={2600} height={g - 575} fill={BG.wall} />
	{shops.map((x0, i) => { const s = shop(x0, g - 4, 560 - (i % 2) * 40, 390 - (i % 2) * 30); return <g key={i}>
		<path d={s.roof} fill={BG.roof} stroke={BG.lineS} strokeWidth={2} /><path d={s.tiles} stroke={BG.line} strokeWidth={1.4} opacity={0.6} />
		<path d={s.posts} fill={BG.post} stroke={BG.line} strokeWidth={1} /><path d={s.beam} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={s.sign} fill={BG.roof} stroke={BG.line} strokeWidth={1.5} /><path d={s.counter} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={s.shutter} stroke="#170B08" strokeWidth={7} /></g>; })}
</g>;
const FarRoofs: React.FC<{y?: number}> = ({y = 560}) => { const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, y, 300, 120 + 50 * rnd(i, 3)));
	return <g><g fill={B.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><g fill="none" stroke={B.ochre} strokeWidth={1.5} opacity={0.16}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g><rect x={-200} y={y} width={2600} height={H - y} fill={B.far} /></g>; };
/** rammed-earth wall (Shang): stacked dim courses */
const EarthWall: React.FC<{g: number; top: number}> = ({g, top}) => <g>
	<rect x={-40} y={top} width={W + 80} height={g - top} fill="#21110C" />
	{Array.from({length: Math.floor((g - top) / 34)}, (_, i) => <path key={i} d={`M-40,${top + 34 * (i + 1)} H${W + 40}`} stroke={B.ochre} strokeOpacity={0.12} strokeWidth={1.5} />)}
	<path d={`M-40,${top} H${W + 40}`} stroke={B.gold} strokeOpacity={0.22} strokeWidth={2} />
</g>;
const Sky: React.FC<{id: string; sheen?: number}> = ({id, sheen = 0.3}) => <><Lacquer sheen={sheen} id={id} /></>;
const Frame: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number}> = ({id, children, over, sheen}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><BronzeDefs /><Sky id={id} sheen={sheen} />{children}<Vignette id={id} /></svg>{over}</>;
const walkerAt = (ph: number) => walkPose(ph);

/* ===================== KEY FRAMES ===================== */
/* KF01 · 0.0 s · H1 — frame 0: 财 already in place, phone + QR at the stall (the approved B v3 hook at t = 0) */
const KF01: React.FC = () => <HookB t={0.0} />;

/* KF02 · 7.5 s · H3 「倒回三千多年，钱是一枚贝壳。」 the pull-back: the walker is born (Shang), the cowrie in his palm; the rewind
   still streaks behind him */
const KF02: React.FC = () => { const g = 900, h = 560, x = 860;
	let p = grounded({lean: 4, neck: 14, lt: 8, lk: 6, rt: -10, rk: 8, la: 0, le: 0, ra: 4, re: 12});
	const palm = toBody(1010, 590, x, g, h); p = ikArm(p, 'L', palm);
	return <Frame id="k2" over={<><Subs rows={rows(TL('倒回三千多年，钱是一枚贝壳。'))} th={thB} /><StampK y="商代晚期" place="殷" note="拿海贝当钱" /><Counter year="约前1300" th={thB} /><SealB /></>}>
		<EarthWall g={g} top={600} />
		<g opacity={0.5}>{[[300, 470, 540], [1200, 440, 620], [700, 520, 400], [1500, 560, 380]].map(([x0, y, l], i) => <path key={i} d={`M${x0},${y} h${l}`} stroke={B.gold} strokeOpacity={0.22} strokeWidth={2} strokeLinecap="round" />)}</g>
		{/* plain bronze vessels on a low earthen bench (far back, dark) */}
		<rect x={1260} y={810} width={420} height={90} fill="#1A0D09" stroke={BG.line} strokeWidth={1.5} />
		<path d="M1320,810 q-6,-60 30,-70 h40 q36,10 30,70 Z M1470,810 l10,-90 h70 l10,90 Z" fill="#170C08" stroke={BG.line} strokeWidth={1.5} />
		<Ground g={g} lattice={false} />
		<Pool id="k2" x={980} y={600} rx={460} ry={380} a={0.3} /><Pool id="k2f" x={x} y={g + 4} rx={260} ry={38} a={0.25} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.shang.look} col={B.lac} dx={3} dy={-2.5} />
		<g filter="url(#glS)"><Cowrie x={1012} y={570} L={64} rot={-14} /></g>
			</Frame>; };

/* KF03 · 21.6 s · C1 「那"钱"，为什么是金字旁？」 (centred) + the 先猜？ prompt and three faint guesses by his empty hand */
const KF03: React.FC = () => { const g = 940, h = 520, x = 640;
	let p = grounded({lean: -2, neck: -30, lt: 6, lk: 4, rt: -8, rk: 6, la: 30, le: 40, ra: 4, re: 12});
	p = ikArm(p, 'L', toBody(800, 690, x, g, h));
	const s = 230, qx = 820, qy = 300;
	return <Frame id="k3" over={<><SubsC s={TL('那"钱"，为什么是金字旁？')} y={120} /><Counter year="约前1300" th={thB} /><SealB /></>}>
		<EarthWall g={g} top={680} />
		<Ground g={g} lattice={false} />
		<Pool id="k3" x={960} y={520} rx={620} ry={420} a={0.26} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.shang.look} col={B.lac} dx={2.5} dy={-3} />
		<defs><SilverGrad id="svK3" x0={qx} x1={qx + s * 0.5} k={0.5} /></defs>
		<Glyph ch="钱" x={qx} y={qy} s={s} part="rest" id="k3r" fill={B.red} stroke="#D9AC5E" sw={2.5} />
		<Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="k3q" fill="url(#svK3)" stroke="#F2F8FB" sw={2.5} />
		{/* 先猜？ — a small prompt tag beside the floating 钱 */}
		<g transform="translate(1090,330) rotate(-4)"><rect x={0} y={0} width={176} height={72} rx={36} fill={B.goldL} /><text x={88} y={50} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={42} fill={B.lac}>先猜？</text></g>
		{/* the three guesses, faint, hovering by his open hand */}
		<g opacity={0.55} transform="translate(1110,640) scale(1.25) translate(-1110,-640)">
			<g transform="translate(900,650)"><path d="M-46,22 L-32,-18 L32,-18 L46,22 Z" fill="url(#brz)" /><Label x={0} y={82} s="金块？" fs={34} anchor="middle" /></g>
			<g transform="translate(1110,640)"><KnifeCoin x={-60} y={0} L={130} rot={-12} /><Label x={0} y={92} s="刀？" fs={34} anchor="middle" /></g>
			<g transform="translate(1330,600)"><path d={spade(110, 90).handle} fill="#8A6232" /><path d={spade(110, 90).blade} fill="#8A6232" /><Label x={0} y={132} s="铲子？" fs={34} anchor="middle" /></g>
		</g>
	</Frame>; };

/* KF04 · 28.4 s · C3 「原来，"钱"是一把[铲子]。」 he has driven the spade into the soil; the 钱 settles over it; 「钱 = 铲子」 */
const KF04: React.FC = () => { const g = 900, h = 540, x = 790, spx = 930;
	const sp = spade(150, 250), bladeTop = g - 150 + 40;   // the blade is 40 px into the soil
	let p = grounded({lean: 14, neck: 6, lt: 18, lk: 22, rt: -14, rk: 18, la: 40, le: 30, ra: 30, re: 40});
	const topY = g - 75 + 40 - 75 - 250;   // the handle's top end (spade group origin = blade centre)
	void bladeTop;
	p = ikArm(p, 'R', toBody(spx + 8, topY + 16, x, g, h)); p = ikArm(p, 'L', toBody(spx + 6, topY + 96, x, g, h));
	return <Frame id="k4" over={<><Subs rows={rows(TL('原来，"钱"是一把[铲子]。'))} th={thB} /><StampK y="商周" place="田间" note={'国博：铲子叫"钱"'} /><Counter era="商周" th={thB} /><SealB /></>}>
		<path d="M-40,900 Q300,770 620,840 Q980,730 1320,830 Q1640,770 1960,860 V900 H-40 Z" fill={B.far} />
		<path d={treeD(1560, 900, 1.4)} fill="#1A0D09" stroke={BG.line} strokeWidth={2} /><path d={treeD(260, 900, 1.1)} fill="#1A0D09" stroke={BG.line} strokeWidth={2} />
		<rect x={-40} y={g} width={W + 80} height={H - g + 40} fill="#1A0D09" /><path d={furrows(g)} stroke={B.gold} strokeWidth={1.5} fill="none" opacity={0.12} />
		<Pool id="k4" x={900} y={620} rx={560} ry={420} a={0.28} /><Pool id="k4f" x={880} y={g + 4} rx={320} ry={40} a={0.25} />
		{/* the spade, blade in the soil (cinnabar flood + ochre handle, drawn by the gold line) */}
		<g transform={`translate(${spx},${g - 150 / 2 + 40})`}>
			<path d={sp.handle} fill={B.ochre} stroke={B.gold} strokeWidth={2.5} /><path d={sp.blade} fill={B.red} stroke={B.goldL} strokeWidth={3} />
		</g>
		<path d={`M${spx - 130},${g + 40} Q${spx - 90},${g - 6} ${spx - 20},${g - 8} Q${spx + 60},${g - 14} ${spx + 140},${g + 40} Z`} fill="#1E0F0B" stroke={BG.lineS} strokeWidth={1.5} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.zhou.look} col={B.lac} dx={3} dy={-2.5} />
		{/* the 钱 settles over the spade, a little above it; the label snaps on */}
		<g opacity={0.95}><Glyph ch="钱" x={spx + 50} y={330} s={210} part="rest" id="k4r" fill={B.red} stroke="#D9AC5E" sw={2.5} />
			<defs><SilverGrad id="svK4" x0={spx + 50} x1={spx + 160} k={0.55} /></defs><Glyph ch="钱" x={spx + 50} y={330} s={210} part="comp" id="k4q" fill="url(#svK4)" stroke="#F2F8FB" sw={2.5} /></g>
		<g transform={`translate(${spx + 300},${600})`}><rect x={0} y={-44} width={250} height={66} rx={8} fill={B.cream} /><text x={125} y={4} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={42} fill={B.lac}>钱 = 铲子</text>
			<path d={`M0,-10 L${-276},${100}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} /></g>
	</Frame>; };

/* KF05 · 36.2 s · D1 row 2 「有刀、铲、圆、贝」: four dim stalls with one coin icon each; he holds all four fanned in one hand */
const KF05: React.FC = () => { const g = 905, h = 560, x = 720;
	let p = grounded({lean: 2, neck: 4, lt: 6, lk: 4, rt: -8, rk: 6, la: 60, le: 40, ra: 4, re: 12});
	const hand: P2 = [920, 600]; p = ikArm(p, 'L', toBody(hand[0], hand[1], x, g, h));
	const stall = (sx: number, icon: React.ReactNode) => <g key={sx}><rect x={sx - 150} y={720} width={300} height={185} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={`M${sx - 170},${470} H${sx + 170} V${560} H${sx - 170} Z`} fill={BG.red} stroke={BG.line} strokeWidth={1.5} /><rect x={sx - 160} y={470} width={6} height={250} fill={BG.post} /><rect x={sx + 154} y={470} width={6} height={250} fill={BG.post} />
		<g opacity={0.35} transform={`translate(${sx},${515})`}>{icon}</g></g>;
	return <Frame id="k5" over={<><Subs rows={rows(TL('战国各国的钱，\n有刀、铲、圆、贝。'))} th={thB} /><StampK y="战国" note="各国钱不一样" /><Counter era="战国" th={thB} /><SealB /></>}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		{stall(240, <KnifeCoin x={-50} y={0} L={100} />)}{stall(1180, <BuCoin x={0} y={0} Hh={80} />)}{stall(1530, <RoundCoin x={0} y={0} r={36} hole="round" />)}{stall(1880, <AntCoin x={0} y={0} L={70} />)}
		<Ground g={g} />
		<Pool id="k5" x={930} y={560} rx={480} ry={380} a={0.3} /><Pool id="k5f" x={x} y={g + 4} rx={260} ry={38} a={0.25} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.zhou.look} col={B.lac} dx={3} dy={-2.5} />
		{/* the fan: four kinds of coin pinched at their bases in one hand */}
		<g filter="url(#glS)">
			<g transform={`translate(${hand[0]},${hand[1]}) rotate(-58)`}><KnifeCoin x={22} y={0} L={150} /></g>
			<g transform={`translate(${hand[0] + 6},${hand[1] - 4}) rotate(-22)`}><BuCoin x={0} y={-82} Hh={150} /></g>
			<RoundCoin x={hand[0] + 92} y={hand[1] - 90} r={52} hole="round" rot={8} />
			<AntCoin x={hand[0] + 112} y={hand[1] - 6} L={64} rot={30} />
		</g>
		<circle cx={hand[0] + 4} cy={hand[1] + 6} r={15} fill={B.lac} stroke={BG.rim} strokeOpacity={0.6} strokeWidth={1.5} />
	</Frame>; };

/* KF06 · 41.0 s · E2 「钱上写着"半两"，就得重[半两]。」 the balance: the 半兩 coin on one pan, a weight tagged 半两 on the other, level */
const KF06: React.FC = () => { const g = 900, h = 540, x = 470;
	const p = grounded({lean: 4, neck: 4, lt: 4, lk: 4, rt: -6, rk: 5, la: 8, le: 26, ra: 4, re: 12});
	return <Frame id="k6" over={<><Subs rows={rows(TL('钱上写着"半两"，\n就得重[半两]。'))} th={thB} /><StampK y="秦统一六国后" note="《史记》：重如其文" /><Counter year="前221" th={thB} /><SealB /></>}>
		<rect x={-40} y={640} width={W + 80} height={260} fill={BG.wall} />
		{/* a black Qin hanging behind, barely there */}
		<path d="M1560,250 H1700 V640 L1630,600 L1560,640 Z" fill="#120908" stroke={BG.line} strokeWidth={1.5} />
		<rect x={560} y={760} width={1000} height={20} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={600} y={780} width={14} height={120} fill={BG.post} /><rect x={1500} y={780} width={14} height={120} fill={BG.post} />
		<Ground g={g} />
		<Pool id="k6" x={1060} y={560} rx={560} ry={360} a={0.3} />
		<Balance x={1060} g={760} post={400} arm={250} tilt={0}
			left={<g><RoundCoin x={0} y={-70} r={70} legend={['', '', '半', '兩']} /></g>}
			right={<g><path d="M-34,-6 Q-34,-60 0,-66 Q34,-60 34,-6 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><circle cx={0} cy={-72} r={9} fill="none" stroke="url(#brz)" strokeWidth={5} /></g>} tagR="半两" />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.qin.look} col={B.lac} dx={3} dy={-2.5} />
	</Frame>; };

/* KF07 · 58.8 s · S2 「一串一千文，重[二十五斤八两]。」 the iron string bends him — 3/4 view so the lean away from the load reads */
const KF07: React.FC = () => { const g = 920, h = 600, x = 960;
	const fist: P2 = [x + Q_LOAD.wR[0] * h, g - Q_LOAD.wR[1] * h + 0.045 * h];
	return <Frame id="k7" over={<><Subs rows={rows(TL('一串一千文，\n重[二十五斤八两]。'))} th={thB} /><StampK y="北宋初" place="嘉州、邛州" note="《宋史》：早期标准" /><Counter era="北宋" th={thB} /><SealB /></>}>
		<FarRoofs /><Street g={905} shops={[-200, 1300]} />
		<Ground g={905} />
		<Pool id="k7" x={x - 20} y={620} rx={460} ry={420} a={0.3} /><Pool id="k7f" x={x} y={g + 2} rx={300} ry={40} a={0.3} />
		<Fig34 x={x} g={g} h={h} q={Q_LOAD} col={B.lac} />
		<IronLoop x={fist[0]} y={fist[1]} L={g - fist[1] - 40} th={-3} />
		<circle cx={fist[0]} cy={fist[1] - 0.012 * h} r={0.028 * h} fill={B.lac} stroke={BG.rim} strokeOpacity={0.7} strokeWidth={1.8} />
		{/* the strain: a short dim arc of dust where the loop has just thumped down and swung */}
		<path d={`M${fist[0] - 70},${g - 4} q40,-14 140,0`} stroke={B.gold} strokeOpacity={0.25} strokeWidth={2} fill="none" />
	</Frame>; };

/* KF08 · 83.2 s · S8 「红黑套印，暗藏编号，防人伪造。」 the print shop: two sheets drying (red pass, then red + black), the clerk
   presses the black block, a callout finds the hidden number cartouche, the seal is down */
const KF08: React.FC = () => { const g = 905, h = 520;
	const kp = ikArm(ikArm(grounded({lean: 22, neck: 18, lt: 6, lk: 10, rt: -8, rk: 10, la: 60, le: 30, ra: 50, re: 40}), 'L', toBody(1300, 708, 1480, g, h, true)), 'R', toBody(1250, 712, 1480, g, h, true));
	const wp = grounded({lean: 4, neck: 4, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 20, ra: 4, re: 14});
	const NW = 200, NH = 350;
	return <Frame id="k8" over={<><Subs rows={rows(TL('红黑套印，暗藏编号，\n防人伪造。'))} th={thB} /><StampK y="北宋" place="益州" note="《楮币谱》：朱墨间错" /><Counter year="1024" th={thB} /><SealB /></>}>
		<rect x={-40} y={540} width={W + 80} height={365} fill={BG.wall} />
		{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={120 + i * 360} y={540} width={10} height={365} fill={BG.post} />)}
		<path d="M520,330 Q960,350 1500,330" fill="none" stroke={B.gold} strokeOpacity={0.35} strokeWidth={2} />
		<Pool id="k8" x={960} y={500} rx={640} ry={420} a={0.3} />
		{/* sheet 1: the red pass only */}
		<g transform={`translate(640,342) rotate(-2)`} opacity={0.82}><rect x={0} y={0} width={NW} height={NH} fill="#EFE2C4" />
			<rect x={NW * 0.06} y={NW * 0.06} width={NW * 0.88} height={NH - NW * 0.12} fill="none" stroke="#BF3420" strokeWidth={NW * 0.075} />
			<rect x={NW * 0.47} y={NH * 0.39} width={NW * 0.34} height={NW * 0.34} fill="#BF3420" opacity={0.88} /><rect x={NW * 0.2} y={NH * 0.205} width={NW * 0.15} height={NW * 0.15} fill="#BF3420" opacity={0.88} /></g>
		<rect x={712} y={330} width={14} height={26} fill="#8A6232" />
		{/* sheet 2: red + black (the finished note) */}
		<g transform={`translate(980,342) rotate(1.5)`} filter="url(#glS)"><JiaoziB w={NW} h={NH} id="k8n" /></g>
		<rect x={1068} y={330} width={14} height={26} fill="#8A6232" />
		{/* the hidden number: a callout ring on the note's small cartouche, enlarged beside it */}
		<circle cx={1028} cy={512} r={22} fill="none" stroke={B.goldL} strokeWidth={3} />
		<path d="M1046,496 L1250,300" stroke={B.goldL} strokeWidth={2} strokeOpacity={0.8} />
		<g transform="translate(1310,250)"><circle r={86} fill="#F2E6CC" stroke={B.goldL} strokeWidth={4} />
			<rect x={-50} y={-30} width={100} height={60} fill="none" stroke="#22150F" strokeWidth={3} />
			<path d="M-36,-14 l14,6 M-30,8 l18,-4 M-6,-16 l4,22 M8,-12 l14,10 M10,12 l20,-6 M30,-16 l-6,24" stroke="#22150F" strokeWidth={4} strokeLinecap="round" />
			<rect x={22} y={34} width={30} height={30} fill="#BF3420" opacity={0.85} /></g>
		{/* the press table: the clerk lays the black block onto the next sheet */}
		<rect x={1080} y={720} width={420} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={1110} y={742} width={14} height={163} fill={BG.post} /><rect x={1460} y={742} width={14} height={163} fill={BG.post} />
		<rect x={1150} y={708} width={150} height={12} fill="#EFE2C4" />
		<rect x={1196} y={682} width={130} height={30} rx={3} fill="#3A2116" stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
		<RimFig x={1480} ground={g} h={h} pose={kp} look={CLERK} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.5} />
		<Ground g={g} />
		<RimFig x={330} ground={g} h={h} pose={wp} look={LOOKS.song.look} col={B.lac} dx={3} dy={-2.5} rimO={0.6} />
	</Frame>; };

/* KF09 · 97.5 s · the 宝钞 hush (no line): the note has crumbled in his hand and blows away; he stands still, hand open */
const KF09: React.FC = () => { const g = 905, h = 560, x = 760;
	let p = grounded({lean: 0, neck: 10, lt: 3, lk: 3, rt: -5, rk: 4, la: 30, le: 40, ra: 4, re: 10});
	const hand: P2 = [900, 640]; p = ikArm(p, 'L', toBody(hand[0], hand[1], x, g, h));
	const flakes = Array.from({length: 22}, (_, i) => { const u = i / 21, fx = hand[0] + 60 + u * 760 + 40 * Math.sin(i * 2.1), fy = hand[1] - 40 - u * 260 + 50 * Math.sin(i * 1.3), s = lerp(34, 10, u) * (0.7 + 0.5 * rnd(i, 2));
		return <g key={i} transform={`translate(${fx},${fy}) rotate(${rnd(i, 4) * 360})`} opacity={lerp(0.9, 0.15, u)}>
			<path d={`M${-s / 2},${-s / 2.6} L${s / 2},${-s / 2.2} L${s / 2.4},${s / 2.5} L${-s / 2.2},${s / 2.1} Z`} fill="#CDBE96" />
			{i % 3 === 0 && <path d={`M${-s / 2},${-s / 2.6} L${s / 2},${-s / 2.2}`} stroke="#22150F" strokeWidth={Math.max(1, s * 0.12)} />}
			{i % 5 === 1 && <rect x={-s * 0.2} y={-s * 0.2} width={s * 0.4} height={s * 0.4} fill="#9A3A24" opacity={0.7} />}</g>; });
	return <Frame id="k9" over={<><StampK y="明" note="一贯不值一文" /><Counter era="明" th={thB} /><SealB /></>}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		{/* the balance from M2, far back: the note's pan flown up, empty */}
		<g opacity={0.35}><Balance x={1450} g={905} post={360} arm={190} tilt={-16} left={null} right={<g><RoundCoin x={-30} y={-26} r={26} fill="#5A4A3A" /><RoundCoin x={20} y={-30} r={26} fill="#5A4A3A" /></g>} /></g>
		<Ground g={g} />
		<Pool id="k9" x={940} y={600} rx={420} ry={340} a={0.2} col="#FFC890" />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.ming.look} col={B.lac} dx={3} dy={-2.5} rimO={0.75} />
		{/* the last corner of the note still between his fingers */}
		<path d={`M${hand[0] + 6},${hand[1] - 24} l34,-6 l-6,26 l-22,8 Z`} fill="#CDBE96" />
		{flakes}
	</Frame>; };

/* KF10 · 102.2 s · M4a 「白银每次都要称，」 the balance returns: the ingot on the pan, the shopkeeper adds a weight */
const KF10: React.FC = () => { const g = 905, h = 540, x = 420;
	const kx = 1500, kp = ikArm(grounded({lean: 12, neck: 14, lt: 3, lk: 4, rt: -4, rk: 4, la: 50, le: 30, ra: 6, re: 20}), 'L', toBody(1330, 600, kx, g, 500, true));
	const p = grounded({lean: 6, neck: 12, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 24, ra: 4, re: 12});
	const kh = J(kp, 'LHand', kx, g, 500, true), ke = J(kp, 'LElb', kx, g, 500, true), kd = Math.hypot(kh[0] - ke[0], kh[1] - ke[1]), tip: P2 = [kh[0] + (kh[0] - ke[0]) / kd * 30, kh[1] + (kh[1] - ke[1]) / kd * 30];
	return <Frame id="k10" over={<><Subs rows={rows(TL('白银每次都要称，'))} th={thB} /><StampK y="明中晚期" note="银锭刻地名、匠名、重量" /><Counter era="明中晚期" th={thB} /><SealB /></>}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		<rect x={1380} y={640} width={360} height={60} fill={BG.roof} stroke={BG.line} strokeWidth={1.5} />
		<RimFig x={kx} ground={g} h={500} pose={kp} look={{dress: 'robe', head: 'cylcap', beard: 'short', build: 1.06}} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.45} />
		<rect x={540} y={770} width={1100} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><path d="M560,792 H1620 V905 H560 Z" fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<Ground g={g} />
		<Pool id="k10" x={1060} y={560} rx={560} ry={360} a={0.3} />
		<Balance x={1060} g={770} post={400} arm={250} tilt={1.5}
			left={<g filter="url(#glS)"><Ingot x={0} y={-24} w={150} /></g>}
			right={<g><path d="M-30,-4 L-26,-40 L26,-40 L30,-4 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><path d="M-18,-40 L-14,-62 L14,-62 L18,-40 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /></g>} />
		{/* the shopkeeper's hand sets one more small weight on the pan */}
		<path d={`M${tip[0] - 13},${tip[1] + 6} l4,-24 l18,0 l4,24 Z`} fill="url(#brz)" stroke="#5A3A18" strokeWidth={1.5} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.ming.look} col={B.lac} dx={3} dy={-2.5} />
	</Frame>; };

/* KF11 · 108.8 s · T1 「如今，[10.17亿]人用网络支付。」 back at the hook's stall: the note in his hand has become the phone; he
   scans the same code, ✓; the number stands on a dark panel above */
const KF11: React.FC = () => { const g = 905, h = 560, x = 660, CT = 700;
	const ph: P2 = [860, 520];
	let p = grounded({lean: 6, neck: 14, lt: 4, lk: 4, rt: -6, rk: 5, la: 50, le: 60, ra: 4, re: 12});
	p = ikArm(p, 'L', toBody(ph[0] - 16, ph[1] + 46, x, g, h));
	const np = ikArm(grounded({lean: 4, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 30, le: 60, ra: 20, re: 70}), 'L', toBody(1360, CT - 6, 1470, g, 520, true));
	return <Frame id="k11" over={<><Subs rows={rows(TL('如今，[10.17亿]人用网络支付。'))} th={thB} /><StampK y="2025年12月" place="中国" note="占网民90.3%" /><Counter year="2025" th={thB} /><SealB /></>}>
		<rect x={-40} y={560} width={W + 80} height={345} fill={BG.wall} />
		{/* the noodle stall: awning, a pot with a breath of steam, the keeper behind the counter */}
		<path d="M940,420 H1820 L1780,480 H980 Z" fill={BG.red} stroke={BG.line} strokeWidth={1.5} />
		<rect x={980} y={480} width={8} height={CT - 480} fill={BG.post} /><rect x={1772} y={480} width={8} height={CT - 480} fill={BG.post} />
		<RimFig x={1470} ground={g} h={520} pose={np} look={NOODLE} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.4} />
		<rect x={1540} y={CT - 70} width={130} height={70} rx={10} fill="#2A2420" stroke={BG.line} strokeWidth={1.5} />
		<rect x={960} y={CT} width={860} height={22} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><path d={`M980,${CT + 22} H1800 V905 H980 Z`} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		{/* the same code plaque as frame 0 */}
		<rect x={1046} y={CT - 120} width={112} height={112} rx={6} fill="#A39880" stroke={BG.lineS} strokeWidth={2} />
		<QR x={1058} y={CT - 108} s={88} fg={B.lac} />
		<rect x={1090} y={CT - 8} width={24} height={8} fill={BG.post} />
		<Ground g={g} />
		<Pool id="k11" x={920} y={540} rx={420} ry={360} a={0.3} /><Pool id="k11f" x={x} y={g + 4} rx={260} ry={38} a={0.25} />
		<RimFig x={x} ground={g} h={h} pose={p} look={LOOKS.today.look} col={B.lac} dx={3} dy={-2.5} />
		{/* the paper note's ghost peeling off into the phone */}
		<rect x={ph[0] - 70} y={ph[1] - 92} width={70} height={124} fill={B.cream} opacity={0.14} transform={`rotate(-14,${ph[0] - 35},${ph[1] - 30})`} />
		<PhoneP x={ph[0]} y={ph[1]} w={64} rot={8} />
		<path d={`M${ph[0] + 36},${ph[1] - 10} L1046,${CT - 70}`} stroke={B.goldL} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 8" />
		{/* the number on a dark panel (≥ 96 px), tagged 网络支付用户 */}
		<g transform="translate(1180,250)"><rect x={0} y={0} width={500} height={150} rx={10} fill="#0E0705" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<text x={250} y={98} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={100} fill={B.goldL}>10.17亿</text>
			<text x={250} y={140} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={28} fill={B.cream} opacity={0.85}>网络支付用户</text></g>
	</Frame>; };

/* KF12 · 118.2 s · P2b 「值钱的是，大家都[信]它。」 the trust web at full glow: walkers each with a phone, joined by light */
const KF12: React.FC<{dim?: number}> = ({dim = 1}) => { const g = 905;
	const people: [number, number, number, number][] = [[960, 960, 560, 0], [440, 930, 420, 0.3], [1480, 940, 430, 0.6], [200, 760, 230, 0.1], [1740, 770, 240, 0.8], [700, 700, 180, 0.5], [1250, 690, 170, 0.2], [1900, 680, 150, 0.4], [40, 690, 160, 0.7], [980, 640, 130, 0.5]];
	const phones = people.map(([x, gg, h], i) => { const fl = i % 2 === 1, up = i % 3 === 1; return {x, gg, h, fl, pose: ikArm(grounded({lean: 4, neck: up ? 0 : 18, lt: 3, lk: 3, rt: -4, rk: 4, la: 40, le: 70, ra: 4, re: 12}), 'L', up ? [0.22, 0.86] : [0.2, 0.62]), i}; });
	const pt = (o: typeof phones[0]): P2 => { const hnd = J(o.pose, 'LHand', o.x, o.gg, o.h, o.fl); return [hnd[0] + (o.fl ? -1 : 1) * 0.02 * o.h, hnd[1] - 0.05 * o.h]; };
	const P = phones.map(pt), edges: [number, number][] = [[0, 1], [0, 2], [0, 5], [0, 6], [0, 9], [1, 3], [1, 5], [2, 4], [2, 6], [3, 8], [4, 7], [5, 9], [6, 9], [1, 6], [2, 5], [3, 5], [4, 6]];
	return <Frame id={`k12${dim}`} sheen={0.2} over={dim === 1 ? <><Subs rows={rows(TL('值钱的是，大家都[信]它。'))} th={thB} /><StampK y="2026" place="今天" note="本片归纳" /><Counter year="2026" th={thB} /><SealB /></> : null}>
		<Ground g={g} lattice={false} />
		<Pool id="k12" x={960} y={620} rx={900} ry={420} a={0.22} />
		{[...phones].sort((a, b) => a.h - b.h).map((o) => <RimFig key={o.i} x={o.x} ground={o.gg} h={o.h} pose={o.pose} look={o.i === 0 ? LOOKS.today.look : ([{dress: 'jacket', legs: 'trousers', head: 'bob'}, {dress: 'coat', head: 'short'}, {dress: 'dress', head: 'long'}, {dress: 'jacket', legs: 'trousers', head: 'cap'}] as Look4[])[o.i % 4]} col={o.i === 0 ? B.lac : '#120A07'} flip={o.fl} dx={o.fl ? -2.5 : 2.5} dy={-2} rimO={o.i === 0 ? 0.9 : 0.5} />)}
		<g stroke={B.goldL} strokeLinecap="round">{edges.map(([a, b], k) => <path key={k} d={`M${P[a][0]},${P[a][1]} Q${(P[a][0] + P[b][0]) / 2},${Math.min(P[a][1], P[b][1]) - 40} ${P[b][0]},${P[b][1]}`} fill="none" strokeWidth={k < 5 ? 3 : 1.8} strokeOpacity={k < 5 ? 0.85 : 0.5} />)}</g>
		{P.map(([px, py], i) => <g key={i}><circle cx={px} cy={py} r={i === 0 ? 26 : 16} fill={B.goldL} opacity={0.18} /><rect x={px - (i === 0 ? 14 : 9)} y={py - (i === 0 ? 24 : 15)} width={i === 0 ? 28 : 18} height={i === 0 ? 48 : 30} rx={4} fill="#FFE9B8" stroke={B.lac} strokeWidth={1.5} /></g>)}
	</Frame>; };

/* KF13 · 122.5 s · the Juno end card over the dimmed trust web */
const SOURCES = ['资料：《说文解字》（据《太平御览》）《史记》《汉书》《旧唐书》《宋史》《明史》 · 中国国家博物馆 · 光明日报 2024 · 《人民周刊》2024',
	'《人民论坛》2022 · 中新网 2021/2024 · 中新社 2019（1948） · CNNIC 第57次中国互联网络发展状况统计报告'];
const KF13: React.FC = () => <>
	<KF12 dim={0} />
	<div style={{position: 'absolute', inset: 0, background: 'rgba(8,4,3,0.72)'}} />
	<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: 'rotate(-6deg)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
	<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo}}>钱是怎么从贝壳<br />变成二维码的？</div>
	<SubsC s={TL('你上一次用[纸币]，是什么时候？')} y={560} fs={76} />
	<div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold}}>关注 Juno · 一起看懂世界</div>
	<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 930, textAlign: 'center', fontFamily: SANS, fontSize: 21, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.72}}>{SOURCES.map((s, i) => <div key={i}>{s}</div>)}</div>
</>;

/* ===================== CHARACTER SHEET ===================== */
const CharSheet: React.FC = () => { const g1 = 600, g2 = 1000;
	const stand = grounded({lean: 2, neck: 2, lt: 3, lk: 3, rt: -4, rk: 4, la: -3, le: 8, ra: 4, re: 12});
	const heads = 0.125;   // the walker is ~8 heads tall (head ≈ 0.125 h)
	const eras = ['shang', 'zhou', 'qin', 'han', 'tang', 'song', 'ming', 'y1948', 'today'];
	const props: Record<string, string> = {shang: '贝', zhou: '布币', qin: '半两', han: '五铢', tang: '开元通宝', song: '铁钱 · 交子', ming: '宝钞 · 银锭', y1948: '纸币', today: '手机'};
	return <svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><BronzeDefs /><Lacquer sheen={0.3} id="cs" />
		<text x={120} y={92} fontFamily={SANS} fontWeight={900} fontSize={40} fill={B.cream}>ep50 角色设定 · 行路人（漆 · 夜）</text>
		<text x={120} y={132} fontFamily={KAI} fontWeight={700} fontSize={24} fill={B.cream} opacity={0.7}>一色剪影 + 暖色轮廓光 · 无五官 · 手为简化手掌 · 约 8 头身 · 同一身形走完全片，只换衣冠</text>
		{/* proportions: profile with head-unit ticks */}
		<g>{Array.from({length: 9}, (_, i) => <g key={i}><path d={`M150,${g1 - i * heads * 420} H420`} stroke={B.gold} strokeOpacity={0.18} strokeWidth={1} /><text x={142} y={g1 - i * heads * 420 + 6} textAnchor="end" fontFamily={YEAR} fontSize={18} fill={B.cream} opacity={0.5}>{i}</text></g>)}</g>
		<Pool id="cs1" x={560} y={420} rx={520} ry={260} a={0.18} />
		<RimFig x={280} ground={g1} h={420} pose={stand} look={LOOKS.song.look} col={B.lac} dx={3} dy={-2.5} />
		<Label x={280} y={g1 + 40} s="侧面 · 站" fs={26} anchor="middle" />
		<Fig34 x={520} g={g1} h={420} q={Q_STAND} col={B.lac} />
		<Label x={520} y={g1 + 40} s="3/4 · 站" fs={26} anchor="middle" />
		<g><Fig34 x={760} g={g1} h={420} q={Q_LOAD} col={B.lac} />
			{(() => { const f: P2 = [760 + Q_LOAD.wR[0] * 420, g1 - Q_LOAD.wR[1] * 420 + 0.045 * 420]; return <><IronLoop x={f[0]} y={f[1]} L={g1 - f[1] - 26} th={-3} /><circle cx={f[0]} cy={f[1] - 5} r={12} fill={B.lac} stroke={BG.rim} strokeOpacity={0.7} strokeWidth={1.5} /></>; })()}</g>
		<Label x={770} y={g1 + 40} s="3/4 · 负重（铁钱串）" fs={26} anchor="middle" />
		{(() => { const hp = heavyPose(0, 0), wx = 1010, h = 420, jz = J(hp, 'RHand', wx, g1, h), lh = J(hp, 'LHand', wx, g1, h); return <g>
			<g transform={`translate(${jz[0] + 8},${jz[1] + 4}) rotate(-5) translate(-38,-122)`}><JiaoziB w={76} h={134} id="csn" /></g>
			<RimFig x={wx} ground={g1} h={h} pose={hp} look={LOOKS.song.look} col={B.lac} dx={3} dy={-2.5} />
			<IronLoop x={lh[0]} y={lh[1] + 0.04 * h} L={g1 - lh[1] - 0.04 * h - 36} th={0} /><NearArm sh={J(hp, 'LSh', wx, g1, h)} hand={lh} h={h} /></g>; })()}
		<Label x={1030} y={g1 + 40} s="侧面 · 负重 + 交子" fs={26} anchor="middle" />
		{/* the two other characters */}
		<RimFig x={1390} ground={g1} h={400} pose={grounded({lean: 4, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: 50, le: 40, ra: 4, re: 14})} look={CLERK} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.75} />
		<Label x={1380} y={g1 + 40} s="交子铺掌柜" fs={26} anchor="middle" />
		<RimFig x={1640} ground={g1} h={390} pose={grounded({lean: 4, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 70, ra: 20, re: 80})} look={NOODLE} col="#0F0806" flip dx={-2.5} dy={-2} rimO={0.75} />
		<Label x={1640} y={g1 + 40} s="面摊老板" fs={26} anchor="middle" />
		{/* the walk: costume by era (same build, same gait) */}
		<path d={`M120,${g1 + 76} H1800`} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />
		{eras.map((k, i) => { const x = 200 + i * 190, wp = walkerAt(0.18 + 0.1 * (i % 2));
			return <g key={k}><Pool id={`ce${i}`} x={x} y={g2 - 120} rx={110} ry={150} a={0.14} />
				<RimFig x={x} ground={g2 - 50} h={240} pose={wp} look={LOOKS[k].look} col={B.lac} dx={2.5} dy={-2} />
				<Label x={x + 10} y={g2 - 4} s={LOOKS[k].label} fs={26} anchor="middle" />
				<text x={x + 10} y={g2 + 26} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={18} fill={B.cream} opacity={0.6}>{LOOKS[k].note}</text>
				<text x={x + 10} y={g2 + 50} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={18} fill={B.goldL} opacity={0.85}>{props[k]}</text></g>; })}
	</svg>; };

/* ===================== registration ===================== */
const KFS: React.FC[] = [CharSheet, KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF09, KF10, KF11, KF12, KF13];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF50-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	<Composition id="KF50-CHARS" component={one(CharSheet)} width={W} height={H} fps={30} durationInFrames={1} />
	{KFS.slice(1).map((C, i) => <Composition key={i} id={`KF50-${String(i + 1).padStart(2, '0')}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void curl; void ScrollBand; void cowrie; void cl;
