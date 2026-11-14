// hud/title.tsx: THE THEMED TITLE of the Su film (v3, Jay 2026-11-14: "more similar to 秦始皇 with thematic rather
// than plain and boring"; every film's title is its own). A pure function of the frame.
//   <TitleBlock f />   TITLE_SPAN (beats.ts: about 1.2 s at the end of the cold open, between card 1 and B06, over
//                      the whip into the yard; never under a subtitle). 苏东坡's name on THREE CUBES OF 东坡肉:
//                      glossy braised pork with its layers (dark skin, a band of fat, the lean), tied with straw the
//                      way the dish is tied, one running-script character on each (XING, rice cream on the ink line),
//                      steam curling up. They plop down one after another and jiggle (the skin's motion); 「采访」
//                      plops on a lychee-red tag above left, 「的一天」 below right. NO OTHER WORDS (Jay 2026-11-14:
//                      the intro card says who he is, so the title is only 采访苏东坡的一天; 1097年 · 惠州 is on his card).
//                      Everything shrinks away over the last 6 frames. English: the same cubes carry SU / DONG / PO.
//   TITLE_RECT  the box it takes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, hash } from "../story";
import { TITLE_SPAN } from "../beats";
import { EN } from "../lang";
import { type Rect } from "./style";
import { KUAILE, XING } from "./fonts";
import { SK, plop, shrink } from "./skin";

const S = 196, GAP = 234, CY = 1010;                     // cube size, centre spacing, centre y
const XS = [540 - GAP, 540, 540 + GAP];
const MAIN = EN ? ["SU", "DONG", "PO"] : ["苏", "东", "坡"];
/** the box the title takes (px) */
export const TITLE_RECT: Rect = { x0: 150, y0: CY - S / 2 - 90, x1: 900, y1: CY + S / 2 + 120 };

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="stLean" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b5461f" /><stop offset="1" stopColor="#6b1d0b" /></linearGradient>
    <linearGradient id="stSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9582c" /><stop offset="0.5" stopColor="#8a2a12" /><stop offset="1" stopColor="#5a1608" /></linearGradient>
    <linearGradient id="stFat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbecc8" /><stop offset="1" stopColor="#e8c58a" /></linearGradient>
    <radialGradient id="stGloss" cx="0.3" cy="0.22" r="0.55"><stop offset="0" stopColor="#ffffff" stopOpacity="0.55" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0.12" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
    <clipPath id="stCube"><rect x={-S / 2} y={-S / 2} width={S} height={S} rx={34} /></clipPath>
  </defs>
);

/** one cube of 东坡肉 centred on (0, 0) with its character */
const Cube: React.FC<{ ch: string; i: number }> = ({ ch, i }) => {
  const h = S / 2, px = EN ? (ch.length > 2 ? 74 : 96) : 150;
  return (
    <g>
      <ellipse cx={6} cy={h + 12} rx={h * 0.95} ry={16} fill={SK.shadow} />
      <g clipPath="url(#stCube)">
        <rect x={-h} y={-h} width={S} height={S} fill="url(#stLean)" />
        <rect x={-h} y={-h} width={S} height={48} fill="url(#stSkin)" />
        <rect x={-h} y={-h + 48} width={S} height={34} fill="url(#stFat)" />
        <path d={`M${-h},${18 + 6 * hash(i, 3)} C${-h / 2},${8} ${h / 2},${30} ${h},${14 + 6 * hash(i, 5)} L${h},${26} C${h / 2},${42} ${-h / 2},${20} ${-h},${30} Z`} fill="url(#stFat)" opacity={0.75} />
        <rect x={-h} y={-h} width={S} height={S} fill="url(#stGloss)" />
        <path d={`M${-h + 26},${-h + 14} Q${-h + 70},${-h + 4} ${-h + 118},${-h + 12}`} stroke="#fff" strokeOpacity={0.7} strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
      {/* the straw tie */}
      <g stroke={SK.ink} strokeWidth={17} strokeLinecap="round" fill="none">
        <path d={`M0,${-h - 6} L0,${h + 6}`} /><path d={`M${-h - 6},${6} L${h + 6},${6}`} />
      </g>
      <g stroke="#e3be62" strokeWidth={10} strokeLinecap="round" fill="none">
        <path d={`M0,${-h - 6} L0,${h + 6}`} /><path d={`M${-h - 6},${6} L${h + 6},${6}`} />
      </g>
      <g transform={`translate(0,${-h - 8})`}>
        <ellipse cx={-17} cy={-8} rx={19} ry={11} fill="#e3be62" stroke={SK.ink} strokeWidth={5} transform="rotate(-24)" />
        <ellipse cx={17} cy={-8} rx={19} ry={11} fill="#e3be62" stroke={SK.ink} strokeWidth={5} transform="rotate(24)" />
        <circle cx={0} cy={-2} r={9} fill="#e3be62" stroke={SK.ink} strokeWidth={5} />
      </g>
      <rect x={-h} y={-h} width={S} height={S} rx={34} fill="none" stroke={SK.ink} strokeWidth={10} />
      {/* the character, a little turned */}
      <text x={0} y={22} textAnchor="middle" dominantBaseline="middle" fontFamily={EN ? KUAILE : XING} fontSize={px} fill={SK.rice} stroke={SK.ink} strokeWidth={EN ? 14 : 17} strokeLinejoin="round" style={{ paintOrder: "stroke fill" } as React.CSSProperties} transform={`rotate(${[-5, 3, -2][i]})`}>{ch}</text>
    </g>
  );
};

/** two curls of steam over a cube, rising and fading on a 22-frame loop (t = frames since the cube landed) */
const Steam: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  if (t < 0) return null;
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 2; k++) {
    const u = ((t + k * 11 + i * 5) % 22) / 22, x = (k ? 30 : -34) + 6 * Math.sin(u * 6 + i), y = -S / 2 - 40 - 90 * u;
    out.push(<path key={k} d={`M${x},${y} q14,-18 0,-36 q-14,-18 0,-36`} stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" opacity={(0.75 * Math.sin(Math.PI * u) * clamp01(t / 4)).toFixed(3)} />);
  }
  return <>{out}</>;
};

export const TitleBlock: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = TITLE_SPAN;
  if (f < a || f > b) return null;
  const t = f - a, out = shrink(f, b + 1, 6);
  const tag = plop(t - 11, 5, 90), tail = plop(t - 14, 5, 90);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: out.o }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `scale(${out.s.toFixed(4)})`, transformOrigin: `540px ${CY}px` }}>
        <Defs />
        {MAIN.map((ch, i) => {
          const p = plop(t - 4 * i, 6, 110);                         // a short drop: never across his face at the end of A
          if (p.o <= 0) return null;
          return (
            <g key={i} opacity={p.o} transform={`translate(${XS[i]},${(CY + p.y).toFixed(1)}) translate(0,${S / 2}) scale(${p.sx.toFixed(4)},${p.sy.toFixed(4)}) translate(0,${-S / 2})`}>
              <Steam t={t - 4 * i - 6} i={i} />
              <Cube ch={ch} i={i} />
            </g>
          );
        })}
        {tag.o > 0 ? (
          <g opacity={tag.o} transform={`translate(${XS[0] - 64},${(CY - S / 2 - 54 + tag.y).toFixed(1)}) scale(${tag.sx.toFixed(4)},${tag.sy.toFixed(4)}) rotate(-6)`}>
            <rect x={-6} y={-34} width={EN ? 250 : 150} height={68} rx={18} fill={SK.lychee} stroke={SK.ink} strokeWidth={7} />
            <text x={EN ? 119 : 69} y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={KUAILE} fontSize={EN ? 40 : 50} fill={SK.rice}>{EN ? "A DAY WITH" : "采访"}</text>
          </g>
        ) : null}
        {!EN && tail.o > 0 ? (
          <g opacity={tail.o} transform={`translate(${XS[2] + S / 2 + 18},${(CY + S / 2 + 58 + tail.y).toFixed(1)}) scale(${tail.sx.toFixed(4)},${tail.sy.toFixed(4)}) rotate(-4)`}>
            <text x={0} y={0} textAnchor="end" dominantBaseline="middle" fontFamily={KUAILE} fontSize={74} fill={SK.robeLight} stroke={SK.ink} strokeWidth={14} strokeLinejoin="round" style={{ paintOrder: "stroke fill" } as React.CSSProperties}>的一天</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
