import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {W, H, cl, seg, rnd, KAI} from '../qq50/kit50';
import {useStampFonts} from '../qq44/skin44';
import {RimF, f1} from './cao54b';
import {HDefs, TorsoA, CollarA} from './d1hero54a';
import {HeadT, HeadDefs} from './d1head54a';
/* ep54 · title option B 「光暗双面」 (film 12.606 → 16.590, bar 6 → bar 8). The question made visual: the film's own 曹操 (the approved
   D1 head, d1head54a, with the D1 bust from d1hero54a, all imported read-only) as a big portrait split down the nose by light.
   Screen-left (his near side) in warm gold light = 英雄; screen-right (his far side) in cold 石青 shadow with a deep-red rim = 奸雄.
   The name 曹操 sits across the seam at the bottom (曹 gold, 操 cold steel), the question split by the seam: 到底是英雄 | 还是奸雄？
   Motion (T0 = the slam, BEAT = 0.498 s):
   - T0: hard cut to black; the gold light SNAPS on the left half (overshoot flash), 曹操 and 「到底是 英雄」 slam in (scale 1.2 → 1),
     a camera kick (scale 1.04 → 1, short shake); the right half stays a dark silhouette.
   - T0 + 1 beat (13.104): the cold light snaps on the right half, its red rim flares; 「还是 奸雄？」 slams in red; a smaller kick.
   - hold: a slow push-in (+3.5%), gold embers rise on the left, cold ash falls on the right, the plume flutters, the gold breathes;
     a light sweep runs across the gold 英雄 / 曹 on bar 7 (14.598).
   - exit: both lights die 16.18 → 16.50 (black by 16.52). */
export const T0 = 0.654 + 1.99203 * 6, TB = 0.654 + 1.99203 * 8, BEAT = 1.99203 / 4, T1 = T0 + BEAT, BAR7 = T0 + 1.99203;
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const SEAM = 960;                                   // the split, screen x
/* the portrait's placement: drawing-space nose root (between the brows) → screen (SEAM, NY), scale S, roll R (the D1 head is tilted
   −33°; we stand him up to about −13°) */
const NR = [1381, 253], NY = 392, S = 3.3, R = 20;

/* ---------- the brush font (OFL, public/fonts/brush) ---------- */
let brushP: Promise<void> | null = null;
export const BRUSH = "'TtlMSZ','LXGW WenKai','Noto Serif CJK SC',serif", BRUSH2 = "'TtlZMX','TtlMSZ','Noto Serif CJK SC',serif";
export const useBrush = () => {
	const [h] = useState(() => (typeof document === 'undefined' ? null : delayRender('brush fonts')));
	useEffect(() => { if (h === null) return;
		brushP ??= Promise.all([['TtlMSZ', 'MaShanZheng-Regular.woff'], ['TtlZMX', 'ZhiMangXing-Regular.woff']].map(([n, f]) =>
			new FontFace(n, `url(${staticFile('fonts/brush/' + f)}) format('woff')`).load().then((ff) => { document.fonts.add(ff); }, () => undefined))).then(() => undefined);
		brushP.then(() => continueRender(h), () => continueRender(h)); }, [h]); };

/* ---------- colour grades (feColorMatrix rows), scaled by the light's level k ---------- */
const GOLD = [[0.6765, 0.357, 0.0666], [0.1353, 0.6936, 0.0496], [0.0743, 0.146, 0.3422]];
const COLD = [[0.2195, 0.1859, 0.0347], [0.135, 0.3905, 0.0495], [0.1755, 0.3451, 0.2144]];
const mat = (m: number[][], k: number, add: number[] = [0, 0, 0]) => m.map((r, i) => `${r.map((v) => (v * k).toFixed(4)).join(' ')} 0 ${add[i].toFixed(4)}`).join('  ') + '  0 0 0 1 0';

/* ---------- particles: embers rise on the gold side, ash falls on the cold side (own clock) ---------- */
const NP = 48;
const Motes: React.FC<{t: number; side: -1 | 1; k: number}> = ({t, side, k}) => <g>{Array.from({length: NP}, (_, i) => {
	const sp = 38 + rnd(i, 3 + side) * 60, ph = rnd(i, 5 + side), x0 = side < 0 ? 130 + rnd(i, 7) * 760 : SEAM + 30 + rnd(i, 8) * 790;
	const u = ((t * sp) / 1300 + ph) % 1, y = side < 0 ? 1140 - u * 1260 : -60 + u * 1220, sw = Math.sin(t * (0.9 + rnd(i, 9)) + i) * 26;
	const r = side < 0 ? 1.8 + rnd(i, 11) * 3.4 : 1.4 + rnd(i, 12) * 2.6, fl = side < 0 ? 0.55 + 0.45 * Math.sin(t * (6 + rnd(i, 13) * 5) + i) : 1;
	const fade = Math.sin(Math.PI * u), x = Math.max(side < 0 ? 0 : SEAM + 2, Math.min(side < 0 ? SEAM - 2 : W, x0 + sw));
	return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(r)} fill={side < 0 ? (i % 3 ? '#FFC870' : '#FFE9B0') : (i % 4 ? '#9FB8C8' : '#D8E6EE')} opacity={(k * fade * fl * (side < 0 ? 0.85 : 0.5)).toFixed(3)} />; })}</g>;

/** the name and the labels: one glyph run, drawn with a dark outline, a fill and a rim (via filter) */
const Glyph: React.FC<{s: string; x: number; y: number; fs: number; fill: string; ff?: string; ls?: number; anchor?: 'middle' | 'start' | 'end'; sw?: number; filter?: string; op?: number}> = ({s, x, y, fs, fill, ff = BRUSH, ls = 0, anchor = 'middle', sw = 0, filter, op = 1}) =>
	<text x={f1(x)} y={f1(y)} textAnchor={anchor} fontFamily={ff} fontSize={f1(fs)} letterSpacing={ls} fill={fill} stroke={sw ? '#070302' : undefined} strokeWidth={sw || undefined} strokeLinejoin="round" style={{paintOrder: 'stroke'}} filter={filter} opacity={op}>{s}</text>;

export const TitleOpt: React.FC<{t: number}> = ({t}) => {
	useBrush(); useStampFonts('到底是英雄，还是奸雄？');
	const fr = (t - T0) * 30, fr1 = (t - T1) * 30;
	/* the two lights: 0 = off (a dark silhouette), 1 = on; each snaps on with an overshoot flash and dies on the exit */
	const out = eo(seg(t, TB - BEAT, TB - 0.09)), on = 1 - out;   /* the exit: from the last beat (16.092) to 16.50 */
	const snap = (f: number) => (f < 0 ? 0 : Math.min(1, f / 1.2) * (1 + 0.75 * Math.exp(-f / 2.6)));
	const breathe = 1 + 0.05 * Math.sin(t * 7.1) * Math.sin(t * 2.3 + 1) + 0.025 * Math.sin(t * 13.7) + 0.02 * Math.sin(t * 3.1);
	const kg = Math.max(0.07, snap(fr) * breathe) * on + 0.0, kc = Math.max(0.07, snap(fr1)) * on;
	/* the camera: a kick on each light (scale and a short shake), then a slow push */
	const kick = (f: number, a: number) => (f < 0 ? 0 : a * Math.exp(-f / 3.2));
	const push = 1 + 0.035 * eo(seg(t, T0, TB - 0.1)) * 0.6 + 0.035 * seg(t, T0, TB) * 0.4;
	const fr7 = (t - BAR7) * 30, zs = push * (1 + kick(fr, 0.045) + kick(fr1, 0.018) + kick(fr7, 0.012));
	const shk = (f: number, a: number, n: number) => (f < 0 || f > n ? 0 : a * (1 - f / n));
	const shx = shk(fr, 7, 7) * Math.sin(fr * 2.7) + shk(fr1, 3, 5) * Math.sin(fr1 * 3.1), shy = shk(fr, 5, 7) * Math.cos(fr * 3.3) + shk(fr1, 2, 5) * Math.cos(fr1 * 2.9);
	const cam = `translate(${f1(SEAM + shx)},${f1(540 + shy)}) scale(${zs.toFixed(5)}) translate(${-SEAM},-540)`;
	const por = `translate(${SEAM},${NY}) scale(${S}) rotate(${R}) translate(${-NR[0]},${-NR[1]})`;
	/* text slams: scale 1.22 → 1 over 5 frames, a flash on the fill */
	const slam = (f: number) => ({k: f < 0 ? 0 : 1 + 0.22 * Math.pow(1 - cl(f / 5), 2), o: f < 0 ? 0 : cl(f / 1.5)});
	const sG = slam(fr), sC = slam(fr1);
	/* the light sweep across the gold on bar 7 */
	const sw = seg(t, BAR7 - 0.05, BAR7 + 0.55), swX = -300 + 1500 * eo(sw);
	const sealGlow = 0;
	void sealGlow;
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
		<defs>
			<HDefs /><HeadDefs />
			<clipPath id="tbL"><rect x={-200} y={-200} width={SEAM + 200} height={H + 400} /></clipPath>
			<clipPath id="tbR"><rect x={SEAM} y={-200} width={W - SEAM + 200} height={H + 400} /></clipPath>
			<filter id="tbGold" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={mat(GOLD, 1.06 * kg, [0.012 * kg, 0.004 * kg, 0])} /></filter>
			<filter id="tbCold" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={mat(COLD, 1.08 * kc, [0, 0.004 * kc, 0.016 * kc])} /></filter>
			<RimF id="tbRimG" lx={-1} ly={-0.35} k={6} c="#FFD98A" o={cl(0.95 * kg)} blur={1.4} />
			<RimF id="tbRimC" lx={1} ly={-0.15} k={10} c="#E8361F" o={cl(1 * kc)} lx2={0.2} ly2={-1} k2={3} c2="#9FC4D6" o2={cl(0.45 * kc)} blur={1.5} />
			<radialGradient id="tbBgG" cx={520} cy={400} r={820} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A5A1E" /><stop offset="0.45" stopColor="#3A2108" /><stop offset="1" stopColor="#0C0703" /></radialGradient>
			<radialGradient id="tbBgC" cx={1420} cy={420} r={820} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1C3242" /><stop offset="0.5" stopColor="#0B1620" /><stop offset="1" stopColor="#040709" /></radialGradient>
			<radialGradient id="tbRed" cx={1960} cy={520} r={640} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8A1610" stopOpacity="0.85" /><stop offset="0.5" stopColor="#4A0A08" stopOpacity="0.35" /><stop offset="1" stopColor="#2A0604" stopOpacity="0" /></radialGradient>
			<linearGradient id="tbFoot" x1="0" y1="560" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.55" stopColor="#000" stopOpacity="0.62" /><stop offset="1" stopColor="#000" stopOpacity="0.94" /></linearGradient>
			<linearGradient id="tbSeam" x1="0" y1="0" x2="0" y2="1080" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF2D0" stopOpacity="0" /><stop offset="0.3" stopColor="#FFF2D0" stopOpacity="0.9" /><stop offset="0.7" stopColor="#FFF2D0" stopOpacity="0.9" /><stop offset="1" stopColor="#FFF2D0" stopOpacity="0" /></linearGradient>
			<linearGradient id="tbGoldT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF3CC" /><stop offset="0.3" stopColor="#F2CD7E" /><stop offset="0.62" stopColor="#CC9442" /><stop offset="1" stopColor="#8A5A22" /></linearGradient>
			<linearGradient id="tbSteelT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCE8F0" /><stop offset="0.35" stopColor="#9DB2C2" /><stop offset="0.7" stopColor="#5E7286" /><stop offset="1" stopColor="#34404E" /></linearGradient>
			<linearGradient id="tbRedT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF6A4E" /><stop offset="0.4" stopColor="#D8301E" /><stop offset="1" stopColor="#8A140C" /></linearGradient>
			<linearGradient id="tbSwp" x1={swX - 160} x2={swX + 160} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF8E4" stopOpacity="0" /><stop offset="0.5" stopColor="#FFF8E4" stopOpacity="0.85" /><stop offset="1" stopColor="#FFF8E4" stopOpacity="0" /></linearGradient>
			<RimF id="tbTxG" lx={0} ly={-1} k={2.6} c="#FFF6DA" o={0.85} lx2={-1} ly2={0} k2={2} c2="#FFE3A0" o2={0.5} blur={0.8} />
			<RimF id="tbTxC" lx={1} ly={0} k={3.4} c="#FF4A30" o={0.95} lx2={0} ly2={-1} k2={2} c2="#E6F2F8" o2={0.6} blur={0.8} />
			<filter id="tbTsh" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="9" /><feOffset dy="6" /><feComponentTransfer><feFuncA type="linear" slope="0.95" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
			<filter id="tbGlow" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="14" /></filter>
			<filter id="tbMist" filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}><feGaussianBlur stdDeviation="40" /></filter>
			<g id="tbP">
				{/* the near shoulder (his right, screen left): a plain lamellar mass from the collar down out of frame, its laced top edge */}
				<path d="M1430,394 C1362,378 1282,388 1222,424 C1170,456 1142,512 1134,592 L1124,900 L1640,900 L1640,520 Z" fill="url(#d1Lm)" />
				<path d="M1430,394 C1362,378 1282,388 1222,424 C1170,456 1142,512 1134,592 L1124,900 L1640,900 L1640,520 Z" fill="#000" opacity={0.3} />
				<path d="M1432,398 C1362,382 1282,392 1222,428 C1172,460 1146,514 1138,592" fill="none" stroke="#4A1A14" strokeWidth={7} />
				<path d="M1430,392 C1362,376 1282,386 1222,422 C1172,454 1144,510 1136,590" fill="none" stroke="#B0503A" strokeWidth={2.2} opacity={0.6} />
				<TorsoA t={t} />
				<CollarA />
				<HeadT t={t} />
			</g>
		</defs>
		<rect width={W} height={H} fill="#000" />
		<g transform={cam}>
			{/* the two grounds: the gold side and the cold side, each lit by its own light */}
			<g clipPath="url(#tbL)"><rect x={-100} y={-100} width={SEAM + 100} height={H + 200} fill="url(#tbBgG)" opacity={cl(kg * 0.95)} /></g>
			<g clipPath="url(#tbR)"><rect x={SEAM} y={-100} width={W - SEAM + 100} height={H + 200} fill="url(#tbBgC)" opacity={cl(kc)} />
				<rect x={SEAM} y={-100} width={W - SEAM + 100} height={H + 200} fill="url(#tbRed)" opacity={cl(kc)} /></g>
			{/* the cold side's mist drifting across, the gold side's warm haze rising (own clock) */}
			<g clipPath="url(#tbR)" filter="url(#tbMist)" opacity={cl(kc) * 0.55}>{[0, 1, 2].map((i) => { const u = ((t - 11) * (0.05 + 0.02 * i) + i * 0.37) % 1;
				return <ellipse key={i} cx={f1(SEAM - 300 + u * 1500)} cy={f1(300 + i * 230 + 30 * Math.sin(t * 0.6 + i))} rx={340} ry={70 + 20 * i} fill="#5E86A0" opacity={0.5 * Math.sin(Math.PI * u)} />; })}</g>
			<g clipPath="url(#tbL)" filter="url(#tbMist)" opacity={cl(kg) * 0.5}>{[0, 1, 2].map((i) => { const u = ((t - 11) * (0.06 + 0.02 * i) + i * 0.41) % 1;
				return <ellipse key={i} cx={f1(200 + i * 260 + 40 * Math.sin(t * 0.7 + i))} cy={f1(1200 - u * 1400)} rx={220} ry={90} fill="#E09A40" opacity={0.45 * Math.sin(Math.PI * u)} />; })}</g>
			<g clipPath="url(#tbL)"><Motes t={t} side={-1} k={cl(kg)} /></g>
			<g clipPath="url(#tbR)"><Motes t={t} side={1} k={cl(kc)} /></g>
			{/* the portrait, twice: graded gold (left of the seam) and cold (right) */}
			<g clipPath="url(#tbL)"><g filter="url(#tbRimG)"><g filter="url(#tbGold)"><g transform={por}><use href="#tbP" /></g></g></g></g>
			<g clipPath="url(#tbR)"><g filter="url(#tbRimC)"><g filter="url(#tbCold)"><g transform={por}><use href="#tbP" /></g></g></g></g>
			{/* the bust sinks into the dark at the bottom, under the name */}
			<rect width={W} height={H} fill="url(#tbFoot)" />
			{/* the seam: a thin blade of light, flaring on each snap */}
			<rect x={SEAM - 1.2} y={0} width={2.4} height={H} fill="url(#tbSeam)" opacity={cl(0.35 * on + 0.6 * Math.exp(-Math.max(0, fr) / 4) * (fr >= 0 ? 1 : 0) + 0.4 * Math.exp(-Math.max(0, fr1) / 4) * (fr1 >= 0 ? 1 : 0) + 0.45 * Math.exp(-Math.max(0, fr7) / 5) * (fr7 >= 0 ? 1 : 0))} />
			<rect x={SEAM - 22} y={0} width={44} height={H} fill="url(#tbSeam)" filter="url(#tbGlow)" opacity={cl(0.5 * Math.exp(-Math.max(0, fr) / 5) * (fr >= 0 ? 1 : 0) + 0.3 * Math.exp(-Math.max(0, fr1) / 5) * (fr1 >= 0 ? 1 : 0) + 0.35 * Math.exp(-Math.max(0, fr7) / 6) * (fr7 >= 0 ? 1 : 0)) * on} />
		</g>
		{/* the type (not on the camera kick's shake: it lands with its own slam) */}
		<g opacity={on}>
			{/* 曹操 across the seam at the bottom: 曹 gold, 操 cold steel (lit when the cold light comes on) */}
			<g transform={`translate(${SEAM},930) scale(${sG.k.toFixed(4)}) translate(${-SEAM},-930)`} opacity={sG.o}>
				<g filter="url(#tbTsh)">
					<Glyph s="曹" x={SEAM - 142} y={1000} fs={262} fill="#070302" sw={16} />
					<Glyph s="操" x={SEAM + 142} y={1000} fs={262} fill="#070302" sw={16} />
				</g>
				<g filter="url(#tbTxG)"><Glyph s="曹" x={SEAM - 142} y={1000} fs={262} fill="url(#tbGoldT)" /></g>
				<g filter="url(#tbTxC)" opacity={0.25 + 0.75 * cl(kc / 1.0)}><Glyph s="操" x={SEAM + 142} y={1000} fs={262} fill="url(#tbSteelT)" /></g>
				{sw > 0 && sw < 1 && <Glyph s="曹" x={SEAM - 142} y={1000} fs={262} fill="url(#tbSwp)" />}
			</g>
			{/* the question, split by the seam: 到底是 英雄 | 还是 奸雄？ */}
			<g transform={`translate(330,520) scale(${sG.k.toFixed(4)}) translate(-330,-520)`} opacity={sG.o}>
				<Glyph s="到底是" x={330} y={402} fs={58} ff={KAI} ls={10} fill="#F6E6C6" sw={8} filter="url(#tbTsh)" />
				<g filter="url(#tbTsh)"><Glyph s="英雄" x={330} y={612} fs={196} fill="#070302" sw={14} /></g>
				<g filter="url(#tbTxG)"><Glyph s="英雄" x={330} y={612} fs={196} fill="url(#tbGoldT)" /></g>
				{sw > 0 && sw < 1 && <Glyph s="英雄" x={330} y={612} fs={196} fill="url(#tbSwp)" />}
			</g>
			<g transform={`translate(1566,520) scale(${sC.k.toFixed(4)}) translate(-1566,-520)`} opacity={sC.o}>
				<Glyph s="还是" x={1566} y={402} fs={58} ff={KAI} ls={10} fill="#D6E2EA" sw={8} filter="url(#tbTsh)" />
				<g filter="url(#tbTsh)"><Glyph s="奸雄" x={1566} y={612} fs={196} fill="#070302" sw={14} /><Glyph s="？" x={1762} y={612} fs={92} anchor="start" ff={KAI} fill="#070302" sw={10} /></g>
				<g filter="url(#tbTxC)"><Glyph s="奸雄" x={1566} y={612} fs={196} fill="url(#tbRedT)" /></g>
				<Glyph s="？" x={1762} y={612} fs={92} anchor="start" ff={KAI} fill="#E0402C" />
			</g>
		</g>
	</svg>; };
