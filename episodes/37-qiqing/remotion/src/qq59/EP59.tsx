import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Audio, staticFile} from 'remotion';
import {FPS, D, LINES59, STAMPS59, COUNTER59, DEMO_END} from './lines59';
import {W, H, Story, Punch, Stamp, Counter, Seal, RewindMark, Title, SubRow, seg, sm, visLen} from './skin59';
import {Homecoming, GlobeAct, SignpostScene, GoalGlobe, RulesScene, WindowScene, KitScene, CalendarScene, signSun} from './demo59';
/* ep59 《他走路回家，走了28年》 — master. Composition EP59DEMO = bars 0–21 (film 0 → the bar-21 downbeat, 35.94 s, 1078 frames).
   Picture (film time t):
     0      → 10.75  Homecoming: Hull at dusk; cut on bar 2 to the door; the question; the hug; from 8.1 the crane rises off them
     ~9.6   → 16.2   GlobeAct: clouds, then the globe from Britain out to the whole Earth; his route draws itself back from Hull to
                     Chile while the title holds (bars 7–9) and the counter rewinds 2026 → 1998; the dive lands on Patagonia's sun
     15.72  → 20.9   SignpostScene (dissolve in on the sun): he shoulders the pack; first step on bar 10 beat 4
     20.45  → D(14)  GoalGlobe (dissolve out of the sun): the dashed plan from 起点 up and over to 终点
     D(14)  → D(16)  RulesScene (cut): bus / pickup / plane, a red ✕ each on bar 15 beats 1–3
     D(16)  → D(17)  WindowScene (cut): his mother's lit window at night
     D(17)  → D(19)  KitScene (cut): tent, cash, camera pop out of the pack on beats
     D(19)  → D(21)  CalendarScene (cut): the year card tears 1998 → 2008 and stops on bar 20
   The picture and the furniture sit on separate compositor layers (ep44 round 2: keeps subtitle repaints off the heavy SVG). */
export const FRAMES = Math.round(DEMO_END * FPS);
type Part = {a: number; b: number; fadeIn?: [number, number]; C: React.FC<{t: number}>};
const PARTS: Part[] = [
	{a: 0, b: 10.75, C: Homecoming},
	{a: 9.5, b: 16.25, C: ({t}) => <GlobeAct t={t} sun={signSun(15.72)} />},
	{a: 15.72, b: 20.9, fadeIn: [15.72, 16.12], C: SignpostScene},
	{a: 20.45, b: D(14), fadeIn: [20.45, 20.85], C: ({t}) => <GoalGlobe t={t} sun={signSun(20.45)} />},
	{a: D(14), b: D(16), C: RulesScene},
	{a: D(16), b: D(17), C: WindowScene},
	{a: D(17), b: D(19), C: KitScene},
	{a: D(19), b: D(21) + 1, C: CalendarScene},
];
export const Picture: React.FC<{t: number}> = ({t}) => <>{PARTS.map((p, i) => (t >= p.a && t < p.b ? <g key={i} opacity={p.fadeIn ? sm(seg(t, p.fadeIn[0], p.fadeIn[1])) : 1}><p.C t={t} /></g> : null))}</>;
const Vignette: React.FC = () => <g pointerEvents="none"><defs><radialGradient id="v59" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient></defs><rect width={W} height={H} fill="url(#v59)" /></g>;

/* ---------- furniture ---------- */
const TYPE = 0.3;
const rowsAt = (t: number): {rows: SubRow[]; punch?: {s: string; o: number}; title?: {u: number; o: number}} => {
	const L = LINES59.find((l) => t >= l.a && t < l.b); if (!L) return {rows: []};
	if (L.title) return {rows: [], title: {u: t - L.a, o: 1 - sm(seg(t, L.b - 0.36, L.b - 0.06))}};
	if (L.punch) return {rows: [], punch: {s: L.rows[0].s, o: sm(seg(t, L.a, L.a + 0.12)) * (1 - sm(seg(t, L.b - 0.2, L.b - 0.02)))}};
	const rows: SubRow[] = [];
	for (const r of L.rows) { if (t < r.at) continue; const len = visLen(r.s);
		let n: number;
		if (r.chunks) { n = 0; for (const [c, at] of r.chunks) if (t >= at) n = Math.max(n, Math.ceil(lerpN(n, c, seg(t, at, at + 0.14)))); }
		else n = L.a === 0 ? Math.ceil(len * (0.35 + 0.65 * seg(t, 0, TYPE))) : Math.ceil(len * seg(t, r.at, r.at + TYPE));
		rows.push({s: r.s, n}); }
	return {rows};
};
const lerpN = (a: number, b: number, u: number) => a + (b - a) * u;
const stampAt = (t: number) => { const s = STAMPS59.find((x) => t >= x.a && t < x.b); return s ? {s, o: sm(seg(t, s.a, s.a + 0.08))} : null; };
const counterAt = (t: number) => {
	let i = 0; while (i + 1 < COUNTER59.length && t >= COUNTER59[i + 1].t) i++;
	const K = COUNTER59[i], P = i > 0 ? COUNTER59[i - 1] : K, k = K.roll > 0 ? sm(seg(t, K.t, K.t + K.roll)) : 1, k2 = K.roll > 0 ? sm(seg(t + 1 / FPS, K.t, K.t + K.roll)) : 1;
	const year = P.year + (K.year - P.year) * k, age = P.age + (K.age - P.age) * k;
	const km = K.km === null ? null : (P.km ?? 0) + (K.km - (P.km ?? 0)) * k;
	const speed = Math.max(Math.abs((K.year - P.year) * (k2 - k)), Math.abs((K.age - P.age) * (k2 - k))) * FPS;
	return {year, age, km, approx: !!K.approx, blur: Math.min(4, speed / 6)};
};
export const Furniture: React.FC<{t: number}> = ({t}) => {
	const R = rowsAt(t), st = stampAt(t), c = counterAt(t);
	const rew = t > D(7) + 0.4 && t < D(9) - 0.5 ? (0.65 + 0.35 * Math.sin((t - D(7)) * 9)) * sm(seg(t, D(7) + 0.4, D(7) + 0.6)) * (1 - sm(seg(t, D(9) - 0.75, D(9) - 0.5))) : 0;
	return <>
		{R.rows.length > 0 && <Story rows={R.rows} />}
		{R.punch && <Punch s={R.punch.s} o={R.punch.o} />}
		{R.title && <Title u={R.title.u} o={R.title.o} top={690} />}
		{rew > 0.01 && <RewindMark o={rew} />}
		{st && <Stamp y={st.s.y} place={st.s.place} note={st.s.note} o={st.o} />}
		<Counter year={c.year} age={c.age} km={c.km} kmApprox={c.approx} blur={c.blur} />
		<Seal />
	</>;
};
export const EP59: React.FC<{music?: string; pictureOnly?: boolean}> = ({music, pictureOnly = false}) => {
	const f = useCurrentFrame(), t = f / FPS;
	return <AbsoluteFill style={{background: '#0a0c12'}}>
		<svg width={W} height={H} style={{position: 'absolute', willChange: 'transform'}}><Picture t={t} /><Vignette /></svg>
		{!pictureOnly && <div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Furniture t={t} /></div>}
		{music && <Audio src={staticFile(music)} />}
	</AbsoluteFill>;
};
/* inputProps: {music: 'ep59/song.wav'} plays a track dropped into public/ (never commit it); {pictureOnly: true} for picture checks */
registerRoot(() => <>
	<Composition id="EP59DEMO" component={EP59} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
</>);
