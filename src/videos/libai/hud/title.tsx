// hud/title.tsx: THE TITLE BLOCK of the Su film (PLAN.md section 6; WP1). A pure function of the frame.
//   <TitleBlock f />   frames TITLE_SPAN (0-90, beats.ts), top centre (y 230-420): 「采访苏东坡的一天」 big (92 px, warm white,
//                      the captions' thick ink line, no box) and under it 「1097年 · 惠州」 (40 px, cream). English:
//                      "A Day with Su Dongpo" / "1097 · Huizhou". Already up on frame 0 (the film opens moving), a slow
//                      1 % drift, and it fades out (rising 10 px) over its last 12 frames.
//   TITLE_RECT  the box it takes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { TITLE, SUBTITLE, clamp01, easeInCubic } from "../story";
import { TITLE_SPAN } from "../beats";
import { EN } from "../lang";
import { FONT_STACK, HC, textW, type Rect } from "./style";

const MAIN = EN ? 80 : 92, SUB = 40, Y_MAIN = 470, Y_SUB = 552, OUT = 12;
/** the box the title takes (px) */
export const TITLE_RECT: Rect = { x0: 90, y0: 400, x1: 990, y1: 590 };

/** one line of inked text centred at (540, y): the ink line drawn under the fill, a hard drop */
const Inked: React.FC<{ s: string; px: number; y: number; color: string; ls: number; sw: number }> = ({ s, px, y, color, ls, sw }) => {
  const base: React.CSSProperties = { position: "absolute", left: 540, top: y, transform: "translate(-50%, -50%)", fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: ls, whiteSpace: "nowrap" };
  return (
    <>
      <div style={{ ...base, color: HC.ink, WebkitTextStroke: `${sw}px ${HC.ink}`, textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.5), 0 ${Math.round(px * 0.08)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.45)` } as React.CSSProperties}>{s}</div>
      <div style={{ ...base, color }}>{s}</div>
    </>
  );
};

export const TitleBlock: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = TITLE_SPAN;
  if (f < a || f > b) return null;
  const u = easeInCubic(clamp01((f - (b - OUT)) / OUT));
  const op = 1 - u, s = 1 + 0.01 * ((f - a) / (b - a + 1)), dy = -10 * u;
  // the main row fits the frame with margin (the English is longer)
  const ls = EN ? 1 : 6, px = Math.min(MAIN, Math.floor((MAIN * 860) / Math.max(1, textW(TITLE, MAIN, ls))));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: op, transform: `translateY(${dy.toFixed(2)}px) scale(${s.toFixed(4)})`, transformOrigin: `540px ${Y_MAIN}px` }}>
        <Inked s={TITLE} px={px} y={Y_MAIN} color={HC.warm} ls={ls} sw={Math.round(px * 0.19)} />
        <Inked s={SUBTITLE} px={SUB} y={Y_SUB} color={HC.cream} ls={EN ? 1 : 4} sw={Math.round(SUB * 0.2)} />
      </div>
    </AbsoluteFill>
  );
};
