// hud/skin.ts: THE SKIN of the Su film (v3, Jay 2026-11-14): one look for the themed title, the intro cards and the
// 综艺 effects, taken from the lead and his world. 苏东坡 is a happy eater in exile, so the skin is his dish.
//   typefaces  KUAILE (round, chubby: words) and XING (running script, his own art: names)       hud/fonts.ts
//   colours    ROBE ochre (his robe: the lead's colour), PORK braised red-brown (东坡肉), LYCHEE red, RICE cream;
//              all on a warm dark-brown ink line
//   material   braised pork: a glossy glaze (dark at the bottom, a white sheen top left) under a thick ink line
//   motion     plop and jiggle: everything drops in, squashes on landing and wobbles like a cube of pork, then
//              shrinks away. Nothing slides, nothing spins.
// Pure functions of the frame only.
import type React from "react";
import { clamp01, easeInCubic } from "../story";

export const SK = {
  robe: "#e9a23b", robeDeep: "#b8701c", robeLight: "#ffd37a",
  pork: "#8f2f16", porkTop: "#c2532a", porkDeep: "#561608", fat: "#f6e2b4",
  lychee: "#e8453a", lycheeDeep: "#a8231c",
  rice: "#fff3d6", ink: "#24130b", shadow: "rgba(20,8,2,0.45)",
};

/** plop and jiggle: frames since the plop starts -> { y (px offset, from above), sx, sy (squash) , o (opacity) }.
 *  drop = frames of the fall, h = the fall's height in px; the wobble dies over ~16 frames */
export const plop = (t: number, drop = 6, h = 140) => {
  if (t < 0) return { y: -h, sx: 1, sy: 1, o: 0 };
  if (t < drop) { const k = easeInCubic((t + 1) / drop); return { y: -h * (1 - k), sx: 0.9 + 0.1 * k, sy: 1.12 - 0.12 * k, o: clamp01((t + 1) / 2) }; }
  const u = t - drop, amp = Math.exp(-u / 5.5), w = Math.cos(u * 0.95);
  return { y: 0, sx: 1 + 0.2 * amp * w, sy: 1 - 0.22 * amp * w, o: 1 };
};
/** the leave: shrink to nothing over n frames (k = 0 .. 1 as it goes) */
export const shrink = (f: number, end: number, n = 6) => { const k = clamp01((f - (end - n)) / n); return { s: 1 - 0.85 * easeInCubic(k), o: 1 - easeInCubic(k) }; };
/** a CSS transform for a plop at (x, y) with the squash pivoting on the bottom edge */
export const plopTf = (p: { y: number; sx: number; sy: number }, extra = "") => `translate(0px, ${p.y.toFixed(1)}px) scale(${p.sx.toFixed(4)}, ${p.sy.toFixed(4)}) ${extra}`;

/** inked text in a skin face: the ink line drawn under the fill and a hard warm drop */
export const skinText = (font: string, px: number, color: string, sw = Math.max(6, Math.round(px * 0.16))): React.CSSProperties => ({
  fontFamily: font, fontSize: px, lineHeight: 1, color, whiteSpace: "nowrap", fontWeight: 400,
  WebkitTextStroke: `${sw}px ${SK.ink}`, paintOrder: "stroke fill",
  textShadow: `0 ${Math.max(3, Math.round(px * 0.06))}px 0 ${SK.shadow}`,
} as React.CSSProperties);
