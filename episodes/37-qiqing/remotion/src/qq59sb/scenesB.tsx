import React from 'react';
import {W, H, P, BEAT, STRIDE, rnd, seg, sm, eio, eout, land, lerp, Glow, Sky, Blur, Shaft, Cam, Par, ridgeD, pineD, Birch, Specks, Trav, LK, POSE, walkAt, hand, fkPose, grounded, seated, spline, poly, Label, GOLD, GOLD_HI, CREAM, FIG, YEAR, KAI, SANS} from './kit59';
import {useStampFonts} from '../qq44/skin44';
/* ep59 storyboard · scenes B: Russia, and the protest walk across America (bars 34–52). u = seconds into the row, d = row length. */
export type SP = {u: number; d: number};
const f1 = (v: number) => v.toFixed(1);

/* ============ bar 34 · arrested on landing: searchlight, patrol truck, the passport without an entry stamp ============ */
export const Arrest: React.FC<SP> = ({u, d}) => {
	const p = u / d, g = 900, sweep = Math.sin(u * 1.1) * 0.5 + 0.5;
	const off = fkPose({hip: 0.655, lean: 2, neck: -10, lt: 3, lk: 3, rt: -5, rk: 4, la: 96, le: 34, ra: 6, re: 20});
	const off2 = fkPose({hip: 0.655, lean: 4, neck: 4, lt: 4, lk: 4, rt: -6, rk: 5, la: 62, le: 6, ra: 8, re: 30});
	const karl = fkPose({hip: 0.655, lean: 6, neck: 2, lt: 4, lk: 4, rt: -6, rk: 5, la: 44, le: 58, ra: 10, re: 30});
	const hO = 430, xO = 1080, pp = hand(off, 'LHand', xO, g, hO, true), fl = hand(off2, 'LHand', 1290, g, 440, true);
	return <g><Cam z={lerp(1, 1.08, eio(p))} px={lerp(0, -60, eio(p))} py={lerp(0, 20, eio(p))}>
		<Sky id="ar_s" stops={[[0, '#070b14'], [0.6, '#141c2a'], [0.75, '#1e2634'], [1, '#121620']]} />
		<path d={ridgeD(640, 40, 2.2, {f: 1.3})} fill="#161c28" />
		{/* snow ground */}
		<rect x={-400} y={700} width={W + 800} height={H} fill="#2c3442" />
		<path d={`M-400,700 Q900,680 2300,706`} stroke="#5a6678" strokeWidth={3} fill="none" opacity={0.6} />
		{/* the searchlight beam from a mast (top right, off frame) onto the group */}
		<path d={`M${2000},-60 L${2060},-30 L${lerp(1000, 760, sweep) + 260},${g + 10} L${lerp(1000, 760, sweep) - 300},${g + 10} Z`} fill="#e8eef8" opacity={0.08} />
		<Glow x={lerp(1000, 760, sweep)} y={g} r={420} ry={90} c="#e8eef8" o={0.35} id="ar_pool" />
		{/* the patrol truck: six-wheel cab-over, headlights toward the group */}
		<g fill="#0b0e14">
			<path d="M1380,880 L1380,720 Q1384,690 1414,686 L1520,686 L1560,640 L1640,640 Q1660,640 1664,660 L1670,720 L1880,720 L1880,880 Z" />
			<rect x={1660} y={600} width={220} height={124} rx={6} />
			{[1440, 1560, 1760].map((x, i) => <circle key={i} cx={x} cy={884} r={42} />)}
		</g>
		<path d="M1416,700 L1416,690 L1522,690 L1558,648 L1600,648 L1600,700 Z" fill="#3a4658" opacity={0.85} /><rect x={1606} y={656} width={46} height={40} fill="#3a4658" opacity={0.6} />
		{[1680, 1750, 1820].map((x) => <path key={x} d={`M${x},604 Q${x + 30},588 ${x + 60},604`} stroke="#3a4250" strokeWidth={3} fill="none" />)}
		<path d="M1380,720 L1880,720" stroke="#4a5262" strokeWidth={3} opacity={0.6} />
		<Glow x={1392} y={760} r={200} c="#fff6e0" o={0.6} id="ar_h1" /><circle cx={1392} cy={760} r={12} fill="#fffaf0" />
		<path d={`M1392,752 L700,680 L700,900 L1392,770 Z`} fill="#fff6e0" opacity={0.07} />
		<Specks t={u} n={110} seed={4} col="#dfe8f4" o={0.55} vx={-40} vy={80} r={2.2} />
		{/* Karl and Dimitri (left, facing right) */}
		<Trav x={560} g={g} h={410} pose={POSE.standPack} look={LK.dimitri} side={1} rimOp={0.75} rim="#e8eef8" />
		<Trav x={740} g={g} h={420} pose={karl} look={LK.young} side={1} rimOp={0.8} rim="#e8eef8" />
		{/* two border officers (silhouettes, no insignia), facing left */}
		<Trav x={xO} g={g} h={hO} pose={off} look={LK.guard} flip pack={0} side={-1} rimOp={0.5} rim="#e8eef8" />
		<Trav x={1290} g={g} h={440} pose={off2} look={LK.guard} flip pack={0} side={-1} rimOp={0.4} rim="#e8eef8" />
		{/* the open passport, held up to the light: a blank page */}
		<g transform={`translate(${pp[0] - 6},${pp[1] - 14}) rotate(-8)`}><rect x={-62} y={-40} width={60} height={80} fill="#4a1e22" /><rect x={-58} y={-36} width={54} height={72} fill="#e8e2d4" /><rect x={-4} y={-40} width={56} height={80} fill="#ece6d8" />
			<rect x={4} y={-30} width={40} height={2} fill="#b0a898" /><rect x={4} y={-22} width={34} height={2} fill="#b0a898" /></g>
		<Glow x={pp[0] - 6} y={pp[1] - 14} r={110} c="#fff6e0" o={0.4} id="ar_pp" />
		{/* the second officer's torch */}
		<path d={`M${fl[0]},${fl[1]} L${fl[0] - 420},${fl[1] - 70} L${fl[0] - 420},${fl[1] + 90} Z`} fill="#fff6e0" opacity={0.08} />
		<circle cx={fl[0] - 4} cy={fl[1]} r={7} fill="#fffaf0" />
	</Cam></g>;
};

/* ============ bar 36 · waiting: the calendar sheds pages, seasons change outside ============ */
const SEASON = [{sky: '#9aa4ae', ground: '#d8dde2', tree: '#2a2e32', leaf: ''}, {sky: '#8aa0a8', ground: '#5a7050', tree: '#24302a', leaf: '#4a6a44'}, {sky: '#9a9080', ground: '#7a6a4a', tree: '#2a2420', leaf: '#a08040'}];
export const Waiting: React.FC<SP> = ({u, d}) => {
	const p = u / d, k = eio(seg(u, 0.15, d * 0.9)), year = Math.min(2008, 2006 + Math.floor(k * 2.999)), si = Math.floor(u / (BEAT * 2)) % 3, S = SEASON[si];
	const st = seated({lean: 22, neck: 26, la: 30, le: 74, ra: 26, re: 80}), g = 930, h = 560, x = 860;
	useStampFonts(`${year}`);
	return <g><Cam z={lerp(1, 1.05, p)}>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#2a2724" />
		{Array.from({length: 30}, (_, i) => <rect key={i} x={-200 + i * 80} y={-200} width={2} height={H + 400} fill="#3a3530" opacity={0.5} />)}
		{/* window with the season outside */}
		<g><rect x={1180} y={250} width={400} height={440} fill={S.sky} />
			<rect x={1180} y={560} width={400} height={130} fill={S.ground} />
			<path d={`M1300,580 L1304,380 M1304,450 L1260,400 M1304,420 L1350,370 M1304,500 L1350,470`} stroke={S.tree} strokeWidth={8} fill="none" />
			{S.leaf && Array.from({length: 26}, (_, i) => <circle key={i} cx={1260 + rnd(i, 3) * 100} cy={370 + rnd(i, 4) * 100} r={10} fill={S.leaf} />)}
			{si === 0 && <Specks t={u} n={40} seed={7} col="#ffffff" o={0.8} vx={-20} vy={60} r={2.4} box={[1180, 250, 400, 440]} />}
			<rect x={1172} y={242} width={416} height={456} fill="none" stroke="#14110f" strokeWidth={16} /><rect x={1376} y={250} width={10} height={440} fill="#14110f" /><rect x={1180} y={462} width={400} height={10} fill="#14110f" />
			<rect x={1150} y={692} width={460} height={20} fill="#1c1916" /></g>
		<Shaft id="wt_sh" pts={[[1180, 250], [1580, 250], [1100, g], [500, g]]} col="#e8e4dc" o={0.08} />
		{/* the bulb */}
		<line x1={760} y1={-40} x2={760} y2={170} stroke="#14110f" strokeWidth={3} /><Glow x={760} y={190} r={380} c="#ffd8a0" o={0.3} id="wt_b" /><circle cx={760} cy={190} r={16} fill="#fff0d0" />
		{/* the wall calendar and its torn pages in the air */}
		<g transform="translate(470,330)"><rect x={0} y={0} width={230} height={290} fill="#d8d0c0" /><rect x={0} y={0} width={230} height={70} fill="#5a4a40" />
			<text x={115} y={52} textAnchor="middle" style={{fontFamily: YEAR, fontWeight: 600, fontSize: 48}} fill="#f0e8dc">{year}</text>
			{Array.from({length: 30}, (_, i) => <rect key={i} x={16 + (i % 7) * 29} y={90 + Math.floor(i / 7) * 36} width={20} height={20} fill="#8a8070" opacity={0.6} />)}
			<rect x={108} y={-14} width={14} height={18} fill="#14110f" /></g>
		{[0, 1, 2].map((i) => { const t0 = ((u / BEAT) % 2) / 2, q = (t0 + i / 3) % 1, px = 790 + 330 * q + 40 * Math.sin(q * 5 + i), py = 520 - 260 * q + 40 * i, r = 10 + 120 * q;
			return <g key={i} transform={`translate(${px},${py}) rotate(${r}) scale(${1 - 0.3 * q})`} opacity={1 - q * 0.7}><rect x={-100} y={-120} width={200} height={240} fill="#e6dece" /><rect x={-100} y={-120} width={200} height={50} fill="#6a5a50" /></g>; })}
		{/* the bed and Karl waiting, elbows on knees; his pack against the wall */}
		<rect x={600} y={g - st.seat * h - 10} width={560} height={40} fill="#3a3430" /><rect x={600} y={g - st.seat * h + 30} width={560} height={st.seat * h - 30} fill="#1e1a18" />
		<rect x={-200} y={g} width={W + 400} height={400} fill="#1a1715" />
		<path d={spline([[1640, g], [1636, g - 200], [1690, g - 250], [1780, g - 244], [1800, g - 180], [1790, g]])} fill={FIG} />
		<Trav x={x} g={g} h={h} pose={st.pose} look={LK.young} pack={0} side={1} rimOp={0.55} rim="#ffe0b0" />
	</Cam></g>;
};

/* ============ bar 38 · sponsor patches peel off and blow away ============ */
const PATCH_COL = ['#6a8a8a', '#a08a5a', '#7a7a90', '#9a6a5a'];
const PatchShape: React.FC<{i: number; s: number}> = ({i, s}) => {
	const c = PATCH_COL[i % 4], e = '#f0e6d4';
	if (i % 4 === 0) return <g><circle r={s} fill={c} stroke={e} strokeWidth={s * 0.08} /><path d={`M${-s * 0.6},${s * 0.25} L${-s * 0.15},${-s * 0.4} L${s * 0.1},${-s * 0.05} L${s * 0.3},${-s * 0.3} L${s * 0.65},${s * 0.25} Z`} fill={e} /></g>;
	if (i % 4 === 1) return <g><path d={`M${-s},${-s * 0.8} L${s},${-s * 0.8} L${s},${s * 0.1} Q${s},${s * 0.8} 0,${s * 1.1} Q${-s},${s * 0.8} ${-s},${s * 0.1} Z`} fill={c} stroke={e} strokeWidth={s * 0.08} /><circle cy={-s * 0.1} r={s * 0.35} fill={e} /></g>;
	if (i % 4 === 2) return <g><rect x={-s * 1.2} y={-s * 0.6} width={s * 2.4} height={s * 1.2} rx={s * 0.15} fill={c} stroke={e} strokeWidth={s * 0.08} />{[0, 1, 2].map((j) => <rect key={j} x={-s * 0.9} y={-s * 0.35 + j * s * 0.28} width={s * 1.8} height={s * 0.12} fill={e} />)}</g>;
	return <g><path d={poly([[0, -s], [s * 0.87, -s * 0.5], [s * 0.87, s * 0.5], [0, s], [-s * 0.87, s * 0.5], [-s * 0.87, -s * 0.5]])} fill={c} stroke={e} strokeWidth={s * 0.08} /><path d={`M${-s * 0.4},0 L${s * 0.4},0 M0,${-s * 0.4} L0,${s * 0.4}`} stroke={e} strokeWidth={s * 0.18} /></g>;
};
export const Patches: React.FC<SP> = ({u, d}) => {
	const p = u / d, h = 2000, g = 2330, x = 1120, pose = fkPose({hip: 0.655, lean: 8, neck: 6, lt: 3, lk: 3, rt: -5, rk: 4, la: 4, le: 8, ra: 6, re: 12});
	const S = (n: string) => hand(pose, n as 'LSh', x, g, h), sh = S('LSh'), el = S('LElb'), sp = S('Spine1');
	/* patch anchors: near sleeve, chest, three on the pack */
	const anchors: P[] = [[sp[0] - 0.16 * h, sp[1] + 0.07 * h], [lerp(sh[0], el[0], 0.36), lerp(sh[1], el[1], 0.36)], [sp[0] + 0.045 * h, sp[1] + 0.03 * h], [sp[0] - 0.19 * h, sp[1] - 0.04 * h], [sp[0] - 0.12 * h, sp[1] - 0.1 * h]];
	const T0 = [2, 4, 6, 7, 7.5].map((b) => b * BEAT);
	/* each patch lets go on its beat and is blown up and to the right; the place it covered stays a little darker */
	return <g><Cam z={lerp(1.0, 1.04, p)} px={lerp(0, -30, p)}>
		<Sky id="pt_s" stops={[[0, '#2a2e36'], [0.7, '#4a4a50'], [1, '#3a3638']]} />
		<Glow x={1650} y={300} r={700} c="#e8dcc8" o={0.2} id="pt_g" />
		{Array.from({length: 18}, (_, i) => { const y = 120 + i * 52, l = 140 + 200 * rnd(i, 3), x0 = ((rnd(i, 4) * 2400 + u * 900 * (0.6 + rnd(i, 5))) % 2600) - 400; return <rect key={i} x={x0} y={y} width={l} height={2} fill="#d8d0c4" opacity={0.18} />; })}
		<Trav x={x} g={g} h={h} pose={pose} look={LK.mid} side={1} rimOp={0.55} rim="#ffe0b8" />
		{anchors.map((a, i) => { const t0 = T0[i], k = seg(u, t0, t0 + 1.1), peel = seg(u, t0 - BEAT * 0.8, t0);
			const px = a[0] + 520 * eio(k) + 40 * Math.sin(k * 6 + i), py = a[1] - 330 * eio(k) + 90 * Math.sin(k * 3.4 + i) * k, rot = (i % 2 ? 1 : -1) * (14 * peel + 300 * k), sc = 1 - 0.4 * k;
			if (k >= 1) return null;
			return <g key={i} transform={`translate(${f1(px)},${f1(py)}) rotate(${f1(rot)}) scale(${f1(sc)},${f1(sc * (1 - 0.4 * peel * (1 - k)))})`} opacity={1 - k * 0.4}><PatchShape i={i} s={52} /></g>; })}
	</Cam></g>;
};

/* ============ bar 40 · REFUSED ============ */
export const Refused: React.FC<SP> = ({u, d}) => {
	const slam = 0.2, k = seg(u, slam - 0.12, slam), hit = u >= slam, lift = eio(seg(u, slam + 0.3, slam + 1.6)), shake = hit ? Math.exp(-(u - slam) * 9) * Math.sin((u - slam) * 70) * 10 : 0;
	useStampFonts('REFUSEDVISA');
	const sy = hit ? lerp(0, -1100, lift) : lerp(-460, 0, k * k), ss = hit ? 1 + 0.35 * lift : 1.4 - 0.4 * k;
	return <g><Cam z={1.02} px={shake} py={shake * 0.6}>
		<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#241c18" />
		{Array.from({length: 14}, (_, i) => <rect key={i} x={-200} y={-200 + i * 110} width={W + 400} height={3} fill="#1a1412" opacity={0.6} />)}
		<Glow x={980} y={520} r={900} c="#ffdcae" o={0.25} id="rf_l" />
		{/* passport and pen on the desk */}
		<rect x={1380} y={700} width={190} height={260} rx={8} fill="#3e1a1e" transform="rotate(14 1475 830)" />
		<rect x={300} y={760} width={300} height={14} rx={7} fill="#121010" transform="rotate(-24 450 767)" />
		{/* the visa form */}
		<g transform="translate(1000,600) rotate(-3)">
			<rect x={-400} y={-470} width={800} height={1000} fill="#d9d2c0" />
			<text x={-120} y={-300} style={{fontFamily: YEAR, fontWeight: 700, fontSize: 52, letterSpacing: '0.14em'}} fill="#3a3430">VISA</text>
			<rect x={-120} y={-282} width={250} height={4} fill="#3a3430" />
			<rect x={200} y={-420} width={150} height={190} fill="#b8b0a0" /><circle cx={275} cy={-345} r={34} fill="#7a7266" /><path d="M215,-230 Q275,-300 335,-230 Z" fill="#7a7266" />
			{Array.from({length: 10}, (_, i) => <g key={i}><rect x={-340} y={-230 + i * 62} width={120 + 60 * rnd(i, 2)} height={10} fill="#8a8274" /><rect x={-150} y={-216 + i * 62} width={460 - 120 * rnd(i, 3)} height={2} fill="#8a8274" /></g>)}
			{/* the imprint */}
			{hit && <g transform="translate(20,40) rotate(-11)" opacity={0.88}>
				<rect x={-300} y={-95} width={600} height={190} rx={10} fill="none" stroke="#8e2a24" strokeWidth={14} />
				<rect x={-280} y={-75} width={560} height={150} rx={6} fill="none" stroke="#8e2a24" strokeWidth={5} />
				<text x={0} y={42} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '0.08em'}} fill="#8e2a24">REFUSED</text>
				{Array.from({length: 60}, (_, i) => <circle key={i} cx={-300 + rnd(i, 5) * 600} cy={-95 + rnd(i, 6) * 190} r={2 + 6 * rnd(i, 7)} fill="#d9d2c0" opacity={0.85} />)}</g>}
		</g>
		{/* paper bits jumping on the hit */}
		{hit && Array.from({length: 10}, (_, i) => { const q = seg(u, slam, slam + 0.8); return <rect key={i} x={760 + rnd(i, 8) * 420 + (rnd(i, 9) - 0.5) * 300 * q} y={560 + rnd(i, 10) * 120 - 220 * q + 300 * q * q} width={10} height={6} fill="#e8e0d0" opacity={1 - q} transform={`rotate(${360 * q * rnd(i, 11)} 960 560)`} />; })}
		{/* the rubber stamp and the official's hand (from the top right) */}
		<g transform={`translate(${980 + 60 * lift},${600 + sy}) rotate(-11) scale(${ss})`}>
			<rect x={-310} y={-105} width={620} height={210} rx={14} fill="#100c0b" opacity={0.95} />
			<rect x={-200} y={-60} width={400} height={120} rx={20} fill="#2a2220" />
			<circle cx={0} cy={0} r={70} fill="#1a1412" />
		</g>
		<g transform={`translate(${980 + 60 * lift},${600 + sy}) scale(${ss})`}>
			<path d="M40,-40 Q160,-120 420,-260 L520,-120 Q300,0 120,40 Z" fill="#0c0a0a" />
			<path d={spline([[-60, -30], [10, -70], [80, -40], [90, 30], [20, 70], [-50, 40]])} fill="#0c0a0a" />
		</g>
	</Cam></g>;
};

/* ============ bar 42 · he shoulders the pack again (dawn, backlit) ============ */
export const Shoulder: React.FC<SP> = ({u, d}) => {
	const p = u / d, g = 900, h = 560, x = 1120;
	const pose = grounded({lean: 6 + 5 * eio(p), neck: -8, lt: 4, lk: 4, rt: -7, rk: 6, la: 0, le: 118, ra: -4, re: 112});
	return <g><Cam z={1.0 + 0.04 * p} py={lerp(30, 0, eio(p))}>
		<Sky id="sh_s" stops={[[0, '#1e2a40'], [0.45, '#5a6478'], [0.68, '#d8b494'], [0.72, '#f0d8b4'], [1, '#2a2422']]} />
		<Glow x={1300} y={720} r={520} c="#ffe2b0" o={0.7} id="sh_g" /><circle cx={1300} cy={735} r={46} fill="#fff4dc" />
		<path d={ridgeD(760, 14, 1.1, {f: 2})} fill="#4a4040" />
		<rect x={-400} y={770} width={W + 800} height={H} fill="#1e1a1a" />
		{/* the road leaving to the right, toward the sun */}
		<path d={`M600,${H} L1270,772 L1330,772 L2100,${H} Z`} fill="#2a2424" /><path d={`M1300,772 L1360,${H}`} stroke="#d8c0a0" strokeWidth={4} strokeDasharray="30 40" opacity={0.6} />
		{[200, 420, 1560, 1780].map((px, i) => <g key={i} fill="#120f0f"><rect x={px} y={600 + i * 14} width={8} height={200 - i * 10} /><rect x={px - 30} y={612 + i * 14} width={68} height={5} /></g>)}
		<path d={`M${x - 120},${g + 4} L${x + 60},${g + 4} L${x - 500},${H + 80} L${x - 900},${H + 80} Z`} fill="#0e0c0c" opacity={0.6} />
		<Trav x={x} g={g} h={h} pose={pose} look={LK.mid} side={1} rimOp={0.85} rim="#ffe8c0" />
	</Cam></g>;
};

/* ============ bars 44–47 · alone across America at night; km widget to 5000 ============ */
const KmWidget: React.FC<{km: number}> = ({km}) => { const v = Math.round(km), k = km / 5000, txt = v >= 5000 ? '约 5000' : v.toLocaleString('en-US');
	useStampFonts(`${txt}公里洛杉矶华盛顿`);
	return <g transform="translate(1760,250)">
		<text x={0} y={0} textAnchor="end" style={{fontFamily: YEAR, fontWeight: 600, fontSize: 62, fontVariantNumeric: 'lining-nums tabular-nums'}} fill={CREAM} stroke="rgba(8,8,10,0.7)" strokeWidth={6} paintOrder="stroke">{txt}<tspan style={{fontFamily: KAI, fontSize: 32}}> 公里</tspan></text>
		<Label x={-430} y={58} s="洛杉矶" size={26} anchor="start" /><Label x={0} y={58} s="华盛顿" size={26} anchor="end" />
		<rect x={-430} y={72} width={430} height={4} fill="#dfe6ec" opacity={0.4} /><rect x={-430} y={72} width={430 * k} height={4} fill={GOLD} /><circle cx={-430 + 430 * k} cy={74} r={8} fill={GOLD_HI} />
	</g>; };
export const Highway: React.FC<SP> = ({u, d}) => {
	const vp: P = [1240, 600], g = 846, h = 270, v = 52, x = 760 + 40 * u / d, pose = walkAt(v * (u - 0.82 * d), h);
	const km = 5000 * eio(seg(u, 0.25, d * 0.92));
	const truck = ((u * 0.55) % 1), tx = lerp(vp[0] + 20, 2600, Math.pow(truck, 2.2)), ty = lerp(vp[1] + 4, 1100, Math.pow(truck, 2.2)), tr = lerp(2, 200, Math.pow(truck, 2.2));
	return <g><Cam z={1.02} px={-20 * u / d}>
		<Sky id="hw_s" stops={[[0, '#05070e'], [0.45, '#0e1424'], [0.55, '#2a2a3a'], [0.56, '#141418'], [1, '#0a0a0c']]} />
		{Array.from({length: 140}, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={rnd(i, 2) * 560} r={0.6 + 1.6 * rnd(i, 3)} fill="#e8eef8" opacity={0.25 + 0.6 * rnd(i, 4) * (0.6 + 0.4 * Math.sin(u * 2 + i))} />)}
		<Glow x={1600} y={600} r={500} ry={110} c="#c8a080" o={0.25} id="hw_city" />
		<path d={`M-300,610 L80,610 L120,540 L360,540 L400,610 L1450,610 L1480,570 L1640,570 L1670,610 L2300,610 L2300,700 L-300,700 Z`} fill="#121218" />
		<rect x={-400} y={604} width={W + 800} height={H} fill="#0e0e12" />
		{/* the road from the bottom-left corner to the vanishing point */}
		<path d={`M-300,${H} L${vp[0] - 6},${vp[1]} L${vp[0] + 6},${vp[1]} L${1500},${H} Z`} fill="#1a1a1e" />
		<path d={`M${vp[0]},${vp[1]} L${600},${H}`} stroke="#d8c890" strokeWidth={4} strokeDasharray="44 60" opacity={0.55} />
		<path d={`M${vp[0] + 6},${vp[1]} L${1500},${H}`} stroke="#c8c8c8" strokeWidth={3} opacity={0.45} />
		<path d={`M${vp[0] - 6},${vp[1]} L${-300},${H}`} stroke="#c8c8c8" strokeWidth={3} opacity={0.35} />
		{/* telegraph poles receding */}
		{Array.from({length: 8}, (_, i) => { const q = Math.pow(0.72, i), px = lerp(vp[0] + 30, 1880, q), py = lerp(vp[1], 1000, q), ph = 420 * q; return <g key={i} fill="#08080a"><rect x={px} y={py - ph} width={Math.max(2, 10 * q)} height={ph} /><rect x={px - 40 * q} y={py - ph + 16 * q} width={90 * q} height={Math.max(1.5, 6 * q)} /></g>; })}
		{/* an oncoming truck: two headlights growing out of the vanishing point */}
		<Glow x={tx} y={ty} r={tr * 3} c="#fff2d8" o={0.55} id="hw_t" />
		{[-1, 1].map((sgn) => <circle key={sgn} cx={tx + sgn * tr * 0.3} cy={ty} r={Math.max(2, tr * 0.08)} fill="#fffaf0" />)}
		{/* the mile post and Karl on the shoulder (walking toward the vanishing point, east) */}
		<rect x={540} y={760} width={10} height={86} fill="#0a0a0c" /><rect x={530} y={744} width={30} height={40} fill="#2e4a3a" /><rect x={536} y={754} width={18} height={4} fill="#d8e0d8" /><rect x={536} y={764} width={18} height={4} fill="#d8e0d8" />
		<Trav x={x} g={g} h={h} pose={pose} look={LK.mid} side={1} rimOp={0.8} rim="#fff0d0" />
		<Glow x={x + 40} y={g - 120} r={260} c="#fff2d8" o={0.12 * (0.5 + truck)} id="hw_on" />
	</Cam><KmWidget km={km} /></g>;
};

/* ============ bars 48–50 · the embassy steps; the sign ============ */
const Portico: React.FC<{y0: number; steps: number; stepH: number; light?: number}> = ({y0, steps, stepH, light = 0}) => <g>
	<Sky id="pc_s" stops={[[0, '#3a4250'], [0.6, '#6a7280'], [1, '#4a5058']]} />
	{/* bare trees each side */}
	{[[110, 1], [1810, -1]].map(([tx, sg], i) => <g key={i} stroke="#1a1e24" fill="none" strokeLinecap="round">
		<path d={`M${tx},${y0 + 200} L${tx + sg * 10},${y0 - 260}`} strokeWidth={26} />
		{[0, 1, 2, 3, 4, 5].map((j) => { const by = y0 - 120 - j * 60, ex = tx + sg * (60 + 50 * rnd(j, i)) * (j % 2 ? -1 : 1), ey = by - 120 - 60 * rnd(j, i + 3);
			return <g key={j}><path d={`M${tx + sg * 6},${by} Q${(tx + ex) / 2},${by - 30} ${ex},${ey}`} strokeWidth={10 - j} /><path d={`M${lerp(tx, ex, 0.6)},${lerp(by, ey, 0.6)} l${sg * 30},${-50}`} strokeWidth={4} /></g>; })}</g>)}
	{/* the building: entablature, six columns, deep porch */}
	<rect x={330} y={-60} width={1260} height={170} fill="#9aa0a8" /><rect x={300} y={110} width={1320} height={30} fill="#7c828a" />
	<rect x={360} y={140} width={1200} height={y0 - 140} fill="#2a2e36" />
	{Array.from({length: 6}, (_, i) => { const cx = 420 + i * 216; return <g key={i}><rect x={cx - 46} y={140} width={92} height={y0 - 140} fill="#b4b8be" /><rect x={cx - 46} y={140} width={30} height={y0 - 140} fill="#8a9098" /><rect x={cx - 58} y={140} width={116} height={24} fill="#9ca2aa" /><rect x={cx - 58} y={y0 - 24} width={116} height={24} fill="#9ca2aa" />
		{[0, 1, 2].map((j) => <rect key={j} x={cx - 18 + j * 18} y={170} width={4} height={y0 - 200} fill="#9aa0a8" opacity={0.6} />)}</g>; })}
	<rect x={860} y={300} width={200} height={y0 - 300} fill="#14161a" /><Glow x={960} y={y0 - 60} r={160} c="#ffe0b0" o={0.25 * light} id="pc_door" />
	{Array.from({length: steps}, (_, i) => <g key={i}><rect x={260 - i * 40} y={y0 + i * stepH} width={1400 + i * 80} height={stepH} fill={i % 2 ? '#a4aab2' : '#9aa0a8'} /><rect x={260 - i * 40} y={y0 + i * stepH} width={1400 + i * 80} height={4} fill="#d8dce0" opacity={0.6} /></g>)}
</g>;
export const Steps: React.FC<SP> = ({u, d}) => {
	const p = u / d, y0 = 620, stepH = 42, step = Math.min(6.99, u / (BEAT * 1.0)), si = Math.floor(step), f = step - si, h = 300;
	const gOf = (i: number) => y0 + (9 - i) * stepH, g = lerp(gOf(si), gOf(si + 1), sm(f)), x = 900 + 14 * step;
	const pose = fkPose({hip: 0.65, lean: 12, neck: -6, lt: lerp(40, 10, f), lk: lerp(60, 8, f), rt: lerp(-6, 40, f), rk: lerp(8, 50, f), la: -14, le: 20, ra: 20, re: 30});
	return <g><Cam z={lerp(1.0, 1.08, eio(p))} py={lerp(0, -30, eio(p))}>
		<Portico y0={y0} steps={10} stepH={stepH} />
		<Trav x={x} g={g} h={h} pose={pose} look={LK.mid} side={-1} rimOp={0.5} rim="#f4f0e8" />
	</Cam></g>;
};
export const Sign: React.FC<SP> = ({u, d}) => {
	const p = u / d, y0 = 560, stepH = 46, g = 880, h = 400, x = 960, up = eout(seg(u, 0, 0.18));
	const pose = fkPose({hip: 0.655, lean: -2, neck: -4, lt: 4, lk: 4, rt: -6, rk: 5, la: lerp(30, 158, up), le: lerp(60, 14, up), ra: lerp(26, 150, up), re: lerp(60, 22, up)});
	const hl = hand(pose, 'LHand', x, g, h), hr = hand(pose, 'RHand', x, g, h), top = hand(pose, 'Top', x, g, h), cx = (hl[0] + hr[0]) / 2 + 10, cy = Math.min((hl[1] + hr[1]) / 2, top[1] - 40);
	const flash = (t0: number) => Math.exp(-Math.max(0, u - t0) * 12) * (u >= t0 ? 1 : 0);
	const fl = [flash(BEAT * 0.02), flash(BEAT * 2), flash(BEAT * 3.1)];
	/* a photographer seen from behind: shoulders, back of the head, elbows out, camera at the eye, flash gun on top */
	const Press: React.FC<{px: number; s: number; i: number; f: number}> = ({px, s, i, f}) => <g transform={`translate(${px},1090) scale(${s})`}>
		<g fill="#07080a"><path d={spline([[-190, 80], [-175, -120], [-110, -190], [0, -205], [110, -190], [175, -120], [190, 80]])} />
			<path d={`M-120,-170 Q-200,-260 -150,-330 L-110,-320 Q-130,-260 -70,-200 Z M120,-170 Q200,-260 150,-330 L110,-320 Q130,-260 70,-200 Z`} />
			<circle cx={0} cy={-280} r={66} /><rect x={50} y={-318} width={70} height={56} rx={10} /><rect x={-14} y={-392} width={44} height={50} rx={6} /><rect x={-4} y={-352} width={24} height={12} /></g>
		<Glow x={8} y={-372} r={240} c="#ffffff" o={0.95 * f} id={`sg_f${i}`} /><rect x={-10} y={-388} width={36} height={18} fill="#ffffff" opacity={f} /></g>;
	return <g><Cam z={1.04 + 0.02 * p}>
		<g transform="translate(-200,-40) scale(1.2)"><Portico y0={y0} steps={10} stepH={stepH} light={1} /></g>
		<rect x={0} y={0} width={W} height={H} fill="#1a1e24" opacity={0.35} />
		<Trav x={x} g={g} h={h} pose={pose} look={LK.mid} side={-1} rimOp={0.6} rim="#f4f0e8" />
		{/* the handwritten sign: cardboard, marker scrawl (deliberately unreadable) */}
		<g transform={`translate(${cx},${cy - 60}) rotate(-3)`}>
			<rect x={-150} y={-90} width={300} height={170} fill="#b49a72" /><rect x={-150} y={-90} width={300} height={170} fill="none" stroke="#7a6446" strokeWidth={3} />
			{[0, 1, 2].map((j) => <path key={j} d={`M${-120},${-50 + j * 46} ` + Array.from({length: 9}, (_, k) => `q${10},${-18 + 30 * rnd(j * 9 + k, 3)} ${24 + 6 * rnd(k, j)},${-4 + 8 * rnd(j * 9 + k, 4)}`).join(' ')} stroke="#2a2220" strokeWidth={7} fill="none" strokeLinecap="round" />)}
		</g>
		<Press px={330} s={1.0} i={0} f={fl[0]} /><Press px={1500} s={1.1} i={1} f={fl[1]} /><Press px={1770} s={0.85} i={2} f={fl[2]} />
		<rect x={0} y={0} width={W} height={H} fill="#ffffff" opacity={0.12 * Math.max(...fl)} />
	</Cam></g>;
};

/* ============ bars 51–52 · Russia, season after season (four diagonal bands) ============ */
type Season = {sky: [string, string]; ground: string; far: string; trunk: string; crown?: string; snow?: boolean; night?: boolean};
const SEAS: Season[] = [
	{sky: ['#6a7480', '#a8b0b8'], ground: '#d4dade', far: '#5a6470', trunk: '#c8ccd0', snow: true},
	{sky: ['#4a6a7a', '#a8c0c0'], ground: '#4a6040', far: '#34503a', trunk: '#d0d0c8', crown: '#3e5a38'},
	{sky: ['#7a6a5a', '#c0a880'], ground: '#6a5434', far: '#5a4630', trunk: '#d0ccc0', crown: '#b08a40'},
	{sky: ['#0e1420', '#283244'], ground: '#5a6474', far: '#1a2230', trunk: '#8a9098', snow: true, night: true},
];
const SeasonPanel: React.FC<{s: Season; u: number; cx: number; i: number}> = ({s, u, cx, i}) => { const g = 820, h = 300, pose = walkAt(56 * (u - 2.73), h, 6);
	return <g>
		<Sky id={`ss_${i}`} stops={[[0, s.sky[0]], [0.62, s.sky[1]], [1, s.sky[1]]]} />
		{s.night && Array.from({length: 40}, (_, k) => <circle key={k} cx={cx - 400 + rnd(k, 3) * 800} cy={rnd(k, 4) * 500} r={1.5} fill="#e8eef8" opacity={0.6} />)}
		<path d={ridgeD(640, 30, i * 1.7, {f: 1.6})} fill={s.far} />
		{Array.from({length: 14}, (_, k) => <path key={k} d={pineD(cx - 420 + k * 64 + rnd(k, i) * 30, 690, 90 + 50 * rnd(k, i + 2), 30, k)} fill={s.far} opacity={0.9} />)}
		<rect x={cx - 600} y={680} width={1200} height={500} fill={s.ground} />
		{Array.from({length: 7}, (_, k) => { const bx = cx - 380 + k * 130 + rnd(k, i + 5) * 50, bh = 360 + 160 * rnd(k, i + 6);
			return <g key={k}>{s.crown && <ellipse cx={bx} cy={g - bh + 40} rx={70} ry={110} fill={s.crown} opacity={0.95} />}<Birch x={bx} g={g + 40 + 30 * rnd(k, i + 7)} h={bh} w={14} bark={s.trunk} seed={k + i} /></g>; })}
		<Trav x={cx - 40} g={g} h={h} pose={pose} look={LK.mid} side={-1} rimOp={0.6} rim={s.night ? '#c8d4e8' : '#fff0d8'} />
		{s.snow && <Specks t={u} n={60} seed={i + 3} col="#ffffff" o={0.75} vx={-100} vy={90} r={2.4} box={[cx - 600, 0, 1200, H]} />}
		{s.crown && i === 2 && Array.from({length: 18}, (_, k) => { const q = ((u * 0.4 + rnd(k, 9)) % 1); return <ellipse key={k} cx={cx - 300 + rnd(k, 8) * 600 - 200 * q} cy={200 + 700 * q} rx={7} ry={4} fill="#c89a48" opacity={0.85} />; })}
	</g>; };
export const Seasons: React.FC<SP> = ({u}) => {
	const n = 4, wd = W / n, sk = 150, k = Array.from({length: n}, (_, i) => eout(seg(u, i * 2 * BEAT, i * 2 * BEAT + 0.3)));
	const band = (i: number) => poly([[i * wd + sk - (i ? 0 : 200), -20], [(i + 1) * wd + sk + (i === n - 1 ? 200 : 0), -20], [(i + 1) * wd - sk + (i === n - 1 ? 200 : 0), H + 20], [i * wd - sk - (i ? 0 : 200), H + 20]]);
	return <g><rect width={W} height={H} fill="#08090b" />
		{SEAS.map((s, i) => k[i] <= 0 ? null : <g key={i} opacity={k[i]}><defs><clipPath id={`se_c${i}`}><path d={band(i)} /></clipPath></defs>
			<g clipPath={`url(#se_c${i})`}><g transform={`translate(${f1((1 - k[i]) * -400)},0)`}><SeasonPanel s={s} u={u + i * 0.37} cx={wd * (i + 0.5)} i={i} /></g></g>
			<path d={band(i)} fill="none" stroke="#08090b" strokeWidth={12} /></g>)}
	</g>;
};
void Blur; void Par; void land; void grounded; void STRIDE; void CREAM; void GOLD; void POSE;
