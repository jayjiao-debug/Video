import React from 'react';
import {Stage, Layer, Shape, Particles, Mist, FogBand, Glow, SkyGrad, Sun, Cam, INF, useGround, useFog, P, W, H, f1, lerp, rnd, noise1, fbm, ridge, spline, poly, mix, cl, sm, wrap} from './kit3';
import {bareTreeD, tuftD} from './props3';
import {Fig, IceRidge, IceCols, travel, travelStop, jolt, pulse, KAI, ridgeY} from './act2_kit';
import {Cart, FK, poseJoints, pushCartAxle, Karl as KarlRig} from './act2_karl';
import {useFonts59} from '../qq59/skin59';

/* ep59 v3 · act 2 · ashore: the arrest (night, a searchlight, two guards, hands up, a van door shuts), the long forced stops (his
   cart parked at a stake while the seasons cycle on the beats and the obstacles drift past), and the return: spring, he pulls the stake
   on the DROP and walks on. */

/* ===================================================== arrest =====================================================
   A. (beats 0–5) Night on the Chukotka shore. A searchlight on a pole above the border post sweeps the ice and finds the two of them on
      beat 1; on beat 2 they raise their hands; two guards walk down from the post, rifles slung on their backs (never aimed).
   B. (beats 5–8) Closer on the guards' van: the doorway glows; on beat 6 the door slides shut with a jolt; only a small window stays lit. */
const AB = {focus: 2.7, hz: 600, K: 700};
const agY = (D: number) => AB.hz + AB.K / D;
const SNOWN: IceCols = {lit: '#7d8db8', shade: '#1b2244', cap: '#aebce0'};
const HANDS_DOWN: FK = {lean: 1.5, neck: -4, lt: 1.5, lk: 2, rt: -3, rk: 3, la: -3, le: 9, ra: 3, re: 13};
const HANDS_UP: FK = {lean: -1, neck: -8, lt: 2, lk: 3, rt: -4, rk: 4, la: 118, le: 52, ra: 108, re: 60};
const lerpFK = (a: FK, b: FK, u: number): FK => { const o: Record<string, number> = {}; for (const k of Object.keys(b) as (keyof FK)[]) o[k] = lerp(a[k] ?? 0, b[k] ?? 0, u); return o as FK; };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);

const NightShoreSky: React.FC<{t: number}> = ({t}) => <>
	<SkyGrad y0={0} y1={H} stops={[[0, '#03050c'], [0.4, '#0a1226'], [0.54, '#1a2442'], [0.5555, '#24304f'], [0.556, '#151d36'], [1, '#202c4e']]} />
	<g fill="#e8eeff">{Array.from({length: 110}, (_, i) => { const x = rnd(i, 1) * W, y = Math.pow(rnd(i, 2), 1.3) * 560, r = 0.6 + Math.pow(rnd(i, 3), 3) * 1.6;
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={r.toFixed(2)} opacity={((0.3 + 0.7 * rnd(i, 5)) * (0.6 + 0.4 * Math.sin(t * 2 + i)) * (1 - y / 700)).toFixed(3)} />; })}</g>
	<Glow x={1500} y={AB.hz} r={900} ry={90} c="#3a4c7a" o={0.6} />
</>;
/** the searchlight beam from the lamp (lx, ly) to the ground point (gx, gy): a long soft cone and the pool of light where it lands */
const Searchlight: React.FC<{lx: number; ly: number; gx: number; gy: number; w: number; o?: number}> = ({lx, ly, gx, gy, w, o = 1}) => {
	const dx = gx - lx, dy = gy - ly, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
	return <g opacity={o}>
		<defs><linearGradient id="a2sl" gradientUnits="userSpaceOnUse" x1={lx} y1={ly} x2={gx} y2={gy}><stop offset="0" stopColor="#f4f8ff" stopOpacity="0.75" /><stop offset="0.6" stopColor="#d6e4ff" stopOpacity="0.28" /><stop offset="1" stopColor="#d6e4ff" stopOpacity="0.16" /></linearGradient></defs>
		{[1, 0.6, 0.3].map((k, i) => <path key={i} d={poly([[lx + nx * 6 * k, ly + ny * 6 * k], [gx + nx * w * k, gy + ny * w * k * 0.4], [gx - nx * w * k, gy - ny * w * k * 0.4], [lx - nx * 6 * k, ly - ny * 6 * k]])} fill="url(#a2sl)" opacity={0.45} />)}
		<Glow x={gx} y={gy} r={w * 1.25} ry={w * 0.3} c="#dfe9ff" o={0.85} />
		<Glow x={lx} y={ly} r={70} c="#f4f8ff" o={1} /><circle cx={lx} cy={ly} r={9} fill="#ffffff" />
	</g>; };
/** the post on the bluff: a pole with the lamp, a hut with a lit window */
const Post: React.FC<{lx: number; ly: number; base: number; aim: number}> = ({lx, ly, base, aim}) => {
	const fog = useFog();
	return <g>
		<path d={poly([[lx - 7, base], [lx + 7, base], [lx + 4, ly + 10], [lx - 4, ly + 10]])} fill={fog('#0b0e18')} />
		<path d={`M${lx - 46},${base} L${lx},${ly + 120} L${lx + 46},${base}`} stroke={fog('#0b0e18')} strokeWidth={5} fill="none" />
		<g transform={`rotate(${aim.toFixed(1)} ${lx} ${ly})`}><rect x={lx - 22} y={ly - 15} width={44} height={30} rx={6} fill={fog('#121624')} /><rect x={lx - 30} y={ly - 13} width={10} height={26} rx={3} fill="#e8f0ff" /></g>
		<path d={poly([[lx + 60, base], [lx + 60, base - 70], [lx + 120, base - 105], [lx + 180, base - 70], [lx + 180, base]])} fill={fog('#0d111c')} />
		<rect x={lx + 102} y={base - 62} width={22} height={18} fill="#FFC24A" opacity={0.9} /><Glow x={lx + 113} y={base - 53} r={60} c="#ffc24a" o={0.4} />
	</g>; };

/** the guards' van (a boxy UAZ "loaf"), side on, facing right; (x, y) = ground under its middle; L = length; door 0 = open … 1 = shut */
const Van: React.FC<{x: number; y: number; L: number; door: number; inside?: React.ReactNode; rim?: string; facing?: 1 | -1}> = ({x, y, L, door, inside, rim = '#9fb6e6', facing = 1}) => {
	const h = L * 0.5, x0 = x - L / 2, x1 = x + L / 2, wy = y - L * 0.09, R = L * 0.085;
	const body = spline([[x0, wy], [x0 - L * 0.01, y - h * 0.55], [x0 + L * 0.03, y - h * 0.95], [x0 + L * 0.2, y - h * 1.02], [x1 - L * 0.22, y - h * 1.02], [x1 - L * 0.08, y - h * 0.95], [x1 + L * 0.005, y - h * 0.6], [x1 + L * 0.01, wy], [x1 - L * 0.05, wy + L * 0.02], [x0 + L * 0.05, wy + L * 0.02]], true);
	const dX0 = x0 + L * 0.33, dX1 = x0 + L * 0.62, dTop = y - h * 0.92, dBot = wy - L * 0.005;
	const shut = eo(door), slide = (1 - shut) * (dX1 - dX0 + L * 0.02);
	const win = (a: number, b: number) => <rect x={a} y={y - h * 0.86} width={b - a} height={h * 0.26} rx={L * 0.012} fill="#0a0d16" />;
	return <g transform={facing === -1 ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}>
		<ellipse cx={x} cy={y + 4} rx={L * 0.55} ry={L * 0.03} fill="#000" opacity={0.5} />
		<path d={body} fill="#262b24" />
		<path d={body} fill="none" stroke={rim} strokeWidth={2.5} opacity={0.5} />
		{win(x0 + L * 0.05, x0 + L * 0.29)}{win(x0 + L * 0.66, x0 + L * 0.8)}
		{/* windscreen */}
		<path d={poly([[x1 - L * 0.16, y - h * 0.9], [x1 - L * 0.06, y - h * 0.88], [x1 - L * 0.01, y - h * 0.62], [x1 - L * 0.14, y - h * 0.62]])} fill="#141a2a" />
		{/* the doorway: warm light and the two of them inside */}
		<rect x={dX0} y={dTop} width={dX1 - dX0} height={dBot - dTop} fill="#ffcf88" />
		<g clipPath="url(#a2vandoor)">{inside}</g>
		<defs><clipPath id="a2vandoor"><rect x={dX0} y={dTop} width={dX1 - dX0} height={dBot - dTop} /></clipPath></defs>
		<Glow x={(dX0 + dX1) / 2} y={dBot} r={L * 0.45} ry={L * 0.08} c="#ffbf70" o={0.55 * (1 - shut)} />
		{/* the sliding door */}
		<g transform={`translate(${f1(slide)},0)`}><rect x={dX0 - 2} y={dTop - 3} width={dX1 - dX0 + 4} height={dBot - dTop + 4} rx={4} fill="#2c3229" stroke="#151912" strokeWidth={3} />
			<rect x={dX0 + (dX1 - dX0) * 0.15} y={dTop + h * 0.06} width={(dX1 - dX0) * 0.7} height={h * 0.22} rx={L * 0.01} fill={mix('#0a0d16', '#ffcf88', 0.7 * sm((door - 0.9) * 10))} />
			<rect x={dX0 + 8} y={(dTop + dBot) / 2} width={L * 0.03} height={6} fill="#5a5f58" /></g>
		{/* wheels, lights */}
		{[x0 + L * 0.2, x1 - L * 0.2].map((wx, i) => <g key={i}><circle cx={wx} cy={y - R} r={R} fill="#0b0c10" /><circle cx={wx} cy={y - R} r={R * 0.45} fill="#2a2d33" /></g>)}
		<circle cx={x1 - L * 0.005} cy={y - h * 0.45} r={L * 0.022} fill="#fff4d8" /><Glow x={x1 + L * 0.02} y={y - h * 0.45} r={L * 0.2} c="#ffe8b8" o={0.9} />
		<path d={poly([[x1, y - h * 0.45 - 4], [x1 + L * 2.2, y - h * 0.2 - L * 0.12], [x1 + L * 2.2, y + L * 0.12], [x1, y - h * 0.45 + 4]])} fill="#ffe8b8" opacity={0.07} />
		<rect x={x0 - 3} y={y - h * 0.5} width={7} height={h * 0.12} fill="#ff3a2a" /><Glow x={x0} y={y - h * 0.44} r={L * 0.07} c="#ff3a2a" o={0.6} />
	</g>; };

export const ArrestShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	const cutB = 4 * beat;
	if (t < cutB) {
		const e = sm(cl(t / cutB)), hit = beat, up = eo((t - 2 * beat) / 0.32);
		const lamp: P = [1460, 330];
		const sweep = sm((t + 0.25) / (hit + 0.25)), gx = lerp(1700, 860, sweep), gy = lerp(1000, agY(2.7) + 10, sweep);
		const cam: Cam = {x: lerp(-20, 40, e), y: lerp(0, -20, e), z: lerp(0, 0.18, e), zoom: 1, roll: 0};
		const guard = (t0: number, x0: number, D: number, key: string) => { const tt = t - t0; const tr = travel('walk', Math.max(0, tt), 250 * AB.focus / D, 1.05, 1.05, 0, 1, key === 'a' ? 0 : 0.5);
			return <Fig key={key} x={x0 - tr.dx} y={agY(D)} h={250 * AB.focus / D} depth={D} attire="guard" action="walk" phase={tr.phase} facing={-1} rim="#cfe0ff" rimO={0.95} lightDir={45} />; };
		const hand = (x: number, D: number, key: string) => <Fig key={key} x={x} y={agY(D)} h={250 * AB.focus / D} depth={D} attire="ice" action="pose" phase={t / 3} fk={lerpFK(HANDS_DOWN, HANDS_UP, up)} hands={['open', 'open']} breath={0.4}
			rim="#e4ecff" rimO={0.95} lightDir={20} shadow={{k: 0.5, skew: 2.2, o: 0.6 * sweep, c: '#05070e', blur: 2}} />;
		return <Stage t={t} cam={cam} atm={{haze: '#1a2442', density: 0.04, focus: AB.focus, aperture: 1.4, rim: '#cfe0ff', lightDir: 40, grain: 0.07, vignette: 0.6, pp: [960, AB.hz]}} bg="#05070e">
			<Layer D={INF}><NightShoreSky t={t} /></Layer>
			<Layer D={40}><path d={ridgeY(-900, 2900, agY(40), (x) => 26 + fbm(x, 420, 30, 3) + (x > 900 ? (x - 900) * 0.05 : 0), agY(40) + 4)} fill="#141c34" /></Layer>
			<Layer D={9}><path d={ridgeY(-900, 2900, agY(9), (x) => (x > 1000 ? 20 + Math.min(x - 1000, 700) * 0.16 + fbm(x, 200, 14, 5) : -10), agY(9) + 4)} fill="#10162c" /><path d={ridgeY(-900, 2900, agY(9) - 2, (x) => (x > 1000 ? 20 + Math.min(x - 1000, 700) * 0.16 + fbm(x, 200, 14, 5) : -10), agY(9) + 40)} fill="none" stroke="#5a6c9c" strokeWidth={2} opacity={0.6} />
				<Post lx={lamp[0]} ly={lamp[1]} base={agY(9) - 20 - Math.min(lamp[0] - 1000, 700) * 0.16 + 6} aim={(Math.atan2(gy - lamp[1], gx - lamp[0]) * 180 / Math.PI) - 180} />
				</Layer>
			<Layer D={6.5}><Van x={1240} y={agY(6.5)} L={330} door={0} facing={-1} /></Layer>
			<Layer D={INF}><rect x={-1000} y={AB.hz} width={W + 2000} height={H} fill="#1c2646" opacity={0.6} /></Layer>
			<Layer D={6}><IceRidge x0={-900} x1={900} y={agY(6)} hmin={8} hmax={40} seed={4} cols={SNOWN} /></Layer>
			<Layer D={INF}><Searchlight lx={lamp[0]} ly={lamp[1]} gx={gx} gy={gy} w={210} /></Layer>
			{guard(1.3 * beat, 1520, 3.0, 'b')}
			{hand(640, 3.2, 'd')}
			{guard(1.3 * beat - 0.2, 1450, 2.55, 'a')}
			{hand(860, 2.7, 'k')}
			<Particles kind="snow" n={70} seed={7} D={[1, 8]} c="#dfe8ff" o={0.55} wind={-80} size={0.7} />
			<Layer D={1.4}><IceRidge x0={-700} x1={380} y={agY(1.4)} hmin={40} hmax={170} seed={13} cols={SNOWN} rows={3} /></Layer>
			{t < 0.2 && <rect width={W} height={H} fill="#000" opacity={0} />}
		</Stage>;
	}
	// B: the van, closer
	const tb = t - cutB, slam = 6 * beat - cutB, door = cl((tb - slam + 0.3) / 0.3);
	const [jx, jy] = jolt(t, 6 * beat, 9, 4), e = sm(cl(tb / (dur - cutB)));
	const cam: Cam = {x: lerp(0, 50, e) + jx, y: jy, z: lerp(0, 0.16, e), zoom: 1, roll: 0};
	// inside the lit doorway: the two of them seated, hoods up (head and shoulders)
	const inside = <g>{[[875, '#3a1414'], [1035, '#2e1012']].map(([px0, c], i) => { const px = Number(px0), base = agY(2.7) - 105, hy = base - 175 + i * 8;
		return <g key={i} fill={String(c)}><path d={`M${px - 72},${base} Q${px - 70},${hy + 48} ${px - 30},${hy + 34} L${px + 30},${hy + 34} Q${px + 70},${hy + 48} ${px + 72},${base} Z`} />
			<path d={`M${px - 38},${hy + 40} Q${px - 44},${hy - 34} ${px + 2},${hy - 40} Q${px + 44},${hy - 34} ${px + 38},${hy + 40} Z`} /><ellipse cx={px + 14} cy={hy + 6} rx={16} ry={22} fill="#1a0c0c" /></g>; })}</g>;
	return <Stage t={t} cam={cam} atm={{haze: '#1a2442', density: 0.04, focus: AB.focus, aperture: 1.4, rim: '#cfe0ff', lightDir: 40, grain: 0.07, vignette: 0.62, pp: [960, AB.hz]}} bg="#05070e">
		<Layer D={INF}><NightShoreSky t={t} /><Searchlight lx={1820} ly={250} gx={lerp(300, 120, e)} gy={AB.hz + 20} w={120} o={0.5} /></Layer>
		<Layer D={30}><path d={ridgeY(-900, 2900, agY(30), (x) => 40 + fbm(x, 300, 26, 3), agY(30) + 4)} fill="#121a32" /></Layer>
		<Layer D={INF}><rect x={-1000} y={AB.hz} width={W + 2000} height={H} fill="#1a2444" opacity={0.75} /></Layer>
		<Layer D={2.7}><Van x={1000} y={agY(2.7)} L={980} door={door} inside={inside} /></Layer>
		<Fig x={430} y={agY(2.4)} h={300} depth={2.4} attire="guard" action="stand" phase={t / 4.2} facing={1} rim="#cfe0ff" rimO={0.95} lightDir={40} />
		<Particles kind="snow" n={70} seed={8} D={[1, 8]} c="#dfe8ff" o={0.55} wind={-80} size={0.7} />
		{door > 0 && door < 1 && <rect width={W} height={H} fill="#000" opacity={0} />}
	</Stage>;
};

/* ===================================================== the stake: stops + resume =====================================================
   A roadside in the Russian Far East: mountains, a dirt road running off to the right, a larch, his cart parked by a wooden stake with a
   gold ribbon. stops: the seasons flip on the beats (snow → green → gold → …) while the obstacles drift past as small cards; from beat 8
   it is spring, the cards blow away and he walks back in to the stake. resume (the DROP): a low close shot, he wrenches the stake out
   of the thawing ground and lifts it high against the sunrise; then wide, he pushes the cart on up the road and the camera rises. */
const SB = {focus: 2.7, hz: 560, K: 760};
const sgY = (D: number) => SB.hz + SB.K / D;
type Season = {sky: [number, string][]; far: string; farCap: string; hill: string; ground: string; ground2: string; road: string; leaf: string; leafO: number; snow: number; sun: number; glow: string};
const SEASONS: Record<'W' | 'G' | 'A' | 'S', Season> = {
	W: {sky: [[0, '#56688a'], [0.42, '#a3b2c8'], [0.52, '#e4e8ee'], [1, '#d2d9e2']], far: '#9cadc4', farCap: '#f4f6fa', hill: '#c8d2de', ground: '#eef2f6', ground2: '#c2cddc', road: '#d9dfe8', leaf: '#ffffff', leafO: 0, snow: 1, sun: 0, glow: '#eef2f8'},
	G: {sky: [[0, '#2560ae'], [0.42, '#6aa6de'], [0.52, '#d2eaf4'], [1, '#a4c8a2']], far: '#5a7aa2', farCap: '#eef4f8', hill: '#4d7d56', ground: '#7fa648', ground2: '#527a30', road: '#ab9472', leaf: '#3a7a2c', leafO: 1, snow: 0, sun: 0.45, glow: '#fff4d0'},
	A: {sky: [[0, '#463c68'], [0.38, '#c47850'], [0.5, '#f8c682'], [1, '#d89a62']], far: '#8a6a74', farCap: '#f6e2d2', hill: '#a65c2e', ground: '#cc7a28', ground2: '#9a4c1c', road: '#b48a60', leaf: '#f4b02c', leafO: 1, snow: 0, sun: 0.75, glow: '#ffd08a'},
	S: {sky: [[0, '#26315e'], [0.34, '#6a5a86'], [0.46, '#ec9a76'], [0.52, '#ffd9a2'], [1, '#c29884']], far: '#7a7898', farCap: '#f8eae0', hill: '#66795f', ground: '#8e9458', ground2: '#5a6a3e', road: '#9e8870', leaf: '#a8d060', leafO: 0.6, snow: 0.35, sun: 1, glow: '#ffd09a'},
};
const mixSeason = (a: Season, b: Season, u: number): Season => {
	const m = (x: string, y: string) => mix(x, y, u);
	const sky = b.sky.map(([o, c], i) => [o, m(a.sky[Math.min(i, a.sky.length - 1)][1], c)] as [number, string]);
	return {sky, far: m(a.far, b.far), farCap: m(a.farCap, b.farCap), hill: m(a.hill, b.hill), ground: m(a.ground, b.ground), ground2: m(a.ground2, b.ground2), road: m(a.road, b.road), leaf: m(a.leaf, b.leaf), leafO: lerp(a.leafO, b.leafO, u), snow: lerp(a.snow, b.snow, u), sun: lerp(a.sun, b.sun, u), glow: m(a.glow, b.glow)};
};
const SEQ: ('W' | 'G' | 'A' | 'S')[] = ['W', 'G', 'A', 'W', 'G', 'A', 'W', 'G', 'S', 'S', 'S', 'S'];
const seasonAt = (t: number, beat: number): Season => {
	const i = Math.max(0, Math.min(SEQ.length - 1, Math.floor(t / beat))), u = cl((t - i * beat) / 0.08);
	const prev = SEQ[Math.max(0, i - 1)], cur = SEQ[i];
	return i === 0 ? SEASONS[cur] : mixSeason(SEASONS[prev], SEASONS[cur], cur === 'S' ? cl((t - i * beat) / (beat * 0.9)) : u);
};

const ROAD: P[] = [[-600, 1080], [-100, 960], [400, 860], [800, 790], [1150, 712], [1420, 640], [1600, 592], [1720, 568], [1790, SB.hz + 2]];
const Ground: React.FC<{s: Season}> = ({s}) => {
	const g = useGround(SB.hz, SB.K);
	const wid = (y: number) => (y - SB.hz) * 0.42;
	const L = ROAD.map(([x, y]) => [x - wid(y) * 0.3, y - wid(y) * 0.12] as P), R = ROAD.map(([x, y]) => [x + wid(y) * 0.3, y + wid(y) * 0.12] as P);
	const road = poly([...L, ...R.reverse()].map(g));
	const patches: string[] = [];
	for (let i = 0; i < 70; i++) { const y = SB.hz + 4 + Math.pow(rnd(i, 3), 1.8) * 560, d = y - SB.hz, x = -400 + rnd(i, 4) * 2700, w = d * (0.6 + rnd(i, 5) * 1.6);
		patches.push(spline(([[x - w, y], [x - w * 0.3, y - d * 0.03], [x + w, y - d * 0.01], [x + w * 0.2, y + d * 0.04]] as P[]).map(g), true)); }
	return <g>
		<defs><linearGradient id="a2sg" gradientUnits="userSpaceOnUse" x1="0" y1={SB.hz} x2="0" y2={H}><stop offset="0" stopColor={mix(s.ground, s.far, 0.5)} /><stop offset="0.3" stopColor={s.ground} /><stop offset="1" stopColor={s.ground2} /></linearGradient></defs>
		<rect x={-2000} y={SB.hz} width={W + 4000} height={H} fill="url(#a2sg)" />
		<Shape d={patches.join(' ')} fill={s.snow > 0.5 ? '#f6f8fb' : s.ground2} o={0.45} />
		{s.snow > 0.1 && s.snow < 0.6 && <Shape d={patches.slice(0, 40).join(' ')} fill="#f4f6fa" o={0.85} />}
		<path d={road} fill={s.road} />
		<path d={poly([...ROAD.map(([x, y]) => [x - 2, y] as P), ...ROAD.slice().reverse().map(([x, y]) => [x + (y - SB.hz) * 0.03, y + (y - SB.hz) * 0.012] as P)].map(g))} fill={mix(s.road, '#000', 0.18)} opacity={0.5} />
	</g>; };
const Mountains: React.FC<{s: Season; D: number; seed: number; amp: number; base: number}> = ({s, D, seed, amp, base}) => {
	const fog = useFog(), y = sgY(D), fn = (x: number) => base + Math.abs(fbm(x, 520, amp, seed, 4, 0.5)) + amp * 0.3;
	const body = ridgeY(-900, 2900, y, fn, y + 4, 10), frac = lerp(0.32, 1.05, s.snow);
	const line: P[] = []; for (let x = 2900; x >= -900; x -= 20) line.push([x, y - fn(x) * (1 - frac) + noise1(x / 50, seed) * amp * 0.1]);
	const id = `a2mc${seed}`;
	return <g><defs><clipPath id={id}><path d={poly([[-900, -2000], [2900, -2000], ...line])} /></clipPath></defs>
		<path d={body} fill={fog(s.far)} /><g clipPath={`url(#${id})`}><path d={body} fill={fog(s.farCap)} /></g>
		<path d={ridgeY(-900, 2900, y, (x) => fn(x) * 0.35 + amp * 0.05 * noise1(x / 40, seed + 1), y + 4, 10)} fill={fog(mix(s.far, s.hill, 0.5))} opacity={0.5} /></g>; };
/** the larch: bare branches always, needles by season (green / gold / pale spring), snow on the boughs in winter */
const Larch: React.FC<{x: number; y: number; h: number; s: Season; t: number}> = ({x, y, h, s, t}) => {
	const fog = useFog(), br = bareTreeD(x, y, h, 23, {w: h * 0.03, spread: 40, depth: 4, droop: 16, lean: -2});
	const clumps: string[] = [];
	for (let i = 0; i < 150; i++) { const u = rnd(i, 61), yy = y - h * (0.28 + 0.72 * u), spread = h * 0.3 * (1 - u * 0.8), xx = x + (rnd(i, 62) - 0.5) * 2 * spread + Math.sin(t * 1.4 + i) * 2, r = h * (0.012 + 0.016 * rnd(i, 63));
		clumps.push(`M${f1(xx - r * 1.6)},${f1(yy)} a${f1(r * 1.6)},${f1(r)} 0 1,0 ${f1(r * 3.2)},0 a${f1(r * 1.6)},${f1(r)} 0 1,0 ${f1(-r * 3.2)},0 Z`); }
	return <g><Shape d={br.join(' ')} fill={fog('#2a2420')} /><Shape d={clumps.join(' ')} fill={fog(s.leaf)} o={s.leafO} /><Shape d={clumps.slice(0, 70).join(' ')} fill="#f4f6fa" o={cl((s.snow - 0.6) / 0.4) * 0.9} /></g>; };
/** the stake with a gold ribbon (x, ground y, height px, lean deg) — `out` lifts it out of the ground */
const Stake: React.FC<{x: number; y: number; h: number; t: number; wind?: number; snow?: number}> = ({x, y, h, t, wind = 1, snow = 0}) => {
	const w = h * 0.075, top = y - h;
	const rib: P[] = Array.from({length: 9}, (_, i) => { const u = i / 8; return [x + w * 0.4 + u * h * 0.55 * wind, top + h * 0.08 + u * h * 0.12 + Math.sin(t * 7 - u * 5) * h * 0.04 * u] as P; });
	const ribD = spline([...rib.map(([px, py]) => [px, py - h * 0.025 * (1 - 0.4 * rib.indexOf([px, py] as P))] as P), ...rib.slice().reverse().map(([px, py]) => [px, py + h * 0.025] as P)], true);
	return <g>
		<path d={poly([[x - w / 2, y + 2], [x - w / 2, top + w * 0.4], [x - w * 0.2, top], [x + w * 0.3, top + w * 0.2], [x + w / 2, top + w * 0.5], [x + w / 2, y + 2]])} fill="#3a2a1c" />
		<path d={poly([[x + w * 0.1, y + 2], [x + w * 0.1, top + w * 0.5], [x + w / 2, top + w * 0.5], [x + w / 2, y + 2]])} fill="#5a4230" />
		<path d={ribD} fill="#FFC24A" /><circle cx={x} cy={top + h * 0.09} r={w * 0.55} fill="#e0a030" />
		{snow > 0 && <path d={`M${f1(x - w * 0.8)},${f1(top + 2)} Q${f1(x)},${f1(top - w)} ${f1(x + w * 0.8)},${f1(top + 2)} Z`} fill="#f6f8fb" opacity={snow} />}
	</g>; };
/** the obstacle cards */
const CARDS: {txt: string; icon: 'x' | 'ban' | 'down' | 'virus'; x: number; y: number; b: number}[] = [
	{txt: '签证', icon: 'x', x: 1360, y: 300, b: 3}, {txt: '禁止入境', icon: 'ban', x: 1420, y: 425, b: 4}, {txt: '2008 金融危机', icon: 'down', x: 1290, y: 548, b: 5}, {txt: '疫情', icon: 'virus', x: 1460, y: 668, b: 6}];
const Card: React.FC<{c: typeof CARDS[number]; t: number; beat: number; gone: number}> = ({c, t, beat, gone}) => {
	const t0 = c.b * beat, a = t - t0; if (a < 0) return null;
	const pop = a < 0.3 ? 1 - Math.exp(-a * 14) * Math.cos(a * 22) : 1, g = sm(gone), dx = -40 * a - g * 900, dy = -g * 140 + Math.sin(a * 2 + c.b) * 4, rot = (rnd(c.b, 1) - 0.5) * 6 - g * 30;
	const fs = 44, w = 90 + c.txt.length * fs * (c.txt.startsWith('2008') ? 0.62 : 1.02) + 40, hh = 92, red = '#d8382c';
	const icon = c.icon === 'x' ? <g><circle r={26} fill={red} /><path d="M-11,-11 L11,11 M11,-11 L-11,11" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>
		: c.icon === 'ban' ? <g><circle r={24} fill="none" stroke={red} strokeWidth={7} /><path d="M-16,16 L16,-16" stroke={red} strokeWidth={7} strokeLinecap="round" /></g>
		: c.icon === 'down' ? <g><path d="M-26,-18 L-8,0 L4,-10 L22,12" stroke={red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M24,18 L24,2 L8,16 Z" fill={red} /></g>
		: <g><circle r={17} fill={red} />{Array.from({length: 8}, (_, i) => { const an = i / 8 * Math.PI * 2; return <g key={i}><path d={`M${f1(Math.cos(an) * 15)},${f1(Math.sin(an) * 15)} L${f1(Math.cos(an) * 24)},${f1(Math.sin(an) * 24)}`} stroke={red} strokeWidth={4} /><circle cx={Math.cos(an) * 26} cy={Math.sin(an) * 26} r={4.5} fill={red} /></g>; })}</g>;
	return <g transform={`translate(${f1(c.x + dx)},${f1(c.y + dy)}) rotate(${rot.toFixed(1)}) scale(${(0.6 + 0.4 * pop).toFixed(3)})`} opacity={cl(pop * 1.4) * (1 - g)}>
		<rect x={-w / 2 + 6} y={-hh / 2 + 10} width={w} height={hh} rx={18} fill="#000" opacity={0.28} />
		<rect x={-w / 2} y={-hh / 2} width={w} height={hh} rx={18} fill="#FFF4E2" />
		<g transform={`translate(${f1(-w / 2 + 52)},0)`}>{icon}</g>
		<text x={-w / 2 + 96} y={fs * 0.36} style={{fontFamily: KAI, fontWeight: 700, fontSize: fs, letterSpacing: '0.04em'}} fill="#1f1a16">{c.txt}</text>
	</g>; };

/** falling leaves (autumn) / petals of melt (screen space) */
const Leaves: React.FC<{t: number; o: number; c: string}> = ({t, o, c}) => o < 0.01 ? null : <g fill={c} opacity={o}>{Array.from({length: 40}, (_, i) => { const x = wrap(rnd(i, 1) * W - t * 120 + Math.sin(t * 2 + i) * 30, -40, W + 40), y = wrap(rnd(i, 2) * H + t * 160, -40, H + 40), r = 4 + rnd(i, 3) * 6, a = t * 200 * (rnd(i, 4) - 0.5) + i * 40;
	return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={r} ry={r * 0.45} transform={`rotate(${a.toFixed(0)} ${f1(x)} ${f1(y)})`} />; })}</g>;

type StakeView = {t: number; cam: Cam; s: Season; karl?: React.ReactNode; showStake?: boolean; showCart?: boolean; rays?: boolean};
const StakeWorld: React.FC<StakeView> = ({t, cam, s, karl, showStake = true, showCart = true, rays}) => {
	const sunY = lerp(640, 410, s.sun), sunX = 1560;
	return <Stage t={t} cam={cam} atm={{haze: s.glow, density: 0.03, focus: SB.focus, aperture: 1.5, rim: s.sun > 0.5 ? '#ffd9a0' : '#f4f6fa', lightDir: 25, grain: 0.055, vignette: 0.45, pp: [1700, SB.hz]}} bg="#8090a8">
		<Layer D={INF}><SkyGrad y0={0} y1={H} stops={s.sky} />
			{s.sun > 0.05 && <Sun x={sunX} y={sunY} r={30} c="#ffc890" core="#fff6e6" bloom={9} bloomO={0.75 * s.sun} />}
			<Glow x={sunX} y={SB.hz} r={1000} ry={120} c={s.glow} o={0.5} />
			{rays && <g opacity={0.5}>{Array.from({length: 12}, (_, i) => { const a = (-178 + i * 15 + Math.sin(t * 0.4 + i) * 2) * Math.PI / 180, d = 0.035, L = 2200;
				return <path key={i} d={poly([[sunX, sunY], [sunX + Math.cos(a - d) * L, sunY + Math.sin(a - d) * L], [sunX + Math.cos(a + d) * L, sunY + Math.sin(a + d) * L]])} fill="#ffe2b0" opacity={0.1 + 0.08 * rnd(i, 2)} />; })}</g>}</Layer>
		<Layer D={60}><Mountains s={s} D={60} seed={3} amp={130} base={60} /></Layer>
		<Layer D={22}><Mountains s={{...s, far: s.hill, farCap: s.snow > 0.5 ? '#eef2f6' : s.hill}} D={22} seed={8} amp={60} base={20} /></Layer>
		<Layer D={INF}><Ground s={s} /></Layer>
		<Layer D={3.4}><Larch x={1540} y={sgY(3.4)} h={980} s={s} t={t} /></Layer>
		<Layer D={7}><FogBand y={sgY(7) - 20} h={90} o={0.35} c={s.glow} /></Layer>
		{showCart && <Layer D={2.95}><Cart x={1110} y={sgY(2.95)} h={360 * 2.7 / 2.95} kind="winter" rim="#fff2dc" lightDir={25} />
			{s.snow > 0.5 && <path d={spline([[910, sgY(2.95) - 170], [980, sgY(2.95) - 200], [1120, sgY(2.95) - 210], [1230, sgY(2.95) - 190], [1240, sgY(2.95) - 168]], true)} fill="#f6f8fb" opacity={s.snow} />}</Layer>}
		{showStake && <Layer D={2.7}><Stake x={820} y={sgY(2.7)} h={200} t={t} snow={s.snow > 0.5 ? 1 : 0} /></Layer>}
		{karl}
		{s.snow > 0.5 && <Particles kind="snow" n={110} seed={5} D={[0.9, 10]} c="#ffffff" o={0.8} wind={-40} size={0.9} />}
		<Layer D={1.3}><Shape d={tuftD(120, sgY(1.3) + 30, 30, 150, 300, 3, 10) + ' ' + tuftD(1850, sgY(1.3) + 40, 22, 120, 220, 5, -6)} fill={mix(s.ground2, '#000', 0.25)} /></Layer>
	</Stage>; };

export const StopsShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	useFonts59('签证禁止入境2008金融危机疫情');
	const s = seasonAt(t, beat), e = sm(cl(t / dur));
	const cam: Cam = {x: lerp(-60, 40, e), y: lerp(-20, 10, e), z: lerp(0, 0.22, e), zoom: 1, roll: 0};
	const gone = (t - 8 * beat) / (1.5 * beat);
	// he walks back in from the left and stops at the stake (both feet down) on the scene's end
	const h = 360, tIn = dur - 2.2, tr = travelStop('walk', t - tIn, h, 1.25, 1.2, 2.2, 0);
	const kx = 690 - (travelStop('walk', 99, h, 1.25, 1.2, 2.2, 0).dx - tr.dx);
	const karl = t > tIn - 0.1 ? <Fig x={kx} y={sgY(2.62)} h={h * 2.7 / 2.62} depth={2.62} attire="siberia" action="walk" phase={tr.phase} rim="#ffd9a0" lightDir={25} shadow={{k: 0.2, skew: -1.2, o: 0.3, c: '#3a3040', blur: 2}} /> : null;
	return <>
		<StakeWorld t={t} cam={cam} s={s} karl={karl} />
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<Leaves t={t} o={SEQ[Math.floor(t / beat)] === 'A' ? 1 : 0} c="#f0b438" />
			{CARDS.map((c, i) => <Card key={i} c={c} t={t} beat={beat} gone={gone - i * 0.12} />)}
		</svg>
	</>;
};

/* resume */
const CROUCH: FK = {lean: 40, neck: -22, lt: 46, lk: 76, rt: -6, rk: 58, la: 22, le: 8, ra: 16, re: 12};
const RAISE: FK = {lean: -6, neck: -18, lt: 6, lk: 8, rt: -16, rk: 10, la: 172, le: 4, ra: 34, re: 40};
export const ResumeShot: React.FC<{t: number; dur: number; beat: number}> = ({t, dur, beat}) => {
	const cut = 2 * beat, S = SEASONS.S;
	if (t < cut) {
		// shot 1: low and close; he wrenches the stake out and lifts it against the sunrise
		const u = eo((t - 0.02) / 0.24), fk: FK = {...CROUCH}; for (const k of Object.keys(RAISE) as (keyof FK)[]) (fk as Record<string, number>)[k] = lerp(CROUCH[k] ?? 0, RAISE[k] ?? 0, u);
		const x = 860, y = 1010, h = 640, j = poseJoints(fk, x, y, h, t / 3, 0.2), hand = j.LHand, sh = 0.62 * h, top = hand[1] - sh * lerp(0.08, 0.5, u), bot = top + sh;
		const flash = pulse(t, 0, 0.05, 0.6), e = sm(cl(t / cut));
		const clods = Array.from({length: 22}, (_, i) => { const a = t - 0.1; if (a < 0) return null; const vx = (rnd(i, 1) - 0.5) * 900, vy = -500 - rnd(i, 2) * 700, px = x + 0.33 * h + vx * a + (rnd(i, 3) - 0.5) * 30, py = y + vy * a + 1600 * a * a;
			return py < y + 20 ? <circle key={i} cx={f1(px)} cy={f1(py)} r={(3 + rnd(i, 4) * 6).toFixed(1)} fill={i % 3 ? '#3a2a1c' : '#eef2f6'} /> : null; });
		return <svg width={W} height={H} style={{position: 'absolute', inset: 0, background: '#2c3560'}}>
			<defs><linearGradient id="a2rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f2650" /><stop offset="0.42" stopColor="#7a5a7a" /><stop offset="0.62" stopColor="#f39a6a" /><stop offset="0.72" stopColor="#ffdca0" /><stop offset="0.721" stopColor="#6a6a4a" /><stop offset="1" stopColor="#3a3a28" /></linearGradient>
				<radialGradient id="a2rsun"><stop offset="0" stopColor="#fffbf0" /><stop offset="0.12" stopColor="#ffe6b0" stopOpacity="0.95" /><stop offset="0.4" stopColor="#ffb070" stopOpacity="0.35" /><stop offset="1" stopColor="#ff9a5a" stopOpacity="0" /></radialGradient></defs>
			<g transform={`translate(0,${f1(lerp(30, -40, e))})`}>
				<rect x={-50} y={-100} width={W + 100} height={H + 200} fill="url(#a2rs)" />
				{/* sun burst behind him on the drop */}
				<g transform={`rotate(${(t * 8).toFixed(2)} 1240 770)`} opacity={0.35 + 0.4 * flash}>{Array.from({length: 14}, (_, i) => { const a = i / 14 * Math.PI * 2; return <path key={i} d={poly([[1240, 770], [1240 + Math.cos(a - 0.05) * 1500, 770 + Math.sin(a - 0.05) * 1500], [1240 + Math.cos(a + 0.05) * 1500, 770 + Math.sin(a + 0.05) * 1500]])} fill="#ffe2b0" opacity={0.18} />; })}</g>
				<circle cx={1240} cy={770} r={420 + 200 * flash} fill="url(#a2rsun)" />
				<path d={ridgeY(-100, 2100, 778, (xx) => 40 + Math.abs(fbm(xx, 300, 70, 4)), 800)} fill="#6a6488" opacity={0.85} />
				<path d={ridgeY(-100, 2100, 1000, (xx) => 18 + fbm(xx, 160, 14, 9), 1200)} fill="#3e3e2a" />
				<Shape d={tuftD(300, 1012, 40, 90, 700, 3, 6) + ' ' + tuftD(1500, 1015, 36, 80, 700, 7, -6)} fill="#2e2e1e" />
				{[[200, 1030, 160], [1650, 1040, 220], [640, 1050, 120]].map(([px, py, r], i) => <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 0.12} fill="#eef2f6" opacity={0.8} />)}
				{/* the stake rising in his near hand */}
				<g transform={`translate(${f1(hand[0] - (x + 0.33 * h))},0)`}>{u < 1 && <rect x={x + 0.33 * h - 12} y={y - 8} width={24} height={12} fill="#2a1d12" opacity={1 - u} />}</g>
				<Stake x={hand[0]} y={bot} h={sh} t={t} wind={1.2} />
				<g><Karl2 x={x} y={y} h={h} fk={fk} t={t} /></g>
				{clods}
				<rect x={-50} y={-100} width={W + 100} height={H + 200} fill="#fff3dc" opacity={0.35 * flash} />
			</g>
		</svg>;
	}
	// shot 2: wide; he pushes the cart on up the road, the camera rises with him (a crane up: the near ground drops away, the horizon holds)
	const tt = t - cut, rem = dur - cut, e = sm(cl(tt / Math.max(0.5, rem + 0.4)));
	const D = 3.15, h = 360 * SB.focus / D, tr = travel('pushCart', tt + 0.5, h, 1.15, 1.15, 0, 1), kx = 720 + tr.dx, ky = sgY(D);
	const cam: Cam = {x: tr.dx * SB.focus / D * 0.85 + lerp(0, 50, e), y: lerp(40, -190, Math.pow(e, 0.85)), z: lerp(0.05, 0.25, e), zoom: 1, roll: lerp(0.5, 0, e)};
	const ax = pushCartAxle(tr.phase, kx, ky, h);
	const karl = <Fig x={kx} y={ky} h={h} depth={D} attire="siberia" action="pushCart" phase={tr.phase} rim="#ffd9a0" lightDir={25} shadow={{k: 0.3, skew: -1.6, o: 0.35, c: '#3a3040', blur: 2}}
		under={<g transform={`rotate(-10 ${f1(ax[0] - h * 0.12)} ${f1(ax[1] - h * 0.3)})`}><Stake x={ax[0] - h * 0.12} y={ax[1] - h * 0.28} h={h * 0.62} t={t} wind={1.4} /></g>} />;
	return <>
		<StakeWorld t={t + 6} cam={cam} s={{...S, sun: 1}} karl={karl} showStake={false} showCart={false} rays />
	</>;
};
/** Karl in a designed pose outside a Stage (shot 1 of resume): the rig variant in 'pose' */
const Karl2: React.FC<{x: number; y: number; h: number; fk: FK; t: number}> = ({x, y, h, fk, t}) => <KarlRig x={x} y={y} h={h} attire="siberia" action="pose" phase={t / 3} fk={fk} hands={['fist', 'fist']} breath={0.2} rim="#ffd9a0" rimO={1} lightDir={10} />;
void Mist; void IceRidge;
