/* ep60 master 《死后称心脏》 · 4:3 1440 × 1080 · 30 fps · 160.6 s (script: episodes/60-xinzang/script.md, timeline: story60.ts).
   Each shot is a component from one of the act files (act60a: 1–14, act60b: 15–33, act60c: 34–55), drawn on its own clock:
   <C t dur n /> with t = seconds since the shot's start (negative while it transitions in; > dur while the next one transitions in over it).
   The master draws the frame ONCE over every shot: bands, the subtitle line (story60), the stamp (shots 5, 51, 53), the J seal and the
   end card. A Stage60 inside the master (InMaster60) therefore draws only its picture and its name tags.

   Transitions (ShotDef.tin): 'cut' (default) = hard cut; 'dissolve' = the master cross-fades over `ov` s before the start;
   'own' = from `ov` s before its start the incoming shot is drawn OVER the outgoing one and covers it itself (a match move, a flood of light…).
   Compositions: EP60PIC (picture + frame, no audio; the mix is muxed afterwards). Input prop {fast: true} = draft quality. */
import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {FW, FH, PIC_T, PIC_B, SUB_B, SAFE_R, PIC_CY, FC, F_SERIF, Bands, Subtitle, Stamp43, Seal43, InMaster60} from './frame60';
import {SHOTS, FILM_END, FPS, Shot} from './story60';
import {cl, sm} from './geo60';
import {ACT60A} from './act60a';
import {ACT60B} from './act60b';
import {ACT60C} from './act60c';

export type ShotProps = {t: number; dur: number; n: number};
export type ShotDef = {C: React.FC<ShotProps>; tin?: 'cut' | 'dissolve' | 'own'; ov?: number};
const REG: Record<number, ShotDef> = {...ACT60A, ...ACT60B, ...ACT60C};

/** a shot not built yet: its number, line and brief (so the whole film can be read as an animatic) */
const Missing: React.FC<ShotProps> = ({t, n}) => { const s = SHOTS.find((x) => x.n === n)!;
	return <AbsoluteFill style={{background: '#141a33'}}>
		<div style={{position: 'absolute', left: 90, top: PIC_T + 60, width: SAFE_R - 180, color: '#b9c2e0', fontFamily: F_SERIF, fontSize: 30, lineHeight: 1.45}}>
			<div style={{fontSize: 64, fontWeight: 900, color: FC.gold}}>{n} · {t.toFixed(1)} s</div>
			<div style={{marginTop: 18}}>{s.pic}</div>
			<div style={{marginTop: 18, fontSize: 24, opacity: 0.7}}>♪ {s.cue} · {s.sfx}</div></div></AbsoluteFill>; };

const END_N = 55, TITLE = '死后称心脏';
const SOURCES = '资料：大英博物馆（阿尼纸草 EA10470、胡内弗纸草 EA9901）· 大都会艺术博物馆 · 沃尔特斯美术馆 · 利物浦博物馆 · 伦敦大学学院 · Lichtheim《古埃及文学》';

/** the end card over shot 55: picture dims to ~30 %, the J seal is pressed in, the title, the follow pill and the sources; fade to black */
const EndCard: React.FC<{t: number; dur: number}> = ({t, dur}) => {
	const dim = sm((t - 0.3) / 0.9), seal = sm((t - 0.7) / 0.35), title = sm((t - 1.0) / 0.5), pill = sm((t - 1.6) / 0.5), src = sm((t - 2.0) / 0.6);
	const press = 1 + 0.5 * (1 - seal);
	return <>
		<div style={{position: 'absolute', left: 0, top: PIC_T, width: FW, height: PIC_B - PIC_T, background: '#05081a', opacity: 0.7 * dim}} />
		<Img src={staticFile('ep44/jseal.png')} style={{position: 'absolute', left: FW / 2 - 70, top: PIC_T + 120, width: 140, height: 140, opacity: 0.92 * seal, transform: `scale(${press}) rotate(-6deg)`}} />
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 300, textAlign: 'center', opacity: title, fontFamily: F_SERIF, fontWeight: 900, fontSize: 104, letterSpacing: '0.12em', color: FC.gold,
			textShadow: '0 4px 0 rgba(8,10,28,0.7), 0 0 26px rgba(216,168,69,0.35)', transform: `translateY(${(1 - title) * 14}px)`}}>《{TITLE}》</div>
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 480, display: 'flex', justifyContent: 'center', opacity: pill}}>
			<div style={{fontFamily: F_SERIF, fontWeight: 900, fontSize: 40, color: FC.cream, border: `2px solid ${FC.gold}`, borderRadius: 40, padding: '10px 38px', letterSpacing: '0.08em', background: 'rgba(18,26,61,0.55)'}}>关注 Juno · 一起看懂世界</div></div>
		<div style={{position: 'absolute', left: 150, width: FW - 300, top: PIC_B - 190, textAlign: 'center', opacity: 0.85 * src, fontFamily: F_SERIF, fontWeight: 700, fontSize: 25, lineHeight: 1.6, color: FC.cream}}>{SOURCES}</div>
		<AbsoluteFill style={{background: '#000', opacity: cl((t - (dur - 0.75)) / 0.7)}} />
	</>;
};

const Film: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	let i = SHOTS.findIndex((s) => t >= s.a && t < s.b); if (i < 0) i = SHOTS.length - 1;
	const s = SHOTS[i], next: Shot | undefined = SHOTS[i + 1];
	const draw = (p: Shot, tt: number) => { const D = REG[p.n]; const C = D ? D.C : Missing; return <C t={tt} dur={p.b - p.a} n={p.n} />; };
	const nd = next ? REG[next.n] : undefined, ov = nd?.ov ?? 0.4;
	const incoming = !!(next && nd && nd.tin && nd.tin !== 'cut' && t >= next.a - ov);
	const ts = t - s.a, dur = s.b - s.a;
	const stampO = s.stamp ? sm((ts - 0.5) / 0.3) * cl((dur - 0.1 - ts) / 0.15) : 0;
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: '#08090b', overflow: 'hidden'}}>
		<AbsoluteFill>{draw(s, ts)}</AbsoluteFill>
		{incoming && <AbsoluteFill style={{opacity: nd!.tin === 'dissolve' ? sm((t - (next!.a - ov)) / ov) : 1}}>{draw(next!, t - next!.a)}</AbsoluteFill>}
		{/* the frame, once */}
		<AbsoluteFill style={{zIndex: 10}}>
			{s.stamp && stampO > 0 && <Stamp43 stamp={s.stamp} o={stampO} />}
			{s.n !== END_N && <Seal43 />}
			{s.n === END_N && <EndCard t={ts} dur={dur} />}
			<Bands t={t} />
			{s.sub && <Subtitle t={t} sub={{text: s.sub, t0: s.a, t1: s.b}} />}
			{s.n === END_N && <AbsoluteFill style={{background: '#000', opacity: cl((ts - (dur - 0.75)) / 0.7)}} />}
		</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};

/** a single shot on its own (for builders): SHOT60 with input prop {n, from} renders shot n from `from` s before its start */
const One: React.FC<{n?: number; from?: number}> = ({n = 1, from = 0}) => {
	const f = useCurrentFrame(), s = SHOTS.find((x) => x.n === n)!, t = f / FPS - from, D = REG[n], C = D ? D.C : Missing;
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: '#08090b'}}><C t={t} dur={s.b - s.a} n={n} />
		<AbsoluteFill style={{zIndex: 10}}><Seal43 /><Bands t={t} />{s.sub && <Subtitle t={t} sub={{text: s.sub}} />}
			{s.stamp && <Stamp43 stamp={s.stamp} />}</AbsoluteFill></AbsoluteFill></InMaster60.Provider>;
};
const _keep = {PIC_CY, SUB_B, FH};

const END = Math.round(FILM_END * FPS);
registerRoot(() => <>
	<Composition id="EP60PIC" component={Film} durationInFrames={END} fps={FPS} width={FW} height={FH} />
	<Composition id="SHOT60" component={One as React.FC} durationInFrames={150} fps={FPS} width={FW} height={FH} defaultProps={{n: 1, from: 0}} />
</>);
export {_keep};
