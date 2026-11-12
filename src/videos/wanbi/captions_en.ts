// STUB (WP1a): the English captions until scripts/wanbi/en/gen_en.py (WP13) GENERATES this file from the fitted English
// narration. Until then the "English" caption groups are the Chinese ones (same frames, same text), so Film.tsx's
// English branch type-checks and renders, and QUOTE_RAW_EN is empty, so story.ts's QUOTES fall back to the Chinese
// quotes. WP13 keeps the exported names and types: CAPTIONS_EN, captionAtEN, QUOTE_RAW_EN, CaptionEN (72 px, smaller
// when a chunk passes 730 px; line 1 = ONE group in two rows of the fitted English text, `rows` as in captions.ts).
import { CAPTIONS, ROW_PX, type CaptionGroup } from "./captions";
import type { Speaker } from "./voice";

/** an English caption chunk: its own font px and its measured width px (rows: the widest row) */
export type CaptionEN = CaptionGroup & { px: number; w: number };
const han = (s: string) => [...s.replace(/[【】]/g, "")].length;
export const CAPTIONS_EN: CaptionEN[] = CAPTIONS.map((c) => {
  const px = c.rows ? ROW_PX : 72;
  return { ...c, px, w: px * Math.max(...(c.rows ?? [c.text]).map(han)) };
});
/** the English caption shown on frame f, or null */
export const captionAtEN = (f: number): CaptionEN | null => {
  let lo = 0, hi = CAPTIONS_EN.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS_EN[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
for (let i = 1; i < CAPTIONS_EN.length; i++) {
  if (CAPTIONS_EN[i].from <= CAPTIONS_EN[i - 1].to) throw new Error(`English caption groups overlap at ${CAPTIONS_EN[i].text}`);
}
/** a character's own words in the English narration: [line, who, start s, end s, syllables, the words] (empty: the stub) */
export const QUOTE_RAW_EN: [number, Speaker, number, number, number, string][] = [];
