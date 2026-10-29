import React from 'react';
import {W, H, rnd, lerp, cl, seg, SANS} from '../qq50/kit50';
import {B} from '../qq50/styleB';
import {Tag, Scrim} from './parts53';
import {sstep, sstep5} from './cam53';
import {planPos, planK, T_DRAW0} from './cam53c';
import {SW, LB, bladeHW} from './props53';
import {birdGlyph} from './kfE53';
import {frameOf, DA, beatAt} from './master53';
/* ep53 · TakeC leg 10 overlays on the sword plane (plan regime): the wash, the eight marks of the inscription lit per half-bar,
   the 1966 letters flying in the blade's polish with the count per beat, and 「鸠浅 ＝ 勾践」 on DA(24). All of them are attached to the
   sword (planPos), so they ride the camera's glide. The marks are abstract bird-script ornaments (never traced glyphs). */
const LATC = '#2A160A';
const Glyph: React.FC<{x: number; y: number; s: number; seed: number; rot: number; col: string; w: number; o?: number}> = ({x, y, s, seed, rot, col, w, o = 1}) => { const g = birdGlyph(s, seed);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>{g.d.map((p, i) => <path key={i} d={p} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />)}
		<circle cx={g.head[0]} cy={g.head[1]} r={g.r} fill="none" stroke={col} strokeWidth={w * 0.8} /></g>; };
const hexMix = (a: string, b: string, t: number) => { const f = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = f(a), Bc = f(b); return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], cl(t))).toString(16).padStart(2, '0')).join(''); };
/** lit amount of mark (side −1 = the 越王鸠浅 row, +1 = the 自作用剑 row; n 0–3) */
const HB = 1.1321;   // a half bar
const PAIRS: [number, number, number][] = [[-1, 0, DA(21)], [-1, 2, DA(21) + HB], [1, 0, DA(21) + 2 * HB], [1, 2, DA(21) + 3 * HB]];
const litOf = (side: number, n: number, t: number) => { const p = PAIRS.find((q) => q[0] === side && (q[1] === n || q[1] + 1 === n)); if (!p) return 0; const t0 = p[2];
	const on = seg(t, t0, t0 + 0.12);
	if (side === -1 && n >= 2) return Math.max(on * (1 - 0.55 * seg(t, t0 + 1.0, t0 + 2.0)), seg(t, 51.954, 52.2));
	return on * (1 - seg(t, t0 + 0.9, t0 + 1.7)); };
export const Marks: React.FC<{t: number}> = ({t}) => { const k = planK(t); if (k < 5) return null;
	const at = (a: number, w: number) => planPos(t, a, w), o = seg(t, 43.0, 43.9);
	const lit = (side: number, n: number) => Math.min(1, Math.max(litOf(side, n, t), 0));
	const glowing = [] as {x: number; y: number; b: number}[];
	const marks = [1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => { const m = at(SW.bladeA + 2.2 + n * 1.5, side * 0.92), b = lit(side, n); if (b > 0.02) glowing.push({x: m[0], y: m[1], b});
		return <Glyph key={`${side}${n}`} x={m[0]} y={m[1]} s={1.42 * k} seed={n + (side < 0 ? 4 : 0) + 3} rot={90} col={hexMix(LATC, '#FFF2C8', b)} w={0.085 * k} o={o * (0.88 + 0.12 * b)} />; }));
	return <g>
		<defs><filter id="inG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={Math.max(2, k * 0.12)} /></filter></defs>
		<g filter="url(#inG)">{glowing.map((m, i) => <ellipse key={i} cx={m.x} cy={m.y} rx={k * 0.87} ry={k * 0.68} fill="#FFC860" opacity={0.6 * m.b} />)}</g>
		{marks}
	</g>; };
/* ---------- the 1966 letters (vertical red-framed envelopes) flying in the polish, counted per beat ---------- */
const env = (x: number, y: number, r: number, s: number, i: number) => <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	<rect x={-46} y={-92} width={92} height={184} rx={4} fill="#E8DCC0" /><rect x={-22} y={-66} width={44} height={130} fill="none" stroke="#B8402A" strokeWidth={4} />
	<path d={`M-8,-52 v104 M8,-44 v80`} stroke="#3A2A20" strokeWidth={5} strokeLinecap="round" strokeDasharray="12 8" /><rect x={-38} y={-84} width={20} height={24} fill="none" stroke="#B8402A" strokeWidth={2.5} /></g>;
const LET0 = DA(23), COUNT: [number, string][] = [[LET0, '10封信'], [LET0 + 0.566, '20封信'], [LET0 + 1.132, '30封信'], [LET0 + 1.698, '40封信'], [DA(24), '40多封信']];
export const Letters: React.FC<{t: number}> = ({t}) => { const k = planK(t); if (t < LET0 - 0.2 || k < 5) return null;
	const n = 14, sc = k / 76;
	/* each letter has a landing slot on the blade (screen-fixed rows toward the tip) and flies in from the right one beat-pair after another */
	const letters = Array.from({length: n}, (_, i) => { const t0 = LET0 - 0.2 + i * 0.28, u = sstep5(seg(t, t0, t0 + 0.9)); if (u <= 0) return null;
		const tx = lerp(1350, 300 + (i % 7) * 135, 1) , ty = 640 + (rnd(i, 3) - 0.5) * 70, x = lerp(1500 + i * 8, tx, 1 - Math.pow(1 - u, 2.2)), y = lerp(ty - 50 * (1 - u), ty, u);
		return env(x, y, lerp(-24, (rnd(i, 4) - 0.5) * 40, u), 0.8 * sc * (0.9 + 0.2 * rnd(i, 5)), i); });
	const cnt = [...COUNT].reverse().find(([tt]) => frameOf(t) >= frameOf(tt));
	return <g>
		<g opacity={0.42} filter="url(#lt1)" clipPath="url(#ltBlade)">{letters}</g>
		<defs><filter id="lt1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2" /></filter></defs>
		{cnt && <Tag id="k8n" x={560} y={640 + 340} s={cnt[1]} fs={cnt[1].length > 5 ? 76 : 72} anchor="middle" col={B.cream} />}
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
/* ---------- the wash: water poured on the sheath from the top right, running off its sides ---------- */
export const Water: React.FC<{t: number; dl: number}> = ({t, dl}) => { const t0 = 41.45, t1 = 43.0; if (t < t0 - 0.2 || t > t1 + 0.9) return null; const k = planK(t);
	const u = seg(t, t0, t1), a = lerp(SW.guardA + dl + 5, SW.L + 2.2 + dl - 4, sstep(u)), w = Math.sin(t * 3.1) * 0.8, [tx, ty] = planPos(t, a, w);
	const on = seg(t, t0 - 0.15, t0 + 0.1) * (1 - seg(t, t1, t1 + 0.6)), sx = tx + 140 * (k / 27), sy = -30;
	const drops = Array.from({length: 22}, (_, i) => { const ph = ((t * 1.7 + rnd(i, 1)) % 1), ang = rnd(i, 2) * 6.28, r = (10 + 60 * ph) * (k / 27) * (0.5 + rnd(i, 3)); return <circle key={i} cx={tx + r * Math.cos(ang)} cy={ty + r * Math.sin(ang) * 0.6} r={(1 + 2.4 * rnd(i, 4)) * (1 - ph) * (k / 27)} fill="#EAF6FF" opacity={0.8 * (1 - ph)} />; });
	const rip = [0, 1, 2].map((i) => { const ph = ((t * 1.3 + i / 3) % 1); return <ellipse key={i} cx={tx} cy={ty} rx={(8 + 70 * ph) * (k / 27)} ry={(4 + 32 * ph) * (k / 27)} fill="none" stroke="#EAF6FF" strokeWidth={2} opacity={0.6 * (1 - ph)} />; });
	/* a thin curved stream from the top right edge down onto the sheath */
	const d = `M${sx + 60},${sy} Q${lerp(sx, tx, 0.6) + 40},${lerp(sy, ty, 0.35)} ${tx},${ty}`;
	return <g opacity={on}>
		<path d={d} fill="none" stroke="#BFE3F2" strokeOpacity={0.35} strokeWidth={14 * (k / 27)} strokeLinecap="round" />
		<path d={d} fill="none" stroke="#F4FBFF" strokeOpacity={0.85} strokeWidth={4.5 * (k / 27)} strokeLinecap="round" strokeDasharray={`${40 * (k / 27)} ${9 * (k / 27)}`} strokeDashoffset={-t * 900} />
		{rip}{drops}
		<path d={`M${sx + 40},${sy} L${sx + 150},${sy} L${sx + 110},${sy + 36} L${sx + 70},${sy + 36} Z`} fill="#3A2A20" opacity={0.9} />
	</g>; };
void W; void H; void beatAt; void T_DRAW0;
