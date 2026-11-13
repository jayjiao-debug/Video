# 《跟着牛顿过一天》 (NewtonFilm): bible, storyboard and build plan

An interview that follows Isaac Newton through ONE ordinary working day at Trinity College, Cambridge, in May 1686
(he is 43 and writing the *Principia*). **The camera IS the interviewer** (记者, a young woman, Lin's voice, never seen:
only her hand, her sleeve cuff and her red-foam microphone come into frame). She speaks Chinese, Newton and his
assistant Humphrey speak English. Her goal for the day: make him laugh once. He finally does at 2 a.m., at the one
question his assistant recorded ever made him laugh ("what use is geometry?"). Funny, then moving, then warm.
1080 x 1920, 30 fps, about 3:00. Owner: Jay. Douyin first.

Sources of truth (read them):
- Script (lines, stage directions, look/camera/sound notes): `/mnt/project-files/next-video/newton/script_v4/script_v4.md`
- Lines file (ids, speakers, subtitles zh+en per screen, silent beats, cards): `scripts/newton/voice/newton_lines.json`
- Facts: `/mnt/project-files/next-video/newton/facts_checked.md` (sections A and E). Myths to keep out: section C
  (no apple hitting his head, no "standing on shoulders" scene, no wig at home).

The engine is a COPY of the Qin film (`src/videos/qin/`, same branch), which is a copy of Wanbi's. Read
`src/videos/qin/README.md` (the segment builder's contract: World, places, people, props, camera, HUD, checks),
`src/videos/newton/story.ts` header (HOW TO BUILD A SEGMENT), `world.ts` header, `KIT.md`. The Newton folder still
carries Qin's code until each lane replaces its part: delete or replace what is Qin-only (corridor, terrace, table,
night, road, museum, emperor, sword, hood, the vlog HUD).

## Hard rules (Jay's)
- Never edit `src/kit`, `src/videos/group/kit` (the rig), `vasa/ bt/ arthur/ hongmen/ wanbi/ qin/`, `scripts/kit`,
  `scripts/rig3d`, `scripts/arthur`, `scripts/hongmen`, `scripts/wanbi`, `scripts/qin`. IMPORT from them; copy a file
  into `newton/` when it needs changes.
- No media in the repo (public). Outputs only under `/home/user/newton_work/film/<lane>/`. No keys anywhere.
- Never touch `render.json` / `blender.json`. No commit, push or branch (the producer commits).
- Renders only through the queue (`scripts/kit/queue/`), 540 x 960, few frames.
- After every change `bash scripts/kit/tsc.sh --film newton` = 0 errors; before any render of a changed shot
  `bash scripts/kit/qa/clearance/run.sh --film newton [--seg X]` clean (no 穿模).
- Picture rules: no clipping; no flashing black lines, black frames or colour blocks; figures not over-exposed under
  the set light; subtitles have NO background box; characters keep moving (never frozen for long); faces never turn
  to profile (FACE_MAX 12 deg: turning away = body turn / back view, gaze, head tilt).
- NOT this film (the script says so): no vlog UI (no REC dot, no timestamp, no battery), no time cards, no breathing
  camera, no "keep it / cut it" gag. The day's clock is HIS DINNER PLATE, seen five times, lit by its hour.
- Light (owner note "too dark" on an earlier film): every plate insert lit by its hour; the night garden is a BLUE
  MID-TONE, not black; inside the elaboratory the firelight lights every face warm and mid-tone.

## 1. Places (`type Place`), all real and a few steps apart (WP2)
| place | scenes | what | params (suggested) |
|---|---|---|---|
| `stairs` | A | dark oak staircase up to Newton's first-floor door (Trinity, staircase between the Great Gate and the chapel). Last two steps, a small landing, his panelled door (opens inward; a candle glow under it that goes out), a leaded stair window throwing LOW early sunlight (the sun is well up: 5 a.m. in May). A pigeon on the outer sill is optional. | `door` 0..1 (open), `glow` 0..1 (candle light under/through the door) |
| `room` | B, C end, E, G end | his study-bedroom: a desk BURIED in paper (stacks of drafts a hand's breadth thick, books, inkwell), a plain wooden chair, a small table by the window where Humphrey sets the dinner, a leaded window with BARS (their shadows cross the table cloth at noon), panelled walls, the door to the stairs, a bed corner optional. One set, lit four ways. | `hour` "morning" (clean white) / "noon" (hard, short sharp bar shadows) / "evening" (slanting gold) / "night" (candle orange, window dark) |
| `garden` | C, F start, G end exterior | the small walled garden below his window: raked gravel paths (rake lines visible), low box hedges, a brick wall, the college building with his window and a staircase door on one side; at the far end, by the chapel's east end (a big Gothic chapel wall/buttress), his ELABORATORY: a small brick outbuilding with a chimney. Day and night. | `time` "noon" / "night" (blue moonlit mid-tone), `glow` 0..1 (elaboratory door + chimney glow, night), `window` 0..1 (his window lit, for the very last shot) |
| `street` | D start | out of the college gate along a Cambridge street (timber and brick fronts, cobbles) to the Schools: short, he walks, the camera trots beside him. May be a strip of `schools`' exterior instead. | — |
| `schools` | D | the university lecture room (the Schools): tall door, rows of EMPTY wooden benches, a lectern/desk at the front, high windows, one sunbeam with dust turning in it, echoing. | `dust` 0..1 |
| `elaboratory` | F, G | inside his small brick outbuilding: brick furnace(s) with a glowing fire door (the main light: warm orange, flickers deterministically), crucibles, glass vessels, bellows, a heap of charcoal, a bench with a mouldy old open book, a stool by the furnace door, a candle, the door to the night garden (blue). | `fire` 0..1 (roar to deep red), `candle` 0..1 (candle length) |

## 2. Cast (`people.ts`, WP3) on the rig (`group/kit` rig3d; import, never edit)
- `NEWTON` (speaker `nt`): 43, round head, his OWN long greying hair (shoulder length, messy, a bird's nest in the
  morning; no wig), rumpled dark clothes (dark brown/black coat and waistcoat, white falling-band collar, a black
  academic gown over it outdoors and at the lecture), stockings untied / shoes down at heel (Humphrey's account).
  Resting face: deadpan/focus (he almost never smiles). Variants/swaps: ink smear on his nose (A to the D wipe), a quill
  behind his ear (A), the candle stub (A, F), the laugh (G: eyes squeezed shut, mouth open, head shaking: must read at
  quarter-screen size).
- `HUMPHREY` (speaker `hm`): Humphrey Newton (no relation), his young assistant from Grantham, early 20s, round-faced,
  plain brown coat, white collar, always carrying something (ink bottle, the covered dinner, a sack, a charcoal shovel);
  sooty at night. Expressions: polite, startled, sleepy.
- The reporter is never a figure (`SPEAKER_PERSON.ji = null`): she is the camera. Her HAND + modern sleeve cuff + the
  red-foam MIC are first-person things near the lens (section 4).
- Expressions only from `RIG_EXPRS` (rig3d.ts). Mouths move only inside the speaker's own line.

## 3. Props (`props/`, WP3; kit `src/kit/props/things.ts` first)
dinner plate with food (a 17th-century pewter plate: meat, bread) + its cover/lid, with states: `steam` (morning),
plain (noon), a FLY walking on it (evening), two bites gone (from E), bites taken at 2 a.m.; fork/knife; quill (in hand,
behind ear); inkwell; ink bottle (Humphrey, empty); paper: loose sheets, the drafts stack (a hand's breadth thick), the
sheaf of lecture notes; books; candle in a candlestick (length param: full, stub); plain wooden chair (dragged); small
table; the college's covered dish; handkerchief (her hand, D); sack (empty / full of charcoal; dropped in G);
charcoal shovel; poker; a wooden BOARD with circles and triangles drawn in charcoal (F/G: slides off his knee, her
hand holds it up close); stick of charcoal; crucible(s); glass vessels; bellows; stool; the mouldy old book.

## 4. Her camera, hand and microphone (`cam.ts` + first-person props, WP3)
- She IS the camera: eyes 1.6 m, lens fov about 60-64 (vertical). The camera moves because HE moves: no breathing
  sway. A very light handheld only on walks/trots. Keep Qin's `povCam / keyCam / whip / punchIn / follow / creep`
  machinery; drop the breathing default (mood "still" everywhere unless the script asks).
- The MIC: a handheld reporter's microphone with a RED FOAM windscreen and a black handle, no logo. It enters on a
  diagonal from the LOWER LEFT; its red head stops ABOVE the subtitle band (never covers a subtitle or a face). It is
  held toward whoever speaks (it swings from Newton to Humphrey and back), raps on the door (A), tilts toward the
  drafts (B). ASIDES (lines 03, 06, 15, 23, 27, 35): the mic swings round to face the LENS, with Newton out of focus
  behind it (depth of field). Build it as a 3D prop attached to the camera (so DOF and light are right) with her hand.
- Her HAND: a young woman's hand with a modern sleeve cuff (one colour for the whole film, e.g. a mustard or teal
  jacket cuff). Actions: holds the mic; drags the chair to the back of his knees (C); wipes the ink off his nose with
  a handkerchief in two strokes (D); picks the board off the floor and holds it into frame (G). Never a frozen hand.
- Moves the script asks for: walk backwards in front of him (garden); WHIP after him up the stairs (the whip IS the
  cut); trot beside him (street); one WIDE hold on the empty benches; track his candle along the gravel (night); one
  slow PUSH-IN from line 44 to 50; DEAD STILL on the laugh (53). Impacts move objects, never the whole frame.

## 5. HUD and subtitles (`hud/`, WP4)
- NO vlog UI: delete REC, timestamp, battery, 第二天.
- SUBTITLES on every spoken line, in the bottom band: CHINESE LARGE (main, about 64-72 px), ENGLISH SMALL under it
  (about 34-40 px), both centred, white/warm white with a dark outline, NO BOX. One screen at a time (the lines file's
  `screens`, each <= 16 Chinese characters); Newton's lines: the Chinese is the translation, the English is what he
  says. Speaker tint: 记者 warm white, Newton pale gold, Humphrey white.
- FACT CARDS (5): one slot MID-LEFT, ink on a cream paper slip (a slight tilt, torn/deckled edge, soft shadow),
  Chinese large and English small under it, shown only while nobody speaks (timing from the lines file), a short
  slide/flutter in and out. They never sit on a face.
- TITLE BLOCK: 「跟着牛顿过一天」 large, 「1686年5月 · 剑桥三一学院」 small under it (English small line too), lands ON
  THE SHUT DOOR after "Good night" (line A02) for 3 s; never on frame 0.
- End: his window goes dark, then black (fade over >= 3 frames, the film's darkest warm tone, not #000).

## 6. Timing
`scripts/newton/gen_timing.py` reads `scripts/newton/voice/newton_lines.json` (+ the real voice timing
`/home/user/newton_work/film/voice/voice_timing.json` when it exists; `--placeholder` before) and writes `voice.ts`
and `captions.ts`. Caption groups = the lines file's `screens` (zh + en), placed by the voice's word/character times.
Segments = scenes A-G. Every beat is a lookup (`line`, `cap`, `capWord`, `BEAT`): never type a frame number.

## 7. Storyboard (scene = segment). Read the script's stage directions for each scene; this is the shot plan.
### A · 清晨 · stairs (01-06)
1. f0 already moving, line 01's subtitle on it: the camera takes the last two steps at a run; low sun through the stair
   window. The mic swings in from lower left and raps on the door, which is already opening: NEWTON in the doorway,
   candle stub under his chin, bird's-nest grey hair, ink on his nose, quill behind his ear, yesterday's clothes.
2. 02 "Good night." over her 一天: he shuts the door in the mic's face; the glow under the door goes out. TITLE BLOCK
   on the shut door (3 s). 03 aside (mic to the lens). CARD 1 under which the door opens a crack and HUMPHREY slips
   out yawning with an empty ink bottle and pulls the door shut without a sound.
3. 04 mic to Humphrey; 05 "Laugh? Mr Newton?": he looks at her, at the door, back, shakes his head, goes down the stairs.
   06 aside: 「好，今天我要让他笑一次。」
### B · 上午 · room, morning light (07-15)
1. Plate insert, clean white light: Humphrey sets the covered dinner on the window table, lifts the lid: steam.
   Pull back: Newton writing at the paper-buried desk. 07 "Sir, your dinner." Newton does not look up; Humphrey goes.
2. 08 the mic swings after Humphrey to the door 「他说马上来！」, back to Newton. 09-10 (he writes on). 11 the mic tilts
   to the drafts stack. 12-14 (cold, precise, no face change). 15 aside 「没笑。」 CARD 2 over the scratching quill.
### C · 中午 · garden (16-22)
1. Plate insert: hard noon light, lid off, no steam, the window bars' short sharp shadows on the cloth.
2. The garden: Newton walks a turn, hands behind his back; the camera walks BACKWARDS in front of him. 16-18.
3. 19 "Two laps is—": he stops dead mid-word, stares at nothing, turns on his heel, RUNS for the staircase. 20 as he
   goes. WHIP after him up the stairs (the cut): in the room he is already writing, bent over the desk, STANDING. Her
   hand drags the chair to the backs of his knees: 21. He waves it away without looking: 22. The chair stays empty.
### D · 下午 · street + schools (23-28)
1. Out of the college gate along the street, gown flapping, notes under his arm; the camera trots beside him; her
   hand darts in with a handkerchief and wipes the ink off his nose in two strokes (from here: no ink). He has not
   noticed.
2. A tall door; inside: rows of empty benches, dust in a sunbeam. One WIDE hold: one man at the front, nobody else.
   23 aside. He lays out his notes as if the hall were full. 24-26. 27 aside (his face unchanged, out of focus behind).
3. He lectures to the empty benches (mouth moving, no words: muffled echo is sound), time cut, he gathers his notes;
   she claps alone (her hand + mic hand); 28 "Don't."
### E · 傍晚 · room, gold light (29-35)
1. Plate insert, slanting gold light, cold; a FLY walks across it; push in until the fly is big. 29.
2. 30 "Have I not?": he steps to the table, takes a bite, a second, standing, eyes on the page in his other hand,
   back to the desk. Close on the plate: two bites gone. 31-34 (he looks pointedly at the mic on 32). 35 aside.
### F · 夜 · garden at night -> elaboratory (36-51)
1. The garden in blue moonlight; the outbuilding glows orange at its door and chimney; the camera follows his candle
   along the gravel to it. Inside: brick furnace, crucibles, the mouldy book open on a bench; Humphrey, sooty, feeds
   the fire with charcoal; firelight on every face. 36-37. CARD 3 (he stares at the fire, Humphrey shovels).
2. 38-40. Humphrey takes the empty sack and goes out. Time passes: candle shorter, the fire deep red; Newton on a stool
   by the furnace door, a board on his knee, scratching circles and triangles with charcoal; close on the board.
3. 41-43. The slow PUSH-IN starts at 44 and stops at 50. 44-46; he pokes the fire; 47-49; the fire spits; 50; 51.
   Silence, he pokes the fire, the push-in has stopped.
### G · 凌晨两点 · elaboratory -> room -> garden (52-55)
1. A clock strikes two (sound); on the second stroke the board slides off his knee and clatters at the camera's feet;
   her hand picks it up and holds it into frame, close (circles and triangles). She sniffs. 52.
2. 53 THE LAUGH: he stares, then it bursts out: eyes squeezed shut, mouth open, whole round head shaking; the camera
   holds DEAD STILL; "What... use!" over its tail. Hold ~2 s. HUMPHREY in the doorway with a full sack sees it and
   DROPS the sack. CARD 4 under which Newton wipes his eyes, takes his candle, stops at the door, the smile still on
   him. 54 "Good night." 55 「晚安，牛顿先生。」
3. His room by candle: he lifts the cold plate and eats a bite or two standing, smiling a little (plate framed right;
   CARD 5 mid-left). Then outside, from the elaboratory door: his window goes dark; the outbuilding still glows. Black.

## 8. Files (one owner per file)
| owner | files |
|---|---|
| WP1 skeleton | `story.ts`, `voice.ts` + `captions.ts` (GENERATED), `beats.ts`, `lang.ts`, `world.ts`, `layout.ts`, `layout/base.ts`, `sets/index.ts`, `Film.tsx`, `kit.json`, `kit.world.ts`, `preview/*` (except WP2/WP3 previews), `shots/seg*.ts` STUBS, `shots/common.ts` (then shared, additive only), `scripts/newton/gen_timing.py`, `README.md` (the contract for the segment builders) |
| WP2 sets | `sets/<place>.ts`, `sets/parts/*`, `layout/<place>.ts`, `preview/set_places.ts` |
| WP3 cast, props, camera | `people.ts`, `acc/*`, `props/*`, `cam.ts`, `preview/people_lineup.ts`, `preview/props_sheet.ts`, `preview/cam_test.ts` |
| WP4 HUD | `hud/*` |
| WP5 segments | `shots/segX.ts`, one each |
| producer | `scripts/newton/voice/*` (lines file, cut, assemble), `scripts/newton/sound/*`, farm, commits |

Cross-lane requests: append to `/home/user/newton_work/film/requests.md` (lane name, file, what, why) and work around
it in your own files meanwhile.
