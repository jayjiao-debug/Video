# Re-review: 为什么好听？ v3 (高清原片, 2:43) — verdict: FIX FIRST (no blocker; 1 new MAJOR, 1 MAJOR partly fixed)

v3 fixes the blocker and most of round 1. The centre-cancel demo now survives mono. The title pours into the 363 Hz wave. The precedence and Shepard scenes no longer overlap. The sad-scene citation is right. Labels and key numbers are now phone-sized, and the picture is about 27 % brighter.

Two things still stop it being final:
- **New collision:** 3000 Hz runs into 每秒上万次 for the whole treble-only demo (0:30–0:34).
- **Remaining blinks:** five handovers still blink to an empty frame for 3–8 frames.

Inputs: `out/为什么好听_v3_高清原片.mp4` (23:02), `lines_v2b_arr.json`, `facts.md` (22:26), `build/Film29.tsx` (22:41).
Frames: `r2/sheet_01–14.png` (every 6 s and every line) and the `r2/y_*` strips and crops.

## Round-1 rows: status

| # | Was | Status | What I checked |
|---|-----|--------|----------------|
| 1 | BLOCKER: centre-cancel antiphase, silent in mono (0:38–0:42, 2:14–2:16) | **FIXED** | L/R correlation is now 0.00, not −1.00. The mono sum sits 3 dB under stereo (0:38.5–0:41.5: L −20, R −20, mono −23 dB; 2:14.9–2:16.4 the same). Across the whole film no 0.1 s window has mono more than 10 dB under stereo. The cancel stretch plays at −14.6 LUFS short-term, level with the body. |
| 2 | MAJOR: frame 0 empty, line at 0.4 s | **FIXED, one small leftover** | Frame 0 now shows the full glowing wave, the headphones pill and the label (`r2/y_0.jpg`). The first line starts at 0.0, but it still has the standard 0.15 s fade-in, so it is invisible on frame 0 and faint at 0.10 s. Drop the fade-in for the first line only. |
| 3 | MAJOR: about 20 dip-to-empty handovers, white arrows snapping in | **PARTLY FIXED** | These handovers now morph the object into the next scene, with no empty frame: 0:09.4 (wave into head), 0:15.6 (head into speaker), 0:24.6 (air bands into spectrum), 0:38.1, 1:00.1, 1:04.6 (age-cut line into arrow), 1:53.6, 2:32.7 (finale wave into end-card wave). The arrows are now pale lavender and slide in. The table below this one lists the five handovers that still blink to empty. |
| 4 | MAJOR: title exit into a 1.1 s empty, frozen frame | **FIXED** | The particles stream into the 363 Hz wave from 1:25.6 to 1:26.4; there is no empty or frozen frame (`r2/y_title_exit.jpg`). One small leftover is in the new-issues table (N4). |
| 5 | MAJOR: precedence and Shepard superimposed 1:12.9–1:15.2 | **FIXED** | The precedence diagram is alone until 1:15.0, the rings arrive from 1:15.3 and ① from 1:15.6 (`r2/y_73.jpg`). |
| 6 | MAJOR: old labels over the next scene (0:24.6, 0:45.1) | **FIXED** | At 0:24.2 the old header has gone before the bands fold into the spectrum. At 0:45.1 nothing overlaps any more, but that handover is now a fade-through, which is row 3. |
| 7 | MAJOR: rotation label sitting on the Juslin & Laukka citation | **FIXED** | 慢放：更慢、更低, then 又慢又低 → 常被听成悲伤 with the Juslin citation, then the Honda 2020 label only at 2:07.6 (sheet_11). The Juslin tag still sits under 再降 2 个半音 · 更慢 (2:00–2:02), our own demo. That is acceptable because the next line, 常常被听成悲伤, is the Juslin claim. |
| 8 | MAJOR: labels under 52 px; demos unreadable on a phone | **MOSTLY FIXED** | In Film29.tsx every label is now ≥ 52 px except the stage source names 和声 / 混响 / 主旋律 / 鼓·贝斯, which are 48 px. Tags are 40–44 px. Key numbers are big now: 45 Hz, 6 Hz, 你还听得见吗？ 2500 Hz and 0.02 秒. The precedence head is larger. The cancel stage now marks the gap with 这里空了 and dashed empty slots. At phone size (`r2/y_phone_size_demos.jpg`) every demo reads except the cancel stage's small head, which is a minor issue. Raise the stage names to 52 px. |
| 9 | MAJOR: binaural, precedence and missing fundamental unsourced; 最易 overclaim | **FIXED** | facts.md has new rows: Oster 1973, Litovsky et al. 1999 (JASA) and Fay (ASA pressroom). The subtitle and label now say 更易 / 更容易. facts.py still flags "0.02" only because the row says 18 ms. Add "≈ 0.02 秒" to that row so the checker passes. |
| 10 | MINOR: prank to precedence not marked as a new trick | **FIXED** | The header now reads 第二招：两耳一样响，只差一点点时间 (1:10.4). |
| 11 | MINOR: overall darkness | **FIXED** | I compared 79 frames at the same times, decoded to RGB. Mean luma went from 15.7 to 19.9 (about +27 %), lifted evenly. The sad scene has a warm core in the head. |
| 12 | MINOR: end card static and 11 s long; series label off-centre | **PARTLY FIXED** | Fixed: the series label's ink centre is now at 958.5 px (was 950.5, frame centre 960), and the end card now grows out of the finale wave. Not fixed: the card is still fully static from 2:35.3 to 2:42.8 (7.4 s; probe "frozen"), and it still runs about 11 s. |

### Row 3: the five handovers that still blink to empty

| Time | What happens | Evidence |
|------|--------------|----------|
| 0:45.1–0:45.3 | The stage fades out and the 8× waves fade in, with a dim gap of about 0.15 s. | `r2/y_45.jpg` |
| 0:48.1–0:48.4 | The 8× waves fade out to an empty frame (8 frames, lit pixels 0.03 %) before the binaural head appears. | `r2/y_48.jpg` |
| 1:06.67–1:06.80 | The left arrow fades out completely (4 frames at 0.0 %) before the right arrow slides in. | `r2/y_668.jpg` |
| 1:08.73–1:08.87 | The right arrow fades to an empty frame (5 frames at 0.0 %) before 骗你的！ | `r2/y_687.jpg` |
| 2:10.4 and 2:16.7 | Two recap steps each blink to near-empty for 2–3 frames. | `r2/y_recap.jpg` |

Fixes:
- **0:48:** the two waves split into the left (363) and right (369) wave bundles beside the head.
- **Arrows:** flip or slide the same arrow across instead of fading it out.
- **骗你的！:** the arrow shrinks into the small head of the 骗你的！ scene.
- **Recap:** overlap the windows by at least 0.15 s.

## New issues introduced or exposed by v3

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| N1 | MAJOR | 0:29.9–0:34.0 | Text collision. The enlarged 每秒上万次 tag now starts right at the end of the 3000 Hz cut-off label, so they read as one string, "3000 Hz每秒上万次". It lasts the whole treble-only demo, and on a phone it reads as one run-on label. | `r2/y_crop_3000Hz_32.0.jpg`, `r2/y_crop_3000Hz_33.0.jpg`, `r2/sheet_03.png` frame 6 | Move 每秒上万次 under the pink bars (e.g. x ≈ fx(8000), y about 80 px lower), or put it on its own line under the header. Keep at least 40 px between the two labels. |
| N2 | MINOR | whole file | The render is flagged `yuvj420p`, `color_range=pc` (full range). The normal delivery is `yuv420p` limited (tv) range. A player or transcoder that ignores the flag will show crushed or lifted blacks, and nearly every background in this film is near-black. | ffprobe of the v3 file | When you make the 12 Mbps master, convert to limited range: `-vf scale=out_range=tv -pix_fmt yuv420p -color_range tv`. Then check a dark frame against this file. |
| N3 | MINOR | 0:07.5–0:09.4 | 放回去，又低了下来 now starts at 7.5 to follow the audio, so it shows for 1.9 s. The pace check needs 2.2 s (flagged). | `r2/auto_checks.md` | End the line at 9.6 s and start the ping-pong line at 9.7 s. That is timing only and still in sync with the scene morph at 9.4–9.6. |
| N4 | MINOR | 1:26.85–1:27.1 | When the title collapses into the wave, two cyan waves with different amplitude and phase sit on top of each other for about 0.3 s, which reads as a double image. | `r2/y_crop_doublewave_86.95.jpg` | Make the title's wave land on the S12 wave's exact amplitude and phase, or hide the S12 wave until the title wave has settled. |
| N5 | MINOR | 1:14.4–1:15.8 | The precedence demo now stops in the audio at about 1:14.4: the 18 ms lag drops to 0. The diagram (先到 / 晚 0.02 秒) and the line 大脑只信先到的那只耳朵 stay until 1:15.2 and 1:15.8. process_v3.py FIX 11 says the hold should run to 75.8. | Measured lag per 0.5 s: 1:13.5 18 ms, 1:14.0 18 ms, 1:14.5 0 ms | Extend the 18 ms state to about 75.8 s as FIX 11 intended, or let the diagram leave at 74.4. |

## Measurements (v3)
- **Format and loudness:** 1920×1080, 30 fps, 163.2 s. −14.07 LUFS integrated, −1.45 dBTP, LRA 5.3. No silence, no black frames, no hard cuts, no glitches. The only frozen stretch is the end card (2:35.3–2:42.8). I ignored the bitrate flag as instructed.
- **Loudness curve:** no stretch is more than 6 dB under the body (−14.1 LUFS short-term) for longer than a bar. The quietest stretch is the binaural section at −19 (about 5 dB under). The drop lands at 81.0–81.1 s, with the title's particle burst on frame 81.10. There is no gap or freeze before it; the "inhale" at 80.6–80.9 is a −6 dB dip, not silence.
- **Audio demos match the labels** after the tempo conform:
  - binaural: L 363.0 Hz, R 369.0 Hz
  - tuned sines: 362.9, 725.7 (present from 89.5 s, i.e. on 再加一个高八度), 544.2 and 384.5 Hz, matching the new 726 / 544 / 384 labels
  - prank: under ← only R plays (L −41 dB); under → only L plays
  - precedence: equal level with an 18 ms lead that swaps sides at 1:10.6
- **Brightness (decoded):** mean luma 19.9 vs 15.7 in v2. No single-frame white flash. The biggest jump is the drop burst at 81.1 s, which is colour particles.

## What works (keep)
- **Title:** it still lands on the drop and now hands straight into the harmony scene. It is the best transition in the film.
- **Morph handovers:** wave → head, head → speaker, bands → spectrum, age line → arrow and finale wave → end card read as one continuous film.
- **Key numbers on the objects:** 45 Hz, 6 Hz, 你还听得见吗？ 4300→2500 Hz and 0.02 秒 are big and on the thing itself. 这里空了 makes the cancel demo readable.
- **Mono:** mono-safe everywhere. Loudness is unchanged.

## Not checked / can't judge
- **Music and feel:** whether the rubberband conform (−0.9 % tempo) is audible as artefacts, and whether the effects give chills on real earbuds. I measured levels, phase, lag and frequencies only.
- **The six new music fixes in process_v3.py:** louder Shepard, organ harmonics, darker head shadow and the rest were only spot-checked through the demo measurements above, not listened to.
- **Sources:** I checked that the new facts rows exist, not their content.
