import React from 'react';
import {LINES47} from './lines47';
import * as S from './scenes47';
/* ep47 timeline (bgm2 v2 cut, film seconds). Scenes, subtitle lines, stamps, classical originals. */
type Sc = {a: number; b: number; C: React.FC<S.SceneP>; wipe?: 'L' | 'R'};
export const END = 145.124, FINAL_HIT = 137.765;
export const TITLE: [string, string] = ['情侣头像这招', '古人一千四百年前就用过了'];
export const CARD_Q: [string, string] = ['你们的情侣头像，换过几次了？', '评论区说说，你手里那一半给了谁。'];
export const SCENES: Sc[] = [
	{a: 0, b: 9.06, C: S.Open},
	{a: 9.06, b: 11.889, C: S.TitleScene},
	{a: 11.889, b: 25.477, C: S.Shijing, wipe: 'R'},
	{a: 25.477, b: 39.061, C: S.Donghan, wipe: 'R'},
	{a: 39.061, b: 48.117, C: S.Pojing1, wipe: 'R'},
	{a: 48.117, b: 51.51, C: S.Market},
	{a: 51.51, b: 54.34, C: S.Gate},
	{a: 54.34, b: 56.61, C: S.Road},
	{a: 56.61, b: 59.44, C: S.Stall},
	{a: 59.44, b: 61.70, C: S.Meet},
	{a: 61.70, b: 63.97, C: S.Return},
	{a: 63.97, b: 66.23, C: S.CodaMirror},
	{a: 66.23, b: 79.815, C: S.Tang, wipe: 'R'},
	{a: 79.815, b: 88.31, C: S.Seventies},
	{a: 88.31, b: 91.14, C: S.Nineties},
	{a: 91.14, b: 96.231, C: S.Packet},
	{a: 96.231, b: 106.986, C: S.LookBack},
	{a: 106.986, b: 113.21, C: S.Drop},
	{a: 113.21, b: 116.042, C: S.DropClose},
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
	[66.23, 79.815, '唐 · 806', '白居易《长恨歌》'],
	[79.815, 88.31, '1970年代', '婚嫁「三转一响」'],
	[88.31, 91.14, '1998', '范晓萱《数字恋爱》', '目前可追溯的最早出处'],
	[91.14, 96.231, '2016.05.20', '微信红包上限 520 元', '当天 24 小时'],
];
export const ORIGS: [number, number, string][] = [
	[14.15, 24.35, '投我以木瓜，报之以琼琚'],
	[30.57, 38.5, '約指一雙銀'],
	[41.32, 47.5, '乃破一鏡，人執其半'],
	[69.63, 79.2, '釵留一股合一扇'],
];
