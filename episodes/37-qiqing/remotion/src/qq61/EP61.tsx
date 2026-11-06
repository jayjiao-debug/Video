/* ep61 master 《古埃及众神，其实是一家人》 · 第2集｜古埃及神话故事 · 4:3 1440 × 1080 · 30 fps · 148.7 s.
   The 22 scenes of shots61.tsx (the storyboard key frames, animated through film61ctx) on the timeline of story61.ts.
   The frame is drawn once over every shot: bands, the subtitle (gods' names light blue), the family-tree chip; the title lives inside
   shot 1 (over the empty family tree); the seamless Egyptian end card runs over shot 22 after its last line.
   Camera per shot (CAM61): a slow push / pull / pan inside the picture window (≤ 3 px per frame, never a shake).
   Transitions: a 0.4 s dissolve into every shot (the storyboard's match-cuts read as soft dissolves in this cut).
   Compositions: EP61PIC (the whole film, picture only; the mix is muxed afterwards) and SHOT61 ({n}: one shot with 0.5 s handles). */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, F_SERIF, PIC_T, PIC_B, FW, FH, InMaster60} from '../qq60/frame60';
import {PAL} from '../qq60/geo60';
import {JCartouche, TitleCartouche, FollowPlaque} from '../qq60/egypt60';
import {SHOTS} from './shots61';
import {TreeChip} from './tree61';
import {STORY61, FILM61_END, FPS61, Shot61T} from './story61';
import {ShotCtx} from './film61ctx';

const cl = (v: number) => Math.max(0, Math.min(1, v)), sm = (v: number) => { const u = cl(v); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const GODS61 = ['阿努比斯', '奥西里斯', '荷鲁斯', '托特', '玛阿特', '伊西斯', '亚图姆', '泰芙努特', '盖布', '努特', '赛特', '奈芙蒂斯', '塞赫麦特', '巴斯特', '舒', '拉'];
const TITLE = '古埃及众神，其实是一家人';
const SOURCES = '资料：大都会艺术博物馆 · 大英博物馆（格林菲尔德纸草）· 卢浮宫 · 伦敦大学学院 · 普鲁塔克《论伊西斯与奥西里斯》· 金字塔铭文 · 《荷鲁斯与赛特之争》';

/** camera per shot: [zoom from, zoom to, x from, x to, y from, y to] (x/y = picture offset in px at the end zoom) */
const CAM61: Record<number, [number, number, number, number, number, number]> = {
	1: [1.0, 1.06, 0, 0, 0, 10], 2: [1.02, 1.04, 0, 0, 0, -6], 3: [1.0, 1.04, 0, 0, 0, 0], 4: [1.04, 1.01, 0, 0, 0, 0], 5: [1.03, 1.03, 0, 0, -20, 0],
	6: [1.06, 1.06, 0, 0, 30, -30], 7: [1.0, 1.04, 0, 0, 0, 0], 8: [1.05, 1.05, 20, -20, 0, 0], 9: [1.0, 1.05, 0, 0, 0, 0], 10: [1.05, 1.05, -20, 20, 0, 0],
	11: [1.02, 1.03, 0, 0, 0, 0], 12: [1.08, 1.08, 50, -50, 0, 0], 13: [1.0, 1.04, 0, 0, 0, 0], 14: [1.04, 1.01, 0, 0, 0, 0], 15: [1.02, 1.03, 0, 0, 0, 0],
	16: [1.02, 1.03, 0, 0, 0, 0], 17: [1.05, 1.05, 20, -20, 0, 0], 18: [1.0, 1.12, 0, 0, 0, 0], 19: [1.0, 1.06, 0, 0, 0, 0], 20: [1.05, 1.05, 22, -22, 0, 0],
	21: [1.0, 1.05, 0, 0, 0, 0], 22: [1.1, 1.0, 0, 0, 0, 0],
};
const CY = (PIC_T + PIC_B) / 2;

const Scene61: React.FC<{sh: Shot61T; ts: number}> = ({sh, ts}) => {
	const def = SHOTS[sh.n - 1], Scene = def.scene, dur = sh.b - sh.a, l2 = sh.lines.length > 1 ? sh.lines[1].t0 - sh.a : dur;
	const [z0, z1, x0, x1, y0, y1] = CAM61[sh.n], u = sm(ts / dur), z = lerp(z0, z1, u), dx = lerp(x0, x1, u), dy = lerp(y0, y1, u);
	return <ShotCtx.Provider value={{t: ts, dur, l2, live: true}}>
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
			<defs><clipPath id={`pic61-${sh.n}`}><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
			<g clipPath={`url(#pic61-${sh.n})`}>
				<g transform={`translate(${FW / 2 + dx},${CY + dy}) scale(${z}) translate(${-FW / 2},${-CY})`}><Scene /></g>
				{def.chip !== false && <TreeChip n={sh.n} />}
			</g>
		</svg>
	</ShotCtx.Provider>;
};

/** the title inside shot 1, over the empty family tree */
const Title61: React.FC<{ts: number}> = ({ts}) => {
	const o = sm((ts - 3.0) / 0.6) * (1 - sm((ts - 5.55) / 0.3));
	if (o <= 0) return null;
	return <div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 34, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)`}}>
		<TitleCartouche title={TITLE} size={60} reveal={sm((ts - 3.0) / 0.9)} /></div>;
};

/** the seamless end card over shot 22 (after its last line): veil, J cartouche, title, follow plaque, sources; music plays on */
const EndCard61: React.FC<{t: number}> = ({t}) => {
	const veil = sm((t - 0.1) / 1.4), seal = sm((t - 0.35) / 0.6), title = sm((t - 0.75) / 0.7), pill = sm((t - 1.5) / 0.6), src = sm((t - 2.0) / 0.7);
	return <>
		<div style={{position: 'absolute', left: 0, top: PIC_T, width: FW, height: PIC_B - PIC_T, opacity: veil,
			background: 'radial-gradient(ellipse 62% 58% at 50% 46%, rgba(6,9,30,0.55) 0%, rgba(6,9,30,0.42) 55%, rgba(6,9,30,0.66) 100%)'}} />
		<JCartouche x={FW / 2} y={PIC_T + 180} h={180} o={seal} glow={0.6 * seal} />
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 290, display: 'flex', justifyContent: 'center', opacity: title, transform: `translateY(${(1 - title) * 12}px)`}}>
			<TitleCartouche title={TITLE} size={66} reveal={sm((t - 0.75) / 0.9)} /></div>
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 470, display: 'flex', justifyContent: 'center', opacity: pill}}>
			<FollowPlaque text="关注 Juno · 一起看懂世界" size={38} /></div>
		<div style={{position: 'absolute', left: 140, width: FW - 280, top: PIC_B - 170, textAlign: 'center', opacity: 0.92 * src, fontFamily: F_SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.6, color: FC.cream,
			textShadow: '0 2px 4px rgba(5,8,25,0.9)'}}>{SOURCES}</div>
	</>;
};

const OV = 0.4;
const Film61: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS61;
	let i = STORY61.findIndex((s) => t >= s.a && t < s.b); if (i < 0) i = STORY61.length - 1;
	const s = STORY61[i], next = STORY61[i + 1], ts = t - s.a, dur = s.b - s.a;
	const incoming = next && t >= next.a - OV;
	const lastLine = s.lines[s.lines.length - 1];
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy, overflow: 'hidden'}}>
		<AbsoluteFill><Scene61 sh={s} ts={ts} /></AbsoluteFill>
		{incoming && <AbsoluteFill style={{opacity: sm((t - (next.a - OV)) / OV)}}><Scene61 sh={next} ts={t - next.a} /></AbsoluteFill>}
		<AbsoluteFill style={{zIndex: 10}}>
			{s.n === 1 && <Title61 ts={ts} />}
			{s.n === 22 && t >= lastLine.t1 && <EndCard61 t={t - lastLine.t1} />}
			<Bands t={t} />
			{STORY61.flatMap((x) => x.lines).filter((l) => t >= l.t0 - 0.2 && t < l.t1 + 0.2).map((l) => <Subtitle key={l.t0} t={t} sub={{text: l.text, t0: l.t0, t1: l.t1}} gods={GODS61} />)}
			{s.n === 22 && <AbsoluteFill style={{background: '#000', opacity: sm((ts - (dur - 0.9)) / 0.9)}} />}
		</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};

/** one shot with 0.5 s handles (for checks): input prop {n} */
const One61: React.FC<{n?: number}> = ({n = 1}) => {
	const f = useCurrentFrame(), sh = STORY61[n - 1], ts = f / FPS61 - 0.5;
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy}}><Scene61 sh={sh} ts={ts} />
		<AbsoluteFill style={{zIndex: 10}}><Bands t={ts} />{sh.lines.filter((l) => ts + sh.a >= l.t0 && ts + sh.a < l.t1).map((l) => <Subtitle key={l.t0} t={ts + sh.a} sub={{text: l.text, t0: l.t0, t1: l.t1}} gods={GODS61} />)}</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};
void PAL;
registerRoot(() => <>
	<Composition id="EP61PIC" component={Film61} durationInFrames={Math.round(FILM61_END * FPS61)} fps={FPS61} width={FW} height={FH} />
	<Composition id="SHOT61" component={One61 as React.FC} durationInFrames={300} fps={FPS61} width={FW} height={FH} defaultProps={{n: 1}} />
</>);
