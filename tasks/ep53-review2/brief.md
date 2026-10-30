# Task: verification review of the FIXED ep53 越王勾践剑 cut (round 2). Do not edit the film.

You are an independent reviewer for a Chinese Douyin channel of subtitle-only history shorts (16:9, 1920×1080, 30 fps), built in Remotion as code. Episode 53, 「越王勾践剑 / 真的没锈吗？」, is 113.633 s (3409 frames) and is told as ONE continuous camera move (一镜到底). Three different builders made it (legs 1–7, 8–12, 13–18). A first review (`review_r1.md` next to this brief) found 20 defects; three engineers then fixed them and the producer fixed a flicker in the hush (70–74.4 s). Your job: (1) check every r1 item and say FIXED / PARTLY / NOT FIXED with what you see now; (2) catch anything the fixes broke or that r1 missed (regressions: jumps, pops, flicker, blank frames, text collisions, logic). Only report what still needs work; do not re-propose script changes unless something is now wrong. You did not build any of it: judge it as a demanding viewer and a careful editor.

## What to review
1. **Logic (the picture tells the truth and behaves plausibly).** Examples of what to catch:
   - People: excavators lift lids rather than pass through them; hands hold what they lift; visitors stand at real scale next to the case; nobody floats.
   - Objects: the sword is 55.6 cm × about 5 cm, the same sword everywhere (pommel with 11 concentric rings, blue glass on the guard, diamond lattice on the blade); it lies left of the skeleton outline in the inner coffin, in a black lacquer sheath; what is drawn matches what the subtitle on screen says at that moment.
   - Numbers and words on screen agree with `episodes/53-goujian/facts.md` (only ✓ rows may appear as fact) and with each other: the depth tag (reaches 10.8 m at the chamber floor), the stamp (top right, year · place), the tags (「镀铬？」 must never be struck through or mocked; never 谣言/假的/没有铬), counts (30多张 / 20多张, 40多封信).
   - The one-take: no cuts, no fades to black, no jumps between neighbouring frames, except the 0.5 s fade at the very end.
2. **Visuals.** Readability on a phone (the subject big enough, the sword the brightest thing), text over the subject, anything important outside the safe area (≥ 120 px from left/right edges, ≥ 58 px from top/bottom), subtitles hard to read against the picture, blank canvas or hard edges showing during moves, strobing (camera moves > ~25 px per frame on large detailed areas), anything that looks broken, cheap or unfinished, and places where the picture is static while a line plays.
3. **Script.** The 26 lines in `episodes/53-goujian/lines_bars.json` (also `src/qq53/lines53.ts`): clarity for a 20-year-old Douyin viewer, flow, places where a line is confusing, repetitive or weak, and whether the payoff lands. The owner already approved the lines, so propose only changes that clearly improve the film, keep each line ≤ 16 字 per row, keep the timing (each line's start and end stay the same), and keep facts within the ✓ rows.

## How to look
1. In `episodes/37-qiqing/remotion`, run `npm ci`. Remotion needs Chromium's new headless shell: `find ~/.cache/ms-playwright -type f \( -name 'chrome-headless-shell' -o -name 'headless_shell' \)` and set `REMOTION_BROWSER` to it (if none: `npx @puppeteer/browsers install chrome-headless-shell@stable`, run in /tmp).
2. Stills (arguments are film seconds; do NOT set SFPS; output files are named `f_<sec to 1 decimal>.png`, so batch seconds that differ in the first decimal per call): `ENTRY=qq53/EP53 CID=EP53 BUNDLE_DIR=$(mktemp -d) REMOTION_BROWSER=<path> JPG=1 node scripts/frame_ms.mjs stills /tmp/rv/<batch> <sec> <sec> …`. Bundling takes a minute, so batch many seconds per call.
3. Render one still every 1.0 s from 0.2 to 113.2, plus: 9.5, 20.8, 33.2, 33.3, 36.1, 37.8, 38.9, 41.2, 43.5, 54.8, 57.1, 58.2, 59.4, 63.9, 66.2, 68.4, 74.5, 75.2, 76.9, 82.0, 84.3, 86.5, 91.0, 93.5, 95.6, 97.8, 102.4, 106.9, 109.2, 110.6, 112.0, 113.5. Make contact sheets (PIL) and look at every frame; zoom into full-size frames where something looks wrong. For suspected jumps, render frames 1/30 s apart.
4. Read the code only to explain a defect you saw (`src/qq53/`: `EP53.tsx` routes 0–20.821 `take53.tsx`, –33.274 `tomb53.tsx`, –75.162 `take53c.tsx`, then `take53d.tsx`; `master53.tsx` draws subtitles, stamp, seal, title, depth tag).
5. Plans and rules: `episodes/53-goujian/storyboard.md` (legs and key frames), `script.md`, `facts.md`, `MUSIC_NOTES.md` (hits: title 9.500, dive 20.821, draw 43.463, clapper 58.180, slice 59.312, hush 70.633–75.162 must be visually still from 74.412, T1 drop 75.162, layers closing on beats 91.011–93.841, P1 102.332, J seal 109.125), `docs/history-video-style/QUALITY_BAR.md`, `episodes/53-goujian/notes_gate1_r1.md`.
6. **Never put rendered images or video inside the repository** (it is a public repo). Keep all renders under /tmp.

## Output
Write `tasks/ep53-review2/out/review.md`:
- A verdict line (ship / fix first) and the three things that most hurt the film.
- A ranked fix list. One row per defect: severity (BLOCKER / MAJOR / MINOR), time range in film seconds, which file owns it (from the routing above), what is wrong (concrete: what you see), and the fix you propose (concrete enough for an engineer to do it without seeing your stills: positions, sizes, timings, colours).
- A table of the 20 r1 items: #, status, one line of evidence.
- A separate section "Visual upgrades" (not defects): up to 6 changes that would most improve the look on a phone for little work.
Keep it tight: no praise paragraphs. Your final reply should be the same verdict, the top fixes and the file path.

## Time
About 60 minutes of wall-clock time. Note the start time with `date`. Write review.md early and extend it, so a cut-off run still leaves a usable list.
