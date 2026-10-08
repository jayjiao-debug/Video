---
name: video-engine-v1
description: Make a Juno / VIBE知识大赏 knowledge film the 《应该没事吧》 way — one principle told through several data-driven scenes, code-built in Remotion (3D with real downloaded models + 2D flat characters), timed to the music beats, rendered per scene on the GitHub Actions farm, then delivered with send version, scene clips, covers and Douyin posting copy. Use when asked to make, storyboard, render, fix or publish an episode with this engine.
---

# Video engine V1

A short (≈2:10) subtitle-only knowledge film for Douyin (audience mostly 18–23, China). No narration, no sound
effects: one music track, burned-in subtitles, code-built visuals. Everything on screen is a pure function of the global
time `T`, so any frame range renders on its own.

Read before starting: `references/craft.md` (story, tools, camera), `references/qa-lessons.md` (what broke before),
`references/delivery.md` (what to hand over, Douyin form, archive).

## 0. Working agreement with the creator
- **Discuss first.** Propose topics or a structure in plain words and wait for a choice. Show something to react to
  (a storyboard page, keyframes) before the long render.
- **Verify every fact** (numbers, names, dates, places) with sources before it goes on screen. Estimates say 估算.
- **Credible sources only. Never cite Wikipedia** (or 百度百科, Zhihu, blogs, content farms, AI summaries): anyone
  can edit them. Use them only to find leads, then cite the primary or authoritative source behind the claim.
  See `references/qa-lessons.md` → Sources.
- Give an honest producer-style verdict with each delivery: what's strong, what's weak, what you'd change next.
- Music only. No sound effects. No AI-generated video. No "Juno 出品".
- When they flag a problem in one scene, re-render **only that scene** and splice it in (step 6).

## 1. Topic and research
- Pick one principle and 4–6 scenes from different places, eras and scales that all show it, each
  with a number that can be made visual. Open on a concrete paradox, end on a question to the viewer.
- Research with web search; record sources. Read primary accounts — retellings get details wrong.
- Every on-screen number gets a row in the script's facts table: claim, source, URL. Each row needs a credible
  source (official report, peer-reviewed paper, government / UN body, national archive, the researchers' own
  publication, or an established news organisation for event facts). Wikipedia is never the cited source.

## 2. Script on the beat grid
- `python3 scripts/beats.py public/bgm.mp3 src/music.json` → beats + markers (break / build / drop / outro). Listen and
  nudge if the grid is off.
- Write every time as `b(i)`. Lines last 4–8 beats (≥ 2 s; ≈ 4.6 汉字/s). Key reveals land on a drop; the quiet
  section carries the slow, human part; the gap before a drop can freeze time (warp T).
- Typical shape (130.5 s track, drops at b32 and b160): cold open b0–b16 (slow, ask the question) → hook b16–b32 →
  drop b32 (the shocking number) → title card → scenes → second drop for the climax → return to the first image →
  end card in the last 6 s.
- Make a storyboard page (Artifact) per scene: tool chips, camera, transition, lines, a facts table with sources.

## 3. Assets
- Don't model what you're bad at. Download: Sketchfab (CC-BY, needs the `SKETCHFAB_TOKEN` Actions secret),
  Poly Haven (CC0 HDRIs/textures), raw URLs. The sandbox can't reach those sites; the **asset farm** can:
  `scripts/assets/` (workflow + fetch.mjs). Push a `request.json` (see request.example.json) to the `asset-farm`
  branch; results (GLB optimised to webp textures, thumbnails, credits.json) appear on `asset-output` under
  `out/<id>/`. Search first (`sketchfab-search` writes a thumbnail sheet), let the creator pick, then download.
- Put models in `public/models/`, measure them (trimesh) before fitting overlays to them.

## 4. Build scenes
- Project: Remotion 4 + React 18 + three r169 + @react-three/fiber 8 + @remotion/three. Start from `templates/`:
  `lib.ts` (b(), easing, camAt, mulberry), `ui.tsx` (Sub, Chapter, Stat, SubBand), `Scene3D.tsx` (asset cache,
  fonts gate, camera keys, instanced data, toScreen labels), `people2d.tsx` (2D character kit), `Film.tsx`
  (scene table + whole-film composition).
- One file per scene; each takes `T`, returns null outside its window, fades itself in/out. The film stacks scenes.
- Style: subtitles 56 px bold Noto Serif CJK, gold key words `#f6cf78` with glow, English 24 px italic at 42%;
  chapter label top-centre between gold hairlines; corner mark top-right; top-left clear.

## 5. QA stills, then render
- `COMP=<Comp> SCALE=0.5 node scripts/stills.mjs <dir> <t1> <t2> …` then `python3 scripts/sheet.py <dir> <sheet.png>`;
  look at every scene's key moments and transitions against `references/qa-lessons.md`.
### Where to render: GPU (Modal) vs CPU (GitHub) — decide per scene, before rendering
Owner rule (2026-10-06): "Try not to use the CPU [on Modal], rather use from GitHub." GitHub CPU is free; Modal GPU is cheap; Modal CPU is billed for nothing we can't do free.
- **Route by content, per scene** (scenes.json / the scene table in Film.tsx):
  - Scene draws **three.js / @remotion/three** (any WebGL) → **Modal T4**, Chrome flag **`--gl=vulkan`** (Remotion) /
    `--use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist` (raw Chrome). Measured: T4 ≈ 133 ms/frame vs
    1,275 ms on 8 CPU cores; L4 only ~7 % faster for ~35 % more money → **T4, not L4**, for WebGL.
    `egl` / `angle-gl` / `angle-egl` silently fall back to SwiftShader on Modal — check the renderer string in the log
    ("NVIDIA Tesla T4"), never assume.
  - Scene is **2D only** (SVG/CSS/canvas, subtitles, cards, maps) → **GitHub farm** (free, `--gl=swangle` is fine there).
    A GPU does not speed up ordinary 2D: the time goes to JS, layout, text, screenshot capture and encoding, all CPU
    (our bench: T4 ≈ L4 per frame because the leftover is screenshot overhead). Exception → treat as GPU: full-frame
    heavy CSS filters (large `blur()`, `backdrop-filter`, big shadows) or 2D drawn with WebGL/shaders (particles, shader BGs).
  - **Blender Cycles** (only if a hero shot truly needs ray tracing, owner-approved) → **Modal L4** (same $/frame as T4, 25 % faster).
- **Never request CPU-only Modal functions.** All CPU work runs on GitHub runners or locally: asset downloads, joining
  chunks, ffmpeg finishing, loudness, audio, QA. Inside a Modal GPU container encode with **NVENC** (`h264_nvenc`), not libx264.
- **Quality bar = 1080p** (owner: viewers watch landscape inside a portrait phone). No 4K supersampling, no film grain,
  no many-subframe motion blur unless the owner asks; deliver ~1.5–2 Mbps.
- **Parallelism is free** (per-second billing): split GPU work into up to 10 containers (Starter-plan GPU limit),
  ≥ ~30 frames each so container start-up (~30–60 s) stays a small share. GitHub: up to 20 chunks (the planner now
  defaults to 20 and auto-splits small fixes at ~24 frames/chunk — never render a fix as one chunk).
- **Fallback:** if a Modal job fails, times out, or the month's Modal spend is near the owner's cap, render the same
  frames on the GitHub farm (slower, free) and say so in crew_log.md. Never block delivery on Modal.
- **Fonts:** commit the subset CJK font files in the project (`fonts/`); the farm installs them from the repo and only
  falls back to apt with a 180 s timeout (an apt hang once cost 12 min).
- Modal plumbing: branch `modal-farm` (workflow `modal.yml`, push `job.json` + script) → results on `modal-output`
  under `out/<id>/`. Secrets `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` are repo secrets (repo is public: never write tokens
  into files). Benchmarks: modal-output `out/bench-01/summary.json`.
- **Status (2026-10-06):** raw three.js pages render on Modal T4 (ice-ship test). A Remotion composition render on
  Modal (`npx remotion render … --gl=vulkan`, split into ≤ 10 GPU chunks, NVENC) is the next build; until its first
  real test passes (time + $ logged here), Remotion films still render on the GitHub farm.

- GitHub farm (CPU, free, 20 parallel runners, SwiftShader WebGL):
  `python3 scripts/cloud_render.py <Comp> <name> --start A --end B` (chunks auto: ≤ 20, ~24+ frames each; env `VE_PROJECT`, `VE_FARM`,
  `VE_REPO`). Farm files: `scripts/farm/render.yml` + `plan.mjs` on the `render-farm` branch; output lands on
  `render-output` and is joined into `out/<name>_pic.mp4`. Whole film (~3900 frames, 20 chunks) ≈ 20 min on CPU.
  The farm files live on the project's `render-farm` branch: after changing them here, copy them there (cloud_render.py syncs sources, not the workflow).
- Long jobs: run in the background (`nohup … &`) and poll; a foreground command is killed at 10 min.

## 6. Finish, fix by scene, deliver
- `python3 scripts/finish.py out/<name>_pic.mp4 <tag> scenes.json` → music mux at −14 LUFS, send version
  (< 30 MB), glitch + black-frame scan, one clip per scene. Fix every reported glitch, then re-run.
- Fix one scene: render its frame range only, then
  `python3 scripts/splice.py out/<film>_pic.mp4 out/<fix>_pic.mp4 <start_frame> out/<film2>_pic.mp4` and finish again.
- Deliver: send version + changed scene clips in chat; covers (4:3 and 3:4, native renders); posting copy and the
  Douyin form fields (`references/delivery.md`); master via the `deliver` branch workflow
  (`scripts/deliver/deliver.yml`) when they want full quality.
- Archive every delivered version: `python3 scripts/archive.py <ep>-<tag> out/<film>.mp4 <Comp> --note "…"`.
