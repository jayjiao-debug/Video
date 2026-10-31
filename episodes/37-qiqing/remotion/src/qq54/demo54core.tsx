import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, Subs, SANS, SERIF, seg, cl} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Stamp53} from '../qq53/parts53';
import {TitleArt} from './title54';
/* ep54 · the look-B DEMO on the owner's BGM slowed to 0.9127× (A minor): part 1 = the film's opening 0–36.51 s (section A, the hard
   beat, cards 1–9 and the title); a 1 s slate; part 2 = 1:24.32–1:48.22 (the break, the drop on 1:40.26, cards 22–27).
   Every scene is a React.FC<{t: number}> where t is FILM time in seconds (the script's clock, episodes/54-caocao/script.md).
   Bars: downbeat of bar n = 0.654 + 1.99203·n s. */
export const BAR = (n: number) => 0.654 + 1.99203 * n;
export const DROP = BAR(50);                       // 100.256
export const P1_END = BAR(18), P2_A = BAR(42), P2_B = BAR(54), SLATE = 1.0;
export const DEMO_LEN = P1_END + SLATE + (P2_B - P2_A);   // ≈ 61.4 s
/** demo time → film time (null on the slate) */
export const filmT = (d: number): number | null => d < P1_END ? d : d < P1_END + SLATE ? null : P2_A + (d - P1_END - SLATE);

export type Card = {a: number; b: number; rows: string[]; y?: string; place?: string; note?: string; age?: number};
/** the script's cards in the demo (two bars each; times = film time) */
export const CARDS: Card[] = [
	{a: 0, b: BAR(2), rows: ['20岁当官，', '他打死了[皇帝红人]的叔叔。'], y: '174', place: '洛阳', note: '洛阳北部尉', age: 20},
	{a: BAR(2), b: BAR(4), rows: ['门口挂五色棒：', '犯禁者，一律打死。'], y: '174', place: '洛阳', note: '洛阳北部尉', age: 20},
	{a: BAR(4), b: BAR(6), rows: ['整个洛阳，', '再没人敢犯禁。'], y: '174', place: '洛阳', note: '京师敛迹', age: 20},
	{a: BAR(8), b: BAR(10), rows: ['30岁，黄巾四起，', '天下大乱。'], y: '184', place: '颍川', note: '骑都尉 讨黄巾', age: 30},
	{a: BAR(10), b: BAR(12), rows: ['35岁，董卓进京，', '废了皇帝，独揽朝政。'], y: '189', place: '洛阳', note: '董卓废立', age: 35},
	{a: BAR(12), b: BAR(14), rows: ['董卓要拉拢他。', '他改名换姓，抄小路东逃。'], y: '189', place: '洛阳', note: '变易姓名，间行东归', age: 35},
	{a: BAR(14), b: BAR(16), rows: ['逃亡路上，', '他在吕伯奢家，杀了人。'], y: '189', place: '成皋', note: '各书说法不一', age: 35},
	{a: BAR(16), b: BAR(18), rows: ['留下一句：', '“[宁我负人，毋人负我]。”'], y: '189', place: '成皋', note: '孙盛《杂记》', age: 35},
	{a: BAR(18), b: BAR(20), rows: ['36岁，他率军西进讨董卓。', '第一仗，惨败。'], y: '190', place: '荥阳', note: '汴水遇徐荣', age: 36},
	{a: BAR(20), b: BAR(22), rows: ['中了箭，马也伤了，', '追兵就在身后。'], y: '190', place: '荥阳', note: '为流矢所中', age: 36},
	{a: BAR(22), b: BAR(24), rows: ['堂弟曹洪让出马：', '“天下可无洪，不可无君。”'], y: '190', place: '荥阳', note: '《三国志·曹洪传》', age: 36},
	{a: BAR(24), b: BAR(26), rows: ['那些年，他写下：', '“[白骨露于野]，千里无鸡鸣。”'], y: '197年后', place: '关东', note: '曹操《蒿里行》'},
	{a: BAR(26), b: BAR(28), rows: ['42岁，', '他把天子接到了许都。'], y: '196', place: '许', note: '迎天子都许', age: 42},
	{a: BAR(28), b: BAR(30), rows: ['从此——', '[挟天子以令诸侯]。'], y: '196', place: '许', note: '毛玠：奉天子以令不臣', age: 42},
	{a: BAR(30), b: BAR(32), rows: ['这招，袁绍的谋士早提过。', '袁绍没听。'], y: '196', place: '邺', note: '沮授 ·《献帝传》', age: 42},
	{a: BAR(32), b: BAR(34), rows: ['他招募百姓屯田，', '一年收粮百万斛。'], y: '196', place: '许', note: '募民屯田许下', age: 42},
	{a: BAR(34), b: BAR(36), rows: ['44岁，水淹下邳，', '吕布被擒。'], y: '198', place: '下邳', note: '白门楼', age: 44},
	{a: BAR(36), b: BAR(38), rows: ['北方最大的对手——', '袁绍。'], y: '199', place: '邺', note: '袁绍并公孙瓒', age: 45},
	{a: BAR(38), b: BAR(40), rows: ['四州之地，', '兵[十余万]。'], y: '199', place: '河北', note: '冀青幽并四州', age: 45},
	{a: BAR(40), b: BAR(42), rows: ['46岁，', '两军对峙官渡。'], y: '200', place: '官渡', note: '建安五年', age: 46},
	{a: BAR(42), b: BAR(44), rows: ['他的兵，[不满一万]。', '粮，快吃完了。'], y: '200', place: '官渡', note: '《三国志》原文', age: 46},
	{a: BAR(44), b: BAR(46), rows: ['他写信给荀彧：', '想退了。'], y: '200', place: '官渡', note: '议欲还许', age: 46},
	{a: BAR(46), b: BAR(48), rows: ['荀彧回信：', '“此用奇之时，不可失也。”'], y: '200', place: '官渡', note: '《三国志·荀彧传》', age: 46},
	{a: BAR(48), b: BAR(50), rows: ['袁绍谋士许攸来投：', '粮，在乌巢。'], y: '200', place: '官渡', note: '许攸来奔', age: 46},
	{a: BAR(50), b: BAR(52), rows: ['他亲率五千人，', '[夜袭乌巢]！'], y: '200', place: '乌巢', note: '步骑五千人夜往', age: 46},
	{a: BAR(52), b: BAR(54), rows: ['一把火，烧光袁军的粮。', '袁军，全线崩溃。'], y: '200', place: '乌巢', note: '尽燔其粮谷', age: 46},
	{a: BAR(54), b: BAR(56), rows: ['53岁，北方已定。', '“[老骥伏枥]，志在千里。”'], y: '207', place: '碣石', note: '曹操《龟虽寿》', age: 53},
	{a: BAR(56), b: BAR(58), rows: ['54岁，赤壁一把火，', '这一回，烧的是他的船。'], y: '208', place: '赤壁', note: '孙刘联军火攻', age: 54},
	{a: BAR(58), b: BAR(60), rows: ['劝他称帝，他只说：', '“吾为[周文王]矣。”'], y: '219', note: '意即：帝位留给儿子', age: 65},
	{a: BAR(60), b: BAR(62), rows: ['66岁，他死在洛阳。', '遗令：[无藏金玉珍宝]。'], y: '220', place: '洛阳', note: '敛以时服', age: 66},
];
/** the dead stop of the music = the end card (EndCard draws its own furniture; no overlay from here) */
export const END_T = 124.088, FILM_LEN = END_T + 6.0;   // the dead stop of the slowed track (113.255 s / 0.9127)
export const TITLE_A = BAR(6), TITLE_B = BAR(8);
const CPS = 16;                                    // typing speed, characters per second
const plain = (s: string) => s.replace(/[[\]]/g, '');

const Scrim: React.FC = () => { const m = 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 28%, #000 72%, rgba(0,0,0,0) 100%)';
	return <div style={{position: 'absolute', left: 0, top: 40, width: 1150, height: 290, background: 'linear-gradient(90deg, rgba(18,9,6,0.5) 0%, rgba(18,9,6,0.42) 35%, rgba(18,9,6,0.16) 72%, rgba(18,9,6,0) 100%)', WebkitMaskImage: m, maskImage: m}} />; };
const Counter: React.FC<{age: number}> = ({age}) => <div style={{position: 'absolute', left: 150, bottom: 70, color: '#FFF6E6', fontFamily: SANS, textShadow: thB.halo, display: 'flex', alignItems: 'baseline', gap: 10}}>
	<span style={{fontSize: 34, fontWeight: 700}}>曹操</span><span style={{fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>{age}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>;
/** the overlay at film time t: subtitle (typing, rows stack), stamp (after the subtitle has typed), counter, seal, the title */
export const Overlay: React.FC<{t: number}> = ({t}) => { const c = CARDS.find((k) => t >= k.a && t < k.b), title = t >= TITLE_A && t < TITLE_B;
	if (t >= END_T) return null;
	if (title) return <><TitleArt t={t} /><SealHollow /></>;
	if (!c) return <SealHollow />;
	const r0 = plain(c.rows[0]).length, typed = c.a === 0 ? 1e9 : (t - c.a) * CPS,   /* card 1 is on screen whole from frame 0 (the 5-second rule) */ n = [Math.min(r0, typed), Math.max(0, typed - r0)];
	const stampOn = typed > plain(c.rows.join('')).length + 6;
	return <>
		<Scrim /><Subs rows={c.rows.map((s, i) => ({s, n: n[i] ?? 0}))} th={thB} />
		{stampOn && c.y && <Stamp53 y={c.y} place={c.place} note={c.note} />}
		{c.age && <Counter age={c.age} />}<SealHollow />
	</>; };
/** one demo frame: the scene that owns film time t, the overlay; the slate between the two parts */
export type Scene = {a: number; b: number; C: React.FC<{t: number}>};
export const DemoFrame: React.FC<{d: number; scenes: Scene[]}> = ({d, scenes}) => { const t = filmT(d);
	if (t === null) return <AbsoluteFill style={{background: '#0B0807', color: '#F2E6CC', fontFamily: SANS, fontSize: 44, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>…… 1:24 · 官渡 ……</AbsoluteFill>;
	const s = scenes.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
void H;
