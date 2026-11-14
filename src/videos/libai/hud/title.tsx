// hud/title.tsx: THE THEMED TITLE of the Li Bai film (hud/skin.ts). A pure function of the frame.
//   <TitleBlock f />   frames TITLE_SPAN (beats.ts: inside the cold open, before her first word): THE TAVERN'S WINE FLAG.
//   A pole slides in from the left edge above the sleeping man, and a strip of unbleached cloth (酒旗) with a sky-blue
//   toothed hem swings down from it like a drunk's step and wobbles to rest. On it, top to bottom: 采访 small, 李 and
//   白 big in wild amber cursive (each character lands on its own beat, tipsy), 的一天 small. A wine cup is set down on
//   the cloth's corner and leaves its amber ring (the film's stamp), with one hiccup hop of the whole flag. It leaves by
//   tipping over to the left. The only words are 采访李白的一天 (Jay, 14 Nov): the year and the place are on his card.
//   TITLE_RECT  the box it takes (film px, 1080 x 1800).
import React from "react";
import { AbsoluteFill } from "remotion";
import { TITLE_SPAN } from "../beats";
import { EN } from "../lang";
import { life, setRow, glyph, roughFilter, grainFilter, gradient, spatter, easeOut, easeIn, clamp01, pop, hash01 } from "../../../kit/overlay";
import { SKIN, C, TONE, sway, hiccup, idle, inK } from "./skin";
import type { Rect } from "./style";

const ID = "libai-title";
/** the flag's geometry: the pole's tip, the cloth's box (before the sway), its teeth */
const POLE = { y: 300, x1: 392, th: 16 };
const FLAG = { x0: 92, x1: 352, y0: POLE.y + 10, y1: 990 }, TOOTH = 26;
const PIVOT = { x: (FLAG.x0 + FLAG.x1) / 2, y: POLE.y };
/** the box it takes (the sway and the cup ring included; the pole's first metres come in from the frame's edge as part
 *  of the picture, outside the words' box) */
export const TITLE_RECT: Rect = { x0: 60, y0: POLE.y - 24, x1: POLE.x1 + 16, y1: FLAG.y1 + TOOTH + 40 };

/** the toothed hem (狗牙边) along the left, the bottom and the right of the cloth, as one path */
const hemPath = () => {
  const { x0, x1, y0, y1 } = FLAG, t = TOOTH, pts: string[] = [`M${x0},${y0}`];
  const n = Math.round((y1 - y0) / 52);
  for (let i = 0; i < n; i++) { const a = y0 + ((y1 - y0) * i) / n, b = y0 + ((y1 - y0) * (i + 1)) / n; pts.push(`L${x0 - t * 0.7},${(a + b) / 2}`, `L${x0},${b}`); }
  const m = 5;
  for (let i = 0; i < m; i++) { const a = x0 + ((x1 - x0) * i) / m, b = x0 + ((x1 - x0) * (i + 1)) / m; pts.push(`L${(a + b) / 2},${y1 + t}`, `L${b},${y1}`); }
  for (let i = n - 1; i >= 0; i--) { const a = y0 + ((y1 - y0) * (i + 1)) / n, b = y0 + ((y1 - y0) * i) / n; pts.push(`L${x1 + t * 0.7},${(a + b) / 2}`, `L${x1},${b}`); }
  return pts.join(" ") + " Z";
};
const HEM = hemPath();
/** the cloth, a little uneven at its edges (the hem is sewn on it) */
const CLOTH = `M${FLAG.x0},${FLAG.y0} L${FLAG.x1},${FLAG.y0} L${FLAG.x1 + 1},${FLAG.y1} Q${PIVOT.x},${FLAG.y1 + 6} ${FLAG.x0 - 1},${FLAG.y1} Z`;

/** the amber ring a wine cup leaves: an uneven double ring, a few drips. k 0..1 = how much of it has soaked in */
const CupRing: React.FC<{ cx: number; cy: number; r: number; k: number }> = ({ cx, cy, r, k }) => {
  if (k <= 0) return null;
  const arc = (rr: number, w: number, seed: number, op: number) => {
    const n = 36, pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, j = rr * (1 + 0.035 * Math.sin(a * 3 + seed) + 0.02 * (hash01(i % n, seed) - 0.5));
      pts.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * j).toFixed(1)},${(cy + Math.sin(a) * j * 0.96).toFixed(1)}`);
    }
    return <path d={pts.join(" ")} fill="none" stroke={C.lead} strokeWidth={w} opacity={op} strokeLinecap="round" />;
  };
  const e = easeOut(k);
  return (
    <g opacity={Math.min(1, k * 1.4)} transform={`translate(${cx},${cy}) scale(${0.9 + 0.1 * e}) translate(${-cx},${-cy})`}>
      <circle cx={cx} cy={cy} r={r * 0.98} fill={C.lead} opacity={0.13 * e} />
      {arc(r, 9, 1, 0.85)}
      {arc(r * 0.9, 3.5, 4, 0.5)}
      <g fill={C.lead} opacity={0.75}>{spatter(cx + r * 0.75, cy + r * 0.7, r * 0.45, { n: 3, seed: 6, r: [3, 7] })}</g>
    </g>
  );
};

export const TitleBlock: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, TITLE_SPAN[0], TITLE_SPAN[1], SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, M = SKIN.motion;
  // the pole slides in (0..6), the cloth drops and swings from frame 3, the characters land 8, 12 (采访), 15, 21
  // (李, 白), 26 (的一天); the cup is set down on 31 (a hiccup of the whole flag); it tips over to the left at the end
  const poleIn = easeOut(clamp01((t + 1) / 6));
  const drop = easeOut(clamp01((t - 2) / 7));
  const leave = easeIn(L.leave, 2);
  const ang = sway(t, 3, 38, 24, 12) + (-62 * leave);
  const dy = hiccup(t, 31, 12) + idle(t, 2, 2.5) + 140 * leave * leave;
  const op = 1 - clamp01((L.leave - 0.55) / 0.45);
  const clothH = (FLAG.y1 + TOOTH - FLAG.y0) * drop;
  const big = 178, small = 62;
  const name = setRow("李白", big, SKIN.display, 7, { rot: [-8, 6], lift: [0, 0], scale: [1.04, 0.98] });
  const kLi = pop(t, 15, 7, M.over), kBai = pop(t, 21, 7, M.over);
  const caf = inK(t, 9, 6), day = inK(t, 26, 6);
  const ring = clamp01((t - 31) / 8);
  const yLi = 566, yBai = 758, yCaf = 388, yDay = 924;
  const ink = SKIN.display.ink * big;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1800} viewBox="0 0 1080 1800" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
        <defs>
          {gradient(`${ID}-amber`, [TONE.amberTop, [C.lead, 0.5], TONE.amberDeep])}
          {gradient(`${ID}-cloth`, [C.paper, [C.paper, 0.35], [TONE.clothLow, 0.8], TONE.clothFold], "right")}
          {gradient(`${ID}-pole`, ["#8a5a2e", [ "#6b4321", 0.5], "#4a2c14"], "down")}
          {roughFilter(`${ID}-brush`, SKIN.display.rough!, 2)}
          {roughFilter(`${ID}-edge`, SKIN.body.rough!, 2)}
          {grainFilter(`${ID}-grain`, { fx: 0.9, fy: 0.35, seed: 3, color: [120, 92, 50], amount: 0.16 })}
          <clipPath id={`${ID}-drop`}><rect x={FLAG.x0 - 40} y={FLAG.y0 - 4} width={FLAG.x1 - FLAG.x0 + 80} height={clothH + 4 + 46 * drop} /></clipPath>
        </defs>
        <g transform={`translate(0,${dy.toFixed(2)})`}>
          {/* the pole (it comes in from the left edge) with its knob */}
          <g transform={`translate(${(-POLE.x1 * (1 - poleIn)).toFixed(1)},0)`}>
            <rect x={-10} y={POLE.y - POLE.th / 2} width={POLE.x1 + 10} height={POLE.th} rx={8} fill={`url(#${ID}-pole)`} stroke={C.ink} strokeWidth={5} />
            <circle cx={POLE.x1} cy={POLE.y} r={15} fill={C.lead} stroke={C.ink} strokeWidth={5} />
          </g>
          {/* the flag swings about where it hangs */}
          <g transform={`rotate(${ang.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`} opacity={drop > 0 ? 1 : 0}>
            {/* the cords on the pole */}
            {[FLAG.x0 + 18, FLAG.x1 - 18].map((x, i) => <line key={i} x1={x} y1={POLE.y - 8} x2={x} y2={FLAG.y0 + 6} stroke={C.ink} strokeWidth={6} />)}
            <g clipPath={`url(#${ID}-drop)`}>
              <g filter={`url(#${ID}-edge)`}>
                <path d={HEM} fill={C.accent} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" transform={`translate(4,9)`} opacity={0.35} />
                <path d={HEM} fill={C.accent} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
                <path d={CLOTH} fill={`url(#${ID}-cloth)`} />
                <path d={CLOTH} fill="#fff" filter={`url(#${ID}-grain)`} opacity={0.9} style={{ mixBlendMode: "multiply" }} />
                <rect x={FLAG.x0} y={FLAG.y0} width={FLAG.x1 - FLAG.x0} height={22} fill={C.accent} stroke={C.ink} strokeWidth={5} />
                {/* an old wine stain on the cloth */}
                <ellipse cx={FLAG.x0 + 62} cy={FLAG.y0 + 410} rx={44} ry={30} fill={TONE.stain} opacity={0.16} />
                <path d={CLOTH} fill="none" stroke={C.ink} strokeWidth={5} />
              </g>
              {/* 采访, small, set across the top */}
              <g opacity={caf} transform={`translate(${PIVOT.x},${yCaf + 18 * (1 - caf)})`}>
                {glyph("caf", EN ? "A DAY" : "采访", 0, 0, small, C.ink, { ls: EN ? 2 : 10 })}
              </g>
              {/* 李 and 白: wild amber cursive, each lands on its own beat */}
              <g filter={`url(#${ID}-brush)`}>
                {[kLi, kBai].map((p, i) => {
                  const c = name[i], y = i ? yBai : yLi;
                  return (
                    <g key={i} opacity={p.o} transform={`translate(${PIVOT.x + (i ? 10 : -8)},${y}) rotate(${(c.rot + (i ? 1 : -1) * 18 * (1 - p.k)).toFixed(2)}) scale(${(p.s * c.s).toFixed(3)})`}>
                      {glyph(`n${i}`, EN ? (i ? "Bai" : "Li") : c.ch, 0, 0, big, `url(#${ID}-amber)`, { ink, inkColor: C.ink, drop: 7, dropColor: TONE.shadow })}
                    </g>
                  );
                })}
              </g>
              {/* 的一天, small, across the foot */}
              <g opacity={day} transform={`translate(${PIVOT.x},${yDay + 18 * (1 - day)})`}>
                {glyph("day", EN ? "WITH" : "的一天", 0, 0, small, C.ink, { ls: EN ? 2 : 6 })}
              </g>
              {/* the cup is set down: its amber ring on the corner */}
              <CupRing cx={FLAG.x1 - 8} cy={FLAG.y1 + 8} r={40} k={ring} />
            </g>
          </g>
          {/* the cup's knock: a small ring of air where it is set down */}
          {t >= 31 && t < 39 ? <circle cx={FLAG.x1 - 8} cy={FLAG.y1 + 8} r={40 + 40 * easeOut((t - 31) / 8)} fill="none" stroke={C.paper} strokeWidth={6 * (1 - (t - 31) / 8)} opacity={1 - (t - 31) / 8} /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
