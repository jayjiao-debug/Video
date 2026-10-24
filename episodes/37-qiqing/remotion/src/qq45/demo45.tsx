import React from 'react';
import {W, H, rnd, lerp, Glow, P, CU, KEY, T, PlateSky, PlateGround, HorseHead, ZHead, StoneBody, WaterArc, ZODIAC, RETURNED, Z} from './kit45';
import {Haiyantang, Pool, Garden, AuctionRoom, Bidders, ZPos, hatchOver, FIG, RIM, LK} from './frames45';
import {Rimmed, Look4} from '../qq44/kit44';
import {jointAt, grounded, reg} from './pose45';
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
const Cam: React.FC<{x?: number; y?: number; z?: number; children: React.ReactNode}> = ({x = 960, y = 540, z = 1, children}) =>
	<g transform={`translate(960,540) scale(${z}) translate(${-x},${-y})`}>{children}</g>;

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
/* ---------- S2 · C2: 1860, smoke; you are lifted off your seat ---------- */
export const S2: React.FC<{t: number}> = ({t}) => { const a = T45.c2, lift = ease(seg(t, beat(7), beat(8.4))), fl = 0.5 + 0.5 * Math.sin(t * 23) * Math.sin(t * 7);
	return <g>
		<PlateSky id="d2" top={T.skySmoke[0]} bot={T.skySmoke[1]} lines={0.3} lineC={T.ink} />
		{[260, 760, 1300, 1720].map((x, i) => <g key={i}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 60 + j * 22 + (t - a) * 30} cy={700 - j * 100 - (t - a) * 40} rx={130 + j * 26} ry={80 + j * 12} fill={j < 2 ? '#6A5B4E' : '#8E8172'} opacity={0.75 - j * 0.07} />)}</g>)}
		<PlateGround y={820} c={T.pave} c2={T.pave2} edge={T.ink} />
		<StoneBody x={960} y={1010} s={3} />
		<g transform={`translate(0,${-820 * lift})`}><HorseHead x={966} y={808} s={0.39} id="d2h" glow={1.1} flicker={fl} flip /></g>
		<rect x={0} y={0} width={W} height={H} fill="#FFB070" opacity={0.05 * fl} />
	</g>; };
/* ---------- S3 · C3: London 1989, the hammer comes down on the beat ---------- */
export const S3: React.FC<{t: number}> = ({t}) => { const k = ease(seg(t, beat(10.5), beat(11)));
	return <Cam z={1.04 - 0.04 * seg(t, T45.c3, T45.c4)}><AuctionRoom hammer="held" k={k} wall={T.wallG} frame="D3" plinthX={860} /><HorseHead x={860} y={482} s={0.5} id="d3h" glow={0.9} /><Bidders frame="D3" up={[2]} xs={[130, 360, 580]} /></Cam>; };
/* ---------- S4 · C4: Hong Kong 2007, the price rolls, the hammer stays up ---------- */
export const S4: React.FC<{t: number}> = ({t}) => { const v = Math.round(6910 * easeOut(seg(t, T45.c4, T45.c4 + 1.3)));
	const screen = <text x={1210} y={452} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontSize: 50, fontWeight: 700}} fill={T.cream}>HK$ {v}万</text>;
	return <Cam z={1.0 + 0.05 * seg(t, T45.c4, T45.c5)} x={900}><AuctionRoom hammer="held" wall={T.wallB} trim={T.wallBL} frame="D4" screen={screen} plinthX={800} /><HorseHead x={800} y={482} s={0.5} id="d4h" glow={1} /><Bidders frame="D4" up={[0, 1]} xs={[110, 320, 520]} /></Cam>; };
/* ---------- S5 · C5: 2019, handed over ---------- */
const giver = grounded({lean: 4, neck: 8, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 14, ra: 34, re: 30}), taker = grounded({lean: 6, neck: 12, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 18, ra: 30, re: 44});
export const S5: React.FC<{t: number}> = ({t}) => { const g = 940, h = 600;
	reg({frame: 'D5', who: 'giver', x: 560, ground: g, h, pose: giver, intent: 'stand'}); reg({frame: 'D5', who: 'taker', x: 1360, ground: g, h, pose: taker, flip: true, intent: 'stand'});
	return <Cam z={1 + 0.04 * seg(t, T45.c5, T45.c6)}>
		<rect x={0} y={0} width={W} height={H} fill={T.cream} />{hatchOver(0, 0, W, 760, 'h45d', 0.1)}
		{[200, 760, 1320].map((x) => <rect key={x} x={x} y={120} width={400} height={520} fill="none" stroke={T.marbleSh} strokeWidth={4} />)}
		<PlateGround y={760} c="#B9A98A" c2="#8F7E62" edge={T.ink} />
		<path d="M920,0 L1000,0 L1160,880 L760,880 Z" fill="#FFF8E8" opacity={0.25} />
		<rect x={820} y={700} width={280} height={240} fill={T.marble} stroke={T.ink} strokeWidth={2} />{hatchOver(820, 700, 280, 240, 'h45d', 0.2)}
		<rect x={800} y={686} width={320} height={18} fill={T.wallW} stroke={T.ink} strokeWidth={1.5} />
		<HorseHead x={960} y={540} s={0.38} id="d5h" glow={1} />
		<Rimmed x={560} ground={g} h={h} pose={giver} look={LK.auct} col={FIG} rim={RIM} rimOp={0.4} />
		<Rimmed x={1360} ground={g} h={h} pose={taker} look={{dress: 'jacket', head: 'glasses'} as Look4} flip col={FIG} rim={RIM} rimOp={0.4} />
	</Cam>; };
/* ---------- S6 · C6: 2020, the pavilion in the garden lights up ---------- */
export const S6: React.FC<{t: number}> = ({t}) => { const on = easeOut(seg(t, T45.c6, T45.c6 + 0.6));
	return <Cam z={1.25 - 0.08 * seg(t, T45.c6, T45.c7)} x={960} y={520}>
		<PlateSky id="d6" top={T.skyDusk[0]} bot={T.skyDusk[1]} lines={0.3} lineC={T.ink} />
		<PlateGround y={700} c={T.grass} c2="#6F8A63" edge={T.ink} hatch={0.6} />
		<path d="M180,700 L180,520 C180,470 220,440 260,440 C300,440 340,470 340,520 L340,560 L310,560 L310,526 C310,494 290,476 260,476 C230,476 210,494 210,526 L210,700 Z M360,700 L360,600 L400,580 L420,610 L440,590 L460,700 Z M100,700 L120,640 L150,650 L160,700 Z" fill={T.stone} stroke={T.ink} strokeWidth={1.5} />
		<path d="M780,440 L960,330 L1140,440 Z" fill="#4F6B62" stroke={T.ink} strokeWidth={2.5} />
		<path d="M800,440 L1120,440 L1100,470 L820,470 Z" fill="#8A5A3C" stroke={T.ink} strokeWidth={2} />
		{[830, 1090].map((x) => <rect key={x} x={x - 12} y={470} width={24} height={230} fill="#8A5A3C" stroke={T.ink} strokeWidth={2} />)}
		<rect x={860} y={600} width={200} height={100} fill={T.marble} stroke={T.ink} strokeWidth={2} />
		<HorseHead x={960} y={550} s={0.16} id="d6h" glow={on} />
	</Cam>; };
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
				<text x={x} y={y + 300} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={T.cream} opacity={has ? 0.95 : 0.5}>{zz}</text>
			</g>; })}
	</Cam>; };
/* ---------- rewind (17.55–18.115): the cold open flashes backwards, tracking noise, ◀◀ ---------- */
export const Rewind: React.FC<{t: number}> = ({t}) => { const u = seg(t, T45.rew, T45.title), seq = [S7, S6, S5, S4, S3, S2, S1], i = Math.min(seq.length - 1, Math.floor(u * seq.length)), Sc = seq[i];
	const back = [T45.c7, T45.c6, T45.c5, T45.c4, T45.c3, T45.c2, 0][i] + 0.6;
	return <g>
		<g transform={`translate(${(rnd(Math.floor(t * 60), 4) - 0.5) * 30},0)`}><Sc t={back} /></g>
		<rect x={0} y={0} width={W} height={H} fill="#10181c" opacity={0.25} />
		{Array.from({length: 5}, (_, j) => { const y = (rnd(Math.floor(t * 60), j) * H) | 0; return <rect key={j} x={0} y={y} width={W} height={6 + 18 * rnd(j, Math.floor(t * 60))} fill="#E9EEF0" opacity={0.28} />; })}
		<path d="M150,140 L100,180 L150,220 Z M205,140 L155,180 L205,220 Z" fill="#F3F6F2" />
		<text x={240} y={204} style={{fontFamily: "'DejaVu Sans Mono',monospace", fontSize: 54, fontWeight: 700}} fill="#F3F6F2">{Math.round(lerp(2026, 1759, u))}</text>
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
/* ---------- S9 · A1: cast in one piece ---------- */
export const S9: React.FC<{t: number}> = ({t}) => { const a = T45.a1, pour = seg(t, a, beat(39)), open = ease(seg(t, beat(39), beat(40.5))), z = 1 + 0.06 * seg(t, a, T45.a3);
	const lx = 760, ly = 300, tilt = -10 - 40 * ease(seg(t, a, a + 0.6)) * (1 - seg(t, beat(38.5), beat(39)));
	return <Cam z={z}>
		<rect x={0} y={0} width={W} height={H} fill="#5E5246" />{hatchOver(0, 0, W, 800, 'h45d', 0.18)}
		{Array.from({length: 9}, (_, i) => <rect key={i} x={0} y={60 + i * 80} width={W} height={2} fill={T.ink} opacity={0.25} />)}
		<PlateGround y={800} c="#8C7A64" c2="#6A5A48" edge={T.ink} />
		{/* the mould: two halves that slide apart */}
		{[-1, 1].map((sg) => <g key={sg} transform={`translate(${sg * 260 * open},0)`}><rect x={sg < 0 ? 760 : 960} y={420} width={200} height={380} fill="#7A6A58" stroke={T.ink} strokeWidth={2.5} />{hatchOver(sg < 0 ? 760 : 960, 420, 200, 380, 'h45d', 0.35)}</g>)}
		{open > 0.05 && <HorseHead x={960} y={590} s={0.5} id="d9h" glow={open} o={open} />}
		{/* the ladle and the copper stream (you, molten) */}
		{open < 0.3 && <g opacity={1 - open * 3}>
			<g transform={`translate(${lx},${ly}) rotate(${tilt})`}><path d="M-120,-50 L40,-50 C40,10 20,50 -40,50 C-100,50 -120,10 -120,-50 Z" fill="#3E3328" stroke={T.ink} strokeWidth={2.5} /><rect x={-126} y={-58} width={172} height={14} rx={4} fill="#2C241C" /><rect x={-440} y={-14} width={320} height={16} rx={6} fill="#2C241C" /><ellipse cx={-40} cy={-50} rx={76} ry={10} fill={CU.mid} opacity={0.9} /></g>
			{pour > 0 && pour < 1 && <><Glow x={900} y={420} r={160} c={CU.halo} o={0.6} id="d9g" /><path d={`M${lx + 30},${ly + 20} C${lx + 120},${ly + 40} ${900},${ly + 60} 900,420`} stroke={CU.mid} strokeWidth={22} fill="none" strokeLinecap="round" /><path d={`M${lx + 30},${ly + 20} C${lx + 120},${ly + 40} ${900},${ly + 60} 900,420`} stroke={CU.core} strokeWidth={8} fill="none" strokeLinecap="round" /></>}
		</g>}
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
