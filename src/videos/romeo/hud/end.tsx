// hud/end.tsx: THE END CARD, after the camera's power-off, in the film's skin (hud/skin.ts, 「信」 the letter): the
// letter that never arrived, unfolded on the film's black, with the three closing lines in the quill hand and the
// truth seal 演绎 pressed in red wax; the title's heart seal sits whole on its top edge. A pure function of the frame.
//
//   <EndCard f from lineAt? sealAt? to? lines? seal? backdrop? id? />
//     f         the film frame
//     from      the frame the letter unfolds (after the power-off has gone to black)
//     lineAt    [a, b, c]: frames after `from` at which each of the three lines starts to be written (default
//               END.lineAt = [10, 58, 122]: 1.6 s to read the first, 2.1 s for the long second). Each line is written
//               in about half a second.
//     sealAt    frames after `from` at which 演绎 thunks down (default: 26 frames after the third line starts)
//     to        its last frame (default: it stays to the film's end; it holds, it does not leave)
//     lines     other words: [line 1, [line 2 row 1, line 2 row 2], line 3] (default END.lines)
//     seal      the truth seal's two characters (default "演绎")
//     backdrop  true (default) draws the film's black (skin.ts TONE.black) under the letter; false = the letter alone
//     id        the prefix of its SVG ids (default "romeo-end")
//   END.box     the box the letter takes (film px): x 110..890, y 520..1222
//
// THE WORDS (script):  从相识到墓穴，一共四天。 (四天 in the red ink)
//                      原著里，信没有送到，/ 两个人都没能活下来。 (smaller, the faded ink)
//                      这个结局，是记者扔出来的。 (one red stroke under 扔出来的)       seal: 演绎
// WHERE: every word inside x 140..861, y 620..1050; nothing below y 1222. Centred a little above the frame's middle,
// clear of the app's buttons (x >= 890 from y 1000) and of the post's text (from y 1505).
// SOUNDS: "letter unfold" (two soft creaks of paper) on `from`; a faint "quill writing" under each line; the last
// "wax thunk" on the seal, left to ring.
import React from "react";
import { part, clamp01, ring, type Rect } from "../../../kit/overlay";
import { C, TONE, flapIn, thunk, breathe } from "./skin";
import { letterDefs, sheet, wax, quill, quillRuns, swashPath } from "./marks";

/** the end card's numbers */
export const END = {
  box: { x0: 110, y0: 520, x1: 890, y1: 1222 } as Rect, cx: 500, px: 54, px2: 46,
  lineAt: [10, 58, 122] as [number, number, number], sealAfter: 26,
  lines: ["从相识到墓穴，一共四天。", ["原著里，信没有送到，", "两个人都没能活下来。"], "这个结局，是记者扔出来的。"] as [string, [string, string], string],
  /** the words picked out: in line 1 (red ink), in line 3 (a red stroke under it) */ red: "四天", under: "扔出来的",
  y: [134, 282, 344, 490], sealR: 62,
} as const;
/** split a line round a word: [before, word, after] (the word empty when the line does not hold it) */
const cut = (s: string, w: string): [string, string, string] => { const i = s.indexOf(w); return i < 0 ? [s, "", ""] : [s.slice(0, i), w, s.slice(i + w.length)]; };

export const EndCard: React.FC<{ f: number; from: number; lineAt?: [number, number, number]; sealAt?: number; to?: number; lines?: [string, [string, string], string]; seal?: string; backdrop?: boolean; id?: string }> = (props) => {
  const { f, from, lineAt = END.lineAt, to, lines = END.lines, seal = "演绎", backdrop = true, id = "romeo-end" } = props;
  if (f < from || (to !== undefined && f > to)) return null;
  const t = f - from, E = END, r = E.box, cy = (r.y0 + r.y1) / 2, sealAt = props.sealAt ?? lineAt[2] + E.sealAfter;
  const A = flapIn(t, 0, 6, -4), fold = part(t, 0, 8), sy = 0.36 + 0.64 * (fold >= 1 ? 1 : 1 - Math.pow(1 - fold, 3)), sk = thunk(t, sealAt, 2), br = breathe(t, 9);
  const [a1, w1, b1] = cut(lines[0], E.red), [a3, w3, b3] = cut(lines[2], E.under);
  const row1 = quillRuns(id, "l1", [{ s: a1, fill: C.ink }, { s: w1, fill: TONE.inkRed }, { s: b1, fill: C.ink }].filter((x) => x.s), E.cx, r.y0 + E.y[0], E.px, { seed: 2, k: part(t, lineAt[0], 14) });
  const row3 = quillRuns(id, "l3", [{ s: a3, fill: C.ink }, { s: w3, fill: C.ink }, { s: b3, fill: C.ink }].filter((x) => x.s), E.cx, r.y0 + E.y[3], E.px, { seed: 5, k: part(t, lineAt[2], 14) });
  const u = w3 ? row3.spans[a3 ? 1 : 0] : null, sx = r.x1 - 122, sY = r.y1 - 80;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <defs>{letterDefs(id)}</defs>
      {backdrop ? <rect x={0} y={0} width={1080} height={1920} fill={TONE.black} /> : null}
      <g opacity={A.o} transform={`translate(${E.cx},${(cy + br.y * 0.7 + 1.2 * sk.jolt).toFixed(1)}) rotate(${(-1 + A.rot + br.rot * 0.6).toFixed(2)}) scale(${A.s.toFixed(3)},${(A.s * sy).toFixed(3)}) translate(${-E.cx},${-cy})`}>
        {sheet(id, "letter", r, { seed: 6, jag: 2.6, burn: 12, creases: [{ y: r.y0 + 222, a: r.x0, b: r.x1 }, { y: r.y0 + 444, a: r.x0, b: r.x1, valley: true }, { x: E.cx, a: r.y0, b: r.y1 }] }, (
          <>
            {/* the folds' shade while it opens */}
            {fold < 1 ? <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill={TONE.shadow} opacity={0.4 * (1 - fold)} /> : null}
            {row1.node}
            {quill(id, "l2a", lines[1][0], E.cx, r.y0 + E.y[1], E.px2, TONE.inkSoft, { body: true, seed: 3, k: part(t, lineAt[1], 11) })}
            {quill(id, "l2b", lines[1][1], E.cx, r.y0 + E.y[2], E.px2, TONE.inkSoft, { body: true, seed: 4, k: part(t, lineAt[1] + 11, 11) })}
            {row3.node}
            {u ? <path d={swashPath(u.x0 + 2, r.y0 + E.y[3] + 37, u.x1 - 2, r.y0 + E.y[3] + 33, 6, 9, part(t, lineAt[2] + 14, 5))} fill={TONE.inkRed} filter={`url(#${id}-nib46)`} /> : null}
          </>
        ))}
        {/* the letter's own seal, the title's heart, whole: it reached someone this time */}
        {wax(id, "heart", E.cx, r.y0 + 6, 31, { emblem: "heart", rot: -5, seed: 2, drips: 1, glint: clamp01((t - 30) / 9) })}
        {sk.on && t < sealAt + 8 ? ring("sr", sx, sY, 56, 170, sk.ring, TONE.paperHi, 10) : null}
        {wax(id, "seal", sx, sY, E.sealR, { rows: [seal], rot: 8, seed: 5, drips: 2, scale: sk.s, squash: sk.squash, glint: sk.glint })}
      </g>
    </svg>
  );
};
