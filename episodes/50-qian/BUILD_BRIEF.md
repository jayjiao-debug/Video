# ep50 full film: shared build brief (two builders, overnight)

The owner approved the look (style B v3: dark lacquer, ep44-like focus) and the 13 key frames, then went to bed: "make the full video for me, please review, correct, improve. Make it interesting." Build the whole film to the key-frame standard. Every shot moves, every line is acted out, transitions are motivated, the eye always lands on the money.

## Where things are
- Code: `/home/claude/video/episodes/37-qiqing/remotion/src/qq50/`
  - `kit50.tsx`: shared engine layer: layout-D subtitles, stamp, counter, J seal, walker rig (profile, carrier pose), props (cowrie, 布币, spade, iron string, 交子, QR, phone).
  - `styleB.tsx`: the approved look: ground, vignette, light pool, cloud curls, gold line, flood/curl reveals.
  - `KF50.tsx`: the 13 approved key frames plus the character sheet. **These are the targets: each scene must pass through its key frame's composition.**
- Key-frame images: `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf50/` (KF01–KF13.png, character_sheet.png, kf50_sheet.jpg).
- Timeline (film seconds, subtitle-only, no voice-over): `/home/claude/video/episodes/50-qian/lines_read.json`, as `[start, end, text, speaker]`.
  - `{…}` is a small gloss row under a classical line.
  - `[ ]` marks a highlighted word (cream with a gold underline in this look).
  - Film = 126.5 s, plus a fade to black, 127.0 s total = **3810 frames at 30 fps**.
- Picture notes per line: `/home/claude/video/episodes/50-qian/script.md` (v3; its times are the old VO times, so use `lines_read.json` for timing). Also `brief.md` and `facts.md` (props section).
- Quality bar: `/home/claude/video/docs/history-video-style/QUALITY_BAR.md`. House style: the history-video-style skill at `/root/.claude/skills/synced/88559b59-b323-49b4-b4f7-371a4110fb97_fa02605c-69b6-4cf0-b22e-f6af2812bdee/history-video-style/SKILL.md`.

## Planned beats (no subtitle)
- **Title, 9.25–12.25:** 「钱是怎么从贝壳 / 变成二维码的？」. Lands on the music hit at 9.25 and holds while the picture keeps moving.
- **Guess beat, 22.00–23.50:** 先猜？ with three options (金块？ · 刀？ · 铲子？). The spade comes forward as 《说文》 appears.
- **宝钞 hush, 96.50–98.50:** the note crumbles into flakes (KF09).
- **Air before the end card, 119.50–120.50:** the trust image holds on the peak.
- **End card, 120.50–126.50:** KF13. Fade to black 126.5–127.0.

## Owner calls, made for him (he is asleep)
- Coin legends: hand-shape them in a seal or clerical feel if you can (a simple SVG path per glyph). Otherwise keep the serif.
- The today walker reads modern: short jacket, a backpack strap, the phone.
- No steelyard in KF07.

## Make it interesting (the owner's words)
- Interaction text ↔ picture:
  - the 贝 lifts off 财/货/贵 and drops as cowries;
  - the 钅 of 钱 melts into the spade and is cast into a 布币;
  - numbers count, e.g. the counter spins 2026 → 1024 → 约前1300 on the rewind.
- Physical comedy and weight:
  - the iron string drags him and the stall-keeper raises an eyebrow (body language only);
  - a 交子 slip floats light as a feather against the string;
  - the 宝钞 tower of notes topples.
- One continuous walk: era wipes come from foreground pillars, gates or banners passing the camera. The money in his hand changes on the line that names it.
- Small surprises every ~5 s. No dead shots.
- Camera ≤ ~25 px/frame; dissolves, not whip pans.

## Split
- **Builder A** (owns the master and the first half):
  - `src/qq50/EP50.tsx`: composition id `EP50`, 1920×1080, 30 fps, 3810 frames, registerRoot. It draws the picture by calling `PartA` for t < 54.75 and `PartB` after. Layers on top: subtitles from `lines_read.json` (layout D, rows stack), the stamp and counter per line (values in `script.md`), the J seal (hidden on the end card), the title card, the end card (or B draws the end card inside PartB: agree via the file, B owns it).
  - `src/qq50/partA.tsx` exporting `PartA: React.FC<{t: number}>` for 0–54.75: hook, rewind, title, 贝, guess beat, spade, 战国, 秦 balance, 汉五铢 → 唐开元.
  - Builder A owns `kit50.tsx`, `styleB.tsx` and `KF50.tsx`: **add, don't change signatures**.
  - Also put the subtitle/stamp/counter data in `src/qq50/lines50.ts`, generated from `lines_read.json` and the stamps/counters in `script.md`.
- **Builder B** (second half):
  - `src/qq50/partB.tsx` exporting `PartB: React.FC<{t: number}>` for 54.75–127.0: 北宋 iron coins → 交子 → print shop → 宝钞 collapse → silver → 1948 → today's stall → trust web → end card.
  - B does **not** edit shared files: import from them, or copy into `partB_parts.tsx` and change the copy.
  - Until A's master exists, check with a throwaway `CHK50B.tsx` (id `CHK50B`).
- **Hand-off at 54.75:** A ends with the walker still walking past a passing foreground pillar (唐 → 北宋 wipe). B opens on the Song street with him mid-stride, carrying the iron string.

## Rules
- Facts: only what the lines and the stamp say, plus facts.md ✓ props. No brands, no real banknote designs (1948: a generic note shape at most), no maps, no portraits.
- Farm-safe isn't needed (we render locally). Keep SVG filters tight anyway, because render time matters.
- Typecheck: `npx tsc --noEmit -p .` (ignore other episodes).
- Stills: `ENTRY=qq50/<File> CID=<id> BUNDLE_DIR=<own dir under the scratchpad> JPG=1 SCALE=0.5 REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/frame_ms.mjs stills <outdir> <t…>`, run from `/home/claude/video/episodes/37-qiqing/remotion`. ENTRY has no `src/` and no `.tsx`.
- Look at your stills at full size against the quality bar before handing back. Check every scene at its key-frame time, every transition, and one still per ~3 s.
- No local full-length video render (the producer does it). A short motion check of up to 4 s at `CONC=1` is fine.
- Disk is limited (~5–6 GB free): delete your bundles and intermediates.
- Never `pkill -f` a pattern from your own command line. Don't delete other bundle dirs. Don't commit.

## Hand back (about 2.5 hours)
- A short report: each scene with its times and what moves, what you simplified, anything unsure.
- A strip sheet (one still per ~3 s of your range) at `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/full50/strip_A.jpg` or `strip_B.jpg`.
