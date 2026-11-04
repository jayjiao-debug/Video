import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {PAL, sp, poly, lerp, cl, sm} from './geo60';
import {WingedSun} from './props60';

/* ep60 · 4:3 signature frame and stage (1440 × 1080, the owner's reference look).
   ┌ top band (0–40): lapis, triangle + bead rows, gold rule, winged sun at centre
   │ PICTURE (40–932): the scene, seen through Stage60's camera; stamp top-right, J seal bottom-right, name tags beside figures
   │ subtitle band (932–1034): navy, one centred line, heavy serif CJK 54 px, cream, [key] words red-orange — never over the picture
   └ bottom band (1034–1080): triangle row and a wedjat eye at centre
   Douyin's buttons cover the right ~12 % in the portrait feed: nothing important right of SAFE_R.
   World coordinates: with the default camera (CAM0) world px == frame px, so a scene authored for the picture window
   (ground ≈ 850) reads 1:1; pans/zooms move the world under the fixed frame. */
export const FW = 1440, FH = 1080, PIC_T = 40, PIC_B = 932, SUB_B = 1034, SAFE_R = 1266, PIC_CY = (PIC_T + PIC_B) / 2;
export const CAM0: Cam = {x: FW / 2, y: PIC_CY, z: 1};
export const F_SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif";
export const FC = {lapis: '#1B2652', lapis2: '#121A3D', navy: '#18224A', gold: '#D8A845', gold2: '#9C7426', cream: '#F4E8CC', key: '#EC6A3E', ink: '#2A1912',
	tri: ['#E0B04A', '#3FA49A', '#D0573A', '#EADCB8', '#4B79C8']};

/* ---------------- deterministic helpers ---------------- */
export const rng = (seed: number) => { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
/** torch flicker in [-1, 1], smooth but irregular */
export const flick = (t: number, seed = 0) => 0.5 * Math.sin(t * 11.3 + seed * 1.7) + 0.3 * Math.sin(t * 23.9 + seed * 3.1) + 0.2 * Math.sin(t * 47.1 + seed * 5.3);
export type Cam = {x: number; y: number; z: number};
/** camera keys [t, x, y, z] with smooth (ease-in-out) moves between them */
export const camPath = (t: number, keys: [number, number, number, number][]): Cam => {
	if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = sm((t - a[0]) / (b[0] - a[0]));
		return {x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: lerp(a[3], b[3], u)}; }
	const k = keys[keys.length - 1]; return {x: k[1], y: k[2], z: k[3]};
};
export const toScreen = (cam: Cam, wx: number, wy: number): [number, number] => [FW / 2 + (wx - cam.x) * cam.z, PIC_CY + (wy - cam.y) * cam.z];

/* ---------------- frame pieces ---------------- */
const triRow = (y: number, h: number, w: number, gap: number, k0 = 0, flip = false, hole?: [number, number]) => { const out: React.ReactNode[] = [];
	for (let i = 0, x = -6; x < FW + w; i++, x += w + gap) if (!hole || x + w < hole[0] || x > hole[1]) out.push(<path key={i} d={flip ? poly([[x, y], [x + w, y], [x + w / 2, y + h]]) : poly([[x, y + h], [x + w, y + h], [x + w / 2, y]])} fill={FC.tri[(i + k0) % 4]} opacity={0.92} />);
	return out; };
const beadRow = (y: number, r: number, step: number, k0 = 0, hole?: [number, number]) => { const out: React.ReactNode[] = [];
	for (let i = 0, x = 4; x < FW + step; i++, x += step) if (!hole || x + r < hole[0] || x - r > hole[1]) out.push(<rect key={i} x={x - r} y={y - r * 0.8} width={r * 2} height={r * 1.6} rx={r * 0.55} fill={[FC.cream, FC.tri[1], FC.tri[0], FC.tri[2]][(i + k0) % 4]} opacity={0.9} />);
	return out; };
const Wedjat: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={FC.gold} strokeWidth={0.13} strokeLinecap="round" strokeLinejoin="round">
	<path d={sp([[-1.35, 0, 1], [-0.6, -0.55], [0.4, -0.6], [1.35, -0.05, 1], [0.4, 0.42], [-0.6, 0.4]], true, 0.2)} />
	<circle cx={-0.05} cy={-0.05} r={0.36} fill={FC.gold} stroke="none" />
	<path d="M-1.3 -0.95Q0 -1.25 1.35 -0.75" /><path d="M1.35 -0.05L2.1 -0.1" />
	<path d="M-0.25 0.42L-0.3 1.35" /><path d="M0.35 0.4Q0.6 1.0 1.25 1.05Q1.6 1.0 1.5 0.65" />
</g>;
/** the bands only (no text); drawn above the picture */
export const Bands: React.FC<{t?: number}> = ({t = 0}) => <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
	{/* top band */}
	<rect x={0} y={0} width={FW} height={PIC_T} fill={FC.lapis} />
	<rect x={0} y={0} width={FW} height={2.5} fill={FC.gold2} />
	{triRow(7, 15, 13, 7, 0, false, [552, 888])}
	{beadRow(28, 3.2, 10, 1, [552, 888])}
	<rect x={0} y={PIC_T - 6} width={FW} height={4} fill={FC.gold} /><rect x={0} y={PIC_T - 2} width={FW} height={2} fill={FC.ink} />
	{/* winged sun over the band's centre, dipping a little into the picture */}
	<g opacity={0.98}><WingedSun x={FW / 2} y={17} s={15} span={9.6} t={t} /></g>
	{/* subtitle band */}
	<rect x={0} y={PIC_B} width={FW} height={SUB_B - PIC_B} fill={FC.navy} />
	<rect x={0} y={PIC_B} width={FW} height={2} fill={FC.ink} /><rect x={0} y={PIC_B + 2} width={FW} height={4} fill={FC.gold} />
	{beadRow(PIC_B + 12, 2.6, 9, 2)}
	<rect x={0} y={PIC_B + 18} width={FW} height={1.2} fill={FC.gold} opacity={0.55} />
	<rect x={0} y={SUB_B - 19} width={FW} height={1.2} fill={FC.gold} opacity={0.55} />
	{beadRow(SUB_B - 11, 2.6, 9, 0)}
	{/* bottom band */}
	<rect x={0} y={SUB_B - 5} width={FW} height={4} fill={FC.gold} /><rect x={0} y={SUB_B - 1} width={FW} height={FH - SUB_B + 1} fill={FC.lapis} />
	{triRow(SUB_B + 8, 15, 13, 7, 2, false, [648, 792])}
	<rect x={0} y={FH - 7} width={FW} height={2.5} fill={FC.gold2} />
	<Wedjat x={FW / 2 - 6} y={SUB_B + 22} s={10.5} />
</svg>;

export type Sub = {text: string; t0?: number; t1?: number};
const fade = (t: number, t0 = -1e9, t1 = 1e9, d = 0.14) => cl((t - t0) / d) * cl((t1 - t) / d);
const visLen = (s: string) => s.replace(/[[\]]/g, '').length;
/** the subtitle line in the navy band: one line, centred, heavy serif; "[key]" words in red-orange */
export const Subtitle: React.FC<{t: number; sub: Sub}> = ({t, sub}) => {
	const o = fade(t, sub.t0, sub.t1), n = visLen(sub.text), fs = Math.min(54, 1090 / (n * 1.03));
	const parts = sub.text.split(/(\[[^\]]+\])/).filter(Boolean);
	return <div style={{position: 'absolute', left: 0, width: FW, top: PIC_B + 19, height: SUB_B - PIC_B - 38, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o,
		fontFamily: F_SERIF, fontWeight: 900, fontSize: fs, letterSpacing: '0.03em', color: FC.cream, whiteSpace: 'nowrap', textShadow: '0 3px 0 rgba(8,10,28,0.55), 0 0 14px rgba(8,10,28,0.5)'}}>
		{parts.map((p, i) => { const key = p.startsWith('['); return <span key={i} style={{color: key ? FC.key : FC.cream}}>{key ? p.slice(1, -1) : p}</span>; })}
	</div>;
};
const outline = (c: string, w: number) => [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b]) => `${a * w}px ${b * w}px 0 ${c}`).join(',') + `, 0 3px 8px rgba(0,0,0,0.45)`;
export type Stamp = {era: string; place: string; src?: string};
/** top-right stamp: era · place / source, cream on a dark outline, with a rule at the right (inside the safe area) */
export const Stamp43: React.FC<{stamp: Stamp; o?: number}> = ({stamp, o = 1}) => <div style={{position: 'absolute', top: PIC_T + 20, right: FW - SAFE_R, textAlign: 'right', paddingRight: 14, opacity: o, fontFamily: F_SERIF, color: FC.cream, whiteSpace: 'nowrap'}}>
	<div style={{position: 'absolute', right: 0, top: 4, bottom: 4, width: 3, background: FC.cream, boxShadow: `0 0 0 1.5px ${FC.ink}`}} />
	<div style={{fontWeight: 900, fontSize: 37, lineHeight: 1.2, letterSpacing: '0.03em', textShadow: outline('#2a1608', 1.7)}}>{stamp.era}<span style={{color: FC.key, margin: '0 0.18em'}}>·</span>{stamp.place}</div>
	{stamp.src && <div style={{fontWeight: 900, fontSize: 29, lineHeight: 1.45, letterSpacing: '0.04em', textShadow: outline('#2a1608', 1.5)}}>{stamp.src}</div>}
</div>;
/** the J seal, bottom-right inside the picture */
export const Seal43: React.FC<{o?: number}> = ({o = 0.86}) => <Img src={staticFile('ep44/jseal.png')} style={{position: 'absolute', left: SAFE_R - 68, top: PIC_B - 80, width: 66, height: 66, opacity: o, transform: 'rotate(-5deg)'}} />;
/** a character's name: a vertical cream paper column with a red rule; (x, y) = top centre in frame px */
export const NameTag: React.FC<{x: number; y: number; text: string; o?: number; size?: number}> = ({x, y, text, o = 1, size = 36}) => {
	const w = size + 22;
	return <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, opacity: o, background: '#F2E3C0', border: `2px solid ${FC.ink}`, borderRadius: 4, padding: '11px 0',
		boxShadow: '0 3px 8px rgba(30,15,5,0.35), inset 0 0 10px rgba(150,100,40,0.25)'}}>
		<div style={{position: 'absolute', inset: 3, border: `1.6px solid ${PAL.red}`, borderRadius: 2}} />
		<div style={{writingMode: 'vertical-rl', margin: '0 auto', fontFamily: F_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: '0.08em', color: FC.ink, textAlign: 'center', width: size}}>{text}</div>
	</div>;
};
export type Tag = {x: number; y: number; text: string; o?: number; size?: number};
/** the whole frame on top of a picture: bands, subtitle, stamp, seal, name tags (frame px) */
export const Frame60: React.FC<{t: number; sub?: Sub; stamp?: Stamp; seal?: boolean; tags?: Tag[]; stampO?: number}> = ({t, sub, stamp, seal = true, tags = [], stampO = 1}) => <>
	{tags.map((g, i) => <NameTag key={i} {...g} />)}
	{stamp && <Stamp43 stamp={stamp} o={stampO} />}
	{seal && <Seal43 />}
	<Bands t={t} />
	{sub && <Subtitle t={t} sub={sub} />}
</>;

/* ---------------- grades (mood colour per beat) ---------------- */
export type Grade = 'plaster' | 'papyrus' | 'tomb' | 'blood' | 'night' | 'reeds' | 'lapis';
type GradeDef = {tint: string; mode: React.CSSProperties['mixBlendMode']; o: number; vig: string; vigO: number; grain: number; dust?: number; haze: number; flick?: number; css: string};
export const GRADES: Record<Grade, GradeDef> = {
	plaster: {tint: '#f2c27a', mode: 'soft-light', o: 0.25, vig: '#3a2410', vigO: 0.62, grain: 0.62, haze: 0.1, css: 'saturate(0.8) sepia(0.12)'},
	papyrus: {tint: '#f6b25a', mode: 'soft-light', o: 0.4, vig: '#40200a', vigO: 0.7, grain: 0.66, haze: 0.08, css: 'saturate(0.8) sepia(0.14) contrast(1.03)'},
	tomb: {tint: '#ff9a44', mode: 'multiply', o: 0.22, vig: '#100602', vigO: 0.92, grain: 0.62, haze: 0.03, flick: 0.07, css: 'saturate(0.86) sepia(0.1)'},
	blood: {tint: '#c0281c', mode: 'multiply', o: 0.5, vig: '#160101', vigO: 0.94, grain: 0.55, haze: 0.0, flick: 0.05, css: 'saturate(0.9) contrast(1.05)'},
	night: {tint: '#3d5fb8', mode: 'multiply', o: 0.26, vig: '#02040f', vigO: 0.9, grain: 0.3, dust: 0.55, haze: 0.0, css: 'saturate(0.88)'},
	lapis: {tint: '#6a86d8', mode: 'soft-light', o: 0.25, vig: '#040818', vigO: 0.85, grain: 0.4, dust: 0.35, haze: 0.0, css: 'saturate(0.9) sepia(0.06)'},
	reeds: {tint: '#dfe58e', mode: 'soft-light', o: 0.32, vig: '#1c260a', vigO: 0.55, grain: 0.58, haze: 0.07, css: 'saturate(0.86) sepia(0.08)'},
};
const TEX = {plaster: 'ep60/plaster.jpg', papyrus: 'ep60/papyrus.jpg', wear: 'ep60/wear.png', grain: 'ep60/grain.jpg', dust: 'ep60/dust.jpg'};

/* ---------------- light & particle layers (world space) ---------------- */
/** shared radial gradients (one set per Stage): url(#g60-<name>) */
const GLOWS: Record<string, string> = {warm: '#FFB45A', gold: '#FFD98A', white: '#FFF6DE', red: '#FF3A1E', blue: '#7FA6FF', green: '#CFF0A0', smoke: '#D9CDB8', ember: '#FF8A2A'};
const GlowDefs: React.FC = () => <>{Object.entries(GLOWS).map(([k, c]) => <radialGradient key={k} id={`g60-${k}`}><stop offset="0" stopColor={c} stopOpacity={1} /><stop offset="0.35" stopColor={c} stopOpacity={0.45} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>)}
	<linearGradient id="g60-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF0C8" stopOpacity={0.55} /><stop offset="1" stopColor="#FFF0C8" stopOpacity={0} /></linearGradient></>;
export const Glow: React.FC<{x: number; y: number; r: number; c?: keyof typeof GLOWS | string; o?: number; ry?: number; blend?: React.CSSProperties['mixBlendMode']}> = ({x, y, r, c = 'warm', o = 0.6, ry, blend = 'screen'}) =>
	<ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#g60-${c})`} opacity={o} style={{mixBlendMode: blend}} />;
/** a flame (teardrop, flickering) with its glow; (x, y) = base of the flame */
export const Flame: React.FC<{x: number; y: number; s?: number; t: number; seed?: number; glow?: number}> = ({x, y, s = 1, t, seed = 0, glow = 1}) => {
	const f = flick(t, seed), h = 46 * s * (1 + 0.12 * f), w = 15 * s, lean = 4 * s * Math.sin(t * 5.3 + seed);
	const outer = sp([[x - w, y, 1], [x - w * 0.9, y - h * 0.35], [x - w * 0.3 + lean * 0.5, y - h * 0.75], [x + lean, y - h, 1], [x + w * 0.45 + lean * 0.4, y - h * 0.62], [x + w * 0.95, y - h * 0.3], [x + w, y, 1]], true, 0.2);
	const inner = sp([[x - w * 0.5, y, 1], [x - w * 0.42, y - h * 0.3], [x + lean * 0.6, y - h * 0.62, 1], [x + w * 0.45, y - h * 0.28], [x + w * 0.5, y, 1]], true, 0.2);
	return <g>
		{glow > 0 && <Glow x={x} y={y - h * 0.4} r={170 * s * glow * (1 + 0.08 * f)} c="warm" o={0.5 + 0.1 * f} />}
		<path d={outer} fill="#E8642A" stroke={PAL.ink} strokeWidth={1.6} strokeLinejoin="round" />
		<path d={inner} fill="#F8C24A" />
		<ellipse cx={x} cy={y - h * 0.18} rx={w * 0.22} ry={h * 0.12} fill="#FFF3C4" />
	</g>;
};
/** drifting dust motes inside a box (they wrap), twinkling as they cross the light */
export const Dust: React.FC<{t: number; box: [number, number, number, number]; n?: number; seed?: number; c?: string; r?: number; o?: number; vx?: number; vy?: number}> = ({t, box, n = 40, seed = 1, c = '#FFF2D0', r = 2.2, o = 0.7, vx = 6, vy = -4}) => {
	const R = rng(seed), [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
	return <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}, (_, i) => {
		const px = R(), py = R(), sp_ = 0.5 + R(), ph = R() * 6.28, rr = r * (0.4 + R());
		const x = x0 + ((((px * w + (vx * sp_ * t) + 9 * Math.sin(t * 0.7 * sp_ + ph)) % w) + w) % w), y = y0 + ((((py * h + vy * sp_ * t + 6 * Math.sin(t * 0.9 + ph * 2)) % h) + h) % h);
		return <circle key={i} cx={x} cy={y} r={rr} fill={c} opacity={o * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 * sp_ + ph)))} />; })}</g>;
};
/** sparks rising from a point, swaying, fading */
export const Embers: React.FC<{t: number; x: number; y: number; n?: number; seed?: number; h?: number; spread?: number; s?: number}> = ({t, x, y, n = 14, seed = 2, h = 260, spread = 40, s = 1}) => {
	const R = rng(seed);
	return <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}, (_, i) => {
		const life = 1.6 + R() * 1.6, off = R() * life, u = ((t + off) % life) / life, sx = (R() - 0.5) * spread, ph = R() * 6.28;
		const ex = x + sx + 18 * s * Math.sin(u * 5 + ph) * u, ey = y - u * h * s, rr = (1.4 + R() * 1.8) * s * (1 - u * 0.6);
		return <g key={i} opacity={Math.sin(Math.PI * Math.min(1, u * 1.1))}><circle cx={ex} cy={ey} r={rr * 3.2} fill="url(#g60-ember)" opacity={0.7} /><circle cx={ex} cy={ey} r={rr} fill="#FFD27A" /></g>; })}</g>;
};
/** soft smoke rising from a point (incense, lamps), expanding and fading */
export const Smoke: React.FC<{t: number; x: number; y: number; n?: number; seed?: number; h?: number; s?: number; o?: number; c?: string}> = ({t, x, y, n = 9, seed = 3, h = 300, s = 1, o = 0.32, c = 'smoke'}) => {
	const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => {
		const life = 4 + R() * 2.5, off = R() * life, u = ((t + off) % life) / life, ph = R() * 6.28;
		const ex = x + 26 * s * Math.sin(u * 3.2 + ph) * u + 30 * s * u * (R() - 0.3), ey = y - u * h * s, rr = (14 + 70 * u) * s;
		return <ellipse key={i} cx={ex} cy={ey} rx={rr} ry={rr * 0.8} fill={`url(#g60-${c})`} opacity={o * Math.sin(Math.PI * u) * (0.6 + 0.4 * R())} />; })}</g>;
};
/** a beam of light (polygon top → bottom), screen-blended */
export const Shaft: React.FC<{pts: [number, number][]; o?: number}> = ({pts, o = 0.5}) => <path d={poly(pts)} fill="url(#g60-shaft)" opacity={o} style={{mixBlendMode: 'screen'}} />;
/** twinkling stars (night grade) */
export const Stars: React.FC<{t: number; box: [number, number, number, number]; n?: number; seed?: number; o?: number}> = ({t, box, n = 80, seed = 5, o = 1}) => {
	const R = rng(seed), [x0, y0, x1, y1] = box;
	return <g opacity={o}>{Array.from({length: n}, (_, i) => { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = 1 + R() * 2.4, tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.6 + R()) + R() * 6));
		return r > 2.6 ? <path key={i} d={`M${x} ${y - r * 2.4}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2.4} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2.4}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2.4} ${y}L${x - r * 0.5} ${y - r * 0.5}Z`} fill="#F6D27A" opacity={tw} />
			: <circle key={i} cx={x} cy={y} r={r * 0.7} fill="#F3E3B0" opacity={tw * 0.85} />; })}</g>;
};

/* ---------------- the stage ---------------- */
export type StageProps = {
	t: number; cam?: Cam; grade?: Grade; bg?: 'plaster' | 'papyrus' | string; ground?: string;
	/** world-space content (painted; gets the hand-painted wobble, paint loss and stains) */
	children?: React.ReactNode;
	/** world-space light/particles drawn above the paint (not chipped) */
	light?: React.ReactNode;
	/** screen-space layers above the grade (flashes) */
	screen?: React.ReactNode;
	sub?: Sub; stamp?: Stamp; tags?: Tag[]; seal?: boolean;
	wear?: number; stain?: number; wobble?: number; frame?: boolean; flickSeed?: number;
	/** world-space darkness (multiply) laid over the paint before the light layer: lamps and glows then carve light pools out of it */
	dark?: number; darkC?: string;
};
/** Composes a scene at 1440 × 1080: world under a camera (pan/zoom), the aged-paper finish (texture ground, paint loss, stains,
    hand-painted wobble), the mood grade (tint, vignette, torch flicker), ONE fixed grain image, then the frame on top. */
export const Stage60: React.FC<StageProps> = ({t, cam = CAM0, grade = 'plaster', bg = 'plaster', ground, children, light, screen, sub, stamp, tags = [], seal = true, wear = 0.9, stain = 0.42, wobble = 2.4, frame = true, flickSeed = 0, dark = 0, darkC = '#2A1408'}) => {
	const G = GRADES[grade], z = cam.z;
	const vx0 = cam.x - FW / 2 / z - 40, vy0 = cam.y - PIC_CY / z - 40, vw = FW / z + 80, vh = FH / z + 80;
	const tex = bg === 'plaster' || bg === 'papyrus' ? bg : null;
	const camT = `translate(${FW / 2},${PIC_CY}) scale(${z}) translate(${-cam.x},${-cam.y})`;
	const fl = G.flick ? G.flick * (0.5 + 0.5 * flick(t, flickSeed)) : 0;
	const screenTags = tags.map((g) => { const [sx, sy] = toScreen(cam, g.x, g.y); return {...g, x: sx, y: sy}; }).filter((g) => g.x > 30 && g.x < SAFE_R - 20);
	return <AbsoluteFill style={{background: ground ?? PAL.plaster, overflow: 'hidden'}}>
		{Object.values(TEX).map((p) => <Img key={p} src={staticFile(p)} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />)}
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0, filter: G.css}}>
			<defs>
				<pattern id="p60-plaster" patternUnits="userSpaceOnUse" width={2048} height={1024}><image href={staticFile(TEX.plaster)} width={2048} height={1024} /></pattern>
				<pattern id="p60-papyrus" patternUnits="userSpaceOnUse" width={2048} height={1024}><image href={staticFile(TEX.papyrus)} width={2048} height={1024} /></pattern>
				<pattern id="p60-wear" patternUnits="userSpaceOnUse" width={2048} height={1024} x={-300} y={-120}><image href={staticFile(TEX.wear)} width={2048} height={1024} /></pattern>
				<filter id="f60-wob" x="-2%" y="-2%" width="104%" height="104%" filterUnits="objectBoundingBox"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={wobble} xChannelSelector="R" yChannelSelector="G" /></filter>
				<radialGradient id="g60-vig" cx="0.47" cy="0.46" r="0.72"><stop offset="0.42" stopColor={G.vig} stopOpacity={0} /><stop offset="0.82" stopColor={G.vig} stopOpacity={G.vigO * 0.55} /><stop offset="1" stopColor={G.vig} stopOpacity={G.vigO} /></radialGradient>
				<GlowDefs />
			</defs>
			<rect width={FW} height={FH} fill={ground ?? (tex ? PAL.plaster : bg)} />
			<g transform={camT}>
				{tex && <rect x={vx0} y={vy0} width={vw} height={vh} fill={`url(#p60-${tex})`} />}
				<g filter={wobble > 0 ? 'url(#f60-wob)' : undefined}>{children}</g>
				{wear > 0 && <rect x={vx0} y={vy0} width={vw} height={vh} fill="url(#p60-wear)" opacity={wear} />}
				{stain > 0 && <rect x={vx0} y={vy0} width={vw} height={vh} fill={`url(#p60-${tex ?? 'plaster'})`} opacity={stain} style={{mixBlendMode: 'multiply'}} />}
				{G.haze > 0 && <rect x={vx0} y={vy0} width={vw} height={vh} fill="#F3E4C2" opacity={G.haze} />}
				{dark > 0 && <rect x={vx0} y={vy0} width={vw} height={vh} fill={darkC} opacity={dark} style={{mixBlendMode: 'multiply'}} />}
				{light}
			</g>
			{/* grade: tint, vignette, torch flicker, fixed grain */}
			<rect width={FW} height={FH} fill={G.tint} opacity={G.o} style={{mixBlendMode: G.mode}} />
			<rect width={FW} height={FH} fill="url(#g60-vig)" />
			{fl > 0 && <rect width={FW} height={FH} fill="#140800" opacity={fl} />}
			<image href={staticFile(TEX.grain)} width={FW} height={FH} opacity={G.grain} style={{mixBlendMode: 'multiply'}} />
			{G.dust && <image href={staticFile(TEX.dust)} width={FW} height={FH} opacity={G.dust} style={{mixBlendMode: 'screen'}} />}
			{screen}
		</svg>
		{frame && <Frame60 t={t} sub={sub} stamp={stamp} seal={seal} tags={screenTags} />}
	</AbsoluteFill>;
};

/* ---------------- shared wall furniture in world space ---------------- */
/** a register line (ink / blue / red stripes) across the world */
export const RegisterLine: React.FC<{x0: number; x1: number; y: number; h?: number}> = ({x0, x1, y, h = 16}) => <g>
	<rect x={x0} y={y} width={x1 - x0} height={h} fill={PAL.ink} /><rect x={x0} y={y + h * 0.18} width={x1 - x0} height={h * 0.3} fill={PAL.blue} /><rect x={x0} y={y + h * 0.56} width={x1 - x0} height={h * 0.28} fill={PAL.red} />
</g>;
/** the dado under the ground line: colour blocks */
export const Dado: React.FC<{x0: number; x1: number; y: number; h?: number}> = ({x0, x1, y, h = 80}) => { const n = Math.ceil((x1 - x0) / 46);
	return <g><RegisterLine x0={x0} x1={x1} y={y} h={18} />
		{Array.from({length: n}, (_, i) => <rect key={i} x={x0 + i * 46 + 3} y={y + 26} width={40} height={h - 34} fill={[PAL.blue, PAL.red, PAL.green, PAL.gold][i % 4]} stroke={PAL.ink} strokeWidth={1.6} opacity={0.88} />)}
		<rect x={x0} y={y + h - 4} width={x1 - x0} height={4} fill={PAL.ink} /></g>; };
/** khekher frieze (bundled-reed finials) across the world top, h px tall from y */
export const KhekherFrieze: React.FC<{x0: number; x1: number; y: number; h?: number}> = ({x0, x1, y, h = 52}) => { const w = 24, out: React.ReactNode[] = [];
	for (let i = 0, x = x0; x < x1; i++, x += w) { const cols = [[PAL.green, PAL.blue, PAL.red], [PAL.blue, PAL.red, PAL.green], [PAL.red, PAL.green, PAL.blue]][i % 3], k = h / 58;
		out.push(<g key={i}>
			<path d={sp([[x + 3, y + h, 1], [x + 3, y + 20 * k], [x + 6, y + 15 * k, 1], [x + w - 6, y + 15 * k, 1], [x + w - 3, y + 20 * k], [x + w - 3, y + h, 1]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} strokeLinejoin="round" />
			<rect x={x + 3} y={y + 19 * k} width={w - 6} height={11 * k} fill={cols[0]} stroke={PAL.ink} strokeWidth={1.2} />
			<rect x={x + 3} y={y + 33 * k} width={w - 6} height={9 * k} fill={cols[1]} stroke={PAL.ink} strokeWidth={1.2} />
			<rect x={x + 3} y={y + 45 * k} width={w - 6} height={6 * k} fill={cols[2]} stroke={PAL.ink} strokeWidth={1.2} />
			<path d={`M${x + 7} ${y + 15 * k}L${x + w / 2 - 2} ${y + 9 * k}L${x + w / 2 + 2} ${y + 9 * k}L${x + w - 7} ${y + 15 * k}Z`} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1.5} strokeLinejoin="round" />
			<circle cx={x + w / 2} cy={y + 6 * k} r={4.4 * k} fill={cols[2]} stroke={PAL.ink} strokeWidth={1.5} /></g>); }
	return <g>{out}<rect x={x0} y={y + h} width={x1 - x0} height={4} fill={PAL.ink} /></g>; };
