# Gate 4 notes: 同一段旋律，8种曲风 full cut v2 (高清原片, 147.5 s) r1 — verdict: REVISE

Scores (rubric 1–5): script 4 · visual 4 · info 4 · edit 4 · motion 4 · sound 4 · overall 3 (the owner would post it after 2–3 small notes)

Inputs:
- Documents: brief.md, script.md, lines.json, facts.md, storyboard.md, notes_gate2b_r1.md, review/qa/REVIEW.md (QA on v1), review/coldread_gate4.md, music_review.md, and all owner-notes rows.
- My frames, in review/director/: 2 fps contact sheets `sheet_01–10.jpg`, full-res stills `f_<t>.jpg`, and crops `crop_0125.jpg`, `crop_pops32.jpg`, `crop_zhi.jpg`, `crop_vfd76.jpg`.
- Audio: −13.9 LUFS, −2.0 dBTP. The only stretch with momentary loudness under −28 longer than 0.3 s is 135.7–136.1 (the recap's empty reggae beat), which is fine.

## Compared with v1 (QA round 1): v2 is better in every area
- **Bugs:** the ghost "打" is gone (no stray yellow on beat 4 anywhere after 0:32), and the VFD scramble at 76.2–76.7 shows only valid glyphs (雷? 摇? H? 金? …).
- **Title:** it is now full and readable on frame 600 and folds back into the VFD at 22.6–23.0.
- **Context row:** lo-fi shows "快·慢 ✓" on the tempo strip with no collision. The bossa badge is its own pill, and 拇指 → 动 / 手指 → 打 are clear (f_97.6). The 嚓 stamps sit in the row beside the lit pad (f_74.1).
- **Readability:** the deck reads at 52 px and the needle tags are big (f_14.6, f_108.5). The footprints are readable on the 动 pads (f_35.0). The staircase now has "踩空!" and a visible foot (f_71.5).
- **Engine:** the subtitles no longer blink between touching lines.
- **Cold read:** the tease 看完你也能分出来 · 结尾有一题 (8.3–10.8, about 56 px, orange) answers its biggest complaint, and 808 now has its explainer tag.

## Why REVISE
Three things are visibly broken: text over text in the first 4 s, the corner mark sitting inside the title plaque, and the sources line cut off at both frame edges on the end card. The owner would send each of these back (rows 18, 47, 38/84). They are all small animator fixes. Two medium notes (the metal blob, the reggae wording) are cheap and remove the cold reader's two remaining "huh?" moments. Per row 75, send the owner the corrected stills (2.9, 20.1, 22.7, 32.1, 118.0, 139.4, 143.0) before re-rendering.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | HIGH | End card, 139.9–147.5 | **The sources line is clipped at both frame edges.** It is one row at y ≈ 1003 running from x ≈ 8 past x 1920 ("…Modern Drumme"). **Fix:** wrap it into 2 centred lines with ink inside x 120–1800, at ~22 px, placed y 985–1050 (below the subtitle band, above the frame edge). Measure the rendered ink bounds, not the text box. | animator | 18 (renders whole, frame edges), 17 (end card sources) |
| 2 | HIGH | Hook, 2.60–3.45 | **"0.125秒" collides with the bar labels** (crop_0125.jpg, f_2.8). The labels 猜对 (x ≈ 920–1025, y ≈ 700) and 瞎猜 / 5种曲风里选 (x ≈ 1250–1470) are on screen from 2.60, before their bars exist. The 104 px "0.125秒" then slides with the window from step 1 to step 7 straight through both. This is text over text in the first 4 s. **Fix:** 猜对 enters with its bar (3.50) and 瞎猜 / 5种曲风里选 with theirs (4.00). "0.125秒" fades out over 3.40–3.50, as the window column stretches into the 猜对 bar. | animator | 47, 22 (opening), rubric 1 "text over text" |
| 3 | HIGH | Title, 20.00–23.00 | **The title plaque runs under the corner mark.** Settled (f_20.1), the plaque spans about x 230–1690, y 12–250, so `Juno · VIBE知识大赏` (x 1505–1860, y 40–70) is printed inside its top-right corner. On the slam frame (f_20.0, scale 1.25) the plaque touches y 0 and spans x 135–1785. During the fold (f_22.7) its right edge (1525) still touches the mark. **Fix:** use gate-2b note 5a's box (x 330–1590, y 116–336, text 120 px, centred on 960). Scale the slam about the box centre, so even the 1.25 frame stays inside y ≥ 20 and x ≤ 1480 at the top band. The fold path into the VFD (600–1320, 28–132) then never crosses the mark. | animator | 38, 84, 90 (titles look like titles), engine corner mark |
| 4 | MED | Rock → House, 31.85–32.25 | **Rock's last pops ("打打", "次", x ≈ 1700–1880, y 290–470) are still fading 0.25 s into House**, next to House's first 动 pop (f_32.1, crop_pops32.jpg). **Fix:** clip every pop to its segment: it must be fully gone by the segment's t1 (fade 31.85 → 32.00). Apply this generally so no genre's pop crosses a VFD change. | animator | 86 ("prop from past scene only fades after in the next scene … big nono") |
| 5 | MED | Metal l.34, 116.69–119.81 | **The 5 chord dots collapse into an unlabelled grey disc** (x ≈ 915–1005, y 255–345, f_117.6) about 0.2 s after each MUD hit. They read crisp only around 117.0 and 119.1 (f_119.1); for the rest of the line the hero is a grey circle, which the cold reader read as a dust spot both times. **Fix:** hold the 5 coloured dots crisp for ≥ 0.5 s after each MUD event, then smear. While it is a blob, swap the right-hand tag from "5个音" to "糊成一团" (52 px, white, halo, same position). The diagram then says the line without the subtitle, and l.35's "2个音" reads as its fix. | animator | rubric 3 (needs the subtitle), 69/76 |
| 6 | MED | Quiz reveal l.25, 82.29–85.29 | **"是雷鬼！它也能每拍都动" reads as contradicting l.20 "第一拍空着".** The cold reader would comment "到底哪个?". Change it to **"是雷鬼！另一种打法：每拍都动"** (14 字, same slot and duration, gold on 雷鬼 and 动). It pairs with l.20's "常见打法" and keeps the lure's point for l.27. The fact is unchanged (steppers, facts row 26). | screenwriter | 13 (each subtitle makes sense alone), 11 |
| 7 | LOW | Frame 0 | **The VFD is mid-flip on frame 0:** squashed to about 15 px tall, with garbled "摇滚" (f_0.0). This is the first frame and the likely cover grab. **Fix:** at t = 0 the VFD is fully open on 摇滚. Start the split-flap on the second snippet (0.5). | animator | 47, 16 |
| 8 | LOW | Quiz l.27, 88.3–89.8 | "✗ 只听这一个" (x 350–660, y 605–655) overlaps the bottom edge of the 动 pads at steps 1–4 (f_88.6). **Fix:** put it on the key's right in the context row (x ≥ 700, baseline ≈ 735, start anchor). | animator | rubric 2 "text over text" |
| 9 | LOW | Jazz → lo-fi pan, 51.6–54.7 | **During the pan the corner mark disappears** (it travels with the faceplate) **and 慢 is off-frame left**, so the knob's turn toward slow can't be read (f_52.2). **Fix:** make the corner mark screen-fixed. Either stop the pan about 120 px further left, or print 慢 on the ring's upper-left (inside the frame) so 慢 · 走路 · 快 are all visible with the needle on 慢. | animator | engine corner mark, 67 |
| 10 | LOW | Recap → end card, 138.96–139.9 | **The shrink is out of register.** The whole faceplate, now with the TEMPO knob pulled into view, shrinks to about 0.75 while the mini-pad motif fades in at a different place and scale, so two grids show at once (f_139.4). **Fix:** scale the pad grid (x 330–1840, y 258–630) exactly onto the motif's rect (x ≈ 640–1140, y ≈ 528–645) so the pads land on the mini pads, and fade the knob, labels and VFD out by 139.3. Alternatively, fade the faceplate fully out by 139.3, before the motif appears. | animator | 86, 72 |
| 11 | LOW | End card | Two small fixes. (a) "你的答案是？评论区见" starts about 7 px under the mini pads (pads bottom ≈ 645, text top ≈ 652): move it down 30 px. (b) The gold title shows "， 8 种" with gaps on both sides of the 8: drop the space between 8 and 种, then re-check that the line's ink is centred (row 89). | animator | 89, 17 |

Not notes, but checked:
- **Facts:** every number on screen traces to a verified fact row (0.25秒 → row 1; 0.125秒, 54 %, 20 % → row 5; 学没学过 → row 2; 120 步 → row 7; 120 拍 → row 8; 70–80 → row 11).
- **Subtitle-free stretches:** 19–24, 41.6–43.7, 51.6–54.8, 63.9–67.1 and 110.8–113.8 are the planned listen bars, and each has a named visual beat: title, ride strip, knob, the 空 socket, metal 16ths. Keep them.
- **"下：直" (48.9–49.2):** it touches the bezel line for about 0.3 s during the jazz push-out. That is too brief to note.

## What must not change (it works)
- **World and look:** the drum-machine faceplate: graphite panel, fixed row colours (动 orange, 打 yellow, 次 mint, 招牌 pink), pads as light with spill, VFD mint. It reads at phone size.
- **Event-driven picture:** pads light on the exact frame of each hit from events30.json. This is the film's core contract.
- **The hook:** frame 0 lit with the 0.25秒 window and a subtitle; 8 genres flipped in the first 4 s on the music; the 54 % / 20 % bars drawn to scale; 学过 / 没学过 as equal bars; the "?" over the grid; the tease 看完你也能分出来 · 结尾有一题.
- **Title:** it lands on the 20.0 drop from the panel's light (all rows fire) and folds back into the VFD.
- **Transitions:** split-flap VFD on every genre change, plus the built camera moves (jazz push, knob pan, reggae push, trap push, theme-2 pull-back).
- **The everyday pictures:**
  - footprints on 动 (walking = 120);
  - the jazz ride strip with hop arcs, and 直 vs 摇摆 as two strips;
  - the 空 socket and the staircase with 踩空!;
  - 嚓 in the row;
  - the strings wired 拇指 → 动 / 手指 → 打;
  - the zipper slivers;
  - the trap two-needle strip (跟着打 / 走路 / 跟着次 / 又快又慢);
  - metal 5 → 2 dots (keep them; only note 5 changes).
- **Quiz:** lure on every beat, 线索 4/4, A/B/C keys at 58 px, the big 3·2·1 on the grid, B lights mint, 差一点, then the 4 clue keys light.
- **Ending:** the theme-2 melody dots landing in the template with "一个音都没改 ✓", and the recap with each key lit over its replayed bar.
- **Engine:** boxless subtitles; Juno end card with `关注 Juno · 一起看懂世界`; centred motif with "？"; audio at −14 LUFS with no clipping and no dead air.
- **Accepted simplifications (leave as is):** the pad lift-out at reggae, the kit unplug, the string-snap into the 808, and the re-light wave.
