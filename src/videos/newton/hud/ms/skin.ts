// hud/ms/skin.ts: SKIN A 「手稿」 THE MANUSCRIPT, written down once (Jay picked it, 14 Nov 2026, round 2). Every piece
// the film draws over the picture (the title, the two intro cards, the 综艺 effects) takes its colours, its two type
// treatments, its material and its one way of moving from here, so the edit looks like one hand.
// Source of truth for the look: the art director's approved frames and their generator,
//   /home/user/newton_work/film/looks/frames/A_{title,card,fx,humphrey}.png, swatch_A.png
//   /home/user/newton_work/film/looks/src/skin_a.py, common.py, nib.py, looks.md (section A)
// The marks that draw it: hud/ms/marks.tsx. The timing: hud/ms/when.ts. Stage 1 of 3 (skin A build).
//
// THE IDEA: the edit is written in his own hand: iron-gall ink and a crimson rubric on the laid paper of his draft.
// Every piece is WRITTEN ON stroke by stroke by an unseen nib and leaves by SINKING INTO THE PAPER. Every piece carries
// exactly one crimson rubric mark (the name, the seal, the crosses, 拒收, 证毕, the manicule on Humphrey's banner).
// Must not look like: a parchment fantasy map, a 毛笔 title (Qin's), a cosy scrapbook, the format's paper-and-ink memory
// card. What keeps it apart: crimson leads, the hand is visibly a NIB (downstrokes wide, horizontals half), and the
// rubric mark on every piece.
import { defineSkin } from "../../../../kit/overlay";

/** THE SKIN (kit overlay/skin.ts defineSkin: every field filled, four different colours) */
export const SKIN = defineSkin({
  film: "newton",
  from: "Newton's own draft of the Principia: a broad-nib quill in iron-gall ink on laid paper, the name rubricated in crimson, compass constructions, a wax seal",
  colour: {
    /** crimson rubric: the name, the seal, the crosses, every piece's one rubric mark */ lead: "#A3162B",
    /** sepia: the compass orbit, construction lines, the faded second ink, the ink as it sinks */ accent: "#8A7350",
    /** iron-gall ink: every other word */ ink: "#2A1D14",
    /** laid paper */ paper: "#F1E4C3",
  },
  // THE DISPLAY HAND (牛顿, 艾萨克·牛顿, 汉弗莱, 拒收, 证毕): FrSans placed one glyph outline at a time (hud/ms/glyphs.ts
  // QUILL), each turned +-3..5 deg and lifted, then the NIB filter (marks.tsx nibFilter): downstrokes widened by NIB.dx,
  // horizontals thinned by NIB.ey (about half their weight), a hand wobble and a fine ragged edge, an iron-gall rim,
  // ink pooled at every free stroke end (QUILL[ch].p)
  display: { ink: 0, track: -0.03, tilt: 0, hand: { rot: 5, lift: 12, scale: 0.04 }, rough: { fx: 0.5, fy: 0.5, scale: 2.7, seed: 5 } },
  // THE BODY HAND (labels, the stats, 1686年5月 · 剑桥三一学院, 今日目标, 午饭进度, 我笑的不算): FrSans as SVG text through
  // an INK filter (marks.tsx inkFilter: horizontals eroded a little, the edge roughened, a faint bleed); set straight,
  // not turned; numerals too (0/1 on the card and the meter, 1%/2%: upright FrSans bold, as every approved frame draws
  // them); only the construction letters A B C are italic outlines (glyphs.ts SERIF: FrSans written again with a slanted
  // flat nib)
  body: { ink: 0, track: 0.04, tilt: 0, hand: { rot: 0, lift: 0, scale: 0 }, rough: { fx: 0.65, fy: 0.65, scale: 3, seed: 5 } },
  material: "iron-gall ink and a crimson rubric on laid paper (torn edges, chain lines about 100 px apart, foxing); the epithet pressed in a crimson wax seal",
  motion: {
    arrive: 18, over: 1, leave: 8,
    hit: "an unseen nib writes each piece on stroke by stroke (the pools swell as each stroke stops); it holds while the ink dries; it leaves by sinking into the paper (to sepia, then gone)",
  },
});

/** the skin's colours by name (SKIN.colour plus the few the frames use besides the four) */
export const MS = {
  crimson: SKIN.colour.lead, ink: SKIN.colour.ink, paper: SKIN.colour.paper, sepia: SKIN.colour.accent,
  /** iron-gall dries darker at its rim: the rim of iron-gall ink, the rim of crimson */
  edgeInk: "#120a05", edgeCrimson: "#4A0D12",
  /** a lighter slip of the same paper (labels, the meter, the banner, the scrap cut round a 花字) */
  slip: "#F4E8CB",
  /** Humphrey's drab (his coat): his banner only, never crimson */
  hum: "#8F7A5A",
  /** the paper's edge tone, the laid pattern's lines, the foxing */
  paperEdge: "#b89a68", laid: "#7a5a30", chain: "#8a6a3c",
  /** the crimson wax: its gradient stops, its body, its rim, its embossed letters */
  wax: ["#C9283F", "#A3162B", "#6E0C1C"] as const, waxBody: "#9a1426", waxRim: "#6a0a18", waxLetters: "#DA4A5E",
  /** the contact shadow under a leaf */
  shadow: "#0d0603",
} as const;

/** THE NIB (skin_a.py NIB_DX / NIB_EY): at size S the downstrokes widen by dx * S on each side and the horizontals thin
 *  by ey * S on each side: about 0.15 S against 0.07 S */
export const NIB = { dx: 0.012, ey: 0.022 } as const;

/** the hand's default turn (deg), lift (px, as the frames give them: not scaled with the size) and scale
 *  per character, cycled (skin_a.py quill() defaults) */
export const HAND = {
  rots: [-4, 3, -2, 5, -3, 4],
  lifts: [0, 9, -5, 6, -2, 7],
  scales: [1.0, 0.95, 1.04, 0.98],
} as const;

/** the laid paper (skin_a.py defs_a "laid", "grain", "fox"): chain lines every 104 px (about 100), laid lines every
 *  5 px nearly invisible */
export const PAPER = { chain: 104, laidStep: 5, chainOp: 0.12, laidOp: 0.035, grainOp: 0.45, foxOp: 0.55, edgeOp: 0.32 } as const;

/** THE MOTION in frames (30 fps), the skin's one way of moving (looks.md A, the frames' headers): a character of the
 *  display hand is written in `char` frames, its pools swell `pool` frames after each stroke stops; a body row is
 *  written `rowChar` frames a character; everything SINKS over `sink` frames (the ink goes sepia, then the paper takes
 *  it); a leaf slaps down in `slap` frames */
export const MOTION = { char: 5, pool: 2, rowChar: 1.2, sink: 8, slap: 3, dry: 30 } as const;

/** THE LAUGH METER'S SLIP, the HAND-OFF between the lead card and the meter (EFFECTS_PLAN rows 4-6, 8, 10; the slot
 *  x 752-1026, y 155-300, top right under the battery; A_fx.png; skin_a.py meter_slip(742, 154, 270, 138), moved 12 px
 *  right toward the battery on 14 Nov night (the owner: METER_DX)). card.tsx
 *  flies its target line (今日目标 … the empty circle, 0/1) onto `circle` and `count` over its leave (t 67-74); fx.tsx
 *  (hud/ms/meter.tsx) draws the slip there from the very next frame (meter0 t 0) and every later showing in the same
 *  place, so the meter never moves. Film px; the slip is turned `rot` degrees about its centre and everything on it
 *  turns with it (the points below are in the slip's own, unturned frame). Stage 2b. */
const METER_DX = 12;
export const METER = {
  slip: { x: 742 + METER_DX, y: 154, w: 270, h: 138, rot: 1.2 },
  /** the circle the compass must close, 笑 inside it (46 px), its tick dot (r 5) at the top */
  circle: { cx: 806 + METER_DX, cy: 224, r: 42, px: 46 },
  /** the count 0/1: its baseline-left. The approved frames set it upright in FrSans bold (A_fx.png: the generator's
   *  italic face did not load), so meter.tsx draws it in the body hand (inkText, -inkA), not glyphs.ts SERIF */
  count: { x: 870 + METER_DX, y: 246, px: 70 },
  /** the tries row: a crimson cross per failed try, a sepia dot per try left (3 before the laugh, 2 after) */
  tries: { x: 882 + METER_DX, y: 270, step: 40, s: 9 },
  /** tick 2's note slip under the meter (我笑的不算, crimson): its top tucks under the slip's torn bottom edge */
  note: { x: 798 + METER_DX, y: 284, w: 180, h: 60, px: 31 },
} as const;
