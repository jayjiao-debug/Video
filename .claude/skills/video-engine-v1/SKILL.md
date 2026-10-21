---
name: video-engine-v1
description: Build, render and finish a Juno / VIBE知识大赏 film with the code engine — Remotion 4 + three.js scenes (real downloaded models, 2D characters), beat-timed from the measured music, stills and contact sheets for QA, per-scene renders on the GitHub/Modal farms, finish, splice and archive. Use for the build, render and fix stages of an episode; the order of work is in production-crew.
---

# Video engine V1

How to turn an approved storyboard into a film. What to make (story, look, taste) is decided upstream:
`production-crew/references/house-rules.md` is the owner's taste, and this skill doesn't repeat it.

Everything on screen is a pure function of the global time `T`, so any frame range renders on its own.

References: `references/craft.md` (choosing the tool and the camera), `references/qa-lessons.md` (rendering
bugs we hit and their fixes), `references/render.md` (where to render), `references/delivery.md` (what to hand
over).

## 1. Music → timing
- `python3 scripts/beats.py public/bgm.mp3 src/music.json` writes beats and markers (break / build / drop / outro).
  Check the grid against the audio (onsets, bar energy) before trusting it; nudge if off.
- Write every time as `b(i)`. Scene cuts on bars, reveals on beats, the title on the hardest drop
  (house-rules §8). The track itself is never edited (house-rules §8.1).

## 2. Assets
- Don't model what you're bad at. Download real models: Sketchfab (CC-BY, `SKETCHFAB_TOKEN` Actions secret), Poly
  Haven (CC0). The sandbox can't reach those sites; the **asset farm** can: push a `request.json` (see
  `scripts/assets/request.example.json`) to the `asset-farm` branch; results (optimised GLB, thumbnails,
  `credits.json`) appear on `asset-output` under `out/<id>/`. Search first, let the owner pick, then download.
- Put models in `public/models/` and measure them (trimesh) before fitting overlays.

## 3. Build scenes
- Stack: Remotion 4 + React 18 + three r169 + @react-three/fiber 8 + @remotion/three. Start from `templates/`:
  `lib.ts` (b(), easing, camAt, mulberry), `ui.tsx` (subtitle, chapter, stat), `Scene3D.tsx` (asset cache, fonts
  gate, camera keys, instanced data, toScreen labels), `people2d.tsx` (2D cast), `Film.tsx` (scene table + film).
  For later episodes, copy the latest episode kit (e.g. `episodes/<NN>/build/kit*.tsx`) instead of re-writing.
- One file per scene; each takes `T`, returns null outside its window. The film stacks scenes.
- People: place them from contacts and pass the pose/contact check (`production-crew/references/figure-rules.md`).
- No CSS 3D (rotateY, preserve-3d): headless Chrome drops tiles and mis-orders layers. Flips are `scaleX(cos θ)`
  with a back face and a shade overlay.

## 4. QA stills before any render
- `COMP=<Comp> SCALE=0.5 node scripts/stills.mjs <dir> <t1> <t2> …` then
  `python3 scripts/sheet.py <dir> <sheet.png>`. Look at every scene's key moments and both sides of every
  transition against `references/qa-lessons.md`.
- Send stills to the owner before a long render when anything visible changed (house-rules §11).

## 5. Render
Per scene, on the right farm: `references/render.md`.

## 6. Finish, fix by scene, archive
- `python3 scripts/finish.py out/<name>_pic.mp4 <tag> scenes.json` → music mux, send version (< 30 MB),
  glitch + black-frame scan, one clip per scene. Fix every reported glitch, then re-run.
  Note: finish.py still loudnorms the music to −14 LUFS and fades the last second, which conflicts with the
  untouched-music rule (house-rules §8.1). Until the owner settles it (`.claude/AUDIT.md`, question 1), say in
  `crew_log.md` which way you mixed.
- Fix one scene: render only its frame range, then
  `python3 scripts/splice.py out/<film>_pic.mp4 out/<fix>_pic.mp4 <start_frame> out/<film2>_pic.mp4`, finish again.
- Archive every delivered version:
  `python3 scripts/archive.py <ep>-<tag> out/<film>.mp4 <Comp> --note "…"`.
- Deliver per `references/delivery.md`.
