// hud/intro.tsx: THE INTRO CARDS of the Su film (v3, Jay 2026-11-14: intro cards are standard). Pure functions of
// the frame, in the film's skin (hud/skin.ts).
//   <LeadCard t />    苏东坡's card while the picture FREEZES (beats.ts FREEZE: after A01, his grin to the lens with
//                     the spine bone; t = 0 .. FREEZE.n frames into the freeze). A white flash; he is cut out of the frozen picture
//                     in full colour with a rice-and-ink sticker edge, the rest drops to braised-pork brown with rays
//                     from his face (isolate.ts, a shader at the end of the grade chain: Film.tsx); a band of braised-pork glaze sweeps in under his
//                     beard; on it 「今日采访对象」 (a lychee-red tag) and his name 苏东坡 in running script; the square
//                     red seal 东坡居士 (his own name for himself, 1081) top right of the portrait; under the band a
//                     rice-paper panel (v4, after Jay's Newton reference card) with 「1097年 · 惠州」, three joke stats
//                     with lychees for pips (饭量 5, 诗才 5, 运气 1) and 「今日目标：荔枝三百颗」 on an ochre bar with its
//                     counter 0/300 (his own poem's 日啖荔枝三百颗: scene C pays it off with 今日已吃 298 / 300). Everything plops in, then shrinks away at the end.
//   LEAD_RECT         the box it takes (his face stays above it)
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic } from "../story";
import { FREEZE } from "../beats";
import { type Rect } from "./style";
import { KUAILE, XING } from "./fonts";
import { SK, plop, shrink, skinText } from "./skin";

export const LEAD_RECT: Rect = { x0: 110, y0: 880, x1: 900, y1: 1470 };

/** a lychee pip: full (red, bumpy) or empty */
const Pip: React.FC<{ x: number; y: number; on: boolean; s: number }> = ({ x, y, on, s }) => (
  <g transform={`translate(${x},${y}) scale(${s.toFixed(3)})`}>
    <circle r={17} fill={on ? SK.lychee : "rgba(36,19,11,0.10)"} stroke={SK.ink} strokeWidth={4.5} />
    {on ? <>{[[-6, -5], [5, -7], [7, 4], [-4, 6], [0, 0]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={2.4} fill={SK.lycheeDeep} />)}
      <path d="M-2,-17 q3,-8 9,-9" stroke="#3f7a2a" strokeWidth={4} strokeLinecap="round" fill="none" />
      <circle cx={-6} cy={-7} r={4} fill="#fff" opacity={0.55} /></> : null}
  </g>
);

const STATS: [string, number][] = [["饭量", 5], ["诗才", 5], ["运气", 1]];

export const LeadCard: React.FC<{ t: number }> = ({ t }) => {
  const N = FREEZE.n;
  if (t < 0 || t > N) return null;
  const out = shrink(t, N + 1, 6);
  const flash = t < 3 ? [0.85, 0.5, 0.15][t] : 0;
  const band = easeOutCubic((t - 1) / 6);
  const tag = plop(t - 3, 5, 80), seal = t >= 11 ? Math.max(1, [1.8, 1.3, 0.92, 1.05][t - 11] ?? 1) : 0;
  const bar = plop(t - 19, 5, 90), paper = plop(t - 9, 5, 60), count = plop(t - 23, 4, 50);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* the frozen picture behind him: the shader cut-out (isolate.ts, wired in Film.tsx) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: out.o, transform: `scale(${out.s.toFixed(4)})`, transformOrigin: "500px 1140px" }}>
        {/* the glaze band */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="lcBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SK.porkTop} /><stop offset="0.45" stopColor={SK.pork} /><stop offset="1" stopColor={SK.porkDeep} /></linearGradient>
            <clipPath id="lcSweep"><rect x={-200} y={800} width={(1480 * band).toFixed(1)} height={600} /></clipPath>
          </defs>
          {/* the paper under the band (v4, Jay's Newton reference: a paper panel below the portrait with the dateline,
              three stats and the day's target with its counter) */}
          {paper.o > 0 ? (
            <g opacity={paper.o} transform={`translate(0,${paper.y.toFixed(1)}) rotate(-3 515 1330)`}>
              <path d="M128,1172 L902,1150 L906,1462 L131,1480 Z" fill={SK.shadow} transform="translate(0,9)" />
              <path d="M128,1172 L902,1150 L906,1462 L131,1480 Z" fill={SK.rice} stroke={SK.ink} strokeWidth={7} strokeLinejoin="round" />
            </g>
          ) : null}
          <g clipPath="url(#lcSweep)" transform="rotate(-5 540 1055)">
            <rect x={-60} y={965} width={1200} height={190} fill="url(#lcBand)" stroke={SK.ink} strokeWidth={9} />
            <rect x={-60} y={977} width={1200} height={22} fill={SK.fat} opacity={0.85} />
            <path d="M40,1015 Q300,1003 560,1017" stroke="#fff" strokeOpacity={0.45} strokeWidth={8} strokeLinecap="round" fill="none" />
          </g>
          {/* the stats: label + five lychees */}
          {STATS.map(([lab, n], r) => {
            const tr = t - 13 - 2 * r, k = plop(tr, 4, 40);
            if (k.o <= 0) return null;
            const y = 1224 + r * 58;
            return (
              <g key={lab} opacity={k.o} transform={`translate(0,${k.y.toFixed(1)})`}>
                <text x={168} y={y + 2} dominantBaseline="middle" fontFamily={KUAILE} fontSize={46} fill={SK.porkDeep}>{lab}</text>
                {[0, 1, 2, 3, 4].map((i) => <Pip key={i} x={296 + i * 46} y={y} on={i < n} s={clamp01((tr - i * 0.6 + 1) / 3)} />)}
              </g>
            );
          })}
        </svg>
        {/* the tag */}
        {tag.o > 0 ? (
          <div style={{ position: "absolute", left: 150, top: 912, opacity: tag.o, transform: `translateY(${tag.y.toFixed(1)}px) scale(${tag.sx.toFixed(3)}, ${tag.sy.toFixed(3)}) rotate(-6deg)`, transformOrigin: "50% 100%", padding: "6px 22px 10px", borderRadius: 18, background: SK.lychee, border: `6px solid ${SK.ink}`, ...skinText(KUAILE, 42, SK.rice, 0), textShadow: "none" } as React.CSSProperties}>今日采访对象</div>
        ) : null}
        {/* the name, one character after another */}
        {["苏", "东", "坡"].map((ch, i) => {
          const p = plop(t - 4 - 2 * i, 5, 160);
          if (p.o <= 0) return null;
          return <div key={i} style={{ position: "absolute", left: 175 + i * 178, top: 967, opacity: p.o, transform: `translateY(${p.y.toFixed(1)}px) scale(${p.sx.toFixed(3)}, ${p.sy.toFixed(3)}) rotate(${[-6, 2, -3][i]}deg)`, transformOrigin: "50% 100%", ...skinText(XING, 196, SK.rice, 22) }}>{ch}</div>;
        })}
        {/* the seal 东坡居士, two by two: top right of the portrait (v4, as on the reference card) */}
        {seal > 0 ? (
          <div style={{ position: "absolute", left: 790, top: 318, width: 136, height: 136, transform: `scale(${seal.toFixed(3)}) rotate(8deg)`, borderRadius: 10, background: SK.lychee, border: `6px solid ${SK.ink}`, boxShadow: `inset 0 0 0 5px ${SK.rice}`, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", padding: 12, boxSizing: "border-box" }}>
            {/* read right column first, top to bottom: 东坡 / 居士 */}
            {["居", "东", "士", "坡"].map((c, i) => <div key={i} style={{ fontFamily: XING, fontSize: 52, lineHeight: 1, color: SK.rice, textAlign: "center", marginTop: -2 }}>{c}</div>)}
          </div>
        ) : null}
        {/* the year and the place (moved here from the title: Jay 2026-11-14, the title says only 采访苏东坡的一天) */}
        {paper.o > 0 ? (
          <div style={{ position: "absolute", left: 872, top: 1212, opacity: paper.o, transform: `translateX(-100%) translateY(${paper.y.toFixed(1)}px) rotate(-3deg)`, transformOrigin: "100% 50%", fontFamily: KUAILE, fontSize: 40, color: SK.pork, whiteSpace: "nowrap" }}>1097年 · 惠州</div>
        ) : null}
        {/* the day's target */}
        {bar.o > 0 ? (
          <div style={{ position: "absolute", left: 150, top: 1388, opacity: bar.o, transform: `translateY(${bar.y.toFixed(1)}px) scale(${bar.sx.toFixed(3)}, ${bar.sy.toFixed(3)}) rotate(-3deg)`, transformOrigin: "50% 100%", padding: "4px 26px 10px", borderRadius: 14, background: `linear-gradient(${SK.robeLight}, ${SK.robe})`, border: `6px solid ${SK.ink}`, boxShadow: `0 7px 0 ${SK.shadow}`, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: KUAILE, fontSize: 50, color: SK.ink }}>今日目标：</span>
            <span style={{ fontFamily: KUAILE, fontSize: 54, color: SK.lycheeDeep }}>荔枝三百颗</span>
          </div>
        ) : null}
        {/* the counter the film pays off in C (今日已吃 298 / 300) */}
        {count.o > 0 ? (
          <div style={{ position: "absolute", left: 708, top: 1392, opacity: count.o, transform: `translateY(${count.y.toFixed(1)}px) scale(${count.sx.toFixed(3)}, ${count.sy.toFixed(3)}) rotate(-3deg)`, transformOrigin: "50% 100%", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <svg width={44} height={44} viewBox="-22 -24 44 46" style={{ overflow: "visible" }}><Pip x={0} y={2} on s={1.05} /></svg>
            <span style={{ fontFamily: KUAILE, fontSize: 42, color: SK.ink }}>0/300</span>
          </div>
        ) : null}
      </div>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};
