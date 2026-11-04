import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage60, Glow, Dust, Embers, Stars, Flame, Smoke, Shaft, toScreen, flick, FW} from './frame60';
import {Ceiling} from './sets60';
import {GlyphColumns, WingedSun} from './props60';
import {Column, Basket, LionBier, CanopicJar, Lamp} from './props60b';
import {God, CAST, POSES, Pose} from './rig60';
import {PAL, sp, poly, lerp, cl, sm, V} from './geo60';
import type {ShotProps} from './EP60';
import {pulse, seg, aimPath, aim, GoldDefs, MaskFront, Puff, BigBalance, panPos, BigMummy, HEART_AT, GlowHeart, Sparkle, DustBurst, wearAt,
	layerT, GildedTitle, TS, Brazier} from './act60a_kit';

/* ep60 act A · the hook (shots 1–3, 0.0–7.9 s), v2 after the owner's notes (15:10): Egypt from frame 0 (gold + lapis, pylon towers,
   a sun disk, pyramids, Anubis in full glamour), layered foreground / midground / background with parallax, no shakes;
   the title 死后称心脏 is lit into the hall's lintel above the giant balance in shot 3 and carries into shot 5 (Thebes).
   Times in comments: shot seconds (t), film seconds in [brackets]. */

/** a tapered limb between two points (world px) */
const limb = (a: V, b: V, r0: number, r1: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
	return sp([[a[0] + nx * r0, a[1] + ny * r0], [lerp(a[0], b[0], 0.5) + nx * (r0 + r1) * 0.55, lerp(a[1], b[1], 0.5) + ny * (r0 + r1) * 0.55], [b[0] + nx * r1, b[1] + ny * r1], [b[0] + dx / L * r1, b[1] + dy / L * r1],
		[b[0] - nx * r1, b[1] - ny * r1], [lerp(a[0], b[0], 0.5) - nx * (r0 + r1) * 0.55, lerp(a[1], b[1], 0.5) - ny * (r0 + r1) * 0.55], [a[0] - nx * r0, a[1] - ny * r0], [a[0] - dx / L * r0, a[1] - dy / L * r0]], true, 0.2); };
const keyV = (t: number, keys: [number, number, number][]): V => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = sm((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
	const k = keys[keys.length - 1]; return [k[1], k[2]]; };

/* ---------------- shot 1 pieces ---------------- */
/** a pylon tower's inner edge (the temple gate we push through): lapis panel with gold signs, gold torus moulding, a torch; side = -1 left / +1 right */
const PylonJamb: React.FC<{x: number; side: -1 | 1; t: number; flare: number}> = ({x, side, t, flare}) => {
	const outer = x + side * 900, panel = side < 0 ? [x - 200, x - 40] : [x + 40, x + 200];
	return <g>
		<path d={poly([[x, -400], [outer, -400], [outer, 1400], [x, 1400]])} fill="#C9A066" stroke={PAL.ink} strokeWidth={4} />
		{Array.from({length: 26}, (_, i) => <line key={i} x1={x} x2={outer} y1={-380 + i * 70} y2={-380 + i * 70} stroke="#A9814E" strokeWidth={3} opacity={0.6} />)}
		<rect x={panel[0]} y={-300} width={160} height={1500} fill="#1C2E78" stroke={PAL.ink} strokeWidth={4} />
		<GlyphColumns x={panel[0] + 22} y={-140} cols={2} rows={20} cell={52} seed={side < 0 ? 5 : 6} mono="#F2C14E" />
		<rect x={side < 0 ? x - 30 : x} y={-400} width={30} height={1800} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} />
		{Array.from({length: 40}, (_, i) => <path key={'r' + i} d={`M${side < 0 ? x - 30 : x} ${-400 + i * 46}l30 22`} stroke="#9C6A12" strokeWidth={4} />)}
		{/* the torch on its bracket */}
		<path d={`M${x + side * 10} 610L${x + side * 70} 610L${x + side * 70} 590`} fill="none" stroke={PAL.ink} strokeWidth={10} />
		<path d={poly([[x + side * 70 - 26, 590], [x + side * 70 + 26, 590], [x + side * 70 + 14, 556], [x + side * 70 - 14, 556]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} />
		<Flame x={x + side * 70} y={558} s={2.4 * (1 + 0.6 * flare)} t={t} seed={side < 0 ? 1 : 2} glow={0} />
	</g>;
};
/** a frontal torso under the mask (units of the mask, origin = between the eyes) */
const TORSO = (EX: number, EY: number, s: number) => sp([[-4.1, 4.4], [-3.5, 3.25], [-2.2, 2.55], [-1.2, 2.3], [1.2, 2.3], [2.2, 2.55], [3.5, 3.25], [4.1, 4.4], [3.9, 7.5, 1], [-3.9, 7.5, 1]].map(([x, y, c]) => (c ? [EX + x * s, EY + y * s, 1] : [EX + x * s, EY + y * s]) as [number, number] | [number, number, number]), true, 0.18);

/* ================= 1 · 0.0–2.8 · through the temple gate to Anubis; he tosses the grey puff into a basket =================
   frame 0: the camera is already pushing through a pylon gate (gold signs on lapis, torches flaring), Anubis's black-and-gold mask
   against a gold sun disk, pyramids under the stars. Parallax: gate ×e^0.8t (gone by 0.5), Anubis 100→114 %, sky 100→105 %.
   0.00 [0.00] torches flare + glint (cymbal crash + dum) · 0.55 [0.55] the flick (whoosh) · 1.30 [1.30] puff lands in the basket (thup)
   from 2.35 the camera tilts down (the arc's direction) into shot 2. */
export const Shot1: React.FC<ShotProps> = ({t}) => {
	const id = 'a1', s = 96, EX = 720, EY = 470, C: V = [720, 470];
	const td = Math.max(0, t - 2.35), cam = {x: 720, y: 486 + 0.5 * 1500 * td * td, z: 1};
	const kF = Math.exp(0.8 * t), kM = 1 + 0.05 * t, kB = 1 + 0.018 * t;
	const flare = Math.exp(-t / 0.28);
	// the arm (his right, viewer's left): holds the puff up beside the mask, winds up, flicks it back, drops out of frame
	const W = keyV(t, [[0, 269, 576], [0.36, 300, 600], [0.55, 210, 500], [0.8, 196, 600], [1.45, 170, 1010]]);
	const E = keyV(t, [[0, 222, 900], [0.55, 210, 892], [0.8, 214, 950], [1.45, 220, 1160]]);
	const Sh: V = [EX - 3.3 * s, EY + 3.95 * s];
	const fa = Math.atan2(W[1] - E[1], W[0] - E[0]), hand: V = [W[0] + Math.cos(fa) * 30, W[1] + Math.sin(fa) * 30];
	const tRel = 0.55, tLand = 1.3, B: V = [190, 862];
	const relHand = (() => { const w = keyV(tRel, [[0, 269, 576], [0.36, 300, 600], [0.55, 210, 500]]), e = keyV(tRel, [[0, 222, 900], [0.55, 210, 892]]), a = Math.atan2(w[1] - e[1], w[0] - e[0]); return [w[0] + Math.cos(a) * 30, w[1] + Math.sin(a) * 30] as V; })();
	const P0: V = [relHand[0] - 2, relHand[1] - 70];
	const arc = (u: number): V => [lerp(P0[0], B[0], u), lerp(P0[1], B[1], u) - 520 * 4 * u * (1 - u) * (1 - 0.25 * u)];
	let puff: V = [hand[0] - 2, hand[1] - 70], pa = 8 * Math.sin(t * 3), sq = 0;
	if (t >= tRel) { const u = cl((t - tRel) / (tLand - tRel)); puff = arc(u); pa = 420 * u; sq = 0.1 * Math.sin(u * 9); }
	if (t > tLand) { const v = t - tLand; puff = [B[0], B[1] + 14 * sm(v / 0.2)]; pa = 420; sq = 0.18 * Math.exp(-v / 0.12) * Math.cos(v * 40); }
	const bask = 1 - 0.06 * pulse(t, tLand, 0.03, 0.12);
	const glint = Math.max(0, 1 - t / 0.42), eyesFlare = 0.5 * pulse(t, 1.45, 0.12, 0.45);
	const trail = t > tRel && t < tLand ? Array.from({length: 5}, (_, i) => { const tt = t - (i + 1) * 0.035; if (tt < tRel) return null; const p = arc(cl((tt - tRel) / (tLand - tRel)));
		return <circle key={i} cx={p[0]} cy={p[1]} r={44 - i * 6} fill="#C8CED8" opacity={0.2 - i * 0.035} />; }) : null;
	const rays = Array.from({length: 24}, (_, i) => { const a = (i / 24) * Math.PI * 2 + t * 0.08, r0 = 230, r1 = i % 2 ? 520 : 640;
		return <path key={i} d={poly([[720 + Math.cos(a - 0.035) * r0, 300 + Math.sin(a - 0.035) * r0], [720 + Math.cos(a) * r1, 300 + Math.sin(a) * r1], [720 + Math.cos(a + 0.035) * r0, 300 + Math.sin(a + 0.035) * r0]])} fill="#F6CB55" opacity={0.28} />; });
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0E1640" wear={0.1} stain={0.14} wobble={1.6}
		light={<>
			<g transform={layerT(kB, C)}><Glow x={720} y={300} r={560} c="gold" o={0.55} /><g style={{mixBlendMode: 'screen'}}>{rays}</g></g>
			<g transform={layerT(kM, C)}>
				<Glow x={EX - 220} y={EY - 20} r={240} c="warm" o={0.3 + 0.08 * flick(t, 5)} />
				{t > tLand - 0.05 && <DustBurst t={t} t0={tLand} x={B[0]} y={B[1] - 26} rx={60} ry={14} n={26} seed={4} c="#E8E2D2" life={0.7} />}
			</g>
			{kF < 3 && <g transform={layerT(kF, C)}>
				{[-1, 1].map((k) => <Glow key={k} x={720 + k * 562} y={500} r={420 * (1 + 0.5 * flare)} c="warm" o={0.75 + 0.1 * flick(t, k + 3)} />)}
				<Embers t={t} x={720 - 562} y={520} n={14} seed={3} h={400} spread={40} s={1.4} /><Embers t={t} x={720 + 562} y={520} n={14} seed={4} h={400} spread={40} s={1.4} />
			</g>}
			{/* gold dust flying toward us */}
			<g transform={layerT(1 + 0.12 * t, C)}><Dust t={t} box={[0, 40, 1440, 940]} n={90} seed={13} c="#FFE2A0" o={0.85} vx={-5} vy={-8} r={2.2} /></g>
			<Shaft pts={[[300, 40], [440, 40], [560, 940], [380, 940]]} o={0.14} />
		</>}>
		<GoldDefs id={id} />
		<defs><linearGradient id="a1-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1236" /><stop offset="0.55" stopColor="#1C2F86" /><stop offset="0.85" stopColor="#5A3A86" /><stop offset="1" stopColor="#B8604A" /></linearGradient>
			<radialGradient id="a1-sun" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stopColor="#FFF0B0" /><stop offset="0.55" stopColor="#F6C14A" /><stop offset="1" stopColor="#D88A1E" /></radialGradient></defs>
		{/* background: the night sky, the gold sun disk behind his head, the pyramids on the horizon */}
		<g transform={layerT(kB, C)}>
			<rect x={-600} y={-600} width={2700} height={1400} fill="url(#a1-sky)" />
			<Stars t={t} box={[-200, -60, 1640, 640]} n={170} seed={21} />
			<circle cx={720} cy={300} r={236} fill="#2A1608" opacity={0.5} />
			<circle cx={720} cy={300} r={228} fill="url(#a1-sun)" stroke={PAL.ink} strokeWidth={5} />
			<circle cx={720} cy={300} r={196} fill="none" stroke="#C2381E" strokeWidth={10} opacity={0.8} />
			<circle cx={720} cy={300} r={176} fill="none" stroke="#FFF2C0" strokeWidth={3} opacity={0.7} />
			{[[230, 520, 290], [470, 660, 170], [1200, 548, 280]].map(([ax, ay, hw], i) => <g key={i}>
				<path d={poly([[ax - hw, 800], [ax, ay], [ax + hw, 800]])} fill={i === 1 ? '#3A2A5A' : '#2A2250'} stroke={PAL.ink} strokeWidth={3} />
				<path d={poly([[ax, ay], [ax + hw, 800], [ax + hw * 0.55, 800]])} fill="#5A3A6A" opacity={0.8} />
				<path d={`M${ax - hw} 800L${ax} ${ay}`} stroke="#F6C14A" strokeWidth={4} opacity={0.85} /></g>)}
			<rect x={-600} y={790} width={2700} height={600} fill="#4A2A3A" />
			<rect x={-600} y={790} width={2700} height={4} fill="#F6C14A" opacity={0.6} />
		</g>
		{/* midground: Anubis. Draw order: the raised arm, then the torso over its root (no seam), collar, lappets, the mask */}
		<g transform={layerT(kM, C)}>
			{trail}
			{t < tRel && <Puff x={puff[0]} y={puff[1]} r={56} a={pa} sq={sq} />}
			<path d={limb(Sh, E, 74, 58)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
			<path d={limb(E, W, 56, 40)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
			<path d={`M${E[0] + 22} ${E[1] - 4}Q${lerp(E[0], W[0], 0.5) + 30} ${lerp(E[1], W[1], 0.5)} ${W[0] + 24} ${W[1] + 10}`} fill="none" stroke={PAL.skinM2} strokeWidth={11} opacity={0.6} strokeLinecap="round" />
			<g transform={`translate(${W[0]},${W[1]}) rotate(${fa * 180 / Math.PI + 90})`}>
				<rect x={-46} y={-22} width={92} height={36} rx={8} fill={`url(#${id}-gold)`} stroke={PAL.ink} strokeWidth={4} /><rect x={-46} y={-10} width={92} height={10} fill={PAL.blue} /><rect x={-46} y={4} width={92} height={5} fill={PAL.red} />
			</g>
			{/* the hand: palm up, fingers curled round the puff's base, thumb in front */}
			<g transform={`translate(${hand[0]},${hand[1]}) rotate(${fa * 180 / Math.PI + 90})`}>
				<path d={sp([[-40, 20], [-44, -12], [-30, -40], [-6, -50], [22, -44], [40, -22], [42, 10], [26, 34], [-14, 36]], true, 0.2)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
				{[-26, -8, 10, 28].map((xx) => <path key={xx} d={`M${xx} -40Q${xx + 4} -20 ${xx + 2} -6`} fill="none" stroke={PAL.skinM2} strokeWidth={4} strokeLinecap="round" />)}
				<path d="M38 -6Q58 -28 42 -52Q34 -60 26 -48" fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} strokeLinejoin="round" />
			</g>
			<path d={TORSO(EX, EY, s)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={5} />
			<path d={`M${EX - 2.6 * s} ${EY + 5.4 * s}Q${EX - 1.3 * s} ${EY + 6.0 * s} ${EX - 0.2 * s} ${EY + 5.5 * s}M${EX + 0.2 * s} ${EY + 5.5 * s}Q${EX + 1.3 * s} ${EY + 6.0 * s} ${EX + 2.6 * s} ${EY + 5.4 * s}`} fill="none" stroke={PAL.skinM2} strokeWidth={5} opacity={0.7} />
			<g transform={`rotate(${0.7 * Math.sin(t * 1.2)} ${EX} ${EY + 500})`}><MaskFront x={EX} y={EY} s={s} t={t} id={id} glint={glint} flare={eyesFlare} /></g>
			{t >= tRel && <Puff x={puff[0]} y={puff[1]} r={56} a={pa} sq={sq} />}
			<g transform={`translate(${B[0]},975) scale(1,${bask}) translate(${-B[0]},-975)`}><Basket x={B[0]} y={975} w={176} h={124} /></g>
			<path d={`M${B[0] - 88} 851Q${B[0]} 837 ${B[0] + 88} 851`} fill="none" stroke="#8A5A2E" strokeWidth={4} />
		</g>
		{/* foreground: the pylon gate we push through */}
		{kF < 3 && <g transform={layerT(kF, C)}><PylonJamb x={232} side={-1} t={t} flare={flare} /><PylonJamb x={1208} side={1} t={t} flare={flare} /></g>}
	</Stage60>;
};

/* ================= 2 · 2.8–5.0 · match on the arc: down past the winged Isis on the wall onto the mummy; the heart glows, two beats =================
   tin 'own' (0.35 s). Layers: wall + Isis (background, slower), the mummy on its bier, a jar and a lamp in the foreground (faster).
   beats (lub-dub) at 0.77 [3.57] and 1.54 [4.34]. */
const B2 = [0.77, 1.54];
export const Shot2: React.FC<ShotProps> = ({t}) => {
	const id = 'a2', ms = 74, mx0 = -20, my0 = 742;
	const hp: V = [mx0 + HEART_AT[0] * ms, my0 + HEART_AT[1] * ms];
	const beat = B2.reduce((a, b) => a + pulse(t, b, 0.04, 0.16) + 0.55 * pulse(t, b + 0.17, 0.04, 0.22), 0);
	const glow = 0.55 + 0.75 * beat;
	const cam = aimPath(t, [[-0.4, 720, 230, 720, 486, 0.95], [1.1, hp[0], hp[1], 700, 520, 1.5], [2.6, hp[0] + 10, hp[1] + 4, 700, 520, 1.66]], (u) => 1 - Math.pow(1 - cl(u), 2.2));
	const kB = Math.pow(cam.z / 1.5, -0.25), kF = Math.pow(cam.z / 1.5, 0.6), cc: V = [cam.x, cam.y];
	const inO = sm((t + 0.35) / 0.35);
	const isis: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 2, head: 2, bs: 72 + 3 * Math.sin(t * 0.8), be: 8, bw: -16, fs: 100 + 3 * Math.sin(t * 0.8 + 0.4), fe: 6, fw: -18};
	return <AbsoluteFill style={{opacity: inO}}>
		<Stage60 t={t} cam={cam} grade="lapis" bg="#0E1640" wear={wearAt(cam.z, 0.25)} stain={wearAt(cam.z, 0.25)} dark={0.3} darkC="#070C24"
			light={<>
				<Glow x={hp[0]} y={hp[1]} r={420 * (0.8 + 0.3 * beat)} c="red" o={0.55 + 0.35 * beat} />
				<Glow x={hp[0]} y={hp[1]} r={160} c="gold" o={0.35 + 0.4 * beat} />
				<Shaft pts={[[560, -200], [700, -200], [hp[0] + 160, hp[1] + 120], [hp[0] - 60, hp[1] + 120]]} o={0.3} />
				<g transform={layerT(kB, cc)}><Glow x={720} y={260} r={380} c="gold" o={0.28} /></g>
				<g transform={layerT(kF, cc)}><Glow x={1040} y={880} r={260} c="warm" o={0.6 + 0.1 * flick(t, 2)} /><Smoke t={t} x={1040} y={870} n={8} seed={6} h={420} o={0.25} /></g>
				<Dust t={t} box={[200, 0, 1500, 900]} n={50} seed={8} c="#FFD2A0" o={0.55} vx={-3} vy={-5} />
			</>}>
			<GoldDefs id={id} />
			{/* background: the tomb wall: stars on the ceiling, winged Isis spreading her wings over you, gold signs */}
			<g transform={layerT(kB, cc)}>
				<rect x={-800} y={-600} width={3100} height={2000} fill="#13205A" />
				<Ceiling x0={-800} x1={2300} y0={-420} y1={-60} bg="#121C4A" />
				<rect x={-800} y={-60} width={3100} height={12} fill={PAL.gold} />
				<WingedSun x={720} y={10} s={13} span={11} t={t} />
				<God id="a2-isis" cast={{...CAST.isis}} pose={isis} x={640} y={560} s={20} sec={{t}} />
				<GlyphColumns x={-200} y={100} cols={8} rows={9} cell={44} seed={23} mono="#E8B83E" />
				<GlyphColumns x={1110} y={100} cols={8} rows={9} cell={44} seed={24} mono="#E8B83E" />
				<rect x={-800} y={560} width={3100} height={14} fill={PAL.gold} opacity={0.8} />
			</g>
			{/* midground: you on the lion bier */}
			<LionBier x={-60} y={my0 + 5.2 * ms} s={ms} len={20.6} />
			<BigMummy x={mx0} y={my0} s={ms} t={t} id={id} glow={glow} heartShow={0.7 + 0.3 * beat} rings={B2.map((b) => (t - b) / 0.75)} />
			{/* foreground: a canopic jar and a lamp, passing faster */}
			<g transform={layerT(kF, cc)}>
				<CanopicJar x={1150} y={930} s={26} head="jackal" t={t} glow={0.3} />
				<CanopicJar x={1255} y={945} s={24} head="falcon" t={t} glow={0.3} />
				<Lamp x={1040} y={940} s={1.6} t={t} seed={3} />
			</g>
		</Stage60>
	</AbsoluteFill>;
};

/* ================= 3 · 5.0–7.9 · the heart drops on the left pan; pull back: a three-storey balance under a gateway whose lintel
   lights up with the title 死后称心脏; two yellow eyes open beneath =================
   0.45 [5.45] CLANG + chain rattle (to ~6.2) · pull-back 0.55–1.9 [5.55–6.90] · the title's gold runs in 1.45–1.9 and LANDS at 1.90 [6.90]
   (gong + reed swell) · eyes open 2.15 [7.15] (low growl) · camera holds on the title from 1.9 (it carries into shot 5 at the same place). */
const GX = 640, GG = 900, BS = 36, LY = GG - 1150, TWW = TS.w * 1.0;
export const ZE3 = TS.w / 1264;
const tiltAt = (t: number, tL: number) => { if (t < tL) return {tilt: -0.6, swingL: 0, swingR: 0};
	const u = t - tL; return {tilt: 3.2 + 4.8 * Math.exp(-u / 0.55) * Math.cos(2 * Math.PI * u / 1.05), swingL: 5 * Math.exp(-u / 0.7) * Math.sin(2 * Math.PI * u / 0.8), swingR: -3.5 * Math.exp(-u / 0.8) * Math.sin(2 * Math.PI * u / 0.9 + 0.5)}; };
const AmmitEyes: React.FC<{x: number; y: number; s: number; open: number; t: number}> = ({x, y, s, open, t}) => {
	if (open <= 0.01) return null; const look = 0.06 * Math.sin(t * 1.3);
	const eye = (k: number) => <g key={k} transform={`translate(${x + k * 0.75 * s},${y - k * 0.05 * s}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={0.85} ry={0.55 * open} fill="url(#g60-gold)" opacity={0.6} style={{mixBlendMode: 'screen'}} />
		<path d={`M-0.42 0Q0 ${-0.3 * open} 0.42 ${-0.04}Q0 ${0.26 * open} -0.42 0Z`} fill="#F7D21E" stroke="#140A02" strokeWidth={0.05} />
		<ellipse cx={look} cy={-0.01} rx={0.045} ry={0.2 * open} fill="#140A02" /></g>;
	return <g>{eye(-1)}{eye(1)}</g>;
};
export const Shot3: React.FC<ShotProps> = ({t}) => {
	const tL = 0.45, st = tiltAt(t, tL), p = {tilt: st.tilt, swingL: st.swingL, swingR: st.swingR, plumb: -0.4 * st.tilt, look: -3};
	const pan = panPos(p, GX, GG, BS, 'L'), pan0 = panPos({tilt: -0.6}, GX, GG, BS, 'L');
	const cam = aimPath(t, [[0, pan0[0], pan0[1] - 30, 700, 470, 1.75], [0.55, pan0[0] + 6, pan0[1] - 26, 700, 476, 1.7], [1.9, GX, LY, TS.x, TS.y, ZE3]]);
	const fall = t < tL ? sm(t / tL) : 1, hy = t < tL ? lerp(pan0[1] - 260, pan0[1], fall * fall) : 0;
	const clang = pulse(t, tL, 0.02, 0.25), eyes = sm(seg(t, 2.1, 2.5));
	const lit = sm(seg(t, 1.45, 1.9)), flash = pulse(t, 1.9, 0.03, 0.35);
	const tp = toScreen(cam, GX, LY), tw = 1264 * cam.z;
	const kF = Math.pow(cam.z / ZE3, 0.35), cc: V = [cam.x, cam.y];
	const youX = GX + 380;
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#101A48" wear={wearAt(cam.z, 0.35)} stain={wearAt(cam.z, 0.3)}
		light={<>
			<Glow x={GX} y={GG - 520} r={760} c="gold" o={0.4} />
			<Glow x={GX} y={LY} r={900} ry={260} c="gold" o={0.15 + 0.5 * lit} />
			<Shaft pts={[[GX - 300, LY + 150], [GX + 300, LY + 150], [GX + 620, GG], [GX - 620, GG]]} o={0.25 + 0.2 * lit} />
			<Glow x={pan[0]} y={pan[1] - 30} r={220 * (1 + 0.6 * clang)} c="red" o={0.55 + 0.4 * clang} />
			{clang > 0.02 && <Sparkle x={pan[0] - 40} y={pan[1] + 6} r={70 * clang} o={clang} a={20} />}
			{t < tL && <GlowHeart x={pan0[0]} y={hy} s={BS} glow={1.2} a={-8 * (1 - fall)} />}
			<ellipse cx={GX - 300} cy={GG - 80} rx={460} ry={240} fill="url(#a3-shade)" />
			<AmmitEyes x={GX - 330} y={GG - 110} s={84} open={eyes} t={t} />
			<Dust t={t} box={[-600, -700, 1900, 900]} n={110} seed={9} c="#FFE2A0" o={0.6} vx={-4} vy={-5} r={2.4} />
			{/* the braziers in the foreground (parallax: they slide in from the edges as we pull back) */}
			<g transform={layerT(kF, cc)}>{[[-299, 1], [1579, -1]].map(([x, k]) => <g key={x}><Glow x={x} y={430} r={460} c="warm" o={0.7 + 0.1 * flick(t, k + 2)} /><Embers t={t} x={x} y={420} n={16} seed={x > 0 ? 5 : 6} h={600} spread={110} s={1.8} /></g>)}</g>
		</>}
		screen={<GildedTitle x={tp[0]} y={tp[1]} w={tw} lit={lit} flash={flash} t={t} id="a3t" o={cl((ZE3 * 1.9 - cam.z) / (ZE3 * 0.5)) } />}>
		<GoldDefs id="a3" />
		{/* the hall: lapis wall with gold signs, the great gateway behind the balance, its lintel (the title is set into it) */}
		<rect x={-1400} y={-1400} width={4400} height={3200} fill="#13205A" />
		<Ceiling x0={-1400} x1={3000} y0={-1100} y1={-640} bg="#16214F" />
		{[-1, 1].map((k) => <GlyphColumns key={k} x={k < 0 ? -1080 : GX + 860} y={-560} cols={6} rows={16} cell={78} seed={k < 0 ? 31 : 32} mono="#E8B83E" />)}
		<rect x={GX - 540} y={LY + 130} width={1080} height={GG - LY - 130} fill="#060B22" />
		<Stars t={t} box={[GX - 520, LY + 150, GX + 520, GG - 40]} n={60} seed={12} o={0.5} />
		<rect x={GX - 780} y={LY - 140} width={1560} height={270} fill="#1B2A6A" stroke={PAL.ink} strokeWidth={6} />
		<rect x={GX - 780} y={LY - 140} width={1560} height={18} fill={PAL.gold} /><rect x={GX - 780} y={LY + 112} width={1560} height={18} fill={PAL.gold} />
		<path d={poly([[GX - 800, LY - 140], [GX + 800, LY - 140], [GX + 860, LY - 290], [GX - 860, LY - 290]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={5} />
		{Array.from({length: 36}, (_, i) => { const u = (i + 0.5) / 36, a = GX - 800 + u * 1600, b = GX - 860 + u * 1720;
			return <path key={i} d={poly([[a - 14, LY - 144], [a + 14, LY - 144], [b + 16, LY - 286], [b - 16, LY - 286]])} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={2} />; })}
		<WingedSun x={GX} y={LY - 360} s={26} span={13} t={t} />
		{[[GX - 640, LY + 130], [GX + 640, LY + 130]].map(([x]) => <rect key={x} x={x - 110} y={LY + 130} width={220} height={GG - LY - 130} fill="#1B2A6A" stroke={PAL.ink} strokeWidth={5} />)}
		{[-1, 1].map((k) => <GlyphColumns key={'j' + k} x={GX + k * 640 - 80} y={LY + 180} cols={2} rows={12} cell={74} seed={40 + k} mono="#F2C14E" />)}
		{[GX - 1000, GX + 1000].map((x) => <Column key={x} x={x} gy={GG} top={LY - 300} w={110} />)}
		<rect x={-1400} y={GG} width={4400} height={900} fill="#0B1236" />
		<rect x={-1400} y={GG} width={4400} height={8} fill={PAL.gold} opacity={0.85} />
		<BigBalance p={p} x={GX} y={GG} s={BS} t={t} heart={t >= tL} heartGlow={0.9 + 0.6 * clang} featherA={2 * Math.sin(t * 2.3)} />
		{/* you, tiny, at its foot, looking up */}
		<God id="a3-you" cast={{...CAST.ani}} pose={{...POSES.rest, head: -14, neck: -6, lean: -3, bs: -2, be: 8, fs: 8, fe: 20}} x={youX} y={GG} s={8.6} face={-1} sec={{t}} />
		{/* foreground braziers (parallax) */}
		<g transform={layerT(kF, cc)}><Brazier x={-299} y={760} s={1.5} t={t} seed={1} /><Brazier x={1579} y={760} s={1.5} t={t} seed={2} /></g>
	</Stage60>;
};
export const _h = {aim, Embers, FW, TWW, Shaft};
