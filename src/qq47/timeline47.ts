import React from 'react';
import {LINES47} from './lines47';
import * as S from './scenes47';
/* ep47 timeline (bgm2 v2 cut, film seconds). Scenes, subtitle lines, stamps, classical originals. */
type Sc = {a: number; b: number; C: React.FC<S.SceneP>; wipe?: 'L' | 'R'};
export const END = 145.124, FINAL_HIT = 137.765;
export const TITLE: [string, string] = ['情侣头像这招', '古人1400年前就用过了'];
export const CARD_Q: [string, string] = ['你们的情侣头像，换过几次了？', '评论区说说，你手里那一半给了谁。'];
export const SCENES: Sc[] = [
	{a: 0, b: 9.06, C: S.Open},
	{a: 9.06, b: 11.889, C: S.TitleScene},
	{a: 11.889, b: 25.477, C: S.Shijing, wipe: 'R'},
	{a: 25.477, b: 39.061, C: S.Donghan, wipe: 'R'},
	{a: 39.061, b: 48.117, C: S.Pojing1, wipe: 'R'},
	{a: 48.117, b: 51.513, C: S.Market},
	{a: 51.513, b: 54.344, C: S.Gate},
	{a: 54.344, b: 57.174, C: S.Stall},
	{a: 57.174, b: 59.438, C: S.Meet},
	{a: 59.438, b: 61.702, C: S.Poem},
	{a: 61.702, b: 63.966, C: S.Return},
	{a: 63.966, b: 66.231, C: S.CodaMirror},
	{a: 66.231, b: 79.816, C: S.Tang, wipe: 'R'},
	{a: 79.816, b: 88.307, C: S.Seventies},
	{a: 88.307, b: 91.137, C: S.Nineties},
	{a: 91.137, b: 96.231, C: S.Packet},
	{a: 96.231, b: 106.986, C: S.LookBack},
	{a: 106.986, b: 113.213, C: S.Drop},
	{a: 113.213, b: 116.042, C: S.DropClose},
	{a: 116.042, b: 120.26, C: S.CodaMirror},
	{a: 120.26, b: 123.61, C: S.CodaPin},
	{a: 123.61, b: 128.705, C: S.CodaPhone},
	{a: 128.705, b: END + 1, C: S.EndScene},
];
export const LINES = LINES47;
export const STAMPS: [number, number, string, string, string?][] = [
	[11.889, 25.477, '先秦', '《诗经·卫风·木瓜》'],
	[25.477, 39.061, '东汉末', '繁钦《定情诗》', '《玉台新咏》卷一'],
	[39.061, 66.23, '相传 · 南朝陈', '孟棨《本事诗》'],
	[66.231, 79.816, '唐 · 806', '白居易《长恨歌》'],
	[79.816, 88.307, '七十年代', '结婚「三转一响」'],
	[88.307, 91.137, '1998', '范晓萱《数字恋爱》', '目前可追溯的最早出处'],
	[91.137, 96.231, '2016.05.20', '微信红包上限 520 元', '当天 24 小时'],
];
export const ORIGS: [number, number, string][] = [
	[14.154, 24.35, '投我以木瓜，报之以琼琚'],
	[30.569, 38.5, '約指一雙銀'],
	[41.324, 47.5, '乃破一鏡，人執其半'],
	[48.117, 51.513, '他日必以正月望日賣於都市'],
	[59.438, 61.702, '鏡與人倶去，鏡歸人不歸'],
	[69.627, 74.155, '釵留一股合一扇'],
	[74.155, 79.2, '但教心似金鈿堅，天上人間會相見'],
];
