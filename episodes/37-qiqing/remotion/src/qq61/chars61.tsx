import React from 'react';
import {POSES, Pose, Rig, wristTo, reach, solve, AMMIT_REST, mummyArms} from '../qq60/rig60';
import {walkPose, ANI_POSES} from '../qq60/cast60';
import {Throne, Balance, balanceGeo} from '../qq60/props60';
import {Ammit61 as Ammit2} from './ammit61';
import {GoldDefs, MaskFront} from '../qq60/act60a_kit';
import {Wheat, PapyrusClump, Palm} from '../qq60/props60b';
import {PAL, V, ap, lerp} from '../qq60/geo60';
import {P61} from './cast61';
import {NutArch} from './shots61';
import {ActorOpts, Actor, Theme} from './sheetkit61';
/** Osiris (god body): both hands out of the wrappings, crossed on the chest round crook and flail (the rig's mummyArms; the rig applies
 *  it too, so the callouts here and the drawing agree) */
const mummyHands = (p: Pose): Pose => mummyArms(p, 'm');
import {Look} from './expr61';

/* ep61 · the character table: every sheet's content (poses, stress poses, expressions, parts, callouts, palette, rules).
   Poses come from the ep60 rig (POSES), the ep61 cast (P61) and the ep60 cast (walkPose, ANI_POSES); nothing is redrawn here. */
export type Slot = {x: number; y: number; w: number; h: number; gy: number; id: string; th: Theme; s: number};
export type Cell = {label: string; pose?: Pose; o?: ActorOpts; who?: string; s?: number; dx?: number; custom?: (k: Slot) => React.ReactNode; pivots?: boolean};
export type FaceCell = {label: string; pose: Pose; o?: ActorOpts; look?: Look; who?: string};
export type Part = {label: string; pose: Pose; o?: ActorOpts; look?: Look; fig?: boolean; s?: number; focus?: V; who?: string};
export type Note = {t: string; d: string; src: string; bone?: keyof Rig; p?: V; abs?: V; on?: 2; side?: 'L' | 'R'};
export type CharCfg = {
	n: number; key: string; who: string; zh: string; role: string; sub: string; en: string; dark?: boolean;
	main: {pose?: Pose; o?: ActorOpts; s: number; dx?: number; custom?: (k: Slot) => React.ReactNode; who?: string};
	poses: Cell[]; stress: Cell[]; faces: FaceCell[]; focus: V; faceS?: number; parts: Part[]; partsTitle: string;
	notes: Note[]; pal: [string, string][]; must: string[]; dont: string[]; height: string; joints: string;
	/** RIGTEST61: the signature pose to animate when the sheet's own signature cell is a custom scene (kneel at the balance, arch, recline, throne) */
	rig?: {pose: Pose; label: string; o?: ActorOpts};
};

/* ---------- shared poses ---------- */
export const REST = POSES.rest;
export const rest = (t = 0): Pose => P61.rest(t);
export const walk = (ph = 1.1, o = {}): Pose => walkPose(ph, o);
/** goddess poses (Egyptian canon): an empty-handed stand with soft elbows and open hands; the walk with a small arm swing
 *  (the narrow stance and short stride come from the 'f' body itself, rig60 BODY.f.stride) */
export const restF = (t = 0): Pose => ({...P61.rest(t), bs: -4, be: 12, bw: 8, fs: 8, fe: 22, fw: -12});
export const walkF = (ph = 1.1): Pose => walkPose(ph, {arm: 0.6});
/** stress: back arm straight up, front arm on the sceptre */
export const S_RAISE: Pose = {...POSES.rest, lean: -2, neck: -3, head: -5, bs: 160, be: 6, bw: -14, fs: 20, fe: 30};
/** stress: deep lunge, torso over the front knee */
export const S_STEP: Pose = {...POSES.rest, lean: 8, neck: 2, head: 2, bs: -34, be: 12, fs: 34, fe: 34, rt: -34, rk: 10, at: 44, ak: 40};
/** stress: head thrown back, chest out */
export const S_BACK: Pose = {...POSES.rest, lean: -7, neck: -12, head: -22, bs: -18, be: 12, fs: 46, fe: 22, rt: -10, at: 12};
const HEADBACK = (u = 1): Pose => ({...POSES.rest, lean: -4 * u, neck: -8 * u, head: -18 * u, bs: -10, fs: 20, fe: 24, rt: -8, at: 11});
const STAND: Pose = {...POSES.rest, lean: 0, neck: 0, head: 0};

/* ---------- face presets per head type: neutral / angry-or-roaring / pleased ---------- */
export const FACES = {
	human: [{label: '平静', look: {eyes: 0, look: 0.2}}, {label: '愤怒', look: {brow: -1, eyes: 0.12, look: 0.6, mouth: 0.8}}, {label: '满意', look: {smile: 1, brow: 0.5, eyes: 0.5}}],
	jackal: [{label: '平静', look: {eyes: 0}}, {label: '低吼（下颌张开 · 耳后压）', look: {brow: -1, eyes: 0}, o: {jaw: 1, ear: 24}}, {label: '满意（耳朝前 · 眼半闭）', look: {eyes: 0.55, brow: 0.4}, o: {jaw: 0.18, ear: -10}}],
	ibis: [{label: '平静', look: {eyes: 0}}, {label: '尖叫（喙大张）', look: {brow: -1, eyes: 0}, o: {jaw: 1}}, {label: '满意（眼半闭）', look: {eyes: 0.55, brow: 0.4}, o: {jaw: 0.12}}],
	falcon: [{label: '平静', look: {eyes: 0}}, {label: '隼鸣（喙张开）', look: {brow: -1, eyes: 0}, o: {jaw: 1}}, {label: '满意（眼半闭）', look: {eyes: 0.55, brow: 0.4}, o: {jaw: 0.1}}],
	lioness: [{label: '平静', look: {eyes: 0}}, {label: '怒吼（大张口 · 獠牙）', look: {brow: -1, eyes: 0}, o: {roar: 1.35}}, {label: '满意（眼半闭）', look: {eyes: 0.55, brow: 0.35}}],
	cat: [{label: '平静', look: {eyes: 0}}, {label: '警觉（耳后压 · 皱眉）', look: {brow: -1, eyes: 0, look: 0.7}, o: {ear: 28}}, {label: '满意（眼眯起）', look: {eyes: 0.8, brow: 0.2}, o: {ear: -8}}],
	seth: [{label: '平静', look: {eyes: 0}}, {label: '冷笑（嘴角下压）', look: {brow: -1, eyes: 0.2}, o: {sneer: 1, ear: 12}}, {label: '得意（眼半闭）', look: {eyes: 0.5, brow: 0.3}, o: {ear: -6}}],
} as const;
const facePose = (k: 0 | 1 | 2, base: Pose = STAND): Pose => (k === 1 ? {...base, neck: -6, head: -14, lean: -2} : k === 2 ? {...base, neck: 2, head: 4} : base);
const faces = (kind: keyof typeof FACES, extra: ActorOpts = {}, base: Pose = STAND, roarPose?: Pose): FaceCell[] => FACES[kind].map((f, i) => ({label: f.label, pose: i === 1 && roarPose ? roarPose : facePose(i as 0 | 1 | 2, base), look: f.look, o: {...(('o' in f ? f.o : {}) as ActorOpts), ...extra}}));
const parts4 = (kind: 'jaw' | 'eye' | 'ear', base: Pose, mk: (u: number) => ActorOpts, labels: string[], look?: Look, who?: string): Part[] => [0, 0.5, 1].map((u, i) => ({label: labels[i], pose: {...base, head: base.head - 8 * u, neck: base.neck - 3 * u}, o: mk(u), look: {...look}, who}));

/* ---------- Anubis at the balance (kneeling, front hand steadying the plumb, as ep60's rig sheet) ---------- */
const anubisKneel = (sb: number, postX: number, gy: number): {pose: Pose; ax: number; bobY: number} => {
	const bal = balanceGeo({tilt: 2, plumb: -0.5}), bob: V = [postX + bal.bob[0] * sb, gy + bal.bob[1] * sb], ax = postX - 5.8 * sb;
	let kn: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 5, head: -3, neck: 3};
	kn = wristTo(reach(kn, 'f', [(bob[0] - ax) / sb - 1.05, (bob[1] - gy) / sb + 0.75], 'm'), 'f', 128);
	const knee = ap(solve(kn, 'm').aS, [0, 0]); kn = wristTo(reach(kn, 'b', [knee[0] - 0.7, knee[1] - 0.95], 'm'), 'b', 96);
	return {pose: kn, ax, bobY: bob[1]}; };
const AnubisBalance: (sb: number) => (k: Slot) => React.ReactNode = (sb) => (k) => { const postX = k.x + k.w * 0.7, {pose, ax} = anubisKneel(sb, postX, k.gy);
	return <g><Balance p={{tilt: 2, plumb: -0.5}} x={postX} y={k.gy} s={sb} /><Actor id={`${k.id}-an`} who="anubis" pose={pose} x={ax} y={k.gy} s={sb} bProp="none" fProp="none" /></g>; };

/* ---------- Geb reclining under Nut's arch, plants growing from his body ---------- */
export const GEB_LIE: Pose = {...POSES.rest, fs: 4, fe: 8, bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2};
const GebRecline = (len: number, bx: number, gy: number, id: string, plants = true) => { const sf = len / 20, lift = 3.3 * sf;
	return <g>
		<g transform={`rotate(-90 ${bx} ${gy - lift})`}><Actor id={id} who="geb" pose={GEB_LIE} x={bx} y={gy - lift} s={sf} bProp="none" fProp="none" /></g>
		{plants && <g><Wheat x0={bx - len * 0.8} x1={bx - len * 0.2} y={gy - lift * 2 - 2} h={len * 0.2} t={0.6} seed={3} dense={0.5} />
			<PapyrusClump x={bx - len * 0.12} y={gy - lift * 2} h={len * 0.2} t={0.4} n={4} /><PapyrusClump x={bx - len * 0.92} y={gy - lift * 2} h={len * 0.17} t={1.1} n={3} seed={5} /></g>}
	</g>; };

/* ---------- Ammit (own jaw/neck/tail rig) ---------- */
export const AmmitCell = (a: {jaw: number; neck: number; lean: number; roar?: number; paw?: number; tail?: number}, s: number, dx = 0): ((k: Slot) => React.ReactNode) => (k) =>
	<Ammit2 id={`${k.id}-am`} pose={{...AMMIT_REST, jaw: a.jaw, neck: a.neck, lean: a.lean, paw: a.paw, tail: a.tail ?? 0}} roar={a.roar ?? 0} x={k.x + k.w / 2 - 2.4 * s + dx} y={k.gy} s={s} t={0.5} look={0.6} />;
/** the main view: Ammit beside Ani at the ep60 weighing-hall scales (Ammit s 34, Ani s 26) */
const AMMIT_OX = 346, AMMIT_S = 34;
const AmmitMain = (k: Slot) => <g><Actor id={`${k.id}-ani`} who="ani" pose={{...POSES.rest, fs: 6, fe: 12, fw: -6}} x={118} y={k.gy} s={25} />
	<Ammit2 id={`${k.id}-am`} pose={{...AMMIT_REST, jaw: 5}} x={AMMIT_OX} y={k.gy} s={AMMIT_S} t={0.5} look={0.6} /></g>;

/* ---------- the table ---------- */
const C = (t: string, d: string, src: string, bone?: keyof Rig, p?: V, abs?: V): Note => ({t, d, src, bone, p, abs});
const O_NONE: ActorOpts = {bProp: 'none', fProp: 'none'};
const WINGS_UP: Pose = {...POSES.protect};
const WINGS_HALF: Pose = {...POSES.rest, bs: 62, be: 8, bw: -14, fs: 74, fe: 8, fw: -14};
const WINGS_DOWN: Pose = {...POSES.rest, bs: 6, be: 6, fs: 10, fe: 8};

export const CHARS: CharCfg[] = [
	/* 02 Atum · Ra */
	{n: 2, key: 'atum', who: 'atum', zh: '阿图姆 · 拉', role: '创世之神 / 太阳神', sub: '从黑水里自己站起来的第一位神 · 日出的隼', en: 'Atum · Ra (Re-Horakhty)', dark: true,
		main: {s: 17, dx: -62, pose: rest(), custom: undefined}, focus: [1.4, -2.7], faceS: 34,
		poses: [{label: '阿图姆 · 站立', pose: rest()}, {label: '阿图姆 · 行走', pose: walk(1.1)}, {label: '拉（隼首）· 站立', who: 'ra', pose: rest()}, {label: '拉 · 隼鸣（标志动作）', who: 'ra', pose: HEADBACK(), o: {jaw: 1, look: {brow: -1, eyes: 0}}}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '拉 · 头后仰 + 喙张开', who: 'ra', pose: S_BACK, o: {jaw: 1}, pivots: true}],
		faces: [{label: '拉 · 平静', who: 'ra', pose: STAND, look: {eyes: 0}} as FaceCell, {label: '拉 · 隼鸣', who: 'ra', pose: facePose(1), look: {brow: -1, eyes: 0}, o: {jaw: 1}}, {label: '拉 · 满意', who: 'ra', pose: facePose(2), look: {eyes: 0.55, brow: 0.4}, o: {jaw: 0.1}}],
		parts: [{label: '阿图姆 · 眼 睁', pose: STAND, look: {eyes: 0}, who: 'atum'}, {label: '眼 半闭', pose: STAND, look: {eyes: 0.5}}, {label: '拉 · 喙 0°', pose: STAND, who: 'ra', look: {eyes: 0}}, {label: '拉 · 喙 46°', pose: {...STAND, head: -8}, who: 'ra', o: {jaw: 1}, look: {eyes: 0}}], partsTitle: '头部关节 / 表情部件',
		notes: [C('红白双冠', '阿图姆：上下埃及合一的 pschent', 'I1 · Louvre E 52（塔佩瑞特碑）', 'head', [0.5, -4.6]), {...C('隼首 + 日轮', '拉：隼头、红日轮 + 圣蛇', 'I2 · Met 22.3.31 / 22.3.34', 'head', [0.6, -3.6]), on: 2},
			C('人脸 + 卷胡须', '阿图姆人形、戴假胡须（卷须）', 'I1 · Louvre E 52', 'head', [1.4, -0.9]), C('ankh + was', '一手生命符、一手权杖', 'I1 · I2（22.3.31）', 'fH', [0.3, 1.2]),
			C('宽领', '金·青·红·绿松石多排宽领', 'I2 · Met 22.3.31 绿松石领', 'torso', [0, -6.0]), C('皮肤', '赤陶红（设计选择：未找到逐像描色）', 'I1 注：Louvre 仅给全碑色', 'torso', [0.8, -3.0]), C('兽尾 + 亚麻裙', '腰后兽尾、亚麻褶裙、金腰带', 'I1 · Louvre E 52', 'torso', [-1.3, -1.8])],
		pal: [['skinM', '赤陶肤'], ['falcon', '拉 · 隼头'], ['red', '红冠/日轮'], ['white', '白冠/亚麻'], ['gold', '金'], ['blue', '青金'], ['turq', '绿松石'], ['ink', '墨线']],
		must: ['阿图姆是人头、有胡须，戴红白双冠', '拉是隼头 + 头顶红日轮缠圣蛇', '一手 ankh、一手 was 权杖；手不画指甲', '两位都是男身（宽肩、V 形躯干），身高同普通神'],
		dont: ['不要把拉画成人头，也不要给阿图姆画隼头', '不要画成两顶分开的冠（红白必须是一顶）', '日轮不要画成金色（是红色）', '不要给手指画指甲'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）', joints: '颈/头 · 肩/肘/腕 · 髋/膝/踝；隼喙下颌（拉）'},
	/* 03 Shu */
	{n: 3, key: 'shu', who: 'shu', zh: '舒', role: '空气之神', sub: '撑起天空的神 · 头顶一根鸵鸟羽毛', en: 'Shu',
		main: {s: 19.5, pose: rest()}, focus: [0.4, -2.9], faceS: 34,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walk(1.1)}, {label: '托天（标志动作）', pose: P61.lift(), o: O_NONE}, {label: '风 · 双臂展开', pose: P61.wide(), o: O_NONE}],
		stress: [{label: '双臂全抬（托天）', pose: P61.lift(), o: O_NONE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '头后仰（托举用力）', pose: {...P61.lift(), neck: -10, head: -24, lean: -5}, o: O_NONE, pivots: true}],
		faces: faces('human'), parts: [...parts4('eye', STAND, () => ({}), ['眼 睁', '眼 半闭', '眼 闭'], undefined).map((p, i) => ({...p, pose: STAND, look: {eyes: [0, 0.5, 1][i]}})), {label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}], partsTitle: '眼睛部件',
		notes: [C('鸵鸟羽毛', '头顶一根羽毛 = 他名字的象形字', 'I3 · Ranke，Penn Museum Bulletin XV (1950)', 'head', [0.4, -4.9]), C('人头', '永远是人形（Ranke：“Always human”）', 'I3 · Ranke 同上', 'head', [1.4, -1.2]),
			C('托天', '双臂高举撑住努特', 'I3 · Louvre N 3293（Shu debout, bras levés）', 'fH', [0.2, 1.5]), C('皮肤', '赤陶红（设计选择：无已核实的上色 Shu）', 'I3 注', 'torso', [0.8, -3.0]), C('短发 · 无假发', '设计选择：不戴三段假发，让羽毛清楚', 'cast61 · CAST61.shu', 'head', [-0.3, -1.6])],
		pal: [['skinM', '赤陶肤'], ['linen', '亚麻'], ['gold', '金'], ['blue', '青金'], ['red', '红'], ['green', '绿'], ['ink', '墨线']],
		must: ['头顶一根直立的鸵鸟羽毛', '托天时双臂伸直、掌心朝上、脚踩实', '人头人身，不带动物特征'], dont: ['不要给舒画狮头（那是泰芙努特）', '羽毛不要画成两根或斜插', '托天时不要让手臂穿过头部'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）；舒 S=27～30 与全片同比', joints: '双臂可全抬 170°；脊柱后仰；膝踝承重'},
	/* 04 Tefnut */
	{n: 4, key: 'tefnut', who: 'tefnut', zh: '泰芙努特', role: '湿气之神 / 狮首女神', sub: '舒的孪生妹妹 · 怒吼时是烈日', en: 'Tefnut',
		main: {s: 19.5, pose: rest()}, focus: [1.0, -2.0], faceS: 34,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walkF(1.1)}, {label: '怒吼（标志动作）', pose: {...P61.roar(1), neck: -9, head: -24, lean: -5}, o: {roar: 1.3, look: {brow: -1, eyes: 0}}}, {label: '平静 · 手持 ankh', pose: {...rest(), head: 3}}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '头后仰 + 大张口', pose: {...S_BACK, head: -28, neck: -14}, o: {roar: 1.4}, pivots: true}],
		faces: faces('lioness', {}, STAND, {...STAND, neck: -12, head: -28, lean: -4}), parts: parts4('jaw', STAND, (u) => (u < 1 ? {jaw: u} : {roar: 1}), ['下颌 0°', '下颌 25°', '怒吼 50°']).concat([{label: '眼 闭', pose: STAND, look: {eyes: 1}}]), partsTitle: '下颌 / 眼睛部件',
		notes: [C('狮首', '站立女神，狮子的头', 'I4 · Louvre N 2699（déesse à tête de lionne）', 'head', [1.8, -0.9]), C('日轮 + 圣蛇', '头顶金色日轮、前缘圣蛇', 'I4 · Louvre N 2699', 'head', [0.5, -3.6]), C('窄身长裙', '红色长裙 + 金珠网（设计选择）', 'cast61 · sheath', 'torso', [0.2, -1.2]),
			C('宽领', '女神窄一点的宽领', 'I14 类比 · Louvre N 1', 'torso', [0.3, -6.3]), C('皮肤', '黄赭（女性惯例；设计选择）', 'I4 注：Louvre 仅给全碑色', 'torso', [0.9, -3.2]), C('ankh + was', '设计选择，与舒成对', 'cast61 · tefnut', 'fH', [0.3, 1.2])],
		pal: [['skinF', '女性肤'], ['lion', '狮头'], ['lion2', '狮头暗部'], ['red', '裙/日轮'], ['gold', '金'], ['red2', '口腔'], ['white', '獠牙'], ['ink', '墨线']],
		must: ['狮首：圆耳、短吻、眼睛金边', '怒吼：下颌张到 50°、上下獠牙和舌头可见、头后仰、眉压低、鼻梁起皱', '头顶日轮 + 圣蛇', '与塞赫迈特同脸但日轮/名字要分开（用色牌和上下文区分）'],
		dont: ['不要画成猫（耳朵圆、吻要宽）', '不要把怒吼的嘴画成笑', '不要把日轮画成月亮', '不要给手画指甲'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）', joints: '下颌绕颊后枢轴 0–50°（怒吼头再后仰 7°）；耳；头颈后仰'},
	/* 05 Geb */
	{n: 5, key: 'geb', who: 'geb', zh: '盖布', role: '大地之神', sub: '躺着的大地 · 身上长出草木', en: 'Geb',
		main: {s: 19.5, pose: rest(), custom: undefined}, focus: [0.4, -1.8], faceS: 34,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walk(1.1)}, {label: '斜倚 · 身上长草（标志动作）', custom: (k) => GebRecline(k.w - 28, k.x + k.w - 12, k.gy - 2, `${k.id}-g`)}, {label: '撑地欲起', pose: {...POSES.rest, lean: 28, neck: 6, head: 8, fs: 40, fe: 20, bs: 10, rt: -14, rk: 40, at: 30, ak: 50}, o: O_NONE}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '深蹲 · 双膝弯曲', pose: {...POSES.rest, lean: 20, neck: 4, head: 6, bs: 40, be: 30, fs: 52, fe: 34, rt: -4, rk: 90, at: 8, ak: 100}, o: O_NONE, pivots: true}, {label: '头后仰', pose: S_BACK, pivots: true}],
		faces: faces('human'), parts: [0, 0.5, 1].map((u, i) => ({label: ['眼 睁', '眼 半闭', '眼 闭'][i], pose: STAND, look: {eyes: u}} as Part)).concat([{label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}]), partsTitle: '眼睛部件',
		notes: [C('人头', '男性人形', 'I5 · Louvre E 52 / N 381（只记名与托天，无形象）', 'head', [1.4, -1.2]), C('绿色皮肤', '设计选择（I5：没有找到博物馆物件证实）', 'I5 · 未核实 · cast61 注', 'torso', [0.8, -3.0]), C('鹅 · 不画', '鹅在已查记录里没有依据，所以不画', 'I5 · (unverified)', 'head', [0.3, -2.9]),
			C('假发', '三段假发（与诸神同）', 'cast61 · geb', 'head', [-1.2, -1.0]), C('ankh + was', '设计选择', 'cast61 · geb', 'fH', [0.3, 1.2])],
		pal: [['skinO', '绿肤（设计）'], ['skinO2', '绿肤暗'], ['wig', '假发'], ['linen', '亚麻'], ['gold', '金'], ['green', '草绿'], ['blue', '青金'], ['ink', '墨线']],
		must: ['人头、绿色皮肤（本系列设计选择，已在 I5 标为未核实）', '躺下时头朝左、脸朝天，草木从身上长出', '三段假发'], dont: ['不要画头顶的鹅（没有依据）', '不要画成赤陶或黑色皮肤（盖布 / 奥西里斯是绿）', '躺着时不要让手臂穿过身体'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）；躺下 = 同一副骨架转 −90°', joints: '全身整体旋转 −90°；其余同标准骨架'},
	/* 06 Nut */
	{n: 6, key: 'nut', who: 'nut', zh: '努特', role: '天空女神', sub: '弯下身体的夜空 · 身上是星星', en: 'Nut', dark: true,
		main: {s: 19.5, pose: restF(), custom: undefined}, focus: [0.4, -2.3], faceS: 34,
		poses: [{label: '站立 · 头顶 nu 罐', pose: restF(), o: O_NONE}, {label: '行走', pose: walkF(1.1), o: O_NONE}, {label: '弯身成拱（标志动作）', custom: (k) => { const sc = (k.w - 24) / 480; return <g transform={`translate(${k.x + 14 + 4 * sc},${k.gy}) scale(${sc})`}><NutArch cx={240} gy={0} span={420} h={430} w={64} seed={5} /></g>; }}, {label: '双臂上举 · 托住星空', pose: P61.lift(), o: O_NONE}],
		stress: [{label: '手臂全抬', pose: P61.lift(), o: O_NONE, pivots: true}, {label: '后弯 · 头后仰', pose: {...POSES.rest, lean: -12, neck: -12, head: -22, bs: 150, be: 20, fs: 160, fe: 20}, o: O_NONE, pivots: true}, {label: '前屈 · 手触地', pose: {...POSES.rest, lean: 70, neck: 10, head: 12, bs: 80, be: 4, fs: 86, fe: 4, rt: -4, at: 6}, o: O_NONE, pivots: true}],
		faces: faces('human'), parts: [0, 0.5, 1].map((u, i) => ({label: ['眼 睁', '眼 半闭', '眼 闭'][i], pose: STAND, look: {eyes: u}} as Part)).concat([{label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}]), partsTitle: '眼睛部件',
		notes: [C('红色 nu 罐', '头顶红色 nu 罐（设计选择，I6 标 unverified）', 'I6 · 未核实', 'head', [0.1, -3.6]), C('弯身成拱', '头在一端、手脚触地；身上是星星（见标志动作格）', 'I6 · Louvre E 52（Nout penchée…étoiles）', 'torso', [0.2, -4.0]), C('蓝色天拱', '星拱用青金蓝', 'I6 · Met 96.4.4', 'torso', [0, -3.5]),
			C('皮肤', '黄赭（女性惯例）', 'cast61 · nut', 'torso', [0.9, -3.0]), C('窄身长裙', '站立时红裙（设计选择；拱形态为裸身）', 'I6：“femme, nu”', 'torso', [0.2, -1.2])],
		pal: [['skinF', '女性肤'], ['sky', '星空蓝'], ['star', '星金'], ['red', 'nu 罐/裙'], ['wigH', '黑发'], ['gold', '金'], ['blue', '青金'], ['ink', '墨线']],
		must: ['拱形态：头在一端、手脚触地、身体是星空', '星星为五角金星，大小不一', '站立形态头顶红色 nu 罐'], dont: ['不要把拱画成彩虹（要窄而高的身体）', '不要让星空盖住手脚触地的位置', '不要给 nu 罐画盖子'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）；拱形态按画面比例（手脚到手脚 = 拱宽）', joints: '站立=标准骨架；拱=独立星拱（头/手/脚触地）'},
	/* 07 Osiris */
	{n: 7, key: 'osiris', who: 'osiris', zh: '奥西里斯', role: '冥界之王', sub: '木乃伊形的绿皮神 · 手持弯钩与连枷', en: 'Osiris',
		main: {s: 19.5, pose: mummyHands({...POSES.mummy})}, focus: [0.7, -2.9], faceS: 34,
		poses: [{label: '站立（木乃伊形）', pose: mummyHands({...POSES.mummy})}, {label: '登基 · 坐王座（标志动作）', custom: (k) => <g><Throne x={k.x + k.w * 0.5 - 20} y={k.gy} s={k.s * 0.92} /><Actor id={`${k.id}-o`} who="osiris" pose={mummyHands({...POSES.throne, y: 5.95})} x={k.x + k.w * 0.5 - 20 + 2.7 * k.s * 0.92} y={k.gy} s={k.s * 0.92} face={-1} /></g>}, {label: '低头', pose: mummyHands({...POSES.mummy, neck: 5, head: 10})}, {label: '抬头', pose: mummyHands({...POSES.mummy, neck: -4, head: -10})}],
		stress: [{label: '前倾 14°', pose: mummyHands({...POSES.mummy, lean: 14, neck: 4, head: 8}), pivots: true}, {label: '后仰 · 头后仰', pose: mummyHands({...POSES.mummy, lean: -8, neck: -8, head: -18}), pivots: true}, {label: '登基 · 前倾', pose: mummyHands({...POSES.throne, y: 5.95, lean: 8, neck: 4, head: 8}), pivots: true}],
		faces: faces('human'), parts: [0, 0.5, 1].map((u, i) => ({label: ['眼 睁', '眼 半闭', '眼 闭'][i], pose: STAND, look: {eyes: u}} as Part)).concat([{label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}]), partsTitle: '眼睛部件（木乃伊形：臂/腿藏在裹布内）',
		notes: [C('阿特夫冠', '白冠 + 两侧卷羽毛', 'I7 · Met 96.4.4（SEEN）', 'head', [0.3, -4.3]), C('卷须胡', '下垂并上卷的神胡须', 'I7 · Met 96.4.4 / 30.3.31', 'head', [1.3, 0.8]), C('弯钩 + 连枷', '十字交叉捧在胸前', 'I7 · Met 96.4.4 / 30.3.31', 'fH', [0.4, 0.8]),
			C('绿色皮肤', '“以绿皮肤辨认”', 'I7 · Petrie UC14226；Met 96.4.4', 'head', [0.6, -0.6]), C('红色裹布', '网格珠纹木乃伊裹身（红）', 'I7 · Met 96.4.4', 'torso', [0, -2.5]), C('宽领', '多排宽领', 'I7 · Met 30.3.31', 'torso', [0, -6.1])],
		pal: [['skinO', '绿肤'], ['skinO2', '绿肤暗'], ['linen', '裹布'], ['red', '红'], ['turq', '珠网'], ['gold', '金'], ['blue', '青金'], ['ink', '墨线']],
		must: ['绿色皮肤、白冠（阿特夫）、卷胡须', '双腿并拢、身体裹紧，只露双手与头', '一手弯钩、一手连枷，手在胸前交叉'], dont: ['不要画腿的分开或迈步', '不要给他画黑皮肤（绿色）', '不要把弯钩画成直杖'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）；木乃伊裹布保留宽肩；坐王座时按坐姿', joints: '木乃伊形：只有颈/头与脊柱（躯干前后倾）可动；手固定在胸前'},
	/* 08 Isis */
	{n: 8, key: 'isis', who: 'isis', zh: '伊西斯', role: '魔法与守护之神', sub: '奥西里斯的妻子 · 展开双翼保护', en: 'Isis',
		main: {s: 19.5, pose: {...rest(), ...{bs: 22, be: 10, fs: 34, fe: 8, bw: -10, fw: -10}}, o: {wings: true}}, focus: [0.4, -2.3], faceS: 34,
		poses: [{label: '站立 · 翅收拢', pose: {...POSES.rest, bs: 6, be: 8, fs: 10, fe: 8, rt: -6, at: 8}, o: {wings: true}}, {label: '行走', pose: walk(1.1, {arm: 0.6}), o: {wings: true}}, {label: '展翼（标志动作）', pose: WINGS_UP, o: {wings: true, t: 0.9}}, {label: '跪 · 哀悼（双翼）', pose: {...POSES.kneel, fs: 44, fe: 126, fw: 30, bs: 14, be: 40}, o: {wings: true}}],
		stress: [{label: '翅全展（双臂 112°+64°）', pose: {...POSES.protect, bs: 118, fs: 150}, o: {wings: true, t: 0.5}, pivots: true}, {label: '大跨步', pose: {...S_STEP, bs: -20, fs: 30}, o: {wings: true}, pivots: true}, {label: '头后仰 · 翅半展', pose: {...WINGS_HALF, neck: -12, head: -22, lean: -6}, o: {wings: true}, pivots: true}],
		faces: faces('human'), parts: [{label: '翅 收拢', pose: WINGS_DOWN, fig: true, o: {wings: true}, s: 7.4}, {label: '翅 半展', pose: WINGS_HALF, fig: true, o: {wings: true, t: 0.4}, s: 7.4}, {label: '翅 全展', pose: WINGS_UP, fig: true, o: {wings: true, t: 0.9}, s: 7.4}, {label: '眼 半闭', pose: STAND, look: {eyes: 0.5}}], partsTitle: '翅膀关节（翅膀骨 = 手臂骨，羽毛跟随）',
		notes: [C('王座符号', '黑假发上蓝色椅子象形字', 'I8 · Met 96.4.4（SEEN）· Louvre N 2699', 'head', [0.3, -3.5]), C('展开的双翼', '“带翼、跪着哭泣”', 'I8 · Louvre N 2609', 'fU', [0.6, 2.5]), C('红色紧身裙 + 金网', '红衣、金珠网', 'I8 · Met 96.4.4 红裙', 'torso', [0.2, -1.2]),
			C('皮肤', '黄赭（系列女性惯例；Met 96.4.4 上是绿肤，未采用）', 'I8 注 · cast60 CAST.isis', 'torso', [0.9, -3.2]), C('宽领', '多排宽领', 'cast60 · Collar', 'torso', [0.3, -6.3])],
		pal: [['skinF', '女性肤'], ['red', '红裙'], ['gold', '金网/饰'], ['blue', '王座符'], ['wigH', '黑发'], ['blue2', '翅蓝'], ['green', '翅绿'], ['ink', '墨线']],
		must: ['头顶蓝色“王座”符号', '展翼时双臂张开、羽毛由臂骨带出', '红色紧身长裙 + 金珠网'], dont: ['不要把王座符画成王冠或牛角日轮', '翅膀不要从背部另长出（是手臂的延伸）', '不要给翅膀画单色块（要分层羽毛）'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）', joints: '肩/肘/腕 = 翅膀骨；展翼 6°→118° 时羽毛联动'},
	/* 09 Set */
	{n: 9, key: 'set', who: 'set', zh: '赛特', role: '混乱与风暴之神', sub: '沙漠的红色 · 方耳弯鼻的怪兽头', en: 'Set (Seth)',
		main: {s: 19.5, pose: P61.menace(), o: {sneer: 1}}, focus: [1.6, -2.2], faceS: 34,
		poses: [{label: '站立', pose: rest(), o: {}}, {label: '行走', pose: walk(1.1)}, {label: '冷笑 · 逼近（标志动作）', pose: P61.menace(), o: {sneer: 1, look: {brow: -1, eyes: 0.2}}}, {label: '出手', pose: {...P61.menace(), lean: 4, fs: 64, fe: 20}, o: {sneer: 1, fProp: 'none', bProp: 'none'}}],
		stress: [{label: '手臂全抬', pose: S_RAISE, o: {sneer: 1}, pivots: true}, {label: '大跨步', pose: S_STEP, o: {sneer: 1}, pivots: true}, {label: '头后仰 · 耳后压', pose: S_BACK, o: {sneer: 1, ear: 20}, pivots: true}],
		faces: faces('seth', {}, STAND), parts: parts4('ear', STAND, (u) => ({ear: u * 28 - 6, sneer: 1}), ['耳 朝前', '耳 平', '耳 后压'], {eyes: 0.3}).concat([{label: '眼 闭', pose: STAND, o: {sneer: 0}, look: {eyes: 1}}]), partsTitle: '耳朵 / 眼睛部件',
		notes: [C('Set 兽头', '耳朵方顶、鼻子弯长；动物学上未定', 'I9 · Louvre E 3374；Ranke（unidentified mammal）', 'head', [2.8, -0.8]), C('方顶长耳', '两只耳朵竖直、顶端是平的', 'I9 · Met 25.3.284h（was 杖头）', 'head', [0.1, -3.9]), C('红眼', '红色的眼', '设计选择（cast61）', 'head', [1.3, -1.6]),
			C('皮肤', '赭红（I9：未核实，设计选择）', 'I9 · unverified', 'torso', [0.8, -3.0]), C('ankh + was', '一手 ankh，一手 was', 'I9 · Louvre E 3374（tient un signe ânkh）', 'fH', [0.3, 1.2])],
		pal: [['#9A4A2A', '兽头'], ['#6E2F1A', '兽头暗'], ['skinM', '赤陶肤'], ['red', '眼/红'], ['linen', '亚麻'], ['gold', '金'], ['blue', '青金'], ['ink', '墨线']],
		must: ['赛特兽：耳朵方顶、鼻子弯长', '嘴角下压的冷笑', '身体仍是标准人形骨架'], dont: ['不要画成驴或狗（耳要方、鼻要弯）', '不要画成鳄鱼或豺狼（那是阿努比斯）', '不要把耳朵画成尖的'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）', joints: '耳从根部弯折 −6°→26°；下颌 0–42°；冷笑（吻部起皱 + 小张口）；其余标准骨架'},
	/* 10 Nephthys */
	{n: 10, key: 'nephthys', who: 'nephthys', zh: '奈芙蒂斯', role: '哀悼与守护之神', sub: '房屋与篮子的女主人 · 伊西斯的姐妹', en: 'Nephthys',
		main: {s: 19.5, pose: restF()}, focus: [0.4, -2.3], faceS: 34,
		poses: [{label: '站立', pose: restF(), o: O_NONE}, {label: '行走', pose: walkF(1.1), o: O_NONE}, {label: '跪 · 手到脸边（标志动作）', pose: {...POSES.kneel, fs: 44, fe: 126, fw: 30, bs: 14, be: 40}, o: O_NONE}, {label: '祈祷 · 双手上举', pose: POSES.adore, o: O_NONE}],
		stress: [{label: '手臂全抬', pose: {...S_RAISE, fs: 160, fe: 6}, o: O_NONE, pivots: true}, {label: '大跨步', pose: S_STEP, o: O_NONE, pivots: true}, {label: '头后仰（恸哭）', pose: S_BACK, o: O_NONE, pivots: true}],
		faces: faces('human'), parts: [0, 0.5, 1].map((u, i) => ({label: ['眼 睁', '眼 半闭', '眼 闭'][i], pose: STAND, look: {eyes: u}} as Part)).concat([{label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}]), partsTitle: '眼睛部件',
		notes: [C('房屋 + 篮子符', '黑假发上的红色 T 形块', 'I10 · Met 12.182.23a（SEEN）', 'head', [0.1, -3.5]), C('哀悼姿势', '跪着，一手到脸边', 'I10 · Met 12.182.23a', 'fH', [0.3, 1.0]), C('皮肤', '浅黄赭（Met 上是浅奶油色）', 'I10 · Met 12.182.23a', 'torso', [0.9, -3.2]),
			C('绿色长裙', '女身 kalasiris：绿裙 + 金珠网 + 宽领（与伊西斯的红裙区分）', 'I10 · 绿裙（Met 12.182.23a）', 'torso', [0.2, -1.2]), C('不带翼', '默认不带翼（Louvre N 2609 的带翼形象留作特例）', 'I10 · Louvre N 2609', 'fU', [0.6, 2.2])],
		pal: [['skinF', '女性肤'], ['linen', '符号底'], ['gold', '金'], ['wigH', '黑发'], ['green', '绿裙'], ['red', '红'], ['blue', '青金'], ['ink', '墨线']],
		must: ['头顶“房屋 + 篮子”符号（白屋顶 + 金底）', '哀悼时跪姿、手到脸边', '与伊西斯同为女身，靠头饰与绿裙区分'], dont: ['不要给她画王座符（那是伊西斯）', '不要画成牛角日轮（那是哈托尔）', '不要手指画指甲'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）', joints: '标准骨架；跪姿：髋/膝/踝折叠；手到脸边：肩肘腕'},
	/* 11 Horus */
	{n: 11, key: 'horus', who: 'horus', zh: '荷鲁斯', role: '王权之神 / 天空之隼', sub: '隼头 · 红白双冠 · 奥西里斯之子', en: 'Horus',
		main: {s: 19, pose: rest()}, focus: [1.0, -2.7], faceS: 34,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walk(1.1)}, {label: '隼鸣（标志动作）', pose: HEADBACK(), o: {jaw: 1, look: {brow: -1, eyes: 0}}}, {label: '孩童 ×0.75（ep61 镜 14）', pose: rest(), o: {}, s: 8.6}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '头后仰 + 喙张开', pose: S_BACK, o: {jaw: 1}, pivots: true}],
		faces: faces('falcon', {}, STAND, {...STAND, neck: -10, head: -22, lean: -3}), parts: parts4('jaw', STAND, (u) => ({jaw: u}), ['喙 0°', '喙 23°', '喙 46°']).concat([{label: '眼 闭', pose: STAND, look: {eyes: 1}}]), partsTitle: '喙 / 眼睛部件',
		notes: [C('隼首', '深蓝灰隼头、白脸颊、黑钩喙', 'I11 · Louvre N 255；Met 30.3.31', 'head', [1.6, -0.9]), C('红白双冠', 'pschent', 'I11 · Louvre N 255（couronne pschent）', 'head', [0.5, -4.6]), C('金眼', '眼圈黑色', 'cast60 · CAST.horus', 'head', [1.0, -1.3]),
			C('ankh + was', '设计选择：与阿努比斯成对', 'cast60 · CAST.horus', 'fH', [0.3, 1.2]), C('皮肤', '赤陶红（I11：无已核实上色）', 'I11 注', 'torso', [0.8, -3.0]), C('兽尾', '腰后兽尾', 'cast60', 'torso', [-1.3, -1.8])],
		pal: [['skinM', '赤陶肤'], ['falcon', '隼头'], ['falcon2', '隼头暗'], ['white', '白冠/脸颊'], ['red', '红冠'], ['gold', '金'], ['blue', '青金'], ['ink', '钩喙/墨线']],
		must: ['钩喙向下、眼睛有黑色“泪痕”', '红白双冠', '隼鸣时头后仰、喙张开、眉压低'], dont: ['不要画成鹰头（要小圆头钩喙）', '不要给喙涂黄色（ep60 的设计是黑）', '孩童版只缩小，不改比例'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）；孩童 ×0.75', joints: '下喙绕嘴角（眼下）枢轴 0–46°；颈/头；其余标准骨架'},
	/* 12 Anubis */
	{n: 12, key: 'anubis', who: 'anubis', rig: {pose: {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 5}, label: '跪姿（秤旁）', o: {bProp: 'none', fProp: 'none'}}, zh: '阿努比斯', role: '木乃伊与秤之神', sub: '黑色豺首 · 守着秤杆的引路神', en: 'Anubis',
		main: {s: 19.5, pose: rest()}, focus: [1.6, -2.3], faceS: 34,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walk(1.1)}, {label: '跪在秤旁（标志动作）', custom: AnubisBalance(9.6)}, {label: '正面面具 MaskFront', custom: (k) => <g><GoldDefs id={`${k.id}-mk`} /><MaskFront x={k.x + k.w / 2} y={k.gy - 3.9 * 22} s={22} t={0.3} id={`${k.id}-mk`} /></g>}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '头后仰 + 下颌张开', pose: S_BACK, o: {jaw: 1, ear: 20}, pivots: true}],
		faces: faces('jackal', {}, STAND, {...STAND, neck: -10, head: -22, lean: -3}), parts: [0, 0.5, 1].map((u, i) => ({label: ['下颌 0°', '下颌 22°', '下颌 44°'][i], pose: STAND, o: {jaw: u}, look: {eyes: 0}} as Part)).concat([{label: '耳 后压 24°', pose: STAND, o: {ear: 24}, look: {eyes: 0}}]), partsTitle: '下颌 / 耳朵部件',
		notes: [C('黑色豺首', '黑头、耳内金/白', 'I12 · Met 38.5（SEEN）', 'head', [2.4, -0.8]), C('金耳内', '耳内金色', 'I12 · Met 38.5', 'head', [0.4, -3.4]), C('蓝假发垂片', '蓝色三段假发 + 垂片', 'I12 · Met 38.5', 'head', [-1.2, 0.4]),
			C('跪秤', '跪着、扶稳秤杆', 'I12 · Met 30.3.31（SEEN）', 'fH', [0.3, 1.0]), C('皮肤', '红褐色', 'I12 · Met 38.5', 'torso', [0.9, -3.0]), C('红蓝白菱纹裙', '裙子', 'I12 · Met 38.5', 'torso', [0.3, -1.0]), C('宽领', '绿色胸领（30.3.31）；系列用多排领', 'I12 · Met 30.3.31', 'torso', [0, -6.1])],
		pal: [['jackal', '豺头黑'], ['jackal2', '头暗部'], ['skinM', '红褐肤'], ['gold', '金'], ['blue', '青金'], ['wig', '假发蓝'], ['linen', '亚麻'], ['red', '红']],
		must: ['头是黑色豺：窄吻、长尖耳', '耳内用金色；吻上有两道暗纹', '正面面具用 MaskFront（金面具 + 青金耳）', '跪秤时手扶秤杆、重量压在跪着的膝上'], dont: ['不要画成狐狸或狗（耳尖、吻长）', '不要画成棕色（头是黑）', '低吼时耳朵要后压，不能前立'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）', joints: '下颌绕嘴角后枢轴 0–44°；耳从根部弯折 −10°→26°；颈/头；其余标准骨架'},
	/* 13 Thoth */
	{n: 13, key: 'thoth', who: 'thoth', zh: '托特', role: '智慧之神', sub: '众神的书记官 · 朱鹮头 · 月冠', en: 'Thoth',
		main: {s: 19.5, pose: rest()}, focus: [1.6, -2.1], faceS: 36,
		poses: [{label: '站立', pose: rest()}, {label: '行走', pose: walk(1.1)}, {label: '书写（标志动作）', pose: POSES.write, o: {bProp: 'palette', fProp: 'pen'}}, {label: '跪 · 记录', pose: {...POSES.kneel, lean: 10, head: 6, fs: 40, fe: 40, fw: -10}, o: O_NONE}],
		stress: [{label: '手臂全抬', pose: S_RAISE, pivots: true}, {label: '大跨步', pose: S_STEP, pivots: true}, {label: '头后仰 + 喙张开', pose: S_BACK, o: {jaw: 1}, pivots: true}],
		faces: faces('ibis', {}, STAND, {...STAND, neck: -10, head: -22, lean: -3}), parts: [0, 0.5, 1].map((u, i) => ({label: ['喙 0°', '喙 20°', '喙 40°'][i], pose: STAND, o: {jaw: u}, look: {eyes: 0}} as Part)).concat([{label: '眼 半闭（专注）', pose: STAND, look: {eyes: 0.5}}]), partsTitle: '喙 / 眼睛部件',
		notes: [C('朱鹮头', '长而下弯的喙；头黑色', 'I13 · Louvre N 2609（dieu à tête d’ibis）', 'head', [3.0, -0.4]), C('月冠', '月轮（含新月）', 'I13 · Louvre N 2609（disque lunaire）', 'head', [0.3, -3.6]), C('书记员调色板', '长调色板 + 红黑墨池', 'I13 · Louvre N 2609（palette de scribe）', 'bH', [0.8, 0.8]),
			C('芦苇笔', '写字时握在前手', 'I13 · 系列设计（ep60 Pen）', 'fH', [0.3, 1.0]), C('皮肤', '赤陶红（Met 96.4.4 上为绿肤，未采用）', 'I13 注', 'torso', [0.9, -3.0]), C('蓝假发垂片', '垂片', 'cast60', 'head', [-1.2, 0.4])],
		pal: [['ibis', '朱鹮头'], ['ibis2', '头暗部'], ['skinM', '赤陶肤'], ['linen', '亚麻/调色板'], ['red', '红墨'], ['gold', '金/月'], ['blue', '青金'], ['wood', '芦苇笔']],
		must: ['长而下弯的朱鹮喙', '头顶月冠（盘 + 新月）', '写字时调色板在后手、笔在前手，手握住笔杆', '尖叫时喙大张、头后仰'], dont: ['不要画成鹤或鹭（喙要下弯）', '不要画成狒狒（那是他的另一形态，走 Baboon 组件）', '不要让笔悬在手外'],
		height: '神 = 凡人 × 1.00（男身：宽肩、V 形躯干、步幅大）', joints: '下喙绕嘴角（眼下）枢轴 0–40°；肩/肘/腕（写字）；颈/头'},
	/* 14 Sekhmet */
	{n: 14, key: 'sekhmet', who: 'sekhmet', zh: '塞赫迈特', role: '战争与瘟疫女神', sub: '拉的怒目 · 狮首红衣', en: 'Sekhmet', dark: true,
		main: {s: 19.5, pose: rest(), o: {dress: 'sheath'}}, focus: [1.0, -2.0], faceS: 34,
		poses: [{label: '站立', pose: rest(), o: {dress: 'sheath'}}, {label: '行走', pose: walkF(1.1), o: {dress: 'sheath'}}, {label: '怒吼（标志动作）', pose: {...P61.roar(1), neck: -10, head: -26, lean: -5}, o: {roar: 1.35, dress: 'sheath', look: {brow: -1, eyes: 0}}}, {label: '威吓 · 双臂展开', pose: {...P61.wide(), neck: -4, head: -12}, o: {roar: 0.7, dress: 'sheath', bProp: 'none', fProp: 'none'}}],
		stress: [{label: '手臂全抬', pose: S_RAISE, o: {dress: 'sheath'}, pivots: true}, {label: '大跨步', pose: S_STEP, o: {dress: 'sheath'}, pivots: true}, {label: '头后仰 + 大张口', pose: {...S_BACK, head: -30, neck: -14}, o: {roar: 1.4, dress: 'sheath'}, pivots: true}],
		faces: faces('lioness', {}, STAND, {...STAND, neck: -12, head: -28, lean: -4}), parts: parts4('jaw', STAND, (u) => (u < 1 ? {jaw: u} : {roar: 1}), ['下颌 0°', '下颌 25°', '怒吼 50°']).concat([{label: '眼 闭', pose: STAND, look: {eyes: 1}}]), partsTitle: '下颌 / 眼睛部件',
		notes: [C('狮首', '狮子头，坐像常见', 'I14 · Louvre N 1（déesse à tête de lionne）', 'head', [1.8, -0.9]), C('日轮 + 圣蛇', '头顶红日轮 + 圣蛇', 'I14 · Louvre N 1（disque solaire à uraeus）', 'head', [0.5, -3.6]), C('宽领', 'usekh 宽领', 'I14 · Louvre N 1', 'torso', [0.3, -6.3]),
			C('红色长裙', '红裙（设计选择：I14 标 unverified）', 'I14 · unverified', 'torso', [0.2, -1.2]), C('皮肤', '黄赭（女性惯例）', 'cast61 · sekhmet', 'torso', [0.9, -3.2])],
		pal: [['skinF', '女性肤'], ['lion', '狮头'], ['lion2', '狮头暗部'], ['red', '红裙/日轮'], ['gold', '金'], ['red2', '口腔'], ['white', '獠牙'], ['ink', '墨线']],
		must: ['怒吼要大：下颌张到 50°、上下獠牙和舌头清楚、头后仰、眉压低', '红色日轮 + 圣蛇、红裙', '与泰芙努特同脸，用裙色/名字牌区分'], dont: ['不要画笑脸（嘴形要是怒吼）', '不要画成猫头（吻宽、耳圆）', '日轮不要变金色'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）', joints: '下颌绕颊后枢轴 0–50°；耳；颈/头；肩肘腕；髋膝踝'},
	/* 15 Bastet */
	{n: 15, key: 'bastet', who: 'bastet', zh: '巴斯特', role: '家与欢乐之神', sub: '猫头女神 · 手摇叉铃', en: 'Bastet',
		main: {s: 19.5, pose: {...rest(), fs: 38, fe: 78, fw: -30}, o: {fProp: 'sistrum'}}, focus: [0.8, -2.0], faceS: 34,
		poses: [{label: '站立 · 持叉铃', pose: rest(), o: {fProp: 'sistrum'}}, {label: '行走', pose: walkF(1.1), o: {fProp: 'sistrum'}}, {label: '舔爪（标志动作）', pose: P61.lick(), o: {fProp: 'none', look: {eyes: 0.8}}}, {label: '摇叉铃', pose: P61.shake(0.3), o: {fProp: 'sistrum'}, dx: -22}],
		stress: [{label: '手臂全抬（摇铃）', pose: {...S_RAISE, fs: 150, fe: 20}, o: {fProp: 'none'}, pivots: true}, {label: '大跨步', pose: S_STEP, o: {fProp: 'sistrum'}, pivots: true}, {label: '头后仰', pose: S_BACK, o: {fProp: 'sistrum'}, pivots: true}],
		faces: faces('cat'), parts: parts4('ear', STAND, (u) => ({ear: u * 28 - 8}), ['耳 朝前', '耳 平', '耳 后压']).concat([{label: '眼 闭（舒服）', pose: STAND, look: {eyes: 0.9}}]), partsTitle: '耳朵 / 眼睛部件（下颌另见 FACECHECK61：说话 / 哈气 50°）',
		notes: [C('猫头', '站在女人身体上的猫头', 'I15 · Met 04.2.425', 'head', [1.6, -0.8]), C('叉铃', '手持叉铃（铃片会晃）', 'I15 · Met 04.2.425（sistrum）', 'fH', [0.3, 0.8]), C('篮子', '臂上挎篮（可选，basket 开关）', 'I15 · Met 04.2.425（basket）', 'bH', [0.3, 1.2]),
			C('长裙', '长而贴身的衣裙', 'I15 · Met 04.2.425（incised net）', 'torso', [0.2, -1.2]), C('皮肤', '黄赭（青铜原件无上色，设计选择）', 'I15 注', 'torso', [0.9, -3.2]), C('没有日轮', '她头上无日轮（和狮首女神区分）', 'I15', 'head', [0.3, -3.2])],
		pal: [['#A8957A', '猫头'], ['#7A6A54', '猫头暗'], ['skinF', '女性肤'], ['gold', '叉铃/金'], ['mat', '篮子'], ['red', '裙'], ['linen', '亚麻'], ['ink', '墨线']],
		must: ['猫头：高尖耳、短吻、小三角鼻、胡须长在吻垫上（不出轮廓）', '叉铃握在拳里，铃片在摇时晃动', '舔爪时前臂抬到嘴边'], dont: ['不要画成狮头（耳尖、吻细）', '不要戴日轮', '不要让叉铃悬在手外'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）', joints: '耳从根部弯折 −8°→26°；下颌 0–50°；肩肘腕（舔爪/摇铃）；颈/头'},
	/* 16 Ma'at */
	{n: 16, key: 'maat', who: 'maat', zh: '玛阿特', role: '真理与秩序之神', sub: '头顶一根羽毛 · 张开的翅膀', en: "Ma'at",
		main: {s: 19.5, pose: rest(), o: {wings: true}}, focus: [0.4, -2.9], faceS: 34,
		poses: [{label: '站立 · 翅收拢', pose: {...POSES.rest, bs: 6, be: 8, fs: 10, fe: 8}, o: {wings: true, bProp: 'none', fProp: 'none'}}, {label: '行走', pose: walk(1.1, {arm: 0.6}), o: {wings: true, bProp: 'none', fProp: 'none'}}, {label: '展翼 · 守护（标志动作）', pose: P61.wide(), o: {wings: true, t: 0.9, bProp: 'none', fProp: 'none'}}, {label: '手持羽毛（秤上同款）', pose: {...rest(), fs: 24, fe: 60, fw: -10}, o: {wings: true, fProp: 'none', feather: true}}],
		stress: [{label: '翅全展', pose: {...POSES.protect, bs: 118, fs: 150}, o: {wings: true, t: 0.5, bProp: 'none', fProp: 'none'}, pivots: true}, {label: '大跨步', pose: {...S_STEP, bs: -20}, o: {wings: true}, pivots: true}, {label: '头后仰 · 翅半展', pose: {...WINGS_HALF, neck: -12, head: -22, lean: -6}, o: {wings: true}, pivots: true}],
		faces: faces('human'), parts: [{label: '翅 收拢', pose: WINGS_DOWN, fig: true, o: {wings: true}, s: 7.4}, {label: '翅 半展', pose: WINGS_HALF, fig: true, o: {wings: true, t: 0.4}, s: 7.4}, {label: '翅 全展', pose: WINGS_UP, fig: true, o: {wings: true, t: 0.9}, s: 7.4}, {label: '眼 半闭', pose: STAND, look: {eyes: 0.5}}], partsTitle: '翅膀关节（翅膀骨 = 手臂骨）',
		notes: [C('鸵鸟羽毛', '头顶一根羽毛', 'I16 · Louvre E 4436（plume d’autruche）', 'head', [0.4, -4.2]), C('翅膀', '“保护”：带翼的双臂', 'I16 · Louvre N 665（winged arms）', 'fU', [0.6, 2.5]), C('三段假发', '三段式假发', 'I16 · 记录：tripartite wig', 'head', [-1.2, -1.0]),
			C('紧身长裙', '长裙 + 宽领', 'cast61 · maat', 'torso', [0.2, -1.2]), C('皮肤', '黄赭（I16：无已核实上色）', 'I16 注', 'torso', [0.9, -3.2])],
		pal: [['skinF', '女性肤'], ['white', '羽毛'], ['blue', '羽根/翅蓝'], ['red', '裙'], ['gold', '金'], ['wig', '假发'], ['green', '翅绿'], ['ink', '墨线']],
		must: ['头顶一根白色羽毛，羽根有蓝带', '展翼时翅膀由手臂带出', '秤上用同一根羽毛（Feather 组件）'], dont: ['不要给她两根羽毛', '不要把羽毛画成鸟羽（是鸵鸟羽、窄而直）', '不要给翅膀画成一整块'],
		height: '女神 = 凡人 × 0.94（女身：窄肩 ≈ 男神 80%、细腰、步幅小）；秤上羽毛 = 3.2 格', joints: '翅膀 = 手臂骨；肩肘腕；颈/头'},
	/* 17 Ammit */
	{n: 17, key: 'ammit', who: 'anubis', zh: '阿米特', role: '吞噬者', sub: '鳄鱼头 · 狮身 · 河马后半身', en: 'Ammit (Ammit61)',
		main: {s: 19.5, custom: AmmitMain},
		poses: [{label: '站立 · 闭口', custom: AmmitCell({jaw: 5, neck: 0, lean: 0}, 11.6)}, {label: '低头 · 嗅', custom: AmmitCell({jaw: 8, neck: 14, lean: 3}, 11.6)}, {label: '怒吼（标志动作）', custom: AmmitCell({jaw: 5, neck: 0, lean: 0, roar: 1}, 11.6)}, {label: '抬爪', custom: AmmitCell({jaw: 12, neck: -4, lean: 2, paw: 2.2}, 11.6)}],
		stress: [{label: '头后仰 + 大口', custom: AmmitCell({jaw: 5, neck: -10, lean: 0, roar: 1}, 15.5)}, {label: '前扑 · 躯干前倾', custom: AmmitCell({jaw: 20, neck: 12, lean: 8}, 15.5)}, {label: '后坐 · 尾甩', custom: AmmitCell({jaw: 5, neck: -6, lean: -8, tail: 20}, 15.5)}],
		focus: [0, 0], faces: [], parts: [], partsTitle: '',
		notes: [C('鳄鱼头', '前部是鳄鱼头：长吻、金眼、背脊鳞', 'F34 · BM EA10470/3（head of a crocodile）', undefined, undefined, [560, 476]), C('狮子前身', '狮的前身：金色，带鬃毛', 'F34 · BM EA10470/3（forepart of a lion）', undefined, undefined, [448, 520]), C('河马后身', '后半身是河马：红褐', 'F34 · BM EA10470/3（hindquarters of a hippo）', undefined, undefined, [270, 560]), {...C('与阿尼同框', '在 ep60 称重厅：阿米特 s=34，阿尼 s=26', 'ep60 · act60b_weigh（镜 33）', undefined, undefined, [118, 220]), side: 'R'}], pal: [['croc', '鳄鱼头'], ['croc2', '鳄头暗'], ['lion', '狮身'], ['hippo', '河马后身'], ['hippo2', '后身暗'], ['red', '口腔'], ['white', '牙'], ['ink', '墨线']],
		must: ['前半鳄鱼头、中段狮身、后段河马', '怒吼：下颌 46°、颈后仰、背鬃竖起', '体形比人小，趴在秤座旁'], dont: ['不要画成真鳄鱼（有鬃毛、狮前肢）', '不要把口画成笑', '不要让下颌和身体错位'],
		height: '非人形，单独的小骨架；称重厅里 Ammit s = 34，阿尼 s = 26（≈ ×1.3）', joints: '下颌绕后枢轴 5–46°（口腔填满到吻尖，牙只在口内）；眼睑；眉；颈绕肩前枢轴；尾；前肢（抬爪）'},
	/* 18 Ani */
	{n: 18, key: 'ani', who: 'ani', zh: '阿尼 · 亡者', role: '本系列的主角', sub: '一个普通的书吏 · 他的心将被称重', en: 'Ani, the deceased',
		main: {s: 19.5, pose: {...POSES.rest, fs: 6, fe: 12, bs: -3, be: 6}, o: {}}, focus: [0.3, -1.7], faceS: 34,
		poses: [{label: '站立', pose: {...POSES.rest, fs: 6, fe: 12, fw: -6}}, {label: '行走', pose: ANI_POSES.walk(1.0)}, {label: '被审判 · 低头（标志动作）', pose: ANI_POSES.judged(0.5)}, {label: '跪 · 双手上举', pose: ANI_POSES.kneel(0.3)}],
		stress: [{label: '双臂全抬', pose: ANI_POSES.raise(0.2, 1), pivots: true}, {label: '大跨步', pose: {...S_STEP, fs: 20, fe: 20, bs: -20}, pivots: true}, {label: '弯腰收割', pose: ANI_POSES.harvest(1.6), pivots: true}],
		faces: faces('human'), parts: [0, 0.5, 1].map((u, i) => ({label: ['眼 睁', '眼 半闭', '眼 闭'][i], pose: STAND, look: {eyes: u}} as Part)).concat([{label: '眼 看前', pose: STAND, look: {look: 1, eyes: 0}}]), partsTitle: '眼睛部件',
		notes: [C('双层假发', '黑色双层短假发 + 红发带', 'cast60 · CAST.ani（ep60）', 'head', [-0.5, -1.2]), C('亚麻长袍', '透明亚麻褶袍到小腿', 'cast60 · robe', 'torso', [0.3, -1.0]), C('素领', '五排素领（无垂饰）', 'cast60 · plain collar', 'torso', [0, -6.0]),
			C('皮肤', '赤陶红（男性惯例）', 'cast60 · skinM', 'torso', [0.9, -3.0]), C('平摊手', '手掌展开（palm），无指甲', 'cast60', 'fH', [0.3, 1.0])],
		pal: [['skinM', '赤陶肤'], ['skinM2', '肤暗部'], ['wigH', '黑发'], ['linen', '亚麻'], ['gold', '金'], ['blue', '青金'], ['red', '红带'], ['ink', '墨线']],
		must: ['阿尼 = 全系列唯一的凡人参照；男神与他同高（男身），女神 ×0.94', '双层黑假发 + 红发带、透明亚麻长袍', '手掌平摊，不握物'], dont: ['不要给他神的宽领、冠或兽尾', '不要把他画得比神矮小（同一骨架）', '不要画指甲'],
		height: '凡人 = 1.00（19 格：脚底到头顶）', joints: '标准骨架全部关节；跪姿、弯腰姿态由 cast60 提供'},
];
/** the 17 + line-up + props sheets: frame index = n - 1 (line-up is 1, props is 19) */
export const SHEET_COUNT = 19;
export {O_NONE, wristTo, lerp, PAL};
