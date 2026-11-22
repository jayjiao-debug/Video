// hud/skin.ts: THE SKIN of 采访罗密欧与朱丽叶的一天, 「信」 THE LETTER, written down once (src/kit/overlay/README.md
// "The order of work"). The title, the name tabs, the tally, her whisper and notes, the fact card, the stamp, the
// split's edge and the end card all take their colours, their two type treatments, their material and their one way of
// moving from here, so the film's graphics look like one maker.
//
// WHERE IT COMES FROM: the play turns on a letter that never arrives, and everyone in Verona hands the reporter things
// to carry. So everything she puts on the picture is a piece of that post: folded parchment written in a slanted quill
// hand and closed with red sealing wax. The colours are the two houses': Montague blue, Capulet red (the wax is the
// same red), with a gilt line where the two meet.
// MUST NOT LOOK LIKE Newton's manuscript (upright nib written on stroke by stroke, crimson rubric, sinks into the
// paper): here the paper itself moves (it flaps and folds), the hand is slanted, the wax is the star and it THUNKS, and
// two house colours lead instead of one rubric.
//
// TYPE: the repo's script faces (public/su/fonts/xing.woff2, kuaile.woff2) are 107-glyph subsets of the Su film's own
// words and hold almost none of this film's characters, and no font file may be added. So both display "typefaces" are
// treatments of Noto Sans SC Bold (FrSans, public/bt/sans700.ttf), as the kit's README defines a typeface:
//   THE QUILL HAND (names, punch words, every line on parchment): slanted, set by hand a character at a time, cut by a
//     broad nib (marks.tsx nibFilter: down strokes fattened, cross strokes thinned, the edge a little ragged, the ink
//     pooling unevenly).
//   THE SEAL FACE (anything pressed in wax: 四, 已婚, 演绎): upright, tight, raised out of the wax with a lit and a
//     shaded edge. The tally's 0 and 1 are drawn by hand as paths (marks.tsx), not set in any face.
import { defineSkin, clamp01, easeOut, easeOutBack, easeIn, part, slap, hash01 } from "../../../kit/overlay";

export const SKIN = defineSkin({
  film: "romeo",
  from: "the letter that never arrives in Romeo and Juliet: folded parchment in a slanted quill hand, closed with red sealing wax, in Montague blue and Capulet red with a gilt line",
  colour: {
    /** Montague blue (Romeo's doublet): his strip, his tab, his half of the split */ lead: "#2f5fb8",
    /** Capulet red = the sealing wax (Juliet's gown): her strip, every seal, the reporter's red ink */ accent: "#b8252f",
    /** quill ink, a sepia black */ ink: "#2b1b12",
    /** parchment */ paper: "#f3e6c4",
  },
  display: { ink: 0, track: 0.03, tilt: 0, hand: { rot: 3.2, lift: 5, scale: 0.05 }, rough: { fx: 0.5, fy: 0.5, scale: 2.2, seed: 5 } },
  body: { ink: 0, track: 0.05, tilt: 0, hand: { rot: 1.4, lift: 2, scale: 0.02 }, rough: { fx: 0.6, fy: 0.6, scale: 1.4, seed: 7 } },
  material: "folded parchment (a deckled edge, fold creases, fibres, a browned rim) and red sealing wax pressed with a seal",
  motion: {
    arrive: 5, over: 1.9, leave: 5,
    hit: "paper flaps in and settles with one flutter; the wax thunks down large, squashes and sets with a glint; everything leaves by flapping away",
  },
});
export const C = SKIN.colour;

/** the tones beside the four: the houses' deep and light, the gilt line, the friar's habit, the parchment's tones */
export const TONE = {
  blueDeep: "#1f3f86", blueHi: "#6f98e6", redDeep: "#8a1a26", redHi: "#e2565c",
  gold: "#e2b03a", goldDeep: "#a9781c", goldHi: "#f8e19a",
  friar: "#7a5a3c", friarDeep: "#4f3824", friarHi: "#a98562",
  paperHi: "#fdf5df", paperLo: "#e6d2a3", paperEdge: "#a8763c", crease: "#8a6a3c", fibre: "#9a7a48",
  /** the faded second ink (small words, rules) and the reporter's red ink */ inkSoft: "#5b4330", inkRed: "#a51f29",
  /** the contact shadow under paper and wax; the film's darkest warm tone (the end card's ground, never #000) */ shadow: "#150c07", black: "#140d09",
} as const;

/** THE WAX in each tone: its light, its body, its deep, the raised letters, their lit and shaded edges */
export const WAX = {
  red: { hi: "#e9585a", mid: "#b8252f", deep: "#7b111c", letter: "#cf3a40", lit: "#ffb0a8", shade: "#4a0810" },
  blue: { hi: "#6f98e6", mid: "#2f5fb8", deep: "#16306c", letter: "#4474cf", lit: "#b9d0ff", shade: "#0c1d48" },
  gold: { hi: "#f8e19a", mid: "#e2b03a", deep: "#9a6c14", letter: "#eec55a", lit: "#fff3c4", shade: "#6b4a0a" },
  herb: { hi: "#a98562", mid: "#7a5a3c", deep: "#463020", letter: "#8e6c4a", lit: "#d9bc98", shade: "#2a1b10" },
} as const;
export type WaxTone = keyof typeof WAX;

/** THE CAST'S COLOURS for a tab or a banner: the strip's body, its deep, its light, the wax tone, the name's ink on
 *  parchment */
export const HOUSE = {
  romeo: { body: C.lead, deep: TONE.blueDeep, hi: TONE.blueHi, wax: "blue" as WaxTone, name: TONE.blueDeep },
  juliet: { body: C.accent, deep: TONE.redDeep, hi: TONE.redHi, wax: "red" as WaxTone, name: TONE.redDeep },
  friar: { body: TONE.friar, deep: TONE.friarDeep, hi: TONE.friarHi, wax: "herb" as WaxTone, name: TONE.friarDeep },
} as const;
export type House = keyof typeof HOUSE;

// ---------------------------------------------------------------------------------------------------- the one way of moving
/** PAPER FLAPS IN: a part that starts `at` frames into the life and takes n frames. k = eased 0..1 with one overshoot
 *  (the flutter), o = its opacity (in over 2 frames), rot = degrees still to turn (from `from` to 0), s = its scale
 *  (it comes from the lens: a little large, down to 1), lift = px it still hangs above its place */
export const flapIn = (t: number, at: number, n = SKIN.motion.arrive, from = -9) => {
  const raw = part(t, at, n), k = easeOutBack(raw, SKIN.motion.over);
  return { raw, k, o: part(t, at, 2), rot: from * (1 - k), s: 1 + 0.22 * (1 - k), lift: 26 * (1 - easeOut(raw)) };
};
/** PAPER UNFOLDS about a crease: the visible share 0..1 of a flap that opens from frame `at` over n frames, with one
 *  small overshoot (it opens flat, bounces a hair) */
export const unfold = (t: number, at: number, n = SKIN.motion.arrive) => { const raw = part(t, at, n); return raw <= 0 ? 0 : Math.max(0.02, easeOutBack(raw, 1.4)); };
/** PAPER FLAPS AWAY over the life's last frames (leave 0..1): it tips, lifts and is gone. o = opacity, rot = degrees,
 *  dy = px (up), s = scale */
export const flapOut = (leave: number, dir = 1) => { const k = easeIn(clamp01(leave), 2); return { k, o: 1 - clamp01((leave - 0.35) / 0.65), rot: 10 * dir * k, dy: -46 * k, s: 1 - 0.06 * k }; };
/** WAX THUNKS DOWN on frame `at`: s = its scale (large on the frame it lands, squashes, sets: the kit's slap), squash =
 *  how flat it is pressed (1 = round; > 1 = wider than tall, for two frames), ring = the air round the hit (0..1 over 7
 *  frames, 0 before and 1 after), glint = a light that crosses it once (0..1 over frames at+6 .. at+14), jolt = px the
 *  paper under it is knocked down for three frames */
export const thunk = (t: number, at: number, big = 1.8) => {
  const d = t - at;
  return {
    on: d >= 0, s: slap(t, at, big), squash: d === 1 ? 1.12 : d === 2 ? 1.05 : 1,
    ring: d < 0 ? 0 : clamp01((d + 1) / 7), glint: clamp01((d - 5) / 8), jolt: d === 0 ? 7 : d === 1 ? 3 : d === 2 ? -1.5 : 0,
  };
};
/** a held piece is never dead still: a slow breath of the paper (px and degrees), the same on every render */
export const breathe = (t: number, seed = 0) => ({ y: 1.6 * Math.sin((t + 37 * hash01(seed, 3)) / 13), rot: 0.35 * Math.sin((t + 51 * hash01(seed, 5)) / 19) });
