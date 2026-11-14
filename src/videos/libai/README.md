# LibaiFilm: the segment builder's contract

《采访苏东坡的一天》 (composition `LibaiFilm`, this folder). 1080 x 1920, 30 fps, `TOTAL` frames from the timing (6096
on the real voice: 203.2 s). The bible and the storyboard are `PLAN.md`: read section 8 for your scene. The engine is a
copy of Qin's (itself Wanbi's). The long rules are the header of `story.ts` ("HOW TO BUILD A SEGMENT"); the World
contract is the header of `world.ts`. This page is the interface the skeleton lane (WP1) leaves for the set lanes
(WP2a / WP2b), the cast, props and camera lane (WP3) and the segment builders, as of 2026-11-13. Open issues are in the
last section.

Contents: 1 owners · 2 a segment · 3 the World · 4 places · 5 people · 6 props · 7 her camera (`cam.ts`) ·
8 beats and lookups · 9 the shared verbs (`shots/common.ts`) · 10 the HUD · 11 picture rules · 12 checks ·
13 open issues.

## 1. Who owns what

You edit only your own files. When you need a change in a file you do not own, append a request to
`/home/user/libai_work/requests.md` (lane name, file, what, why) and work around it in your own file.

| owner | files |
|---|---|
| WP1 skeleton + HUD | `story.ts`, `voice.ts` and `captions.ts` (GENERATED: never edit them, never copy a number out of them), `captions_en.ts`, `beats.ts`, `lang.ts`, `world.ts`, `layout.ts`, `layout/base.ts`, `sets/index.ts`, `sets/blockout.ts`, `Film.tsx`, `hud/*`, `kit.json`, `kit.world.ts`, `preview/*` (except the three WP3 previews and `set_places.ts`), `README.md`, the stub `shots/segA..I.ts`, `src/Root.tsx` registration |
| WP2a sets | `sets/market.ts`, `sets/yard.ts`, `sets/room.ts` (+ the `sets/parts/*` they need), `layout/market.ts`, `layout/yard.ts`, `layout/room.ts` |
| WP2b sets | `sets/huangzhou.ts`, `sets/pines.ts`, `sets/river.ts`, `sets/beach.ts`, `sets/temple.ts`, their `layout/*.ts`, `preview/set_places.ts` |
| WP3 cast, props, her, camera | `people.ts`, `acc/*`, `props/*`, `her.ts` (new), `cam.ts`, `preview/people_lineup.ts`, `preview/props_sheet.ts`, `preview/cam_test.ts` |
| segment lanes | one `shots/segX.ts` each (the WP1 stubs are theirs to replace). `shots/common.ts` is shared and ADDITIVE ONLY: add a verb, never change one, and say in requests.md what you added |

The eight `sets/<place>.ts` and `layout/<place>.ts` files are WP1 BLOCK-OUTS: the set lanes replace their contents
WITHOUT changing the exports (`X_LOOK`, `X_PARAMS`, `buildX(K)`; the island `XX`, `X_SET`, `X`, `X_CAMS`, `X_STAND`)
or the mark and camera NAMES (refine the numbers). Never edit `src/kit`, `src/videos/group/kit`,
`vasa/ bt/ arthur/ hongmen/ wanbi/ qin/`, `scripts/kit`, `scripts/rig3d`, `scripts/arthur`, `scripts/hongmen`,
`scripts/wanbi`, `scripts/qin`: import from them, copy into `su/` when a file needs changes. No media in the repo;
every picture, log and scratch file goes under `/home/user/libai_work/<lane>/`. No commit, push or branch.

## 2. A segment

```ts
// shots/segX.ts
import { SEGMENTS, FPS, capWord, quote, type Pose, type Segment, type CamPose } from "../story";
import { BEAT, placeAt } from "../beats";
import * as C from "../cam";                      // a namespace: cam.ts's whip clashes with shots/common.ts whip
import { SU, BUTCHER } from "../people";
import { MARKET, MARKET_CAMS, type Cam } from "../layout";   // layout.ts re-exports every place's marks AND cameras
import { transitionAt } from "../hud";            // the cross-cut overlays (fades through a tone, ink washes)
import { standing, says, frag } from "./common";

const S = SEGMENTS[0];                             // A = 0 ... I = 8
export const SEG: Segment = { id: "A", from: S.from, to: S.to, enter() {}, exit() {}, pose(w, f): Pose { ... } };
```

`SEG.id / from / to` must equal `SEGMENTS[i]` (Film.tsx and the previews throw otherwise). `pose(w, f)` is a PURE
function of the absolute film frame `f`: any frame can be the first one a page renders (stills, farm chunks). It sets
everything it relies on, on every frame, and takes time from `f`, never from `w.t`. No `Math.random`, `Date` or
`performance.now` in anything that reaches pixels: use `rng(seed)` / `hash(i, k)` from `story.ts`.

The engine, per frame: `w.beginFrame(f)` (every figure hidden, every prop hidden, every set param back to its default)
-> `P = SEG.pose(w, f)` -> `w.endFrame(P)` (camera, `set.setView`, `set.animate(P.clock ?? f / FPS, f)`, `w.update()`
if the shot did not call it). Then Film.tsx draws the HUD, `P.overlays`, the caption, `P.top`, and the end's black.

The WP1 stubs (`shots/segA..I.ts`) are the minimal working staging of each scene: the place(s) of `placeAt`, a camera
from the layout's named cameras through `C.povCam` (D: still), SU's stand-in standing on his mark with his lines
lip-synced (`says("su", [...], f, 1)`), the other speakers (`says("chai", ["D27"])`, `says("guo", ["D29"])`) and the
scene's extras, the whips A->B and into the flashback (`C.whip` + `C.whipSmear`), and `transitionAt(f)?.node` in the
overlays. They pass the clearance checker. Read them as a starting point, then replace them.

## 3. The World (`world.ts`), in this order inside `pose`

```ts
w.setPlace("market");                                 // FIRST. One place shows; the figures take its light
w.setPlace("pines", { light: { gain: 0.9 } });        // optional: lay CastLight fields over the place's figure light
w.set.param("crowd", 1);                              // the place's dressing for this frame (section 4)
w.setCamera(cam);                                     // a CamPose (section 7); also return it as P.camera
const r = w.actor(SU);                                // a figure (created once, then the same one); hidden unless set
r.set({ at, facing, pose: { kind: "idle", t: f / FPS }, expr: "smile", gaze, turn, hands, seat, hide, visible: true,
        ...speak(quote("su", "A02"), f, 1) });
w.actor(SERVANT, "1").set({ ... });                   // a second figure of the same Person: a key
w.update();                                           // solves the figures; r.handWorld(i), r.headWorld() valid after it
w.prop("cleaver").put(r.handWorld(0), { grip: "hilt", rot });  // props: every frame, after update when held
const p = w.project(r.headWorld());                   // -> { x, y, z, front, on } in 1080 x 1920 px
return { camera: cam, overlays, post, cards, hud, captions, clock, focus, slate };
```

- `w.set.getParam(name)` reads a param back; `w.look()` the place's look; `w.M` bt/pbr materials and `w.root` for a
  segment's own meshes (rare: prefer props); `pt(w, p)` (world.ts) = `{ x, y }` on screen.
- `set.param` throws before `setPlace`, on an unknown name and on a value of the wrong kind (number / string / boolean).
- Every floor a figure stands on is y 0 (the water planes sit a few cm below it: the river -0.04, the beach sea -0.05,
  the pines lake -0.06). The robes' hanging cloth stops at the seat's floor / `at.y` by itself (`world.ts update`).
- Conventions: metres, y up, facing 0 = toward +z (the camera side in every place), PI/2 = toward +x; the person's
  LEFT is +x at facing 0; arm 0 = the person's right hand. `turn: 1` keeps the true facing (a back view), `turn: 0`
  turns the figure to the camera, undefined = from the camera angle.

## 4. The places

Each place is an island along x (`layout.ts ISLAND`: market 0, yard 100, room 200, huangzhou 300, pines 400, river 500,
beach 600, temple 700). `layout.ts` re-exports everything of every place: the island's x (`MX`, `YX`, `RX`, `HX`, `PX`,
`VX`, `BX`, `TX`), `X_SET` (the set's numbers), `X` (the marks), `X_CAMS` (the named cameras), plus `STAND`
(`Record<Place, Stand>`: the stand-in staging `{ cam, su, facing }`), `CAMS` (`Record<Place, Record<string, Cam>>`),
`EYE` 1.50, `FOV` 62, `SU_HEAD` 1.3, `eyeCam(x, z, look, fov?, floorY?)`, `frontCam(at, facing, dist, { side, headY,
eyesPx, fov })` (a camera `dist` m in front of a figure, `side` m to its left, aimed so a head at `headY` lands at
screen y `eyesPx`, 600 by default), `camOf`, `islandOf`, `SCREEN`, `TaSeat`, `PAD_TOP`.

| place | scene | params (default) | marks (`layout.ts`) | named cameras (`X_CAMS`) |
|---|---|---|---|---|
| `market` (x 0) | A | `crowd` 0..1 (1): the far background silhouettes | `MARKET.start`, `stop` (her walk), `block`, `butcher`, `su`, `suFacing`, `rack`, `carcass` (the hook), `cleaver` (rest on the block top), `servantPath[4]`, `villagers[6]`, `beckon`; `MARKET_SET.block` (r 0.34, top 0.8) | `walk`, `stall`, `close`, `wide` |
| `yard` (x 100) | B, C, D | `sun` "morning" / "noon" / "afternoon" ("morning"), `lantern` 0..1 (0: the red lantern on the eave at `YARD.lantern`, lit), `shells` 0..1 (0: the shell pile at `YARD.shells`, 1 = 0.5 m) | `YARD.door`, `stove`, `suSquat`, `su`, `suFacing`, `wine`, `bench`, `dog`, `ladder`, `ladderTop`, `mai` (on a rung), `lantern`, `kids` (a closed loop on the yard's right), `lychee`, `bed` (top middle, y 0.42), `shells`, `gate`, `gateIn`, `road[3]`, `courier`, `family { mai, kid, guo, su }` | `land`, `stove`, `su`, `dog` (0.5 m over the ground), `house`, `bed`, `shells`, `gate` (D's still) |
| `room` (x 200) | E | `sun` 0..1 (1): the gold window light | `ROOM.desk`, `sit`, `suFacing`, `trunks[2]`, `robes`, `bench`, `kids[2]` (seats, y 0.42), `wife`, `door`, `window`; `ROOM_SET.desk.top` 0.36 | `desk`, `wide`, `family`, `close` (desk / close are framed for him SEATED, head 1.0 m) |
| `huangzhou` (x 300) | B flashback | `vignette` "slope" / "pot" ("slope"), `lid` 0..1 (0 shut, 1 off and aside), `steam` 0..1 (1) | `HUANGZHOU.slope`, `su`, `suFacing`, `plough`, `furrow[2]`, `pot`, `potTop`, `lidAside` | `slope`, `slopeEnd`, `pot`, `potClose`, `lid` |
| `pines` (x 400) | F | `moon` 0..1 (1), `glow` 0..1 (0) and `glowX` / `glowY` / `glowZ` (the lantern's world position: the place's point light IS its warm glow) | `PINES.path[5]`, `stop`, `pavilion`, `grave`, `step` (the lower step's top), `su`, `suFacing` | `walk`, `stop`, `push`, `close` |
| `river` (x 500) | G | `dawn` 0..1 (0.6) | `RIVER.bank` (her), `boatPath[4]` (the boat's origin on y 0), `mai`, `kids[2]`, `dog`, `su` (the stub's mark at the bank's edge), `suFacing` | `bank`, `far`, `wave` |
| `beach` (x 600) | H | `fire` 0..1 (1): the set's own fire flicker in the ring | `BEACH.hut`, `fire`, `su` (crouched on a low seat, top `seatTop` 0.3), `suFacing`, `guo`, `guoFacing` | `fire`, `su`, `lean` (framed for him CROUCHED, head 1.0 m) |
| `temple` (x 700) | I | none | `TEMPLE.portrait` (its middle on the wall), `su`, `suFacing`, `burner` | `stand`, `portrait` (over his shoulder), `ease` |

What the sets draw and what you put:

- Furniture and handheld things are WP3's PROPS, not set content: the block, the cleaver, the stove, the bench, the
  ladder, the rattan bed, the desk and cushion, the trunks, the plough, the boat, the oyster, the stick, the dog.
- MARKET: the set draws the one carcass on the rack (`MARKET.carcass`); if WP3 builds a `carcass` prop, ask WP2a to
  drop the set's.
- YARD: the lantern on the eave and the shell pile are SET params (`lantern`, `shells`); the lantern MAI carries up
  the ladder before it hangs is the `lantern` prop.
- HUANGZHOU: the set draws its own pot, lid, pork and steam (params `lid`, `steam`). If WP3's `porkPot` is used
  instead, WP2b drops the set's pot (one, never both).
- PINES: the carried lantern is the `lantern` prop; set `glow*` to where its paper is on every frame.
- BEACH: the fire ring and its flames are the set's (`fire`).
- ROOM and TEMPLE: the wall nearest the camera is hidden by the set's `view()` while the lens is inside.

`STAND[place]` is the stand-in staging (her eyes + SU's mark and facing) the stubs and `preview/set_places.ts` use. It
is a block-out, not a shot camera.

## 5. People (`people.ts`)

WP3 builds the real cast (PLAN section 2). Until then `people.ts` holds STAND-INS made from Qin's Looks under the
final names, so a shot written now keeps working when WP3 swaps the Looks:

| export | who (PLAN) | stand-in now |
|---|---|---|
| `SU` | 苏东坡 at 60, scale 1.06, resting face `smile` | Qin's 博士 at 1.06 |
| `SU_DAN` | 苏东坡 two years later (儋州, thinner, whiter) | 博士 |
| `SU_OLD` | 苏东坡 four years later (金山, very thin, the stick) | 博士, `smile_closed` |
| `GUO` | 苏过, the youngest son (speaks D29) | the attendant |
| `MAI` | 苏迈, the eldest son | the official |
| `WIFE` | 苏迈's wife | the eunuch's Look |
| `KID`, `KID2` | the two grandchildren, scale 0.62 | the attendant / 徐福 at 0.62 |
| `COURIER` | 差役 (speaks D27) | 徐福 |
| `BUTCHER`, `SERVANT` (x2: keys), `VILLAGER` (keys) | the market | the eunuch / the attendant |

Also exported: `CAST` (all of them by key), `SPEAKER_PERSON` (`ji` -> null: she is the camera, never a figure; `su` ->
SU, `guo` -> GUO, `chai` -> COURIER), `addPerson`, and Qin's people and helpers (`PEOPLE`, `ALL_PEOPLE`, `NAMED`, the
emperor swaps), which WP3 removes when the real cast is in.

- Speakers (`voice.ts Speaker`): `ji` (her), `su`, `guo` (D29), `chai` (D27). A mouth moves only inside that speaker's
  own line: `...speak(quote("su", "A02"), f, id)` or several at once `...says("su", ["A02", "A04", "A05"], f, id)`.
- Expressions: only `RIG_EXPRS` (group/kit/rig3d.ts); PLAN section 2 maps Su's moods to them.
- Read world points back after `w.update()` (`headWorld`, `handWorld`). SU is 1.06: targets in his frame scale with it.

## 6. Props (`props/index.ts`)

`props/` is still Qin's registry (sword, desk, cushion, brush, inkstone, scale, slips, lantern, ...) until WP3 builds
the Su props of PLAN section 4. The interface stays: `w.prop(name, key?).put(at, opts)`, put every frame (every prop is
hidden again at the next frame). Without `grip`, `at` is the prop's origin; with `grip`, `at` is the hand.

- Options: `{ scale, rot (yaw or [rx, ry, rz]), grip ("hilt" | "pair" | "grip" | "hook"), open, tilt, n, on }`.
- `holdPoints(name, at, opts)`: the world points the holder's hands go to for that same put.
- `deskSeat(ROOM.desk)` -> `{ at, facing, cushion, seat }`: the cushion's place and the RigSeat for `pose: { kind:
  "write" }`. Qin's desk top is 0.42; `ROOM_SET.desk.top` says 0.36 (WP3's Su desk decides: the layout follows).
- A hand of the rig is a ball 4.6 cm across with no fingers. Never read `handWorld` before `w.update()`.
- HER HAND AND THE RED MIC are WP3's `her.ts` (`putHer(w, cam, f, { mic, hand })`, PLAN section 3): not built yet.

## 7. Her camera (`cam.ts`)

She IS the camera: eyes at 1.50 m (`EYE`, she is short: SU looks down into her lens), the vlog lens fov 62 (`FOV`).
Import it as a namespace (`import * as C from "../cam"`). Every function is pure (frame in, pose out); the moves take a
CamPose and return one, so they stack: `C.lower(C.punchIn(C.povCam(...), ...), ...)`. The handheld is gentle (mood
"calm" / "excited") except D (STILL: no handheld) and F's push-in (`BEAT.F.push`: a steady move, no sway).

```ts
const key = (f: number, c: Cam): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov });
const cam = C.povCam(f, [key(S.from, MARKET_CAMS.walk), key(BEAT.A.walk[1] + 30, MARKET_CAMS.stall)],
  { mood: "excited", walk: [[S.from, 1], [BEAT.A.walk[1] + 30, 0]], amp: 0.7 });
C.keyCam(f, keys)                                                 // keys only, no handheld
C.handheld(anyCam, f, { mood: "calm", walk: 1, amp: 0.6 })        // handheld on a camera from elsewhere (follow ...)
C.punchIn(cam, f, BEAT.A.punchIn, { k: 0.9, len: 5, off })        // fov x k, ease-out (off: eases back)
const W = C.whip(camA, f, BEAT.A.whip, { dir: 1, to: camB });     // { cam, post, smear, cut }: 4 frames out, 4 in
//   return { camera: W.cam, post: W.post, overlays: frag(C.whipSmear(W.smear, 1), transitionAt(f)?.node) };
C.follow(f, (g) => walkAlong(PATH, 1.2, (g - t0) / FPS).at, { back: 1.9, side: 0.5 })   // behind a walker, lagging
C.creep(cam, f, from, to, 0.9)                                    // steady push (negative = drift back)
C.lower(cam, f, BEAT.E.sag, { to: 1.05, tilt: 5 })                // she lets the camera sag
C.lean / C.leanStand / C.dip / C.duck / C.aside / C.handCover / C.nudge   // as Qin's
```

THE WHIP A -> B: `BEAT.A.whip` is the first of its 8 frames: `whip .. whip+3` (A's last 4) leave the market,
`whip+4 .. whip+7` (B's first 4) arrive in the yard: segA calls `C.whip(camA, f, BEAT.A.whip, { dir: 1 })`, segB
`C.whip(camB, f, BEAT.A.whip, { dir: 1, to: camB })`. The whip into the flashback: `C.whip(yardCam, f,
BEAT.B.flashIn - 4, { dir: 1, to: huangzhouCam })` (the place switches on `flashIn`, the arriving half's first frame).
After a whip's last frame, stop calling it with a `to` (it keeps returning `to`).

Rules: never inside geometry (keep 0.15 m from walls); his eyes in the upper third (`SCREEN.eyes` y < 700); faces out
of the caption band (y 1190-1520). `shots/common.ts` adds `kick`, `shake`, `yawCam`, `whip` (a CamPose whip, Wanbi's)
and `eye`.

## 8. Beats and lookups (never type a frame number)

`story.ts`:
- `SEGMENTS[i]` `{ id, from, to, lines }`, `seg("C")`, `segmentAt(f)`, `TOTAL`, `FPS`, `W`, `H`, `TITLE`, `SUBTITLE`.
- `line(n | "A03")` / `lineId("A03")` -> `{ from, to, pre, preFrom, after, who, text, scene }`; `lineAt(f)`,
  `lineNo(f)`, `LINES`; `lineEn(id)` (the line's English: it throws when a line has none).
- `quote(who, id)` -> the Quote for `speak`; `quotesOf(who)`.
- `cap(id, k)` (caption group k, negative from the end), `capWord(id, "撒盐").from` (the frame the word's first syllable
  starts), `capsOf(id)`, `captionAt(f)`.
- `CARDS`, `card("A05")` `{ from, to, zh, en, text }`, `cardAt(f)`; `SCENE_LABEL.A` ("清晨 · 惠州集市"; not shown).
- `L(zh, en)` (`lang.ts`) for every on-screen string; `TXT` (title, subtitle, the two stamps `jumpH` / `jumpI`, the end
  `names`).
- Easing and helpers: `clamp01, lerp, lin, smooth, smootherstep, ease*, spring, pop, between, rng, hash, since, h,
  camMix`.

`beats.ts`: `BEAT.X.name` (a number, or a `[first, last]` span), `TITLE_SPAN` [0, 90], `SPANS`, `placeAt(f)`,
`vignetteAt(f)` (huangzhou: "slope" / "pot"), `shotAt(f)`, `TRANSITIONS`, `FADE_N` 10, `WIPE_N` 12, `beatCheck()` (= []).

| scene | beats |
|---|---|
| A market | `walk` [ ], `cleave`, `servants` [ ], `micIn`, `turn`, `lean`, `nod`, `micTo`, `laugh`, `pat`, `boneUp`, `punchIn`, `card` [ ], `pay`, `tuck`, `beckon`, `whip` |
| B yard + 黄州 | `land`, `hang` [ ], `steps` [4], `hold`, `take`, `crab`, `chew`, `look`, `dog` [ ], `aside`, `rise`, `pan` [ ], `count`, `shrug`, `flashIn`, `pot`, `lid`, `flashOut`, `thumb` |
| C lychee tree | `toss`, `catch`, `wink`, `tilt` [ ], `aside`, `micBack`, `lieBack`, `bell`, `recite`, `snore` [ ], `card` [ ] |
| D the gate (STILL) | `hooves`, `rein`, `family`, `read` [ ], `take`, `look`, `brighten`, `aside`, `fade` [ ] |
| E room | `fadeIn` [ ], `glance`, `write`, `jolt`, `grin`, `card` [ ], `blot`, `aside`, `sag`, `fade` [ ] |
| F pines | `fadeIn` [ ], `walk` [ ], `pat`, `stop`, `lantern`, `laugh`, `push` [ ], `turn`, `bow`, `low`, `wipe`, `pickUp`, `smile`, `fade` [ ] |
| G river | `fadeIn` [ ], `wave`, `wipe` [ ] |
| H 儋州 | `wipeIn` [ ], `stamp`, `slurp`, `lean`, `card` [ ], `laugh`, `wipe` [ ] |
| I 金山寺 | `wipeIn` [ ], `stamp`, `look` [ ], `smile`, `ease`, `names` [3], `pictures`, `dim` [ ], `card` [ ], `black` [ ] |

`placeAt(f)` is the storyboard's place (B's flashback is huangzhou from `BEAT.B.flashIn` to `BEAT.B.flashOut - 1`). A
segment may cut differently inside its own frames. `TRANSITIONS` (beats.ts) are the cross-cut overlays: B's ink
dissolve out of the flashback, D->E through gold, E->F through deep blue, F->G through blue-black to dawn, G->H and
H->I ink washes. Each segment draws `transitionAt(f)?.node` (hud/) in its overlays. A beat that is not in beats.ts is
derived in your own file the same way (`capWord`, `line().preFrom`, `+ Math.round(s * FPS)`).

## 9. The shared verbs (`shots/common.ts`)

basics `V, v3, yawTo, wrapA, lerpA, lid, speak, says, accent, heads` · keys `at` (step), `ky` / `kv` (eased), `path`,
`swaps` · places `rel, hang, halberdHand, staged, headPx, kick, frag` · moving `walkAlong, walkTime, hopArc` ·
sitting `seated, lap, kneel, KNEEL_DROP, bow, salute` · crowd `stagger, alive` · verbs `headM, headPop, swapTo, clap,
yawCam, whip, shake` · staging `eye, standing, standIn`. The header of the file has a line per verb; segments are .ts
(no JSX): `frag(...)` joins overlay nodes, `h` (story.ts) is `React.createElement`. WP1 added `says` (several lines of
one speaker) and `standIn`'s `who` option.

## 10. The HUD (Film.tsx draws it; shots only switch it)

No vlog UI (no REC, no timestamp, no battery). Film.tsx draws, in order: the HUD layer (`TitleBlock`, `FactCard`,
`Stamp`, every `registerHud`, `EndNames`), then `P.overlays`, then the `Caption` (Chinese + the line's English), then
`P.top`, then `EndBlack` (the film's fade to black at the very end).

| Pose field | effect |
|---|---|
| `cards: false` | hides the fact card and the title block (the stamps and the end names stay) |
| `hud: false` | hides the whole HUD layer (also registered HUDs) |
| `captions: false` | hides the caption on this frame |
| `overlays` / `top` | your own 2D nodes below / above the caption (1080 x 1920 px): `transitionAt(f)?.node`, `C.whipSmear` |
| `post` | `{ dof, bloom, grade, gradeAmount, ink, ao, bg }` over the place's look (whip blur = `W.post`) |

- `TitleBlock`: frames `TITLE_SPAN` (0-90), top centre (`TITLE_RECT` 90-990 x 230-420), fades out rising over the
  last 12 frames. 「采访苏东坡的一天」 / 「1097年 · 惠州」 (EN: "A Day with Su Dongpo" / "1097 · Huizhou").
- `Caption`: no box, ink outline, 72/68/64/60/56 px by length (`capPx`), speaker colours `SPEAKER_COL` (ji warm white,
  su pale gold, guo and chai white); the line's English (`lineEn`) 34 px under it, at most two balanced rows, steady
  over all the line's groups. The pair stays in x 50-925 and y 1194-1516 (`captionRect(f)`). Hidden on I57 (the end
  names are its caption).
- `FactCard`: the 5 `CARDS`, a cream paper card with an ink border and a red 「注」 seal, mid-left (`FACT_RECT` x 56-760,
  y 780-1080), zh 48 px (two rows max), en 26 px; slides in and out over 8 frames. EXCEPTION: card 5 (after I57) sits
  low and centred in the caption band (`FACT_END_RECT` 110-970 x 1236-1500), because the end names own the middle
  third then and nobody speaks.
- `Stamp`: the red seal (儋州 / 金山) pressed in at `BEAT.H.stamp` / `BEAT.I.stamp` (scale 1.3 -> 1, ink spread) in the
  top left with 「两年后 · 儋州」 / 「四年后 · 金山寺」 beside it (`STAMP_RECT` 50-800 x 220-440), held 2.5 s, fades.
- `EndNames`: 黄州 / 惠州 / 儋州 (110 px, English 32 px under each) on their syllables (`BEAT.I.names`), the three
  painted pictures (pork pot, lychee shells, oyster) fading up from `BEAT.I.pictures`, the picture dimmed to 0.6 over
  `BEAT.I.dim` (`endDim(f)`); `EndBlack` reaches black on the last frames (`endBlack(f)`). `NAMES_RECT` 60-920 x 690-1140.
- Overlay helpers for the segments: `InkWipe(p, seed)`, `InkDissolve(p, seed)`, `ToneFade(k, colour)`, and the film's
  cross-cuts already timed: `transitionAt(f)` -> `{ node, p, cut, kind, t }`.
- Keep faces out from under the HUD: `hudRectsAt(f)` (hud/index.ts) lists the boxes the HUD takes on frame f (title,
  card, stamp, names, caption). `SCREEN` (layout.ts): nothing that matters above y 210, in the caption band 1190-1520,
  below 1613, or at x > 930 for y > 900.
- Numbers for a shot that wants to match the HUD: `factCardAt(f)`, `stampAt(f)`, `capRows`, `capPx`, `enRows`,
  `CAP_ROW`, `CAP_EN`, `HC` (palette), `SAFE`, `INK_CUT`.

## 11. The picture rules (Jay's)

- No clipping (穿模): run the clearance checker on your segment before every render.
- No flashing black lines, black frames or colour blocks. A fade is an overlay of the destination tone over 6-12 frames
  each side (`TRANSITIONS`), never a hard black frame.
- Figures are not over-exposed under the set light. Night (F) is a blue mid-tone, not black.
- Captions have no background box.
- Figures keep moving: never a frozen figure for long (`alive`, `standing`, idle poses with `t`).
- A face never turns to profile (FACE_MAX 12 deg): turning away = a body turn or back view (`turn: 1`), the gaze, a
  head tilt.
- His eyes in the upper part of the frame (y < 700); nothing important under the caption band or a card.

## 12. Checks

1. After every edit: `bash scripts/kit/tsc.sh --film su` must say 0 errors. Files not in kit.json's list are checked
   by naming them: `bash scripts/kit/tsc.sh --film su src/videos/libai/shots/segA.ts src/videos/libai/her.ts`.
2. Before rendering a changed shot: `bash scripts/kit/qa/clearance/run.sh --film su --seg X --out
   /home/user/libai_work/<lane>/clearance` (no GPU, no queue). It exits 0 even when it finds something: read the
   `== ON SCREEN` section of `<out>/X.txt`. `--from F --to G`, `--step 3` narrow it.
3. Stills ONLY through the queue, 540 wide, a few frames, outputs under `/home/user/libai_work/<lane>/`:
   - `bash scripts/kit/queue/still.sh src/videos/libai/preview/filmX.ts /home/user/libai_work/<lane>/ --pick F1,F2 --size 540x960`
     the 3D picture only (absolute film frames; prints `QA: BEATS ok`). `preview/film.ts` has all nine segments.
   - `bash scripts/kit/queue/remotion_still.sh LibaiFilm <frame> /home/user/libai_work/<lane>/fNNNN.png` the real frame
     with HUD, overlays and caption.
   - Previews: `preview/set_places.ts` (every named camera of every place and `<place>.stand`,
     `--opts '{"views":["yard.land"],"params":{"lantern":1}}'`), `preview/people_lineup.ts`, `preview/props_sheet.ts`,
     `preview/cam_test.ts` (whip and dip frames at the market), `preview/smoke.ts` (the harness, the font, three of
     the cast).
   - Long commands (> 100 s) in the background with a log you poll. Never start renders in parallel: the queue.
4. Timing: `voice.ts` and `captions.ts` are generated by `scripts/libai/gen_timing.py`; every beat follows. `beatCheck()`
   (beats.ts) must return [] (the previews print `QA: BEATS ok`).

## 13. Open issues (WP1, 2026-11-13)

- The stubs show the stand-ins STANDING where the real staging sits or lies: SU stands at the rattan bed's place in C
  (no bed prop), behind the desk's place in E (no desk; `ROOM_CAMS.desk` / `close` are framed for a seated head), at
  the fire in H (`BEACH_CAMS.su` / `lean` are framed for a crouched head: the stub frames him standing with its own
  `frontCam`), on the river bank in G (no boat; MAI and the kids are not shown). No props, no dog, no hand / mic.
- The market's set carcass, the huangzhou set's pot and the yard's set lantern / shell pile are SET content (section 4):
  a lane that builds the prop version asks for the set's to go, never both.
- Card 5 is drawn low in the caption band (no one speaks then), not mid-left: the end names own the middle third.
- `props/` and Qin's people (`PEOPLE`, `EMPEROR`, ...) are still in the files so the previews compile: WP3 removes
  them with the real cast and props (the stubs only use the Su names of section 5).
- The river's water is at y -0.04 so a boat prop can float on y 0: a boat seat's `floor` below 0 trips the checker's
  floor test (keep `floor` 0).
- B's dog cutaway (`BEAT.B.dog`, `YARD_CAMS.dog`) shows an empty patch of yard until WP3's dog prop stands on
  `YARD.dog`. The kids (0.62) chasing round `YARD.kids` keep their heads low in the frame: when they pass within about
  4 m of her lens their heads fall into the caption band (B's land / house framings).
- D's still (`YARD_CAMS.gate`) puts SU's eyes at about y 750 and the courier's at about 700: the staging lane may
  bring the camera down or step SU back.
- B15 / B16 are his lines spoken OVER the flashback: the stub does not lip-sync them (he is in the picture, not talking
  to her). The segment lane decides.
