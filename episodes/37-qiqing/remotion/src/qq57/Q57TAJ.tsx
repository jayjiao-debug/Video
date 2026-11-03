import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import data from '../../public/ep57/taj/taj.json';
/* ep57 · 泰姬陵, built live in Remotion in the episode's flat-colour + ink look (owner 09:54). Still layers and sprites come
   from tools/export_taj.py (hist_c.py's own drawing code); the Taj is built here from hist_c.taj()'s geometry.
   Shot A 「皇后生下第14个孩子后去世，皇帝为她修了二十多年。」 fixed camera on the site (owner 09:25): 1631, the 14th child,
     then 1632 → 1653: the plinth in courses, the hall in brick with its arches on timber centring and the marble climbing
     after it, the four minarets, the drum, the dome rising in courses inside its scaffold, the finial; cranes lift a block on
     every beat, the elephant heaves its sled on every beat, ox-carts bring marble; the emperor lifts his head at the end.
   Shot B 「晚年他被软禁，只能远远望着它；死后，葬在了她身边。」 dusk at Agra Fort: the camera pulls back from the old emperor in
     the Musamman Burj's window (a guard at the far arch) to show his line of sight across the river to the Taj; 1658 → 1666,
     night falls, his lamp goes out; the crypt opens from the Taj and his cenotaph is set down beside hers.
   Each shot 5.016 s = 3 bars at 143.6 BPM (t = 0 on a downbeat, beat 0.418 s). */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, SHOT = 5.016, INK = '#2A211B', GOLD = '#F2C66E', CREAM = '#FFF6E6';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
const rb = (t: number, b0: number, b1: number) => cl((t - b0 * BEAT) / ((b1 - b0) * BEAT));   // 0 → 1 between two beats
const q = (v: number, s: number, full = Infinity) => v >= full - 1e-6 ? full : Math.floor(v / s + 1e-6) * s;   // whole courses only
type P2 = [number, number];
const D: any = data;
const f1 = (p: number[]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const pts = (ps: number[][]) => ps.map(f1).join(' ');
const range = (a: number, b: number, s: number) => { const o: number[] = []; for (let v = a; s > 0 ? v < b : v > b; v += s) o.push(v); return o; };
const Layer: React.FC<{name: string; op?: number}> = ({name, op}) => <g opacity={op} dangerouslySetInnerHTML={{__html: D.layers[name].body}} />;
const Spr: React.FC<{name: string; x: number; y: number; op?: number}> = ({name, x, y, op}) =>
	<g transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`} opacity={op} dangerouslySetInnerHTML={{__html: D.sprites[name]}} />;
const Bar: React.FC<{p: number[][]; c: string; w: number; sw?: number; op?: number}> = ({p, c, w, sw = 1.4, op}) =>
	<g opacity={op}><polyline points={pts(p)} fill="none" stroke={INK} strokeWidth={w + 2 * sw} strokeLinecap="round" strokeLinejoin="round" />
		<polyline points={pts(p)} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>;

/* ---------- the reference widgets ---------- */
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, s, size, col = '#FFF6E6', anchor = 'start', w = 900}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: number[]; to: P2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };
/* a year odometer: each digit rolls on its own wheel; between years the number rests, then rolls (so it can be read) */
const Odo: React.FC<{id: string; x: number; y: number; v: number; size: number; col?: string}> = ({id, x, y, v, size, col = '#FFF6E6'}) => {
	const iv = Math.floor(v), vv = iv + sm((v - iv - .55) / .45), dw = size * .6, lh = size * 1.05, o: React.ReactNode[] = [];
	for (let i = 0; i < 4; i++) {
		const p = Math.pow(10, 3 - i), lower = vv - Math.floor(vv / p) * p;
		const pos = (Math.floor(vv / p) % 10) + (p === 1 ? vv - Math.floor(vv) : Math.max(0, lower - (p - 1)));
		const base = Math.floor(pos);
		for (let d = base - 1; d <= base + 2; d++) o.push(<T2 key={`${i}_${d}`} x={x + dw * (i + .5)} y={y + (d - pos) * lh} s={String(((d % 10) + 10) % 10)} size={size} col={col} anchor="middle" />);
	}
	return <g><defs><clipPath id={id}><rect x={x - 4} y={y - size * .92} width={dw * 4 + 8} height={size * 1.12} /></clipPath></defs><g clipPath={`url(#${id})`}>{o}</g></g>;
};

/* ---------- hist_c's curve helpers, ported ---------- */
const segs = (p: P2[], closed: boolean) => { const n = p.length, o: P2[][] = [];
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p1 = p[i], p2 = p[(i + 1) % n];
		const p0 = closed ? p[(i - 1 + n) % n] : p[Math.max(i - 1, 0)], p3 = closed ? p[(i + 2) % n] : p[Math.min(i + 2, n - 1)];
		o.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]); }
	return o; };
const curveD = (p: P2[], closed = true) => `M${f1(p[0])}` + segs(p, closed).map(([, c1, c2, p2]) => ` C${f1(c1)} ${f1(c2)} ${f1(p2)}`).join('') + (closed ? ' Z' : '');
const sample = (p: P2[], n = 12): P2[] => { const o: P2[] = [p[0]];
	for (const [a, b, c, d] of segs(p, false)) for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u;
		o.push([v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]); }
	return o; };
const archD = (x0: number, x1: number, spring: number, apex: number, bottom: number, top = false) => {
	const c = (x0 + x1) / 2, w = (x1 - x0) / 2, h = spring - apex;
	const arc = `C${x0.toFixed(1)},${(spring - .62 * h).toFixed(1)} ${(c - .45 * w).toFixed(1)},${(apex + .135 * w).toFixed(1)} ${c.toFixed(1)},${apex.toFixed(1)} C${(c + .45 * w).toFixed(1)},${(apex + .135 * w).toFixed(1)} ${x1.toFixed(1)},${(spring - .62 * h).toFixed(1)} ${x1.toFixed(1)},${spring.toFixed(1)}`;
	return top ? `M${x0.toFixed(1)},${spring.toFixed(1)} ${arc}` : `M${x0.toFixed(1)},${bottom.toFixed(1)} L${x0.toFixed(1)},${spring.toFixed(1)} ${arc} L${x1.toFixed(1)},${bottom.toFixed(1)} Z`; };
const domeSide = (cx: number, base: number, top: number, hwb: number, hwm: number, ym: number, k = 1): P2[] => { const h = ym - top;
	return [[cx + hwb * k, base], [cx + hwm * k, ym], [cx + hwm * .9 * k, ym - h * .45], [cx + hwm * .55 * k, top + h * .12], [cx, top]]; };
const domeOutline = (cx: number, base: number, top: number, hwb: number, hwm: number, ym: number) => {
	const r = domeSide(cx, base, top, hwb, hwm, ym), sl = r.map(([x, y]) => [2 * cx - x, y] as P2); return [...sl, ...r.slice().reverse().slice(1)]; };
const Dome: React.FC<{cx: number; base: number; top: number; hwb: number; hwm: number; ym: number; fill: string; lit: string; shade: string; sw: number}> = ({cx, base, top, hwb, hwm, ym, fill, lit, shade, sw}) => {
	const r = domeSide(cx, base, top, hwb, hwm, ym), sl = r.map(([x, y]) => [2 * cx - x, y] as P2), mir = (ps: P2[]) => ps.map(([x, y]) => [2 * cx - x, y] as P2);
	const outline = curveD(domeOutline(cx, base, top, hwb, hwm, ym), false) + ' Z';
	const litD = curveD(r, false) + ' ' + curveD(domeSide(cx, base, top, hwb, hwm, ym, .3).reverse(), false).replace('M', 'L') + ' Z';
	const shD = curveD(sl, false) + ' ' + curveD(mir(domeSide(cx, base, top, hwb, hwm, ym, .62)).reverse(), false).replace('M', 'L') + ' Z';
	return <g><path d={outline} fill={fill} /><path d={litD} fill={lit} /><path d={shD} fill={shade} /><path d={outline} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" /></g>; };

/* ================= the Taj, built (local units of hist_c.taj: plinth top y 0, finial -232) ================= */
const A = D.A, TK: number = A.K;
const X = (x: number) => A.CX + x * TK, Y = (y: number) => A.BY + y * TK;
const T = (x: number, y: number): P2 => [X(x), Y(y)];
const RR = (key: string, x0: number, y0: number, x1: number, y1: number, fill: string, sw = 2.5) =>
	<polygon key={key} points={pts([T(x0, y0), T(x1, y0), T(x1, y1), T(x0, y1)])} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
const hl = (key: string, x0: number, x1: number, ys: number[], col: string, sw: number, op = 1) =>
	<path key={key} d={ys.map((y) => `M${X(x0).toFixed(1)},${Y(y).toFixed(1)} H${X(x1).toFixed(1)}`).join(' ')} stroke={col} strokeWidth={sw} opacity={op} fill="none" />;
/* a part drawn twice: raw brick between the course being laid and the marble line, finished marble below that line */
const TwoTone: React.FC<{id: string; base: number; core: number; clad: number; draw: (p: any, marble: boolean) => React.ReactNode}> = ({id, base, core, clad, draw}) => {
	if (core >= base - .5) return null;   // nothing laid yet
	return <g><defs><clipPath id={`${id}B`}><rect x={-10} y={core} width={W + 20} height={Math.max(0, clad - core)} /></clipPath>
		<clipPath id={`${id}M`}><rect x={-10} y={clad} width={W + 20} height={Math.max(0, base - clad + 60)} /></clipPath></defs>
		{clad > core + .05 && <g clipPath={`url(#${id}B)`}>{draw(A.brick, false)}</g>}
		{base - clad > .5 && <g clipPath={`url(#${id}M)`}>{draw(A.pal, true)}</g>}</g>;
};
const SIDE: number[][] = [];
for (const s of [-1, 1]) for (const [xc, hw] of [[s * 57, 13], [s * 89, 7]]) for (const [sp, ap, bo] of [[-60, -73, -44], [-24, -37, 0]]) SIDE.push([xc, hw, sp, ap, bo]);
const ARCHES = [[-25, 25, -62, -88, 0], ...SIDE.map(([xc, hw, sp, ap, bo]) => [xc - hw, xc + hw, sp, ap, bo])];
const Facade = (p: any, marble: boolean) => {
	const o: React.ReactNode[] = [RR('cl', -100, -80, -78, 0, p.chamL), RR('cr', 78, -80, 100, 0, p.chamR),
		<polygon key="f" points={pts(([[-78, 0], [-78, -80], [-36, -80], [-36, -100], [36, -100], [36, -80], [78, -80], [78, 0]] as P2[]).map(([x, y]) => T(x, y)))} fill={p.face} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />];
	if (!marble) { o.push(hl('bc', -99, 99, range(-4, -79, -4), p.frame, 1.5, .55)); o.push(hl('bc2', -35, 35, range(-84, -99, -4), p.frame, 1.5, .55)); }
	else o.push(<polygon key="fr" points={pts([T(-30, -96), T(30, -96), T(30, 0), T(-30, 0)])} fill="none" stroke={p.frame} strokeWidth={1.75} />);
	o.push(<path key="iw" d={archD(X(-25), X(25), Y(-62), Y(-88), Y(0))} fill={p.recess} stroke={INK} strokeWidth={2.75} strokeLinejoin="round" />);
	o.push(<path key="iw2" d={archD(X(-19), X(19), Y(-54), Y(-74), Y(0))} fill={p.deep} stroke={INK} strokeWidth={1.75} strokeLinejoin="round" />);
	if (marble) { o.push(<path key="dr" d={archD(X(-7), X(7), Y(-18), Y(-26), Y(0))} fill={p.door} stroke={INK} strokeWidth={1.75} />);
		o.push(<path key="wi" d={archD(X(-8), X(8), Y(-44), Y(-52), Y(-34))} fill={p.open} stroke={INK} strokeWidth={1.5} />); }
	SIDE.forEach(([xc, hw, sp, ap, bo], i) => { const fill = Math.abs(xc) < 80 ? p.recess : xc < 0 ? p.openL : p.openR;
		o.push(<path key={`a${i}`} d={archD(X(xc - hw), X(xc + hw), Y(sp), Y(ap), Y(bo))} fill={fill} stroke={INK} strokeWidth={2.25} strokeLinejoin="round" />);
		if (bo < -10) o.push(RR(`b${i}`, xc - hw - 1.5, bo, xc + hw + 1.5, bo + 2.5, p.band, 1.5)); });
	return <g>{o}</g>;
};
const Kiosk = (p: any, marble: boolean) => <g>{[-1, 1].map((s) => { const ax = s * 66; return <g key={s}>
	{RR('k', ax - 14, -94, ax + 14, -80, p.mid)}<polygon points={pts([T(ax + 3, -94), T(ax + 14, -94), T(ax + 14, -80), T(ax + 3, -80)])} fill={p.lit} />
	{!marble && hl('kc', ax - 13, ax + 13, range(-83, -94, -3), p.frame, 1.3, .55)}
	{[-8, 0, 8].map((a) => <path key={a} d={archD(X(ax + a - 2.6), X(ax + a + 2.6), Y(-88), Y(-91.5), Y(-81))} fill={p.open} stroke={INK} strokeWidth={1.25} />)}
	<polygon points={pts([T(ax - 14, -94), T(ax + 14, -94), T(ax + 14, -80), T(ax - 14, -80)])} fill="none" stroke={INK} strokeWidth={2.5} /></g>; })}</g>;
const KioskCap: React.FC<{p: any; dy: number}> = ({p, dy}) => <g transform={`translate(0,${dy.toFixed(2)})`}>{[-1, 1].map((s) => { const ax = s * 66; return <g key={s}>
	<polygon points={pts([T(ax - 17, -94), T(ax + 17, -94), T(ax + 15, -96.5), T(ax - 15, -96.5)])} fill={p.band} stroke={INK} strokeWidth={2} />
	<Dome cx={X(ax)} base={Y(-96.5)} top={Y(-116)} hwb={12 * TK} hwm={14 * TK} ym={Y(-102)} fill={p.mid} lit={p.lit} shade={p.shade} sw={2.25} />
	<line x1={X(ax)} y1={Y(-116)} x2={X(ax)} y2={Y(-122)} stroke={INK} strokeWidth={2} /></g>; })}</g>;
const Drum = (p: any, marble: boolean) => <g>{RR('d', -40, -122, 40, -98, p.drum)}
	{marble ? range(-3, 4, 1).map((kq) => { const x = 38 * Math.sin(kq * 24 * Math.PI / 180), w = 4.5 * Math.cos(kq * 24 * Math.PI / 180);
		return <path key={kq} d={archD(X(x - w), X(x + w), Y(-110), Y(-116), Y(-102))} fill="none" stroke={p.frame} strokeWidth={1.5} opacity={.8} />; })
		: hl('dc', -39, 39, range(-101, -122, -3), p.frame, 1.4, .55)}</g>;
const DOME = {base: Y(-121), top: Y(-200), hwb: 46 * TK, hwm: 53 * TK, ym: Y(-150)};
const DOME_PTS = sample(domeOutline(A.CX, DOME.base, DOME.top, DOME.hwb, DOME.hwm, DOME.ym), 16);
const domeHalf = (y: number) => { let best = 0; for (let i = 1; i < DOME_PTS.length; i++) { const [a, b] = [DOME_PTS[i - 1], DOME_PTS[i]];
	if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) best = Math.max(best, Math.abs(a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) - A.CX)); } return best; };
const DomeP = (p: any, marble: boolean) => <g><Dome cx={A.CX} {...DOME} fill={p.dome_m} lit={p.dome_l} shade={p.dome_s} sw={2.75} />
	{marble ? [-135, -155, -172].map((y) => <path key={y} d={`M${X(-44)},${Y(y)} Q${A.CX},${Y(y + 6)} ${X(44)},${Y(y)}`} fill="none" stroke={p.frame} strokeWidth={1.25} opacity={.35} />)
		: <g clipPath="url(#tDomeS)">{hl('dk', -56, 56, range(-124, -200, -3), p.frame, 1.4, .6)}</g>}</g>;
const Finial: React.FC<{p: any; dy: number; op: number}> = ({p, dy, op}) => <g transform={`translate(0,${dy.toFixed(2)})`} opacity={op}>
	<path d={`M${X(-7)},${Y(-200)} Q${A.CX},${Y(-206)} ${X(7)},${Y(-200)} Z`} fill={p.band} stroke={INK} strokeWidth={2} />
	<line x1={A.CX} y1={Y(-203)} x2={A.CX} y2={Y(-226)} stroke={INK} strokeWidth={3.4} />
	{[[-210, 2.2], [-216, 2.8], [-221, 1.6]].map(([y, r]) => <circle key={y} cx={A.CX} cy={Y(y)} r={r * TK} fill={p.band} stroke={INK} strokeWidth={1.25} />)}</g>;
type Mn = {x: number; base: number; kk: number; far: boolean};
const MIN: Mn[] = [{x: -172, base: 0, kk: 1, far: false}, {x: 172, base: 0, kk: 1, far: false}, {x: -146, base: -4, kk: .9, far: true}, {x: 146, base: -4, kk: .9, far: true}];
const mT = (m: Mn, px: number, py: number): P2 => T(m.x + px * m.kk, m.base + py * m.kk);
const mhw = (y: number) => 6.5 - 1.5 * (-y / 100);
const lerp2 = (a: P2, b: P2, u: number): P2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const Shaft = (m: Mn) => (p: any, marble: boolean) => {
	const [sh, md, lt] = m.far ? [p.fshade, p.fmid, p.flit] : [p.shade, p.mid, p.lit], sw = m.far ? 2 : 2.5;
	const s0 = mT(m, -mhw(0), 0), s1 = mT(m, -mhw(-100), -100), r0 = mT(m, mhw(0), 0), r1 = mT(m, mhw(-100), -100);
	const marksD = (step: number) => range(-step, -100, -step).map((y) => { const a = mT(m, -mhw(y), y), b = mT(m, mhw(y), y); return `M${f1(a)} L${f1(b)}`; }).join(' ');
	return <g><polygon points={pts([s0, s1, r1, r0])} fill={md} /><polygon points={pts([s0, s1, lerp2(s1, r1, .3), lerp2(s0, r0, .3)])} fill={sh} />
		<polygon points={pts([lerp2(s0, r0, .62), lerp2(s1, r1, .62), r1, r0])} fill={lt} />
		<path d={marksD(marble ? 8 : 3)} stroke={marble ? '#00000022' : p.frame} strokeWidth={1.2} opacity={marble ? 1 : .6} fill="none" />
		<polygon points={pts([s0, s1, r1, r0])} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
		{[-34, -67, -100].map((yb) => { const w0 = mhw(yb) + 3; return <g key={yb}>
			<polygon points={pts([mT(m, -w0, yb - 3), mT(m, w0, yb - 3), mT(m, w0, yb), mT(m, -w0, yb)])} fill={md} stroke={INK} strokeWidth={sw * .8} />
			<polygon points={pts([mT(m, -w0 + 1, yb), mT(m, w0 - 1, yb), mT(m, w0 - 2.5, yb + 3), mT(m, -w0 + 2.5, yb + 3)])} fill={sh} stroke={INK} strokeWidth={sw * .6} /></g>; })}</g>;
};
const MinTop: React.FC<{m: Mn; p: any; dy: number; op: number}> = ({m, p, dy, op}) => {
	const [sh, md, lt] = m.far ? [p.fshade, p.fmid, p.flit] : [p.shade, p.mid, p.lit], sw = m.far ? 2 : 2.5, c = mT(m, 0, 0)[0];
	return <g transform={`translate(0,${dy.toFixed(2)})`} opacity={op}>
		<polygon points={pts([mT(m, -6, -100), mT(m, 6, -100), mT(m, 6, -110), mT(m, -6, -110)])} fill={md} stroke={INK} strokeWidth={sw * .8} />
		<polygon points={pts([mT(m, 1, -100), mT(m, 6, -100), mT(m, 6, -110), mT(m, 1, -110)])} fill={lt} />
		{[-3, 0, 3].map((a) => <path key={a} d={archD(mT(m, a - 1.2, 0)[0], mT(m, a + 1.2, 0)[0], mT(m, 0, -106)[1], mT(m, 0, -108.5)[1], mT(m, 0, -101)[1])} fill={p.open} />)}
		<polygon points={pts([mT(m, -8, -110), mT(m, 8, -110), mT(m, 7, -112.5), mT(m, -7, -112.5)])} fill={p.band} stroke={INK} strokeWidth={sw * .7} />
		<Dome cx={c} base={mT(m, 0, -112.5)[1]} top={mT(m, 0, -124)[1]} hwb={6 * m.kk * TK} hwm={7 * m.kk * TK} ym={mT(m, 0, -116)[1]} fill={md} lit={lt} shade={sh} sw={sw * .8} />
		<line x1={c} y1={mT(m, 0, -124)[1]} x2={c} y2={mT(m, 0, -131)[1]} stroke={INK} strokeWidth={2} /></g>;
};
/* timber scaffolding: poles lashed into a grid; each pole has its own top (screen y) */
const hash = (a: number, b: number) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };
const Scaf: React.FC<{poles: number[][]; step: number; wood?: string}> = ({poles, step, wood = '#8A5A32'}) => {
	const live = poles.filter(([, b, t]) => b - t > 4);
	if (live.length === 0) return null;
	const P: string[] = [], L: string[] = [], B: string[] = [], X_: string[] = [];
	for (const [x, b, t] of live) P.push(`M${x.toFixed(1)},${b.toFixed(1)} V${t.toFixed(1)}`);
	const bmax = Math.max(...live.map((p) => p[1])), tmin = Math.min(...live.map((p) => p[2]));
	for (let y = bmax - step * .6, i = 0; y > tmin; y -= step, i++) {
		const xs = live.filter(([, b, t]) => t <= y + 2 && b >= y).map((p) => p[0]).sort((a, b) => a - b);
		if (xs.length < 2) continue;
		L.push(`M${(xs[0] - 6).toFixed(1)},${y.toFixed(1)} H${(xs[xs.length - 1] + 6).toFixed(1)}`);
		xs.forEach((x, j) => { X_.push(`M${(x - 3).toFixed(1)},${(y - 3).toFixed(1)} l6,6`); if (j && hash(x, i) < .35 && live.some(([px, b, t]) => px === x && t <= y - step + 2)) B.push(`M${xs[j - 1].toFixed(1)},${y.toFixed(1)} L${x.toFixed(1)},${(y - step).toFixed(1)}`); });
	}
	return <g strokeLinecap="round" fill="none">
		<path d={P.join(' ')} stroke={INK} strokeWidth={6.8} /><path d={L.join(' ')} stroke={INK} strokeWidth={5.8} /><path d={B.join(' ')} stroke={INK} strokeWidth={4.8} opacity={.8} />
		<path d={P.join(' ')} stroke={wood} strokeWidth={4} /><path d={L.join(' ')} stroke={wood} strokeWidth={3.5} /><path d={B.join(' ')} stroke="#6E4426" strokeWidth={2.6} />
		<path d={X_.join(' ')} stroke="#4A2E1A" strokeWidth={2} /></g>;
};
/* a stack of cut stone that shrinks as it is used */
const Pile: React.FC<{x: number; y: number; n: number; w: number; h: number; c: string; side: string; joint: string}> = ({x, y, n, w, h, c, side, joint}) => {
	const o: React.ReactNode[] = [];
	for (let j = 0; j < n; j++) { const ww = w - j * w * .14, x0 = x - ww / 2, y0 = y - (j + 1) * h;
		o.push(<g key={j}><rect x={x0} y={y0} width={ww} height={h} fill={c} stroke={INK} strokeWidth={2} /><rect x={x0 + ww * .78} y={y0} width={ww * .22} height={h} fill={side} />
			<path d={range(x0 + 16 + (j % 2) * 8, x0 + ww - 4, 16).map((xx) => `M${xx.toFixed(1)},${y0} v${h}`).join(' ')} stroke={joint} strokeWidth={1.3} /><rect x={x0} y={y0} width={ww} height={h} fill="none" stroke={INK} strokeWidth={2} /></g>); }
	return <g>{o}</g>;
};

/* ---------- the elephant (legs swing about their hips while it heaves), the sled, the ox-carts, the boats ---------- */
const Elephant: React.FC<{x: number; y: number; dist: number}> = ({x, y, dist}) => {
	const E = A.ele, ph = dist / 66 * 2 * Math.PI, ang = (o: number) => 10 * Math.sin(ph + o);
	const leg = (s: string, hip: number[], o: number, k: string) => <g key={k} transform={`rotate(${ang(o).toFixed(2)} ${hip[0].toFixed(1)} ${hip[1].toFixed(1)})`} dangerouslySetInnerHTML={{__html: s}} />;
	return <g transform={`translate(${x.toFixed(2)},${y})`}><g dangerouslySetInnerHTML={{__html: E.shadow}} />
		{leg(E.far[0], E.hips_far[0], Math.PI * 1.5, 'ff')}{leg(E.far[1], E.hips_far[1], Math.PI, 'hf')}
		{leg(E.near[0], E.hips_near[0], Math.PI * .5, 'fn')}{leg(E.near[1], E.hips_near[1], 0, 'hn')}
		<g dangerouslySetInnerHTML={{__html: E.body}} /></g>;
};
const Sled: React.FC<{x0: number; x1: number; yb: number; hb: number; roll: number}> = ({x0, x1, yb, hb, roll}) => {
	const w = x1 - x0;
	return <g><ellipse cx={(x0 + x1) / 2} cy={yb + 14} rx={w * .62} ry={6} fill="#2A140C" opacity={.22} />
		<polygon points={pts([[x0, yb - 10], [x1, yb - 10], [x1, yb - 10 - hb], [x0, yb - 10 - hb]])} fill="#F3EEE8" />
		<polygon points={pts([[x0 + w * .7, yb - 10], [x1, yb - 10], [x1, yb - 10 - hb], [x0 + w * .7, yb - 10 - hb]])} fill="#D2CACA" />
		<polygon points={pts([[x0, yb - 10], [x1, yb - 10], [x1, yb - 10 - hb], [x0, yb - 10 - hb]])} fill="none" stroke={INK} strokeWidth={3} />
		<line x1={x0 + 8} y1={yb - 10 - hb + 8} x2={x0 + w * .55} y2={yb - 10 - hb + 8} stroke="#FFFFFF" strokeWidth={3} opacity={.7} />
		<polygon points={pts([[x0 - 14, yb - 10], [x1 + 8, yb - 10], [x1 + 8, yb], [x0 - 4, yb]])} fill="#7A4E2E" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
		{range(x0, x1 + 1, 34).map((x) => <g key={x}><circle cx={x} cy={yb + 6} r={7} fill="#9A6A42" stroke={INK} strokeWidth={2} />
			<line x1={x} y1={yb + 6} x2={x + 6 * Math.cos(roll)} y2={yb + 6 + 6 * Math.sin(roll)} stroke="#5E3A20" strokeWidth={1.6} /></g>)}</g>;
};
const OxCart: React.FC<{x: number; y: number; dist: number}> = ({x, y, dist}) => {
	const O = A.oxcart, th = -dist / O.r, wx = x + O.wheel[0], wy = y + O.wheel[1];
	return <g><Spr name="oxcart" x={x} y={y} />
		<circle cx={wx} cy={wy} r={O.r} fill="none" stroke={INK} strokeWidth={6.5} /><circle cx={wx} cy={wy} r={O.r} fill="none" stroke="#7A4E2E" strokeWidth={3.5} />
		{range(0, 8, 1).map((i) => { const a = th + i * Math.PI / 4; return <line key={i} x1={wx} y1={wy} x2={wx + O.r * Math.cos(a)} y2={wy + O.r * Math.sin(a)} stroke="#6E4426" strokeWidth={2.2} />; })}
		<circle cx={wx} cy={wy} r={4} fill="#5E3A20" stroke={INK} strokeWidth={1.5} /></g>;
};
const Boat: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => <g transform={`translate(${x.toFixed(2)},${y}) scale(${f},1)`}>
	<path d="M-34,-6 L34,-6 Q30,4 20,6 L-24,6 Q-32,2 -34,-6 Z" fill="#6E4426" stroke={INK} strokeWidth={1.8} />
	<rect x={-18} y={-20} width={26} height={14} fill="#F3EEE8" stroke={INK} strokeWidth={1.6} /><rect x={2} y={-20} width={6} height={14} fill="#D2CACA" />
	<g dangerouslySetInnerHTML={{__html: D.sprites.boatman}} transform="translate(20,-6)" /></g>;

/* ================= shot A: 1631, then 1632 → 1653 ================= */
const ShotA: React.FC<{t: number}> = ({t}) => {
	const PAL = A.pal, BR = A.brick;
	// the build, in whole courses (local units)
	const plR = 20 * rb(t, 3, 4), pl = q(plR, 2.5, 20);                                              // b3 开工: the plinth
	const hcR = 100 * rb(t, 4, 6.4), hc = q(hcR, 4, 100), hcl = q(100 * rb(t, 5.6, 7.9), 4, 100);         // bar 2: the hall, then its marble
	const rk = q(14 * rb(t, 6.4, 7), 2, 14), rkl = q(14 * rb(t, 7.8, 8.2), 2, 14), cap = rb(t, 7, 7.3);
	const drR = 24 * rb(t, 6.4, 7.2), dr = q(drR, 3, 24), drl = q(24 * rb(t, 8.4, 8.8), 3, 24);
	const dcR = 79 * rb(t, 7.2, 9.6), dc = q(dcR, 3, 79), dcl = q(79 * rb(t, 8.8, 9.95), 3, 79);         // the dome in courses
	const fin = rb(t, 10, 10.3), gul = rb(t, 9.5, 9.9);                                                  // b10: the finial, 落成
	const mo = [0, .25, .5, .75], mcR = mo.map((o) => 100 * rb(t, 4.3 + o, 8.6 + o)), mc = mcR.map((v) => q(v, 4, 100)), ml = mo.map((o) => q(100 * rb(t, 6 + o, 9.2 + o), 4, 100)), mt = mo.map((o) => rb(t, 8.6 + o, 8.95 + o));
	const sHall = rb(t, 7.9, 8.5), sAll = rb(t, 10.1, 10.8);                                             // bar 3: the hall's scaffold comes down
	const year = t < 3 * BEAT ? 1631 : 1632 + 21 * rb(t, 3, 10), done = t >= 10 * BEAT;
	const workers = Math.round(20000 * eo(rb(t, 3.5, 10)) / 10) * 10;
	const kids = Math.min(14, Math.floor(cl((t - .1) / .75) * 14 + 1e-6) + (t > .1 ? 1 : 0));
	const bow = 22 - 15 * sm(rb(t, 9, 11));
	// heaves on the beat: the elephant and its sled surge on every beat and never quite stop
	const fr = t / BEAT, heave = (k: number) => k * (.35 * fr + .65 * (Math.floor(fr) + sm((fr - Math.floor(fr)) / .7)));
	const eDist = heave(28), ex = 1360 - eDist, LANE = 1062;
	const cDist = 440 * (1 - Math.pow(1 - cl(t / 4.7), 2)), cx0 = 2040 - cDist;
	// scaffold geometry (screen)
	const wTop = (lim: number, h: number) => Math.min(lim, h);
	const strikeTop = (b: number, top: number, s: number, step: number) => b - step * Math.floor(((b - top) / step) * (1 - s) + .999);
	const hallPoles = hcR > 0 && sHall < 1 ? [-104, -74, -40, 40, 74, 104].map((x) => { const top = Y(-(wTop(Math.abs(x) <= 40 ? 100 : 80, hcR) + 8)); return [X(x), Y(0), strikeTop(Y(0), top, sHall, 25.8)]; }) : [];
	const work = dcR > 0 ? -121 - dcR : -98 - drR;
	const domeTopAt = (x: number) => { const hw = domeHalf; let best = Y(-121); for (let y = Y(-121); y >= Y(-200); y -= 2) if (hw(y) >= Math.abs(x - A.CX)) best = y; return best; };
	const domePoles = drR > 0 && sAll < 1 ? range(-62, 62.1, 12.4).map((lx) => { const x = X(lx), b = Y(Math.abs(lx) > 36 ? -80 : -100);
		const top = Math.max(domeTopAt(x) - 10 * TK, Y(work - 8)); return [x, b, strikeTop(b, top, sAll, 25.8)]; }) : [];
	const minPoles = (i: number) => { const m = MIN[i]; if (mcR[i] <= 0 || sAll >= 1) return []; const b = Y(m.base), top = mT(m, 0, -(mcR[i] + 9))[1];
		return [-11, 11].map((px) => [mT(m, px, 0)[0], b, strikeTop(b, top, sAll, 22)]); };
	// masons: they stand on the highest ledger under the work and glide up to the next one
	const ledgerY = (b: number, step: number, wallTopY: number, s: number, lift = 30) => {
		const u = (b - (wallTopY + lift)) / step - .6, pos = u < 0 ? -.6 : Math.floor(u) + sm((u - Math.floor(u) - .55) / .45);
		const y = b - step * (.6 + pos); return Math.max(y, b - (b - wallTopY) * (1 - s) + lift * .2); };
	const plinthTop = Y(20 - plR);
	const hallMasonY = hcR > 0 ? ledgerY(Y(0), 25.8, Y(-Math.min(100, hcR)), sHall) : plinthTop;
	const domeMasonY = drR > 0 ? ledgerY(Y(-100), 25.8, Y(work), sAll) : Y(-100);
	const gin = (s: number) => { if (hcR < 24 || sAll >= 1) return null; const x = X(s * 114), b = Y(0), lvl = hcR < 100 ? -hcR : work, top = strikeTop(b, Y(lvl - 14), sAll, 25.8), jx = X(s * 88), jy = top + 14;
		const ph = ((fr + (s > 0 ? .5 : 0)) % 1), ly = b - 16 - (b - 16 - (jy + 26)) * sm(Math.min(1, ph / .78));
		return <g key={`g${s}`}><Bar p={[[x, b], [x, top]]} c="#7A5A3A" w={5} /><Bar p={[[x, top + 4], [jx, jy]]} c="#7A5A3A" w={4} />
			<Bar p={[[x - s * 26, b], [x, b - 70]]} c="#7A5A3A" w={3} /><line x1={jx} y1={jy} x2={jx} y2={ly} stroke={INK} strokeWidth={1.4} />
			<rect x={jx - 13} y={ly} width={26} height={16} fill="#F1ECE6" stroke={INK} strokeWidth={1.8} /><rect x={jx + 5} y={ly} width={8} height={16} fill="#CFC6C6" /></g>; };
	const clouds = [[240, 250, 1.1], [760, 170, .8], [1180, 300, 1.0], [520, 420, .7], [1560, 120, .9]];
	const pegOp = 1 - cl(plR / 6);
	const pal = PAL;
	return <g>
		<defs dangerouslySetInnerHTML={{__html: ['a_back', 'a_front'].map((k) => D.layers[k].defs).join('')}} />
		<defs><clipPath id="tDomeS"><path d={curveD(domeOutline(A.CX, DOME.base, DOME.top, DOME.hwb, DOME.hwm, DOME.ym), false) + ' Z'} /></clipPath></defs>
		<Layer name="a_back" />
		{clouds.map(([x, y, k], i) => <g key={i} transform={`translate(${(((x + 16 * t * (1 + i * .15)) % 2200) - 140).toFixed(2)},${y}) scale(${k})`} opacity={.85}>
			<ellipse cx={0} cy={0} rx={130} ry={24} fill="#E8C4B4" /><ellipse cx={-50} cy={-14} rx={70} ry={22} fill="#F2D6C6" /><ellipse cx={40} cy={-16} rx={60} ry={20} fill="#F2D6C6" />
			<ellipse cx={0} cy={9} rx={110} ry={9} fill="#C9A0A4" opacity={.55} /></g>)}
		<Boat x={56 + 18 * t} y={830} f={1} /><Boat x={1600 - 30 * t} y={840} f={-1} />
		<Layer name="a_trees" />
		{/* the site: pegged outline, then the Taj from the ground up */}
		{pegOp > 0 && <g opacity={pegOp}><line x1={X(-185)} y1={Y(20)} x2={X(185)} y2={Y(20)} stroke={CREAM} strokeWidth={3} strokeDasharray="10 8" />
			{[-185, -172, -146, -100, 100, 146, 172, 185].map((x) => <Bar key={x} p={[[X(x), Y(20) + 4], [X(x), Y(20) - 14]]} c="#8A5A32" w={3} />)}</g>}
		{MIN.slice(2).map((m, j) => { const i = j + 2; return <g key={i}>
			<TwoTone id={`tM${i}`} base={Y(m.base)} core={mT(m, 0, -mc[i])[1]} clad={mT(m, 0, -ml[i])[1]} draw={Shaft(m)} />
			{mc[i] > 0 && mc[i] < 100 && <line x1={mT(m, -mhw(-mc[i]), -mc[i])[0]} y1={mT(m, 0, -mc[i])[1]} x2={mT(m, mhw(-mc[i]), -mc[i])[0]} y2={mT(m, 0, -mc[i])[1]} stroke={INK} strokeWidth={2.5} />}
			{mt[i] > 0 && <MinTop m={m} p={pal} dy={-18 * (1 - eo(mt[i]))} op={cl(mt[i] * 5)} />}
			<Scaf poles={minPoles(i)} step={22} /></g>; })}
		<TwoTone id="tDr" base={Y(-98)} core={Y(-98 - dr)} clad={Y(-98 - drl)} draw={Drum} />
		<TwoTone id="tDo" base={Y(-121)} core={Y(-121 - dc)} clad={Y(-121 - dcl)} draw={DomeP} />
		{dc > 0 && dc < 79 && (() => { const y = Y(-121 - dc), hw = domeHalf(y); return <g>
			<polygon points={pts([[A.CX - hw, y], [A.CX + hw, y], [A.CX + hw - 4, y + 6], [A.CX - hw + 4, y + 6]])} fill="#C47458" />
			<line x1={A.CX - hw} y1={y} x2={A.CX + hw} y2={y} stroke={INK} strokeWidth={3} /></g>; })()}
		{fin > 0 && <Finial p={pal} dy={-30 * (1 - eo(fin))} op={cl(fin * 5)} />}
		<TwoTone id="tKi" base={Y(-80)} core={Y(-80 - rk)} clad={Y(-80 - rkl)} draw={Kiosk} />
		{cap > 0 && <g opacity={cl(cap * 5)}><KioskCap p={rkl >= 14 ? pal : BR} dy={-16 * (1 - eo(cap))} /></g>}
		<TwoTone id="tHa" base={Y(0)} core={Y(-hc)} clad={Y(-hcl)} draw={Facade} />
		{hc > 0 && hc < 100 && (() => { const s = hc <= 80 ? 100 : 36; return <g>
			<polygon points={pts([T(-s, -hc), T(s, -hc), T(s, -hc + 2.5), T(-s, -hc + 2.5)])} fill="#C47458" />
			<line x1={X(-s)} y1={Y(-hc)} x2={X(s)} y2={Y(-hc)} stroke={INK} strokeWidth={3} /></g>; })()}
		{hcl > 0 && hcl < hc && (() => { const s = hcl <= 80 ? 100 : 36; return <line x1={X(-s)} y1={Y(-hcl)} x2={X(s)} y2={Y(-hcl)} stroke={INK} strokeWidth={2.5} />; })()}
		{ARCHES.filter(([, , sp, ap]) => hcR > -sp - 1 && hc < -ap + 8).map(([x0, x1, sp, ap, bo], i) => { const w = x1 - x0; return <g key={`c${i}`}>
			<path d={archD(X(x0 + 1), X(x1 - 1), Y(sp), Y(ap + 1), 0, true)} fill="none" stroke={INK} strokeWidth={6} /><path d={archD(X(x0 + 1), X(x1 - 1), Y(sp), Y(ap + 1), 0, true)} fill="none" stroke="#B07E4E" strokeWidth={3.4} />
			<Bar p={[[X(x0 + 1), Y(sp)], [X(x1 - 1), Y(sp)]]} c="#9A6A42" w={3} sw={1.2} />
			{[.3, .7].map((u) => <Bar key={u} p={[[X(x0 + w * u), Y(sp)], [X(x0 + w * u), Y(bo)]]} c="#9A6A42" w={3} sw={1.2} />)}</g>; })}
		{gul > 0 && <g transform={`translate(0,${(-10 * (1 - eo(gul))).toFixed(2)})`} opacity={cl(gul * 5)}>{[-1, 1].flatMap((s) => [[s * 36, -114], [s * 78, -94], [s * 100, -92]].map(([ax, tip]) => <g key={`${s}${ax}`}>
			{RR('g', ax - 2, tip + 4, ax + 2, Math.abs(ax) > 40 ? -80 : -100, pal.mid, 1.75)}<polygon points={pts([T(ax - 3, tip + 5), T(ax, tip), T(ax + 3, tip + 5)])} fill={pal.band} stroke={INK} strokeWidth={1.5} /></g>))}</g>}
		{plR > 0 && <g>{RR('pl', -185, 20 - pl, 185, 20, pal.plinth)}
			{hl('plj', -184, 184, range(17.5, 20 - pl + .1, -2.5), '#B8A8A2', 1.4, .8)}
			<path d={range(-175, 185, 22).map((x) => `M${X(x).toFixed(1)},${Y(Math.max(3, 20 - pl)).toFixed(1)} V${Y(20).toFixed(1)}`).join(' ')} stroke={pal.frame} strokeWidth={1.25} opacity={.5} />
			{pl >= 20 && RR('plt', -185, 0, 185, 3, pal.plinth_top, 2)}</g>}
		{MIN.slice(0, 2).map((m, i) => <g key={i}>
			<TwoTone id={`tM${i}`} base={Y(m.base)} core={mT(m, 0, -mc[i])[1]} clad={mT(m, 0, -ml[i])[1]} draw={Shaft(m)} />
			{mc[i] > 0 && mc[i] < 100 && <line x1={mT(m, -mhw(-mc[i]), -mc[i])[0]} y1={mT(m, 0, -mc[i])[1]} x2={mT(m, mhw(-mc[i]), -mc[i])[0]} y2={mT(m, 0, -mc[i])[1]} stroke={INK} strokeWidth={2.5} />}
			{mt[i] > 0 && <MinTop m={m} p={pal} dy={-18 * (1 - eo(mt[i]))} op={cl(mt[i] * 5)} />}
			<Scaf poles={minPoles(i)} step={22} /></g>)}
		<Scaf poles={domePoles} step={25.8} />
		<Scaf poles={hallPoles} step={25.8} />
		{gin(-1)}{gin(1)}
		{drR > 0 && [[-30, 'mason_pick_r'], [4, 'mason_carry_l'], [28, 'mason_pick_l']].map(([lx, nm], i) =>
			<Spr key={`dm${i}`} name={nm as string} x={X(lx as number)} y={domeMasonY} op={cl(rb(t, 6.4, 6.8))} />)}
		{t > 3 * BEAT && [[-88, 'mason_pick_r'], [-14, 'mason_carry_r'], [60, 'mason_hold_l']].map(([lx, nm], i) =>
			<Spr key={`hm${i}`} name={nm as string} x={X(lx as number)} y={hallMasonY} op={cl(rb(t, 3, 3.4))} />)}
		{/* materials on the ground: brick and marble, used up as the courses go in */}
		<Pile x={706} y={955} n={Math.round(5 * (1 - rb(t, 4, 9.6)))} w={92} h={12} c="#B0634A" side="#8E4A38" joint="#874634" />
		<Pile x={1490} y={922} n={Math.round(4 * (1 - .6 * rb(t, 5.6, 10)))} w={84} h={16} c="#F1ECE6" side="#CFC6C6" joint="#C9BEBA" />
		<Spr name="carrier" x={770} y={960} /><Spr name="digger" x={1560} y={920} />
		<OxCart x={cx0 + 300} y={936} dist={cDist} /><OxCart x={cx0} y={940} dist={cDist} />
		{/* the elephant heaving a marble block on its sled, two men pushing */}
		{(() => { const E = A.ele, x0 = ex + 122, x1 = ex + 262, yb = LANE - 13, s = [ex + E.strap[0], LANE + E.strap[1]], m: P2 = [(s[0] + x0) / 2, (s[1] + yb - 44) / 2 + 10];
			return <g><Sled x0={x0} x1={x1} yb={yb} hb={64} roll={-eDist / 7} />
				<path d={`M${f1(s)} Q${f1(m)} ${f1([x0, yb - 44])}`} fill="none" stroke="#5A3A22" strokeWidth={4} />
				<Elephant x={ex} y={LANE} dist={eDist} />
				<Spr name="pusher_a" x={x1 + 22} y={LANE - 2} /><Spr name="pusher_b" x={x1 + 62} y={LANE + 2} /></g>; })()}
		<Layer name="a_front" />
		<Layer name="a_emp_body" />
		<g transform={`rotate(${bow.toFixed(2)} ${A.emp_pivot[0].toFixed(1)} ${A.emp_pivot[1].toFixed(1)})`}><Layer name="a_emp_head" /></g>
		{/* the cause and the count */}
		<Callout from={(() => { const a = bow * Math.PI / 180, [px, py] = A.emp_pivot, dx = A.emp_head[0] - px, dy = A.emp_head[1] - py; return [px + dx * Math.cos(a) - dy * Math.sin(a), py + dx * Math.sin(a) + dy * Math.cos(a)]; })()} to={[520, 400]} label="沙贾汗" u={(t - BEAT) / .6} />
		<Callout from={[X(40), Y(-172)]} to={[1190, 420]} label="她的陵墓" u={(t - 10.5 * BEAT) / .5} />
		<Widget x={1450} y={150} w={380} h={190} op={cl(t / .3)}>
			{t < 3 * BEAT ? <g>
				<T2 x={1478} y={200} s="1631 · 皇后去世" size={32} col={GOLD} />
				<T2 x={1478} y={266} s={`第 ${kids} 个孩子`} size={50} />
				{range(0, 14, 1).map((i) => <circle key={i} cx={1488 + i * 23.4} cy={308} r={i === 13 ? 9 : 7.5} fill={i < kids ? (i === 13 ? GOLD : '#FFF6E6') : 'rgba(255,246,230,.18)'} stroke={i === 13 && kids === 14 ? INK : 'none'} strokeWidth={2} />)}
			</g> : <g>
				<T2 x={1478} y={200} s={done ? '1653 · 落成' : t < 4 * BEAT ? '为她修陵 · 开工' : '为她修陵 · 建造中'} size={32} col={GOLD} />
				<Odo id="odoA" x={1478} y={272} v={year} size={56} /><T2 x={1478 + 56 * .6 * 4 + 14} y={272} s="年" size={44} />
				<rect x={1478} y={296} width={324} height={12} rx={6} fill="rgba(255,246,230,.2)" /><rect x={1478} y={296} width={324 * (year - 1632) / 21} height={12} rx={6} fill={GOLD} />
				<T2 x={1802} y={330} s={`已修 ${Math.floor(year - 1632 + 1e-6)} 年`} size={22} col="#CFC3AE" anchor="end" w={700} />
			</g>}
		</Widget>
		<Widget x={1450} y={360} w={380} h={150} op={cl((t - 3.5 * BEAT) / .3)}>
			<T2 x={1478} y={404} s="工匠" size={30} col={GOLD} />
			<T2 x={1802} y={404} s={done ? '约 2 万名' : `${workers.toLocaleString('en-US')} 名`} size={done ? 40 : 36} col={done ? GOLD : '#FFF6E6'} anchor="end" />
			{range(0, 10, 1).map((i) => { const on = workers >= (i + 1) * 2000 - 1, x = 1490 + i * 32;
				return <g key={i} opacity={on ? 1 : .25}><circle cx={x} cy={446} r={6.5} fill={on ? GOLD : '#FFF6E6'} /><path d={`M${x - 9},${484} Q${x - 9},${456} ${x},${456} Q${x + 9},${456} ${x + 9},${484} Z`} fill={on ? GOLD : '#FFF6E6'} /></g>; })}
		</Widget>
	</g>;
};

/* ================= shot B: 1658 → 1666, Agra Fort, the line of sight, the crypt ================= */
const B = D.B;
const STARS = (() => { const o: number[][] = []; let s = 57; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
	while (o.length < 46) { const x = r() * 1920, y = 20 + r() * 400; if (x > 200 && x < 620 && y > 300) continue; if (x > 1420 && y > 130) continue; o.push([x, y, 1.2 + r() * 1.8, r()]); } return o; })();
const ShotB: React.FC<{t: number}> = ({t}) => {
	const u = eio(rb(t, .5, 4.5)), F: P2 = B.eye;
	const u2 = sm(rb(t, 3.5, 12)), sN = 1 + .7 * (1 - u) + .05 * (1 - u2), sF = 1 + .3 * (1 - u) + .025 * (1 - u2), sS = 1 + .08 * (1 - u) + .01 * (1 - u2);
	const tr = (s: number) => `translate(${(F[0] * (1 - s)).toFixed(2)},${(F[1] * (1 - s)).toFixed(2)}) scale(${s.toFixed(4)})`;
	const pN = (p: number[]): P2 => [F[0] + (p[0] - F[0]) * sN, F[1] + (p[1] - F[1]) * sN], pF = (p: number[]): P2 => [F[0] + (p[0] - F[0]) * sF, F[1] + (p[1] - F[1]) * sF];
	const night = sm(rb(t, 4.5, 7.8)), lamp = 1 - .9 * sm(rb(t, 7.4, 8.1)), flame = 1 - sm(rb(t, 7.4, 7.75));
	const year = 1658 + 8 * rb(t, 5, 7.5), dead = t >= 7.4 * BEAT, buried = t >= 8 * BEAT;
	const TJ = B.taj, tajTop = pF([TJ[0], TJ[1] - 168 * TJ[2]]), tajMid = pF([TJ[0], TJ[1] - 95 * TJ[2]]), tajBase = pF([TJ[0], TJ[1] + 16]);
	const eye = pN(B.eye), sight = rb(t, 4, 5.1), hit = rb(t, 5.1, 6), gaze = 1 - .65 * sm(rb(t, 7.4, 8.4));
	const wedgeL = pF([TJ[0] - 150 * TJ[2], TJ[1] - 60 * TJ[2]]), wedgeR = pF([TJ[0] + 150 * TJ[2], TJ[1] - 60 * TJ[2]]);
	// the crypt panel grows out of the Taj, his cenotaph is set down beside hers, part by part, on the beats
	const pu = eo(rb(t, 8, 8.8)), [IX, IY, IW, IH] = B.panel, PX = IX - 12, PY = IY - 12, PW = IW + 24, PH = IH + 24;
	const pc: P2 = [PX + PW / 2, PY + PH / 2], ps = .12 + .88 * pu, ptx = tajMid[0] + (pc[0] - tajMid[0]) * pu - pc[0] * ps, pty = tajMid[1] + (pc[1] - tajMid[1]) * pu - pc[1] * ps;
	const part = [8.75, 9.25, 9.75, 10.25].map((b) => rb(t, b, b + .45));
	const clouds = [[260, 200, 1.0], [700, 120, .8], [1100, 260, .9], [1560, 90, .7]];
	const birds = [[620, 380], [650, 368], [1000, 330]];
	const flk = 1 + .06 * Math.sin(t * 9) + .04 * Math.sin(t * 15.3);
	const lampP = B.lamp;
	return <g>
		<defs dangerouslySetInnerHTML={{__html: ['b_sky', 'b_far', 'b_fort', 'b_crypt'].map((k) => D.layers[k].defs).join('')}} />
		<defs>
			<clipPath id="bOpen">{B.open.map((o: number[][], i: number) => <polygon key={i} points={pts(o)} />)}</clipPath>
			<radialGradient id="bLamp" cx={lampP[0]} cy={lampP[1] - 10} r={270} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFE6B0" stopOpacity=".98" />
				<stop offset=".35" stopColor="#F2A660" stopOpacity=".72" /><stop offset="1" stopColor="#7A3A30" stopOpacity="0" /></radialGradient>
			<radialGradient id="bMoon"><stop offset="0" stopColor="#FFF6EE" stopOpacity=".7" /><stop offset=".6" stopColor="#FFF6EE" stopOpacity=".22" /><stop offset="1" stopColor="#FFF6EE" stopOpacity="0" /></radialGradient>
			<clipPath id="bPanel"><rect x={IX} y={IY} width={IW} height={IH} rx={10} /></clipPath>
		</defs>
		<g transform={tr(sS)}><Layer name="b_sky" />
			{STARS.map(([x, y, r, ph], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFF6E6" opacity={night * (.55 + .35 * ph)} />)}
			{clouds.map(([x, y, k], i) => <g key={i} transform={`translate(${(x + 14 * t).toFixed(2)},${y}) scale(${k})`} opacity={.8 - .4 * night}>
				<ellipse cx={0} cy={0} rx={130} ry={22} fill="#C98A8A" /><ellipse cx={-48} cy={-12} rx={66} ry={20} fill="#D9A096" /><ellipse cx={40} cy={-15} rx={58} ry={19} fill="#D9A096" /></g>)}
			{birds.map(([x, y], i) => <path key={i} d={`M${(x + 22 * t).toFixed(1)},${y} q6,-7 12,0 q6,-7 12,0`} fill="none" stroke="#3A2A3A" strokeWidth={2.5} opacity={1 - night} />)}</g>
		<g transform={tr(sF)}><Layer name="b_far" /></g>
		<g transform={tr(sN)}><Layer name="b_fort" /></g>
		<rect width={W} height={H} fill="#1C1430" opacity={.42 * night} />
		<g transform={tr(sF)}><ellipse cx={TJ[0]} cy={TJ[1] - 70} rx={230} ry={150} fill="url(#bMoon)" opacity={.6 * night} /></g>
		<g transform={tr(sN)}>
			<g clipPath="url(#bOpen)"><rect x={0} y={300} width={900} height={500} fill="url(#bLamp)" opacity={lamp} /></g>
			<Layer name="b_inside" />
			{flame > 0 && <g transform={`translate(${lampP[0]},${lampP[1] + 4}) scale(${(flame * flk).toFixed(3)})`}>
				<circle cx={0} cy={-6} r={18} fill="#FFE2A0" opacity={.35} /><path d="M0,-18 Q6,-8 4,-2 Q0,2 -4,-2 Q-6,-8 0,-18 Z" fill="#FFD27A" stroke="#C8702E" strokeWidth={1.4} /></g>}
		</g>
		{/* his line of sight: from the window, across the river, to the Taj */}
		{sight > 0 && <g opacity={gaze}>
			<polygon points={pts([eye, wedgeL, wedgeR])} fill={GOLD} opacity={.14 * sm(sight * 2) * (1 - .4 * night)} />
			<line x1={eye[0]} y1={eye[1]} x2={eye[0] + (tajMid[0] - eye[0]) * eo(sight)} y2={eye[1] + (tajMid[1] - eye[1]) * eo(sight)} stroke={INK} strokeWidth={9} strokeDasharray="18 12" strokeLinecap="round" opacity={.55} />
			<line x1={eye[0]} y1={eye[1]} x2={eye[0] + (tajMid[0] - eye[0]) * eo(sight)} y2={eye[1] + (tajMid[1] - eye[1]) * eo(sight)} stroke={GOLD} strokeWidth={5.5} strokeDasharray="18 12" strokeLinecap="round" />
			<circle cx={eye[0]} cy={eye[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
			{hit > 0 && <circle cx={tajMid[0]} cy={tajMid[1]} r={30 + 50 * eo(hit)} fill="none" stroke={GOLD} strokeWidth={4} opacity={1 - hit} />}
			{sight >= 1 && <circle cx={tajMid[0]} cy={tajMid[1]} r={9} fill={GOLD} stroke={INK} strokeWidth={2} />}</g>}
		<Callout from={pN([B.fort[0], B.fort[1]])} to={[40, 640]} label="阿格拉堡" u={(t - 3 * BEAT) / .6} />
		<Callout from={tajBase} to={[960, 846]} label="泰姬陵" u={(t - 5.1 * BEAT) / .6} side={-1} />
		<Widget x={1450} y={150} w={380} h={200} op={cl(t / .3)}>
			<T2 x={1478} y={200} s={buried ? '1666 · 葬在她身边' : dead ? '1666 · 去世' : '被儿子软禁'} size={32} col={GOLD} />
			<Odo id="odoB" x={1478} y={272} v={year} size={56} /><T2 x={1478 + 56 * .6 * 4 + 14} y={272} s="年" size={44} />
			{t <= 4.5 * BEAT && <T2 x={1478} y={330} s="沙贾汗 · 晚年" size={24} col="#CFC3AE" w={700} />}
			{t > 4.5 * BEAT && <g opacity={cl((t - 4.5 * BEAT) / .3)}><rect x={1478} y={296} width={324} height={12} rx={6} fill="rgba(255,246,230,.2)" />
				<rect x={1478} y={296} width={324 * (year - 1658) / 8} height={12} rx={6} fill={GOLD} />
				<T2 x={1802} y={336} s={`软禁 ${Math.floor(year - 1658 + 1e-6)} 年`} size={24} col="#CFC3AE" anchor="end" w={700} /></g>}
		</Widget>
		{pu > 0 && <g>
			<line x1={tajTop[0]} y1={tajTop[1]} x2={tajTop[0] + (PX - tajTop[0]) * pu} y2={tajTop[1] + (PY + 20 - tajTop[1]) * pu} stroke={GOLD} strokeWidth={3} />
			<line x1={tajBase[0]} y1={tajBase[1]} x2={tajBase[0] + (PX - tajBase[0]) * pu} y2={tajBase[1] + (PY + PH - 20 - tajBase[1]) * pu} stroke={GOLD} strokeWidth={3} />
			<g transform={`translate(${ptx.toFixed(2)},${pty.toFixed(2)}) scale(${ps.toFixed(4)})`}>
				<rect x={PX} y={PY} width={PW} height={PH} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />
				<g clipPath="url(#bPanel)"><Layer name="b_crypt" />
					{B.his.map((s: string, i: number) => part[i] > 0 && <g key={i} transform={`translate(0,${(-46 * (1 - eo(part[i]))).toFixed(2)})`} opacity={cl(part[i] * 6)} dangerouslySetInnerHTML={{__html: s}} />)}
				</g>
				{t > 10.6 * BEAT && (() => { const v = cl((t - 10.6 * BEAT) / .35), C = B.ceno; return <g opacity={v}>
					{[[C.his[0], C.his[1] - 26, '沙贾汗 · 1666'], [C.her[0], C.her[1] - 26, '皇后 · 1631']].map(([x, y, s]) => { const w = 30 + Array.from(s as string).reduce((a, ch) => a + (/[\u4e00-\u9fff]/.test(ch) ? 26 : ch === ' ' ? 7 : 15), 0);
						return <g key={s as string}><rect x={(x as number) - w / 2} y={(y as number) - 30} width={w} height={42} rx={10} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
							<T2 x={x as number} y={(y as number) + 1} s={s as string} size={26} col={GOLD} anchor="middle" /></g>; })}</g>; })()}
			</g></g>}
	</g>;
};

const Scene: React.FC<{ts?: number}> = ({ts = 1}) => {
	const f = useCurrentFrame() * ts, n1 = Math.round(SHOT * FPS);
	return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{f < n1 ? <ShotA t={f / FPS} /> : <ShotB t={(f - n1) / FPS} />}</svg></AbsoluteFill>;
};
/* Q57TAJ106: the same scene for the 106 BPM track (owner 2026-11-03 12:07): time scaled so each 0.418 s beat lasts 0.566 s */
const TS106 = 0.418 / 0.56606;
registerRoot(() => <><Composition id="Q57TAJ" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />
	<Composition id="Q57TAJ106" component={Scene} defaultProps={{ts: TS106}} durationInFrames={Math.round(2 * SHOT * FPS / TS106)} fps={FPS} width={W} height={H} /></>);
