// hud/base.tsx: what every overlay of the Wanbi film shares (a copy of Hongmen's hud/base.tsx, re-coloured for the two
// camps of this film): the palette, the screen zones (+ the jade chip's corner and the source tag's), the motion
// helpers, the text metrics and THE PLATE (a rounded label with an ink line, a light rim, a soft shadow and an
// optional tail that points at something). Everything is a pure function of its arguments: no hooks, no state, no
// ids, nothing random. The API for shot builders is hud/index.ts.
import React from "react";
import { spring } from "remotion";
import { FONT_STACK } from "../../group/kit/overlay";
import { SCREEN } from "../layout";
import { EN, TXT } from "../lang";

export { FONT_STACK };
export const FW = 1080, FH = 1920;

// ---------------------------------------------------------------------------------------------------- shared types
/** a head on screen: centre and the head's half width in px (shots/common.ts headPx) */
export type Head = { x: number; y: number; r: number };
/** a screen point in film px */
export type Pt = { x: number; y: number };
/** a screen box in film px */
export type Rect = { x0: number; y0: number; x1: number; y1: number };
/** the two camps: QIN = charcoal #36323d with a gold name; ZHAO = teal #2f8f8a with a cream name (BIBLE 6.2) */
export type Camp = "qin" | "zhao";
/** the frames of a thing that pops in and leaves: first frame, and frames until the leave or the leave's first frame */
export type Life = { f: number; from: number; len?: number; out?: number; key?: string };

// ---------------------------------------------------------------------------------------------------- palette
export const CAMP: Record<Camp, { fill: string; band: string; text: string; sub: string }> = {
  qin: { fill: "#36323d", band: "#1f1c25", text: "#ffc53d", sub: "#f3e2b0" },
  zhao: { fill: "#2f8f8a", band: "#1d6662", text: "#fff3da", sub: "#dcf2ec" },
};
export const HC = {
  ink: "#15131d", white: "#ffffff", cream: "#fff3da", gold: "#ffc53d", goldDeep: "#e09b17", goldPale: "#ffe7a3",
  seal: "#cf2e26", sealDark: "#9a1d1b", shadow: "rgba(12,10,22,0.34)", jade: "#eef1e4", jadeShade: "#c4d0b6",
  bamboo: "#dcb96e", bambooDark: "#a8803c", bambooLight: "#f0d690", cord: "#4e3220", grey: "#9c9aa6", black: "#1d1a22",
};

// ---------------------------------------------------------------------------------------------------- screen zones
/** tags (and every text the HUD places itself) keep this far from the left / right edge (English 96 px: phones taller
 *  than 16:9 cut the sides) */
export const TAG_X = EN ? 96 : 44;
/** px on 1080 x 1920 (layout.ts SCREEN): nothing that matters above `top`, inside the caption band capTop..capBottom,
 *  below `bottom`, or right of railX below railY (the app's button column). `side` = the margin to the side edges. */
export const ZONE = { top: SCREEN.top, capTop: SCREEN.capTop, capBottom: SCREEN.capBottom, bottom: SCREEN.bottom, railX: SCREEN.rail.x, railY: SCREEN.rail.y, side: TAG_X };
/** THE JADE CHIP's corner (top right): the chip draws inside it, tags and the cities' arch keep out of it */
export const CHIP_RECT: Rect = { x0: SCREEN.chip.x0, y0: SCREEN.chip.y0, x1: SCREEN.chip.x1, y1: SCREEN.chip.y1 };
export const rectOf = (cx: number, cy: number, w: number, h: number): Rect => ({ x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 });
/** the overlap of two rects in px (0 = apart); `gap` grows the first one */
export const overlap = (a: Rect, b: Rect, gap = 0) => Math.max(0, Math.min(a.x1 + gap, b.x1) - Math.max(a.x0 - gap, b.x0)) * Math.max(0, Math.min(a.y1 + gap, b.y1) - Math.max(a.y0 - gap, b.y0));
/** how deep a circle reaches into a rect (0 = apart) */
export const hitsCircle = (a: Rect, c: Head, k = 1) => {
  const dx = Math.max(a.x0 - c.x, 0, c.x - a.x1), dy = Math.max(a.y0 - c.y, 0, c.y - a.y1);
  return Math.max(0, c.r * k - Math.hypot(dx, dy));
};

// ---------------------------------------------------------------------------------------------------- motion
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const clamp01 = (x: number) => clamp(x, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const eIn = (x: number) => Math.pow(clamp01(x), 3);
export const eInOut = (x: number) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
/** a deterministic 0..1 from two integers */
export const hash01 = (i: number, k = 0) => { const s = Math.sin(i * 12.9898 + k * 78.233 + 0.37) * 43758.5453; return s - Math.floor(s); };
export const PUNCH = { damping: 9, stiffness: 210, mass: 0.7 };
export const SNAP = { damping: 15, stiffness: 520, mass: 0.6 };
/** 0 before `at`, then a spring to 1 (PUNCH overshoots once) */
export const springAt = (f: number, at: number, cfg = PUNCH) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: cfg }));
/** the LEAVE: 0 until `out`, 1 from out + n (every overlay fades and shrinks a little over its last n frames) */
export const leaveK = (f: number, out: number | undefined, n = 5) => (out === undefined ? 0 : clamp01((f - out + 1) / n));
/** the life of an overlay: from (first frame), out (first frame of the leave), gone on out + n */
export const life = (f: number, from: number, out: number | undefined, n = 5) => (f < from || (out !== undefined && f >= out + n) ? null : { t: f - from, lv: leaveK(f, out, n) });
/** a Life's leave frame: `out`, else from + len, else none (it stays as long as the shot gives it) */
export const outOf = (p: { from: number; len?: number; out?: number }, dflt?: number) => p.out ?? (p.len !== undefined ? p.from + p.len : dflt !== undefined ? p.from + dflt : undefined);

// ---------------------------------------------------------------------------------------------------- text
/** advance widths of FrSans (= Noto Sans SC Bold, public/bt/sans700.ttf) for ASCII 32..126, in 1/1000 em (measured
 *  with fontTools); every code point from U+2E80 up (CJK, full-width marks) and the arrows, ·, ×, curly quotes are 1 em */
const ADV = [227, 370, 574, 590, 590, 963, 740, 325, 378, 378, 507, 590, 325, 370, 325, 387, 590, 590, 590, 590, 590, 590, 590, 590, 590, 590, 325, 325, 590, 590, 590, 514, 1007,
  641, 681, 656, 714, 615, 585, 717, 757, 330, 568, 686, 578, 853, 749, 770, 667, 770, 682, 624, 625, 748, 619, 915, 627, 580, 613, 378, 387, 378, 590, 567, 626,
  591, 644, 527, 644, 581, 372, 597, 640, 304, 306, 604, 315, 964, 641, 626, 644, 644, 437, 495, 421, 637, 576, 863, 562, 574, 511, 378, 296, 378, 590];
const advOf = (c: string) => { const u = c.codePointAt(0) ?? 0; return u >= 32 && u < 127 ? ADV[u - 32] / 1000 : u === 0x2013 ? 0.544 : u === 0x2014 ? 0.908 : 1; };
/** the width of a line of Noto Sans SC Bold in px, without measuring the DOM (exact advances; no kerning).
 *  `ls` = letter spacing in px (added after every character but the last, as the browser draws it centred) */
export const textW = (s: string, size: number, ls = 0) => {
  let w = 0; const cs = [...s];
  for (const c of cs) w += advOf(c);
  return w * size + Math.max(0, cs.length - 1) * ls;
};
/** an SVG line of text centred on (x, y): ink line under the fill. sw = the ink line's width (0 = none). */
export const svgText = (key: string, s: string, x: number, y: number, size: number, fill: string, o: { ls?: number; sw?: number; stroke?: string; op?: number; anchor?: "middle" | "start" | "end" } = {}) => {
  const ls = o.ls ?? 0, sw = o.sw ?? 0, anchor = o.anchor ?? "middle";
  return (
    <text key={key} x={x + (anchor === "middle" ? ls / 2 : 0)} y={y + size * 0.355} textAnchor={anchor} fontFamily={FONT_STACK} fontWeight={700} fontSize={size} letterSpacing={ls} fill={fill} opacity={o.op}
      stroke={sw ? o.stroke ?? HC.ink : "none"} strokeWidth={sw || undefined} strokeLinejoin="round" style={{ paintOrder: "stroke fill" } as React.CSSProperties}>{s}</text>
  );
};
/** HTML text with a strong ink line and a hard little shadow (the kit's look) */
export const inkText = (size: number, color: string, sw = Math.max(8, Math.round(size * 0.11))): React.CSSProperties => ({
  fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap",
  WebkitTextStroke: `${sw}px ${HC.ink}`, paintOrder: "stroke fill", textShadow: `0 ${Math.max(3, Math.round(size * 0.05))}px 0 rgba(8,8,16,0.4)`, fontVariantNumeric: "tabular-nums",
} as React.CSSProperties);
/** English words wrapped into rows of at most `max` letters, BALANCED (the longest row as short as it can be):
 *  "return the jade intact" -> "return the" / "jade intact" (Hongmen's rowsOf filled rows greedily: "his / hat") */
export const wrapRows = (s: string, max = 16): string[] => {
  const words = s.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const total = words.join(" ").length;
  for (let n = Math.max(1, Math.ceil(total / max)); n <= words.length; n++) {
    // the best split of `words` into n rows: minimise the longest row (small n, exhaustive is cheap)
    let best: string[] | null = null, bestLen = Infinity;
    const rec = (i: number, rows: string[]) => {
      if (rows.length === n - 1) {
        const last = words.slice(i).join(" "); if (!last) return;
        const all = [...rows, last], m = Math.max(...all.map((r) => r.length));
        if (m <= max && m < bestLen) { bestLen = m; best = all; }
        return;
      }
      for (let j = i + 1; j < words.length; j++) rec(j, [...rows, words.slice(i, j).join(" ")]);
    };
    rec(0, []);
    if (best) return best;
  }
  return words;   // a single word longer than `max`
};

// ---------------------------------------------------------------------------------------------------- layout helpers
export const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: FW, height: FH, pointerEvents: "none", overflow: "hidden" };
/** a full-frame layer whose origin (0, 0) is the point (x, y) of the frame, scaled / turned about that point */
export const layerAt = (key: string, x: number, y: number, o: { s?: number; sx?: number; sy?: number; rot?: number; op?: number }, ...kids: React.ReactNode[]) => (
  <div key={key} style={FULL}>
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: o.op ?? 1,
      transform: `scale(${((o.s ?? 1) * (o.sx ?? 1)).toFixed(4)},${((o.s ?? 1) * (o.sy ?? 1)).toFixed(4)}) rotate(${(o.rot ?? 0).toFixed(3)}deg)` }}>{kids}</div>
  </div>
);
/** an svg whose (0, 0) sits on its parent's origin and that never clips */
export const svg0 = (key: string, ...kids: React.ReactNode[]) => (
  <svg key={key} width={2} height={2} viewBox="0 0 2 2" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{kids}</svg>
);
/** a full-frame svg in film px */
export const svgFull = (key: string, style: React.CSSProperties, ...kids: React.ReactNode[]) => (
  <svg key={key} width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{ ...FULL, overflow: "visible", ...style }}>{kids}</svg>
);
/** an ink line under a coloured stroke along the same path (the graphic layer's line) */
export const inkStroke = (key: string, d: string, color: string, w: number, ink = 2 * Math.max(4, w * 0.45), extra: React.SVGProps<SVGPathElement> = {}) => (
  <g key={key} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={HC.ink} strokeWidth={w + ink} {...extra} />
    <path d={d} stroke={color} strokeWidth={w} {...extra} />
  </g>
);

// ---------------------------------------------------------------------------------------------------- the source tag's corner
/** the source tag (hud/chip.tsx sourceTag): 《史记》 / "Records of the Grand Historian", top left at y ZONE.top */
export const SOURCE_SIZE = EN ? 32 : 38;
export const SOURCE_RECT: Rect = { x0: 0, y0: ZONE.top - 40, x1: TAG_X + 24 + textW(TXT.source, SOURCE_SIZE, 1) + 20, y1: ZONE.top + 30 };

// ---------------------------------------------------------------------------------------------------- THE PLATE
export type PlateRow = { text: string; size: number; color: string; ls?: number };
export type PlateSpec = {
  /** one or two rows of text: the first is the name (on `fill`), the second the role (on `band`) */ rows: PlateRow[];
  fill: string; band?: string;
  /** side padding in px (default 26) */ padX?: number;
  /** min width */ minW?: number;
};
const ROW_H = (size: number) => Math.round(size * 1.36);
/** the size of a plate in px (its body, without the tail, the rim or the shadow) */
export const plateSize = (p: PlateSpec) => {
  const padX = p.padX ?? 26;
  const w = Math.max(p.minW ?? 0, ...p.rows.map((r) => textW(r.text, r.size, r.ls ?? 0) + 2 * padX));
  const hs = p.rows.map((r) => ROW_H(r.size));
  return { w: Math.round(w), h: hs.reduce((a, b) => a + b, 0), hs };
};
const R = 16, TB = 15;
/** the outline of a rounded rect centred on (0, 0) with an optional tail to the point `tip` */
const platePath = (w: number, h: number, tip?: { x: number; y: number }) => {
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
  let edge: "t" | "b" | "l" | "r" | null = null, c = 0;
  if (tip) {
    const dx = Math.max(x0 - tip.x, 0, tip.x - x1), dy = Math.max(y0 - tip.y, 0, tip.y - y1);
    if (dx > 0 || dy > 0) {
      if (dy >= dx) { edge = tip.y > y1 ? "b" : "t"; c = x1 - x0 > 2 * (R + TB) ? clamp(tip.x, x0 + R + TB, x1 - R - TB) : 0; }
      else { edge = tip.x > x1 ? "r" : "l"; c = y1 - y0 > 2 * (R + TB) ? clamp(tip.y, y0 + R + TB, y1 - R - TB) : 0; }
    }
  }
  const b = edge === "l" || edge === "r" ? Math.min(TB, (h - 2 * R) / 2) : TB, T = tip as { x: number; y: number };
  const p: string[] = [`M${x0 + R},${y0}`];
  if (edge === "t") p.push(`L${c - b},${y0} L${T.x},${T.y} L${c + b},${y0}`);
  p.push(`L${x1 - R},${y0} Q${x1},${y0} ${x1},${y0 + R}`);
  if (edge === "r") p.push(`L${x1},${c - b} L${T.x},${T.y} L${x1},${c + b}`);
  p.push(`L${x1},${y1 - R} Q${x1},${y1} ${x1 - R},${y1}`);
  if (edge === "b") p.push(`L${c + b},${y1} L${T.x},${T.y} L${c - b},${y1}`);
  p.push(`L${x0 + R},${y1} Q${x0},${y1} ${x0},${y1 - R}`);
  if (edge === "l") p.push(`L${x0},${c + b} L${T.x},${T.y} L${x0},${c - b}`);
  p.push(`L${x0},${y0 + R} Q${x0},${y0} ${x0 + R},${y0} Z`);
  let tail: string | null = null;
  if (edge === "t") tail = `M${c - b},${y0 + 1} L${T.x},${T.y} L${c + b},${y0 + 1} Z`;
  if (edge === "b") tail = `M${c - b},${y1 - 1} L${T.x},${T.y} L${c + b},${y1 - 1} Z`;
  if (edge === "l") tail = `M${x0 + 1},${c - b} L${T.x},${T.y} L${x0 + 1},${c + b} Z`;
  if (edge === "r") tail = `M${x1 - 1},${c - b} L${T.x},${T.y} L${x1 - 1},${c + b} Z`;
  return { d: p.join(" "), edge, c, tail };
};
/** the plate as SVG nodes, centred on (0, 0) of the caller's layer. tip = where its tail points (relative to the
 *  plate's centre; none = no tail). */
export const plate = (key: string, p: PlateSpec, tip?: { x: number; y: number }) => {
  const { w, h, hs } = plateSize(p), two = p.rows.length > 1, band = p.band ?? p.fill;
  const P = platePath(w, h, tip), x0 = -w / 2, x1 = w / 2, y0 = -h / 2, yb = y0 + hs[0];
  // the tail takes the colour of the row it grows out of
  const tailCol = !two ? p.fill : P.edge === "b" ? band : P.edge === "t" ? p.fill : P.c < yb ? p.fill : band;
  const kids: React.ReactNode[] = [
    <path key="sh" d={P.d} transform="translate(0,9)" fill={HC.shadow} stroke={HC.shadow} strokeWidth={13} strokeLinejoin="round" />,
    <path key="rim" d={P.d} fill="none" stroke={HC.cream} strokeWidth={21} strokeLinejoin="round" />,
    <path key="fill" d={P.d} fill={two ? band : p.fill} />,
  ];
  if (two) kids.push(<path key="top" d={`M${x0},${yb} L${x0},${y0 + R} Q${x0},${y0} ${x0 + R},${y0} L${x1 - R},${y0} Q${x1},${y0} ${x1},${y0 + R} L${x1},${yb} Z`} fill={p.fill} />);
  if (P.tail) kids.push(<path key="tail" d={P.tail} fill={tailCol} />);
  kids.push(<path key="ink" d={P.d} fill="none" stroke={HC.ink} strokeWidth={13} strokeLinejoin="round" />);   // the ink line last, over every fill
  let y = y0;
  p.rows.forEach((r, i) => { kids.push(svgText(`t${i}`, r.text, 0, y + hs[i] / 2 - (i === 0 && two ? -2 : i === 1 ? 2 : 0), r.size, r.color, { ls: r.ls })); y += hs[i]; });
  return <g key={key}>{kids}</g>;
};

// ---------------------------------------------------------------------------------------------------- shared icons
/** THE JADE DISC (和氏璧) as an icon, centred on (0, 0), radius r: white jade with a pale green shade, the hole, a
 *  carved ring, an ink line, a highlight. The chip's icon and the bubble's. */
export const jadeIcon = (key: string, r: number, o: { ghost?: boolean } = {}) => {
  const hole = r * 0.3, sw = Math.max(5, r * 0.16);
  return (
    <g key={key} opacity={o.ghost ? 0.4 : 1}>
      <circle cx={0} cy={r * 0.14} r={r + sw * 0.5} fill={HC.shadow} />
      <circle r={r} fill={HC.jade} stroke={HC.ink} strokeWidth={sw} />
      <path d={`M${-r * 0.78},${r * 0.2} A${r * 0.8},${r * 0.8} 0 0 0 ${r * 0.62},${r * 0.55}`} fill="none" stroke={HC.jadeShade} strokeWidth={r * 0.22} strokeLinecap="round" />
      <circle r={r * 0.64} fill="none" stroke={HC.jadeShade} strokeWidth={Math.max(2, r * 0.07)} />
      <circle r={hole} fill={HC.ink} />
      <path d={`M${-r * 0.55},${-r * 0.42} A${r * 0.7},${r * 0.7} 0 0 1 ${-r * 0.1},${-r * 0.7}`} fill="none" stroke={HC.white} strokeWidth={r * 0.12} strokeLinecap="round" />
    </g>
  );
};
