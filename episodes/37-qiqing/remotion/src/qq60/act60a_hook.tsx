import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage60, Glow, Dust, Embers, Stars, FW, PIC_T, PIC_B, F_SERIF, flick} from './frame60';
import {Ceiling} from './sets60';
import {Column, Basket, LionBier} from './props60b';
import {God, CAST, POSES} from './rig60';
import {PAL, sp, poly, lerp, cl, sm, V} from './geo60';
import type {ShotProps} from './EP60';
import {pulse, seg, aimPath, aim, GoldDefs, MaskFront, Puff, BigBalance, panPos, BigMummy, HEART_AT, GlowHeart, Sparkle, DustBurst, wearAt} from './act60a_kit';

/* ep60 act A · the hook (shots 1–4, 0.0–10.9 s): the mask tosses the puff; the heart glows in the mummy; the heart drops on the
   three-storey balance; the title in its cartouche. Times in comments are shot seconds (t), film seconds in [brackets]. */

/** a tapered limb between two points (world px) */
const limb = (a: V, b: V, r0: number, r1: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
	return sp([[a[0] + nx * r0, a[1] + ny * r0], [lerp(a[0], b[0], 0.5) + nx * (r0 + r1) * 0.55, lerp(a[1], b[1], 0.5) + ny * (r0 + r1) * 0.55], [b[0] + nx * r1, b[1] + ny * r1], [b[0] + dx / L * r1, b[1] + dy / L * r1],
		[b[0] - nx * r1, b[1] - ny * r1], [lerp(a[0], b[0], 0.5) - nx * (r0 + r1) * 0.55, lerp(a[1], b[1], 0.5) - ny * (r0 + r1) * 0.55], [a[0] - nx * r0, a[1] - ny * r0], [a[0] - dx / L * r0, a[1] - dy / L * r0]], true, 0.2); };
const keyV = (t: number, keys: [number, number, number][]): V => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = sm((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
	const k = keys[keys.length - 1]; return [k[1], k[2]]; };

/* ================= 1 · 0.0–2.8 · the mask XCU tosses the grey puff into a basket =================
   0.00 [0.00] frame 0: gold glint on the eye (cymbal crash + dum) · 0.42 [0.42] flick (whoosh) · 1.20 [1.20] puff lands in the basket (thup)
   push-in 100→112 % on the eyes; from 2.4 the camera tilts down (the arc's direction) into shot 2. */
export const Shot1: React.FC<ShotProps> = ({t}) => {
	const id = 'a1', s = 128, EX = 760, EY = 430;
	let cam = aimPath(t, [[0, EX, EY, 740, 428, 1.0], [2.6, EX, EY, 740, 428, 1.12]]);
	const td = Math.max(0, t - 2.35); cam = {...cam, y: cam.y + 0.5 * 1500 * td * td};
	// the arm (viewer's left) holds the puff up beside the mask, winds up, flicks it back over the shoulder, drops out of frame
	const W = keyV(t, [[0, 262, 520], [0.26, 292, 548], [0.42, 206, 456], [0.62, 190, 540], [1.25, 150, 960]]);
	const E = keyV(t, [[0, 128, 800], [0.42, 112, 790], [0.7, 120, 860], [1.25, 110, 1080]]);
	const Sh: V = [300, 1130];
	const fa = Math.atan2(W[1] - E[1], W[0] - E[0]), hand: V = [W[0] + Math.cos(fa) * 30, W[1] + Math.sin(fa) * 30];
	const tRel = 0.42, tLand = 1.2, P0: V = [hand[0] - 4, hand[1] - 44];
	let puff: V = [hand[0] - 2, hand[1] - 70], pa = 8 * Math.sin(t * 3), sq = 0;
	if (t >= tRel) { const u = cl((t - tRel) / (tLand - tRel)); const P0r: V = [206, 392];
		puff = [lerp(P0r[0], 186, u), lerp(P0r[1], 858, u) - 540 * 4 * u * (1 - u) * (1 - 0.25 * u)]; pa = 420 * u; sq = 0.1 * Math.sin(u * 9); }
	if (t > tLand) { const v = t - tLand; puff = [186, 858 + 16 * sm(v / 0.2)]; pa = 420; sq = 0.18 * Math.exp(-v / 0.12) * Math.cos(v * 40); }
	const bask = 1 - 0.06 * pulse(t, tLand, 0.03, 0.12);
	const glint = t < 0.42 ? Math.max(0, 1 - t / 0.42) : 0, flare = 0.5 * pulse(t, 1.35, 0.12, 0.45);
	const trail = t > tRel && t < tLand ? Array.from({length: 5}, (_, i) => { const tt = t - (i + 1) * 0.035; if (tt < tRel) return null; const u = cl((tt - tRel) / (tLand - tRel));
		return <circle key={i} cx={lerp(206, 186, u)} cy={lerp(392, 858, u) - 540 * 4 * u * (1 - u) * (1 - 0.25 * u)} r={44 - i * 6} fill="#C8CED8" opacity={0.2 - i * 0.035} />; }) : null;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0E1640" wear={0.1} stain={0.16} wobble={1.6}
		light={<>
			<Glow x={-80} y={560} r={620} c="warm" o={0.62 + 0.1 * flick(t, 3)} />
			<Glow x={EX} y={EY + 40} r={520} c="gold" o={0.22} />
			<Glow x={EX - 300} y={EY - 40} r={260} c="warm" o={0.35 + 0.08 * flick(t, 5)} />
			<Embers t={t} x={40} y={940} n={16} seed={7} h={620} spread={180} />
			<Dust t={t} box={[0, 60, 1400, 940]} n={70} seed={13} c="#FFE2A0" o={0.75} vx={-5} vy={-6} r={1.8} />
			{t > tLand - 0.05 && <DustBurst t={t} t0={tLand} x={186} y={836} rx={60} ry={14} n={26} seed={4} c="#E8E2D2" life={0.7} />}
		</>}>
		<GoldDefs id={id} />
		<defs><radialGradient id="a1-sky" cx="0.55" cy="0.42" r="0.75"><stop offset="0" stopColor="#24398E" /><stop offset="0.55" stopColor="#14205A" /><stop offset="1" stopColor="#070C26" /></radialGradient></defs>
		<rect x={-600} y={-600} width={2700} height={2400} fill="url(#a1-sky)" />
		<Stars t={t} box={[-200, -100, 1600, 1000]} n={150} seed={21} />
		{/* the mask, breathing a little */}
		<g transform={`rotate(${0.7 * Math.sin(t * 1.2)} ${EX} ${EY + 500})`}><MaskFront x={EX} y={EY} s={s} t={t} id={id} glint={glint} flare={flare} /></g>
		{/* the arm + the puff + the basket */}
		{trail}
		{t < tRel && <Puff x={puff[0]} y={puff[1]} r={56} a={pa} sq={sq} />}
		<path d={limb(Sh, E, 76, 58)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
		<path d={limb(E, W, 56, 40)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
		<path d={`M${lerp(Sh[0], E[0], 0.15) + 30} ${lerp(Sh[1], E[1], 0.15)}Q${lerp(Sh[0], E[0], 0.6) + 34} ${lerp(Sh[1], E[1], 0.6)} ${E[0] + 30} ${E[1] - 6}`} fill="none" stroke={PAL.skinM2} strokeWidth={14} opacity={0.6} strokeLinecap="round" />
		<path d={`M${E[0] + 22} ${E[1] - 4}Q${lerp(E[0], W[0], 0.5) + 30} ${lerp(E[1], W[1], 0.5)} ${W[0] + 24} ${W[1] + 10}`} fill="none" stroke={PAL.skinM2} strokeWidth={11} opacity={0.6} strokeLinecap="round" />
		<path d={`M${lerp(Sh[0], E[0], 0.55) - 30} ${lerp(Sh[1], E[1], 0.55) - 2}Q${lerp(Sh[0], E[0], 0.7) - 10} ${lerp(Sh[1], E[1], 0.7) - 20} ${E[0] - 24} ${E[1] + 30}`} fill="none" stroke="#E07A4A" strokeWidth={7} opacity={0.55} strokeLinecap="round" />
		{/* gold armlet on the upper arm, bracelet at the wrist */}
		{(() => { const m = [lerp(Sh[0], E[0], 0.62), lerp(Sh[1], E[1], 0.62)], a = Math.atan2(E[1] - Sh[1], E[0] - Sh[0]) * 180 / Math.PI + 90;
			return <g transform={`translate(${m[0]},${m[1]}) rotate(${a})`}><rect x={-66} y={-20} width={132} height={40} rx={8} fill="url(#a1-gold)" stroke={PAL.ink} strokeWidth={4} /><rect x={-66} y={-6} width={132} height={12} fill={PAL.blue} /></g>; })()}
		<g transform={`translate(${W[0]},${W[1]}) rotate(${fa * 180 / Math.PI + 90})`}>
			<rect x={-46} y={-22} width={92} height={36} rx={8} fill="url(#a1-gold)" stroke={PAL.ink} strokeWidth={4} /><rect x={-46} y={-10} width={92} height={10} fill={PAL.blue} /><rect x={-46} y={4} width={92} height={5} fill={PAL.red} />
		</g>
		{/* the hand: palm up, fingers curled round the puff, thumb on top */}
		<g transform={`translate(${hand[0]},${hand[1]}) rotate(${fa * 180 / Math.PI + 90})`}>
			<path d={sp([[-40, 20], [-44, -12], [-30, -40], [-6, -50], [22, -44], [40, -22], [42, 10], [26, 34], [-14, 36]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
			{[-26, -8, 10, 28].map((xx) => <path key={xx} d={`M${xx} -40Q${xx + 4} -20 ${xx + 2} -6`} fill="none" stroke={PAL.skinM2} strokeWidth={4} strokeLinecap="round" />)}
			<path d="M38 -6Q58 -28 42 -52Q34 -60 26 -48" fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} strokeLinejoin="round" />
		</g>
		{t >= tRel && <Puff x={puff[0]} y={puff[1]} r={56} a={pa} sq={sq} />}
		<g transform={`translate(186,960) scale(1,${bask}) translate(-186,-960)`}><Basket x={186} y={960} w={176} h={124} /></g>
		<path d={`M${186 - 88} ${836}Q186 ${822} ${186 + 88} ${836}`} fill="none" stroke="#8A5A2E" strokeWidth={4} />
	</Stage60>;
};

/* ================= 2 · 2.8–5.0 · match on the arc: down onto the mummy; the heart glows through the linen, two beats =================
   tin 'own' (0.35 s): drawn over shot 1 while its camera is already tilting down; beats (lub-dub) at 0.77 [3.57] and 1.54 [4.34]. */
const B2 = [0.77, 1.54];
export const Shot2: React.FC<ShotProps> = ({t}) => {
	const id = 'a2', ms = 74, mx0 = -20, my0 = 742;
	const hp: V = [mx0 + HEART_AT[0] * ms, my0 + HEART_AT[1] * ms];
	const beat = B2.reduce((a, b) => a + pulse(t, b, 0.04, 0.16) + 0.55 * pulse(t, b + 0.17, 0.04, 0.22), 0);
	const glow = 0.55 + 0.75 * beat;
	const cam = aimPath(t, [[-0.4, 720, 300, 720, 486, 0.95], [1.1, hp[0], hp[1], 700, 520, 1.55], [2.6, hp[0] + 10, hp[1] + 4, 700, 520, 1.72]], (u) => 1 - Math.pow(1 - cl(u), 2.2));
	const inO = sm((t + 0.35) / 0.35);
	return <AbsoluteFill style={{opacity: inO}}>
		<Stage60 t={t} cam={cam} grade="lapis" bg="#0E1640" wear={wearAt(cam.z, 0.25)} stain={wearAt(cam.z, 0.25)} dark={0.35} darkC="#070C24"
			light={<>
				<Glow x={hp[0]} y={hp[1]} r={420 * (0.8 + 0.3 * beat)} c="red" o={0.55 + 0.35 * beat} />
				<Glow x={hp[0]} y={hp[1]} r={160} c="gold" o={0.35 + 0.4 * beat} />
				<Glow x={1300} y={180} r={500} c="blue" o={0.3} />
				<Dust t={t} box={[200, 200, 1400, 900]} n={50} seed={8} c="#FFD2A0" o={0.55} vx={-3} vy={-5} />
			</>}>
			<GoldDefs id={id} />
			<rect x={-600} y={-400} width={2700} height={1800} fill="#0E1640" />
			<Ceiling x0={-400} x1={1900} y0={-200} y1={60} bg="#121C4A" />
			<Stars t={t} box={[-300, 70, 1700, 420]} n={60} seed={3} o={0.5} />
			<LionBier x={-60} y={my0 + 5.2 * ms} s={ms} len={20.6} />
			<BigMummy x={mx0} y={my0} s={ms} t={t} id={id} glow={glow} heartShow={0.7 + 0.3 * beat} rings={B2.map((b) => (t - b) / 0.75)} />
		</Stage60>
	</AbsoluteFill>;
};

/* ================= 3 · 5.0–7.9 · the heart drops on the left pan; fast pull-back: a three-storey balance; two yellow eyes open =================
   0.45 [5.45] CLANG + chain rattle (to ~6.2) · pull-back 0.65–2.05 · eyes open 2.15 [7.15] (low growl from 7.1) */
const GX = 700, GG = 900, BS = 36;
const tiltAt = (t: number, tL: number) => { if (t < tL) return {tilt: -0.6, swingL: 0, swingR: 0};
	const u = t - tL; return {tilt: 3.2 + 4.8 * Math.exp(-u / 0.55) * Math.cos(2 * Math.PI * u / 1.05) - 3.2 * Math.exp(-u / 0.25) * 0, swingL: 5 * Math.exp(-u / 0.7) * Math.sin(2 * Math.PI * u / 0.8), swingR: -3.5 * Math.exp(-u / 0.8) * Math.sin(2 * Math.PI * u / 0.9 + 0.5)}; };
const AmmitEyes: React.FC<{x: number; y: number; s: number; open: number; t: number}> = ({x, y, s, open, t}) => {
	if (open <= 0.01) return null; const look = 0.06 * Math.sin(t * 1.3);
	const eye = (k: number) => <g key={k} transform={`translate(${x + k * 0.75 * s},${y - k * 0.05 * s}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={0.85} ry={0.55 * open} fill="url(#g60-gold)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
		<path d={`M-0.42 0Q0 ${-0.3 * open} 0.42 ${-0.04}Q0 ${0.26 * open} -0.42 0Z`} fill="#F7D21E" stroke="#140A02" strokeWidth={0.05} />
		<ellipse cx={look} cy={-0.01} rx={0.045} ry={0.2 * open} fill="#140A02" /></g>;
	return <g>{eye(-1)}{eye(1)}</g>;
};
export const Shot3: React.FC<ShotProps> = ({t}) => {
	const tL = 0.45, st = tiltAt(t, tL), p = {tilt: st.tilt, swingL: st.swingL, swingR: st.swingR, plumb: -0.4 * st.tilt, look: -3};
	const pan = panPos(p, GX, GG, BS, 'L'), pan0 = panPos({tilt: -0.6}, GX, GG, BS, 'L');
	const cam = aimPath(t, [[0, pan0[0], pan0[1] - 30, 720, 470, 3.0], [0.62, pan0[0] + 6, pan0[1] - 26, 720, 476, 2.85], [2.05, 700, 452, 700, 486, 0.88], [2.9, 700, 452, 700, 486, 0.86]]);
	const fall = t < tL ? sm(t / tL) : 1, hy = t < tL ? lerp(pan0[1] - 260, pan0[1], fall * fall) : 0;
	const clang = pulse(t, tL, 0.02, 0.25), eyes = sm(seg(t, 2.1, 2.5));
	const youX = 1080;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#101A48" wear={wearAt(cam.z, 0.35)} stain={wearAt(cam.z, 0.3)}
		tags={[]}
		light={<>
			<Glow x={GX} y={GG - 520} r={700} c="gold" o={0.42} />
			<Glow x={pan[0]} y={pan[1] - 30} r={220 * (1 + 0.6 * clang)} c="red" o={0.55 + 0.4 * clang} />
			{clang > 0.02 && <Sparkle x={pan[0] - 40} y={pan[1] + 6} r={70 * clang} o={clang} a={20} />}
			{t < tL && <GlowHeart x={pan0[0]} y={hy} s={BS} glow={1.2} a={-8 * (1 - fall)} />}
			{/* the dark beneath the balance, and Ammit's eyes in it */}
			<ellipse cx={GX - 300} cy={GG - 60} rx={420} ry={200} fill="url(#a3-shade)" />
			<AmmitEyes x={GX - 330} y={GG - 84} s={50} open={eyes} t={t} />
			<Dust t={t} box={[0, -100, 1500, 900]} n={80} seed={9} c="#FFE2A0" o={0.6} vx={-4} vy={-5} />
		</>}>
		<GoldDefs id="a3" />
		<rect x={-900} y={-700} width={3300} height={2400} fill="#101A48" />
		<Ceiling x0={-900} x1={2400} y0={-400} y1={-40} bg="#16214F" />
		{/* tall papyrus columns in the dark: the hall is three storeys high */}
		{[-60, 180, 1240, 1480].map((x) => <Column key={x} x={x} gy={GG} top={-30} w={70} />)}
		<rect x={-900} y={-700} width={3300} height={1600} fill="#0C1440" opacity={0.55} />
		<rect x={-900} y={GG} width={3300} height={600} fill="#0B1236" />
		<rect x={-900} y={GG} width={3300} height={6} fill={PAL.gold} opacity={0.8} />
		<BigBalance p={p} x={GX} y={GG} s={BS} t={t} heart={t >= tL} heartGlow={0.9 + 0.6 * clang} featherA={2 * Math.sin(t * 2.3)} />
		{/* you, tiny, at the foot of it */}
		<God id="a3-you" cast={{...CAST.ani}} pose={{...POSES.rest, head: -14, neck: -6, lean: -3, bs: -2, be: 8, fs: 8, fe: 20}} x={youX} y={GG} s={8.6} face={-1} sec={{t}} />
		<Glow x={youX} y={GG - 80} r={90} c="white" o={0.25} />
	</Stage60>;
};

/* ================= 4 · 7.9–10.9 · TITLE: 死后称心脏 in a gold cartouche over the slowly swinging balance =================
   the cartouche slams in and lands at 0.10 [8.00] (gong + gold flash + dust ring); shimmer 1.1–1.8; held to the cut. */
const CW = 1000, CH = 236, CX = FW / 2, CY = 500;
export const Shot4: React.FC<ShotProps> = ({t, dur}) => {
	const sw = 2.6 * Math.sin(2 * Math.PI * (t + 0.4) / 3.4), p = {tilt: sw, swingL: -1.5 * Math.sin(2 * Math.PI * t / 1.9), swingR: 1.2 * Math.sin(2 * Math.PI * t / 2.1 + 1), plumb: -0.4 * sw, look: -3};
	const cam = aimPath(t, [[0, CX, CY, CX, CY, 1.0], [dur + 0.6, CX, CY, CX, CY, 1.06]], (u) => u);
	const land = 0.1, k = t < land ? lerp(1.2, 1.0, sm(t / land)) : 1 + 0.035 * sm((t - land) / (dur - land)) + 0.012 * Math.exp(-(t - land) / 0.12) * Math.sin((t - land) * 50);
	const flash = pulse(t, 0, 0.1, 0.35), ap0 = t < land ? lerp(0.55, 1, t / land) : 1;
	const shim = seg(t, 1.1, 1.9);
	const BSc = 38, GG4 = 128 + 19 * BSc;
	const title = '死后称心脏';
	const half = CW / 2, r = CH / 2;
	const cart = `M${CX - half + r} ${CY - r}L${CX + half - r} ${CY - r}A${r} ${r} 0 0 1 ${CX + half - r} ${CY + r}L${CX - half + r} ${CY + r}A${r} ${r} 0 0 1 ${CX - half + r} ${CY - r}Z`;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0F1844" wear={0.3} stain={0.25}
		light={<>
			<Glow x={CX} y={CY} r={720} ry={420} c="gold" o={0.42} />
			<Glow x={CX - 292} y={330} r={160} c="red" o={0.45} />
			<Dust t={t} box={[0, 40, 1440, 932]} n={110} seed={31} c="#FFDF8E" o={0.85} vx={9} vy={-5} r={2.2} />
			<g opacity={0.55}><AmmitEyes x={CX - 330} y={GG4 + 50} s={18} open={1} t={t} /></g>
		</>}
		screen={<g>
			<GoldDefs id="a4" />
			<defs>
				<linearGradient id="a4-txt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6CF" /><stop offset="0.38" stopColor="#F9D46A" /><stop offset="0.6" stopColor="#D79A2A" /><stop offset="0.82" stopColor="#F4CF6C" /><stop offset="1" stopColor="#B07816" /></linearGradient>
				<linearGradient id="a4-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B2C74" /><stop offset="1" stopColor="#0B1238" /></linearGradient>
				<linearGradient id="a4-shim" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0} /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.95} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></linearGradient>
				<clipPath id="a4-tclip"><text x={CX - 12} y={CY + 56} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={160} letterSpacing="14">{title}</text></clipPath>
			</defs>
			<g opacity={ap0} transform={`translate(${CX},${CY}) scale(${k}) translate(${-CX},${-CY})`}>
				<path d={cart} fill="#000" opacity={0.35} transform="translate(8,12)" />
				{/* the tie bar at the right end (the cartouche's knot) */}
				<rect x={CX + half + 8} y={CY - r - 6} width={30} height={CH + 12} rx={6} fill="url(#a4-txt)" stroke="#2A1608" strokeWidth={4} />
				<path d={cart} fill="url(#a4-in)" stroke="#2A1608" strokeWidth={22} />
				<path d={cart} fill="none" stroke="url(#a4-txt)" strokeWidth={15} />
				<path d={cart} fill="none" stroke="#7A4C10" strokeWidth={4} strokeDasharray="10 9" opacity={0.75} />
				<path d={cart} fill="none" stroke={PAL.red} strokeWidth={3} transform={`translate(${CX},${CY}) scale(0.94,0.88) translate(${-CX},${-CY})`} opacity={0.9} />
				{/* the title: dark stroke, glow, gold */}
				<text x={CX - 12} y={CY + 56} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={160} letterSpacing="14" fill="none" stroke="#FFD87A" strokeWidth={22} opacity={0.18}>{title}</text>
				<text x={CX - 12} y={CY + 56} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={160} letterSpacing="14" fill="#1A0C02" stroke="#1A0C02" strokeWidth={12} strokeLinejoin="round" transform="translate(0,6)">{title}</text>
				<text x={CX - 12} y={CY + 56} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={160} letterSpacing="14" fill="url(#a4-txt)" stroke="#3A1E06" strokeWidth={3}>{title}</text>
				{shim > 0 && shim < 1 && <g clipPath="url(#a4-tclip)"><rect x={CX - 700 + 1400 * shim - 160} y={CY - 140} width={320} height={280} fill="url(#a4-shim)" opacity={0.75} style={{mixBlendMode: 'screen'}} /></g>}
				{[[CX - half + 60, CY - r + 26], [CX + half - 70, CY + r - 30]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} r={26 + 10 * Math.sin(t * 3 + i * 2)} o={0.7 + 0.3 * Math.sin(t * 2.6 + i)} a={t * 30} />)}
			</g>
			<DustBurst t={t} t0={land} x={CX} y={CY} rx={half} ry={r} n={90} seed={12} life={1.4} />
			<rect width={FW} height={1080} fill="#FFE6A8" opacity={0.55 * flash} style={{mixBlendMode: 'screen'}} />
		</g>}>
		<rect x={-400} y={-300} width={2300} height={1700} fill="#0F1844" />
		<Ceiling x0={-400} x1={1900} y0={-200} y1={PIC_T + 6} bg="#16214F" />
		<Stars t={t} box={[-100, PIC_T + 20, 1540, 820]} n={120} seed={44} o={0.8} />
		{[90, 1350].map((x) => <Column key={x} x={x} gy={GG4} top={20} w={64} />)}
		<rect x={-400} y={-300} width={2300} height={1400} fill="#0C1440" opacity={0.5} />
		<rect x={-400} y={GG4} width={2300} height={500} fill="#0A1134" /><rect x={-400} y={GG4} width={2300} height={5} fill={PAL.gold} opacity={0.8} />
		<BigBalance p={p} x={CX} y={GG4} s={BSc} t={t} heart heartGlow={0.9} featherA={3 * Math.sin(t * 1.7)} />
		<rect x={-400} y={PIC_T} width={2300} height={PIC_B - PIC_T} fill="#050a20" opacity={0.18} />
	</Stage60>;
};
export const _h = {aim, Embers};
