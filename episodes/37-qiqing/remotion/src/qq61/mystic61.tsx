/* ep61 v2 · the shared "mystical Egyptian" layer (owner 22:26): indigo/teal night, nebula haze, gold hieroglyph motes, incense smoke,
   light pools, vignette, grain; plus the helpers of the new Geb/Nut/Shu block (earth band, air currents). Screen-space pieces take T. */
import React from 'react';
import {FW, FH, rng} from '../qq60/frame60';
import {Pose, solve} from '../qq60/rig60';
import {ap} from '../qq60/geo60';
import {bodyOf} from './cast61';
import {GY} from './shots61';

const W = FW;
export const BIG: [number, number, number, number] = [-600, -500, W + 1200, FH + 1000];
export const cl = (v: number) => Math.max(0, Math.min(1, v));
export const sm = (v: number) => { const u = cl(v); return u * u * (3 - 2 * u); };
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** ease-out with overshoot */
export const back = (v: number, k = 1.7) => { const u = cl(v) - 1; return 1 + (k + 1) * u * u * u + k * u * u; };
export const u_ = (t: number, a: number, d: number) => sm((t - a) / d);

export const MysticDefs: React.FC = () => <defs>
	<filter id="my4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={4} /></filter><filter id="my14" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={14} /></filter><filter id="my50" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={50} /></filter>
	<filter id="mygrain"><feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0" /></filter>
	<radialGradient id="myvig" cx="50%" cy="48%" r="72%"><stop offset="52%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#02030A" stopOpacity={0.82} /></radialGradient>
	<linearGradient id="mynight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04061A" /><stop offset="0.55" stopColor="#141C4E" /><stop offset="1" stopColor="#1E3554" /></linearGradient>
	<linearGradient id="mydawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A1240" /><stop offset="0.6" stopColor="#2C3C78" /><stop offset="1" stopColor="#E8A060" /></linearGradient>
</defs>;
export const Night: React.FC<{T: number; dawn?: number}> = ({T, dawn = 0}) => <g>
	<rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="url(#mynight)" />
	{dawn > 0 && <rect x={BIG[0]} y={BIG[1]} width={BIG[2]} height={BIG[3]} fill="url(#mydawn)" opacity={dawn} />}
	<ellipse cx={420 + 20 * Math.sin(T * 0.2)} cy={260} rx={480} ry={170} fill="#5B3A9A" opacity={0.22} filter="url(#my50)" />
	<ellipse cx={1080} cy={360 + 10 * Math.sin(T * 0.3)} rx={420} ry={150} fill="#1F8A8A" opacity={0.16} filter="url(#my50)" /></g>;
export const Stars: React.FC<{seed: number; n: number; T: number; box?: [number, number, number, number]; o?: number}> = ({seed, n, T, box = [-300, -200, W + 300, 720], o = 1}) => {
	const R = rng(seed);
	return <g opacity={o}>{Array.from({length: n}, (_, i) => { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), r = 0.7 + R() * 2, sp = 0.8 + R() * 2.4, ph = R() * 6.3;
		return <circle key={i} cx={x} cy={y} r={r} fill={i % 7 ? '#E6ECFF' : '#FFE6A8'} opacity={0.3 + 0.7 * (0.5 + 0.5 * Math.sin(T * sp + ph))} />; })}</g>;
};
const GLYPHS = ['M0 -9a5 6 0 1 0 0.1 0M0 -3V12M-7 1H7', 'M-9 0Q0 -8 9 0Q0 8 -9 0M0 0m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M-2 4l-3 7', 'M0 12V-12Q6 -4 3 6Z', 'M-2 12Q-4 0 2 -12Q4 0 -2 12', 'M-10 0l3 -3l3 3l3 -3l3 3l3 -3l3 3', 'M0 0m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M-2 0h4'];
export const GlyphMotes: React.FC<{T: number; n?: number; seed?: number; o?: number}> = ({T, n = 18, seed = 3, o = 0.5}) => {
	const R = rng(seed);
	return <g fill="none" stroke="#F2C649" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{Array.from({length: n}, (_, i) => {
		const x = R() * W, sp = 14 + R() * 22, y = ((R() * 1000 - T * sp) % 1000 + 1000) % 1000 - 40, k = 0.9 + R() * 0.9, g = GLYPHS[i % GLYPHS.length], tw = 0.5 + 0.5 * Math.sin(T * 1.5 + i);
		return <path key={i} d={g} transform={`translate(${x + 10 * Math.sin(T * 0.6 + i)},${y}) scale(${k})`} opacity={o * (0.35 + 0.65 * tw)} />; })}</g>;
};
export const Smoke: React.FC<{x: number; y: number; T: number; seed?: number; o?: number}> = ({x, y, T, seed = 1, o = 0.32}) => {
	const R = rng(seed);
	return <g filter="url(#my14)" opacity={o}>{Array.from({length: 5}, (_, i) => { const p = ((T * 0.18 + i / 5 + R()) % 1), yy = y - p * 420, xx = x + 60 * Math.sin(p * 6 + i + T * 0.4);
		return <ellipse key={i} cx={xx} cy={yy} rx={40 + 90 * p} ry={22 + 40 * p} fill="#C9D6F2" opacity={(1 - p) * 0.8} />; })}</g>;
};
/** the screen-space grade over every shot: an indigo multiply (k = strength), a warm light pool, gold glyph motes, incense, vignette, grain */
export const Grade: React.FC<{T: number; k: number; pool?: [number, number]; motes?: number}> = ({T, k, pool = [720, 520], motes = 0.4}) => <g>
	<rect x={0} y={0} width={W} height={FH} fill="#1B2160" opacity={k} style={{mixBlendMode: 'multiply'}} />
	<ellipse cx={pool[0]} cy={pool[1]} rx={560} ry={400} fill="#FFB45A" opacity={0.16 * Math.min(1, k * 2.4)} filter="url(#my50)" style={{mixBlendMode: 'screen'}} />
	<GlyphMotes T={T} n={14} o={motes} />
	<Smoke x={90} y={1000} T={T} seed={5} o={0.22} /><Smoke x={1350} y={1000} T={T} seed={6} o={0.22} />
	<rect x={0} y={0} width={W} height={FH} fill="url(#myvig)" />
	<rect x={0} y={0} width={W} height={FH} filter="url(#mygrain)" opacity={0.05} /></g>;
export const Earth: React.FC<{y: number}> = ({y}) => <g>
	<path d={`M-600 ${y + 18} C200 ${y - 8} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 12} 1700 ${y + 4} 2100 ${y} V1600 H-600Z`} fill="#16301F" />
	<path d={`M-600 ${y + 18} C200 ${y - 8} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 12} 1700 ${y + 4} 2100 ${y}`} stroke="#4FA06A" strokeWidth={3} fill="none" opacity={0.6} /></g>;
/** visible air: dashed ribbons streaming sideways between y0 and y1 */
export const Air: React.FC<{T: number; y0: number; y1: number; o: number; n?: number}> = ({T, y0, y1, o, n = 9}) => {
	const R = rng(5);
	return <g fill="none" strokeLinecap="round" opacity={o}>{Array.from({length: n}, (_, i) => { const y = lerp(y0, y1, (i + 0.5) / n) + (R() - 0.5) * 20, ph = R() * 400, L = 180 + R() * 220;
		return <path key={i} d={`M-200 ${y} C300 ${y - 26} 600 ${y + 26} 900 ${y} S1400 ${y - 20} 1700 ${y}`} stroke={i % 2 ? '#BFE6FF' : '#FFFFFF'} strokeWidth={2 + R() * 3}
			strokeDasharray={`${L} ${300 + R() * 300}`} strokeDashoffset={-(T * (220 + R() * 140) + ph)} opacity={0.35 + R() * 0.4} />; })}</g>;
};
/** the higher of a figure's two hands (world y) for a pose standing at (·, GY) with scale s */
export const handY = (who: string, pose: Pose, s: number) => { const g = solve(pose, bodyOf(who)); return GY + Math.min(ap(g.bH, [0, 0])[1], ap(g.fH, [0, 0])[1]) * s; };
/** Nut as the sky (Greenfield papyrus pose): crouched over Geb / bent over the earth with hands and feet on the ground */
export const NUT_LOW: Pose = {lean: 85, neck: -6, head: -16, bs: 88, be: 72, bw: 0, fs: 88, fe: 72, fw: 0, rt: 0, rk: 90, at: 0, ak: 90};
export const NUT_ARCH: Pose = {lean: 86, neck: -8, head: -18, bs: 56, be: 0, bw: 0, fs: 56, fe: 0, fw: 0, rt: -36, rk: 0, at: -26, ak: 0};
