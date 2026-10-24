import React from 'react';
import {staticFile} from 'remotion';
import {W, H, rnd, cl, sm, lerp, Layer, Sprite, Glow, fkPose, mixPose, Rimmed, jointAt, Pose, Look4} from './v3base';
import {seg, ease, easeIn, easeOut} from './fx';
import {StarField} from './sky41';
import {crackPaths} from './s41title';
/* 商 18.965–34.836 (15.871 s). The title's glowing crack becomes an old crack on a turtle plastron; we pull back to the
   diviner kneeling by his fire before thatched halls on rammed-earth platforms. He asks the sky 「其自东来雨？」 while wind
   drives clouds in from the east (screen right). A glowing copper-alloy rod touches a drilled hollow on the back of the
   shell; turned over, a 卜 crack shoots across on the beat. Five oracle-bone graphs 其自東來雨 are cut beside it; the shell
   cools to bone white; he lifts it to the clouded east; the camera pushes into the fire until flame fills the frame
   (杜甫 opens by pulling back out of a beacon fire). No rain is shown (the 验辞 is unverified). */

/** scene-relative seconds, keyed to the measured VO (vo_timeline_v3.md): S1 19.40–22.56, SQ 23.00–24.88, S2 25.40–28.56, S3 29.10–32.03 */
export const SHANG_T = {
	S1: 0.435, S1e: 3.595, SQ: 4.035, SQe: 5.915, S2: 6.435, S2e: 9.595, S3: 10.135, S3e: 13.065, end: 15.871,
	pullEnd: 3.8,                 // macro on the old crack → medium on the diviner
	look: 3.6, lookEnd: 6.0,      // he lifts his face to the eastern sky for the question
	wind: 3.9,                    // wind rises, clouds roll in from the east
	reach: 5.95, lift: 6.35, touch: 6.62, flipA: 6.98, flipB: 7.28,
	crack: 7.358,                 // beat 13 of the scene: the 卜 crack shoots across (inside the 25.6–26.4 film window)
	glyph0: 10.188, glyphStep: 0.566,   // the five graphs on beats 18–22 (during S3)
	offer: 12.75, cool: 12.6, coolEnd: 13.9,
	sky: 14.0,                    // the tilt has landed on the shell against the clouded eastern sky
	fire: 14.2,                   // push into the fire
};
const T = SHANG_T;
/** the last frame: camera at zoom 24 on the fire's Blaze (scale 1.05, lean -0.27, seed 0), 54 px above its base, 4 px left; warm tint 0.3 */
export const SHANG_END = {zoom: 24, blazeS: 1.05, lean: -0.27, seed: 0, dx: -4, dy: -54, tint: 0.3};
const GOLD = '#F2CF7A';
/* ---------- geometry ---------- */
const GY = 858, FX = 1085, FH = 540, DX = 790;          // ground y, fire x, diviner height, diviner x
const look: Look4 = {dress: 'robe', head: 'bun', beard: 'short', build: 1.02};
const PS = 0.6;                                         // plastron: world px per local unit (local ≈ 128 × 200)
const Z0 = 100;                                         // macro zoom at frame 0
const LC: [number, number] = [24, -46];                 // local anchor of the old crack (= the title crack)
const KL = (1.06 / Z0) / PS;                            // title px → plastron local units
const TC = crackPaths(-40, 548, W + 40, 528, 7, 30, 22);   // the title's crack, identical seed
/** camera transform string, identical to fx.Cam */
export const camT = (zoom: number, fx: number, fy: number, px: number, py: number, roll = 0) =>
	`translate(${W / 2 + px},${H / 2 + py}) rotate(${roll}) translate(${-W / 2},${-H / 2}) translate(${fx},${fy}) scale(${zoom}) translate(${-fx},${-fy})`;

/* ---------- poses (facing right, toward the fire and the east) ---------- */
const KN = {hip: 0.27, lt: 70, lk: 160, rt: 74, rk: 164, lf: 186, rf: 186};   // kneeling upright on both knees
const P_HOLD = fkPose({...KN, lean: 10, neck: 6, la: 62, le: 56, ra: 56, re: 62});
const P_LOOK = fkPose({...KN, lean: -2, neck: -30, la: 50, le: 50, ra: 46, re: 56});
const P_OFFER = fkPose({...KN, lean: -6, neck: -26, la: 146, le: 16, ra: 140, re: 22});
/** two-link IK for the right arm: returns {ra, re} so the wrist lands on the target (body units, y up) */
const BLU = 0.194, BLF = 0.135;
const ikArm = (base: Parameters<typeof fkPose>[0], target: [number, number]) => {
	const S = fkPose(base).RSh, vx = target[0] - S[0], vy = target[1] - S[1], D = Math.min(Math.hypot(vx, vy), (BLU + BLF) * 0.995);
	const th = Math.atan2(vx, -vy), al = Math.acos(cl((BLU * BLU + D * D - BLF * BLF) / (2 * BLU * D), -1, 1)), a = th - al;
	const E = [S[0] + Math.sin(a) * BLU, S[1] - Math.cos(a) * BLU], ph = Math.atan2(target[0] - E[0], -(target[1] - E[1]));
	return {ra: a * 180 / Math.PI, re: (ph - a) * 180 / Math.PI};
};
const toBody = (p: [number, number]): [number, number] => [(p[0] - DX) / FH, (GY - p[1]) / FH];
const FIRE_PT: [number, number] = [FX + -4, GY - 6 - 54];
/** world point of the graph column when the shell is held up (offer pose, rot -14) — for the tilt → fire camera move */
const SHELL_UP: [number, number] = (() => { const lh = jointAt(P_OFFER, 'LHand', DX, GY, FH), P = [lh[0] + 6, lh[1] - 64], r = -14 * Math.PI / 180, x = -30 * PS, y = 10 * PS; return [P[0] + x * Math.cos(r) - y * Math.sin(r), P[1] + x * Math.sin(r) + y * Math.cos(r)]; })();

/* ---------- the plastron (local units; front = outer face with cracks and graphs, back = inner face with drilled hollows) ---------- */
// a flat, long plastron: straight-sided front and hind lobes, the trimmed bridge stubs (notched) at mid-sides, a notched tail
const OUT = 'M0,-106 L7,-110 L30,-108 L40,-96 L46,-74 L50,-48 L64,-42 L66,-14 L61,-8 L66,-2 L66,18 L52,26 L50,56 L47,80 L38,100 L22,110 L0,93 L-22,110 L-38,100 L-47,80 L-50,56 L-52,26 L-66,18 L-66,-2 L-61,-8 L-66,-14 L-64,-42 L-50,-48 L-46,-74 L-40,-96 L-30,-108 L-7,-110 Z';
const SULCI = 'M0,-106 L0,93 M-44,-86 Q-20,-80 0,-84 Q20,-80 44,-86 M-50,-50 Q-24,-44 0,-50 Q24,-44 50,-50 M-66,-6 Q-30,0 0,-8 Q30,0 66,-6 M-51,42 Q-24,36 0,42 Q24,36 51,42 M-47,80 Q-22,72 0,78 Q22,72 47,80';
const STUBS = 'M50,-48 L52,26 M-50,-48 L-52,26';
const OLD_STEM = (() => { const x = LC[0] + 1000 * KL, y = LC[1] - 12 * KL; let d = `M${x.toFixed(2)},${(y - 16).toFixed(2)}`; for (let i = 1; i <= 8; i++) d += ` L${(x + (rnd(i, 81) - 0.5) * 2.4).toFixed(2)},${(y - 16 + i * 4.6).toFixed(2)}`; return d; })();
// the new 卜 crack (left half, branch toward the midline)
const NX = -18;   // x of the new crack's stem (local)
const NEW_STEM: [number, number][] = Array.from({length: 11}, (_, i) => [NX + (i && i < 10 ? (rnd(i, 91) - 0.5) * 3 : 0), -12 + i * 5.6]);
const NEW_BR: [number, number][] = Array.from({length: 7}, (_, i) => [NX + i * 2.8, 6 - i * 1.5 + (i && i < 6 ? (rnd(i, 92) - 0.5) * 2.6 : 0)]);
const pathOf = (p: [number, number][], k = 1) => { const n = Math.max(1, Math.round(k * (p.length - 1))); return 'M' + p.slice(0, n + 1).map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' L'); };
const NEW_TWIGS = ['M-18,22 L-22,27 L-24,31', 'M-3,-2 L0,-5', 'M-17,38 L-13,42'];
// drilled hollows on the back: [x, y, charred]
// chiselled hollows on the inner face: an oval 凿 with a round 钻 beside it, in rows; some already scorched by earlier questions
const HOLES: [number, number, number][] = [-1, 1].flatMap((sd) => [...[-80, -52, -24, 6, 36, 64].map((y) => [sd * 24.5, y, sd > 0 && (y === -52 || y === -24) ? 1 : 0] as [number, number, number]), ...[-30, -2].map((y) => [sd * 44, y, sd > 0 && y === -30 ? 1 : 0] as [number, number, number])]);
/* oracle-bone graphs 其 自 東 來 雨 (unit box ±0.5; simplified pictographs, incised strokes) */
export const GLYPHS: string[] = [
	'M-0.36,-0.46 L-0.22,0.38 L0.22,0.38 L0.36,-0.46 M-0.3,-0.12 L0.26,0.3 M0.3,-0.12 L-0.26,0.3 M-0.31,-0.22 L0.31,-0.22 M-0.26,0.38 L-0.34,0.5 M0.26,0.38 L0.34,0.5',   // 其: a winnowing basket, cross-hatched
	'M0,-0.5 L0,-0.3 M-0.28,0.46 L-0.3,-0.12 Q-0.28,-0.34 0,-0.3 Q0.28,-0.34 0.3,-0.12 L0.28,0.46 L-0.28,0.46 M-0.29,0.06 L0.29,0.06 M-0.28,0.26 L0.28,0.26',   // 自: a nose
	'M0,-0.5 L0,0.5 M0,-0.3 Q0.34,-0.04 0,0.3 Q-0.34,-0.04 0,-0.3 M-0.17,-0.15 L0.17,0.15 M0.17,-0.15 L-0.17,0.15 M0,-0.38 L-0.22,-0.5 M0,-0.38 L0.22,-0.5 M0,0.38 L-0.22,0.5 M0,0.38 L0.22,0.5',   // 東: a sack tied at both ends
	'M0,-0.42 L0,0.5 M0,-0.42 Q0.12,-0.52 0.24,-0.42 M-0.32,-0.08 L0,-0.24 L0.32,-0.08 M-0.3,0.14 L0,-0.02 L0.3,0.14 M0,0.3 L-0.24,0.5 M0,0.3 L0.24,0.5',   // 來: a wheat plant with a drooping ear
	'M-0.42,-0.46 L0.42,-0.46 M-0.26,-0.32 L-0.26,-0.14 M0,-0.34 L0,-0.06 M0.26,-0.32 L0.26,-0.14 M-0.26,0.04 L-0.26,0.22 M0.26,0.04 L0.26,0.22 M0,0.1 L0,0.3 M-0.13,0.32 L-0.13,0.48 M0.13,0.32 L0.13,0.48',   // 雨: a line of sky, drops falling
];
const GX = -38.5, GS = 21, GY0 = -38, GDY = 24;        // the column of graphs beside the new crack (local)

type PlastronState = {cosT: number; heat: number; newK: number; glyph: number[]; cool: number; t: number};
const PlastronV: React.FC<PlastronState & {tf: string}> = ({tf, cosT, heat, newK, glyph, cool, t}) => {
	const front = cosT >= 0, warm = 1 - cool;
	const fill = front ? (cool > 0 ? mixHex('#d6b282', '#f1ead9', cool) : '#d6b282') : '#c4a070';
	return <g transform={tf}>
		<g transform={`scale(${Math.max(0.04, Math.abs(cosT))},1)`}>
			<path d={OUT} fill={fill} stroke={front ? '#7a5a34' : '#6a4a2a'} strokeWidth={1.8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
			<path d={OUT} transform="scale(0.955,0.968)" fill="none" stroke="#a88658" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.55} />
			{/* firelight from the right, and a cool shade on the left */}
			<path d={OUT} fill="url(#shPlFire)" opacity={0.55 * warm} />
			{front ? <g>
				<path d={SULCI} stroke="#8e6c42" strokeWidth={1.3} fill="none" vectorEffect="non-scaling-stroke" opacity={0.85} />
				<path d={STUBS} stroke="#a88658" strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" opacity={0.5} />
				{/* bone grain: fine pores and fibres (they only read in the macro shot) */}
				{Array.from({length: 70}, (_, i) => { const x = LC[0] + (rnd(i, 61) - 0.5) * 52, y = LC[1] + (rnd(i, 62) - 0.5) * 34, a = 0.25 + (rnd(i, 63) - 0.5) * 0.25, L = 2 + 6 * rnd(i, 64);
					return <path key={i} d={`M${(x).toFixed(2)},${y.toFixed(2)} q${(Math.cos(a) * L * 0.5).toFixed(2)},${(Math.sin(a) * L * 0.5 + 0.3).toFixed(2)} ${(Math.cos(a) * L).toFixed(2)},${(Math.sin(a) * L).toFixed(2)}`} stroke="#9a7c54" strokeWidth={0.05 + 0.06 * rnd(i, 65)} fill="none" opacity={0.25 + 0.3 * rnd(i, 66)} strokeLinecap="round" />; })}
				{Array.from({length: 40}, (_, i) => <circle key={'p' + i} cx={LC[0] + (rnd(i, 71) - 0.5) * 50} cy={LC[1] + (rnd(i, 72) - 0.5) * 30} r={0.08 + 0.14 * rnd(i, 73)} fill="#8a6a44" opacity={0.35} />)}
				{/* the old crack (the title's): its stem, and the branch drawn by the caller in the macro phase */}
				<path d={OLD_STEM} stroke="#3a2414" strokeWidth={1.1} fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="bevel" />
				{/* the new 卜 crack and its graphs */}
				{newK > 0 && <g stroke="#2e1a0c" fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="bevel">
					<path d={pathOf(NEW_STEM, cl(newK * 2))} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
					{newK > 0.45 && <path d={pathOf(NEW_BR, cl((newK - 0.45) / 0.4))} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />}
					{newK > 0.85 && NEW_TWIGS.map((d, i) => <path key={i} d={d} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />)}
				</g>}
				{newK > 0 && <ellipse cx={NX + 6} cy={12} rx={22} ry={30} fill="url(#shScorch)" opacity={0.85 * (0.35 + 0.65 * (1 - cool))} />}
				{GLYPHS.map((g, i) => { const k = glyph[i]; return k <= 0 ? null : <g key={i}>
					<path d={g} transform={`translate(${GX + 0.45},${GY0 + i * GDY + 0.55}) scale(${GS})`} stroke="#fbf0d6" strokeWidth={2.2} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={6} strokeDashoffset={6 * (1 - k)} pathLength={6} opacity={0.8} />
					<path d={g} transform={`translate(${GX},${GY0 + i * GDY}) scale(${GS})`} stroke="#24130a" strokeWidth={4.6} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={6} strokeDashoffset={6 * (1 - k)} pathLength={6} /></g>; })}
			</g> : <g>
				<path d="M0,-106 L0,93" stroke="#8e6c42" strokeWidth={1.1} vectorEffect="non-scaling-stroke" opacity={0.7} />
				<path d={STUBS} stroke="#a88658" strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" opacity={0.5} />
				{HOLES.map(([x, y, ch], i) => { const zx = x + (x < 0 ? 6.5 : -6.5); return <g key={i}>
					<ellipse cx={x} cy={y} rx={3.4} ry={9.5} fill={ch ? '#24120a' : '#5e4024'} />
					<ellipse cx={x + 0.8} cy={y + 0.9} rx={2.1} ry={7.4} fill={ch ? '#120804' : '#3e2812'} />
					<circle cx={zx} cy={y + 1} r={3.7} fill={ch ? '#1e0e06' : '#6a4a28'} />
					<circle cx={zx + 0.6} cy={y + 1.6} r={2.2} fill={ch ? '#0e0602' : '#46301a'} />
				</g>; })}
				{heat > 0 && <><circle cx={NX} cy={7} r={10} fill="#ff7a2a" opacity={0.5 * heat} /><circle cx={NX} cy={7} r={4} fill="#ffe08a" opacity={heat} /></>}
			</g>}
		</g>
	</g>;
};
const mixHex = (a: string, b: string, u: number) => { const p = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16), c = (i: number) => Math.round(lerp(p(a, i), p(b, i), cl(u))).toString(16).padStart(2, '0'); return `#${c(0)}${c(1)}${c(2)}`; };

/* ---------- fire (exported: the 杜甫 beacon uses the same flame so the hand-over matches) ---------- */
export const Blaze: React.FC<{x: number; y: number; s?: number; t: number; lean?: number; seed?: number; op?: number}> = ({x, y, s = 1, t, lean = 0, seed = 0, op = 1}) => {
	const tongue = (i: number, hgt: number, wid: number, ph: number) => { const n1 = Math.sin(t * (7 + i) + ph) * 0.12 + Math.sin(t * (13.3 + i * 0.7) + ph * 2) * 0.07, hh = hgt * (1 + n1);
		const tipX = lean * hh + Math.sin(t * (5.1 + i * 0.4) + ph) * wid * 0.35, mx = lean * hh * 0.45 + Math.sin(t * (8.7 + i) + ph * 1.3) * wid * 0.18;
		return `M${-wid},0 C${-wid * 1.05},${-hh * 0.35} ${mx - wid * 0.55},${-hh * 0.55} ${tipX},${-hh} C${mx + wid * 0.55},${-hh * 0.5} ${wid * 1.05},${-hh * 0.3} ${wid},0 Z`; };
	const L = [[0, 150, 54, '#e2501c', 0.9], [1, 128, 40, '#ff7e26', 1], [2, 118, 30, '#ff9b2e', 1], [3, 96, 24, '#ffbe48', 1], [4, 70, 17, '#ffe08a', 1], [5, 40, 11, '#fff4d2', 1]] as const;
	const side = [[-30, 92, 20, '#ff8a2a'], [28, 104, 22, '#ff8a2a'], [-14, 70, 14, '#ffc24a'], [16, 76, 14, '#ffc24a']] as const;
	return <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
		{L.slice(0, 1).map(([i, h0, w0, c, o]) => <path key={i} d={tongue(i, h0, w0, seed + i)} fill={c} opacity={o} />)}
		{side.map(([dx, h0, w0, c], i) => <path key={'s' + i} d={tongue(i + 7, h0, w0, seed + i * 2.3)} fill={c} transform={`translate(${dx},0)`} />)}
		{L.slice(1).map(([i, h0, w0, c, o]) => <path key={i} d={tongue(i, h0, w0, seed + i * 1.7)} fill={c} opacity={o} />)}
	</g>;
};
const FirePit: React.FC<{t: number; lean: number; tau: number; zoom: number}> = ({t, lean, tau, zoom}) => <g>
	<Glow x={FX} y={GY - 70} r={420} c="#ff8a3a" o={0.42 + 0.06 * Math.sin(t * 13) * Math.sin(t * 7.1)} id="shFireG" />
	<ellipse cx={FX} cy={GY + 6} rx={260} ry={34} fill="#ff8a3a" opacity={0.14} />
	<Smoke x={FX} y={GY - 150} tau={tau} lean={lean} s={1.1} op={0.8} seed={3} />
	<path d={`M${FX - 70},${GY + 2} L${FX + 70},${GY - 4} M${FX - 60},${GY - 8} L${FX + 64},${GY + 4}`} stroke="#1a0c06" strokeWidth={13} strokeLinecap="round" />
	<Blaze x={FX} y={GY - 6} s={1.05} t={t} lean={lean} />
	{/* coals and ring of stones */}
	<ellipse cx={FX} cy={GY - 2} rx={66} ry={9} fill="#ff6a1a" opacity={0.75} />
	{Array.from({length: 9}, (_, i) => { const a = (i / 8 - 0.5) * 2.6, x = FX + Math.sin(a) * 96; return <ellipse key={i} cx={x} cy={GY + 4 - Math.cos(a) * 4} rx={20 + 6 * rnd(i, 3)} ry={13} fill="#0a0610" />; })}
	{/* sparks */}
	{Array.from({length: 22}, (_, i) => { const u = ((t * (0.5 + 0.3 * rnd(i, 1)) + rnd(i, 2)) % 1); return <circle key={i} cx={FX + (rnd(i, 3) - 0.5) * 70 + Math.sin(u * 8 + i) * 14 + lean * 300 * u} cy={GY - 60 - u * 340} r={1.4 + rnd(i, 4) * 1.8} fill={rnd(i, 5) > 0.5 ? '#ffcf6a' : '#ffe9b0'} opacity={(1 - u) * 0.9 * (1 - seg(zoom, 3, 7))} />; })}
</g>;

/* ---------- the world ---------- */
/** a Shang hall: rammed-earth platform (battered sides, tamping courses), timber posts, wattle walls, thatched hip roof (no tiles, no upturned eaves) */
const ShangHall: React.FC<{x: number; gy: number; w: number; col: string; lit?: number; t: number; seed?: number}> = ({x, gy, w, col, lit = 1, t, seed = 0}) => {
	const ph = w * 0.13, top = gy - ph, wallH = w * 0.2, ey = top - wallH, ov = w * 0.1, rh = w * 0.26, rl = w * 0.22, hw = w / 2;
	const fl = 0.9 + 0.1 * Math.sin(t * 9 + seed) * Math.sin(t * 5.3 + seed);
	return <g>
		<path d={`M${x - hw - ph * 0.5},${gy + 2} L${x - hw},${top} L${x + hw},${top} L${x + hw + ph * 0.5},${gy + 2} Z`} fill={col} />
		{[0.3, 0.6].map((k, i) => <path key={i} d={`M${x - hw - ph * 0.5 * (1 - k)},${top + ph * (1 - k)} L${x + hw + ph * 0.5 * (1 - k)},${top + ph * (1 - k)}`} stroke="#000" strokeOpacity={0.18} strokeWidth={1.5} />)}
		<path d={`M${x - w * 0.06},${gy + 2} L${x - w * 0.04},${top} L${x + w * 0.04},${top} L${x + w * 0.06},${gy + 2} Z`} fill="#000" opacity={0.12} />
		<rect x={x - hw * 0.86} y={ey} width={w * 0.86} height={wallH} fill={col} />
		{Array.from({length: 7}, (_, i) => <rect key={i} x={x - hw * 0.86 + i * (w * 0.86 / 6) - 2.5} y={ey} width={5} height={wallH} fill="#000" opacity={0.22} />)}
		{lit > 0 && <><rect x={x - w * 0.045} y={ey + wallH * 0.3} width={w * 0.09} height={wallH * 0.7} fill="#ffb766" opacity={lit * fl * 0.9} /><Glow x={x} y={top - 6} r={w * 0.3} c="#ff9a4a" o={0.28 * lit * fl} id={`shHallG${seed}`} /></>}
		<path d={`M${x - hw - ov},${ey + 4} L${x - rl / 2},${ey - rh} L${x + rl / 2},${ey - rh} L${x + hw + ov},${ey + 4} Z`} fill={col} />
		<path d={Array.from({length: 22}, (_, i) => { const u = i / 21, xx = x - hw - ov + u * (w + 2 * ov); return `M${xx.toFixed(1)},${ey + 4} l${(-3 + 6 * rnd(i, seed)).toFixed(1)},${(5 + 6 * rnd(i, seed + 1)).toFixed(1)}`; }).join(' ')} stroke={col} strokeWidth={4} />
		{Array.from({length: 9}, (_, i) => { const u = (i + 0.5) / 9, xx = lerp(x - hw - ov * 0.6, x + hw + ov * 0.6, u), tx = lerp(x - rl / 2, x + rl / 2, u); return <path key={i} d={`M${xx.toFixed(1)},${ey} L${tx.toFixed(1)},${ey - rh + 4}`} stroke="#000" strokeOpacity={0.12} strokeWidth={2} />; })}
		<rect x={x - rl / 2 - 4} y={ey - rh - 5} width={rl + 8} height={7} rx={3} fill={col} />
	</g>;
};
const Millet: React.FC<{x: number; gy: number; h: number; col: string; t: number; wind: number; seed: number}> = ({x, gy, h, col, t, wind, seed}) =>
	<g>{Array.from({length: 7}, (_, i) => { const dx = (i - 3) * 6 + (rnd(i, seed) - 0.5) * 6, hh = h * (0.7 + 0.3 * rnd(i, seed + 1)), sw = (Math.sin(t * 1.7 + i + seed) * 0.06 - wind * 0.18) * hh, tx = x + dx + sw;
		return <g key={i}><path d={`M${x + dx},${gy + 2} Q${x + dx + sw * 0.3},${gy - hh * 0.6} ${tx},${gy - hh}`} stroke={col} strokeWidth={2.4} fill="none" />
			<path d={`M${tx},${gy - hh} q${8 + sw * 0.2},${4} ${10 + sw * 0.3},${hh * 0.22}`} stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" />
			<path d={`M${x + dx},${gy - hh * 0.35} q${-14},${-10} ${-22},${-4}`} stroke={col} strokeWidth={2} fill="none" /></g>; })}</g>;

/** a bank of rain clouds rolling in from the east (right): lumpy tops, flat lit undersides, soft edges (no rain falls) */
const Clouds: React.FC<{tau: number; k: number}> = ({tau, k}) => <g filter="url(#shBlurW)">
	{Array.from({length: 15}, (_, i) => { const x = lerp(W + 420 + 700 * rnd(i, 3), 600 + 1450 * rnd(i, 4), k) - tau * 6, y = 170 + 300 * rnd(i, 5), w = 420 + 300 * rnd(i, 6), hh = 80 + 60 * rnd(i, 7);
		const bumps = Array.from({length: 6}, (_, j) => { const u = (j + 0.5) / 6; return <circle key={j} cx={x - w / 2 + u * w} cy={y - hh * (0.35 + 0.5 * Math.sin(Math.PI * u) * (0.6 + 0.4 * rnd(i * 7 + j, 8)))} r={hh * (0.55 + 0.35 * Math.sin(Math.PI * u))} fill={i % 2 ? '#22213a' : '#1b1a30'} />; });
		return <g key={i}>{bumps}<rect x={x - w / 2} y={y - hh * 0.6} width={w} height={hh * 0.6} rx={hh * 0.3} fill={i % 2 ? '#22213a' : '#1b1a30'} />
			<rect x={x - w * 0.4} y={y - hh * 0.2} width={w * 0.8} height={hh * 0.24} rx={hh * 0.12} fill="#7a4a52" opacity={0.55} /></g>; })}
</g>;
/** a soft smoke column that leans with the wind */
const Smoke: React.FC<{x: number; y: number; tau: number; lean: number; s?: number; op?: number; seed?: number}> = ({x, y, tau, lean, s = 1, op = 1, seed = 0}) => <g filter="url(#shBlurS)" opacity={op}>
	{Array.from({length: 10}, (_, i) => { const u = ((tau * 0.2 + i / 10 + rnd(i, seed) * 0.05) % 1); return <circle key={i} cx={x + (lean * 520 * u * u + Math.sin(u * 6 + i + seed) * 10) * s} cy={y - u * 380 * s} r={(10 + 46 * u) * s} fill="#3a3044" opacity={0.42 * Math.sin(Math.PI * Math.min(1, u * 1.3))} />; })}
</g>;

const Embers: React.FC<{t: number; k: number}> = ({t, k}) => k <= 0 ? null : <g opacity={k}>{Array.from({length: 60}, (_, i) => { const life = 3 + 3 * rnd(i, 1), u = ((t + rnd(i, 2) * life) % life) / life;
	const x = 200 + rnd(i, 3) * 1520 + Math.sin(t * (0.5 + rnd(i, 4)) + i) * 30, y = 760 - u * 620;
	return <circle key={i} cx={x} cy={y} r={1 + 2.4 * rnd(i, 5)} fill={rnd(i, 6) > 0.5 ? '#ffb45a' : '#ffd88a'} opacity={(1 - u) * (0.3 + 0.6 * rnd(i, 7)) * Math.min(1, u * 6)} />; })}</g>;

/* ---------- camera keys: [time, zoom, focus(world), screen point] ---------- */
type Key = [number, number, [number, number], [number, number]];
const camAt = (tau: number, keys: Key[]) => { let i = 0; while (i < keys.length - 2 && tau >= keys[i + 1][0]) i++;
	const a = keys[i], b = keys[i + 1], u = ease(seg(tau, a[0], b[0]));
	return {zoom: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), F: [lerp(a[2][0], b[2][0], u), lerp(a[2][1], b[2][1], u)] as [number, number], S: [lerp(a[3][0], b[3][0], u), lerp(a[3][1], b[3][1], u)] as [number, number]}; };

export const SHANG3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const wind = sm(seg(tau, T.wind, T.wind + 1.6)), lean = -0.22 * wind - 0.05;
	/* --- the diviner's pose --- */
	const lookK = sm(seg(tau, T.look, T.look + 0.6)) * (1 - sm(seg(tau, T.lookEnd, T.lookEnd + 0.5)));
	let base = P_HOLD; if (lookK > 0) base = mixPose(P_HOLD, P_LOOK, lookK);
	const offerK = sm(seg(tau, T.offer, T.offer + 0.8));
	if (offerK > 0) base = mixPose(base, P_OFFER, offerK);
	// breathing (stays off during the macro so the crack holds still)
	const br = Math.sin(tau * 1.9) * 2.2 * cl((tau - 2.6) / 1.2);
	const lh = jointAt(base, 'LHand', DX, GY, FH);
	// plastron centre rides the left hand; its turn: front → back (to take the rod) → front
	const back = seg(tau, T.reach - 0.05, T.reach + 0.35) - seg(tau, T.flipA, T.flipB);
	const theta = Math.PI * sm(back), cosT = Math.cos(theta);
	const rot = lerp(-6, -14, offerK) + lerp(0, 4, lookK);   // SHELL_UP assumes -14 at the end of the offer
	const P: [number, number] = [lh[0] + 6, lh[1] - 64 + br * 0.3];
	const tfP = `translate(${P[0].toFixed(3)},${P[1].toFixed(3)}) rotate(${rot.toFixed(3)}) scale(${PS})`;
	const toW = (lx: number, ly: number): [number, number] => { const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), x = lx * PS * cosT, y = ly * PS; return [P[0] + x * c - y * s, P[1] + x * s + y * c]; };
	// the rod: rests in the fire, is lifted to the hollow, then laid back
	const restTip: [number, number] = [FX - 30, GY - 14], restHand: [number, number] = [955, 690];
	const holeW = toW(NX, 7), touchHand: [number, number] = [holeW[0] + 66, holeW[1] + 40];
	const kReach = sm(seg(tau, T.reach, T.reach + 0.4)), kLift = sm(seg(tau, T.lift, T.touch)), kBack = sm(seg(tau, T.flipA + 0.05, T.flipA + 0.6)), kRet = sm(seg(tau, T.flipB + 0.3, T.flipB + 0.9));
	const handNow: [number, number] = kReach <= 0 ? [0, 0] : kBack <= 0 ? [lerp(restHand[0], touchHand[0], kLift), lerp(restHand[1], touchHand[1], kLift)] : [lerp(touchHand[0], restHand[0], kBack), lerp(touchHand[1], restHand[1], kBack)];
	const usingRod = kReach > 0 && kRet < 1;
	let pose = base;
	if (usingRod) {
		const holdBase = {...KN, lean: 10 + 14 * (kReach - kLift + kBack * 0.7), neck: 10, la: 62, le: 56, ra: 56, re: 62};
		const ik = ikArm(holdBase, toBody(handNow)), withRod = fkPose({...holdBase, ...ik});
		pose = mixPose(base, withRod, kReach * (1 - kRet));
	}
	const rh = jointAt(pose, 'RHand', DX, GY, FH);
	const rodHeld = kReach > 0.98 && kRet < 0.02;
	const rodTip: [number, number] = rodHeld ? (kBack <= 0 ? [lerp(restTip[0], holeW[0], kLift), lerp(restTip[1], holeW[1], kLift)] : [lerp(holeW[0], restTip[0], kBack), lerp(holeW[1], restTip[1], kBack)]) : restTip;
	const rodEndH: [number, number] = rodHeld ? [rh[0], rh[1]] : restHand;
	const rodVec = [rodTip[0] - rodEndH[0], rodTip[1] - rodEndH[1]], rl = Math.hypot(rodVec[0], rodVec[1]) || 1;
	const rodEnd: [number, number] = [rodEndH[0] - rodVec[0] / rl * 22, rodEndH[1] - rodVec[1] / rl * 22];   // a short butt behind the hand
	const rodTipD: [number, number] = rodTip;
	const touching = seg(tau, T.touch - 0.05, T.touch + 0.05) * (1 - seg(tau, T.flipA, T.flipA + 0.1));
	/* --- shell states --- */
	const newK = easeOut(seg(tau, T.crack, T.crack + 0.42));
	const heat = Math.max(touching * 0.9, cl((tau - T.touch) / 0.2) * (1 - 0.25 * seg(tau, T.crack + 0.5, T.cool))) * (1 - seg(tau, T.cool, T.coolEnd));   // the crack glows gold through the graphs, then cools with the shell
	const glyph = GLYPHS.map((_, i) => easeOut(seg(tau, T.glyph0 + i * T.glyphStep, T.glyph0 + i * T.glyphStep + 0.36)));
	const cool = sm(seg(tau, T.cool, T.coolEnd));
	/* --- camera --- */
	const anchor = toW(LC[0], LC[1]);
	const keys: Key[] = [
		[0, Z0, anchor, [W / 2, H / 2]],
		[T.pullEnd, 1.32, anchor, [880 + 1.32 * (anchor[0] - 880), 560 + 1.32 * (anchor[1] - 600)]],   // the crack glides to its place on the shell
		[T.look + 0.3, 1.32, [880, 600], [880, 560]],
		[T.SQe - 0.2, 1.1, [900, 560], [920, 640]],                 // low angle, tilt up to the clouded east
		[T.touch - 0.1, 3.0, [P[0] + 40, P[1] + 10], [900, 500]],    // push in to the hands, rod and shell
		[T.crack + 0.35, 5.6, toW(NX + 4, 14), [960, 520]],           // the crack
		[T.glyph0 - 0.25, 9.2, toW(-30, 10), [960, 540]],             // tight on the crack and the column of graphs
		[T.offer + 0.2, 10.4, toW(-31, 10), [960, 540]],
		[T.sky, 1.35, toW(-30, 10), [700, 520]],                      // pull back and tilt up with the raised shell: the clouded eastern sky
		[T.fire, 1.33, FIRE_PT, [700 + 1.35 * (FIRE_PT[0] - SHELL_UP[0]), 520 + 1.35 * (FIRE_PT[1] - SHELL_UP[1])]],
		[T.end, SHANG_END.zoom, FIRE_PT, [W / 2, H / 2]],             // into the flame
	];
	const c = camAt(tau, keys);
	const dAmt = cl((tau - 2.4) / 1.5) * (1 - seg(tau, T.end - 1.4, T.end - 0.4));
	const dpx = dAmt * (6 * Math.sin(t * 0.37) + 3 * Math.sin(t * 0.91 + 1)), dpy = dAmt * (4 * Math.sin(t * 0.29 + 2) + 2 * Math.sin(t * 1.13));
	const shake = tau > T.crack && tau < T.crack + 0.1 ? (rnd(Math.floor(tau * 30), 5) - 0.5) * 14 : 0;
	const cam = {zoom: c.zoom, fx: c.F[0], fy: c.F[1], px: c.S[0] - c.F[0] + dpx + shake, py: c.S[1] - c.F[1] + dpy + shake * 0.6};
	const CT = camT(cam.zoom, cam.fx, cam.fy, cam.px, cam.py);
	const dark = 1 - sm(seg(tau, 0.25, 1.9));
	const showWorld = cam.zoom < 40;
	const pre = 1 - seg(tau, 2.6, 2.9);              // the title crack overlay (glowing, cooling) until it is part of the shell
	const crackHeat = 1 - sm(seg(tau, 1.4, 2.5));
	const fireFill = seg(tau, T.end - 0.9, T.end);
	return <g>
		<defs>
			<radialGradient id="shPlFire" cx="0.85" cy="0.6" r="0.9"><stop offset="0" stopColor="#ffb060" stopOpacity="0.55" /><stop offset="0.6" stopColor="#ff9040" stopOpacity="0.12" /><stop offset="1" stopColor="#2a1a30" stopOpacity="0.35" /></radialGradient>
			<linearGradient id="shSkyDim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a1c" stopOpacity="0.92" /><stop offset="0.45" stopColor="#10102c" stopOpacity="0.62" /><stop offset="0.72" stopColor="#24142e" stopOpacity="0.3" /><stop offset="1" stopColor="#000" stopOpacity="0.1" /></linearGradient>
			<radialGradient id="shScorch"><stop offset="0" stopColor="#5a2c10" stopOpacity="0.85" /><stop offset="0.55" stopColor="#7a4420" stopOpacity="0.45" /><stop offset="1" stopColor="#8a5a30" stopOpacity="0" /></radialGradient>
			<filter id="shBlurW" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="14" /></filter>
			<radialGradient id="shCuVig" cx="0.5" cy="0.5" r="0.62"><stop offset="0.45" stopColor="#05030a" stopOpacity="0" /><stop offset="1" stopColor="#05030a" stopOpacity="0.85" /></radialGradient>
			<filter id="shBlurS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
			<filter id="shBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
			<filter id="shBlur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
			<filter id="shFg" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
		</defs>
		<rect width={W} height={H} fill="#06060f" />
		<g transform={CT}>
			{showWorld && <g>
				<image href={staticFile('ep41/shang_sky.webp')} x={-80} y={-150} width={2100} height={1181} preserveAspectRatio="none" />
				<rect x={-200} y={-200} width={W + 400} height={1000} fill="url(#shSkyDim)" />
				<StarField t={t} n={180} maxY={560} op={0.85 * (1 - 0.85 * sm(seg(tau, T.wind, T.wind + 3)))} seed={3} />
				<Clouds tau={tau} k={easeOut(seg(tau, T.wind - 0.2, T.wind + 3.2))} />
				<Layer cam={0} f={0.04} base={700} amp={22} seed={2} col="#2b2238" period={700} item={(x, gy, i) => i % 3 === 1 ? <ShangHall x={x} gy={gy} w={70} col="#2b2238" t={t} seed={i + 40} lit={0.6} /> : null} />
				<rect x={-200} y={712} width={W + 400} height={34} fill="#3a3456" />
				<path d={`M-200,${722} L${W + 200},${719}`} stroke="#8b7fa8" strokeWidth={1.5} opacity={0.35 + 0.1 * Math.sin(t * 2)} />
				<Layer cam={0} f={0.22} base={772} amp={30} seed={5} col="#1c1528" period={560} pad={300} item={(x, gy, i) => {
					if (i % 2 === 0) return <g><ShangHall x={x} gy={gy} w={230 + 40 * rnd(i, 7)} col="#1c1528" t={t} seed={i} />
						{/* hearth smoke from the hall */}
						<Smoke x={x + 20} y={gy - 110} tau={tau + i} lean={lean} s={0.45} op={0.6} seed={i} /></g>;
					if (i === 1) return <g>{[0, 1].map((j) => <Rimmed key={j} x={x + j * 34} ground={gy + 2} h={46} pose={fkPose({...KN, lean: 20, neck: 10, la: 60, le: 40, ra: 50, re: 50})} look={{dress: 'tunic', head: 'cylcap'}} col="#141020" rimOp={0} />)}</g>;
					return null; }} />
				<Layer cam={0} f={0.55} base={826} amp={14} seed={8} col="#120d1c" period={420} pad={300} item={(x, gy, i) => i === 0 ? <Sprite k="tree" x={x - 120} y={gy} h={330} c="#0f0a17" /> : i === 1 ? <Sprite k="ding" x={x - 160} y={gy} h={96} c="#0f0a17" /> : (i % 1 === 0 && i > 1 && i < 5) ? <Millet x={x} gy={gy} h={60 + 20 * rnd(i, 2)} col="#0f0a17" t={t} wind={wind} seed={i} /> : null} />
				{/* the near ground where he kneels */}
				<path d={`M-200,${H + 200} L-200,${GY - 6} Q400,${GY - 14} ${DX},${GY - 2} Q1300,${GY + 6} ${W + 200},${GY - 10} L${W + 200},${H + 200} Z`} fill="#0b0812" />
				<FirePit t={t} lean={lean} tau={tau} zoom={cam.zoom} />
				{/* a forked stake holds the resting rod; the rod: copper-alloy, its end glowing */}
				<path d={`M975,${GY + 2} L975,724 M975,736 L966,716 M975,734 L986,714`} stroke="#120a10" strokeWidth={5} strokeLinecap="round" fill="none" />
				<g>
					<line x1={rodEnd[0]} y1={rodEnd[1]} x2={rodTipD[0]} y2={rodTipD[1]} stroke="#2a1a10" strokeWidth={4.2} strokeLinecap="round" />
					<line x1={lerp(rodEnd[0], rodTipD[0], 0.8)} y1={lerp(rodEnd[1], rodTipD[1], 0.8)} x2={rodTipD[0]} y2={rodTipD[1]} stroke="#ff7a2a" strokeWidth={4} strokeLinecap="round" />
					<line x1={lerp(rodEnd[0], rodTipD[0], 0.93)} y1={lerp(rodEnd[1], rodTipD[1], 0.93)} x2={rodTipD[0]} y2={rodTipD[1]} stroke="#ffe6a8" strokeWidth={3} strokeLinecap="round" />
				</g>
				<Rimmed x={DX} ground={GY} h={FH} pose={pose} look={look} col="#0a0710" rim="#ffb070" rimOp={0.24} rimDx={2.6} rimDy={-1} T={tau} />
				{/* the rod in front of the shell while it touches the back face */}
				<PlastronV tf={tfP} cosT={cosT} heat={heat} newK={newK} glyph={glyph} cool={cool} t={t} />
				{tau > T.reach && tau < T.flipA + 0.6 && rodHeld && <g>
					<line x1={rh[0]} y1={rh[1]} x2={rodTipD[0]} y2={rodTipD[1]} stroke="#2a1a10" strokeWidth={4.2} strokeLinecap="round" />
					<line x1={lerp(rh[0], rodTipD[0], 0.85)} y1={lerp(rh[1], rodTipD[1], 0.85)} x2={rodTipD[0]} y2={rodTipD[1]} stroke="#ffb050" strokeWidth={4} strokeLinecap="round" />
					<circle cx={rodTipD[0]} cy={rodTipD[1]} r={3} fill="#fff0c0" />
				</g>}
				{/* left fingers over the shell's edge */}
				{[-18, -10, 10].map((lx, i) => { const e = toW(lx * Math.sign(cosT || 1), 104); return <ellipse key={i} cx={e[0]} cy={e[1] + 1} rx={3.4} ry={5.2} fill="#0a0710" transform={`rotate(${rot} ${e[0]} ${e[1]})`} />; })}
				{/* the puff of smoke and sparks at the touch */}
				{tau > T.touch - 0.05 && tau < T.flipA + 0.8 && Array.from({length: 10}, (_, i) => { const u = cl((tau - T.touch) / (0.9 + 0.3 * rnd(i, 3))); return u <= 0 || u >= 1 ? null : <circle key={i} cx={holeW[0] + (rnd(i, 1) - 0.5) * 40 * u - 10 * u} cy={holeW[1] - 50 * u * (0.5 + rnd(i, 2))} r={2 + 9 * u} fill={i < 4 ? '#ffd27a' : '#6a5a66'} opacity={(1 - u) * (i < 4 ? 0.9 : 0.45)} />; })}
				{/* foreground grass, blurred */}
				<g filter="url(#shFg)">{Array.from({length: 16}, (_, i) => { const x = -100 + i * 140 + 40 * rnd(i, 3), hh = 70 + 60 * rnd(i, 4), sw = (Math.sin(t * 1.4 + i) * 0.1 - wind * 0.25) * hh;
					return <path key={i} d={`M${x - 14},${H + 40} Q${x},${H - hh * 0.5} ${x + sw},${H - hh} Q${x + 6},${H - hh * 0.5} ${x + 14},${H + 40} Z`} fill="#05030a" />; })}</g>
			</g>}
			{!showWorld && <PlastronV tf={tfP} cosT={cosT} heat={heat} newK={newK} glyph={glyph} cool={cool} t={t} />}
		</g>
		{cam.zoom > 3 && <rect width={W} height={H} fill="url(#shCuVig)" opacity={0.75 * seg(cam.zoom, 3, 7)} />}
		{/* overlays drawn in screen space so their glow does not scale with the camera */}
		{dark > 0 && <g><rect width={W} height={H} fill="#030203" opacity={dark} />
			<radialGradient id="shWarm" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#3a1a08" stopOpacity={0.15} /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
			<rect width={W} height={H} fill="url(#shWarm)" opacity={dark} /></g>}
		{pre > 0 && <g style={{filter: crackHeat > 0.02 ? `drop-shadow(0 0 ${(4 + 18 * 0.25 * crackHeat).toFixed(2)}px rgba(255,150,60,${(0.525 * crackHeat).toFixed(3)}))` : undefined}} opacity={pre}>
			<g transform={`${CT} ${tfP} translate(${LC[0]},${LC[1]}) scale(${KL}) translate(-960,-540)`}>
				<g opacity={1 - sm(seg(tau, 1.7, 2.5))}>
					<path d={TC.main} stroke={mixHex('#e8dcc6', '#ffc27a', sm(seg(tau, 0.3, 1.2)))} strokeWidth={3.39 * Math.min(1, Math.pow(cam.zoom / Z0, 0.3)) * (1 + 0.6 * sm(seg(tau, 0.6, 1.4)))} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />
					{TC.branches.map((b, i) => <path key={i} d={b} stroke="#ffc27a" strokeWidth={1.9 * Math.min(1, Math.pow(cam.zoom / Z0, 0.3)) * (1 + 0.6 * sm(seg(tau, 0.6, 1.4)))} vectorEffect="non-scaling-stroke" fill="none" opacity={0.85} />)}
				</g>
				<g opacity={sm(seg(tau, 0.9, 1.6))}>
					<path d={TC.main} stroke="#3a2414" strokeWidth={3.39 * Math.pow(cam.zoom / Z0, 0.3)} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />
					{TC.branches.map((b, i) => <path key={i} d={b} stroke="#4a2c16" strokeWidth={1.9 * Math.pow(cam.zoom / Z0, 0.3)} vectorEffect="non-scaling-stroke" fill="none" opacity={0.85} />)}
				</g>
			</g></g>}
		{pre <= 0 && <g transform={`${CT} ${tfP}`}><g transform={`scale(${Math.max(0.04, Math.abs(cosT))},1)`} opacity={cosT >= 0 ? 1 : 0}>
			<g transform={`translate(${LC[0]},${LC[1]}) scale(${KL}) translate(-960,-540)`}>
				<path d={TC.main} stroke="#3a2414" strokeWidth={3.39 * Math.pow(cam.zoom / Z0, 0.3)} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />
				{TC.branches.map((b, i) => <path key={i} d={b} stroke="#4a2c16" strokeWidth={1.9 * Math.pow(cam.zoom / Z0, 0.3)} vectorEffect="non-scaling-stroke" fill="none" opacity={0.85} />)}
			</g></g></g>}
		{/* the new crack's gold glow, and each graph's glow as it is cut */}
		{newK > 0 && heat > 0.02 && cosT > 0 && <g filter="url(#shBlur6)" opacity={heat}><g transform={`${CT} ${tfP}`}>
			<path d={pathOf(NEW_STEM, cl(newK * 2))} stroke="#ff9a30" strokeWidth={18 + 4 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" opacity={0.55} />
			<path d={pathOf(NEW_STEM, cl(newK * 2))} stroke={GOLD} strokeWidth={10 + 2.2 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
			{newK > 0.45 && <path d={pathOf(NEW_BR, cl((newK - 0.45) / 0.4))} stroke="#ff9a30" strokeWidth={16 + 3.6 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" opacity={0.55} />}
			{newK > 0.45 && <path d={pathOf(NEW_BR, cl((newK - 0.45) / 0.4))} stroke={GOLD} strokeWidth={9 + 2 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />}
		</g></g>}
		{newK > 0 && heat > 0.02 && cosT > 0 && <g opacity={heat}><g transform={`${CT} ${tfP}`}>
			<path d={pathOf(NEW_STEM, cl(newK * 2))} stroke={GOLD} strokeWidth={2 + 0.5 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />
			{newK > 0.45 && <path d={pathOf(NEW_BR, cl((newK - 0.45) / 0.4))} stroke={GOLD} strokeWidth={1.8 + 0.45 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />}
			<path d={pathOf(NEW_STEM, cl(newK * 2))} stroke="#fff8e4" strokeWidth={1.2 + 0.12 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />
			{newK > 0.45 && <path d={pathOf(NEW_BR, cl((newK - 0.45) / 0.4))} stroke="#fff8e4" strokeWidth={1 + 0.1 * cam.zoom} vectorEffect="non-scaling-stroke" fill="none" strokeLinejoin="bevel" />}
		</g></g>}
		{tau > T.glyph0 - 0.1 && tau < T.glyph0 + 5 * T.glyphStep + 1.0 && <><g filter="url(#shBlur6)"><g transform={`${CT} ${tfP}`}>
			{GLYPHS.map((g, i) => { const t0 = T.glyph0 + i * T.glyphStep, k = cl((tau - t0) / 0.12) * (1 - cl((tau - t0 - 0.45) / 0.5)); return k <= 0 ? null : <path key={i} d={g} transform={`translate(${GX},${GY0 + i * GDY}) scale(${GS})`} stroke={GOLD} strokeWidth={22} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity={k * 0.85} />; })}
		</g></g><g transform={`${CT} ${tfP}`}>
			{GLYPHS.map((g, i) => { const t0 = T.glyph0 + i * T.glyphStep, k = cl((tau - t0) / 0.12) * (1 - cl((tau - t0 - 0.45) / 0.5)), dk = easeOut(seg(tau, t0, t0 + 0.36)); return k <= 0 ? null : <path key={i} d={g} transform={`translate(${GX},${GY0 + i * GDY}) scale(${GS})`} stroke={GOLD} strokeWidth={4} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={6} strokeDashoffset={6 * (1 - dk)} pathLength={6} opacity={k} />; })}
		</g></>}
		<Embers t={t} k={0.5 * (1 - seg(tau, 0, 1.4))} />
		{/* into the flame: a warm tint as the flame fills the frame */}
		{fireFill > 0 && <rect width={W} height={H} fill="#ff9b2e" opacity={0.3 * easeIn(fireFill)} />}
	</g>;
};
export type {Pose};
