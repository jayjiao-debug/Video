// hud/stamp.tsx: THE TIME-JUMP STAMPS of the Su film (PLAN.md section 6; WP1). A pure function of the frame.
//   <Stamp f />   a red square seal (white characters on red, a double rim, a little rough) in the top-left corner
//                 (x 60-260, y 230-430) with the time-jump words beside it, the English small under them:
//                 H 「两年后 · 儋州」 (seal 「儋州」) from BEAT.H.stamp, I 「四年后 · 金山寺」 (seal 「金山」) from BEAT.I.stamp.
//                 Pressed in: scale 1.3 -> 1 over 4 frames with a ring of ink spreading out from under it, the words
//                 slide in after it; held ~2.5 s; then it all fades over 10 frames.
//   stampAt(f)    { which, t, k } of the stamp showing on frame f (or null);  STAMP_RECT  the box it takes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FPS, clamp01, easeOutCubic, easeInCubic, hash } from "../story";
import { BEAT } from "../beats";
import { EN, TXT } from "../lang";
import { FONT_STACK, HC, type Rect } from "./style";

const HOLD = Math.round(2.5 * FPS), OUT = 10, PRESS = 4;
const STAMPS = [
  { which: "H" as const, at: BEAT.H.stamp, ...TXT.jumpH },
  { which: "I" as const, at: BEAT.I.stamp, ...TXT.jumpI },
];
/** the box the stamp and its words take (px) */
export const STAMP_RECT: Rect = { x0: 50, y0: 220, x1: 800, y1: 440 };
/** the stamp on frame f: which one, frames since it was pressed, its opacity */
export const stampAt = (f: number) => {
  for (const s of STAMPS) {
    const t = f - s.at;
    if (t >= 0 && t < HOLD + OUT) return { ...s, t, k: 1 - easeInCubic(clamp01((t - HOLD) / OUT)) };
  }
  return null;
};
const SX = 160, SY = 330, SIZE = 196;

export const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const s = stampAt(f);
  if (!s) return null;
  const t = s.t, press = clamp01(t / PRESS), sc = 1.3 - 0.3 * easeOutCubic(press), spread = easeOutCubic(clamp01(t / 10));
  const chars = [...s.seal], half = SIZE / 2, px = SIZE * 0.36;
  const words = easeOutCubic(clamp01((t - 3) / 8));
  // a rough rim: the seal's edge wobbles a little (fixed by the stamp's own seed)
  const seed = s.which === "H" ? 3 : 7;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const side = Math.floor(i / 6), u = (i % 6) / 6, j = (hash(i, seed) - 0.5) * 5;
    const [x, y] = side === 0 ? [-half + u * SIZE, -half] : side === 1 ? [half, -half + u * SIZE] : side === 2 ? [half - u * SIZE, half] : [-half, half - u * SIZE];
    return `${(x + (side % 2 ? j : 0)).toFixed(1)},${(y + (side % 2 ? 0 : j)).toFixed(1)}`;
  }).join(" ");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: s.k }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {/* the ink spreading out from under the seal as it is pressed */}
        <g opacity={0.35 * (1 - spread) + 0.12}>
          {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + hash(i, seed) * 0.5, r = half * (0.9 + 0.35 * spread) + 10 * hash(i, seed + 1);
            return <circle key={i} cx={SX + Math.cos(a) * r} cy={SY + Math.sin(a) * r} r={4 + 6 * hash(i, seed + 2)} fill={HC.seal} />; })}
        </g>
        <g transform={`translate(${SX} ${SY}) rotate(-4) scale(${sc.toFixed(4)})`}>
          <polygon points={pts} fill={HC.seal} />
          <rect x={-half + 12} y={-half + 12} width={SIZE - 24} height={SIZE - 24} fill="none" stroke="#fbeee0" strokeWidth={5} rx={4} />
          {chars.map((ch, i) => (
            <text key={i} x={0} y={(i - (chars.length - 1) / 2) * px * 1.18 + px * 0.36} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={px * 1.08} fill="#fbeee0">{ch}</text>
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", left: SX + half + 30 - 24 * (1 - words), top: SY - (EN ? 30 : 46), opacity: words }}>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 700, fontSize: EN ? 40 : 56, lineHeight: 1, color: HC.warm, whiteSpace: "nowrap", WebkitTextStroke: `${EN ? 8 : 10}px ${HC.ink}`, paintOrder: "stroke fill", textShadow: `0 3px 0 ${HC.shade}` } as React.CSSProperties}>{EN ? s.en : s.zh}</div>
        {!EN ? <div style={{ marginTop: 14, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 28, lineHeight: 1, color: HC.enGrey, whiteSpace: "nowrap", WebkitTextStroke: `5px ${HC.ink}`, paintOrder: "stroke fill" } as React.CSSProperties}>{s.en}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
