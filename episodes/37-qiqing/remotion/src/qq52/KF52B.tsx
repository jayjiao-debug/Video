import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Img} from 'remotion';
import {W, H, grounded, walkPose, lerp, rnd, KAI, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, thB, Pool} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {ikArm, toBody, J} from '../qq51/partsB51';
import {SealHollow} from '../qq51/master51';
import {PAL52, EXTRA52, FLAME, CLOUD} from './palette52';
import {Flame, Billow, RocketBody, RocketCloud, Capsule, Glint52, LOOKS52, blur52} from './props52';
import {P2, SubB, StampB, Label, Scrim, Frame52, Fig, LOOK52, Sounding, soundingGeom, Rail, Pump, pumpGeom, Sandbags, ReedHut, BallSat, Flood} from './partsB52';
/* ep52 key frames, Builder B: KF08–KF14 in ep51's approved 「时代色」 look; the hero is the launch light.
   KF52B-ALL renders frame i = KF08 + i. Subtitles verbatim from 52-huojian/lines_read.json (v4 hook C timeline);
   stamps from script.md's stamp column (〃 = unchanged). */
const SH = PAL52.sh1960, SX = EXTRA52.sh1960;

/* ---------- the 上海 beach at dawn (shared by KF08 / KF09) ---------- */
const Beach: React.FC<{hz: number; id: string; glowX?: number}> = ({hz, id, glowX = 1560}) => <g>
	{/* dawn: the warm band low over the sea (east), a few long lit cloud streaks */}
	<Pool id={`${id}d`} x={glowX} y={hz} rx={1100} ry={330} a={0.55} col={SH.horizon} />
	{[[380, 1300, 300, 10], [1500, 900, 380, 8], [700, 600, 440, 6]].map(([x, w, y, h], i) => <g key={i}>
		<ellipse cx={x} cy={y} rx={w / 2} ry={h} fill="#E8DCC4" opacity={0.22} filter={blur52(4)} />
		<path d={`M${x - w * 0.4},${y + h * 0.6} Q${x},${y + h * 1.4} ${x + w * 0.4},${y + h * 0.6}`} stroke="#FFE4B8" strokeWidth={2} opacity={0.35} fill="none" /></g>)}
	{/* the sea, its shimmer under the dawn */}
	<defs><linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A7C8C" /><stop offset="1" stopColor={SX.sea} /></linearGradient>
		<linearGradient id={`${id}sand`} gradientUnits="userSpaceOnUse" x1={0} y1={hz + 80} x2={0} y2={H}><stop offset="0" stopColor={SX.sand} /><stop offset="0.45" stopColor={SH.field[0]} /><stop offset="1" stopColor={SH.field[1]} /></linearGradient></defs>
	<rect x={-40} y={hz} width={W + 80} height={90} fill={`url(#${id}sea)`} />
	<path d={Array.from({length: 26}, (_, i) => { const y = hz + 6 + (i % 7) * 11 + rnd(i, 3) * 4, x = glowX - 520 + rnd(i, 4) * 1040, w = 30 + 90 * rnd(i, 5) * (1 - Math.abs(x - glowX) / 700); return `M${x - w / 2},${y} h${Math.max(10, w)}`; }).join(' ')} stroke={SX.seaHi} strokeWidth={2.2} opacity={0.6} strokeLinecap="round" />
	<path d={`M-40,${hz} H${W + 40}`} stroke="#F6E8C8" strokeWidth={2} opacity={0.6} />
	{/* the beach: wet sand at the waterline, dry sand toward us */}
	<path d={`M-40,${hz + 88} Q600,${hz + 80} 1200,${hz + 92} T${W + 40},${hz + 86} V${H + 40} H-40 Z`} fill={`url(#${id}sand)`} />
	<path d={`M-40,${hz + 88} Q600,${hz + 80} 1200,${hz + 92} T${W + 40},${hz + 86}`} stroke="#E8D8B0" strokeWidth={3} opacity={0.55} fill="none" />
	<path d={Array.from({length: 18}, (_, i) => { const y = hz + 120 + i * 22 + rnd(i, 8) * 10, x = rnd(i, 9) * W; return `M${x},${y} q${40 + 60 * rnd(i, 1)},-4 ${90 + 120 * rnd(i, 2)},0`; }).join(' ')} stroke="#5A4E36" strokeWidth={2} opacity={0.22} fill="none" />
</g>;

/* ===================== KF08 · 45.0 s · N2 — 1960 上海: the rocket on its rail, the walker on the bicycle pump ===================== */
const KF08: React.FC = () => { const hz = 600, g = 968;
	const wx = 455, wh = 480, px = wx + 0.27 * wh, ps = 168, hd = pumpGeom(px, g, ps, 0.85).handle, ho = pumpGeom(px, g, ps).hoseOut;
	let wp = grounded({lean: 30, neck: 22, lt: 16, lk: 30, rt: -16, rk: 14, la: 40, le: 30, ra: 40, re: 30});
	wp = ikArm(wp, 'R', toBody(hd[0] - 4, hd[1] + 6, wx, g, wh));
	wp = ikArm(wp, 'L', toBody(hd[0] + 4, hd[1] + 4, wx, g, wh));
	const rx = 1240, rb = 790, rh = 540, kx = rx - rh * 0.034 - 8, kb = rb - 14, tank = soundingGeom(kx, kb, rh).tank;
	// a worker carrying a crate across the sand toward the rail (人力搬送)
	const cx = 930, cg = 812, ch = 200; let cp = walkPose(0.32); const box: P2 = [cx + 0.06 * ch, cg - 1.0 * ch];
	cp = ikArm(cp, 'L', toBody(box[0] - 0.04 * ch, box[1] + 0.06 * ch, cx, cg, ch, false));
	return <Frame52 id="k8" era="sh1960" hz={hz} over={<><SubB s={'66年前，上海，\n那枚靠打气筒加压的火箭升空了。'} /><StampB y="1960.2.19" place="上海" note="T-7M 试验型液体探空火箭" /><SealHollow /></>}>
		<Beach hz={hz} id="k8b" />
		{/* reed huts behind (芦苇窝棚) */}
		<ReedHut x={190} g={714} w={190} h={132} reed={SX.reed} reedD={SX.reedD} />
		<ReedHut x={372} g={710} w={128} h={92} reed={SX.reed} reedD={SX.reedD} />
		<ReedHut x={1680} g={712} w={156} h={108} reed={SX.reed} reedD={SX.reedD} />
		<Pool id="k8r" x={rx} y={rb - 260} rx={260} ry={420} a={0.22} col="#FFE8C0" />
		{/* the rail and the rocket on its left face; the hose runs from the pump across the sand and up to the tank */}
		<Rail x={rx} base={rb} h={600} col="#3A342A" hi="#F2DEB0" />
		<Sounding x={kx} base={kb} h={rh} id="k8" lit={1} />
		<path d={`M${ho[0]},${ho[1]} C${ho[0] + 160},${g + 30} ${1030},${rb + 120} ${rx - 3},${rb - 6} L${rx - 3},${tank[1] + 16} Q${rx - 3},${tank[1]} ${tank[0] + 2},${tank[1]}`} fill="none" stroke="#1E1A16" strokeWidth={6} strokeLinecap="round" />
		<path d={`M${ho[0]},${ho[1] - 2} C${ho[0] + 160},${g + 28} ${1030},${rb + 118} ${rx - 1},${rb - 8}`} fill="none" stroke="#C8B890" strokeWidth={1.4} opacity={0.5} />
		<circle cx={tank[0] + 2} cy={tank[1]} r={5} fill="#3A3E44" stroke="#14161A" strokeWidth={1.2} />
		{/* crates and a drum by the rail */}
		{[[1330, rb + 4, 96, 58], [1440, rb + 6, 84, 52], [1376, rb + 4 - 58, 80, 50]].map(([x, y, w, h], i) => <g key={i}><rect x={x} y={y - h} width={w} height={h} fill="#6A5A3A" stroke="#2A2218" strokeWidth={1.6} />
			<path d={`M${x},${y - h / 2} H${x + w} M${x + w / 3},${y - h} V${y} M${x + 2 * w / 3},${y - h} V${y}`} stroke="#3A3020" strokeWidth={1.4} opacity={0.6} /><path d={`M${x + w},${y - h} V${y}`} stroke="#FFE4B0" strokeWidth={1.6} opacity={0.5} /></g>)}
		<rect x={1546} y={rb - 62} width={46} height={70} rx={6} fill="#4A5048" stroke="#1E2220" strokeWidth={1.4} /><path d={`M1546,${rb - 40} h46 M1546,${rb - 14} h46`} stroke="#1E2220" strokeWidth={2} /><path d={`M1590,${rb - 58} V${rb + 4}`} stroke="#FFE4B0" strokeWidth={1.6} opacity={0.5} />
		{/* the carrier */}
		<rect x={box[0] - 0.13 * ch} y={box[1] - 0.12 * ch} width={0.26 * ch} height={0.13 * ch} fill="#5A4A30" stroke="#2A2218" strokeWidth={1.4} />
		<Fig era="sh1960" x={cx} g={cg} h={ch} pose={cp} look={LOOKS52.worker.look} col="#14100A" rimO={0.8} />
		<rect x={box[0] - 0.13 * ch} y={box[1] - 0.12 * ch} width={0.26 * ch} height={0.13 * ch} fill="none" stroke="#FFE4B0" strokeWidth={1.2} opacity={0.5} />
		{/* the walker (1950s work jacket) works the pump with both hands */}
		<Pool id="k8w" x={wx + 80} y={g + 4} rx={300} ry={40} a={0.18} col="#2A2016" />
		<Pump x={px} g={g} s={ps} up={0.85} />
		<Fig era="sh1960" x={wx} g={g} h={wh} pose={wp} look={LOOKS52.worker.look} lx={1} />
	</Frame52>; };

/* ===================== KF09 · 52.0 s · N4 — 王希季 behind the sandbag post; the rocket leaves the rail ===================== */
const KF09: React.FC = () => { const hz = 632, g = 905;
	const rx = 1180, rb = 792, kh = 270, kx = rx - kh * 0.034 - 6, kb = 398, nz = soundingGeom(kx, kb, kh).nozzle;
	// 王希季: a small one-tone silhouette, field telephone to his ear, looking up at the rocket
	const wgx = 560, wgh = 300;
	let gp = grounded({lean: -2, neck: -24, lt: 3, lk: 3, rt: -4, rk: 4, la: 10, le: 30, ra: 10, re: 20});
	const hc = J(gp, 'Head', wgx, g, wgh), ear: P2 = [hc[0] - 0.006 * wgh, hc[1] - 0.004 * wgh], mouth: P2 = [hc[0] + 0.052 * wgh, hc[1] + 0.046 * wgh];
	gp = ikArm(gp, 'R', toBody((ear[0] + mouth[0]) / 2 - 0.02 * wgh, (ear[1] + mouth[1]) / 2 + 0.02 * wgh, wgx, g, wgh));
	const sbTop = g + 24 - 4 * 50 * 0.86, box: P2 = [wgx - 60, sbTop - 30];
	// the walker beside him, looking up
	const wkx = 770, wkh = 316, wkp = grounded({lean: -4, neck: -32, lt: 4, lk: 4, rt: -5, rk: 5, la: 6, le: 14, ra: -4, re: 10});
	const wallTop = g - 0.62 * wgh;
	return <Frame52 id="k9" era="sh1960" hz={hz} over={<><SubB s={'王希季在麻袋堆成的指挥所里\n指挥发射。'} /><StampB y="1960.2.19" place="上海" note="中国航天报" /><SealHollow /></>}>
		<Beach hz={hz} id="k9b" glowX={1500} />
		<ReedHut x={150} g={744} w={150} h={104} reed={SX.reed} reedD={SX.reedD} />
		<ReedHut x={300} g={740} w={100} h={72} reed={SX.reed} reedD={SX.reedD} />
		{/* the launch light: the sky warms round the flame */}
		<Pool id="k9f" x={kx} y={560} rx={560} ry={460} a={0.42} col={FLAME.gold} />
		<Billow x={rx + 10} y={rb + 10} w={420} h={110} lit={1} col="#B8B0A6" seed={3} />
		<path d={`M${rx - 30},${rb - 40} Q${kx - 10},${600} ${nz[0]},${nz[1] + 200}`} stroke="#D8D0C4" strokeWidth={34} opacity={0.35} fill="none" filter={blur52(14)} />
		<Rail x={rx} base={rb} h={350} col="#3A342A" hi="#FFE4B0" />
		<Flame x={nz[0]} y={nz[1]} L={250} w={24} rot={90} k={1.1} seed={2} />
		<Sounding x={kx} base={kb} h={kh} id="k9" lit={1} warm="#FFE8C0" />
		<Billow x={rx - 120} y={rb + 18} w={220} h={70} lit={0.8} col="#A8A096" seed={7} />
		{/* the phone wire from the post to the rail */}
		<path d={`M${box[0] + 60},${box[1] + 20} Q${900},${sbTop + 30} ${rx - 40},${rb - 4}`} stroke="#2A2218" strokeWidth={2} fill="none" opacity={0.7} />
		{/* the two figures stand behind the wall; then the sacks in front of them */}
		<Fig era="sh1960" x={wgx} g={g} h={wgh} pose={gp} look={LOOK52.wang} lx={1} />
		{/* the field-telephone handset from his ear to his mouth (the hand holds it), its coiled cord to the box on the sacks */}
		<path d={`M${ear[0]},${ear[1]} L${mouth[0]},${mouth[1]}`} stroke="#2E2C24" strokeWidth={0.022 * wgh} strokeLinecap="round" />
		<circle cx={ear[0]} cy={ear[1]} r={0.022 * wgh} fill="#2E2C24" /><circle cx={mouth[0]} cy={mouth[1]} r={0.02 * wgh} fill="#2E2C24" />
		<path d={`M${ear[0] + 0.014 * wgh},${ear[1] - 0.016 * wgh} L${mouth[0] + 0.016 * wgh},${mouth[1] - 0.012 * wgh}`} stroke="#FFE4B0" strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
		<path d={`M${mouth[0]},${mouth[1] + 0.02 * wgh} ${Array.from({length: 8}, (_, i) => `q${i % 2 ? 6 : -6},3 ${(box[0] + 30 - mouth[0]) / 8},${(box[1] - mouth[1] - 0.02 * wgh) / 8}`).join(' ')}`} stroke="#14100A" strokeWidth={1.8} fill="none" />
		<Fig era="sh1960" x={wkx} g={g} h={wkh} pose={wkp} look={LOOKS52.worker.look} lx={1} />
		<Sandbags x0={380} x1={980} base={g + 24} rows={4} bh={50} col="#8E7A54" hi="#FFE4B0" lx={1} />
		<rect x={box[0]} y={box[1]} width={60} height={32} rx={3} fill="#3A3A2A" stroke="#FFE4B0" strokeOpacity={0.45} strokeWidth={1.4} /><rect x={box[0] + 8} y={box[1] - 6} width={14} height={6} fill="#2A2A20" />
	</Frame52>; };

/* ===================== KF10 · 56.5 s · N6 — 1970: the ball satellite over the Earth's limb, 最高 2384公里 ===================== */
const KF10: React.FC = () => { const P = PAL52.space, X = EXTRA52.space, EC: P2 = [960, 2900], ER = 2150;
	const limbY = (x: number) => EC[1] - Math.sqrt(ER * ER - (x - EC[0]) ** 2);
	const sx = 720, sy = 530, sr = 98, ruX = 1086, sunX = 300, sunY = limbY(300) - 6;
	const stars = Array.from({length: 120}, (_, i) => [rnd(i, 61) * W, rnd(i, 62) * 760, 0.6 + 1.6 * rnd(i, 63) ** 3]);
	return <Frame52 id="k10" era="space" hz={900} vig={0.5} over={<><SubB s={'56年前，长征一号把东方红一号\n送上天，最高[2384公里]。'} /><StampB y="1970.4.24" note="长征一号方案：王希季" /><SealHollow /></>}>
		<g fill="#E8ECF8">{stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} opacity={0.35 + 0.5 * rnd(i, 64)} />)}</g>
		{/* the orbit (dashed gold), mostly hidden behind the Earth */}
		<ellipse cx={EC[0]} cy={EC[1]} rx={2700} ry={EC[1] - 528} fill="none" stroke={B.goldL} strokeWidth={2.5} strokeDasharray="14 12" opacity={0.55} />
		{/* the Earth: a dark disc, faint cloud bands, the blue limb; the sun rising on its edge (left) */}
		<defs><radialGradient id="k10e" gradientUnits="userSpaceOnUse" cx={EC[0]} cy={EC[1]} r={ER}><stop offset="0.86" stopColor="#030812" /><stop offset="0.97" stopColor={X.earth} /><stop offset="1" stopColor="#2A5E98" /></radialGradient>
			<clipPath id="k10ec"><circle cx={EC[0]} cy={EC[1]} r={ER} /></clipPath></defs>
		<circle cx={EC[0]} cy={EC[1]} r={ER + 26} fill="none" stroke={X.limb} strokeWidth={40} opacity={0.22} filter={blur52(14)} />
		<circle cx={EC[0]} cy={EC[1]} r={ER} fill="url(#k10e)" />
		<g clipPath="url(#k10ec)" opacity={0.5}>{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={200 + i * 200 + rnd(i, 71) * 80} cy={limbY(200 + i * 200) + 40 + rnd(i, 72) * 60} rx={120 + 90 * rnd(i, 73)} ry={10 + 8 * rnd(i, 74)} fill="#7AA8D8" opacity={0.25 + 0.2 * rnd(i, 75)} filter={blur52(8)} />)}</g>
		<circle cx={EC[0]} cy={EC[1]} r={ER} fill="none" stroke={X.limbHi} strokeWidth={3} opacity={0.85} />
		<circle cx={EC[0]} cy={EC[1]} r={ER + 6} fill="none" stroke={X.limb} strokeWidth={8} opacity={0.45} filter={blur52(4)} />
		{/* sunrise on the limb: the warm arc and the star of light */}
		<path d={`M${sunX - 420},${limbY(sunX - 420)} Q${sunX},${limbY(sunX) - 70} ${sunX + 420},${limbY(sunX + 420)}`} stroke={FLAME.gold} strokeWidth={6} fill="none" opacity={0.55} filter={blur52(8)} />
		<ellipse cx={sunX} cy={sunY} rx={260} ry={150} fill="url(#flG52)" opacity={0.7} />
		<path d={`M${sunX - 340},${sunY} H${sunX + 340}`} stroke="#FFF6E0" strokeWidth={3} opacity={0.55} filter={blur52(2)} />
		<Glint52 x={sunX} y={sunY} r={70} />
		<circle cx={sunX} cy={sunY} r={16} fill="#FFFFFF" />
		{/* the satellite, lit gold from the sunrise */}
		<BallSat x={sx} y={sy} r={sr} lx={-0.62} ly={0.62} />
		<Glint52 x={sx - sr * 0.42} y={sy + sr * 0.3} r={34} o={0.9} />
		{/* the height: a hairline from the limb up to the satellite's height; 约8公里 is a dot on the limb */}
		<path d={`M${sx + sr + 30},${sy} H${ruX}`} stroke={B.goldL} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />
		<path d={`M${ruX},${limbY(ruX) - 2} V${sy}`} stroke={B.goldL} strokeWidth={3} opacity={0.85} />
		<path d={`M${ruX - 14},${sy} H${ruX + 14}`} stroke={B.goldL} strokeWidth={3} />
		<circle cx={ruX} cy={limbY(ruX) - 3} r={4.5} fill="#FFFFFF" />
		<Label x={ruX + 22} y={limbY(ruX) - 18} s="约8公里" fs={40} col={B.cream} />
		<Scrim id="k10" x={1400} y={sy - 6} rx={430} ry={150} a={0.55} />
		<text x={ruX + 30} y={sy + 44} fontFamily={SANS} fontWeight={900} fill={B.goldL}><tspan fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>最高 </tspan><tspan fontSize={140}>2384</tspan><tspan fontSize={66} dx={8}>公里</tspan></text>
	</Frame52>; };

/* ===================== KF11 · 73.0 s · O5 — 「而且，它回来了」: the capsule lands in the walker's open mitten ===================== */
const KF11: React.FC = () => { const P = PAL52.dusk, X = EXTRA52.dusk, hz = 770, g = 1040;
	const wx = 600, wh = 650;
	const palm: P2 = [826, 610];
	let wp = grounded({lean: 3, neck: 12, lt: 4, lk: 4, rt: -6, rk: 5, la: 6, le: 14, ra: 30, re: 40});
	wp = ikArm(wp, 'R', toBody(palm[0] - 40, palm[1] + 8, wx, g, wh));
	const wr = J(wp, 'RHand', wx, g, wh), el = J(wp, 'RElb', wx, g, wh), ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
	const ad = ang * 180 / Math.PI, hm = (px: number, py: number) => `${(wr[0] + (px * Math.cos(ang) - py * Math.sin(ang)) * wh).toFixed(1)},${(wr[1] + (px * Math.sin(ang) + py * Math.cos(ang)) * wh).toFixed(1)}`;
	const cs = 50, capC = hm(0.062, -0.026).split(',').map(Number), cap: P2 = [capC[0], capC[1] - cs * 0.38];
	void ad;
	const sky = [P.sky[0], P.sky[1], P.sky[2], '#7A4A6A', X.band];
	return <Frame52 id="k11" era="dusk" hz={hz} sky={sky} vig={0.5} over={<><SubB s={'而且，它[回来了]：\n带回人类首份月背样品1935.3克。'} /><StampB y="2024" place="月球背面" note="新华社：首份月背样品" /><SealHollow /></>}>
		{/* stars, the half moon it came from, the re-entry streak coming down to the hand */}
		<g fill={X.star}>{Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i, 81) * W} cy={rnd(i, 82) * 460} r={0.7 + 1.3 * rnd(i, 83) ** 2} opacity={0.3 + 0.4 * rnd(i, 84)} />)}</g>
		<g transform="translate(1520,330)"><circle r={44} fill="#3A3A5E" /><path d="M0,-44 A44,44 0 0,1 0,44 A22,44 0 0,0 0,-44 Z" fill="#F2ECDC" /><circle r={70} fill="#F2ECDC" opacity={0.08} filter={blur52(14)} /></g>
		<path d={`M1440,360 Q${1160},${300} ${cap[0] + 60},${cap[1] - cs * 3.4}`} stroke={FLAME.gold} strokeWidth={14} fill="none" opacity={0.28} strokeLinecap="round" filter={blur52(8)} />
		<path d={`M1440,360 Q${1160},${300} ${cap[0] + 60},${cap[1] - cs * 3.4}`} stroke="#FFF6E0" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" strokeDasharray="1 0" />
		{/* the grassland: far hills, the ember band, rolling ground, grass tufts lit from behind */}
		<Pool id="k11h" x={1200} y={hz} rx={1300} ry={140} a={0.5} col={X.band} />
		<path d={`M-40,${hz + 10} Q300,${hz - 34} 640,${hz - 6} T1300,${hz - 20} T${W + 40},${hz} V${H + 40} H-40 Z`} fill={P.far} />
		<path d={`M-40,${hz + 60} Q500,${hz + 24} 1000,${hz + 52} T${W + 40},${hz + 40} V${H + 40} H-40 Z`} fill="#141432" />
		<defs><linearGradient id="k11g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16173A" /><stop offset="1" stopColor={P.near} /></linearGradient></defs>
		<path d={`M-40,${hz + 120} Q700,${hz + 90} 1300,${hz + 130} T${W + 40},${hz + 118} V${H + 40} H-40 Z`} fill="url(#k11g)" />
		<path d={Array.from({length: 70}, (_, i) => { const x = rnd(i, 91) * W, y = hz + 140 + rnd(i, 92) * 150, s = 8 + 14 * rnd(i, 93); return `M${x},${y} q${-s * 0.3},${-s} ${-s * 0.5},${-s * 1.6} M${x + 3},${y} q${s * 0.2},${-s} ${s * 0.5},${-s * 1.4}`; }).join(' ')} stroke="#2A2C5A" strokeWidth={2} fill="none" />
		{/* the capsule's warm light on the walker and the ground */}
		<Pool id="k11c" x={cap[0]} y={cap[1] + 40} rx={360} ry={300} a={0.36} col={FLAME.gold} />
		<ellipse cx={cap[0]} cy={cap[1] + cs * 0.2} rx={cs * 1.6} ry={cs * 1.3} fill="url(#spk52)" opacity={0.75} />
		<Fig era="dusk" x={wx} g={g} h={wh} pose={wp} look={LOOKS52.today.look} lx={1} />
		{/* the open mitten, palm up: the thumb rises by the wrist, the fingers curl up at the tip; the capsule sits in the dip */}
		<path d={`M${hm(-0.005, -0.02)} Q${hm(0.012, -0.03)} ${hm(0.02, -0.042)} Q${hm(0.03, -0.052)} ${hm(0.038, -0.04)} Q${hm(0.044, -0.03)} ${hm(0.058, -0.026)} Q${hm(0.078, -0.022)} ${hm(0.09, -0.034)} Q${hm(0.104, -0.036)} ${hm(0.1, -0.018)} Q${hm(0.094, 0.006)} ${hm(0.07, 0.012)} Q${hm(0.035, 0.022)} ${hm(-0.005, 0.018)} Z`} fill={B.lac} />
		<path d={`M${hm(0.002, -0.022)} Q${hm(0.014, -0.032)} ${hm(0.021, -0.044)} Q${hm(0.03, -0.054)} ${hm(0.039, -0.042)} M${hm(0.078, -0.024)} Q${hm(0.09, -0.037)} ${hm(0.1, -0.034)}`} fill="none" stroke={FLAME.hot} strokeWidth={3} opacity={0.95} strokeLinecap="round" />
		<Capsule x={cap[0]} y={cap[1]} s={cs} heat={0} chute={1} />
		<path d={`M${cap[0] - cs * 0.6},${cap[1] + cs * 0.36} Q${cap[0]},${cap[1] + cs * 0.62} ${cap[0] + cs * 0.6},${cap[1] + cs * 0.36} Z`} fill={FLAME.hot} />
		<path d={`M${cap[0] - cs * 0.5},${cap[1] + cs * 0.4} Q${cap[0]},${cap[1] + cs * 0.56} ${cap[0] + cs * 0.5},${cap[1] + cs * 0.4}`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
		<path d={`M${cap[0] + cs * 0.25},${cap[1] - cs * 0.5} L${cap[0] + cs * 0.58},${cap[1] + cs * 0.36}`} stroke={FLAME.gold} strokeWidth={2.5} opacity={0.9} />
		{/* the tag */}
		<Scrim id="k11" x={1380} y={640} rx={380} ry={140} a={0.42} />
		<path d={`M${cap[0] + 46},${cap[1] + 14} L1110,600 H1150`} stroke={B.goldL} strokeWidth={2} fill="none" opacity={0.8} />
		<text x={1160} y={640} fontFamily={SANS} fontWeight={900} fontSize={104} fill={B.goldL}>1935.3<tspan fontFamily={KAI} fontWeight={700} fontSize={60} dx={10}>克</tspan></text>
		<Label x={1164} y={712} s="人类首份月背样品" fs={48} col={B.cream} />
	</Frame52>; };

/* ===================== KF12 · 85.0 s · L1 — 太原 at night: the medium rocket with four boosters lifts off; 第672次 ===================== */
const KF12: React.FC = () => { const P = PAL52.taiyuan, X = EXTRA52.taiyuan, pad = 846, g = 1010;
	const rx = 1150, ry = 616, rh = 520, rw = 46;
	return <Frame52 id="k12" era="taiyuan" hz={760} vig={0.5} over={<><SubB s={'10月23日那枚长征六号改，\n是长征火箭第[672]次飞行。'} /><StampB y="2026.10.23" place="太原" note="首型固体捆绑中型火箭" /><SealHollow /></>}>
		<g fill="#DDE4F4">{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 101) * W} cy={rnd(i, 102) * 420} r={0.6 + 1.2 * rnd(i, 103) ** 2} opacity={0.25 + 0.35 * rnd(i, 104)} />)}</g>
		{/* the mountains behind the site */}
		<path d={`M-40,700 L180,610 L330,660 L520,560 L700,640 L860,590 L1010,650 L1400,560 L1600,630 L1760,580 L${W + 40},640 V${H} H-40 Z`} fill={P.far} />
		<path d={`M-40,760 L260,700 L520,740 L820,690 L1180,750 L1500,700 L${W + 40},740 V${H} H-40 Z`} fill="#10141F" />
		{/* the launch light fills the sky round the rocket */}
		<Pool id="k12a" x={rx} y={pad - 60} rx={900} ry={520} a={0.4} col={FLAME.amber} />
		<Pool id="k12b" x={rx} y={pad - 40} rx={420} ry={260} a={0.55} col={FLAME.gold} />
		{/* the pad */}
		<rect x={-40} y={pad} width={W + 80} height={H - pad + 40} fill={P.field[1]} />
		<path d={`M-40,${pad} H${W + 40}`} stroke={FLAME.gold} strokeWidth={2} opacity={0.4} />
		{/* floodlight towers, their beams on the rocket */}
		<Flood x={890} g={pad} h={400} tx={rx} ty={ry - 300} id="f1" col={X.tower} beam={X.floodBeam} a={0.14} />
		<Flood x={1720} g={pad} h={470} tx={rx} ty={ry - 340} id="f2" col={X.tower} beam={X.floodBeam} a={0.14} />
		<Flood x={110} g={pad} h={300} tx={rx} ty={ry - 200} id="f3" col={X.tower} beam={X.floodBeam} a={0.1} />
		{/* the service tower to the right */}
		<g stroke={X.steel} fill="none">
			<path d={`M1300,${pad} V150 M1372,${pad} V150`} strokeWidth={8} />
			<path d={Array.from({length: 17}, (_, i) => `M1300,${pad - i * 41} L1372,${pad - (i + 0.5) * 41} L1300,${pad - (i + 1) * 41}`).join(' ')} strokeWidth={3} />
			{[300, 450, 600].map((y) => <path key={y} d={`M1300,${y} H1236`} strokeWidth={6} />)}
		</g>
		<path d="M1372,150 V846" stroke={FLAME.gold} strokeWidth={2} opacity={0.5} />
		{/* the rocket lifting off, its flames to the pad; the ground cloud */}
		<RocketBody x={rx} y={ry} h={rh} w={rw} boosters={4} nose="fairing" flame={1.3} flameL={4.4} id="k12r" seed={4} />
		<Billow x={rx} y={pad + 44} w={900} h={136} lit={1} col="#7A7884" seed={5} />
		<Billow x={rx - 380} y={pad + 50} w={420} h={110} lit={0.6} col="#5E5C68" seed={9} />
		<Billow x={rx + 420} y={pad + 46} w={380} h={100} lit={0.6} col="#5E5C68" seed={11} />
		<ellipse cx={rx} cy={pad - 40} rx={170} ry={80} fill="#FFFFFF" opacity={0.6} filter={blur52(24)} />
		<ellipse cx={rx} cy={ry + 60} rx={70} ry={110} fill="#FFF8E8" opacity={0.55} filter={blur52(14)} />
		{/* the foreground ridge, the walker small on it, watching */}
		<path d={`M-40,${g - 30} Q300,${g - 70} 700,${g - 20} T1200,${g + 10} V${H + 40} H-40 Z`} fill={P.near} />
		<path d={`M-40,${g - 30} Q300,${g - 70} 700,${g - 20}`} stroke={FLAME.gold} strokeWidth={2} opacity={0.35} fill="none" />
		<Fig era="taiyuan" x={240} g={g - 50} h={250} pose={grounded({lean: -4, neck: -26, lt: 4, lk: 4, rt: -5, rk: 5, la: 6, le: 14, ra: -4, re: 10})} look={LOOKS52.today.look} lx={1} />
		{/* 第672次 on a feathered scrim */}
		<Scrim id="k12" x={560} y={512} rx={430} ry={170} a={0.6} />
		<text x={560} y={572} textAnchor="middle" fontFamily={SANS} fontWeight={900} fill={B.goldL}><tspan fontFamily={KAI} fontWeight={700} fontSize={70} fill={B.cream}>第</tspan><tspan fontSize={168} dx={10}>672</tspan><tspan fontFamily={KAI} fontWeight={700} fontSize={70} fill={B.cream} dx={10}>次</tspan></text>
	</Frame52>; };

/* ===================== KF13 · 96.0 s · R2 — why it glows: the ground is in the Earth's shadow, the high plume is still in the sun ===================== */
const KF13: React.FC = () => { const P = PAL52.dusk, X = EXTRA52.dusk;
	const C: P2 = [1300, 1900], R = 1100, S: P2 = [250, 985];
	const surf = (x: number) => C[1] - Math.sqrt(R * R - (x - C[0]) ** 2);
	// the grazing ray: tangent from the sun to the Earth's upper side, continued (the edge of the Earth's shadow)
	const d = Math.hypot(C[0] - S[0], C[1] - S[1]), a0 = Math.atan2(C[1] - S[1], C[0] - S[0]), a = a0 - Math.asin(R / d), tl = Math.sqrt(d * d - R * R);
	const u: P2 = [Math.cos(a), Math.sin(a)], T: P2 = [S[0] + u[0] * tl, S[1] + u[1] * tl];
	const lineY = (x: number) => T[1] + (x - T[0]) * u[1] / u[0];
	const ax = 1500, ay = 372, bw = 150, bh = 196, lx0 = 1630, ly0 = surf(1630);
	const town = [1440, 1478, 1510, 1556, 1590, 1640, 1676];
	const wkx = 1408, wky = surf(1408);
	const shadow = `M${T[0]},${T[1]} L${W + 40},${lineY(W + 40)} V${H + 40} H${T[0]} Z`;
	const ray = (tx: number, ty: number, o = 0.9) => { const L = Math.hypot(tx - S[0], ty - S[1]), ux = (tx - S[0]) / L, uy = (ty - S[1]) / L, s0: P2 = [S[0] + ux * 70, S[1] + uy * 70], e: P2 = [tx - ux * 10, ty - uy * 10], nx = -uy, ny = ux;
		return <g opacity={o}><path d={`M${s0[0]},${s0[1]} L${e[0]},${e[1]}`} stroke={FLAME.gold} strokeWidth={4} strokeLinecap="round" />
			<path d={`M${e[0] + ux * 4},${e[1] + uy * 4} L${e[0] - ux * 20 + nx * 9},${e[1] - uy * 20 + ny * 9} L${e[0] - ux * 20 - nx * 9},${e[1] - uy * 20 - ny * 9} Z`} fill={FLAME.gold} /></g>; };
	return <Frame52 id="k13" era="dusk" hz={1000} sky={['#0C0D2C', '#25245A', '#463A78']} vig={0.4} over={<><SubB s={'因为地面已经天黑，\n高空还有[阳光]。'} /><StampB y="10月23日 傍晚" note="据央视网 · 专家" /><SealHollow /></>}>
		<g fill={X.star}>{Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i, 111) * W} cy={rnd(i, 112) * 600} r={0.7 + 1.1 * rnd(i, 113) ** 2} opacity={0.25 + 0.3 * rnd(i, 114)} />)}</g>
		{/* sunlight above the shadow line: a broad soft warm wash from the sun */}
		<defs><linearGradient id="k13w" gradientUnits="userSpaceOnUse" x1={S[0]} y1={S[1]} x2={ax} y2={ay + 200}><stop offset="0" stopColor={FLAME.gold} stopOpacity="0.38" /><stop offset="0.6" stopColor={FLAME.gold} stopOpacity="0.12" /><stop offset="1" stopColor={FLAME.gold} stopOpacity="0.05" /></linearGradient></defs>
		<path d={`M${S[0]},${S[1] - 40} L${W + 40},${lineY(W + 40) - 600} L${W + 40},${lineY(W + 40)} L${T[0]},${T[1]} L${S[0]},${S[1] + 30} Z`} fill="url(#k13w)" filter={blur52(24)} />
		{/* the plume (A's 火箭云), sun from the left */}
		<RocketCloud ax={ax} ay={ay} x0={lx0} y0={ly0} bw={bw} bh={bh} k={1.15} sun={-1} id="k13c" amp={30} />
		{/* the Earth's shadow over the night side: the ground, the town and the low trail are all in it */}
		<path d={shadow} fill="#03031A" opacity={0.86} />
		<path d={`M${S[0] + u[0] * 60},${S[1] + u[1] * 60} L${W + 40},${lineY(W + 40)}`} stroke={B.cream} strokeWidth={2.2} strokeDasharray="10 10" opacity={0.55} />
		{/* the Earth */}
		<defs><radialGradient id="k13e" gradientUnits="userSpaceOnUse" cx={C[0]} cy={C[1]} r={R}><stop offset="0.9" stopColor="#07081C" /><stop offset="1" stopColor="#14163A" /></radialGradient></defs>
		<circle cx={C[0]} cy={C[1]} r={R} fill="url(#k13e)" />
		<path d={`M${C[0] - Math.sqrt(R * R - (C[1] - H - 10) ** 2)},${H + 10} A${R},${R} 0 0,1 ${T[0]},${T[1]}`} stroke={FLAME.gold} strokeWidth={5} fill="none" opacity={0.85} />
		<path d={`M${C[0] - Math.sqrt(R * R - (C[1] - H - 10) ** 2)},${H + 10} A${R},${R} 0 0,1 ${T[0]},${T[1]}`} stroke={FLAME.gold} strokeWidth={18} fill="none" opacity={0.3} filter={blur52(8)} />
		<path d={`M${T[0]},${T[1]} A${R},${R} 0 0,1 ${W + 40},${surf(W + 40)}`} stroke={X.violet} strokeWidth={2.5} fill="none" opacity={0.7} />
		{/* the town on the night side: dark blocks, lit windows; the walker small among them, looking up */}
		{town.map((x, i) => { const y = surf(x), bwid = 22 + 14 * rnd(i, 121), bht = 26 + 40 * rnd(i, 122); return <g key={i}>
			<rect x={x - bwid / 2} y={y - bht} width={bwid} height={bht + 12} fill={X.town} stroke={X.violet} strokeOpacity={0.5} strokeWidth={1.2} />
			{Array.from({length: 3}, (_, k) => rnd(i * 3 + k, 123) > 0.45 && <rect key={k} x={x - bwid / 2 + 5 + (k % 2) * (bwid - 16)} y={y - bht + 7 + k * 10} width={6} height={5} fill={X.townLit} />)}</g>; })}
		<Fig era="dusk" x={wkx} g={wky + 2} h={62} pose={grounded({lean: -6, neck: -34, lt: 4, lk: 4, rt: -5, rk: 5, la: 6, le: 14, ra: -4, re: 10})} look={LOOKS52.today.look} lx={-1} />
		<path d={`M${wkx + 6},${wky - 58} L${ax - 60},${ay + bh + 30}`} stroke={B.cream} strokeWidth={2} strokeDasharray="4 8" opacity={0.6} />
		{/* the sun below the town's horizon; its rays pass over the shadow and light only the high plume */}
		<circle cx={S[0]} cy={S[1]} r={150} fill="url(#flG52)" opacity={0.9} />
		<circle cx={S[0]} cy={S[1]} r={46} fill="#FFF4D8" />
		<circle cx={S[0]} cy={S[1]} r={34} fill="#FFFFFF" />
		{ray(ax - bw * 0.72, ay + bh * 0.9)}
		{ray(ax - bw * 0.6, ay + bh * 0.4)}
		{ray(ax - 26, ay + 6, 0.75)}
		<Label x={S[0]} y={S[1] - 76} s="太阳" fs={46} col={B.goldL} anchor="middle" />
		<Scrim id="k13" x={1170} y={480} rx={300} ry={90} a={0.5} />
		<Label x={1310} y={498} s="高空还有阳光" fs={56} col={B.goldL} anchor="end" />
		<Label x={1450} y={1004} s="地面已经天黑" fs={46} col={B.cream} anchor="middle" />
	</Frame52>; };

/* ===================== KF14 · 113.0 s · END — the Juno end card over the dimmed 火箭云 ===================== */
const SOURCES52 = ['资料：新华社（2026-10-23；2024-06-28） · 新华网（2026-04-24；2022-03-30） · 央视新闻 / 央视网（2026-10-24）',
	'澎湃新闻（2026-10-24） · 国家航天局 · 国家国防科技工业局 · 中国航天科技集团（2026-08-13） · 中国航天报 · 中国科学报（2025）',
	'光明日报（关晓武2015） · 中国航海博物馆引《武经总要》《武备志》 · 国家航天局引《宋史》'];
const END_Q = '你见过火箭云吗？在哪儿？';
const DuskCloud: React.FC = () => { const P = PAL52.dusk, X = EXTRA52.dusk, hz = 860;
	return <Frame52 id="k14" era="dusk" hz={hz} sky={[P.sky[0], P.sky[1], P.sky[2], '#6A4A78', X.band]} vig={0.5}>
		<g fill={X.star}>{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 131) * W} cy={rnd(i, 132) * 700} r={0.7 + 1.2 * rnd(i, 133) ** 2} opacity={0.3 + 0.4 * rnd(i, 134)} />)}</g>
		<Pool id="k14h" x={760} y={hz} rx={1400} ry={160} a={0.55} col={X.band} />
		<RocketCloud ax={1190} ay={210} x0={1340} y0={hz - 10} bw={430} bh={420} k={1.2} sun={-1} id="k14c" />
		<path d={`M-40,${hz - 20} L200,${hz - 90} L420,${hz - 40} L640,${hz - 120} L900,${hz - 50} L1160,${hz - 100} L1460,${hz - 30} L1700,${hz - 80} L${W + 40},${hz - 40} V${H + 40} H-40 Z`} fill={X.ridge} />
		{Array.from({length: 26}, (_, i) => { const x = 40 + i * 72 + rnd(i, 141) * 30, bht = 40 + 90 * rnd(i, 142), y = hz + 40; return <g key={i}><rect x={x} y={y - bht} width={56} height={bht + 200} fill={X.town} />
			{Array.from({length: 4}, (_, k) => rnd(i * 4 + k, 143) > 0.55 && <rect key={k} x={x + 8 + (k % 2) * 28} y={y - bht + 12 + Math.floor(k / 2) * 22} width={10} height={8} fill={X.townLit} opacity={0.8} />)}</g>; })}
		<rect x={-40} y={hz + 30} width={W + 80} height={H} fill={P.near} />
	</Frame52>; };
const KF14: React.FC = () => { const fs = 76, tw = fs * END_Q.length * 1.03;
	return <>
		<DuskCloud />
		<div style={{position: 'absolute', inset: 0, background: 'rgba(8,4,3,0.72)'}} />
		<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: 'rotate(-6deg)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo}}>从一支<span style={{marginRight: '-0.05em'}}>箭</span><br />到火箭<span style={{marginRight: '-0.05em'}}>云</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{END_Q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>？</span></div>
		<div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold}}>关注 Juno · 一起看懂世界</div>
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 21, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.72}}>{SOURCES52.map((s, i) => <div key={i}>{s}</div>)}</div>
	</>; };

/* ===================== registration ===================== */
const KFS: React.FC[] = [KF08, KF09, KF10, KF11, KF12, KF13, KF14];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF52B-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map((C, i) => <Composition key={i} id={`KF52B-${String(i + 8).padStart(2, '0')}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void lerp; void CLOUD; void Glint52;
