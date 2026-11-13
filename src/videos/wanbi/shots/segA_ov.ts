// SEGMENT A's 2D LAYER (STORYBOARD lines 1-6): which overlays each shot shows, when and where. The pieces are the
// film's graphic layer (../hud, WP6); this file only times and places them from the screen points the shot measured
// after w.update() (heads from headPx, world points from w.project). Every function is a pure function of the frame
// and returns the overlays as a list (null where nothing shows); segA.ts joins them with frag(...).
// Times: absolute film frames, from beats.ts (HIT, TAG, TAG_OUT, BEAT) or looked up below (T). Places: film px.
// Zones (BIBLE 2.1): nothing above y 210, in the caption band 1190-1498, below 1613, right of x 930 below y 900; the
// source tag owns the top-left corner, the jade chip the top right.
import type React from "react";
import { EN, L } from "../lang";
import { cap, capWord } from "../story";
import { shot, HIT, TAG, TAG_OUT, BEAT } from "../beats";
import {
  tag, tags, stamp, cities, army, arrow, mark, label, EARLIER, ARCH,
  glint, streak, tint, sweat, type Head, type Pt,
} from "../hud";

type Node = React.ReactNode;
const S2 = shot("2"), S3 = shot("3"), S6 = shot("6");

/** segment A's beats that beats.ts does not name (each looked up from the narration) */
export const T = {
  // ---- shot 2
  /** 直摆手: the sweat drop (127-147) */ sweat: capWord(2, "直摆手").from,
  /** the head-shake accent, 5 frames into 直摆手 (132) */ shake2: capWord(2, "直摆手").from + 5,
  /** 是秦王: the hands stop mid-air (150) */ stop2: cap(2, 1).from,
  /** the gaze to the envoy off-frame right and the swallow (160) */ gaze2: cap(2, 1).from + 10,
  /** the whip pan RIGHT: out on the last 4 frames of 2, in on the first 4 of 3 (168-171 / 172-175) */
  whip1: [HIT.whip1, S2.to, S3.from, S3.from + 3] as [number, number, number, number],
  // ---- shot 3
  /** 这块玉: the proud lift (174) */ lift: HIT.source,
  /** the arrow toward Qin grows 2 frames after 赵国给了 (239-252) and fades on 城可能不来 (257) */ arrow: HIT.offer + 2,
  /** everything of shot 3's 2D layer starts its leave here (gone on the cut, 325 / 326) */ out3: S3.to - 5,
  // ---- shot 5a
  /** the ministers turn round to look, 3 frames before 门客 (395) */ lookBack: capWord(5, "门客").from - 3,
  /** the eunuch lifts an open hand toward his retainer: the cut to 5b comes 3 frames into it (404) */ handUp: HIT.present - 3,
  // ---- shot 5b
  /** the eunuch's presenting hand starts down to his side (424; at his side 430) */ presentOut: HIT.present + 17,
  /** 他说: the envoy turns to the king (429) */ turnKing: cap(6, 0).from,
  /** the eunuch smiles -> happy, the king relief (446) */ happy: HIT.iGo + 3,
  /** 城不来: the stern head shake (457-470) */ shakeNo: cap(6, 1).from,
  /** the king starts to lift the jade toward him: the 5b -> 6 cut hides the hand-over (V2; 466) */ kingLift: S6.from - 6,
  // ---- shot 6
  /** he lifts the jade from his chest to his chin (472-484) */ chin: [HIT.chipLin, HIT.chipLin + 12] as [number, number],
  /** the stamp's leave (508; gone on 513 = the cut) */ wanbiOut: S6.to - 4,
  /** 带回来: he turns to his left (toward Qin) with one step (500-508) */ turnQin: capWord(6, "回来").from - 1,
  /** the whip pan LEFT: out on the last 4 frames of 6 (509-512), in on the first 4 of 7a (WP8, 513-516) */
  whip2: [HIT.whip2, S6.to, S6.to + 1, S6.to + 4] as [number, number, number, number],
};

/** a screen box as circles for a tag's `avoid` (tags keep clear of circles only) */
export const asCircles = (x0: number, y0: number, x1: number, y1: number, r = 40): Head[] => {
  const out: Head[] = [];
  for (let x = x0 + r; x <= x1 - r + 1; x += r * 1.4) for (let y = y0 + r; y <= y1 - r + 1; y += r * 1.4) out.push({ x, y, r });
  return out;
};

// ====================================================================================================== shot 1
/** shot 1: the envoy's first tag (蔺相如 · 宦官的门客 / "the envoy"), settled on frame 0 (its pop is computed from -12),
 *  above his lifted wrap, clear of the king's head and hands and of the jade; the glint on 和氏璧 (59) */
export const ov1 = (f: number, P: { lin: Head; king: Head; hands: Pt[]; jade: Head }): Node[] => [
  tag({ f, who: "lin0", at: P.lin, from: TAG.lin0, out: TAG_OUT.lin0, avoid: [P.king, P.jade, ...P.hands.map((h) => ({ ...h, r: 60 }))] }),
  glint({ f, from: HIT.glint1, x: P.jade.x + 0.35 * P.jade.r, y: P.jade.y - 0.45 * P.jade.r, size: 110 }),
];

// ====================================================================================================== shot 2
/** shot 2: the sweat drop at his temple (127-147), the 秦王 tag (148, gone before the whip), the whip's streak */
export const ov2 = (f: number, P: { king: Head }): Node[] => [
  sweat({ f, from: T.sweat, out: T.sweat + 15, x: P.king.x + 0.78 * P.king.r, y: P.king.y - 0.25 * P.king.r, size: 52 }),
  tag({ f, who: "qinWang", at: P.king, from: TAG.qinWang, out: TAG_OUT.qinWang, side: "up" }),
  streak({ f, from: T.whip1[0], to: T.whip1[3], dir: 1 }),
];

// ====================================================================================================== shot 3
/** the arch's icons as circles (tags keep off them) */
const ARCH_AVOID: Head[] = ARCH.map((a) => ({ x: a.x, y: a.y, r: 36 }));
/** shot 3, staggered arrivals (label 172, source tag 174 (HUD), glint 182, chip 190 (HUD), tag 196, cities 211): the
 *  whip's streak and the sepia rewind; 此前 / EARLIER; the glint on 玉; the 赵王 tag; the fifteen cities on the arch
 *  (ghost from 城可能不来); the dotted arrow toward Qin with its seal 秦 / QIN (赵国给了); the army (秦兵一定来);
 *  everything gone on the cut. The arrow starts just off the disc's left rim (its r is ~104 px in zhaoKing) */
export const ov3 = (f: number, P: { king: Head; jade: Pt }): Node[] => [
  streak({ f, from: T.whip1[0], to: T.whip1[3], dir: 1 }),
  tint({ f, from: BEAT.earlier[0], out: BEAT.earlier[0] + 9 }),
  label({ f, from: BEAT.earlier[0], out: BEAT.earlier[1] - 4, x: 540, y: 300, text: EARLIER }),
  glint({ f, from: HIT.glintZhao, x: P.jade.x + 30, y: P.jade.y - 40, size: 100 }),
  tag({ f, who: "zhaoWang", at: P.king, from: TAG.zhaoWang, out: TAG_OUT.zhaoWang, avoid: ARCH_AVOID }),
  cities({ f, from: HIT.cities, mode: "arch", ghostAt: HIT.ghost, out: T.out3 }),
  arrow({ f, from: T.arrow, out: HIT.ghost, a: { x: P.jade.x - 120, y: P.jade.y - 10 }, b: { x: 60, y: P.jade.y - 150 }, seal: L("秦", "QIN"), bend: -0.1 }),
  army({ f, from: HIT.army, out: T.out3, x0: 96, x1: 500 }),
];

// ====================================================================================================== shot 5a
/** shot 5a: the gold 「?」 over the king (派谁去, gone before 没人); the ministers' tag 赵国大臣 above the two of them */
export const ov5a = (f: number, P: { king: Head; minA: Head; minB: Head }): Node[] => {
  const g: Head = { x: (P.minA.x + P.minB.x) / 2, y: Math.min(P.minA.y, P.minB.y), r: (P.minA.r + P.minB.r) / 2 };
  return [
    mark({ f, from: HIT.who, out: HIT.noOne - 6, x: P.king.x + 0.4 * P.king.r, y: P.king.y - 2.3 * P.king.r, text: "?", size: 150 }),
    tag({ f, who: "zhaoMin", at: g, from: TAG.zhaoMin, out: TAG_OUT.zhaoMin, side: "up", avoid: [P.king, P.minA, P.minB] }),
  ];
};

// ====================================================================================================== shot 5b
/** shot 5b: the two tags together (the eunuch 赵国宦官, the envoy 蔺相如 · 宦官的门客 + "the eunuch's retainer"), both
 *  pinned above their heads (he steps 0.2 m while they are up), clear of the king's head. English: both plates at
 *  scale 1 (the close-up would make them 1.3x), else the eunuch's plate, held in by the right safe line, slid under
 *  the envoy's two-row plate (seen on the first English farm render, frames 409-441) */
export const ov5b = (f: number, P: { lin: Head; miao: Head; king: Head }): Node[] => [
  tags(f, [
    { who: "miao", at: P.miao, from: TAG.miao, out: TAG_OUT.miao, side: "up", scale: EN ? 1 : undefined },
    { who: "lin5", at: P.lin, from: TAG.lin5, out: TAG_OUT.lin5, side: "up", scale: EN ? 1 : undefined },
  ], { avoid: [P.king] }),
];

// ====================================================================================================== shot 6
/** the 完璧归赵 stamp's centre: right of his head, under the chip (English 25 px further in: its gloss would reach
 *  x 990, WP6's measure) */
export const WANBI_AT = { x: EN ? 835 : 860, y: 470 };
/** shot 6: the glint as he holds the jade (我把玉, the chip flips: HUD); THE STAMP 完璧归赵 (把玉 + 1, out 508); the
 *  whip's streak (LEFT) */
export const ov6 = (f: number, P: { jade: Pt }): Node[] => [
  glint({ f, from: HIT.chipLin, x: P.jade.x + 40, y: P.jade.y - 50, size: 120 }),
  stamp({ f, id: "wanbi", from: HIT.wanbi, out: T.wanbiOut, x: WANBI_AT.x, y: WANBI_AT.y }),
  streak({ f, from: T.whip2[0], to: T.whip2[3], dir: -1 }),
];
