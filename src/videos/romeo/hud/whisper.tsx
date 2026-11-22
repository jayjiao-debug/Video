// hud/whisper.tsx: HER WHISPER, the aside marked 悄悄说, in the film's skin (hud/skin.ts, 「信」 the letter): a note torn
// off a letter and passed under the lens while the lead carries on unaware. A pure function of the frame.
//
//   <WhisperNote f from to text cx? bottom? id? />
//     f        the film frame
//     from/to  the first and last frame of her line (it arrives on her first word; give `to` about 6 frames after her
//              voice ends). The film hides the normal subtitle on these frames: the note REPLACES it, never both.
//     text     her line: a string (broken into rows of at most 13 characters) or the rows themselves; at most 2 rows
//     cx       the note's centre x (default WHISPER.cx = 498; it is kept inside x 110..886 whatever you give)
//     bottom   the y of the note's lower edge (default 1396: the two wax drips under it then end above y 1460)
//     id       the prefix of its SVG ids (default "romeo-whisper")
//   whisperRect(text, cx?, bottom?)   the box it takes (the tag and the drips included), for the overlay check
//
// THE LOOK: a scrap of parchment with a straight top (the letter's own edge) and a torn foot; her words in the quill
// hand in ink, 54 px (a size under the 66 px dialogue: it is a whisper; shrunk to fit, never under 42); the tag 悄悄说 on
// a small wax-red ribbon tucked over the top left corner; two drips of red wax trail from its lower left toward the
// bottom of the frame (toward her, behind the lens).
// MOTION: it flaps in from below the lens in 5 frames (a little large, turning), her words written across it as it
// lands (frames 2-7); it breathes while it holds; it flaps away over its last 5 frames.
// WHERE: the caption band (x 110..886, about y 1262..1450), where the camera plans already keep faces out.
// SOUND: "paper slip" (a small soft flap, quieter than the title's), once, on `from`.
import React from "react";
import { life, part, clamp01, wrapRows, fitPx, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, WAX, flapIn, flapOut, breathe } from "./skin";
import { letterDefs, sheet, quill, quillW, blobPath } from "./marks";

/** the note's numbers */
export const WHISPER = { px: 54, minPx: 42, step: 1.26, padX: 34, padY: 22, cx: 498, bottom: 1396, x0: 110, x1: 886, rot: -1.2, tag: "悄悄说", tagPx: 27, rowMax: 13 } as const;
/** the note's geometry for a line */
export const whisperLayout = (text: string | string[], cx: number = WHISPER.cx, bottom: number = WHISPER.bottom) => {
  const N = WHISPER, rows = (Array.isArray(text) ? text : wrapRows(text, N.rowMax)).slice(0, 2), room = N.x1 - N.x0 - 2 * N.padX;
  const px = Math.max(N.minPx, Math.min(...rows.map((r) => fitPx(r, N.px, room, SKIN.display.track * N.px))));
  const w = Math.max(250, Math.max(...rows.map((r) => quillW(r, px))) + 2 * N.padX), h = Math.round(rows.length * px * N.step + 2 * N.padY - 10);
  const x0 = Math.max(N.x0, Math.min(N.x1 - w, cx - w / 2));
  return { rows, px, w, h, x0, y0: bottom - h };
};
export const whisperRect = (text: string | string[], cx?: number, bottom?: number): Rect => {
  const G = whisperLayout(text, cx, bottom);
  return { x0: G.x0 - 4, y0: G.y0 - 30, x1: G.x0 + G.w + 6, y1: G.y0 + G.h + 54 };
};

export const WhisperNote: React.FC<{ f: number; from: number; to: number; text: string | string[]; cx?: number; bottom?: number; id?: string }> = ({ f, from, to, text, cx, bottom, id = "romeo-whisper" }) => {
  const L = life(f, from, to, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, N = WHISPER, G = whisperLayout(text, cx, bottom), A = flapIn(t, 0, 5, 6), out = flapOut(L.leave, -1), br = breathe(t, 4);
  const n = G.rows.reduce((a, r) => a + [...r].length, 0), tagW = quillW(N.tag, N.tagPx, { body: true }) + 30;
  const ox = G.x0 + 70, oy = G.y0 + G.h;          // it turns about its lower left, where the drips leave it
  let done = 0;
  const drip = (x: number, y: number, r: number, seed: number, k: number) => k <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${k.toFixed(3)})`}>
      <path d={blobPath(r, seed, 1)} fill={TONE.shadow} opacity={0.4} transform="translate(1.5,3)" />
      <path d={blobPath(r, seed, 1)} fill={`url(#${id}-wax-red)`} stroke={WAX.red.deep} strokeWidth={1.6} />
      <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.32} ry={r * 0.18} fill="#fff" opacity={0.4} transform={`rotate(-30 ${-r * 0.3} ${-r * 0.35})`} />
    </g>
  );
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: A.o * out.o }}>
      <defs>{letterDefs(id)}</defs>
      {drip(G.x0 + 74, oy + 22, 12, 3, clamp01(part(t, 4, 3)) * (1 - out.k))}
      {drip(G.x0 + 50, oy + 43, 7.5, 5, clamp01(part(t, 6, 3)) * (1 - out.k))}
      <g transform={`translate(${ox},${(oy + A.lift + out.dy * -0.6 + br.y * 0.6).toFixed(1)}) rotate(${(N.rot + A.rot + out.rot + br.rot).toFixed(2)}) scale(${(A.s * out.s).toFixed(3)}) translate(${-ox},${-oy})`}>
        {sheet(id, "note", { x0: G.x0, y0: G.y0, x1: G.x0 + G.w, y1: G.y0 + G.h }, { sides: ["bottom"], jag: 7, step: 17, seed: 8, shadow: "big", burn: 7 }, (
          <>
            {G.rows.map((r, i) => {
              const k = clamp01((part(t, 2, 6) * n - done) / [...r].length);
              done += [...r].length;
              return quill(id, `r${i}`, r, G.x0 + G.w / 2, G.y0 + N.padY + G.px * 0.5 + i * G.px * N.step, G.px, C.ink, { seed: 3 + i * 4, k });
            })}
          </>
        ))}
        {/* the tag: a wax-red ribbon tucked over the top left corner */}
        <g transform={`translate(${G.x0 + 22},${G.y0 - 21}) rotate(-3)`}>
          <g filter={`url(#${id}-shs)`}>
            <path d={`M0,0 L${tagW},0 L${tagW - 9},20 L${tagW},40 L0,40 Z`} fill={C.accent} stroke={TONE.redDeep} strokeWidth={2} strokeLinejoin="round" filter={`url(#${id}-deckle)`} />
          </g>
          <line x1={5} y1={5} x2={tagW - 12} y2={5} stroke={TONE.gold} strokeWidth={1.6} opacity={0.85} />
          <line x1={5} y1={35} x2={tagW - 12} y2={35} stroke={TONE.gold} strokeWidth={1.6} opacity={0.85} />
          {quill(id, "tag", N.tag, 12, 20.5, N.tagPx, TONE.paperHi, { anchor: "start", body: true, seed: 2 })}
        </g>
      </g>
    </svg>
  );
};
