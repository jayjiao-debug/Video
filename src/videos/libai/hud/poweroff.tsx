// hud/poweroff.tsx: THE SWITCH-OFF, the film's end (Jay, 16 Nov: "for the ending can do the effect from newton, where
// everything was like folding into the middle"). Newton's hud/poweroff.tsx, on Li Bai's beats: her camera's screen
// turns off like an old TV. After the click (BEAT.F.offClick: the REC lamp out, the UI frozen for OFF.freeze frames),
// the WHOLE frame (the 3D picture, the REC display, the cards, everything Film.tsx draws) squeezes vertically to a thin
// bright line across the middle, the line shrinks to a bright dot in the centre, the dot fades, then black to the end.
//   <PowerOff f>{the whole composition}</PowerOff>     mounted ONCE in Film.tsx, round everything; f = the PICTURE's frame
// THE FRAMES (o = BEAT.F.collapse[0]):
//   o .. o+4      SQUEEZE (5 f, ease-in): the frame's height 1 -> a LINE_PX line; it brightens as it thins
//   o+5 .. o+9    LINE -> DOT (5 f): the picture is gone; the line shrinks from the full width to the dot
//   o+10 .. o+15  THE DOT FADES (6 f) and shrinks a little
//   o+16 .. end   BLACK
// A WRAPPER, because a layer on top cannot squeeze what is under it: the same two AbsoluteFills on every frame (only
// their style changes), so React never remounts the canvas; before o neither has a transform, filter or background.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ipFlag } from "../../../kit/film/env";
import { W, H, TOTAL, clamp01, easeInOutCubic } from "../story";
import { BEAT } from "../beats";

const N_SQUEEZE = 5, N_LINE = 5, N_FADE = 6;
/** the line's height at the squeeze's end, the dot's diameter (px) */
const LINE_PX = 10, DOT_PX = 26;
/** the tube's light: a warm white core, a cool halo (moonlight) */
const CORE = "#fff6e4", HALO = "190, 214, 255", WARM = "255, 240, 214";

const o = BEAT.F.collapse[0];
export const POWER_OFF = {
  at: o,
  squeeze: [o, o + N_SQUEEZE - 1] as [number, number],
  line: [o + N_SQUEEZE, o + N_SQUEEZE + N_LINE - 1] as [number, number],
  fade: [o + N_SQUEEZE + N_LINE, o + N_SQUEEZE + N_LINE + N_FADE - 1] as [number, number],
  black: [o + N_SQUEEZE + N_LINE + N_FADE, TOTAL - 1] as [number, number],
};
if (POWER_OFF.black[0] > TOTAL - 1) throw new Error(`libai hud/poweroff.tsx: the switch-off needs ${POWER_OFF.black[0] - (TOTAL - 1)} more frame(s)`);

export type PowerOffState = { sy: number; bright: number; glow: { w: number; h: number; a: number } | null };
export const powerOffAt = (f: number): PowerOffState | null => {
  if (f < POWER_OFF.at) return null;
  if (f <= POWER_OFF.squeeze[1]) {
    const k = (f - POWER_OFF.at + 1) / N_SQUEEZE, e = k * k;
    return { sy: 1 - (1 - LINE_PX / H) * e, bright: 1 + 1.6 * e, glow: { w: W, h: LINE_PX, a: e * e } };
  }
  if (f <= POWER_OFF.line[1]) {
    const e = easeInOutCubic(clamp01((f - POWER_OFF.line[0] + 1) / N_LINE));
    return { sy: 0, bright: 1, glow: { w: W + (DOT_PX - W) * e, h: LINE_PX + (DOT_PX - LINE_PX) * e, a: 1 } };
  }
  if (f <= POWER_OFF.fade[1]) {
    const k = (f - POWER_OFF.fade[0] + 1) / (N_FADE + 1), d = DOT_PX * (1 - 0.45 * k);
    return { sy: 0, bright: 1, glow: { w: d, h: d, a: 1 - k } };
  }
  return { sy: 0, bright: 1, glow: null };
};

const OVONLY = ipFlag("ovonly");
const px = (n: number) => `${n.toFixed(2)}px`;

export const PowerOff: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => {
  const s = OVONLY ? null : powerOffAt(f);
  const g = s?.glow ?? null;
  const k = g ? clamp01((g.w - DOT_PX) / (W - DOT_PX)) : 0, r1 = 18 + 14 * k, r2 = 60 + 80 * k;
  return (
    <AbsoluteFill style={s ? { background: "#000" } : undefined}>
      <AbsoluteFill style={!s ? undefined : s.sy > 0
        ? { transform: `scaleY(${s.sy.toFixed(5)})`, transformOrigin: "50% 50%", filter: `brightness(${s.bright.toFixed(3)})` }
        : { opacity: 0 }}>
        {children}
      </AbsoluteFill>
      {g ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: px((W - g.w) / 2), top: px((H - g.h) / 2), width: px(g.w), height: px(g.h), borderRadius: px(g.h / 2),
            background: CORE, opacity: g.a,
            boxShadow: `0 0 ${px(r1)} ${px(g.h * 0.5)} rgba(${WARM}, 0.85), 0 0 ${px(r2)} ${px(g.h * 1.2)} rgba(${HALO}, 0.5)` }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
