import React from 'react';
import {Stage, Layer, FPath, FigureSlot, Particles, Shafts, Mist, FogBand, FogFoot, Glow, SkyGrad, Cam, INF, useFog, useStage, P, W, H, f1, lerp, rnd, noise1, fbm, ridge, spline, taper, poly, wrap} from './kit3';
import {trunkD, blobD, leafD, frondD, earLeafD, lianaD, hangD, tuftD, ripplesD} from './props3';
import {STRIDE_B} from '../qq59/figure59';

/* ep59 v3 · hero sets A: the Darién Gap jungle. */
export type SetProps = {t: number; cam: Cam};

/* ===================================================== 1 · DARIÉN GAP =====================================================
   Morning in the swamp forest. Sun high upper-left behind the canopy: warm shafts slant down-right through mist.
   Value plan: a bright misty window centre-left (the focal pool of light) framed by a dark canopy ceiling, the root plate of a
   fallen log (left), a giant buttress tree (right), black water and leaves below. Karl walks the fallen log (D = 3) against the light. */
const JF = {focus: 3, waterY: 742, logY: 776};
const JHaze = '#a8c3a3';

const JSky: React.FC = () => <>
	<SkyGrad stops={[[0, '#e9edc9'], [0.35, '#c7d8b0'], [0.62, '#a3bf9f'], [0.7, '#9cb89b'], [1, '#5f7f6b']]} />
	<Glow x={560} y={60} r={900} ry={620} c="#fff6d4" o={0.85} />
	<Glow x={720} y={520} r={520} ry={260} c="#f8f3cf" o={0.55} />
	{/* the water (it mirrors the bright mist near the far shore, darkens toward us) */}
	<WaterBase />
</>;
const WaterBase: React.FC = () => { const y0 = JF.waterY;
	return <><defs><linearGradient id="jwat" gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={H + 60}><stop offset="0" stopColor="#c3d3b2" /><stop offset="0.12" stopColor="#8fa98f" /><stop offset="0.38" stopColor="#3d5a4b" /><stop offset="0.7" stopColor="#16281f" /><stop offset="1" stopColor="#0a140f" /></linearGradient></defs>
		<rect x={-1400} y={y0} width={W + 2800} height={H} fill="url(#jwat)" />
		<Glow x={760} y={y0 + 40} r={420} ry={70} c="#fff4cc" o={0.55} /></>; };

/** a band of trees at one depth: trunks (some with buttresses), crowns at the top, their reflections in the water */
const TreeBand: React.FC<{seed: number; n: number; base: number; col: string; w: [number, number]; skip?: [number, number][]; vines?: number; refl?: number; buttress?: number}> = ({seed, n, base, col, w, skip = [], vines = 0, refl = 0.35, buttress = 0}) => {
	const fog = useFog(), c = fog(col), cr = fog(col, 0.08);
	const trunks: string[] = [], hang: string[] = [];
	for (let i = 0; i < n; i++) { const x = -200 + (i + rnd(i, seed) * 0.8) * (W + 400) / n, ww = lerp(w[0], w[1], rnd(i, seed + 1));
		if (skip.some(([a, b]) => x > a && x < b)) continue;
		trunks.push(trunkD(x, -120, base + 6, ww * 0.8, ww * (1 + buttress * rnd(i, seed + 3)), seed + i * 7, buttress * ww * 1.6));
		for (let v = 0; v < vines; v++) if (rnd(i * 5 + v, seed + 4) > 0.5) hang.push(hangD([x + (rnd(i * 5 + v, seed + 5) - 0.5) * ww * 3, -60 + rnd(i, seed + 6) * 200], 300 + rnd(i * 3 + v, seed + 7) * (base - 200), 3 + ww * 0.05, 20 * (rnd(v, seed) - 0.5))); }
	const all = trunks.join(' ') + ' ' + hang.join(' ');
	return <g>
		<path d={all} fill={c} />
		{refl > 0 && <g opacity={refl} transform={`translate(0,${2 * base}) scale(1,-1)`}><path d={trunks.join(' ')} fill={cr} /></g>}
	</g>; };

/** the canopy ceiling: dark leaf masses along the top, open where the shafts come through */
const Canopy: React.FC<{y: number; col: string; seed: number; gaps: [number, number][]; t: number}> = ({y, col, seed, gaps, t}) => {
	const fog = useFog(), c = fog(col);
	let d = '';
	for (let i = 0; i < 70; i++) { const x = -300 + i * (W + 600) / 70 + rnd(i, seed) * 30, open = gaps.some(([a, b]) => x > a && x < b);
		const yy = y + (open ? -90 : 0) + fbm(x, 300, 60, seed) + rnd(i, seed + 1) * 50, r = 60 + rnd(i, seed + 2) * 70;
		d += blobD(x, yy, r * 1.3, r * 0.8, seed + i, 10, 0.35) + ' ';
		if (!open && rnd(i, seed + 3) > 0.4) for (let k = 0; k < 4; k++) d += leafD([x + (rnd(k, i) - 0.5) * r * 2, yy + r * 0.4], 50 + rnd(k, i + 9) * 60, 18 + rnd(k, i + 3) * 10, 70 + (rnd(k, i + 4) - 0.5) * 90 + Math.sin(t * 0.8 + i) * 3, 30) + ' '; }
	return <g><path d={d} fill={c} /><rect x={-1400} y={-1200} width={W + 2800} height={y + 1200 - 40} fill={c} /></g>; };

/** the giant buttress tree (kapok): trunk out of frame top, plank buttresses flaring into the water; lit on its left edge */
const BigTree: React.FC<{x: number; base: number; t: number}> = ({x, base, t}) => {
	const fog = useFog(), dark = fog('#122319'), rim = fog('#a9c08a', 0.05), mid = fog('#1b3326');
	const trunk = trunkD(x, -200, base - 120, 250, 330, 11, 0, 0.08);
	const fins: [number, number, number][] = [[-1, 0.62, 360], [-1, 0.45, 200], [1, 0.58, 330], [1, 0.4, 170], [-0.2, 0.5, 90], [0.35, 0.48, 120]];
	const finD = fins.map(([s, top, reach], i) => { const y0 = lerp(-200, base, top), ex = x + s * 120, fx = x + s * (120 + reach), th = 26 + 20 * rnd(i, 4);
		return `M${f1(ex - s * 30)},${f1(y0)} Q${f1(ex + s * 10)},${f1(lerp(y0, base, 0.65))} ${f1(fx)},${f1(base + 8)} L${f1(fx - s * th)},${f1(base + 14)} Q${f1(ex - s * 10)},${f1(lerp(y0, base, 0.75))} ${f1(ex - s * 80)},${f1(base + 10)} Z`; }).join(' ');
	const base0 = `M${x - 200},${base - 140} L${x + 200},${base - 140} L${x + 240},${base + 14} L${x - 240},${base + 14} Z`;
	const epi = Array.from({length: 4}, (_, i) => { const ex = x - 110 + rnd(i, 21) * 40, ey = 90 + i * 140; return Array.from({length: 7}, (_, k) => leafD([ex, ey], 40 + rnd(k, i) * 40, 9, -170 + k * 22 + Math.sin(t + i) * 2, -20)).join(' '); }).join(' ');
	const vines = [lianaD([x - 40, 160], [x - 520, -60], 360, 9), lianaD([x + 60, 60], [x - 300, 260], 200, 7), hangD([x - 140, 250], 560, 6, 16), hangD([x - 175, 120], 640, 4, -12), hangD([x + 150, 300], 420, 5, 10)].join(' ');
	return <g>
		<g transform="translate(-5,-2)"><path d={trunk + ' ' + finD + ' ' + base0} fill={rim} /></g>
		<path d={trunk + ' ' + finD + ' ' + base0} fill={dark} />
		{/* bark: long vertical grooves catching a little light */}
		<path d={Array.from({length: 9}, (_, i) => taper([[x - 100 + i * 24, -150], [x - 104 + i * 25 + noise1(i, 3) * 8, 200], [x - 110 + i * 26, base - 160]], 4, 2)).join(' ')} fill={mid} />
		<path d={epi} fill={dark} />
		<path d={vines} fill={dark} />
		<g opacity={0.5} transform={`translate(0,${2 * base + 10}) scale(1,-0.9)`}><path d={finD + ' ' + base0 + ' ' + trunk} fill={fog('#0e1a14')} /></g>
	</g>; };

/** the fallen log the path follows: a long trunk across the swamp with its root plate standing up at the left end */
const Log: React.FC<{y: number; t: number}> = ({y, t}) => {
	const fog = useFog(), dark = fog('#0e1813'), rim = fog('#c9d4a2', 0.0), moss = fog('#26391f');
	const x0 = 270, x1 = 1330, top = (x: number) => y + (x - x0) * 0.012 + noise1(x / 160, 5) * 3;
	const log = (() => { const pts: P[] = [], bot: P[] = []; for (let x = x0; x <= x1; x += 40) { pts.push([x, top(x)]); bot.push([x, top(x) + 54 - (x - x0) * 0.012]); } return spline([...pts, [x1 + 20, top(x1) + 24], ...bot.reverse()], true); })();
	const plate = blobD(x0 - 20, y - 70, 150, 190, 77, 16, 0.22);
	const roots = Array.from({length: 22}, (_, i) => { const a = (i / 22) * Math.PI * 2, r0 = 150, sx = x0 - 20 + Math.cos(a) * r0 * 0.9, sy = y - 70 + Math.sin(a) * r0 * 1.15;
		return taper([[sx, sy], [sx + Math.cos(a) * 50, sy + Math.sin(a) * 50 + 20], [sx + Math.cos(a) * 80 + noise1(i, 3) * 20, sy + Math.sin(a) * 70 + 60]], 10, 2); }).join(' ');
	const drips = Array.from({length: 26}, (_, i) => { const x = x0 + 40 + i * 38 + rnd(i, 3) * 20; return hangD([x, top(x) + 46], 20 + rnd(i, 4) * 60, 6, Math.sin(t * 0.7 + i) * 3); }).join(' ');
	const hang = Array.from({length: 8}, (_, i) => hangD([x0 - 120 + i * 30, y + 60 + rnd(i, 2) * 30], 80 + rnd(i, 5) * 90, 4, 6)).join(' ');
	const stubs = [taper([[520, top(520) + 4], [500, top(520) - 70], [470, top(520) - 120]], 16, 5), taper([[1080, top(1080) + 4], [1110, top(1080) - 60]], 14, 5), taper([[1210, top(1210) + 4], [1230, top(1210) - 160], [1270, top(1210) - 230]], 18, 4)].join(' ');
	const tufts = tuftD(380, top(380) + 4, 9, 40, 70, 4) + ' ' + tuftD(1160, top(1160) + 4, 7, 30, 60, 8) + ' ' + tuftD(640, top(640) + 3, 4, 22, 30, 12);
	const all = plate + ' ' + roots + ' ' + log + ' ' + stubs;
	return <g>
		<g opacity={0.55} transform={`translate(0,${2 * (y + 70)}) scale(1,-1)`}><path d={log + ' ' + plate + ' ' + stubs} fill={fog('#0b1410')} /></g>
		<g transform="translate(-3,-3)"><path d={all} fill={rim} opacity={0.75} /></g>
		<path d={all + ' ' + hang} fill={dark} />
		<path d={drips + ' ' + tufts} fill={moss} />
	</g>; };

/** floating leaves / lily pads in perspective (sizes by y), with a light rim on the far edge */
const Pads: React.FC<{seed: number; n: number; y0: number; y1: number; x0?: number; x1?: number; col: string}> = ({seed, n, y0, y1, x0 = -100, x1 = W + 100, col}) => {
	const fog = useFog();
	let d = '', hi = '';
	for (let i = 0; i < n; i++) { const u = rnd(i, seed), y = lerp(y0, y1, u * u), r = lerp(10, 70, u * u) * (0.7 + rnd(i, seed + 1) * 0.6), x = lerp(x0, x1, rnd(i, seed + 2)), a0 = rnd(i, seed + 3) * 6.28, ry = r * 0.22;
		const pts: P[] = []; for (let k = 0; k <= 14; k++) { const a = a0 + 0.35 + k * (Math.PI * 2 - 0.7) / 14; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * ry]); } pts.push([x, y]);
		d += poly(pts) + ' '; hi += `M${f1(x - r)},${f1(y)} Q${f1(x)},${f1(y - ry * 1.5)} ${f1(x + r)},${f1(y)} Q${f1(x)},${f1(y - ry * 1.15)} ${f1(x - r)},${f1(y)} Z `; }
	return <g><path d={hi} fill={fog('#cfdcae')} opacity={0.5} transform="translate(0,-1.5)" /><path d={d} fill={fog(col)} /></g>; };

/** the near bank, bottom right: mud, roots, elephant-ear leaves, ferns */
const NearBank: React.FC<{t: number}> = ({t}) => {
	const fog = useFog(), c = fog('#09110d'), rim = fog('#7f9a72');
	const bank = spline([[1180, 1200], [1230, 1000], [1380, 930], [1560, 905], [1760, 890], [2000, 870], [2200, 900], [2200, 1300]], true);
	const leaves = [earLeafD([1400, 960], [1330, 760], 120, -150), earLeafD([1520, 940], [1580, 700], 150, -60), earLeafD([1700, 920], [1660, 690], 140, -110), earLeafD([1850, 900], [1960, 720], 130, -40), earLeafD([1300, 1000], [1220, 880], 90, 170)].flat();
	const ferns = frondD([1460, 950], 260, -150, 50, 60, 31, 14).concat(frondD([1780, 910], 240, -40, 40, 50, 37, 14));
	const sway = Math.sin(t * 0.9) * 1.2;
	const all = bank + ' ' + leaves.join(' ') + ' ' + ferns.join(' ');
	return <g transform={`rotate(${sway.toFixed(2)} 1600 1000)`}>
		<g transform="translate(-4,-3)"><path d={all} fill={rim} opacity={0.55} /></g>
		<path d={all} fill={c} />
	</g>; };

/** out-of-focus foreground framing: a huge leaf mass bottom-left, a hanging frond top-right, a trunk at the left edge */
const FgFrame: React.FC<{t: number}> = ({t}) => {
	const c = '#050a07', s1 = Math.sin(t * 0.6) * 1.5, s2 = Math.sin(t * 0.5 + 1) * 1.2;
	const bl = [leafD([-80, 1180], 520, 150, -38, -12), leafD([-120, 1100], 420, 130, -12, 10), leafD([60, 1200], 380, 120, -70, -20), leafD([-60, 1000], 300, 90, -5, 25)].join(' ');
	const tr = frondD([2050, -80], 620, 160, -40, 120, 51, 18).join(' ');
	const trunk = trunkD(30, -200, 1300, 150, 190, 61, 0, 0.1);
	return <g fill={c}>
		<path d={trunk} />
		<path d={hangD([150, -100], 900, 10, 30) + ' ' + hangD([190, -100], 700, 6, -20)} />
		<g transform={`rotate(${s1.toFixed(2)} -80 1180)`}><path d={bl} /></g>
		<g transform={`rotate(${s2.toFixed(2)} 2050 -80)`}><path d={tr} /></g>
	</g>; };

export const Jungle: React.FC<SetProps & {walk?: boolean}> = ({t, cam, walk}) => {
	const h = 330, phase = t / 1.0, x = walk ? 600 + phase * STRIDE_B * h * 0.98 : 760;
	return <Stage t={t} cam={cam} atm={{haze: JHaze, density: 0.07, focus: JF.focus, aperture: 2.4, rim: '#ffe6ab', lightDir: 118, grain: 0.06, vignette: 0.6}} bg="#0d1712">
		<Layer D={INF}><JSky /></Layer>
		<Layer D={18}>
			<TreeBand seed={3} n={26} base={JF.waterY - 4} col="#5f8468" w={[16, 46]} refl={0.3} vines={1} />
			<FogFoot y0={520} y1={JF.waterY + 6} o={0.75} />
		</Layer>
		<Layer D={10}>
			<TreeBand seed={7} n={13} base={JF.waterY + 4} col="#3e604b" w={[34, 80]} skip={[[560, 930]]} vines={2} buttress={1.2} refl={0.35} />
			<FPath d={frondD([300, 120], 260, -20, 70, 70, 2).concat(frondD([1150, 200], 240, 200, -60, 60, 5)).join(' ')} c="#3e604b" />
			<FogFoot y0={600} y1={JF.waterY + 10} o={0.55} />
		</Layer>
		<Layer D={7} blur={14}>
			<Shafts y0={-40} angle={17} c="#fff3c8" len={1100} t={t} beams={[{x: 360, w: 70, o: 0.55}, {x: 470, w: 150, o: 0.6, spread: 0.6}, {x: 640, w: 60, o: 0.5}, {x: 760, w: 110, o: 0.45, spread: 0.5}, {x: 960, w: 50, o: 0.35}, {x: 1080, w: 80, o: 0.25}]} />
		</Layer>
		<Layer D={6}><Mist n={9} seed={4} y0={JF.waterY - 50} y1={JF.waterY + 30} t={t} speed={10} o={0.5} c="#dfe8cb" w={[600, 1400]} h={[50, 110]} /></Layer>
		<Layer D={5}>
			<Canopy y={40} col="#1b3125" seed={9} gaps={[[300, 560], [600, 820]]} t={t} />
			<FPath d={[lianaD([-50, 60], [420, 120], 300, 10), lianaD([380, 100], [700, 40], 160, 6), lianaD([820, 60], [1180, 160], 240, 8), hangD([980, 90], 520, 6, 14), hangD([1040, 120], 380, 4, -10), hangD([260, 100], 460, 5, 8)].join(' ')} c="#1b3125" />
		</Layer>
		<Layer D={4}><BigTree x={1590} base={JF.waterY + 30} t={t} /></Layer>
		<Layer D={3.6}>
			<path d={ripplesD(JF.waterY + 8, 900, 120, 3, -400, W + 400, [30, 200], t, 6)} fill="#e8eccb" opacity={0.28} />
			<Pads seed={5} n={26} y0={JF.waterY + 14} y1={900} col="#1d3324" />
		</Layer>
		<Layer D={JF.focus}><Log y={JF.logY} t={t} /></Layer>
		<FigureSlot x={x} y={JF.logY - 2} h={h} attire="jungle" action="walk" phase={phase} facing={1} reflect={{wy: JF.logY + 70, o: 0.35}} backlit />
		<Particles kind="dust" n={70} seed={11} D={[2.2, 9]} box={[200, 0, 1200, 820]} c="#fff1c0" o={0.9} size={1.1} />
		<Particles kind="firefly" n={22} seed={12} D={[1.6, 7]} box={[900, 380, 2000, 1000]} c="#f5ff9e" o={0.95} size={1} />
		<Layer D={1.9}>
			<path d={ripplesD(900, 1120, 40, 8, -400, W + 400, [120, 400], t, 10)} fill="#9fb495" opacity={0.18} />
			<Pads seed={9} n={10} y0={930} y1={1100} x0={-100} x1={1100} col="#0f1f17" />
		</Layer>
		<Layer D={1.45}><NearBank t={t} /></Layer>
		<Layer D={0.55} blur={16}><FgFrame t={t} /></Layer>
	</Stage>;
};
