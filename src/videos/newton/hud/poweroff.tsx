// hud/poweroff.tsx: THE SWITCH-OFF, the film's last 1.4 s (the owner, 15 Nov: "add the screen closing in the middle
// effect at the end"). Her camera's screen turns off like an old TV: on the click of sfx_poweroff the WHOLE frame (the
// 3D picture, the REC display, everything Film.tsx draws) squeezes vertically to a thin bright line across the middle,
// the line shrinks to a bright dot in the centre, the dot fades, then black to the film's last frame.
// A pure function of the frame; every frame is a lookup (beats.ts BEAT.G.cameraOff = hud/vlog.tsx OFF_AT = cues.json
// sfx_poweroff on ["G", "to", -1.4]): nobody types a frame number.
//   <PowerOff f>{the whole composition}</PowerOff>      mounted ONCE in Film.tsx, round everything
//   powerOffAt(f)   the effect's state on frame f (null before the click);  POWER_OFF  its frames
// THE FRAMES (o = POWER_OFF.at, the frame the click falls in):
//   o .. o+4      SQUEEZE (5 f, ease-in): the frame's height 1 -> a line LINE_PX high; the first frame already moves
//                 (96 %), so the squeeze starts in the click's own frame. The picture brightens as it thins (a tube
//                 puts the same light into less glass) and the bright line comes up over it.
//   o+5 .. o+9    LINE -> DOT (5 f, ease-in-out): the picture is gone; the line shrinks from the full width to the dot
//   o+10 .. o+15  THE DOT FADES (6 f) and shrinks a little
//   o+16 .. end   BLACK (style.ts HC.black, the film's darkest warm tone: never #000)
// WHY A WRAPPER: a layer on top cannot squeeze what is under it. <PowerOff> wraps the composition in two plain
// AbsoluteFills that are THE SAME ELEMENTS ON EVERY FRAME (only their style changes), so React never remounts the
// canvas or the World; off the effect neither has a transform, a filter or a background (the page is as before).
// THE OLD END (kept, not fighting): hud/vlog.tsx still turns the UI dead grey on OFF_AT (it dies as the screen
// collapses), and segG's end black (Pose.top from BEAT.G.black, 24 frames after the click) is still set, but from
// o+5 on the composition is not shown at all, so that fade is under this black and never seen.
// NOT in an overlay-only pass (input prop ovonly: the page must stay transparent): the wrapper passes through.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ipFlag } from "../../../kit/film/env";
import { W, H, TOTAL, clamp01, easeInOutCubic } from "../story";
import { BEAT } from "../beats";
import { HC } from "./style";

/** the frames of each part */
const N_SQUEEZE = 5, N_LINE = 5, N_FADE = 6;
/** the line's height at the squeeze's end, the dot's diameter (px on the 1080 x 1920 frame) */
const LINE_PX = 10, DOT_PX = 26;
/** the tube's light: a warm white core, a cool halo */
const CORE = "#fff6e4", HALO = "190, 214, 255", WARM = "255, 240, 214";

const o = BEAT.G.cameraOff;
/** THE SWITCH-OFF's frames (inclusive spans): `at` = the click's frame = the squeeze's first frame */
export const POWER_OFF = {
  at: o,
  squeeze: [o, o + N_SQUEEZE - 1] as [number, number],
  line: [o + N_SQUEEZE, o + N_SQUEEZE + N_LINE - 1] as [number, number],
  fade: [o + N_SQUEEZE + N_LINE, o + N_SQUEEZE + N_LINE + N_FADE - 1] as [number, number],
  black: [o + N_SQUEEZE + N_LINE + N_FADE, TOTAL - 1] as [number, number],
};
if (POWER_OFF.black[0] > TOTAL - 1) throw new Error(`hud/poweroff.tsx: the switch-off needs ${POWER_OFF.black[0] - (TOTAL - 1)} more frame(s) after the click (the film ends on ${TOTAL - 1})`);

/** the state on frame f, or null before the click:
 *  sy = the composition's vertical scale (0 = not shown), bright = its brightness; glow = the bright shape (w x h px,
 *  centred on the frame's middle) at alpha a, or null (black) */
export type PowerOffState = { sy: number; bright: number; glow: { w: number; h: number; a: number } | null };
export const powerOffAt = (f: number): PowerOffState | null => {
  if (f < POWER_OFF.at) return null;
  if (f <= POWER_OFF.squeeze[1]) {
    const k = (f - POWER_OFF.at + 1) / N_SQUEEZE, e = k * k;                       // ease-in; 1 on the part's last frame
    return { sy: 1 - (1 - LINE_PX / H) * e, bright: 1 + 1.6 * e, glow: { w: W, h: LINE_PX, a: e * e } };
  }
  if (f <= POWER_OFF.line[1]) {
    const e = easeInOutCubic(clamp01((f - POWER_OFF.line[0] + 1) / N_LINE));
    return { sy: 0, bright: 1, glow: { w: W + (DOT_PX - W) * e, h: LINE_PX + (DOT_PX - LINE_PX) * e, a: 1 } };
  }
  if (f <= POWER_OFF.fade[1]) {
    const k = (f - POWER_OFF.fade[0] + 1) / (N_FADE + 1);                          // never 0 inside the part: 6 lit frames
    const d = DOT_PX * (1 - 0.45 * k);
    return { sy: 0, bright: 1, glow: { w: d, h: d, a: 1 - k } };
  }
  return { sy: 0, bright: 1, glow: null };
};

const OVONLY = ipFlag("ovonly");
const px = (n: number) => `${n.toFixed(2)}px`;

export const PowerOff: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => {
  const s = OVONLY ? null : powerOffAt(f);
  const g = s?.glow ?? null;
  // the halo follows the shape: wide and soft on the line, tight on the dot
  const k = g ? clamp01((g.w - DOT_PX) / (W - DOT_PX)) : 0, r1 = 18 + 14 * k, r2 = 60 + 80 * k;
  return (
    <AbsoluteFill style={s ? { background: HC.black } : undefined}>
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
