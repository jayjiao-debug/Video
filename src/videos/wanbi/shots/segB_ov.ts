// SEGMENT B's 2D LAYER (STORYBOARD lines 7-11): which overlays each shot shows, when and where. The pieces are the
// film's graphic layer (../hud, WP6); this file only times and places them from the screen points the shot measured
// after w.update() (heads from headPx, world points from w.project). Every function is a pure function of the frame
// and returns the overlays as a list (null where nothing shows); segB.ts joins them with frag(...).
// Times: absolute film frames, from beats.ts (HIT, TAG, TAG_OUT, BEAT) or looked up below (TB). Places: film px.
// Zones (BIBLE 2.1): nothing above y 210, in the caption band 1190-1498, below 1613, right of x 930 below y 900; the
// source tag owns the top-left corner, the jade chip the top right. The chip and the source tag are the registered
// HUD (hud/chip.tsx): they flip on beats.ts HOLDER and fade round the callback (BEAT.hudOut) by themselves.
import React from "react";
import { EN } from "../lang";
import { cap, capWord, line } from "../story";
import { shot, HIT, TAG, TAG_OUT } from "../beats";
import { tag, stamp, mark, ring, shout, bubble, cities, glint, streak, rage, type Head, type Pt } from "../hud";
import { frag } from "./common";
import { T as TA } from "./segA_ov";

type Node = React.ReactNode;
const S7a = shot("7a"), S7b = shot("7b"), S8a = shot("8a"), S8b = shot("8b"), S9 = shot("9"), S10a = shot("10a"), S10b = shot("10b"), S11 = shot("11");

/** segment B's beats that beats.ts does not name (each looked up from the narration or from a beats.ts beat) */
export const TB = {
  // ---- 7a (513-530)
  /** the whip pan LEFT arrives: the first 4 frames of 7a yaw in from the right (513-516); the streak runs 509-516 */
  whipIn: [TA.whip2[2], TA.whip2[3]] as [number, number], streak: [TA.whip2[0], TA.whip2[3]] as [number, number],
  /** he steps up from the step onto the dais to HALL.give (513-520) */ stepUp: [S7a.from, S7a.from + 7] as [number, number],
  /** the bow with the jade held forward (520-526), held into the reach */ bow: [S7a.from + 7, S7a.from + 13] as [number, number],
  // ---- 7b (531-593)
  /** the jade goes out to meet the king's hand (531-533 = HIT.take) */ meet: [S7b.from, HIT.take] as [number, number],
  /** the envoy lets go (533-536) and steps back down to HALL.present (536-550) */ letGo: HIT.take + 3, stepDown: [HIT.take + 3, HIT.take + 17] as [number, number],
  /** the king lifts it beside his head (536-543); 乐坏了: the laugh, three bounces (543-560) */ lift: [HIT.take + 3, HIT.laugh] as [number, number], laughEnd: HIT.laugh + 17,
  /** his right hand joins under the disc in front of his chest (558-564) */ toChest: [HIT.laugh + 15, HIT.toLady[0] - 1] as [number, number],
  /** 传给美人们: the pass to lady A at HALL.pass (565-570 = the chip); she bows over it 563-570, the king lets go 572 */
  pass: HIT.toLady, kingFree: HIT.toLady[1] + 2,
  /** she straightens with it at her chest (570-580); lady B tilts her head toward it (572) */ ladyUp: [HIT.toLady[1], HIT.toLady[1] + 10] as [number, number],
  /** the envoy's eyes follow the jade (568) */ follow: HIT.toLady[0] + 3,
  // ---- 8a (594-628)
  /** 万岁: lady A's one-handed raise (594-600); the cheer */ raise: [HIT.cheer, HIT.cheer + 6] as [number, number],
  /** the two zh bursts 万岁！ (596, 604) and the one EN burst (600) */ shouts: EN ? [HIT.cheer + 6] : [HIT.cheer + 2, HIT.cheer + 10],
  /** the envoy, ignored, backs off from present to mid (598-626), then turns to the lens in the last frames */ backOff: HIT.cheer + 4,
  // ---- 8b (629-662)
  /** 没人提城的事: the thought bubble (640, out 660-662: still up on the cut 663's eve); the 「?」 pops 5 frames in (645,
   *  on screen 17 frames: at 652 it showed for 6) */ bubbleOut: S8b.to - 2, qmark: HIT.bubble + 5,
  // ---- 9 (663-751)
  /** 他走上前: in from the right edge to present (663-684), the bow (684-690, held 12 frames, up by 702) */
  walkUp: [HIT.walkUp, cap(9, 1).from - 2] as [number, number], bow9: [cap(9, 1).from - 2, cap(9, 1).from + 4] as [number, number], bowUp9: [cap(9, 1).from + 12, cap(9, 1).from + 16] as [number, number],
  /** 瑕: he points at the jade in lady A's hands (707-718), the ring on it (707-720); the king looks */ flaw: HIT.flaw, ringOut: capWord(9, "瑕疵").from + 13, pointOut: cap(9, 2).from - 6,
  /** 我指给大王看: lady A hands it back at HALL.pass (724-730 = the chip); the envoy steps up onto give from the end of
   *  the point (718) to 5 frames before the hand-over (743) */
  giveBack: HIT.giveBack, stepUp2: [cap(9, 2).from - 6, HIT.handBack[0] - 5] as [number, number],
  /** the king brings it to his chest with both hands (733-739) and holds it out with his left (739-747) */ chest2: [HIT.giveBack[1] + 3, HIT.giveBack[1] + 9] as [number, number],
  /** THE HAND-OVER at HALL.meet (748-750 = the glint), the envoy's first backward step (750) */ handBack: HIT.handBack,
  // ---- 10a (752-802)
  /** he scuttles backward from give to retreatTurn (750-794), spins to face front (794-797), steps back onto the pillar
   *  (797-800), his back meets E1 (800: shake, thock) */ scuttle: [HIT.handBack[1], HIT.spin] as [number, number], spin: [HIT.spin, HIT.spin + 3] as [number, number], bump: HIT.bump,
  /** the jade goes up into the frame-0 grip as he sets off (752-760) */ high: [HIT.jadeBack, HIT.jadeBack + 8] as [number, number],
  /** 柱子: the king half-rises (776-786), one hand out */ rise: [capWord(10, "柱子").from - 10, capWord(10, "柱子").from] as [number, number],
  // ---- 10b (803-851)
  /** 怒发冲冠: the swap and the head pop (803), the rage strokes (803-830), the stamp (806, out 842) */ rageOut: cap(10, 2).to,
  nufaOut: HIT.nufa + 36,
  /** 再逼我: lip-sync, the glare left, the jade shakes once (831) */ threat: HIT.threat,
  // ---- 11 (852-924)
  /** the two taps of the jade toward his head (856, 866) */ taps: [capWord(11, "头").from - 3, capWord(11, "这块玉").from - 4],
  /** the feint again: the wind-up 2 frames before 一起 (884), the strike leaves 894 and stops on 碎 (896) */
  wind2: capWord(11, "一起").from - 2, strike2: HIT.smash2 - 2,
  /** the lens punch-in to fov 25 (886-896); the slow push 28 -> 27 before it (852-886) */ punch: [capWord(11, "一起").from, HIT.smash2] as [number, number],
  /** the king: shock -> dazed (900) */ dazed: HIT.smash2 + 4,
  /** the end of line 11 (the last word) */ end11: line(11).to,
};

// ====================================================================================================== 7a, 7b
/** 7a: the whip's streak (LEFT) as the hall yaws in */
export const ov7a = (f: number): Node[] => [streak({ f, from: TB.streak[0], to: TB.streak[1], dir: -1 })];

/** 7b: the glint on the take (533) and on the pass to lady A (570); the tag 美人 over lady A (565, gone on the cut) */
export const ov7b = (f: number, P: { jade: Pt; ladyA: Head; ladyB: Head; king: Head; lin: Head }): Node[] => [
  glint({ f, from: HIT.take, x: P.jade.x + 26, y: P.jade.y - 34, size: 100, key: "glintTake" }),
  glint({ f, from: HIT.toLady[1], x: P.jade.x + 26, y: P.jade.y - 34, size: 100, key: "glintLady" }),
  tag({ f, who: "ladies", at: P.ladyA, from: TAG.ladies, out: TAG_OUT.ladies, side: "up", avoid: [P.ladyB, P.king, { ...P.jade, r: 70 }] }),
];

// ====================================================================================================== 8a
/** where the 万岁 bursts sit: right of the ministers, over the pillar band, under the ladies (STORYBOARD x 280-560,
 *  y 560-700; further right and lower than first built: the first burst's left spikes covered half of minister B's
 *  face, and 40 px right still put their tips on his cheek (f600); now they pass under it, about 18 px clear) */
export const SHOUT_AT: Pt[] = EN ? [{ x: 470, y: 640 }] : [{ x: 425, y: 645 }, { x: 515, y: 715 }];
/** 8a: the 万岁 burst(s) (zh two, en one: LONG LIVE / THE KING!); the tag 秦国大臣 above the three ministers */
export const ov8a = (f: number, P: { minA: Head; minB: Head; minC: Head; others: Head[] }): Node[] => {
  const ms = [P.minA, P.minB, P.minC];
  const g: Head = { x: ms.reduce((s, m) => s + m.x, 0) / 3, y: Math.min(...ms.map((m) => m.y)), r: ms.reduce((s, m) => s + m.r, 0) / 3 };
  return [
    ...TB.shouts.map((from, i) => shout({ f, from, x: SHOUT_AT[i].x, y: SHOUT_AT[i].y, size: EN ? 40 : 52, rot: i ? 5 : -6, key: `shout${from}` })),
    tag({ f, who: "qinMin", at: g, from: TAG.qinMin, out: TAG_OUT.qinMin, side: "up", avoid: [...ms, ...P.others] }),
  ];
};

// ====================================================================================================== 8b
/** the thought bubble's centre and radius: up and left of his head, under the source tag (its top y 240), its left
 *  edge 18 px in; its cloud 19-24 px clear of his head and wrap (WP8 b8 probe: convex hull of the head's meshes) */
export const BUBBLE = { x: 205, y: 405, r: 145 };
/** inside it: the five cities (74 px: at 58 they filled half the bubble) left of centre and the 「?」 right of them,
 *  clear of every icon (it sat on the lower right one): "the cities?" (offsets from the bubble's centre) */
const CITY_IN = { dx: -32, dy: 4, size: 74 }, QMARK_IN = { dx: 120, dy: -6, size: 96 };
/** where the puffs start: just off the left of his head at temple height (head radii from its centre). Off the wrap's
 *  top-left there is no room under the y 230 line for a bubble far enough away to string the puffs (they landed under
 *  the bubble or on the hat) */
const PUFF_FROM = { dx: -0.94, dy: -0.16 };
/** 8b: the thought bubble from his head (640, out 660) with five city icons and a 「?」 (645) */
export const ov8b = (f: number, P: { lin: Head }): Node[] => [
  bubble({
    f, from: HIT.bubble, out: TB.bubbleOut, x: BUBBLE.x, y: BUBBLE.y, r: BUBBLE.r, thought: true,
    to: { x: P.lin.x + PUFF_FROM.dx * P.lin.r, y: P.lin.y + PUFF_FROM.dy * P.lin.r },
    content: frag(
      cities({ f, from: HIT.bubble + 3, mode: "bubble", x: BUBBLE.x + CITY_IN.dx, y: BUBBLE.y + CITY_IN.dy, size: CITY_IN.size, out: TB.bubbleOut }),
      mark({ f, from: TB.qmark, out: TB.bubbleOut, x: BUBBLE.x + QMARK_IN.dx, y: BUBBLE.y + QMARK_IN.dy, text: "?", size: QMARK_IN.size }),
    ),
  }),
];

// ====================================================================================================== 9
/** 9: the gold ring round a spot on the jade in lady A's hands (瑕, 707-720); the glints on the give-back (730) and
 *  the hand-over (750) */
export const ov9 = (f: number, P: { jade: Pt; jadeR: number; spot: Pt }): Node[] => [
  ring({ f, from: TB.flaw, out: TB.ringOut, at: P.spot, r: Math.max(30, 0.42 * P.jadeR) }),
  glint({ f, from: HIT.giveBack[1], x: P.jade.x + 26, y: P.jade.y - 34, size: 100, key: "glintBack" }),
  glint({ f, from: HIT.handBack[1], x: P.jade.x + 26, y: P.jade.y - 34, size: 110, key: "glintHand" }),
];

// ====================================================================================================== 10b
/** the 怒发冲冠 stamp: upper left beside the lifted wrap (STORYBOARD centre (190, 420); 15 px further left since 10b's
 *  lens pans east and his wrap comes 20-25 px nearer it); English a little lower and further in, so its gloss (2 rows
 *  to about y 650) stays left of his face */
export const NUFA_AT = { x: EN ? 185 : 175, y: EN ? 410 : 420 };
/** a full-frame overlay with a round hole cut out of it (the jade kept clear of a stroke that would cross it) */
const holed = (key: string, node: Node, hole: Head): Node => {
  if (!node) return null;
  const { x, y, r } = hole, c = (v: number) => v.toFixed(1);
  const clip = `path(evenodd, "M0,0H1080V1920H0Z M${c(x - r)},${c(y)} a${c(r)},${c(r)} 0 1,0 ${c(2 * r)},0 a${c(r)},${c(r)} 0 1,0 ${c(-2 * r)},0 Z")`;
  return React.createElement("div", { key, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", clipPath: clip } }, node);
};
/** 10b: the rage strokes round his head (803-830; none across the jade beside it: its disc and a margin are cut out)
 *  and THE STAMP 怒发冲冠 (806, out 842) */
export const ov10b = (f: number, P: { lin: Head; jade: Head }): Node[] => [
  holed("rageHoled", rage({ f, from: HIT.rage, out: TB.rageOut, at: P.lin, n: 11 }), { ...P.jade, r: P.jade.r + 14 }),
  stamp({ f, id: "nufa", from: HIT.nufa, out: TB.nufaOut, x: NUFA_AT.x, y: NUFA_AT.y }),
];

export const SHOTS_B = { S7a, S7b, S8a, S8b, S9, S10a, S10b, S11 };
