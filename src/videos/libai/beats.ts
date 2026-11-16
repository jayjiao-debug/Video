// THE NAMED BEATS of 《采访李白的一天》 (LibaiFilm). Every frame is LOOKED UP from the generated timing (lineId, capWord,
// cap, SEGMENTS, CARDS): nobody types a frame number, so a re-timed voice moves every beat by itself.
//   BEAT.A .. BEAT.F   per scene, the frames the shots use (a span is [first, last], inclusive)
//   TITLE_SPAN         the title block (frames 0-90)
//   placeAt(f)         the place every frame shows; SPANS the same as runs; shotAt(f) the segment id (the checker)
//   TRANSITIONS        the cross-segment overlays (fades through a tone): hud/ink.tsx transitionAt(f)
//   beatCheck()        [] when every beat lies inside its segment
// Helpers: from(id) = the line's first frame of speech, to(id) its last, pre(id) where its silent beat starts,
// word(id, w) = capWord(id, w).from (the word's first syllable).
import { lineId, capWord, cap, seg, card, CARDS, SEGMENTS, TOTAL, FPS, type Place, type SceneId } from "./story";

const from = (id: string) => lineId(id).from;
const to = (id: string) => lineId(id).to;
const pre = (id: string) => lineId(id).preFrom;
const word = (id: string, w: string) => capWord(id, w).from;
const sec = (s: number) => Math.round(s * FPS);
const cardSpan = (id: string): Span => [card(id).from, card(id).to];
/** a span [first, last] (inclusive) */
export type Span = [number, number];
/** the frames each side of a cut that a fade through a tone takes */
export const FADE_N = 10;

// ---------------------------------------------------------------------------------------------------- A 卯时 tavern
const A = {
  /** REC on: the beep (sound) on frame 6 */ rec: seg("A").from + 6,
  /** he snores face down on the table, hugging the jar, until A01's end */ sleep: [seg("A").from, to("A01")] as Span,
  /** the invisible hand knocks three times on the table, as the knock clip does (sound, the table jumps, 咚 on the
   *  table: hud/fx.tsx KnockFx) */ knock: [pre("A01") + sec(0.9), pre("A01") + sec(0.9) + 6, pre("A01") + sec(0.9) + 13] as number[],
  /** he lifts his head (A01's end) and squints at the lens */ wake: to("A01") - 4,
  /** A02: he leans right up to the lens (月亮) */ lean: word("A02", "月亮"),
  /** A04: the jar comes up to the lens */ jar: from("A04"),
  /** A06: very pleased with himself (早酒) */ proud: word("A06", "早酒"),
  /** A08: counting on his fingers, then the shrug */ count: from("A08"), shrug: word("A08", "一日"),
  /** A09: her whisper to the viewers (whisper.ts) */ aside: from("A09"),
  /** card 1: back on him, he drinks from the jar */ card: cardSpan("A09"),
  /** the whip out of the tavern (its first frame; 4 out, 4 in) */ whip: seg("A").to - 3,
};
/** the title block 「采访李白的一天」 / 「744年 · 长安」 (frames 0-90) */
/** 高力士's banner (hud/intro.tsx GaoBanner): on the live shot when C opens, before and under her first words */
export const GAO_BANNER: Span = [seg("C").from + 6, lineId("C19").from + 64];   // about 3 s (Jay: the cards went by too fast)

/** the themed title (hud/title.tsx): inside the cold open, from the REC beep to just before her first word */
/** (it drops as she comes through the door curtain (hud/curtain.tsx), shows over the walk in and is gone as she knocks) */
export const TITLE_SPAN: Span = [seg("A").from + 22, A.knock[0] - 2];

// ---------------------------------------------------------------------------------------------------- B 辰时 the door
const B = {
  /** the whip lands at the tavern door: he sits on the bench, one foot up, cup in hand */ land: seg("B").from,
  /** B11 翰林待诏: he sits up straight, proud */ proud: from("B11"),
  /** B13: he deflates a little */ deflate: from("B13"),
  /** B15: he raises the cup */ cup: word("B15", "所以"),
  /** the eunuch runs in from the street (B15's end to B16's start) */ run: [to("B15") - sec(0.4), from("B16") + sec(0.3)] as Span,
  /** B17: he gets up ... wobbles ... and sits back down (after the line) */ rise: from("B17"), sitBack: to("B17") + sec(0.55),
  /** B18's after: two eunuchs splash a basin of water in his face */ splash: to("B18") + sec(0.5),
  /** he blinks, dripping, and grins */ drip: to("B18") + sec(1.0),
  /** card 2 */ card: cardSpan("B18"),
  /** the fade through warm cream out of B */ fade: [seg("B").to - FADE_N + 1, seg("B").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- C 午时 沉香亭
const C = {
  /** the fade in */ fadeIn: [seg("C").from, seg("C").from + FADE_N - 1] as Span,
  /** he writes at the low desk, face still dripping (C19, C20) */ write: [seg("C").from, to("C20")] as Span,
  /** C20: the brush flies (the two halves of the couplet) */ verse: [from("C20"), cap("C20", 1).from] as Span,
  /** C21: he sticks his foot out toward 高力士 (靴子) */ foot: word("C21", "靴子"),
  /** after C21: silence; 高力士 kneels (kneel), pulls the boot (boot), stands (up) and turns to glare at the lens (glare) */
  kneel: to("C21") + sec(0.4), boot: to("C21") + sec(1.5), up: to("C21") + sec(2.3), glare: to("C21") + sec(2.7),
  /** C22: the aside to the viewers */ aside: from("C22") - 6,
  /** card 3 */ card: cardSpan("C22"),
  /** the fade out of C */ fade: [seg("C").to - FADE_N + 1, seg("C").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- D 未时 the gate
const D = {
  /** the fade in */ fadeIn: [seg("D").from, seg("D").from + FADE_N - 1] as Span,
  /** the eunuch hands him the little chest of gold (D23) */ give: word("D23", "这是"),
  /** the great gate behind him swings shut (D23's end) */ shut: [to("D23") + sec(0.6), to("D23") + sec(1.2)] as Span,
  /** he looks at the chest (D24's after) ... then bursts out laughing (D25) */ look: to("D24"), laugh: from("D25"),
  /** he holds the gold up (天生我材) */ hold: word("D25", "天生"),
  /** D27: he strides off past the lens */ stride: from("D27"),
  /** the fade out of D */ fade: [seg("D").to - FADE_N + 1, seg("D").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- E 酉时 tavern
const E = {
  /** the fade in */ fadeIn: [seg("E").from, seg("E").from + FADE_N - 1] as Span,
  /** E28: he pours the gold out on the table; the room cheers */ pour: pre("E28") + sec(0.4), cheer: to("E28"),
  /** E29: the aside: only a few coins are left */ aside: from("E29") - 6,
  /** E31: proud (醉如泥) */ poem: word("E31", "三百"),
  /** E32: the aside */ aside2: from("E32") - 6,
  /** E33 and after: the friend gets up; the room empties, the lamps go out one by one */ leave: [from("E33"), seg("E").to] as Span,
  /** the fade through deep blue out of E */ fade: [seg("E").to - FADE_N + 1, seg("E").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- F 子时 under the tree
const c4 = card("F44"), c5 = CARDS[CARDS.length - 1];
const OFF = { freeze: 9, collapse: 8, dot: 10, minBlack: 20 };
const fOff = Math.min(c5.to + sec(0.4), TOTAL - (OFF.freeze + OFF.collapse + OFF.dot + OFF.minBlack));
const F = {
  /** the fade in from deep blue */ fadeIn: [seg("F").from, seg("F").from + FADE_N - 1] as Span,
  /** F37: the memory of 贺知章 (an ink-wash flashback in the tavern, morning) */ memory: [word("F37", "第一次"), to("F37")] as Span,
  /** he unties the gold turtle (金龟) */ turtle: word("F37", "金龟"),
  /** F40: he lifts his cup to the moon */ toast: from("F40"),
  /** F41: the moon (明月), his shadow (对影), himself (三人) */ moon: word("F41", "举杯"), shadow: word("F41", "对影"), three: word("F41", "三人"),
  /** F42: he looks into the cup */ cupLook: from("F42"),
  /** after F43: her cup comes up in front of the lens (cupIn) and she sips (clink: the sip; no clink since 16 Nov) */ cupIn: to("F43") + sec(0.1), clink: to("F43") + sec(0.7),
  /** F44's end: he drinks; the camera rises slowly to the moon */ drink: to("F44") + sec(0.3), rise: [to("F44") + sec(0.8), fOff] as Span,
  /** cards 4 and 5 */ card4: [c4.from, c4.to] as Span, card5: [c5.from, c5.to] as Span,
  /** HER CAMERA SWITCHES OFF: the click (REC lamp out, HUD frozen), the collapse to a line, the dot, black */
  offClick: fOff,
  collapse: [fOff + OFF.freeze, fOff + OFF.freeze + OFF.collapse - 1] as Span,
  dot: [fOff + OFF.freeze + OFF.collapse, fOff + OFF.freeze + OFF.collapse + OFF.dot - 1] as Span,
  black: fOff + OFF.freeze + OFF.collapse + OFF.dot,
};

/** THE BEATS, per scene */
export const BEAT = { A, B, C, D, E, F };
/** THE SIDE CHARACTERS' BANNERS (hud/intro.tsx SideBanner; Jay, 15 Nov: "give a short title to those side characters"):
 *  each on the live shot when the person matters, about 2.5-3 s, over their head and moving with them (track.ts) */
export const SIDE_BANNERS: { who: "gao" | "huan" | "you" | "he"; span: Span; scene: SceneId }[] = [
  { who: "huan", span: [lineId("B16").from + 44, lineId("B16").from + 124], scene: "B" },   // he shouts 李翰林 off screen: the title waits until he is in the picture
  { who: "gao", span: GAO_BANNER, scene: "C" },
  { who: "you", span: [seg("E").from + 10, lineId("E28").from + 50], scene: "E" },
  { who: "he", span: [F.memory[0] + 8, F.memory[0] + 86], scene: "F" },
];

// ---------------------------------------------------------------------------------------------------- the places
/** the place of every frame as [place, first, last] runs (F's memory is the tavern) */
export const SPANS: [Place, number, number][] = [
  ["tavern", seg("A").from, seg("A").to],
  ["street", seg("B").from, seg("B").to],
  ["terrace", seg("C").from, seg("C").to],
  ["corridor", seg("D").from, seg("D").to],
  ["tavern", seg("E").from, seg("E").to],
  ["night", seg("F").from, F.memory[0] - 1],
  ["tavern", F.memory[0], F.memory[1]],
  ["night", F.memory[1] + 1, seg("F").to],
];
export const placeAt = (f: number): Place => {
  for (const [p, a, b] of SPANS) if (f >= a && f <= b) return p;
  return f < 0 ? SPANS[0][0] : SPANS[SPANS.length - 1][0];
};
export const shotAt = (f: number): { id: string } => ({ id: SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "?" });

// ---------------------------------------------------------------------------------------------------- transitions
/** a fade through `tone` round a cut (or the memory's ink dissolve in and out) */
export type Transition = { kind: "tone" | "ink" | "dissolve" | "clock"; cut: number; from: number; to: number; tone?: string; tone2?: string; scenes?: [SceneId, SceneId]; what: string };
/** THE JOINS between scenes (the format: one kind per join, never the same kind twice in a row; no cut inside a scene):
 *    A -> B  whip pan (shots: A's last 4 frames out, B's first 4 in)
 *    B -> C  the clock race (her camera's clock runs fast: 辰时 -> 午时)
 *    C -> D  whip pan (shots)
 *    D -> E  the clock race (未时 -> 酉时)
 *    E -> F  a match cut: E's last lamp, burning low, cuts to the moon on the same spot of the screen (shots)
 *  and F's memory, a flashback in another drawn style, dissolves in and out (ink). */
export const TRANSITIONS: Transition[] = [
  { kind: "clock", cut: seg("C").from, from: seg("C").from - 16, to: seg("C").from + 5, scenes: ["B", "C"], what: "B -> C: the clock race" },
  { kind: "clock", cut: seg("E").from, from: seg("E").from - 16, to: seg("E").from + 5, scenes: ["D", "E"], what: "D -> E: the clock race" },
  { kind: "dissolve", cut: F.memory[0], from: F.memory[0] - 8, to: F.memory[0] + 13, what: "night -> the memory (ink)" },
  { kind: "dissolve", cut: F.memory[1] + 1, from: F.memory[1] - 7, to: F.memory[1] + 14, what: "the memory -> night (ink)" },
];

export const beatCheck = (): string[] => {
  const bad: string[] = [];
  for (const [id, beats] of Object.entries(BEAT) as [SceneId, Record<string, number | number[]>][]) {
    const s = seg(id);
    for (const [k, v] of Object.entries(beats)) {
      const vs = Array.isArray(v) ? v : [v];
      for (const x of vs) if (!(Number.isInteger(x) && x >= s.from && x <= s.to)) bad.push(`BEAT.${id}.${k} = ${x} is outside segment ${id} (${s.from}-${s.to})`);
      for (let i = 1; i < vs.length; i++) if (vs[i] < vs[i - 1]) bad.push(`BEAT.${id}.${k} = [${vs.join(", ")}] runs backwards`);
    }
  }
  if (TITLE_SPAN[1] > seg("A").to) bad.push(`TITLE_SPAN ${TITLE_SPAN} runs past segment A (${seg("A").to})`);
  let next = 0;
  for (const [p, a, b] of SPANS) { if (a !== next || b < a) bad.push(`SPANS: ${p} ${a}-${b} (expected to start on ${next})`); next = b + 1; }
  if (next !== TOTAL) bad.push(`SPANS end on ${next - 1}, the film on ${TOTAL - 1}`);
  for (const t of TRANSITIONS) if (!(t.from < t.cut && t.cut <= t.to)) bad.push(`TRANSITIONS ${t.what}: ${t.from} < ${t.cut} <= ${t.to} fails`);
  return bad;
};
