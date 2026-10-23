import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {Lit, Walker2} from './walker2';
import {W, H, SERIF, SANS, GOLD, rnd, LOOK, BG, Glow, Label} from './ep41parts';

/* ep41 — the first 35 s, rebuilt the reference's way (owner notes 2026-10-23 22:28):
   the walker stays in place and the world slides past in parallax layers; the background acts out the narration;
   no static frames. Music: バケモノの唄 (instrumental), 106 BPM, beat 0.56681 s, beat 0 at 0.8214 s.
   0–9.28 hook over the quiet intro · 9.28 the hit → rewind, one era per two beats · 18.96 the 商 scene (verse). */
const FPS = 30, BEAT = 0.56681, B0 = 0.8214;
const bt = (n: number) => B0 + n * BEAT;
export const T_HIT = bt(15), T_SCENE = bt(32), T_END = 35.4;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const fio = (t: number, a: number, b: number, f = 0.35) => cl((t - a) / f) * cl((b - t) / f);

/** a sprite drawn as a flat silhouette in one colour (the PNGs are white with alpha) */
const tint = (id: string, c: string) => { const r = parseInt(c.slice(1, 3), 16) / 255, g = parseInt(c.slice(3, 5), 16) / 255, b = parseInt(c.slice(5, 7), 16) / 255;
	return <filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0`} /></filter>; };
const SP: Record<string, [number, number]> = {hall: [1340, 664], ding: [648, 705], hut: [787, 494], tree: [839, 827]};
const Sprite: React.FC<{k: string; x: number; y: number; h: number; f: string; flip?: boolean}> = ({k, x, y, h, f, flip}) => { const [iw, ih] = SP[k], w = iw * h / ih;
	return <image href={staticFile(`ep41/sp/${k}.png`)} x={flip ? -x - w / 2 : x - w / 2} y={y - h} width={w} height={h} filter={`url(#${f})`} transform={flip ? 'scale(-1,1)' : undefined} />; };
/** a layer that repeats a pattern of items every `period` px of world space */
const Rep: React.FC<{cam: number; f: number; period: number; render: (x: number, i: number) => React.ReactNode; pad?: number}> = ({cam, f, period, render, pad = 900}) => {
	const off = cam * f, i0 = Math.floor((off - pad) / period), i1 = Math.ceil((off + W + pad) / period);
	return <>{Array.from({length: i1 - i0 + 1}, (_, k) => { const i = i0 + k; return <g key={i}>{render(i * period - off, i)}</g>; })}</>;
};
const ridgeD = (cam: number, f: number, base: number, amp: number, seed: number) => { const off = cam * f; let d = `M0,${H} L0,${base}`;
	for (let x = 0; x <= W; x += 24) { const u = x + off; d += ` L${x},${(base - amp * (0.55 + 0.25 * Math.sin(u * 0.0031 + seed) + 0.2 * Math.sin(u * 0.0107 + seed * 3))).toFixed(1)}`; }
	return d + ` L${W},${H} Z`; };

/* ---------- the hook: a night line of telegraph poles, one pulse of light running along the wire ---------- */
const Hook: React.FC<{t: number}> = ({t}) => { const cam = 60 * t, poleY = 860;
	const sag = (x0: number) => `M${x0},${poleY - 330} Q${x0 + 260},${poleY - 300} ${x0 + 520},${poleY - 330}`;
	const pulseX = 200 + ((t * 260) % 2400) - 300;
	return <AbsoluteFill style={{background: 'linear-gradient(180deg,#03040b 0%,#0b0f24 60%,#1b1838 100%)'}}><svg width={W} height={H}>
		{Array.from({length: 160}, (_, i) => <circle key={i} cx={(rnd(i, 50) * W * 1.3 - cam * 0.03) % W} cy={rnd(i, 51) * 700} r={0.6 + 1.4 * rnd(i, 52)} fill="#eef" opacity={(0.15 + 0.5 * rnd(i, 53)) * (0.7 + 0.3 * Math.sin(t * 2 + i))} />)}
		<path d={ridgeD(cam, 0.12, 790, 120, 2)} fill="#141633" />
		<Rep cam={cam} f={0.12} period={260} render={(x, i) => rnd(i, 9) > 0.55 ? <circle cx={x + 80} cy={760 - 30 * rnd(i, 4)} r={2.2} fill="#ffcf8a" opacity={0.7} /> : null} />
		<path d={ridgeD(cam, 0.35, 840, 70, 5)} fill="#0c0d20" />
		<Rep cam={cam} f={0.7} period={520} render={(x) => <g><rect x={x - 5} y={poleY - 340} width={10} height={340} fill="#06060f" /><rect x={x - 40} y={poleY - 334} width={80} height={7} fill="#06060f" /><path d={sag(x)} stroke="#151633" strokeWidth={2.5} fill="none" /></g>} />
		<g opacity={cl((t - 0.8) / 0.6)}><circle cx={pulseX} cy={poleY - 318 + 14 * Math.sin((pulseX + cam * 0.7) / 520 * Math.PI) ** 2} r={6} fill="#fff4d0" /><Glow x={pulseX} y={poleY - 318} r={60} c={GOLD} o={0.55} /></g>
		<rect x={0} y={poleY} width={W} height={H - poleY} fill="#04040a" />
		<text x={960} y={450} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill="#fff" opacity={fio(t, 0.9, 9.0, 0.5)}>人类打出的第一通电话，</text>
		<text x={960} y={545} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill={GOLD} opacity={fio(t, 4.4, 9.0, 0.5)}>第一句话，说的是什么？</text>
	</svg></AbsoluteFill>; };

/* ---------- the rewind: eight eras backwards, two beats each, the walker walking backwards ---------- */
const REW: [string, string, number, string][] = [['bj', 'bj', -70, '1987'], ['arpa', 'kline', -120, '1969'], ['marconi', 'marconi', -20, '1901'], ['bell', 'bell', -20, '1876'], ['scott', 'scott', -110, '1860'], ['morse', 'morse', -80, '1844'], ['du', 'du', -95, '757'], ['shang', 'shang', -20, '公元前 1200']];
const Rewind: React.FC<{t: number}> = ({t}) => { const u = (t - T_HIT) / (2 * BEAT), k = Math.floor(u), loc = u - k;
	if (k >= 8) { const v = (t - bt(31)) / BEAT; return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}><text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 110}} fill="#fff" opacity={fio(v, 0, 1.0, 0.12)}>三千年前</text></svg></AbsoluteFill>; }
	const [bg, who, oy, year] = REW[k];
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `scale(${1.08 - 0.05 * loc}) translateX(${60 * loc}px)`, filter: 'blur(2.5px) saturate(0.8)'}}><BG k={bg} oy={oy} /></AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<g transform={`translate(${-180 * loc},0)`}><Lit x={900} h={420} q={6 - 2 * u} look={LOOK[who]} rim="#ffffff" /></g>
			<rect width={W} height={H} fill="#000" opacity={0.25} />
			{Array.from({length: 10}, (_, r) => <rect key={r} x={0} y={rnd(r + k * 13, 30) * H} width={W} height={2 + 5 * rnd(r, 31)} fill="#fff" opacity={0.13} />)}
			<text x={960} y={590} textAnchor="middle" style={{fontFamily: year.length > 4 ? SERIF : '"DejaVu Sans", sans-serif', fontWeight: 900, fontSize: year.length > 4 ? 130 : 180}} fill="#fff" opacity={0.95}>{year}</text>
			<text x={960} y={666} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 34}} fill={GOLD}>◀◀</text>
		</svg></AbsoluteFill>; };

/* ---------- 商 · 殷墟: the walker in place, the world in five layers ---------- */
const NAR = {n1: [19.45, 6.72], q: [26.35, 1.84], n2: [28.5, 6.0]};   // start, length (filled from the clips)
const Shang: React.FC<{t: number}> = ({t}) => {
	const tau = t - T_SCENE, h = 400, L = 0.33 * h, v = L / BEAT, cam = v * (tau + 1.2), q = cam / L;
	const rain = cl((t - (NAR.n2[0] + 3.0)) / 1.2), cloud = cl((t - NAR.q[0] + 0.6) / 3.5);
	const cracks = cl((t - (NAR.n1[0] + 4.6)) / 1.6), qChars = (i: number) => cl((t - (NAR.q[0] - 0.2) - i * 0.28) / 0.3);
	const fireX = 2400 - cam * 0.55;                                   // the diviner's fire, on the mid layer
	return <AbsoluteFill>
		<svg width={W} height={H}>
			<defs>{tint('tHall', '#1b1426')}{tint('tMid', '#130e1c')}{tint('tTree', '#0d0a14')}{tint('tFg', '#030205')}
				<linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060814" /><stop offset="0.55" stopColor="#1b1733" /><stop offset="0.86" stopColor="#5a2f2c" /><stop offset="1" stopColor="#7a3e28" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#skyS)" />
			{Array.from({length: 170}, (_, i) => { const x = ((rnd(i, 50) * W * 1.4 - cam * 0.02) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2; return <circle key={i} cx={x} cy={rnd(i, 51) * 620} r={0.6 + 1.5 * rnd(i, 52)} fill="#eef" opacity={(0.15 + 0.5 * rnd(i, 53)) * (1 - 0.8 * cloud)} />; })}
			<circle cx={1560} cy={170} r={46} fill="#f2e8cf" opacity={1 - 0.7 * cloud} /><Glow x={1560} y={170} r={170} c="#f2e8cf" o={0.18 * (1 - cloud)} />
			{/* the question, carved, hangs in the sky as the plastron cracks below */}
			<g transform="translate(1460,300)" opacity={cl((t - (NAR.q[0] - 1.0)) / 0.8) * (1 - 0.6 * rain)}>
				<Glow x={0} y={0} r={240} c="#ffcf8a" o={0.2} />
				<path d="M-120,-160 Q-138,0 -100,140 Q0,180 100,140 Q138,0 120,-160 Q0,-190 -120,-160 Z" fill="#e6d6ad" />
				<path d="M0,-176 L0,166 M-120,-50 L120,-50 M-112,50 L112,50" stroke="#b9a073" strokeWidth={2} />
				{[['其', 42, -100], ['自', 42, -42], ['東', 42, 16], ['來', -42, -100], ['雨', -42, -42]].map(([c, x, y], i) => <text key={c as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 300, fontSize: 46}} fill="#6b3a1a" opacity={qChars(i)}>{c}</text>)}
				<text x={-42} y={120} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 300, fontSize: 40}} fill="#8a2a1a" opacity={cl((t - (NAR.n2[0] + 3.2)) / 0.6)}>允雨</text>
			</g>
			{/* clouds roll in from the east */}
			{Array.from({length: 7}, (_, i) => { const x = W + 300 - cloud * (1500 + 300 * rnd(i, 3)) + 400 * rnd(i, 4) - (tau * 18); return <ellipse key={i} cx={x} cy={120 + 200 * rnd(i, 5)} rx={260 + 160 * rnd(i, 6)} ry={50 + 30 * rnd(i, 7)} fill="#2a2a44" opacity={0.75 * cloud} />; })}
			{/* far hills, then the settlement */}
			<path d={ridgeD(cam, 0.04, 660, 140, 3)} fill="#3d2f52" opacity={0.8} /><path d={ridgeD(cam, 0.08, 720, 100, 1)} fill="#2f2442" />
			<Rep cam={cam} f={0.22} period={1150} render={(x, i) => <g><Sprite k="hall" x={x + 300} y={760} h={190 + 30 * rnd(i, 1)} f="tHall" flip={rnd(i, 2) > 0.5} />
				<rect x={x + 300 - 14} y={760 - 52} width={28} height={44} fill="#ffb766" opacity={0.85} /><Glow x={x + 300} y={735} r={70} c="#ff9a4a" o={0.35} /></g>} />
			<path d={ridgeD(cam, 0.3, 790, 30, 7)} fill="#1c1428" />
			{/* mid layer: trees, huts, the ding — and the diviner at the fire */}
			<Rep cam={cam} f={0.55} period={1700} render={(x, i) => <g><Sprite k="tree" x={x + 200} y={845} h={360 + 60 * rnd(i, 8)} f="tTree" /><Sprite k="hut" x={x + 1050} y={845} h={170} f="tMid" /></g>} />
			<g transform={`translate(${fireX},845)`}>
				<Glow x={0} y={-60} r={220} c="#ff8a3a" o={0.45 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7)} />
				<Sprite k="ding" x={-230} y={0} h={150} f="tMid" />
				<path d={`M-34,0 L-14,${-70 - 12 * Math.sin(t * 11)} L0,-26 L16,${-96 - 14 * Math.sin(t * 9 + 1)} L36,0 Z`} fill="#ffb347" /><path d={`M-18,0 L-6,${-44 - 8 * Math.sin(t * 13)} L8,-16 L18,${-56 - 8 * Math.sin(t * 10)} L26,0 Z`} fill="#fff0b0" />
				{/* the diviner kneels, holding the plastron over the fire with a hot rod */}
				<g fill="#0a0710"><path d="M120,0 Q118,-60 140,-92 Q160,-120 150,-150 L176,-160 Q196,-120 190,-80 Q200,-30 230,0 Z" /><circle cx={160} cy={-178} r={20} /><path d="M146,-120 Q110,-110 74,-96 L70,-86 Q112,-96 152,-100 Z" />
					<path d="M154,-130 Q100,-140 60,-120" stroke="#0a0710" strokeWidth={9} fill="none" strokeLinecap="round" /></g>
				<g transform="translate(40,-120) rotate(-12)"><ellipse rx={44} ry={28} fill="#e0cfa6" />
					<path d={`M0,-26 L0,${-26 + 52 * cracks} M0,-4 L${30 * cracks},${-14 * cracks} M0,10 L${-26 * cracks},${22 * cracks}`} stroke="#ffcf6a" strokeWidth={3} fill="none" filter="url(#gS)" opacity={cracks} /></g>
				<line x1={64} y1={-122} x2={30} y2={-104} stroke="#ff7a3a" strokeWidth={4} strokeLinecap="round" />
				{Array.from({length: 14}, (_, i) => { const u = ((t * 0.6 + rnd(i, 1)) % 1); return <circle key={i} cx={(rnd(i, 2) - 0.5) * 40 + Math.sin(u * 8 + i) * 10} cy={-60 - u * 260} r={1.6 + rnd(i, 3) * 1.6} fill="#ffcf6a" opacity={1 - u} />; })}
			</g>
			{/* the walking line */}
			<rect x={0} y={845} width={W} height={H - 845} fill="#0b0812" />
			<Rep cam={cam} f={1} period={120} pad={200} render={(x, i) => <path d={`M${x},868 l${6 + 10 * rnd(i, 1)},${-16 - 24 * rnd(i, 2)} M${x + 10},868 l${-4 - 8 * rnd(i, 3)},${-12 - 18 * rnd(i, 4)}`} stroke="#1a1424" strokeWidth={3} strokeLinecap="round" />} />
			<Lit x={760} h={h} q={q + 0.5} look={LOOK.shang} rim="#ff9a5a" T={t} />
			{/* foreground reeds rush past, out of focus */}
			<Rep cam={cam} f={1.6} period={1300} pad={300} render={(x, i) => <g filter="url(#blurF)">{Array.from({length: 9}, (_, j) => <path key={j} d={`M${x + j * 18},${H + 20} Q${x + j * 18 + 10},${H - 200} ${x + j * 18 + 30 * rnd(i * 9 + j, 5)},${H - 260 - 120 * rnd(i * 9 + j, 6)}`} stroke="#030205" strokeWidth={7} fill="none" />)}</g>} />
			{/* rain: the answer */}
			{rain > 0 && Array.from({length: 220}, (_, i) => { const x = (rnd(i, 21) * (W + 300) + t * 120) % (W + 300) - 150, y = ((rnd(i, 22) * H + t * 1400 * (0.8 + 0.4 * rnd(i, 23))) % (H + 100)) - 50; return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#c9d6ff" strokeWidth={1.4} opacity={0.45 * rain} />; })}
			<rect width={W} height={H} fill="#1a2240" opacity={0.25 * rain} />
		</svg>
	</AbsoluteFill>; };

/* narration subtitles: one Chinese line at a time (≤ 18 字), in step with the voice */
const SUBS: [number, number, string, string?][] = [
	[NAR.n1[0], NAR.n1[0] + 3.0, '三千年前，商朝的占卜师，'], [NAR.n1[0] + 3.0, NAR.n1[0] + NAR.n1[1] + 0.2, '把一个问题刻在龟甲上，放进火里烤。'],
	[NAR.q[0] - 0.1, NAR.q[0] + NAR.q[1] + 0.3, '「雨，会从东边来吗？」', '其自东来雨？'],
	[NAR.n2[0], NAR.n2[0] + 3.0, '裂开的纹路，就是天的回答。'], [NAR.n2[0] + 3.0, NAR.n2[0] + NAR.n2[1] + 0.6, '那一天，真的下雨了。'],
];
export const Ep41Open: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const body = t < T_HIT ? <Hook t={t} /> : t < T_SCENE ? <Rewind t={t} /> : <Shang t={t} />;
	const s = SUBS.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		{body}
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><filter id="gS" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="blurF" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter></defs>
			{t >= T_SCENE && <g opacity={fio(t, T_SCENE + 0.5, T_END + 1, 0.5)}><Label year="约公元前 1200 年" name="商 · 殷墟" /></g>}
			{s && <g opacity={fio(t, s[0], s[1], 0.18)}>
				{s[3] && <text x={W / 2} y={960} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40}} fill="#fff" opacity={0.9}>{s[3]}</text>}
				<text x={W / 2} y={s[3] ? 1022 : 1000} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 700, letterSpacing: '0.04em'}} fill="#ffe6b0" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">{s[2]}</text></g>}
		</svg>
		<AbsoluteFill style={{background: '#000', opacity: cl((t - (T_SCENE - 0.05)) / -0.6 + 1) * (t >= T_SCENE ? 1 : 0)}} />
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP41OPEN" component={Ep41Open} durationInFrames={Math.round(T_END * FPS)} fps={FPS} width={W} height={H} />);
void Img; void Walker2; void sm;
