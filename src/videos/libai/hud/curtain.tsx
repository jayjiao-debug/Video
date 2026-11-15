// hud/curtain.tsx: THE TAVERN'S DOOR CURTAIN. The film opens on it (Jay, 15 Nov: "intro can be us going into the
// tavern"): two hanging panels of the wine flag's unbleached cloth, 酒 on one and 肆 on the other, right in front of
// the lens as REC comes on; the invisible hand pushes them apart and she walks in (segA.ts walks the camera from the
// doorway to his table). Drawn under the HUD (Film.tsx), so the REC display comes on over it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { glyph, easeOut, clamp01 } from "../../../kit/overlay";
import { seg } from "../story";
import { C, TONE } from "./skin";

/** picture frames: closed from the film's first frame, the panels part from `open` over `len` frames */
export const CURTAIN = { open: seg("A").from + 12, len: 15 };
/** its sound: the cloth as the hand pushes through (sound_events.ts) */
export const CURTAIN_SOUNDS: [number, string, number, string][] = [[CURTAIN.open, "cloth", -11, "the door curtain is pushed apart"]];
export const curtainOn = (f: number) => f >= seg("A").from && f < CURTAIN.open + CURTAIN.len;

const FOLDS = [70, 190, 330, 455];
const Panel: React.FC<{ side: -1 | 1; k: number; ch: string }> = ({ side, k, ch }) => {
  // each panel hangs from the lintel: pushed, it swings out about its upper outer corner and comes at the lens
  const e = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k), rot = side * -46 * e, dx = side * 560 * e, sc = 1 + 0.35 * e;
  const x0 = side < 0 ? -60 : 520, ox = side < 0 ? -60 : 1140;
  return (
    <g transform={`translate(${dx.toFixed(1)} 0) rotate(${rot.toFixed(2)} ${ox} -80) translate(${ox} -80) scale(${sc.toFixed(3)}) translate(${-ox} 80)`}>
      <rect x={x0} y={-120} width={620} height={2200} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      {FOLDS.map((fx, i) => <rect key={i} x={x0 + fx} y={-120} width={i % 2 ? 26 : 40} height={2200} fill={i % 2 ? TONE.clothLow : TONE.clothFold} opacity={0.55} />)}
      {/* the inner edge's shadow (the two panels overlap a little) */}
      <rect x={side < 0 ? x0 + 590 : x0} y={-120} width={30} height={2200} fill={TONE.clothFold} opacity={0.8} />
      <g transform={`rotate(${side * 3} ${x0 + 310} 860)`}>
        <circle cx={x0 + 310} cy={860} r={228} fill="none" stroke={C.accent} strokeWidth={16} opacity={0.9} />
        {glyph(`cur${side}`, ch, x0 + 310, 860, 300, C.ink, { ink: 0 })}
      </g>
      <ellipse cx={x0 + (side < 0 ? 150 : 470)} cy={1420} rx={70} ry={52} fill={TONE.stain} opacity={0.22} />
    </g>
  );
};
export const DoorCurtain: React.FC<{ f: number }> = ({ f }) => {
  if (!curtainOn(f)) return null;
  const k = clamp01((f - CURTAIN.open) / CURTAIN.len);
  // a small push in the cloth just before it parts
  const push = easeOut(clamp01((f - CURTAIN.open + 4) / 4)) * (1 - k);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(540 960) scale(${(1 + 0.03 * push).toFixed(3)}) translate(-540 -960)`}>
          <Panel side={1} k={k} ch="肆" />
          <Panel side={-1} k={k} ch="酒" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
