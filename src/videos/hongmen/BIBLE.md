# 《鸿门宴，到底死了谁？》 film bible (HongmenFilm)

A vertical short (1080 x 1920, 30 fps) for Douyin / YouTube Shorts. Mandarin narration at about 5.4 字/s with no
pauses: 22 lines, 362 字. Placeholder length 2091 frames = 69.7 s (`voice.ts`, `VOICE_TOTAL_F`); it changes when the
real voice exists, the structure does not. The film LOOPS: its last picture is its first picture, and the last line
「至于刘邦，」 runs into the first line 「他靠上厕所，躲过了一场暗杀。」.

The only valid script is `/mnt/project-files/next-video/hongmen/script_v4.md`. The shot-by-shot plan is
`STORYBOARD.md` in this folder. The owner's rules and the brief: `/home/user/hm_notes/00_director.md`.

Style: the kit's hand-drawn 3D figures (`group/kit/rig3d`), plain sets with ink outlines, expressive faces,
everything literal. Compared with the Arthur film the story has three times the named people at the same narration
speed, so the picture is SIMPLER: few places, fixed seats, one action per caption group, about 31 shots (Arthur: 74).

## 1. The story (only what script v4 says; the source is 《史记·项羽本纪》)

| # | Beat | Lines |
|---|---|---|
| 1 | THE HOOK. A man in red sits on a privy and does the "shh, look at my jawline" gesture: he dodged an assassination by going to the toilet. | 1 |
| 2 | THE PROMISE. The dinner is the Hongmen feast. A room full of blades, and in the end only ONE man died, and he was not even at the table. (Who? A black figure with a "?" outside the tent.) | 2 |
| 3 | BACKSTORY. The Qin dynasty has just fallen. Liu Bang took the capital first. Xiang Yu is far stronger: 400,000 men against his 100,000. | 3, 4 |
| 4 | THE INFORMER. One of Liu Bang's own officers tells Xiang Yu: "Liu Bang wants to be king." Xiang Yu is furious: "We attack tomorrow!" | 5, 6 |
| 5 | THE UNCLE. That night Xiang Yu's uncle comes to Liu Bang's camp with the warning; Liu Bang makes him an in-law on the spot. | 7 |
| 6 | THE SLIP. Next morning Liu Bang goes to apologise: "some petty man stirred this up." Xiang Yu, without thinking: "It was your own officer, Cao Wushang." | 8, 9 |
| 7 | THE BANQUET. Xiang Yu keeps him for a drink. His adviser Fan Zeng wants Liu Bang dead: he raises his jade three times (the signal), Xiang Yu does not react. | 10, 11 |
| 8 | THE SWORD DANCE. Fan Zeng sends a man in to dance with a sword and stab Liu Bang. The uncle gets up and dances too, keeping his body between the blade and his new in-law. | 12, 13 |
| 9 | FAN KUAI. Liu Bang's bodyguard knocks the guards down and bursts in. Xiang Yu calls him a brave man and gives him a leg of pork. Raw. | 14, 15 |
| 10 | THE TOILET. Liu Bang gets up to go to the toilet and waves Fan Kuai out with him. He says he has not said goodbye; Fan Kuai: "They are the knife and the board, we are the fish. Goodbye?!" | 16, 17 |
| 11 | THE ESCAPE. Liu Bang leaves his carriages standing, takes one horse and goes home by a back road. Only when he is back in camp does his adviser walk in and say: "He had too much to drink." | 18, 19 |
| 12 | THE ANSWER. The first thing Liu Bang does back in camp: he kills Cao Wushang, the officer who informed. And that name was let slip by Xiang Yu himself. | 20, 21 |
| 13 | THE LOOP. "As for Liu Bang," (cut to the privy: the film's first frame). | 22 |

Where the script differs from the source (its section 和原文不完全一样的地方; do not "correct" the picture):
- Line 1: the source only says he "rose to go to the privy" (起如厕), not that it was an excuse; the escape is owed to
  Fan Kuai and Zhang Liang. Kept as the hook.
- Line 2 "only one man died": the source records only Cao Wushang's death; he dies after the feast, in Liu Bang's camp.
- Line 7: the uncle (项伯) came to warn his old friend Zhang Liang, who took him to Liu Bang. The picture shows only the
  uncle and Liu Bang.
- Line 11: the source does not say what raising the jade meant; "urging him to strike" is the usual reading. The 玉玦
  is called 玉佩.
- Line 15: the source says a pig's shoulder (彘肩); the script says a leg.

Picture-only details that the narration does not say but the source supports (allowed, keep them small): the four
runners behind the horse (line 18), the gift of white jade that Zhang Liang brings and Xiang Yu keeps (lines 19, 21),
the hundred-odd retinue as eight red pawns at the gate (lines 8, 18).

NOT in the picture: no blood, no blade touching a body, no corpse (line 20: he is marched out of frame, his cap rolls
back in). No smashed jade cups, no draw counter, no black-and-white face card (old scripts). No Zhang Liang before
line 19. No Latin text. Nothing from the reference channel's characters.

## 2. The world: nine places, each its own island along x

Metres, y up, floor y 0, facing 0 = toward +z. Every number lives in `layout.ts` (seats, marks, cameras) and
`sets/privy.ts` (the privy); nobody types a seat, a mark or a camera by hand. One place shows at a time
(`w.setPlace(place)`; the type `Place` in `story.ts`). Every place outside the tent is seen from +z looking toward -z.

| Place (`Place`) | x | Lines | What it is | Marks (`layout.ts`) | Cameras by name (`CAMS`) |
|---|---|---|---|---|---|
| `card` | -100 | 3, 4 | A pale sand-table board (沙盘), x -107 .. -87, z -22 .. 6, with the real figures on it as giant pieces. Two tableaux 6 m apart: the capital's gate (line 3) and the two armies (line 4) | `CARD.city`: wall centre (-94.65, 0, -1.0), 1.7 x 1.0 x 0.5; flag socket (-93.92, 1.0, -0.92); Liu Bang (-93.53, 0, -0.74), from (-92.4, 0, -0.5). `CARD.versus`: Xiang Yu (-100.72, 0, 0), Liu Bang (-99.26, 0, 0), 40 pawns 4 x 10 from (-100.72, 0, -1.0), 10 pawns 2 x 5 from (-99.26, 0, -1.0), spacing 0.40 x 0.46. `CARD_LABELS` | `card3`, `card4`, NEW `card4XY` |
| `privy` | -60 | 1, 22 | A screened privy in Xiang Yu's camp: a pale commode (variant B), reed screen, hanging sign 「厕」, oil lamp, bucket of wiping sticks, dark indigo cloth wall. BUILT (`sets/privy.ts`) | `PRIVY_AT` (-60, 0, 0), seat top y 0.30 (`PRIVY.seat.B`), head (-60, 1.08, 0.02) | `PRIVY.cams.hero` (the film uses only this one), `front`, `wide` |
| `nightX` | -30 | 5, 6 | A corner of Xiang Yu's quarters at night: back wall z -1.35, left wall x -31.75, the right side open and dark; a low table with an oil lamp, a dark purple banner | `NIGHT_X.seat` (-30.34, 0.10, 0) facing the camera; lamp (-30.06, 0.34, 0.47); informer from (-28.5, 0, 0.1) to (-29.67, 0, -0.1), kneel = sink 0.38, facing -0.9; flinch (-29.59, 0, -0.12); slam (-30.44, 0.34, 0.42) | `nightX`, `nightXin`, NEW `caoBust` |
| `tent` | 0 | 2, 10-16, 19, 21 | The command tent: dark indigo / purple-brown cloth walls, lacquer red and black low tables, gold details, warm lamps, a cool accent from the door. Inside x -2.9 .. 2.6, z -2.45 .. 3.0, eaves 2.4. The door flap in the SOUTH wall | section 3 | `master`, `two`, `floor` (one tripod), `dance`, `door`, `jade`, `jadeIn`, `xy`, NEW `freezeLiu` |
| `nightL` / `dayL` | 30 | 7 (night), 20 (day) | In front of Liu Bang's own RED tent (front along z -2.3, door at x 30.75), a fire basket at (29.88, 0, -1.45), a red banner pole at (28.55, 0, -1.9). The same island with the night or the day light | `NIGHT_L`: night: Liu (30.42, 0, -0.45), uncle from (27.9, 0, -0.25) to (29.55, 0, -0.5), toast (29.98, 1.08, -0.4), clasp (29.98, 0.86, -0.4). Day: Liu (29.22, 0, -0.35), informer (30.5, 0, -0.7), guards (29.95, 0, -1.0) and (31.05, 0, -1.0), exit to (32.7, 0, -0.6), cap from (32.2, 0, -1.25) to (30.8, 0, -1.25) | `campNight`, `campDay`, `campDayIn`, NEW `uncleIn`, NEW `caoBustDay` |
| `camp` | 60 | 2 (second beat), 17, 19 (first beat) | OUTSIDE the command tent: the facade along z -4 (9 m wide, eaves 2.3), the same door flap from the other side at (60, 0, -4), two banner poles 2.2 m left and right. The wall from x 60.6 to 62.2 stays BARE (the silhouette stands there) | `SHADOW` (60.95, 0, -2.75) facing -0.25; `CAMP.out`: Liu from (60, 0, -3.0) to (60, 0, -1.7), Fan Kuai (60.8, 0, -1.4); `CAMP.wait`: Zhang Liang (60.5, 0, 0.8), tray (60.05, 0, 0.7), to the door (60, 0, -3.6) | `outside`, `tentDoor`, `tentDoorIn`, `tentSky` |
| `gate` | 90 | 8, 9, 18 | Xiang Yu's camp gate by day, seen from inside the camp: a palisade to the LEFT of the gate only, open country to the right. The cart parked end-on, the one horse behind it, 8 red retinue pawns | `GATE`: gate (90, 0, -6), 3.2 wide; Xiang Yu (90, 0, 1.3); Liu from (91.05, 0, -1.05) to (90.8, 0, 1.1); horse (91.2, 0, -4.1); retinue 2 x 4 from (92.2, 0, -3.4). `CART` (91.2, 0, -2.6), 1.0 x 0.7 x 1.8 | `gate`, `gateXY` |
| `path` | 150 | 18 (second beat) | The hill back road, a long-lens far shot: a pale path across a green hill | `HILL.path` (141, 0, -59.4) to (159, 0, -60.6); runners 2.2 m + 1.5 m apart behind the horse | `hill` |

Marks and cameras that `layout.ts` keeps but script v4 does NOT use: `SHIELD.atSeat`, `MARKS.smash / cupsFloor /
giftAside`, `CAMP.aside`, `GATE.army40 / army10 / guards / fanKuaiFrom`, cameras `smash`, `aside`, `gate9`. (`xy` IS
used: shot 11i.)

NEW cameras the storyboard adds (block-outs with the real cast, stills in `/home/user/hm_work/sb/b1/` and `b2/`; the
layout owner adds them to `CAMS` under these names):

| name | pos | look | fov | shot | what it holds (head x % / y % / width %) |
|---|---|---|---|---|---|
| `freezeLiu` | 1.3, 2.6, 5.2 (the master tripod) | 0.1, 0.72, -1.3 | 23 | 2i | Liu Bang 58/46/30, the uncle 21/39/35 with his blade, the door flap behind them |
| `card4XY` | -100.45, 1.45, 3.3 | -100.62, 1.0, 0 | 40 | 4i | Xiang Yu alone 43/40/35 (Liu Bang is out of frame) |
| `caoBust` | -29.35, 1.05, 2.35 | -29.78, 0.74, -0.1 | 36 | 5i, and the picture inside line 9's inset | the informer 55/44/52, cap whole, the roll at his belt at 57-62 % y; a slice of Xiang Yu's head and plume at the left edge (0-14 % x) |
| `uncleIn` | 29.25, 1.3, 2.9 | 29.5, 1.0, -0.45 | 40 | 7i | the uncle 46-50/41/34 at his mark; Liu Bang out of frame right |
| `caoBustDay` | 30.5, 1.3, 2.0 | 30.47, 1.12, -0.7 | 36 | 20i | the informer 54/44/48, a guard's half head at each edge, the red tent's door flap behind him |

### 2.1 Screen sides (never broken inside a place)

- OUTSIDE THE TENT (card, night places, gate): Xiang Yu's camp is screen LEFT, Liu Bang's camp screen RIGHT. Xiang
  Yu stands left, Liu Bang right; the uncle comes left to right; Liu Bang flees to the right and comes home from the
  left. A whip pan between places goes the way of that geography (to Liu's camp: pan right; to Xiang Yu's: pan left).
- INSIDE THE TENT, north cameras (`master`, `two`, `floor`, `dance`, `door`, `freezeLiu`): Xiang Yu is screen RIGHT,
  Liu Bang centre, the door behind Liu Bang. East cameras (`jade`, `jadeIn`, `xy`): the door side is screen left,
  Xiang Yu left of Fan Zeng.
- Xiang Yu therefore changes side twice (gate -> tent at 9 -> 10, and back at 20 -> 21 only as a place change). Both
  happen across a designed transition. This is the one known break of "one side per person".
- THE INFORMER LIVES IN THE RIGHT HALF: silhouette 65 % x (line 2), figure 69 % x (5, 6), inset upper right (9),
  figure 65 % x and exit to the right (20), bubble upper right (21). His tag is always above him, upper right.
- Screen zones (px on 1080 x 1920, `layout.ts` `SCREEN`): nothing that matters above y 210, in the caption band
  y 1190-1498 (62-78 %), below y 1613 (84 %), or right of x 930 below y 900 (the app's button rail). The source tag
  owns the top LEFT corner.

## 3. The tent: the ring, the door, the floor

North = +z, south = -z, east = -x, west = +x. Cameras stand only north and east of the ring. Floor seating: pad top
0.10, table top 0.34, table 0.70 x 0.36 (OPEN underneath: the seated robe goes under it), pad 0.84 x 0.62.

| Seat (`SEATS`) | at (x, z) | faces | Notes |
|---|---|---|---|
| `liu` 刘邦 | 0.2, -1.5 | north | his back to the door; his cup on his right (screen left from the master) |
| `fanzeng` 范增 | -0.3, 1.5 | south | a low back view in the master's bottom left; frontal only from the east cameras |
| `xiangyu` 项羽 | 1.15, 0.5 | east | screen right from the north cameras |
| `uncle` 项伯 | 1.35, -0.6 | east | beside Xiang Yu, 1.1 m south |
| `zhang` 张良 | -1.3, 0.5 | west | OUTSIDE every north framing on purpose; never seen seated |
| `fankuai` 樊哙 | -1.15, -0.5 | west | in script v4 he never sits: an EMPTY pad and table in every master |

SEATS NEVER CHANGE. Door: south wall, centre x -0.15, 1.1 wide, 1.95 high; from the master it is exactly behind Liu
Bang's head. `EXIT` (line 16): cup down, rise over 6 frames, walk 1.0 m to the flap with `turn` ramping to a back
view. `ENTER` (the dancer 12, Fan Kuai 14-15, the servant 15, Zhang Liang 19): through the east half of the door,
along the pocket beside Liu Bang's pad, through the 0.38 m gap at the south-east corner onto the floor;
`ENTER.stand` (-0.48, 0, -2.05) = Fan Kuai in the doorway; `ENTER.guards` / `guardsFlung` / `ramFrom` for line 14.
Free floor `DANCE` 1.06 x 1.76 m. `DANCE_MARKS` (12-13): dancer (-0.42, 0, 0.38), uncle (-0.05, 0, -0.55), the
uncle's way from his pad `unclePath` 2.0 m, wing hands at y 0.92. `FREEZE` (line 2 only): dancer (-0.48, 0, 0.30),
uncle (-0.15, 0, -0.45), blades cross at (-0.34, 1.62, -0.1). `MARKS.eat` (-0.30, 0, -0.12), `MARKS.servant`
(-0.10, 0, 0.50), `MARKS.gift` (0.02, 0, 0.55); `SHIELD.onFloor` (0.17, 0, -0.12), r 0.32; `TRAY` (0.36, 0, 0.58).

## 4. Cast, as built (`people.ts`, `acc/`; line-up `/home/user/hm_work/g3/v4/lineup8.png`)

Two camps by colour: LIU's side carries RED, XIANG's side CHARCOAL + DEEP PURPLE. Every figure is 1.45 m tall. One
unique silhouette feature each; all eight named figures were told apart at 100 px and as black silhouettes.

| Role | Export (`PEOPLE.` key) | Camp | Name tag (`ROLES[].tag`) | Read at a glance | First seen / first tagged |
|---|---|---|---|---|---|
| 刘邦 Liu Bang | `LIU_BANG` (`liuBang`); on the privy `LIU_PRIVY` + `LIU_DAGE` (`acc/liu_dage.ts`) | Liu | 「刘邦」 | the only all-red figure: long Han-red robe, gold sash, small red cap with a long gold pin, chin tuft | 1 / 1 |
| 项羽 Xiang Yu | `XIANG_YU` (`xiangYu`) | Xiang | 「项羽」 | widest after Fan Kuai; charcoal lamellar armour, deep-purple cape, one big purple plume | 2 (untagged, seated) / 4 |
| 曹无伤 the informer | `CAO_WUSHANG` (`caoWushang`) | Liu | before line 9 「刘邦的军官」 (`tagBefore`), from line 9 「曹无伤 · 告密的」 | a low black cap shaped like a little pitched ROOF on a red band (his outline), a thin drooping moustache, dark crimson short armour over a red tunic, a pale roll of bamboo slips at his belt. No sword | 2 (black silhouette) / 5 |
| 项伯 the uncle | `XIANG_BO` (`xiangBo`) | Xiang | 「项伯 · 项羽的叔叔」 | grey hair, grey full beard, flat cap, grey-purple long robe | 2 (untagged) / 7 |
| 范增 Fan Zeng | `FAN_ZENG` (`fanZeng`) | Xiang | 「范增 · 项羽的谋士」 | thin, old, tanned; long WHITE beard, white bun, deep-purple robe, a green jade ring on a red cord at the belt | 2 (back view) / 10 |
| 项庄 the dancer | `XIANG_ZHUANG` (`xiangZhuang`) | Xiang | 「项庄」 | young, no beard, topknot, charcoal knee-length robe with a purple sash, a sword at the belt | 2 (untagged) / 12 |
| 樊哙 Fan Kuai | `FAN_KUAI` (`fanKuai`) | Liu | 「樊哙 · 刘邦的保镖」 (people.ts still says 部下: the cast owner changes it to 保镖, the script's word) | half again as wide as anyone; leather-brown armour, red neck cloth and brow band, bushy black beard, a big round RED shield | 14 / 14 |
| 张良 Zhang Liang | `ZHANG_LIANG` (`zhangLiang`) | Liu | 「张良 · 刘邦的谋士」 | slim, pale, beardless; pale blue-green robe with a red collar band and sash, tall dark scholar's cap | 19 / 19 |
| Xiang's guards | `GUARD`, `GUARD_B` | Xiang | none | charcoal plate armour, grey helmets, halberds (left hand / right hand) | 14 |
| Liu's guards | `LIU_GUARD`, `LIU_GUARD_B` | Liu | none | bright red plate armour, grey helmets, halberds (left / right) | 18 (as runners), 20 |
| servant | `SERVANT` | Xiang | none | small, plain grey, bare head | 15 |
| pawns | set / prop geometry, not rig figures | both | number labels | a cone body and a ball head, 1.15 m; red or charcoal | 4, 8, 18 |

The narration says five names (刘邦、项羽、曹无伤、范增、樊哙); the tags carry the other three (项伯、项庄、张良).

Rules of the rig that drive every staging decision:
- Faces look at the camera, never at each other; "looks at X" is played with `gaze`, a head tilt and the body's
  facing. Bodies turn at most 45 degrees from the camera, faces 12; a facing between 115 and 170 degrees from the
  camera is forbidden: use `turn: 1` for a true back view. A back view has no face, no moustache and no beard.
- Arms are 0.40 m long. A hand goes to the face only through the kit's `shh` pose (`rigJawline`), never through
  `state.hands` (the hand floats on the face).
- Sitting on the floor: `seat: { top, deskEdge, deskTop }` + `pose: { kind: "sit" }`. Rising: raise `seat.top.y` to
  `dim.hipY - 0.028` over 6 frames, drop `deskEdge` on the first frame, then `idle`.
- Kneeling = sinking the figure 0.38 m (the skirt stands lower): used for the informer (5-6) and Fan Kuai (15).
- The bow (拱手): `haul`, phase 0, amount -1, both hands pinned at (+-0.05, 0.80, 0.36) in front of the chest, plus
  `lookDown` 22 and a head drop: about 19 degrees. Used at lines 8, 9, 12, 19. A deeper bow does not exist.
- Guards: idle, walk, wave, point, cheer only (the halberd crosses the face in `hold` and `haul`); never seated.
  `LIU_GUARD` (halberd in his LEFT hand) stands at the prisoner's left = screen right; `LIU_GUARD_B` at screen left.
- 曹无伤's "shifty eyes" are per shot: `gaze: 1` or `-1` with `expr: "smug"` (5, 9) or `"nervous"` (6, 20).
  `hide: ["officerCap"]` when the cap is a prop on the ground (20). The moustache cannot be hidden.
- Mouths move ONLY inside a character's own quote (`speak(quote(who, line), f, id)`): lines 5 (曹无伤), 6 and 9
  (项羽), 8 (刘邦), 17 (樊哙), 19 (张良).
- Scabbards hang on the drawing side; drawn swords are the world props, with the belt `hilt` hidden.

## 5. Running devices

1. THE INFORMER THREAD (the spine of the film; the owner could not follow the old script without it).
   | Line | What the viewer sees | Device |
   |---|---|---|
   | 2 | a BLACK figure with the roof cap beside the tent door, a gold "?" over it | the real 曹无伤 with the figures' light gain 0 on a dimmed plate; `Mark "?"` |
   | 5 | the same cap, now a red officer, scurries in to Xiang Yu's ear; then his face fills the frame while he whispers | tag 「刘邦的军官」; the close shot `caoBust` |
   | 6 | he flinches when the fist comes down | same shot family |
   | 9 | Xiang Yu says the name; the SAME close picture pops up in a window and the name slams onto it | `Inset` + name plate 「曹无伤 · 告密的」 |
   | 20 | he stands between two red guards; the gold "?" of line 2 comes back over his cap; his face fills the frame again and the name plate knocks the "?" away; he is marched out; his roof cap rolls back in alone | `Mark "?"`, close shot `caoBustDay`, name plate, the `cap` prop |
   | 21 | Xiang Yu, happy with his jade; above him a window replays him at the gate with a speech bubble 「曹无伤」 | `Inset` (line 9's frame) + `Bubble` |
   Same plate style (name in gold, role in white under it), same corner (upper right), the same roof cap every time.
2. NAME TAGS: once per named person, at the first appearance, 36 frames (`beats.ts` `TAG`, `TAG_LEN`), near the head,
   never in the caption band, never below 84 %, never across a cut. The informer is the exception: three plates
   (5, 9, 20).
3. STAMPS: the title 「鸿门宴」 (2), 「亲家」 (7), 「生的」 (15), the counts ×1 ×2 ×3 beside the jade (11), the numbers
   「40万」 / 「10万」 (4).
4. IDIOM TAGS for students who favourite the film: 「项庄舞剑，意在沛公」 (12) and 「人为刀俎，我为鱼肉」 (17): small,
   upper third, a little red seal 「成语」 at the left end, at least 36 frames.
5. THE SOURCE TAG 「《史记》」: top left, from the first frame of line 3 to the last frame of line 21
   (`BEAT.source` .. `BEAT.sourceOff`); never over the privy shots (`hud: false`).
6. THE LOOP: the privy shot opens the film (frames 0-77) and closes it (the last 36 frames); the film's last picture
   is its frame 0 (`privyOpening`, `privyClosing` in `sets/privy.ts`).
7. THE EMPTY SEAT: after line 16 Liu Bang's pad, table and cup are in every tent picture (19, 21), and the last cut of
   the film goes from that empty seat to the man on the privy seat.
8. THE "厕" THOUGHT: when he rises at line 16 a small bubble with the privy's own sign 「厕」 pops over his head, so
   the middle of the film points back at its first picture.

## 6. Props (owner: package P unless marked; sizes in metres)

World props are shown per frame with `w.prop(name).put(at, { facing | up, face, scale })`; `beginFrame` hides them all.

| Prop (`PropName`) | Size and look | Where |
|---|---|---|
| cups `cup:liu` .. `cup:fanzeng` | a plain cup: top Ø 0.10, foot Ø 0.07, 0.09 high; Liu Bang's gold `#e2b03a`, the others bronze | on every table at `SEATS[role].cup`; in a hand at lines 7 (Liu's toast), 10, 11, 11i (Xiang Yu drinks), 16 (Liu puts his down: it stays on his table to the end of the film) |
| Fan Zeng's jade `jade` | a GREEN ring `#3fae6e`, outer Ø 0.13, tube 0.04, on a red cord; the belt accessory `pendant` is hidden while the prop is in his hand | lines 10 (at the belt), 11 (raised three times to about (58 %, 42 %) from `jade`) |
| the gift jade (ASK: a second prop `jadeGift`, or a colour option on `jade`) | a PALE disc `#e9f1e4`, outer Ø 0.20, hole Ø 0.06: clearly not Fan Zeng's green ring | on the tray (19); in Xiang Yu's hand at 61 % x / 56 % y from `two` (21) |
| dance swords `sword0` (项庄), `sword1` (项伯) | 0.90 long: blade 0.70 x 0.05, FLAT toward the camera, bright steel `#e6ecf2` with a white edge line; gold guard 0.16 x 0.035; dark grip 0.15. Origin = the grip, +y = the tip. They must read as two bright strokes in the master (about 17 px wide at 1080) | lines 2 (crossed, frozen), 12, 13 |
| Fan Kuai's shield `shield` | round, r 0.32, 0.07 thick; red `#c8322c` face with a bronze boss r 0.10 and a pale rim | 14 (held upright in front of him with two pinned hands), 15 (lying FACE DOWN on the floor at `SHIELD.onFloor`, its flat back up: the chopping board), 16-18 (carried) |
| Fan Kuai's sword | his belt `hilt` accessory; when he cuts the leg (15) it is `sword0` in his hand (the dancer's is sheathed by then) with his own hilt hidden | 15 |
| the raw pork leg `pigLeg` | 0.36 long, Ø 0.14 at the thick end tapering to 0.07, a white bone knob Ø 0.05; RAW: pink `#f0a0a8`, a pale fat rim, a dark red cut face. Never brown | 15 (in the servant's two hands, then on the shield) |
| the message roll `note` | 0.20 x Ø 0.05, `#f0e2b8` tied in red: the same thing as the `scroll` accessory at 曹无伤's belt | NOT used: he whispers, the roll never leaves his belt (it is one of his identifiers) |
| the informer's cap `cap` | `officerCapGeo` at 0.2 m per unit: foot Ø about 0.32, 0.29 high, red band below, black roof above | 20 (rolls in from `NIGHT_L.capFrom` to `cap`, 1.4 m, and rocks to rest) |
| the red flag `flag` | pole 1.15 x Ø 0.044, cloth 0.62 x 0.40, `#c8322c`. Origin = the pole's foot | 3 (carried in, planted in `CARD.city.socket`) |
| the Qin banner (segment A's own mesh, built in `enter`) | pole 0.9 x Ø 0.04, BLACK cloth 0.50 x 0.34 with a white 「秦」 | 3 (stands in the socket, topples at the first caption group) |
| the capital's gate (set `card`) | wall 1.7 x 1.0 x 0.5 `#9a948e`, seven merlons 0.13 x 0.12, arch 0.46 x 0.62, tower 0.9 x 0.5 x 0.56 with a 0.3 roof. The tower is DARK SLATE with ochre trim, NOT red (the block-out's red tower competes with Liu Bang and his flag) | 3 |
| pawn crowds (set `card`, set `gate`) | pawn = cone body r 0.13 -> 0.17, 0.8 high + ball head r 0.17 at y 0.98; charcoal `#4a4f5e` or red `#c8322c`; heads tinted 15 % toward the body colour so that they do not out-shine the leaders. ONE PAWN = 10,000 MEN on the card: 40 charcoal (4 x 10), 10 red (2 x 5). ASK: built one merged mesh PER ROW, with `set.setArmies(rows40, rows10)` showing the first n rows (the newest row drops in from 0.5 m over the fractional part; 0 / 0 after `beginFrame`). Number labels are overlays: 「40万」 130 px at (335, 405), charcoal with a white edge; 「10万」 110 px at (745, 548), red with a white edge | 4; the 8 red retinue pawns at the gate (8, 9, 18) are static |
| the horse `horse` | 1.5 long, back at y 1.0, head top 1.75; dark `#33303a`, a red bridle; a flat-sided simple shape is enough. The rider is the seated `LIU_BANG` (a seat top at y 1.05 on its back) | 8, 9 (its head above the cart), 18 (leaves right; crosses the hill) |
| the cart(s) (set `gate`) | body 1.0 x 0.7 x 1.8 on an axle at 0.45, wheels Ø 0.90, a canopy; a second cart behind it if cheap (the line says 车队). Parked end-on from line 8, never moved | 8, 9, 18 |
| the gift tray `tray` | a small lacquer table 0.28 x 0.44 x 0.20 with the pale jade disc on it | 19 (at Zhang Liang's feet outside, then at `TRAY`), 21 |
| halberds | accessory (`acc/held.ts`) | guards |
| the tent door flap | set, `w.set.setFlap(k)` 0 shut .. 1 open, the same flap inside (`tent`) and outside (`camp`) | 12, 14, 16, 17, 19 |
| the sun disc | set, `w.set.setSun(u)` across the sky of `camp` | 19 (time passes) |

## 7. Overlays (owner: package O; 2D, over the picture, on 1080 x 1920)

| Overlay | Used for | Notes |
|---|---|---|
| captions | every line | drawn by the engine from `captions.ts`; no box behind them; gold words as marked there |
| `NameTag` (name + role under it) | the eight tags and the informer's plates | name 84 px gold with a dark stroke, role 44 px white under it; in by a spring, out by a 3-frame fade |
| `Stamp` | 「鸿门宴」 (150 px, gold, centre (540, 300)), 「亲家」 (130 px, red), 「生的」 (130 px, red) | lands 3 frames after its `at` |
| `IdiomTag` | lines 12, 17 | 72 px, gold with a dark stroke, a 64 px red seal 「成语」 at its left end; centre x 540, y 330 / 380 |
| `Mark` "?" / "!" | the "?" over the silhouette (2) and over the informer (20) | the SAME glyph, gold, 230 px at line 2 |
| `Count` ×1 ×2 ×3 | the jade (11) | 70 px, beside the raised jade, each replaces the last |
| number labels | 「40万」 「10万」 (4) | positions in `CARD_LABELS` |
| `Glint` / `Burst` | blades (2), the jade (11), the flag (3), the slam (6), the ram (14) | short, never in the caption band |
| `Bubble` | the speech bubble 「曹无伤」 (21), the thought bubble 「厕」 (16) | one component, two tails |
| `Inset` | the informer's window (9), the replay window (21) | a rounded window (radius 28, white 8 px edge) showing a pre-rendered still of THIS film (`public/hongmen/inset_*.jpg`), with a flat fallback when the file is missing. Positions: `SCREEN.informerInset`, `INSET21` |
| `Wipe` | the flap wipes, the card wipe | a cloth-coloured (or board-coloured) shape that crosses the frame: 3 frames covering, 2 full, 3 uncovering; the cut sits under the full frames |
| `Streak` | the whip pans | horizontal smears in the plate's colours over a fast eased pan, 6 to 8 frames (there is no motion blur in the post chain) |
| source tag | 「《史记》」 top left | a HUD (`registerHud`), not a shot overlay |

## 8. Files and owners

Exists today (✔) or planned under this name (○). Nobody edits another package's file; ask its owner.

| Package | Files (under `src/videos/hongmen/` unless a path says otherwise) | What |
|---|---|---|
| engine (the director) | ✔ `env.ts`, `story.ts`, `beats.ts`, `world.ts`, `lang.ts`, `captions_en.ts`, `shots/common.ts`; ○ `Film.tsx`, `preview/common.ts`, `film_core.ts`; ✔ `BIBLE.md`, `STORYBOARD.md` | timing, the segment contract, `SHOTS` / `HIT` / `TAG` / `BEAT`, the World, the composition. Read-only for builders |
| T (tools, timing) | ✔ `scripts/hongmen/gen_timing.py`, generated ✔ `voice.ts` + `captions.ts` (never edited by hand); ✔ `/home/user/hm_tools/still.sh`, `remotion_still.sh`; ○ a cuts check (`shotCheck()` in `beats.ts` is its core), a clip tool | the placeholder and the real timing; one-at-a-time renders; the check of shot lengths |
| L (layout, staging, verbs) | ✔ `layout.ts`; ○ `shots/stage.ts`, `shots/verbs.ts`, `preview/act_test.ts` | seats, marks, checked cameras (plus the five NEW ones of section 2); `banquet(w, f, opts)` (who sits where); the verbs: sit, rise, salute (the bow), kneel-sink, draw / aim / sheath, flung, eat, carry |
| S (sets) | ✔ `sets/privy.ts` (done), ✔ `sets/index.ts` (the interface + block-outs); ○ `sets/tent.ts`, `sets/gate.ts` (the gate AND the command tent's facade = places `gate` and `camp`), `sets/nightx.ts`, `sets/nightl.ts`, `sets/path.ts`, `sets/card.ts` | every place builds from `layout.ts`; one figure light per place with the three baked values equal (`BAKED_LIGHT`); `setFlap`, `setSun`, `setView`; ASK `setArmies` |
| C (cast) | ✔ `people.ts`, `acc/garb.ts`, `acc/headwear.ts`, `acc/held.ts`, `acc/liu_dage.ts`, `preview/people_lineup.ts`, `garb_sheet.ts`, `head_sheet.ts`, `sheet_common.ts` | thirteen figures; fix Fan Kuai's tag to 保镖 |
| P (props) | ✔ `props/index.ts` (stand-ins with the final names); ○ `props/sword.ts`, `props/table.ts`, `props/far.ts`, `props/fx.ts` | section 6; ASK the pale gift jade |
| O (overlays) | ○ `overlay.tsx`, `inset.tsx`, `transitions.tsx` | section 7; registers the source tag as a HUD |
| Segment A (lines 1-4) | ✔ `shots/segA.ts` (+ `segA_*.ts`) | the sample for the owner: the privy, the frozen banquet, the silhouette, the sand table |
| Segment B (5-9) | ✔ `shots/segB.ts` | the informer, the uncle, the gate; owns the shot the two insets are rendered from |
| Segment C (10-13) | ✔ `shots/segC.ts` | the banquet, the jade, the dance |
| Segment D (14-17) | ✔ `shots/segD.ts` | Fan Kuai, the leg, the exit, the door |
| Segment E (18-22) | ○ `shots/segE.ts` | the escape, Zhang Liang, the informer's end, the replay, the loop |
| V (voice, sound) | ✔ `scripts/hongmen/voice/hongmen_lines.json`; ○ `scripts/hongmen/sound/cues.json` and the assemble / mix scripts copied from `scripts/arthur/` | the narration (the loop sentence is ONE take cut at the comma), the cue sheet from the storyboard's sound cues |
| READ-ONLY for everyone | `src/videos/group/`, `src/videos/vasa/`, `src/videos/bt/`, `src/videos/arthur/`, `scripts/rig3d/`, `scripts/arthur/`, `render.json`, `blender.json` | import from them; copy a helper into this folder if it must change |

## 9. House rules for the picture

1. Nothing that matters in the caption band (y 62-78 %), below 84 %, above 11 %, or under the app rail (x > 930 for
   y > 900). No box behind captions.
2. No clipping (穿模): nothing passes through anything; read `rig.qa` (`reach`, `clear`) on every pose you build.
3. No flicker: no per-frame noise, no z-fighting, no hairline geometry (thin things hold 2 px at 1080 x 1920 or are
   painted). No black frames, hairlines or colour blocks. A place's first frame must look the same in a fresh page
   as inside a sequence.
4. Figures are never over-exposed under the set light: each place has its own figure light (`PLACE_LOOKS`), the
   three baked values are the same everywhere. The tent is NOT one orange mass: dark walls, red and black furniture,
   gold details, one cool accent from the door.
5. Xiang Yu's charcoal is never pure black (it merges with the ink); the only pure-black figure in the film is the
   silhouette of line 2.
6. Red belongs to Liu Bang's camp. No red set piece next to a red figure except Liu Bang's own tent (lines 7, 20),
   where the informer's DARK crimson and black cap must still separate from the wall (check under the real light).
7. Text in the picture is Chinese in the loaded font (`FONT_STACK`); digits are allowed in 「40万」 / 「10万」 and
   ×1 ×2 ×3.
8. One action per caption group, landing ON the group's first frame (`cap(line, k).from`; 1-2 frames early is fine,
   never late). A word that is a hit has its own group in `captions.ts`.
9. Deterministic: a pose is a pure function of the frame; no `Math.random`, no `Date`, no state between frames; any
   frame can be the first of a render chunk.
10. Take every frame number from `beats.ts` / `cap()` / `capWord()` / `line()` / `quote()`. The frames printed in the
    storyboard are the placeholder timing v0: they are for reading, not for typing.
11. All drawings are our own. General mechanisms over one-off hacks.

## 10. Transition rules (08_arthur_transitions.md with 07's corrections); segment builders must follow them

1. MINIMUM SHOT LENGTH 18 frames. No exception in this film (there is no counted montage). `shotCheck()` fails the
   film on a shorter shot. A "shot" is a run between two cuts; same-tripod moves do not end a shot.
2. FEW CUTS: 31 shots in about 70 s (1.4 per line). Prefer an eased move inside a shot to a cut to a slightly
   different framing.
3. SIZE / ANGLE: between two shots of the same subject, the subject's size changes by at least 1.6x or the angle by
   at least 30 degrees. Otherwise do not cut. `master`, `two` and `floor` share one tripod: between them only moves.
4. CUT ON ACTION: a cut inside a line sits 2-4 frames after a movement starts (a head turn, a hand rising, a blade
   leaving the scabbard) so that the motion carries across; match the screen position of the thing the eye is on.
5. A PLACE OR TIME CHANGE IS DESIGNED, never a bare cut, and uses one of five devices:
   (a) FLAP WIPE: the cloth of the tent door crosses the frame, 8 frames. Going OUT of the tent the cloth sweeps UP,
       going IN it sweeps DOWN.
   (b) CARD WIPE: the sand-table board slides in from the right, 7 frames (only 2b -> 3).
   (c) WHIP PAN: a fast eased pan + `Streak`, 6 to 8 frames, in the direction of the geography (section 2.1).
   (d) MATCH CUT: the same thing at the same screen spot on both sides (Xiang Yu 4 -> 5; the cap and the jade
       20 -> 21; the empty seat and the man on the privy seat 21 -> 22).
   (e) CUT THROUGH THE DOOR or ON CONTINUING MOTION: a figure goes out of one frame and comes into the next the same
       way (16 -> 17 through the flap; 18a -> 18b the horse leaves right and enters from the left).
   The title cut 1 -> 2a is the sixth, used once: a hard cut on the end of the gesture with the stamp 「鸿门宴」 and
   a drum landing 2 frames later.
6. SCREEN DIRECTION as section 2.1. From north-side tent cameras Xiang Yu's side is screen RIGHT and the door and
   Liu Bang's party screen LEFT / centre (07's correction of 08). Seats never change.
7. A CUT BETWEEN LINES lands on the first syllable of the new line or 2 frames before it (a segment starts 2 frames
   before its first word). A cut inside a line is motivated by an action named in that line.
8. CAMERA MOVES ease in and out and are at least 10 frames long. A whip pan is the only move allowed to start or
   stop hard, and only under its `Streak`.
9. EVERY CUT AND TRANSITION HAS A SOUND in the cue sheet (the storyboard names it).
10. The flashback of line 21 and the informer of line 9 are WINDOWS (picture in picture), never full-frame cuts.
11. Overlays never bridge a cut: a tag, stamp or mark is out before the cut (the source tag and the captions are the
    exceptions). An inset may stay while the camera under it moves, never across a cut.
12. A figure that is in two consecutive shots keeps its pose clock across the cut (take time from the film frame),
    so a walk or a gesture does not restart.

## 11. Looking at your work

Stills only through `/home/user/hm_tools/still.sh <entry.ts> <out.png> --size 540x960 [--opts '<json>']` (one render
at a time on this machine; 8-12 s each) and real film frames through
`/home/user/hm_tools/remotion_still.sh HongmenFilm <frame> <out.png>` (about 30 s). Open every still. Judge it as a
phone viewer: is it readable at a glance, who is who, is anything clipping, is anything in the caption band? Check
one still at 1080 x 1920. Scratch files go under `/home/user/hm_work/<task>/`, never into the repo.
