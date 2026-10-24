import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Lit, Walker2} from './walker2';
import {W, H, SERIF, SANS, LATS, MONO, GOLD, CYAN, rnd, LOOK, BG, Glow, Label, Subs, Plastron, Phonautograph, Morse as MorseStatic, Voyager} from './ep41parts';

/* ep41 《为了跟你说一句话，人类努力了三千年》 — the film (demo cut, 128.6 s on the owner's EDM, song 119.35 → 248.0).
   Timing comes from the BGM grid (audio/bgm_grid.json): film t = song t − 119.35.
   Grid A (before the silence): beat 0.62889 s, downbeats every 2.51556 s from film 0.
   The track's own 1.6 s silence (film 81.70–83.30) is the ARPANET crash. Grid B: drop at film 93.42, bars 2.5125 s. */
const FPS = 30, BA = 0.62889, BAR = 4 * BA, BARB = 2.5125;
export const S = [0, 2 * BAR, 5 * BAR, 9 * BAR, 13 * BAR, 17 * BAR, 21 * BAR, 25 * BAR, 29 * BAR, 93.42 - 4 * BARB, 93.42];
export const SILENCE: [number, number] = [81.70, 83.30];
export const END = 93.42 + 14 * BARB + 2 * BARB;     // 128.6: drop + 14 bars, then a 2-bar fade
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const fadeIO = (t: number, a: number, b: number, f = 0.35) => cl((t - a) / f) * cl((b - t) / f);

/** one step per beat; `plan` = [[start τ, steps], …]. Returns x and q (steps walked) so feet never slide. */
const walk = (tau: number, x0: number, h: number, plan: [number, number][], q0 = 0.5) => {
	const L = 0.33 * h; let q = q0;
	for (const [t0, n] of plan) q += Math.max(0, Math.min(n, (tau - t0) / BA));
	return {x: x0 + (q - q0) * L, q};
};

/* VO clips (eleven_v4, ep41-vo-01) — durations from the farm's report */
export const VO: Record<string, {at: number; dur: number}> = {
	shang: {at: S[2] + BAR, dur: 1.84}, du: {at: S[3] + BAR, dur: 3.52}, morse: {at: S[4] + BAR, dur: 1.84}, scott: {at: S[5] + BAR, dur: 4.88},
	bell: {at: S[6] + 5 * BA, dur: 2.88}, marconi: {at: S[7] + 2 * BAR, dur: 2.0}, kline: {at: S[8] + 5 * BA, dur: 2.56}, beijing: {at: S[9] + BARB, dur: 4.08}, voyager: {at: S[10] + 3 * 0.62813, dur: 4.72},
};
const subWin = (k: string, tail = 1.6, min = 3.4): [number, number] => [VO[k].at - 0.15, VO[k].at + Math.max(min, VO[k].dur + tail)];

type SceneProps = {tau: number; T: number};
const H0 = 420;

const Shang: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.3, 15]]); const op = cl((tau - 0.8) / 1.2);
	return <><BG k="shang" oy={-20} /><svg width={W} height={H} style={{position: 'absolute'}}><g opacity={op}><Plastron /></g>
		<g opacity={0.6 + 0.4 * Math.sin(tau * 9) * Math.sin(tau * 4.3)}><Glow x={1218} y={655} r={90} c="#ff9a4a" o={0.45} /></g>
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.shang} rim="#ffb070" T={tau} /></svg></>; };

const Du: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.3, 15]]);
	return <><BG k="du" oy={-95} /><svg width={W} height={H} style={{position: 'absolute'}}>
		{Array.from({length: 36}, (_, i) => { const t0 = rnd(i, 7) * 10, u = ((tau - t0) / 6 + 1) % 1, x = 100 + rnd(i, 8) * 1700 + u * 160 + Math.sin(u * 9 + i) * 24, y = 300 + u * 620; return <ellipse key={i} cx={x} cy={y} rx={5} ry={3} fill="#f6b3c4" opacity={0.85 * Math.sin(Math.PI * u)} transform={`rotate(${u * 300 + i * 20} ${x} ${y})`} />; })}
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.du} rim="#ffd0a0" T={tau} /></svg></>; };

const MorseScene: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.3, 15]]); const p0: [number, number] = [330, 228], p1: [number, number] = [1450, 317];
	const sym = '·—— · —·· ·· ·—'.split('');
	return <><BG k="morse" oy={-80} /><svg width={W} height={H} style={{position: 'absolute'}}>
		{sym.map((c, i) => { const u = (tau - 2.2) / 4.2 - i * 0.07; if (c === ' ' || u < 0 || u > 1) return null; const x = p0[0] + (p1[0] - p0[0]) * u, y = p0[1] + (p1[1] - p0[1]) * u + 32 * u * (1 - u);
			return <g key={i} opacity={Math.sin(Math.PI * u) * 1.4}>{c === '·' ? <circle cx={x} cy={y} r={7} fill={GOLD} /> : <rect x={x - 16} y={y - 5} width={32} height={10} rx={5} fill={GOLD} />}<Glow x={x} y={y} r={22} c={GOLD} o={0.7} /></g>; })}
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.morse} rim="#fff4d8" T={tau} /></svg></>; };
void MorseStatic;

const Scott: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.2, 5]]); const vo = VO.scott.at - S[5]; const u = cl((tau - vo) / (VO.scott.dur + 0.4));
	const n = Math.floor(214 * u);
	return <><BG k="scott" oy={-110} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<g transform="translate(600,330) rotate(-5)" opacity={cl((tau - 1) / 0.8)}><rect x={0} y={-46} width={880} height={92} fill="#0b0b0e" opacity={0.92} />
			{n > 1 && <path d={'M14,0 ' + Array.from({length: n}, (_, i) => `L${14 + i * 4},${((Math.sin(i * 0.9) * 17 + Math.sin(i * 0.23) * 9) * (0.55 + 0.45 * Math.sin(i * 0.05))).toFixed(1)}`).join(' ')} stroke="#f4ecd4" strokeWidth={2} fill="none" />}
			<circle cx={14 + n * 4} cy={0} r={4} fill="#fff" opacity={u > 0 && u < 1 ? 1 : 0} />
			<text x={0} y={76} style={{fontFamily: SANS, fontSize: 21}} fill="#d8dbe8" opacity={0.85}>烟熏纸上的声波 · 1860 年 4 月 9 日</text></g>
		<Phonautograph x={760} y={872} />
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.scott} rim="#cfe0ff" T={tau} /></svg></>; };

const Bell: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -84, 400, [[0.3, 4]]); const vo = VO.bell.at - S[6];
	const pulse = cl((tau - vo) / (VO.bell.dur + 0.6)), lean = 4 + 10 * ease((tau - 2.6) / 0.6) * (1 - ease((tau - vo - 3.4) / 0.6));
	const wat = walk(tau, 1260, 400, [[vo + 3.3, 2]], 0);              // Watson hears it and walks toward the wall
	const path = 'M560,530 Q560,250 760,250 L1000,250 Q1110,250 1110,650';
	return <><BG k="bell" oy={-20} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<g transform="translate(560,650)"><rect x={-40} y={-6} width={80} height={10} fill="#3a2414" /><rect x={-6} y={-80} width={12} height={76} fill="#3a2414" /><path d="M-4,-80 L-44,-120 L36,-120 Z" fill="#6a4a2a" stroke="#c9a46a" strokeWidth={2} /><rect x={-14} y={-26} width={28} height={20} rx={4} fill="#9fb8c8" opacity={0.6} /></g>
		<g transform="translate(1110,690)"><rect x={-30} y={-40} width={60} height={40} rx={4} fill="#2a1a10" stroke="#c9a46a" strokeWidth={2} /><circle cx={0} cy={-20} r={11} fill="#4a3220" /></g>
		<path d={path} stroke="#2a1a10" strokeWidth={3} fill="none" />
		{pulse > 0 && pulse < 1 && <path d={path} stroke={GOLD} strokeWidth={4} fill="none" strokeDasharray="6 22 42 22" strokeDashoffset={-pulse * 900} filter="url(#gS)" opacity={Math.sin(Math.PI * pulse)} />}
		{pulse > 0.75 && <Glow x={1110} y={670} r={70} c={GOLD} o={0.7 * (1 - cl((tau - vo - 3.6) / 1))} />}
		<Lit x={w.x} h={400} q={w.q} look={{...LOOK.bell, stoop: lean}} rim="#ffd59a" armOverride={tau > 2.7 ? [55, 75] : undefined} T={tau} />
		<Lit x={wat.x} h={400} q={wat.q} look={LOOK.watson} flip rim="#e8e0ff" T={tau} /></svg></>; };

const Marconi: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.3, 7]]);
	return <><BG k="marconi" oy={-20} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<path d={`M480,800 Q640,420 ${980 + 8 * Math.sin(tau * 1.3)},${170 + 6 * Math.sin(tau * 2.1)}`} stroke="#0e1216" strokeWidth={2} fill="none" />
		<g transform={`translate(${980 + 8 * Math.sin(tau * 1.3)},${170 + 6 * Math.sin(tau * 2.1)}) rotate(${6 * Math.sin(tau * 1.7)})`}><path d="M-25,-30 L30,-5 L10,45 L-40,15 Z" fill="#14181e" /><path d="M-5,45 q-10,30 6,60" stroke="#14181e" strokeWidth={2} fill="none" /></g>
		<g transform="translate(2050,420)">{Array.from({length: 6}, (_, i) => { const r = 200 + ((tau * 140 + i * 170) % 1020); return <path key={i} d={`M${-r * 0.95},${-r * 0.32} A${r},${r} 0 0,0 ${-r * 0.95},${r * 0.32}`} stroke={CYAN} strokeWidth={3} fill="none" opacity={0.8 * (1 - r / 1220)} />; })}</g>
		{[0, 1, 2].map((i) => { const t0 = BAR + i * BA, a = cl((tau - t0) / 0.15); return <g key={i} opacity={a}><circle cx={1290 + i * 64} cy={280} r={13 * (1 + 0.4 * Math.max(0, 1 - (tau - t0) / 0.3))} fill="#e8fbff" /><Glow x={1290 + i * 64} y={280} r={34} c={CYAN} o={0.7} /></g>; })}
		<text x={1354} y={340} textAnchor="middle" style={{fontFamily: LATS, fontSize: 30, fontStyle: 'italic'}} fill="#e8fbff" opacity={cl((tau - BAR - 2 * BA) / 0.3)}>“S”</text>
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.marconi} rim="#dbe8f0" T={tau} /></svg></>; };

const Arpa: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.2, 6]]); const vo = VO.kline.at - S[8], crash = SILENCE[0] - S[8];
	if (tau >= crash) { const blink = Math.floor((tau - crash) / 0.4) % 2 === 0; return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}><text x={940} y={560} style={{fontFamily: MONO, fontSize: 60}} fill="#8dffae" opacity={blink ? 0.85 : 0}>_</text></svg></AbsoluteFill>; }
	const L = tau > vo + 0.15, O = tau > vo + 1.55, G = tau > crash - 1.2, glitch = G ? (tau - (crash - 1.2)) / 1.2 : 0;
	const shake = glitch > 0 ? (rnd(Math.floor(tau * 30), 5) - 0.5) * 30 * glitch : 0;
	return <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px,${shake * 0.4}px)`}}><BG k="arpa" oy={-120} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<g transform="translate(1240,250)" opacity={cl((tau - 1.2) / 0.5)}><rect x={-300} y={-150} width={600} height={300} rx={18} fill="#03100a" opacity={0.88} stroke="#1f4a2e" strokeWidth={4} />
			{L && <text x={-210} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" filter="url(#gS)">L</text>}
			{O && <text x={-95} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" filter="url(#gS)">O</text>}
			{G && <text x={20} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" opacity={0.5 * (1 - glitch)} transform={`translate(${(rnd(Math.floor(tau * 30), 2) - 0.5) * 40 * glitch},0)`}>G</text>}
			{!G && Math.floor(tau / 0.4) % 2 === 0 && <rect x={L ? (O ? 20 : -95) : -210} y={80} width={100} height={14} fill="#8dffae" />}
			{Array.from({length: 8}, (_, i) => <rect key={i} x={-300} y={-150 + i * 38 + 8 * rnd(i + Math.floor(tau * 10 * glitch), 3)} width={600} height={3 + 5 * rnd(i, 4) + 20 * glitch * rnd(i, 9)} fill="#8dffae" opacity={0.1 + 0.3 * glitch} />)}
			{G && <text x={0} y={128} textAnchor="middle" style={{fontFamily: MONO, fontSize: 26, letterSpacing: '0.2em'}} fill="#ff6a5a" opacity={glitch > 0.4 ? 1 : 0}>SYSTEM CRASH</text>}</g>
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.kline} rim="#c8ffe0" T={tau} /></svg></div>; };

const Bj: React.FC<SceneProps> = ({tau}) => { const w = walk(tau, -90, H0, [[0.3, 15]]); const txt = 'Across the Great Wall we can reach every corner in the world.'; const n = Math.floor(txt.length * cl((tau - 1.2) / 3.4));
	const u = cl((tau - 4.8) / 3.5), ex = 560 + 1000 * ease(u), ey = 300 - 120 * Math.sin(Math.PI * u);
	return <><BG k="bj" oy={-70} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<text x={960} y={226} textAnchor="middle" style={{fontFamily: MONO, fontSize: 32}} fill="#fff7e0" stroke="rgba(40,30,60,0.6)" strokeWidth={5} paintOrder="stroke">{txt.slice(0, n)}<tspan opacity={Math.floor(tau / 0.4) % 2 ? 0 : 1}>_</tspan></text>
		{u > 0 && <g transform={`translate(${ex},${ey})`} opacity={1 - cl((tau - 8.6) / 0.6)}><rect x={-26} y={-18} width={52} height={36} rx={3} fill="#fff7e0" /><path d="M-26,-18 L0,4 L26,-18" stroke="#8a7a60" strokeWidth={2} fill="none" /><Glow x={0} y={0} r={46} c={GOLD} o={0.6} /></g>}
		<Lit x={w.x} h={H0} q={w.q} look={LOOK.bj} rim="#ffd8c0" T={tau} /></svg></>; };

const PROCK = ['shang', 'du', 'morse', 'scott', 'bell', 'marconi', 'kline', 'bj'];
const Finale: React.FC<SceneProps> = ({tau}) => { const q = tau / 0.62813; const vx = 1520 - 14 * tau, vy = 220 - 3 * tau;
	return <><BG k="space" oy={-40} dim={0.45 * cl((tau - 20) / 3)} /><svg width={W} height={H} style={{position: 'absolute'}}>
		<g transform={`translate(${vx},${vy}) rotate(-10) scale(${Math.max(0.35, 0.85 - 0.018 * tau)})`} opacity={cl(tau / 1.2)}><Voyager />
			<circle cx={-22} cy={58} r={60 + 30 * Math.max(0, 1 - ((tau % 0.62813) / 0.25))} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5 * Math.max(0, 1 - ((tau % 0.62813) / 0.25))} /></g>
		<g transform="translate(0,40)">{PROCK.map((k, i) => <Lit key={k} x={330 + i * 182} h={270} q={q * 0.9 + i * 0.47} look={LOOK[k]} col="#06050a" far="#151220" rim="#c9b8ff" />)}</g>
		<g opacity={fadeIO(tau, 10.05, 20.0, 0.6)}><text x={960} y={430} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill="#fff">为了跟你说一句话，</text>
			<text x={960} y={540} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill={GOLD} opacity={cl((tau - 12.56) / 0.5)}>人类努力了三千年。</text></g>
		<g opacity={cl((tau - 20.3) / 0.8)}><text x={960} y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84}} fill={GOLD}>你最想对谁说一句话？</text>
			<text x={960} y={550} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34}} fill="#fff" opacity={0.8}>写在评论区，也许，ta 会听见。</text></g></svg></>; };

const Hook: React.FC<SceneProps> = ({tau}) => { const ring = tau > 0.9 && tau < 3.6 ? Math.sin(tau * 60) * 3 * (Math.floor(tau / 0.629) % 2) : 0;
	return <AbsoluteFill style={{background: '#06050a'}}><svg width={W} height={H}>
		<Glow x={960} y={430} r={320} c="#ffcf8a" o={0.16 * cl(tau / 0.6)} />
		<g transform={`translate(${960 + ring},640) rotate(${ring * 0.6})`} fill="none" stroke={GOLD} strokeWidth={3} filter="url(#gS)" opacity={cl(tau / 0.5)}><ellipse cx={0} cy={0} rx={90} ry={18} /><path d="M-11,-18 L-11,-330 L11,-330 L11,-18" /><path d="M8,-330 L70,-362 L70,-292 L8,-310 Z" /><ellipse cx={72} cy={-327} rx={10} ry={36} />
			<path d="M-11,-250 L-60,-250 M-70,-262 L-48,-262 L-44,-160 L-66,-160 Z" /><path d="M-56,-150 Q-140,-60 -40,-6" /></g>
		<text x={960} y={850} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60}} fill="#fff" opacity={cl((tau - 0.3) / 0.4)}>人类打出的第一通电话，</text>
		<text x={960} y={940} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60}} fill={GOLD} opacity={cl((tau - 1.55) / 0.4)}>第一句话说的是什么？</text></svg></AbsoluteFill>; };

type Def = {k: string; C: React.FC<SceneProps>; label?: [string, string]; vo?: string; nat?: string; zh?: string; lat?: string; extra?: (tau: number) => React.ReactNode};
const SCENES: Def[] = [
	{k: 'hook', C: Hook},
	{k: 'rewind', C: Hook},
	{k: 'shang', C: Shang, label: ['约公元前 1200 年', '商 · 殷墟'], vo: 'shang', nat: '其自东来雨？', lat: SANS, zh: '雨，会从东边来吗？'},
	{k: 'du', C: Du, label: ['757 年', '杜甫 · 长安'], vo: 'du', nat: '烽火连三月，家书抵万金。', lat: SANS, zh: '打了三个月的仗，一封家书比万两黄金还珍贵。'},
	{k: 'morse', C: MorseScene, label: ['1844 年', '莫尔斯 · 华盛顿—巴尔的摩'], vo: 'morse', nat: 'What hath God wrought?', zh: '上帝创造了何等奇迹？'},
	{k: 'scott', C: Scott, label: ['1860 年', '斯科特 · 巴黎'], vo: 'scott', nat: 'Au clair de la lune, mon ami Pierrot…', zh: '这首歌，148 年后才第一次被人听见。'},
	{k: 'bell', C: Bell, label: ['1876 年', '贝尔 · 波士顿'], vo: 'bell', nat: 'Mr. Watson, come here. I want to see you.', zh: '华生先生，过来，我想见你。'},
	{k: 'marconi', C: Marconi, label: ['1901 年', '马可尼 · 纽芬兰'], vo: 'marconi', nat: 'Can you hear anything, Mr. Kemp?', zh: '你听到了吗？'},
	{k: 'arpa', C: Arpa, label: ['1969 年', '阿帕网 · 加州大学洛杉矶分校'], vo: 'kline', nat: 'Did you get the L? … Did you get the O?', zh: '想打 LOGIN，打到第二个字母，系统崩了。'},
	{k: 'bj', C: Bj, label: ['1987 年', '中国第一封电子邮件 · 北京'], vo: 'beijing', nat: 'Across the Great Wall, we can reach every corner in the world.', zh: '越过长城，走向世界。'},
	{k: 'finale', C: Finale, label: ['1977 年', '旅行者号 · 金唱片'], vo: 'voyager', zh: '各位都好吧？我们都很想念你们，有空请到这儿来玩。'},
];
const REW = ['bj', 'arpa', 'marconi', 'bell', 'scott', 'morse', 'du', 'shang'], REWY = ['1987', '1969', '1901', '1876', '1860', '1844', '757', '公元前 1200'];

const SceneView: React.FC<{i: number; t: number; T: number; bare?: boolean}> = ({i, t, T, bare}) => {
	const d = SCENES[i], tau = t - S[i];
	const sub = d.vo ? subWin(d.vo, d.k === 'finale' ? 2.4 : 1.6) : null;
	const subOp = sub ? fadeIO(t, sub[0], sub[1], 0.25) : 0;
	const labEnd = d.k === 'arpa' ? SILENCE[0] - S[i] - 0.05 : (S[i + 1] ?? END) - S[i] - 0.3;
	const labOp = bare ? 0 : d.k === 'finale' ? fadeIO(tau, 1.6, 9.6, 0.4) : fadeIO(tau, 0.4, labEnd, 0.4);
	return <AbsoluteFill>
		<d.C tau={tau} T={T} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{d.label && <g opacity={labOp}><Label year={d.label[0]} name={d.label[1]} /></g>}
			{!bare && sub && subOp > 0 && <g opacity={subOp}><Subs nat={d.nat} zh={d.zh ?? ''} lat={d.lat} /></g>}
			{!bare && d.k === 'bell' && <g opacity={fadeIO(tau, 7.6, 10.4, 0.3)}><text x={W / 2} y={1050} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26}} fill="#fff" opacity={0.75}>——人类第一通电话里的第一句话</text></g>}
		</svg>
	</AbsoluteFill>;
};

export const Ep41Film: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	let i = S.length - 1; while (i > 0 && t < S[i]) i--;
	// the rewind: one scene per beat, backwards, with the year; then black into 3000 years ago
	if (i === 1) { const k = Math.floor((t - S[1]) / BA);
		if (k < 8) { const j = 2 + (7 - k); const local = (t - S[1]) - k * BA;
			return <AbsoluteFill style={{background: '#000'}}><AbsoluteFill style={{filter: 'blur(5px)', transform: `scale(${1.06 - 0.03 * local / BA}) translateX(${40 * local / BA}px)`}}><SceneView i={j} t={S[j] + 5} T={t} bare /></AbsoluteFill>
				<svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#000" opacity={0.28} />{Array.from({length: 12}, (_, r) => <rect key={r} x={0} y={rnd(r + k * 13, 30) * H} width={W} height={2 + 6 * rnd(r, 31)} fill="#fff" opacity={0.12} />)}
					<text x={W / 2} y={600} textAnchor="middle" style={{fontFamily: REWY[k].length > 4 ? SERIF : '"DejaVu Sans", sans-serif', fontWeight: 900, fontSize: REWY[k].length > 4 ? 140 : 190}} fill="#fff">{REWY[k]}</text>
					<text x={W / 2} y={680} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 36}} fill={GOLD}>◀◀</text></svg></AbsoluteFill>; }
		const u = (t - S[1] - 8 * BA) / (4 * BA);
		return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}><text x={W / 2} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 110}} fill="#fff" opacity={fadeIO(u, 0.0, 0.85, 0.15)}>三千年前</text></svg></AbsoluteFill>;
	}
	// dissolves at scene boundaries (not into or out of the silence, not out of the rewind)
	const X = 0.45, next = S[i + 1] ?? END;
	const showNext = i + 1 < S.length && i !== 8 && t > next - X;
	const fadeIn = i === 2 ? cl((t - S[2]) / 0.8) : i === 9 ? cl((t - S[9]) / 0.6) : 1;
	const endFade = 1 - cl((t - (END - 2 * BARB)) / (2 * BARB));
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{opacity: fadeIn * endFade}}><SceneView i={i} t={t} T={t} /></AbsoluteFill>
		{showNext && <AbsoluteFill style={{opacity: cl((t - (next - X)) / X)}}><SceneView i={i + 1} t={next} T={t} /></AbsoluteFill>}
		<svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id="gS" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs></svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP41" component={Ep41Film} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />);
void Walker2; void ease;
