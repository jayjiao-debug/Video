// hud/poem.tsx: HIS POEMS AS BRUSHWORK. When 李白 speaks a line of his own poetry it is not shown as a subtitle: it is
// brushed onto the screen, character by character as he says it, in the skin's tipsy hand (skin.ts display), cloth
// coloured with an ink edge over a dragged amber stroke, with a small chip naming the poem. A couplet stacks its two
// rows and holds a moment after the last word. Jay, 14 Nov: "When he reads his poem ... add his poem like special
// effect on the screen".
//   C20  云想衣裳花想容 / 春风拂槛露华浓      《清平调》 (he is writing it for the emperor)
//   D25  天生我材必有用 / 千金散尽还复来      《将进酒》
//   E31  三百六十日，日日醉如泥              《赠内》
//   F41  花间一壶酒 / 独酌无相亲 ; 举杯邀明月 / 对影成三人   《月下独酌》 (the same brushwork as the others since 16 Nov;
//        the `soft` style, ink-in only, is kept in the code but unused)
// Film.tsx hides the subtitle while a poem shows (poemAt); hud/index.ts registers its box for the overlay check.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAPTIONS, CAPTION_AT } from "../captions";
import { SCREEN } from "../layout";
import { roughFilter, gradient, glyph, setRow, easeOut, easeIn, clamp01, hash01 } from "../../../kit/overlay";
import { SKIN, C, TONE } from "./skin";
import type { Rect } from "./style";

type Poem = { rows: [line: number, k: number][]; title: string; soft?: boolean };
const POEMS: Poem[] = [
  { rows: [[20, 0], [20, 1]], title: "《清平调》" },
  { rows: [[25, 1], [25, 2]], title: "《将进酒》" },
  { rows: [[31, 2]], title: "《赠内》" },
  // (no longer soft: Jay, 16 Nov: "This poem here make them the same like the ones in the prevoius, keep consistancy")
  { rows: [[41, 0], [41, 1]], title: "《月下独酌》" },
  { rows: [[41, 2], [41, 3]], title: "《月下独酌》" },
];
const PUNCT = /[，。！？、；：,.!?…]/, GAP = "\u3000";
type Row = { chars: string[]; at: number[]; from: number; end: number };
const rowOf = (line: number, k: number): Row => {
  const i = CAPTIONS.findIndex((g) => g.line === line && g.k === k);
  if (i < 0) throw new Error(`[poem] no caption group for line ${line} k ${k}`);
  // a mid-row comma becomes a breath of space (GAP, drawn as nothing); the end punctuation goes
  const g = CAPTIONS[i], spoken = CAPTION_AT[i], chars: string[] = [], at: number[] = [];
  const cs = [...g.text];
  cs.forEach((c, j) => {
    if (PUNCT.test(c)) { if (j < cs.length - 1) { chars.push(GAP); at.push(at[at.length - 1] ?? g.from); } return; }
    chars.push(c); at.push(spoken[at.filter((_, q) => chars[q] !== GAP).length] ?? spoken[spoken.length - 1] ?? g.from);
  });
  return { chars, at, from: g.from, end: g.to };
};
const HOLD = 22, OUT = 8;
type Built = Poem & { R: Row[]; from: number; to: number };
// it holds HOLD frames after the last word, but is gone before anyone speaks next (the subtitle, or her whisper, comes back)
const nextSpoken = (after: number) => CAPTIONS.find((g) => g.from > after)?.from ?? Infinity;
const BUILT: Built[] = POEMS.map((p) => {
  const R = p.rows.map(([l, k]) => rowOf(l, k)), last = R[R.length - 1].end;
  return { ...p, R, from: R[0].from - 2, to: Math.min(last + HOLD + OUT, nextSpoken(last) - 2) };
});
const poemOn = (f: number) => BUILT.find((p) => f >= p.from && f <= p.to) ?? null;
/** the brush's sound: one very soft stroke as each character lands, ONLY for the poem he writes with a brush (the
 *  palace couplet C20). The poems he only recites (D25, E31) have none (Jay, 15 Nov: "Since the other poems he reads
 *  out we dont need to do the brush stroke sounds", and "the brush stroke sounds is too loud": -15 dB then, -24 now).
 *  [picture frame, clip, gain dB, what] (sound_events.ts) */
const WRITTEN = new Set([20]);
export const POEM_SOUNDS: [number, string, number, string][] = BUILT.filter((p) => !p.soft && WRITTEN.has(p.rows[0][0])).flatMap((p) => p.R.flatMap((r, ri) =>
  r.chars.flatMap((c, i): [number, string, number, string][] => (c === GAP ? [] : [[r.at[i], `sfx_stroke${((i + ri) % 3) + 1}`, -24, `${p.title} row ${ri + 1} ${c}`]]))));
/** a poem shows on picture frame f (the subtitle is hidden) */
export const poemAt = (f: number) => poemOn(f) !== null;

// layout: the last row sits on the subtitle band, an earlier row above it (words below y 950 stay left of x 930)
const X0 = 150, X1 = 890, CX = (X0 + X1) / 2, ROW_Y = [1262, 1398], MAXW = X1 - X0 - 30;
const pxFor = (n: number) => Math.min(96, Math.floor(MAXW / (n * 1.04)));
export const poemRect = (f: number): Rect | null => {
  const p = poemOn(f);
  if (!p) return null;
  const y0 = (p.R.length > 1 ? ROW_Y[0] : ROW_Y[1]) - 70;
  return { x0: X0, y0, x1: X1, y1: ROW_Y[1] + 66 };
};

const ID = "lbpoem";
export const PoemFx: React.FC<{ f: number }> = ({ f }) => {
  const p = poemOn(f);
  if (!p) return null;
  const out = easeIn(clamp01((f - (p.to - OUT)) / OUT), 2), soft = !!p.soft;
  const rowsY = p.R.length > 1 ? ROW_Y : [ROW_Y[1]];
  const titleK = clamp01((f - p.from) / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: 1 - (soft ? out : clamp01((out - 0.4) / 0.6)) }}>
        <defs>
          {roughFilter(`${ID}-band`, { fx: 0.012, fy: 0.12, scale: 9, seed: 21 }, 2)}
          {gradient(`${ID}-amber`, [[TONE.amberTop, 0], [C.lead, 0.5], [TONE.amberDeep, 1]], "right")}
        </defs>
        {/* soft: the poem fades; otherwise the whole thing tips over and drops away at the end */}
        <g transform={soft ? undefined : `rotate(${(-14 * out).toFixed(2)} ${X0} ${ROW_Y[1] + 60}) translate(0 ${(90 * out * out).toFixed(1)})`}>
          {p.R.map((r, ri) => {
            const n = r.chars.length, px = pxFor(n), y = rowsY[ri];
            const set = setRow(r.chars.join(""), px, { track: 0.04, hand: soft ? { rot: 2, lift: 3, scale: 0.02 } : SKIN.display.hand }, 31 + ri * 7);
            const w = set.length ? set[set.length - 1].x + set[set.length - 1].w / 2 - (set[0].x - set[0].w / 2) : 0;
            // the dragged amber stroke under the row, laid as the first character lands
            const bandK = soft ? 0 : easeOut(clamp01((f - r.at[0] + 1) / 8));
            const done = clamp01((f - r.at[n - 1]) / 6);
            return (
              <g key={ri}>
                {bandK > 0 ? (
                  <g filter={`url(#${ID}-band)`} opacity={0.85}>
                    <rect x={CX - w / 2 - 26} y={y - px * 0.28} width={(w + 52) * bandK} height={px * 0.62} rx={px * 0.3} fill={`url(#${ID}-amber)`} transform={`rotate(-2 ${CX} ${y})`} />
                  </g>
                ) : null}
                {/* (no rough filter on the characters: Jay, 15 Nov: "for his poem the font is not crisp") */}
                <g>
                  {set.map((c, i) => {
                    const t = f - r.at[i];
                    if (t < 0 || c.ch === GAP) return null;
                    const k = clamp01((t + 1) / (soft ? 7 : 5));
                    // a brush hit: it lands big and settles (soft: it only inks in)
                    const s = soft ? 1 : 1 + 0.38 * (1 - easeOut(k)) + 0.04 * Math.sin(Math.min(t, 12) * 0.9) * (1 - done) * hash01(i, 9);
                    const op = soft ? easeOut(k) : Math.min(1, k * 2);
                    const x = CX + c.x, yy = y + c.y;
                    return (
                      <g key={i} transform={`translate(${x.toFixed(1)} ${yy.toFixed(1)}) rotate(${(c.rot + (soft ? 0 : SKIN.display.tilt)).toFixed(2)}) scale(${(s * c.s).toFixed(3)})`} opacity={op}>
                        {glyph(`p${ri}-${i}`, c.ch, 0, 0, px, soft ? C.paper : C.paper, { ink: soft ? Math.round(px * 0.1) : Math.round(px * 0.14), inkColor: C.ink, drop: soft ? 0 : 6, dropColor: TONE.shadow })}
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}
          {/* the chip naming the poem, at the top row's left end */}
          {titleK > 0 ? (
            <g transform={`translate(${X0 + 6} ${rowsY[0] - (pxFor(p.R[0].chars.length) * 0.5 + 44)}) rotate(-3)`} opacity={easeOut(titleK) * (soft ? 0.85 : 1)}>
              <rect x={0} y={-22} width={34 * [...p.title].length * 0.9 + 70} height={44} rx={10} fill={soft ? "rgba(27,33,72,0.75)" : C.accent} stroke={C.ink} strokeWidth={4} />
              {glyph("ptitle", `李白${p.title}`, 14, 0, 28, C.paper, { anchor: "start", ls: 1 })}
            </g>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
/** the overlay check needs SCREEN imported for its frame; kept for the safe numbers above */
export const POEM_SAFE = { x0: X0, x1: X1, side: SCREEN.side };
