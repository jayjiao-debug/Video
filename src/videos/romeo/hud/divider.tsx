// hud/divider.tsx: THE SPLIT'S EDGE, for the one scene where the screen splits top and bottom (Juliet on her balcony
// above, Romeo in the orchard below) and the two halves then widen into one picture, in the film's skin (hud/skin.ts,
// 「信」 the letter): the screen is a letter torn across. A torn band of parchment lies along the split, stitched shut
// with a gilt thread; as it opens the thread pulls out and the two torn edges part, the upper one riding up with
// Juliet's half and the lower one riding down with Romeo's. A pure function of its props.
//
//   <SplitDivider y open id? />
//     y      the split's y when shut (film px), e.g. 960 for equal halves
//     open   0..1: 0 = shut (the band is DIVIDER.h = 56 px tall across the whole width); as it grows the two torn
//            edges move apart (the upper to the top of the frame, the lower to the bottom) and at 1 nothing is left.
//            Ease it in the scene (the paper has no easing of its own).
//     id     the prefix of its SVG ids (default "romeo-split")
//   dividerEdges(y, open)   { upper, lower }: the y of the two torn edges on this frame. Show the upper picture above
//                           `upper`, the lower picture below `lower`, and the one joined picture between them.
//   tearPath(y, x0?, x1?)   the torn line itself (a polyline along y), to clip a picture to the tear if you want.
//
// THE LOOK: parchment with a browned, torn inner edge on each half; a Capulet-red line with a gilt hair along the upper
// half's outer edge (her side), a Montague-blue one along the lower half's (his side); gilt stitches across the tear
// while it is shut.
// SOUND: "paper tear" (one long dry rip, about 0.4 s) as `open` leaves 0.
import React from "react";
import { clamp01, hash01 } from "../../../kit/overlay";
import { C, TONE } from "./skin";
import { letterDefs } from "./marks";

/** the band's numbers: its height when shut, how far past the frame the halves travel */
export const DIVIDER = { h: 56, past: 70, W: 1080, H: 1920 } as const;
/** the torn line along y: the same on every frame (both halves fit it) */
const tearPts = (y: number, x0 = -24, x1 = DIVIDER.W + 24): [number, number][] => {
  const pts: [number, number][] = [], step = 15, n = Math.ceil((x1 - x0) / step);
  for (let i = 0; i <= n; i++) pts.push([x0 + i * step + 5 * (hash01(i, 23) - 0.5), y + 16 * (hash01(i, 17) - 0.5) + 5 * Math.sin(i * 0.37)]);
  return pts;
};
export const tearPath = (y: number, x0?: number, x1?: number) => tearPts(y, x0, x1).map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
/** the y of the two torn edges for an amount of opening */
export const dividerEdges = (y: number, open: number) => { const k = clamp01(open); return { upper: y - k * (y + DIVIDER.past), lower: y + k * (DIVIDER.H - y + DIVIDER.past) }; };

export const SplitDivider: React.FC<{ y: number; open: number; id?: string }> = ({ y, open, id = "romeo-split" }) => {
  const k = clamp01(open);
  if (k >= 1) return null;
  const E = dividerEdges(y, k), hh = DIVIDER.h / 2, tear = tearPts(0), line = tear.map(([x, yy]) => `L${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const up = `M-24,${-hh} ${line} L${DIVIDER.W + 24},${-hh} Z`, down = `M-24,${hh} ${line} L${DIVIDER.W + 24},${hh} Z`;
  const fade = 1 - clamp01((k - 0.86) / 0.14), thread = 1 - clamp01(k * 18);
  const lip = (d: string, dy: number, house: string, deep: string, edge: number, key: string) => (
    <g key={key} transform={`translate(0,${dy.toFixed(1)})`} filter={`url(#${id}-sh)`}>
      <g filter={`url(#${id}-deckle)`}>
        <path d={d} fill={`url(#${id}-paper)`} />
        <path d={d} fill="#fff" filter={`url(#${id}-fibre)`} />
        <path d={`M-24,0 ${line}`} fill="none" stroke={TONE.paperEdge} strokeWidth={9} opacity={0.5} filter={`url(#${id}-soft)`} />
        <path d={`M-24,0 ${line}`} fill="none" stroke={TONE.paperHi} strokeWidth={2.5} opacity={0.9} />
      </g>
      <rect x={-24} y={edge - 3.5} width={DIVIDER.W + 48} height={7} fill={house} />
      <rect x={-24} y={edge + (edge < 0 ? 3.5 : -5.5)} width={DIVIDER.W + 48} height={2} fill={TONE.gold} />
      <rect x={-24} y={edge + (edge < 0 ? -3.5 : 2)} width={DIVIDER.W + 48} height={1.5} fill={deep} opacity={0.7} />
    </g>
  );
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: fade }}>
      <defs>{letterDefs(id)}</defs>
      {lip(down, E.lower, C.lead, TONE.blueDeep, hh - 3.5, "lower")}
      {lip(up, E.upper, C.accent, TONE.redDeep, -hh + 3.5, "upper")}
      {/* the gilt thread that held the tear shut: it pulls out as the halves part */}
      {thread > 0 ? (
        <g opacity={thread} stroke={TONE.gold} strokeWidth={3.2} strokeLinecap="round" transform={`translate(0,${y})`}>
          {tear.filter((_, i) => i % 5 === 2).map(([x, yy], i) => <g key={i}><line x1={x - 7} y1={yy - 10 - 40 * k} x2={x + 7} y2={yy + 10 + 40 * k} stroke={TONE.goldDeep} strokeWidth={5} opacity={0.5} /><line x1={x - 7} y1={yy - 10 - 40 * k} x2={x + 7} y2={yy + 10 + 40 * k} /></g>)}
        </g>
      ) : null}
    </svg>
  );
};
