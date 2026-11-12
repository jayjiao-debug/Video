# 《鸿门宴，到底死了谁？》 storyboard (script v4, 22 lines, 31 shots)

Read `BIBLE.md` first (places, cameras, cast, props, overlays, the twelve transition rules).

HOW TO READ THE FRAMES. Frames are absolute film frames at 30 fps, ranges inclusive, from the PLACEHOLDER timing v0
(`voice.ts` / `captions.ts`, 5.4 字/s, TOTAL 2091). They move when the real voice exists. Never type one: every
frame below has a lookup (`line(n)`, `cap(line, k)`, `capWord(line, word)`, `quote(who, line)`, `SEGMENTS`, and the
named `SHOTS` / `HIT` / `TAG` / `BEAT` of `beats.ts`). A caption group is written `k from-end 「text」` (the word is
HEARD from its first frame: land the action ON that frame, 1-2 frames early is fine, never late). 【 】 = gold.

SHOT IDS are those of `beats.ts` (`shot("12b")`), plus six cut-ins that this storyboard adds: `2i`, `4i`, `5i`,
`7i`, `11i`, `20i` (and `20c`, the second half of the old shot 20). "NEW camera" = one of the five in BIBLE
section 2 (block-outs with the real cast, not yet in `layout.ts`). Screen positions are head centre x % / y % /
head width % of the frame, measured on block-out stills.

Each section: the line, its frames and caption groups, place, camera(s), the shot list, the beats (one action per
caption group), props, overlays, the transition INTO the next line, the sound cues. Lines 1-4 (segment A, the
sample for the owner) are written to be coded from directly.

Expressions used are kit names only: `neutral`, `smug`, `nervous`, `shock`, `stern`, `huff`, `grin`,
`smile_closed`, `relief`, `hush`. Mouths move only inside a quote.

---------------------------------------------------------------------------------------------------------------

# Segment A (frames 0-377): lines 1-4, 7 shots. THE SAMPLE.

## Line 1 「他靠上厕所，躲过了一场暗杀。」

| | |
|---|---|
| Speech | 3-70 (`line(1)`). Caption groups: `0 3-30` 他靠【上厕所】 · `1 31-70` 躲过了一场【暗杀】. No caption on frames 0-2 and 78-79 |
| Place | `privy` (variant B, the pale commode) |
| Shot | **1**: frames 0-77 (78 frames; `shot("1")`, `BEAT.privyLen`) |
| Camera | `PRIVY.cams.hero`, driven per frame by `privyOpening(f).cam`: lens punch-in x 0.93 .. 0.99 on frames 9-12, then a 14 % push-in and a 10 cm rise on frames 37-75 |
| On screen | ONE figure: `LIU_PRIVY` on frames 0-8, `LIU_DAGE` on frames 9-77 (`privyOpening(f).who`). Head upper centre-left, the sign 「厕」 top left, the lamp left, the bucket of wiping sticks right, the commode under him at 60-68 % y |

BUILT AND LOOKED AT (`/home/user/hm_work/o/strip.png`, `frame0.png`): the segment only wires it in.

```ts
w.setPlace("privy");                                   // the place's light = PRIVY_CAST_LIGHT (key on the lens axis)
const P = privyOpening(f);                             // { who, state, cam, t, beat }
w.setCamera(P.cam);
w.actor(LIU_PRIVY).set({ ...P.state, visible: P.who === 0 });
w.actor(LIU_DAGE).set({ ...P.state, visible: P.who === 1 });
return { camera: P.cam, clock: P.t, hud: false, overlays: tag };
```

| Frames | Words | Picture |
|---|---|---|
| 0 | (silence) | THE LOOP FRAME: Liu Bang as himself, `smug`, left hand on his knee, right hand low in front of the chest, one finger up. NOTHING else may be on this frame (no tag, no overlay, no flash, no sound): it must equal the film's last picture |
| 0-8 | 他靠 (from 3) | the right hand rises to the lips (`amount` 0 .. 8/9) |
| 9 | 上 | THE CHANGE (`P.beat`): the block-jawed 大哥 face, `hush` (cheek lines, narrow eyes, cocked brow); head scale 1.13, 1.075, 1.03 on 9, 10, 11; the lens punches in. Same hair, cap, pin, beard, red robe |
| 9-30 | 【上厕所】 | finger at the lips, held: "shh" |
| 30-37 | 躲过了 | the turn: body and head turn to his left, the fingertip goes to under his right ear |
| 37-75 | 一场【暗杀】 | the fingertip runs down the jaw to the chin; the camera pushes in on the same clock |
| 72 | (silence) | a small `Glint` at the fingertip on the chin (4-point star, 80 px, 6 frames) |
| 75-77 | (silence) | held; the cut comes on the END of the gesture |

- Name tag 「刘邦」 (name only, 84 px gold): `TAG.liu` = frame 9 (it pops with the face), out at 45 (`TAG_LEN` 36).
  Centre about (835, 360): the plain dark wall right of his head (x 60-95 %, y 14-24 %). The sign is upper left, so
  the two never meet.
- HUD off (`hud: false`): no source tag over the privy.
- How the viewer knows who he is: the tag; the only all-red figure of the film; frames 0-8 show his normal face, so
  the man of lines 2-4 is recognisably the same man.
- Sound: 0-8 nothing (the loop join must be silent). 9 `sting_low` (a low hit with mid-range punch, peak on 9).
  30 `swish` (cloth, the turn). 72 `ting`.
- Not checked yet: the shot inside the film (caption, tag, bloom, grade), 30 fps motion.

**Into line 2: THE TITLE CUT** (rule 5, the sixth device). Hard cut on frame 78 (`line(2).from - 2`), on the held
end of the gesture. Frames 78-79 are silent and uncaptioned; the stamp 「鸿门宴」 and a drum land on 80-83.

## Line 2 「这顿饭叫鸿门宴。满屋刀剑，最后只死了一个人，还不在席上。」

| | |
|---|---|
| Speech | 80-213. Groups: `0 80-118` 这顿饭叫【鸿门宴】 · `1 119-140` 满屋刀剑 · `2 141-185` 最后【只死了一个人】 · `3 186-213` 还【不在席上】 |
| Places | `tent` (frozen), then `camp` (outside the door) |
| Shots | **2a** 78-140 (63 f) `master` · **2i** 141-185 (45 f) NEW `freezeLiu` · **2b** 186-214 (29 f) `outside` |

### Shot 2a, frames 78-140: the banquet FROZEN mid sword dance (`CAMS.master`, `FREEZE`)

FROZEN means: every figure is posed at ONE fixed pose time (`const T0 = 0.4`; pass it as every pose's `t`; no
blinks, no breathing, `mouth` shut). The lamps' flames still flicker (the set's `clock` runs) and the camera
moves: a stopped moment, not a stuck video.

Camera: a slow eased push along the master's own axis over the whole shot, 78-140: `pos` moves 6 % of the way to
`look`. Nothing else moves.

| Who | Where (`layout.ts`) | State | On screen |
|---|---|---|---|
| 项庄 `XIANG_ZHUANG` | `FREEZE.dancer` (-0.48, 0, 0.30), facing 0.5 | standing, `smug`; right hand pinned up toward `FREEZE.cross`; `hide: ["hilt"]`, `armFront: [true, undefined]`; `sword0` in that hand, tip toward the cross | 18/41, 18 % wide |
| 项伯 `XIANG_BO` | `FREEZE.uncle` (-0.15, 0, -0.45), facing 0.1 | standing, `stern`; right hand up toward the cross with `sword1`; his LEFT arm spread back toward Liu Bang (the wing of line 13: hand pinned 0.5 m to his left at y 0.92); `hide: ["hilt"]` | 38/37, 17 % |
| 刘邦 `LIU_BANG` | `SEATS.liu`, seated | `nervous` (the face's own sweat drop), head pulled back 3 cm | 56/41, 14 %; the door flap exactly behind his head |
| 项羽 `XIANG_YU` | `SEATS.xiangyu`, seated | `smug`, his cup in his right hand at chest height | 79/54, 20 % |
| 范增 `FAN_ZENG` | `SEATS.fanzeng`, seated, `turn: 1` | a back view (white bun and shoulders) | bottom left, x 0-20 %, y 53-70 % (in the far left of the caption band: accepted) |
| 张良 | not rendered (outside every north framing) | | |
| 樊哙's seat | empty pad, table, cup; NO shield | | far left |

The two blades cross at `FREEZE.cross` (-0.34, 1.62, -0.1), above and between the dancer and the uncle (on screen
about 26 % x / 30 % y). The block-out pinned each sword hand at `mark.setY(1.0).lerp(cross, 0.42)` and `rig.qa`
reported clear -0.15 / -0.09: THE BUILDER MUST LOWER OR MOVE THE PINS UNTIL `clear >= 0` and look at it. The blades
are the wide flat props of BIBLE section 6 (in the block-out they were 2 px lines and did not read).

| Frames | Words | Picture |
|---|---|---|
| 78-79 | (silence) | the frozen room, already pushing in |
| 80-118 | 这顿饭叫【鸿门宴】 | `Stamp` 「鸿门宴」: `HIT.title` = 80, lands 83; centre (540, 300), 150 px, gold with a dark stroke: on the dark wall above the door, clear of every head. Out 136-138 |
| 119-140 | 满屋刀剑 | four `Glint`s walk across the room, 4 frames apart, each a 90 px star for 6 frames with a `ting` that rises in pitch: 119 the middle of 项庄's blade · 123 the middle of 项伯's blade · 127 项羽's hilt (`hiltWorld(rig)`) · 131 范增's hilt. Positions by `w.project(...)` |

Sound: 80 `drum_hit` + `stamp`. No room tone (it is frozen). 119 / 123 / 127 / 131 `ting` x 4.
Checked by looking: `/home/user/hm_work/g1/v4b/e_02a_freeze.png` (real cast, box set). Not checked: the real set
and light, the wide blades, the glints.

**Cut 2a -> 2i** on frame 141 (`HIT.oneDead`): an axial cut-in on the SAME tripod while the push continues (Liu Bang
14 % -> 30 % wide = 2.1x: legal by rule 3). Nobody can move in a freeze, so this is the one cut of the film that is
carried by the camera and a sound (a low `drum_soft` on 141), not by a figure's action.

### Shot 2i, frames 141-185: the man under the blade (NEW `freezeLiu`)

The same frozen pose (same `T0`), nothing re-posed.

On screen: Liu Bang 58/46, 30 % wide, `nervous`, sweating, the cream door flap filling the frame behind his head;
the uncle's grim face and raised blade fill the left third (21/39, 35 % wide); the tip of 项庄's blade comes in from
the upper left corner; 项庄's head must be entirely OUT of the frame (block-out: its centre at -20 % x). 项羽's cap
may peek into the bottom right corner inside the caption band (block-out: x 86-100 %): nudge `look.x` by -0.05 if
it does. The picture says: THIS is the man who is going to die.

| Frames | Words | Picture |
|---|---|---|
| 141-175 | 最后【只死了一个人】 | a slow eased zoom, fov 23 -> 21.5. No overlay: the caption carries it |
| 176-185 | (same group) | the lens rushes to the door flap behind him: `look` -> (-0.15, 1.2, -2.45), fov -> 7, ease-in only (it ends inside the wipe). The cream flap fills the frame by 184 |

Sound: 141 `drum_soft`; 141-183 a thin rising `riser`.
Checked by looking: `/home/user/hm_work/sb/b2/freezeLiu_D.png`. Not checked: the rush.

**2i -> 2b: FLAP WIPE, going OUT (the cloth sweeps UP)**. `Wipe` in the flap's colour `#eadfb8`: covering 181-183,
full 184-185, uncovering 186-188; the cut is on 186 (`cap(2, 3).from`), under the full frames. Sound: `cloth_flap`,
peak on 184.

### Shot 2b, frames 186-214: the black figure outside (`CAMS.outside`)

`w.setPlace("camp", { light: { gain: 0 } })`: the figure is the REAL `CAO_WUSHANG` with the figures' light gain 0,
i.e. pure black inside his ink outline. The plate (wall, ground, sky) is dimmed about 40 % by the shot's grade
(`post.grade`) so that a black figure in daylight is a design, not a lighting error; the door flap at the left
(x 0-46 %) stays warm, lit from inside. The wall right of the door is bare.

Camera: static (a 2 % eased push over the shot is allowed).

| Who | Where | State | On screen |
|---|---|---|---|
| the silhouette = `CAO_WUSHANG` | `SHADOW.at` (60.95, 0, -2.75), facing -0.25 | `idle` with the running clock (he breathes: outside, time is not frozen); on 196-204 his head turns 6 degrees toward the door (he is listening) | 65/43, 26.5 % wide. The ROOF CAP is the whole read; the roll at his belt shows as a notch in the black |

| Frames | Words | Picture |
|---|---|---|
| 186-188 | 还 | the cloth clears upward; he is already standing there |
| 190 | 【不在席上】 | `Mark "?"`: `HIT.question` = 190, centre (702, 470), 230 px, gold, pops by a spring and wobbles; out 209-211 |
| 211-214 | (end of the line) | the board's colour wipes in from the right |

Sound: 186 a second of quiet outdoor `air`; 190 `pop_q` (a questioning two-note pluck).
Checked by looking: `/home/user/hm_work/g1/v4b/e_02b_outside.png`. Not checked: the dimmed plate.

**HOW LINE 2 GUARANTEES THE THREAD.** (1) The figure is the informer's own model, so the outline is exactly the
one the viewer will meet at line 5: nobody else in the film has a roof on his head. (2) He stands in the RIGHT
half, where the informer always is. (3) The "?" is one glyph, used only twice in the film: here and at line 20,
over the same cap. (4) He is OUTSIDE the tent, beside the same door flap the camera just flew through: 不在席上 is
literal. (5) Inside, the picture has pointed at Liu Bang as the victim (shot 2i), so the "?" is a real question.

**Into line 3: CARD WIPE** (the only one). `Wipe` in the board's colour `#e6d7ae`, sliding in from the RIGHT:
covering 210-212, full 213-214, uncovering 215-217; the cut is on 215 (`line(3).from`). Sound: `paper_slide`, peak
on 213. The pale board and the 《史记》 tag that appears with it tell the viewer: this is the explanation.

## Line 3 「秦朝刚灭亡，刘邦抢先打下了都城。」

| | |
|---|---|
| Speech | 215-293. Groups: `0 215-242` 秦朝刚灭亡 · `1 243-264` 【刘邦】抢先 · `2 265-293` 打下了都城 |
| Place | `card` (the sand table), tableau `CARD.city` |
| Shot | **3**: 215-294 (80 f), `CAMS.card3`, static |
| HUD | the source tag 「《史记》」 comes on at 215 (`BEAT.source`), top left, and stays to the end of line 21 |

The frame (block-out `e_03_card3.png`): the capital's wall runs from the left edge to 50 % x, its top at 48 % y,
the tower beyond the left edge (dark slate, NOT red: BIBLE section 6); the flag socket at 43 % x on the wall top;
Liu Bang's mark puts him at 66/42, 26.5 % wide, feet at 80 %; the pale board and its horizon behind. ONE grey city,
ONE flag, ONE red man.

| Frames | Words | Who does what |
|---|---|---|
| 215-221 | 秦朝 | the wipe clears. A BLACK banner with a white 「秦」 stands in the socket (segment A's own mesh: pole 0.9 m, cloth 0.50 x 0.34 flying right, top at about 25 % y). Nobody is in the frame |
| 222-236 | 刚灭亡 | 222-225 the banner shudders (2 degrees, 2 cycles); 226-236 it topples to the LEFT about its foot (0 -> -100 degrees, ease-in) and drops behind the wall; a dust puff (three white discs, a pure function of the frame) at 236. Gone by 237 |
| 243-256 | 【刘邦】抢先 | Liu Bang DASHES in from the right edge: `CARD.city.liuFrom` -> `liu` (1.15 m) on frames 246-256 with `rigWalk` at 3.4 m/s, `grin`; the red flag upright in his right hand (hand pinned on the pole 0.2 m above its foot; the prop `flag` follows the hand, pole vertical, cloth streaming behind him = to the right) |
| 257-264 | (same group) | he skids to a stop (a 2-frame squash, `head: { scale: 0.97 }`), looks up at the empty socket (`gaze` up-left, head tilt -6) |
| 262-267 | 打下了 | he lifts the flag 0.25 m (the right hand rises) |
| 268 | 都城 | `HIT.flag` = 268: the pole DROPS into `CARD.city.socket` (-93.92, 1.0, -0.92): `Burst` at the socket (gold, r 110), a 2-frame camera kick. From here the flag stands in the socket and his right hand rests on the pole 0.2 m above the wall top (block-out: reach 0.02) |
| 268-280 | (same group) | the cloth snaps out to the right and waves (the prop's own animation from the frame; top at 13 % y, x 43-78 %) |
| 272-291 | (same group) | he turns his face to us: `smug`, chin up (head tilt -6); one blink at 286 |
| 292-294 | (end of the line) | the whip pan starts |

- Props: `flag` (P), the Qin banner (segment A), the wall and tower (set `card`).
- Overlays: `Burst` at 268. NO name tag here: his tag was at line 1, and on 243 the caption itself says 【刘邦】 in
  gold as the only red man runs in. (If test viewers do not connect the meme face of line 1 with this man, a second
  tag 「刘邦」 at 246-282 right of his head is the fix; the director decides.)
- Sound: 213 `paper_slide` (the wipe); 226 `crack`; 236 `thud_soft`; 246-256 quick `steps`; 268 `thunk` + 270
  `cloth_snap`; 293 `whoosh`.
- Checked by looking: the composition (`e_03_card3.png`). Not checked: the Qin banner, the dash, the planting move.

**Into line 4: WHIP PAN LEFT** (toward Xiang Yu's side; the two tableaux stand on one board, 6.8 m apart).
Shot 3's camera pans left on 292-294 (`look.x` and `pos.x` by -0.2, -0.9, -2.2 m: ease-in); the cut is on 295
(`line(4).from`); shot 4i arrives from the right on 295-297 (offset +1.6, +0.5, +0.1 m, then 0: ease-out). `Streak`
over 292-297. Sound: `whoosh`, peak on 295.

## Line 4 「可项羽强得多：四十万大军，对他十万。」

| | |
|---|---|
| Speech | 295-378. Groups: `0 295-327` 可【项羽】强得多 · `1 328-355` 【四十万】大军 · `2 356-378` 对他【十万】 |
| Place | `card`, tableau `CARD.versus` |
| Shots | **4i** 295-327 (33 f) NEW `card4XY` · **4** 328-377 (50 f) `card4` |

### Shot 4i, frames 295-327: this is Xiang Yu (NEW `card4XY`)

His first tagged appearance: the viewer must LEARN the figure he will follow for a minute, so he gets the frame to
himself, large. In `card4` his head is only 15 % wide: too small for a first meeting.

On screen: `XIANG_YU` alone at `CARD.versus.xiangyu` (-100.72, 0, 0), facing 0.2: head 43/40, 35 % wide, the plume's
top at 17 % y, feet at 88 %. Behind him only the pale board: BOTH ARMIES ARE HIDDEN (`w.set.setArmies(0, 0)`, the
ASK of BIBLE section 6). Liu Bang is out of frame.
(Fallback if the armies cannot be hidden: they stand there from the first frame, as in the block-out
`/home/user/hm_work/sb/b1/card4XY.png`; it still reads, but the pawns' heads crowd his shoulders.)

| Frames | Words | Who does what |
|---|---|---|
| 295-297 | 可 | the whip pan lands; he is already planted, cape swaying to rest |
| 298 | 【项羽】 | name tag 「项羽」 (name only): `TAG.xiangYu` + 3 = 298 (after the pan has landed), out at 327 (the cut). Centre (830, 700): right of his head, left of the app rail. On the same frame his head pops (`head: { scale: 1.05 }` easing to 1 by 304), `smug`, chest out |
| 305-321 | 强得多 | he looks down his nose toward screen right, where Liu Bang's side is (`gaze: 1`, head tilt 4), a slow blink at 312 |
| 322-327 | (same group) | 325: his right arm (screen left) starts to RISE, fist up: a commander calling his army |

Sound: 295 `whoosh` lands; 298 `brass_low` (one low note with the tag).

**Cut 4i -> 4** on frame 328 (`HIT.n40`), 3 frames after the arm starts to rise: the arm finishes rising in the
wide shot. Size 35 % -> 15 % (2.3x) and 27 degrees higher: legal.

### Shot 4, frames 328-377: forty against ten (`CAMS.card4`)

On screen (block-out `e_04_card4.png`): from 27 degrees above. `XIANG_YU` 27/46, 15 % wide, at his mark; `LIU_BANG`
74/46, 15 % wide, at `CARD.versus.liu` (-99.26, 0, 0), facing -0.2. Behind each, his block of pawns: ONE PAWN =
10,000 MEN: 4 x 10 charcoal behind Xiang Yu (its back row at 27 % y), 2 x 5 red behind Liu Bang (back row at
34 % y). The leaders' robes are inside the caption band; their heads, both blocks and both labels are above it.

| Frames | Words | Who does what |
|---|---|---|
| 328 | 【四十万】 | label 「40万」: `HIT.n40` = 328, centre (335, 405), 130 px, charcoal with a white edge (`CARD_LABELS.n40`); it pops by a spring |
| 328-348 | 四十万大军 | the charcoal pawns THUMP DOWN row by row, front row first: `setArmies((f - 328) / 2, 0)`, so a new row every 2 frames, each dropping from 0.5 m and squashing for 1 frame; all 10 rows stand by 348. Xiang Yu's arm comes down by 334; he does not look round. Liu Bang's head turns left to watch them land (`gaze: -1`), `shock` from 340 |
| 356 | 对他【十万】 | label 「10万」: `HIT.n10` = 356, centre (745, 548), 110 px, red with a white edge |
| 356-366 | (same group) | the red pawns drop in: `setArmies(10, (f - 356) / 2)`: 5 rows by 366 (it is over at once: that is the joke). Liu Bang looks back at his ten (`gaze: 1`), then at us: `nervous`, a gulp on 366 (`head: { scale: 0.96 }` for 3 frames) |
| 366-369 | (same group) | both labels fade out (before the push) |
| 368-377 | (end of the line) | an eased push-in on Xiang Yu for the match cut: on frame 377 his head is at 29 % x / 44 % y, as large as 10 frames allow (camera 25 % of the way to his head). He stands `smug`, unmoved |

- Props: the pawn rows (set `card`); no hand props.
- Overlays: the two labels. No tag for Liu Bang.
- Sound: 328 `army_thump` (a roll of ten thuds, 328-348, ending in a low `boom` on 348); 356 five lighter, higher
  `thump`s (356-366); 366 `gulp`; 374 a falling `whoosh_low` into the night.
- Checked by looking: the composition with both blocks standing (`e_04_card4.png`). Not checked: the rows
  dropping, the labels as real components, the push.

**Into line 5: MATCH CUT on Xiang Yu + the light drops to night**, on frame 378 (`SEGMENTS` B). Xiang Yu standing by
day at 29/44 -> Xiang Yu seated at night at 29/44, twice the size (`nightX`: 32 % wide). Sound: `lamp_whuff` (a
flame catching) on 378, and the night bed (crickets) starts.

Segment A check: 7 shots in 378 frames (78, 63, 45, 29, 80, 33, 50); shortest 29; cuts: title cut, axial cut-in,
flap wipe, card wipe, whip pan, cut on action; three eased moves.

---------------------------------------------------------------------------------------------------------------

# Segment B (frames 378-847): lines 5-9, 7 shots

## Line 5 「刘邦手下有个军官向项羽告密：“刘邦想称王。”」

| | |
|---|---|
| Speech | 380-480. Groups: `0 380-423` 刘邦手下有个军官 · `1 424-451` 向项羽【告密】 · `2 452-480` “刘邦想称王。” (quote: `quote("caoWushang", 5)`, 452-480) |
| Place | `nightX` |
| Shots | **5** 378-451 (74 f) `nightX`, static · **5i** 452-481 (30 f) NEW `caoBust`, a 3 % eased push |

| Frames | Words | Who does what |
|---|---|---|
| 378-379 | | Xiang Yu seated at `NIGHT_X.seat` facing us (29/44, 32 % wide), `stern`, bored, his cup on the table's left end, the oil lamp on its right end between where the two faces will be |
| 380-398 | 刘邦手下有个军官 | the red officer SCURRIES in from the right edge (`NIGHT_X.informer.from` -> `at`, 1.2 m at 2 m/s), a little bent; on 388 he looks back over his shoulder (`gaze: 1`, then -1): shifty |
| 398-404 | (same group) | he sinks to a kneel beside Xiang Yu (sink 0 -> 0.38) and is at 69/40, 31 % wide. Tag 「刘邦的军官」 (ONE line, 64 px, no name yet): `TAG.officer` = 400, out 436, centre (745, 385) |
| 424-451 | 向项羽【告密】 | `HIT.inform` = 424: he leans to Xiang Yu's ear: `head: { dx: -0.12, tilt: -9 }`, body 4 cm toward him, `smug`, `gaze: -1`. NO hand at the mouth (it clipped in the block-out: clear -0.11). Xiang Yu's eyes slide toward him (`gaze: 0.5`), head tilt 5, one brow up. 449: the officer leans further -> cut |
| 452-481 | “刘邦想称王。” | **5i**: his face fills the frame: 55/44, 52 % wide, the roof cap whole (top at 13 % y), the drooping moustache, the red neck cloth, dark crimson armour, the roll at his belt at 57-62 % y; Xiang Yu's cheek and plume are a slice at the left edge (0-14 % x). He lip-syncs the quote, `smug`, eyes on the ear (`gaze: -1`); on 470-472 his eyes flick to US and back: the viewer is let in on it |

- THE PORTRAIT. Shot 5i is the informer's portrait for the whole film. Its frame `quote("caoWushang", 5).from + 15`
  (467 in v0: `smug`, eyes on the ear) is rendered once as `public/hongmen/inset_cao.jpg` (the square x 30-82 %,
  y 12-50 % of the frame) for line 9's window. Segment B owns that render.
- Props: Xiang Yu's cup (`cup:xiangyu` at `NIGHT_X.seat.cup`). The `note` prop is not used.
- Sound: night bed (crickets, the lamp); 380-398 soft quick `steps`; a low `whisper` hiss under the quote.
- Checked by looking: `e_05_nx.png` (shot 5), `/home/user/hm_work/sb/b2/caoBust_ear.png` (shot 5i).

**HOW LINE 5 GUARANTEES THE THREAD.** The black outline of line 2 is now lit: the same roof cap, in the same right
half. He is the only RED man in a charcoal and purple room, so "Liu Bang's own officer" needs no explaining. The
tag says what he is. Then his face is on screen at 52 % of the frame width for a full second while he says the
words: longer and larger than anyone else's introduction. The roll of slips at his belt is in every picture of him.

**Cut 5 -> 5i** on 452 (the quote's first frame), on his lean (31 % -> 52 % = 1.68x). **Cut 5i -> 6** on 482
(`line(6).from`): on 479 Xiang Yu's plume jerks at the frame's edge (he draws breath) and the cut goes back out to
`nightX` (52 % -> 31 %).

## Line 6 「项羽大怒：“明天就打他！”」

| | |
|---|---|
| Speech | 482-532. Groups: `0 482-503` 项羽大怒 · `1 504-532` “明天就打他!” (quote: `quote("xiangYu", 6)`, 504-532) |
| Shot | **6** 482-532 (51 f): `nightX` -> eased push to `nightXin` on 482-492 (`shot("6").move`). It is a CUT from 5i, no longer joined to shot 5 |

| Frames | Words | Who does what |
|---|---|---|
| 484 | 项羽大怒 | `HIT.slam` = 484: his right fist (screen left) lands at `NIGHT_X.slam`: `Burst` at the fist, a 2-frame camera kick, the cup jumps 0.10 m and is down by 490, the flame ducks; `huff`, head pop 1.05. The officer flinches to `informer.flinch` (0.08 m, 484-488; more puts his head out of frame), `nervous`, sweat |
| 504-532 | “明天就打他!” | Xiang Yu lip-syncs and POINTS to screen right, toward Liu Bang's camp (`point`, arm 1), over the officer, who ducks under the arm. On 524-532 the officer's face changes behind the arm: `smug`, eyes away: he got what he came for |

- Sound: 484 `table_slam`, 486 `cup_rattle`; 530 `whoosh`.
- Checked by looking: `e_06_nx.png`, `e_06_nxin.png`.

**HOW LINE 6 GUARANTEES THE THREAD.** Same room, same two-shot, the same red man at the same 69-80 % x: he is on
screen from 378 to 532 without leaving, five seconds in all. The last thing he does is smile.

**Into line 7: WHIP PAN RIGHT** (to Liu Bang's camp, the way the uncle will come), frames 530-535, cut on 533
(`line(7).from`), `Streak`, `whoosh`.

## Line 7 「当晚，项羽的叔叔跑来报信，刘邦当场和他约为亲家。」

| | |
|---|---|
| Speech | 533-650. Groups: `0 533-544` 当晚 · `1 545-571` 项羽的【叔叔】 · `2 572-594` 跑来报信 · `3 595-627` 刘邦当场和他 · `4 628-650` 约为【亲家】 |
| Place | `nightL` (Liu Bang's red tent, the fire basket, night) |
| Shots | **7i** 533-594 (62 f) NEW `uncleIn`, static · **7** 595-651 (57 f) `campNight`, static |

| Frames | Words | Who does what |
|---|---|---|
| 533-544 | 当晚 | **7i**: the pan lands on an EMPTY frame: the red tent front, the fire basket right of centre, the night sky |
| 545-562 | 项羽的【叔叔】 | `HIT.uncleIn` = 545: the uncle RUNS in from the left edge (`NIGHT_L.uncleFrom` -> `uncle`, 1.65 m at 2.9 m/s), stops at 46-50/41, 34 % wide, out of breath (`nervous`, shoulders bobbing). Tag 「项伯 · 项羽的叔叔」: `TAG.uncle` = 548, out 584, centre (560, 470): it pops over the spot where his head STOPS, and he arrives under it by 556 |
| 572-594 | 跑来报信 | he points back to screen LEFT, toward Xiang Yu's camp, twice (`point`, arm 0, on 574 and 584): "they are coming for you". No lip-sync (not a quote): brows up, mouth shut. 590: Liu Bang's gold cup comes into the frame from the right edge -> cut on the cup |
| 595-627 | 刘邦当场和他 | **7**: the uncle 31/45 (21 %), Liu Bang 70/45 (22 %), the fire between and behind them. `HIT.toast` = 595: Liu Bang holds the cup out at `NIGHT_L.toast`, `grin`, a small dip of the head; the uncle: `shock` for 3 frames, then `smile_closed`; he takes the cup on 612 (the prop goes to his right hand, low) |
| 628-650 | 约为【亲家】 | `HIT.qinjia` = 628: their hands clasp at `NIGHT_L.clasp` (54 % y: above the captions). `Stamp` 「亲家」 red, 130 px, centre (540, 560), lands 631, out 646-648. Both `grin`; on 640 Liu Bang's eyes slide to us (`smug`): he has just bought a protector |

- Props: `cup:uncle` (the engine's name for the cup of this scene) in Liu Bang's hand, then the uncle's.
- Sound: night bed + fire crackle; 545-562 running `steps`, panting; 598 `cup_clink`; 631 `stamp`; 649 `whoosh`.
- Checked by looking: `/home/user/hm_work/sb/b2/uncleIn_b.png`, `e_07a_arrive.png` .. `e_07c_clasp.png`. The night
  light there is a block-out (the red wall blows out orange near the fire): the set owner must fix it.
- Who is who: the uncle gets the frame to himself at 34 % with his tag; his grey beard and flat cap are what the
  viewer must still know at line 13.

**Cut 7i -> 7** on 595 (34 % -> 21 % = 1.62x). **Into line 8: WHIP PAN LEFT** (back to Xiang Yu's camp) + the grade
lifts from night to morning, 8 frames, 648-655, cut on 652 (`line(8).from`). Sound: `whoosh`, then `rooster` on 653.

## Line 8 「第二天一早，刘邦上门赔罪：“一定是有小人挑拨。”」

| | |
|---|---|
| Speech | 652-757. Groups: `0 652-679` 第二天一早 · `1 680-712` 刘邦上门赔罪 · `2 713-729` “一定是” · `3 730-757` “有【小人】挑拨。” (quote: `quote("liuBang", 8)`, 713-757) |
| Place | `gate` (morning; the armies of `GATE` stay hidden) |
| Shot | **8** 652-758 (107 f): `CAMS.gate`, a slow eased push toward the pair (5 %) from 713 to 758 |

| Frames | Words | Who does what |
|---|---|---|
| 652-676 | 第二天一早 | Xiang Yu stands at `GATE.xiangyu` (14/49, 21 %), `stern`, waiting. The cart parked end-on (46-69 % x), the horse's head above it, eight red retinue pawns (73-83 %). Liu Bang is ALREADY WALKING on the first frame (55 % of the way from `GATE.liuFrom` to `liuTo`): the last 1.0 m at 1.3 m/s, hands already together |
| 678-712 | 刘邦上门赔罪 | `HIT.bow` = 680: the bow (拱手, down over 678-686) at 49/54, 22 %, HELD to the end of the shot |
| 713-757 | “一定是” “有【小人】挑拨。” | he lip-syncs bowed, looking up at Xiang Yu from under his brow (`gaze: -1`), `nervous`; on 730 (小人) a small shake of the clasped hands. Xiang Yu: `stern`, then on 745 `neutral`; 756: his hand starts to lift -> cut |

- Sound: 653 `rooster`; a very low morning camp bed (a banner, one horse snort on 668); 680 cloth `rustle`.
- Checked by looking: `e_08_gate.png` (real cast).

**Into line 9: hard cut IN on the same axis** on 759 (`line(9).from`), 3 frames after Xiang Yu's hand starts to
lift; 21 % -> 34 % (1.63x): legal.

## Line 9 「项羽张口就说：“是你手下曹无伤说的。”」

| | |
|---|---|
| Speech | 759-843, then 6 silent frames (844-849). Groups: `0 759-792` 项羽张口就说 · `1 793-814` “是你手下” · `2 815-843` “【曹无伤】说的。” (quote: `quote("xiangYu", 9)`, 793-843) |
| Shot | **9** 759-847 (89 f): `CAMS.gateXY`, static. Xiang Yu 24/45 (34 %), Liu Bang's bowed head 80/51 (35 %, hat top at y 720 px) |

| Frames | Words | Who does what |
|---|---|---|
| 759-792 | 项羽张口就说 | Xiang Yu waves the lifted hand ("oh, that"), relaxed, `smug`, a chuckle (a head bob on 770). NOT angry: the picture says "without thinking" |
| 793-814 | “是你手下” | he lip-syncs and points at Liu Bang (`point`, arm 1). `HIT.inset` = 793: the INSET pops in the upper right (`SCREEN.informerInset`: x 620, y 215, 400 x 400, radius 28) showing the portrait of shot 5i in its night colours; under it the one-line grey plate 「刘邦的军官」 (the tag of line 5) |
| 815-843 | “【曹无伤】说的。” | `HIT.name` = 815: the plate FLIPS to the name: 「曹无伤」 84 px gold at (820, 612), 「告密的」 44 px white at (820, 690); the inset shakes for 3 frames, `Burst`. 818: Liu Bang's head comes UP out of the bow (`lookDown` 22 -> 0 in 4 frames, hands still clasped): `shock`, eyes up-right at the window; 830 his eyes narrow (`stern`); 838 a polite `smile_closed` again and the head goes back down. Xiang Yu keeps talking, pleased with himself, and sees none of it |
| 844-847 | (silence) | the inset shrinks away (843-846). Xiang Yu jerks his head toward the camp behind us: "come, drink" |

- Sound: 793 `pop`; 815 `name_slam` (a stamp with a low hit: THE informer's sound, used again at lines 20 and 21);
  818 a small `pluck`.
- Checked by looking: `e_09_gateXY.png` with a mock inset. Not checked: the inset as a component, the still's
  pipeline.

**HOW LINE 9 GUARANTEES THE THREAD.** The window shows the very picture the viewer saw 11 seconds ago (the
portrait of 5i, night colours inside a daylight frame, so it reads as "that night"), in the informer's corner, and
the plate under it changes in front of the viewer's eyes from what he was (刘邦的军官) to his NAME, on the exact
frame the narrator says it. Liu Bang's head snapping up to look at the window tells the viewer that Liu Bang has
just learned it too.

**Into line 10: FLAP WIPE, going IN (the cloth sweeps DOWN)**: covering 843-845, full 846-847, uncovering 848-850;
cut on 848 (`SEGMENTS` C). `cloth_flap` on 846. Xiang Yu changes from screen left to screen right here.

---------------------------------------------------------------------------------------------------------------

# Segment C (frames 848-1260): lines 10-13, 5 shots

## Line 10 「项羽留刘邦喝酒。可项羽的谋士范增，认定刘邦必须死。」

| | |
|---|---|
| Speech | 850-972. Groups: `0 850-888` 项羽留刘邦喝酒 · `1 889-932` 可项羽的谋士【范增】 · `2 933-955` 认定刘邦 · `3 956-972` 【必须死】 |
| Place | `tent` |
| Shots | **10a** 848-888 (41 f) `master`, static · **10b** 889-973 `jadeIn`, static; it runs on into line 11 without a cut |

| Frames | Words | Who does what |
|---|---|---|
| 848-888 | 项羽留刘邦喝酒 | **10a**: everyone seated (`banquet`): Liu Bang 56/41, Xiang Yu 79/54, the uncle 88/47, Fan Zeng a back view bottom left; no dancer, no Fan Kuai, no shield, the flap shut. Xiang Yu lifts his cup toward Liu Bang (852-860), Liu Bang lifts his gold cup back (858-866), both drink on 870; on 876 the uncle gives Liu Bang a small private nod. 886: Fan Zeng's white head turns toward Liu Bang -> cut |
| 889-932 | 可项羽的谋士【范增】 | **10b**: Fan Zeng alone, 44/51, 50 % wide, three-quarter front from the east, the long white beard, glaring to screen left = at Liu Bang (`stern`, `gaze: -1`). Tag 「范增 · 项羽的谋士」: `TAG.fanZeng` = 889, out 925, centre (475, 470), above his bun |
| 933-955 | 认定刘邦 | his eyes narrow, the head lowers 3 cm; the stare does not move |
| 956-972 | 【必须死】 | `HIT.mustDie` = 956: a 3 % lens punch-in over 3 frames, head pop 1.04, `huff`. No grade change |

- Sound: 846 `cloth_flap`; `tent_bed` (a low murmur, the lamps); 864 `cup_clink`; 956 `sting_dark`.
- Checked by looking: `e_10_jadeIn.png`. `master` with everyone seated: the first-round stills.

**Cut 10a -> 10b** on 889 (`capWord(10, "范增").from`): north -> east, 90 degrees, 3 frames after his head starts
to turn.

## Line 11 「范增三次举起玉佩，催项羽动手，项羽没反应。」

| | |
|---|---|
| Speech | 974-1074. Groups: `0 974-1018` 范增【三次】举起玉佩 · `1 1019-1045` 催项羽动手 · `2 1046-1074` 项羽【没反应】 |
| Shots | **10b continues as 11**, 974-1045: eased pull-back `jadeIn` -> `jade` on 974-990 (`shot("11").move`); the whole run 889-1045 is ONE shot of 157 f · **11i** 1046-1075 (30 f) `xy`, static |

| Frames | Words | Who does what |
|---|---|---|
| 974-990 | 范增 | the camera eases back: Xiang Yu comes into the frame on the left (22/36, 24 %, frontal, drinking); Fan Zeng is now 66/46 (34 %) |
| 985 | 【三次】举起玉佩 | `HIT.jade[0]` = 985: the green jade (prop `jade`; `hide: ["pendant"]`) comes up in the hand nearer Xiang Yu to about 58/42: up in 4 frames, a shake, down in 5. `Glint`, `Count` ×1 beside it |
| 1008 | (same group) | `HIT.jade[1]` = 1008: again, 5 cm higher, brows up. `Count` ×2 |
| 1030-1045 | 催项羽动手 | `HIT.jade[2]` = 1030: the third time he HOLDS it up and shakes it, jabbing his chin toward screen left (Liu Bang), `huff`. `Count` ×3, out on 1045 |
| 974-1045 | | Xiang Yu through all three: cup at his lips (990-1000), looks into the cup, looks the other way (`gaze: -1`), `smile_closed` at nothing. He never looks at the jade. 1043: he lifts the cup again -> cut |
| 1046-1075 | 项羽【没反应】 | **11i**: Xiang Yu alone, 57/49, 39 % wide, frontal. He sips (1046-1052), lowers the cup, a content sigh (`relief`), a blink, eyes on his cup. From off screen right the jade's clink twice more, muffled (1054, 1064). 1073: he puts the cup down |

- Props: `jade` (green), `cup:xiangyu` in his hand.
- Sound: `jade_clink` on 985, 1008, 1030 (each a little louder), two muffled on 1054, 1064; 1050 `sip`; 1058 `ah`.
- Checked by looking: `/home/user/hm_work/sb/b1/xy_jade.png` (the `xy` camera with the real cast). `jade` itself
  was not rendered again with the real cast.

**Cut 11 -> 11i** on 1046 (`HIT.noReaction`): on the cup rising; Xiang Yu 24 % -> 39 % (1.63x). **Cut 11i -> 12a**
on 1076 (`line(12).from`): on the cup going down, with the door flap's `cloth_flap` heard 2 frames earlier.

## Line 12 「范增就叫人进来舞剑，想趁机刺死刘邦。」

| | |
|---|---|
| Speech | 1076-1165. Groups: `0 1076-1103` 范增就叫人 · `1 1104-1125` 进来【舞剑】 · `2 1126-1165` 想趁机刺死刘邦 |
| Shots | **12a** 1076-1125 (50 f) `master`, static · **12b** 1126-1260 (135 f, through line 13) `dance`, a slow eased push (6 %) from 1194 |

| Frames | Words | Who does what |
|---|---|---|
| 1076-1084 | 范增就叫人 | **12a**: Fan Zeng (back view, bottom left) is already sweeping his arm toward the door; the flap opens (`setFlap` 0 -> 1, 1078-1084) |
| 1078-1108 | (same group) | 项庄 strides in along `ENTER.path` (2.9 m at 2.9 m/s), `smug`. Tag 「项庄」 (name only): `TAG.dancer` = 1095, out 1125; it FOLLOWS his head (`w.project(head)` minus 150 px) |
| 1109-1125 | 进来【舞剑】 | he stops at `DANCE_MARKS.dancer` (about 26 % x), facing Xiang Yu, and salutes (the bow: down 4 frames, held 4, up 2); Xiang Yu nods. 1121-1123: his hand goes to the hilt -> cut |
| 1126-1165 | 想趁机刺死刘邦 | **12b**: 项庄 20/49 (29 % wide), three-quarter front; Liu Bang seated behind and right, 79/46 (20 %). The blade is leaving the scabbard on the first frame (`sword0` in his hand, belt `hilt` hidden; out on 1128). A sweep overhead (1130-1140), a turn of the wrist, and from 1150 the tip creeps toward Liu Bang, who leans back (`nervous`, sweat). `IdiomTag` 「项庄舞剑，意在沛公」: `HIT.idiomDance` = 1130, out 1166, centre (540, 330) |

- Sound: 1074 `cloth_flap`; steps; 1128 `sword_draw` (the shing); 1134, 1144 `sword_whoosh`; the `tent_bed` drops out
  and a slow `drum_pulse` runs 1130-1258.
- Checked by looking: `/home/user/hm_work/sb/b2/dance_realcast.png` (the `dance` camera with the real cast).

**Cut 12a -> 12b** on 1126 (`cap(12, 2).from`), 3 frames after the hand goes to the hilt; the dancer about 15 % ->
29 %, another position.

## Line 13 「项羽的叔叔也下场舞剑，用身子挡着亲家。」

| | |
|---|---|
| Speech | 1167-1261. Groups: `0 1167-1193` 项羽的叔叔 · `1 1194-1221` 也下场舞剑 · `2 1222-1261` 用身子挡着【亲家】 |
| Shot | **12b continues** (no cut inside the dance: one continuous action) |

| Frames | Words | Who does what |
|---|---|---|
| 1150-1166 | (end of line 12) | `HIT.uncleRise` = 1150: the uncle rises at his seat, off screen right; his blade is HEARD leaving the scabbard on 1160 |
| 1158-1193 | 项羽的叔叔 | he walks into the frame from the right along `DANCE_MARKS.unclePath` (2.0 m), `sword1` in his hand, `stern` |
| 1194-1221 | 也下场舞剑 | he is on `DANCE_MARKS.uncle` (59/41, 24 % wide, facing us). 1196-1204 his blade swings across and meets the dancer's: `Burst` on 1200 (the two BLADES touch, nothing else), and the dancer's tip is knocked away from Liu Bang toward the floor |
| 1222-1261 | 用身子挡着【亲家】 | `HIT.shield13` = 1222: he spreads his arms like wings (hands at y 0.92, 0.5 m to each side; the sword in the right hand pointing down and out) and side-steps 0.15 m with each of the dancer's two feints (1230 left, 1244 right; 6 frames each). Liu Bang's head shows ABOVE the wing (79/46), peeking round him, `nervous`, then `relief` on 1250. The dancer: `smug` -> `huff` |
| 1259-1260 | | a BANG at the door (sound first); all three heads snap toward it |

- No tag: he was tagged at line 7; the caption's gold 【亲家】 points back to the stamp of line 7, and line 2's
  frozen picture has already shown this exact moment.
- Sound: 1160 `sword_draw` (off screen); 1200 `clang`; 1230, 1244 `sword_whoosh`; 1259 `door_bang`.

**Into line 14: hard cut on the BANG**, frame 1261 (`SEGMENTS` D): `dance` -> `door`, another position and subject.

---------------------------------------------------------------------------------------------------------------

# Segment D (frames 1261-1651): lines 14-17, 3 shots

## Line 14 「刘邦的保镖樊哙撞倒卫兵，冲了进来。」

| | |
|---|---|
| Speech | 1263-1346. Groups: `0 1263-1301` 刘邦的保镖【樊哙】 · `1 1302-1323` 撞倒卫兵 · `2 1324-1346` 冲了进来 |
| Shot | **14** 1261-1347 (87 f): `CAMS.door`, static |

THE FLOOR IS CLEAR FROM THIS SHOT ON: 项庄 is never rendered again (he has stepped back behind the north cameras)
and 项伯 sits at his seat with his sword sheathed (outside this frame). It is a cheat across the cut, invisible
because the camera has turned round.

| Frames | Words | Who does what |
|---|---|---|
| 1261-1280 | 刘邦的保镖 | the flap is open from the first frame (`setFlap(1)`): daylight in the doorway. The two guards (`GUARD`, `GUARD_B`) stand OUTSIDE with their backs to us (`ENTER.guards`: 38/33 and 64/33, `turn: 1`) and cross their halberds: somebody is coming. Liu Bang seated lower right (77/51, 30 %), his face to us, `nervous` |
| 1280-1300 | 【樊哙】 | between the guards the round RED shield grows: Fan Kuai charges from `ENTER.ramFrom`. Tag 「樊哙 · 刘邦的保镖」: `TAG.fanKuai` = 1300, out 1336, centre (380, 330): he stands under it from 1324 |
| 1302-1323 | 撞倒卫兵 | `HIT.ram` = 1302: the shield hits: `Burst`, a 3-frame camera kick; both guards fly apart sideways to `ENTER.guardsFlung` (0.8 m in 5 frames, arms up, helmets tipped) and are gone behind the wall; they land off screen (two thuds) |
| 1324-1346 | 冲了进来 | `HIT.burstIn` = 1324: he stands in the doorway at `ENTER.stand` (35/34, 26 % wide), the shield on his arm, glaring at Xiang Yu (`huff`, head pop 1.06), chest heaving. Liu Bang: `relief`. 1345: he strides off toward the floor -> cut |

- Props: `shield` (held upright in front of him with two pinned hands during the ram), the guards' halberds.
- Sound: 1259 `door_bang` (carried over the cut); 1302 `shield_bash`; 1308, 1311 `body_thud`; 1316-1324 heavy
  `steps`; 1324 `brass_low`.
- Checked by looking: `e_14a_burst.png`, `e_14b_burst.png`. Open: before the hit only the shield shows between the
  guards' backs: check that it reads at film size.

**Into line 15: cut on action** on 1348 (`line(15).from`), 3 frames into his stride: he arrives in the next frame.

## Line 15 「项羽夸他是壮士，赏他一条猪腿。生的。」

| | |
|---|---|
| Speech | 1348-1437, with 6 silent frames (1420-1425) before 生的. Groups: `0 1348-1386` 项羽夸他是壮士 · `1 1387-1419` 赏他一条猪腿 · `2 1426-1437` 【生的】。 |
| Shot | **15** 1348-1529 (182 f, through line 16): ONE shot on the north tripod: `two` (1348-1386) -> eased tilt down to `floor` on 1387-1398 (`shot("15b").move`) -> eased zoom out and tilt up to `master` on 1439-1452 (`shot("16").move`) |

| Frames | Words | Who does what |
|---|---|---|
| 1348-1386 | 项羽夸他是壮士 | Fan Kuai walks the end of `ENTER.path` to `MARKS.eat` (1348-1362) and stands 20/36 (20.5 %), still glaring. Xiang Yu (80/53, 23 %): brows up, then a big `grin`; he slaps the table (1366) and points at him approvingly. The servant comes in by `ENTER.path` with the leg in both hands (`hold`), at `MARKS.servant` by 1384 |
| 1387-1419 | 赏他一条猪腿 | `HIT.leg` = 1387: the camera tilts down with the leg. Fan Kuai drops the shield FACE DOWN at `SHIELD.onFloor` (flat by 1392) and kneels (sink 0.38, 1392-1398: 18/28, 23 %); the servant lays the leg on it (down on 1404) and backs out of the frame by 1418. The leg at 41/49: pink and wet |
| 1420-1425 | (silence) | nobody moves. Fan Kuai looks at the leg, at Xiang Yu, at the leg |
| 1426-1437 | 【生的】。 | `HIT.raw` = 1426: `Stamp` 「生的」 red, 130 px, centre (540, 400); its `at` is 1423 so that it LANDS on 1426; it stays to 1444. Fan Kuai draws (1428), saws once (1430-1436), puts a chunk in his mouth (1438) and chews with a `grin` (alternating `grin` / `smile_closed` every 4 frames) into line 16. Xiang Yu (84/37): `shock`, then delighted |

- Props: `shield`, `pigLeg`, a drawn sword in Fan Kuai's hand (BIBLE section 6).
- Sound: `tent_bed` back, low; 1366 table `slap`; 1390 `shield_drop`; 1404 `meat_slap`; silence 1420-1425; 1426
  `stamp`; 1432 `slice`; 1440-1460 `chew`.
- Checked by looking: `/home/user/hm_work/sb/b2/floor_eat_realcast.png` (the `floor` camera with the real cast).
  Not checked: the eating (new and unproven), the tilt.

No cut into line 16: the camera moves.

## Line 16 「刘邦起身去上厕所，把樊哙也叫了出去。」

| | |
|---|---|
| Speech | 1439-1528. Groups: `0 1439-1483` 刘邦起身去【上厕所】 · `1 1484-1528` 把樊哙也叫了出去 |
| Shot | **15 continues**: `floor` -> `master` on 1439-1452, then the master does not move (`STAGE.hook`) |

| Frames | Words | Who does what |
|---|---|---|
| 1440-1447 | 刘邦起身 | Liu Bang (56/41) puts his gold cup down on his table (down on 1447). THE CUP STAYS THERE for the rest of the film |
| 1452-1478 | 去【上厕所】 | a thought `Bubble` with the privy's own sign 「厕」 pops over his head (centre (520, 600), 150 px). 1456-1462 he rises (`EXIT`: seat top up over 6 frames); 1462-1484 he turns and walks the 1.0 m to the flap (`turn` ramps to a back view) |
| 1484-1496 | 把樊哙也叫了出去 | `HIT.beckon` = 1484: at the flap (lifting, `setFlap` 0 -> 1 on 1480-1486) he half-turns back (`turn` 1 -> 0.4) and beckons Fan Kuai with one hand (`wave`, 1484-1494); he is through the flap by `BEAT.liuOut` (1490 in v0; 1496 is allowed) |
| 1492-1529 | (same group) | Fan Kuai, mouth full, stands (1492-1498), takes the shield back on his arm (1498-1502) and walks the reversed `ENTER.path` to the door (1502-1526); the flap falls shut behind him (1526-1529, `BEAT.fanKuaiOut`). Xiang Yu waves his cup without looking. Fan Zeng's head (back view) follows them to the door |

THE FRAME ENDS ON: Liu Bang's empty pad, his table with the gold cup, the flap still swinging.

- Sound: 1447 `cup_down`; 1452 a small `pop`; 1456 robe `rustle`; 1484 and 1526 `cloth_flap`; 1502-1526 heavy
  `steps`.
- Not checked in motion: the exit (the numbers of `EXIT` were tried as stills in the first round).

**Into line 17: CUT THROUGH THE DOOR** on 1530 (`line(17).from`): Fan Kuai goes OUT through the flap -> outside, he
comes out of it toward us.

## Line 17 「刘邦说还没告辞。樊哙说：“人为刀俎，我为鱼肉，告什么辞！”」

| | |
|---|---|
| Speech | 1530-1652. Groups: `0 1530-1568` 刘邦说还没告辞 · `1 1569-1584` 樊哙说 · `2 1585-1607` “人为【刀俎】” · `3 1608-1629` “我为【鱼肉】” · `4 1630-1652` “告什么辞!” (quote: `quote("fanKuai", 17)`, 1585-1652) |
| Place | `camp` (outside the door) |
| Shot | **17** 1530-1651 (122 f): starts on `tentDoorIn`'s own axis from further back (pos (60.45, 1.5, 4.0), look (60.4, 1.0, -1.7), fov 40: Liu Bang about 31/45, Fan Kuai about 66/45, heads 20 % wide; computed, not rendered), then an eased push to `tentDoorIn` on 1569-1584 (Liu Bang 28/43, 27 %; Fan Kuai 75/43, 29 %) |

DECISION: Zhang Liang is NOT in this shot (the old plan had him standing at the left, untagged). Two people, one
argument; he is first seen and tagged at line 19.

| Frames | Words | Who does what |
|---|---|---|
| 1530-1568 | 刘邦说还没告辞 | Liu Bang is on his second step out (`CAMP.out.liuFrom` -> `liu`), stops, and looks back at the tent (`gaze: -1`, head tilt), lifting a hand toward the flap (`point`, 1540), `nervous`. No lip-sync (reported speech). Fan Kuai comes out of the flap behind him (1530-1548) to `CAMP.out.fankuai`, still chewing, shield on his arm |
| 1569-1584 | 樊哙说 | the push. Fan Kuai swallows (1572) and steps half a step toward him |
| 1585-1607 | “人为【刀俎】” | Fan Kuai lip-syncs and points at the tent with his whole arm (`point`, 1585). `IdiomTag` 「人为刀俎，我为鱼肉」: `HIT.daozu` = 1585, out 1640, centre (540, 380) |
| 1608-1629 | “我为【鱼肉】” | he points at Liu Bang's chest (1608), then jerks the thumb at himself (1618) |
| 1630-1652 | “告什么辞!” | he throws one hand up (1630), then hooks Liu Bang's arm (1640) and hauls him off to screen RIGHT (1642-1651); Liu Bang's head is still turned back to the tent, then he gives up and runs |

- Sound: a low outdoor camp bed; 1572 `gulp`; 1642 `drag_steps`; 1650 `whoosh`.
- Checked by looking: `e_17_in.png` (the end of the push). Not checked: the start framing.

**Into line 18: WHIP PAN RIGHT**, with them, frames 1649-1654, cut on 1652 (`SEGMENTS` E).

---------------------------------------------------------------------------------------------------------------

# Segment E (frames 1652-2090): lines 18-22, 9 shots

## Line 18 「刘邦丢下车队，只骑一匹马，抄小路回了军营。」

| | |
|---|---|
| Speech | 1654-1754. Groups: `0 1654-1686` 刘邦丢下车队 · `1 1687-1714` 只骑【一匹马】 · `2 1715-1754` 抄小路回了军营 |
| Places | `gate`, then `path` |
| Shots | **18a** 1652-1714 (63 f) `gate`, static, no Xiang Yu · **18b** 1715-1755 (41 f) `hill`, static |

| Frames | Words | Who does what |
|---|---|---|
| 1652-1686 | 刘邦丢下车队 | **18a**: the cart (46-69 % x) and the eight red pawns (73-83 %) stand EXACTLY as at line 8. Liu Bang is already on the horse behind the cart (his red top half and the horse's head show above it; the seated `LIU_BANG` on the prop's back), and looks back to screen left once (1660). Fan Kuai and three red soldiers (`LIU_GUARD`, `LIU_GUARD_B` and a second `LIU_GUARD` through `w.actor(PEOPLE.liuGuard, "r3")`, halberds hidden) run in from the left edge (1654-1680, 3.4 m/s) |
| 1687-1714 | 只骑【一匹马】 | `HIT.horse` = 1687: the horse goes: out from behind the cart and off the right edge by 1702, the four runners behind it, the last out by 1712. The cart and the pawns do not move. The last frames are the abandoned cart (the picture of the pinned comment 「车还停着，不代表人还在」) |
| 1715-1755 | 抄小路回了军营 | **18b**: the horse with the red rider enters from the LEFT edge on the first frame, same direction, same speed; the four runners 2.2 m + 1.5 m apart behind it; dust puffs (white discs, a pure function of the frame). Heads are 5.6 % wide: this shot is a red dot on a horse and four dots crossing a green hill, and nothing else has to be read |

- Props: `horse`, `shield` on Fan Kuai's arm; the cart and pawns (set).
- Sound: 1652 `whoosh`; 1687-1755 `hooves`, ONE clip running across the cut; running feet; a far `wind` on the hill.
- Checked by looking: only the first-round stills with stand-in costumes. The far shot's readability at phone size
  is unproven.

**18a -> 18b: CUT ON CONTINUING MOTION** on 1715 (`cap(18, 2).from`): they leave right, they enter from the left.
**Into line 19: WHIP PAN LEFT** (back to Xiang Yu's camp), frames 1753-1758, cut on 1756 (`line(19).from`).

## Line 19 「等刘邦到了军营，他的谋士才进去说：“他喝多了。”」

| | |
|---|---|
| Speech | 1756-1861. Groups: `0 1756-1794` 等刘邦到了军营 · `1 1795-1838` 他的谋士才进去说 · `2 1839-1861` “他【喝多了】。” (quote: `quote("zhangLiang", 19)`, 1839-1861) |
| Places | `camp`, then `tent` |
| Shots | **19a** 1756-1794 (39 f) `tentSky`, static · **19b** 1795-1862 (68 f) `two`, static |

| Frames | Words | Who does what |
|---|---|---|
| 1756-1794 | 等刘邦到了军营 | **19a**: Zhang Liang stands alone in front of the tent at `CAMP.wait.zhang`, small (50/47, head 10 % wide), hands together low, the gift tray at his feet; calm, a slow blink. The sun disc slides across the top half (`setSun(u)`, 0.25 -> 0.75 on 1758-1786, eased): TIME PASSES. 1786: he looks up at the sun and nods; 1788-1794 he bends toward the tray (the wipe hides the pick-up: a standing hand cannot go below 0.58 m) |
| 1795-1838 | 他的谋士才进去说 | **19b**: Liu Bang's EMPTY seat and gold cup in the middle (41/50), Fan Kuai's empty pad on the left; Xiang Yu 77/54, the uncle 88/45. Zhang Liang walks the last step to `MARKS.gift` with the tray in two pinned hands (1795-1802), sets it down at `TRAY` (1803-1808) and bows (1810-1816; 39/45, 23 % wide). Tag 「张良 · 刘邦的谋士」: `TAG.zhang` = 1800, out 1836, centre (420, 520), above his cap |
| 1839-1861 | “他【喝多了】。” | `HIT.drunk` = 1839: he lip-syncs, still bowed, perfectly straight-faced (`neutral`), with a tiny tip of the head toward the empty seat. Xiang Yu looks at the empty seat (`gaze: -1`), shrugs (1846), and picks the pale jade disc off the tray (1852-1860), pleased. Fan Zeng's head (back view) drops: he knows |

- Props: `tray`, the pale gift jade, `cup:liu` on the empty table.
- Sound: 1758-1786 a soft rising `time_whoosh`, one bird; 1793 `cloth_flap`; `tent_bed` low; 1806 `tray_down`;
  1860 a dry `ting` on the jade; 1861 `whoosh`.
- Checked by looking: `/home/user/hm_work/sb/b2/two_gift_realcast.png` (`two` with the real cast: Zhang Liang is at
  39 % x, not the 26 % of the old note, so the tag moved to x 420). `tentSky`: first-round still only.
- Who is who: the narrator says 他的谋士 while the tag says 刘邦的谋士 over the only pale blue-green figure of the
  film.

**19a -> 19b: FLAP WIPE, going IN (down)**: covering 1790-1792, full 1793-1794, uncovering 1795-1797; cut on 1795
(`cap(19, 1).from`). **Into line 20: WHIP PAN RIGHT** (to Liu Bang's camp), frames 1860-1865, cut on 1863
(`line(20).from`).

## Line 20 「刘邦回营第一件事：杀了曹无伤，那个告密的军官。」

| | |
|---|---|
| Speech | 1863-1974. Groups: `0 1863-1906` 刘邦回营第一件事 · `1 1907-1934` 杀了【曹无伤】 · `2 1935-1974` 那个【告密】的军官 |
| Place | `dayL` (Liu Bang's red tent by day) |
| Shots | **20** 1863-1906 (44 f) `campDay`, static · **20i** 1907-1934 (28 f) NEW `caoBustDay`, static · **20c** 1935-1975 (41 f) `campDay` -> eased push to `campDayIn` on 1945-1975 |

| Frames | Words | Who does what |
|---|---|---|
| 1863-1874 | 刘邦回营 | **20**: the pan lands. The informer stands at `NIGHT_L.informer` (65/40, 18 % wide) at ease, `smug`, hands at the roll on his belt (`hold`); a red guard half a step behind him on each side (44/39 and 84/39; `LIU_GUARD_B` screen left, `LIU_GUARD` screen right: halberds in the OUTER hands). Liu Bang strides in from the left edge (two steps) to `NIGHT_L.liuDay` (14/42, 19 %) and POINTS at him (`point`, arm 1, on 1874), `stern` |
| 1876-1906 | 第一件事 | 1876 the informer sees the finger: `shock`. 1880-1890 the guards step in to his sides. 1888: `Mark "?"`, the gold "?" of line 2, pops over his roof cap at (700, 450), 200 px. 1904: the guards' free hands clamp his arms -> cut |
| 1907-1934 | 杀了【曹无伤】 | **20i**: his face fills the frame: 54/44, 48 % wide; half a guard's helmet at each edge; the red tent's cream door flap behind his head. `HIT.kill` = 1907: the name plate SLAMS in above his cap: 「曹无伤」 84 px gold at (700, 285), 「告密的」 44 px white at (700, 363), and knocks the "?" away (it flies off up-right on 1907-1910). `Burst`. His face: `shock`, then `nervous`, sweat, eyes darting left and right (6 frames each). Plate out 1931-1933. 1930: the guards start to pull him to screen right |
| 1935-1952 | 那个【告密】的军官 | **20c**: the three are already moving right along `NIGHT_L.exit` (0.3 m in on the first frame), his feet dragging, his head turned back to Liu Bang; all out of frame by 1952. Liu Bang lowers his arm and turns away to the left; he does not watch; he is out of frame by 1962 |
| 1950-1975 | (same group) | the footsteps stop (1948). Silence. The roof cap ROLLS back in from the right on its rim (`NIGHT_L.capFrom` -> `cap`, 1.4 m, 1950-1966), wobbles, tips flat and rocks to rest by 1970. The camera pushes in on it: on 1975 the cap sits alone at 61/56 in front of the door flap. No blood, no blade, nothing else |

- Props: `cap` (and `hide: ["officerCap"]` on the figure from the frame the prop appears: he is out of frame by
  then), the guards' halberds.
- Overlays: `Mark "?"` 1888-1910 (it crosses the cut 20 -> 20i at the same place over the same cap: the ONE
  exception to rule 11, because the cut-in is on him); the name plate 1907-1933.
- Sound: 1863 `whoosh`; 1880-1890 `guard_steps`; 1888 `pop_q` (the SAME sound as line 2); 1907 `name_slam` (the
  SAME sound as line 9); 1930-1948 `drag_steps` fading; 1950-1966 `cap_roll` (a hollow roll); 1968 `cap_settle`.
- Checked by looking: `e_20a_day.png` .. `e_20d_capIn.png`, `/home/user/hm_work/sb/b2/caoBustDay_low.png`. Not
  checked: the march, the cap's roll, his dark red against the red tent under the real light.

**HOW LINE 20 GUARANTEES THAT THE VIEWER KNOWS HIM.** (1) Colour and outline: the dark crimson man with the black
roof cap between two bright red helmets, at 65 % x, the informer's side of the screen. (2) The "?" of line 2 comes
back over the same cap, with the same sound: the question the film asked 55 seconds ago is on screen again. (3) On
the exact frame the narrator says 曹无伤 the picture cuts to the same close framing as his portrait of line 5 (and
of line 9's window): the same face at half the frame's width, and the same name plate with the same sound knocks
the "?" away: question, answer. (4) The narrator then says 那个告密的军官 while the plate still reads 告密的.
(5) What is left on the ground is the cap: the one shape that has stood for him since line 2.

**20 -> 20i** on 1907, on the guards' hands (18 % -> 48 % = 2.7x). **20i -> 20c** on 1935 (`cap(20, 2).from`), on
the pull. **Into line 21: MATCH CUT on the round thing** on 1976 (`line(21).from`): the cap at 61/56 -> the pale
jade disc in Xiang Yu's hand at 61/56.

## Line 21 「而这个名字，是项羽自己说漏的。」

| | |
|---|---|
| Speech | 1976-2048, then 8 silent frames (2049-2056). Groups: `0 1976-2003` 而这个名字 · `1 2004-2048` 是项羽自己【说漏】的 |
| Place | `tent` |
| Shot | **21** 1976-2054 (79 f): `CAMS.two` + `INSET21`; static to 2039, then an eased move toward Liu Bang's empty seat on 2040-2054 |

| Frames | Words | Who does what |
|---|---|---|
| 1976-1984 | 而这个名字 | Xiang Yu (77/54) holds the pale jade disc up at 61/56 in the lamp light, turning it, `smile_closed`, eyes on it; `Glint` on 1978. The uncle 88/45 beside him; Liu Bang's empty seat and gold cup mid-frame (41/50); Fan Kuai's empty pad left; the tray at `TRAY`; Fan Zeng's back view bottom left, head down |
| 1985-2003 | (same group) | `HIT.inset21` = 1985: the INSET pops above his head like a memory (`INSET21`: x 330, y 240, 690 x 490, radius 28, pointer tip (790, 800) at his head). It shows the still `public/hongmen/inset_gate.jpg` = shot 9 at `quote("xiangYu", 9).from + 30` (the part x 0, y 590, w 650, h 462 of that frame): Xiang Yu at the gate in daylight, mouth open, pointing |
| 2004-2039 | 是项羽自己【说漏】的 | `HIT.slip` = 2004: inside the inset the speech `Bubble` 「曹无伤」 pops out of his mouth (280 x 130 px at (712, 300), text 78 px, GOLD like the name plate) and bounces once. Under it the live Xiang Yu breathes on the jade and polishes it on his sleeve (2010-2030), holds it up again, delighted. He never looks up |
| 2040-2054 | (silence from 2049) | the inset shrinks away (2046-2049). The camera eases toward Liu Bang's EMPTY seat (`look` -> `SEATS.liu.head`, fov 40 -> 30): the empty pad and the gold cup end at about 43/47 |

- Props: the pale gift jade in his hand, `tray`, `cup:liu`, `cup:xiangyu`.
- Sound: `tent_bed`; 1978 `ting`; 1985 `pop`; 2004 `bubble_pop` over the low hit of `name_slam`, quieter; 2012 cloth
  polish; 2054 one soft water `drip` (the privy is next).
- Checked by looking: `e_21_inset.png` (mock inset). Not checked: the insets as components, the last move.

**HOW LINE 21 GUARANTEES THE POINT.** The window is the gate scene the viewer has seen (same lens, same daylight,
same pointing arm), so it reads as a replay at once; the name comes out of Xiang Yu's OWN mouth as a bubble, in the
gold of the plate that has carried the name twice; the pointer ties the remembered Xiang Yu to the live one, who is
smiling at a piece of jade. The name the viewer saw written over the dead man's head 2 seconds ago is the name in
the bubble.

**Into line 22: MATCH CUT** on 2055 (`line(22).from - 2`, `BEAT.privyBack`): the EMPTY seat at 43/47 -> the man on
the privy seat at the same screen spot.

## Line 22 「至于刘邦，」

| | |
|---|---|
| Speech | 2057-2079, then the 12-frame tail. Group: `0 2057-2079` 至于刘邦， (drawn to the last frame) |
| Place | `privy` |
| Shot | **22** 2055-2090 (36 f): `privyClosing(g, len)` with g = f - 2055; `hud: false` |

Liu Bang as himself (`LIU_PRIVY`, `smug`), sitting calmly, the right hand low: exactly where the film began. No tag,
no overlay, no flash, no new sound. THE LAST FRAME (2090) IS THE FILM'S FRAME 0: call `privyClosing(g, 35)` so
that g = 35 gives the picture of `privyOpening(0)` (a looping player then holds that picture for two frames, which
does not show on a calm pose; if the join is seen to hitch in the app, `privyClosing(g, 36)` ends one breathing
frame BEFORE frame 0 instead). On the loop the viewer hears 「至于刘邦，」, 15 silent frames, 「他靠上厕所，躲过了一场暗杀。」
while the hand rises and the face changes.

- Sound: the room's quiet only. The narration of lines 22 and 1 is ONE recorded sentence cut at the comma.
- Checked by looking: one still of the closing shot (`o_opening.md`). Not checked: the join in a looping player.

---------------------------------------------------------------------------------------------------------------

# The shot table (placeholder timing v0)

| # | Shot | Frames | Length | Line | Place | Camera (move) | Comes in by |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 0-77 | 78 | 1 | privy | `hero` (punch-in, push) | the loop |
| 2 | 2a | 78-140 | 63 | 2 | tent | `master` (slow push) | TITLE CUT |
| 3 | 2i | 141-185 | 45 | 2 | tent | NEW `freezeLiu` (zoom, rush to the flap) | axial cut-in, 2.1x |
| 4 | 2b | 186-214 | 29 | 2 | camp | `outside` | FLAP WIPE up |
| 5 | 3 | 215-294 | 80 | 3 | card | `card3` | CARD WIPE |
| 6 | 4i | 295-327 | 33 | 4 | card | NEW `card4XY` | WHIP PAN left |
| 7 | 4 | 328-377 | 50 | 4 | card | `card4` (push on Xiang Yu) | cut on the rising arm, 2.3x |
| 8 | 5 | 378-451 | 74 | 5 | nightX | `nightX` | MATCH CUT on Xiang Yu |
| 9 | 5i | 452-481 | 30 | 5 | nightX | NEW `caoBust` | cut on the lean, 1.68x |
| 10 | 6 | 482-532 | 51 | 6 | nightX | `nightX` -> `nightXin` | cut on the drawn breath, 1.68x |
| 11 | 7i | 533-594 | 62 | 7 | nightL | NEW `uncleIn` | WHIP PAN right |
| 12 | 7 | 595-651 | 57 | 7 | nightL | `campNight` | cut on the cup, 1.62x |
| 13 | 8 | 652-758 | 107 | 8 | gate | `gate` (slow push) | WHIP PAN left + dawn |
| 14 | 9 | 759-847 | 89 | 9 | gate | `gateXY` | cut on the lifting hand, 1.63x |
| 15 | 10a | 848-888 | 41 | 10 | tent | `master` | FLAP WIPE down |
| 16 | 10b + 11 | 889-1045 | 157 | 10, 11 | tent | `jadeIn` -> `jade` | cut on the head turn, 90 degrees |
| 17 | 11i | 1046-1075 | 30 | 11 | tent | `xy` | cut on the cup, 1.63x |
| 18 | 12a | 1076-1125 | 50 | 12 | tent | `master` | cut on the cup going down + flap sound |
| 19 | 12b + 13 | 1126-1260 | 135 | 12, 13 | tent | `dance` (slow push) | cut on the hand at the hilt |
| 20 | 14 | 1261-1347 | 87 | 14 | tent | `door` | cut on the BANG |
| 21 | 15a + 15b + 16 | 1348-1529 | 182 | 15, 16 | tent | `two` -> `floor` -> `master` | cut on the stride |
| 22 | 17 | 1530-1651 | 122 | 17 | camp | wide -> `tentDoorIn` | CUT THROUGH THE DOOR |
| 23 | 18a | 1652-1714 | 63 | 18 | gate | `gate` | WHIP PAN right |
| 24 | 18b | 1715-1755 | 41 | 18 | path | `hill` | CUT ON CONTINUING MOTION |
| 25 | 19a | 1756-1794 | 39 | 19 | camp | `tentSky` | WHIP PAN left |
| 26 | 19b | 1795-1862 | 68 | 19 | tent | `two` | FLAP WIPE down |
| 27 | 20 | 1863-1906 | 44 | 20 | dayL | `campDay` | WHIP PAN right |
| 28 | 20i | 1907-1934 | 28 | 20 | dayL | NEW `caoBustDay` | cut on the guards' hands, 2.7x |
| 29 | 20c | 1935-1975 | 41 | 20 | dayL | `campDay` -> `campDayIn` | cut on the pull |
| 30 | 21 | 1976-2054 | 79 | 21 | tent | `two` (ease to the empty seat) | MATCH CUT cap -> jade |
| 31 | 22 | 2055-2090 | 36 | 22 | privy | `hero` | MATCH CUT empty seat -> the privy seat |

Sums: A 378 (7 shots) + B 470 (7) + C 413 (5) + D 391 (3) + E 439 (9) = 2091 frames, 31 shots.

## Checked against the rules

| Rule (BIBLE section 10) | Result |
|---|---|
| 1. no shot under 18 frames | shortest 28 (20i), then 29 (2b), 30 (5i, 11i). PASS |
| 2. 30-36 shots, about 1.5 per line | 31 shots, 1.41 per line, mean 67 frames (2.2 s), median 57 (1.9 s). Arthur: 74 shots, median 0.68 s. PASS. Segment D has only 3 shots for 4 lines: on purpose (its three tent framings share one tripod, where only moves are allowed) |
| 3. size / angle | every same-subject cut is 1.6x or more, or another position: the ratios are in the table. Tightest: 7i -> 7 (1.62x), 8 -> 9 and 11 -> 11i (1.63x). `master` / `two` / `floor` never cut to each other. PASS on paper; the ratios come from stills, not from the film |
| 4. cuts on action | 13 of the 14 cuts inside a place name their action. The exception is 2a -> 2i (a freeze: nobody can move): carried by the continuing push and a drum |
| 5. designed place changes | 15 place changes, none bare: title cut 1, flap wipe 3 (2i -> 2b up, 9 -> 10a and 19a -> 19b down), card wipe 1, whip pan 5 (right at 6 -> 7i, 17 -> 18a, 19b -> 20; left at 7 -> 8, 18b -> 19a), match cut 3 (4 -> 5, 20c -> 21, 21 -> 22), through the door / on motion 2 (16 -> 17, 18a -> 18b). A sixth whip pan (3 -> 4i, left) stays inside the card |
| 6. screen direction | outside: Xiang Yu left, Liu Bang right, in every shot; whip pans follow the geography. Inside from the north: Xiang Yu right. Xiang Yu's side flips at 9 -> 10a under a flap wipe (known, BIBLE 2.1) |
| 7. cuts between lines on the first syllable or 2 frames before | every line cut is `line(n).from`, `line(n).from - 2` or a segment start. PASS |
| 8. moves eased, 10 frames or more | 13 moves: 2a, 2i (two), 4, 6, 8, 10b -> 11, 12b, 15b, 16, 17, 20c, 21; the shortest are 10 frames (4, 2i's rush), 11 (6), 12 (15b). PASS |
| 9. a sound for every cut | named in every section. The cue sheet (`scripts/hongmen/sound/cues.json`) is built from them |
| 10. windows, not cuts, for the informer at 9 and the replay at 21 | yes |
| 11. overlays do not bridge cuts | one exception, on purpose: the "?" over the informer across 20 -> 20i |

## Where each name is given

| Tag | Line, shot | Frames (v0) | Position (px) | Head width there |
|---|---|---|---|---|
| 「刘邦」 | 1, shot 1 | 9-45 (`TAG.liu`) | (835, 360), right of his head | about 30 % |
| 「项羽」 | 4, shot 4i | 298-327 (`TAG.xiangYu` + 3) | (830, 700), right of his head | 35 % |
| 「刘邦的军官」 | 5, shot 5 | 400-436 (`TAG.officer`) | (745, 385), upper right | 31 % |
| 「项伯 · 项羽的叔叔」 | 7, shot 7i | 548-584 (`TAG.uncle`) | (560, 470), above his cap | 34 % |
| 「曹无伤 · 告密的」 | 9, on the inset | 815-843 (`TAG.informer`) | (820, 612) / (820, 690), upper right | the inset: 400 px |
| 「范增 · 项羽的谋士」 | 10, shot 10b | 889-925 (`TAG.fanZeng`) | (475, 470), above his bun | 50 % |
| 「项庄」 | 12, shot 12a | 1095-1125 (`TAG.dancer`) | follows his head | about 15 % (then 29 % in 12b under the idiom tag that carries his name) |
| 「樊哙 · 刘邦的保镖」 | 14, shot 14 | 1300-1336 (`TAG.fanKuai`) | (380, 330), over the doorway | 26 % |
| 「张良 · 刘邦的谋士」 | 19, shot 19b | 1800-1836 (`TAG.zhang`) | (420, 520), above his cap | 23 % |
| 「曹无伤 · 告密的」 again | 20, shot 20i | 1907-1933 (CHANGE: `HIT.kill`, not `line(20).from + 12`) | (700, 285) / (700, 363), above his cap | 48 % |
| bubble 「曹无伤」 | 21, in the inset | 2004-2046 (`HIT.slip`) | (712, 300) | - |
| Stamps | 「鸿门宴」 80-138 (540, 300) · 「亲家」 628-648 (540, 560) · 「生的」 1423-1444 (540, 400) | | | |
| Idiom tags | 「项庄舞剑，意在沛公」 1130-1166 (540, 330) · 「人为刀俎，我为鱼肉」 1585-1640 (540, 380) | | | |
| "?" | line 2: 190-211 (702, 470) · line 20: 1888-1910 (700, 450) | | | |
| Source tag 「《史记》」 | top left, 215-2054 | | | |

## What `beats.ts` and `layout.ts` need for this storyboard (for their owners)

1. `layout.ts` `CAMS`: add `freezeLiu`, `card4XY`, `caoBust`, `uncleIn`, `caoBustDay` (BIBLE section 2); un-mark
   `xy` as unused.
2. `beats.ts` `SHOTS`: add the rows `2i` (from `HIT.oneDead`, `freezeLiu`), `4i` (from `line(4).from`, `card4XY`;
   shot `4` then starts on `HIT.n40`), `5i` (from `quote("caoWushang", 5).from`, `caoBust`), `7i` (from
   `line(7).from`, `uncleIn`; shot `7` then starts on `HIT.toast`), `11i` (from `HIT.noReaction`, `xy`), `20i` (from
   `HIT.kill`, `caoBustDay`), `20c` (from `cap(20, 2).from`, `campDay` with the move to `campDayIn`); shot `6` is no
   longer `joined`; shot `20` loses its move; `BEAT.push2` is replaced by the cut to `2i`.
3. `beats.ts`: `TAG.informerAgain` = `HIT.kill`; `BEAT.march` = `cap(20, 2).from - 5`, `BEAT.marchedOut` =
   `cap(20, 2).from + 17`, `HIT.capRoll` = `cap(20, 2).from + 15`; `HIT.draw` (the blade leaves the scabbard) =
   `cap(12, 2).from + 2`; `TAG.xiangYu` = `line(4).from + 3`.
4. Sets: `setArmies(rows40, rows10)` on the card (line 4); the capital's tower not red (line 3).
5. Props: the pale gift jade as its own prop or a colour option (lines 19, 21); wide flat sword blades (line 2).
6. Overlays: `Wipe` (up / down / from the right), `Streak`, `Inset` with two pre-rendered stills
   (`inset_cao.jpg` from shot 5i, `inset_gate.jpg` from shot 9), `Bubble` (speech and thought), `IdiomTag`, `Count`.
7. Cast: Fan Kuai's tag 保镖.
