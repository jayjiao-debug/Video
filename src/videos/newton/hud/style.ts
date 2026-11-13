// hud/style.ts: what every overlay of the Newton film shares (WP4): the palette, the text metrics, the life of a timed
// overlay and the HUD's boxes on screen. Pure functions only: no hooks, no state, nothing random.
// Fonts: the repo carries ONE CJK face, Noto Sans SC Bold (FrSans, public/bt/sans700.ttf, weight 700 only; no new font
// files). Everything here is drawn in it: the subtitles (inked, no box), the fact cards (ink on paper, roughened by an
// SVG filter so it reads as printed ink, not a UI font) and the title block (ivory paint on the oak door). "Lighter"
// English = a thinner ink line and a softer fill, since there is no lighter weight of the face.
import { FONT_STACK } from "../../group/kit/overlay";
import { textW, wrapRows } from "../../wanbi/hud/base";
import { SCREEN } from "../layout";

export { FONT_STACK, textW, wrapRows };

/** the palette */
export const HC = {
  /** the subtitles' ink line (a warm near-black, so the edge never reads blue on the warm sets) */
  ink: "#16100c",
  /** speaker tints: 记者 warm white, Newton pale gold, Humphrey white */
  warm: "#fff3e0", goldPale: "#ffdf8e", white: "#ffffff", gold: "#ffc53d",
  /** the fact card: cream paper, its torn rim, fibres, ink */
  paper: "#f6ecd2", paperHi: "#fbf4e2", paperLo: "#eadbb8", paperRim: "#fffaf0", fibre: "#a88e62",
  paperInk: "#1e1712", paperSub: "#5e4b36",
  /** the title block's ivory (paint / gilt on dark oak) */
  ivory: "#f6ead0", ivoryHi: "#fff8e8", ivoryLo: "#e3cfa3", oakShade: "#0d0805",
  /** THE FILM'S DARKEST WARM TONE: the end black and any dip to black (never #000) */
  black: "#140d09",
};

/** a screen box in film px (1080 x 1920) */
export type Rect = { x0: number; y0: number; x1: number; y1: number };
/** the Douyin-safe area for anything that matters: x 50..925 below y 900 (the app's button rail is right of x 930) */
export const SAFE = { left: 50, right: SCREEN.rail.x - 5, railY: SCREEN.rail.y, bottom: SCREEN.bottom, top: SCREEN.top };

/** in / out of a span [a, b] (inclusive): 0 outside, 1 inside, eased linearly over `nin` frames at the start and `nout`
 *  at the end; a span that starts on frame 0 is already in */
export const spanK = (f: number, a: number, b: number, nin: number, nout = nin) =>
  f < a || f > b ? 0 : Math.min(a === 0 ? 1 : Math.min(1, (f - a + 1) / nin), Math.min(1, (b - f + 1) / nout));

/** the width of a string in em of FrSans (CJK and full-width marks 1 em, ASCII its real advance) */
export const em = (s: string) => textW(s, 1, 0);

/** a deterministic 0..1 hash of (i, seed) (the same on every frame and page) */
export const hh = (i: number, seed: number) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** two boxes overlap */
export const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** the box of a w x h box at (x, y) (its top left) turned `deg` about (ox, oy), plus `pad` */
export const turnedRect = (x: number, y: number, w: number, h: number, deg: number, ox: number, oy: number, pad = 0): Rect => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const xs: number[] = [], ys: number[] = [];
  for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
    const dx = px - ox, dy = py - oy;
    xs.push(ox + dx * c - dy * s); ys.push(oy + dx * s + dy * c);
  }
  return { x0: Math.floor(Math.min(...xs) - pad), y0: Math.floor(Math.min(...ys) - pad), x1: Math.ceil(Math.max(...xs) + pad), y1: Math.ceil(Math.max(...ys) + pad) };
};

const BAD_END = /(\d|\b(a|an|the|of|to|or|and|his|her|my|in|on|at|for|with|not|is|I|I'm|you))$/i;
/** English words into rows no wider than `maxW` px at `px` (letter spacing `ls`): the fewest rows, balanced, broken
 *  after a phrase where it can and never after a number or a little word if it can help it */
export const enWrap = (s: string, px: number, maxW: number, ls = 0): string[] => {
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const W = (a: string) => textW(a, px, ls);
  if (W(words.join(" ")) <= maxW) return [words.join(" ")];
  // the fewest rows that fit, then the split of that many rows whose widest row is narrowest (n words is small)
  const n = words.length, out = { rows: null as string[] | null, w: Infinity };
  const cut = (start: number, left: number, acc: string[]) => {
    if (left === 1) {
      const all = [...acc, words.slice(start).join(" ")], w = Math.max(...all.map(W));
      if (w > maxW) return;
      // narrowest widest row, plus: a row that ends a phrase (.,!?:;) is welcome, one that ends on a number or a
      // little word (a, the, or, his ...) is not
      let score = w;
      all.slice(0, -1).forEach((r) => { if (/[.,!?:;—]$/.test(r)) score -= 100; if (BAD_END.test(r)) score += 60; });
      if (score < out.w) { out.w = score; out.rows = all; }
      return;
    }
    for (let i = start + 1; n - i >= left - 1; i++) {
      const r = words.slice(start, i).join(" ");
      if (W(r) > maxW) break;
      cut(i, left - 1, [...acc, r]);
    }
  };
  for (let rows = 2; rows <= Math.min(5, n) && !out.rows; rows++) cut(0, rows, []);
  return out.rows ?? [words.join(" ")];
};
