/* ep60 act C · the twist (shots 34–40): the heart scarab flares on the chest, flips to show Spell 30B, the heart on the scale is hushed
   by the spell, Ani mutters it on his own papyrus and winks, the Met's re-named scarab (Hatnefer). Times: t = s since the shot start. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {God, CAST, Cast, Pose, POSES, solve, wristTo, reach} from './rig60';
import {GLYPH_D, featherD} from './props60';
import {Stage60, KhekherFrieze, RegisterLine, Dado, Glow, Dust, Stars, Shaft, rng, flick, F_SERIF, FW, FH, PIC_T, PIC_B} from './frame60';
import {CAST2, tutuPose} from './cast60';
import {STILL, LAY, S as S1920, aniPose, anubisPose, WState} from './scene60';
import {W43} from './scene43';
import {wobIn, camE, eOut, wearZ, bump, EyeFx, BalanceC, ctxC, SolidC, Sparkle, AdoreArms, ArmOver} from './act60c_common';
import {PAL, sp, poly, lerp, sm, cl, seg, ap, V} from './geo60';
import type {ShotProps} from './EP60';

/* ======================= the heart scarab, own copy: a turn, per-line lit inscription, an optional patch ======================= */
export const OVAL = sp([[0, -4.75], [2.25, -4.25], [3.25, -2.4], [3.62, 0.2], [3.35, 2.8], [2.05, 4.35], [0, 4.8], [-2.05, 4.35], [-3.35, 2.8], [-3.62, 0.2], [-3.25, -2.4], [-2.25, -4.25]], true, 0.2);
const GK = Object.keys(GLYPH_D);
export type Row = {y: number; glyphs: {x: number; k: string}[]};
/** the inscription layout (units): rows of glyphs across the oval */
export const scarabRows = (rows: number, cell: number, y0: number, gap: number, seed: number): Row[] => {
	const R = rng(seed), out: Row[] = [];
	for (let j = 0; j < rows; j++) { const g: Row['glyphs'] = [];
		for (let x = -3.3; x < 3.4 - cell * 0.8; x += cell * (0.84 + R() * 0.3)) g.push({x, k: GK[Math.floor(R() * GK.length)]});
		out.push({y: y0 + j * cell * gap, glyphs: g}); }
	return out;
};
export const ScarabC: React.FC<{x: number; y: number; s: number; flip?: number; rot?: number; t?: number; id: string; rows?: Row[]; cell?: number; lit?: number[]; glint?: number; sheen?: number;
	hide?: (j: number, gx: number) => boolean; extra?: React.ReactNode; ink?: string}> = ({x, y, s, flip = 0, rot = 0, t = 0, id, rows = [], cell = 0.95, lit = [], glint = 0, sheen = -1, hide, extra, ink = '#10241A'}) => {
	const kx = Math.abs(Math.cos(flip * Math.PI)), base = flip > 0.5, c = ctxC(s);
	const clyp = sp([[-2.0, -3.3, 1], [-1.4, -4.25], [0, -4.72], [1.4, -4.25], [2.0, -3.3, 1], [1.0, -3.05], [-1.0, -3.05]], true, 0.2);
	const prono = sp([[-3.25, -1.05, 1], [-2.85, -2.6], [-2.0, -3.3, 1], [-1.0, -3.05], [1.0, -3.05], [2.0, -3.3, 1], [2.85, -2.6], [3.25, -1.05, 1], [0, -0.8]], true, 0.2);
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * Math.max(0.04, kx)},${s})`}>
		<defs>
			<radialGradient id={`${id}-g`} cx="0.4" cy="0.36" r="0.72"><stop offset="0" stopColor={base ? '#6DBA88' : '#8EDCA2'} /><stop offset="0.5" stopColor="#2F9160" /><stop offset="1" stopColor="#144A2E" /></radialGradient>
			<clipPath id={`${id}-c`}><path d={OVAL} /></clipPath>
		</defs>
		<path d={OVAL} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2.4} />
		<path d={OVAL} fill={`url(#${id}-g)`} />
		{!base ? <g>
			<path d={clyp} fill="#2E5E43" stroke={PAL.ink} strokeWidth={c.LW * 2} strokeLinejoin="round" />
			{[-1.3, -0.65, 0, 0.65, 1.3].map((xx) => <path key={xx} d={`M${xx - 0.24} ${-4.42 + Math.abs(xx) * 0.22}L${xx} ${-4.95 + Math.abs(xx) * 0.24}L${xx + 0.24} ${-4.42 + Math.abs(xx) * 0.22}Z`} fill="#2E5E43" stroke={PAL.ink} strokeWidth={c.LW * 1.2} strokeLinejoin="round" />)}
			{[-1, 1].map((sg) => <ellipse key={sg} cx={sg * 1.75} cy={-3.15} rx={0.32} ry={0.22} fill="#173323" stroke={PAL.ink} strokeWidth={c.LW} />)}
			<path d={prono} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 2.2} strokeLinejoin="round" />
			<path d="M-3.1 -0.85Q0 -0.5 3.1 -0.85" fill="none" stroke="#8CC49A" strokeWidth={c.LW * 1.4} opacity={0.6} />
			<path d="M0 -0.78L0 4.72" stroke={PAL.ink} strokeWidth={c.LW * 2.2} /><path d="M0.12 -0.6L0.12 4.6" stroke="#8CC49A" strokeWidth={c.LW} opacity={0.5} />
			{[-1, 1].map((sg) => <path key={sg} d={`M${sg * 0.18} -0.75L${sg * 0.55} -0.2L${sg * 0.18} 0.25`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} />)}
			{[-1, 1].map((sg) => <path key={'e' + sg} d={`M${sg * 0.35} 4.55Q${sg * 2.8} 3.6 ${sg * 3.25} 0.2`} fill="none" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.5} />)}
			<path d="M-2.4 -2.4Q-1.0 -3.0 0.4 -2.6" fill="none" stroke="#E8FFF0" strokeWidth={c.LW * 3} opacity={0.5} strokeLinecap="round" />
			<path d="M-2.5 0.4Q-2.5 2.4 -1.2 3.6" fill="none" stroke="#E8FFF0" strokeWidth={c.LW * 4.5} opacity={0.35} strokeLinecap="round" />
		</g> : <g clipPath={`url(#${id}-c)`}>
			{rows.map((r, j) => <line key={'l' + j} x1={-4} x2={4} y1={r.y - 0.08} y2={r.y - 0.08} stroke={ink} strokeWidth={c.LW * 1.2} opacity={0.5} />)}
			{rows.map((r, j) => { const a = cl(lit[j] ?? 0);
				return <g key={j}>
					{a > 0 && <ellipse cx={0} cy={r.y + cell * 0.5} rx={4} ry={cell * 0.75} fill="url(#g60-gold)" opacity={0.75 * a} style={{mixBlendMode: 'screen'}} />}
					{r.glyphs.map((g, i) => hide && hide(j, g.x) ? null : <g key={i} transform={`translate(${g.x},${r.y}) scale(${cell})`}>
						<path d={GLYPH_D[g.k].d} fill={ink} />
						{a > 0 && <path d={GLYPH_D[g.k].d} fill="#FFE07A" opacity={a} />}
					</g>)}
				</g>; })}
			{extra}
			<path d={OVAL} fill="none" stroke="#8CC49A" strokeWidth={c.LW * 1.4} opacity={0.5} transform="scale(0.94)" />
		</g>}
		{sheen >= 0 && sheen <= 1 && <g clipPath={`url(#${id}-c)`} style={{mixBlendMode: 'screen'}}><path d={poly([[-6 + 12 * sheen, -6], [-4.6 + 12 * sheen, -6], [-7.6 + 12 * sheen, 6], [-9 + 12 * sheen, 6]])} fill="#FFFFFF" opacity={0.55} /></g>}
		<path d={OVAL} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 5.6} />
		<path d={OVAL} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3.8} />
		<path d={OVAL} fill="none" stroke={PAL.goldHi} strokeWidth={c.LW * 1.0} opacity={0.8} />
		{glint > 0 && <g style={{mixBlendMode: 'screen'}} opacity={glint}><ellipse cx={-1.6 + 0.8 * Math.sin(t * 0.7)} cy={-2.0} rx={1.5} ry={0.7} fill="url(#g60-white)" /><circle cx={2.3} cy={-3.0 + 0.3 * Math.sin(t)} r={0.6} fill="url(#g60-white)" /></g>}
	</g>;
};
/** a fingertip (flat style): a capsule from the tip running off at angle ang (deg, 0 = +x), with its nail */
const Finger: React.FC<{tip: V; ang: number; w: number; len: number; thumb?: boolean}> = ({tip, ang, w, len, thumb}) => {
	const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, r = w / 2;
	const c: V = [tip[0] + ux * r * (thumb ? -1 : -1) * -1, tip[1] + uy * r];
	const c0: V = [tip[0] + ux * r, tip[1] + uy * r], e: V = [c0[0] + ux * len, c0[1] + uy * len];
	const d = `M${c0[0] + nx * r} ${c0[1] + ny * r}L${e[0] + nx * r} ${e[1] + ny * r}L${e[0] - nx * r} ${e[1] - ny * r}L${c0[0] - nx * r} ${c0[1] - ny * r}A${r} ${r} 0 0 1 ${c0[0] + nx * r} ${c0[1] + ny * r}Z`;
	const side = thumb ? 1 : -1, nb: V = [c0[0] + ux * r * 0.15 + nx * r * 0.3 * side, c0[1] + uy * r * 0.15 + ny * r * 0.3 * side];
	return <g>
		<path d={d} fill="#C9744A" stroke={PAL.ink} strokeWidth={3.5} strokeLinejoin="round" />
		<ellipse cx={nb[0]} cy={nb[1]} rx={r * 0.62} ry={r * 0.4} transform={`rotate(${ang} ${nb[0]} ${nb[1]})`} fill="#ECBDA2" stroke={PAL.ink} strokeWidth={2} />
		{[1.6, 2.0].map((k) => { const p: V = [c0[0] + ux * r * k * 1.6, c0[1] + uy * r * k * 1.6]; return <path key={k} d={`M${p[0] + nx * r * 0.55} ${p[1] + ny * r * 0.55}Q${p[0] + ux * 6} ${p[1] + uy * 6} ${p[0] - nx * r * 0.55} ${p[1] - ny * r * 0.55}`} fill="none" stroke="#8A4428" strokeWidth={2.4} opacity={0.7} />; })}
		{c && null}
	</g>;
};
/** rays from a point (screen), rotating */
const Rays: React.FC<{x: number; y: number; r0: number; r1: number; n: number; a0: number; o: number; w?: number; c?: string}> = ({x, y, r0, r1, n, a0, o, w = 2.6, c = '#FFE7A0'}) => o <= 0 ? null : <g style={{mixBlendMode: 'screen'}} opacity={o}>
	{Array.from({length: n}, (_, i) => { const a = (a0 + (i * 360) / n) * Math.PI / 180, da = (w * Math.PI / 180) * (i % 2 ? 0.6 : 1), L = i % 2 ? r1 * 0.72 : r1;
		return <path key={i} d={poly([[x + Math.cos(a - da) * r0, y + Math.sin(a - da) * r0], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.cos(a + da) * r0, y + Math.sin(a + da) * r0]])} fill={c} opacity={0.5} />; })}
</g>;

/* ======================= 34 · 「等等——你胸口那只[甲虫]！」 the scarab on the chest flares green-gold ======================= */
const ChestLinen: React.FC = () => {
	const wraps: React.ReactNode[] = [];
	for (let i = -14; i < 44; i++) { const x0 = -400 + i * 52; wraps.push(<path key={'a' + i} d={`M${x0} -60L${x0 + 620} 1100`} stroke="#C9B88E" strokeWidth={16} opacity={0.6} />, <path key={'b' + i} d={`M${x0 + 620} -60L${x0} 1100`} stroke="#F2E9D2" strokeWidth={10} opacity={0.55} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 20; i++) for (let j = 0; j < 10; j++) { const bx = -120 + i * 90 + (j % 2) * 45, by = 300 + j * 64;
		net.push(<g key={`${i}.${j}`}><path d={poly([[bx, by - 30], [bx + 42, by], [bx, by + 30], [bx - 42, by]])} fill="none" stroke="#3FA6A0" strokeWidth={6} opacity={0.5} />
			<circle cx={bx} cy={by - 30} r={6} fill={j % 2 ? PAL.gold : PAL.red} stroke={PAL.ink} strokeWidth={1.4} /></g>); }
	return <g>
		<rect x={-400} y={-100} width={2300} height={1300} fill="#E6D7B2" />
		{wraps}
		{[[PAL.gold, 0], [PAL.blue, 26], [PAL.red, 54], [PAL.green, 80], [PAL.gold, 108]].map(([c, o], i) => <path key={i} d={`M-400 ${40 + (o as number)}Q720 ${270 + (o as number)} 1900 ${40 + (o as number)}L1900 ${68 + (o as number)}Q720 ${298 + (o as number)} -400 ${68 + (o as number)}Z`} fill={c as string} stroke={PAL.ink} strokeWidth={2} opacity={0.92} />)}
		{net}
	</g>;
};
export const T34 = {shine: 1.0};
/** the mummy's chest from above at the scarab's true scale (Met 36.3.2 is 6.6 × 5.3 cm: about a sixth of the chest's width):
    the gold mask's chin and beard at the top, the striped lappets, the broad collar, the wrapped chest with its bead net */
export const SC34 = {x: 720, y: 606, s: 22.5};
const ChestTop: React.FC<{id: string}> = ({id}) => {
	const body = 'M150 1100L170 330Q190 150 380 110L1060 110Q1250 150 1270 330L1290 1100Z';
	const wraps: React.ReactNode[] = [];
	for (let i = -20; i < 60; i++) { const x0 = -300 + i * 30; wraps.push(<path key={'a' + i} d={`M${x0} 100L${x0 + 560} 1100`} stroke="#C9B88E" strokeWidth={9} opacity={0.6} />, <path key={'b' + i} d={`M${x0 + 560} 100L${x0} 1100`} stroke="#F2E9D2" strokeWidth={6} opacity={0.55} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 26; i++) for (let j = 0; j < 12; j++) { const bx = 160 + i * 46 + (j % 2) * 23, by = 470 + j * 34;
		net.push(<g key={`${i}.${j}`}><path d={poly([[bx, by - 15], [bx + 22, by], [bx, by + 15], [bx - 22, by]])} fill="none" stroke="#3FA6A0" strokeWidth={3.2} opacity={0.55} />
			<circle cx={bx} cy={by - 15} r={3.6} fill={j % 2 ? PAL.gold : PAL.red} stroke={PAL.ink} strokeWidth={1} /></g>); }
	const collar: [number, number, string][] = [[150, 178, PAL.gold], [178, 226, PAL.blue], [226, 244, PAL.gold], [244, 292, PAL.red], [292, 308, PAL.gold], [308, 352, PAL.turq], [352, 368, PAL.gold]];
	const arc = (r0: number, r1: number) => { const pts: string[] = [];
		for (let i = 0; i <= 40; i++) { const a = Math.PI * i / 40; pts.push(`${720 + r1 * Math.cos(a)} ${70 + r1 * Math.sin(a) * 1.12}`); }
		for (let i = 40; i >= 0; i--) { const a = Math.PI * i / 40; pts.push(`${720 + r0 * Math.cos(a)} ${70 + r0 * Math.sin(a) * 1.12}`); }
		return 'M' + pts.join('L') + 'Z'; };
	return <g>
		<rect x={-400} y={-100} width={2300} height={1300} fill="#0E1638" />
		<defs><clipPath id={`${id}-b`}><path d={body} /></clipPath></defs>
		<path d={body} fill="#E6D7B2" stroke={PAL.ink} strokeWidth={4} />
		<g clipPath={`url(#${id}-b)`}>{wraps}{net}</g>
		{/* the broad collar, its drop beads */}
		{Array.from({length: 23}, (_, i) => { const a = Math.PI * (i + 0.5) / 23, x = 720 + 380 * Math.cos(a), y = 70 + 380 * Math.sin(a) * 1.12;
			return <ellipse key={i} cx={x} cy={y} rx={9} ry={15} transform={`rotate(${a * 180 / Math.PI - 90} ${x} ${y})`} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={1.6} />; })}
		<path d={arc(146, 372)} fill={PAL.ink} />
		{collar.map(([r0, r1, c], i) => <path key={i} d={arc(r0, r1)} fill={c} stroke={PAL.ink} strokeWidth={1.4} />)}
		{/* the headcloth's lappets over the collar and the gold mask's chin with its beard */}
		{[470, 880].map((x) => <g key={x}><path d={poly([[x, 20], [x + 90, 20], [x + 84, 300], [x + 6, 300]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} />
			{Array.from({length: 9}, (_, i) => <rect key={i} x={x + 4} y={34 + i * 30} width={82} height={13} fill={PAL.blue} />)}</g>)}
		<ellipse cx={720} cy={36} rx={150} ry={96} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3.5} />
		<path d="M640 70Q720 112 800 70" fill="none" stroke={PAL.gold2} strokeWidth={4} />
		<path d={poly([[696, 112], [744, 112], [740, 236], [700, 236]])} fill={PAL.blue} stroke={PAL.ink} strokeWidth={3} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M697 ${130 + i * 28}L743 ${138 + i * 28}`} stroke={PAL.gold} strokeWidth={6} />)}
		<path d="M700 236Q720 262 740 236" fill={PAL.blue} stroke={PAL.ink} strokeWidth={3} />
	</g>;
};
const S34: React.FC<ShotProps> = ({t}) => {
	const {x: SX, y: SY, s} = SC34, sh = bump(t, T34.shine - 0.16, T34.shine + 0.34), shP = Math.pow(sh, 1.5);
	// hold on the whole chest (the amulet at its real size), then push in through the flare and the shine
	const cam = camE(t, 0.3, 2.65, [720, 486, 1.0], [720, 590, 2.2]);
	const flare = t < 0 ? 0 : Math.exp(-t / 0.45), ring = cl(t / 0.7), hum = sm(cl((t - 0.05) / 2.3));
	const rot = -6 * (1 - eOut((t + 0.3) / 1.7)), turn = 0.1 * bump(t, 0.55, 1.45);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0E1638" wear={wearZ(cam.z, 0.7)} stain={0.3} wobble={wobIn(t)} tags={[{x: 560, y: 520, text: '心脏圣甲虫', o: sm((t - 0.4) / 0.3)}]}
		light={<>
			<g style={{mixBlendMode: 'screen'}} opacity={0.35 + 0.55 * hum}>{[34, 20, 9].map((w, i) => <path key={i} d={OVAL} transform={`translate(${SX},${SY}) rotate(${rot}) scale(${s * (1.05 + w / 400)})`} fill="none" stroke={i ? '#FFE08A' : '#BFF2A0'} strokeWidth={w / s} opacity={[0.25, 0.4, 0.8][i]} />)}</g>
			{t >= 0 && ring < 1 && <g style={{mixBlendMode: 'screen'}} opacity={1 - ring}><ellipse cx={SX} cy={SY} rx={110 + 300 * eOut(ring)} ry={130 + 300 * eOut(ring)} fill="none" stroke="#FFE7A0" strokeWidth={8} />
				<ellipse cx={SX} cy={SY} rx={110 + 300 * eOut(ring)} ry={130 + 300 * eOut(ring)} fill="none" stroke="#FFD060" strokeWidth={26} opacity={0.35} /></g>}
			<Dust t={t} box={[420, 380, 1020, 860]} n={36} seed={34} c="#FFE7A0" o={0.75} vx={-3} vy={-5} r={1.8} />
			{/* THE shine: a star flashes on the beetle's shoulder as the sheen crosses it */}
			<Sparkle x={SX - 1.75 * s} y={SY - 2.8 * s} r={3.8 * s * shP} rot={15 + 30 * t} c="#FFFFFF" />
			<Sparkle x={SX - 1.75 * s} y={SY - 2.8 * s} r={1.8 * s * shP} rot={60 + 30 * t} c="#FFF6C8" />
		</>}
		screen={<rect width={FW} height={FH} fill="#FFF6DE" opacity={0.22 * flare + 0.1 * shP} style={{mixBlendMode: 'screen'}} />}>
		<ChestTop id="c34c" />
		<rect x={150} y={110} width={1140} height={1000} fill="#0B1438" opacity={0.35 + 0.15 * hum} />
		<Glow x={SX} y={SY} r={200 + 90 * hum} c="green" o={0.4 + 0.35 * hum} />
		<Glow x={SX} y={SY} r={150 + 40 * hum} c="gold" o={0.35 + 0.4 * hum + 0.5 * flare} />
		<Rays x={SX} y={SY} r0={100} r1={280 + 80 * hum} n={18} a0={t * 9} o={0.4 * hum + 0.5 * flare} w={2.2} />
		<ScarabC id="c34s" x={SX} y={SY} s={s} flip={turn} rot={rot} t={t} glint={0.7 + 0.3 * hum} sheen={(t - T34.shine + 0.18) / 0.4} />
	</Stage60>;
};

/* ======================= 35 · 「背面的咒语，专防心[告密]：」 lifted into the dark, it flips; the lines light up one by one ======================= */
export const ROWS35 = scarabRows(6, 1.02, -3.95, 1.24, 35);
export const T35 = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25];
const S35: React.FC<ShotProps> = ({t}) => {
	const SX = 720, SY = 486, s = 44;
	const lift = sm(seg(t, 0.0, 0.4)), flip = sm(seg(t, 0.3, 0.85)), land = t > 0.85 ? Math.exp(-(t - 0.85) / 0.12) * Math.sin((t - 0.85) * 30) : 0;
	const lit = T35.map((a) => cl((t - a) / 0.12));
	const nlit = lit.reduce((a, b) => a + b, 0) / T35.length;
	const cam = camE(t, -0.3, 2.9, [720, 486, 1.0], [720, 474, 1.1]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#111A45" wear={0.3} stain={0.28} wobble={wobIn(t)}
		light={<>
			<Glow x={SX} y={SY} r={520} c="green" o={0.45} />
			<Glow x={SX} y={SY} r={330} c="gold" o={0.3 + 0.45 * nlit} />
			{lit.map((a, j) => a > 0 && a < 1 ? <Sparkle key={j} x={SX + 150} y={SY - 4.0 * s + j * 1.02 * 1.24 * s + 22} r={36 * Math.sin(Math.PI * a)} rot={45 * a} /> : null)}
			<Dust t={t} box={[200, 80, 1250, 900]} n={50} seed={35} c="#FFE7A0" o={0.7} vx={4} vy={-7} r={2.2} />
		</>}>
		{/* the same chest as in 34, magnified about the amulet: the bead net and the linen keep the true scale */}
		<g transform={`translate(${SX},${SY}) scale(${s / SC34.s}) translate(${-SC34.x},${-SC34.y})`}><ChestTop id="c35c" /></g>
		<rect x={-300} y={-100} width={2100} height={1300} fill="#0B1438" opacity={0.55} />
		<Rays x={SX} y={SY} r0={200} r1={620} n={14} a0={-t * 6} o={0.32 + 0.25 * nlit} w={3.2} />
		<ellipse cx={SX + 30 * lift} cy={SY + 250} rx={190 * (1 - 0.3 * lift)} ry={34} fill="#000" opacity={0.25 * (1 - lift * 0.5)} />
		<ScarabC id="c35s" x={SX} y={SY - 26 * lift + 6 * land} s={s * (1 + 0.07 * lift)} flip={flip} rot={0} t={t} rows={ROWS35} cell={1.02} lit={lit} glint={flip < 0.5 ? 0.8 : 0.3} />
		{/* a thumb and a forefinger hold it by its two ends and turn it (it is egg-sized: 6.6 × 5.3 cm) */}
		{(() => { const ss = s * (1 + 0.07 * lift), cy = SY - 26 * lift + 6 * land, fin = eOut(seg(t, -0.35, 0.1)), off = (1 - fin) * 360;
			return <g transform={`translate(${off},${off * 0.4})`}>
				<Finger tip={[SX + 0.2 * ss, cy - 4.95 * ss]} ang={-38} w={2.3 * ss} len={700} />
				<Finger tip={[SX + 0.2 * ss, cy + 5.0 * ss]} ang={36} w={2.7 * ss} len={700} thumb />
			</g>; })()}
	</Stage60>;
};

/* ======================= 36 · 「“心啊，别站出来[指控]我！”」 the heart on the pan opens its lid to speak; the spell ribbon hushes it ======================= */
const HEART = sp([[-0.42, 0, 1], [0.42, 0, 1], [0.7, -0.35], [0.78, -0.95], [0.6, -1.32], [0.4, -1.42], [0.48, -1.62], [0.32, -1.78], [0.18, -1.6], [-0.18, -1.6], [-0.32, -1.78], [-0.48, -1.62], [-0.4, -1.42], [-0.6, -1.32], [-0.78, -0.95], [-0.7, -0.35]], true, 0.16);
const HY = -1.37;
/** the papyri's jar-shaped heart as a little character (units, base at y = 0): open = lid lifted like a mouth; ribbon 0..1 = the spell
    band wrapping it twice; hush 0..1 = the innocent smile after the click */
const TalkHeart: React.FC<{s: number; open: number; ribbon: number; hush: number; t: number; id: string}> = ({s, open, ribbon, hush, t, id}) => {
	const c = ctxC(s);
	const band = (k: number, front: boolean) => {
		const yc = -0.42 - 0.52 * k, tilt = (k ? 9 : -11) * Math.PI / 180, rx = 1.0, ry = 0.24, r = cl(ribbon * 2 - k), th0 = Math.PI * 0.85 + k * 1.3;
		if (r <= 0) return null;
		const pts: V[][] = [[]]; const N = 64;
		for (let i = 0; i <= N * r; i++) { const th = th0 + (i / N) * Math.PI * 2, ex = rx * Math.cos(th), ey = ry * Math.sin(th);
			const p: V = [ex * Math.cos(tilt) - ey * Math.sin(tilt), yc + ex * Math.sin(tilt) + ey * Math.cos(tilt)], isF = Math.sin(th) > 0;
			if (isF === front) pts[pts.length - 1].push(p); else if (pts[pts.length - 1].length) pts.push([]); }
		const glyphs: React.ReactNode[] = [];
		if (front) for (let i = 0; i < 7; i++) { const th = Math.PI * (0.12 + i * 0.12), u = ((th - th0) / (Math.PI * 2) + 2) % 1; if (u > r) continue;
			const ex = rx * Math.cos(th), ey = ry * Math.sin(th), p: V = [ex * Math.cos(tilt) - ey * Math.sin(tilt), yc + ex * Math.sin(tilt) + ey * Math.cos(tilt)];
			glyphs.push(<path key={i} d={GLYPH_D[GK[(i * 5 + k * 3) % GK.length]].d} fill={PAL.ink} transform={`translate(${p[0] - 0.08},${p[1] - 0.09}) scale(0.17)`} />); }
		return <g key={`${k}${front}`}>{pts.filter((q) => q.length > 1).map((q, i) => { const d = q.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join('');
			return <g key={i}><path d={d} fill="none" stroke={PAL.ink} strokeWidth={0.2} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke="#F3C64E" strokeWidth={0.14} strokeLinecap="round" strokeLinejoin="round" /></g>; })}{glyphs}</g>;
	};
	const lidA = -20 * open, look = hush;
	const eye = (sg: number) => { const ex = sg * 0.27, ey = -0.82;
		return <g key={sg}>
			<ellipse cx={ex} cy={ey} rx={0.13} ry={0.17 - 0.03 * (1 - hush) * open} fill="#FFF8EC" stroke={PAL.ink} strokeWidth={c.LW * 1.1} />
			<circle cx={ex + 0.02 - 0.03 * look} cy={ey - 0.02 - 0.06 * look} r={0.075} fill={PAL.ink} />
			<circle cx={ex + 0.04 - 0.03 * look} cy={ey - 0.05 - 0.06 * look} r={0.026} fill="#FFFFFF" />
			{/* brows: determined (slanted in) while speaking, raised and soft when hushed */}
			<path d={`M${ex - 0.13} ${ey - 0.26 + sg * 0.05 * (1 - hush) - 0.04 * hush}Q${ex} ${ey - 0.31 - 0.04 * hush} ${ex + 0.13} ${ey - 0.26 - sg * 0.05 * (1 - hush) - 0.04 * hush}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} strokeLinecap="round" />
		</g>; };
	const puffs = [0, 1].map((k) => { const u = cl((open - 0.55 - k * 0.2) / 0.45) * (1 - ribbon); if (u <= 0) return null;
		return <g key={k} transform={`translate(${-0.05 + k * 0.32},${-1.75 - u * 0.75 - k * 0.15}) scale(0.34)`} opacity={u}><path d={GLYPH_D[k ? 'mouth' : 'eye'].d} fill="#FFD86A" stroke={PAL.ink} strokeWidth={0.06} transform="translate(-0.5,-0.5)" /></g>; });
	return <g>
		<defs><clipPath id={`${id}-b`}><rect x={-2} y={HY} width={4} height={3} /></clipPath><clipPath id={`${id}-l`}><rect x={-2} y={-3} width={4} height={3 + HY} /></clipPath></defs>
		{band(0, false)}{band(1, false)}
		<g clipPath={`url(#${id}-b)`}><SolidC d={HEART} r="red" c={c} />
			<path d="M-0.5 -0.45Q0 -0.3 0.5 -0.45" fill="none" stroke={PAL.red2} strokeWidth={c.LW * 1.6} />
			<path d="M-0.58 -1.12Q-0.66 -0.7 -0.44 -0.32" fill="none" stroke="#E87A62" strokeWidth={c.LW * 3} strokeLinecap="round" /></g>
		{open > 0.02 && <ellipse cx={0} cy={HY} rx={0.5} ry={0.03 + 0.14 * open} fill="#3A0604" stroke={PAL.ink} strokeWidth={c.LW} />}
		<path d={`M-0.56 ${HY}L0.56 ${HY}`} stroke={PAL.ink} strokeWidth={c.LW * 1.4} />
		<g transform={`translate(0,${-0.04 * open}) rotate(${lidA} -0.5 ${HY})`}><g clipPath={`url(#${id}-l)`}><SolidC d={HEART} r="red" c={c} />
			<path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.6} /></g>
			<path d={`M-0.5 ${HY - 0.035}L0.5 ${HY - 0.035}`} stroke={PAL.ink} strokeWidth={0.1} strokeLinecap="round" />
			<path d={`M-0.48 ${HY - 0.035}L0.48 ${HY - 0.035}`} stroke={PAL.gold} strokeWidth={0.055} strokeLinecap="round" /></g>
		<circle cx={-0.5} cy={HY - 0.02} r={0.055} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		{eye(-1)}{eye(1)}
		{open > 0.05 && hush < 1 && <ellipse cx={0} cy={-0.47} rx={0.1 + 0.03 * open} ry={0.03 + 0.11 * open * (1 - hush)} fill="#3A0604" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />}
		{hush > 0 && <g opacity={hush}><path d="M-0.17 -0.5Q0 -0.36 0.17 -0.5" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} strokeLinecap="round" />
			{[-1, 1].map((sg) => <ellipse key={sg} cx={sg * 0.45} cy={-0.56} rx={0.1} ry={0.055} fill="#FF9A8A" opacity={0.7} />)}</g>}
		{band(0, true)}{band(1, true)}
		{puffs}
		{ribbon > 0 && ribbon < 1 && <circle cx={Math.cos(Math.PI * 0.85 + ribbon * 4 * Math.PI) * 1.0} cy={-0.42 - (ribbon > 0.5 ? 0.52 : 0) + 0.24 * Math.sin(Math.PI * 0.85 + ribbon * 4 * Math.PI)} r={0.12} fill="url(#g60-white)" />}
		{t < -99 && null}
	</g>;
};
const S36: React.FC<ShotProps> = ({t}) => {
	const s = 180, panX = 640, panY = 700, bx = panX + 8.6 * s, by = panY + 13.4 * s;
	const open = sm(seg(t, 0.12, 0.62)) * (1 - sm(seg(t, 1.42, 1.5)));
	const ribbon = sm(seg(t, 0.78, 1.42)), hush = sm(seg(t, 1.55, 1.8)), click = t > 1.48 ? Math.exp(-(t - 1.48) / 0.08) : 0;
	const sw = 1.1 * Math.sin(t * 1.7) + 0.6 * click;
	const cam = camE(t, -0.3, 2.9, [700, 500, 1.0], [680, 486, 1.07]);
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#16214F" wear={0.3} stain={0.3} wobble={wobIn(t)}
		light={<>
			{hush > 0 && <Sparkle x={panX + 160} y={panY - 300} r={42 * bump(t, 1.6, 2.2)} rot={20} />}
			<Dust t={t} box={[0, 60, 1300, 900]} n={36} seed={36} c="#FFE7A0" o={0.6} vx={3} vy={-6} r={3.4} />
		</>}>
		<rect x={-300} y={-100} width={2100} height={1300} fill="#16214F" />
		<Stars t={t} box={[-100, 40, 1550, 520]} n={80} seed={36} o={0.8} />
		{/* the far hall: two columns, out of focus */}
		<circle cx={panX} cy={panY - 170} r={520} fill="url(#g60-gold)" opacity={0.35 + 0.25 * ribbon} />
		<g opacity={0.35}>{[110, 1180].map((cx) => <g key={cx}><rect x={cx - 40} y={60} width={80} height={900} fill="#25347A" /><rect x={cx - 40} y={230} width={80} height={12} fill={PAL.gold} /></g>)}</g>
		<BalanceC p={{tilt: 0.4 * Math.sin(t * 1.3), swingL: sw, swingR: -sw}} x={bx} y={by} s={s} t={t} heart={<TalkHeart s={s} open={open} ribbon={ribbon} hush={hush} t={t} id="c36h" />} />
	</Stage60>;
};

/* ======================= 37 · 「阿尼称心时，嘴里正念着[这段咒]。」 the real Ani vignette: Ani and Tutu bow; the text above him lights up ======================= */
/** columns of hieroglyphs between ruled lines; lit (columns, float, read from the right) turns them gold with a running gold rule */
export const TextCols: React.FC<{x: number; y: number; cols: number; rows: number; cell: number; seed: number; lit: number; ink?: string; rule?: string}> = ({x, y, cols, rows, cell, seed, lit, ink = '#2A1912', rule = PAL.ink}) => {
	const R = rng(seed), out: React.ReactNode[] = [], H = rows * cell * 1.08;
	for (let i = 0; i < cols; i++) { const order = cols - 1 - i, a = cl(lit - order), cx = x + i * cell * 1.25;
		out.push(<line key={'r' + i} x1={cx - cell * 0.06} x2={cx - cell * 0.06} y1={y - cell * 0.1} y2={y + H} stroke={rule} strokeWidth={1.4} opacity={0.8} />);
		if (a > 0) out.push(<rect key={'u' + i} x={cx - cell * 0.12} y={y - cell * 0.1} width={cell * 0.13} height={(H + cell * 0.1) * a} fill="#F3C64E" stroke={PAL.ink} strokeWidth={0.8} />);
		for (let j = 0; j < rows; j++) { const g = GLYPH_D[GK[Math.floor(R() * GK.length)]], on = cl((a * rows - j) * 1.5);
			out.push(<g key={`${i}.${j}`} transform={`translate(${cx + cell * 0.12},${y + j * cell * 1.08}) scale(${cell})`}><path d={g.d} fill={ink} />{on > 0 && <path d={g.d} fill="#E9A92A" opacity={on} />}</g>); } }
	out.push(<line key="rend" x1={x + cols * cell * 1.25 - cell * 0.06} x2={x + cols * cell * 1.25 - cell * 0.06} y1={y - cell * 0.1} y2={y + H} stroke={rule} strokeWidth={1.4} opacity={0.8} />);
	return <g>{out}</g>;
};
const st37 = (t: number): WState => ({...STILL, tilt: 2.2 + 0.4 * Math.sin(t * 1.1), swingL: 0.5 * Math.sin(t * 1.4), swingR: -0.4 * Math.sin(t * 1.4), plumb: -0.6 + 0.8 * Math.sin(t * 1.6),
	ani: {lean: 7 + 0.6 * Math.sin(t * 1.4), head: 3 + 0.8 * Math.sin(t * 1.1)}, anubis: {lean: 5 + 0.6 * Math.sin(t * 1.3), head: -3}});
const ANUBIS: Cast = {...CAST.anubis, bHand: 'open', fHand: 'open', bProp: 'none', fProp: 'none'};
/** whisper wisps rising from a point toward a target (gold curls) */
const Wisps: React.FC<{from: V; via: V; to: V; t: number; o: number; n?: number}> = ({from, via, to, t, o, n = 3}) => o <= 0 ? null : <g>
	{Array.from({length: n}, (_, k) => { const u0 = ((t * 0.75 + k / n) % 1), pts: string[] = [];
		for (let i = 0; i <= 14; i++) { const u = cl(u0 - 0.42 + 0.03 * i), q = u * u * (3 - 2 * u), side = Math.sin(u * 9 + k * 2) * 18 * Math.sin(Math.PI * u);
			const w = 1 - q, px = w * w * from[0] + 2 * w * q * via[0] + q * q * to[0] + side * 0.6, py = w * w * from[1] + 2 * w * q * via[1] + q * q * to[1] + side * 0.4; pts.push(`${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`); }
		const d = pts.join(''), op = o * Math.sin(Math.PI * u0);
		return <g key={k} opacity={op}><path d={d} fill="none" stroke="#4A2A08" strokeWidth={7} strokeLinecap="round" opacity={0.45} /><path d={d} fill="none" stroke="#F2B42A" strokeWidth={4.5} strokeLinecap="round" /></g>; })}
</g>;
const AniVignette: React.FC<{t: number; lit: number; whisper: number}> = ({t, lit, whisper}) => {
	const st = st37(t), GY = 932, S = S1920, aP = aniPose(st);
	const m = ap(solve(aP).head, [1.25, -0.55]), mouth: V = [W43.x(LAY.ani + m[0] * S), W43.y(GY + m[1] * S)];
	return <g>
		<KhekherFrieze x0={-900} x1={1560} y={40} h={48} />
		<RegisterLine x0={-900} x1={1560} y={286} h={16} />
		<TextCols x={-262} y={318} cols={12} rows={4} cell={27} seed={37} lit={lit} />
		<TextCols x={650} y={318} cols={4} rows={4} cell={27} seed={38} lit={0} />
		<g transform={`translate(${W43.post},852) scale(${W43.k}) translate(${-LAY.post},${-GY})`}>
			<God id="c37tutu" cast={CAST2.tutu} pose={tutuPose(t)} x={LAY.ani - 300} y={GY} s={S} sec={{t}} />
			<ArmOver cast={CAST2.tutu} pose={tutuPose(t)} x={LAY.ani - 300} y={GY} s={S} side="f" only="hand" id="c37th" />
			<God id="c37ani" cast={CAST.ani} pose={aP} x={LAY.ani} y={GY} s={S} sec={{t}} />
			<AdoreArms cast={CAST.ani} pose={aP} x={LAY.ani} y={GY} s={S} id="c37aa" />
			<BalanceC p={{tilt: st.tilt, swingL: st.swingL, swingR: st.swingR, plumb: st.plumb, look: st.look}} x={LAY.post} y={GY} s={S} t={t} />
			<God id="c37an" cast={ANUBIS} pose={anubisPose(st)} x={LAY.anubis} y={GY} s={S} sec={{t}} />
		</g>
		<Wisps from={[mouth[0] + 14, mouth[1]]} via={[mouth[0] + 120, 372]} to={[mouth[0] - 60, 332]} t={t} o={whisper} />
		<Dado x0={-900} x1={1560} y={852} h={80} />
	</g>;
};
const S37: React.FC<ShotProps> = ({t}) => {
	const cam = camE(t, -0.4, 3.4, [150, 572, 1.3], [96, 556, 1.46]);
	const lit = cl((t - 0.35) / 2.3) * 12, whisper = sm(seg(t, 0.15, 0.5));
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="plaster" wear={wearZ(cam.z)} stain={0.32} wobble={wobIn(t)}
		tags={[{x: 22, y: 610, text: '阿尼'}, {x: -238, y: 560, text: '图图'}]}
		light={<>
			<Glow x={40} y={380} r={420} c="gold" o={0.18 + 0.3 * cl(lit / 12)} />
			<Glow x={-40} y={600} r={380} c="warm" o={0.35} />
			<Dust t={t} box={[-400, 300, 700, 850]} n={40} seed={37} o={0.6} vx={4} vy={-4} />
		</>}>
		<AniVignette t={t} lit={lit} whisper={whisper} />
	</Stage60>;
};

/* ======================= 38 · 「作弊？古埃及人管这叫[魔法]。」 Ani, still bowing, slides one eye to the camera and winks ======================= */
const S38: React.FC<ShotProps> = ({t}) => {
	const s = 80, st = st37(t + 3.2), pose = aniPose(st), g = solve(pose), hc = ap(g.head, [0.4, -1.25]);
	const fx = 590 - hc[0] * s, fy = 470 - hc[1] * s;
	const look = sm(seg(t, 0.3, 0.7)), wink = cl((t - 1.32) / 0.07) * (1 - cl((t - 1.62) / 0.14)), smile = sm(seg(t, 1.15, 1.45));
	const eyeW = ap(g.head, [0.98, -1.2]), ew: V = [fx + eyeW[0] * s, fy + eyeW[1] * s];
	const cam = camE(t, 0, 2.9, [650, 486, 1.0], [628, 478, 1.07]);
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="plaster" wear={0.55} stain={0.3}
		light={<>
			<Glow x={300} y={300} r={520} c="gold" o={0.35} />
			<Sparkle x={ew[0] - 8} y={ew[1] - 30} r={70 * bump(t, 1.36, 1.86)} rot={15 + 40 * t} />
			<Sparkle x={ew[0] + 46} y={ew[1] - 66} r={34 * bump(t, 1.46, 1.86)} rot={-10} />
			<Dust t={t} box={[0, 60, 1300, 900]} n={36} seed={38} o={0.55} vx={3} vy={-5} r={2.6} />
		</>}>
		<KhekherFrieze x0={-100} x1={1600} y={40} h={58} />
		<TextCols x={40} y={150} cols={7} rows={6} cell={50} seed={37} lit={7} />
		<TextCols x={930} y={150} cols={5} rows={6} cell={50} seed={39} lit={0} />
		<God id="c38ani" cast={CAST.ani} pose={pose} x={fx} y={fy} s={s} sec={{t}} />
		<AdoreArms cast={CAST.ani} pose={pose} x={fx} y={fy} s={s} id="c38aa" />
		<EyeFx id="c38e" pose={pose} x={fx} y={fy} s={s} skin={PAL.skinM} look={look} lid={wink} smile={smile} />
	</Stage60>;
};

/* ======================= 39–40 · the Met: Hatnefer's heart scarab, the old name sanded off, hers cut in ======================= */
export const ROWS39 = scarabRows(7, 0.95, -3.95, 1.22, 39);
const PATCH = {j: 3, x0: -0.35, x1: 3.3};
/** her name in three signs (1 × 1 cells): forepart of a lion (ḥꜣt), the nfr sign (heart and windpipe), the seated-woman determinative */
const NAME_SIGNS = [
	sp([[0.08, 0.92, 1], [0.12, 0.55], [0.22, 0.35], [0.4, 0.22], [0.6, 0.2], [0.78, 0.3], [0.9, 0.46], [0.86, 0.56], [0.7, 0.55], [0.66, 0.66], [0.72, 0.92, 1], [0.56, 0.92, 1], [0.5, 0.7], [0.36, 0.7], [0.32, 0.92, 1]], true, 0.16),
	'M0.44 0.08L0.56 0.08L0.56 0.2L0.68 0.2L0.68 0.28L0.56 0.28L0.56 0.5Q0.74 0.56 0.74 0.72Q0.74 0.94 0.5 0.94Q0.26 0.94 0.26 0.72Q0.26 0.56 0.44 0.5L0.44 0.28L0.32 0.28L0.32 0.2L0.44 0.2Z',
	sp([[0.2, 0.92, 1], [0.24, 0.62], [0.36, 0.5], [0.42, 0.36], [0.4, 0.22], [0.5, 0.1], [0.62, 0.16], [0.62, 0.3], [0.54, 0.38], [0.58, 0.56], [0.78, 0.66], [0.8, 0.92, 1]], true, 0.16),
];
/** the re-carved patch on the base (units): sanded (0..1) lightens it and scratches it; cut (0..3) adds the new signs */
const Patch: React.FC<{sand: number; cut: number; glow?: number; id: string}> = ({sand, cut, glow = 0}) => {
	const r = ROWS39[PATCH.j], y0 = r.y - 0.18, y1 = r.y + 0.95 + 0.14;
	return <g>
		{/* the old signs, fading under the sanding */}
		{r.glyphs.filter((g) => g.x > PATCH.x0 && g.x < PATCH.x1).map((g, i) => <g key={i} transform={`translate(${g.x},${r.y}) scale(0.95)`} opacity={1 - sm(sand)}><path d={GLYPH_D[g.k].d} fill="#10241A" /></g>)}
		<rect x={PATCH.x0} y={y0} width={PATCH.x1 - PATCH.x0} height={y1 - y0} rx={0.18} fill="#7CC79A" opacity={0.62 * sm(sand)} />
		<rect x={PATCH.x0} y={y0} width={PATCH.x1 - PATCH.x0} height={y1 - y0} rx={0.18} fill="none" stroke="#D8F5E2" strokeWidth={0.05} opacity={0.8 * sm(sand)} strokeDasharray="0.14 0.08" />
		{Array.from({length: 16}, (_, i) => <path key={i} d={`M${PATCH.x0 + 0.15 + i * 0.21} ${y1 - 0.12}L${PATCH.x0 + 0.4 + i * 0.21} ${y0 + 0.12}`} stroke="#E8FFF0" strokeWidth={0.025} opacity={0.55 * sm(sand)} />)}
		{/* ghosts of the erased signs, just visible */}
		{r.glyphs.filter((g) => g.x > PATCH.x0 && g.x < PATCH.x1).map((g, i) => <g key={'g' + i} transform={`translate(${g.x},${r.y}) scale(0.95)`} opacity={0.16 * sm(sand)}><path d={GLYPH_D[g.k].d} fill="none" stroke="#10241A" strokeWidth={0.04} /></g>)}
		{NAME_SIGNS.map((d, i) => { const a = cl(cut - i); if (a <= 0) return null;
			return <g key={'n' + i} transform={`translate(${0.05 + i * 1.08},${r.y - 0.04}) scale(1.0)`}>
				{glow > 0 && <circle cx={0.5} cy={0.5} r={0.7} fill="url(#g60-gold)" opacity={glow * 0.5} style={{mixBlendMode: 'screen'}} />}
				<path d={d} fill="#0B1E14" transform={`translate(0.5,0.5) scale(${0.6 + 0.4 * sm(a * 3)}) translate(-0.5,-0.5)`} />
				<path d={d} fill="none" stroke="#F4EAC0" strokeWidth={0.05} opacity={0.9} transform={`translate(0.5,0.5) scale(${0.6 + 0.4 * sm(a * 3)}) translate(-0.5,-0.5)`} /></g>; })}
	</g>;
};
const hidePatch = (j: number, gx: number) => j === PATCH.j && gx > PATCH.x0 && gx < PATCH.x1;
/** the scarab in its gold mount, base outward, on a looped gold chain (world px) */
const MetScarab: React.FC<{x: number; y: number; s: number; t: number; sand: number; cut: number; id: string; glow?: number; sw?: number}> = ({x, y, s, t, sand, cut, id, glow = 0, sw = 0}) => {
	const top: V = [x, y - 4.9 * s], links: React.ReactNode[] = [];
	for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 26; i++) { const u = i / 25, px = top[0] + side * (Math.sin(u * Math.PI * 0.62) * 3.3 * s) + side * sw * u, py = top[1] - u * 5.5 * s + Math.sin(u * Math.PI) * 0.6 * s;
		links.push(<ellipse key={`${side}.${i}`} cx={px} cy={py} rx={0.19 * s} ry={0.11 * s} transform={`rotate(${side * 60 + 30 * Math.sin(u * 7)} ${px} ${py})`} fill="none" stroke={PAL.ink} strokeWidth={0.13 * s} />,
			<ellipse key={`${side}.${i}g`} cx={px} cy={py} rx={0.19 * s} ry={0.11 * s} transform={`rotate(${side * 60 + 30 * Math.sin(u * 7)} ${px} ${py})`} fill="none" stroke={i % 2 ? PAL.gold : PAL.goldHi} strokeWidth={0.07 * s} />); }
	return <g>
		{links}
		<path d={sp([[x - 0.55 * s, top[1] + 0.3 * s, 1], [x + 0.55 * s, top[1] + 0.3 * s, 1], [x + 0.35 * s, top[1] - 0.55 * s], [x - 0.35 * s, top[1] - 0.55 * s]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		<ScarabC id={id} x={x} y={y} s={s} flip={1} t={t} rows={ROWS39} cell={0.95} hide={hidePatch} extra={<Patch sand={sand} cut={cut} glow={glow} id={id} />} />
		<path d={OVAL} transform={`translate(${x},${y}) scale(${s * 1.06})`} fill="none" stroke={PAL.ink} strokeWidth={4.4 / s} />
		<path d={OVAL} transform={`translate(${x},${y}) scale(${s * 1.06})`} fill="none" stroke={PAL.gold} strokeWidth={3.2 / s} />
	</g>;
};
/** the museum case (world px): dark gallery, spotlight, glass with reflections, plinth and label */
const MuseumCase: React.FC<{x0: number; x1: number; y0: number; y1: number; t: number; label: string}> = ({x0, x1, y0, y1, t, label}) => <g>
	<rect x={x0 - 30} y={y1} width={x1 - x0 + 60} height={140} fill="#2A2420" stroke="#0A0806" strokeWidth={3} />
	<rect x={x0 - 30} y={y1} width={x1 - x0 + 60} height={10} fill="#5A4A3A" />
	<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#1B2232" opacity={0.55} />
	<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#B9C8D8" strokeWidth={3} opacity={0.7} />
	<rect x={x0 + 6} y={y0 + 6} width={x1 - x0 - 12} height={y1 - y0 - 12} fill="none" stroke="#B9C8D8" strokeWidth={1} opacity={0.35} />
	{/* plinth inside */}
	<path d={poly([[(x0 + x1) / 2 - 110, y1], [(x0 + x1) / 2 + 110, y1], [(x0 + x1) / 2 + 80, y1 - 70], [(x0 + x1) / 2 - 80, y1 - 70]])} fill="#3A3330" stroke="#0A0806" strokeWidth={2} />
	{/* label plate on the plinth front */}
	<rect x={(x0 + x1) / 2 - 150} y={y1 + 40} width={300} height={56} rx={4} fill="#E9E2D2" stroke="#0A0806" strokeWidth={2} />
	<text x={(x0 + x1) / 2} y={y1 + 77} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={26} fill="#2A2420">{label}</text>
	{/* reflections, drifting a little */}
	<g opacity={0.22} style={{mixBlendMode: 'screen'}}>
		<path d={poly([[x0 + 60 + 6 * t, y0], [x0 + 130 + 6 * t, y0], [x0 + 20 + 6 * t, y1], [x0 - 50 + 6 * t, y1]].map(([a, b]) => [cl(a, x0, x1), b] as V))} fill="#FFFFFF" />
		<path d={poly([[x1 - 160 + 4 * t, y0], [x1 - 135 + 4 * t, y0], [x1 - 235 + 4 * t, y1], [x1 - 260 + 4 * t, y1]])} fill="#FFFFFF" />
	</g>
</g>;
const T39 = {sand0: 1.0, sand1: 1.75, taps: [2.0, 2.35, 2.7]};
const cut39 = (t: number) => T39.taps.reduce((a, tt) => a + cl((t - tt) / 0.06), 0);
/** the macro world of 39–40: the base fills the frame (s large) on a dark velvet with a gold rim light */
const MacroWorld: React.FC<{t: number; sand: number; cut: number; s: number; x: number; y: number; sw?: number; glow?: number; stone?: {x: number; y: number; o: number}; chisel?: {x: number; y: number; o: number; hit: number}}> = ({t, sand, cut, s, x, y, sw = 0, glow = 0, stone, chisel}) => <g>
	<rect x={-400} y={-200} width={2300} height={1400} fill="#151A26" />
	<MetScarab id="c39m" x={x} y={y} s={s} t={t} sand={sand} cut={cut} glow={glow} sw={sw} />
	{stone && stone.o > 0 && <g opacity={stone.o} transform={`translate(${stone.x},${stone.y}) rotate(-8)`}><rect x={-70} y={-40} width={140} height={80} rx={18} fill="#B9A88A" stroke={PAL.ink} strokeWidth={3} /><path d="M-50 -18L50 -22M-46 4L54 0M-50 24L44 20" stroke="#8A7A60" strokeWidth={3} /></g>}
	{chisel && chisel.o > 0 && <g opacity={chisel.o} transform={`translate(${chisel.x},${chisel.y - 26 * (1 - chisel.hit)}) rotate(28)`}>
		<rect x={-9} y={-210} width={18} height={150} rx={3} fill="#C98C1E" stroke={PAL.ink} strokeWidth={3} /><path d={poly([[-9, -60], [9, -60], [5, 0], [-5, 0]])} fill="#A86E3A" stroke={PAL.ink} strokeWidth={3} />
		<rect x={-16} y={-260} width={32} height={56} rx={8} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={3} /></g>}
</g>;
const S39: React.FC<ShotProps> = ({t}) => {
	const SW = 0.95, xf = sm(seg(t, 0.85, 1.1)); // crossfade wide → macro
	const camW = camE(t, -0.4, 1.1, [650, 500, 1.0], [720, 468, 2.5], (u) => u * u);
	const camM = camE(t, 0.85, 3.6, [730, 520, 1.0], [700, 500, 1.06]);
	const sand = seg(t, T39.sand0, T39.sand1), cut = cut39(t), rasp = t > T39.sand0 && t < T39.sand1;
	// macro: the base at s = 120, the patch row centred
	const ms = 128, mx0 = 520, my0 = 520 - (ROWS39[PATCH.j].y + 0.45) * 128;
	const tap = T39.taps.reduce((a, tt) => Math.max(a, t > tt ? Math.exp(-(t - tt) / 0.07) : 0), 0);
	const ci = sm(seg(t, T39.taps[0] + 0.1, T39.taps[1] - 0.08)) + sm(seg(t, T39.taps[1] + 0.1, T39.taps[2] - 0.08));
	const hit = T39.taps.reduce((a, tt) => Math.max(a, 1 - cl(Math.abs(t - tt) / 0.11)), 0);
	const chiselP: V = [mx0 + (0.55 + ci * 1.08) * ms, my0 + (ROWS39[PATCH.j].y + 0.1) * ms];
	return <AbsoluteFill>
		{xf < 1 && <Stage60 t={t} cam={camW} grade="night" bg="#10131C" wear={0.3} stain={0.3} wobble={wobIn(t)} tags={[{x: 560, y: 250, text: '哈特妮菲尔'}]}
			light={<>
				<Shaft pts={[[660, PIC_T - 60], [780, PIC_T - 60], [850, 800], [590, 800]]} o={0.55} />
				<Glow x={720} y={478} r={150} c="gold" o={0.55} />
				<Glow x={720} y={478} r={60} c="green" o={0.5} />
				<Sparkle x={716} y={472} r={20 + 8 * Math.sin(t * 5)} rot={20 * t} />
				<Dust t={t} box={[590, 80, 850, 800]} n={26} seed={39} o={0.6} vx={2} vy={4} r={1.6} />
			</>}>
			<defs><filter id="c39sil" x="-20%" y="-10%" width="140%" height="120%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.024  0 0 0 0 0.04  0 0 0 1 0" /></filter></defs>
			<rect x={-300} y={-100} width={2100} height={1300} fill="#10131C" />
			<rect x={-300} y={800} width={2100} height={500} fill="#0B0D14" />
			{/* a visitor (1.7 m) at the pedestal (1.05 m) with its small vitrine: the amulet is egg-sized */}
			<g filter="url(#c39sil)"><God id="c39vis" cast={CAST.ani} pose={{...POSES.rest, lean: 8, neck: 6, head: 12, bs: -2, be: 8, fs: 4, fe: 20}} x={430} y={800} s={22.6} sec={{t}} /></g>
			<path d={poly([[640, 800], [800, 800], [790, 548], [650, 548]])} fill="#2A2420" stroke="#0A0806" strokeWidth={3} />
			<rect x={630} y={534} width={180} height={16} fill="#5A4A3A" stroke="#0A0806" strokeWidth={2} />
			<rect x={670} y={432} width={100} height={102} fill="#1B2232" opacity={0.5} />
			<rect x={670} y={432} width={100} height={102} fill="none" stroke="#C9D4E0" strokeWidth={2.4} opacity={0.8} />
			<path d={poly([[686, 432], [702, 432], [680, 534], [670, 534]])} fill="#FFFFFF" opacity={0.12} />
			<rect x={708} y={516} width={24} height={18} fill="#3A3330" />
			<MetScarab id="c39w" x={720} y={478} s={2.4} t={t} sand={0} cut={0} />
			{/* the wall label */}
			<rect x={880} y={420} width={250} height={128} rx={4} fill="#EDE6D6" stroke="#0A0806" strokeWidth={2} />
			<text x={1005} y={452} textAnchor="middle" fontFamily={F_SERIF} fontWeight={700} fontSize={19} fill="#2A2420">哈特妮菲尔的心脏圣甲虫</text>
			<text x={1005} y={496} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={34} fill="#B8371F">6.6 × 5.3 厘米</text>
			<text x={1005} y={530} textAnchor="middle" fontFamily={F_SERIF} fontWeight={700} fontSize={17} fill="#2A2420">大都会艺术博物馆</text>
		</Stage60>}
		{xf > 0 && <AbsoluteFill style={{opacity: xf}}><Stage60 t={t} cam={camM} grade="night" bg="#151A26" wear={0.25} stain={0.25} wobble={xf < 1 ? 0 : wobIn(t - 1.1)} tags={[{x: 110, y: 120, text: '哈特妮菲尔'}]}
			light={<>
				<Glow x={mx0 + 1.5 * ms} y={my0 + ROWS39[PATCH.j].y * ms} r={420} c="gold" o={0.2 + 0.25 * cl(cut / 3)} />
				{rasp && <Dust t={t * 3} box={[mx0 - 60, my0 - 40, mx0 + 420, my0 + 120]} n={40} seed={391} c="#E8F5DA" o={0.8} vx={60} vy={-30} r={3} />}
				{tap > 0 && <><Sparkle x={chiselP[0] - 40} y={chiselP[1] + 30} r={60 * tap} rot={30} /><Glow x={chiselP[0] - 40} y={chiselP[1] + 30} r={120} c="white" o={0.6 * tap} /></>}
				<Dust t={t} box={[0, 60, 1300, 900]} n={24} seed={392} o={0.4} vx={2} vy={-3} r={2} />
			</>}>
			<MacroWorld t={t} sand={sand} cut={cut} s={ms} x={mx0} y={my0}
				stone={{x: mx0 + (1.4 + 1.1 * Math.sin(t * 26)) * ms, y: my0 + (ROWS39[PATCH.j].y + 0.5) * ms, o: cl(Math.min((t - T39.sand0 + 0.12) / 0.12, (T39.sand1 + 0.1 - t) / 0.12))}}
				chisel={{x: chiselP[0] - 40, y: chiselP[1] + 30, o: cl(Math.min((t - 1.82) / 0.12, (2.92 - t) / 0.12)), hit}} />
		</Stage60></AbsoluteFill>}
	</AbsoluteFill>;
};
/* 40 · 「原本不是给她做的。改个名，[照用]。」 the reed tag 「改名」 swings onto the chain; Hatnefer's silhouette shrugs */
const HATNEFER: Cast = {...CAST.isis, name: 'Hatnefer', wings: false, crown: 'none', dress: 'sheath', bHand: 'open', fHand: 'open'};
const shrugPose = (u: number, t: number): Pose => {
	let p: Pose = {...POSES.rest, lean: -1 - 2 * u + 0.4 * Math.sin(t * 1.3), neck: -2 * u, head: -7 * u + 1.5 * Math.sin(t * 1.1), rt: -5, at: 7, rk: 2, ak: 1};
	const g = solve(p, true), fs = ap(g.fU, [0, 0]), bs = ap(g.bU, [0, 0]);
	p = wristTo(reach(p, 'f', [fs[0] + lerp(0.4, 2.5, u), fs[1] + lerp(6.8, 2.6, u)], true), 'f', lerp(4, 112, u));
	return wristTo(reach(p, 'b', [bs[0] + lerp(-0.3, -1.6, u), bs[1] + lerp(6.8, 3.0, u)], true), 'b', lerp(-2, -100, u));
};
const S40: React.FC<ShotProps> = ({t}) => {
	const ms = 82, mx0 = 470, my0 = 470;
	const land = 0.62, sw = t < land ? 0 : 22 * Math.exp(-(t - land) / 0.6) * Math.cos((t - land) * 7.5);
	const inU = eOut(seg(t, 0.05, land)), tagA = t < land ? lerp(-70, -8, inU) : sw;
	const anchor: V = [mx0 + 2.3 * ms, my0 - 7.2 * ms];
	const shrug = sm(seg(t, 1.55, 1.9)) * (1 - 0.35 * sm(seg(t, 2.7, 3.1))), hp = shrugPose(shrug, t);
	const cam = camE(t, 0, 3.6, [720, 486, 1.0], [705, 476, 1.05]);
	const glow = 0.6 + 0.4 * Math.sin(t * 3);
	return <Stage60 t={t} cam={cam} grade="night" bg="#151A26" wear={0.25} stain={0.25}
		tags={[{x: 1110, y: 190, text: '哈特妮菲尔', o: sm((t - 0.9) / 0.4)}]}
		light={<>
			<Glow x={mx0 + 1.5 * ms} y={my0} r={460} c="gold" o={0.25 + 0.1 * glow} />
			{t > land && <Sparkle x={anchor[0] + 40} y={my0 - 300} r={48 * bump(t, land, land + 0.4)} rot={20} />}
			<Dust t={t} box={[0, 60, 1300, 900]} n={30} seed={40} o={0.45} vx={2} vy={-3} r={2} />
		</>}>
		<defs><filter id="c40sil" x="-20%" y="-10%" width="140%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0 0.09  0 0 0 1 0" /></filter></defs>
		<MacroWorld t={t} sand={1} cut={3} s={ms} x={mx0} y={my0} glow={0.5 + 0.5 * glow} />
		{/* the re-carved patch outlined in red ink, as if circled */}
		<rect x={mx0 + (PATCH.x0 - 0.12) * ms} y={my0 + (ROWS39[PATCH.j].y - 0.32) * ms} width={(PATCH.x1 - PATCH.x0 + 0.24) * ms} height={1.5 * ms} rx={24} fill="none" stroke="#E0503A" strokeWidth={6}
			strokeDasharray={`${1400 * sm(seg(t, 0.9, 1.4))} 2000`} opacity={0.9} />
		{/* the reed tag on its string from the chain */}
		<g transform={`translate(${anchor[0] + lerp(-260, 0, inU)},${anchor[1] + lerp(-120, 0, inU)}) rotate(${tagA})`}>
			<path d={`M0 0L0 ${3.0 * ms}`} stroke="#8A6A3A" strokeWidth={4} />
			<g transform={`translate(0,${3.0 * ms})`}>
				<path d={poly([[-58, 0], [58, 0], [58, 170], [-58, 170]])} fill="#E8D6A0" stroke={PAL.ink} strokeWidth={4} />
				{Array.from({length: 7}, (_, i) => <line key={i} x1={-58 + i * 19} x2={-58 + i * 19} y1={4} y2={166} stroke="#C9B077" strokeWidth={2} />)}
				<circle cx={0} cy={16} r={8} fill="#5A3A1A" />
				<text x={0} y={92} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={60} fill="#B8371F">改</text>
				<text x={0} y={154} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={60} fill="#B8371F">名</text>
			</g>
		</g>
		{/* Hatnefer, backlit: a silhouette that shrugs */}
		<circle cx={1010} cy={600} r={330} fill="url(#g60-gold)" opacity={0.75} />
		<circle cx={1010} cy={600} r={190} fill="#F3D88A" opacity={0.35} />
		<g filter="url(#c40sil)"><God id="c40hat" cast={HATNEFER} pose={hp} x={1000} y={900 - 8 * shrug} s={24} sec={{t}} /></g>
	</Stage60>;
};

export const TWIST: Record<number, React.FC<ShotProps>> = {34: S34, 35: S35, 36: S36, 37: S37, 38: S38, 39: S39, 40: S40};
export const _keepT = {Shaft, flick, PIC_B, featherD, eOut};
