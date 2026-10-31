import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {W, H, seg, cl, rnd} from '../qq50/kit50';
import {useStampFonts, KAI} from '../qq44/skin44';
import {RimF} from './cao54b';
import {Open} from './demo54m';
/* ep54 · title option A · 改良版 (the improved current title), film 12.606 (bar 6, the SLAM) → 16.59 (bar 8).
   The current concept lifted: bronze-gold 曹操 in real brush calligraphy (马善政 楷书, OFL, public/fonts/brush/) over a swept ink 横
   (owner r2: only as long as the name, a sharp angled 起笔, a short 飞白 tail) painted on by a fast wipe on the slam, splatter thrown off its head and tail, gold embers rising off the ink, a light sweep across
   the gold, the 「孟德」 seal thumped in with a camera kick, and the question with 英雄 (gold) / 奸雄 (red) set big in the same brush.
   The 洛阳 gate (demo54m.Open) stays behind it, darkened, softly blurred and slowly pushing in, so the title is the hero.
   TitleOpt draws the WHOLE frame (the gate included) for film time t in [TITLE_A, TITLE_B).
   Motion (fr = frames since the slam):
     fr 0–4   the ink 横 wipes on left→right with a warm backlight hugging it (so the black ink reads as a silhouette), the gate
              drops to 50 % and blurs; a warm flash; splatter flies (fr 1–9); shake.
     fr 0–8   曹操 slams down from 1.4× with a motion blur and a 3.5 % overshoot.
     fr 6–12  the question wipes in; 英雄 punches at fr 7, 奸雄 at fr 11.
     fr 15    (beat 2) the 孟德 seal thumps down, the camera kicks 1.6 %.
     fr 27–50 a light sweep crosses the gold; a second, softer glint at 14.95–15.55.
     hold     embers rise off the stroke, the gate pushes in 5 %, the title breathes up 2.5 %.
     16.14–16.52 out: the title lifts 4 %, blurs and fades; the cut to card 5 lands on bar 8. */
export const TITLE_A = 0.654 + 1.99203 * 6, TITLE_B = 0.654 + 1.99203 * 8;
export const BRUSH = "'BrushMSZ','LXGW WenKai','Noto Serif CJK SC',serif", BRUSH2 = "'BrushZMX','BrushMSZ','Noto Serif CJK SC',serif";

/* ---------- the brush fonts (OFL, subset to the script's characters): public/fonts/brush/ ---------- */
let brushP: Promise<void> | null = null, brushOk = false;
const loadBrush = () => brushP ??= Promise.all(([['BrushMSZ', 'MaShanZheng-Regular.woff'], ['BrushZMX', 'ZhiMangXing-Regular.woff']] as const).map(([fam, file]) => {
	const ff = new FontFace(fam, `url(${staticFile(`fonts/brush/${file}`)}) format('woff')`);
	return ff.load().then((f) => { document.fonts.add(f); }); })).then(() => { brushOk = true; });
/** hold the frame until both brush fonts are in */
export const useBrush = () => {
	const [h] = useState(() => (typeof document === 'undefined' || brushOk ? null : delayRender('brush fonts')));
	useEffect(() => { if (h === null) return; loadBrush().then(() => continueRender(h), () => continueRender(h)); }, [h]);
};

const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const v = cl(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const f1 = (v: number) => v.toFixed(1);

/* ---------- layout ---------- */
const NY = 418, FS = 420;                            // the stroke's centre line at x 960, the name's size
const C1X = 738, C2X = 1186;                         // 曹, 操 centres
const SX = 1462, SY = 612, SW = 100, SH = 150;        // the seal (tall: 孟 over 德)
const QC = 758;                                      // the question's centre line

/* ---------- the ink 横 (owner r2: only as long as the name): a sharp, angled 起笔 at the left — the tip pressed in from the
   top-left, the lower-left corner rounded by the press — the body rising a little, a short crisp 飞白 tail (~140 px) past 操 ---------- */
const XA = 522, XB = 1404, SL = 96;                  // the entry's top point (≈ 85 px before 曹), the body's end (just past 操), the entry's slant
const cy = (x: number) => NY + 14 - (x - 960) * 0.034;
const body = (x: number) => 286 - 56 * cl((x - XA) / (XB - XA)) + 14 * Math.sin(cl((x - XA) / (XB - XA)) * Math.PI);
const SMEAR = (() => { const top: string[] = [], bot: string[] = [];
	for (let x = XA; x <= XB; x += 6) { const h = body(x) / 2, tip = 9 * Math.pow(cl(1 - (x - XA) / 34), 1.5);   /* the tip flicks up a little */
		top.push(`${f1(x)},${f1(cy(x) - h - tip + 5 * Math.sin(x * 0.011 + 1) + 2.4 * Math.sin(x * 0.043))}`); }
	for (let x = XA + SL; x <= XB; x += 6) { const h = body(x) / 2;
		bot.push(`${f1(x)},${f1(cy(x) + h + 4 * Math.sin(x * 0.009 + 2) + 2.6 * Math.sin(x * 0.037 + 0.5))}`); }
	const end = Array.from({length: 11}, (_, i) => { const v = (i + 0.5) / 11 - 0.5, x = XB + 6 + 30 * rnd(i, 41) * (1 - Math.abs(v) * 1.3); return `${f1(x)},${f1(cy(x) + v * body(XB))}`; });
	const b0 = XA + SL, yb = cy(b0) + body(b0) / 2 + 4 * Math.sin(b0 * 0.009 + 2), yt = cy(XA) - body(XA) / 2 - 9;
	/* the press: from the bottom of the entry, a full curve down-left and up to the sharp top point */
	const press = `Q${f1(XA + SL * 0.12)},${f1(yb + 6)} ${f1(XA + SL * 0.02)},${f1(cy(XA) + body(XA) * 0.12)} Q${f1(XA - 8)},${f1(cy(XA) - body(XA) * 0.3)} ${f1(XA)},${f1(yt)}`;
	return `M${top.join(' L')} L${end.join(' L')} L${bot.reverse().join(' L')} ${press} Z`; })();
const BRISTLES = Array.from({length: 30}, (_, i) => { const v = (i + rnd(i, 7) * 0.8) / 30 - 0.5, edge = Math.abs(v) * 2;
	const xs = XB - 240 + rnd(i, 8) * 160, xe = XB + 18 + (1 - edge * 0.7) * (60 + rnd(i, 9) * 80), w = 2.4 + rnd(i, 10) * 7 * (1 - edge * 0.5);
	const y0 = cy(xs) + v * body(xs) * 0.98, y1 = cy(xe) + v * body(XB) * (1.02 + 0.16 * rnd(i, 11)) + (rnd(i, 12) - 0.5) * 6;
	return `M${f1(xs)},${f1(y0 - w / 2)} Q${f1((xs + xe) / 2)},${f1((y0 + y1) / 2 - w / 2 + (rnd(i, 13) - 0.5) * 4)} ${f1(xe)},${f1(y1)} Q${f1((xs + xe) / 2)},${f1((y0 + y1) / 2 + w / 2)} ${f1(xs)},${f1(y0 + w / 2)} Z`; });
const GAPS = Array.from({length: 18}, (_, i) => { const v = (i + rnd(i, 21)) / 18 - 0.5, xs = XB - 300 + rnd(i, 22) * 200, xe = XB + 60, w = 1.2 + rnd(i, 23) * 3.4;
	return `M${f1(xs)},${f1(cy(xs) + v * body(xs) * 0.9)} L${f1(xe)},${f1(cy(xe) + v * body(XB) * 0.9 - w / 2)} L${f1(xe)},${f1(cy(xe) + v * body(XB) * 0.9 + w / 2)} Z`; });
const HAIRS = Array.from({length: 16}, (_, i) => { const v = (i + 0.5) / 16 - 0.5, xs = XA + SL * 0.6 + rnd(i, 51) * 160, xe = XB - 30 - rnd(i, 52) * 220;
	return {d: `M${f1(xs)},${f1(cy(xs) + v * body(xs) * 0.86)} C${f1(xs + 180)},${f1(cy(xs + 180) + v * body(xs + 180) * 0.86 + 3)} ${f1(xe - 180)},${f1(cy(xe - 180) + v * body(xe - 180) * 0.86 - 3)} ${f1(xe)},${f1(cy(xe) + v * body(xe) * 0.86)}`, w: 1.2 + rnd(i, 53) * 3.4, o: 0.22 + rnd(i, 54) * 0.36}; });
/* the splash: drops thrown off the head (impact), the tail (the flick) and the edges; none on the question */
type Drop = {x0: number; y0: number; x: number; y: number; r: number; a: number; s: number; f0: number};
const inBody = (x: number, y: number, r: number) => x > XA - r && x < XB + 30 + r && Math.abs(y - cy(Math.min(XB, Math.max(XA, x)))) < body(Math.min(XB, Math.max(XA, x))) / 2 + r + 4;
const inQ = (x: number, y: number) => x > 470 && x < 1450 && y > QC - 80 && y < QC + 80;
const DROPS: Drop[] = Array.from({length: 90}, (_, i) => {
	const side = i % 5, a = rnd(i, 1), b = rnd(i, 2);
	let x0 = 0, y0 = 0, th = 0, dm = 0, f0 = 0;
	if (side === 0) { th = Math.PI + (a - 0.5) * 2.0; x0 = XA + 30; y0 = cy(x0) + (b - 0.5) * body(XA) * 0.7; dm = 130; f0 = 0.5; }
	else if (side <= 2) { th = (a - 0.5) * 0.9 - 0.05; x0 = XB + 40 + b * 90; y0 = cy(x0) + (rnd(i, 3) - 0.5) * body(XB) * 0.9; dm = 160; f0 = 3; }
	else { const x = XA + 80 + b * (XB - XA), up = side === 3; th = (up ? -1 : 1) * (Math.PI / 2 + (a - 0.5) * 1.3) + 0.25; x0 = x; y0 = cy(x) + (up ? -0.5 : 0.5) * body(x); dm = up ? 110 : 60; f0 = 4 * (x - XA) / (XB - XA); }
	const d = 14 + Math.pow(rnd(i, 4), 1.3) * dm, r = 1.6 + Math.pow(rnd(i, 5), 2.8) * 10.5, s = rnd(i, 6) < 0.62 ? 1.8 + rnd(i, 7) * 2.6 : 1;
	const x = Math.max(150, Math.min(1780, x0 + Math.cos(th) * d)), y = Math.max(90, Math.min(990, y0 + Math.sin(th) * d * 0.8));
	return {x0, y0, x, y, r, a: th * 180 / Math.PI, s, f0: f0 + d / 120}; })
	.filter((d) => !inBody(d.x, d.y, d.r * d.s) && !inQ(d.x, d.y));
const SPLATS: [number, number, number][] = [[XA - 34, NY + 74, 9], [XA - 20, NY - 104, 6], [XB + 168, NY - 104, 10], [XB + 214, NY + 26, 7], [XB + 130, NY + 124, 6]];
/* embers: gold motes lifting off the ink during the hold (each on its own loop) */
const EMB = Array.from({length: 40}, (_, i) => ({x: XA + 40 + rnd(i, 61) * (XB - XA + 80), ph: rnd(i, 62), sp: 0.22 + rnd(i, 63) * 0.3, r: 1.3 + Math.pow(rnd(i, 64), 2) * 3.2, dr: (rnd(i, 65) - 0.4) * 90, fq: 3 + rnd(i, 66) * 6}));

/* ---------- type ---------- */
const NAME: [string, number, number, number][] = [['曹', C1X, -6, FS], ['操', C2X, 10, FS * 1.04]];
const Name: React.FC<{fill: string; stroke?: string; sw?: number; dx?: number; dy?: number; opacity?: number; filter?: string}> = ({fill, stroke, sw = 0, dx = 0, dy = 0, opacity, filter}) =>
	<g opacity={opacity} filter={filter}>{NAME.map(([c, x, oy, fs]) => <text key={c} x={f1(x + dx)} y={f1(NY + oy + fs * 0.355 + dy)} textAnchor="middle" fontFamily={BRUSH} fontSize={f1(fs)}
		fill={fill} stroke={stroke} strokeWidth={sw || undefined} strokeLinejoin="round">{c}</text>)}</g>;
/* the question: 到底是 [英雄] ，还是 [奸雄] ？ — the two words big in the brush, the rest in 文楷 */
const QS = 60, QB = 108, GAP = 12;
type QW = {s: string; big: boolean; c: string; x: number; f0: number};
const QWORDS: QW[] = (() => { const parts: [string, boolean, string, number][] = [['到底是', false, 'c', 5], ['英雄', true, 'g', 7], ['，还是', false, 'c', 9], ['奸雄', true, 'r', 11], ['？', false, 'c', 12]];
	const ws = parts.map(([s, big]) => s.length * (big ? QB : QS)), tot = ws.reduce((a, b) => a + b, 0) + GAP * (parts.length - 1);
	let x = 960 - tot / 2; return parts.map(([s, big, c, f0], i) => { const o = {s, big, c, x: x + ws[i] / 2, f0}; x += ws[i] + GAP; return o; }); })();

const Seal: React.FC<{k: number; o: number}> = ({k, o}) => <g transform={`translate(${SX},${SY}) rotate(-4) scale(${k.toFixed(4)})`} opacity={o}>
	<g filter="url(#aseal)">
		<rect x={-SW / 2} y={-SH / 2} width={SW} height={SH} rx={7} fill="#B8281C" />
		<rect x={-SW / 2 + 6} y={-SH / 2 + 6} width={SW - 12} height={SH - 12} rx={3} fill="none" stroke="#F6E7CF" strokeWidth={2.8} />
		{([['孟', -SH * 0.215], ['德', SH * 0.215]] as [string, number][]).map(([c, y]) => <text key={c} transform={`translate(0,${f1(y + SW * 0.26)}) scale(1,0.8)`} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={900} fontSize={SW * 0.74} fill="#F6E7CF">{c}</text>)}
	</g>
</g>;

/** the whole title frame at film time t (the gate behind it included) */
export const TitleOpt: React.FC<{t: number}> = ({t}) => {
	useBrush(); useStampFonts('到底是，还是？');
	const fr = (t - TITLE_A) * 30 + 0.25;                                       // frames since the slam (the first title frame ≈ 1)
	const out = eio(seg(t, TITLE_B - 0.45, TITLE_B - 0.07)), on = 1 - out;
	const hold = eio(seg(t, TITLE_A + 0.2, TITLE_B));
	/* camera: the slam shake, the seal kick */
	const shk = (a: number, f0: number, n: number) => fr < f0 || fr > f0 + n ? 0 : a * Math.pow(1 - (fr - f0) / n, 1.5);
	const shx = shk(9, 0, 8) * Math.sin(fr * 2.6) + shk(3, 15, 5) * Math.sin(fr * 3.4), shy = shk(6, 0, 8) * Math.cos(fr * 3.1) + shk(4, 15, 6) * Math.cos(fr * 2.2);
	const kick = 0.016 * (fr < 15 ? 0 : Math.exp(-(fr - 15) / 2.2) * (fr < 16 ? (fr - 15) : 1));
	const cam = 1 + kick + 0.025 * hold + 0.04 * out;
	/* the gate: down to 45 %, blurred, pushing */
	const dim = eo(fr / 4), bgK = 1 + 0.05 * hold + 0.012 * shk(1, 0, 6) + kick * 0.6;
	/* the ink and the name */
	const wipe = eo(fr / 4.2), wipeX = XA - 120 + (XB + 300 - XA) * wipe;
	const slam = eo((fr - 0.4) / 4.2), sU = cl((fr - 0.4) / 7), nk = 1.4 - 0.4 * slam - 0.035 * Math.sin(Math.PI * cl((fr - 3.4) / 4.5)) * (fr > 3.4 ? 1 : 0) + 0 * sU, nameO = cl((fr - 0.2) / 1.6), nbl = 7 * (1 - slam);
	const flash = Math.max(0, 1 - fr / 7) * 0.3;
	const sealK = fr < 15 ? 0 : fr < 17.5 ? 1.9 - 0.96 * eo((fr - 15) / 2.5) ** 2 : 0.94 + 0.06 * eo((fr - 17.5) / 3);
	const qWipe = 470 + 1000 * eo((fr - 5) / 8);
	const sw1 = seg(t, TITLE_A + 0.9, TITLE_A + 1.68), sw2 = seg(t, 14.95, 15.55);
	const swX = sw1 > 0 && sw1 < 1 ? 470 + 1060 * eio(sw1) : sw2 > 0 && sw2 < 1 ? 470 + 1060 * eio(sw2) : -999, swO = sw1 > 0 && sw1 < 1 ? 1 : 0.55;
	const blurOut = 9 * out;
	const zoom = (k: number, fx = 960, fy = 500) => `translate(${fx},${fy}) scale(${k.toFixed(5)}) translate(${-fx},${-fy})`;
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
		<div style={{position: 'absolute', inset: 0, transform: `scale(${bgK.toFixed(5)})`, transformOrigin: '50% 46%', filter: `blur(${(3.2 * dim).toFixed(2)}px) brightness(${(1 - 0.5 * dim).toFixed(3)}) saturate(${(1 - 0.3 * dim).toFixed(3)})`}}>
			<Open t={t} />
		</div>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<radialGradient id="adim" cx={960} cy={NY + 90} r="980" gradientUnits="userSpaceOnUse" gradientTransform={`translate(960 ${NY + 90}) scale(1 0.56) translate(-960 ${-NY - 90})`}>
					<stop offset="0" stopColor="#040304" stopOpacity="0.4" /><stop offset="0.55" stopColor="#040304" stopOpacity="0.34" /><stop offset="1" stopColor="#040304" stopOpacity="0.6" /></radialGradient>
				<radialGradient id="aglow" cx={970} cy={NY - 10} r="760" gradientUnits="userSpaceOnUse" gradientTransform={`translate(970 ${NY - 10}) scale(1 0.46) translate(-970 ${-NY + 10})`}>
					<stop offset="0" stopColor="#F0CF98" stopOpacity="0.46" /><stop offset="0.45" stopColor="#D9A86A" stopOpacity="0.2" /><stop offset="1" stopColor="#C99A62" stopOpacity="0" /></radialGradient>
				<radialGradient id="afl" cx={760} cy={NY} r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F6E2B8" stopOpacity="1" /><stop offset="1" stopColor="#F6E2B8" stopOpacity="0" /></radialGradient>
				<linearGradient id="agold" x1="0" y1="0.04" x2="0" y2="1">
					<stop offset="0" stopColor="#FFF3CC" /><stop offset="0.22" stopColor="#F2CF86" /><stop offset="0.5" stopColor="#D5A253" /><stop offset="0.76" stopColor="#A87436" /><stop offset="1" stopColor="#6E481D" /></linearGradient>
				<linearGradient id="agoldQ" x1="0" y1="0.08" x2="0" y2="1"><stop offset="0" stopColor="#FFEDBE" /><stop offset="0.45" stopColor="#EDC06A" /><stop offset="1" stopColor="#B07A34" /></linearGradient>
				<linearGradient id="ared" x1="0" y1="0.08" x2="0" y2="1"><stop offset="0" stopColor="#F2604A" /><stop offset="0.5" stopColor="#D8382A" /><stop offset="1" stopColor="#9C1E16" /></linearGradient>
				<linearGradient id="asweep" x1={swX - 150} x2={swX + 150} y1="0" y2="0" gradientUnits="userSpaceOnUse" gradientTransform={`rotate(-22 ${swX} ${NY})`}>
					<stop offset="0" stopColor="#FFF8E2" stopOpacity="0" /><stop offset="0.42" stopColor="#FFF8E2" stopOpacity="0.5" /><stop offset="0.5" stopColor="#FFFDF4" stopOpacity="0.95" /><stop offset="0.58" stopColor="#FFF8E2" stopOpacity="0.5" /><stop offset="1" stopColor="#FFF8E2" stopOpacity="0" /></linearGradient>
				<filter id="arough" x="-5%" y="-12%" width="110%" height="124%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.010 0.06" numOctaves={2} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={18} xChannelSelector="R" yChannelSelector="G" /></filter>
				<filter id="aroughS" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={9} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter>
				<filter id="astreak" x={XA - 60} y={NY - 220} width={XB - XA + 500} height={440} filterUnits="userSpaceOnUse">
					<feTurbulence type="fractalNoise" baseFrequency="0.0016 0.085" numOctaves={3} seed={5} result="n" />
					<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  18 0 0 0 -7.6" /></filter>
				<linearGradient id="adryG" x1={XB - 170} x2={XB + 40} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
				<mask id="adry" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
					<rect width={W} height={H} fill="url(#adryG)" />
					<rect x={XA - 60} y={NY - 220} width={XB - XA + 500} height={440} fill="#fff" filter="url(#astreak)" />
					{GAPS.map((d, i) => <path key={i} d={d} fill="#000" />)}
				</mask>
				<filter id="aseal" x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={13} result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale={2.6} xChannelSelector="R" yChannelSelector="G" result="d" />
					<feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves={2} seed={21} result="sp" />
					<feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -30 22.2" result="holes" />
					<feComposite in="d" in2="holes" operator="in" /></filter>
				<filter id="ash" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
				<filter id="ahalo" x="-30%" y="-120%" width="160%" height="340%"><feGaussianBlur stdDeviation="64" /></filter>
				<filter id="ahalo2" x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="90" /></filter>
				<filter id="aqh" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="8" /><feComponentTransfer><feFuncA type="linear" slope="0.9" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="anbl" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation={`${f1(nbl)} ${f1(nbl * 0.45)}`} /></filter>
				<filter id="aout" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation={blurOut.toFixed(2)} /></filter>
				<filter id="aemb" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<RimF id="arimI" lx={0.2} ly={-1} k={2.4} c="#D6A35A" o={0.8} lx2={-0.4} ly2={1} k2={1.6} c2="#7E5A2E" o2={0.4} blur={0.8} />
				<RimF id="arimD" lx={0.25} ly={-1} k={1.2} c="#C8964E" o={0.5} blur={0.5} />
				<RimF id="arimG" lx={0} ly={-1} k={3} c="#FFF8E0" o={0.9} lx2={0} ly2={1} k2={2.2} c2="#4A2E10" o2={0.6} blur={0.9} />
				<clipPath id="awipe"><path d={`M0,0 L${f1(wipeX + 60)},0 L${f1(wipeX - 60)},${H} L0,${H} Z`} /></clipPath>
				<linearGradient id="aqw" x1={qWipe - 140} x2={qWipe} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
				<mask id="aqm" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="url(#aqw)" /></mask>
			</defs>
			{/* the gate recedes: a dark oval scrim, a warm backlight behind the stroke so the ink reads as a silhouette */}
			<rect width={W} height={H} fill="url(#adim)" opacity={dim * on} />
			<rect width={W} height={H} fill="url(#aglow)" opacity={dim * (0.85 + 0.15 * Math.sin(t * 2.1)) * on} />
			{flash > 0.004 && <rect width={W} height={H} fill="url(#afl)" opacity={flash} />}
			<g transform={`translate(${f1(shx)},${f1(shy)}) ${zoom(cam)}`} opacity={on} filter={blurOut > 0.05 ? 'url(#aout)' : undefined}>
				{/* the backlight hugging the stroke (warm haze from the gate's lamps), so the black ink reads as a silhouette */}
				<g clipPath="url(#awipe)" opacity={0.9 + 0.1 * Math.sin(t * 2.3)}>
					<path d={SMEAR} fill="#C98F52" filter="url(#ahalo2)" opacity={0.5} />
					<path d={SMEAR} fill="#F2C88A" filter="url(#ahalo)" opacity={0.2} />
				</g>
				{/* the ink 横: body, hairs, bristles, splats — one bronze-rimmed ink layer, painted on by the wipe */}
				<g filter="url(#arimI)">
					<g clipPath="url(#awipe)" filter="url(#arough)" fill="#0A0706">
						<g mask="url(#adry)"><path d={SMEAR} />{HAIRS.map((h, i) => <path key={i} d={h.d} fill="none" stroke="#241B14" strokeWidth={h.w} opacity={h.o * 0.7} />)}</g>
						{BRISTLES.map((d, i) => <path key={i} d={d} />)}
						{SPLATS.map(([x, y, r], i) => <g key={i} opacity={cl((fr - (i < 2 ? 0.5 : 3.5)) / 1.5)}><circle cx={x} cy={y} r={r} />{Array.from({length: 6}, (_, j) => <circle key={j} cx={x + Math.cos(j * 1.2 + i) * r * (1.3 + rnd(i * 6 + j, 31))} cy={y + Math.sin(j * 1.2 + i) * r * (1.3 + rnd(i * 6 + j, 32))} r={r * (0.16 + 0.22 * rnd(i * 6 + j, 33))} />)}</g>)}
					</g>
				</g>
				<g filter="url(#arimD)">
					<g fill="#0A0706" filter="url(#aroughS)">
						{DROPS.map((d, i) => { if (fr < d.f0) return null; const u = eo((fr - d.f0) / 4);
							const x = d.x0 + (d.x - d.x0) * u, y = d.y0 + (d.y - d.y0) * u, r = d.r * (0.4 + 0.6 * u), st = d.s + (1 - u) * 1.8;
							return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(r * st)} ry={f1(r / Math.sqrt(st))} transform={`rotate(${f1(d.a)} ${f1(x)} ${f1(y)})`} />; })}
					</g>
				</g>
				{/* embers lifting off the ink */}
				<g filter="url(#aemb)">{EMB.map((e, i) => { const life = ((t - TITLE_A) * e.sp + e.ph) % 1, a0 = cl((fr - 3) / 6);
					if (a0 <= 0) return null;
					const x = e.x + e.dr * life + 8 * Math.sin(t * 1.7 + i), y = cy(e.x) - 60 - life * 320 - 40 * rnd(i, 67), o = a0 * Math.sin(Math.PI * life) * (0.55 + 0.45 * Math.sin(t * e.fq + i));
					return o > 0.02 ? <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(e.r)} fill={i % 3 ? '#FFD68E' : '#FFF1C8'} opacity={o.toFixed(3)} /> : null; })}</g>
				{/* 曹操: ink shadow, dark outline, bronze-gold body with a lit top edge, the sweep */}
				<g transform={zoom(nk, 960, NY)} opacity={nameO} filter={nbl > 0.1 ? 'url(#anbl)' : undefined}>
					<Name fill="#020101" dx={10} dy={14} opacity={0.85} filter="url(#ash)" />
					<g filter="url(#aroughS)">
						<Name fill="#0B0705" stroke="#0B0705" sw={16} />
						<g filter="url(#arimG)"><Name fill="url(#agold)" /></g>
						{swX > 0 && <Name fill="url(#asweep)" opacity={swO} />}
					</g>
				</g>
				{/* the seal, thumped at beat 2 */}
				{sealK > 0 && <Seal k={sealK} o={cl((fr - 15) / 1.2)} />}
				{/* the question */}
				{fr >= 5 && <g mask="url(#aqm)" filter="url(#aqh)">
					{QWORDS.map((w, i) => { const p = eo((fr - w.f0) / 3.5), k = w.big ? 1.45 - 0.45 * p : 1, size = w.big ? QB : QS;
						return <g key={i} transform={`translate(${f1(w.x)},${QC}) scale(${k.toFixed(4)})`} opacity={w.big ? cl((fr - w.f0 + 0.5) / 1.5) : 1}>
							<text x={0} y={f1(size * 0.36)} textAnchor="middle" fontFamily={w.big ? BRUSH : KAI} fontWeight={w.big ? 400 : 700} fontSize={size} letterSpacing={0}
								fill={w.c === 'g' ? 'url(#agoldQ)' : w.c === 'r' ? 'url(#ared)' : '#F4E6C8'} stroke="#0A0604" strokeWidth={w.big ? 10 : 8} strokeOpacity={0.9} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{w.s}</text>
						</g>; })}
				</g>}
			</g>
		</svg>
	</div>; };
