// THE NAMED BEATS of the Su film (PLAN.md section 8, the storyboard). Every frame here is LOOKED UP from the generated
// timing (line(id), lineId(id), capWord(id, word), cap(id, k), SEGMENTS, CARDS): nobody types a frame number, so a
// re-timed voice moves every beat by itself. If a lookup no longer exists after a change of the lines, the import throws
// and names it. WP1; segment builders read it and ask for additions in /home/user/su_work/requests.md (or derive a
// beat the same way in their own file).
//   BEAT.A .. BEAT.I   per scene, the frames the storyboard names (a span is [first, last], inclusive)
//   TITLE_SPAN         the title block (frames 0-90, it fades out over its last 12)
//   placeAt(f)         the place every frame shows (the storyboard's cuts: B's 黄州 flashback from flashIn to flashOut - 1)
//   vignetteAt(f)      the huangzhou vignette of a flashback frame ("slope" until BEAT.B.pot, then "pot")
//   SPANS              the same as [place, from, to] runs;  shotAt(f) -> { id } (the segment id, for the checker)
//   TRANSITIONS        the cross-segment overlays (fades through a tone, ink wipes, the flashback's ink dissolve):
//                      hud/ink.tsx transitionAt(f) draws the one on frame f (both sides of the cut)
//   beatCheck()        [] when every beat lies inside its segment and the spans are in order (the previews print it)
// Helpers below: from(id) = the line's first frame of speech; to(id) = its last; pre(id) = where its silent beat
// ("pre" in the lines file, the action before it) starts; word(id, w) = capWord(id, w).from (the word's first syllable).
import { lineId, capWord, cap, seg, card, SEGMENTS, TOTAL, FPS, type Place, type SceneId } from "./story";

const from = (id: string) => lineId(id).from;
const to = (id: string) => lineId(id).to;
const pre = (id: string) => lineId(id).preFrom;
const word = (id: string, w: string) => capWord(id, w).from;
const sec = (s: number) => Math.round(s * FPS);
const cardSpan = (id: string): Span => [card(id).from, card(id).to];
/** a span [first, last] (inclusive) */
export type Span = [number, number];
/** the frames each side of a cut that a fade through a tone or an ink wipe takes (PLAN 5: 6-12 frames each side) */
export const FADE_N = 10, WIPE_N = 12;

// ---------------------------------------------------------------------------------------------------- A 清晨 market
const A = {
  /** f0, already moving: the walk down the lane toward the stall (walk 1 -> 0 by 1.0 s) */ walk: [seg("A").from, seg("A").from + sec(1.0)] as Span,
  /** the butcher's cleaver thunks down on the block (sound) */ cleave: seg("A").from + sec(0.45),
  /** the servants carry the last good cuts away past her left (A01 to A02's 当官的) */ servants: [seg("A").from, word("A02", "当官的") + sec(1.2)] as Span,
  /** the red mic swings in from the lower left on 东坡 */ micIn: word("A01", "东坡"),
  /** he turns to the lens (您怎么在买骨头) */ turn: cap("A01", 1).from,
  /** he leans in, conspiratorial (A02) */ lean: from("A02") - 6,
  /** a nod toward the servants walking off with the meat (当官的) */ nod: word("A02", "当官的"),
  /** the mic to him (A03) */ micTo: from("A03"),
  /** he laughs at himself (laugh accent) and pats his chest (被贬 / 官) */ laugh: word("A04", "被贬"), pat: word("A04", "官"),
  /** he holds the spine bone right up to the lens (你看) */ boneUp: word("A05", "你看"),
  /** the small punch-in (还有肉) */ punchIn: word("A05", "还有肉"),
  /** card 1 (nobody speaks): he pays the butcher, tucks the bone under his arm, beckons "come" */ card: cardSpan("A05"),
  /** he pays (a nod, a coin) */ pay: card("A05").from + sec(0.4),
  /** he tucks the bone under his arm */ tuck: card("A05").from + sec(1.3),
  /** he beckons "come" */ beckon: card("A05").from + sec(2.0),
  /** THE WHIP RIGHT into B: its first frame (4 frames out in A, 4 in arriving in B: cam.ts whip(cam, f, BEAT.A.whip,
   *  { dir: 1, to }); the cut is B's first frame, BEAT.B.land = whip + 4) */ whip: seg("A").to - 3,
};
/** the title block 「采访苏东坡的一天」 / 「1097年 · 惠州」 (PLAN 6: frames 0-90, it fades out over the last 12) */
export const TITLE_SPAN: Span = [seg("A").from, seg("A").from + sec(3.0)];

// ---------------------------------------------------------------------------------------------------- B 上午 yard + 黄州
const B = {
  /** the whip lands in the yard: the house, the kids, MAI on the ladder, the dog, SU at the stove */ land: seg("B").from,
  /** MAI hangs the red lantern on the eave (yard param lantern 0 -> 1 over this span) */ hang: [seg("B").from, from("B09")] as Span,
  /** B06's FOUR ACTIONS, one per phrase: bone out of the pot with the chopsticks / dipped in the wine / a pinch of salt
   *  / onto the grill (sizzle) */ steps: [word("B06", "煮熟"), word("B06", "泡酒"), word("B06", "撒盐"), word("B06", "烤到")] as [number, number, number, number],
  /** he holds a grilled bone into frame (B07) */ hold: from("B07"),
  /** HER HAND TAKES IT (hand reach -> hold) on 慢慢剔 */ take: word("B07", "慢慢剔"),
  /** he mimes picking at a crab (螃蟹) */ crab: word("B07", "螃蟹"),
  /** she is chewing (hand "eat"), mic toward him (B08) */ chew: from("B08"),
  /** he looks at the bone in his own hand: picked spotless white (B09, deadpan) */ look: from("B09"),
  /** THE DOG CUTAWAY (B09's after): whip DOWN to the dog (camera 0.5 m): it sniffs a white bone, looks up, betrayed */ dog: [to("B09") + 1, from("B10") - 1] as Span,
  /** the mic swings round to the lens: the aside (B10), laughing */ aside: from("B10") - 6,
  /** the camera rises back to her eye height (B10's end) */ rise: to("B10") - 15,
  /** B11: he waves the bone at the house, the kids, the son on the ladder: the small pan out and back */ pan: [from("B11"), to("B11")] as Span,
  /** B13: counting on his fingers */ count: from("B13"),
  /** B14: a shrug, light */ shrug: from("B14"),
  /** THE FLASHBACK: whip IN to 黄州 on the start of B15 (placeAt is huangzhou from here to flashOut - 1) */ flashIn: from("B15"),
  /** the cut inside the flashback from the "slope" vignette to the "pot" (between B15 and B16) */ pot: from("B16") - 3,
  /** B16's after: the lid lifts: glossy red cubes of pork (close) */ lid: to("B16") + 1,
  /** INK DISSOLVE OUT back to the yard on B18's start: she says B17 「这就是东坡肉！」 over the red pork, Su answers B18 in the yard (hud InkDissolve; TRANSITIONS) */ flashOut: from("B18"),
  /** B18: a thumb over his shoulder toward "far away" (那块坡) */ thumb: word("B18", "那块坡"),
};

// ---------------------------------------------------------------------------------------------------- C 中午 lychee tree
const C = {
  /** C's pre: the camera comes close; he TOSSES a lychee */ toss: pre("C19") + 8,
  /** her hand CATCHES it (snaps in from the lower right) */ catch: from("C19") - 4,
  /** C20: mock-solemn, then the wink (夸张) */ wink: word("C20", "夸张"),
  /** C20's after: the camera TILTS DOWN to the mountain of shells at the bed's foot (shells 1) */ tilt: [to("C20") + 1, from("C21") - 1] as Span,
  /** the mic swings to the lens (C21 「一点。」 at the lens, the shells in frame) */ aside: from("C21") - 8,
  /** the mic back to him (C22) */ micBack: from("C22") - 4,
  /** C23's after: he lies back, hands behind his head; a far-off temple bell */ lieBack: to("C23") + 1, bell: to("C23") + sec(0.8),
  /** C25: drowsy, reciting (eyes half shut) */ recite: from("C25"),
  /** C26 after + card 2: he is already snoring (sleep, a slow chest rise), a lychee shell on his belly; a slow drift back */ snore: [to("C26") + 1, seg("C").to] as Span,
  /** card 2 */ card: cardSpan("C26"),
};

// ---------------------------------------------------------------------------------------------------- D 下午 the gate (STILL)
const D = {
  /** hooves on the hill road (the music stops dead) */ hooves: seg("D").from,
  /** the courier reins in at the gate and unrolls the scroll; the family comes out */ rein: from("D27") - sec(0.8), family: pre("D27") + sec(0.6),
  /** D29's after: nobody moves; SU takes the scroll and READS it for a long time (focus). Hold. */ read: [to("D29") + 1, from("D30") - 1] as Span,
  /** he takes the scroll */ take: to("D29") + 10,
  /** D30: he looks up, genuinely curious ... */ look: from("D30") - 4,
  /** ... brightening (好吃) */ brighten: word("D30", "好吃"),
  /** D30's after: the mic swings to the lens (D31) */ aside: to("D30") + 1,
  /** the FADE THROUGH GOLD out of D (its D side; TRANSITIONS) */ fade: [seg("D").to - FADE_N + 1, seg("D").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- E 傍晚 room
const E = {
  /** the fade through gold into E (its E side) */ fadeIn: [seg("E").from, seg("E").from + FADE_N - 1] as Span,
  /** E33: a glance at the family on 给他们住 */ glance: word("E33", "给他们住"),
  /** E35: writing as he speaks */ write: from("E35"),
  /** E36 「啊？」: a jolt (camera kick) */ jolt: from("E36"),
  /** E39 「找吃的。」 grinning */ grin: from("E39"),
  /** card 3: he blots the letter, still humming */ card: cardSpan("E39"), blot: card("E39").from + sec(0.5),
  /** E40: the mic swings to the lens; her voice wobbles: the camera sags (a slow lower from 他觉得) */ aside: from("E40") - 6, sag: word("E40", "他觉得"),
  /** the FADE THROUGH DEEP BLUE out of E */ fade: [seg("E").to - FADE_N + 1, seg("E").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- F 夜 pines
const F = {
  /** the fade through deep blue into F */ fadeIn: [seg("F").from, seg("F").from + FADE_N - 1] as Span,
  /** he walks along the lake path with the lantern (she a step behind and to the side) until he stops */ walk: [seg("F").from, to("F45")] as Span,
  /** he pats his round belly (肚子) */ pat: word("F41", "肚子"),
  /** F45's after: HE STOPS. The grave under the pavilion ahead */ stop: to("F45") + 1,
  /** he sets the lantern down on the step (the warm glow now low) */ lantern: to("F45") + sec(1.0),
  /** F46's after: he laughs once at the memory (laugh accent) */ laugh: to("F46") + 1,
  /** THE SLOW PUSH-IN (no sway): from F48's end to the end of F50 */ push: [to("F48") + 1, to("F50")] as Span,
  /** F50: he turns to the grave (back three-quarters) ... then his head bows (带不走) */ turn: from("F50") - 6, bow: word("F50", "带不走"),
  /** F50's after: silence; the mic hand drops out of frame ("low") */ low: to("F50") + 1,
  /** he wipes his eyes with his sleeve */ wipe: to("F50") + sec(0.8),
  /** he picks up the lantern */ pickUp: to("F50") + sec(1.6),
  /** he turns to the lens and smiles (F51) */ smile: from("F51") - 10,
  /** the FADE THROUGH BLUE-BLACK out of F (to dawn) */ fade: [seg("F").to - FADE_N + 1, seg("F").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- G 黎明 river
const G = {
  /** the fade from blue-black to dawn into G */ fadeIn: [seg("G").from, seg("G").from + FADE_N - 1] as Span,
  /** G52: shouting back across the water, waving his whole arm */ wave: from("G52"),
  /** THE INK WASH out of G (its G side: the wipe's first half) */ wipe: [seg("G").to - WIPE_N + 1, seg("G").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- H 两年后 儋州
const H = {
  /** the ink wash into H (its H side: the wipe's second half) */ wipeIn: [seg("H").from, seg("H").from + WIPE_N - 1] as Span,
  /** THE STAMP 两年后 · 儋州 pressed in (held ~2.5 s, then fades) */ stamp: seg("H").from + WIPE_N,
  /** he prises an oyster open, slurps it, closes his eyes (bliss) */ slurp: from("H53") - 12,
  /** he leans to the lens on 千万别让北方人知道 */ lean: word("H53", "千万"),
  /** card 4: he goes back to his oyster; GUO laughs */ card: cardSpan("H55"), laugh: card("H55").from + sec(0.4),
  /** THE INK WASH out of H */ wipe: [seg("H").to - WIPE_N + 1, seg("H").to] as Span,
};

// ---------------------------------------------------------------------------------------------------- I 四年后 金山寺
const iCard = card("I57");
const I = {
  /** the ink wash into I */ wipeIn: [seg("I").from, seg("I").from + WIPE_N - 1] as Span,
  /** THE STAMP 四年后 · 金山寺 */ stamp: seg("I").from + WIPE_N,
  /** I56's after: he looks at the portrait for a long time (back three-quarters), then his face turns back */ look: [to("I56") + 1, from("I57") - 1] as Span,
  /** he smiles, the same smile as at the market */ smile: from("I57") - 12,
  /** the camera eases in a little on him (I57) */ ease: from("I57"),
  /** THE THREE NAMES, each on its own syllable (hud EndNames) */ names: [word("I57", "黄州"), word("I57", "惠州"), word("I57", "儋州")] as [number, number, number],
  /** from I57's end the three small painted pictures fade up under the names */ pictures: to("I57") + 1,
  /** the 3D picture darkens under the names (to the card's start) */ dim: [to("I57") + 1, iCard.from] as Span,
  /** card 5 */ card: [iCard.from, iCard.to] as Span,
  /** everything fades to black by the last frame (black on the last frames) */ black: [iCard.to + 1, TOTAL - 1] as Span,
};

/** THE BEATS, per scene */
export const BEAT = { A, B, C, D, E, F, G, H, I };

// ---------------------------------------------------------------------------------------------------- the places
/** the place of every frame as [place, first, last] runs, in film order (the storyboard's cuts) */
export const SPANS: [Place, number, number][] = [
  ["market", seg("A").from, seg("A").to],
  ["yard", seg("B").from, B.flashIn - 1],
  ["huangzhou", B.flashIn, B.flashOut - 1],
  ["yard", B.flashOut, seg("B").to],
  ["yard", seg("C").from, seg("C").to],
  ["yard", seg("D").from, seg("D").to],
  ["room", seg("E").from, seg("E").to],
  ["pines", seg("F").from, seg("F").to],
  ["river", seg("G").from, seg("G").to],
  ["beach", seg("H").from, seg("H").to],
  ["temple", seg("I").from, seg("I").to],
];
/** the place frame f shows (the storyboard's: segment builders may cut differently inside their own segment) */
export const placeAt = (f: number): Place => {
  for (const [p, a, b] of SPANS) if (f >= a && f <= b) return p;
  return f < 0 ? SPANS[0][0] : SPANS[SPANS.length - 1][0];
};
/** the huangzhou vignette of frame f (the flashback: "slope" for B15, "pot" from BEAT.B.pot) */
export const vignetteAt = (f: number): "slope" | "pot" => (f >= B.pot ? "pot" : "slope");
/** the shot id at a frame (the clearance checker's report): the segment's id until the segment builders name shots */
export const shotAt = (f: number): { id: string } => ({ id: SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "?" });

// ---------------------------------------------------------------------------------------------------- transitions
/** A CROSS-CUT OVERLAY (PLAN 5): `cut` = the first frame of the new picture; the overlay runs from `from` to `to`
 *  (inclusive) round it. kind: "tone" = a fade through `tone` (and on to `tone2` on the far side, the dawn), "ink" = the
 *  ink-wash wipe (hud InkWipe), "dissolve" = the flashback's ink-wash out (hud InkDissolve). (The whips A->B, into the
 *  flashback and the dog cutaway are the camera's: cam.ts whip + whipSmear, in the segments.) */
export type Transition = { kind: "tone" | "ink" | "dissolve"; cut: number; from: number; to: number; tone?: string; tone2?: string; what: string };
export const TRANSITIONS: Transition[] = [
  { kind: "dissolve", cut: B.flashOut, from: B.flashOut - 8, to: B.flashOut + 13, what: "黄州 ink scroll -> the yard (B18)" },
  { kind: "tone", cut: seg("E").from, from: D.fade[0], to: E.fadeIn[1], tone: "#f4c66a", what: "D -> E through gold" },
  { kind: "tone", cut: seg("F").from, from: E.fade[0], to: F.fadeIn[1], tone: "#1f2d5c", what: "E -> F through deep blue" },
  { kind: "tone", cut: seg("G").from, from: F.fade[0], to: G.fadeIn[1], tone: "#121a30", tone2: "#e9b48e", what: "F -> G through blue-black to dawn" },
  { kind: "ink", cut: seg("H").from, from: G.wipe[0], to: H.wipeIn[1], what: "G -> H ink wash" },
  { kind: "ink", cut: seg("I").from, from: H.wipe[0], to: I.wipeIn[1], what: "H -> I ink wash" },
];

/** [] when every beat lies inside its own segment, every span is in order and SPANS cover the film without a gap */
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
