import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, SANS} from '../qq50/kit50';
import {LacDefs, B} from '../qq50/styleB';
import {TakeA, titleQuad} from './take53';
import {TakeB, DIVE_T} from './tomb53';
import {TakeC} from './take53c';
import {TakeD} from './take53d';
import {T1_T} from './handoff53';
import {BUILT_T53, TitleOnGlass} from './master53';
import type {KFV} from './KF53V3';
import {KFI_H2, KFI_TITLE, KFI_R2, KFI_P1, KFI_S1} from './kfI53';
import {DepthTag} from './parts53';
import {KFJ_D3, KFJ_T3} from './kfJ53';
import {KFK_H1, KFK_T1, KFK_T2, Spot} from './kfK53';
/* ep53 v3 key frames, part H — the KEPT and CHANGED legs.
   V2Pic = the v2 film's picture at a v2 time (EP53's takes, without the v2 overlay); KF53V3 adds the v3 subtitle/stamp.
   ElementTile = the periodic-table tile (29 Cu 铜 · 50 Sn 锡 · 82 Pb 铅 · 24 Cr 铬), shown when the subtitle names the element. */
export const V2Pic: React.FC<{t: number; title?: boolean}> = ({t, title}) => <AbsoluteFill style={{background: '#0F0806', overflow: 'hidden'}}>
	<svg width={0} height={0} style={{position: 'absolute'}}><LacDefs /></svg>
	{t < DIVE_T ? <TakeA t={t} /> : t < BUILT_T53 ? <TakeB t={t} /> : t < T1_T ? <TakeC t={t} /> : <TakeD t={t} />}
	{title && <TitleOnGlass t={t} quad={titleQuad(t)} />}
</AbsoluteFill>;
const v2 = (t: number): React.FC => () => <V2Pic t={t} />;

/* ---------- element tiles ---------- */
export type El = {z: number; sym: string; zh: string; en: string; note?: string};
export const EL: Record<string, El> = {Cu: {z: 29, sym: 'Cu', zh: '铜', en: 'Copper'}, Sn: {z: 50, sym: 'Sn', zh: '锡', en: 'Tin'}, Pb: {z: 82, sym: 'Pb', zh: '铅', en: 'Lead', note: '≈ 0'}, Cr: {z: 24, sym: 'Cr', zh: '铬', en: 'Chromium', note: '？'}};
/** a tile, top-left corner at (x, y), size s px; faint = the 「几乎为零」 lead tile */
export const ElementTile: React.FC<{e: El; x: number; y: number; s?: number; o?: number; faint?: boolean}> = ({e, x, y, s = 190, o = 1, faint}) => <div style={{position: 'absolute', left: x, top: y, width: s, height: s * 1.08, opacity: o * (faint ? 0.6 : 1),
	background: 'linear-gradient(160deg, rgba(42,26,16,0.92), rgba(20,11,7,0.92))', border: `3px solid ${faint ? 'rgba(232,188,102,0.5)' : B.gold}`, borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.6), inset 0 0 0 6px rgba(232,188,102,0.08)', color: B.cream, fontFamily: SANS}}>
	<div style={{position: 'absolute', left: s * 0.08, top: s * 0.05, fontSize: s * 0.15, fontWeight: 700, color: B.goldL, fontVariantNumeric: 'lining-nums'}}>{e.z}</div>
	{e.note && <div style={{position: 'absolute', right: s * 0.08, top: s * 0.05, fontSize: s * 0.15, fontWeight: 900, color: B.goldL}}>{e.note}</div>}
	<div style={{position: 'absolute', left: 0, right: 0, top: s * 0.2, textAlign: 'center', fontSize: s * 0.4, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em'}}>{e.sym}</div>
	<div style={{position: 'absolute', left: 0, right: 0, top: s * 0.64, textAlign: 'center', fontSize: s * 0.2, fontWeight: 900, lineHeight: 1}}>{e.zh}</div>
	<div style={{position: 'absolute', left: 0, right: 0, top: s * 0.88, textAlign: 'center', fontSize: s * 0.1, fontWeight: 700, lineHeight: 1, opacity: 0.8, letterSpacing: '0.04em'}}>{e.en}</div>
</div>;
const withTiles = (C: React.FC, tiles: React.ReactNode): React.FC => () => <><C />{tiles}</>;

export const KFS_H: KFV[] = [
	{t: 0.0, leg: '01 H1 · KEPT v2 0.00–1.58', d: '厨房：湿菜刀起锈，远处青铜剑刃同一条线上闪光（菜刀造型待新版cleaver组件）', C: v2(0.0)},
	{t: 2.7, leg: '02 H1 · CHANGED v2 1.58–5.54', d: '贴着剑身滑行，菱形格流过；[亮]＝真实高光（替换白条）', C: v2(2.7)},
	{t: 8.5, leg: '03 H2 · CHANGED v2 5.54–9.50', d: '越过剑格拉远：斜面展台＋低玻璃罩，剑占画宽≥45%', C: v2(8.0)},
	{t: 9.8, leg: '04 TITLE · CHANGED v2 9.50–11.76', d: '片名刻在玻璃罩斜面上，9.5落拍', C: () => <V2Pic t={9.8} title />, stamp: false},
	{t: 14.0, leg: '05 S1 · CHANGED v2 11.76–16.29', d: '环绕90°：暗厅、观众剪影、展台在中央', C: v2(13.5)},
	{t: 18.6, leg: '06 S3 · CHANGED v2 16.29–20.82', d: '沿剑轴推近：银光掠过，「镀铬？」＋铬元素牌（问号，不划掉）', C: withTiles(v2(18.6), <ElementTile e={EL.Cr} x={1500} y={640} />)},
	{t: 22.3, leg: '07 S4 · KEPT v2 20.82–24.22', d: '穿过剑首11圈同心圆，硬化成墓坑台阶（俯冲）', C: v2(22.4)},
	{t: 26.0, leg: '08 D1 · CHANGED v2 22.6–28.75', d: '雪中水渠，工人与灯，坑口打开；深度从0起跳', C: withTiles(v2(26.5), <DepthTag v={0.0} />)},
	{t: 30.5, leg: '09 D2 · CHANGED v2 28.75–36.10', d: '快速下沉（≈2.5米/秒）：夯土、青灰泥、白膏泥上涌，深度到10.8', C: withTiles(v2(33.0), <DepthTag v={7.8} />)},
	{t: 34.5, leg: '10 D3 · CHANGED v2 36.10–43.46', d: '椁顶、两层棺盖掀开；简化骨架（骨色线描），黑漆鞘剑在其左侧', C: withTiles(v2(40.5), <DepthTag v={10.8} />)},
	{t: 37.0, leg: '11 D6 · KEPT v2 43.46–47.43', d: '洗净剑鞘，拔剑：寒光一闪', C: v2(44.0)},
	{t: 42.5, leg: '12 I0 · KEPT v2 47.43–51.95', d: '铭文逐对亮起：越王鸠浅 / 自作用剑', C: v2(49.4)},
	{t: 47.8, leg: '12 I1 · KEPT v2 51.95–56.48', d: '40多封信在剑面倒影里；鸠浅＝勾践', C: v2(54.8)},
	{t: 85.5, leg: '14 B1 · KEPT v2 56.48–61.58', d: '1977片场：剑刃划破20多张/30多张纸', C: v2(59.4)},
	{t: 90.5, leg: '15 M1 · CHANGED v2 61.58–66.11', d: '微距推入剑面；「料好」＋铜、铅元素牌（铅≈0，淡）', C: withTiles(v2(64.2), <><ElementTile e={EL.Cu} x={1330} y={735} /><ElementTile e={EL.Pb} x={1550} y={735} faint /></>)},
	{t: 94.8, leg: '15 M2 · CHANGED v2 66.11–70.63', d: '一颗被照亮的浅色菱形是主体；剖面：锡皮；铬（问号）与锡并排', C: withTiles(v2(68.4), <><Spot x={830} y={655} rx={95} ry={50} o={0.7} /><ElementTile e={EL.Cr} x={1330} y={735} o={0.7} /><ElementTile e={EL.Sn} x={1550} y={735} /></>)},
	{t: 98.5, leg: '15 M3 · CHANGED v2 70.63–75.16', d: '静：镜头停住，只剩一束暖光照着那颗菱形', C: withTiles(v2(72.5), <Spot x={955} y={655} rx={110} ry={58} o={0.82} />)},
	{t: 102.5, leg: '16 T1 · CHANGED v2 75.16–77.99', d: '大落拍：三处橄榄色锈点「贴在」表面上（透视里）', C: v2(76.9)},
	{t: 105.5, leg: '16 T2 · CHANGED v2 77.99–81.95', d: '锈点缩成小点，旁边细比例尺', C: v2(79.5)},
	{t: 109.5, leg: '17 T3 · CHANGED v2 81.95–86.48', d: '倒带：剑回鞘、回到骨架左侧；邮戳倒回战国中期', C: v2(84.5)},
	{t: 114.0, leg: '18 E1 · KEPT v2 86.48–90.45', d: '墓室剖面：其他剑一把把亮起，勾践剑最亮', C: v2(88.5)},
	{t: 118.5, leg: '19 L1 · KEPT v2 90.45–95.54', d: '剖面上层层合拢并命名；空气点被白膏泥挡住', C: v2(93.5)},
	{t: 122.0, leg: '20 R2 · CHANGED v2 95.54–102.33', d: '升回展台：邮戳1965→2026，剑光暗一档，一处淡锈', C: v2(98.0)},
	{t: 126.5, leg: '21 P1 · CHANGED v2 102.33–109.13', d: '退出玻璃罩：罩面倒影变成你家厨房，菜刀与剑同线', C: v2(106.9)},
	{t: 130.5, leg: '22 END · KEPT v2 109.13–113.63', d: 'Juno片尾卡：你第一次见到它，是在哪？', C: v2(110.6), stamp: false},
];
void W; void H; void KFK_H1; void KFI_H2; void KFI_TITLE; void KFI_S1; void KFJ_D3; void KFK_T1; void KFK_T2; void KFJ_T3; void KFI_R2; void KFI_P1;
/* producer: the legs whose new components now exist in the film (sword spec, display, skeleton, blooms on the surface, M2 focus) show the film's own picture; kfI/J/K stand-ins stay for reference */
