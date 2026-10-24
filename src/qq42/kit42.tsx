import React from 'react';
import {staticFile} from 'remotion';
import {Rimmed as Rimmed4, Look4, Pose, fkPose, gaitPose, POSES} from './figure42';
/* ep42 key-frame kit: the ep41 v3 language (label, subtitles, glow, grain) on figure42 (ep42 heads and mantles). */
export const W = 1920, H = 1080;
export const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", sans-serif', LATS = '"DejaVu Serif", serif', MONO = '"DejaVu Sans Mono", monospace';
export const GOLD = '#f2cf7a', SUBC = '#ffe6b0', KEYC = '#ffc04d';
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export {fkPose, gaitPose, POSES};
export type {Look4, Pose};
export const Rimmed = Rimmed4;
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): [number, number] => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];

export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number; id: string}> = ({x, y, r, c = '#ffb44a', o = 0.3, id}) =>
	<><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} /></>;
export const Plate: React.FC<{k: string; x?: number; y?: number; w?: number; h?: number; flip?: boolean; op?: number; filter?: string}> = ({k, x = 0, y = 0, w = W, h = H, flip, op = 1, filter}) =>
	<image href={staticFile(`ep42/${k}.webp`)} x={x} y={y} width={w} height={h} preserveAspectRatio="none" opacity={op} transform={flip ? `translate(${2 * x + w},0) scale(-1,1)` : undefined} style={filter ? {filter} : undefined} />;
export const Sky: React.FC<{id: string; stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({id, stops, x = 0, y = 0, w = W, h = H}) =>
	<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} /></>;

/** era label, exactly as the ep41 v3 master draws it */
export const Label: React.FC<{date: string; name: string; dy?: number}> = ({date, name, dy = 0}) => <g transform={`translate(0,${dy})`}>
	<defs><radialGradient id="lblS42" cx="0.3" cy="0.3" r="0.7"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={330} cy={130} rx={420} ry={150} fill="url(#lblS42)" />
	<rect x={96} y={96} width={40} height={5} fill="#e0453a" />
	<text x={148} y={106} style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: '0.06em'}} fill="#fff" opacity={0.9}>{date}</text>
	<text x={96} y={160} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 44, letterSpacing: '0.04em'}} fill="#fff">{name}</text>
</g>;
/** subtitle: [key words] in gold; optional native line above (Latin/Greek in italic DejaVu, CJK in serif) */
export const Subs: React.FC<{zh: string; nat?: string; band?: boolean}> = ({zh, nat, band = true}) => {
	const parts = zh.split(/(\[[^\]]+\])/).filter(Boolean), isLat = nat ? /[a-zA-Zα-ωΑ-Ωἀ-ῼ]/.test(nat) : false, len = zh.replace(/[[\]]/g, '').length;
	return <g>
		<defs><linearGradient id="subBand42" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></linearGradient></defs>
		{band && <rect x={0} y={860} width={W} height={220} fill="url(#subBand42)" opacity={0.9} />}
		{nat && <text x={W / 2} y={958} textAnchor="middle" style={{fontFamily: isLat ? LATS : SERIF, fontSize: 33, fontStyle: isLat ? 'italic' : 'normal'}} fill="#fff" opacity={0.88} stroke="rgba(0,0,0,0.45)" strokeWidth={4} paintOrder="stroke">{nat}</text>}
		<text x={W / 2} y={nat ? 1026 : 1010} textAnchor="middle" style={{fontFamily: SANS, fontSize: len > 18 ? 50 : 54, fontWeight: 700, letterSpacing: '0.03em'}} fill={SUBC} stroke="rgba(0,0,0,0.65)" strokeWidth={7} paintOrder="stroke">
			{parts.map((p, i) => p.startsWith('[') ? <tspan key={i} fill={KEYC}>{p.slice(1, -1)}</tspan> : <tspan key={i}>{p}</tspan>)}
		</text>
	</g>;
};
export const Grain: React.FC<{f: number; vig?: number; grain?: number}> = ({f, vig = 0.45, grain = 0.05}) => <g pointerEvents="none">
	<defs>
		<radialGradient id="fxVig42" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={vig} /></radialGradient>
		<filter id="fxGrain42" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 97} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter>
	</defs>
	<rect width={W} height={H} fill="url(#fxVig42)" />
	{grain > 0 && <rect width={W} height={H} filter="url(#fxGrain42)" opacity={grain} style={{mixBlendMode: 'overlay'}} />}
</g>;
export const Letterbox: React.FC<{k?: number}> = ({k = 1}) => { const b = ((H - W / 2.39) / 2) * k; return <g><rect width={W} height={b} fill="#000" /><rect y={H - b} width={W} height={b} fill="#000" /></g>; };
export const Blur: React.FC<{id: string; s: number; children: React.ReactNode}> = ({id, s, children}) => <g><defs><filter id={id} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={s} /></filter></defs><g filter={`url(#${id})`}>{children}</g></g>;
/** smoke wisps rising from (x, y) */
export const Smoke: React.FC<{x: number; y: number; s?: number; col?: string; op?: number; seed?: number; id: string}> = ({x, y, s = 1, col = '#cfc6c0', op = 0.35, seed = 0, id}) =>
	<Blur id={id} s={6 * s}><g opacity={op}>{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={x + (Math.sin(i * 0.9 + seed) * 18 + i * 9) * s} cy={y - i * 34 * s} rx={(12 + i * 6) * s} ry={(10 + i * 4) * s} fill={col} opacity={1 - i / 8} />)}</g></Blur>;
