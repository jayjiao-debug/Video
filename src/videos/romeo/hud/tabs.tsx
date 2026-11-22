// hud/tabs.tsx: THE NAME TABS of the two leads and THE FRIAR'S BANNER, in the film's skin (hud/skin.ts, 「信」 the
// letter). They never stop the action: no freeze, nobody isolated; the picture runs under them. Pure functions of the
// frame.
//
//   <NameTab f from who box hold? name? tag? id? />      the leads' "split-slam into a name tab" (Jay's pick: B4 name spine)
//     f      the film frame
//     from   the frame the strip slams in: in the gap after a line, on the person's first good look
//     who    "romeo" (Montague blue, from the LEFT, tab 罗密欧 · 恋爱脑, a heart in blue wax)
//            "juliet" (Capulet red, from the RIGHT, tab 朱丽叶 · 行动派, an arrow in red wax)
//     box    THE PERSON'S SCREEN BOX, film px: head and shoulders is best. Either the box on this frame (a Rect, or null
//            when the person is off screen) or a function of the frame, (f) => Rect | null. The tab is placed from it
//            on every frame (beside the head on the strip's side, falling back to the other side, then above it),
//            so it follows its person through the camera move with nothing remembered. Pass the function when you can:
//            the hanging strip then takes its width from the box on frame `from` and does not breathe with the walk.
//     hold   frames from the slam to the tab's last frame (default 150 = 5 s; the tab alone shows from frame 53)
//     name / tag   other words (defaults by `who`); the name at most 3 characters
//     id     the prefix of its SVG ids (default "romeo-tab-<who>")
//   nameTabRect(f, from, who, box)   the box it takes on frame f, for the overlay check
//
//   WHAT HAPPENS (frames from `from`; something new every 0.2 to 0.45 s while it builds):
//     0   a house banner SLAMS in from the side and hangs from under the REC row to y 996 (a strip of painted
//         parchment with a swallow tail: the picture keeps running beside it)                      "banner whip-crack"
//     7 / 11 / 15   the name's characters are stamped down it one at a time, big                  "three quill stabs"
//     22  the epithet's slip flaps onto it                                                         "paper flap"
//     31  a wax dot thunks onto the slip's corner (heart / arrow)                                  "wax tick"
//     44-52  the banner FOLDS into its own spine: it shrinks onto the small tab beside the person, the name flies with
//         it and turns to the house's ink, the parchment of the tab opens out of the spine         "paper fold, two creases"
//     53  the wax dot settles on the tab; 54-57 the epithet is written under the name
//     66  a glint crosses the wax. Then the tab rides with the person until hold; it flaps away over the last 5 frames.
//   WHERE: the banner's words sit inside x 110..284 (Romeo) or x 796..970 (Juliet) and above y 1000; the strip narrows
//     to stay 18 px clear of the person's box. The tab is 247 x 132 (shrunk to fit its slot, never grown).
//
//   <FriarBanner f from box hold? name? tag? side? id? />   劳伦斯神父 · 草药行家: a side banner on the live shot
//     box    his screen box (as above);  hold  frames it stays (default 105 = 3.5 s);  side  "left" | "right" (default
//            "right": the slot it prefers beside him)
//     0 the brown spine is stamped beside him; 1-6 the parchment opens out of it; 4 the name is written; 12 a wax dot
//     with a herb leaf thunks on; 15 the epithet is written; 22 a sprig is drawn after it; it follows him; it flaps
//     away over the last 5 frames.                                    Sounds: "paper flap", then "wax tick".
//   friarBannerRect(f, from, box, side?)   the box it takes on frame f
import React from "react";
import { life, part, clamp01, easeOutBack, smooth, lerp, slap, free, fit, setRow, FRAME_9x16, type Rect } from "../../../kit/overlay";
import { SKIN, TONE, HOUSE, type House, flapOut, thunk, unfold, breathe } from "./skin";
import { letterDefs, sheet, wax, quill, quillW, type Emblem } from "./marks";

const n1 = (v: number) => v.toFixed(1);
export type BoxAt = Rect | null | ((f: number) => Rect | null);
const boxOn = (b: BoxAt, f: number) => (typeof b === "function" ? b(f) : b);
type Side = "left" | "right";

/** the words and the sign of each person */
export const WHO = {
  romeo: { name: "罗密欧", tag: "恋爱脑", emblem: "heart" as Emblem, side: "left" as Side },
  juliet: { name: "朱丽叶", tag: "行动派", emblem: "arrow" as Emblem, side: "right" as Side },
  friar: { name: "劳伦斯神父", tag: "草药行家", emblem: "leaf" as Emblem, side: "right" as Side },
} as const;

// ---------------------------------------------------------------------------------------------------- the tab
/** the tab's numbers (px): its height, the spine, the paddings, the point toward its person, the two rows */
export const TAB = { h: 132, spine: 18, padL: 16, padR: 22, point: 16, namePx: 60, tagPx: 38, nameY: 45, tagY: 99, wax: 22 } as const;
const tabW = (name: string, tag: string, namePx: number) => TAB.spine + TAB.padL + Math.max(quillW(name, namePx), quillW(tag, TAB.tagPx, { body: true })) + TAB.padR + 6;
/** where a tab of w x TAB.h sits on a frame: beside its person's head on `side` (else the other side, else above the
 *  head), hugging the person, shrunk to fit, never grown. The rows it takes are the kit's free() rows (inside the
 *  phone-safe frame, clear of the app's buttons); side = the side of the person it ended on. */
export const tabPlace = (box: Rect | null, side: Side, w: number): { x0: number; y0: number; s: number; side: Side } => {
  const F = FRAME_9x16, full = w + TAB.point, other: Side = side === "left" ? "right" : "left", gap = 20;
  const lost = { x0: side === "left" ? F.side : F.W - F.side - w, y0: 430, s: 1, side };
  if (!box) return lost;
  const top = Math.max(F.top + 8, Math.min(F.caption.y0 - gap - TAB.h, box.y0 + 0.14 * (box.y1 - box.y0))), band = free(F, top, top + TAB.h);
  let best: { x0: number; y0: number; s: number; side: Side } | null = null;
  for (const name of [side, other]) {
    const slot: Rect = name === "left" ? { x0: band.x0, y0: top, x1: box.x0 - gap, y1: top + TAB.h } : { x0: box.x1 + gap, y0: top, x1: band.x1, y1: top + TAB.h };
    if (slot.x1 - slot.x0 < 70) continue;
    const B = fit({ w: full, h: TAB.h }, slot, { ax: name === "left" ? 1 : 0, ay: 0 });
    const got = { x0: name === "left" ? B.r.x0 : B.r.x0 + TAB.point * B.s, y0: B.r.y0, s: B.s, side: name };
    if (B.s >= 0.74) return got;
    if (!best || B.s > best.s) best = got;
  }
  if (box.y0 - gap - (F.top + 8) >= 70) {
    const up = free(F, F.top + 8, box.y0 - gap), B = fit({ w: full, h: TAB.h }, up, { ax: clamp01(((box.x0 + box.x1) / 2 - up.x0 - full / 2) / Math.max(1, up.x1 - up.x0 - full)), ay: 1 });
    if (!best || B.s > best.s) best = { x0: B.r.x0, y0: B.r.y0, s: B.s, side };
  }
  return best ?? lost;
};
/** the tab's outline: a slip with a point toward its person (in the tab's own px: its top left is 0, 0) */
const tabPath = (w: number, side: Side) => side === "left"
  ? `M6,0 L${w},0 L${w + TAB.point},${TAB.h / 2} L${w},${TAB.h} L6,${TAB.h} Z`
  : `M${w - 6},0 L0,0 L${-TAB.point},${TAB.h / 2} L0,${TAB.h} L${w - 6},${TAB.h} Z`;
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

/** the tab's parchment and its spine line: `open` 0..1 = how far the slip has opened out of the spine */
const tabBody = (p: string, w: number, side: Side, house: House, open: number) => {
  if (open <= 0) return null;
  const T = tabParts(w, side);
  return (
    <g transform={`translate(${T.inner},0) scale(${open.toFixed(3)},1) translate(${-T.inner},0)`}>
      {sheet(p, "tab", { x0: 0, y0: 0, x1: w, y1: TAB.h }, { path: tabPath(w, side), shadow: "small", burn: 6, seed: 7 })}
      <rect x={Math.min(T.inner, side === "left" ? w : 0)} y={0} width={Math.abs(w - TAB.spine)} height={TAB.h} fill={TONE.shadow} opacity={0.5 * (1 - open)} />
      <line x1={T.inner + (side === "left" ? 5 : -5)} y1={7} x2={T.inner + (side === "left" ? 5 : -5)} y2={TAB.h - 7} stroke={TONE.gold} strokeWidth={3} />
      <line x1={T.inner + (side === "left" ? 7.5 : -7.5)} y1={7} x2={T.inner + (side === "left" ? 7.5 : -7.5)} y2={TAB.h - 7} stroke={TONE.goldDeep} strokeWidth={1} opacity={0.7} />
      <line x1={T.tx0 + 2} y1={74} x2={side === "left" ? w - 22 : w - TAB.spine - 12} y2={74} stroke={HOUSE[house].body} strokeWidth={1.6} opacity={0.35} strokeDasharray="2 5" />
    </g>
  );
};
/** the spine: a short band of the house's colour */
const spinePts = (x0: number, y0: number, w: number, s: number, side: Side): P2[] => {
  const a = x0 + (side === "left" ? 0 : (w - TAB.spine) * s), b = a + TAB.spine * s, h = TAB.h * s;
  return [[a, y0], [b, y0], [b, y0 + h], [(a + b) / 2, y0 + h], [a, y0 + h]];
};

// ---------------------------------------------------------------------------------------------------- the leads' split-slam
/** the beats of a name tab, in frames from `from` */
export const NAME_TAB = { slam: 0, name: [7, 11, 15], label: 22, wax: 31, fold: 44, foldN: 8, open: 46, settle: 53, tag: 54, glint: 66, hold: 150 } as const;
/** the hanging strip: from under the REC row to its swallow tail; its widest and narrowest reach into the frame */
const STRIP = { y0: 338, y1: 996, tail: 52, lean: 56, wide: 318, narrow: 236, clear: 18 } as const;
/** how far the strip reaches into the frame for a person's box (it stays clear of the person) */
const stripReach = (box: Rect | null, side: Side) => {
  if (!box) return STRIP.wide;
  const room = side === "left" ? box.x0 : FRAME_9x16.W - box.x1;
  return Math.max(STRIP.narrow, Math.min(STRIP.wide, room - STRIP.clear));
};
/** the strip's outline for a reach E, as seen from the LEFT edge (mirror x for the right) */
const stripPts = (E: number): P2[] => [[-40, STRIP.y0], [E, STRIP.y0], [E - STRIP.lean, STRIP.y1], [E / 2 - 30, STRIP.y1 - STRIP.tail], [-40, STRIP.y1 - 4]];

export const nameTabRect = (f: number, from: number, who: "romeo" | "juliet", box: BoxAt, hold: number = NAME_TAB.hold): Rect | null => {
  const t = f - from;
  if (t < 0 || t > hold) return null;
  const W = WHO[who], w = tabW(W.name, W.tag, TAB.namePx), P = tabPlace(boxOn(box, f), W.side, w);
  const tab: Rect = { x0: P.x0 - (P.side === "right" ? TAB.point : 0) * P.s, y0: P.y0 - 12 * P.s, x1: P.x0 + (w + (P.side === "left" ? TAB.point + 14 : 0)) * P.s, y1: P.y0 + TAB.h * P.s + 8 };
  if (t >= NAME_TAB.settle) return tab;
  const E = stripReach(boxOn(box, typeof box === "function" ? from : f), W.side);
  const strip: Rect = W.side === "left" ? { x0: 110, y0: STRIP.y0, x1: E, y1: STRIP.y1 } : { x0: FRAME_9x16.W - E, y0: STRIP.y0, x1: 970, y1: STRIP.y1 };
  return t < NAME_TAB.fold ? strip : { x0: Math.min(strip.x0, tab.x0), y0: Math.min(strip.y0, tab.y0), x1: Math.max(strip.x1, tab.x1), y1: Math.max(strip.y1, tab.y1) };
};

export const NameTab: React.FC<{ f: number; from: number; who: "romeo" | "juliet"; box: BoxAt; hold?: number; name?: string; tag?: string; id?: string }> = (props) => {
  const { f, from, who, box, hold = NAME_TAB.hold } = props, id = props.id ?? `romeo-tab-${who}`;
  const L = life(f, from, from + hold, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, B = NAME_TAB, W = WHO[who], H = HOUSE[who], name = props.name ?? W.name, tag = props.tag ?? W.tag, side = W.side;
  const mx = (x: number) => (side === "left" ? x : FRAME_9x16.W - x);
  // the tab beside the person, on this frame
  const w = tabW(name, tag, TAB.namePx), P = tabPlace(boxOn(box, f), side, w), T = tabParts(w, P.side);
  const tx = (x: number) => P.x0 + x * P.s, ty = (y: number) => P.y0 + y * P.s;
  // the strip (its reach from the box on the slam's frame when the box is a function)
  const E = stripReach(boxOn(box, typeof box === "function" ? from : f), side);
  const K = smooth(part(t, B.fold, B.foldN)), slamK = easeOutBack(part(t, B.slam, 5), 1.5);
  const shove = (1 - slamK) * (E + 70) + (t === 5 ? -5 : t === 6 ? 3 : 0);
  const sPts: P2[] = stripPts(E).map(([x, y]) => [mx(x - shove), y]);
  const qPts = spinePts(P.x0, P.y0, w, P.s, P.side);
  const pts: P2[] = sPts.map(([x, y], i) => [lerp(x, qPts[i][0], K), lerp(y, qPts[i][1], K)]);
  const d = poly(pts), gx0 = mx(-shove), gx1 = mx(E - shove);
  // the words' column down the strip
  const zx = (110 + E - 36) / 2, zw = E - 36 - 110, big = Math.min(116, zw - 6), step = big * 1.1, yTop = 470 + (116 - big) * 0.6;
  // the name on the tab: each character's own place in the row
  const row = setRow(name, TAB.namePx, SKIN.display, 2), nameCx = T.tx0 + quillW(name, TAB.namePx) / 2;
  // the epithet's slip on the strip, and the wax
  const lw = quillW(tag, 44, { body: true }) + 30, ly = yTop + step * 2 + big * 0.62 + 52, lrot = side === "left" ? -4 : 4;
  const lab = unfold(t, B.label, 5) * (1 - part(t, B.fold, 3));
  const wk = thunk(t, B.wax, 2), wSettle = t === B.settle ? 1.22 : t === B.settle + 1 ? 0.95 : 1;
  const wxS = { x: mx(zx + lw / 2 - 6), y: ly - 33 }, wxT = { x: tx(T.wax.x), y: ty(T.wax.y) };
  const open = t < B.open ? 0 : unfold(t, B.open, 6), out = flapOut(L.leave, side === "left" ? -1 : 1);
  const cx = tx(w / 2), cy = ty(TAB.h / 2), br = breathe(t, who === "romeo" ? 5 : 8), held = t > B.settle ? 1 : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: out.o }}>
      <defs>
        {letterDefs(id, [H.wax])}
        <linearGradient id={`${id}-strip`} gradientUnits="userSpaceOnUse" x1={gx0} y1={0} x2={gx1} y2={0}>
          <stop offset="0" stopColor={H.deep} /><stop offset="0.62" stopColor={H.body} /><stop offset="1" stopColor={H.hi} />
        </linearGradient>
        <clipPath id={`${id}-sc`}><path d={d} /></clipPath>
      </defs>
      <g transform={`translate(${n1(cx)},${n1(cy + out.dy + held * br.y)}) rotate(${(out.rot + held * 2 * br.rot).toFixed(2)}) scale(${out.s.toFixed(3)}) translate(${n1(-cx)},${n1(-cy)})`}>
        {/* the tab's parchment opens out of the spine */}
        <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>{tabBody(id, w, P.side, who, open)}</g>
        {/* the house banner: painted parchment, a cream torn edge, a gilt rule; it folds into the tab's spine */}
        <g filter={`url(#${id}-${K < 0.6 ? "sh" : "shs"})`}>
          <g filter={`url(#${id}-deckle)`}>
            <path d={d} fill={K >= 1 ? H.body : `url(#${id}-strip)`} />
            {K < 1 ? (
              <g clipPath={`url(#${id}-sc)`} opacity={1 - K}>
                <path d={d} fill="none" stroke={TONE.gold} strokeWidth={52} strokeLinejoin="miter" />
                <path d={d} fill="none" stroke={`url(#${id}-strip)`} strokeWidth={44} strokeLinejoin="miter" />
                <path d={d} fill="none" stroke={TONE.paperHi} strokeWidth={20} strokeLinejoin="miter" />
                {[0.34, 0.67].map((u, i) => {
                  const y = lerp(pts[0][1], pts[4][1], u);
                  return <g key={i}><line x1={0} y1={y} x2={1080} y2={y} stroke={H.deep} strokeWidth={2.5} opacity={0.55} /><line x1={0} y1={y - 2.5} x2={1080} y2={y - 2.5} stroke={H.hi} strokeWidth={1.6} opacity={0.6} /></g>;
                })}
                {t < 4 ? <path d={d} fill="#fff" opacity={0.5 * (1 - t / 4)} /> : null}
              </g>
            ) : null}
          </g>
        </g>
        {/* the epithet's slip, flapped onto the strip */}
        {lab > 0.02 ? (
          <g transform={`translate(${n1(mx(zx))},${n1(ly - 35)}) rotate(${lrot}) scale(1,${lab.toFixed(3)})`}>
            {sheet(id, "slip", { x0: -lw / 2, y0: 0, x1: lw / 2, y1: 70 }, { shadow: "small", burn: 5, seed: 9, jag: 1.6 }, quill(id, "sliptag", tag, 0, 36, 44, TONE.inkSoft, { body: true, seed: 5, k: part(t, B.label + 2, 4) }))}
          </g>
        ) : null}
        {/* the name: stamped down the strip, then it flies onto the tab and takes the house's ink */}
        {[...name].slice(0, 3).map((ch, i) => {
          const at = B.name[i] ?? B.name[2], s0 = slap(t, at, 1.7);
          if (s0 <= 0) return null;
          const c = row[i], px = lerp(big, TAB.namePx * P.s, K);
          const x = lerp(mx(zx), tx(nameCx + c.x), K), y = lerp(yTop + step * i, ty(TAB.nameY + c.y), K);
          return (
            <g key={i} transform={`translate(${n1(x)},${n1(y)}) rotate(${(c.rot * (0.5 + 0.5 * K)).toFixed(2)}) scale(${s0.toFixed(3)})`}>
              {quill(id, `n${i}`, ch, 0, 0, px, mix(TONE.paperHi, H.name, K * 1.4 - 0.4), { seed: 3 + i * 5 })}
            </g>
          );
        })}
        {/* the epithet, written on the tab under the name */}
        {t >= B.tag ? <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>{quill(id, "tag", tag, T.tx0 + 1, TAB.tagY, TAB.tagPx, TONE.inkSoft, { anchor: "start", body: true, seed: 5, k: part(t, B.tag, 4) })}</g> : null}
        {/* the wax dot: onto the slip's corner, then it rides the fold onto the tab */}
        {wax(id, "dot", lerp(wxS.x, wxT.x, K), lerp(wxS.y, wxT.y, K), lerp(25, TAB.wax * P.s, K), { tone: H.wax, emblem: W.emblem, seed: who === "romeo" ? 4 : 6, drips: 1, rot: side === "left" ? -8 : 8, scale: wk.s * wSettle, squash: wk.squash, glint: clamp01((t - B.glint) / 8) })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- the friar's banner
/** the beats of the friar's banner, in frames from `from` */
export const FRIAR = { spine: 0, open: 1, name: 4, wax: 12, tag: 15, sprig: 22, glint: 40, hold: 105, namePx: 48 } as const;
export const friarBannerRect = (f: number, from: number, box: BoxAt, side: Side = WHO.friar.side, hold: number = FRIAR.hold): Rect | null => {
  if (f < from || f > from + hold) return null;
  const w = tabW(WHO.friar.name, WHO.friar.tag, FRIAR.namePx), P = tabPlace(boxOn(box, f), side, w);
  return { x0: P.x0 - (P.side === "right" ? TAB.point : 0) * P.s, y0: P.y0 - 12 * P.s, x1: P.x0 + (w + (P.side === "left" ? TAB.point + 14 : 0)) * P.s, y1: P.y0 + TAB.h * P.s + 8 };
};
export const FriarBanner: React.FC<{ f: number; from: number; box: BoxAt; hold?: number; name?: string; tag?: string; side?: Side; id?: string }> = (props) => {
  const { f, from, box, hold = FRIAR.hold, id = "romeo-friar" } = props;
  const L = life(f, from, from + hold, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, B = FRIAR, name = props.name ?? WHO.friar.name, tag = props.tag ?? WHO.friar.tag, H = HOUSE.friar;
  const w = tabW(name, tag, B.namePx), P = tabPlace(boxOn(box, f), props.side ?? WHO.friar.side, w), T = tabParts(w, P.side);
  const sp = slap(t, B.spine, 1.5), open = unfold(t, B.open, 6), wk = thunk(t, B.wax, 2), out = flapOut(L.leave, P.side === "left" ? -1 : 1);
  const cx = P.x0 + (w / 2) * P.s, cy = P.y0 + (TAB.h / 2) * P.s, sk = part(t, B.sprig, 6);
  const gx = T.tx0 + quillW(tag, TAB.tagPx, { body: true }) + 16, gy = TAB.tagY + 12;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: out.o }}>
      <defs>{letterDefs(id, [H.wax])}</defs>
      <g transform={`translate(${n1(cx)},${n1(cy + out.dy)}) rotate(${out.rot.toFixed(2)}) scale(${out.s.toFixed(3)}) translate(${n1(-cx)},${n1(-cy)})`}>
        <g transform={`translate(${n1(P.x0)},${n1(P.y0)}) scale(${P.s.toFixed(3)})`}>
          {tabBody(id, w, P.side, "friar", open)}
          <g transform={`translate(${T.sp0 + TAB.spine / 2},${TAB.h / 2}) scale(${sp.toFixed(3)}) translate(${-(T.sp0 + TAB.spine / 2)},${-TAB.h / 2})`} filter={`url(#${id}-shs)`}>
            <path d={poly(spinePts(0, 0, w, 1, P.side))} fill={H.body} filter={`url(#${id}-deckle)`} />
          </g>
          {quill(id, "name", name, T.tx0, TAB.nameY, B.namePx, H.name, { anchor: "start", seed: 2, k: part(t, B.name, 6) })}
          {quill(id, "tag", tag, T.tx0 + 1, TAB.tagY, TAB.tagPx, TONE.inkSoft, { anchor: "start", body: true, seed: 5, k: part(t, B.tag, 4) })}
          {/* a sprig drawn after the epithet: a stalk and four leaves, by the same quill */}
          {sk > 0 ? (
            <g transform={`translate(${n1(gx)},${n1(gy)})`} fill="none" stroke={H.body} strokeWidth={3.2} strokeLinecap="round" opacity={0.9}>
              <path d="M0,0 C8,-10 14,-22 16,-36" strokeDasharray="44 46" strokeDashoffset={44 * (1 - sk)} />
              {sk > 0.4 ? <path d="M5,-8 C-4,-12 -8,-18 -7,-24 C0,-22 5,-16 5,-8 Z M10,-17 C19,-17 25,-22 27,-29 C19,-29 12,-25 10,-17 Z" fill={H.hi} strokeWidth={2.2} /> : null}
              {sk > 0.75 ? <path d="M14,-27 C6,-32 4,-38 6,-44 C12,-41 15,-35 14,-27 Z M16,-36 C22,-38 26,-42 27,-47 C21,-46 17,-42 16,-36 Z" fill={H.hi} strokeWidth={2.2} /> : null}
            </g>
          ) : null}
          {wax(id, "dot", T.wax.x, T.wax.y, TAB.wax, { tone: H.wax, emblem: "leaf", seed: 8, drips: 1, rot: 6, scale: wk.s, squash: wk.squash, glint: clamp01((t - B.glint) / 8) })}
        </g>
      </g>
    </svg>
  );
};
