import React from 'react';
import {staticFile} from 'remotion';
import {W, H, rnd, lerp, Glow, Blur} from '../qq42/kit42';
import {Rimmed, fkPose, gaitPose, mixPose, Look4, Pose} from './figure44';
/* ep44 kit: look A furniture (ep43, owner-approved) + "你" (the brain) as the only glowing, saturated thing. */
export {W, H, rnd, lerp, Glow, Blur, Rimmed, fkPose, gaitPose, mixPose};
export type {Look4, Pose};
export const SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif", RED = '#EE4B3B', INK = '#F6EFE2';
export const B = {core: '#fff3de', mid: '#ffb48a', halo: '#ff7a5a'};   // the brain's light
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): [number, number] => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];
export const Plate: React.FC<{k: string; op?: number}> = ({k, op = 1}) => <image href={staticFile(`ep44/${k}.webp`)} x={0} y={0} width={W} height={H} preserveAspectRatio="none" opacity={op} />;
export const Sky: React.FC<{id: string; stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({id, stops, x = 0, y = 0, w = W, h = H}) =>
	<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} /></>;

/* ---------- look A furniture (HTML overlay, exact sizes from ep43 lookA_key.html) ---------- */
const SH = '0 0 2px rgba(12,8,5,0.9), 0 2px 6px rgba(12,8,5,0.65), 0 3px 24px rgba(12,8,5,0.6)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SERIF, color: INK, textShadow: SH};
const marked = (s: string) => s.split(/(\[[^\]]+\])/).filter(Boolean).map((p, i) => p.startsWith('[') ? <span key={i} style={{color: RED}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);
export const Furniture: React.FC<{sub?: string[]; stamp: [string, string, string?]; era: string; age: React.ReactNode; punch?: string; extra?: React.ReactNode; scrim?: boolean}> = ({sub = [], stamp, era, age, punch, extra, scrim = true}) => <div style={{position: 'absolute', inset: 0}}>
	{scrim && sub.length > 0 && <div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1066, height: 120 + 88 * sub.length, background: 'rgba(16,24,28,0.30)'}} />}
	{sub.length > 0 && <div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.52, letterSpacing: '0.035em', whiteSpace: 'nowrap'}}>{sub.map((l, i) => <div key={i}>{marked(l)}</div>)}</div>}
	<div style={{...fx, top: 34, right: 60, fontSize: 30, letterSpacing: '0.06em', fontWeight: 700, opacity: 0.92}}><b style={{color: RED, fontWeight: 900}}>◆</b> Juno · VIBE知识大赏</div>
	<div style={{...fx, top: 92, right: 60, textAlign: 'right', paddingRight: 22, borderRight: `5px solid ${RED}`}}>
		<div style={{fontWeight: 900, fontSize: 56, lineHeight: 1.22, letterSpacing: '0.02em'}}>{stamp[0]}</div>
		<div style={{fontWeight: 700, fontSize: 40, lineHeight: 1.45, marginTop: 2}}>{stamp[1]}</div>
		{stamp[2] && <div style={{fontWeight: 600, fontSize: 34, lineHeight: 1.45, opacity: 0.85}}>{stamp[2]}</div>}
	</div>
	<div style={{...fx, left: 150, bottom: 66, display: 'flex', alignItems: 'flex-end', gap: 18}}>
		<div style={{background: RED, color: '#F8EEDC', textShadow: 'none', fontWeight: 900, fontSize: 30, lineHeight: 1, padding: '10px 10px', borderRadius: 4, writingMode: 'vertical-rl', letterSpacing: '0.05em', boxShadow: '0 2px 10px rgba(0,0,0,0.25)', marginBottom: 10}}>{era}</div>
		{age}
	</div>
	{punch && <div style={{...fx, left: 0, right: 0, top: 470, textAlign: 'center', fontWeight: 900, fontSize: 75, letterSpacing: '0.06em'}}>{marked(punch)}</div>}
	{extra}
</div>;
export const Age: React.FC<{n: React.ReactNode; pre?: string; who?: string; dim?: boolean}> = ({n, pre = '', who = '你', dim}) => <div style={{fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', opacity: dim ? 0.55 : 1}}>
	<span style={{fontSize: 34, fontWeight: 700}}>{who} {pre}</span><span style={{fontSize: 88, letterSpacing: '0.01em', margin: '0 6px'}}>{n}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>;

/* ---------- 你: the brain's light ---------- */
/** a stylised side outline (no anatomy), centred on 0,0, about 600 × 420 at s = 1 */
export const BRAIN_D = 'M-300,40 C-312,-120 -170,-222 -20,-215 C140,-232 292,-140 300,-10 C308,80 250,140 170,150 C150,190 90,205 40,180 C-10,200 -80,192 -120,160 C-200,172 -292,132 -300,40 Z';
const FOLDS = ['M-220,-40 C-160,-90 -100,-60 -60,-110', 'M-40,-160 C0,-110 60,-150 110,-120', 'M140,-60 C180,-20 230,-60 250,0', 'M-200,60 C-140,30 -90,80 -30,50', 'M20,40 C70,0 120,60 170,30', 'M-100,-10 C-50,-30 0,10 60,-20'];
export const HeadGlow: React.FC<{x: number; y: number; r: number; id: string; o?: number}> = ({x, y, r, id, o = 1}) => <g opacity={o}>
	<Glow x={x} y={y} r={r * 3.2} c={B.halo} o={0.35} id={`${id}a`} /><Glow x={x} y={y} r={r * 1.5} c={B.mid} o={0.8} id={`${id}b`} /><Glow x={x} y={y} r={r * 0.7} c={B.core} o={0.9} id={`${id}c`} />
</g>;
/** the brain as light: outline + soft fill; explode > 0 cracks it into numbered cubes */
export const BrainLight: React.FC<{x: number; y: number; s: number; id: string; explode?: number; cubes?: boolean; cell?: number; o?: number; nums?: boolean}> = ({x, y, s, id, explode = 0, cubes = false, cell = 64, o = 1, nums = true}) => {
	const cells: [number, number, number][] = []; let k = 0;
	for (let cy = -220; cy < 210; cy += cell) for (let cx = -310; cx < 310; cx += cell) { k++; cells.push([cx + cell / 2, cy + cell / 2, k]); }
	return <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<defs><clipPath id={`${id}c`}><path d={BRAIN_D} /></clipPath>
			<radialGradient id={`${id}f`} cx="0.45" cy="0.45" r="0.6"><stop offset="0" stopColor={B.core} stopOpacity="0.9" /><stop offset="0.6" stopColor={B.mid} stopOpacity="0.55" /><stop offset="1" stopColor={B.halo} stopOpacity="0.35" /></radialGradient></defs>
		<Glow x={0} y={0} r={520} c={B.halo} o={0.35} id={`${id}h`} />
		{!cubes ? <g>
			<path d={BRAIN_D} fill={`url(#${id}f)`} opacity={0.55} />
			{FOLDS.map((d, i) => <path key={i} d={d} stroke={B.core} strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round" />)}
			<path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={7} />
		</g> : <g>
			{cells.map(([cx, cy, n]) => { const d = Math.hypot(cx, cy) || 1, ox = cx / d * explode * (60 + 60 * rnd(n, 3)), oy = cy / d * explode * (60 + 60 * rnd(n, 4)), rot = (rnd(n, 5) - 0.5) * 30 * explode;
				return <g key={n} transform={`translate(${ox},${oy}) rotate(${rot} ${cx} ${cy})`}>
					<g clipPath={`url(#${id}c)`}><rect x={cx - cell / 2 + 3} y={cy - cell / 2 + 3} width={cell - 6} height={cell - 6} rx={6} fill={`url(#${id}f)`} opacity={0.75} stroke={B.core} strokeWidth={2.5} /></g>
					{nums && <text x={cx} y={cy + 9} textAnchor="middle" style={{fontFamily: 'DejaVu Sans Mono, monospace', fontSize: 22, fontWeight: 700}} fill="#5a2a1a" opacity={0.85} clipPath={`url(#${id}c)`}>{n}</text>}
				</g>; })}
			{explode < 0.25 && <path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={5} opacity={1 - explode * 3} />}
		</g>}
	</g>;
};
/** a mason jar with glowing numbered blocks */
export const Jar: React.FC<{x: number; y: number; s?: number; id: string; n0?: number}> = ({x, y, s = 1, id, n0 = 1}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<Glow x={0} y={-130} r={300} c={B.halo} o={0.45} id={`${id}g`} />
	<path d="M-90,0 L-90,-210 Q-90,-236 -66,-244 L-66,-262 L66,-262 L66,-244 Q90,-236 90,-210 L90,0 Q90,12 78,12 L-78,12 Q-90,12 -90,0 Z" fill="#cfe2e6" opacity={0.16} stroke="#e8f2f4" strokeWidth={3} strokeOpacity={0.6} />
	<rect x={-72} y={-286} width={144} height={28} rx={6} fill="#8a8e94" />{Array.from({length: 6}, (_, i) => <rect key={i} x={-72} y={-282 + i * 4} width={144} height={1.5} fill="#5a5e64" />)}
	<rect x={-86} y={-160} width={172} height={170} fill="#ffd9b0" opacity={0.18} />
	{Array.from({length: 9}, (_, i) => { const cx = -52 + (i % 3) * 52 + (rnd(i, 2) - 0.5) * 10, cy = -30 - Math.floor(i / 3) * 50 + (rnd(i, 3) - 0.5) * 8, r = (rnd(i, 4) - 0.5) * 30;
		return <g key={i} transform={`rotate(${r} ${cx} ${cy})`}><rect x={cx - 22} y={cy - 22} width={44} height={44} rx={5} fill={B.mid} opacity={0.85} stroke={B.core} strokeWidth={2} /><rect x={cx - 16} y={cy - 8} width={32} height={14} rx={2} fill="#fff6e8" opacity={0.9} />
			<text x={cx} y={cy + 4} textAnchor="middle" style={{fontFamily: 'DejaVu Sans Mono, monospace', fontSize: 11, fontWeight: 700}} fill="#5a2a1a">{n0 + i * 7}</text></g>; })}
	<path d="M-70,-200 Q-76,-120 -70,-30" stroke="#ffffff" strokeWidth={5} opacity={0.35} fill="none" strokeLinecap="round" />
</g>;
/** a plain round brass pocket compass; needle angle in degrees */
export const Compass: React.FC<{x: number; y: number; r: number; a: number; glow?: number; id: string}> = ({x, y, r, a, glow = 0, id}) => <g transform={`translate(${x},${y})`}>
	{glow > 0 && <Glow x={0} y={0} r={r * 4} c={B.mid} o={0.5 * glow} id={`${id}g`} />}
	<circle r={r * 1.08} fill="#7a5a26" /><circle r={r} fill="#b88a3a" /><circle r={r * 0.86} fill="#f1e6cc" />
	{Array.from({length: 16}, (_, i) => { const t = i * Math.PI / 8, l = i % 4 ? 0.08 : 0.16; return <line key={i} x1={Math.cos(t) * r * 0.84} y1={Math.sin(t) * r * 0.84} x2={Math.cos(t) * r * (0.84 - l)} y2={Math.sin(t) * r * (0.84 - l)} stroke="#5a4020" strokeWidth={r * 0.03} />; })}
	<g transform={`rotate(${a})`}><path d={`M0,${-r * 0.72} L${r * 0.1},0 L${-r * 0.1},0 Z`} fill="#b03a2a" /><path d={`M0,${r * 0.72} L${r * 0.1},0 L${-r * 0.1},0 Z`} fill="#3a4250" /></g>
	<circle r={r * 0.06} fill="#7a5a26" /><rect x={-r * 0.12} y={-r * 1.3} width={r * 0.24} height={r * 0.24} rx={r * 0.08} fill="#7a5a26" />
	<path d={`M${-r * 0.6},${-r * 0.5} Q${-r * 0.2},${-r * 0.8} ${r * 0.3},${-r * 0.72}`} stroke="#fff" strokeWidth={r * 0.05} opacity={0.45} fill="none" />
</g>;
export const Grain44: React.FC<{seed: number}> = ({seed}) => <g pointerEvents="none">
	<defs><radialGradient id="v44" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
		<filter id="g44" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter></defs>
	<rect width={W} height={H} fill="url(#v44)" /><rect width={W} height={H} filter="url(#g44)" opacity={0.05} style={{mixBlendMode: 'overlay'}} />
</g>;
void lerp; void Blur; void gaitPose; void mixPose; void fkPose; void Rimmed;
