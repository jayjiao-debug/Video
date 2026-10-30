import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs, SANS} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
import {SubsCentre, SealHollow, cq} from '../qq51/master51';
import {Stamp53} from './parts53';
import {KFG1, KFG2, KFG3, KFG4, KFG5, KFG6, KFG7, KFG8} from './kfG53';
import {KFS_H} from './kfH53';
/* ep53 v3 · storyboard key frames (one per leg, the 勾践 thread one per line). KFV3 renders frame i = KFV3S[i].
   Lines and stamps verbatim from episodes/53-goujian/lines_v3_draft.json + stamps_v3_draft.json (provisional seconds; the
   music re-cut moves them ±0.5 s). Each frame: the picture, the v3 subtitle (layout D, rows full), the v3 stamp, the hollow
   seal, and a croppable label band at the very top (y 0–44, outside the phone-safe area): `<time> · <leg> · <picture>`.
   Storyboard: episodes/53-goujian/storyboard_v3.md. */
export type L3 = [number, number, string, string];
export const LINES_V3: L3[] = [
	[0.0, 5.5, '你家菜刀，沾水不擦就会锈。\n这把剑埋了两千多年，还是[亮]的。', 'N'],
	[5.5, 9.5, '它的主人，是卧薪尝胆的越王勾践。', 'N'],
	[11.75, 16.25, '如今它在湖北省博物馆，\n有一间自己的独立展厅。', 'N'],
	[16.25, 20.75, '有一种流传很广的说法：\n它表面[镀了铬]，所以不锈。', 'N'],
	[20.75, 23.75, '是不是真的？先回到它出土那天。', 'N'],
	[23.75, 28.0, '1965年冬，湖北江陵修水渠，\n挖到一座[10.8米]深的楚墓。', 'N'],
	[28.0, 32.0, '夯土和白膏泥层层封住，\n两千多年，从没被盗过。', 'N'],
	[32.0, 36.5, '打开木椁和两层棺，\n墓主人左边，一把剑插在黑漆鞘里。', 'N'],
	[36.5, 40.5, '洗净剑鞘，拔出来：\n寒光闪闪。', 'N'],
	[40.5, 45.0, '越王鸠浅，自作用剑。\n{越王"鸠浅"，为自己做的剑}', 'Q'],
	[45.0, 49.5, '十几位学者，写了40多封信，\n才认定：鸠浅，就是勾践。', 'N'],
	[49.5, 54.0, '前494年，吴王夫差大败越军，\n勾践只剩五千兵，被围在会稽山。', 'N'],
	[54.0, 58.25, '他派人跪着求和：\n我做您的奴仆，妻子做您的婢女。', 'N'],
	[58.25, 62.75, '吴王答应了。伍子胥退下后说：\n"二十年后，吴国将变成沼泽！"', 'N'],
	[62.75, 66.75, '他去吴国服侍夫差三年，\n亲自在马前开路。', 'N'],
	[66.75, 71.0, '回国后，他在座旁放了一只苦胆，\n吃饭时，也要[尝]一口。', 'N'],
	[71.0, 74.25, '他问自己：\n"你忘了会稽之耻吗？"', 'N'],
	[74.25, 78.75, '前473年，勾践灭了吴国，\n夫差自尽。伍子胥的话，[应验了]。', 'N'],
	[78.75, 82.75, '吴国没了，勾践也死了。\n他为自己做的剑，还亮着。', 'N'],
	[82.75, 87.75, '1977年拍科教片，拿它试过：\n30多张纸，一下划破20多张。', 'N'],
	[87.75, 92.25, '博物馆的解释，先说[料好]：\n铜质好，杂质少，铅几乎为零。', 'N'],
	[92.25, 96.75, '镀铬？博物馆研究了7年多：\n剑身的菱形花纹，是热镀[锡]。', 'N'],
	[96.75, 100.5, '那它，到底为什么不锈？', 'N'],
	[101.25, 104.0, '其实，它也[锈]了。', 'N'],
	[104.0, 107.75, '只是锈得很轻，\n轻到人眼几乎看不出来。', 'N'],
	[107.75, 112.0, '保住它的，不是什么秘方，\n主要是那座[墓]。', 'N'],
	[112.0, 115.75, '证据：同一座墓里的其他剑，\n也几乎没锈。', 'N'],
	[115.75, 120.25, '剑鞘、两层棺、木椁、白膏泥，\n一层层，把空气隔绝在外。', 'N'],
	[120.25, 123.75, '出了墓，再好的保管，\n也挡不住它慢慢[变暗]。', 'N'],
	[123.75, 128.5, '它不是不会锈，\n是那座墓，替它挡了[两千多年]。', 'N'],
	[129.25, 133.25, '你第一次见到它，是在哪？', 'N'],
];
type St = {y: string; place: string; note: string};
const STAMPS_RAW: St[] = [
	{y: '2026', place: '你家厨房', note: '一把普通的菜刀'}, {y: '春秋末年', place: '越国', note: '长55.6厘米 · 重875克'},
	{y: '2026', place: '湖北省博物馆', note: '南馆二楼 独立展厅'}, {y: '2026', place: '湖北省博物馆', note: '一种说法'},
	{y: '2026 → 1965', place: '', note: '回到出土那天'}, {y: '1965', place: '湖北江陵', note: '望山1号墓'},
	{y: '1965', place: '望山1号墓', note: '夯土·青灰泥·白膏泥'}, {y: '1965', place: '望山1号墓', note: '内棺 · 人骨架左侧'},
	{y: '1965年12月', place: '江陵', note: '洗净剑鞘，拔剑'}, {y: '约2500年前', place: '越国', note: '剑上自己写着主人'},
	{y: '1966', place: '书信往来', note: '唐兰读出，郭沫若认同'}, {y: '前494年', place: '夫椒 · 会稽山', note: '夫差为父报仇'},
	{y: '前494年', place: '会稽山', note: '请为臣，妻为妾'}, {y: '前494年', place: '会稽山', note: '《左传》：吴其为沼'},
	{y: '前494年后', place: '吴国', note: '《国语》：在吴三年'}, {y: '约前490年', place: '越国', note: '《史记》：置胆于坐'},
	{y: '〃', place: '〃', note: '〃'}, {y: '前473年', place: '吴国', note: '距会稽之围21年'},
	{y: '前473年后', place: '越国', note: '剑比主人活得久'}, {y: '1977', place: '科教片《古剑》', note: '据亲历者陈振裕'},
	{y: '湖北省博物馆', place: '', note: '据博物馆 江旭东'}, {y: '2017–2025', place: '湖北省博物馆', note: '7年多无损检测'},
	{y: '〃', place: '〃', note: '〃'}, {y: '1965', place: '出土时', note: '据研究员后德俊'},
	{y: '1965', place: '出土时', note: '锈蚀"十分轻微"'}, {y: '战国中期', place: '望山1号墓', note: '据后德俊 · 主要是环境'},
	{y: '战国中期', place: '望山1号墓', note: '据文保中心江旭东'}, {y: '战国中期', place: '望山1号墓', note: '层层隔绝空气'},
	{y: '1965 → 2026', place: '湖北省博物馆', note: '据后德俊 · 渐失光泽'}, {y: '2026', place: '今天', note: '本片归纳'},
];
/** 〃 = the stamp above, held */
export const STAMPS_V3: St[] = STAMPS_RAW.reduce<St[]>((acc, s, i) => { acc.push(s.y === '〃' ? acc[i - 1] : s); return acc; }, []);
export const lineV3At = (t: number) => LINES_V3.findIndex(([a, b]) => t >= a && t < b);

const splitQ = (s: string) => { const m = s.match(/^([\s\S]*?)\{([^}]*)\}\s*$/); const main = m ? m[1].replace(/\n$/, '') : s; return {rows: main.split('\n'), gloss: m ? m[2] : ''}; };
const Scrim: React.FC = () => { const m = 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 28%, #000 72%, rgba(0,0,0,0) 100%)';
	return <div style={{position: 'absolute', left: 0, top: 40, width: 1150, height: 290, background: 'linear-gradient(90deg, rgba(18,9,6,0.5) 0%, rgba(18,9,6,0.42) 35%, rgba(18,9,6,0.16) 72%, rgba(18,9,6,0) 100%)', WebkitMaskImage: m, maskImage: m}} />; };
/** the v3 overlay at film time t: subtitle (full rows), stamp (hidden on the title and the end card), seal */
export const OverV3: React.FC<{t: number; stamp?: boolean; seal?: boolean}> = ({t, stamp = true, seal = true}) => { const i = lineV3At(t), title = t >= 9.5 && t < 11.75, card = t >= 129.25;
	const L = i >= 0 && !card ? LINES_V3[i] : null, sp = L ? splitQ(cq(L[2])) : null;
	return <>
		{L && sp && (L[3] === 'Q' ? <SubsCentre rows={sp.rows} gloss={sp.gloss} q n={sp.rows.map(() => 1e9)} /> : <><Scrim /><Subs rows={sp.rows.map((s) => ({s, n: 1e9}))} th={thB} /></>)}
		{stamp && i >= 0 && i < STAMPS_V3.length && !title && !card && <div style={{position: 'absolute', right: 60, top: 30, width: 760, height: 200, background: 'radial-gradient(closest-side, rgba(14,7,4,0.55), rgba(14,7,4,0.35) 60%, rgba(14,7,4,0))'}} />}
		{stamp && i >= 0 && i < STAMPS_V3.length && !title && !card && <Stamp53 y={STAMPS_V3[i].y} place={STAMPS_V3[i].place || undefined} note={STAMPS_V3[i].note} />}
		{seal && !card && <SealHollow />}
	</>; };

/** the croppable label band */
const Label: React.FC<{s: string}> = ({s}) => <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 44, background: 'rgba(0,0,0,0.78)', color: '#F2E6CC', fontFamily: SANS, fontWeight: 700, fontSize: 24, lineHeight: '44px', paddingLeft: 18, whiteSpace: 'nowrap', overflow: 'hidden'}}>{s}</div>;

/** a key frame: [label, film time, picture, overlay options] */
export type KFV = {t: number; leg: string; d: string; C: React.FC; stamp?: boolean; over?: boolean};
const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const KFS_G: KFV[] = [
	{t: 50.5, leg: '13 G1 · NEW', d: '镜中皮影：会稽山，败军上山，吴军的戈围住山脚；右侧铭文仍在', C: KFG1},
	{t: 55.0, leg: '13 G2 · NEW', d: '镜中：使者跪地顿首，夫差坐于台上屏前；身后勾践与妻低头', C: KFG2},
	{t: 59.5, leg: '13 G3 · NEW', d: '镜中：伍子胥转身离去，吴宫沉入水中（吴其为沼）', C: KFG3},
	{t: 63.75, leg: '13 G4 · NEW', d: '镜中：勾践步行牵马，夫差立于车上伞盖下（车马，不骑马）', C: KFG4},
	{t: 69.0, leg: '13 G5 · NEW', d: '镜中：独坐席上，低案上一只豆，座旁悬胆；[尝]时举胆至口，火光暗一档', C: KFG5},
	{t: 72.0, leg: '13 G6 · NEW', d: '推近同一格：他静坐，身后会稽山与戈阵淡淡浮现，如记忆', C: KFG6},
	{t: 76.5, leg: '13 G7 · NEW', d: '镜中：越军成列推进，吴宫没顶；夫差只以落地的冠与剑示意', C: KFG7},
	{t: 80.5, leg: '13 G8 · NEW', d: '倒影散去，剑身复归明亮；镜头滑到近剑尖处，接B1的90°翻转', C: KFG8},
];
export const KFV3S: KFV[] = [...KFS_H.filter((k) => k.t < 49.5), ...KFS_G, ...KFS_H.filter((k) => k.t >= 49.5)];
const Frame: React.FC<{k: KFV}> = ({k}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
	<k.C />{k.over !== false && <OverV3 t={k.t} stamp={k.stamp !== false} />}<Label s={`${fmt(k.t)} · ${k.leg} · ${k.d}`} /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(); return <Frame k={KFV3S[Math.min(KFV3S.length - 1, f)]} />; };
const Root: React.FC = () => <Composition id="KFV3" component={All} width={W} height={H} fps={30} durationInFrames={KFV3S.length} />;
registerRoot(Root);
void H;
