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
skill; run its brand QA together with the QA step below.

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

Run `python3 make.py <id> --plan` to see the track's markers, then map the 9 beats:

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

## 4. Write the lines

- One idea per line, ≤ 22 Chinese characters. `[gold]` = answer, `{red}` = trap, at most one per line.
- `hold:` for punch lines ("不。", "为什么？"), `pause:` for visual beats.
- Fix every `--plan` timing warning.

## 5. Animate the scenes

- One component per scene in `scenes.tsx`, timed from cues: `const cue = useCue(); prog(f, cue(2), 20)`.
  Visual changes land on the line that talks about them.
- Compose with the art library inside a set; frame with `lookAt(tx, ty, zoom)`
  cameras (never raw offsets) and move the camera in most shots.
- Tension: `spring()` with overshoot for poses and pops, anticipation before big
  moves, secondary motion (props spinning, smoke, cloth), impact frames (flash,
  sparks, 2–3 frame decaying camera shake) on hits and on the music's drop,
  match cuts between scenes instead of fades to empty.
- **Never a still frame.** The owner noticed: after reading a subtitle, staring at
  a frozen picture for 2–3 s feels dead. Plan action for the *whole* line and the
  hold after it, not just its first second:
  - Every new line triggers a visible event (something enters, moves, lights up or changes).
  - Between events, something is still moving. Examples: a counter ticking, a feed
    scrolling, a highlight scanning a grid, a character working, a vehicle rolling,
    a ghost marker searching.
  - `FullFrame` already adds a slow drift, a push on each line and dust motes.
    These are a floor, not a substitute for scene action.
- Don't put a "?" on objects. Show "unknown" with motion (a rolling number, a
  searching marker, a dashed outline).
- `npx tsc --noEmit` must pass.

## 6. QA, then render

- `python3 make.py <id> --stills` (one frame per line) during work.
- On the final render, sample **every second** (`ffmpeg fps=1 … tile=4x6`) and
  review every sheet: empty transition frames, overlaps, labels on top of art,
  numbers showing 0.00 before they animate, anything off-frame.
- Run `python3 -m pipeline.stillness out/<id>.mp4 0.2`. It lists every stretch where
  the picture (outside the subtitles and the grain) barely moves. Any stretch
  longer than ~1.5 s needs scene action before sending.
- `python3 make.py <id>` → `out/<id>.mp4` (CRF 18 slow, −14 LUFS);
  `--share` for a small copy; chat uploads over ~30 MB fail, so send a 720p preview.
- Keep the user posted with short progress notes during long work.
- The repo is public: don't commit the BGM or videos containing it unless the user asks.
