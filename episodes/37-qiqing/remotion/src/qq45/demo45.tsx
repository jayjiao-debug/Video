import React from 'react';
import {W, H, rnd, lerp, Glow, P, CU, KEY, T, PlateSky, PlateGround, HorseHead, ZHead, StoneBody, WaterArc, ZODIAC, RETURNED, Z} from './kit45';
import {Haiyantang, Pool, Garden, AuctionRoom, Bidders, ZPos, hatchOver, FIG, RIM, LK} from './frames45';
import {Rimmed, Look4} from '../qq44/kit44';
import {jointAt, grounded, reg, walkArms as walkArmsD, phaseFor as phaseD} from './pose45';
import {Shadow as Shadow45, Courtyard, Kepi, StoneBody3} from './sets45';
import {SANS} from './skin45';
/* ep45 demo (0–34.53 s): cold open C1–C7, rewind, title on the first crash, A1–A5.
   Timing on bgm2's grid (ep42 music map): beat P = 0.56605, downbeat D0 = 0.5688 + 2.2642·n; the intro is looped so the
   crash (song 9.06) lands at film 18.115 and the B section at 20.945. Every cut sits on a beat. */
export const P_ = 0.56605, D0 = 0.5688, BAR = 4 * P_;
export const beat = (k: number) => D0 + k * P_;
export const T45 = {c2: beat(5), c3: beat(9), c4: beat(13), c5: beat(17), c6: beat(21), c7: beat(25), rew: beat(30), title: beat(31), a1: beat(36), a3: beat(42), a4: beat(48), a5: beat(54), end: beat(60)};
const cl = (u: number) => Math.max(0, Math.min(1, u));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
/** camera: centre (x, y), zoom z; clamped so the view never leaves the 1920×1080 set (zoom ≥ 1) */
const Cam: React.FC<{x?: number; y?: number; z?: number; children: React.ReactNode; free?: boolean}> = ({x = 960, y = 540, z = 1, children, free}) => {
	const zz = free ? z : Math.max(1, z), hw = 960 / zz, hh = 540 / zz, cx = free ? x : Math.min(W - hw, Math.max(hw, x)), cy = free ? y : Math.min(H - hh, Math.max(hh, y));
	return <g transform={`translate(960,540) scale(${zz}) translate(${-cx},${-cy})`}>{children}</g>; };

/* ---------- S1 · C1: you, a drop on beat 1, a light sweep at ~2 s ---------- */
const Drop: React.FC<{t: number; t0: number; t1: number; x: number; y0: number; y1: number}> = ({t, t0, t1, x, y0, y1}) => {
	if (t < t0 - 0.4 || t > t1 + 0.5) return null;
	if (t < t0) { const g = seg(t, t0 - 0.4, t0); return <ellipse cx={x} cy={y0 + 4 * g} rx={6 + 3 * g} ry={6 + 6 * g} fill={T.waterL} opacity={0.95} />; }
	if (t < t1) { const u = seg(t, t0, t1), y = lerp(y0, y1, u * u); return <path d={`M${x},${y - 22} C${x - 8},${y - 6} ${x - 12},${y + 2} ${x - 12},${y + 10} C${x - 12},${y + 22} ${x - 4},${y + 28} ${x},${y + 28} C${x + 4},${y + 28} ${x + 12},${y + 22} ${x + 12},${y + 10} C${x + 12},${y + 2} ${x + 8},${y - 6} ${x},${y - 22} Z`} fill={T.waterL} />; }
	const u = seg(t, t1, t1 + 0.5); return <g opacity={1 - u}>{[0, 1].map((i) => <ellipse key={i} cx={x} cy={y1 + 6} rx={20 + 90 * u * (1 - i * 0.4)} ry={5 + 12 * u * (1 - i * 0.4)} fill="none" stroke={T.waterL} strokeWidth={3} />)}
		{Array.from({length: 6}, (_, i) => <circle key={i} cx={x + (i - 2.5) * 16 * u * 3} cy={y1 - 30 * Math.sin(u * Math.PI) * (0.6 + rnd(i, 3))} r={4} fill={T.waterL} />)}</g>;
};
export const S1: React.FC<{t: number}> = ({t}) => { const z = 1 + 0.05 * seg(t, 0, T45.c2), sw = seg(t, 1.6, 2.6);
	return <g>
		<PlateSky id="d1" top="#2C4650" bot="#5E7A7C" lines={0.4} lineC={T.cream} />
		<Cam z={z} x={1100} y={560}>
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M${660 + i * 26},${H} L${660 + i * 26},${420 - i * 4} A${580 - i * 26},${580 - i * 26} 0 0 1 ${1820 - i * 26},${420 - i * 4} L${1820 - i * 26},${H}`} fill="none" stroke={T.cream} strokeWidth={1.4} opacity={0.18 + i * 0.03} />)}
			<rect x={760} y={978} width={1000} height={102} fill={T.marbleSh} stroke={T.ink} strokeWidth={2} />{hatchOver(760, 978, 1000, 102, 'h45d', 0.3)}
			<HorseHead x={1180} y={548} s={1.1} id="d1h" glow={1} />
			{/* the light sweep across the copper */}
			{sw > 0 && sw < 1 && <g opacity={Math.sin(sw * Math.PI) * 0.55} style={{mixBlendMode: 'screen'}}><rect x={760 + 900 * sw - 60} y={60} width={70} height={960} fill={CU.core} transform={`rotate(18 ${760 + 900 * sw} 540)`} /></g>}
			<Drop t={t} t0={0.12} t1={D0} x={1008} y0={790} y1={972} />
			<Drop t={t} t0={2.1} t1={beat(4)} x={1008} y0={790} y1={972} />
		</Cam>
	</g>; };
/* ---------- S2 · C2: 1860, smoke; a soldier carries you off, your stone seat left empty ---------- */
export const S2: React.FC<{t: number}> = ({t}) => { const a = T45.c2, fl = 0.5 + 0.5 * Math.sin(t * 23) * Math.sin(t * 7);
	const g = 1046, h = 780, x0 = 820, x = x0 + Math.max(0, t - a) * 230, p = walkArmsD(phaseD((x - x0) / h + 0.15), {la: 46, le: 58, ra: 50, re: 52});
	const l = jointAt(p, 'LHand', x, g, h), r = jointAt(p, 'RHand', x, g, h), hx = (l[0] + r[0]) / 2, hy = Math.min(l[1], r[1]), hs = 0.3;
	reg({frame: 'C2', who: 'soldier', x, ground: g, h, pose: p, intent: 'walk', hands: [{joint: 'LHand', at: [hx, hy], tol: 40}]});
	return <g>
		<PlateSky id="d2" top={T.skySmoke[0]} bot={T.skySmoke[1]} lines={0.3} lineC={T.ink} />
		{[260, 760, 1300, 1720].map((xx, i) => <g key={i}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={xx + Math.sin(j * 1.3 + i) * 60 + j * 22 + (t - a) * 30} cy={700 - j * 100 - (t - a) * 40} rx={130 + j * 26} ry={80 + j * 12} fill={j < 2 ? '#6A5B4E' : '#8E8172'} opacity={0.75 - j * 0.07} filter="url(#soft14)" />)}</g>)}
		<PlateGround y={820} c={T.pave} c2={T.pave2} edge={T.ink} />
		<StoneBody3 x={500} y={760} s={1.9} />
		<Shadow45 x={x} y={g + 4} rx={h * 0.16} ry={12} o={0.4} />
		<Rimmed x={x} ground={g} h={h} pose={p} look={{dress: 'coat', head: 'short'} as Look4} col={FIG} rim={RIM} rimOp={0.4} /><Kepi pose={p} x={x} g={g} h={h} />
		<HorseHead x={hx + 18} y={hy - hs * 276 + 34} s={hs} id="d2h" glow={1.1} flicker={fl} flip curl={0} />
		<rect x={0} y={0} width={W} height={H} fill="#FFB070" opacity={0.05 * fl} />
	</g>; };
/* ---------- S3 · C3: London 1989, the hammer comes down on the beat ---------- */
export const S3: React.FC<{t: number}> = ({t}) => { const k = ease(seg(t, beat(10.5), beat(11)));
	return <Cam z={1.04 - 0.04 * seg(t, T45.c3, T45.c4)}><AuctionRoom hammer="held" k={k} wall={T.wallG} frame="D3" plinthX={860} /><HorseHead x={860} y={604} s={0.26} id="d3h" glow={0.9} /><Bidders frame="D3" up={[2]} xs={[130, 360, 580]} /></Cam>; };
/* ---------- the private room (C4, D8–D9): no auction — one buyer walks in, signs at the desk; the price card stands on it ---------- */
export const PrivateRoom: React.FC<{t: number; frame: string; v: number; walk?: number; card?: number}> = ({t, frame, v, walk = 1, card = 1}) => {
	const g = 960, h = 600, wr = Math.sin(t * 9) * 4; let x = lerp(380, 1500, walk);
	const stand = grounded({lean: 20, neck: 24, lt: 4, lk: 6, rt: -4, rk: 4, la: 8, le: 30, ra: 32 + wr, re: 34 - wr}), wEnd = walkArmsD(phaseD((1500 - 380) / h), {la: 10, le: 20, ra: 14, re: 24});
	const p = walk < 1 ? walkArmsD(phaseD((x - 380) / h), {la: 10, le: 20, ra: 14, re: 24}) : stand;
	if (walk >= 1) x = x + (wEnd.Hips[0] + stand.Hips[0]) * h;   // keep the hips where the walk left them (stand is drawn flipped)
	reg({frame, who: 'Ho', x, ground: g, h, pose: p, flip: walk >= 1, intent: walk < 1 ? 'walk' : 'stand'});
	return <g>
		<rect x={0} y={0} width={W} height={H} fill="#3E4A55" />{hatchOver(0, 0, W, 760, 'h45d', 0.12)}
		{[200, 1480].map((wx) => <g key={wx}><rect x={wx} y={140} width={240} height={420} fill="#2A3640" stroke="#6D7F8E" strokeWidth={3} /><rect x={wx + 16} y={156} width={208} height={388} fill="none" stroke="#6D7F8E" strokeWidth={1.2} opacity={0.6} /></g>)}
		<rect x={0} y={760} width={W} height={320} fill="#2E3740" /><rect x={0} y={760} width={W} height={3} fill="#5A6A78" />
		<path d="M680,0 L780,0 L940,780 L540,780 Z" fill="#FFF4E0" opacity={0.12} />
		<Shadow45 x={x} y={g + 4} rx={110} ry={12} /><Rimmed x={x} ground={g} h={h} pose={p} flip={walk >= 1} look={{dress: 'shirt', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.45} />
		<Shadow45 x={760} y={964} rx={220} ry={18} /><rect x={610} y={720} width={300} height={240} fill={T.marble} stroke={T.ink} strokeWidth={2} />{hatchOver(610, 720, 300, 240, 'h45d', 0.2)}
		<HorseHead x={760} y={720 - 0.26 * 276} s={0.26} id={`${frame}h`} glow={1} />
		{/* the desk, Ho behind it; the price card stands on it */}
		<Shadow45 x={1370} y={966} rx={260} ry={14} />
		<rect x={1150} y={668} width={440} height={20} fill={T.woodD} stroke={T.ink} strokeWidth={1.5} /><rect x={1166} y={688} width={408} height={272} fill={T.wood} stroke={T.ink} strokeWidth={1.5} />{hatchOver(1166, 688, 408, 272, 'h45d', 0.3)}
		<rect x={1400} y={660} width={120} height={10} fill="#F1EADC" stroke={T.ink} strokeWidth={1} />
		{card > 0 && <g transform={`translate(1130,${lerp(668, 520, easeOut(card))})`} opacity={Math.min(1, card * 3)}>
			<rect x={0} y={0} width={420} height={140} fill="#F1EADC" stroke={T.ink} strokeWidth={2} />
			<text x={22} y={46} style={{fontFamily: SANS, fontSize: 36, fontWeight: 900}} fill={T.ink}>私下成交</text>
			<text x={22} y={112} style={{fontSize: 54}} fill={T.ink}><tspan style={{fontFamily: "'DejaVu Sans',sans-serif", fontWeight: 700}}>HK$ {v}</tspan><tspan style={{fontFamily: SANS, fontWeight: 900}}>万</tspan></text>
		</g>}
	</g>; };
/* ---------- S4 · C4: 2007, bought in a private room; the price rolls on a card ---------- */
export const S4: React.FC<{t: number}> = ({t}) => { const v = 6910;
	return <Cam z={1.04 + 0.05 * seg(t, T45.c4, T45.c5)} x={1060} y={580}><PrivateRoom t={t} frame="C4" v={v} /></Cam>; };
/* ---------- the unveiling (C5, E2): the giver pulls the cloth off you; the receiver claps ---------- */
export const Unveil: React.FC<{t: number; t0: number; t1: number; frame: string; dim?: number}> = ({t, t0, t1, frame, dim = 0}) => {
	const g = 940, h = 600, u = ease(seg(t, t0 + 0.25, t0 + 1.05)), clap = t > t0 + 1.1 ? Math.sin((t - t0) * 14) : 0;
	const up = Math.min(1, u * 2), dn = Math.max(0, u * 2 - 1), gx = 1010, pg = grounded({lean: 6 - 8 * up + 6 * dn, neck: 12 - 8 * up, lt: 4, lk: 4, rt: -4, rk: 4, la: -2, le: 14, ra: lerp(lerp(58, 132, up), 24, dn), re: lerp(lerp(4, 20, up), 10, dn)});
	const on = seg(t, t0 + 1.0, t0 + 1.25), tx = 470, pt = grounded({lean: 4, neck: 8, lt: 2, lk: 2, rt: -3, rk: 3, la: lerp(6, 38, on), le: lerp(10, 84 + 8 * clap, on), ra: lerp(8, 44, on), re: lerp(12, 88 + 8 * clap, on)});
	const hd = jointAt(pg, 'RHand', gx, g, h, true);
	reg({frame, who: 'giver', x: gx, ground: g, h, pose: pg, flip: true, intent: 'stand'}); reg({frame, who: 'receiver', x: tx, ground: g, h, pose: pt, intent: 'stand'});
	/* the cloth: draped over you, then hanging from the hand */
	const dr = [[724, 686], [896, 686]], hang = [[hd[0] - 30, hd[1] + 230], [hd[0] + 50, hd[1] + 210]], cu = Math.min(1, u * 2.2), sw = Math.sin(t * 6) * 16 * u;
	const c0 = [lerp(dr[0][0], hang[0][0], cu) + sw, lerp(dr[0][1], hang[0][1], cu)], c1 = [lerp(dr[1][0], hang[1][0], cu) + sw, lerp(dr[1][1], hang[1][1], cu)];
	const top = [lerp(800, hd[0], cu), lerp(500, hd[1], cu)];
	return <g>
		<rect x={0} y={0} width={W} height={H} fill={T.cream} />{hatchOver(0, 0, W, 760, 'h45d', 0.1)}
		{[120, 1360].map((x) => <rect key={x} x={x} y={120} width={440} height={520} fill="none" stroke={T.marbleSh} strokeWidth={4} />)}
		<PlateGround y={760} c="#B9A98A" c2="#8F7E62" edge={T.ink} />
		<path d="M760,0 L840,0 L1000,880 L600,880 Z" fill="#FFF8E8" opacity={0.25} />
		<Shadow45 x={800} y={944} rx={180} ry={14} /><rect x={660} y={700} width={280} height={240} fill={T.marble} stroke={T.ink} strokeWidth={2} />{hatchOver(660, 700, 280, 240, 'h45d', 0.2)}
		<rect x={640} y={686} width={320} height={18} fill={T.wallW} stroke={T.ink} strokeWidth={1.5} />
		<HorseHead x={800} y={686 - 0.25 * 276} s={0.25} id={`${frame}h`} glow={0.3 + 0.7 * u} />
		<Shadow45 x={gx} y={g + 4} rx={110} ry={12} /><Shadow45 x={tx} y={g + 4} rx={110} ry={12} />
		<Rimmed x={tx} ground={g} h={h} pose={pt} look={{dress: 'shirt', head: 'glasses'} as Look4} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={gx} ground={g} h={h} pose={pg} look={{dress: 'shirt', head: 'short'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
		<path d={`M${top[0]},${top[1]} C${top[0] - 60 + 40 * cu},${top[1] + 20} ${c0[0] - 10},${c0[1] - 120} ${c0[0]},${c0[1]} Q${(c0[0] + c1[0]) / 2},${(c0[1] + c1[1]) / 2 + 18} ${c1[0]},${c1[1]} C${c1[0] + 10},${c1[1] - 120} ${top[0] + 60 - 20 * cu},${top[1] + 20} ${top[0]},${top[1]} Z`} fill="#A63A2C" stroke={T.ink} strokeWidth={2} />
		<path d={`M${top[0]},${top[1] + 10} C${top[0] - 10},${top[1] + 80} ${(c0[0] + c1[0]) / 2 - 10},${c0[1] - 60} ${(c0[0] + c1[0]) / 2},${(c0[1] + c1[1]) / 2}`} stroke="#D2604A" strokeWidth={3} fill="none" opacity={0.7} />
		{dim > 0 && <><rect width={W} height={H} fill="#0C141A" opacity={0.7 * dim} /><path d="M760,0 L840,0 L1000,880 L600,880 Z" fill="#FFF8E8" opacity={0.18 * dim} /><HorseHead x={800} y={686 - 0.25 * 276} s={0.25} id={`${frame}h2`} glow={1} o={dim} /></>}
	</g>; };
export const S5: React.FC<{t: number}> = ({t}) => <Cam z={1.03 + 0.04 * seg(t, T45.c5, T45.c6)} x={900}><Unveil t={t} t0={T45.c5} t1={T45.c6} frame="C5" /></Cam>;
/* ---------- S6 · C6: 2020, the doors of 文殊亭 open on you ---------- */
export const S6: React.FC<{t: number}> = ({t}) => { const d = easeOut(seg(t, T45.c6, T45.c6 + 0.7));
	return <Cam z={1.0 + 0.12 * ease(seg(t, T45.c6, T45.c7))} x={960} y={560}><Courtyard t={t} id="d6" doors={d} light={d} /></Cam>; };
/* ---------- S7 · C7: the twelve niches; pull back from yours ---------- */
export const S7: React.FC<{t: number}> = ({t}) => { const u = ease(seg(t, T45.c7, T45.c7 + 1.6)), z = lerp(2.4, 1.0, u), cx = lerp(1035, 960, u), cy = lerp(680, 540, u);
	return <Cam z={z} x={cx} y={cy}>
		<rect x={0} y={0} width={W} height={H} fill={T.wallB} />{hatchOver(0, 0, W, 460, 'hzInk', 0.25)}
		<rect x={0} y={460} width={W} height={620} fill={T.cream} stroke={T.ink} strokeWidth={2} />{hatchOver(0, 460, W, 620, 'h45d', 0.12)}
		{ZODIAC.map((zz, i) => { const x = 165 + i * 145, y = 500, has = RETURNED.has(zz), you = zz === '马';
			return <g key={zz}>
				<path d={`M${x - 58},${y + 330} L${x - 58},${y + 60} A58,58 0 0 1 ${x + 58},${y + 60} L${x + 58},${y + 330} Z`} fill="#33485A" stroke={T.ink} strokeWidth={2} />
				{you ? <><Glow x={x} y={y + 170} r={150} c={CU.halo} o={0.45} id="d7g" /><HorseHead x={x + 4} y={y + 168} s={0.17} id="d7h" glow={0.6} /></>
					: has ? <ZHead z={zz} x={x} y={y + 170} s={1.05} mode="bronze" /> : <ZHead z={zz} x={x} y={y + 170} s={1.05} mode="ghost" ghostC={T.cream} />}
				<text x={x} y={y + 300} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 900}} fill={T.cream} opacity={has ? 0.95 : 0.5}>{zz}</text>
			</g>; })}
	</Cam>; };
/* ---------- rewind (17.55–18.115): the cold open flashes backwards, tracking noise, ◀◀ ---------- */
export const Rewind: React.FC<{t: number}> = ({t}) => { const u = seg(t, T45.rew, T45.title), seq = [S7, S6, S5, S4, S3, S2, S1], i = Math.min(seq.length - 1, Math.floor(u * seq.length)), Sc = seq[i];
	const back = [T45.c7, T45.c6, T45.c5, T45.c4, T45.c3, T45.c2, 0][i] + 0.6;
	return <g>
		<g transform={`translate(960,540) scale(1.04) translate(${-960 + (rnd(Math.floor(t * 60), 4) - 0.5) * 30},-540)`}><Sc t={back} /></g>
		<rect x={0} y={0} width={W} height={H} fill="#10181c" opacity={0.25} />
		{Array.from({length: 5}, (_, j) => { const y = (rnd(Math.floor(t * 60), j) * H) | 0; return <rect key={j} x={0} y={y} width={W} height={6 + 18 * rnd(j, Math.floor(t * 60))} fill="#E9EEF0" opacity={0.28} />; })}
		<path d="M150,140 L100,180 L150,220 Z M205,140 L155,180 L205,220 Z" fill="#F3F6F2" />
		<text x={240} y={204} style={{fontFamily: SANS, fontSize: 58, fontWeight: 900}} fill="#F3F6F2">{['2026', '2020', '2019', '2007', '1989', '1860', '乾隆年间'][i]}</text>
	</g>; };
/* ---------- S8 · title on the crash ---------- */
export const S8: React.FC<{t: number}> = ({t}) => { const a = T45.title, rise = ease(seg(t, a, a + 1.4));
	return <g>
		<PlateSky id="d8" top="#22374A" bot="#4E6A78" lines={0.45} lineC={T.cream} />
		<rect x={360} y={250} width={1200} height={560} fill="none" stroke={T.cream} strokeWidth={3} opacity={0.8} />
		<rect x={376} y={266} width={1168} height={528} fill="none" stroke={T.cream} strokeWidth={1.2} opacity={0.55} />
		{[[360, 250], [1560, 250], [360, 810], [1560, 810]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill="#22374A" stroke={T.cream} strokeWidth={2.5} />)}
		{Array.from({length: 12}, (_, i) => <WaterArc key={i} x0={420 + i * 98} y0={780} x1={960} y1={700} h={(260 + 30 * Math.sin(i)) * rise} o={(i === 6 ? 0.95 : 0.3) * Math.min(1, rise * 2)} w={i === 6 ? 6 : 3} />)}
		<HorseHead x={1340} y={420} s={0.22} id="d8h" glow={0.8 + 0.4 * (1 - seg(t, a, a + 0.5))} />
	</g>; };
/* ---------- S9 · A1: cast in one piece — a founder pours, the mould is broken away, you stand on its base ---------- */
const FRAG = Array.from({length: 8}, (_, i) => ({x: 880 + (i % 4) * 50, y: 550 + Math.floor(i / 4) * 85, vx: (i % 4 - 1.5) * 160 + (rnd(i, 3) - 0.5) * 80, vy: -180 - 140 * rnd(i, 4), r: (rnd(i, 5) - 0.5) * 220}));
export const S9: React.FC<{t: number}> = ({t}) => { const a = T45.a1, brk = beat(39), pour = seg(t, a + 0.3, brk - 0.15), z = 1 + 0.05 * seg(t, a, T45.a3), b = Math.max(0, t - brk);
	const g = 800, h = 560, wx = 330, tilt = ease(seg(t, a, a + 0.6)) * (1 - ease(seg(t, brk - 0.3, brk + 0.2))), down = ease(seg(t, brk - 0.2, brk + 0.5));
	const p = grounded({lean: 14 - 6 * down, neck: 12, lt: 10, lk: 12, rt: -8, rk: 6, la: 66 - 20 * down, le: 50, ra: 82 - 30 * down, re: 6});
	const A = jointAt(p, 'LHand', wx, g, h), B2 = jointAt(p, 'RHand', wx, g, h), rear = A[0] < B2[0] ? A : B2, front = A[0] < B2[0] ? B2 : A;
	const bx = lerp(880, 640, down), by = lerp(470, 770, down), ux0 = bx - rear[0], uy0 = by - rear[1], L = Math.hypot(ux0, uy0) || 1, ux = ux0 / L, uy = uy0 / L, ang = Math.atan2(uy, ux) * 180 / Math.PI; void front;
	reg({frame: 'A1', who: 'founder', x: wx, ground: g, h, pose: p, intent: 'stand', hands: [{joint: 'LHand', at: A, tol: 4}]});
	return <Cam z={z} x={960} y={540}>
		<rect x={0} y={0} width={W} height={H} fill="#5E5246" />{hatchOver(0, 0, W, 800, 'h45d', 0.18)}
		{Array.from({length: 9}, (_, i) => <rect key={i} x={0} y={60 + i * 80} width={W} height={2} fill={T.ink} opacity={0.25} />)}
		<PlateGround y={800} c="#8C7A64" c2="#6A5A48" edge={T.ink} />
		<Glow x={980} y={640} r={360} c={CU.halo} o={0.25 * pour + 0.35 * Math.max(0, 1 - b)} id="d9w" />
		{/* the base stand (stays), the mould on it (broken away on the beat) */}
		<rect x={900} y={720} width={150} height={80} fill={T.woodD} stroke={T.ink} strokeWidth={2} />
		{t >= brk && <HorseHead x={968} y={720 - 0.24 * 276} s={0.24} id="d9h" glow={Math.min(1, 0.4 + b)} curl={0} />}
		{t < brk ? <g><rect x={880} y={550} width={200} height={170} fill="#7A6A58" stroke={T.ink} strokeWidth={2.5} />{hatchOver(880, 550, 200, 170, 'h45d', 0.35)}
			<path d="M962,550 L998,550 L992,572 L968,572 Z" fill="#3A2E24" />{[0, 1].map((i) => <path key={i} d={`M${900 + i * 90},${560 + i * 60} l30,40 l-14,30`} stroke={T.ink} strokeWidth={1.5} fill="none" opacity={0.4} />)}</g>
			: FRAG.map((f, i) => { const x = f.x + f.vx * 0.6 * b, y = Math.min(745, f.y + f.vy * 0.6 * b + 2400 * b * b), rr = f.r * Math.min(b, 0.35); return <rect key={i} x={x} y={y} width={50} height={85} fill="#7A6A58" stroke={T.ink} strokeWidth={2} transform={`rotate(${rr} ${x + 25} ${y + 42})`} />; })}
		{/* the founder and his ladle */}
		<Shadow45 x={wx} y={g + 4} rx={110} ry={12} o={0.4} />
		<Rimmed x={wx} ground={g} h={h} pose={p} look={{dress: 'robe', head: 'cylcap'} as Look4} col={FIG} rim={RIM} rimOp={0.4} />
		<line x1={rear[0] - ux * 20} y1={rear[1] - uy * 20} x2={bx} y2={by} stroke="#2C241C" strokeWidth={13} strokeLinecap="round" />
		<g transform={`translate(${bx},${by}) rotate(${-ang * 0.15 + 55 * tilt})`}><path d="M-20,-40 L100,-40 C100,10 82,44 40,44 C-2,44 -20,10 -20,-40 Z" fill="#3E3328" stroke={T.ink} strokeWidth={2.5} /><ellipse cx={40} cy={-40} rx={60} ry={9} fill={CU.mid} opacity={0.9} /></g>
		{pour > 0 && pour < 1 && tilt > 0.7 && <><Glow x={980} y={555} r={150} c={CU.halo} o={0.6} id="d9g" /><path d={`M${bx + 86},${by + 50} Q${bx + 98},${by + 66} 980,560`} stroke={CU.mid} strokeWidth={12} fill="none" strokeLinecap="round" /><path d={`M${bx + 86},${by + 50} Q${bx + 98},${by + 66} 980,560`} stroke={CU.core} strokeWidth={5} fill="none" strokeLinecap="round" /></>}
	</Cam>; };
/* ---------- S10–S12 · A3–A5: the fountain; push out from you, then the hours go round ---------- */
const HOUR_AT = (t: number) => { const u = seg(t, T45.a4, T45.end); return Math.min(6, u * u * 7.2); };
export const S10: React.FC<{t: number}> = ({t}) => {
	const a = T45.a3, u = ease(seg(t, a, a + 1.6)), you = ZPos(960, 560, 1.25).find((p) => p.z === '马')!, z = lerp(3.0, 1.0, u), cx = lerp(you.x, 960, u), cy = lerp(you.y - 80, 540, u);
	const h = HOUR_AT(t), act = t >= T45.a4 ? ZODIAC[Math.floor(h) % 12] : undefined, grow = t >= T45.a4 ? Math.sin(Math.PI * (h % 1)) : 0;
	return <Cam z={z * (1 + 0.03 * seg(t, a + 1.6, T45.end))} x={cx} y={cy}>
		<Garden id="d10" g={560} /><Haiyantang cx={960} g={560} k={0.85} /><PlateGround y={560} c={T.pave} c2={T.pave2} edge={T.ink} />
		<Pool cx={960} g={560} k={1.25} present="all" id="d10p" arcs={act ? 'one' : 'none'} active={act} grow={Math.max(0.15, grow)} />
		{t >= T45.a5 && <g opacity={easeOut(seg(t, T45.a5, T45.a5 + 0.4))}><rect x={820} y={880} width={280} height={84} rx={6} fill={T.cream} stroke={T.ink} strokeWidth={2.5} /><text x={960} y={938} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 900, letterSpacing: '0.2em'}} fill={T.ink}>水力钟</text></g>}
	</Cam>; };
export const hourHand = (t: number) => t < T45.a4 ? 0 : HOUR_AT(t) * 30;
void P; void KEY; void H;
