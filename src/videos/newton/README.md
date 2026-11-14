# NewtonFilm: the segment builder's contract

《跟着牛顿过一天》 (composition `NewtonFilm`, this folder). 1080 x 1920, 30 fps, `TOTAL` frames from the timing (5258 =
175.3 s on the placeholder timing; the real voice will change it: never copy a number). The bible and the storyboard
are `PLAN.md`: read section 7 for your scene, and the script's stage directions
(`/mnt/project-files/next-video/newton/script_v4/script_v4.md`). The engine is a copy of Qin's (`src/videos/qin/`).
The long rules are the header of `story.ts` ("HOW TO BUILD A SEGMENT"); the World contract is the header of
`world.ts`; the place contract the header of `sets/index.ts`. This page is the interface the four build lanes
(skeleton WP1, sets WP2, cast / props / camera WP3, HUD WP4) leave for the segment builders (WP5), as checked by the
integration check on 2026-11-13. Open issues are in the last section: read them before you start.

Contents: 1 owners · 2 a segment · 3 the World · 4 places · 5 people · 6 props · 7 her camera, mic and hands ·
8 beats and lookups · 9 the shared verbs (`shots/common.ts`) · 10 the HUD · 11 picture rules · 12 checks ·
13 open issues.

## 1. Who owns what

You edit only your own files. When you need a change in a file you do not own, append a request to
`/home/user/newton_work/film/requests.md` (lane, file, what, why) and work around it in your own file.

| owner | files |
|---|---|
| WP1 skeleton | `story.ts`, `voice.ts` and `captions.ts` (GENERATED: never edit them, never copy a number out of them), `beats.ts`, `lang.ts`, `world.ts`, `layout.ts`, `layout/base.ts`, `sets/index.ts`, `sets/blockout.ts`, `Film.tsx`, `kit.json`, `kit.world.ts`, `preview/*` (except the WP2 / WP3 previews), `scripts/newton/gen_timing.py`, this README |
| WP2 sets | `sets/<place>.ts`, `sets/parts/*`, `layout/<place>.ts` (stairs, room, garden, street, schools, elaboratory), `preview/set_places.ts` |
| WP3 cast, props, camera | `people.ts`, `acc/*`, `props/*`, `cam.ts`, `preview/people_lineup.ts`, `preview/props_sheet.ts`, `preview/cam_test.ts` |
| WP4 HUD | `hud/*` |
| WP5 segments | one `shots/segX.ts` each (today: the STUBS, section 2). `shots/common.ts` is shared and ADDITIVE ONLY: add a verb, never change one, and say in requests.md what you added |
| producer | `scripts/newton/voice/*` (the lines file, cut, assemble), `scripts/newton/sound/*`, farm, commits |

Never edit `src/kit`, `src/videos/group/kit`, `vasa/ bt/ arthur/ hongmen/ wanbi/ qin/`, `scripts/kit`, `scripts/rig3d`,
`scripts/arthur`, `scripts/hongmen`, `scripts/wanbi`, `scripts/qin`: import from them, copy into `newton/` when a file
needs changes. No media in the repo; every picture, log and scratch file goes under
`/home/user/newton_work/film/<lane>/`. Never touch `render.json` / `blender.json`. No commit, push or branch.

## 2. A segment

```ts
// shots/segX.ts
import { SEGMENTS, line, capWord, quote, card, FPS, type Segment } from "../story";
import { BEAT, placeAt, ASIDES } from "../beats";
import * as C from "../cam";                          // a namespace: cam.ts's whip clashes with shots/common.ts whip
import { NEWTON_INK, NEWTON_HIDE, HUMPHREY, newtonAt, laugh } from "../people";
import { STAIRS, STAIRS_CAMS, SCREEN } from "../layout";   // layout.ts re-exports every place's marks, cameras, stand-ins
import { speak, standing, saying, asideK } from "./common";
import { endBlack, setTitlePlace, hudRectsAt } from "../hud";

const S = SEGMENTS[0];                                 // A = 0 ... G = 6
export const SEG: Segment = { id: "A", from: S.from, to: S.to, enter() {}, exit() {}, pose: (w, f) => { ... } };
```

`SEG.id / from / to` must equal `SEGMENTS[i]` (Film.tsx throws otherwise). `pose(w, f)` is a PURE function of the
absolute film frame `f`: any frame can be the first one a page renders (stills, farm chunks). It sets everything it
relies on, on every frame, and takes time from `f`, never from `w.t`. No `Math.random`, `Date` or `performance.now` in
anything that reaches pixels: use `rng(seed)` / `hash(i, k)` from `story.ts`.

The engine, per frame: `w.beginFrame(f)` (every figure hidden, every prop hidden, every set param back to its default)
-> `P = SEG.pose(w, f)` -> `w.endFrame(P)` (camera, `set.setView`, `set.animate(P.clock ?? f / FPS, f)`, `w.update()`
if the shot did not call it). Then Film.tsx draws the HUD layer (registered HUDs, the title block, the fact card),
`P.overlays`, the subtitle, `P.top`.

THE STUBS (`shots/segA.ts` .. `segG.ts`, WP1 + the integration check) render the whole film end to end with the real
places, the real cast and her mic and hands. Each calls `standIn(w, f, {...})` (section 9): the place of the frame
(`placeAt`), a camera (`layout.ts STAND[place].cam` = WP2's `<PLACE>_STAND`, or the stub's own), NEWTON in the right
variant on the place's stand-in mark (HUMPHREY where the scene has him), each speaking only inside his own lines, the
place's params for the scene, and the mic held toward whoever speaks (round to the lens on the asides, out of the card
slot under a card: it is lowered out of frame). What each stub already shows (copy what you like, then replace the whole file):

| stub | shows |
|---|---|
| A | `STAIRS_CAMS.top` on NEWTON_INK in the doorway (door open, glow), the mic entering from the lower left and rapping on `STAIRS.knock` (`rapK`); `STAIRS_CAMS.door` square on the shut door with the TITLE BLOCK on it (`Pose.title` from `C.toScreen` of the door's upper half); HUMPHREY on the landing from the crack (a camera of its own) |
| B | the room at "morning" (`ROOM_CAMS.desk`), NEWTON_INK behind the desk, HUMPHREY at the window table until he goes, `dressRoom` (plate covered, then lid off + steam from `BEAT.B.lid`; drafts, inkwell, sheets, chair aside) |
| C | the room at "noon" (plate lid off), the garden at noon with NEWTON_GOWN_INK, the room again after `BEAT.C.whip` |
| D | the street (`STREET_CAMS.trot`, `STREET_CAMS.wipe` for the wipe) with `C.wipe` and the ink swaps on its strokes (`newtonAt`), the schools (`SCHOOLS_CAMS.lectern`) with NEWTON_GOWN, her lone clap (`C.clapHands`) |
| E | the room at "evening", NEWTON, the plate with the fly walking, two bites from `BEAT.E.twoBites` |
| F | the night garden (glow on), the elaboratory (fire 1, then 0.35 and the set candle 0.45 after `BEAT.F.timePass`), HUMPHREY_SOOT until `BEAT.F.sackOut`, the stool on `ELAB.stool` |
| G | the elaboratory (fire 0.35), `C.boardHold` over `BEAT.G.boardUp` (the mic out), THE LAUGH (`laugh(t)`) over `BEAT.G.laugh` .. `laughHold`, "smile" after, HUMPHREY_SOOT to the end of card 4; the room at "night" (three bites); the garden from the elaboratory door (`GARDEN_CAMS.window`) with his window lit until `BEAT.G.windowDark`; `endBlack` in `Pose.top` from `BEAT.G.black[0]` |

## 3. The World (`world.ts`), in this order inside `pose`

```ts
w.setPlace("room");                                   // FIRST. One place shows; the figures take its light
w.setPlace("garden", { light: { gain: 0.9 } });       // optional: lay CastLight fields over the place's figure light
w.set.param("hour", "evening");                       // the place's dressing for this frame (section 4), BEFORE update
w.setCamera(cam);                                     // a CamPose (section 7); also return it as P.camera
const r = w.actor(NEWTON);                            // a figure (created once, then the same one); hidden unless set
r.set({ at, facing, pose: { kind: "idle", t: f / FPS }, expr: "deadpan", gaze, turn, hands, seat, hide: NEWTON_HIDE,
        visible: true, ...speak(quote("nt", "A02"), f, 1) });
w.update();                                           // solves the figures; r.handWorld(i), r.headWorld() valid after it
w.prop("plate").put(ROOM.plate, { lid: 0, steam: 1, t: f / FPS });   // props: every frame (section 6)
const M = C.putMic(w, cam, f, { aim: r.headWorld().add(V(0, -0.1, 0)) });  // her mic + hand, after update (section 7)
const p = w.project(r.headWorld());                   // -> { x, y, z, front, on } in 1080 x 1920 px
return { camera: cam, post: { dof: M.dof }, overlays, top, cards, hud, captions, clock, focus, title, slate };
```

- THE FIGURES' LIGHT FOLLOWS THE PLACE'S PARAMS: `w.update()` lays the place's `cast(t, f)` (its figure light for the
  current params and frame: the room's hour, the garden's night, the fire's flicker) over the place's look, then the
  `setPlace` light, then `BAKED_LIGHT`. Set every param before `w.update()`.
- `w.set.getParam(name)` reads a param back; `w.look()` the place's look; `w.M` bt/pbr materials and `w.root` for a
  segment's own meshes (rare: prefer props); `pt(w, p)` (world.ts) = `{ x, y }` on screen.
- `set.param` throws before `setPlace`, on an unknown name and on a value of the wrong kind (number / string / boolean).
- Figures stand on y 0 on every floor (the stairs: the landing at his door; the steps go down from it, tread k at
  `-k * 0.18`).
- Conventions: metres, y up, facing 0 = toward +z (the camera side in most places), PI/2 = toward +x; the person's
  LEFT is +x at facing 0; arm 0 = the person's right hand.
- `sets/index.ts` also exports `BAKED_LIGHT`, `PlaceLook`, `PlaceBuild` (`{ group, view?, animate?, setParam, cast }`),
  `PLACE_LOOKS`, `PARAMS`, `STUBBED` (empty: every place is WP2's real set), `NewtonSet`, `buildSets`.

## 4. The places (WP2)

Each place is an island along x (`layout/base.ts ISLAND`: stairs 100, room 200, garden 300, street 400, schools 500,
elaboratory 600). `layout.ts` re-exports, for every place, `<X>` (its x: `STX RMX GDX STRX SCX ELX`), `<PLACE>_SET`
(numbers), `<PLACE>` (marks), `<PLACE>_CAMS` (named cameras, all `eyeCam`s at her eyes unless noted) and
`<PLACE>_STAND` (the stand-in staging), plus `EYE` 1.6, `FOV` 62, `SCREEN`, `STAND`, `eyeCam`, `camOf`, `islandOf`,
`V`, `c`, `TaSeat`, `PAD_TOP`. PLAN 1 says what each place must show; the `sets/<place>.ts` headers say what the set
draws. Every place has `<PLACE>_LOOK`, `<PLACE>_PARAMS`, `build<Place>(K)` in `sets/<place>.ts`.

| place | scenes | params (default) | marks (`<PLACE>.`) | named cameras (`<PLACE>_CAMS.`) |
|---|---|---|---|---|
| `stairs` (x 100) | A | `door` 0..1 (0; 1 = swung inward), `glow` 0..1 (0: his candle light under / through the door) | `door` (the doorway's middle in the wall plane), `doorway` + `doorwayFacing` (-PI/2: NEWTON on the threshold facing the landing), `inside`, `hinge`, `leafW`, `knock` (where the mic raps), `sill`, `landing`, `humphrey` + `humphreyFacing`, `stairHead`, `step(k)` (tread k = 1 .. 11 down), `runFrom` / `runTo` (her run, her floor points) | `run` (two steps down, floor -0.36), `top` (head of the flight, about 2 m from the doorway: the stand cam), `door` (square on to the shut door: the title), `down` (down the flight: Humphrey goes), `low` (six steps down) |
| `room` (x 200) | B, C (plate, end), E, G | `hour` "morning" / "noon" / "evening" / "night" ("morning"), `door` 0..1 (0: the door to the stairs, left wall) | `windowTable` + `tableTop`, `plate` (in the noon bar shadows), `candle`, `humphreyTable` + `humphreyFacing` (PI: setting the dinner, back to her), `tableStand` + `tableFacing` (NEWTON eating standing, E / G), `desk` + `deskTop`, `newtonDesk` + `deskFacing` (0: behind the desk), `deskWrite` (his page, 0.36 m in front of him: in reach), `drafts`, `inkwell`, `chair` + `chairFacing` (the backs of his knees), `door`, `doorIn`, `hinge`, `leafW`, `middle` | `plate` (the insert, fov 50), `desk` (about 2 m: the stand cam), `wide` (table and desk: the pull back), `door` (B08), `window` (E, G: the plate framed right), `drafts` (B11), `chair` (C06: from the bookcase corner, lens 1.45 m, looking down at `ROOM.chair`; NEWTON at the left edge) |
| `garden` (x 300) | C, F start, G end | `time` "noon" / "night" ("noon"; night = a blue moonlit mid-tone), `glow` 0..1 (0: the elaboratory's door gap, window and chimney), `window` 0..1 (0: his first-floor window lit) | `stairDoor` / `stairDoorIn` + `stairFacing` (PI/2), `window` (his window's glass), `elabDoor` / `elabIn`, `cross` (C19: he stops dead), `loop` (the perimeter walk, 4 corners), `walkFrom` / `walkTo` (C16-19), `runFrom` / `runTo` (C19-20: to his door), `night` (F: 5 points, his door -> the elaboratory), `sundial` | `walk` (backwards in front of him down the east walk: the stand cam), `turn` (C19), `stairDoor` (C20), `follow` (F01 behind his candle), `elab` (F01 end, its door), `window` (G end: from the elaboratory door to his window), `wide` |
| `street` (x 400) | D start | none | `gateIn`, `gate`, `turn`, `walkTo`, `path` (his walk: gate passage -> arch -> turn -> down the street toward her), `lineX` (his walking line), `kennelX`, `footW`, `footE` | `gate`, `trot` (beside him, three-quarter front: the stand cam), `wipe` (close beside him, his face about 0.9 m away), `street`, `back` |
| `schools` (x 500) | D | `dust` 0..1 (1: the motes in the sunbeam) | `lectern`, `lecternTop` (his notes), `newton` + `newtonFacing` (0: behind the lectern), `door`, `entry`, `aisleX`, `rows`, `rowL(k)` / `rowR(k)`, `beamFloor` (the sun's patch), `clap` (where she claps) | `wide` (THE WIDE HOLD from the door), `door`, `lectern` (about 2.2 m: the stand cam), `benches` (D27), `beam`, `clap` (D28) |
| `elaboratory` (x 600) | F, G | `fire` 0..1 (1 = roaring, 0 = deep red embers, never out), `candle` (1 = the set candle full; 0 = a stub; < 0 hides it, for when he takes his own) | `furnaceDoor`, `fire`, `stool` + `stoolFacing` (WP3's stool by the fire door), `newtonFire` + `newtonFireFacing` (-1.15: staring into the fire), `humphreyShovel` + `humphreyFacing` (-2.4: toward the fire door), `charcoal`, `charcoalBite`, `bench`, `benchTop`, `book` (the set's open mouldy book), `candle`, `door`, `doorIn`, `doorOut`, `doorFacing`, `middle` | `enter`, `wide` (the stand cam), `stool` (F41-44, him SEATED: the push-in starts), `push` (F50: where it stops), `board` (close on the board on his knee, fov 50), `fire` (fov 50), `door` (G: the door on the blue night, Humphrey in it), `bench` |

- What the sets draw (never put a prop over it): the window table, desk (with its paper piles, three shut books on the
  left pile and an open book at the back), benches, lectern, master's chair, the elaboratory's furnaces, bellows,
  vessels, charcoal heap, the open mouldy book and its own candle. The plate, chair, quill, his candle, board, stool,
  sack, poker, shovel, notes, sheets, drafts and inkwell are WP3 props on these marks (section 6).
- The light: each place's `cast()` follows its params (room by hour, garden by time, elaboratory by fire with a flicker
  driven only by t). The night garden is a blue mid-tone; the elaboratory lights faces warm from the fire door.
- Every stand camera puts NEWTON's eyes (1.14 m over his floor on the scale-1 figure) in the upper third: they look
  down noticeably. Each layout file has a local `third(cx, cz, x, z, eye?)` for the look height.
- `STAND[place]` (layout.ts) = WP2's `<PLACE>_STAND`: `{ cam, newton, facing, humphrey?, humphreyFacing? }`. It is a
  block-out, not a shot camera.

## 5. People (`people.ts`, WP3)

| export | who |
|---|---|
| `NEWTON` | 43, scale 1.0, resting face deadpan: a round head, his own long grey hair (`locks`), the morning bird's nest (`nest`), the quill behind his ear (`earQuill`), dark brown coat over a darker waistcoat, the white falling band, dark breeches, grey stockings |
| `NEWTON_INK` | the same with the blue-black ink smear across his nose (A until D's wipe) |
| `NEWTON_GOWN`, `NEWTON_GOWN_INK`, `NEWTON_GOWN_SMUDGE` | under the black academic gown (outdoors in C and D, the lecture); with the ink; with the ghost after her first stroke |
| `HUMPHREY` | early 20s, scale 0.95, round face, short brown hair, a plain mid-brown coat, small white collar; resting face neutral (A, B, E) |
| `HUMPHREY_SOOT` | the same with soot on a cheek, brow, chin and coat (F, G) |

Also: `NEWTON_BY` / `newtonFor({ ink, gown })` (the figure for a state), `newtonAt(f, keys)` (which Newton plays frame
f: keys `[frame, "plain" | "ink" | "gown" | "gownInk" | "gownSmudge"][]`), `NewtonState`, `NEWTON_HIDE` (=
`["earQuill", "nest"]`) / `newtonHide({ quill, nest })`, `HUMPHREY_BY`, `laugh(t, { amp, fade })`, `PEOPLE`,
`PersonKey`, `SPEAKER_PERSON` (`ji: null, nt: NEWTON, hm: HUMPHREY`), `ALL_PEOPLE`, `NAMED`, `NEWTON_SWAPS`, `COL`,
`addPerson`, `miniature`, `blush`, `BLUSH`. Accessories in `acc/newton.ts`: `coat`, `band`, `gown`, `locks`, `nest`,
`earQuill`, `inkSmear(k)`, `soot(k)`.

- Which Newton where: A `NEWTON_INK` with the quill and the nest; B, C room `NEWTON_INK` + `hide: NEWTON_HIDE`; C
  garden and D street `NEWTON_GOWN_INK` until the wipe, then (keys on `C.wipe(...).strokes`) `NEWTON_GOWN_SMUDGE`,
  `NEWTON_GOWN`; D schools `NEWTON_GOWN`; E, F, G `NEWTON` + `hide: NEWTON_HIDE`. Every figure carries the quill and the
  nest: hide them everywhere but A. A drawing change (ink, gown, soot) is a figure SWAP (one shown, the others hidden):
  hide it under a cut, a blink (`lid(t, id, swaps(keys))`) or her handkerchief.
- THE LAUGH (G53): `r.set({ ...laugh((f - BEAT.G.laugh) / FPS), ... })`: expr "laugh", the mouth wide / half on every
  "ha" (7 frames), the head shaking (about 2.2 a second, 7 deg) and bobbing; `fade` 0..1 eases it out. After it:
  "smile" (or "smile_closed": eyes shut, a smile, a blush). It reads at quarter-screen size.
- Speakers (`voice.ts Speaker`): `ji` (her: she SAYS her lines in Chinese; the camera, never a figure), `nt` and `hm`
  (they say theirs in English). A mouth moves only inside that speaker's own line: `...speak(quote("nt", "A02"), f, 1)`;
  `saying("nt", f)` (shots/common.ts) = the quote being said at frame f, or null. HUMPHREY speaks only A05 and B01.
- Expressions: only `RIG_EXPRS` of `group/kit/rig3d.ts`. Newton: deadpan (rest), focus (writing), stern (cold
  answers), sigh, sad (49-51), laugh, smile. Humphrey: neutral, shock (startled), sleep / sigh (+ mouth "round": the
  yawn). Faces never turn to profile (FACE_MAX 12 deg).
- Read world points back only after `w.update()` (`headWorld`, `handWorld`, `faceYaw`).

## 6. Props (`props/index.ts`, WP3)

`w.prop(name, key?).put(at, opts)`: every prop is hidden again at the next frame, so put it every frame. Without
`grip`, `at` is the prop's origin; with `grip`, `at` is the HAND and the grip point is set on it. `PROP_INFO[name]`
describes each one (origin, axes, sizes); `PROP_GRIP` / `PROP_HANDS` the grips; `holdPoints(name, at, opts)` the world
points the holder's hands go to (pin them, `w.update()`, then put the prop with the same `(at, opts)`);
`propPoint(name, at, opts, local)`. Size constants: `PC, PLATE, flyAt, QUILL, INK_BOTTLE, SHEET, DRAFTS, NOTES, BOOK,
OLD_BOOK, CANDLE, candleTop, CHAIR, STOOL, SACK, SHOVEL, POKER, BOARD, boardDrawing, CRUCIBLE, FLASK, BELLOWS, MIC, HAND,
INK_NEAR`.

| prop | notes (origin) | put options |
|---|---|---|
| `plate` | THE DINNER: pewter plate r 0.13 with a chop, a roll, peas (on the table under its middle). Grip `pair` | `bites` 0..3, `lid` 0..1 (1 on, 0 off, between = lifted), `steam` 0..1, `fly` 0..1 (its place on its walk; leave it out = no fly), `t` |
| `lid` | the domed cover alone (middle of its rim). Grip `knob` | |
| `fork`, `knife` | middle of the handle, +y to the tip. Grip `hilt` | |
| `quill` | where the fingers hold it, +y up the feather. Grip `hilt` (hide `earQuill` when it is in his hand) | |
| `inkwell` | on the desk under its middle (`ROOM.inkwell`) | |
| `inkBottle` | Humphrey's empty bottle (under its middle). Grip `grip` | |
| `sheets` | loose written sheets fanned (on the desk: `ROOM.deskWrite`) | `n` 1..6 (3) |
| `drafts` | THE DRAFTS, a hand's breadth thick (`ROOM.drafts`) | |
| `notes` | the lecture notes with a red tape (its middle). Grip `grip` (its +x edge: under his arm) | |
| `books` | shut books stacked askew | `n` 1..4 (3) |
| `oldBook` | a mouldy open book (on its bench, spine along z): the elaboratory set already draws one on `ELAB.book` | |
| `candle` | in a pewter chamberstick (under the saucer). Grip `grip` (the ring) | `len` 0..1 (stub .. new), `lit`, `t` |
| `chair` | the plain chair (floor under the seat; the back at -z). Grip `rail` (her hand drags it) | `rot` |
| `stool` | three legs, seat r 0.16 at 0.42 m (`ELAB.stool`) | `rot` |
| `handkerchief` | the wad's pinch. Grip `pinch` (cam.ts `wipe` puts it, at `WIPE.cloth` scale) | `scale` |
| `sack` | hessian (floor under its middle). Grip `neck` | `full` 0 / 1, `slump` (dropped, lumps spilled) |
| `shovel` | the grip (handle middle), +y to the blade. Grips `grip`, `pair` (0.3 m apart) | `load` |
| `poker` | under the ring, +y to the tip. Grip `grip` | `hot` 0..1 |
| `board` | 0.42 x 0.31, his charcoal figures on its +z face. Grips `edge`, `pair`. On his knee: `rot [-PI/2 - 0.3, facing, 0]` (reads upright to `ELAB_CAMS.board`) | `rot` |
| `charcoal` | a stick, +y to the worn tip. Grip `hilt` | |
| `crucible`, `flask`, `bellows` | (bellows grip `pair`) | `hot` (crucible), `open` (bellows) |
| `mic`, `hand`, `handR` | HER mic and hands: placed by cam.ts only (section 7) | `rot` (a quaternion), `pose` "grip" / "open", `scale` |

All options: `{ scale, rot (yaw | [rx, ry, rz] Euler YXZ | THREE.Quaternion), grip, t, bites, lid, steam, fly, len, lit,
full, slump, n, load, hot, open, pose }`. A hand of the rig is a ball 4.6 cm across with no fingers. `dressRoom(w, f,
plate, { chair })` (shots/common.ts) puts the room's standard dressing in one call.

## 7. Her camera, her mic and her hands (`cam.ts`, WP3)

She IS the camera: eyes 1.6 m (`EYE`), lens fov 62 (`FOV`). It moves because HE moves: the default mood is "still" (NO
breathing sway); a light handheld only with `walk` (her walking 0..1, 1.5 = a trot). Import it as a namespace
(`import * as C from "../cam"`). Every function is pure (frame in, pose out); the moves take a CamPose and return one,
so they stack.

```ts
const cam = C.povCam(f, [{ f: S.from, ...GARDEN_CAMS.walk }, { f: BEAT.C.stop, ...GARDEN_CAMS.turn, ease }], { walk: [[S.from, 1], [BEAT.C.stop, 0]] });
C.keyCam(f, keys) / C.handheld(cam, f, { mood, walk, amp })     // the two halves of povCam
C.follow(f, (g) => walkAlong(GARDEN.loop, 1.1, (g - t0) / FPS).at, { back: -1.8 })   // back < 0: she walks BACKWARDS in front of him
const W = C.whip(camA, f, BEAT.C.whip - 4, { dir: 1, to: camB });   // { cam, post, smear, cut }: the whip IS the cut (C)
C.creep(cam, f, BEAT.F.push[0], BEAT.F.push[1], dist)            // THE SLOW PUSH-IN from 44 to the end of 50
C.punchIn, C.dip, C.duck, C.aside, C.lean, C.leanStand, C.lower, C.handCover, C.nudge({ yaw, pitch, roll, right, up, fwd })
C.whipSmear(k, dir), C.palm(cover)                               // overlays
```

THE MIC (a red-foam windscreen, black handle) and HER LEFT HAND (mustard jacket cuff) are 3D props attached to the
camera, so they take the place's light and the lens blur. Put them AFTER `w.update()` (they aim at points on figures):

```ts
const M = C.putMic(w, cam, f, {
  aim: r.headWorld().add(V(0, -0.1, 0)),   // a world point it is held toward (the speaker's mouth, STAIRS.knock), or "lens"
  lens: asideK(f),                         // 0..1 toward the ASIDE pose (the head turned to the lens; ease the swing, ~8 frames)
  enter: 1,                                // 0 = out of frame at the lower left .. 1 = in place (it enters on that diagonal)
  rap: C.rapK(f, [k0, k0 + 7]),            // the head pushed out to touch `aim` on each strike (A's knock)
  tilt: 12,                                // degrees: the head dipped toward something low (B11 the drafts)
  avoid: cardAt(f) ? SCREEN.card : undefined,   // slides right out of the fact card's slot while a card shows
});
return { camera: cam, post: { dof: M.dof } };   // the aside's dof: focus on the mic head (~0.39 m), he goes soft
```

- Where it sits: at rest the red head's centre is at about 335 / 1048 px (r 94 px, bottom edge 1142); it follows the aim
  sideways (x 230..640); the aside pose is 520 / 1004 (r 136). The head's bottom edge never comes below y 1190
  (`MIC_FRAME.band`, `SCREEN.mic`). So the head covers y ~950..1140: frame faces higher (eyes in the upper third).
- `C.micPose(cam, f, o)` = the same without putting it: `{ mic, hand, head, headPx, dof, visible }`.
- HER RIGHT HAND (`handR`): `C.freeHand(cam, grip, { bar, palm, pose, side })` at any world point;
  `C.chairDrag(cam, chairAt, yaw)` (C06: the hand on the chair's top rail; the shot moves the chair; use
  `ROOM_CAMS.chair`: from `ROOM_CAMS.desk` the rail is out of her reach);
  `C.wipe(cam, f, C.noseOf(rig, scale), on)` (D: in from the lower right, two strokes across his nose, out; 30 frames;
  `{ hand, cloth, strokes: [s1, s2] }`: put `handR` with `scale: W.hand.scale` and `handkerchief` with
  `scale: W.cloth.scale`, swap his ink figure on the strokes; use a close camera such as `STREET_CAMS.wipe`: the hand
  goes wherever the nose is);
  `C.boardHold(cam, f, { k, px, py, depth, tilt })` (G: the board upright to the lens, about 85 % of the width: `board`,
  `hand` = right -> prop `handR`, `handL` = left -> prop `hand`; the mic out of shot);
  `C.clapHands(cam, f, ons)` (D: `{ mic, hand, handR }`: the open right hand on the back of the mic hand).
- Screen helpers: `C.camFrame`, `C.toScreen(cam, p)`, `C.fromScreen`, `C.camToWorld`, `C.worldToCam`, `C.camAxes`,
  `BODY` (her shoulders, reach 0.64 m), `ARM`, `MIC_FRAME`, `WIPE`.
- `shots/common.ts` adds `kick`, `shake` (impacts move objects, never the whole frame: use them on objects' shots
  only), `yawCam`, `whip` (a CamPose whip, Wanbi's) and `eye` (a camera at her eyes, no handheld).

## 8. Beats and lookups (never type a frame number)

`story.ts`:
- `SEGMENTS[i]` `{ id, from, to, lines, what }`, `seg("C")`, `segmentAt(f)`, `TOTAL`, `FPS`, `W`, `H`.
- `line(n | "A03")` / `lineId("A03")` -> `{ from, to, pre, preFrom, after, who, zh, en, text (= zh), spoken, scene }`
  (frames; `preFrom` = where its silent beat starts). `lineAt(f)`, `lineNo(f)`, `LINES`. Script line numbers ("44-50"
  in PLAN 7) are the line numbers: `line(44)` = F09.
- `quote(who, id)` -> the Quote for `speak` (`text` = the words SAID: zh for ji, en for nt / hm); `quotesOf(who)`,
  `QUOTES`.
- `cap(id, k)` (screen k of a line, negative k from the end; `.from` = the frame its first spoken token starts on;
  `.zh`, `.en`), `capsOf(id)`, `captionAt(f)`.
- `capWord(id, word).from` = the frame the word starts on, in the language the line is SPOKEN in: Chinese characters for
  a ji line (`capWord("A01", "好")`), English words for an nt / hm line (`capWord("F14", "burn")`,
  `capWord("C04", "is")`, `capWord("G02", "use")`). A Chinese word on an English line throws.
- `CARDS`, `card("A03")` `{ from, to, zh, en }`, `cardAt(f)`; `TITLE_BLOCK` `{ from, to, zh, en, subZh, subEn }`;
  `SCENE.F` `{ time: "夜", en: "Night", place }`; `TITLE`, `SUBTITLE`.
- `L(zh, en)` (`lang.ts`) for every on-screen string; `TXT` (`title`, `subtitle`, `titleZh/En`, `subtitleZh/En`,
  `source`) for shared ones.
- Easing and helpers: `clamp01, lerp, lin, smooth, smootherstep, ease*, spring, pop, between, rng, hash, since, h`.

`beats.ts`: `BEAT.X.name` (a frame, or a `[first, last]` span), `TITLE_SPAN`, `ASIDES` (the six: A03 A06 B09 D01 D05
E07, each `[from - 8, to + 8]`), `PLATES` (the five plate inserts with their hour), `placeAt(f)`, `SPANS`, `shotAt`,
`beatCheck()`.

| scene | beats |
|---|---|
| A | `run` [ ], `knock` (好), `doorOpen` [ ], `goodNight`, `doorShut`, `glowOut`, `title`, `aside03` [ ], `card1` [ ], `humphreyOut`, `humphreyShuts`, `micHumphrey`, `laugh`, `headShake`, `humphreyDown`, `aside06` [ ] |
| B | `plate` [ ], `lid`, `pullBack` [ ], `dinner`, `humphreyGoes`, `micDoor`, `micBack`, `micDrafts`, `apple`, `aside15` [ ], `card2` [ ] |
| C | `plate` [ ] (noon, in the room), `garden`, `walk` [ ], `stop`, `turn`, `run`, `whip` (the cut to the room), `chair`, `wave`, `emptyChair` |
| D | `street` [ ], `wipe` [ ], `wipe2`, `schools`, `wide` [ ], `aside23` [ ], `notes` [ ], `aside27` [ ], `lecture` [ ], `timeCut`, `clap` [ ], `dont` |
| E | `fly` [ ], `step`, `bite1`, `bite2`, `twoBites`, `look`, `hooke`, `aside35` [ ] |
| F | `walk` [ ] (the night garden), `inside`, `card3` [ ], `sackOut`, `timePass`, `board` [ ], `push` [ ] (from 44 to the end of 50), `poke`, `spit`, `silence` [ ], `poke2` |
| G | `strike1`, `strike2`, `board`, `boardUp` [ ], `laugh`, `laughHold` [ ], `sackDrop`, `card4` [ ], `goodNight`, `lastLine`, `room`, `card5` [ ], `outside`, `windowDark`, `black` [ ] |

`placeAt(f)` is the storyboard's place: A stairs; B room; C room (the noon plate) -> garden (`BEAT.C.garden`) -> room
(`BEAT.C.whip`); D street -> schools (`BEAT.D.schools`); E room; F garden at night -> elaboratory (`BEAT.F.inside`);
G elaboratory -> room (`BEAT.G.room`) -> garden at night (`BEAT.G.outside`). A segment may cut differently inside its
own frames. A beat that is not in beats.ts is derived in your own file the same way (`capWord`, `line().preFrom`,
`+ Math.round(s * FPS)`). `D.wipe` is 0.75 s while `C.wipe` takes 30 frames (1 s): start it on `BEAT.D.wipe[0]` and
read the strokes from its result.

## 9. The shared verbs (`shots/common.ts`)

basics `V, v3, yawTo, wrapA, lerpA, lid, speak, accent, heads` · keys `at` (step), `ky` / `kv` (eased), `path`,
`swaps` · places `rel, hang, halberdHand, staged, headPx, kick, frag` · moving `walkAlong, walkTime, hopArc` ·
sitting `seated, lap, kneel, KNEEL_DROP, bow, salute` · crowd `stagger, alive` · verbs `headM, headPop, swapTo, clap,
yawCam, whip, shake` · staging `eye, standing, saying, STAND_IN, asideK, cardLower, standMic, dressRoom, CHAIR_ASIDE,
standIn`.
The header of the file has a line per verb; segments are .ts (no JSX): `frag(...)` joins overlay nodes, `h` (story.ts)
is `React.createElement`.

- `asideK(f, len = 8)`: 0..1 into an aside (`ASIDES`), easing in over its first `len` frames and out over its last.
- `cardLower(f, len = 8)`: 0..1 how far her mic is lowered under a fact card (nobody speaks: out over the card's first
  8 frames, back over its last 8).
- `standMic(w, cam, f, { nt: rig, hm: rig }, o)`: the mic toward the mouth of whoever speaks (her own lines and the
  silences: `o.listener`, default nt), `lens: asideK(f)`, lowered out of frame under a card (`enter: 1 - cardLower(f)`,
  `avoid: SCREEN.card` while it goes); `o` overrides any MicO field. Returns the MicPose (put `dof` in `Pose.post`).
- `dressRoom(w, f, plate, { chair })`: the plate on `ROOM.plate` in its state, the drafts, inkwell and sheets on the
  desk, the chair at `CHAIR_ASIDE` (0.55 m to his left of `ROOM.chair`, clear of his coat) or at a point you give, or
  none (`chair: false`).
- `standIn(w, f, { place, cam, params, newton, newtonAs, humphrey, humphreyAs, mic, extra, after, slate })`: the stubs'
  staging (section 2). `extra` runs before `w.update()` (props), `after` after it (hands, held things).

## 10. The HUD (`hud/`, WP4; Film.tsx draws it, shots only switch it)

Film.tsx draws, in order: the HUD layer (`<VlogHud f rec={P.rec} cards={P.cards} />`, every `registerHud`, then
`<TitleCard f at={P.title} />` and `<FactCard f />`), then `P.overlays`, then `<Caption f />`, then `P.top`.
`import { ... } from "../hud"` (hud/index.ts re-exports everything).
HER CAMERA'S RECORDING UI (`hud/vlog.tsx`, Jay 14 Nov; PLAN 5): the REC lamp (1 Hz, soft) and "REC" top left (row
y 204, x 50..183, y 184..224), the scene's timestamp under it (「清晨 05:00」 / EARLY MORNING: on every scene's FIRST
FRAME it slides in 1.5x big over x 50..394, y 242..353 at most while the clock runs on from the last scene's time, holds
to 1.6 s, then shrinks to x 50..281, y 234..309 at most for the rest of the scene; each scene's own box:
`stampRect(id, big)`, e.g. F at rest x 50..200, G big x 50..348), the battery top right (x 845..1038, y 182..226; drains
with the clock, red at 2 a.m.). Her camera switches off on `OFF_AT` (`BEAT.G.cameraOff`, frame 5211 = G to - 1.4 s, 12
frames after the last pluck): the lamp dies, the whole UI goes grey (battery emptied) and holds still for 24 frames
until the end black (`BEAT.G.black[0]` = OFF_AT + 24). KEEP FACES (skin; hair is fine) OUT OF THE TWO TOP CORNERS
(`VLOG_RECT.rec`, `.stamp`, `.battery`, and the big intro box `.stampBig` during a scene's first 2 s) for the WHOLE
scene, push-ins included; reframe rather than switch the UI off (the owner wants one fixed layout; a lamp that
vanishes mid-scene reads as the camera stopping). `cards: false` (skips the big intro) only as a last resort.

| Pose field | effect |
|---|---|
| `title` | where the title block sits on this frame: `{ x, y, scale, rot }` (centre px, deg); fields left out come from `setTitlePlace` / the frame's centre. segA's stub lines it up with the shut door |
| `cards: false` | hides the fact card and the title block on this frame, and skips the timestamp's big intro |
| `rec: false` | hides her camera's REC lamp and the timestamp on this frame (the battery stays, still) |
| `hud: false` | hides the whole HUD layer (the vlog UI and registered HUDs too) |
| `captions: false` | hides the subtitle on this frame |
| `overlays` / `top` | your own 2D nodes below / above the subtitle (1080 x 1920 px); the end black goes in `top` |
| `post` | `{ dof, bloom, grade, gradeAmount, ink, ao, bg }` over the place's look (the asides: `dof` from putMic) |

- SUBTITLES (`hud/caption.tsx`): one screen at a time (the lines file's `screens`): Chinese 66 px on one row, centred
  on y 1318, English 36 px under it, no box, a dark outline on its own layer (zh 5.5 px, en 3.5 px) and a soft shadow;
  tints ji warm white `#fff3e0`, nt pale gold `#ffdf8e`, hm white. Long rows shrink (to 53 px) to stay on one row inside
  x 50..925; English over 800 px wraps to two rows. 3-frame fades at the start and end of a run, none between screens.
  Line 01's screen shows from frame 0 (`capOn`). All text inside y 1277..1455 (`CAP_BAND` 1250..1500). Exports
  `Caption, capOn, capAlpha, capLayout, capRows, SPEAKER_COL, ZH_PX, EN_PX, ZH_MIN, ZH_Y, EN_Y0, EN_STEP, CAP_BAND,
  CAP_ROW`.
- FACT CARDS (`hud/card.tsx`): a cream paper slip (deckled, torn bottom, grain, shadow, tilted -2.2 deg), Chinese ink
  46 px (2-3 rows, at most 12 characters), English sepia 28 px under a rule; slot x 56..656, the slip's bottom edge on
  y 1195 (the tallest starts at about y 850); flutters in from the left over 8 frames, floats, slides out over 8.
  Exports `FactCard, factCardAt, factRows, factLayout, factRectAt, FACT_SLOT {35, 811, 677, 1216}, CARD_X, CARD_BOTTOM,
  cardTop, CARD_MAXW, CARD_ROW`.
- TITLE BLOCK (`hud/title.tsx`): 「跟着牛顿过一天」 96 px, an ivory double rule with a lozenge, 「1686年5月 · 剑桥三一学院」
  40 px and the English line 24 px, ivory paint on the dark oak; drops 46 px over 10 frames, one bounce, fades over
  its last 10, over `TITLE_SPAN`. Exports `TitleCard, setTitlePlace, titleRect, titleRectAt, TITLE_HOME, TITLE_RECT
  {125, 796, 955, 1086}, TitlePlace`.
- THE END and dips (`hud/end.tsx`): `endBlack(f, from, fade = 8)` (put it in `Pose.top`), `endBlackAlpha`,
  `dipAlpha(f, a, b, fade)`, `black(a)`, `<EndBlack>`, `<Black>`, `FADE_MIN` 3. The colour is the film's darkest warm
  tone `#140d09`, never #000; every fade is 3 frames or more.
- Keep faces (and the mic) out from under the HUD: `hudRectsAt(f)` (the subtitle's real box, the card, the title for
  that frame) and `hudHits(f, rect)`. `layout.ts SCREEN` holds the same boxes: `top` 150, subtitle band `capTop` 1250 ..
  `capBottom` 1500, `bottom` 1640, eyes above `eyes` 640, `card` {35, 811, 677, 1216}, `title` {125, 796, 955, 1086},
  the app rail right of `rail.x` 930 below `rail.y` 900, the mic's head bottom never below `mic` 1190 (`micRest`
  335 / 1048). Style helpers: `HC` (palette), `SAFE`, `textW`, `em`, `spanK`, `overlaps`, `turnedRect`, `Rect`.

## 11. The picture rules (Jay's)

- No clipping (穿模): run the clearance checker on your segment before every render.
- No flashing black lines, black frames or colour blocks.
- Figures are not over-exposed under the set light; every plate insert lit by its hour; the night garden a BLUE
  MID-TONE, not black; inside the elaboratory the firelight lights every face warm and mid-tone.
- Subtitles have no background box.
- Figures keep moving: never a frozen figure for long (`alive`, `standing`, idle poses with `t`); never a frozen hand.
- A face never turns to profile (FACE_MAX 12 deg): turning away = a body turn or back view (`turn: 1`), the gaze, a
  head tilt.
- Her camera's recording UI is in (Jay, 14 Nov); she is never seen (no mic, no hands: an invisible hand). Not this
  film: no separate time cards, no breathing camera, no "keep it / cut it" gag. Impacts move objects,
  never the whole frame; DEAD STILL on the laugh.

## 12. Checks

1. After every edit: `bash scripts/kit/tsc.sh --film newton` must say 0 errors. kit.json's list reaches Film.tsx (so
   every `shots/seg*.ts`, `hud/*`, `cam.ts`, the sets and the people) and the previews; a file outside it is checked by
   naming it: `bash scripts/kit/tsc.sh --film newton src/videos/newton/shots/segA.ts`.
2. Before rendering a changed shot: `bash scripts/kit/qa/clearance/run.sh --film newton --seg X --out
   /home/user/newton_work/film/<lane>/clearance` (about 105 s for the whole film, no GPU, no queue). It exits 0 even
   when it finds something: read the `== ON SCREEN` section of `<out>/X.txt`. EXPECTED reports (her fist closes round
   what she holds; the contact is also what keeps those things "supported" for the float check, so the fist is not
   skipped): `prop:mic x prop:hand` about 2.4 cm on every mic frame, `prop:handkerchief x prop:handR` about 2.5 cm over
   the wipe, `prop:board x prop:hand / handR` about 1.1 cm while she holds it up; and off screen `prop:handR` "float"
   between her claps. Anything else is yours to fix.
3. Stills ONLY through the queue, 540 wide, a few frames, outputs under `/home/user/newton_work/film/<lane>/`:
   - `bash scripts/kit/queue/still.sh src/videos/newton/preview/filmX.ts /home/user/newton_work/film/<lane>/ --pick F1,F2 --size 540x960`
     the 3D picture only (absolute film frames; prints `QA: BEATS ok`).
   - `bash scripts/kit/queue/remotion_still.sh NewtonFilm <frame> /home/user/newton_work/film/<lane>/fNNNN.png` the real
     frame with the HUD and the subtitle (about 90 s each).
   - Previews: `preview/smoke.ts`, `preview/set_places.ts` (WP2: any `"place.cam@preset"`, e.g.
     `--opts '{"views":["garden.walk@night"]}'`), `preview/people_lineup.ts`, `preview/props_sheet.ts` (views small,
     big, desk, plate, hold, elab), `preview/cam_test.ts` (12 mic / hand tests with the subtitle band drawn in).
   - Long commands (> 100 s) in the background with a log you poll. The machine has 4 CPUs and is shared.
4. Timing: `python3 scripts/newton/gen_timing.py --placeholder` (Chinese 3.6 characters/s for ji, English 2.3 words/s
   for nt / hm) or `python3 scripts/newton/gen_timing.py /home/user/newton_work/film/voice/voice_timing.json` (the real
   voice) regenerate `voice.ts` and `captions.ts`; every beat follows. `voice.ts VOICE_SOURCE` says which is in.
   `beatCheck()` (beats.ts) must return [].
5. On a moving shot, the shimmer test: `python3 scripts/kit/qa/shimmer/shimmer.py run src/videos/newton/preview/filmX.ts
   /home/user/newton_work/film/<lane>/shimmer --frame F`.

## 13. Open issues (integration check, 2026-11-13)

The integration report and its contact stills are in `/home/user/newton_work/film/check/` (NOTES.md, stills/,
clearance/). What each segment builder must know:

- ALL: the timing is the PLACEHOLDER (`VOICE_SOURCE`); the real voice moves every frame. Look every frame up again;
  never keep a number from a still's name. F01's `pre` is 1.0 s, so the night-garden walk before F01 is about 0.9 s
  (a lines-file call for the producer).
- ALL: the mic's red head sits at y ~950..1140 and its bottom edge at 1142 at rest; her fist and the handle run on
  down through the subtitle band to the lower-left corner (the subtitle is drawn over them and stays readable). Frame
  faces with the eyes above y 640 (the stand cameras do) or the mic covers a chin. Under a card LOWER the mic
  (`enter: 1 - cardLower(f)`, as the stubs do): `avoid: SCREEN.card` alone slides the head right of x 680 and her
  forearm then runs straight across the frame under the card (integration still f0290 before the fix).
- ALL: the stand cameras look down noticeably (the eyes rule on a toon figure with a half-metre head), so they show
  less background; a shot that wants more place should stand further back rather than raise the look.
- A: the TITLE BLOCK (128-217 on the placeholder) overlaps line A03's subtitle and its ASIDE (155-232): with the
  title on the door's upper half (segA stub: `Pose.title` from `STAIRS_CAMS.door`) the aside's mic head (centre
  520 / 1004, r 136) sits just under the block; check the two together in a still. The stairs door at full swing
  passes about 0.2 m into its far jamb (the hinge is on the landing face): keep `door` below about 0.9 or keep the far
  jamb out of frame (no named camera shows it).
- A: the rap: from `STAIRS_CAMS.top` / `run` the knock point is 1.5 m away, beyond her reach (0.64 m): the mic only
  jabs toward the door. For a real rap her camera must come within about 0.8 m of `STAIRS.knock`.
- B / C / E / G (room): `ROOM.deskWrite` moved onto the desk's back band (0.36 m in front of `ROOM.newtonDesk`: in
  reach), `ROOM.inkwell` 0.1 m forward (it sat on the set's open book), and the set's two shut books that sat on the
  writing place and the drafts corner are now stacked on the left pile. Put sheets, drafts and inkwell only on their
  marks: the rest of the desk is the set's paper.
- C: the chair drag needs `ROOM_CAMS.chair` (from `ROOM_CAMS.desk` the rail is out of her reach); `ROOM.chair`'s back
  rail is 5 cm from the wall, so her hand takes the rail's near end from the side and sits at the frame's right edge
  (WP3 still /home/user/newton_work/film/wp3/cam5/f0008.png). Before the drag the stubs stand it at `CHAIR_ASIDE` (at
  `ROOM.chair` it touches his coat while he stands at the desk).
- D: `C.wipe` has no reach limit: use it only with a close camera (`STREET_CAMS.wipe`, his face about 0.9 m away). Its
  hand and cloth are drawn 1.35x and 1.5x life size on purpose (a true-size hand at his half-metre head reads as a
  doll's). The cloth now touches 4 cm in front of his nose point (it sank 1.9 cm into the face at 2.2 cm). On the
  close `STREET_CAMS.wipe` the cloth's long hanging corner falls over his mouth and chin and reads as a WHITE BEARD
  (integration still f1960): hang it to the side, shorten it or frame the wipe so the corner drops below the frame.
- D: `C.clapHands` holds the mic upright low in the middle, so her left fist is seen from the palm side: a dark brown
  polygon shows behind the fingertips (integration still f2380, SCHOOLS_CAMS.lectern): check the hand mesh from that
  side or turn the fist.
- F: HUMPHREY shovelling: with the shovel's pair grips 0.3 m apart his reach error is 0.1-0.16 m upright: stoop him
  (lookDown, a lower `at`) or use one hand; a small clipping value (-0.07) remains in WP3's sheet. The seated framings
  (`ELAB_CAMS.stool`, `push`, `board`) assume him SEATED on the stool prop (`seated(...)` with a TaSeat on `ELAB.stool`);
  WP2 previewed them standing.
- F / G: the elaboratory's inside (4.4 x 3.6 m) is a little bigger than its outside in the garden (4.0 x 3.25 m), on
  purpose: never show both in one shot. From `ELAB_CAMS.wide` the blue night light on the floor by the door shows as a
  flat violet wedge in the frame's lower-left corner (stills f3100, f4650, f4800): frame it out or give it context.
  The firelight leaves the faces pale cream more than warm orange (the baked figure bleach): judge it on the real
  shots against PLAN's "warm and mid-tone".
- G: the end black is `endBlack(f, BEAT.G.black[0])` in `Pose.top` (the stub does it); the laugh holds the camera DEAD
  STILL (no handheld, no kick).
- The stubs stand every figure on its stand-in mark (Newton facing her even where the storyboard has him walking, on
  the stool or in a doorway, Humphrey on his shovel mark in G): the blocking, the walks, the whips, the plate inserts,
  the candle, the notes, the sack and the poker are the WP5 work.
