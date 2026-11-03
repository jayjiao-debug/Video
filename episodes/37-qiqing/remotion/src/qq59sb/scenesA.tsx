import React from 'react';
import {W, H, P, BEAT, STRIDE, rnd, seg, sm, eio, eout, lerp, Glow, Sky, Blur, Shaft, Cam, Par, ridgeD, pineD, leafD, frondD, lianaD, Specks, Glints, Trav, LK, POSE, walkAt, hand, fkPose, grounded, seated, spline, poly, Label, GOLD, GOLD_HI, CREAM, FIG, Shape} from './kit59';
/* ep59 storyboard · scenes A: the Americas and the Bering Strait (bars 21–33).
   Every scene takes u = seconds since its row started and d = the row's length. Screen direction: home is always to the right. */
export type SP = {u: number; d: number};
const f1 = (v: number) => v.toFixed(1);

/* ============ the Darién jungle (shared set) ============ */
const JungleBG: React.FC<{scroll: number; u: number; ground: number; swamp?: boolean}> = ({scroll, u, ground, swamp}) => <g>
	<Sky id="jg_s" stops={[[0, '#2d4a42'], [0.45, '#1a322d'], [1, '#0c1715']]} />
	<Glow x={1500} y={-40} r={900} c="#d8e8c0" o={0.22} id="jg_g" />
	{/* far trunks + canopy */}
	<Par dx={scroll} k={0.25}>{Array.from({length: 22}, (_, i) => { const x = -200 + i * 120 + rnd(i, 1) * 60, w = 16 + 40 * rnd(i, 2);
		return <path key={i} d={`M${x - w / 2},${ground} L${x - w * 0.35},-20 L${x + w * 0.35},-20 L${x + w / 2},${ground} Z`} fill="#1d3a33" opacity={0.85} />; })}
		{Array.from({length: 16}, (_, i) => <ellipse key={i} cx={-200 + i * 170 + rnd(i, 4) * 80} cy={30 + rnd(i, 5) * 90} rx={170 + 80 * rnd(i, 6)} ry={90 + 40 * rnd(i, 7)} fill="#16302a" />)}</Par>
	{[0, 1, 2].map((i) => <Shaft key={i} id={`jg_sh${i}`} pts={[[1300 + i * 230, -40], [1390 + i * 230, -40], [760 + i * 260, ground], [560 + i * 260, ground]]} col="#e8f0c8" o={0.11} />)}
	<Par dx={scroll} k={0.45}>{Array.from({length: 9}, (_, i) => { const x = -100 + i * 280 + rnd(i, 11) * 90, w = 50 + 60 * rnd(i, 12);
		return <g key={i}><path d={`M${x - w / 2},${ground} L${x - w * 0.3},-20 L${x + w * 0.3},-20 L${x + w / 2},${ground} Z`} fill="#122723" />
			<path d={`M${x - w * 1.4},${ground} Q${x - w * 0.6},${ground - 60} ${x - w * 0.3},${ground - 220} L${x + w * 0.3},${ground - 220} Q${x + w * 0.6},${ground - 60} ${x + w * 1.4},${ground} Z`} fill="#122723" /></g>; })}
		{Array.from({length: 14}, (_, i) => <path key={i} d={lianaD(-150 + i * 160 + rnd(i, 21) * 70, -20, 260 + 380 * rnd(i, 22), 40 * Math.sin(u * 0.8 + i))} stroke="#0f211d" strokeWidth={3 + 4 * rnd(i, 23)} fill="none" />)}</Par>
	<Par dx={scroll} k={0.6}>{Array.from({length: 12}, (_, i) => <path key={i} d={frondD(-150 + i * 190 + rnd(i, 61) * 80, -30, 300 + 160 * rnd(i, 62), 70 + 40 * rnd(i, 63), 0.4, 12, 0.2)} fill="#0f221e" />)}
		{Array.from({length: 6}, (_, i) => { const x = -100 + i * 420 + rnd(i, 71) * 120, y = ground - 260 - 120 * rnd(i, 72);
			return <g key={i} fill="#10231f">{[-150, -110, -70, -30, 10].map((a, j) => <path key={j} d={leafD(x, y, 230 + 60 * rnd(i * 5 + j, 73), a + 20 * rnd(i, 74), undefined, 0.25)} />)}<rect x={x - 7} y={y} width={14} height={ground - y} /></g>; })}</Par>
	{/* low mist */}
	<Blur id="jg_mist" s={40}><ellipse cx={700} cy={ground - 90} rx={900} ry={90} fill="#9fbcae" opacity={0.12} /><ellipse cx={1600} cy={ground - 60} rx={700} ry={70} fill="#9fbcae" opacity={0.1} /></Blur>
	{/* mid foliage at ground level */}
	<Par dx={scroll} k={0.75}>{Array.from({length: 18}, (_, i) => { const x = -200 + i * 150 + rnd(i, 31) * 60, a = -150 + 120 * rnd(i, 32);
		return <path key={i} d={leafD(x, ground + 10, 160 + 120 * rnd(i, 33), a, undefined, 0.1)} fill={i % 2 ? '#0f201c' : '#132824'} />; })}
		{Array.from({length: 10}, (_, i) => <path key={i} d={frondD(-100 + i * 260, ground + 20, 260, -60 - 50 * rnd(i, 41), 0.5, 11)} fill="#0d1c19" />)}</Par>
	{!swamp && <rect x={-400} y={ground} width={W + 800} height={H} fill="#0a1311" />}
	{!swamp && <path d={`M-400,${ground + 4} Q${W / 2},${ground - 14} ${W + 400},${ground + 6}`} stroke="#3a4a3c" strokeWidth={3} opacity={0.5} fill="none" />}
</g>;
const FgLeaves: React.FC<{scroll: number; seed?: number}> = ({scroll, seed = 0}) => <Par dx={scroll} k={1.5}>
	<Blur id={`jg_fg${seed}`} s={5}><g fill="#040807">
		{[0, 1, 2, 3].map((i) => <path key={i} d={leafD(1700 + i * 520 + rnd(i, seed) * 100, 1180, 520, -110 - 20 * i, 120, 0.12)} />)}
		{[0, 1, 2].map((i) => <path key={`b${i}`} d={leafD(-80 + i * 700, 1160, 430, -60 + 25 * i, 100, 0.1)} />)}
		<path d={frondD(2050, -40, 600, 150, 0.6, 14, 0.18)} /></g></Blur></Par>;

/** bar 21 · match cut on his stride into the jungle */
export const DarienIn: React.FC<SP> = ({u}) => {
	const h = 620, g = 1012, v = 150, dist = v * (u - 0.7 * 1.70444), pose = walkAt(dist, h), scroll = -v * u;
	return <g><Cam z={1.02 + 0.01 * u} px={-6 * u}>
		<JungleBG scroll={scroll} u={u} ground={g} />
		<Trav x={880} g={g} h={h} pose={pose} look={LK.young} side={1} rimOp={0.55} rim="#ffe6bb" />
		<FgLeaves scroll={scroll} />
	</Cam></g>;
};

/** bars 22–23 · waist-deep in the swamp, machete raised, the jungle closing in */
export const Jungle: React.FC<SP> = ({u, d}) => {
	const h = 760, wl = 800, g = wl + 0.58 * h, v = 50, scroll = -v * u;
	/* the chop lands on each downbeat: raised → through in 0.1 bar, hold, then lift again over the second half of the bar */
	const ph = ((u / (BEAT * 4)) % 1), up = ph < 0.1 ? 1 - sm(ph / 0.1) : ph < 0.5 ? 0 : sm((ph - 0.5) / 0.5);
	const pose = fkPose({hip: 0.62, lean: 14 - 6 * up, neck: -4, lt: 16, lk: 20, rt: -12, rk: 24, la: lerp(72, 150, up), le: lerp(-4, 60, up), ra: 30, re: 50});
	const x = 900 + 40 * u / d, hd = hand(pose, 'LHand', x, g, h), el = hand(pose, 'LElb', x, g, h);
	const dx = hd[0] - el[0], dy = hd[1] - el[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
	const bl = (s: number, w: number): P => [hd[0] + ux * s * h + nx * w * h, hd[1] + uy * s * h + ny * w * h];
	const machete: Shape = {d: spline([bl(0.0, -0.007), bl(0.05, -0.008), bl(0.17, -0.02), bl(0.215, -0.006), bl(0.2, 0.012), bl(0.06, 0.01), bl(0.0, 0.008)])};
	const bob = 5 * Math.sin(u * 3.4);
	return <g><Cam z={1.03} px={-10 * u} py={bob}>
		<JungleBG scroll={scroll} u={u} ground={wl} swamp />
		<rect x={-400} y={wl} width={W + 800} height={H} fill="#16302b" />
		{/* reflections of the trunks, and floating leaves */}
		<Par dx={scroll} k={0.45}><g fill="#0d1d1a" opacity={0.7}>{Array.from({length: 9}, (_, i) => { const x0 = -100 + i * 280 + rnd(i, 11) * 90, w = 50 + 60 * rnd(i, 12); return <rect key={i} x={x0 - w / 2} y={wl} width={w} height={260} />; })}</g></Par>
		{/* mangrove: trunks on arching prop roots, every one different */}
		<Par dx={scroll} k={0.8}>{Array.from({length: 6}, (_, i) => { const x0 = -60 + i * 380 + rnd(i, 51) * 120, top = wl - 220 - 80 * rnd(i, 52), tw = 26 + 18 * rnd(i, 53), nr = 4 + Math.floor(3 * rnd(i, 54));
			return <g key={i} fill="none" stroke="#0a1513" strokeLinecap="round">
				<path d={`M${x0},${top} L${x0 + 10 * (rnd(i, 55) - 0.5)},-40`} strokeWidth={tw} />
				{Array.from({length: nr}, (_, j) => { const k = (j / (nr - 1)) * 2 - 1, sy = top + 10 + 70 * rnd(i * 9 + j, 56), ex = x0 + k * (110 + 90 * rnd(i * 9 + j, 57)), cy = sy - 30 - 60 * rnd(i * 9 + j, 58);
					return <path key={j} d={`M${x0 + k * 6},${sy} Q${lerp(x0, ex, 0.55) + k * 30},${cy} ${ex},${wl + 8}`} strokeWidth={5 + 7 * rnd(i * 9 + j, 59)} />; })}</g>; })}</Par>
		<Glints t={u} y0={wl + 8} y1={H} n={80} col="#c8e0d4" o={0.22} seed={3} speed={-20} />
		<Par dx={scroll} k={1.1}><g fill="#1f3a30">{Array.from({length: 14}, (_, i) => <ellipse key={i} cx={-200 + i * 170 + rnd(i, 81) * 80} cy={wl + 30 + 220 * Math.pow(rnd(i, 82), 1.5)} rx={16 + 26 * rnd(i, 83)} ry={5 + 6 * rnd(i, 84)} />)}</g></Par>
		{/* the liana he is cutting through: the lower piece drops after each chop */}
		<path d={lianaD(x + 0.42 * h, -40, bl(0.2, 0)[1] - 6, 14)} stroke="#0a1513" strokeWidth={9} fill="none" />
		<path d={`M${x + 0.42 * h},${bl(0.2, 0)[1] + 12 + 240 * (1 - up) * Math.min(1, ph * 3)} l${-8},${260}`} stroke="#0a1513" strokeWidth={9} fill="none" opacity={up > 0.5 ? 0 : 1} />
		<Trav x={x} g={g} h={h} pose={pose} look={LK.young} side={1} rimOp={0.6} rim="#ffe6bb" extra={[machete]} pack={0.7} roll={false} />
		{/* the water over his legs + ripples at the waterline */}
		<rect x={-400} y={wl} width={W + 800} height={H} fill="#16302b" opacity={0.94} />
		<Glints t={u + 3} y0={wl + 8} y1={H} n={40} col="#c8e0d4" o={0.18} seed={9} speed={-20} />
		{[0, 1, 2].map((i) => { const k = ((u * 0.9 + i / 3) % 1); return <ellipse key={i} cx={x - 10} cy={wl + 4} rx={110 + 170 * k} ry={10 + 16 * k} fill="none" stroke="#b8d4c8" strokeWidth={2.5} opacity={0.5 * (1 - k)} />; })}
		<path d={`M-400,${wl} L${W + 400},${wl}`} stroke="#8fb0a2" strokeWidth={2} opacity={0.4} />
		<FgLeaves scroll={scroll} seed={1} />
	</Cam></g>;
};

/* ============ bar 24 · Panama: the cell, 18 marks ============ */
export const Jail: React.FC<SP> = ({u, d}) => {
	const p = u / d, z = lerp(1.0, 1.08, eio(p)), g = 930, h = 560;
	const st = seated({lean: -4, neck: -6, la: 86, le: 8, ra: 10, re: 60});
	const x = 1330, seat = g - st.seat * h, hd = hand(st.pose, 'LHand', x, g, h, true);
	const n = Math.min(18, Math.ceil(18 * seg(u, 0.15, d * 0.7))), marks: React.ReactNode[] = [];
	/* tally groups of five, written left to right; the newest mark sits right at his hand */
	const gx = (i: number) => hd[0] - 22 - (17 - i) * 26 - Math.floor((17 - i) / 5) * 26;
	for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), inG = i % 5, x0 = gx(i), y0 = hd[1] - 40 + (rnd(i, 3) - 0.5) * 6;
		if (inG === 4) { const xa = gx(i - 4) - 8; marks.push(<path key={i} d={`M${xa},${y0 + 62} L${xa + 120},${y0 + 4}`} stroke="#d8d0c0" strokeWidth={4} strokeLinecap="round" opacity={0.85} />); }
		else marks.push(<path key={i} d={`M${x0},${y0} L${x0 + 3},${y0 + 66}`} stroke={i === n - 1 && n < 18 ? GOLD_HI : '#d8d0c0'} strokeWidth={4} strokeLinecap="round" opacity={0.85} />);
		void grp; }
	const barsZ = lerp(1.0, 3.2, eio(seg(p, 0, 0.6)));
	return <g><Cam z={z} px={-40 * eio(p)}>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#242a2f" />
		{/* back wall: plaster blocks, damp stains */}
		{Array.from({length: 9}, (_, r) => Array.from({length: 12}, (_, c) => <rect key={`${r}_${c}`} x={-120 + c * 190 + (r % 2) * 95} y={40 + r * 104} width={182} height={96} fill="#2a3036" opacity={0.6 + 0.3 * rnd(r * 12 + c, 2)} />))}
		{/* high window with bars, and its shaft */}
		<rect x={1130} y={220} width={210} height={150} fill="#c9c2b0" opacity={0.9} />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={1150 + i * 50} y={220} width={14} height={150} fill="#14181b" />)}
		<rect x={1120} y={210} width={230} height={14} fill="#14181b" /><rect x={1120} y={366} width={230} height={14} fill="#14181b" />
		<Shaft id="jl_sh" pts={[[1130, 370], [1340, 370], [900, g], [440, g]]} col="#f2e2c4" o={0.13} />
		<Glow x={hd[0] - 220} y={hd[1] - 10} r={330} c="#f2e2c4" o={0.16} id="jl_g" />
		{/* floor + the concrete bench */}
		<rect x={-200} y={g} width={W + 400} height={400} fill="#15191c" />
		<rect x={1080} y={seat} width={760} height={30} fill="#3a4045" /><rect x={1080} y={seat + 30} width={760} height={g - seat - 30} fill="#1c2125" />
		{/* the cell door (left): frame, bars, lock plate */}
		<rect x={70} y={170} width={330} height={g - 170} fill="#101315" opacity={0.65} />
		<g fill="#0a0c0d">{Array.from({length: 7}, (_, i) => <rect key={i} x={84 + i * 48} y={170} width={13} height={g - 170} />)}<rect x={70} y={160} width={340} height={18} /><rect x={70} y={520} width={340} height={14} /><rect x={330} y={540} width={50} height={70} /></g>
		{marks}
		<Trav x={x} g={g} h={h} pose={st.pose} look={LK.young} flip pack={0} side={1} rimOp={0.5} rim="#f2e2c4" />
		{/* his pack on the floor */}
		<path d={spline([[1560, g], [1555, g - 150], [1600, g - 200], [1690, g - 196], [1720, g - 140], [1712, g]])} fill={FIG} />
		<path d={spline([[1556, g - 20], [1552, g - 150], [1598, g - 198]], false)} stroke="#f2e2c4" strokeWidth={2} opacity={0.4} fill="none" />
		{/* the stone in his fingers */}
		<circle cx={hd[0] - 8} cy={hd[1]} r={6} fill="#6a6660" />
	</Cam>
		{/* foreground cell bars, spreading out of frame as the camera pushes through */}
		<Cam z={barsZ}><Blur id="jl_bars" s={6 + 10 * seg(p, 0, 0.5)}><g fill="#07090a" opacity={1 - sm(seg(p, 0.35, 0.6))}>{[-1, 0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={70 + i * 260} y={-200} width={34} height={H + 400} />)}<rect x={-200} y={60} width={W + 400} height={26} /></g></Blur></Cam>
	</g>;
};

/* ============ bar 26 · north: desert / pine forest / snow, three diagonal panels ============ */
const Desert: React.FC<{u: number; cx: number}> = ({u, cx}) => { const g = 830, h = 380, pose = walkAt(60 * (u - 2.73), h);
	return <g>
		<Sky id="ds_s" stops={[[0, '#2a2430'], [0.55, '#7a5444'], [0.72, '#b07a58'], [0.73, '#3a2a26'], [1, '#221a18']]} />
		<Glow x={cx + 260} y={600} r={420} c="#ffc890" o={0.35} id="ds_g" />
		<path d={`M${cx - 700},650 L${cx - 640},560 L${cx - 420},560 L${cx - 380},650 Z M${cx + 120},650 L${cx + 170},590 L${cx + 330},590 L${cx + 360},650 Z`} fill="#4a3230" />
		<path d={ridgeD(700, 30, 2, {f: 2})} fill="#3a2826" />
		<rect x={cx - 700} y={760} width={1400} height={400} fill="#2a1e1c" />
		<path d={`M${cx - 120},${H} L${cx + 40},700 L${cx + 70},700 L${cx + 380},${H} Z`} fill="#1a1414" />
		{[0, 1, 2, 3].map((i) => <rect key={i} x={cx + 50 + i * 30 - 3} y={720 + i * 70} width={6} height={30 + i * 14} fill="#c8a070" opacity={0.6} transform={`skewX(${-14 - i * 6})`} />)}
		{[[-420, 1], [-250, 0.7], [330, 0.85]].map(([dx, s], i) => <g key={i} transform={`translate(${cx + dx},${g + 10}) scale(${s})`} fill="#141012"><rect x={-14} y={-240} width={28} height={240} rx={14} /><path d="M-14,-120 Q-60,-120 -60,-170 L-60,-200 Q-46,-210 -36,-196 L-36,-150 Q-36,-142 -14,-142 Z M14,-150 Q56,-150 56,-190 L56,-220 Q44,-232 32,-216 L32,-172 Q32,-168 14,-168 Z" /></g>)}
		<Trav x={cx - 60} g={g} h={h} pose={pose} look={LK.young} side={1} rimOp={0.6} rim="#ffd0a0" />
	</g>; };
const Forest: React.FC<{u: number; cx: number}> = ({u, cx}) => { const g = 830, h = 380, pose = walkAt(60 * (u - 2.73), h);
	return <g>
		<Sky id="fo_s" stops={[[0, '#1c2a30'], [0.6, '#33464a'], [1, '#141c1e']]} />
		{Array.from({length: 14}, (_, i) => <path key={i} d={pineD(cx - 720 + i * 110 + rnd(i, 3) * 40, 760, 420 + 120 * rnd(i, 4), 120, i)} fill="#24353a" />)}
		<Blur id="fo_m" s={30}><rect x={cx - 700} y={640} width={1400} height={120} fill="#8aa0a4" opacity={0.18} /></Blur>
		{Array.from({length: 9}, (_, i) => <path key={i} d={pineD(cx - 700 + i * 170 + rnd(i, 7) * 50, 860, 560 + 200 * rnd(i, 8), 180, i + 9)} fill="#121c1f" />)}
		<rect x={cx - 700} y={830} width={1400} height={300} fill="#101719" />
		<path d={`M${cx - 700},836 Q${cx},818 ${cx + 700},840`} stroke="#5a6a68" strokeWidth={3} opacity={0.5} fill="none" />
		<Trav x={cx - 60} g={g} h={h} pose={pose} look={LK.young} side={-1} rimOp={0.5} rim="#e8ecd8" />
		{[-330, 330].map((dx, i) => <path key={i} d={pineD(cx + dx, 1140, 900, 230, i + 30)} fill="#070b0c" />)}
	</g>; };
const Snow: React.FC<{u: number; cx: number}> = ({u, cx}) => { const g = 830, h = 380, pose = walkAt(60 * (u - 2.73), h);
	return <g>
		<Sky id="sn_s" stops={[[0, '#4a5866'], [0.6, '#8894a0'], [1, '#5a6470']]} />
		<path d={ridgeD(600, 70, 4, {f: 1.4, sharp: 0.5})} fill="#6e7a86" />
		<path d={ridgeD(640, 40, 7, {f: 1.8, sharp: 0.4})} fill="#5c6874" />
		{Array.from({length: 12}, (_, i) => <path key={i} d={pineD(cx - 700 + i * 125 + rnd(i, 13) * 40, 700, 140 + 60 * rnd(i, 14), 46, i)} fill="#2e3842" />)}
		<path d={`M${cx - 700},700 Q${cx},680 ${cx + 700},705 L${cx + 700},${H} L${cx - 700},${H} Z`} fill="#b4bcc4" />
		<path d={`M${cx - 700},830 Q${cx},812 ${cx + 700},834 L${cx + 700},${H} L${cx - 700},${H} Z`} fill="#9aa4ae" />
		<Trav x={cx - 60} g={g} h={h} pose={pose} look={LK.young} side={-1} rimOp={0.55} rim="#f4f6f8" />
		<Specks t={u} n={90} seed={5} col="#f4f6f8" o={0.7} vx={-160} vy={90} r={2.6} box={[cx - 700, 0, 1400, H]} />
	</g>; };
export const North: React.FC<SP> = ({u}) => {
	/* three panels slide in on beats 0, 2, 4; edges lean like a forward stride */
	const k = [0, 1, 2].map((i) => eout(seg(u, i * 2 * BEAT, i * 2 * BEAT + 0.32))), skew = 70;
	const edges = [0, 640, 1280, 1920];
	const clip = (i: number) => poly([[edges[i] + (i ? skew : -50), -20], [edges[i + 1] + (i < 2 ? skew : 50), -20], [edges[i + 1] - (i < 2 ? skew : -50), H + 20], [edges[i] - (i ? skew : 50), H + 20]]);
	const panels = [Desert, Forest, Snow], labels = ['美国', '加拿大', '阿拉斯加'];
	return <g>
		<rect x={0} y={0} width={W} height={H} fill="#08090b" />
		{panels.map((C, i) => { const off = (1 - k[i]) * 500; if (k[i] <= 0) return null;
			return <g key={i} opacity={k[i]}><defs><clipPath id={`no_c${i}`}><path d={clip(i)} /></clipPath></defs>
				<g clipPath={`url(#no_c${i})`}><g transform={`translate(${f1(off)},0)`}><C u={u + i} cx={320 + i * 640} /></g></g>
				<path d={clip(i)} fill="none" stroke="#08090b" strokeWidth={14} /></g>; })}
		{labels.map((s, i) => k[i] > 0.3 ? <Label key={i} x={320 + i * 640 - 40} y={918} s={s} size={38} o={k[i]} /> : null)}
	</g>;
};

/* ============ bar 28 · Alaska: the end of the Americas, frozen sea to the horizon ============ */
const IceField: React.FC<{hz: number; seed?: number; t: number}> = ({hz, seed = 0, t}) => {
	const blocks: React.ReactNode[] = [];
	for (let r = 0; r < 34; r++) { const k = Math.pow((r + 1) / 34, 1.9), y = lerp(hz + 3, H + 60, k), sc = lerp(0.06, 1.3, k), ridge = rnd(r, seed + 7) > 0.55, n = ridge ? 26 : 7;
		for (let i = 0; i < n; i++) { const bx = -300 + (i + rnd(r * 40 + i, seed)) * (W + 600) / n, bw = (40 + 70 * rnd(r * 40 + i, seed + 1)) * sc, bh = (ridge ? 24 + 44 * rnd(r * 40 + i, seed + 2) : 6 + 10 * rnd(r * 40 + i, seed + 2)) * sc;
			const tilt = (rnd(r * 40 + i, seed + 3) - 0.5) * bw * 0.6, top: P[] = [[bx - bw / 2, y], [bx - bw * 0.2 + tilt, y - bh], [bx + bw * 0.3 + tilt, y - bh * 0.9], [bx + bw / 2, y]];
			blocks.push(<g key={`${r}_${i}`}><path d={poly(top)} fill={'#d8e0e6'} /><path d={poly([top[2], top[3], [bx + bw * 0.1, y]])} fill="#98a6b4" />
				<path d={`M${f1(top[0][0])},${f1(top[0][1])} L${f1(top[1][0])},${f1(top[1][1])} L${f1(top[2][0])},${f1(top[2][1])}`} stroke="#ffffff" strokeWidth={lerp(0.6, 2.5, k)} fill="none" opacity={0.8} /></g>); }
		if (rnd(r, seed + 11) > 0.7) blocks.push(<path key={`c${r}`} d={`M${-300 + 900 * rnd(r, seed + 12)},${y} l${300 * sc + 200},${6 * sc} l${200 * sc + 100},${-4 * sc}`} stroke="#6e7c8a" strokeWidth={lerp(0.8, 3, k)} fill="none" opacity={0.6} />); }
	return <g>
		<rect x={-400} y={hz} width={W + 800} height={H} fill="#c2cbd3" />
		{blocks}
		<Blur id={`if_b${seed}`} s={20}><rect x={-400} y={hz - 20} width={W + 800} height={60} fill="#dfe6ec" opacity={0.6} /></Blur>
		<Specks t={t} n={40} seed={seed + 9} col="#ffffff" o={0.4} vx={-260} vy={20} r={2} box={[0, hz - 200, W, 600]} />
	</g>; };
export const Alaska: React.FC<SP> = ({u, d}) => {
	const p = u / d, hz = 560, g = 780, h = 330;
	return <g><Cam z={lerp(1, 1.07, eio(p))} px={-40 * eio(p)} py={10 * eio(p)}>
		<Sky id="ak_s" stops={[[0, '#3e4a58'], [0.42, '#8a96a2'], [0.52, '#c8ccd0'], [1, '#c8ccd0']]} />
		<Glow x={1380} y={470} r={360} c="#fff4e0" o={0.55} id="ak_g" /><circle cx={1380} cy={470} r={34} fill="#fff8ec" opacity={0.9} />
		{/* Siberia: no land on the horizon (90 km away); just a faint low cloud bank */}
		<Blur id="ak_cl" s={16}><rect x={900} y={hz - 34} width={1100} height={26} fill="#a0a8b2" opacity={0.6} /></Blur>
		<IceField hz={hz} t={u} />
		{/* the coastal bluff (left), snow-dusted, old fence posts */}
		<path d={`M-300,${H + 50} L-300,640 Q120,610 420,650 Q640,690 760,760 Q840,820 860,${H + 50} Z`} fill="#2a3036" />
		<path d={`M-300,640 Q120,610 420,650 Q640,690 760,760 Q800,790 820,820`} stroke="#d8dee4" strokeWidth={7} fill="none" opacity={0.7} />
		{[110, 210, 300].map((x, i) => <rect key={i} x={x} y={600 - i * 2} width={9} height={60} fill="#14181c" transform={`rotate(${-6 + i * 5} ${x} 660)`} />)}
		<Trav x={600} g={g} h={h} pose={POSE.lookOut} look={LK.young} side={1} rimOp={0.7} rim="#fff2dc" />
		<Specks t={u} n={60} seed={2} col="#ffffff" o={0.5} vx={-300} vy={30} r={2.2} />
	</Cam></g>;
};

/* ============ bar 30 · two figures on the pack ice; day counter ============ */
const DayWidget: React.FC<{day: number}> = ({day}) => { const n = Math.floor(day);
	return <g transform="translate(1760,250)">
		<Label x={0} y={0} s={`冰上 第 ${n} 天`} size={40} anchor="end" />
		{Array.from({length: 14}, (_, i) => <rect key={i} x={-14 * 22 + i * 22} y={22} width={14} height={14} rx={3} fill={i < n ? GOLD : 'none'} stroke={i < n ? GOLD : '#dfe6ec'} strokeWidth={2} opacity={i < n ? 1 : 0.6} />)}
	</g>; };
export const Ice: React.FC<SP & {day0?: number; day1?: number}> = ({u, d, day0 = 1, day1 = 8}) => {
	const p = u / d, hz = 520, h = 300, v = 40;
	const fig = (x0: number, g: number, ph: number, look = LK.young, sled = false) => { const x = x0 + v * u, pose = walkAt(v * (u - 0.7 * d) + ph * 0.5 * STRIDE * h, h, 9);
		const waist = hand(pose, 'Hips', x, g, h);
		return <g>{sled && <g><path d={`M${waist[0] - 10},${waist[1] + 10} L${x - 230},${g - 30}`} stroke={FIG} strokeWidth={3} /><path d={spline([[x - 390, g - 6], [x - 384, g - 46], [x - 300, g - 56], [x - 226, g - 44], [x - 204, g - 22], [x - 214, g - 2]])} fill={FIG} /><path d={`M${x - 392},${g + 2} L${x - 200},${g + 2}`} stroke={FIG} strokeWidth={5} /></g>}
			<Trav x={x} g={g} h={h} pose={pose} look={look} side={1} rimOp={0.7} rim="#fff4e4" /></g>; };
	return <g><Cam z={1.02} px={-30 * p}>
		<Sky id="ic_s" stops={[[0, '#56606c'], [0.4, '#a4acb4'], [0.5, '#d6d8d8'], [1, '#d6d8d8']]} />
		<Glow x={1220} y={330} r={420} c="#fff6e8" o={0.5} id="ic_g" /><circle cx={1220} cy={330} r={30} fill="#fffaf0" opacity={0.85} />
		<IceField hz={hz} seed={3} t={u} />
		{/* an open lead of dark water crossing behind them */}
		<path d={`M-300,700 Q300,660 700,690 Q1100,720 1500,650 Q1800,610 2300,640 L2300,668 Q1800,640 1500,684 Q1100,748 700,716 Q300,690 -300,728 Z`} fill="#2a3440" />
		<path d={`M-300,700 Q300,660 700,690 Q1100,720 1500,650 Q1800,610 2300,640`} stroke="#eef2f6" strokeWidth={3} fill="none" opacity={0.7} />
		{/* the floe they walk on */}
		<path d={`M-300,${H + 50} L-300,800 Q400,770 900,786 Q1400,800 2300,770 L2300,${H + 50} Z`} fill="#c6ced6" />
		<path d={`M-300,800 Q400,770 900,786 Q1400,800 2300,770`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.8} />
		{fig(700, 840, 1, LK.dimitri, true)}
		{fig(1000, 846, 0, LK.young)}
		{/* foreground ice blocks */}
		<g fill="#8e98a4">{[[-60, 1080, 300], [260, 1100, 180], [1500, 1090, 260], [1800, 1110, 220]].map(([x, y, s], i) => <path key={i} d={poly([[x, y], [x + s * 0.2, y - s * 0.7], [x + s * 0.6, y - s * 0.85], [x + s, y - s * 0.3], [x + s * 1.1, y]])} />)}</g>
		<g fill="#dfe6ec" opacity={0.8}>{[[-60, 1080, 300], [260, 1100, 180], [1500, 1090, 260], [1800, 1110, 220]].map(([x, y, s], i) => <path key={i} d={poly([[x + s * 0.2, y - s * 0.7], [x + s * 0.6, y - s * 0.85], [x + s * 0.55, y - s * 0.7], [x + s * 0.25, y - s * 0.6]])} />)}</g>
	</Cam><DayWidget day={lerp(day0, day1 + 0.99, seg(u, 0.1, d * 0.95))} /></g>;
};

/* ============ bar 32 · the Russian shore at dusk ============ */
export const RShore: React.FC<SP> = ({u, d}) => {
	const p = u / d, h = 300, v = 36;
	const shoreY = (x: number) => (x < 700 ? 780 : x < 1300 ? lerp(780, 690, (x - 700) / 600) : lerp(690, 670, (x - 1300) / 1000));
	const fig = (x0: number, ph: number, look = LK.young) => { const x = x0 + v * u, pose = walkAt(v * (u - 0.7 * d) + ph * 0.5 * STRIDE * h, h, 10); return <Trav x={x} g={shoreY(x) + 4} h={h} pose={pose} look={look} side={1} rimOp={0.75} rim="#ffc9a0" />; };
	return <g><Cam z={lerp(1, 1.05, eio(p))} py={lerp(0, 18, eio(p))}>
		<Sky id="rs_s" stops={[[0, '#1a2234'], [0.38, '#3a3a52'], [0.5, '#a0646a'], [0.56, '#d89a7a'], [0.6, '#3a3444'], [1, '#1c1c26']]} />
		<Glow x={1500} y={590} r={600} c="#ffb088" o={0.35} id="rs_g" />
		{/* Chukotka hills, snow patches */}
		<defs><clipPath id="rs_hc"><path d={ridgeD(560, 70, 1.3, {f: 1.2, x0: 600})} /></clipPath></defs>
		<path d={ridgeD(560, 70, 1.3, {f: 1.2, x0: 600})} fill="#2c2a3a" />
		<g clipPath="url(#rs_hc)">{Array.from({length: 14}, (_, i) => <path key={i} d={`M${800 + i * 90 + rnd(i, 3) * 60},${470 + 90 * rnd(i, 4)} l${40 + 50 * rnd(i, 5)},${-14 - 10 * rnd(i, 6)} l${30 + 30 * rnd(i, 7)},${18 + 8 * rnd(i, 8)} Z`} fill="#b8b0c4" opacity={0.4} />)}</g>
		<path d={ridgeD(600, 50, 3.1, {f: 1.6, x0: 800})} fill="#22212e" />
		{/* village lights at the foot of the hills */}
		{Array.from({length: 9}, (_, i) => <g key={i}><circle cx={1500 + i * 26 + rnd(i, 7) * 10} cy={624 + rnd(i, 8) * 8} r={3} fill={GOLD_HI} /><Glow x={1500 + i * 26} y={626} r={18} c={GOLD} o={0.5} id={`rs_l${i}`} /></g>)}
		{/* sea ice behind them (left), the shore rising (right) */}
		<rect x={-400} y={640} width={W + 800} height={H} fill="#6a6878" />
		{Array.from({length: 10}, (_, i) => { const y = 650 + i * i * 4; return <path key={i} d={`M-400,${y} L${700 - i * 30},${y + 2}`} stroke="#c8c0d0" strokeWidth={2} opacity={0.4} />; })}
		<path d={`M600,${H + 60} L700,780 L1300,690 L2300,670 L2300,${H + 60} Z`} fill="#2a2834" />
		<path d={`M700,780 L1300,690 L2300,670`} stroke="#e8c8c0" strokeWidth={4} fill="none" opacity={0.55} />
		{fig(880, 0.6, LK.dimitri)}
		{fig(1060, 0.1, LK.young)}
		<path d={`M-400,${H + 60} L-400,930 Q300,900 760,960 Q900,990 960,${H + 60} Z`} fill="#3e3c4a" />
	</Cam></g>;
};
void sm; void CREAM; void Glints; void grounded; void frondD;
