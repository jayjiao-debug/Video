// hud/ms/marks.tsx: THE MARKS OF SKIN A 「手稿」 (stage 1 of 3), on top of the kit's (src/kit/overlay/marks.tsx). Ported
// from the art director's generator (looks/src/skin_a.py, common.py, nib.py), so a piece built from these draws what
// the approved frames drew (looks/frames/A_*.png). Plain functions that return SVG; deterministic (fixed seeds, the
// kit's hash01, no Math.random); no colour of their own beyond the skin's (hud/ms/skin.ts). The title, the cards and
// the effects (hud/ms/title.tsx, card.tsx, fx.tsx) put them together.
//
// IDS: every filter, mask, pattern and gradient id starts with the piece's PREFIX, which itself starts "newton-ms-"
// (e.g. "newton-ms-title"): msDefs(p) defines the shared ones under it, and every mark that uses them takes p.
//
//   <defs>                                                       what it defines (id)
//     msDefs(p)                                                  the paper, the ink, the wax (list below)
//     nibFilter(id, fill, edge, S, seed?, bleed?)                THE NIB for the display hand at size S: `id` (the
//                                                                stroke) and `${id}c` (the pools' wet cores)
//     sinkFilter(id, k, seed?)                                   THE EXIT at progress k: the ink goes sepia, then the
//                                                                paper takes it patchily (k = 1: gone)
//   </defs>
//   msDefs(p) ids: ${p}-inkA / -inkR / -inkS (iron-gall, crimson, sepia: the body hand, ink_filter), -inkAsm / -inkRsm
//     (the same for small words), -torn / -torn2 / -wob (torn and wobbled edges), -sh / -shs (a leaf's contact shadow,
//     large / small), -laid (the laid pattern: chain lines every 104 px), -grain, -fox (fibres and foxing), -wax (the wax
//     gradient), -emboss (letters pressed into wax)
//
//   THE DISPLAY HAND (the quill)
//     quillLayout(text, S, o)                                    where each character sits (for boxes and anchors)
//     quill(key, text, x, y, S, nibId, o)                        a word written with the nib: one glyph outline per
//                                                                character (glyphs.ts QUILL), turned and lifted by hand,
//                                                                an ink pool at every free stroke end; o.write = THE
//                                                                WRITE-ON (stroke by stroke, in writing order, the pools
//                                                                swelling as each stroke stops)
//     quillOutline(key, text, x, y, S, color, sw, o)             the same placement as a fat outline: the paper scrap cut
//                                                                round a 花字 (wrap it in -shs and -torn2)
//   THE BODY HAND
//     inkText(key, s, x, y, px, filterId, o)                     FrSans as SVG text through an ink filter; o.write = a
//                                                                nib-slanted wipe along the row, o.per frames a character
//     serifText(key, s, x, y, px, o)                             numerals and A B C in the skin's italic outlines
//                                                                (glyphs.ts SERIF): 0/1, 1/1, 2%
//   PAPER, WAX, MARKS
//     leaf(p, key, x, y, w, h, rot, o, children)                 a leaf of laid paper: torn edge, chain lines, fibres,
//                                                                foxing, its contact shadow; children drawn on it
//     waxSeal(p, key, cx, cy, r, rot, rows, o)                   the crimson wax seal with the epithet pressed in
//     swash(key, x0, y0, x1, y1, sag, th, filterUrl, o)          a tapering quill swash ending in a blot
//     xMark(key, x, y, s, filterUrl, k?)                         the crimson cross (k: the two strokes written on)
//     manicule(p, key, x, y, s, rot, o)                          the margin's pointing hand, crimson (Humphrey's banner)
//     ellipseArc(...) / ellipsePt(...)                           compass curves (the orbit, the construction)
//   MOTION
//     writeK(t, at, n)                                           a part's write-on progress 0..1 (kit part())
//     drawOn(len, k)                                             strokeDasharray / strokeDashoffset of a path drawn on
//     sinkK(t, from, n?)                                         the exit's progress (MOTION.sink frames)
//
// THE CUT RULE (scripts/kit/cut deps.mjs): the cut lays the overlay pass over the picture as a separate PNG, so nothing
// here (or in a piece) may read the picture under it: no blend modes, no backdrop filters, no background image. Every
// mark draws its own pixels.
import React from "react";
import { FONT_STACK, clamp01, easeOut, hash01, part, roughFilter } from "../../../../kit/overlay";
import { QUILL, SERIF, GLYPH_SIZE, type QuillGlyph } from "./glyphs";
import { MS, NIB, HAND, PAPER, MOTION } from "./skin";

// ---------------------------------------------------------------------------------------------------- motion helpers
/** a part's write-on progress 0..1: it starts `at` frames into the piece's life and takes `n` frames (kit part()) */
export const writeK = (t: number, at: number, n: number) => part(t, at, n);
/** a path of length `len` drawn on to progress k: spread onto the path element */
export const drawOn = (len: number, k: number) => ({ strokeDasharray: `${len.toFixed(1)} ${(len + 2).toFixed(1)}`, strokeDashoffset: (len * (1 - clamp01(k))).toFixed(1) });
/** the exit's progress 0..1 from frame `from` of the piece's life over n frames (MOTION.sink) */
export const sinkK = (t: number, from: number, n: number = MOTION.sink) => clamp01((t - from) / Math.max(1, n));
const n1 = (v: number) => v.toFixed(1);
const n2 = (v: number) => v.toFixed(2);

// ---------------------------------------------------------------------------------------------------- <defs>
/** THE BODY HAND'S INK (skin_a.py ink_filter): the shape's horizontals eroded a little (a quill's thin stroke), the edge
 *  roughened, a faint bleed; the shape is drawn black and the filter floods it with `color` */
export const inkFilter = (id: string, color: string, o: { erode?: string; disp?: number; seed?: number; halo?: number; blur?: number } = {}) => (
  <filter key={id} id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
    <feMorphology in="SourceAlpha" operator="erode" radius={o.erode ?? "0.1 0.9"} result="thin" />
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={2} seed={o.seed ?? 5} result="n" />
    <feDisplacementMap in="thin" in2="n" scale={o.disp ?? 3} xChannelSelector="R" yChannelSelector="G" result="r" />
    <feGaussianBlur in="r" stdDeviation={o.blur ?? 2.2} result="h" />
    <feComponentTransfer in="h" result="h2"><feFuncA type="linear" slope={o.halo ?? 0.32} /></feComponentTransfer>
    <feMerge result="m"><feMergeNode in="h2" /><feMergeNode in="r" /></feMerge>
    <feFlood floodColor={color} />
    <feComposite in2="m" operator="in" />
  </filter>
);
/** a leaf's contact shadow (skin_a.py shadow_filter) */
const shadowFilter = (id: string, dx: number, dy: number, sd: number, op: number) => (
  <filter key={id} id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx={dx} dy={dy} stdDeviation={sd} floodColor={MS.shadow} floodOpacity={op} />
  </filter>
);
/** THE SHARED DEFS of a piece, under prefix p (ids listed in the header). Put once in the piece's <defs>. */
export const msDefs = (p: string): React.ReactNode[] => [
  inkFilter(`${p}-inkA`, MS.ink, { erode: "0.1 0.9", disp: 3 }),
  inkFilter(`${p}-inkR`, MS.crimson, { erode: "0.1 0.9", disp: 3, seed: 8 }),
  inkFilter(`${p}-inkS`, MS.sepia, { erode: "0 0.5", disp: 2.5, halo: 0.2 }),
  inkFilter(`${p}-inkAsm`, MS.ink, { erode: "0 0.45", disp: 1.8, halo: 0.18, blur: 1.2 }),
  inkFilter(`${p}-inkRsm`, MS.crimson, { erode: "0 0.45", disp: 1.8, halo: 0.18, blur: 1.2, seed: 9 }),
  roughFilter(`${p}-torn`, { fx: 0.035, fy: 0.035, scale: 18, seed: 11 }, 4),
  roughFilter(`${p}-torn2`, { fx: 0.05, fy: 0.05, scale: 12, seed: 4 }, 4),
  roughFilter(`${p}-wob`, { fx: 0.02, fy: 0.02, scale: 6, seed: 3 }, 4),
  shadowFilter(`${p}-sh`, 5, 9, 7, 0.65),
  shadowFilter(`${p}-shs`, 3, 5, 4, 0.55),
  <filter key={`${p}-grain`} id={`${p}-grain`} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves={2} seed={2} />
    <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.30  0 0 0 0 0.16  0 0 0 0.45 -0.18" />
  </filter>,
  <filter key={`${p}-fox`} id={`${p}-fox`} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={21} />
    <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.9 -0.42" />
  </filter>,
  <pattern key={`${p}-laid`} id={`${p}-laid`} width={PAPER.chain} height={PAPER.laidStep} patternUnits="userSpaceOnUse">
    <rect x={PAPER.chain / 2 - 2} y={0} width={5} height={PAPER.laidStep} fill={MS.chain} opacity={0.045} />
    <line x1={PAPER.chain / 2 + 0.5} y1={0} x2={PAPER.chain / 2 + 0.5} y2={PAPER.laidStep} stroke={MS.laid} strokeWidth={1.1} opacity={PAPER.chainOp} />
    <line x1={0} y1={PAPER.laidStep / 2} x2={PAPER.chain} y2={PAPER.laidStep / 2} stroke={MS.laid} strokeWidth={0.5} opacity={PAPER.laidOp} />
  </pattern>,
  <radialGradient key={`${p}-wax`} id={`${p}-wax`} cx="0.42" cy="0.38" r="0.7">
    <stop offset="0" stopColor={MS.wax[0]} /><stop offset="0.6" stopColor={MS.wax[1]} /><stop offset="1" stopColor={MS.wax[2]} />
  </radialGradient>,
  <filter key={`${p}-emboss`} id={`${p}-emboss`} x="-10%" y="-10%" width="120%" height="120%">
    <feOffset in="SourceAlpha" dx={-2} dy={-2} result="up" />
    <feOffset in="SourceAlpha" dx={2} dy={2} result="dn" />
    <feFlood floodColor="#3a0410" floodOpacity={0.95} /><feComposite in2="up" operator="in" result="d" />
    <feFlood floodColor="#ff9aa6" floodOpacity={0.55} /><feComposite in2="dn" operator="in" result="l" />
    <feMerge><feMergeNode in="d" /><feMergeNode in="l" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>,
];

/** THE NIB (skin_a.py nib_filter) for the display hand at about size S: the downstrokes widened (a flat nib pulled down
 *  lays its full width), the horizontals thinned to about half, a slight hand wobble and a fine ragged edge, ink density
 *  that varies, a darker iron-gall rim (`edge`), a faint bleed. Two filters: `id` for the strokes (draw them black) and
 *  `${id}c` for the pools' wet cores (draw them in their colour). */
export const nibFilter = (id: string, fill: string, edge: string, S: number, seed = 5, bleed = 0.22): React.ReactNode[] => {
  const dx = NIB.dx * S, ey = NIB.ey * S, lo = 2.6 / S, ring = Math.max(1.3, 0.012 * S);
  return [
    <filter key={id} id={id} x="-15%" y="-30%" width="130%" height="160%" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius={`${n2(dx)} 0`} result="wide" />
      <feMorphology in="wide" operator="erode" radius={`0.01 ${n2(ey)}`} result="thin" />
      <feTurbulence type="fractalNoise" baseFrequency={lo.toFixed(4)} numOctaves={2} seed={seed} result="lo" />
      <feDisplacementMap in="thin" in2="lo" scale={n1(0.007 * S)} xChannelSelector="R" yChannelSelector="G" result="w" />
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={2} seed={seed + 3} result="hi" />
      <feDisplacementMap in="w" in2="hi" scale={n1(Math.max(1.6, 0.01 * S))} xChannelSelector="R" yChannelSelector="G" result="shape" />
      <feMorphology in="shape" operator="erode" radius={n1(ring)} result="inner" />
      <feComposite in="shape" in2="inner" operator="out" result="rim" />
      <feTurbulence type="fractalNoise" baseFrequency={(4 / S).toFixed(4)} numOctaves={3} seed={seed + 7} result="dens" />
      <feColorMatrix in="dens" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.5 1.18" result="densA" />
      <feFlood floodColor={fill} /><feComposite in2="shape" operator="in" result="f0" />
      <feComposite in="f0" in2="densA" operator="in" result="f1" />
      <feFlood floodColor={edge} floodOpacity={0.9} /><feComposite in2="rim" operator="in" result="e" />
      <feGaussianBlur in="shape" stdDeviation={n1(Math.max(1, 0.01 * S))} result="bl" />
      <feComponentTransfer in="bl" result="halo"><feFuncA type="linear" slope={bleed} /></feComponentTransfer>
      <feFlood floodColor={fill} /><feComposite in2="halo" operator="in" result="h" />
      <feMerge><feMergeNode in="h" /><feMergeNode in="f1" /><feMergeNode in="e" /></feMerge>
    </filter>,
    <filter key={`${id}c`} id={`${id}c`} x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves={2} seed={seed + 11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={n1(Math.max(2, 0.016 * S))} xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation={n1(Math.max(0.8, 0.006 * S))} />
    </filter>,
  ];
};

/** THE EXIT, "sinks into the paper", at progress k (0..1, a new filter each frame: give it the frame's k): over the
 *  first half the ink turns sepia (iron-gall fading to brown), over the second the paper takes it in patches (a noise
 *  threshold rising through it) and it softens. Wrap the piece (or only its ink) in it; at k = 0 it changes nothing. */
export const sinkFilter = (id: string, k: number, seed = 13) => {
  const a = clamp01(k * 2), b = clamp01(k * 2 - 1);
  // a matrix from identity (a = 0) to sepia toned toward MS.sepia (a = 1), alpha kept
  const s = [0.2 + 0.25 * 0.54, 0.4 * 0.54, 0.08 * 0.54, 0.2 * 0.45, 0.4 * 0.45, 0.08 * 0.45, 0.2 * 0.31, 0.4 * 0.31, 0.08 * 0.31];
  const off = [0.36, 0.3, 0.2];
  const m = (i: number, j: number) => (i === j ? 1 : 0) * (1 - a) + s[i * 3 + j] * a;
  const vals = `${n2(m(0, 0))} ${n2(m(0, 1))} ${n2(m(0, 2))} 0 ${n2(off[0] * a)}  ${n2(m(1, 0))} ${n2(m(1, 1))} ${n2(m(1, 2))} 0 ${n2(off[1] * a)}  ${n2(m(2, 0))} ${n2(m(2, 1))} ${n2(m(2, 2))} 0 ${n2(off[2] * a)}  0 0 0 1 0`;
  // the patches: alpha x clamp(4 * noise + 1.4 - 6 b): 1 everywhere at b = 0, nothing at b = 1
  return (
    <filter key={id} id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values={vals} result="c" />
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={seed} result="n" />
      <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 ${n2(1.4 - 6 * b)}`} result="m" />
      <feComposite in="c" in2="m" operator="in" result="p" />
      <feGaussianBlur in="p" stdDeviation={n2(1.6 * b)} />
    </filter>
  );
};

// ---------------------------------------------------------------------------------------------------- the display hand
export type QuillOpts = {
  /** per character, cycled: turn (deg), lift (px), scale (default HAND) */
  rots?: readonly number[]; lifts?: readonly number[]; scales?: readonly number[];
  /** extra space between characters (px) */ track?: number;
  anchor?: "start" | "middle" | "end";
  /** varies the pools' sizes (skin_a.py quill seed) */ seed?: number;
  /** the wet cores' colour (default MS.edgeCrimson) and opacity */ core?: string; coreOp?: number;
  /** THE WRITE-ON: the piece's local frame t, the frame the first character starts (at), frames a character (per,
   *  default MOTION.char), frames a pool takes to swell after its stroke stops (pool, default MOTION.pool). Leave it out
   *  for a word fully written. Strokes of a character run in writing order (glyphs.ts), each taking a share of the
   *  character's frames by its length; a character that is done is shown whole. */
  write?: { t: number; at?: number; per?: number; pool?: number };
};
export type QuillChar = { ch: string; i: number; dot: boolean; x: number; S: number; adv: number; rot: number; lift: number; g: QuillGlyph | null };
/** where each character of a quill word sits: x = its pen position from the word's start, S its size, its turn and
 *  lift; x0 = where the word starts for (x, anchor); width = the whole word */
export const quillLayout = (text: string, S: number, o: QuillOpts = {}, x = 0) => {
  const rots = o.rots ?? HAND.rots, lifts = o.lifts ?? HAND.lifts, scales = o.scales ?? HAND.scales, track = o.track ?? 0;
  const chars: QuillChar[] = [];
  let cx = 0;
  [...text].forEach((ch, i) => {
    const Sd = S * scales[i % scales.length];
    if (ch === "·" || ch === "・") { chars.push({ ch, i, dot: true, x: cx, S: Sd, adv: 0.5 * S, rot: 0, lift: 0, g: null }); cx += 0.5 * S + track; return; }
    const g = QUILL[ch];
    if (!g) throw new Error(`quill: 「${ch}」 is not baked (add it to QUILL_CHARS in /home/user/newton_work/film/skinA/bake_glyphs.py and run it)`);
    const adv = (g.a * Sd) / GLYPH_SIZE;
    chars.push({ ch, i, dot: false, x: cx, S: Sd, adv, rot: rots[i % rots.length], lift: lifts[i % lifts.length], g });
    cx += adv + track;
  });
  const width = cx - (chars.length ? track : 0), anchor = o.anchor ?? "start";
  const x0 = x - (anchor === "end" ? width : anchor === "middle" ? width / 2 : 0);
  return { chars, width, x0 };
};
/** a stroke's length (s = [hw, x0, y0, x1, y1, ...]: its points from index 1) */
const strokeLen = (s: number[]) => { let L = 0; for (let j = 3; j + 1 < s.length; j += 2) L += Math.hypot(s[j] - s[j - 2], s[j + 1] - s[j - 1]); return L; };
/** each stroke's [start, end] as a share of its character's write (by length) */
const strokeShares = (g: QuillGlyph) => {
  const L = g.s.map(strokeLen), tot = L.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return L.map((l) => { const a = acc / tot; acc += l; return [a, acc / tot] as [number, number]; });
};
const pt = (s: number[], k: number, sc: number) => `${n1(s[k] * sc)},${n1(s[k + 1] * sc)}`;
/** A WORD WRITTEN WITH THE QUILL (skin_a.py quill()): returns the strokes group (through nibId) and the wet cores
 *  (through `${nibId}c`). nibId = a nibFilter made at about this size S with the word's colour (crimson for a rubric,
 *  iron-gall for the rest). */
export const quill = (key: string, text: string, x: number, y: number, S: number, nibId: string, o: QuillOpts = {}): React.ReactNode => {
  const { chars, x0 } = quillLayout(text, S, o, x);
  const dx_ = NIB.dx * S, ey_ = NIB.ey * S, seed = o.seed ?? 1, W = o.write;
  const per = W?.per ?? MOTION.char, poolN = W?.pool ?? MOTION.pool, at = W?.at ?? 0;
  const body: React.ReactNode[] = [], cores: React.ReactNode[] = [], masks: React.ReactNode[] = [];
  chars.forEach((c, ci) => {
    // this character's write progress (1 = whole, no mask)
    const k = W ? clamp01((W.t - at - ci * per) / per) : 1;
    const tk = (share: number) => at + ci * per + share * per;                   // the frame a share of it is reached
    if (k <= 0) return;
    if (c.dot) {
      body.push(<ellipse key={`${key}-d${ci}`} cx={n1(x0 + c.x + 0.25 * S)} cy={n1(y - 0.36 * c.S)} rx={n1(0.07 * c.S)} ry={n1(0.07 * c.S + ey_)} />);
      return;
    }
    const g = c.g!, sc = c.S / GLYPH_SIZE;
    const tr = `translate(${n1(x0 + c.x)} ${n1(y + c.lift)}) rotate(${c.rot} ${n1(c.adv / 2)} ${n1(-0.38 * c.S)})`;
    const shares = strokeShares(g);
    const blobs: React.ReactNode[] = [], cc: React.ReactNode[] = [];
    g.p.forEach(([ex0, ey0, hw0, ddx, ddy, si, end], pk) => {
      const ex = ex0 * sc, ey = ey0 * sc, hw = hw0 * sc;
      // the pool swells poolN frames after its stroke stops (a start pool: as the nib lands)
      const sh = si >= 0 && shares[si] ? shares[si][end ? 1 : 0] : 1;
      const sw = W ? clamp01((W.t - tk(sh)) / Math.max(1, poolN)) : 1;
      if (sw <= 0) return;
      const j = 1 + 0.18 * (2 * hash01(pk + 7 * seed, c.ch.codePointAt(0)! % 13) - 1);
      const horiz = Math.abs(ddx) > Math.abs(ddy);
      const hAfter = horiz ? hw - ey_ : hw + dx_;
      const across = hAfter * (horiz ? 1.16 : 1.08) * j * (0.55 + 0.45 * easeOut(sw)), along = across * 1.25;
      const bx = ex - ddx * along * 0.78, by = ey - ddy * along * 0.78, ang = (Math.atan2(ddy, ddx) * 180) / Math.PI;
      blobs.push(<ellipse key={pk} transform={`rotate(${ang.toFixed(0)} ${n1(bx)} ${n1(by)})`} cx={n1(bx)} cy={n1(by)}
        rx={n1(Math.max(1, along - (horiz ? dx_ : -ey_)))} ry={n1(Math.max(1, across - (horiz ? -ey_ : dx_)))} />);
      const qx = bx + ddx * along * 0.45, qy = by + ddy * along * 0.45;
      cc.push(<ellipse key={pk} transform={`rotate(${ang.toFixed(0)} ${n1(qx)} ${n1(qy)})`} cx={n1(qx)} cy={n1(qy)} rx={n1(along * 0.42)} ry={n1(across * 0.62)} opacity={n2(sw)} />);
    });
    let maskId: string | undefined;
    if (k < 1) {
      // THE WRITE-ON MASK: the strokes so far, each a fat line along its skeleton, drawn on in writing order (the nib
      // filter widens the masked shape afterwards, so the line only needs the outline's own half width plus a margin)
      maskId = `${key}-w${ci}`;
      const lines: React.ReactNode[] = [];
      g.s.forEach((s, si) => {
        const [a, b] = shares[si], sk = clamp01((k - a) / Math.max(1e-6, b - a));
        if (sk <= 0) return;
        const d = "M" + Array.from({ length: (s.length - 1) / 2 }, (_, q) => pt(s, 1 + 2 * q, sc)).join(" L");
        const len = strokeLen(s) * sc;
        lines.push(<path key={si} d={d} fill="none" stroke="#fff" strokeWidth={n1(2 * s[0] * sc * 1.3 + 3)} strokeLinecap="round" strokeLinejoin="round" {...drawOn(len, sk)} />);
      });
      masks.push(
        <mask key={maskId} id={maskId} maskUnits="userSpaceOnUse" x={n1(-0.5 * c.S)} y={n1(-1.5 * c.S)} width={n1(2.5 * c.S)} height={n1(2.5 * c.S)}>
          {lines}
        </mask>,
      );
    }
    // the pools sit outside the mask: each shows only once its stroke has reached it
    body.push(<g key={`${key}-c${ci}`} transform={tr}><g mask={maskId ? `url(#${maskId})` : undefined}><path d={g.d} transform={`scale(${sc.toFixed(4)})`} /></g>{blobs}</g>);
    cores.push(<g key={`${key}-k${ci}`} transform={tr}>{cc}</g>);
  });
  return (
    <g key={key}>
      {masks.length ? <defs>{masks}</defs> : null}
      <g filter={`url(#${nibId})`} fill="#000">{body}</g>
      <g filter={`url(#${nibId}c)`} fill={o.core ?? MS.edgeCrimson} opacity={o.coreOp ?? 0.42}>{cores}</g>
    </g>
  );
};
/** the same placement as a fat outline in `color` (skin_a.py quill_outline): a scrap of paper cut round the word so a
 *  crimson word reads on dark wood. Wrap it in <g filter=-shs><g filter=-torn2>. */
export const quillOutline = (key: string, text: string, x: number, y: number, S: number, color: string, sw: number, o: QuillOpts = {}) => {
  const { chars, x0 } = quillLayout(text, S, o, x);
  return (
    <g key={key}>
      {chars.filter((c) => !c.dot).map((c) => (
        <path key={c.i} transform={`translate(${n1(x0 + c.x)} ${n1(y + c.lift)}) rotate(${c.rot} ${n1(c.adv / 2)} ${n1(-0.38 * c.S)}) scale(${(c.S / GLYPH_SIZE).toFixed(4)})`}
          d={c.g!.d} fill={color} stroke={color} strokeWidth={n1(sw / (c.S / GLYPH_SIZE))} strokeLinejoin="round" />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- the body hand
/** BODY HAND: FrSans as SVG text through an ink filter (filterId: `${p}-inkA` and the like; the text is drawn black and
 *  the filter colours it). o.write = { t, at?, per? }: the row is uncovered left to right by a nib-slanted front, `per`
 *  frames a character (default MOTION.rowChar). o.w = the row's width if known (default: measured by charEm). */
export const inkText = (key: string, s: string, x: number, y: number, px: number, filterId: string, o: {
  anchor?: "start" | "middle" | "end"; ls?: number; rot?: number; opacity?: number; w?: number; write?: { t: number; at?: number; per?: number };
} = {}) => {
  const anchor = o.anchor ?? "start", ls = o.ls ?? 0;
  const w = o.w ?? textWidth(s, px, ls), xs = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  let clip: React.ReactNode = null, clipId: string | undefined;
  if (o.write) {
    const n = [...s].length, per = o.write.per ?? MOTION.rowChar, k = clamp01((o.write.t - (o.write.at ?? 0)) / Math.max(1, n * per));
    if (k <= 0) return null;
    if (k < 1) {
      clipId = `${key}-wr`;
      const lean = px * 0.35, xf = xs - lean + (w + 2 * lean) * k, y0 = y - px * 1.05, y1 = y + px * 0.35;
      clip = <clipPath id={clipId}><path d={`M${n1(xs - px)},${n1(y0)} L${n1(xf + lean)},${n1(y0)} L${n1(xf - lean)},${n1(y1)} L${n1(xs - px)},${n1(y1)} Z`} /></clipPath>;
    }
  }
  const tr = o.rot ? `rotate(${o.rot} ${n1(x)} ${n1(y)})` : undefined;
  return (
    <g key={key} opacity={o.opacity}>
      {clip ? <defs>{clip}</defs> : null}
      <g clipPath={clipId ? `url(#${clipId})` : undefined}>
        <text x={n1(x)} y={n1(y)} transform={tr} textAnchor={anchor} fontFamily={FONT_STACK} fontWeight={700} fontSize={px} letterSpacing={ls} fill="#000" filter={`url(#${filterId})`}>{s}</text>
      </g>
    </g>
  );
};
/** the width of a body row (FrSans; kit charEm classes), px (card.tsx msCardWords measures its rows with it) */
export const textWidth = (s: string, px: number, ls: number) => {
  const em = (c: string) => { const u = c.codePointAt(0) ?? 0; return u >= 0x2e80 ? 1 : c === " " ? 0.26 : /[0-9]/.test(c) ? 0.59 : c === "·" ? 0.5 : /[A-Z]/.test(c) ? 0.68 : 0.55; };
  const cs = [...s];
  return cs.reduce((a, c) => a + em(c), 0) * px + Math.max(0, cs.length - 1) * ls;
};
/** THE ITALIC LETTERS (glyphs.ts SERIF: 0-9 / % . A B C Q E D, FrSans written again with a slanted flat nib), baseline
 *  at y; drawn black for an ink filter unless o.fill; o.filter = a filter id (`${p}-inkA`); returns null for an empty
 *  string */
export const serifText = (key: string, s: string, x: number, y: number, px: number, o: { anchor?: "start" | "middle" | "end"; fill?: string; filter?: string; track?: number; opacity?: number } = {}) => {
  const sc = px / GLYPH_SIZE, track = o.track ?? 0;
  const cs = [...s].map((ch) => { const g = SERIF[ch]; if (!g) throw new Error(`serifText: 「${ch}」 is not baked (bake_glyphs.py SERIF_CHARS)`); return g; });
  if (!cs.length) return null;
  const w = cs.reduce((a, g) => a + g.a * sc, 0) + track * (cs.length - 1);
  let cx = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  return (
    <g key={key} fill={o.fill ?? "#000"} filter={o.filter ? `url(#${o.filter})` : undefined} opacity={o.opacity}>
      {cs.map((g, i) => { const e = <path key={i} d={g.d} transform={`translate(${n1(cx)} ${n1(y)}) scale(${sc.toFixed(4)})`} />; cx += g.a * sc + track; return e; })}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- paper, wax, marks
/** A LEAF OF LAID PAPER (skin_a.py paper()): its torn edge (the -torn / -torn2 filter on a mask), the chain lines about
 *  100 px apart and laid lines nearly invisible (-laid), fibres (-grain), foxing (-fox, optional), a darker edge tone,
 *  a contact shadow (-sh / -shs); turned `rot` degrees about its centre. children are drawn on it, in its turned frame. */
export const leaf = (p: string, key: string, x: number, y: number, w: number, h: number, rot: number, o: {
  fill?: string; small?: boolean; fox?: boolean; opacity?: number; transform?: string;
} = {}, children?: React.ReactNode) => {
  const cx = x + w / 2, cy = y + h / 2, torn = o.small ? `${p}-torn2` : `${p}-torn`, sh = o.small ? `${p}-shs` : `${p}-sh`, mid = `${key}-m`;
  const R = { x, y, width: w, height: h };
  return (
    <g key={key} opacity={o.opacity} transform={o.transform}>
      <g transform={`rotate(${rot} ${n1(cx)} ${n1(cy)})`}>
        <defs><mask id={mid}><rect {...R} fill="#fff" filter={`url(#${torn})`} /></mask></defs>
        <g filter={`url(#${sh})`}><rect {...R} fill={o.fill ?? MS.paper} filter={`url(#${torn})`} /></g>
        <g mask={`url(#${mid})`}>
          <rect {...R} fill={`url(#${p}-laid)`} />
          <rect {...R} filter={`url(#${p}-grain)`} opacity={PAPER.grainOp} />
          {o.fox !== false ? <rect {...R} filter={`url(#${p}-fox)`} opacity={PAPER.foxOp} /> : null}
          <rect {...R} fill="none" stroke={MS.paperEdge} strokeWidth={10} opacity={PAPER.edgeOp} />
        </g>
        {children}
      </g>
    </g>
  );
};
/** THE CRIMSON WAX SEAL (skin_a.py wax_seal): a drip, a pressed ring, rows of characters embossed (the epithet, one row
 *  each: ["冷面", "学神"]), a highlight. k (0..1) = the press: the wax lands round and wide and settles (a 2-frame squash:
 *  pass the kit's slap() / its own curve as o.squash) */
export const waxSeal = (p: string, key: string, cx: number, cy: number, r: number, rot: number, rows: string[], o: { squash?: number; opacity?: number } = {}) => {
  const sq = o.squash ?? 1, sy = 1 / Math.max(0.5, sq);
  const lp = r * 0.5, y0 = cy - r * 0.06 - ((rows.length - 2) * r * 0.53) / 2;
  return (
    <g key={key} opacity={o.opacity} transform={`translate(${n1(cx)} ${n1(cy)}) scale(${n2(sq)} ${n2(sy)}) translate(${n1(-cx)} ${n1(-cy)})`}>
      <g transform={`rotate(${rot} ${n1(cx)} ${n1(cy)})`} filter={`url(#${p}-shs)`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${p}-wax)`} filter={`url(#${p}-torn2)`} />
        <ellipse cx={n1(cx + r * 0.15)} cy={n1(cy + r * 0.95)} rx={n1(r * 0.22)} ry={n1(r * 0.16)} fill="#8a1022" filter={`url(#${p}-torn2)`} />
        <circle cx={cx} cy={cy} r={n1(r * 0.76)} fill={MS.waxBody} stroke={MS.waxRim} strokeWidth={5} />
        <circle cx={cx} cy={cy} r={n1(r * 0.69)} fill="none" stroke="#c4374a" strokeWidth={2} opacity={0.7} />
        <g filter={`url(#${p}-emboss)`}>
          {rows.map((row, i) => (
            <text key={i} x={n1(cx)} y={n1(y0 + i * r * 0.53)} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={n1(lp)} letterSpacing={2} fill={MS.waxLetters}>{row}</text>
          ))}
        </g>
        <ellipse cx={n1(cx - r * 0.38)} cy={n1(cy - r * 0.48)} rx={n1(r * 0.28)} ry={n1(r * 0.12)} fill="#fff" opacity={0.18} transform={`rotate(-30 ${n1(cx - r * 0.38)} ${n1(cy - r * 0.48)})`} />
      </g>
    </g>
  );
};
/** A TAPERING QUILL SWASH (skin_a.py swash) from (x0, y0) to (x1, y1), bellying down by sag, th thick in the middle,
 *  ending in a blot; filterUrl = an ink filter ("url(#p-inkR)"). o.k (0..1) writes it on from the left (a sweep). */
export const swash = (key: string, x0: number, y0: number, x1: number, y1: number, sag: number, th: number, filterUrl: string, o: { blot?: boolean; blotR?: number; k?: number } = {}) => {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag, k = o.k ?? 1;
  if (k <= 0) return null;
  const d = `M${x0},${y0} Q${n1(mx)},${n1(my + th)} ${x1},${y1} Q${n1(mx)},${n1(my - th * 0.2)} ${x0},${y0} Z`;
  const cid = `${key}-k`, xa = Math.min(x0, x1) - th, xb = Math.max(x0, x1) + th * 2;
  return (
    <g key={key}>
      {k < 1 ? <defs><clipPath id={cid}><rect x={n1(xa)} y={n1(Math.min(y0, y1) - th * 3 - Math.abs(sag))} width={n1((xb - xa) * k)} height={n1(Math.abs(y1 - y0) + th * 6 + Math.abs(sag) * 2)} /></clipPath></defs> : null}
      <g clipPath={k < 1 ? `url(#${cid})` : undefined}>
        <path d={d} fill="#000" filter={filterUrl} />
        {o.blot !== false ? <circle cx={x1 + 4} cy={y1 - 1} r={n1(o.blotR ?? th * 0.55)} fill="#000" filter={filterUrl} /> : null}
      </g>
    </g>
  );
};
/** THE CRIMSON CROSS (skin_a.py x_mark) at (x, y), s = half its size; k (0..1) = its two strokes written on, the first
 *  over the first 55 % */
export const xMark = (key: string, x: number, y: number, s: number, filterUrl: string, k = 1) => {
  if (k <= 0) return null;
  const L1 = Math.hypot(2 * s, 2 * s), L2 = Math.hypot(1.7 * s, 2.05 * s), a = clamp01(k / 0.55), b = clamp01((k - 0.55) / 0.45);
  const common = { stroke: "#000", strokeWidth: n1(s * 0.45), strokeLinecap: "round" as const, fill: "none" };
  return (
    <g key={key} filter={filterUrl}>
      <path d={`M${n1(x - s)},${n1(y - s)} L${n1(x + s)},${n1(y + s)}`} {...common} {...drawOn(L1, a)} />
      {b > 0 ? <path d={`M${n1(x + s * 0.9)},${n1(y - s)} L${n1(x - s * 0.8)},${n1(y + s * 1.05)}`} {...common} {...drawOn(L2, b)} /> : null}
    </g>
  );
};
/** THE MANICULE (skin_a.py manicule): the margin's pointing hand, a 17th-century reader's mark, in the crimson rubric,
 *  pointing right with its tip at (x, y); a paper backing cut round it (so it reads on a dark wall), the ink outline and
 *  a crimson wash. o.k (0..1) = drawn on (the backing first, then the outline). */
export const manicule = (p: string, key: string, x: number, y: number, s = 1, rot = 0, o: { k?: number; color?: string; back?: string } = {}) => {
  const k = o.k ?? 1;
  if (k <= 0) return null;
  const paths = ["M-150,-20 L-108,-24 L-104,24 L-150,22 Z",
    "M-104,-22 C-84,-30 -64,-28 -52,-22 L-6,-20 C4,-19 4,-7 -6,-6 L-46,-6 C-40,0 -40,6 -46,8 C-40,12 -40,18 -48,20 C-44,26 -48,30 -56,30 L-104,24 Z"];
  const tr = `translate(${n1(x)} ${n1(y)}) rotate(${rot}) scale(${n2(s)})`, back = o.back ?? MS.slip, color = o.color ?? MS.crimson;
  const ink = clamp01((k - 0.3) / 0.7);
  return (
    <g key={key}>
      <g transform={tr} opacity={n2(clamp01(k / 0.3))}>
        <g filter={`url(#${p}-shs)`}><g filter={`url(#${p}-torn2)`}>{paths.map((d, i) => <path key={i} d={d} fill={back} stroke={back} strokeWidth={16} strokeLinejoin="round" />)}</g></g>
        {paths.map((d, i) => <path key={i} d={d} fill={color} opacity={0.22 * ink} />)}
      </g>
      {ink > 0 ? (
        <g transform={tr}><g filter={`url(#${p}-inkRsm)`}>
          {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="#000" strokeWidth={5.5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={n2(1 - ink)} />)}
          <path d="M-60,8 L-46,8 M-62,20 L-48,20 M-140,-8 L-116,-10 M-140,8 L-116,8" stroke="#000" strokeWidth={4} opacity={n2(ink)} />
        </g></g>
      ) : null}
    </g>
  );
};
/** a polyline path of an ellipse arc (degrees, 0 = +x, clockwise on screen), turned rot degrees (common.py ellipse_arc) */
export const ellipseArc = (cx: number, cy: number, rx: number, ry: number, rot: number, a0: number, a1: number, n = 60) => {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180), pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180, x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push(`${n1(cx + x * c - y * s)},${n1(cy + x * s + y * c)}`);
  }
  return "M" + pts.join(" L");
};
/** a point on that ellipse at angle a (degrees) */
export const ellipsePt = (cx: number, cy: number, rx: number, ry: number, rot: number, a: number) => {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180), x = rx * Math.cos((a * Math.PI) / 180), y = ry * Math.sin((a * Math.PI) / 180);
  return { x: cx + x * c - y * s, y: cy + x * s + y * c };
};
/** the length of that ellipse's arc (for drawOn), measured on the same polyline */
export const ellipseLen = (rx: number, ry: number, a0: number, a1: number, n = 60) => {
  let L = 0, px = rx * Math.cos((a0 * Math.PI) / 180), py = ry * Math.sin((a0 * Math.PI) / 180);
  for (let i = 1; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180, x = rx * Math.cos(a), y = ry * Math.sin(a);
    L += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return L;
};
