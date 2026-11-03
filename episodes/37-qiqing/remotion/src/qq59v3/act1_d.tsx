/* ep59 v3 · act 1, scenes journal / jail / bowl / alaska.
   journal : night in the Darién: a headlamp beam on his journal; the pen writes "This could be the last day of my life."; moths in the beam.
   jail    : A) out of the trees into torch beams and rifle silhouettes (threat only);  B) a cell: the barred door rolls shut, its shadows
             sweep across him; tally marks scratched on the wall on the beats, 18 of them.
   bowl    : the crowded cell under a bare bulb; across the plank table a cellmate slides his bigger bowl over to him.
   alaska  : blue night, aurora, black spruce, diamond dust; he pushes the winter cart, breath freezing; a frosted thermometer falls to −51 °C. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Layer, Shape, FigureSlot, Particles, Mist, FogFoot, FogBand, Glow, SkyGrad, INF, W, H, P, f1, lerp, rnd, cl, sm, eio, mix, poly, spline, taper, qpts, noise1,
	useUid, Cam, CAM0, addCam, drift, GOLD, karlTravel, Shafts} from './kit3';
import {figParts, grounded, Look59, jointAt, Pose} from '../qq59/figure59';
import {Karl} from './karl3';
import {trunkD, leafD, frondD, hangD, tuftD, forestD, coniferD, blobD, earLeafD, personD} from './props3';
import type {SceneProps, SceneDef} from './EP59V3';
import {hit, ein, eout, shotAt, Wash, useHand} from './act1_kit';

/* ======================================================= JOURNAL ======================================================= */
const LINE: [string, string] = ['This could be the', 'last day of my life.'];
const JournalScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	useHand();
	const id = useUid('jr'), b = beat, u = cl(t / dur), push = 1 + 0.07 * eio(u), rot = -8 + 2.5 * u;
	// the line writes from beat 1 to beat 5 (two rows); the full stop lands on beat 5 with a flicker of the lamp
	const wr = cl((t - 1 * b) / (4 * b)), w1 = cl(wr / 0.48), w2 = cl((wr - 0.52) / 0.48), flick = hit(t, 5 * b, 0.12);
	const px = 1130, py = 700, r1 = 650, r2 = 742, x0 = 690, x1a = 1330, x1b = 1440;
	const onRow2 = wr > 0.5, tipX = onRow2 ? lerp(x0, x1b, w2) : lerp(x0, x1a, w1), tipY = (onRow2 ? r2 : r1) - 14 + Math.sin(wr * 140) * 9;
	const lamp = 0.94 + 0.06 * Math.sin(t * 23) * Math.sin(t * 7) - 0.3 * flick;
	const moths = Array.from({length: 6}, (_, i) => { const ph = t * (2.2 + rnd(i, 3) * 2) + i * 2.1, r = 110 + 120 * rnd(i, 4), cx = 900 + 500 * rnd(i, 5) + Math.cos(ph) * r, cy = 330 + 160 * rnd(i, 6) + Math.sin(ph * 1.3) * r * 0.5, wing = Math.abs(Math.sin(t * 30 + i));
		return <g key={i} transform={`translate(${f1(cx)},${f1(cy)})`} opacity={0.8}><ellipse cx={-5} cy={0} rx={9} ry={3 + 6 * wing} fill="#fff4d8" opacity={0.75} /><ellipse cx={5} cy={0} rx={9} ry={3 + 6 * wing} fill="#fff4d8" opacity={0.75} /><Glow x={0} y={0} r={24} c="#fff0c0" o={0.35} /></g>; });
	const txt = (s: string, y: number, w: number, k: number) => <g key={k}><defs><clipPath id={`${id}w${k}`}><rect x={x0 - 30} y={y - 100} width={(w > 0 ? 40 : 0) + (k ? x1b - x0 : x1a - x0) * w} height={150} /></clipPath></defs>
		<text x={x0} y={y} clipPath={`url(#${id}w${k})`} style={{fontFamily: "'Caveat59', serif", fontSize: 92, fontWeight: 600}} fill="#141c48">{s}</text></g>;
	return <AbsoluteFill style={{background: '#030408'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<defs>
				<radialGradient id={`${id}dark`} gradientUnits="userSpaceOnUse" cx={1080} cy={690} r={760}><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.45" stopColor="#000" stopOpacity="0.05" /><stop offset="0.75" stopColor="#000" stopOpacity="0.7" /><stop offset="1" stopColor="#000" stopOpacity="0.95" /></radialGradient>
				<radialGradient id={`${id}warm`} gradientUnits="userSpaceOnUse" cx={1080} cy={690} r={520}><stop offset="0" stopColor="#fff2cc" stopOpacity="0.35" /><stop offset="1" stopColor="#ffcf80" stopOpacity="0" /></radialGradient>
				<linearGradient id={`${id}beam`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff4d8" stopOpacity="0.4" /><stop offset="1" stopColor="#fff4d8" stopOpacity="0" /></linearGradient>
			</defs>
			{/* the dark around: fronds at the edges, fireflies far off */}
			<path d={frondD([-120, 1150], 900, -50, 60, 170, 3, 18).join(' ')} fill="#0a120e" />
			<path d={frondD([1980, -80], 700, 150, -40, 140, 9, 16).join(' ')} fill="#08100c" />
			{Array.from({length: 16}, (_, i) => { const bl = Math.pow(Math.max(0, Math.sin(t * (0.8 + rnd(i, 7)) + i * 3)), 3); return <Glow key={i} x={rnd(i, 8) * W} y={60 + rnd(i, 9) * 380} r={18} c="#d8ff9a" o={0.5 * bl} />; })}
			<g transform={`translate(${px},${py}) scale(${push.toFixed(4)}) rotate(${rot.toFixed(2)}) translate(${-px},${-py})`}>
				{/* one page of the journal, the gutter and the facing page falling into shadow at the left */}
				<path d={`M${px - 1500},${py - 330} L${px - 560},${py - 360} L${px - 560},${py + 560} L${px - 1500},${py + 560} Z`} fill="#b8aa8c" />
				<path d={`M${px - 560},${py - 360} Q${px},${py - 400} ${px + 620},${py - 350} L${px + 640},${py + 560} L${px - 560},${py + 560} Z`} fill="#e9dec4" />
				<rect x={px - 600} y={py - 380} width={90} height={960} fill="#4a3a20" opacity={0.3} />
				{Array.from({length: 13}, (_, i) => <line key={i} x1={px - 520} x2={px + 600} y1={py - 250 + i * 92 * 0.5 + (i > 5 ? 0 : 0)} y2={py - 250 + i * 92 * 0.5} stroke="#8aa0b4" strokeWidth={1.4} opacity={0.4} />)}
				{['14 Jan — swamp all day, waist deep.', 'No trail. Leeches. Heard voices at dusk.'].map((s, i) =>
					<text key={i} x={x0} y={py - 210 + i * 46} style={{fontFamily: "'Caveat59', serif", fontSize: 40}} fill="#3a4258" opacity={0.7}>{s}</text>)}
				{txt(LINE[0], r1, w1, 0)}{txt(LINE[1], r2, w2, 1)}
				{/* the hand: a fist lit by the headlamp, the pen, the sleeve */}
				<g transform={`translate(${f1(tipX)},${f1(tipY)})`} opacity={1 - sm((t - 5.4 * b) / 0.3)}>
					<path d="M60,40 L330,330 L560,330 L300,20 Z" fill="#232a1c" />
					<path d={spline([[10, -20], [70, -60], [130, -40], [150, 20], [110, 70], [40, 64], [0, 20]], true)} fill="#b88a68" />
					<path d={spline([[60, -50], [120, -36], [140, 14], [108, 58], [80, 30]], true)} fill="#8a6044" opacity={0.6} />
					<path d="M0,0 L10,-8 L120,-190 L132,-182 L22,4 Z" fill="#14161c" /><path d="M0,0 L10,-8 L4,4 Z" fill="#d8d0c0" />
					<path d={spline([[-4, -14], [36, -40], [60, -30], [40, -6], [8, 6]], true)} fill="#c69a76" />
				</g>
			</g>
			<rect width={W} height={H} fill={`url(#${id}warm)`} opacity={lamp} />
			<path d={`M-200,-200 L700,-200 L1500,980 L560,1100 Z`} fill={`url(#${id}beam)`} opacity={0.18 * lamp} />
			<g>{moths}</g>
			<rect width={W} height={H} fill={`url(#${id}dark)`} />
			<Wash c="#000" o={0.35 * flick} />
		</svg>
	</AbsoluteFill>;
};

/* ======================================================= JAIL ======================================================= */
/** a soldier silhouette aiming a rifle (figure59 pose + a rifle), with a torch on the barrel */
const aimPose: Pose = grounded({lean: 4, neck: 6, lt: 8, lk: 8, rt: -10, rk: 6, la: 82, le: 4, ra: 70, re: 40});
const Soldier: React.FC<{x: number; y: number; h: number; seed: number; flip?: boolean}> = ({x, y, h, flip}) => {
	const look: Look59 = {dress: 'jacket', head: 'cap', build: 1.08};
	const parts = figParts(x, y, h, aimPose, look).map((q) => q.d).join(' ');
	const hand = jointAt(aimPose, 'LHand', x, y, h, flip), sh = jointAt(aimPose, 'Neck1', x, y, h, flip), dir = flip ? -1 : 1;
	const rifle = poly([[sh[0] - dir * h * 0.06, sh[1] + h * 0.05], [hand[0] + dir * h * 0.42, hand[1] - h * 0.015], [hand[0] + dir * h * 0.42, hand[1] + h * 0.012], [sh[0] - dir * h * 0.02, sh[1] + h * 0.11]]);
	return <g><g transform={flip ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><path d={parts} fill="#06070a" /></g><path d={rifle} fill="#06070a" /></g>;
};
const JailOut: React.FC<{t: number; cam: Cam; kx: number}> = ({t, cam, kx}) => {
	const hz = 690, h = 520, ky = 975;
	const torches: [number, number, number][] = [[1500, 600, 0], [1690, 640, 1], [1310, 625, 2]];
	return <Stage t={t} cam={cam} atm={{haze: '#1c2a3a', density: 0.05, focus: 4, aperture: 2, rim: '#e6efff', lightDir: 5, grain: 0.09, vignette: 0.8}} bg="#03050a">
		<Layer D={INF}><SkyGrad stops={[[0, '#020409'], [0.5, '#081220'], [1, '#0e1a28']]} /></Layer>
		<Layer D={14}><path d={trunkD(200, -200, hz + 80, 60, 90, 3) + ' ' + trunkD(520, -200, hz + 80, 40, 70, 5) + ' ' + trunkD(980, -200, hz + 80, 50, 80, 7)} fill="#0a121c" />
			<FogBand y={hz} h={160} o={0.5} c="#24364c" /></Layer>
		<Layer D={6}><Mist n={6} seed={5} y0={hz - 40} y1={hz + 80} t={t} speed={6} o={0.4} c="#3a5068" /></Layer>
		{/* torch beams from the soldiers toward him, dust swimming in them */}
		<Layer D={4.2}>{torches.map(([x, y, i]) => { const ang = Math.atan2(ky - 330 - y, kx - x), sw = Math.sin(t * (1.4 + i * 0.4) + i) * 0.05, a = ang + sw, L = 1500;
			const p1: P = [x + Math.cos(a - 0.09) * L, y + Math.sin(a - 0.09) * L], p2: P = [x + Math.cos(a + 0.09) * L, y + Math.sin(a + 0.09) * L];
			return <g key={i}><path d={poly([[x, y], p1, p2])} fill="#dfe8ff" opacity={0.13} /><path d={poly([[x, y], [x + Math.cos(a - 0.035) * L, y + Math.sin(a - 0.035) * L], [x + Math.cos(a + 0.035) * L, y + Math.sin(a + 0.035) * L]])} fill="#f4f8ff" opacity={0.12} />
				<Glow x={x} y={y} r={70} c="#ffffff" o={0.9} /><Glow x={x} y={y} r={260} c="#cfe0ff" o={0.35} /></g>; })}</Layer>
		<Layer D={4.4}><Soldier x={1560} y={ky - 40} h={400} seed={1} flip /><Soldier x={1760} y={ky - 20} h={420} seed={2} flip /><Soldier x={1370} y={ky - 30} h={390} seed={3} flip /></Layer>
		<Particles kind="dust" n={60} seed={41} D={[2.5, 7]} box={[500, 300, 1600, 1000]} c="#e6efff" o={0.7} size={1.1} />
		{/* he steps out of the trees: the leaves part around him (they hide his hands) */}
		<FigureSlot x={kx} y={ky} h={h} attire="jungle" action="walk" phase={karlTravel('walk', t, h, 0.55).phase} facing={1} rim="#eef4ff" lightDir={5} rimO={1} />
		<Layer D={3.6}>{(() => { const bush = [...Array.from({length: 9}, (_, i) => blobD(300 + i * 92, 905 + rnd(i, 2) * 50, 120 + 40 * rnd(i, 3), 115, 40 + i, 10, 0.3)),
			...Array.from({length: 18}, (_, i) => leafD([290 + i * 44, 850 + rnd(i, 5) * 50], 130 + 60 * rnd(i, 6), 48, -90 + (rnd(i, 7) - 0.5) * 120 + Math.sin(t * 1.2 + i) * 3, (rnd(i, 8) - 0.5) * 60)), 'M200,960 L1150,960 L1150,1200 L200,1200 Z'].join(' ');
			return <g><g transform="translate(3,-3)"><Shape d={bush} fill="#9ab0d4" o={0.2} /></g><Shape d={bush} fill="#040608" /></g>; })()}
			<path d={frondD([60, 1100], 900, -70, 50, 160, 7, 18).join(' ') + ' ' + trunkD(150, -200, 1100, 110, 150, 9)} fill="#030406" /></Layer>
	</Stage>;
};
/** the cell: a concrete wall lit from the corridor, the barred door's shadows sliding across, tally marks scratched on the wall */
const CellWall: React.FC<{close: number; marks: number; kx: number; ky: number; h: number; tt: number}> = ({close, marks, kx, ky, h, tt}) => {
	const id = useUid('cw');
	const off = lerp(2100, 0, close);   // the shadow pattern's offset (slides in from the right as the door rolls shut)
	const bars = Array.from({length: 13}, (_, i) => { const x = off + 60 + i * 150; return `M${f1(x)},-50 L${f1(x + 46)},-50 L${f1(x + 46 + 260)},${H + 50} L${f1(x + 260)},${H + 50} Z`; }).join(' ');
	const tally = Array.from({length: 18}, (_, i) => { const k = cl(marks - i); if (k <= 0) return null; const g = Math.floor(i / 5), j = i % 5, x0 = 230 + g * 150, y0 = 600;
		if (j < 4) { const x = x0 + j * 26 + rnd(i, 3) * 6; return <path key={i} d={taper([[x, y0], [x + 3, y0 + 120 * k]], 6, 4)} fill="#d8d2c4" opacity={0.85} />; }
		return <path key={i} d={taper([[x0 - 14, y0 + 100], [x0 - 14 + 124 * k, y0 + 100 - 84 * k]], 6, 4)} fill="#d8d2c4" opacity={0.85} />; });
	return <AbsoluteFill style={{background: '#0d0c0e'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<defs><radialGradient id={`${id}l`} cx="0.62" cy="0.38" r="0.75"><stop offset="0" stopColor="#7a6a58" /><stop offset="0.5" stopColor="#4a4038" /><stop offset="1" stopColor="#141210" /></radialGradient>
				<clipPath id={`${id}c`}><rect x={-60} y={-60} width={W + 120} height={H + 120} /></clipPath></defs>
			<rect width={W} height={H} fill={`url(#${id}l)`} />
			{/* concrete: stains and cracks */}
			{Array.from({length: 14}, (_, i) => <ellipse key={i} cx={rnd(i, 3) * W} cy={rnd(i, 4) * H} rx={60 + 160 * rnd(i, 5)} ry={30 + 90 * rnd(i, 6)} fill="#000" opacity={0.08 + 0.08 * rnd(i, 7)} />)}
			<path d="M1210,0 L1190,140 L1230,260 L1200,380 M380,1080 L420,940 L390,860" stroke="#1e1a18" strokeWidth={3} fill="none" opacity={0.6} />
			<g>{tally}</g>
		</svg>
		<AbsoluteFill><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><FigureSlotLite kx={kx} ky={ky} h={h} t={tt} /></svg></AbsoluteFill>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={bars} fill="#000" opacity={0.55} />
			<rect width={W} height={H} fill="#000" opacity={0.15 * close} />
		</svg>
	</AbsoluteFill>;
};
/** Karl in the cell (cropped at the waist by the frame: his hands are out of shot) */
const FigureSlotLite: React.FC<{kx: number; ky: number; h: number; t: number}> = ({kx, ky, h, t}) => <Karl x={kx} y={ky} h={h} attire="jungle" action="stand" phase={t / 4.2 + 0.3} facing={-1} rim="#ffd9a8" lightDir={20} rimO={0.9} />;
const JailScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const b = beat, cB = 4 * b, shot = shotAt(t, [cB]);
	if (shot === 0) {
		const u = t / cB, cam = addCam({...CAM0, x: lerp(-20, 30, u), z: 0.25 * u}, drift(t, 0.8, 2)), kx = 600 + karlTravel('walk', t, 520, 0.55).dx;
		return <JailOut t={t} cam={cam} kx={kx} />;
	}
	const ts = t - cB, close = eio(ts / b), clank = hit(ts, b, 0.1);
	// 18 marks: three per beat from beat 6 (the line 「被关了18天」) to beat 11
	// 18 marks scratched in five bursts, one per beat from beat 5 (the door's clank): 4, 4, 4, 3, 3
	const CUM = [0, 4, 8, 12, 15, 18], k = Math.max(0, Math.min(4, Math.floor((t - 5 * b) / b + 1e-6))), n = t < 5 * b ? 0 : CUM[k] + (CUM[k + 1] - CUM[k]) * eout((t - (5 + k) * b) / (0.5 * b));
	const push = 1 + 0.05 * (ts / (dur - cB));
	return <AbsoluteFill style={{transform: `scale(${push.toFixed(4)}) translate(${f1(3 * clank * Math.sin(ts * 90))}px, 0)`}}>
		<CellWall close={close} marks={n} kx={1180} ky={1540} h={1180} tt={t} />
	</AbsoluteFill>;
};

/* ======================================================= BOWL ======================================================= */
const BowlScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const id = useUid('bw'), b = beat, u = cl(t / dur);
	// the slide: he reaches on beat 2, pushes on beat 3, the bowl stops before Karl on beat 4
	const reach = eio((t - 1.5 * b) / (1.2 * b)), slide = eout((t - 3 * b) / (1.1 * b));
	const tableY = 880, cmX = 1400, cmY = 1430, cmH = 980;
	const pose = grounded({lean: 14 + 10 * reach, neck: 10, lt: 2, lk: 4, rt: -4, rk: 4, la: lerp(30, 76, reach * 0.4 + slide * 0.6), le: lerp(70, 8, reach * 0.4 + slide * 0.6), ra: 8, re: 40});
	const look: Look59 = {dress: 'shirt', head: 'short', beard: 'stubble', build: 1.0};
	const cm = figParts(cmX, cmY, cmH, pose, look).map((q) => q.d).join(' '), hand = jointAt(pose, 'LHand', cmX, cmY, cmH, true);
	const bigX = lerp(1200, 880, slide), steamT = t;
	const bowl = (x: number, y: number, r: number, k: number) => <g key={`${x}`}>
		<ellipse cx={x} cy={y + r * 0.05} rx={r * 1.15} ry={r * 0.22} fill="#000" opacity={0.4} />
		<path d={`M${f1(x - r)},${f1(y - r * 0.55)} Q${f1(x - r * 0.95)},${f1(y + r * 0.1)} ${f1(x - r * 0.4)},${f1(y)} L${f1(x + r * 0.4)},${f1(y)} Q${f1(x + r * 0.95)},${f1(y + r * 0.1)} ${f1(x + r)},${f1(y - r * 0.55)} Z`} fill="#6a6660" />
		<ellipse cx={x} cy={y - r * 0.55} rx={r} ry={r * 0.2} fill="#8a857c" /><ellipse cx={x} cy={y - r * 0.53} rx={r * 0.88} ry={r * 0.15} fill="#a8783c" />
		{Array.from({length: 3}, (_, i) => { const ph = ((steamT * 0.5 + i / 3 + k) % 1); return <path key={i} d={`M${f1(x - r * 0.3 + i * r * 0.3)},${f1(y - r * 0.6 - ph * r * 1.6)} q${f1(r * 0.15)},${f1(-r * 0.3)} 0,${f1(-r * 0.6)}`} stroke="#f4ead8" strokeWidth={r * 0.08} fill="none" opacity={0.35 * Math.sin(Math.PI * ph)} strokeLinecap="round" />; })}
	</g>;
	return <AbsoluteFill style={{background: '#0b0908'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			<defs><radialGradient id={`${id}l`} cx="0.5" cy="0.28" r="0.7"><stop offset="0" stopColor="#7a5a38" /><stop offset="0.45" stopColor="#3a2a1e" /><stop offset="1" stopColor="#0c0907" /></radialGradient>
				<linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4a2c" /><stop offset="1" stopColor="#2a1c12" /></linearGradient></defs>
			<g transform={`translate(960,540) scale(${(1 + 0.05 * u).toFixed(4)}) translate(-960,-540)`}>
				<rect x={-60} y={-60} width={W + 120} height={H + 120} fill={`url(#${id}l)`} />
				{/* the back wall: bars of a window high up with moonlight, bunks and the other men (soft) */}
				<g opacity={0.9}>
					<rect x={250} y={150} width={330} height={210} fill="#1e2a3a" />{Array.from({length: 6}, (_, i) => <rect key={i} x={262 + i * 56} y={150} width={14} height={210} fill="#120e0c" />)}
					<path d="M250,360 L580,360 L760,1080 L120,1080 Z" fill="#8aa0c0" opacity={0.06} />
					<rect x={-40} y={520} width={620} height={26} fill="#1a120c" /><rect x={-40} y={300} width={620} height={22} fill="#1a120c" />
					<path d={[personD(90, 900, 520, 3), personD(260, 920, 470, 5), personD(1640, 900, 500, 7), personD(1820, 930, 540, 9), personD(1000, 820, 300, 11)].join(' ')} fill="#1a120c" opacity={0.85} />
					<path d={[personD(90, 900, 520, 3), personD(1820, 930, 540, 9)].join(' ')} fill="#ffb860" opacity={0.08} transform="translate(-3,-3)" />
				</g>
				{/* the bulb */}
				<line x1={960} y1={-20} x2={960} y2={120} stroke="#120c08" strokeWidth={4} /><Glow x={960} y={140} r={760} c="#ffb860" o={0.45} /><Glow x={960} y={140} r={60} c="#fff2c8" o={1} /><circle cx={960} cy={140} r={16} fill="#fffaf0" />
				{/* the cellmate */}
				<g transform={`translate(${2 * cmX - 4},-3) scale(-1,1)`}><path d={cm} fill="#ffc27a" opacity={0.5} /></g>
				<g transform={`translate(${2 * cmX},0) scale(-1,1)`}><path d={cm} fill="#100c0a" /></g>
				{/* Karl, waist-up behind the table on the left, facing him */}
				<Karl x={520} y={1430} h={1010} attire="jungle" action="stand" phase={t / 4.2 + 0.1} facing={1} rim="#ffc27a" lightDir={60} rimO={0.95} />
				{/* the table */}
				<path d={`M-60,${tableY} L${W + 60},${tableY - 20} L${W + 60},${H + 60} L-60,${H + 60} Z`} fill={`url(#${id}t)`} />
				<path d={`M-60,${tableY} L${W + 60},${tableY - 20} L${W + 60},${tableY - 12} L-60,${tableY + 8} Z`} fill="#b0844c" opacity={0.6} />
				{Array.from({length: 7}, (_, i) => <path key={i} d={`M-60,${tableY + 40 + i * 32} L${W + 60},${tableY + 22 + i * 32}`} stroke="#1a1008" strokeWidth={2} opacity={0.5} />)}
				{bowl(780, tableY + 14, 56, 0.2)}
				{bowl(bigX, tableY + 4, 92, 0.6)}
				{/* his hand on the big bowl until it lets go */}
				<g opacity={1 - sm((t - 4.4 * b) / (0.5 * b))}><ellipse cx={bigX + 70} cy={tableY - 40} rx={34} ry={22} fill="#120c0a" /><path d={taper([[bigX + 80, tableY - 40], [hand[0] + 40, hand[1] - 10]], 40, 46)} fill="#120c0a" /></g>
				<Glow x={760} y={tableY - 30} r={300} ry={90} c="#ffb860" o={0.25 + 0.25 * slide} />
			</g>
			<radialGradient id={`${id}v`} cx="0.5" cy="0.45" r="0.7"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.75" /></radialGradient>
			<rect width={W} height={H} fill={`url(#${id}v)`} />
		</svg>
	</AbsoluteFill>;
};

/* ======================================================= ALASKA ======================================================= */
const AF = 5.2, AHZ = 640;
/** aurora curtains: soft vertical rays along a wavy band, green fading to violet at the top */
const Aurora: React.FC<{t: number}> = ({t}) => {
	const id = useUid('au');
	return <g><defs><linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7dffb0" stopOpacity="0.85" /><stop offset="0.35" stopColor="#3cd890" stopOpacity="0.45" /><stop offset="0.75" stopColor="#7a4ad0" stopOpacity="0.18" /><stop offset="1" stopColor="#7a4ad0" stopOpacity="0" /></linearGradient></defs>
		{Array.from({length: 70}, (_, i) => { const u = i / 69, x = lerp(-100, W + 100, u), base = 330 + 120 * Math.sin(u * 4.2 + t * 0.25) + 50 * Math.sin(u * 11 + t * 0.6), len = 220 + 160 * (0.5 + 0.5 * Math.sin(u * 7 + t * 0.8)), w = 40 + 30 * rnd(i, 3);
			return <rect key={i} x={f1(x)} y={f1(base - len)} width={f1(w)} height={f1(len)} fill={`url(#${id})`} opacity={(0.25 + 0.35 * Math.pow(0.5 + 0.5 * Math.sin(u * 23 + t * 1.3 + i), 2)).toFixed(3)} />; })}</g>; };
/** the thermometer on a post: a glass tube with a red column, the scale, a frosted plate; v = the reading (°C) */
const Thermo: React.FC<{v: number; o: number; pulse: number}> = ({v, o, pulse}) => {
	const id = useUid('th'), x = 1440, y0 = 300, y1 = 860, tmin = -60, tmax = 30, ty = (c: number) => lerp(y1, y0, (c - tmin) / (tmax - tmin));
	return <g opacity={o}>
		<defs><linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2a22" /><stop offset="0.5" stopColor="#5a4434" /><stop offset="1" stopColor="#2a1e18" /></linearGradient>
			<linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dfe8f4" stopOpacity="0.5" /><stop offset="0.4" stopColor="#ffffff" stopOpacity="0.15" /><stop offset="1" stopColor="#b8c8dc" stopOpacity="0.45" /></linearGradient></defs>
		<rect x={x - 26} y={y0 - 120} width={52} height={1100} fill={`url(#${id}p)`} />
		<rect x={x - 110} y={y0 - 70} width={220} height={y1 - y0 + 190} rx={18} fill="#d8e2ec" />
		<rect x={x - 110} y={y0 - 70} width={220} height={y1 - y0 + 190} rx={18} fill="#9ab0c8" opacity={0.25} />
		{Array.from({length: 10}, (_, i) => { const c = tmin + i * 10, yy = ty(c); return <g key={i}><line x1={x - 62} x2={x - 30} y1={yy} y2={yy} stroke="#1a2230" strokeWidth={3} />
			<text x={x - 70} y={yy + 9} textAnchor="end" style={{fontFamily: "'Inter', 'DejaVu Sans', sans-serif", fontWeight: 600, fontSize: 24}} fill="#1a2230">{c}</text></g>; })}
		{Array.from({length: 46}, (_, i) => { const yy = ty(tmin + i * 2); return <line key={i} x1={x - 44} x2={x - 30} y1={yy} y2={yy} stroke="#1a2230" strokeWidth={1.5} />; })}
		<rect x={x - 16} y={y0 - 30} width={32} height={y1 - y0 + 60} rx={16} fill="#eef4fa" /><rect x={x - 16} y={y0 - 30} width={32} height={y1 - y0 + 60} rx={16} fill={`url(#${id}g)`} />
		<rect x={x - 8} y={ty(v)} width={16} height={y1 + 40 - ty(v)} fill="#c8282a" /><circle cx={x} cy={y1 + 52} r={30} fill="#c8282a" /><circle cx={x - 9} cy={y1 + 44} r={8} fill="#ff8a7a" opacity={0.7} />
		<text x={x + 40} y={ty(-50) + 12} style={{fontFamily: "'Inter', 'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 26}} fill="#1a2230">°C</text>
		{/* frost on the plate */}
		{Array.from({length: 26}, (_, i) => <circle key={i} cx={x - 105 + rnd(i, 3) * 210} cy={y0 - 65 + rnd(i, 4) * (y1 - y0 + 180)} r={3 + 9 * rnd(i, 5)} fill="#ffffff" opacity={0.25 + 0.4 * rnd(i, 6)} />)}
		{/* the reading */}
		<g transform={`translate(${x - 150},${ty(-51)})`}><path d="M0,0 L-34,-18 L-34,18 Z" fill={GOLD} /><text x={-48} y={22} textAnchor="end" style={{fontFamily: "'Inter Display', 'DejaVu Sans', sans-serif", fontWeight: 800, fontSize: 64}} fill="#ffffff" stroke="rgba(8,10,20,0.75)" strokeWidth={8} paintOrder="stroke">{`−${Math.round(-Math.min(0, v))}°C`}</text>
			<Glow x={-130} y={0} r={160} c="#bfe0ff" o={0.35 * pulse} /></g>
	</g>; };
const AlaskaScene: React.FC<SceneProps> = ({t, dur, beat}) => {
	const b = beat, u = cl(t / dur), h = 1.8 * 1000 / AF, tr = karlTravel('pushCart', t + 1, h, 0.45), kx = 250 + tr.dx, ky = AHZ + 1.2 * 1000 / AF;
	const cam = addCam({...CAM0, x: lerp(-30, 60, u), y: lerp(10, -10, u), z: 0.45 * u}, drift(t, 0.6, 9));
	// the reading falls from −20 to −51 between beats 1 and 3, a cold pulse when it lands
	const v = lerp(-20, -51, eout((t - b) / (2 * b))), pulse = hit(t, 3 * b, 0.3);
	return <AbsoluteFill>
		<Stage t={t} cam={cam} atm={{haze: '#3a4e78', density: 0.04, focus: AF, aperture: 1.8, rim: '#bfe0ff', lightDir: 70, grain: 0.08, vignette: 0.7, pp: [960, AHZ]}} bg="#050a18">
			<Layer D={INF}>
				<SkyGrad y0={-300} y1={AHZ + 20} stops={[[0, '#02040c'], [0.45, '#0a1630'], [0.8, '#1a3058'], [1, '#2e4a78']]} />
				{Array.from({length: 120}, (_, i) => <circle key={i} cx={rnd(i, 3) * W} cy={rnd(i, 4) * (AHZ - 100)} r={0.6 + 1.4 * rnd(i, 5) ** 3} fill="#eef4ff" opacity={(0.3 + 0.6 * rnd(i, 6)) * (0.7 + 0.3 * Math.sin(t * 3 + i))} />)}
				<Aurora t={t} />
			</Layer>
			<Layer D={60}><path d={forestD(-600, W + 600, AHZ + 4, 60, 22, 5, AHZ + 500)} fill="#0e1a30" /><FogBand y={AHZ} h={60} o={0.5} c="#4a6a98" /></Layer>
			<Layer D={24}>
				<defs><linearGradient id="a1sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8aa4cc" /><stop offset="0.4" stopColor="#5a7aa8" /><stop offset="1" stopColor="#2a3c60" /></linearGradient></defs>
				<path d={`M-800,${AHZ + 6} L${W + 800},${AHZ + 6} L${W + 800},${H + 600} L-800,${H + 600} Z`} fill="url(#a1sn)" />
				<path d={forestD(-600, 500, AHZ + 20, 150, 34, 9, AHZ + 22) + ' ' + forestD(1250, W + 600, AHZ + 16, 130, 30, 11, AHZ + 18)} fill="#0a1426" />
			</Layer>
			<Layer D={11}><path d={[coniferD(120, AHZ + 70, 420, 120, 3), coniferD(250, AHZ + 74, 330, 100, 5), coniferD(1720, AHZ + 70, 400, 120, 7)].join(' ')} fill="#060c18" />
				<path d={[coniferD(120, AHZ + 70, 420, 120, 3), coniferD(1720, AHZ + 70, 400, 120, 7)].join(' ')} fill="#cfe0ff" opacity={0.12} transform="translate(3,-2)" /></Layer>
			<Layer D={8}><path d={`M-400,${AHZ + 150} Q600,${AHZ + 110} 1200,${AHZ + 140} T2400,${AHZ + 120}`} stroke="#c8dcf4" strokeWidth={3} fill="none" opacity={0.25} /></Layer>
			<FigureSlot x={kx} y={ky} h={h} attire="siberia" action="pushCart" phase={tr.phase} facing={1} rim="#bfe0ff" lightDir={70} rimO={0.95} breath contact={0.4} />
			<Particles kind="diamond" n={70} seed={51} D={[1.5, 10]} c="#eaf4ff" o={0.9} size={1} />
			<Particles kind="snow" n={50} seed={52} D={[1.5, 10]} c="#eaf4ff" o={0.5} size={0.7} wind={-30} fall={-10} />
			<Layer D={2.4}><path d={`M-200,${H - 40} Q500,${H - 120} 1100,${H - 70} T2200,${H - 100} L2200,${H + 200} L-200,${H + 200} Z`} fill="#a8c0e0" /><path d={`M-200,${H - 40} Q500,${H - 120} 1100,${H - 70} T2200,${H - 100}`} stroke="#eef6ff" strokeWidth={4} fill="none" opacity={0.6} /></Layer>
		</Stage>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Thermo v={v} o={sm(t / 0.25)} pulse={pulse} /></svg>
	</AbsoluteFill>;
};

export const ACT1D: Record<'journal' | 'jail' | 'bowl' | 'alaska', SceneDef> = {
	journal: {C: JournalScene},
	jail: {C: JailScene},
	bowl: {C: BowlScene},
	alaska: {C: AlaskaScene},
};
