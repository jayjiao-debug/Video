# 《采访苏东坡的一天》 (LibaiFilm): bible, storyboard and build plan

Episode 3 of the interview series 采访XX的一天. **The camera IS the reporter** (a young woman, never seen; we hear her,
and we see only her HAND and her RED MIC). She spends one day in 惠州 (spring 1097) with 苏东坡, sixty, on his second
exile. He spends the day feeding her. That afternoon a courier brings the order that sends him across the sea to
Hainan; his first question is what is good to eat there. That night he says goodbye at 朝云's grave. Two jumps forward
(two years: 儋州 oysters; four years: 金山 portrait). Funny all day, then the tearjerker, then a laugh, then the last word.
Chinese first (Douyin). 1080 x 1920, 30 fps, **6096 frames = 203.2 s**. Owner: Jay. The voice is FINAL (Jay approved
the 3:23 draft): the picture follows it.

Read first:
- the script (lines, stage directions, sound): `/mnt/project-files/next-video/sudongpo/script_v1.md`
- the table version (emotion + picture per line): `/mnt/project-files/next-video/sudongpo/script_v1_table.md`
- the facts (what is true, what is staging): `/mnt/project-files/next-video/sudongpo/facts_checked.md`
- the timing of every line, caption group and card in frames: `/home/user/libai_work/voice/timing.md`
- this engine is a COPY of the Qin film (`src/videos/qin/`). Its contract is unchanged: `README.md` in this folder (it
  still describes Qin's places and cast until WP1 rewrites it), the header of `story.ts` (HOW TO BUILD A SEGMENT), the
  header of `world.ts`, `KIT.md` at the repo root. Qin's segments (`src/videos/qin/shots/seg*.ts`) are the worked
  examples of everything below (camera keys, swaps, held props, speak, overlays).

## Hard rules (Jay's, unchanged from Qin)
- Never edit `src/kit`, `src/videos/group/kit` (the rig), `vasa/ bt/ arthur/ hongmen/ wanbi/ qin/`, `scripts/kit`,
  `scripts/rig3d`, `scripts/arthur`, `scripts/hongmen`, `scripts/wanbi`, `scripts/qin`. IMPORT from them; copy a file
  into `su/` when it needs changes.
- No media in the repo (it is public). Outputs only under `/home/user/libai_work/<lane>/`. No keys anywhere. Never touch
  `render.json` / `blender.json`. No commit, push or branch (the integrator commits).
- Renders only through the queue (`scripts/kit/queue/`), 540 x 960, few frames, one at a time. Long jobs in the
  background with a log you poll. The machine has 4 CPUs shared by everyone: never bypass the queue.
- After every change: `bash scripts/kit/tsc.sh --film su` clean; before any render of a changed shot:
  `bash scripts/kit/qa/clearance/run.sh --film su [--seg X] --out /home/user/libai_work/<lane>/clearance` clean (no 穿模).
- Picture rules: no clipping; no flashing black lines, black frames or colour blocks; figures not over-exposed under the
  set light; subtitles have NO background box; characters keep moving (never frozen for long); faces never turn to
  profile (FACE_MAX 12°: "turning away" = body turn / back view `turn: 1`, gaze, head tilt); faces in the upper third
  (eyes y < 700 px), out of the caption band (y 1190-1498) and out from under a card.
- **Night is a blue MID-TONE, never black**, and the lantern lights his face warm. Interiors are bright enough to read
  faces at phone size.
- Mouths move only inside the speaker's own line: `...speak(quote("su", "A02"), f, id)`.
- Every on-screen string is `L(zh, en)`. Every frame number from a lookup (`line()`, `capWord()`, `cap()`, `BEAT`,
  `SEGMENTS`, `CARDS`), never typed.

## This film's own idea (do not copy Qin's)
- He is the first subject who LIKES us: he keeps feeding the reporter. Her hand takes a grilled bone (B07), catches a
  lychee (C pre). Her red mic is in frame whenever she speaks to him (lower left, on a diagonal toward his mouth);
  for an aside to the viewer (lines 10, 21, 26, 31, 40) the mic turns round to the lens.
- NO vlog UI: no REC dot, no 时辰 timestamp, no battery, no 第二天 card, no blush, no "剪进去" gag, no hand over the lens.
- A title block at the top for the first 3 s: **采访苏东坡的一天**, small under it **1097年 · 惠州**.
- Subtitles: big Chinese + small English under it, both always (the English of the whole line stays up while any of
  its Chinese groups shows).
- Five fact cards (paper card, mid-left, y about 780-1080), each up only while nobody speaks.
- Two time jumps with an INK WASH wipe and a red seal STAMP in the corner: 两年后 · 儋州, 四年后 · 金山寺.
- The flashback to 黄州 (B15-B16) is a painted ink scroll: whip in, ink wash out.
- The ending: 「黄州，惠州，儋州。」 the three names stay on screen, a small painted picture fades up under each (the pot of
  red pork, the pile of lychee shells, an open oyster on the fire), then card 5, then black.

## 1. Places (`type Place`; one island each along x; WP2)
| place | island x | scenes | what |
|---|---|---|---|
| `market` | 0 | A | 惠州 morning market street: packed-earth lane, wooden stalls with awnings (greens, baskets, cloth), the butcher's stall: thick round chopping block on legs, a wooden rack with iron hooks, ONE lamb carcass hanging (stylised, toon, no gore: a pale pink ribbed shape, mostly bare), a meat cleaver; low tiled roofs behind, a banyan tree, morning sun low and warm from the side; paper lanterns; a few chickens (simple). Params: `crowd` 0..1 (background extras the SET draws as simple flat-shaded silhouettes / low-detail figures far back) |
| `yard` | 100 | B, C, D, G (far) | his NEW house on 白鹤峰 above the river: pale fresh timber, grey tile roof, a board over the door 「德有邻堂」 (painted text, readable), a packed-earth yard with a little clay stove (炉) with a pot, a bench, a ladder against the eave, a fence and a GATE onto the hill road (D: the courier rides up it), the LYCHEE TREE on the slope beside the house (heavy with red fruit, C), a view down to the river and hills (backdrop). Params: `sun` "morning" / "noon" / "afternoon" (light direction + warmth), `lantern` 0..1 (0 = no lantern, 1 = the red lantern hung on the eave: B hangs it, C/D show it), `shells` 0..1 (the pile of lychee shells at the foot of the rattan bed, 1 = up to his knee) |
| `room` | 200 | E | inside the new house at evening: pale timber walls, a lattice window with GOLD low sun streaming in (warm shafts, bright), his writing desk (low, he sits on a cushion: reuse Qin `desk`/`cushion`/`brush`/`inkstone` props or copy them), open travel trunks, a bench, folded robes, a bed screen; the doorway. Params: `sun` 0..1 (gold strength) |
| `huangzhou` | 300 | B flashback | a painted INK-SCROLL world (a small diorama, looks like a Song ink painting: paper-cream sky, grey ink hills, few colours): (1) "slope": a bare terraced hillside (东坡) with a field and a plough; (2) "pot": a farmhouse corner at night, a clay pot on a little fire, lid on, steam; the lid lifts to show glossy RED cubes of pork. Params: `vignette` "slope" / "pot", `lid` 0..1 (0 shut, 1 off and aside), `steam` 0..1. Its look: paper-cream background, strong ink, a desaturated warm grade (its PlaceLook grade) |
| `pines` | 400 | F | night: the lake path (惠州西湖) through a PINE WOOD, moonlight on the water (silver-blue), a small grave mound under a little SIX-PILLARED pavilion (六如亭: six slim pillars, a hexagonal roof) with stone steps; a blue mid-tone sky with a big moon. Params: `moon` 0..1, `glow` 0..1 and `glowX` / `glowY` / `glowZ` (numbers: the world position of the lantern the shot carries; the place's one point light (okit lightRig) IS the lantern's warm glow, so his face is lit warm by it |
| `river` | 500 | G | dawn on the river below 白鹤峰: a muddy bank with reeds where the camera stands, wide water with a gentle shimmer, a small wooden boat (prop) pulling away, the far hill with the new house small at the top (a low-detail copy, its lantern a warm dot). Params: `dawn` 0..1 |
| `beach` | 600 | H | 儋州, Hainan: a thatched hut, sand, coconut palms, turquoise sea with surf lines, a driftwood fire ring on the sand (the fire is a prop or the place's: param `fire` 0..1 flicker). Bright tropical late-afternoon light |
| `temple` | 700 | I | 金山寺 hall: dark red pillars, a wooden floor, an incense burner, soft window light, on the back wall a hanging-scroll PORTRAIT of 苏东坡 painted years ago (a big painted scroll: a younger, plump Su in his 东坡巾 cap, drawn in the film's toon style as a flat painting) |

Each place: built in world coordinates round its island; its own lights inside its group (okit `lightRig`); BAKED_LIGHT
values; `view()` hides what the camera stands behind; marks and named cameras in `layout/<place>.ts`.

## 2. Cast (`people.ts`; WP3)
Everyone 1.45 m except where noted. Each a Person (Qin's type: a kit Look + accessories + scale + resting face).
- `SU` 苏东坡 at 60: **big** (scale 1.06), a ROUND BELLY (the riddle is about it: the stoutest build the rig offers),
  a full grey-black beard and moustache (long, the most beard of anyone), warm ruddy face, a PATCHED ochre-brown robe
  (two darker square patches painted on it), a cloth belt; outdoors a wide BAMBOO HAT (斗笠, hide name `bambooHat`);
  without it the tall square black cap 东坡巾 (hide name `dongpoCap`). Resting face `smile`. Always ready to laugh.
- `SU_DAN` 苏东坡 two years later (儋州): THINNER (no belly), beard and hair much whiter, the same robe faded, sleeves
  rolled, no hat (or a straw hat hidden by default).
- `SU_OLD` 苏东坡 four years later (金山): very thin, white hair and beard, a plain grey robe, the 东坡巾 cap, a walking
  STICK (prop `stick`, in hand 1).
- `GUO` 苏过 (his youngest son, mid-20s): slim, a plain blue-grey robe, topknot. Speaks one line (D29). Also in G, H.
- `MAI` 苏迈 (eldest son, about 38): short black beard, a dark green robe. On the ladder (B), with a grandchild (D), on
  the bank (G).
- `WIFE` (苏迈's wife): a muted rose robe, hair in a bun. Folds robes (E).
- `KID` (two grandchildren, `w.actor(KID, "1")` / `"2"`; scale 0.62; one in red, one in yellow (`KID2`), tufts / buns).
- `COURIER` 差役: a RED official coat, a black official's hat, boots; rides the kit HORSE (`src/kit/props/horse.ts`),
  reads the order scroll aloud (D27). One line.
- `BUTCHER`: sleeves rolled, a stained apron, a head cloth; swings the cleaver (A).
- `SERVANT` (x2): official livery (dark blue robe, a black cap, a sash) carrying meat off (A).
- `VILLAGER` (x4-6 for the market, varied colours via keys or two or three Persons).
- `DOG`: the yard dog: a small yellow village dog (NOT a rig figure: a prop with its own simple toon geometry and
  animation in `props/dog.ts`: sniff, look up, head tilt, tail wag, sit; ink outline like the props).
- 朝云 is NEVER shown.
- `ji` (the reporter) is the camera: no figure. Speakers (voice.ts): `ji`, `su`, `guo`, `chai`.
Expressions only from `RIG_EXPRS` (group/kit/rig3d.ts). Su's map: delighted = happy / grin / laugh; conspiratorial =
smug + lean; mock-sorry deadpan = deadpan; drowsy = sleep / dazed; stunned = shock (brief) then neutral; the long read
= focus; brightening = smile -> happy; fond = smile_closed; breaking = sad / pained; crying = sad + head down;
smiling through tears = smile_closed (+ sad brows if available); dozing = sleep.

## 3. Her hand and the red mic (`her.ts`; WP3) — NEW, the film's signature
A first-person arm in CAMERA space (built once, posed every frame from the camera pose, so it can never be left behind):
a sleeve (soft cream-pink jacket cuff), a small toon hand (same skin as the rig, ink outline), and a RED handheld mic
(red body, dark grey foam ball, a small white logo-free ring). Right hand = mic, left hand = takes things.
`putHer(w, cam, f, { mic, hand })`:
- `mic`: `{ mode: "off" | "in" | "toward" | "lens" | "low", aim?: V3 (the speaker's mouth, world), k? }`.
  "in" = swings in from the lower left (0..1 over ~10 frames: a nice overshoot), "toward" = held out on a diagonal
  from the lower left toward `aim` (the mic head about 18-25 % up from the bottom of frame, never covering a face, a
  gentle hand bob), "lens" = turned round to point at the lens (the aside: the mic head big in the lower middle,
  slightly out of focus is fine), "low" = drooping out of frame (F after 50).
- `hand`: `{ mode: "off" | "reach" | "hold" | "eat" | "catch" | "wave", item?: "bone" | "lychee", k? }`: the left hand
  from the lower RIGHT: reach (open, toward a point), hold (closed round the item, in the lower right), eat (lifts the
  item toward the lens bottom), catch (snatches a lychee at a given world point), wave (G: waving at the boat).
- Every transition is a smooth function of f given by the shot (keys), pure. Never inside the near plane (keep the
  mic head >= 0.18 m from the lens; the camera near is 0.03).
- The arm must pass the clearance checker against the world (when the camera is close to a figure, the mic stops short
  of him: give the shot a helper `micReach(cam, aim)` that returns the longest safe extension).

## 4. Props (`props/`; WP3; Qin's registry shape, kit `src/kit/props/things.ts` first)
`cleaver` (held, hilt grip), `block` (butcher's chopping block), `carcass` (on the hook; part of the market set is fine:
then it is the set's), `spine` (a bare lamb spine bone, held in both hands: grip `pair`), `bone` (a grilled bone,
golden-brown; `clean: true` = picked spotless white), `stove` (clay stove with a pot: `steam`), `wineBowl`, `grill`
(a small iron grill over the stove), `chopsticks` (long cooking chopsticks: grip `hilt`), `ladder`, `lantern` (red paper
lantern: grip `hook`; `lit` 0..1 glows), `lychee` (one fruit: `peeled` 0..1), `lycheeBunch`, `shell` (one red shell
half, for his belly), `rattanBed` (a low rattan day-bed: a seat for `pose: lie / recline` if the rig has one, else a
semi-reclined sit), `scroll` (the order: grip `pair`, `open` 0..1 unrolls), `horse` (kit; saddle), `desk`, `cushion`,
`brush`, `inkstone`, `letter` (paper on the desk, writing appears with `ink` 0..1), `trunk` (`open` 0..1), `robes`
(a folded stack), `bench`, `porkPot` (clay pot with lid; `lid` 0..1; glossy red cubes inside; used in the flashback and
for the end picture reference), `plough` (huangzhou), `boat` (a small river boat with a stern oar: G; Su and GUO sit in
it: give seat marks), `fire` (a driftwood fire: flicker from f; `embers`), `oyster` (shell, `open` 0..1, grip `hilt`),
`stick` (walking stick), `coin` (optional), `dog` (section 2).
Each held prop is pinned to `r.handWorld(i)` after `w.update()`; use `holdPoints` when two hands hold one thing.

## 5. Her camera (`cam.ts`, Qin's, unchanged unless WP3 adds to it)
Her eyes at **1.50 m** (`EYE`, she is short; Su at 1.06 looks down into her lens), vlog lens fov 62 (`FOV`). Moves:
`povCam` (+ handheld moods), `punchIn`, `whip`, `follow`, `creep`, `lean`, `lower`, `nudge`, `dip`. The handheld is gentle
(she is happy, not scared) except: D (the order) is held STILL; F's push-in from F48 to the end of F50 is a slow steady
creep with no sway. Cuts hide in whips (A->B, into the flashback, B's dog cutaway), a dissolve-like fade through a
warm tone (D->E: through gold; E->F: through deep blue; F->G: through blue-black then dawn), ink washes (G->H, H->I).
A fade is an overlay of the destination tone over 6-12 frames each side, never a hard black frame.

## 6. HUD (`hud/`; WP1)
Film.tsx draws: the HUD layer (`TitleBlock`, `FactCard`, `Stamp`, `EndNames`, and every `registerHud`), then
`P.overlays`, then the `Caption` (zh + en), then `P.top`. Pose fields as Qin: `cards: false`, `hud: false`,
`captions: false`, `overlays`, `top`, `post`. Remove `rec` (no vlog UI) or keep it inert.
- `TitleBlock` (A, frames 0-90, fade out over the last 12): top centre (y 230-420): 「采访苏东坡的一天」 big (about 92 px,
  warm white, thick ink outline like the captions, no box), under it 「1097年 · 惠州」 (about 40 px). English (EN):
  "A Day with Su Dongpo" / "1097 · Huizhou".
- `Caption`: Chinese as Qin (no box, ink outline, sizes by length up to 16 characters a row: 72/68/64/60/56 px), the
  speaker's colour (ji warm white, su pale gold, guo and chai white), and UNDER it the line's English (`LINE_EN`, about
  34 px, light grey-white, thin outline, at most two rows, wrapped balanced), shown from the line's first group to its
  last group's end. The pair stays inside x 50-925 (Douyin rail) and the band y 1190-1520.
- `FactCard` (the 5 `CARDS`): a cream paper card with a thin ink border and a small red seal mark, mid-left (x 56-760,
  y about 780-1080), the zh text 46-50 px in two rows max, the en text 26 px under it; slides in/out over 8 frames.
- `Stamp`: a red square seal (朱文 style, white characters on red) in the top-left corner (x 60-260, y 230-430) with the
  time-jump text beside or under it: 「两年后 · 儋州」 (H) and 「四年后 · 金山寺」 (I), pressed in (scale 1.3 -> 1 with
  a little ink spread) at the scene's start and held ~2.5 s, then fades.
- `InkWipe` overlay helper (exported for the segments): an ink-wash wipe across the frame (a soft organic brush edge
  sweeping left to right, ink-black-grey with paper texture, 18-24 frames), with a `cut` flag at the middle when the
  next scene's picture must show. Also `InkDissolve` (the flashback's ink-wash OUT: the picture bleeds through
  ink blots back to colour).
- `EndNames` (I57 on): the three names 黄州 / 惠州 / 儋州 big (about 110 px, calligraphic weight, warm white with ink
  outline) across the middle third, each appearing on its own syllable (`capWord("I57", "黄州").from` ...); from the
  end of I57, under each name a small round painted picture fades up (about 240 px): the pot of red pork, the pile
  of lychee shells, an oyster open on the fire (flat painted SVG in the film's toon palette); all held through card 5,
  then everything fades to black by the last frame. The caption for I57 is hidden (the names ARE the caption; the
  English under each name: "Huangzhou" "Huizhou" "Danzhou").
- `hudRectsAt(f)` lists the boxes the HUD takes (title, card, stamp, end names) so shots keep faces out from under them.

## 7. Timing
`scripts/libai/voice/prep_timing.py` (from the approved draft) writes `scripts/libai/voice/su_lines.json` and
`/home/user/libai_work/voice/voice_timing.json` (per-character times); `python3 scripts/libai/gen_timing.py
/home/user/libai_work/voice/voice_timing.json --md /home/user/libai_work/voice/timing.md` writes `voice.ts` (+ `LINE_EN`) and
`captions.ts`. Segments (frames, inclusive): **A 0-515, B 516-1819, C 1820-2711, D 2712-3249, E 3250-3999, F 4000-5080,
G 5081-5241, H 5242-5601, I 5602-6095.** Line ids are the scene letter + the script's line number (A01 ... I57). Each
scene's first line has a `pre` (the silent opening action); some lines an `after` (a silent beat after it); 5 lines a
card (A05, C26, E39, H55, I57).

## 8. Storyboard (scene = segment). Seconds are film seconds from the timing (frames = s x 30); use the lookups.

### A · 清晨 · 惠州集市 (0-515)
1. f0 already moving: POV walking down the market lane toward the butcher's stall (follow-forward, handheld
   "excited", walk 1 -> 0 by 1.0 s). The butcher's cleaver thunks down (sound). Two SERVANTS in livery carry the last
   good cuts away past the camera's left. Su, bamboo hat, beard everywhere, leans over the block and holds up a bare
   SPINE bone with both hands like a prize. Title block on top for 3 s.
2. A01 记 (0.0-2.3) 「东坡先生？您怎么在买骨头？」: the red mic swings in from the lower left on 东坡; he turns to the lens.
3. A02 苏 (2.7-6.8): he leans in, conspiratorial; on 当官的 a nod toward the servants walking off with the meat.
4. A03 记 (7.2-8.7): mic to him. A04 苏 (9.1-11.5): laughs at himself (laugh accent), a pat on his chest.
5. A05 苏 (11.8-14.0) 「你看，骨头缝里，还有肉！」: he holds the bone right up to the lens (the bone big across the lower
   middle, his delighted face above it); a small punch-in.
6. Card 1 (14.2-17.2): he pays the butcher (a nod, a coin), tucks the bone under his arm, beckons "come"; whip right
   at the end into B.

### B · 上午 · 白鹤峰新居 (516-1819)
1. pre (17.2-18.0): the whip lands in the yard: the new house, 「德有邻堂」 over the door, the two kids chasing each other
   round the yard, MAI up the ladder hanging the red lantern (lantern 0 -> 1 during B), the DOG lying by the bench.
   Su squats at the clay stove.
2. B06 (18.0-21.1) 「煮熟，泡酒，撒盐，烤到微焦。」: one action per phrase (capWord): bone out of the pot with the long
   chopsticks / dipped in the wine bowl / a pinch of salt / onto the grill (sizzle). Proud, demonstrating.
3. B07 (21.4-25.3): he holds a grilled bone into frame; HER HAND takes it (hand reach -> hold) on 慢慢剔; on 螃蟹 he mimes
   picking at a crab.
4. B08 记 (25.7-27.8): she is chewing (hand "eat"), mic toward him.
5. B09 (28.1-30.5) 「啃得这么干净，狗都不高兴。」: he looks at the bone in his own hand: picked spotless white; deadpan,
   mock-sorry. after (30.5-32.1): whip DOWN to the DOG (camera low, 0.5 m): it sniffs a white bone on the ground, looks
   up at him, betrayed (head tilt, ears back); a small whine.
6. B10 记 (32.1-34.3): the mic swings round to the lens (aside), laughing (handheld shake of laughter). The camera
   rises back to her eye height.
7. B11 (34.7-38.1): he waves the bone at the house, the kids, the son on the ladder (the camera follows his gesture in
   a small pan and comes back): beaming.
8. B12 记 (38.5-40.0); B13 (40.4-42.4) counting on his fingers, cheerful; B14 (42.6-45.8) a shrug, light.
9. FLASHBACK B15-B16 (46.0-55.8), place `huangzhou`: whip in on the start of B15; ink-scroll look. B15 (46.0-49.5)
   vignette "slope": Su (the same SU, hat on) behind a plough on the bare hillside, a slow lateral drift. B16
   (49.7-54.4) vignette "pot": night, the clay pot on a little fire, steam, slow push. after (54.4-55.8): the lid lifts:
   glossy red cubes of pork (close).
10. B17 记 (55.8-57.2) 「这就是东坡肉！」 she exclaims OVER the glossy red pork (still in the flashback, the lid off). Ink
    dissolve OUT back to the yard on B18's start (BEAT.B.flashOut = B18's first word). B18 (57.5-60.6): Su smiling at
    the stove, amused, correcting her; a thumb over his shoulder toward "far away" on 那块坡.

### C · 中午 · 荔枝树下 (1820-2711)
1. pre (60.6-61.5): the lychee tree heavy with red fruit, Su stretched on the rattan bed in its shade, peeling
   one-handed; as the camera comes close he TOSSES a lychee; her hand CATCHES it (the hand snaps in from the lower
   right). Cicadas.
2. C19 记 (61.5-64.6) amazed, the lychee in her hand. C20 (64.9-67.1) mock-solemn, then a wink (a held one-eye close if
   the rig can, else smug + a head tilt + gaze to lens).
3. after (67.1-68.5): the camera tilts DOWN: a mountain of red shells at the foot of the bed, up to his knee (`shells`
   1). The mic swings to the lens. C21 记 (68.5-69.2) deadpan 「一点。」 (the mic at the lens, the shells in frame).
4. C22 记 (69.5-71.8) sincere, mic back to him. C23 (72.2-74.9) content, meaning it. after (74.9-76.6): he lies back,
   hands behind his head. A far-off temple bell.
5. C24 记 (76.6-78.1). C25 (78.5-82.8) drowsy, pleased with himself, reciting (eyes half shut).
6. C26 记 (83.1-86.0): mic to the lens, translating. after + card 2 (86.0-90.4): he is already snoring (`sleep`, a
   slow chest rise), a lychee SHELL on his belly; a slow drift back. Card 2 up 87.4-90.4.

### D · 下午 · 新居门口 (2712-3249) — the camera is STILL here (tripod-steady, no handheld)
1. pre (90.4-92.1): hooves on the hill road; the COURIER in red reins in at the new gate on the horse and unrolls the
   scroll. The family comes out: MAI with a KID on his hip (or holding a kid's hand), GUO from the house. Su comes up
   behind, still chewing. (The music stops dead at the hooves.)
2. D27 差役 (92.1-96.0): loud, formal, reading from the scroll (on the horse or just dismounted beside it).
3. D28 记 (96.4-98.5) lost. D29 苏过 (98.8-99.6) 「海南。」 stunned.
4. after (99.6-101.7): nobody moves (only breathing / a kid's small fidget stops). Su takes the scroll and reads it for a
   long time (`focus`). Hold.
5. D30 (102.1-104.2) 「海南……有什么好吃的？」: he looks up, genuinely curious, brightening (neutral -> smile -> happy).
6. after (104.2-105.4): the mic swings to the lens; D31 记 (105.4-108.3) stunned, half laughing. End: fade through gold.

### E · 傍晚 · 新居里 (3250-3999)
1. pre (108.3-109.3): gold evening light through the new windows; open trunks; WIFE folds robes; the two KIDS sit very
   still on a bench; Su at the desk writing a letter, humming (a slight sway).
2. E32 记 (109.3-111.7) hesitant. E33 (112.1-115.0) matter-of-fact, kind; a glance at the family on 给他们住.
3. E34 记 (115.3-116.3). E35 (116.7-119.7) breezy, like reading a to-do list, writing as he speaks.
4. E36 记 (120.1-120.7) 「啊？」 a jolt (camera kick). E37 (121.0-122.6) the same breezy tone. E38 记 (123.0-124.0)
   scared to ask. E39 (124.3-126.0) grinning 「找吃的。」
5. Card 3 (126.2-129.2): he blots the letter, still humming. E40 记 (129.6-133.3): the mic swings to the lens; her voice
   wobbles (the camera sags a little, a slow lower). Fade through deep blue.

### F · 夜 · 西湖边的松林 (4000-5080) — blue mid-tone, warm lantern
1. pre (133.3-134.6): Su walks along the lake path with a lantern in hand 1 (follow: she walks a step behind and to the
   side; he half-turns to talk). He pats his round belly as he walks.
2. F41 (134.6-137.3) the riddle, playful. F42 记 (137.6-138.4) 「学问？」 F43 (138.7-140.2) shakes his head 「不对。」
   F44 记 (140.5-141.2) 「文章？」 F45 (141.6-142.7) smiling, shaking his head 「也不对。」
3. after (142.7-144.6): he stops. In the pines ahead: the small grave mound under the six-pillared pavilion. He sets the
   lantern down on the step (the warm glow now low, lighting him from below-side).
4. F46 (144.6-149.5) fond, remembering. after (149.5-150.0): he laughs once at the memory (laugh accent), warm.
5. F47 记 (150.3-151.6) careful 「她是……？」 F48 (152.0-157.0) plain: 「朝云。……」 after: the SLOW PUSH-IN starts here
   (no sway) and runs to the end of F50.
6. F49 (157.8-160.3) steady, then cracking. F50 (160.5-164.6) to the grave (he turns to it: back three-quarters to us,
   then his head bows), gentle, breaking.
7. after (164.6-167.2): silence. The push-in has stopped. The mic hand slowly drops out of frame ("low"). He wipes his
   eyes with his sleeve, picks up the lantern, turns to the lens and smiles. F51 (167.4-169.3) 「走吧，明早还要赶路。」
   smiling through it, warm. Fade through blue-black to dawn.

### G · 黎明 · 江边 (5081-5241)
1. pre (169.4-170.6): dawn. A small boat pulls away from the bank: Su and GUO in the stern (Su no hat or hat on). On the
   bank around the camera: MAI, the KIDS, the DOG (in the foreground edges), and HER HAND waving (hand "wave"). Up on
   the far hill: the new house with the lantern.
2. G52 (170.6-173.0) shouting back across the water, cheerful, waving his whole arm 「荔枝熟了，替我多吃几颗！」
3. after (173.0-174.7): the boat gets small on the river; the INK WASH wipes across the frame into H.

### H · 两年后 · 儋州 (5242-5601)
1. pre (174.7-176.0): the wipe ends on the beach; the STAMP 两年后 · 儋州. A thatched hut, the sea. SU_DAN (thinner,
   whiter) crouches over a driftwood fire with GUO, grilling oysters in their shells; he prises one open, slurps it,
   closes his eyes (bliss).
2. H53 (176.0-179.2) ecstatic, then conspiratorial (leans to the lens on 千万别让北方人知道). H54 记 (179.6-180.4)
   「为什么？」 H55 (180.8-183.5) dead serious (deadpan, eyes to the lens).
3. Card 4 (183.7-186.7): he goes back to his oyster, delighted; GUO laughs. INK WASH into I at the end.

### I · 四年后 · 金山寺 (5602-6095)
1. pre (186.7-188.0): the STAMP 四年后 · 金山寺. The temple hall; the PORTRAIT on the wall. SU_OLD stands before it,
   very thin, leaning on the stick. The mic comes in beside him.
2. I56 记 (188.0-190.7) sincere. after (190.7-192.8): he looks at the portrait for a long time (back three-quarters,
   then his face turns back to the lens), then smiles, the same smile as at the market.
3. I57 (192.8-195.5) 「黄州，惠州，儋州。」 warm, simple, each name its own beat: the HUD EndNames appear on each name.
   The camera eases in a little on him.
4. 195.5-198.5: the three pictures fade up under the names. Card 5 (198.7-201.7). Then everything goes to black by the
   last frame (the picture fades under the names first).

## 9. Build lanes (who owns what) and checks
| lane | files |
|---|---|
| WP1 skeleton + HUD | `story.ts`, `beats.ts`, `voice.ts`/`captions.ts` (generated), `captions_en.ts`, `lang.ts`, `world.ts`, `layout.ts`, `layout/base.ts`, `sets/index.ts` (+ blockouts), `Film.tsx`, `hud/*`, `kit.json`, `kit.world.ts`, `preview/*` except the WP2/WP3 previews, `README.md`, stub `shots/segA..I.ts`, `src/Root.tsx` registration |
| WP2a sets | `sets/market.ts`, `sets/yard.ts`, `sets/room.ts` (+ `sets/parts/*` they need), `layout/market.ts`, `layout/yard.ts`, `layout/room.ts` |
| WP2b sets | `sets/huangzhou.ts`, `sets/pines.ts`, `sets/river.ts`, `sets/beach.ts`, `sets/temple.ts`, their `layout/*.ts`, `preview/set_places.ts` |
| WP3 cast, props, her, cam | `people.ts`, `acc/*`, `props/*`, `her.ts`, `cam.ts`, `preview/people_lineup.ts`, `preview/props_sheet.ts`, `preview/cam_test.ts` |
| WP5 segments | one `shots/segX.ts` each; `shots/common.ts` ADDITIVE only |
Requests for a file you do not own: append to `/home/user/libai_work/requests.md` with your lane name; work around it in
your own file. Checks: section "Hard rules" + README section 12 (with `--film su`, `/home/user/libai_work/`).

## 10. Director's notes after WP1 (read before building a scene)
- Talking shots are intimate (she is a vlogger at arm's length): his head about 30-40 % of the frame width, eyes around
  y 450-650 (1080 x 1920). Wide shots only for establishing a place or a big action (the courier arrives, the boat).
- I (end names): from BEAT.I.names[0] the names and pictures take y 690-1140 and card 5 sits LOW (y 1236-1500): keep his
  face above y 650 and let the names sit under his chin, or frame him smaller and higher; never a name over his face.
- The cross-cut overlays come from the HUD (`transitionAt(f)?.node`, InkWipe, InkDissolve, ToneFade): use them, do not
  draw your own; the ink wash was made lighter and more like wet ink on paper by the integrator.
- The fact card (y 780-1080, mid-left) may cross his body, never his face or a held prop that matters.
- Su's warmth is the film: in every scene he should be doing something with his hands (food, the lantern, the letter,
  the stick), and his face should change on the words (capWord), not sit on one expression.
