import React from 'react';
import {D, BT, BEAT} from './lines59';
import {W, H, rnd, seg, lerp, sm, eo, ei, f1, Glow, Sky, Cam, CamT, Par} from './bg59';
import {Walker, walkG, walkTo, STAGE, PZ, fkPose, mixPose, withArms, nod, Rim, Pose, Look59, BRISK, GAIT, PackProp} from './figure59';
import {Earth, Space, routeAt, headingAt, satPt, SatView, PUNTA} from './globe59';
import {useFonts59} from './skin59';
import {trap, CAL_OUT} from './demo59';
/* ep59 part 1, bars 20½–34 (film 34.7 → 58.1 s): the chase north over the Andes and the dive into the Darién; the swamp; the cell in
   Panama; the chase up through the Americas (under the real photo); Alaska; the sea ice; the pull-up from the ice to the strait and the
   dive into the Russian night. Every scene takes film time t. Hits sit on beats; walking, water, snow and light keep their own clocks. */
type P2 = [number, number];
/** monotone cubic through keys [t, v] (flat at both ends): smooth speed, no overshoot */
export const pchip = (ks: [number, number][]) => {
	const n = ks.length, x = ks.map((k) => k[0]), y = ks.map((k) => k[1]), h: number[] = [], d: number[] = [], m: number[] = new Array(n).fill(0);
	for (let i = 0; i < n - 1; i++) { h[i] = x[i + 1] - x[i]; d[i] = (y[i + 1] - y[i]) / h[i]; }
	for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] > 0) { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); } }
	return (t: number) => { if (t <= x[0]) return y[0]; if (t >= x[n - 1]) return y[n - 1]; let i = 0; while (t > x[i + 1]) i++;
		const s = (t - x[i]) / h[i], s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * h[i] * m[i + 1]; };
};
const pulse = (t: number, hits: number[], k = 9) => hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * k) : 0), 0);

/* ====================== the chase south → north (bar 20½ → 22): the gold line races up the Andes, the camera riding behind its head,
   tilted over the curve of the Earth; at the Darién it dives through the clouds into the canopy ====================== */
export const CH_S0 = CAL_OUT + 0.42, CH_DIVE = D(21) + 0.85;
export const pSouth = (t: number) => 0.2149 * trap(seg(t, CH_S0, CH_DIVE + 0.4), 0.25);
export const southView = (t: number): SatView => {
	const p = pSouth(t), c = routeAt(p), hd = headingAt(Math.min(p, 0.16), 0.12), kd = seg(t, CH_DIVE, D(22) + 0.02);
	const cruise = lerp(1.4, 1.15, sm(seg(t, CH_S0, CH_S0 + 0.8)));
	return {lon: c[0], lat: c[1], alt: Math.exp(lerp(Math.log(cruise), Math.log(0.0009), Math.pow(kd, 1.7))), tilt: 26 * (1 - sm(seg(kd, 0, 0.6))), roll: hd, cx: 960, cy: lerp(720, 540, sm(seg(kd, 0, 0.5)))};
};
/** clouds seen from above, rushing outward as the camera drops through them */
const CloudBurst: React.FC<{u: number; col?: string}> = ({u, col = '#eef2f6'}) => { if (u <= 0 || u >= 1) return null;
	return <g>{Array.from({length: 20}, (_, i) => { const a = rnd(i, 1) * Math.PI * 2, r = (180 + 520 * rnd(i, 2)) * Math.exp(3 * u), s = (0.6 + 0.8 * rnd(i, 3)) * Math.exp(2.4 * u);
		return <ellipse key={i} cx={f1(960 + Math.cos(a) * r)} cy={f1(540 + Math.sin(a) * r * 0.8)} rx={f1(170 * s)} ry={f1(110 * s)} fill={col} opacity={0.7 * Math.sin(Math.PI * u)} />; })}
		<rect x={0} y={0} width={W} height={H} fill={col} opacity={0.55 * Math.sin(Math.PI * u) ** 2} /></g>; };
/** the jungle canopy from above (tree crowns, a brown river, mist), zooming in at the end of the dive */
const CROWNS = Array.from({length: 170}, (_, i) => ({x: (rnd(i, 11) - 0.5) * 3200, y: (rnd(i, 12) - 0.5) * 2100, r: 46 + 80 * rnd(i, 13), c: ['#1c3a24', '#24482c', '#2e5634', '#1a3220', '#335c36'][i % 5]}));
const Canopy: React.FC<{k: number; o: number}> = ({k, o}) => { const s = Math.exp(lerp(Math.log(0.32), Math.log(4.2), Math.pow(k, 1.3)));
	return <g opacity={o} transform={`translate(960,540) scale(${s.toFixed(4)}) rotate(${f1(-10 + 8 * k)})`}>
		<rect x={-1800} y={-1300} width={3600} height={2600} fill="#0e2214" />
		<path d="M-1800,420 C-1100,300 -700,620 -200,380 S600,80 1000,260 S1600,520 1800,300" stroke="#3a3a26" strokeWidth={70} fill="none" opacity={0.9} />
		{CROWNS.map((c, i) => <g key={i}><circle cx={c.x + 10} cy={c.y + 12} r={c.r} fill="#06100a" opacity={0.65} /><circle cx={c.x} cy={c.y} r={c.r} fill={c.c} />
			<circle cx={c.x - c.r * 0.28} cy={c.y - c.r * 0.28} r={c.r * 0.5} fill="#4a7a48" opacity={0.3} /></g>)}
		{Array.from({length: 8}, (_, i) => <ellipse key={i} cx={(rnd(i, 21) - 0.5) * 3000} cy={(rnd(i, 22) - 0.5) * 1800} rx={300} ry={90} fill="#dfe8e0" opacity={0.12} />)}
	</g>; };
export const ChaseSouth: React.FC<{t: number}> = ({t}) => {
	const v = southView(t), p = pSouth(t), kd = seg(t, CH_DIVE, D(22));
	const white = 1 - sm(seg(t, CH_S0, CH_S0 + 0.42)), can = sm(seg(kd, 0.52, 0.74));
	return <g>
		<Space id="cs" drift={(t - CH_S0) * 8} />
		<Earth id="ce" v={v} route={{p0: 0, p1: p, head: p}} pins={[{ll: PUNTA, kind: 'start', o: 1 - sm(kd * 3)}]} clouds={0.9} />
		<CloudBurst u={seg(kd, 0.3, 0.72)} />
		{can > 0 && <Canopy k={seg(kd, 0.52, 1)} o={can} />}
		{white > 0.002 && <rect x={0} y={0} width={W} height={H} fill="#fff0cc" opacity={white} />}
	</g>;
};

/* ====================== the Darién swamp (bars 22–24): waist-deep, the machete on the beats, the camera wading with him ====================== */
const JG = 1080, JH = 560, WATER = JG - 0.6 * JH;
const CHOPS = [BT(22, 2), D(23), BT(23, 2)];
const jungleWalk = (t: number) => walkG(t, D(22) - 1.4, 180, JH, BRISK, 0.55);
const RIM_JUNGLE: Rim[] = [{c: '#d8f0b0', o: 0.55, dx: -2.4, dy: -1.8}, {c: '#7a9a6a', o: 0.3, dx: 2, dy: -1}];
/** the near arm (L) raised and brought down on each chop (blended over the walk) */
const chopPose = (t: number, base: Pose): Pose => {
	for (const c of CHOPS) { if (t > c - 0.34 && t < c + 0.42) {
		const up = sm(seg(t, c - 0.34, c - 0.07)), dn = eo(seg(t, c - 0.07, c + 0.02)), rel = sm(seg(t, c + 0.14, c + 0.42));
		const a = lerp(lerp(30, 168, up), 58, dn), e = lerp(lerp(20, 34, up), 8, dn), wgt = sm(seg(t, c - 0.34, c - 0.2)) * (1 - rel);
		return mixPose(base, withArms(base, [a, e], null), wgt); } }
	return base; };
const frond = (x: number, y: number, a: number, s: number, c: string, k: number) => <g key={k} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(a)}) scale(${f1(s)})`}>
	<path d="M0,0 Q60,-30 140,-16 Q220,-4 300,0 Q220,6 140,20 Q60,34 0,0 Z" fill={c} />
	{Array.from({length: 7}, (_, i) => <path key={i} d={`M${40 + i * 36},${-2} l${18},${-22 - 8 * (i % 2)} l${8},${4} Z M${40 + i * 36},${2} l${18},${22 + 8 * (i % 2)} l${8},${-4} Z`} fill={c} />)}</g>;
export const Jungle: React.FC<{t: number}> = ({t}) => {
	const w = jungleWalk(t), kx = w.x, pose = nod(chopPose(t, w.pose), 6);
	const bob = Math.sin(w.phase * Math.PI * 4) * 4, cam: CamT = {cx: kx + 300, cy: 560 + bob * 0.6, z: 1.0};
	/* the vines he cuts: one hangs ahead of each chop, its lower half drops after the blade passes */
	const vines = CHOPS.map((c, i) => ({c, x: jungleWalk(c).x + 0.36 * JH + 14 * i}));
	const cutY = WATER - 0.5 * JH;
	return <g>
		<Sky id="jgs" stops={[[0, '#16301e'], [0.4, '#3a6a44'], [0.62, '#5e8a5a'], [0.72, '#46704a'], [1, '#24402c']]} x={-200} y={-200} w={2400} h={1500} />
		{/* shafts of light through the canopy (they drift on their own clock) */}
		{Array.from({length: 6}, (_, i) => { const x = ((i * 380 + 140 - (kx - 180) * 0.12 + t * 6) % 2400) - 240;
			return <path key={i} d={`M${f1(x)},-40 L${f1(x + 120)},-40 L${f1(x + 460)},${WATER - 300} L${f1(x + 200)},${WATER - 300} Z`} fill="#eaffc8" opacity={0.1 + 0.04 * Math.sin(t * 1.3 + i)} />; })}
		<Par cam={cam} k={0.25}>
			{Array.from({length: 16}, (_, i) => { const x = -900 + i * 260 + 60 * rnd(i, 1), w0 = 26 + 20 * rnd(i, 2);
				return <g key={i} fill="#3a5e42"><rect x={x} y={-300} width={w0} height={1100} /><ellipse cx={x + w0 / 2} cy={-160 + 60 * rnd(i, 3)} rx={190} ry={120} /></g>; })}
			<rect x={-2000} y={WATER - 160} width={7000} height={260} fill="#9ab890" opacity={0.25} />
		</Par>
		<Par cam={cam} k={0.55}>
			{Array.from({length: 14}, (_, i) => { const x = -700 + i * 330 + 90 * rnd(i, 5), w0 = 50 + 30 * rnd(i, 6);
				return <g key={i}><g fill="#1e3a26"><rect x={x} y={-400} width={w0} height={WATER + 400} />
					<path d={`M${x - 70},${WATER + 10} Q${x - 10},${WATER - 130} ${x + 8},${WATER - 280} L${x + w0 - 8},${WATER - 280} Q${x + w0 + 10},${WATER - 130} ${x + w0 + 80},${WATER + 10} Z`} /></g>
					<rect x={x} y={-400} width={7} height={WATER + 360} fill="#8ab878" opacity={0.35} />
					<path d={`M${x + w0 / 2},-300 q${40 * rnd(i, 7)},300 ${-20},${520 + 200 * rnd(i, 8)}`} stroke="#18301e" strokeWidth={7} fill="none" />
					{frond(x + w0, WATER - 220 - 200 * rnd(i, 9), -30 - 40 * rnd(i, 10), 1.3, '#2a5232', i)}{frond(x, WATER - 120 - 160 * rnd(i, 11), 200 + 30 * rnd(i, 12), 1.1, '#24482c', i + 50)}</g>; })}
		</Par>
		<Cam {...cam}>
			<rect x={-2000} y={WATER} width={8000} height={900} fill="#22382a" />
			{vines.map((v, i) => { const cut = seg(t, v.c, v.c + 0.7);
				return <g key={i} stroke="#0e2014" strokeWidth={11} fill="none" strokeLinecap="round">
					<path d={`M${f1(v.x)},-260 Q${f1(v.x + 30)},${f1((cutY - 260) / 2)} ${f1(v.x)},${f1(cutY)}`} />
					<g transform={`translate(${f1(30 * cut)},${f1(560 * ei(cut))}) rotate(${f1(40 * cut)} ${f1(v.x)} ${f1(cutY)})`} opacity={1 - sm(seg(cut, 0.6, 1))}>
						<path d={`M${f1(v.x)},${f1(cutY)} Q${f1(v.x - 30)},${f1(cutY + 140)} ${f1(v.x + 6)},${f1(WATER + 30)}`} />
						<path d={`M${f1(v.x)},${f1(cutY + 70)} q-50,-8 -76,30 M${f1(v.x)},${f1(cutY + 160)} q50,-6 70,28`} strokeWidth={7} /></g></g>; })}
			<Walker x={kx} ground={JG} h={JH} pose={pose} look={STAGE.kJungle} rims={RIM_JUNGLE} machete col="#0b0d0c" />
			{/* the water over his legs: murky, a bright line and rings where he breaks the surface; reflections of the light */}
			<rect x={-2000} y={WATER} width={8000} height={600} fill="#1a2e20" opacity={0.92} />
			<path d={`M-2000,${WATER} H6000`} stroke="#c8e0b0" strokeWidth={3} opacity={0.55} />
			{Array.from({length: 16}, (_, i) => <path key={i} d={`M${f1(kx - 1200 + i * 170 + 40 * Math.sin(t * 2 + i))},${WATER + 30 + 26 * (i % 4)} h${60 + 50 * rnd(i, 3)}`} stroke="#a8c898" strokeWidth={2} opacity={0.2} />)}
			{Array.from({length: 4}, (_, i) => { const u = ((t * 1.1 + i / 4) % 1); return <ellipse key={i} cx={kx + 10} cy={WATER + 2} rx={60 + 260 * u} ry={7 + 18 * u} fill="none" stroke="#c8e0b0" strokeWidth={2.5} opacity={0.55 * (1 - u)} />; })}
			{CHOPS.map((c, i) => { const u = seg(t, c, c + 0.35); return u > 0 && u < 1 ? <g key={i}>{Array.from({length: 8}, (_, j) => <path key={j} d={`M0,0 l14,-5 l-3,10 Z`} transform={`translate(${f1(vines[i].x + (j - 3.5) * 22 * u * 3)},${f1(cutY - 90 * Math.sin(Math.PI * u) * (0.5 + rnd(j, i)) + 40 * u)}) rotate(${f1(200 * u * (j % 2 ? 1 : -1))})`} fill="#4a7a44" opacity={1 - u} />)}</g> : null; })}
		</Cam>
		{/* fronds sliding past the lens, top and bottom corners only */}
		<Par cam={cam} k={1.5}>
			{Array.from({length: 7}, (_, i) => { const x = -300 + i * 700 + 200 * rnd(i, 9), top = i % 2 === 0, y = top ? -70 - 40 * rnd(i, 10) : 1120 + 40 * rnd(i, 10), a = top ? 30 + 20 * rnd(i, 11) : -40 - 20 * rnd(i, 11);
				return frond(x, y, a, 1.6 + 0.4 * rnd(i, 12), '#06100a', 100 + i); })}
		</Par>
	</g>;
};

/* ====================== the cell, Panama, 2001 (bars 24–26): a push through the bars; 18 marks scratched on the wall; the sun's patch
   crosses the floor again and again; on bar 26 the barred door slides open and the light floods in ====================== */
const SEAT = fkPose({hip: 0.385, lean: 24, neck: 34, lt: 86, lk: 92, rt: 80, rk: 98, la: 36, le: 74, ra: 30, re: 80});
const MARK_T = (k: number) => BT(24, 2.6) + (k - 1) / 17 * (BT(25, 3.1) - BT(24, 2.6));
export const Jail: React.FC<{t: number}> = ({t}) => {
	const u = seg(t, D(24) - 0.25, D(26));
	const cam: CamT = {cx: lerp(1000, 1360, sm(u)), cy: lerp(560, 470, sm(u)), z: Math.exp(lerp(Math.log(0.94), Math.log(1.42), trap(u, 0.3)))};
	const day = (t - D(24)) / 0.62, sunX = lerp(160, 1820, ((day % 1) + 1) % 1), sunO = Math.sin(Math.PI * (((day % 1) + 1) % 1));
	const door = eo(seg(t, D(26) - 0.36, D(26) + 0.05)), flood = sm(seg(t, D(26) - 0.3, D(26) - 0.02));
	const breath = Math.sin(t * 1.4) * 1.5;
	return <g>
		<Cam {...cam}>
			<defs><linearGradient id="jw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2e36" /><stop offset="0.7" stopColor="#3a3f48" /><stop offset="1" stopColor="#2e323a" /></linearGradient></defs>
			<rect x={-600} y={-400} width={3200} height={1230} fill="url(#jw)" />
			{Array.from({length: 30}, (_, i) => <rect key={i} x={-600 + rnd(i, 1) * 3200} y={-300 + rnd(i, 2) * 1100} width={40 + 120 * rnd(i, 3)} height={3} fill="#1e2128" opacity={0.4} />)}
			<rect x={-600} y={820} width={3200} height={600} fill="#1f2228" />
			{/* the high window, its bars, the shaft of sun and the patch it throws, sweeping the floor as the days pass */}
			<rect x={380} y={170} width={190} height={150} fill="#d8e4ec" opacity={0.85} />
			{[0, 1, 2, 3].map((i) => <rect key={i} x={404 + i * 44} y={170} width={10} height={150} fill="#16181c" />)}
			<path d={`M380,320 L570,320 L${f1(sunX + 220)},880 L${f1(sunX - 60)},880 Z`} fill="#ffe8b8" opacity={0.1 * sunO} />
			<ellipse cx={sunX + 80} cy={880} rx={180} ry={30} fill="#ffe0a8" opacity={0.22 * sunO} />
			{/* the bench, his pack in the corner, him on the bench, head down */}
			<rect x={760} y={706} width={440} height={22} fill="#4a4036" /><rect x={780} y={728} width={18} height={92} fill="#2e2822" /><rect x={1162} y={728} width={18} height={92} fill="#2e2822" />
			<PackProp x={1330} y={762} h={330} a={-8} />
			<Walker x={930} ground={820 + breath * 0} h={360} pose={nod(SEAT, 2 + breath)} look={{...STAGE.kJungle, pack: 'none'}} rims={[{c: '#c8d4e0', o: 0.35, dx: -2, dy: -1.6}]} col="#0d0e10" />
			{/* the tally: 18 marks scratched in groups of five, each appearing with a fleck of dust */}
			{Array.from({length: 18}, (_, i) => { const k = i + 1, tk = MARK_T(k), g = Math.floor(i / 5), j = i % 5, a = seg(t, tk, tk + 0.07); if (a <= 0) return null;
				const x0 = 1440 + g * 92 + j * 15, diag = j === 4;
				const p0: P2 = diag ? [x0 - 66, 452] : [x0, 382 + 6 * rnd(i, 1)], p1: P2 = diag ? [x0 + 6, 386] : [x0 + 3 * (rnd(i, 2) - 0.5), 452 + 6 * rnd(i, 3)];
				return <g key={i}><path d={`M${f1(p0[0])},${f1(p0[1])} L${f1(lerp(p0[0], p1[0], a))},${f1(lerp(p0[1], p1[1], a))}`} stroke="#d8d0c0" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
					{t - tk < 0.3 && <circle cx={p1[0]} cy={p1[1]} r={4 + 18 * seg(t, tk, tk + 0.3)} fill="#cfc6b6" opacity={0.4 * (1 - seg(t, tk, tk + 0.3))} />}</g>; })}
		</Cam>
		{/* the cell bars in front of the lens; the door (the middle bars) slides away on bar 26 */}
		<Par cam={cam} k={1.4}>
			{Array.from({length: 10}, (_, i) => { const isDoor = i >= 4 && i <= 6, x = -300 + i * 270 + (isDoor ? 900 * door : 0);
				return <g key={i}><rect x={x} y={-600} width={36} height={2400} fill="#08090b" /><rect x={x} y={-600} width={6} height={2400} fill="#6a7080" opacity={0.5} /></g>; })}
			<rect x={-400} y={40} width={2800} height={26} fill="#08090b" /><rect x={-400} y={980} width={2800} height={26} fill="#08090b" />
		</Par>
		{flood > 0 && <rect x={0} y={0} width={W} height={H} fill="#fff6e4" opacity={0.95 * flood} />}
	</g>;
};

/* ====================== the Americas (bars 26–28): under the real photo, the gold line runs on north; when the photo flies off the camera is
   riding its head up through the US and Canada to Alaska (the names type as it passes), then drops into the white of the Arctic ====================== */
export const pNorth = pchip([[D(26) - 0.1, 0.228], [D(27), 0.352], [BT(27, 1.5), 0.41], [BT(27, 3.0), 0.474], [D(28) - 0.6, 0.481]]);
export const northView = (t: number): SatView => {
	const p = pNorth(t), c = routeAt(p), hd = headingAt(Math.min(0.48, p), 0.12), kd = seg(t, D(28) - 0.62, D(28) + 0.06);
	return {lon: c[0], lat: c[1], alt: Math.exp(lerp(Math.log(1.0), Math.log(0.004), Math.pow(kd, 1.5))), tilt: 24 * (1 - kd), roll: hd, cx: 960, cy: lerp(720, 540, sm(kd))};
};
export const ChaseNorth: React.FC<{t: number}> = ({t}) => {
	const v = northView(t), p = pNorth(t), white = sm(seg(t, D(28) - 0.34, D(28) - 0.02));
	return <g>
		<Space id="cn" drift={(t - D(26)) * 8} />
		<Earth id="cne" v={v} route={{p0: 0, p1: p, head: p}} clouds={0.9} />
		<CloudBurst u={seg(t, D(28) - 0.42, D(28) + 0.02)} />
		{white > 0 && <rect x={0} y={0} width={W} height={H} fill="#eef3f7" opacity={white} />}
	</g>;
};

/* ====================== Alaska, March 2006 (bars 28–30): out of the white, a low angle on the shore; he walks to the edge of the land and
   stops on beat 3; the camera rises over his shoulder to the frozen sea running to the horizon ====================== */
const AG = 930, AH = 430, A_STOP = BT(28, 2), A_X1 = 1060;
const RIM_ARC: Rim[] = [{c: '#ffe6cc', o: 0.6, dx: 2.4, dy: -1.6}, {c: '#a8bcd8', o: 0.3, dx: -2, dy: -1.2}];
const iceRidges = (y0: number, y1: number, n: number, seed: number) => Array.from({length: n}, (_, i) => { const u = i / (n - 1), y = lerp(y0, y1, u ** 1.6), x0 = -1200 + 400 * rnd(i, seed);
	let d = `M${f1(x0)},${f1(y)}`; for (let k = 0; k < 26; k++) d += ` L${f1(x0 + k * 220 + 60 * rnd(k + i * 30, seed + 1))},${f1(y - (2 + 10 * u) * (k % 2 ? 1 : 0.2) * (0.5 + rnd(k, i + seed)))}`;
	return {d, w: 1 + 3 * u, y}; });
const A_RIDGES = iceRidges(640, 900, 12, 3);
export const Alaska: React.FC<{t: number}> = ({t}) => {
	const w = walkTo(t, D(28) - 1.5, A_STOP, A_X1 - 560, A_X1, AH, PZ.stand), u = seg(t, D(28), D(30));
	const pose = w.moving ? w.pose : nod(mixPose(PZ.stand, PZ.lookUp, 0.25 * sm(seg(t, A_STOP + 0.2, A_STOP + 0.8))), Math.sin(t * 1.2));
	const rise = sm(seg(t, A_STOP - 0.1, D(30))), cam: CamT = {cx: lerp(860, 1200, sm(u)), cy: lerp(700, 600, rise), z: Math.exp(lerp(Math.log(1.0), Math.log(1.16), u))};
	const whiteIn = 1 - sm(seg(t, D(28) - 0.02, D(28) + 0.32));
	return <g>
		<Sky id="aks" stops={[[0, '#56688a'], [0.45, '#97a8c0'], [0.62, '#d6d8dc'], [0.68, '#f2dccc']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.05}><Glow x={1560} y={600} r={420} c="#fff0dc" o={0.55} id="aksun" /><circle cx={1560} cy={600} r={34} fill="#fff8ee" /></Par>
		<Par cam={cam} k={0.35}>
			<rect x={-2000} y={640} width={7000} height={800} fill="#dfe7ee" />
			{A_RIDGES.map((r, i) => <path key={i} d={r.d} stroke="#9fb2c6" strokeWidth={r.w} fill="none" opacity={0.75} />)}
			<rect x={-2000} y={636} width={7000} height={6} fill="#f6f2ee" opacity={0.8} />
		</Par>
		<Cam {...cam}>
			{/* the shore: a snow ridge ending in a drop to the ice; a few marker stakes; blowing snow */}
			<path d={`M-800,1400 L-800,${AG - 30} Q0,${AG - 60} 600,${AG - 12} Q1000,${AG + 6} 1240,${AG} Q1300,${AG + 4} 1330,${AG + 60} L1380,1400 Z`} fill="#c6d0da" />
			<path d={`M-800,${AG - 30} Q0,${AG - 60} 600,${AG - 12} Q1000,${AG + 6} 1240,${AG}`} stroke="#f4f6f8" strokeWidth={5} fill="none" opacity={0.9} />
			{[200, 520].map((x, i) => <rect key={i} x={x} y={AG - 150 - 20 * i} width={8} height={160} fill="#2a2a30" />)}
			{Array.from({length: 14}, (_, i) => { const x = 1300 + i * 130 + 60 * rnd(i, 21), s0 = 50 + 70 * rnd(i, 22), y = AG + 40 + 30 * rnd(i, 23);
				return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(s0 * 0.3)},${f1(-s0)} l${f1(s0 * 0.8)},${f1(-s0 * 0.25)} l${f1(s0 * 0.5)},${f1(s0 * 1.25)} Z`} fill={i % 2 ? '#e6edf3' : '#b8c6d4'} />; })}
			<Walker x={w.x} ground={AG} h={AH} pose={pose} look={STAGE.kIce} rims={RIM_ARC} sled={w.moving ? 0.25 + 0.2 * Math.sin(t * 8) : 0} poles col="#160a0b" />
			{Array.from({length: 40}, (_, i) => { const x = ((rnd(i, 1) * 3000 - t * (700 + 300 * rnd(i, 2))) % 3000 + 3000) % 3000 - 800, y = 620 + rnd(i, 3) * 420;
				return <path key={i} d={`M${f1(x)},${f1(y)} h${f1(40 + 50 * rnd(i, 4))}`} stroke="#ffffff" strokeWidth={2} opacity={0.35} />; })}
		</Cam>
		{whiteIn > 0 && <rect x={0} y={0} width={W} height={H} fill="#eef3f7" opacity={whiteIn} />}
	</g>;
};

/* ====================== the sea ice (bars 30–32): two of them hauling their sleds across the pack ice under a low sun (the real photo lands
   on bar 31); the sleds jolt over the ridges on the beats ====================== */
const IG = 870, IH = 270;
const DIMITRI: Look59 = {...STAGE.kIce, paint: {body: '#0e1420', coat: '#1a2740', gear: '#4e4a44'}};
const RIM_ICE: Rim[] = [{c: '#ffd8b0', o: 0.65, dx: 2.6, dy: -1.4}, {c: '#b0c4e0', o: 0.3, dx: -2, dy: -1.4}];
const I_RIDGES = iceRidges(560, 760, 10, 9);
export const Ice: React.FC<{t: number}> = ({t}) => {
	const kw = walkG(t, D(30) - 3, 200, IH, GAIT, 1), dw = walkG(t - 0.4, D(30) - 3, -260, IH, GAIT, 1);
	const beats = Array.from({length: 12}, (_, i) => BT(29, i)), bump = Math.min(1, pulse(t, beats, 7));
	const cam: CamT = {cx: kw.x + 60, cy: 540, z: 1.0};
	return <g>
		<Sky id="ics" stops={[[0, '#3e4c6a'], [0.45, '#8c90a8'], [0.6, '#e2b8a8'], [0.66, '#f8d8b4']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.04}><Glow x={1380} y={560} r={520} c="#ffd8a8" o={0.6} id="icsun" /><circle cx={1380} cy={560} r={30} fill="#fff4e0" /></Par>
		<Par cam={cam} k={0.25}>
			<rect x={-2000} y={560} width={7000} height={800} fill="#d6dee8" />
			{I_RIDGES.map((r, i) => <path key={i} d={r.d} stroke="#a2b0c4" strokeWidth={r.w} fill="none" opacity={0.7} />)}
			<path d="M-2000,566 H5000" stroke="#ffe8d0" strokeWidth={4} opacity={0.5} />
		</Par>
		<Par cam={cam} k={0.6}>
			{/* an open lead of black water with floes in it, and a pressure ridge of tumbled blocks */}
			<path d="M-1600,744 Q-600,722 400,748 T2400,736 T4400,750 L4400,786 Q3400,770 2400,782 T400,792 T-1600,780 Z" fill="#1e2a38" />
			{Array.from({length: 26}, (_, i) => { const x = -1500 + i * 230 + 90 * rnd(i, 1), s = 30 + 50 * rnd(i, 2), y = 690 + 30 * rnd(i, 3);
				return <path key={i} d={`M${x},${y} l${f1(s * 0.4)},${f1(-s)} l${f1(s * 0.9)},${f1(-s * 0.2)} l${f1(s * 0.5)},${f1(s * 1.2)} Z`} fill={i % 2 ? '#e8eef4' : '#c4d0dc'} />; })}
		</Par>
		<Cam {...cam}>
			<rect x={-2000} y={IG - 20} width={8000} height={700} fill="#e4eaf0" />
			<path d={`M-2000,${IG - 20} ${Array.from({length: 40}, (_, i) => `L${-2000 + i * 200},${IG - 20 - 14 * rnd(i, 7)}`).join(' ')} L6000,${IG - 20}`} stroke="#ffffff" strokeWidth={4} fill="none" />
			<Walker x={dw.x} ground={IG} h={IH * 0.97} pose={dw.pose} look={DIMITRI} rims={RIM_ICE} sled={0.3 * bump} poles col="#0c0e14" />
			<Walker x={kw.x} ground={IG} h={IH} pose={kw.pose} look={STAGE.kIce} rims={RIM_ICE} sled={0.3 * bump} poles col="#160a0b" />
		</Cam>
		<Par cam={cam} k={1.4}>
			{Array.from({length: 12}, (_, i) => { const x = -800 + i * 420 + 120 * rnd(i, 4), s = 90 + 90 * rnd(i, 5);
				return <path key={i} d={`M${x},1100 l${f1(s * 0.3)},${f1(-s)} l${f1(s * 0.7)},${f1(-s * 0.3)} l${f1(s * 0.6)},${f1(s * 1.3)} Z`} fill={i % 2 ? '#b8c4d2' : '#9eacbe'} />; })}
		</Par>
	</g>;
};

/* ====================== the pull-up (bars 32–34): from straight above the two of them on the ice the camera climbs out to the strait — the gold
   line steps from America over to Asia — then drops into the night on the Russian shore ====================== */
const FLOES = Array.from({length: 70}, (_, i) => { const cx = (rnd(i, 1) - 0.5) * 4200, cy = (rnd(i, 2) - 0.5) * 2800, r = 110 + 160 * rnd(i, 3), n = 6 + Math.floor(rnd(i, 4) * 3);
	return {d: 'M' + Array.from({length: n}, (_, k) => { const a = k / n * Math.PI * 2 + 0.3 * rnd(k, i), rr = r * (0.7 + 0.35 * rnd(k + 7, i)); return `${f1(cx + Math.cos(a) * rr)},${f1(cy + Math.sin(a) * rr)}`; }).join(' L') + ' Z', c: ['#e8eef4', '#dfe6ee', '#f1f4f8', '#d4dde8'][i % 4]}; });
/** the ice from straight above: floes, a lead of black water, two small figures with their sleds and long shadows */
const IceTop: React.FC<{t: number; s: number; o: number}> = ({t, s, o}) => { const mv = (t - D(32)) * 26;
	const fig = (x: number, y: number, body: string, k: number) => <g key={k} transform={`translate(${f1(x)},${f1(y)})`}>
		<path d="M-6,0 L-120,-70 L-110,-58 L4,10 Z" fill="#7a8aa0" opacity={0.45} />
		<rect x={-112} y={-14} width={64} height={28} rx={10} fill="#5c1a18" /><path d="M-48,0 L-14,0" stroke="#1a1414" strokeWidth={3} />
		<ellipse cx={0} cy={0} rx={16} ry={12} fill={body} /><circle cx={4} cy={0} r={8} fill="#2a2222" /></g>;
	return <g opacity={o} transform={`translate(960,540) scale(${s.toFixed(4)})`}>
		<rect x={-2400} y={-1600} width={4800} height={3200} fill="#aebccc" />
		{FLOES.map((f, i) => <path key={i} d={f.d} fill={f.c} stroke="#9aaabe" strokeWidth={6} />)}
		<path d="M-2400,260 C-1400,160 -900,420 -200,300 S900,120 1400,260 S2100,420 2400,300 L2400,380 C2100,480 1500,340 1000,420 S-300,420 -800,470 S-1800,300 -2400,360 Z" fill="#1a2634" />
		{fig(mv - 40, -20, '#7a1c1a', 0)}{fig(mv - 300, 40, '#1c2a44', 1)}
	</g>; };
export const STRAIT: P2 = [-169.0, 65.9];
/** the frozen Bering Sea and the Chukchi Sea in March (soft white over the ocean, under the land) */
const SEA_ICE: {c: P2; r: number}[] = Array.from({length: 22}, (_, i) => ({c: [-178 + 18 * rnd(i, 41), 61 + 10 * rnd(i, 42)] as P2, r: 1.2 + 1.6 * rnd(i, 43)}));
const pStrait = pchip([[D(32) - 0.2, 0.5085], [D(33) + 0.3, 0.5137], [BT(33, 2), 0.5142]]);
export const pullView = (t: number): SatView => {
	const k = seg(t, D(32) + 0.45, D(33) + 0.55), dv = seg(t, BT(33, 2), D(34)), p = pStrait(t), c = routeAt(p), hd = headingAt(0.512, 0.02), end = routeAt(0.5142);
	let alt = Math.exp(lerp(Math.log(0.02), Math.log(0.3), trap(k, 0.3))), lon = lerp(c[0], STRAIT[0], 0.6), lat = lerp(c[1], STRAIT[1], 0.6);
	/* the drop into the night: the nadir settles on the shore first, then the camera falls (no slide at low altitude) */
	if (dv > 0) { const ks = sm(seg(dv, 0, 0.45)); lon = lerp(lon, end[0], ks); lat = lerp(lat, end[1], ks); alt = Math.exp(lerp(Math.log(alt), Math.log(0.02), Math.pow(seg(dv, 0.15, 1), 1.4))); }
	return {lon, lat, alt, tilt: 22 * sm(seg(t, D(32) + 0.6, D(33))) * (1 - 0.5 * dv), roll: hd - 90, cx: 960, cy: 560};
};
export const PullUp: React.FC<{t: number}> = ({t}) => {
	useFonts59('美洲亚洲');
	const s = Math.exp(lerp(Math.log(1.6), Math.log(0.05), ei(seg(t, D(32) - 0.12, D(32) + 1.0)) * 0.55 + seg(t, D(32) - 0.12, D(32) + 1.0) * 0.45));
	const topO = 1 - sm(seg(t, D(32) + 0.5, D(32) + 0.95)), v = pullView(t), p = pStrait(t), dv = seg(t, BT(33, 2), D(34));
	const night = 0.92 * sm(seg(dv, 0.15, 0.9)), lab = sm(seg(t, D(33) - 0.1, D(33) + 0.2)) * (1 - sm(seg(dv, 0, 0.4)));
	const am = satPt(v, [-160, 64.6]), as = satPt(v, [-176, 66.8]);
	const lbl = (q: [number, number] | null, s1: string) => q ? <text x={q[0]} y={q[1]} textAnchor="middle" opacity={lab} style={{fontFamily: "'LXGW WenKai','Noto Serif CJK SC',serif", fontWeight: 700, fontSize: 46, letterSpacing: '0.2em'}}
		fill="#FFF4E2" stroke="rgba(8,8,12,0.75)" strokeWidth={7} paintOrder="stroke">{s1}</text> : null;
	return <g>
		<Space id="pu" />
		<Earth id="pue" v={v} route={{p0: 0, p1: p, head: p}} night={night} clouds={0.6} ice={SEA_ICE} />
		{lbl(am, '美洲')}{lbl(as, '亚洲')}
		{topO > 0.002 && <IceTop t={t} s={s} o={topO} />}
		<CloudBurst u={seg(t, D(32) + 0.15, D(32) + 0.75)} col="#f2f5f8" />
		{dv > 0.75 && <rect x={0} y={0} width={W} height={H} fill="#020306" opacity={sm(seg(dv, 0.75, 1))} />}
	</g>;
};
void BEAT; void eo;
