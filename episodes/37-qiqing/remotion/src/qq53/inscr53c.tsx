import React from 'react';
import {W, H, rnd, lerp, cl, seg, SANS} from '../qq50/kit50';
import {B} from '../qq50/styleB';
import {Tag, Scrim} from './parts53';
import {sstep, sstep5} from './cam53';
import {planPos, planK, T_DRAW0} from './cam53c';
import {SW, LB, bladeHW} from './props53';
import {Glove} from './parts53c';
import {MarkSet} from './blade53c';
import {frameOf, DA, beatAt} from './master53';
/* ep53 · TakeC leg 10 overlays on the sword plane (plan regime): the wash, the eight marks of the inscription lit per half-bar,
   the 1966 letters flying in the blade's polish with the count per beat, and 「鸠浅 ＝ 勾践」 on DA(24). All of them are attached to the
   sword (planPos), so they ride the camera's glide. The marks are abstract bird-script ornaments (never traced glyphs). */
export const LATC = '#2A160A';
export const hexMix = (a: string, b: string, t: number) => { const f = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = f(a), Bc = f(b); return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], cl(t))).toString(16).padStart(2, '0')).join(''); };
/** lit amount of mark (side −1 = the 越王鸠浅 row, +1 = the 自作用剑 row; n 0–3) */
const HB = 1.1321;   // a half bar
const PAIRS: [number, number, number][] = [[-1, 0, DA(21)], [-1, 2, DA(21) + HB], [1, 0, DA(21) + 2 * HB], [1, 2, DA(21) + 3 * HB]];
export const litOf = (side: number, n: number, t: number) => { const p = PAIRS.find((q) => q[0] === side && (q[1] === n || q[1] + 1 === n)); if (!p) return 0; const t0 = p[2];
	const on = seg(t, t0, t0 + 0.12);
	if (side === -1 && n >= 2) return Math.max(on * (1 - 0.55 * seg(t, t0 + 1.0, t0 + 2.0)), seg(t, 51.954, 52.2));
	return on * (1 - seg(t, t0 + 0.9, t0 + 1.7)); };
export const Marks: React.FC<{t: number}> = ({t}) => { const k = planK(t); if (k < 5) return null;
	return <MarkSet id="pl" S={(a, w) => planPos(t, a, w)} o={seg(t, 43.0, 43.9)} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} />; };
/* ---------- the 1966 letters (vertical red-framed envelopes) flying in the polish, counted per beat ---------- */
const env = (x: number, y: number, r: number, s: number, i: number) => <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	<rect x={-46} y={-92} width={92} height={184} rx={4} fill="#E8DCC0" /><rect x={-22} y={-66} width={44} height={130} fill="none" stroke="#B8402A" strokeWidth={4} />
	<path d={`M-8,-52 v104 M8,-44 v80`} stroke="#3A2A20" strokeWidth={5} strokeLinecap="round" strokeDasharray="12 8" /><rect x={-38} y={-84} width={20} height={24} fill="none" stroke="#B8402A" strokeWidth={2.5} /></g>;
const LET0 = DA(23), COUNT: [number, string][] = [[LET0, '10封信'], [LET0 + 0.566, '20封信'], [LET0 + 1.132, '30封信'], [LET0 + 1.698, '40多封信']];
export const Letters: React.FC<{t: number}> = ({t}) => { const k = planK(t); if (t < LET0 - 0.2 || k < 5) return null;
	const n = 14, sc = k / 76;
	/* each letter has a landing slot on the blade (screen-fixed rows toward the tip) and flies in from the right one beat-pair after another */
	const letters = Array.from({length: n}, (_, i) => { const t0 = LET0 - 0.2 + i * 0.28, u = sstep5(seg(t, t0, t0 + 0.9)); if (u <= 0) return null;
		const tx = lerp(1350, 300 + (i % 7) * 135, 1) , ty = 640 + (rnd(i, 3) - 0.5) * 70, x = lerp(1500 + i * 8, tx, 1 - Math.pow(1 - u, 2.2)), y = lerp(ty - 50 * (1 - u), ty, u);
		return env(x, y, lerp(-24, (rnd(i, 4) - 0.5) * 40, u), 0.8 * sc * (0.9 + 0.2 * rnd(i, 5)), i); });
	const lo = 1 - seg(t, 56.0, 56.45), cnt = [...COUNT].reverse().find(([tt]) => frameOf(t) >= frameOf(tt));
	return <g>
		<g opacity={0.42 * lo} filter="url(#lt1)" clipPath="url(#ltBlade)">{letters}</g>
		<defs><filter id="lt1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2" /></filter></defs>
		{cnt && lo > 0.01 && <g opacity={lo}><Tag id="k8n" x={560} y={640 + 340} s={cnt[1]} fs={cnt[1].length > 5 ? 76 : 72} anchor="middle" col={B.cream} /></g>}
	</g>; };
/** the blade's outline in screen space (clip for the letters) */
export const BladeClip: React.FC<{t: number}> = ({t}) => { const pts = Array.from({length: 61}, (_, i) => { const s = LB * i / 60; return planPos(t, SW.bladeA + s, bladeHW(s)); }), pb = Array.from({length: 61}, (_, i) => { const s = LB * (60 - i) / 60; return planPos(t, SW.bladeA + s, -bladeHW(s)); });
	return <clipPath id="ltBlade"><path d={'M' + [...pts, ...pb].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'} /></clipPath>; };
/* ---------- 鸠浅 ＝ 勾践, on DA(24) under the 3rd and 4th marks of the lower row ---------- */
export const Reading: React.FC<{t: number}> = ({t}) => { const T = DA(24); if (frameOf(t) < frameOf(T)) return null; const k = planK(t);
	const m0 = planPos(t, SW.bladeA + 2.2 + 2 * 1.5, -0.92), m1 = planPos(t, SW.bladeA + 2.2 + 3 * 1.5, -0.92), gx = (m0[0] + m1[0]) / 2, y0 = m0[1];
	const bx0 = m1[0] - 52, bx1 = m0[0] + 52, o = Math.min(1, 1 - seg(t, 56.1, 56.48));
	return <g opacity={o}>
		<path d={`M${bx0},${y0 + 135} V${y0 + 152} H${bx1} V${y0 + 135}`} fill="none" stroke={B.goldL} strokeWidth={3} /><path d={`M${gx},${y0 + 152} V${y0 + 180}`} stroke={B.goldL} strokeWidth={3} />
		<Scrim id="k8t" x={gx} y={y0 + 248} rx={520} ry={120} a={0.6} />
		<text x={gx} y={y0 + 282} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL} stroke={B.lac} strokeWidth={10} strokeOpacity={0.85} style={{paintOrder: 'stroke'}}>鸠浅<tspan fill={B.cream} dx={22}>＝</tspan><tspan dx={22} fill="#FFF6E6">勾践</tspan></text>
		{k < 0 && null}
	</g>; };
/* ---------- the wash: a short pour from a hand-held ladle (one-tone lacquer-brown, same people style) onto the sheath, with a splash at the
   landing and a wet sheen that travels along the sheath behind it ---------- */
const LAD = '#2B1A12', LAD_RIM = '#4A2E14';
export const Water: React.FC<{t: number; dl: number}> = ({t, dl}) => { const t0 = 41.45, t1 = 43.0; if (t < t0 - 0.4 || t > t1 + 0.9) return null; const k = planK(t);
	const u = seg(t, t0, t1), a = lerp(SW.guardA + dl + 5, SW.L + 2.2 + dl - 4, sstep(u)), [tx, ty] = planPos(t, a, 0), [mx, my] = planPos(t, SW.guardA + dl + 2, 0.8);
	const come = sstep(seg(t, t0 - 0.4, t0 - 0.05)) * (1 - sstep(seg(t, t1 + 0.1, t1 + 0.7))), on = seg(t, t0, t0 + 0.08) * (1 - seg(t, t1, t1 + 0.25));
	const wob = Math.sin(t * 5.1) * 0.25 * k, lx = tx + 3 * k + wob, ly = ty - 7.5 * k - (1 - come) * 14 * k, rot = -30 + 4 * Math.sin(t * 3.3);
	const bx = lx + 2.08 * k, by = ly - 1.2 * k, hx = lx + 8.4 * k, hy = ly - 5 * k;
	const sw = Math.max(7, 0.5 * k), L = (v: number) => lerp(0, 1, v);
	const drops = Array.from({length: 26}, (_, i) => { const ph = ((t * 2.1 + rnd(i, 1)) % 1), ang = -Math.PI * rnd(i, 2), r = (0.4 + 3.2 * ph) * k * (0.5 + rnd(i, 3)); return <circle key={i} cx={tx + r * Math.cos(ang) * 1.2} cy={ty + r * Math.sin(ang) * 0.9 + 0.8 * k * ph * ph} r={Math.max(1.6, (0.12 + 0.2 * rnd(i, 4)) * k) * (1 - ph * 0.7)} fill="#EAF6FF" opacity={0.9 * (1 - ph)} />; });
	const rip = [0, 1, 2].map((i) => { const ph = ((t * 1.6 + i / 3) % 1); return <ellipse key={i} cx={tx} cy={ty} rx={(0.4 + 3.4 * ph) * k} ry={(0.2 + 1.5 * ph) * k} fill="none" stroke="#EAF6FF" strokeWidth={Math.max(2, 0.12 * k)} opacity={0.7 * (1 - ph)} />; });
	const d = `M${lx},${ly + 0.2 * k} C${lx - 0.3 * k},${lerp(ly, ty, 0.5)} ${tx + 0.2 * k},${lerp(ly, ty, 0.6)} ${tx},${ty}`;
	const [sx0, sy0] = planPos(t, SW.guardA + dl + 1, 0.7), [sx1, sy1] = planPos(t, a, 0.7), band = [0.18, 0.5, 0.82].map((f) => { const p = planPos(t, lerp(SW.guardA + dl + 1, a, f), 0.7); return p; });
	void mx; void my; void L;
	return <g>
		{on > 0.01 && <g opacity={on}>
			<path d={`M${sx0},${sy0} L${sx1},${sy1}`} stroke="#DFF1FF" strokeOpacity={0.4} strokeWidth={0.55 * k} strokeLinecap="round" />
			{band.map((p, i) => <ellipse key={i} cx={p[0]} cy={p[1]} rx={0.9 * k} ry={0.22 * k} fill="#FFFFFF" opacity={0.35 + 0.2 * Math.sin(t * 9 + i * 2)} />)}
			<ellipse cx={sx1} cy={sy1} rx={1.8 * k} ry={0.5 * k} fill="#F4FBFF" opacity={0.55} />
			<path d={d} fill="none" stroke="#9FD0EC" strokeOpacity={0.5} strokeWidth={sw * 2} strokeLinecap="round" />
			<path d={d} fill="none" stroke="#F4FBFF" strokeOpacity={0.95} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${5 * sw} ${sw}`} strokeDashoffset={-t * 700} />
			{rip}{drops}
		</g>}
		{come > 0.01 && <g opacity={come}>
			<path d={`M${bx + 2.1 * k},${by - 1.2 * k} L${hx},${hy}`} stroke={LAD} strokeWidth={0.9 * k} strokeLinecap="round" />
			<path d={`M${bx + 2.1 * k},${by - 1.75 * k} L${hx},${hy - 0.5 * k}`} stroke={LAD_RIM} strokeWidth={Math.max(2, 0.14 * k)} strokeLinecap="round" />
			<g transform={`rotate(${rot} ${bx} ${by})`}><ellipse cx={bx} cy={by} rx={2.4 * k} ry={1.5 * k} fill={LAD} /><path d={`M${bx - 2.4 * k},${by} A${2.4 * k},${1.5 * k} 0 0 1 ${bx + 2.4 * k},${by}`} fill="none" stroke={LAD_RIM} strokeWidth={Math.max(2.5, 0.16 * k)} />
				<ellipse cx={bx} cy={by - 0.2 * k} rx={1.9 * k} ry={0.8 * k} fill="#1A0F0A" /><path d={`M${bx - 1.6 * k},${by - 0.3 * k} Q${bx},${by + 0.2 * k} ${bx + 1.6 * k},${by - 0.3 * k}`} fill="none" stroke="#BFE3F2" strokeOpacity={0.6} strokeWidth={Math.max(2, 0.12 * k)} /></g>
			<g transform={`translate(0 ${2 * hy}) scale(1 -1)`}><Glove x={hx} y={hy} w={7 * k} bar={0.75 * k} sleeveTo={[hx + 5 * k, hy + 24 * k]} id="gla" rot={-20} /></g>
		</g>}
	</g>; };
void W; void H; void beatAt; void T_DRAW0;
