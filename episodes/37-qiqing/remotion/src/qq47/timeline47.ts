import React from 'react';
import {LINES47} from './lines47';
import * as S from './scenes47';
/* ep47 timeline (bgm2 v2 cut, film seconds). Scenes, subtitle lines, stamps, classical originals. */
type Sc = {a: number; b: number; C: React.FC<S.SceneP>; wipe?: 'L' | 'R' | 'F'; tag?: string};
export const END = 145.124, FINAL_HIT = 137.765;
export const TITLE: [string, string] = ['情侣头像这招', '古人1400年前就用过了'];
export const CARD_Q: [string, string] = ['你们的情侣头像，换过几次了？', '评论区说说，你手里那一半给了谁。'];
export const SCENES: Sc[] = [
	{a: 0, b: 9.06, C: S.Open},
	{a: 9.06, b: 11.889, C: S.TitleScene},
	{a: 11.889, b: 25.477, C: S.Shijing, wipe: 'F'},          // the title halves part up into the spring sky
	{a: 25.477, b: 39.061, C: S.Donghan, wipe: 'F'},          // the jade bi dissolves into the lamp flame
	{a: 39.061, b: 48.117, C: S.Pojing1},                     // match cut: the rings became the mirror in his hands
	{a: 48.117, b: 51.513, C: S.Market},                      // the halves travel from his/her hands onto the stalls
	{a: 51.513, b: 54.344, C: S.Gate},
	{a: 54.344, b: 57.174, C: S.Stall},
	{a: 57.174, b: 59.438, C: S.Meet},                        // the last 40 px close, once
	{a: 59.438, b: 61.702, C: S.Poem},
	{a: 61.702, b: 63.966, C: S.Return},                      // push into the joined halves
	{a: 63.966, b: 66.231, C: S.CodaMirror, tag: 'toMoon'},   // the disc rises into the moon over the cloud palace
	{a: 66.231, b: 79.816, C: S.Tang},
	{a: 79.816, b: 88.307, C: S.Seventies},                   // hard cut on the scripted crash
	{a: 88.307, b: 91.137, C: S.Nineties},
	{a: 91.137, b: 96.231, C: S.Packet},
	{a: 96.231, b: 106.986, C: S.LookBack},                   // everything lands on the seam ON the DROP
	{a: 106.986, b: 110.383, C: S.DropClose},
	{a: 110.383, b: 116.042, C: S.Drop},                      // pull back out into the street
	{a: 116.042, b: 120.26, C: S.CodaCouple},
	{a: 120.26, b: 123.61, C: S.Tang, tag: 'coda'},
	{a: 123.61, b: 128.705, C: S.CodaPhone},
	{a: 128.705, b: END + 1, C: S.EndScene},
];
export const LINES = LINES47;
export const SOURCES = '资料：《诗经·卫风》 · 繁钦《定情诗》（《玉台新咏》） · 孟棨《本事诗》 · 白居易《长恨歌》 · 新华网 · 中新网 · 界面新闻 · 虎嗅';
/** subtitle scrim tint + opacity per stretch: the scene's own dark, lighter on bright scenes */
export const SCRIM: [number, number, string, number][] = [
	[0, 11.889, '#5A3A1E', 0.3], [11.889, 25.477, '#3F6B50', 0.24], [25.477, 39.061, '#2A1610', 0.34], [39.061, 59.438, '#1B1830', 0.34],
	[59.438, 61.702, '#1B1830', 0.34], [61.702, 63.966, '#5A3A1E', 0.24], [63.966, 66.231, '#1B1830', 0.34], [66.231, 79.816, '#3A2E5A', 0.24],
	[79.816, 88.307, '#5A4632', 0.24], [88.307, 91.137, '#2A2050', 0.34], [91.137, 96.231, '#7A4A2E', 0.22], [96.231, 106.986, '#7A4A2E', 0.2],
	[106.986, 128.705, '#1B1830', 0.38], [128.705, 200, '#5A3A1E', 0.3],
];
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
