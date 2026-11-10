// segment C's label card: a copy of segB_card.ts's PctCard (that file is segB's; the design is the same: white card,
// ink outline, title, one bar per row as the narration says it, the scripted value riding the bar, newest bar gold, older
// rows neutral, 8 f exit) with one addition: `labelW`, a wider label column, so the label "2-6个" (about 125 px at 50 px)
// does not run into its bar (segB's 118 px column fits 1人 / 2人 / 3人 / 6人 only). Pure function of the frame.
import React from "react";
import { COL, FONT_STACK, useOverlayFont } from "../kit/overlay";
import { h, clamp01, lerp, easeInCubic, easeOutBack, easeInOutCubic } from "../story";

const INK = COL.ink;
/** neutral bar colour of the older rows */
const NEUTRAL = "#c9cdd6";

export type PctRow = { label: string; value: number; at: number };
export type PctCardProps = { f: number; at: number; out: number; title: string; rows: PctRow[]; top?: number; labelW?: number };

/** card geometry (px, 1080 x 1920) */
const PCT_CARD = { x0: 96, x1: 984, pad: 26, titleH: 64, rowH: 80, barH: 46, labelW: 118, barMax: 520, bottomPad: 22 };
/** how far a row's slot is open (0..1): over the 8 frames from 6 f before its pop to 2 f after */
const pctRowOpen = (f: number, at: number) => easeInOutCubic(clamp01((f - (at - 6)) / 8));

export const PctCardC: React.FC<PctCardProps> = ({ f, at, out, title, rows, top = 122, labelW }) => {
  useOverlayFont();
  if (f < at || f > out + 8) return null;
  const C = { ...PCT_CARD, labelW: labelW ?? PCT_CARD.labelW }, cw = C.x1 - C.x0, cx = (C.x0 + C.x1) / 2;
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
    // bar growth: 0 -> 1 with a small overshoot over 12 f; the value is the scripted one from the first frame (no
    // unscripted in-between numbers while the bar grows)
    const g = f < r.at ? 0 : easeOutBack(clamp01((f - r.at) / 12), 1.4);
    const next = rows[i + 1];
    const old = next ? easeInOutCubic(clamp01((f - next.at) / 6)) : 0;
    const fill = mixHex(COL.gold, NEUTRAL, old);
    const barW = Math.max(0, C.barMax * (r.value / 100) * g);
    const rowOp = clamp01((open[i] - 0.4) / 0.6);
    // the label arrives with its bar and value (all three from at + 1): the empty slot opens first
    const labOp = clamp01((f - r.at) / 3);
    const lab = h("div", { key: "l", style: { position: "absolute", left: 0, top: (C.barH - 50) / 2 - 2, width: C.labelW, textAlign: "left", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 50, lineHeight: 1, color: INK, whiteSpace: "nowrap", opacity: labOp } }, r.label);
    const bar = barW > 0.5 ? h("div", { key: "b", style: { position: "absolute", left: C.labelW, top: 0, width: barW, height: C.barH, borderRadius: C.barH / 2, background: fill, boxShadow: `0 0 0 4px ${INK}` } }) : null;
    const val = h("div", { key: "v", style: { position: "absolute", left: C.labelW + barW + 22, top: (C.barH - 50) / 2 - 2, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 50, lineHeight: 1, color: INK, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", opacity: f < r.at ? 0 : clamp01((f - r.at) / 3) } },
      `${r.value}%`);
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

