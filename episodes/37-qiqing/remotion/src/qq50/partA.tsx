import React from 'react';
import {W, H, Glyph, COMP_C, cowrie, spade, qrCells, grounded, walkPose, seg, ease, eio, eout, land, lerp, cl, rnd, KAI, SANS, furrows, treeD} from './kit50';
import {B, BG, curl, LacDefs, Lacquer, Vignette, Pool, ScrollBand, RimFig, SilverGrad, JiaoziB} from './styleB';
import {Pose, mixPose} from '../qq44/figure44';
import {STRIDE, GAIT_S} from '../qq47/pose47';
import {LOOKS, ikArm, toBody, J, Label, BronzeDefs, RoundCoin, KnifeCoin, AntCoin, BuCoin, Balance, Ground, EarthWall, P2} from './props50';
import {DOWNBEAT, BEAT, WipeSplit, PillarKind} from './master50';
/* ep50 PART A (0 – 54.75 s, Builder A): the hook on your phone → the rewind → the walker is born (商) → title → 贝 → the
   guess beat → 钱 = spade → the cast 布币 → 战国 → 秦 半两 on the balance → 汉 五铢 → 700 years → 唐 开元通宝 → hand-off.
   ONE walker, always at screen x = 860 on ground 905 at h = 560 (the camera tracks him; the sets scroll), so every dissolve
   and wipe keeps him in place. walkerAt(t) is the single source of his pose, costume and the money in his hand. */
export const HANDOFF = {t: 54.75, x: 860, g: 905, h: 560};
const X = 860, G = 905, HH = 560, V = STRIDE * HH / GAIT_S;   // walk speed, px/s (≈ 412, 13.7 px per frame)

/* ---------- the walk: moving intervals (ramped), integrated distance, phase ---------- */
const RUNS: [number, number][] = [[11.514, 20.45], [32.3, 35.7], [36.55, 39.35], [45.0, 48.25], [53.85, 70]];
const RAMP = 0.4;
const speedAt = (t: number) => Math.max(0, ...RUNS.map(([a, b]) => Math.min(seg(t, a, a + RAMP), 1 - seg(t, b - RAMP, b))));
const distCache = new Map<number, number>();
/** distance walked (px) since the start of the film, at walk speed V */
export const distAt = (t: number) => { const key = Math.round(t * 60); const c = distCache.get(key); if (c !== undefined) return c;
	let d = 0; for (let i = 0; i < key; i++) d += speedAt(i / 60) / 60; d *= V; distCache.set(key, d); return d; };
const phaseAt = (t: number) => 0.22 + distAt(t) / (STRIDE * HH);
const STAND = grounded({lean: 3, neck: 4, lt: 4, lk: 4, rt: -5, rk: 5, la: 4, le: 14, ra: 3, re: 12});
/** head tilt: rotate Head/Top about Neck1 (deg > 0 looks up) */
const look = (p: Pose, deg: number): Pose => { const n = p.Neck1, a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
	const r = (q: P2): P2 => [n[0] + (q[0] - n[0]) * c - (q[1] - n[1]) * s, n[1] + (q[0] - n[0]) * s + (q[1] - n[1]) * c];
	return {...p, Head: r(p.Head), Top: r(p.Top)}; };

/* ---------- keyed tracks (time → value, eased between keys) ---------- */
type Key<T> = [number, T];
const track = (t: number, keys: Key<number>[]) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, eio(seg(t, a, b))); } return keys[keys.length - 1][1]; };
/** near-hand targets: 'hold' = carried in front at the waist, 'side' = the walk's own arm swing, or a screen point */
type HandT = 'hold' | 'side' | P2;
const HAND_L: Key<HandT>[] = [[0, [1010, 590]], [11.3, [1010, 590]], [11.9, 'hold'], [15.42, 'hold'], [15.5, [1010, 640]], [15.95, [1010, 640]], [16.05, [1040, 760]], [16.45, 'hold'],
	[20.3, 'hold'], [20.8, [1010, 660]], [23.6, [1010, 660]], [24.0, [1005, 590]], [27.15, [1005, 590]], [27.36, [1012, 625]], [29.5, [1012, 625]], [29.95, [1010, 560]], [31.5, [1010, 560]], [31.95, [1005, 600]], [32.3, 'hold'],
	[35.3, 'hold'], [35.6, [1050, 600]], [36.7, [1050, 600]], [37.2, 'hold'], [39.45, 'hold'], [39.8, [1006, 488]], [40.0, [1006, 488]], [40.4, 'side'], [44.45, 'side'], [44.75, [1006, 488]], [44.85, [1006, 488]], [45.2, 'hold'],
	[48.25, 'hold'], [48.45, [1010, 580]], [48.6, [1004, 540]], [49.45, [1004, 540]], [49.6, [1010, 560]], [51.9, [1010, 540]], [52.25, [1006, 488]], [52.45, [1006, 488]], [52.8, 'side'], [53.55, 'side'], [53.75, [1006, 488]], [53.85, [1006, 488]], [54.2, 'hold']];
/** far hand: only the spade's second grip (C3 / C4a) */
const HAND_R: Key<HandT>[] = [[0, 'side'], [26.9, 'side'], [27.3, [1010, 704]], [29.5, [1010, 704]], [29.95, [1006, 640]], [31.4, [1006, 640]], [31.8, 'side']];
const NECK: Key<number>[] = [[0, 8], [6.5, -14], [7.4, -14], [9.0, -14], [9.6, -20], [11.3, -12], [11.9, 0], [15.4, 0], [15.6, -28], [16.1, -18], [16.5, 0], [17.6, 0], [18.1, -10], [18.6, 0],
	[19.6, 0], [20.4, 26], [21.6, 26], [22.0, 6], [22.3, -14], [23.4, -14], [23.8, -6], [27.1, -6], [27.36, -16], [28.2, 18], [29.4, 18], [30.0, 6], [31.9, -14], [32.3, 0],
	[35.3, 0], [35.6, -10], [36.6, -10], [37.0, 0], [39.4, 0], [39.7, -16], [41.4, -12], [44.4, -12], [45.0, 0], [48.3, 0], [48.6, 22], [49.3, 22], [49.6, -14], [51.8, -12], [52.3, -16], [53.6, -14], [54.0, 0]];
const handPos = (keys: Key<HandT>[], t: number, p: Pose, s: 'L' | 'R'): P2 | null => {
	const resolve = (v: HandT): P2 => v === 'hold' ? [X + (0.17 + 0.008 * Math.sin(t * 7)) * HH, G - 0.5 * HH] : v === 'side' ? J(p, `${s}Hand`, X, G, HH) : v;
	let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
	const [a, va] = keys[i], nx = keys[i + 1];
	if (!nx || t <= a) return va === 'side' ? null : resolve(va);
	const u = eio(seg(t, a, nx[0])); if (va === 'side' && nx[1] === 'side') return null;
	const A = resolve(va), Bp = resolve(nx[1]); return [lerp(A[0], Bp[0], u), lerp(A[1], Bp[1], u)];
};
export type Era = 'shang' | 'zhou' | 'qin' | 'han' | 'tang';
/** the walker at t: pose (body units), the near/far grip points (screen) */
export const walkerAt = (t: number) => {
	let p: Pose;
	if (t >= 6.3 && t < 7.5) { const rev = walkPose(0.7 - 1.5 * (t - 6.3)), k = seg(t, 7.0, 7.45); p = mixPose(rev, STAND, eio(k)); }   // ◀◀ walking backwards, then still
	else { const m = speedAt(t); p = m > 0 ? mixPose(STAND, walkPose(phaseAt(t)), eio(m)) : STAND; }
	p = look(p, track(t, NECK));
	const gl = handPos(HAND_L, t, p, 'L'); if (gl) p = ikArm(p, 'L', toBody(gl[0], gl[1], X, G, HH));
	const gr = handPos(HAND_R, t, p, 'R'); if (gr) p = ikArm(p, 'R', toBody(gr[0], gr[1], X, G, HH));
	const hl = J(p, 'LHand', X, G, HH), el = J(p, 'LElb', X, G, HH), d = Math.hypot(hl[0] - el[0], hl[1] - el[1]) || 1;
	const grip: P2 = [hl[0] + (hl[0] - el[0]) / d * 0.03 * HH, hl[1] + (hl[1] - el[1]) / d * 0.03 * HH];
	return {p, grip, hip: J(p, 'Hips', X, G, HH)};
};
const Walker: React.FC<{t: number; era: Era}> = ({t, era}) => { const w = walkerAt(t);
	return <RimFig x={X} ground={G} h={HH} pose={w.p} look={LOOKS[era].look} col={B.lac} dx={3} dy={-2.5} T={t} />; };
/** a string of five cowries swinging at his belt (好带), from 16.2 until it drops in 秦 */
const BeltShells: React.FC<{t: number}> = ({t}) => { if (t < 16.2 || t > 38.6) return null;
	const w = walkerAt(t), [hx, hy] = w.hip, sw = 10 * Math.sin(t * 4.6) * (0.4 + 0.6 * speedAt(t)), pop = land(seg(t, 16.2, 16.6));
	const fall = seg(t, 37.95, 38.45), fy = fall * fall * (G - hy - 20), fx = -fall * 60 * 0;
	const top: P2 = [hx + 0.05 * HH, hy - 0.02 * HH];
	return <g opacity={cl(pop * 2) * (1 - seg(t, 38.4, 38.6))} transform={`translate(${top[0] + fx},${top[1] + fy}) rotate(${sw * (1 - fall)}) scale(${lerp(0.4, 1, pop)})`}>
		<path d="M0,0 Q6,40 0,78" stroke="#9A7440" strokeWidth={2.5} fill="none" />
		{[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${i % 2 ? 7 : -5},${14 + i * 15}) rotate(${80 + i * 8})`}><Cw L={20} /></g>)}
	</g>; };
/** cowrie, gold leaf or bronze */
const Cw: React.FC<{L: number; bronze?: number}> = ({L, bronze = 0}) => { const c = cowrie(L);
	return <g><path d={c.body} fill="url(#leaf)" stroke="#8A5A1E" strokeWidth={1.5} />
		{bronze > 0 && <path d={c.body} fill="url(#brz)" opacity={bronze} stroke="#5A3A18" strokeWidth={1.5} />}
		<ellipse cx={-L * 0.08} cy={-L * 0.2} rx={L * 0.2} ry={L * 0.06} fill="#FFF6D8" opacity={0.7 * (1 - 0.6 * bronze)} transform="rotate(-8)" /><path d={c.slit} fill={B.lac} /><path d={c.teeth} stroke={bronze > 0.5 ? '#E0AE6C' : B.goldL} strokeWidth={L * 0.025} strokeLinecap="round" /></g>; };

/* ---------- picture wrapper ---------- */
const Pic: React.FC<{id: string; sheen?: number; children: React.ReactNode; vig?: boolean}> = ({id, sheen = 0.3, children, vig = true}) =>
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><LacDefs /><BronzeDefs /><Lacquer sheen={sheen} id={id} />{children}{vig && <Vignette id={id} />}</svg>;
const Layer: React.FC<{o?: number; children: React.ReactNode}> = ({o = 1, children}) => o <= 0.001 ? null : <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;

/* =============== 1 · HOOK + SCAN + REWIND (0 – 6.6) =============== */
const CH = ['财', '货', '贵', '钱'], CX = [236, 566, 896, 1290], CY = 410, CS = 300, CT = 872;
const STAMP_T = [-0.6, BEAT(1) - 0.08, BEAT(2) - 0.08, BEAT(3) - 0.08];   // 货 贵 钱 hit on the beats 0.759 · 1.325 · 1.891
const LIFT_T = [0.35, BEAT(1) + 0.27, BEAT(2) + 0.27];
const REST = [[CX[0] + 0.27 * CS, -8], [CX[1] + 0.5 * CS, 6], [CX[2] + 0.5 * CS, -4]];
const QRg: React.FC = () => <g>
	<path d={qrCells(25, 4).map(([j, i]) => `M${j * 4},${i * 4}h4.2v4.2h-4.2z`).join('')} fill={B.lac} />
	{[[0, 0], [0, 18], [18, 0]].map(([i, j]) => <g key={`${i}${j}`}><rect x={j * 4} y={i * 4} width={28} height={28} fill={B.lac} /><rect x={j * 4 + 4} y={i * 4 + 4} width={20} height={20} fill="#A39880" /><rect x={j * 4 + 8} y={i * 4 + 8} width={12} height={12} fill={B.lac} /></g>)}
</g>;
const PH: P2 = [1360, 800];   // the phone's centre
const Hook: React.FC<{t: number}> = ({t}) => {
	const fadeCh = 1 - seg(t, 3.0, 3.6), z = 1 + 0.02 * ease(seg(t, 0, 3)) + 0.43 * eio(seg(t, 3.0, 4.6));
	const rw = seg(t, 4.4, 6.6), peel = eio(seg(t, 4.65, 5.6)), timber = seg(t, 4.8, 5.8), qrO = 1 - seg(t, 4.7, 5.3);
	const check = land(seg(t, BEAT(6) - 0.06, BEAT(6) + 0.35));   // ✓ on the beat 3.589
	return <Pic id="hk" sheen={0.12 + 0.12 * t}>
		<defs><SilverGrad id="svH" x0={CX[3]} x1={CX[3] + 0.5 * CS} k={seg(t, 2.0, 3.3)} /></defs>
		<g transform={`translate(${PH[0]},${PH[1] - 40}) scale(${z}) translate(${-PH[0]},${-PH[1] + 40})`}>
			<g opacity={fadeCh}><ScrollBand y={346} x0={150} x1={1700} flow={t * 40} /></g>
			<g opacity={0.35 * fadeCh} fill="none" stroke="#5A2A1C" strokeWidth={3}>{[[230, 790, 44, 1], [1640, 520, 40, 1], [1660, 760, 50, -1]].map(([x, y, r, d], i) => <path key={i} d={curl(x + 10 * t, y, r, d, 3)} />)}</g>
			{/* the stall: dark counter → timber on the rewind */}
			<rect x={-40} y={CT} width={W + 80} height={H - CT + 40} fill="#1E0F0B" />
			<rect x={-40} y={CT} width={W + 80} height={H - CT + 40} fill="#3A2216" opacity={timber} />
			<g opacity={timber * 0.5}>{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-40,${CT + 18 + i * 34} Q600,${CT + 10 + i * 34} 1200,${CT + 22 + i * 34} T${W + 40},${CT + 16 + i * 34}`} stroke="#7A5232" strokeWidth={2} fill="none" />)}</g>
			<rect x={-40} y={CT} width={W + 80} height={4} fill={B.gold} opacity={0.45} />
			<g opacity={1 - timber}><ScrollBand y={CT + 40} x0={-40} x1={W + 40} h={44} flow={t * 20} /></g>
			<Pool id="hk" x={lerp(760, PH[0], seg(t, 3, 4.5))} y={CT - 10} rx={lerp(760, 420, seg(t, 3, 4.5))} ry={lerp(150, 260, seg(t, 3, 4.5))} a={0.22} />
			{/* the code plaque, gone on the rewind (no codes in 1024) */}
			<g opacity={qrO}><rect x={1452} y={CT - 150} width={124} height={124} rx={6} fill="#A39880" stroke={BG.lineS} strokeWidth={2} />
				<rect x={1500} y={CT - 26} width={28} height={26} fill={BG.post} stroke={BG.line} strokeWidth={2} />
				<g transform={`translate(${1464},${CT - 138})`}><QRg /></g></g>
			{/* the phone: blank → ✓ on the beat → its glow peels off as a paper slip, the phone fades */}
			<ellipse cx={1356} cy={CT + 4} rx={62} ry={8} fill="#000" opacity={0.3} />
			<g transform={`translate(1318,${CT - 146}) rotate(-7)`} opacity={1 - peel}>
				<rect x={0} y={0} width={84} height={152} rx={13} fill={B.lac} stroke={B.gold} strokeWidth={3} />
				<rect x={7} y={12} width={70} height={126} rx={6} fill="#3A2219" />
				<rect x={7} y={12} width={70} height={126} rx={6} fill="#FFD9A0" opacity={0.25 * cl(check * 2)} />
				{check > 0 && <g transform={`translate(42,72) scale(${check})`}><circle r={22} fill="none" stroke={B.goldL} strokeWidth={5} /><path d="M-11,0 l8,9 l15,-18" fill="none" stroke={B.goldL} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></g>}
			</g>
			{peel > 0 && t < 6.3 && <g transform={`translate(${1318 + 42},${CT - 70}) rotate(${lerp(-7, -3, peel)}) translate(${lerp(-42, -50, peel)},${lerp(-76, -150, peel)}) scale(${lerp(0.62, 0.78, peel)})`} filter="url(#glS)" opacity={cl(peel * 3)}>
				<JiaoziB w={128} h={224} id="hks" /></g>}
			{/* the four characters and the 贝 → cowrie drops */}
			<g opacity={fadeCh}>
				{CH.map((ch, i) => { const a = STAMP_T[i], k = land(seg(t, a, a + 0.5)), x = CX[i], s = CS;
					if (k <= 0) return null;
					const sc = lerp(1.25, 1, k), op = cl(k * 3), isQ = ch === '钱', b = LIFT_T[i] ?? 0, lift = seg(t, b + 0.15, b + 0.4);
					return <g key={ch} opacity={op} transform={`translate(${x + s / 2},${CY + s / 2}) scale(${sc}) translate(${-x - s / 2},${-CY - s / 2})`}>
						<Glyph ch={ch} x={x} y={CY} s={s} part="rest" id={`a${i}`} fill={B.red} stroke="#D9AC5E" sw={3} />
						{!isQ && lift > 0 && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`as${i}`} fill="rgba(8,3,2,0.45)" stroke="#D9AC5E" sw={2.5} style={{opacity: cl(lift * 3), strokeDasharray: '10 7'}} />}
						{!isQ && lift <= 0 && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`ac${i}`} fill={t > b ? 'url(#leaf)' : B.red} stroke="#D9AC5E" sw={3} />}
						{isQ && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="aq" fill={t > 2.0 ? 'url(#svH)' : B.red} stroke={t > 2.0 ? '#F2F8FB' : '#D9AC5E'} sw={3} />}
					</g>; })}
				{[0, 1, 2].map((i) => { const b = LIFT_T[i], x = CX[i], s = CS, ch = CH[i], [ccx, ccy] = COMP_C[ch], lx = x + ccx * s, ly = CY + ccy * s;
					const lk = eio(seg(t, b + 0.15, b + 0.4)), fk = seg(t, b + 0.4, b + 0.9), gk = 1 - seg(t, b + 0.4, b + 0.58), ck = seg(t, b + 0.46, b + 0.6);
					if (lk <= 0) return null;
					const [rx, rr] = REST[i], ry = CT - 116 * 0.36, px = lerp(lx, rx, eio(fk)), py = lerp(ly - 34 * lk, ry, fk * fk) - Math.sin(Math.PI * fk) * 40;
					return <g key={i}>
						{gk > 0 && <g opacity={gk} filter="url(#gl)" transform={`translate(${px},${py}) scale(${lerp(1, 1.06, lk) * lerp(1, 0.5, Math.min(1, fk * 2.5))}) translate(${-lx},${-ly})`}><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`ar${i}`} fill="url(#leaf)" stroke={B.goldL} sw={2} /></g>}
						{ck > 0 && <>{fk >= 0.98 && <ellipse cx={rx} cy={CT + 3} rx={58} ry={7} fill="#000" opacity={0.32} />}
							<g filter={fk < 1 ? 'url(#gl)' : 'url(#glS)'} transform={`translate(${px},${py}) rotate(${lerp(-20, rr + 1.5 * Math.sin(t * 2.2 + i), fk)}) scale(${lerp(s * 0.42, 116, eout(fk)) / 116})`} opacity={ck}><Cw L={116} /></g></>}
					</g>; })}
			</g>
			{/* ◀◀ rewind: a cue and streaks running back (right) */}
			{rw > 0 && rw < 1 && <g opacity={Math.sin(Math.PI * rw)}>
				{Array.from({length: 9}, (_, i) => { const y = 200 + i * 70 + 20 * rnd(i, 3), x = ((rnd(i, 5) * 1900 + (t - 4.4) * 600) % 2200) - 200; return <path key={i} d={`M${x},${y} h${160 + 120 * rnd(i, 7)}`} stroke={B.gold} strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" />; })}
			</g>}
		</g>
		{rw > 0 && rw < 0.5 && <g transform="translate(960,560)" opacity={Math.sin(Math.PI * rw * 2) * 0.7}><path d="M-6,-40 L-66,0 L-6,40 Z M60,-40 L0,0 L60,40 Z" fill={B.goldL} /></g>}
	</Pic>; };

/* =============== 2 · THE WALKER IS BORN (6.3 – 12.6): the slip in his palm becomes a cowrie; title; first step =============== */
const Born: React.FC<{t: number}> = ({t}) => {
	const e = eout(seg(t, 6.45, 7.9)), z = lerp(1.55, 1, e), cx = 0, cy = 0, rew = 260 * (1 - eout(seg(t, 6.4, 7.6))), scroll = distAt(t), w = walkerAt(t);
	const toC = eio(seg(t, 6.75, 7.25)), glint = Math.sin(Math.PI * seg(t, 9.2, 9.9));
	return <Pic id="bn" sheen={0.3}>
		<g transform={`translate(${1012 + cx},${575 + cy}) scale(${z}) translate(-1012,-575)`}>
			<g transform={`translate(${rew - scroll},0)`}><EarthWall g={G} top={600} />
				<rect x={1260} y={815} width={420} height={90} fill="#1A0D09" stroke={BG.line} strokeWidth={1.5} />
				<path d="M1320,815 q-6,-60 30,-70 h40 q36,10 30,70 Z M1470,815 l10,-90 h70 l10,90 Z" fill="#170C08" stroke={BG.line} strokeWidth={1.5} />
				<rect x={W + 40} y={600} width={1400} height={305} fill="#21110C" /></g>
			<g transform={`translate(${rew * 1.5 - scroll},0)`}><Ground g={G} lattice={false} /></g>
			{t < 7.7 && <g opacity={0.6 * (1 - seg(t, 7.0, 7.7))}>{Array.from({length: 8}, (_, i) => { const y = 380 + i * 60, x = ((rnd(i, 5) * 1900 + (t - 6.3) * 700) % 2300) - 300; return <path key={i} d={`M${x},${y} h${200 + 160 * rnd(i, 2)}`} stroke={B.gold} strokeOpacity={0.24} strokeWidth={2} strokeLinecap="round" />; })}</g>}
			<Pool id="bn" x={980} y={600} rx={460} ry={380} a={0.3} /><Pool id="bnf" x={X} y={G + 4} rx={260} ry={38} a={0.25} />
			<Walker t={t} era="shang" />
			{toC > 0 && <g transform={`translate(${w.grip[0] + 4},${w.grip[1] - 16}) rotate(-14) scale(${lerp(0.3, 1, eout(toC))})`} filter="url(#glS)"><Cw L={64} /></g>}
			{glint > 0 && <ellipse cx={w.grip[0] + 4} cy={w.grip[1] - 22} rx={22} ry={8} fill="#FFF6D8" opacity={0.7 * glint} transform={`rotate(-14,${w.grip[0] + 4},${w.grip[1] - 22})`} />}
		</g>
	</Pic>; };

/** the slip's flight (6.3–7.3), drawn once above the hook → born dissolve: from where the phone was into his palm, shrinking
    into the cowrie */
const SlipFlight: React.FC<{t: number}> = ({t}) => { const w = walkerAt(t), z = lerp(1.55, 1, eout(seg(t, 6.45, 7.9))), toC = eio(seg(t, 6.75, 7.25));
	if (toC >= 1) return null;
	const pz = (q: P2): P2 => [1012 + (q[0] - 1012) * z, 575 + (q[1] - 575) * z], palm = pz([w.grip[0], w.grip[1] - 18]), f = eio(seg(t, 6.3, 7.1));
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${lerp(1360, palm[0], f)},${lerp(731, palm[1], f)}) rotate(${-3 - 12 * f}) scale(${lerp(0.78 * 1.45, 0.08 * z, toC)})`} opacity={1 - toC}><g transform="translate(-64,-112)"><JiaoziB w={128} h={224} id="bns" /></g></g></svg>; };

/* =============== 3 · 商 WALK (12.1 – 20.0): the sea road and its porters · 稀少 · 结实 · 好带 · the casting fire =============== */
const passX = (t: number, tPass: number, k = 0.5) => X - V * k * (t - tPass);   // a mid-layer object (parallax k) that passes the walker at tPass
const ShangWalk: React.FC<{t: number}> = ({t}) => {
	const sc = distAt(t), w = walkerAt(t);
	/* 结实: the shell slips at 15.45, hits the stone at 15.75, bounces, he catches it at 16.05 */
	const drop = t >= 15.45 && t < 16.05;
	const bronze = eio(seg(t, DOWNBEAT(8) - 0.1, DOWNBEAT(8) + 0.25));
	let cw: P2 = [w.grip[0] + 4, w.grip[1] - 16];
	if (drop) { const u1 = seg(t, 15.45, 15.75), u2 = seg(t, 15.75, 16.05), hit: P2 = [X + 150, G - 46];
		cw = t < 15.75 ? [lerp(cw[0], hit[0], u1), lerp(w.grip[1] - 16, hit[1], u1 * u1)] : [lerp(hit[0], w.grip[0] + 4, u2), lerp(hit[1], w.grip[1] - 16, u2) - Math.sin(Math.PI * u2) * 90]; }
	const fire = passX(t, 18.0) + 300, pour = seg(t, 17.55, 18.3);
	return <Pic id="sw" sheen={0.25 + 0.02 * t}>
		{/* the far plain: a sea line at the right edge, the road inland, a file of porters with baskets */}
		<g transform={`translate(${-sc * 0.06},0)`}>
			<path d="M-100,612 H2600" stroke={B.ochre} strokeOpacity={0.18} strokeWidth={2} />
			<path d="M1500,606 H2600" stroke="#9AB3C0" strokeOpacity={0.5} strokeWidth={3} />
			<path d="M1500,600 Q1720,592 2600,596" stroke="#9AB3C0" strokeOpacity={0.25 + 0.1 * Math.sin(t * 3)} strokeWidth={1.5} fill="none" />
			<path d="M1560,612 Q1200,650 900,640 T200,660" stroke={B.ochre} strokeOpacity={0.22} strokeWidth={6} fill="none" />
			{Array.from({length: 8}, (_, i) => { const u = ((i / 8 + t * 0.018) % 1), x = lerp(1520, 260, u), y = lerp(612, 655, u) - 22 + 6 * Math.sin(u * 7), bob = Math.abs(Math.sin((t + i) * 6)) * 2;
				return <g key={i} transform={`translate(${x},${y - bob})`} fill="#120906" opacity={0.85}><circle cx={0} cy={-34} r={4.5} /><rect x={-4} y={-30} width={8} height={18} rx={3} /><path d="M-4,-12 l-3,12 h3 l3,-9 l3,9 h3 l-3,-12 Z" />
					<path d="M-9,-40 h18 l-3,10 h-12 Z" fill="#2A1710" stroke={B.gold} strokeOpacity={0.3} strokeWidth={0.8} /></g>; })}
		</g>
		<rect x={-40} y={640} width={W + 80} height={G - 640} fill="#1A0D09" opacity={0.85} />
		{/* 稀少: a market mat — one cowrie on the trader's palm against a whole load */}
		{(() => { const mx = passX(t, 15.0) + 330; if (mx < -500 || mx > 2400) return null; return <g transform={`translate(${mx},0)`}>
			<path d="M-230,820 h420 l30,40 h-480 Z" fill="#24120D" stroke={BG.line} strokeWidth={1.5} />
			{[[-180, 790, 44], [-120, 780, 52], [-60, 796, 40], [-150, 744, 40], [-90, 740, 42]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#2E1A10" stroke={BG.lineS} strokeWidth={1.5} />)}
			<RimFig x={140} ground={860} h={300} pose={ikArm(grounded({lean: 6, neck: 10, lt: 4, lk: 4, rt: -5, rk: 5, la: 60, le: 30, ra: 4, re: 12}), 'L', toBody(60, 690, 140, 860, 300, true))} look={LOOKS.shang.look} col="#100806" flip dx={-2} dy={-2} rimO={0.35} />
			<g transform="translate(58,676) rotate(-10)" filter="url(#glS)"><Cw L={40} /></g>
			<path d="M-20,700 l30,0 M-20,710 l30,0" stroke={B.goldL} strokeOpacity={0.6} strokeWidth={3} />
		</g>; })()}
		{/* the casting fire: a furnace with a glowing mouth, a crucible pours into a mould */}
		{fire > -600 && fire < 2500 && <g transform={`translate(${fire},0)`}>
			<path d="M-120,860 Q-120,700 0,690 Q120,700 120,860 Z" fill="#1C0E0A" stroke={BG.lineS} strokeWidth={1.5} />
			<path d="M-40,860 Q-40,800 0,796 Q40,800 40,860 Z" fill="#FF9A40" opacity={0.55 + 0.25 * Math.sin(t * 9)} />
			<Pool id="fr" x={0} y={820} rx={260} ry={150} a={0.18} col="#FF9A40" />
			<RimFig x={260} ground={880} h={330} pose={ikArm(grounded({lean: 22, neck: 18, lt: 8, lk: 20, rt: -10, rk: 18, la: 70, le: 20, ra: 4, re: 12}), 'L', toBody(185, 690, 260, 880, 330, true))} look={LOOKS.shang.look} col="#100806" flip dx={-2} dy={-2} rimO={0.35} />
			<g transform={`translate(170,690) rotate(${lerp(0, 60, eio(pour))})`}><path d="M-34,-6 h40 l-6,34 h-28 Z" fill="#3A2A20" stroke="#8A6232" strokeWidth={1.5} /><path d="M-30,-4 h32 v6 h-32 Z" fill="#FFB060" opacity={0.9 * (1 - seg(t, 18.1, 18.4))} /></g>
			{pour > 0.3 && pour < 0.98 && <path d={`M150,712 Q140,760 130,${838}`} stroke="#FFC070" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />}
			<rect x={90} y={838} width={90} height={22} rx={4} fill="#2A1710" stroke="#8A6232" strokeWidth={1.5} />
			<rect x={100} y={840} width={70} height={10} fill="#FFB060" opacity={pour > 0.4 ? 0.8 * (1 - seg(t, 18.6, 19.6)) : 0} />
		</g>}
		<g transform={`translate(${-sc},0)`}><Ground g={G} lattice={false} />
			{/* the stone the shell bounces on */}
			<path d={`M${X + 110 + V * 0 + distAt(15.75)},${G} q8,-26 40,-28 q32,2 40,28 Z`} fill="#2A1A12" stroke={BG.lineS} strokeWidth={1.5} />
		</g>
		<Pool id="sw" x={X + 100} y={600} rx={460} ry={400} a={0.26} /><Pool id="swf" x={X} y={G + 4} rx={260} ry={38} a={0.25} />
		<Walker t={t} era="shang" />
		<BeltShells t={t} />
		<g transform={`translate(${cw[0]},${cw[1]}) rotate(${drop ? (t - 15.45) * 900 : -14})`} filter="url(#glS)"><Cw L={64} bronze={bronze} /></g>
	</Pic>; };

/* =============== 4 · C1 + THE GUESS (19.5 – 24.1): 钱 floats down, he stops and looks up; 先猜？ and three guesses =============== */
const QX = 1040, QY = 270, QS = 230;
const FloatQian: React.FC<{t: number; y?: number; s?: number; restO?: number; compO?: number; id: string}> = ({t, y = QY, s = QS, restO = 1, compO = 1, id}) => {
	const bob = 6 * Math.sin(t * 2.2);
	return <g><defs><SilverGrad id={`sv${id}`} x0={QX} x1={QX + s * 0.5} k={(t * 0.35) % 1.4} /></defs>
		<g opacity={restO}><Glyph ch="钱" x={QX} y={y + bob} s={s} part="rest" id={`${id}r`} fill={B.red} stroke="#D9AC5E" sw={2.5} /></g>
		<g opacity={compO}><Glyph ch="钱" x={QX} y={y + bob} s={s} part="comp" id={`${id}q`} fill={`url(#sv${id})`} stroke="#F2F8FB" sw={2.5} /></g></g>; };
const Guess: React.FC<{t: number}> = ({t}) => {
	const w = walkerAt(t), qIn = eout(seg(t, 19.6, 20.4)), prompt = land(seg(t, BEAT(38) - 0.05, BEAT(38) + 0.45));
	const opt = (i: number) => cl(seg(t, 21.85 + i * 0.12, 22.2 + i * 0.12)) * (i === 2 ? 1 : 1 - seg(t, 23.3, 23.6));
	const tick = (i: number) => (t > 22.2 ? -8 * Math.abs(Math.sin(Math.PI * (t - BEAT(39) - i * 0.566) / 1.132)) : 0);
	const spadeFwd = eio(seg(t, 23.35, 24.0));
	return <Pic id="gs" sheen={0.25}>
		<g transform={`translate(${-distAt(t) * 0.5},0)`}><EarthWall g={G} top={680} /></g>
		<g transform={`translate(${-distAt(t)},0)`}><Ground g={G} lattice={false} /></g>
		<Pool id="gs" x={1100} y={520} rx={620} ry={420} a={0.26} />
		<Walker t={t} era="shang" />
		<g transform={`translate(${w.grip[0] + 4},${w.grip[1] - 16}) rotate(-14)`} filter="url(#glS)" opacity={1 - seg(t, 23.6, 23.9)}><Cw L={64} bronze={1} /></g>
		<g opacity={cl(qIn * 1.5)} transform={`translate(0,${lerp(-160, 0, qIn)})`}><FloatQian t={t} id="g1" /></g>
		{prompt > 0 && <g transform={`translate(1310,300) rotate(-4) scale(${lerp(0.5, 1, prompt)})`} opacity={cl(prompt * 2) * (1 - seg(t, 23.4, 23.7))}><rect x={0} y={0} width={176} height={72} rx={36} fill={B.goldL} /><text x={88} y={50} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={42} fill={B.lac}>先猜？</text></g>}
		<g transform="translate(1260,640) scale(1.2) translate(-1260,-640)">
			<g opacity={0.6 * opt(0)} transform={`translate(1120,${650 + tick(0)})`}><path d="M-46,22 L-32,-18 L32,-18 L46,22 Z" fill="url(#brz)" /><Label x={0} y={82} s="金块？" fs={34} anchor="middle" /></g>
			<g opacity={0.6 * opt(1)} transform={`translate(1310,${640 + tick(1)})`}><KnifeCoin x={-60} y={0} L={130} rot={-12} /><Label x={0} y={92} s="刀？" fs={34} anchor="middle" /></g>
		</g>
		{opt(2) > 0 && <g opacity={lerp(0.6, 1, spadeFwd) * opt(2) * (1 - seg(t, 23.8, 24.05))} transform={`translate(${lerp(1560, SPX, spadeFwd)},${lerp(672 + 1.2 * tick(2), G - 75, spadeFwd)}) scale(${lerp(1.2, 1.36, spadeFwd)})`}>
			<path d={spade(110, 90).handle} fill={spadeFwd > 0 ? B.ochre : '#8A6232'} /><path d={spade(110, 90).blade} fill={spadeFwd > 0 ? B.red : '#8A6232'} />
			<g opacity={1 - spadeFwd}><Label x={0} y={132} s="铲子？" fs={34} anchor="middle" /></g></g>}
	</Pic>; };

/* =============== 5 · THE FIELD (23.5 – 34.6): C2 the spade in his hand · C3 driven into the soil (27.364) · C4a the 钅 is poured
   into a mould and cast as a 布币 · C4b the 钱 tag hops onto the coin, he walks on =============== */
const SPX = 1005, SP = spade(150, 250);
const Field: React.FC<{t: number}> = ({t}) => {
	const sc = distAt(t), w = walkerAt(t);
	const strike = t < 27.25 ? 0 : t < 27.364 ? eio(seg(t, 27.25, 27.364)) : 1, pullUp = eio(seg(t, 29.55, 29.95));
	const sinkY = 40 * strike - 100 * pullUp;   // + = into the soil
	const spadeO = 1 - seg(t, 31.45, 31.7);
	const qDrop = eout(seg(t, 27.25, 27.364 + 0.25)), qY = lerp(305, 345, qDrop), restO = 1 - seg(t, 31.0, 31.6);
	const melt = seg(t, 30.0, 30.9), mould = eio(seg(t, 30.3, 30.8)) * (1 - eio(seg(t, 31.55, 31.9))), glow = Math.sin(Math.PI * seg(t, 30.8, 31.6));
	const coin = seg(t, 31.6, 31.9), tagHop = seg(t, 32.35, 32.85), label = land(seg(t, 27.85, 28.3)) * (1 - seg(t, 32.3, 32.45));
	const spY = G - 75 + sinkY;   // the blade centre
	return <Pic id="fd" sheen={0.25}>
		<g transform={`translate(${-sc * 0.2},0)`}><path d="M-40,905 Q300,770 620,840 Q980,730 1320,830 Q1640,770 2000,850 Q2400,780 2900,860 V905 H-40 Z" fill={B.far} /></g>
		<g transform={`translate(${-sc * 0.5},0)`}><path d={treeD(1640, 905, 1.4)} fill="#1A0D09" stroke={BG.line} strokeWidth={2} /><path d={treeD(300, 905, 1.1)} fill="#1A0D09" stroke={BG.line} strokeWidth={2} /><path d={treeD(2400, 905, 1.25)} fill="#1A0D09" stroke={BG.line} strokeWidth={2} /></g>
		<g transform={`translate(${-sc},0)`}><rect x={-40} y={G} width={4000} height={H - G + 40} fill="#1A0D09" /><path d={furrows(G, 30)} stroke={B.gold} strokeWidth={1.5} fill="none" opacity={0.12} />
			{/* the soil mound the spade went into (stays behind when he walks on) */}
			<path d={`M${SPX - 130 + distAt(29.5)},${G + 40} Q${SPX - 90 + distAt(29.5)},${G - 6} ${SPX - 20 + distAt(29.5)},${G - 8} Q${SPX + 60 + distAt(29.5)},${G - 14} ${SPX + 140 + distAt(29.5)},${G + 40} Z`} fill="#1E0F0B" stroke={BG.lineS} strokeWidth={1.5} opacity={seg(t, 27.3, 27.4)} />
		</g>
		<Pool id="fd" x={980} y={600} rx={560} ry={420} a={0.28} /><Pool id="fdf" x={X + 60} y={G + 4} rx={320} ry={40} a={0.25} />
		{/* the spade: blade into the soil on the strike, pulled up, then the mould closes on it */}
		{spadeO > 0 && t >= 23.9 && <g opacity={spadeO}><g clipPath={pullUp < 1 && strike > 0 ? 'url(#soilClip)' : undefined}><g transform={`translate(${SPX},${spY})`}>
			<path d={SP.handle} fill={B.ochre} stroke={B.gold} strokeWidth={2.5} /><path d={SP.blade} fill={B.red} stroke={B.goldL} strokeWidth={3} /></g></g></g>}
		<defs><clipPath id="soilClip"><rect x={0} y={0} width={W} height={G + 2} /></clipPath></defs>
		{strike > 0 && t < 27.9 && Array.from({length: 7}, (_, i) => { const u = seg(t, 27.364, 27.9), a = -Math.PI * (0.15 + 0.7 * rnd(i, 3)); return <circle key={i} cx={SPX + Math.cos(a) * 120 * u} cy={G - 6 + Math.sin(a) * 90 * u + 160 * u * u} r={4 + 3 * rnd(i, 4)} fill="#3A2216" opacity={1 - u} />; })}
		<Walker t={t} era="zhou" />
		{/* the floating 钱: settles over the spade on the strike; its 钅 melts down into the mould (the metal) */}
		<FloatQian t={t} y={qY} s={210} restO={restO} compO={1 - melt} id="fq" />
		{melt > 0 && melt < 1 && <path d={`M${QX + 50},${qY + 150} Q${QX + 20},${qY + 230 + 40 * melt} ${SPX},${lerp(qY + 200, spY - 110, melt)}`} stroke="url(#silvF)" strokeWidth={10 * Math.sin(Math.PI * melt) + 2} fill="none" strokeLinecap="round" />}
		<defs><linearGradient id="silvF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4FAFD" /><stop offset="1" stopColor="#B9C4CB" /></linearGradient></defs>
		{/* the mould: two dark halves close round the spade, glow inside, open on the cast 布币 */}
		{mould > 0 && <g>{[-1, 1].map((sd) => <g key={sd} transform={`translate(${SPX + sd * lerp(160, 0, mould)},${spY})`}>
			<path d={sd < 0 ? 'M0,-110 H-62 Q-82,-110 -82,-90 V86 Q-82,106 -62,106 H0 Z' : 'M0,-110 H62 Q82,-110 82,-90 V86 Q82,106 62,106 H0 Z'} fill="#24140E" stroke={B.gold} strokeOpacity={0.6} strokeWidth={2} />
			<path d={sd < 0 ? 'M-4,-90 V90' : 'M4,-90 V90'} stroke="#FFB060" strokeWidth={6} opacity={glow * 0.9 * mould} /></g>)}</g>}
		{coin > 0 && t < 32.3 && <g transform={`translate(${w.grip[0] + 6},${w.grip[1] - 70})`} opacity={coin}><BuCoin x={0} y={0} Hh={lerp(240, 140, coin)} /></g>}
		{t >= 32.3 && <HeldBu t={t} grip={w.grip} hop={tagHop} />}
		{label > 0 && <g transform={`translate(${SPX + 300},${600}) scale(${lerp(0.6, 1, label)})`} opacity={cl(label * 2)}><rect x={0} y={-44} width={250} height={66} rx={8} fill={B.cream} /><text x={125} y={4} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={42} fill={B.lac}>钱 = 铲子</text>
			<path d={`M0,-10 L${-200},${60}`} stroke={B.cream} strokeOpacity={0.6} strokeWidth={2} /></g>}
	</Pic>; };
/** the cast 布币 in his hand, with the 钱 tag that hops onto it (C4b) and hangs from its handle hole */
const HeldBu: React.FC<{t: number; grip: P2; hop: number; fan?: boolean}> = ({t, grip, hop}) => {
	const c: P2 = [grip[0] + 6, grip[1] - 70], hole: P2 = [c[0], c[1] - 70 * 0.94];
	const from: P2 = [1230, 600], tagP: P2 = hop < 1 ? [lerp(from[0], hole[0] + 50, eout(hop)), lerp(from[1], hole[1] + 30, eout(hop)) - Math.sin(Math.PI * hop) * 120] : [hole[0] + 50 + 4 * Math.sin(t * 4), hole[1] + 30];
	return <g><g filter="url(#glS)"><BuCoin x={c[0]} y={c[1]} Hh={140} /></g>
		{hop > 0 && <g>{hop >= 1 && <path d={`M${hole[0]},${hole[1]} Q${hole[0] + 20},${hole[1] + 30} ${tagP[0]},${tagP[1]}`} stroke={B.goldL} strokeWidth={2} fill="none" />}
			<g transform={`translate(${tagP[0]},${tagP[1]}) rotate(${-6 + 4 * Math.sin(t * 3)})`}><rect x={0} y={0} width={54} height={54} rx={5} fill={B.cream} /><text x={27} y={42} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={40} fill={B.lac}>钱</text></g></g>}
	</g>; };

/* =============== 6 · 战国 (wipe on 34.157 → 37.3): stalls slide by; he stops; four kinds of coin fan out in his hand =============== */
const fanK = (t: number, i: number) => eout(seg(t, 35.4 + i * 0.16, 35.7 + i * 0.16));
const Warring: React.FC<{t: number}> = ({t}) => {
	const sc = distAt(t), w = walkerAt(t), hand = w.grip;
	const stall = (sx: number, icon: React.ReactNode, i: number) => <g key={i}><rect x={sx - 150} y={720} width={300} height={185} fill={BG.beam} stroke={BG.line} strokeWidth={1.5} />
		<path d={`M${sx - 170},${470} H${sx + 170} V${560} H${sx - 170} Z`} fill={BG.red} stroke={BG.line} strokeWidth={1.5} /><rect x={sx - 160} y={470} width={6} height={250} fill={BG.post} /><rect x={sx + 154} y={470} width={6} height={250} fill={BG.post} />
		<g opacity={0.3} transform={`translate(${sx},${515})`}>{icon}</g></g>;
	return <Pic id="wr" sheen={0.3}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		<g transform={`translate(${-sc * 0.6 + distAt(35.7) * 0.6},0)`}>
			{stall(190, <KnifeCoin x={-50} y={0} L={100} />, 0)}{stall(540, <BuCoin x={0} y={0} Hh={80} />, 1)}{stall(1430, <RoundCoin x={0} y={0} r={36} hole="round" />, 2)}{stall(1770, <AntCoin x={0} y={0} L={70} />, 3)}</g>
		<g transform={`translate(${-sc},0)`}><Ground g={G} /></g>
		<Pool id="wr" x={1060} y={560} rx={480} ry={380} a={0.3} /><Pool id="wrf" x={X} y={G + 4} rx={260} ry={38} a={0.25} />
		<Walker t={t} era="zhou" />
		{/* the fan: the 布币 he already holds swings over, the knife, the round coin and the bronze shell join it */}
		<g filter="url(#glS)">
			{fanK(t, 0) > 0 && <g opacity={cl(fanK(t, 0) * 3)} transform={`translate(${hand[0]},${hand[1]}) rotate(${lerp(-90, -58, fanK(t, 0))})`}><KnifeCoin x={22} y={0} L={150} /></g>}
			<g transform={`translate(${hand[0] + 6},${hand[1] - 4}) rotate(${lerp(0, -22, fanK(t, 1))})`}><BuCoin x={0} y={-72 - 10 * fanK(t, 1)} Hh={lerp(140, 150, fanK(t, 1))} /></g>
			{fanK(t, 2) > 0 && <RoundCoin x={hand[0] + lerp(30, 92, fanK(t, 2))} y={hand[1] - lerp(30, 90, fanK(t, 2))} r={52} hole="round" rot={8} />}
			{fanK(t, 3) > 0 && <AntCoin x={hand[0] + lerp(30, 112, fanK(t, 3))} y={hand[1] - 6} L={64} rot={30} />}
		</g>
		{t < 35.6 && <g opacity={1 - seg(t, 35.3, 35.6)}><HeldTagOnly t={t} grip={hand} /></g>}
	</Pic>; };
const HeldTagOnly: React.FC<{t: number; grip: P2}> = ({t, grip}) => { const hole: P2 = [grip[0] + 6, grip[1] - 70 - 66];
	return <g><path d={`M${hole[0]},${hole[1]} Q${hole[0] + 20},${hole[1] + 30} ${hole[0] + 50},${hole[1] + 30}`} stroke={B.goldL} strokeWidth={2} fill="none" />
		<g transform={`translate(${hole[0] + 50 + 4 * Math.sin(t * 4)},${hole[1] + 30}) rotate(${-6 + 4 * Math.sin(t * 3)})`}><rect x={0} y={0} width={54} height={54} rx={5} fill={B.cream} /><text x={27} y={42} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={40} fill={B.lac}>钱</text></g></g>; };

/* =============== 7 · 秦 → 汉 → (picks up) : the hall with the balance. 秦: the old coins fall, one 半两 stays; on the pan; the
   beam levels on the downbeat 40.950. 汉 (wipe 42.08): the coin reads 五銖, the tag 五铢, level again on 43.214 =============== */
const BAL = 1250;
const beamTilt = (t: number, place: number, settle: number) => t < place ? 0 : t < settle ? 9 * Math.exp(-3 * (t - place)) * Math.cos(9 * (t - place)) * (1 - seg(t, settle - 0.15, settle)) : 0;
const Hall: React.FC<{t: number; era: 'qin' | 'han'}> = ({t, era}) => {
	const w = walkerAt(t), hand = w.grip, sc = distAt(t), stop = distAt(39.35);
	const qin = era === 'qin', drop = seg(t, 37.6, 38.3);
	const onPan = t >= 39.9 && t < 44.82, tilt = qin ? beamTilt(t, 39.9, DOWNBEAT(18)) : beamTilt(t, 42.4, DOWNBEAT(19));
	const legend = qin ? ['', '', '半', '兩'] : ['', '', '五', '銖'];
	const toSq = seg(t, 38.25, 38.6);
	return <Pic id={`hl${era}`} sheen={0.28}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		<g transform={`translate(${-(Math.min(sc, stop) - stop) * 0.6},0)`}>
			{qin ? [300, 1650, -700].map((x, i) => <path key={i} d={`M${x},230 h120 v380 l-60,-40 l-60,40 Z`} fill="#120908" stroke={BG.line} strokeWidth={1.5} />)
				: [240, 1700, -600].map((x, i) => <g key={i}><rect x={x} y={180} width={70} height={725} fill="#3A160E" stroke={BG.line} strokeWidth={1.5} /><rect x={x + 14} y={180} width={3} height={725} fill={B.gold} opacity={0.2} /></g>)}
		</g>
		<g transform={`translate(${-(Math.min(sc, stop) - stop)},0)`}>
			<rect x={BAL - 500} y={760} width={1000} height={20} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={BAL - 460} y={780} width={14} height={125} fill={BG.post} /><rect x={BAL + 440} y={780} width={14} height={125} fill={BG.post} />
		</g>
		<g transform={`translate(${-sc},0)`}><Ground g={G} />
			{/* the dropped coins and shells lie where they fell, left behind */}
			{qin && drop > 0 && <g transform={`translate(${distAt(37.6)},0)`}>{[[-60, 0], [-10, 1], [40, 3]].map(([dx, k], i) => { const y0 = 560, yy = lerp(y0, G - 14, Math.min(1, (drop * 1.15) ** 2)) - (drop > 0.85 ? Math.sin(Math.PI * seg(drop, 0.85, 1)) * 14 : 0);
				return <g key={i} transform={`translate(${X + 140 + dx},${yy}) rotate(${drop * 200 * (i - 1)})`}>{k === 0 ? <KnifeCoin x={-40} y={0} L={90} /> : k === 1 ? <BuCoin x={0} y={0} Hh={90} /> : <AntCoin x={0} y={0} L={44} />}</g>; })}</g>}
		</g>
		<Pool id={`hl${era}`} x={1100} y={560} rx={600} ry={380} a={0.3} /><Pool id={`hlf${era}`} x={X} y={G + 4} rx={260} ry={38} a={0.25} />
		<g transform={`translate(${-(Math.min(sc, stop) - stop)},0)`}>
			<Balance x={BAL} g={760} post={400} arm={250} tilt={tilt}
				left={onPan ? <RoundCoin x={0} y={-60} r={60} legend={legend} /> : null}
				right={<g><path d="M-34,-6 Q-34,-60 0,-66 Q34,-60 34,-6 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><circle cx={0} cy={-72} r={9} fill="none" stroke="url(#brz)" strokeWidth={5} /></g>} tagR={qin ? '半两' : '五铢'} />
		</g>
		<Walker t={t} era={era} />
		{/* the money in hand */}
		{qin && t < 38.6 && <g filter="url(#glS)" opacity={1 - seg(t, 37.55, 37.65)}><g transform={`translate(${hand[0]},${hand[1]}) rotate(-58)`}><KnifeCoin x={22} y={0} L={150} /></g><g transform={`translate(${hand[0] + 6},${hand[1] - 4}) rotate(-22)`}><BuCoin x={0} y={-82} Hh={150} /></g><AntCoin x={hand[0] + 112} y={hand[1] - 6} L={64} rot={30} /></g>}
		{qin && t < 39.9 && <g filter="url(#glS)">{toSq < 1 && <RoundCoin x={hand[0] + lerp(92, 20, seg(t, 37.6, 38.2))} y={hand[1] - lerp(90, 40, seg(t, 37.6, 38.2))} r={lerp(52, 44, seg(t, 37.6, 38.2))} hole="round" />}
			{toSq > 0 && <g opacity={toSq}><RoundCoin x={hand[0] + 20} y={hand[1] - 40} r={44} legend={legend} /></g>}</g>}
		{!qin && t >= 44.82 && <g filter="url(#glS)"><RoundCoin x={hand[0] + 20} y={hand[1] - 40} r={44} legend={legend} /></g>}
	</Pic>; };

/* =============== 8 · 700 YEARS (45.0 – 48.3): he walks, the 五铢 held up; seasons and banners cycle behind (from the verse hit
   45.478); the counter races 前118 → 621 =============== */
const Years: React.FC<{t: number}> = ({t}) => {
	const sc = distAt(t), w = walkerAt(t), u = seg(t, 45.478, 47.5);
	const season = Math.floor(u * 4.999), sCol = ['#C88A3A', '#E8E8E0', '#E8A0A8', '#8AA060'][season];
	return <Pic id="yr" sheen={0.3 + 0.05 * t}>
		<rect x={-40} y={620} width={W + 80} height={285} fill={BG.wall} />
		{/* unnamed banners and pillars sliding past fast in the mid layer */}
		<g transform={`translate(${-sc * 0.8},0)`}>{Array.from({length: 14}, (_, i) => { const x = distAt(45) * 0.8 + 600 + i * 330, col = ['#3A160E', '#16100C', '#2A1A10', '#3A1A14'][i % 4];
			return <g key={i}><rect x={x} y={300 + 30 * (i % 3)} width={10} height={605 - 30 * (i % 3)} fill={BG.post} /><path d={`M${x + 10},${300 + 30 * (i % 3)} h90 v190 l-45,-26 l-45,26 Z`} fill={col} stroke={BG.line} strokeWidth={1.5} /></g>; })}</g>
		<g transform={`translate(${-sc},0)`}><Ground g={G} /></g>
		{/* the seasons: leaves → snow → blossom → green, drifting down */}
		{u > 0 && u < 1 && Array.from({length: 26}, (_, i) => { const x = (rnd(i, 1) * 2100 - (t - 45.4) * 120 * (1 + rnd(i, 2))) % 2100, y = ((rnd(i, 3) * 900 + (t - 45.4) * (90 + 60 * rnd(i, 4))) % 900) + 120;
			return <ellipse key={i} cx={(x + 2100) % 2100} cy={y} rx={season === 1 ? 3 : 6} ry={season === 1 ? 3 : 3} fill={sCol} opacity={0.5 * Math.sin(Math.PI * u)} transform={`rotate(${t * 90 + i * 30},${(x + 2100) % 2100},${y})`} />; })}
		<Pool id="yr" x={X + 80} y={580} rx={440} ry={400} a={0.28} /><Pool id="yrf" x={X} y={G + 4} rx={260} ry={38} a={0.25} />
		<Walker t={t} era="han" />
		<g filter="url(#glS)"><RoundCoin x={w.grip[0] + 20} y={w.grip[1] - 40} r={44} legend={['', '', '五', '銖']} /></g>
	</Pic>; };

/* =============== 9 · 唐 (wipe on 47.742 → 54.75): he stops, flips the 五铢 — it lands as 開元通寶; the balance: the weight has no
   tag any more; he takes the coin and walks on into the hand-off pillar =============== */
const Tang: React.FC<{t: number}> = ({t}) => {
	const w = walkerAt(t), sc = distAt(t), stop = distAt(48.25);
	const toss = seg(t, 48.6, 49.5), coinUp = Math.sin(Math.PI * toss) * 100, spin = Math.cos(toss * Math.PI * 7);
	const kai = t >= 49.05;   // the face reads 開元通寶 once it has turned over at the top
	const onPan = t >= 52.45 && t < 53.82, tilt = beamTilt(t, 52.45, BEAT(93) + 0.04);
	const tagOff = seg(t, 52.6, 53.3);
	const legendK = ['開', '元', '通', '寶'], legendW = ['', '', '五', '銖'];
	const off = stop - sc;
	return <Pic id="tg" sheen={0.3}>
		<rect x={-40} y={600} width={W + 80} height={305} fill={BG.wall} />
		{/* a gate tower far back */}
		<g transform={`translate(${off * 0.3},0)`} opacity={0.9}><path d="M380,600 V420 H760 V600 Z M300,420 Q450,380 480,330 H660 Q690,380 840,420 Z M420,330 Q520,300 540,270 H600 Q620,300 720,330 Z" fill="#170C08" stroke={BG.line} strokeWidth={1.5} /></g>
		<g transform={`translate(${off},0)`}>
			<rect x={BAL - 500} y={760} width={1000} height={20} fill="#2A1710" stroke={BG.lineS} strokeWidth={1.5} /><rect x={BAL - 460} y={780} width={14} height={125} fill={BG.post} /><rect x={BAL + 440} y={780} width={14} height={125} fill={BG.post} />
			<Balance x={BAL} g={760} post={400} arm={250} tilt={tilt} left={onPan ? <RoundCoin x={0} y={-60} r={60} legend={legendK} /> : null}
				right={<g><path d="M-34,-6 Q-34,-60 0,-66 Q34,-60 34,-6 Z" fill="url(#brz)" stroke="#5A3A18" strokeWidth={2} /><circle cx={0} cy={-72} r={9} fill="none" stroke="url(#brz)" strokeWidth={5} /></g>} />
			{/* the old 五铢 tag slips off the weight and is gone: the new coin's words are a name, not a weight */}
			{tagOff < 1 && t > 50 && <g transform={`translate(${BAL + 250 + 70},${360 + 150 - 120 + tagOff * tagOff * 380}) rotate(${tagOff * 40})`} opacity={(1 - tagOff) * seg(t, 51.8, 52.3)}><rect x={-4} y={-30} width={96} height={46} rx={5} fill={B.cream} opacity={0.92} /><text x={44} y={4} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={30} fill={B.lac}>五铢</text></g>}
			<Ground g={G} />
		</g>
		<Pool id="tg" x={lerp(X + 100, 1100, seg(t, 51.9, 52.4))} y={560} rx={560} ry={400} a={0.3} /><Pool id="tgf" x={X} y={G + 4} rx={260} ry={38} a={0.25} />
		<Walker t={t} era="tang" />
		{!onPan && <g filter="url(#glS)" transform={`translate(${w.grip[0] + 20},${w.grip[1] - 40 - (toss > 0 && toss < 1 ? coinUp : 0)}) scale(1,${toss > 0 && toss < 1 ? Math.max(0.08, Math.abs(spin)) : 1})`}>
			<RoundCoin x={0} y={0} r={44} legend={kai ? legendK : legendW} /></g>}
	</Pic>; };

/* =============== the dispatcher =============== */
const X_FADE = (t: number, a: number, b: number, A: React.ReactNode, Bn: React.ReactNode) => { const u = seg(t, a, b); return <>{u < 1 && <Layer o={1}>{A}</Layer>}{u > 0 && <Layer o={u}>{Bn}</Layer>}</>; };
const wipe = (t: number, cross: number, kind: PillarKind, id: string, A: React.ReactNode, Bn: React.ReactNode) => <WipeSplit t={t} cross={cross} kind={kind} id={id} oldP={A} newP={Bn} x0={X} />;
export const W_ZHANGUO = DOWNBEAT(15), W_QIN = BEAT(65), W_HAN = BEAT(74), W_TANG = DOWNBEAT(21);   // 34.157 · 36.983 · 42.077 · 47.742
export const PartA: React.FC<{t: number}> = ({t}) => {
	if (t < 6.3) return <Hook t={t} />;
	if (t < 6.9) return <>{X_FADE(t, 6.3, 6.9, <Hook t={t} />, <Born t={t} />)}<SlipFlight t={t} /></>;
	if (t < 7.3) return <><Born t={t} /><SlipFlight t={t} /></>;
	if (t < 12.1) return <Born t={t} />;
	if (t < 12.6) return X_FADE(t, 12.1, 12.6, <Born t={t} />, <ShangWalk t={t} />);
	if (t < 19.5) return <ShangWalk t={t} />;
	if (t < 20.0) return X_FADE(t, 19.5, 20.0, <ShangWalk t={t} />, <Guess t={t} />);
	if (t < 23.5) return <Guess t={t} />;
	if (t < 24.1) return X_FADE(t, 23.5, 24.1, <Guess t={t} />, <Field t={t} />);
	if (t < 37.9) {
		if (t < 33.4) return <Field t={t} />;
		return t < 36.0 ? wipe(t, W_ZHANGUO, 'post', 'w1', <Field t={t} />, <Warring t={t} />) : wipe(t, W_QIN, 'banner', 'w2', <Warring t={t} />, <Hall t={t} era="qin" />);
	}
	if (t < 41.3) return <Hall t={t} era="qin" />;
	if (t < 43.0) return wipe(t, W_HAN, 'redpillar', 'w3', <Hall t={t} era="qin" />, <Hall t={t} era="han" />);
	if (t < 45.0) return <Hall t={t} era="han" />;
	if (t < 45.5) return X_FADE(t, 45.0, 45.5, <Hall t={t} era="han" />, <Years t={t} />);
	if (t < 46.9) return <Years t={t} />;
	if (t < 48.7) return wipe(t, W_TANG, 'gate', 'w4', <Years t={t} />, <Tang t={t} />);
	return <Tang t={t} />;
};
void ScrollBand; void Ground; void AntCoin; void BuCoin; void KnifeCoin; void JiaoziB; void H; void ease;
