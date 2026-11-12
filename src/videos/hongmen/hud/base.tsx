// hud/base.tsx: what every overlay of the Hongmen film shares: the palette, the screen zones, the motion helpers, the
// text metrics and THE PLATE (a rounded label with an ink line, a light rim, a soft shadow and an optional tail that
// points at something). Everything is a pure function of its arguments: no hooks, no state, no ids, nothing random.
// The API for shot builders is in hud/index.ts.
import React from "react";
import { spring } from "remotion";
import { FONT_STACK } from "../../group/kit/overlay";
import { SCREEN } from "../layout";
import { EN } from "../lang";

export { FONT_STACK };
export const FW = 1080, FH = 1920;

// ---------------------------------------------------------------------------------------------------- palette
export type Camp = "liu" | "xiang";
/** the two camps on screen: Liu Bang's side RED, Xiang Yu's side DEEP PURPLE over CHARCOAL */
export const CAMP: Record<Camp, { fill: string; band: string; text: string; sub: string; num: string }> = {
  liu: { fill: "#cb2f29", band: "#8c1c1f", text: "#ffffff", sub: "#ffe6c4", num: "#d2362e" },
  xiang: { fill: "#5a3399", band: "#2b2638", text: "#ffffff", sub: "#e9dfff", num: "#4a3a70" },
};
export const HC = {
  ink: "#15131d", white: "#ffffff", cream: "#fff3da", gold: "#ffc53d", goldDeep: "#e09b17",
  seal: "#cf2e26", sealDark: "#9a1d1b", shadow: "rgba(12,10,22,0.34)", skin: "#f3e3c3",
};

// ---------------------------------------------------------------------------------------------------- screen zones
/** px on 1080 x 1920 (layout.ts SCREEN): nothing that matters above `top`, inside the caption band capTop..capBottom,
 *  below `bottom`, or right of railX below railY (the app's button column). `side` = the margin to the side edges. */
export const ZONE = { top: SCREEN.top, capTop: SCREEN.capTop, capBottom: SCREEN.capBottom, bottom: SCREEN.bottom, railX: 930, railY: 900, side: EN ? 96 : 26 };
export type Rect = { x0: number; y0: number; x1: number; y1: number };
export type Head = { x: number; y: number; r: number };
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

// ---------------------------------------------------------------------------------------------------- text
const isWide = (c: string) => { const u = c.codePointAt(0) ?? 0; return u >= 0x2e80 || u === 0x00d7 /* × */; };
/** (English: capitals by width, so that a name in capitals such as CAO WUSHANG gets its whole plate; the Chinese film
 *  keeps the one class of 0.68 it was laid out with) */
const CAP_EN = (c: string) => (/[MW]/.test(c) ? 0.9 : c === "I" ? 0.34 : /[DGHNOQU]/.test(c) ? 0.75 : 0.65);
/** the width of a line of Noto Sans SC Bold in px, without measuring the DOM: full-width characters are 1 em; Latin
 *  letters, digits and marks by class (within 3 %). `ls` = letter spacing in px. */
export const textW = (s: string, size: number, ls = 0) => {
  let w = 0; const cs = [...s];
  for (const c of cs) w += isWide(c) ? 1 : c === " " ? 0.26 : /[0-9]/.test(c) ? 0.59 : /[A-Z]/.test(c) ? (EN ? CAP_EN(c) : 0.68) : /[a-z]/.test(c) ? (/[iljt.,'!|]/.test(c) ? 0.33 : /[mw]/.test(c) ? 0.9 : 0.57) : /[·]/.test(c) ? 0.5 : 0.4;
  return w * size + Math.max(0, cs.length - 1) * ls;
};
/** an SVG line of text centred on (x, y): ink line under the fill. sw = the ink line's width (0 = none). */
export const svgText = (key: string, s: string, x: number, y: number, size: number, fill: string, o: { ls?: number; sw?: number; stroke?: string; op?: number } = {}) => {
  const ls = o.ls ?? 0, sw = o.sw ?? 0;
  return (
    <text key={key} x={x + ls / 2} y={y + size * 0.355} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={size} letterSpacing={ls} fill={fill} opacity={o.op}
      stroke={sw ? o.stroke ?? HC.ink : "none"} strokeWidth={sw || undefined} strokeLinejoin="round" style={{ paintOrder: "stroke fill" } as React.CSSProperties}>{s}</text>
  );
};
/** HTML text with a strong ink line and a hard little shadow (numbers, the title): the kit's look */
export const inkText = (size: number, color: string, sw = Math.max(8, Math.round(size * 0.11))): React.CSSProperties => ({
  fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap",
  WebkitTextStroke: `${sw}px ${HC.ink}`, paintOrder: "stroke fill", textShadow: `0 ${Math.max(3, Math.round(size * 0.05))}px 0 rgba(8,8,16,0.4)`, fontVariantNumeric: "tabular-nums",
} as React.CSSProperties);

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

// ---------------------------------------------------------------------------------------------------- THE PLATE
export type PlateRow = { text: string; size: number; color: string; ls?: number };
export type PlateSpec = {
  /** one or two rows of text: the first is the name (on `fill`), the second the role (on `band`) */ rows: PlateRow[];
  fill: string; band?: string;
  /** side padding in px (default 26) */ padX?: number;
  /** the informer's mark: a round seal on the plate's upper left corner, with this character */ mark?: string;
  /** min width */ minW?: number;
};
const ROW_H = (size: number) => Math.round(size * 1.36);
/** the size of a plate in px (its body, without the tail, the rim or the shadow) */
export const plateSize = (p: PlateSpec) => {
  const padX = (p.padX ?? 26) + (p.mark ? 16 : 0);
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
/** THE INFORMER'S MARK: a round cream seal with a red ring and one red character (密). Centred on (x, y), radius r. */
export const sealMark = (key: string, x: number, y: number, r: number, ch: string, rot = -12) => (
  <g key={key} transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle cx={0} cy={r * 0.16} r={r} fill={HC.shadow} />
    <circle r={r} fill={HC.cream} stroke={HC.ink} strokeWidth={Math.max(4, r * 0.2)} />
    <circle r={r * 0.7} fill="none" stroke={HC.seal} strokeWidth={Math.max(2.5, r * 0.11)} />
    {svgText("c", ch, 0, 0, r * 1.02, HC.seal)}
  </g>
);
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
  if (p.mark) kids.push(sealMark("mark", x0 + 4, y0 + 2, 36, p.mark));
  return <g key={key}>{kids}</g>;
};
