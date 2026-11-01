# Task: a 10-second PS1-style low-poly test clip (scene code + renderer)

Nobody can answer questions. The owner (Jay) will judge the clip. Your job: write a small, self-contained three.js scene that looks like a 1990s PlayStation 1 game, plus a renderer script that turns it into an MP4. Check your own frames, fix what is weak, then commit **only the source files**: the repository is public, so no MP4/PNG/JPG may be saved in the repo folder. The owner's side renders the final video with your script.

## 1. Where it goes
Everything in `tasks/ps1-test/out/ps1/`:
- `index.html` (+ any `.js` files): the scene. No CDN at render time — the owner's machine cannot reach CDNs.
- `render.py`: the renderer (details in §4).
- `.gitignore`: `node_modules/`, `frames/`, `*.mp4`, `*.png`, `*.jpg`.
- `notes.md`: what each PS1 trick is and where its knob is (grid size, dither strength, fps, fog), so the owner's side can tune it.

## 2. The PS1 look (all of these, done in shaders, not faked with a filter on top)
1. **Vertex snapping (the signature wobble):** in the vertex shader, after projection, snap each vertex's screen position to the low-res pixel grid (e.g. `p.xy = floor(p.xy / p.w * halfRes + 0.5) / halfRes * p.w`), so geometry jitters when the camera moves. The camera must move so this shows.
2. **Affine texture mapping:** no perspective correction — pass `uv * w` and `w` as varyings and divide in the fragment shader, so textures swim/warp on big polygons (the sand ground especially).
3. **Tiny pixel textures:** 32–128 px, generated procedurally on a canvas (sand ripples, rock, cloth), `NearestFilter`, no mipmaps.
4. **Very low poly:** dunes ~150–300 triangles, the character ~100–200 triangles built from boxes (faceless, mitten hands), a few rocks, one dead tree, distant mesa silhouettes. Gouraud (per-vertex) lighting or baked vertex colours.
5. **Low resolution:** render the 3D at **384×216** (16:9), upscaled ×5 to 1920×1080 with hard pixels (`image-rendering: pixelated` or nearest).
6. **Limited colour + dithering:** quantise to 5 bits per channel with a 4×4 Bayer ordered dither (the visible checker pattern), as a post pass on the 384×216 render target.
7. **Draw distance:** linear fog into dusty haze; no anti-aliasing (jagged edges are good).
8. **Choppy motion:** the 3D updates at **15 fps**, so each 3D image is held for 2 output frames at 30 fps. The subtitle layer updates at 30 fps.

## 3. The clip (10.0 s, 30 fps, 1920×1080)
The episode is 「假如你7天不喝水」 (body water drains day by day). **Water is the hero:** the only cool cyan/white thing in the frame. Everything else is hot dusk ochre, rust and brown.

- **0.0–2.0 s: game chapter card.**
  - Black screen, a low-poly spinning water droplet (cyan, dithered, slight glow) in the centre.
  - Crisp 1080p text under it: 「第3天」 and small 「DAY 3」, plus a blinking 「NOW LOADING…」 bottom-right in a pixel-ish Latin font.
  - **Hard cut** at 2.0.
- **2.0–10.0 s: the desert at dusk.**
  - Low sun, a sky gradient, dunes, the lone faceless figure walking toward the camera with a simple limb-swing walk cycle and a dark blob shadow.
  - **2.0–6.0:** a low, fixed game-camera angle that slowly dollies back as he approaches (the wobble must be visible).
  - **6.0–10.0:** the camera pans past him toward the horizon, where a shimmering cyan **mirage pool** appears, flickers and vanishes by ~9.5.
- **Crisp overlay at full 1080p (HTML layer above the pixel canvas, never pixelated):**
  - **Subtitles top-left (layout D):** x ≈ 120 px, y ≈ 90 px. Cream `#F3E6C8` text, ~56 px bold Noto Sans CJK SC, soft dark shadow/scrim behind it. Words in [ ] are highlighted in the same cream with a 4 px gold `#C9A24A` underline.
    - 2.2–5.6: 「[第3天]：失水约[5%]。」
    - 5.8–9.8: 「头痛、烦躁、头晕，」 / 「远处好像有[水]。」 (two rows)
  - **Stamp top-right:** right edge at x ≈ 1800, y ≈ 70, two lines: 「第3天 · 失水约5%」 (32 px cream) / 「Exp Physiol 2025」 (24 px, 70 % opacity), with a thin gold vertical hairline to its right.
    - Under it, a PS1-game-HUD-style segmented water bar: 10 cyan segments; one segment drains (flickers out) at ~4.0 s.
  - **Seal:** a hollow J seal bottom-right: a ring outline + a J in line only, ~65 % opacity, about 70 px, ≥ 120 px from the right edge and ≥ 58 px from the bottom.
  - No overlay on the chapter card except its own text.
- **No real logos.** Do not imitate Sony/PlayStation boot screens or logos; the PS1 feel comes from the rendering only.

## 4. `render.py` (must run on a plain Linux box with Python playwright + Chromium + ffmpeg, no internet except npm)
- If `node_modules/three` is missing next to it, run `npm install three@0.160.0 --no-save --prefix <its folder>`.
- Serve its folder with a local HTTP server in a thread (ES modules don't load over file://). Import three from `./node_modules/three/build/three.module.js`.
- Launch Chromium headless with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` (software WebGL), viewport 1920×1080.
- The page exposes `window.renderFrame(i)` (deterministic: time = i/30, no `requestAnimationFrame` clock and no `Math.random` without a fixed seed). It returns when drawn and fonts are loaded (`document.fonts.ready`).
- For each frame 0…299: screenshot to `frames/f_0000.png`. Then
  ```
  ffmpeg -framerate 30 -i frames/f_%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart ps1_test.mp4
  ```
  and delete `frames/`.
- **Arguments:** `--out <path>` (default `ps1_test.mp4` next to it), `--frames a:b` for partial renders, `--stills t1,t2,…` to save single PNGs at given seconds (for checks).

## 5. Check before you finish
- Run `render.py --stills 1.0,3.0,5.0,7.5,9.0` to a folder **outside the repo** (e.g. `/tmp/ps1`).
- Look at them at full size: the dither pattern, hard pixels, jagged edges, and the swimming sand texture should be visible; the subtitles crisp; the figure readable as a person at a glance; the mirage the brightest thing at 7.5.
- Render two neighbouring stills 1/15 s apart while the camera moves (e.g. 3.0 and 3.067) to confirm the vertices snap and jitter.
- Fix what is weak, then render the full clip once to confirm it encodes. Don't commit it.

## 6. Final reply
- What you built and the knobs in notes.md (a few lines).
- The exact command to render.
- Anything that didn't work.

Only add files under `tasks/ps1-test/`. Never print secrets.
