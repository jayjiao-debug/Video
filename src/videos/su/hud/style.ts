// hud/style.ts: what every overlay of the Su film shares (WP1): the palette, the inked text style, the text metrics,
// the life of a timed overlay and the Douyin-safe area.
// Pure functions only: no hooks, no state, nothing random. The look: bold 思源黑体 (FrSans, public/bt/sans700.ttf: the
// only CJK font in the repo) with a thick ink line under the fill and a hard little drop, NO box behind any text.
import React from "react";
import { FONT_STACK } from "../../group/kit/overlay";
import { textW, wrapRows } from "../../wanbi/hud/base";
import { SCREEN } from "../layout";

export { FONT_STACK, textW, wrapRows };

/** the palette (the film's toon ink is #12111a) */
export const HC = {
  ink: "#12111a", white: "#ffffff", cream: "#fff3d6", warm: "#fff6e8", gold: "#ffc53d", goldPale: "#ffe7a3", goldTop: "#fff4cc",
  amber: "#ffd04a", green: "#7be37b", red: "#ff4a3d", rec: "#ff2b2b",
  paper: "#fbf6ea", paperLow: "#f2e7d1", paperRule: "rgba(150,118,70,0.30)", paperInk: "#2a221c", paperSub: "#86735a",
  seal: "#c8302a", shade: "rgba(8,8,16,0.45)",
  /** the English under the captions (light grey-white) and the end's black (the film's darkest warm tone) */
  enGrey: "#e9e6df", black: "#0b0a0e",
};

/** bold text with a dark ink line under the fill and a hard little drop (no box) */
export const inked = (px: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, color, whiteSpace: "nowrap",
  WebkitTextStroke: `${Math.max(5, Math.round(px * 0.16))}px ${HC.ink}`, paintOrder: "stroke fill",
  textShadow: `0 ${Math.max(2, Math.round(px * 0.06))}px 0 ${HC.shade}`, fontVariantNumeric: "tabular-nums", ...extra,
} as React.CSSProperties);

/** a screen box in film px (1080 x 1920) */
export type Rect = { x0: number; y0: number; x1: number; y1: number };
/** the Douyin-safe area for anything that matters: x 50..930 below y 900 (the app's button rail), nothing below 1613 */
export const SAFE = { left: 50, right: SCREEN.rail.x - 5, railY: SCREEN.rail.y, bottom: SCREEN.bottom, top: SCREEN.top };

/** in / out of a span [a, b] (inclusive): 0 outside, 1 inside, eased linearly over `nin` frames at the start and `nout`
 *  at the end; a span that starts on frame 0 is already in */
export const spanK = (f: number, a: number, b: number, nin: number, nout = nin) =>
  f < a || f > b ? 0 : Math.min(a === 0 ? 1 : Math.min(1, (f - a + 1) / nin), Math.min(1, (b - f + 1) / nout));

/** the width of a string in em of FrSans (CJK and full-width marks 1 em, ASCII its real advance) */
export const em = (s: string) => textW(s, 1, 0);
