I built the PS1-style clip as a three.js scene with a renderer script. The full 10 s clip renders and encodes: `ffprobe` shows 1920×1080, 30 fps, 300 frames, and it took about 57 s on the CI box. The MP4 and stills are in `/tmp/ps1`, outside the repo. I committed only sources, as `84539d6` on branch `api-task/ps1-test`. I used a one-off git identity for the commit because none was configured.

**What it is**
- **PS1 tricks, all in shaders:**
  - Vertex snapping to the 384×216 grid.
  - Affine texture mapping (the sand swims).
  - Procedural pixel textures of 16–64 px, nearest-filtered with no mipmaps.
  - Gouraud per-vertex lighting.
  - Per-vertex linear fog.
  - A post pass doing 5-bit colour plus 4×4 Bayer dither.
  - No anti-aliasing.
  - 3D updated at 15 fps, each image held for two 30 fps output frames.
  - Output upscaled ×5 with hard pixels.
- **Triangle counts:** terrain 220, figure about 156 (boxes, mitten hands, faceless), plus rocks, a dead tree and mesas.
- **Card (0–2 s):** a spinning low-poly cyan droplet with a stepped glow, 「第3天」, 「DAY 3」 and a blinking pixel-font "NOW LOADING…". It hard-cuts to the desert at 2.0 s.
- **Desert (2–10 s):** a low sun, a dusk sky, dunes, the walking figure with a blob shadow, and a camera that dollies back and then pans past him. The mirage pool is the only cyan thing: it fades in at about 6.6 s, flickers, and is gone by 9.5 s.
- **Overlay:**
  - Layout-D subtitles with gold underlines.
  - Top-right stamp with a gold hairline.
  - 10-segment water bar whose last segment flickers out at 4.0 s.
  - Hollow J seal, 70 px at 65 % opacity, 130 px from the right edge and 65 px from the bottom.
  - Nothing on the card except its own text.

**Checks**
- I looked at stills at 1.0, 3.0, 5.0, 7.5 and 9.0 s at full size. The dither, hard pixels, swimming sand, crisp subtitles and readable figure all show.
- The mirage is the brightest thing at 7.5 s.
- I rendered 3.0 s and 3.067 s and diffed them. They differ across the frame, which is consistent with vertex snapping while the camera moves.

**Knobs:** `notes.md` maps each trick to its place in the code. The main ones are the `K` object at the top of `main.js` (`SNAP`, `BITS`, `DITHER`, `FPS3D`, `FOG_NEAR`/`FOG_FAR`/`FOG_COL`, `TEX_UV_SCALE`, `W`/`H`), the terrain grid arrays `xs`/`zs` (polygon size), and the camera and mirage timing in `sceneAt` and `mirageAmt`.

**Render command** (run in `tasks/ps1-test/out/ps1/`; it runs `npm install three@0.160.0` on first use):
```
python3 render.py            # writes ps1_test.mp4 next to render.py
python3 render.py --out /tmp/ps1_test.mp4
python3 render.py --stills 1.0,3.0,5.0,7.5,9.0 --stills-dir /tmp/ps1
```
`--frames a:b` also works for partial renders.

**Weak spots and deviations**
- **Figure head:** the head wrap reads as a pinkish crown rather than a cloth wrap, so the face-up detail is a bit muddy.
- **Walk speed:** the figure moves at 1.7 m/s, so he looks a bit brisk.
- **Bar and card choices:** I picked "last segment drains" for the water bar and a 0.4 s blink for "NOW LOADING…".
- **`.gitignore`:** it also ignores `stills/`, which the brief didn't list.
- **Console warning:** Chromium logs a harmless "toNonIndexed already non-indexed" warning.
- **Dependencies:** `render.py` needs Chromium available to Python playwright.
- **Pixel font:** the Latin text is a 5×7 bitmap font I drew in canvas, so no font download is needed.

Files are in `tasks/ps1-test/out/ps1/`:
- `index.html`
- `main.js`
- `render.py`
- `notes.md`
- `.gitignore`
