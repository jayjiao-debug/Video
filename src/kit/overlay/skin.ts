// overlay/skin.ts: A FILM'S SKIN, written down once (shared kit; src/kit/overlay/README.md). The title, the intro cards
// and every effect of one film are drawn in one skin, so the edit looks like one hand. The skin comes from the lead and
// their world, and no two films share one.
//
// There is NO default skin and no default value in it: a film cannot draw a title until someone has decided what this
// person's title is made of. That is on purpose (the owner: "i dont want something generic, instead building blocks").
//
//   export const SKIN = defineSkin({
//     film: "qin", from: "the First Emperor's black lacquer, gold and cinnabar; a brush pressed hard and dragged dry",
//     colour: { lead: "#ffd666", accent: "#c8302a", ink: "#120e16", paper: "#fff3d6" },
//     display: { ink: 0.09, track: 0.08, tilt: 0, hand: { rot: 3.5, lift: 8, scale: 0.07 }, rough: { fx: 0.06, fy: 0.06, scale: 5, seed: 9 } },
//     body:    { ink: 0.15, track: 0.09, tilt: -4, hand: { rot: 0, lift: 0, scale: 0 }, rough: null },
//     material: "dry ink stroke, a few splashes, one red seal",
//     motion: { arrive: 6, over: 2.6, leave: 6, hit: "the brush sweeps in, the name pops one character at a time, the seal slaps down" },
//   });
//
// The repo has ONE CJK face (FrSans, public/bt/sans700.ttf) and takes no new font files, so a "typeface" here is a way
// of TREATING that face: how heavy its ink line is, how the characters are set by hand, how rough their edges are.

/** one way of treating the repo's one CJK face */
export type TypeTreat = {
  /** the ink line under the fill, as a share of the character size (0 = none) */ ink: number;
  /** letter spacing as a share of the character size */ track: number;
  /** the row's tilt in degrees */ tilt: number;
  /** how far each character is turned (deg), lifted (px) and scaled (share) by hand: the most it may differ */ hand: { rot: number; lift: number; scale: number };
  /** the edge: an SVG displacement (base frequencies, strength in px, a fixed seed), or null for a clean edge */ rough: { fx: number; fy: number; scale: number; seed: number } | null;
};
export type Skin = {
  /** the film's folder name */ film: string;
  /** where the look comes from, in one sentence: the lead and their world. A reviewer reads this first. */ from: string;
  /** four colours: the lead's own, one accent, the ink (darkest), the paper (lightest) */ colour: { lead: string; accent: string; ink: string; paper: string };
  /** the big words (the name, a punch word) and the small words (labels, a card's lines) */ display: TypeTreat; body: TypeTreat;
  /** what things are made of in this person's world, in a few words (ink and seal, newsprint, engraving) */ material: string;
  /** one way of moving: frames to arrive, the overshoot (1 = none), frames to leave, and the hit in words */ motion: { arrive: number; over: number; leave: number; hit: string };
};

const hex = /^#[0-9a-f]{6}$/i;
/** check a skin and freeze it: every field filled, four different colours */
export const defineSkin = (s: Skin): Readonly<Skin> => {
  const bad = (why: string) => { throw new Error(`skin of ${s.film || "?"}: ${why}`); };
  if (!s.film) bad("no film name");
  if (!s.from || s.from.length < 20) bad("`from` says in one sentence where the look comes from (the lead and their world)");
  if (!s.material) bad("no material");
  const cs = Object.values(s.colour);
  if (cs.length !== 4 || cs.some((c) => !hex.test(c))) bad("four colours as #rrggbb");
  if (new Set(cs.map((c) => c.toLowerCase())).size !== 4) bad("the four colours must differ");
  if (!(s.motion.arrive > 0) || !(s.motion.leave >= 0) || !(s.motion.over >= 1) || !s.motion.hit) bad("motion: arrive, over, leave and the hit in words");
  return Object.freeze({ ...s, colour: Object.freeze({ ...s.colour }) });
};
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const near = (a: string, b: string, d = 28) => { const x = rgb(a), y = rgb(b); return Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]) <= d; };
/** true when two films' skins would look alike: the same lead colour and accent (within a small step) and the same way
 *  of moving. A film's smoke test runs this against the skins of the films before it. */
export const sameLook = (a: Skin, b: Skin) =>
  near(a.colour.lead, b.colour.lead) && near(a.colour.accent, b.colour.accent) && a.motion.arrive === b.motion.arrive && a.motion.over === b.motion.over;
