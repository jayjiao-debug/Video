# 《完璧归赵》 storyboard (script v2, 23 lines, 33 shots)

Read `BIBLE.md` first (places, marks, cameras, cast, props, overlays, the twelve transition rules).

HOW TO READ THE FRAMES. Frames are absolute film frames at 30 fps, ranges inclusive, from the REAL voice
(`/home/user/wanbi_work/voice/zh_v1/voice_timing.json`, TOTAL 2107 = frames 0-2106). They are for reading: in code
every frame comes from a lookup (`line(n)`, `cap(line, k)`, `capWord(line, word)`, `quote(who, line)`, `SEGMENTS`,
and the named `SHOTS` / `HIT` / `TAG` / `BEAT` / `HOLDER` of `beats.ts`). A caption group is written
`k from-end 「text」` (the word is HEARD from its first frame: land the action ON that frame, 1-2 frames early is
fine, never late). 【 】 = gold. "≈" = a word inside a group, take it with `capWord`.

Screen positions: head centre x % / y % / head width % of the 1080 x 1920 frame (BIBLE section 4). Expressions are rig
names only; body language uses only rig fields (BIBLE 5: no seated lean, no whole-body squash, hands are pinned points).
Mouths move only inside a quote: the envoy (`lin`) at lines 6, 9, 11, 14, 18, 19; the King of Qin (`qinWang`) at 12,
21. `hud: false` = no source tag, no chip (shots 1 and 11 only).

PLACED = who is on set in the shot; everyone else is not placed (hidden by `beginFrame`). Figures placed but outside
the frame stand on their marks so nobody blinks in and out between shots. Codes: L envoy, Q King of Qin, A/B ladies,
M the three Qin ministers, G guardL + guardR, C guardC, O the official at the map (QIN_MIN_C), U the usher, Z King of
Zhao, E eunuch, N the two Zhao ministers, S servant.

Segments start 2 frames before their first word: **A 0-512** (lines 1-6) · **B 513-924** (7-11) · **C 925-1295**
(12-15) · **D 1296-1685** (16-19) · **E 1686-2106** (20-23).

## The shot list

| id | frames | len | place | camera | placed | what (one line) |
|---|---|---|---|---|---|---|
| 1 | 0-107 | 108 | hall | `hook` (push 28 -> 26) | L Q | THE HOOK: the envoy at the pillar, jade raised; the half-risen king waving |
| 2 | 108-171 | 64 | hall | `kingWave` | L Q | the waving king; tag 秦王; whip RIGHT out |
| 3 | 172-325 | 154 | zhao | `zhaoThrone` -> `zhaoKing` 233-247 | Z | EARLIER; the Zhao king and the jade; 15 cities; the dilemma; the army |
| 5a | 326-406 | 81 | zhao | `zhaoWide` | Z N L E | 派谁去? the ministers turn their backs; the eunuch brings his retainer in |
| 5b | 407-471 | 65 | zhao | `zhaoPush` | Z L E | the eunuch puts him forward; tags; 我去 |
| 6 | 472-512 | 41 | zhao | `zhaoLin` (axial 1.7x) | L | jade at his chest; 完璧归赵 stamp; turns left; whip LEFT out |
| 7a | 513-530 | 18 | hall | `hallWide` | L Q A B M G | he steps up and offers; the lounging king reaches |
| 7b | 531-593 | 63 | hall | `presentTwo` | L Q A B M G | the take; the king laughs; passes it to lady A |
| 8a | 594-628 | 35 | hall | `hallWide` | L Q A B M G | 万岁: lady A holds the jade up; tag 秦国大臣; he backs off |
| 8b | 629-662 | 34 | hall | `linClose` | L Q M G | deadpan; thought bubble: the cities? |
| 9 | 663-751 | 89 | hall | `presentTwo` | L Q A B M G | "there's a flaw"; lady A gives it back; the king hands it to him |
| 10a | 752-802 | 51 | hall | `retreat` | L Q A B M G | jade held high, he scuttles back to the pillar; bump |
| 10b | 803-851 | 49 | hall | `pillarClose` | L | 怒发冲冠: rage swap, stamp; "再逼我" |
| 11 | 852-924 | 73 | hall | `hook` (punch-in 886-896) | L Q | the opening shot returns: the threat; 碎 |
| 12a | 925-962 | 38 | hall | `throne` | L Q | the king apologises; claps for the map |
| 12b | 963-1039 | 77 | hall | `map` | L Q O | the official holds the map; the king unrolls it and points |
| 13 | 1040-1162 | 123 | hall | `stageTwo` | L Q O | he walks in; THE STAGE on the king, then on him; five suns |
| 14 | 1163-1243 | 81 | hall | `linStage` | L Q O | "you fast five days too"; the grand ceremony; "then I hand it over"; the stage lifts |
| 15 | 1244-1295 | 52 | hall | `stageTwo` | L Q O | the king's half-reach stops; rage raise; he agrees; the envoy leaves right |
| 16a | 1296-1380 | 85 | road | `roadGate` | L S | dusk: in from the left edge; the servant; the cloak puff; jade into the coat |
| 16b | 1381-1419 | 39 | road | `roadFar` | S | the servant runs left to right on the ridge; arrow 赵; whip LEFT out |
| 17a | 1420-1460 | 41 | hall (ceremony) | `hallWide` | L Q M C U | five suns tick; drum; the usher leads him in, empty-handed |
| 17b | 1461-1484 | 24 | hall | `throne` | L Q M C U | the king holds out his hand |
| 18a | 1485-1576 | 92 | hall | `linMid` | L Q M C U | twenty-odd rulers; 22 crowns crossed out; empty hands |
| 18b | 1577-1611 | 35 | hall | `throne` | L Q M C | "the jade is in Zhao": shock; chip 赵国 |
| 19 | 1612-1685 | 74 | hall | `hallMid` | L Q M C | "throw me in the pot"; the cauldron drops in |
| 20a | 1686-1736 | 51 | hall | `ministers` | L Q M C | the ministers stare at each other (alarm, never laughing) |
| 20b | 1737-1771 | 35 | hall | `hallMid` | L Q M C | the guard strides in from the right and takes his left arm |
| 21a | 1772-1837 | 66 | hall | `throne` | L Q M C | "stop"; "killing him won't bring it back" (the king slumps) |
| 21b | 1838-1863 | 26 | hall | `hallMid` | L Q M C | "let him go": released, bows exchanged, he turns right |
| 22 | 1864-1938 | 75 | hall | `hallDoor` | L Q M C | he walks to the bright door; THE BILL: 0 and 0; whip RIGHT out |
| 23a | 1939-2014 | 76 | zhao | `zhaoThrone` (rhyme of 3) | Z | 价值连城 stamp; the arch of cities pops away |
| 23b | 2015-2106 | 92 | zhao | `zhaoCrown` | Z L E | kneeling; the official's cap handed over; the tag flips to 上大夫 |

33 shots (A 6, B 8, C 5, D 7, E 7), sums 513 + 412 + 371 + 390 + 421 = 2107. Shortest 18 (7a), mean 64. There is
no shot "4": line 4 lives inside shot 3's move (rule 2). The ceremony dressing is on from 1420 to the end of 22.

---------------------------------------------------------------------------------------------------------------

# Segment A (frames 0-512): lines 1-6, 6 shots. THE OWNER'S SAMPLE: code it from this text.

## Line 1 「宦官的门客蔺相如，举着和氏璧要往柱子上撞。」

| | |
|---|---|
| Speech | 3-107 (`line(1)`). ONE caption group shown in TWO ROWS from frame 0 to 109: row 1 「宦官的门客【蔺相如】，」 row 2 「举着【和氏璧】要往柱子上【撞】。」 (`CAP` override in `gen_timing.py`, forced to start at 0) |
| Words | 和氏璧 ≈ 59 (`HIT.glint1`), 撞 ≈ 100 (`HIT.smash1`) |
| Place | `hall`, no ceremony, no map stand; placed L (`LIN_RAGE`) and Q only |
| Shot | **1**: frames 0-107 (108) |
| Camera | `CAMS.hook`, a slow push: fov 28 -> 26 (eased, 0-107); a 2-frame shake on 100 (6 px, decays over 8) |
| On screen | the envoy at `HALL.pillar` 51/42, 27 %, E1 rising just right of his head (51-75 % x); the jade 71/35 in front of the column; the King of Qin half-risen from the 榻 15/42, 18 %; `hud: false` |

FRAME 0 IS THE THUMBNAIL. It shows, with nothing still animating in: the two-row subtitle; the envoy (`LIN_RAGE`: rage
hair, the wrap lifted 0.13 m and tilted), his back and left shoulder against E1's south-west face, body facing -0.45,
head tilt +8 deg toward the pillar (screen right), `gaze: +1` (eyes on the pillar), face `huff`; his LEFT hand (hand
1, screen right) up beside his head gripping the disc's bottom edge at (1.56, 1.32, -0.69), the disc's top above his
head line and its edge 0.09 m from the lacquer; the right hand hangs; the King of Qin half-risen (`seated(…, {rise:
0.45})`, head about (0, 1.42, -4.62)), both hands up and out (pinned at (±0.22, 1.50, +0.25): x, z in his body frame,
y world height), face `shock`, `gaze: +1`; 2D `panic` strokes at his hands; the tag (below). No glint, no chip, no
source tag. All of it comes from `hookPose(w, f, f0)` (`shots/hook.ts`), which shot 11 calls again.

| Frames | Words | Picture |
|---|---|---|
| 0 | (silence until 3) | the thumbnail (above). The tag is already settled (its pop is computed from frame -12) |
| 0-58 | 宦官的门客【蔺相如】 | the king's frantic wave: both hands swing ±0.15 m sideways in counter-phase at 4 Hz (sin of the frame, pure), head shake ±4 deg; the `panic` strokes re-drawn every 4 frames (from `hash`, pure); the envoy breathes (chest 1 %, 1 Hz), the jade trembles ±0.01 m at 2 Hz |
| 44 | | the tag is gone (out 36-44) |
| 59 | 举着【和氏璧】 | `glint` on the jade (4-point star, 90 px, 6 frames); the king's face -> `nervous` on 60 |
| 75-92 | 要往柱子上 | THE WIND-UP: the jade draws back to `HALL.jadeWind` (65/33: up and toward screen LEFT, away from the column); head tilt +8 -> +14 and `head.dy` -0.02 (he coils); the king's hands freeze high (amplitude -> 0 by 88) |
| 98-100 | 【撞】 | THE FEINT: the jade swings across to `HALL.jadeHit` in 3 frames and STOPS on 100 at 78/37, 0.06 m from the lacquer: 141 px to the right, toward the column's edge, never touching; a gold `smear` arc from 65/33 to 78/37 (98-104); hit-stop 2 frames; shake; the king winces (`blink` + `head.dy` -0.03) |
| 100-107 | | held; the king's hands start to wave again on 104 (the cut comes on it) |

- Tag (`TAG.lin0` = -12, out 44): 「蔺相如 · 宦官的门客」 (name row + role row, zhao plate) / EN "the envoy" (one row).
  Centre about (520, 440): above his lifted wrap (its top about y 560), right of the king's hands, clear of the jade.
- Sound: 0 low drone (on from frame 0; this film does not loop). 59 `ting`. 75-98 riser. 98 a short cloth whip, 100
  `hit_low` + a stone `knock` (the stop). 104 cloth swish (the wave restarts).
- English: the subtitle is the time-fitted English line in two rows (open question); the picture is the same.

**Into line 2**: hard cut on 108, on the king's wave (rule 4: 4 frames after it restarts), size 18 % -> 39 % (2.2x).

## Line 2 「对面急得直摆手的，是秦王。」

| | |
|---|---|
| Speech | 110-170. Groups: `0 110-148` 对面急得【直摆手】的， · `1 150-170` 是【秦王】。 |
| Place | `hall` (the same moment as shot 1); placed L (at `pillar`, outside) and Q |
| Shot | **2**: 108-171 (64) |
| Camera | `CAMS.kingWave` (static); the whip pan RIGHT on 168-171 |
| On screen | the half-risen King of Qin 38/44, 39 %, the gold screen behind; nobody else |

| Frames | Words | Picture |
|---|---|---|
| 108-148 | 对面急得【直摆手】的 | the same wave as shot 1 on the same clock (rule 12) and the same `panic` strokes; face `nervous` (on 127 it tightens: a `sweat` drop at the temple 127-147); head shake accent on 132 (±6 deg, 3 swings) |
| 150 | 是【秦王】 | the hands stop mid-air (pinned out); the tag pops (`TAG.qinWang`); face holds `nervous` |
| 160 | | `gaze: +1` (to the envoy, off-frame right), a tiny swallow (`head.dy` -0.01) |
| 168-171 | | WHIP PAN RIGHT: the camera yaws right 25 deg in 4 frames (ease-in, hard stop under the streak), `streak` overlay |

- Tag `TAG.qinWang` = 148, out 167 (20 frames: the one short tag, declared; the whip may not carry it). 「秦王」 /
  "King of Qin", qin plate, centre about (410, 330): above the crown board (its top about y 560), never on the face.
- Sound: 108 cloth swish, 132 small head-shake swish, 150 a soft `sting_low`, 168-172 `whoosh_rewind` (a reversed
  whoosh peaking on 172: the story goes back).

**Into line 3: WHIP PAN RIGHT** (rule 5a, toward Zhao). Shot 3's camera arrives yawing in from the left for 4 frames
(172-175, ease-out) under the streak, tinted sepia (`tint`, fading out by 180), and settles on the jade in the King of
Zhao's hands. The label 「此前」 / "EARLIER" (cream, 56 px, centre (540, 300)) is up 172-199.

## Lines 3 and 4: one shot with a move

Line 3 「这块玉，秦王开价十五座城。」 174-235. Groups: `0 174-188` 这块玉， · `1 190-235` 秦王开价【十五座城】。
Line 4 「赵国给了，城可能不来；不给，秦兵一定来。」 237-325. Groups: `0 237-255` 赵国给了， · `1 257-281`
城可能不来； · `2 283-294` 不给， · `3 296-325` 秦兵【一定来】。

| | |
|---|---|
| Place | `zhao` (day); placed Z only (the Zhao ministers stand outside these frames) |
| Shot | **3**: 172-325 (154) |
| Camera | `CAMS.zhaoThrone` 172-232; an eased move (smoothstep, 15 frames) to `CAMS.zhaoKing` on 233-247 (the king slides to 62/31 and the left 45 % opens for the graphic layer); held to 325 |
| On screen | `ZHAO_WANG` on his 榻, the jade in both hands at `ZHAO.jade` (pair grip), 50/37, 34 % -> 62/31, 33 % |

The arrivals are staggered: label 172, source tag 174, glint 182, chip 190, tag 196, cities 211.

| Frames | Words | Picture |
|---|---|---|
| 172-199 | | the whip lands (above); the EARLIER label; the king `smile`, looking down at the jade |
| 174 | 这块玉 | the source tag fades in (174-181); the jade lifts 0.04 m (proud); `glint` ≈ 182 on 玉 |
| 190 | 秦王开价【十五座城】 | the chip appears (「赵王」 / "Zhao king", pop); the king looks up and to the left (`gaze: -1`, head turn -8 deg: toward Qin, the west); face `relief_open` (wow) |
| 196-228 | | tag `TAG.zhaoWang`: 「赵王」 / "King of Zhao", zhao plate, centre about (300, 450) |
| 211-225 | ≈ 十五座城 | THE CITIES: 15 icons pop onto the arch (`cities` `arch`, x 110-740, y 240-310), one per frame from the left, each scale 0 -> 1.15 -> 1 in 5 frames |
| 233-247 | | the camera move (above); the cities stay put on the screen (HUD) |
| 237 | 赵国给了 | he holds the jade out toward the left (pair grip, 0.18 m forward-left), face `smile`; a dotted gold `arrow` grows from the jade to the left edge 239-252, seal 「秦」 / "QIN" at its head |
| 257 | 城可能不来 | the cities go `ghost` (6 frames); the arrow fades; face `nervous`, the jade comes back halfway |
| 283 | 不给 | he hugs the jade to his chest (pair grip at the chest), turns his head away right (+6 deg), face `huff` |
| 296 | 秦兵【一定来】 | THE ARMY: three rows of eight black pawns slide in from the left edge (each row 6 frames, thumps on 296, 302, 308), rows at y 660, 780, 900, x 40-480; face `shock`, he shrinks (`head.dy` -0.03) |
| 320-325 | | the pawns, the ghost cities and any arrow fade out (overlays never cross the cut) |

- Sound: 172 `whoosh_rewind` tail + a short tape-rewind chirp under the tint, 182 `ting` (glint), 190 `ting` (chip),
  211-225 15 `tick`s (pitched up one step each: they return in line 12), 239 dotted `swish`, 257 `deflate`, 283 cloth,
  296 / 302 / 308 `drum_low`.
- English: the seal on the arrow reads "QIN"; the cities are icons (no text).

**Into line 5**: cut on 326 (2 frames before 派谁去), 33 % -> 13 % (2.5x), the king keeps his left-of-centre side.

## Line 5 「派谁去？没人。最后，宦官把自家门客推了出来。」

| | |
|---|---|
| Speech | 328-426. Groups: `0 328-345` 派谁去？ · `1 347-358` 【没人】。 · `2 361-406` 最后，宦官把自家门客 · `3 407-426` 【推了出来】。 |
| Place | `zhao` |
| Shots | **5a** 326-406 (81) `zhaoWide`, placed Z N L E · **5b** 407-471 (65) `zhaoPush`, placed Z L E (it carries the start of line 6) |
| On screen | 5a: the king 22/37, 13 %; minA 68/36, minB 85/36; the envoy and the eunuch walk in from the right edge. 5b: the envoy at `ZHAO.lin` 42/34, 28 %; the eunuch at `ZHAO.miao` 76/33, 25 %; the king 12/35, 18 % |

### Shot 5a, frames 326-406 (`CAMS.zhaoWide`, static)

| Frames | Words | Picture |
|---|---|---|
| 326-345 | 派谁去？ | the king turns to the ministers (`gaze: +1`, body facing +0.3), one hand out toward them (pinned at (0.30, 0.85, 0.30) of his body); a gold 「?」 `mark` over his head 328-345 |
| 330-360 | | tag `TAG.zhaoMin`: 「赵国大臣」 / "Zhao's ministers" (zhao plate) above them, about (760, 560) |
| 347-350 | 【没人】 | V1: BOTH ministers turn their backs at once (`turn: 1`, a 3-frame snap on 347); the king's hand drops, face `deadpan` |
| 361-404 | 最后，宦官把自家门客 | from the right edge the envoy (`LIN`, no jade) walks in at a normal, composed pace (`linFrom` -> `linStop`, 363-404, 1.24 m/s), face `cool`; the eunuch beside and a little behind him (`miaoFrom` -> `miao`) |
| 395 | | the ministers turn round to look (`turn: 0`, `gaze: -1`), face `nervous` |
| 404 | | the eunuch lifts an open hand toward him (the cut comes 3 frames into it) |

### Shot 5b, frames 407-471 (`CAMS.zhaoPush`, static)

| Frames | Words | Picture |
|---|---|---|
| 407 | 【推了出来】 | V7: the eunuch PRESENTS him: an open hand toward the king (`point`) and a light pat on his back (hand pinned to his shoulder blade 407-411); the envoy takes one step forward to `ZHAO.lin` (407-415), composed, face `stern` |
| 409-441 | | TWO TAGS together (`tags`, which lays them out without overlap): the eunuch 「赵国宦官」 / "the palace eunuch" above his head (about x 790); the envoy 「蔺相如 · 宦官的门客」 / "the envoy" + role row "the eunuch's retainer" above his wrap (about x 430) |
| 429 | (line 6) 他说： | the envoy turns to the king (`gaze: -1`), face `stern` |
| 443 | “【我去】。 | HEAD POP (1.12 / 1.06 / 1.02 on 443-445), a half step forward (0.12 m), chin up; lip-sync from 443 (`speak(quote("lin", 6), f)`); the eunuch `smile` -> `happy` 446; the king `relief` 446 |
| 457 | 城不来， | a stern head shake (±6 deg, 2 swings 457-470) |
| 466 | | the king starts to lift the jade toward him: the cut hides the hand-over (V2) |

- Sound: 328 a soft `boing` with the 「?」, 347 two cloth swishes, 363-404 steady footsteps, 407 a soft pat, 443 `pop`.

**Into line 6, inside it**: AXIAL CUT on 472 (1.7x, rule 3), on the word 我把玉: the envoy's head stays at 42 % x.

## Line 6 「他说：“我去。城不来，我把玉完整带回来。”」 (from 472)

| | |
|---|---|
| Speech | 429-510. Groups: `0 429-455` 他说：“【我去】。 · `1 457-470` 城不来， · `2 472-510` 我把玉【完整带回来】。” |
| Place | `zhao`; placed L only (the king and the eunuch would be half-cut at the edges) |
| Shot | **6**: 472-512 (41) |
| Camera | `CAMS.zhaoLin` (on 5b's axis); whip pan LEFT 509-512 |
| On screen | the envoy 42/34, 47 %; the jade at his chest 44/49 |

| Frames | Words | Picture |
|---|---|---|
| 472 | 我把玉 | he already holds the jade at his chest, pair grip (V2); the chip flips to 「门客」 / "envoy" (pop); `glint`; lip-sync continues; face `stern` |
| 472-484 | | he lifts it to his chin (44/43), looking straight into the lens |
| 476 | ≈ 把玉 | THE STAMP 「完璧归赵」 lands 476 (`HIT.wanbi` = capWord(6, "把") + 1): a 2 x 2 seal, 220 x 220 px, rotated -5 deg, centre (860, 470): right of his head (which spans x 200-708), under the chip. EN gloss "return the jade intact" (44 px white, 2 rows) under it to y 700. Out 508 (33 frames, declared: the whip follows) |
| 500-508 | | he turns to his left (body facing -0.6, toward Qin) with one step |
| 509-512 | | WHIP PAN LEFT (yaw -25 deg in 4 frames + `streak`) |

- Sound: 472 `ting`, 476 `seal_thump` (low wooden), 500 cloth, 509-512 `whoosh` (left).

**Into line 7: WHIP PAN LEFT** (toward Qin): the hall arrives yawing in from the right for 4 frames (513-516).

---------------------------------------------------------------------------------------------------------------

# Segment B (frames 513-924): lines 7-11, 8 shots

The hall without the ceremony: the king on his 榻, the ladies at their marks, the three ministers down the west side,
guardL / guardR (B only). The ladies are hidden from 803 on (V9).

## Line 7 「秦王接过玉，乐坏了，传给美人们看。」

Speech 515-592. Groups: `0 515-540` 秦王接过玉， · `1 543-563` 【乐坏了】， · `2 565-592` 传给【美人们】看。

**7a 513-530 (18) `hallWide`.** The whip lands on the envoy stepping up from the step onto the dais to `HALL.give`
(91/24) on 513-520; 520-526 he bows with the jade forward in both hands (pair grip at (±0.12, 1.05, 0.30) of his body),
facing -1.06 (toward the king). The king LOUNGES on the 榻 (礼节甚倨): body facing +0.35 (turned half away), `seat.back`
+0.06, his right hand pinned on the 凭几, head tilt 6 deg, face `smug`. Ladies, ministers and guardL at their marks.
- 515 秦王接过玉: on 527 the king reaches lazily with his left hand, sitting forward (`seat.back` -> -0.10); the cut
  comes on the reach.

**7b 531-593 (63) `presentTwo`.** King 50/44, 22 %; lady A 15/36; lady B 32/37; the envoy at `give` 86/37.
- 531-533: the hands meet at `HALL.meet` (68/47); 533 (≈ 玉) `glint` + `ting`, chip 「秦王」 / "Qin king".
- 536-550: the envoy steps back down to `present` (88/45), facing within 45 deg of the lens, `gaze: -1`, `deadpan`.
- 543 【乐坏了】: the king `laugh`, head back (tilt), three bounces (`head.dy`, 543-560), the jade held up beside his
  head (rim grip, hand at about (0.25, 1.30, -4.55)).
- 565 传给【美人们】看: he passes it to lady A at `HALL.pass` (31/47) 565-572; she receives it with a small bow
  (salute-form hands) and holds it at her chest (21/49), `smile_closed` -> `happy`; lady B tilts her head toward it;
  chip 「美人」 / "ladies" on 570 with `ting`. Tag `TAG.ladies` 565-593: 「美人」 / "the king's ladies" over lady A,
  about (300, 470).
- The envoy's eyes follow the jade (head turn -6 deg on 568).
- Sound: 513 `whoosh` tail, 520 cloth, 533 `ting`, 543 nothing (no laugh voice), 570 `ting`.
- Cut 7a -> 7b on 531, 4 frames into the reach (rule 4); king 12 % -> 22 % (1.8x).

## Line 8 「满屋子喊万岁，没人提城的事。」

Speech 594-660. Groups: `0 594-626` 满屋子喊【万岁】， · `1 629-660` 没人提【城】的事。

**8a 594-628 (35) `hallWide`.** 594 万岁: LADY A raises the jade one-handed (the frame-0 grip, jade about 52/19:
the motif stays with her); lady B `happy`; the king cheers EMPTY-HANDED (`laugh`, both hands up and out, the hook pose
in joy); the ministers and guardL `cheer` (arms up) with `laugh` faces (a shout, not lip-sync). zh: two `shout`
bursts 「万岁！」 on 596 and 604 (14 frames each, right of the ministers, x 280-560, y 560-700); en: ONE two-row burst
"LONG LIVE / THE KING!" 600-614. Tag `TAG.qinMin` 600-626: 「秦国大臣」 / "Qin's ministers" (qin plate) above the
ministers, about (270, 470). 598-626: the envoy, ignored, backs off from `present` to `mid` (1.15 m, walk reversed at
0.6, a back view `turn: 1`), `deadpan`.

**8b 629-662 (34) `linClose`.** The envoy alone, 50/38, 47 % (the ladies are not placed: lady A would peek out under
the bubble; the chip still says 美人). 629 没人提【城】的事: `deadpan`, `gaze: -1`; 640 face `cool`; a thought `bubble`
from his head to the upper left (centre (330, 330), r 190) with five city icons (`cities` `bubble`) and a 「?」
640-660; out 658-661.
- Sound: 594 `crowd_cheer` bed (low, under the narration) to 628, cut dead on 629 (the silence IS the joke); 640 `pop`.
- Cut 8a -> 8b on 629 (group 1, rule 7), envoy 14 % -> 47 % (3.4x).

## Line 9 「他走上前：“这玉有个瑕疵，我指给大王看。”」

Speech 663-750. Groups: `0 663-684` 他走上前： · `1 686-721` “这玉有个【瑕疵】， · `2 724-750` 我指给大王看。”

**9 663-751 (89) `presentTwo`.** The king 50/44, empty-handed; lady A holds the jade at her chest (21/49).
- 663 他走上前: he walks in from the right edge (`mid` is outside, 105 %) to `present` (663-684) and bows (`salute`)
  684-690 at facing -2.25 (112 deg off the lens: clear of the forbidden band), face `smile_closed` (polite, scheming).
- 686 lip-sync (`quote("lin", 9)`). 707 (≈ 瑕): he points (`point`, screen left) at the jade in lady A's hands; a gold
  `ring` circles a spot on it 707-720 (on `w.project` of the jade); the king turns to look (`gaze: -1`), face `focus`.
- 724 我指给大王看: lady A hands the jade back to the king at `HALL.pass` 724-730 with a small bow (`ting`, chip
  「秦王」 on 730: 王授璧); the envoy steps up onto `give` (724-742).
- 736-747: the king, sitting forward (`seat.back` -0.10), holds it out to him; 748-751 THE HAND-OVER at `HALL.meet`
  (68/47): the jade into the envoy's two hands, `glint` 750 + `ting`. The hands are in full view.
- Sound: 663-684 footsteps, 707 a tiny `tink`, 730 `ting`, 750 `ting`.
- Cut 8b -> 9 on 663 (line start): he walks in from the right.

## Line 10 「玉一到手，他退到柱子边，怒发冲冠。」

Speech 752-829. Groups: `0 752-772` 玉一到手， · `1 774-800` 他退到柱子边， · `2 803-829` 【怒发冲冠】。

**10a 752-802 (51) `retreat`** (a high wide from the south-west: E1 at 72-85 % x, clear of the rail).
- 752 玉一到手: the cut comes 2 frames into his first backward step (he started on 750); chip 「门客」 / "envoy" (pop).
- 752-794 他退到柱子边: he scuttles BACKWARD from `give` down the step to `retreatTurn` (about 2.7 m/s), a back view
  (`turn: 1`, facing the king), the jade held HIGH in his left hand (the frame-0 grip: it shows above his head all the
  way), the right hand out for balance; the king half-rises (`rise` 0 -> 0.45, 776-786), one hand out, `shock`; the
  ladies `shock`.
- 794-797 he spins to face front (facing -0.45); 797-800 he steps back onto `pillar` and his back meets E1: 800 a 3 px
  shake, `thock`.

**10b 803-851 (49) `pillarClose`** (the hook's axis, 1.7x closer: his head at 51 % x as in `hook`). Placed: L only.
- 803 【怒发冲冠】: SWAP `LIN` -> `LIN_RAGE` with the head pop; `rage` lines (short strokes radiating from the head,
  803-830); the jade stays high in the frame-0 grip (85/29, in front of E1); face `huff`. The ladies have ducked behind
  the screen (hidden from 803 to the end, V9).
- STAMP 「怒发冲冠」 lands 806 as a 2 x 2 seal (220 x 220 px, centre (190, 420), upper left beside the lifted wrap), out
  842 (37 frames); EN gloss "hair lifting his hat" in 2 rows under it to y 650 (his head spans x 302-799: check).
- 831 “再逼我， (line 11, group 0): lip-sync from 831 (`quote("lin", 11)`), he glares off-screen left (`gaze: -1`),
  the jade shakes once (0.03 m).
- 846-851: the source tag and the chip fade out (shot 11 is `hud: false`).
- Sound: 750 `ting`, 752-794 quick backward steps, 797 a turn swish, 800 `thock`, 803 `sting_low` + a hair `whoosh`,
  806 `seal_thump`, 831 the frame-0 drone fades in.
- Cuts: 9 -> 10a on 752 (line start), king 22 % -> 10.5 % (2.1x); 10a -> 10b on 803 (envoy 14.5 % -> 46 %, 3.2x).

## Line 11 「“再逼我，我的头和这块玉，一起碎在柱子上！”」

Speech 831-925. Groups: `0 831-849` “再逼我， · `1 852-884` 我的头和这块玉， · `2 886-925` 一起【碎】在柱子上！”

**11 852-924 (73) `hook`, `hud: false`.** AXIAL PULL-BACK of 1.7x from 10b onto THE OPENING SHOT, cut inside the line
on 我的头和这块玉 (a motivated cut). `hookPose(w, f, 852)` poses both figures and the camera (fov 28) exactly as at
frame 0, so 852 = frame 0 minus the subtitle and the tag (placed: L, Q only, as in shot 1). Lip-sync continues.
- 853 on: `gaze: -1` (he glares at the king), face `huff`; the king waves (the shot-1 wave and `panic`, own clock);
  the envoy taps the air twice with the jade toward his head (856, 866); head tilt +14; the slow push resumes (28 -> 27).
- 886 一起【碎】在柱子上: the wind-up of shot 1 (886-893) and a lens punch-in to fov 25 (eased, 886-896); 894-896
  (≈ 碎) THE FEINT again: the swing across to `jadeHit`, the stop on 896, `smear`, hit-stop, shake; the king FREEZES,
  hands high, face `shock` -> `dazed` 900. Held to 924.
- Sound: 852 the frame-0 drone, 870-894 riser, 896 `hit_low` + `knock`, then nothing but the narration.

---------------------------------------------------------------------------------------------------------------

# Segment C (frames 925-1295): lines 12-15, 5 shots

No ladies (V9), no guards (guardL would stand behind the king in `map`), the ministers outside every C frame (not
placed). The map stand and the official appear on the cut to 12b.

## Line 12 「秦王赶紧道歉，摊开地图一指：“这十五座城，给赵国。”」

Speech 927-1036. Groups: `0 927-961` 秦王赶紧道歉， · `1 963-988` 摊开地图【一指】： · `2 992-1017` “这【十五座城】，
· `3 1018-1036` 给赵国。”

**12a 925-962 (38) `throne`.** The king (63/34). 925-931 he sinks back from his half-rise onto the 榻 (`rise` 0.45 ->
0) and the HUD fades back in (925-931, no chip pop). 927 秦王赶紧道歉: a seated bow (hands pinned together at the
chest, `lookDown` 18), face `nervous`, a `sweat` drop. 955 and 959: two claps (召: he summons the official), then he
starts to rise (959-962): the cut comes on the rise. The envoy is at `pillar` (outside; `LIN_RAGE` until 924, `LIN`
from 925).

**12b 963-1039 (77) `map`.** `setMapStand(true)` from 963 (never in the throne shot). The official (QIN_MIN_C as 有司)
kneels at the stand in a back view, the rolled map hanging from the bar: he has brought it in the cut. The king at
`HALL.kingMap` 28/33.
- 963 摊开地图: the king pulls the bottom roller down (`mapScroll` `open` 0 -> 1 on 963-975, the silk drops); on 976
  the official takes the bottom roller and holds it (pinned at (±0.25, 1.00), `rig.qa reach`); 980-983 (≈ 一指) the
  king jabs a finger at the map (`point`), face `grin`.
- 992 qinWang lip-sync (`quote("qinWang", 12)`) to 1036. 996-1012 (≈ 十五): the 15 dots on the map light gold one per
  frame (`cities` `map`, screen points = `w.project` of the prop's `MAP_CITIES`).
- 1011: the envoy (`LIN`, jade at the chest) starts walking from `pillar` toward `mid` (outside this frame, > 130 %).
- 1018 给赵国: a broad sweep of the arm to the right (toward Zhao); the dots pulse once.
- Sound: 925 a small `gulp`, 955 + 959 claps, 963 a silk swish, 981 `tap`, 996-1012 the 15 ticks of line 3 (the
  rhyme), 1018 swish.
- Cuts: 11 -> 12a on 925 (king 18 % -> 34 %, 1.9x), 12a -> 12b on 963 (33 deg; the rise -> the map).

## Line 13 「他看得出来，秦王在演。」 and line 14 「他也演：“赵王斋戒五天才送玉，大王也得斋戒五天，摆上大礼，我才交。”」

Line 13 speech 1040-1090. Groups: `0 1040-1067` 他看得出来， · `1 1068-1090` 秦王【在演】。
Line 14 speech 1094-1241. Groups: `0 1094-1110` 他【也演】： · `1 1112-1160` “赵王斋戒五天才送玉，
· `2 1163-1202` 大王也得斋戒五天， · `3 1205-1224` 摆上【大礼】， · `4 1225-1241` 我才交。”

**13 1040-1162 (123) `stageTwo`.** The king at the map 22/37, the map 28-57 % x, the official 43/46, the empty 榻
53/38.
- 1040 他看得出来: the envoy walks in from the right edge (96 % on 1040) to `mid` (arrives 1058, about 1.1 m/s), stops,
  face `cool`, `gaze: -1`. The king holds a big fake `grin`, still pointing at the map.
- 1077 (≈ 在) 秦王【在演】: THE STAGE (V3, `stage` HUD): outside a soft circle on the king the picture darkens 45 % over
  6 frames, a pale light cone from the top edge, red-and-gold curtain swags drop into the top corners (1077-1083); a
  京剧 cymbal 锵; the king freezes in his theatrical point and holds in the light to 1093.
- 1094 他【也演】: the light circle slides to the envoy (1094-1102); he answers with a solemn bow (`salute`, `lookDown`
  22), face `focus`.
- 1112 lip-sync (`quote("lin", 14)`). 1133 (≈ 五天): five `suns` pop in a row over his head (1133-1149, one per 4
  frames, grey -> gold), y about 420.

**14 1163-1243 (81) `linStage`.** The envoy 56/36, 53 % (the official and the map stay outside this frame); the stage
HUD continues across the cut (declared, rule 11) with the circle on him.
- 1163 大王也得斋戒五天: he opens a hand toward the king off-screen left (pinned at (-0.30, 1.00, 0.30) of his body);
  the five suns slide to the left edge (1180-1195) and flash on 1190 (≈ 五天).
- 1205 摆上【大礼】: both arms open wide and low (hands pinned at (±0.40, 0.90, 0.20)), face `smile`; a bronze bell (钟).
- 1225 我才交: the jade back to his chest, face `smug`; THE STAGE LIFTS: the curtains fly up and the dark clears
  (1225-1235); a slow blink 1236. Nothing of the stage is left at the cut.
- Sound: 1040 footsteps, 1077 锵, 1094 a spotlight `whum`, 1133-1149 five soft `ding`s, 1190 shimmer, 1205 bell, 1225
  curtain `whoosh`.
- Cuts: 12b -> 13 on 1040 (line start; king 33 % -> 18 %, 1.8x, 30 deg); 13 -> 14 on 1163 (envoy 18 % -> 53 %, 2.9x,
  motivated by 大王: he turns to address him).

## Line 15 「秦王抢不到，只好答应。」

Speech 1244-1293. Groups: `0 1244-1270` 秦王【抢不到】， · `1 1272-1293` 只好答应。

**15 1244-1295 (52) `stageTwo`** (back to the stage two-shot, not adjacent to 13; no stage HUD any more).
- 1244 秦王【抢不到】: V11: the king takes a half step toward the envoy and his hand starts out for the jade
  (1244-1252); on 1250 he glances to screen left (`gaze: -1`, head turn -10 deg: his guards, off-screen) and the hand
  stops short.
- 1253 (≈ 抢): the envoy SWAPS to `LIN_RAGE` (head pop) and whips the jade up into the frame-0 grip; 1256-1264 the
  king's hand withdraws and he takes a half step back, face `shock`.
- 1272 只好答应: the envoy swaps back to `LIN`; the king nods once (1280), face `sigh`.
- 1286-1291 the envoy turns right; from 1292 he walks out toward the right edge (the cut comes 4 frames into the
  walk). No bow.
- Sound: 1244 a shuffle step, 1253 `sting_low`, 1272 `deflate`, 1292 footsteps.
- Cut 14 -> 15 on 1244 (line start, envoy 53 % -> 18 %, 2.9x).

**Into line 16: CUT ON CONTINUING MOTION** (rule 5b): out walking right in the hall, in from the left frame edge on
the road, at dusk.

---------------------------------------------------------------------------------------------------------------

# Segment D (frames 1296-1685): lines 16-19, 7 shots

## Line 16 「转头，他让随从穿上粗布衣服，揣着玉，抄小路溜回赵国。」

Speech 1298-1418. Groups: `0 1298-1329` 转头，他让随从 · `1 1330-1361` 穿上【粗布衣服】， · `2 1362-1378` 【揣着玉】，
· `3 1381-1418` 抄小路溜回【赵国】。

**16a 1296-1380 (85) `roadGate`** (dusk; the wall and the gate at the left, orange sky low left, violet top right).
The servant (`SERVANT`, pale teal-grey) waits at `ROAD.servant` 70/40.
- 1296-1319: the envoy walks in from the LEFT FRAME EDGE (from `ROAD.envoyFrom`, -27 %) past the gate to `ROAD.envoy`
  (32/40, about 1.1 m/s), the jade at his chest.
- 1298 转头，他让随从: on arrival he turns his head right to the servant and beckons (`wave`, small, 1316); tag
  `TAG.servant` 1320-1352: 「随从」 / "his servant" (zhao plate) above the servant, about (760, 450).
- 1330 穿上【粗布衣服】: V4: he flings a brown cloth over the servant: a `puff` (2D dust-and-cloth, 1337-1345) covers
  him and he comes out as `SERVANT_ROUGH` (brown hemp, head cloth, bundle) on 1339 (≈ 粗).
- 1362 【揣着玉】: hand-over 1362-1368 (the envoy's pair grip -> the servant's two hands), `glint` + `ting` + chip
  「随从怀里」 / "servant" on 1367; the servant tucks it inside his coat (1368-1372: the jade hides) and a soft warm
  `glow` (2D, 60 px) stays at his chest (to 1419).
- 1374-1380: the servant turns right and breaks into a run (the cut comes 4 frames into it).

**16b 1381-1419 (39) `roadFar`.** The ridge path across the frame at 46 % y, the low sun at the left, the moon 80/18.
1381 抄小路溜回【赵国】: the servant (10 %) runs left to right (x 20 % -> 85 %, 1381-1416), his chest glow a bright dot;
a dotted gold `arrow` from him to the right edge with the seal 「赵」 / "ZHAO" 1395-1412. 1414-1419: WHIP PAN LEFT +
`streak` (toward Qin).
- Sound: 1296 footsteps on earth, 1316 cloth, 1339 `fwump`, 1367 `ting`, 1374 quick steps, 1381-1416 running patter
  (far, quieter), 1414 `whoosh`.
- Cut 16a -> 16b on 1381 (group 3; continuing motion, servant 31 % -> 10 %).

**Into line 17: WHIP PAN LEFT** + the day-tick (rule 5a: a place AND time change).

## Line 17 「五天后，大礼摆好，秦王要玉。」

Speech 1422-1482. Groups: `0 1422-1438` 【五天后】， · `1 1441-1459` 大礼摆好， · `2 1461-1482` 秦王【要玉】。

**17a 1420-1460 (41) `hallWide`, `setCeremony(1)`** (banners, the mat runner, the drum; guardC at his mark outside the
frame; no ladies, no guardL / guardR). Static.
- 1422 【五天后】: five `suns` (the ones of line 14) pop one by one at the top centre, y 270, on 1422, 1425, 1428,
  1431, 1434, each with a tick.
- 1424: the usher (QIN_USHER, 引赵使者) walks in from the right edge; the envoy follows 0.7 m behind, EMPTY-HANDED,
  in view from about 1436, both at a slow ceremonial pace (0.85 m/s).
- 1441 大礼摆好: a drum boom (and on 1449); the banners sway 2 deg.
- 1446-1452: the usher stops at `HALL.usher` (92/37), turns to the throne (`turn: 1`) and bows; the envoy walks on
  past him toward `mid` (arrives about 1464, off-screen in 17b). From 1456 the usher backs away toward the door (outside
  every frame from 1461, out of the door by about 1530).

**17b 1461-1484 (24) `throne`.** 1461 秦王【要玉】: the king, upright on the 榻 (ceremony), face `smile`, holds one hand
out toward screen right (pinned at (0.30, 0.95, 0.35) of his body).
- Sound: 1420 `whoosh` tail, 1422-1434 five `tick`s, 1424 soft ceremonial steps, 1441 + 1449 `drum_low`.
- Cut 17a -> 17b on 1461 (group 2), king 12 % -> 34 % (2.8x).

## Line 18 「他说：“秦国二十多个国君，没一个守约的。玉已经到赵国了。”」

Speech 1485-1611. Groups: `0 1485-1499` 他说： · `1 1502-1544` “秦国二十多个国君， · `2 1547-1574` 没一个【守约】的。
· `3 1577-1611` 玉已经到【赵国】了。”

**18a 1485-1576 (92) `linMid`.** The envoy 55/36, 52 %, hands together at the belly (pinned at (±0.04, 0.85, 0.20)),
face `deadpan` throughout. Lip-sync 1502-1576 (the quote runs on to 1611; in 18b his voice is off-screen).
- 1512 (≈ 二十): 22 tiny flat-crown icons (`crowns`) pop in two rows of 11 (y 300 and 380, 1512-1534, one per frame).
- 1547 没一个【守约】的: a seal-red ✗ stamps onto each crown left to right (1553-1574, one per frame).
- 1570-1576: he shows two empty hands (pinned apart at (±0.25, 1.00, 0.30)).

**18b 1577-1611 (35) `throne`.** 1577 玉已经到【赵国】了: the king's hand still out, `smile`; 1590 -> `shock`; on 1595
(≈ 赵) the chip flips to 「赵国」 / "in Zhao" with a `chime`; a gold 「!」 `mark` over the king 1596-1611.
- Sound: 1485 nothing, 1512-1534 a quick rattle of 22 `tick`s, 1553-1574 a stamp rattle, 1595 `chime`, 1596
  `sting_low`.
- Cuts: 17b -> 18a on 1485 (line start), 18a -> 18b on 1577 (group 3: the reveal lands on the king).

## Line 19 「“骗了大王，该死。把我下锅煮了吧。”」

Speech 1614-1686. Groups: `0 1614-1636` “骗了大王， · `1 1639-1651` 【该死】。 · `2 1654-1686` 把我【下锅煮了】吧。”

**19 1612-1685 (74) `hallMid`** (ceremony on; the king seated 42/30, 15 %; the envoy at `mid` 61/36, 19 %). Lip-sync
1614-1686, face `deadpan` throughout (the script's note).
- 1614 骗了大王: a polite bow (`salute`) 1614-1626.
- 1639 【该死】: one slow nod (head down 1639-1645, up 1645-1651).
- 1654 把我【下锅煮了】吧: V5: the cauldron drops from above the frame onto `HALL.cauldron` (falls 1654-1660, lands with
  a squash of the PROP 1.06 / 0.97 / 1.0); the dust `puff` is drawn at its rim (28/42) and rises; 2D `steam` from the
  rim 1662-1685 (the rim is at 42 % y, the steam goes up, away from the captions); he shows it with an open hand
  (pinned toward it, 1666-1686), still `deadpan`. The king `shock`.
- Sound: 1614 cloth, 1660 a heavy bronze `thud` + a short ring, 1662 `steam` hiss (low).
- Cut 18b -> 19 on 1612 (line start; king 34 % -> 15 %, 2.3x).

---------------------------------------------------------------------------------------------------------------

# Segment E (frames 1686-2106): lines 20-23, 7 shots

## Line 20 「满朝大臣面面相觑，有人要拖他出去。」

Speech 1688-1770. Groups: `0 1688-1735` 满朝大臣【面面相觑】， · `1 1737-1770` 有人要【拖他出去】。

**20a 1686-1736 (51) `ministers`.** The three Qin ministers (minC 30/47, minB 38/27, minA 68/32). 面面相觑 = they
stare at EACH OTHER in alarm: the gazes snap on 1690 (A -> B), 1700 (B -> C), 1710 (C -> A), 1720 (all -> screen
right, the envoy); faces `shock` and `huff`, NEVER `laugh` or `grin` (嘻 is alarm). No tag (tagged in 8a).

**20b 1737-1771 (35) `hallMid`.** 1737 有人要【拖他出去】: guardC (striding from his mark since 1725, off-screen right)
comes in from the right edge, takes the envoy's LEFT upper arm (his screen-right side) at `guardGrab` on 1751 (pinned
hand, `rig.qa reach`) and pulls toward the door (1751-1771): the envoy's head tilts 6 deg, feet planted, `deadpan`.
- Sound: 1690-1720 four small `snap` swishes, 1725-1750 armour clank steps, 1751 `grab` (cloth thwap).
- Cuts: 19 -> 20a on 1686 (line start), 20a -> 20b on 1737 (group 1).

## Line 21 「秦王说：“杀了他，玉也回不来。放他回去吧。”」

Speech 1773-1860. Groups: `0 1773-1791` 秦王说： · `1 1794-1812` “杀了他， · `2 1814-1835` 玉也【回不来】。
· `3 1838-1860` 放他回去吧。”

**21a 1772-1837 (66) `throne`.** The cauldron's rim is a foreground shape at the bottom (79/84, below the captions;
no steam in this shot). 1775: the king raises a flat STOP hand toward screen right (pinned at (0.30, 1.05, 0.30)),
face `stern`. 1794 lip-sync (`quote("qinWang", 21)`): 杀了他 a flat chop of the hand; 1814 玉也【回不来】: he slumps
(`head.dy` -0.04, `lookDown` 10, hands to his lap), face `sad` -> `sigh`.

**21b 1838-1863 (26) `hallMid`.** 1838 放他回去吧 (the king's lip-sync continues small at 42/30): guardC lets go on
1840 and steps back out of the right edge toward his mark; the king releases him courteously with a small seated bow
(hands at the chest, `lookDown` 12: 厚遇…毕礼而归之) and the envoy bows back (`salute`, 1845-1853); 1856-1863 he turns
right and starts to walk (the cut comes on the walk).
- Sound: 1775 a sharp `swish` (the hand), 1814 a low `deflate`, 1840 cloth, 1845 a soft bell (钟) note.
- Cuts: 20b -> 21a on 1772 (line start; king 15 % -> 34 %), 21a -> 21b on 1838 (group 3).

## Line 22 「最后，秦国没给城，赵国也没给玉。」

Speech 1866-1938. Groups: `0 1866-1878` 最后， · `1 1880-1907` 秦国【没给城】， · `2 1910-1938` 赵国也【没给玉】。

**22 1864-1938 (75) `hallDoor`** (from the WEST, 56 deg off `hallMid`; the ceremony dressing stays on; guardC is back
at his mark, outside the frame). The envoy, a back view (`turn: 1`), steps in from the left edge (8/46, 26 % at 1864)
and walks toward the bright east door, to `exit` (66/41, 18 % by 1930).
- 1866 最后: THE BILL (V6): a panel of bamboo slats (竹简, bound by two cords) slides up into the top half (1866-1876,
  y 230-640, x 140-940): title 「账单」 / "THE BILL"; slat 1 「秦 → 赵　十五城」 / "Qin → Zhao: 15 cities"; slat 2
  「赵 → 秦　和氏璧」 / "Zhao → Qin: the jade".
- 1880 秦国【没给城】: a red seal 「0」 stamps onto slat 1 on 1890 (≈ 没).
- 1910 赵国也【没给玉】: 「0」 stamps onto slat 2 on 1924 (≈ 没).
- 1930-1934 the bill slides away down; 1934-1938 WHIP PAN RIGHT + `streak` (toward Zhao).
- Sound: 1866 a bamboo clack-slide, 1890 + 1924 `seal_thump`, 1930 bamboo, 1934 `whoosh`.
- Cut 21b -> 22 on 1864 (line start, 56 deg).

**Into line 23: WHIP PAN RIGHT**, landing on the King of Zhao and the jade: shot 3's framing (the rhyme).

## Line 23 「价值连城的玉，一座城也没换到；倒是那个门客，回国就当了大官。」

Speech 1940-2083 (the last caption lingers to 2106). Groups: `0 1940-1975` 【价值连城】的玉， · `1 1977-2012`
一座城也【没换到】； · `2 2015-2042` 倒是那个门客， · `3 2045-2083` 回国就当了【大官】。

**23a 1939-2014 (76) `zhaoThrone`** (shot 3's camera and pose). The King of Zhao on his 榻, the jade in his hands,
face `happy`; the chip shows 「赵国」.
- 1940 【价值连城】的玉: STAMP 「价值连城」 lands 1940 (one row, centre (540, 270)), EN gloss "worth a string of
  cities" under it to y 420 (above his crown, about y 450); out 1975 (36 frames, before the arch takes that space).
- 1977 一座城也【没换到】: the arch of 15 cities pops in `ghost` (1977-1984), then `vanish`: they pop out one by one
  from the left (1985-2005, a `pip` each); the king glances up at the empty arch (`gaze` up, `deadpan` 1990), then
  back down at the jade, `smile` 2005.

**23b 2015-2106 (92) `zhaoCrown`.** The king has stepped down in the cut: standing at `ZHAO.kingStand` (24/42), facing
east, the `officialCap` in both hands; the envoy kneeling at `ZHAO.kneel` (48/51), facing west; the eunuch at
`ZHAO.miao23` (77/42) `smile`; the jade upright on its stand on the dais (60/49): the motif ends on screen.
- 2015 倒是那个门客: the tag returns 2017 (`TAG.lin23`): 「蔺相如 · 宦官的门客」 / "the envoy" + "the eunuch's
  retainer", about (540, 600), above both neighbours' heads.
- 2045 回国就当了【大官】: the king holds the cap out and the envoy takes it in both hands at `capPass` (36/48) about
  2050 (`rig.qa reach`: 0.34-0.37 m); he lifts it toward his head (2052-2060); on 2061 (≈ 当) SWAP `LIN` ->
  `LIN_OFFICIAL` with a head pop and a gold `burst` (the swap puts it on); the cap prop hides; a bronze bell (钟)
  strike; the tag's ROLE row flips to 「上大夫」 / "senior official" (`flipAt` 2061) and the tag stays to 2100 (the
  declared long tag: the flip is the punchline). The eunuch claps (hands meet at the chest, 4 claps 2062-2080).
- 2076-2084 the envoy rises (sink 0.38 -> 0, head 48/42), face `smile_closed`; 2090 a small nod; 2098 a blink.
- 2084-2089: the chip and the source tag fade out. The last frame (2106): the promoted envoy standing between his
  king and the eunuch, the jade on its stand, the caption 「回国就当了【大官】。」.
- Sound: 1940 `seal_thump`, 1985-2005 15 `pip`s (the line-3 ticks backwards: pitched DOWN), 2050 cloth, 2061 a bronze
  bell + shimmer, 2062-2080 4 claps, 2090-2106 a low final note into silence.
- Cuts: 22 -> 23a on 1939 (whip), 23a -> 23b on 2015 (group 2; king 34 % -> 20.5 %, 1.66x).

---------------------------------------------------------------------------------------------------------------

# Tables for `beats.ts`

## Tags (`TAG`, `TAG_LEN` 32 unless noted; never across a cut)

| key | from | out | who | zh | en |
|---|---|---|---|---|---|
| `lin0` | -12 | 44 | envoy (shot 1) | 蔺相如 · 宦官的门客 | the envoy |
| `qinWang` | 148 | 167 | King of Qin | 秦王 | King of Qin (short: declared) |
| `zhaoWang` | 196 | 228 | King of Zhao | 赵王 | King of Zhao |
| `zhaoMin` | 330 | 360 | Zhao ministers | 赵国大臣 | Zhao's ministers |
| `miao` + `lin5` | 409 | 441 | eunuch + envoy (`tags`) | 赵国宦官 / 蔺相如 · 宦官的门客 | the palace eunuch / the envoy · the eunuch's retainer |
| `ladies` | 565 | 593 | lady A | 美人 | the king's ladies |
| `qinMin` | 600 | 626 | Qin ministers | 秦国大臣 | Qin's ministers |
| `servant` | 1320 | 1352 | servant | 随从 | his servant |
| `lin23` | 2017 | 2100 (flip 2061) | envoy | 蔺相如 · 宦官的门客 -> 上大夫 | the envoy · the eunuch's retainer -> senior official |

## Hits (`HIT`, each from `capWord`; the numbers are today's)

`glint1` 59 · `wind1` 75 · `smash1` 100 · `kingTag` 148 · `whip1` 168 · `earlier` 172 · `source` 174 · `glintZhao` 182 ·
`chipZhao` 190 · `zhaoTag` 196 · `cities` 211 · `offer` 237 · `ghost` 257 · `hug` 283 · `army` 296 · `who` 328 ·
`zhaoMin` 330 · `noOne` 347 · `walkIn` 363 · `present` 407 · `iGo` 443 · `chipLin` 472 · `wanbi` 476 · `whip2` 509 ·
`reach` 527 · `take` 533 · `laugh` 543 · `toLady` 565/570 · `cheer` 594 · `qinMin` 600 · `bubble` 640 · `walkUp` 663 ·
`flaw` 707 · `giveBack` 724/730 · `handBack` 748/750 · `jadeBack` 752 · `spin` 794 · `bump` 800 · `rage` 803 ·
`nufa` 806 · `threat` 831 · `hudOut` 846 · `hookBack` 852 · `smash2` 896 · `hudIn` 925 · `clap` 955/959 ·
`mapOpen` 963 · `roller` 976 · `point` 980 · `cities12` 996 · `linWalk` 1011 · `stage` 1077 · `swing` 1094 ·
`suns` 1133 · `sunsSlide` 1180 · `grand` 1205 · `stageOff` 1225 · `reach15` 1244 · `glance` 1250 · `rage2` 1253 ·
`nod` 1280 · `exit15` 1286 · `beckon` 1316 · `servantTag` 1320 · `puff` 1339 · `tuck` 1367 · `whip3` 1414 ·
`dayTick` 1422 · `usher` 1424 · `drum` 1441 · `ask` 1461 · `crowns` 1512 · `cross` 1553 · `reveal` 1595 ·
`cauldron` 1654/1660 · `snap` 1690 · `grab` 1751 · `stop` 1775 · `slump` 1814 · `release` 1840 · `bows` 1845 ·
`bill` 1866 · `zero1` 1890 · `zero2` 1924 · `whip4` 1934 · `liancheng` 1940 · `vanish` 1985 · `lin23` 2017 ·
`cap` 2050 · `crown` 2061 · `rise23` 2076

`BEAT`: `earlier` 172-199, `source` 174, `hudOut` 846-851, `hudIn` 925-931, `sourceOff` 2083, `chipFade` 2084-2089,
`hookOff` = shots 1 and 11.

## Rule checks (BIBLE section 9)

- Rule 1: all shots >= 18 frames (7a 18, 17b 24, 21b 26, 8b 34).
- Rule 3, every cut between shots that share a subject: 1->2 2.2x · 3->5a 2.5x · 5a->5b 1.65x · 5b->6 axial 1.7x ·
  7a->7b 1.8x · 7b->8a 1.8x · 8a->8b 3.4x · 8b->9 1.8x · 9->10a 2.1x · 10a->10b 3.2x · 10b->11 axial 1.7x ·
  11->12a 1.9x · 12a->12b 33 deg · 12b->13 1.8x and 30 deg · 13->14 2.9x · 14->15 2.9x · 16a->16b 3.1x ·
  17a->17b 2.8x · 18b->19 2.3x · 20b->21a 2.3x · 21a->21b 2.3x · 21b->22 56 deg · 23a->23b 1.66x. Different
  subjects: 17b->18a, 18a->18b, 19->20a, 20a->20b. Axial cuts keep the head x: 5b->6 42 -> 42 %, 10b->11 51 -> 51 %.
- Rule 5, place / time changes: 2->3 whip R + EARLIER, 6->7a whip L, 15->16a continuing motion (in from the left
  edge), 16b->17a whip L + day-tick, 22->23a whip R; rhymes 1/11 and 3/23a.
- Rule 6, screen direction: the jade goes left in the hall (king -> lady A), the envoy enters the hall from the
  right and leaves to the right, the servant runs right, Zhao is reached by panning right.
- Rule 7: every line-start cut is on its first syllable or 2 frames before (2 108/110, 3 172/174, 5 326/328,
  7 513/515, 8 594, 9 663, 10 752, 12 925/927, 13 1040, 15 1244, 16 1296/1298, 17 1420/1422, 18 1485, 19 1612/1614,
  20 1686/1688, 21 1772/1773, 22 1864/1866, 23 1939/1940); inside-line cuts are on named actions (推了出来 407,
  我把玉 472, 接过玉 531, 没人提城 629, 怒发冲冠 803, 我的头和这块玉 852, 摊开地图 963, 大王也得 1163, 抄小路 1381,
  秦王要玉 1461, 玉已经到赵国 1577, 有人要拖 1737, 放他回去 1838, 倒是那个门客 2015).
- Rule 11: overlays out before each cut; declared bridges: the HUD (source tag, chip; faded around 11) and the stage
  13 -> 14 (lifted 1225-1235, inside 14).
- Facings: back views (`turn: 1`) in 8a (backing off), 10a (the scuttle), 12b-15 (the official), 17a (the usher's
  bow), 22 (the exit); the bow in 9 is 112 deg off the lens; 23b's profiles are 90 deg.

## Open points for the sample (A) to settle on stills

1. Frame 0, 92, 100 (WP7, film frames): does the one-handed raise read as "about to smash it", and does the strike
   read as a move across the frame toward the column? (Script says 双手; the rig cannot: BIBLE section 5.)
2. The king's held half-rise (`rise` 0.45): WP1b proves it with `rig.qa`; if it fails, he stands in front of the 榻
   and WP2 re-aims `hook` and `kingWave` (kit request 9).
3. Shot 3: are 154 frames with one move too long? Fallback: a cut to a new closer camera at 1.6x on 237.
4. 5b's two tags at once: if busy, drop the envoy's (he was tagged at frame 0) and keep the role row for 23b.
5. Shot 6's stamp has 33 frames before the whip: enough on the phone?
