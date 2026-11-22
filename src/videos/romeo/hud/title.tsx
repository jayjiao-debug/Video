// hud/title.tsx: THE THEMED TITLE 「采访罗密欧与朱丽叶的一天」 in the film's skin (hud/skin.ts, 「信」 the letter). A pure
// function of the frame.
//
//   <LetterTitle f from to? y? id? />
//     f      the film frame
//     from   the frame it lands: in the gap at the end of the cold open, AFTER Romeo's blank 「……朱丽叶是谁？」 has ended
//            (never on the line). The landing is the paper flap.
//     to     its last frame (default from + TITLE.len - 1 = 48 frames, 1.6 s). Shorter than 40 frames cuts the hold.
//     y      the letter's centre y (default TITLE.y = 1096: the letter then takes y 934..1264, under a face in the upper
//            middle and above the caption band, which starts at y 1270)
//     id     the prefix of its SVG ids (default "romeo-title"; give another when two are on one page)
//   titleRect(y?)   the box it takes on screen (film px), for the overlay check (kind "title")
//
// WHAT IT IS: a folded letter, sealed side up, like the one Romeo carries. It drops in from the lens and settles with
// one flutter (t 0-4); the words are written on it in the quill hand: 采访 small (t 3), 罗密欧 in Montague blue (t 5), 与
// in gilt (t 8), 朱丽叶 in Capulet red (t 10), 的一天 small (t 13); the flap is sealed with red wax pressed with a heart,
// THUNK (t 17: the letter is knocked down a few px, a ring of air); then a small blob of wax thunks down over the 一 with
// 四 pressed in it (t 28): 的四天, the play's four days. It holds (a slow breath, a glint crossing the seal) and leaves
// by flapping away over its last 5 frames.
// WORDS: only 采访 / 罗密欧与朱丽叶 / 的一天 (+ the 四). The heart on the seal carries no information.
// WHERE: every word inside x 148..862 (the paper x 110..890), y 934..1264 at the default y. Clear of the REC row, of a
// face in the upper middle and of the caption band; give y when the shot's face sits lower.
// SOUND (one each, short): the landing = "paper flap"; the seal = "wax thunk" (low, soft, heavy); the 四 = a smaller,
// higher "wax tick".
import React from "react";
import { life, part, ring, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, flapIn, flapOut, thunk, breathe } from "./skin";
import { letterDefs, sheet, wax, quill } from "./marks";

/** the title's numbers: the letter's centre x, its size, its default centre y, its rest turn (deg), its length (frames) */
export const TITLE = { cx: 500, w: 780, h: 292, y: 1096, rot: -1.6, len: 48 } as const;
/** the beats, in frames from `from` */
export const TITLE_BEATS = { land: 0, caifang: 3, romeo: 5, yu: 8, juliet: 10, day: 13, seal: 17, four: 28 } as const;
/** the box the title takes on screen (the turn, the seal's overhang and the shadow included) */
export const titleRect = (y: number = TITLE.y): Rect => ({ x0: TITLE.cx - TITLE.w / 2, y0: y - TITLE.h / 2 - 16, x1: TITLE.cx + TITLE.w / 2, y1: y + TITLE.h / 2 + 22 });

export const LetterTitle: React.FC<{ f: number; from: number; to?: number; y?: number; id?: string }> = ({ f, from, to, y = TITLE.y, id = "romeo-title" }) => {
  const L = life(f, from, to ?? from + TITLE.len - 1, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, B = TITLE_BEATS, hw = TITLE.w / 2, hh = TITLE.h / 2;
  const A = flapIn(t, B.land, 5, -8), out = flapOut(L.leave, -1), seal = thunk(t, B.seal), four = thunk(t, B.four, 2.1), br = breathe(t, 1);
  const dy = -A.lift + seal.jolt + 0.6 * four.jolt + out.dy + (t > 8 ? br.y : 0);
  const rot = TITLE.rot + A.rot + out.rot + (t > 8 ? br.rot : 0);
  const r: Rect = { x0: -hw, y0: -hh, x1: hw, y1: hh }, sx = 0, sy = 118;
  // the name's row: 罗密欧 (104) 与 (64) 朱丽叶 (104), 724 px wide, centred
  const S = 104, yName = -6;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: A.o * out.o }}>
      <defs>{letterDefs(id)}</defs>
      <g transform={`translate(${TITLE.cx},${(y + dy).toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(A.s * out.s).toFixed(3)})`}>
        {sheet(id, "letter", r, { seed: 4, jag: 2.2, burn: 10 }, (
          <>
            {/* the flap: folded down from the top edge to its point, where the seal goes */}
            <path d={`M${-hw + 6},${-hh + 4} L${sx},${sy - 8} L${hw - 6},${-hh + 4}`} fill="none" stroke={TONE.shadow} strokeWidth={9} opacity={0.1} filter={`url(#${id}-soft)`} transform="translate(0,5)" />
            <path d={`M${-hw + 6},${-hh + 4} L${sx},${sy - 8} L${hw - 6},${-hh + 4} Z`} fill={TONE.paperHi} opacity={0.34} />
            <path d={`M${-hw + 6},${-hh + 4} L${sx},${sy - 8} L${hw - 6},${-hh + 4}`} fill="none" stroke={TONE.crease} strokeWidth={2} opacity={0.5} strokeLinejoin="round" />
            <path d={`M${-hw + 6},${-hh + 1.5} L${sx},${sy - 10.5} L${hw - 6},${-hh + 1.5}`} fill="none" stroke="#fffaf0" strokeWidth={1.6} opacity={0.75} strokeLinejoin="round" />
            {quill(id, "caifang", "采访", -350, -94, 48, C.ink, { anchor: "start", seed: 3, k: part(t, B.caifang, 3) })}
            {quill(id, "romeo", "罗密欧", -203, yName, S, TONE.blueDeep, { seed: 2, k: part(t, B.romeo, 4) })}
            {quill(id, "yu", "与", 0, yName + 12, 64, TONE.goldDeep, { seed: 6, k: part(t, B.yu, 2) })}
            {quill(id, "juliet", "朱丽叶", 203, yName, S, TONE.redDeep, { seed: 4, k: part(t, B.juliet, 4) })}
            {quill(id, "day", "的一天", 350, 92, 48, C.ink, { anchor: "end", seed: 7, track: 0.42, k: part(t, B.day, 3) })}
          </>
        ))}
        {/* the seal on the flap's point, pressed with a heart */}
        {seal.on ? ring("sr", sx, sy, 40, 120, seal.ring, TONE.paperHi, 9) : null}
        {wax(id, "seal", sx, sy, 44, { emblem: "heart", rot: -6, seed: 2, scale: seal.s, squash: seal.squash, glint: seal.glint })}
        {/* 四 over the 一: the play's four days */}
        {four.on ? ring("fr", 258, 92, 30, 86, four.ring, TONE.paperHi, 7) : null}
        {wax(id, "four", 258, 92, 40, { rows: ["四"], px: 37, rot: 7, seed: 5, drips: 1, scale: four.s, squash: four.squash, glint: four.glint })}
      </g>
    </svg>
  );
};
