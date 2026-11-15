// THE NAMED BEATS of the Newton film, v5 (script_v5.md's 画面/声音 column, the camera plans' director notes, and the
// sound's frames: /home/user/newton_work/film/sound/SYNC_POINTS.md "What the picture has to move": THE PICTURE LANDS ON
// THE SOUND, NEVER THE OTHER WAY). Every frame here is LOOKED UP from the generated timing (line(id), capWord(id, word),
// card(id), seg(id), TITLE_BLOCK) plus the sound's own offsets, written the way cues.json and SYNC_POINTS write them:
//   endAt("A02", 0.40)   = round((line("A02").end + 0.40) x 30)       "A02 end + 0.40"
//   startAt("A02", -1.55) = round((line("A02").start - 1.55) x 30)    "A02 start - 1.55"
//   segAt("D", 2.10)     = seg("D").from + round(2.10 x 30)           "D from + 2.10" (the sound reads the scene's cut)
//   cardEndAt("B09", -0.3) = card("B09").to + 1 + round(-0.3 x 30)    "card:B09 to - 0.30"
//   word("C04", "is")    = capWord("C04", "is").from                  the frame a word starts (a move lands on it)
//   cutOn("F01", -0.13)  = floor((line("F01").start - 0.13) x 30)     a cut: the frame its sound falls in
// Nobody types a frame number, so a re-timed voice (or a re-anchored cue that keeps its anchor) moves every beat by
// itself. If a lookup no longer exists after a change of the lines, the import throws and names it.
// Rebuilt 14 Nov (the prep for the v5 scene rebuild: /home/user/newton_work/film/rebuild/PREP.md has every frame).
//   BEAT.A .. BEAT.G   per scene, the frames the v5 script and the sound name (a span is [first, last], inclusive;
//                      a list of three or more is a list of hits, e.g. the three footsteps)
//   TITLE_SPAN         the title block (skin A's 「手稿」 title on the shut door: story.ts TITLE_BLOCK, hud/ms/when.ts)
//   ASIDES             RETIRED (the whisper replaced the old aside: whisper.ts whisperLean / whisperSpan): kept only for
//                      the old shots' asideK until each scene is rebuilt; it reads whisper.ts WHISPER_LINES
//   JOINS              THE 11 JOINS of script v5 ("The joins between places"): clock / whip / match / whip / clock /
//                      whip / clock / whip / match / clock / match; each looked up; a clock join carries its RACE (the
//                      frames the REC clock runs fast: hud/vlog.tsx RACES), a whip its outgoing half (`out`)
//   joinAfter(f), joinClip(from, to)   the next join; the last frame a subtitle / fact card may show (OVERVIEW item 4)
//   PLATES             the day's clock: the plate inserts with their hour
//   placeAt(f)         the place every frame shows (v5's places); SPANS the same as [place, from, to] runs
//   shotAt(f)          { id } (the segment id, for the clearance checker)
//   beatCheck()        [] when every beat lies inside its segment, the spans and joins are in order, every place change
//                      is a join and every join a place change (except the scene starts and the no-cut race ⑩)
// KEPT NAMES: a few beats keep a v4 name because the old shots (until their rebuild) or the sound lane's sync table
// (remix_v5/tools/sync_points_md.py) read it; each says so and stands on its v5 equivalent. New code uses the v5 name.
import { line, capWord, card, seg, SEGMENTS, TOTAL, FPS, TITLE_BLOCK, COLD_OPEN_S, type Place, type SceneId } from "./story";
import { CARD_LEN, FREEZE } from "./freeze";
import { WHISPER_LINES } from "./whisper";

const from = (id: string) => line(id).from;
const to = (id: string) => line(id).to;
const sec = (s: number) => Math.round(s * FPS);
/** the sound's anchors (cues.json / SYNC_POINTS): seconds on the line's own clock, then rounded to a frame */
const endAt = (id: string, s: number) => Math.round((line(id).end + s) * FPS);
const startAt = (id: string, s: number) => Math.round((line(id).start + s) * FPS);
const segAt = (id: SceneId, s: number) => seg(id).from + sec(s);
/** the frame a sound at seg(id).from + s seconds STARTS in (floor; for an offset on a half frame, where rounding would
 *  put the beat a frame after the sound's own frame in SYNC_POINTS) */
const segOn = (id: SceneId, s: number) => seg(id).from + Math.floor(s * FPS + 1e-6);
/** a CUT on a sound: the frame the sound's moment falls in (floor: the cut never comes after its sound) */
const cutOn = (id: string, s: number) => Math.floor((line(id).start + s) * FPS + 1e-6);
const cardEndAt = (id: string, s: number) => card(id).to + 1 + sec(s);
/** the frame a word of a line starts on (zh characters for her lines, the English words said for his and Humphrey's) */
const word = (id: string, w: string) => capWord(id, w).from;
/** a span [first, last] (inclusive) */
export type Span = [number, number];
/** RETIRED: the old aside's span (the mic swung to the lens 8 frames before the line and back 8 after it) */
const aside = (id: string): Span => [from(id) - 8, Math.min(to(id) + 8, seg(line(id).scene).to)];
const cardSpan = (id: string): Span => { const c = card(id); return [c.from, c.to]; };

/** the title block: skin A's title on the shut door (story.ts TITLE_BLOCK = hud/ms/when.ts's title item, f184-233) */
export const TITLE_SPAN: Span = [TITLE_BLOCK.from, TITLE_BLOCK.to];

// ---------------------------------------------------------------------------------------------------- A 清晨 05:00 his door
const aKnock = segAt("A", COLD_OPEN_S.knock);
const coldOpen: Span = [0, aKnock - 1];
const doorClick: number = endAt("B02", 0.15);
const A = {
  /** THE COLD OPEN through his door gap: he writes standing by a candle stub, the title on the door leaf; HOLD */ coldOpen,
  /** his STOP 1/5: he and the quill freeze, the scratching cut dead (sound f45-59), the birds go on */ stop: [segAt("A", COLD_OPEN_S.stop), segAt("A", 2.0) - 1] as Span,
  /** the fast burst of scratching after the stop */ burst: [segAt("A", 2.0), segAt("A", 2.65) - 1] as Span,
  /** RAP 1 on the door (the invisible hand; the frame nods forward a hair and the leaf shivers), pluck D4 */ knock: aKnock,
  /** RAP 2 (the same nod and shiver), pluck A4 */ knock2: segAt("A", 2.49),
  /** the hinge creaks and the leaf swings wider (f76) .. he is in the doorway (his last step f118, there by A02 - 0.5 s) */ doorOpen: [segAt("A", 2.52), from("A02") - sec(0.5)] as Span,
  /** his three steps on bare boards to the door (14 f after the knock: he finishes the stroke first) */ steps: [startAt("A02", -1.55), startAt("A02", -1.10), startAt("A02", -0.65)],
  /** the hinge's last creak, under "Good night." */ hingeLast: startAt("A02", -0.30),
  /** "Good night." (LOOK 1/4): the 5-frame SNAP ZOOM to the scene's extreme close lands on "Good" (= A02's first frame) */ goodNight: from("A02"),
  /** the door swings at her (air): the PULL BACK with the door starts */ doorSwing: endAt("A02", 0.28),
  /** THE THUD: the door is shut on this frame, the one JOLT (the mix's sfx_door_shut: cues.json sync 0.235 puts the
   *  clip's attack ON A02 end + 0.40; measured in mix_48k.wav: the slam at 5.91 s, loudest 5.93 s = f178) */ doorShut: endAt("A02", 0.40),
  /** a pigeon flaps off the sill */ pigeon: endAt("A02", 0.60),
  /** THE TITLE writes on the shut door (skin A, hud/ms/when.ts title item; its nib sound is f179, inside the thud) */ title: TITLE_SPAN[0],
  /** the line of candlelight under his door goes out on 睡 of A03 (he has gone to bed) */ glowOut: word("A03", "睡"),
  /** Humphrey's door: the latch and creak as it opens a crack; HE SLIPS OUT YAWNING (the FOLLOW to the stair head) */ humphreyOut: endAt("A03", 0),
  /** his slippers on the boards */ slippers: endAt("A03", 0.35),
  /** his door clicks shut (drawn without a sound until the click) */ humphreyShuts: startAt("A04", -0.25),
  /** "Laugh? Mr Newton?": the SNAP ZOOM to a close lands on "Laugh" (= A05's first frame) */ laugh: from("A05"),
  /** he looks at her, at the door, back; a slow head shake (A05's hold) */ headShake: to("A05") + 1,
  /** he goes down the stairs: his steps from here, fading (the PAN BACK to the door lands on 好 of A06) */ humphreyDown: endAt("A05", 0.10),
  /** 好 of A06: the pan back to his door lands here with the whisper lean (the mission said to his door) */ mission: word("A06", "好"),
  /** his bed creaks behind the door */ bedCreak: endAt("A06", -0.20),
  /** one muffled snore: the A06 lean releases on it */ snore: endAt("A06", -0.15),
  /** fact card 1 (A06) mid-left over the held shut door; its ding f587 */ card1: cardSpan("A06"),
  // kept names (the old segA / the sound lane's sync table read them): run = coldOpen; micHumphrey = 6 frames before A04;
  // aside03 / aside06 = the RETIRED mic spans (v5: whisper.ts whisperLean / whisperSpan("A03"))
  /** KEPT NAME = coldOpen */ run: coldOpen,
  /** KEPT NAME (old segA): 6 frames before A04 (v5: the two-thing HOLD on Humphrey at the stair head) */ micHumphrey: from("A04") - 6,
  /** KEPT NAME (old segA): RETIRED mic span of A03 */ aside03: aside("A03"),
  /** KEPT NAME (old segA): RETIRED mic span of A06 */ aside06: aside("A06"),
};

// ---------------------------------------------------------------------------------------------------- B 上午 his room
const bWalk: Span = [startAt("B03", -0.35), word("B03", "写")];
const B = {
  /** THE PLATE (the day's clock, morning): the insert, Humphrey's sleeve and face beside it; HOLD until the step back */ plate: [seg("B").from, word("B01", "your") - 1] as Span,
  /** the cover's clink: Humphrey lifts the lid, steam */ lid: segAt("B", 0.15),
  /** "Sir, your dinner." */ dinner: from("B01"),
  /** THE STEP BACK from the insert to the two-thing in depth, starting after "Sir", landing on "dinner" (name kept: the
   *  old segB reads pullBack) */ pullBack: [word("B01", "your"), word("B01", "dinner")] as Span,
  /** FLICK 1/4: the small dry swish (two fingers low, without looking) */ flick: endAt("B01", 0.08),
  /** Humphrey sighs */ sigh: endAt("B01", 0.32),
  /** his steps to the door: the FOLLOW to the doorway starts (only after the flick has read) */ humphreyGoes: endAt("B01", 0.60),
  /** the door clicks shut behind him (after B02) */ doorClick,
  /** her three steps to the desk: the TURN AND WALK lands on 写 of B03 */ steps: [startAt("B03", -0.35), startAt("B03", 0.15), startAt("B03", 0.65)],
  /** the walk: her first step .. 写 (where it lands; the picture stops on B03's last frame) */ walk: bWalk,
  /** THE FREEZE: Newton's intro card; the picture holds B03's last frame (freeze.ts; the room tone and the quill stop) */ freeze: [FREEZE.at + 1, FREEZE.at + CARD_LEN] as Span,
  /** the picture runs again (the room tone and the quill come back; B04's voice 2 frames later) */ live: FREEZE.at + CARD_LEN + 1,
  /** SNAP TO THE THING on 这 of B05: the drafts stack */ drafts: word("B05", "这"),
  /** TILT BACK UP to his face, landing on "lost" (B06) */ lost: word("B06", "lost"),
  /** the SLOW PUSH from her first word of B07 to the close of his face, landing on "Not" (B08) */ push: [from("B07"), word("B08", "Not")] as Span,
  /** "It fell to the ground. Not on me." (cold, precise, no face change) */ apple: from("B08"),
  /** SKIN A, METER TICK 1: the nib on the cross (after 「没笑。」, before card 2) */ tick1: endAt("B09", 0.223),
  /** fact card 2 (B09): the EASE BACK to the desk under it; its ding f1482 */ card2: cardSpan("B09"),
  /** NOON: the college clock's first stroke (window side, sound only), under card 2's last 0.3 s: she turns to it */ strike: cardEndAt("B09", -0.30),
  /** WHIP ② left to the window table: its outgoing half (6 frames) up to C's first frame */ whipOut: seg("C").from - 6,
  /** KEPT NAME (the sound lane's sync table) = doorClick */ micBack: doorClick,
};

// ---------------------------------------------------------------------------------------------------- C 中午 plate, garden, room
const cMatch = from("C01");
const cStop = endAt("C04", -0.10), cRun = endAt("C04", 0.395);
const cWhip = endAt("C05", 0.29);
const cPush: [number, number, number] = [startAt("C06", -0.72), startAt("C06", -0.43), startAt("C06", -0.14)];
const C = {
  /** THE PLATE (noon): lid off, no steam, the bars' short hard shadows; HOLD 1.0 s; its last frame is the match frame */ plate: [seg("C").from, cMatch - 1] as Span,
  /** MATCH ③: the plate becomes the sundial's round dial in the garden (same place, same size); C01 starts on it */ garden: cMatch,
  /** the walk: he walks his turn straight at the dial (a still frame) until the stop */ walk: [cMatch, cStop - 1] as Span,
  /** the ZOOM IN off the dial to his whole figure lands on "out" (C02) */ out: word("C02", "out"),
  /** the SNAP ZOOM to the scene's extreme close lands on "is" (C04) */ is: word("C04", "is"),
  /** STOP 2/5: the gravel stops dead, he freezes (15 f: mus_noon's scored stop inside it) */ stop: cStop,
  /** the freeze: the stop .. the frame before his first running step */ freeze: [cStop, cRun - 1] as Span,
  /** he turns on his heel and RUNS: his first running step (the gravel run; mus_noon back) */ run: cRun,
  /** 诶 of C05: the PULL BACK AND PAN after him lands (wide, he runs for his staircase) */ chase: from("C05"),
  /** WHIP ④ up the range front: its outgoing half (6 frames) .. */ whipOut: cWhip - 6,
  /** .. and THE CUT inside it (whoosh peak), into his room */ whipCut: cWhip,
  /** the chair's three pushes (the lens travels with the chair: it moves only while the lens moves) */ pushes: cPush,
  /** THE PUSH-ALONG: push 1 .. the chair knocks against the backs of his knees on 坐 of C06 */ chair: [cPush[0], startAt("C06", 0.135)] as Span,
  /** the knock on his knees, on 坐 */ knee: startAt("C06", 0.135),
  /** "No time.": FLICK 2/4 at his hip, toward the chair */ flick: from("C07"),
  /** the skid: his calves shove the chair back across the boards */ skid: endAt("C07", 0.10),
  /** THE JOLT: the chair knocks into the lens (the 拒收 stamp's thump inside it: hud/ms/when.ts stamp jolt) */ jolt: endAt("C07", 0.65),
  /** HOLD after the jolt: the empty chair at her feet, Newton writing beyond it, the cold plate (clock join ⑤ over it) */ emptyChair: endAt("C07", 0.65) + 1,
  /** KEPT NAME (the sound lane's sync table) = run */ turn: cRun,
};

// ---------------------------------------------------------------------------------------------------- D 下午 street, Schools
const dWhip = segAt("D", 2.10);
const dClap1 = startAt("D06", -1.45), dClap2 = startAt("D06", -0.70);
const dPaper = endAt("D01", -0.05);
const D = {
  /** the street: a medium-wide HOLD from across it, the gate and both directions; he walks into it */ street: [seg("D").from, dWhip - 1] as Span,
  /** his two steps the wrong way */ wrong: [segOn("D", 0.15), segOn("D", 0.55)] as Span,
  /** STOP 3/5: the footsteps stop dead (no step); the 12 f stop, a double blink, he turns on his heel */ stop: [segAt("D", 0.80), segAt("D", 1.85) - 1] as Span,
  /** his first hurried stride back: whip ⑥ goes after him */ stepBack: segAt("D", 1.85),
  /** WHIP ⑥: its outgoing half (4 frames) .. */ whipOut: dWhip - 4,
  /** .. and THE CUT inside it (whoosh peak; the tall door's creak) into the Schools */ schools: dWhip,
  /** ONE WIDE: rows of empty benches, the sunbeam, one small man walking up the aisle (his steps echo from f2102) */ wide: [dWhip, from("D01") - 1] as Span,
  /** paper rustle: he lays out his notes as if the hall were full */ paper: dPaper,
  /** the notes laid out .. to the end of D04 */ notes: [dPaper, to("D04")] as Span,
  /** the ZOOM IN to a medium lands on "miss" (D02) */ miss: word("D02", "miss"),
  /** the SLOW PUSH from her question (D03) to the scene's extreme close, landing on "students" (D04) */ push: [from("D03"), word("D04", "students")] as Span,
  /** 我 of D05: the lean releases with a PULL BACK to the medium as he turns to the benches */ release: word("D05", "我"),
  /** SKIN A, METER TICK 2 (a screen sound, no jolt) */ tick2: endAt("D05", 0.11),
  /** his lecture to nobody as a muffled echo, mouth moving, until clap 1 cuts him off; he gathers his notes */ lecture: [endAt("D05", 0.12), dClap1 - 1] as Span,
  /** CLAP 1 (sound only): the frame jolts (her body), his head jolts, a blink */ clap1: dClap1,
  /** CLAP 2: the same */ clap2: dClap2,
  /** "Don't." (FLICK 3/4): medium HOLD to the end of D */ dont: from("D06"),
  /** KEPT NAME (the sound lane's sync table): clap 1 .. clap 2 */ clap: [dClap1, dClap2] as Span,
};

// ---------------------------------------------------------------------------------------------------- E 傍晚 his room
const E = {
  /** THE PLATE (evening): the insert, a fly on it; the PUSH IN to the fly lands on 您 of E01 */ fly: [seg("E").from, word("E01", "您")] as Span,
  /** the SWING from the fly to Newton at his desk lands on 吃 (his 4-frame head jolt) */ culprit: word("E01", "吃"),
  /** "Have I not?": he walks to the table, page in hand (the FOLLOW) */ step: from("E02"),
  /** fork clink 1 (the fork on the plate), then the bite */ clink1: endAt("E02", 0.25),
  /** bite 1, standing, eyes on the page */ bite1: endAt("E02", 0.40),
  /** fork clink 2 (skin A's lunch bar ticks to 2 % on it) */ clink2: endAt("E02", 1.25),
  /** bite 2 */ bite2: endAt("E02", 1.40),
  /** the plate: two bites gone (the STEP IN after he walks back to his desk) */ twoBites: endAt("E02", 1.50),
  /** her three steps to his desk (f2701 / 2715 / 2728): the TURN AND WALK lands on 朋 of E03 */ walk: [startAt("E03", -0.35), word("E03", "朋")] as Span,
  /** LOOK 2/4: on "interrupt" he lifts his eyes into the lens (the lens holds) */ look: word("E04", "interrupt"),
  /** "Hooke.": the SNAP ZOOM to the scene's extreme close lands on it (the crack: nothing moves) */ hooke: from("E06"),
  /** he sets the quill down (E07's tail) */ quillDown: endAt("E07", 0.05),
  /** his two steps out with his candle: he walks out of the extreme close */ exit: [endAt("E07", 0.25), endAt("E07", 0.60)] as Span,
  /** WHIP ⑧ after him into the night: its outgoing half (4 frames) up to F's first frame */ whipOut: seg("F").from - 4,
};

// ---------------------------------------------------------------------------------------------------- F 夜 garden, elaboratory
const fInside = cutOn("F01", -0.13);
const fSit = endAt("F05", 0.95);
const F = {
  /** the night garden: the FOLLOW of his candle along the gravel, the box hedge as foreground */ walk: [seg("F").from, fInside - 1] as Span,
  /** MATCH ⑨ on his candle (the flame at the same place and size): the furnace, the first shovel, the nocturne's note */ inside: fInside,
  /** the FOLLOW IN lands on 炼 of 炼金 (F01) in the three-thing */ gold: word("F01", "炼"),
  /** fact card 3 (F02): the SNAP TO THE THING (his own pages); its ding f3191 */ card3: cardSpan("F02"),
  /** the shovel under card 3, twice */ shovel: [endAt("F02", 0.70), startAt("F03", -1.40)] as Span,
  /** the SLOW PUSH over her promise lands on 一天 (F04) */ promise: [from("F04"), word("F04", "一天")] as Span,
  /** Humphrey takes the empty sack (his steps out f3490) */ sackOut: endAt("F05", 0.12),
  /** Newton sets his candlestick on the iron of the furnace top (in shot; it stands there through the night) */ candle: endAt("F05", 0.55),
  /** the stool: HE SITS (the only time); the STEP DOWN to his seated eye height lands on 火 of F06 */ sit: fSit,
  /** 火 of F06: the step down lands; she stays crouched there to the end of F */ fire: word("F06", "火"),
  /** charcoal scratching on the board on his knee */ board: [startAt("F06", -0.30), from("F07") - 1] as Span,
  /** THE TURN (F07): the quiet stretch starts here (no snaps, no jolts, no sway, the one slow push) to the end of G02 */ quiet: from("F07"),
  /** THE ONE SLOW PUSH: from "My mother" (F09) to "dressings" (F15), the scene's extreme close, held through F16 and the race */ push: [from("F09"), word("F15", "dressings")] as Span,
  /** he pokes the fire */ poke: endAt("F11", 0.10),
  /** the fire spits: the light's 5-6 f rise starts here (in-world only, never a frame flash); the cello note f4315 */ spit: endAt("F14", 0.15),
  /** only the fire (no poke after F16): the held extreme close to the end of F */ silence: [to("F16") + 1, seg("F").to] as Span,
  /** RACE ⑩ starts over the held extreme close (no cut): the firelight sinks to embers from here; it lands on G.strike1 */ race: endAt("F16", 0.30),
  /** KEPT NAME (old segF, the sound lane's sync table) = sit (v5 has no time cut) */ timePass: fSit,
};

// ---------------------------------------------------------------------------------------------------- G 凌晨两点 elaboratory, room
const gStrike1 = endAt("F16", 1.00), gStrike2 = endAt("F16", 1.793);
const gStare = word("G01b", "用");
const gSack = endAt("G02", 1.33);
const gOff = seg("G").to + 1 - sec(1.4);
const gCandleOut = seg("G").to + 1 - sec(1.775);
const G = {
  /** RACE ⑩ LANDS on the town clock's first stroke (02:00): his hands go slack, the board slides off his knee */ strike1: gStrike1,
  /** the second stroke = the board's knock on the brick (one sound); it skids to her feet */ strike2: gStrike2,
  /** the board's knock (= strike2) */ board: gStrike2,
  /** THE TILT DOWN along his look; she reaches down and comes up onto one knee, level with him (eye 1.15 m), the board
   *  held up into the lower frame (G.md M2-M3, about 1.7 s, the lens easing out of the extreme close) */ kneel: [gStrike2, gStrike2 + sec(1.7)] as Span,
  /** her sniff */ sniff: startAt("G01a", -0.75),
  /** the board held to him in the lower frame, his face above it (G01a .. 用 of G01b) */ boardUp: [gStrike2 + sec(1.7), gStare] as Span,
  /** the beat between G01a and G01b in which the board turns to face him */ boardTurn: [to("G01a") + 1, from("G01b") - 1] as Span,
  /** STOP 5/5 on 用: the 20-frame stare, his eyes up to the lens (LOOK 3/4); she lowers the board; the crack ~10 f */ stare: [gStare, from("G02") - 1] as Span,
  /** THE LAUGH: the camera holds DEAD STILL */ laugh: from("G02"),
  /** mus_laugh's swell comes in (skin A's 1/1 lands with it) */ swell: endAt("G02", 0.08),
  /** the hold on the laugh after the words, to the thump */ laughHold: [to("G02") + 1, gSack - 1] as Span,
  /** THE THUMP: Humphrey drops the full sack in the doorway; THE PAN to the doorway is on it (20 f) */ sackDrop: gSack,
  /** fact card 4 (G02) beside Humphrey; its ding f5066 */ card4: cardSpan("G02"),
  /** "Good night." (LOOK 4/4, warm; the door left open) */ goodNight: from("G03"),
  /** his candle going away across the dark garden (gravel) */ gravel: endAt("G03", 0.20),
  /** 「晚安，牛顿先生。」 */ lastLine: from("G04"),
  /** MATCH ⑪: the circle on the board becomes his 2 a.m. plate in his room (his door open behind him) */ room: endAt("G04", 0.30),
  /** fact card 5 (G04) mid-left; its ding f5285 */ card5: cardSpan("G04"),
  /** the 2 a.m. bite: fork clink */ clink: endAt("G04", 1.20),
  /** THE CANDLE GOES OUT: he pinches it out (the knock's pluck, once; the snuff) */ candleOut: gCandleOut,
  /** HER CAMERA SWITCHES OFF: the REC lamp dies, the whole vlog UI goes grey and holds (hud/vlog.tsx OFF_AT) */ cameraOff: gOff,
  /** the end black, on the power-down sweep: never before the dead UI has held 24 frames */ black: [Math.max(gCandleOut + sec(0.5), gOff + 24), TOTAL - 1] as Span,
  /** KEPT NAME (the sound lane's sync table) = candleOut (v5: no garden window) */ windowDark: gCandleOut,
};

/** THE BEATS, per scene */
export const BEAT = { A, B, C, D, E, F, G };

/** RETIRED: the old asides (the mic swung round to the lens, Newton soft behind it). The asides are THE WHISPER
 *  (whisper.ts whisperLean, README section 10): never build a new shot on this list. It stays only for the old shots'
 *  asideK (shots/common.ts) until each scene's rebuild, and it reads the one list, whisper.ts WHISPER_LINES */
export const ASIDES: { id: string; span: Span }[] = WHISPER_LINES.map((id) => ({ id, span: aside(id) }));
/** the day's clock: the plate inserts, each lit by its hour (room `hour`) */
export const PLATES: { scene: SceneId; hour: "morning" | "noon" | "evening" | "night"; span: Span; what: string }[] = [
  { scene: "B", hour: "morning", span: B.plate, what: "steam, lid lifted" },
  { scene: "C", hour: "noon", span: C.plate, what: "lid off, no steam, sharp bar shadows; its last frame matches the sundial" },
  { scene: "E", hour: "evening", span: E.fly, what: "a fly walks across it" },
  { scene: "E", hour: "evening", span: [E.twoBites, E.walk[0] - 1], what: "two bites gone" },
  { scene: "G", hour: "night", span: [G.room, G.candleOut], what: "eaten standing by candle at 2 a.m. (matched from the board's circle)" },
];

// ---------------------------------------------------------------------------------------------------- the joins
/** a join's kind (script v5): `clock` = the REC clock races (hud/vlog.tsx RACES); `whip` = a whip pan hides the cut
 *  (its outgoing half runs up to the cut); `match` = a match cut on a clock prop (plate, dial, candle) */
export type JoinKind = "clock" | "whip" | "match";
/** one join: its number (① = 1), kind, THE CUT (the incoming view's first frame; for ⑩, which has no cut, G's first
 *  frame), the scene the cut is in, whether it is that scene's first frame, what it joins; a whip's outgoing half
 *  (`out` frames before the cut); a clock join's RACE ([first, last] frame: the digits run from the outgoing clock to the
 *  incoming one, eased); `noCut`: the picture does not cut (⑩: the race runs over the held frame) */
export type Join = { n: number; kind: JoinKind; cut: number; scene: SceneId; first: boolean; what: string; out?: number; race?: Span; noCut?: boolean };
/** the default race of a clock join (camplan OVERVIEW item 3): from RACE_PRE frames before the cut (the outgoing scene's
 *  small stamp) to RACE_POST after it (under the big stamp sliding in), 18 frames */
export const RACE_PRE = 10, RACE_POST = 8;
const join = (n: number, kind: JoinKind, cut: number, what: string, o: { out?: number; race?: Span; noCut?: boolean } = {}): Join => {
  const s = SEGMENTS.find((x) => cut >= x.from && cut <= x.to);
  if (!s) throw new Error(`JOINS: ${kind} at ${cut} is outside the film`);
  const race = kind === "clock" ? o.race ?? [cut - RACE_PRE, cut + RACE_POST] as Span : undefined;
  return { n, kind, cut, scene: s.id as SceneId, first: s.from === cut, what, ...(o.out ? { out: o.out } : {}), ...(race ? { race } : {}), ...(o.noCut ? { noCut: true } : {}) };
};
/** THE 11 JOINS of script v5, in film order ("The joins between places": no kind twice in a row, no hand over the lens,
 *  no cut inside a place). Every cut is LOOKED UP (SEGMENTS, BEAT): a re-timed voice moves them. hud/vlog.tsx races the
 *  clock at the clock joins (their `race`); hud/caption.tsx and hud/card.tsx keep words off the whips and matches
 *  (joinClip); the faces checker reads it (scripts/newton/qa/faces: == JOINS, == WORDS vs JOINS). */
export const JOINS: Join[] = [
  join(1, "clock", seg("B").from, "① A -> B: his shut door 05:00 -> his room 上午; the race runs under card 1's last second and lands on the cut (the college bell)", { race: [card("A06").to + 1 - sec(1.0), seg("B").from] }),
  join(2, "whip", seg("C").from, "② B -> C: whip pan left to the noon plate as card 2 goes (noon's first stroke under its last 0.3 s; whoosh peak on the cut)", { out: 6 }),
  join(3, "match", C.garden, "③ C: the noon plate -> the sundial's dial in the garden (same place, same size; C01 starts on the cut)"),
  join(4, "whip", C.whipCut, "④ C: the garden -> his room, the whip up the range front after him (whoosh peak on the cut)", { out: 6 }),
  join(5, "clock", seg("D").from, "⑤ C -> D: over the held empty chair, lands on 下午 (the street)"),
  join(6, "whip", D.schools, "⑥ D: the street -> the Schools, whip pan after him on his first stride back (the door's creak on the cut)", { out: 4 }),
  join(7, "clock", seg("E").from, "⑦ D -> E: over the held medium after \"Don't.\", lands on 傍晚 (his room)"),
  join(8, "whip", seg("F").from, "⑧ E -> F: whip pan after him into the night garden (he walked out of the extreme close with his candle)", { out: 4 }),
  join(9, "match", F.inside, "⑨ F: the night garden -> the elaboratory, match cut on his candle (the flame at the same place and size)"),
  join(10, "clock", seg("G").from, "⑩ F -> G: NO CUT; the race runs over the held extreme close from F16 end + 0.3 s and lands on 02:00 and the town clock's first stroke", { race: [F.race, G.strike1], noCut: true }),
  join(11, "match", G.room, "⑪ G: the elaboratory -> his room, the circle on the board -> his 2 a.m. plate (same place, same size)"),
];
/** THE WORDS KEEP OFF A WHIP (camplan OVERVIEW item 4; owner row 86: nothing from the outgoing place may still show
 *  once the move starts): no subtitle or fact card in the WHIP_CLEAR frames before a whip's cut (the longest outgoing
 *  half: ② and ④, 6 frames; beatCheck holds every whip's `out` to it) */
export const WHIP_CLEAR = 6;
/** the first join after frame f (cut > f), or null */
export const joinAfter = (f: number): Join | null => JOINS.find((j) => j.cut > f) ?? null;
/** the last frame a subtitle screen or a fact card that the timing shows from `from` to `to` (inclusive) may stay on
 *  screen, its fade or exit INCLUDED: `to`, or earlier when the first whip or match join after `from` comes first (a
 *  whip: its cut - WHIP_CLEAR - 1; a match: its cut - 1). Clock joins clip nothing: the timing never runs a caption
 *  across a scene's first frame (⑩ has no cut). Less than `from`: it never shows. hud/caption.tsx capEnd and
 *  hud/card.tsx cardEnd use it; the timing's own frames never move. */
export const joinClip = (from: number, to: number): number => {
  const j = JOINS.find((x) => x.cut > from && x.kind !== "clock");
  if (!j) return to;
  return Math.min(to, j.kind === "whip" ? j.cut - WHIP_CLEAR - 1 : j.cut - 1);
};

// ---------------------------------------------------------------------------------------------------- the places
/** the place of every frame as [place, first, last] runs, in film order (v5: every change of place is a join) */
export const SPANS: [Place, number, number][] = [
  ["stairs", seg("A").from, seg("A").to],
  ["room", seg("B").from, seg("B").to],
  ["room", seg("C").from, C.garden - 1],
  ["garden", C.garden, C.whipCut - 1],
  ["room", C.whipCut, seg("C").to],
  ["street", seg("D").from, D.schools - 1],
  ["schools", D.schools, seg("D").to],
  ["room", seg("E").from, seg("E").to],
  ["garden", seg("F").from, F.inside - 1],
  ["elaboratory", F.inside, seg("F").to],
  ["elaboratory", seg("G").from, G.room - 1],
  ["room", G.room, seg("G").to],
];
/** the place frame f shows */
export const placeAt = (f: number): Place => {
  for (const [p, a, b] of SPANS) if (f >= a && f <= b) return p;
  return f < 0 ? SPANS[0][0] : SPANS[SPANS.length - 1][0];
};
/** the shot id at a frame (the clearance checker's report): the segment's id until the segment builders name shots */
export const shotAt = (f: number): { id: string } => ({ id: SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "?" });

/** [] when every beat lies inside its own segment, every span runs forward, the title block sits in A (not on frame 0),
 *  SPANS cover the film without a gap, and the JOINS are script v5's eleven: in order, the kinds as the script has
 *  them (never the same kind twice in a row), every scene's first frame (but A's) among them, every clock join with a
 *  race round its cut, every whip's outgoing half within WHIP_CLEAR, every change of place a join and every join (but
 *  the scene starts and the no-cut ⑩) a change of place */
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
  if (TITLE_SPAN[0] <= 0 || TITLE_SPAN[1] > seg("A").to) bad.push(`TITLE_SPAN ${TITLE_SPAN} must lie in segment A (1-${seg("A").to})`);
  for (const a of ASIDES) if (a.span[1] < a.span[0]) bad.push(`ASIDE ${a.id} runs backwards`);
  let next = 0;
  for (const [p, a, b] of SPANS) { if (a !== next || b < a) bad.push(`SPANS: ${p} ${a}-${b} (expected to start on ${next})`); next = b + 1; }
  if (next !== TOTAL) bad.push(`SPANS end on ${next - 1}, the film on ${TOTAL - 1}`);
  const KINDS: JoinKind[] = ["clock", "whip", "match", "whip", "clock", "whip", "clock", "whip", "match", "clock", "match"];
  if (JOINS.map((j) => j.kind).join(" ") !== KINDS.join(" ")) bad.push(`JOINS: the kinds are ${JOINS.map((j) => j.kind).join(" / ")}, script v5 has ${KINDS.join(" / ")}`);
  JOINS.forEach((j, i) => {
    const p = JOINS[i - 1];
    if (j.n !== i + 1) bad.push(`JOINS: join ${i + 1} is numbered ${j.n}`);
    if (p && j.cut <= p.cut) bad.push(`JOINS: ${j.kind} at ${j.cut} is not after ${p.kind} at ${p.cut}`);
    if (p && j.kind === p.kind) bad.push(`JOINS: two ${j.kind} joins in a row (${p.cut}, ${j.cut})`);
    if (j.kind === "clock" && !(j.race && j.race[0] < j.race[1] && j.race[0] <= j.cut && j.cut <= j.race[1])) bad.push(`JOINS: clock join ${j.n} (cut ${j.cut}) has no race round its cut (${j.race})`);
    if (j.kind !== "clock" && j.race) bad.push(`JOINS: ${j.kind} join ${j.n} has a race (only clock joins race)`);
    if (j.kind === "whip" && !(j.out && j.out > 0 && j.out <= WHIP_CLEAR)) bad.push(`JOINS: whip ${j.n} has an outgoing half of ${j.out} frames (1..${WHIP_CLEAR})`);
    if (j.noCut && !j.first) bad.push(`JOINS: join ${j.n} has no cut but is not a scene's first frame`);
  });
  for (const s of SEGMENTS.slice(1)) if (!JOINS.some((j) => j.cut === s.from)) bad.push(`JOINS: scene ${s.id}'s first frame ${s.from} is not a join`);
  for (let i = 1; i < SPANS.length; i++) {
    const [p, a] = SPANS[i], q = SPANS[i - 1][0], j = JOINS.find((x) => x.cut === a);
    if (p !== q && (!j || j.noCut)) bad.push(`SPANS: the place changes ${q} -> ${p} on ${a} with no join that cuts there`);
    if (p === q && j && !j.first) bad.push(`JOINS: join ${j.n} at ${a} is inside one place (${p})`);
  }
  for (const j of JOINS) if (!j.first && !SPANS.some(([, a]) => a === j.cut)) bad.push(`JOINS: join ${j.n} at ${j.cut} is not a change of place in SPANS`);
  return bad;
};
