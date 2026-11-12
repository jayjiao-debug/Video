// STUB of the English captions (the English narration does not exist yet). The engine already asks it, so the English
// version can be added later without touching Film.tsx, story.ts or any shot: a generator (as scripts/arthur/en/
// gen_en.py) then rewrites this file with the real CAPTIONS_EN / QUOTE_RAW_EN.
// With lang: "en" today: no captions are drawn and QUOTES falls back to the Chinese timing (story.ts).
import type { CaptionGroup } from "./captions";
import type { Speaker } from "./voice";

/** an English caption group: its own font px and its measured width px */
export type CaptionEN = CaptionGroup & { px: number; w: number };
export const CAPTIONS_EN: CaptionEN[] = [];
/** the English caption shown on frame f, or null */
export const captionAtEN = (f: number): CaptionEN | null => {
  for (const c of CAPTIONS_EN) if (f >= c.from && f <= c.to) return c;
  return null;
};
/** a character's own words in the English narration: [line, who, start s, end s, syllables, the words] */
export const QUOTE_RAW_EN: [number, Speaker, number, number, number, string][] = [];
