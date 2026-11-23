// hud/notes.tsx: HER NOTES (花字 / 记者OS: what she thinks and does not say), in the film's skin (hud/skin.ts, 「信」 the
// letter): a scrap torn off a letter, slapped onto the picture, her words in the quill hand with one red stroke under
// the punch word. A pure function of the frame.
//
//   <Note f from big small? x y to? rot? tone? id? />
//     f       the film frame
//     from    the frame it lands: in the gap AFTER a line, never on its punch word
//     big     the punch word, at most 6 characters (it is set as large as fits, up to 112 px, or up to `size`)
//     small   a lead-in set small above it (the part of the note that is not the punch), optional
//     x, y    the centre of the punch word (film px). Keep the scrap clear of faces, the REC row and the caption
//             band: noteRect() gives its box.
//     to      its last frame (default from + NOTE.len - 1 = 41 frames: in within 6, readable 30, out over 5)
//     rot     its turn in degrees (default -4);  tone  the punch word's ink: "ink" (default), "red", "blue"
//     id      the prefix of its SVG ids (default "romeo-note"; give each note on a page its own)
//   noteRect(big, small, x, y)   the box it takes, for the overlay check (kind "effect")
//
//   THE FILM'S NOTES (script): { small: "失恋：", big: "一个白天" } · { big: "就在楼下" } · { big: "太突然？" } ·
//     { small: "月亮一月一变，", big: "他一天。" } · { small: "信里写着：", big: "她是假死" }
// MOTION: the scrap flaps in (frames 0-4), the punch word's characters land one a frame from frame 1, the red stroke is
// drawn under it (frames 4-7); it breathes; it flaps away over its last 5 frames.
// SOUND: "quill scratch" (one quick stroke on paper), on `from` + 4 (the red stroke).
import React from "react";
import { life, part, fitPx, FRAME_9x16, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, flapIn, flapOut, breathe } from "./skin";
import { letterDefs, sheet, quill, quillW, swashPath } from "./marks";

/** a note's numbers */
export const NOTE = { bigPx: 112, smallPx: 42, padX: 34, padY: 24, len: 41, rot: -4 } as const;
const INK = { ink: C.ink, red: TONE.inkRed, blue: TONE.blueDeep } as const;
/** a note's geometry: the punch word's size, the scrap's box */
export const noteLayout = (big: string, small: string | undefined, x: number, y: number, size: number = NOTE.bigPx) => {
  const N = NOTE, right = y > 1000 ? 890 : FRAME_9x16.W - FRAME_9x16.side, room = 2 * Math.min(x - FRAME_9x16.side, right - x) - 2 * N.padX;
  const px = Math.max(60, fitPx(big, size, room, SKIN.display.track * size)), bw = quillW(big, px);
  const sw = small ? quillW(small, N.smallPx, { body: true }) : 0, w = Math.max(bw, sw) + 2 * N.padX;
  const top = y - px * 0.56 - (small ? N.smallPx + 14 : 0) - N.padY, bot = y + px * 0.56 + N.padY + 6;
  return { px, bw, sw, r: { x0: x - w / 2, y0: top, x1: x + w / 2, y1: bot } as Rect, smallY: y - px * 0.56 - N.smallPx * 0.5 - 6 };
};
export const noteRect = (big: string, small: string | undefined, x: number, y: number, size?: number): Rect => { const r = noteLayout(big, small, x, y, size).r; return { x0: r.x0 - 14, y0: r.y0 - 16, x1: r.x1 + 14, y1: r.y1 + 22 }; };

export const Note: React.FC<{ f: number; from: number; big: string; small?: string; x: number; y: number; to?: number; rot?: number; tone?: keyof typeof INK; id?: string; size?: number }> = (props) => {
  const { f, from, big, small, x, y, rot = NOTE.rot, tone = "ink", id = "romeo-note", size } = props;
  const L = life(f, from, props.to ?? from + NOTE.len - 1, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, G = noteLayout(big, small, x, y, size), A = flapIn(t, 0, 4, -10), out = flapOut(L.leave, 1), br = breathe(t, 2);
  const cy = (G.r.y0 + G.r.y1) / 2, uy = y + G.px * 0.56;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: A.o * out.o }}>
      <defs>{letterDefs(id)}</defs>
      <g transform={`translate(${x},${(cy - A.lift + out.dy + br.y).toFixed(1)}) rotate(${(rot + A.rot + out.rot + br.rot).toFixed(2)}) scale(${(A.s * out.s).toFixed(3)}) translate(${-x},${-cy})`}>
        {sheet(id, "scrap", G.r, { jag: 5, step: 19, seed: 2 + big.length, shadow: "big", burn: 8 }, (
          <>
            {small ? quill(id, "small", small, x - Math.max(G.bw, G.sw) / 2 + 2, G.smallY, NOTE.smallPx, TONE.inkSoft, { anchor: "start", body: true, seed: 6, k: part(t, 1, 3) }) : null}
            {quill(id, "big", big, x, y, G.px, INK[tone], { seed: 3, k: part(t, 1, Math.max(2, [...big].length)) })}
            <path d={swashPath(x - G.bw / 2 + 4, uy + 3, x + G.bw / 2 - 2, uy - 3, 7, 10, part(t, 4, 4))} fill={tone === "red" ? C.ink : TONE.inkRed} filter={`url(#${id}-nib46)`} />
          </>
        ))}
      </g>
    </svg>
  );
};
