// hud/fact.tsx: THE FACT CARD, the sources' voice, for moments when nobody speaks, in the film's skin (hud/skin.ts,
// 「信」 the letter): a small proclamation on parchment, the kind nailed up in Verona's square, with a ruled border and
// a red wax seal hanging on two ribbons in the two houses' colours. A pure function of the frame.
//
//   <FactCard f from to rows seal? cx? cy? id? />
//     f        the film frame
//     from/to  its first and last frame. Only while nobody speaks (the caption band is empty). Reading time: about
//              0.25 s a character after it has unrolled (判决：驱逐。回来就是死。 = 12 characters: give it 3.5 s or more).
//     rows     its lines, one string a row, at most 3 rows of at most 10 characters, e.g.
//              ["判决：驱逐。", "回来就是死。"]   and   ["送信人被瘟疫封了门。", "信没出城。"]
//     seal     one character pressed in the wax (default "令", an order; e.g. "疫" for the plague card)
//     cx, cy   the card's centre (default FACT.cx, FACT.cy = 500, 1040: a two-row card then takes y 900..1262, the
//              ribbons included)
//     id       the prefix of its SVG ids (default "romeo-fact")
//   factRect(rows, cx?, cy?)   the box it takes (the seal and its ribbons included), for the overlay check (kind "card")
//
// MOTION: it unrolls from its top edge in 6 frames (the roll runs down ahead of it), the rows are written one after
// another (6 frames each, from frame 5), the ribbons drop and the seal thunks onto them 2 frames after the last row;
// it breathes; it rolls back up over its last 5 frames.
// WHERE: every word inside x 174..826 for a 10-character row at the default centre; nothing below y 1262.
// SOUNDS: "parchment unroll" (a dry crackle, 0.2 s) on `from`; "wax thunk" on the seal.
import React from "react";
import { life, part, clamp01, easeOut, fitPx, ring, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, thunk, breathe } from "./skin";
import { letterDefs, sheet, wax, quill, quillW } from "./marks";

/** the card's numbers */
export const FACT = { cx: 500, cy: 1040, px: 58, step: 1.42, padX: 62, top: 54, foot: 60, minW: 430, maxRow: 600, seal: "令", sealR: 44 } as const;
export const factLayout = (rows: string[], cx: number = FACT.cx, cy: number = FACT.cy) => {
  const F = FACT, px = Math.min(...rows.map((r) => fitPx(r, F.px, F.maxRow, SKIN.display.track * F.px)));
  const w = Math.max(F.minW, Math.max(...rows.map((r) => quillW(r, px))) + 2 * F.padX), h = Math.round(F.top + rows.length * px * F.step + F.foot);
  return { px, w, h, r: { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 } as Rect, seal: { x: cx + w / 2 - 70, y: cy + h / 2 - 22 } };
};
export const factRect = (rows: string[], cx?: number, cy?: number): Rect => { const G = factLayout(rows, cx, cy); return { x0: G.r.x0 - 6, y0: G.r.y0 - 6, x1: G.r.x1 + 8, y1: G.seal.y + 104 }; };

export const FactCard: React.FC<{ f: number; from: number; to: number; rows: string[]; seal?: string; cx?: number; cy?: number; id?: string }> = ({ f, from, to, rows, seal = FACT.seal, cx, cy, id = "romeo-fact" }) => {
  const L = life(f, from, to, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, F = FACT, G = factLayout(rows, cx, cy), r = G.r, mx = (r.x0 + r.x1) / 2;
  const show = Math.min(easeOut(part(t, 0, 6)), 1 - L.leave), yCut = r.y0 + (G.h + 24) * show, rolling = show < 1;
  const sealAt = 5 + rows.length * 6 + 2, sk = thunk(t, sealAt), rib = clamp01((t - sealAt + 3) / 4) * (L.leave > 0 ? 1 - L.leave : 1), br = breathe(t, 6);
  const ribbon = (dx: number, len: number, col: string, deep: string, rot: number) => (
    <g transform={`translate(${G.seal.x + dx},${G.seal.y + 6}) rotate(${rot}) scale(1,${rib.toFixed(3)})`}>
      <path d={`M-11,0 L11,0 L11,${len} L0,${len - 12} L-11,${len} Z`} fill={col} stroke={deep} strokeWidth={1.6} strokeLinejoin="round" />
      <line x1={-6} y1={2} x2={-6} y2={len - 7} stroke={TONE.gold} strokeWidth={1.6} opacity={0.85} />
    </g>
  );
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <defs>
        {letterDefs(id)}
        <clipPath id={`${id}-roll`}><rect x={r.x0 - 40} y={r.y0 - 40} width={G.w + 80} height={Math.max(0, yCut - r.y0 + 40)} /></clipPath>
        <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TONE.paperHi} /><stop offset="0.45" stopColor={C.paper} /><stop offset="1" stopColor={TONE.paperEdge} />
        </linearGradient>
      </defs>
      <g transform={`translate(0,${br.y.toFixed(1)}) rotate(${(-0.8 + br.rot).toFixed(2)} ${mx} ${r.y0})`}>
        <g clipPath={rolling ? `url(#${id}-roll)` : undefined}>
          {sheet(id, "card", r, { rule: 13, burn: 9, seed: 5, jag: 2 }, (
            <>
              {/* the head ornament: two short rules and a lozenge, no words */}
              <g stroke={TONE.inkSoft} strokeWidth={2.2} opacity={0.8} fill={TONE.inkRed}>
                <line x1={mx - 96} y1={r.y0 + 36} x2={mx - 16} y2={r.y0 + 36} /><line x1={mx + 16} y1={r.y0 + 36} x2={mx + 96} y2={r.y0 + 36} />
                <path d={`M${mx},${r.y0 + 28} L${mx + 8},${r.y0 + 36} L${mx},${r.y0 + 44} L${mx - 8},${r.y0 + 36} Z`} stroke="none" />
              </g>
              {rows.map((s, i) => quill(id, `r${i}`, s, mx, r.y0 + F.top + (i + 0.5) * G.px * F.step, G.px, C.ink, { seed: 2 + i * 3, k: part(t, 5 + i * 6, 6) }))}
            </>
          ))}
        </g>
        {/* the roll running down ahead of the sheet */}
        {rolling && show > 0 ? (
          <g filter={`url(#${id}-shs)`}>
            <rect x={r.x0 - 8} y={yCut - 13} width={G.w + 16} height={26} rx={13} fill={`url(#${id}-bar)`} stroke={TONE.paperEdge} strokeWidth={1.5} />
            <ellipse cx={r.x0 - 4} cy={yCut} rx={5} ry={12} fill={TONE.paperLo} stroke={TONE.paperEdge} strokeWidth={1.2} />
            <ellipse cx={r.x1 + 4} cy={yCut} rx={5} ry={12} fill={TONE.paperLo} stroke={TONE.paperEdge} strokeWidth={1.2} />
          </g>
        ) : null}
        {/* the seal on its two ribbons: Montague blue, Capulet red */}
        {rib > 0 ? <g filter={`url(#${id}-shs)`}>{ribbon(-14, 86, C.lead, TONE.blueDeep, 10)}{ribbon(13, 94, C.accent, TONE.redDeep, -8)}</g> : null}
        {sk.on && t < sealAt + 8 ? ring("sr", G.seal.x, G.seal.y, 40, 116, sk.ring, TONE.paperHi, 8) : null}
        {wax(id, "seal", G.seal.x, G.seal.y, F.sealR, { rows: [seal], rot: -7, seed: 3, scale: sk.s * (L.leave > 0 ? 1 - L.leave : 1), squash: sk.squash, glint: sk.glint })}
      </g>
    </svg>
  );
};
