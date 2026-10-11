import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Look} from '../art/Figure';
import {Materials} from '../art/materials';
import {P} from '../art/palette';

/* Storyboard key frames for the overnight episodes (ep22–25): flat 2D, the Tank/pond look.
   Each frame = one moment of the script: picture + the subtitle on screen at that time + a small note tag. */

export const W = 1920, H = 1080;
export const SERIF = '"Noto Serif CJK SC", serif';
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const GOLD = '#f1c56d';
export const INK = '#f3ede2';
export const ORANGE = '#ff8a3d';
export const hash = (i: number, k = 1) => {
	const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
	return x - Math.floor(x);
};
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** the viewer: a young person today */
export const YOU: Look = {skin: P.skin1, hair: 'short', hairColor: P.hairBlack, outfit: 'casual', top: '#3d4a63', bottom: '#2a2c33', accent: '#d9d4c8'};
export const YOU2: Look = {skin: P.skin2, hair: 'pony', hairColor: P.hairBlack, outfit: 'casual', top: '#7a4a3a', bottom: '#2f3442', accent: '#efe6d6'};

export type Line = {start: number; end: number; text: string};
export const lineAt = (lines: Line[], t: number) => lines.find((l) => t >= l.start && t < l.end + 0.2)?.text ?? '';

/** subtitle per juno-brand §4a: 思源黑体 700, 68 px, one line in the bottom band; [gold] keywords */
export const Sub: React.FC<{t: string}> = ({t}) => {
	if (!t) return null;
	const parts = t.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<g>
			<defs>
				<linearGradient id="kf-subbar" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="0.35" stopColor="#000" stopOpacity="0.55" />
					<stop offset="1" stopColor="#000" stopOpacity="0.7" />
				</linearGradient>
			</defs>
			<rect y={912} width={W} height={168} fill="url(#kf-subbar)" />
			<text x={W / 2} y={1036} textAnchor="middle" style={{fontFamily: SANS, fontSize: 68, fontWeight: 700, fontVariantNumeric: 'lining-nums'}} fill={INK} stroke="#000" strokeWidth={6} strokeOpacity={0.55} paintOrder="stroke">
				{parts.map((p, i) => (p.startsWith('[') ? <tspan key={i} fill={GOLD} fontWeight={900}>{p.slice(1, -1)}</tspan> : <tspan key={i}>{p}</tspan>))}
			</text>
		</g>
	);
};

/** storyboard note (top-left): scene · time · what happens */
export const Note: React.FC<{sc: string; t: string; note: string}> = ({sc, t, note}) => (
	<g>
		<rect x={30} y={26} width={Math.min(1100, 70 + [...note].length * 23)} height={84} rx={10} fill="#000" opacity={0.5} />
		<text x={52} y={62} style={{fontFamily: SANS, fontSize: 27, fontWeight: 700}} fill="#ffd36e">
			{sc} · {t}
		</text>
		<text x={52} y={96} style={{fontFamily: SANS, fontSize: 22}} fill="#e8e4da">
			{note}
		</text>
	</g>
);

/** labels hold still, sit in clear space, with a dark halo */
export const Label: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; font?: string; o?: number}> = ({x, y, children, size = 44, col = '#fff', anchor = 'middle', weight = 700, font = SERIF, o = 1}) => (
	<text x={x} y={y} opacity={o} textAnchor={anchor} style={{fontFamily: font, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums'}} fill={col} stroke="#0b0d12" strokeOpacity={0.45} strokeWidth={size / 9} paintOrder="stroke" strokeLinejoin="round">
		{children}
	</text>
);

export const Pill: React.FC<{x: number; y: number; text: string; dark?: boolean; anchor?: 'start' | 'middle'; size?: number}> = ({x, y, text, dark = true, anchor = 'middle', size = 28}) => {
	const w = [...text].reduce((n, c) => n + (c.charCodeAt(0) > 255 ? size * 1.05 : size * 0.58), 0) + 48;
	const x0 = anchor === 'middle' ? x - w / 2 : x;
	return (
		<g>
			<rect x={x0} y={y - size * 1.2} width={w} height={size * 1.75} rx={size * 0.87} fill={dark ? '#0d1016' : '#f4efe2'} opacity={dark ? 0.62 : 0.88} />
			<text x={x0 + w / 2} y={y} textAnchor="middle" style={{fontFamily: SANS, fontSize: size, fontWeight: 500, letterSpacing: '0.04em', fontVariantNumeric: 'lining-nums'}} fill={dark ? '#efe6d2' : '#2a2620'}>
				{text}
			</text>
		</g>
	);
};

/** gold metallic title used on themed title cards */
export const GoldTitle: React.FC<{text: string; y: number; size: number; id: string}> = ({text, y, size, id}) => (
	<g>
		<defs>
			<linearGradient id={id} x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor="#fff3cf" />
				<stop offset="0.45" stopColor="#f3cd7a" />
				<stop offset="0.7" stopColor="#c99140" />
				<stop offset="1" stopColor="#8a5a22" />
			</linearGradient>
		</defs>
		<text x={W / 2} y={y} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: size}} fill={`url(#${id})`} stroke="#120c04" strokeOpacity={0.35} strokeWidth={size / 30} paintOrder="stroke">
			《{text}》
		</text>
	</g>
);
export const CardText: React.FC<{kicker: string; tagline: string; en: string; y0?: number}> = ({kicker, tagline, en, y0 = 300}) => (
	<g>
		<text x={W / 2} y={y0} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28, letterSpacing: '0.4em', fontVariantNumeric: 'lining-nums'}} fill={GOLD} opacity={0.9}>
			{kicker}
		</text>
		<text x={W / 2} y={y0 + 350} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 46, letterSpacing: '0.1em'}} fill={INK} stroke="#000" strokeOpacity={0.35} strokeWidth={4} paintOrder="stroke">
			{tagline}
		</text>
		<text x={W / 2} y={y0 + 404} textAnchor="middle" style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 30}} fill="rgba(243,237,226,0.8)">
			{en}
		</text>
		<text x={W / 2} y={y0 + 490} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: '0.4em'}} fill="rgba(243,237,226,0.65)">
			— VIBE知识大赏 —
		</text>
	</g>
);

export type KF = {sc: string; t: number; note: string; draw: () => React.ReactNode; sub?: string | null};

export const KeyFrame: React.FC<{frames: KF[]; lines: Line[]; i: number}> = ({frames, lines, i}) => {
	const fr = frames[i];
	const sub = fr.sub === null ? '' : fr.sub ?? lineAt(lines, fr.t);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Materials />
				{fr.draw()}
				<Sub t={sub} />
				<Note sc={fr.sc} t={`${fr.t.toFixed(1)}s`} note={fr.note} />
			</svg>
		</AbsoluteFill>
	);
};
