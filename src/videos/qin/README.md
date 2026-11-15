# QinFilm: the segment builder's contract

《采访秦始皇的一天》 (composition `QinFilm`, this folder). 1080 x 1920, 30 fps, `TOTAL` frames from the timing (4914
on the placeholder timing). The bible and the storyboard are `PLAN.md`: read section 7 for your scene. The engine is a
copy of Wanbi's. The long rules are the header of `story.ts` ("HOW TO BUILD A SEGMENT"); the World contract is the
header of `world.ts`. This page is the interface the four build lanes (skeleton, sets, cast/props/cam, HUD) left for
the segment builders (WP5), as checked on 2026-11-12. Open issues are in the last section.

Contents: 1 owners · 2 a segment · 3 the World · 4 places · 5 people · 6 props · 7 her camera (`cam.ts`) ·
8 beats and lookups · 9 the shared verbs (`shots/common.ts`) · 10 the HUD · 11 picture rules · 12 checks ·
13 open issues.

## 1. Who owns what

You edit only your own files. When you need a change in a file you do not own, append a request to
`/home/user/qin_work/requests.md` with your lane name and work around it in your own file.

| owner | files |
|---|---|
| WP1 skeleton | `story.ts`, `voice.ts` and `captions.ts` (GENERATED: never edit them, never copy a number out of them), `captions_en.ts`, `beats.ts`, `lang.ts`, `world.ts`, `layout.ts`, `layout/base.ts`, `layout/hall.ts`, `sets/index.ts`, `Film.tsx`, `kit.json`, `kit.world.ts`, `preview/*` (except the three WP3 previews and `set_places.ts`), `scripts/qin/gen_timing.py` |
| WP2 sets | `sets/<place>.ts`, `sets/parts/*`, `layout/<place>.ts` (corridor, terrace, table, night, road, museum), `preview/set_places.ts` |
| WP3 cast, props, camera | `people.ts`, `acc/*`, `props/*`, `cam.ts`, `preview/people_lineup.ts`, `preview/props_sheet.ts`, `preview/cam_test.ts` |
| WP4 HUD | `hud/*` |
| WP5 segments | one `shots/segX.ts` each. `shots/common.ts` is shared and ADDITIVE ONLY: add a verb, never change one, and say in requests.md what you added |

Never edit `src/kit`, `src/videos/group/kit`, `vasa/ bt/ arthur/ hongmen/ wanbi/`, `scripts/kit`, `scripts/rig3d`,
`scripts/arthur`, `scripts/hongmen`, `scripts/wanbi`: import from them, copy into `qin/` when a file needs changes. No
media in the repo; every picture, log and scratch file goes under `/home/user/qin_work/<lane>/`. Never touch
`render.json` / `blender.json`. No commit, push or branch.

## 2. A segment

```ts
// shots/segX.ts
import { SEGMENTS, line, capWord, quote, FPS, type Segment } from "../story";
import { BEAT, placeAt } from "../beats";
import * as C from "../cam";                         // a namespace: cam.ts's whip clashes with shots/common.ts whip
import { EMPEROR, emperorAt, type EmpState } from "../people";
import { CORRIDOR, CX } from "../layout";
import { CORRIDOR_CAMS } from "../layout/corridor";  // the named cameras are NOT re-exported by layout.ts (yet)
import { lid, swaps, speak, standing } from "./common";

const S = SEGMENTS[0];                                // A = 0 ... G = 6
export const SEG: Segment = { id: "A", from: S.from, to: S.to, enter() {}, exit() {}, pose: (w, f) => { ... } };
```

`SEG.id / from / to` must equal `SEGMENTS[i]` (Film.tsx throws otherwise). `pose(w, f)` is a PURE function of the
absolute film frame `f`: any frame can be the first one a page renders (stills, farm chunks). It sets everything it
relies on, on every frame, and takes time from `f`, never from `w.t`. No `Math.random`, `Date` or `performance.now` in
anything that reaches pixels: use `rng(seed)` / `hash(i, k)` from `story.ts`.

The engine, per frame: `w.beginFrame(f)` (every figure hidden, every prop hidden, every set param back to its default)
-> `P = SEG.pose(w, f)` -> `w.endFrame(P)` (camera, `set.setView`, `set.animate(P.clock ?? f / FPS, f)`, `w.update()`
if the shot did not call it). Then Film.tsx draws the HUD, `P.overlays`, the caption, `P.top`.

## 3. The World (`world.ts`), in this order inside `pose`

```ts
w.setPlace("corridor");                               // FIRST. One place shows; the figures take its light
w.setPlace("night", { light: { gain: 0.78 } });       // optional: lay CastLight fields over the place's figure light
w.set.param("dawn", 0.8);                             // the place's dressing for this frame (section 4)
w.setCamera(cam);                                     // a CamPose (section 7); also return it as P.camera
const r = w.actor(EMPEROR);                           // a figure (created once, then the same one); hidden unless set
r.set({ at, facing, pose: { kind: "idle", t: f / FPS }, expr: "stern", gaze, turn, hands, seat, hide, visible: true,
        ...speak(quote("di", "A03"), f, 1) });
w.actor(GUARD, "2").set({ ... });                      // a second figure of the same Person: a key
w.update();                                           // solves the figures; r.handWorld(i), r.headWorld() valid after it
w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot });   // props: every frame, after update when held
const p = w.project(r.headWorld());                   // -> { x, y, z, front, on } in 1080 x 1920 px
return { camera: cam, overlays, post, rec, cards, hud, captions, clock, focus, slate };
```

- `w.set.getParam(name)` reads a param back; `w.look()` the place's look; `w.M` bt/pbr materials and `w.root` for a
  segment's own meshes (rare: prefer props); `pt(w, p)` (world.ts) = `{ x, y }` on screen.
- `set.param` throws before `setPlace`, on an unknown name and on a value of the wrong kind (number / string / boolean).
- Figures stand on y 0 on every floor (the museum's camera walkway is the only raised floor: `MUSEUM.walkTop`).
- Conventions: metres, y up, facing 0 = toward +z (the camera side in most places), PI/2 = toward +x; the person's
  LEFT is +x at facing 0; arm 0 = the person's right hand.

## 4. The places

Each place is an island along x (`layout.ts ISLAND`: hall 0, corridor 100, terrace 200, table 300, night 400, road 500,
museum 600). Marks and numbers: `layout.ts` (re-exports `X_SET` and `X` for every place, `QHALL`, `HALL`, `HALL_SET`,
`HALL_CAMS`, `EYE` 1.55, `FOV` 64, `SCREEN`, `STAND`, `eyeCam`, `camOf`, `islandOf`). The named cameras `X_CAMS`, the
stand-ins `X_STAND`, `museumMark` are in `layout/<place>.ts` (import them from there).

| place | scene | params (default) | marks (`layout.ts`) | named cameras (`layout/<place>.ts X_CAMS`) |
|---|---|---|---|---|
| `corridor` (x 100) | A | `dawn` 0..1 (0.5): the sun's strength and warmth | `CORRIDOR.start`, `peekPillar`, `hide` (her spot behind it), `emperor` (6 m ahead), `walkOff`, `junction`, `sideEnd`, `pillarZ(k)`; `CORRIDOR_SET.bay` 2.4 | `creep`, `peek`, `follow`, `junction` |
| `hall` (x 0, Wanbi's) | B, C, E | `ceremony` 0..1 (0), `mapStand` (false) | `QHALL.desk`, `deskTop` 0.42, `sit` (= `deskSeat(QHALL.desk)`), `scale`, `slips[3]`, `door`, `xufuKneel`, `asideWall`; Wanbi's `HALL.*` | Wanbi's `HALL_CAMS` (built for Wanbi; use your own `eyeCam`s) |
| `terrace` (x 200) | D | `carriages` 0..1 (1 = 14 carriages on the road below, 0 = 3, 0.2 = 5), `wind` 0..1 (1) | `TERRACE.emperor` (at the parapet), `attendants[5]`, `guard`; `TERRACE_SET.parapet` (inner face z -3.0, top 1.0) | `stand`, `wide`, `parapet`, `attendants` |
| `table` (x 300) | C flashback, E | `tableau` "sea" / "taishan" / "xiangshan" ("sea"), `bolt` 0..1 (0: flies to 0.55, hit, starburst, fish belly-up), `hat` 0..1 (0: the hat pops onto the pine, 0..0.35), `rain` 0..1, `storm` 0..1, `bare` 0..1 (trees go, the earth turns red), `pieces` 1 / 0 (1; 0 hides the set's own fish, bolt, hat and boat) | `TABLE.top`, `shore` (tiny emperor with the crossbow), `fish`, `tree`, `shelter`, `shrine`, `boat`, `behind` (where HE stands behind the table); `TABLE_SET.table.top` 0.86 | `over`, `close`, `mini`, `across` |
| `night` (x 400) | F | `moon` 0..1 (1) | `NIGHT.emperor`, `guards[4]`, `bandits[3]`, `duck` (her spot behind the rock); `NIGHT_SET.rock`, `path`, `pond`, `lanterns` | `stand`, `duck` (eyes 0.95 m), `pond`, `moon` |
| `road` (x 500) | G | `flies` (false: draws nothing, the props draw the flies), `heat` 0..1 (1: mirage and haze) | `ROAD.carriage`, `curtain` (the window, 1 cm outside), `officials[4]`, `fishCart`, `rack` (top middle of the carriage's rear rack), `lifters[2]` | `stand`, `creep`, `curtain`, `rack` |
| `museum` (x 600) | G end | `light` 0..1 (1) | `MUSEUM.walkTop` 2.2 (her floor), `grid[24]` / `museumMark(file 0..3, rank 0..5)` (4 x 6 marks for TERRACOTTA figures, facing 0), `dage` (大哥's spot), `facing` | `rail`, `rows`, `wide` (all on the walkway: `eyeCam(..., 64, WALK)`) |

What the sets draw and what you put:

- TABLE: the set draws its own tableau pieces (the coast fish and bolt, the 泰山 pine and hat, the 湘山 forest, shrine and
  boat). Drive them with params. If a shot wants WP3's prop fish / bolt / hat / boat / tree instead, set
  `pieces: 0` first. Never both. The tiny emperor on the tableau is yours (a scaled figure or a prop).
- TERRACE: the set draws the procession far below. Do not put the small `carriage` prop on the terrace.
- ROAD: the set draws the environment only. Put `bigCarriage` at `ROAD.carriage`, `fishBasket`(s) at `ROAD.rack`, and
  `fishCart` at `ROAD.fishCart` in every road shot (`preview/props_sheet.ts` view "road" and `preview/set_places.ts`
  do it). The flies are the props' `put({ on: true })`.
- MUSEUM: the first 6 ranks of the middle corridor are EMPTY: put TERRACOTTA figures on `MUSEUM.grid` (and DAGE_CLAY on
  `MUSEUM.dage`). The set's own clay statues carry the rows on behind them.
- CORRIDOR: the lanterns are the set's own; the prop `lantern` is for other places.
- HALL: the desk, scale, slip towers and cushion are props on `QHALL` marks (section 6).

`STAND[place]` (layout.ts) is the WP1 stand-in staging (her eyes + the EMPEROR's mark and facing) the stubs use. It is a
block-out, not a shot camera. NOTE: `HALL_STAND` currently clips (section 13).

## 5. People (`people.ts`)

| key in `PEOPLE` | export | who |
|---|---|---|
| `emperor` | `EMPEROR` | 秦始皇, scale 1.08, resting face `stern`, black robe with red band and sash, crown, sword at the LEFT hip |
| `emperorBlush1`, `emperorBlush2` | `EMPEROR_BLUSH1` (0.45), `EMPEROR_BLUSH2` (0.9) | the same with a blush (swaps) |
| `emperorHood`, `emperorHoodBlush1` | `EMPEROR_HOOD`, `EMPEROR_HOOD_BLUSH1` | the night disguise: plain robe, hood, bead strings poking out |
| `xufu` | `XUFU` | 徐福, violet robe, tall cap, resting face `smug` |
| `boshi` | `BOSHI` | 博士, white beard, flat cap, `deadpan` |
| `huanguan` | `HUANGUAN` | 宦官 at the carriage curtain, `smile` |
| `guard` | `GUARD` | x4 (`w.actor(GUARD, "1")` ...), armour, halberd in hand 1 |
| `attendant` | `ATTENDANT` | x5, they kneel |
| `official` | `OFFICIAL` | x4, queue with slips |
| `bandit` | `BANDIT` | x3, masked |
| `terracotta` | `TERRACOTTA` | all-clay warrior, neutral |
| `dageClay`, `dageClayR` | `DAGE_CLAY`, `DAGE_CLAY_R` | 大哥 in clay: ALWAYS `expr: "hush"`, `pose: { kind: "shh" }` (`_R`: finger in the right hand, `pose: { kind: "shh", arm: 0 }`) |

Also exported: `SPEAKER_PERSON` (ji -> null: she is the camera, never a figure), `ALL_PEOPLE`, `NAMED`,
`EMPEROR_SWAPS`, `EMP_BY`, `COL` (the film's colours), `addPerson`, `blush`, `BLUSH`.

- Speakers (`voice.ts Speaker`): `ji` (her), `di` (the emperor), `xufu`, `boshi`, `huanguan`. A mouth moves only inside
  that speaker's own line: `...speak(quote("di", "A03"), f, id)`.
- Expressions: only `RIG_EXPRS` of `group/kit/rig3d.ts` (neutral, smile, happy, grin, laugh, smile_closed, relief, smug,
  deadpan, focus, stern, huff, sad, sigh, nervous, shock, dazed, pained, wince, sleep, cool, hush ...). startled = shock;
  rage (E07) = huff + a head shake (`accent("shake", f, on)`); tsundere = stern + EMPEROR_BLUSH1 (smile_closed draws its
  own blush: never with BLUSH2); cold menace (D05) = stern or cool, no blush; nodding off = sleep.
- Accessories hide by name (`state.hide`): `mianCrown`, `qinHood`, `hoodBeads`, `swordBelt`, `hilt`, `scholarCap`,
  `flatCap`, `roundCap`, `officerCap`, `helmet`, `halberd`, `topknot`, `headCloth`, `robe` / `armour` (the 3D skirt).
- His size: hand targets in HIS frame are x 1.08. Read world points back after `w.update()` (`headWorld`, `handWorld`).
- Guards: pin hand 1 with `halberdHand(p, facing, 1)` (shots/common.ts), never let it hang; keep them to idle, walk,
  point.
- Kneeling = `kneel(k, p)` (a sink); never show a kneeler's feet in close-up.

THE BLUSH / HOOD SWAP (a figure swap on a blink, never a fade):

```ts
const KEYS: [number, EmpState][] = [[S.from, "plain"], [capWord("A05", "帮").from - 3, "blush1"], [BEAT.A.blush, "blush2"]];
const r = w.actor(emperorAt(f, KEYS));                                // the figure that plays frame f
r.set({ ..., blink: lid(f / FPS, 1, swaps(KEYS)), visible: true });   // each change hides under a blink
```

Which level where (head of people.ts, "BLUSH SWAPS"): A06 blush1; A12 blush2, back to blush1 when his back is turned in
A13, plain by the cut; B07 plain, B09 blush1; C, D, E plain (D never); F01 hood, F05 hoodBlush1 (and
`hide: ["hoodBeads"]` from F05), F07-F09 hoodBlush1; G: voice only.

THE SWORD (`acc/sword.ts`; the gag of A04, his LEFT hand, arm 1):

```ts
import { swordDraw, hiltGrip, drawStand, swordAim, swordShoulder, DRAW } from "../acc/sword";
const D = swordDraw((f - BEAT.A.grab) / FPS, { at, facing, lens: v3(cam.pos) });
const r = w.actor(EMP);
r.set({ at: D.at, facing, pose: D.pose, head: D.head, hide: D.hide, expr, visible: true });
w.update();                                           // 1st solve: the hilt where his body is now
const hand = D.handAt(hiltGrip(r));
if (hand) { r.set({ hands: [null, hand] }); w.update(); }   // 2nd solve with the hand pinned
if (D.sword) w.prop("sword").put(r.handWorld(1), { grip: "hilt", rot: D.sword.rot });
// camera: handheld tremble scaled by D.shake; overlay: a smear of strength D.smear
```

His mark must be `drawStand(lens, toward)` (about 2.1 m from her lens) for the tip to stop 0.4 m from the lens
(`D.reachShort` 0 = it reaches). `swordAim(o, k)` lowers it (A10: k 0), `swordShoulder(o)` rests it on his shoulder
while he walks off (A13). DRAW's times (s from the start): reach 0.3, tug1 0.3, tug2 0.8, wind 1.3, free 1.42, shown
1.5, point 1.82. Seated at the desk: `hide: ["swordBelt", "hilt"]` and put the prop `scabbard` beside him. During the
tugs the hand sits about 1 cm inside the hilt's keep-out ball: an expected clearance report.

## 6. Props (`props/index.ts`)

`w.prop(name, key?).put(at, opts)`: every prop is hidden again at the next frame, so put it every frame. Without
`grip`, `at` is the prop's origin; with `grip`, `at` is the hand and the grip point is set on it.

| prop | origin / notes | put options |
|---|---|---|
| `sword` | middle of the grip, +y to the tip (1.375 m). Grip `hilt` | `rot` [rx, ry, rz] from swordDraw / swordRot |
| `scabbard` | middle of its mouth, runs down -y. Grip `hilt` | `on: false` = empty |
| `slips` | floor (or desk) under the tower's middle; one bundle runs along x. Grip `pair` (ends x +-0.12) | `n` 1..12 bundles |
| `scale` | floor under the post; the PAN hangs at +x | `tilt` (radians, + = pan end down), `rot: Math.PI` turns the pan toward the desk at `QHALL.scale` |
| `desk` | floor under its middle, long side along x; the sitter is at -z facing +z | `rot` |
| `cushion` | floor under its middle | `rot` |
| `brush` | middle of the shaft, +y to the tip. Grip `hilt` | |
| `inkstone` | on the desk under its middle | |
| `crossbow` | the rear grip, the stock along +z. Grips `grip`, `pair` (hand 0 rear, hand 1 0.28 m forward). The EMPEROR at facing 0: pair at (-0.18, 0.8, 0.18), rot 0.8 | `rot` |
| `bolt` | its middle, +y toward the head | `rot` |
| `seaChart` | middle of the top roller. Grip `pair` (x +-0.2) | `open` 0..1 |
| `fish`, `boat`, `tree`, `hat` | sand-table scale (use only with table `pieces: 0`) | `rot`, `scale` |
| `carriage` | small procession carriage (not on the terrace: the set draws those) | `rot` |
| `bigCarriage` | 辒凉车, ground under its middle, faces -z. Put at `ROAD.carriage` | `open` 0..1 (the +x curtain parts) |
| `fishCart` | the baggage cart with three baskets. Put at `ROAD.fishCart` | `on` = flies |
| `fishBasket` | r 0.25, 0.34 high. On the rack: `ROAD.rack` | `on` = flies |
| `halberd` | grip 0.95 m from the foot, +y up the pole. Grip `grip` (the guards' own are accessories) | |
| `knife` | bandit's knife, middle of the grip, +y to the tip. Grip `hilt` | |
| `railing` | museum railing section, 2 m along x | |
| `lantern` | the hook at its top. Grip `hook` | |

All options: `{ scale, rot (yaw number or [rx, ry, rz] Euler YXZ), grip ("hilt" | "pair" | "grip" | "hook"), open, tilt,
n, on }`. Helpers:

- `holdPoints(name, at, opts)`: the world points the holder's hands go to for that same put: pin the hands there,
  `w.update()`, then put the prop with the same `(at, opts)`.
- `deskSeat(QHALL.desk)` -> `{ at, facing, cushion, seat }`: the cushion's place and the RigSeat for `pose: { kind:
  "write" }` / `"sit"`.
  `const S = deskSeat(QHALL.desk); w.prop("desk").put(QHALL.desk); w.prop("cushion").put(S.cushion, { rot: S.facing });`
  `r.set({ at: S.at, facing: S.facing, seat: S.seat, pose: { kind: "write", t }, hide: ["swordBelt", "hilt"] })`
- `scalePan(QHALL.scale, tilt, Math.PI)`: where a bundle sits in the pan
  (`w.prop("slips", "pan").put(scalePan(QHALL.scale, 0.15, Math.PI))`).
- Sizes: `SWORD`, `DESK`, `SLIPS`, `SCALE`, `CHART`, `CUSHION`, `BIG_CARRIAGE` (window, rack), `FISH_BASKET`,
  `SCABBARD_LEN`; `PROP_INFO` describes each prop, `PROP_GRIP` / `PROP_HANDS` the grips.
- A hand of the rig is a ball 4.6 cm across with no fingers. Never read `handWorld` before `w.update()`.

## 7. Her camera (`cam.ts`)

She IS the camera: eyes at 1.55 m (`EYE`), the vlog lens fov 64 (`FOV`). Import it as a namespace
(`import * as C from "../cam"`): its `whip` is not the `whip` of `shots/common.ts`. Every function is pure (frame in,
pose out); the moves take a CamPose and return one, so they stack: `C.lower(C.dip(C.povCam(...), ...), ...)`.

```ts
// the base: keys + the handheld layer (mood "still" | "calm" | "excited" | "scared", walk 0..1 or keys)
const cam = C.povCam(f, [
  { f: S.from, ...CORRIDOR_CAMS.creep },
  { f: BEAT.A.peek, ...CORRIDOR_CAMS.peek, ease: easeOutCubic },
], { mood: [[S.from, "scared"], [BEAT.A.blush, "calm"]], walk: [[S.from, 1], [BEAT.A.peek, 0]] });
C.keyCam(f, keys)                      // keys only, no handheld
C.handheld(anyCam, f, { mood: "excited", walk: 1, amp: 0.6 })   // handheld on a camera from elsewhere (follow ...)
C.punchIn(cam, f, BEAT.A.punchIn, { k: 0.8, len: 5 })            // fov x 0.8 in 5 frames, ease-out (off: eases back)
const W = C.whip(camA, f, BEAT.C.whip - 4, { dir: 1, to: camB }); // { cam, post, smear, cut }
//   return { camera: W.cam, post: W.post, overlays: C.whipSmear(W.smear, 1) };   W.cut: show the next view's things
C.follow(f, (g) => walkAlong(PATH, 1.1, (g - t0) / FPS).at, { back: 1.8, side: 0.3 })   // behind a walker, lagging
C.dip(cam, f, BEAT.B.dip[0], BEAT.B.dip[1])                       // sinks 0.6 m, pitches down 12 deg, strains
C.duck(cam, f, BEAT.F.bandits, undefined, { to: 1.0 })            // drops to 1.0 m behind the rock (or NIGHT_CAMS.duck)
C.aside(cam, f, BEAT.C.aside, line("C08").to + 4, QHALL.asideWall) // swings to the wall, holds, swings back
C.creep(cam, f, BEAT.G.creep[0], BEAT.G.creep[1], 2.4)            // steady push (pair with mood "calm", amp 0.3)
C.leanStand(cam, { headY: 1.58 * 1.08 })                          // where he stands for his head to fill 60 % width
C.lean(cam, f, BEAT.C.lean, r.headWorld())                        // gives way 8 cm, his eyes in the upper third
const H = C.handCover(cam, f, BEAT.F.handCover[0]);               // { cam, cover }: overlays: C.palm(H.cover)
C.lower(cam, f, BEAT.G.lower, { to: 0.6, tilt: 8 })               // droops to 0.6 m, horizon tilts 8 deg
C.nudge(cam, { yaw, pitch, roll, right, up, fwd })                // turn / shift about the lens
```

Rules: never inside geometry (the handheld moves the lens up to 3 cm: keep 0.15 m from walls); his eyes in the upper
third (`SCREEN.eyes` y < 640); faces out of the caption band (y 1190-1498). In the museum pass `floorY:
MUSEUM.walkTop` to `duck` / `lower`. The museum (G07-G09) is her handheld again since v3 (mood "calm", REC on, one slow
continuous move, `museumCamAt` in segG.ts), and the film ends with her camera switching off (BEAT.G.offClick). The palm at cover 1 is
a dark warm brown (#2a1d19), never pure black. `shots/common.ts` adds `kick`, `shake`, `yawCam`, `whip` (a CamPose
whip, Wanbi's) and `eye` (a camera at her eyes, no handheld).

## 8. Beats and lookups (never type a frame number)

`story.ts`:
- `SEGMENTS[i]` `{ id, from, to, lines }`, `seg("C")`, `segmentAt(f)`, `TOTAL`, `FPS`, `W`, `H`.
- `line(n | "A03")` / `lineId("A03")` -> `{ from, to, pre, preFrom, after, who, text, scene }` (frames; `preFrom` =
  where its silent beat starts). `lineAt(f)`, `lineNo(f)`, `LINES`.
- `quote(who, id)` -> the Quote for `speak`; `quotesOf(who)`.
- `cap(id, k)` (caption group k of a line, negative k from the end; `.from` = its first syllable),
  `capWord(id, "拍").from` (the frame the word's first syllable starts, survives a regrouping), `capsOf(id)`,
  `captionAt(f)`.
- `CARDS`, `card("A01")` `{ from, to, text }`, `cardAt(f)`; `SCENE_TIME.A` ("卯时 05:00").
- `L(zh, en)` (`lang.ts`) for every on-screen string; `TXT` for shared ones.
- Easing and helpers: `clamp01, lerp, lin, smooth, smootherstep, ease*, spring, pop, between, rng, hash, since, h`.

`beats.ts`: `BEAT.X.name` (a number, or a `[first, last]` span), `TITLE_SPAN`, `placeAt(f)`, `SPANS`, `beatCheck()`.

| scene | beats |
|---|---|
| A | `creep` [ ], `peek`, `glance`, `turn`, `punchIn`, `grab`, `tugs` [4], `swordOut`, `swordStop`, `jab`, `tremble` [ ], `stepIn`, `lower`, `push` [ ], `blush`, `crown`, `walkOff`, `follow` |
| B | `enter`, `sit`, `thump`, `card` [ ], `dip` [ ], `smug`, `rise`, `blush`, `nod` [ ], `jerk` |
| C | `lean`, `whip`, `twoShot`, `stand`, `flash` [ ] (the table), `bolt`, `pop`, `aside`, `back`, `flustered` |
| D | `enter`, `nextDay` [ ], `fewCars`, `creep` [ ], `turn` [ ], `pan` [ ], `card` [ ], `lean` [ ], `tremble` [ ], `black` [ ] |
| E | `hall`, `toTable`, `taishan` [ ], `hat`, `xiangshan` [ ], `huff`, `bare` [ ], `back` |
| F | `hood`, `giggle`, `beads`, `bandits`, `clash` [ ], `straighten`, `glance`, `handCover` [ ], `black` [ ] |
| G | `creep` [ ], `queue` [ ], `fishCart` [ ], `lower`, `museum`, `voice`, `last`, `offClick`, `collapse` [ ], `dot` [ ], `black` |

`placeAt(f)` is the storyboard's place (C's table flashback is `BEAT.C.flash`, E's table runs `BEAT.E.toTable` to
`BEAT.E.back - 1`, G's museum from `BEAT.G.museum`). A segment may cut differently inside its own frames. A beat that is
not in beats.ts is derived in your own file the same way (`capWord`, `line().preFrom`, `+ Math.round(s * FPS)`).
The C07 / E07 cards run into the next line (section 13).

## 9. The shared verbs (`shots/common.ts`)

basics `V, v3, yawTo, wrapA, lerpA, lid, speak, accent, heads` · keys `at` (step), `ky` / `kv` (eased), `path`,
`swaps` · places `rel, hang, halberdHand, staged, headPx, kick, frag` · moving `walkAlong, walkTime, hopArc` ·
sitting `seated, lap, kneel, KNEEL_DROP, bow, salute` · crowd `stagger, alive` · verbs `headM, headPop, swapTo, clap,
yawCam, whip, shake` · staging `eye, standing, standIn`. The header of the file has a line per verb; segments are .ts
(no JSX): `frag(...)` joins overlay nodes, `h` (story.ts) is `React.createElement`.

## 10. The HUD (Film.tsx draws it; shots only switch it)

Film.tsx draws, in order: the HUD layer (`VlogHud`: REC dot + 时辰 timestamp + battery; every `registerHud`; and
`TitleCard`, `NextDayCard`, `FactCard`), then `P.overlays`, then the `Caption`, then `P.top`.

| Pose field | effect |
|---|---|
| `rec: false` | hides the REC dot and the timestamp (they are off by default where `placeAt(f)` is the museum) |
| `cards: false` | hides the fact card, the title card and 第二天 (and, once Film.tsx passes it on, the timestamp's big intro: section 13) |
| `hud: false` | hides the whole HUD layer (also registered HUDs) |
| `captions: false` | hides the caption on this frame |
| `overlays` / `top` | your own 2D nodes below / above the caption (1080 x 1920 px): `C.whipSmear`, `C.palm`, flashes, black |
| `post` | `{ dof, bloom, grade, gradeAmount, ink, ao, bg }` over the place's look (whip blur = `W.post`) |

- Cards come from `CARDS` (after their line), the title from `TITLE_SPAN`, 第二天 during `BEAT.D.nextDay`. Nothing to do.
- Keep faces out from under the HUD: `hudRectsAt(f)` (hud/index.ts) lists the boxes the HUD takes on frame f (REC row,
  the timestamp or its big intro, battery, card, title, 第二天). `SCREEN` (layout.ts): nothing that matters above y 210,
  in the caption band 1190-1498, below 1613, or at x > 930 for y > 900; the fact card owns y 300-560 while it shows.
- The timestamp's big intro covers x 56-750, y 270-342 for the first 56 frames of every scene and of 第二天.
- Numbers behind the HUD for a shot that wants to match them: `batteryAt(f)`, `recAlpha(f)`, `timeStampAt(f)`,
  `factCardAt(f)`, `capRows`, `capPx`, `SPEAKER_COL`, `HC` (palette), `SAFE`.
- Captions: no box; ji warm white, di pale gold, the others white; at most 14 characters a row, two rows.
- A black frame for a cut (D's `black`, F's `black`) is an overlay of the film's darkest warm tone, not `#000`, and it
  must not flash: fade it in and out over 3 or more frames unless it hides a hand-over-lens cut.

## 11. The picture rules (Jay's)

- No clipping (穿模): run the clearance checker on your segment before every render.
- No flashing black lines, black frames or colour blocks.
- Figures are not over-exposed under the set light.
- Captions have no background box.
- Figures keep moving: never a frozen figure for long (`alive`, `standing`, idle poses with `t`).
- A face never turns to profile (FACE_MAX 12 deg): turning away = a body turn or back view (`turn: 1`), the gaze, a
  head tilt.
- Details polished; one or two long takes per shot, the cuts hidden in whips, black frames and the hand over the lens.

## 12. Checks

1. After every edit: `bash scripts/kit/tsc.sh --film qin` must say 0 errors. Files not in kit.json's list are checked
   by naming them: `bash scripts/kit/tsc.sh --film qin src/videos/qin/shots/segA.ts src/videos/qin/cam.ts`.
2. Before rendering a changed shot: `bash scripts/kit/qa/clearance/run.sh --film qin --seg X --out
   /home/user/qin_work/<lane>/clearance` (about 15-50 s a segment, no GPU, no queue). It exits 0 even when it finds
   something: read the `== ON SCREEN` section of `<out>/X.txt`. `--from F --to G`, `--step 3` narrow it.
3. Stills ONLY through the queue, 540 wide, a few frames, outputs under `/home/user/qin_work/<lane>/`:
   - `bash scripts/kit/queue/still.sh src/videos/qin/preview/filmX.ts /home/user/qin_work/<lane>/ --pick F1,F2 --size 540x960`
     the 3D picture only (absolute film frames; prints `QA: BEATS ok`).
   - `bash scripts/kit/queue/remotion_still.sh QinFilm <frame> /home/user/qin_work/<lane>/fNNNN.png` the real frame
     with HUD and caption (about 90 s each while another job runs).
   - Previews: `preview/set_places.ts` (every named camera of every place, `--opts '{"views":["road.curtain"]}'`),
     `preview/people_lineup.ts` (`{"who":"swaps","view":"34"}`), `preview/props_sheet.ts` (views small, big, use,
     hold, arms, road), `preview/cam_test.ts` (whip and dip frames).
   - Long commands (> 100 s) in the background with a log you poll. The machine has 4 CPUs and is shared: never
     bypass the queue.
4. Timing: `python3 scripts/qin/gen_timing.py --placeholder` (placeholder, 4.6 characters/s) or
   `python3 scripts/qin/gen_timing.py /home/user/qin_work/voice/voice_timing.json` (the real voice) regenerate
   `voice.ts` and `captions.ts`; every beat follows. `voice.ts VOICE_SOURCE` says which is in: "placeholder" now.
   `beatCheck()` (beats.ts) must return [].
5. On a moving shot, the shimmer test: `python3 scripts/kit/qa/shimmer/shimmer.py run src/videos/qin/preview/filmX.ts
   /home/user/qin_work/<lane>/shimmer --frame F`.

## 13. Open issues (integration check, 2026-11-12)

**Update (2026-11-13, voice v2):** the owner heard lines cut off and whispering. All seven scenes were re-voiced with
normal-volume directions in `qin_lines.json` (no quiet / soft / low / whisper tags) and cut again with the new
`scripts/qin/voice/cut_lines.py`: each line is cut in the silence between lines (energy in 10 ms frames), placed by the
Whisper word times when the take has them (farm `"words": true`) and by the ElevenLabs alignment otherwise, keeping
50 ms before the first and 120 ms after the last loud frame; pauses inside a line over 0.4 s are shortened to 0.4 s.
It writes `line_cuts.json` (cut, kept span, edge level per line) for `assemble.py`. Gap between lines 0.04 s, D01
`pre` 0.2 s (room for D's lead cut), cards hold their own time (`card_hold`). TOTAL is now 5616 frames = 187.2 s:
A 0-1110, B 1111-1863, C 1864-2586, D 2587-3119, E 3120-3899, F 3900-4555, G 4556-5615.

**Update (2026-11-13, v3 from the owner's review):** B09 keeps one 留着 (`trim`), G02/G03 are SILENT lines (`"silent": s`
in qin_lines.json: the span stays for the action, no voice, no caption; the eunuch nods), A05's offer comes during the
stuck sword (four tugs, the blade rings free on 住口), the miniature emperor's ink outline follows his scale
(`miniature()` in people.ts: the rig's outline width is in metres), the museum moves, the camera switches off at the
end, and the mix has a cue per scene (scripts/qin/sound/cues.json, voice farm run qin-sfx-02; the switch-off sound is
synthesised by scripts/qin/sound/make_poweroff.py: `make_poweroff.py 0.30 0.90 <clips>/sfx_poweroff.mp3`). TOTAL 5606 frames = 186.9 s: A 0-1110, B 1111-1841,
C 1842-2564, D 2565-3097, E 3098-3877, F 3878-4532, G 4533-5605.

**Update (22:45 UTC, after the check):** the REAL voice timing is in (`VOICE_SOURCE` real, `TOTAL` 5297 frames =
176.6 s). Segments: A 0-1050, B 1051-1798, C 1799-2477, D 2478-2951, E 2952-3660, F 3661-4231, G 4232-5296. Fixed
since the check: Film.tsx passes `cards={P.cards}`; the C07 / E07 cards no longer run into the next line (C07 after
0.5 s, E07 after 0.35 s); kit.json's tsc list includes `cam.ts` and the WP2/WP3 previews. Frame numbers quoted
below are from the placeholder timing: look them up again with the lookups. Fact-check changes (史记): C's flashback is
the COAST (he waits on the shore at 之罘 with the repeating crossbow; no boat); G04 = 「丞相瞒住了消息，百官每天照样往车里递
奏章」 (the officials do NOT know he is dead); G05 = 「他们就往车上装了咸鱼，盖住味道」 (baskets of salted whole fish set ON the
carriages; no separate cart rolling in; not abalone).

The list with owners is the integration report (`/home/user/qin_work/check/`). The ones a segment builder must know:

- CLIPPING in the stand-in: `HALL_STAND.emperor` (z -3.46, facing 0) puts his scabbard 1.9 cm into the hall's dais on
  every hall frame of the B, C and E stubs. Your hall staging must keep his back 0.62 m or more from the dais front
  (z >= -3.38 at facing 0) or hide `["swordBelt", "hilt"]` when he sits.
- `layout.ts` does not re-export `X_CAMS`, `X_STAND` or `museumMark`: import them from `layout/<place>.ts`.
- `Film.tsx` does not pass `P.cards` to `VlogHud` yet, so `cards: false` does not stop the timestamp's big intro.
- (fixed in v3: segA runs its own struggle through A05; `BEAT.A.swordStop` is the tip's arrival, 0.35 s after the ring.)
- The C07 fact card overlaps the first words of C08 (8 frames) and E07's ends on E08's first frame (voice lane).
- The C07 card (frames 2011-2082 on the placeholder timing) covers the WHOLE table flashback (`BEAT.C.flash`
  2025-2070), and the E07 card covers `BEAT.E.bare`: on those table frames keep every face out of y 300-560 (the stand-in
  camera puts his head right under the card).
- The terrace's `stand` camera (= `TERRACE_STAND.cam`) shows a 10-20 px sliver of the eave's dark red edge along the
  top of the frame: with the handheld sway it would crawl in and out. Aim a little lower, or bring the eave clearly in.
- `MUSEUM_STAND.cam` stands 2.15 m behind the railing, so the handrail cuts across the middle of the frame and a rail
  post runs through the caption band: for G07 use `MUSEUM_CAMS.rail` (0.6 m behind it, the rail in the lower third).
- The stubs (`shots/segX.ts`) show the place and a standing EMPEROR only (crown on, even at night and in the museum):
  no carriage or fish on the road, no figures in the museum grid, no guards, no table pieces beyond the tableau. That is
  the WP5 work.
