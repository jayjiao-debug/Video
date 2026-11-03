# ep57 explanation shots — shared brief (2026-11-03)

The owner rejected the history section of the demo as a "PPT slideshow": still pictures with a slow zoom.
Each stop now has two explanation shots, and both must be **animated scenes**, not pictures:

- `<stop>_when` — **建于何时**, exactly **3.344 s** (2 bars).
- `<stop>_what` — **用来干什么**, exactly **5.016 s** (3 bars).

Music grid inside a shot: t = 0 is a downbeat (the kick, 咚); beats every **0.418 s**; bar **1.672 s**.
Hits (a landing, a pop, a stamp, a step) go on beats; the strongest on t = 0, 1.672, 3.344.

## What you deliver

1. One script per stop: `episodes/57-qiji/tools/shots/<stop>.py`.
   - `python3 <stop>.py OUTDIR` writes `OUTDIR/<stop>_when.html` and `OUTDIR/<stop>_what.html`.
2. Each page is self-contained:
   - 1920×1080, all content inside `<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden">`.
   - `window.DUR` = the shot length in seconds.
   - `window.render(t)` sets the whole frame for time t (0 ≤ t < DUR) and must be deterministic (seeded randomness only; no CSS animations, transitions or timers).
   - Build the DOM once. `render(t)` only updates transforms and attributes. The character may be rebuilt each frame (it is small).
   - Fonts:
     - `Noto Sans CJK SC`: system font.
     - LXGW WenKai: `<link rel="stylesheet" href="file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css">`.
3. Render and check every shot with `python3 episodes/57-qiji/tools/shots/render_shot.py PAGE.html OUTDIR`.
   - Use OUTDIR = `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/shots/<shot_id>`.
   - It prints a **motion score** and must print **PASS**: mean ≥ 2.5 and every 0.5 s window ≥ 1.2. The rejected slideshow scored 0.4–0.8.
   - Look at `sheet.jpg` (4 frames a second) and a few full frames. Fix what looks wrong, then iterate.
4. Do not commit and do not edit files other than your own new `shots/<stop>.py`. Import from the existing scripts, or copy code out of them; don't change them.

## What every shot must have

- **Depth layers with parallax.** Split the drawing into at least 3 layers (sky/far, middle, the monument, near foreground; 4–5 is better). Move them at different rates as the camera moves.
  - The `_what` sources (history drawings) are flat SVGs in painter's order: read the script that draws them and group by what each element is.
  - Painter's-order vectors keep what is behind the foreground, so you rarely get holes. Where a hole shows, extend the layer.
- **Real camera work (运镜).**
  - Dolly in or out, truck, crane up or down, a push to a low angle, a slight roll (≤ 2°), or a rack from one subject to another.
  - The `_when` and `_what` shots of a stop must use **different camera angles and framings** (e.g. a wide front view, then a low close angle from the side).
  - No whip pans: they strobe on phones. Keep any one layer's move ≤ 25 px per frame.
- **The character 「你」 is in both shots and moves.**
  - Use the rig in `tools/you_figure.py` (`figure(J, unit, face=True, tilt=..., fill=..., tag=False)`) with poses built by `tools/opt_comp.py` (`POSE`, `arms()`, `stand`, `FILLS` gradients).
  - See `tools/snap_test.py` `fig_svg(t)` for a waving arm driven by time.
  - Give it keyframed poses with eased interpolation (walk in with a bob on each beat, look up, point, jump back, cheer, bow, drop a coin...) plus idle breathing. It must be scaled correctly to the scene and lit to match it.
  - It is the white D+ 可爱 figure with a face; keep its look.
- **The gold 「你」 bubble** pops on the character in the first 0.4 s (scale 0.4 → 1 with overshoot) and follows the head with a slight bob.
  - Exact look:
    - Box: rounded rect 128×96, rx 30, fill `#F2C66E`, stroke `#2A211B` 5.
    - Tail: a small tail pointing down to just above the head.
    - Text: 「你」 in Noto Sans CJK SC 900, 66 px, `#2A211B`.
  - Hide it if the character leaves the frame.
- **Keep these zones free of key content** (subtitles and HUD go on top later; background is fine there):
  - Subtitles: x 150–1250, y 110–330.
  - Counter: x 1480–1800, y 55–135.
  - Odometer: x 130–720, y 960–1050.
  - Seal: x 1700–1800, y 950–1050.
  - Don't put subtitles, the counter or the odometer in your page.
- **The look.** It must match the drawings already in the film: hand-coded flat palette, ink `#2A211B` at 2–3 px, no photos, no embedded images, no traced shapes. CSS filters are allowed (sepia, blur for depth of field).

## `_when` = 「穿越时间轴」 in a **blueprint** style (CHANGED 08:21: owner: do NOT reuse the site drawings, they are only for the photo)

**Do not use `tools/<site>_vector.py` scenes or the site photos' framing at all in `_when`.** Use one shared, different style, the same at every stop, so it reads instantly:

- **Paper:** deep blueprint blue `#1D3557`→`#16263F` (subtle radial vignette) with a faint white grid (40 px, opacity .08; every 5th line .15), paper grain.
- **The timeline:** a long horizontal ruler across the lower third (y ≈ 760), with white year ticks and labels every 100 years (bigger every 500) and the era's name above the key years in small chalk letters.
  - From t = 0 the camera **trucks fast from right to left** along it, from 2026 back to the target year, easing out to land at **t = 1.672**.
  - Use parallax: grid slow, ruler 1×, foreground chalk dust and floating construction tools (a set square, compass or plumb line) 1.4×.
- **你 runs** along the ruler leftwards (backwards in time), with a run cycle (bob on beats) and speed lines. It skids to a stop at the landing, turns to camera and points up at the year. The gold 「你」 bubble pops in the first 0.4 s.
- **The big year counter** (Noto Sans CJK SC 900, about 190 px, `#FFF6E6`) rolls down with the truck and lands at t = 1.672 with a punch, with the label next to it (table below).
  - Place it upper-right (x about 1000–1800, y about 330–560), clear of the subtitle zone.
- **After the landing, the monument draws itself** in white chalk/blueprint line art above the ruler, as a simplified elevation of that monument:
  - Draw it stroke by stroke (`stroke-dashoffset`), base → walls → top, in about 3 beats.
  - Add dimension lines and a few construction marks (scaffold lines, a crane or ramp, tiny worker silhouettes in the era's dress) so "being built" reads.
  - The line art is new; you may take proportions from the site scripts, but render it only as lines on blueprint.
- **Camera after the landing:** a slow push and a slight roll toward the drawing.

| stop | target shown | label |
|---|---|---|
| chichen | 1100 | 公元 · 前后 |
| machu | 1450 | 年左右 |
| christ | 1931 | 年建成 |
| colosseum | 80 | 公元 · 年 |
| petra | 「公元前100」 | 约 · 年 |
| taj | 1632 | 年开工 |
| greatwall | 1505 | 年 · 明朝 |

## `_what` = 用来干什么: the history drawing, alive

Use the existing history drawing for the stop (`tools/hist_a.py`, `hist_b.py`, `hist_c.py` build them; names below), layered, with one clear story action timed to the beats, and 你 taking part.

| stop | drawing | the action (must read at phone size) |
|---|---|---|
| chichen | chichen_serpent | the 7 light triangles appear one per beat down the balustrade until the serpent head lights up; 你 watches, then jumps back on the last one |
| machu | machu_palace | the Inca ruler's procession walks along the terrace; smoke drifts; a sun disk rises over the temple; 你 bows as the ruler passes |
| christ | christ_1922 | coins drop into the donation box one per beat and a trail of coins arcs up to the summit, where the statue glows; 你 drops a coin, then opens its arms like the statue |
| colosseum | colosseum_return | streams of Romans move into the arches, banners wave, the camera cranes up over the wall to see the arena where two tiny gladiators duel; 你 cheers with both arms up |
| petra | petra_caravan | the camels walk (leg cycle, rope swing) up the Siq toward the Treasury, dust puffs; the camera dollies toward the Treasury façade; 你 walks beside the last camel |
| taj | taj_fort | the old emperor at the window; a gold gaze line draws to the far white Taj, whose reflection shimmers; 你 stands beside him, looks, puts a hand on its heart |
| greatwall | **new drawing** in the gw scene's style (`tools/gw_vector.py`) | northern riders gallop toward the wall and rein up; a beacon fire on a watchtower sends up smoke; 你 on the wall points at the beacon |

Text in a drawing: keep only the short gold labels that already exist, and only if they help. No new sentences: the subtitle carries the words.

## Before you report

- Both shots PASS the motion score.
- You have looked at the frames:
  - The character's joints are attached and scaled to the scene.
  - Nothing is popping or tearing between layers.
  - The zones are clear.
  - The action reads at 384×216.
- Reply in a few lines:
  - The script path.
  - The motion scores.
  - What moves in each shot.
  - What is still weak.
