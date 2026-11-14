// overlay/marks.tsx: MARKS MADE BY HAND (shared kit; src/kit/overlay/README.md). The pieces a title, a card or an effect
// is built from when it must not look printed by a machine: a roughened edge, grain inside a shape, a dragged band, dry
// streaks, spatter, a torn box, a seal, and the ways a thing is revealed or hits (a sweep, a slash, a ring, a burst, a
// pointer). All of it is SVG, deterministic (fixed seeds), and has no colour of its own: the film's skin gives the
// colours, the sizes and the moment. None of these is a title or a card. A film puts them together its own way.
//
// Filters and gradients go inside <defs> and are used by id:  <defs>{roughFilter("t-rough", SKIN.display.rough)}</defs>
//                                                             <g filter="url(#t-rough)"> ... </g>
// Ids must be unique on the page: start them with the film's and the overlay's name.
import React from "react";
import { clamp01, easeOut, hash01 } from "./time";
import type { Pt, Rect } from "./frame";
import { FONT_STACK } from "./text";

// ---------------------------------------------------------------------------------------------------- <defs>
/** A ROUGH EDGE: displaces whatever it is put on by a fixed noise, so a clean shape looks cut, brushed or printed by
 *  hand. Low fx with high fy drags along the row (a brush); equal and high makes a nibbled edge (letterpress, a worn
 *  seal). The same on every frame. */
export const roughFilter = (id: string, r: { fx: number; fy: number; scale: number; seed: number }, octaves = 3) => (
  <filter key={id} id={id} x="-10%" y="-20%" width="120%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency={`${r.fx} ${r.fy}`} numOctaves={octaves} seed={r.seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={r.scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);
/** GRAIN inside a shape: the shape keeps its outline and gets streaks or speckle of `color` (r, g, b in 0..1) on it.
 *  Draw the shape a second time with this filter over the plain one. `amount` 0..1 = how much of it is covered. */
export const grainFilter = (id: string, g: { fx: number; fy: number; seed: number; color: [number, number, number]; amount: number }) => (
  <filter key={id} id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={`${g.fx} ${g.fy}`} numOctaves={3} seed={g.seed} result="t" />
    <feColorMatrix in="t" type="matrix" values={`0 0 0 0 ${g.color[0]}  0 0 0 0 ${g.color[1]}  0 0 0 0 ${g.color[2]}  0 0 0 ${(1.2 + 1.6 * g.amount).toFixed(2)} ${(-0.95 + 0.6 * g.amount).toFixed(2)}`} result="c" />
    <feComposite in="c" in2="SourceGraphic" operator="in" />
  </filter>
);
/** a straight gradient through the given colours, downward or to the right: evenly spaced, or [colour, place 0..1] */
export const gradient = (id: string, colors: (string | [string, number])[], dir: "down" | "right" = "down") => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2={dir === "right" ? "1" : "0"} y2={dir === "down" ? "1" : "0"}>
    {colors.map((c, i) => <stop key={i} offset={typeof c === "string" ? (colors.length > 1 ? i / (colors.length - 1) : 0) : c[1]} stopColor={typeof c === "string" ? c : c[0]} />)}
  </linearGradient>
);
/** a clip that is a plain box: <defs>{clipBox("t-clip", sweep(box, k, "left"))}</defs> ... <g clipPath="url(#t-clip)"> */
export const clipBox = (id: string, r: Rect) => (
  <clipPath key={id} id={id}><rect x={r.x0.toFixed(1)} y={r.y0.toFixed(1)} width={Math.max(0, r.x1 - r.x0).toFixed(1)} height={Math.max(0, r.y1 - r.y0).toFixed(1)} /></clipPath>
);
/** a clip that is any path */
export const clipPathOf = (id: string, d: string) => <clipPath key={id} id={id}><path d={d} /></clipPath>;
/** a mask that keeps everything inside `r` except what the `cut` nodes cover (draw them black): dry streaks through a
 *  band, a word knocked out of a plate */
export const cutMask = (id: string, r: Rect, cut: React.ReactNode) => (
  <mask key={id} id={id} maskUnits="userSpaceOnUse" x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0}>
    <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="#fff" />
    {cut}
  </mask>
);

// ---------------------------------------------------------------------------------------------------- reveals
/** A SWEEP: the part of a box uncovered at progress k (0..1), growing from one side. For a clipBox. */
export const sweep = (r: Rect, k: number, from: "left" | "right" | "top" | "bottom" = "left"): Rect => {
  const t = clamp01(k), w = (r.x1 - r.x0) * t, h = (r.y1 - r.y0) * t;
  return from === "left" ? { ...r, x1: r.x0 + w } : from === "right" ? { ...r, x0: r.x1 - w } : from === "top" ? { ...r, y1: r.y0 + h } : { ...r, y0: r.y1 - h };
};
/** A SLASH: like a sweep from the left, but the moving edge leans by `lean` px (top ahead when positive) and is a
 *  little ragged. A path for clipPathOf. */
export const slash = (r: Rect, k: number, lean = 80, seed = 1, jag = 0) => {
  const t = clamp01(k), x = r.x0 - Math.abs(lean) + (r.x1 - r.x0 + 2 * Math.abs(lean)) * t, n = 8, pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, y = r.y0 + (r.y1 - r.y0) * u;
    pts.push(`${(x + lean * (0.5 - u) + jag * (hash01(i, seed) - 0.5)).toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${(r.x0 - Math.abs(lean) - 40).toFixed(1)},${r.y0.toFixed(1)} L${pts.join(" L")} L${(r.x0 - Math.abs(lean) - 40).toFixed(1)},${r.y1.toFixed(1)} Z`;
};

// ---------------------------------------------------------------------------------------------------- dragged, torn, spattered
/** A DRAGGED BAND from x0 to x1 around y, `th` px thick, rising `rise` px to the right: pressed round where it starts,
 *  ragged and thinning where it ends (a brush stroke, a swipe of paint, a strip of tape). A path. */
export const bandPath = (x0: number, x1: number, y: number, th: number, o: { rise?: number; seed?: number; taper?: number; jitter?: number } = {}) => {
  const rise = o.rise ?? 0, seed = o.seed ?? 1, taper = o.taper ?? 0.62, jit = o.jitter ?? 1, n = 34, top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + (x1 - x0) * u, yc = y - rise * (u - 0.5);
    const env = (0.72 + 0.28 * Math.min(1, u / 0.07)) * (u > 0.72 ? 1 - taper * Math.pow((u - 0.72) / 0.28, 1.4) : 1) * (0.9 + 0.1 * Math.sin(Math.PI * u));
    const amp = th * (u > 0.8 ? 0.16 : 0.06) * jit, jt = (hash01(i, seed) - 0.5) * amp, jb = (hash01(i, seed + 7) - 0.5) * amp;
    top.push(`${x.toFixed(1)},${(yc - (th / 2) * env + jt).toFixed(1)}`);
    bot.unshift(`${x.toFixed(1)},${(yc + (th / 2) * env + jb).toFixed(1)}`);
  }
  const ys = y + rise / 2, h0 = th * 0.36;
  return `M${top.join(" L")} L${bot.join(" L")} Q${(x0 - th * 0.42).toFixed(1)},${(ys + h0 * 0.2).toFixed(1)} ${x0.toFixed(1)},${(ys - h0).toFixed(1)} Z`;
};
/** DRY STREAKS along the far end of a band: thin lines to cut out of it with a mask (stroke them black on a white
 *  mask), longer toward the end. Nodes. */
export const streaks = (x0: number, x1: number, y: number, th: number, o: { rise?: number; seed?: number; n?: number } = {}) => {
  const rise = o.rise ?? 0, seed = o.seed ?? 1, n = o.n ?? 9, out: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const v = (k + 0.5) / n - 0.5, us = 0.48 + 0.32 * hash01(k, seed + 3), ue = Math.min(1.02, us + 0.25 + 0.35 * hash01(k, seed + 5));
    const xa = x0 + (x1 - x0) * us, xb = x0 + (x1 - x0) * ue, ya = y - rise * (us - 0.5) + v * th * 0.8, yb = y - rise * (ue - 0.5) + v * th * 0.55;
    out.push(<path key={k} d={`M${xa.toFixed(1)},${ya.toFixed(1)} L${xb.toFixed(1)},${yb.toFixed(1)}`} stroke="#000" strokeWidth={(2.5 + 4 * hash01(k, seed + 9)).toFixed(1)} strokeLinecap="round" />);
  }
  return out;
};
/** SPATTER: `n` small drops scattered round a point, within `spread` px. Nodes (circles, no fill of their own: wrap
 *  them in a <g fill=...>). */
export const spatter = (cx: number, cy: number, spread: number, o: { n?: number; seed?: number; r?: [number, number]; squash?: number } = {}) => {
  const n = o.n ?? 6, seed = o.seed ?? 1, [r0, r1] = o.r ?? [3, 10], out: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const a = hash01(k, seed + 11) * Math.PI * 2, d = spread * (0.45 + 0.55 * hash01(k, seed + 13));
    out.push(<circle key={k} cx={(cx + Math.cos(a) * d).toFixed(1)} cy={(cy + Math.sin(a) * d * (o.squash ?? 0.7)).toFixed(1)} r={(r0 + (r1 - r0) * hash01(k, seed + 17)).toFixed(1)} />);
  }
  return out;
};
/** A TORN BOX: a box whose edges wander by up to `jag` px every `step` px (torn paper, a clipped strip, a worn plate).
 *  `sides` picks the torn edges (default all four); the others stay straight. A path. */
export const tornBox = (r: Rect, o: { jag?: number; step?: number; seed?: number; sides?: ("top" | "right" | "bottom" | "left")[] } = {}) => {
  const jag = o.jag ?? 8, step = o.step ?? 26, seed = o.seed ?? 1, sides = o.sides ?? ["top", "right", "bottom", "left"], pts: string[] = [];
  const edge = (ax: number, ay: number, bx: number, by: number, torn: boolean, s: number) => {
    const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step)), nx = -(by - ay) / len, ny = (bx - ax) / len;
    for (let i = 0; i < n; i++) {
      const u = i / n, j = torn && i > 0 ? jag * (hash01(i, seed + s) - 0.5) * 2 : 0;
      pts.push(`${(ax + (bx - ax) * u + nx * j).toFixed(1)},${(ay + (by - ay) * u + ny * j).toFixed(1)}`);
    }
  };
  edge(r.x0, r.y0, r.x1, r.y0, sides.includes("top"), 1);
  edge(r.x1, r.y0, r.x1, r.y1, sides.includes("right"), 2);
  edge(r.x1, r.y1, r.x0, r.y1, sides.includes("bottom"), 3);
  edge(r.x0, r.y1, r.x0, r.y0, sides.includes("left"), 4);
  return `M${pts.join(" L")} Z`;
};

// ---------------------------------------------------------------------------------------------------- a seal
/** the size of a seal for these rows of characters at `px` */
export const sealSize = (rows: string[], px: number, pad = px * 0.34) => {
  const n = Math.max(...rows.map((r) => [...r].length));
  return { w: n * px * 1.1 - px * 0.1 + 2 * pad, h: rows.length * px * 1.1 + 2 * pad };
};
/** what a seal may have besides its block and its characters; every part is off until the film asks for it */
export type SealOpts = {
  /** the block's colour and the characters' colour */ fill: string; text: string;
  radius?: number; pad?: number; font?: string;
  /** only a frame this many px wide, no filled block (a rubber stamp, a customs mark) */ frame?: number;
  /** a carved block: its edge wanders by this many px (deterministic from `seed`) */ carve?: number; seed?: number;
  /** a rim round the block: its colour, its width in px, an ink line round it */ rim?: { color: string; width?: number; ink?: string };
  /** a thin line just inside the block's edge, in this colour */ inner?: string;
  /** a hard drop under it, in this colour */ drop?: string;
};
/** A SEAL centred on (0, 0): a block with rows of characters in it. It has no roughness and no motion of its own: wrap
 *  it in the film's rough filter and scale it with slap(). A rim adds its width on every side of sealSize(). */
export const seal = (key: string, rows: string[], px: number, o: SealOpts) => {
  const { w, h } = sealSize(rows, px, o.pad), rad = o.radius ?? px * 0.16, rh = px * 1.1, y0 = -((rows.length - 1) * rh) / 2, rw = o.rim?.width ?? 9;
  const box: Rect = { x0: -w / 2, y0: -h / 2, x1: w / 2, y1: h / 2 };
  return (
    <g key={key}>
      {o.drop ? <rect x={-w / 2 - (o.rim ? rw : 0)} y={-h / 2 - (o.rim ? rw : 0) + px * 0.25} width={w + (o.rim ? 2 * rw : 0)} height={h + (o.rim ? 2 * rw : 0)} rx={rad + (o.rim ? rw : 0)} fill={o.drop} /> : null}
      {o.rim ? <rect x={-w / 2 - rw} y={-h / 2 - rw} width={w + 2 * rw} height={h + 2 * rw} rx={rad + rw} fill={o.rim.color} stroke={o.rim.ink ?? "none"} strokeWidth={o.rim.ink ? 5 : undefined} /> : null}
      {o.carve && !o.frame
        ? <path d={tornBox(box, { jag: o.carve, step: 46, seed: o.seed ?? 1 })} fill={o.fill} stroke={o.fill} strokeWidth={4} strokeLinejoin="round" />
        : <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={rad} fill={o.frame ? "none" : o.fill} stroke={o.frame ? o.fill : "none"} strokeWidth={o.frame || undefined} />}
      {o.inner ? <rect x={-w / 2 + px * 0.25} y={-h / 2 + px * 0.25} width={w - px * 0.5} height={h - px * 0.5} rx={rad * 0.6} fill="none" stroke={o.inner} strokeWidth={Math.max(2, px * 0.08)} opacity={0.9} /> : null}
      {rows.map((r, i) => (
        <text key={i} x={px * 0.05} y={y0 + i * rh + px * 0.355} textAnchor="middle" fontFamily={o.font ?? FONT_STACK} fontWeight={700} fontSize={px} letterSpacing={px * 0.1} fill={o.text}>{r}</text>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- hits and pointers
/** A RING that opens from r0 to r1 and thins away as k goes 0..1 (the air round a slap). Null when done. */
export const ring = (key: string, cx: number, cy: number, r0: number, r1: number, k: number, color: string, width = 8) => {
  const t = clamp01(k);
  return t <= 0 || t >= 1 ? null : <circle key={key} cx={cx} cy={cy} r={(r0 + (r1 - r0) * easeOut(t)).toFixed(1)} fill="none" stroke={color} strokeWidth={(width * (1 - t)).toFixed(1)} opacity={(1 - t).toFixed(3)} />;
};
/** A BURST: `n` short ticks flying out from a point as k goes 0..1 (round a punch word). Nodes; null when done. */
export const burst = (key: string, cx: number, cy: number, n: number, r0: number, r1: number, k: number, o: { color: string; width?: number; seed?: number; squash?: number }) => {
  const t = clamp01(k);
  if (t <= 0 || t >= 1) return null;
  const seed = o.seed ?? 1, e = easeOut(t), out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.3 * (hash01(i, seed) - 0.5)) / n) * Math.PI * 2, len = (r1 - r0) * (0.35 + 0.3 * hash01(i, seed + 2)) * (1 - 0.6 * t);
    const ra = r0 + (r1 - r0) * e * (0.7 + 0.3 * hash01(i, seed + 4)), rb = ra + len, sq = o.squash ?? 1;
    out.push(<path key={i} d={`M${(cx + Math.cos(a) * ra).toFixed(1)},${(cy + Math.sin(a) * ra * sq).toFixed(1)} L${(cx + Math.cos(a) * rb).toFixed(1)},${(cy + Math.sin(a) * rb * sq).toFixed(1)}`} />);
  }
  return <g key={key} stroke={o.color} strokeWidth={o.width ?? 7} strokeLinecap="round" opacity={(1 - t * t).toFixed(3)}>{out}</g>;
};
/** A POINTER drawn on from `from` to `to` as k goes 0..1, with a dot where it lands (a label to its thing, a side
 *  card to its face). Use frame.ts pointer(box, subject) for the two ends. */
export const leader = (key: string, from: Pt, to: Pt, k: number, o: { color: string; width?: number; dot?: number; under?: string }) => {
  const t = easeOut(k), x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t, w = o.width ?? 6, d = `M${from.x.toFixed(1)},${from.y.toFixed(1)} L${x.toFixed(1)},${y.toFixed(1)}`;
  if (t <= 0) return null;
  return (
    <g key={key} strokeLinecap="round">
      {o.under ? <path d={d} stroke={o.under} strokeWidth={w + 8} /> : null}
      <path d={d} stroke={o.color} strokeWidth={w} />
      {o.dot && t >= 1 ? <circle cx={to.x} cy={to.y} r={o.dot} fill={o.color} stroke={o.under ?? "none"} strokeWidth={o.under ? 4 : undefined} /> : null}
    </g>
  );
};
/** A BAR's two boxes for a value k (0..1): the track and the filled part, with `segs` equal steps when the film wants
 *  it to fill in jumps. Origin at the track's left centre. */
export const barBoxes = (w: number, h: number, k: number, segs = 0): { track: Rect; fill: Rect } => {
  const t = segs > 0 ? Math.floor(clamp01(k) * segs + 1e-6) / segs : clamp01(k);
  return { track: { x0: 0, y0: -h / 2, x1: w, y1: h / 2 }, fill: { x0: 0, y0: -h / 2, x1: w * t, y1: h / 2 } };
};
