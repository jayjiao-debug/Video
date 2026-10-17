import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Sequence} from 'remotion';
import {JUNO} from '../brand/identity';
import {EndCard} from '../brand/Brand';
import EVJ from './events30.json';
import LINES from './lines30.json';

/* ep30 《同一段旋律，8种曲风》 — look A 鼓机面板: the faceplate of one generic drum machine. Hits are light: backlit
   pads bloom and spill their colour onto the graphite. Every pad lights from build/events30.json (the soundtrack's own
   hit list), so the picture can never drift off the music. One fixed colour per row: 动 orange, 打 yellow, 次 mint,
   招牌 pink. See storyboard.md for the scene list. */
const FPS = 30, W = 1920, H = 1080;
const EV = EVJ as any;
const SEGS: Record<string, {t0: number; t1: number; bar: number; beat: number; bpm: number; bars: number}> = EV.segs;
const END = 147.53, OUTRO = 138.96;
const SANS = '"Noto Sans CJK SC", sans-serif';
const C = {
	panel0: '#4a4d53', panel1: '#303236', bezel0: '#26272a', bezel1: '#18191b', padOff: '#575a61', padOff2: '#46494f', well: '#1e1f22', silk: '#ECE5D3',
	K: '#FF6A2B', S: '#FFCF3A', H: '#6EF0CC', G: '#FF5AA5', vfd: '#0E2420', mint: '#A6FFE4', mintDim: '#5FAF98', led: '#FF3B30', key: '#FFB23E', gold: '#F5C76A', red: '#FF3B30',
};
const ROWC = [C.G, C.H, C.S, C.K];                    // grid rows top → bottom: 招牌, 次, 打, 动
const ROWY = [258, 366, 456, 546], PADH = 78, PADW = 74;
const sx = (s: number) => 330 + s * 89.9 + Math.floor(s / 4) * 24;   // step → pad x (left edge)
const cx = (s: number) => sx(s) + PADW / 2;
const cyR = (r: number) => ROWY[r] + PADH / 2 + 2;

const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const r = (t: number, a: number, b: number) => sm(lin(t, a, b));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const win = (t: number, a: number, b: number, fi = 0.2, fo = 0.2) => r(t, a, a + fi) * (1 - r(t, b - fo, b));

// ------------------------------------------------------------------ events, indexed by segment and bar
type Ev = {t: number; seg: string; row: string; step?: number; v: number; genre?: string; gr: number; st: number; bar: number};
const ROWMAP: Record<string, number> = {K: 3, S: 2, H: 1, G: 0};
const BYBAR: Record<string, Ev[]> = {};
const ALL: Ev[] = [];
for (const e of EV.ev as any[]) {
	const s = SEGS[e.seg];
	let gr = ROWMAP[e.row] ?? -1;
	if (e.seg === 'jazz' && e.row === 'X') gr = 0;                    // the ride lives on the 招牌 row (叮叮镲)
	if (e.seg === 'recap' && e.row === 'X') gr = 0;
	if (e.seg === 'bossa' && e.row === 'G') gr = -2;                  // fingers → 打 + 次 (handled below)
	let bar = 0, st = 0;
	if (s) { bar = Math.floor((e.t - s.t0) / s.bar + 1e-6); st = e.step ?? Math.round(((e.t - s.t0 - bar * s.bar) / s.bar) * 16) % 16; }
	if (e.seg === 'recap') { const rb = recapBar(e.t); bar = rb.i; st = e.step ?? Math.round(((e.t - rb.t0) / rb.len) * 16) % 16; }
	const ev: Ev = {...e, gr, st, bar};
	ALL.push(ev);
	(BYBAR[`${e.seg}|${bar}`] ||= []).push(ev);
}
function recapBar(t: number) { const B = [128.81, 130.81, 132.81, 135.89, 138.96]; let i = 0; while (i < 3 && t >= B[i + 1] - 1e-6) i++; return {i, t0: B[i], len: B[i + 1] - B[i]}; }
const MEL = (EV.mel as any[]);

/** which musical segment (and bar) the playhead is in */
const ORDER = ['bed', 'theme', 'rock', 'house', 'jazz', 'lofi', 'reggae', 'quiz', 'bossa', 'trap', 'metal', 'theme2', 'recap', 'bonus'];
function segAt(t: number) {
	if (t < 4) { const b0 = Math.floor(t / 2) * 2; return {k: 'scan', s: {t0: 0, t1: 4, bar: 2, beat: 0.5, bpm: 120, bars: 2}, bar: Math.floor(t / 2), b0, bl: 2}; }
	for (const k of ORDER) { const s = SEGS[k]; if (t >= s.t0 - 1e-6 && t < s.t1 - 1e-6) {
		if (k === 'recap') { const rb = recapBar(t); return {k, s, bar: rb.i, b0: rb.t0, bl: rb.len}; }
		const bar = Math.floor((t - s.t0) / s.bar); return {k, s, bar, b0: s.t0 + bar * s.bar, bl: s.bar};
	} }
	return null;
}
/** pad brightness state for the bar the playhead is in: [row][step] = 0..1 (flash then afterglow) + hot (0..1) */
function padState(t: number, k: string, bar: number, b0: number) {
	const lit = [0, 1, 2, 3].map(() => new Array(16).fill(0)), hot = [0, 1, 2, 3].map(() => new Array(16).fill(0)), slivers = new Array(16).fill(0);
	const evs = BYBAR[`${k}|${bar}`] || [];
	for (const e of evs) {
		if (e.t > t + 1e-4 || e.t < b0 - 1e-4) continue;
		const dt = t - e.t, flash = dt < 2 / FPS ? 1 : Math.exp(-(dt - 2 / FPS) / 0.22);
		const val = Math.max(0.42 * e.v + 0.2, flash * e.v);
		const rows = e.gr === -2 ? [1, 2] : e.gr >= 0 ? [e.gr] : [];
		for (const g of rows) { lit[g][e.st] = Math.max(lit[g][e.st], val); hot[g][e.st] = Math.max(hot[g][e.st], flash); }
		if (e.gr === 1) slivers[e.st]++;
	}
	return {lit, hot, slivers};
}

// ------------------------------------------------------------------ the lines (hero per line) and subtitle parsing
const LN = LINES as [number, number, string][];
const lineAt = (t: number) => { for (let i = 0; i < LN.length; i++) if (t >= LN[i][0] && t < LN[i][1]) return i + 1; return 0; };
/** hero rows per line (1-based line index) — everything else drops to 30 % */
const HERO: Record<number, number[]> = {8: [1, 2, 3], 9: [0, 1, 2, 3], 10: [2, 3], 11: [3], 12: [3], 13: [0], 14: [0], 15: [0], 16: [0, 1], 17: [], 18: [3], 19: [0], 20: [], 21: [], 22: [0], 23: [3], 24: [], 25: [3], 26: [0], 27: [], 28: [0, 1, 2, 3], 29: [1, 2, 3], 30: [2], 31: [1], 32: [1, 2], 33: [0], 34: [0], 35: [0], 38: [2, 3], 39: [0], 40: [], 41: [0, 3]};
function rowDim(t: number) {
	const out = [1, 1, 1, 1];
	for (let i = 0; i < LN.length; i++) {
		const [a, b] = LN[i], h = HERO[i + 1]; if (!h) continue;
		const k = win(t, a, b, 0.2, 0.2); if (k <= 0) continue;
		for (let g = 0; g < 4; g++) if (!h.includes(g)) out[g] = Math.min(out[g], mix(1, 0.3, k));
	}
	return out;
}
const Sub: React.FC<{t: string}> = ({t}) => {
	const parts = t.split(/(\[[^\]]+\])/g).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 846, display: 'flex', justifyContent: 'center'}}>
			<div style={{position: 'relative', padding: '18px 110px'}}>
				<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0.25) 45%, rgba(8,8,10,0) 100%)', filter: 'blur(6px)'}} />
				<div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fffaf0', letterSpacing: '0.03em', WebkitTextStroke: '7px rgba(10,10,12,0.6)', paintOrder: 'stroke fill', textShadow: '0 2px 10px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>
					{parts.map((p, i) => p.startsWith('[') ? <span key={i} style={{color: C.gold}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>)}
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ static faceplate
const Defs = () => (
	<defs>
		<linearGradient id="panelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5f6268" /><stop offset="0.55" stopColor="#54575d" /><stop offset="1" stopColor="#3c3e43" /></linearGradient>
		<linearGradient id="bezelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.bezel0} /><stop offset="1" stopColor={C.bezel1} /></linearGradient>
		<linearGradient id="padG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62656c" /><stop offset="1" stopColor={C.padOff2} /></linearGradient>
		<pattern id="brush" width="1920" height="6" patternUnits="userSpaceOnUse"><rect width="1920" height="1" y="1" fill="#fff" opacity="0.025" /><rect width="1920" height="1" y="4" fill="#000" opacity="0.03" /></pattern>
		<filter id="bloom" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18" /></filter>
		<filter id="spill" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="34" /></filter>
		<filter id="glowT" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
		<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<radialGradient id="vig"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
	</defs>
);
const T: React.FC<{x: number; y: number; t: string; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; glow?: boolean; ls?: string}> = ({x, y, t, s = 52, c = C.silk, w = 900, a = 'middle', o = 1, glow, ls}) =>
	o <= 0.001 ? null : <text x={x} y={y} textAnchor={a} opacity={o} filter={glow ? 'url(#glowT)' : undefined} style={{fontFamily: SANS, fontWeight: w, fontSize: s, letterSpacing: ls}} fill={c}>{t}</text>;

/** the off-frame tempo knob (faceplate x −420…−60) */
const Knob: React.FC<{t: number}> = ({t}) => {
	const turn = mix(0, -70, r(t, 51.18, 51.6)) + (t > 51.6 ? -70 : 0) * 0;
	const ang = mix(0, -70, r(t, 51.68, 52.45)) * Math.PI / 180;
	return (
		<g transform="translate(-240 470)">
			<circle r={170} fill="#2b2d31" stroke="#5b5e64" strokeWidth={4} />
			<circle r={120} fill="#3b3e44" stroke="#1b1c1f" strokeWidth={6} />
			<line x1={0} y1={0} x2={Math.sin(ang) * 105} y2={-Math.cos(ang) * 105} stroke={C.mint} strokeWidth={10} strokeLinecap="round" filter="url(#glowT)" />
			<T x={-150} y={240} t="慢" s={52} />
			<T x={0} y={-200} t="走路" s={56} c={C.mint} />
			<T x={150} y={240} t="快" s={52} />
			<T x={0} y={290} t="TEMPO" s={40} w={700} c={C.mintDim} ls="0.3em" />
			<g opacity={turn * 0} />
		</g>
	);
};

// ------------------------------------------------------------------ the pad grid
const Pads: React.FC<{t: number; dim: number[]; jitter?: number; bloomK?: number; override?: ((t: number) => {lit: number[][]; hot: number[][]; slivers: number[]}) | null; emptySocket?: number; footprints?: number; hide?: number[]}> = ({t, dim, jitter = 0, bloomK = 1, override, emptySocket = 0, footprints = 0, hide = []}) => {
	const sa = segAt(t);
	const st = override ? override(t) : sa ? padState(t, sa.k, sa.bar, sa.b0) : null;
	const base: React.ReactNode[] = [], glow: React.ReactNode[] = [], lit: React.ReactNode[] = [];
	for (let g = 0; g < 4; g++) for (let s = 0; s < 16; s++) {
		const x = sx(s), y = ROWY[g] + 3;
		const empty = emptySocket > 0 && g === 3 && s === 0;
		base.push(<rect key={`b${g}-${s}`} x={x} y={y} width={PADW} height={PADH - 6} rx={12} fill={empty ? C.well : 'url(#padG)'} stroke={C.well} strokeWidth={4} opacity={0.95} />);
		const v = st && !hide.includes(g) ? st.lit[g][s] : 0;
		if (v > 0.01 && !empty) {
			const jx = jitter ? Math.sin(t * 7 + s * 1.7 + g) * jitter : 0, jy = jitter ? Math.cos(t * 5 + s) * jitter * 0.6 : 0;
			const a = v * dim[g], hotv = st!.hot[g][s] * dim[g];
			glow.push(<rect key={`g${g}-${s}`} x={x - 14 + jx} y={y - 14 + jy} width={PADW + 28} height={PADH + 22} rx={22} fill={ROWC[g]} opacity={0.55 * a * bloomK} />);
			const sl = g === 1 ? st!.slivers[s] : 0;
			if (sl >= 2 && v > 0.3) {
				const n = sl >= 6 ? 8 : sl >= 3 ? 4 : 2;
				for (let k = 0; k < n; k++) lit.push(<rect key={`l${g}-${s}-${k}`} x={x + 3 + k * (PADW - 6) / n + jx} y={y + 3 + jy} width={(PADW - 6) / n - 3} height={PADH - 12} rx={3} fill={ROWC[g]} opacity={a} />);
			} else lit.push(<rect key={`l${g}-${s}`} x={x + 3 + jx} y={y + 3 + jy} width={PADW - 6} height={PADH - 12} rx={10} fill={ROWC[g]} opacity={a} />);
			if (hotv > 0.05) lit.push(<rect key={`h${g}-${s}`} x={x + 18 + jx} y={y + 16 + jy} width={PADW - 36} height={PADH - 38} rx={12} fill="#fff" opacity={0.55 * hotv} filter="url(#soft)" />);
			if (footprints > 0 && g === 3 && v > 0.3) lit.push(<Foot key={`f${s}`} x={cx(s) + jx} y={cyR(3) + jy} left={s % 8 < 4} o={footprints * a} />);
		}
		if (empty) base.push(<g key="empty" opacity={emptySocket}><rect x={x - 6} y={y - 6} width={PADW + 12} height={PADH + 6} rx={16} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="12 9" /><T x={cx(0)} y={cyR(3) + 20} t="空" s={60} /></g>);
	}
	return (
		<g>
			<g filter="url(#spill)">{glow}</g>
			{base}
			<g filter="url(#glowT)">{lit}</g>
		</g>
	);
};
const Foot: React.FC<{x: number; y: number; left: boolean; o: number}> = ({x, y, left, o}) => (
	<g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`} opacity={o}>
		<ellipse cx={0} cy={6} rx={11} ry={16} fill="#2a1408" opacity={0.75} />
		{[[-9, -16], [-3, -20], [3, -21], [9, -19], [13, -14]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={i === 0 ? 4.5 : 3.2} fill="#2a1408" opacity={0.75} />)}
	</g>
);

/** beat numbers + step LEDs */
const Beats: React.FC<{t: number; dimAll?: number; colors?: (string | null)[]}> = ({t, dimAll = 1, colors}) => {
	const sa = segAt(t);
	const ps = sa ? Math.floor(((t - sa.b0) / sa.bl) * 16) % 16 : -1;
	const tk = sa ? (BYBAR[`${sa.k}|${sa.bar}`] || []).filter((e) => e.row === 'T' && e.t <= t && t - e.t < 0.15) : [];
	return (
		<g opacity={dimAll}>
			{[0, 1, 2, 3].map((b) => {
				const on = ps >= b * 4 && ps < b * 4 + 4, tick = tk.some((e) => e.st === b * 4);
				const big = on || tick;
				return <g key={b}>
					<T x={sx(b * 4) + 16} y={212} t={String(b + 1)} s={big ? 72 : 62} c={colors?.[b] ?? (big ? '#fff' : '#a9acb2')} a="start" />
					<line x1={sx(b * 4)} x2={sx(b * 4 + 3) + PADW} y1={234} y2={234} stroke="#8d9097" strokeWidth={2} opacity={0.5} />
				</g>;
			})}
			{Array.from({length: 16}, (_, s) => <circle key={s} cx={cx(s)} cy={246} r={7} fill={s === ps ? C.led : '#5a1f1c'} opacity={s === ps ? 1 : 0.7} filter={s === ps ? 'url(#glowT)' : undefined} />)}
		</g>
	);
};
/** label column: 招牌 screen + 次/打/动 with their tags */
const Labels: React.FC<{dim: number[]; sig: string; sigO?: number; tagsO?: number}> = ({dim, sig, sigO = 1, tagsO = 1}) => (
	<g>
		<T x={60} y={240} t="招牌声" s={40} w={700} c="#c9c3b3" a="start" o={tagsO} />
		<rect x={52} y={262} width={258} height={76} rx={10} fill={C.vfd} stroke="#0a0a0b" strokeWidth={4} opacity={0.95} />
		<T x={181} y={320} t={sig} s={sig.length > 4 ? 44 : 56} c={C.G} o={sigO * dim[0]} glow />
		{[['次', '踩镲', 1], ['打', '军鼓', 2], ['动', '底鼓', 3]].map(([sy, tag, g]) => (
			<g key={sy as string} opacity={0.35 + 0.65 * dim[g as number]}>
				<T x={62} y={cyR(g as number) + 30} t={sy as string} s={88} c={ROWC[g as number]} a="start" />
				<T x={162} y={cyR(g as number) + 22} t={tag as string} s={42} w={700} c="#d6d0c0" a="start" o={tagsO} />
			</g>
		))}
	</g>
);
/** the VFD screen (genre tag / title / countdown) */
const Vfd: React.FC<{text: string; label?: string; x0?: number; x1?: number; y0?: number; y1?: number; size?: number; bloom?: number}> = ({text, label = '曲风', x0 = 600, x1 = 1320, y0 = 28, y1 = 132, size = 84, bloom = 0}) => (
	<g>
		{bloom > 0 && <rect x={x0 - 30} y={y0 - 20} width={x1 - x0 + 60} height={y1 - y0 + 40} rx={30} fill={C.mint} opacity={0.25 * bloom} filter="url(#spill)" />}
		<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={14} fill={C.vfd} stroke="#0b0c0d" strokeWidth={6} />
		<rect x={x0 + 12} y={y0 + 10} width={x1 - x0 - 24} height={(y1 - y0) * 0.3} rx={8} fill="#fff" opacity={0.035} />
		{label && <T x={x0 + 44} y={(y0 + y1) / 2 + 16} t={label} s={42} w={700} c={C.mintDim} a="start" />}
		<T x={(x0 + x1) / 2 + (label ? 40 : 0)} y={(y0 + y1) / 2 + size * 0.36} t={text} s={size} c={C.mint} glow />
	</g>
);
/** context row: tempo strip with the walking mark (BPM numbers only where a line cites them) */
const Tempo: React.FC<{bpm: number; o: number; num?: string; bpm2?: number; tags?: [string, string]; numSize?: number}> = ({bpm, o, num, bpm2, tags, numSize = 96}) => {
	if (o <= 0.001) return null;
	const px = (b: number) => 560 + ((Math.log(b) - Math.log(60)) / (Math.log(175) - Math.log(60))) * 820;
	return (
		<g opacity={o}>
			<rect x={420} y={668} width={1100} height={104} rx={16} fill="#2a2c30" stroke="#16171a" strokeWidth={4} />
			<T x={470} y={738} t="慢" s={52} />
			<T x={1470} y={738} t="快" s={52} />
			<line x1={560} x2={1380} y1={722} y2={722} stroke="#8d9097" strokeWidth={4} />
			{Array.from({length: 21}, (_, i) => <line key={i} x1={560 + i * 41} x2={560 + i * 41} y1={710} y2={734} stroke="#8d9097" strokeWidth={2} />)}
			<g transform={`translate(${px(120)} 0)`}><line y1={690} y2={752} x1={0} x2={0} stroke={C.mint} strokeWidth={4} strokeDasharray="6 5" /><T x={0} y={686} t="走路" s={56} c={C.mint} /></g>
			<g transform={`translate(${px(bpm)} 0)`}><path d="M 0 700 L -16 760 L 16 760 Z" fill={C.key} filter="url(#glowT)" />{tags && <T x={0} y={658} t={tags[0]} s={40} w={700} c={C.key} />}</g>
			{bpm2 && <g transform={`translate(${px(bpm2)} 0)`}><path d="M 0 700 L -16 760 L 16 760 Z" fill={C.S} filter="url(#glowT)" />{tags && <T x={0} y={658} t={tags[1]} s={40} w={700} c={C.S} />}</g>}
			{num && <T x={1722} y={752} t={num} s={numSize} c={C.key} glow />}
		</g>
	);
};
const KEYL = ['鼓点在哪拍', '直·摇摆', '快·慢', '招牌声'];
const UNLOCK = [30.0, 49.68, 57.84, 60.91];
/** clue keys: small LEDs on the bezel; full keys in the context row when raised */
const Keys: React.FC<{t: number; raise: number[]; focus?: number; badge?: [number, string] | null; locked?: boolean}> = ({t, raise, focus = -1, badge = null, locked}) => (
	<g>
		{[0, 1, 2, 3].map((i) => {
			const on = t >= UNLOCK[i], k = raise[i];
			return <g key={i}>
				<rect x={1622 + i * 56} y={800} width={36} height={12} rx={6} fill={on ? C.key : '#4a3a20'} opacity={on ? 1 : 0.7} filter={on ? 'url(#glowT)' : undefined} />
				{k > 0.01 && <g opacity={k} transform={`translate(0 ${(1 - k) * 60})`}>
					<rect x={330 + i * 380} y={672} width={350} height={100} rx={14} fill={on || locked === false ? '#3a3020' : '#2a2c30'} stroke={i === focus ? C.key : '#16171a'} strokeWidth={i === focus ? 6 : 4} opacity={focus >= 0 && i !== focus ? 0.45 : 1} />
					<circle cx={362 + i * 380} cy={722} r={10} fill={on ? C.key : '#4a3a20'} filter={on ? 'url(#glowT)' : undefined} opacity={focus >= 0 && i !== focus ? 0.45 : 1} />
					<T x={520 + i * 380} y={740} t={locked && !on ? '？' : KEYL[i]} s={52} c={on ? '#FFE2A6' : '#8d9097'} o={focus >= 0 && i !== focus ? 0.45 : 1} />
					{badge && badge[0] === i && <g><rect x={330 + i * 380 - (i === 3 ? 60 : 0)} y={598} width={350 + (i === 0 ? 80 : 0)} height={66} rx={33} fill={C.key} /><T x={505 + i * 380 + (i === 0 ? 40 : i === 3 ? -60 : 0)} y={648} t={badge[1]} s={52} w={800} c="#2a1a05" /></g>}
				</g>}
			</g>;
		})}
	</g>
);
/** syllable pops rising from lit pads */
const Pops: React.FC<{t: number; segs: string[]; o?: number; size?: number}> = ({t, segs, o = 1, size = 96}) => {
	const out: React.ReactNode[] = [];
	for (const e of ALL) {
		if (!segs.includes(e.seg) || e.gr < 1 || e.gr > 3) continue;
		const dt = t - e.t; if (dt < 0 || dt > 0.45) continue;
		const k = 1 - dt / 0.45, sy = ['', '次', '打', '动'][e.gr];
		out.push(<T key={`${e.t}-${e.gr}`} x={cx(e.st) + 46} y={cyR(e.gr) - 10 - dt * 90} t={sy} s={size} c={ROWC[e.gr]} o={o * k} glow />);
	}
	return <g>{out}</g>;
};

// ================================================================== the film
export const Film30: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	const ln = lineAt(t), sub = ln ? LN[ln - 1] : null;
	const dim = rowDim(t);
	const sa = segAt(t);

	// ---- camera keyframes (scale about an origin, plus pan) — one move per transition
	let cam = {s: 1, ox: 960, oy: 470, px: 0};
	const jz = r(t, 41.68, 43.6) * (1 - r(t, 49.2, 51.0));
	if (jz > 0) cam = {s: 1 + 0.06 * jz, ox: 960, oy: 300, px: 0};
	const pan = r(t, 51.18, 52.45) * (1 - r(t, 53.22, 54.75));
	if (pan > 0) cam = {s: 1, ox: 960, oy: 470, px: 430 * pan};
	const rg = r(t, 63.99, 64.6) * (1 - r(t, 76.0, 76.6));
	if (rg > 0) cam = {s: 1 + 0.08 * rg, ox: 330, oy: 200, px: 0};
	const tp = r(t, 105.02, 105.6) * (1 - r(t, 107.38, 108.0));
	if (tp > 0) cam = {s: 1 + 0.05 * tp, ox: 560, oy: 408, px: 0};
	const th2 = r(t, 122.81, 124.0) * (1 - r(t, 127.8, 128.8));
	if (th2 > 0) cam = {s: 1 - 0.06 * th2, ox: 960, oy: 420, px: 0};
	const endK = r(t, OUTRO, OUTRO + 0.9);
	const camT = `translate(${cam.px} 0) translate(${cam.ox} ${cam.oy}) scale(${cam.s}) translate(${-cam.ox} ${-cam.oy})`;

	// ---- genre tag + 招牌 label
	const GEN: Record<string, [string, string]> = {bed: ['？', '招牌声'], theme: ['原版', '旋律'], rock: ['摇滚', '电吉他'], house: ['House', '合成器'], jazz: ['爵士', '叮叮镲'], lofi: ['Lo-fi', '黑胶'], reggae: ['雷鬼', '吉他嚓'], quiz: ['？', '？'], bossa: ['波萨诺瓦', '尼龙吉他'], trap: ['Trap', '808'], metal: ['金属', '失真吉他'], theme2: ['原版', '旋律'], recap: ['4问', '招牌声'], bonus: ['？', '？']};
	const scanG: Record<string, string> = {rock: '摇滚', jazz: '爵士', house: 'House', reggae: '雷鬼', trap: 'Trap', metal: '金属', lofi: 'Lo-fi', bossa: '波萨诺瓦'};
	const SCANSIG: Record<string, string> = {rock: '电吉他', jazz: '叮叮镲', house: '合成器', reggae: '吉他嚓', trap: '808', metal: '失真吉他', lofi: '黑胶', bossa: '尼龙吉他'};
	const SCAN = (EV.ev as any[]).filter((e) => e.row === 'SCAN');
	const SCANSRC: Record<string, number> = {rock: 20.0, jazz: 45.68, house: 37.81, reggae: 70.899, trap: 105.66, metal: 113.81, lofi: 57.84, bossa: 94.98};
	let tag = sa && GEN[sa.k] ? GEN[sa.k][0] : '', sig = sa && GEN[sa.k] ? GEN[sa.k][1] : '招牌声';
	let scanK = -1, scanGenre = '';
	if (t < 4) { scanK = Math.min(7, Math.floor(t / 0.5)); scanGenre = SCAN[scanK].genre; tag = scanG[scanGenre]; sig = SCANSIG[scanGenre]; }
	if (t >= 4 && t < 13.5) { tag = '？'; sig = '招牌声'; }
	if (t >= 13.5 && t < 16) tag = '8种';
	if (t >= 76.29 && t < 82.29) { tag = t < 76.7 ? '#%雷?摇&' [Math.floor(t * 30) % 8] + '？' : '？'; sig = '？'; }
	if (t >= 82.29 && t < 91.29) { tag = '雷鬼'; sig = '吉他嚓'; }
	if (t >= 122.93 && t < 128.81) { const names = ['摇滚', 'House', '爵士', 'Lo-fi', '雷鬼', '波萨诺瓦', 'Trap', '金属']; const i = Math.floor((t - 122.81) / 0.5); tag = i < 8 ? names[i] : '原版'; }
	if (sa?.k === 'recap') { const L4 = ['摇滚', '爵士', 'Lo-fi', '雷鬼']; tag = L4[sa.bar]; sig = ['电吉他', '叮叮镲', '黑胶', '吉他嚓'][sa.bar]; }
	const cnt = (EV.ev as any[]).filter((e) => e.row === 'COUNT' && t >= e.t && t < e.t + 0.75);
	const countN = cnt.length ? String(cnt[cnt.length - 1].v) : '';

	// ---- pad override during the hook (scan): the genre's bar, the window at 100 %
	const scanOverride = (tt: number) => {
		const g = scanGenre, src = SCANSRC[g], s = SEGS[g], bar = Math.floor((src - s.t0) / s.bar), b0 = s.t0 + bar * s.bar;
		const st = padState(b0 + s.bar - 0.001, g, bar, b0);
		const w0 = (scanK % 4) * 4, local = (tt - scanK * 0.5) / 0.25;
		for (let gr = 0; gr < 4; gr++) for (let k = 0; k < 16; k++) {
			const inW = k >= w0 && k < w0 + 2;
			st.lit[gr][k] = st.lit[gr][k] > 0 ? (inW ? 1 : 0.3) : 0; st.hot[gr][k] = inW && st.lit[gr][k] > 0 && local < 0.4 ? 1 : 0;
		}
		return st;
	};
	// ---- 招牌 row overrides: house synth (mel), rock (chord bars), trap 808 trail, metal scope, bossa strings, theme dots
	const melIn = (k: string) => MEL.filter((n) => n.seg === k);

	const inTitle = t >= 20.0 && t < 23.0, titleK = r(t, 20.0, 20.17) * (1 - r(t, 22.7, 23.0));
	const charge = r(t, 19.0, 20.0) * (t < 20 ? 1 : 0);
	const themeDim = (t >= 16.0 && t < 20.0) || (t >= 122.81 && t < 126.0);
	const lofiWarm = r(t, 51.68, 52.6) * (1 - r(t, 63.6, 64.3));
	const bossaSoft = r(t, 91.29, 91.8) * (1 - r(t, 100.4, 100.6));
	const hideRows: number[] = [];
	if (sa && ['jazz', 'lofi', 'trap', 'metal', 'bossa', 'theme', 'theme2'].includes(sa.k)) hideRows.push(0);
	if (sa?.k === 'recap' && (sa.bar === 1 || sa.bar === 2)) hideRows.push(0);
	const padDim = dim.map((d) => d * (themeDim ? 0.18 : 1) * (t >= 3.2 && t < 16 ? 0.4 : 1) * (inTitle ? 0.7 : 1));
	const emptySocket = sa?.k === 'reggae' || (sa?.k === 'recap' && sa.bar === 3) ? r(t, sa!.k === 'recap' ? 135.89 : 63.99, (sa!.k === 'recap' ? 135.89 : 63.99) + 0.3) * (ln === 21 ? 0.4 : 1) : 0;
	const stepsHot = sa ? Math.floor(((t - sa.b0) / sa.bl) * 16) % 16 : 0;

	// beat-number colouring for line 10
	const beatCols = ln === 10 ? [C.K, C.S, C.K, C.S] : undefined;

	// raise state of the clue keys
	const raise = [0, 1, 2, 3].map((i) => win(t, UNLOCK[i] - 0.05, UNLOCK[i] + (i === 2 ? 2.9 : 1.9), 0.25, 0.3));
	const keysAll = Math.max(win(t, 10.9, 13.5, 0.3, 0.4), win(t, 125.81, 138.9, 0.4, 0.3), ln === 27 ? win(t, 89.6, 91.0, 0.2, 0.3) : 0);
	const key1Only = ln === 27 ? win(t, 88.11, 89.7, 0.2, 0.1) : 0;
	const raiseA = raise.map((v, i) => Math.max(v, keysAll, i === 0 ? key1Only : 0));
	const focusKey = t >= 128.81 && t < 138.96 ? (sa?.k === 'recap' ? sa.bar : -1) : -1;
	const badge: [number, string] | null = t >= 96.83 && t < 99.8 ? [0, '吉他也能打鼓点'] : t >= 119.81 && t < 122.5 ? [3, '只按2个音'] : null;
	const badgeRaise = badge ? [0, 1, 2, 3].map((i) => (i === badge[0] ? win(t, badge[0] === 0 ? 96.83 : badge[0] === 2 ? 107.38 : 119.81, badge[0] === 0 ? 99.8 : badge[0] === 2 ? 110.5 : 122.5, 0.25, 0.3) : 0)) : [0, 0, 0, 0];

	// tempo strip
	let tempo: React.ReactNode = null;
	if (ln === 12 || ln === 13) tempo = <Tempo bpm={124} o={win(t, 36.11, 41.4, 0.3, 0.3)} num={ln === 12 ? '≈120' : '120'} />;
	if (ln === 17 || ln === 18) tempo = <Tempo bpm={78} o={win(t, 54.75, 60.5, 0.3, 0.3)} num={ln === 17 ? '约70–80' : undefined} />;
	if (ln === 26) tempo = <Tempo bpm={80} o={win(t, 85.29, 88.0, 0.25, 0.25)} />;
	if (ln === 32) tempo = <Tempo bpm={150} bpm2={70} o={win(t, 107.38, 110.6, 0.25, 0.3)} tags={['跟着次', '跟着打']} num="又快又慢" numSize={72} />;
	if (ln === 40) tempo = <Tempo bpm={78} o={win(t, 132.81, 135.7, 0.25, 0.25)} />;

	return (
		<AbsoluteFill style={{background: '#111214'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Defs />
				<g transform={`translate(960 556) scale(${mix(1, 0.3, endK)}) translate(-960 -556)`} opacity={1 - endK}>
				<g transform={camT}>
					{/* faceplate, wider than the frame (the knob sits off-frame left) */}
					<rect x={-520} y={-60} width={2960} height={860} fill="url(#panelG)" />
					<rect x={-520} y={-60} width={2960} height={860} fill="url(#brush)" />
					<rect x={-520} y={0} width={2960} height={800} fill="#FFB060" opacity={0.1 * lofiWarm} />
					<Knob t={t} />
					{[[40, 760], [1880, 760]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={11} fill="#2b2d31" stroke="#6a6d73" strokeWidth={2} /><line x1={x - 6} x2={x + 6} y1={y} y2={y} stroke="#6a6d73" strokeWidth={3} /></g>)}

					{/* the VFD — grows into the title on the drop */}
					{inTitle ? null : <Vfd text={tag} bloom={(EV.ev as any[]).some((e) => e.row === 'X' && ['rock', 'metal'].includes(e.seg) && t >= e.t && t - e.t < 0.33) ? 0.8 : 0} />}

					<Beats t={t} colors={beatCols} dimAll={themeDim ? 0.5 : 1} />
					<Labels dim={dim} sig={sig} />

					{/* the pads */}
					<g opacity={1}>
						<Pads t={t} dim={padDim.map((d) => d * (1 - 0.4 * bossaSoft))} jitter={sa?.k === 'lofi' ? 4 : 0} bloomK={1 - 0.4 * bossaSoft} override={t < 4 ? scanOverride : null}
							emptySocket={emptySocket} footprints={(ln >= 11 && ln <= 12) || ln === 18 ? 1 : 0} hide={hideRows} />
					</g>

					{/* the title charge: pads glow from both edges toward the centre */}
					{charge > 0 && <g filter="url(#spill)">{[0, 1, 2, 3].map((g) => Array.from({length: 16}, (_, s) => { const d = Math.abs(s - 7.5) / 7.5; const k = cl((charge - (1 - d)) * 2.5 + 0.2 * charge); return k > 0.02 ? <rect key={`${g}${s}`} x={sx(s) - 10} y={ROWY[g] - 6} width={PADW + 20} height={PADH + 10} rx={20} fill={ROWC[g]} opacity={0.55 * k} /> : null; }))}</g>}
					{t >= 20.0 && t < 20.5 && <g filter="url(#spill)" opacity={1 - lin(t, 20.0, 20.5)}>{[0, 1, 2, 3].map((g) => Array.from({length: 16}, (_, s) => <rect key={`${g}${s}`} x={sx(s) - 10} y={ROWY[g] - 6} width={PADW + 20} height={PADH + 10} rx={20} fill={ROWC[g]} opacity={0.75} />))}</g>}

					{/* 招牌 row per genre */}
					<SigRow t={t} sa={sa} dim={dim[0]} ln={ln} />

					{/* melody overlay (theme, theme2) */}
					<Melody t={t} />

					{/* syllable pops: rock, the first house bar, the recap rock bar */}
					<Pops t={t} segs={t < 34 ? ['rock', 'house'] : t >= 128.81 && t < 130.81 ? ['recap'] : []} o={t < 22 ? 0 : 1} />

					{inTitle && <g transform={`translate(890 126) scale(${t < 20.17 ? mix(1.25, 1, lin(t, 20.0, 20.17)) : 1}) translate(-890 -126)`} opacity={titleK}>
						<Vfd text="同一段旋律，8种曲风" label="" x0={300} x1={1480} y0={26} y1={226} size={100} bloom={1 - lin(t, 20, 20.6)} />
					</g>}
					{/* hook window */}
					{t < 3.5 && <HookWindow t={t} scanK={scanK} />}
					{t >= 2.6 && t < 8.6 && <Bars t={t} />}
					{t >= 8.0 && t < 11.4 && <T x={1085} y={560} t="？" s={260} c={C.mint} o={win(t, 8.0, 11.2, 0.3, 0.3)} glow />}
					{countN && <T x={1085} y={560} t={countN} s={240} c={C.mint} glow />}

					{/* deck of 8 genres fanned over the label column */}
					{t >= 13.5 && t < 16.2 && <Deck t={t} />}

					{/* everyday pictures */}
					<Everyday t={t} ln={ln} sa={sa} />

					{/* context row */}
					{tempo}
					<Keys t={t} raise={raiseA.map((v, i) => Math.max(v, badgeRaise[i]) * (ln === 40 ? 1 - win(t, 132.81, 135.8, 0.2, 0.2) : 1))} focus={focusKey} badge={badge} locked={t < 30} />
					{t >= 76.29 && t < 91.3 && <Quiz t={t} />}
					{ln === 27 && t < 89.6 && <T x={505} y={650} t="✗ 只看这一个" s={52} c={C.red} o={win(t, 88.2, 89.6, 0.15, 0.2) * (0.6 + 0.4 * Math.abs(Math.sin(t * 14)))} />}
					<rect x={-520} y={0} width={2960} height={800} fill="url(#vig)" />
				</g>
				</g>
				{/* bezel (subtitle strip) */}
				<rect x={0} y={792} width={W} height={288} fill="url(#bezelG)" opacity={1 - endK} />
				<line x1={0} x2={W} y1={793} y2={793} stroke="#5b5e64" strokeWidth={2} opacity={1 - endK} />
			</svg>
			{t >= OUTRO && <Sequence from={Math.round(OUTRO * FPS)}><EndCard v={{id: 'ep30', src: '', title: '同一段旋律，8种曲风', kicker: '', tagline: '', taglineEn: '', motif: 'none', card: [0, 0], extend: 0, question: '用这4步听，评论区写答案', sources: '来源：Gjerdingen & Perrott 2008；Mace 等 2012；MacDougall & Moore 2005；Open Music Theory；Herbst 2017/2019；Smithsonian；全片音乐为代码合成', duration: 0} as any} cfg={{videos: []} as any} dur={Math.round((END - OUTRO) * FPS)} /></Sequence>}
			{t >= OUTRO && <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Defs /><MiniPads t={t} /></svg>}
			{sub && <div style={{opacity: Math.min(sub[0] <= 0 ? 1 : lin(t, sub[0], sub[0] + 0.15), 1 - lin(t, sub[1] - 0.15, sub[1]))}}><Sub t={sub[2]} /></div>}
			<div style={{position: 'absolute', top: 36, right: 58, opacity: t < OUTRO ? 0.6 : 0, fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: '0.32em', color: C.silk}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ pieces
const HookWindow: React.FC<{t: number; scanK: number}> = ({t, scanK}) => {
	const half = r(t, 2.6, 2.85), k = scanK < 0 ? 7 : scanK;
	const w0 = (k % 4) * 4, x0 = sx(w0) - 12, x1 = sx(w0 + 1) + PADW + 12, xm = mix(x1, sx(w0) + PADW + 12, half);
	const o = 1 - r(t, 3.15, 3.45);
	return (
		<g opacity={o}>
			<rect x={x0} y={240} width={xm - x0} height={ROWY[3] + PADH - 230} rx={18} fill="none" stroke={C.mint} strokeWidth={6} filter="url(#glowT)" />
			<path d={`M ${x0 + 6} 660 L ${x0 + 6} 676 L ${xm - 6} 676 L ${xm - 6} 660`} fill="none" stroke={C.mint} strokeWidth={5} />
			<T x={(x0 + xm) / 2} y={770} t={half < 0.5 ? '0.25秒' : '0.125秒'} s={104} c={C.mint} glow />
		</g>
	);
};
const Bars: React.FC<{t: number}> = ({t}) => {
	const up = r(t, 3.3, 4.0), up2 = r(t, 3.8, 4.4), split = r(t, 5.3, 5.7), drain = 1 - r(t, 8.0, 8.5);
	const base = ROWY[3] + PADH - 6, full = 520;
	const hG = full * 0.54 * up * drain, hR = full * 0.2 * up2 * drain;
	const a = sx(6), b = sx(10);
	return (
		<g>
			{split < 1 && <g opacity={1 - split}>
				<rect x={a} y={base - hG} width={PADW * 2 + 16} height={hG} rx={10} fill={C.mint} opacity={0.9} filter="url(#glowT)" />
				<T x={a + PADW + 8} y={base - hG - 18} t="54%" s={72} c={C.mint} o={up} />
			</g>}
			{split > 0 && <g opacity={split}>
				<rect x={a - 110} y={base - hG} width={PADW + 20} height={hG} rx={10} fill={C.mint} opacity={0.9} filter="url(#glowT)" />
				<rect x={a + 110} y={base - hG} width={PADW + 20} height={hG} rx={10} fill={C.mint} opacity={0.9} filter="url(#glowT)" />
				<T x={a - 63} y={720} t="学过" s={52} o={drain} /><T x={a + 157} y={720} t="没学过" s={52} o={drain} />
			</g>}
			<rect x={b} y={base - hR} width={PADW * 2 + 16} height={hR} rx={10} fill="#dfe2e8" opacity={0.55 * (1 - 0.6 * split)} />
			<T x={b + PADW + 8} y={base - hR - 18} t="20%" s={72} c="#dfe2e8" o={up2 * (1 - split) * drain} />
			<g opacity={(1 - split) * drain}>
				<T x={a + PADW + 8} y={720} t="猜对" s={52} c={C.mint} /><T x={b + PADW + 8} y={720} t="瞎猜" s={52} c="#dfe2e8" />
				<T x={b + PADW + 8} y={770} t="5种曲风里选" s={40} w={700} c="#c9c3b3" />
			</g>
		</g>
	);
};
const Deck: React.FC<{t: number}> = ({t}) => {
	const names = ['摇滚', 'House', '爵士', 'Lo-fi', '雷鬼', '波萨诺瓦', 'Trap', '金属'];
	const fan = r(t, 13.5, 14.1) * (1 - r(t, 15.8, 16.15));
	return (
		<g>
			{names.map((n, i) => { const k = r(t, 13.5 + i * 0.25, 13.75 + i * 0.25) * (1 - r(t, 15.8, 16.15)); return (
				<g key={n} transform={`translate(${430 + i * 190} ${722 + (1 - k) * 40})`} opacity={k}>
					<rect x={-88} y={-44} width={176} height={84} rx={10} fill={C.vfd} stroke="#0a0a0b" strokeWidth={3} />
					<T x={0} y={14} t={n} s={n.length > 3 ? 40 : 52} c={C.G} />
				</g>
			); })}
		</g>
	);
};
/** the 招牌 row: drawn per genre */
const SigRow: React.FC<{t: number; sa: ReturnType<typeof segAt>; dim: number; ln: number}> = ({t, sa, dim, ln}) => {
	if (!sa) return null;
	const y = ROWY[0] + 3, k = sa.k;
	const stripX0 = sx(0), stripX1 = sx(15) + PADW;
	const tx = (tt: number) => stripX0 + ((tt - sa.b0) / sa.bl) * (stripX1 - stripX0);
	if (k === 'rock') {
		const chord = (BYBAR[`rock|${sa.bar}`] || []).some((e) => e.row === 'G' && e.t <= t);
		const mel = MEL.filter((n) => n.seg === 'rock' && n.t <= t && t - n.t < 0.3 && n.t >= sa.b0);
		return <g opacity={dim}>
			{chord && Array.from({length: 16}, (_, s) => s % 2 === 0 && sa.b0 + (s / 16) * sa.bl <= t ? <rect key={s} x={sx(s) + 3} y={y + 3} width={PADW - 6} height={PADH - 12} rx={10} fill={C.G} opacity={0.7} filter="url(#glowT)" /> : null)}
			{mel.map((n, i) => { const s = Math.round(((n.t - sa.b0) / sa.bl) * 16) % 16; return <rect key={i} x={sx(s) + 12} y={y + 12} width={PADW - 24} height={PADH - 30} rx={8} fill="#fff" opacity={0.8 * (1 - (t - n.t) / 0.3)} />; })}
		</g>;
	}
	if (k === 'house') {
		const pump = (SEGS.house as any).kicks ? Math.min(...((SEGS.house as any).kicks as number[]).filter((kt: number) => kt <= t).map((kt: number) => t - kt).concat([9])) : 9;
		const duck = 1 - 0.6 * Math.exp(-pump / 0.12);
		const mel = MEL.filter((n) => n.seg === 'house' && n.t <= t && n.t >= sa.b0);
		return <g opacity={dim * duck}>{mel.map((n, i) => { const s = Math.round(((n.t - sa.b0) / sa.bl) * 16) % 16; return <rect key={i} x={sx(s) + 3} y={y + 3} width={PADW - 6} height={PADH - 12} rx={10} fill={C.G} opacity={t - n.t < 0.15 ? 1 : 0.6} filter="url(#glowT)" />; })}</g>;
	}
	if (k === 'jazz' || (k === 'recap' && sa.bar === 1)) {
		const evs = (BYBAR[`${k}|${sa.bar}`] || []).filter((e) => e.row === 'X' && e.t <= t + 1e-4);
		const pts = evs.map((e) => ({x: tx(e.t), fresh: t - e.t}));
		return <g opacity={Math.max(dim, 0.3)}>
			<rect x={stripX0} y={y + 22} width={stripX1 - stripX0} height={34} rx={17} fill="#3b2a35" stroke={C.well} strokeWidth={3} />
			{pts.map((p, i) => <g key={i}><circle cx={p.x} cy={y + 39} r={p.fresh < 0.1 ? 22 : 15} fill={C.G} filter="url(#glowT)" />
				{p.fresh < 0.5 && t < 43.68 && <T x={p.x} y={y - 6 - p.fresh * 40} t={i % 3 === 0 ? '叮' : '哒'} s={64} c={C.G} o={1 - p.fresh / 0.5} />}</g>)}
			{ln === 15 && pts.slice(1).map((p, i) => { const a = pts[i]; const hgt = Math.abs(p.x - a.x) * 0.45; return <path key={i} d={`M ${a.x} ${y + 20} Q ${(a.x + p.x) / 2} ${y - hgt} ${p.x} ${y + 20}`} fill="none" stroke={C.G} strokeWidth={5} strokeDasharray="10 8" opacity={0.9} />; })}
			{ln === 16 && <g>
				<rect x={stripX0} y={ROWY[1] + 24} width={stripX1 - stripX0} height={34} rx={17} fill="#203833" stroke={C.well} strokeWidth={3} />
				{Array.from({length: 8}, (_, i) => <circle key={i} cx={stripX0 + (i + 0.5) * (stripX1 - stripX0) / 8} cy={ROWY[1] + 41} r={15} fill={C.H} filter="url(#glowT)" />)}
				<T x={1560} y={706} t="上：摇摆" s={52} c={C.G} a="middle" />
				<T x={1560} y={768} t="下：直" s={52} c={C.H} a="middle" />
			</g>}
		</g>;
	}
	if (k === 'lofi' || (k === 'recap' && sa.bar === 2)) {
		const evs = ALL.filter((e) => e.row === 'V' && t - e.t >= 0 && t - e.t < 0.08);
		const R = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
		return <g opacity={Math.max(dim, 0.4)}>
			<rect x={stripX0} y={y + 6} width={stripX1 - stripX0} height={PADH - 18} rx={14} fill="#2e2620" stroke={C.well} strokeWidth={3} />
			{Array.from({length: 40}, (_, i) => { const n = Math.floor(t * 12) * 40 + i; return <circle key={i} cx={stripX0 + R(n) * (stripX1 - stripX0)} cy={y + 12 + R(n + 7) * (PADH - 30)} r={1.5 + R(n + 3) * 3} fill="#ffd9b0" opacity={0.25 + 0.5 * R(n + 5)} />; })}
			{evs.length > 0 && <rect x={stripX0} y={y + 6} width={stripX1 - stripX0} height={PADH - 18} rx={14} fill="#ffd9b0" opacity={0.12} />}
		</g>;
	}
	if (k === 'reggae' || k === 'quiz' || (k === 'recap' && sa.bar === 3)) {
		const evs = (BYBAR[`${k}|${sa.bar}`] || []).filter((e) => e.row === 'G' && e.t <= t);
		const stamp = (ln >= 22 && ln <= 22) || ln === 26 || (k === 'recap' && sa.bar === 3);
		return <g opacity={dim}>{evs.map((e, i) => { const dt = t - e.t; const o = dt < 0.1 ? 1 : Math.max(0.15, Math.exp(-(dt - 0.1) / 0.12)); return <g key={i}>
			<rect x={sx(e.st) + 3} y={y + 3} width={PADW - 6} height={PADH - 12} rx={10} fill={C.G} opacity={o} filter="url(#glowT)" />
			{stamp && dt < 0.6 && <T x={cx(e.st)} y={y - 12 - dt * 30} t="嚓" s={64} c={C.G} o={1 - dt / 0.6} glow />}
		</g>; })}</g>;
	}
	if (k === 'trap' || k === 'bonus') {
		const evs = (BYBAR[`${k}|${sa.bar}`] || []).filter((e) => e.row === 'K' && e.t <= t);
		return <g opacity={dim}>{evs.map((e, i) => { const dt = t - e.t; const len = cl(dt / 0.9) * (stripX1 - sx(e.st)); return <rect key={i} x={sx(e.st)} y={y + 26} width={Math.max(PADW, len)} height={26} rx={13} fill={C.G} opacity={Math.max(0, 1 - dt / 1.4)} filter="url(#glowT)" />; })}</g>;
	}
	if (k === 'metal') {
		// the 招牌 screen as an oscilloscope: the guitar wave, jagged when distorted; chord dots for MUD / CLEAN
		const jag = r(t, 113.81, 114.4);
		let d = '';
		for (let x = stripX0; x <= stripX1; x += 6) { const ph = (x - stripX0) / 38 - t * 18; let v = Math.sin(ph); v = mix(v, Math.tanh(v * 6), jag) + (jag * (Math.sin(x * 1.7 + t * 50) * 0.12)); d += `${x === stripX0 ? 'M' : 'L'} ${x} ${y + 39 - v * 30} `; }
		const mud = ALL.filter((e) => e.row === 'MUD' && e.t <= t).pop(), clean = ALL.filter((e) => e.row === 'CLEAN' && e.t <= t).pop();
		const showMud = ln === 34 && mud, showClean = ln === 35 && clean;
		const smear = showMud ? r(t, mud!.t + 0.15, mud!.t + 0.6) : 0;
		return <g>
			<rect x={stripX0} y={y + 4} width={stripX1 - stripX0} height={PADH - 14} rx={12} fill={C.vfd} stroke={C.well} strokeWidth={3} />
			<path d={d} fill="none" stroke={C.G} strokeWidth={4} opacity={showMud || showClean ? 0.25 : dim} filter="url(#glowT)" />
			{showMud && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={mix(960 - 240 + i * 120, 960, smear)} cy={y + 39} r={mix(22, 46, smear)} fill={mix(0, 1, smear) > 0.5 ? '#8a7f86' : [C.K, C.S, C.H, C.G, '#b28cff'][i]} opacity={mix(1, 0.35, smear)} filter="url(#glowT)" />)}
			{showMud && <T x={960} y={y - 12} t="5个音" s={52} c="#fff" o={1 - smear} />}{showClean && <T x={960} y={y - 12} t="2个音" s={52} c="#fff" />}
			{showClean && [0, 1].map((i) => <circle key={i} cx={960 - 90 + i * 180} cy={y + 39} r={28} fill={[C.K, C.S][i]} stroke="#fff" strokeWidth={5} filter="url(#glowT)" />)}
		</g>;
	}
	if (k === 'bossa') {
		// six nylon strings across the grid; the low string (thumb) is wired to 动, the high ones (fingers) to 打 / 次
		const gs = ALL.filter((e) => e.seg === 'bossa' && (e.row === 'G' || e.row === 'K') && e.t <= t && t - e.t < 0.6);
		const draw = r(t, 91.29, 91.9);
		return <g>
			{[0, 1, 2, 3, 4, 5].map((i) => {
				const yy = 268 + i * 11, low = i === 5, hit = gs.filter((e) => (low ? e.row === 'K' : e.row === 'G')).map((e) => t - e.t);
				const amp = hit.length ? 8 * Math.exp(-Math.min(...hit) / 0.18) : 0;
				let d = ''; for (let x = stripX0; x <= mix(stripX0, stripX1, draw); x += 10) d += `${x === stripX0 ? 'M' : 'L'} ${x} ${yy + Math.sin((x - stripX0) / (stripX1 - stripX0) * Math.PI) * amp * Math.sin(t * 90 + i)} `;
				return <path key={i} d={d} fill="none" stroke={low ? C.K : '#f2e6cf'} strokeWidth={low ? 5 : 2.5 + i * 0.2} opacity={0.9} filter={amp > 1 ? 'url(#glowT)' : undefined} />;
			})}
			{ln === 29 && <g opacity={win(t, 96.6, 100.3, 0.3, 0.3)}>
				<path d={`M ${stripX0 - 20} 323 C 300 420, 300 520, ${sx(0)} ${cyR(3)}`} fill="none" stroke={C.K} strokeWidth={4} strokeDasharray="10 8" />
				<path d={`M ${stripX1 + 6} 290 C 1880 340, 1880 420, ${stripX1 - 8} ${cyR(1)}`} fill="none" stroke="#f2e6cf" strokeWidth={4} strokeDasharray="10 8" />
				<path d={`M ${stripX1 + 6} 290 C 1890 360, 1890 470, ${stripX1 - 8} ${cyR(2)}`} fill="none" stroke="#f2e6cf" strokeWidth={4} strokeDasharray="10 8" />
				<T x={sx(0) + 10} y={cyR(3) + 110} t="拇指 → 动" s={52} c={C.K} a="start" />
				<T x={stripX1} y={cyR(1) - 70} t="手指 → 打·次" s={52} c="#f2e6cf" a="end" />
			</g>}
		</g>;
	}
	return null;
};
/** theme melody dots (16–20 and 122.81–126), with the template outline from 0:16 */
const Melody: React.FC<{t: number}> = ({t}) => {
	const inA = t >= 16 && t < 20.2, inB = t >= 122.81 && t < 126.3;
	if (!inA && !inB) return null;
	const k = inA ? 'theme' : 'theme2', s = SEGS[k], ns = MEL.filter((n) => n.seg === k).slice(0, 9);
	const o = inA ? win(t, 16.0, 20.15, 0.3, 0.15) : win(t, 122.81, 126.3, 0.3, 0.4);
	const pos = (n: any) => { const st = ((n.t - s.t0) / s.bar) * 8; return [sx(Math.floor(st)) + PADW / 2 + (st % 1) * 89.9, mix(ROWY[3] + 70, ROWY[0] + 30, (n.midi - 67) / (76 - 67))]; };
	const lit = ns.filter((n) => n.t <= t);
	return (
		<g opacity={o}>
			{/* template: dashed outline where the dots belong */}
			{ns.map((n, i) => { const [x, y] = pos(n); return <circle key={`o${i}`} cx={x} cy={y} r={24} fill="none" stroke={C.mint} strokeWidth={3} strokeDasharray="7 6" opacity={inB ? 0.9 : 0.4} />; })}
			<path d={lit.map((n, i) => { const [x, y] = pos(n); return `${i ? 'L' : 'M'} ${x} ${y}`; }).join(' ')} fill="none" stroke={C.mint} strokeWidth={4} opacity={0.6} />
			{lit.map((n, i) => { const [x, y] = pos(n); const f = t - n.t < 0.12; return <circle key={i} cx={x} cy={y} r={f ? 24 : 18} fill={C.mint} filter="url(#glowT)" />; })}
			{inB && t > 123.3 && <T x={sx(15) + PADW} y={ROWY[0] - 30} t="一个音都没改 ✓" s={52} c={C.mint} a="end" o={r(t, 123.3, 123.7)} />}
		</g>
	);
};
/** everyday pictures on the pads: stairs (reggae l.21) */
const Everyday: React.FC<{t: number; ln: number; sa: ReturnType<typeof segAt>}> = ({t, ln}) => {
	if (ln !== 21) return null;
	const o = win(t, 70.14, 72.83, 0.3, 0.3), s0 = SEGS.reggae, bar = Math.floor((t - s0.t0) / s0.bar), b0 = s0.t0 + bar * s0.bar;
	const ph = (t - b0) / s0.bar;
	const steps = [0, 1, 2, 3].map((b) => ({x: sx(b * 4), w: sx(b * 4 + 3) + PADW - sx(b * 4), y: ROWY[b] + 10}));
	// the foot falls through the missing step 1 and lands on step 3 with the 动 hit
	const fx = mix(steps[0].x + 150, steps[2].x + 150, cl(ph / 0.5)), fy = ph < 0.5 ? mix(steps[0].y - 40, steps[2].y - 20, Math.pow(cl(ph / 0.5), 2)) : steps[2].y - 20;
	return (
		<g opacity={o}>
			{steps.map((st, i) => i === 0 ? <rect key={i} x={st.x} y={st.y} width={st.w} height={22} rx={6} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="12 9" /> :
				<rect key={i} x={st.x} y={st.y} width={st.w} height={22} rx={6} fill={i === 2 ? C.K : '#d6d0c0'} opacity={0.9} filter="url(#glowT)" />)}
			<Foot x={fx} y={fy} left={false} o={1} />
			<T x={steps[0].x + st0w(steps) / 2} y={steps[0].y - 20} t="踩空" s={52} c="#fff" />
		</g>
	);
};
const st0w = (steps: {w: number}[]) => steps[0].w;
/** quiz: answer keys, countdown, reveal */
const Quiz: React.FC<{t: number}> = ({t}) => {
	const up = win(t, 76.48, 85.25, 0.35, 0.3), rev = t >= 82.29, shake = rev && t < 82.7 ? Math.sin((t - 82.29) * 60) * 10 * (1 - (t - 82.29) / 0.41) : 0;
	const ans = [['A', 'House'], ['B', '雷鬼'], ['C', '摇滚']];
	return (
		<g opacity={up} transform={`translate(0 ${(1 - up) * 40})`}>
			<rect x={330} y={672} width={300} height={100} rx={14} fill="#3a3020" stroke={C.key} strokeWidth={4} />
			<T x={480} y={740} t="线索 4/4" s={52} c="#FFE2A6" />
			{ans.map(([l, n], i) => { const right = rev && i === 1, wrong = rev && i === 0; return (
				<g key={l} transform={`translate(${wrong ? shake : 0} 0)`}>
					<rect x={700 + i * 390} y={672} width={360} height={100} rx={14} fill={right ? '#174a3e' : '#2a2c30'} stroke={right ? C.mint : '#16171a'} strokeWidth={right ? 6 : 4} filter={right ? 'url(#glowT)' : undefined} />
					<T x={880 + i * 390} y={742} t={`${l}  ${n}`} s={58} c={right ? C.mint : C.silk} />
					{wrong && <T x={880} y={656} t="差一点" s={40} w={800} c={C.key} o={win(t, 82.29, 85.2, 0.15, 0.3)} />}
				</g>
			); })}
		</g>
	);
};
/** end card motif: a mini pad matrix playing the bonus clip */
const MiniPads: React.FC<{t: number}> = ({t}) => {
	const sa = segAt(t); if (!sa || sa.k !== 'bonus') return null;
	const st = padState(t, 'bonus', sa.bar, sa.b0), k = r(t, OUTRO, OUTRO + 0.9) * (1 - r(t, END - 0.6, END));
	const x0 = 712, y0 = 528, pw = 27, ph = 27;
	return (
		<g opacity={k}>
			{[0, 1, 2, 3].map((g) => Array.from({length: 16}, (_, s) => { const v = st.lit[g][s]; const x = x0 + s * 30 + Math.floor(s / 4) * 8; return <g key={`${g}${s}`}>
				<rect x={x} y={y0 + g * 30} width={pw} height={ph} rx={6} fill="#3a3c41" />
				{v > 0.01 && <rect x={x} y={y0 + g * 30} width={pw} height={ph} rx={6} fill={ROWC[g]} opacity={v} filter="url(#glowT)" />}
			</g>; }))}
			<rect x={1230} y={548} width={100} height={70} rx={10} fill={C.vfd} /><T x={1280} y={600} t="？" s={52} c={C.mint} />
		</g>
	);
};

const Root: React.FC = () => <Composition id="FILM30" component={Film30} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />;
registerRoot(Root);
