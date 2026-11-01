# Task: a 12-second "pixelated 3D" test clip with code-built characters (three.js) + retro post

Nobody can answer questions. The owner (Jay) will judge the clip against a viral Douyin reference. Build it well, check your own frames, fix what's weak, then commit **only source files**. The repo is public: never save MP4/PNG/JPG/fonts in the repo folder (render to `/tmp`). The owner's side renders the final video with your scripts.

## 1. The target look (from the reference the owner sent)
- **Characters are 3D models built in code** — not AI images, not real photos — in a cute stylized style.
  - **Proportions:** chibi-ish; the head is about 1/4 of the height.
  - **Shading:** smooth, not faceted, simple primitives:
    - head: sphere or rounded capsule;
    - hair: merged spheres/caps, a fringe, sometimes a bun;
    - body: tapered cylinder or box clothes with colour bands (e.g. a gold V collar);
    - hands: mitten spheres;
    - feet: simple shoes.
  - **Expressive faces painted as canvas textures:** thick dark brows, big dark eyes with a white highlight, a small nose bump, a simple mouth line, a light blush. Expressions change (brows furrow, eyes squint, blink).
- **Modern, cinematic lighting:** a warm key, a soft fill, a rim light, soft or contact shadows, light rays/bloom. It looks like a clean little game cutscene before the post-processing.
- **The retro layer on top** (this part is already written, see §3):
  - render at very low resolution and upscale with hard pixels;
  - ordered Bayer dithering;
  - chromatic aberration (red/cyan fringes), scanlines, noise specks, thin glitch streaks, band tears at cuts;
  - a pixel-font subtitle with a thick black outline and gold keywords;
  - an RPG-style status box (black with a gold border) top-left.
- **Format:** vertical **1080×1920, 30 fps, 12.0 s**.

## 2. The clip: episode 「假如你7天不喝水」, day 3
One character: a young man in a sand-coloured short-sleeve shirt and dark trousers, dark spiky hair. The desert is at dusk: orange, ochre and rust, with a big low sun. **Water is the only cool cyan/blue thing** in every shot.

| Time | Shot | What happens (it must move: no static frames) |
|---|---|---|
| 0.0–3.0 | **Face close-up**, sun behind him | He squints, brows furrow slowly, one blink at ~1.2 s, a sweat drop slides down his temple, his head sways slightly. Slow push-in. |
| 3.0–6.0 | **Wide desert shot** | He trudges away from camera toward the low sun across dunes, with a real walk cycle (legs, arms, head bob) and a long shadow. A dead tree. Heat shimmer is handled by the post. Camera slowly pushes in. **Keep him in the upper 55 % of the frame**: subtitles sit at y ≈ 1150–1350. |
| 6.0–9.0 | **Hand + empty plastic bottle**, upside down | His mitten hand shakes it; one last cyan drop falls out of the mouth at ~6.5 s and hits the sand with a tiny splash. Background sand softly out of focus (or just simpler and darker). |
| 9.0–12.0 | **Extreme close-up of one eye** | A dark brown iris with a highlight; a small shimmering cyan lake (the mirage) reflected in it. Slow push-in into the eye; one slow blink near the end. |

Cuts are hard cuts (the post adds a glitch burst at 3.0, 6.0 and 9.0).

## 3. Use the post-processing script that's already written
`tasks/pix-code/in/pix.py` does the whole retro layer and the UI:
- pixelate, dither, grade, bloom, heat shimmer and mirage shimmer;
- CRT effects, glitch bursts at cuts;
- subtitles, status box, water bar, and the floating 「-1.25升」.

The subtitle text, timings and status values in it are final.

**Today it reads 4 static AI images and fakes the camera.** Change it so that `picture(t)` reads **your rendered frames** instead:
- e.g. `frames/f_%04d.png` rendered at **360×640**, BOX-downsampled to its low-res grid;
- drop the fake camera, the `SHOTS` images and the `src/` folder;
- keep everything else, including the heat flag for 3–6 s and the mirage flag for 9–12 s.

**Font:** pix.py needs the Fusion Pixel font (OFL) at `font/package/fusion-pixel.ttf`. Fetch it in the render script with
```
npm pack @fontpkg/fusion-pixel && tar xzf fontpkg-fusion-pixel-*.tgz -C font
```
Don't commit it.

## 4. Files (all in `tasks/pix-code/out/`)
- **`scene/index.html` + `scene/scene.js`:** three.js (`npm install three@0.160.0 --no-save` next to it, imported from `./node_modules/three/build/three.module.js`, no CDN).
  - Deterministic: `window.renderFrame(i)` draws frame i (t = i/30), with no rAF clock and seeded randomness only.
  - Renders at 360×640 with antialiasing on (the post does the pixelation).
- **`render_frames.py`:** Python playwright + Chromium headless, launched with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
  - Serves the folder with a local HTTP server and saves `frames/f_0000.png …` (360 frames).
  - Option `--times 1.5,4.5,7.2,10.5` for single frames.
- **`pix.py`:** the adapted post. `pix.py video OUT.mp4 --frames DIR` and `pix.py stills OUTDIR --frames DIR t1 t2 …`.
- **`render_all.sh`:** fetch the deps, render the frames, run the post, write the MP4 (path as argument), delete the frames.
- **`.gitignore`:** `node_modules/`, `frames/`, `font/`, `*.mp4`, `*.png`, `*.jpg`, `*.tgz`.
- **`notes.md`:** where each character/shot is built, and the knobs (pixel size, dither levels, glitch amount, colours).

## 5. Check before you finish
- Render the clean frames at 1.5, 4.5, 7.2 and 10.5 s, and the post stills at the same times, to `/tmp`.
- Look at them **at full size**:
  - the character must read instantly as a cute person with an expression;
  - the walk must read as walking in two frames 0.2 s apart;
  - the drop and the mirage must be the only cyan things;
  - nothing must be hidden behind the subtitles or the status box.
- Compare with the look in §1 and fix what's weak: the face texture and the lighting matter most.
- Render the full clip once to `/tmp` to confirm it encodes.

## 6. Final reply
- What you built and the knobs.
- The exact command to render the final MP4.
- Anything weak or not done.

Only add files under `tasks/pix-code/`. Never print secrets.
