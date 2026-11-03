/* ep59 v3 · act 1, scenes darien / jungle (2001, the Darién Gap).
   darien : A) the jungle wall at dusk from the last clearing, Karl before it;  B) insert: the will on his pack lid, signed and folded;
            C) he walks into the dark trail mouth and the forest swallows him.
   jungle : A) wading waist-deep through the swamp forest, the machete strike on the beat (photo: him in the jungle);
            B) night, a black river among mangroves: only his head under a drifting raft of branches; crocodile eyes surface on the beat.
   Jungle pieces are local variants of sets3a's (same family: canopy ceiling, trunks banded by haze, light shafts, mist, pads). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Layer, Shape, FPath, FigureSlot, Particles, Shafts, Mist, FogFoot, FogBand, Glow, SkyGrad, Sun, INF, W, H, P, f1, lerp, rnd, cl, sm, eio, mix, poly, spline, taper, qpts, noise1,
	useFog, useUid, Cam, CAM0, addCam, drift, GOLD, karlTravel, KARL_CYCLE} from './kit3';
import {Karl} from './karl3';
import {Print3, PH3} from './photo3';
import {trunkD, leafD, frondD, lianaD, hangD, tuftD, ripplesD, canopyD, earLeafD, blobD} from './props3';
import type {SceneProps, SceneDef} from './EP59V3';
import {hit, ein, eout, shotAt, Wash, useHand} from './act1_kit';

/* ---------------- jungle pieces (variants of sets3a) ---------------- */
const TreeBand: React.FC<{seed: number; n: number; base: number; col: string; w: [number, number]; skip?: [number, number][]; vines?: number; refl?: number; buttress?: number; top?: number}> = ({seed, n, base, col, w, skip = [], vines = 0, refl = 0.35, buttress = 0, top = -160}) => {
	const fog = useFog(), c = fog(col), cr = fog(col, 0.1);
	const trunks: string[] = [], hang: string[] = [];
	for (let i = 0; i < n; i++) { const x = -260 + (i + rnd(i, seed) * 0.8) * (W + 520) / n, ww = lerp(w[0], w[1], rnd(i, seed + 1));
		if (skip.some(([a, b]) => x > a && x < b)) continue;
		trunks.push(trunkD(x, top, base + 6, ww * 0.8, ww * (1 + buttress * rnd(i, seed + 3)), seed + i * 7, buttress * ww * 1.8));
		for (let v = 0; v < vines; v++) if (rnd(i * 5 + v, seed + 4) > 0.45) hang.push(hangD([x + (rnd(i * 5 + v, seed + 5) - 0.5) * ww * 3, top + 100 + rnd(i, seed + 6) * 160], 200 + rnd(i * 3 + v, seed + 7) * (base - top - 400), 2.5 + ww * 0.04, 30 * (rnd(v, seed) - 0.5))); }
	return <g><Shape d={trunks.join(' ') + ' ' + hang.join(' ')} fill={c} />
		{refl > 0 && <g opacity={refl} transform={`translate(0,${2 * base}) scale(1,-1)`}><Shape d={trunks.join(' ')} fill={cr} /></g>}</g>; };
const Canopy: React.FC<{y: number; seed: number; gaps: [number, number][]; t: number; col?: string; tex?: string; lit?: string; litO?: number; x0?: number; x1?: number}> = ({y, seed, gaps, t, col = '#091615', tex = '#1a3027', lit = '#b4c45a', litO = 0.55, x0 = -500, x1 = W + 500}) => {
	const fog = useFog(), [mass, fringe] = canopyD(x0, x1, y, seed, gaps, t);
	const litD = gaps.map(([a, b], g) => Array.from({length: 9}, (_, k) => { const x = k % 2 ? a - 10 + rnd(k, g) * 50 : b - 40 + rnd(k, g + 3) * 50, yy = y - 150 + rnd(k, g + 5) * 90;
		return leafD([x, yy], 40 + rnd(k, g + 7) * 40, 18, 80 + (rnd(k, g + 9) - 0.5) * 90 + Math.sin(t + k) * 4, 25); }).join(' ')).join(' ');
	return <g><Shape d={mass + ' ' + fringe} fill={fog(col, -0.12)} /><Shape d={Array.from({length: 40}, (_, i) => { const x = x0 + 100 + rnd(i, seed + 20) * (x1 - x0 - 200), yy = y - 140 - rnd(i, seed + 21) * 260; return Array.from({length: 4}, (_, k) => leafD([x + k * 14, yy + (k % 2) * 10], 36 + rnd(k, i) * 30, 14, 60 + k * 25 + (rnd(i, 3) - 0.5) * 40, 20)).join(' '); }).join(' ')} fill={fog(tex, -0.1)} o={0.7} />
		{litD && <Shape d={litD} fill={lit} o={litO} />}</g>; };
/** an emergent giant (kapok) silhouette above the canopy line: a long bare trunk and an umbrella crown */
const Emergent: React.FC<{x: number; base: number; h: number; seed: number; col: string}> = ({x, base, h, seed, col}) => {
	const fog = useFog(), top = base - h, crown = Array.from({length: 7}, (_, i) => blobD(x + (i - 3) * h * 0.11, top + Math.abs(i - 3) * h * 0.03 + rnd(i, seed) * h * 0.03, h * 0.12, h * 0.06, seed + i, 9, 0.3)).join(' ');
	const limbs = [taper([[x, top + h * 0.12], [x - h * 0.15, top + h * 0.04], [x - h * 0.3, top + h * 0.02]], h * 0.025, h * 0.008), taper([[x, top + h * 0.1], [x + h * 0.16, top + h * 0.03], [x + h * 0.32, top + h * 0.03]], h * 0.025, h * 0.008)].join(' ');
	return <path d={trunkD(x, top + h * 0.08, base, h * 0.04, h * 0.07, seed, h * 0.05) + ' ' + limbs + ' ' + crown} fill={fog(col)} />; };
/** big broad leaves (foreground framing) */
const BigLeaves: React.FC<{x: number; y: number; s: number; seed: number; t: number; col: string; rim?: string; flip?: boolean}> = ({x, y, s, seed, t, col, rim, flip}) => {
	const sw = (i: number) => Math.sin(t * 0.8 + i * 1.3) * 2.5, ds: string[] = [];
	for (let i = 0; i < 7; i++) { const a = (flip ? 180 : 0) + (flip ? 1 : -1) * (40 + i * 18) + sw(i), L = s * (0.7 + 0.5 * rnd(i, seed)), b: P = [x + (rnd(i, seed + 1) - 0.5) * s * 0.3, y];
		const top: P = [b[0] + Math.cos(a * Math.PI / 180) * L * 0.55, b[1] + Math.sin(a * Math.PI / 180) * L * 0.55];
		ds.push(...earLeafD(b, top, L * 0.42, a + (flip ? -20 : 20))); }
	const d = ds.join(' ');
	return <g>{rim && <g transform="translate(-3,-3)"><Shape d={d} fill={rim} o={0.45} /></g>}<Shape d={d} fill={col} /></g>; };

/** the forest wall's crown mass: a canopy ceiling whose left edge breaks into leaf clumps and palm fronds, rim-lit by the sunset on the left */
const WallMass: React.FC<{y: number; seed: number; t: number; x0: number; col: string; rim: string}> = ({y, seed, t, x0, col, rim}) => {
	const fog = useFog(), [mass, fringe] = canopyD(x0, W + 600, y, seed, [], t);
	const edge = Array.from({length: 10}, (_, k) => blobD(x0 - 40 + noise1(k * 0.9, seed) * 50, -40 + k * (y + 40) / 9, 110 + 40 * rnd(k, seed), 70 + 20 * rnd(k, seed + 1), seed + k, 10, 0.3)).join(' ');
	const fr = Array.from({length: 6}, (_, k) => frondD([x0 - 20 + noise1(k, seed + 3) * 30, 40 + k * (y - 40) / 5], 220 + 90 * rnd(k, seed + 2), 175 + 25 * (rnd(k, seed + 4) - 0.5) + Math.sin(t * 0.7 + k) * 2, 45, 70, seed + k, 13).join(' ')).join(' ');
	const d = mass + ' ' + fringe + ' ' + edge + ' ' + fr;
	return <g><g transform="translate(-7,-4)"><Shape d={d} fill={rim} o={0.42} /></g><Shape d={d} fill={fog(col, -0.1)} /></g>; };

/* ======================================================= DARIEN ======================================================= */
const DWALL = {hz: 700, focus: 4.2};
/** the jungle wall at dusk: the clearing (wet grass, puddles holding the sky), the far forest line, the near wall on the right with the trail mouth */
const JungleWall: React.FC<{t: number; cam: Cam; fig: React.ReactNode; swallow?: number}> = ({t, cam, fig, swallow = 0}) => {
	const hz = DWALL.hz;
	return <Stage t={t} cam={cam} atm={{haze: '#7a5a72', density: 0.05, focus: DWALL.focus, aperture: 2.2, rim: '#ffb46e', lightDir: 170, grain: 0.07, vignette: 0.66, pp: [900, hz]}} bg="#120d16">
		<Layer D={INF}>
			<SkyGrad y0={-300} y1={hz + 20} stops={[[0, '#120e2a'], [0.3, '#2c1f48'], [0.55, '#6a3658'], [0.78, '#c4604e'], [0.92, '#f39a58'], [1, '#ffc27a']]} />
			<Sun x={330} y={hz - 40} r={30} c="#ffa45a" bloom={10} bloomO={0.7} />
			<Glow x={330} y={hz - 20} r={900} ry={220} c="#ff8a4a" o={0.4} />
		</Layer>
		<Layer D={60}><path d={`M-600,${hz + 2} ` + Array.from({length: 60}, (_, i) => { const x = -600 + i * 60; return `L${x},${f1(hz - 40 - 30 * Math.abs(noise1(i * 0.7, 3)) - (i % 7 === 3 ? 60 : 0))}`; }).join(' ') + ` L${W + 600},${hz + 2} L${W + 600},${H + 400} L-600,${H + 400} Z`} fill="#4a3048" /></Layer>
		<Layer D={30}>
			<path d={`M-600,${hz + 4} ` + Array.from({length: 70}, (_, i) => { const x = -600 + i * 50; return `L${x},${f1(hz - 60 - 40 * Math.abs(noise1(i * 0.9, 7)))}`; }).join(' ') + ` L${W + 600},${hz + 4} L${W + 600},${H + 400} L-600,${H + 400} Z`} fill="#2a1c30" />
			<FogBand y={hz - 10} h={80} o={0.65} c="#c87a78" /></Layer>
		<Layer D={14}>
			<defs><linearGradient id="a1dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3a3e" /><stop offset="1" stopColor="#1a1418" /></linearGradient></defs>
			<path d={`M-800,${hz + 4} L${W + 800},${hz + 4} L${W + 800},${H + 500} L-800,${H + 500} Z`} fill="url(#a1dg)" />
			<ellipse cx={420} cy={hz + 60} rx={380} ry={22} fill="#e8925a" opacity={0.55} /><ellipse cx={180} cy={hz + 120} rx={260} ry={18} fill="#c86a50" opacity={0.45} />
		</Layer>
		{/* the wall: tall trunks and a canopy mass on the right half, nearer to the camera toward the right edge */}
		<Layer D={9}>
			<TreeBand seed={5} n={16} base={hz + 60} col="#1c1620" w={[22, 60]} top={-200} vines={2} refl={0} skip={[[-300, 980]]} buttress={0.8} />
			<WallMass y={330} seed={11} t={t} x0={1000} col="#140f18" rim="#e8865a" />
			<FogFoot y0={hz - 150} y1={hz + 70} o={0.55} c="#a46070" />
		</Layer>
		<Layer D={6}><Mist n={6} seed={9} y0={hz + 10} y1={hz + 90} t={t} speed={8} o={0.45} c="#c48888" w={[400, 1000]} h={[40, 90]} /></Layer>
		<Layer D={4.6}>
			{/* the trail mouth: a black tunnel in the leaves, framed by a strangler trunk and hanging roots */}
			<path d={spline([[1070, 960], [1080, 640], [1150, 520], [1260, 500], [1350, 560], [1380, 700], [1390, 960]], true)} fill="#050407" />
			<Shape d={trunkD(1440, -200, 980, 120, 190, 21, 90, 0.1) + ' ' + trunkD(1020, -200, 980, 70, 110, 23, 40, 0.15) + ' ' + [hangD([1100, 300], 360, 5, 18), hangD([1180, 260], 300, 4, -12), hangD([1300, 280], 340, 5, 14), lianaD([1000, 120], [1450, 160], 220, 9)].join(' ')} fill="#0b080e" />
			<WallMass y={470} seed={17} t={t} x0={1040} col="#0a080d" rim="#ff9e64" />
			<BigLeaves x={1000} y={980} s={300} seed={3} t={t} col="#0a080c" rim="#ff9e64" flip />
			<BigLeaves x={1560} y={1000} s={360} seed={9} t={t} col="#0a080c" rim="#ff9e64" />
		</Layer>
		<Particles kind="firefly" n={26} seed={12} D={[2.5, 9]} box={[600, 380, 1900, 1000]} c="#e8ff9a" o={0.9} size={1} />
		{fig}
		<Layer D={3.4}><Shape d={tuftD(900, 990, 16, 120, 400, 31, -8) + ' ' + tuftD(300, 1010, 12, 90, 300, 33, 6)} fill="#0c0a0e" /></Layer>
		<Layer D={1.3} blur={10}><BigLeaves x={-60} y={1160} s={620} seed={13} t={t} col="#060508" /><BigLeaves x={1960} y={1180} s={560} seed={17} t={t} col="#060508" flip /></Layer>
		{swallow > 0 && <Wash c="#040306" o={swallow} />}
	</Stage>;
};
/** the will: a ruled sheet on the olive canvas lid of his pack, the pen signing, then folded in half */
const WillInsert: React.FC<{t: number; d: number}> = ({t, d}) => {
	const id = useUid('will'); useHand();
	const sign = cl((t - 0.28) / 0.75), fold = eio((t - 1.2) / 0.5), push = 1 + 0.06 * (t / d);
	const px = 1080, py = 700, pw = 620, ph = 700, rot = -6;
	// the pen tip follows the signature's reveal
	const sx0 = px - 210, sx1 = px + 200, sy = py + 230, tipX = lerp(sx0, sx1, sign) + Math.sin(sign * 38) * 8, tipY = sy - 14 + Math.sin(sign * 52) * 16;
	const penO = 1 - sm((t - 1.05) / 0.2);
	const foldY = py, k = Math.cos(Math.PI * fold);   // the top half's height factor (1 → −1)
	const lines = Array.from({length: 9}, (_, i) => py - ph / 2 + 140 + i * 40);
	const sheet = (<g>
		<rect x={px - pw / 2} y={py - ph / 2} width={pw} height={ph} fill="#efe6d2" />
		{lines.map((y, i) => <line key={i} x1={px - pw / 2 + 40} x2={px + pw / 2 - 40} y1={y} y2={y} stroke="#9ab0c4" strokeWidth={1.4} opacity={0.6} />)}
		<text x={px} y={py - ph / 2 + 100} textAnchor="middle" style={{fontFamily: "'Caveat59', 'DejaVu Serif', serif", fontSize: 58, fontWeight: 500}} fill="#2a2a3a">Last Will &amp; Testament</text>
		{['I, Karl Bushby, being of sound mind,', 'leave everything I own to my family.', 'If I do not come out of the Darién,', 'please tell my son I love him.'].map((s, i) =>
			<text key={i} x={px - pw / 2 + 48} y={lines[i * 2 + 1] - 6} style={{fontFamily: "'Caveat59', 'DejaVu Serif', serif", fontSize: 38}} fill="#2c3448">{s}</text>)}
		<line x1={sx0 - 20} x2={sx1 + 30} y1={sy + 10} y2={sy + 10} stroke="#2a2a3a" strokeWidth={2} />
		<text x={sx0 - 20} y={sy + 44} style={{fontFamily: "'Caveat59', serif", fontSize: 30}} fill="#5a5a68">signed · Colombia, 2001</text>
		<defs><clipPath id={`${id}s`}><rect x={sx0 - 30} y={sy - 90} width={(sx1 - sx0 + 60) * sign} height={130} /></clipPath></defs>
		<text x={sx0} y={sy} clipPath={`url(#${id}s)`} style={{fontFamily: "'Caveat59', serif", fontSize: 86, fontWeight: 500}} fill="#1a2a6a">Karl Bushby</text>
	</g>);
	return <AbsoluteFill style={{background: '#140f0e'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<defs><radialGradient id={`${id}bg`} cx="0.3" cy="0.35" r="0.9"><stop offset="0" stopColor="#5a4430" /><stop offset="0.6" stopColor="#2a2018" /><stop offset="1" stopColor="#0e0a08" /></radialGradient>
				<linearGradient id={`${id}lid`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a5a34" /><stop offset="1" stopColor="#2a2a18" /></linearGradient>
				<clipPath id={`${id}top`}><rect x={-400} y={-400} width={2800} height={foldY + 400} /></clipPath><clipPath id={`${id}bot`}><rect x={-400} y={foldY} width={2800} height={1600} /></clipPath></defs>
			<rect width={W} height={H} fill={`url(#${id}bg)`} />
			<g transform={`translate(960,540) scale(${push.toFixed(4)}) rotate(${(rot + 1.5 * t / d).toFixed(2)}) translate(-960,-540)`}>
				{/* the pack lid: canvas, a strap and buckle, stitching */}
				<path d={spline([[260, 120], [1700, 60], [1820, 600], [1740, 1100], [200, 1120], [120, 560]], true)} fill={`url(#${id}lid)`} />
				<path d={spline([[300, 170], [1660, 112], [1764, 600], [1690, 1060], [250, 1072], [176, 560]], true)} fill="none" stroke="#7a7a4a" strokeWidth={3} strokeDasharray="10 9" opacity={0.6} />
				<rect x={1540} y={40} width={90} height={1100} fill="#2a2a1c" /><rect x={1530} y={520} width={110} height={90} rx={10} fill="none" stroke="#9a9070" strokeWidth={10} />
				<rect x={px - pw / 2 + 14} y={py - ph / 2 + 22} width={pw} height={ph} fill="#000" opacity={0.35} />
				<g clipPath={`url(#${id}bot)`}>{sheet}</g>
				{/* the top half folds over the crease (squashes through zero, its back shows darker) */}
				<g clipPath={k > 0 ? `url(#${id}top)` : `url(#${id}bot)`}><g transform={`translate(0,${foldY}) scale(1,${k.toFixed(4)}) translate(0,${-foldY})`}>{k > 0 ? sheet : <rect x={px - pw / 2} y={py - ph / 2} width={pw} height={ph / 2} fill="#d8cdb6" />}</g></g>
				{fold > 0.02 && fold < 0.98 && <rect x={px - pw / 2} y={foldY - 3} width={pw} height={6} fill="#000" opacity={0.25} />}
				{/* the hand and pen */}
				{penO > 0.01 && <g opacity={penO} transform={`translate(${f1(tipX)},${f1(tipY)}) rotate(-38)`}>
					<rect x={-6} y={-250} width={16} height={240} rx={6} fill="#14161c" /><path d="M-6,-12 L10,-12 L2,6 Z" fill="#c8c0b0" />
					<path d={spline([[-40, -190], [40, -200], [80, -140], [70, -60], [10, -40], [-50, -70], [-70, -140]], true)} fill="#1a1512" />
					<path d="M-60,-150 L-260,-420 L-120,-480 L30,-190 Z" fill="#16201a" /></g>}
			</g>
			<rect width={W} height={H} fill="#ff9050" opacity={0.08} />
		</svg>
	</AbsoluteFill>;
};
const DarienScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const b = beat, cB = 4 * b, cC = 9 * b, shot = shotAt(t, [cB, cC]), h = 1.8 * 1000 / DWALL.focus, ky = DWALL.hz + 1.1 * 1000 / DWALL.focus;
	if (shot === 1) return <WillInsert t={t - cB} d={cC - cB} />;
	// shots A and C share the clearing: a continuous slow push; in C he walks into the trail mouth (fades into its black)
	const u = cl(t / dur), cam = addCam({...CAM0, x: lerp(-30, 90, u), y: lerp(12, -4, u), z: 0.9 * eio(u)}, drift(t, 0.7, 8));
	const tw = Math.max(0, t - cC), tr = karlTravel('walk', tw, h, 1.0), kx = 850 + tr.dx;
	const into = sm((kx - 1110) / 130);
	const fig = shot === 0
		? <FigureSlot x={690} y={ky} h={h} attire="jungle" action="stand" phase={t / 4.2} facing={1} rim="#ffb46e" lightDir={170} rimO={0.9} contact={0.4} />
		: <g opacity={1 - into}><FigureSlot x={kx} y={ky} h={h} attire="jungle" action="walk" phase={tr.phase} facing={1} rim="#ffb46e" lightDir={170} rimO={0.9 * (1 - into)} contact={0.4} /></g>;
	return <JungleWall t={t} cam={cam} fig={fig} swallow={shot === 2 ? 0.92 * ein((t - (dur - 0.45)) / 0.45) : 0} />;
};

/* ======================================================= JUNGLE ======================================================= */
const JF = {focus: 3.2, waterY: 760};
const JBack: React.FC = () => <>
	<SkyGrad stops={[[0, '#3c5a46'], [0.3, '#62806a'], [0.58, '#8fa684'], [0.69, '#b2c294'], [0.7, '#8aa080'], [0.8, '#3f5a46'], [1, '#0f1d16']]} />
	<Glow x={520} y={-40} r={1000} ry={700} c="#f6e09a" o={0.6} /><Glow x={820} y={640} r={560} ry={330} c="#fff0bf" o={0.6} />
</>;
/** the swamp: wading shot */
const Swamp: React.FC<{t: number; cam: Cam; fig: React.ReactNode; vine: number}> = ({t, cam, fig, vine}) => {
	const wy = JF.waterY;
	return <Stage t={t} cam={cam} atm={{haze: '#71957f', density: 0.07, focus: JF.focus, aperture: 2.4, rim: '#ffe7ad', lightDir: 118, grain: 0.07, vignette: 0.66}} bg="#0d1712">
		<Layer D={INF}><JBack /></Layer>
		<Layer D={20}><TreeBand seed={13} n={26} base={wy - 4} col="#3f5f48" w={[14, 40]} refl={0.3} vines={1} /><FogFoot y0={460} y1={wy + 4} o={0.85} c="#c3d2a6" /></Layer>
		<Layer D={11}><TreeBand seed={17} n={12} base={wy + 4} col="#203a2a" w={[34, 80]} skip={[[560, 1000]]} vines={2} buttress={1.2} refl={0.4} /><FogFoot y0={560} y1={wy + 10} o={0.7} c="#c0cfa2" /></Layer>
		<Layer D={7}><Mist n={8} seed={4} y0={wy - 70} y1={wy + 20} t={t} speed={10} o={0.55} c="#e2eac6" /></Layer>
		<Layer D={6} blur={0}><Shafts y0={-60} angle={17} c="#ffe49a" len={1150} t={t} beams={[{x: 360, w: 70, o: 0.5}, {x: 480, w: 170, o: 0.8, spread: 0.7}, {x: 640, w: 70, o: 0.55}, {x: 740, w: 120, o: 0.65, spread: 0.6}, {x: 950, w: 50, o: 0.4}]} /></Layer>
		<Layer D={4.6}>
			<Canopy y={150} seed={19} gaps={[[320, 580], [640, 880]]} t={t} />
			<Shape d={trunkD(150, -200, wy + 20, 160, 220, 21, 120, 0.12) + ' ' + trunkD(1640, -200, wy + 30, 230, 300, 11, 160, 0.08)} fill="#0b1a14" />
			<FPath d={[lianaD([-50, 90], [430, 150], 300, 10), lianaD([840, 90], [1180, 190], 220, 8), hangD([1010, 120], 520, 5, 14)].join(' ')} c="#091615" extra={-0.12} />
		</Layer>
		<Layer D={3.7}>
			<Shape d={ripplesD(wy + 8, 920, 130, 3, -400, W + 400, [30, 200], t, 6)} fill="#eef0cf" o={0.28} />
			<Glow x={800} y={wy + 70} r={300} ry={44} c="#fff3c6" o={0.45} />
		</Layer>
		{/* the vine he cuts: hangs in front of him until the strike, then the lower part drops */}
		<Layer D={JF.focus - 0.05}><path d={hangD([1235, -60], 760 + 0 * vine, 7, 20)} fill="#0e1d15" opacity={1} transform={vine > 0 ? `translate(0,${f1(400 * vine * vine)}) rotate(${f1(10 * vine)} 1235 600)` : undefined} />
			{vine > 0 && <path d={hangD([1235, -60], 560, 7, 20)} fill="#0e1d15" />}</Layer>
		{fig}
		<Particles kind="dust" n={70} seed={11} D={[2, 9]} box={[200, 0, 1250, 820]} c="#fff3c4" o={0.9} size={1.1} />
		<Layer D={2.2}><Shape d={ripplesD(930, 1120, 40, 8, -400, W + 400, [120, 420], t, 10)} fill="#b9c79c" o={0.2} /></Layer>
		<Layer D={1.5}><BigLeaves x={1700} y={1060} s={520} seed={21} t={t} col="#060f0d" rim="#c9cf92" flip /></Layer>
		<Layer D={0.6} blur={8}><Shape d={frondD([-160, 1180], 820, -38, 70, 150, 41, 20).join(' ') + ' ' + frondD([2060, -90], 640, 160, -40, 130, 51, 18).join(' ')} fill="#040805" /></Layer>
	</Stage>;
};
/** mangrove: a trunk rising out of frame with arching prop roots fanning into the water */
const mangroveD = (x: number, wy: number, h: number, seed: number) => {
	const out: string[] = [trunkD(x, -300, wy - h * 0.35, h * 0.08, h * 0.11, seed, 0, 0.2)];
	for (let i = 0; i < 9; i++) { const s = (i - 4) / 4, top: P = [x + s * h * 0.04, wy - h * (0.32 + 0.12 * rnd(i, seed))], foot: P = [x + s * h * (0.32 + 0.2 * rnd(i, seed + 1)), wy + 4], c: P = [lerp(top[0], foot[0], 0.7) + s * h * 0.05, top[1] - h * 0.05];
		out.push(taper(qpts(top, c, foot, 10), h * 0.03, h * 0.014)); }
	return out.join(' '); };
/** the black river at night */
const BlackRiver: React.FC<{t: number; cam: Cam; head: React.ReactNode; croc: number; crocX: number}> = ({t, cam, head, croc, crocX}) => {
	const wy = 600, mx = 1440, my = 330;
	return <Stage t={t} cam={cam} atm={{haze: '#2a3a52', density: 0.05, focus: 4, aperture: 2.0, rim: '#cfe0ff', lightDir: 30, grain: 0.09, vignette: 0.75, pp: [960, wy]}} bg="#05080e">
		<Layer D={INF}>
			<SkyGrad y0={-200} y1={wy + 10} stops={[[0, '#03060c'], [0.5, '#0b1424'], [0.85, '#1c2c44'], [1, '#2c3e58']]} />
			<Glow x={mx} y={my} r={900} ry={600} c="#5a78a8" o={0.45} /><Glow x={mx} y={my} r={260} c="#b8cce8" o={0.5} /><circle cx={mx} cy={my} r={40} fill="#f2f4ee" /><Glow x={mx} y={my} r={90} c="#ffffff" o={0.6} />
			<path d={`M${mx - 140},${my + 30} q120,-26 260,6 q-130,14 -260,-6 Z`} fill="#3a4a66" opacity={0.7} />
		</Layer>
		{/* the far bank: a low black wall of mangroves and its mirror */}
		<Layer D={30}><path d={`M-600,${wy + 2} ` + Array.from({length: 70}, (_, i) => `L${-600 + i * 50},${f1(wy - 70 - 40 * Math.abs(noise1(i * 0.8, 5)))}`).join(' ') + ` L${W + 600},${wy + 2} Z`} fill="#0c1422" />
			<FogBand y={wy - 8} h={60} o={0.6} c="#4a5a76" /></Layer>
		<Layer D={14}>
			<defs><linearGradient id="a1rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2840" /><stop offset="0.25" stopColor="#0a1220" /><stop offset="1" stopColor="#020407" /></linearGradient></defs>
			<rect x={-800} y={wy} width={W + 1600} height={900} fill="url(#a1rv)" />
			<Glow x={mx} y={wy + 260} r={170} ry={480} c="#cfdcf0" o={0.32} />
			<Shape d={ripplesD(wy + 6, wy + 480, 110, 9, mx - 320, mx + 320, [30, 160], t, 8)} fill="#eef4fc" o={0.7} />
		</Layer>
		<Layer D={9}><g transform="translate(5,-3)"><Shape d={mangroveD(260, wy + 30, 520, 3) + ' ' + mangroveD(1760, wy + 28, 480, 7)} fill="#8aa6d0" o={0.35} /></g><Shape d={mangroveD(260, wy + 30, 520, 3) + ' ' + mangroveD(1760, wy + 28, 480, 7)} fill="#03050a" />
			<g opacity={0.35} transform={`translate(0,${2 * (wy + 30)}) scale(1,-1)`}><Shape d={mangroveD(260, wy + 30, 520, 3) + ' ' + mangroveD(1760, wy + 28, 480, 7)} fill="#0c1626" /></g>
			<Mist n={7} seed={3} y0={wy + 10} y1={wy + 80} t={t} speed={14} o={0.5} c="#5a6c8a" w={[500, 1200]} h={[30, 80]} /></Layer>
		<Layer D={5.5}><Shape d={ripplesD(wy + 40, 1000, 90, 4, -400, W + 400, [40, 260], t, 14)} fill="#8aa0c4" o={0.22} /></Layer>
		{/* the crocodile: eyes and nostrils breaking the surface, a V of ripples as it glides */}
		{croc > 0.01 && <Layer D={3.2}><g opacity={cl(croc * 1.3)} transform={`translate(${f1(crocX)},880) scale(1.6) translate(${f1(-crocX)},-880)`}>
			{[0, 1, 2].map((k) => { const r = 30 + 60 * ((t * 0.9 + k / 3) % 1); return <ellipse key={k} cx={crocX} cy={882} rx={r * 2.2} ry={r * 0.32} fill="none" stroke="#9ab0d4" strokeWidth={1.6} opacity={0.45 * (1 - ((t * 0.9 + k / 3) % 1))} />; })}
			<path d={`M${crocX - 300},${885} L${crocX - 40},${882} L${crocX - 300},${893} Z`} fill="#9ab0d4" opacity={0.18} />
			{(() => { const e = croc, y = 884, x = crocX, top = `M${f1(x - 90)},${y} Q${f1(x - 50)},${f1(y - 6 * e)} ${f1(x - 18)},${f1(y - 20 * e)} Q${f1(x + 4)},${f1(y - 30 * e)} ${f1(x + 26)},${f1(y - 18 * e)} Q${f1(x + 44)},${f1(y - 27 * e)} ${f1(x + 66)},${f1(y - 16 * e)} Q${f1(x + 120)},${f1(y - 9 * e)} ${f1(x + 200)},${f1(y - 7 * e)} Q${f1(x + 228)},${f1(y - 13 * e)} ${f1(x + 250)},${f1(y - 6 * e)} Q${f1(x + 270)},${f1(y - 2 * e)} ${f1(x + 280)},${y}`;
				return <g><path d={top + ' Z'} fill="#04060a" /><path d={top} fill="none" stroke="#a8bedf" strokeWidth={2.2} opacity={0.55 * e} />
					<path d={`M${f1(x - 90)},${y + 3} L${f1(x + 280)},${y + 3}`} stroke="#a8bedf" strokeWidth={1.5} opacity={0.35 * e} /></g>; })()}
			<circle cx={crocX + 4} cy={884 - 22 * croc} r={4.5} fill="#ffcf7a" opacity={croc} /><circle cx={crocX + 46} cy={884 - 19 * croc} r={4} fill="#ffcf7a" opacity={croc * 0.8} />
			<Glow x={crocX + 24} y={862} r={70} c="#ffb860" o={0.25 * croc} />
		</g></Layer>}
		{head}
		<Particles kind="firefly" n={14} seed={23} D={[3, 10]} box={[0, 300, W, 700]} c="#d8ff9a" o={0.7} size={0.9} />
		<Layer D={1.6} blur={7}><Shape d={mangroveD(-120, 1100, 1200, 11)} fill="#010204" /><Shape d={hangD([1880, -100], 700, 14, 30) + ' ' + hangD([1820, -100], 520, 9, -20)} fill="#010204" /></Layer>
	</Stage>;
};
/** his head among a raft of drifting branches and leaves (the disguise): Karl floating (only what is above the water shows) */
const Raft: React.FC<{x: number; y: number; h: number; t: number}> = ({x, y, h, t}) => {
	const bob = Math.sin(t * 1.6) * h * 0.006;
	const twigs = [taper([[x - h * 0.5, y + 2], [x - h * 0.1, y - h * 0.02], [x + h * 0.45, y + 4]], h * 0.03, h * 0.012), taper([[x - h * 0.3, y + 6], [x + h * 0.05, y - h * 0.06], [x + h * 0.25, y - h * 0.12]], h * 0.02, h * 0.008),
		...Array.from({length: 9}, (_, i) => leafD([x - h * 0.35 + i * h * 0.09, y - h * 0.01], h * (0.12 + 0.08 * rnd(i, 3)), h * 0.05, -150 + i * 15 + Math.sin(t + i) * 4, 20)),
		...frondD([x - h * 0.05, y - h * 0.02], h * 0.5, -160, 30, h * 0.12, 5, 10), ...frondD([x + h * 0.02, y - h * 0.03], h * 0.45, -30, -30, h * 0.11, 7, 10)].join(' ');
	return <g transform={`translate(0,${f1(bob)})`}>
		<ellipse cx={x} cy={y + 4} rx={h * 0.32} ry={h * 0.03} fill="#cfdcf0" opacity={0.18} />
		<Karl x={x} y={y} h={h} attire="jungle" action="float" phase={t / 1.5} facing={1} rim="#e6eeff" lightDir={20} rimO={1} underO={0} foam="#b8c8e4" waterHi="#7a90b4" />
		<path d={twigs} fill="#06080c" /><g transform="translate(1.5,-1.5)"><path d={twigs} fill="#9ab0d4" opacity={0.18} /></g>
	</g>; };
const JG = PH3.jungle;
const JungleScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const b = beat, cB = 5 * b, shot = shotAt(t, [cB]);
	let pic: React.ReactNode;
	if (shot === 0) {
		const h = 1.8 * 1000 / JF.focus * 0.82, ph = t / KARL_CYCLE.wade.sec + (0.5 - 3 * b / KARL_CYCLE.wade.sec), tr = karlTravel('wade', t, h), kx = 760 + tr.dx * 0.6;
		const u = t / cB, cam = addCam({...CAM0, x: lerp(-40, 30, u), y: lerp(10, -6, u), z: 0.35 * u}, drift(t, 0.9, 3));
		const vine = cl((t - 3 * b - 0.05) / 0.6);
		const fig = <FigureSlot x={kx} y={JF.waterY + h * 0.56} h={h} attire="jungle" action="wade" phase={ph} facing={1} rim="#ffe7ad" lightDir={118} rimO={0.95} foam="#eef0cf" waterHi="#c9d4b0" underO={0.25} />;
		pic = <Swamp t={t} cam={cam} fig={fig} vine={vine} />;
	} else {
		const ts = t - cB, d2 = dur - cB, u = cl(ts / d2), h = 1050, x = 1080 + 36 * ts, y = 800;
		const cam = addCam({...CAM0, x: lerp(-20, 50, u), y: lerp(-10, 6, u), z: 0.6 * u}, drift(ts, 0.6, 6));
		const croc = sm((ts - 3 * b) / (0.9 * b)), crocX = 560 + 70 * ts;
		pic = <BlackRiver t={ts} cam={cam} croc={croc} crocX={crocX} head={<HeadSlot x={x} y={y} h={h} t={ts} />} />;
	}
	return <AbsoluteFill>
		{pic}
		<Print3 src={JG.src} pos={JG.pos} aspect={JG.aspect} t={t - 2 * b} dur={2.0} w={380} cx={1410} cy={450} rot={-3} from="right" caption="2001 · 达连隘口" />
		{shot === 1 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Wash c="#ffffff" o={0.12 * hit(t, cB + 3 * b + 0.05, 0.15)} /></svg>}
	</AbsoluteFill>;
};
/** the floating head placed at the stage's focus depth (so it parallaxes with the river) */
const HeadSlot: React.FC<{x: number; y: number; h: number; t: number}> = ({x, y, h, t}) => <Layer D={4}><Raft x={x} y={y} h={h} t={t} /></Layer>;

export const ACT1C: Record<'darien' | 'jungle', SceneDef> = {
	darien: {C: DarienScene},
	jungle: {C: JungleScene},
};
