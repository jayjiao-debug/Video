import React from 'react';
import {W, H, seg, cl, rnd} from '../qq50/kit50';
import {useStampFonts, KAI} from '../qq44/skin44';
import {RimF} from './cao54b';
import {useBrush, BRUSH, BRUSH2} from './ttl54a';
/* ep54 · title option C · 书法竖排 (calligraphy + seal, 国风 minimal), film 12.606 (bar 6, the SLAM) → 16.59 (bar 8).
   A hard cut on the slam from the 洛阳 gate to a dark silk-paper ground (one warm key pool, fibre texture, a faint ink wash).
   A GIANT vertical 曹操 in black 行书 (志莽行书, OFL, public/fonts/brush/) is WRITTEN ON stroke by stroke by brush-path reveal masks,
   with an ink splash thrown on the first stroke; the ink carries 曹操's cool 石青 rim (#8FD0DC). A big red 「曹孟德印」 is pressed
   beside it. The question stands in two vertical columns flanking the name, read right → left: 「到底是英雄，」 (英雄 gold) on the right,
   「还是奸雄？」 (奸雄 red) on the left — the duality is the composition. Lots of empty silk.
   Motion (fr = frames since the slam):
     fr 0     the cut; a warm flash on the silk; the frame lands from 7 % in (fr 0–10); the brush strikes — the first strokes of 曹 are
              already down on the first frame — and the splash flies (fr 0–12); a small shake.
     fr 0–8   曹 writes (14 brush paths, 0.46 frame apart, each 1.9 frames long).
     fr 5–13  操 writes (11 paths).
     fr 15    (beat 2) the seal presses down, the camera kicks.
     fr 15.5–21.5 the right column brushes down (英雄 lands gold at fr 18); fr 19–25 the left column (奸雄 lands red at fr 21).
     hold     a slow push-in (3.5 %), the ink wash drifts in from two corners, ink motes and a few gold embers float up.
     16.14–16.52 out: the silk darkens to black, the frame lifts 2 %; the cut to card 5 lands on bar 8. */
const TITLE_A = 0.654 + 1.99203 * 6, TITLE_B = 0.654 + 1.99203 * 8;
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const v = cl(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const f1 = (v: number) => v.toFixed(1);

/* ---------- layout ---------- */
const NX = 960, FS = 452, KK = FS / 1000;            // the name column, the glyph size (志莽行书: advance 900, ink centre ≈ 400 units)
const C1 = 298, C2 = 762;                            // 曹, 操 ink centres (y)
const base = (cy: number) => cy + 0.4 * FS;
const RX = 1336, LX = 584, Y0 = 296, QS = 62, QB = 122, STS = 76, STB = 130;   // the question columns
const SEX = 736, SEY = 906, SES = 146;               // the seal

/* ---------- brush paths for the write-on (font units, y up), in writing order; [width, points] ---------- */
type BP = [number, number[]];
const P_CAO: BP[] = [
	[100, [140, 595, 210, 555, 300, 600, 400, 680, 480, 745, 560, 772, 650, 796, 745, 772]],   // 一 (rising, into the top)
	[90, [405, 812, 428, 762, 452, 722]],                                                   // 丨 left (top)
	[86, [540, 822, 590, 792, 620, 740, 622, 690]],                                         // 丨 right (top)
	[150, [430, 705, 395, 630, 352, 560, 322, 470, 312, 390, 330, 320, 375, 285]],            // the 曲 box, left side
	[120, [455, 640, 448, 520, 440, 400]],
	[120, [500, 650, 620, 655, 718, 652, 752, 600, 742, 480, 712, 380, 672, 350]],            // 横折
	[110, [522, 745, 520, 600, 522, 450, 530, 360]],                                         // the inner verticals
	[86, [592, 625, 600, 470]],
	[100, [372, 330, 470, 340, 580, 368, 700, 360]],                                         // the bottom 横
	[110, [490, 285, 462, 190, 450, 95, 480, 25, 545, -22]],                                 // 日 left
	[100, [530, 255, 620, 296, 700, 272, 716, 150, 716, 40]],                                // 日 横折
	[80, [530, 150, 600, 180, 652, 200]],
	[80, [515, 92, 600, 100, 690, 62]],
	[90, [470, 30, 550, -16, 640, 10, 712, 42]],
];
const P_ZAO: BP[] = [
	[100, [72, 515, 140, 480, 210, 520, 290, 620, 345, 692]],                                // 扌 横
	[110, [236, 772, 250, 650, 242, 500, 232, 350, 222, 250, 240, 120, 262, 22]],              // 扌 竖钩
	[110, [190, 330, 145, 220, 150, 140, 220, 60, 262, 0]],
	[90, [452, 782, 440, 700, 462, 650]],                                                    // 口 (top)
	[90, [478, 712, 580, 735, 652, 722, 642, 640]],
	[116, [675, 625, 600, 540, 500, 440, 400, 350, 300, 285]],                                // the long diagonal (the lower 口口)
	[96, [320, 405, 420, 462, 520, 505, 592, 565]],
	[96, [540, 420, 650, 470, 760, 512, 805, 500]],                                           // 木 横
	[104, [522, 335, 535, 200, 540, 60, 545, 10]],                                            // 木 竖
	[100, [505, 240, 420, 200, 360, 170, 350, 100, 372, 58]],                                 // 撇
	[110, [662, 282, 740, 232, 762, 152, 722, 98]],                                           // 点
];
const pathOf = (p: number[]) => { let s = `M${p[0]},${p[1]}`; for (let i = 2; i < p.length; i += 2) s += ` L${p[i]},${p[i + 1]}`; return s; };
/* when each path starts (frames since the slam) and how long it draws */
const STEP = 0.46, DUR = 1.9;
const T_CAO = P_CAO.map((_, i) => i * STEP - (i < 4 ? 1.2 - i * 0.2 : 0.4)), T_ZAO = P_ZAO.map((_, i) => 5.2 + i * 0.6);
const CAO_DONE = T_CAO[T_CAO.length - 1] + DUR, ZAO_DONE = T_ZAO[T_ZAO.length - 1] + DUR;

/* ---------- the splash: thrown sideways off the name on the first stroke; nothing on the columns or the seal ---------- */
type Drop = {x0: number; y0: number; x: number; y: number; r: number; a: number; s: number; f0: number};
const onCols = (x: number, y: number, r: number) => (Math.abs(x - RX) < QB * 0.62 + r || Math.abs(x - LX) < QB * 0.62 + r) && y > Y0 - 40 && y < Y0 + 640 || Math.abs(x - SEX) < SES * 0.7 && Math.abs(y - SEY) < SES * 0.7;
const DROPS: Drop[] = Array.from({length: 84}, (_, i) => {
	const a = rnd(i, 1), right = i % 2 === 0, y0 = 130 + rnd(i, 2) * 800, x0 = NX + (right ? 1 : -1) * (40 + rnd(i, 3) * 110);
	const th = (right ? 0 : Math.PI) + (a - 0.5) * 1.6 * (right ? 1 : -1) - (right ? 0.3 : -0.3), d = 16 + Math.pow(rnd(i, 4), 1.9) * 420;
	const r = 1.3 + Math.pow(rnd(i, 5), 3.2) * 14, s = rnd(i, 6) < 0.3 ? 1.6 + rnd(i, 7) * 1.6 : 1;
	const x = x0 + Math.cos(th) * d, y = y0 + Math.sin(th) * d * 0.7, fs = y0 < 530 ? 0.6 + (y0 - 130) / 400 * 5 : 6 + (y0 - 530) / 400 * 6;
	return {x0, y0, x, y, r, a: th * 180 / Math.PI, s, f0: fs + d / 200}; })
	.filter((d) => d.x > 160 && d.x < 1760 && d.y > 80 && d.y < 1000 && !onCols(d.x, d.y, d.r * d.s) && Math.abs(d.x - NX) > 120);
const SPLATS: [number, number, number, number][] = [[NX - 252, 196, 17, 0], [NX + 214, 548, 10, 6], [NX - 228, 668, 8, 8], [NX + 262, 132, 8, 0.5], [NX - 392, 300, 6, 1.5], [NX + 380, 250, 5, 1]];
/* 宣纸 fibres: sparse thin curved hairs, a little lighter than the ground */
const FIBRES = Array.from({length: 260}, (_, i) => { const x = rnd(i, 81) * 2000 - 40, y = rnd(i, 82) * 1160 - 40, a = rnd(i, 83) * Math.PI * 2, L = 14 + Math.pow(rnd(i, 84), 2) * 90, b = (rnd(i, 85) - 0.5) * L * 0.8;
	const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L, mx = (x + x2) / 2 - Math.sin(a) * b, my = (y + y2) / 2 + Math.cos(a) * b;
	return {d: `M${f1(x)},${f1(y)} Q${f1(mx)},${f1(my)} ${f1(x2)},${f1(y2)}`, w: 0.6 + rnd(i, 86) * 1.1, o: 0.035 + rnd(i, 87) * 0.07}; });
/* hold: ink motes and a few gold embers drifting up */
const MOTES = Array.from({length: 34}, (_, i) => ({x: 200 + rnd(i, 71) * 1520, y: 120 + rnd(i, 72) * 860, sp: 8 + rnd(i, 73) * 22, r: 1 + rnd(i, 74) * 2.6, gold: i % 4 === 0, ph: rnd(i, 75) * 6.28}));

/* ---------- the question columns ---------- */
type QC = {c: string; big: boolean; col: string; y: number; x: number; f0: number; punct?: boolean};
const column = (cs: [string, boolean, string][], x: number, y0: number, f0: number, dfr: number): QC[] => { let y = y0, f = f0;
	return cs.map(([c, big, col]) => { const st = big ? STB : STS, punct = c === '，' || c === '？'; const o = {c, big, col, x, y: y + st / 2, f0: f, punct}; y += punct && c === '，' ? st * 0.6 : st; f += dfr; return o; }); };
const QR = column([['到', false, 'c'], ['底', false, 'c'], ['是', false, 'c'], ['英', true, 'g'], ['雄', true, 'g'], ['，', false, 'c']], RX, Y0, 15.5, 0.9);
const QL = column([['还', false, 'c'], ['是', false, 'c'], ['奸', true, 'r'], ['雄', true, 'r'], ['？', false, 'c']], LX, Y0 + STS, 19, 0.9);

const Glyph: React.FC<{ch: string; cy: number; fill: string; dx?: number; dy?: number; filter?: string; mask?: string; opacity?: number}> = ({ch, cy, fill, dx = 0, dy = 0, filter, mask, opacity}) =>
	<text x={f1(NX + dx)} y={f1(base(cy) + dy)} textAnchor="middle" fontFamily={BRUSH2} fontSize={FS} fill={fill} filter={filter} mask={mask} opacity={opacity}>{ch}</text>;

const Seal: React.FC<{k: number; o: number}> = ({k, o}) => <g transform={`translate(${SEX},${SEY}) rotate(-3) scale(${k.toFixed(4)})`} opacity={o}>
	<g filter="url(#cseal)">
		<rect x={-SES / 2} y={-SES / 2} width={SES} height={SES} rx={6} fill="#B5261B" />
		<rect x={-SES / 2 + 6} y={-SES / 2 + 6} width={SES - 12} height={SES - 12} rx={2} fill="none" stroke="#F4E4CA" strokeWidth={3} />
		{/* 白文, read right column first: 曹孟 | 德印 */}
		{([['曹', 1, -1], ['孟', 1, 1], ['德', -1, -1], ['印', -1, 1]] as [string, number, number][]).map(([c, cx, cyy]) =>
			<text key={c} transform={`translate(${f1(cx * SES * 0.215)},${f1(cyy * SES * 0.205 + SES * 0.15)}) scale(0.98,0.92)`} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={900} fontSize={SES * 0.4} fill="#F4E4CA">{c}</text>)}
	</g>
</g>;

/** the whole title frame at film time t (its own ground) */
export const TitleOpt: React.FC<{t: number}> = ({t}) => {
	useBrush(); useStampFonts('到底是，还是？');
	const fr = (t - TITLE_A) * 30 + 0.25;
	const out = eio(seg(t, TITLE_B - 0.45, TITLE_B - 0.07)), hold = eio(seg(t, TITLE_A, TITLE_B));
	const shk = (a: number, f0: number, n: number) => fr < f0 || fr > f0 + n ? 0 : a * Math.pow(1 - (fr - f0) / n, 1.5);
	const shx = shk(5, 0, 7) * Math.sin(fr * 2.7) + shk(3, 15, 5) * Math.sin(fr * 3.3), shy = shk(4, 0, 7) * Math.cos(fr * 3.1) + shk(4, 15, 6) * Math.cos(fr * 2.3);
	const kick = 0.014 * (fr < 15 ? 0 : Math.exp(-(fr - 15) / 2.4) * Math.min(1, fr - 15));
	const cam = 1 + 0.035 * hold + kick + 0.02 * out + 0.07 * (1 - eo(fr / 10));            /* the slam: the frame lands from 7 % in */
	const flash = Math.max(0, 1 - fr / 8) * 0.3;
	const sealK = fr < 15 ? 0 : fr < 17.4 ? 1.7 - 0.74 * eo((fr - 15) / 2.4) ** 2 : 0.96 + 0.04 * eo((fr - 17.4) / 3);
	const drawU = (f0: number) => cl((fr - f0) / DUR);
	const caoAll = cl((fr - CAO_DONE + 1) / 2), zaoAll = cl((fr - ZAO_DONE + 1) / 2);
	const zoom = (k: number, fx = 960, fy = 540) => `translate(${fx},${fy}) scale(${k.toFixed(5)}) translate(${-fx},${-fy})`;
	const gT = (cy: number) => `translate(${f1(NX - 450 * KK)},${f1(base(cy))}) scale(${KK},${-KK})`;
	const RevealMask: React.FC<{id: string; paths: BP[]; ts: number[]; cy: number; all: number}> = ({id, paths, ts, cy, all}) =>
		<mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
			<g transform={gT(cy)}>{paths.map(([w, p], i) => { const u = drawU(ts[i]); return u <= 0 ? null :
				<path key={i} d={pathOf(p)} fill="none" stroke="#fff" strokeWidth={w * 1.15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 2" strokeDashoffset={f1(1 - eo(u))} />; })}</g>
			{all > 0 && <rect width={W} height={H} fill="#fff" opacity={all} />}
		</mask>;
	const colWipe = (f0: number, n: number) => eo((fr - f0) / n);
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<radialGradient id="cpaper" cx={NX} cy={520} r="1150" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${NX} 520) scale(1 0.78) translate(${-NX} -520)`}>
					<stop offset="0" stopColor="#5E5040" /><stop offset="0.3" stopColor="#433829" /><stop offset="0.66" stopColor="#221C17" /><stop offset="1" stopColor="#0C0B0A" /></radialGradient>
				<radialGradient id="ckey" cx={NX + 20} cy={500} r="560" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${NX + 20} 500) scale(0.78 1) translate(${-NX - 20} -500)`}>
					<stop offset="0" stopColor="#F2D6A6" stopOpacity="0.38" /><stop offset="0.5" stopColor="#D9AE74" stopOpacity="0.14" /><stop offset="1" stopColor="#D9AE74" stopOpacity="0" /></radialGradient>
				<radialGradient id="cfl" cx={NX} cy={300} r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F7E4BE" stopOpacity="1" /><stop offset="1" stopColor="#F7E4BE" stopOpacity="0" /></radialGradient>
				{/* silk / rice-paper: long horizontal fibres + fine grain + mottling */}
				<filter id="cgrain" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} result="n" />
					<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  -2.4 0 0 0 1.5" /></filter>
				<filter id="cmottle" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
					<feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={4} seed={11} result="n" />
					<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.04  0 0 0 0 0.03  0 0 0 0 0.03  -3.2 0 0 0 1.75" /></filter>
				{/* the faint ink wash: a soft cloud with torn edges */}
				<filter id="cwash" x="-20%" y="-20%" width="140%" height="140%">
					<feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={4} seed={19} result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale={90} xChannelSelector="R" yChannelSelector="G" result="d" />
					<feGaussianBlur in="d" stdDeviation="10" /></filter>
				<radialGradient id="cwashG"><stop offset="0" stopColor="#090706" stopOpacity="0.62" /><stop offset="0.55" stopColor="#090706" stopOpacity="0.32" /><stop offset="1" stopColor="#090706" stopOpacity="0" /></radialGradient>
				<filter id="cink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={29} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" /></filter>
				<filter id="csplat" x="-50%" y="-50%" width="200%" height="200%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={33} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" /></filter>
				<filter id="cbleed" x="-20%" y="-20%" width="140%" height="140%"><feMorphology operator="dilate" radius="3" /><feGaussianBlur stdDeviation="9" /></filter>
				<RimF id="crim" lx={-0.55} ly={-1} k={2.2} c="#8FD0DC" o={0.5} blur={0.9} />
				<RimF id="crimD" lx={-0.55} ly={-1} k={1.4} c="#8FD0DC" o={0.4} blur={0.5} />
				<filter id="cseal" x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={17} result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale={2.8} xChannelSelector="R" yChannelSelector="G" result="d" />
					<feTurbulence type="fractalNoise" baseFrequency="0.19" numOctaves={2} seed={23} result="sp" />
					<feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -30 22.0" result="holes" />
					<feComposite in="d" in2="holes" operator="in" /></filter>
				<filter id="cqh" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="7" /><feComponentTransfer><feFuncA type="linear" slope="0.75" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="cglowG" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" /><feComponentTransfer in="b" result="bb"><feFuncA type="linear" slope="0.5" /></feComponentTransfer><feMerge><feMergeNode in="bb" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="cmote" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.6" /></filter>
				<linearGradient id="cgold" x1="0" y1="0.1" x2="0" y2="1"><stop offset="0" stopColor="#FFE9B4" /><stop offset="0.45" stopColor="#E8BC62" /><stop offset="1" stopColor="#B07B34" /></linearGradient>
				<linearGradient id="cred" x1="0" y1="0.1" x2="0" y2="1"><stop offset="0" stopColor="#F2644C" /><stop offset="0.5" stopColor="#DA3C2B" /><stop offset="1" stopColor="#A6231A" /></linearGradient>
				<RevealMask id="cmCao" paths={P_CAO} ts={T_CAO} cy={C1} all={caoAll} />
				<RevealMask id="cmZao" paths={P_ZAO} ts={T_ZAO} cy={C2} all={zaoAll} />
				{[['cwR', RX, 15.5], ['cwL', LX, 19]].map(([id, x, f0]) => { const yy = Y0 - 60 + 720 * colWipe(f0 as number, 6);
					return <React.Fragment key={id as string}>
						<linearGradient id={`${id}g`} x1="0" x2="0" y1={yy - 90} y2={yy} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
						<mask id={id as string} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect x={(x as number) - 120} y={0} width={240} height={H} fill={`url(#${id}g)`} /></mask>
					</React.Fragment>; })}
			</defs>
			<g transform={`translate(${f1(shx)},${f1(shy)}) ${zoom(cam)}`}>
				{/* the silk */}
				<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#cpaper)" />
				<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="#000" filter="url(#cmottle)" opacity={0.55} />
				<g fill="none" stroke="#E8D7B8" strokeLinecap="round">{FIBRES.map((fb, i) => <path key={i} d={fb.d} strokeWidth={fb.w} opacity={fb.o} />)}</g>
				<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="#000" filter="url(#cgrain)" opacity={0.22} />
				{/* the faint ink wash (淡墨) drifting in from two corners, away from the name so the ink keeps its contrast */}
				<g filter="url(#cwash)" opacity={0.85 + 0.15 * Math.sin(t * 1.3)}>
					<ellipse cx={330 + 40 * hold} cy={880 - 10 * hold} rx={620} ry={300} fill="url(#cwashG)" transform={`rotate(-14 ${330 + 40 * hold} ${880 - 10 * hold})`} />
					<ellipse cx={1660 - 40 * hold} cy={170 + 12 * hold} rx={560} ry={250} fill="url(#cwashG)" transform={`rotate(-14 ${1660 - 40 * hold} ${170 + 12 * hold})`} />
					<ellipse cx={1500 - 30 * hold} cy={930} rx={340} ry={130} fill="url(#cwashG)" opacity={0.6} />
				</g>
				<rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#ckey)" />
				{flash > 0.004 && <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#cfl)" opacity={flash} />}
				{/* the splash */}
				<g filter="url(#crimD)"><g fill="#0B0908" filter="url(#cink)">
					{DROPS.map((d, i) => { if (fr < d.f0) return null; const u = eo((fr - d.f0) / 4);
						const x = d.x0 + (d.x - d.x0) * u, y = d.y0 + (d.y - d.y0) * u, r = d.r * (0.4 + 0.6 * u), st = d.s + (1 - u) * 2;
						return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(r * st)} ry={f1(r / Math.sqrt(st))} transform={`rotate(${f1(d.a)} ${f1(x)} ${f1(y)})`} />; })}
					{SPLATS.map(([x, y, r, f0], i) => <g key={i} opacity={cl((fr - f0) / 1.5)} filter="url(#csplat)"><ellipse cx={x} cy={y} rx={r * 1.15} ry={r * 0.9} transform={`rotate(${i * 40} ${x} ${y})`} />{Array.from({length: 3}, (_, j) => <circle key={j} cx={x + Math.cos(j * 2.1 + i) * r * (1.5 + rnd(i * 7 + j, 31))} cy={y + Math.sin(j * 2.1 + i) * r * (1.4 + rnd(i * 7 + j, 32))} r={r * (0.12 + 0.18 * rnd(i * 7 + j, 33))} />)}</g>)}
				</g></g>
				{/* 曹操, written on: the bleed into the silk, the ink with its 石青 rim, a little tonal streak */}
				{([['曹', C1, 'url(#cmCao)'], ['操', C2, 'url(#cmZao)']] as [string, number, string][]).map(([ch, cy, m]) => <g key={ch} mask={m}>
					<Glyph ch={ch} cy={cy} fill="#000" dx={4} dy={6} filter="url(#cbleed)" opacity={0.5} />
					<g filter="url(#crim)"><g filter="url(#cink)">
						<Glyph ch={ch} cy={cy} fill="#070605" />
					</g></g>
				</g>)}
				{/* the seal */}
				{sealK > 0 && <Seal k={sealK} o={cl((fr - 15) / 1.2)} />}
				{/* the question columns */}
				{([[QR, 'url(#cwR)'], [QL, 'url(#cwL)']] as [QC[], string][]).map(([col, m], ci) => <g key={ci} mask={m} filter="url(#cqh)">
					{col.map((q, i) => { const size = q.big ? QB : QS, p = eo((fr - q.f0) / 3.2), k = q.big ? 1.25 - 0.25 * p : 1;
						const dx = q.c === '，' ? size * 0.32 : 0, dy = q.c === '，' ? -size * 0.42 : 0;
						const fill = q.col === 'g' ? 'url(#cgold)' : q.col === 'r' ? 'url(#cred)' : '#EBDDC2';
						return <g key={i} transform={`translate(${f1(q.x + dx)},${f1(q.y + dy)}) scale(${k.toFixed(4)})`} filter={q.big ? 'url(#cglowG)' : undefined}>
							<text x={0} y={f1(size * 0.36)} textAnchor="middle" fontFamily={q.big ? BRUSH : KAI} fontWeight={q.big ? 400 : 700} fontSize={size} fill={fill}
								stroke="#120C08" strokeWidth={q.big ? 6 : 5} strokeOpacity={0.8} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{q.c}</text>
						</g>; })}
				</g>)}
				{/* hold: motes */}
				<g filter="url(#cmote)">{MOTES.map((mo, i) => { const a = cl((fr - 20) / 12); if (a <= 0) return null;
					const y = mo.y - (t - TITLE_A) * mo.sp, x = mo.x + 10 * Math.sin(t * 0.8 + mo.ph);
					return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(mo.r)} fill={mo.gold ? '#FFD890' : '#0A0807'} opacity={a * (mo.gold ? 0.5 + 0.3 * Math.sin(t * 4 + i) : 0.45)} />; })}</g>
			</g>
			{/* out: the silk goes dark */}
			{out > 0 && <rect width={W} height={H} fill="#000" opacity={out} />}
		</svg>
	</div>; };
