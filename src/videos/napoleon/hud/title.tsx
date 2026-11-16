// hud/title.tsx: THE THEMED TITLE of the Napoleon film, in the Empire skin (hud/skin.tsx). A pure function of the frame.
//   <TitleBlock f />  on TITLE_BLOCK's frames (after 「À cheval.」, over the bridge and its smoke): a chasseur-green
//   plaque wheels into line; 拿 破 仑 are STAMPED on it in gold one drum hit at a time; a gold laurel wreath grows up
//   both sides and closes at the crowned N; 「采访」 marches in on a crimson ribbon, 「的一天」 from the other side;
//   three bees settle. Nothing else is written on it (who he is is on his card).
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, glyph, part, ring, roughFilter, slap, type Rect } from "../../../kit/overlay";
import { TITLE_BLOCK } from "../story";
import { Bee, CrownedN, DIDONE, EM, Laurel, SKIN, SkinDefs, leave, march, wheel } from "./skin";

const CX = 540, CY = 900, PX = 164, XS = [CX - 196, CX, CX + 196];
export const TITLE_RECT: Rect = { x0: 190, y0: 560, x1: 890, y1: 1220 };
const BEES: [number, number, number][] = [[222, 776, -24], [860, 790, 30], [246, 1030, -70]];

export const TitleBlock: React.FC<{ f: number }> = ({ f }) => {
  const { from, to } = TITLE_BLOCK;
  if (f < from || f > to) return null;
  const t = f - from, len = to - from + 1, out = leave(t, len, SKIN.motion.leave);
  const pl = wheel(t, 0, 6, -14), tag = march(t, 12, 6, -90), tail = march(t, 15, 6, 90), crown = slap(t, 22, 1.6);
  const grow = easeOut(part(t, 6, 16), 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs><SkinDefs id="nt" />{roughFilter("ntRough", SKIN.display.rough!)}</defs>
        <g transform={`translate(${CX},${CY}) scale(${out.s.toFixed(4)}) translate(${-CX},${-CY})`}>
        {/* the wreath, behind the plaque */}
        <Laurel cx={CX} cy={CY} R={352} side={-1} k={grow} fill="url(#ntGold)" n={9} leaf={64} />
        <Laurel cx={CX} cy={CY} R={352} side={1} k={grow} fill="url(#ntGold)" n={9} leaf={64} />
        {/* the plaque */}
        {pl.o > 0 ? (
          <g opacity={pl.o} transform={`rotate(${(pl.rot - 2).toFixed(2)} ${CX - 320} ${CY}) translate(${CX - 320},${CY}) scale(${pl.k.toFixed(3)},1) translate(${-(CX - 320)},${-CY})`}>
            <rect x={CX - 322} y={CY - 118 + 12} width={644} height={236} rx={18} fill={EM.shadow} />
            <rect x={CX - 322} y={CY - 118} width={644} height={236} rx={18} fill="url(#ntGilt)" stroke={EM.ink} strokeWidth={7} />
            <rect x={CX - 304} y={CY - 100} width={608} height={200} rx={8} fill="url(#ntGreen)" stroke={EM.ink} strokeWidth={5} />
            <rect x={CX - 292} y={CY - 88} width={584} height={176} rx={4} fill="none" stroke={EM.gold} strokeWidth={2.5} opacity={0.8} />
            <text x={CX} y={CY - 66} textAnchor="middle" fontFamily={DIDONE} fontWeight={700} fontSize={17} letterSpacing={10} fill={EM.goldLight} opacity={clamp01((t - 16) / 6) * 0.9}>BULLETIN DE LA GRANDE ARMÉE</text>
          </g>
        ) : null}
        {/* the name, stamped */}
        {["拿", "破", "仑"].map((ch, i) => {
          const at = 7 + 4 * i, s = slap(t, at, 1.75);
          if (s <= 0) return null;
          return (
            <g key={i}>
              {ring(`r${i}`, XS[i], CY + 10, 70, 150, (t - at) / 6, EM.goldLight, 9)}
              <g transform={`rotate(-2 ${CX} ${CY}) translate(${XS[i]},${CY + 10}) scale(${s.toFixed(3)})`} filter="url(#ntRough)">
                {glyph(`c${i}`, ch, 0, 0, PX, "url(#ntGold)", { ink: PX * SKIN.display.ink * 1.6, inkColor: EM.ink, drop: 7, dropColor: "#06120b" })}
              </g>
            </g>
          );
        })}
        {/* the crowned N closes the wreath */}
        {crown > 0 ? <g transform={`translate(${CX},${CY - 352 + 40}) scale(${(crown * 0.8).toFixed(3)})`}><CrownedN fill="url(#ntGold)" /></g> : null}
        {/* 采访 on a crimson ribbon */}
        {tag.o > 0 ? (
          <g opacity={tag.o} transform={`translate(${(CX - 250 + tag.x).toFixed(1)},${(CY - 168 + tag.y).toFixed(1)}) rotate(-5)`}>
            <path d="M-96,-40 H96 L80,0 L96,40 H-96 L-80,0 Z" fill="url(#ntWax)" stroke={EM.ink} strokeWidth={6} strokeLinejoin="round" />
            {glyph("tag", "采访", 0, 0, 58, EM.cream, { ls: 8 })}
          </g>
        ) : null}
        {/* 的一天 */}
        {tail.o > 0 ? (
          <g opacity={tail.o} transform={`translate(${(CX + 212 + tail.x).toFixed(1)},${(CY + 176 + tail.y).toFixed(1)}) rotate(-3)`}>
            {glyph("tail", "的一天", 0, 0, 84, EM.cream, { ink: 15, inkColor: EM.ink, ls: 6, drop: 5, dropColor: "#06120b" })}
          </g>
        ) : null}
        {/* the bees settle, then keep their wings moving */}
        {BEES.map(([x, y, r], i) => {
          const k = easeOut(part(t, 24 + 4 * i, 9), 2);
          if (k <= 0) return null;
          const dx = (i === 1 ? 1 : -1) * 260 * (1 - k), dy = -220 * (1 - k) * (1 - k) + 40 * Math.sin(k * 5) * (1 - k);
          return <Bee key={i} x={x + dx} y={y + dy} rot={r + 50 * (1 - k)} s={1.15} flap={Math.sin((t + i * 3) * (k < 1 ? 2.4 : 0.5))} />;
        })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
