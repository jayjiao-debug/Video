// hud/graphic.tsx: THE FLAT GRAPHIC LAYER (BIBLE 7): gold-outlined icons on an ink line for the abstract things.
//   cities({ f, from, mode, ... })   THE FIFTEEN CITIES, one icon (a walled town: a crenellated wall with a dark gate,
//                                    a gate tower under a black roof with upturned eaves), five modes:
//       "arch"    15 icons pop onto the arch x = 110 + 630 i/14, y = 240 + 70 (2i/14 - 1)^2, one per frame from the
//                 left, drawn left over right; the right end at 770 px (clear of the chip). English: 24 px lower, so
//                 the arch stays under the longer source tag. ghostAt: they turn ghost over 6 frames (line 4)
//       "ghost"   the arch dashed at 40 %, popping in over 8 frames from `from`
//       "vanish"  the ghost arch, then the icons pop out one by one from the left from vanishAt (vanishLen 20) (23a)
//       "map"     small icons (size 30) on 15 screen points `pts` (w.project of props MAP_CITIES), lit one per frame
//                 from `from`, a gold disc under each; every one pulses on pulseAt (12b)
//       "bubble"  5 icons round (x, y) inside the 8b thought bubble
//   army({ f, from })                THE ARMY (line 4): three rows of eight black pawns slide in from the left edge
//   crowns({ f, from, crossAt })     22 tiny flat-crown icons (two rows of 11) and a seal-red cross onto each (18a)
//   suns({ f, from, x, y, ... })     five suns, grey -> gold, popping in a row; slide; flash (14, 17)
//   stage({ f, from, out, at, r })   THE STAGE (V3, 13-14): the dark outside a soft circle, a light cone, curtains
//   bill({ f, from, out, zeroAt })   THE BILL (V6, 22): bamboo slats bound by two cords, the two 「0」 seals
// Every one is a plain function of the frame; nothing random (hash01), no ids, no blend modes (the cut lays the overlay
// pass over the picture).
import React from "react";
import { EN, L } from "../lang";
import { HC, FULL, ZONE, clamp, clamp01, eIn, eInOut, eOut, hash01, lerp, life, layerAt, outOf, springAt, svg0, svgText, textW, PUNCH, type Pt } from "./base";
import { stampLayout, sealNodes } from "./stamp";

type LifeP = { f: number; from: number; len?: number; out?: number; key?: string };
/** the pop of an icon t frames after its start: 0 -> 1.15 -> 1 in 5 frames */
const pop5 = (t: number) => (t < 0 ? 0 : t < 3 ? lerp(0.2, 1.15, (t + 1) / 3) : t < 5 ? lerp(1.15, 1, (t - 2) / 2) : 1);
const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => { const A = hexRgb(a), B = hexRgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`; };

// ---------------------------------------------------------------------------------------------------- the city icon
const WALL = "#f2e3b6";
/** the walled town in a 100 x 100 box centred on (0, 0) */
const CITY_SHAPES = {
  wall: "M-44,42 L-44,-4 L-34,-4 L-34,4 L-26,4 L-26,-4 L-18,-4 L-18,4 L18,4 L18,-4 L26,-4 L26,4 L34,4 L34,-4 L44,-4 L44,42 Z",
  tower: "M-17,6 L-17,-15 L17,-15 L17,6 Z",
  roof: "M-33,-12 Q-25,-14 -21,-25 L21,-25 Q25,-14 33,-12 L27,-9 L-27,-9 Z",
  gate: "M-10,42 L-10,25 A10,10 0 0 1 10,25 L10,42 Z",
  win: "M-5,-10 L5,-10 L5,-2 L-5,-2 Z",
};
/** one city icon at (x, y), `size` px tall, scale s; ghost g 0..1 (solid -> dashed outline at 40 %) */
export const cityIcon = (key: string, x: number, y: number, size: number, s = 1, g = 0, op = 1) => {
  if (s <= 0.001 || op <= 0) return null;
  const k = (size / 100) * s, C = CITY_SHAPES, solid = 1 - g;
  const parts = [C.wall, C.tower, C.roof];
  return (
    <g key={key} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k.toFixed(4)})`} opacity={op}>
      {solid > 0 ? (
        <g opacity={solid}>
          <g fill={HC.ink} stroke={HC.ink} strokeWidth={14} strokeLinejoin="round">{parts.map((d, i) => <path key={i} d={d} />)}</g>
          <path d={C.wall} fill={WALL} stroke={HC.gold} strokeWidth={5} strokeLinejoin="round" />
          <path d={C.tower} fill={WALL} stroke={HC.gold} strokeWidth={5} strokeLinejoin="round" />
          <path d={C.gate} fill={HC.black} />
          <path d={C.win} fill={HC.black} />
          <path d={C.roof} fill={HC.black} stroke={HC.gold} strokeWidth={5} strokeLinejoin="round" />
        </g>
      ) : null}
      {g > 0 ? (
        <g opacity={0.4 * g} fill="none" strokeLinejoin="round" strokeLinecap="round">
          {parts.map((d, i) => <path key={`a${i}`} d={d} stroke={HC.ink} strokeWidth={12} strokeDasharray="10 9" />)}
          {parts.map((d, i) => <path key={`b${i}`} d={d} stroke={HC.cream} strokeWidth={6} strokeDasharray="10 9" />)}
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------- cities
export type CitiesMode = "arch" | "ghost" | "vanish" | "map" | "bubble";
export type CitiesProps = LifeP & {
  mode: CitiesMode;
  /** "arch": the icons turn ghost over 6 frames from this frame (HIT.ghost) */ ghostAt?: number;
  /** "vanish": the first icon pops out on this frame (HIT.vanish); the 15 are gone `vanishLen` frames later (default 20) */ vanishAt?: number; vanishLen?: number;
  /** "map": every dot pulses once on this frame */ pulseAt?: number;
  /** "map": the 15 screen points */ pts?: Pt[];
  /** "bubble": the centre; "arch": ignored */ x?: number; y?: number;
  /** icon size in px (default 60; map 30; bubble 64) */ size?: number;
};
/** the arch's 15 points (English 24 px lower: the source tag is longer). Its right end is lifted (up to 24 px on
 *  the last icon, WP7 fix round): in zhaoKing (3) the last icon sat 4-8 px over the gold top of the King of Zhao's
 *  crown */
export const ARCH: Pt[] = Array.from({ length: 15 }, (_, i) => ({ x: 110 + (630 * i) / 14, y: 240 + 70 * Math.pow((2 * i) / 14 - 1, 2) - 24 * Math.pow(Math.max(0, (i - 7) / 7), 2) + (EN ? 24 : 0) }));
const BUBBLE_AT = [[-0.95, -0.42], [0, -0.66], [0.95, -0.42], [-0.5, 0.42], [0.5, 0.42]];
/** THE FIFTEEN CITIES: offered (3), ghosted (4), in his thought (8b), on the map (12), vanishing (23a) */
export const cities = (p: CitiesProps): React.ReactNode => {
  const { f, from, mode } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const lvS = 1 - 0.12 * Lf.lv, lvO = 1 - Lf.lv, kids: React.ReactNode[] = [];
  if (mode === "arch" || mode === "ghost" || mode === "vanish") {
    const size = p.size ?? 60;
    const g = mode === "arch" ? (p.ghostAt === undefined ? 0 : clamp01((f - p.ghostAt + 1) / 6)) : 1;
    const vl = p.vanishLen ?? 20;
    for (let i = 14; i >= 0; i--) {                     // drawn right to left: the left one lies on top
      const a = ARCH[i];
      let s = mode === "arch" ? pop5(f - from - i) : pop5((f - from - i * 0.5) * 0.9);
      let op = 1;
      if (mode === "vanish" && p.vanishAt !== undefined) {
        const t = f - (p.vanishAt + (i * vl) / 15);
        if (t >= 0) { s *= t < 1 ? 1.25 : Math.max(0, 1.25 * (1 - (t - 1) / 3)); op = t < 4 ? 1 : 0; }
        // a little gold puff where it was
        if (t >= 0 && t < 7) {
          const u = t / 7;
          kids.push(<circle key={`v${i}`} cx={a.x} cy={a.y} r={size * (0.3 + 0.5 * u)} fill="none" stroke={HC.gold} strokeWidth={5 * (1 - u)} opacity={1 - u} />);
        }
      }
      kids.push(cityIcon(`c${i}`, a.x, a.y, size, s * lvS, g, op));
    }
  } else if (mode === "map") {
    const size = p.size ?? 30, pts = p.pts ?? [];
    pts.forEach((q, i) => {
      const t = f - from - i, s = pop5(t);
      if (s <= 0) return;
      const pu = p.pulseAt !== undefined && f >= p.pulseAt && f < p.pulseAt + 8 ? (f - p.pulseAt) / 8 : -1;
      const ps = pu >= 0 ? 1 + 0.35 * Math.sin(Math.PI * pu) : 1;
      kids.push(<circle key={`g${i}`} cx={q.x} cy={q.y} r={size * 0.62 * s * ps} fill={HC.gold} opacity={0.55} />);
      if (pu >= 0) kids.push(<circle key={`p${i}`} cx={q.x} cy={q.y} r={size * (0.7 + 0.9 * pu)} fill="none" stroke={HC.gold} strokeWidth={4 * (1 - pu)} opacity={1 - pu} />);
      kids.push(cityIcon(`c${i}`, q.x, q.y, size, s * ps * lvS));
    });
  } else {
    const size = p.size ?? 64, x = p.x ?? 540, y = p.y ?? 540;
    BUBBLE_AT.forEach(([u, v], i) => kids.push(cityIcon(`c${i}`, x + u * size, y + v * size, size, pop5((f - from - 2 * i) * 0.9) * lvS)));
  }
  return <svg key={p.key ?? `cities-${mode}-${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: lvO }}>{kids}</svg>;
};

// ---------------------------------------------------------------------------------------------------- the army
/** a pawn (a soldier in a pointed helmet with a spear) in a 100 px tall box centred on (0, 0) */
const PAWN = {
  body: "M-13,-12 L13,-12 L22,42 L-22,42 Z",
  head: "M-12,-24 A12,12 0 1 0 12,-24 A12,12 0 1 0 -12,-24 Z",
  helm: "M-14,-27 L0,-46 L14,-27 Z",
  spear: "M26,44 L26,-36",
  tip: "M26,-50 L32,-34 L20,-34 Z",
};
const pawnIcon = (key: string, x: number, y: number, size: number, sy = 1) => {
  const k = size / 100, P = PAWN;
  return (
    <g key={key} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k.toFixed(4)},${(k * sy).toFixed(4)})`}>
      <g stroke={HC.ink} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" fill={HC.ink}>
        <path d={P.spear} fill="none" /><path d={P.tip} /><path d={P.body} /><path d={P.head} /><path d={P.helm} />
      </g>
      <path d={P.spear} stroke={HC.gold} strokeWidth={5} strokeLinecap="round" />
      <path d={P.tip} fill={HC.gold} />
      <g fill={HC.black} stroke={HC.gold} strokeWidth={4.5} strokeLinejoin="round"><path d={P.body} /><path d={P.head} /><path d={P.helm} /></g>
    </g>
  );
};
/** THE ARMY (line 4): three rows of eight black pawns (70 px) slide in from the left edge, one row every 6 frames from
 *  `from` (thumps on from, +6, +12; each row lands 3 frames after its start); rows at y 660, 780, 900, x 40-480 */
export const army = (p: LifeP & { rows?: number[]; x0?: number; x1?: number; size?: number }): React.ReactNode => {
  const { f, from, rows = [660, 780, 900], x0 = 40, x1 = 480, size = 70 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const kids: React.ReactNode[] = [], n = 8, step = (x1 - x0 - size * 0.7) / (n - 1);
  rows.forEach((ry, r) => {
    const t = f - (from + 6 * r);
    if (t < 0) return;
    const dx = -(x1 + 80) * (1 - eOut((t + 1) / 4)), sy = t === 3 ? 0.86 : t === 4 ? 1.06 : 1;
    for (let j = n - 1; j >= 0; j--) kids.push(pawnIcon(`p${r}-${j}`, x0 + size * 0.35 + j * step + dx, ry + (size * (1 - sy)) / 2 * 0.6, size, sy));
  });
  return <svg key={p.key ?? `army${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: 1 - Lf.lv }}>{kids}</svg>;
};

// ---------------------------------------------------------------------------------------------------- crowns
/** a flat crown (冕: a cap under a flat board, bead strings at its front) in a 100 px wide box centred on (0, 0) */
const CROWN = {
  cap: "M-24,-8 Q-24,22 0,22 Q24,22 24,-8 Z",
  board: "M-40,-20 L40,-26 L40,-16 L-40,-10 Z",
  band: "M-24,6 L24,6",
};
const crownIcon = (key: string, x: number, y: number, size: number, s: number) => {
  if (s <= 0.001) return null;
  const k = (size / 100) * s, C = CROWN, beads = [-30, -15, 0, 15, 30];
  return (
    <g key={key} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k.toFixed(4)})`}>
      <g fill={HC.ink} stroke={HC.ink} strokeWidth={14} strokeLinejoin="round"><path d={C.cap} /><path d={C.board} />
        {beads.map((bx) => <path key={bx} d={`M${bx},${-14 - bx * 0.08} L${bx},${8 - bx * 0.08}`} strokeWidth={13} strokeLinecap="round" />)}</g>
      <path d={C.cap} fill={HC.black} stroke={HC.gold} strokeWidth={5} strokeLinejoin="round" />
      <path d={C.band} stroke={HC.gold} strokeWidth={5} />
      <path d={C.board} fill={HC.black} stroke={HC.gold} strokeWidth={5} strokeLinejoin="round" />
      {beads.map((bx) => <path key={`b${bx}`} d={`M${bx},${-14 - bx * 0.08} L${bx},${8 - bx * 0.08}`} stroke={HC.gold} strokeWidth={5} strokeLinecap="round" strokeDasharray="0.1 7" />)}
    </g>
  );
};
/** the crowns' places: two rows of `per` icons, centred on x 440 (clear of the chip at the right), spacing 60 */
export const crownPts = (n = 22, rows: [number, number] = [300, 380], cx = 440, gap = 60): Pt[] => {
  const per = Math.ceil(n / 2);
  return Array.from({ length: n }, (_, i) => { const r = Math.floor(i / per), j = i % per; return { x: cx + (j - (per - 1) / 2) * gap, y: rows[r] }; });
};
/** 22 tiny flat-crown icons in two rows of 11 (y 300 and 380, x 140-740), one per frame from `from`; a seal-red cross
 *  onto each, left to right, one per frame from `crossAt` (18a) */
export const crowns = (p: LifeP & { crossAt?: number; n?: number; rows?: [number, number]; size?: number }): React.ReactNode => {
  const { f, from, n = 22, rows = [300, 380], size = 54 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const pts = crownPts(n, rows), kids: React.ReactNode[] = [], crosses: React.ReactNode[] = [];
  pts.forEach((q, i) => {
    kids.push(crownIcon(`c${i}`, q.x, q.y, size, pop5(f - from - i)));
    if (p.crossAt === undefined) return;
    const t = f - (p.crossAt + i);
    if (t < 0) return;
    const sc = t === 0 ? 1.6 : t === 1 ? 1.15 : 1, a = size * 0.42 * sc;
    const d = `M${q.x - a},${q.y - a} L${q.x + a},${q.y + a} M${q.x + a},${q.y - a} L${q.x - a},${q.y + a}`;
    crosses.push(<g key={`x${i}`} opacity={t === 0 ? 0.8 : 1}><path d={d} stroke={HC.ink} strokeWidth={19} strokeLinecap="round" /><path d={d} stroke={HC.seal} strokeWidth={10} strokeLinecap="round" /></g>);
  });
  return <svg key={p.key ?? `crowns${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: 1 - Lf.lv }}>{kids}{crosses}</svg>;
};

// ---------------------------------------------------------------------------------------------------- suns
const sunIcon = (key: string, x: number, y: number, size: number, s: number, gold: number, flash = 0) => {
  if (s <= 0.001) return null;
  const k = s * (size / 100), col = mixHex("#a8a6b2", HC.gold, gold), rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a), w = 0.28;
    rays.push(`M${(Math.cos(a - w) * 34).toFixed(1)},${(Math.sin(a - w) * 34).toFixed(1)} L${(c * 50).toFixed(1)},${(sn * 50).toFixed(1)} L${(Math.cos(a + w) * 34).toFixed(1)},${(Math.sin(a + w) * 34).toFixed(1)} Z`);
  }
  return (
    <g key={key} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k.toFixed(4)})`}>
      {flash > 0 ? <circle r={50 + 30 * flash} fill={HC.goldPale} opacity={0.6 * (1 - flash)} /> : null}
      <g fill={HC.ink} stroke={HC.ink} strokeWidth={12} strokeLinejoin="round">{rays.map((d, i) => <path key={i} d={d} />)}<circle r={30} /></g>
      <g fill={col}>{rays.map((d, i) => <path key={i} d={d} />)}</g>
      <circle r={30} fill={col} />
      <circle cx={-9} cy={-10} r={8} fill="#ffffff" opacity={0.25 + 0.35 * gold} />
    </g>
  );
};
/** five 64 px suns (grey -> gold) in a row centred on (x, y), one every `step` frames from `from` (each pops in grey and
 *  turns gold over the next 3 frames: a day lights up); `slideAt` slides them to `slideTo` over 15 frames, a flash on
 *  `flashAt` (14: over his head, step 4; 17: the day-tick at the top centre, y 270, step 3) */
export const suns = (p: LifeP & { x: number; y: number; n?: number; step?: number; slideAt?: number; slideTo?: Pt; flashAt?: number; size?: number }): React.ReactNode => {
  const { f, from, n = 5, step = 4, size = 64 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const sl = p.slideAt !== undefined && p.slideTo ? eInOut((f - p.slideAt) / 15) : 0;
  const cx = lerp(p.x, p.slideTo?.x ?? p.x, sl), cy = lerp(p.y, p.slideTo?.y ?? p.y, sl), gap = size * 1.32;
  const fl = p.flashAt !== undefined && f >= p.flashAt && f < p.flashAt + 8 ? (f - p.flashAt) / 8 : 0;
  const kids: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const t = f - (from + i * step), s = springAt(f, from + i * step, PUNCH) * (1 + (fl > 0 ? 0.22 * Math.sin(Math.PI * fl) : 0)) * (1 - 0.1 * Lf.lv);
    if (t < 0) continue;
    kids.push(sunIcon(`s${i}`, cx + (i - (n - 1) / 2) * gap, cy, size, s, clamp01((t - 1) / 3), fl));
  }
  return <svg key={p.key ?? `suns${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: 1 - Lf.lv }}>{kids}</svg>;
};

// ---------------------------------------------------------------------------------------------------- the stage
const CURTAIN = "#a3232b", CURTAIN_DARK = "#6e141c";
/** the left curtain: a swag across the top-left corner (kept above y 180 where the source tag lies) and a narrow drape
 *  down the left edge (x < 36) to y 720, gold trim and a tassel; the right one is its mirror (above y 200 over the chip) */
const curtainL = (right: boolean) => {
  const X = (x: number) => (right ? 1080 - x : x), yEnd = right ? 196 : 176;
  const body = `M${X(0)},0 L${X(470)},0 C${X(420)},${yEnd * 0.55} ${X(300)},${yEnd * 0.95} ${X(150)},${yEnd} C${X(90)},${yEnd + 4} ${X(46)},${yEnd + 20} ${X(34)},${yEnd + 60} L${X(30)},700 C${X(22)},716 ${X(8)},722 ${X(0)},726 Z`;
  const fold1 = `M${X(330)},0 C${X(290)},${yEnd * 0.5} ${X(200)},${yEnd * 0.8} ${X(110)},${yEnd * 0.86}`;
  const fold2 = `M${X(190)},0 C${X(160)},${yEnd * 0.4} ${X(90)},${yEnd * 0.6} ${X(20)},${yEnd * 0.7}`;
  const trim = `M${X(470)},0 C${X(420)},${yEnd * 0.55} ${X(300)},${yEnd * 0.95} ${X(150)},${yEnd} C${X(90)},${yEnd + 4} ${X(46)},${yEnd + 20} ${X(34)},${yEnd + 60} L${X(30)},700`;
  return (
    <g key={right ? "R" : "L"}>
      <path d={body} transform="translate(0,10)" fill={HC.shadow} />
      <path d={body} fill={CURTAIN} stroke={HC.ink} strokeWidth={8} strokeLinejoin="round" />
      <path d={fold1} fill="none" stroke={CURTAIN_DARK} strokeWidth={10} strokeLinecap="round" />
      <path d={fold2} fill="none" stroke={CURTAIN_DARK} strokeWidth={10} strokeLinecap="round" />
      <path d={trim} fill="none" stroke={HC.gold} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${X(18)},700 L${X(18)},752`} stroke={HC.ink} strokeWidth={14} strokeLinecap="round" />
      <path d={`M${X(18)},700 L${X(18)},752`} stroke={HC.gold} strokeWidth={6} strokeLinecap="round" />
      <circle cx={X(18)} cy={760} r={13} fill={HC.gold} stroke={HC.ink} strokeWidth={6} />
    </g>
  );
};
/** the valance across the top edge (y 0-80): scallops in red with a gold hem */
const valance = () => {
  const n = 6, w = 1080 / n; let d = "M0,0 L1080,0 L1080,40";
  for (let i = n - 1; i >= 0; i--) d += ` Q${(i + 0.5) * w},96 ${i * w},40`;
  d += " Z";
  let hem = "M1080,40"; for (let i = n - 1; i >= 0; i--) hem += ` Q${(i + 0.5) * w},96 ${i * w},40`;
  return (
    <g key="val">
      <path d={d} transform="translate(0,8)" fill={HC.shadow} />
      <path d={d} fill={CURTAIN} stroke={HC.ink} strokeWidth={8} strokeLinejoin="round" />
      <path d={hem} fill="none" stroke={HC.gold} strokeWidth={8} />
      {Array.from({ length: n - 1 }, (_, i) => <circle key={i} cx={(i + 1) * w} cy={44} r={11} fill={HC.gold} stroke={HC.ink} strokeWidth={5} />)}
    </g>
  );
};
/** THE STAGE (V3, 13-14): outside a soft circle (centre `at`, radius `r` px = 0.55 m projected) the picture darkens
 *  45 % over 6 frames from `from`, a pale light cone from the top edge, red-and-gold curtain swags drop into the top
 *  corners; it lifts from `out` (10 frames: the curtains fly up, the dark clears). The shot gives the circle every
 *  frame (it slides king -> envoy 1094-1102). The curtains keep off the source tag and the chip; the dark lies over
 *  everything under the shot's overlays (the HUD too, at 55 %). */
export const stage = (p: LifeP & { at: Pt; r: number }): React.ReactNode => {
  const { f, from, at, r } = p, out = outOf(p), Lf = life(f, from, out, 10);
  if (!Lf) return null;
  const kin = eOut((Lf.t + 1) / 6), lift = Lf.lv, dark = 0.45 * kin * (1 - eIn(lift * 1.2));
  const drop = -320 * (1 - eOut((Lf.t + 1) / 6)) - 460 * eIn(lift);
  const x = at.x.toFixed(1), y = at.y.toFixed(1), r0 = (r * 0.82).toFixed(1), r1 = (r * 1.3).toFixed(1);
  const coneTop = r * 0.32 + 30;
  const cone = `polygon(${(at.x - coneTop).toFixed(1)}px 0px, ${(at.x + coneTop).toFixed(1)}px 0px, ${(at.x + r).toFixed(1)}px ${y}px, ${(at.x - r).toFixed(1)}px ${y}px)`;
  return (
    <div key={p.key ?? `stage${from}`} style={FULL}>
      <div style={{ ...FULL, background: `radial-gradient(circle at ${x}px ${y}px, rgba(8,6,14,0) 0px, rgba(8,6,14,0) ${r0}px, rgba(8,6,14,${dark.toFixed(3)}) ${r1}px)` }} />
      <div style={{ ...FULL, clipPath: cone, background: "linear-gradient(to bottom, rgba(255,248,222,0.26), rgba(255,248,222,0.07))", opacity: kin * (1 - lift) }} />
      <div style={{ ...FULL, background: `radial-gradient(ellipse ${(r * 1.05).toFixed(1)}px ${(r * 0.95).toFixed(1)}px at ${x}px ${y}px, rgba(255,246,214,0.12), rgba(255,246,214,0) 100%)`, opacity: kin * (1 - lift) }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", transform: `translateY(${drop.toFixed(1)}px)` }}>
        {curtainL(false)}{curtainL(true)}{valance()}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- the bill
/** the bill's strings (22) */
export const BILL_TEXT = {
  title: L("账单", "THE BILL"), qin: L("秦 → 赵　十五城", "Qin → Zhao: 15 cities"), zhao: L("赵 → 秦　和氏璧", "Zhao → Qin: the jade"),
};
/** the bill's box: 660 x 400 px, centred on (x, y) (default 440, 436: x 110-770, y 236-636, clear of the chip and the
 *  source tag; 22's envoy walks under it) */
export const BILL_W = 660, BILL_H = 400;
const SLAT_H = 112, SLAT_GAP = 12, CORD_IN = 64, ZERO_IN = 84, TEXT_IN = 96;
/** the text size of a slat row, fitted to the room between the left cord and the 「0」 */
export const billFit = (text: string, size: number) => Math.min(size, Math.floor((size * (BILL_W - TEXT_IN - 2 * ZERO_IN - 10)) / Math.max(1, textW(text, size))));
/** THE BILL (V6, 22): bamboo slats (竹简) bound by two cords slide up into the box (10 frames from `from`); a red 「0」
 *  stamps onto slat 1 on zeroAt[0], slat 2 on zeroAt[1]; slides away down from `out` (5 frames) */
export const bill = (p: LifeP & { zeroAt?: [number, number]; x?: number; y?: number }): React.ReactNode => {
  const { f, from, x = 440, y = 436 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const up = eOut((Lf.t + 1) / 10), dy = 300 * (1 - up) + 240 * eIn(Lf.lv), op = clamp01((Lf.t + 1) / 4) * (1 - Lf.lv);
  const x0 = -BILL_W / 2, x1 = BILL_W / 2, y0 = -BILL_H / 2 + (BILL_H - (3 * SLAT_H + 2 * SLAT_GAP)) / 2;
  const kids: React.ReactNode[] = [];
  const rows = [BILL_TEXT.title, BILL_TEXT.qin, BILL_TEXT.zhao];
  rows.forEach((txt, i) => {
    const sy = y0 + i * (SLAT_H + SLAT_GAP), cy = sy + SLAT_H / 2, seed = i * 7 + 3;
    kids.push(<rect key={`sh${i}`} x={x0} y={sy + 9} width={BILL_W} height={SLAT_H} rx={18} fill={HC.shadow} />);
    kids.push(<rect key={`s${i}`} x={x0} y={sy} width={BILL_W} height={SLAT_H} rx={18} fill={HC.bamboo} stroke={HC.ink} strokeWidth={7} />);
    kids.push(<rect key={`hl${i}`} x={x0 + 14} y={sy + 10} width={BILL_W - 28} height={14} rx={7} fill={HC.bambooLight} opacity={0.8} />);
    // the bamboo's nodes: two darker rings across the slat, a little apart on each slat
    [0.3 + 0.08 * hash01(seed), 0.68 + 0.08 * hash01(seed, 1)].forEach((u, k) => kids.push(<path key={`n${i}-${k}`} d={`M${x0 + BILL_W * u},${sy + 6} L${x0 + BILL_W * u},${sy + SLAT_H - 6}`} stroke={HC.bambooDark} strokeWidth={5} opacity={0.55} />));
    if (i === 0) {
      const size = EN ? 52 : 62;
      kids.push(svgText(`t${i}`, txt, 0, cy + 2, size, HC.ink, { ls: EN ? 4 : 18 }));
    } else {
      const size = billFit(txt, EN ? 42 : 52);
      kids.push(svgText(`t${i}`, txt, x0 + TEXT_IN, cy + 2, size, HC.ink, { anchor: "start" }));
    }
  });
  // the two cords over the slats, with a knot between each pair
  [x0 + CORD_IN, x1 - CORD_IN].forEach((cx, k) => {
    kids.push(<path key={`c${k}`} d={`M${cx},${y0 - 14} L${cx},${y0 + 3 * SLAT_H + 2 * SLAT_GAP + 14}`} stroke={HC.ink} strokeWidth={15} strokeLinecap="round" />);
    kids.push(<path key={`cc${k}`} d={`M${cx},${y0 - 14} L${cx},${y0 + 3 * SLAT_H + 2 * SLAT_GAP + 14}`} stroke={HC.cord} strokeWidth={8} strokeLinecap="round" />);
    for (let i = 0; i < 2; i++) { const ky = y0 + (i + 1) * SLAT_H + i * SLAT_GAP + SLAT_GAP / 2; kids.push(<ellipse key={`k${k}${i}`} cx={cx} cy={ky} rx={11} ry={8} fill={HC.cord} stroke={HC.ink} strokeWidth={4} />); }
  });
  // the 「0」 seals, slapped on
  const zl = stampLayout({ text: "0", size: 60, gloss: false });
  (p.zeroAt ?? []).forEach((za, i) => {
    const t = f - za;
    if (t < 0) return;
    const sc = t === 0 ? 1.7 : t === 1 ? 1.28 : t === 2 ? 0.95 : t === 3 ? 1.03 : 1, sh = t >= 2 && t < 8 ? [0, 8, -6, 4, -2, 1][t - 2] : 0;
    const cy = y0 + (i + 1) * (SLAT_H + SLAT_GAP) + SLAT_H / 2;
    kids.push(<g key={`z${i}`} transform={`translate(${x1 - ZERO_IN + sh},${cy}) rotate(-8) scale(${sc})`} opacity={t === 0 ? 0.75 : 1}>{sealNodes(zl)}</g>);
  });
  return layerAt(p.key ?? `bill${from}`, x, y + dy, { op }, svg0("s", ...kids));
};
/** the box the bill takes at (x, y) */
export const billRect = (x = 440, y = 436) => ({ x0: x - BILL_W / 2 - 8, y0: y - BILL_H / 2 - 8, x1: x + BILL_W / 2 + 8, y1: y + BILL_H / 2 + 16 });
