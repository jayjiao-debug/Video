/* ep61 v2 master 《古埃及众神，其实是一家人》 (2026-11-06 night pass after the owner's notes: "PPT vibes", "plain", "will the viewer
   understand?", "more mystical Egyptian theme", "the sky-lifting doesn't make sense", "beware the tree clipping").
   Timeline: story61v2.ts (script_v2.md, 48 lines, 185.8 s + 6 s end card). Picture blocks = consecutive lines with the same scene id:
   the 22 animated scenes of shots61.tsx (shot clock via ShotCtx), the rebuilt Geb/Nut/Shu block N1 (n1_61), and three new scenes (extra61).
   Inside a block the camera CUTS between set-ups (wide / medium / close) on the lines; blocks meet with a 0.3 s glow dissolve.
   Over every shot: the mystical grade (mystic61.Grade), the family-tree chip, bands, subtitles; title in block S1; end card after line 48.
   Compositions: EP61V2 (whole film, picture only) · BLK61 ({b}: one block, for checks). */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, F_SERIF, PIC_T, PIC_B, FW, FH, InMaster60} from '../qq60/frame60';
import {JCartouche, TitleCartouche, FollowPlaque} from '../qq60/egypt60';
import {SHOTS} from './shots61';
import {TreeChip} from './tree61';
import {ShotCtx} from './film61ctx';
import {LINES61V2, END61V2, LAST61V2} from './story61v2';
import {N1Block} from './n1_61';
import {CurseBounce, SetMeasures, GateWalk, BoxScene} from './extra61';
import {MysticDefs, Grade, cl, sm, lerp} from './mystic61';
import {SetDefs61} from './sets61_kit';

const FPS = 30, W = FW, CY = (PIC_T + PIC_B) / 2, HH = (PIC_B - PIC_T) / 2;
const GODS = ['阿努比斯', '奥西里斯', '荷鲁斯', '托特', '玛阿特', '伊西斯', '亚图姆', '泰芙努特', '盖布', '努特', '赛特', '奈芙蒂斯', '塞赫麦特', '巴斯特', '舒', '拉'];
const TITLE = '古埃及众神，其实是一家人';
const SOURCES = '资料：大都会艺术博物馆 · 大英博物馆（格林菲尔德纸草）· 卢浮宫 · 伦敦大学学院 · 普鲁塔克《论伊西斯与奥西里斯》· 金字塔铭文 · 《荷鲁斯与赛特之争》';

type Block = {id: string; a: number; b: number; lines: typeof LINES61V2};
const BLOCKS: Block[] = (() => { const out: Block[] = [];
	for (const l of LINES61V2) { const last = out[out.length - 1]; if (last && last.id === l.scene) last.lines.push(l); else out.push({id: l.scene, a: l.t0, b: 0, lines: [l]}); }
	out.forEach((bk, i) => { bk.b = i + 1 < out.length ? out[i + 1].a : END61V2; }); return out; })();
/** shots61 scene number per block id (also the tree chip's state) */
const SCENE_N: Record<string, number> = {S1: 1, S2: 2, S3: 3, S4: 4, S7: 7, S8: 8, S9: 9, S9b: 9, S10: 10, S11: 11, S12: 12, S13a: 13, S13: 13, S14: 14, S15: 15, S16: 16, S17: 17, S18: 18, S19: 19, S20: 20, S21: 21, S22: 22};
/** grade strength: daylit plaster scenes get a deep indigo dusk, night scenes a light touch */
const GRADE: Record<string, number> = {S1: 0.16, S2: 0.12, S3: 0.3, S4: 0.16, N1: 0.1, S7: 0.2, S8: 0.12, S9: 0.12, S9b: 0.12, S10: 0.16, S11: 0.16, S12: 0.16, S13a: 0.16, S13: 0.16, S14: 0.3, S15: 0.12, S16: 0.16, S17: 0.16, S18: 0.1, S19: 0.14, S20: 0.16, S21: 0.12, S22: 0.3};
/** camera set-ups: [line number, offset s, centre x, centre y, zoom from, zoom to]; a set-up runs until the next one (hard cut) */
const SETUPS: Record<string, number[][]> = {   // [line, offset, cx, cy, z0, z1, (cx1, cy1)]
	S1: [[1, 0, 720, CY, 1.0, 1.05], [2, 0, 720, CY, 1.05, 1.0]],
	S2: [[3, 0, 720, CY, 1.0, 1.05], [4, 0, 720, 520, 1.18, 1.12]],
	S3: [[5, 0, 720, CY, 1.0, 1.04], [6, 0, 560, 500, 1.35, 1.42]],
	S4: [[7, 0, 470, 520, 1.35, 1.42], [8, 0, 930, 500, 1.45, 1.5]],
	S7: [[17, 0, 720, 300, 1.45, 1.55], [18, 0, 820, 520, 1.0, 1.06, 760, 500]],
	S8: [[19, 0, 450, 620, 1.55, 1.65], [20, 0, 760, 560, 1.05, 1.1], [20, 2.2, 1060, 500, 1.8, 1.85]],
	S9: [[21, 0, 720, 500, 1.0, 1.06], [22, 0, 720, 480, 1.3, 1.42]],
	S9b: [[23, 0, 720, 420, 1.15, 1.05]],
	S10: [[24, 0, 380, 380, 1.4, 1.45, 560, 380], [25, 0, 930, 560, 1.32, 1.4]],
	S11: [[26, 0, 520, 540, 1.3, 1.38], [27, 0, 1060, 540, 1.3, 1.38]],
	S12: [[28, 0, 640, CY, 1.08, 1.08, 800, CY], [29, 0, 1040, 560, 1.3, 1.3, 940, 560]],
	S14: [[33, 0, 720, CY, 1.0, 1.05], [34, 0, 1110, 600, 1.45, 1.52]],
	S15: [[35, 1.8, 380, 540, 1.22, 1.3], [36, 0, 900, CY, 1.0, 1.12, 820, CY]],
	S16: [[37, 0, 720, CY, 1.0, 1.03], [37, 1.6, 320, 470, 1.3, 1.35], [37, 2.9, 1130, 480, 1.35, 1.4], [38, 0, 720, 420, 1.2, 1.28]],
	S17: [[39, 0, 720, CY, 1.0, 1.04], [40, 0, 960, 560, 1.28, 1.34]],
	S18: [[41, 0, 720, CY, 1.0, 1.06]],
	S19: [[42, 0, 560, 480, 1.22, 1.3], [43, 0, 760, CY, 1.02, 1.0, 680, CY]],
	S20: [[44, 0, 360, 560, 1.3, 1.36], [45, 0, 960, 540, 1.22, 1.28]],
	S21: [[46, 0, 720, CY, 1.0, 1.07]],
	S22: [[47, 0, 600, CY, 1.12, 1.0, 720, CY]],
};
const lineT0 = (n: number) => LINES61V2[n - 1].t0;
/** the active camera of a block at absolute time t */
const camAt = (bk: Block, t: number): [number, number, number] => {
	const su = SETUPS[bk.id]; if (!su) return [720, CY, 1];
	let k = 0; for (let i = 0; i < su.length; i++) if (t >= lineT0(su[i][0]) + su[i][1]) k = i;
	const s0 = lineT0(su[k][0]) + su[k][1], s1 = k + 1 < su.length ? lineT0(su[k + 1][0]) + su[k + 1][1] : bk.b, u = sm((t - s0) / Math.max(0.5, s1 - s0));
	const z = lerp(su[k][4], su[k][5], u), hx = W / 2 / z, hy = HH / z, X = su[k].length > 6 ? lerp(su[k][2], su[k][6], u) : su[k][2], Y = su[k].length > 7 ? lerp(su[k][3], su[k][7], u) : su[k][3];
	return [Math.max(hx, Math.min(W - hx, X)), Math.max(PIC_T + hy, Math.min(PIC_B - hy, Y)), z];
};

const BlockPic: React.FC<{bk: Block; t: number}> = ({bk, t}) => {
	const ts = t - bk.a, n = SCENE_N[bk.id];
	let pic: React.ReactNode;
	if (bk.id === 'N1') pic = <N1Block t={ts} />;
	else if (bk.id === 'S13a') pic = <SetMeasures t={ts} />;
	else if (bk.id === 'S13') pic = <BoxScene t={ts} />;
	else if (bk.id === 'S15' && ts < 1.8) pic = <GateWalk t={ts} />;
	else {
		const Scene = SHOTS[n - 1].scene, dur = bk.b - bk.a, l2 = bk.lines.length > 1 ? bk.lines[1].t0 - bk.a : dur;
		const [cx, cy, z] = camAt(bk, t);
		pic = <ShotCtx.Provider value={{t: bk.id === 'S9b' ? 99 : ts, dur, l2, live: bk.id !== 'S9b'}}>
			<g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-cx},${-cy})`}><Scene />{bk.id === 'S9b' && <CurseBounce t={ts} />}</g></ShotCtx.Provider>;
	}
	const chipN = bk.id === 'N1' ? (t < 46.06 ? 5 : 6) : n, showChip = bk.id !== 'S1' && bk.id !== 'S22' && (bk.id === 'N1' || SHOTS[n - 1].chip !== false);
	return <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
		<MysticDefs /><SetDefs61 />
		<defs><clipPath id={`pv2-${bk.id}`}><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
		<g clipPath={`url(#pv2-${bk.id})`}>{pic}<Grade T={t} k={GRADE[bk.id] ?? 0.25} />{showChip && <TreeChip n={chipN} />}</g>
	</svg>;
};

const Title61: React.FC<{t: number}> = ({t}) => { const o = sm((t - 4.9) / 0.5) * (1 - sm((t - 6.95) / 0.3)); if (o <= 0) return null;   // the reveal completes on the score's gong (6.0)
	return <div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 34, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)`}}>
		<TitleCartouche title={TITLE} size={60} reveal={sm((t - 4.9) / 1.1)} /></div>; };
const EndCard: React.FC<{t: number}> = ({t}) => {
	const veil = sm((t - 0.1) / 1.4), seal = sm((t - 0.35) / 0.6), title = sm((t - 0.75) / 0.7), q = sm((t - 1.2) / 0.6), pill = sm((t - 1.8) / 0.6), src = sm((t - 2.2) / 0.7);
	return <>
		<div style={{position: 'absolute', left: 0, top: PIC_T, width: FW, height: PIC_B - PIC_T, opacity: veil, background: 'radial-gradient(ellipse 62% 58% at 50% 46%, rgba(6,9,30,0.78) 0%, rgba(6,9,30,0.7) 55%, rgba(6,9,30,0.85) 100%)'}} />
		<JCartouche x={FW / 2} y={PIC_T + 180} h={180} o={seal} glow={0.6 * seal} />
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 290, display: 'flex', justifyContent: 'center', opacity: title, transform: `translateY(${(1 - title) * 12}px)`}}><TitleCartouche title={TITLE} size={66} reveal={sm((t - 0.75) / 0.9)} /></div>
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 405, textAlign: 'center', opacity: q, fontFamily: F_SERIF, fontWeight: 900, fontSize: 58, color: FC.cream, textShadow: '0 3px 6px rgba(5,8,25,0.95)'}}>这一家人，你最想先听谁的故事？</div>
		<div style={{position: 'absolute', left: 0, width: FW, top: PIC_T + 510, display: 'flex', justifyContent: 'center', opacity: pill}}><FollowPlaque text="关注 Juno · 一起看懂世界" size={38} /></div>
		<div style={{position: 'absolute', left: 140, width: FW - 280, top: PIC_B - 170, textAlign: 'center', opacity: 0.92 * src, fontFamily: F_SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.6, color: FC.cream, textShadow: '0 2px 4px rgba(5,8,25,0.9)'}}>{SOURCES}</div>
	</>;
};

/** block changes are hard cuts on the line; a few get a 0.25 s gold flash (motivated: a reveal, a curse, a resurrection, the roar) */
const FLASH = new Set(['N1', 'S7', 'S9b', 'S14', 'S19', 'S21']);
const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	let i = BLOCKS.findIndex((b) => t >= b.a && t < b.b); if (i < 0) i = BLOCKS.length - 1;
	const bk = BLOCKS[i], fl = FLASH.has(bk.id) ? Math.max(0, 1 - Math.abs(t - bk.a) / 0.16) : 0;
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy, overflow: 'hidden'}}>
		<AbsoluteFill><BlockPic bk={bk} t={t} /></AbsoluteFill>
		{fl > 0 && <div style={{position: 'absolute', left: 0, top: PIC_T, width: FW, height: PIC_B - PIC_T, background: 'radial-gradient(ellipse at 50% 45%, #FFF3D0 0%, #FFD98A 55%, rgba(255,200,120,0.6) 100%)', opacity: 0.55 * fl}} />}
		<AbsoluteFill style={{zIndex: 10}}>
			{bk.id === 'S1' && <Title61 t={t} />}
			{t >= LAST61V2 && <EndCard t={t - LAST61V2} />}
			<Bands t={t} />
			{LINES61V2.filter((l) => t >= l.t0 - 0.2 && t < l.t1 + 0.2).map((l) => <Subtitle key={l.t0} t={t} sub={{text: l.text, t0: l.t0, t1: l.t1}} gods={GODS} />)}
			<AbsoluteFill style={{background: '#000', opacity: sm((t - (END61V2 - 0.9)) / 0.9)}} />
		</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};
void cl;
registerRoot(() => <Composition id="EP61V2" component={Film} durationInFrames={Math.round(END61V2 * FPS)} fps={FPS} width={FW} height={FH} />);
