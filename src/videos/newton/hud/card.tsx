// hud/card.tsx: THE FACT CARDS of the Newton film (PLAN.md sections 5 and 7; WP4). A pure function of the frame.
//   <FactCard f />                the card of story.ts CARDS on frame f (shown only while nobody speaks: the lines file
//                                 times it), in ONE SLOT, MID-LEFT
//   <FactCard f card={{zh, en}} from={a} to={b} />   draw a given card over [a, b] (previews, tests)
// The look: ink on a CREAM PAPER SLIP. The slip is drawn in SVG (no image files): deckled top and sides, a TORN bottom
// edge with a pale fibrous rim, a faint grain and paper fibres (feTurbulence + a few hand-placed fibre strokes, fixed
// seeds), a soft warm drop shadow, tilted -2.2 deg. The words are left-aligned like a note: the Chinese large (46 px,
// shrunk only if its widest row needs it) in ink black, broken into 2-3 rows of at most 12 characters at the best
// punctuation; the English small (28 px, sepia ink) under a faint hand-ruled line. Both inks are roughened a hair by an
// SVG displacement so they read as printed ink on paper, not a UI font (FrSans is the repo's only CJK face).
// Slot: x 56..656, the slip's BOTTOM on y 1195 (so it spans y ~850..1195 at its tallest, ~940..1195 for a short one):
// clear of faces in the upper third (chins included) and of the subtitle band (1250); the slip hugs its words (420-600
// px wide). The mic should keep out of x < 680 between y 830 and 1215 while a card shows (cards come when nobody speaks).
// Motion: flutters in from the left over 8 frames (slides 90 px, swings from -11 deg with a damped wobble, the shadow
// tightens as it lands), floats 1.5 px while it rests, and over its last 8 frames lifts and slides out left.
//   factCardAt(f)   the card on frame f (or null);  factRows(zh)  the Chinese rows;  factLayout(card)  rows, sizes, box
//   factRectAt(f)   the screen box the card takes on frame f (or null);  FACT_SLOT  the most it ever takes
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import { CARDS, clamp01, easeInCubic, easeOutCubic, type Card } from "../story";
import { FONT_STACK, HC, em, enWrap, hh, textW, turnedRect, type Rect } from "./style";

/** the card on frame f (story.ts CARDS), or null */
export const factCardAt = (f: number): Card | null => CARDS.find((c) => f >= c.from && f <= c.to) ?? null;

// ---------------------------------------------------------------------------------------------------- the words
const STRONG = "。！？", MID = "：；", WEAK = "，、", NO_START = "，。！？；：、）》」”’…—", OPEN = "（《「“‘";
const NUMS = "一二三四五六七八九十百千万两0123456789";
/** most characters in a row of a card */
export const CARD_ROW = 12;
/** the Chinese of a card in rows of at most CARD_ROW characters: the fewest, best-placed breaks (after 。！？ best, then
 *  ：； then ，、; never inside a run of numerals, never a row starting with a closing mark); 3 rows win over 2 only when
 *  the 2-row break would cut a phrase */
export const factRows = (s: string): string[] => {
  const cs = [...s.trim()], n = cs.length;
  if (n <= CARD_ROW) return [cs.join("")];
  const brk = (i: number) => {                                       // the cost of a break after character i
    const c = cs[i], nx = cs[i + 1];
    if (NO_START.includes(nx) || OPEN.includes(c)) return Infinity;
    if (NUMS.includes(c) && NUMS.includes(nx)) return Infinity;
    return STRONG.includes(c) ? 0 : MID.includes(c) ? 0.5 : WEAK.includes(c) ? 1 : 6;
  };
  let best: string[] = [], bestCost = Infinity;
  const consider = (cuts: number[]) => {
    const rows: string[] = [];
    let a = 0, cost = 0;
    for (const c of [...cuts, n - 1]) { rows.push(cs.slice(a, c + 1).join("")); a = c + 1; }
    const lens = rows.map((r) => [...r].length);
    if (Math.max(...lens) > CARD_ROW || Math.min(...lens) < 2) return;
    for (const c of cuts) cost += brk(c);
    cost += (rows.length - 2) * 2.5 + (Math.max(...lens) - Math.min(...lens)) / 4;
    if (cost < bestCost) { bestCost = cost; best = rows; }
  };
  for (let i = 0; i < n - 1; i++) {
    consider([i]);
    for (let j = i + 1; j < n - 1; j++) consider([i, j]);
  }
  return best.length ? best : [cs.slice(0, CARD_ROW).join(""), cs.slice(CARD_ROW).join("")];
};

// ---------------------------------------------------------------------------------------------------- the layout
/** the slot (px): left edge, top, the widest slip */
export const CARD_X = 56, CARD_BOTTOM = 1195, CARD_MAXW = 600, CARD_MINW = 420;
/** the slip's top on screen: slips are anchored by their BOTTOM edge (y 1195, above the subtitle band at 1250), so a
 *  short card sits lower, further from the faces (the tallest, 3 + 3 rows, starts at y ~850) */
export const cardTop = (L: { h: number }) => CARD_BOTTOM - L.h;
const PADX = 36, PADT = 30, PADB = 30, ZPX = 46, EPX = 28, ZLS = 1, ELS = 0.2, ZSTEP = 1.3, ESTEP = 1.3, RULE_GAP = 28;
const M = 26;                                                        // the SVG's margin round the slip (shadow, rim)
const TILT = -2.2, NIN = 8, NOUT = 8;
const TRAIL = "，。！？；：、";
/** the visible width (em) of a Chinese row: a trailing full-width mark counts half */
const rowEm = (r: string) => em(r) - (TRAIL.includes([...r].pop() ?? "") ? 0.5 : 0);

export type FactLayout = { w: number; h: number; zRows: string[]; zpx: number; eRows: string[]; ys: { z: number[]; rule: number; e: number[] } };
/** a card laid out: the slip's size, its rows and their baselines (slip px, top left = 0, 0) */
export const factLayout = (c: Pick<Card, "zh" | "en">): FactLayout => {
  const inner = CARD_MAXW - 2 * PADX;
  const zRows = c.zh.trim() ? factRows(c.zh) : [];
  const widest = Math.max(0, ...zRows.map(rowEm));
  const zpx = widest ? Math.min(ZPX, Math.floor((inner - ZLS * CARD_ROW) / widest)) : ZPX;
  const zW = Math.max(0, ...zRows.map((r) => rowEm(r) * zpx + ZLS * ([...r].length - 1)));
  const eRows = c.en.trim() ? enWrap(c.en, EPX, Math.max(inner, 0), ELS) : [];
  const eW = Math.max(0, ...eRows.map((r) => textW(r, EPX, ELS)));
  const w = Math.round(Math.min(CARD_MAXW, Math.max(CARD_MINW, Math.max(zW, eW) + 2 * PADX)));
  // baselines
  const z: number[] = [], e: number[] = [];
  let y = PADT;
  zRows.forEach((_, i) => { z.push(Math.round(y + zpx * 0.86)); y += i < zRows.length - 1 ? zpx * ZSTEP : zpx; });
  const rule = Math.round(y + RULE_GAP / 2);
  y += zRows.length ? RULE_GAP : 0;
  eRows.forEach((_, i) => { e.push(Math.round(y + EPX * 0.84)); y += i < eRows.length - 1 ? EPX * ESTEP : EPX; });
  return { w, h: Math.round(y + PADB), zRows, zpx, eRows, ys: { z, rule, e } };
};
/** the box the card takes at rest (its tilt, shadow and rim included) */
const restRect = (L: FactLayout): Rect => turnedRect(CARD_X, cardTop(L), L.w, L.h, TILT, CARD_X + L.w * 0.3, cardTop(L) + L.h / 2, 14);
/** the most the slot ever takes (the widest, tallest slip at rest) */
export const FACT_SLOT: Rect = (() => {
  const all = CARDS.map((c) => restRect(factLayout(c)));
  const base = restRect({ w: CARD_MAXW, h: 340, zRows: [], zpx: ZPX, eRows: [], ys: { z: [], rule: 0, e: [] } });
  return all.reduce((a, r) => ({ x0: Math.min(a.x0, r.x0), y0: Math.min(a.y0, r.y0), x1: Math.max(a.x1, r.x1), y1: Math.max(a.y1, r.y1) }), base);
})();
/** the screen box the card takes on frame f (at rest; the flutter stays inside it but for its first / last frames) */
export const factRectAt = (f: number): Rect | null => {
  const c = factCardAt(f);
  return c ? restRect(factLayout(c)) : null;
};

// ---------------------------------------------------------------------------------------------------- the paper
/** the slip's outline: deckled top and sides, a torn bottom (amplitude a), at (M, M) size w x h; `grow` px outward */
const paperPath = (w: number, h: number, seed: number, grow: number, torn: number) => {
  const pts: string[] = [];
  const P = (x: number, y: number) => pts.push(`${(M + x).toFixed(1)},${(M + y).toFixed(1)}`);
  const step = 9;
  // top, left to right (fine deckle)
  for (let x = 0, i = 0; x <= w; x += step, i++) P(x, -grow + (hh(i, seed) - 0.5) * 2.6);
  // right, top to bottom
  for (let y = step, i = 0; y < h; y += step, i++) P(w + grow + (hh(i, seed + 3) - 0.5) * 2.6, y);
  // bottom, right to left: TORN (bigger, uneven teeth, a slow wave)
  for (let x = w, i = 0; x >= 0; x -= step * 0.75, i++) {
    const wave = Math.sin((x / w) * Math.PI * 2.2 + seed) * torn * 0.45;
    P(x, h + grow * 1.6 + wave + (hh(i, seed + 7) - 0.5) * torn * 1.3);
  }
  // left, bottom to top
  for (let y = h - step, i = 0; y > 0; y -= step, i++) P(-grow + (hh(i, seed + 9) - 0.5) * 2.6, y);
  return `M${pts.join(" L")} Z`;
};
/** a few paper fibres (thin curved strokes), placed by hash */
const fibres = (w: number, h: number, seed: number) => {
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 22; k++) {
    const x = M + 12 + hh(k, seed) * (w - 24), y = M + 10 + hh(k, seed + 1) * (h - 20);
    const len = 10 + 26 * hh(k, seed + 2), a = (hh(k, seed + 3) - 0.5) * 2.4, bend = (hh(k, seed + 4) - 0.5) * 8;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len, mx = (x + x2) / 2 - Math.sin(a) * bend, my = (y + y2) / 2 + Math.cos(a) * bend;
    out.push(<path key={k} d={`M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`} stroke={HC.fibre} strokeWidth={(0.6 + 0.7 * hh(k, seed + 5)).toFixed(2)} fill="none" opacity={(0.16 + 0.16 * hh(k, seed + 6)).toFixed(2)} strokeLinecap="round" />);
  }
  return out;
};

const ID = "nwfc";
const Slip: React.FC<{ L: FactLayout; seed: number; lift: number }> = ({ L, seed, lift }) => {
  const { w, h } = L, W = w + 2 * M, H = h + 2 * M;
  const outline = paperPath(w, h, seed, 0, 6), rim = paperPath(w, h, seed + 21, 1.6, 8);
  const zText = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: L.zpx, letterSpacing: ZLS } as const;
  const eText = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: EPX, letterSpacing: ELS } as const;
  const lead = (r: string) => (OPEN.includes([...r][0] ?? "") ? -L.zpx / 2 : 0);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: -M, top: -M, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${ID}g`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={HC.paperHi} />
          <stop offset="0.55" stopColor={HC.paper} />
          <stop offset="1" stopColor={HC.paperLo} />
        </linearGradient>
        <radialGradient id={`${ID}v`} cx="0.45" cy="0.42" r="0.75">
          <stop offset="0.6" stopColor="#7a5a30" stopOpacity="0" />
          <stop offset="1" stopColor="#8a6a3a" stopOpacity="0.11" />
        </radialGradient>
        <filter id={`${ID}grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 -1.1 0.62" />
        </filter>
        <filter id={`${ID}fib`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.16" numOctaves={3} seed={11} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.38  0 0 0 0 0.2  0 0 0 -2.2 1.12" />
        </filter>
        <filter id={`${ID}shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={(1 + 2 * lift).toFixed(2)} dy={(7 + 14 * lift).toFixed(2)} stdDeviation={(7 + 7 * lift).toFixed(2)} floodColor="#1c1006" floodOpacity={(0.42 - 0.12 * lift).toFixed(3)} />
        </filter>
        <filter id={`${ID}ink`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.8} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={0.35} />
        </filter>
        <clipPath id={`${ID}clip`}><path d={outline} /></clipPath>
      </defs>
      {/* the slip, its shadow, the torn pale rim under it */}
      <g filter={`url(#${ID}shadow)`}>
        <path d={rim} fill={HC.paperRim} />
        <path d={outline} fill={`url(#${ID}g)`} />
      </g>
      {/* grain, fibres, a warm darkening toward the edges */}
      <g clipPath={`url(#${ID}clip)`}>
        <rect x={M} y={M - 10} width={w} height={h + 20} filter={`url(#${ID}fib)`} opacity={0.16} />
        <rect x={M} y={M - 10} width={w} height={h + 20} filter={`url(#${ID}grain)`} opacity={0.3} />
        {fibres(w, h, seed)}
        <rect x={M} y={M - 10} width={w} height={h + 20} fill={`url(#${ID}v)`} />
      </g>
      {/* the words: ink on paper */}
      <g filter={`url(#${ID}ink)`}>
        {L.zRows.map((r, i) => <text key={`z${i}`} x={M + PADX + lead(r)} y={M + L.ys.z[i]} fill={HC.paperInk} {...zText}>{r}</text>)}
        {L.eRows.length && L.zRows.length ? (
          <path d={`M${M + PADX},${M + L.ys.rule} q${(w * 0.18).toFixed(1)},-1.6 ${Math.min(150, w * 0.32).toFixed(1)},0.4`} stroke={HC.paperSub} strokeWidth={1.6} fill="none" opacity={0.45} strokeLinecap="round" />
        ) : null}
        {L.eRows.map((r, i) => <text key={`e${i}`} x={M + PADX} y={M + L.ys.e[i]} fill={HC.paperSub} {...eText}>{r}</text>)}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- the card
export const FactCard: React.FC<{ f: number; card?: Pick<Card, "zh" | "en">; from?: number; to?: number }> = ({ f, card, from, to }) => {
  useOverlayFont();
  const c = card ? { zh: card.zh, en: card.en, from: from ?? 0, to: to ?? 1e9, n: 0 } : factCardAt(f);
  if (!c || f < c.from || f > c.to) return null;
  const t = f - c.from, left = c.to - f;                            // frames since it came / until it goes
  const kin = easeOutCubic(clamp01((t + 1) / NIN)), inv = 1 - kin;
  const u = easeInCubic(clamp01((NOUT - left) / NOUT));             // the leave: 0 .. ~1 on the last frame
  const wob = 3.2 * Math.sin(t * 1.7) * inv * inv;                   // the damped flutter
  const float = t >= NIN ? 1.5 * Math.sin((2 * Math.PI * (t - NIN)) / 100) : 0;
  const sway = t >= NIN ? 0.22 * Math.sin((2 * Math.PI * (t - NIN)) / 150) : 0;
  const dx = -90 * inv - 120 * u, dy = -28 * inv + 6 * wob - 16 * u + float;
  const rot = TILT - 9 * inv + wob + sway - 7 * u;
  const op = clamp01((t + 1) / 4) * clamp01((left + 1) / 6);
  const lift = Math.max(inv, u);
  const L = factLayout(c);
  const seed = 5 + 13 * ((card ? 0 : (c as Card).n) % 7);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: CARD_X, top: cardTop(L), width: L.w, height: L.h, opacity: op,
        transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`, transformOrigin: "30% 50%" }}>
        <Slip L={L} seed={seed} lift={lift} />
      </div>
    </AbsoluteFill>
  );
};
