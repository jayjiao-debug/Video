import React from 'react';
import {PAL, sp, poly, Pt, V} from '../qq60/geo60';
import {rng, flick} from '../qq60/frame60';

/* ep61 · SET-DRESSING library — shared kit.
   Every set piece is a pure SVG component with the props (x, y, s, t):
     x, y = the piece's ORIGIN in px (for anything standing: the centre of its foot on the ground line; strips: the centre of the
            strip's top edge, noted per piece),
     s    = px per GRID UNIT — the same unit as the ep60/ep61 figures (Ani = 20.1 units tall incl. wig), so `s` = the actors' `s`
            puts a column, a jar or a cat at true scale next to the cast,
     t    = time in seconds (everything that naturally moves is driven by t; t = 0 is a valid still).
   Paint: the tomb-painting idiom of ep60 — an ink outline under a flat fill (`Sd`), pigments from PAL (lapis, gold, terracotta,
   turquoise, papyrus cream) plus the stone / sand / water tones in S61 below. Outlines are ~2.6 px at any scale. */

export type SetP = {x: number; y: number; s: number; t?: number};
/** world-space transform of a piece: origin (x, y), s px per unit, flip -1 mirrors it */
export const at = (x: number, y: number, s: number, flip = 1) => `translate(${x},${y}) scale(${s * flip},${s})`;
/** outline widths in units for scale s */
export type Ck = {OW: number; LW: number};
export const ck = (s: number): Ck => ({OW: 2.6 / s, LW: 1.4 / s});

/* extra pigments for architecture, landscape and water (PAL keeps the figure pigments) */
export const S61 = {
	stone: '#E6D3A6', stone2: '#D2BA88', stone3: '#B89C68', stoneHi: '#F3E6C4', granite: '#8E6F66', granite2: '#6F5450', basalt: '#3A3436',
	sand: '#E4C07A', sand2: '#CFA35C', sand3: '#B8874A', mud: '#A87A4E', mud2: '#8A6038',
	water: '#2E58A6', water2: '#244A8E', waterHi: '#BFD8F0', deep: '#14264F', nun: '#0F1F45', nun2: '#1C3266',
	night: '#121B45', night2: '#1D2E6E', dusk: '#E07A3A', dusk2: '#F3B45A', blood: '#8E1A12', blood2: '#C0311C',
	leaf: '#3A9160', leaf2: '#2E7A4E', leaf3: '#5BAE6E', reed: '#7E9A3A', wood: '#B0742E', wood2: '#8A5626', bread: '#D9A050', bread2: '#B97F38',
	faience: '#36A39B', faience2: '#2A7F79', lotus: '#F3F0E4', lotusB: '#6C8FD0', flame: '#E8642A', flame2: '#F8C24A', flame3: '#FFF3C4',
};
const col = (r: string) => (PAL as Record<string, string>)[r] ?? (S61 as Record<string, string>)[r] ?? r;

/** solid shape: ink outline under a flat fill (k scales the outline) */
export const Sd: React.FC<{d: string; f: string; c: Ck; k?: number; o?: number; tf?: string}> = ({d, f, c, k = 1, o, tf}) => <g opacity={o} transform={tf}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={col(f)} /></g>;
/** an ink line (open path) */
export const Ln: React.FC<{d: string; c: Ck; k?: number; color?: string; o?: number; cap?: 'round' | 'butt'}> = ({d, c, k = 1, color = PAL.ink, o, cap = 'round'}) =>
	<path d={d} fill="none" stroke={col(color)} strokeWidth={c.LW * k} strokeLinecap={cap} strokeLinejoin="round" opacity={o} />;
/** a coloured rod with an ink edge (poles, stems, staffs) */
export const Rod: React.FC<{a: V; b: V; w: number; f: string; c: Ck}> = ({a, b, w, f, c}) => <g>
	<path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={PAL.ink} strokeWidth={w + 2 * c.OW} strokeLinecap="round" />
	<path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke={col(f)} strokeWidth={w} strokeLinecap="round" /></g>;
export const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
export const sps = (pts: Pt[], k = 0.18) => sp(pts, true, k);
/** a 5-pointed Egyptian star (sba), r = outer radius */
export const starD = (x: number, y: number, r: number) => Array.from({length: 10}, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.4 : r;
	return `${k ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(3)} ${(y + rr * Math.sin(a)).toFixed(3)}`; }).join('') + 'Z';
/** the cavetto cornice (gorge) with its painted leaves and the torus roll under it: x0..x1 at the torus line y, height h (units) */
export const Cornice: React.FC<{x0: number; x1: number; y: number; h: number; c: Ck; flare?: number}> = ({x0, x1, y, h, c, flare = 0.6}) => {
	const n = Math.max(3, Math.round((x1 - x0) / (h * 0.55))), out: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, a0 = x0 + u0 * (x1 - x0), a1 = x0 + u1 * (x1 - x0), b0 = x0 - flare + u0 * (x1 - x0 + 2 * flare), b1 = x0 - flare + u1 * (x1 - x0 + 2 * flare);
		out.push(<path key={i} d={poly([[a0 + 0.06, y - h * 0.18], [a1 - 0.06, y - h * 0.18], [b1 - 0.08, y - h * 0.92], [b0 + 0.08, y - h * 0.92]])} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} opacity={0.9} />); }
	return <g>
		<Sd d={sps([[x0, y - h * 0.15, 1], [x1, y - h * 0.15, 1], [x1 + flare * 0.25, y - h * 0.55], [x1 + flare, y - h, 1], [x0 - flare, y - h, 1], [x0 - flare * 0.25, y - h * 0.55]], 0.25)} f={S61.stoneHi} c={c} />
		{out}
		<Sd d={rect(x0 - flare - 0.08, y - h - 0.18, x1 + flare + 0.08, y - h)} f={S61.stone2} c={c} k={0.8} />
		{/* torus roll with its binding */}
		<Sd d={rect(x0 - 0.12, y - h * 0.18, x1 + 0.12, y + 0.02)} f={PAL.gold} c={c} k={0.8} />
		{Array.from({length: Math.round((x1 - x0) / 0.5)}, (_, i) => <path key={i} d={`M${x0 + i * 0.5 + 0.1} ${y - h * 0.17}L${x0 + i * 0.5 + 0.35} ${y}`} stroke={PAL.ink} strokeWidth={c.LW * 0.8} opacity={0.6} />)}
	</g>;
};
/** a vertical torus roll (corner moulding) from y0 to y1 at x */
export const TorusV: React.FC<{x: number; y0: number; y1: number; w?: number; c: Ck}> = ({x, y0, y1, w = 0.32, c}) => <g>
	<Sd d={rect(x - w / 2, y0, x + w / 2, y1)} f={PAL.gold} c={c} k={0.8} />
	{Array.from({length: Math.max(1, Math.round(Math.abs(y1 - y0) / 0.6))}, (_, i) => <path key={i} d={`M${x - w / 2} ${y0 + i * 0.6 + 0.1}L${x + w / 2} ${y0 + i * 0.6 + 0.35}`} stroke={PAL.ink} strokeWidth={c.LW * 0.8} opacity={0.6} />)}
</g>;
/** a block of decorative glyph columns (unit space): x, y = top-left, cols × rows cells of size cell */
import {GLYPH_D} from '../qq60/props60';
const GK = Object.keys(GLYPH_D);
export const Glyphs: React.FC<{x: number; y: number; cols: number; rows: number; cell: number; seed?: number; color?: string; o?: number; rule?: boolean}> = ({x, y, cols, rows, cell, seed = 1, color, o = 1, rule = true}) => {
	const R = rng(seed), out: React.ReactNode[] = [];
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) { const g = GLYPH_D[GK[Math.floor(R() * GK.length)]];
			out.push(<path key={`${i}.${j}`} d={g.d} fill={color ?? col(g.r)} transform={`translate(${x + i * cell * 1.25 + cell * 0.12},${y + j * cell * 1.08}) scale(${cell})`} />); }
		if (rule) out.push(<line key={'l' + i} x1={x + i * cell * 1.25} x2={x + i * cell * 1.25} y1={y} y2={y + rows * cell * 1.08} stroke={PAL.ink} strokeWidth={cell * 0.05} opacity={0.6} />);
	}
	return <g opacity={o}>{out}</g>;
};

/* ---------------- shared light defs ----------------
   The ep60 light & particle components (Glow, Flame, Smoke, Embers, Shaft from frame60) paint with url(#g60-*) gradients that only
   Stage60 defines. Pages that do not use Stage60 put <SetDefs61 /> once inside their <svg> (same gradients, same ids). */
const GLOWS: Record<string, string> = {warm: '#FFB45A', gold: '#FFD98A', white: '#FFF6DE', red: '#FF3A1E', blue: '#7FA6FF', green: '#CFF0A0', smoke: '#D9CDB8', ember: '#FF8A2A'};
export const SetDefs61: React.FC = () => <defs>
	{Object.entries(GLOWS).map(([k, c]) => <radialGradient key={k} id={`g60-${k}`}><stop offset="0" stopColor={c} stopOpacity={1} /><stop offset="0.35" stopColor={c} stopOpacity={0.45} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>)}
	<linearGradient id="g60-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0C8" stopOpacity={0.55} /><stop offset="1" stopColor="#FFF0C8" stopOpacity={0} /></linearGradient>
	<linearGradient id="s61-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2C6E" /><stop offset="0.45" stopColor="#B8506A" /><stop offset="0.8" stopColor="#F08A4A" /><stop offset="1" stopColor="#F8C66A" /></linearGradient>
	<linearGradient id="s61-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E58A6" /><stop offset="0.55" stopColor="#8FB0D8" /><stop offset="0.85" stopColor="#F3C98A" /><stop offset="1" stopColor="#F6E0A8" /></linearGradient>
	<linearGradient id="s61-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1233" /><stop offset="0.7" stopColor="#16245A" /><stop offset="1" stopColor="#24357A" /></linearGradient>
	<linearGradient id="s61-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A0806" /><stop offset="0.5" stopColor="#8E1A12" /><stop offset="0.85" stopColor="#D2401E" /><stop offset="1" stopColor="#F07A2A" /></linearGradient>
	<linearGradient id="s61-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FA6D6" /><stop offset="1" stopColor="#F1E2BF" /></linearGradient>
	<linearGradient id="s61-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E58A6" /><stop offset="1" stopColor="#14264F" /></linearGradient>
	<linearGradient id="s61-nun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C3266" /><stop offset="1" stopColor="#070E26" /></linearGradient>
	<linearGradient id="s61-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0C8" stopOpacity={0.6} /><stop offset="1" stopColor="#FFF0C8" stopOpacity={0} /></linearGradient>
</defs>;

/* ---------------- motion helpers ---------------- */
export {rng, flick};
/** a smooth 0..1..0 wave of period p seconds with phase ph */
export const wave = (t: number, p: number, ph = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / p + ph);
/** a per-instance phase from an integer seed, so rows of things never move in unison */
export const phaseOf = (i: number, seed = 1) => { const R = rng(i * 7919 + seed * 104729); R(); return R() * 6.283; };
/** 0..1 that pulses once every `every` s (a flick / blink), width w s */
export const blip = (t: number, every: number, w: number, ph = 0) => { const u = (((t + ph) % every) + every) % every; return u < w ? Math.sin((Math.PI * u) / w) : 0; };
