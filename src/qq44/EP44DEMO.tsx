import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Grain44} from './kit44';
import {LINES44} from './lines44';
import {T, seg, sm, ease, ColdBrain, CiderBox, Microscope, Highway, Storage, House, Needle, Meadow, Office} from './demo44';
import {Story, Punch, Stamp, Seal, Counter, SubRow} from './skin44';
/* ep44 demo v2: film 0–35.5 (1065 frames), lines 1–11 of lines.json v2 with line 1 given 4.0 s (owner note 5: everything after +0.5 s).
   Scenes are authored on the v1 clock (cold open 0–3.5); `sceneT` maps film time onto it. Video only; no plates. */
const FPS = 30, SH = 0.5, L1 = 4.0;
const sceneT = (t: number) => (t < L1 ? t * T.box / L1 : t - SH);
const film = (v1: number) => (v1 <= T.box ? v1 * L1 / T.box : v1 + SH);   // v1 time → film time
const LINES: [number, number, string][] = LINES44.map(([a, b, s], i) => (i === 0 ? [0, L1, s] : [a + SH, b + SH, s]));
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: 0, b: T.box, C: ColdBrain}, {a: T.box, b: T.mic, C: CiderBox}, {a: T.mic, b: T.car, C: Microscope}, {a: T.car, b: T.room, C: Highway},
	{a: T.room, b: T.title, C: Storage}, {a: T.title, b: T.think, C: House}, {a: T.think, b: T.light, C: Needle}, {a: T.light, b: T.office, C: Meadow}, {a: T.office, b: T.end + 1, C: Office},
];
/** dissolve length into scene i (scene seconds, centred on the boundary); every boundary is a camera move or match, never a solid card */
const XF = [0, 0.3, 0.24, 0.14, 0.3, 0.3, 0.24, 0.3, 0.3];
const CUT_ON = new Set([1, 2, 3, 4]), PUNCH = 4, STACK: Record<number, number> = {7: 6, 10: 9};   // L2 → its L1
const TYPE = 0.35;
/* one thing changes at a time: the line lands (typed ≤ 0.35 s) → the stamp (+0.45) → the counter rolls (+0.8) */
const STAMP_AT = 0.45, COUNT_AT = 0.8;
const STAMPS: [number, string, string?][] = [   // [line index, year, place]; cold open = year only
	[0, '1955'], [1, '1978'], [2, '1985'], [3, '1997'], [4, '2026'], [5, '1879', '乌尔姆'], [6, '约1884', '慕尼黑'], [8, '1895', '阿劳'], [9, '1902', '伯尔尼'], [10, '1905', '伯尔尼'],
];
const stampAt = (t: number) => { if (t >= film(T.title) && t < LINES[5][0]) return null;
	let cur: (typeof STAMPS)[number] | null = null; for (const s of STAMPS) if (t >= (s[0] === 0 ? 0 : LINES[s[0]][0] + STAMP_AT)) cur = s;
	if (!cur) return null; const a = cur[0] === 0 ? -1 : LINES[cur[0]][0] + STAMP_AT; return {s: cur, o: sm(seg(t, a, a + 0.15))}; };
/** counter keys: [film time, value, era, roll seconds]; no era tag after his death */
const lc = (i: number) => LINES[i][0] + COUNT_AT;
const CK: [number, number, string | undefined, number][] = [[0, 76, undefined, 0], [lc(1), 99, undefined, 0.35], [lc(2), 106, undefined, 0.3], [lc(3), 117, undefined, 0.3], [lc(4), 147, undefined, 0.35],
	[film(T.title) + 0.1, 0, undefined, 2.1], [LINES[5][0], 0, '出生', 0], [lc(6), 4, '童年', 0.3], [film(20.3), 5, '童年', 0.3], [lc(8), 16, '少年', 0.4], [lc(9), 23, '青年', 0.4], [lc(10), 26, '青年', 0.4]];
const counterAt = (t: number) => { let i = 0; while (i + 1 < CK.length && t >= CK[i + 1][0]) i++;
	const [a, v, era, roll] = CK[i], prev = i > 0 ? CK[i - 1][1] : v, k = roll > 0 ? ease(seg(t, a, a + roll)) : 1, val = prev + (v - prev) * k;
	const dt = 1 / 30, k2 = roll > 0 ? ease(seg(t + dt, a, a + roll)) : 1, speed = Math.abs((v - prev) * (k2 - k)) / dt;
	return {val, era, blur: Math.min(5, speed / 25)}; };
const subsAt = (t: number): {rows: SubRow[]; punch?: {s: string; o: number}} => {
	const i = LINES.findIndex(([a, b]) => t >= a && t < b); if (i < 0) return {rows: []};
	const [a, , s] = LINES[i], len = s.replace(/[[\]]/g, '').length, typed = CUT_ON.has(i) ? len : Math.ceil(len * (i === 0 ? 0.35 + 0.65 * seg(t, 0, TYPE) : seg(t, a, a + TYPE)));
	if (i === PUNCH) return {rows: [], punch: {s, o: sm(seg(t, a, a + 0.12))}};
	const rows: SubRow[] = []; if (STACK[i] !== undefined) rows.push({s: LINES[STACK[i]][2]}); rows.push({s, n: typed}); return {rows};
};
export const Film44: React.FC<{t: number}> = ({t}) => {
	const parts: React.ReactNode[] = [];
	SCENES.forEach((S, i) => { const x0 = XF[i] / 2, x1 = (XF[i + 1] ?? 0) / 2;
		if (t < S.a - x0 || t >= S.b + x1) return;
		const o = x0 > 0 ? sm(seg(t, S.a - x0, S.a + x0)) : 1;
		parts.push(<g key={i} opacity={o}><S.C t={Math.max(S.a, Math.min(S.b + x1, t))} /></g>); });
	return <>{parts}</>;
};
const Demo: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS, sub = subsAt(t), st = stampAt(t), c = counterAt(t);
	return <AbsoluteFill style={{background: '#0c1012'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><Film44 t={sceneT(t)} /><Grain44 seed={3 + (f % 6)} /></svg>
		<Story rows={sub.rows} />
		{sub.punch && <Punch s={sub.punch.s} o={sub.punch.o} />}
		{st && <Stamp y={st.s[1]} place={st.s[2]} o={st.o} />}
		<Counter era={c.era} v={c.val} blur={c.blur} />
		<Seal />
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP44DEMO" component={Demo} durationInFrames={1065} fps={FPS} width={W} height={H} />);
