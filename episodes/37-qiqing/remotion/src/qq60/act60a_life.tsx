import React from 'react';
import {Stage60, Glow, Dust, Embers, Smoke, Shaft, Stars, Flame, flick, rng, PIC_T, FW, F_SERIF, toScreen} from './frame60';
import {GlyphColumns, Balance, WingedSun} from './props60';
import {Mummy, LionBier, BIER_H, CanopicJar, Lamp, HeartScarab, Basket, River, Palm, STONE, JarHead} from './props60b';
import {God, CAST, POSES, Pose, solve, reach, wristTo, holdAt} from './rig60';
import {CAST2, ANI, tendPose, scribePose} from './cast60';
import {PAL, sp, poly, lerp, cl, sm, V, ap, mx} from './geo60';
import type {ShotProps} from './EP60';
import {pulse, seg, aimPath, GoldDefs, Puff, HEART_D, Sparkle, DustBurst, wearAt, GlyphRun, MUMMY_BODY} from './act60a_kit';

/* ep60 act A · life and death (shots 5–9, 10.9–26.5 s): Thebes at sunset; the 70-day embalming (time-lapse); the hook twirl;
   the heart that remembers everything; the heart scarab laid on the chest. Times: shot seconds (t), film seconds in [brackets]. */
const GY = 852;
const figT = (x: number, y: number, s: number, face: 1 | -1 = 1) => `translate(${x},${y}) scale(${s * face},${s})`;
const toW = (x: number, y: number, s: number, face: 1 | -1, p: V): V => [x + face * s * p[0], y + s * p[1]];
const keyV = (t: number, keys: [number, number, number][], ease = sm): V => { if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = ease((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
	const k = keys[keys.length - 1]; return [k[1], k[2]]; };
const key1 = (t: number, keys: [number, number][], ease = sm): number => { if (t <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return lerp(a[1], b[1], ease((t - a[0]) / (b[0] - a[0]))); }
	return keys[keys.length - 1][1]; };

/* ---------------- small props ---------------- */
const ScribePalette: React.FC<{x: number; y: number; a?: number; w?: number}> = ({x, y, a = 0, w = 150}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<rect x={-w / 2} y={-11} width={w} height={22} rx={3} fill="#D9A85A" stroke={PAL.ink} strokeWidth={2.4} />
	<rect x={-w / 2 + 44} y={-3} width={w - 54} height={6} rx={3} fill="#A8743A" stroke={PAL.ink} strokeWidth={1.2} />
	<circle cx={-w / 2 + 14} cy={-1} r={6} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.4} /><circle cx={-w / 2 + 30} cy={-1} r={6} fill={PAL.black} stroke={PAL.ink} strokeWidth={1.4} />
	<path d={`M${-w / 2 + 50} -1L${w / 2 - 16} -1`} stroke="#C9A060" strokeWidth={3} />
</g>;
const Lotus: React.FC<{x: number; y: number; a?: number; len?: number}> = ({x, y, a = 0, len = 90}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<path d={`M0 8Q6 ${-len * 0.5} 2 ${-len}`} fill="none" stroke="#3A8A4A" strokeWidth={4} strokeLinecap="round" />
	<g transform={`translate(2,${-len})`}>
		<path d={poly([[-22, -26], [-11, 2], [11, 2], [22, -26], [9, -14], [0, -36], [-9, -14]])} fill="#3F6FD0" stroke={PAL.ink} strokeWidth={2} strokeLinejoin="round" />
		<path d={poly([[-8, -12], [0, -30], [8, -12], [0, 0]])} fill="#7FA6F0" opacity={0.8} />
		<path d="M-12 2Q0 10 12 2" fill="#3A8A4A" stroke={PAL.ink} strokeWidth={1.6} />
	</g>
</g>;
const SailBoat: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => { const rk = 1.5 * Math.sin(t * 1.3), bl = 6 * Math.sin(t * 0.9);
	return <g transform={`translate(${x},${y + 2 * Math.sin(t * 1.7)}) rotate(${rk}) scale(${s})`}>
		<path d={`M-80 -46L-80 -54M-52 -30L68 -30`} stroke={PAL.ink} strokeWidth={3} />
		<path d={sp([[-40, -200, 1], [52, -204, 1], [56 + bl, -110], [54, -36, 1], [-44, -34, 1], [-36 + bl * 0.6, -120]], true, 0.18)} fill="#F4E9CF" stroke={PAL.ink} strokeWidth={2.6} />
		{[-170, -140, -110, -80, -55].map((yy) => <path key={yy} d={`M${-40} ${yy}Q${8 + bl} ${yy + 4} ${54} ${yy}`} fill="none" stroke="#C9B58A" strokeWidth={1.6} />)}
		<path d="M6 -214L8 -18" stroke="#6A4626" strokeWidth={5} />
		<path d={sp([[-110, -40], [-80, -14], [0, -6], [80, -14], [118, -46], [124, -52, 1], [96, -10], [40, 6], [-40, 6], [-96, -8], [-118, -36, 1]], true, 0.18)} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2.6} />
		<path d="M-90 -14Q0 2 92 -16" fill="none" stroke={PAL.gold} strokeWidth={3} />
		<path d="M-96 -30L-120 10" stroke={PAL.ink} strokeWidth={4} />
	</g>; };
const House: React.FC<{x: number; y: number; w: number; h: number; c?: string; seed: number}> = ({x, y, w, h, c = '#C98A52', seed}) => { const R = rng(seed);
	return <g>
		<rect x={x} y={y - h} width={w} height={h} fill={c} stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={x - 4} y={y - h - 8} width={w + 8} height={10} fill="#B07644" stroke={PAL.ink} strokeWidth={2} />
		{Array.from({length: Math.max(1, Math.floor(w / 46))}, (_, i) => <rect key={i} x={x + 14 + i * 46} y={y - h + 22 + R() * 10} width={14} height={10} fill="#3A2214" />)}
		{R() > 0.4 && <rect x={x + w * 0.55} y={y - 46} width={22} height={46} fill="#4A2A16" />}
		{R() > 0.5 && <g><path d={poly([[x + 6, y - h - 8], [x + 6, y - h - 44], [x + w * 0.45, y - h - 44], [x + w * 0.45, y - h - 8]])} fill="none" stroke="#6A4626" strokeWidth={3} /><path d={poly([[x, y - h - 44], [x + w * 0.5, y - h - 44], [x + w * 0.48, y - h - 54], [x + 2, y - h - 54]])} fill="#E6D6A8" stroke={PAL.ink} strokeWidth={1.8} /></g>}
		<path d={`M${x} ${y - h * 0.4}L${x + w} ${y - h * 0.4}`} stroke="#A86E3A" strokeWidth={1.4} opacity={0.5} />
	</g>; };

/* ---------------- the west-bank temple pylon at sunset (world px): towers, the gateway whose lintel carries the title, the sun in its door ---------------- */
const Pylon5: React.FC<{t: number}> = ({t}) => {
	const tower = (x0: number, x1: number, k: number) => <g>
		<path d={poly([[x0, 520], [x1, 520], [x1 - k * 34, 122], [x0 + k * 34, 122]])} fill="#D9A866" stroke={PAL.ink} strokeWidth={3} />
		<path d={poly([[x0 + k * 34 - 6, 122], [x1 - k * 34 + 6, 122], [x1 - k * 30 + 10, 104], [x0 + k * 30 - 10, 104]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 9}, (_, i) => <line key={i} x1={x0 + 10} x2={x1 - 10} y1={160 + i * 40} y2={160 + i * 40} stroke="#B98A50" strokeWidth={2} opacity={0.6} />)}
		{/* carved sign columns low on the tower (the upper face stays plain: the stamp sits over the right one) */}
		<GlyphColumns x={(x0 + x1) / 2 - 70} y={300} cols={3} rows={5} cell={42} seed={x0 > 0 ? 8 : 7} mono="#8A4A22" />
	</g>;
	const pen = (x: number, ph: number) => <g><line x1={x} y1={520} x2={x} y2={128} stroke="#6A4626" strokeWidth={7} />
		<path d={`M${x} 132Q${x + 26} ${138 + 6 * Math.sin(t * 3 + ph)} ${x + 52} ${136 + 10 * Math.sin(t * 3.4 + ph)}L${x + 50} ${152 + 8 * Math.sin(t * 3 + ph)}Q${x + 24} ${152 + 4 * Math.sin(t * 2.6 + ph)} ${x} 150Z`} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.6} /></g>;
	return <g>
		{tower(-180, 250, 1)}{tower(1030, 1460, -1)}
		{pen(262, 0)}{pen(1014, 1.4)}
		{/* the gateway: cornice, the lintel (the title's cartouche sits on it, drawn in screen space), jambs, the door with the setting sun */}
		<rect x={220} y={150} width={840} height={370} fill="#E2B474" stroke={PAL.ink} strokeWidth={3} />
		<path d={poly([[214, 150], [1066, 150], [1090, 108], [190, 108]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={3} />
		{Array.from({length: 30}, (_, i) => { const u = (i + 0.5) / 30, a2 = 214 + u * 852, b2 = 190 + u * 900;
			return <path key={i} d={poly([[a2 - 9, 148], [a2 + 9, 148], [b2 + 10, 110], [b2 - 10, 110]])} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={1.2} />; })}
		<WingedSun x={640} y={214} s={16} span={22} t={t} />
		<GlyphColumns x={262} y={276} cols={20} rows={2} cell={38} seed={52} mono="#7A3A1A" />
		<rect x={220} y={380} width={840} height={12} fill={PAL.red} opacity={0.8} />
		<rect x={470} y={392} width={340} height={128} fill="#F6B05A" />
		<circle cx={640} cy={498} r={58} fill="#FFD27A" stroke="#E8642A" strokeWidth={4} />
		<rect x={470} y={392} width={340} height={128} fill="none" stroke={PAL.ink} strokeWidth={4} />
		{[300, 900].map((x) => <GlyphColumns key={x} x={x} y={404} cols={2} rows={3} cell={34} seed={x} mono="#7A3A1A" />)}
	</g>;
};
/* ================= 5 · 8.4–11.3 (v3) · Thebes at sunset: across the Nile a temple pylon, the sun setting in its gate (no title here);
   you, a young scribe, set down your palette; a blue lotus slips =================
   dissolve in (0.3, from 8.10); slow crane down. Palette tap 1.35 [9.75] · lotus slips 1.75 [10.15] · lands 2.3 [10.70] · Nile lapping. */
export const TX5 = 640, TY5 = 268;
export const Shot5: React.FC<ShotProps> = ({t}) => {
	const S = 25, fx = 380, tableX = 590, tableY = 640, GY5 = 860;
	const cam = aimPath(t, [[-0.3, TX5, TY5, 640, 300, 1.0], [2.9, TX5, TY5, 640, 240, 1.04]], (u) => u);
	const tTap = 1.35, tSlip = 1.75, tLand = 2.3;
	const hTarget = keyV(t, [[0, 3.5, -12.6], [tTap, (tableX - 30 - fx) / S, (tableY - 14 - GY5) / S], [tTap + 0.25, (tableX - 30 - fx) / S, (tableY - 14 - GY5) / S], [tTap + 0.9, 3.0, -9.0]]);
	let pose: Pose = {...POSES.rest, lean: lerp(1, 7, sm(seg(t, 0.2, tTap))) - 3 * sm(seg(t, tTap + 0.3, tTap + 1.0)), neck: 4, head: lerp(2, 10, sm(seg(t, 0, tTap))) - 6 * sm(seg(t, 1.9, 2.5)), rt: -8, at: 11, rk: 3, ak: 2};
	pose = wristTo(reach(pose, 'f', hTarget), 'f', t < tTap + 0.3 ? 82 : 40);
	const slip = seg(t, tSlip - 0.15, tSlip);
	pose = wristTo(reach(pose, 'b', [-2.0 - 0.2 * slip, -8.6]), 'b', -20 + 30 * slip);
	const g = solve(pose), fGrip = toW(fx, GY5, S, 1, ap(g.fH, [0.02, 0.6])), bGrip = toW(fx, GY5, S, 1, ap(g.bH, [0.02, 0.6]));
	const palOn = t >= tTap, palP: V = palOn ? [tableX + 22, tableY - 11] : [fGrip[0] + 52, fGrip[1] - 2];
	let lotus: V = [bGrip[0] - 2, bGrip[1] + 8], la = -32;
	if (t > tSlip) { const u = cl((t - tSlip) / (tLand - tSlip)); lotus = [lerp(bGrip[0] - 2, bGrip[0] - 90, u), lerp(bGrip[1] + 8, GY5 - 6, u * u)]; la = lerp(-32, -100, sm(u)); }
	if (t > tLand) { const v = t - tLand; lotus = [bGrip[0] - 90, GY5 - 6 - 5 * Math.exp(-v / 0.1) * Math.abs(Math.sin(v * 22))]; la = -100; }
	// the reed pen tucked behind the ear: drawn over the head, then the ear drawn again over the pen (it passes UNDER the ear)
	const H = g.head, penA = ap(H, [-0.75, -1.9]), penB = ap(H, [0.34, -0.86]);
	return <Stage60 t={t} cam={cam} grade="papyrus" bg="papyrus" wear={0.16} stain={0.12} tags={[{x: fx - 130, y: 440, text: '你'}]}
		light={<>
			<Glow x={640} y={480} r={560} c="warm" o={0.85} />
			<Glow x={640} y={490} r={150} c="white" o={0.75} />
			<Shaft pts={[[480, 392], [800, 392], [1000, 900], [280, 900]]} o={0.28} />
			<Glow x={640} y={570} r={240} ry={60} c="warm" o={0.7} />
			<Glow x={fx - 60} y={600} r={260} c="warm" o={0.3} />
			<Dust t={t} box={[0, 100, 1300, 860]} n={60} seed={5} c="#FFE0A0" o={0.65} vx={6} vy={-3} />
			{t > tLand - 0.02 && <DustBurst t={t} t0={tLand} x={lotus[0] - 20} y={GY5 - 4} rx={30} ry={6} n={14} seed={2} c="#FFF0C0" life={0.6} />}
		</>}
>
		<defs><linearGradient id="a5-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E2470" /><stop offset="0.35" stopColor="#B23A56" /><stop offset="0.7" stopColor="#F2743A" /><stop offset="1" stopColor="#FFC456" /></linearGradient>
			<linearGradient id="a5-nile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E89A5A" /><stop offset="0.25" stopColor="#4E6FB0" /><stop offset="1" stopColor="#2E4F94" /></linearGradient></defs>
		<rect x={-400} y={-500} width={2300} height={1020} fill="url(#a5-sky)" />
		{/* the west bank: the Theban hills, palms, the temple pylon */}
		<path d={`M-400 520L-200 470L0 440L120 420L200 380L260 400L1100 420L1240 380L1320 400L1900 470L1900 520Z`} fill="#7E3E50" stroke={PAL.ink} strokeWidth={2.4} />
		<Pylon5 t={t} />
		{[60, 1240, 1330].map((x, i) => <Palm key={x} x={x} y={520} h={90 + (i % 2) * 20} t={t} seed={i + 4} />)}
		{/* the Nile with the sunset in it, a sail going by */}
		<rect x={-400} y={520} width={2300} height={96} fill="url(#a5-nile)" />
		<River x0={-400} x1={1900} y={528} h={88} t={t} speed={10} />
		<rect x={584} y={528} width={112} height={86} fill="#FFC870" opacity={0.5} />
		{[0, 1, 2].map((k) => <rect key={k} x={598 + 8 * Math.sin(t * 2 + k)} y={536 + k * 24} width={84 - k * 14} height={5} fill="#FFE6A0" opacity={0.85} />)}
		<SailBoat x={730 + 16 * t} y={604} s={0.62} t={t} />
		{/* east bank (ours): palms, mud-brick houses */}
		<rect x={-400} y={614} width={2300} height={90} fill="#C9935A" />
		{[[840, 110, 700], [970, 150, 704], [1130, 100, 700], [1240, 170, 706]].map(([x, h, y], i) => <House key={x} x={x} y={y} w={i % 2 ? 140 : 110} h={h} seed={i + 3} c={['#C98A52', '#D49A60', '#BE7E48', '#CF955C'][i]} />)}
		{[800, 1100].map((x, i) => <Palm key={x} x={x} y={704} h={170 + 30 * (i % 2)} t={t} seed={i} />)}
		{/* the terrace: parapet, floor, the little table */}
		<rect x={-400} y={704} width={2300} height={40} fill="#B98252" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={-400} y={744} width={2300} height={500} fill="#D9AE74" />
		<path d={`M-400 ${GY5}L1900 ${GY5}`} stroke="#A87A48" strokeWidth={3} />
		<path d={poly([[tableX - 70, tableY], [tableX + 110, tableY], [tableX + 104, tableY + 12], [tableX - 64, tableY + 12]])} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2.4} />
		{[tableX - 54, tableX + 94].map((lx) => <path key={lx} d={poly([[lx - 5, tableY + 12], [lx + 5, tableY + 12], [lx + 7, GY5], [lx - 7, GY5]])} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={2} />)}
		<path d={poly([[tableX + 40, tableY], [tableX + 70, tableY], [tableX + 66, tableY - 34], [tableX + 44, tableY - 34]])} fill="#C9874A" stroke={PAL.ink} strokeWidth={2} />
		{/* layering: the palette (carried or set down) and the lotus in the far hand are drawn BEFORE you, so the fists close over them */}
		<ScribePalette x={palP[0]} y={palP[1]} a={palOn ? 0 : -8} w={140} />
		<Lotus x={lotus[0]} y={lotus[1]} a={la} len={84} />
		<God id="a5-you" cast={{...CAST2.scribe, bHand: 'fist', fHand: 'fist'}} pose={pose} x={fx} y={GY5} s={S} sec={{t}} bProp="none" fProp="none" />
		<line x1={fx + penA[0] * S} y1={GY5 + penA[1] * S} x2={fx + penB[0] * S} y2={GY5 + penB[1] * S} stroke={PAL.ink} strokeWidth={6} strokeLinecap="round" />
		<line x1={fx + penA[0] * S} y1={GY5 + penA[1] * S} x2={fx + penB[0] * S} y2={GY5 + penB[1] * S} stroke="#C9A060" strokeWidth={3} strokeLinecap="round" />
		<g transform={`translate(${fx},${GY5}) scale(${S})`}><path transform={mx(H)} d="M0.12 -1.22Q0.42 -1.3 0.42 -0.95Q0.42 -0.62 0.12 -0.62Z" fill={PAL.skinM2} stroke={PAL.ink} strokeWidth={1.5 / S} /></g>
	</Stage60>;
};

/* ================= 6 · 11.3–14.5 (v3, owner 17:07) · the embalming tent, time-lapse: day 1 → day 70. Readable action: each beat the priest
   feeds a new linen band that sweeps over your body (turn by turn), your gold-masked face gleams at day 60, and four canopic jars (内脏罐)
   land one per beat =================
   dissolve in (0.4). Jars land 0.58, 1.15, 1.73, 2.31 [11.88, 12.45, 13.03, 13.61] (groove beats, 104 bpm from 11.30) · linen swish as each
   band completes, half a beat later: [11.59, 12.17, 12.74, 13.32, 13.90, 14.47] · the gold mask gleams 2.40 [13.70] · counter ticks
   0.15–2.9 [11.45–14.20]. */
const JARS: JarHead[] = ['human', 'baboon', 'jackal', 'falcon'];
const JAR_T = [0.58, 1.15, 1.73, 2.31];
const BEAT6 = 60 / 104;
const limb6 = (a: V, b: V, r0: number, r1: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.max(1, Math.hypot(dx, dy)), nx = -dy / L, ny = dx / L;
	return sp([[a[0] + nx * r0, a[1] + ny * r0], [b[0] + nx * r1, b[1] + ny * r1], [b[0] + dx / L * r1, b[1] + dy / L * r1], [b[0] - nx * r1, b[1] - ny * r1], [a[0] - nx * r0, a[1] - ny * r0], [a[0] - dx / L * r0, a[1] - dy / L * r0]], true, 0.2); };
export const Shot6: React.FC<ShotProps> = ({t}) => {
	const ms = 56, mx0 = -60, bed = 690, FL = 900, px = 610, ps = 36;
	const cam = aimPath(t, [[-0.4, 640, 520, 700, 486, 1.0], [3.4, 680, 540, 700, 486, 1.05]]);
	const U = (u: number) => mx0 + u * ms;   // mummy units → world x
	// the wrapping: band k (6 of them) sweeps over the body during beat k and completes half a beat later; three bands at the feet are done
	const BX = (k: number) => 7.2 + k * 0.96, done = [2.4, 3.6, 4.8];
	const kNow = Math.min(5, Math.floor(t / BEAT6)), cyc = cl((t - kNow * BEAT6) / (0.5 * BEAT6));
	const xc = U(BX(kNow) + 0.45), topY = bed - 3.25 * ms;
	// the priest's hands feed the roll at the top edge of the band being wound (small circles: the roll turns)
	const ph = 2 * Math.PI * cyc, roll: V = [xc + 18 * Math.cos(ph), topY - 34 + 10 * Math.sin(ph)];
	const toF = (p: V): V => [(p[0] - px) / ps, (p[1] - FL) / ps];
	const pose = {...tendPose(toF([roll[0] - 22, roll[1] + 4]), toF([roll[0] + 24, roll[1] - 2]), t, 18), neck: 4, head: 14 + 2 * Math.sin(t * 2)};
	const day = Math.min(70, 1 + Math.floor(69 * sm(seg(t, 0.15, 2.9))));
	const sunPh = (t * 1.25) % 1, sunX = lerp(1010, 1250, sunPh), sunY = 300 - 150 * Math.sin(Math.PI * sunPh), dayL = Math.sin(Math.PI * sunPh);
	const tMask = 2.4, masked = true, flash = pulse(t, tMask, 0.03, 0.35);   // the gold mask on your face throughout; it gleams at day 60
	const band = (u0: number, k: string, grow = 1, fresh = 0) => { const y0 = 0.3, y1 = -3.6, yb = lerp(y1, y0, grow);
		const sl = 0.75 * (yb - y1) / (y0 - y1);
		return <g key={k}><path d={poly([[u0 + 0.62, y1], [u0 + 1.62, y1], [u0 + 1.62 - sl, yb], [u0 + 0.62 - sl, yb]])} fill={fresh > 0.3 ? '#FFFFFF' : '#FBF6EA'} stroke={PAL.ink} strokeWidth={0.045} />
			<path d={poly([[u0 + 0.62, y1], [u0 + 0.78, y1], [u0 + 0.78 - sl, yb], [u0 + 0.62 - sl, yb]])} fill="#CDBE98" />
			<path d={`M${u0 + 1.1} ${y1}L${u0 + 1.1 - sl} ${yb}`} stroke="#E2D6B8" strokeWidth={0.05} /></g>; };
	const bands: React.ReactNode[] = done.map((u, i) => band(u, 'd' + i));
	for (let k = 0; k <= kNow; k++) bands.push(band(BX(k), 'k' + k, k < kNow ? 1 : sm(cyc), k === kNow ? 1 - cyc : 0));
	// the front arms: drawn again over the body (the rig draws arms behind it): elbow → wrist + fist, gold bracelet
	const g = solve(pose), arms = (['b', 'f'] as const).map((sd) => { const F = sd === 'b' ? g.bF : g.fF, H = sd === 'b' ? g.bH : g.fH, el = toW(px, FL, ps, 1, ap(F, [0, 0])), wr = toW(px, FL, ps, 1, ap(H, [0, 0])), fi = toW(px, FL, ps, 1, ap(H, [0, 0.55]));
		return <g key={sd}><path d={limb6(el, wr, 15, 11)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={2.6} /><circle cx={fi[0]} cy={fi[1]} r={15} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={2.6} />
			<path d={limb6(lerp(el[0], wr[0], 0.8) < 0 ? el : [lerp(el[0], wr[0], 0.82), lerp(el[1], wr[1], 0.82)], wr, 12, 12)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} /></g>; });
	return <Stage60 t={t} cam={cam} grade="papyrus" dark={0.3 - 0.06 * dayL} darkC="#1A1030" tags={[{x: px - 190, y: 150, text: '防腐祭司'}, {x: 64, y: 690, text: '内脏罐'}]}
		light={<>
			<Shaft pts={[[sunX - 60, 140], [sunX + 40, 140], [lerp(760, 300, sunPh) + 160, FL], [lerp(760, 300, sunPh) - 120, FL]]} o={0.5 * dayL} />
			<Glow x={sunX} y={sunY} r={200} c="warm" o={0.9 * dayL} />
			<Glow x={xc} y={topY + 60} r={180} c="gold" o={0.25 + 0.2 * (1 - cyc)} />
			{flash > 0.02 && <g><Glow x={U(16.8)} y={bed - 3.3 * ms} r={260} c="gold" o={0.9 * flash} /><Sparkle x={U(16.6)} y={bed - 3.6 * ms} r={90 * flash} a={20} /></g>}
			<Glow x={1236} y={FL - 330} r={300} c="warm" o={(0.4 + 0.35 * (1 - dayL)) + 0.1 * flick(t, 5)} />
			<Dust t={t * 2} box={[100, 120, 1200, 880]} n={50} seed={5} o={0.6} vx={8} vy={6} />
			{JAR_T.map((jt, i) => t > jt - 0.02 && t < jt + 0.5 ? <DustBurst key={i} t={t} t0={jt} x={150 + i * 112} y={FL + 8} rx={46} ry={8} n={14} seed={i + 5} c="#F0DEB0" life={0.45} /> : null)}
		</>}>
		<rect x={-300} y={PIC_T - 200} width={2000} height={FL + 300} fill="#D8BE8C" />
		{/* the tent opening: sky racing through days and nights */}
		<rect x={980} y={120} width={300} height={FL - 120} fill="#F2C878" />
		<rect x={980} y={120} width={300} height={FL - 120} fill="#1E2A5E" opacity={cl(1 - dayL * 1.6)} />
		{dayL < 0.3 && <Stars t={t} box={[990, 130, 1270, 500]} n={20} seed={8} o={1 - dayL / 0.3} />}
		<circle cx={sunX} cy={sunY} r={34} fill="#FFD27A" stroke="#E8642A" strokeWidth={3} opacity={cl(dayL * 3)} />
		{[980, 1280].map((x) => <rect key={x} x={x - 12} y={110} width={24} height={FL - 110} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />)}
		<path d={`M-300 ${PIC_T - 200}L1700 ${PIC_T - 200}L1700 116Q1240 ${150 + 6 * Math.sin(t * 2)} 860 120Q480 ${158 + 6 * Math.sin(t * 2.4 + 1)} 120 118Q0 130 -300 124Z`} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 16}, (_, i) => <path key={i} d={`M${-260 + i * 120} ${PIC_T - 200}L${-250 + i * 120} ${126 + 18 * Math.sin(i * 1.3)}`} stroke={i % 2 ? PAL.red : PAL.blue} strokeWidth={10} opacity={0.6} />)}
		{/* the day counter on a board hanging from the tent pole */}
		<line x1={150} y1={126} x2={150} y2={176} stroke={PAL.ink} strokeWidth={3} />
		<g transform={`rotate(${2 * Math.sin(t * 3)} 150 176)`}>
			<rect x={44} y={176} width={212} height={92} rx={8} fill="#F4E4BC" stroke={PAL.ink} strokeWidth={3} />
			<rect x={52} y={184} width={196} height={76} rx={5} fill="none" stroke={PAL.red} strokeWidth={2.4} />
			<text x={150} y={240} textAnchor="middle" fontFamily={F_SERIF} fontWeight={900} fontSize={48} fill={PAL.ink}>第<tspan fill={PAL.red}>{day}</tspan>天</text>
		</g>
		{/* the priest stands behind the bier (his arms are drawn again in front where they cross your body) */}
		<God id="a6-pr" cast={CAST2.embalmer} pose={pose} x={px} y={FL} s={ps} sec={{t}} />
		{/* the bier: a gilded rail on lion legs */}
		{[150, 1040].map((x, i) => <path key={x} d={sp([[x - 26, bed + 30, 1], [x + 26, bed + 30, 1], [x + 20, FL - 60], [x + (i ? 46 : -46), FL - 8], [x + (i ? 50 : -50), FL, 1], [x - (i ? 20 : -20), FL, 1], [x - 18, FL - 60]], true, 0.2)} fill={PAL.lion} stroke={PAL.ink} strokeWidth={3} />)}
		<rect x={-300} y={bed} width={1420} height={30} fill={PAL.lion} stroke={PAL.ink} strokeWidth={3} />
		{Array.from({length: 12}, (_, i) => <rect key={i} x={-260 + i * 112} y={bed + 9} width={56} height={12} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} opacity={0.85} />)}
		{/* you: the body (bare linen, bands added turn by turn), the head (wrapped, then the gold mask) */}
		<g><clipPath id="a6-hd"><rect x={U(14.55)} y={0} width={900} height={1200} /></clipPath><g clipPath="url(#a6-hd)"><Mummy x={mx0} y={bed} s={ms} t={t} masked={masked} /></g></g>
		<g transform={`translate(${mx0},${bed}) scale(${ms})`}>
			<clipPath id="a6-mb"><path d={MUMMY_BODY} /></clipPath><clipPath id="a6-mx"><rect x={-2} y={-6} width={16.6} height={8} /></clipPath>
			<g clipPath="url(#a6-mx)"><path d={MUMMY_BODY} fill="#CDBB92" stroke={PAL.ink} strokeWidth={2.4 / ms} />
				<g clipPath="url(#a6-mb)">{Array.from({length: 18}, (_, i) => <line key={i} x1={i * 0.85} y1={0} x2={i * 0.85 + 0.6} y2={-4} stroke="#B8A47A" strokeWidth={0.03} />)}{bands}</g>
				<path d={MUMMY_BODY} fill="none" stroke={PAL.ink} strokeWidth={2.4 / ms} /></g>
		</g>
		{/* the strip from the roll down to the band being wound; the roll and the hands over it */}
		{/* the linen band runs from the roll over the top of your body into the band being wound */}
		<path d={`M${roll[0]} ${roll[1] + 6}Q${(roll[0] + xc) / 2 + 8 * Math.sin(ph)} ${topY - 6} ${xc + 14} ${topY + 14}`} fill="none" stroke={PAL.ink} strokeWidth={30} strokeLinecap="butt" />
		<path d={`M${roll[0]} ${roll[1] + 6}Q${(roll[0] + xc) / 2 + 8 * Math.sin(ph)} ${topY - 6} ${xc + 14} ${topY + 14}`} fill="none" stroke="#FFFBF0" strokeWidth={25} strokeLinecap="butt" />
		<path d={`M${roll[0]} ${roll[1] + 6}Q${(roll[0] + xc) / 2 + 8 * Math.sin(ph)} ${topY - 6} ${xc + 14} ${topY + 14}`} fill="none" stroke="#D8CBA8" strokeWidth={3} strokeDasharray="10 14" />
		<g transform={`translate(${roll[0]},${roll[1]}) rotate(${-20})`}><rect x={-34} y={-14} width={68} height={28} rx={12} fill="#F4ECD8" stroke={PAL.ink} strokeWidth={2.4} /><ellipse cx={34} cy={0} rx={6} ry={14} fill="#E2D6B6" stroke={PAL.ink} strokeWidth={2} /></g>
		{arms}
		{/* the four canopic jars land in a row in front, one per beat */}
		{JARS.map((h, i) => { const jt = JAR_T[i], u = seg(t, jt - 0.3, jt); if (u <= 0) return null; const x = lerp(150 + i * 112 - 520, 150 + i * 112, 1 - Math.pow(1 - u, 3));
			const bump = 1 - 0.08 * pulse(t, jt, 0.02, 0.1);
			return <g key={h} transform={`translate(${x},${FL + 12}) scale(${2 - bump},${bump}) translate(${-x},${-FL - 12})`}><CanopicJar x={x} y={FL + 12} s={27} head={h} t={t} glow={0.5} /></g>; })}
		<rect x={-300} y={FL} width={2000} height={200} fill="#7A5230" opacity={0.0} />
	</Stage60>;
};

/* ---------------- the priest's mask, gilded (overlay on the rig's jackal head) ---------------- */
const MaskShine: React.FC<{pose: Pose; x: number; y: number; s: number; face: 1 | -1; t: number}> = ({pose, x, y, s, face, t}) => {
	const H = solve(pose).head, lw = 1.6 / s;
	return <g transform={figT(x, y, s, face)}><g transform={mx(H)}>
		<path d={sp([[1.0, -1.86], [1.5, -1.3], [2.1, -1.08], [2.7, -0.92]], false)} fill="none" stroke={PAL.gold} strokeWidth={lw * 3.2} strokeLinecap="round" />
		<path d={sp([[0.95, -0.2], [1.6, -0.36], [2.3, -0.52], [2.82, -0.66]], false)} fill="none" stroke={PAL.gold} strokeWidth={lw * 2.4} strokeLinecap="round" />
		<path d="M-0.52 0.1Q0.0 0.35 0.5 0.12" fill="none" stroke={PAL.gold} strokeWidth={lw * 4} strokeLinecap="round" />
		<circle cx={1.42} cy={-1.38} r={0.32} fill="url(#g60-gold)" opacity={0.7 + 0.2 * flick(t, 3)} style={{mixBlendMode: 'screen'}} />
	</g></g>;
};

/* ================= 7 · 17.5–20.4 · the hook twirl, the puff hooked out and tossed back into a basket (callback) =================
   cut in. Twirl 0.2–0.85, stops with a wobble at 0.85 [18.35] (comic boing) · the puff pops up on the hook at frame left 1.42 [18.92] (pop)
   · flick back over the shoulder 1.92 [19.42] (whoosh) · into the basket 2.57 [20.07] (thup). He never looks. */
export const Shot7: React.FC<ShotProps> = ({t}) => {
	const s = 56, px = 1010, G7 = 1330, face = -1 as const;
	const cam = aimPath(t, [[0, 800, 520, 720, 486, 1.1], [2.9, 800, 530, 720, 486, 1.16]], (u) => u);
	const tPop = 1.42, tRel = 1.92, tLand = 2.57;
	// front hand (toward the left): baton at the chest, lowers the hook out of frame, lifts it with the puff, swings it back over the shoulder
	const hand = keyV(t, [[0, 4.6, -13.2], [0.9, 4.6, -13.2], [1.32, 7.0, -10.2], [tPop, 6.6, -11.4], [tRel, 3.6, -14.6], [2.5, 3.8, -13.0]]);
	let pose: Pose = {...POSES.rest, lean: 4 - 5 * sm(seg(t, tPop, tRel)), neck: -2, head: -6 + 2 * Math.sin(t * 1.5), rt: -6, at: 9, rk: 2, ak: 1};
	pose = reach(pose, 'f', hand);
	pose = wristTo(pose, 'f', key1(t, [[0, 120], [1.0, 120], [1.32, 60], [tPop, 70], [tRel, 150], [2.5, 120]]));
	pose = wristTo(holdAt(pose, 'b', [1.3, -1.6]), 'b', 60);
	const g = solve(pose), grip = toW(px, G7, s, face, ap(g.fH, [0.02, 0.6]));
	// the rod angle on screen (0 = tip up, + clockwise); a twirl of two turns, then a springy stop
	const tw = sm(seg(t, 0.2, 0.85)), wob = t > 0.85 ? 14 * Math.exp(-(t - 0.85) / 0.18) * Math.sin((t - 0.85) * 34) : 0;
	const th = key1(t, [[0, -18], [0.2, -18], [0.85, -18], [1.0, -18], [1.32, -150], [tPop, -140], [tRel, -12], [2.5, 6]]) - 720 * tw + wob;
	const dir: V = [Math.sin(th * Math.PI / 180), -Math.cos(th * Math.PI / 180)], tip: V = [grip[0] + dir[0] * 230, grip[1] + dir[1] * 230], butt: V = [grip[0] - dir[0] * 70, grip[1] - dir[1] * 70];
	// the puff: rides the hook tip from the pop, flies from the release into the basket
	const B: V = [1120, 870];
	let puff: V | null = null, pa = 0, sq = 0;
	if (t >= tPop && t < tRel) { puff = [tip[0] + 20, tip[1] - 30]; pa = th * 0.3; sq = 0.25 * Math.exp(-(t - tPop) / 0.1) * Math.cos((t - tPop) * 40); }
	else if (t >= tRel) { const u = cl((t - tRel) / (tLand - tRel)), P0: V = [tip[0] + 20, tip[1] - 30];
		puff = [lerp(P0[0], B[0], u), lerp(P0[1], B[1], u) - 300 * 4 * u * (1 - u)]; pa = 500 * u; if (t > tLand) { puff = [B[0], B[1] + 14 * sm((t - tLand) / 0.15)]; sq = 0.2 * Math.exp(-(t - tLand) / 0.12) * Math.cos((t - tLand) * 40); } }
	const popRing = pulse(t, tPop, 0.02, 0.2);
	return <Stage60 t={t} cam={cam} grade="tomb" bg="#C9A472" dark={0.42} darkC="#1C0C04" wear={0.45} stain={0.3}
		light={<>
			<Glow x={260} y={300} r={520} c="warm" o={0.75 + 0.1 * flick(t, 1)} />
			<Glow x={grip[0]} y={grip[1]} r={160} c="gold" o={0.25} />
			<Embers t={t} x={200} y={500} n={10} seed={3} h={360} spread={20} />
			<Dust t={t} box={[0, 100, 1300, 900]} n={50} seed={17} o={0.55} />
			{popRing > 0.02 && puff && <g><Sparkle x={puff[0] - 50} y={puff[1] - 30} r={40 * popRing} o={popRing} /><Sparkle x={puff[0] + 46} y={puff[1] - 40} r={30 * popRing} o={popRing} a={30} /></g>}
			{t > tLand - 0.02 && <DustBurst t={t} t0={tLand} x={B[0]} y={B[1] - 30} rx={60} ry={12} n={20} seed={6} c="#E8E2D2" life={0.6} />}
		</>}>
		<rect x={-300} y={-200} width={2100} height={1500} fill="#C9A472" />
		<GlyphColumns x={60} y={140} cols={5} rows={6} cell={36} seed={33} />
		<path d={`M-300 -200L1800 -200L1800 90Q1200 ${130 + 6 * Math.sin(t * 1.3)} 700 96Q300 ${134 + 6 * Math.sin(t * 1.5)} -300 100Z`} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-200 + i * 140} -200L${-190 + i * 140} ${104 + 16 * Math.sin(i * 1.3)}`} stroke={i % 2 ? PAL.red : PAL.blue} strokeWidth={12} opacity={0.6} />)}
		<Flame x={170} y={560} s={1.4} t={t} seed={2} /><path d={poly([[150, 560], [190, 560], [182, 900], [158, 900]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		{/* the hook (bronze): drawn behind the hand */}
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke={PAL.ink} strokeWidth={13} strokeLinecap="round" />
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke="#C8863A" strokeWidth={8} strokeLinecap="round" />
		<path d={`M${butt[0]} ${butt[1]}L${tip[0]} ${tip[1]}`} stroke="#F2C27A" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
		<g transform={`translate(${tip[0]},${tip[1]}) rotate(${th})`}><path d="M0 0Q-2 -22 14 -26Q26 -26 26 -12" fill="none" stroke={PAL.ink} strokeWidth={11} strokeLinecap="round" /><path d="M0 0Q-2 -22 14 -26Q26 -26 26 -12" fill="none" stroke="#C8863A" strokeWidth={6} strokeLinecap="round" /></g>
		<God id="a7-pr" cast={{...CAST2.embalmer, fHand: 'fist', bHand: 'open'}} pose={pose} x={px} y={G7} s={s} face={face} sec={{t}} />
		<MaskShine pose={pose} x={px} y={G7} s={s} face={face} t={t} />
		{puff && <Puff x={puff[0]} y={puff[1]} r={50} a={pa} sq={sq} />}
		<Basket x={B[0]} y={B[1] + 96} w={190} h={124} />
	</Stage60>;
};

/* ================= 8 · 17.4–20.6 · inside the mummy: only the heart is lit; it opens like a lantern; your life flickers inside =================
   (owner 18:06: back to the v1/v2 heart lantern.) dissolve in (0.4). Doors open 0.35–0.75 [17.75–18.15]; vignettes flip in (paper flutter) at 0.75, 1.3, 1.85, 2.4
   [18.15, 18.70, 19.25, 19.80]; the scale-nudging one flashes red 2.62–2.69 [20.02] (ting); heartbeats 0.25, 1.1, 1.95, 2.8 [17.65, 18.50, 19.35, 20.20]. */
const HB8 = [0.25, 1.1, 1.95, 2.8], VT = [0.75, 1.3, 1.85, 2.4], RED8 = 2.62;
const Vignette: React.FC<{k: number; t: number; red: number}> = ({k, t, red}) => {
	const gy = 96, ink = red > 0 ? '#B01810' : PAL.ink;
	const ground = <><rect x={-150} y={gy} width={300} height={8} fill={PAL.red} /><rect x={-150} y={gy + 8} width={300} height={4} fill={PAL.blue} /></>;
	if (k === 0) return <g>{ground}
		<God id="a8-v0a" cast={{...CAST.ani, wig: 'duplex'}} pose={wristTo(reach({...POSES.rest, lean: 6, head: 8}, 'f', [6.0, -9.8]), 'f', 60)} x={-70} y={gy} s={8.6} sec={{t}} />
		<God id="a8-v0b" cast={{...CAST2.scribe}} pose={scribePose(t * 4, 2)} x={30} y={gy} s={7.6} sec={{t}} fProp="pen" />
		<rect x={58} y={gy - 30} width={44} height={30} fill="#F2E4BE" stroke={ink} strokeWidth={2} /><path d="M64 70L96 70M64 78L90 78" stroke={ink} strokeWidth={2} />
	</g>;
	if (k === 1) return <g>{ground}
		<path d={sp([[-20, gy, 1], [120, gy, 1], [90, gy - 50], [50, gy - 72], [10, gy - 50]], true, 0.2)} fill={PAL.gold} stroke={ink} strokeWidth={2.4} />
		{[0, 1, 2, 3].map((i) => <circle key={i} cx={20 + i * 22} cy={gy - 20 - (i % 2) * 18} r={3} fill="#B07816" />)}
		<God id="a8-v1" cast={{...CAST2.priest}} pose={wristTo(reach({...POSES.rest, lean: 3, head: 6}, 'f', [5.8, -14.6 + 0.6 * Math.sin(t * 9)]), 'f', 170)} x={-80} y={gy} s={8.6} sec={{t}} />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={-10 + i * 14} y={-100} width={6} height={36} fill={PAL.red} opacity={cl((t - 1.3) * 6 - i)} />)}
		<path d="M-14 -82L44 -82" stroke={PAL.red} strokeWidth={4} opacity={cl((t - 1.3) * 6 - 4)} />
	</g>;
	if (k === 2) { const sh = 4 * Math.sin(t * 30);
		return <g>{ground}
			<God id="a8-v2a" cast={{...CAST.ani}} pose={wristTo(reach({...POSES.rest, lean: 8, head: -2}, 'f', [6.0, -15.0 + 0.4 * Math.sin(t * 20)]), 'f', 150)} x={-95 + sh * 0.3} y={gy} s={8.0} sec={{t}} />
			<God id="a8-v2b" cast={{...CAST2.priest}} pose={wristTo(reach({...POSES.rest, lean: 8, head: -2}, 'f', [6.0, -14.2 + 0.4 * Math.sin(t * 23)]), 'f', 140)} x={95 - sh * 0.3} y={gy} s={8.0} face={-1} sec={{t}} />
			{[0, 1, 2].map((i) => <path key={i} d={`M${-12 + i * 10} ${-60 - i * 12}l8 -10l-6 -4l10 -12`} fill="none" stroke={PAL.red} strokeWidth={3.5} strokeLinejoin="round" />)}
		</g>; }
	// k === 3: you, nudging the weight on a market scale with one finger
	return <g>{ground}
		<g transform={`translate(10,${gy})`}><Balance p={{tilt: -6 - 3 * sm(seg(t, 2.45, 2.62)), plumb: 2}} x={0} y={0} s={5.6} /></g>
		<God id="a8-v3" cast={{...CAST.ani}} pose={wristTo(reach({...POSES.rest, lean: 10, head: 10}, 'f', [6.5 + 0.4 * sm(seg(t, 2.45, 2.62)), -8.8]), 'f', 100)} x={-118} y={gy} s={7.6} sec={{t}} />
	</g>;
};
export const Shot8: React.FC<ShotProps> = ({t}) => {
	const HS = 315, HX = 680, HYb = 812;
	const cam = aimPath(t, [[-0.4, HX, 520, 700, 486, 1.0], [3.4, HX, 500, 700, 486, 1.12]], (u) => u);
	const beat = HB8.reduce((a, b) => a + pulse(t, b, 0.04, 0.16) + 0.5 * pulse(t, b + 0.17, 0.04, 0.2), 0);
	const open = sm(seg(t, 0.35, 0.75)), vi = VT.reduce((a, v, i) => (t >= v ? i : a), -1), vu = vi >= 0 ? seg(t, VT[vi], VT[vi] + 0.14) : 0;
	const red = t >= RED8 && t < RED8 + 0.07 ? 1 : 0;
	const door = (k: number) => { const sx = 1 - 0.9 * open, hx = k * 0.78;
		return <g transform={`translate(${hx},0) scale(${sx},1) translate(${-hx},0)`}>
			<g clipPath="url(#a8-half)" transform={k > 0 ? 'scale(-1,1)' : undefined}>
				<path d={HEART_D} fill={PAL.red} /><path d="M-0.55 -1.15Q-0.62 -0.7 -0.42 -0.32" fill="none" stroke="#E0705A" strokeWidth={0.04} />
				<path d="M-0.7 -0.9L0 -0.9M-0.66 -0.5L0 -0.5" stroke={PAL.gold} strokeWidth={0.035} />
				{[-0.5, -0.25].map((x) => <circle key={x} cx={x} cy={-0.7} r={0.05} fill={PAL.gold} />)}
			</g>
			<path d={`M0 -1.6L0 0`} stroke={PAL.gold2} strokeWidth={0.04} />
		</g>; };
	return <Stage60 t={t} cam={cam} grade="lapis" bg="#0A1030" wear={0.15} stain={0.15}
		light={<>
			<Glow x={HX} y={HYb - 0.9 * HS} r={720 * (0.9 + 0.12 * beat)} c="red" o={0.55 + 0.25 * beat} />
			<Glow x={HX} y={HYb - 0.85 * HS} r={260} c="gold" o={0.35 + 0.45 * open} />
			{open > 0 && <path d={`M${HX - 120} ${HYb - 0.85 * HS}L${HX - 640} ${PIC_T - 60}L${HX + 640} ${PIC_T - 60}L${HX + 120} ${HYb - 0.85 * HS}Z`} fill="url(#g60-shaft)" opacity={0.18 * open} style={{mixBlendMode: 'screen'}} />}
			<Embers t={t} x={HX} y={HYb - 0.4 * HS} n={18} seed={8} h={520} spread={300} />
			<Dust t={t} box={[100, 60, 1300, 900]} n={60} seed={18} c="#FFC890" o={0.55} vx={2} vy={-6} />
			{red > 0 && <circle cx={HX} cy={HYb - 0.85 * HS} r={260} fill="#FF2010" opacity={0.55} style={{mixBlendMode: 'screen'}} />}
		</>}>
		<defs><clipPath id="a8-half"><rect x={-1} y={-2} width={1} height={2.2} /></clipPath><clipPath id="a8-win"><path d={HEART_D} transform="translate(0,-0.12) scale(0.86)" /></clipPath>
			<radialGradient id="a8-in" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stopColor="#FFF2CE" /><stop offset="0.7" stopColor="#F2D38E" /><stop offset="1" stopColor="#D99A4A" /></radialGradient></defs>
		<rect x={-400} y={-300} width={2300} height={1700} fill="#0A1030" />
		{/* x-ray: the linen wraps of the body around the heart, faint blue lines */}
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${-300 + i * 70} -100L${300 + i * 70} 1100`} stroke="#3A5AB0" strokeWidth={3} opacity={0.22} />)}
		{Array.from({length: 30}, (_, i) => <path key={'b' + i} d={`M${300 + i * 70 - 600} 1100L${i * 70 + 300} -100`} stroke="#3A5AB0" strokeWidth={2} opacity={0.14} />)}
		<path d={sp([[-300, 1000], [-300, 140], [300, 70], [1000, 60], [1700, 110], [1700, 1000]], true, 0.2)} fill="none" stroke="#6F8CE0" strokeWidth={5} opacity={0.35} />
		<g transform={`translate(${HX},${HYb}) scale(${HS * (1 + 0.025 * beat)})`}>
			<path d={HEART_D} fill="#5A0C08" stroke={PAL.ink} strokeWidth={0.05} />
			<g clipPath="url(#a8-win)">
				<path d={HEART_D} fill="url(#a8-in)" />
				{vi >= 0 && <g transform={`translate(0,-0.84) scale(${(1 / HS) * Math.max(0.05, vu)},${1 / HS})`}><Vignette k={vi} t={t} red={red} /></g>}
				{red > 0 && <path d={HEART_D} fill="#FF2A10" opacity={0.55} />}
			</g>
			{door(-1)}{door(1)}
			<path d={HEART_D} fill="none" stroke={PAL.gold} strokeWidth={0.045} />
			<path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke={PAL.gold} strokeWidth={0.06} />
		</g>
	</Stage60>;
};

/* ================= 9 · 20.6–23.5 (v3) · from above: your upper body (mask, collar, chest); a hand lays the green heart scarab on the chest;
   a gold ring circles it (freeze highlight) =================
   dissolve in (0.3). The scarab turns over in the fingers (the inscribed base shows) 0.05–0.7 · stone tap 0.85 [24.45] ·
   ring + freeze 1.1–1.9, chime 1.15 [24.75] · label 心脏圣甲虫 from 1.2. */
/** a gold mummy mask seen from above (frontal face, striped nemes, false beard); (x, y) = face centre, s = px per unit (face ≈ 2.4 × 3 units) */
const MaskTop: React.FC<{x: number; y: number; s: number; id: string}> = ({x, y, s, id}) => {
	const lw = 2.4 / s;
	const nemes = sp([[-1.7, -1.6], [-1.2, -2.2], [0, -2.45], [1.2, -2.2], [1.7, -1.6], [2.0, 0.4], [2.5, 2.6, 1], [1.2, 2.7, 1], [1.05, 0.8], [0, 1.9], [-1.05, 0.8], [-1.2, 2.7, 1], [-2.5, 2.6, 1], [-2.0, 0.4]], true, 0.18);
	const face = sp([[0, -1.55], [0.95, -1.25], [1.15, -0.2], [0.95, 0.9], [0.45, 1.5], [0, 1.62], [-0.45, 1.5], [-0.95, 0.9], [-1.15, -0.2], [-0.95, -1.25]], true, 0.2);
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<clipPath id={`${id}-n`}><path d={nemes} /></clipPath>
		<path d={nemes} fill="#2C46A8" stroke={PAL.ink} strokeWidth={lw * 2} />
		<g clipPath={`url(#${id}-n)`}>{Array.from({length: 22}, (_, i) => <path key={i} d={`M-3 ${-2.4 + i * 0.26}L3 ${-2.4 + i * 0.26}`} stroke={`url(#${id}-gold)`} strokeWidth={0.12} />)}</g>
		<path d={nemes} fill="none" stroke={PAL.ink} strokeWidth={lw * 2} />
		<path d={face} fill={`url(#${id}-gold)`} stroke={PAL.ink} strokeWidth={lw * 1.6} />
		{[-1, 1].map((k) => <g key={k}>
			<path d={`M${k * 0.15} -0.5Q${k * 0.5} -0.78 ${k * 0.85} -0.6`} fill="none" stroke="#2C46A8" strokeWidth={0.1} strokeLinecap="round" />
			<path d={`M${k * 0.2} -0.2Q${k * 0.5} -0.42 ${k * 0.8} -0.22Q${k * 0.5} -0.05 ${k * 0.2} -0.2Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={lw} />
			<circle cx={k * 0.5} cy={-0.22} r={0.09} fill={PAL.ink} /><path d={`M${k * 0.8} -0.22L${k * 1.05} -0.3`} stroke="#2C46A8" strokeWidth={0.08} strokeLinecap="round" /></g>)}
		<path d="M0 -0.2L-0.12 0.45L0.12 0.45" fill="none" stroke="#9C6A12" strokeWidth={0.06} />
		<path d="M-0.3 0.85Q0 0.97 0.3 0.85Q0 1.02 -0.3 0.85Z" fill="#A8452A" stroke={PAL.ink} strokeWidth={lw * 0.8} />
		<path d={sp([[-0.18, 1.55, 1], [0.18, 1.55, 1], [0.22, 2.5], [0, 2.7], [-0.22, 2.5]], true, 0.2)} fill="#2C46A8" stroke={PAL.ink} strokeWidth={lw} />
		{[1.8, 2.05, 2.3].map((yy) => <line key={yy} x1={-0.2} x2={0.2} y1={yy} y2={yy} stroke={PAL.gold} strokeWidth={0.06} />)}
	</g>;
};
export const Shot9: React.FC<ShotProps> = ({t}) => {
	// v4 (owner 17:59): the heart scarab at its REAL size. Met 36.3.2 is 6.6 × 5.3 cm: here ~250 × 190 px (≈36 px/cm), about 1/6 of the
	// chest's width (~1180 px); the hand (back of the hand ~9 cm ≈ 320 px) is clearly bigger and pinches it between index finger and thumb.
	// Start wide on the upper body, push in to the chest; at the end the collar is still in frame and the scarab reads as a small amulet.
	const SX = 640, SY = 720, SS = 26, tTap = 0.85, tR = 1.1, tF1 = 1.9;
	const frz = t > tR && t < tF1 ? 1 : 0, tt = t < tR ? t : t < tF1 ? tR : t - (tF1 - tR);
	const cam = aimPath(t, [[-0.3, SX, 360, 720, 486, 0.46], [0.95, SX, SY - 60, 720, 470, 0.95], [2.9, SX, SY - 60, 720, 470, 1.02]]);
	const desc = sm(seg(t, -0.3, tTap)), flip = 1 - sm(seg(t, 0.05, 0.7)), lift = t < tTap ? 1 - desc : 0;
	const sc = 1 + 0.25 * lift, sx = SX + 380 * lift, sy = SY - 40 * lift;
	const handOut = sm(seg(t, tTap + 0.1, tTap + 0.6)), handX = sx + 800 * handOut, handY = sy - 30 * handOut;
	const ring = seg(t, tR, tR + 0.55), ringO = (t > tR ? 1 : 0) * (1 - sm(seg(t, tF1 + 0.1, tF1 + 0.6)));
	const tap = pulse(t, tTap, 0.02, 0.18), RX = 128, RY = 158;
	const torso = sp([[-600, 380], [-340, 300], [340, 300], [600, 380], [560, 1800, 1], [-560, 1800, 1]], true, 0.2);
	const wraps: React.ReactNode[] = [];
	for (let i = -16; i < 44; i++) { const x0 = -700 + i * 50; wraps.push(<path key={'a' + i} d={`M${x0} 250L${x0 + 700} 1800`} stroke="#C9B88E" strokeWidth={14} opacity={0.55} />, <path key={'b' + i} d={`M${x0 + 700} 250L${x0} 1800`} stroke="#F2E9D2" strokeWidth={9} opacity={0.55} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 18; i++) for (let j = 0; j < 12; j++) { const bx = SX - 680 + i * 80 + (j % 2) * 40, by = SY - 330 + j * 60;
		if (Math.hypot(bx - SX, (by - SY) * 0.8) < 150) continue;
		net.push(<g key={`${i}.${j}`}><path d={poly([[bx, by - 28], [bx + 38, by], [bx, by + 28], [bx - 38, by]])} fill="none" stroke={STONE.faience} strokeWidth={5} opacity={0.55} /><circle cx={bx} cy={by - 28} r={5} fill={j % 2 ? PAL.gold : PAL.red} stroke={PAL.ink} strokeWidth={1.2} /></g>); }
	// the hand from the right, seen from above (origin = scarab centre): back of the hand beside the scarab, the other fingers curled under,
	// the index finger along its top rim and the thumb along its bottom rim, pinching it
	const hand = {
		back: sp([[640, -150], [330, -178], [262, -132], [250, -60], [256, 20], [252, 96], [300, 158], [640, 140]], true, 0.22),
		index: sp([[300, -186], [70, -178], [26, -160], [24, -128], [58, -112], [300, -116]], true, 0.22),
		thumb: sp([[330, 104], [80, 108], [32, 120], [30, 154], [70, 172], [340, 196]], true, 0.22),
		curl: sp([[320, -122], [236, -116], [206, -64], [212, -4], [206, 54], [224, 110], [320, 116]], true, 0.3)};
	return <Stage60 t={t} cam={cam} grade="tomb" bg="#3A2416" dark={0.2} darkC="#2A1206" wear={wearAt(cam.z, 0.45)} stain={0.22}
		screen={(() => { const sp_ = toScreen(cam, SX, SY), fo = sm(seg(t, tR - 0.05, tR + 0.15)) * (1 - sm(seg(t, tF1, tF1 + 0.4)));
			return fo > 0 ? <g><defs><radialGradient id="a9-spot" gradientUnits="userSpaceOnUse" cx={sp_[0]} cy={sp_[1]} r={460}><stop offset="0.35" stopColor="#120600" stopOpacity={0} /><stop offset="1" stopColor="#120600" stopOpacity={0.55} /></radialGradient></defs>
				<rect width={FW} height={1080} fill="url(#a9-spot)" opacity={fo} /></g> : null; })()}
		tags={t > 1.2 ? [{x: SX + 175, y: SY - 175, text: '心脏圣甲虫', o: sm(seg(t, 1.2, 1.5))}] : []}
		light={<>
			<Glow x={SX} y={SY + 20} r={380} c="red" o={0.35} />
			<Glow x={SX - 400} y={0} r={900} c="warm" o={0.55 + 0.1 * flick(tt, 2)} />
			<Glow x={sx} y={sy} r={230 * sc} c="green" o={0.4 + 0.3 * (1 - lift) + 0.4 * tap + 0.35 * frz} />
			<Glow x={sx} y={sy} r={120 * sc} c="gold" o={0.2 + 0.4 * frz} />
			{ringO > 0 && <g style={{mixBlendMode: 'screen'}} opacity={ringO}>
				<ellipse cx={SX} cy={SY} rx={RX} ry={RY} fill="none" stroke="#FFE7A0" strokeWidth={5} strokeDasharray={`${910 * ring} 1200`} transform={`rotate(-90 ${SX} ${SY})`} />
				<ellipse cx={SX} cy={SY} rx={RX} ry={RY} fill="none" stroke="#FFD060" strokeWidth={16} opacity={0.3} strokeDasharray={`${910 * ring} 1200`} transform={`rotate(-90 ${SX} ${SY})`} />
				{(() => { const a = -Math.PI / 2 + 2 * Math.PI * ring; return <Sparkle x={SX + RX * Math.cos(a)} y={SY + RY * Math.sin(a)} r={30} a={t * 90} />; })()}
				{ring >= 1 && [0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3 + 0.4; return <Sparkle key={i} x={SX + (RX + 22) * Math.cos(a)} y={SY + (RY + 24) * Math.sin(a)} r={10 + 5 * Math.sin(t * 8 + i)} />; })}
			</g>}
			<Dust t={tt} box={[-400, -400, 1700, 1500]} n={60} seed={19} o={0.55} />
		</>}>
		<GoldDefs id="a9" />
		<rect x={-1200} y={-1200} width={3600} height={3400} fill="#3A2416" />
		{/* you, seen from above, life size: the wrapped body, the broad collar, the gold mask */}
		<g transform={`translate(${SX},0)`}>
			<clipPath id="a9-tor"><path d={torso} /></clipPath>
			<path d={torso} fill="#E6D7B2" stroke={PAL.ink} strokeWidth={5} />
			<g clipPath="url(#a9-tor)"><g transform={`translate(${-SX},0)`}>{wraps}{net}</g></g>
			{([[0, '#2A1912', 450], [10, '#E8B83E', 438], [44, '#2C46A8', 404], [76, '#C2381E', 372], [106, '#2FA39A', 342], [136, '#E8B83E', 312]] as [number, string, number][]).map(([dy, c, r], i) =>
				<path key={i} d={`M${-r - 60} ${250 + dy * 0.2}Q0 ${430 + r * 0.55} ${r + 60} ${250 + dy * 0.2}`} fill="none" stroke={c} strokeWidth={i === 0 ? 44 : 30} />)}
			<MaskTop x={0} y={30} s={150} id="a9" />
		</g>
		{/* the scarab (real size), its small shadow, the hand that pinches it between thumb and fingers (drawn over it) */}
		<ellipse cx={sx + 16 + 30 * lift} cy={sy + 20 + 40 * lift} rx={100 * sc} ry={130 * sc} fill="#2A1206" opacity={0.25 * (1 - 0.5 * lift)} />
		<g transform={`translate(${sx},${sy}) scale(${sc}) translate(${-sx},${-sy})`}><HeartScarab id="a9-hs" x={sx} y={sy} s={SS} flip={flip} t={t} lines={1} glint={0.8} /></g>
		{handOut < 1 && <g transform={`translate(${handX},${handY}) scale(${sc})`}>
			<path d={poly([[600, -140], [1900, -170], [1900, 170], [600, 132]])} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={4} />
			<path d="M620 40L1900 50" stroke={PAL.skinM2} strokeWidth={16} opacity={0.4} />
			{/* the curled middle, ring and little fingers (their middle joints seen from above) */}
			<path d={hand.curl} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.4} />
			{[-44, 34].map((yy) => <path key={yy} d={`M${210} ${yy}Q${232} ${yy + 4} ${256} ${yy}`} fill="none" stroke={PAL.ink} strokeWidth={3} strokeLinecap="round" />)}
			<path d={hand.back} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={4} />
			{[[-122, -40], [-6, 50], [76, 120]].map(([y0, y1], i) => <path key={i} d={`M${282 + i * 3} ${y0 + 14}Q${300} ${(y0 + y1) / 2} ${282 + i * 3} ${y1 - 14}`} fill="none" stroke={PAL.skinM2} strokeWidth={3} strokeLinecap="round" />)}
			<rect x={640} y={-150} width={60} height={296} rx={10} fill={PAL.gold} stroke={PAL.ink} strokeWidth={3} /><rect x={660} y={-150} width={18} height={296} fill={PAL.blue} />
			<path d={hand.index} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.6} />
			<path d={hand.thumb} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={3.6} />
			<path d={sp([[34, -168], [74, -170], [78, -128], [36, -126]], true, 0.4)} fill="#D98A62" stroke={PAL.skinM2} strokeWidth={2.5} opacity={0.85} />
			<path d={sp([[40, 126], [82, 122], [86, 162], [42, 162]], true, 0.4)} fill="#D98A62" stroke={PAL.skinM2} strokeWidth={2.5} opacity={0.85} />
			{[[170, -180, 172, -114], [200, 106, 204, 186]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1 + 10}Q${x1 + 8} ${(y1 + y2) / 2} ${x2} ${y2 - 10}`} fill="none" stroke={PAL.skinM2} strokeWidth={3} strokeLinecap="round" />)}
		</g>}
		{tap > 0.02 && <DustBurst t={t} t0={tTap} x={SX} y={SY} rx={110} ry={140} n={26} seed={9} c="#FFF2C8" life={0.5} />}
	</Stage60>;
};
export const _l = {Embers, Stars, FW, GlyphRun, GoldDefs, Torch: Lamp, ANI, River, holdAt};
