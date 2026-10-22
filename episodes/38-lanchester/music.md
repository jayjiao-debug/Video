# ep38 music: TEMP score (the owner can swap it later)

**Track:** "Rynos Theme" by Kevin MacLeod (incompetech.com), ISRC USUAN1600016, released 2016
**Source URL:** https://incompetech.com/music/royalty-free/mp3-royaltyfree/Rynos%20Theme.mp3 (fetched via asset farm, request `lanchester-music-02`, `asset-output:out/lanchester-music-02/files/Rynos_Theme.mp3`)
**Local file:** `episodes/38-lanchester/audio/temp_bgm.mp3` (git-ignored by `episodes/*/audio/*.mp3`; md5 73348971dbfeda9b971b10bcfff9ee52; 320 kbps, 44.1 kHz stereo)
**License:** CC BY 4.0. Credit must appear in the film (end-card sources line) **and** in the post description:

> "Rynos Theme" Kevin MacLeod (incompetech.com)
> Licensed under Creative Commons: By Attribution 4.0 License
> http://creativecommons.org/licenses/by/4.0/

Short form for the end card: `音乐 Music: "Rynos Theme" Kevin MacLeod (incompetech.com) · CC BY 4.0`

**Instrumentation:** Violins, violas, cellos, basses, flutes, French horns, trombones, tuba, percussion and piano. It is real orchestral writing, not a synth bed.
**Composer's own description:** "Starts small, gets big... then smaller, then REALLY big... then small again." That is exactly the five-part shape this film asks for.

## Measured numbers
| | |
|---|---|
| File length | 185.68 s (3:05.68). The music ends at **2:52.545** (a soft low button on bar 92), is under −47 LUFS by 2:54.4, and is digital silence from about 2:58 |
| Tempo | **128.000 BPM**, constant. Autocorrelation on both the broadband and the <150 Hz onsets gives 128.00, and a grid search gives 0.46875 s/beat. Phase drift across nine 20-s windows stays within ±8 ms, so there is no rubato and no tempo change |
| Metre | 4/4. The big entries at 0:30.045 and 2:00.045 both land on k≡0 (checked by eye in `review/music/rynos_zoom_hits.png`), and the broadband onset strength is highest on beat 1 |
| First downbeat | **t0 = 0.045 s** (the first onset, which is also the strongest transient in the intro at 28.7× the median onset strength) |
| Bar length | **1.875 s** (56.25 frames at 30 fps; the grid returns to a whole frame every 4 bars) |
| Formula | **beat(n) = 0.045 + 0.46875·n s · bar(k) = 0.045 + 1.875·k s** · at 30 fps, frame = round(30·bar(k)) |
| Phrases | 2-bar sub-phrases (novelty peaks on even bars) inside 8- and 16-bar sections |
| Key / tuning | **C minor** (Krumhansl r = 0.86; G and C dominate the chroma), tuned +5 cents from A440. Tune any tonal SFX to C/G/E♭ |
| Loudness | **−12.5 LUFS integrated, true peak −0.02 dBTP** (hot master). With a 350 Hz high-pass ("phone speaker"): −14.9 LUFS |

Plots (git-ignored): `review/music/rynos_bars.png` (LUFS, centroid and novelty per bar), `rynos_spectrogram.png`, `rynos_zoom_hits.png` (0:03, 0:29.5, 0:59.5, 1:59.5 with the bar grid), `rynos_zoom_trough_end.png` (1:29.5, 1:44.5, 2:37.5, 2:51), `candidates_overview_1.png` / `_2.png`.

## Sections (bar k starts at 0.045 + 1.875·k)
| Bars | Time | Character | LUFS (bar range) | Phone LUFS (HP 350) | Centroid |
|---|---|---|---|---|---|
| 0–6 | 0:00.05–0:13.17 | **Tension intro.** Low strings and a percussion pulse; a hit on the very first downbeat | −23 → −18 | −24.8 | 0.7 kHz (dark) |
| 7–14 | 0:13.17–0:28.17 | **Intro 2.** A brighter layer enters on bar 7 and the bass enters on bar 12. It slowly swells | −22 → −15.5 | −21.1 | 1.0 kHz |
| 15 | 0:28.17–0:30.05 | **Riser bar** (cymbal swell; brightest point so far). Beat 4 sucks in (onset 1.5× median), giving an inhale before the drop | −15.8 | | 2.4 kHz |
| **16–23** | **0:30.05–0:45.05** | **DROP 1, "big" A1.** Full orchestra and horns. Jump +5.7 LU over bar 15, the hardest drop in the track | −10.1 → −9.1 | −11.8 | 1.6–2.2 kHz |
| 24–31 | 0:45.05–1:00.05 | **A2, the loudest stretch of the file** (bar 30 = −7.2) | −9.3 → −7.2 | −10.0 | 1.7–2.3 kHz |
| 32–43 | 1:00.05–1:22.55 | **"Smaller" B, the hush.** −6 dB on bar 32, darker, but the pulse never stops | −13.4 → −15.6 | −18.4 | 1.0–1.2 kHz |
| 44–47 | 1:22.55–1:30.05 | **Thinning.** Ends on a **1-beat breath** (bar 47 beat 4, 1:29.6–1:30.0, near silence) | −17.7 → −19.9 | −22.5 | 1.1 kHz |
| **48** | **1:30.045** | **Breath-hit.** The single strongest transient in the track (29.4× median, a +20 dB RMS jump) | | | |
| 48–55 | 1:30.05–1:45.05 | **Trough.** Darkest and quietest, but rhythmic (onset density is the same as the body). A swell-hit on bar 55 beat 3 (1:44.11) | −19 → −24.7 | **−27.5** | 0.55–0.9 kHz |
| 56–62 | 1:45.05–1:58.17 | **Build.** Brightness climbs and the beats get denser (onsets 12–15× median on every beat) | −19.7 → −15.2 | −21.2 | 1.2–1.6 kHz |
| 63 | 1:58.17–2:00.05 | **Riser bar, the brightest bar of the whole track** (3.0 kHz, 3.3 % energy above 5 kHz). Beat 4 sucks in (2.6×) | −17.5 | | 3.0 kHz |
| **64–79** | **2:00.05–2:30.05** | **DROP 2, the "REALLY big" climax.** It is the longest (16 bars) and densest section. It comes out of a trough 12 dB down, so the contrast is the biggest in the track. The loudest bar is 69 (2:09.42, −8.2), the brightest bars are 78–79 (2:26.3–2:30.0, 2.5 kHz) | −13.1 → −8.2 → −10.6 | −13.4 | 1.5–2.5 kHz |
| 80–87 | 2:30.05–2:45.05 | **Aftermath.** It drops back on bar 80, goes dark, and has one dark **re-swell on bar 84 (2:37.55, −12.6, but 0.9 kHz: louder than bar 83, not brighter, still under the climax)** | −13.3 → −17.6 | −16.9 | 0.9–1.1 kHz |
| 88–91 | 2:45.05–2:52.55 | **Dying.** Quiet percussion; the orchestra falls away | −21.7 → −25.6 | −26.5 | 0.75–1.25 kHz |
| **92** | **2:52.545** | **Final low button** (15.7× median, peak −14.7 dBFS, which is *below* the bars before it), then a low decay | −36 | | 0.75 kHz |
| 93 | 2:54.42–2:56.30 | Residual tail at −47 LUFS. **The fade bar** | −47 | | |

## Hit points (measured on the grid; offsets within ±25 ms)
| Time | Bar.beat | What it is | Use |
|---|---|---|---|
| **0:00.045** | 0.1 | Opening hit (28.7×) | Frame 0: first volley + subtitle ① ("something happens on the music inside the first second") |
| 0:13.170 | 7.1 | A new, brighter layer enters | Crane up to the wide view (shot 02) |
| 0:22.545 | 12.1 | Bass entry (9.7×) | Counters pass a visible milestone; the ghost "500？" pulses |
| 0:28.170 | 15.1 | Riser starts; beat 4 (0:29.58) is an inhale | Slow motion; red ticks 3·2·1 on beats 1–3 |
| **0:30.045** | **16.1** | **DROP 1 (hardest drop)** | **866 slams** |
| 0:33.795 | 18.1 | Strongest downbeat inside the drop (9.1×) | Title (see note) |
| 0:37.545 | 20.1 | Downbeat (10.4×) | Rewind cut |
| 0:45.045 | 24.1 | A2 lift (12.3×) | Melee crane-up / queue reveal |
| 0:52.545 | 28.1 | Loud downbeat (9.5×) | **Every musket fires** |
| **1:00.045** | **32.1** | **Hush (−6 dB)** | **Bullet-time freeze** |
| 1:15.045 | 40.1 | B-section downbeat (11.0×) | **×4 slams** as time resumes |
| 1:22.545 | 44.1 | Thinning starts (12.9×) | Squares subtract |
| 1:29.6 | 47.4 | One-beat breath (near silence) | Everything holds still: the L stands alone |
| **1:30.045** | **48.1** | **Breath-hit, the strongest transient in the track** | **★3: the hook's 866 lands on the folded square** |
| 1:41.295 | 54.1 | Hit in the trough (19.0×, +10 dB) | **707 lands** |
| 1:44.108 | 55.3 | Swell-hit (22.7×) | Bamboo slips unroll |
| 1:45.045 | 56.1 | Build starts | 孙子 line |
| 1:58.170 | 63.1 | Brightest riser; beat 4 (1:59.58) inhales | Camera drops to the waterline ahead of the bow |
| **2:00.045** | **64.1** | **DROP 2, the climax** | **The bow cuts the line (the biggest image)** |
| 2:07.545 | 68.1 | Climax hit (+6.9 dB) | The second column breaks the line |
| 2:09.420 | 69.1 | Loudest bar of the climax | Full broadside crane reveal |
| 2:22.545 | 76.1 | Climax hit | The red square cracks into three |
| 2:30.045 | 80.1 | The climax ends | Quiet sea |
| 2:37.545 | 84.1 | Dark re-swell | Back to land at dusk (limit line) |
| 2:45.045 | 88.1 | The dying section starts | End card fades up |
| **2:52.545** | **92.1** | **Final low button** | The last end-card element settles (nothing brighter) |
| 2:56.295 | 94.1 | — | **Film ends** (fade over bar 93) |

## Candidates considered (all Kevin MacLeod, CC BY 4.0; 18 downloaded and measured)
1. **Rynos Theme (3:06), CHOSEN.** It has the requested five-part arc (small → big → smaller → REALLY big → small), a dead-steady 128 BPM grid that the editor can trust, a breath-hit at 1:30 that is perfect for a callback, a climax at 2:00 (the script asked for ~1:58), and an ending that really does die away to a low button. Its weaknesses: the first drop is at 0:30, not 0:12–0:25 (the hook needs 30 s; see the mapping), and A2 (0:45–1:00) is ~2 dB louder per bar than the climax. The climax still lands as the biggest moment because of contrast (it comes out of a 12 dB trough and a 16-bar build) and length (16 bars), but the picture has to make it the biggest image.
2. **Cortosis (2:33).** It has an early hit at ~0:10, a trough at 1:35–1:58, a climax at 2:00–2:17 and a falling end. Rejected because the grid is unstable: phase jumps of 136–232 ms between 20-s windows, with feel and tempo changes ("fight sequence… several changes of feel"). Every cut would need hand-tapping, and its middle is busy rather than explanatory.
3. **Devastation and Revenge (3:05).** It has a mournful quiet ending ("lone guitar and mournful vocals" from 2:35) and a climax at 2:01–2:30. Rejected because nothing happens until 0:49 (a −34 LUFS hum), it has no stable pulse (phase scatter ±250 ms), and it is synth/guitar hybrid rather than orchestral.

Also measured and rejected: **Five Armies** and **Nerves** (both build to a loud ending, which breaks "nothing louder after the last climax"), **Volatile Reaction** and **Black Vortex** (7/4 and 7/8, flat and loud), **Death and Axes** (flat −15 LUFS all the way), **The Descent** (no early drop), **Crusade** (3:19, lift only at 1:35), **At Launch** (episodic dips), and **Full On** (loud ending).

## Recommended mapping (script v3 shots → bars). Picture follows the music; the track is untouched
Script v3 assumed drop 1 at ~14 s, hush ~41 s, build ~106 s, biggest drop ~118 s, falling apart ~134 s and end 158 s. Rynos gives drop 1 at 30.05, hush 60.05, build 105.05, biggest drop 120.05, falling apart 150.05 and end 176.30. So: **the hook gets +16 s, the drop-to-climax middle loses ~14 s, and the climax and ending gain ~16 s.** Length is **2:56.3**, inside the ≤3:00 cap.

| Bars | Time | Shot (v3) | Sync points |
|---|---|---|---|
| 0–3 | 0:00.05–0:07.55 | 01 Volley | First volley flash **on 0:00.045**. ① bar 0 (0.0–3.4), ② bar 2 (3.80–7.2). Ghost "直觉：500？" on bar 2 beat 3 (4.73) |
| 4–14 | 0:07.55–0:28.17 | 02 Run | The sim plays at ~0.5× so its 12-s battle fills the 26-s intro (heavier and more cinematic). Crane up to the ¾ wide **on bar 7 (13.17)**. Counters roll; blue passes 900 **on bar 12 (22.55)**. Slow motion (0.3×) from **bar 14 (26.30)** |
| 15 | 0:28.17–0:30.05 | 02 end | Riser: red ticks **3·2·1 on beats 28.17 / 28.64 / 29.11**; **0 on beat 4 (29.58)**, which is the inhale |
| 16–17 | 0:30.05–0:33.80 | 03 DROP | **866 slams on 0:30.045**; "500？" cracks and falls; tag 只倒下 134 on bar 17 |
| 18–19 | 0:33.80–0:37.55 | 04 Title | **Title slams on bar 18 (0:33.795)**, the strongest downbeat after the drop. *Owner rule (rows 26/84): "title ON the hardest drop." The literal reading is 866 + title together on bar 16. Script v3 Q2 asks the owner; this is the fallback.* |
| 20 | 0:37.55–0:39.42 | 05 Rewind | Picture rewind only (the music keeps running; no tape-stop) |
| 21–24 | 0:39.42–0:46.92 | 06 Swords | ③ bar 21 (39.42), ④ bar 23 (43.17); crane-up reveals the queue **on bar 24 (45.05, A2 lift)** |
| 25–26 | 0:46.92–0:50.67 | 07 ★1 | **500 ✓ snaps on 0:46.920**; ⑤ bar 25 (46.92–50.2) |
| 27 | 0:50.67–0:52.55 | 08 rewind | Sabres back to muskets |
| 28–31 | 0:52.55–1:00.05 | 08 Guns | **Every musket fires on 0:52.545.** ⑥ bar 28. Over bars 30–31 time ramps 1× → 0.05× (tracers stretch) |
| 32–39 | 1:00.05–1:15.05 | 09 Bullet time | **Full freeze on 1:00.045 (the hush).** ⑦ bar 32 (60.05), ⑧ bar 35 (65.67), ⑨ bar 37 (69.42); board lines on beats of bar 38 (71.30 / 71.76 / 72.23) |
| 40–41 | 1:15.05–1:18.80 | 10 Snowball | **×4 slams and time resumes on 1:15.045.** ⑩ bar 40. Ratio tag 2→3→4→7 on the beats of bar 41 |
| 42–47 | 1:18.80–1:30.05 | 11 Squares + fold | ⑪ bar 42 (78.80), the tiling ×4 on bar 43 (80.67), ⑫ bar 44 (82.55) as the music thins. The overlap empties over bars 45–46. The L re-forms and the tape rolls up through bar 47, then **freeze on the breath (1:29.6)** |
| 48–49 | 1:30.05–1:33.80 | 12 ★3 | **The hook's 866 flies in and lands on 1:30.045 (the breath-hit), the film's best callback.** ⑬ bar 48; Lanchester 1914 tag |
| 50–54 | 1:33.80–1:43.17 | 13 Split | ⑭ bar 50 (93.80), ⑮ bar 52 (97.55). Right side reads 866 on bar 53 (99.42) and **707 on 1:41.295**. Keep both fights visibly moving: this is the quietest stretch (−27.5 phone LUFS) |
| 54–55 | 1:41.30–1:44.11 | 14 ★4 | Ghost 1000-square; the two halves fill half. ⑯ bar 54 beat 2 (101.77–104.9) |
| 55.3–57 | 1:44.11–1:48.80 | 15 孙子 | **Slips unroll on the swell-hit 1:44.108**; ⑰ bar 56 (105.05) as the build starts |
| 58 | 1:48.80–1:50.67 | 16 Page | One bar; the paper grain match-dissolves into the sea on bar 59 |
| 59–63 | 1:50.67–2:00.05 | 17 Approach | ⑱ bar 59 (110.67), ⑲ bar 61 (114.42). **Bar 63 riser (118.17): the camera drops to the waterline ahead of the bow.** Beat 4 (119.58) is the inhale, with nothing new on screen |
| 64–71 | 2:00.05–2:15.05 | 18 ★ CLIMAX | **The bow cuts the line on 2:00.045** (the most spectacular frame); 1.5-s slow motion within bars 64–65. **The second column breaks the line on 2:07.545**; full broadsides and crane on bar 69 (2:09.42, the loudest bar) |
| 72–79 | 2:15.05–2:30.05 | 19 Chart | Top-down with the chart grade. ⑳ bar 72 (135.05). **The red square cracks into three on 2:22.545**; ㉑ bar 76 (142.55). The tally holds through the brightest bars 78–79 |
| 80–83 | 2:30.05–2:37.55 | 20 Quiet | Sea at sunset as the music drops. ㉒ bar 81 (151.92) |
| 84–85 | 2:37.55–2:41.30 | 21 Limit | Back to land at dusk **on the dark re-swell (2:37.545)**. ㉓ bar 84 |
| 86–87 | 2:41.30–2:45.05 | 22 Ending | The companies merge into one block. ㉔ bar 86 (161.30–165.0) |
| 88–93 | 2:45.05–2:56.30 | 23 End card | The card fades up on bar 88. The question, then the sources line **including the music credit**. The last element (follow pill) settles on **2:52.545**; nothing new after that |

**The one allowed edit:** a linear (or equal-power) fade over **bar 93, 174.420 → 176.295 s**, ending exactly on the bar 94 downbeat. In practice it only removes a −47 LUFS tail. No cuts, loops, EQ, loudnorm or limiting on the track.

## Notes for the editor and mixer
- **Phone-speaker risk at 1:30–1:45:** the trough is 12.6 dB under the body on a phone (−27.5 vs −14.9 LUFS, high-passed). The ep14 row warns that a long quiet stretch can sound like "the music broke". Here the pulse never stops (onset density stays the same as the body), and it is the composer's own "smaller" section, so keep it untouched. The picture has to carry it: two live fights, and 707 on 1:41.295.
- **The climax is not the loudest section in LUFS** (A2 0:45–1:00 averages −8.1 vs −10.8 for 2:00–2:30). Never put a bigger image in A2 than at 2:00. The guns firing at 0:52.5 should stay a contained land shot.
- **Hot master** (−0.02 dBTP). Any SFX on top must be turned down where the sum would clip (owner row 51). Tune tonal SFX to C minor (C, E♭, G).
- **Temp status:** this is a TEMP score. If the owner supplies his own BGM, re-run the bar grid on it; the shot list above is keyed to bar *functions* (drop 1, hush, breath-hit, build, climax, re-swell, button), so it can be re-snapped.
