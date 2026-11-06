/* ep61 · motion test v2 (owner 2026-11-06 22:26: "ask yourself if the viewer will understand", "a more mystical Egyptian theme",
   "the sky-lifting doesn't make sense", "are his sons gay?").
   Lines rewritten so the logic is said out loud: Geb = earth (son), Nut = sky (daughter), twin siblings AND husband and wife, they cling
   together so the sky lies on the earth; Shu = air squeezes between and holds her up; since then air lies between sky and earth.
   Every beat has an on-screen cue (comprehension table in review61.md): plants sprout from Geb (earth), stars flood over Nut (sky),
   they hold hands (couple), a bud is squashed under the flat sky (no room), Shu forms out of a gust (air), visible air currents at the end.
   Nut's sky body follows the Greenfield papyrus (BM): a woman arched over the earth, fingertips and toes on the ground; female face and
   wig (the cast61 Nut head), a star-covered dress. Shu stays human size. Mystical layer: indigo/teal night, nebula haze, gold glyph motes,
   incense smoke, glows, grain. Composition TEST61 (22.6 s). */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, PIC_T, PIC_B, FW, FH, InMaster60, rng} from '../qq60/frame60';
import {PAL} from '../qq60/geo60';
import {POSES, lerpPose, Pose, solve} from '../qq60/rig60';
import {ap} from '../qq60/geo60';
import {God61, P61, bodyOf} from './cast61';
import {GY} from './shots61';
import {SetDefs61} from './sets61_kit';
import {BirdsCrossing, PapyrusThicket} from './sets61_nature';

const FPS = 30, DUR = 22.6;
const cl = (v: number) => Math.max(0, Math.min(1, v)), sm = (v: number) => { const u = cl(v); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const back = (v: number, k = 1.7) => { const u = cl(v) - 1; return 1 + (k + 1) * u * u * u + k * u * u; };
const u_ = (t: number, a: number, d: number) => sm((t - a) / d);
export const LINES61T: [number, number, string][] = [[0, 4.47, '儿子[盖布]是大地，女儿[努特]是天空。'], [4.47, 7.99, '这对兄妹，也是一对夫妻，'], [7.99, 11.99, '整天紧紧抱在一起，天贴着地。'],
	[11.99, 15.75, '空气之神[舒]，挤进他们中间——'], [15.75, 18.33, '把女儿高高托起。'], [18.33, 22.33, '从此，天地之间隔着一层空气。']];
const GODS = ['盖布', '努特', '舒'];
const W = FW, CY = (PIC_T + PIC_B) / 2, BIG: [number, number, number, number] = [-500, -400, W + 1000, FH + 800];

/* ---------------- the mystical layer ---------------- */
const Defs: React.FC = () => <defs>
	<filter id="m61b4"><feGaussianBlur stdDeviation={4} /></filter><filter id="m61b14"><feGaussianBlur stdDeviation={14} /></filter><filter id="m61b50"><feGaussianBlur stdDeviation={50} /></filter>
	<filter id="m61grain"><feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0" /></filter>
	<radialGradient id="m61vig" cx="50%" cy="48%" r="72%"><stop offset="52%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#02030A" stopOpacity={0.8} /></radialGradient>
	<linearGradient id="m61night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04061A" /><stop offset="0.55" stopColor="#141C4E" /><stop offset="1" stopColor="#1E3554" /></linearGradient>
	<linearGradient id="m61dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A1240" /><stop offset="0.6" stopColor="#2C3C78" /><stop offset="1" stopColor="#E8A060" /></linearGradient>
	<linearGradient id="m61dress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A2A6A" /><stop offset="1" stopColor="#0E1844" /></linearGradient>
</defs>;
const Night: React.FC<{T: number; dawn?: number}> = ({T, dawn = 0}) => <g>
	<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="url(#m61night)" />
	{dawn > 0 && <rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="url(#m61dawn)" opacity={dawn} />}
	<ellipse cx={420 + 20 * Math.sin(T * 0.2)} cy={260} rx={480} ry={170} fill="#5B3A9A" opacity={0.22} filter="url(#m61b50)" />
	<ellipse cx={1080} cy={360 + 10 * Math.sin(T * 0.3)} rx={420} ry={150} fill="#1F8A8A" opacity={0.16} filter="url(#m61b50)" />
</g>;
const Stars: React.FC<{seed: number; n: number; T: number; box?: [number, number, number, number]; o?: number}> = ({seed, n, T, box = [-300, -200, W + 300, 720], o = 1}) => {
	const R = rng(seed);
	return <g opacity={o}>{Array.from({length: n}, (_, i) => { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), r = 0.7 + R() * 2, sp = 0.8 + R() * 2.4, ph = R() * 6.3;
		return <circle key={i} cx={x} cy={y} r={r} fill={i % 7 ? '#E6ECFF' : '#FFE6A8'} opacity={0.3 + 0.7 * (0.5 + 0.5 * Math.sin(T * sp + ph))} />; })}</g>;
};
/** small gold hieroglyphs drifting upward (ankh, eye, feather, reed, water, sun) */
const GLYPHS = ['M0 -9a5 6 0 1 0 0.1 0M0 -3V12M-7 1H7', 'M-9 0Q0 -8 9 0Q0 8 -9 0M0 0m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M-2 4l-3 7', 'M0 12V-12Q6 -4 3 6Z', 'M-2 12Q-4 0 2 -12Q4 0 -2 12', 'M-10 0l3 -3l3 3l3 -3l3 3l3 -3l3 3', 'M0 0m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M-2 0h4'];
const GlyphMotes: React.FC<{T: number; n?: number; seed?: number; o?: number}> = ({T, n = 22, seed = 3, o = 0.55}) => {
	const R = rng(seed);
	return <g fill="none" stroke="#F2C649" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{Array.from({length: n}, (_, i) => {
		const x = R() * W, sp = 14 + R() * 22, y = ((R() * 1000 - T * sp) % 1000 + 1000) % 1000 - 40, k = 0.9 + R() * 0.9, g = GLYPHS[i % GLYPHS.length], tw = 0.5 + 0.5 * Math.sin(T * 1.5 + i);
		return <path key={i} d={g} transform={`translate(${x + 10 * Math.sin(T * 0.6 + i)},${y}) scale(${k})`} opacity={o * (0.35 + 0.65 * tw)} />; })}</g>;
};
const Smoke: React.FC<{x: number; y: number; T: number; seed?: number; o?: number}> = ({x, y, T, seed = 1, o = 0.35}) => {
	const R = rng(seed);
	return <g filter="url(#m61b14)" opacity={o}>{Array.from({length: 5}, (_, i) => { const p = ((T * 0.18 + i / 5 + R()) % 1), yy = y - p * 420, xx = x + 60 * Math.sin(p * 6 + i + T * 0.4);
		return <ellipse key={i} cx={xx} cy={yy} rx={40 + 90 * p} ry={22 + 40 * p} fill="#C9D6F2" opacity={(1 - p) * 0.8} />; })}</g>;
};
const Overlay: React.FC<{vig?: number}> = ({vig = 1}) => <g>
	<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="url(#m61vig)" opacity={vig} />
	<rect x={0} y={0} width={W} height={FH} filter="url(#m61grain)" opacity={0.06} /></g>;
/** earth: a soil ridge with a little moss light */
const Earth: React.FC<{y: number}> = ({y}) => <g>
	<path d={`M-500 ${y + 18} C200 ${y - 8} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 12} 1700 ${y + 4} 2000 ${y} V1500 H-500Z`} fill="#16301F" />
	<path d={`M-500 ${y + 18} C200 ${y - 8} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 12} 1700 ${y + 4} 2000 ${y}`} stroke="#4FA06A" strokeWidth={3} fill="none" opacity={0.6} /></g>;

/* ---------------- characters ---------------- */
const gebPose = (reach: number, T: number): Pose => ({...POSES.rest, fs: lerp(-14, 40, reach), fe: lerp(4, 20, reach), bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2, head: -6 + 0.6 * Math.sin(T), neck: -2, lean: 0});
/** Geb lying, head to the left, face up (the earth) */
const GebLying: React.FC<{x: number; y: number; s: number; reach?: number; T: number; id: string}> = ({x, y, s, reach = 0, T, id}) =>
	<g transform={`rotate(-90 ${x} ${y})`}><God61 id={id} who="geb" pose={gebPose(reach, T)} x={x} y={y} s={s} bProp="none" fProp="none" t={T} /></g>;

/** Nut's sky body (Greenfield papyrus): fingertips at (x0, gy), toes at (x1, gy), the back at height `top`; arms, torso, hips, legs
   along one cubic; a star-covered dress, a gold sash; the cast61 Nut head (black wig, female face) hangs under the shoulders facing in. */
const NutSky: React.FC<{x0: number; x1: number; gy: number; top: number; w: number; T: number; id: string; hs: number; glow?: number}> = ({x0, x1, gy, top, w, T, id, hs, glow = 0.5}) => {
	const Y = gy - (gy - top) / 0.75, P = [[x0, gy], [x0, Y], [x1, Y], [x1, gy]];
	const B = (t: number) => { const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; };
	const D = (t: number) => { const a = -3 * (1 - t) ** 2, b = 3 * (1 - t) ** 2 - 6 * (1 - t) * t, c = 6 * (1 - t) * t - 3 * t * t, d = 3 * t * t; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; };
	const wf = (t: number) => t < 0.16 ? lerp(0.3, 0.42, t / 0.16) : t < 0.26 ? lerp(0.42, 0.86, (t - 0.16) / 0.1) : t < 0.5 ? lerp(0.86, 0.72, (t - 0.26) / 0.24) : t < 0.68 ? lerp(0.72, 0.98, (t - 0.5) / 0.18) : t < 0.84 ? lerp(0.98, 0.5, (t - 0.68) / 0.16) : lerp(0.5, 0.3, (t - 0.84) / 0.16);
	const N = 90, outer: string[] = [], inner: string[] = [];
	for (let i = 0; i <= N; i++) { const t = i / N, p = B(t), d = D(t), L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L], h = (w * wf(t)) / 2;
		outer.push(`${p[0] - n[0] * h} ${p[1] - n[1] * h}`); inner.unshift(`${p[0] + n[0] * h} ${p[1] + n[1] * h}`); }
	const body = `M${outer.join('L')}L${inner.join('L')}Z`, R = rng(11);
	const sh = B(0.2), shD = D(0.2), sL = Math.hypot(shD[0], shD[1]), sn = [-shD[1] / sL, shD[0] / sL], hr = hs * 1.35;
	const hc: [number, number] = [sh[0] + sn[0] * (w * 0.3 + hr * 0.9), sh[1] + sn[1] * (w * 0.3 + hr * 0.9)];
	const sash = B(0.6), sashD = D(0.6), sa = (Math.atan2(sashD[1], sashD[0]) * 180) / Math.PI;
	const band = (t: number, k: number) => { const p = B(t), d = D(t), L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L], h = (w * wf(t)) / 2 + 2;
		return <path key={t} d={`M${p[0] - n[0] * h} ${p[1] - n[1] * h}L${p[0] + n[0] * h} ${p[1] + n[1] * h}`} stroke="#D9A441" strokeWidth={k} strokeLinecap="round" />; };
	return <g>
		<path d={body} fill="#9FB8FF" opacity={0.28 * glow} filter="url(#m61b14)" />
		{/* the long black wig falls toward the earth behind the head */}
		<path d={`M${hc[0] - hr * 0.95} ${hc[1] - hr * 0.2} C${hc[0] - hr * 1.2} ${hc[1] + hr * 1.2} ${hc[0] - hr * 0.6} ${hc[1] + hr * 2.4} ${hc[0] - hr * 0.1} ${hc[1] + hr * 2.6} L${hc[0] + hr * 0.7} ${hc[1] + hr * 2.4} C${hc[0] + hr * 0.6} ${hc[1] + hr * 1.4} ${hc[0] + hr * 0.5} ${hc[1] + hr * 0.6} ${hc[0] + hr * 0.2} ${hc[1] + hr * 0.2}Z`} fill="#0B0A12" stroke="#05081A" strokeWidth={3} />
		<path d={body} fill="url(#m61dress)" stroke="#05081A" strokeWidth={5} strokeLinejoin="round" />
		{Array.from({length: 80}, (_, i) => { const t = 0.03 + 0.94 * R(), p = B(t), d = D(t), L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L], o = (R() - 0.5) * w * wf(t) * 0.8, r = 2.5 + R() * 4;
			return <path key={i} d={`M${p[0] + n[0] * o} ${p[1] + n[1] * o - r}l${r * 0.3} ${r * 0.7}l${r * 0.7} ${r * 0.3}l${-r * 0.7} ${r * 0.3}l${-r * 0.3} ${r * 0.7}l${-r * 0.3} ${-r * 0.7}l${-r * 0.7} ${-r * 0.3}l${r * 0.7} ${-r * 0.3}Z`} fill="#FFE6A0" opacity={0.55 + 0.45 * Math.sin(T * (1 + R() * 2) + i)} />; })}
		<g transform={`translate(${sash[0]},${sash[1]}) rotate(${sa})`}><rect x={-10} y={-w * 0.36} width={20} height={w * 0.72} fill="#D9A441" stroke="#05081A" strokeWidth={3} /></g>
		{band(0.06, 7)}{band(0.1, 4)}{band(0.92, 7)}{band(0.88, 4)}
		<ellipse cx={x0 + 4} cy={gy - 5} rx={w * 0.2} ry={w * 0.09} fill="#E3B57A" stroke="#05081A" strokeWidth={3} />
		<ellipse cx={x1 + 6} cy={gy - 5} rx={w * 0.24} ry={w * 0.09} fill="#E3B57A" stroke="#05081A" strokeWidth={3} />
		{/* the head hangs under the shoulders, face turned in toward the earth: ochre skin, kohl eye, gold fillet */}
		<ellipse cx={hc[0]} cy={hc[1]} rx={hr} ry={hr * 1.08} fill="#E3B57A" stroke="#05081A" strokeWidth={4} />
		<path d={`M${hc[0] - hr * 0.98} ${hc[1] + hr * 0.1} C${hc[0] - hr} ${hc[1] - hr * 1.0} ${hc[0] + hr * 0.2} ${hc[1] - hr * 1.25} ${hc[0] + hr * 0.75} ${hc[1] - hr * 0.6} C${hc[0] + hr * 0.2} ${hc[1] - hr * 0.7} ${hc[0] - hr * 0.3} ${hc[1] - hr * 0.3} ${hc[0] - hr * 0.35} ${hc[1] + hr * 0.5}Z`} fill="#0B0A12" />
		<path d={`M${hc[0] - hr * 0.9} ${hc[1] - hr * 0.35} Q${hc[0]} ${hc[1] - hr * 1.0} ${hc[0] + hr * 0.7} ${hc[1] - hr * 0.62}`} stroke="#D9A441" strokeWidth={4} fill="none" />
		<path d={`M${hc[0] + hr * 0.18} ${hc[1] + hr * 0.02} q${hr * 0.22} ${-hr * 0.12} ${hr * 0.44} 0 q${-hr * 0.22} ${hr * 0.12} ${-hr * 0.44} 0Z M${hc[0] + hr * 0.62} ${hc[1] + hr * 0.02} l${hr * 0.28} ${hr * 0.08}`} fill="#0B0A12" stroke="#0B0A12" strokeWidth={2.5} />
		<path d={`M${hc[0] + hr * 0.95} ${hc[1] + hr * 0.25} l${hr * 0.12} ${hr * 0.22} l${-hr * 0.12} ${hr * 0.06}`} stroke="#05081A" strokeWidth={3} fill="none" />
		<path d={`M${hc[0] + hr * 0.62} ${hc[1] + hr * 0.7} q${hr * 0.14} ${hr * 0.06} ${hr * 0.26} 0`} stroke="#B0303A" strokeWidth={4} fill="none" strokeLinecap="round" />
		<circle cx={hc[0] - hr * 0.2} cy={hc[1] + hr * 0.35} r={hr * 0.12} fill="#D9A441" />
	</g>;
};
/** the higher of Shu's two hands (world y) for a pose at (x, GY, s) */
const handY = (pose: Pose, s: number) => { const g = solve(pose, bodyOf('shu')); return GY + Math.min(ap(g.bH, [0, 0])[1], ap(g.fH, [0, 0])[1]) * s; };
/* Shu poses */
const CROUCH: Pose = {lean: 4, neck: -2, head: -8, bs: 168, be: 46, bw: -8, fs: 172, fe: 44, fw: -8, rt: 22, rk: 46, at: 34, ak: 52};
const DIP: Pose = {lean: 7, neck: -2, head: -4, bs: 166, be: 74, bw: -8, fs: 170, fe: 72, fw: -8, rt: 30, rk: 66, at: 44, ak: 72};
/** wind ribbons (air) */
const Air: React.FC<{T: number; y0: number; y1: number; o: number; n?: number}> = ({T, y0, y1, o, n = 9}) => {
	const R = rng(5);
	return <g fill="none" strokeLinecap="round" opacity={o}>{Array.from({length: n}, (_, i) => { const y = lerp(y0, y1, (i + 0.5) / n) + (R() - 0.5) * 20, ph = R() * 400, L = 180 + R() * 220;
		return <path key={i} d={`M-100 ${y} C300 ${y - 26} 600 ${y + 26} 900 ${y} S1400 ${y - 20} 1600 ${y}`} stroke={i % 2 ? '#BFE6FF' : '#FFFFFF'} strokeWidth={2 + R() * 3}
			strokeDasharray={`${L} ${300 + R() * 300}`} strokeDashoffset={-(T * (220 + R() * 140) + ph)} opacity={0.35 + R() * 0.4} />; })}</g>;
};

/* ---------------- the seven set-ups ---------------- */
/** A · Geb = earth: he stretches, the ground lights green, papyrus sprouts along his body */
const ShotA: React.FC<{t: number}> = ({t}) => { const T = t, z = 1.08 - 0.04 * sm(t / 2.2), pan = 30 * sm(t / 2.2);
	return <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-W / 2 + pan},${-CY})`}>
		<Night T={T} /><Stars seed={3} n={90} T={T} /><GlyphMotes T={T} n={12} o={0.35} />
		<Earth y={810} />
		<ellipse cx={980} cy={800} rx={520} ry={70} fill="#4FE08A" opacity={0.22 * u_(t, 0.3, 1)} filter="url(#m61b50)" />
		<GebLying id="ta" x={1540} y={812} s={40} reach={u_(t, 0.4, 0.9) * 0.25} T={T} />
		{[0, 1, 2, 3, 4].map((i) => { const g = back(cl((t - 0.7 - i * 0.18) / 0.6), 1.5), x = [880, 1000, 1130, 1260, 1380][i]; return <g key={i} transform={`translate(${x},806) scale(1,${Math.max(0.01, g)}) translate(${-x},-806)`}>
			<PapyrusThicket x={x} y={806} s={7} t={T} w={6} h={10} n={5} seed={i + 4} /></g>; })}
		<Smoke x={120} y={980} T={T} />
		<Overlay />
	</g>; };
/** B · Nut = sky: a woman under the night; stars flow over her dress and up into the sky as she lifts her arms */
const ShotB: React.FC<{t: number}> = ({t}) => { const T = t + 2.2, k = u_(t, 0.2, 1.4), z = 1.0 + 0.05 * sm(t / 2.3), R = rng(19);
	return <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-W / 2},${-CY - 20 * sm(t / 2.3)})`}>
		<Night T={T} /><Stars seed={5} n={60 + Math.round(80 * k)} T={T} />
		<circle cx={720} cy={430} r={300} fill="#6A7CFF" opacity={0.18 * k} filter="url(#m61b50)" />
		<Earth y={870} />
		<God61 id="tb" who="nut" pose={lerpPose(P61.rest(T), P61.wide(), u_(t, 0.3, 1.0))} x={720} y={GY} s={30} t={T} />
		{Array.from({length: 40}, (_, i) => { const sx = 700 + (R() - 0.5) * 60, sy = 640 - R() * 160, ex = R() * W, ey = R() * 520 + 40, e = sm(k * 1.3 - R() * 0.3);
			return <circle key={i} cx={lerp(sx, ex, e)} cy={lerp(sy, ey, e)} r={2 + R() * 2.5} fill="#FFE6A8" opacity={0.9 * (e > 0 && e < 1 ? 1 : e >= 1 ? 0.6 : 0)} />; })}
		<GlyphMotes T={T} n={14} o={0.4} /><Smoke x={1300} y={990} T={T} seed={3} />
		<Overlay />
	</g>; };
/** C · siblings and spouses: they walk to each other, take hands, lean in; a gold glow between them */
const ShotC: React.FC<{t: number}> = ({t}) => { const T = t + 4.47, m = u_(t, 0, 1.6), hold = u_(t, 1.5, 0.5), lean = u_(t, 2.0, 1.0);
	const xn = lerp(470, 600, m), xg = lerp(970, 840, m);
	return <g transform={`translate(${W / 2},${CY}) scale(${1.04 + 0.04 * sm(t / 3.5)}) translate(${-W / 2},${-CY})`}>
		<Night T={T} /><Stars seed={7} n={110} T={T} /><GlyphMotes T={T} n={16} o={0.45} />
		<Earth y={870} />
		<circle cx={720} cy={560} r={260} fill="#FFC870" opacity={0.25 * hold + 0.05 * Math.sin(T * 2) * hold} filter="url(#m61b50)" />
		<God61 id="tcn" who="nut" pose={{...P61.rest(T), fs: lerp(14, 52, hold), fe: lerp(34, 10, hold), lean: 3 * lean, head: -4 * lean}} x={xn} y={GY} s={28} t={T} />
		<God61 id="tcg" who="geb" pose={{...P61.rest(T), fs: lerp(14, 52, hold), fe: lerp(34, 10, hold), lean: 3 * lean, head: -4 * lean}} x={xg} y={GY} s={30} face={-1} bProp="none" fProp="none" t={T} />
		{hold > 0.6 && <circle cx={720} cy={GY - 9.2 * 29} r={14} fill="#FFE6A8" opacity={hold * (0.6 + 0.4 * Math.sin(T * 4))} filter="url(#m61b4)" />}
		<Smoke x={140} y={990} T={T} seed={5} /><Smoke x={1300} y={990} T={T} seed={6} />
		<Overlay />
	</g>; };
/** D · the sky lies on the earth: Nut's starry body pressed flat over Geb; it is dark and there is no room: a bud pops up and is squashed */
const ShotD: React.FC<{t: number}> = ({t}) => { const T = t + 7.99, sink = u_(t, 0, 1.2), top = lerp(560, 726, sink), bud = cl((t - 1.5) / 0.5), sq = u_(t, 2.15, 0.18), wob = sq > 0 ? Math.sin((t - 2.15) * 30) * Math.exp(-(t - 2.15) * 5) : 0;
	const by = 850, bh = lerp(0, 120, back(bud, 1.2)) * lerp(1, 0.3, sq) * (1 + 0.15 * wob);
	return <g transform={`translate(${W / 2},${CY}) scale(1.06) translate(${-W / 2},${-CY})`}>
		<Night T={T} /><Stars seed={9} n={80} T={T} o={1 - 0.6 * sink} />
		<Earth y={850} />
		<GebLying id="td" x={1220} y={846} s={22} reach={0.1} T={T} />
		<g transform="translate(720 850) scale(1.5) translate(-560 -850)"><path d={`M560 ${by}Q554 ${by - bh * 0.6} 562 ${by - bh}`} stroke="#4FA06A" strokeWidth={9} fill="none" /><path d={`M548 ${by - 10}q-26 -10 -30 -26q22 2 32 18Z`} fill="#4FA06A" />
			<ellipse cx={562} cy={by - bh} rx={20 + 14 * sq} ry={26 * lerp(1, 0.4, sq)} fill="#F4B6C8" stroke="#05081A" strokeWidth={4} /><path d={`M562 ${by - bh - 20 * lerp(1, 0.4, sq)}v${30 * lerp(1, 0.4, sq)}`} stroke="#D07890" strokeWidth={3} /></g>
		<NutSky x0={300} x1={1240} gy={850} top={top} w={108} T={T} id="tdn" hs={22} glow={0.3} />
		<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="#02030C" opacity={0.42 * sink} />
		<Overlay vig={0.8 + 0.2 * sink} />
	</g>; };
/** E · Shu = air: a gust swirls in under the sky and condenses into Shu, crouched, palms under Nut */
const ShotE: React.FC<{t: number}> = ({t}) => { const T = t + 11.99, swirl = u_(t, 0, 1.2), form = u_(t, 0.9, 0.9), s = 24, top = lerp(726, handY(CROUCH, s) - 54, u_(t, 0.6, 1.0));
	const R = rng(23);
	return <g transform={`translate(${W / 2},${CY}) scale(1.06) translate(${-W / 2},${-CY})`}>
		<Night T={T} /><Stars seed={11} n={60} T={T} o={0.5} />
		<Earth y={850} />
		<GebLying id="te" x={1220} y={846} s={22} reach={0.1} T={T} />
		<g opacity={1 - 0.6 * form}>{Array.from({length: 26}, (_, i) => { const a = T * 5 + i * 0.7, r = lerp(260, 40, swirl) * (0.4 + (i % 5) * 0.15), cx = lerp(200, 720, swirl), cy = 760;
			return <path key={i} d={`M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r * 0.45}A${r} ${r * 0.45} 0 0 1 ${cx + Math.cos(a + 0.9) * r} ${cy + Math.sin(a + 0.9) * r * 0.45}`} stroke="#DDF2FF" strokeWidth={2 + R() * 3} fill="none" opacity={0.75} />; })}</g>
		<g opacity={form}><God61 id="tes" who="shu" pose={CROUCH} x={720} y={GY} s={s} bProp="none" fProp="none" t={T} /></g>
		<circle cx={720} cy={720} r={160} fill="#DDF2FF" opacity={0.5 * form * (1 - form)} filter="url(#m61b14)" />
		<NutSky x0={300} x1={1240} gy={850} top={top} w={108} T={T} id="ten" hs={22} glow={0.35} />
		<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="#02030C" opacity={0.42 * (1 - 0.5 * form)} />
		<Overlay />
	</g>; };
/** F · he holds her up: wind-up dip, then the push; her back rises into the arch while fingertips and toes stay on the earth; a wind ring */
const ShotF: React.FC<{t: number}> = ({t}) => { const T = t + 15.75, s = 24, dip = u_(t, 0, 0.25), go = cl((t - 0.3) / 0.7), k = back(go, 1.4);
	const pose = go > 0 ? lerpPose(DIP, P61.lift(T), Math.min(1.06, k)) : lerpPose(CROUCH, DIP, dip);
	const hy = handY(pose, s), top = hy - 54, boom = cl((t - 0.35) / 1.0), z = lerp(1.2, 1.0, sm((t - 0.3) / 1.6));
	return <g transform={`translate(${W / 2},${CY + 60}) scale(${z}) translate(${-W / 2},${-CY - 60})`}>
		<Night T={T} /><Stars seed={13} n={90} T={T} />
		<Earth y={850} />
		<GebLying id="tf" x={1250} y={846} s={22} reach={0.1} T={T} />
		{go > 0 && <g fill="none">
			<ellipse cx={720} cy={GY + 2} rx={50 + 760 * boom} ry={12 + 60 * boom} stroke="#FFFFFF" strokeWidth={9 * (1 - boom)} opacity={1 - boom} />
			<ellipse cx={720} cy={hy} rx={40 + 500 * boom} ry={18 + 120 * boom} stroke="#BFE6FF" strokeWidth={6 * (1 - boom)} opacity={0.9 * (1 - boom)} />
			<Air T={T} y0={hy + 60} y1={GY - 30} o={0.8 * boom} n={7} /></g>}
		<God61 id="tfs" who="shu" pose={pose} x={720} y={GY} s={s} bProp="none" fProp="none" t={T} />
		<NutSky x0={230} x1={1270} gy={850} top={top} w={108} T={T} id="tfn" hs={22} glow={0.5 + 0.4 * (go > 0 ? 1 - boom : 0)} />
		<GlyphMotes T={T} n={18} o={0.5} />
		<Overlay />
	</g>; };
/** G · since then: air flows between sky and earth (visible currents), plants grow, birds cross, dawn glows; pull back */
const ShotG: React.FC<{t: number}> = ({t}) => { const T = t + 18.33, s = 24, top = handY(P61.lift(T), s) - 54, dawn = u_(t, 0.2, 2.0), z = lerp(1.06, 0.94, sm(t / 4.2));
	return <g transform={`translate(${W / 2},${CY + 40}) scale(${z}) translate(${-W / 2},${-CY - 40})`}>
		<SetDefs61 />
		<Night T={T} dawn={dawn} /><Stars seed={15} n={70} T={T} box={[-300, -200, W + 300, 300]} />
		<ellipse cx={720} cy={860} rx={300 + 160 * dawn} ry={70 + 30 * dawn} fill="#FFD890" opacity={0.6 * dawn} filter="url(#m61b14)" />
		<Air T={T} y0={top + 140} y1={GY - 40} o={0.85} n={10} />
		<g opacity={0.9}><BirdsCrossing x={0} y={420} s={13} t={T + 4} n={6} w={1440} period={8} color="#1A1430" /></g>
		<Earth y={850} />
		{[0, 1, 2, 3, 4, 5].map((i) => { const g = back(cl((t - 0.2 - i * 0.16) / 0.7), 1.4), x = [260, 420, 560, 900, 1060, 1210][i]; return <g key={i} transform={`translate(${x},852) scale(1,${Math.max(0.01, g)}) translate(${-x},-852)`}>
			<PapyrusThicket x={x} y={852} s={8} t={T} w={8} h={12} n={6} seed={i + 2} /></g>; })}
		<GebLying id="tg" x={1250} y={846} s={22} reach={0.1} T={T} />
		<God61 id="tgs" who="shu" pose={P61.lift(T)} x={720} y={GY} s={s} bProp="none" fProp="none" t={T} />
		<NutSky x0={230} x1={1270} gy={850} top={top} w={108} T={T} id="tgn" hs={22} glow={0.55} />
		<GlyphMotes T={T} n={20} o={0.5} /><Smoke x={100} y={1000} T={T} seed={8} /><Smoke x={1340} y={1000} T={T} seed={9} />
		<Overlay vig={0.7} />
	</g>; };

const SHOTS_T: [number, number, React.FC<{t: number}>][] = [[0, 2.2, ShotA], [2.2, 4.47, ShotB], [4.47, 7.99, ShotC], [7.99, 11.99, ShotD], [11.99, 15.75, ShotE], [15.75, 18.33, ShotF], [18.33, DUR, ShotG]];
const XF = 0.25;   // a short glow dissolve between set-ups
const Test61: React.FC = () => {
	const t = useCurrentFrame() / FPS, i0 = SHOTS_T.findIndex(([a, b]) => t >= a && t < b), i = i0 < 0 ? SHOTS_T.length - 1 : i0, [a, b, Shot] = SHOTS_T[i], nx = SHOTS_T[i + 1];
	const inc = nx && t > b - XF ? sm((t - (b - XF)) / XF) : 0;
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy}}>
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
			<Defs /><SetDefs61 />
			<defs><clipPath id="m61pic"><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
			<g clipPath="url(#m61pic)"><Shot t={t - a} />{inc > 0 && <g opacity={inc}>{React.createElement(nx[2], {t: t - nx[0]})}</g>}
				{inc > 0 && <rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} fill="#FFE6B0" opacity={0.18 * Math.sin(inc * Math.PI)} />}</g>
		</svg>
		<AbsoluteFill><Bands t={t} />
			{LINES61T.filter(([a0, b0]) => t >= a0 - 0.2 && t < b0 + 0.2).map(([a0, b0, text]) => <Subtitle key={a0} t={t} sub={{text, t0: a0, t1: b0}} gods={GODS} />)}</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};
void PAL;
registerRoot(() => <Composition id="TEST61" component={Test61} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={FW} height={FH} />);
