# Task: visual polish of legs 1–7 of ep53 越王勾践剑 (Remotion), 0 → 31 s

You are the animation engineer for a Chinese Douyin channel of subtitle-only history shorts, built in Remotion as code (no AI video). Episode 53 is about 越王勾践剑. It is told as ONE continuous camera move (一镜到底). The owner approved the lines, the look (style B「漆」: dark ground, the sword the brightest thing, bronze-gold and blue inlay the only saturated colours) and 14 key frames.

Legs 1–7 (0 → 33.274 s) are built and work. A first review found weak spots. **Your job: fix them so that each moment is at least as good as its key frame, without breaking continuity.** Two other builders are working at the same time on 33.274 → the end, in other files.

## Weak spots to fix (in priority order)
1. **S1 museum hall, ≈ 10.5–17 s.** The camera backs away to ~4 m and orbits round to the pommel end: a dark hall, the lit case in the middle, visitor silhouettes queueing at a rope. Problem: the sword and case read too small and too dark on a phone. Fix: keep the case clearly the brightest object; frame it larger (the case ≥ ~35 % of the frame width at the widest moment), lift the case's interior light and the floor pool of light under it; make the visitors readable but quiet (one tone, faceless, slightly lighter than the hall). Line on screen at 10.5–14.75: 「如今它在湖北省博物馆，有一间自己的独立展厅。」. The hall must read as a real museum gallery, not a void.
2. **KF02 moment (the rise over the guard, ≈ 5–8.5 s).** The macro is emptier than KF02 (`kfA53.tsx` / `KF53B.tsx`). Make the guard and blade fill the frame as in KF02: blue glass glinting on the near face of the guard.
3. **5.3–5.6 s near-stop.** The camera almost stops there, which reads as a hitch. Smooth the camera curve (keep it a pure function of time, ≤ 25 px per frame).
4. **Leg 7 (≈ 24–31 s, the dig and the descent into the shaft): the soil stripes are busy** (too many high-contrast bands flickering past). Calm them: fewer, softer bands, lower contrast, so the depth marks and the diggers read. Do not change the depth marks' logic.

## Hard limits
- **Do not change the picture at or after 31.0 s.** At 33.274 the next builder continues from `tombCam(t)` and the current TakeB frame; anything you change from 31.0 on breaks their hand-off. If a fix needs a change that reaches past 31.0, blend it back to the current picture by 31.0 (compare stills at 31.0, 32.0 and 33.2 before and after your work: they must be pixel-identical).
- Keep the title on the glass at 9.5 s (the owner approved it) readable and in the same place.
- Edit only `take53.tsx`, `tomb53.tsx`, `land53.tsx`, `face53.tsx`, `cam53.ts` (and new helper files named `*53p.tsx`). Do not edit `EP53.tsx`, `master53.tsx`, `handoff53.tsx`, `take53c.tsx`, `take53d.tsx`, any `*53c.tsx` or `*53d.tsx`, `lines53.ts` or the key-frame files.
- One camera, a pure function of time. No cuts, wipes or fades. Camera movement ≤ 25 px per frame. Nothing static. Only planned hits land on beats; continuous motion (dust, snow, water) runs on its own clock.
- Logic: the real sword is 55.6 cm × about 5 cm. Visitors are adults at real scale next to the case. The 1965 diggers dig plausibly (spades into soil, not through it).
- Safe margins ≥ 120 px left/right and ≥ 58 px top/bottom for anything important; the top-left subtitle area must stay readable (add a local darkening behind it if your brighter picture fights the subtitles).

## Where things are (repo root = the checkout)
- Code: `episodes/37-qiqing/remotion/src/qq53/`. Read `EP53.tsx` (routing), `take53.tsx` (TakeA, 0 → 20.821), `tomb53.tsx` (TakeB, 20.821 → 33.274), `cam53.ts`, `land53.tsx`, `face53.tsx`, `master53.tsx` (overlay drawn on top: subtitles, stamp, seal, title, depth tag; you don't draw these).
- Key frames: `KF53B.tsx` (the KFS list), `kfA53.tsx`–`kfC53.tsx`, `parts53.tsx`, `props53.tsx`, `macro53.tsx`, `sword3d.tsx`.
- Plan: `episodes/53-goujian/storyboard.md` (legs, camera moves, match moves). Lines: `episodes/53-goujian/lines_bars.json`. Music: `episodes/53-goujian/MUSIC_NOTES.md` (beat 0.56605 s; title 9.500; dive 20.821).
- Rules: `docs/history-video-style/QUALITY_BAR.md`, `episodes/53-goujian/notes_gate1_r1.md`.

## How to work
1. Setup: in `episodes/37-qiqing/remotion`, run `npm ci`. Remotion needs Chromium's new headless shell (old headless mode fails on full Chrome): `find ~/.cache/ms-playwright -type f \( -name 'chrome-headless-shell' -o -name 'headless_shell' \)` and set `REMOTION_BROWSER` to it; if none, `npx @puppeteer/browsers install chrome-headless-shell@stable` (run it in /tmp, not in the repo).
2. Stills (arguments are film seconds; do NOT set SFPS): `ENTRY=qq53/EP53 CID=EP53 BUNDLE_DIR=$(mktemp -d) REMOTION_BROWSER=<path> node scripts/frame_ms.mjs stills /tmp/r53/<name> <sec> <sec> …`. Bundling takes a minute, so batch many seconds per call.
3. **Before you change anything**, render a baseline: 1, 3, 5.3, 5.6, 7, 9.5, 11, 12.5, 14, 15.5, 17, 19, 24, 26, 28, 30, 31, 32, 33.2 into `/tmp/r53/before`. After your work, render the same into `/tmp/r53/after`, look at every pair, and confirm 31, 32 and 33.2 are identical (e.g. compare with Python/PIL).
4. **Never put rendered images or video inside the repository.** Everything in the checkout is committed to a public repo. Render only under `/tmp`. Don't add `node_modules`, bundles or browsers.
5. Commit nothing yourself; the workflow commits your code. Write `tasks/ep53-polish-a/out/selfcheck.md`: what you changed per weak spot, what you checked, the identity check result for 31/32/33.2, and anything still weaker than its key frame.

If you run short of time or budget, stop after the weak spot you are on, make sure the film still renders, and say where you stopped.

## Time limit
You have about 90 minutes of wall-clock time. When it runs out the run is stopped and your code is committed as it is. So: keep the film rendering at all times (never leave a file half-edited for long), write `selfcheck.md` early and update it after each leg, and check the time with `date` now and then (note the start time first).
