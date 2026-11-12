# Shimmer test: does the picture crawl when the camera moves?

The complaint this tool measures: "when the camera moves, there are black spots flickering in the background".
The idea: **a still picture must not change when the camera moves by a fraction of a pixel.** The tool renders ONE
frame eight times, each time with the picture shifted by a known sub-pixel offset, moves the eight pictures back and
compares them. What is left is shimmer: dots that pop, dashes that break, lines that jump a whole pixel.
It needs one frame, not a clip, and it says which pass makes the shimmer (ink outlines, ambient occlusion, or the
scene itself).

## One command

```
python3 scripts/qa/shimmer/shimmer.py run <preview entry.ts> <out dir> --frame F [--size 540x960] [--opts '<json>']
```

Examples (out dirs go under `/home/user/hm_work/<your task>/`, never into the repo):

```
# the Hongmen opening, frame 55
python3 scripts/qa/shimmer/shimmer.py run src/videos/hongmen/preview/opening.ts /home/user/hm_work/x/open55 --frame 55 --opts '{"variant":"B"}'
# a film frame (absolute film frame number), at the film's size: 3 to 4 minutes, start it in the background
python3 scripts/qa/shimmer/shimmer.py run src/videos/hongmen/preview/film.ts /home/user/hm_work/x/tent860_1080 --frame 860 --size 1080x1920
# the Arthur film works too (the hook sets the input-props guard itself)
python3 scripts/qa/shimmer/shimmer.py run src/videos/arthur/preview/film.ts /home/user/hm_work/x/ar220 --frame 220
```

Time: 41 pictures. 540x960: 1 to 2 minutes. 1080x1920: 3 to 4 minutes (run it with `nohup ... &` and poll; the
shell limit is 120 s). Every render goes through `/home/user/hm_tools/still.sh`, so the machine-wide render lock is
kept; one hold of the lock is at most 17 pictures (`--per-call`).

Options: `--variants final,noink,noao,raw,mask` (default: all five), `--k 8` (jitters), `--spread N` (also move by whole
pixels up to N, see blind spots), `--thr 12`, `--sigma S`, `--roi x0,y0,x1,y1` (numbers for one region),
`--bundle <old run>/_bundle.js` (test the code of an earlier run again).
`shimmer.py analyse <out dir> [--thr ..] [--sigma ..] [--roi ..]` analyses a finished run again without rendering.

## What it prints

```
shimmer: src/videos/hongmen/preview/opening.ts frame 55, 540x960, 8 jitters, sigma 1.50 px, thr 12.0 levels, border 8 px
| variant | over_ppm | hot | p99.9 | max | mean |
| final | 22828 | 266 | 32.8 | 77.2 | 1.28 |      the picture as the harness makes it
| noink | 3176 | 72 | 18.2 | 33.0 | 0.74 |        ink outline pass off
| noao | 26255 | 286 | 35.7 | 93.3 | 1.31 |       N8AO off
| raw | 3313 | 58 | 20.2 | 43.3 | 0.67 |          both off: set, textures, shadows, the figures' own lines
| mask | 27862 | 274 | 42.7 | 95.2 | 0.90 |       the ink mask alone (black lines on white)
verdict: the post passes (ink + AO) add 19515 ppm to the raw picture's 3313 (allowed: 828): FAIL
share of the final over_ppm that goes away with the pass off: ink 86 %, ao -15 %
```

- **D** (per pixel) = max - min over the eight registered, low-passed pictures, the largest of R, G, B, in 8-bit levels.
- **over_ppm** = pixels with D > thr, per million pixels. The headline number. 10000 ppm = 1 % of the picture.
- **hot** = how many 16x16 px cells (at 540x960; 32x32 at 1080x1920) hold such a pixel: the number of PLACES that shimmer.
- **p99.9**, **max**, **mean** of D: how hard the worst places pop. A popping black dot gives 30 to 60; a clean edge under 10.
- **share**: 1 - (over_ppm with the pass off) / (over_ppm final). Negative = the picture shimmers MORE without the pass
  (AO darkens the picture under the ink lines, so it hides a little of the ink's shimmer; AO is not a source).

Files in the out dir: `sheet.png` (the heat maps of all variants side by side: look at this first), `heat_<variant>.png`
(D over the dimmed grey picture: nothing under thr / 2, yellow at thr, red at 2.5 x thr, white from 4 x thr),
`d_<variant>.png` (D x 2 as a grey picture, for other tools), `mean_final.png`, `report.json`, `report.md`,
`fr/f0000.png ..` (the pictures: variant by variant, eight jitters each, then one repeat), `manifest.json` (offsets,
options, time), `_bundle.js` (the exact code that was tested), `render.log`.

## Pass / fail

**PASS when `final over_ppm - raw over_ppm <= max(300, 0.25 x raw over_ppm)`** at thr 12: the post passes may add at
most a quarter to what the scene itself shimmers. On 2026-11-11 every tested scene of Hongmen and Arthur fails: by
6.5 to 26 times at 540x960, by 1.1 to 73 times at 1080x1920 (baseline: `/home/user/hm_work/flick/m/baseline.md`,
`/home/user/hm_notes/flicker_m.md`).

Why this rule and these numbers:
- thr 12 with the default low-pass is where the test agrees best with a real clip (next section): 99 % of the places
  that pop in the real push-in are over 12 in the jitter test, and no place the test calls quiet pops.
- What sits where on the D scale (measured on the Hongmen opening, 540x960): flat walls and the mat 0 to 1; drawn face
  lines up to 7; ordinary geometry edges (4x MSAA) 6 to 12; very high contrast MSAA edges (a bright door in a dark
  wall, thick black figure outlines on pale skin) 12 to 28, because MSAA resolves in linear light and the edge then
  moves in half-pixel steps on the display; ink lines that step a whole pixel 15 to 40; popping ink dots and broken
  dashes 30 to 80.
- So the raw picture is not zero at 540x960 (1300 to 25000 ppm, mostly figure outlines and bright / dark edges; at
  1080x1920 it is 0 to 1800) and a fixed number for the final picture would be unfair to figure-heavy shots. The rule
  measures what the post passes ADD.
- The raw number itself is for the set builders: thin geometry (rails, sticks, cords) shows up there. There is no
  pass / fail on it; compare with the baseline table.
- The low-pass grows with the picture (sigma = 1.5 px x height / 960), so numbers at 540x960 and 1080x1920 mean the
  same size on the viewer's screen and can be compared. The film is 1080x1920: judge fixes there; 540x960 is the quick
  check (measured: 3.1 to 5.2 times the over_ppm of 1080x1920 in eight scenes, 29 times in one).

## Is the number true? (validation)

Real consecutive frames of the Hongmen opening, frames 41..73 (the push-in; the camera's place is fixed there, so every
frame can be warped exactly into the view of frame 55 and the set must stand still), against the jitter test of frame
55 alone. Pictures: `/home/user/hm_work/flick/m/val/real_vs_jitter.png` (left: where real frames pop; right: the jitter
heat map) and the enlarged crops `val/crop_rail.png`, `crop_lid.png`, `crop_sticks.png`, `crop_boxtop.png`,
`crop_hem.png`, `crop_sign.png` (popping) and `crop_face_stable.png`, `crop_mat_stable.png`, `crop_wall_stable.png` (quiet).
- Of the 93 cells (16x16 px) of the set that pop in the real clip (D > 12) the jitter test flags 83 (89 %). The 10 it
  misses all lie on two features it does flag in the neighbouring cells (the top line of the reed screen and the top
  of the right box): the popping dots travel along such a line as the lens zooms, one frame shows one set of them.
  No popping FEATURE is missed.
- Of the 752 cells the jitter test calls quiet (max < 6) 8 pop in the real clip, the same 8 of those 10.
- The cell maxima correlate 0.87 (linear), 0.79 (rank). The same comparison on the set as it was an hour earlier:
  99 %, 0 of 772, 0.91 / 0.86.
- The jitter test flags 114 cells, 31 more than popped in these 33 frames: it measures what CAN pop; a slow
  one-second move does not visit every sampling phase.
- By eye (the crops): the black dots on the screen's top line and the pale stick that turns black for single frames
  are in the real frames and in the jittered pictures alike, and both heat maps light on them; the wall, the mat
  and the face stay dark in both.
- The hook changes nothing when it is idle: with zero jitter the four variants are pixel-identical to the harness's
  own options `ink:false`, `ao:false`, `raw:true` (0 pixels differ).
The comparison is `shimmer.py real <frames dir> <out> --cams cams.json --ref 55` (cams.json: `{ "<frame>": { pos, look,
fov } }`); it only works for a move that turns and zooms from one place.

## Blind spots (what a PASS does not prove)

1. ONE frame of a still scene. It does not see what changes with time or with the camera's place: a figure that
   switches its drawing, a level of detail that switches, z-fighting that depends on distance, one-frame glitches of
   a pose. For those: render the clip and run `scripts/rig3d/scan.py` / `sparkle.py`, or `shimmer.py real`.
   Test two or three frames of a camera move, not one.
2. Noise that is fixed to the SCREEN (N8AO's blue noise, dither) hardly moves against the picture under a sub-pixel
   shift. `--spread 3` adds whole-pixel moves. Measured on the opening (540x960): final 21518 against 21484 ppm, the
   mean of "ink off" 0.88 against 0.80 levels: no difference that matters, so the default is 0.
3. It tests the PREVIEW harness chain (N8AO -> ink -> NEUTRAL tone mapping). The film adds lens blur, bloom and the
   grade: blur hides shimmer in the background, a hard grade raises it. Not measured here.
4. over_ppm lumps together popping dots, broken dashes, whole-pixel line jumps and high-contrast edge crawl. Look at
   the heat map: white / magenta blobs are pops, thin yellow lines are crawl.
5. Size: one popping pixel must have a contrast of about 170 levels to pass thr 12 at 540x960 (at 1080x1920: a 2x2 px
   dot). Smaller or fainter specks are counted as invisible. `--thr 6` shows them.
6. A border of 8 px (14 px at 1080x1920) is not measured. With `--spread N` it grows by N.
7. A page without a postprocessing EffectComposer is not jittered (the hook prints a warning; use `shimmerJitter`).
8. Self-checks that print a WARNING: the same frame drawn twice differs (the entry keeps state or uses a clock);
   the pictures did not move by the offsets (more than 0.08 px left over).

## How it works

- `jitter.ts`: `shimmerOffset(k, spread)` (the fixed table: Halton 2,3 in [-0.5, 0.5) px) and
  `shimmerJitter(camera, w, h, k)` (camera.setViewOffset: the same image plane, moved; no parallax). Harness-independent;
  for a harness of your own.
- `hook.ts`: the page hook. `shimmer.py` writes a two-line wrapper entry (`import hook; import <your entry>`), so NO
  entry and NO harness file is edited. The hook patches postprocessing's `EffectComposer` in that page only:
  `addPass` (remembers the passes and the RenderPass camera), `render` (puts the offset on the camera's projection
  matrix for the render only, elements 8 and 9, then takes it off: the frame's own code never sees the jitter, the
  scene is identical in all eight pictures), and it wraps `window.__frame` so that `render.mjs --pick 0,1,2,..` gets
  (variant, jitter) pictures of the one frame under test. Variants are made by `pass.enabled = false` on the ink pass
  (a Pass named "InkPass") and the N8AO pass, and `ink.debug = 1` for the mask. It also sets
  `window.remotion_inputProps = "{}"` when missing (Arthur's film previews need it).
- `shimmer.py`: bundles wrapper + entry ONCE into `<out>/_bundle.js` (other people edit the tree while you test; all
  page loads of a run use this one bundle), renders through `still.sh`, then: every picture is moved back by its
  offset and low-passed in one Fourier step (exact for what the low-pass keeps), D = max - min.
- Deterministic: a fixed offset table, no clock, no random numbers, nothing depends on a previous frame.

Nothing outside `scripts/qa/shimmer/` was created or changed for this tool.
