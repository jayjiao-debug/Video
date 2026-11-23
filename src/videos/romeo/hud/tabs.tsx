// hud/tabs.tsx: THE NAME TABS of the two leads and THE SIDE TABS (the friar, Tybalt), in the film's skin (hud/skin.ts,
// 「信」 the letter). They never stop the action: no freeze, nobody isolated; the picture runs under them. Pure functions
// of the frame.
//
// v5 (23 Nov 2026, the owner on the v4 cut: "The name can be more inside it?" and "Actually give what family/ house
// they belong to so people have more context"):
//   THE HOUSE. Each lead's tab is headed by a band of the house's own colour with the house on it (蒙太古家 in blue,
//   凯普莱特家 in red), and the hanging banner carries it down its head in small gilt characters above the name. Tybalt's
//   tab wears the same red band as Juliet's: who is whose kin reads from the colour.
//   THE NAME INSIDE THE BANNER. The banner hung from the frame's edge, so half of it lay under the part the app cuts
//   off (x < 58 on the owner's phone, up to 108 on a narrower one) and its words had to keep to its inner half. It is
//   now a swallow-tailed banner on a gilt rod hanging FREE of the edge (its outer edge 84 px in), and the house, the
//   name and the slip sit on its centre line. Every word is still inside x 110..970.
//
//   <NameTab f from who box hold? name? tag? house? id? />   the leads' "banner into a name tab" (Jay's pick: B4 name spine)
//     f      the film frame
//     from   the frame the banner drops: in the gap after a line, on the person's first good look
//     who    "romeo" (Montague blue, on the LEFT, tab 蒙太古家 / 罗密欧 · 恋爱脑, a heart in blue wax)
//            "juliet" (Capulet red, on the RIGHT, tab 凯普莱特家 / 朱丽叶 · 行动派, an arrow in red wax)
//     box    THE PERSON'S SCREEN BOX, film px: head and shoulders is best. Either the box on this frame (a Rect, or null
//            when the person is off screen) or a function of the frame, (f) => Rect | null. The tab is placed from it
//            on every frame (beside the head on the banner's side, falling back to the other side, then above it),
//            so it follows its person through the camera move with nothing remembered. Pass the function when you can:
//            the banner then takes its width from the box on frame `from` and does not breathe with the walk.
//     hold   frames from the drop to the tab's last frame (default 150 = 5 s; the tab alone shows from frame 53)
//     name / tag / house   other words (defaults by `who`); the name at most 3 characters, the house at most 5
//     id     the prefix of its SVG ids (default "romeo-tab-<who>")
//   nameTabRect(f, from, who, box)   the box it takes on frame f, for the overlay check
//
//   WHAT HAPPENS (frames from `from`; something new every 0.2 to 0.45 s while it builds):
//     0   a house banner on a gilt rod comes in from the side and UNROLLS down from under the REC row to y 996
//         (painted parchment with a swallow tail: the picture keeps running beside it)             "banner whip-crack"
//     2-6  the house is written down its head in small gilt characters
//     7 / 11 / 15   the name's characters are stamped down it one at a time, big                  "three quill stabs"
//     22  the epithet's slip flaps onto it                                                         "paper flap"
//     31  a wax dot thunks onto the slip's corner (heart / arrow)                                  "wax tick"
//     44-52  the banner FOLDS into its own spine: it shrinks onto the small tab beside the person, the name flies with
//         it and turns to the house's ink, the parchment of the tab opens out of the spine         "paper fold, two creases"
//     50  the house is written on the tab's band; 53 the wax dot settles on the tab; 54-57 the epithet is written
//     66  a glint crosses the wax. Then the tab rides with the person until hold; it flaps away over the last 5 frames.
//   WHERE: the banner is 152 to 168 px wide, its outer edge 84 px from the frame's edge; its words sit on its centre
//     line, inside x 110..970 and above y 1000; it stays 18 px clear of the person's box. The tab is 247 x 168 (shrunk
//     to fit its slot, never grown).
//
//   <SideTab f from box who? hold? name? tag? house? side? above? id? />   a side tab on the live shot, for the others
//     (above = over the head, not beside it: Tybalt's in the duel, where Romeo's head is beside his):
//     who    "friar" (劳伦斯神父 · 草药行家, brown, no house, a herb leaf) or "tybalt" (凯普莱特家 / 提伯尔特 · 朱丽叶的表哥,
//            Capulet red, a blade)
//     box    their screen box (as above);  hold  frames it stays (default 105 = 3.5 s);  side  "left" | "right"
//            (the slot it prefers beside them; default by `who`)
//     0 the spine is stamped beside them; 1-6 the parchment opens out of it; 3 the house on its band; 4 the name is
//     written; 12 the wax dot thunks on; 15 the epithet is written; 22 (the friar) a sprig is drawn after it; it
//     follows them; it flaps away over the last 5 frames.              Sounds: "paper flap", then "wax tick".
//   sideTabRect(f, from, box, who?, side?, hold?)   the box it takes on frame f
//   <FriarBanner ... /> and friarBannerRect(...) are the friar's (the same piece with who = "friar").
import React from "react";
import { life, part, clamp01, easeOutBack, smooth, lerp, slap, free, fit, setRow, FRAME_9x16, type Rect } from "../../../kit/overlay";
import { SKIN, TONE, HOUSE, type House, flapOut, thunk, unfold, breathe } from "./skin";
import { letterDefs, sheet, wax, quill, quillW, type Emblem } from "./marks";

const n1 = (v: number) => v.toFixed(1);
export type BoxAt = Rect | null | ((f: number) => Rect | null);
const boxOn = (b: BoxAt, f: number) => (typeof b === "function" ? b(f) : b);
type Side = "left" | "right";

/** the words and the sign of each person: `house` = the family they belong to (it heads the tab on a band of `tone`,
 *  the house's colour; "" = none), `tone` = whose colours the tab wears */
export const WHO = {
  romeo: { name: "罗密欧", tag: "恋爱脑", house: "蒙太古家", emblem: "heart" as Emblem, side: "left" as Side, tone: "romeo" as House },
  juliet: { name: "朱丽叶", tag: "行动派", house: "凯普莱特家", emblem: "arrow" as Emblem, side: "right" as Side, tone: "juliet" as House },
  friar: { name: "劳伦斯神父", tag: "草药行家", house: "", emblem: "leaf" as Emblem, side: "right" as Side, tone: "friar" as House },
  tybalt: { name: "提伯尔特", tag: "朱丽叶的表哥", house: "凯普莱特家", emblem: "blade" as Emblem, side: "left" as Side, tone: "juliet" as House },
} as const;
export type Who = keyof typeof WHO;

// ---------------------------------------------------------------------------------------------------- the tab
/** the tab's numbers (px): its height WITHOUT the house's band, the band, the spine, the paddings, the point toward
 *  its person, the rows (their y is measured from under the band) */
export const TAB = { h: 132, head: 36, spine: 18, padL: 16, padR: 22, point: 16, namePx: 60, tagPx: 38, housePx: 28, nameY: 45, tagY: 99, wax: 22 } as const;
/** the band's height for a house ("" = no band) */
const headOf = (house: string) => (house ? TAB.head : 0);
const tabW = (name: string, tag: string, namePx: number, house = "") =>
  TAB.spine + TAB.padL + Math.max(quillW(name, namePx), quillW(tag, TAB.tagPx, { body: true }), house ? quillW(house, TAB.housePx, { body: true }) + 26 : 0) + TAB.padR + 6;
/** where a tab of w x (TAB.h + hd) sits on a frame: beside its person's head on `side` (else the other side, else above
 *  the head), hugging the person, shrunk to fit, never grown. The rows it takes are the kit's free() rows (inside the
 *  phone-safe frame, clear of the app's buttons); side = the side of the person it ended on. hd = its band's height. */
/** the size a tab above a head keeps (of its full size) by resting on the crown */
const UP_MIN = 0.85;
export const tabPlace = (box: Rect | null, side: Side, w: number, hd = 0, above = false): { x0: number; y0: number; s: number; side: Side } => {
  const F = FRAME_9x16, full = w + TAB.point, other: Side = side === "left" ? "right" : "left", gap = 20, H = TAB.h + hd;
  const lost = { x0: side === "left" ? F.side : F.W - F.side - w, y0: 430, s: 1, side };
  if (!box) return lost;
  const top = Math.max(F.top + 8, Math.min(F.caption.y0 - gap - H, box.y0 + 0.14 * (box.y1 - box.y0) - hd * 0.5)), band = free(F, top, top + H);
  let best: { x0: number; y0: number; s: number; side: Side } | null = null;
  // (above = the tab goes over the head whatever room there is beside it: Tybalt's, with Romeo's head beside his)
  for (const name of above ? [] : [side, other]) {
    const slot: Rect = name === "left" ? { x0: band.x0, y0: top, x1: box.x0 - gap, y1: top + H } : { x0: box.x1 + gap, y0: top, x1: band.x1, y1: top + H };
    if (slot.x1 - slot.x0 < 70) continue;
    const B = fit({ w: full, h: H }, slot, { ax: name === "left" ? 1 : 0, ay: 0 });
    const got = { x0: name === "left" ? B.r.x0 : B.r.x0 + TAB.point * B.s, y0: B.r.y0, s: B.s, side: name };
    if (B.s >= 0.74) return got;
    if (!best || B.s > best.s) best = got;
  }
  if (box.y0 - gap - (F.top + 8) >= 70) {
    // above the head (a close-up: the head fills the frame's width). The tab must stay readable there (v5: with the
    // house band it shrank to 0.55 over Juliet), so it may rest ON the crown: it takes up to an eighth of the head's
    // height off the top of the hair or the hat, as far as it needs to reach 0.85 of its size, never the brows
    const room = box.y0 - gap - (F.top + 8), over = Math.max(0, Math.min(UP_MIN * H - room, 0.125 * (box.y1 - box.y0) + gap));
    const up = free(F, F.top + 8, box.y0 - gap + over), B = fit({ w: full, h: H }, up, { ax: clamp01(((box.x0 + box.x1) / 2 - up.x0 - full / 2) / Math.max(1, up.x1 - up.x0 - full)), ay: 1 });
    if (!best || B.s > best.s) best = { x0: B.r.x0, y0: B.r.y0, s: B.s, side };
  }
  return best ?? lost;
};
/** the tab's outline: a slip with a point toward its person (in the tab's own px: its top left is 0, 0) */
const tabPath = (w: number, side: Side, H: number) => side === "left"
  ? `M6,0 L${w},0 L${w + TAB.point},${H / 2} L${w},${H} L6,${H} Z`
  : `M${w - 6},0 L0,0 L${-TAB.point},${H / 2} L0,${H} L${w - 6},${H} Z`;
/** the tab's own px to its parts: the spine's box, the rows' left edge, the wax's place */
const tabParts = (w: number, side: Side) => {
  const sp0 = side === "left" ? 0 : w - TAB.spine, inner = side === "left" ? TAB.spine : w - TAB.spine;
  const tx0 = side === "left" ? TAB.spine + TAB.padL : TAB.padR + 4;
  return { sp0, inner, tx0, wax: { x: side === "left" ? w - 4 : 4, y: 8 } };
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp01(k)))).join(",")})`; };
type P2 = [number, number];
const poly = (pts: P2[]) => `M${pts.map((p) => `${n1(p[0])},${n1(p[1])}`).join(" L")} Z`;

/** the tab's parchment, the house's band across its head (hd px; 0 = none) and its spine line: `open` 0..1 = how far
 *  the slip has opened out of the spine */
const tabBody = (p: string, w: number, side: Side, house: House, open: number, hd = 0) => {
  if (open <= 0) return null;
  const T = tabParts(w, side), H = TAB.h + hd, Hs = HOUSE[house], d = tabPath(w, side, H);
  return (
    <g transform={`translate(${T.inner},0) scale(${open.toFixed(3)},1) translate(${-T.inner},0)`}>
      {sheet(p, "tab", { x0: 0, y0: 0, x1: w, y1: H }, { path: d, shadow: "small", burn: 6, seed: 7 })}
      {hd > 0 ? (
        // THE HOUSE'S BAND: painted on the parchment's head in the house's colour (roughened with the same deckle as the
        // sheet, so their edges are one edge), a gilt rule under it
        <g filter={`url(#${p}-deckle)`}>
          <g clipPath={`url(#${p}-tab-c)`}>
            <rect x={-TAB.point - 4} y={-6} width={w + 2 * TAB.point + 8} height={hd + 6} fill={Hs.body} />
            <rect x={-TAB.point - 4} y={-6} width={w + 2 * TAB.point + 8} height={12} fill={Hs.hi} opacity={0.28} />
            <rect x={-TAB.point - 4} y={hd - 5} width={w + 2 * TAB.point + 8} height={5} fill={Hs.deep} opacity={0.75} />
            <rect x={-TAB.point - 4} y={hd} width={w + 2 * TAB.point + 8} height={2.6} fill={TONE.gold} />
            <rect x={-TAB.point - 4} y={hd + 2.6} width={w + 2 * TAB.point + 8} height={1} fill={TONE.goldDeep} opacity={0.7} />
          </g>
        </g>
      ) : null}
      <rect x={Math.min(T.inner, side === "left" ? w : 0)} y={0} width={Math.abs(w - TAB.spine)} height={H} fill={TONE.shadow} opacity={0.5 * (1 - open)} />
      <line x1={T.inner + (side === "left" ? 5 : -5)} y1={hd + 7} x2={T.inner + (side === "left" ? 5 : -5)} y2={H - 7} stroke={TONE.gold} strokeWidth={3} />
      <line x1={T.inner + (side === "left" ? 7.5 : -7.5)} y1={hd + 7} x2={T.inner + (side === "left" ? 7.5 : -7.5)} y2={H - 7} stroke={TONE.goldDeep} strokeWidth={1} opacity={0.7} />
      <line x1={T.tx0 + 2} y1={hd + 74} x2={side === "left" ? w - 22 : w - TAB.spine - 12} y2={hd + 74} stroke={Hs.body} strokeWidth={1.6} opacity={0.35} strokeDasharray="2 5" />
    </g>
  );
};
/** the house on the tab's band (in the tab's own px), written on by k */
const houseRow = (p: string, house: string, tx0: number, hd: number, k: number) =>
  house && hd > 0 ? quill(p, "house", house, tx0 + 1, hd / 2 - 0.5, TAB.housePx, TONE.paperHi, { anchor: "start", body: true, seed: 11, k }) : null;
/** the spine: a short band of the house's colour */
const spinePts = (x0: number, y0: number, w: number, s: number, side: Side, hd = 0): P2[] => {
  const a = x0 + (side === "left" ? 0 : (w - TAB.spine) * s), b = a + TAB.spine * s, h = (TAB.h + hd) * s;
  return [[a, y0], [b, y0], [b, y0 + h], [(a + b) / 2, y0 + h], [a, y0 + h]];
};

// ---------------------------------------------------------------------------------------------------- the leads' banner
/** the beats of a name tab, in frames from `from` */
export const NAME_TAB = { slam: 0, house: 2, name: [7, 11, 15], label: 22, wax: 31, fold: 44, foldN: 8, open: 46, head: 50, settle: 53, tag: 54, glint: 66, hold: 150 } as const;
/** THE HANGING BANNER: from under the REC row to its swallow tail, on a gilt rod. `out` = its outer edge's distance
 *  from the frame's edge (it hangs free of the edge: the app cuts the first 58 to 108 px off), wide / narrow = how far
 *  its inner edge may reach into the frame, clear = its distance from the person's box, rim = its painted border,
 *  rod = how far the rod stands out each side */
const STRIP = { y0: 338, y1: 996, tail: 52, out: 84, wide: 252, narrow: 236, clear: 18, rim: 18, rod: 12 } as const;
/** the words on it: the house's small characters, the gap under them, the name's size, the slip's hand */
const WORDS = { top: 36, housePx: 34, houseStep: 37, gap: 16, big: 84, step: 91, slipPx: 38, slipH: 60 } as const;
/** how far the banner reaches into the frame for a person's box (it stays clear of the person) */
const stripReach = (box: Rect | null, side: Side) => {
  if (!box) return STRIP.wide;
  const room = side === "left" ? box.x0 : FRAME_9x16.W - box.x1;
  return Math.max(STRIP.narrow, Math.min(STRIP.wide, room - STRIP.clear));
};
/** the banner's outline for a reach E, as seen from the LEFT edge (mirror x for the right); `drop` 0..1 = how far it
 *  has unrolled from its rod */
const stripPts = (E: number, drop = 1): P2[] => {
  const y = (v: number) => STRIP.y0 + (v - STRIP.y0) * drop;
  return [[STRIP.out, STRIP.y0], [E, STRIP.y0], [E, y(STRIP.y1)], [(STRIP.out + E) / 2, y(STRIP.y1 - STRIP.tail)], [STRIP.out, y(STRIP.y1)]];
};

export const nameTabRect = (f: number, from: number, who: "romeo" | "juliet", box: BoxAt, hold: number = NAME_TAB.hold): Rect | null => {
  const t = f - from;
  if (t < 0 || t > hold) return null;
  const W = WHO[who], hd = headOf(W.house), w = tabW(W.name, W.tag, TAB.namePx, W.house), P = tabPlace(boxOn(box, f), W.side, w, hd);
  const tab: Rect = { x0: P.x0 - (P.side === "right" ? TAB.point : 0) * P.s, y0: P.y0 - 12 * P.s, x1: P.x0 + (w + (P.side === "left" ? TAB.point + 14 : 0)) * P.s, y1: P.y0 + (TAB.h + hd) * P.s + 8 };
  if (t >= NAME_TAB.settle) return tab;
  const E = stripReach(boxOn(box, typeof box === "function" ? from : f), W.side);
  const strip: Rect = W.side === "left" ? { x0: 110, y0: STRIP.y0, x1: E + STRIP.rod, y1: STRIP.y1 } : { x0: FRAME_9x16.W - E - STRIP.rod, y0: STRIP.y0, x1: 970, y1: STRIP.y1 };
  return t < NAME_TAB.fold ? strip : { x0: Math.min(strip.x0, tab.x0), y0: Math.min(strip.y0, tab.y0), x1: Math.max(strip.x1, tab.x1), y1: Math.max(strip.y1, tab.y1) };
};

export const NameTab: React.FC<{ f: number; from: number; who: "romeo" | "juliet"; box: BoxAt; hold?: number; name?: string; tag?: string; house?: string; id?: string }> = (props) => {
  const { f, from, who, box, hold = NAME_TAB.hold } = props, id = props.id ?? `romeo-tab-${who}`;
  const L = life(f, from, from + hold, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, B = NAME_TAB, W = WHO[who], H = HOUSE[who], name = props.name ?? W.name, tag = props.tag ?? W.tag, house = props.house ?? W.house, side = W.side;
  const hd = headOf(house), hs = [...house].slice(0, 5);
  const mx = (x: number) => (side === "left" ? x : FRAME_9x16.W - x);
  // the tab beside the person, on this frame
  const w = tabW(name, tag, TAB.namePx, house), P = tabPlace(boxOn(box, f), side, w, hd), T = tabParts(w, P.side);
  const tx = (x: number) => P.x0 + x * P.s, ty = (y: number) => P.y0 + y * P.s;
  // the banner (its reach from the box on the drop's frame when the box is a function): it comes in from the side on
  // its rod and unrolls, with one bounce of its tail
  const E = stripReach(boxOn(box, typeof box === "function" ? from : f), side);
  const K = smooth(part(t, B.fold, B.foldN)), drop = easeOutBack(part(t + 1, B.slam, 6), 1.5) + (t === 6 ? -0.012 : t === 7 ? 0.006 : 0);
  const shove = (1 - smooth(part(t + 1, B.slam, 3))) * (E + 30);
  const sPts: P2[] = stripPts(E, drop).map(([x, y]) => [mx(x - shove), y]);
  const qPts = spinePts(P.x0, P.y0, w, P.s, P.side, hd);
  const pts: P2[] = sPts.map(([x, y], i) => [lerp(x, qPts[i][0], K), lerp(y, qPts[i][1], K)]);
  const d = poly(pts), gx0 = mx(STRIP.out - shove), gx1 = mx(E - shove);
  // the words down the banner's centre line: the house (small), the name (big), the epithet's slip
  const zx = (STRIP.out + E) / 2, zw = E - STRIP.out - 2 * STRIP.rim, big = Math.min(WORDS.big, zw - 20), step = big * (WORDS.step / WORDS.big);
  const hTop = STRIP.y0 + WORDS.top, nTop = hTop + hs.length * WORDS.houseStep + (hs.length ? WORDS.gap : 0), yName = (i: number) => nTop + big / 2 + step * i;
  // the name on the tab: each character's own place in the row
  const row = setRow(name, TAB.namePx, SKIN.display, 2), nameCx = T.tx0 + quillW(name, TAB.namePx) / 2;
  // the epithet's slip on the banner (its words inside x 110), and the wax on its corner
  const tw = quillW(tag, WORDS.slipPx, { body: true }), lw = tw + 28, lx = Math.max(zx + 6, 112 + tw / 2), ly = yName(2) + big / 2 + 8 + WORDS.slipH / 2, lrot = side === "left" ? -4 : 4;
  const lab = unfold(t, B.label, 5) * (1 - part(t, B.fold, 3));
  const wk = thunk(t, B.wax, 2), wSettle = t === B.settle ? 1.22 : t === B.settle + 1 ? 0.95 : 1;
  // (the wax sits on the slip's END CORNER, mostly off it: on the right-hand banner that end is the slip's first
  // character, and 4 px inside the end it covered a third of 「行」)
  const wxS = { x: mx(lx + lw / 2 + 9), y: ly - WORDS.slipH / 2 - 1 }, wxT = { x: tx(T.wax.x), y: ty(T.wax.y) };
  const open = t < B.open ? 0 : unfold(t, B.open, 6), out = flapOut(L.leave, side === "left" ? -1 : 1);
  const cx = tx(w / 2), cy = ty((TAB.h + hd) / 2), br = breathe(t, who === "romeo" ? 5 : 8), held = t > B.settle ? 1 : 0;
  // the rod: along the banner's head, standing out each side; it goes with the fold
  const rx0 = Math.min(pts[0][0], pts[1][0]) - STRIP.rod * (1 - K), rx1 = Math.max(pts[0][0], pts[1][0]) + STRIP.rod * (1 - K), ry = pts[0][1] + 7;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: out.o }}>
      <defs>
        {letterDefs(id, [H.wax])}
        <linearGradient id={`${id}-strip`} gradientUnits="userSpaceOnUse" x1={gx0} y1={0} x2={gx1} y2={0}>
          <stop offset="0" stopColor={H.deep} /><stop offset="0.55" stopColor={H.body} /><stop offset="1" stopColor={H.hi} />
        </linearGradient>
        <linearGradient id={`${id}-rod`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TONE.goldHi} /><stop offset="0.45" stopColor={TONE.gold} /><stop offset="1" stopColor={TONE.goldDeep} />
        </linearGradient>
        <clipPath id={`${id}-sc`}><path d={d} /></clipPath>
      </defs>
      <g transform={`translate(${n1(cx)},${n1(cy + out.dy + held * br.y)}) rotate(${(out.rot + held * 2 * br.rot).toFixed(2)}) scale(${out.s.toFixed(3)}) translate(${n1(-cx)},${n1(-cy)})`}>
        {/* the tab's parchment opens out of the spine */}
        <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>{tabBody(id, w, P.side, who, open, hd)}</g>
        {/* the house banner: painted parchment, a cream torn edge, a gilt rule; it folds into the tab's spine */}
        <g filter={`url(#${id}-${K < 0.6 ? "sh" : "shs"})`}>
          <g filter={`url(#${id}-deckle)`}>
            <path d={d} fill={K >= 1 ? H.body : `url(#${id}-strip)`} />
            {K < 1 ? (
              <g clipPath={`url(#${id}-sc)`} opacity={1 - K}>
                <path d={d} fill="none" stroke={TONE.gold} strokeWidth={STRIP.rim * 2} strokeLinejoin="miter" />
                <path d={d} fill="none" stroke={`url(#${id}-strip)`} strokeWidth={STRIP.rim * 2 - 7} strokeLinejoin="miter" />
                <path d={d} fill="none" stroke={TONE.paperHi} strokeWidth={13} strokeLinejoin="miter" />
                {[0.34, 0.67].map((u, i) => {
                  const y = lerp(pts[0][1], pts[4][1], u);
                  return <g key={i}><line x1={0} y1={y} x2={1080} y2={y} stroke={H.deep} strokeWidth={2.5} opacity={0.55} /><line x1={0} y1={y - 2.5} x2={1080} y2={y - 2.5} stroke={H.hi} strokeWidth={1.6} opacity={0.6} /></g>;
                })}
                {t < 4 ? <path d={d} fill="#fff" opacity={0.5 * (1 - t / 4)} /> : null}
              </g>
            ) : null}
          </g>
        </g>
        {/* its gilt rod with a knob at each end */}
        {K < 1 ? (
          <g opacity={1 - K} filter={`url(#${id}-shs)`}>
            <rect x={n1(rx0)} y={n1(ry - 5.5)} width={n1(rx1 - rx0)} height={11} rx={5.5} fill={`url(#${id}-rod)`} stroke={TONE.goldDeep} strokeWidth={1.6} />
            {[rx0, rx1].map((x, i) => <circle key={i} cx={n1(x)} cy={n1(ry)} r={8.5} fill={`url(#${id}-rod)`} stroke={TONE.goldDeep} strokeWidth={1.8} />)}
            <line x1={n1(rx0 + 6)} y1={n1(ry - 2.6)} x2={n1(rx1 - 6)} y2={n1(ry - 2.6)} stroke="#fff" strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
          </g>
        ) : null}
        {/* the house, written down the banner's head in small gilt characters, and a gilt lozenge under it */}
        {K < 1 && hs.length ? (
          <g opacity={1 - part(t, B.fold, 3)}>
            {hs.map((ch, i) => {
              const k = clamp01(part(t, B.house, 4) * hs.length - i);
              return k > 0 ? <g key={i} opacity={0.35 + 0.65 * k}>{quill(id, `h${i}`, ch, mx(zx), hTop + WORDS.houseStep * (i + 0.5), WORDS.housePx, TONE.goldHi, { seed: 13 + i * 3 })}</g> : null;
            })}
            {t >= B.house + 4 ? <path d={`M${n1(mx(zx))},${n1(nTop - WORDS.gap / 2 - 5)} l5,5 l-5,5 l-5,-5 Z`} fill={TONE.gold} stroke={TONE.goldDeep} strokeWidth={1} /> : null}
          </g>
        ) : null}
        {/* the epithet's slip, flapped onto the banner */}
        {lab > 0.02 ? (
          <g transform={`translate(${n1(mx(lx))},${n1(ly - WORDS.slipH / 2)}) rotate(${lrot}) scale(1,${lab.toFixed(3)})`}>
            {sheet(id, "slip", { x0: -lw / 2, y0: 0, x1: lw / 2, y1: WORDS.slipH }, { shadow: "small", burn: 5, seed: 9, jag: 1.6 }, quill(id, "sliptag", tag, 0, WORDS.slipH / 2 + 1, WORDS.slipPx, TONE.inkSoft, { body: true, seed: 5, k: part(t, B.label + 2, 4) }))}
          </g>
        ) : null}
        {/* the name: stamped down the banner, then it flies onto the tab and takes the house's ink */}
        {[...name].slice(0, 3).map((ch, i) => {
          const at = B.name[i] ?? B.name[2], s0 = slap(t, at, 1.7);
          if (s0 <= 0) return null;
          const c = row[i], px = lerp(big, TAB.namePx * P.s, K);
          const x = lerp(mx(zx), tx(nameCx + c.x), K), y = lerp(yName(i), ty(hd + TAB.nameY + c.y), K);
          return (
            <g key={i} transform={`translate(${n1(x)},${n1(y)}) rotate(${(c.rot * (0.5 + 0.5 * K)).toFixed(2)}) scale(${s0.toFixed(3)})`}>
              {quill(id, `n${i}`, ch, 0, 0, px, mix(TONE.paperHi, H.name, K * 1.4 - 0.4), { seed: 3 + i * 5 })}
            </g>
          );
        })}
        {/* on the tab: the house on its band, the epithet under the name */}
        {t >= B.head ? <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>{houseRow(id, house, T.tx0, hd, part(t, B.head, 4))}</g> : null}
        {t >= B.tag ? <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>{quill(id, "tag", tag, T.tx0 + 1, hd + TAB.tagY, TAB.tagPx, TONE.inkSoft, { anchor: "start", body: true, seed: 5, k: part(t, B.tag, 4) })}</g> : null}
        {/* the wax dot: onto the slip's corner, then it rides the fold onto the tab */}
        {wax(id, "dot", lerp(wxS.x, wxT.x, K), lerp(wxS.y, wxT.y, K), lerp(23, TAB.wax * P.s, K), { tone: H.wax, emblem: W.emblem, seed: who === "romeo" ? 4 : 6, drips: 1, rot: side === "left" ? -8 : 8, scale: wk.s * wSettle, squash: wk.squash, glint: clamp01((t - B.glint) / 8) })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- the side tabs
/** the beats of a side tab, in frames from `from` */
export const FRIAR = { spine: 0, open: 1, head: 3, name: 4, wax: 12, tag: 15, sprig: 22, glint: 40, hold: 105, namePx: 48 } as const;
type SideWho = "friar" | "tybalt";
export const sideTabRect = (f: number, from: number, box: BoxAt, who: SideWho = "friar", side: Side = WHO[who].side, hold: number = FRIAR.hold, above = false): Rect | null => {
  if (f < from || f > from + hold) return null;
  const W = WHO[who], hd = headOf(W.house), w = tabW(W.name, W.tag, FRIAR.namePx, W.house), P = tabPlace(boxOn(box, f), side, w, hd, above);
  return { x0: P.x0 - (P.side === "right" ? TAB.point : 0) * P.s, y0: P.y0 - 12 * P.s, x1: P.x0 + (w + (P.side === "left" ? TAB.point + 14 : 0)) * P.s, y1: P.y0 + (TAB.h + hd) * P.s + 8 };
};
export const SideTab: React.FC<{ f: number; from: number; box: BoxAt; who?: SideWho; hold?: number; name?: string; tag?: string; house?: string; side?: Side; above?: boolean; id?: string }> = (props) => {
  const { f, from, box, who = "friar", hold = FRIAR.hold } = props, id = props.id ?? `romeo-${who}`;
  const L = life(f, from, from + hold, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, B = FRIAR, W = WHO[who], name = props.name ?? W.name, tag = props.tag ?? W.tag, house = props.house ?? W.house, H = HOUSE[W.tone], hd = headOf(house);
  const w = tabW(name, tag, B.namePx, house), P = tabPlace(boxOn(box, f), props.side ?? W.side, w, hd, props.above), T = tabParts(w, P.side), TH = TAB.h + hd;
  const sp = slap(t, B.spine, 1.5), open = unfold(t, B.open, 6), wk = thunk(t, B.wax, 2), out = flapOut(L.leave, P.side === "left" ? -1 : 1);
  const cx = P.x0 + (w / 2) * P.s, cy = P.y0 + (TH / 2) * P.s, sk = who === "friar" ? part(t, B.sprig, 6) : 0;
  const gx = T.tx0 + quillW(tag, TAB.tagPx, { body: true }) + 16, gy = hd + TAB.tagY + 12;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: out.o }}>
      <defs>{letterDefs(id, [H.wax])}</defs>
      <g transform={`translate(${n1(cx)},${n1(cy + out.dy)}) rotate(${out.rot.toFixed(2)}) scale(${out.s.toFixed(3)}) translate(${n1(-cx)},${n1(-cy)})`}>
        <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>
          {tabBody(id, w, P.side, W.tone, open, hd)}
          <g transform={`translate(${T.sp0 + TAB.spine / 2},${TH / 2}) scale(${sp.toFixed(3)}) translate(${-(T.sp0 + TAB.spine / 2)},${-TH / 2})`} filter={`url(#${id}-shs)`}>
            <path d={poly(spinePts(0, 0, w, 1, P.side, hd))} fill={H.body} filter={`url(#${id}-deckle)`} />
          </g>
          {houseRow(id, house, T.tx0, hd, part(t, B.head, 4))}
          {quill(id, "name", name, T.tx0, hd + TAB.nameY, B.namePx, H.name, { anchor: "start", seed: 2, k: part(t, B.name, 6) })}
          {quill(id, "tag", tag, T.tx0 + 1, hd + TAB.tagY, TAB.tagPx, TONE.inkSoft, { anchor: "start", body: true, seed: 5, k: part(t, B.tag, 4) })}
          {/* the friar: a sprig drawn after the epithet: a stalk and four leaves, by the same quill */}
          {sk > 0 ? (
            <g transform={`translate(${n1(gx)},${n1(gy)})`} fill="none" stroke={H.body} strokeWidth={3.2} strokeLinecap="round" opacity={0.9}>
              <path d="M0,0 C8,-10 14,-22 16,-36" strokeDasharray="44 46" strokeDashoffset={44 * (1 - sk)} />
              {sk > 0.4 ? <path d="M5,-8 C-4,-12 -8,-18 -7,-24 C0,-22 5,-16 5,-8 Z M10,-17 C19,-17 25,-22 27,-29 C19,-29 12,-25 10,-17 Z" fill={H.hi} strokeWidth={2.2} /> : null}
              {sk > 0.75 ? <path d="M14,-27 C6,-32 4,-38 6,-44 C12,-41 15,-35 14,-27 Z M16,-36 C22,-38 26,-42 27,-47 C21,-46 17,-42 16,-36 Z" fill={H.hi} strokeWidth={2.2} /> : null}
            </g>
          ) : null}
          {wax(id, "dot", T.wax.x, T.wax.y, TAB.wax, { tone: H.wax, emblem: W.emblem, seed: who === "friar" ? 8 : 12, drips: 1, rot: who === "friar" ? 6 : -32, scale: wk.s, squash: wk.squash, glint: clamp01((t - B.glint) / 8) })}
        </g>
      </g>
    </svg>
  );
};
/** the friar's banner (劳伦斯神父 · 草药行家): the side tab with who = "friar" */
export const friarBannerRect = (f: number, from: number, box: BoxAt, side: Side = WHO.friar.side, hold: number = FRIAR.hold): Rect | null => sideTabRect(f, from, box, "friar", side, hold);
export const FriarBanner: React.FC<{ f: number; from: number; box: BoxAt; hold?: number; name?: string; tag?: string; side?: Side; id?: string }> = (props) => <SideTab {...props} who="friar" id={props.id ?? "romeo-friar"} />;
