import React from 'react';
import {C, SANS, SERIF} from './kit';

/* labels: 思源黑体 on a feathered scrim (no boxes). Serif only for display words ≥ 72 px. */
export const SL: React.FC<{x: number; y: number; text: React.ReactNode; size?: number; w?: number; col?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; serif?: boolean; scrim?: number}> = ({x, y, text, size = 52, w, col = C.ink, weight = 800, anchor = 'middle', o = 1, serif, scrim = 0.55}) => {
	const len = typeof text === 'string' ? [...text].length : 8;
	const ww = w ?? len * size * 1.02 + size;
	const x0 = anchor === 'middle' ? x - ww / 2 : anchor === 'end' ? x - ww + size / 2 : x - size / 2;
	return (
		<g opacity={o}>
			{scrim > 0 && <rect x={x0} y={y - size * 1.05} width={ww} height={size * 1.55} rx={size * 0.7} fill="#0a0a0b" opacity={scrim} style={{filter: 'blur(17px)'}} />}
			<text x={x} y={y} textAnchor={anchor} style={{fontFamily: serif ? SERIF : SANS, fontSize: size, fontWeight: weight, letterSpacing: '0.03em'}} fill={col}>{text}</text>
		</g>
	);
};
/** html label on a feathered scrim */
export const HL: React.FC<{children: React.ReactNode; size?: number; col?: string; weight?: number; style?: React.CSSProperties; serif?: boolean}> = ({children, size = 52, col = C.ink, weight = 800, style, serif}) => (
	<div style={{display: 'inline-block', padding: '4px 22px', borderRadius: 60, background: 'rgba(10,10,11,0.45)', boxShadow: '0 0 34px 20px rgba(10,10,11,0.45)', fontFamily: serif ? SERIF : SANS, fontSize: size, fontWeight: weight, color: col, letterSpacing: '0.03em', ...style}}>{children}</div>
);
/** a two-line plate: name (52) + sub (40), 黑体 */
export const Plate2: React.FC<{x: number; y: number; name: string; sub?: string; anchor?: 'start' | 'middle' | 'end'; o?: number}> = ({x, y, name, sub, anchor = 'start', o = 1}) => (
	<g opacity={o}>
		<SL x={x} y={y} text={name} size={52} anchor={anchor} />
		{sub && <SL x={x} y={y + 62} text={sub} size={40} weight={600} col={C.mute} anchor={anchor} scrim={0.4} />}
	</g>
);

/* ---------- phone screens, warm dark mode (owner: the cream slabs out-shone the hero) ---------- */
export const DK = {bg: '#1a1714', bar: '#221e1a', boss: '#2b2621', me: '#e2c27f', meInk: '#2a1d08', ink: '#f1ece3', sys: 'rgba(241,236,227,0.72)'};
export const DarkBar: React.FC<{title: string}> = ({title}) => (
	<>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: DK.bar, borderBottom: '1px solid rgba(255,255,255,0.06)'}} />
		<div style={{position: 'absolute', left: 30, right: 30, top: 18, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 20, fontWeight: 700, color: DK.ink}}><span>21:04</span><span>●●● ▮</span></div>
		<div style={{position: 'absolute', top: 66, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 32, fontWeight: 800, color: DK.ink}}>{title}</div>
	</>
);
export const Bubble: React.FC<{who: 'boss' | 'me' | 'sys'; children: React.ReactNode; o?: number; style?: React.CSSProperties}> = ({who, children, o = 1, style}) => (
	<div style={{alignSelf: who === 'me' ? 'flex-end' : who === 'sys' ? 'center' : 'flex-start', maxWidth: '84%', opacity: o, margin: '10px 16px', padding: who === 'sys' ? '2px 10px' : '14px 20px', borderRadius: 22,
		background: who === 'me' ? DK.me : who === 'sys' ? 'transparent' : DK.boss, color: who === 'me' ? DK.meInk : who === 'sys' ? DK.sys : DK.ink, fontFamily: SANS, fontSize: who === 'sys' ? 24 : 32, fontWeight: who === 'sys' ? 600 : 800, ...style}}>
		{children}
	</div>
);
