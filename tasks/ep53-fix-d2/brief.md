# Task: round-2 fixes for TakeD (75.162 → 113.633 s) of ep53 越王勾践剑

## Context
You are the animation engineer for a Chinese Douyin channel of subtitle-only history shorts (16:9, 1920×1080, 30 fps), built in Remotion as code (no AI video). Episode 53, 「越王勾践剑 / 真的没锈吗？」, is 113.633 s (3409 frames) and is told as ONE continuous camera move (一镜到底). Style B「漆」: dark warm ground, the sword always the brightest thing; its bronze-gold and the blue glass on the guard are the only saturated colours. The film is built; it has had one review and one round of fixes; a second (verification) review has just watched it, and the owner sees it in the morning. **Your job is to fix the round-2 items assigned to you below.** Another engineer is fixing other items at the same time, in other files.

Code: `episodes/37-qiqing/remotion/src/qq53/`. `EP53.tsx` routes film time: 0–20.821 `TakeA` (`take53.tsx`), –33.274 `TakeB` (`tomb53.tsx`), –75.162 `TakeC` (`take53c.tsx` + `*53c.tsx`), then `TakeD` (`take53d.tsx` + `*53d.tsx`). `master53.tsx` (`Overlay53`) draws the subtitles, the top-right stamp, the hollow J seal, the title and the depth tag on top. TakeC and TakeD meet on `<HandoffMacro />` (`handoff53.tsx`), held completely still 74.412–75.162.
Plans and rules: `episodes/53-goujian/storyboard.md` (legs, key frames KF01–KF14 in `KF53B.tsx`/`kfA53.tsx`–`kfF53.tsx`), `episodes/53-goujian/MUSIC_NOTES.md`, `episodes/53-goujian/facts.md` (only ✓ facts on screen), `docs/history-video-style/QUALITY_BAR.md`. The full review is `tasks/ep53-review/out/review.md` on this branch's history; your items are copied below.

## Rules for the picture
- One camera, a pure function of time. No cuts, wipes, cross-fades or fades to black (except the final 0.5 s fade at 113.1–113.6). Camera movement ≤ 25 px per frame on large detailed areas. Only planned hits land on beats.
- 「镀铬？」 is never struck through or mocked; never write 谣言/假的/没有铬.
- The real sword: 55.6 cm × about 5 cm; pommel with 11 concentric rings; blue glass on the guard; diamond lattice on the blade.
- Safe area: important things ≥ 120 px from left/right, ≥ 58 px from top/bottom. Subtitles sit top-left (x 150, y ≈ 100–260); keep the subject out of that area or darken behind it.

## How to work
1. In `episodes/37-qiqing/remotion`, run `npm ci`. Remotion needs Chromium's new headless shell: `find ~/.cache/ms-playwright -type f \( -name 'chrome-headless-shell' -o -name 'headless_shell' \)` and set `REMOTION_BROWSER` to it (if none: `npx @puppeteer/browsers install chrome-headless-shell@stable`, run in /tmp).
2. Stills (arguments are film seconds; do NOT set SFPS; files are named `f_<sec to 1 decimal>.png`, so seconds that share the first decimal overwrite each other; use separate output folders for frame-by-frame checks): `ENTRY=qq53/EP53 CID=EP53 BUNDLE_DIR=$(mktemp -d) REMOTION_BROWSER=<path> node scripts/frame_ms.mjs stills /tmp/r53/<folder> <sec> <sec> …`. Add `JPG=1 SCALE=0.5` for quick contact sheets. Bundling takes a minute: batch many seconds per call. For a jump test, render consecutive frames (t = n/30) and compare them with PIL (mean abs difference).
3. Render a baseline of your range before you change anything, then after each fix look at the result. Look at every still yourself.
4. **Edit only the files named as yours below** (and new helper files with your suffix). Don't rename or remove anything other files import from your files. If a fix needs a change in someone else's file, describe it in your selfcheck instead of making it.
5. **Never put rendered images or video inside the repository** (it is public). Render only under /tmp. Don't add node_modules, bundles or browsers.
6. Commit nothing; the workflow commits your code. Write your self-check to the path named below: per item, done / partly / not done, what you changed, how you checked it (still times, jump-test numbers).
7. Do the items in the order given (most important first). Keep the film rendering at all times. You have about 95 minutes of wall-clock time; when it runs out the run stops and your code is committed as it is. Note the start time with `date`, check it now and then, and update the self-check after each item.


## Your files
`take53d.tsx`, `macro53d.tsx`, `world53d.tsx`, `scene53d.tsx`, `end53d.tsx`, `hall53d.tsx`, and new helper files named `*53d.tsx`. Keep: the first frame (75.162) is `<HandoffMacro />` with the first bloom lit; all hits (75.162 / 75.728 / 76.860 blooms, 84.219, 86.483 / 87.615 / 88.747, layers 91.011–93.841, P1 102.332, the J stamp on f3274 absent on f3273); the end-card timings; the 0.5 s final fade. `take53.tsx` imports `CleaverD` from `end53d.tsx` for frame 0 (the loop closes on the same cleaver): don't rename it, and any change to `CleaverD` changes frame 0 too (fine if it is an improvement).
Self-check: `tasks/ep53-fix-d2/out/selfcheck.md`.

## Items (in this order)
| # | Sev | Time (s) | Owner | What is wrong (seen) | Fix |
|---|---|---|---|---|---|
| 7 | MAJOR | 95.54 → 99.0 | `scene53d.tsx` (`CaseW`, `Ground`) | r1 #8 partly fixed: the cut is gone (good), but at 95.5–95.8 the case is a dark plinth with the sword a thin strip about 15–20 % of the frame width, and an 80 × 80 px **grey square** (placeholder look) on the plinth front. 96–99 s: the case is still small, with a stray unlabelled scale bar + dot at lower left (97–101). | Remove the grey square (or make it a lit rounded panel #E6F4F8 at 25 %, no text). Reach glass level by 95.6 (rise ~1 s earlier) so the sword is ≥ 35 % of the width by 95.8. Remove the scale bar, or label it 「10厘米」. |
| 8 | MAJOR | 83.0 → 91.0 | `world53d.tsx` (Chamber, OTHERS), `take53d.tsx` | r1 #7 partly fixed. The coffin now fills 55 % of the frame, but the sword is a 150 px strip at 86–88 s and a 80 px hairline at 92 s; the "other swords" are ~100–200 px thin leaf shapes, half hidden by the coffin at 86.5–88. The proof beat ("同一座墓里的其他剑，也几乎没锈") has no readable picture. The sword inside is drawn pale-tan with no black lacquer. | Camera 35 % closer between 84.2 and 90.4. Pull the other swords out of the coffin's shadow and draw them at 50–60 cm relative to the coffin with a 2 px rim #F4D088; keep the 勾践 sword the brightest. At 83–84 draw the sheath black (#1A0C08) with the guard outside it, as at 39–43. |
| 12 | MINOR | 92.83 (f2785) and 93.37 (f2801) | `take53d.tsx` / `world53d.tsx` (strata) | Layer panels appear in 1–2 frames: the pale 白膏泥 slab at 92.83 and the blue-grey 青灰泥 band at 93.37 (luma +4.3 / +4.4 in one frame). | Fade each layer in over 0.3 s (opacity `sstep`), starting 0.3 s earlier. |
| 13 | MINOR | 82.0 → 91.0 | `master53.tsx` (depth tag) | The depth tag disappears at 82 s while the camera is on the chamber floor, then reappears at 91.0 as 「深 8.2 米」. The floor is 10.8 m. | Keep 「深 10.8 米」 from 83.0 to 91.0, then count down from 91.0. |
| 10 | MINOR | 80.40 → 81.95 | `macro53d.tsx` (Match 4), `take53d.tsx` | r1 #3 partly fixed: the dark-red disc now starts inside the third bloom's find-ring (80.6) and has a soft edge, but it still grows to fill the frame (81.0–81.6) with a ~1000× scale change, i.e. it is a wipe. | Accept as a transition, but lengthen the growth to 1.4 s with an ease-in (start slower at 80.6), keep the ring visible until the disc passes it, and add a thin cream rim (#F4D088, 3 px) to the disc edge so it reads as a lens/hole. |
| 19 | MINOR | 109.2 → 113.1 | `end53d.tsx` | The sources line is ≈ 14 px high; unreadable on a phone. | 22 px, #CFC3AE at 80 %. |
(Item 13: TakeD draws its own depth tag in L1; the master's depth tag stops at 43.463. Show 「深 10.8 米」 in TakeD's style from 83.0, hold it, and count down from 91.0 as you do now, starting from 10.8.)

Visual upgrades if time is left:
- Hero light on the sword in every wide shot (83–95.8, 96–101): a 2 px `#FFF3CF` rim and a 30 px soft bloom, so it is the brightest pixel group even when small.
- Rust-bloom pulse: a 1.2 s slow scale pulse (100 → 112 %) on each new bloom at its own hit (75.162, 75.728, 76.860).
