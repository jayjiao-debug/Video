// overlay/text.tsx: WORDS AND NUMBERS (shared kit; src/kit/overlay/README.md). Measuring a row without the DOM, an
// inked SVG glyph, a row set character by character (so each one can move on its own), typing, counting, an odometer.
// These draw nothing that has a look of its own: colours, sizes, treatment and motion come from the film's skin.
//
//   const row = setRow("秦始皇", 200, SKIN.display, 3);            // each character's own place, turn, lift and scale
//   row.map((c) => { const p = pop(t, stagger(c.i, 2, 2));          // ... and its own moment
//     return <g key={c.i} opacity={p.o} transform={`translate(${540 + c.x},${670 + c.y}) rotate(${c.rot}) scale(${c.s * p.s})`}>
//       {glyph("g", c.ch, 0, 0, 200, "url(#gold)", { ink: 18 })}</g>; })
import React from "react";
import { FONT_STACK } from "../../videos/group/kit/phone";
import { clamp01, easeOut, hash01 } from "./time";
import type { TypeTreat } from "./skin";

export { FONT_STACK };

// ---------------------------------------------------------------------------------------------------- measuring
const isWide = (c: string) => { const u = c.codePointAt(0) ?? 0; return u >= 0x2e80 || u === 0x00d7 /* × */; };
/** the width of one character in em of the repo's CJK face (Noto Sans SC Bold): full-width characters 1 em, Latin
 *  letters, digits and marks by class (within about 3 %) */
export const charEm = (c: string) =>
  isWide(c) ? 1 : c === " " ? 0.26 : /[0-9]/.test(c) ? 0.59 : /[A-Z]/.test(c) ? (/[MW]/.test(c) ? 0.9 : c === "I" ? 0.34 : /[DGHNOQU]/.test(c) ? 0.75 : 0.65)
    : /[a-z]/.test(c) ? (/[iljt]/.test(c) ? 0.33 : /[mw]/.test(c) ? 0.9 : 0.57) : /[·]/.test(c) ? 0.5 : /[.,'!|:;]/.test(c) ? 0.33 : 0.4;
/** the width of a row in px, without measuring the DOM. `ls` = letter spacing in px. */
export const textW = (s: string, px: number, ls = 0) => { const cs = [...s]; return cs.reduce((w, c) => w + charEm(c), 0) * px + Math.max(0, cs.length - 1) * ls; };
/** the largest size up to `px` at which the row fits in `maxW` */
export const fitPx = (s: string, px: number, maxW: number, ls = 0) => {
  const cs = [...s], em = cs.reduce((w, c) => w + charEm(c), 0);
  return Math.min(px, Math.floor((maxW - Math.max(0, cs.length - 1) * ls) / Math.max(0.01, em)));
};
/** break a row into balanced rows of at most `maxEm` em (at spaces when it has them, else between characters) */
export const wrapRows = (s: string, maxEm: number): string[] => {
  const em = (t: string) => [...t].reduce((w, c) => w + charEm(c), 0);
  if (em(s) <= maxEm) return [s];
  const n = Math.ceil(em(s) / maxEm), target = em(s) / n, units = s.includes(" ") ? s.split(/(?<= )/) : [...s], rows: string[] = [];
  let cur = "";
  for (const u of units) {
    if (cur && rows.length < n - 1 && em(cur + u) > target + em(u) / 2) { rows.push(cur.trimEnd()); cur = u; } else cur += u;
  }
  if (cur) rows.push(cur.trimEnd());
  return rows;
};

// ---------------------------------------------------------------------------------------------------- drawing
/** the cast's own outline colour (the rig's toon ink): the ink line of a glyph when the film gives no other */
export const TOON_INK = "#12111a";
export type GlyphOpts = {
  /** the ink line under the fill: its width in px (0 or none = no line) and its colour */ ink?: number; inkColor?: string;
  /** letter spacing in px */ ls?: number;
  anchor?: "start" | "middle" | "end";
  /** a hard drop under the glyph: its offset in px and its colour (none = no drop) */ drop?: number; dropColor?: string;
  opacity?: number;
};
/** A GLYPH: a character or a word as SVG text, centred on (x, y), the ink line drawn under the fill. `fill` may be a
 *  colour or `url(#aGradient)`. */
export const glyph = (key: string, s: string, x: number, y: number, px: number, fill: string, o: GlyphOpts = {}) => {
  const anchor = o.anchor ?? "middle", ls = o.ls ?? 0, ink = o.ink ?? 0, by = y + px * 0.355;
  const common = { x: x + (anchor === "middle" ? ls / 2 : 0), textAnchor: anchor, fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, letterSpacing: ls, strokeLinejoin: "round" as const };
  const inkColor = o.inkColor ?? TOON_INK;
  return (
    <g key={key} opacity={o.opacity}>
      {o.drop ? <text {...common} y={by + o.drop} fill={o.dropColor ?? "#08080f"} stroke={ink ? o.dropColor ?? "#08080f" : "none"} strokeWidth={ink || undefined} opacity={0.5}>{s}</text> : null}
      <text {...common} y={by} fill={fill} stroke={ink ? inkColor : "none"} strokeWidth={ink || undefined} style={{ paintOrder: "stroke fill" } as React.CSSProperties}>{s}</text>
    </g>
  );
};

/** one character of a hand-set row: its place (x from the row's centre, y its lift), its turn in degrees, its scale */
export type SetChar = { ch: string; i: number; n: number; x: number; y: number; w: number; rot: number; s: number };
/** SET A ROW BY HAND: the characters of `s` on a row centred at x = 0, each a little turned, lifted and scaled the
 *  way the skin's treatment says (deterministic from `seed`). Pass `by` to place them yourself, as a sign painter
 *  would: by.rot / by.lift / by.scale are per-character lists that replace the generated values. */
export const setRow = (s: string, px: number, treat: Pick<TypeTreat, "track" | "hand">, seed = 1, by: { rot?: number[]; lift?: number[]; scale?: number[] } = {}): SetChar[] => {
  const cs = [...s], n = cs.length, ls = treat.track * px, ws = cs.map((c) => charEm(c) * px), total = ws.reduce((a, b) => a + b, 0) + ls * (n - 1), h = treat.hand;
  let x = -total / 2;
  return cs.map((ch, i) => {
    const w = ws[i], cx = x + w / 2;
    x += w + ls;
    return { ch, i, n, w, x: cx, y: by.lift?.[i] ?? h.lift * (2 * hash01(i, seed) - 1), rot: by.rot?.[i] ?? h.rot * (2 * hash01(i, seed + 3) - 1), s: by.scale?.[i] ?? 1 + h.scale * (2 * hash01(i, seed + 7) - 1) };
  });
};
/** TYPING: the part of `s` typed so far at progress k (0..1), and whether the caret still shows */
export const typeOn = (s: string, k: number) => { const cs = [...s], n = Math.round(clamp01(k) * cs.length); return { shown: cs.slice(0, n).join(""), caret: n < cs.length, n }; };

// ---------------------------------------------------------------------------------------------------- numbers
/** COUNTING: the number shown on the way from a to b at progress k (eased out), with `dp` decimals */
export const countAt = (k: number, a: number, b: number, dp = 0) => { const v = a + (b - a) * easeOut(k); return dp ? v.toFixed(dp) : String(Math.round(v)); };
/** AN ODOMETER: for a value that may sit between two whole numbers, each of `width` digit columns (most significant
 *  first): the digit showing, the next one, and how far (0..1) the column has rolled toward it */
export const odometer = (value: number, width: number): { d: number; next: number; roll: number }[] => {
  const v = Math.max(0, value), out: { d: number; next: number; roll: number }[] = [];
  let roll = v % 1, below = 9;                                    // a column rolls only while the one below it passes 9 -> 0
  for (let p = 0; p < width; p++) {
    const d = Math.floor(v / Math.pow(10, p)) % 10;
    roll = below === 9 ? roll : 0;
    out.unshift({ d, next: (d + 1) % 10, roll: clamp01(roll) });
    below = d;
  }
  return out;
};
