import React from 'react';
import {W, H, seg, cl, SERIF, KAI, rnd} from '../qq50/kit50';
import {useStampFonts} from '../qq44/skin44';
import {RimF} from './cao54b';
/* ep54 · the title card over film 12.61–16.59 (bar 6 → bar 8), drawn on top of the 洛阳 wide. Owner: "这个title的画风做的更符合这个故事"
   (make the title's art fit the story). TitleArt is the whole title layer; demo54core.Overlay draws it during the title window.
   r2 (op): a Han warlord's title in look B's ink and bronze: 曹操 very large in bronze-gold over a swept ink brush stroke whose
   tail breaks into dry-brush bristles (飞白), an ink-splash burst on the slam (every ink shape carries look B's warm rim, here
   bronze), one red square seal 「孟德」 (白文, read right column first) pressed a few frames later, and the question in 霞鹜文楷
   with 英雄 in gold and 奸雄 in deep red. Timing: the slam on bar 6 (12.606), the seal at +8 frames, the question wiped in at
   +9…+17 frames, a slow hold, gone by 16.52 (before bar 8). */
export const TITLE_A = 0.654 + 1.99203 * 6, TITLE_B = 0.654 + 1.99203 * 8;
const Q: [string, string][] = [['到底是', 'c'], ['英雄', 'g'], ['，还是', 'c'], ['奸雄', 'r'], ['？', 'c']];
const QCOL: Record<string, string> = {c: '#F4E6C8', g: '#EDC266', r: '#D23A2C'};
const NX = 960, NY = 282, FS = 232;                  // the name's glyph centre and size
const SX = 1312, SY = 366, SS = 112;                 // the seal: centre and side
const QY = 492, QFS = 60;                            // the question's baseline and size
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const f1 = (v: number) => v.toFixed(1);

/* ---------- the brush stroke: a 横 laid with a loaded brush from left to right, rising a little, the tail running dry ---------- */
const XA = 452, XB = 1262, R0 = 96;
const cy = (x: number) => NY + 10 - (x - NX) * 0.04;
const hh = (x: number) => { const body = 222 - 52 * cl((x - XA) / (XB - XA)); return x < XA + R0 ? body * Math.sqrt(Math.max(0, 1 - ((XA + R0 - x) / R0) ** 2)) : body; };
const SMEAR = (() => { const top: string[] = [], bot: string[] = [];
	for (let x = XA; x <= XB; x += 6) { const h = hh(x) / 2;
		top.push(`${f1(x)},${f1(cy(x) - h + 5 * Math.sin(x * 0.013 + 1) + 2.4 * Math.sin(x * 0.047))}`);
		bot.push(`${f1(x)},${f1(cy(x) + h + 4 * Math.sin(x * 0.011 + 2) + 3 * Math.sin(x * 0.039 + 0.5))}`); }
	/* the end of the body is ragged: a few teeth before the bristles take over */
	const end = Array.from({length: 9}, (_, i) => { const v = (i + 0.5) / 9 - 0.5, x = XB + 10 + 36 * rnd(i, 41) * (1 - Math.abs(v) * 1.4); return `${f1(x)},${f1(cy(x) + v * hh(XB))}`; });
	return `M${top.join(' L')} L${end.join(' L')} L${bot.reverse().join(' L')} Z`; })();
/* dry-brush bristles at the tail (飞白): thin wedges of ink running past the body's end */
const BRISTLES = Array.from({length: 30}, (_, i) => { const v = (i + rnd(i, 7) * 0.8) / 30 - 0.5, edge = Math.abs(v) * 2;
	const xs = 1020 + rnd(i, 8) * 170, xe = XB + 40 + (1 - edge * 0.8) * (90 + rnd(i, 9) * 190), w = 3 + rnd(i, 10) * 8 * (1 - edge * 0.5);
	const y0 = cy(xs) + v * hh(xs) * 0.98, y1 = cy(xe) + v * hh(XB) * (1.02 + 0.2 * rnd(i, 11)) + (rnd(i, 12) - 0.5) * 8;
	return `M${f1(xs)},${f1(y0 - w / 2)} Q${f1((xs + xe) / 2)},${f1((y0 + y1) / 2 - w / 2 + (rnd(i, 13) - 0.5) * 4)} ${f1(xe)},${f1(y1)} Q${f1((xs + xe) / 2)},${f1((y0 + y1) / 2 + w / 2)} ${f1(xs)},${f1(y0 + w / 2)} Z`; });
/* the dry gaps inside the body near the tail (cut out by a mask) */
const GAPS = Array.from({length: 16}, (_, i) => { const v = (i + rnd(i, 21)) / 16 - 0.5, xs = 930 + rnd(i, 22) * 220, xe = XB + 60, w = 1.4 + rnd(i, 23) * 3.4;
	return `M${f1(xs)},${f1(cy(xs) + v * hh(xs) * 0.9)} L${f1(xe)},${f1(cy(xe) + v * hh(XB) * 0.9 - w / 2)} L${f1(xe)},${f1(cy(xe) + v * hh(XB) * 0.9 + w / 2)} Z`; });
/* the splash: drops thrown off the stroke on the slam (radius, final place, the frame it lands, streak or round) */
type Drop = {x0: number; y0: number; x: number; y: number; r: number; a: number; s: number; f0: number};
const DROPS: Drop[] = Array.from({length: 54}, (_, i) => {
	const side = i % 3, th = side === 0 ? Math.PI + (rnd(i, 1) - 0.5) * 1.9 : side === 1 ? (rnd(i, 1) - 0.5) * 1.6 : (rnd(i, 1) < 0.5 ? -1 : 1) * (Math.PI / 2 + (rnd(i, 2) - 0.5) * 2.2);
	const ex = NX + Math.cos(th) * 470, ey = NY + Math.sin(th) * 96, d = 14 + Math.pow(rnd(i, 3), 1.4) * (side === 2 ? 120 : 210);
	const r = 2.2 + Math.pow(rnd(i, 4), 2.4) * 15, s = rnd(i, 5) < 0.4 ? 2.2 + rnd(i, 6) * 1.6 : 1;
	return {x0: ex, y0: ey, x: ex + Math.cos(th) * d, y: Math.min(560, ey + Math.sin(th) * d * 0.75), r, a: th * 180 / Math.PI, s, f0: d / 120}; });
/* two heavy splats where the brush hit and where it lifted */
const SPLATS: [number, number, number][] = [[XA + 22, NY + 96, 26], [XA - 18, NY - 54, 14], [1458, NY - 92, 16], [1412, NY + 104, 11]];

const Seal: React.FC<{k: number; o: number}> = ({k, o}) => <g transform={`translate(${SX},${SY}) rotate(-5) scale(${k.toFixed(4)})`} opacity={o}>
	<g filter="url(#ttseal)">
		<rect x={-SS / 2} y={-SS / 2} width={SS} height={SS} rx={5} fill="#B0261C" />
		<rect x={-SS / 2 + 5} y={-SS / 2 + 5} width={SS - 10} height={SS - 10} rx={3} fill="none" stroke="#F6E7CF" strokeWidth={2.4} opacity={0.9} />
		{/* 白文: 孟 in the right column, 德 in the left (a seal reads from the right) */}
		{[['孟', 23], ['德', -23]].map(([c, x]) => <text key={c} transform={`translate(${x},${SS * 0.33}) scale(0.5,1)`} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={SS * 0.86} fill="#F6E7CF">{c}</text>)}
	</g>
</g>;

/** the title on bar 6 */
export const TitleArt: React.FC<{t: number}> = ({t}) => {
	useStampFonts('到底是英雄，还是奸雄？');
	const fr = (t - TITLE_A) * 30;                                              // frames since the slam
	const out = eo(seg(t, TITLE_B - 0.46, TITLE_B - 0.08)), on = 1 - out;
	const slam = eo(fr / 5), k = (1.3 - 0.3 * slam) * (1 + 0.022 * seg(t, TITLE_A + 0.3, TITLE_B - 0.46)) * (1 + 0.04 * out);
	const sweep = eo(fr / 5), nameO = cl(0.45 + fr / 2.2);
	const shk = (a: number, f0: number, n: number) => fr < f0 || fr > f0 + n ? 0 : a * (1 - (fr - f0) / n);
	const shx = shk(6, 0, 6) * Math.sin(fr * 2.7) + shk(2.5, 8, 4) * Math.sin(fr * 3.3), shy = shk(4, 0, 6) * Math.cos(fr * 3.1) + shk(2, 8, 4) * Math.cos(fr * 2.9);
	const sealU = cl((fr - 8) / 3), sealK = fr < 8 ? 0 : fr < 11 ? 1.7 - 0.74 * (sealU * sealU) : 0.96 + 0.04 * eo((fr - 11) / 3);
	const qU = cl((fr - 9) / 8), qX = 560 + 900 * eo(qU), qO = on;
	const flash = Math.max(0, 1 - fr / 6) * 0.26, blur = 6 * out + (fr < 2 ? 2.5 * (1 - fr / 2) : 0);
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
		<defs>
			<radialGradient id="ttdim" cx={NX} cy={NY + 70} r="900" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${NX} ${NY + 70}) scale(1 0.5) translate(${-NX} ${-NY - 70})`}>
				<stop offset="0" stopColor="#050405" stopOpacity="0.72" /><stop offset="0.5" stopColor="#050405" stopOpacity="0.46" /><stop offset="1" stopColor="#050405" stopOpacity="0.12" /></radialGradient>
			<radialGradient id="ttfl" cx={NX} cy={NY} r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#F3DDB4" stopOpacity="1" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient>
			<linearGradient id="ttgold" x1="0" y1={NY - FS * 0.46} x2="0" y2={NY + FS * 0.46} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor="#FFF0C4" /><stop offset="0.28" stopColor="#ECC77C" /><stop offset="0.56" stopColor="#C99449" /><stop offset="0.8" stopColor="#9A6A2E" /><stop offset="1" stopColor="#6A461C" /></linearGradient>
			<filter id="ttrough" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.07" numOctaves={2} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" /></filter>
			<filter id="ttroughS" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={9} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4.5} xChannelSelector="R" yChannelSelector="G" /></filter>
			<filter id="ttseal" x="-10%" y="-10%" width="120%" height="120%">
				<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={2} seed={13} result="n" />
				<feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="d" />
				<feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves={1} seed={21} result="sp" />
				<feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 5.6" result="holes" />
				<feComposite in="d" in2="holes" operator="in" />
			</filter>
			<filter id="ttsh" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
			<filter id="ttqh" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="7" /><feComponentTransfer><feFuncA type="linear" slope="0.85" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
			<filter id="ttbl" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation={blur.toFixed(2)} /></filter>
			<RimF id="ttrimI" lx={0.25} ly={-1} k={3.2} c="#C8964E" o={0.85} lx2={-0.4} ly2={1} k2={2} c2="#7E5A2E" o2={0.6} blur={0.9} />
			<RimF id="ttrimG" lx={0} ly={-1} k={2.6} c="#FFF7DE" o={0.85} blur={0.8} />
			<mask id="ttgap" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="#fff" />{GAPS.map((d, i) => <path key={i} d={d} fill="#000" />)}</mask>
			<clipPath id="ttsweep"><rect x={XA - 80} y={0} width={f1((XB + 400 - XA) * sweep + 80)} height={H} /></clipPath>
			<linearGradient id="ttqw" x1={qX - 120} x2={qX} y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
			<mask id="ttqm" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="url(#ttqw)" /></mask>
		</defs>
		{/* the gate dims behind the title */}
		<rect width={W} height={H} fill="url(#ttdim)" opacity={on * eo(fr / 4)} />
		{flash > 0.004 && <rect width={W} height={H} fill="url(#ttfl)" opacity={flash} />}
		<g transform={`translate(${f1(shx)},${f1(shy)})`} opacity={on} filter={blur > 0.05 ? 'url(#ttbl)' : undefined}>
			{/* ink: the stroke, its bristles, the splash (one bronze-rimmed ink layer) */}
			<g filter="url(#ttrimI)">
				<g transform={`translate(${NX},${NY}) scale(${k.toFixed(4)}) translate(${-NX},${-NY})`}>
					<g clipPath="url(#ttsweep)" filter="url(#ttrough)" fill="#0A0706">
						<g mask="url(#ttgap)"><path d={SMEAR} /></g>
						{BRISTLES.map((d, i) => <path key={i} d={d} />)}
						{SPLATS.map(([x, y, r], i) => <g key={i} opacity={cl(fr / 2)}><circle cx={x} cy={y} r={r} />{Array.from({length: 5}, (_, j) => <circle key={j} cx={x + Math.cos(j * 1.3 + i) * r * (1.3 + rnd(i * 5 + j, 31))} cy={y + Math.sin(j * 1.3 + i) * r * (1.3 + rnd(i * 5 + j, 32))} r={r * (0.18 + 0.2 * rnd(i * 5 + j, 33))} />)}</g>)}
					</g>
				</g>
				<g fill="#0A0706" filter="url(#ttroughS)">
					{DROPS.map((d, i) => { const u = eo((fr - d.f0) / 4); if (fr < d.f0) return null;
						const x = d.x0 + (d.x - d.x0) * u, y = d.y0 + (d.y - d.y0) * u, r = d.r * (0.4 + 0.6 * u), st = d.s + (1 - u) * 1.5;
						return <ellipse key={i} cx={f1(x)} cy={f1(y)} rx={f1(r * st)} ry={f1(r / Math.sqrt(st))} transform={`rotate(${f1(d.a)} ${f1(x)} ${f1(y)})`} />; })}
				</g>
			</g>
			{/* 曹操: an ink shadow, a dark outline, the bronze-gold body with its lit top edge */}
			<g transform={`translate(${NX},${NY}) scale(${k.toFixed(4)}) translate(${-NX},${-NY})`} opacity={nameO}>
				<text x={NX + 9 + FS * 0.06} y={NY + FS * 0.38 + 11} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={FS} letterSpacing={FS * 0.12} fill="#030202" opacity={0.9} filter="url(#ttsh)">曹操</text>
				<g filter="url(#ttroughS)">
					<text x={NX + FS * 0.06} y={NY + FS * 0.38} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={FS} letterSpacing={FS * 0.12} fill="#0B0705" stroke="#0B0705" strokeWidth={14} strokeLinejoin="round">曹操</text>
					<g filter="url(#ttrimG)"><text x={NX + FS * 0.06} y={NY + FS * 0.38} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={FS} letterSpacing={FS * 0.12} fill="url(#ttgold)">曹操</text></g>
				</g>
			</g>
			{/* the seal, pressed at +8 frames */}
			{sealK > 0 && <Seal k={sealK} o={cl((fr - 8) / 1.5)} />}
			{/* the question, wiped in left to right */}
			{fr >= 9 && <g mask="url(#ttqm)" opacity={qO}>
				<text x={NX} y={QY} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={QFS} letterSpacing={QFS * 0.1} filter="url(#ttqh)" stroke="#0A0604" strokeWidth={9} strokeOpacity={0.82} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>
					{Q.map(([s, c], i) => <tspan key={i} fill={QCOL[c]} fontSize={c === 'c' ? QFS : QFS * 1.08}>{s}</tspan>)}
				</text>
			</g>}
		</g>
	</svg>; };
