// SEGMENT D's 2D LAYER (STORYBOARD lines 16-19) and its beats. WP10. Which overlays each shot shows, when and where;
// the pieces are the film's graphic layer (../hud, WP6). This file only times and places them from the screen points
// the shot measured after w.update() (heads from headPx, world points from w.project). Every function is a pure
// function of the frame and returns its overlays as a list (null where nothing shows); segD.ts joins them with frag.
// Times: absolute film frames, from beats.ts (HIT, TAG, TAG_OUT) or looked up below (T). Places: film px.
// Zones (BIBLE 2.1): nothing above y 210, in the caption band 1190-1498, below 1613, right of x 930 below y 900; the
// source tag owns the top-left corner, the jade chip the top right (x 780-984, y 215-310). The chip flips by itself
// (beats.ts HOLDER: 随从怀里 on 1367, 赵国 on 1595).
// Overlays never cross a cut (rule 11): each one leaves before its shot's last frame; the servant's chest glow is drawn
// by 16a and by 16b with the same first frame (so it does not fade in again on the cut).
import React from "react";
import { L } from "../lang";
import { cap, capWord, line, clamp01 } from "../story";
import { shot, HIT, TAG, TAG_OUT } from "../beats";
import { tag, arrow, suns, crowns, mark, glint, puff, steam, glow, streak, HC, type Head, type Pt } from "../hud";

type Node = React.ReactNode;
const h = React.createElement;
const S16a = shot("16a"), S16b = shot("16b"), S17a = shot("17a"), S18a = shot("18a"), S18b = shot("18b"), S19 = shot("19");
/** the whole frame (the hud's FULL, not exported) */
const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };
/** a node at opacity k (null at 0): this file's own fades where the hud's 5-frame leave does not fit */
const dim = (key: string, k: number, node: Node): Node => (!node || k <= 0 ? null : k >= 1 ? node : h("div", { key, style: { ...FULL, opacity: k } }, node));

/** segment D's beats that beats.ts does not name (each looked up from the narration; today's numbers in comments) */
export const T = {
  // ---- 16a
  /** his walk out of the hall at the end of 15 (segC: HIT.exit15 + 6, 1292): the same walk goes on on the road (rule
   *  5b: out right, in from the left edge; rule 12: the same clock) */ walk15: HIT.exit15 + 6,
  /** 转头: the jade goes onto his right hand (1312-1315) so his left hand can beckon on 让 (1316) */ oneHand: HIT.beckon - 4,
  /** 让: the beckon, two flicks of the left hand toward himself (1316-1327) */ beckon: HIT.beckon,
  /** 穿上: the fling: the left hand winds low (1330-1333) and flings toward the servant (1334-1337) */ fling: cap(16, 1).from,
  /** the brown puff covers the servant (1337-1345); the swap SERVANT -> SERVANT_ROUGH lands on 粗 (1339) */ puff: HIT.puff - 2,
  /** the jade back in both his hands (1346), then offered toward the servant (1356-1362) */ both: HIT.puff + 7, offer: cap(16, 2).from - 6,
  /** 揣着玉: THE HAND-OVER (1362-1368): the envoy's two hands under the disc, the servant's on its sides; glint and chip
   *  on 着玉 (1367) */ give: [cap(16, 2).from, HIT.tuck + 1] as [number, number],
  /** the servant tucks it into his coat (1368-1371): it hides on 1372, a warm glow stays at his chest */ tuck: [HIT.tuck + 1, HIT.tuck + 5] as [number, number],
  /** the servant turns right (1374) and breaks into a run (1377: the cut to 16b comes 4 frames into it) */ turn: S16a.to - 6, run: S16a.to - 3,
  // ---- 16b
  /** the dotted arrow toward Zhao: it grows from 1395 and its seal 赵 / ZHAO lands on 赵国 (1406 = from + 11); it leaves
   *  1408-1412 */ arrow: capWord(16, "赵国").from - 11, arrowOut: HIT.whip3 - 6,
  /** THE WHIP PAN LEFT (toward Qin): out on the last 6 frames of 16b (1414-1419), in on the first 4 of 17a (1420-1423) */
  whip3: [HIT.whip3, S16b.to, S17a.from, S17a.from + 3] as [number, number, number, number],
  // ---- 17a
  /** 五天后: five suns at the top centre, one every 3 frames (1422-1434); they leave before the cut (1456) */ sunsOut: S17a.to - 4,
  /** the usher stops on his mark (1446), turns to the throne and bows (1449-1456); from 1456 he backs away */
  usherStop: cap(17, 1).from + 5, bow: [cap(17, 1).from + 8, cap(17, 1).from + 11, cap(17, 1).from + 13, cap(17, 1).from + 15] as [number, number, number, number],
  /** 大礼摆好: the drum, twice (1441, 1449) */ drum: [HIT.drum, HIT.drum + 8] as [number, number],
  // ---- 17b / 18
  /** 秦王要玉: the king's hand goes out (1461-1467) and stays out until the reveal */ ask: HIT.ask,
  /** the red crosses ripple over the crowns on the stamp rattle (HIT.cross 1553 .. 1574, one per frame, in step with the
   *  mix's 22 stamps); crownsFull = the last frame at full strength (1574: the 22nd cross lands on it, so the whole
   *  crossed set shows once at full), then a 2-frame fade of this file's own (half on 1575, gone on 1576, the shot's
   *  last frame) */
  cross: HIT.cross, crownsFull: S18a.to - 2,
  /** he shows two empty hands (1570-1576) */ empty: S18a.to - 6,
  /** 18b: the king's smile goes to shock (1590), the 「!」 (1596-1611, gone on the cut), his hand pulls back (1596-1604) */
  shock: cap(18, 3).from + 13, markOut: S18b.to - 3, recoil: [HIT.reveal + 1, HIT.reveal + 9] as [number, number],
  /** the envoy turns toward the king's side for 19 (off-screen in 18b, 1590-1600) */ turn19: [cap(18, 3).from + 13, cap(18, 3).from + 23] as [number, number],
  // ---- 19
  /** 骗了大王: the polite bow (1614-1626) */ bow19: [line(19).from, line(19).from + 4, line(19).from + 8, line(19).from + 12] as [number, number, number, number],
  /** 该死: one slow nod, down 1639-1645, up 1645-1651 */ nod: [cap(19, 1).from, cap(19, 1).from + 6, cap(19, 1).from + 12] as [number, number, number],
  /** 把我: the cauldron falls (1654-1660) and lands with a squash (1660-1662); the dust at its rim (1660); 下锅: the steam
   *  (1662, out 1680: gone on the cut) */ fall: HIT.cauldron, steam: capWord(19, "下锅").from, steamOut: S19.to - 5,
  /** he shows the cauldron with an open hand (1666-1672) */ show: HIT.cauldron[1] + 6,
};

// ====================================================================================================== 16a
/** shot 16a: the servant's tag 随从 / "his servant" (1320-1352), clear of the envoy's head; the brown cloth puffs over
 *  the servant (1337-1345, the swap under them); a faint warm glow on the jade while it shows (BIBLE 6.1: the jade is
 *  the brightest thing in the frame, and the dusk light greys it; r 0.85 of the disc's radius on screen (0 by the rim, so
 *  never on the hands at the rim), 0.7 strength,
 *  full from the first frame, leaving with the tuck 1368-1372 into the chest glow); the glint on the jade as it
 *  reaches the servant's hands (1367); the warm glow at his chest once the jade is inside his coat (from 1368).
 *  `jadeR` = the disc's radius on screen (px) */
export const JADE_GLOW = { r: 0.85, k: 0.7 };
export const ov16a = (f: number, P: { lin: Head; servant: Head; jade: Pt | null; jadeR: number; chest: Pt }): Node[] => [
  tag({ f, who: "servant", at: P.servant, from: TAG.servant, out: TAG_OUT.servant, avoid: [P.lin] }),
  P.jade ? dim("glowJadeK", JADE_GLOW.k, glow({ f, from: S16a.from - 3, out: T.tuck[0], x: P.jade.x, y: P.jade.y, r: JADE_GLOW.r * P.jadeR, key: "glowJade" })) : null,
  // two puffs, over his head and his chest (one big puff spreads sideways over the envoy's face)
  puff({ f, from: T.puff, dur: 9, x: P.servant.x + 0.2 * P.servant.r, y: P.servant.y, r: 0.7 * P.servant.r, color: "#9a7650", key: "puffHead" }),
  puff({ f, from: T.puff, dur: 9, x: P.servant.x + 0.2 * P.servant.r, y: P.servant.y + 1.3 * P.servant.r, r: 0.7 * P.servant.r, color: "#a8865e", key: "puffBody" }),
  P.jade ? glint({ f, from: HIT.tuck, x: P.jade.x + 30, y: P.jade.y - 36, size: 110 }) : null,
  glow({ f, from: T.tuck[0], x: P.chest.x, y: P.chest.y, r: 0.42 * P.servant.r + 20, key: "glow16a" }),
];

// ====================================================================================================== 16b
/** where the arrow of 16b ends: low on the right edge, along the ridge (the seal lands about y 500-590: clear of the
 *  moon, whose foot is y 420, and of the chip); a small arch up */
export const ARROW16 = { b: { x: 1000, y: 545 }, bend: -0.1 };
/** shot 16b: the bright dot at the running servant's chest; the dotted gold arrow toward Zhao: its tail fixed where
 *  the servant was when it starts (`tail`: over his head on 1395, a fixed world point, so it never shrinks as he runs
 *  on), ahead of him to the right along the ridge, above his head all the way (he runs on under it); its seal
 *  赵 / ZHAO lands on 赵国; the whip's streak (LEFT) */
export const ov16b = (f: number, P: { tail: Pt; chest: Pt }): Node[] => [
  glow({ f, from: T.tuck[0], x: P.chest.x, y: P.chest.y, r: 30, key: "glow16b" }),
  arrow({ f, from: T.arrow, out: T.arrowOut, a: P.tail, b: ARROW16.b, seal: L("赵", "ZHAO"), bend: ARROW16.bend }),
  streak({ f, from: T.whip3[0], to: T.whip3[3], dir: -1 }),
];

// ====================================================================================================== 17a
/** where the day-tick sits: the top centre (y 270), clear of the source tag and the chip */
export const SUNS17 = { x: 540, y: 270 };
/** the drum's BOOM: two thin cream rings (on ink) that widen from the drum and fade, the second 2 frames behind the
 *  first (9 frames in all): a sound wave, not a sun (the day-tick suns just above it are gold and spiky) */
const boom = (f: number, from: number, x: number, y: number, r: number, key: string): Node => {
  const kids: Node[] = [];
  for (let i = 0; i < 2; i++) {
    const u = (f - from - 2 * i) / 7;
    if (u < 0 || u >= 1) continue;
    const rr = r * (0.25 + 0.75 * (1 - (1 - u) * (1 - u))), sw = 11 - 7 * u, op = (1 - u * u) * (i ? 0.75 : 1);
    kids.push(h("g", { key: `r${i}`, opacity: op, fill: "none" },
      h("circle", { cx: x, cy: y, r: rr, stroke: HC.ink, strokeWidth: sw + 7 }),
      h("circle", { cx: x, cy: y, r: rr, stroke: HC.cream, strokeWidth: sw })));
  }
  return kids.length ? h("svg", { key, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } }, ...kids) : null;
};
/** shot 17a: the whip's streak; the five suns tick on (五天后: the suns of line 14 come back as the five days); the
 *  drum's boom (大礼摆好, twice: cream rings from the drum) */
export const ov17a = (f: number, P: { drum: Pt }): Node[] => [
  streak({ f, from: T.whip3[0], to: T.whip3[3], dir: -1 }),
  suns({ f, from: HIT.dayTick, x: SUNS17.x, y: SUNS17.y, step: 3, out: T.sunsOut }),
  boom(f, T.drum[0], P.drum.x, P.drum.y, 74, "drum0"),
  boom(f, T.drum[1], P.drum.x, P.drum.y, 74, "drum1"),
];

// ====================================================================================================== 18a
/** the crowns' rows and size in 18a: a cross reaches 0.42 size + its 9.5 px round cap from its crown's middle (28 px
 *  at size 44), so row 1's crosses start under the source tag's text (which ends about y 228) and row 2's end above
 *  the envoy's bun (its top about y 344; at 322 they stamped 7 px onto it); x 140-740 (the right end about 770, left
 *  of the chip at 780) */
export const CROWNS18 = { rows: [258, 312] as [number, number], size: 44 };
/** shot 18a: 秦国二十多个国君: the 22 crowns pop one per frame (1512-1533); 没一个守约的: a seal-red cross onto each, left
 *  to right (1553-1574, with the stamps); all 22 crossed at full on 1574, half on 1575, gone on 1576 (before the cut) */
export const ov18a = (f: number): Node[] => [
  dim("crowns18aK", clamp01(1 - (f - T.crownsFull) / 2), crowns({ f, from: HIT.crowns, crossAt: T.cross, rows: CROWNS18.rows, size: CROWNS18.size })),
];

// ====================================================================================================== 18b
/** shot 18b: the gold 「!」 over the King of Qin on 赵国 (1596-1611), to the LEFT of his crown (over it, it would reach
 *  the chip's corner) */
export const ov18b = (f: number, P: { king: Head }): Node[] => [
  mark({ f, from: HIT.reveal + 1, out: T.markOut, x: P.king.x - 0.8 * P.king.r, y: P.king.y - 1.85 * P.king.r, text: "!", size: 150 }),
];

// ====================================================================================================== 19
/** shot 19: the dust at the cauldron's rim as it lands (1660) and the steam rising from the rim (1662-1685, away from
 *  the captions). `rim` = the rim's middle on screen, `rimW` = its width in px */
export const ov19 = (f: number, P: { rim: Pt; rimW: number }): Node[] => [
  puff({ f, from: T.fall[1], dur: 12, x: P.rim.x, y: P.rim.y + 6, r: 0.24 * P.rimW, key: "puffRim" }),
  steam({ f, from: T.steam, out: T.steamOut, x: P.rim.x, y: P.rim.y - 4, w: 0.7 * P.rimW }),
];

export { S16a, S16b, S17a, S18a, S18b, S19 };
