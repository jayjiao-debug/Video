# Where and how to render

Owner rule (2026-10-06): GitHub CPU is free; Modal GPU is cheap; never pay for Modal CPU.

## Route per scene, before rendering
- **WebGL scenes** (three.js / @remotion/three) → **Modal T4**. Chrome flag `--gl=vulkan` (Remotion) or
  `--use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist` (raw Chrome). `egl` / `angle-gl` silently
  fall back to SwiftShader; check the renderer string in the log ("NVIDIA Tesla T4"), never assume.
  (Measured: T4 ≈ 133 ms/frame vs 1,275 ms on 8 CPU cores; L4 only ~7 % faster for ~35 % more.)
- **2D scenes** (SVG/CSS/canvas, subtitles, cards) → **GitHub farm** (`--gl=swangle`). A GPU doesn't speed up
  ordinary 2D. Exception: full-frame heavy CSS filters or shader-drawn 2D count as GPU work.
- **Blender Cycles** (only for an owner-approved hero shot) → Modal L4.
- **Status:** Remotion compositions on Modal are not yet tested end to end; until they are, Remotion films render
  on the GitHub farm. Never block delivery on Modal: fall back to the farm and note it in `crew_log.md`.

## GitHub farm (CPU, free, 20 parallel runners)
`python3 scripts/cloud_render.py <Comp> <name> --start A --end B` (env `VE_PROJECT`, `VE_FARM`, `VE_REPO`;
always set `VE_PROJECT` to the episode's build folder: its default is the old `/home/claude/diji`).
Chunks: ≤ 20, ~24+ frames each; never render a fix as one chunk. Farm files (`scripts/farm/render.yml`,
`plan.mjs`) live on the `render-farm` branch: after changing them here, copy them there. Output lands on
`render-output` and is joined into `out/<name>_pic.mp4`. A whole film (~4000 frames) takes ~20 min. If a chunk
hangs > 6 min, cancel it via `gh api`. The farm entry must contain the `registerRoot` text Remotion checks for.

## Modal plumbing
Branch `modal-farm` (workflow `modal.yml`): push `job.json` (`{"id": "...", "entry": "<script.py>"}`) plus the
script; results land on `modal-output` under `out/<id>/` (files > 90 MB split). Secrets `MODAL_TOKEN_ID` /
`MODAL_TOKEN_SECRET` are repo secrets: the repo is public, never write tokens into files. Encode with NVENC inside
Modal; up to 10 GPU containers, ≥ ~30 frames each.

## Always
- Quality bar is 1080p: no 4K supersampling, no film grain, no many-subframe motion blur unless asked.
- Commit subset CJK fonts in the project (`fonts/`); the farm falls back to apt only with a 180 s timeout.
- Long jobs run in the background and are polled; a foreground command is killed at 10 min.
