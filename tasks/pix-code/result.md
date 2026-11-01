I built the 12 s clip with a three.js character, four shots and the retro post. A full render to `/tmp` encoded fine at 1080×1920, 30 fps, 12.0 s. I looked at stills of the clean frames and of the post at 1.5, 4.5, 7.2 and 10.5 s. I also looked at video frames near the cuts and the blink. The one thing I didn't check is how the motion plays in the MP4 itself.

The source files are committed (`d85bf15`). That commit contains no MP4, PNG or font.

**Command to render the final MP4**
```
tasks/pix-code/out/render_all.sh /path/to/OUT.mp4
```
It fetches three@0.160.0 and the Fusion Pixel font, renders the 360 frames at 360×640, runs the post, writes the MP4 and deletes the frames. It took about 1 min 50 s here. It needs node, python3 with playwright and Chromium, numpy, pillow and ffmpeg.

For single frames:
```
python3 render_frames.py --out /tmp/c --times 1.5,4.5,7.2,10.5
python3 pix.py stills /tmp/p --frames /tmp/c 1.5 4.5 7.2 10.5
```

**What's built** (all in `tasks/pix-code/out/`)
- `scene/scene.js`: the boy is a chibi built from primitives (head about ¼ of his height).
  - **Face:** the face is painted on a canvas and redrawn every frame. It has thick brows that furrow, big dark eyes with highlights, lids for the squint and the blink at 1.2 s, blush, a nose bump, and a sweat drop sliding down his temple.
  - **Body:** dark spiky hair with a fringe, a sand shirt with a gold V collar, mitten hands, shoes and a backpack.
  - **Walk and sky:** a walk cycle for the wide shot, a shader sky with a big low sun, rolling dunes, a dead tree, and a long cast shadow.
- Shots 3 and 4:
  - **Bottle shot:** a translucent upside-down bottle with a mitten hand shaking it. A cyan drop swells at the mouth, leaves at about 6.45 s and hits the sand at about 6.78 s with a splash and a wet ring.
  - **Eye shot:** a 3D eyeball with lid shells, lashes and a brow, plus a painted iris. The iris holds a shimmering cyan mirage lake, and the shot has one slow blink at about 11.25 s.
- `render_frames.py`: headless Chromium with swiftshader and a local HTTP server. `window.renderFrame(i)` is deterministic with seeded randomness. `--times` renders single frames.
- `pix.py`: `picture(t)` now reads `frames/f_%04d.png` and BOX-downsamples to 180×320. I removed the fake camera, `SHOTS` images and `src/`, and added `--frames DIR`. Heat 3–6 s, mirage 9–12 s, subtitles, status box and the water bar are untouched.
- `.gitignore` and `notes.md`. The notes say where each shot is built and list the knobs.

**Knobs**
- **Pixelation and dither:** pixel size is `PX` in `pix.py` (6 gives 180×320), and the dither levels are `LEVELS` (7).
- **Glitch:** the burst width and chromatic aberration are in `crt()`, with `CUTS` as the cut times.
- **Colours and lights:** the palette is in `K` at the top of `scene.js`, including `water`, the only cyan. Light intensities are in each `shotN()`.
- **Drop timing:** `T_DROP0`, `T_REL` and `T_HIT`.

**What I checked**
- The face reads as a cute, grumpy boy with an expression.
- In the wide shot he sits in the top ~55 %, with his feet at about 51 %. The legs are clearly apart at 4.5 s and together at 4.7 s.
- The only cyan is the sweat drop, the falling drop and splash, the bar and "-1.25升", and the mirage lake.
- The status box and water bar are clear of the character in every shot.
- The shot-3 splash lands at about 57–60 % of the frame height, just above the subtitles, so it is only just clear of them.

**Weak or not done**
- **Walk:** the knee bend is subtle (only the legs scissor clearly). The arms swing only a little.
- **Face:** the mouth is a thin line that nearly vanishes at 180×320.
- **Hair:** the spikes are plain cones.
- **Hand:** the hand in shot 3 is a simple fist plus thumb ball, and the forearm leaves the top of the frame.
- **Shot-3 background:** the background is a dark fog, not a true depth-of-field blur.
- **Eye shot:** the skin around the eye is smooth and plain, and the closed-eyelid frame shows two stacked lash lines.
- **Mirage lake:** it is small, and the bloom and tone mapping make it a pale cyan. It is still the only cool colour there.
- **Splash timing:** the drop falls only about 20 cm, so it lands in 0.33 s rather than the 6.9 s the brief hints at.
- **Not tested:** I haven't run `render_all.sh` on the owner's machine. It assumes Playwright's Chromium is installed.
