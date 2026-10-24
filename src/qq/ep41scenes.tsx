import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Lit3, Look3, gaitInfo} from './walker3';
import {SP} from './spritesizes';
import {MANDEL} from './mandel';

/* ep41 《为了跟你说一句话，人类努力了三千年》 — v2 film (owner notes 2026-10-23 22:28 / 22:53).
   The walker stays in place while the world slides past in layers; the background acts out the narration;
   scenes dissolve into each other; real mocap walking; narration changes language with the scene.
   Music: バケモノの唄 (instrumental), 106 BPM. Kept song spans: [0, 54.875) + [91.41, 209.47) + [238.0, 253.2). */
export const W = 1920, H = 1080, FPS = 30, GR = 862;
export const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", sans-serif', LATS = '"DejaVu Serif", serif', MONO = '"DejaVu Sans Mono", monospace';
export const GOLD = '#f2cf7a', CYAN = '#9fe8ff';
export const BEAT = 0.566;
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const fio = (t: number, a: number, b: number, f = 0.35) => cl((t - a) / f) * cl((b - t) / f);

/* ---------------- film timeline (seconds of film) ---------------- */
export const T = {hit: 9.30, title: 12.70, s1: 18.965, s2: 34.836, s3: 54.875, s4: 73.015, s5: 90.845, s6: 110.385, s7: 127.265, crash: 144.165, s8: 145.70, climax: 154.095, fin: 160.885, outro: 172.935, end: 188.1};

/* ---------------- shared drawing ---------------- */
export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffb44a', o = 0.3}) => { const id = 'g' + c.replace('#', '');
	return <><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} /></>; };
const tintF = (id: string, c: string) => { const r = parseInt(c.slice(1, 3), 16) / 255, g = parseInt(c.slice(3, 5), 16) / 255, b = parseInt(c.slice(5, 7), 16) / 255;
	return <filter key={id} id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0`} /></filter>; };
/** a flat-colour silhouette sprite standing on y */
export const Sprite: React.FC<{k: string; x: number; y: number; h: number; c: string; flip?: boolean; op?: number}> = ({k, x, y, h, c, flip, op = 1}) => { const [iw, ih] = SP[k], w = iw * h / ih, id = `t${c.slice(1)}`;
	return <g opacity={op}><defs>{tintF(id, c)}</defs><image href={staticFile(`ep41/sp/${k}.png`)} x={x - w / 2} y={y - h} width={w} height={h} filter={`url(#${id})`} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined} /></g>; };
/** items repeating every `period` px on a layer moving at cam*f */
export const Rep: React.FC<{cam: number; f: number; period: number; render: (x: number, i: number) => React.ReactNode; pad?: number}> = ({cam, f, period, render, pad = 1000}) => {
	const off = cam * f, i0 = Math.floor((off - pad) / period), i1 = Math.ceil((off + W + pad) / period);
	return <>{Array.from({length: i1 - i0 + 1}, (_, k) => { const i = i0 + k; return <g key={i}>{render(i * period - off, i)}</g>; })}</>;
};
export const ridge = (cam: number, f: number, base: number, amp: number, seed: number) => { const off = cam * f; let d = `M0,${H} L0,${base}`;
	for (let x = 0; x <= W; x += 24) { const u = x + off; d += ` L${x},${(base - amp * (0.55 + 0.25 * Math.sin(u * 0.0031 + seed) + 0.2 * Math.sin(u * 0.0107 + seed * 3))).toFixed(1)}`; }
	return d + ` L${W},${H} Z`; };
const Sky: React.FC<{id: string; stops: [number, string][]}> = ({id, stops}) => <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect width={W} height={H} fill={`url(#${id})`} /></>;
const Stars: React.FC<{cam: number; n?: number; maxY?: number; op?: number}> = ({cam, n = 160, maxY = 620, op = 1}) => <g opacity={op}>{Array.from({length: n}, (_, i) => { const x = ((rnd(i, 50) * W * 1.4 - cam * 0.02) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2; return <circle key={i} cx={x} cy={rnd(i, 51) * maxY} r={0.6 + 1.5 * rnd(i, 52)} fill="#eef" opacity={0.15 + 0.5 * rnd(i, 53)} />; })}</g>;
const Ground: React.FC<{c: string; tuft?: string; cam: number}> = ({c, tuft = '#1a1424', cam}) => <><rect x={0} y={GR - 16} width={W} height={H - GR + 16} fill={c} />
	<Rep cam={cam} f={1} period={130} pad={200} render={(x, i) => <path d={`M${x},${GR - 4} l${6 + 10 * rnd(i, 1)},${-14 - 20 * rnd(i, 2)} M${x + 10},${GR - 4} l${-4 - 8 * rnd(i, 3)},${-10 - 16 * rnd(i, 4)}`} stroke={tuft} strokeWidth={3} strokeLinecap="round" />} /></>;
const Fg: React.FC<{cam: number; c?: string; period?: number}> = ({cam, c = '#030205', period = 1500}) => <Rep cam={cam} f={1.6} period={period} pad={300} render={(x, i) => <g filter="url(#blurF)">{Array.from({length: 8}, (_, j) => <path key={j} d={`M${x + j * 18},${H + 20} Q${x + j * 18 + 10},${H - 190} ${x + j * 18 + 30 * rnd(i * 9 + j, 5)},${H - 250 - 110 * rnd(i * 9 + j, 6)}`} stroke={c} strokeWidth={7} fill="none" />)}</g>} />;
const Rain: React.FC<{t: number; k: number; slant?: number}> = ({t, k, slant = 8}) => k <= 0 ? null : <>{Array.from({length: 220}, (_, i) => { const x = (rnd(i, 21) * (W + 300) + t * 120) % (W + 300) - 150, y = ((rnd(i, 22) * H + t * 1400 * (0.8 + 0.4 * rnd(i, 23))) % (H + 100)) - 50; return <line key={i} x1={x} y1={y} x2={x - slant} y2={y + 34} stroke="#c9d6ff" strokeWidth={1.4} opacity={0.45 * k} />; })}</>;

/* the walker, treadmill: the ground slides at exactly the speed of the planted foot */
export const LOOK: Record<string, Look3> = {
	shang: {dress: 'robe', sleeves: 'wide', head: 'bun', beard: 'short', carry: 'bone'},
	du: {dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long', carry: 'letter'},
	morse: {dress: 'coat', head: 'tophat', carry: 'tape'},
	scott: {dress: 'coat', head: 'short', beard: 'full'},
	bell: {dress: 'coat', head: 'short', beard: 'full'},
	watson: {dress: 'shirt', head: 'short', beard: 'moustache', gait: '08_01'},
	marconi: {dress: 'coat', head: 'cap', beard: 'moustache', gait: '08_01'},
	kline: {dress: 'shirt', head: 'bowl', carry: 'paper', gait: '08_01'},
	bj: {dress: 'jacket', head: 'glasses', carry: 'disk', gait: '08_01'},
};
const CYCLE = 2 * BEAT;                                   // one gait loop = two beats: a footfall on every beat
export const speed = (look: Look3, h: number) => gaitInfo(look.gait ?? '08_04').stride * h / CYCLE;
export const Hero: React.FC<{tau: number; look: Look3; h?: number; x?: number; rim?: string}> = ({tau, look, h = 430, x = 760, rim = '#ffd9a0'}) =>
	<Lit3 x={x} ground={GR} h={h} u={tau / CYCLE} look={look} rim={rim} T={tau} />;

/* ---------------- scenes (tau = seconds since the scene started) ---------------- */
type SP_ = {tau: number; t: number};

export const SHANG: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.shang, h), cam = v * (tau + 1.2);
	const rain = cl((t - 31.5) / 1.2), cloud = cl((t - 25.7) / 3.5), cracks = cl((t - 24.0) / 1.6), qc = (i: number) => cl((t - 26.15 - i * 0.28) / 0.3);
	const fireX = 2500 - cam * 0.55;
	return <svg width={W} height={H}>
		<Sky id="sk1" stops={[[0, '#060814'], [0.55, '#1b1733'], [0.86, '#5a2f2c'], [1, '#7a3e28']]} />
		<Stars cam={cam} op={1 - 0.8 * cloud} />
		<circle cx={1560} cy={170} r={46} fill="#f2e8cf" opacity={1 - 0.7 * cloud} /><Glow x={1560} y={170} r={170} c="#f2e8cf" o={0.18 * (1 - cloud)} />
		<g transform="translate(1460,300)" opacity={cl((t - 25.4) / 0.8) * (1 - 0.6 * rain)}>
			<Glow x={0} y={0} r={240} c="#ffcf8a" o={0.2} />
			<path d="M-120,-160 Q-138,0 -100,140 Q0,180 100,140 Q138,0 120,-160 Q0,-190 -120,-160 Z" fill="#e6d6ad" />
			<path d="M0,-176 L0,166 M-120,-50 L120,-50 M-112,50 L112,50" stroke="#b9a073" strokeWidth={2} />
			{[['其', 42, -100], ['自', 42, -42], ['東', 42, 16], ['來', -42, -100], ['雨', -42, -42]].map(([c, x, y], i) => <text key={c as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 300, fontSize: 46}} fill="#6b3a1a" opacity={qc(i)}>{c}</text>)}
		</g>
		{Array.from({length: 8}, (_, i) => { const x = W + 300 - cloud * (1500 + 300 * rnd(i, 3)) + 400 * rnd(i, 4) - tau * 18; return <ellipse key={i} cx={x} cy={110 + 220 * rnd(i, 5)} rx={260 + 160 * rnd(i, 6)} ry={46 + 30 * rnd(i, 7)} fill={i % 2 ? '#2a2a44' : '#22223a'} opacity={0.8 * cloud} />; })}
		<path d={ridgeD(cam, 0.04, 660, 140, 3)} fill="#3d2f52" opacity={0.8} /><path d={ridgeD(cam, 0.08, 720, 100, 1)} fill="#2f2442" />
		<Rep cam={cam} f={0.22} period={1150} render={(x, i) => <g><Sprite k="hall" x={x + 300} y={765} h={190 + 30 * rnd(i, 1)} c="#1b1426" flip={rnd(i, 2) > 0.5} />
			<rect x={x + 286} y={713} width={28} height={44} fill="#ffb766" opacity={0.85} /><Glow x={x + 300} y={738} r={70} c="#ff9a4a" o={0.35} /></g>} />
		<path d={ridgeD(cam, 0.3, 790, 30, 7)} fill="#1c1428" />
		<Rep cam={cam} f={0.55} period={1700} render={(x, i) => <g><Sprite k="tree" x={x + 200} y={GR - 10} h={360 + 60 * rnd(i, 8)} c="#0d0a14" /><Sprite k="hut" x={x + 1050} y={GR - 10} h={170} c="#130e1c" /></g>} />
		<g transform={`translate(${fireX},${GR - 10})`}>
			<Glow x={0} y={-60} r={230} c="#ff8a3a" o={0.45 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7)} />
			<Sprite k="ding" x={-240} y={0} h={150} c="#130e1c" />
			<path d={`M-34,0 L-14,${-70 - 12 * Math.sin(t * 11)} L0,-26 L16,${-96 - 14 * Math.sin(t * 9 + 1)} L36,0 Z`} fill="#ffb347" /><path d={`M-18,0 L-6,${-44 - 8 * Math.sin(t * 13)} L8,-16 L18,${-56 - 8 * Math.sin(t * 10)} L26,0 Z`} fill="#fff0b0" />
			<g fill="#0a0710"><path d="M120,0 Q118,-60 140,-92 Q160,-120 150,-150 L176,-160 Q196,-120 190,-80 Q200,-30 230,0 Z" /><circle cx={160} cy={-178} r={20} /><path d="M154,-130 Q100,-140 60,-120" stroke="#0a0710" strokeWidth={9} fill="none" strokeLinecap="round" /></g>
			<g transform="translate(40,-120) rotate(-12)"><ellipse rx={44} ry={28} fill="#e0cfa6" />
				<path d={`M0,-26 L0,${-26 + 52 * cracks} M0,-4 L${30 * cracks},${-14 * cracks} M0,10 L${-26 * cracks},${22 * cracks}`} stroke="#ffcf6a" strokeWidth={3} fill="none" filter="url(#gS)" opacity={cracks} /></g>
			<line x1={64} y1={-122} x2={30} y2={-104} stroke="#ff7a3a" strokeWidth={4} strokeLinecap="round" />
			{Array.from({length: 14}, (_, i) => { const u = ((t * 0.6 + rnd(i, 1)) % 1); return <circle key={i} cx={(rnd(i, 2) - 0.5) * 40 + Math.sin(u * 8 + i) * 10} cy={-60 - u * 260} r={1.6 + rnd(i, 3) * 1.6} fill="#ffcf6a" opacity={1 - u} />; })}
		</g>
		<Ground c="#0b0812" cam={cam} />
		<Hero tau={tau} look={LOOK.shang} h={h} rim="#ff9a5a" />
		<Fg cam={cam} />
		<Rain t={t} k={rain} />
		<rect width={W} height={H} fill="#1a2240" opacity={0.25 * rain} />
	</svg>;
};
const ridgeD = ridge;

export const DU: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.du, h), cam = v * (tau + 0.5);
	// beacon fires catch one after another along the far ridge — the oldest relay of all
	const lit = (i: number) => cl((tau - 1.0 - i * 0.9) / 0.5);
	const courierX = W + 400 - (tau - 13.0) * 520;                   // a courier gallops the other way
	return <svg width={W} height={H}>
		<Sky id="sk2" stops={[[0, '#2a1d3a'], [0.5, '#8c3a3a'], [0.82, '#d8774a'], [1, '#f0a868']]} />
		<circle cx={1450} cy={560} r={70} fill="#ffd9a0" opacity={0.85} /><Glow x={1450} y={560} r={260} c="#ffb070" o={0.35} />
		<path d={ridge(cam, 0.05, 640, 190, 4)} fill="#7a3a46" opacity={0.85} />
		<Rep cam={cam} f={0.05} period={760} render={(x, i) => { const y = 640 - 190 * (0.55 + 0.25 * Math.sin((x + cam * 0.05 + 380) * 0.0031 + 4) + 0.2 * Math.sin((x + cam * 0.05 + 380) * 0.0107 + 12)), k = lit(((i % 6) + 6) % 6);
			return <g><Sprite k="beacon" x={x + 380} y={y + 8} h={90} c="#5a2a36" />{k > 0 && <><Glow x={x + 380} y={y - 80} r={70} c="#ff7a2a" o={0.7 * k} /><path d={`M${x + 372},${y - 74} L${x + 380},${y - 100 - 8 * Math.sin(t * 9 + i)} L${x + 388},${y - 74} Z`} fill="#ffc06a" opacity={k} />
				<path d={`M${x + 380},${y - 100} Q${x + 400 + 20 * Math.sin(t + i)},${y - 200} ${x + 360},${y - 320}`} stroke="#4a2a36" strokeWidth={22} fill="none" opacity={0.45 * k} strokeLinecap="round" /></>}</g>; }} />
		<path d={ridge(cam, 0.12, 720, 90, 9)} fill="#5a2733" />
		<Rep cam={cam} f={0.3} period={1900} render={(x) => <g><Sprite k="tanggate" x={x + 700} y={790} h={260} c="#2e1622" /><rect x={x + 1160} y={790 - 104} width={560} height={104} fill="#2e1622" />
			<path d={`M${x + 1720},${790 - 104} L${x + 1760},${790 - 60} L${x + 1790},${790 - 90} L${x + 1830},790 Z`} fill="#2e1622" /></g>} />
		<Rep cam={cam} f={0.55} period={1300} render={(x, i) => <g><Sprite k="peach" x={x + 300} y={GR - 6} h={330 + 50 * rnd(i, 3)} c="#1d0f16" />
			{Array.from({length: 26}, (_, j) => <circle key={j} cx={x + 300 + (rnd(i * 31 + j, 4) - 0.5) * 300} cy={GR - 230 - rnd(i * 31 + j, 5) * 150} r={5 + 4 * rnd(j, 6)} fill="#f4a6b8" opacity={0.7} />)}</g>} />
		{courierX > -600 && courierX < W + 600 && <g transform={`translate(0,${-6 * Math.abs(Math.sin(t * 11))})`}><Sprite k="courier" x={courierX} y={GR - 6} h={210} c="#140a10" flip /></g>}
		<Ground c="#140a0e" tuft="#2a1620" cam={cam} />
		{Array.from({length: 40}, (_, i) => { const t0 = rnd(i, 7) * 12, u = ((tau - t0) / 5 + 2) % 1, x = rnd(i, 8) * W + u * 220 + Math.sin(u * 9 + i) * 26 - cam * 0.3 % 300, y = 260 + u * 700; return <ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill="#f6b3c4" opacity={0.85 * Math.sin(Math.PI * u)} transform={`rotate(${u * 300 + i * 20} ${x} ${y})`} />; })}
		<Hero tau={tau} look={LOOK.du} h={h} rim="#ffcf9a" />
		<Fg cam={cam} c="#0a0408" />
	</svg>;
};

export const MORSE: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.morse, h), cam = v * (tau + 0.5);
	const later = cl((tau - 10.6) / 1.5);                       // "nineteen years later": poles rise, the wire lights
	const sym = '·—— · —·· ·· ·—'.split('');
	return <svg width={W} height={H}>
		<Sky id="sk3" stops={[[0, later > 0.5 ? '#4a78ad' : '#3a4a6a'], [0.7, later > 0.5 ? '#b5cfe6' : '#8b8fa0'], [1, '#efe2c8']]} />
		<rect width={W} height={H} fill="#5a7ab0" opacity={0.25 * later} />
		{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={((rnd(i, 3) * 2400 - cam * 0.03 - tau * 8) % 2400 + 2400) % 2400 - 240} cy={120 + 160 * rnd(i, 4)} rx={180 + 120 * rnd(i, 5)} ry={30 + 16 * rnd(i, 6)} fill="#fff" opacity={0.35} />)}
		<path d={ridge(cam, 0.05, 690, 120, 2)} fill="#8a9cab" /><path d={ridge(cam, 0.12, 740, 80, 6)} fill="#6d8576" />
		<Rep cam={cam} f={0.18} period={2600} render={(x, i) => <Sprite k="loco" x={x + 900 + ((tau * 140) % 2600)} y={775} h={70} c="#3a4440" op={later} />} />
		<path d={ridge(cam, 0.3, 790, 30, 11)} fill="#4f6a52" />
		{/* 1825: the painter at his easel, the rider with the letter, the grave */}
		<g opacity={1 - later}>
			<Sprite k="painter" x={1500 - cam * 0.55 + 400} y={GR - 8} h={300} c="#1c2422" />
			<g transform={`translate(0,${-4 * Math.abs(Math.sin(t * 6))})`}><Sprite k="rider" x={W + 200 - (tau - 2.2) * 260} y={GR - 8} h={260} c="#1c2422" flip /></g>
			<g transform={`translate(${2400 - cam * 0.55},${GR - 8})`}><path d="M-30,0 L-30,-80 Q0,-110 30,-80 L30,0 Z" fill="#1c2422" />{Array.from({length: 6}, (_, i) => <circle key={i} cx={-40 + i * 16} cy={-6} r={6} fill="#c86a7a" />)}</g>
		</g>
		{/* 1844: the line to Baltimore */}
		<g opacity={later}><Rep cam={cam} f={0.55} period={520} render={(x) => <g><rect x={x - 5} y={GR - 330} width={10} height={322} fill="#2a2a24" /><rect x={x - 38} y={GR - 322} width={76} height={7} fill="#2a2a24" />
			<path d={`M${x},${GR - 318} Q${x + 260},${GR - 290} ${x + 520},${GR - 318}`} stroke="#2a2a24" strokeWidth={2.5} fill="none" /></g>} />
			{sym.map((c, i) => { const u = (tau - 12.6) / 3.2 - i * 0.07; if (c === ' ' || u < 0 || u > 1) return null; const x = 100 + 1700 * u, y = GR - 318 + 14 * Math.sin(((x + cam * 0.55) % 520) / 520 * Math.PI) ** 2;
				return <g key={i} opacity={Math.sin(Math.PI * u) * 1.4}>{c === '·' ? <circle cx={x} cy={y} r={7} fill={GOLD} /> : <rect x={x - 16} y={y - 5} width={32} height={10} rx={5} fill={GOLD} />}<Glow x={x} y={y} r={24} c={GOLD} o={0.7} /></g>; })}</g>
		<Ground c="#3a3022" tuft="#4a4030" cam={cam} />
		<Hero tau={tau} look={LOOK.morse} h={h} rim="#fff4d8" />
		<Fg cam={cam} c="#1a1810" />
	</svg>;
};

export const SCOTT: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.scott, h), cam = v * (tau + 0.5);
	const sing = cl((tau - 9.4) / 3.0), lift = cl((tau - 12.8) / 2.5), n = Math.floor(214 * sing);
	const hornX = 2300 - cam * 0.7;
	return <svg width={W} height={H}>
		<Sky id="sk4" stops={[[0, '#050818'], [0.7, '#1b2348'], [1, '#33406b']]} />
		<Stars cam={cam} n={140} />
		<circle cx={1520} cy={180} r={66} fill="#f6efd6" /><Glow x={1520} y={180} r={200} c="#f6efd6" o={0.18} />
		<path d={ridge(cam, 0.04, 640, 60, 5)} fill="#141a3a" />
		<Rep cam={cam} f={0.12} period={3000} render={(x) => <g fill="#10142c"><rect x={x + 400} y={430} width={110} height={300} /><rect x={x + 570} y={430} width={110} height={300} /><rect x={x + 510} y={530} width={60} height={200} /><rect x={x + 680} y={560} width={340} height={170} /><path d={`M${x + 860},560 L${x + 870},400 L${x + 880},560 Z`} /></g>} />
		<rect x={0} y={720} width={W} height={60} fill="#121a36" />
		{Array.from({length: 14}, (_, i) => <line key={i} x1={1520 - 40 - 80 * rnd(i, 70)} x2={1520 + 40 + 80 * rnd(i, 71)} y1={726 + i * 4} y2={726 + i * 4} stroke="#f6efd6" strokeWidth={2} opacity={0.35 - i * 0.02} />)}
		<Rep cam={cam} f={0.32} period={1400} render={(x, i) => <g>{Array.from({length: 7}, (_, j) => rnd(i * 7 + j, 3) > 0.45 ? <rect key={j} x={x + 300 + j * 110} y={520 + 60 * (j % 2)} width={40} height={60} fill="#ffcf8a" opacity={0.75} /> : null)}<Sprite k="paris" x={x + 650} y={790} h={300} c="#0c1024" /></g>} />
		<Rep cam={cam} f={0.7} period={640} render={(x) => <g><rect x={x - 3} y={GR - 210} width={6} height={200} fill="#07080f" /><path d={`M${x - 12},${GR - 212} L${x + 12},${GR - 212} L${x + 8},${GR - 236} L${x - 8},${GR - 236} Z`} fill="#ffd58a" /><Glow x={x} y={GR - 224} r={70} c="#ffb44a" o={0.3} /></g>} />
		{/* the phonautograph: the horn he sings into */}
		<g transform={`translate(${hornX},${GR - 8})`}><rect x={-150} y={-12} width={300} height={12} fill="#07080f" /><rect x={-140} y={-110} width={10} height={98} fill="#07080f" /><rect x={120} y={-110} width={10} height={98} fill="#07080f" />
			<rect x={-10} y={-160} width={150} height={56} rx={26} fill="#07080f" /><path d="M-10,-132 L-170,-215 Q-190,-132 -170,-50 Z" fill="#07080f" /><path d="M-170,-215 Q-190,-132 -170,-50" stroke="#c9a46a" strokeWidth={3} fill="none" opacity={0.7} /></g>
		{/* the soot-paper line: drawn while he sings, then lifted up into the night (heard 148 years later) */}
		<g transform={`translate(${560 - 120 * lift},${340 - 160 * lift}) rotate(${-5 + 5 * lift})`} opacity={cl((tau - 9.0) / 0.6)}>
			<rect x={0} y={-46} width={880} height={92} fill="#0b0b0e" opacity={0.92 * (1 - lift)} />
			{n > 1 && <path d={'M14,0 ' + Array.from({length: n}, (_, i) => `L${14 + i * 4},${((Math.sin(i * 0.9) * 17 + Math.sin(i * 0.23) * 9) * (0.55 + 0.45 * Math.sin(i * 0.05))).toFixed(1)}`).join(' ')} stroke={lift > 0 ? '#bfe9ff' : '#f4ecd4'} strokeWidth={2 + 2 * lift} fill="none" filter={lift > 0 ? 'url(#gS)' : undefined} />}
			<text x={0} y={76} style={{fontFamily: SANS, fontSize: 21}} fill="#d8dbe8" opacity={0.85 * (1 - lift)}>烟熏纸上的声波 · 1860 年 4 月 9 日</text>
			<text x={440} y={-70} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}} fill="#bfe9ff" opacity={cl((tau - 14.2) / 0.6)}>2008 年，第一次被放出声音</text></g>
		<Ground c="#07080f" tuft="#151a2a" cam={cam} />
		<Hero tau={tau} look={LOOK.scott} h={h} rim="#cfe0ff" />
		<Fg cam={cam} />
	</svg>;
};

/* Bell: the camera holds on the two rooms; Bell walks to the transmitter; Watson hears it and comes */
const walkTo = (tau: number, x0: number, x1: number, t0: number, look: Look3, h: number) => { const v = speed(look, h), d = Math.abs(x1 - x0), dur = d / v, k = cl((tau - t0) / dur); return {x: x0 + (x1 - x0) * k, u: (k * d) / v / CYCLE}; };
export const BELL: React.FC<SP_ & {hook?: boolean}> = ({tau, t, hook}) => {
	const push = hook ? 1.0 + 0.16 * sm(tau / 9.3) : 1.03 + 0.03 * sm(tau / 19.5);
	const b = walkTo(tau, -120, 470, 0.3, LOOK.bell, 400), vo = 99.4 - T.s5, pulse = hook ? ((tau * 0.35) % 1) : cl((tau - vo) / 3.8);
	const w = walkTo(tau, 1290, 1060, vo + 4.6, LOOK.watson, 400);
	const path = 'M560,530 Q560,250 760,250 L1000,250 Q1110,250 1110,650';
	return <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: hook ? '560px 560px' : '50% 60%'}}>
		<Img src={staticFile('ep41/bell.webp')} style={{position: 'absolute', left: 0, top: -20, width: W, height: H}} />
		<div style={{position: 'absolute', inset: 0, background: hook ? 'rgba(4,3,10,0.35)' : 'rgba(0,0,0,0.05)'}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Glow x={600} y={480} r={260} c="#ffb44a" o={0.22 + 0.04 * Math.sin(t * 7) * Math.sin(t * 3.3)} />
			<g transform="translate(560,650)"><rect x={-40} y={-6} width={80} height={10} fill="#3a2414" /><rect x={-6} y={-80} width={12} height={76} fill="#3a2414" /><path d="M-4,-80 L-44,-120 L36,-120 Z" fill="#6a4a2a" stroke="#c9a46a" strokeWidth={2} /><rect x={-14} y={-26} width={28} height={20} rx={4} fill="#9fb8c8" opacity={0.6} /></g>
			<g transform="translate(1110,690)"><rect x={-30} y={-40} width={60} height={40} rx={4} fill="#2a1a10" stroke="#c9a46a" strokeWidth={2} /><circle cx={0} cy={-20} r={11} fill="#4a3220" /></g>
			<path d={path} stroke="#2a1a10" strokeWidth={3} fill="none" />
			{pulse > 0 && pulse < 1 && <path d={path} stroke={GOLD} strokeWidth={4} fill="none" strokeDasharray="6 22 42 22" strokeDashoffset={-pulse * 900} filter="url(#gS)" opacity={Math.sin(Math.PI * pulse)} />}
			{!hook && pulse > 0.7 && <Glow x={1110} y={670} r={80} c={GOLD} o={0.7 * (1 - cl((tau - vo - 4.5) / 1))} />}
			{!hook && <><Lit3 x={b.x} ground={GR - 20} h={400} u={b.u} look={{...LOOK.bell}} rim="#ffd59a" T={tau} />
				<Lit3 x={w.x} ground={GR - 20} h={400} u={w.u} look={LOOK.watson} flip rim="#e8e0ff" T={tau} /></>}
		</svg>
	</AbsoluteFill>;
};

export const MARCONI: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.marconi, h), cam = v * (tau + 0.5);
	const lost = cl((tau - 6.4) / 2.6), dots = (i: number) => cl((t - (122.4 + i * 0.45)) / 0.12);
	const hillX = 1300 - cam * 0.15;
	return <svg width={W} height={H}>
		<Sky id="sk6" stops={[[0, '#141a26'], [0.6, '#4a5868'], [1, '#7d8b96']]} />
		{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={((rnd(i, 3) * 2600 - tau * 60 - cam * 0.05) % 2600 + 2600) % 2600 - 340} cy={80 + 220 * rnd(i, 4)} rx={300 + 200 * rnd(i, 5)} ry={50 + 30 * rnd(i, 6)} fill={i % 2 ? '#2a323f' : '#232a35'} opacity={0.85} />)}
		<g transform="translate(2050,430)">{Array.from({length: 6}, (_, i) => { const r = 200 + ((tau * 150 + i * 170) % 1020); return <path key={i} d={`M${-r * 0.95},${-r * 0.32} A${r},${r} 0 0,0 ${-r * 0.95},${r * 0.32}`} stroke={CYAN} strokeWidth={3} fill="none" opacity={0.75 * (1 - r / 1220) * cl((t - 121.5) / 1.5)} />; })}</g>
		{[0, 1, 2].map((i) => <g key={i} opacity={dots(i)}><circle cx={1290 + i * 64} cy={250} r={13} fill="#e8fbff" /><Glow x={1290 + i * 64} y={250} r={36} c={CYAN} o={0.75} /></g>)}
		<text x={1354} y={312} textAnchor="middle" style={{fontFamily: LATS, fontSize: 30, fontStyle: 'italic'}} fill="#e8fbff" opacity={cl((t - 123.6) / 0.3)}>“S”</text>
		<rect x={0} y={650} width={W} height={200} fill="#26313e" />
		{Array.from({length: 34}, (_, i) => { const x = ((rnd(i, 2) * 2400 - cam * 0.1 - tau * 30) % 2400 + 2400) % 2400 - 240; return <path key={i} d={`M${x},${670 + rnd(i, 3) * 150} q24,-14 48,0`} stroke="#9fb4c4" strokeWidth={2} fill="none" opacity={0.5} />; })}
		<path d={`M${hillX - 900},${GR} Q${hillX - 400},${560} ${hillX},${540} Q${hillX + 400},${560} ${hillX + 900},${GR} Z`} fill="#141a22" />
		<Sprite k="cabot" x={hillX + 40} y={560} h={170} c="#141a22" />
		{/* the kite that flew, and the one the wind took */}
		<path d={`M${hillX - 120},560 Q${hillX + 60},350 ${hillX + 300 + 10 * Math.sin(t * 1.3)},${150 + 8 * Math.sin(t * 2)}`} stroke="#0e1216" strokeWidth={2} fill="none" />
		<g transform={`translate(${hillX + 300 + 10 * Math.sin(t * 1.3)},${150 + 8 * Math.sin(t * 2)}) rotate(${8 * Math.sin(t * 1.7)})`}><path d="M-30,-34 L34,-6 L12,48 L-44,16 Z" fill="#141a22" /><path d="M-8,48 q-12,30 6,64" stroke="#141a22" strokeWidth={2} fill="none" /></g>
		<g transform={`translate(${hillX - 300 + 900 * lost},${220 - 260 * lost}) rotate(${200 * lost})`} opacity={1 - cl((tau - 8.5) / 1)}><path d="M-24,-28 L28,-5 L10,40 L-36,13 Z" fill="#141a22" /></g>
		<path d={`M${hillX - 300},560 Q${hillX - 300 + 300 * lost},${400 - 100 * lost} ${hillX - 300 + 900 * lost},${220 - 260 * lost}`} stroke="#0e1216" strokeWidth={1.5} fill="none" opacity={(1 - lost) * 0.9} />
		<Ground c="#0b0f14" tuft="#1a2230" cam={cam} />
		<Hero tau={tau} look={LOOK.marconi} h={h} rim="#dbe8f0" />
		<Fg cam={cam} />
		<Rain t={t} k={0.6} slant={30} />
	</svg>;
};

export const ARPA: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.kline, h), stopAt = 7.5, tw = Math.min(tau, stopAt), cam = v * (tw + 0.5);
	const L = t > 139.8, O = t > 142.0, G = t > 143.2, glitch = G ? cl((t - 143.2) / 0.95) : 0;
	const shake = glitch > 0 ? (rnd(Math.floor(t * 30), 5) - 0.5) * 28 * glitch : 0;
	return <svg width={W} height={H}><g transform={`translate(${shake},${shake * 0.4})`}>
		<rect width={W} height={H} fill="#16302c" /><rect x={0} y={140} width={W} height={GR - 140} fill="#1f3c37" />
		<Rep cam={cam} f={0.15} period={600} render={(x) => <rect x={x + 100} y={70} width={380} height={30} fill="#e8f4ec" opacity={0.75} />} />
		<rect x={0} y={130} width={W} height={4} fill="#1c2a2c" />
		<Rep cam={cam} f={0.5} period={1500} render={(x, i) => <g><Sprite k="mainframe" x={x + 700} y={GR - 10} h={430} c="#0e1a1a" />
			{Array.from({length: 30}, (_, j) => <circle key={j} cx={x + 520 + (j % 10) * 30 + Math.floor(j / 10) * 120} cy={500 + Math.floor(j / 10) * 16} r={3.5} fill={rnd(i * 30 + j, Math.floor(t * 4)) > 0.5 ? '#ff6a4a' : '#ffd77a'} opacity={0.5 + 0.5 * rnd(j, Math.floor(t * 6))} />)}</g>} />
		<Ground c="#0b1414" tuft="#0b1414" cam={cam} />
		{/* the terminal: two letters, then the crash */}
		<g transform="translate(1270,330)" opacity={cl((tau - 6.0) / 0.6)}><rect x={-300} y={-150} width={600} height={300} rx={18} fill="#03100a" opacity={0.92} stroke="#1f4a2e" strokeWidth={4} />
			{L && <text x={-210} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" filter="url(#gS)">L</text>}
			{O && <text x={-95} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" filter="url(#gS)">O</text>}
			{G && <text x={20} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" opacity={0.6 * (1 - glitch)} transform={`translate(${(rnd(Math.floor(t * 30), 2) - 0.5) * 40 * glitch},0)`}>G</text>}
			{!G && Math.floor(t / 0.4) % 2 === 0 && <rect x={L ? (O ? 20 : -95) : -210} y={80} width={100} height={14} fill="#8dffae" />}
			{Array.from({length: 8}, (_, i) => <rect key={i} x={-300} y={-150 + i * 38 + 8 * rnd(i + Math.floor(t * 10 * glitch), 3)} width={600} height={3 + 5 * rnd(i, 4) + 22 * glitch * rnd(i, 9)} fill="#8dffae" opacity={0.08 + 0.3 * glitch} />)}
			{G && <text x={0} y={128} textAnchor="middle" style={{fontFamily: MONO, fontSize: 26, letterSpacing: '0.2em'}} fill="#ff6a5a" opacity={glitch > 0.4 ? 1 : 0}>SYSTEM CRASH</text>}</g>
		<Lit3 x={760} ground={GR} h={h} u={tw / CYCLE} look={LOOK.kline} rim="#c8ffe0" T={tau} />
	</g></svg>;
};
export const CRASH: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}><text x={940} y={560} style={{fontFamily: MONO, fontSize: 60}} fill="#8dffae" opacity={Math.floor((t - T.crash) / 0.4) % 2 === 0 ? 0.85 : 0}>_</text></svg></AbsoluteFill>;

export const BJ: React.FC<SP_> = ({tau, t}) => {
	const h = 430, v = speed(LOOK.bj, h), cam = v * (tau + 0.5);
	const txt = 'Across the Great Wall we can reach every corner in the world.', n = Math.floor(txt.length * cl((t - 154.1) / 6.6));
	const wallY = (x: number) => 520 - 70 * Math.sin((x + cam * 0.05) * 0.0062) - 30 * Math.sin((x + cam * 0.05) * 0.0175);
	return <svg width={W} height={H}>
		<Sky id="sk8" stops={[[0, '#16213f'], [0.55, '#6e6a8a'], [0.85, '#e0a888'], [1, '#f2c49a']]} />
		<path d={ridge(cam, 0.05, 600, 150, 21)} fill="#5a5878" />
		<path d={'M0,' + wallY(0) + ' ' + Array.from({length: 49}, (_, i) => `L${i * 40},${wallY(i * 40).toFixed(1)}`).join(' ')} stroke="#3e3c58" strokeWidth={12} fill="none" />
		{Array.from({length: 7}, (_, i) => { const x = ((i * 300 - cam * 0.05) % 2100 + 2100) % 2100 - 90; return <rect key={i} x={x - 15} y={wallY(x) - 38} width={30} height={38} fill="#3e3c58" />; })}
		<text x={960} y={300} textAnchor="middle" style={{fontFamily: MONO, fontSize: 34}} fill="#fff7e0" stroke="rgba(40,30,60,0.6)" strokeWidth={5} paintOrder="stroke">{txt.slice(0, n)}<tspan opacity={Math.floor(t / 0.4) % 2 ? 0 : 1}>{n > 0 ? '_' : ''}</tspan></text>
		<Rep cam={cam} f={0.35} period={1600} render={(x) => <Sprite k="hutong" x={x + 700} y={790} h={300} c="#2a2838" />} />
		<Rep cam={cam} f={0.6} period={900} render={(x, i) => rnd(i, 4) > 0.4 ? <Sprite k="cyclist" x={x + 300 - ((tau * 90) % 900)} y={GR - 8} h={190} c="#151420" flip={rnd(i, 5) > 0.5} /> : null} />
		<Ground c="#1a1822" tuft="#26232f" cam={cam} />
		<Hero tau={tau} look={LOOK.bj} h={h} rim="#ffd8c0" />
		<Fg cam={cam} c="#09080e" />
	</svg>;
};

const PROCK = ['shang', 'du', 'morse', 'scott', 'bell', 'marconi', 'kline', 'bj'];
export const FIN: React.FC<SP_> = ({tau, t}) => {
	const out = t >= T.outro, k = out ? t - T.outro : 0;
	const call = cl((tau - 1.0) / 2.0) * (1 - cl((tau - 8.0) / 1.2));
	return <AbsoluteFill>
		<Img src={staticFile('ep41/space.webp')} style={{position: 'absolute', left: -40 - tau * 3, top: -60, width: W + 120, height: H + 120, opacity: 0.95}} />
		<div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.15 + 0.35 * cl((t - 180) / 3)})`}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{/* two lit windows far apart, one phone line between them: Druyan and Sagan */}
			<g opacity={call}>
				<rect x={360} y={380} width={140} height={190} fill="#ffcf8a" opacity={0.85} /><rect x={1420} y={360} width={140} height={190} fill="#ffcf8a" opacity={0.85} />
				<g fill="#140f1c"><circle cx={430} cy={440} r={22} /><path d="M400,570 Q404,480 430,466 Q458,480 462,570 Z" /><circle cx={1490} cy={420} r={22} /><path d="M1460,550 Q1464,460 1490,446 Q1518,460 1522,550 Z" /></g>
				<path d={`M500,440 Q960,${200 - 40 * Math.sin(t * 2)} 1420,420`} stroke={GOLD} strokeWidth={3} fill="none" strokeDasharray="10 16" strokeDashoffset={-t * 60} filter="url(#gS)" />
				<text x={430} y={610} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill="#fff" opacity={0.8}>安·德鲁扬</text><text x={1490} y={590} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill="#fff" opacity={0.8}>卡尔·萨根</text>
			</g>
			{/* the record leaves — the line becomes the record's glow */}
			<g transform={`translate(${1500 - 26 * Math.max(0, tau - 8)},${250 - 5 * Math.max(0, tau - 8)}) rotate(-10) scale(${Math.max(0.45, 1 - 0.022 * Math.max(0, tau - 8))})`} opacity={cl((tau - 7.5) / 1.5)}>
				<Glow x={0} y={30} r={240} c={GOLD} o={0.22} />
				<path d="M-130,-30 Q0,-140 130,-30 Z" fill="#d9dce6" /><rect x={-4} y={-120} width={8} height={90} fill="#d9dce6" /><path d="M-60,-30 L60,-30 L70,10 L-70,10 Z" fill="#9aa0b0" />
				<line x1={60} y1={-10} x2={300} y2={-50} stroke="#d9dce6" strokeWidth={4} /><line x1={-60} y1={0} x2={-270} y2={70} stroke="#d9dce6" strokeWidth={4} />
				<circle cx={-22} cy={58} r={46} fill="#d8b04a" />{[34, 25, 16].map((r) => <circle key={r} cx={-22} cy={58} r={r} fill="none" stroke="#a8862a" strokeWidth={1.5} />)}
				<circle cx={-22} cy={58} r={60 + 30 * Math.max(0, 1 - ((t % BEAT) / 0.25))} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5 * Math.max(0, 1 - ((t % BEAT) / 0.25))} /></g>
			{/* everyone who ever tried, walking together */}
			<g opacity={cl((tau - 9.0) / 1.5)}>{PROCK.map((p, i) => <Lit3 key={p} x={300 + i * 190} ground={GR + 40} h={280} u={t / CYCLE + i * 0.37} look={LOOK[p]} col="#06050a" far="#151220" rim="#c9b8ff" />)}</g>
			<g opacity={fio(t, 180.2, 184.9, 0.6)}><text x={960} y={330} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill="#fff">为了跟你说一句话，</text>
				<text x={960} y={440} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill={GOLD} opacity={cl((t - 181.8) / 0.5)}>人类努力了三千年。</text></g>
			<g opacity={cl((t - 185.1) / 0.7)}><text x={960} y={400} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84}} fill={GOLD}>你最想对谁说一句话？</text>
				<text x={960} y={480} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34}} fill="#fff" opacity={0.85}>写在评论区，也许，ta 会听见。</text></g>
		</svg>
		{out && k < 0.01 ? null : null}
	</AbsoluteFill>;
};
void MANDEL;
