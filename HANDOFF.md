# Handoff for the next chat (written 2026-10-06)

Read this first, then `.claude/skills/video-reviewer/references/owner-notes.md` (every owner rule, quoted)
and `.claude/skills/production-crew/references/looks.md` (looks + account numbers).
Project code and renders live in `/home/claude/diji` (Remotion; `src/`, `episodes/`, `out/`, `cloud_render.py` = GitHub Actions render farm).

## The series in one paragraph
Juno / VIBE知识大赏 on Douyin: ~2-minute landscape knowledge films, **subtitle-only (no voiceover)**, one counter-intuitive idea,
the series music track (`public/bgm.mp3`) with the title on the hardest drop, Juno end card, ≤ 28 MB send file at −14 LUFS.
Best performers: 第几个人 (211万), 它在瞄准谁 (42万), 邓巴数 (40.8万), 德国坦克 / 好人会赢吗 (~14.5万).

## What the owner wants more of (2026-10-06)
- **3D set-pieces with real downloaded models and a cinematic camera**, like the London V-1 night in 《它在瞄准谁》 and the
  Titanic lifeboats in 《应该没事吧》. 运镜舒服、爽: long moving shots that flow into the next scene; few hard cuts.
- An opening that tells the viewer their own situation, why it matters and what they'll get; a tiny emotional story.
- Music doing the emotion (tape-stop / spin-up, drops on title and reveal); SFX few, quiet, coherent.
- Never generic: one new thing per film; last 3 episodes' look/metaphor/opening device are off limits.

## What did NOT work (don't bring back)
3Blue1Brown black analytic look, WebGL procedural landscapes, AI anime stills, bright flat game-UI cards, the ep13 manga /
pixel / flat-illustration tests, slideshow structure, voiceover, famous textbook topics (survivorship-bias bombers, Monte Carlo
26 blacks, Concorde, Braess, Tacoma, Titanic again…).

## Open: ep13 《心流》
Unpublished. Last cut: `/home/claude/diji/out/心流_插画版_v2_发送版.mp4` (flat illustration, built for a voiceover that is now
dropped). Owner hasn't approved any ep13 look. Park it unless the owner asks; if revived: subtitle-only + 1–2 real 3D set-pieces.

## Next episode (owner picked 2026-10-06): 坚忍号 Endurance
- **Story:** Shackleton's Imperial Trans-Antarctic Expedition. The *Endurance* was trapped in Weddell Sea pack ice (Jan 1915),
  crushed and sank (Nov 1915); the 28 men camped on the ice, sailed lifeboats to Elephant Island (Apr 1916), Shackleton and
  five others crossed ~1,300 km of Southern Ocean in the 7 m lifeboat *James Caird* to South Georgia, crossed its mountains,
  and every one of the 28 was rescued (Aug 1916). The wreck was found in March 2022 at ~3,008 m, almost intact, name on the stern.
- **Hook idea:** "最难熬的时候，靠什么撑下去？" Angle = how hope was managed (routines, roles, small next goals, keeping
  morale), not "heroic leader" trivia. Find the one counter-intuitive idea in research (e.g. breaking an impossible goal into
  the next small one; routine as survival).
- **3D set-pieces:** the ship locked and crushed in the ice (camera orbit at dusk, ice pressure ridges); the tiny *James Caird*
  on huge waves (low camera skimming the swell); the dive to the seabed in 2022 where a light finds the name ENDURANCE.
- **To verify in research (primary sources only):** all dates, "497 days without setting foot on land", the 28 count
  (the separate Ross Sea party lost three men — say "Endurance 号上的 28 人"), the 2022 depth/discovery details (Falklands
  Maritime Heritage Trust / Endurance22), distances. Check 3D model licences (ship, lifeboat, ice) before building.
- **Process:** brief → research → script (gate 1) → 2–3 looks with a ~15 s moving 3D test of the main set-piece (gate 2)
  → build → independent review → owner.

## Modal GPU farm (set up 2026-10-06)
- Repository secrets `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET` (Modal profile `jayjiao249`) are set by the owner. Never put tokens in files: this repo is public.
- The sandbox cannot reach modal.com; GitHub Actions can. Branch `modal-farm` holds `.github/workflows/modal.yml`: push a new `job.json` (`{"id": "...", "entry": "<script.py>"}`) plus the script → the runner does `modal run <entry>` → everything the script writes to `out/` lands on branch `modal-output` under `out/<id>/` (files > 90 MB split into .partNN).
- Smoke test `check-01` passed: Tesla T4 GPU, `MODAL_OK`.
- Benchmark `bench-01` (ice-ship scene, 1280×720, modal-output/out/bench-01/summary.json):
  - three.js in headless Chrome needs `--use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist` to hit the GPU (egl / angle-gl silently fall back to SwiftShader).
  - three.js: **T4 133 ms/frame** (≈ $0.00002/frame), L4 124 ms, 8-core CPU 1275 ms, this sandbox ≈ 4000 ms. → render three.js/Remotion on **T4**.
  - Blender Cycles 128 spp + denoise: T4 10.1 s, **L4 7.7 s** per frame (same $/frame ≈ $0.0017) → Cycles on **L4**. The quick Cycles scene port was wrong (glTF parts with separate roots split apart); fix before using Cycles.

## Status 2026-10-07 (overnight, owner asleep)
- 坚忍号 parked (too cold a topic for Douyin; research, previz, 3D tests kept in episodes/14-endurance).
- ep14 is now **《切尔诺贝利，谁按错了》** (episodes/14-design-blame): Chernobyl cold open → WWII gear/flap switches (Chapanis) → Hawaii 2018 → Norman door. v3 delivered (out/谁按错了_v3_发送版.mp4), gate-4 READY. Owner has not seen it yet: next = owner notes, then the douyin-publish package only after an explicit OK.
- Build = one three.js page (build/film.html, renderAt(t)), rendered on Modal T4 via modal-farm `render_film.py` (job id design-film-vN). Music = episodes/14-endurance/audio/bgm_edit_v1.wav (local only, not in git: re-upload if the session is new).
