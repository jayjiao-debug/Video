# Task: build legs 8–12 of ep53 越王勾践剑 (Remotion): TakeC, 33.274 → 75.162 s

You are the animation engineer for a Chinese Douyin channel of subtitle-only history shorts, built in Remotion as code (no AI video). Episode 53 is about 越王勾践剑 and is told as ONE continuous camera move (一镜到底). The owner approved the lines, the look and 14 key frames.

Another builder already made:
- the master composition `EP53` (1920×1080, 30 fps, 3409 frames = 113.633 s);
- the one take for legs 1–7, i.e. 0 → 33.274 s.

**Your job: build TakeC = legs 8–12 of the one take, from 33.274 s to 75.162 s,** in `src/qq53/take53c.tsx` (it exists as a stub; replace its body). You may add helper files named `*53c.tsx`.

The range covers: the rest of the descent (D2 tail, D3), the diggers lifting the lids (KF06), the sword in the inner coffin left of the skeleton in its black lacquer sheath, washing the sheath and the draw on 43.463 (KF07), the inscription read and 「鸠浅 = 勾践」 with the 40-odd letters (KF08), the 1977 paper test for the film 《古剑》 (KF09), then the macro over the blade (M1 「博物馆的解释，先说料好」, M2 with the 「镀铬？」 and 「热镀锡 · 2025研究」 tags side by side, KF10), and M3 「那它，到底为什么不锈？」, ending in the hush.

**Start:** continue seamlessly from `TakeB` at 33.274: the camera is `tombCam(t)` in `tomb53.tsx` (z ≈ −5.43 m inside the shaft). Your first frame must match TakeB's last frame. Compare stills at 33.24 and 33.30.
**End (fixed):** from 74.412 to 75.162 the picture is exactly `<HandoffMacro />` (`handoff53.tsx`), held completely still (music near-silence). Your camera must arrive at that framing smoothly before 74.412. The other builder starts from that same picture.
**Depth tag:** `master53.tsx`'s DepthLayer counts 0 → 10.8 m at 1.2 m/s from 28.746, holds 10.8 from 37.746, and fades out by 43.463. Make your picture agree: the chamber floor reached as the tag reads 10.8.

## Where things are (repo root = the checkout)
- **Code:** `episodes/37-qiqing/remotion/src/qq53/`.
  - Read `EP53.tsx`, `master53.tsx` (subtitles, stamp, hollow seal, title, beat helpers), `take53.tsx`, `cam53.ts`, `tomb53.tsx`, `land53.tsx` and `face53.tsx` first.
  - The legs 1–7 builder's notes are in the top-of-file comments and in `episodes/53-goujian/BUILD_NOTES_A.md` if present.
- **Key frames (the targets):**
  - `KF53B.tsx` (the KFS list) and `kfA53.tsx`–`kfF53.tsx`, `parts53.tsx`, `props53.tsx`, `macro53.tsx`, `sword3d.tsx`.
  - Each remaining leg must pass through its key frame's composition: KF05/KF06 (descent, diggers lifting lids, ≈30–38 s), KF07 (the draw, 43.5), KF08 (inscription, 54.8), KF09 (1977 paper test, 59.5), KF10 (macro 镀铬？/热镀锡, 68.4), KF11 (T1 light rust, 76.9), KF12 (layers closing, air dots, 93.5), KF13 (back in the case, your kitchen in the reflection, 106.9) and KF14 (end card, 109.125).
- **Plan:** `episodes/53-goujian/storyboard.md`. It defines the 18 legs, the camera start → end of each, what moves, the match move into the next leg, and the hero light. Follow it, and note any change you make.
- **Lines** (final, locked): `episodes/53-goujian/lines_bars.json` and `src/qq53/lines53.ts`.
- **Music contract:** `episodes/53-goujian/MUSIC_NOTES.md`.
  - Beat 0.56605 s; downbeats DA(k) = 0.4432 + 2.2642k.
  - Draw 43.463; hush 70.633–75.162 (keep 74.41–75.16 visually still); T1 75.162 = the hardest drop; key change 84.219; P1 peak 102.332; air 107.993–109.125; end card 109.125.
- **Rules:**
  - `docs/history-video-style/QUALITY_BAR.md`.
  - `episodes/53-goujian/notes_gate1_r1.md` (picture notes are binding).
  - `episodes/51-bing/FIX_r1.md` and `FIX_r3_owner.md` (lessons from the last film).
  - `episodes/53-goujian/facts.md`: only ✓ facts on screen.

## Rules for the picture
- One camera, a pure function of time. No cuts, wipes or fades to black. Only match moves inside the move (e.g. rust ring → sheath mouth, top soil → museum floor, glass reflection → kitchen). Camera movement ≤ 25 px per frame.
- Every line is acted out. Nothing static.
- Only planned hits land on beats: the draw, the clapper and slice, T1, layers closing ×n on beats, the J seal. Continuous things (dust, water, air dots) run on their own clock. No metronome pulsing.
- **T1 「其实，它也[锈]了。」 at 75.162**: show light rust that is findable but subtle (find-rings), not a rusty sword. 74.41–75.16 is a still, held frame (silence).
- **镀铬:** the 「镀铬？」 tag is never struck through or crossed out. Never write 谣言/假的/没有铬.
- **Logic:**
  - The sword lies left of the skeleton in the inner coffin, in a black lacquer sheath; bones are hinted at most.
  - The 1965 diggers act plausibly (lift lids, not passing through solid lids).
  - Sizes match the real sword (55.6 cm × about 5 cm).
  - The depth number reaches 10.8 m at the chamber floor.
- **End card at 109.125** (≈4 s, then a 0.5 s fade):
  - the J stamp, which lands on the frame of the downbeat, not 2–4 frames late;
  - the title 「越王勾践剑 / 真的没锈吗？」;
  - the question 「你第一次见到它，是在哪？」;
  - 「关注 Juno · 一起看懂世界」;
  - the sources line from script.md.
  Follow the KF14 layout.
- **Layout:** layout-D subtitles; safe margins ≥ 120 px left/right and ≥ 58 px top/bottom; the hollow seal everywhere except the end card.

## How to work
1. Setup:
   - In `episodes/37-qiqing/remotion`, run `npm ci`.
   - Chromium for Remotion: the workflow installed Playwright's Chromium. Remotion needs the new headless shell, because old headless mode fails on full Chrome. Find it with `find ~/.cache/ms-playwright -type f \( -name 'chrome-headless-shell' -o -name 'headless_shell' \)` and set `REMOTION_BROWSER` to it. If none exists, use `npx @puppeteer/browsers install chrome-headless-shell@stable`.
   - Stills (arguments are film seconds; do NOT set SFPS): `ENTRY=qq53/EP53 CID=EP53 BUNDLE_DIR=$(mktemp -d) REMOTION_BROWSER=<path> node scripts/frame_ms.mjs stills /tmp/r53 <sec> <sec> …`. Bundling takes a minute, so batch many seconds per call.
2. **Build ONLY in the files named for you below** (plus new helper files with your suffix). The other half is being built AT THE SAME TIME by another builder. Do not edit `EP53.tsx`, `master53.tsx`, `handoff53.tsx`, `take53.tsx`, `tomb53.tsx`, the other half's files, or `lines53.ts`. If you truly need a change in a shared file, describe it in your selfcheck instead.
   - The master already routes your time range to your component (see `EP53.tsx`). Subtitles, stamps, the hollow seal and the depth tag are drawn on top by `master53.tsx` (`Overlay53`), so you draw only the picture.
3. **Look before you finish.** Render stills at every key-frame time in your range, at each match move (one frame either side), and one every 1.5 s across your range.
   - Look at them yourself and fix: text over the subject; anything outside the safe area; blank canvas or edges during moves; continuity jumps between neighbouring stills; logic errors; the subject too small to read on a phone; subtitles hard to read over your picture (add a local darkening behind the top-left subtitle area if needed).
4. **Never put rendered images or video inside the repository.** Everything in the checkout is committed to a public repo. Render only to `/tmp/r53` (outside the checkout). Don't add `node_modules` or bundles.
5. Commit nothing yourself; the workflow commits your code. Write your self-check to `tasks/<name>/out/selfcheck.md` (name below).

Self-check file: `tasks/ep53-take-c/out/selfcheck.md`.

If you run short of time or budget, finish your legs in order. Then hold on the last finished picture, cross-moving into `<HandoffMacro />` by 74.412, so the film always renders and the hand-off still works. Say where you stopped.

## Time limit
You have about 150 minutes of wall-clock time. When it runs out the run is stopped and your code is committed as it is. So: keep the film rendering at all times (never leave a file half-edited for long), write `selfcheck.md` early and update it after each leg, and check the time with `date` now and then (note the start time first).
