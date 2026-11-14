# 《跟着牛顿过一天》 (NewtonFilm): bible, storyboard and build plan

An interview that follows Isaac Newton through ONE ordinary working day at Trinity College, Cambridge, in May 1686
(he is 43 and writing the *Principia*). **The camera IS the interviewer** (记者, a young woman, Lin's voice, NEVER SEEN:
no microphone, no hands, no sleeve; Jay, 14 Nov. What her hands do happens as if by an invisible hand, and what we see
is her camera's recording, with its REC lamp, timestamp and battery: section 5). She speaks Chinese, Newton and his
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
- HER CAMERA'S RECORDING UI IS IN (Jay, 14 Nov: "Also add the recording visuals and sound effects like 秦始皇"; this
  overrides the script's "no vlog UI"): the REC lamp, the scene's timestamp, the battery, the record beep at the start
  and the switch-off at the end (section 5). Still NOT this film: no separate time cards (the timestamp is the camera's
  own), no breathing camera, no "keep it / cut it" gag. The day's clock is still HIS DINNER PLATE, seen five times, lit
  by its hour; the timestamp agrees with it.
- SHE IS NEVER SEEN (Jay, 14 Nov: "i wont want the microphone and arms get rid of them", "Pretend there is an
  invisible hand like 秦始皇"): no mic, no hands, no sleeve; the knock, the chair, the handkerchief, the claps and the
  board happen as if by an invisible hand (section 4).
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
- The reporter is never a figure (`SPEAKER_PERSON.ji = null`): she is the camera. Since 14 Nov nothing of her is drawn
  either: no mic, no hand, no sleeve (section 4).
- Expressions only from `RIG_EXPRS` (rig3d.ts). Mouths move only inside the speaker's own line.

## 3. Props (`props/`, WP3; kit `src/kit/props/things.ts` first)
dinner plate with food (a 17th-century pewter plate: meat, bread) + its cover/lid, with states: `steam` (morning),
plain (noon), a FLY walking on it (evening), two bites gone (from E), bites taken at 2 a.m.; fork/knife; quill (in hand,
behind ear); inkwell; ink bottle (Humphrey, empty); paper: loose sheets, the drafts stack (a hand's breadth thick), the
sheaf of lecture notes; books; candle in a candlestick (length param: full, stub); plain wooden chair (dragged); small
table; the college's covered dish; handkerchief (moved by her invisible hand, D); sack (empty / full of charcoal; dropped in G);
charcoal shovel; poker; a wooden BOARD with circles and triangles drawn in charcoal (F/G: slides off his knee, her
hand holds it up close); stick of charcoal; crucible(s); glass vessels; bellows; stool; the mouldy old book.

## 4. Her camera (`cam.ts`, WP3): she is never seen; an invisible hand
- She IS the camera: eyes 1.6 m, lens fov about 60-64 (vertical). The camera moves because HE moves: no breathing
  sway. A very light handheld only on walks/trots. Keep Qin's `povCam / keyCam / whip / punchIn / follow / creep`
  machinery; drop the breathing default (mood "still" everywhere unless the script asks).
- NO MIC, NO HANDS, NO SLEEVE (Jay, 14 Nov: "i wont want the microphone and arms get rid of them"). `props/index.ts`
  `INVISIBLE = { mic, hand, handR }`: the shots still put these props (so whatever they hold keeps its place and its
  timing) but they are never drawn; `cam.ts micPose` no longer pulls focus onto the mic head in an aside. The asides
  (lines 03, 06, 15, 23, 27, 35) have no mic to turn to the lens any more: her voice and the camera carry them (each
  scene's builder: a small move off him, Newton soft behind).
- WHAT HER HANDS DID HAPPENS AS IF BY AN INVISIBLE HAND (Jay, 14 Nov: "Pretend there is an invisible hand like
  秦始皇"): the door is rapped and swings (A, the knock on the sound's anchor); the chair slides itself to the backs of
  his knees (C); the handkerchief floats in and wipes the ink off his nose in two strokes (D); two lone claps are
  heard in the empty hall (D, sound only); the board rises off the floor and
  hangs in front of the lens (G). The object moves on the sound's anchor (SYNC_POINTS.md); nothing is "held" that we
  can see. Never a frozen object in mid-air: it drifts and breathes like a thing in a hand.
- Moves the script asks for: walk backwards in front of him (garden); WHIP after him up the stairs (the whip IS the
  cut); trot beside him (street); one WIDE hold on the empty benches; track his candle along the gravel (night); one
  slow PUSH-IN from line 44 to 50; DEAD STILL on the laugh (53). Impacts move objects, never the whole frame.
- Her camera's own screen (REC, timestamp, battery) is the HUD's (section 5).

## 5. HUD and subtitles (`hud/`, WP4)
- HER CAMERA'S RECORDING UI (`hud/vlog.tsx`, Jay 14 Nov: "add the recording visuals and sound effects like 秦始皇").
  The Qin film's idea (`src/videos/qin/hud/vlog.tsx`), this film's look: the subtitles' warm ink line under every
  fill, the speaker tints (pale gold, warm white, ivory), no box. Drawn first in Film.tsx's HUD layer (above the 3D
  picture, under the title block, the fact card, the shot's overlays and the subtitles); the end black (Pose.top)
  covers it.
  - REC (top left, `SCREEN.rec`, row centred on y 204, left x 50): a red lamp (glass with a glint in a warm ink ring)
    and "REC" in warm white, 38 px. The lamp breathes at 1 Hz: about 11 frames lit, 11 dim, 4-frame soft ramps, never below
    24 % (never a hard flash). Its period is 1 s stretched by a hair (about 30.07 frames, a whole number of blinks
    between frame 4 and OFF_AT - 5) so the lamp is lit on frame 0 and has been lit for 10 frames when it dies.
  - TIMESTAMP (under REC): two rows, the time of day in pale gold + the clock in warm white (「清晨 05:00」, 34 px), the
    English small under it (EARLY MORNING, 24 px spaced capitals (letter spacing 2), ivory: the smallest tag size the
    owner accepts, about 22.5 px on this frame). On every scene's FIRST FRAME it slides in
    1.5x big (in 8 frames, from 40 px left) and while it lands THE CLOCK RUNS ON from the last scene's time to this
    one (05:00 ... 11:00 in 14 frames, ease-out: the day fast-forwarding, this film's own touch); it holds big to
    1.6 s, then shrinks over 12 frames into its small place (rows on y 255 / 291) and stays for the scene. Frame 0
    starts big and settled (no run). The corner's reserve (the widest scene, A's EARLY MORNING): big intro
    `VLOG_RECT.stampBig` x 50..394, y 242..353; at rest `VLOG_RECT.stamp` x 50..281, y 234..309. Each scene's own box
    (`stampRect(id, big)`, what `hudRectsAt` reports): at rest A 281, B 263, C 235, D 235, E 240, F 200, G 250 (x1;
    y 234..309); big A 394, B 368, C 325, D 325, E 333, F 272, G 348 (x1; y 242..353). No sound when it slides in
    (see Sounds).
  - BATTERY (top right, `VLOG_RECT.battery` x 845..1038, y 182..226, inside `SCREEN.battery`): its level follows the CLOCK, not the frame: 100 %
    at 05:00 down to 12 % at 02:00 (scene starts A 100, B 75, C 71, D 58, E 46, F 25, G 12), each scene draining 3
    points more while it runs (G 12 -> 7), so it steps down at every cut (a later recording). Green over 35 %, amber
    over 15 %, RED in the 2 a.m. scene, where its fill breathes softly at 1 Hz.
  - SWITCH-OFF (the Qin film's idea, our look and timing): his window goes dark on the last pluck (G to - 1.77 s =
    frame 5199); 12 frames (0.4 s) later, once the pluck has decayed (the mix there: crickets only, -42 to -49 dB
    RMS), the camera switches off on `OFF_AT` = `BEAT.G.cameraOff` = G to - 1.4 s = frame 5211 (TOTAL - 42), on the
    click of `sfx_poweroff`. In that one frame the WHOLE UI goes dead, which nothing in a blink does: the lamp goes
    out to a dead GREY glass (no red, no glow; a dim blink stays red), "REC", the timestamp and the battery's outline
    and % all turn one warm grey (#8f857c; the English row a shade darker), and the battery's fill is emptied. It
    holds still (nothing breathes) for 24 frames (0.8 s, long enough to read on a phone), then segG's end black
    (`BEAT.G.black[0]` = OFF_AT + 24 = frame 5235; fade 8 frames) falls on the power-down sweep; 18 frames of black
    to the end. The dark window shows 36 frames (5199-5234). All of it hangs off the scene's end, like the pluck, so
    it follows if G's tail is extended.
  - Switches: `Pose.rec: false` hides the lamp and the timestamp on a frame (the battery stays, still); `Pose.cards:
    false` skips the big intro (small timestamp only); `Pose.hud: false` hides everything. `hudRectsAt(f)` includes the
    vlog boxes (each scene's own timestamp box; the big intro for the first 2 s of a scene). Keep faces (skin) out
    of the two top corners for the whole scene, push-ins included: reframe, never switch the lamp off mid-scene.
  - THE TIMES (story.ts `SCENE_CLOCK` / `SCENE_STAMP`; 24-hour, read at a glance). No source gives the hours of one
    day; they are chosen to agree with what the characters say, the light the script asks for and Humphrey Newton's
    account (Keynes MS 135). SOURCED (director vlog round 1, note 5; facts_checked.md rows): only A 05:00 (row 3,
    "sometimes not till 5 or 6"; card 1) and G 02:00 (G01 「两点了」 and row 3, "2 or 3 of the clock"). B 11:00,
    D 15:00, E 18:00 and F 23:00 have NO ROW in facts_checked.md, and a quick search (14 Nov) found no primary source:
    neither Trinity's hall dinner / supper hours around 1686 nor a day or hour for the Lucasian lecture (the
    Dictionary of Scientific Biography gives only "at least one lecture a week in every term", and adds "there is no
    record of what lectures, if any, he gave in 1686"). OPEN, for the researcher and the screenwriter: verify those four
    hours or decide whether B-F keep exact digits (the owner's rule: no on-screen number the sources don't give).
    Until then the digits stay as below.
    | scene | stamp | why |
    |---|---|---|
    | A | 清晨 05:00 · EARLY MORNING | the script's "about 5 a.m."; May 1686 (Julian) = 11 May-10 June (Gregorian), sunrise about 3:40-4:15 local solar time, so the low sun on the stairs is right; he says "Good night": card 1 / Humphrey, "very rarely went to bed till 2 or 3 of the clock, sometimes not till 5 or 6" |
    | B | 上午 11:00 · LATE MORNING | the lines file's "late morning"; Humphrey brings his dinner ("Sir, your dinner", a college bell): the colleges dined late in the morning then (period practice, about 11 to noon; Humphrey gives no hour), and Stukeley says his victuals were brought to his chamber; the plate steams |
    | C | 中午 12:00 · NOON | hard noon light, the window bars' short sharp shadows: the sun at its highest (clocks kept local solar time); the plate an hour old: lid off, no steam |
    | D | 下午 15:00 · AFTERNOON | the lines file's afternoon; Humphrey records the habit (he read "to the walls", came back in a quarter of the half hour when nobody came), not the hour; mid-afternoon leaves room before supper and suits the slanting sunbeam in the Schools |
    | E | 傍晚 18:00 · SUPPER TIME | the lines file's "supper time" (the college supper of the period, early evening); slanting gold light (sunset about 19:40-20:10 solar); E01 "You haven't had a bite all day!" after a day of plates |
    | F | 夜 23:00 · NIGHT | the blue garden: at Cambridge in late May the sky never gets fully black, at 23:00 it is a deep blue (the script's "blue mid-tone"); F03 "Go to bed"; the fire watch (Humphrey: in spring the fire "scarcely went out", they sat up on alternate nights); leaves "time passes" (candle shorter, fire deep red) room before two |
    | G | 凌晨 02:00 · SMALL HOURS | the clock strikes two and G01 says 「两点了」; he goes to bed straight after (G03 "Good night", his window goes dark): Humphrey's "2 or 3 of the clock" |
  - SOUNDS (`scripts/newton/sound/cues.json`, the Qin film's way): `rec_beep` (the Qin film's 1 kHz beep, voice farm
    run qin-sfx-01) at scene A from + 0.05 s: audible 0.05-0.11 s, 80 ms before her first word (A01's voice onset at
    about 0.19 s; the timing file's line start is 0.10 s) and well before the knock (0.64 s); `sfx_poweroff`
    (synthesised: `make_poweroff.py 0.80 1.07`: the button click on OFF_AT, the power-down sweep from 0.8 s later, on
    the end black, gone with the black's fade, a little static) at G to - 1.4 s. NO beep at the other scene starts: every cut already carries a line's last
    syllable or a hit within 0.1-0.4 s (B the college bell, C mus_noon's first note, D the big door, E "Don't." and
    mus_supper, F the end of E07 and mus_night, G the clock's first stroke), so the timestamp slides in silently, as in
    the Qin film. Measured (mono mix, 14 Nov, after the re-time): integrated -19.0 LUFS (unchanged), true peak
    -1.2 dBTP; the beep peaks at -11.6 dBFS, about 4 dB under her voice's level above 300 Hz; the switch-off click
    (173.70 s) peaks at -14.7 dBFS, -32 dB above 300 Hz (the last line G04 -21.5, the crickets -55 to -58): about
    10 dB under the voice, 23 dB over the bed; the sweep (174.50-174.65 s) -33 to -44 dB above 300 Hz.
- SUBTITLES on every spoken line, in the bottom band: CHINESE LARGE (main, about 64-72 px), ENGLISH SMALL under it
  (about 34-40 px), both centred, white/warm white with a dark outline, NO BOX. One screen at a time (the lines file's
  `screens`, each <= 16 Chinese characters); Newton's lines: the Chinese is the translation, the English is what he
  says. Speaker tint: 记者 warm white, Newton pale gold, Humphrey white.
- FACT CARDS (5): one slot MID-LEFT, ink on a cream paper slip (a slight tilt, torn/deckled edge, soft shadow),
  Chinese large and English small under it, shown only while nobody speaks (timing from the lines file), a short
  slide/flutter in and out. They never sit on a face.
- TITLE BLOCK: 「跟着牛顿过一天」 large, 「1686年5月 · 剑桥三一学院」 small under it (English small line too), lands ON
  THE SHUT DOOR after "Good night" (line A02) for 3 s; never on frame 0. It sits on the door's upper panel (segA: world
  y 1.28 m), its top about 140 px under the timestamp's English row at frame 140 (at least 80 px wanted).
- End: his window goes dark (the last pluck), 0.4 s later her camera switches off (the click: the REC lamp dies, the
  whole UI goes grey and holds still 0.8 s), then black on the power-down sweep (fade 8 frames, the film's darkest
  warm tone, not #000).

## 6. Timing
`scripts/newton/gen_timing.py` reads `scripts/newton/voice/newton_lines.json` (+ the real voice timing
`/home/user/newton_work/film/voice/voice_timing.json` when it exists; `--placeholder` before) and writes `voice.ts`
and `captions.ts`. Caption groups = the lines file's `screens` (zh + en), placed by the voice's word/character times.
Segments = scenes A-G. Every beat is a lookup (`line`, `cap`, `capWord`, `BEAT`): never type a frame number.

## 7. Storyboard (scene = segment). Read the script's stage directions for each scene; this is the shot plan.
Since 14 Nov (section 4) she is never seen: no mic, no hands. The storyboard below is written that way: every object
she handles (door, chair, handkerchief, board) moves by itself, as if by an invisible hand, on the sound's anchor
(SYNC_POINTS.md); "the camera turns to X" is her looking; an aside is her voice to us, carried by a small camera move.
### A · 清晨 · stairs (01-06)
1. f0 already moving, line 01's subtitle on it: the camera takes the last two steps at a run; low sun through the stair
   window. Two raps on the door, nothing seen knocking (the camera pushes in a little on each, the leaf shivers, dust
   puffs off the panel); it swings open on the second: NEWTON in the doorway,
   candle stub under his chin, bird's-nest grey hair, ink on his nose, quill behind his ear, yesterday's clothes.
2. 02 "Good night." over her 一天: he shuts the door in her face (the camera flinches back on the thud); the glow under
   the door goes out. TITLE BLOCK on the shut door (3 s). 03 aside (the camera's puzzled head tilt at the shut door).
   CARD 1 under which the door opens a crack and HUMPHREY slips
   out yawning with an empty ink bottle and pulls the door shut without a sound.
3. 04 the camera turns to Humphrey; 05 "Laugh? Mr Newton?": he looks at her lens, at the door, back, shakes his head,
   goes down the stairs. 06 aside (back on his door: a nod, a push toward it): 「好，今天我要让他笑一次。」
### B · 上午 · room, morning light (07-15)
1. Plate insert, clean white light: Humphrey sets the covered dinner on the window table, lifts the lid: steam.
   Pull back: Newton writing at the paper-buried desk. 07 "Sir, your dinner." Newton does not look up; Humphrey goes.
2. 08 the camera swings after Humphrey to the door 「他说马上来！」, back to Newton. 09-10 (he writes on). 11 the
   camera tilts to the drafts stack. 12-14 (cold, precise, no face change). 15 aside 「没笑。」 CARD 2 over the scratching quill.
### C · 中午 · garden (16-22)
1. Plate insert: hard noon light, lid off, no steam, the window bars' short sharp shadows on the cloth.
2. The garden: Newton walks a turn, hands behind his back; the camera walks BACKWARDS in front of him. 16-18.
3. 19 "Two laps is—": he stops dead mid-word, stares at nothing, turns on his heel, RUNS for the staircase. 20 as he
   goes. WHIP after him up the stairs (the cut): in the room he is already writing, bent over the desk, STANDING. The
   chair slides itself to the backs of his knees (the scrape; no one seen pushing it): 21. He waves it away without looking: 22. The chair stays empty.
### D · 下午 · street + schools (23-28)
1. Out of the college gate along the street, gown flapping, notes under his arm; the camera trots beside him; a
   handkerchief floats in by itself and wipes the ink off his nose in two strokes (from here: no ink). He has not
   noticed.
2. A tall door; inside: rows of empty benches, dust in a sunbeam. One WIDE hold: one man at the front, nobody else.
   23 aside. He lays out his notes as if the hall were full. 24-26. 27 aside (his face unchanged, out of focus behind).
3. He lectures to the empty benches (mouth moving, no words: muffled echo is sound), time cut, he gathers his notes;
   two lone claps ring in the empty hall (sound only; the camera jolts a little on each, no hands seen); 28 "Don't."
### E · 傍晚 · room, gold light (29-35)
1. Plate insert, slanting gold light, cold; a FLY walks across it; push in until the fly is big. 29.
2. 30 "Have I not?": he steps to the table, takes a bite, a second, standing, eyes on the page in his other hand,
   back to the desk. Close on the plate: two bites gone. 31-34 (he looks pointedly into her lens on 32). 35 aside.
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
   it rises off the floor by itself (taken up by her invisible hands) and hangs close in front of the lens (circles
   and triangles), drifting a little as a held thing does. She sniffs. 52.
2. 53 THE LAUGH: he stares, then it bursts out: eyes squeezed shut, mouth open, whole round head shaking; the camera
   holds DEAD STILL; "What... use!" over its tail. Hold ~2 s. HUMPHREY in the doorway with a full sack sees it and
   DROPS the sack. CARD 4 under which Newton wipes his eyes, takes his candle, stops at the door, the smile still on
   him. 54 "Good night." 55 「晚安，牛顿先生。」
3. His room by candle: he lifts the cold plate and eats a bite or two standing, smiling a little (plate framed right;
   CARD 5 mid-left). Then outside, from the elaboratory door: his window goes dark (the last pluck); the outbuilding
   still glows. 0.4 s later her camera SWITCHES OFF (the click; the REC lamp dies, the whole vlog UI goes grey and
   holds still for 0.8 s), then black on the power-down sweep (section 5).

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
