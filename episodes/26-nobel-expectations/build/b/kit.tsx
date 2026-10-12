import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

/* ep26 · look B "暗场电影", readability pass:
   near-black + one warm key light; big serif numerals; champagne gold for ideas, muted crimson for fear;
   every on-screen word ≥ 34 px, secondary text at 75 % white, no tiny English micro-labels. */
export const W = 1920, H = 1080, FPS = 30;
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const SERIF = '"Noto Serif CJK SC", serif';
export const NUM = '"Cormorant", "Noto Serif CJK SC", serif';
export const LAT = '"InterX", "Noto Sans CJK SC", sans-serif';
export const C = {bg: '#0a0a0b', ink: '#f4f0e8', mute: 'rgba(244,240,232,0.74)', faint: 'rgba(244,240,232,0.38)', gold: '#e2c27f', goldDeep: '#b8924a', red: '#e0705a', redDeep: '#a8402f', line: 'rgba(226,194,127,0.55)'};

export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const lerp = (t: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const on = (t: number, a: number, d = 0.45) => lerp(t, a, a + d, 0, 1);
export const off = (t: number, a: number, d = 0.45) => lerp(t, a, a + d, 1, 0);
/** text rise-in: opacity + small lift + unblur */
export const rise = (p: number): React.CSSProperties => ({opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined});

let fontsLoaded = false;
export const useFonts = () => {
	if (fontsLoaded || typeof document === 'undefined') return;
	fontsLoaded = true;
	const h = delayRender('fonts');
	const faces: [string, string, string, string][] = [
		['Cormorant', 'cormorant-garamond-latin-500-normal', '500', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-600-normal', '600', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-700-normal', '700', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-500-italic', '500', 'italic'],
		['InterX', 'inter-latin-400-normal', '400', 'normal'],
		['InterX', 'inter-latin-500-normal', '500', 'normal'],
		['InterX', 'inter-latin-600-normal', '600', 'normal'],
	];
	Promise.all(faces.map(([fam, file, weight, style]) => new FontFace(fam, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight, style}).load().then((f) => document.fonts.add(f))))
		.then(() => continueRender(h))
		.catch(() => continueRender(h));
};

/** the stage: black, one warm key light at (kx, ky), vignette, fine grain */
export const Stage: React.FC<{kx?: number; ky?: number; k?: number; tint?: string; children?: React.ReactNode}> = ({kx = 960, ky = 520, k = 1, tint = '120,92,58', children}) => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill style={{background: `radial-gradient(1000px 760px at ${kx}px ${ky}px, rgba(${tint},${0.42 * k}), rgba(10,10,11,0) 70%)`}} />
		{children}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.72) 100%)'}} />
		<Grain />
	</AbsoluteFill>
);
export const Grain: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.3}}>
			<filter id="bgrain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={f % 10} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.3 0" /></filter>
			<rect width={W} height={H} filter="url(#bgrain)" />
		</svg>
	);
};

/** subtitle: large, high-contrast, soft shadow band; [x] = gold highlight */
export const Sub: React.FC<{t: string}> = ({t}) => {
	if (!t) return null;
	const parts = t.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 76%, rgba(0,0,0,0.55) 92%, rgba(0,0,0,0.7) 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 62, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: '0.04em', textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)'}}>
				{parts.map((p, i) => (p.startsWith('[') ? <span key={i} style={{color: C.gold, fontWeight: 900}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>))}
			</div>
		</>
	);
};
/** a label pair: small caption above a big value (serif numerals) */
export const Figure: React.FC<{label: string; value: string; note?: string; col?: string; size?: number; style?: React.CSSProperties}> = ({label, value, note, col = C.ink, size = 190, style}) => (
	<div style={style}>
		<div style={{fontFamily: SANS, fontSize: 38, fontWeight: 600, color: C.mute, letterSpacing: '0.06em'}}>{label}</div>
		<div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
			<div style={{fontFamily: NUM, fontWeight: 600, fontSize: size, lineHeight: 1.02, color: col}}>{value}</div>
			{note && <div style={{fontFamily: SERIF, fontSize: 44, fontWeight: 600, color: col === C.ink ? C.mute : col}}>{note}</div>}
		</div>
	</div>
);
export const Rule: React.FC<{w?: number; style?: React.CSSProperties}> = ({w = 640, style}) => <div style={{width: w, height: 1.5, background: `linear-gradient(90deg, ${C.line}, rgba(226,194,127,0))`, ...style}} />;
/** caption in serif (scene annotations): big enough to read on a phone */
export const Cap: React.FC<{children: React.ReactNode; size?: number; col?: string; style?: React.CSSProperties}> = ({children, size = 46, col = C.ink, style}) => (
	<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, color: col, letterSpacing: '0.04em', textShadow: '0 2px 16px rgba(0,0,0,0.8)', ...style}}>{children}</div>
);
