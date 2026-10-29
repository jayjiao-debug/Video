# Task: fix the review items for the opening (0 → 20.821 s) and the overlay of ep53 越王勾践剑

## Context
You are the animation engineer for a Chinese Douyin channel of subtitle-only history shorts (16:9, 1920×1080, 30 fps), built in Remotion as code (no AI video). Episode 53, 「越王勾践剑 / 真的没锈吗？」, is 113.633 s (3409 frames) and is told as ONE continuous camera move (一镜到底). Style B「漆」: dark warm ground, the sword always the brightest thing; its bronze-gold and the blue glass on the guard are the only saturated colours. The film is built; an independent reviewer has just watched it, and the owner sees it in the morning. **Your job is to fix the review items assigned to you below.** Two other engineers are fixing other items at the same time, in other files.

Code: `episodes/37-qiqing/remotion/src/qq53/`. `EP53.tsx` routes film time: 0–20.821 `TakeA` (`take53.tsx`), –33.274 `TakeB` (`tomb53.tsx`), –75.162 `TakeC` (`take53c.tsx` + `*53c.tsx`), then `TakeD` (`take53d.tsx` + `*53d.tsx`). `master53.tsx` (`Overlay53`) draws the subtitles, the top-right stamp, the hollow J seal, the title and the depth tag on top. TakeC and TakeD meet on `<HandoffMacro />` (`handoff53.tsx`), held completely still 74.412–75.162.
Plans and rules: `episodes/53-goujian/storyboard.md` (legs, key frames KF01–KF14 in `KF53B.tsx`/`kfA53.tsx`–`kfF53.tsx`), `episodes/53-goujian/MUSIC_NOTES.md`, `episodes/53-goujian/facts.md` (only ✓ facts on screen), `docs/history-video-style/QUALITY_BAR.md`. The full review is in `review.md` next to this brief; your items are copied below.

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
7. Do the items in the order given (most important first). Keep the film rendering at all times. You have about 110 minutes of wall-clock time; when it runs out the run stops and your code is committed as it is. Note the start time with `date`, check it now and then, and update the self-check after each item.


## Your files
`take53.tsx`, `cam53.ts`, `land53.tsx`, `face53.tsx` and `master53.tsx` (the overlay for the whole film), plus new helper files named `*53a.tsx`. Don't change the picture at or after 20.821 except through `master53.tsx`'s overlay, and don't rename or remove exports of `take53.tsx` (another engineer imports `Museum`, `camAt`, `Ground53`, `TakeA`).
Self-check: `tasks/ep53-fix-a/out/selfcheck.md`.

## Items (in this order)
| # | Sev | Time (s) | Owner | What is wrong (seen) | Fix |
|---|---|---|---|---|---|
| 6 | MAJOR | 11.8 → 16.3 | `take53.tsx` | The hall orbit shows the sword at 14–22 % of frame width and ~12 px thick, in the lower-middle of a large empty brown floor, with grey silhouettes as the main picture. On a phone the sword is nearly invisible during "如今它在湖北省博物馆". | Move the camera closer (field 5 m → 2.5 m) and keep the case in the lower two-thirds. The sword must be ≥ 35 % of frame width by 13.0. Add a warm rim and a soft 30 px bloom to the blade so it is the brightest object. Keep 3–4 silhouettes at the rope for scale. |
| 18 | MINOR | whole film (stamp) | `master53.tsx` | The stamp second line is ~30 px (≈8 px on a phone), unreadable. | 38 px, with a 2 px dark text shadow. |
| 20 | MINOR | 17 → 20 | `take53.tsx` | The 11-ring pommel mirror is a floating gold ring at 9–17 s before it is explained (stalk is tiny); the 「镀铬？」 tag fades behind the ring at 20.2 and is half-visible (grey). | Give the mirror a visible 6 px stand and a 「剑首 · 11道同心圆」 caption at 9.2 (in the stamp note); let the tag fade fully before the ring covers it. |

Also:
- **A guaranteed subtitle scrim** in `master53.tsx` for all legs: a soft left-to-right gradient behind the top-left subtitle rows (rgba(18,9,6) at about 45 % → 0 over x 0–1100, y 80–260, feathered, no hard edges), shown only while a subtitle is on screen and faded with it. It protects row 2 where pale diamonds (62–70 s) or the lit paper (57–61 s) pass behind it. Check it doesn't darken the title on the glass at 9.5–11.8 s or the end card from 109.125.
- **Tags and stamp legibility** in `master53.tsx`: the stamp's second line 38 px with a 2 px dark text shadow (item 18). Check the stamp still fits ≥ 120 px from the right edge with the longest notes (render 9.0, 30.0, 47.0, 54.5, 59.5, 68.4, 78.0, 98.0, 106.0).
- The line at 5.538 now reads 「它的主人，是卧薪尝胆的越王勾践。」 (two characters longer); check it still fits and doesn't cover the guard at 5.6–8.5 s.
- Keep the title slam on f285 and the hollow seal everywhere except the end card.
