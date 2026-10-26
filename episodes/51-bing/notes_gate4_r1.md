# Gate 4 notes: 古代没有冰箱，夏天怎么吃冰？ rough_v1 (full cut, 119.25 s), r1 — verdict: REVISE

This is round 1; there is no earlier round of this cut.

**Material checked:**
- `scratchpad/r51/rough_v1.mp4`. I pulled full-size stills with ffmpeg, plus 10–30 fps tiles around every transition and hit.
- The phone-size sheets `cr51/sheet_0…3` and the builders' `full51/strip_A/B`.
- The key frames `kf51/` and `ep51_关键帧.jpg`.
- `brief.md`, `script.md` v2, `lines_read.json`, `BUILD_BRIEF.md`, `MUSIC_BRIEF.md`, `music_map_ep51.json`, `sfx_cues.json`.
- QUALITY_BAR, the rubric, all 133 owner-notes rows, and ep50's gate-4 r1/r2 notes.

**Routes:**
- **A** = Builder A (0–55.92, plus master51 / lines51 / the counter and stamp layers).
- **B** = Builder B (55.92–end, including the end card).
- **M** = music/sound.
- **P** = producer.

## Scores (rubric 1–5)

Script 4 · visual 4 · info 3 · edit 3 · motion 4 · sound 4 · **overall 3.** The owner would post it only after notes.

**Script 4**
- The spine reads, and four 原来如此 beats land in picture:
  - 酒 at 36.67;
  - the ×3 → 剩下一份 callback on the 74.26 return;
  - 冰票;
  - more fridges than households.
- Two lines are only half acted: 「进冰窖冻好」 (53–55.75) and 「凉的是整间屋子」 (92.5–94.75).

**Visual 4**
- The lacquer look matches the approved key frames, and the cold thing is the brightest object almost everywhere.
- One flat black box (the 冰票 window).
- Two hero props are too small for a phone: 酥山 is about 50 px and the 冰票 slip about 40 px.

**Info 3**
- 80, 190, ×3, 1.22 and 104.8 are big and clear.
- But:
  - the counter flips back to 2026 for 2.2 s, and flashes 周 at 7.0;
  - the key number 「约2/3 化掉」 is about 40 px;
  - the P1 summary row is about 60 px props with about 20 px labels running through the counter.

**Edit 3**
- Part A uses motivated foreground wipes: Zhou banner, lacquer screen, Tang gate, the Song hand-off.
- Part B relies on cross-dissolves with both scenes ghosting, about 8 of them from 67 s on, plus one dip through dark.
- The structural hits are on the grid: 酒 36.67, the 「？」 pop and the surviving block on 74.26–74.30, the clink on 104.26, the J stamp on 112.75.
- The title is 1–2 frames late and fades in instead of slamming.

**Motion 4**
- The walker almost never stands still outside the three planned set-pieces, and there is a new event every few seconds.
- Weak spots:
  - the P1 camera jerks (zoom out → hold → zoom in, all inside 3 s);
  - the vault holds one fixed framing for about 9 s.

**Sound 4**
- Measured −14.0 LUFS, true peak −2.3 dBTP. The title drop is clean: 9.2–9.5 at −28 dB, then −11 dB.
- The hush 70.6–74.2 is near-silent with drips, and the drips are visible.
- Every active SFX lands on a visible event (checked each one).

## Facts on screen

Every stamp, counter value and tag traces to a ✓ row in script.md's facts table (§0, B1–B4, B7, C1–C6, D2, D3, E2, E3, E5, E6, G1–G3, G5, G6, A1, A3).
- The forbidden items are all clean: no 凌人, no 最早, no 硝石, no 杨国忠, no 1956; 每户 does not appear anywhere.
- 冰雪冷元子 appears only on the night-market board (61.9–62.6). 像 is shown as a ghost cone, never 是.
- Qing heads have skullcap + queue. The fridges carry no brand, and there is no monitor-top fridge at M1.

The one factual-looking error is furniture: the counter says **2026 while the stamp says 战国早期** (D1).

## 5-second door and the opening
- ✓ Row 1 is on frame 0 over a moving fridge door. The vessel is lit warm and the brightest object.
- ✓ Row 2 types by about 2.2 s, and the light dies on 不会冷 with the click (2.71).
- ✗ The counter breaks the read (D1).

## Notes (D1… ranked must / should / nice)

| # | Rank | Time | What is wrong | Exact fix | Route |
|---|---|---|---|---|---|
| D1 | **must** | 0–9.5 | **The counter flip-flops** (checked every 0.1 s):<br>· 2026 to 0.8.<br>· The spin runs 清/明/宋/汉/秦 from 1.0 and lands 战国早期 at 2.0.<br>· It **snaps back to 2026 from 2.2 to 4.3**, while the stamp has typed 「战国早期 · 湖北随州」 since 2.5.<br>· It shows 战国早期 again from 4.4.<br>· At H3 it **flashes 周 at 7.0–7.1 (3 frames)**, returns to 战国早期 at 7.2–7.7, then goes 春秋 at 7.8 and 周 at 8.1.<br>So the line's own value renders before and after the spin override. | In CounterLayer, a spin owns the counter from its start until the next line whose value differs, and the landed value holds.<br>· H1: 2026 until 1.0, spin, land 战国早期 at 2.0, hold it through H2 (to 7.0).<br>· H3: 战国早期 at 7.0 (never 周), spin 战国早期 → 春秋 → 周, land by 8.4.<br>· The line-start value never renders before its spin.<br>· Check by cropping the counter on every frame from 0 to 9.5. | A |
| D2 | **must** | 102.9–103.6 | **2024 grid → kitchen is a half-opacity overlap.** The grid, both number panels (1.22 and 104.8) and the spill column ghost over the open fridge and the walker with the cup. These are two copies of "fridge" and two scenes at once (QUALITY_BAR; owner row 86). | · Hold the grid and both tags until 103.3.<br>· Tags and spill clear 103.3–103.5; the grid stays.<br>· 103.5–103.9: push into the one lit window at the 1.22 position. Its fridge glow fills the frame and becomes the light inside your open fridge in the kitchen (match on the light).<br>· The kitchen is fully on by 103.9. The clink stays on 104.26.<br>· No frame may show the grid or tags and the kitchen at partial opacity. | B |
| D3 | **must** | 105.7–108.9 | **P1 walk line:**<br>· (a) It dissolves in over the kitchen, with labels ghosting at 105.8.<br>· (b) It starts zoomed in: the first props are cut at the left edge and 「唐 2026 唐」 runs the labels straight through the counter at 106.0–106.4.<br>· (c) It snaps back to a wide shot in about 0.6 s.<br>· (d) The hold, 106.6–107.8, has props about 50–70 px tall and labels about 20 px, unreadable on a phone. The script asked for ≥ 100 px props tracked left → right (ep50 r1 note 9).<br>· (e) It pushes in fast at 107.8–108.6, and the 乾隆 box ghosts under the P2 fridge at 108.6–108.9. | · (a) No dissolve. From M4's open fridge, pull back in one eased move (105.96 → ~106.9) so that **this same fridge becomes the last item of the row** (match on the fridge; never two fridges).<br>· (b) Wide hold: 9 props ≥ 120 px tall, labels ≥ 40 px. Keep the row baseline at y ≤ 900 so the labels clear the counter (counter ≈ y 1000), and keep nothing within 120 px of either edge. Hide the counter for P1–P2 if needed; the stamp already says 2026 · 今天.<br>· (c) Snow lights inside each prop left → right, one per beat from 106.52, so the eye walks the line on the peak.<br>· (d) 108.3–108.9: one continuous eased push into today's fridge (≤ 25 px/frame equivalent). The other props leave by scale, not by cross-fade. The P2 fridge is that same fridge. | B |
| D4 | **must** | 76.10–76.45 | **The vault → 冰票 cut dips through dark** (rubric edit 1, "a dip to black as a bridge"). The 冰票 scene is also dim brown, though the script says "out in the summer sun". | Make it a motivated move. The camera cranes up from the section along the ramp, through the 地面 line, into the street, where the cellar-mouth arch with its blocks sits at the same x as the vault ramp (match the vault's surviving block to the block in the arch). Grade the street as summer daylight: warmer and brighter, with one sun shaft. The cut must be complete by 76.25, when C4 starts typing. | B |
| D5 | **must** | 71.5–76.0 | **「约2/3 化掉」, the number C2 exists for, is about 40 px.** That is about 10 px on a phone. Every other number in the film is ≥ 96 px. | 「约2/3」 numerals ≥ 96 px and 「化掉」 ≥ 56 px, on the feathered scrim (owner row 78) beside the gauge. Land it with the gauge drop at about 71.4 (after the stop-bar ring) and hold it through C3. | B |
| D6 | **must** | 41.3–41.7 · 66.8–67.3 · 78.3–78.8 · 80.5–81.0 · 97.8–98.0 | **Cross-dissolves in which the outgoing scene's figures and props ghost over the next scene**:<br>· the vessel and table over the W1 hall;<br>· the moat workers over the vault;<br>· the walker over the queue;<br>· the queue over the hutong;<br>· the machine and walker over the 1990 grid.<br>Owner rows 15, 86 ("prop from past scene only fades after … big nono") and QUALITY_BAR (no two copies in a dissolve). Part A shows the right way: foreground wipes. | One motivated move each, and no figure at partial opacity:<br>· **41.5 (A):** a lacquer pillar passes in the foreground as he walks right; the noble's table is behind it.<br>· **67.0 (B):** match on the ice. The moat's stacked blocks slide down the ramp, and the camera follows them into the section, so the moat stack becomes the vault stack.<br>· **78.5 (B):** the 冰票 window and the queue already share one set (the arch is in the same place), so make it one shot: after the trade the camera trucks left about 300 px while the queue steps in.<br>· **80.6 (B):** a hutong gate passes in the foreground (wipe) as he walks right.<br>· **97.9 (B):** push into the machine's glowing ice box; its light becomes the single lit window at the 1.22 position. | A (41.5), B (rest) |
| D7 | should | 9.43–9.57 | **The title is late and soft.** Frame 285 (9.500, on the drop) is empty: H3 is gone and the plaque is not in. The plaque fades in over frames 286–287 with no scale change. The script asks for the ep50 slam. | · H3 out on frame 284.<br>· The plaque is at full opacity on frame 285, slamming from scale 1.25 → 1.0 in 4 frames plus a 2-cycle damped jolt, no flash.<br>· Ink centre is already 959.5. Keep it. | A |
| D8 | should | 7.0–8.4 | **The rewind does not read as a rewind** (owner row 123): no ◀◀ mark, faint lines only, and the "seasons" are about 10 px dark-green specks. | · A ◀◀ glyph ≥ 72 px, upper middle-right, clear of subtitle and stamp, 7.0–8.4.<br>· A tracking-noise band rolling up the frame twice.<br>· Leaves ≥ 20 px, green → orange, then snow.<br>· The counter spin (after D1) is the timecode. | A |
| D9 | should | 50.0–55.75 | **T1/T2 「乳酥淋成小山 / 进冰窖冻好」:** 酥山 is about 50 px on the plate. The "cellar" is a black trapezoid on the floor, which reads as a hole or a glitch, and the plate never goes in. The cone ghost is a thin dashed line and the 红/绿 tint is a few pixels. | · Plate about 2× (酥山 ≥ 110 px wide), camera push-in about 15 %.<br>· The cellar becomes a floor hatch with steps and a cold blue glow. He lowers the plate in at about 53.6 and lifts it out frosted (white rim, visible red/green tips) at about 54.75.<br>· Cone ghost: a solid cream outline at ~70 %, ≥ 140 px, for one beat. | A |
| D10 | should | 76.25–78.75 | **冰票:** the slip is about 40 px, and the clerk sits in a flat black rectangle (owner row 70, no lone black panels). | · Light the window interior warm (lamp, shelf, ledger).<br>· Push in on the hand-over so the slip is ≥ 160 px tall, with the red seal landing on 76.52 (SFX already there).<br>· Then the block trade at the arch. | B |
| D11 | should | 92.5–94.75 | **「凉的是整间屋子」:** the hall only dims from warm to grey (mean RGB 62/39/27 → 48/38/35), and the walker crosses in front of the box at the payoff (93.5–94.0). | · Grade to an obvious cool blue: walls and lattice toward ~#5d7f9a, frost creeping across the lattice windows, the floor mist reaching both walls. Start on the 92.94 beat.<br>· Keep the walker left of or behind the box so the source stays visible. | B |
| D12 | should | 78.75–81.0 | **按等级分:** the three blocks differ by about 1.3× and the three officials are identical, so "by grade" doesn't read. | · Blocks 1× / 2× / 3.5×, handed out on 79.3 / 79.9 / 80.4.<br>· Rank by silhouette only (hat finial or plume, robe hem length). No labels, numbers or faces. | B |
| D13 | should | 27.6–28.3 | **The 「开头那件」 callback is invisible:** the fridge-door ghost is a 1 px outline. | For one beat (27.74–28.31), draw the open fridge door plus the cold blue interior at ~35 % around the vessel, with the interior light washing it. Fade by 28.4. | A |
| D14 | should | 13.6–15.3 | **The block slides into the pit by itself** while he stands with his arms spread and the chisel dropped on the ice (owner row 77: the action reads in one glance; hands touch what they move). | He hauls the block on a rope: the rope runs from his mitten to the block and he leans and steps with it. The chisel stays in his other hand or at his belt, never dropped. | A |
| D15 | nice | 35.15–36.6 | 「肉？」 sits touching the walker's head. | Move the three options about 80 px right on the same baseline. | A |
| D16 | nice | all stamps | Stamp line 2 is about 24 px (ep50 fix list: ≥ 28 px). | 28 px. | A |
| D17 | nice | 67.25–76.0 | The vault is one fixed framing for about 9 s, the walker is about 25 px, and 「两米」 lands at about 69.5, missing the 68.37 hit. | A slow 5 % push-in across the vault. Land the 两米 dimension on 68.37. | B |
| D18 | nice | 96.90 | Nothing visible lands on the drop (the machine's ice is already half formed). | Make the frost "completion" pop and the block appearing whole land on 96.90. | B |
| D19 | P | delivery | rough_v1 is 35.2 MB. The send version from `final51.sh` (720p, 2-pass 1.6 Mbps) must be ≤ 28 MB (owner row 21). | Check the size after the re-render. In the morning message:<br>· name the bed's splices (17.5, 53.1, 62.7, 69.5, 74.25, 92.3, 93.5–94.0, 112.6) and the 70.6–74.26 hush (≈ 1.3 s truly quiet, with drips);<br>· offer the untouched-BGM send version.<br>Re-measure −14 LUFS / ≤ −1.5 dBTP on the final. | P, M |

**Owner process (row 75):** after the fixes, send the owner the corrected stills of D1, D2 and D3 (the counter crop 0–9.5, the 103.0–104.0 frames, and the P1 hold) and wait for his OK before the full re-render.

## Must not change (it works)
- **Frame 0:**
  - the subtitle on frame 0;
  - the first-person fridge with the warm bronze vessel as the brightest thing;
  - the light and hum dying on 不会冷 with the click at 2.71, while the vessel stays lit;
  - the section with ice in the gap on 冬天凿下的冰.
- **Title:** the lacquer plaque above the walker, ink centred (959.5), the walker chiselling under falling snow (only its timing changes, D7).
- **周:**
  - the chisel bursts on 12.9 / 13.46;
  - the 「冰窖」 label dropping onto the pit;
  - the banner wipe;
  - 「干活的 × 1 → 80」 with the file of labourers;
  - ×3 with the hanging 「？」;
  - the 190 m³ pit section (口大底小).
- **鉴缶 set-piece:**
  - the exploded view with 缶·罐 / 鉴·盆;
  - ice packed into the ring;
  - 先猜？ on the tick (34.97) with 肉？ · 瓜果？ · 酒？ on one baseline;
  - **the 酒 reveal on 36.67, when the wine fills the jar**;
  - the window going to snow and the steam for 温酒.
- **W1:** the cup taken and drunk by the noble. The Tang gate wipe and the ice mountain with the two craftsmen.
- **The 55.92 hand-off:** the timber shopfront wipe, then the ice handed across the counter to a buyer.
- **The Song street:** blue umbrellas and the silver stall with the ting on 61.0.
- **Q4:** the vermilion-wall wipe, the night moat with lanterns, chisel sparks on 63.84 / 64.41, and the walker's long chisel swing.
- **Vault:**
  - the ¼-sunk section with the 两米 dimension;
  - the melt time-lapse with visible drips counting into the return;
  - **the three ghost blocks, the 「？」 pop and the surviving block landing on 74.26–74.30**.
- **The 清 street:** the seal on the 冰票 at 76.52, the 酸梅汤 seller with the brass-bowl glint on 81.6 / 82.75, the shiver.
- **乾隆:** the palace-door wipe, 「"冰箱"」 floating over the cloisonné box, cold breath curling from the coin holes.
- **Numbers:**
  - the pipe wipe into the 19th-century machine making ice by itself;
  - the 100-window grid with exactly 1.22 lit;
  - the 2024 grid filling with the spill column and both scope tags side by side.
- **M4:** your kitchen, the frame-0 cup, ice dropped in with the clink on 104.26.
- **P2 and the end:**
  - P2's fridge frosting by itself;
  - the 1.0 s of air;
  - the J stamp on 112.75 over the dimmed fridge, the gold title on the freezer door, the question centred (ink 959.0), 「关注 Juno · 一起看懂世界」 up ≥ 3 s, the sources line;
  - no corner seal and no 「Juno 出品」.
- **Furniture:** layout-D subtitles; Q lines centred with the gloss shown together (ink 958–960.5); curly quotes; the stamp keeping line 1 when unchanged (4.3, 50.0); corners phone-safe (counter x ≈ 150, J seal 125 px from the right and 60 px from the bottom).
- **Mix:** −14.0 LUFS, −2.3 dBTP, music cut to the contract grid (title 9.50, release 36.67, hush 70.63–74.26, return 74.26, drop 96.90, arrival 105.96, fall 112.75), the 16-cue SFX family as cued.
