import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, Subs, SANS} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Stamp53} from '../qq53/parts53';
/* ep54 曹操 · look tests: three code-drawn looks, three style frames each (the same three beats), the overlay on top.
   Frame i = FR[i]. Beats: 1 = card 1 (0:00, the hook: 20岁, 洛阳北部尉, 五色棒), 2 = card 22 (1:24, 官渡: 不满一万 vs 十余万),
   3 = the drop (1:40.3): the code world hands over to the AI-painted layered shot (the only AI picture in the film). */
type Beat = {rows: string[]; y: string; place: string; note: string; age: number};
export const BEATS: Beat[] = [
	{rows: ['20岁当官，', '他打死了[皇帝红人]的叔叔。'], y: '174', place: '洛阳', note: '洛阳北部尉', age: 20},
	{rows: ['他的兵，[不满一万]。', '粮，快吃完了。'], y: '200', place: '官渡', note: '《三国志》原文', age: 46},
	{rows: ['他亲率五千人，', '[夜袭乌巢]！'], y: '200', place: '乌巢', note: '夜袭', age: 46},
];
const Scrim: React.FC = () => { const m = 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 28%, #000 72%, rgba(0,0,0,0) 100%)';
	return <div style={{position: 'absolute', left: 0, top: 40, width: 1150, height: 290, background: 'linear-gradient(90deg, rgba(18,9,6,0.5) 0%, rgba(18,9,6,0.42) 35%, rgba(18,9,6,0.16) 72%, rgba(18,9,6,0) 100%)', WebkitMaskImage: m, maskImage: m}} />; };
const Counter: React.FC<{age: number}> = ({age}) => <div style={{position: 'absolute', left: 150, bottom: 70, color: '#FFF6E6', fontFamily: SANS, textShadow: thB.halo, display: 'flex', alignItems: 'baseline', gap: 10}}>
	<span style={{fontSize: 34, fontWeight: 700}}>曹操</span><span style={{fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>{age}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>;
const Label: React.FC<{s: string}> = ({s}) => <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 44, background: 'rgba(0,0,0,0.78)', color: '#F2E6CC', fontFamily: SANS, fontWeight: 700, fontSize: 24, lineHeight: '44px', paddingLeft: 18}}>{s}</div>;
export type FrameSpec = {name: string; k: number; C: React.FC};
export const LookFrame: React.FC<{f: FrameSpec}> = ({f}) => { const b = BEATS[f.k - 1];
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
		<f.C />
		<Scrim /><Subs rows={b.rows.map((s) => ({s, n: 1e9}))} th={thB} />
		<Stamp53 y={b.y} place={b.place} note={b.note} />
		<Counter age={b.age} /><SealHollow />
		<Label s={`look ${f.name} · frame ${f.k}`} />
	</AbsoluteFill>; };
void H;
