import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Audio, staticFile} from 'remotion';
import {FPS, D, BT, LINES59, STAMPS59, DATES59, DEMO_END, PART2_AT, FULL_END} from './lines59';
import {W, H, Story, Punch, Stamp, Counter, Seal, RewindMark, Title, Tally, SubRow, seg, sm, visLen} from './skin59';
import {Homecoming, GlobeAct, SignpostScene, GoalGlobe, RulesScene, WindowScene, KitScene, CalendarScene, signSun, comet, dateAt, openHead, openHeadAt, CAL_OUT} from './demo59';
import {ChaseSouth, Jungle, Jail, ChaseNorth, Alaska, Ice, PullUp, CH_S0} from './part1b59';
import {Arrest, Visa90, Sponsors, Refused, Again, Highway, Steps, PP_IN} from './part1c59';
import {CrackWipe, LeafBurst, PagesWipe, FogWipe} from './fx59';
import {PhotoFull, PhotoSlam, PHOTOS} from './photo59';
import {Part2} from '../qq59sb/SB59';
/* ep59 《他走路回家，走了28年》 — master.
   EP59FULL = the whole film (bars 0–95, 162.1 s): part 1 (bars 0–50, this module) and, from the bar-50 drop, part 2 (the other builder's
   Part2 from src/qq59sb/SB59, t = seconds since bar 50; it draws its own picture, photos and furniture). EP59P1 = part 1 alone (0 → bar 50);
   EP59DEMO = the first 21 bars (kept for reference).
   Part 1 picture (film time t; every change of scene is a transition, never a plain cut):
     0      → 3.65   the real photo (Hull, 2 Nov 2026, his face in the crowd) pulls back and dissolves on the bar-1 downbeat into the drawn
                     Karl at the same place and size (his head is the shared measure); the pull-back carries on to the door
     3.65   → 10.75  the door opens (bar 2 beat 2); a dolly-out lands on the question (bar 3); the hug; the crane off it (7.7)
     ~9.6   → 16.2   clouds → the Earth (perspective, tilted low over Britain, rising to the whole Earth); the gold line draws back from Hull;
                     the title; the rewind light runs back to Chile; the dive onto Patagonia's sun
     15.7   → 20.9   1998, the signpost: he heaves the pack, the first step on bar 10 beat 4, the hi-vis cart behind him
     20.45  → bar 14 the plan, dashed, round the Earth; the camera drops into the home light, which becomes the bus's headlight
     bar 14 → 16     the rules: bus, pickup, plane, a red ✕ each on bar 15 beats 1–3 (the camera kicks); it tilts up into the sky
     bar 16 → 17     down out of the night sky to his mother's lit window (1998); a push into its light
     bar 17 → 19     the kit pops out of the pack on beats; the iris closes on the plastic camera's lens …
     bar 19 → 20½    … and opens on the sunset sun: the year card tears 1998 → 2008 and stops; the camera tilts up into a flare
     bar 20½ → 22    the chase: the gold line races up the Andes, the camera on its head over the curve of the Earth; the dive through
                     the clouds into the Darién canopy; leaves burst past the lens
     bar 22 → 24     the swamp, waist-deep, the machete on the beats; a frond sweeps the frame
     bar 24 → 26     the cell in Panama: 18 marks; the barred door slides open, light floods
     bar 26 → 28     the real photo (the Americas, cowboy hat, the cart with the Union Jack); under it the chase north, the names typing as
                     the head passes; the drop into the white of the Arctic
     bar 28 → 30     Alaska: he walks to the end of the land (stops on beat 3); the ice crack splits the frame …
     bar 30 → 32     … onto the sea ice, two of them with their sleds; the real photo on bar 31 (dusk, the sled on its line)
     bar 32 → 34     straight above them, the camera climbs out to the strait (the line steps over to Asia), then drops into the night
     bar 34 → 36     the searchlight on the downbeat; the guards; the passport with no entry stamp; it slams shut into the lens
     bar 36 → 38     90 days in, he drives a stake and is gone, 90 days out, the snow melts, he is back at the stake; pages fly into the lens
     bar 38 → 40     2008: the sponsors' patches peel off on the beats; a gust of dust
     bar 40 → 42     2012: the stamp lands on bar 40 beat 3: REFUSED; the push into the red …
     bar 42 → 44     … which is the dawn: he lifts his head and sets off (bar 43); the same stride carries on into …
     bar 44 → 48     … the night highway (the break): trucks' light sweeps, the camera draws back; 0 → 5,000 km; dawn at the end
     bar 48 → 50     the embassy steps: one step a beat, the sign under his arm; part 2 cuts in on the bar-50 drop
   The picture, the photos and the furniture sit on separate compositor layers (ep44 round 2: keeps subtitle repaints off the heavy SVG). */
export const FRAMES = Math.round(DEMO_END * FPS), P1_FRAMES = Math.round(PART2_AT * FPS), FULL_FRAMES = Math.round(FULL_END * FPS);
type PartDef = {a: number; b: number; fadeIn?: [number, number]; C: React.FC<{t: number}>};
const PARTS: PartDef[] = [
	{a: 0, b: 10.75, C: Homecoming},
	{a: 9.5, b: 16.25, C: ({t}) => <GlobeAct t={t} sun={signSun(15.72)} />},
	{a: 15.72, b: 20.9, fadeIn: [15.72, 16.12], C: SignpostScene},
	{a: 20.45, b: D(14) + 0.12, fadeIn: [20.45, 20.85], C: ({t}) => <GoalGlobe t={t} sun={signSun(20.45)} />},
	{a: D(14), b: D(16) + 0.06, fadeIn: [D(14), D(14) + 0.1], C: RulesScene},
	{a: D(16) - 0.14, b: D(17), fadeIn: [D(16) - 0.14, D(16) + 0.12], C: WindowScene},
	{a: D(17), b: D(19), C: KitScene},
	{a: D(19), b: CAL_OUT + 0.5, C: CalendarScene},
	{a: CH_S0, b: D(22) + 0.04, C: ChaseSouth},
	{a: D(22), b: D(24) + 0.04, C: Jungle},
	{a: D(24) - 0.02, b: D(26) + 0.04, C: Jail},
	{a: D(26), b: D(28) + 0.04, C: ChaseNorth},
	{a: D(30) - 0.14, b: D(32) - 0.08, C: Ice},
	{a: D(28), b: D(30) + 0.3, C: ({t}) => <CrackWipe t={t} t0={D(30) - 0.14} id="ak"><Alaska t={t} /></CrackWipe>},
	{a: D(32) - 0.16, b: D(34) + 0.02, C: PullUp},
	{a: D(34), b: D(36) + 0.02, C: Arrest},
	{a: D(36), b: D(38) + 0.04, C: Visa90},
	{a: D(38) - 0.02, b: D(40) + 0.04, C: Sponsors},
	{a: D(40) - 0.02, b: D(42) + 0.04, C: Refused},
	{a: D(42), b: D(44) + 0.32, C: Again},
	{a: D(44) - 0.16, b: D(48) + 0.24, fadeIn: [D(44) - 0.16, D(44) + 0.28], C: Highway},
	{a: D(48) - 0.2, b: PART2_AT, fadeIn: [D(48) - 0.2, D(48) + 0.22], C: Steps},
];
/** wipes that sit on top of whatever is under them */
const OVERLAYS: React.FC<{t: number}>[] = [
	({t}) => <LeafBurst t={t} t0={D(22) - 0.27} dur={0.52} />,
	({t}) => <LeafBurst t={t} t0={D(24) - 0.3} dur={0.56} dir={-1} />,
	({t}) => <CoverLift t={t} t0={D(36) - 0.02} dur={0.34} />,
	({t}) => <PagesWipe t={t} t0={D(38) - 0.4} dur={0.72} from={[1150, 760]} seed={3} />,
	({t}) => <FogWipe t={t} t0={D(40) - 0.32} dur={0.64} col="#a99d8a" id="dust" />,
];
/** the passport's dark cover lifting off the next shot (a page turned from the left edge) */
const CoverLift: React.FC<{t: number; t0: number; dur: number}> = ({t, t0, dur}) => { const u = seg(t, t0, t0 + dur); if (u <= 0 || u >= 1) return null;
	const x = W * (1 - Math.pow(1 - u, 2)); return <g><rect x={x} y={-20} width={W - x + 20} height={H + 40} fill="#2a0e12" /><rect x={x - 30} y={-20} width={30} height={H + 40} fill="#000" opacity={0.35} /></g>; };
export const Picture: React.FC<{t: number}> = ({t}) => <>
	{PARTS.map((p, i) => (t >= p.a && t < p.b ? <g key={i} opacity={p.fadeIn ? sm(seg(t, p.fadeIn[0], p.fadeIn[1])) : 1}><p.C t={t} /></g> : null))}
	{OVERLAYS.map((O, i) => <O key={`o${i}`} t={t} />)}
</>;
const Vignette: React.FC = () => <g pointerEvents="none"><defs><radialGradient id="v59" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.42" /></radialGradient></defs><rect width={W} height={H} fill="url(#v59)" /></g>;

/* ---------- the real photos of part 1 (owner 19:05: rare, only where they make people gasp) ---------- */
const OPEN_FADE: [number, number] = [1.3, D(1) + 0.12];
const Photos: React.FC<{t: number}> = ({t}) => {
	const out: React.ReactNode[] = [];
	if (t < OPEN_FADE[1]) {   // the opening: full frame, then pulling back into a soft window that dissolves into the drawing (his head = the measure)
		const P = PHOTOS.nowFace, head = openHead(t), sc = head / P.headH, S = openHeadAt(t), cover = Math.max(1920 / P.iw, 1080 / P.ih) * 1.04;
		const mask = sc < cover ? Math.max(260, head * 2.4) * (1 + 3 * Math.max(0, (sc - cover * 0.7)) / cover) : undefined;
		out.push(<PhotoFull key="open" src={P.src} iw={P.iw} ih={P.ih} fx={P.face[0]} fy={P.face[1]} sx={S[0]} sy={S[1]} scale={sc} o={1 - sm(seg(t, OPEN_FADE[0], OPEN_FADE[1]))} mask={mask} />);
	}
	const slam = (at: number, dur: number, p: {src: string; pos: string}, aspect: number, k: string, rot: number) => (t >= at - 0.01 && t < at + dur + 0.5 ?
		out.push(<PhotoSlam key={k} src={p.src} pos={p.pos} t={t - at} dur={dur} w={980} cx={1170} cy={600} rot={rot} aspect={aspect} out="fly" dim={0.5} />) : null);
	slam(D(26), D(27) - D(26) - 0.1, PHOTOS.americas, 1130 / 863, 'am', -2.5);
	slam(D(31), D(32) - D(31) - 0.24, PHOTOS.beringDusk, 1130 / 858, 'bd', 2);
	return <>{out}</>;
};

/* ---------- furniture ---------- */
const TYPE = 0.3;
const lerpN = (a: number, b: number, u: number) => a + (b - a) * u;
const rowsAt = (t: number): {rows: SubRow[]; punch?: {s: string; o: number}; title?: {u: number; o: number}} => {
	const L = LINES59.find((l) => t >= l.a && t < l.b); if (!L) return {rows: []};
	if (L.title) return {rows: [], title: {u: t - L.a, o: 1 - sm(seg(t, L.b - 0.36, L.b - 0.06))}};
	if (L.punch) { const o0 = L.out ?? L.b - 0.2; return {rows: [], punch: {s: L.rows[0].s, o: sm(seg(t, L.a, L.a + 0.12)) * (1 - sm(seg(t, o0, o0 + 0.22)))}}; }
	const rows: SubRow[] = [];
	for (const r of L.rows) { if (t < r.at) continue; const len = visLen(r.s);
		let n: number;
		if (r.chunks) { n = 0; for (const [c, at] of r.chunks) if (t >= at) n = Math.max(n, Math.ceil(lerpN(n, c, seg(t, at, at + 0.14)))); }
		else n = L.a === 0 ? Math.ceil(len * (0.35 + 0.65 * seg(t, 0, TYPE))) : r.at < L.a ? len : Math.ceil(len * seg(t, r.at, r.at + TYPE));
		rows.push({s: r.s, n}); }
	return {rows};
};
const stampAt = (t: number) => { const s = STAMPS59.find((x) => t >= x.a && t < x.b); return s ? {s, o: s.a === 0 ? 1 : sm(seg(t, s.a, s.a + 0.1))} : null; };
/** odometer values for calendar numbers: hold the whole number, roll only through the last 12 % before the next one */
const snapRoll = (v: number) => { const a = Math.floor(v), f = v - a; return a + Math.max(0, (f - 0.88) / 0.12); };
/** the date (fractional year) behind the counter: the keys of DATES59; the title's rewind follows the light on the route */
const dateOf = (t: number): number => {
	if (t >= D(7) && t < D(9) - 0.05) return t < 12.2 ? 2026.79 : Math.min(2026.79, dateAt(comet(t)));
	let v = DATES59[0].date;
	for (let i = 1; i < DATES59.length; i++) { const k = DATES59[i], p = DATES59[i - 1]; if (t < k.t) { if (k.roll) v = p.date + (k.date - p.date) * sm(seg(t, p.t, k.t)); break; } v = k.date; }
	return v;
};
const counterAt = (t: number) => { const d = dateOf(t), d2 = dateOf(t + 1 / FPS), d0 = dateOf(t - 1 / FPS), sp = Math.abs(d2 - d) * FPS, moving = Math.abs(d2 - d0) > 1e-7;
	const roll = (v: number) => (moving ? snapRoll(v) : Math.floor(v));   // digits roll only while the date moves
	return {year: 1998 + roll(d - 1998.83 + 1 + 1e-6), age: roll(d - 1969.2 + 1e-6), blur: Math.min(1.5, sp / 6)}; };
/** the in-frame tallies: days on the ice, the 90/90 visa days, the km of the protest walk */
const Tallies: React.FC<{t: number}> = ({t}) => {
	if (t >= D(30) && t < D(34)) { const d = 1 + 13 * sm(seg(t, D(30) + 0.25, D(33) + 0.2)), o = sm(seg(t, D(30) + 0.1, D(30) + 0.35)) * (1 - sm(seg(t, D(34) - 0.3, D(34) - 0.05)));
		return <Tally pre="第" v={snapRoll(d)} unit="天" x={1500} y={196} o={o} />; }
	if (t >= D(36) && t < D(38)) { const a = 1 + 89 * seg(t, D(36) + 0.1, BT(36, 2.8)), b = 90 + 90 * seg(t, D(37) + 0.05, BT(37, 2.9)), d = t < D(37) + 0.05 ? a : b;
		const o = sm(seg(t, D(36) + 0.02, D(36) + 0.25)) * (1 - sm(seg(t, D(38) - 0.35, D(38) - 0.1)));
		return <Tally pre="第" v={Math.floor(d)} unit="天" x={1420} y={196} o={o} bar={d / 180} barL="在俄罗斯 90天" barR="离境 90天" />; }
	if (t >= D(44) && t < D(48) + 0.2) { const km = 5000 * sm(seg(t, D(44) + 0.4, D(48) - 0.25)), o = sm(seg(t, D(44) + 0.1, D(44) + 0.4)) * (1 - sm(seg(t, D(48) - 0.05, D(48) + 0.2)));
		return <Tally pre="已走约" v={Math.round(km / 10) * 10} unit="公里" x={1380} y={196} o={o} sep bar={km / 5000} barL="洛杉矶" barR="华盛顿" />; }
	return null;
};
export const Furniture: React.FC<{t: number}> = ({t}) => {
	const R = rowsAt(t), st = stampAt(t), c = counterAt(t);
	const rew = t > D(7) + 0.4 && t < D(9) - 0.5 ? (0.65 + 0.35 * Math.sin((t - D(7)) * 9)) * sm(seg(t, D(7) + 0.4, D(7) + 0.6)) * (1 - sm(seg(t, D(9) - 0.75, D(9) - 0.5))) : 0;
	const pp = t > PP_IN && t < D(36) ? 0.55 : 1;   // the passport insert: the counter steps back
	return <>
		{R.rows.length > 0 && <Story rows={R.rows} />}
		{R.punch && <Punch s={R.punch.s} o={R.punch.o} top={436} />}
		{R.title && <Title u={R.title.u} o={R.title.o} top={640} />}
		{rew > 0.01 && <RewindMark o={rew} />}
		{st && <Stamp y={st.s.y} place={st.s.place} note={st.s.note} o={st.o} />}
		<Tallies t={t} />
		<Counter year={c.year} age={c.age} blur={c.blur} o={pp} />
		<Seal />
	</>;
};
/** part 1 at film time t (picture | photos | furniture, each its own layer) */
export const Part1: React.FC<{t: number; pictureOnly?: boolean}> = ({t, pictureOnly}) => <>
	<svg width={W} height={H} style={{position: 'absolute', willChange: 'transform'}}><Picture t={t} /><Vignette /></svg>
	<div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Photos t={t} /></div>
	{!pictureOnly && <div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Furniture t={t} /></div>}
</>;
type Props = {music?: string; pictureOnly?: boolean};
export const EP59: React.FC<Props> = ({music, pictureOnly = false}) => {
	const f = useCurrentFrame(), t = f / FPS;
	return <AbsoluteFill style={{background: '#0a0c12', overflow: 'hidden'}}>
		<Part1 t={t} pictureOnly={pictureOnly} />
		{music && <Audio src={staticFile(music)} />}
	</AbsoluteFill>;
};
/** the whole film: part 1 to the bar-50 drop, then part 2 (src/qq59sb, Part2 with t since bar 50) */
export const EP59Full: React.FC<Props> = ({music, pictureOnly = false}) => {
	const f = useCurrentFrame(), t = f / FPS;
	return <AbsoluteFill style={{background: '#08090b', overflow: 'hidden'}}>
		{t < PART2_AT ? <Part1 t={t} pictureOnly={pictureOnly} /> : <Part2 t={t - PART2_AT} />}
		{music && <Audio src={staticFile(music)} />}
	</AbsoluteFill>;
};
/* inputProps: {music: 'ep59/song.wav'} plays a track dropped into public/ (never commit it); {pictureOnly: true} for picture checks */
registerRoot(() => <>
	<Composition id="EP59FULL" component={EP59Full} durationInFrames={FULL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
	<Composition id="EP59P1" component={EP59} durationInFrames={P1_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
	<Composition id="EP59DEMO" component={EP59} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
</>);
void BT;
