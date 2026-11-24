// hud/tally.tsx: THE 插手 TALLY, the film's running counter, in its skin (hud/skin.ts, 「信」 the letter): a slip of
// parchment under the REC row with 插手 in the quill hand and the count pressed in a red wax seal. Her rule is 我只拍，
// 不插手; the seal says 0 until the tomb. A pure function of the frame.
//
//   <MeddleTally f stampAt blinks? changeAt? until? x? y? scale? id? />
//     f         the film frame
//     stampAt   the frame it stamps in: just AFTER her first refusal's line ends (the slip flaps in, 插手 is written,
//               the wax 0 thunks down 8 frames later)
//     blinks    the frames of her later refusals (again after the line): the seal swells twice and a light crosses it.
//               No new stamp. Each blink is 14 frames.
//     changeAt  the frame of the change at the tomb (after the camera is thrown): the 0 is struck through with one
//               stroke of ink (3 frames), then a FRESH 1 thunks down beside it (frame changeAt + 5), bigger than any
//               thunk before, wax flying: 插手 1
//     until     its last frame (default: it stays to the end); it flaps away over its last 5 frames
//     x, y      the slip's top left (default TALLY.x, TALLY.y = 736, 350: top right, under the REC row, its right edge
//               on the battery's x 970);  scale  its size (default 1; e.g. 1.5 when it is seen through the shard)
//     id        the prefix of its SVG ids (default "romeo-tally")
//   tallyRect(x?, y?, scale?)   the box it takes (the second seal's overhang included), for the overlay check
//
// WHERE: x 732..970, y 344..454 at the defaults: clear of the REC display (it ends at y 330), above every face.
// SOUNDS: stamp-in = "paper flap" then "wax thunk"; a blink = a soft double "tock" (a knuckle on wax); the change =
// "quill scratch" (the strike) then the film's biggest "wax thunk" with a small crack of the old seal.
import React from "react";
import { part, clamp01, easeOut, ring, burst, hash01, type Rect } from "../../../kit/overlay";
import { C, TONE, WAX, flapIn, flapOut, thunk } from "./skin";
import { letterDefs, sheet, wax, quill, swashPath } from "./marks";

// v7 (the owner on the v6.1 cut: "currently it looks like 2 halfs, make it 1, also centered the stamp number on the
// right"): the slip has no fold down its middle any more (the crease at x 108 cut it in two), and the seal sits in the
// middle of the room right of 插手 (x 168; it was at 143, hard against the word). The fresh 1 lands ON the struck 0, in
// the same place (until v6 beside it, hanging over the slip's right edge).
/** the tally's numbers: the slip's top left and size, the two seals' places on it (px in the slip's own frame) */
export const TALLY = { x: 736, y: 350, w: 232, h: 96, rot: 1.2, zero: { x: 168, y: 48, r: 36 }, one: { x: 168, y: 48, r: 40 }, wordX: 15, wordPx: 43 } as const;
/** the beats: the stamp-in's wax, a blink's length, the change's strike and new seal (frames after their own start) */
export const TALLY_BEATS = { wax: 8, blink: 14, strike: 0, one: 5 } as const;
export const tallyRect = (x: number = TALLY.x, y: number = TALLY.y, scale = 1): Rect => ({ x0: x - 4 * scale, y0: y - 6 * scale, x1: x + (TALLY.w + 2) * scale, y1: y + (TALLY.h + 8) * scale });

export const MeddleTally: React.FC<{ f: number; stampAt: number; blinks?: number[]; changeAt?: number; until?: number; x?: number; y?: number; scale?: number; id?: string }> = (props) => {
  const { f, stampAt, blinks = [], changeAt, until, x = TALLY.x, y = TALLY.y, scale = 1, id = "romeo-tally" } = props;
  if (f < stampAt || (until !== undefined && f > until)) return null;
  const t = f - stampAt, T = TALLY, B = TALLY_BEATS;
  const A = flapIn(t, 0, 5, 7), out = flapOut(until === undefined ? 0 : clamp01((f - (until - 5)) / 5), 1), zero = thunk(t, B.wax);
  // a blink: the seal swells twice, a light crosses it, a soft ring
  const b = blinks.map((at) => f - at).find((d) => d >= 0 && d < B.blink);
  const swell = b === undefined ? 1 : 1 + 0.2 * Math.abs(Math.sin((Math.PI * b) / 7)) * (b < 7 ? 1 : 0.6);
  // the change: the strike, then the fresh 1
  const c = changeAt === undefined ? -1 : f - changeAt, changed = c >= 0, one = thunk(c, B.one, 2.3);
  const jolt = zero.jolt + (changed ? 1.6 * one.jolt : 0), cx = T.w / 2, cy = T.h / 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: A.o * out.o }}>
      <defs>{letterDefs(id)}</defs>
      <g transform={`translate(${x},${(y - A.lift + jolt + out.dy).toFixed(1)}) scale(${scale})`}>
        <g transform={`translate(${cx},${cy}) rotate(${(T.rot + A.rot + out.rot).toFixed(2)}) scale(${(A.s * out.s).toFixed(3)}) translate(${-cx},${-cy})`}>
          {sheet(id, "slip", { x0: 0, y0: 0, x1: T.w, y1: T.h }, { shadow: "small", burn: 6, seed: 6, jag: 1.8 },
            quill(id, "word", "插手", T.wordX, T.h / 2 + 1, T.wordPx, C.ink, { anchor: "start", seed: 4, k: part(t, 3, 3) }))}
          {/* the 0 */}
          {zero.on && t < B.wax + 8 ? ring("zr", T.zero.x, T.zero.y, 30, 84, zero.ring, TONE.paperHi, 7) : null}
          {b !== undefined ? ring("br", T.zero.x, T.zero.y, 34, 62, clamp01((b + 1) / B.blink), WAX.red.hi, 5) : null}
          <g opacity={changed && c >= B.one ? 0 : 1}>
            {wax(id, "zero", T.zero.x, T.zero.y, T.zero.r, { emblem: "0", seed: 7, rot: -5, scale: zero.s * (changed ? 1 : swell), squash: zero.squash, glint: b !== undefined ? clamp01((b + 1) / 10) : zero.glint })}
          </g>
          {/* the strike through the 0: one stroke of the quill, top right to bottom left */}
          {changed && c < B.one ? <path d={swashPath(T.zero.x + 44, T.zero.y - 40, T.zero.x - 46, T.zero.y + 40, 5, 11, easeOut(part(c, B.strike, 3)))} fill={C.ink} filter={`url(#${id}-nib46)`} /> : null}
          {/* the fresh 1: the film's biggest thunk */}
          {changed && one.on ? (
            <>
              {ring("or", T.one.x, T.one.y, 36, 130, one.ring, TONE.paperHi, 10)}
              {burst("ob", T.one.x, T.one.y, 9, 44, 120, clamp01((c - B.one + 1) / 9), { color: WAX.red.mid, width: 7, seed: 3 })}
              {c - B.one < 12 ? <g fill={WAX.red.mid}>{Array.from({ length: 5 }, (_, i) => { const a = hash01(i, 71) * Math.PI * 2, k = easeOut(clamp01((c - B.one + 1) / 10)), d = 46 + 70 * k * (0.6 + 0.4 * hash01(i, 73)); return <circle key={i} cx={(T.one.x + Math.cos(a) * d).toFixed(1)} cy={(T.one.y + Math.sin(a) * d * 0.8 + 18 * k * k).toFixed(1)} r={(2.5 + 3.5 * hash01(i, 75)) * (1 - 0.5 * k)} opacity={1 - k * k} />; })}</g> : null}
              {wax(id, "one", T.one.x, T.one.y, T.one.r, { emblem: "1", seed: 9, rot: 9, scale: one.s, squash: one.squash, glint: one.glint })}
            </>
          ) : null}
        </g>
      </g>
    </svg>
  );
};
