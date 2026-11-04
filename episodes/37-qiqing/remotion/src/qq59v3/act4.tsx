/* ep59 v3 act 4 — the homecoming (story3: humber · street · window · son · door2 · hug · world · totals · end), ~126–164 s on the DJ track.
   Scenes draw picture only (the master draws subtitles, stamp, counter, seal and plays the voice), except `end`, which draws its own
   closing question (noSubs) so the final fade to black takes everything with it.
   The street scenes (street · door2 · hug · world) share one set: act 1's Hull street, copied into act4_dawn.tsx and rebuilt on a true
   3D camera in metres (act4_sets W4), so the door that opens on the second drop is the same door, in the same framing, as the opening
   `door` shot (DOOR_END) — the film comes back to where it started, now complete. */
import React from 'react';
import {layout} from './story3';
import {AbsoluteFill, Img} from 'remotion';
import type {SceneDef, SceneProps} from './EP59V3';
import {Bridge4, WindowSet, BW4, W4, approach, lerpW, floatW, wp4} from './act4_sets';
import {Dawn4, DW4, DOOR_END, DOOR, FX, KX, DF, MD} from './act4_dawn';
import {KARL_CYCLE, MUM_CYCLE} from './karl3';
import {Print3, PH3} from './photo3';
import {Stage, Layer, Glow, SkyGrad, INF, sm, cl, lerp, eio, rnd, useUid, W, H, f1} from './kit3';
import {Earth, Space, HULL, PUNTA, routeAt, satPt, SatView} from '../qq59/globe59';
import {SEAL_SRC, TITLE_L1, INK, GOLD, SANS, KAI, useFonts59, Marked} from '../qq59/skin59';
import {SOURCES} from './story3';

const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const svg = (kids: React.ReactNode) => <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>{kids}</svg>;

/* ============================================ humber ============================================
   1 Nov 2026, the last bridge. It starts on the near-silence: the fog rolls over the white cliffs and swallows everything; out of it,
   Karl pushes the cart toward us down the closed road (approach(): his world path keeps the side-view gait's planted foot still);
   people line the railings, phones up. As the music rebuilds, the fog draws aside — towers, far crowd — and the camera eases in. */
const HUMBER_OV = 0.6;
const humberCam = (t: number, T: number) => { const u = cl(t / T), e = 0.35 * u + 0.65 * eio(u); return floatW(lerpW({camX: 3.5, dz: 0.5, camH: 1.75, vpx: 1560}, {camX: 3.0, dz: -1.4, camH: 1.6, vpx: 1560}, e, BW4), t, 0.8, 11); };
const HUMBER_PACE = 0.85;
const FogCover: React.FC<{o: number; t: number; c?: string}> = ({o, t, c = '#b7bcc0'}) => { const id = useUid('fc');
	return svg(<g opacity={o}><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.6" stopColor={c} stopOpacity="0.55" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
		<rect x={0} y={0} width={W} height={H} fill={c} opacity={0.82} />
		{Array.from({length: 12}, (_, i) => <ellipse key={i} cx={(rnd(i, 1) * 1.4 - 0.2) * W + Math.sin(t * 0.5 + i) * 30} cy={rnd(i, 2) * H} rx={420 + rnd(i, 3) * 500} ry={150 + rnd(i, 4) * 160} fill={`url(#${id})`} />)}</g>); };
const Humber: React.FC<SceneProps> = ({t, dur, beat}) => {
	if (t < 0) {   // the fog rolls in over the outgoing shot (sheets from both sides, then a whole veil)
		const u = sm((t + HUMBER_OV) / HUMBER_OV), id = 'hfin';
		return svg(<g><defs><radialGradient id={id}><stop offset="0" stopColor="#b7bcc0" stopOpacity="1" /><stop offset="0.6" stopColor="#b7bcc0" stopOpacity="0.6" /><stop offset="1" stopColor="#b7bcc0" stopOpacity="0" /></radialGradient></defs>
			{Array.from({length: 16}, (_, i) => { const side = i % 2 ? 1 : -1, x = 960 + side * lerp(1500 + rnd(i, 1) * 500, rnd(i, 2) * 500, eo(u * 1.1 - rnd(i, 3) * 0.1)), y = rnd(i, 4) * H;
				return <ellipse key={i} cx={x} cy={y} rx={600 + rnd(i, 5) * 500} ry={200 + rnd(i, 6) * 200} fill={`url(#${id})`} opacity={0.9} />; })}
			<rect x={0} y={0} width={W} height={H} fill="#b7bcc0" opacity={sm((u - 0.35) / 0.65)} /></g>);
	}
	const T = dur, rebuild = 4 * beat;   // the downbeat after the near-silence (bar 75)
	const fog = 1 - 0.82 * sm((t - rebuild * 0.85) / (T - rebuild * 0.85 - 0.3)), part = sm((t - rebuild * 0.8) / (T - rebuild * 0.8));
	const k = approach(t, 10, 4.6, T, 0.2, (tt) => humberCam(tt, T), KARL_CYCLE.pushCart.stride * HUMBER_PACE, KARL_CYCLE.pushCart.sec, -1);
	const reveal = 1 - sm(t / 0.75);   // the white veil thins off the first frames
	return <AbsoluteFill>
		<Bridge4 t={t + 20} w={humberCam(t, T)} fog={fog} part={part} karl={{X: k.X, D: k.D, phase: t / KARL_CYCLE.pushCart.sec * HUMBER_PACE + 0.3, facing: -1}} />
		{reveal > 0.001 && <FogCover o={reveal} t={t} />}
	</AbsoluteFill>;
};

/* ============================================ street ============================================
   2 Nov, Hull, the last metres — the same street the film opened on (act 1's, mum's house on the right): every window lit, the banner
   WELCOME HOME SON over her door and bay, the press pack in the road firing on the beats, neighbours on the far pavement. He crosses
   from the road to her pavement, pushing the cart; the camera trucks with him and eases in. */
const STREET_PACE = 0.95;
const streetW = (t: number, T: number) => floatW(lerpW({vpx: 600, hz: 680, camH: 1.6, camX: -1.25, dz: 2.7}, {vpx: 600, hz: 672, camH: 1.6, camX: -0.55, dz: 2.15}, eio(cl(t / T)), DW4), t, 0.8, 5);
const Street: React.FC<SceneProps> = ({t, dur, beat}) => {
	const c = KARL_CYCLE.pushCart, ph = t / c.sec * STREET_PACE + 0.15, X = -2.75 + (t / c.sec) * STREET_PACE * c.stride * 1.8;
	const flashes = [0.02, 1, 2, 2.5, 3, 4, 5, 6, 6.5, 7].map((b, i) => b * beat + (i % 3) * 0.02);
	return <Dawn4 t={t + 40} w={streetW(t, dur)} open={0} nearL={3} cast={{karl: {X, D: 4.75, action: 'pushCart', phase: ph, facing: 1}}} flashes={flashes} />;
};

/* ============================================ window ============================================
   Her side of it: behind the net curtain of the bay, she waits; the room is warm, the clock ticks on the beat (ten years). A flash outside. */
const Window: React.FC<SceneProps> = ({t, dur, beat}) => {
	const n = Math.floor(Math.max(0, t) / beat), f = (Math.max(0, t) - n * beat) / beat, tick = 17 + n + (f < 0.12 ? -0.1 * Math.sin(f / 0.12 * Math.PI) : 0) - (f < 0.06 ? 1 - f / 0.06 : 0);
	const fl = (b: number) => { const u = t - b * beat; return u >= 0 && u < 0.14 ? 1 - u / 0.14 : 0; };
	return <WindowSet t={t + 60} z={0.3 * eio(cl(t / dur)) + 0.04 * Math.sin(t * 0.3)} tick={tick} flash={Math.max(fl(3), fl(5.5) * 0.6)} />;
};

/* ============================================ son ============================================
   A dark warm field, slow bokeh; two small prints tossed in on the beats: 1998, setting out — 2026, home. A gentle push. */
const Bokeh: React.FC<{n: number; seed: number; t: number; r: [number, number]; o: number; cols: string[]}> = ({n, seed, t, r, o, cols}) => { const id = useUid('bk');
	return <g><defs>{cols.map((c, j) => <radialGradient key={j} id={`${id}${j}`}><stop offset="0" stopColor={c} stopOpacity="0.55" /><stop offset="0.78" stopColor={c} stopOpacity="0.7" /><stop offset="0.92" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>)}</defs>
		{Array.from({length: n}, (_, i) => { const x = (rnd(i, seed) * 1.2 - 0.1) * W + Math.sin(t * 0.25 + i) * 20 + t * 8 * (rnd(i, seed + 5) - 0.5), y = rnd(i, seed + 1) * H + Math.cos(t * 0.2 + i * 1.7) * 14 - t * 6, rr = lerp(r[0], r[1], rnd(i, seed + 2));
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(rr)} fill={`url(#${id}${i % cols.length})`} opacity={o * (0.35 + 0.65 * rnd(i, seed + 3)) * (0.75 + 0.25 * Math.sin(t * 0.7 + i))} />; })}</g>; };
const Son: React.FC<SceneProps> = ({t, dur, beat}) => {
	const push = 1 + 0.045 * sm(t / dur), tt = t + 80;
	const a = beat, b = 4 * beat, hold = Math.max(1.5, dur - 0.15);
	return <AbsoluteFill>
		<Stage t={tt} cam={{x: -10 * sm(t / dur), y: 0, zoom: push, roll: 0, z: 0}} atm={{haze: '#1a0f0a', density: 0.0, focus: 4, aperture: 2.5, rim: '#ffd68a', lightDir: 60, grain: 0.07, vignette: 0.7, pp: [1220, 560]}} bg="#0c0806">
			<Layer D={INF}>
				<SkyGrad stops={[[0, '#120c09'], [0.5, '#24160d'], [1, '#0d0806']]} />
				<Glow x={1240} y={560} r={1000} ry={640} c="#6a3c1a" o={0.6} />
				<Glow x={1560} y={160} r={640} c="#ffc070" o={0.16} />
			</Layer>
			<Layer D={14}><Bokeh n={22} seed={5} t={tt} r={[40, 110]} o={0.32} cols={['#b8742e', '#e0a050', '#7a4a24']} /></Layer>
			<Layer D={7}><Bokeh n={14} seed={9} t={tt} r={[20, 60]} o={0.45} cols={['#ffcf86', '#d88a3a']} /></Layer>
			{/* a thin gold thread between the two prints: 28 years */}
			<Layer D={4}><g opacity={sm((t - b - 0.35) / 0.4) * 0.9}>
				<path d="M1150,812 Q1225,846 1300,812" stroke={GOLD} strokeWidth={2.5} strokeDasharray="7 7" fill="none" strokeDashoffset={-t * 14} />
				<circle cx={1150} cy={812} r={4.5} fill={GOLD} /><circle cx={1300} cy={812} r={4.5} fill={GOLD} /></g></Layer>
			<Layer D={2.2} blur={10}><Bokeh n={6} seed={13} t={tt} r={[90, 170]} o={0.22} cols={['#ffb860']} /></Layer>
		</Stage>
		<div style={{position: 'absolute', inset: 0, transform: `scale(${push.toFixed(4)})`, transformOrigin: '1220px 560px'}}>
			<Print3 src={PH3.young1998.src} pos={PH3.young1998.pos} aspect={PH3.young1998.aspect} t={t - a} dur={hold - a} w={380} cx={1020} cy={566} rot={-4} from="left" caption="1998 · 29岁" />
			<Print3 src={PH3.nowFace.src} pos={PH3.nowFace.pos} aspect={PH3.nowFace.aspect} t={t - b} dur={hold - b} w={380} cx={1430} cy={552} rot={3} from="right" caption="2026 · 57岁" z={1} />
		</div>
	</AbsoluteFill>;
};

/* ============================================ door2 ============================================
   THE SECOND DROP. The opening shot again (act 1's `door`, its last framing: DOOR_END), now played through: on the drop the door swings
   open and the hall light floods out over the wet street; she is there; she steps down to him; they face each other. In over `son`: the
   frame darkens on the last beat and a seam of gold light appears where the door is — then it opens. */
const DOOR_OV = 0.42;
const door2W = (t: number, T: number) => { const e = eio(cl(t / T)), b = {...DW4, ...DOOR_END};
	return floatW({...b, camX: b.camX + 0.08 * e, camH: b.camH - 0.02 * e, dz: b.dz - 0.5 * e}, Math.max(0, t), 0.6, 8); };
const doorScreen = (w: W4) => { const [a, b] = DOOR, p0 = wp4(w, FX, 0.15, (a + b) / 2), p1 = wp4(w, FX, 2.2, (a + b) / 2); return {x: p0[0], y0: p1[1], y1: p0[1]}; };
const Door2: React.FC<SceneProps> = ({t, dur, beat}) => {
	const T = dur, w = door2W(t, T), ds = doorScreen(w);
	if (t < 0) {   // over `son`: the dark comes up on the last beat, a seam of light where the door is
		const u = cl((t + DOOR_OV) / DOOR_OV), dark = sm(u * 1.4), seam = sm((u - 0.25) / 0.75);
		return svg(<g><rect x={0} y={0} width={W} height={H} fill="#07060a" opacity={0.94 * dark} />
			<Glow x={ds.x} y={(ds.y0 + ds.y1) / 2} r={60 + 160 * seam} ry={(ds.y1 - ds.y0) * (0.55 + 0.25 * seam)} c={GOLD} o={0.55 * seam} />
			<rect x={ds.x - 1.5 - 2 * seam} y={ds.y0} width={3 + 4 * seam} height={ds.y1 - ds.y0} fill="#ffe8b8" opacity={seam} /></g>);
	}
	const open = eo(t / 0.5);
	// she is in the hall; at tStep she comes out onto the step and down to him (half a slow stride cycle), then reaches for him
	const tStep = 0.5, mc = MUM_CYCLE.walk, half = mc.sec * 0.42, mph = cl((t - tStep) / mc.sec), mX = FX - 0.02 - mph * mc.stride * 1.6;
	const onStep = cl((mX - (FX - 0.36)) / 0.12);
	const mum = t < tStep ? undefined : {X: mX, D: MD, Y: 0.15 * onStep, action: (t < tStep + half ? 'walk' : 'reach') as 'walk' | 'reach', phase: t < tStep + half ? mph : 0.3 + (t - tStep - half) / 4.6, facing: -1 as const};
	const flashes = [0.03, 0.5, 1, 2, 3, 4.5, 5, 6, 7].map((b, i) => b * beat + (i % 2) * 0.02);
	const flood = 1 - sm(t / 0.7);
	return <AbsoluteFill>
		<Dawn4 t={t + 100} w={w} open={open} cast={{mum, karl: {X: KX, D: DF, action: 'stand', phase: t / 4.2 + 0.4, facing: 1}, cart: {X: 1.25, D: 5.6, facing: 1}}} flashes={flashes} press={1} crowd={1} />
		{flood > 0.001 && <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>
			<Glow x={ds.x} y={(ds.y0 + ds.y1) / 2} r={1300} ry={1000} c="#ffc860" o={0.9 * flood} /><Glow x={ds.x} y={(ds.y0 + ds.y1) / 2} r={420} ry={560} c="#fff2d0" o={flood} />
			<path d={`M${f1(ds.x)},${f1(ds.y0)} L${f1(ds.x)},${f1(ds.y1)} L${f1(ds.x - 900)},${f1(H + 40)} L${f1(ds.x - 200)},${f1(H + 40)} Z`} fill="#ffd690" opacity={0.35 * flood} />
			<rect x={0} y={0} width={W} height={H} fill="#ffcf80" opacity={0.3 * flood * flood} /></svg>}
	</AbsoluteFill>;
};

/* ============================================ hug ============================================
   Closer, on her step in the hall light: she holds him (the karl3 hug). On a beat the real photograph lands, large, centre-right. */
const hugW = (t: number, T: number) => floatW(lerpW({camX: 1.68, dz: -1.0, hz: 455, camH: 1.55}, {camX: 1.62, dz: -1.25, hz: 450, camH: 1.53}, eio(cl(t / T)), DW4), t, 0.5, 9);
const HUG = {X: 2.08, D: DF};
const Hug: React.FC<SceneProps> = ({t, dur, beat}) => {
	const t0 = 3 * beat, flashes = [0.5, 1.5, 2.5, 4.5, 5.5, 7].map((b) => b * beat);
	return <AbsoluteFill>
		<Dawn4 t={t + 120} w={hugW(t, dur)} open={1} cast={{hug: {...HUG, phase: t / KARL_CYCLE.hug.sec + 0.05, facing: 1}, cart: {X: 1.25, D: 5.6, facing: 1}}} hallMum={false} flashes={flashes} aperture={2.6} />
		<HugPrint t={t - t0} hold={60} />
	</AbsoluteFill>;
};
/** the real hug photo: lands in `hug` and holds through the cut into `world` (owner 02:27: hold it longer, to ~2:33) */
const HugPrint: React.FC<{t: number; hold: number}> = ({t, hold}) =>
	<Print3 src={PH3.hug.src} pos={PH3.hug.pos} aspect={PH3.hug.aspect} t={t} dur={hold} w={860} cx={1215} cy={548} rot={-2} from="right" caption="2026.11.2 · 赫尔" z={2} />;

/* ============================================ world ============================================
   "It took a world to get me here": from the two of them on the step the camera pulls back and cranes up over the street — the press,
   the neighbours, the bunting, every window lit — and over the roofs of Hull toward the estuary and the bridge he crossed the day before. */
const WORLD_A: Partial<W4> = {camX: 0.9, dz: -0.35, hz: 470, camH: 1.6, vpx: 330};
const WORLD_B: Partial<W4> = {camX: -0.8, dz: 14.5, hz: 195, camH: 12, vpx: 640, S: 900};
const worldW = (t: number, T: number) => { const u = cl(t / T), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
	return floatW(lerpW(WORLD_A, WORLD_B, e, DW4), t, 0.6, 13); };
const World: React.FC<SceneProps> = ({t, dur, beat, tr}) => {
	const T = dur + 0.5, w = worldW(t, T), flashes = [1, 3, 4.5, 6, 8, 9.5].map((b) => b * beat);
	const hugS = layout(tr).find((p) => p.id === 'hug')!, since = hugS.dur - 3 * beat;   // the print's age at the cut
	return <AbsoluteFill><Dawn4 t={t + 140} w={w} open={1} cast={{hug: {...HUG, phase: t / KARL_CYCLE.hug.sec + 0.95, facing: 1}, cart: {X: 1.25, D: 5.6, facing: 1}}} hallMum={false}
		flashes={flashes} crowd={1} town={1} focus={DF} aperture={1.2} density={lerp(0.045, 0.012, sm(t / T))} rain={1 - 0.7 * sm(t / T)} dawn={sm(t / T)} />
		<HugPrint t={t + since} hold={since + 8 * beat} /></AbsoluteFill>;
};

/* ============================================ totals ============================================
   Up out of the town into the night and the planet: the whole route lit gold from Punta Arenas to Hull; the globe turns west under us
   as the camera pulls away, so both ends are seen — the start (1998) and home (2026). */
const TOT_A: SatView = {lon: -0.33, lat: 53.75, alt: 0.05, tilt: 0, roll: 0, F: 1300};
const TOT_B: SatView = {lon: -74, lat: 10, alt: 3.2, tilt: 0, roll: 0, F: 1650, cx: 1190, cy: 555};
const TOT_OV = 0.5;
const totalsView = (u: number): SatView => { const e = eio(u), ea = Math.pow(cl(u), 0.55);
	return {lon: lerp(TOT_A.lon, TOT_B.lon, e), lat: lerp(TOT_A.lat, TOT_B.lat, e), alt: Math.exp(lerp(Math.log(TOT_A.alt!), Math.log(TOT_B.alt!), ea)), tilt: 0, roll: 0,
		F: lerp(TOT_A.F!, TOT_B.F!, e), cx: lerp(960, TOT_B.cx!, e), cy: lerp(540, TOT_B.cy!, e)}; };
const GlobeShot: React.FC<{v: SatView; t: number; pins: number; pulse?: number}> = ({v, t, pins, pulse}) => {
	const startP = satPt(v, PUNTA), homeP = satPt(v, HULL);
	return svg(<g>
		<Space id="a4sp" drift={t * 6} />
		<Earth id="a4e" v={v} route={{p0: 0, p1: 1, w: 4.2}} home={1} night={0.12} clouds={0.8}
			pins={[{ll: PUNTA, kind: 'start', label: '1998 · 出发', o: pins, dy: -24}, {ll: HULL, kind: 'home', label: '2026 · 到家', o: pins, dy: -26}]} />
		{pulse !== undefined && pulse > 0 && pulse < 1 && (() => { const q = satPt(v, routeAt(pulse)); return q ? <g><circle cx={q[0]} cy={q[1]} r={46} fill="#ffc24a" opacity={0.25} /><circle cx={q[0]} cy={q[1]} r={7} fill="#fff6e0" /></g> : null; })()}
		{void startP}{void homeP}
	</g>);
};
const Totals: React.FC<SceneProps> = ({t, dur}) => {
	if (t < 0) {   // the crane keeps rising into cloud over the street (drawn over `world`), then clears onto the planet
		const u = cl((t + TOT_OV) / TOT_OV), id = 'tcl';   // dawn cloud, as act 1's title crane rose through
		return svg(<g><defs><radialGradient id={`${id}a`}><stop offset="0" stopColor="#f7e6dc" stopOpacity="1" /><stop offset="0.45" stopColor="#d9c8d0" stopOpacity="0.8" /><stop offset="1" stopColor="#9a92b0" stopOpacity="0" /></radialGradient>
			<radialGradient id={`${id}b`}><stop offset="0" stopColor="#c4b8cc" stopOpacity="0.9" /><stop offset="0.5" stopColor="#8e88a8" stopOpacity="0.6" /><stop offset="1" stopColor="#6a6a90" stopOpacity="0" /></radialGradient></defs>
			{Array.from({length: 18}, (_, i) => <ellipse key={i} cx={rnd(i, 1) * (W + 400) - 200} cy={lerp(H + 500, rnd(i, 2) * H, eo(u * 1.25 - rnd(i, 3) * 0.25))} rx={500 + rnd(i, 4) * 500} ry={200 + rnd(i, 5) * 160} fill={`url(#${id}${i % 3 ? 'a' : 'b'})`} />)}
			<rect x={0} y={0} width={W} height={H} fill="#e6dade" opacity={0.92 * sm((u - 0.45) / 0.55)} /></g>);
	}
	const u = cl(t / dur), clear = 1 - sm(t / 0.6);
	return <AbsoluteFill>
		<GlobeShot v={totalsView(u)} t={t} pins={sm((t - 0.9) / 0.4)} pulse={cl((t - 0.2) / (dur - 0.2))} />
		{clear > 0.001 && svg(<rect x={0} y={0} width={W} height={H} fill="#e6dade" opacity={0.92 * clear} />)}
	</AbsoluteFill>;
};

/* ============================================ end ============================================
   The house end card over the last shot (the planet, still turning slowly) dimmed to ~30 %: the red J seal pressed in, the title in two
   lines, the closing question, the pill, the sources. Holds; fades to black on the last 0.8 s. */
const QUESTION = '你上一次回家，是什么时候？';
const SRC = SOURCES.split(' ｜ ');
const SRC1 = SRC[0], SRC2 = SRC.slice(1).join(' ｜ ');
const End: React.FC<SceneProps> = ({t, dur}) => {
	useFonts59(`${TITLE_L1}走了28年关注Juno·一起探索世界${QUESTION}${SOURCES}`);
	const v0 = totalsView(1), v: SatView = {...v0, lon: v0.lon - 2.2 * Math.max(0, t), lat: v0.lat - 0.4 * Math.max(0, t)};
	const dim = sm(t / 0.45), k1 = sm((t - 0.12) / 0.4), k2 = sm((t - 0.3) / 0.45), kq = sm((t - 0.55) / 0.5), k3 = sm((t - 0.8) / 0.45), black = sm((t - (dur - 0.85)) / 0.8);
	const press = t < 0.12 ? 0 : Math.min(1, (t - 0.12) / 0.22), sealS = 1.45 - 0.45 * eo(press) + 0.05 * Math.sin(Math.min(1, press * 1.2) * Math.PI) * (1 - press);
	const qn = Math.floor(Math.max(0, t - 0.55) * 18) + 1;
	return <AbsoluteFill style={{background: '#06070b'}}>
		<GlobeShot v={v} t={t + 10} pins={1 - sm(t / 0.4)} />
		<div style={{position: 'absolute', inset: 0, background: '#06060a', opacity: 0.7 * dim}} />
		{/* the seal, pressed in with a small ink bloom */}
		<div style={{position: 'absolute', left: 960 - 66, top: 92, width: 132, height: 132, opacity: k1}}>
			<div style={{position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(200,40,30,0.28), rgba(200,40,30,0) 100%)', opacity: press > 0 && press < 1 ? 1 - press : 0}} />
			<Img src={SEAL_SRC} style={{width: 132, height: 132, transform: `rotate(-6deg) scale(${sealS.toFixed(3)})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} /></div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: SANS, fontWeight: 900, color: INK, opacity: k2, whiteSpace: 'nowrap',
			transform: `translateY(${(14 * (1 - k2)).toFixed(1)}px)`, textShadow: '0 0 2px rgba(8,8,12,0.95), 0 2px 10px rgba(8,8,12,0.7)'}}>
			<div style={{fontSize: 54, lineHeight: 1.3, letterSpacing: '0.08em'}}>{TITLE_L1}</div>
			<div style={{fontSize: 92, lineHeight: 1.12, letterSpacing: '0.06em'}}>走了<span style={{color: GOLD}}>28年</span></div></div>
		{/* the closing question, typed in, centred */}
		<div style={{position: 'absolute', left: 0, right: 0, top: 546, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', color: INK, opacity: kq, whiteSpace: 'nowrap',
			textShadow: '0 0 2px rgba(8,8,12,0.95), 0 2px 7px rgba(8,8,12,0.72), 0 3px 22px rgba(8,8,12,0.55)'}}><Marked s={QUESTION} n={qn} pull /></div>
		<div style={{position: 'absolute', left: 960 - 240, top: 742, width: 480, height: 62, borderRadius: 31, border: `2px solid ${GOLD}`, background: 'rgba(255,194,74,0.08)', textAlign: 'center', lineHeight: '62px',
			fontFamily: KAI, fontWeight: 700, fontSize: 31, letterSpacing: '0.1em', color: GOLD, opacity: k3, boxSizing: 'border-box'}}>关注 Juno · 一起探索世界</div>
		<div style={{position: 'absolute', left: 100, right: 100, top: 872, textAlign: 'center', fontFamily: SANS, fontSize: 23, lineHeight: 1.65, color: '#D8CCB6', opacity: 0.88 * k3, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
			{SRC1}<br />{SRC2}</div>
		<div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />
	</AbsoluteFill>;
};

export const ACT4: Record<string, SceneDef> = {
	humber: {C: Humber, tin: 'own', ov: HUMBER_OV},
	street: {C: Street},
	window: {C: Window},
	son: {C: Son, tin: 'dissolve', ov: 0.42},
	door2: {C: Door2, tin: 'own', ov: DOOR_OV},
	hug: {C: Hug},
	world: {C: World},
	totals: {C: Totals, tin: 'own', ov: TOT_OV},
	end: {C: End, noSubs: true, noCounter: true},
};
