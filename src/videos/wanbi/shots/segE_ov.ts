// SEGMENT E's 2D LAYER (STORYBOARD lines 20-23) and its beats. WP11. Which overlays each shot shows, when and where;
// the pieces are the film's graphic layer (../hud, WP6). This file only times and places them from the screen points
// the shot measured after w.update() (heads from headPx, world points from w.project). Every function is a pure
// function of the frame and returns its overlays as a list (null where nothing shows); segE.ts joins them with frag.
// Times: absolute film frames, from beats.ts (HIT, TAG, TAG_OUT, TAG_FLIP, BEAT) or looked up below (T). Places: film px.
// Zones (BIBLE 2.1): nothing above y 210, in the caption band 1190-1498, below 1613, right of x 930 below y 900; the
// source tag owns the top-left corner, the jade chip the top right (x 780-984, y 215-310). The chip shows 赵国 since the
// reveal (beats.ts HOLDER) and fades with the source tag on BEAT.chipFade (2084-2089) by itself (hud/index.ts).
// Overlays never cross a cut (rule 11): each one leaves before its shot's last frame; the whip's streak is drawn by 22
// and by 23a with the same call.
import React from "react";
import { EN } from "../lang";
import { cap, capWord, line, lerp } from "../story";
import { shot, HIT, TAG, TAG_FLIP } from "../beats";
import { tag, stamp, bill, glint, streak, type Head, type Pt } from "../hud";
// 23a's solid vanishing arch is drawn here from the graphic layer's own city icon and arch points (no shared change)
import { cityIcon, ARCH } from "../hud/graphic";
import { FULL, HC, life } from "../hud/base";

type Node = React.ReactNode;
const S20a = shot("20a"), S20b = shot("20b"), S21a = shot("21a"), S21b = shot("21b"), S22 = shot("22"), S23a = shot("23a"), S23b = shot("23b");

/** segment E's beats that beats.ts does not name (each looked up from the narration; today's numbers in comments) */
export const T = {
  // ---- 20a: 面面相觑 (the gazes snap A -> B, B -> C, C -> A, then all to screen right, the envoy)
  snaps: [HIT.snap, HIT.snap + 10, capWord(20, "面面相觑").from, capWord(20, "面面相觑").from + 10] as [number, number, number, number] /* 1690 1700 1710 1720 */,
  // ---- 20b: the guard strides from his mark (off-screen; when he sets off is segE.ts G_GO, from his path's length) and
  //      grabs on 拖; the tug toward the door to the end of 20b
  /** his left hand comes up to the envoy's arm over the last 5 frames of the stride (1746-1751) */ reach: HIT.grab - 5,
  /** the tug: the envoy's arm pulled out, his head tilts (1751-1757), held to the release */ tug: [HIT.grab, HIT.grab + 6] as [number, number],
  // ---- 21a: 秦王说: the STOP hand; 杀了他: the chop; 玉也回不来: the slump; 回不来: sad -> sigh
  stop: HIT.stop /* 1775 */, chop: capWord(21, "杀了他").from /* 1794 */, slump: HIT.slump /* 1814 */, sigh: capWord(21, "回不来").from /* 1822 */,
  // ---- 21b: 放他回去吧: the guard lets go; the king's seated bow; the envoy bows back (salute); he turns right and walks
  release: HIT.release /* 1840 */,
  /** the king's small seated bow (hands together at the chest, lookDown 12): down 1840-1844, held, up 1850-1854 */
  kingBow: [HIT.release, HIT.release + 4, HIT.release + 10, HIT.release + 14] as [number, number, number, number],
  /** the envoy's salute: down 1845-1849, held, up 1851-1853 (the storyboard's 1845-1853) */
  linBow: [HIT.bows, HIT.bows + 4, HIT.bows + 6, HIT.bows + 8] as [number, number, number, number],
  /** he turns right (1856-1860) and walks off toward the door from 1859: the cut to 22 comes 5 frames into the walk */
  turn: S21b.to - 7, walk: S21b.to - 4,
  /** the guard turns away (1842-1847) and walks back to his mark, out of the right edge */ guardTurn: [HIT.release + 2, HIT.release + 7] as [number, number],
  // ---- 22: THE BILL; the two 「0」; out; THE WHIP PAN RIGHT (toward Zhao): out on the last 5 frames of 22, in on 23a's first 4
  bill: HIT.bill /* 1866 */, zero: [HIT.zero1, HIT.zero2] as [number, number] /* 1890 1924 */, billOut: HIT.whip4 - 4 /* 1930 */,
  whip4: [HIT.whip4, S22.to, S23a.from, S23a.from + 3] as [number, number, number, number] /* 1934-1938 / 1939-1942 */,
  // ---- 23a: 价值连城 (out as 一座城 begins: the arch takes that space); the arch pops in solid, vanishes from the left;
  //      the king glances up at the empty arch (deadpan), back down to the jade (smile)
  stampOut: cap(23, 1).from - 5 /* 1972: gone on 1977 */, arch: cap(23, 1).from /* 1977 */, vanish: HIT.vanish /* 1985 */,
  glanceUp: HIT.vanish + 5 /* 1990 */, glanceBack: HIT.vanish + 20 /* 2005 */, archOut: S23a.to - 4 /* 2010 */,
  // ---- 23b: the cap
  /** the envoy rises from his kneel to the upright kneel as his hands go up to the cap (2042-2048) */ upKneel: [HIT.cap - 8, HIT.cap - 2] as [number, number],
  /** the king holds the cap out (2045-2050); both hold it (2050-2052); the king lets go */ capOut: [cap(23, 3).from, HIT.cap] as [number, number], letGo: HIT.cap + 2,
  /** the envoy lifts it toward his head (2052-2060); the swap on 当 (2061) puts it on */ lift: [HIT.cap + 2, HIT.crown - 1] as [number, number],
  /** the eunuch's four claps (2062, 2068, 2074, 2080) */ claps: [HIT.crown + 1, HIT.crown + 7, HIT.crown + 13, HIT.crown + 19],
  /** the envoy rises to his feet (2076-2084) */ rise: [HIT.rise23, HIT.rise23 + 8] as [number, number],
  /** a small nod (2090) and a blink (2098) */ nod: line(23).to + 7, blink: line(23).to + 15,
  /** THE END (the producer's brief: the last frame holds the promotion and the 价值连城 stamp). The stamp needs the
   *  space above the three heads, where the tag is (pinned above him, clear of his tall cap, 345-519 px risen): the tag
   *  leaves on 2088 (its role row 上大夫 has held 27 frames since the flip; beats.ts TAG_OUT.lin23 is 2100) and the
   *  stamp 价值连城 is slapped on again after it, landing 2094 (in the low final note, 2090-2106), held to the last
   *  frame */ tagOut: line(23).to + 5 /* 2088 */, endStamp: line(23).to + 9 /* 2092: lands 2094 */,
};

// ====================================================================================================== 22
/** the whip pan's streak (22 -> 23a, toward Zhao: RIGHT), the same call in both shots */
const whipStreak = (f: number) => streak({ f, from: T.whip4[0], to: T.whip4[3], dir: 1 });
/** shot 22: THE BILL (bamboo slats, at hud bill()'s own box x 110-770, y 236-636: clear of the source tag and the chip;
 *  the envoy walks under it); the two 「0」; it slides away before the whip; the whip's streak */
export const ov22 = (f: number): Node[] => [
  bill({ f, from: T.bill, out: T.billOut, zeroAt: T.zero }),
  whipStreak(f),
];

// ====================================================================================================== 23a
/** where 价值连城 lands in 23a, and its size. The storyboard's (540, 270) at the default 124 px covered the jade chip's
 *  left half (its corner, x 780-984 y 215-310, since the reveal: film still 1950) and its top went to y 151. Here the
 *  seal is 100 px (516 px wide with its rim, about 534 turned -5 deg) between the source tag (to x 243) and the chip,
 *  its top on the 210 line: 254-770 x, 214-421 y (stampRect) in Chinese, above his crown (about y 430). In English
 *  the gloss (one row, 526 px) needs 60 px more: the stamp sits 42 px higher, 249-775 x, 172-439 y (as the
 *  storyboard's, over the top line rather than over his crown) */
export const LIANCHENG_AT = { x: 512, y: EN ? 270 : 312, size: 100 };
/** the pop of an icon t frames after its start (hud graphic's pop5): 0 -> 1.15 -> 1 in 5 frames */
const pop5 = (t: number) => (t < 0 ? 0 : t < 3 ? lerp(0.2, 1.15, (t + 1) / 3) : t < 5 ? lerp(1.15, 1, (t - 2) / 2) : 1);
/** THE ARCH OF 23a, SOLID: shot 3's arch (hud ARCH, its 60 px icons, drawn left over right), not cities()' "vanish"
 *  mode, which always draws the ghost (dashed grey outlines at 40 %: invisible on the pale Zhao wall at phone size,
 *  director f1996). The vanish mode's timing: the 15 icons pop in from the left half a frame apart (1977-1984); from
 *  T.vanish one by one from the left each swells 1.25 x and shrinks away in 4 frames with a gold puff where it stood
 *  (1985-2005); the layer leaves on T.archOut */
const ARCH23 = { size: 60, vanishLen: 20 };
const solidVanishArch = (f: number): Node => {
  const Lf = life(f, T.arch, T.archOut);
  if (!Lf) return null;
  const { size, vanishLen } = ARCH23, kids: Node[] = [], lvS = 1 - 0.12 * Lf.lv;
  for (let i = 14; i >= 0; i--) {                     // drawn right to left: the left one lies on top
    const a: Pt = ARCH[i], t = f - (T.vanish + (i * vanishLen) / 15);
    let s = pop5((f - T.arch - i * 0.5) * 0.9), op = 1;
    if (t >= 0) { s *= t < 1 ? 1.25 : Math.max(0, 1.25 * (1 - (t - 1) / 3)); op = t < 4 ? 1 : 0; }
    if (t >= 0 && t < 7) {
      const u = t / 7;
      kids.push(React.createElement("circle", { key: `v${i}`, cx: a.x, cy: a.y, r: size * (0.3 + 0.5 * u), fill: "none", stroke: HC.gold, strokeWidth: 5 * (1 - u), opacity: 1 - u }));
    }
    kids.push(cityIcon(`c${i}`, a.x, a.y, size, s * lvS, 0, op));
  }
  return React.createElement("svg", { key: "arch23", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible", opacity: 1 - Lf.lv } }, kids);
};
/** shot 23a (the rhyme of 3): the streak of the whip landing; THE STAMP 价值连城 (out as 一座城 begins); the arch of the
 *  fifteen cities pops in solid (shot 3's) and vanishes one by one from the left (没换到); gone before the cut */
export const ov23a = (f: number): Node[] => [
  whipStreak(f),
  stamp({ f, id: "liancheng", from: HIT.liancheng, out: T.stampOut, ...LIANCHENG_AT }),
  solidVanishArch(f),
];

// ====================================================================================================== 23b
/** the end stamp's place (the chip and the source tag are gone by then: full size, centred): high, above the three
 *  heads and his cap's top (risen: about y 541): the seal 217-466 px, with the English gloss 217-527 (stampRect) */
export const END_STAMP_AT = { x: 540, y: 336 };
/** the tag's tail tip above his head in head radii: hud TAG_LIFT.lin23 (1.95) until the flip squashes the plate, then
 *  higher, so the plate clears LIN_OFFICIAL's cap (0.52 m above his head's centre = 2.25 radii: at 1.95 the plate
 *  covered its top) */
const LIFT23 = (f: number) => (f < TAG_FLIP.lin23 - 1 ? 1.95 : 2.35);
/** the swap's gold burst round his head, in his head radii: its centre BURST23.dy above his head's centre, radius
 *  BURST23.r (the rays reach 1.07 r). Fix round (director f2065: at 0.55 / 2.1 the outer rays cut across the King of
 *  Zhao's eye, the eunuch's face, the jade and the tag on the frames the viewer studies): WP11 probe18.ts, frames
 *  2061-2068, no ray within a stroke of the king's or the eunuch's head, the disc or the tag */
const BURST23 = { dy: 0.9, r: 1.4 };
/** hud burst() (12 short gold rays on an ink line, 8 frames, growing out and fading) without the rays that point down
 *  into his own face: centred above his head's centre, the two lowest rays crossed his cheeks (still f2065, fix
 *  round). Drawn here as the arch is (no shared change): the same strokes, timing and phase as hud fx.tsx burst */
const crownBurst = (f: number, x: number, y: number, r: number): Node => {
  const u = (f - HIT.crown) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), kids: Node[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.3, c = Math.cos(a), sn = Math.sin(a);
    if (sn > 0.6) continue;                            // screen y is down: these point into his face
    const d = `M${x + c * r0},${y + sn * r0} L${x + c * (r0 + len)},${y + sn * (r0 + len)}`;
    kids.push(React.createElement("path", { key: `a${i}`, d, stroke: HC.ink, strokeWidth: 17 }), React.createElement("path", { key: `b${i}`, d, stroke: HC.gold, strokeWidth: 9 }));
  }
  const g = React.createElement("g", { key: "g", opacity: 1 - u * u, strokeLinecap: "round", fill: "none" }, kids);
  return React.createElement("svg", { key: "crownBurst", width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } }, g);
};
/** shot 23b: the glint on the official's cap as the king holds it out (T.capOut: it pulls the eye to the prop that sets
 *  up the punchline; `cap` = its board's middle on screen); the envoy's last tag (蔺相如 · 宦官的门客 / "the envoy" ·
 *  "the eunuch's retainer"), whose role row FLIPS to 上大夫 / "senior official" on 当 (the punchline), pinned above his
 *  head (it rises with him), out on T.tagOut; the gold burst round his head on the swap; the end stamp 价值连城
 *  (lands 2094, held to the last frame) */
export const ov23b = (f: number, P: { lin: Head; king: Head; miao: Head; cap: Pt | null }): Node[] => [
  P.cap ? glint({ f, from: T.capOut[0], x: P.cap.x, y: P.cap.y, size: 80, key: "capGlint" }) : null,
  tag({ f, who: "lin23", at: P.lin, from: TAG.lin23, out: T.tagOut, flipAt: TAG_FLIP.lin23, side: "up", lift: LIFT23(f), avoid: [P.king, P.miao] }),
  crownBurst(f, P.lin.x, P.lin.y - BURST23.dy * P.lin.r, BURST23.r * P.lin.r),
  stamp({ f, id: "liancheng", from: T.endStamp, x: END_STAMP_AT.x, y: END_STAMP_AT.y, out: 1e9, key: "endStamp" }),
];

export { S20a, S20b, S21a, S21b, S22, S23a, S23b };
