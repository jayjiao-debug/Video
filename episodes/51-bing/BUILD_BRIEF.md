# ep51 full film: shared build brief (two builders + music, in parallel)

The owner approved the 16 key frames on 2026-10-26 12:05 and said: "okay continue with video demo, use the same BGM; you are given the option to sample/slice etc to make it more whole but it should still be smooth." Build the whole film to the key-frame standard and the ep50 standard (《钱是怎么从贝壳变成二维码的？》, approved). Every shot moves, every line is acted out, transitions are motivated, and the eye always lands on the cold thing.

## Where things are
- **Code:** `/home/claude/video/episodes/37-qiqing/remotion/src/qq51/`.
  - `props51.tsx`: ice, 鉴缶, fridge, chisel, cup, snow, river, LOOKS51/Walker51, Forearm.
  - `KF51A.tsx`: CHARS, KF01–08, KF15, KF16.
  - `KF51B.tsx` + `partsB51.tsx`: KF09–14.
  - **The key frames are the targets: each scene must pass through its key frame's composition.**
- **Key-frame images:** `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf51/` (`CHARS.png`, `KF01–16.png`, `ep51_关键帧.jpg`).
- **ep50 reference, approved:**
  - `src/qq50/`: `EP50.tsx` (master: WipeSplit of PartA/PartB + Overlay), `master50.tsx` (Subtitles, StampLayer, CounterLayer, TitleCard plaque, Pillar/WipeSplit wipes), `partA.tsx`, `partB.tsx` (EndCard), `lines50.ts`.
  - `/home/claude/video/episodes/50-qian/FIX_r1.md`: the fix list ep50 needed after its first cut. **Apply its rules up front this time** (listed under Rules).
- **Timeline** (film seconds, subtitle-only): `/home/claude/video/episodes/51-bing/lines_read.json`, as `[start, end, text, N|Q]`.
  - `{…}` is the gloss row; `[ ]` is a highlight; `\n` starts row 2.
  - Film = 118.75 s + a 0.5 s fade to black = 119.25 s = **3578 frames at 30 fps**.
- **Picture notes per line:** `script.md` (v2): the Lines table (Picture, Counter, Stamp columns), the walk spine, callbacks and furniture. Facts: `facts.md` (✓ rows only).
- **Quality bar:** `/home/claude/video/docs/history-video-style/QUALITY_BAR.md`.

## Music contract (fixed now so picture and music can be built at the same time)
The music specialist is cutting the owner's BGM to **this timeline and this grid**. The timeline does not move. Beat P = 0.56605 s (106 bpm), 4/4.
- **Grid A, 0 ≤ t < 70.63:**
  - Downbeats `DA(k) = 0.4432 + 2.2642·k`; beats `0.4432 + 0.56605·n`.
  - The first downbeat, 0.44, is the fridge door unsealing.
  - The **title slams on DA(4) = 9.50**, the first hard drop.
- **Hush, 70.63–74.26:** the one quiet stretch, under C2's drips. The music thins to near silence; drips can tick on half-time beats.
- **Grid B, t ≥ 74.26:**
  - Downbeats `DB(k) = 74.2586 + 2.2642·k`; beats `74.2586 + 0.56605·n`.
  - The music comes back at 74.26, on C3 「剩下[一份]」. Make the 「？」 pop and the surviving block land on it.
  - **P1 peak** from DB(14) = 105.957.
  - **End card on DB(17) = 112.75.** The air (111.75–112.75) sits on the peak.
  - The music's fall/coda plays under the end card and ends by 119.25.
- **Picture hits land on these beats and downbeats:** era wipes (pillar centre crossing the walker), chisel strikes, the title slam, the 先猜？ pop, the 酒 reveal, stamp presses (冰票), the bowls' 锵锵, the window grid filling, the ice clink at M4.
- **Continuous actions run on their own clock** (walk cycles, snow, mist, melt drips except in the hush). Don't make everything bounce on the beat.
- Put the grid in the master as `DA`/`DB`/`beatAt` helpers that both parts import.

## Split
- **Builder A** (master + first half, 0–55.75):
  - **Master and data files:**
    - `src/qq51/EP51.tsx`: composition `EP51`, 1920×1080, 30 fps, 3578 frames, registerRoot. It draws WipeSplit(PartA, PartB) at the hand-off, plus the Overlay.
    - `src/qq51/master51.tsx`: subtitles, stamp, counter, J seal, title card, wipes and the grid helpers. Start from `master50.tsx` and change the copy.
    - `src/qq51/lines51.ts`: generated from `lines_read.json` with curly “” and the stamp/counter values from script.md.
  - **Picture:** `src/qq51/partA.tsx`, exporting `PartA` and `HANDOFF`: hook (fridge, 不会冷, the lid lifts, the ◀◀ season rewind), title, 周 ice-cutting and the cellar, 80 labourers, ×3, the 秦 pit 190 m³, the 鉴缶 set-piece with 先猜？/酒/温, the cup taken, the Tang ice mountain, 酥山.
  - A owns `props51.tsx` and `KF51A.tsx`: **add, don't change signatures.**
- **Builder B** (second half, 55.75–119.25):
  - `src/qq51/partB.tsx`, exporting `PartB` (plus `partsB51.tsx`): 北宋 street and 冰雪 → silver → the day→night lantern bridge with the 冰雪冷元子 board → 清 night moat → the vault (两米, the ~2/3 melt in the hush, the three ghost blocks, the 「？」 pop) → 冰票 → queue by grade → hutong with the bowls and the shiver → palace hall and the cloisonné box → the 19th-century machine making its own ice (no household fridge) → the 1990 grid at 1.22 → the 2024 grid spilling 104.8 → your kitchen at the frame-0 fridge with the ice clink → the P1 walk line → P2 the fridge frosting by itself → air → **the end card**. B owns the end card.
  - B does **not** edit A's files: import from them, or copy into `partsB51.tsx` and change the copy.
  - Until A's master exists, check with a throwaway `CHK51B.tsx` (id `CHK51B`).
- **Hand-off at 55.75:** a Song timber shopfront passes in the foreground. Its centre crosses the walker on beat 98 (55.92); export `HANDOFF = {t: 55.92, x: …}`.
  - A ends with the walker mid-stride holding the 酥山 plate.
  - B opens on the Song street with him mid-stride, and the ice goes **across a counter to an ordinary buyer** (mirroring W1's cup being taken).
  - Both parts render a little outside their nominal ranges for the wipe.

## Rules (ep50's fix list, applied up front)
- **Subtitles:**
  - Layout D, top-left; the Q lines and the end-card question are centred.
  - Two-row lines: row 2 types right after row 1 (gap ≤ 0.2 s).
  - Q lines: row 1 in the period face, and the gloss row appears **with** row 1.
  - Trailing 。？ get the ½-em optical pull on centred text (ink centre 960 ± 2).
  - Subtitles stay fully opaque during wipes.
  - Curly “” quotes.
- **Stamp:** two lines, top-right, typed after the subtitle. When line 1 is unchanged (〃) it stays and only the note retypes; it never vanishes and retypes. Hidden on the H3 rewind, the title, 先猜？ and the end card.
- **Counter:** bottom-left, values from script.md. The rewind spins 2026 → 战国早期 (H1) → 周 (H3) and lands cleanly, with no stray values flashing. No BC years.
- **Phone-safe corners:** ≥ 120 px from the sides, ≥ 58 px from top and bottom. The J seal sits bottom-right and is hidden on the end card.
- **Text sizes:** labels/tags that carry meaning ≥ 40 px; numbers ≥ 96 px; guess labels ≥ 44 px on one baseline.
- **Keep it moving:**
  - At most one stop per era (the 鉴缶, the silver stall and your fridge are the set-pieces). Elsewhere the walker never stands more than ~3 s; inserts slide past in stride.
  - A visible new event every ~5 s.
  - Camera ≤ ~25 px/frame; dissolves, not whip pans.
- **No flicker or glitch frames:**
  - Nothing vanishes for one frame.
  - Never two copies of one prop in a dissolve.
  - Panels fade out with their scene; no black boxes lingering.
- **Characters:**
  - Hands are simple mittens that touch what they hold (ikArm/Forearm). No claws, nails or outlined fingers. Feet on the ground.
  - No faces, brands, museum copies, maps, tomb or bones. Qing heads use the skullcap + queue (no modern caps).
  - Lanterns are paper lanterns.
- **Facts:** only what the lines, stamps, script picture notes and facts.md ✓ props say. 凌人 never appears; 冰雪冷元子 only on the board; 「像」 not 「是」 at the ice-cream ghost; no 「最早」.

## Practical
- **Typecheck:** `npx tsc --noEmit -p .` from `/home/claude/video/episodes/37-qiqing/remotion` (ignore other episodes).
- **Stills:** `ENTRY=qq51/<File> CID=<id> BUNDLE_DIR=<own dir under the scratchpad> JPG=1 SCALE=0.5 REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/frame_ms.mjs stills <outdir> <t…>`, run from that same folder. ENTRY has no `src/` and no `.tsx`.
- **Motion checks:** a short video check of ≤ 4 s at `CONC=1` is fine. No full-length render: the producer renders.
- **Disk:** about 4 GB free. One bundle dir each; delete it and your intermediates when done.
- Never `pkill -f` a pattern from your own command line. Don't delete other bundle dirs. Don't commit.
- **Look at your stills at full size** against the quality bar and the key frames: every scene at its key-frame time, every transition frame by frame around the cut, and one still per ~2.5 s.

## Hand back (about 2.5 hours)
- A short report: scene → times → what moves → what lands on which beat. Include what you simplified and anything you're unsure of.
- A strip sheet (one still per ~2.5 s of your range) at `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/full51/strip_A.jpg` or `strip_B.jpg`.
