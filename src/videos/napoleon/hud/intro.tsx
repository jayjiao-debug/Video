// hud/intro.tsx: THE LEAD'S INTRO CARD of the Napoleon film (the format's rule: on his FIRST APPEARANCE, right after the
// hook; it BUILDS piece by piece and is never a still). The picture freezes (story.ts FREEZE, 2.5 s) on him soaked on
// the bank with the flag; the cut-out pass (Film.tsx iso) keeps him in colour and washes Arcole to an engraving's
// green and parchment. Over that, in the Empire skin, in this order (t = frames into the freeze):
//    0  a flash; the picture outside his portrait darkens
//    1  THE GILT OVAL FRAME draws itself round him, from the bottom up both sides; its crowned N is stamped on top (11)
//    3  the green band wheels in under the portrait; 「今日采访对象」 marches in on its crimson ribbon (5)
//    8  拿 · 破 · 仑 stamped in gold, one drum hit each (8, 11, 14); the year and place march in beside it (17, 20)
//   22  the bulletin sheet unrolls; three stats fill with bees one by one (25, 31, 37): 胜仗 5, 修图 5, 耐心 1
//   40  the London caricature scratches itself onto the sheet's corner (the enemy's version: the film's question)
//   44  the wax seal 小伍长 is stamped top right (le petit caporal, his soldiers' name for him)
//   50  the day's target wheels in: 今日目标：量一次身高, then its counter 0/1 (55): the film pays it off in G
//   the bees' wings and the counter keep moving to the end; it leaves on a flash, as it came.
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, glyph, part, ring, roughFilter, slap, type Rect } from "../../../kit/overlay";
import { FREEZE } from "../story";
import { Bee, CrownedN, DIDONE, EM, LittleBoney, SKIN, SkinDefs, march, wheel } from "./skin";

export const LEAD_RECT: Rect = { x0: 110, y0: 960, x1: 890, y1: 1480 };
/** the oval portrait round him (Film.tsx lifts him about its centre) */
export const OVAL = { cx: 540, cy: 690, rx: 292, ry: 338 };
const STATS: [string, number][] = [["胜仗", 5], ["修图", 5], ["耐心", 1]];
const ovalD = (rx: number, ry: number) => { const { cx, cy } = OVAL; return `M${cx},${cy + ry} A${rx},${ry} 0 0 1 ${cx},${cy - ry} A${rx},${ry} 0 0 1 ${cx},${cy + ry} Z`; };
/** one half of the oval from the bottom to the top (side -1 left, 1 right), for the draw-on */
const half = (side: 1 | -1) => { const { cx, cy, rx, ry } = OVAL; return `M${cx},${cy + ry} A${rx},${ry} 0 0 ${side < 0 ? 1 : 0} ${cx},${cy - ry}`; };
const HALF_LEN = 1000;

export const LeadCard: React.FC<{ t: number }> = ({ t }) => {
  const N = FREEZE.frames;
  if (t < 0 || t > N) return null;
  // in and out on a flash, like a plate being struck: the card never fades (see skin.tsx leave)
  const flash = t < 3 ? [0.8, 0.45, 0.15][t] : t >= N - 1 ? [0.45, 0.8][t - (N - 1)] : 0;
  const dim = clamp01((t + 1) / 5), draw = easeOut(part(t, 1, 10), 2), nTop = slap(t, 11, 1.7);
  const band = wheel(t, 3, 6, -10), tag = march(t, 5, 6, -90), d1 = march(t, 17, 5, 60), d2 = march(t, 20, 5, 60);
  const sheet = easeOut(part(t, 22, 7), 2), boney = clamp01((t - 40) / 12), wax = slap(t, 44, 1.9);
  const goal = wheel(t, 50, 6, -8), count = slap(t, 55, 1.6);
  const { cx, cy, rx, ry } = OVAL;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <SkinDefs id="nc" />{roughFilter("ncRough", SKIN.display.rough!)}
          <mask id="ncOutside"><rect x={0} y={0} width={1080} height={1920} fill="#fff" /><path d={ovalD(rx - 4, ry - 4)} fill="#000" /></mask>
          <clipPath id="ncSheet"><rect x={100} y={1170} width={820} height={(230 * sheet).toFixed(1)} /></clipPath>
        </defs>
        <g>
        {/* outside the portrait the picture goes dark green: the oval reads as a painting on a wall */}
        <rect x={0} y={0} width={1080} height={1920} fill={EM.ink} opacity={0.56 * dim} mask="url(#ncOutside)" />
        {/* the gilt frame draws itself */}
        {[-1, 1].map((sd) => (
          <g key={sd} strokeLinecap="round" fill="none" strokeDasharray={HALF_LEN} strokeDashoffset={HALF_LEN * (1 - draw)} pathLength={HALF_LEN}>
            <path d={half(sd as 1 | -1)} stroke={EM.ink} strokeWidth={46} pathLength={HALF_LEN} />
            <path d={half(sd as 1 | -1)} stroke="url(#ncGilt)" strokeWidth={34} pathLength={HALF_LEN} />
            <path d={half(sd as 1 | -1)} stroke={EM.goldDeep} strokeWidth={3} pathLength={HALF_LEN} transform={`translate(${cx},${cy}) scale(0.975) translate(${-cx},${-cy})`} />
            <path d={half(sd as 1 | -1)} stroke={EM.goldLight} strokeWidth={3} pathLength={HALF_LEN} transform={`translate(${cx},${cy}) scale(1.03) translate(${-cx},${-cy})`} opacity={0.9} />
          </g>
        ))}
        {/* beads round the frame, one after another */}
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2 + Math.PI / 2, order = Math.min(i, 28 - i) / 14, k = clamp01((draw - order * 0.9) * 8);
          return k > 0 ? <circle key={i} cx={cx + rx * Math.cos(a)} cy={cy + ry * Math.sin(a)} r={5 * k} fill={EM.cream} stroke={EM.ink} strokeWidth={2} /> : null;
        })}
        {nTop > 0 ? <g transform={`translate(${cx},${cy - ry + 8}) scale(${(nTop * 0.5).toFixed(3)})`}><ellipse cx={0} cy={10} rx={86} ry={104} fill="url(#ncGreen)" stroke={EM.ink} strokeWidth={8} /><ellipse cx={0} cy={10} rx={74} ry={92} fill="none" stroke={EM.gold} strokeWidth={4} /><g transform="scale(0.78)"><CrownedN fill="url(#ncGold)" /></g></g> : null}

        {/* the bulletin sheet under the band */}
        {sheet > 0 ? (
          <g transform="rotate(-2 510 1290)">
            <g clipPath="url(#ncSheet)">
              <rect x={128} y={1150 + 9} width={770} height={240} fill={EM.shadow} />
              <rect x={128} y={1150} width={770} height={240} fill={EM.cream} stroke={EM.ink} strokeWidth={6} />
              <path d="M150,1196 H876 M150,1202 H876" stroke={EM.ink} strokeWidth={1.6} opacity={0.5} />
              <text x={513} y={1190} textAnchor="middle" fontFamily={DIDONE} fontWeight={700} fontSize={18} letterSpacing={8} fill={EM.ink} opacity={0.75}>ARMÉE D'ITALIE · AN V</text>
            </g>
            {STATS.map(([lab, n], r) => {
              const at = 25 + 6 * r, m = march(t, at, 5, -40);
              if (m.o <= 0) return null;
              const y = 1238 + r * 52;
              return (
                <g key={lab} opacity={m.o} transform={`translate(${m.x.toFixed(1)},${m.y.toFixed(1)})`}>
                  {glyph(`l${r}`, lab, 160, y, 40, EM.greenDeep, { anchor: "start", ls: 3 })}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const on = i < n, s = on ? slap(t, at + 2 + i, 1.6) : clamp01((t - at - 2 - i) / 2);
                    return s > 0 ? <Bee key={i} x={292 + i * 50} y={y - 2} s={0.78 * (on ? s : 1)} off={!on} flap={Math.sin((t + i * 2 + r * 5) * 0.55)} /> : null;
                  })}
                </g>
              );
            })}
            {/* the enemy's version of him */}
            {boney > 0 ? (
              <g transform="translate(748,1376)">
                <g transform="scale(0.82)"><LittleBoney k={boney} /></g>
                <g opacity={clamp01((t - 49) / 4)} transform="rotate(-6)">{glyph("lb", "伦敦画的他", -108, -150, 25, EM.crimsonDeep, { anchor: "middle" })}<path d="M-70,-136 q16,10 30,6" fill="none" stroke={EM.crimsonDeep} strokeWidth={2.5} strokeLinecap="round" /></g>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* the green band with his name */}
        {band.o > 0 ? (
          <g opacity={band.o} transform={`rotate(${(band.rot - 2).toFixed(2)} 60 1092) translate(60,1092) scale(${band.k.toFixed(3)},1) translate(-60,-1092)`}>
            <rect x={-40} y={1024 + 10} width={1180} height={136} fill={EM.shadow} />
            <rect x={-40} y={1024} width={1180} height={136} fill="url(#ncGreen)" stroke={EM.ink} strokeWidth={7} />
            <path d="M-40,1038 H1140 M-40,1146 H1140" stroke={EM.gold} strokeWidth={3.5} />
          </g>
        ) : null}
        {["拿", "破", "仑"].map((ch, i) => {
          const at = 8 + 3 * i, s = slap(t, at, 1.8), x = 196 + i * 136;
          if (s <= 0) return null;
          return (
            <g key={i}>
              {ring(`r${i}`, x, 1090, 50, 120, (t - at) / 6, EM.goldLight, 7)}
              <g transform={`rotate(-2 60 1092) translate(${x},1090) scale(${s.toFixed(3)})`} filter="url(#ncRough)">
                {glyph(`n${i}`, ch, 0, 0, 122, "url(#ncGold)", { ink: 15, inkColor: EM.ink, drop: 6, dropColor: "#06120b" })}
              </g>
            </g>
          );
        })}
        {d1.o > 0 ? <g opacity={d1.o} transform={`rotate(-2 60 1092) translate(${d1.x.toFixed(1)},${d1.y.toFixed(1)})`}>{glyph("d1", "1796年 · 阿尔科莱", 568, 1068, 33, EM.cream, { anchor: "start", ls: 2 })}</g> : null}
        {d2.o > 0 ? <g opacity={d2.o} transform={`rotate(-2 60 1092) translate(${d2.x.toFixed(1)},${d2.y.toFixed(1)})`}>{glyph("d2", "27岁 · 共和国将军", 568, 1114, 30, EM.goldLight, { anchor: "start", ls: 2 })}</g> : null}
        {/* 今日采访对象 */}
        {tag.o > 0 ? (
          <g opacity={tag.o} transform={`translate(${(292 + tag.x).toFixed(1)},${(986 + tag.y).toFixed(1)}) rotate(-4)`}>
            <path d="M-170,-34 H170 L156,0 L170,34 H-170 L-156,0 Z" fill="url(#ncWax)" stroke={EM.ink} strokeWidth={6} strokeLinejoin="round" />
            {glyph("tag", "今日采访对象", 0, 0, 42, EM.cream, { ls: 5 })}
          </g>
        ) : null}

        {/* the wax seal 小伍长 */}
        {wax > 0 ? (
          <g>
            {ring("wr", 826, 452, 70, 170, (t - 44) / 7, EM.crimsonLight, 10)}
            <g transform={`translate(826,452) rotate(11) scale(${wax.toFixed(3)})`}>
              <path d="M0,-86 C30,-92 44,-72 62,-62 C86,-50 82,-22 88,0 C94,26 70,40 62,62 C50,86 22,80 0,88 C-24,96 -44,72 -62,62 C-88,48 -80,22 -88,0 C-94,-26 -72,-42 -62,-62 C-48,-88 -24,-80 0,-86 Z" fill="#3a0c14" opacity={0.45} transform="translate(5,8)" />
              <path d="M0,-86 C30,-92 44,-72 62,-62 C86,-50 82,-22 88,0 C94,26 70,40 62,62 C50,86 22,80 0,88 C-24,96 -44,72 -62,62 C-88,48 -80,22 -88,0 C-94,-26 -72,-42 -62,-62 C-48,-88 -24,-80 0,-86 Z" fill="url(#ncWax)" stroke={EM.ink} strokeWidth={6} />
              <circle r={62} fill="none" stroke={EM.crimsonDeep} strokeWidth={4} /><circle r={62} fill="none" stroke={EM.crimsonLight} strokeWidth={1.5} transform="translate(-1.5,-1.5)" />
              {glyph("w1", "小伍长", 0, 0, 37, EM.cream, { ls: 2, ink: 5, inkColor: EM.crimsonDeep })}
              <path d="M-40,-30 q20,-22 44,-22" fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
            </g>
          </g>
        ) : null}

        {/* the day's target and its counter */}
        {goal.o > 0 ? (
          <g opacity={goal.o} transform={`rotate(${(goal.rot - 2).toFixed(2)} 140 1436) translate(140,1436) scale(${goal.k.toFixed(3)},1) translate(-140,-1436)`}>
            <rect x={140} y={1402 + 7} width={560} height={68} rx={10} fill={EM.shadow} />
            <rect x={140} y={1402} width={560} height={68} rx={10} fill="url(#ncGilt)" stroke={EM.ink} strokeWidth={6} />
            {glyph("g1", "今日目标：", 162, 1436, 40, EM.ink, { anchor: "start" })}
            {glyph("g2", "量一次身高", 372, 1436, 44, EM.crimsonDeep, { anchor: "start", ls: 2 })}
          </g>
        ) : null}
        {count > 0 ? (
          <g transform={`rotate(-2 140 1436) translate(790,1436) scale(${(count * (1 + 0.04 * Math.sin((t - 55) * 0.7))).toFixed(3)})`}>
            <rect x={-72} y={-34} width={144} height={68} rx={10} fill={EM.cream} stroke={EM.ink} strokeWidth={6} />
            <path d="M-58,-34 v14 M-44,-34 v9 M-30,-34 v14 M-16,-34 v9" stroke={EM.ink} strokeWidth={3} />
            <text x={10} y={15} textAnchor="middle" fontFamily={DIDONE} fontWeight={700} fontSize={46} fill={EM.crimsonDeep}>0/1</text>
          </g>
        ) : null}
        </g>
      </svg>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};
