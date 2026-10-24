import React from 'react';
import {staticFile} from 'remotion';
import {W, H, SERIF, rnd, cl, sm, lerp, Layer, Sprite, Glow, ridgeY, fkPose, mixPose, Rimmed, jointAt, walkToStand, gaitPose, speed4, CYCLE, POSES, Look4} from './v3base';
import {seg, ease, easeOut} from './fx';
import {Blaze, camT, SHANG_END} from './s41shang';
/* 杜甫 34.836–54.875 (20.039 s) · 757, spring dusk, occupied Chang'an.
   We pull back out of a beacon fire (the 商 scene ended inside its fire) to the 烽燧 burning on the hills; below, the city:
   ward walls of rammed earth, the pagoda and halls, each on its own ground. Du Fu walks through overgrown streets under
   falling blossom (treadmill walker), slows to a stand at his low table; the beacons catch along the ridges one after
   another; he kneels, writes 烽火連三月 家書抵萬金 in two brush columns, folds the sheet in three and slips a paper band
   round it. The camera pushes onto the sealed packet until it fills the frame (match to Morse's sealed 1825 sheet).
   No compass claims, no sky calligraphy, no envelope (director's gate). */

/** scene-relative seconds, keyed to the measured VO: D1 35.30–38.38, D2 38.90–42.53, D3 43.00–45.12, DQ 45.50–49.63 */
export const DU_T = {
	D1: 0.464, D1e: 3.544, D2: 4.064, D2e: 7.694, D3: 8.164, D3e: 10.284, DQ: 10.664, DQe: 14.794, end: 20.039,
	pullEnd: 3.6,                    // out of the beacon fire to the wide city
	crows: 5.2,                      // crows lift from a burned roof
	stopA: 7.1, stopB: 8.0,          // walk → stand (walkToStand)
	craneA: 7.5, craneB: 8.7,        // crane up: the near layers sink, the ridges and their fires fill the frame
	beacon0: 7.358, beaconStep: 0.566, // the chain lights right to left across the ridges: 5 more beacons on beats 13–17 (all lit before the crane comes down)
	craneDownA: 10.05, craneDownB: 10.85,
	kneelA: 10.0, kneelB: 10.7,      // stand → kneel at the low table
	char0: 11.0, charStep: 0.36, col2: 12.9,     // the ten characters, in sync with DQ (two half-lines)
	foldA: 15.0, foldB: 15.75, band: 16.5, bandEnd: 17.1,
	push: 17.1,                      // push onto the sealed packet → it fills the frame at the end
};
const T = DU_T;
const mixC = (a: string, b: string, u: number) => { const p = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16), c = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * Math.max(0, Math.min(1, u))).toString(16).padStart(2, '0'); return `#${c(0)}${c(1)}${c(2)}`; };
const GY = 880, DH = 430, DX = 760;
const look: Look4 = {dress: 'robe', head: 'futou', beard: 'long', build: 0.9};
const V = speed4(look, DH);
/** distance walked (treadmill): full speed, then slowing to a stop between stopA and stopB */
const walked = (tau: number) => { const a = T.stopA, b = T.stopB; if (tau <= a) return V * tau; const u = cl((tau - a) / (b - a)); return V * (a + (b - a) * (u - (u * u * u - u * u * u * u / 2))); };
const CAM_STOP = walked(T.stopB + 1);
/* the low table (on the near ground, f = 1) and the paper on it */
const TABLE_X = DX + 116 + CAM_STOP;         // world x of the table's front edge (screen x 876 once he has stopped: within arm's reach)
const TW = 190, TOP = 50;                    // table length, height of the top above the ground
const PS = 0.5;                              // paper: world px per local unit (sheet = 150 × 120 local)
const CHARS = ['烽火連三月', '家書抵萬金'];    // Tang-era forms on the sheet (the subtitle shows the modern line)
const COLX = [52, 28], ROW0 = -42, ROWD = 21, CS = 19;

const KNEEL = fkPose({hip: 0.21, lean: 18, neck: 16, lt: 82, lk: 172, rt: 86, rk: 176, lf: 180, rf: 180, la: 44, le: 70, ra: 40, re: 70});
const BLU = 0.194, BLF = 0.135;
const ik = (base: Parameters<typeof fkPose>[0], target: [number, number]) => {
	const S = fkPose(base).LSh, vx = target[0] - S[0], vy = target[1] - S[1], D = Math.min(Math.hypot(vx, vy), (BLU + BLF) * 0.995);
	const th = Math.atan2(vx, -vy), al = Math.acos(cl((BLU * BLU + D * D - BLF * BLF) / (2 * BLU * D), -1, 1)), a = th - al;
	const E = [S[0] + Math.sin(a) * BLU, S[1] - Math.cos(a) * BLU], ph = Math.atan2(target[0] - E[0], -(target[1] - E[1]));
	return {a: a * 180 / Math.PI, e: (ph - a) * 180 / Math.PI};
};
const KB = {hip: 0.21, lean: 30, neck: 18, lt: 82, lk: 172, rt: 86, rk: 176, lf: 180, rf: 180, la: 44, le: 70, ra: 40, re: 70};
const toBody = (p: [number, number]): [number, number] => [(p[0] - DX) / DH, (GY - p[1]) / DH];

/* ---------- architecture (all drawn standing on the ground y they are given) ---------- */
/** 烽燧: a square, tapered rammed-earth beacon tower with a parapet and a brushwood stack on top */
const Beacon: React.FC<{x: number; gy: number; s: number; col: string; lit: number; t: number; seed: number; lean?: number}> = ({x, gy, s, col, lit, t, seed, lean = -0.25}) => {
	const bw = 70 * s, tw = 46 * s, h = 112 * s, top = gy - h;
	return <g>
		{lit > 0 && <Glow x={x} y={top - 30 * s} r={150 * s} c="#ffb050" o={0.5 * lit} id={`duBg${seed}`} />}
		{lit > 0 && <g filter="url(#duBlurS)" opacity={lit}>{Array.from({length: 18}, (_, i) => { const u = ((t * 0.16 + i / 18 + rnd(seed, 3)) % 1); return <circle key={i} cx={x + (lean * 900 * u * u + Math.sin(u * 5 + i) * 8) * s} cy={top - 50 * s - u * 520 * s} r={(10 + 50 * u) * s} fill="#4a2a36" opacity={0.55 * Math.sin(Math.PI * Math.min(1, u * 1.2))} />; })}</g>}
		<path d={`M${x - bw / 2},${gy + 3} L${x - tw / 2},${top} L${x + tw / 2},${top} L${x + bw / 2},${gy + 3} Z`} fill={col} />
		{[0.25, 0.5, 0.75].map((k, i) => <path key={i} d={`M${lerp(x - bw / 2, x - tw / 2, k)},${lerp(gy, top, k)} L${lerp(x + bw / 2, x + tw / 2, k)},${lerp(gy, top, k)}`} stroke="#000" strokeOpacity={0.14} strokeWidth={Math.max(0.6, 1.4 * s)} />)}
		<path d={`M${x - tw / 2 - 2 * s},${top + 1} L${x - tw / 2 - 2 * s},${top - 9 * s} L${x - tw / 2 + 7 * s},${top - 9 * s} L${x - tw / 2 + 7 * s},${top - 5 * s} L${x + tw / 2 - 7 * s},${top - 5 * s} L${x + tw / 2 - 7 * s},${top - 9 * s} L${x + tw / 2 + 2 * s},${top - 9 * s} L${x + tw / 2 + 2 * s},${top + 1} Z`} fill={col} />
		{/* the brushwood stack */}
		<path d={`M${x - 15 * s},${top - 4 * s} L${x - 3 * s},${top - 26 * s} L${x + 2 * s},${top - 22 * s} L${x + 15 * s},${top - 4 * s} Z`} fill={col} />
		{Array.from({length: 5}, (_, i) => <path key={i} d={`M${x + (-12 + i * 6) * s},${top - 5 * s} L${x + (-6 + i * 3) * s + (rnd(i, seed) - 0.5) * 8 * s},${top - 30 * s}`} stroke={col} strokeWidth={1.6 * s} />)}
		{lit > 0 && <Blaze x={x} y={top - 6 * s} s={0.36 * s * (0.4 + 0.6 * lit)} t={t} lean={lean} seed={seed} op={Math.min(1, lit * 1.5)} />}
	</g>;
};
/** 大雁塔: square brick pagoda of seven storeys with corbelled eaves and a finial, on its own mound */
const Pagoda: React.FC<{x: number; gy: number; s: number; col: string}> = ({x, gy, s, col}) => {
	let y = gy - 22 * s; const parts: React.ReactNode[] = [];
	parts.push(<path key="m" d={`M${x - 110 * s},${gy + 4} Q${x - 70 * s},${gy - 24 * s} ${x - 50 * s},${gy - 22 * s} L${x + 50 * s},${gy - 22 * s} Q${x + 70 * s},${gy - 24 * s} ${x + 110 * s},${gy + 4} Z`} fill={col} />);
	for (let i = 0; i < 7; i++) { const w = (60 - i * 5.5) * s, hh = (i === 0 ? 40 : 28 - i * 1.2) * s;
		parts.push(<rect key={'b' + i} x={x - w / 2} y={y - hh} width={w} height={hh} fill={col} />);
		parts.push(<path key={'e' + i} d={`M${x - w / 2 - 7 * s},${y - hh} L${x + w / 2 + 7 * s},${y - hh} L${x + w / 2 + 3 * s},${y - hh - 5 * s} L${x - w / 2 - 3 * s},${y - hh - 5 * s} Z`} fill={col} />);
		if (i > 0) parts.push(<rect key={'w' + i} x={x - 3 * s} y={y - hh * 0.75} width={6 * s} height={hh * 0.45} fill="#000" opacity={0.25} />);
		y -= hh + 5 * s; }
	parts.push(<path key="f" d={`M${x - 8 * s},${y} Q${x},${y - 14 * s} ${x + 8 * s},${y} Z M${x - 1.5 * s},${y - 10 * s} L${x - 1.5 * s},${y - 30 * s} L${x + 1.5 * s},${y - 30 * s} L${x + 1.5 * s},${y - 10 * s} Z`} fill={col} />);
	return <g>{parts}</g>;
};
/** a Tang hall: platform, columns, hipped tile roof with broad gently curved eaves; `burned` breaks the roof and adds smoke */
const TangHall: React.FC<{x: number; gy: number; w: number; col: string; burned?: number; t: number; tau: number; seed: number}> = ({x, gy, w, col, burned = 0, t, tau, seed}) => {
	const ph = w * 0.06, top = gy - ph, wh = w * 0.22, ey = top - wh, ov = w * 0.14, rh = w * 0.2, rl = w * 0.5, hw = w / 2;
	return <g>
		<rect x={x - hw - 6} y={top} width={w + 12} height={ph + 4} fill={col} />
		<rect x={x - hw * 0.85} y={ey} width={w * 0.85} height={wh} fill={col} />
		{Array.from({length: 6}, (_, i) => <rect key={i} x={x - hw * 0.85 + i * (w * 0.85 / 5) - 2} y={ey} width={4} height={wh} fill="#000" opacity={0.2} />)}
		{burned < 0.5 ? <path d={`M${x - hw - ov},${ey + 6} Q${x - hw * 0.6},${ey - 2} ${x - rl / 2},${ey - rh} L${x + rl / 2},${ey - rh} Q${x + hw * 0.6},${ey - 2} ${x + hw + ov},${ey + 6} Q${x},${ey + 1} ${x - hw - ov},${ey + 6} Z M${x - rl / 2 - 6},${ey - rh + 2} L${x - rl / 2 - 4},${ey - rh - 7} L${x + rl / 2 + 4},${ey - rh - 7} L${x + rl / 2 + 6},${ey - rh + 2} Z`} fill={col} />
			: <g><path d={`M${x - hw - ov * 0.5},${ey + 6} Q${x - hw * 0.6},${ey} ${x - rl / 2},${ey - rh * 0.8} L${x - rl * 0.1},${ey - rh * 0.55} L${x + rl * 0.05},${ey - rh * 0.2} L${x + hw * 0.4},${ey + 2} L${x + hw * 0.85},${ey + 6} Z`} fill={col} />
				{[-0.2, 0.05, 0.25, 0.4].map((k, i) => <path key={i} d={`M${x + k * w},${ey + 2} L${x + k * w + 14 * (i % 2 ? 1 : -1)},${ey - rh * (0.4 + 0.3 * rnd(i, seed))}`} stroke={col} strokeWidth={4} />)}
				<g filter="url(#duBlurS)">{Array.from({length: 7}, (_, i) => { const u = ((tau * 0.12 + i / 7 + rnd(seed, 1)) % 1); return <circle key={i} cx={x + w * 0.1 - u * u * 160 + Math.sin(u * 6 + i) * 8} cy={ey - 10 - u * 260} r={8 + 30 * u} fill="#3a2230" opacity={0.4 * Math.sin(Math.PI * Math.min(1, u * 1.2))} />; })}</g></g>}
	</g>;
};
/** a rammed-earth ward wall along the layer: battered faces, tamping courses, an earthen parapet; a gate tower; one breach */
const WardWall: React.FC<{cam: number; f: number; gy: number; col: string; breachX: number; gateX: number; t: number; tau: number}> = ({cam, f, gy, col, breachX, gateX, t, tau}) => {
	const off = cam * f, h = 150, bx = breachX - off, gx = gateX - off;
	const top = gy - h, d = `M-100,${gy + 4} L-100,${top} ${bx - 120 > -100 ? `L${bx - 120},${top} L${bx - 90},${top + 26} L${bx - 60},${top + 70} L${bx - 30},${top + 86} L${bx},${gy - 30} L${bx + 34},${gy - 40} L${bx + 70},${top + 74} L${bx + 100},${top + 30} L${bx + 120},${top}` : ''} L${W + 100},${top} L${W + 100},${gy + 4} Z`;
	return <g>
		<path d={d} fill={col} />
		{[0.3, 0.55, 0.8].map((k, i) => <path key={i} d={`M-100,${top + h * k} L${W + 100},${top + h * k}`} stroke="#000" strokeOpacity={0.12} strokeWidth={2} clipPath="url(#duWallClip)" />)}
		{/* parapet blocks along the top (gaps at the breach) */}
		{Array.from({length: 46}, (_, i) => { const x = -100 + i * 48 - (off % 48); return Math.abs(x - bx) < 150 ? null : <rect key={i} x={x} y={top - 14} width={30} height={15} fill={col} />; })}
		{/* gate tower: timber hall on the wall with a hipped tile roof, broad gently curved eaves */}
		<g><rect x={gx - 70} y={top - 6} width={140} height={10} fill={col} />
			<path d={`M${gx - 44},${gy + 4} L${gx - 44},${gy - 92} Q${gx},${gy - 112} ${gx + 44},${gy - 92} L${gx + 44},${gy + 4} Z`} fill="#000" opacity={0.35} />
			<TangHall x={gx} gy={top} w={180} col={col} t={t} tau={tau} seed={7} /></g>
	</g>;
};
/** tall overgrown grass: a clump of blades swaying */
const Grass: React.FC<{x: number; gy: number; h: number; col: string; t: number; seed: number; n?: number}> = ({x, gy, h, col, t, seed, n = 9}) =>
	<g>{Array.from({length: n}, (_, i) => { const dx = (i - n / 2) * 7 + (rnd(i, seed) - 0.5) * 8, hh = h * (0.55 + 0.45 * rnd(i, seed + 1)), sw = Math.sin(t * 1.3 + i * 0.7 + seed) * 0.12 * hh + 0.12 * hh * (rnd(i, seed + 2) - 0.5);
		return <path key={i} d={`M${x + dx - 3},${gy + 3} Q${x + dx + sw * 0.3},${gy - hh * 0.6} ${x + dx + sw},${gy - hh} Q${x + dx + sw * 0.25 + 2},${gy - hh * 0.55} ${x + dx + 3},${gy + 3} Z`} fill={col} />; })}</g>;
/** an apricot tree in blossom (sprite) with petals on its crown */
const Apricot: React.FC<{x: number; gy: number; h: number; col: string; t: number; seed: number}> = ({x, gy, h, col, t, seed}) => <g>
	<Sprite k="peach" x={x} y={gy} h={h} c={col} />
	{Array.from({length: 46}, (_, j) => { const a = rnd(j, seed + 4) * Math.PI * 2, r = Math.sqrt(rnd(j, seed + 5)); return <circle key={j} cx={x + Math.cos(a) * r * h * 0.5} cy={gy - h * 0.66 + Math.sin(a) * r * h * 0.26 + Math.sin(t * 2 + j) * 1.5} r={h * (0.008 + 0.008 * rnd(j, 6))} fill={j % 3 ? '#f4a6b8' : '#f9c8d2'} opacity={0.85} />; })}
</g>;

/* ---------- the sheet: written, folded in three, banded ---------- */
const Sheet: React.FC<{x: number; y: number; fs: number; chars: number[]; fold1: number; fold2: number; band: number; dim?: number}> = ({x, y, fs, chars, fold1, fold2, band, dim = 0}) => {
	const paper = '#efe3c4', back = '#e4d6b2', edge = '#b8a074';
	const writing = <g>{CHARS.map((col, c) => col.split('').map((ch, i) => { const k = chars[c * 5 + i]; if (k <= 0) return null; const cx = COLX[c], cy = ROW0 + i * ROWD;
		return <g key={`${c}${i}`}><clipPath id={`duCh${c}${i}`}><rect x={cx - 12} y={cy - 12} width={24} height={24 * k} /></clipPath>
			<text x={cx} y={cy + 7} textAnchor="middle" clipPath={`url(#duCh${c}${i})`} style={{fontFamily: SERIF, fontWeight: 700, fontSize: CS}} fill="#1c140e">{ch}</text></g>; }))}</g>;
	// right third (with the writing) folds over first, then the left third over it
	const r = 1 - 2 * sm(fold1), l = 1 - 2 * sm(fold2);
	return <g transform={`translate(${x},${y}) scale(${PS},${PS * fs})`}>
		{(() => { const lw = 50 * (1 - sm(fold2)), rw = 50 * (1 - sm(fold1)); return <rect x={-25 - lw} y={-60} width={50 + lw + rw} height={120} fill="#000" opacity={0.22} transform="translate(2.5,3.5)" />; })()}
		{fold1 <= 0 && fold2 <= 0 ? <rect x={-75} y={-60} width={150} height={120} fill={paper} stroke={edge} strokeWidth={0.6} /> : <rect x={-25} y={-60} width={50} height={120} fill={paper} stroke={edge} strokeWidth={0.6} />}
		{Array.from({length: 26}, (_, i) => <path key={'fb' + i} d={`M${-70 + rnd(i, 3) * 140},${-56 + rnd(i, 4) * 112} l${4 + 8 * rnd(i, 5)},${(rnd(i, 6) - 0.5) * 2}`} stroke="#c9b48a" strokeWidth={0.35} opacity={fold1 <= 0 && fold2 <= 0 ? 0.6 : 0} />)}
		{/* left third */}
		{(fold1 > 0 || fold2 > 0) && <g transform={`translate(-25,0) scale(${l},1) translate(25,0)`}><rect x={-75} y={-60} width={50} height={120} fill={l >= 0 ? paper : back} stroke={edge} strokeWidth={0.6} /></g>}
		{/* right third, carrying the two columns */}
		<g transform={`translate(25,0) scale(${r},1) translate(-25,0)`}>{(fold1 > 0 || fold2 > 0) && <rect x={25} y={-60} width={50} height={120} fill={r >= 0 ? paper : back} stroke={edge} strokeWidth={0.6} />}{r >= 0 && writing}</g>
		{fold2 > 0.5 && <path d="M-24,-60 L-24,60" stroke="#fff" strokeOpacity={0.5} strokeWidth={0.8} />}
		{fold2 > 0.5 && <g transform={`translate(-25,0) scale(${l},1) translate(25,0)`}><rect x={-75} y={-60} width={50} height={120} fill={back} stroke={edge} strokeWidth={0.6} /></g>}
		{/* the paper band slipped over the middle, then a stroke of ink across band and fold */}
		{/* band: last frame (zoom 15.5) puts it at screen y 520–590, as reported to the Morse scene */}
		{band > 0 && <g><rect x={-28} y={lerp(-120, -2.9, easeOut(band))} width={56} height={10} fill="#d9c69c" stroke={edge} strokeWidth={0.6} opacity={cl(band * 3)} />
			{band > 0.8 && <path d={`M-6,${-16} L-4,${-16 + 34 * cl((band - 0.8) / 0.2)}`} stroke="#3a1a10" strokeWidth={2.4} strokeLinecap="round" />}</g>}
		{/* in the dusk wide shots the sheet is only faintly lit; it brightens as the camera comes down to it */}
		{dim > 0 && <rect x={-76} y={-61} width={152} height={122} fill="#3a1c28" opacity={0.78 * dim} />}
	</g>;
};

/* ---------- camera keys ---------- */
type Key = [number, number, [number, number], [number, number]];
const camAt = (tau: number, keys: Key[]) => { let i = 0; while (i < keys.length - 2 && tau >= keys[i + 1][0]) i++;
	const a = keys[i], b = keys[i + 1], u = ease(seg(tau, a[0], b[0]));
	return {zoom: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), F: [lerp(a[2][0], b[2][0], u), lerp(a[2][1], b[2][1], u)] as [number, number], S: [lerp(a[3][0], b[3][0], u), lerp(a[3][1], b[3][1], u)] as [number, number]}; };

/* beacons: [layer f, base, amp, seed, screen x at cam 0, scale, order in the chain (null = burning from the start)] */
const bx0 = (xStop: number, f: number) => xStop + CAM_STOP * f;      // place a beacon by its screen x once he has stopped
const BEACONS: [number, number, number, number, number, number, number | null][] = [
	[0.07, 650, 90, 9, 1480, 1.0, null],
	[0.07, 650, 90, 9, bx0(1010, 0.07), 0.92, 0],
	[0.04, 600, 120, 4, bx0(780, 0.04), 0.8, 1],
	[0.04, 600, 120, 4, bx0(545, 0.04), 0.76, 2],
	[0.02, 560, 90, 2, bx0(345, 0.02), 0.64, 3],
	[0.02, 560, 90, 2, bx0(150, 0.02), 0.6, 4],
];
/** a hand for the close-ups: palm, four fingers and a thumb, smaller than the figure's mitt (which is masked out) */
const CuHand: React.FC<{w: [number, number]; e: [number, number]; h: number; col: string; curl?: number}> = ({w, e, h, col, curl = 0.25}) => {
	const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; let nx = -uy, ny = ux; if (ny > 0) { nx = -nx; ny = -ny; }   // n: the thumb side, toward screen-up
	const P = (a: number, b: number): [number, number] => [w[0] + (ux * a + nx * b) * h, w[1] + (uy * a + ny * b) * h], f = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
	const palm = `M${f(P(-0.004, 0.012))} L${f(P(0.03, 0.014))} L${f(P(0.032, -0.012))} L${f(P(-0.004, -0.012))} Z`;
	const fingers = [0.0095, 0.0032, -0.0032, -0.0095].map((b, j) => { const L = [0.021, 0.024, 0.022, 0.017][j], c = curl * (0.6 + 0.2 * j), a = Math.cos(c), s2 = Math.sin(c);
		const d: [number, number] = [a, -s2 * 0.9]; const p0 = P(0.03, b), p1 = P(0.03 + d[0] * L * 0.55, b + d[1] * L * 0.55), p2 = P(0.03 + d[0] * L * 0.9, b + d[1] * L * 1.25);
		return <path key={j} d={`M${f(p0)} Q${f(p1)} ${f(p2)}`} stroke={col} strokeWidth={0.0062 * h} strokeLinecap="round" fill="none" />; });
	return <g><path d={palm} fill={col} />{fingers}<path d={`M${f(P(0.006, 0.01))} Q${f(P(0.016, 0.022))} ${f(P(0.027, 0.022))}`} stroke={col} strokeWidth={0.0075 * h} strokeLinecap="round" fill="none" /></g>;
};

export const DU3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const cam = walked(tau);
	const stopK = sm(seg(tau, T.stopA, T.stopB)), kneelK = sm(seg(tau, T.kneelA, T.kneelB));
	const lookK = sm(seg(tau, T.stopB - 0.2, T.stopB + 0.5)) * (1 - sm(seg(tau, T.kneelA - 0.3, T.kneelA + 0.2)));
	/* --- the sheet --- */
	const tableX = TABLE_X - cam, tableTop = GY - TOP;
	const fs = lerp(0.36, 0.9, ease(seg(tau, T.kneelB - 0.5, T.char0 + 0.2)));     // the camera rises over the table
	const sheetC: [number, number] = [tableX + 52, tableTop + 2];
	const chars = Array.from({length: 10}, (_, i) => { const t0 = (i < 5 ? T.char0 + i * T.charStep : T.col2 + (i - 5) * T.charStep); return easeOut(seg(tau, t0, t0 + T.charStep * 0.9)); });
	const fold1 = seg(tau, T.foldA, T.foldA + 0.6), fold2 = seg(tau, T.foldB, T.foldB + 0.6), band = seg(tau, T.band, T.bandEnd);
	const sheetW = (lx: number, ly: number): [number, number] => [sheetC[0] + lx * PS, sheetC[1] + ly * PS * fs];
	/* --- Du Fu --- */
	let pose = tau < T.kneelA ? mixPose(walkToStand('08_04', tau, stopK), POSES.lookUp, lookK) : POSES.stand;
	// writing: the brush tip follows the character being written; between strokes it lifts a little
	let brushTip: [number, number] | null = null;
	if (tau >= T.kneelA) {
		let tip = sheetW(COLX[0], ROW0 - 10), lift = 18;
		const cur = chars.findIndex((k) => k < 1);
		if (tau >= T.char0 - 0.3 && tau < T.foldA - 0.3 && cur >= 0) { const c = Math.floor(cur / 5), i = cur % 5, k = chars[cur]; tip = sheetW(COLX[c] + Math.sin(k * 9) * 3, ROW0 - 9 + i * ROWD + k * 18); lift = k > 0 && k < 1 ? 0 : 8; }
		brushTip = [tip[0], tip[1] - lift];
		let hand: [number, number] = [brushTip[0] - 4, brushTip[1] - 30];
		let leftHand: [number, number] = sheetW(-48, 30);
		// after the poem: the brush is laid on the table; the hands fold the sheet, slip the band on, and go back to the lap
		const lap: [number, number] = [DX + 0.2 * DH, GY - 0.24 * DH], lapK = sm(seg(tau, T.bandEnd, T.bandEnd + 0.7));
		if (tau >= T.foldA - 0.5) {
			brushTip = null;
			const r = 1 - 2 * sm(fold1), l = 1 - 2 * sm(fold2);
			const rh0 = sheetW(25 + 50 * r, 4), lh0 = sheetW(-25 - 50 * l, 4), bandP = sheetW(lerp(20, 0, band), lerp(-60, -6, band));
			hand = tau < T.foldA ? sheetW(70, 6) : tau < T.band ? rh0 : bandP;
			leftHand = tau < T.foldB ? sheetW(-50, 6) : tau < T.band ? lh0 : sheetW(-20, 30);
			hand = [lerp(hand[0], lap[0] + 10, lapK), lerp(hand[1], lap[1], lapK)]; leftHand = [lerp(leftHand[0], lap[0], lapK), lerp(leftHand[1], lap[1] + 6, lapK)];
		}
		const R = ik(KB, toBody(hand)), L = ik(KB, toBody(leftHand));
		const writePose = fkPose({...KB, la: L.a, le: L.e, ra: R.a, re: R.e});
		pose = mixPose(mixPose(POSES.stand, KNEEL, kneelK), writePose, sm(seg(tau, T.kneelB - 0.3, T.kneelB + 0.3)));
		if (tau < T.kneelB) brushTip = null;
	}
	const rh = jointAt(pose, 'RHand', DX, GY, DH);
	/* --- camera --- */
	const b0 = BEACONS[0], b0x = b0[4] - cam * b0[0], b0y = ridgeY(cam, b0[0], b0[1], b0[2], b0[3])(b0x), b0s = b0[5];
	const fireBase: [number, number] = [b0x, b0y - 112 * b0s - 6 * b0s], blazeS = 0.36 * b0s;
	const z0 = SHANG_END.zoom * SHANG_END.blazeS / blazeS;
	const focus0: [number, number] = [fireBase[0] + SHANG_END.dx / SHANG_END.blazeS * blazeS, fireBase[1] + SHANG_END.dy / SHANG_END.blazeS * blazeS];
	const pk = sheetW(0, 0);
	const keys: Key[] = [
		[0, z0, focus0, [W / 2, H / 2]],
		[T.pullEnd, 1.0, focus0, focus0],                                // the flame glides from the centre to its place; ends at identity
		[T.stopA, 1.04, [900, 560], [920, 560]],
		[T.craneB, 1.38, [705, 530], [960, 590]],                        // (with craneY) the ridges and the chain of fires fill the frame
		[T.craneDownA, 1.46, [700, 530], [960, 590]],
		[T.char0 - 0.05, 6.6, sheetW(30, -2), [1010, 480]],              // down and in to the sheet
		[T.DQe, 7.4, sheetW(28, 0), [1000, 480]],
		[T.foldA + 0.2, 5.4, sheetW(0, 0), [980, 500]],                  // a little back to see the hands fold it
		[T.push, 5.8, pk, [960, 520]],
		[T.end, 15.5, pk, [W / 2, H / 2]],                                // the sealed packet fills the frame
	];
	const c = camAt(tau, keys);
	const dAmt = cl((tau - 2.6) / 1.2) * (1 - 0.6 * seg(tau, T.char0, T.char0 + 1));
	const dpx = dAmt * (6 * Math.sin(t * 0.37) + 3 * Math.sin(t * 0.91 + 1)), dpy = dAmt * (4 * Math.sin(t * 0.29 + 2) + 2 * Math.sin(t * 1.13));
	const CT = camT(c.zoom, c.F[0], c.F[1], c.S[0] - c.F[0] + dpx, c.S[1] - c.F[1] + dpy);
	const far = c.zoom < 45;                // skip the heavy layers while we are deep inside the flame
	const tint = SHANG_END.tint * (1 - seg(tau, 0, 0.7));
	const lit = (L: number | null) => L === null ? 1 : easeOut(seg(tau, T.beacon0 + L * T.beaconStep, T.beacon0 + L * T.beaconStep + 0.5));
	const breachX = DX + 330 + CAM_STOP * 0.25, gateX = 1500;
	const craneY = 300 * sm(seg(tau, T.craneA, T.craneB)) * (1 - sm(seg(tau, T.craneDownA, T.craneDownB)));
	const cy = (v: number) => `translate(0,${(craneY * v).toFixed(2)})`;
	/* close-up hands: over the table the figure's mitts are masked and drawn as hands */
	const handInfo = (['R', 'L'] as const).map((sd) => ({w: jointAt(pose, `${sd}Hand`, DX, GY, DH), e: jointAt(pose, `${sd}Elb`, DX, GY, DH)}));
	const cuHands = handInfo.filter((hi) => tau >= T.kneelB - 0.15 && hi.w[0] > DX + 0.27 * DH && hi.w[1] < GY - 0.1 * DH);
	return <g>
		<defs>
			<filter id="duBlurS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" /></filter>
			<filter id="duFg" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
			<linearGradient id="duSkyTint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1d3a" stopOpacity="0.55" /><stop offset="0.6" stopColor="#6e3346" stopOpacity="0.12" /><stop offset="1" stopColor="#f0a868" stopOpacity="0" /></linearGradient>
			<clipPath id="duWallClip"><rect x={-200} y={0} width={W + 400} height={H} /></clipPath>
		</defs>
		<rect width={W} height={H} fill="#2a1d3a" />
		<g transform={CT}>
			{far && <g>
				<g transform={cy(0.02)}><image href={staticFile('ep41/du_sky.webp')} x={-64} y={-150} width={2048} height={1152} preserveAspectRatio="none" />
				<rect x={-300} y={-300} width={W + 600} height={1000} fill="url(#duSkyTint)" /></g>
				{/* far hills, each ridge with its own 烽燧 */}
				<g transform={cy(0.05)}><Layer cam={cam} f={0.02} base={560} amp={90} seed={2} col="#8a4652" />
				{BEACONS.filter((b) => b[0] === 0.02).map((b, i) => { const x = b[4] - cam * b[0]; return <Beacon key={'a' + i} x={x} gy={ridgeY(cam, b[0], b[1], b[2], b[3])(x)} s={b[5]} col="#8a4652" lit={lit(b[6])} t={t} seed={20 + i} />; })}
				</g>
				<rect x={-300} y={520} width={W + 600} height={200} fill="#c8604a" opacity={0.08} />
				<g transform={cy(0.08)}><Layer cam={cam} f={0.04} base={600} amp={120} seed={4} col="#7a3a46" />
				{BEACONS.filter((b) => b[0] === 0.04).map((b, i) => { const x = b[4] - cam * b[0]; return <Beacon key={'b' + i} x={x} gy={ridgeY(cam, b[0], b[1], b[2], b[3])(x)} s={b[5]} col="#7a3a46" lit={lit(b[6])} t={t} seed={30 + i} />; })}
				</g>
				<g transform={cy(0.12)}><Layer cam={cam} f={0.07} base={650} amp={90} seed={9} col="#6e3646" />
				{BEACONS.filter((b) => b[0] === 0.07).map((b, i) => { const x = b[4] - cam * b[0]; return <Beacon key={'c' + i} x={x} gy={ridgeY(cam, b[0], b[1], b[2], b[3])(x)} s={b[5]} col="#6e3646" lit={lit(b[6])} t={t} seed={i === 0 ? SHANG_END.seed : 40 + i} lean={i === 0 ? SHANG_END.lean : -0.25} />; })}
				</g>
				{/* the city: pagoda and halls on their own ground */}
				<g transform={cy(0.18)}><Layer cam={cam} f={0.1} base={712} amp={26} seed={11} col="#5e2c3e" period={520} pad={500} item={(x, gy, i) => i === 2 ? <Pagoda x={x} gy={gy} s={1.25} col="#5e2c3e" /> : i % 2 ? <TangHall x={x} gy={gy} w={150 + 30 * rnd(i, 2)} col="#5e2c3e" burned={i === 3 ? 1 : 0} t={t} tau={tau} seed={i} /> : null} />
				</g>
				<g transform={cy(0.28)}><Layer cam={cam} f={0.18} base={760} amp={10} seed={12} col="#522638" period={430} pad={400} item={(x, gy, i) => (i % 3 === 1) ? <TangHall x={x} gy={gy} w={190} col="#522638" burned={i % 2} t={t} tau={tau + i} seed={i + 9} /> : null} />
				</g>
				{/* rammed-earth ward wall with a gate tower and a breach */}
				<g transform={cy(0.4)}><WardWall cam={cam} f={0.25} gy={800} col="#4a2433" breachX={breachX} gateX={gateX} t={t} tau={tau} />
				<rect x={-300} y={798} width={W + 600} height={400} fill="#4a2433" />
				{/* crows lifting from a burned roof */}
				{tau > T.crows && tau < T.crows + 4 && Array.from({length: 8}, (_, i) => { const u = tau - T.crows - rnd(i, 1) * 0.4; if (u < 0) return null; const x = 1240 - cam * 0.18 + 30 * rnd(i, 2) - u * (90 + 60 * rnd(i, 3)), y = 640 - u * (70 + 40 * rnd(i, 4)) + Math.sin(u * 3 + i) * 10, fl = Math.sin(t * 22 + i * 2) * 5;
					return <path key={i} d={`M${x - 9},${y + fl} Q${x - 4},${y - 2} ${x},${y + 2} Q${x + 4},${y - 2} ${x + 9},${y + fl}`} stroke="#1d0f16" strokeWidth={2.4} fill="none" />; })}
				</g>
				<g transform={cy(0.65)}><Layer cam={cam} f={0.55} base={846} amp={10} seed={14} col="#2a141e" period={380} pad={400} item={(x, gy, i) => i % 4 === 0 ? <Apricot x={x} gy={gy} h={300 + 40 * rnd(i, 3)} col="#2a141e" t={t} seed={i} /> : i % 4 === 2 ? <g><path d={`M${x - 70},${gy + 4} L${x - 64},${gy - 52} L${x - 30},${gy - 58} L${x - 18},${gy - 36} L${x + 10},${gy - 44} L${x + 30},${gy + 4} Z`} fill="#2a141e" /><Grass x={x + 50} gy={gy} h={90} col="#2a141e" t={t} seed={i} /></g> : <Grass x={x} gy={gy} h={70 + 40 * rnd(i, 5)} col="#2a141e" t={t} seed={i + 3} n={12} />} />
				</g>
				<g transform={cy(1)}>
				{/* the near ground: overgrown grass, the low table */}
				<path d={`M-300,${H + 400} L-300,${GY - 4} L${W + 300},${GY - 4} L${W + 300},${H + 400} Z`} fill="#1d0f16" />
				{Array.from({length: 24}, (_, i) => { const x = ((i * 157 - cam) % 2200 + 2200) % 2200 - 140; if (x > tableX - 40 && x < tableX + TW + 60) return null; return <Grass key={i} x={x} gy={GY} h={46 + 40 * rnd(i, 2)} col="#1d0f16" t={t} seed={i + 50} n={7} />; })}
				{/* the low table (案): top with a little visible depth, splayed legs standing on the ground */}
				<g>
					<path d={`M${tableX + 8},${GY + 2} L${tableX + 18},${tableTop + 4} M${tableX + TW - 8},${GY + 2} L${tableX + TW - 18},${tableTop + 4}`} stroke="#140a0f" strokeWidth={7} strokeLinecap="round" />
					<path d={`M${tableX},${tableTop + 6} L${tableX + 6},${tableTop - 30 * fs} L${tableX + TW - 6},${tableTop - 30 * fs} L${tableX + TW},${tableTop + 6} Z`} fill={mixC('#1e0f15', '#3a2028', sm(seg(tau, T.kneelA + 0.2, T.char0 - 0.1)))} />
					<rect x={tableX - 2} y={tableTop + 4} width={TW + 4} height={7} fill="#140a0f" />
				</g>
				</g>
			</g>}
			{/* the first beacon's flame on top (kept while we are inside it) */}
			{!far && <g><Glow x={fireBase[0]} y={fireBase[1] - 20 * b0s} r={150 * b0s} c="#ff8a3a" o={0.6} id="duB0g" /><Blaze x={fireBase[0]} y={fireBase[1]} s={blazeS} t={t} lean={SHANG_END.lean} seed={SHANG_END.seed} /></g>}
			{far && <g transform={cy(1)}>
				<Sheet x={sheetC[0]} y={sheetC[1]} fs={fs} chars={chars} fold1={fold1} fold2={fold2} band={band} dim={1 - sm(seg(tau, T.kneelA + 0.2, T.char0 - 0.1))} />
				{cuHands.length > 0 && <mask id="duHandMask" maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={12000} height={12000}><rect x={-4000} y={-4000} width={12000} height={12000} fill="#fff" />
					{cuHands.map((hi, i) => { const l = Math.hypot(hi.w[0] - hi.e[0], hi.w[1] - hi.e[1]) || 1; return <circle key={i} cx={hi.w[0] + (hi.w[0] - hi.e[0]) / l * 0.04 * DH} cy={hi.w[1] + (hi.w[1] - hi.e[1]) / l * 0.04 * DH} r={0.033 * DH} fill="#000" />; })}</mask>}
				<g mask={cuHands.length > 0 ? 'url(#duHandMask)' : undefined}><Rimmed x={DX} ground={GY} h={DH} pose={pose} look={look} col="#120810" rim="#ffcf9a" rimOp={0.18} rimDx={-2} rimDy={-1.4} T={tau} lag={tau < T.stopB ? gaitPose('08_04', (tau - 0.05) / CYCLE) : undefined} /></g>
				{tau >= T.foldA - 0.5 && <line x1={tableX + 120} y1={tableTop - 4} x2={tableX + 160} y2={tableTop - 8} stroke="#2a1a12" strokeWidth={2.4} strokeLinecap="round" />}
				{/* the brush, held in the fingers */}
				{brushTip && (() => { const hi = handInfo[0], l = Math.hypot(hi.w[0] - hi.e[0], hi.w[1] - hi.e[1]) || 1, g0: [number, number] = [hi.w[0] + (hi.w[0] - hi.e[0]) / l * 0.03 * DH, hi.w[1] + (hi.w[1] - hi.e[1]) / l * 0.03 * DH - 10];
					return <g><line x1={g0[0]} y1={g0[1]} x2={brushTip[0]} y2={brushTip[1]} stroke="#2a1a12" strokeWidth={2.4} strokeLinecap="round" /><path d={`M${brushTip[0] - 2},${brushTip[1] - 7} L${brushTip[0]},${brushTip[1]} L${brushTip[0] + 2},${brushTip[1] - 7} Z`} fill="#0e0a08" /></g>; })()}
				{cuHands.map((hi, i) => <CuHand key={i} w={hi.w} e={hi.e} h={DH} col="#120810" curl={brushTip && i === 0 ? 0.9 : 0.22} />)}
			</g>}
			{/* falling blossom */}
			{far && <g transform={cy(0.8)}>{Array.from({length: 46}, (_, i) => { const t0 = rnd(i, 7) * 9, u = (((tau - t0) / 6) % 1 + 1) % 1, x = ((rnd(i, 8) * 2400 + u * 260 + Math.sin(u * 9 + i) * 30 - cam * 0.7) % 2400 + 2400) % 2400 - 240, y = 120 + u * 860;
				return <ellipse key={i} cx={x} cy={y} rx={4.5} ry={2.6} fill={i % 3 ? '#f4a6b8' : '#fbd0da'} opacity={0.85 * Math.sin(Math.PI * u)} transform={`rotate(${u * 340 + i * 23} ${x} ${y})`} />; })}</g>}
			{/* foreground grass, blurred */}
			{far && <g filter="url(#duFg)" transform={cy(1.3)}>{Array.from({length: 14}, (_, i) => { const x = ((i * 190 - cam * 1.6) % 2660 + 2660) % 2660 - 370, hh = 80 + 70 * rnd(i, 3), sw = Math.sin(t * 1.2 + i) * 0.1 * hh;
				return <path key={i} d={`M${x - 16},${H + 60} Q${x},${H - hh * 0.5} ${x + sw},${H - hh} Q${x + 8},${H - hh * 0.5} ${x + 16},${H + 60} Z`} fill="#0c0508" />; })}</g>}
		</g>
		{tint > 0 && <rect width={W} height={H} fill="#ff9b2e" opacity={tint} />}
	</g>;
};
