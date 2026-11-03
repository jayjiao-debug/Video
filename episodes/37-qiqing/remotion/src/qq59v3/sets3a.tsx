import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, Particles, Shafts, Mist, FogFoot, Glow, SkyGrad, Cam, INF, useFog, P, W, f1, lerp, rnd, noise1, spline, taper, qpts} from './kit3';
import {trunkD, leafD, frondD, lianaD, hangD, tuftD, ripplesD, canopyD, droopLeafD, mossD} from './props3';
import {walkG, BRISK} from '../qq59/figure59';

/* ep59 v3 · hero sets A: the Darién Gap jungle. */
export type SetProps = {t: number; cam: Cam};

/* ===================================================== 1 · DARIÉN GAP =====================================================
   Morning in the swamp forest. The sun is high upper-left behind the canopy: warm shafts slant down-right through mist and land
   on the water right behind Karl. Value plan: one bright misty window (centre-left) framed by a black-green canopy ceiling, a
   strangler-fig trunk (left), a giant buttress kapok (right), dark water and leaves below. Warm light / cool teal shadow.
   Karl walks a fallen log (D = 3) across the swamp, dark against the brightest pool. */
const JF = {focus: 3, waterY: 742, logY: 778};

const JBack: React.FC = () => <>
	<SkyGrad stops={[[0, '#56735a'], [0.3, '#7a9878'], [0.58, '#a3bb92'], [0.69, '#c6d3a8'], [0.7, '#9fb491'], [0.8, '#4b6650'], [1, '#13231a']]} />
	<Glow x={480} y={-40} r={1000} ry={700} c="#fbe7a6" o={0.7} />
	<Glow x={780} y={640} r={560} ry={330} c="#fff0bf" o={0.8} />
	<Glow x={780} y={JF.waterY + 30} r={520} ry={60} c="#fff4c8" o={0.6} />
</>;

/** a band of trees at one depth: trunks (some with buttresses), hanging vines, reflections in the water */
const TreeBand: React.FC<{seed: number; n: number; base: number; col: string; w: [number, number]; skip?: [number, number][]; vines?: number; refl?: number; buttress?: number}> = ({seed, n, base, col, w, skip = [], vines = 0, refl = 0.35, buttress = 0}) => {
	const fog = useFog(), c = fog(col), cr = fog(col, 0.1);
	const trunks: string[] = [], hang: string[] = [];
	for (let i = 0; i < n; i++) { const x = -260 + (i + rnd(i, seed) * 0.8) * (W + 520) / n, ww = lerp(w[0], w[1], rnd(i, seed + 1));
		if (skip.some(([a, b]) => x > a && x < b)) continue;
		trunks.push(trunkD(x, -160, base + 6, ww * 0.8, ww * (1 + buttress * rnd(i, seed + 3)), seed + i * 7, buttress * ww * 1.8));
		for (let v = 0; v < vines; v++) if (rnd(i * 5 + v, seed + 4) > 0.45) hang.push(hangD([x + (rnd(i * 5 + v, seed + 5) - 0.5) * ww * 3, -60 + rnd(i, seed + 6) * 160], 200 + rnd(i * 3 + v, seed + 7) * (base - 300), 2.5 + ww * 0.04, 30 * (rnd(v, seed) - 0.5))); }
	return <g>
		<Shape d={trunks.join(' ') + ' ' + hang.join(' ')} fill={c} />
		{refl > 0 && <g opacity={refl} transform={`translate(0,${2 * base}) scale(1,-1)`}><Shape d={trunks.join(' ')} fill={cr} /></g>}
	</g>; };

/** the canopy ceiling, with translucent sunlit leaves glowing at the edges of the gaps */
const Canopy: React.FC<{y: number; seed: number; gaps: [number, number][]; t: number}> = ({y, seed, gaps, t}) => {
	const fog = useFog(), [mass, fringe] = canopyD(-500, W + 500, y, seed, gaps, t);
	const lit = gaps.map(([a, b], g) => Array.from({length: 9}, (_, k) => { const x = k % 2 ? a - 10 + rnd(k, g) * 50 : b - 40 + rnd(k, g + 3) * 50, yy = y - 150 + rnd(k, g + 5) * 90;
		return leafD([x, yy], 40 + rnd(k, g + 7) * 40, 18, 80 + (rnd(k, g + 9) - 0.5) * 90 + Math.sin(t + k) * 4, 25); }).join(' ')).join(' ');
	const tex = Array.from({length: 60}, (_, i) => { const x = -400 + rnd(i, seed + 20) * (W + 800), yy = y - 140 - rnd(i, seed + 21) * 260; return Array.from({length: 4}, (_, k) => leafD([x + k * 14, yy + (k % 2) * 10], 36 + rnd(k, i) * 30, 14, 60 + k * 25 + (rnd(i, 3) - 0.5) * 40, 20)).join(' '); }).join(' ');
	return <g><Shape d={mass + ' ' + fringe} fill={fog('#091615', -0.12)} /><Shape d={tex} fill={fog('#1a3027', -0.1)} o={0.7} /><Shape d={lit} fill="#b4c45a" o={0.55} /></g>; };

/** a strangler fig on the left: a host trunk wrapped in braided aerial roots */
const Strangler: React.FC<{x: number; base: number}> = ({x, base}) => {
	const fog = useFog(), c = fog('#0d1b13', -0.08), rim = fog('#a9bf85', -0.02);
	const trunk = trunkD(x, -200, base, 170, 230, 21, 140, 0.12);
	const braids = Array.from({length: 7}, (_, i) => { const x0 = x - 90 + i * 30; return taper(Array.from({length: 10}, (_, k) => [x0 + Math.sin(k * 0.9 + i) * 34 + (k / 9) * (i - 3) * 40, -100 + k * (base + 110) / 9] as P), 16, 26); }).join(' ');
	const vines = [lianaD([x + 60, 120], [x + 520, 60], 260, 9), hangD([x + 140, 200], 380, 5, 18), hangD([x + 110, 80], 520, 4, -10)].join(' ');
	return <g>
		<g transform="translate(5,-2)"><Shape d={trunk + ' ' + braids} fill={rim} o={0.6} /></g>
		<Shape d={trunk + ' ' + braids + ' ' + vines} fill={c} />
		<g opacity={0.45} transform={`translate(0,${2 * base}) scale(1,-1)`}><Shape d={trunk + ' ' + braids} fill={c} /></g>
	</g>; };

/** the giant buttress tree (kapok): trunk out of frame top, plank buttresses flaring into the water; lit on its left edge */
const BigTree: React.FC<{x: number; base: number; t: number}> = ({x, base, t}) => {
	const fog = useFog(), dark = fog('#0b1a17', -0.1), rim = fog('#c6cf8f', -0.05), mid = fog('#1d3526', -0.08);
	const trunk = trunkD(x, -200, base - 120, 250, 330, 11, 0, 0.08);
	const fins: [number, number, number][] = [[-1, 0.62, 380], [-1, 0.45, 210], [1, 0.58, 330], [1, 0.4, 170], [-0.2, 0.5, 90], [0.35, 0.48, 120]];
	const finD = fins.map(([s, top, reach], i) => { const y0 = lerp(-200, base, top), ex = x + s * 120, fx = x + s * (120 + reach), th = 26 + 20 * rnd(i, 4);
		return `M${f1(ex - s * 30)},${f1(y0)} Q${f1(ex + s * 10)},${f1(lerp(y0, base, 0.65))} ${f1(fx)},${f1(base + 8)} L${f1(fx - s * th)},${f1(base + 14)} Q${f1(ex - s * 10)},${f1(lerp(y0, base, 0.75))} ${f1(ex - s * 80)},${f1(base + 10)} Z`; }).join(' ');
	const base0 = `M${x - 200},${base - 140} L${x + 200},${base - 140} L${x + 240},${base + 14} L${x - 240},${base + 14} Z`;
	const epi = Array.from({length: 4}, (_, i) => { const ex = x - 118 + rnd(i, 21) * 30, ey = 90 + i * 150; return Array.from({length: 7}, (_, k) => leafD([ex, ey], 40 + rnd(k, i) * 40, 10, -170 + k * 22 + Math.sin(t + i) * 2, -20)).join(' '); }).join(' ');
	const vines = [lianaD([x - 40, 160], [x - 560, -60], 380, 10), lianaD([x + 60, 60], [x - 330, 250], 220, 7), hangD([x - 150, 260], 420, 5, 16), hangD([x - 185, 140], 360, 4, -12)].join(' ');
	return <g>
		<g transform="translate(-6,-2)"><Shape d={trunk + ' ' + finD + ' ' + base0} fill={rim} /></g>
		<Shape d={trunk + ' ' + finD + ' ' + base0} fill={dark} />
		<Shape d={Array.from({length: 9}, (_, i) => taper([[x - 100 + i * 24, -150], [x - 104 + i * 25 + noise1(i, 3) * 8, 200], [x - 110 + i * 26, base - 160]], 4, 2)).join(' ')} fill={mid} />
		<Shape d={epi + ' ' + vines} fill={dark} />
		<g opacity={0.55} transform={`translate(0,${2 * base + 10}) scale(1,-0.9)`}><Shape d={finD + ' ' + base0 + ' ' + trunk} fill={fog('#0b1710', -0.1)} /></g>
	</g>; };

/** the fallen log: from off-frame left to a broken end on the right; branch stubs, moss, ferns on top. Rim of light along its top. */
const Log: React.FC<{y: number; t: number}> = ({y, t}) => {
	const fog = useFog(), dark = fog('#081211', -0.1), rim = '#e7e3b0', moss = fog('#1f3320', -0.1);
	const x0 = -200, x1 = 2050, top = (x: number) => y + (x - 400) * 0.014 + noise1(x / 170, 5) * 4, thick = (x: number) => 72 - (x - x0) * 0.009;
	const topPts: P[] = [], botPts: P[] = [];
	for (let x = x0; x <= x1; x += 40) { topPts.push([x, top(x)]); botPts.push([x, top(x) + thick(x)]); }
	const end: P[] = [[x1 + 14, top(x1) + 4], [x1 + 4, top(x1) + 18], [x1 + 22, top(x1) + 30], [x1 + 6, top(x1) + 42], [x1 + 16, top(x1) + 52]];
	const log = spline([...topPts, ...end, ...botPts.reverse()], true);
	const stubs = [taper([[520, top(520) + 6], [498, top(520) - 70], [460, top(520) - 128]], 18, 5), taper([[1060, top(1060) + 6], [1092, top(1060) - 64]], 15, 5),
		taper([[1215, top(1215) + 6], [1236, top(1215) - 170], [1282, top(1215) - 250]], 20, 4), taper([[1240, top(1240) - 150], [1210, top(1240) - 210]], 8, 3)].join(' ');
	const mossPts: P[] = []; for (let x = x0 + 200, i = 0; x < x1 - 30; i++) { x += 30 + rnd(i, 3) * 140; if (rnd(i, 4) > 0.3) for (let k = 0; k < 1 + Math.floor(rnd(i, 6) * 3); k++) { const xx = x + k * 14; mossPts.push([xx, top(xx) + thick(xx) - 6]); } }
	const ferns = frondD([300, top(300) + 4], 120, -140, 40, 34, 7, 10).concat(frondD([330, top(330) + 4], 110, -50, 40, 30, 9, 10), frondD([1160, top(1160) + 4], 90, -120, 30, 26, 11, 9));
	const all = log + ' ' + stubs;
	return <g>
		<g opacity={0.6} transform={`translate(0,${2 * (y + 64)}) scale(1,-1)`}><Shape d={log + ' ' + stubs} fill={fog('#08100b', -0.1)} /></g>
		<g transform="translate(-2,-3.5)"><Shape d={all + ' ' + ferns.join(' ')} fill={rim} o={0.7} /></g>
		<Shape d={all + ' ' + ferns.join(' ')} fill={dark} />
		<Shape d={mossD(mossPts, 5, 58 + Math.sin(t) * 0.5)} fill={moss} />
		<Shape d={tuftD(640, top(640) + 3, 4, 22, 30, 12) + ' ' + tuftD(900, top(900) + 3, 3, 18, 24, 14)} fill={dark} />
	</g>; };

/** floating leaves / lily pads in perspective (sizes by y), with a light rim on the far edge */
const Pads: React.FC<{seed: number; n: number; y0: number; y1: number; x0?: number; x1?: number; col: string; r?: [number, number]}> = ({seed, n, y0, y1, x0 = -100, x1 = W + 100, col, r = [10, 70]}) => {
	const fog = useFog();
	let d = '', hi = '';
	for (let i = 0; i < n; i++) { const u = rnd(i, seed), y = lerp(y0, y1, u * u), rr = lerp(r[0], r[1], u * u) * (0.7 + rnd(i, seed + 1) * 0.6), x = lerp(x0, x1, rnd(i, seed + 2)), a0 = rnd(i, seed + 3) * 6.28, ry = rr * 0.24;
		const pts: P[] = []; for (let k = 0; k <= 14; k++) { const a = a0 + 0.35 + k * (Math.PI * 2 - 0.7) / 14; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * ry]); } pts.push([x, y]);
		d += spline(pts, true) + ' '; hi += `M${f1(x - rr)},${f1(y)} Q${f1(x)},${f1(y - ry * 1.6)} ${f1(x + rr)},${f1(y)} Q${f1(x)},${f1(y - ry * 1.1)} ${f1(x - rr)},${f1(y)} Z `; }
	return <g><Shape d={hi} fill="#dfe3b0" o={0.45} transform="translate(0,-1.5)" /><Shape d={d} fill={fog(col, -0.1)} /></g>; };

/** the near bank, bottom right: mud, roots, big drooping leaves and ferns, rim-lit from the upper left */
const NearBank: React.FC<{t: number}> = ({t}) => {
	const fog = useFog(), c = fog('#060f0e', -0.1), rim = '#c9cf92';
	const bank = spline([[1150, 1250], [1210, 1010], [1360, 940], [1560, 915], [1760, 900], [2000, 880], [2200, 900], [2200, 1300]], true);
	const sw = (i: number) => Math.sin(t * 0.9 + i) * 3;
	const paddle = (b: P, L: number, a: number, bend: number, w = 0.3, i = 0) => { const tip = a + sw(i); return taper(qpts(b, [b[0] + Math.cos(tip * Math.PI / 180) * L * 0.15, b[1] + Math.sin(tip * Math.PI / 180) * L * 0.15], [b[0] + Math.cos(tip * Math.PI / 180) * L * 0.3, b[1] + Math.sin(tip * Math.PI / 180) * L * 0.3], 6), L * 0.05, L * 0.035) + ' ' + leafD([b[0] + Math.cos(tip * Math.PI / 180) * L * 0.28, b[1] + Math.sin(tip * Math.PI / 180) * L * 0.28], L * 0.75, L * w, tip, bend); };
	const leaves = [paddle([1420, 960], 420, -118, -30, 0.24, 1), paddle([1460, 950], 380, -78, 34, 0.24, 2), paddle([1600, 930], 470, -100, -40, 0.25, 3), paddle([1640, 925], 360, -55, 50, 0.25, 4),
		paddle([1820, 905], 430, -95, -36, 0.24, 5), paddle([1860, 900], 330, -40, 46, 0.25, 6), paddle([1530, 940], 300, -140, -20, 0.22, 9), paddle([1720, 920], 280, -20, 30, 0.22, 10), droopLeafD([1300, 1000], [1260, 890], 200, 150 + sw(7), 0.42, 30), droopLeafD([1990, 890], [2040, 760], 240, 40 + sw(8), 0.42, 40)].join(' ');
	const ferns = frondD([1440, 950], 300, -160, 50, 70, 31, 16).concat(frondD([1760, 910], 280, -30, 40, 60, 37, 16)).join(' ');
	const roots = Array.from({length: 6}, (_, i) => taper([[1220 + i * 90, 990 - i * 12], [1180 + i * 92, 1040], [1160 + i * 96, 1100]], 16, 4)).join(' ');
	const all = bank + ' ' + leaves + ' ' + ferns + ' ' + roots;
	return <g>
		<g transform="translate(-4,-4)"><Shape d={all} fill={rim} o={0.4} /></g>
		<Shape d={all} fill={c} />
	</g>; };

/** out-of-focus foreground framing: a huge leaf mass bottom-left, a hanging frond top-right, a trunk at the left edge */
const FgFrame: React.FC<{t: number}> = ({t}) => {
	const c = '#040805', s1 = Math.sin(t * 0.6) * 1.5, s2 = Math.sin(t * 0.5 + 1) * 1.2;
	const bl = frondD([-160, 1180], 820, -38, 70, 150, 41, 20).concat([leafD([-120, 1240], 520, 190, -62, -10), leafD([180, 1300], 420, 150, -96, 24)]).join(' ');
	const tr = frondD([2060, -90], 640, 160, -40, 130, 51, 18).join(' ');
	const trunk = trunkD(-10, -200, 1300, 170, 210, 61, 0, 0.1);
	return <g fill={c}>
		<Shape d={trunk} />
		<Shape d={hangD([170, -100], 860, 12, 34) + ' ' + hangD([215, -100], 620, 7, -24)} />
		<g transform={`rotate(${s1.toFixed(2)} -80 1180)`}><Shape d={bl} /></g>
		<g transform={`rotate(${s2.toFixed(2)} 2060 -90)`}><Shape d={tr} /></g>
	</g>; };

export const Jungle: React.FC<SetProps & {walk?: boolean}> = ({t, cam, walk}) => {
	const h = 330, wg = walkG(t, 0, 470, h, BRISK, 0.27), phase = walk ? wg.phase : t / 1.0, x = walk ? wg.x : 760;
	return <Stage t={t} cam={cam} atm={{haze: '#7da38e', density: 0.065, focus: JF.focus, aperture: 2.4, rim: '#ffe7ad', lightDir: 118, grain: 0.06, vignette: 0.62}} bg="#0d1712">
		<Layer D={INF}><JBack /></Layer>
		<Layer D={20}>
			<TreeBand seed={3} n={28} base={JF.waterY - 4} col="#3f5f48" w={[14, 42]} refl={0.3} vines={1} />
			<FogFoot y0={470} y1={JF.waterY + 4} o={0.85} c="#c9d5aa" />
		</Layer>
		<Layer D={11}>
			<TreeBand seed={7} n={13} base={JF.waterY + 4} col="#203a2a" w={[34, 78]} skip={[[600, 980]]} vines={2} buttress={1.2} refl={0.4} />
			<FPath d={frondD([330, 130], 260, -20, 70, 70, 2).concat(frondD([1150, 210], 240, 200, -60, 60, 5)).join(' ')} c="#203a2a" />
			<FogFoot y0={560} y1={JF.waterY + 10} o={0.7} c="#c5d3a6" />
		</Layer>
		<Layer D={8}><Mist n={8} seed={4} y0={JF.waterY - 60} y1={JF.waterY + 20} t={t} speed={10} o={0.55} c="#e6ecca" w={[500, 1300]} h={[50, 120]} /></Layer>
		<Layer D={6.5} blur={0}>
			<Shafts y0={-60} angle={17} c="#ffe49a" len={1150} t={t} beams={[{x: 330, w: 60, o: 0.55}, {x: 450, w: 170, o: 0.85, spread: 0.7}, {x: 610, w: 70, o: 0.6}, {x: 700, w: 120, o: 0.7, spread: 0.6}, {x: 900, w: 46, o: 0.4}, {x: 1030, w: 80, o: 0.35}]} />
		</Layer>
		<Layer D={5}>
			<Strangler x={140} base={JF.waterY + 20} />
			<Canopy y={150} seed={9} gaps={[[300, 560], [620, 860]]} t={t} />
			<FPath d={[lianaD([-50, 90], [430, 150], 300, 10), lianaD([840, 90], [1180, 190], 220, 8), hangD([985, 140], 420, 5, 14), hangD([1045, 160], 300, 3.5, -10)].join(' ')} c="#091615" extra={-0.12} />
		</Layer>
		<Layer D={4}><BigTree x={1600} base={JF.waterY + 30} t={t} /></Layer>
		<Layer D={3.6}>
			<Shape d={ripplesD(JF.waterY + 8, 900, 140, 3, -400, W + 400, [30, 200], t, 6)} fill="#eef0cf" o={0.3} />
			<Glow x={790} y={JF.waterY + 70} r={260} ry={40} c="#fff3c6" o={0.5} />
			<Pads seed={5} n={30} y0={JF.waterY + 14} y1={930} col="#1b3022" />
		</Layer>
		<Layer D={JF.focus}><Log y={JF.logY} t={t} /></Layer>
		<FigureSlot x={x} y={JF.logY - 1} h={h} attire="jungle" action="walk" phase={phase} facing={1} reflect={{wy: JF.logY + 64, o: 0.42}} backlit />
		<Particles kind="dust" n={90} seed={11} D={[2.2, 9]} box={[200, 0, 1250, 820]} c="#fff3c4" o={0.95} size={1.15} />
		<Particles kind="firefly" n={20} seed={12} D={[1.5, 6]} box={[950, 420, 2000, 1060]} c="#f2ff9a" o={1} size={1} />
		<Layer D={2.1}>
			<Shape d={ripplesD(920, 1120, 46, 8, -400, W + 400, [120, 420], t, 10)} fill="#b9c79c" o={0.2} />
			<Pads seed={9} n={9} y0={950} y1={1120} x0={250} x1={1150} col="#0c1a12" r={[50, 110]} />
		</Layer>
		<Layer D={1.5}><g transform={walk ? 'translate(110,0)' : undefined}><NearBank t={t} /></g></Layer>
		<Layer D={0.55} blur={8}><FgFrame t={t} /></Layer>
	</Stage>;
};
