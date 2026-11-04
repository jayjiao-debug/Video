/* ep59 v3 master 《他走路回家，走了28年》 — the rebuild after the owner's 21:27 notes (script: episodes/59-bushby/script_v3.md).
   The story (story3.ts) is laid out on a music track; each scene is a component from one of the act files (act1–act4), drawn from
   its own clock: <C t dur beat tr /> with t = seconds since the scene's start (negative while it transitions in), dur = its real length
   on this track. Furniture (subtitles, stamp, counter, seal), the voice clips and the music are drawn here, so scenes draw only picture
   (and their own photo prints, in-frame tallies and transitions).

   Transitions (SceneDef.tin): 'cut' = hard cut on the downbeat; 'dissolve' = the master cross-fades over `ov` s before the start;
   'own' = from `ov` s before its start the incoming scene is drawn OVER the outgoing one (which keeps running past its dur) and is
   itself responsible for covering it (a wipe, a match move, a flood of light …).

   Compositions: EP59V3DJ (the DJ track) and EP59V3OG (the original track, once its grid is in story3.ts); EP59V3PIC = picture-only
   on the DJ layout. Photos (public/ep59/photos) and the voice clips (public/ep59/voice) are git-ignored: render locally, never on
   the farm. */
import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, Sequence, registerRoot, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {FPS, TRACKS, Track, layout, filmEnd, VOICE, Placed} from './story3';
import {Story, Punch, Stamp, Counter, Seal, INK, GOLD, SANS, KAI, sm, cl, useFonts59, visLen} from '../qq59/skin59';
import {ACT1} from './act1';
import {ACT2} from './act2';
import {ACT3} from './act3';
import {ACT4} from './act4';

export type SceneProps = {t: number; dur: number; beat: number; tr: Track};
export type SceneDef = {C: React.FC<SceneProps>; tin?: 'cut' | 'dissolve' | 'own'; ov?: number; noCounter?: boolean; noStamp?: boolean; noSubs?: boolean};
const REG: Record<string, SceneDef> = {...ACT1, ...ACT2, ...ACT3, ...ACT4};

/** voice clips the owner has supplied (public/ep59/voice/<id>.wav), with their length in seconds; empty until they arrive */
export const VOICE_READY: Record<string, number> = {};

const Missing: React.FC<SceneProps & {id: string}> = ({id, t, dur}) => <AbsoluteFill style={{background: '#14161c', color: '#8890a0', fontFamily: SANS, fontSize: 40, alignItems: 'center', justifyContent: 'center'}}>
	{id} · {t.toFixed(1)} / {dur.toFixed(1)} s (not built yet)</AbsoluteFill>;

const ageAt = (date: number) => Math.floor(date - 1969.2 + 1e-6);
const CHARS_PER_S = 15;

const Furniture: React.FC<{L: Placed[]; i: number; t: number}> = ({L, i, t}) => {
	const s = L[i], def = REG[s.id], ts = t - s.a, out = 1 - sm((t - (s.b - 0.12)) / 0.12);
	const nodes: React.ReactNode[] = [];
	// subtitles: rows type in, stay to the scene's end; a voice scene shows its clip's Chinese subtitle instead
	if (!def?.noSubs) {
		const vz = s.voice ? VOICE[s.voice] : null;
		const rows = vz ? vz.zh.map((z, k) => ({s: (k === 0 ? '「' : '') + z + (k === vz.zh.length - 1 ? '」' : ''), at: 0.35 + k * 1.4})) : s.rows;
		const vis = rows.filter((r) => ts >= r.at).map((r) => ({s: r.s, n: Math.floor((ts - r.at) * CHARS_PER_S) + 1, o: out}));
		if (vis.length) nodes.push(s.punch ? <Punch key="p" s={vis[vis.length - 1].s} o={out} /> : <Story key="s" rows={vis.map((r) => ({...r, n: Math.min(r.n, 999)}))} pool={0.56} />);
		if (vz) nodes.push(<VoiceTag key="v" t={ts} o={out} en={vz.en} heard={!!VOICE_READY[s.voice!]} />);
	}
	// stamp: after the first row has typed
	if (s.stamp && !def?.noStamp) {
		const t0 = (s.rows[0] ? s.rows[0].at + visLen(s.rows[0].s) / CHARS_PER_S : 0.4) + 0.15;
		nodes.push(<Stamp key="st" y={s.stamp[0].split(' · ')[0]} place={s.stamp[0].split(' · ')[1] ?? ''} note={s.stamp[1]} o={sm((ts - t0) / 0.3) * out} />);
	}
	// counter
	if (s.date !== undefined && !def?.noCounter && s.id !== 'title' && s.id !== 'end') {
		const d = Array.isArray(s.date) ? s.date[0] + (s.date[1] - s.date[0]) * sm(ts / s.dur) : s.date;
		const roll = Array.isArray(s.date);
		nodes.push(<Counter key="c" year={roll ? d : Math.floor(d)} age={roll ? d - 1969.2 : ageAt(d)} blur={roll ? 1 : 0} />);
	}
	return <>{nodes}</>;
};
/** a small speaker tag under a voice subtitle: 「— 卡尔·布什比」 (+「原声」 only when his recorded voice actually plays) and the English words */
const VoiceTag: React.FC<{t: number; o: number; en: string; heard: boolean}> = ({t, o, en, heard}) => {
	useFonts59('卡尔·布什比原声');
	const u = sm((t - 0.2) / 0.3) * o;
	return <div style={{position: 'absolute', left: 150, top: 132 + 65 * 1.5 * 2 + 18, opacity: u, color: INK, whiteSpace: 'nowrap', textShadow: '0 0 3px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.85)'}}>
		<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, color: GOLD, letterSpacing: '0.06em'}}>— 卡尔·布什比{heard ? ' 原声' : ''}</span>
		<div style={{fontFamily: "'Cormorant59i', serif", fontStyle: 'italic', fontSize: 30, opacity: 0.95, marginTop: 6}}>“{en}”</div></div>;
};

const Film: React.FC<{tr: Track; music?: boolean; pictureOnly?: boolean}> = ({tr, music = true, pictureOnly = false}) => {
	const f = useCurrentFrame(), t = f / FPS, L = layout(tr), END = filmEnd(tr);
	let i = L.findIndex((s) => t >= s.a && t < s.b); if (i < 0) i = L.length - 1;
	const s = L[i], next = L[i + 1], def = REG[s.id];
	const draw = (p: Placed, tt: number) => { const D = REG[p.id]; return D ? <D.C t={tt} dur={p.dur} beat={tr.beat} tr={tr} /> : <Missing id={p.id} t={tt} dur={p.dur} beat={tr.beat} tr={tr} />; };
	// an incoming scene that transitions in before its start
	const nd = next ? REG[next.id] : undefined, ov = nd?.ov ?? 0.35;
	const incoming = next && nd && nd.tin && nd.tin !== 'cut' && t >= next.a - ov;
	// music level: −6 dB under a voice clip
	const duck = (fr: number) => { const tt = fr / FPS; let k = 0;
		L.forEach((p) => { const len = p.voice ? VOICE_READY[p.voice] : undefined; if (len) { const a = p.a + 0.3, b = a + len; k = Math.max(k, cl(Math.min((tt - a + 0.4) / 0.4, (b + 0.5 - tt) / 0.5))); } });
		const fade = tr.endFade ? cl((END - tt) / tr.endFade) : 1;
		return Math.pow(10, (tr.gain - 6 * k) / 20) * fade; };
	return <AbsoluteFill style={{background: '#08090b', overflow: 'hidden'}}>
		<AbsoluteFill>{draw(s, t - s.a)}</AbsoluteFill>
		{incoming && <AbsoluteFill style={{opacity: nd!.tin === 'dissolve' ? sm((t - (next!.a - ov)) / ov) : 1}}>{draw(next!, t - next!.a)}</AbsoluteFill>}
		{!pictureOnly && <AbsoluteFill><Furniture L={L} i={i} t={t} />{s.id !== 'end' && <Seal />}</AbsoluteFill>}
		{music && <Audio src={staticFile(tr.file)} volume={duck} />}
		{music && L.filter((p) => p.voice && VOICE_READY[p.voice]).map((p) => <Sequence key={p.id} from={Math.round((p.a + 0.3) * FPS)}><Audio src={staticFile(`ep59/voice/${p.voice}.wav`)} /></Sequence>)}
	</AbsoluteFill>;
};

const DJ_END = Math.ceil(filmEnd(TRACKS.dj) * FPS);
registerRoot(() => <>
	<Composition id="EP59V3DJ" component={Film} durationInFrames={DJ_END} fps={FPS} width={1920} height={1080} defaultProps={{tr: TRACKS.dj, music: true}} />
	<Composition id="EP59V3PIC" component={Film} durationInFrames={DJ_END} fps={FPS} width={1920} height={1080} defaultProps={{tr: TRACKS.dj, music: false}} />
	<Composition id="EP59V3OG" component={Film} durationInFrames={Math.max(30, Math.ceil(filmEnd(TRACKS.orig) * FPS))} fps={FPS} width={1920} height={1080} defaultProps={{tr: TRACKS.orig, music: true}} />
</>);
