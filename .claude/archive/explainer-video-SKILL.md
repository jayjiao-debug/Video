---
name: explainer-video
description: Make a new cinematic, subtitle-only science/history explainer episode with the explainer/ pipeline (research, script on the 9-beat formula, music-anchored timing, Remotion scenes, QA stills, render). Use when asked to make, script, or render an explainer/知识 video, a new episode, or to change an existing episode's story or visuals.
---

# Making an explainer episode

The pipeline lives in `explainer/`; read `explainer/README.md` for the mechanics.
Episodes are `explainer/episodes/<id>/episode.yaml` (script) + `scenes.tsx`
(visuals). There is no narration: the story is carried by burned-in subtitle
lines over one background track (`assets/music/bgm.mp3`, not in git).

## 1. Research first, and write the sources down

- Pick a classic, well-documented case (a study, an experiment, a historical
  episode). Find the primary source or the book that popularised it.
- Verify every number, name, date and place you will put on screen with a web
  search. Prefer the original paper; note when a figure is a popular
  retelling (e.g. "as told in Ellenberg 2014").
- List the sources in the comment block at the top of `episode.yaml`, and put a
  short `cite:` on any scene that shows data.
- Label schematic visuals 示意. Hedge contested explanations
  ("一种解释是… 也有人指出…").
- Retell in your own words and images. Never copy another creator's script
  lines or visuals.

## 2. Structure the story on the music

Run `python3 make.py <id> --plan` once with a stub script to see the track's
markers, then map the 9 beats onto them:

| Beat | Music | Job |
|---|---|---|
| 1 Hook question | intro | an everyday "would you…?" question, plus the episode's central image |
| 2 Cold open | first full section | a person, a year, a place ("1943年，纽约…") |
| 3 Data / setup | same section | the obvious reading of the evidence |
| 4 Twist | **break** (quiet) | the expert says "不。" |
| 5 Mechanism | **build** | the toy model, step by step, ending on a question |
| 6 Reveal | **drop** | the answer lands on the drop, visually |
| 7 Name it + second layer | peak | the concept's name, then a second, surprising example |
| 8 Real world + 3 takeaways | peak | everyday cases, then three numbered questions or tips |
| 9 Callback | coda / outro | return to the opening image; one quiet closing line; end card |

Anchor beats 4, 5, 6 and 9 with `at:` (`break`, `build`, `drop`, a custom
marker). Keep one visual motif from the hook to the callback.

## 3. Write the lines

- One idea per line, ideally ≤ 22 Chinese characters (two subtitle rows max).
- `[gold]` marks the answer or key fact, `{red}` the trap or the wrong
  intuition. Use them sparingly, at most one per line.
- Use `hold:` for punch lines ("不。", "为什么？") and `pause:` for purely visual beats.
- Re-run `--plan` and fix every timing warning (add or cut lines, or move an anchor).

## 4. Build the scenes

- One component per scene in `scenes.tsx`, exported in `scenes`. Draw in
  stage coordinates (`useLayout().stage`, 1920×740 landscape) inside `<Stage>`.
- Time everything from cues: `const cue = useCue(); prog(f, cue(2), 20)`.
  Visual changes should land on the line that talks about them.
- Use the theme (`color`, `font`, `<T>`, `GlowDefs`, `countUp`). Gold is for
  answers and highlights, red for damage and traps, steel/dim for context.
- Prefer clean vector illustration: silhouettes, diagrams, animated charts with
  real numbers. Reuse shared shapes across scenes so the motif carries.
- `npx tsc --noEmit` must pass.

## 5. QA, then render

- `python3 make.py <id> --stills` renders one frame per subtitle line into
  `out/<id>-contact.jpg`. Look at it, then open individual stills in
  `out/<id>-stills/`. Check overlaps, readability, empty or too-busy frames,
  that each frame illustrates its line, and that the end card is there
  (`--stills <seconds>` for specific moments).
- `python3 make.py <id> --preview 45 70` renders a section with music.
- `python3 make.py <id>` produces `out/<id>.mp4` (h264 CRF 18 slow, AAC 256k,
  −14 LUFS). Spot-check the final file with ffprobe and a few extracted frames.
