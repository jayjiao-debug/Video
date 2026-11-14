// THE NAMED BEATS of the Newton film (PLAN.md section 7, the storyboard; the script's stage directions). Every frame
// here is LOOKED UP from the generated timing (line(id), lineId(id), capWord(id, word), card(id), seg(id), TITLE_BLOCK):
// nobody types a frame number, so a re-timed voice moves every beat by itself. Offsets inside a silent beat are seconds
// (sec(s)) from a looked-up frame. If a lookup no longer exists after a change of the lines, the import throws and names it.
// WP1; segment builders read it and ask for additions in /home/user/newton_work/film/requests.md (or derive a beat the
// same way in their own file).
//   BEAT.A .. BEAT.G   per scene, the frames the storyboard names (a span is [first, last], inclusive)
//   TITLE_SPAN         the title block on the shut door after A02 (3 s; story.ts TITLE_BLOCK)
//   ASIDES             the six asides (03 06 15 23 27 35): the mic swings round to the lens, Newton soft behind it
//   PLATES             the day's clock: the five plate inserts with their hour
//   placeAt(f)         the place every frame shows (the storyboard's cuts); SPANS the same as [place, from, to] runs
//   shotAt(f)          { id } (the segment id, for the clearance checker)
//   beatCheck()        [] when every beat lies inside its segment and the spans are in order (the previews print it)
// Script line numbers (PLAN 7 says "44-50") are the lines file's n: line(44) = F09; the ids are A01 .. G04.
import { lineId, capWord, card, seg, SEGMENTS, TOTAL, FPS, TITLE_BLOCK, type Place, type SceneId } from "./story";

const from = (id: string) => lineId(id).from;
const to = (id: string) => lineId(id).to;
/** where the line's silent beat ("pre" in the lines file: the action before it) starts (= from when it has none) */
const pre = (id: string) => lineId(id).preFrom;
const sec = (s: number) => Math.round(s * FPS);
/** a span [first, last] (inclusive) */
export type Span = [number, number];
/** an aside's span: the mic swings to the lens 8 frames before the line and back 8 frames after it (not past its scene) */
const aside = (id: string): Span => [from(id) - 8, Math.min(to(id) + 8, seg(lineId(id).scene).to)];
const cardSpan = (id: string): Span => { const c = card(id); return [c.from, c.to]; };

/** the title block (PLAN 5): on the shut door, 0.4 s after "Good night" (A02), for 3 s; never on frame 0 */
export const TITLE_SPAN: Span = [TITLE_BLOCK.from, TITLE_BLOCK.to];

// ---------------------------------------------------------------------------------------------------- A 清晨 stairs
const aKnock = capWord("A01", "好").from;
const aShut = to("A02") + sec(0.4);
const A = {
  /** f0 .. the knock: the camera takes the last two steps at a run, low sun through the stair window, the mic swings in
   *  from the lower left */ run: [0, aKnock - 1] as Span,
  /** the mic raps on the door (the pizzicato pluck), on 好 of 早上好 */ knock: aKnock,
  /** the door, already opening, swings open: NEWTON in the doorway (candle stub, bird's-nest hair, ink, quill) */ doorOpen: [aKnock + 2, capWord("A01", "陪").from] as Span,
  /** "Good night." (over her 一天) */ goodNight: from("A02"),
  /** he shuts the door in the mic's face (the thud: the door is shut on this frame) */ doorShut: aShut,
  /** the candle glow under the door goes out */ glowOut: aShut + sec(0.5),
  /** THE TITLE BLOCK lands on the shut door (3 s, story.ts TITLE_BLOCK) */ title: TITLE_SPAN[0],
  /** ASIDE 03: the mic swings round to the lens */ aside03: aside("A03"),
  /** fact card 1 (A03): the door opens a crack, HUMPHREY slips out yawning (empty ink bottle) and pulls it shut */ card1: cardSpan("A03"),
  /** Humphrey's door opens a crack (0.4 s into card 1) */ humphreyOut: card("A03").from + sec(0.4),
  /** the door shut again behind him without a sound (1 s before card 1 ends) */ humphreyShuts: card("A03").to - sec(1.0),
  /** the mic swings to Humphrey (A04) */ micHumphrey: from("A04") - 6,
  /** "Laugh? Mr Newton?" */ laugh: from("A05"),
  /** he looks at her, at the door, back; shakes his head (A05's hold) */ headShake: to("A05") + 1,
  /** he goes down the stairs (out of frame by A06) */ humphreyDown: to("A05") + sec(0.6),
  /** ASIDE 06: 「好，今天我要让他笑一次。」 */ aside06: aside("A06"),
};

// ---------------------------------------------------------------------------------------------------- B 上午 room, morning
const B = {
  /** THE PLATE (the day's clock, morning): clean white light; Humphrey sets the covered dinner on the window table */ plate: [seg("B").from, pre("B01") + sec(0.9)] as Span,
  /** he lifts the lid: steam */ lid: pre("B01") + sec(0.5),
  /** pull back: NEWTON writing at the paper-buried desk */ pullBack: [pre("B01") + sec(0.9), from("B01") + sec(0.3)] as Span,
  /** "Sir, your dinner." (Newton does not look up) */ dinner: from("B01"),
  /** Humphrey goes (B01's hold) */ humphreyGoes: to("B01") + 1,
  /** the mic swings after Humphrey to the door: 「他说马上来！」 */ micDoor: from("B02") - 6,
  /** the mic back to Newton */ micBack: to("B02") + 1,
  /** the mic tilts to the drafts stack (B05) */ micDrafts: from("B05") - 6,
  /** "It fell to the ground. Not on me." (cold, precise, no face change) */ apple: from("B08"),
  /** ASIDE 15: 「没笑。」 */ aside15: aside("B09"),
  /** fact card 2 (B09) over the scratching quill */ card2: cardSpan("B09"),
};

// ---------------------------------------------------------------------------------------------------- C 中午 garden
const cGarden = from("C01") - 6;
const cStop = capWord("C04", "is").from + sec(0.2);
const cWhip = to("C05") + sec(0.5);
const C = {
  /** THE PLATE (noon): hard light, lid off, no steam, the window bars' short sharp shadows on the cloth */ plate: [seg("C").from, cGarden - 1] as Span,
  /** the cut to the garden: NEWTON walks a turn, hands behind his back; the camera walks BACKWARDS in front of him */ garden: cGarden,
  /** the walk (C01 .. C04) */ walk: [cGarden, cStop - 1] as Span,
  /** "Two laps is—": he stops dead mid-word, staring at nothing */ stop: cStop,
  /** he turns on his heel */ turn: cStop + sec(0.35),
  /** he RUNS for the staircase (C05 「诶？他想到什么了？」 as he goes) */ run: cStop + sec(0.7),
  /** THE WHIP after him up the stairs (its middle frame IS the cut to the room: he is already writing, STANDING) */ whip: cWhip,
  /** her hand drags the chair to the backs of his knees (C06 「坐下写嘛。」) */ chair: from("C06") - 10,
  /** "No time.": he waves it away without looking */ wave: from("C07"),
  /** the chair stays empty (C07's hold) */ emptyChair: to("C07") + 1,
};

// ---------------------------------------------------------------------------------------------------- D 下午 street + schools
const dSchools = pre("D01") + sec(1.5);
const D = {
  /** out of the college gate along the street, gown flapping, notes under his arm; the camera trots beside him */ street: [seg("D").from, dSchools - 1] as Span,
  /** her hand wipes the ink off his nose with a handkerchief in TWO strokes (from here: no ink) */ wipe: [pre("D01") + sec(0.35), pre("D01") + sec(1.1)] as Span,
  /** the second stroke (the ink is gone from the frame after it) */ wipe2: pre("D01") + sec(0.8),
  /** the cut through the tall door into the Schools */ schools: dSchools,
  /** ONE WIDE hold: rows of empty benches, dust in a sunbeam, one man at the front */ wide: [dSchools, from("D01") - 9] as Span,
  /** ASIDE 23: 「一个学生都没有。」 */ aside23: aside("D01"),
  /** he lays out his notes as if the hall were full (D02 .. D04) */ notes: [from("D02"), to("D04")] as Span,
  /** ASIDE 27: 「他没笑，我笑了。」 (his face unchanged, soft behind the mic) */ aside27: aside("D05"),
  /** he lectures to the empty benches (mouth moving, no words: the muffled echo is sound) */ lecture: [to("D05") + 9, to("D05") + sec(0.9)] as Span,
  /** the time cut: he gathers his notes */ timeCut: to("D05") + sec(0.9),
  /** she claps alone (her hand + the mic hand), until "Don't." */ clap: [to("D05") + sec(1.3), from("D06") - 1] as Span,
  /** "Don't." */ dont: from("D06"),
};

// ---------------------------------------------------------------------------------------------------- E 傍晚 room, gold
const E = {
  /** THE PLATE (evening): slanting gold light, cold; a FLY walks across it; push in until the fly is big (E01 over it) */ fly: [seg("E").from, to("E01")] as Span,
  /** "Have I not?": he steps to the table */ step: from("E02"),
  /** the first bite, standing, eyes on the page in his other hand */ bite1: to("E02") + sec(0.4),
  /** the second bite; then back to the desk */ bite2: to("E02") + sec(1.1),
  /** close on the plate: two bites gone */ twoBites: to("E02") + sec(1.5),
  /** "Friends interrupt.": he looks pointedly at the mic */ look: from("E04"),
  /** "Hooke." (the instant answer) */ hooke: from("E06"),
  /** ASIDE 35: 「秒答。胡克定律那个胡克。」 */ aside35: aside("E07"),
};

// ---------------------------------------------------------------------------------------------------- F 夜 garden -> elaboratory
const fInside = from("F01") - 4;
const fTime = to("F05") + sec(0.9);
const F = {
  /** the garden in blue moonlight: the camera follows his candle along the gravel to the glowing outbuilding */ walk: [seg("F").from, fInside - 1] as Span,
  /** inside: brick furnace, crucibles, the mouldy book; HUMPHREY, sooty, feeds the fire; firelight on every face */ inside: fInside,
  /** fact card 3 (F02): he stares at the fire, Humphrey shovels in charcoal */ card3: cardSpan("F02"),
  /** Humphrey takes the empty sack and goes out (F05's hold) */ sackOut: to("F05") + 1,
  /** time passes (a cut): the candle shorter, the fire deep red; Newton on a stool by the furnace door, the board on his knee */ timePass: fTime,
  /** close on the board: circles and triangles in charcoal */ board: [fTime + sec(0.2), from("F06") - 1] as Span,
  /** THE SLOW PUSH-IN: starts at 44 (F09) and stops at the end of 50 (F15) */ push: [from("F09"), to("F15")] as Span,
  /** he pokes the fire (F11's hold) */ poke: to("F11") + sec(0.2),
  /** the fire spits; one cello note (F14's hold) */ spit: to("F14") + sec(0.3),
  /** silence, only the fire; he pokes it; the push-in has stopped (F16's hold) */ silence: [to("F16") + 1, seg("F").to] as Span,
  /** the second poke in the silence */ poke2: to("F16") + sec(0.7),
};

// ---------------------------------------------------------------------------------------------------- G 凌晨两点
const gStrike2 = pre("G01") + Math.round((from("G01") - pre("G01")) * 0.4);   // 40 % into G01's silent beat (1.2 s of 3)
const gRoom = to("G04") + 1;
const gOutside = card("G04").to + 1;
const gDark = gOutside + sec(0.4);
/** HER CAMERA SWITCHES OFF (hud/vlog.tsx OFF_AT; cues.json sfx_poweroff on ["G", "to", -1.4]): 12 frames after the mix's
 *  last pluck (his window goes dark: G to - 1.77 s = segG's T_DARK), in the crickets, after the pluck has decayed. Tied
 *  to the scene's end like the pluck, so it follows if G's tail is extended (WP4, director vlog round 1, note 4) */
const gOff = seg("G").to + 1 - sec(1.4);
const G = {
  /** a clock strikes two (sound): the first stroke */ strike1: pre("G01") + 2,
  /** the second stroke: the board slides off his knee */ strike2: gStrike2,
  /** the board clatters at the camera's feet */ board: gStrike2 + sec(0.3),
  /** her hand picks it up and holds it into frame, close (circles and triangles); she sniffs; G01 over it */ boardUp: [gStrike2 + sec(0.5), to("G01")] as Span,
  /** THE LAUGH bursts out (eyes squeezed shut, mouth open, head shaking); the camera holds DEAD STILL. "What... use!"
   *  goes over its tail (capWord("G02", "what")) */ laugh: from("G02"),
  /** the laugh's hold after the words (~2 s) */ laughHold: [to("G02") + 1, to("G02") + sec(2.0)] as Span,
  /** HUMPHREY in the doorway with a full sack sees it and DROPS the sack (thump; the music comes back) */ sackDrop: to("G02") + sec(2.0),
  /** fact card 4 (G02): Newton wipes his eyes, takes his candle, stops at the door, the smile still on him */ card4: cardSpan("G02"),
  /** "Good night." (warm, still smiling) */ goodNight: from("G03"),
  /** 「晚安，牛顿先生。」 */ lastLine: from("G04"),
  /** the cut to his room by candle: he lifts the cold plate and eats a bite or two standing (plate framed right) */ room: gRoom,
  /** fact card 5 (G04) mid-left over the 2 a.m. bites */ card5: cardSpan("G04"),
  /** outside, from the elaboratory door: his lit window (the outbuilding still glows behind us) */ outside: gOutside,
  /** his window goes dark */ windowDark: gDark,
  /** her camera switches off: the REC lamp dies, the whole vlog UI goes grey and holds still (hud/vlog.tsx OFF_AT) */ cameraOff: gOff,
  /** then black: fading in to the film's darkest warm tone (not #000), to the last frame; never before the dead
   *  camera UI has held 24 frames (0.8 s: it must read on a phone; sfx_poweroff's power-down sweep lands here) */ black: [Math.max(gDark + sec(0.5), gOff + 24), TOTAL - 1] as Span,
};

/** THE BEATS, per scene */
export const BEAT = { A, B, C, D, E, F, G };

/** the six asides (PLAN 4): the mic swings round to face the lens, Newton out of focus behind it */
export const ASIDES: { id: string; span: Span }[] = ["A03", "A06", "B09", "D01", "D05", "E07"].map((id) => ({ id, span: aside(id) }));
/** the day's clock: the five plate inserts, each lit by its hour (room `hour`) */
export const PLATES: { scene: SceneId; hour: "morning" | "noon" | "evening" | "night"; span: Span; what: string }[] = [
  { scene: "B", hour: "morning", span: B.plate, what: "steam, lid lifted" },
  { scene: "C", hour: "noon", span: C.plate, what: "lid off, no steam, sharp bar shadows" },
  { scene: "E", hour: "evening", span: E.fly, what: "a fly walks across it" },
  { scene: "E", hour: "evening", span: [E.twoBites, E.twoBites + sec(0.8)], what: "two bites gone" },
  { scene: "G", hour: "night", span: [G.room, G.outside - 1], what: "eaten by candle at 2 a.m." },
];

// ---------------------------------------------------------------------------------------------------- the places
/** the place of every frame as [place, first, last] runs, in film order (the storyboard's cuts) */
export const SPANS: [Place, number, number][] = [
  ["stairs", seg("A").from, seg("A").to],
  ["room", seg("B").from, seg("B").to],
  ["room", seg("C").from, C.garden - 1],
  ["garden", C.garden, C.whip - 1],
  ["room", C.whip, seg("C").to],
  ["street", seg("D").from, D.schools - 1],
  ["schools", D.schools, seg("D").to],
  ["room", seg("E").from, seg("E").to],
  ["garden", seg("F").from, F.inside - 1],
  ["elaboratory", F.inside, seg("F").to],
  ["elaboratory", seg("G").from, G.room - 1],
  ["room", G.room, G.outside - 1],
  ["garden", G.outside, seg("G").to],
];
/** the place frame f shows (the storyboard's: segment builders may cut differently inside their own segment) */
export const placeAt = (f: number): Place => {
  for (const [p, a, b] of SPANS) if (f >= a && f <= b) return p;
  return f < 0 ? SPANS[0][0] : SPANS[SPANS.length - 1][0];
};
/** the shot id at a frame (the clearance checker's report): the segment's id until the segment builders name shots */
export const shotAt = (f: number): { id: string } => ({ id: SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "?" });

/** [] when every beat lies inside its own segment, every span runs forward, the title block sits in A (not on frame 0)
 *  and SPANS cover the film without a gap */
export const beatCheck = (): string[] => {
  const bad: string[] = [];
  for (const [id, beats] of Object.entries(BEAT) as [SceneId, Record<string, number | number[]>][]) {
    const s = seg(id);
    for (const [k, v] of Object.entries(beats)) {
      const vs = Array.isArray(v) ? v : [v];
      for (const x of vs) if (!(Number.isInteger(x) && x >= s.from && x <= s.to)) bad.push(`BEAT.${id}.${k} = ${x} is outside segment ${id} (${s.from}-${s.to})`);
      if (Array.isArray(v) && v.length === 2 && v[1] < v[0]) bad.push(`BEAT.${id}.${k} = [${v[0]}, ${v[1]}] runs backwards`);
    }
  }
  if (TITLE_SPAN[0] <= 0 || TITLE_SPAN[1] > seg("A").to) bad.push(`TITLE_SPAN ${TITLE_SPAN} must lie in segment A (1-${seg("A").to})`);
  for (const a of ASIDES) if (a.span[1] < a.span[0]) bad.push(`ASIDE ${a.id} runs backwards`);
  let next = 0;
  for (const [p, a, b] of SPANS) { if (a !== next || b < a) bad.push(`SPANS: ${p} ${a}-${b} (expected to start on ${next})`); next = b + 1; }
  if (next !== TOTAL) bad.push(`SPANS end on ${next - 1}, the film on ${TOTAL - 1}`);
  return bad;
};
