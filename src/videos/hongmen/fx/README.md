# fx/: the stable outline pass, and what else keeps a picture still

Files: `ink.ts` (the outline pass), `stable.ts` (settings and QA helpers for everything that is not ink),
`rim.ts` (the head rim light; not part of this story).
Numbers, pictures and what is left: `/home/user/hm_notes/flicker_fix.md`. The measurements behind it:
`/home/user/hm_notes/flicker_m.md` (the test), `flicker_a1.md` (the outline pass), `flicker_a2.md` (everything else).

## What caused the flicker (plain words)

"When the camera moves, black spots flicker in the background."

The black outlines on the SET (not on the figures) are drawn by a pass that runs after the picture is rendered. It
looks at a hidden copy of the set, one that stores for every pixel which way the surface faces and how far it is,
and draws a line where those values jump. That hidden copy had exactly ONE sample per pixel, taken at the pixel's
centre, with no smoothing. So:

- A thing thinner than a pixel (a wiping stick, a cord, the top of a rail seen from the side, the gap between two
  planks) is either hit by a pixel centre or missed. Hit: a full black line. Missed: nothing. When the camera
  moves by a fraction of a pixel, other centres hit. Dots and dashes pop in and out: **the black spots**.
- Every line sat on whole pixels. A nearly level edge was a staircase, and when the camera moved the steps ran
  along the line: **the crawl**.

It is in every film that uses `vasa/ink.ts` (Arthur too), on every set, whenever the camera moves; at the old
preview size (540x960) it is 3 to 5 times stronger than in the film. It was never the thresholds, the ambient
occlusion, the shadows or the textures (each measured; see the notes).

## What changed

`fx/ink.ts` is a copy of `vasa/ink.ts` with one idea added: **look at the set several times per frame, each time
shifted by a different fraction of a pixel, find the lines in each look with the SAME rule as before, and average
the results.** A line is now placed with sub-pixel precision, and a thing thinner than a pixel gets ink in
proportion to its size: a stick 0.4 px wide is a 40 % line in every frame, not a black line in one frame and
nothing in the next.

- Per frame only: the shifts are a fixed table (the same in every frame), no clock, no random number, nothing
  remembered from another frame. Render-farm chunks give identical pictures.
- The same edges get lines, of the same width and colour (measured: within 1 %); ink colour, fog tint, distance
  fade, `set()` and the `debug` modes are unchanged. `samples: 1` reproduces the old pass (to within 1 level of 255
  in the privy; a few dozen pixels next to figures differ because of the next point).
- Two extras: the "no set line over a figure" test now ignores one-pixel-wide runs of wrong depth (it could punch
  holes into a line), and flat areas are skipped (`skipFlat`, the same picture for less time).
- Same contract as the old pass: a `Pass` named "InkPass" placed before lens blur / bloom / tone mapping, works for
  Mesh and InstancedMesh and alpha-tested cut-outs (that part of the code is the old pass's, unchanged), `setSize`
  resizes all its buffers, it writes colour back into the composer's buffer and leaves the composer's depth
  texture alone.
- One thing to know: the set is drawn `samples` times per frame with an override material, so an object's
  `onBeforeRender` runs that many times: it must not count calls.

## How a NEW film adopts it

1. The import, one line (same exported names: `InkPass`, `NOINK`, `noInkFallback`, `InkOptions`):
   ```ts
   import { InkPass, noInkFallback } from "../hongmen/fx/ink";      // was "../vasa/ink"
   ```
2. The setting: nothing is needed (`new InkPass(scene, camera)` = 8 samples, the film quality). The switch:

   | `samples` (or `quality`) | what it buys | cost (see flicker_fix.md) |
   |---|---|---|
   | 8 (`"film"`, default) | the fix as measured (Arthur's tournament at film size: 22635 -> 377 ppm) | 1.3 to 1.5 x the old frame time (opening 3.9 -> 5.1 s at 1080x1920) |
   | 4 (`"preview"`) | most of it (the same shot: about 1000 ppm); near-level lines move in quarter-pixel steps | 1.1 to 1.2 x |
   | 1 (`"draft"`) | the OLD behaviour (flickers), the old cost | 1.0 x |
   | 16 | for a shot that still crawls on a very thin thing | about 1.7 x (by arithmetic, not timed) |

   Hongmen: `Film.tsx` reads `--props '{"inksamples":4}'`; the preview harnesses read `--opts '{"inkSamples":4}'`,
   `'{"oldInk":true}'` (the old pass, for comparison), `'{"inkSkip":false}'`, `'{"inkGate":"legacy"}'`.
3. Ambient occlusion: in a NEW `Film.tsx` write the numbers, not `quality`:
   ```tsx
   import { STABLE_AO } from "../hongmen/fx/stable";
   <N8AO {...STABLE_AO} aoRadius={..} distanceFalloff={..} intensity={..} color={..} />
   ```
   (the R3F wrapper silently falls back to its Low numbers when any other prop changes after the first frame). In a
   harness: `stableAO(new N8AOPostPass(scene, camera, w, h))`. Keep `multisampling={4}`.
4. Textures: every canvas / painted texture of a set through `stableTexture(tex)` (mipmaps, trilinear, anisotropy
   8). three's default already gives mipmaps; the helper makes it explicit and adds the anisotropy. Check a whole
   set once: `for (const l of auditTextures(set.group)) console.log("QA: texture " + l);`
5. Floor sheets: `for (const l of auditFloorSheets(set.group)) console.log("QA: " + l);` (rule 6 below).
6. A shadow box that follows something: `snapShadowBox(light, focus)` every frame before the render. A box that
   is fixed per place (as in Hongmen) needs nothing.

## Rules for set builders (what no pass can cover)

The pass now gives a fair average, but an average of 8 looks still moves in steps of 1/8, and some things change
with the view by nature.

1. **Nothing long and contrasty thinner than about half a film pixel** at the farthest camera that sees it. Half a
   pixel = distance x 2 tan(fov / 2) / 1920 / 2: 0.6 mm at 4 m with a 31 degree lens, 2.6 mm at 10 m with 46
   degrees. This also counts for the HEIGHT ON SCREEN of a face seen from the side (a rail top 3 cm deep seen 3
   degrees from above is 0.7 px tall) and for the gap between two planks. Cures: paint thin things into the
   texture; give a rail's top the colour of what is behind it; or put the prop on the `NOINK` layer.
2. **A step is either under 0.7 % or over 3.5 % of the camera distance** (under 3 cm or over 14 cm at 4 m). In
   between, its line has partial strength and fades in and out as the camera moves. "A few centimetres proud" is the
   worst choice. Flush or painted is fine.
3. **Round shapes: 12 or more sides, or smooth normals.** 8 flat sides give a 70 % line on every facet edge.
4. **No big flat top within about 1 degree of the camera's eye line** in a shot that moves: its far edge and its
   crease are one line that opens and closes.
5. **A figure stays 1.5 % of the distance + 3 cm clear of any set edge behind it** (9 cm at 4 m), or the set's
   line is drawn over the figure.
6. **A sheet on a floor where figures stand (mat, rug, path, spill) lies at most 1 mm over the floor**
   (`FLOOR_SHEET_MAX`), or the figures on it get `at.y` = the sheet's top. The rig's contact shadow lies 3 mm
   over the figure's floor; a sheet at the same height ties with it and the dark patch under the figure comes and
   goes. (This, not ink, was over half of the Hongmen opening's flicker.)
7. Judge flicker at the film's size. A 540x960 `still.sh` picture has a quarter of the film's samples and shows 3
   to 5 times the shimmer; `remotion_still.sh` stills are the film frame halved and are fair.

## QA: the shimmer test

```
python3 scripts/qa/shimmer/shimmer.py run <preview entry.ts> /home/user/hm_work/<task>/<name> --frame F --size 1080x1920 [--opts '<json>']
```
(3 to 4 minutes at 1080x1920: start it with `nohup ... &`; 1 to 2 minutes at 540x960. `scripts/qa/shimmer/README.md`.)
It renders the one frame eight times, shifted by fractions of a pixel, and reports the pixels that change
(`over_ppm`) for the picture (`final`), with ink off (`noink`), with ink and AO off (`raw`) and for the ink mask.

- **PASS: `final over_ppm - raw over_ppm <= max(300, 0.25 x raw over_ppm)`** (threshold 12, the tool prints the
  verdict). Judge at 1080x1920; run two or three frames of every camera move.
- For sets: look at `sheet.png`. **No 32 px cell with D > 20 in `final` that is under 12 in `noink`**; such a place
  breaks rule 1, 2 or 4. `raw` over 300 ppm at 1080x1920 on a set means thin geometry or a depth tie (rule 6), ink
  or no ink.
- A PASS says nothing about things that change with time (a pose glitch, z-fighting that depends on distance): for
  those render the clip.

## Old films

Arthur (and any film on `vasa/ink.ts`) gets the fix with ONE changed line in its `Film.tsx` (and the same line in its
preview harness), if it is ever rendered again. Not made: old films are not touched.
```ts
import { InkPass, noInkFallback } from "../hongmen/fx/ink";   // instead of "../vasa/ink"
```
Measured through a scratch entry that swaps the pass from outside (Arthur, the tournament, frame 470, shimmer
over_ppm): 1080x1920: 22635 -> 377 (with ink off: 754); 540x960: 77177 -> 15595 (with ink off: 24239). The look:
`/home/user/hm_work/flick/f/pics/ab_arthur470_1080_x3.png`. Table: `/home/user/hm_notes/flicker_fix.md`.
