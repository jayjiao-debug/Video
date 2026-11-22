// hud/stamp.tsx: THE WAX STAMP EVENT 「认识一天 · 已婚」, in the film's skin (hud/skin.ts, 「信」 the letter): a slip with
// the small words, and a big red seal thunked onto its end with the verdict pressed in it. A pure function of the frame.
//
//   <WaxStamp f at small? big? cx cy hold? rot? id? />
//     f        the film frame
//     at       the frame the slip flaps in: in the gap AFTER the line (the wedding's last word), never on it. The seal
//              lands 6 frames later.
//     small    the words on the slip (default "认识一天");  big  the verdict in the wax, 2 characters (default "已婚")
//     cx, cy   the centre of the whole piece (film px): it takes about cx - 262 .. cx + 268, cy - 116 .. cy + 124
//     hold     frames it stays after the seal has landed (default 34);  rot  the slip's turn in degrees (default -3)
//     id       the prefix of its SVG ids (default "romeo-stamp")
//   stampRect(cx, cy)   the box it takes, for the overlay check (kind "effect");  STAMP.len  its whole length (frames)
//
// MOTION: the slip flaps in and 认识一天 is written (frames 0-5); the seal THUNKS down on frame 6 (large, squashed, a
// ring of air, flecks of wax, the slip knocked down); a glint crosses it; it flaps away over its last 5 frames.
// SOUND: "wax thunk" on frame at + 6 (the heaviest of the film's small stamps; the tally's last one is bigger still).
import React from "react";
import { life, part, clamp01, ring, burst, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, WAX, flapIn, flapOut, thunk, breathe } from "./skin";
import { letterDefs, sheet, wax, quill } from "./marks";

/** the stamp's numbers */
export const STAMP = { seal: 6, hold: 34, len: 6 + 34 + 5, slipW: 322, slipH: 98, px: 56, r: 102 } as const;
export const stampRect = (cx: number, cy: number): Rect => ({ x0: cx - 262, y0: cy - 116, x1: cx + 268, y1: cy + 124 });

export const WaxStamp: React.FC<{ f: number; at: number; small?: string; big?: string; cx: number; cy: number; hold?: number; rot?: number; id?: string }> = (props) => {
  const { f, at, small = "认识一天", big = "已婚", cx, cy, hold = STAMP.hold, rot = -3, id = "romeo-stamp" } = props;
  const L = life(f, at, at + STAMP.seal + hold + 4, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, S = STAMP, A = flapIn(t, 0, 5, -9), out = flapOut(L.leave, 1), sk = thunk(t, S.seal, 2.3), br = breathe(t, 3);
  const sx = 152, sy = 6, lx = -252;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: A.o * out.o }}>
      <defs>{letterDefs(id)}</defs>
      <g transform={`translate(${cx},${(cy - A.lift + out.dy + br.y + 1.5 * sk.jolt).toFixed(1)}) rotate(${(rot + A.rot + out.rot + br.rot).toFixed(2)}) scale(${(A.s * out.s).toFixed(3)})`}>
        {sheet(id, "slip", { x0: lx, y0: -S.slipH / 2, x1: lx + S.slipW, y1: S.slipH / 2 }, { jag: 4, step: 18, seed: 4, shadow: "big", burn: 7 },
          quill(id, "small", small, lx + 30, 2, S.px, C.ink, { anchor: "start", seed: 5, k: part(t, 2, 4) }))}
        {sk.on ? ring("r", sx, sy, 80, 250, sk.ring, TONE.paperHi, 12) : null}
        {sk.on ? burst("b", sx, sy, 11, 112, 230, clamp01((t - S.seal + 1) / 9), { color: WAX.red.mid, width: 8, seed: 5 }) : null}
        {wax(id, "seal", sx, sy, S.r, { rows: [big], rot: -9, seed: 2, drips: 3, scale: sk.s, squash: sk.squash, glint: sk.glint })}
      </g>
    </svg>
  );
};
