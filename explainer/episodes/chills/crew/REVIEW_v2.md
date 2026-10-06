# Review: 鸡皮疙瘩在等什么 v2 — verdict: FIX FIRST

Nearly all of v1 is fixed. The mix ramps instead of stepping, no join is audible as a click, the tags and sheets read cleanly, and the payoff now lands: one static frame holds the full climb, crest and plunge, with 预测 · 等待 · 兑现 readable and 兑现 bursting on a real beat. One MAJOR item is left, and it is the v1 #1 overclaim coming back in a new form. During Demo 3's 4-second wait the 示意 meter climbs solid to **90 %**. Then, as the late drop lands, it falls to the 74 % hatch. So the picture again answers "更爽，还是更烦？", this time with "the long wait was the high point and the drop was a letdown". It is a one-function fix. Everything else is polish.

Scope:
- All 11 sheets were checked.
- Full-resolution frames were pulled from master.mp4 for 8–12, 23–25, 42–53, 70–81, 85, 99, 102 and 107–125.5.
- The meter fill was measured at 10 fps over the whole film (extra/meter_fill_10fps.txt; columns: t, fill %, solid=1.00 / hatched≈0.76, "?" pixels).
- Every audio join in master.wav was analysed (sample-level second difference, momentary and short-term loudness).
- The mp4's audio is master.wav to the sample (cross-correlation lag 0.0 ms at 5, 60 and 115 s).
- The BGM line on the end card is pending with the owner and is not counted.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR | 1:08.8–1:15.0 (also 1:16–1:20) | **The Demo 3 meter overclaims again: the wait out-scores the drop.** The meter stays **solid** (not hatched) through the repeated breath. It climbs and jitters 72 → 85 → **90 %** (90.3 % at 74.8 s), close to the reference drop (95.9 % at 0:08.2) and well above the 74 % "?" level. At 74.9 s the late drop arrives and the fill **falls 16 points** to the 74 % hatch, with "?" showing. A viewer sees "the extra 4 s of waiting gave more chills, and the drop was a let-down". That answers line 24 by picture. It is also the claim facts.md Risks rules out: "No study shows that a breath before the drop gives more chills (#32)". The meter is labelled 鸡皮疙瘩, not 紧张/期待, so the strain reads as chills. (In v1 I suggested "let the meter strain during the wait". The strain is fine. The level is the problem.) | extra/meter_74.6_75.2_76.5.png (74.6 solid 90 % → 75.2 hatched 74 % + ?); sheet_07 f2 (1:12.05, meter ~85 %); meter_fill_10fps.txt 68.8–75.1 | Treat the whole experiment as the open question. Switch to hatch + "?" at 68.84 (start of wait3), not 74.88. Cap the strain at or below the level the normal breath reached in the hook (≈72–78 %, see 0:07–0:08) and jitter it there. Let the drop rise to the same 74 %, never fall into it. Optional: the final drop shows 100 % (1:51.4) against 96 % in the hook for identical audio. Make them equal so "全部还给你" does not read as "even better than before". |
| 2 | MINOR | 2:01.53–2:01.70 | **The ink flood reads as motion, not a glitch, but it is a 0.17 s snap.** The auto-check "glitch" at 121.67 is this circle. Navy coverage by frame: 1 → 7 → 23 → 61 → 98 %. It is a growing disc in every frame, with no single-frame flash. But `r = 2400·flood` overshoots: the frame is covered at flood ≈ 0.53, so half of the 0.45 s ease happens off screen and the visible wipe is about 5 frames. Its centre (960, 250) is empty paper beside 等待, so it does not grow out of anything. | extra/ink_flood_121.55-121.68.png; frame-by-frame coverage (navy %) measured at 30 fps; film.tsx EndCard `r={2400 * flood}` | Use `r = 1300·flood` (full cover exactly at the end of the ease) and 0.6–0.7 s. Centre it on the lit 兑现 lamp (930, 428), so the payoff word "spills" into the end card. |
| 3 | MINOR | 2:02.4–2:05.5 | **The end-card motif turns black, and the question is a little short.** The mini coaster under the title is gold for about 0.3 s (2494 gold px at 122.4), then near-black on navy from 122.7 to the end (0 gold px, 1526 dark px). It reads as a dark scratch under the gold title. Cause: `Mini` draws with `style={MULT}`, which multiplies gold onto navy once the paper world is unmounted (T_CARD+0.5). The question is at full brightness 122.5–125.2 (≈2.7 s). The 14-character line needs 3.1 s, and it is the film's comment prompt. | extra/endcard_motif_122.5.png vs endcard_motif_125.0.png; sheet_11 f2–f3; brightness of the question row measured at 10 fps | Drop `MULT` on the end-card `Mini`, or give it a `mixBlendMode: normal` override. Bring the question in at a+0.5 instead of a+0.9, or start the black fade 0.3 s later. |
| 4 | MINOR | 0:42.6–0:47.3 | **In Demo 2 the strip and rail disagree before the cut.** The strip already shows the edited order: 间奏 goes straight to the 高潮 clip, and 高潮后 is dimmed. The rail above still draws the full climb, crest and plunge, with the climb sitting over the strip's 高潮 clip and the plunge over the dimmed area. After the scissors (≈47.3) both agree: flat rail, dashed 铺垫 ghost. It is a small consistency slip in the film's main "we are editing this" vocabulary. (v1 #11 itself, the preview of the next demo, is fixed. The rail is void past 64.79.) | extra/demo2_42.6-47.4.png (tiles 1–4 vs 5–6); sheet_04 f5–f6 | Until the scissors cut, show a 铺垫 clip in the strip under the climb. Cut it out with the scissors, as Demo 1 does with 已删除. Or draw the rail flat from the start and keep only the dashed ghost. |
| 5 | MINOR | 1:37.7–1:41.0 | **The cart is half-hidden under the opaque Nagel sheet.** Only the wheels and the lower third of the drained cart show below the sheet's bottom edge. The hero reads as half-drawn for about 3 s. The opaque sheets that fixed v1 #5 now cover it. | extra/full_99.34_cart_under_sheet.png; sheet_09 f2–f3 | Raise or shorten the Nagel sheet so its bottom stays at y ≤ 440 here, or keep the camera so the cart sits below the sheet. |
| 6 | MINOR | 1:19.9–1:20.3 · 0:59 · 1:25 | **Small HUD overlaps remain.** The 紧张 stamp lands on the still-fading 预判 flag for about 0.4 s. The ✂ counter's paper pill erases the sheet's top-right corner (the Salimpoor and EDM-pattern sheets lose their border corner). | extra/huron_79.7-81.5_crop.png tile 2; sheet_06 f1, sheet_08 f1 | Fade 预判 out before 紧张 stamps, at 79.9. End sheets at x ≤ 1660, or start them below the counter (y ≥ 165). |

## Fixed since v1
- **#1 meter — partly.** Fixed: drop2 and drop3 both peak at 74.2 %; the fill is hatched with a pink "?" during 33.2–34.8, 48.6–53.5 and 75.0–79.8; 示意 is about 40 px, full opacity, on a paper pill clear of the sun. Not fixed: the solid 90 % during the Demo 3 wait (row 1).
- **#2 bed steps — fixed.** No step remains.
  - Title → bed1: short-term loudness falls smoothly from −12.4 to −16.2 LUFS over 12.0–15.0.
  - 52.64 and 78.94: one-bar ramps, with momentary loudness moving in a −10…−21 LUFS range that follows the music, not a fader.
  - Contiguous joins are butt-joined.
- **#3 payoff — fixed.**
  - Static frame from 111.0 to 121.5. The lamps stamp at 112.36 / 112.86 / 113.37 and all three are fully on screen (extra/payoff_*.png).
  - The final drop plays 4 full bars at about −10…−13 LUFS momentary (111.4–119.4). The outro starts at 119.44 with a ramp.
  - The 兑现 burst at 116.907 is on a real onset (15× the median onset strength, as strong as the 117.42 downbeat).
- **#4 tags — fixed.** 预判 and ×2/×3 sit at y≈190 against the rail at y≈320, and the cart is clear (extra/full_72.5_tags.png).
- **#5 sheets — fixed.**
  - Sheets are opaque, and the rail passes behind them.
  - The bowl fades out inside the panel at 0:37.3.
  - 中高音 is blue above the band, and "920–4400 Hz" sits on a paper chip.
  - New side effect: row 5.
- **#6 end card — fixed (BGM pending).** The sources are in two lines, verbatim from the storyboard, including Blood & Zatorre 2001, Jain et al. 2023 and Huron 2020.
- **#7 HUD — fixed.** The Huron caption fades in at its final place (≈80.9–81.3), and the HUD has paper pills. Residue: row 6.
- **#8 — fixed.** "电子舞曲的套路（示意）" puts 铺垫 on the climb, a bracketed 拖延 plateau, and 兑现 on the plunge.
- **#9 — fixed.** "30 次 / 21 次" and "起疙瘩次数". The line now reads "大脑一直在[预判]：高潮何时来".
- **#10 — fixed.** "先听原版——".
- **#11 — fixed.** The rail is void past 64.79 and the strip past 52.64 is dimmed. New minor: row 4.
- **#12 splices — fixed.** At all 21 joins, including the two internal repeats of wait3 at 70.856 / 72.870 and the low-passed 93.106 / 97.164, the largest sample-level second difference within ±0.5 ms is ≤ 1.0× the local 99.9th percentile of the music around it. So there are no clicks and no holes. Bar 27 still plays twice at 42.50. Momentary −19.9 → −12.9 LUFS there is that bar's downbeat, not a gain jump.

## What works (keep)
- **The title still stamps on the hardest drop.** The meter jumps on the same frame (8.1 → 8.2 s, 78 → 96 %).
- **The payoff is now the film's best frame.** The whole ride is in one static shot, the three lamps are readable, the bowl appears, and 兑现 lights on the beat under "那一拍".
- **Mix discipline.** −14.6 LUFS / −4.4 dBTP in the WAV, one-bar ramps, butt joins on continuous audio, 15 ms equal-power crossfades on real splices, and every edit on a downbeat.
- **Open questions are visibly open in Demos 1 and 2** (hatch + "?"). The demo drops are equal at 74 %.
- **Sheets are opaque and readable at phone size**, including the EDM-pattern schematic, the Nagel band with its Hz chip, and the instrument lanes.

## Not checked / can't judge
- **I did not listen.** These are judged from measurements only:
  - whether the bar-27 repeat at 0:42.5 is heard as a stutter
  - whether the one-bar bed ramps feel natural
  - the taste of the final 4 bars
- **The delivery file.** Only the master (7.62 Mbps, 123.7 MB) was reviewed. The auto-check's "bitrate too low" flag is not a defect of the master. Per owner notes, verify the ≤ 28 MB 2-pass ~2 Mbps Douyin file separately, and its true peak (≤ −1.5 dBTP; the AAC in master.mp4 shows −0.51 dBTP while the WAV is −4.4).
- **Motion between sampled frames** outside the windows pulled above. For example, I saw the bowl's bob at 116.907 only in code, not in frames.
- **Not my check:** the BGM track name, the AI-content declaration, and the pinned comment.
