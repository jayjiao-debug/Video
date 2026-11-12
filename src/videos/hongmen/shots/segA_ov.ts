// Segment A's own 2D overlays (1080 x 1920 px). STAND-INS for the overlay package (src/videos/hongmen/hud/, not there
// when this was written): the same look as group/kit/overlay.tsx and arthur/overlay.tsx (Noto Sans SC Bold, gold /
// white type on a thick ink stroke with a hard drop shadow, springy pops), but every one is a PLAIN FUNCTION of the
// frame that returns a node (no hooks, no state, no component): frames render out of order on fresh pages.
// The film waits for the font before it builds the world (Film.tsx useOverlayFont), so text is safe here.
//   titleStamp   「鸿门宴」: slams in over 3 frames, holds, leaves in 3
//   nameTag      a name over a head (gold, 84 px), an optional small white line under it
//   numLabel     「40万」 / 「10万」: a number in its camp's colour with a white edge
//   mark         "?" (gold) popping by a spring, with a wobble
//   glint        a four-point sparkle on a point (a blade catching the light)
//   burst        short radial dashes round a point (an impact)
//   cardWipe     a flat board-coloured panel that slides across the frame from the right and on out to the left: the
//                cut sits under the frames where it covers everything
//   flapWash     the door flap's cloth colour over the whole frame for the frames round a cut (the lens is inside the
//                cloth on both sides of it)
//   streaks      horizontal smears over a whip pan (there is no motion blur in the post chain)
//   puffs        three dust puffs that swell and fade
// Keep-out (layout.ts SCREEN): nothing that matters above y 210, in the caption band 1190-1498, below 1613, or at
// x > 930 for y > 900.
import React from "react";
import { COL, FONT_STACK, ts } from "../../group/kit/overlay";
import { h, clamp01, lerp, hash, spring, easeOutCubic, easeInOutCubic, FPS } from "../story";

const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };
const svg = (key: string, ...kids: React.ReactNode[]) => h("svg", { key, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } }, ...kids);
/** a zero-size anchor at (x, y) with one centred child */
const centred = (key: string, x: number, y: number, transform: string, opacity: number, kid: React.ReactNode, origin = "50% 50%") =>
  h("div", { key, style: { position: "absolute", left: x, top: y, width: 0, height: 0, pointerEvents: "none" } },
    h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) ${transform}`, transformOrigin: origin, opacity, whiteSpace: "nowrap", display: "flex", flexDirection: "column", alignItems: "center" } }, kid));
/** 0 before `out`, 1 from out + n: the leave */
const leave = (f: number, out: number | undefined, n = 3) => (out === undefined ? 0 : clamp01((f - out + 1) / n));

/** THE TITLE. `at` = the frame it appears on (large), it lands on at + 3 with a small settle; `out` = the first frame
 *  of a 3-frame leave. Gold on ink, on a feathered dark shade (no box). */
export const titleStamp = (f: number, o: { at: number; out: number; text: string; x?: number; y?: number; size?: number }): React.ReactNode => {
  const { at, out, text, x = 540, y = 255, size = 168 } = o;
  if (f < at || f >= out + 3) return null;
  const k = clamp01((f - at) / 3), lv = leave(f, out);
  const settle = f > at + 3 ? 0.05 * Math.exp(-(f - at - 3) / 2.2) * Math.cos((f - at - 3) * 1.9) : 0;
  const s = lerp(2.3, 1, easeOutCubic(k)) - settle + 0.08 * lv, op = clamp01((f - at + 1) / 2) * (1 - lv);
  const n = [...text].length, shadeW = n * size * 1.25 + 260, shadeH = size * 2.3;
  return h("div", { key: "title", style: FULL },
    h("div", { style: { position: "absolute", left: x - shadeW / 2, top: y - shadeH / 2, width: shadeW, height: shadeH, opacity: 0.9 * op * clamp01((f - at - 1) / 3),
      background: "radial-gradient(closest-side, rgba(10,12,22,0.5) 0%, rgba(10,12,22,0.44) 50%, rgba(10,12,22,0.2) 78%, rgba(10,12,22,0) 100%)" } }),
    centred("t", x, y, `scale(${s.toFixed(4)}) rotate(${(-3 * (1 - k)).toFixed(2)}deg)`, op,
      h("span", { style: { ...ts(size, COL.gold, Math.round(size * 0.1)), letterSpacing: Math.round(size * 0.08), paddingLeft: Math.round(size * 0.08) } }, text)));
};

/** A NAME TAG: `at` = first frame (pops by a spring), `out` = first frame of a 3-frame fade. (x, y) = the centre of
 *  the name. sub = a small white line under it. */
export const nameTag = (f: number, o: { at: number; out: number; x: number; y: number; text: string; sub?: string; size?: number; color?: string; key?: string }): React.ReactNode => {
  const { at, out, x, y, text, sub, size = 84, color = COL.gold } = o;
  if (f < at || f >= out + 3) return null;
  const k = spring((f - at + 1) / FPS, { freq: 3.4, zeta: 0.5 }), lv = leave(f, out);
  return centred(o.key ?? `tag${text}`, x, y, `scale(${(0.5 + 0.5 * k).toFixed(4)})`, clamp01((f - at + 1) / 2) * (1 - lv), [
    h("span", { key: "n", style: ts(size, color) }, text),
    sub ? h("span", { key: "s", style: { ...ts(Math.round(size * 0.5), COL.white), marginTop: 2 } }, sub) : null,
  ]);
};

/** A NUMBER LABEL (「40万」): its camp's colour with a white edge and a thin ink line round that; pops by a spring. */
export const numLabel = (f: number, o: { at: number; out: number; x: number; y: number; text: string; size: number; fill: string; key?: string }): React.ReactNode => {
  const { at, out, x, y, text, size, fill } = o;
  if (f < at || f >= out + 3) return null;
  const k = spring((f - at + 1) / FPS, { freq: 3.2, zeta: 0.42 }), lv = leave(f, out), e = Math.round(size * 0.13);
  const base: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", letterSpacing: 2 };
  // two layers of the same text: the ink line + shadow under, the white edge and the fill on top
  return centred(o.key ?? `num${text}`, x, y, `scale(${(0.4 + 0.6 * k).toFixed(4)}) rotate(${(-4 * (1 - Math.min(1, k))).toFixed(2)}deg)`, clamp01((f - at + 1) / 2) * (1 - lv),
    h("span", { style: { position: "relative", display: "inline-block" } },
      h("span", { key: "a", style: { ...base, color: COL.ink, WebkitTextStroke: `${e + 10}px ${COL.ink}`, textShadow: `0 ${Math.round(size * 0.06)}px 0 rgba(0,0,0,0.35)` } as React.CSSProperties }, text),
      h("span", { key: "b", style: { ...base, position: "absolute", left: 0, top: 0, color: fill, WebkitTextStroke: `${e}px #ffffff`, paintOrder: "stroke fill" } as React.CSSProperties }, text)));
};

/** "?" over a head: gold on ink; pops by a spring from its foot and wobbles to rest */
export const mark = (f: number, o: { at: number; out: number; x: number; y: number; text?: string; size?: number; color?: string }): React.ReactNode => {
  const { at, out, x, y, text = "?", size = 230, color = COL.gold } = o;
  if (f < at || f >= out + 3) return null;
  const t = (f - at + 1) / FPS, k = spring(t, { freq: 3.6, zeta: 0.36 }), lv = leave(f, out);
  const wob = 9 + 7 * Math.exp(-t * 5) * Math.sin(t * 2 * Math.PI * 3.2);
  return centred("mark", x, y, `scale(${(k * (1 - 0.3 * lv)).toFixed(4)}) rotate(${wob.toFixed(2)}deg)`, 1 - lv, h("span", { style: ts(size, color) }, text), "50% 85%");
};

/** a four-point sparkle that opens and closes on a point over `dur` frames */
export const glint = (f: number, o: { at: number; x: number; y: number; size?: number; dur?: number; key?: string }): React.ReactNode => {
  const { at, x, y, size = 150, dur = 9 } = o, u = (f - at) / dur;
  if (u < 0 || u >= 1) return null;
  const s = Math.sin(Math.PI * Math.pow(u, 0.7)) * size * 0.5, a = 45 * u, q = 0.13;
  if (s < 2) return null;
  const d = `M0,${-s} Q${s * q},${-s * q} ${s},0 Q${s * q},${s * q} 0,${s} Q${-s * q},${s * q} ${-s},0 Q${-s * q},${-s * q} 0,${-s} Z`;
  return svg(o.key ?? `glint${at}`, h("g", { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})` },
    h("path", { d, fill: "#ffffff", stroke: COL.ink, strokeWidth: 7, strokeLinejoin: "round" }),
    h("circle", { cx: 0, cy: 0, r: s * 0.16, fill: "#fff6cf" })));
};

/** short radial dashes for 8 frames from `at` */
export const burst = (f: number, o: { at: number; x: number; y: number; r?: number; n?: number; color?: string; key?: string }): React.ReactNode => {
  const { at, x, y, r = 120, n = 10, color = COL.gold } = o, u = (f - at) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), op = 1 - u * u, kids: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a), d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
    kids.push(h("path", { key: `a${i}`, d, stroke: COL.ink, strokeWidth: 17 }), h("path", { key: `b${i}`, d, stroke: color, strokeWidth: 9 }));
  }
  return svg(o.key ?? `burst${at}`, h("g", { opacity: op, strokeLinecap: "round", fill: "none" }, ...kids));
};

/** THE CARD WIPE: a flat panel in the board's colour comes in from the right, covers the frame on cut - 2 .. cut + 1
 *  (the cut is under it) and goes on out to the left. `cut` = the first frame of the new shot. A darker leading edge
 *  and a soft shadow before it make it a thing that slides, not a fade. */
export const cardWipe = (f: number, cut: number, color: string, edge = "#b9a674"): React.ReactNode => {
  const IN = 5, OUT = 5, f0 = cut - 2 - IN, f1 = cut + 2 + OUT;       // f0 .. cut - 3 arriving; cut - 2 .. cut + 1 full; cut + 2 .. f1 - 1 leaving
  if (f <= f0 || f >= f1) return null;
  const Wd = 1080 + 160;                                               // the panel is wider than the frame by its two soft ends
  let left: number;
  if (f < cut - 2) left = lerp(1080, -80, easeInOutCubic((f - f0) / IN));
  else if (f <= cut + 1) left = -80;
  else left = lerp(-80, -Wd - 40, easeInOutCubic((f - cut - 1) / OUT));
  return h("div", { key: "cardwipe", style: FULL },
    h("div", { style: { position: "absolute", left: left - 70, top: 0, width: 70, height: 1920, background: "linear-gradient(90deg, rgba(40,30,20,0) 0%, rgba(40,30,20,0.22) 100%)" } }),
    h("div", { style: { position: "absolute", left, top: 0, width: Wd, height: 1920, background: color, borderLeft: `14px solid ${edge}`, borderRight: `14px solid ${edge}`, boxSizing: "border-box" } }),
    h("div", { style: { position: "absolute", left: left + Wd, top: 0, width: 70, height: 1920, background: "linear-gradient(90deg, rgba(40,30,20,0.22) 0%, rgba(40,30,20,0) 100%)" } }));
};

/** the door flap's cloth over the whole frame: opacity 0 -> 1 over `inF` frames up to `cut`, 1 on the cut frame, 1 -> 0
 *  over `outF` frames after it. The lens is already deep in the cloth on both sides: this only hides the weave's jump. */
export const flapWash = (f: number, cut: number, color: string, inF = 3, outF = 3): React.ReactNode => {
  const a = f < cut ? clamp01((f - (cut - 1 - inF)) / inF) : clamp01(1 - (f - cut) / outF);
  if (a <= 0) return null;
  return h("div", { key: "flapwash", style: { ...FULL, background: color, opacity: a } });
};

/** WHIP-PAN STREAKS on frames f0 .. f1 (inclusive): long horizontal smears in the plate's colours, strongest in the
 *  middle of the run. dir -1 = the picture rushes to the right (a pan LEFT), +1 = to the left. */
export const streaks = (f: number, f0: number, f1: number, dir: 1 | -1, colors: string[], seed = 1): React.ReactNode => {
  if (f < f0 || f > f1) return null;
  const u = (f - f0 + 0.5) / (f1 - f0 + 1), a = Math.sin(Math.PI * u), kids: React.ReactNode[] = [];
  for (let i = 0; i < 22; i++) {
    const y = 60 + hash(i, seed) * 1800, hgt = 10 + hash(i, seed + 1) * 46, len = 500 + hash(i, seed + 2) * 900;
    const x = ((hash(i, seed + 3) * 2200 - dir * (f - f0) * 520) % 2200 + 2200) % 2200 - 600;
    kids.push(h("div", { key: i, style: { position: "absolute", left: x, top: y, width: len, height: hgt, borderRadius: hgt, opacity: 0.55 * a * (0.5 + 0.5 * hash(i, seed + 4)),
      background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${colors[i % colors.length]} 30%, ${colors[i % colors.length]} 70%, rgba(255,255,255,0) 100%)` } }));
  }
  return h("div", { key: `streaks${f0}`, style: FULL }, ...kids);
};

/** three dust puffs that swell and drift up from a point over `dur` frames */
export const puffs = (f: number, o: { at: number; x: number; y: number; r?: number; dur?: number; color?: string }): React.ReactNode => {
  const { at, x, y, r = 46, dur = 12, color = "#f4ecd6" } = o, u = (f - at) / dur;
  if (u < 0 || u >= 1) return null;
  const kids: React.ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const dx = (i - 1) * r * 1.25 * (0.4 + 0.6 * u), dy = -r * (0.5 + 0.9 * u) * (i === 1 ? 1.25 : 0.8), rr = r * (0.55 + 0.6 * u) * (i === 1 ? 1.1 : 0.85);
    kids.push(h("circle", { key: i, cx: x + dx, cy: y + dy, r: rr, fill: color, stroke: COL.ink, strokeWidth: 5, opacity: clamp01((1 - u) * 2.2) }));
  }
  return svg(`puffs${at}`, ...kids);
};
