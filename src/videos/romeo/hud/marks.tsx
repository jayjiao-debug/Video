// hud/marks.tsx: THE MARKS OF 「信」 THE LETTER (hud/skin.ts), on top of the kit's (src/kit/overlay/marks.tsx): the
// parchment, the wax, the quill hand, and the few signs drawn by hand. Plain functions that return SVG; deterministic
// (fixed seeds, the kit's hash01); no hooks. Every piece of the film's skin (title, tabs, tally, whisper, notes, fact
// card, stamp, split edge, end card) is put together from these, so they look like one maker.
//
// IDS: every filter, gradient and clip id starts with the piece's PREFIX p (e.g. "romeo-title"). letterDefs(p) defines
// the shared ones under it, once, inside the piece's <defs>; every mark that needs them takes p.
//   letterDefs(p) ids: ${p}-paper (the parchment's gradient), -deckle (its edge), -fibre (fibres and stains), -burn (the
//     browned rim), -sh / -shs (contact shadows, large / small), -soft (a soft blur), -nib<S> (THE QUILL HAND's nib at
//     size class S, NIBS), -wax-<tone> / -dish-<tone> / -ring-<tone> / -emb-<tone> (the wax: body, pressed dish, its
//     wall, the raised letters), for each tone of skin.ts WAX.
//
//   PARCHMENT   sheet(p, key, r, o, children)      a piece of parchment in box r: deckled edge, fibres, a browned
//                                                  rim, fold creases, its contact shadow; children are drawn on it
//               creaseLine(...)                    one fold line (a dark line with a lit line beside it)
//   WAX         wax(p, key, cx, cy, r, o)          a blob of sealing wax pressed with a seal: rows of characters in the
//                                                  SEAL FACE, or an emblem (heart, arrow, leaf, the hand-drawn 0 / 1)
//               blobPath(r, seed)                  its outline (wax squeezed out round the matrix)
//   QUILL HAND  quill(p, key, s, x, y, px, fill, o) a row written in the quill hand; o.k writes it on, a character at
//                                                  a time; quillW(s, px) its width
//               swashPath(...)                     a tapering stroke of the quill (an underline, a strike-through)
//   SIGNS       HEART, ARROW, LEAF, ZERO, ONE      paths in a 100 px box centred on (0, 0)
//
// THE CUT RULE (as Newton's skin: the cut lays the overlay pass over the picture as a separate PNG): nothing here reads
// the picture under it. No blend modes, no backdrop filters. Every mark draws its own pixels.
import React from "react";
import { FONT_STACK, clamp01, hash01, setRow, textW, tornBox, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, WAX, type WaxTone } from "./skin";

const n1 = (v: number) => v.toFixed(1), n2 = (v: number) => v.toFixed(2);

// ---------------------------------------------------------------------------------------------------- <defs>
/** the nib's size classes: a row of size px uses the nearest (nibOf) */
export const NIBS = [30, 38, 46, 56, 70, 90, 110, 140] as const;
export const nibOf = (px: number) => NIBS.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a), NIBS[0] as number);
/** THE NIB at size S: a broad quill held flat. Cross strokes are thinned (the nib's edge), down strokes fattened (its
 *  full width), the hand wobbles a little, the edge is ragged where the ink catches the skin of the parchment, and the
 *  ink lies unevenly. It keeps the colour it is given, so one filter serves every ink. */
const nibFilter = (id: string, S: number) => {
  const big = S >= 50, ey = (big ? 0.019 : 0.011) * S, dx = (big ? 0.011 : 0.006) * S;
  return (
    <filter key={id} id={id} x="-6%" y="-30%" width="112%" height="160%" colorInterpolationFilters="sRGB">
      <feMorphology in="SourceGraphic" operator="erode" radius={`0.01 ${n2(ey)}`} result="thin" />
      <feMorphology in="thin" operator="dilate" radius={`${n2(dx)} 0.01`} result="nib" />
      <feTurbulence type="fractalNoise" baseFrequency={(1.5 / S).toFixed(4)} numOctaves={1} seed={5} result="lo" />
      <feDisplacementMap in="nib" in2="lo" scale={n1(0.035 * S)} xChannelSelector="R" yChannelSelector="G" result="w" />
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={8} result="hi" />
      <feDisplacementMap in="w" in2="hi" scale={n1(Math.max(1, 0.009 * S))} xChannelSelector="R" yChannelSelector="G" result="shape" />
      <feMorphology in="shape" operator="erode" radius={n2(Math.max(0.8, 0.011 * S))} result="inner" />
      <feComposite in="shape" in2="inner" operator="out" result="rim" />
      <feColorMatrix in="rim" type="matrix" values="0.6 0 0 0 0  0 0.6 0 0 0  0 0 0.6 0 0  0 0 0 0.75 0" result="rimD" />
      <feTurbulence type="fractalNoise" baseFrequency={(3 / S).toFixed(4)} numOctaves={2} seed={12} result="d" />
      <feColorMatrix in="d" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.34 1.12" result="dens" />
      <feComposite in="shape" in2="dens" operator="in" result="body" />
      <feMerge><feMergeNode in="body" /><feMergeNode in="rimD" /></feMerge>
    </filter>
  );
};
const waxDefs = (p: string, tone: WaxTone) => {
  const W = WAX[tone];
  return [
    <radialGradient key={`${p}-wax-${tone}`} id={`${p}-wax-${tone}`} cx="0.36" cy="0.3" r="0.8">
      <stop offset="0" stopColor={W.hi} /><stop offset="0.5" stopColor={W.mid} /><stop offset="1" stopColor={W.deep} />
    </radialGradient>,
    <linearGradient key={`${p}-dish-${tone}`} id={`${p}-dish-${tone}`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
      <stop offset="0" stopColor={W.deep} /><stop offset="0.45" stopColor={W.mid} /><stop offset="1" stopColor={W.mid} />
    </linearGradient>,
    <linearGradient key={`${p}-ring-${tone}`} id={`${p}-ring-${tone}`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
      <stop offset="0" stopColor={W.shade} /><stop offset="0.5" stopColor={W.deep} /><stop offset="1" stopColor={W.hi} />
    </linearGradient>,
    <filter key={`${p}-emb-${tone}`} id={`${p}-emb-${tone}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feOffset in="SourceAlpha" dx={-1.5} dy={-1.7} result="up" />
      <feOffset in="SourceAlpha" dx={1.8} dy={2.2} result="dn" />
      <feFlood floodColor={W.shade} floodOpacity={0.9} /><feComposite in2="dn" operator="in" result="s" />
      <feFlood floodColor={W.lit} floodOpacity={0.85} /><feComposite in2="up" operator="in" result="l" />
      <feMerge><feMergeNode in="s" /><feMergeNode in="l" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>,
  ];
};
/** THE SHARED DEFS of a piece, under prefix p (ids in the header). Put once in the piece's <defs>. */
export const letterDefs = (p: string, tones: WaxTone[] = ["red"]): React.ReactNode[] => [
  <linearGradient key={`${p}-paper`} id={`${p}-paper`} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor={TONE.paperHi} /><stop offset="0.5" stopColor={C.paper} /><stop offset="1" stopColor={TONE.paperLo} />
  </linearGradient>,
  <filter key={`${p}-deckle`} id={`${p}-deckle`} x="-4%" y="-8%" width="108%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={11} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
  </filter>,
  <filter key={`${p}-fibre`} id={`${p}-fibre`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} result="f" />
    <feColorMatrix in="f" type="matrix" values="0 0 0 0 0.56  0 0 0 0 0.42  0 0 0 0 0.24  0 0 0 1.5 -0.84" result="fa" />
    <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves={3} seed={21} result="m" />
    <feColorMatrix in="m" type="matrix" values="0 0 0 0 0.70  0 0 0 0 0.50  0 0 0 0 0.24  0 0 0 1.0 -0.43" result="ma" />
    <feMerge result="all"><feMergeNode in="ma" /><feMergeNode in="fa" /></feMerge>
    <feComposite in="all" in2="SourceAlpha" operator="in" />
  </filter>,
  <filter key={`${p}-burn`} id={`${p}-burn`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={7} /></filter>,
  <filter key={`${p}-soft`} id={`${p}-soft`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={5} /></filter>,
  <filter key={`${p}-sh`} id={`${p}-sh`} x="-10%" y="-10%" width="120%" height="130%">
    <feDropShadow dx={4} dy={10} stdDeviation={8} floodColor={TONE.shadow} floodOpacity={0.5} />
  </filter>,
  <filter key={`${p}-shs`} id={`${p}-shs`} x="-10%" y="-12%" width="120%" height="134%">
    <feDropShadow dx={2} dy={5} stdDeviation={4} floodColor={TONE.shadow} floodOpacity={0.5} />
  </filter>,
  ...NIBS.map((S) => nibFilter(`${p}-nib${S}`, S)),
  ...tones.flatMap((t) => waxDefs(p, t)),
];

// ---------------------------------------------------------------------------------------------------- parchment
/** a fold of the paper: across the sheet at x (a vertical fold) or at y (a horizontal one), from a to b; `valley`
 *  flips which side is lit */
export type Crease = { x?: number; y?: number; a: number; b: number; valley?: boolean };
/** ONE FOLD LINE: a dark line with a lit line beside it and a little shade on the far panel */
export const creaseLine = (key: string, c: Crease, strength = 1) => {
  const v = c.x !== undefined, at = (v ? c.x : c.y) ?? 0, s = c.valley ? -1 : 1;
  const line = (off: number, col: string, w: number, op: number) =>
    v ? <line x1={at + off} y1={c.a} x2={at + off} y2={c.b} stroke={col} strokeWidth={w} opacity={op * strength} />
      : <line x1={c.a} y1={at + off} x2={c.b} y2={at + off} stroke={col} strokeWidth={w} opacity={op * strength} />;
  return (
    <g key={key}>
      {v ? <rect x={s > 0 ? at : at - 34} y={c.a} width={34} height={c.b - c.a} fill={TONE.crease} opacity={0.07 * strength} />
        : <rect x={c.a} y={s > 0 ? at : at - 34} width={c.b - c.a} height={34} fill={TONE.crease} opacity={0.07 * strength} />}
      {line(0, TONE.crease, 2, 0.5)}
      {line(-2.2 * s, "#fffaf0", 1.6, 0.7)}
    </g>
  );
};
export type SheetOpts = {
  /** the edge: how far it wanders (px), every `step` px, from this seed; which sides are torn (default all) */
  jag?: number; step?: number; seed?: number; sides?: ("top" | "right" | "bottom" | "left")[];
  /** fold creases, in the sheet's own px */ creases?: Crease[];
  /** its contact shadow: "big" (a sheet lying on the picture), "small" (a slip), "none" */ shadow?: "big" | "small" | "none";
  /** the browned rim's width in px (0 = none) */ burn?: number;
  /** a thin inked rule this many px inside the edge (a proclamation) */ rule?: number;
  /** its own outline instead of the box's (a path, in the sheet's px): a tab with a notch, a pennon */ path?: string;
  /** another fill than the parchment's gradient */ fill?: string;
};
/** A PIECE OF PARCHMENT in box r: a deckled edge, fibres and stains, a browned rim, fold creases, a contact shadow.
 *  `children` are drawn on it (they are not roughened with it). */
export const sheet = (p: string, key: string, r: Rect, o: SheetOpts = {}, children?: React.ReactNode) => {
  const d = o.path ?? tornBox(r, { jag: o.jag ?? 2.5, step: o.step ?? 26, seed: o.seed ?? 1, sides: o.sides });
  const cid = `${p}-${key}-c`, burn = o.burn ?? 9, sh = o.shadow ?? "big";
  return (
    <g key={key}>
      <defs><clipPath id={cid}><path d={d} /></clipPath></defs>
      <g filter={sh === "none" ? undefined : `url(#${p}-${sh === "big" ? "sh" : "shs"})`}>
        <g filter={`url(#${p}-deckle)`}>
          <path d={d} fill={o.fill ?? `url(#${p}-paper)`} />
          <g clipPath={`url(#${cid})`}>
            <path d={d} fill="#fff" filter={`url(#${p}-fibre)`} />
            {burn > 0 ? <path d={d} fill="none" stroke={TONE.paperEdge} strokeWidth={burn * 2} opacity={0.6} filter={`url(#${p}-burn)`} /> : null}
            {(o.creases ?? []).map((c, i) => creaseLine(`k${i}`, c))}
            {o.rule ? <path d={tornBox({ x0: r.x0 + o.rule, y0: r.y0 + o.rule, x1: r.x1 - o.rule, y1: r.y1 - o.rule }, { jag: 0.8, step: 40, seed: 5 })} fill="none" stroke={TONE.inkSoft} strokeWidth={2.2} opacity={0.75} /> : null}
          </g>
          <path d={d} fill="none" stroke={TONE.paperEdge} strokeWidth={1.4} opacity={0.55} />
        </g>
      </g>
      {children}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- signs drawn by hand
/** a heart (Romeo's wax: 恋爱脑), in a 100 px box centred on (0, 0) */
export const HEART = "M0,31 C-44,2 -34,-36 -13,-31 C-5,-29 0,-21 0,-15 C0,-21 5,-29 13,-31 C34,-36 44,2 0,31 Z";
/** an arrow loosed to the right (Juliet's wax: 行动派) */
export const ARROW = "M-36,-7 L4,-7 L4,-25 L37,0 L4,25 L4,7 L-36,7 L-27,0 Z";
/** a herb leaf on its stalk (the friar's wax: 草药行家) */
export const LEAF = "M-3,38 C-3,28 -2,20 0,14 C-26,6 -27,-22 0,-38 C27,-22 26,6 0,14 C2,20 3,28 3,38 Z M0,8 L0,-26 M0,-4 L-11,-14 M0,-4 L11,-14";
/** the tally's 0, cut by a broad nib: fat sides, thin top and foot (fill-rule evenodd) */
export const ZERO = (() => {
  const a = (-16 * Math.PI) / 180, rx = 13.5, ry = 31, ex = Math.cos(a) * rx, ey = Math.sin(a) * rx;
  return `M-27,0 A27,40 0 1 0 27,0 A27,40 0 1 0 -27,0 Z M${n1(-ex)},${n1(-ey)} A${rx},${ry} -16 1 0 ${n1(ex)},${n1(ey)} A${rx},${ry} -16 1 0 ${n1(-ex)},${n1(-ey)} Z`;
})();
/** the tally's 1: a thin flag, a fat stem, a foot */
export const ONE = "M-6,-39 L12,-44 C13,-12 12,16 10,36 L-8,36 C-6,12 -6,-12 -6,-39 Z M-6,-39 L-6,-26 C-13,-19 -19,-15 -26,-13 L-28,-21 C-19,-25 -12,-31 -6,-39 Z M-22,43 L24,43 L24,35 C10,37 -8,37 -22,35 Z";
/** a rapier, point up (Tybalt's wax: the duellist) */
export const BLADE = "M0,-44 L5,-31 L5,14 L20,14 L20,22 L5,22 L5,33 C10,35 10,44 0,45 C-10,44 -10,35 -5,33 L-5,22 L-20,22 L-20,14 L-5,14 L-5,-31 Z";
const EMBLEM = { heart: HEART, arrow: ARROW, leaf: LEAF, blade: BLADE, "0": ZERO, "1": ONE } as const;
export type Emblem = keyof typeof EMBLEM;

/** A STROKE OF THE QUILL from (x0, y0) to (x1, y1), bellied by `sag` px, `th` px thick at its middle and tapering to
 *  both ends (an underline, a strike-through, a flourish). k (0..1) draws it on from its start. A path to fill. */
export const swashPath = (x0: number, y0: number, x1: number, y1: number, sag: number, th: number, k = 1) => {
  const t = clamp01(k), bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t, mx = (x0 + bx) / 2, my = (y0 + by) / 2 + sag * t;
  return `M${n1(x0)},${n1(y0)} Q${n1(mx)},${n1(my - th * 0.55)} ${n1(bx)},${n1(by)} Q${n1(mx)},${n1(my + th * 0.55)} ${n1(x0)},${n1(y0)} Z`;
};

// ---------------------------------------------------------------------------------------------------- wax
/** THE OUTLINE OF A BLOB OF WAX of radius r: nearly round, with `drips` places where it squeezed out from under the
 *  seal. Centred on (0, 0). */
export const blobPath = (r: number, seed = 1, drips = 2) => {
  const n = 46, P: [number, number][] = [], TAU = Math.PI * 2;
  const bumps = Array.from({ length: drips }, (_, k) => ({ a: (0.7 + (TAU / Math.max(1, drips)) * k + 1.5 * hash01(k, seed + 31)) % TAU, h: 0.09 + 0.08 * hash01(k, seed + 37), w: 0.26 + 0.14 * hash01(k, seed + 41) }));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    let q = 1 + 0.028 * Math.sin(a * 3 + seed * 1.7) + 0.02 * Math.sin(a * 5 + seed * 2.9) + 0.01 * Math.sin(a * 9 + seed);
    for (const b of bumps) { let d = Math.abs(a - b.a) % TAU; if (d > Math.PI) d = TAU - d; q += b.h * Math.exp(-(d * d) / (2 * b.w * b.w)); }
    P.push([Math.cos(a) * r * q, Math.sin(a) * r * q]);
  }
  const mid = (i: number) => { const a = P[(i + n) % n], b = P[(i + 1) % n]; return `${n1((a[0] + b[0]) / 2)},${n1((a[1] + b[1]) / 2)}`; };
  let d = `M${mid(-1)}`;
  for (let i = 0; i < n; i++) d += ` Q${n1(P[i][0])},${n1(P[i][1])} ${mid(i)}`;
  return d + " Z";
};
export type WaxOpts = {
  /** which wax (skin.ts WAX; its defs must be asked for in letterDefs(p, tones)) */ tone?: WaxTone;
  /** what the seal pressed into it: rows of characters in the SEAL FACE, or an emblem */ rows?: string[]; emblem?: Emblem;
  /** the characters' size (default: fitted to the dish) */ px?: number;
  /** its turn in degrees, its outline's seed, how many places it squeezed out */ rot?: number; seed?: number; drips?: number;
  /** the thunk (skin.ts thunk()): its scale, and how flat it is pressed */ scale?: number; squash?: number;
  /** the light that crosses it once, 0..1 (0 and 1 = none) */ glint?: number;
  shadow?: boolean; opacity?: number;
};
/** A BLOB OF SEALING WAX of radius r centred on (cx, cy), pressed with a seal: the squeezed-out body, the pressed dish
 *  with its lit wall, the raised characters or emblem, a highlight. Scale it with thunk(). */
export const wax = (p: string, key: string, cx: number, cy: number, r: number, o: WaxOpts = {}) => {
  const tone = o.tone ?? "red", W = WAX[tone], sq = o.squash ?? 1, sc = o.scale ?? 1, seed = o.seed ?? 1, ri = r * 0.71;
  if (sc <= 0) return null;
  const body = blobPath(r, seed, o.drips ?? 2), rows = o.rows ?? [], n = Math.max(1, ...rows.map((s) => [...s].length));
  const px = o.px ?? (rows.length <= 1 ? (n === 1 ? ri * 1.28 : n === 2 ? ri * 0.8 : (ri * 1.72) / n) : Math.min(ri * 0.7, (ri * 1.5) / n));
  const rh = px * 1.06, y0 = -((rows.length - 1) * rh) / 2, g = o.glint ?? 0;
  return (
    <g key={key} opacity={o.opacity} transform={`translate(${n1(cx)},${n1(cy)}) rotate(${n1(o.rot ?? 0)}) scale(${n2(sc * sq)},${n2(sc / sq)})`}>
      {o.shadow === false ? null : <path d={body} fill={TONE.shadow} opacity={0.5} transform={`translate(${n1(r * 0.06)},${n1(r * 0.13)})`} filter={`url(#${p}-soft)`} />}
      <path d={body} fill={`url(#${p}-wax-${tone})`} stroke={W.deep} strokeWidth={Math.max(1.4, r * 0.035)} strokeLinejoin="round" />
      <circle r={n1(ri)} fill={`url(#${p}-dish-${tone})`} />
      <circle r={n1(ri)} fill="none" stroke={`url(#${p}-ring-${tone})`} strokeWidth={n1(Math.max(2, r * 0.07))} />
      <circle r={n1(ri - Math.max(4, r * 0.1))} fill="none" stroke={W.hi} strokeWidth={n1(Math.max(1, r * 0.022))} opacity={0.55} />
      <g filter={`url(#${p}-emb-${tone})`}>
        {o.emblem
          ? <path d={EMBLEM[o.emblem]} transform={`scale(${n2((ri * (o.emblem === "0" || o.emblem === "1" ? 1.74 : 1.3)) / 100)})`} fill={o.emblem === "leaf" ? W.letter : W.letter} fillRule="evenodd" stroke={o.emblem === "leaf" ? W.shade : "none"} strokeWidth={o.emblem === "leaf" ? 5 : 0} strokeLinecap="round" />
          : rows.map((s, i) => (
            <text key={i} x={px * 0.03} y={n1(y0 + i * rh + px * 0.355)} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={n1(px)} letterSpacing={n1(px * 0.06)} fill={W.letter}>{s}</text>
          ))}
      </g>
      <ellipse cx={n1(-r * 0.45)} cy={n1(-r * 0.6)} rx={n1(r * 0.3)} ry={n1(r * 0.1)} fill="#fff" opacity={0.3} transform={`rotate(-34 ${n1(-r * 0.45)} ${n1(-r * 0.6)})`} />
      <circle cx={n1(r * 0.6)} cy={n1(r * 0.55)} r={n1(r * 0.05)} fill="#fff" opacity={0.28} />
      {g > 0 && g < 1 ? <ellipse cx={n1(-r * 0.8 + r * 1.6 * g)} cy={n1(-r * 0.3 + r * 0.5 * g)} rx={n1(r * 0.16)} ry={n1(r * 0.62)} fill="#fff" opacity={n2(0.42 * Math.sin(Math.PI * g))} transform={`rotate(28 ${n1(-r * 0.8 + r * 1.6 * g)} ${n1(-r * 0.3 + r * 0.5 * g)})`} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- the quill hand
/** the hand's slant in degrees (the tops lean right) */
export const SLANT = 8;
export type QuillOpts = {
  anchor?: "start" | "middle" | "end";
  /** the smaller, steadier hand (labels, a second line) instead of the display hand */ body?: boolean;
  /** varies each character's turn and lift */ seed?: number;
  /** letter spacing as a share of the size (default: the treatment's) */ track?: number;
  /** WRITTEN SO FAR, 0..1: the characters come one at a time, the one being written a little small and faint */ k?: number;
  /** the nib's size class (default: nearest to px) */ nib?: number;
  /** no slant (a numeral, a row that must sit square) */ upright?: boolean;
  opacity?: number;
};
/** the width of a row in the quill hand */
export const quillW = (s: string, px: number, o: Pick<QuillOpts, "body" | "track"> = {}) => textW(s, px, (o.track ?? (o.body ? SKIN.body : SKIN.display).track) * px);
/** A ROW IN THE QUILL HAND, centred on y, anchored at x: FrSans set a character at a time (turned, lifted and scaled by
 *  hand), slanted, and cut by the nib. `fill` is its ink. */
export const quill = (p: string, key: string, s: string, x: number, y: number, px: number, fill: string, o: QuillOpts = {}) => {
  const treat = o.body ? SKIN.body : SKIN.display, track = o.track ?? treat.track;
  const row = setRow(s, px, { track, hand: treat.hand }, o.seed ?? 1), w = quillW(s, px, { body: o.body, track });
  const ox = o.anchor === "start" ? x + w / 2 : o.anchor === "end" ? x - w / 2 : x, k = o.k ?? 1, n = row.length;
  if (k <= 0) return null;
  return (
    <g key={key} filter={`url(#${p}-nib${o.nib ?? nibOf(px)})`} opacity={o.opacity}>
      <g transform={`translate(${n1(ox)},${n1(y)})${o.upright ? "" : ` skewX(${-SLANT})`}`} fill={fill} fontFamily={FONT_STACK} fontWeight={700} fontSize={px} textAnchor="middle">
        {row.map((c) => {
          const ck = clamp01(k * n - c.i);
          if (ck <= 0) return null;
          return <text key={c.i} x={0} y={n1(px * 0.355)} opacity={ck < 1 ? n2(0.35 + 0.65 * ck) : undefined} transform={`translate(${n1(c.x)},${n1(c.y)}) rotate(${n1(c.rot)}) scale(${n2(c.s * (0.86 + 0.14 * ck))})`}>{c.ch}</text>;
        })}
      </g>
    </g>
  );
};
/** A ROW IN THE QUILL HAND IN SEVERAL INKS: `runs` are set one after another as one row centred on x (a word picked
 *  out in red inside a line). o.k writes the whole row on, run after run. Returns the row and where each run starts and
 *  ends (px), for an underline. */
export const quillRuns = (p: string, key: string, runs: { s: string; fill: string }[], x: number, y: number, px: number, o: QuillOpts = {}) => {
  const track = (o.track ?? (o.body ? SKIN.body : SKIN.display).track) * px, ws = runs.map((r) => quillW(r.s, px, o));
  const total = ws.reduce((a, b) => a + b, 0) + track * (runs.length - 1), ns = runs.map((r) => [...r.s].length), N = ns.reduce((a, b) => a + b, 0);
  let cur = x - total / 2, done = 0;
  const spans: { x0: number; x1: number }[] = [], nodes: React.ReactNode[] = [];
  runs.forEach((r, i) => {
    const k = o.k === undefined ? 1 : clamp01((o.k * N - done) / ns[i]);
    nodes.push(quill(p, `${key}${i}`, r.s, cur, y, px, r.fill, { ...o, anchor: "start", seed: (o.seed ?? 1) + i * 3, k }));
    spans.push({ x0: cur, x1: cur + ws[i] });
    cur += ws[i] + track; done += ns[i];
  });
  return { node: <g key={key}>{nodes}</g>, spans };
};
