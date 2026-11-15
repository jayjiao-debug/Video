# 《完璧归赵》 film bible (WanbiFilm)

A vertical short (1080 x 1920, 30 fps) for Douyin (Chinese, voice Xiaoxi) and YouTube Shorts (English, voice Alex), the
third toon history film after Arthur and 鸿门宴. Real narration: `/home/user/wanbi_work/voice/zh_v1/voice_timing.json`
(23 lines, 367 字, speech 0.10-69.43 s, **2107 frames = frames 0-2106** (`frames` in the json; it has `tail` 0.8 s and
no `tail_f`), lead 3 frames). The film does NOT loop: it ends on a punchline (the jade bought nothing, the retainer
came home a senior official).

The only valid script is `/mnt/project-files/next-video/wanbi/script_v2.md` (source text `source_shiji.md` beside it).
The shot plan is `STORYBOARD.md`, the file layout and work packages `BUILD_PLAN.md`, both in this folder. The model is
Hongmen (`src/videos/hongmen/BIBLE.md`): same rig, same kit, same rules unless this file says otherwise.

Style: the rig's hand-drawn 3D figures (`group/kit/rig3d`), plain sets with ink outlines, expressive faces, everything
literal. Abstract things (offers, threats, counts, the bill) live in ONE flat graphic layer of gold-outlined icons
(section 7), never as extra 3D sets. Three places, 33 shots, one action per caption group.

## 1. The story (only what script v2 says; source 《史记·廉颇蔺相如列传》)

| # | Beat | Lines |
|---|---|---|
| 1 | THE HOOK (flash-forward to line 11). In the Qin hall a man with his back to a red pillar holds the jade high, eyeing the pillar; across the hall the King of Qin has half risen from his platform seat, waving both hands. | 1, 2 |
| 2 | THE OFFER (flashback). Qin offered fifteen cities for the jade; Zhao's dilemma: give it and the cities may never come, refuse and Qin's army will. | 3, 4 |
| 3 | THE VOLUNTEER. Nobody to send; the palace eunuch puts his own retainer forward. "I'll go. No cities, I bring it back whole." | 5, 6 |
| 4 | THE HALL. The king takes the jade, delighted, passes it to his ladies; everyone shouts 万岁; nobody mentions the cities. | 7, 8 |
| 5 | THE TRICK. "There's a flaw, let me show you" -> jade back in his hands -> backs to the pillar, 怒发冲冠 -> the threat (the opening shot returns). | 9-11 |
| 6 | THE MAP. The king apologises, has the map brought, points: these fifteen cities. | 12 |
| 7 | BOTH ACT. He can tell the king is acting; he acts too: fast five days, hold the grand ceremony, then I hand it over. The king cannot take it by force and agrees. | 13-15 |
| 8 | THE SERVANT. In rough cloth, the jade in his coat, the servant slips home to Zhao by a back road. | 16 |
| 9 | THE REVEAL. Five days later, ceremony set, the king asks for the jade: "twenty-odd rulers never kept a deal; the jade is in Zhao. I deceived you; throw me in the pot." | 17-19 |
| 10 | THE RELEASE. Ministers stare, someone moves to drag him out; the king: killing him won't bring the jade back, let him go. | 20, 21 |
| 11 | THE BILL. No cities, no jade; a jade worth fifteen cities bought none, but the eunuch's retainer came home a senior official. | 22, 23 |

Picture details the narration does not say but the source supports (keep them small): the king receives him LOUNGING
on his platform seat (见臣列观，礼节甚倨, line 7: leaning on the elbow-rest, turned half away; the period's legs-out 箕踞
is beyond the rig, kit request 9); the jade passes from the ladies back to the king before it reaches the envoy (王授璧,
line 9); the king claps and an official holds the map on its stand (召有司案图, line 12); an usher leads the envoy into
the ceremony (引赵使者, line 17); the king lets him go courteously, bows exchanged (厚遇…毕礼而归之, line 21).

VISUAL INTERPRETATIONS (not in the source; each keeps the source's meaning; the owner approves them on the samples):
- V1 line 5 「没人」: the two Zhao ministers turn their backs at once (source: 求人可使报秦者，未得).
- V2 line 6: the jade passes from the Zhao king to the envoy in the 5b -> 6 cut (a 2 m jump, the only hand-over not
  shown): needs the owner's explicit yes.
- V3 lines 13-14: THE STAGE. On 在演 a spotlight falls on the king, curtains swag in, a 京剧 cymbal; on 他也演 the light
  swings to the envoy (source: 相如度秦王特以诈详为予赵城: both are pretending).
- V4 line 16: the envoy throws a brown cloak over the servant (a puff and a costume swap); DUSK (no time in the source).
- V5 line 19: the cauldron drops in beside him as he says it (source: 臣请就汤镬: he ASKS for the pot). He stays deadpan.
- V6 line 22: the bill, written on bamboo slips (竹简), as the summary device.
- V7 line 5 推了出来: the eunuch presents him with an open hand and a light pat on the back. He walks in composed and
  is never dragged (source: 缪贤 recommends him as 勇士，有智谋; he volunteers, 臣愿奉璧往使).
- V8 line 23: the promotion shown as the Zhao king handing him the official's cap, the eunuch present and clapping
  (source: 拜相如为上大夫).
- V9 lines 10-23: the ladies duck behind the screen at 803 and do not come back (the ceremony is formal: 设九宾礼于廷).
- V10: the eunuch's horsetail whisk is a Ming-Qing stage emblem of eunuchs, kept only for readability.
- V11 line 15 抢不到: the king's calculated half-reach that stops after a glance at his guards (source:
  秦王度之，终不可强夺).

NOT in the picture: no blood, no blade touching anyone, nothing broken (the jade never cracks, the pillar never
cracks). Ministers at line 20 are NOT laughing (相视而嘻: 嘻 is a cry of alarm): faces `shock` / `huff` only. No
personal name other than 蔺相如 in Chinese text; NO personal name at all in English text (he is "the envoy"). No Latin
letters in the Chinese version, no Chinese-only text the English viewer needs (section 7). NO CHAIRS: every seat is a
low platform seat (榻) on a dais, as Hongmen seats everyone on floor pads (high chairs come in with the Tang/Song).

## 2. The world: three places, each its own island along x

Metres, y up, floor y 0, facing 0 = toward +z (the camera side), facings in radians. All numbers live in `layout/` (one
file per place, re-exported by `layout.ts`); nobody types a mark or a camera by hand. One place shows at a time.

| Place (`Place`) | island x | Lines | What it is |
|---|---|---|---|
| `hall` 章台 | 0 | 1, 2, 7-15, 17-22 | The King of Qin's detached hall. BLACK and GOLD: charcoal walls with gold trim, a dark stone floor with a lighter grout grid, four VERMILION pillars, a gold screen behind a low black platform seat (榻) on a dais. Lines 17-22 add the CEREMONY DRESSING: with it the same hall stands in for the formal court (廷) of the 九宾 ceremony |
| `zhao` 赵廷 | 40 | 3-6, 23 | The Zhao court by day. PALE: cream plaster walls, pale wood floor, TEAL hangings, a teal-and-gold screen behind the king's 榻, a rectangular lattice window (直棂窗) of pale sky on the back wall right of the dais, daylight from the east (screen right). Nothing black, nothing red |
| `road` 传舍后门 | 80 | 16 | DUSK behind the guesthouse (广成传舍): a rammed-earth wall and a small wooden gate at the left, a path leaving to the right over a low ridge; an orange sky low at the LEFT (west), deep violet at the top right with a pale moon |

### 2.1 Screen sides (never broken)

- QIN IS LEFT, ZHAO IS RIGHT (the map: Qin west, Zhao east). Inside the hall the king is always screen-left of the
  envoy; the envoy enters the hall from the right (the east door) and leaves through it; the servant runs to the right.
- Whip pans follow the map: toward Zhao = pan RIGHT (2 -> 3, 22 -> 23a), toward Qin = pan LEFT (6 -> 7a, 16b -> 17a).
- In the Zhao court the king sits centre-left; the envoy and the eunuch come in from the right (the east door).
- The jade is the brightest thing in every frame it is in (section 6); it never sits on the pale window.
- Screen zones (px on 1080 x 1920, `layout.ts SCREEN`, same as Hongmen): nothing that matters above y 210, in the
  caption band y 1190-1498, below y 1613, or at x > 930 below y 900. The source tag owns the top-left corner (y 189-231),
  the jade chip the top-right corner (x 780-984, y 215-310).

## 3. The places in numbers (`layout/hall.ts`, `layout/zhao.ts`, `layout/road.ts`)

THE HALL (x 0). Floor x -3.4..3.4, z -6.0..3.4; north wall z -6.0; east wall x 3.4 with the EAST DOOR centred z -2.3,
1.3 wide, 2.5 high, bright daylight beyond; the south wall is hidden by `setView` (cameras stand there).

| Thing | Numbers |
|---|---|
| dais | x -1.6..1.6, z -5.5..-4.0, top 0.30; one step 0.15 high, z -4.0..-3.75 |
| 榻 (the king's seat) | black lacquer with a gold edge, x -0.60..0.60, z -4.95..-4.15, top 0.40 (0.10 above the dais). The king sits on `seat` {top (0, 0.50, -4.72), floor 0.40, back 0.03}: head about (0, 1.20, -4.66); for a hand-over he sits forward (`back` -0.10). Half-risen (`seated(s, t, {rise: 0.45})`, held; hook and 10a): head about (0, 1.42, -4.62). 凭几 (low curved elbow-rest) at (-0.40, -4.78), top y 0.62, 0.45 long, on his right (screen left) |
| gold screen | z -5.35, 2.8 wide, 2.3 high, muted gold `#b8913a` with a black cloud-scroll border: the king's black robe reads against it |
| PILLARS | Ø 0.44, 3.6 high (tops outside every frame), vermilion `#b8322a`, black stone plinth 0.56 x 0.56 x 0.12, gold band at y 2.6. **E1 (1.41, -1.10) = THE PILLAR** (lines 1, 10, 11, 15); W1 (-1.41, -1.10); E2 (1.41, -3.30); W2 (-1.41, -3.30) |
| ladies | `HALL.ladyA` (-0.78, 0.30, -4.50) beside the 榻, `ladyB` (-0.36, 0.30, -5.12) behind it: both on the dais WEST of the king (the jade goes left, away from Zhao). Lady A takes and returns the jade at `HALL.pass` (-0.42, 1.10, -4.55) with a small bow (salute-form hands). Not placed in 1, 2, 11; hidden from 803 to the end (V9) |
| ministers | `HALL.minA` (-1.90, 0, -3.10), `minB` (-2.45, 0, -3.40), `minC` (-1.90, 0, -2.10), facing 0.9, down the west side: in frame only in `hallWide` and `ministers` (outside every other frame, so they never blink in and out) |
| guards | `HALL.guardL` (-2.95, 0, -4.55), `guardR` (2.70, 0, -5.00): placed in 7a-10a only. In the ceremony ONE guard, `guardC` (QIN_GUARD_B) at (1.90, 0, -0.90), out of every frame until he strides into `hallMid` in 20b to `guardGrab` (0.85, 0, -1.95) |
| usher (17a) | QIN_USHER (引) from off-screen right to `HALL.usher` (0.80, 0, -2.85), then back out by the east door (out of every frame from 1461) |
| envoy's marks | `enter` (2.20, 0, -2.60) (inside the door) · `present` (0.55, 0, -3.45) · `give` (0.78, 0.30, -4.40) (ON the dais east of the 榻, facing -1.06; hand-overs meet at `HALL.meet` (0.40, 1.10, -4.50), the king sitting forward) · `mid` (0.45, 0, -2.30) · `retreatTurn` (0.95, 0, -0.45) (10a) · `pillar` (1.21, 0, -0.74) (back and left shoulder against E1's south-west face, facing -0.45; head about (1.21, 1.22, -0.74)) · `exit` (2.70, 0, -2.30) |
| the jade at the pillar | frame 0: hand 1 (his left, screen right) at (1.56, 1.32, -0.69) gripping the disc's bottom edge; centre `HALL.jade0` (1.56, 1.45, -0.69), its edge 0.09 m from the lacquer. Wind-up `jadeWind` (1.46, 1.50, -0.60); strike `jadeHit` (1.69, 1.38, -0.80), 0.06 m from the lacquer |
| map stand (12b-15) | a black lacquer frame at (-0.45, 0, -3.30), bar at y 1.60, 0.95 wide; the silk sheet 0.85 x 0.60 hangs from the bar to y 1.00 (facing +z). On from 963 only (`setMapStand`), with the official (QIN_MIN_C as 有司) kneeling at `HALL.official` (-0.45, 0, -3.00) in a back view (head 0.84), holding the bottom roller at (±0.25, 1.00) (reach check; the stand may drop 3 cm). The king stands at `kingMap` (-1.05, 0, -3.15) |
| cauldron (19-22) | `HALL.cauldron` (-0.35, 0, -2.25): left of `mid`, between him and the ministers |
| ceremony dressing (17-22) | `w.set.setCeremony(k)`: eight banners at x ±3.15, z -4.4, -3.4, -1.2, -0.2 (clear of the east door z -1.65..-2.95; black field, gold edge, 秦); a woven mat runner (席) with a black-and-gold border x -0.6..0.6, z -3.75..2.0; a bronze drum on a stand at (-2.4, 0, -4.6); `guardC`. Stays on through 22. `set.reset()` returns it and the map stand to off |

THE ZHAO COURT (x 40). Floor x 37.0..43.4, z -5.0..3.0; dais x 38.8..41.2, z -4.4..-3.4, top 0.20; 榻 (teal lacquer,
gold edge) x 39.45..40.55, z -4.35..-3.48, top 0.30, `seat` {top (40.00, 0.40, -4.05), floor 0.30}: seated head about
(40, 1.05, -4.00); the screen behind it; the lattice window x 41.35..42.15, y 1.2-2.0, z -4.95 (outside `zhaoThrone`
and `zhaoKing`); east door x 43.4, z -2.0; west door x 36.6, z -1.8 (toward Qin). Marks: `ZHAO.jade` (40.00, 0.80,
-3.72), the jade in the seated king's two hands (pair grip); ministers `ZHAO.minA` (41.55, 0, -3.15), `minB`
(42.05, 0, -2.75), facing -0.9. Line 5: the envoy from `linFrom` (42.70, 0, -1.95) to `linStop` (41.00, 0, -1.95)
(363-404, 1.24 m/s), then a step to `ZHAO.lin` (40.65, 0, -1.95) (407-415); the eunuch from `miaoFrom` (43.10, 0,
-2.20) to `ZHAO.miao` (41.30, 0, -2.25). Line 23: the king has stepped down to `kingStand` (39.80, 0, -2.65), facing
east; the envoy kneels at `ZHAO.kneel` (40.35, 0, -2.60), facing west (sink 0.38); the cap passes at `capPass`
(40.08, 0.97, -2.62) (reach 0.34-0.37 m from both); the eunuch at `miao23` (41.00, 0, -2.45); the jade stands upright
on a lacquer stand on the dais at `jadeStand` (40.70, 0.20, -3.75), disc centre y 0.78.

THE ROAD (x 80). The guesthouse wall along z -2.0 from x 76.0 to 79.6, the gate at (78.95, 0, -2.0) (1.0 wide; no
lantern, at most an unlit torch bracket); `ROAD.envoyFrom` (78.60, 0, -0.90) (outside the left edge), `ROAD.envoy`
(79.45, 0, -1.00), `ROAD.servant` (80.05, 0, -1.10); the path from (80.4, 0, -1.3) out of frame right; far: a ridge
path at z -14 (y 0.9) from x 74 to 88 for the long shot; painted far hills (violet, blue).

## 4. Cameras (`CAMS`, 23). Pinhole-checked against every mark, NOT yet rendered

Holds are head centre x % / y % / head width % of the frame (a rig head is 0.47 m wide), with everyone placed in the
shot (STORYBOARD's "placed" column). WP1b proves the segment-A cameras with block-out stills; WP2 / WP3 the rest.

| name | pos | look | fov | shots | holds (everyone in or near the frame) |
|---|---|---|---|---|---|
| `hook` | 1.50, 0.90, 5.50 | 1.00, 1.02, -4.60 | 28 (push to 26) | 1, 11 | envoy at `pillar` 51/42, 27 %; king half-risen 15/42, 18 % (hands 2-26 % x); jade 71/35, wind-up 65/33, strike 78/37 (141 px across); E1 51-75 % x, just right of his head; dais step 68 % y. Placed: envoy, king only |
| `kingWave` | 0.25, 1.38, -1.07 | 0.16, 1.28, -4.64 | 36 | 2 | king half-risen 38/44, 39 %; the gold screen fills the back |
| `hallWide` | 0.20, 4.80, 4.40 | -0.70, 0.30, -2.60 | 44 | 7a, 8a, 17a | high, frontal: king 72/27, 12 %; `give` 91/24, 11 %; ladyA 54/23, ladyB 65/20; minA 21/33, minB 9/31, minC 14/40; guardL 5/25 (guardR out, 135 %); drum 18/30; envoy at `present` 85/33, at `mid` 82/41, 14 %; `enter` 134 % (in from the right edge, visible from x ≈ 1.08); usher 92/37 |
| `presentTwo` | -0.75, 1.45, 0.90 | 0.00, 0.98, -4.55 | 40 | 7b, 9 | king 50/44, 22 %; ladyA 15/36, 22 %; ladyB 32/37, 19 %; envoy at `give` 86/37, 21 %, at `present` 88/45, 26 %; `mid` out (105 %: in 9 he walks in from the right); `meet` 68/47; `pass` 31/47; lady A's jade at her chest 21/49, raised 22/30. Ministers, guards outside |
| `linClose` | 1.05, 1.30, 0.95 | 0.45, 1.01, -2.29 | 30 | 8b | envoy at `mid` 50/38, 47 % (the king hidden behind him). Ladies not placed (lady A would peek out under the bubble) |
| `retreat` | -0.80, 2.80, 6.00 | 0.60, 0.60, -2.20 | 44 | 10a | high from the south-west: king half-risen 29/34, 10.5 %; `give` 46/33; envoy at `pillar` 76/46, 14.5 % (feet 65 %); E1 72-85 % x; ladies 13/33, 21/32; guardR 81/35 behind E1; ministers outside the left edge |
| `pillarClose` | 1.38, 1.03, 2.93 | 0.88, 1.15, -7.17 | 28 | 10b | ON THE HOOK'S AXIS, 1.7x: envoy 51/42, 46 % (head x as in `hook`); cap top 15 % y; the raised jade 85/29 in front of E1. Placed: envoy only (the king would be half-cut at 3 %) |
| `throne` | -1.00, 2.30, 0.20 | -0.20, 0.75, -4.64 | 30 | 12a, 17b, 18b, 21a | high from the south-west: king seated 63/34, 34 % (looking room right); envoy at `mid` outside; ladies' spots 11/24, 36/20 (hidden by then); cauldron rim 79/84, a foreground shape below the captions (21a); the map stand would cross the frame: off until 963. Ministers, guards outside |
| `map` | 1.00, 1.60, 0.60 | -0.74, 0.85, -3.29 | 36 | 12b | from the south-east (33 deg off `throne`): king at `kingMap` 28/33, 33 %; the sheet x 42-95 %, y 23-46 %; the official (back view) 60/53; the envoy walking from `pillar` stays outside (> 130 %). guardL would stand behind the king: guards are not placed in C |
| `stageTwo` | -1.00, 1.50, 4.75 | -0.28, 0.68, -2.70 | 36 | 13, 15 | king at `kingMap` 22/37, 18 %; the map 28-57 % x, 31-43 % y; official 43/46; envoy at `mid` 79/39, 18 % (96 % on 1040: in from the right edge); the empty 榻 53/38; W1 / W2 slivers at the left edge |
| `linStage` | 0.55, 1.30, 0.45 | 0.40, 1.00, -2.28 | 32 | 14 | envoy at `mid` 56/36, 53 %; the official and the map's edge stay outside |
| `linMid` | 0.95, 1.30, 0.45 | 0.41, 1.00, -2.28 | 32 | 18a | envoy at `mid` 55/36, 52 % (the king hidden behind him; no map stand in D) |
| `hallMid` | 0.00, 2.10, 3.00 | 0.20, 0.50, -2.60 | 44 | 19, 20b, 21b | envoy at `mid` 61/36, 19 % (feet 62 %); king seated 42/30, 15 %; cauldron rim 28/42, base 63 %; `guardGrab` 79/37; guardC's mark 145 % (he enters from the right edge) |
| `ministers` | -0.40, 2.40, 0.80 | -2.00, 0.90, -2.80 | 28 | 20a | minC 30/47, 48 %; minB 38/27, 35 %; minA 68/32, 39 % (guardL would sit between minC and minB: not placed in E) |
| `hallDoor` | -2.90, 1.70, 0.60 | 2.55, 0.81, -2.68 | 40 | 22 | from the WEST: envoy from `mid` (8/46, 26 %, stepping in from the left edge) to `exit` (66/41, 18 %), a back view; the bright door 57-99 % x (E1 covers 79-99); E2 a sliver 0-12 %; banners 13/33, 40/33; cauldron a foreground shape bottom-left (rim 62 % y); guardC at his mark outside (109 %); W1 outside |
| `zhaoThrone` | 40.00, 0.98, 0.05 | 40.00, 0.75, -3.72 | 34 | 3 (start), 23a | king seated 50/37, 34 %; the jade 50/48, 20 %; window outside |
| `zhaoKing` | 39.75, 1.10, -0.05 | 39.83, 0.56, -4.00 | 36 | 3 (end of the move) | king 62/31, 33 %; jade 63/42; the left 45 % free for the graphic layer |
| `zhaoWide` | 40.70, 1.85, 4.40 | 40.95, 0.50, -2.50 | 42 | 5a | king 22/37, 13 %; minA 68/36, minB 85/36 (his body touches the rail zone: WP3 may nudge look x +0.1); `lin` 40/38, 17 %; `miao` 63/37; `linFrom` 114 % (in from the right edge); window 68/28 behind the ministers |
| `zhaoPush` | 40.40, 1.50, 2.00 | 40.80, 0.70, -2.10 | 42 | 5b | envoy at `lin` 42/34, 28 %; eunuch at `miao` 76/33, 25 %; king 12/35, 18 %. Ministers not placed (minA behind the eunuch, minB a sliver at 106 %) |
| `zhaoLin` | 40.50, 1.38, 0.37 | 40.90, 0.58, -3.73 | 42 | 6 | 5b's axis, 1.7x: envoy 42/34, 47 % (head x kept); jade at the chest 44/49, at the chin 44/43. Placed: envoy only (king at 0 %, eunuch at 97 % would be half-cut) |
| `zhaoCrown` | 40.35, 1.55, 2.40 | 40.40, 0.85, -2.80 | 44 | 23b | king standing 24/42, 20.5 %; envoy kneeling 48/51, 20.5 % (risen 48/42); eunuch at `miao23` 77/42, 21 %; `capPass` 36/48; the jade on its stand 60/49; window 78-90 % top right. Zhao ministers not placed (minA 95 %) |
| `roadGate` | 79.95, 1.35, 3.00 | 79.70, 0.94, -1.19 | 36 | 16a | gate 12 % x; envoy at `ROAD.envoy` 32/40, 32 % (from `envoyFrom` at -27 %: in from the left edge); servant 70/40, 31 %; sky in the top 35 % |
| `roadFar` | 80.50, 1.60, 22.0 | 80.50, 1.30, -14.0 | 13 | 16b | the ridge path across the frame at 46 % y; the servant 10 % wide running left to right; the sun at the left horizon, the moon 80/18 |

## 5. Cast (`people.ts`, `acc/`). QIN = BLACK + GOLD, ZHAO = TEAL + CREAM

Every figure is 1.45 m tall (the King of Qin 1.08 x). Each named figure has ONE silhouette feature no one else has and
must pass Hongmen's test on the line-up: told apart at 100 px and as black silhouettes. 18 Persons.

| Role | Export (`PEOPLE.` key) | Side | Read at a glance | Tag zh / en (first tag) |
|---|---|---|---|---|
| 蔺相如 the envoy | `LIN` (`lin`) | Zhao | slim (width 0.92); the ONLY bright-TEAL robe in the Qin hall (`#2f9a96`, cream band + sash); a soft black cloth head-wrap (帻) tied over the topknot with two short LIMP knot ends at the back (`envoyCap`, never stiff paddle tails); thin pencil moustache, no beard | 「蔺相如 · 宦官的门客」 / "the envoy" (frame 0); at 5b with the role row "the eunuch's retainer"; at 23b the role FLIPS to 「上大夫」 / "senior official" |
| the envoy, enraged | `LIN_RAGE` (`linRage`) | Zhao | the same + `rageHair` (seven spiky tufts round the crown) lifting the wrap 0.13 m, tilted 8 deg; heavy brows. Frames 0-107, 803-924, 1253-1271 | (none) |
| the envoy promoted | `LIN_OFFICIAL` (`linOfficial`) | Zhao | the same robe with a GOLD sash and band + the tall black official's cap (kit `scholarCap`, gold band, gold pin): the tallest hat of the film | (the 23b flip) |
| 秦王 the King of Qin | `QIN_WANG` (`qinWang`) | Qin | stout (width 1.25, scale 1.08); black robe `#36323d`, gold band, wide gold sash; the FLAT CROWN BOARD with short bead fringes (`mianCrown`, fringe above the brows); upturned moustache + goatee; resting face `smug` | 「秦王」 / "King of Qin" (148) |
| 赵王 the King of Zhao | `ZHAO_WANG` (`zhaoWang`) | Zhao | plump (width 1.2); deep-teal robe `#1f6e6e`, gold band and sash; a small GOLD crown on his topknot (kit `topknot({ guan: gold })`); short beard; often `nervous` | 「赵王」 / "King of Zhao" (196) |
| 缪贤 the eunuch | `MIAO_XIAN` (`miaoXian`) | Zhao | round and plump (width 1.3, round jaw), BEARDLESS; sage-cream robe `#d8cfae`, teal sash; soft black round cap; a white horsetail WHISK in the crook of his left arm (`whisk`, V10); resting face `smile` | 「赵国宦官」 / "the palace eunuch" (409). No name (open question) |
| the king's ladies 美人 | `LADY_A`, `LADY_B` | Qin | the only women: Look hair `"long"` + `ladyBun` = ONE low bun at the back of the head with a long tail and a single plain pin (Warring States; the tall double loops only if the 100 px test fails); peach `#f2c09a` (A) and pink `#eaa0a8` (B) long robes, BLACK sash; slim (0.85); resting face `smile_closed` (blush) | one tag over lady A: 「美人」 / "the king's ladies" (565) |
| Qin ministers | `QIN_MIN_A/B/C` | Qin | charcoal `#4a4652` robes, gold sash, black gable caps (kit `officerCap`); A: long grey beard, B: full black beard, C: thin moustache. C is also the official at the map (12b-15) | 「秦国大臣」 / "Qin's ministers" (600, in 8a) |
| the usher 傧 | `QIN_USHER` (`qinUsher`) | Qin | a minister's charcoal robe with a gold-edged black sash, black gable cap, clean-shaven, young | none (a functionary, like the guards) |
| Qin guards | `QIN_GUARD` (guardL), `QIN_GUARD_B` (guardR, then guardC) | Qin | charcoal armour, ochre sash, grey helmets, halberds, Hongmen's `guardOf` pattern | none |
| Zhao ministers | `ZHAO_MIN_A/B` | Zhao | grey-green `#8f9e8c` robes, teal sash, black caps (one `scholarCap`, one `flatCap`), beards | 「赵国大臣」 / "Zhao's ministers" (330, in 5a) |
| the servant 随从 | `SERVANT` -> `SERVANT_ROUGH` | Zhao | small (0.9), short robe: pale teal-grey `#a9b8b0`, then ROUGH BROWN hemp `#8a6a48` with a cloth bundle (`bundle`) and a brown head-cloth: the only brown figure | 「随从」 / "his servant" (1320) |

Rules of the rig that drive every staging decision (Hongmen section 4 holds; the new ones first):
- NO TWO-HANDED OVERHEAD HOLD. Arms are 0.40 m (the king 0.43), hands reach about 1.35 m (kneeling 0.97). "Holding
  the jade over his head" = ONE hand (his left, hand 1) up beside the head gripping the disc's bottom edge, so its top
  stands above the head line. The other hand hangs.
- NO SEATED LEAN. Seated figures use `state.seat` {top, back, floor} on the 榻: legs fixed by the seat, torso turn at
  most 20 deg, pitch a fixed 3 deg. Sitting forward = `seat.back` -0.10; "leaning out" = a held partial rise
  (`seated(s, t, {rise})`, proven by `rig.qa` in WP1b; kit request 9). Lounging = facing +0.35, `seat.back` +0.06, a
  hand pinned on the 凭几, head tilt 6 deg (箕踞 legs are impossible).
- RIG FIELDS ONLY. A wince = `blink` + `head.dy` -0.03; shrinking = `head.dy` -0.03; a slump = `head.dy` -0.04 +
  `lookDown` 10 + hands to the lap; a coil before a swing = head tilt + `head.dy` -0.02. "Palm out / open hand / empty
  hands" = a hand pinned at a computed point (hands are 4.6 cm balls). No whole-figure squash, no lean on a walk.
- WOMEN: the rig has no female face. The ladies read as women by hair, colour, size and the blush of `smile_closed`;
  if the line-up fails, WP4 adds a film accessory with two lash strokes and a lip dot (an `Acc` with `face`).
- SWAPS instead of animated accessories (Hongmen's LIU_PRIVY pattern): `LIN` <-> `LIN_RAGE` <-> `LIN_OFFICIAL`,
  `SERVANT` -> `SERVANT_ROUGH`. A swap lands on a word with a head pop (1.12 / 1.06 / 1.02 on three frames) or a puff.
- Faces look at the camera; "looks at X" = `gaze`, head tilt and the body's facing (within 45 deg of the camera
  where possible). A facing 115-170 deg from the camera is forbidden; `turn: 1` = a true back view (no face). Walking
  away from the lens toward the king (8a, 10a), the usher's bow (17a) and the exit (22) are back views.
- Mouths move ONLY inside a character's own quote (`speak(quote(who, line), f, id)`, which returns mouth / head /
  blink): the envoy at lines 6, 9, 11, 14, 18, 19; the King of Qin at 12 and 21. 万岁 is the `laugh` face, no lip-sync.
- The bow (拱手) = Hongmen's `salute(k, p, facing)`; seated it reads as `sit`, so a seated bow = hands pinned together
  at the chest + `lookDown` 18. Kneeling = Hongmen's `kneel(k, p, deg)` (sinks 0.38 through `at`). Guards: idle, walk,
  wave, point, cheer only.

## 6. Running devices

1. THE JADE IS THE CHIP (the motif instead of a counter). Whose hands it is in, in picture AND in a small HUD chip.
   In picture: the jade (kit `bi`, scale 1.5: Ø 0.255 m, white jade `#eef1e4`) is the brightest object of every frame
   it is in; every hand-over gets a `glint` and a soft `ting`; it never floats (always in a hand, in a lap, on its
   23b stand, or hidden in the servant's coat), and there is never more than one.
   The chip (`hud/chip.tsx`, a registered HUD): top right, centre (882, 262): a 72 px jade disc icon and under it the
   holder in 36 px (English labels at most 9 characters). It pops (scale 1.25 -> 1, 6 frames) on each change:

   | from | holder zh / en | why |
   |---|---|---|
   | 0-189 | (hidden: the hook, the whip, the flashback's first beats) | frame 0 stays clean; shot 3 staggers its arrivals |
   | 190 | 赵王 / Zhao king | 秦王开价 (the offer is for HIS jade) |
   | 472 | 门客 / envoy | 我把玉 (he holds it from shot 6) |
   | 533 | 秦王 / Qin king | 接过玉 |
   | 570 | 美人 / ladies | 传给美人们 |
   | 730 | 秦王 / Qin king | lady A gives it back (王授璧) |
   | 752 | 门客 / envoy | 玉一到手 (the hand-over lands 748-751 at the end of 9) |
   | 1367 | 随从怀里 / servant | 揣着玉 |
   | 1595 | 赵国 / in Zhao | 玉已经到赵国了: the reveal (the chip waits for it) |

   Around the callback the chip and the source tag fade out 846-851 and back in 925-931 (no pop on the return); off on
   shots 1 and 11 (`hud: false`); faded out 2084-2089 for a clean end.
2. NAME TAGS: once per role at the first real appearance, 30-36 frames, near the head, never in the caption band,
   never across a cut (Hongmen's `placeTags`). Plates: QIN = charcoal `#36323d` with a gold name; ZHAO = teal `#2f8f8a`
   with a cream name. The envoy gets three plates (frame 0, 5b, 23b with the flip). The King of Qin is on screen from
   frame 0 but tagged at 148 (open question).
3. IDIOM STAMPS (red seal, cream characters, 36-40 frames): 「完璧归赵」 476-508 (33: declared short, the whip follows),
   「怒发冲冠」 806-842, 「价值连城」 1940-1975. English: the same seal with a white 44 px gloss under it: "return the jade
   intact" / "hair lifting his hat" / "worth a string of cities" (open question).
4. THE SOURCE TAG 「《史记》」 / "Records of the Grand Historian": top left, fading in 174-181, to 2083; faded around 11
   with the chip. No chapter name (it carries 廉颇 / a name in English).
5. THE OPENING SHOT RETURNS: shot 11 is `CAMS.hook` posed by the shared `hookPose(w, f, 852)`, so 852 = frame 0
   minus the subtitle and the tag; 10b is on the same axis 1.7x closer.
6. THE RHYME: shot 23a uses shot 3's camera (`zhaoThrone`): the same king, the same jade, the same arch of fifteen
   cities, which this time pops away to nothing.
7. THE FIFTEEN CITIES (section 7) appear at 3 (offered), 4 (ghosted), 8b (in his thought bubble), 12 (on the map),
   23a (vanishing). The same icon every time.
8. THE FIVE SUNS: five sun icons at line 14 (斋戒五天) come back as the day-tick of line 17 (五天后).
9. THE FLASHBACK CUE for viewers with the sound off: 「此前」 / "EARLIER" and a sepia rewind tint on the 2 -> 3 whip.

## 7. Props and overlays

World props (`w.prop(name).put(at, opts)`; `beginFrame` hides them all):

| Prop (`PropName`) | Built from | Size and look | Where |
|---|---|---|---|
| `jade` 和氏璧 | kit `things.ts bi`, `scale: 1.5` | Ø 0.255, hole Ø 0.072, white jade; grips `rim` (one hand at the bottom edge), `pair` (hands at ±0.12 on the rim) | everywhere until 1371; 23a; 23b on its stand |
| `jadeStand` | NEW `props/things.ts` | a small black-lacquer stand 0.20 wide holding the disc upright | 23b at `ZHAO.jadeStand` |
| `mapScroll` | NEW `props/map.ts` (hook prop, `open` 0..1) | a top roller fixed to the stand's bar and a bottom roller (0.95 long, Ø 0.04, dark wood, gold caps); `open` drops the bottom roller from 0.10 to 0.60 below the bar; pale silk `#efe4c8`, blue-grey rivers, dotted border, the west grey-black (Qin), the east teal (Zhao), 15 dots in the Qin part; `MAP_CITIES` = their points in the prop's axes | 12b-15 |
| `cauldron` 汤镬 | kit `things.ts ding`, `scale: 1.8` | 0.97 high, r 0.49, bronze; steam is 2D | 19-22 |
| `officialCap` | NEW `props/things.ts` | `scholarCap`'s silhouette as a prop (a black board 0.22 x 0.30 on a band, gold band) | 23b, king -> envoy at `capPass` about 2050, hidden on 2061 |
| set pieces | `sets/hall.ts`, `sets/zhao.ts`, `sets/road.ts` | 榻 + cushion, 凭几, screens, daises, pillars, map stand, ceremony banners (kit `banner`), mat runner, drum; the Zhao 榻 and lattice window; the gate, wall, ridge | section 3 |
| accessories (not props) | NEW `acc/`: `envoyCap({ lift })`, `rageHair()`, `mianCrown()`, `ladyBun()`, `whisk()`, `bundle()`, `headCloth()` | section 5 | |

Overlays (2D on 1080 x 1920, `hud/`; plain functions of the frame; every string `L(zh, en)`):

| Overlay | Used for | Notes |
|---|---|---|
| captions | every line | Film.tsx; line 1 is ONE two-row group shown from frame 0 (the frame-0 subtitle) |
| `tag` / `tags` | section 5 | copied from Hongmen, camps `qin` / `zhao`, `flipAt` (23b), the chip's corner added to the keep-out rects |
| `stamp` + `gloss` | three idioms; the bill's two 「0」 | lands with a shake; English gloss wraps at 16 letters |
| `chip` | the jade holder | HUD, section 6 |
| `cities` | 15 walled-town icons, 60 px, gold outline, black roofs | `arch`: x = 110 + 630 i/14, y = 240 + 70 (2i/14 - 1)^2, overlapping, drawn left over right, the right end at 770 px (clear of the chip, under the source tag); `ghost` (dashed, 30 %); `vanish` (pop out one by one); `map` (screen points the shot gives); `bubble` (5 icons) |
| `army` | line 4 | three rows of eight black pawn icons (70 px) sliding in from the left edge, a thump per row, y 640-900 |
| `arrow` + seal | line 4 (「秦」/"QIN"), 16b (「赵」/"ZHAO") | dotted gold arrow, Hongmen `arrow` |
| `mark`, `ring` | 「?」 5a, 「!」 18b (gold, 150 px); `ring`: a gold circle round a world point (9: the "flaw") | |
| `shout` | 万岁 (8a) | zh: two bursts 「万岁！」 (596, 604); en: ONE burst in two rows "LONG LIVE / THE KING!" |
| `bubble` | 8b thought bubble | the container is Hongmen's `hud/inset.tsx` |
| `stage` | lines 13-14 (V3) | outside a soft circle (r = 0.55 m projected) the picture darkens 45 %; a pale light cone from the top edge; red-and-gold curtain swags in the top corners; drops on 在 (1077), slides to the envoy 1094-1102, lifts on 我才交 (1225-1235). The only overlay bridging a cut besides the HUD (13 -> 14) |
| `suns` | 14 (pop over the envoy, slide to the king), 17 (the day-tick at the top centre) | 64 px suns, grey -> gold |
| `crowns` | 18a | 22 tiny flat-crown icons in two rows of 11 (y 300-420), then a red ✗ ripples across them |
| `bill` | 22 (V6) | a panel of bamboo slats bound by two cords (竹简), each row on one wide slat (written across for reading), slides up (y 230-640): 「账单」/"THE BILL"; 「秦 → 赵　十五城」/"Qin → Zhao: 15 cities" + 「0」; 「赵 → 秦　和氏璧」/"Zhao → Qin: the jade" + 「0」 |
| `label` | 「此前」/"EARLIER" 172-199 | cream, 56 px, centre (540, 300) |
| `fx` | `glint`, `burst`, `streak` (+ `tint`, the sepia rewind of 2 -> 3), `puff`, `rage`, `steam`, `sweat` (2), `glow` (the servant's chest 1368-1419), `smear` (the gold arc of the strike, 98-104 and 894-902), `panic` (short strokes at the king's hands in 1, 2, 11) | Hongmen's segA_ov family moved into `hud/fx.tsx`; never in the caption band |
| source tag | top left | HUD |

## 8. House rules for the picture (Hongmen section 9, adapted)

1. Nothing that matters in the caption band (62-78 %), below 84 %, above 11 %, or under the app rail (x > 930, y > 900).
2. No clipping: run the clearance checker; read `rig.qa` (`reach`, `clear`) on every pinned hand (the frame-0 raise,
   the king's hook hands, the hand-overs at 533, 570, 730, 750, 1362, the map roller at 976, the grab at 1751, the
   cap at 2050).
3. No flicker: no per-frame noise, no hairline geometry; the kit's ink pass; steam, light and panic strokes are 2D.
4. Each place has its own figure light; the three baked values equal Hongmen's `BAKED_LIGHT` (bleach 0.7, bodyShadeK
   0.4, contact `#8a93c2`). The hall is dark but the figures are not: a warm key from the upper left, the gold screen
   and the red pillars as the only saturated planes. The black robes (`#36323d`) never go pure black.
5. RED belongs to the pillars (and the idiom seals). No red robe, no red runner. TEAL belongs to Zhao.
6. Text in the picture: Chinese in the loaded font, digits only in 「0」; English through `L()` (section 7).
7. One action per caption group, landing ON the group's first frame (1-2 frames early is fine, never late).
8. Deterministic: a pose is a pure function of the frame; any frame can be the first of a render chunk (never read
   `handWorld` before `w.update()`; pin hands to a computed point and put the prop at the same point).
9. Take every frame from `beats.ts` / `cap()` / `capWord()` / `line()` / `quote()`; the storyboard's numbers are for
   reading (they ARE the real voice, but a re-cut voice moves them).

## 9. Transition rules (Hongmen's twelve, adapted; builders must follow them)

1. MINIMUM SHOT LENGTH 18 frames, no exception (shortest planned: 18, shot 7a). `shotCheck()` fails the film otherwise.
2. FEW CUTS: 33 shots in 70.2 s (1.43 per line); prefer an eased move to a cut to a similar framing (3 -> its move to
   `zhaoKing`, 11's punch-in).
3. SIZE / ANGLE: between two shots of the same subject, size x1.6 or angle 30 degrees, else no cut. Axial cuts of 1.7x
   are allowed (5b -> 6, 10b -> 11) and keep the subject's head x within 5 %.
4. CUT ON ACTION: 2-4 frames after a movement starts; the eye's subject keeps its screen spot.
5. A PLACE OR TIME CHANGE IS DESIGNED, by one of three devices: (a) WHIP PAN with `streak`, 4 frames out + 4 in, the
   way of the map (section 2.1): 2 -> 3 (with the EARLIER label and tint), 6 -> 7a, 16b -> 17a (with the day-tick),
   22 -> 23a; (b) CUT ON CONTINUING MOTION: a figure leaves one side and enters from the other edge the same way:
   15 -> 16a (out right, in from the LEFT EDGE, not through the gate), 16a -> 16b (the servant); (c) RHYME: the same
   camera and composition at both ends of the film's arcs (1 / 11, 3 / 23a). Hongmen's flap and card wipes are unused.
6. SCREEN DIRECTION as section 2.1: Qin left, Zhao right; the king always left of the envoy.
7. A CUT BETWEEN LINES lands on the first syllable of the new line or 2 frames before it (segments start 2 frames
   before their first word). A cut inside a line is motivated by an action named in that line.
8. CAMERA MOVES ease in and out and last at least 10 frames; only a whip pan may start or stop hard, under its streak.
9. EVERY CUT AND TRANSITION HAS A SOUND (the storyboard names it).
10. Imagined things are WINDOWS or the graphic layer (the thought bubble of 8b, the suns of 14), never full-frame cuts.
    The flash-forward of lines 1-2 is the exception: it IS the moment of line 11, shown first.
11. Overlays never bridge a cut. Declared exceptions: the HUD (source tag, chip), the stage of 13 -> 14 (lifted inside
    14, so nothing crosses 14 -> 15).
12. A figure in two consecutive shots keeps its pose clock (time from the film frame), so a walk does not restart.

## 10. Looking at your work

3D stills through the queue at 540 x 960 (`bash scripts/kit/queue/still.sh src/videos/wanbi/preview/filmA.ts
/home/user/wanbi_work/<task>/ --pick F1,F2 --size 540x960`): these draw NO overlays (Hongmen `hud/sheet.tsx`). Any
still with captions, tags, stamps or the HUD (the owner's samples, the 852 = 0 diff) is a real film frame:
`bash scripts/kit/queue/remotion_still.sh WanbiFilm <frame> /home/user/wanbi_work/<task>/f.png`. One render at a time;
the queue is shared, so keep to each package's still budget (BUILD_PLAN). Open every still and judge it as a phone
viewer: who is who, where is the jade, is anything clipping, is anything in the caption band. Scratch files only under
`/home/user/wanbi_work/`, never in the repo.
