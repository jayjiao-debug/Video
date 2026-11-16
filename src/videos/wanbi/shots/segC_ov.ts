// SEGMENT C's 2D LAYER (STORYBOARD lines 12-15) and its beats. WP9. Which overlays each shot shows, when and where;
// the pieces are the film's graphic layer (../hud, WP6). This file only times and places them from the screen points
// the shot measured after w.update() (heads from headPx, world points from w.project). Every function is a pure
// function of the frame and returns its overlays as a list (null where nothing shows); segC.ts joins them with frag.
// Times: absolute film frames, from beats.ts (HIT, BEAT) or looked up below (T). Places: film px.
// Zones (BIBLE 2.1): nothing above y 210, in the caption band 1190-1498, below 1613, right of x 930 below y 900; the
// source tag owns the top-left corner, the jade chip the top right (x 780-984, y 215-310).
// Overlays never cross a cut (rule 11), except the declared stage of 13 -> 14 and the five suns that live inside it
// (they pop over the envoy in 13 and slide off toward the king in 14).
import type React from "react";
import { cap, capWord, line } from "../story";
import { shot, HIT, BEAT } from "../beats";
import { burst, cities, suns, stage, sweat, type Head, type Pt } from "../hud";

type Node = React.ReactNode;
const S12b = shot("12b"), S13 = shot("13"), S14 = shot("14");

/** segment C's beats that beats.ts does not name (each looked up from the narration; today's numbers in comments) */
export const T = {
  // ---- 12a
  /** 秦王赶紧道歉: the seated bow starts (927) */ bow: line(12).from,
  /** he has sunk back from the half-rise onto the 榻 (931, with the HUD's fade-in) */ sunk: BEAT.hudIn[1],
  /** 道歉: the nod inside the bow (949) */ sorry: capWord(12, "道歉").from,
  /** out of the bow, the hands open for the claps (951) */ unbow: capWord(12, "道歉").from + 2,
  /** after the second clap he starts to rise: the cut to 12b comes on the rise (959) */ rise: HIT.clap[1],
  // ---- 12b
  /** 摊开地图: the king pulls the bottom roller down from the cut (963-975) */ pull: [HIT.mapOpen, HIT.roller - 1] as [number, number],
  /** the map is fully open (976 = HIT.roller: the official bows); the king lets go a frame later */
  release: HIT.roller + 1,
  /** 一指: the jab lands (980) */ jab: HIT.point,
  /** 给赵国: the sweep of the arm toward Zhao (1018-1026), the dots pulse */ give: capWord(12, "给赵国").from,
  /** the map's cities leave before the cut to 13 (gone on 1040) */ citiesOut: S12b.to - 4,
  // ---- 13
  /** 他看得出来: the envoy walks in from the right edge */ walkIn: line(13).from,
  /** 在演: the king's theatrical freeze under the light (1077-1093) */ act: HIT.stage,
  /** 他也演: the light slides to the envoy (1094-1102) and he bows; the king lowers his arm */ slide: [HIT.swing, HIT.swing + 8] as [number, number],
  // ---- 14
  /** 大王也得斋戒五天: the open hand toward the king (the cut, 1163) */ ask: cap(14, 2).from,
  /** the five suns flash on 五天 (1190): sunsSlide + 10 (the group 大王也得斋戒五天's 7th syllable; capWord cannot
   *  name it: 五天 is said in two groups) */ sunsFlash: HIT.sunsSlide + 10,
  /** the suns leave before 摆上大礼 (out 1200, gone 1205) */ sunsOut: HIT.grand - 5,
  /** 我才交: the jade back to his chest, the stage lifts (1225-1235); a slow blink after it (1236) */ hand: HIT.stageOff, slowBlink: BEAT.stage[3] + 1,
  // ---- 15
  /** the king's hand stops short (the glance) and the envoy's rage raise (抢, 1253), the king's hand withdraws (1256) */
  withdraw: HIT.rage2 + 3,
  /** 只好答应: the envoy calms down, the jade comes back to his chest (1272-1280) */ agree: cap(15, 1).from,
  /** he turns right (1286-1291) and walks out (from 1292: the cut comes 4 frames into the walk) */ turn: HIT.exit15, walk: HIT.exit15 + 6,
};

// ====================================================================================================== 12a
/** shot 12a: the sweat drop at the king's temple on 秦王赶紧道歉 (927-946) */
export const ov12a = (f: number, P: { king: Head }): Node[] => [
  sweat({ f, from: T.bow, len: 20, x: P.king.x + 0.78 * P.king.r, y: P.king.y - 0.25 * P.king.r, size: 52 }),
];

// ====================================================================================================== 12b
/** the cities' icon size on the map (px): at the "map" default 30 the 15 icons piled into one clump (fix round, f1022);
 *  at 21 they stand apart on 12b's sheet (about 30-40 px between neighbours) */
const MAP_CITY = 21;
/** the king's head and crown on screen (segC.ts crownPx): centre, half-width, the crown's top */
export type Crown = { x: number; y: number; rx: number; top: number };
/** is a city's point inside the king's head-and-crown silhouette (an ellipse: rx wide, up to the crown's top, down to
 *  rx under the centre)? The map hangs behind him: such a city is left out (moved off the frame, so the others keep
 *  their pop frames) */
const behindKing = (q: Pt, k: Crown) => { const ry = q.y < k.y ? k.y - k.top : k.rx; return ((q.x - k.x) / (k.rx + MAP_CITY / 2)) ** 2 + ((q.y - k.y) / (ry + MAP_CITY / 2)) ** 2 < 1; };
/** shot 12b: the fifteen cities light on the map one per frame on 十五座城 (996-1010) and pulse on 给赵国 (1018); gone on
 *  the cut. `pts` = the map's MAP_CITIES projected (props mapCitiesWorld); `king` = his head and crown */
export const ov12b = (f: number, P: { pts: Pt[]; king: Crown }): Node[] => [
  cities({ f, from: HIT.cities12, mode: "map", size: MAP_CITY, pts: P.pts.map((q) => (behindKing(q, P.king) ? { x: -999, y: -999 } : q)), pulseAt: T.give, out: T.citiesOut }),
];

// ====================================================================================================== 13 + 14: THE STAGE
/** the stage's circle: a centre and a radius (px) the shot measured for the king and the envoy (13: headPx and 0.55 m;
 *  14, the close-up: centred under the frame and wide enough to take his head in, see segC.ts closeSpot) */
export type Spot = { x: number; y: number; r: number };
const mixSpot = (a: Spot, b: Spot, k: number): Spot => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, r: a.r + (b.r - a.r) * k });
const eio = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
/** the light cone dies out over the last 38 % of its length (stage's `fade`, fix round): ending in a straight edge at the
 *  spot's centre it drew a pale band with a flat bottom through the lit figure (f1085 the king's chin, f1102 the
 *  envoy's chest and jade, f1145 his mouth) */
const STAGE_FADE = 0.38;
/** THE STAGE (V3): drops on the king on 在 (1077), slides to the envoy on 也演 (1094-1102), lifts on 我才交 (1225-1235,
 *  inside 14). Shot 13 gives both spots; 14 gives the envoy's only */
const stageOn = (f: number, at: Spot) => stage({ f, from: BEAT.stage[0], out: BEAT.stage[2], at: { x: at.x, y: at.y }, r: at.r, fade: STAGE_FADE, key: "stageC" });
/** where the five suns sit in 13 (over the envoy's cap, the row clear of the chip and the right edge) and in 14 (above
 *  his cap; the row left of the chip), and where they slide to (the left edge, toward the king off-screen) */
const SUNS_Y13 = 430, SUNS_X13_MAX = 760;
export const sunsAt13 = (lin: Head): Pt => ({ x: Math.min(SUNS_X13_MAX, lin.x), y: SUNS_Y13 });
/** the suns' row in 14: centre x and y (measured above his cap, see segC.ts) and the slide's end at the left edge */
export const SUNS14 = { x: 470, y: 268, toX: 238 };
/** shot 13: THE STAGE on the king (1077), sliding to the envoy (1094-1102); five suns pop over the envoy's head on
 *  五天才 (1133-1149, one per 4 frames, grey -> gold) */
export const ov13 = (f: number, P: { king: Spot; lin: Spot; linHead: Head }): Node[] => {
  const k = eio((f - T.slide[0]) / (T.slide[1] - T.slide[0]));
  const s = sunsAt13(P.linHead);
  return [
    f < S13.from ? null : stageOn(f, mixSpot(P.king, P.lin, k)),
    suns({ f, from: HIT.suns, x: s.x, y: s.y, step: 4, key: "sunsC" }),
  ];
};
/** shot 14: the stage stays on the envoy across the cut and lifts on 我才交; the suns (re-placed above his cap on the
 *  cut) slide to the left edge toward the king (1180-1195), flash on 五天 (1190) and leave before 大礼; a small gold
 *  burst at his open hand as the arm sweeps up on the bell of 大礼 (1208, fix round; `hand` = his WIDE_R point) */
export const ov14 = (f: number, P: { lin: Spot; hand: Pt }): Node[] => [
  f < S14.from ? null : stageOn(f, P.lin),
  burst({ f, from: HIT.grand + 3, x: P.hand.x, y: P.hand.y, r: 78, n: 8, key: "grandC" }),
  suns({ f, from: HIT.suns, x: SUNS14.x, y: SUNS14.y, step: 4, slideAt: HIT.sunsSlide, slideTo: { x: SUNS14.toX, y: SUNS14.y }, flashAt: T.sunsFlash, out: T.sunsOut, key: "sunsC" }),
];

// ====================================================================================================== 15
/** shot 15: no overlay (the stage is gone; the rage raise is the picture's) */
export const ov15 = (_f: number): Node[] => [];
