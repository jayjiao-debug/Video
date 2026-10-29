# Task: build legs 13–18 of ep53 越王勾践剑 (Remotion): TakeD, 75.162 s → end, incl. the end card

You are the animation engineer for a Chinese Douyin channel of subtitle-only history shorts, built in Remotion as code (no AI video). Episode 53 is about 越王勾践剑 and is told as ONE continuous camera move (一镜到底). The owner approved the lines, the look and 14 key frames.

Another builder already made:
- the master composition `EP53` (1920×1080, 30 fps, 3409 frames = 113.633 s);
- the one take for legs 1–7, i.e. 0 → 33.274 s.

**Your job: build TakeD = legs 13–18 of the one take, from 75.162 s to the end (113.633 s, frame 3409),** in `src/qq53/take53d.tsx` (it exists as a stub; replace its body). You may add helper files named `*53d.tsx`.

The range covers:
- T1 「其实，它也[锈]了。」 on the hardest drop at 75.162. Light rust blooms switch on; they must be findable but subtle (KF11).
- T2 「只是锈得很轻，轻到人眼几乎看不出来。」
- T3 「保住它的，不是什么秘方，主要是那座[墓]。」: the rewind / rise off the blade back into the tomb.
- E1 「证据：同一座墓里的其他剑，也几乎没锈。」: show other swords in the same tomb, almost unrusted.
- L1 「剑鞘、两层棺、木椁、白膏泥，一层层，把空气隔绝在外。」: the layers closing over the sword on the beats, each labelled. Air dots bounce off and one or two get through (KF12).
- R2 「出土时是亮的，如今[没那么亮]了。」 and R3 「再好的保管，也没法让锈完全停下。」: rising up out of the shaft into today's museum.
- P1 「它不是不会锈，是那座墓，替它挡了[两千多年]。」 (102.332, the music's peak): back in the case, with your kitchen and the cleaver matched in the glass (KF13).
- The air 107.993–109.125.
- The end card from 109.125 (KF14, `EndCard53` in kfF53.tsx): the J stamp lands ON the downbeat frame f3274; about 4 s; then a 0.5 s fade to black by 113.633.

**Start (fixed):** at 75.162 your first frame is exactly `<HandoffMacro blooms={…} veil={…} />` from `handoff53.tsx` (KF11's camera). Blooms switch on at 75.162, 75.728 and 76.860 (Blooms11 in kfF53). The other builder holds that exact picture from 74.412 to 75.162, so the drop is the only change. Then move on continuously.

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

Self-check file: `tasks/ep53-take-d/out/selfcheck.md`.

If you run short of time or budget, build the end card FIRST (109.125 → end), then the legs in order. Hold the last finished picture so the film always renders. Say where you stopped.

## Time limit
You have about 150 minutes of wall-clock time. When it runs out the run is stopped and your code is committed as it is. So: keep the film rendering at all times (never leave a file half-edited for long), write `selfcheck.md` early and update it after each leg, and check the time with `date` now and then (note the start time first).
