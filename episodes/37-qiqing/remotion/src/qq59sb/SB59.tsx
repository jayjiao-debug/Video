import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, FPS, D, seg, eio, sm, Subs, Stamp, Seal, TH, Counter59, Centre, Vignette} from './kit59';
import {typed} from '../qq50/kit50';
import {ROWS, Row, CENTRE} from './rows59';
import * as A from './scenesA';
import * as B from './scenesB';
import * as C from './scenesC';
import * as Dd from './scenesD';
/* ep59 storyboard bars 21–95 as one timeline (film time = music time; bar n starts at D(n)).
   SB59: the whole stretch at 30 fps (picture + furniture, hard cuts on the downbeats; transitions are planned in transitions.md).
   KF59: frame i = the storyboard key frame of row i (the same film, sampled at row.kf). */
type SC = React.FC<{u: number; d: number}>;
const SCENES: Record<string, SC> = {
	darienIn: A.DarienIn, jungle: A.Jungle, jail: A.Jail, north: A.North, alaska: A.Alaska, ice: A.Ice, rshore: A.RShore,
	arrest: B.Arrest, waiting: B.Waiting, patches: B.Patches, refused: B.Refused, shoulder: B.Shoulder, highway: B.Highway, steps: B.Steps, sign: B.Sign, seasons: B.Seasons,
	steppe: C.Steppe, mountains: C.Mountains, gate: C.Gate, stall: C.Stall, shore: C.Shore, stepin: C.StepIn, caspian: C.Caspian, nights: C.Nights, tunnel: C.Tunnel, channel: C.Channel,
	humber: Dd.Humber, farEnd: Dd.FarEnd, street: Dd.Street, banner: Dd.BannerScene, window: Dd.Window, door: Dd.DoorScene, hug: Dd.Hug, globeUp: Dd.GlobeUp, twoSelves: Dd.TwoSelves, globeHome: Dd.GlobeHome, nightWindow: Dd.NightWindow,
};
export const T0 = D(21), T1 = D(95);
const span = (r: Row) => [D(r.bar), D(r.bar + r.len)] as const;
export const rowAt = (t: number) => ROWS.findIndex((r) => t >= span(r)[0] && t < span(r)[1]);
export const kfTime = (i: number) => { const [a, b] = span(ROWS[i]); return a + (b - a) * ROWS[i].kf; };
const TYPE = 0.35;
const Furniture: React.FC<{i: number; t: number}> = ({i, t}) => {
	const r = ROWS[i], [a, b] = span(r), u = t - a;
	const rows = [...(r.stack ?? []).map((s) => ({s})), ...r.sub.map((s, k) => ({s, n: typed(s, t, a + k * Math.min(0.5, (b - a) * 0.25), TYPE)}))];
	let yr = 0, age = 0, blur = 0;
	if (r.ctr) { if (Array.isArray(r.ctr[0])) { const [[y0, y1], [a0, a1]] = r.ctr as [[number, number], [number, number]], k = eio(seg(u, 0.15, (b - a) * 0.9)); yr = y0 + (y1 - y0) * k; age = a0 + (a1 - a0) * k; blur = k > 0 && k < 1 ? 1.5 : 0; }
		else [yr, age] = r.ctr as [number, number]; }
	return <>
		{rows.length > 0 && <Subs rows={rows} th={TH} />}
		{r.centre && <Centre s={CENTRE[r.id]} n={Math.ceil(CENTRE[r.id].length * seg(t, a + 0.1, a + 0.5))} top={r.centreTop} />}
		{r.stamp && <Stamp y={r.stamp[0]} place={r.stamp[1]} note={r.stamp[2]} th={TH} o={sm(seg(u, 0, 0.12))} />}
		{r.ctr && <Counter59 yr={yr} age={age} grey={r.grey} blur={blur} o={r.centre ? 0.6 : 1} />}
		<Seal />
	</>;
};
export const Film: React.FC<{t: number}> = ({t}) => {
	const i = Math.max(0, rowAt(t)), r = ROWS[i], [a, b] = span(r), S = SCENES[r.id];
	return <AbsoluteFill style={{background: '#08090b', overflow: 'hidden'}}>
		<svg width={W} height={H} style={{position: 'absolute', willChange: 'transform'}}>{S ? <S u={t - a} d={b - a} /> : null}<Vignette o={0.45} /></svg>
		<div style={{position: 'absolute', inset: 0, willChange: 'transform'}}><Furniture i={i} t={t} /></div>
	</AbsoluteFill>;
};
const SB: React.FC = () => <Film t={T0 + useCurrentFrame() / FPS} />;
const KF: React.FC = () => <Film t={kfTime(Math.min(ROWS.length - 1, useCurrentFrame()))} />;
registerRoot(() => <>
	<Composition id="SB59" component={SB} durationInFrames={Math.round((T1 - T0) * FPS)} fps={FPS} width={W} height={H} />
	<Composition id="KF59" component={KF} durationInFrames={ROWS.length} fps={FPS} width={W} height={H} />
</>);
