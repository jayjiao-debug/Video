import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Grain44} from './kit44';
import {LINES44} from './lines44';
import {T, seg, sm, ease, ColdBrain, CiderBox, Microscope, Highway, Storage, House, Needle, Meadow, Office} from './demo44';
import {Story, Punch, Stamp, Brand, Specimen, SubRow} from './skin44';
/* ep44 demo: film 0–35.0 (1050 frames), lines 1–11 of lines.json v2. Video only; no plates (all backgrounds flat vector). */
const FPS = 30;
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: 0, b: T.box, C: ColdBrain}, {a: T.box, b: T.mic, C: CiderBox}, {a: T.mic, b: T.car, C: Microscope}, {a: T.car, b: T.room, C: Highway},
	{a: T.room, b: T.title, C: Storage}, {a: T.title, b: T.think, C: House}, {a: T.think, b: T.light, C: Needle}, {a: T.light, b: T.office, C: Meadow}, {a: T.office, b: T.end + 1, C: Office},
];
/** dissolve length into scene i (seconds, centred on the boundary); every boundary is a camera move or match, never a solid card */
const XF = [0, 0.3, 0.24, 0.14, 0.3, 0.3, 0.24, 0.3, 0.3];
/* line index (0-based in LINES44) → how it shows */
const CUT_ON = new Set([1, 2, 3, 4]), PUNCH = 4, STACK: Record<number, number> = {7: 6, 10: 9};   // L2 → its L1
const STAMPS: [number, number, string, string?, string?, string?][] = [
	[0, T.box, '1955', '爱因斯坦的大脑'], [T.box, T.mic, '1978', '堪萨斯'], [T.mic, T.car, '1985', '加州大学'], [T.car, T.room, '1997', '美国公路'], [T.room, T.title, '2026', '今天'],
	[T.birth, T.comp, '1879', '德国乌尔姆', '几周后就正常了（妹妹回忆）'], [T.comp, T.light, '约1884', '慕尼黑', '父亲给他看指南针（《自述》）', '“深刻而难忘的印象”'],
	[T.light, T.office, '1895', '瑞士阿劳', '16岁的追光问题（《自述》）'], [T.office, T.paper, '1902', '伯尔尼', '三级技术员（瑞士知识产权局）'], [T.paper, T.end + 1, '1905', '', '4篇论文（美国物理联合会）'],
];
/** counter keys: [time, value, era]; values roll between keys over `roll` seconds */
const CK: [number, number, string, number][] = [[0, 76, '身后', 0], [T.box, 99, '身后', 0.3], [T.mic, 106, '身后', 0.25], [T.car, 117, '身后', 0.25], [T.room, 147, '今天', 0.3],
	[T.title + 0.1, 0, '倒带', 2.1], [T.birth, 0, '出生', 0], [T.comp, 4, '童年', 0.25], [20.3, 5, '童年', 0.3], [T.light, 16, '少年', 0.35], [T.office, 23, '青年', 0.35], [T.paper, 26, '青年', 0.4]];
const counterAt = (t: number) => { let i = 0; while (i + 1 < CK.length && t >= CK[i + 1][0]) i++;
	const [a, v, era, roll] = CK[i], prev = i > 0 ? CK[i - 1][1] : v, k = roll > 0 ? ease(seg(t, a, a + roll)) : 1, val = prev + (v - prev) * k;
	const dt = 1 / 30, k2 = roll > 0 ? ease(seg(t + dt, a, a + roll)) : 1, speed = Math.abs((v - prev) * (k2 - k)) / dt;
	return {val, era, blur: Math.min(5, speed / 25)}; };
const subsAt = (t: number): {rows: SubRow[]; punch?: {s: string; o: number}} => {
	const i = LINES44.findIndex(([a, b]) => t >= a && t < b); if (i < 0) return {rows: []};
	const [a, , s] = LINES44[i], len = s.replace(/[[\]]/g, '').length, typed = CUT_ON.has(i) ? len : Math.ceil(len * (i === 0 ? 0.35 + 0.65 * seg(t, 0, 0.35) : seg(t, a, a + 0.35)));
	if (i === PUNCH) return {rows: [], punch: {s, o: sm(seg(t, a, a + 0.12))}};
	const rows: SubRow[] = []; if (STACK[i] !== undefined) rows.push({s: LINES44[STACK[i]][2]}); rows.push({s, n: typed}); return {rows};
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
	const f = useCurrentFrame(), t = f / FPS, sub = subsAt(t), st = STAMPS.find(([a, b]) => t >= a && t < b), c = counterAt(t);
	return <AbsoluteFill style={{background: '#0c1012'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><Film44 t={t} /><Grain44 seed={3 + (f % 6)} /></svg>
		<Story rows={sub.rows} />
		{sub.punch && <Punch s={sub.punch.s} o={sub.punch.o} />}
		<Brand />
		{st && <Stamp y={st[2]} place={st[3]} l2={st[4]} l3={st[5]} />}
		<Specimen era={c.era} v={c.val} blur={c.blur} />
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP44DEMO" component={Demo} durationInFrames={1050} fps={FPS} width={W} height={H} />);
