---
name: explainer-video
description: Make a cinematic, subtitle-only science/history explainer episode with the explainer/ pipeline, art-direction first (study reference, art bible, model sheets, motion test, user approval), then script on the 9-beat formula, music-anchored timing, Remotion scenes built from the shared art library, every-second QA, render. Use when asked to make, script, design, animate or render an explainer/知识 video, a new episode, new characters/sets/props, or to change an existing episode's story or visuals.
---

# Making an explainer episode

The pipeline lives in `explainer/`; read `explainer/README.md` for the mechanics.
Episodes are `explainer/episodes/<id>/episode.yaml` (script) + `scenes.tsx`
(visuals). There is no narration: the story is carried by burned-in subtitle
lines over one background track the user supplies (`assets/music/bgm.mp3`, not in git).

Branding (title card, corner mark, end card, copy voice) follows the `juno-brand`
skill; run its brand QA together with the QA step below. Every character pose,
hand and arm follows the `character-motion` skill (motion reference, joint limits).

The user approved this workflow. Follow it in order and do not skip the
approval gates: **reference → research → art → approval → animate → QA → render.**

## Where the code is

The pipeline and art library live in the GitHub repo **jayjiao-debug/Video**
(branch `claude/hopeful-curie-hm3mlq` until it is merged to `main`), under `explainer/`.
If this session has no checkout, clone it first. If the session cannot run code at all
(a plain chat), still follow the rules here and produce scripts, designs and
prompts. Say so to the owner instead of pretending to render.

## 0. If the user shares a reference video, study it first

- Download it, then sample it: a contact sheet every ~20 s, and upscaled crops of
  character- and set-heavy frames (crop the video area, scale ×3).
- Check for narration before planning audio: run SenseVoice (sherpa-onnx, model
  from GitHub releases) on a few 25 s chunks. The reference series had none.
- Read the burned-in subtitles (dedupe strips of the subtitle band, tile them) to
  recover its scripts, then name what makes it work: sets, light, characters,
  props, story structure. Retell topics in your own words; never copy lines or visuals.

## 1. Research, and write the sources down

- Pick a classic, well-documented case; find the primary source or the book that popularised it.
- Verify every number, name, date and place with a web search; note popular
  retellings ("as told in Ellenberg 2014").
- Sources go in the comment block at the top of `episode.yaml`; data scenes get `cite:`.
- Label schematic visuals 示意; hedge contested explanations ("一种解释是… 也有人指出…").

## 2. Art direction before any animation (approval gate)

The first draft failed because it was diagrams on a black void with icon
people. What the user wants, and approved:

- **Sets, not diagrams.** Every shot is a place (airfield, study, street, sky)
  built as parallax layers: sky → far → mid → ground → hero → foreground.
  Each layer that can be zoomed carries its own ground strip so no seam opens.
- **Motivated light.** One warm practical key (lamp, window, fire, searchlight)
  plus cool moon/sky rim. Grade lit subjects into the scene (`grade-night`) so
  nothing looks pasted on.
- **Characters from the shared rig** (`src/art/Figure.tsx`): one skeleton and
  proportions for the whole cast, tapered limbs, IK hand targets (`reach`),
  blink, six expressions, back view and silhouette + rim light for storytelling
  shots. Keep real-world scale next to props (a person is ~⅓ of a B-17's fin).
- **Palette discipline** (`src/art/palette.ts`): night blues + warm amber; gold
  only for answers, red only for damage and traps.
- **Period-accurate props** with material gradients (`src/art/materials.tsx`).

Process:
1. Add or extend assets in `src/art/` (palette, materials, `Figure`/`cast.ts`,
   props, `sets/`). New assets reuse the palette, materials and rig.
2. Put each asset on a model sheet in `src/Gallery.tsx` and render:
   `COMPOSITION=Gallery REMOTION_BROWSER=<headless_shell> node scripts/stills.mjs <id> out/gallery 0 1 2 …`
   (run `make.py <id> --plan` first so the new labels' glyphs are in the font subset).
   Look at every sheet yourself and fix what is wrong before showing anyone:
   stick limbs, detached parts, oversized eyes, heavy outlines, wrong scale,
   floating vehicles, things too bright for the scene.
3. Build a 5-second motion test (`src/MotionTest.tsx` pattern): camera move with
   parallax, a walk into a sprung pose change, an impact beat. Check frames.
4. Send the sheets and the motion test to the user and **wait for approval**
   of the direction before building scenes. Then build the remaining sets and FX
   to the same standard.

## 3. Structure the story on the music

**Get the owner's track before timing anything.** Building on a placeholder
track wastes a pass: every cut moves when the real one arrives. If you must
start early, say so, and keep a synthetic placeholder local (never commit it).

Read the track first, not just its markers:
- `python3 make.py <id> --plan` prints break/build/drop/outro; also print the
  energy curve per 2 s and the accents (`music.hits`, strength 0–1) for the
  first 20 s. Note the strongest accents by time: the cold-open hit, the title
  card's first stamp, the first downbeat of the full section, the drop.
- **Match picture energy to the music's energy.** The loudest section gets the
  most motion (fast camera, things pouring, cuts on the beat); the quiet break
  gets stillness (one slow move, one object). The owner called the reverse
  ("slow writing at a desk over the loudest part, frantic numbers over the
  intro") awful. Print each scene's mean energy next to its content and check.

Then map the 9 beats:

| Beat | Music | Job |
|---|---|---|
| 1 Hook question | intro | an everyday "would you…?" question, plus the central image |
| 2 Cold open | first full section | a person, a year, a place ("1943年，纽约…") |
| 3 Data / setup | same section | the obvious reading of the evidence |
| 4 Twist | **break** (quiet) | the expert says "不。" |
| 5 Mechanism | **build** | the toy model, step by step, ending on a question |
| 6 Reveal | **drop** | the answer lands on the drop, visually |
| 7 Name it + second layer | peak | the concept's name, then a second, surprising example |
| 8 Real world + 3 takeaways | peak | everyday cases, then three numbered questions or tips |
| 9 Callback | coda / outro | return to the opening image; one quiet closing line; end card |

Anchor beats 4, 5, 6 and 9 with `at:`. Keep one visual motif from hook to callback.

Story flow (what the owner rejected and why):
- **The hook must hit in 3 s.** A slow, abstract image (a pan along a book's
  page edge) was "太弱". Open already moving, on the track's first accent, with
  the counterintuitive claim made visible (numbers freeze, their first digits pour
  into nine tubes, "30%" slams on the next accent). Stating the surprising *what*
  up front is fine; then the middle must drive toward *why*.
- **No exposition dumps in the middle.** If the hook already gave the answer,
  don't spend 30 s on background and then a "不。" that surprises no one. Each
  scene should show the mechanism happening (the book's front pages visibly
  darkening as numbers flow into them), not explain context.
- Keep the twist a real reversal of what the viewer now believes.

## 4. Write the lines

- One idea per line, ≤ 22 Chinese characters. `[gold]` = answer, `{red}` = trap, at most one per line.
- `hold:` for punch lines ("不。", "为什么？"), `pause:` for visual beats.
- Fix every `--plan` timing warning.
- **Pin a line to an accent:** a scene's natural length is lead + Σ(hold + gap)
  + tail, scaled to its window; set `lead`, `tail` and every `hold` so the sum
  equals the window (scale ≈ 1). Then the plan's beat-snap lands each line on
  the accent you chose. A YAML line that starts with `[` must be quoted
  (`- "[1]。是9的六倍还多。"`), or YAML reads it as a list.

## 5. Animate the scenes

- One component per scene in `scenes.tsx`, timed from cues: `const cue = useCue(); prog(f, cue(2), 20)`.
  Visual changes land on the line that talks about them.
- Compose with the art library inside a set; frame with `lookAt(tx, ty, zoom)`
  cameras (never raw offsets) and move the camera in most shots.
- **Flow: one continuous world, not a slideshow.** The owner's word for cutting
  between unrelated worlds (number void → title → blue exterior → warm study →
  paper insert → book edge → paper → hands) was "awful". Rules:
  - Every cut carries something across: the same object, shape, colour or
    camera direction. The title card's bars become the book's worn fore-edge;
    the pages fly out of the window and fall through snow that becomes archive dust.
  - Prefer one camera travelling through one set over many inserts. Use the
    velocity-continuous spline camera (`camPath(keys, f)` in
    `episodes/benford/art.tsx`: Catmull-Rom on x, y, log-zoom) so moves flow
    into each other instead of stopping and starting; add `MotionBlur` (blur from
    `camSpeed`) on whips so a fast move reads as a whip, not a jump. Keep the blur's
    zoom term small, or pushes smear the whole frame.
  - Parallax: a wall layer at `depth` d shows the point wx centred when the
    camera's hero-plane target is `tx = 960 + (wx - 960) / d`. Use that to aim at a
    window or poster on a back layer.
  - Don't change the colour world mid-scene (a blue night exterior between two
    warm interiors) unless the story jumps in time, and then bridge it.
- Characters: pose from reference and the rig's joint limits (`character-motion`).
  Never overlay a hand-drawn hand or thumb on top of a rig arm (it reads as a second arm).
- Tension: `spring()` with overshoot for poses and pops, anticipation before big
  moves, secondary motion (props spinning, smoke, cloth), impact frames (flash,
  sparks, 2–3 frame decaying camera shake) on hits and on the music's drop,
  match cuts between scenes instead of fades to empty.
- **Impact, not wobble.** Judge every motion as a viewer would:
  - **Text, numbers and titles stay still once they have landed.** That covers
    labels, counters, charts and the title card. They may enter with a spring or
    a slam and leave with a move, but they never float, bob, sway, jitter or
    pulse in scale while being read. Moving type is hard to read and looks like
    shimmer (the owner called it out).
  - Motion belongs to the world and the story: people doing things with objects
    (pulling a wheel off, chalking a number, walking a row), vehicles, smoke,
    light sweeping across a surface, a feed that steps up a row.
  - Camera: eased moves that start and stop. Don't use a perpetual float. A slow
    push or a dive is a move; a shot that settles and holds is fine.
  - Cut and hit on the music. `useHitFrames()` / `useSnapBeat()` give the
    track's accents. Land reveals, cuts and impacts (`Impact`, a short decaying
    shake) on them, and contrast them with calm. A quiet stretch before a drop
    builds tension.
  - Transitions are ideas, not fades. Carry something across the cut: the
    ledger's numbers fall into the jar, a wheel hub becomes a home button, the
    camera dives into a shape and comes out of the same shape.
  - Holds: after a line, the shot may hold if something in the world is alive
    (a character working, light, smoke). Dead air is a frozen frame with nothing
    happening, not "the text isn't moving".
  - `FullFrame` drift and beat punch are opt-in (`drift`, `punch`), only for pure
    picture shots with no on-screen text.
- Don't put a "?" on objects. Show "unknown" with motion (a rolling number, a
  searching marker, a dashed outline).
- `npx tsc --noEmit` must pass.
- Rendering gotchas:
  - Headless Chrome ignores `mix-blend-mode` inside SVG: a "soft-light" or
    "screen" overlay renders as a plain opaque wash and hides what's under it.
    Use plain opacity.
  - Cormorant uses old-style figures by default ("1" looks like "I"). Any number
    on screen needs `fontVariantNumeric: 'lining-nums'` (put it on the root `<svg>`).
  - A gradient meant to read at a glance (wear, heat) needs a perceptual ramp, not
    raw percentages mapped to opacity; check it standalone in headless Chrome.
  - If stills don't change after an edit, `rm -rf node_modules/.cache`.
  - Shell calls time out at 10 min: start long renders detached
    (`setsid nohup python3 make.py … &`) and poll the log.

## 6. QA, then render

- `python3 make.py <id> --stills` (one frame per line) during work.
- On the final render, sample **every second** (`ffmpeg fps=1 … tile=4x6`) and
  review every sheet: empty transition frames, overlaps, labels on top of art,
  numbers showing 0.00 before they animate, anything off-frame.
- Run `python3 -m pipeline.stillness out/<id>.mp4 0.2`. It lists every stretch where
  the picture (outside the subtitles and the grain) barely moves. Any stretch
  longer than ~1.5 s needs scene action before sending.
- **Cut check:** sample 10 fps across every scene boundary
  (`ffmpeg -ss <t-0.4> -t 0.9 -vf fps=10,tile=9x1`) and stack them; nothing should
  jump to an unrelated world, flash empty, or blur into mush.
- **Sync check:** grab frames 0.05 s before and after each accent you used
  (freeze, stamps, cuts, drop); the change must land within one frame.
- `python3 make.py <id>` → `out/<id>.mp4` (CRF 18 slow, −14 LUFS);
  `--share` for a small copy; chat uploads over ~30 MB fail, so send a 720p preview.
- Keep the user posted with short progress notes during long work.
- The repo is public: don't commit the BGM or videos containing it unless the user asks.
