import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Stamp53} from '../qq53/parts53';
import {Scrim, Counter, Label} from './look54frame';
import {K1, K7} from './scenes54bm';
import {K4, K5, K6, K8} from './scenes54bs';
/* ep54 · look B (铜灯影 · 主角刻画) key scenes. KFB54: frame i = KS[i] (stills, the overlay on top, a label band at the top).
   MOT54: the motion test, 6 s of card 7 (0:24.6 「董卓要拉拢他。/ 他改名换姓，连夜出逃。」), the scene gets its own clock t (s). */
type KS = {id: string; time: string; rows: string[]; y: string; place: string; note: string; age: number; d: string; C: React.FC};
const KS: KS[] = [
	{id: 'K1', time: '0:00', rows: ['20岁当官，', '他打死了[皇帝红人]的叔叔。'], y: '174', place: '洛阳', note: '洛阳北部尉', age: 20, d: '北部尉门前，五色棒举起；蹇硕叔父被按住', C: K1},
	{id: 'K7', time: '0:24.6', rows: ['董卓要拉拢他。', '他改名换姓，连夜出逃。'], y: '189', place: '洛阳', note: '变易姓名，间行东归', age: 35, d: '夜出洛阳城门，便服低头而行', C: K7},
	{id: 'K4', time: '0:52.4', rows: ['42岁，', '他把天子接到了许都。'], y: '196', place: '许', note: '迎天子都许', age: 42, d: '许都宫门，天子车驾入城，曹操迎于道旁', C: K4},
	{id: 'K5', time: '1:24.3', rows: ['他的兵，[不满一万]。', '粮，快吃完了。'], y: '200', place: '官渡', note: '《三国志》原文', age: 46, d: '官渡营栅：对面土山高橹，营中霹雳车，粮袋将尽', C: K5},
	{id: 'K6', time: '1:40.2', rows: ['深夜，袁绍谋士许攸来投：', '粮，在乌巢。'], y: '200', place: '官渡 → 乌巢', note: '许攸来奔', age: 46, d: '交接帧：五千人举火出营，远方乌巢粮囷（视频AI从这里开始）', C: K6},
	{id: 'K8', time: '2:00.2', rows: ['66岁，他死在洛阳。', '遗令：[无藏金玉珍宝]。'], y: '220', place: '洛阳', note: '敛以时服', age: 66, d: '洛阳宫中，一盏灯，老年曹操独坐', C: K8},
];
const Over: React.FC<{k: KS}> = ({k}) => <>
	<Scrim /><Subs rows={k.rows.map((s) => ({s, n: 1e9}))} th={thB} />
	<Stamp53 y={k.y} place={k.place} note={k.note} /><Counter age={k.age} /><SealHollow />
</>;
const Still: React.FC = () => { const f = useCurrentFrame(), k = KS[Math.min(KS.length - 1, f)];
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><k.C /><Over k={k} /><Label s={`look B · ${k.id} · ${k.time} · ${k.d}`} /></AbsoluteFill>; };
const Mot: React.FC = () => { const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><K7 t={f / 30} /><Over k={KS[1]} /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KFB54" component={Still} width={W} height={H} fps={30} durationInFrames={KS.length} />
	<Composition id="MOT54" component={Mot} width={W} height={H} fps={30} durationInFrames={180} />
</>;
registerRoot(Root);
