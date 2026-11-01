# pix-code: code-built 3D test clip (three.js) + retro post

Render the MP4: `tasks/pix-code/out/render_all.sh /tmp/pix.mp4` (about 2 min on a CI runner; needs node, python3 + playwright/chromium, numpy, pillow, ffmpeg).
Single frames: `python3 render_frames.py --out /tmp/clean --times 1.5,4.5,7.2,10.5`, then `python3 pix.py stills /tmp/post --frames /tmp/clean 1.5 4.5 7.2 10.5`.

## Where things are (scene/scene.js)
- `K` (top): colours (skin, shirt, trousers, hair, `water` = the only cyan), sun direction, exposure.
- `drawFace()` + `FACE_*`: painted face canvas (brows, eyes with highlights, lids, blush, nose, mouth). Redrawn every frame from `faceExpr(t)`: squint, brow furrow, blink at 1.2 s.
- `makeBoy()`: the character. Head ≈ 1/4 of height; head sphere with a front-projected face patch; hair = tilted cap + cone spikes + fringe; tapered-cylinder shirt with a gold V collar; mitten hands; shoes; backpack.
- `poseBoy()`: walk cycle (legs/knees/arms/torso/head bob).
- World: `skyMat` (shader sky + big low sun), `hgt()` dunes, `deadTree()`, fog = haze colour `HAZE`.
- `bottleGroup`, `poseBottle()`, `updateDrop()`: shot 3 hand + bottle. Timing knobs `T_DROP0/T_REL/T_HIT` (drop forms 6.1, leaves 6.45, hits sand 6.78).
- `E`, `drawIris()`: shot 4 eye (eyeball, painted iris with mirage lake, lid shells, lashes, brow).
- `shot1..shot4(t)`: camera, lights and visibility per shot. Cuts are hard.
- Everything is a pure function of the frame index (`window.renderFrame(i)`), seeded randomness only.

## Knobs in pix.py
- `PX` (6 = 180x320 grid; try 5 or 8), `LEVELS` (7 colour levels per channel, dither strength 1.05 in `dither`).
- Glitch: `crt()`: burst width 0.12 s around `CUTS`, chromatic aberration `ca = 3 + 14*burst`, scanline darkening 0.88, vignette 0.28.
- Heat shimmer (`heat`, 3-6 s) and mirage shimmer (`mirage`, 9-12 s) flags are in `SHOTS`.
- Subtitle/status text, timings and values are unchanged from the original.
- `picture(t)` reads `frames/f_%04d.png` (360x640, BOX-downsampled to 180x320).
