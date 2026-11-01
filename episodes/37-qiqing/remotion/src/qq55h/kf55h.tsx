import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Subs, Stamp, Seal, SANS, KAI, Theme} from '../qq50/kit50';
import {Zun, lookAt, ZunLight, V3, Cam, proj, ZUN} from './zun55h';
/* ep55 · 何尊 — the four key frames (the ep54 / 马首 family: flat-vector 2.5D layered sets, one warm key, people as rim-lit
   warm-black silhouettes at adult proportions). The 尊 is the same model in every frame, at the same screen place (base centre
   x 960, y ≈ 890; ≈ 480 px tall) so the cuts between frames match; only frame 3 goes inside it. */
const W = 1920, H = 1080;
const f1 = (v: number) => v.toFixed(1);
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
type P = [number, number];
const pth = (pts: P[], close = true) => 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L') + (close ? 'Z' : '');
/** smooth closed / open curve through points (Catmull-Rom → cubic) */
const sm = (pts: P[], closed = true) => { const n = pts.length, g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`; }
	return d + (closed ? ' Z' : ''); };

/* ============================== the hero camera ============================== */
export const HERO = {x: 960, y: 650, h: 480, D: 300};
export const heroCam = (az = 0, el = 8, h = HERO.h, D = HERO.D): Cam => { const a = az * Math.PI / 180, e = el * Math.PI / 180;
	return lookAt([D * Math.cos(e) * Math.cos(a), D * Math.cos(e) * Math.sin(a), 19.4 + D * Math.sin(e)], [0, 0, 19.4], h * D / ZUN.H, HERO.x, HERO.y); };

/* ============================== people: rim-lit warm-black silhouettes ============================== */
type Kind = 'worker' | 'zhou' | 'visitor';
type Fig = {kind: Kind; lean?: number; stride?: number; hN: P; hF: P; head?: number; flip?: boolean};
const tube = (a: P, b: P, wa: number, wb: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	return sm([[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] + dx / L * wb * 0.9, b[1] + dy / L * wb * 0.9], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa], [a[0] - dx / L * wa * 0.8, a[1] - dy / L * wa * 0.8]]); };
const ik = (a: P, b: P, l1: number, l2: number, down = 1): P => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-3, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), th = Math.atan2(dy, dx);
	const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) * down; return [a[0] + l1 * Math.cos(th + al), a[1] + l1 * Math.sin(th + al)]; };
/** a standing adult, units cm, feet at y = 0, facing +x, about 170 cm (7.4 heads) */
const FigPaths: React.FC<{f: Fig}> = ({f}) => { const lean = (f.lean ?? 0) * Math.PI / 180, st = f.stride ?? 0.15;
	const hip: P = [0, -92], rot = (p: P): P => { const x = p[0] - hip[0], y = p[1] - hip[1]; return [hip[0] + x * Math.cos(lean) - y * Math.sin(lean), hip[1] + x * Math.sin(lean) + y * Math.cos(lean)]; };
	const sh = rot([2, -142]), nk = rot([3, -148]), hd = rot([4, -160]);
	const kneeN: P = [10 * st + 2, -48], footN: P = [22 * st + 6, -4], kneeF: P = [-8 * st, -48], footF: P = [-20 * st, -4];
	const eN = ik(sh, f.hN, 30, 28, -1), eF = ik(rot([0, -141]), f.hF, 30, 28, -1);
	const wide = f.kind === 'worker' ? 1.12 : 1;
	const torso = sm([rot([-12 * wide, -140]), rot([-13 * wide, -118]), rot([-12, -96]), rot([-11, -86]), rot([12, -86]), rot([13, -98]), rot([14 * wide, -122]), rot([12 * wide, -140]), rot([4, -146])]);
	const legs = <>{[[kneeF, footF], [kneeN, footN]].map(([k, ft], i) => <g key={i}><path d={tube(hip, k as P, 8.5, 6.5)} /><path d={tube(k as P, ft as P, 6.4, 4.8)} />
		<path d={sm([[ft[0] - 6, ft[1] - 4], [ft[0] + 14, ft[1] - 3], [ft[0] + 16, ft[1] + 3], [ft[0] - 7, ft[1] + 4]])} /></g>)}</>;
	const head = <path d={sm([[hd[0] - 10, hd[1] - 2], [hd[0] - 7, hd[1] - 12], [hd[0] + 3, hd[1] - 14], [hd[0] + 10, hd[1] - 7], [hd[0] + 12, hd[1] + 1], [hd[0] + 9, hd[1] + 9], [hd[0] + 2, hd[1] + 12], [hd[0] - 7, hd[1] + 8]])} />;
	const arm = (s: P, e: P, h: P, k: number) => <g key={k}><path d={tube(s, e, 6, 5)} /><path d={tube(e, h, 5, 4.2)} /><circle cx={h[0]} cy={h[1]} r={4.6} /></g>;
	let dress: React.ReactNode = null, hat: React.ReactNode = null;
	if (f.kind === 'worker') {   /* 1960s: a cloth cap with a short brim, a work jacket over the hips */
		hat = <path d={sm([[hd[0] - 11, hd[1] - 4], [hd[0] - 9, hd[1] - 14], [hd[0] + 3, hd[1] - 17], [hd[0] + 12, hd[1] - 11], [hd[0] + 21, hd[1] - 7], [hd[0] + 20, hd[1] - 5], [hd[0] + 9, hd[1] - 5]])} />;
		dress = <path d={sm([rot([-14, -138]), rot([-15, -100]), rot([-14, -80]), rot([15, -80]), rot([15, -100]), rot([14, -138])])} />; }
	else if (f.kind === 'zhou') {   /* 西周 craftsman: hair in a topknot under a cloth band, a knee-length 短衣 belted, leg wraps */
		hat = <><path d={sm([[hd[0] - 3, hd[1] - 12], [hd[0] - 1, hd[1] - 20], [hd[0] + 5, hd[1] - 21], [hd[0] + 7, hd[1] - 14]])} /><path d={pth([[hd[0] - 10, hd[1] - 6], [hd[0] + 11, hd[1] - 8], [hd[0] + 11, hd[1] - 5], [hd[0] - 10, hd[1] - 3]])} /></>;
		dress = <path d={sm([rot([-13, -138]), rot([-15, -96]), [-20, -52], [-4, -50], [18, -52], rot([15, -96]), rot([13, -138])])} />; }
	else {   /* a museum visitor: a coat to the knee */
		dress = <path d={sm([rot([-13, -138]), rot([-15, -100]), [-17, -56], [16, -56], rot([15, -100]), rot([13, -138])])} />; }
	return <g>{legs}<path d={tube(nk, sh, 5, 6)} />{arm(rot([0, -141]), eF, f.hF, 0)}{dress}<path d={torso} />{head}{hat}{arm(sh, eN, f.hN, 1)}</g>; };
/** a silhouette at screen (x, y feet), k px per cm, drawn in warm black and rimmed by a key from (lx, ly) */
const Person: React.FC<{f: Fig; x: number; y: number; k: number; id: string; rim: string; lx: number; ly: number; fill?: string; o?: number}> = ({f, x, y, k, id, rim, lx, ly, fill = '#120C09', o = 1}) => <g opacity={o}>
	<defs><filter id={id} x="-30%" y="-10%" width="160%" height="120%" colorInterpolationFilters="sRGB">
		<feOffset in="SourceAlpha" dx={-lx * 3.2} dy={-ly * 3.2} result="o" /><feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
		<feGaussianBlur in="band" stdDeviation={0.9} result="bb" /><feFlood floodColor={rim} result="fc" /><feComposite in="fc" in2="bb" operator="in" result="r" />
		<feComposite in="r" in2="SourceAlpha" operator="in" result="r2" /><feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="r2" /></feMerge></filter></defs>
	<g filter={`url(#${id})`}><g transform={`translate(${x},${y}) scale(${f.flip ? -k : k},${k})`} fill={fill}><FigPaths f={f} /></g></g></g>;

/* ============================== overlay ============================== */
const thK: Theme = {ink: '#FFF6E6', key: '#E8BC66', rule: '#E8BC66', dim: 0.85, pool: 'rgba(14,8,5,A)', poolA: 0.42, halo: '0 0 2px rgba(14,8,5,0.95), 0 2px 8px rgba(14,8,5,0.8), 0 2px 22px rgba(14,8,5,0.6)'};
type Card = {rows: string[]; y: string; place: string; note: string; age: string; label: string};
export const CARDS: Card[] = [
	{rows: ['最早写着“中国”两个字的国宝，', '差点被当废铜卖了[30块钱]。'], y: '1965', place: '宝鸡', note: '废品收购站', age: '约3000', label: 'KF1 · 钩子 · 1965 废品收购站'},
	{rows: ['约三千年前，', '你在火里出生。'], y: '西周', place: '成周', note: '铸造', age: '0', label: 'KF2 · 约三千年前 · 铸造'},
	{rows: ['1975年，你肚子里的122个字，', '第一次被人看见。'], y: '1975', place: '宝鸡', note: '清理铭文', age: '约3000', label: 'KF3 · 1975 · 铭文现身（最强落点）'},
	{rows: ['宅兹中国。'], y: '今', place: '宝鸡', note: '宝鸡青铜器博物院', age: '约3000', label: 'KF4 · 今 · 博物院'},
];
export const Overlay: React.FC<{i: number}> = ({i}) => { const c = CARDS[i], approx = c.age.startsWith('约');
	return <>
		<Subs rows={c.rows.map((s) => ({s}))} th={thK} />
		<Stamp y={c.y} place={c.place} note={c.note} th={thK} />
		<div style={{position: 'absolute', left: 150, bottom: 70, color: '#FFF6E6', fontFamily: SANS, textShadow: thK.halo, display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap'}}>
			<span style={{fontSize: 34, fontWeight: 700}}>你</span>{approx && <span style={{fontSize: 34, fontWeight: 700}}>约</span>}
			<span style={{fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{approx ? c.age.slice(1) : c.age}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>
		<Seal />
		<div style={{position: 'absolute', left: 0, top: 0, height: 36, padding: '0 14px', background: 'rgba(0,0,0,0.7)', color: '#F2E6CC', fontFamily: SANS, fontWeight: 700, fontSize: 20, lineHeight: '36px'}}>{c.label}</div>
	</>; };

/* ============================== shared bits ============================== */
const Haze: React.FC<{y: number; h: number; c: string; o: number; id: string}> = ({y, h, c, o, id}) => <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0" stopColor={c} stopOpacity={0} /><stop offset="0.5" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
	<rect x={0} y={y - h / 2} width={W} height={h} fill={`url(#${id})`} /></>;
const Vig: React.FC<{id: string; a?: number}> = ({id, a = 0.7}) => <><defs><radialGradient id={id} cx="50%" cy="55%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={a} /></radialGradient></defs>
	<rect width={W} height={H} fill={`url(#${id})`} /></>;
const Glow: React.FC<{x: number; y: number; r: number; c: string; o: number; id: string; sy?: number}> = ({x, y, r, c, o, id, sy = 1}) => <><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="0.35" stopColor={c} stopOpacity={o * 0.45} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs>
	<ellipse cx={x} cy={y} rx={r} ry={r * sy} fill={`url(#${id})`} /></>;
const smoke = (x: number, y: number, h: number, w: number, seed: number) => { const pts: P[] = []; const n = 9;
	for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + Math.sin(u * 5 + seed) * w * 0.4 + u * w * 0.8, y - u * h]); }
	return pts; };

/** a soft blurred plume (smoke / steam) rising from (x, y) */
const Plume: React.FC<{x: number; y: number; h: number; w: number; c: string; o: number; id: string; seed?: number}> = ({x, y, h, w, c, o, id, seed = 0}) => <g>
	<defs><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={w * 0.22} /></filter></defs>
	<g filter={`url(#${id})`} fill={c}>{Array.from({length: 9}, (_, i) => { const u = i / 8; return <circle key={i} cx={x + Math.sin(u * 4 + seed) * w * 0.5 + u * w * 0.6} cy={y - u * h} r={w * (0.25 + 0.6 * u)} opacity={o * (1 - 0.8 * u)} />; })}</g></g>;

/* ============================== KF1 · 1965 · the scrap yard ============================== */
const L1: ZunLight = {dir: [0.25, 0.78, 0.5], col: '#FFC27A', k: 1.35, amb: 0.36, ambCol: '#6E7A8E', spec: 0.5, shin: 14, rim: {dir: [-0.6, 0.55, 0.3], col: '#FFB46A', k: 0.55}};
export const KF1: React.FC = () => { const cam = heroCam(0, 7);
	/* scrap piles: pots, pipes, wire coils, as flat shapes with a sun rim on the right edges */
	const pile = (x: number, y: number, w: number, h: number, seed: number, dark: string, rimC: string, k: number) => { const pts: P[] = [];
		for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([x - w / 2 + u * w, y - h * Math.pow(Math.sin(Math.PI * u), 0.8) * (0.75 + 0.35 * rnd(i + seed, 3))]); }
		const top = sm([...pts, [x + w / 2, y + 4], [x - w / 2, y + 4]]);
		const bits = Array.from({length: Math.round(w / 28)}, (_, i) => { const u = rnd(i, seed + 1), xx = x - w / 2 + u * w, hh = h * Math.pow(Math.sin(Math.PI * u), 0.8) * 0.8, yy = y - hh * (0.3 + 0.6 * rnd(i, seed + 2)), t = Math.floor(rnd(i, seed + 4) * 4), s = (10 + rnd(i, seed + 5) * 16) * k;
			if (t === 0) return <g key={i}><ellipse cx={xx} cy={yy} rx={s} ry={s * 0.7} fill={dark} stroke={rimC} strokeWidth={1.6} strokeOpacity={0.55} /><ellipse cx={xx - s * 0.1} cy={yy - s * 0.25} rx={s * 0.55} ry={s * 0.22} fill="#000" opacity={0.35} /></g>;   // a pot
			if (t === 1) return <g key={i}><path d={`M${f1(xx - s * 2)},${f1(yy + s * 0.3)} L${f1(xx + s * 2)},${f1(yy - s * 0.6)}`} stroke={dark} strokeWidth={s * 0.42} strokeLinecap="round" /><path d={`M${f1(xx - s * 2)},${f1(yy + s * 0.1)} L${f1(xx + s * 2)},${f1(yy - s * 0.8)}`} stroke={rimC} strokeWidth={1.4} strokeOpacity={0.5} /></g>;   // a pipe
			if (t === 2) return <g key={i}>{[0, 1, 2].map((j) => <ellipse key={j} cx={xx + j * 3} cy={yy - j * 2} rx={s * 0.9} ry={s * 0.45} fill="none" stroke={j === 2 ? rimC : dark} strokeWidth={2.2} strokeOpacity={j === 2 ? 0.5 : 1} />)}</g>;   // a wire coil
			return <path key={i} d={pth([[xx - s, yy + s * 0.4], [xx - s * 0.6, yy - s * 0.5], [xx + s * 0.9, yy - s * 0.3], [xx + s, yy + s * 0.4]])} fill={dark} stroke={rimC} strokeWidth={1.4} strokeOpacity={0.45} />; });
		return <g><path d={top} fill={dark} /><path d={sm(pts, false)} fill="none" stroke={rimC} strokeWidth={2} strokeOpacity={0.5} />{bits}</g>; };
	/* the platform scale (磅秤): a low steel deck, a column at the back, the beam and poise on top */
	const deck = {x: 960, y: 893, w: 400, d: 46, h: 40};
	const beamY = 520, colX = 1205;
	const sc = cam;
	const beak = proj(sc, [0, -18.6, 34.3]);   // the left beak tip (screen), where the tag hangs
	void beak;
	return <AbsoluteFill style={{background: '#0E0B0A'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="k1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A1E2A" /><stop offset="0.45" stopColor="#3A3236" /><stop offset="0.72" stopColor="#8A5A3A" /><stop offset="1" stopColor="#3A2618" /></linearGradient>
				<linearGradient id="k1gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2119" /><stop offset="1" stopColor="#120D0A" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#k1sky)" />
			<Glow x={1640} y={640} r={520} c="#FFB060" o={0.55} id="k1sun" sy={0.55} />
			<circle cx={1640} cy={650} r={46} fill="#FFD08A" opacity={0.85} />
			{/* far: the 秦岭 ridges over 宝鸡 */}
			<path d={sm([[-40, 700], [160, 610], [380, 640], [560, 585], [760, 625], [980, 570], [1200, 615], [1420, 580], [1660, 620], [1960, 590], [1960, 760], [-40, 760]])} fill="#4A3A38" opacity={0.85} />
			<path d={sm([[-40, 720], [240, 668], [520, 690], [820, 650], [1100, 682], [1400, 655], [1700, 680], [1960, 660], [1960, 780], [-40, 780]])} fill="#3A2C28" />
			<Haze y={700} h={120} c="#C8885A" o={0.35} id="k1hz" />
			{/* mid: the yard wall, the shed with its painted sign, a chimney */}
			<rect x={-20} y={650} width={1960} height={120} fill="#2A1E19" />
			{Array.from({length: 40}, (_, i) => <path key={i} d={`M${i * 50 - 20},650 L${i * 50 - 20},770`} stroke="#1C1411" strokeWidth={2} />)}
			<path d={pth([[1240, 560], [1760, 540], [1780, 580], [1780, 780], [1240, 780]])} fill="#241A16" />
			<path d={pth([[1220, 566], [1500, 520], [1800, 548], [1800, 562], [1500, 534], [1220, 580]])} fill="#1A1310" />
			<rect x={1460} y={596} width={300} height={58} fill="#3A2A22" stroke="#5A4232" strokeWidth={2} />
			<text x={1610} y={638} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={40} fill="#C9B79A" opacity={0.75} letterSpacing={6}>废品收购站</text>
			<rect x={380} y={430} width={34} height={300} fill="#1E1612" />
			<Plume x={397} y={420} h={300} w={120} c="#7A6A62" o={0.35} id="k1smk" />
			{/* the small furnace, glowing, back left */}
			<path d={sm([[300, 800], [306, 700], [340, 676], [420, 676], [452, 700], [458, 800]])} fill="#2A1C16" />
			<path d={pth([[350, 760], [350, 728], [408, 728], [408, 760]])} fill="#FF8A34" />
			<Glow x={380} y={745} r={130} c="#FF8A34" o={0.55} id="k1fur" sy={0.7} />
			{/* scrap piles */}
			{pile(240, 870, 520, 180, 3, '#1C1512', '#E89A5A', 1.2)}
			{pile(1620, 880, 640, 210, 7, '#1C1512', '#FFB070', 1.3)}
			{pile(660, 800, 300, 90, 11, '#231A15', '#D88A50', 0.9)}
			<rect x={0} y={880} width={W} height={200} fill="url(#k1gnd)" />
			<Glow x={1080} y={920} r={600} c="#FFB060" o={0.18} id="k1gp" sy={0.18} />
			{/* the platform scale */}
			<path d={pth([[deck.x - deck.w / 2, deck.y], [deck.x + deck.w / 2, deck.y], [deck.x + deck.w / 2 + 24, deck.y - deck.d * 0.3], [deck.x - deck.w / 2 + 24, deck.y - deck.d * 0.3]])} fill="#3A3330" />
			<path d={pth([[deck.x - deck.w / 2, deck.y], [deck.x + deck.w / 2, deck.y], [deck.x + deck.w / 2, deck.y + deck.h * 0.55], [deck.x - deck.w / 2, deck.y + deck.h * 0.55]])} fill="#1E1A18" />
			<path d={`M${deck.x - deck.w / 2},${deck.y} L${deck.x + deck.w / 2},${deck.y}`} stroke="#C99A6A" strokeWidth={2} strokeOpacity={0.6} />
			{[deck.x - deck.w / 2 + 18, deck.x + deck.w / 2 - 22].map((x, i) => <rect key={i} x={x} y={deck.y + deck.h * 0.55} width={14} height={14} fill="#121010" />)}
			<rect x={colX} y={beamY} width={20} height={deck.y - beamY - 8} fill="#2A2422" /><path d={`M${colX + 20},${beamY} L${colX + 20},${deck.y - 8}`} stroke="#E8A868" strokeWidth={2} strokeOpacity={0.6} />
			<rect x={colX - 210} y={beamY - 12} width={250} height={14} fill="#2E2826" /><path d={`M${colX - 210},${beamY - 12} L${colX + 40},${beamY - 12}`} stroke="#F0B070" strokeWidth={1.6} strokeOpacity={0.7} />
			{Array.from({length: 13}, (_, i) => <path key={i} d={`M${colX - 200 + i * 18},${beamY - 12} L${colX - 200 + i * 18},${beamY - 5}`} stroke="#C9A27A" strokeWidth={1.2} opacity={0.6} />)}
			<rect x={colX - 120} y={beamY - 22} width={22} height={30} rx={3} fill="#3A3230" stroke="#E8A868" strokeWidth={1.4} strokeOpacity={0.5} />
			<path d={`M${colX - 210},${beamY - 5} L${colX - 222},${beamY + 40}`} stroke="#2A2422" strokeWidth={4} /><circle cx={colX - 223} cy={beamY + 48} r={9} fill="#2A2422" />
			{/* the worker, at the beam, reading the weight */}
			<Person id="k1w" f={{kind: 'worker', lean: 4, stride: 0.12, hN: [44, -128], hF: [6, -84], flip: true}} x={1330} y={900} k={2.85} rim="#FFB874" lx={-1} ly={0.2} />
			{/* the 尊 */}
			<Zun cam={cam} light={L1} id="z1" patina={0.95} shadow />
		</svg>
		<Tag30 cam={cam} />
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="k1v" a={0.55} /></svg>
		<Overlay i={0} />
	</AbsoluteFill>; };
/** the paper tag 「30元」 tied to the left beak with a string */
const Tag30: React.FC<{cam: Cam}> = ({cam}) => { const [bx, by] = proj(cam, [0, -18.4, 34.1]), tx = bx - 120, ty = by + 120;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<path d={`M${f1(bx)},${f1(by)} Q${f1(bx - 40)},${f1(by + 70)} ${f1(tx + 70)},${f1(ty + 4)}`} fill="none" stroke="#D8C8A6" strokeWidth={2.4} />
		<g transform={`translate(${f1(tx)},${f1(ty)}) rotate(-8)`}>
			<path d="M0,6 L18,0 L150,0 L150,78 L0,78 Z" fill="#000" opacity={0.45} transform="translate(6,8)" />
			<path d="M0,10 L20,0 L148,0 L148,76 L0,76 Z" fill="#E6D8B8" />
			<path d="M148,0 L148,76 L0,76" fill="none" stroke="#FFE2B0" strokeWidth={2} opacity={0.8} />
			<circle cx={16} cy={14} r={5} fill="#3A2E24" />
			<text x={84} y={58} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={50} fill="#9E2A1C">30元</text>
		</g></svg>; };

/* ============================== KF2 · about 3,000 years ago · the casting ============================== */
const L2: ZunLight = {dir: [0.35, -0.8, 0.45], col: '#FF9A4A', k: 1.2, amb: 0.25, ambCol: '#5A3A30', spec: 0.6, shin: 12};
export const KF2: React.FC = () => { const cam = heroCam(0, 7);
	/* a broken piece of the outer mould: a curved terracotta shell, the inner face carrying the negative of the decoration */
	const shard = (x: number, y: number, w: number, h: number, a: number, k: number) => <g key={k} transform={`translate(${x},${y}) rotate(${a})`}>
		<path d={pth([[-w / 2, 0], [-w * 0.46, -h * 0.5], [-w * 0.3, -h * 0.86], [-w * 0.05, -h], [w * 0.12, -h * 0.9], [w * 0.38, -h * 0.76], [w / 2, 0], [w * 0.36, -h * 0.18], [0, -h * 0.42], [-w * 0.36, -h * 0.18]])} fill="#4E3022" />
		<path d={sm([[-w * 0.36, -h * 0.18], [0, -h * 0.42], [w * 0.36, -h * 0.18], [w * 0.2, -h * 0.1], [0, -h * 0.28], [-w * 0.2, -h * 0.1]])} fill="#3A2216" />
		{[-0.2, 0, 0.2].map((u, i) => <circle key={i} cx={u * w} cy={-h * 0.27} r={2.5} fill="#1E120C" />)}
		<path d={sm([[-w / 2, 0], [-w * 0.42, -h * 0.7], [0, -h], [w * 0.42, -h * 0.7]], false)} fill="none" stroke="#FFB070" strokeWidth={2} strokeOpacity={0.8} /></g>;
	return <AbsoluteFill style={{background: '#070505'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="k2bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0808" /><stop offset="0.6" stopColor="#1C120E" /><stop offset="1" stopColor="#0C0807" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#k2bg)" />
			{/* the workshop: rammed-earth wall in layers, a thatched eave, posts */}
			<rect x={0} y={420} width={W} height={420} fill="#21160F" />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M0,${440 + i * 44} L${W},${436 + i * 44}`} stroke="#160E0A" strokeWidth={3} />)}
			<path d={pth([[-20, 300], [W + 20, 330], [W + 20, 420], [-20, 420]])} fill="#120C09" />
			{Array.from({length: 70}, (_, i) => <path key={i} d={`M${i * 28},${330 + i * 0.4} l-6,${88 + rnd(i, 2) * 14}`} stroke="#2A1C14" strokeWidth={3} />)}
			{[150, 760, 1180, 1790].map((x, i) => <rect key={i} x={x} y={330} width={30} height={520} fill="#140D09" />)}
			{/* the furnace far left, glowing through its mouth */}
			<path d={sm([[60, 860], [70, 640], [150, 560], [260, 560], [330, 640], [340, 860]])} fill="#2A1A12" />
			<path d={sm([[150, 820], [150, 740], [200, 712], [250, 740], [250, 820]])} fill="#FF7A2A" />
			<Glow x={200} y={760} r={260} c="#FF7A2A" o={0.5} id="k2fur" />
			<Plume x={200} y={560} h={280} w={130} c="#5A4038" o={0.4} id="k2smk" />
			{/* the pour, left: a mould stack bound with cord; two men tip the crucible (将军盔) on a carrying pole, bronze runs into the gate */}
			<g>
				<path d={sm([[470, 880], [466, 742], [490, 708], [590, 708], [614, 742], [610, 880]])} fill="#5A3A28" />
				{[752, 792, 832].map((y, i) => <path key={i} d={`M468,${y} L612,${y}`} stroke="#2E1C12" strokeWidth={6} />)}
				<path d={sm([[490, 710], [540, 694], [590, 710]])} fill="#2A1A10" />
				<path d={sm([[525, 700], [540, 690], [556, 700], [552, 714], [530, 714]])} fill="#FFD27A" />
				<g transform="translate(600,600) rotate(-38)"><path d={sm([[-46, -40], [46, -40], [40, 10], [0, 60], [-40, 10]])} fill="#3A281C" /><path d="M-46,-40 L46,-40" stroke="#FFB060" strokeWidth={3} strokeOpacity={0.7} /></g>
				<path d="M560,628 C548,650 542,672 540,694" stroke="#FFE6A8" strokeWidth={10} strokeLinecap="round" fill="none" />
				<Glow x={545} y={690} r={170} c="#FFB050" o={0.75} id="k2pour" />
				<path d="M470,560 L700,610" stroke="#1A100B" strokeWidth={8} strokeLinecap="round" />
				<Person id="k2a" f={{kind: 'zhou', lean: 16, stride: 0.4, hN: [30, -136], hF: [24, -128]}} x={360} y={880} k={2.55} rim="#FFB060" lx={1} ly={0.1} />
				<Person id="k2b" f={{kind: 'zhou', lean: 18, stride: 0.35, hN: [34, -112], hF: [28, -104], flip: true}} x={760} y={884} k={2.45} rim="#FFB060" lx={-1} ly={0.1} />
			</g>
			<rect x={0} y={860} width={W} height={220} fill="#120B08" />
			<Glow x={960} y={900} r={520} c="#FF8A3A" o={0.42} id="k2pool" sy={0.22} />
			{/* the broken mould (陶范) around the fresh vessel */}
			{shard(745, 925, 150, 64, -10, 0)}{shard(1185, 928, 160, 70, 9, 1)}{shard(1320, 975, 120, 50, 24, 2)}{shard(620, 975, 120, 50, -26, 3)}
			{/* steam over the hot vessel */}
			<Plume x={900} y={420} h={300} w={150} c="#E8C8A8" o={0.16} id="k2st1" seed={1} /><Plume x={1010} y={430} h={260} w={130} c="#E8C8A8" o={0.13} id="k2st2" seed={3} />
			<Glow x={960} y={640} r={430} c="#FFB050" o={0.42} id="k2halo" />
			<Zun cam={cam} light={L2} id="z2" patina={0.3} molten={0.9} shadow={false} />
			{/* the master caster, right, with a long pick, rim-lit by the vessel */}
			<Person id="k2c" f={{kind: 'zhou', lean: -4, stride: 0.2, hN: [-36, -112], hF: [-30, -100], flip: true}} x={1450} y={905} k={3.05} rim="#FFC070" lx={-1} ly={0.15} />
			<path d="M1345,560 L1300,905" stroke="#1A100B" strokeWidth={7} strokeLinecap="round" />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="k2v" a={0.6} /></svg>
		<Overlay i={1} />
	</AbsoluteFill>; };

/* ============================== KF3 · 1975 · inside the mouth, the inscription appears ============================== */
const L3: ZunLight = {dir: [0.45, 0.25, 0.86], col: '#FFD6A0', k: 1.2, amb: 0.26, ambCol: '#4A5A5E', spec: 0.7, shin: 18, inside: 0.7};
export const KF3: React.FC = () => { const a = Math.PI / 4, off = 7, zc = 38.8 + 50;
	const cam = lookAt([-off * Math.cos(a), -off * Math.sin(a), zc], [0, 0, ZUN.FLOOR], 3900, 990, 600);
	const [lx, ly] = proj(cam, [Math.cos(a - Math.PI / 2) * 30 + Math.cos(a) * 26, Math.sin(a - Math.PI / 2) * 30 + Math.sin(a) * 26, 70]);
	void lx; void ly;
	return <AbsoluteFill style={{background: '#0A0807'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="k3bench" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A1C14" /><stop offset="1" stopColor="#120C09" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#k3bench)" />
			{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-200 + i * 170},0 L${-420 + i * 170},${H}`} stroke="#0C0806" strokeWidth={3} opacity={0.6} />)}
			<Glow x={1700} y={180} r={700} c="#FFC880" o={0.32} id="k3lamp" />
			<Zun cam={cam} light={L3} id="z3" patina={0.75} reveal={0.66} glow={1} shadow={false} />
			{/* the lamp's beam into the mouth, and dust in it */}
			<defs><linearGradient id="k3beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2B0" stopOpacity={0.22} /><stop offset="1" stopColor="#FFE2B0" stopOpacity={0} /></linearGradient></defs>
			<path d="M1920,-40 L1380,-40 L860,760 L1260,820 Z" fill="url(#k3beam)" />
			{Array.from({length: 40}, (_, i) => { const u = rnd(i, 21), v = rnd(i, 22); return <circle key={i} cx={1000 + u * 640 - v * 260} cy={60 + v * 700} r={1 + rnd(i, 23) * 2.2} fill="#FFE8C0" opacity={0.25 + 0.4 * rnd(i, 24)} />; })}
			{/* a long soft brush reaching in from the right rim */}
			<path d="M1700,980 L1240,700" stroke="#1A120C" strokeWidth={16} strokeLinecap="round" />
			<path d="M1700,980 L1240,700" stroke="#C8925A" strokeWidth={2} strokeOpacity={0.5} transform="translate(0,-7)" />
			<path d={sm([[1250, 706], [1196, 676], [1168, 664], [1176, 650], [1212, 664], [1262, 694]])} fill="#3A2C20" />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="k3v" a={0.62} /></svg>
		<Overlay i={2} />
	</AbsoluteFill>; };

/* ============================== KF4 · today · the museum ============================== */
const L4: ZunLight = {dir: [0.55, 0.3, 0.78], col: '#FFE6C4', k: 2.1, amb: 0.36, ambCol: '#5A6670', spec: 1.9, shin: 14, rim: {dir: [-0.8, -0.3, 0.5], col: '#CFE0F0', k: 0.9}};
export const KF4: React.FC = () => { const cam = heroCam(10, 6);
	return <AbsoluteFill style={{background: '#060606'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="k4cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE8C8" stopOpacity={0.16} /><stop offset="1" stopColor="#FFE8C8" stopOpacity={0.02} /></linearGradient>
				<linearGradient id="k4plinth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2624" /><stop offset="1" stopColor="#0C0B0A" /></linearGradient></defs>
			<rect width={W} height={H} fill="#070707" />
			{/* the spotlight cone, the dark stage */}
			<path d="M890,-20 L1030,-20 L1330,900 L590,900 Z" fill="url(#k4cone)" />
			{/* the visitor, reflected faintly in the glass (left pane) */}

			{/* the plinth */}
			<path d={pth([[700, 895], [1220, 895], [1250, 915], [670, 915]])} fill="#3A3430" />
			<rect x={670} y={915} width={580} height={170} fill="url(#k4plinth)" />
			<Glow x={960} y={900} r={300} c="#FFE0B8" o={0.35} id="k4pool" sy={0.12} />
			<Zun cam={cam} light={L4} id="z4" patina={0.04} shadow />
			{/* the glass case: thin edges, a top, a long soft reflection */}
			<path d="M640,250 L640,915 M1280,250 L1280,915 M640,250 L1280,250" stroke="#B8C8D4" strokeWidth={2} strokeOpacity={0.35} fill="none" />
			<path d="M690,250 L760,250 L700,915 L640,915 Z" fill="#D8E6F0" opacity={0.05} />
			<path d="M1180,250 L1220,250 L1180,915 L1150,915 Z" fill="#D8E6F0" opacity={0.04} />
			{/* a visitor's reflection in the left pane: faint, cool, cut by the glass */}
			<defs><clipPath id="k4glass"><rect x={640} y={250} width={260} height={665} /></clipPath></defs>
			<g clipPath="url(#k4glass)"><Person id="k4vis" f={{kind: 'visitor', lean: 2, stride: 0.05, hN: [8, -84], hF: [2, -84]}} x={705} y={1060} k={3.9} rim="#B8CCE0" lx={1} ly={0.3} fill="#8EA2B4" o={0.08} /></g>
			{/* the label */}
			<rect x={1300} y={930} width={150} height={52} fill="#1C1A18" stroke="#3A3632" />
			<text x={1375} y={963} textAnchor="middle" fontFamily={KAI} fontSize={22} fill="#B8A88A">何尊 · 西周</text>
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="k4v" a={0.7} /></svg>
		<Overlay i={3} />
	</AbsoluteFill>; };
export const KFS = [KF1, KF2, KF3, KF4];
void ([] as V3[]);
