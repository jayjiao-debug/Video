# Headless clearance (clipping, 穿模) checker of the Hongmen film

```bash
bash scripts/hongmen/qa/clearance/run.sh                      # the whole film (about 2.5 min on one core, niced)
bash scripts/hongmen/qa/clearance/run.sh --seg D              # one segment (or --seg C,D)
bash scripts/hongmen/qa/clearance/run.sh --from 1380 --to 1400 # a frame range (absolute film frames)
#   --tol 1      tolerance in cm (default 1): only interpenetrations deeper than this are reported
#   --step 1     every n-th frame          --gap 6     findings of a pair less than this many frames apart = one range
#   --out DIR    default /home/user/hm_work/qa/clearance
#   --seed       the validation run: known faults are put into the real scene (see "Validation")
#   --dump F,G   print every part's box, every figure's head and who holds which prop on those frames
#   --quiet      do not echo the summary
```

Output per segment (or range): `<out>/<seg>.json` (every finding: frame, shot, place, category, the two objects,
depth in cm, world point, screen point in 1080x1920 px, on screen or not, what hides it) and `<out>/<seg>.txt` (the
findings grouped into contiguous frame ranges per pair, worst on-screen depth first; off-screen-only ranges last).

Nothing is drawn: no GL, no browser, no render queue. It does not touch the render farm.

## How it works

* **The real World.** `check.ts` is bundled with esbuild and run in node. `stub.js` gives inert `document`, canvas
  and a WebGL renderer proxy (painted textures and PMREM env maps become no-ops). `new World(gl, camera)` then builds
  the real sets, props and rig cast (about 1 s). Every frame runs exactly what the film runs: `w.beginFrame(f)`,
  `SEG.pose(w, f)`, `w.endFrame(P)`, then `root.updateMatrixWorld(true)` (the renderer's call: it is what rebuilds
  the skirts, capes and beards of acc/garb.ts and acc/armour.ts, which hook `updateMatrixWorld`).
* **Real geometry.** Every volume is the triangles of a mesh the World built, in the mesh's own frame, placed by its
  `matrixWorld`; dynamic geometry (skirts, tubes) is re-read whenever its position attribute changes. Nothing is
  guessed from layout coordinates.
* **Parts.** Per figure (a rig): `body` (the torso lathe), `head` (skin + hair props + everything worn on the head:
  hats, crowns, the long beard), `armR/armL` (the limb tube read back as a chain of capsules from its rings, plus the
  shoulder ball), `handR/handL` (the hand ball), `legR/legL` (tube capsules + the foot mesh), `acc:<name>` (each
  accessory: `robe` / `armour` skirts, `pauldrons`, `swordBelt`, `hilt`, `cape` ...), `held:<name>` (a thing the rig
  itself holds: the guards' halberds). Per prop: one part (all its meshes). Per set mesh: one part per welded
  connected component (`tent.ware#43` = component 43 of the merged mesh `tent.ware`; `[k]` tells apart meshes that
  share a name). Ink hulls, depth-only twins, contact shadows, glows, flames and backdrops are left out.
* **Volumes.**
  * Meshes: a point is inside when at least 4 of the 6 axis rays (+-x, +-y, +-z) from it cross the surface an odd
    number of times (2D grids per axis make this fast). A closed mesh is exact; a mesh with one opening (a skirt open
    at the waist, a hat shell open under the rim, a cup's bowl) still works. Depth = the shortest of the odd rays'
    distances to the surface (exact on axis-aligned faces, an over-estimate up to about 1.7x on slanted ones).
  * Limbs: capsule chains, exact distance. Hands and shoulder caps: balls, exact.
  * Flat set pieces (walls, the flap, banners, sheets) have no volume; their surface points are tested against the
    other part's volume (a body through a wall shows as wall points inside the body).
* **Depth of a pair** = the deepest surface point of either part inside the other (vertices plus a 1.5-2 cm grid on
  long triangles). For two bodies this is the overlap; when a thin thing passes through a thick one it is how deep the
  thin one is buried; when a thick thing passes through a thin slab it is bounded by the slab's half thickness.
* **What is tested.**

  | category | pairs |
  |---|---|
  | `fig-fig` | every part of a figure against every part of every other figure |
  | `self-head` | a figure's arms and hands against its own head (hair, hat, beard); info says whether the arm is drawn in front (armFront) or under the head (rig rule 4: the arm then vanishes into the head) |
  | `self` | arms and hands against the own body, skirt, cape, belt, scabbard, hilt, pendant (not the pauldrons, bracers, boots: they are meant to wrap the limb); the first 10 cm from the shoulder are left out |
  | `held-holder` | a held thing against its holder, except the holding hand and the arm within 12 cm of it. A prop is held by a hand whose ball is within 3.5 cm of the prop's surface; a rig's own `held:` thing knows its hand |
  | `prop-fig`, `prop-prop`, `prop-set` | props (and figure-held things) against figures, each other and the set |
  | `fig-set` | figure parts against the set (tables, table legs and ware, pads, the commode, walls, door posts, the flap, racks ...) |
  | `seat` | a figure part against the thing it sits on (the set part under its seat top): Liu Bang's robe and the commode |
  | `rider` | a rider's legs, body and skirt inside the horse: BY DESIGN (props/horse.ts: the seat is 10 cm inside the back, the horse draws the legs); listed, not a fault |
  | `floor` | figure and prop points under the ground (y = 0 in every place) |
  | `float` | a prop that nobody holds, that touches nothing, with a gap under its lowest points; info gives its speed ("moving n cm/frame" = thrown, falling or jumping) |

* **Intended contacts that are not reported.** The pad a figure sits on (or rises from: `seated(.., { rise })` lifts
  the seat top) against its legs, skirt and body (the robe rests on the floor round a sitter by design). The legs of a
  figure sunk below the floor (`kneel()` sinks the figure by up to 0.38 m: the films' kneel). Own legs inside own
  skirt. Own head against own body.
* **On screen.** A pair whose overlap box is outside the camera frustum is skipped. A finding is `on` when its deepest
  point inside the frame is in front of the camera, inside 1080x1920, above the ground, not enclosed by a third part
  of either figure (a leg in a pad but under its own robe), and not hidden: the line of sight from the camera to it is
  marched and the first other solid it passes through is named in `behind` (then `on` is false). This is a point
  test: a deepest point hidden behind something can still have a visible edge.

## What it does not do / approximates

* Occlusion is judged at the deepest point only (see above). The figures' head-over-body stencil layering (rig rule
  4) is not modelled except as the `self-head` info.
* Shader effects are not geometry: ink hulls (outline thickness), the face drawing, the head's depth pull. A clip
  smaller than an outline (about 1 cm) may not show; one hidden by an outline is not known.
* The ground is y = 0 everywhere (the path's hills are not a floor).
* "Supported" for `float` = touching something within the tolerance or something solid straight under it; a prop that
  is meant to be in the air (thrown, falling, jumping on a slam) is reported with its speed: judge it.
* A prop is "held" only by proximity (3.5 cm): a hand that passes close to a prop that it does not hold is treated as
  holding it (its grip is then not tested).

## Validation (`--seed`)

`--seed` changes the real scene after the pose, before the test (and restores it), and the run is written as
`seed_<range>.json/.txt`:

* privy (frames 0-77, 2062-2091): the robe is not told about the commode (`group.userData.hmSeat` removed: the state
  before garb.ts setSeat / onSeat, the clip Jay saw) -> expect `seat` robe x commode, deep;
* elsewhere: a second standing figure is put 0.20 m beside the first (expect `fig-fig` body x body = R1 + R2 - 0.20,
  R from the body lathe's own geometry; the log prints the number);
* in the tent: a cup 8 cm over Liu Bang's table (expect `float` 8.0 cm), the wine vessel 5 cm into the floor
  (expect `floor` 5.0 cm), the pork leg through the middle of Fan Kuai's table top (expect `prop-set`).

Results of the last validation: /home/user/hm_notes/q_clearance.md.

## Files

`run.sh` (bundle + run), `check.ts` (the World, the parts, the tests, the report), `vol.ts` (triangle solids, capsule
chains, balls, sample points), `stub.js` (headless stubs).
