import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs, grounded, lerp, rnd, KAI, SANS, SAFE_X, SAFE_Y} from '../qq50/kit50';
import {B, thB, LacDefs, Lacquer, Vignette, Pool} from '../qq50/styleB';
import {ikArm, toBody, J} from '../qq50/props50';
import {Pose} from '../qq44/figure44';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Walker51} from '../qq51/props51';
import {SealHollow} from '../qq51/master51';
import {PAL52, EXTRA52, EraId52, rim52, FLAME, CLOUD, WOOD} from './palette52';
import {Defs52, blur52, Flame, RocketCloud, FireArrow, arrowAt, ARROW_FUSE_U, Bow, bowNock, Capsule, Glint52, Spark, LOOKS52} from './props52';
/* ep52 key frames, Builder A: KF01–KF07 in ep51's 「时代色」 look. The hero is the rocket's light (flame, exhaust, the glowing cloud):
   always the brightest thing, warm white-gold against the era's mid-value colour field. KF52A-ALL renders frame i = KF0(i+1).
   Subtitles are verbatim from 52-huojian/lines_read.json (v4 hook C); ASCII quote pairs become curly “ ”. */
type P2 = [number, number];

/* ---------- furniture (as ep51: layout-D subtitle, two-line stamp top-right, hollow J seal, no counter) ---------- */
const cq = (s: string) => { let k = 0; return s.replace(/"/g, () => (k++ % 2 === 0 ? '“' : '”')); };
const rows = (s: string) => cq(s).split('\n').map((r) => ({s: r}));
const Fonts: React.FC<{s: string}> = ({s}) => { useStampFonts(s); return null; };
const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·—〃`);
	const num = /^[0-9.]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
const Over: React.FC<{sub?: string; st?: {y: string; place?: string; note: string}; children?: React.ReactNode}> = ({sub, st, children}) => <>
	{sub && <Subs rows={rows(sub)} th={thB} />}
	{st && <StampK {...st} />}
	{children}
	<SealHollow />
</>;
/** a label in the 文楷 face with a dark keyline (≥ 40 px) */
const Label: React.FC<{x: number; y: number; s: string; fs?: number; col?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; font?: string}> = ({x, y, s, fs = 44, col = B.cream, anchor = 'start', o = 1, font = KAI}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={font === KAI ? 700 : 900} fontSize={fs} fill={col} opacity={o} stroke={B.lac} strokeWidth={Math.max(5, fs * 0.14)} style={{paintOrder: 'stroke'}}>{s}</text>;
/** a feathered dark scrim (for tags and big numerals) */
const Scrim: React.FC<{x: number; y: number; rx: number; ry: number; a?: number; id: string}> = ({x, y, rx, ry, a = 0.6, id}) => <g>
	<defs><radialGradient id={`scr${id}`}><stop offset="0" stopColor="#0A0503" stopOpacity={a} /><stop offset="0.55" stopColor="#0A0503" stopOpacity={a * 0.8} /><stop offset="1" stopColor="#0A0503" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#scr${id})`} /></g>;

/** the picture: lacquer ground, the era's sky gradient (top → horizon at hz), children, vignette */
const Pic: React.FC<{era: EraId52; id: string; hz: number; children: React.ReactNode; vig?: number}> = ({era, id, hz, children, vig = 0.5}) => { const p = PAL52[era];
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><LacDefs /><Defs52 /><Lacquer sheen={0.25} id={id} />
		<defs><linearGradient id={`sky${id}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={hz}><stop offset="0" stopColor={p.sky[0]} /><stop offset="0.6" stopColor={p.sky[1]} /><stop offset="1" stopColor={p.sky[2]} /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#sky${id})`} />
		{children}<Vignette id={id} a={vig} /></svg>; };

/* ---------- pose helpers ---------- */
const stand = (k: Partial<{lean: number; neck: number; la: number; le: number; ra: number; re: number; lt: number; lk: number; rt: number; rk: number}> = {}) => grounded({lean: 3, neck: 4, lt: 3, lk: 3, rt: -4, rk: 4, la: -3, le: 10, ra: 4, re: 14, ...k});
const reach = (p: Pose, s: 'L' | 'R', X: number, Y: number, x: number, g: number, h: number, elbowDown = true) => ikArm(p, s, toBody(X, Y, x, g, h), elbowDown);
/** the mitten closing over what it holds (drawn after the prop) */
const Mitt: React.FC<{p: P2; r: number; rim?: string}> = ({p, r, rim = '#FFE0A8'}) => <g>
	<ellipse cx={p[0] + r * 0.18} cy={p[1] - r * 0.15} rx={r * 1.02} ry={r * 0.9} fill={rim} opacity={0.75} />
	<ellipse cx={p[0]} cy={p[1]} rx={r} ry={r * 0.88} fill={B.lac} /></g>;

/* =========================================== sets =========================================== */
/* ---------- today, dusk: the sky with the ember band (sun below the horizon on the left), stars, the far hills, the town, the ridge ---------- */
const HZ = 852;   // the horizon (where the trail leaves the far hills)
const DuskSet: React.FC<{id: string; t: number; walker?: boolean}> = ({id, t, walker = true}) => { const X = EXTRA52.dusk, P = PAL52.dusk;
	const town = Array.from({length: 46}, (_, i) => { const x = -30 + i * 44 + 14 * rnd(i, 3), w = 26 + 34 * rnd(i, 4), tall = rnd(i, 5) > 0.82, h = tall ? 70 + 60 * rnd(i, 6) : 18 + 34 * rnd(i, 7); return {x, w, h}; });
	const g = 872, wx = 330, wh = 150;
	const wp = stand({lean: -6, neck: -30, la: -4, le: 8, ra: 3, re: 10});
	return <g>
		{/* the ember band: brightest low on the left (the sun just under the horizon there) */}
		<defs><linearGradient id={`band${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={X.band} stopOpacity="0" /><stop offset="0.7" stopColor={X.band} stopOpacity="0.5" /><stop offset="1" stopColor={X.bandHi} stopOpacity="0.85" /></linearGradient></defs>
		<rect x={-40} y={HZ - 150} width={W + 80} height={152} fill={`url(#band${id})`} opacity={0.55} />
		<ellipse cx={120} cy={HZ + 10} rx={1100} ry={120} fill={X.band} opacity={0.5} filter={blur52(40)} />
		<ellipse cx={60} cy={HZ + 6} rx={420} ry={44} fill={X.bandHi} opacity={0.55} filter={blur52(24)} />
		{/* stars, faint, only in the dark upper sky */}
		{Array.from({length: 70}, (_, i) => { const x = rnd(i, 11) * W, y = 20 + rnd(i, 12) * 520, r = 0.8 + 1.6 * rnd(i, 13);
			return <circle key={i} cx={x} cy={y} r={r} fill={X.star} opacity={(0.25 + 0.5 * rnd(i, 14)) * (1 - y / 700)} />; })}
		{/* far hills (violet), the cloud's trail leaves from behind them */}
		<path d={`M-40,${HZ + 4} Q180,${HZ - 40} 420,${HZ - 18} Q700,${HZ - 52} 980,${HZ - 14} Q1240,${HZ - 30} 1500,${HZ - 48} Q1760,${HZ - 22} 1960,${HZ - 30} V${HZ + 60} H-40 Z`} fill={P.far} />
		<path d={`M-40,${HZ + 4} Q180,${HZ - 40} 420,${HZ - 18} Q700,${HZ - 52} 980,${HZ - 14} Q1240,${HZ - 30} 1500,${HZ - 48} Q1760,${HZ - 22} 1960,${HZ - 30}`} fill="none" stroke={CLOUD.peach} strokeOpacity={0.22} strokeWidth={2} />
		{/* the town: low blocks, a few towers, sparse warm windows */}
		<g fill={X.town}>{town.map((b, i) => <rect key={i} x={b.x} y={HZ + 40 - b.h} width={b.w} height={b.h + 120} />)}</g>
		{town.map((b, i) => Array.from({length: Math.floor(b.h / 16)}, (_, j) => rnd(i * 7 + j, 21) > 0.62 ? <rect key={`${i}-${j}`} x={b.x + 5 + (b.w - 14) * rnd(i * 5 + j, 22)} y={HZ + 40 - b.h + 8 + j * 16} width={4} height={5} fill={X.townLit} opacity={0.45 + 0.4 * rnd(i + j, 23)} /> : null))}
		<rect x={-40} y={HZ + 40} width={W + 80} height={H} fill={X.town} />
		<path d={Array.from({length: 9}, (_, i) => `M${-40 + i * 250},${HZ + 70 + (i % 3) * 14} h${120 + 60 * rnd(i, 26)}`).join(' ')} stroke={X.townLit} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="2 9" />
		<ellipse cx={960} cy={HZ + 60} rx={1100} ry={26} fill={X.townLit} opacity={0.12} filter={blur52(14)} />
		{/* the ridge in the foreground, a thin cloud-lit edge */}
		<path d={`M-40,${H + 20} L-40,${g + 34} Q140,${g - 6} ${wx},${g} Q560,${g + 8} 760,${g + 70} Q1060,${g + 150} 1400,${g + 140} Q1700,${g + 130} 1960,${g + 104} V${H + 20} Z`} fill={X.ridge} />
		<path d={`M-40,${g + 34} Q140,${g - 6} ${wx},${g} Q560,${g + 8} 760,${g + 70} Q1060,${g + 150} 1400,${g + 140} Q1700,${g + 130} 1960,${g + 104}`} fill="none" stroke={CLOUD.gold} strokeOpacity={0.3} strokeWidth={2} />
		{walker && <Walker51 x={wx} g={g + 1} h={wh} pose={wp} look={LOOKS52.today.look} {...rim52('dusk')} rimO={0.9} T={t} />}
	</g>; };
const CLOUD_AT = {ax: 1222, ay: 150, x0: 1350, y0: HZ - 30};

/* KF01 · 0.0 · H1 frame 0: today's glowing 火箭云 over the dark town and ridge at dusk; row 1 of H1 */
const KF01: React.FC = () => <>
	<Pic era="dusk" id="k1" hz={HZ}>
		<RocketCloud {...CLOUD_AT} bw={430} bh={385} k={1} sun={-1} id="c1" t={0} />
		<DuskSet id="k1" t={0} />
	</Pic>
	<Over sub="66年前，中国的火箭，" st={{y: '1960', place: '上海', note: '国防科工局'}} />
</>;

/* KF02 · 8.0 · H3: the same sky, the cloud brighter; a small capsule glint arcs back down toward the viewer (带回来) */
const KF02: React.FC = () => { const a: P2 = [CLOUD_AT.ax - 10, CLOUD_AT.ay + 24], c: P2 = [470, 300], e: P2 = [860, 744];
	const q = (u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * e[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * e[1]];
	const end = q(1), pre = q(0.96), ang = Math.atan2(end[1] - pre[1], end[0] - pre[0]) * 180 / Math.PI;
	const streak = Array.from({length: 26}, (_, i) => q(0.62 + 0.38 * i / 25));
	return <>
		<Pic era="dusk" id="k2" hz={HZ}>
			<RocketCloud {...CLOUD_AT} bw={465} bh={415} k={1.28} sun={-1} id="c2" t={8} />
			<DuskSet id="k2" t={8} />
			{/* the way out and back: a dotted arc from the top of the plume, then a hot streak growing toward us */}
			<path d={`M${a[0]},${a[1]} Q${c[0]},${c[1]} ${e[0]},${e[1]}`} fill="none" stroke={CLOUD.gold} strokeOpacity={0.55} strokeWidth={3} strokeDasharray="3 13" strokeLinecap="round" />
			{streak.slice(0, -1).map((p, i) => <path key={i} d={`M${p[0]},${p[1]} L${streak[i + 1][0]},${streak[i + 1][1]}`} stroke={i > 18 ? FLAME.hot : FLAME.amber} strokeWidth={1 + 9 * (i / 25) ** 1.6} strokeOpacity={0.15 + 0.75 * (i / 25)} strokeLinecap="round" filter={blur52(2)} />)}
			<Capsule x={end[0]} y={end[1]} s={36} rot={ang - 90} heat={1} />
			<Glint52 x={end[0] + 2} y={end[1] + 14} r={34} o={0.9} rot={12} />
		</Pic>
		<Over sub={'现在，我们飞到约38万公里外，\n还能把东西[带回来]。'} st={{y: '2024', place: '嫦娥六号', note: '新华社'}} />
	</>; };

/* ---------- 宋 at dusk: a courtyard (whitewashed wall, timber posts, tiled eaves), far roofs in the haze, stone paving ---------- */
/** a Song hall in silhouette: platform, columned body, a hip-and-gable roof with concave slopes and upturned eaves, ridge ends */
const SongHall: React.FC<{x: number; y: number; w: number; h: number; fill: string; edge: string; body?: string}> = ({x, y, w, h, fill, edge, body}) => { const ye = y - h * 0.5, yr = y - h, e = w * 0.16;
	const roof = `M${x - e},${ye - h * 0.1} Q${x - e * 0.3},${ye + h * 0.03} ${x + w * 0.08},${ye + h * 0.03} L${x + w * 0.92},${ye + h * 0.03} Q${x + w + e * 0.3},${ye + h * 0.03} ${x + w + e},${ye - h * 0.1} Q${x + w * 0.88},${ye - h * 0.12} ${x + w * 0.76},${yr + h * 0.06} L${x + w * 0.24},${yr + h * 0.06} Q${x + w * 0.12},${ye - h * 0.12} ${x - e},${ye - h * 0.1} Z`;
	return <g>
		<rect x={x - w * 0.04} y={y - h * 0.07} width={w * 1.08} height={h * 0.07} fill={fill} />
		<rect x={x + w * 0.04} y={ye} width={w * 0.92} height={h * 0.44} fill={body ?? fill} />
		{Array.from({length: 6}, (_, i) => <rect key={i} x={x + w * 0.06 + i * w * 0.168} y={ye} width={Math.max(2, w * 0.025)} height={h * 0.44} fill={fill} />)}
		<path d={roof} fill={fill} />
		<rect x={x + w * 0.22} y={yr + h * 0.02} width={w * 0.56} height={h * 0.05} fill={fill} />
		{[x + w * 0.22, x + w * 0.78].map((cx, i) => <path key={i} d={`M${cx - h * 0.04},${yr + h * 0.06} q${(i ? 1 : -1) * h * 0.02},${-h * 0.1} ${(i ? 1 : -1) * h * 0.07},${-h * 0.08} l${(i ? -1 : 1) * h * 0.02},${h * 0.1} Z`} fill={fill} />)}
		<path d={`M${x - e},${ye - h * 0.1} Q${x - e * 0.3},${ye + h * 0.03} ${x + w * 0.08},${ye + h * 0.03} L${x + w * 0.92},${ye + h * 0.03} Q${x + w + e * 0.3},${ye + h * 0.03} ${x + w + e},${ye - h * 0.1}`} fill="none" stroke={edge} strokeWidth={1.5} />
	</g>; };
const SongSet: React.FC<{id: string; g: number; open?: boolean}> = ({id, g, open = false}) => { const P = PAL52.song, X = EXTRA52.song, hz = g - 190;
	return <g>
		<ellipse cx={1500} cy={hz - 20} rx={900} ry={160} fill={X.sun} opacity={0.3} filter={blur52(40)} />
		{/* far halls in the haze, two depths */}
		<g opacity={0.55}>{[[180, 300, 150], [980, 360, 170], [1560, 280, 140]].map(([x, w, hh], i) => <SongHall key={i} x={x} y={hz - 6} w={w} h={hh} fill={P.far} edge="rgba(255,240,200,0.25)" />)}</g>
		<g opacity={0.85}>{[[560, 320, 200], [1300, 340, 210]].map(([x, w, hh], i) => <SongHall key={i} x={x} y={hz + 10} w={w} h={hh} fill="#7A6044" edge="rgba(255,236,190,0.35)" body="#6A5038" />)}</g>
		{/* the courtyard's far wall with its tiled coping */}
		<rect x={-40} y={hz - 30} width={W + 80} height={44} fill="#8E7454" />
		<path d={`M-40,${hz - 30} L${W + 40},${hz - 30} L${W + 40},${hz - 44} L-40,${hz - 44} Z`} fill={X.tile} opacity={0.85} />
		<path d={`M-40,${hz - 30} H${W + 40}`} stroke={B.gold} strokeOpacity={0.35} strokeWidth={1.5} />
		{/* the courtyard floor: stone paving receding to the far wall */}
		<defs><linearGradient id={`pv${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6C4A" /><stop offset="0.35" stopColor={P.field[0]} /><stop offset="1" stopColor={P.field[1]} /></linearGradient></defs>
		<rect x={-40} y={hz + 14} width={W + 80} height={H} fill={`url(#pv${id})`} />
		<g stroke={P.near} strokeOpacity={0.3} strokeWidth={1.5}>{Array.from({length: 6}, (_, i) => <path key={i} d={`M-40,${hz + 24 + i * i * 9 + i * 10} H${W + 40}`} />)}
			{Array.from({length: 26}, (_, i) => <path key={`v${i}`} d={`M${-200 + i * 90},${hz + 14} L${(-200 + i * 90 - 960) * 2.6 + 960},${H}`} />)}</g>
		<path d={`M-40,${hz + 14} H${W + 40}`} stroke="#3A2A1A" strokeOpacity={0.5} strokeWidth={2} />
		{/* the near courtyard wall (left): whitewash, timber frame, lattice windows, tiled coping */}
		{!open && <g>
			<rect x={-40} y={g - 330} width={700} height={330} fill={X.wall} />
			<rect x={-40} y={g - 330} width={700} height={330} fill={P.mid} opacity={0.28} />
			{[20, 250, 480].map((x) => <rect key={x} x={x} y={g - 330} width={24} height={330} fill={X.wood} />)}
			<rect x={-40} y={g - 40} width={700} height={40} fill={X.wood} opacity={0.85} />
			<path d={`M-60,${g - 330} L640,${g - 330} Q672,${g - 334} 690,${g - 362} Q650,${g - 360} 620,${g - 374} L-60,${g - 374} Z`} fill={X.tile} />
			<path d={`M-60,${g - 330} L650,${g - 330}`} stroke={B.gold} strokeOpacity={0.4} strokeWidth={2} />
			{[[80, 140], [320, 130]].map(([x, w], i) => <g key={i}>
				<rect x={x} y={g - 270} width={w} height={150} fill={P.mid} opacity={0.8} stroke={X.wood} strokeWidth={6} />
				<path d={Array.from({length: 5}, (_, j) => `M${x + (w / 5) * (j + 0.5)},${g - 270} v150` + (i === 0 ? ` M${x},${g - 270 + 30 * (j + 0.5)} h${w}` : '')).join(' ')} stroke={X.wood} strokeWidth={3} /></g>)}
		</g>}
	</g>; };

/* KF03 · 11.5 · TITLE: the ep51 plaque 「从一支箭 / 到火箭云」 over the rewind: the cloud collapsing back into one fire-arrow held up
   in a Song hand. No subtitle, no stamp. */
const TitlePlaque: React.FC = () => { const fs = 116, ls = 0.06, PX = 960, PY = 206, PW = 1180, PH2 = 296;
	const curlD = (x: number, y: number, r: number, dir = 1) => { const pts: string[] = []; for (let i = 0; i <= 30; i++) { const th = (i / 30) * 2.2 * Math.PI, rr = r * (0.15 + 0.85 * i / 30); pts.push(`${(x + dir * rr * Math.cos(th)).toFixed(1)},${(y - rr * Math.sin(th)).toFixed(1)}`); } return 'M' + pts.join('L'); };
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', left: PX - PW / 2 - 120, top: PY - PH2 / 2 - 90, width: PW + 240, height: PH2 + 180, background: 'radial-gradient(closest-side, rgba(10,5,3,0.82), rgba(10,5,3,0.72) 60%, rgba(10,5,3,0))'}} />
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<rect x={PX - PW / 2} y={PY - PH2 / 2} width={PW} height={PH2} fill="none" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
			<rect x={PX - PW / 2 + 10} y={PY - PH2 / 2 + 10} width={PW - 20} height={PH2 - 20} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
			{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], k) => <path key={k} d={curlD(PX + dx * (PW / 2 - 34), PY + dy * (PH2 / 2 - 34), 20, -dx)} fill="none" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" />)}
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, letterSpacing: `${ls}em`, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			<div style={{color: '#FFF6E6'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>从一支箭</span></div>
			<div style={{color: B.gold}}><span style={{position: 'relative', left: `${ls / 2}em`}}>到火箭云</span></div>
		</div></div>; };
const KF03: React.FC = () => { const g = 1010, h = 500, wx = 600;
	const hand: P2 = [wx + 0.27 * h, g - 0.86 * h], rot = -36, L = 300, tail = arrowAt(hand[0], hand[1], L, rot + 180, 0.24), head = arrowAt(tail[0], tail[1], L, rot, 1);
	let p = stand({lean: -2, neck: -14, la: -6, le: 10});
	p = reach(p, 'R', hand[0], hand[1], wx, g, h);
	/* the rewind: the cloud's ghost (fading) and its trail running back down into the arrow's head; chevrons point the way back */
	const cx = 1340, cy = 470, tr: P2[] = Array.from({length: 7}, (_, i) => { const u = (i + 0.6) / 7.2; return [lerp(head[0] + 20, cx, u) + 40 * Math.sin(u * 5), lerp(head[1] - 10, cy + 30, u) - 60 * Math.sin(Math.PI * u)]; });
	return <>
		<Pic era="song" id="k3" hz={g - 230} vig={0.55}>
			<SongSet id="k3" g={g} />
			<Pool id="k3b" x={wx + 60} y={g - 0.55 * h} rx={330} ry={400} a={PAL52.song.backdropA} col={PAL52.song.backdrop} />
			<g opacity={0.6}><RocketCloud ax={cx} ay={cy} x0={head[0] + 10} y0={head[1] - 6} bw={250} bh={230} k={0.75} sun={-1} id="c3" rocket={false} amp={26} /></g>
			{tr.map((q, i) => { const nx = i ? tr[i - 1] : head, a = Math.atan2(nx[1] - q[1], nx[0] - q[0]) * 180 / Math.PI;
				return <path key={i} d="M10,-11 L-2,0 L10,11" transform={`translate(${q[0]},${q[1]}) rotate(${a + 180})`} fill="none" stroke={CLOUD.bright} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.85 - 0.08 * i} />; })}
			<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS52.song.look} {...rim52('song')} />
			<FireArrow x={tail[0]} y={tail[1]} L={L} rot={rot} lit={1} />
			<Glint52 x={head[0] - 6} y={head[1] + 4} r={30} o={0.9} />
			<Mitt p={J(p, 'RHand', wx, g, h)} r={14} />
		</Pic>
		<Fonts s="从一支箭到火箭云" />
		<TitlePlaque />
		<SealHollow />
	</>; };

/* KF04 · 19.0 · Q1 + 先猜？: 宋 courtyard at dusk; the walker holds up the fire arrow (paper powder tube behind the head), his other
   hand open and empty. 先猜？ with 火药？ · 弓？ on one baseline. */
const KF04: React.FC = () => { const g = 1010, h = 600, wx = 460;
	const rot = -40, L = 420, hand: P2 = [wx + 0.33 * h, g - 0.73 * h], tail = arrowAt(hand[0], hand[1], L, rot + 180, 0.18);
	let p = stand({lean: 2, neck: -8});
	p = reach(p, 'R', hand[0], hand[1], wx, g, h);
	p = reach(p, 'L', wx + 0.33 * h, g - 0.43 * h, wx, g, h);
	const open = J(p, 'LHand', wx, g, h);
	const tube = arrowAt(tail[0], tail[1], L, rot, 0.735);
	const by = 660, xo = 1000, xb = 1310;
	return <>
		<Pic era="song" id="k4" hz={g - 230}>
			<SongSet id="k4" g={g} />
			<Pool id="k4b" x={wx + 60} y={g - 0.55 * h} rx={340} ry={420} a={PAL52.song.backdropA} col={PAL52.song.backdrop} />
			<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS52.song.look} {...rim52('song')} />
			<FireArrow x={tail[0]} y={tail[1]} L={L} rot={rot} />
			<Mitt p={J(p, 'RHand', wx, g, h)} r={17} />
			{/* the open, empty hand: a flat mitten, palm up */}
			<path d={`M${open[0] - 16},${open[1] - 4} Q${open[0] + 8},${open[1] + 12} ${open[0] + 42},${open[1] - 2} Q${open[0] + 48},${open[1] - 12} ${open[0] + 36},${open[1] - 13} Q${open[0] + 12},${open[1] - 6} ${open[0] - 12},${open[1] - 18} Z`} fill={B.lac} stroke="#FFE0A8" strokeOpacity={0.7} strokeWidth={2} />
			{/* 先猜？: two options on one baseline, each with a dashed leader to what it names */}
			<Scrim x={1170} y={by - 50} rx={360} ry={150} a={0.28} id="k4" />
			<path d={`M${xo + 30},${by - 58} Q${xo - 40},${by - 170} ${tube[0] + 26},${tube[1] + 26}`} fill="none" stroke={B.cream} strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="6 8" />
			<path d={`M${xb + 30},${by + 16} Q${xb - 60},${by + 150} ${open[0] + 62},${open[1] + 6}`} fill="none" stroke={B.cream} strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="6 8" />
			<Label x={xo} y={by} s="火药？" fs={58} />
			<Label x={(xo + 3 * 58 + xb) / 2 - 4} y={by - 6} s="·" fs={58} anchor="middle" o={0.85} />
			<Label x={xb} y={by} s="弓？" fs={58} />
			<g transform={`translate(1120,${by - 200}) rotate(-4)`}><rect x={0} y={0} width={220} height={84} rx={42} fill={B.goldL} /><text x={110} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={B.lac}>先猜？</text></g>
		</Pic>
		<Fonts s="火药？·弓先猜" />
		<Over sub="可宋朝的火箭，靠什么飞？" st={{y: '北宋', place: '1044', note: '《武经总要》'}} />
	</>; };

/* KF05 · 23.5 · A1: the answer: he draws a bow with the fire arrow nocked, its fuse lit; aimed into the empty dusk sky */
const KF05: React.FC = () => { const g = 1020, h = 560, wx = 820, aim = -26, BL = 0.82 * h;
	let p = stand({lean: -2, neck: -6, lt: 14, lk: 6, rt: -14, rk: 6});
	const sh = J(p, 'LSh', wx, g, h);
	const grip: P2 = [sh[0] + 0.31 * h * Math.cos(aim * Math.PI / 180), sh[1] + 0.31 * h * Math.sin(aim * Math.PI / 180)];
	const nock = bowNock(grip[0], grip[1], BL, aim, 1);
	p = reach(p, 'L', grip[0], grip[1], wx, g, h);
	p = reach(p, 'R', nock[0], nock[1], wx, g, h, false);
	const AL = 330, fuse = arrowAt(nock[0], nock[1], AL, aim, ARROW_FUSE_U);
	return <>
		<Pic era="song" id="k5" hz={g - 230}>
			<SongSet id="k5" g={g} />
			<Pool id="k5b" x={wx + 40} y={g - 0.55 * h} rx={340} ry={400} a={PAL52.song.backdropA} col={PAL52.song.backdrop} />
			{/* the fuse light falls on his hands and chest */}
			<circle cx={fuse[0]} cy={fuse[1]} r={260} fill={FLAME.amber} opacity={0.22} filter={blur52(40)} />
			<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS52.song.look} {...rim52('song')} />
			<Bow x={grip[0]} y={grip[1]} L={BL} aim={aim} draw={1} />
			<FireArrow x={nock[0]} y={nock[1]} L={AL} rot={aim} lit={1} />
			<Mitt p={J(p, 'LHand', wx, g, h)} r={15} />
			<Mitt p={J(p, 'RHand', wx, g, h)} r={14} />
			{/* where it will go: a faint dotted arc into the empty sky */}
			{(() => { const s = arrowAt(nock[0], nock[1], AL, aim, 1.15); return <path d={`M${s[0]},${s[1]} Q${s[0] + 380},${s[1] - 230} ${s[0] + 760},${s[1] - 120}`} fill="none" stroke={B.cream} strokeOpacity={0.4} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />; })()}
		</Pic>
		<Over sub={'靠[弓]：箭头绑上火药，\n再用弓或弩射出去。'} st={{y: '北宋', place: '1044', note: '弓弩通用之'}} />
	</>; };

/* ---------- 明 by night: slate-green sky, a far wall with two lanterns, grass ---------- */
const MingNight: React.FC<{id: string; g: number}> = ({id, g}) => { const P = PAL52.ming, X = EXTRA52.ming, hz = g - 140;
	return <g>
		<ellipse cx={1500} cy={hz} rx={1000} ry={140} fill={P.horizon} opacity={0.16} filter={blur52(40)} />
		{Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i, 31) * W} cy={20 + rnd(i, 32) * 500} r={0.8 + 1.4 * rnd(i, 33)} fill="#E8F0E0" opacity={0.2 + 0.4 * rnd(i, 34)} />)}
		<path d={`M-40,${hz} Q300,${hz - 70} 640,${hz - 30} Q980,${hz - 90} 1320,${hz - 40} Q1640,${hz - 80} 1960,${hz - 30} V${hz + 40} H-40 Z`} fill={P.far} />
		{/* a far town wall with crenellations and a gate tower, two lanterns */}
		<g fill={P.mid}>
			<rect x={980} y={hz - 46} width={980} height={60} />
			{Array.from({length: 26}, (_, i) => <rect key={i} x={984 + i * 38} y={hz - 60} width={22} height={16} />)}
			<path d={`M1580,${hz - 46} L1580,${hz - 110} L1540,${hz - 110} L1600,${hz - 150} L1760,${hz - 150} L1820,${hz - 110} L1780,${hz - 110} L1780,${hz - 46} Z`} />
		</g>
		<path d={`M980,${hz - 46} H1960`} stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.5} />
		{[1548].map((x) => <g key={x}><circle cx={x} cy={hz - 96} r={30} fill={X.lamp} opacity={0.25} filter={blur52(8)} /><ellipse cx={x} cy={hz - 96} rx={8} ry={10} fill={X.lamp} /></g>)}
		<defs><linearGradient id={`gr${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.field[0]} /><stop offset="1" stopColor={P.field[1]} /></linearGradient></defs>
		<rect x={-40} y={hz + 10} width={W + 80} height={H} fill={P.near} opacity={0.6} />
		<path d={`M-40,${g - 4} Q500,${g - 26} 960,${g - 8} Q1400,${g + 8} 1960,${g - 16} V${H + 20} H-40 Z`} fill={`url(#gr${id})`} />
		<path d={`M-40,${g - 4} Q500,${g - 26} 960,${g - 8} Q1400,${g + 8} 1960,${g - 16}`} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
		{Array.from({length: 60}, (_, i) => { const x = rnd(i, 41) * W, y = g + 6 + rnd(i, 42) * 50; return <path key={i} d={`M${x},${y} l${-3 + 6 * rnd(i, 43)},${-10 - 10 * rnd(i, 44)}`} stroke={P.panel} strokeWidth={2} />; })}
	</g>; };

/* KF06 · 31.5 · M1 一窝蜂: 明 by night; the walker holds the wooden barrel launcher at his chest, angled up; its 32 small rocket arrows
   leave together as a swarm of sparks into the empty sky. Tag 「一桶32支」. */
const KF06: React.FC = () => { const g = 1010, h = 540, wx = 400, ang = -24, ca = Math.cos(ang * Math.PI / 180), sa = Math.sin(ang * Math.PI / 180);
	const bc: P2 = [wx + 0.3 * h, g - 0.66 * h], bl = 210, br = 62;   // barrel centre, length, radius
	const mouth: P2 = [bc[0] + ca * bl / 2, bc[1] + sa * bl / 2], butt: P2 = [bc[0] - ca * bl / 2, bc[1] - sa * bl / 2];
	let p = stand({lean: 4, neck: -10, lt: 12, lk: 8, rt: -14, rk: 8});
	const hR: P2 = [bc[0] - ca * 40 - sa * br * 0.45, bc[1] - sa * 40 + ca * br * 0.45], hL: P2 = [bc[0] + ca * 62 - sa * br * 0.3, bc[1] + sa * 62 + ca * br * 0.3];
	p = reach(p, 'R', hR[0], hR[1], wx, g, h);
	p = reach(p, 'L', hL[0], hL[1], wx, g, h);
	/* the swarm: 32 rockets fanned in a narrow cone, each a hot head + a trail; staggered distances */
	const sw = Array.from({length: 32}, (_, i) => { const spread = (rnd(i, 51) - 0.5) * 24, a = (ang + spread) * Math.PI / 180, d = 110 + 560 * Math.pow(rnd(i, 52), 0.85), tl = 50 + 110 * rnd(i, 53);
		const off = (rnd(i, 54) - 0.5) * br * 1.2, ox = mouth[0] - sa * off, oy = mouth[1] + ca * off;
		const hx = ox + Math.cos(a) * d, hy = oy + Math.sin(a) * d + 0.00008 * d * d; return {hx, hy, tx: hx - Math.cos(a) * tl, ty: hy - Math.sin(a) * tl, a, i}; });
	const X = EXTRA52.ming;
	return <>
		<Pic era="ming" id="k6" hz={g - 140}>
			<MingNight id="k6" g={g} />
			<Pool id="k6b" x={wx + 60} y={g - 0.55 * h} rx={320} ry={380} a={0.2} col="#C8E0C8" />
			{/* the swarm light on the sky */}
			<ellipse cx={mouth[0] + ca * 420} cy={mouth[1] + sa * 420} rx={560} ry={300} fill={FLAME.amber} opacity={0.2} filter={blur52(70)} transform={`rotate(${ang},${mouth[0] + ca * 420},${mouth[1] + sa * 420})`} />
			{sw.map((s) => <g key={s.i}>
				<path d={`M${s.tx},${s.ty} L${s.hx},${s.hy}`} stroke={FLAME.amber} strokeWidth={7} strokeOpacity={0.45} strokeLinecap="round" filter={blur52(4)} />
				<path d={`M${lerp(s.tx, s.hx, 0.4)},${lerp(s.ty, s.hy, 0.4)} L${s.hx},${s.hy}`} stroke={FLAME.hot} strokeWidth={3.5} strokeLinecap="round" />
				<Spark x={s.hx} y={s.hy} r={4.5 + 2.2 * rnd(s.i, 55)} />
				{/* the tiny rocket arrow ahead of its spark */}
				<path d={`M${s.hx},${s.hy} L${s.hx + Math.cos(s.a) * 26},${s.hy + Math.sin(s.a) * 26}`} stroke="#2A1A10" strokeWidth={2} />
			</g>)}
			{/* the mouth flare: smoke and the light of the launch */}
			<circle cx={mouth[0] + ca * 20} cy={mouth[1] + sa * 20} r={110} fill={FLAME.hot} opacity={0.45} filter={blur52(24)} />
			{Array.from({length: 7}, (_, i) => <circle key={i} cx={butt[0] - ca * (20 + 40 * i) + (rnd(i, 61) - 0.5) * 40} cy={butt[1] - sa * (20 + 40 * i) + 30 * i * 0.3} r={40 + 18 * i} fill="#6A7470" opacity={0.18 - 0.018 * i} filter={blur52(14)} />)}
			{/* the barrel: wooden staves, iron hoops, the open mouth packed with arrow heads */}
			<g transform={`translate(${bc[0]},${bc[1]}) rotate(${ang})`}>
				<rect x={-bl / 2} y={-br} width={bl} height={br * 2} rx={10} fill={X.wood} />
				{[-0.55, -0.1, 0.35, 0.75].map((u) => <path key={u} d={`M${-bl / 2},${u * br} H${bl / 2}`} stroke={X.woodL} strokeOpacity={0.5} strokeWidth={2} />)}
				<rect x={-bl / 2} y={-br} width={bl} height={br * 0.5} rx={8} fill={X.woodL} opacity={0.45} />
				{[-0.36, 0.0, 0.36].map((u) => <rect key={u} x={u * bl - 7} y={-br - 3} width={14} height={br * 2 + 6} rx={3} fill="#1E1A18" />)}
				<ellipse cx={bl / 2} cy={0} rx={18} ry={br} fill="#120A06" stroke={X.woodL} strokeWidth={4} />
				{Array.from({length: 9}, (_, i) => <circle key={i} cx={bl / 2 + 4} cy={(i - 4) * br * 0.2} r={4} fill={FLAME.hot} />)}
				<ellipse cx={bl / 2 + 6} cy={0} rx={30} ry={br * 1.05} fill={FLAME.white} opacity={0.5} filter={blur52(8)} />
			</g>
			<Walker51 x={wx} g={g} h={h} pose={p} look={LOOKS52.ming.look} {...rim52('ming')} />
			<Mitt p={hR} r={16} rim="#FFD098" />
			<Mitt p={hL} r={16} rim="#FFD098" />
			{/* the tag */}
			<Scrim x={1250} y={822} rx={330} ry={140} a={0.55} id="k6" />
			<g transform="translate(1040,750)"><rect x={0} y={0} width={430} height={140} rx={10} fill="#0B1210" fillOpacity={0.88} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
				<text x={30} y={100} fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>一桶</text>
				<text x={300} y={108} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={110} fill={B.goldL}>32</text>
				<text x={312} y={100} fontFamily={KAI} fontWeight={700} fontSize={58} fill={B.cream}>支</text></g>
		</Pic>
		<Fonts s="一桶32支" />
		<Over sub={'明代兵书《武备志》里，\n"一窝蜂"一桶[32支]火箭。'} st={{y: '明', note: '《武备志》：每桶三十二支'}} />
	</>; };

/* ---------- 明 on the water at dawn ---------- */
const MingWater: React.FC<{id: string; hz: number}> = ({id, hz}) => { const P = PAL52.mingWater, X = EXTRA52.mingWater;
	return <g>
		<ellipse cx={300} cy={hz} rx={900} ry={150} fill={P.horizon} opacity={0.4} filter={blur52(40)} />
		<path d={`M-40,${hz} Q260,${hz - 60} 560,${hz - 24} Q840,${hz - 70} 1120,${hz - 20} Q1500,${hz - 50} 1960,${hz - 10} V${hz + 10} H-40 Z`} fill={P.far} />
		<defs><linearGradient id={`wa${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.field[0]} /><stop offset="1" stopColor={P.field[1]} /></linearGradient></defs>
		<rect x={-40} y={hz} width={W + 80} height={H - hz + 40} fill={`url(#wa${id})`} />
		<path d={`M-40,${hz} H${W + 40}`} stroke={P.horizon} strokeOpacity={0.4} strokeWidth={2} />
		{/* the dawn shimmer and the wave lines (receding) */}
		<ellipse cx={300} cy={hz + 40} rx={420} ry={30} fill={X.waterHi} opacity={0.3} filter={blur52(14)} />
		{Array.from({length: 46}, (_, i) => { const r = i / 45, y = hz + 10 + Math.pow(r, 1.7) * (H - hz), x = -100 + rnd(i, 71) * 2000, w = 40 + 260 * r * rnd(i, 72);
			return <path key={i} d={`M${x},${y} q${w / 2},${-4 - 8 * r} ${w},0`} fill="none" stroke={X.waterHi} strokeOpacity={0.18 + 0.25 * r} strokeWidth={1 + 2.5 * r} strokeLinecap="round" />; })}
	</g>; };
/** the 火龙出水 dragon (generic, after the 《武备志》 idea, not a copy): a bamboo tube body lacquered vermilion with node rings, a carved
    dragon head with open jaws at the front (+x), a flame-shaped tail; 起火 tubes tied under the belly (2 seen per side).
    (x, y) = body centre, L = body length (without head). boost 0..1 = the boosters' fire; stage2 0..1 = the mouth rockets out. */
const DRG = (L: number) => { const r = L * 0.055, hx = L / 2; return {r, hx, boost: [-L * 0.3, L * 0.1], mouth: [hx + L * 0.2, -r * 0.05] as P2}; };
const Dragon: React.FC<{x: number; y: number; L: number; rot?: number; boost?: number; stage2?: number}> = ({x, y, L, rot = 0, boost = 1, stage2 = 1}) => { const {r, hx, boost: bxs, mouth} = DRG(L);
	const tub = (cx: number, k: number) => <g key={cx}>
		<Flame x={cx - L * 0.085} y={r * 1.3} L={L * 0.3 * k} w={r * 0.75} rot={182} k={k} seed={Math.round(cx)} />
		<rect x={cx - L * 0.09} y={r * 0.95} width={L * 0.18} height={r * 0.7} rx={r * 0.3} fill="url(#pap52)" stroke={WOOD.paperD} strokeWidth={1} />
		{[-0.03, 0.04].map((u) => <rect key={u} x={cx + L * u} y={r * 0.6} width={L * 0.012} height={r * 1.1} fill={WOOD.cord} />)}
	</g>;
	const lac = WOOD.lacquer, lacL = WOOD.lacquerL, gold = B.goldL;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		{/* stage 2: the rockets that were inside the body burst from the mouth and fly on */}
		{stage2 > 0 && [-12, -3, 6, 14].map((a, i) => { const d = L * (0.26 + 0.18 * rnd(i, 81)) * stage2, ar = a * Math.PI / 180, ex = mouth[0] + Math.cos(ar) * d, ey = mouth[1] + Math.sin(ar) * d;
			return <g key={i}>
				<path d={`M${mouth[0]},${mouth[1]} L${ex},${ey}`} stroke={FLAME.amber} strokeWidth={6} strokeOpacity={0.4} strokeLinecap="round" filter={blur52(4)} />
				<Flame x={ex} y={ey} L={L * 0.11} w={r * 0.45} rot={a + 180} k={1} seed={i + 9} halo={false} />
				<path d={`M${ex},${ey} l${Math.cos(ar) * L * 0.07},${Math.sin(ar) * L * 0.07}`} stroke="#3A2416" strokeWidth={r * 0.3} strokeLinecap="round" />
				<path d={`M${ex + Math.cos(ar) * L * 0.07},${ey + Math.sin(ar) * L * 0.07} l${Math.cos(ar) * 12},${Math.sin(ar) * 12}`} stroke={WOOD.iron} strokeWidth={r * 0.2} strokeLinecap="round" />
				<Spark x={ex + 2} y={ey} r={3.6} />
			</g>; })}
		{stage2 > 0 && <circle cx={mouth[0] - 6} cy={mouth[1]} r={r * 1.4} fill={FLAME.hot} opacity={0.7} filter={blur52(8)} />}
		{/* the far-side boosters (dimmer), then the tail */}
		<g opacity={0.6}>{bxs.map((cx) => tub(cx + L * 0.03, boost * 0.8))}</g>
		<path d={`M${-L / 2 + 4},${-r * 0.6} Q${-L / 2 - L * 0.06},${-r * 1.6} ${-L / 2 - L * 0.13},${-r * 2.4} Q${-L / 2 - L * 0.08},${-r * 0.6} ${-L / 2 - L * 0.15},${r * 0.2} Q${-L / 2 - L * 0.07},${r * 0.4} ${-L / 2 - L * 0.12},${r * 1.9} Q${-L / 2 - L * 0.04},${r * 1.1} ${-L / 2 + 4},${r * 0.7} Z`} fill={lac} stroke={B.gold} strokeOpacity={0.6} strokeWidth={1.5} />
		{/* the body: lacquered bamboo tube, node rings, a light along the top, a gold hairline, faint scale arcs */}
		<rect x={-L / 2} y={-r} width={L} height={2 * r} rx={r * 0.5} fill={lac} />
		<rect x={-L / 2 + 6} y={-r * 0.82} width={L - 12} height={r * 0.5} rx={r * 0.25} fill={lacL} opacity={0.55} />
		<path d={Array.from({length: 18}, (_, i) => `M${-L / 2 + L * 0.04 + i * L * 0.052},${-r * 0.2} q${L * 0.026},${r * 0.5} ${L * 0.052},0`).join(' ')} fill="none" stroke={gold} strokeOpacity={0.28} strokeWidth={1.5} />
		{[-0.32, -0.08, 0.16, 0.38].map((u) => <g key={u}><rect x={L * u - 4} y={-r * 1.04} width={8} height={r * 2.08} rx={3} fill="#6A1A0E" /><rect x={L * u - 4} y={-r * 1.04} width={3} height={r * 2.08} fill={lacL} opacity={0.7} /></g>)}
		<path d={`M${-L / 2 + r},${-r * 0.5} H${hx - r}`} stroke={gold} strokeOpacity={0.55} strokeWidth={2} />
		{/* the near-side boosters, tied under the belly */}
		{bxs.map((cx) => tub(cx, boost))}
		{/* the carved head: brow and upturned snout, open jaws with teeth, mane and horns swept back */}
		{[0, 1, 2].map((i) => <path key={i} d={`M${hx - r * (0.2 + 0.5 * i)},${-r * (1.1 - 0.05 * i)} Q${hx - r * (1.6 + 0.6 * i)},${-r * (2.2 - 0.3 * i)} ${hx - r * (3.6 + 0.9 * i)},${-r * (1.6 - 0.35 * i)}`} fill="none" stroke={i === 1 ? lacL : gold} strokeWidth={i === 1 ? 7 : 3.5} strokeLinecap="round" opacity={0.85} />)}
		<path d={`M${hx - r * 0.6},${-r * 1.05} Q${hx + r * 0.2},${-r * 2.0} ${hx + r * 1.6},${-r * 1.55} Q${hx + r * 2.6},${-r * 1.25} ${hx + L * 0.17},${-r * 1.1} Q${hx + L * 0.215},${-r * 1.5} ${hx + L * 0.225},${-r * 0.9} Q${hx + L * 0.22},${-r * 0.3} ${hx + L * 0.19},${-r * 0.2} L${hx + r * 0.8},${-r * 0.15} Q${hx + r * 0.2},${-r * 0.1} ${hx - r * 0.2},${r * 0.2} Z`} fill={lac} stroke={B.gold} strokeOpacity={0.75} strokeWidth={1.5} />
		<path d={`M${hx - r * 0.2},${r * 0.25} Q${hx + r * 0.8},${r * 0.35} ${hx + L * 0.17},${r * 0.95} Q${hx + L * 0.185},${r * 1.35} ${hx + L * 0.15},${r * 1.4} Q${hx + r * 1.2},${r * 1.4} ${hx - r * 0.6},${r * 1.05} Z`} fill={lac} stroke={B.gold} strokeOpacity={0.75} strokeWidth={1.5} />
		<path d={Array.from({length: 5}, (_, i) => { const u = (i + 1) / 6, tx = lerp(hx + r * 1.2, hx + L * 0.18, u); return `M${tx},${-r * 0.2} l${r * 0.12},${r * 0.32} l${r * 0.12},${-r * 0.32} M${tx - r * 0.1},${lerp(r * 0.45, r * 0.95, u)} l${r * 0.12},${-r * 0.3} l${r * 0.12},${r * 0.3}`; }).join(' ')} fill="#F4ECDC" />
		<path d={`M${hx + r * 0.4},${-r * 1.9} Q${hx - r * 0.6},${-r * 3.4} ${hx - r * 2.4},${-r * 3.6}`} fill="none" stroke={gold} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
		<path d={`M${hx + r * 1.0},${-r * 1.75} Q${hx + r * 0.4},${-r * 3.0} ${hx - r * 1.0},${-r * 3.3}`} fill="none" stroke={gold} strokeWidth={3} strokeLinecap="round" opacity={0.75} />
		<path d={`M${hx + L * 0.2},${-r * 0.7} Q${hx + L * 0.25},${-r * 0.4} ${hx + L * 0.3},${-r * 1.2}`} fill="none" stroke={gold} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
		<ellipse cx={hx + r * 1.7} cy={-r * 1.2} rx={r * 0.32} ry={r * 0.24} fill={gold} />
		<circle cx={hx + r * 1.78} cy={-r * 1.2} r={r * 0.12} fill="#1A0805" />
	</g>; };
/* KF07 · 36.5 · M3 火龙出水: 明 on the water at dawn; the dragon skims low over the waves on its boosters (their fire dying), and the
   rockets inside its mouth burst out and fly on: stage 2. Label 「相当于两级火箭」 (国家航天局). The walker small on the boat behind. */
const KF07: React.FC = () => { const hz = 700, dx = 860, dy = 600, DL = 600, rot = -5;
	const bx = 230, bg = 840, wh = 190, D = DRG(DL);
	const wp = stand({lean: 6, neck: -6, la: 60, le: 20, ra: 40, re: 10});
	const toS = (lx: number, ly: number): P2 => { const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180); return [dx + lx * c - ly * s, dy + lx * s + ly * c]; };
	const b1 = toS(D.boost[0] - DL * 0.1, D.r * 2.3), b2 = toS(D.boost[1] + DL * 0.1, D.r * 2.3);
	const m1 = toS(D.mouth[0] + 10, -DL * 0.13), m2 = toS(D.mouth[0] + DL * 0.46, -DL * 0.13);
	return <>
		<Pic era="mingWater" id="k7" hz={hz}>
			<MingWater id="k7" hz={hz} />
			{/* the boat it was launched from, the walker standing in it, a smoke wake from there to the dragon */}
			<path d={`M${bx + 120},${bg - 70} Q${bx + 360},${bg - 150} ${dx - DL / 2 - 60},${dy + 30}`} fill="none" stroke="#C8D0C4" strokeWidth={30} strokeOpacity={0.18} strokeLinecap="round" filter={blur52(14)} />
			<path d={`M${bx - 170},${bg - 16} Q${bx},${bg + 30} ${bx + 180},${bg - 20} L${bx + 210},${bg - 50} L${bx - 200},${bg - 46} Z`} fill={EXTRA52.mingWater.wood} stroke={B.gold} strokeOpacity={0.4} strokeWidth={1.5} />
			<path d={`M${bx - 200},${bg - 46} L${bx + 210},${bg - 50}`} stroke={B.goldL} strokeOpacity={0.5} strokeWidth={2} />
			<Walker51 x={bx} g={bg - 44} h={wh} pose={wp} look={LOOKS52.ming.look} {...rim52('mingWater')} />
			<path d={`M${bx - 200},${bg + 4} q100,10 200,0 q100,-10 200,0`} fill="none" stroke={EXTRA52.mingWater.foam} strokeOpacity={0.35} strokeWidth={2} />
			{/* its light on the water and a low spray line under it */}
			<ellipse cx={dx + 60} cy={hz + 120} rx={520} ry={40} fill={FLAME.amber} opacity={0.24} filter={blur52(24)} />
			<path d={`M${dx - 360},${dy + 132} q60,-14 120,0 q60,14 120,0 q60,-14 120,0 q60,14 120,0`} fill="none" stroke={EXTRA52.mingWater.foam} strokeOpacity={0.3} strokeWidth={3} />
			<Dragon x={dx} y={dy} L={DL} rot={rot} boost={0.7} stage2={1} />
			{/* stage brackets: 一级 under the boosters, 二级 over the mouth rockets */}
			<path d={`M${b1[0]},${b1[1] - 12} L${b1[0]},${b1[1]} L${b2[0]},${b2[1]} L${b2[0]},${b2[1] - 12}`} fill="none" stroke={B.cream} strokeOpacity={0.8} strokeWidth={3} />
			<Label x={(b1[0] + b2[0]) / 2} y={(b1[1] + b2[1]) / 2 + 56} s="一级" fs={48} anchor="middle" />
			<path d={`M${m1[0]},${m1[1] + 12} L${m1[0]},${m1[1]} L${m2[0]},${m2[1]} L${m2[0]},${m2[1] + 12}`} fill="none" stroke={B.cream} strokeOpacity={0.8} strokeWidth={3} />
			<Label x={(m1[0] + m2[0]) / 2} y={(m1[1] + m2[1]) / 2 - 18} s="二级" fs={48} anchor="middle" />
			{/* the label with its source */}
			<Scrim x={1240} y={902} rx={420} ry={120} a={0.5} id="k7" />
			<g transform="translate(990,846)"><rect x={0} y={0} width={500} height={96} rx={10} fill="#0B1614" fillOpacity={0.86} stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
				<text x={250} y={66} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={52} fill={B.goldL}>相当于两级火箭</text></g>
			<Label x={1490} y={990} s="—— 国家航天局" fs={40} anchor="end" o={0.9} />
		</Pic>
		<Fonts s="一级二级相当于两级火箭——国家航天局" />
		<Over sub={'"火龙出水"飞到半路再点火，\n国家航天局说：[相当于两级火箭]。'} st={{y: '明', note: '专用于水战'}} />
	</>; };

/* =========================================== registration =========================================== */
const KFS: [string, React.FC][] = [['01', KF01], ['02', KF02], ['03', KF03], ['04', KF04], ['05', KF05], ['06', KF06], ['07', KF07]];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF52A-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={`KF52A-${n}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void Glint52;
