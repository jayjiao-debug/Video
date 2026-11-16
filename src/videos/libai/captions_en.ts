// STUB (WP1): the English captions until the English pass GENERATES this file from the fitted English dialogue. Until
// then the "English" caption groups are the Chinese ones (same frames, same text), so the HUD's English branch
// type-checks and renders, and QUOTE_RAW_EN is empty, so story.ts's QUOTES fall back to the Chinese quotes. The English
// pass keeps the exported names and types: CAPTIONS_EN, captionAtEN, QUOTE_RAW_EN, CaptionEN (px = its own type size,
// w = its measured width in px).
import { CAPTIONS, type CaptionGroup } from "./captions";
import type { Speaker } from "./voice";

/** an English caption chunk: its own font px and its measured width px */
export type CaptionEN = CaptionGroup & { px: number; w: number };
const han = (s: string) => [...s.replace(/[【】]/g, "")].length;
export const CAPTIONS_EN: CaptionEN[] = CAPTIONS.map((c) => {
  const px = han(c.text) > 12 ? 64 : 72;
  return { ...c, px, w: px * han(c.text) };
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
/** a speaker's own words in the English dialogue: [line, who, start s, end s, syllables, the words] (empty: the stub) */
export const QUOTE_RAW_EN: [number, Speaker, number, number, number, string][] = [];
