// segment A: the big gold "−15%" that pops beside YOU on line 02 (少出【15%】的力). Own component (the kit BigPercent
// throws rope strands at the number: a metaphor the owner does not want here). Pure function of the frame.
import React from "react";
import { COL, FONT_STACK, useOverlayFont } from "../kit/overlay";
import { pop, clamp01, easeInCubic, lerp, h } from "../story";

export type MinusProps = { f: number; at: number; out: number; x: number; y: number; text?: string; size?: number };

/** gold number with an ink outline and a hard drop shadow, centred on (x, y). Pops in at `at` (0 -> 1.12 -> 1 over
 *  7 f, a small counter-turn), breathes very slightly while it holds, leaves over 6 f from `out` (shrinks + fades). */
export const MinusPct: React.FC<MinusProps> = ({ f, at, out, x, y, text = "−15%", size = 236 }) => {
  useOverlayFont();
  if (f < at || f > out + 6) return null;
  const s0 = pop(f, at, 7, 1.12);
  const k = clamp01((f - out) / 6), gone = easeInCubic(k);
  const breathe = 1 + 0.012 * Math.sin(((f - at) / 30) * Math.PI * 2 * 0.8);
  const s = s0 * breathe * (1 - 0.3 * gone);
  const rot = lerp(-14, -6, clamp01((f - at) / 7));
  const sw = Math.round(size * 0.085);
  const txt: React.CSSProperties = {
    fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: -4,
    color: COL.gold, WebkitTextStroke: `${sw}px ${COL.ink}`, paintOrder: "stroke fill",
    textShadow: `0 ${Math.round(size * 0.055)}px 0 rgba(0,0,0,0.38)`,
  } as React.CSSProperties;
  // a feathered dark scrim (no box) so the number holds over the busy corkboard
  const sc = (a: number) => `rgba(${COL.scrim},${(0.36 * a).toFixed(3)})`;
  const scrim = h("div", { style: { position: "absolute", left: -size * 1.5, top: -size * 0.85, width: size * 3, height: size * 1.7, transform: `scale(${Math.min(1, s0)})`,
    background: `radial-gradient(closest-side, ${sc(1)} 0%, ${sc(1)} 50%, ${sc(0.6)} 70%, ${sc(0.2)} 88%, ${sc(0)} 100%)` } });
  return h("div", { style: { position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - gone } }, scrim,
    h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`, transformOrigin: "50% 50%", ...txt } }, text));
};
