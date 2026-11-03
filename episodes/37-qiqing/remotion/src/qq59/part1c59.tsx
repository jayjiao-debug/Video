import React from 'react';
import {D, BT, BEAT} from './lines59';
import {W, H, rnd, seg, lerp, sm, eo, ei, f1, Glow, Sky, Cam, CamT, Par, Planks, WireFence} from './bg59';
import {Walker, walkG, walkTo, STAGE, PZ, grounded, fkPose, mixPose, withArms, nod, Rim, Pose, Look59, BRISK, BL, cartParts, CART_PAINT, LitParts, Part} from './figure59';
import {trap} from './demo59';
/* ep59 part 1, bars 34–50 (film 58.1 → 85.4 s): the arrest on the Russian shore (and the passport with no entry stamp); the 90 days in,
   90 days out (he marks the spot, goes, comes back to it); the sponsors' patches blown off; the refusal stamp; the dawn he doesn't go
   home; the long night highway across America (the break); the embassy steps, one per beat, up to the drop on bar 50 (part 2). */
type P2 = [number, number];
const pulse = (t: number, hits: number[], k = 9) => hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * k) : 0), 0);
const shake = (t: number, t0: number, amp: number, dur = 0.2) => { const u = seg(t, t0, t0 + dur); return u > 0 && u < 1 ? amp * (1 - u) * Math.sin(u * 60) : 0; };

/* ====================== the arrest, Chukotka, April 2006 (bars 34–36): a searchlight snaps on with the downbeat; border guards walk into
   the beam; one holds up the passport — the camera pushes into it: no entry stamp; it slams shut on bar 36 ====================== */
const RG = 900, RH = 300;
const GUARD: Look59 = {dress: 'coat', head: 'cap', build: 1.06, paint: {coat: '#14181a'}};
const SHIELD = grounded({lean: -2, neck: -4, lt: 2, lk: 2, rt: -4, rk: 3, la: 150, le: 70, ra: 6, re: 16});
const HOLD = grounded({lean: 2, neck: -2, lt: 2, lk: 2, rt: -4, rk: 3, la: 96, le: 24, ra: 4, re: 14});
export const PP_IN = D(35) - 0.12, PP_SHUT = BT(35, 3.1);
export const Arrest: React.FC<{t: number}> = ({t}) => {
	const on = t >= D(34), flick = on ? 1 - 0.35 * Math.max(0, 1 - (t - D(34)) / 0.08) : 0, sweep = Math.sin(Math.min(1, (t - D(34)) / 0.6) * Math.PI / 2);
	const beamTo: P2 = [lerp(1900, 1300, sweep), lerp(1150, 860, sweep)];
	const shield = sm(seg(t, D(34) + 0.05, D(34) + 0.35));
	const g1 = walkTo(t, D(34) + 0.25, BT(34, 3), -120, 860, RH * 1.04, PZ.stand), g2 = walkTo(t, D(34) + 0.45, BT(34, 3.3), -320, 640, RH * 1.06, PZ.stand);
	const hold = sm(seg(t, BT(34, 3), BT(34, 3.4)));
	const push = seg(t, BT(34, 3.4), PP_IN + 0.3), cam: CamT = {cx: lerp(1000, 1040, push), cy: lerp(600, 560, push), z: 1.02 + 0.06 * seg(t, D(34), BT(34, 3.4))};
	const RIM_BEAM: Rim[] = [{c: '#f4f8ff', o: 0.85 * (on ? 1 : 0), dx: -2.6, dy: -1.2}, {c: '#5a6a8a', o: 0.3, dx: 2, dy: -1}];
	const RIM_G: Rim[] = [{c: '#f4f8ff', o: 0.55 * (on ? 1 : 0), dx: 2.6, dy: -1.2}];
	const pp = sm(seg(t, PP_IN, PP_IN + 0.32));
	return <g>
		<Sky id="ars" stops={[[0, '#03050b'], [0.55, '#0c1222'], [0.72, '#1a2234']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.1}>{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 1) * 2200 - 140} cy={rnd(i, 2) * 560} r={0.8 + 1.4 * rnd(i, 3)} fill="#e8eef8" opacity={0.35 + 0.4 * rnd(i, 4)} />)}</Par>
		<Par cam={cam} k={0.3}>
			<path d="M-600,760 Q200,700 700,730 Q1300,756 2000,720 Q2600,700 3200,740 L3200,800 L-600,800 Z" fill="#1c2232" />
			{Array.from({length: 9}, (_, i) => <rect key={i} x={1500 + i * 46 + 20 * rnd(i, 5)} y={714 + 10 * rnd(i, 6)} width={8} height={7} fill="#ffcf8a" opacity={0.5 + 0.3 * rnd(i, 7)} />)}
		</Par>
		<Cam {...cam}>
			<rect x={-2000} y={RG - 40} width={8000} height={900} fill="#232a38" />
			<path d={`M-2000,${RG - 40} Q0,${RG - 60} 1400,${RG - 36} T4000,${RG - 44}`} stroke="#4a5670" strokeWidth={4} fill="none" />
			{/* the tracked carrier and its roof searchlight */}
			<g transform="translate(160,0)">
				<path d={`M-200,${RG - 20} L-200,${RG - 170} L-40,${RG - 170} L0,${RG - 250} L150,${RG - 250} L190,${RG - 170} L240,${RG - 160} L240,${RG - 20} Z`} fill="#0b0d12" />
				<rect x={-220} y={RG - 60} width={480} height={60} rx={30} fill="#07080b" />{Array.from({length: 7}, (_, i) => <circle key={i} cx={-180 + i * 66} cy={RG - 30} r={20} fill="#15181e" />)}
				<rect x={110} y={RG - 290} width={56} height={40} rx={8} fill="#0b0d12" /><circle cx={168} cy={RG - 270} r={16} fill={on ? '#ffffff' : '#30343c'} />
			</g>
			{on && <g opacity={flick}>
				<defs><linearGradient id="beamg" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor="#f4f8ff" stopOpacity="0.55" /><stop offset="1" stopColor="#c8d8f0" stopOpacity="0.06" /></linearGradient>
					<radialGradient id="beamp"><stop offset="0" stopColor="#e8f0ff" stopOpacity="0.5" /><stop offset="1" stopColor="#c8d8f0" stopOpacity="0" /></radialGradient></defs>
				<path d={`M328,${RG - 270} L${f1(beamTo[0] + 260)},${f1(beamTo[1] - 520)} L${f1(beamTo[0] + 200)},${f1(beamTo[1] + 120)} Z`} fill="url(#beamg)" />
				<ellipse cx={beamTo[0] - 180} cy={RG - 10} rx={520} ry={70} fill="url(#beamp)" />
				<Glow x={328} y={RG - 270} r={220} c="#f4f8ff" o={0.9} id="srcg" />
			</g>}
			{/* the two of them in the light, the sleds beside them, an arm up against the glare */}
			<Walker x={1300} ground={RG} h={RH} pose={mixPose(PZ.stand, SHIELD, shield)} look={STAGE.kIce} rims={RIM_BEAM} col="#160a0b" />
			<Walker x={1470} ground={RG} h={RH * 0.97} pose={mixPose(PZ.stand, SHIELD, shield * 0.8)} look={{...STAGE.kIce, paint: {body: '#0e1420', coat: '#1a2740', gear: '#4e4a44'}}} rims={RIM_BEAM} col="#0c0e14" />
			<g fill="#3a1414"><rect x={1530} y={RG - 26} width={180} height={26} rx={10} /><rect x={1080} y={RG - 26} width={180} height={26} rx={10} /></g>
			{/* the guards: long coats, peaked caps; the first holds up the passport */}
			<Walker x={g2.x} ground={RG} h={RH * 1.06} pose={g2.pose} look={GUARD} rims={RIM_G} col="#07080a" />
			<Walker x={g1.x} ground={RG} h={RH * 1.04} pose={g1.moving ? g1.pose : mixPose(PZ.stand, HOLD, hold)} look={GUARD} rims={RIM_G} col="#07080a"
				extra={hold > 0.05 ? [{d: (() => { const hx = g1.x + (HOLD.LHand[0]) * RH * 1.04, hy = RG - HOLD.LHand[1] * RH * 1.04; return `M${f1(hx)},${f1(hy - 30)} L${f1(hx + 44)},${f1(hy - 34)} L${f1(hx + 44)},${f1(hy + 4)} L${f1(hx)},${f1(hy + 8)} Z`; })(), role: 'gear', fill: '#d8d2c4'}] : []} />
		</Cam>
		{on && t < D(34) + 0.07 && <rect x={0} y={0} width={W} height={H} fill="#f4f8ff" opacity={0.55} />}
		{pp > 0 && <Passport t={t} o={pp} />}
	</g>;
};
/** the insert: the open passport in the searchlight; the page of entry stamps is empty (one box circled); then the right leaf swings over
    onto the left (page side foreshortening, then the dark back cover growing), and the closed booklet pushes into the lens */
const Passport: React.FC<{t: number; o: number}> = ({t, o}) => {
	const shut = ei(seg(t, PP_SHUT, PP_SHUT + 0.3)), into = ei(seg(t, PP_SHUT + 0.26, D(36) + 0.02));
	const z = Math.exp(lerp(Math.log(0.55), Math.log(1.0), eo(seg(t, PP_IN, PP_IN + 0.35)))) * (1 + 0.04 * seg(t, PP_IN + 0.35, PP_SHUT)) * Math.exp(2.2 * into);
	const circ = seg(t, BT(35, 1.2), BT(35, 1.9));
	const pw = 640, ph = 860, spine = 960, top = 540 - ph / 2, lw = pw * Math.cos(Math.PI * shut);
	return <g opacity={o} transform={`translate(${f1(960 - 320 * into)},540) scale(${z.toFixed(4)}) rotate(${f1(-4 + 2 * shut)}) translate(-960,-540)`}>
		<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#0a0c12" opacity={0.9} />
		<Glow x={960} y={480} r={1100} c="#e8f0ff" o={0.35} id="ppl" />
		<defs><linearGradient id="ppg" x1="0" y1="0" x2="1" y2="0"><stop offset="0.85" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.25" /></linearGradient></defs>
		{/* left page: the photo box (a faceless head) and the lines */}
		<rect x={spine - pw} y={top} width={pw} height={ph} fill="#e6dcc6" /><rect x={spine - pw} y={top} width={pw} height={ph} fill="url(#ppg)" />
		<rect x={spine - pw + 60} y={top + 120} width={220} height={280} fill="#b8b0a0" /><circle cx={spine - pw + 170} cy={top + 230} r={56} fill="#2a2622" /><path d={`M${spine - pw + 80},${top + 400} Q${spine - pw + 170},${top + 290} ${spine - pw + 260},${top + 400} Z`} fill="#2a2622" />
		{Array.from({length: 7}, (_, i) => <rect key={i} x={spine - pw + 320} y={top + 140 + i * 44} width={240 - 40 * (i % 3)} height={12} rx={4} fill="#8a8272" />)}
		{Array.from({length: 3}, (_, i) => <rect key={i} x={spine - pw + 60} y={top + 560 + i * 40} width={520} height={10} rx={4} fill="#9a9282" opacity={0.6} />)}
		{/* right leaf: the VISAS page with empty stamp boxes while open; it swings over the spine (its back is the dark cover) */}
		{lw >= 0 ? <g transform={`translate(${spine},0) scale(${Math.max(0.001, lw / pw).toFixed(4)},1) translate(${-spine},0)`}>
			<rect x={spine} y={top} width={pw} height={ph} fill="#ebe2cc" />
			<text x={spine + pw / 2} y={top + 92} textAnchor="middle" style={{fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: '0.3em'}} fill="#6a6252">VISAS</text>
			{Array.from({length: 6}, (_, i) => { const x = spine + 60 + (i % 2) * 280, y = top + 150 + Math.floor(i / 2) * 220;
				return <rect key={i} x={x} y={y} width={240} height={180} rx={14} fill="none" stroke="#a89e88" strokeWidth={4} strokeDasharray="14 10" />; })}
			{circ > 0 && <path d={(() => { const n = Math.max(2, Math.round(64 * circ)); return 'M' + Array.from({length: n + 1}, (_, i) => { const a = -2.2 + (i / 64) * Math.PI * 2.1, r = 150 + 8 * Math.sin(a * 3); return `${f1(spine + 180 + Math.cos(a) * r)},${f1(top + 240 + Math.sin(a) * r * 0.78)}`; }).join(' L'); })()}
				stroke="#c8402e" strokeWidth={10} fill="none" strokeLinecap="round" />}
			{circ > 0.6 && <text x={spine + 180} y={top + 272} textAnchor="middle" style={{fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 96}} fill="#c8402e" opacity={sm(seg(circ, 0.6, 1))}>?</text>}
			<rect x={spine} y={top} width={pw} height={ph} fill="#000" opacity={0.5 * shut} />
		</g> : <g>
			<rect x={spine + lw} y={top - 6} width={-lw} height={ph + 12} rx={10} fill="#3a1418" />
			<rect x={spine + lw + 40 * (-lw / pw)} y={top + 34} width={(-lw) * 0.86} height={ph - 68} rx={6} fill="none" stroke="#a88a4a" strokeWidth={3} opacity={0.6} />
		</g>}
	</g>;
};

/* ====================== 90 days in, 90 days out (bars 36–38): he walks the snow with the cart; on day 90 he drives a stake at his last step
   and is gone; the stake stands alone while the snow melts; on day 180 he is back at it and walks on ====================== */
const VG = 900, VH = 330, V_STOP = BT(36, 2.8), V_GONE = D(37) + 0.05, V_BACK = BT(37, 3);
const STAKE_X = 1150;
const PLANT = grounded({lean: 34, neck: 10, lt: 30, lk: 50, rt: -10, rk: 30, la: 40, le: 10, ra: 70, re: 10});
export const Visa90: React.FC<{t: number}> = ({t}) => {
	const w = walkTo(t, D(36) - 1.6, V_STOP, STAKE_X - 760, STAKE_X - 70, VH, PZ.stand);
	const plant = sm(seg(t, V_STOP, V_STOP + 0.2)) * (1 - sm(seg(t, V_STOP + 0.35, V_STOP + 0.55)));
	const gone = sm(seg(t, V_GONE - 0.12, V_GONE + 0.18)), back = sm(seg(t, V_BACK - 0.15, V_BACK + 0.15));
	const summer = sm(seg(t, D(37) + 0.1, V_BACK - 0.15));
	const stake = t >= V_STOP + 0.15;
	const wb = walkG(t, D(38) - 0.25, STAKE_X - 70, VH, BRISK, 0.9);
	const kx = t < V_BACK ? w.x : (t < D(38) - 0.25 ? STAKE_X - 70 : wb.x), kp = t < V_BACK ? (w.moving ? w.pose : mixPose(PZ.stand, PLANT, plant)) : (t < D(38) - 0.25 ? PZ.stand : wb.pose);
	const ko = t < V_BACK ? 1 - gone : back, kd = t < V_BACK ? (kx - (STAKE_X - 760)) / VH : 3 + (kx - STAKE_X) / VH;
	const cam: CamT = {cx: 1000, cy: 560, z: lerp(1.0, 1.08, seg(t, D(36), D(38)))};
	const RIM_V: Rim[] = [{c: summer > 0.5 ? '#ffe8c0' : '#e8eef6', o: 0.5, dx: -2.4, dy: -1.6}];
	return <g>
		<Sky id="vsw" stops={[[0, '#6c7888'], [0.5, '#aab4c0'], [0.7, '#d4d8de']]} x={-200} y={-200} w={2400} h={1500} />
		<g opacity={summer}><Sky id="vss" stops={[[0, '#4a7aa0'], [0.5, '#9ac0d8'], [0.7, '#e8e4c8']]} x={-200} y={-200} w={2400} h={1500} /></g>
		<Par cam={cam} k={0.3}>
			{Array.from({length: 26}, (_, i) => { const x = -600 + i * 130 + 50 * rnd(i, 1), hh = 140 + 90 * rnd(i, 2);
				return <path key={i} d={`M${x},760 L${x + 40},${760 - hh} L${x + 80},760 Z`} fill={summer > 0.5 ? '#2c4a30' : '#3a4650'} opacity={0.9} />; })}
			<rect x={-2000} y={756} width={7000} height={600} fill="#e8edf2" /><rect x={-2000} y={756} width={7000} height={600} fill="#5c7a3e" opacity={summer} />
		</Par>
		<Cam {...cam}>
			<rect x={-2000} y={VG - 30} width={8000} height={800} fill="#e2e8ee" /><rect x={-2000} y={VG - 30} width={8000} height={800} fill="#6a8a44" opacity={summer} />
			{/* birches: white trunks with dark marks; their crowns leaf out in the summer */}
			{[[300, 1.0], [520, 0.9], [1620, 1.1], [1880, 0.95]].map(([x, s], i) => <g key={i}>
				<rect x={x} y={VG - 520 * s} width={22 * s} height={520 * s} fill="#e4e2dc" />
				{Array.from({length: 6}, (_, j) => <rect key={j} x={x} y={VG - 520 * s + 60 + j * 70} width={22 * s * (0.4 + 0.5 * rnd(j, i))} height={6} fill="#1e1e22" />)}
				<g opacity={summer}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + 11 + (rnd(j, i + 3) - 0.5) * 200 * s} cy={VG - 520 * s + 30 + rnd(j, i + 4) * 160} rx={80 * s} ry={50 * s} fill={['#4a7a3a', '#5a8a44', '#3e6a32'][j % 3]} />)}</g>
			</g>)}
			{/* the stake at the spot (an orange ribbon fluttering on its own clock) */}
			{stake && <g><rect x={STAKE_X - 4} y={VG - 130} width={9} height={132} fill="#2a2420" />
				<path d={`M${STAKE_X + 4},${VG - 124} q30,${f1(-6 + 6 * Math.sin(t * 9))} 58,${f1(4 * Math.sin(t * 7))} q-26,${f1(10 + 4 * Math.sin(t * 9 + 1))} -58,16 Z`} fill="#d8682a" /></g>}
			<g opacity={ko}><Walker x={kx} ground={VG} h={VH} pose={kp} look={summer > 0.5 ? {...STAGE.kRussia, dress: 'jacket'} : STAGE.kRussia} rims={RIM_V} cart="orange" dist={kd} col="#0c0d0e" /></g>
			{/* falling snow while it is winter */}
			{Array.from({length: 70}, (_, i) => { const x = ((rnd(i, 1) * 2600 + t * 30 * rnd(i, 4)) % 2600) - 300, y = ((rnd(i, 2) * 1300 + t * (90 + 80 * rnd(i, 3))) % 1300) - 100;
				return <circle key={i} cx={f1(x)} cy={f1(y)} r={2 + 2.5 * rnd(i, 5)} fill="#ffffff" opacity={0.75 * (1 - summer)} />; })}
		</Cam>
	</g>;
};

/* ====================== 2008: the sponsors go (bars 38–40): his cart close; on each beat a sponsor patch peels off and the wind takes it ====================== */
const SH = 640, SG = 1020, CART_X = 640;
const PATCHES: {u: number; v: number; at: number; shape: 'round' | 'shield' | 'rect' | 'hex'; c: string; g: string}[] = [
	{u: -0.23, v: 0.22, at: BT(38, 1), shape: 'round', c: '#e2d8be', g: '#2e5a6e'},
	{u: -0.05, v: 0.29, at: BT(38, 2), shape: 'shield', c: '#3e7a76', g: '#f0e8d0'},
	{u: 0.12, v: 0.19, at: BT(38, 3), shape: 'rect', c: '#d8a440', g: '#2a2018'},
	{u: -0.1, v: 0.11, at: D(39), shape: 'hex', c: '#b8463a', g: '#f6ecd6'},
];
const patchD = (shape: string, r: number) => shape === 'round' ? `M${-r},0 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`
	: shape === 'shield' ? `M${-r},${-r} L${r},${-r} L${r},${r * 0.2} Q${r},${r} 0,${r * 1.25} Q${-r},${r} ${-r},${r * 0.2} Z`
	: shape === 'rect' ? `M${-r * 1.3},${-r * 0.8} L${r * 1.3},${-r * 0.8} L${r * 1.3},${r * 0.8} L${-r * 1.3},${r * 0.8} Z`
	: `M${r},0 L${r * 0.5},${r * 0.87} L${-r * 0.5},${r * 0.87} L${-r},0 L${-r * 0.5},${-r * 0.87} L${r * 0.5},${-r * 0.87} Z`;
const glyphD = (shape: string, r: number) => shape === 'round' ? `M${-r * 0.55},${r * 0.35} L${-r * 0.1},${-r * 0.4} L${r * 0.15},${0} L${r * 0.3},${-r * 0.2} L${r * 0.6},${r * 0.35} Z`
	: shape === 'shield' ? `M0,${-r * 0.55} L${r * 0.18},${-r * 0.1} L${r * 0.55},0 L${r * 0.18},${r * 0.12} L0,${r * 0.6} L${-r * 0.18},${r * 0.12} L${-r * 0.55},0 L${-r * 0.18},${-r * 0.1} Z`
	: shape === 'rect' ? `M${-r * 0.7},${r * 0.35} L0,${-r * 0.45} L${r * 0.7},${r * 0.35} Z`
	: `M${-r * 0.4},${-r * 0.3} L${r * 0.4},${-r * 0.3} L${r * 0.4},${r * 0.3} L${-r * 0.4},${r * 0.3} Z`;
export const Sponsors: React.FC<{t: number}> = ({t}) => {
	const kick = pulse(t, PATCHES.map((p) => p.at), 8) * 0.03, u = seg(t, D(38), D(40));
	const cam: CamT = {cx: lerp(800, 860, u), cy: lerp(700, 680, u), z: lerp(1.1, 1.2, u) + kick};
	const look = sm(seg(t, BT(38, 1) + 0.05, BT(38, 1) + 0.3)) * (1 - sm(seg(t, D(39) + 0.3, D(39) + 0.7))), bow = sm(seg(t, D(39) + 0.35, D(39) + 0.9));
	const pose = nod(mixPose(PZ.stand, PZ.lookUp, 0.5 * look), 24 * bow);
	const c = cartParts(CART_X, SG, SH, [0.0, 0.06], 0.4, 'orange');
	/* the load's frame (the patches ride on it): cart frame u/v → screen, from the same parked geometry */
	const C = c.at;
	const RIM_S: Rim[] = [{c: '#e0d8cc', o: 0.45, dx: -2.4, dy: -1.6}, {c: '#8a96a8', o: 0.25, dx: 2, dy: -1}];
	return <g>
		<Sky id="sps" stops={[[0, '#3a4252'], [0.5, '#6a7080'], [0.75, '#9a9488']]} x={-200} y={-200} w={2400} h={1500} />
		<Par cam={cam} k={0.3}><path d="M-800,820 Q300,790 1200,810 T3200,800 L3200,900 L-800,900 Z" fill="#4a4846" /></Par>
		<Cam {...cam}>
			<rect x={-2000} y={SG - 50} width={8000} height={600} fill="#3a3632" />
			<LitParts parts={[...c.back.map((p) => ({...p, fill: p.fill ?? (p.role === 'load' ? CART_PAINT.orange.load : undefined)})), ...c.front]} rims={RIM_S} k={SH / 450} col="#0c0b0d" />
			{PATCHES.map((p, i) => { const k = seg(t, p.at - 0.06, p.at + 1.1), peel = sm(seg(t, p.at - 0.06, p.at + 0.08)), fly = seg(t, p.at + 0.05, p.at + 1.1); const base = C(p.u, p.v), r = 0.078 * SH;
				if (fly >= 1) return null;
				const x = base[0] + 1400 * ei(fly) + 120 * fly, y = base[1] - 900 * eo(fly) + 300 * fly * fly, rot = 720 * fly * (i % 2 ? 1 : -1), sy = 1 - 0.6 * peel * (1 - fly) + 0.6 * peel * fly * 0;
				return <g key={i} transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f1(1 - 0.3 * fly)},${f1(Math.max(0.25, sy))})`} opacity={1 - sm(seg(fly, 0.6, 1)) * (k > 0 ? 1 : 0) + (k <= 0 ? 0 : 0)}>
					<path d={patchD(p.shape, r)} fill={p.c} stroke="#1a1612" strokeWidth={4} /><path d={glyphD(p.shape, r)} fill={p.g} /></g>; })}
			<Walker x={CART_X + 250} ground={SG} h={SH} pose={pose} look={{...STAGE.k2012, pack: 'none'}} rims={RIM_S} flip col="#0c0b0d" />
		</Cam>
		{/* the wind: streaks on their own clock */}
		{Array.from({length: 24}, (_, i) => { const x = ((rnd(i, 1) * 2400 + t * 1500) % 2600) - 300, y = rnd(i, 2) * 1000;
			return <path key={i} d={`M${f1(x)},${f1(y)} q120,-10 260,-4`} stroke="#e8e4dc" strokeWidth={2} fill="none" opacity={0.18} />; })}
	</g>;
};

/* ====================== 2012: refused (bars 40–42): the form on the desk; the stamp comes down out of the frame and lands on beat 3 of bar 40
   (the camera jolts); it lifts away and leaves REFUSED in red; then the camera pushes into the red ====================== */
const STAMP_HIT = BT(40, 2), REDP: P2 = [1010, 600];
export const Refused: React.FC<{t: number}> = ({t}) => {
	const down = seg(t, D(40) - 0.1, STAMP_HIT), lift = seg(t, STAMP_HIT + 0.22, BT(41, 0.8));
	const sz = t < STAMP_HIT ? lerp(2.4, 1.0, ei(down)) : lerp(1.0, 2.8, eo(lift)), so = t < STAMP_HIT ? sm(down * 3) : 1 - sm(lift);
	const ink = t >= STAMP_HIT, bounce = t >= STAMP_HIT ? Math.exp(-(t - STAMP_HIT) * 10) * Math.sin((t - STAMP_HIT) * 50) * 6 : 0;
	const sx = shake(t, STAMP_HIT, 14, 0.2), sy = shake(t + 0.03, STAMP_HIT, 10, 0.2);
	const push = ei(seg(t, D(42) - 0.42, D(42) + 0.02)), cam: CamT = {cx: lerp(960, REDP[0], sm(push)), cy: lerp(560, REDP[1], sm(push)), z: Math.exp(lerp(Math.log(1.0 + 0.04 * seg(t, D(40), D(42))), Math.log(9), push))};
	return <g transform={`translate(${f1(sx)},${f1(sy)})`}>
		<Cam {...cam}>
			<Planks id="rf" />
			<rect x={-400} y={-300} width={2720} height={1700} fill="#1a2030" opacity={0.35} />
			<g transform={`translate(960,${f1(560 + bounce)}) rotate(-3)`}>
				<rect x={-372} y={-472} width={760} height={980} fill="#000" opacity={0.35} transform="translate(14,18)" />
				<rect x={-380} y={-480} width={760} height={980} fill="#ece4d2" />
				<text x={-320} y={-370} style={{fontFamily: "'DejaVu Serif', serif", fontWeight: 700, fontSize: 64, letterSpacing: '0.12em'}} fill="#3a342c">VISA</text>
				<text x={-318} y={-326} style={{fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 400, fontSize: 24, letterSpacing: '0.2em'}} fill="#6a6252">APPLICATION</text>
				<rect x={150} y={-420} width={170} height={210} fill="#c8c0ae" /><circle cx={235} cy={-336} r={44} fill="#4a443c" /><path d="M170,-210 Q235,-300 300,-210 Z" fill="#4a443c" />
				{Array.from({length: 12}, (_, i) => <g key={i}><rect x={-320} y={-250 + i * 58} width={110} height={10} rx={4} fill="#8a8272" /><rect x={-190} y={-238 + i * 58} width={480 - 60 * (i % 3)} height={3} fill="#a89e88" /></g>)}
				{ink && <g transform={`translate(${REDP[0] - 960},${REDP[1] - 560 - 20}) rotate(-9)`} opacity={0.92}>
					<rect x={-270} y={-92} width={540} height={184} rx={14} fill="none" stroke="#b8302a" strokeWidth={14} />
					<rect x={-250} y={-72} width={500} height={144} rx={8} fill="none" stroke="#b8302a" strokeWidth={4} />
					<text x={0} y={36} textAnchor="middle" style={{fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 104, letterSpacing: '0.06em'}} fill="#b8302a">REFUSED</text>
					{Array.from({length: 40}, (_, i) => <circle key={i} cx={(rnd(i, 1) - 0.5) * 520} cy={(rnd(i, 2) - 0.5) * 170} r={3 + 6 * rnd(i, 3)} fill="#ece4d2" opacity={0.7} />)}
				</g>}
			</g>
			{/* the stamp from straight above: its shadow, the square base, the round wooden knob */}
			{so > 0.01 && <g opacity={so}>
				<rect x={REDP[0] - 290 * sz + 60 * (sz - 1)} y={REDP[1] - 110 * sz + 70 * (sz - 1)} width={580 * sz} height={220 * sz} rx={20} fill="#000" opacity={0.3 / sz} transform={`rotate(-9 ${REDP[0]} ${REDP[1]})`} />
				<g transform={`translate(${REDP[0]},${REDP[1]}) rotate(-9) scale(${sz.toFixed(3)})`}>
					<rect x={-290} y={-110} width={580} height={220} rx={18} fill="#2a1e18" /><rect x={-270} y={-92} width={540} height={184} rx={14} fill="#3a2a20" />
					<circle cx={0} cy={0} r={86} fill="#5a3a24" /><circle cx={-20} cy={-20} r={40} fill="#7a5034" opacity={0.6} /></g></g>}
		</Cam>
	</g>;
};

/* ====================== he did not go home (bars 42–44): dawn, red out of the stamp's red; he lifts his head, and on bar 43 sets off again ====================== */
const AGH = 400, AG2 = 900, A_X0 = 700;
export const againWalk = (t: number) => walkG(t, D(43), A_X0, AGH, BRISK, 1);
export const againCam = (t: number): CamT => { const w = againWalk(t), rise = sm(seg(t, D(42), D(44) + 0.8));
	return {cx: Math.max(980, w.x + 200), cy: lerp(580, 520, rise), z: 1.0}; };
const RIM_DAWN: Rim[] = [{c: '#ffb070', o: 0.85, dx: 2.8, dy: -1.4}, {c: '#ffd8a8', o: 0.3, dx: -1.8, dy: -1.6}];
export const Again: React.FC<{t: number}> = ({t}) => {
	const w = againWalk(t), moving = t >= D(43), lift = sm(seg(t, BT(42, 1.2), BT(42, 2.2))), cam = againCam(t);
	const pose = moving ? w.pose : nod(PZ.stand, 26 * (1 - lift));
	const red = 1 - sm(seg(t, D(42), D(42) + 0.35));
	return <g>
		<Par cam={cam} k={0.2}><Sky id="ags" stops={[[0, '#0c1430'], [0.35, '#2a2a50'], [0.55, '#7a3a4a'], [0.66, '#d0603c'], [0.72, '#ffb060']]} x={-800} y={-1000} w={3600} h={2400} /></Par>
		<Par cam={cam} k={0.06}><Glow x={1320} y={760} r={640} c="#ff9a4a" o={0.55} id="agsun" /><circle cx={1320} cy={772} r={92} fill="#ffd89a" /></Par>
		<Par cam={cam} k={0.3}><path d="M-1400,770 L-600,744 L0,762 L700,740 L1500,764 L2300,746 L3200,770 L3200,900 L-1400,900 Z" fill="#2a1a22" /></Par>
		<Cam {...cam}>
			<rect x={-3000} y={790} width={12000} height={700} fill="#1c1218" />
			<rect x={-3000} y={AG2 - 18} width={12000} height={40} fill="#3a2a2c" /><path d={`M-3000,${AG2 + 2} H9000`} stroke="#ffb070" strokeWidth={2} opacity={0.3} />
			<WireFence x0={-2600} x1={8000} y={830} gap={160} col="#120a0e" />
			<Walker x={w.x} ground={AG2} h={AGH} pose={pose} look={STAGE.k2012} rims={RIM_DAWN} cart="orange" dist={moving ? w.dist : 0} col="#0c080a" />
		</Cam>
		{red > 0 && <rect x={0} y={0} width={W} height={H} fill="#b8302a" opacity={red} />}
	</g>;
};

/* ====================== the night highway (bars 44–48, the break): one long take; trucks pass in the far lane and their light sweeps over
   him; the camera draws back and up until he is small on the road across the dark; dawn comes up at the end; 0 → 5,000 km ====================== */
export const HW_IN = D(44) - 0.2;
const TRUCKS = [BT(44, 2.5), BT(46, 0.5), BT(47, 1.5)];
export const highwayCam = (t: number): CamT => { const a = againCam(t), k = trap(seg(t, D(45) + 0.6, D(48) - 0.1), 0.35);
	return {cx: a.cx + 260 * k, cy: lerp(a.cy, 430, k), z: Math.exp(lerp(Math.log(1.0), Math.log(0.5), k))}; };
export const Highway: React.FC<{t: number}> = ({t}) => {
	const w = againWalk(t), cam = highwayCam(t), dawn = sm(seg(t, BT(46, 3), D(48)));
	const trucks = TRUCKS.map((t0) => { const u = (t - t0) / 1.6; return {u, x: lerp(cam.cx + 1800 / cam.z, cam.cx - 1900 / cam.z, u)}; }).filter((q) => q.u > -0.1 && q.u < 1.1);
	const sweep = trucks.reduce((a, q) => Math.max(a, Math.exp(-Math.pow((q.x - w.x - 600) / 380, 2))), 0);
	const RIM_N: Rim[] = [{c: '#ffe8c0', o: 0.15 + 0.75 * sweep, dx: 2.6, dy: -1.2}, {c: '#7a8ab0', o: 0.35, dx: -2, dy: -1.4}, {c: '#ffb070', o: 0.6 * dawn, dx: 2.4, dy: -1.6}];
	return <g>
		<Par cam={cam} k={0.2}><Sky id="hws" stops={[[0, '#03040a'], [0.45, '#0a1020'], [0.62, '#141c30'], [0.7, '#1c2438']]} x={-1600} y={-1600} w={5200} h={3200} />
			<g opacity={dawn}><Sky id="hwd" stops={[[0, '#141c34'], [0.45, '#3a4466'], [0.6, '#a07068'], [0.68, '#e8a070']]} x={-1600} y={-1600} w={5200} h={3200} /></g>
			{Array.from({length: 110}, (_, i) => <circle key={i} cx={rnd(i, 1) * 4400 - 1200} cy={rnd(i, 2) * 1500 - 800} r={0.8 + 1.5 * rnd(i, 3)} fill="#e8eef8" opacity={(0.3 + 0.5 * rnd(i, 4)) * (1 - dawn)} />)}</Par>
		<Par cam={cam} k={0.32}>
			<path d="M-3000,772 L-1800,736 L-900,758 L0,728 L900,752 L1800,722 L2800,754 L3800,730 L5000,760 L5000,820 L-3000,820 Z" fill="#0c1018" />
			{Array.from({length: 40}, (_, i) => <rect key={i} x={-2800 + rnd(i, 5) * 7000} y={746 + rnd(i, 6) * 30} width={6} height={5} fill="#ffcf8a" opacity={(0.3 + 0.5 * rnd(i, 7)) * (1 - 0.6 * dawn)} />)}
			<Glow x={4200} y={760} r={700} c="#ffb070" o={0.25} id="hwtown" />
		</Par>
		<Cam {...cam}>
			<rect x={-6000} y={800} width={24000} height={1400} fill="#0e1016" />
			{/* the road: the far lane (trucks), the centre line, the near lane, the shoulder he walks on */}
			<rect x={-6000} y={812} width={24000} height={62} fill="#16181e" /><path d="M-6000,843 H18000" stroke="#e8d8a8" strokeWidth={4} strokeDasharray="70 80" opacity={0.5} />
			<rect x={-6000} y={874} width={24000} height={26} fill="#1a1c22" /><path d="M-6000,900 H18000" stroke="#d8d8d0" strokeWidth={3} opacity={0.3} />
			{Array.from({length: 40}, (_, i) => { const x = -3000 + i * 460; return <g key={i}><rect x={x} y={560} width={9} height={252} fill="#06070a" /><rect x={x - 30} y={576} width={70} height={7} fill="#06070a" /></g>; })}
			<path d={Array.from({length: 40}, (_, i) => `M${-3000 + i * 460},${580} Q${-2770 + i * 460},${612} ${-2540 + i * 460},${580}`).join(' ')} stroke="#06070a" strokeWidth={2} fill="none" />
			{trucks.map((q, i) => <g key={i} transform={`translate(${f1(q.x)},842)`}>
				<path d="M-1400,-30 L-60,-50 L-60,20 L-1400,40 Z" fill="#fff2d0" opacity={0.08} />
				<Glow x={-40} y={-20} r={260} c="#fff2d0" o={0.6} id={`trk${i}`} />
				<path d="M-40,-10 L-40,-150 L60,-150 L80,-110 L120,-100 L120,-10 Z M140,-10 L140,-190 L640,-190 L640,-10 Z" fill="#05060a" />
				<rect x={630} y={-60} width={10} height={16} fill="#ff4a3a" opacity={0.85} />
				{[0, 200, 520, 600].map((wx) => <circle key={wx} cx={wx} cy={-6} r={26} fill="#020203" />)}</g>)}
			<Walker x={w.x} ground={AG2} h={AGH} pose={w.pose} look={STAGE.k2012} rims={RIM_N} cart="orange" dist={w.dist} col="#08080b" />
		</Cam>
	</g>;
};

/* ====================== the embassy steps (bars 48–50, the build): dawn; one step up on every beat, the sign under his arm; the camera low and
   rising with him, pushing in harder toward the drop (part 2 cuts in on the downbeat of bar 50) ====================== */
const EH = 400, EX0 = 520, EG = 1000, RISE = 0.1, RUN = 0.19;
/** feet on the treads: L lands on odd treads (1, 3, 5, 7, 9), R on even ones (2, 4, 6, 8); each swing takes 0.3 s from its beat */
const stepBeat = (k: number) => D(48) + k * BEAT;
const footAt = (side: 'L' | 'R', t: number): P2 => {
	const ks = side === 'L' ? [0, 2, 4, 6, 8] : [1, 3, 5, 7];
	let from = 0, to = 0, u = 0;
	for (const k of ks) { const tr = k + 1, s = seg(t, stepBeat(k), stepBeat(k) + 0.3); if (s > 0) { from = to; to = tr; u = s; } }
	const tread = (n: number): P2 => [n * RUN + 0.05 + (side === 'L' ? 0.012 : 0), n * RISE + 0.045];
	const a = tread(from), b = tread(to), e = sm(u);
	return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + 0.12 * Math.sin(Math.PI * u) * (to > from ? 1 : 0)];
};
const L1 = BL.thigh, L2 = BL.shin;
const knee = (root: P2, ank: P2): P2 => { const dx = ank[0] - root[0], dy = ank[1] - root[1], d = Math.min(L1 + L2 - 1e-4, Math.hypot(dx, dy)), a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))), base = Math.atan2(dy, dx);
	const ang = base + a; return [root[0] + Math.cos(ang) * L1, root[1] + Math.sin(ang) * L1]; };
export const climbPose = (t: number): Pose => {
	const fl = footAt('L', t), fr = footAt('R', t), ph = (t - D(48)) / BEAT;
	const want = (fl[1] + fr[1]) / 2 + 0.56;
	const reach = (f: P2, hx: number) => { const dx = f[0] - hx; return f[1] + 0.066 + Math.sqrt(Math.max(0, (L1 + L2 - 0.02) ** 2 - dx * dx)); };
	const hx = (fl[0] + fr[0]) / 2 + 0.05, hy = Math.min(want, reach(fl, hx), reach(fr, hx));
	const base = fkPose({hip: hy, hipX: hx, lean: 10, neck: 2, lt: 0, lk: 0, rt: 0, rk: 0, la: 6, le: 14, ra: 14 + 18 * Math.sin(ph * Math.PI), re: 26});
	const o: Pose = {...base};
	const leg = (s: 'L' | 'R', f: P2) => { const root: P2 = [hx + 0.028 * (s === 'L' ? 1 : -1) * 0.3, hy - 0.066], an: P2 = [f[0], f[1]];
		o[`${s}Up`] = root; o[`${s}Knee`] = knee(root, an); o[`${s}Ank`] = an; o[`${s}Toe`] = [an[0] + BL.foot, an[1] - BL.ankle]; };
	leg('L', fl); leg('R', fr);
	return o;
};
export const Steps: React.FC<{t: number}> = ({t}) => {
	const pose = climbPose(t), k = pulse(t, Array.from({length: 8}, (_, i) => stepBeat(i)), 10) * (0.01 + 0.004 * seg(t, D(48), D(50)) * 8);
	/* the camera rises with him at an even rate (not step by step): the climb's average line */
	const sl = Math.max(0, Math.min(8.5, (t - D(48)) / BEAT + 0.4)), wx = EX0 + (sl * RUN + 0.1) * EH, wy = EG - (sl * RISE + 0.62) * EH, u = seg(t, D(48) - 0.3, D(50));
	const cam: CamT = {cx: wx + 120, cy: wy - 30, z: Math.exp(lerp(Math.log(0.92), Math.log(1.3), ei(u) * 0.6 + u * 0.4)) + k, r: -2.5};
	const hand: P2 = [EX0 + pose.LHand[0] * EH, EG - pose.LHand[1] * EH];
	const sign: Part = {d: `M${f1(hand[0] - 70)},${f1(hand[1] - 10)} L${f1(hand[0] + 80)},${f1(hand[1] - 18)} L${f1(hand[0] + 86)},${f1(hand[1] + 92)} L${f1(hand[0] - 64)},${f1(hand[1] + 100)} Z`, role: 'gear', fill: '#b49a72'};
	const RIM_E: Rim[] = [{c: '#d8dee8', o: 0.5, dx: -2.4, dy: -1.6}, {c: '#ffcf9a', o: 0.35, dx: 2.2, dy: -1.2}];
	const n = 11, treadX = (i: number) => EX0 + i * RUN * EH, treadY = (i: number) => EG - i * RISE * EH;
	return <g>
		<Par cam={cam} k={0.2}><Sky id="ess" stops={[[0, '#1e2430'], [0.5, '#3e4656'], [0.72, '#6a7080'], [0.8, '#9a8c84']]} x={-1600} y={-1800} w={5200} h={3600} /></Par>
		<Cam {...cam}>
			{/* the portico above the top landing: plinth, columns (lit edge, shadow side), the architrave; the dark doorway behind */}
			{(() => { const ty = treadY(n), x0 = treadX(n) - 40; return <g>
				<rect x={x0 - 200} y={ty - 1500} width={2600} height={1500} fill="#1a1e26" />
				<rect x={x0 + 520} y={ty - 760} width={300} height={760} fill="#0a0c10" />
				{Array.from({length: 6}, (_, i) => { const cx = x0 + 60 + i * 300; return <g key={i}><rect x={cx} y={ty - 1100} width={110} height={1100} fill="#8a9098" /><rect x={cx} y={ty - 1100} width={34} height={1100} fill="#60666e" />
					<rect x={cx - 16} y={ty - 1120} width={142} height={30} fill="#9aa0a8" /><rect x={cx - 16} y={ty - 30} width={142} height={30} fill="#7a8088" /></g>; })}
				<rect x={x0 - 220} y={ty - 1260} width={2600} height={150} fill="#7c828c" /><rect x={x0 - 220} y={ty - 1120} width={2600} height={18} fill="#5a6068" />
			</g>; })()}
			{/* the steps in profile, each tread with a lit nose */}
			{Array.from({length: n + 1}, (_, i) => <g key={i}>
				<rect x={treadX(i)} y={treadY(i) - 0.5} width={2400} height={RISE * EH + 1} fill={i % 2 ? '#7e848e' : '#767c86'} />
				<rect x={treadX(i)} y={treadY(i) - 3} width={2400} height={5} fill="#c8ccd4" opacity={0.6} /></g>)}
			<rect x={-1600} y={EG} width={6000} height={500} fill="#2a2e36" />
			<LitParts parts={(() => { const c = cartParts(EX0 - 330, EG, EH, [0.0, 0.06], 0.3, 'orange'); return [...c.back.map((p) => ({...p, fill: p.fill ?? (p.role === 'load' ? CART_PAINT.orange.load : undefined)})), ...c.front]; })()} rims={RIM_E} k={EH / 450} col="#0b0b0e" />
			<Walker x={EX0} ground={EG} h={EH} pose={pose} look={STAGE.k2012} rims={RIM_E} extra={[sign]} col="#0b0b0e" />
		</Cam>
	</g>;
};
void eo; void withArms;
