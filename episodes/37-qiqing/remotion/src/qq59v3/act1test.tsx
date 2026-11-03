/* ep59 v3 · act 1 test entry: the master's Film logic (furniture, transitions) with ACT1 only, on the DJ layout.
   npx remotion still src/qq59v3/act1test.tsx A1 out.png --frame=N   (frame numbers = the master's EP59V3DJ frames) */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {FPS, TRACKS, Track, layout, VOICE, Placed} from './story3';
import {Story, Punch, Stamp, Counter, Seal, SANS, sm, visLen} from '../qq59/skin59';
import type {SceneDef, SceneProps} from './EP59V3';
import {ACT1} from './act1';

const REG: Record<string, SceneDef> = {...ACT1};
const Missing: React.FC<SceneProps & {id: string}> = ({id, t, dur}) => <AbsoluteFill style={{background: '#14161c', color: '#8890a0', fontFamily: SANS, fontSize: 40, alignItems: 'center', justifyContent: 'center'}}>
	{id} · {t.toFixed(1)} / {dur.toFixed(1)} s</AbsoluteFill>;
const ageAt = (date: number) => Math.floor(date - 1969.2 + 1e-6);
const CHARS_PER_S = 15;
const Furniture: React.FC<{L: Placed[]; i: number; t: number}> = ({L, i, t}) => {
	const s = L[i], def = REG[s.id], ts = t - s.a, out = 1 - sm((t - (s.b - 0.12)) / 0.12);
	const nodes: React.ReactNode[] = [];
	if (!def?.noSubs) {
		const vz = s.voice ? VOICE[s.voice] : null;
		const rows = vz ? vz.zh.map((z, k) => ({s: (k === 0 ? '「' : '') + z + (k === vz.zh.length - 1 ? '」' : ''), at: 0.35 + k * 1.4})) : s.rows;
		const vis = rows.filter((r) => ts >= r.at).map((r) => ({s: r.s, n: Math.floor((ts - r.at) * CHARS_PER_S) + 1, o: out}));
		if (vis.length) nodes.push(s.punch ? <Punch key="p" s={vis[vis.length - 1].s} o={out} /> : <Story key="s" rows={vis.map((r) => ({...r, n: Math.min(r.n, 999)}))} />);
	}
	if (s.stamp && !def?.noStamp) {
		const t0 = (s.rows[0] ? s.rows[0].at + visLen(s.rows[0].s) / CHARS_PER_S : 0.4) + 0.15;
		nodes.push(<Stamp key="st" y={s.stamp[0].split(' · ')[0]} place={s.stamp[0].split(' · ')[1] ?? ''} note={s.stamp[1]} o={sm((ts - t0) / 0.3) * out} />);
	}
	if (s.date !== undefined && !def?.noCounter && s.id !== 'title' && s.id !== 'end') {
		const d = Array.isArray(s.date) ? s.date[0] + (s.date[1] - s.date[0]) * sm(ts / s.dur) : s.date;
		const roll = Array.isArray(s.date);
		nodes.push(<Counter key="c" year={roll ? d : Math.floor(d)} age={roll ? d - 1969.2 : ageAt(d)} blur={roll ? 1 : 0} />);
	}
	return <>{nodes}</>;
};
const Film: React.FC<{tr: Track; pictureOnly?: boolean}> = ({tr, pictureOnly = false}) => {
	const f = useCurrentFrame(), t = f / FPS, L = layout(tr);
	let i = L.findIndex((s) => t >= s.a && t < s.b); if (i < 0) i = L.length - 1;
	const s = L[i], next = L[i + 1];
	const draw = (p: Placed, tt: number) => { const D = REG[p.id]; return D ? <D.C t={tt} dur={p.dur} beat={tr.beat} tr={tr} /> : <Missing id={p.id} t={tt} dur={p.dur} beat={tr.beat} tr={tr} />; };
	const nd = next ? REG[next.id] : undefined, ov = nd?.ov ?? 0.35;
	const incoming = next && nd && nd.tin && nd.tin !== 'cut' && t >= next.a - ov;
	return <AbsoluteFill style={{background: '#08090b', overflow: 'hidden'}}>
		<AbsoluteFill>{draw(s, t - s.a)}</AbsoluteFill>
		{incoming && <AbsoluteFill style={{opacity: nd!.tin === 'dissolve' ? sm((t - (next!.a - ov)) / ov) : 1}}>{draw(next!, t - next!.a)}</AbsoluteFill>}
		{!pictureOnly && <AbsoluteFill><Furniture L={L} i={i} t={t} />{s.id !== 'end' && <Seal />}</AbsoluteFill>}
	</AbsoluteFill>;
};
const END = Math.ceil(56 * FPS);
registerRoot(() => <>
	<Composition id="A1" component={Film} durationInFrames={END} fps={FPS} width={1920} height={1080} defaultProps={{tr: TRACKS.dj}} />
	<Composition id="A1PIC" component={Film} durationInFrames={END} fps={FPS} width={1920} height={1080} defaultProps={{tr: TRACKS.dj, pictureOnly: true}} />
</>);
