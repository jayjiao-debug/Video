import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Sequence} from 'remotion';
import {JUNO} from '../brand/identity';
import {EndCard} from '../brand/Brand';
import FACE from './face_pts32.json';
import lines from './lines32.json';

/* ep32 《你的脸是密码》 — look A "点阵": deep blue night, a friendly round face made of projector dots (soft cyan,
   coloured by depth), warm yellow for numbers and answers. Music: the owner's slowed track, re-sequenced so the
   hardest drop meets the title (bar 7), the intro's lift meets 一百万分之一 (bar 35) and the drop again meets the
   answer (bar 51). Bar = 2.025 s; every scene change and every camera move starts on a downbeat. */
const FPS = 30, W = 1920, H = 1080;
const BAR = 2.025, bt = (k: number) => k * BAR;
const END = 55 * BAR, CARD = END - 2.0;
const C = {bg: '#0b1630', bg2: '#0e1d3d', cy: '#5ce1e6', yl: '#ffd166', ink: '#eaf4ff', dim: 'rgba(234,244,255,0.62)', pink: '#ff9db0', red: '#ff7a7a', paper: '#fdf6e8', toon: '#33405a', deep: '#16406e', mid: '#2f8fd0'};
const SANS = '"Noto Sans CJK SC", sans-serif';

const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const r = (t: number, a: number, b: number) => sm(lin(t, a, b));
const ease = (t: number, a: number, d: number) => { const u = lin(t, a, a + d); return 1 - Math.pow(1 - u, 3); };   // fast in, soft out
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => (fi <= 0 ? (t >= a ? 1 : 0) : r(t, a, a + fi)) * (1 - r(t, b - fo, b));
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpC = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], cl(k)))).join(',')})`; };
const depthC = (z: number) => (z < 0.33 ? lerpC(C.deep, C.mid, z / 0.33) : z < 0.7 ? lerpC(C.mid, C.cy, (z - 0.33) / 0.37) : lerpC(C.cy, '#e6fdff', (z - 0.7) / 0.3));
const beatHit = (t: number, k0: number, k1: number) => { if (t < bt(k0) || t > bt(k1)) return 0; const u = ((t - bt(k0)) % (BAR / 4)) / (BAR / 4); return Math.exp(-u * 6); };

const Lab: React.FC<{x: number; y: number; t: string; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; o?: number; w?: number; ls?: number}> = ({x, y, t, s = 52, c = C.ink, a = 'middle', o = 1, w = 800, ls = 0.02}) =>
	o > 0.001 ? <text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: SANS, fontWeight: w, fontSize: s, letterSpacing: `${ls}em`}} fill={c}>{t}</text> : null;

// ------------------------------------------------------------------ the face (identity-free, friendly)
const PTS = (FACE as any).pts as number[][];
type Pr = {x: number; y: number; z: number; d: number; tag: number};
const project = (cx: number, cy: number, s: number, th: number, flat = 0): Pr[] => {
	const c = Math.cos(th), sn = Math.sin(th);
	return PTS.map(([x, y, z0, tag]) => { const z = mix(z0, 0.5, flat); const X = x * c + (z - 0.5) * 0.9 * sn, D = -x * sn + (z - 0.5) * 0.9 * c; return {x: cx + X * s, y: cy - y * s, z, d: D, tag}; }).sort((a, b) => a.d - b.d);
};
const DotFace: React.FC<{cx: number; cy: number; s: number; th?: number; flat?: number; t: number; appear?: number; rain?: number; o?: number; tint?: string; size?: number}> = ({cx, cy, s, th = 0, flat = 0, t, appear = 1, rain = -1, o = 1, tint, size = 1}) => {
	const P = project(cx, cy, s, th, flat);
	return (
		<g opacity={o}>
			{!tint && P.map((p, i) => {
				const k = rain >= 0 ? cl((rain - (i % 97) / 97 * 0.55 - ((p.y - (cy - s * 1.2)) / (s * 2.4)) * 0.35) / 0.25) : appear;
				if (k < 0.95 || i % 2) return null;
				return <circle key={'b' + i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={11 * size * (s / 300)} fill={depthC(p.z * 0.8)} opacity={0.22 * (k - 0.95) * 20} />;
			})}
			{P.map((p, i) => {
				const k = rain >= 0 ? cl((rain - (i % 97) / 97 * 0.55 - ((p.y - (cy - s * 1.2)) / (s * 2.4)) * 0.35) / 0.25) : appear;
				if (k <= 0.001) return null;
				const yy = mix(p.y - 260, p.y, sm(k));
				const fc = tint ?? (p.tag === 1 || p.tag === 2 ? C.yl : p.tag === 3 ? C.pink : depthC(p.z)), big = p.tag === 1 || p.tag === 2 ? 1.25 : 1;
				return <circle key={i} cx={p.x.toFixed(1)} cy={yy.toFixed(1)} r={(4.2 + 2.4 * p.z) * big * size * (s / 300)} fill={fc} opacity={k * (p.tag ? 0.95 : 0.5 + 0.5 * p.z)} />;
			})}
		</g>
	);
};
const Toon: React.FC<{cx: number; cy: number; s: number; col?: string; lw?: number; o?: number}> = ({cx, cy, s, col = C.toon, lw = 5, o = 1}) => {
	let smile = '';
	for (let i = 0; i <= 30; i++) { const x = -0.3 + (0.6 * i) / 30; smile += `${i ? 'L' : 'M'}${(cx + x * s).toFixed(1)} ${(cy - (-0.5 + 0.55 * x * x) * s).toFixed(1)} `; }
	return (
		<g opacity={o}>
			<ellipse cx={cx} cy={cy} rx={0.88 * s} ry={1.08 * s} fill="none" stroke={col} strokeWidth={lw} />
			{[-0.31, 0.31].map((e) => <circle key={e} cx={cx + e * s} cy={cy - 0.24 * s} r={0.07 * s} fill={col} />)}
			<path d={smile} fill="none" stroke={col} strokeWidth={lw} strokeLinecap="round" />
			<path d={`M${cx} ${cy + 0.02 * s} L${cx - 0.05 * s} ${cy + 0.16 * s}`} stroke={col} strokeWidth={lw * 0.8} strokeLinecap="round" />
			{[-0.45, 0.45].map((e) => <circle key={e} cx={cx + e * s} cy={cy + 0.2 * s} r={0.09 * s} fill={C.pink} opacity={0.6} />)}
		</g>
	);
};
const Photo: React.FC<{cx: number; cy: number; s: number; rot?: number; edge?: number; o?: number}> = ({cx, cy, s, rot = -4, edge = 0, o = 1}) => {
	const sx = Math.max(0.02, Math.cos((edge * Math.PI) / 2));
	return (
		<g opacity={o} transform={`translate(${cx} ${cy}) rotate(${rot * (1 - edge)}) scale(${sx} 1) translate(${-cx} ${-cy})`}>
			<rect x={cx - 1.25 * s} y={cy - 1.5 * s} width={2.5 * s} height={3 * s} rx={6} fill={C.paper} />
			<rect x={cx - 1.25 * s} y={cy - 1.5 * s} width={2.5 * s} height={3 * s} rx={6} fill="#000" opacity={0.35 * edge} />
			<Toon cx={cx} cy={cy - 0.05 * s} s={s * 0.95} lw={Math.max(3, s * 0.03)} />
		</g>
	);
};
const Phone: React.FC<{x: number; y: number; s?: number; open?: number; col?: string; glow?: number}> = ({x, y, s = 1, open = 0, col = C.cy, glow = 0}) => {
	const w = 300 * s, h = 560 * s, lc = open > 0.5 ? C.yl : col;
	return (
		<g>
			<rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={40 * s} fill={C.bg2} stroke={lc} strokeWidth={5 * s} />
			<rect x={x - 46 * s} y={y - h / 2 + 18 * s} width={92 * s} height={20 * s} rx={10 * s} fill={lc} />
			{glow > 0 && <circle cx={x} cy={y - h / 2 + 28 * s} r={40 * s * glow} fill={C.cy} opacity={0.35 * glow} filter="url(#soft)" />}
			<rect x={x - 36 * s} y={y - 20 * s} width={72 * s} height={58 * s} rx={9 * s} fill="none" stroke={lc} strokeWidth={5 * s} />
			<path d={`M${x - 24 * s} ${y - 20 * s} v${-22 * s} a${24 * s} ${24 * s} 0 0 1 ${48 * s} 0 v${(-1 + 1 * (1 - open)) * 0 + 22 * s * (1 - open) - 14 * s * open}`} fill="none" stroke={lc} strokeWidth={5 * s} transform={open > 0 ? `translate(${18 * s * open} ${-14 * s * open})` : undefined} />
		</g>
	);
};
const Defs = () => (
	<defs>
		<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
		<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
	</defs>
);
// a calm field of tiny projector dots, always drifting
const FIELD = (() => { const R = rng(32); return Array.from({length: 420}, () => ({x: R() * W, y: R() * H, r: 0.8 + R() * 1.8, o: 0.1 + R() * 0.35, v: 3 + R() * 8, ph: R() * 6.28})); })();
const Field: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
	<g>{FIELD.map((p, i) => <circle key={i} cx={(((p.x + t * p.v) % W) + W) % W} cy={p.y + Math.sin(t * 0.4 + p.ph) * 8} r={p.r} fill={C.cy} opacity={p.o * k} />)}</g>
);

// ------------------------------------------------------------------ 0 · hook: 208 phones, 133 open with a photo
const GRID = (() => { const R = rng(7); const order = Array.from({length: 208}, (_, i) => i).sort(() => R() - 0.5); const open = new Set(order.slice(0, 133)); return Array.from({length: 208}, (_, i) => ({i, open: open.has(i), rank: order.indexOf(i)})); })();
const SHook: React.FC<{t: number}> = ({t}) => {
	const gridK = ease(t, 5.4, 0.7), single = 1 - gridK, toLens = ease(t, bt(5) + 0.9, BAR * 1.2);
	const photoX = mix(1400, 1090, ease(t, 0.6, 1.6)), phX = 640;
	const counted = Math.round(133 * lin(t, 5.9, 7.9));
	return (
		<g>
			<g opacity={single * (1 - gridK)}>
				<Phone x={phX} y={480} s={1.3} open={r(t, 3.6, 3.9)} />
				<Photo cx={photoX} cy={480} s={190} rot={-6} />
				<Lab x={photoX} y={820} t="打印出来的照片" s={40} c={C.dim} o={win(t, 0.8, 5.4, 0.4, 0.3)} />
			</g>
			<g opacity={gridK * (1 - r(t, bt(5) + 0.6, bt(5) + 1.2))}>
				{GRID.map((p) => {
					const col = p.i % 16, row = Math.floor(p.i / 16), x = 250 + col * 64, y = 170 + row * 50;
					const on = p.open && p.rank < counted * (208 / 133) + 1 ? 1 : 0, still = !p.open && t > 8.6;
					return <g key={p.i}><rect x={x - 19} y={y - 21} width={38} height={42} rx={6} fill={on ? C.yl : C.bg2} stroke={on ? C.yl : still ? C.cy : 'rgba(92,225,230,0.45)'} strokeWidth={still ? 3 : 2} opacity={still ? 0.5 + 0.5 * Math.sin(t * 6) * 0.2 + 0.4 : 0.9} /></g>;
				})}
				<Lab x={1580} y={380} t={`${counted}`} s={210} c={C.yl} w={900} />
				<Lab x={1580} y={470} t="/ 208 部手机" s={52} />
				<Lab x={1580} y={540} t="被照片解锁" s={52} />
				<Lab x={1580} y={680} t="75 部：骗不开" s={52} c={C.cy} o={r(t, 8.7, 9.1)} />
			</g>
			<g opacity={r(t, bt(5) + 0.7, bt(5) + 1.3)} transform={`translate(960 ${mix(470, 300, toLens)}) scale(${mix(1, 3.2, toLens)}) translate(-960 -288)`}>
				<Phone x={960} y={680} s={1.4} glow={0.5 + 0.5 * beatHit(t, 6, 7)} />
				{Array.from({length: 40}, (_, i) => { const R = rng(i + 3); const a = R() * Math.PI - Math.PI, d = 80 + R() * 340; return <circle key={i} cx={960 + Math.cos(a) * d} cy={680 - 392 + Math.sin(a) * d * 0.6} r={2.5} fill={C.cy} opacity={0.6 * lin(t, bt(6), bt(7))} />; })}
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ title on the drop (bar 7)
const STitle: React.FC<{t: number}> = ({t}) => {
	const T0 = bt(7), u = t - T0, k = 1 - Math.pow(1 - cl(u / 0.22), 3);
	const ring = (j: number) => { const q = Math.max(0, u - j * 0.12); const R = 120 + 1300 * (1 - Math.exp(-q * 1.6)); return <ellipse key={j} cx={960} cy={470} rx={R} ry={R * 0.6} fill="none" stroke={j ? C.cy : C.yl} strokeWidth={22 - j * 9} opacity={0.55 * Math.exp(-q * 0.8)} filter="url(#glow)" />; };
	return (
		<g>
			{u >= 0 && [0, 1].map(ring)}
			<DotFace cx={960} cy={470} s={250} t={t} appear={r(t, T0, T0 + 0.5)} o={0.32} th={0.25 * Math.sin((t - T0) * 0.6)} />
			<g transform={`translate(960 470) scale(${mix(1.6, 1, k)}) translate(-960 -470)`} opacity={k}>
				<text x={960} y={360} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em'}} fill={C.yl}>{JUNO.series}</text>
				<text x={960} y={520} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '0.06em'}} fill={C.ink} filter="url(#glow)">你的脸是密码</text>
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ 一 · a face becomes numbers (bars 8–17)
const VEC = (() => { const R = rng(128); return Array.from({length: 128}, () => R() * 2 - 1); })();
const VEC2 = VEC.map((v, i) => v + (rng(500 + i)() - 0.5) * 0.18), VEC3 = (() => { const R = rng(999); return VEC.map(() => R() * 2 - 1); })();
const Strip: React.FC<{x: number; y: number; v: number[]; col: string; o?: number; k?: number; w?: number}> = ({x, y, v, col, o = 1, k = 1, w = 820}) => (
	<g opacity={o}>{v.map((q, i) => i / v.length <= k ? <rect key={i} x={x + (i * w) / v.length} y={q > 0 ? y - q * 70 : y} width={(w / v.length) * 0.7} height={Math.abs(q) * 70} fill={col} /> : null)}<line x1={x} x2={x + w} y1={y} y2={y} stroke={C.dim} strokeWidth={2} /></g>
);
const SAct1: React.FC<{t: number}> = ({t}) => {
	const toNum = ease(t, bt(9), 1.0), space = ease(t, bt(12), 0.8);
	const faceX = mix(960, 400, ease(t, bt(9), 0.7)), faceS = mix(300, 240, ease(t, bt(9), 0.7));
	const you = [[0, 0], [22, -14], [-18, 10], [10, 20]], others = [[-420, -160], [380, 210], [-300, 230], [440, -190], [60, -260], [-120, 280]];
	const sx = 1250, sy = 450, unlockR = 80;
	const testK = ease(t, bt(15), 0.6), photoTest = ease(t, bt(16) + 0.5, 0.8);
	return (
		<g>
			<g opacity={1 - space}>
				<DotFace cx={faceX} cy={480} s={faceS} t={t} appear={r(t, bt(8), bt(8) + 0.6)} th={0.18 * Math.sin(t * 0.7)} />
				<Strip x={760} y={500} v={VEC} col={C.yl} k={toNum} o={r(t, bt(9), bt(9) + 0.3)} w={1040} />
				<Lab x={1280} y={330} t="128 个数" s={80} c={C.yl} w={900} o={r(t, 21.5, 21.9)} />
				<Lab x={1280} y={680} t="（FaceNet，谷歌 2015）" s={44} c={C.dim} o={r(t, 21.5, 21.9)} />
			</g>
			<g opacity={space}>
				<rect x={sx - 520} y={sy - 330} width={1040} height={660} rx={24} fill="none" stroke="rgba(92,225,230,0.25)" strokeWidth={2} />
				{you.map(([dx, dy], i) => <circle key={i} cx={sx + dx} cy={sy + dy} r={16} fill={C.yl} opacity={r(t, bt(12) + 0.2 + i * 0.25, bt(12) + 0.4 + i * 0.25)} />)}
				<Lab x={sx} y={sy - 70} t="你（4 次拍到）" s={48} c={C.yl} o={r(t, bt(12) + 0.6, bt(12) + 1.0)} />
				{others.map(([dx, dy], i) => <circle key={i} cx={sx + dx} cy={sy + dy} r={12} fill={C.cy} opacity={0.85 * r(t, bt(13) + 0.6 + i * 0.12, bt(13) + 0.8 + i * 0.12)} />)}
				<Lab x={sx - 420} y={sy - 200} t="别人" s={48} c={C.cy} o={r(t, bt(13) + 0.8, bt(13) + 1.2)} />
				<circle cx={sx} cy={sy} r={unlockR * (0.6 + 0.4 * testK)} fill="rgba(255,209,102,0.12)" stroke={C.yl} strokeWidth={4} strokeDasharray="10 8" opacity={testK} />
				<Lab x={sx} y={sy + 140} t="够近 → 解锁" s={52} c={C.yl} o={testK} />
				<Photo cx={mix(sx + 600, sx + 34, photoTest)} cy={mix(sy + 300, sy - 26, photoTest)} s={22} rot={-8} o={r(t, bt(16) + 0.4, bt(16) + 0.8)} />
				<Lab x={sx + 200} y={sy - 110} t="照片？" s={52} c={C.ink} o={r(t, bt(16) + 1.0, bt(16) + 1.4)} />
				<DotFace cx={380} cy={470} s={230} t={t} o={0.9} />
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ 二 · why a photo fails (bars 18–30)
const S2D: React.FC<{t: number}> = ({t}) => {
	const pie = ease(t, bt(20) + 0.6, 0.9);
	return (
		<g>
			<g opacity={1 - r(t, bt(20) + 0.4, bt(20) + 0.8)}>
				<Lab x={960} y={180} t="2D 刷脸：只拍一张平面照" s={56} c={C.ink} o={r(t, bt(18), bt(18) + 0.4)} />
				<g transform="translate(560 0)"><rect x={-260} y={250} width={520} height={460} rx={22} fill={C.bg2} stroke={C.cy} strokeWidth={3} /><Toon cx={0} cy={480} s={150} col={C.ink} /><Lab x={0} y={770} t="真脸，拍下来" s={40} c={C.dim} /></g>
				<g transform="translate(1360 0)"><rect x={-260} y={250} width={520} height={460} rx={22} fill={C.bg2} stroke={C.cy} strokeWidth={3} /><Toon cx={0} cy={480} s={150} col={C.ink} /><Lab x={0} y={770} t="照片，拍下来" s={40} c={C.dim} /></g>
				<Lab x={960} y={510} t="＝" s={140} c={C.yl} w={900} o={r(t, 39.1, 39.5)} />
			</g>
			<g opacity={r(t, bt(20) + 0.5, bt(20) + 0.9)}>
				{(() => { const a = 2 * Math.PI * 0.64 * pie, R = 230, cx = 760, cy = 470; const x = cx + R * Math.sin(a), y = cy - R * Math.cos(a);
					return <g><circle cx={cx} cy={cy} r={R} fill={C.bg2} stroke="rgba(92,225,230,0.5)" strokeWidth={3} /><path d={`M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={C.yl} /></g>; })()}
				<Lab x={1300} y={440} t="64%" s={150} c={C.yl} w={900} />
				<Lab x={1300} y={520} t="三台里，两台被骗" s={48} />
			</g>
		</g>
	);
};
const S3D: React.FC<{t: number}> = ({t}) => {
	const T0 = bt(22), rain = (t - T0) / 1.6, turn = ease(t, bt(23) + 0.2, 1.2) * (1 - ease(t, bt(26), 0.6));
	const flatK = ease(t, bt(26), 0.7), deny = ease(t, 55.3, 0.4), eyes = r(t, 57.7, 58.1), tries = Math.floor(cl((t - 60.3) / 0.35, 0, 5));
	const faceX = mix(760, 560, flatK), photoEdge = ease(t, bt(26), 0.8);
	return (
		<g>
			{t < T0 + 1.8 && Array.from({length: 26}, (_, i) => { const a = -Math.PI / 2 + ((i - 12.5) / 12.5) * 0.55, L = 1100 * cl((t - T0) / 0.5); return <line key={i} x1={960} y1={-20} x2={960 + Math.cos(a) * L} y2={-20 - Math.sin(a) * L * -1} stroke={C.cy} strokeWidth={2} opacity={0.35 * (1 - lin(t, T0 + 1.0, T0 + 1.8))} />; })}
			<DotFace cx={faceX} cy={490} s={290} t={t} rain={rain} th={0.55 * turn} />
			<Lab x={300} y={170} t="30,000+" s={96} c={C.yl} w={900} a="start" o={r(t, T0 + 0.1, T0 + 0.4) * (1 - flatK)} />
			<Lab x={305} y={232} t="个红外点" s={40} a="start" o={r(t, T0 + 0.1, T0 + 0.4) * (1 - flatK)} />
			<g opacity={r(t, 47.6, 48.0) * (1 - flatK)}>
				{Array.from({length: 120}, (_, i) => <rect key={i} x={1560} y={760 - i * 4} width={46} height={4.2} fill={depthC(i / 119)} />)}
				<Lab x={1640} y={300} t="近" s={44} a="start" /><Lab x={1640} y={772} t="远" s={44} a="start" c={C.mid} />
				<Lab x={1180} y={360} t="鼻尖 → 近" s={44} c="#e6fdff" o={r(t, 47.6, 48.0)} /><Lab x={1180} y={640} t="脸颊 → 远" s={44} c={C.mid} o={r(t, 48.4, 48.8)} />
			</g>
			<Lab x={1180} y={250} t="深度图" s={64} c={C.yl} w={900} o={win(t, 50.1, bt(26), 0.3, 0.3)} />
			<g opacity={r(t, bt(26), bt(26) + 0.3)}>
				<Photo cx={1380} cy={490} s={120} edge={photoEdge} />
				<Lab x={1380} y={820} t="照片侧过来：厚度 0" s={44} c={C.ink} o={r(t, bt(26) + 0.6, bt(26) + 1.0)} />
				<g opacity={deny}><circle cx={1380} cy={490} r={130} fill="none" stroke={C.red} strokeWidth={10} /><line x1={1290} y1={400} x2={1470} y2={580} stroke={C.red} strokeWidth={10} /></g>
				<Lab x={1380} y={200} t="没有深度 → 拒绝" s={52} c={C.red} o={deny * (1 - eyes)} />
			</g>
			<g opacity={eyes * (1 - r(t, 60.3, 60.6))}>
				{[-0.31, 0.31].map((e) => <circle key={e} cx={faceX + e * 290} cy={490 - 0.24 * 290} r={34} fill="none" stroke={C.yl} strokeWidth={5} />)}
				<Lab x={1380} y={200} t="睁眼 · 看着它" s={52} c={C.yl} />
			</g>
			<g opacity={r(t, 60.3, 60.5)}>
				{Array.from({length: 5}, (_, i) => <circle key={i} cx={1180 + i * 80} cy={240} r={24} fill={i < tries ? C.red : 'none'} stroke={C.red} strokeWidth={4} />)}
				<Lab x={1340} y={330} t={tries >= 5 ? '→ 输密码' : '错一次…'} s={48} c={tries >= 5 ? C.yl : C.ink} />
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ 三 · how unique (bars 31–38, the lift on 35)
const CROWD = (() => { const R = rng(3); return Array.from({length: 900}, () => ({x: R(), y: R(), s: 0.6 + R() * 0.8})); })();
const SOdds: React.FC<{t: number}> = ({t}) => {
	const zoomOut = ease(t, bt(32), BAR * 3), lift = bt(35), hit = t >= lift ? 1 - Math.exp(-(t - lift) * 7) : 0, fp = ease(t, 73.8, 0.5);
	const one = r(t, lift - 0.3, lift);
	return (
		<g>
			<g opacity={1 - 0.75 * hit}>
				{CROWD.map((p, i) => { const sc = mix(1, 0.25, zoomOut), x = 960 + (p.x - 0.5) * 2400 * sc, y = 470 + (p.y - 0.5) * 1400 * sc; return <circle key={i} cx={x} cy={y} r={mix(16, 4, zoomOut) * p.s} fill={C.cy} opacity={0.5} />; })}
				<circle cx={960} cy={470} r={mix(30, 10, zoomOut)} fill={C.yl} />
				<Lab x={960} y={430 - mix(30, 10, zoomOut) - 14} t="你" s={44} c={C.yl} o={1 - hit} />
			</g>
			<g transform={`translate(960 470) scale(${mix(1.5, 1, hit)}) translate(-960 -470)`} opacity={one}>
				<Lab x={960} y={480} t="1 / 1,000,000" s={190} c={C.yl} w={900} />
				<Lab x={960} y={570} t="陌生人用脸解开你手机的概率（Apple）" s={40} c={C.dim} />
			</g>
			<g opacity={fp}>
				<rect x={360} y={690} width={1200 * ease(t, 73.8, 0.6)} height={26} rx={13} fill={C.cy} />
				<Lab x={360} y={668} t="指纹：1 / 50,000" s={44} c={C.cy} a="start" />
				<rect x={360} y={770} width={60 * ease(t, 76.4, 0.4)} height={26} rx={13} fill={C.yl} opacity={r(t, 76.4, 76.6)} />
				<Lab x={440} y={792} t="脸：1 / 1,000,000，撞上的机会小 20 倍" s={40} c={C.yl} a="start" o={r(t, 76.4, 76.8)} />
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ 四 · the twin (bars 39–46, quiet)
const STwin: React.FC<{t: number}> = ({t}) => {
	const slide = ease(t, bt(40), 0.9), nist = r(t, 83.7, 84.1), match = ease(t, 87.3, 0.8), apple = r(t, 90.7, 91.1);
	const t1x = mix(960, 640, slide), t2x = mix(2300, 1280, slide);
	return (
		<g>
			<DotFace cx={t1x} cy={430} s={230} t={t} th={0.12 * Math.sin(t * 0.5)} />
			<DotFace cx={t2x} cy={430} s={230} t={t} th={-0.12 * Math.sin(t * 0.5 + 0.3)} />
			<Lab x={t1x} y={720} t="你" s={48} c={C.yl} o={slide} /><Lab x={t2x} y={720} t="同卵双胞胎" s={48} c={C.cy} o={slide} />
			<g opacity={nist * (1 - match)}>
				<Lab x={960} y={150} t="NIST 2022：698 对双胞胎" s={56} c={C.ink} />
			</g>
			<g opacity={match}>
				<Strip x={540} y={820} v={VEC} col={C.yl} w={840} o={0.9} />
				<Strip x={540} y={820} v={VEC2} col={C.cy} w={840} o={0.55} />
				<Lab x={960} y={150} t="两串数，几乎重合 → 常常认错" s={56} c={C.yl} o={1 - apple} />
				<Lab x={960} y={150} t="Apple：双胞胎、13 岁以下 → 用密码" s={52} c={C.yl} o={apple} />
			</g>
		</g>
	);
};
// ------------------------------------------------------------------ the mask (bars 47–50, the build)
const SMask: React.FC<{t: number}> = ({t}) => {
	const T0 = bt(47), push = ease(t, T0, BAR * 3.6), stamp = r(t, 98.7, 99.0), brk = r(t, bt(50), bt(50) + 0.3);
	return (
		<g transform={`translate(960 470) scale(${mix(1, 1.25, push) * (1 - 0.06 * brk)}) translate(-960 -470)`}>
			<DotFace cx={960} cy={470} s={260} t={t} tint={C.dim} o={0.9} th={0.35 * Math.sin((t - T0) * 1.3)} />
			<Lab x={1450} y={330} t="$150 面具？" s={72} c={C.yl} w={900} o={r(t, T0 + 0.2, T0 + 0.6)} />
			<Lab x={1450} y={400} t="（安全公司 Bkav，2017）" s={40} c={C.dim} o={r(t, T0 + 0.4, T0 + 0.8)} />
			<g opacity={stamp} transform="rotate(-8 1450 560)"><rect x={1270} y={500} width={360} height={110} rx={12} fill="none" stroke={C.red} strokeWidth={8} /><Lab x={1450} y={578} t="未证实" s={68} c={C.red} w={900} /></g>
		</g>
	);
};
// ------------------------------------------------------------------ the answer (bar 51, the drop)
const SAnswer: React.FC<{t: number}> = ({t}) => {
	const T0 = bt(51), u = t - T0, spin = 2 * Math.PI * ease(t, T0, BAR * 1.6);
	return (
		<g>
			{u >= 0 && [0, 1].map((j) => { const q = Math.max(0, u - j * 0.12); const R = 120 + 1300 * (1 - Math.exp(-q * 1.6)); return <ellipse key={j} cx={960} cy={470} rx={R} ry={R * 0.6} fill="none" stroke={j ? C.cy : C.yl} strokeWidth={22 - j * 9} opacity={0.5 * Math.exp(-q * 0.8)} filter="url(#glow)" />; })}
			<DotFace cx={960} cy={460} s={290} t={t} th={spin} />
			<Lab x={960} y={130} t="认的是形状，不是照片" s={60} c={C.yl} w={900} o={r(t, T0 + 0.1, T0 + 0.4)} />
		</g>
	);
};

// ------------------------------------------------------------------ the film
const subAt = (t: number) => { for (const [s, e, txt] of lines as [number, number, string][]) if (t >= s && t < e) return {txt, o: Math.min(lin(t, s, s + 0.12), 1 - lin(t, e - 0.12, e))}; return null; };
const Sub: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 58, display: 'flex', justifyContent: 'center'}}>
		<div style={{position: 'relative', padding: '26px 120px'}}>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(4,8,20,0.6) 0%, rgba(4,8,20,0.3) 42%, rgba(4,8,20,0) 100%)', filter: 'blur(6px)'}} />
			<div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fffaf0', letterSpacing: '0.03em', WebkitTextStroke: '7px rgba(6,10,24,0.6)', paintOrder: 'stroke fill', textShadow: '0 2px 10px rgba(0,0,0,0.75)'}}>{t}</div>
		</div>
	</div>
);
// scene windows: [component, start, end, enter, exit]; enter/exit = the camera move that carries the cut (on a downbeat)
type Mv = 'push' | 'whipL' | 'whipR' | 'drop' | 'fade';
type Sc = [React.FC<{t: number}>, number, number, Mv, Mv];
const SCENES: Sc[] = [
	[SHook, 0, bt(7) + 0.02, 'fade', 'push'], [STitle, bt(7), bt(8) + 0.3, 'drop', 'push'], [SAct1, bt(8), bt(18), 'push', 'whipL'],
	[S2D, bt(18), bt(22), 'whipL', 'whipL'], [S3D, bt(22), bt(31), 'whipL', 'push'], [SOdds, bt(31), bt(39), 'push', 'fade'],
	[STwin, bt(39), bt(47), 'fade', 'push'], [SMask, bt(47), bt(51), 'push', 'drop'], [SAnswer, bt(51), CARD + 0.6, 'drop', 'fade'],
];
const enterT = (m: Mv, u: number) => { const k = 1 - Math.pow(1 - cl(u / 0.45), 3);   // u: seconds since the downbeat
	return m === 'push' ? {s: mix(0.82, 1, k), x: 0, o: cl(u / 0.2)} : m === 'whipL' ? {s: 1, x: mix(900, 0, k), o: cl(u / 0.12)} : m === 'whipR' ? {s: 1, x: mix(-900, 0, k), o: cl(u / 0.12)} : m === 'drop' ? {s: mix(1.18, 1, k), x: 0, o: 1} : {s: 1, x: 0, o: cl(u / 0.35)}; };
const exitT = (m: Mv, v: number) => { const k = sm(cl(1 - v / 0.3));   // v: seconds left before the next downbeat
	return m === 'push' ? {s: mix(1, 1.6, k), x: 0, o: 1 - k} : m === 'whipL' ? {s: 1, x: mix(0, -900, k), o: 1 - k} : m === 'whipR' ? {s: 1, x: mix(0, 900, k), o: 1 - k} : m === 'drop' ? {s: mix(1, 0.92, k), x: 0, o: 1 - 0.5 * k} : {s: 1, x: 0, o: 1 - k}; };
// a slow camera drift inside each scene, on its own clock (starts on the scene's downbeat, never pulses on beats)
const drift = (t: number, a: number) => 1 + 0.035 * sm(cl((t - a) / 8));

export const Film32: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const s = subAt(t);
	const shakeK = [bt(7), bt(35), bt(51)].reduce((acc, d) => acc + (t >= d ? Math.exp(-(t - d) * 9) : 0), 0);
	const shake = `translate(${Math.sin(t * 70) * 10 * shakeK} ${Math.cos(t * 55) * 7 * shakeK})`;
	const fieldK = 1 - 0.6 * win(t, bt(39), bt(47), 0.6, 0.6);
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${C.bg2} 0%, ${C.bg} 55%, #050a18 100%)`}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<Field t={t} k={fieldK} />
				<g transform={shake}>
					{SCENES.map(([S, a, b, mi, mo], i) => {
						if (t < a || t > b) return null;
						const e = enterT(mi, t - a), x = exitT(mo, b - t), sc = e.s * x.s * drift(t, a), o = e.o * x.o;
						return o > 0.001 ? <g key={i} opacity={o} transform={`translate(${960 + e.x + x.x} 470) scale(${sc}) translate(-960 -470)`}><S t={t} /></g> : null;
					})}
				</g>
				<rect width={W} height={H} fill="url(#vig)" />
			</svg>
			{s && t < CARD && <div style={{opacity: s.o}}><Sub t={s.txt} /></div>}
			<Sequence from={Math.round(CARD * FPS)}><EndCard speed={2.5} v={{id: 'ep32', src: '', title: '你的脸是密码', kicker: '', tagline: '', taglineEn: '', motif: 'wave', card: [0, 0], extend: 0, question: '你身边有人长得像你吗？发给TA试试', sources: '来源：Which? 2026；Apple Face ID Security Guide；Apple 支持文档 102381；NIST IR 8439；Schroff 等 2015 (FaceNet)；NPR 2017', duration: 0} as any} cfg={{videos: []} as any} dur={Math.round((END - CARD) * FPS)} /></Sequence>
			<div style={{position: 'absolute', top: 40, right: 56, opacity: t < CARD ? 0.55 : 0, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: C.ink}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="FILM32" component={Film32} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
