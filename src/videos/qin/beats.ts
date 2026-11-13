// THE NAMED BEATS of the Qin film (PLAN.md section 7, the storyboard). Every frame here is LOOKED UP from the generated
// timing (line(id), lineId(id), capWord(id, word), SEGMENTS, CARDS): nobody types a frame number, so a re-timed voice
// moves every beat by itself. If a lookup no longer exists after a change of the lines, the import throws and names it.
// WP1; segment builders read it and ask for additions in /home/user/qin_work/requests.md (or derive a beat the same way
// in their own file).
//   BEAT.A .. BEAT.G   per scene, the frames the storyboard names (a span is [first, last], inclusive)
//   TITLE_SPAN         the title card after A14 (1.6 s)
//   placeAt(f)         the place every frame shows (the storyboard's cuts: C's table flashback, E's table, G's museum)
//   SPANS              the same as [place, from, to] runs;  shotAt(f) -> { id } (the segment id, for the checker)
//   beatCheck()        [] when every beat lies inside its segment and the spans are in order (the previews print it)
// Helpers below: from(id) = the line's first frame of speech; to(id) = its last; pre(id) = where its silent beat
// ("pre" in the lines file, the action before it) starts; endOf(id) = to + 1.
import { lineId, capWord, seg, SEGMENTS, CARDS, TOTAL, FPS, type Place, type SceneId } from "./story";

const from = (id: string) => lineId(id).from;
const to = (id: string) => lineId(id).to;
const pre = (id: string) => lineId(id).preFrom;
const sec = (s: number) => Math.round(s * FPS);
/** a span [first, last] (inclusive) */
export type Span = [number, number];

// ---------------------------------------------------------------------------------------------------- A 卯时 corridor
const aGrab = pre("A04");
const A = {
  /** f0 .. A02: the creep down the corridor (follow-forward, scared sway) */ creep: [0, from("A02") - 1] as Span,
  /** she stops behind the pillar (duck / peek: the pillar's edge in the left foreground) */ peek: from("A02") - 8,
  /** he glances over his shoulder, turns back away (A03's silent beat starts) */ glance: pre("A03"),
  /** THE SNAP: he snaps round to face the lens (4 frames before 谁) */ turn: from("A03") - 4,
  /** the punch-in on 谁 */ punchIn: from("A03"),
  /** hand to the hilt at his left hip (A04's beat) */ grab: aGrab,
  /** the two stuck tugs (0.5 s apart: body jerks) */ tugs: [aGrab + 8, aGrab + 8 + sec(0.5)] as [number, number],
  /** the third pull swings it up over his shoulder and out */ swordOut: aGrab + 8 + sec(1.0),
  /** the tip stops 0.4 m from the lens: the camera trembles from here */ swordStop: aGrab + 8 + sec(1.0) + 10,
  /** 住口 with a jab of the tip */ jab: from("A06"),
  /** the tremble while she pleads, until the blade lowers */ tremble: [from("A07"), from("A10")] as Span,
  /** he steps closer (记录朕?) */ stepIn: from("A08"),
  /** the blade lowers (英明神武?) */ lower: from("A10"),
  /** the slow push on his face (千古一帝) */ push: [from("A11"), to("A11") + 6] as Span,
  /** EMPEROR -> EMPEROR_BLUSH1 on a blink; he looks away (gaze aside, head tilt, body 30 deg) */ blush: pre("A12"),
  /** he straightens the crown (on 拍) */ crown: capWord("A12", "拍").from,
  /** he turns and walks off (跟上); the camera scrambles after him */ walkOff: from("A13"),
  /** the follow's fast bob starts */ follow: from("A13") + 12,
};
/** the title card 「采访秦始皇的一天」 after A14: 1.6 s from the frame after A14's last word */
export const TITLE_SPAN: Span = [to("A14") + 1, to("A14") + sec(1.6)];

// ---------------------------------------------------------------------------------------------------- B 辰时 hall desk
const B = {
  /** follow him into the hall */ enter: seg("B").from,
  /** he sits at the desk (pose write, the seat with the desk) */ sit: pre("B01") + 12,
  /** the punch-in on the scale as he thumps a bundle on; the beam wobbles (damped) */ thump: from("B02"),
  /** the fact card after B04 */ card: [CARDS.find((c) => c.id === "B04")!.from, CARDS.find((c) => c.id === "B04")!.to] as Span,
  /** THE DIP: she lifts a bundle, the camera sinks 0.6 m and strains (B06) until she gives up */ dip: [from("B06"), from("B08") - 1] as Span,
  /** 呵 (smug) */ smug: from("B07"),
  /** the camera rises again, breathing */ rise: from("B08"),
  /** smile_closed / BLUSH1, eyes away (B09's beat) */ blush: pre("B09"),
  /** THE CUTAWAY (C01's beat, still B): he nods off over the slips, jerks awake, glares at the lens */ nod: [pre("C01"), seg("B").to] as Span,
  /** the jerk awake */ jerk: pre("C01") + Math.round((seg("B").to - pre("C01")) * 0.55),
};

// ---------------------------------------------------------------------------------------------------- C 巳时 hall, immortals
const cFlash0 = to("C07") + sec(0.5);
const C = {
  /** he LEANS into the lens for 找神仙 (whisper look) */ lean: from("C02") - 8,
  /** the whip pan to the door (its middle frame): XUFU slides in and kneels */ whip: from("C04") - 4,
  /** the two-shot */ twoShot: from("C05"),
  /** 拿弩来: he stands */ stand: from("C07"),
  /** THE FLASHBACK on the table (0.5 s after C07, until C08): the coast: he waits on the shore with the repeating crossbow, a giant fish breaches, one bolt, pop (史记: 之罘, from the shore, not a boat) */ flash: [cFlash0, from("C08") - 5] as Span,
  /** the bolt flies */ bolt: cFlash0 + sec(0.8),
  /** the fish pops */ pop: cFlash0 + sec(0.8) + 8,
  /** ASIDE: the camera swings to the hall wall, close; she whispers */ aside: from("C08") - 4,
  /** the whip back: he is right there, close (lean) */ back: from("C09") - 6,
  /** flustered */ flustered: from("C10"),
};

// ---------------------------------------------------------------------------------------------------- D 午时 terrace
const D = {
  /** follow him onto the terrace, wide; wind; the long line of carriages below */ enter: seg("D").from,
  /** the 「第二天」 card (D03's beat): the same view, few carriages */ nextDay: [pre("D03"), from("D03") + 20] as Span,
  /** the carriages: 1 (day 1) until here, then few */ fewCars: pre("D03"),
  /** the creep (D03) */ creep: [from("D03"), to("D03")] as Span,
  /** he turns very slowly (D04's beat to its end); music out */ turn: [pre("D04"), to("D04")] as Span,
  /** the pan across the kneeling attendants; one guard stares into the lens at its end */ pan: [to("D04") + 12, pre("D05") + sec(1.6)] as Span,
  /** the fact card after D04 */ card: [CARDS.find((c) => c.id === "D04")!.from, CARDS.find((c) => c.id === "D04")!.to] as Span,
  /** he LEANS into the lens; the stare (to D06) */ lean: [from("D05") - 12, from("D06") - 1] as Span,
  /** the tremble (D06) */ tremble: [from("D06"), to("D06")] as Span,
  /** black after D06 (its hold, 0.6 s) */ black: [to("D06") + 1, seg("D").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- E 未时 flashback trip
const E = {
  /** back in the hall, bright, smug: he unrolls the sand table */ hall: seg("E").from,
  /** the cut to the table (E02's beat) */ toTable: pre("E02"),
  /** 泰山: rain, he shelters under a tree; E02 */ taishan: [pre("E02"), pre("E05") - 1] as Span,
  /** the official's hat pops onto the tree (on 五大夫) */ hat: capWord("E02", "五大夫").from,
  /** 湘山: the storm, the boat tilts, the camera tilts with it */ xiangshan: [pre("E05"), to("E07") + sec(1.2)] as Span,
  /** huff + head shake (砍!) */ huff: from("E07"),
  /** the mountain goes bare and red (1.2 s after E07) */ bare: [to("E07") + 1, to("E07") + sec(1.2)] as Span,
  /** back in the hall: the ASIDE to the wall (E08) */ back: from("E08") - 10,
};

// ---------------------------------------------------------------------------------------------------- F 戌时 night
const F = {
  /** he swaps the crown for the hood (EMPEROR_HOOD, F01's beat) */ hood: pre("F01"),
  /** she giggles (the beads show) */ giggle: from("F04"),
  /** 嘘!: he shoves the beads in (BLUSH1) */ beads: from("F05"),
  /** the BANDITS leap out; she DUCKS behind the rock (F06's beat) */ bandits: pre("F06"),
  /** the clash off-screen (1.5 s after F06), fast tremble */ clash: [to("F06") + 1, to("F06") + sec(1.5)] as Span,
  /** he straightens his robe */ straighten: from("F07") - 20,
  /** he glances at the lens, BLUSH1 */ glance: from("F08"),
  /** HIS HAND OVER THE LENS (the palm comes in over F09's last frames) */ handCover: [to("F09") - 6, to("F09") + 6] as Span,
  /** black after the hand (F09's hold) */ black: [to("F09") + 7, seg("F").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- G the last day + museum
const gMuseum = pre("G07");
const G = {
  /** the timestamp 「公元前210年 七月 沙丘」, heat shimmer, battery 8%; the CREEP to the closed carriage */ creep: [seg("G").from, from("G01") - 1] as Span,
  /** the officials pass bundles through the curtain; the thin voice answers (G02-G03) */ queue: [from("G02") - 20, to("G03")] as Span,
  /** G04-G05: officials hand slips in, unaware; on G05 attendants set baskets of salted fish on the carriages; flies (no separate cart) */ fishCart: [from("G04"), to("G05")] as Span,
  /** LOWER: the camera droops, the horizon tilts (G06's beat) */ lower: pre("G06"),
  /** THE CUT TO THE MUSEUM: the first perfectly still frame, no REC dot (G07's beat) */ museum: gMuseum,
  /** his voice off-screen (G08) */ voice: from("G08"),
  /** the last line, then the hold (1.5 s) and the fade to black */ last: from("G09"),
  /** the fade to black: from 1.5 s after G09 to the last frame */ fade: [Math.min(to("G09") + sec(1.5), TOTAL - 2), TOTAL - 1] as Span,
};

/** THE BEATS, per scene */
export const BEAT = { A, B, C, D, E, F, G };

// ---------------------------------------------------------------------------------------------------- the places
/** the place of every frame as [place, first, last] runs, in film order (the storyboard's cuts) */
export const SPANS: [Place, number, number][] = [
  ["corridor", seg("A").from, seg("A").to],
  ["hall", seg("B").from, seg("B").to],
  ["hall", seg("C").from, C.flash[0] - 1],
  ["table", C.flash[0], C.flash[1]],
  ["hall", C.flash[1] + 1, seg("C").to],
  ["terrace", seg("D").from, seg("D").to],
  ["hall", seg("E").from, E.toTable - 1],
  ["table", E.toTable, E.back - 1],
  ["hall", E.back, seg("E").to],
  ["night", seg("F").from, seg("F").to],
  ["road", seg("G").from, G.museum - 1],
  ["museum", G.museum, seg("G").to],
];
/** the place frame f shows (the storyboard's: segment builders may cut differently inside their own segment) */
export const placeAt = (f: number): Place => {
  for (const [p, a, b] of SPANS) if (f >= a && f <= b) return p;
  return f < 0 ? SPANS[0][0] : SPANS[SPANS.length - 1][0];
};
/** the shot id at a frame (the clearance checker's report): the segment's id until the segment builders name shots */
export const shotAt = (f: number): { id: string } => ({ id: SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "?" });

/** [] when every beat lies inside its own segment, every span is in order and SPANS cover the film without a gap */
export const beatCheck = (): string[] => {
  const bad: string[] = [];
  for (const [id, beats] of Object.entries(BEAT) as [SceneId, Record<string, number | number[]>][]) {
    const s = seg(id);
    for (const [k, v] of Object.entries(beats)) {
      const vs = Array.isArray(v) ? v : [v];
      for (const x of vs) if (!(x >= s.from && x <= s.to)) bad.push(`BEAT.${id}.${k} = ${x} is outside segment ${id} (${s.from}-${s.to})`);
      if (Array.isArray(v) && v.length === 2 && v[1] < v[0]) bad.push(`BEAT.${id}.${k} = [${v[0]}, ${v[1]}] runs backwards`);
    }
  }
  if (TITLE_SPAN[1] > seg("A").to) bad.push(`TITLE_SPAN ${TITLE_SPAN} runs past segment A (${seg("A").to})`);
  let next = 0;
  for (const [p, a, b] of SPANS) { if (a !== next || b < a) bad.push(`SPANS: ${p} ${a}-${b} (expected to start on ${next})`); next = b + 1; }
  if (next !== TOTAL) bad.push(`SPANS end on ${next - 1}, the film on ${TOTAL - 1}`);
  return bad;
};
