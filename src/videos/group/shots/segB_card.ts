// segment B overlays (pure functions of the frame; .ts, so React.createElement via h):
//   PctCard  the label card of the lab (segments B and C share the design; import it from here): a white card with an
//            ink outline in the top band (y 6-30 %), a title, then one horizontal bar per group as the narration says
//            it: label (1人 / 2人 ...), a bar growing from 0 with a short eased pop, the value counting up with it. The
//            newest bar is gold, older bars turn neutral. The card grows downward by one row just before each pop (the
//            row's slot and label are in place when its bar starts), so it is never shown half-built. It leaves (8 f: fade, rise, shrink) from `out`.
//   Puzzle   a small "?" popping over a head (screen point), with a little wobble; leaves from `out`.
import React from "react";
import { COL, FONT_STACK, useOverlayFont, ts } from "../kit/overlay";
import { h, pop, clamp01, lerp, easeOutCubic, easeInCubic, easeOutBack, easeInOutCubic } from "../story";

const INK = COL.ink;
/** neutral bar colour of the older rows */
const NEUTRAL = "#c9cdd6";

export type PctRow = { label: string; value: number; at: number };
export type PctCardProps = { f: number; at: number; out: number; title: string; rows: PctRow[]; top?: number };

/** card geometry (px, 1080 x 1920) */
export const PCT_CARD = { x0: 96, x1: 984, pad: 26, titleH: 64, rowH: 80, barH: 46, labelW: 118, barMax: 520, bottomPad: 22 };
/** the card's bottom edge (px) once `n` rows are open (shadow excluded) */
export const pctCardBottom = (top: number, n: number) => top + PCT_CARD.pad + PCT_CARD.titleH + n * PCT_CARD.rowH + PCT_CARD.bottomPad;
/** how far a row's slot is open (0..1): over the 8 frames from 6 f before its pop to 2 f after */
export const pctRowOpen = (f: number, at: number) => easeInOutCubic(clamp01((f - (at - 6)) / 8));

export const PctCard: React.FC<PctCardProps> = ({ f, at, out, title, rows, top = 122 }) => {
  useOverlayFont();
  if (f < at || f > out + 8) return null;
  const C = PCT_CARD, cw = C.x1 - C.x0, cx = (C.x0 + C.x1) / 2;
  const inK = easeOutBack(clamp01((f - at) / 10), 1.2), o = easeInCubic(clamp01((f - out) / 8));
  const op = clamp01((f - at) / 5) * (1 - o), dy = -36 * (1 - clamp01(inK)) - 30 * o, sc = (0.94 + 0.06 * inK) * (1 - 0.05 * o);
  // each row's slot opens just before its pop (the card grows by one row)
  const open = rows.map((r) => pctRowOpen(f, r.at));
  const nOpen = open.reduce((a, b) => a + b, 0);
  const cardH = C.pad + C.titleH + nOpen * C.rowH + C.bottomPad;
  const kids: React.ReactNode[] = [];
  rows.forEach((r, i) => {
    if (open[i] <= 0) return;
    const y = C.pad + C.titleH + i * C.rowH + (C.rowH - C.barH) / 2;
    // bar growth: 0 -> 1 with a small overshoot over 12 f; the value counts with it (never past the value)
    const g = f < r.at ? 0 : easeOutBack(clamp01((f - r.at) / 12), 1.4);
    const gv = clamp01(g);
    const next = rows[i + 1];
    const old = next ? easeInOutCubic(clamp01((f - next.at) / 6)) : 0;
    const fill = mixHex(COL.gold, NEUTRAL, old);
    const barW = Math.max(0, C.barMax * (r.value / 100) * g);
    const rowOp = clamp01((open[i] - 0.4) / 0.6);
    const lab = h("div", { key: "l", style: { position: "absolute", left: 0, top: (C.barH - 50) / 2 - 2, width: C.labelW, textAlign: "left", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 50, lineHeight: 1, color: INK, whiteSpace: "nowrap" } }, r.label);
    const bar = barW > 0.5 ? h("div", { key: "b", style: { position: "absolute", left: C.labelW, top: 0, width: barW, height: C.barH, borderRadius: C.barH / 2, background: fill, boxShadow: `0 0 0 4px ${INK}` } }) : null;
    const val = h("div", { key: "v", style: { position: "absolute", left: C.labelW + barW + 22, top: (C.barH - 50) / 2 - 2, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 50, lineHeight: 1, color: INK, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", opacity: f < r.at ? 0 : clamp01((f - r.at) / 3) } },
      `${Math.min(r.value, Math.round(r.value * gv))}%`);
    kids.push(h("div", { key: i, style: { position: "absolute", left: C.pad + 14, top: y, width: cw - 2 * C.pad, height: C.barH, opacity: rowOp } }, lab, bar, val));
  });
  return h("div", { style: { position: "absolute", inset: 0, opacity: op } },
    h("div", { style: { position: "absolute", left: C.x0, top: top + dy, width: cw, height: cardH, transform: `scale(${sc})`, transformOrigin: `${cx - C.x0}px 0px`,
      borderRadius: 30, background: "rgba(255,255,255,0.97)", boxShadow: `0 0 0 5px ${INK}, 0 12px 0 rgba(0,0,0,0.22)`, overflow: "hidden" } },
      h("div", { style: { position: "absolute", left: C.pad + 14, top: C.pad - 4, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 56, lineHeight: 1, color: INK, whiteSpace: "nowrap" } }, title),
      ...kids));
};

const hexRgb = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const A = hexRgb(a), B = hexRgb(b), k = clamp01(t);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
};

export type PuzzleProps = { f: number; at: number; out: number; x: number; y: number; size?: number };
/** a "?" centred on (x, y): pops in at `at` (0 -> 1.15 -> 1 over 7 f) with a small counter-turn, rocks a little
 *  while it holds, leaves over 6 f from `out` (shrinks and fades) */
export const Puzzle: React.FC<PuzzleProps> = ({ f, at, out, x, y, size = 112 }) => {
  useOverlayFont();
  if (f < at || f > out + 6) return null;
  const s0 = pop(f, at, 7, 1.15), gone = easeInCubic(clamp01((f - out) / 6));
  const rot = lerp(-18, 8, easeOutCubic(clamp01((f - at) / 7))) + 5 * Math.sin(((f - at) / 30) * Math.PI * 2 * 0.9) * clamp01((f - at - 6) / 6);
  return h("div", { style: { position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - gone } },
    h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${s0 * (1 - 0.35 * gone)}) rotate(${rot}deg)`, transformOrigin: "50% 60%", ...ts(size, COL.white) } }, "?"));
};
