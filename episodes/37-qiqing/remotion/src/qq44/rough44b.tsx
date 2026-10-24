import React from 'react';
import {W, H, rnd, lerp, Glow, Rimmed, fkPose, gaitPose, B, jointAt, Sky, BRAIN_D, BrainLight} from './kit44';
import {Cam, cl, seg, ease, eo, ei, sm, Sticker, House} from './demo44';
import {SANS, MONO, ROSE, INK} from './skin44';
import {Shaft, Motes, Pendant, Shelf, Frame, Cloud, Fence, Clock} from './bg44';
import {RIMB, LKB, scr, RStamp, Streaks, kidHeadScreen, NeedleEnd} from './rough44b_parts';
import {AshSky, BigBlock, BLOCK_N} from './rough44a';
/* ep44 full rough cut, builder B: film 95.5–160.5 (lines 31–49 of lines.json v2, film = lines + 0.5).
   The genius hunt (G1 full → 1997 drive → G2 → G3 fastest → verdict), the museum, and the compass bookend.
   Every scene takes FILM time t. Picture only: subtitles, stamps and the counter come from the master. */
type P2 = [number, number];
const STAND = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
const FOLDS = ['M-220,-40 C-160,-90 -100,-60 -60,-110', 'M-40,-160 C0,-110 60,-150 110,-120', 'M140,-60 C180,-20 230,-60 250,0', 'M-200,60 C-140,30 -90,80 -30,50', 'M20,40 C70,0 120,60 170,30', 'M-100,-10 C-50,-30 0,10 60,-20'];
/** one numbered block (lit → grey) */
const Cube: React.FC<{x: number; y: number; n: number; s?: number; grey?: number; glow?: number; id: string}> = ({x, y, n, s = 1, grey = 0, glow = 0, id}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	{glow > 0 && <Glow x={0} y={0} r={90} c={B.halo} o={0.5 * glow * (1 - grey)} id={id} />}
	<rect x={-22} y={-22} width={44} height={44} rx={5} fill={B.mid} opacity={0.88 * (1 - grey)} stroke={B.core} strokeWidth={2} strokeOpacity={1 - grey} />
	{grey > 0 && <rect x={-22} y={-22} width={44} height={44} rx={5} fill="#57524e" opacity={grey} stroke="#8a847c" strokeWidth={2} strokeOpacity={grey} />}
	<Sticker x={0} y={1} n={n} s={0.5} o={0.95 - 0.3 * grey} /></g>;

/* ================= G1 95.5–105.5 (1985): block → slide; 4 blocks; the eyepiece; 「找到了！」; 3 go grey ================= */
const TRAY: P2[] = [1250, 1320, 1390, 1460].map((x) => [x, 676]);
const TRAY_N = [39, BLOCK_N, 41, 117], LIT = 1, JAR: P2 = [1640, 700], EP: P2 = [1500, 420], TC: P2 = [1355, 640];
const GLIA = Array.from({length: 46}, (_, i) => ({x: (rnd(i, 51) - 0.5) * 380, y: (rnd(i, 52) - 0.5) * 380, r: 5 + 3 * rnd(i, 53)})).filter((d) => Math.hypot(d.x, d.y) < 185);
const NEUR = Array.from({length: 14}, (_, i) => ({x: (rnd(i, 61) - 0.5) * 360, y: (rnd(i, 62) - 0.5) * 360, r: 15 + 6 * rnd(i, 63)})).filter((d) => Math.hypot(d.x, d.y) < 170);
const labCam = (t: number) => {
	const pull = ease(seg(t, 95.7, 97.1)), inP = ease(seg(t, 98.75, 99.45)), outP = ease(seg(t, 102.2, 102.9)), fin = ei(seg(t, 104.95, 105.62));
	let cx = lerp(lerp(1000, 1080, ease(seg(t, 95.5, 96.1))), 1190 + 18 * (t - 97), pull), cy = lerp(569, 560, pull), z = lerp(3.4, 1.04 + 0.012 * (t - 97), pull);
	const ez = 1.9 + 0.03 * (t - 99); cx = lerp(cx, EP[0] - 340 / ez, inP); cy = lerp(cy, EP[1] - 80 / ez, inP); z = lerp(z, ez, inP);
	cx = lerp(cx, TC[0] + 12 * (t - 103), outP); cy = lerp(cy, TC[1], outP); z = lerp(z, 2.25 + 0.04 * (t - 103), outP);
	cx = lerp(cx, TRAY[LIT][0], fin); cy = lerp(cy, TRAY[LIT][1], fin); z = lerp(z, 4.0, fin);
	return {cx, cy, z, inP, outP, fin};
};
const Lab: React.FC<{t: number}> = ({t}) => {
	const {cx, cy, z, outP, fin} = labCam(t), thin = ease(seg(t, 95.5, 96.15)), bx = lerp(1000, 1080, thin), lid = ease(seg(t, 96.4, 96.85));
	const epOpen = eo(seg(t, 98.75, 99.05)) * (1 - ease(seg(t, 102.2, 102.6))), sitBack = ease(seg(t, 102.4, 103.2));
	const greyAt = [102.8, -1, 103.1, 103.4], found = seg(t, 99.12, 99.26), doubt = seg(t, 104.0, 104.14);
	const stampP: P2 = [lerp(EP[0] + 96, TC[0] - 10, outP), lerp(EP[1] - 60, 588, outP)];
	const flare = 0.75 + 0.25 * sm(seg(t, 95.5, 96)) + 0.08 * Math.sin(t * 5);
	return <g>
		<Sky id="bls" stops={[[0, '#1a2024'], [0.66, '#242b2f'], [0.67, '#15191b'], [1, '#0d0f11']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 6}, (_, i) => <rect key={i} x={i * 380 - 100} y={0} width={3} height={720} fill="#3a4448" opacity={0.5} />)}
			{/* window with venetian blinds (1985) */}
			<rect x={150} y={110} width={300} height={400} fill="#2a3a40" />{Array.from({length: 16}, (_, i) => <rect key={i} x={150} y={118 + i * 24} width={300} height={10} fill="#1a2428" opacity={0.85} />)}
			<rect x={150} y={110} width={300} height={400} fill="none" stroke="#0c1012" strokeWidth={14} />
			<Shaft id="blsh" a={[150, 510]} b={[450, 510]} c={[900, 1000]} d={[400, 1000]} col="#dde6ea" o={0.07} />
			<Shelf x={1180} y={190} w={720} kind="jars" col="#0e1214" tone="#252c30" seed={4} /><Shelf x={1180} y={330} w={720} kind="books" col="#0e1214" tone="#252c30" seed={6} />
			<Clock x={620} y={170} r={30} t={t} />
			<Pendant x={1080} y={150} len={200} id="blp" o={0.7} col="#e8ece8" />
			<Motes t={t} x={300} y={420} w={1400} h={460} n={22} o={0.3} />
			<rect x={420} y={700} width={1500} height={18} fill="#3a4044" /><rect x={460} y={718} width={16} height={260} fill="#262a2d" /><rect x={1840} y={718} width={16} height={260} fill="#262a2d" />
			<Glow x={1080} y={640} r={320} c={B.halo} o={0.2 + 0.2 * thin} id="bla" />
			{/* the open jar and its lid */}
			<g transform={`translate(${JAR[0]},${JAR[1]}) scale(0.62)`}>
				<Glow x={0} y={-130} r={260} c={B.halo} o={0.35} id="bljg" />
				<path d="M-90,0 L-90,-210 Q-90,-236 -66,-244 L-66,-262 L66,-262 L66,-244 Q90,-236 90,-210 L90,0 Q90,12 78,12 L-78,12 Q-90,12 -90,0 Z" fill="#cfe2e6" opacity={0.16} stroke="#e8f2f4" strokeWidth={3} strokeOpacity={0.6} />
				<rect x={-86} y={-150} width={172} height={160} fill="#ffd9b0" opacity={0.16} />
				{Array.from({length: 6}, (_, i) => { const x = -52 + (i % 3) * 52, y = -30 - Math.floor(i / 3) * 50; return <rect key={i} x={x - 22} y={y - 22} width={44} height={44} rx={5} fill={B.mid} opacity={0.7} stroke={B.core} strokeWidth={2} transform={`rotate(${(rnd(i, 4) - 0.5) * 30} ${x} ${y})`} />; })}
				<g transform={`translate(${170 * lid},${-286 - 60 * Math.sin(lid * Math.PI) + 280 * lid}) rotate(${-200 * lid})`}><rect x={-72} y={0} width={144} height={28} rx={6} fill="#8a8e94" />{Array.from({length: 6}, (_, i) => <rect key={i} x={-72} y={4 + i * 4} width={144} height={1.5} fill="#5a5e64" />)}</g>
			</g>
			{/* a tally counter for counting cells, a notebook */}
			<g transform="translate(860,700)"><rect x={-70} y={-12} width={140} height={12} fill="#c8c0b0" opacity={0.6} /><rect x={-60} y={-14} width={120} height={3} fill="#3a342c" /></g>
			<g transform="translate(1200,700)"><rect x={-20} y={-34} width={40} height={34} rx={8} fill="#2a2e30" /><circle cx={0} cy={-38} r={7} fill="#2a2e30" /><rect x={-12} y={-26} width={24} height={9} fill="#c8c2b4" opacity={0.5} /></g>
			{/* microscope */}
			<g transform="translate(1080,700)" fill="#0e1012"><rect x={-110} y={-24} width={220} height={24} rx={6} /><path d="M40,-24 L60,-24 L70,-260 Q60,-300 20,-300 L10,-260 Z" /><rect x={-80} y={-110} width={160} height={14} rx={4} />
				<rect x={-40} y={-330} width={56} height={170} rx={10} transform="rotate(-24 0 -250)" /><rect x={-70} y={-360} width={40} height={60} rx={8} transform="rotate(-24 0 -250)" /><rect x={-18} y={-170} width={20} height={56} /></g>
			{/* the block becomes a thin slide under the lens (match on the glow from 95.5) */}
			<g transform={`translate(${bx},597)`}>
				<rect x={-80} y={-9} width={160} height={10} rx={2} fill="#d8e8ec" opacity={0.55 * thin} />
				<Glow x={0} y={-10} r={lerp(150, 70, thin)} c={B.core} o={0.75 * flare} id="blg" />
				<rect x={-lerp(28, 22, thin)} y={-lerp(56, 10, thin)} width={lerp(56, 44, thin)} height={lerp(56, 10, thin)} rx={lerp(5, 1, thin)} fill={B.mid} stroke={B.core} strokeWidth={2} />
				{thin < 0.9 && <Sticker x={0} y={-28 * (1 - thin) - 4} n={TRAY_N[LIT]} s={0.55 * (1 - thin)} o={1 - thin} />}
			</g>
			{/* four blocks hop out of the jar onto the tray, one per beat */}
			<rect x={1210} y={698} width={290} height={6} rx={2} fill="#6a7074" />
			{TRAY.map((p, i) => { const k = seg(t, 96.9 + 0.36 * i, 97.24 + 0.36 * i); if (k <= 0) return null; const kk = ease(k), x = lerp(JAR[0], p[0], kk), y = lerp(JAR[1] - 150, p[1], kk) - 130 * Math.sin(Math.PI * kk), land = k >= 1 ? Math.exp(-(t - 97.24 - 0.36 * i) / 0.1) : 0;
				const g = greyAt[i] < 0 ? 0 : sm(seg(t, greyAt[i], greyAt[i] + 0.22)), lit = i === LIT ? sm(seg(t, 103.4, 104.0)) : 0;
				return <Cube key={i} x={x} y={y + 3 * land} n={TRAY_N[i]} grey={g} glow={0.6 + 0.4 * land + 1.2 * lit + 0.6 * fin} id={`blc${i}`} />; })}
			{thin < 1 && <g transform={`translate(${bx},597)`} opacity={1 - sm(seg(thin, 0.6, 1))}><Glow x={0} y={-28} r={170} c={B.halo} o={0.5} id="blg2" />
				<rect x={-lerp(28, 22, thin)} y={-lerp(56, 10, thin)} width={lerp(56, 44, thin)} height={lerp(56, 10, thin)} rx={lerp(5, 1, thin)} fill={B.mid} stroke={B.core} strokeWidth={2} />
				<Sticker x={0} y={-28 * (1 - thin) - 4} n={TRAY_N[LIT]} s={0.55 * (1 - thin)} o={1 - thin} /></g>}
			{/* the researcher at the microscope (whole figure) */}
			<Rimmed x={760} ground={912} h={620} pose={fkPose({hip: 0.37, lean: lerp(34 + 3 * Math.sin(t * 1.3), 14, sitBack), neck: lerp(22, 8, sitBack), lt: 86, lk: 90, rt: 82, rk: 86, la: 70, le: 50, ra: lerp(64, 40, sitBack), re: 60})} look={LKB.diamond} col="#121416" rim={RIMB} rimOp={0.6} />
			<g transform="translate(560,912)"><rect x={-60} y={-240} width={120} height={14} fill="#1a1e20" /><rect x={-4} y={-226} width={8} height={226} fill="#1a1e20" /></g>
			<g fill="#070909"><rect x={1880} y={480} width={200} height={600} /><rect x={-200} y={960} width={700} height={200} /></g>
			{/* what the eyepiece sees (the C3 circle): glia = small dots, counted; neurons = big pale rings */}
			{epOpen > 0.01 && <g transform={`translate(${EP[0]},${EP[1]}) scale(${epOpen})`}>
				<circle r={210} fill="#120a08" /><circle r={210} fill="none" stroke="#3a3e42" strokeWidth={14} />
				<defs><clipPath id="blec"><circle r={200} /></clipPath></defs>
				<g clipPath="url(#blec)"><Glow x={0} y={0} r={260} c={B.halo} o={0.3} id="ble" />
					{NEUR.map((d, i) => <g key={`n${i}`}><circle cx={d.x} cy={d.y} r={d.r} fill="#d8c8bc" opacity={0.18} /><circle cx={d.x} cy={d.y} r={d.r} fill="none" stroke="#e8dcd0" strokeWidth={2} opacity={0.35} /></g>)}
					{GLIA.map((d, i) => { const c = seg(t, 99.3 + i * 0.05, 99.38 + i * 0.05); return <g key={i}><circle cx={d.x} cy={d.y} r={d.r} fill={B.mid} opacity={0.85} />{c > 0 && <circle cx={d.x} cy={d.y} r={d.r + 5 + 6 * (1 - c)} fill="none" stroke={B.core} strokeWidth={2} opacity={c} />}</g>; })}
				</g></g>}
			<RStamp x={stampP[0]} y={stampP[1]} s="找到了！" k={found} size={36} o={1 - 0.55 * sm(seg(t, 104.0, 104.3))} />
			<RStamp x={TC[0] + 6} y={600} s="存疑" k={doubt} grey rot={5} size={40} />
		</Cam>
		{/* the gloss label, big, with the line (screen space) */}
		{(() => { const o = sm(seg(t, 99.35, 99.6)) * (1 - sm(seg(t, 102.05, 102.3))); if (o <= 0) return null; const c = labCam(t), d = GLIA[3], p = scr([EP[0] + d.x, EP[1] + d.y], c.cx, c.cy, c.z);
			return <g opacity={o}><path d={`M${p[0]},${p[1]} L${1180},${900}`} stroke={INK} strokeWidth={3} strokeDasharray="8 7" opacity={0.8} /><circle cx={p[0]} cy={p[1]} r={16} fill="none" stroke={INK} strokeWidth={3} />
				<rect x={800} y={900} width={760} height={86} rx={12} fill="rgba(14,12,12,0.78)" stroke={ROSE} strokeWidth={2} strokeOpacity={0.6} />
				<text x={1180} y={958} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, letterSpacing: '0.03em'}} fill={INK}><tspan fill={ROSE}>胶质细胞</tspan>：给神经细胞打下手</text></g>; })()}
		{/* A's block (№40) in place, then a clipped copy shrinks onto the slide-to-be */}
		{t < 95.65 && <BigBlock t={95.5} o={1 - sm(seg(t, 95.5, 95.62))} />}
		{t < 96.0 && (() => { const k = ease(seg(t, 95.5, 95.95)), s = lerp(1, 56 * 3.4 / 500, k); return <g transform={`translate(960,540) scale(${s}) translate(-960,-540)`} opacity={1 - sm(seg(t, 95.7, 95.95))}>
			<defs><clipPath id="blbb"><rect x={716} y={296} width={488} height={488} rx={40} /></clipPath></defs><g clipPath="url(#blbb)"><BigBlock t={95.5} /></g></g>; })()}
		<rect width={W} height={H} fill={B.core} opacity={0.5 * ei(seg(t, 105.2, 105.6))} />
	</g>;
};

/* ================= R1 105.5–108.5 (1997): side view at dusk, Harvey (84) in the passenger seat, the trunk glows ================= */
const CAR_D = 'M-310,-40 L-300,-90 Q-290,-104 -250,-108 L-150,-112 L-90,-176 Q-80,-184 -60,-185 L120,-185 Q140,-184 152,-176 L210,-120 L290,-112 Q312,-108 314,-86 L316,-40 Q316,-26 300,-24 L-296,-24 Q-310,-26 -310,-40 Z';
const SideCar: React.FC<{t: number; trunk?: number; open?: number; people?: boolean; id: string}> = ({t, trunk = 1, open = 0, people = true, id}) => <g>
	<ellipse cx={0} cy={2} rx={330} ry={14} fill="#000" opacity={0.4} />
	{open > 0 && <path d={`M214,-118 L300,-112 L${300 - 40 * open},${-112 - 90 * open} L${214 - 10 * open},${-118 - 60 * open} Z`} fill="#24484a" />}
	<path d={CAR_D} fill="#2f5a56" /><path d="M-306,-60 L316,-60" stroke="#24484a" strokeWidth={6} /><path d="M-300,-92 Q0,-100 300,-96" stroke="#cfe0da" strokeWidth={2} opacity={0.3} fill="none" />
	<path d="M-82,-172 L-140,-114 L20,-114 L20,-174 Z" fill="#1c2a2e" /><path d="M32,-174 L32,-114 L196,-114 L148,-172 Z" fill="#1c2a2e" />
	{people && <g>
		{/* the young driver beyond, hands on the wheel */}
		<path d="M-70,-114 Q-74,-138 -90,-140 M-100,-118 Q-112,-150 -96,-152" stroke="#0a0e10" strokeWidth={9} fill="none" strokeLinecap="round" />
		<ellipse cx={-80} cy={-148} rx={13} ry={16} fill="#0c1214" /><path d="M-93,-152 Q-88,-168 -72,-164 Q-66,-158 -68,-150 Z" fill="#0c1214" />
		{/* Harvey, 84: bald dome, fringe, glasses, a slight stoop */}
		<path d="M-30,-114 Q-34,-128 -18,-134 Q4,-136 10,-124 L12,-114 Z" fill="#0e1416" />
		<ellipse cx={-14} cy={-146} rx={15} ry={17} fill="#0e1416" /><path d="M-29,-150 Q-24,-166 -10,-164 Q2,-160 0,-148" stroke={RIMB} strokeWidth={2} fill="none" opacity={0.65} />
		<path d="M-6,-146 L4,-146" stroke="#cfd8d4" strokeWidth={2} opacity={0.6} />
	</g>}
	<path d="M-82,-172 L-140,-114 L20,-114 L20,-174 Z M32,-174 L32,-114 L196,-114 L148,-172 Z" fill="#9ab4b0" opacity={0.12} />
	<path d="M-60,-176 L-20,-176 L-70,-120 L-100,-120 Z" fill="#fff" opacity={0.06} />
	{[-200, 200].map((wx, i) => <g key={i} transform={`translate(${wx},-40)`}><circle r={46} fill="#0a0c0e" /><circle r={42} fill="#141618" /><circle r={22} fill="#5a6064" /><g transform={`rotate(${-t * 900})`}>{[0, 60, 120].map((a) => <rect key={a} x={-20} y={-2} width={40} height={4} fill="#2a2e30" transform={`rotate(${a})`} />)}</g></g>)}
	<rect x={-312} y={-84} width={12} height={16} rx={3} fill="#f0e2c0" /><path d="M-312,-80 L-700,-120 L-700,-30 Z" fill="#f0e2c0" opacity={0.06} />
	<rect x={304} y={-86} width={12} height={18} rx={3} fill="#5a3a34" />
	{/* light seeping from the trunk */}
	<Glow x={258} y={-112} r={150} c={B.halo} o={0.5 * trunk} id={`${id}t`} /><path d="M214,-118 L300,-112" stroke={B.core} strokeWidth={3} opacity={0.9 * trunk} /><Glow x={258} y={-112} r={50} c={B.core} o={0.6 * trunk} id={`${id}tc`} />
</g>;
const Drive: React.FC<{t: number}> = ({t}) => {
	const u = t - 105.5, sc = u * 900, pull = ease(seg(u, 0.05, 1.1)), drift = ease(seg(u, 1.1, 3.0)), bob = Math.sin(t * 17) * 1.5;
	const CX = 960, G = 840, S = 1.25;
	const cx = lerp(CX + 258 * S, lerp(960, 930, drift), pull), cy = lerp(G - 112 * S, lerp(600, 690, drift), pull), z = lerp(2.6, lerp(1.0, 1.55, drift), pull);
	const wrap = (x: number, span: number) => ((x % span) + span) % span;
	return <g>
		<Sky id="bds" stops={[[0, '#1c2530'], [0.35, '#3a4250'], [0.55, '#7a6c6c'], [0.62, '#b08c78']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 24}, (_, i) => <circle key={i} cx={rnd(i, 61) * 2000} cy={rnd(i, 62) * 260} r={1 + rnd(i, 63)} fill="#e8eaf0" opacity={0.2 + 0.25 * rnd(i, 64)} />)}
			<Glow x={300} y={640} r={620} c="#e8b898" o={0.24} id="bdh" />
			{[[300, 260, 1.4], [1150, 200, 1.8], [1700, 330, 1.1]].map(([x, y, s], i) => <Cloud key={i} x={wrap(x + sc * 0.02, 2600) - 300} y={y} s={s} col="#4a505a" o={0.5} />)}
			{/* far mesas, then nearer desert ridges (parallax: the car heads left, the land slides right) */}
			{[0, 1].map((k) => <path key={k} transform={`translate(${wrap(sc * 0.04, 2400) - 2400 * k},0)`} d="M-200,640 L-200,560 L120,560 L150,522 L420,518 L450,560 L700,572 L1300,590 L1420,540 L1700,536 L1730,575 L2200,585 L2200,640 Z" fill="#4c4a52" />)}
			{[0, 1].map((k) => <path key={k} transform={`translate(${wrap(sc * 0.15, 2400) - 2400 * k},0)`} d="M-200,700 L-200,630 Q200,600 500,628 Q800,650 1100,618 Q1500,596 1800,626 Q2000,640 2200,630 L2200,700 Z" fill="#34333a" />)}
			<rect x={-400} y={680} width={2800} height={600} fill="#24222a" />
			{Array.from({length: 18}, (_, i) => { const x = wrap(i * 160 + sc * 0.4, 2880) - 480, y = 700 + 30 * rnd(i, 3); return <path key={i} d={`M${x},${y} q8,-26 16,0 q6,-18 12,0`} stroke="#18171c" strokeWidth={4} fill="none" />; })}
			{/* telephone poles and wires */}
			{Array.from({length: 6}, (_, i) => { const x = wrap(i * 520 + sc * 0.7, 3120) - 600; return <g key={i}><rect x={x - 5} y={430} width={10} height={300} fill="#141318" /><rect x={x - 40} y={446} width={80} height={6} fill="#141318" /><path d={`M${x - 36},450 Q${x + 260},490 ${x + 484},450`} stroke="#141318" strokeWidth={2} fill="none" /></g>; })}
			{/* the road */}
			<rect x={-400} y={790} width={2800} height={110} fill="#1b1a1f" /><rect x={-400} y={790} width={2800} height={4} fill="#8a8478" opacity={0.4} />
			{Array.from({length: 14}, (_, i) => <rect key={i} x={wrap(i * 220 + sc * 1.0, 3080) - 600} y={856} width={110} height={6} fill="#d8cfb8" opacity={0.6} />)}
			<g transform={`translate(${CX},${G + bob}) scale(${S})`}><SideCar t={t} id="bdc" /></g>
			<Fence y={1010} scroll={-sc * 1.6} col="#0e0d11" gap={260} h={90} />
			<rect x={-400} y={1010} width={2800} height={300} fill="#0c0b0f" />
		</Cam>
		<Streaks k={0.6 * (1 - eo(seg(u, 0, 0.25)))} seed={5} />
	</g>;
};

/* ================= R2 108.5–111.5: the C4 shot again (same car, from behind), then the odometer passes 6000 km ================= */
const mesa = (y0: number, pts: [number, number][]) => `M-200,${y0} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L2400,${y0} L2400,1200 L-200,1200 Z`;
const Behind: React.FC<{t: number}> = ({t}) => {
	const u = t - 108.5, s = lerp(0.82, 0.66, ease(seg(u, 0, 1.6))), cyy = lerp(880, 840, ease(seg(u, 0, 1.6))), push = ei(seg(u, 1.25, 1.8));
	const win: P2 = [960, cyy - 82 * s];
	const cx = lerp(960 + 20 * u, win[0], push), cy = lerp(560 - 8 * u, win[1], push), z = lerp(1.05 + 0.02 * u, 3.0, push);
	const vp: P2 = [960, 640], persp = (p: number, side: number): P2 => [vp[0] + side * 760 * p, vp[1] + 440 * p];
	return <g>
		<Sky id="bbs" stops={[[0, '#202a36'], [0.38, '#46505c'], [0.53, '#8a7a76'], [0.6, '#b8968a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Glow x={1240} y={630} r={560} c="#e8c0a0" o={0.24} id="bbh" />
			{[[300, 300, 1.4], [1100, 230, 1.8], [1650, 360, 1.1]].map(([x, y, sc], i) => <Cloud key={i} x={x - u * 12 * (i + 1)} y={y} s={sc} col="#4e5560" o={0.55} />)}
			<path d={mesa(640, [[-200, 560], [140, 560], [170, 520], [420, 518], [450, 560], [700, 575], [1300, 590], [1420, 540], [1700, 536], [1730, 575], [2400, 585]])} fill="#504c52" />
			<path d="M140,560 L170,520 L420,518 L450,560 M1420,540 L1700,536" stroke="#e2c8b0" strokeWidth={2.5} fill="none" opacity={0.4} />
			<path d={mesa(660, [[-200, 620], [300, 612], [600, 628], [900, 636], [1100, 630], [1500, 610], [1900, 618], [2400, 625]])} fill="#36343a" />
			<rect x={-200} y={640} width={2600} height={600} fill="#26242a" />
			<path d={`M${vp[0] - 4},${vp[1]} L${vp[0] + 4},${vp[1]} L${vp[0] + 820},1200 L${vp[0] - 820},1200 Z`} fill="#1b1a1f" />
			<path d={`M${vp[0] - 3},${vp[1]} L${vp[0] - 780},1150 M${vp[0] + 3},${vp[1]} L${vp[0] + 780},1150`} stroke="#8a8478" strokeWidth={3} opacity={0.5} />
			{Array.from({length: 14}, (_, i) => { const p = ((i + u * 4.5) % 14) / 14, p2 = p + 0.025; const y1 = vp[1] + 440 * p * p * 1.25, y2 = vp[1] + 440 * p2 * p2 * 1.25, w = 2 + 10 * p;
				return <path key={i} d={`M${960 - w / 2},${y1} L${960 + w / 2},${y1} L${960 + w},${y2} L${960 - w},${y2} Z`} fill="#d8cfb8" opacity={0.7} />; })}
			{Array.from({length: 6}, (_, i) => { const p = ((i / 6 + u * 0.45) % 1), pp = p * p * 1.3, [x, y] = persp(pp, -1.15); return <rect key={i} x={x - 2 - 6 * pp} y={y - 420 * pp} width={4 + 12 * pp} height={420 * pp} fill="#141318" />; })}
			{/* signs flick past: one blank, one names where they are going (city name only, no map) */}
			{[-0.2, 0.75].map((a, i) => { const p = cl((u - a) / 1.0), pp = 0.1 + p * p * 1.6, [x, y] = persp(pp, 1.25); return p > 0 && p < 1 ? <g key={i} transform={`translate(${x},${y}) scale(${pp})`}><rect x={-6} y={-300} width={12} height={300} fill="#141318" /><rect x={-170} y={-430} width={340} height={160} rx={10} fill="#3e5450" stroke="#cfd4cc" strokeWidth={6} />
				{i === 1 ? <><text x={0} y={-362} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontWeight: 700, fontSize: 52}} fill="#e8ece4">BERKELEY</text><path d="M-40,-322 L40,-322 M20,-336 L40,-322 L20,-308" stroke="#e8ece4" strokeWidth={7} fill="none" /></>
					: <><rect x={-110} y={-390} width={220} height={18} fill="#cfd4cc" opacity={0.7} /><rect x={-110} y={-350} width={150} height={14} fill="#cfd4cc" opacity={0.5} /></>}</g> : null; })}
			{[0, 1, 2, 3, 4].map((i) => { const p = 0.05 + i * 0.22, [x, y] = persp(p, 1.6), [x2, y2] = persp(p + 0.22, 1.6); return <g key={i}><rect x={x - 3 - 3 * p} y={y - 300 * p - 40} width={6 + 6 * p} height={300 * p + 40} fill="#18171c" /><path d={`M${x},${y - 300 * p - 30} Q${(x + x2) / 2},${(y + y2) / 2 - 150 * (p + 0.1)} ${x2},${y2 - 300 * (p + 0.22) - 30}`} stroke="#18171c" strokeWidth={2} fill="none" /></g>; })}
			<g transform={`translate(960,${cyy}) scale(${s}) translate(0,${Math.sin(u * 18) * 1.5})`}>
				<ellipse cx={0} cy={118} rx={300} ry={26} fill="#000" opacity={0.35} />
				<path d="M-270,100 L-280,20 Q-276,-10 -240,-20 L-190,-120 Q-176,-140 -140,-142 L140,-142 Q176,-140 190,-120 L240,-20 Q276,-10 280,20 L270,100 Z" fill="#2f5250" />
				<path d="M-176,-118 Q-164,-130 -136,-130 L136,-130 Q164,-130 176,-118 L206,-36 L-206,-36 Z" fill="#1c2a2e" />
				<circle cx={-62} cy={-74} r={30} fill="#0c1012" /><path d="M-92,-36 Q-92,-60 -62,-62 Q-32,-60 -32,-36 Z" fill="#0c1012" />
				<circle cx={70} cy={-78} r={28} fill="#0c1012" /><path d="M42,-36 Q44,-60 70,-62 Q98,-60 98,-36 Z" fill="#0c1012" /><path d="M46,-92 Q70,-112 94,-92" stroke={RIMB} strokeWidth={2.5} fill="none" opacity={0.6} />
				<path d="M-190,-120 Q0,-150 190,-120" stroke="#cfd8d4" strokeWidth={3} fill="none" opacity={0.35} />
				<rect x={-240} y={-14} width={480} height={8} fill="#24484a" />
				<Glow x={0} y={-8} r={270} c={B.halo} o={0.55} id="bbt" /><rect x={-230} y={-10} width={460} height={4} fill={B.core} opacity={0.9} /><Glow x={0} y={-8} r={110} c={B.core} o={0.6} id="bbtc" />
				<rect x={-262} y={10} width={70} height={26} rx={4} fill="#5a3a34" /><rect x={192} y={10} width={70} height={26} rx={4} fill="#5a3a34" />
				<rect x={-70} y={40} width={140} height={34} rx={3} fill="#d8d4c4" opacity={0.85} />
				<rect x={-280} y={80} width={560} height={26} rx={8} fill="#1a2a2a" /><rect x={-250} y={100} width={80} height={30} rx={8} fill="#0c0e10" /><rect x={170} y={100} width={80} height={30} rx={8} fill="#0c0e10" />
			</g>
			<g fill="#0d0c10">{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={-40 + i * 60} cy={1060 - 30 * Math.sin(i)} rx={70} ry={50 + 20 * rnd(i, 3)} />)}{Array.from({length: 6}, (_, i) => <ellipse key={`r${i}`} cx={1700 + i * 60} cy={1050 - 25 * Math.cos(i)} rx={66} ry={46 + 20 * rnd(i, 4)} />)}</g>
		</Cam>
	</g>;
};
/** inside the car: windshield at dusk, the two of them from behind, the odometer rolling past 6000 km */
const Odo: React.FC<{t: number}> = ({t}) => {
	const u = t - 110.2, v = lerp(5991.2, 6003.6, ease(seg(t, 110.35, 111.35))) + 0.6 * u, push = 1.0 + 0.04 * u;
	const digits = [1000, 100, 10, 1].map((p) => { const d = Math.floor(v / p) % 10, rem = v % p, frac = p === 1 ? v - Math.floor(v) : Math.max(0, rem - (p - 1)); return {d, frac}; });
	const vp: P2 = [960, 380];
	return <g>
		<Sky id="bos" stops={[[0, '#2a3440'], [0.3, '#7a6e6c'], [0.36, '#b8968a']]} />
		<g transform={`translate(960,540) scale(${push}) translate(-960,-540)`}>
			<path d="M-100,390 L300,350 L520,372 L760,360 L1100,374 L1400,346 L1700,366 L2100,356 L2100,640 L-100,640 Z" fill="#3a3840" />
			<rect x={-100} y={390} width={2200} height={400} fill="#24222a" />
			<path d={`M${vp[0] - 3},${vp[1]} L${vp[0] + 3},${vp[1]} L${vp[0] + 700},800 L${vp[0] - 700},800 Z`} fill="#1a191e" />
			{Array.from({length: 10}, (_, i) => { const p = ((i + u * 5) % 10) / 10, y1 = vp[1] + 420 * p * p, y2 = vp[1] + 420 * (p + 0.03) ** 2, w = 2 + 12 * p; return <path key={i} d={`M${960 - w / 2},${y1} L${960 + w / 2},${y1} L${960 + w},${y2} L${960 - w},${y2} Z`} fill="#d8cfb8" opacity={0.6} />; })}
			{/* windshield frame, the two of them, the dashboard */}
			<path d="M-100,-100 L2100,-100 L2100,120 Q960,60 -100,120 Z" fill="#0c0e10" /><path d="M-100,-100 L180,-100 L60,700 L-100,700 Z M2100,-100 L1740,-100 L1860,700 L2100,700 Z" fill="#0c0e10" />
			<g fill="#0a0c0d"><ellipse cx={380} cy={520} rx={70} ry={84} /><path d="M200,1100 Q190,690 380,640 Q560,690 560,1100 Z" />
				<ellipse cx={1520} cy={540} rx={68} ry={78} /><path d="M1340,1100 Q1340,700 1520,660 Q1700,700 1700,1100 Z" /></g>
			<path d="M450,500 Q460,446 390,438 Q320,440 312,500" stroke="#3a2e2a" strokeWidth={3} fill="none" opacity={0.6} />
			<path d="M1462,522 Q1470,470 1520,466 Q1576,470 1584,522" stroke={RIMB} strokeWidth={3} fill="none" opacity={0.5} />
			<Glow x={960} y={1080} r={700} c={B.halo} o={0.2} id="bobk" />
			<path d="M-100,760 Q960,690 2100,760 L2100,1200 L-100,1200 Z" fill="#141416" /><path d="M-100,760 Q960,690 2100,760" stroke="#3a3c40" strokeWidth={4} fill="none" />
			<path d="M600,1200 Q620,820 960,800 Q1300,820 1320,1200 Z" fill="#1c1d20" />
			{/* speedometer */}
			<g transform="translate(700,930)"><circle r={130} fill="#0c0d0f" stroke="#4a4c50" strokeWidth={5} />{Array.from({length: 13}, (_, i) => { const a = (-220 + i * 22) * Math.PI / 180; return <line key={i} x1={Math.cos(a) * 112} y1={Math.sin(a) * 112} x2={Math.cos(a) * (i % 2 ? 100 : 90)} y2={Math.sin(a) * (i % 2 ? 100 : 90)} stroke="#c8ccc4" strokeWidth={3} opacity={0.7} />; })}
				<line x1={0} y1={0} x2={Math.cos((-110 + 3 * Math.sin(t * 3)) * Math.PI / 180) * 100} y2={Math.sin((-110 + 3 * Math.sin(t * 3)) * Math.PI / 180) * 100} stroke="#e8dcc8" strokeWidth={5} strokeLinecap="round" /><circle r={12} fill="#2a2c30" /></g>
			{/* the odometer: digit drums */}
			<g transform="translate(900,820) scale(1.45)">
				<rect x={-10} y={-8} width={300} height={96} rx={8} fill="#060708" stroke="#4a4c50" strokeWidth={4} />
				<defs><clipPath id="bodc"><rect x={0} y={0} width={280} height={80} /></clipPath></defs>
				<g clipPath="url(#bodc)">{digits.map(({d, frac}, i) => <g key={i} transform={`translate(${i * 70},${-frac * 80})`}><rect x={2} y={0} width={64} height={160} fill={i === 0 && d === 6 ? '#2a1e1a' : '#16181a'} />
					<text x={34} y={62} textAnchor="middle" style={{fontFamily: MONO, fontWeight: 700, fontSize: 64}} fill={INK}>{d}</text><text x={34} y={142} textAnchor="middle" style={{fontFamily: MONO, fontWeight: 700, fontSize: 64}} fill={INK}>{(d + 1) % 10}</text></g>)}</g>
				<text x={310} y={66} style={{fontFamily: MONO, fontWeight: 700, fontSize: 34}} fill={INK} opacity={0.8}>km</text></g>
		</g>
	</g>;
};

/* ================= R3–R4 111.5–117.0: a doorway in Berkeley; she does not take it ================= */
const Door: React.FC<{t: number}> = ({t}) => {
	const pan = ease(seg(t, 111.5, 112.7)), push = ease(seg(t, 112.7, 114.7)), r4 = ease(seg(t, 114.75, 116.6)), fin = ei(seg(t, 116.7, 117.15));
	const open = ease(seg(t, 111.9, 112.6)) * (1 - ease(seg(t, 115.35, 116.2))), raise = ease(seg(t, 112.6, 113.2)) * (1 - 0.6 * ease(seg(t, 116.05, 116.8)));
	const DG = 800, HX = 1110, hp = fkPose({...STAND, lean: 11, neck: 14, la: lerp(6, 52, raise), le: lerp(14, 26, raise), ra: lerp(10, 58, raise), re: lerp(16, 22, raise)});
	const ep = fkPose({...STAND, lean: 1, neck: 4, la: -2, le: 8, ra: 3, re: 12}), bag = jointAt(hp, 'RHand', HX, DG, 360), bagC: P2 = [bag[0] + 18, bag[1] + 14];
	let cx = lerp(560, 1180, pan), cy = lerp(780, 620, pan), z = lerp(1.25, 1.12, pan) + 0.12 * push;
	cx = lerp(cx, 1150, r4); cy = lerp(cy, 640, r4); z = lerp(z, 1.42, r4);
	cx = lerp(cx, bagC[0], fin); cy = lerp(cy, bagC[1], fin); z = lerp(z, 3.0, fin);
	return <g>
		<Sky id="bdrs" stops={[[0, '#141c28'], [0.55, '#2c3444'], [0.8, '#4a4650']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 16}, (_, i) => <circle key={i} cx={rnd(i, 91) * 2400 - 200} cy={rnd(i, 92) * 300} r={1 + rnd(i, 93)} fill="#e8eaf0" opacity={0.3} />)}
			{/* a eucalyptus and a street lamp */}
			<g fill="#0e1218"><path d="M160,1000 L176,560 Q150,400 190,300 L204,300 Q220,420 200,560 L214,1000 Z" />{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={180 + Math.cos(i * 1.3) * 110} cy={260 + Math.sin(i * 1.7) * 60 - i * 18} rx={110} ry={46} transform={`rotate(${-20 + i * 9} ${180 + Math.cos(i * 1.3) * 110} ${260 + Math.sin(i * 1.7) * 60 - i * 18})`} />)}</g>
			<g transform="translate(470,960)"><rect x={-5} y={-420} width={10} height={420} fill="#14161a" /><path d="M0,-420 Q30,-440 60,-420" stroke="#14161a" strokeWidth={8} fill="none" /><ellipse cx={60} cy={-414} rx={18} ry={7} fill="#f4dcb0" /><Glow x={60} y={-400} r={240} c="#f4dcb0" o={0.2} id="bdl" /></g>
			{/* the house */}
			<rect x={760} y={330} width={1300} height={470} fill="#2a2c34" />{Array.from({length: 18}, (_, i) => <rect key={i} x={760} y={340 + i * 26} width={1300} height={2} fill="#1c1e24" />)}
			<path d="M720,340 L1410,170 L2100,340 Z" fill="#1c1e24" />
			{[[860, 450], [1560, 450]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width={160} height={190} fill="#e8b884" opacity={0.55} /><rect x={x} y={y} width={160} height={190} fill="none" stroke="#14161a" strokeWidth={10} /><path d={`M${x + 80},${y} V${y + 190} M${x},${y + 95} H${x + 160}`} stroke="#14161a" strokeWidth={6} /><Glow x={x + 80} y={y + 95} r={200} c="#f0c890" o={0.14} id={`bdw${i}`} /></g>)}
			{/* porch roof, posts, the porch lamp */}
			<rect x={1010} y={378} width={560} height={22} fill="#18191e" /><rect x={1030} y={400} width={14} height={400} fill="#18191e" /><rect x={1536} y={400} width={14} height={400} fill="#18191e" />
			<g transform="translate(1460,480)"><rect x={-12} y={-24} width={24} height={34} rx={4} fill="#f6dcae" /><Glow x={0} y={-6} r={160} c="#f6dcae" o={0.35} id="bdpl" /></g>
			{/* the doorway: warm inside, Evelyn in it, the door leaf swinging */}
			<rect x={1232} y={412} width={186} height={392} fill="#14161a" />
			<defs><clipPath id="bddc"><rect x={1240} y={420} width={170} height={380} /></clipPath></defs>
			<g clipPath="url(#bddc)">
				<rect x={1240} y={420} width={170} height={380} fill="#3a3028" /><rect x={1240} y={420} width={170} height={380} fill="#f0d0a0" opacity={0.75 * open} />
				<Glow x={1325} y={560} r={220} c="#ffe0b0" o={0.35 * open} id="bddg" />
				<g opacity={0.25 + 0.75 * open}><Rimmed x={1335} ground={DG} h={350} pose={ep} look={LKB.evelyn} flip col="#16110f" rim="#ffe0b8" rimOp={0.5 * open} /></g>
				<rect x={lerp(1240, 1384, open)} y={420} width={lerp(170, 26, open)} height={380} fill="#3c2c24" /><rect x={lerp(1250, 1388, open)} y={430} width={lerp(150, 18, open)} height={360} fill="none" stroke="#2a1e18" strokeWidth={4} />
			</g>
			<path d={`M1240,800 L1410,800 L${1410 + 120 * open},${900} L${1240 - 160 * open},${900} Z`} fill="#f0d0a0" opacity={0.16 * open} />
			{/* porch and steps */}
			<rect x={980} y={800} width={620} height={20} fill="#3a3a40" /><rect x={980} y={820} width={620} height={80} fill="#202228" />
			{[0, 1, 2].map((i) => <rect key={i} x={1000 - i * 60} y={820 + i * 30} width={60} height={30} fill="#2e3036" />)}
			{/* the car at the curb, trunk open (the glow has moved to the bag) */}
			<g transform="translate(470,990) scale(0.62)"><SideCar t={0} trunk={0.15} open={1} people={false} id="bdcar" /></g>
			<Fence y={950} scroll={0} col="#121318" gap={60} h={70} x0={-400} x1={940} />
			<rect x={-400} y={990} width={2800} height={300} fill="#101116" />
			{/* Harvey on the porch, holding out the duffel bag */}
			<Rimmed x={HX} ground={DG} h={360} pose={hp} look={LKB.harvey} col="#120e0e" rim={RIMB} rimOp={0.6} />
			<g transform={`translate(${bagC[0]},${bagC[1]})`}><Glow x={0} y={0} r={120} c={B.halo} o={0.45} id="bdbg" /><rect x={-52} y={-26} width={104} height={52} rx={24} fill="#283438" /><path d="M-40,-24 Q0,-52 40,-24" stroke="#1a2226" strokeWidth={6} fill="none" /><path d="M-36,-12 L36,-12" stroke={B.core} strokeWidth={3} opacity={0.85} /><Glow x={0} y={-12} r={40} c={B.core} o={0.5} id="bdbc" /></g>
			<g fill="#08090c">{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={1650 + i * 70} cy={1000 - 50 * rnd(i, 5)} rx={80} ry={60 + 30 * rnd(i, 6)} />)}</g>
		</Cam>
		<rect width={W} height={H} fill={B.core} opacity={0.45 * ei(seg(t, 116.8, 117.15))} />
	</g>;
};

/* ================= G2 117.0–123.5 (1999): no jar. A block → callipers → +15% → 「找到了！」 → another expert: 「得不出结论」 ================= */
const BC: P2 = [1100, 700], BS = 1.3, REG: P2 = [110, -150], J0 = -10, JN = J0 + 240 / 1.15, JW = J0 + 240;
const bw = (p: P2): P2 => [BC[0] + p[0] * BS, BC[1] + p[1] * BS];
const Calipers: React.FC<{t: number}> = ({t}) => {
	const u = t - 117, pull = ease(seg(u, 0.05, 1.0)), draw = ease(seg(u, 0.1, 0.9)), reg = sm(seg(u, 0.5, 0.95)), slideIn = ease(seg(u, 0.85, 1.25)), widen = ease(seg(u, 1.4, 1.8));
	const plus = eo(seg(u, 1.8, 2.1)), label = sm(seg(u, 1.3, 1.6)), found = seg(t, 118.2, 118.34), expert = ease(seg(t, 120.3, 120.95)), doubt = seg(t, 121.0, 121.14), dim = 1 - 0.6 * sm(seg(t, 121.0, 121.4));
	const rp = bw(REG), cx = lerp(rp[0], 990 + 14 * u, pull), cy = lerp(rp[1], 580, pull), z = lerp(2.8, 1.0 + 0.012 * u, pull);
	const jaw = lerp(JN, JW, widen), off = (1 - slideIn) * 500;
	return <g>
		<Sky id="bg2s" stops={[[0, '#1c2226'], [0.7, '#262c30'], [1, '#121618']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-300} y={880} width={2600} height={400} fill="#14181a" />
			{/* 1999: blinds, binders, a CRT, a pendant */}
			<rect x={80} y={200} width={340} height={420} fill="#34444a" />{Array.from({length: 18}, (_, i) => <rect key={i} x={80} y={206 + i * 23} width={340} height={11} fill="#1e282c" opacity={0.85} />)}<rect x={80} y={200} width={340} height={420} fill="none" stroke="#0c1012" strokeWidth={12} />
			<Shaft id="bg2sh" a={[80, 620]} b={[420, 620]} c={[900, 1100]} d={[200, 1100]} col="#dde6ea" o={0.06} />
			<Shelf x={1740} y={300} w={560} kind="files" seed={3} tone="#262a2c" /><Shelf x={1740} y={450} w={560} kind="files" seed={8} tone="#262a2c" />
			<Pendant x={1100} y={60} len={140} id="bg2p" o={0.5} col="#e8ece8" />
			<g transform="translate(260,880)"><rect x={-180} y={-14} width={360} height={14} fill="#2a2e30" /><rect x={-110} y={-200} width={220} height={186} rx={14} fill="#1a1e20" /><rect x={-90} y={-182} width={180} height={140} rx={10} fill="#2e3c40" /><rect x={-90} y={-182} width={180} height={140} rx={10} fill="#bcd4d8" opacity={0.08 + 0.03 * Math.sin(t * 9)} /><rect x={-40} y={-14} width={80} height={10} fill="#1a1e20" /></g>
			<Motes t={t} x={400} y={300} w={1300} h={600} n={20} o={0.28} />
			{/* the light panel with your outline */}
			<rect x={560} y={330} width={1080} height={700} rx={10} fill="#0e1214" stroke="#2c3438" strokeWidth={10} /><rect x={570} y={340} width={1060} height={680} fill="#dfe8ea" opacity={0.08} />
			<g transform={`translate(${BC[0]},${BC[1]}) scale(${BS})`}>
				<defs><clipPath id="bg2c"><path d={BRAIN_D} /></clipPath></defs>
				<Glow x={0} y={0} r={420} c={B.halo} o={0.18 * dim} id="bg2h" />
				<path d={BRAIN_D} fill={B.mid} opacity={0.12 * draw} />
				<path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={5} opacity={0.75} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
				{FOLDS.map((d, i) => <path key={i} d={d} stroke={B.core} strokeWidth={3.5} fill="none" opacity={0.45 * draw} strokeLinecap="round" />)}
				<g clipPath="url(#bg2c)"><ellipse cx={REG[0]} cy={REG[1]} rx={125} ry={78} fill={B.mid} opacity={0.55 * reg * dim} /><ellipse cx={REG[0]} cy={REG[1]} rx={125} ry={78} fill="none" stroke={B.core} strokeWidth={3} strokeDasharray="10 7" opacity={reg * dim} /></g>
				{/* the block, settling into its place */}
				{reg < 1 && <g opacity={1 - reg}><Glow x={REG[0]} y={REG[1]} r={110} c={B.core} o={0.6} id="bg2b" /><rect x={REG[0] - 30} y={REG[1] - 30} width={60} height={60} rx={6} fill={B.mid} stroke={B.core} strokeWidth={2.5} /></g>}
				{/* callipers: fixed jaw at J0, sliding jaw at `jaw`; dashed ghost = the controls' width */}
				<g transform={`translate(${off},0)`} opacity={slideIn}>
					<rect x={J0 - 30} y={-300} width={340} height={20} rx={3} fill="#9aa2a8" />{Array.from({length: 30}, (_, i) => <rect key={i} x={J0 - 20 + i * 11} y={-300} width={1.6} height={i % 5 ? 7 : 12} fill="#2a2e30" />)}
					<path d={`M${J0 - 14},-280 L${J0 + 6},-280 L${J0 + 6},-175 L${J0},-150 L${J0 - 14},-176 Z`} fill="#b8c0c6" />
					{widen > 0 && <path d={`M${JN - 6},-280 L${JN + 14},-280 L${JN + 14},-176 L${JN},-150 L${JN - 6},-175 Z`} fill="none" stroke="#cfd4cc" strokeWidth={2} strokeDasharray="6 5" opacity={0.8 * dim} />}
					<path d={`M${jaw - 6},-306 L${jaw + 14},-306 L${jaw + 14},-176 L${jaw},-150 L${jaw - 6},-175 Z`} fill="#c8d0d6" />
					<path d={`M${J0},-162 L${jaw},-162`} stroke={INK} strokeWidth={2} strokeDasharray="5 4" opacity={0.7} />
				</g>
				{plus > 0 && <text x={JW + 34} y={-196} style={{fontFamily: SANS, fontWeight: 900, fontSize: 50 * (0.7 + 0.3 * plus)}} fill={dim > 0.7 ? ROSE : '#b8b2a8'} opacity={plus} stroke="rgba(12,8,5,0.6)" strokeWidth={4} paintOrder="stroke">+15%</text>}
				{label > 0 && <g opacity={label}><path d={`M${REG[0] + 90},${REG[1] + 50} L${REG[0] + 200},${REG[1] + 120}`} stroke={INK} strokeWidth={2} opacity={0.7} />
					<text x={REG[0] + 206} y={REG[1] + 136} style={{fontFamily: SANS, fontWeight: 700, fontSize: 25}} fill={INK} stroke="rgba(12,8,5,0.6)" strokeWidth={4} paintOrder="stroke">顶叶：管空间和数学想象</text></g>}
			</g>
			<RStamp x={780} y={500} s="找到了！" k={found} size={44} o={1 - 0.55 * sm(seg(t, 121.0, 121.3))} />
			<RStamp x={800} y={512} s="得不出结论" k={doubt} grey rot={4} size={44} />
			{/* another expert steps in (1999) */}
			{expert > 0 && <g><Rimmed x={lerp(2250, 1800, expert)} ground={1260} h={900} pose={fkPose({...STAND, lean: 6, neck: 10, la: 40, le: 70, ra: 8, re: 14})} look={LKB.expert} flip col="#0c0e10" rim="#d8e0e4" rimOp={0.4} />
				{(() => { const h = jointAt(fkPose({...STAND, lean: 6, neck: 10, la: 40, le: 70, ra: 8, re: 14}), 'LHand', lerp(2250, 1800, expert), 1260, 900, true); return <g transform={`translate(${h[0] - 40},${h[1] - 60}) rotate(-10)`}><rect x={0} y={0} width={86} height={116} fill="#e6e0d2" /><rect x={10} y={14} width={66} height={10} fill="#3a342c" /><rect x={10} y={34} width={56} height={4} fill="#8a8274" /><rect x={10} y={44} width={60} height={4} fill="#8a8274" /></g>; })()}</g>}
		</Cam>
		<rect width={W} height={H} fill="#fff" opacity={0.75 * ei(seg(t, 123.3, 123.5))} />
	</g>;
};

/* ================= G3 123.5–128.25 (2012): the 1955 photo snaps in; a 4th fold where 3 are usual; 「只是假设」 ================= */
const PC: P2 = [1060, 650], GY = [-112, -64, -16, 32];
const Photo: React.FC<{x: number; y: number; s: number; rot: number; t: number; trace: number; nums: number; dimRose?: number}> = ({x, y, s, rot, t, trace, nums, dimRose = 1}) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
	<rect x={-430} y={-320} width={860} height={640} fill="#000" opacity={0.35} transform="translate(10,14)" />
	<rect x={-430} y={-320} width={860} height={640} fill="#ece6da" /><rect x={-400} y={-290} width={800} height={540} fill="#8e8c88" />
	<rect x={-400} y={-290} width={800} height={540} fill="#5a5a58" opacity={0.25 + 0.05 * Math.sin(t * 0.3)} />
	<g transform="translate(0,-10) scale(1.05)">
		<path d={BRAIN_D} fill="#b2b0aa" stroke="#3c3c3a" strokeWidth={5} />
		{FOLDS.slice(1).map((d, i) => <path key={i} d={d} stroke="#4a4a48" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />)}
		{/* the frontal region: three folds as usual, then the fourth traces itself */}
		{GY.map((gy, i) => { const d = `M-282,${gy} C-246,${gy - 16} -206,${gy + 14} -150,${gy - 6}`; const four = i === 3;
			return <g key={i}><path d={d} stroke={four ? ROSE : '#3a3a38'} strokeWidth={four ? 6 : 5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={four ? 1 - trace : 0} opacity={four ? dimRose : 0.85} />
				{nums > i && <text x={-128} y={gy + 9} style={{fontFamily: MONO, fontWeight: 700, fontSize: 32}} fill={four ? ROSE : '#2a2a28'} opacity={four ? dimRose : 1}>{i + 1}</text>}</g>; })}
		{trace > 0 && <Glow x={-215} y={GY[3]} r={90} c={B.halo} o={0.35 * trace * dimRose} id={`bph${Math.round(x)}`} />}
	</g>
	<text x={-400} y={296} style={{fontFamily: MONO, fontSize: 22, fontWeight: 700}} fill="#5a544a">1955</text>
</g>;
const PhotoDesk: React.FC<{t: number}> = ({t}) => {
	const u = t - 123.5, snap = ease(seg(u, 0, 0.22)), shake = Math.exp(-u / 0.12) * Math.sin(u * 70) * 6;
	const trace = ease(seg(t, 124.1, 124.45)), nums = t < 123.85 ? 0 : t < 123.95 ? 1 : t < 124.05 ? 2 : t < 124.4 ? 3 : 4;
	const found = seg(t, 124.55, 124.69), doubt = seg(t, 125.78, 125.92), dimRose = 1 - 0.5 * sm(seg(t, 125.8, 126.2)), push = ei(seg(t, 127.9, 128.3));
	const cx = lerp(1000 + 30 * seg(u, 0.3, 4.4), 900, push) + shake, cy = 600 + shake * 0.5, z = lerp(1.04 + 0.05 * ease(seg(u, 0.3, 4.4)), 2.4, push);
	return <g>
		<Sky id="bg3s" stops={[[0, '#2a221c'], [1, '#1a1410']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 9}, (_, i) => <rect key={i} x={-300} y={-100 + i * 150} width={2600} height={3} fill="#3a2e24" opacity={0.6} />)}
			<Glow x={1650} y={150} r={700} c="#ffe2b8" o={0.18} id="bg3l" />
			<Motes t={t} x={300} y={100} w={1400} h={800} n={16} o={0.25} />
			{/* 2012: a laptop at the edge, a loupe, a pencil, a mug */}
			<g transform="translate(1720,860) rotate(-8)"><rect x={-220} y={-10} width={440} height={240} rx={10} fill="#141618" /><rect x={-200} y={-220} width={400} height={210} rx={8} fill="#1a1c1e" /><rect x={-186} y={-206} width={372} height={184} fill="#9ab0c0" opacity={0.18} /></g>
			<g transform="translate(260,880)"><circle r={70} fill="none" stroke="#14100c" strokeWidth={16} /><circle r={62} fill="#c8d8dc" opacity={0.1} /><rect x={50} y={40} width={120} height={22} rx={10} fill="#14100c" transform="rotate(40 50 40)" /></g>
			<rect x={320} y={300} width={300} height={10} rx={4} fill="#14100c" transform="rotate(-24 320 300)" />
			<g transform="translate(240,240)"><rect x={-60} y={-70} width={120} height={140} rx={14} fill="#14100c" /><path d="M60,-40 Q110,-40 110,0 Q110,40 60,40" stroke="#14100c" strokeWidth={16} fill="none" /></g>
			<Photo x={PC[0]} y={PC[1]} s={lerp(1.25, 1, snap)} rot={lerp(-9, -3, snap)} t={t} trace={trace} nums={nums} dimRose={dimRose} />
			<RStamp x={1320} y={390} s="找到了！" k={found} size={44} rot={-6} o={1 - 0.55 * sm(seg(t, 125.8, 126.1))} />
			<RStamp x={1340} y={406} s="只是假设" k={doubt} grey rot={5} size={46} />
		</Cam>
		<rect width={W} height={H} fill="#fff" opacity={0.85 * (1 - eo(seg(u, 0, 0.28)))} />
	</g>;
};

/* ================= G4 128.25–135.25: the verdict. A ring of 18 researchers; the 「找到了！」 tags slide off; ~240 blocks, none lit ================= */
const RC: P2 = [960, 700], RX = 760, RY = 200;
const RING = Array.from({length: 18}, (_, i) => { const a = (90 + 16 + i * (328 / 17)) * Math.PI / 180, x = RC[0] + RX * Math.cos(a), g = RC[1] + RY * Math.sin(a), d = (Math.sin(a) + 1) / 2;
	return {i, x, g, d, h: lerp(190, 330, d), flip: x > RC[0], look: LKB[['r1', 'r2', 'r3', 'r4', 'r5', 'r6'][i % 6]], photo: i % 2 === 0}; }).sort((a, b) => a.d - b.d);
const HOLD = fkPose({...STAND, lean: 6, neck: 8, ra: 52, re: 40, la: 8, le: 20});
const GRID = Array.from({length: 240}, (_, k) => { const ring = Math.floor(k / 30), j = k % 30, R = 0.34 + ring * 0.062, a = (j / 30) * Math.PI * 2 + ring * 0.11; return {x: RC[0] + RX * R * Math.cos(a), y: RC[1] + RY * R * Math.sin(a), d: (Math.sin(a) + 1) / 2, k}; }).sort((a, b) => a.y - b.y);
const Verdict: React.FC<{t: number}> = ({t}) => {
	const front = RING[RING.length - 1], fh = jointAt(HOLD, 'RHand', front.x, front.g, front.h, front.flip);
	const pull = ease(seg(t, 128.25, 129.5)), up = ease(seg(t, 134.55, 135.3)), crane = ease(seg(t, 131.5, 134.5));
	let cx = lerp(fh[0], 960 + 10 * Math.sin(t * 0.4), pull), cy = lerp(fh[1] - 20, lerp(610, 640, crane), pull), z = lerp(2.4, lerp(1.0, 0.94, crane), pull);
	cx = lerp(cx, 960, up); cy = lerp(cy, 150, up); z = lerp(z, 1.3, up);
	const fade = sm(seg(t, 131.6, 132.6)), cubesIn = (k: number) => sm(seg(t, 131.9 + 0.9 * rnd(k, 3), 132.3 + 0.9 * rnd(k, 3)));
	return <g>
		<Sky id="bg4s" stops={[[0, '#0e1214'], [0.55, '#161c1e'], [1, '#0c0f10']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-600} y={480} width={3200} height={1000} fill="#14191b" />
			<ellipse cx={RC[0]} cy={RC[1]} rx={RX * 1.25} ry={RY * 1.3} fill="#1a2022" />
			{Array.from({length: 7}, (_, i) => <rect key={i} x={-400 + i * 420} y={-400} width={4} height={880} fill="#222a2c" />)}
			<Shelf x={-300} y={300} w={700} kind="files" seed={2} tone="#1e2426" /><Shelf x={1500} y={300} w={700} kind="files" seed={7} tone="#1e2426" />
			{/* the empty spotlight */}
			<line x1={960} y1={-300} x2={960} y2={90} stroke="#0a0c0c" strokeWidth={3} /><path d="M914,116 Q960,72 1006,116 Z" fill="#1a1c1c" />
			<path d={`M930,118 L990,118 L${960 + 250},${RC[1]} L${960 - 250},${RC[1]} Z`} fill="#efe6d8" opacity={0.05} />
			<ellipse cx={RC[0]} cy={RC[1]} rx={250} ry={62} fill="#efe6d8" opacity={0.12} /><ellipse cx={RC[0]} cy={RC[1]} rx={150} ry={36} fill="#efe6d8" opacity={0.08} />
			<Motes t={t} x={700} y={150} w={520} h={540} n={18} o={0.3} />
			{/* ~240 blocks in their grid, none lit */}
			{GRID.map((c) => { const o = cubesIn(c.k); if (o <= 0) return null; const s = 7 + 7 * c.d; return <rect key={c.k} x={c.x - s} y={c.y - s * 1.2} width={s * 2} height={s * 1.6} rx={2} fill="#3c302c" stroke="#7a5a50" strokeWidth={1} strokeOpacity={0.5} opacity={o} />; })}
			{/* six thin paper stacks */}
			{[0, 1, 2, 3, 4, 5].map((i) => { const a = (122 + i * 55) * Math.PI / 180, x = RC[0] + RX * 0.86 * Math.cos(a), y = RC[1] + RY * 0.86 * Math.sin(a); return <g key={i}>{Array.from({length: 5}, (_, k) => <rect key={k} x={x - 26} y={y - 4 - k * 4} width={52} height={4} fill={k % 2 ? '#d8d2c4' : '#bcb6a8'} />)}</g>; })}
			{/* 18 researchers, each with a block or a photo; the items light up one by one, then go dark */}
			{RING.map((r) => { const hand = jointAt(HOLD, 'RHand', r.x, r.g, r.h, r.flip), on = sm(seg(t, 128.6 + 0.09 * r.i, 128.75 + 0.09 * r.i)) * (1 - 0.8 * fade), sc = r.h / 330;
				return <g key={r.i} opacity={lerp(0.75, 1, r.d) * (1 - 0.35 * fade)}>
					<Rimmed x={r.x} ground={r.g} h={r.h} pose={HOLD} look={r.look} flip={r.flip} col="#0e1112" rim={RIMB} rimOp={0.35 + 0.25 * r.d} />
					{r.photo ? <g transform={`translate(${hand[0]},${hand[1] - 16 * sc}) scale(${sc}) rotate(-6)`}><rect x={-24} y={-18} width={48} height={36} fill="#ece6da" /><rect x={-19} y={-13} width={38} height={26} fill="#8e8c88" /><path d={'M-12,2 Q-10,-9 0,-9 Q12,-9 12,2 Q6,8 -12,2 Z'} fill="#b2b0aa" /><rect x={-24} y={-18} width={48} height={36} fill="#fff4e4" opacity={0.25 * on} /></g>
						: <g transform={`translate(${hand[0]},${hand[1] - 14 * sc}) scale(${sc})`}>{on > 0.05 && <Glow x={0} y={0} r={50} c={B.halo} o={0.4 * on} id={`bg4c${r.i}`} />}<rect x={-15} y={-15} width={30} height={30} rx={4} fill={B.mid} opacity={0.3 + 0.6 * on} stroke={B.core} strokeWidth={1.5} strokeOpacity={on} /></g>}
				</g>; })}
			{/* the three 「找到了！」 tags, then they slide off */}
			{[3, 8, 13].map((ri, j) => { const r = RING.find((q) => q.i === ri)!, k = sm(seg(t, 128.9 + 0.2 * j, 129.05 + 0.2 * j)), off = ei(seg(t, 131.6 + 0.12 * j, 132.2 + 0.12 * j));
				return <g key={j} transform={`translate(${off * (j - 1) * 120},${off * 260}) rotate(${off * (j - 1.2) * 40} ${r.x} ${r.g - r.h - 40})`} opacity={1 - off}><RStamp x={r.x} y={r.g - r.h - 40} s="找到了！" k={k} size={26} rot={-6 + 4 * j} /></g>; })}
			<rect x={-600} y={1000} width={3200} height={500} fill="#090b0c" opacity={0.6} />
		</Cam>
		<rect width={W} height={H} fill="#d8e0e8" opacity={0.3 * ei(seg(t, 134.95, 135.35))} />
	</g>;
};

/* ================= T1 135.25–140.5: the open sky (match from the ashes) → a museum drawer, 「藏品」 → F1: the blocks rise and reassemble ================= */
const WIN = {x: 560, y: 60, w: 800, h: 450}, WZ = W / 800;
const SLIDES = Array.from({length: 30}, (_, i) => ({c: i % 10, r: Math.floor(i / 10)}));
const BRAIN_AT: P2 = [960, 430];
const Museum: React.FC<{t: number}> = ({t}) => {
	const back = ease(seg(t, 135.85, 136.9)), down = ease(seg(t, 136.6, 137.6)), open = ease(seg(t, 136.95, 137.5)), rise = ease(seg(t, 138.8, 139.8));
	const fly = (i: number) => ease(seg(t, 138.85 + 0.02 * i, 139.55 + 0.02 * i)), whole = sm(seg(t, 139.6, 139.95)), cubes = sm(seg(t, 139.25, 139.6)) * (1 - whole);
	let cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2 - 3 * (t - 135.25), z = lerp(WZ * (1.04 - 0.01 * (t - 135.25)), 1.0, back);
	cx = lerp(cx, 960, down); cy = lerp(cy, 770, down); z = lerp(z, 1.9 + 0.04 * (t - 137.6), down);
	cy = lerp(cy, 480, rise); z = lerp(z, 1.0, rise);
	const dy = 110 * open, slideXY = (i: number): P2 => [800 + SLIDES[i].c * 36, 742 + SLIDES[i].r * 22 + dy * 0.4];
	return <g>
		<Sky id="bmus" stops={[[0, '#14191c'], [1, '#0e1113']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={-400} y={-300} width={2800} height={1700} fill="#1a2024" />
			{/* the tall window: the same open sky */}
			<defs><clipPath id="bmwc"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath></defs>
			<g clipPath="url(#bmwc)"><AshSky t={t} ash={0} id="bmsky" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} /></g>
			<rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="none" stroke="#0c1012" strokeWidth={18} /><path d={`M${WIN.x + WIN.w / 2},${WIN.y} V${WIN.y + WIN.h}`} stroke="#0c1012" strokeWidth={10} opacity={sm(seg(t, 136.2, 136.8))} />
			<Shaft id="bmsh" a={[WIN.x, WIN.y + WIN.h]} b={[WIN.x + WIN.w, WIN.y + WIN.h]} c={[1500, 1100]} d={[300, 1100]} col="#dfe6ea" o={0.06} />
			<Motes t={t} x={400} y={500} w={1100} h={500} n={22} o={0.3} />
			{/* flat-drawer cabinets */}
			{[-1, 0, 1].map((k) => <g key={k} transform={`translate(${960 + k * 560},0)`}><rect x={-250} y={600} width={500} height={420} fill="#232b30" stroke="#2e383e" strokeWidth={4} />
				{Array.from({length: 5}, (_, j) => <g key={j}><rect x={-236} y={614 + j * 80} width={472} height={70} fill="#28323a" /><rect x={-40} y={630 + j * 80} width={80} height={22} fill="#c8c2b4" opacity={0.45} /><rect x={-60} y={662 + j * 80} width={120} height={6} rx={3} fill="#151a1d" /></g>)}</g>)}
			{/* the open drawer: rows of glass slides glowing faintly */}
			<g>
				<rect x={724} y={700} width={472} height={dy + 10} fill="#151b1e" />
				<g opacity={open}>{SLIDES.map((s, i) => { const k = fly(i), [x0, y0] = slideXY(i), tx = BRAIN_AT[0] + (rnd(i, 7) - 0.5) * 420, ty = BRAIN_AT[1] + (rnd(i, 8) - 0.5) * 260, x = lerp(x0, tx, k), y = lerp(y0, ty, k) - 120 * Math.sin(Math.PI * k), sz = lerp(1, 1.8, k);
					return <g key={i} opacity={1 - sm(seg(k, 0.85, 1))}><rect x={x - 14 * sz} y={y - 4 * sz} width={28 * sz} height={8 * sz} rx={1} fill="#d8e8ec" opacity={0.4} /><rect x={x - 5 * sz} y={y - 4 * sz} width={10 * sz} height={8 * sz} fill={B.mid} opacity={0.5 + 0.4 * k + 0.1 * Math.sin(t * 2 + i)} /></g>; })}</g>
				<Glow x={960} y={700 + dy * 0.5} r={240} c={B.halo} o={0.25 * open * (1 - rise)} id="bmdg" />
				<g transform={`translate(0,${dy})`}><rect x={714} y={694} width={492} height={74} fill="#2c3840" stroke="#3a4850" strokeWidth={3} /><rect x={936} y={740} width={48} height={8} rx={4} fill="#151a1d" />
					<g transform="translate(830,706)"><rect x={0} y={0} width={100} height={30} fill="#efe8da" /><text x={50} y={23} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 21}} fill="#3a2e24">藏品</text></g></g>
			</g>
			{/* F1: the pieces reassemble along the grid into you */}
			{cubes > 0 && <BrainLight x={BRAIN_AT[0]} y={BRAIN_AT[1]} s={0.62} id="bmbc" cubes explode={1.4 * (1 - sm(seg(t, 139.25, 139.75)))} o={cubes} nums={false} />}
			{whole > 0 && <BrainLight x={BRAIN_AT[0]} y={BRAIN_AT[1]} s={0.62} id="bmbw" o={whole} />}
		</Cam>
	</g>;
};
/** F1 → K1: the whole brain shrinks into the boy's head in the house (demo House on its own clock) */
const HOUSE_T0 = 140.25, houseT = (t: number) => t - HOUSE_T0 + 19.75;
const Home: React.FC<{t: number}> = ({t}) => {
	const tm = houseT(t), k = ease(seg(t, 140.2, 140.95)), kh = kidHeadScreen(tm), x = lerp(960, kh[0], k), y = lerp(480, kh[1], k), s = lerp(0.62, 0.035, k), o = 1 - sm(seg(t, 140.8, 141.0));
	return <g><House t={tm} />{o > 0 && <BrainLight x={x} y={y} s={s} id="bhb" o={o} />}</g>;
};

/* ================= the film from 95.5 ================= */
type Sc = {a: number; b: number; C: React.FC<{t: number}>; x: number};
/** x = dissolve into this scene (seconds, centred on a); every boundary is a camera move or a glow match */
const SCENES: Sc[] = [
	{a: 95.5, b: 105.5, C: Lab, x: 0}, {a: 105.5, b: 108.5, C: Drive, x: 0.2}, {a: 108.5, b: 110.3, C: Behind, x: 0.14}, {a: 110.3, b: 111.5, C: Odo, x: 0.18},
	{a: 111.5, b: 117.0, C: Door, x: 0.3}, {a: 117.0, b: 123.5, C: Calipers, x: 0.24}, {a: 123.5, b: 128.25, C: PhotoDesk, x: 0.06}, {a: 128.25, b: 135.25, C: Verdict, x: 0.2},
	{a: 135.25, b: 140.4, C: Museum, x: 0.4}, {a: 140.4, b: 142.0, C: Home, x: 0.4}, {a: 142.0, b: 160.6, C: NeedleEnd, x: 0.24},
];
export const RoughB: React.FC<{t: number}> = ({t}) => {
	const parts: React.ReactNode[] = [];
	SCENES.forEach((S, i) => { const x0 = S.x / 2, x1 = (SCENES[i + 1]?.x ?? 0) / 2;
		if (t < S.a - x0 || t >= S.b + x1) return;
		const o = x0 > 0 ? sm(seg(t, S.a - x0, S.a + x0)) : 1;
		parts.push(<g key={i} opacity={o}><S.C t={Math.max(S.a, Math.min(S.b + x1, t))} /></g>); });
	return <>{parts}</>;
};

/* ---------- suggested furniture data for the master (Builder A): film times, ✓ rows only ---------- */
/** [film time the line starts, stamp line 1 (year · place), stamp line 2 (≤10 字)] */
export const B_STAMPS: [number, string, string][] = [
	[95.5, '1985 · 美国 伯克利', '对照：11个普通男性'], [105.5, '1997 · 美国公路', '作家帕特尼蒂开车'], [111.5, '1997 · 美国 伯克利', '爱因斯坦的孙女伊芙琳'],
	[117.0, '1999 · 《柳叶刀》', '对照：35个男性大脑'], [123.5, '2012 · 美国 佛罗里达', '右额叶4道褶'], [128.25, '1955–2015', '6篇论文（福尔克）'],
	[135.25, '2026 · 今天', '两家医学博物馆收着'], [138.75, '1955 – 今天', '研究你的人'], [142.0, '约1884 · 慕尼黑', '那只指南针'], [145.5, '爱因斯坦', '柏林纪念牌上的原话'],
];
/** counter keys [film time, value, roll s]; dimmed from 138.75, hidden from 152.75 */
export const B_COUNTER: [number, number, number][] = [[95.5 + 0.8, 106, 2.4], [105.5 + 0.8, 117, 0.4], [117.0 + 0.8, 120, 0.3], [123.5 + 0.8, 133, 0.35], [128.25 + 0.8, 136, 0.3], [135.25 + 0.8, 147, 0.4]];
void gaitPose; void Frame; void H;
