# ep38 music v2: the owner's track, cut to 1:55.8 with one splice

**Source:** the owner's own track, `bgm.mp3` (164.49 s, 44.1 kHz, 192 kbps, md5 3a99d395a7a344883b94d23f1c015d8a). This is the same file as `episodes/29-sound/music/bgm.mp3`, and the ep14, ep21 and ep27 grids were measured on it too. It is not committed, because the repo is public.
**Output:** `bgm_cut.wav` in the session scratchpad. It is 115.825 s long (5,107,883 samples), a 32-bit float WAV at 44.1 kHz, stereo. It is kept as float so that the 11 decoded samples above 0 dBFS are not clipped.
**Script:** `episodes/38-lanchester/review/music/cut_bgm_v2.py <bgm.mp3> <out.wav>` (no audio in the repo).
**Plots** (git-ignored): `review/music/bgm2_overview.png` shows the loudness and brightness curves for the source and the edit. `review/music/bgm2_join.png` shows the splice beside the two natural bar lines it replaces.

## Verdict
The track can be cut with ONE edit that cannot be heard: **source bars 48–71 are removed (exactly 24 bars = 48.600 s)**. After drop 2 the music plays one 8-bar phrase and then goes straight into the song's last phrase and its real stop. This gives the same "A1 → A2" shape that drop 1 has. The film length is **1:55.825**.
Outside the 20 ms splice and the fade over the last bar, the output is sample-identical to the ffmpeg decode. I checked this with `np.array_equal` on both sides of the splice.

**Warning about the grid you measured (117.45 BPM, first beat at 0.441 s, bar 2.043 s): it is wrong, and it is the same error ep29 made.** The true tempo is **118.5185 BPM, so one bar is exactly 2.025 s**. Your grid drifts late by +0.185 s at drop 1 (bar 8), +0.76 s at drop 2 (bar 40) and +1.05 s at the stop (bar 56). Re-time everything on the formula below.

## 1. Bar grid (measured)
- **downbeat(n) = 0.400 + 2.025·n s; beat(m) = 0.400 + 0.50625·m s.** The metre is 4/4.
- How it was measured: I fitted a regression to 189 strong onset peaks (64-sample hop). The fit gives 0.506250 s per beat with a residual SD of 0.7 ms. The mean residual in every 20-s window is within ±0.2 ms, so there is no drift and no tempo change.
- Phase: the fitted onset is 0.3965 s. In the waveform, the attack starts 3–5 ms later at every isolated hit (0.400, 16.600, 65.200, 81.400), so 0.400 is where the kick actually begins.
- The downbeat is the beat with the strongest kick (strength 5.15 against 3.4–4.7 on the other beats). Both drops land on it.
- The grid holds across the splice in the edited file: onsets sit +0.03 ms (SD 0.8) from the formula before the splice and +0.14 ms (SD 0.5) after it.
- At 30 fps, frame(n) = floor(30·t + 0.5). A bar is 60.75 frames, so the grid returns to a whole frame every 4 bars.
- Harmony is a 4-bar loop, **F#m – F#m – D – E** (i–i–VI–VII), in F# minor tuned about −32 cents (F# ≈ 363 Hz). Bars 4k and 4k+1 are F#m, 4k+2 is D and 4k+3 is E. Phrases are 8 bars long, and the last 2 bars of each phrase are the bright lift and riser bars (centroid 500–740 Hz against about 240 Hz).

## 2. Phrase map of the source (bar n starts at 0.400 + 2.025·n)
| Bars | Time (s) | Section | Level (LUFS per bar) |
|---|---|---|---|
| 0–7 | 0.400–16.600 | Intro. The kick and bass groove starts at 0.400. Bars 5–7 thin out (bass −4…−7 dB, highs −35 dB), and the last beat dips to about −20 LUFS (400 ms window): this is the song's own inhale before the drop | −10.9 → −12.7 |
| **8** | **16.600** | **DROP 1.** Bars 8–15 are A1 and bars 16–23 are A2 | −8.2 … −10.3 |
| 24–30 | 49.000–63.175 | Breakdown, 5 dB under the body (4.8 dB on a phone speaker, high-pass at 350 Hz) | −14.1 … −14.4 |
| 31 | 63.175 | Riser bar (no bass, centroid 2.7 kHz) | −9.5 |
| 32–38 | 65.200–79.375 | Build: the intro material again (bars 32–38 match bars 0–6 within 0.3 LU) | −11.2 … −9.7 |
| 39 | 79.375 | Pre-drop dip: bass out, −21 LUFS on a phone speaker | −14.4 |
| **40** | **81.400** | **DROP 2.** Bars 40–47 are A1 again (bar 40 against bar 8: correlation 0.975) | same as drop 1 |
| 48–55 | 97.600–113.800 | A variant: same groove, different mid-range lead (400 Hz–3 kHz content uncorrelated with bars 72–79) | −8.0 … −9.9 |
| 56–71 | 113.800–146.200 | "Dark C": same loudness, but highs about −25 dB and centroid about 140 Hz (a high-cut variation) | −8.6 … −10.8 |
| 72–79 | 146.200–162.400 | Final A2. It matches drop 1's bars 16–23 (bar 72 against bar 16: correlation 0.987, every band within 0.8 dB) | −8.2 … −10.1 |
| **80** | **162.400** | **The song stops on this downbeat.** Drums and bass stop, and a chord tail at about −30 dBFS rings for one bar. It ends on bar 81 at 164.425 (the file ends at 164.493) | −25.7 |

Phrase starts in the source fall every 8 bars = 16.2 s: 0.4, 16.6, 32.8, 49.0, 65.2, 81.4, 97.6, 113.8, 130.0, 146.2, 162.4.

## 3. The edit
**Choice: leave the source at bar 48 and re-enter at bar 72 (offset 24 bars = 48.600 s = 2,143,260 samples, a whole number of samples).**

| | Time |
|---|---|
| Crossfade (linear, 20 ms = 1/25 beat) | edit and source time 97.578 → 97.598 s |
| Cut-out (last source sample before the splice) | **source 97.598 s**, 2 ms before the bar-48 downbeat at 97.600 |
| Cut-in (first source sample after the splice) | **source 146.198 s**, 2 ms before the bar-72 downbeat at 146.200 |
| Splice point in the edit | **97.598 s**. The new bar 48 hits at 97.600 (= source 146.200) |
| Fade (raised cosine, last bar only) | edit 113.800 → 115.825 s (source 162.400 → 164.425). It fades only the chord tail after the song's own stop |
| File end | **115.825 s = 1:55.825**, which is the downbeat of bar 57 |

Why this pair:
- **Harmony and phrase.** Bar 47 is an E riser bar that resolves to F#m. Bars 48 and 72 are both F#m and both start an 8-bar phrase, so the lead change happens on a phrase boundary, which is where the arrangement changes anyway.
- **Same material.** Bar 48 against bar 72: correlation 0.952 over the first 0.5 s and 0.917 over the whole bar. The best lag in a ±400-sample search is 0, so the two bars are sample-aligned.
- **Form.** The result after drop 2 (bars 40–47, then 72–79) is note for note the same as drop 1 (bars 8–15, then 16–23), followed by the song's real stop.

Measured join quality:

| Check | Splice | Natural bar line it replaces (47→48) |
|---|---|---|
| Loudness step, 400 ms before vs 400 ms after | +1.28 dB | +1.30 dB |
| 5 ms envelope against the natural transition, ±30 ms | mean +0.2 / +0.1 dB, max 1.5 dB | — |
| Click energy above 8 kHz, last 30 ms before the attack | −65.7 dB (equal to the median, so no click) | −65.3 dB |
| Band levels, bar 72 vs bar 48 | sub 0.0 · 120–400 Hz −0.3 · 400 Hz–1.2 kHz −3.1 · 1.2–3 kHz +0.8 · 3–6 kHz +1.1 · >6 kHz +0.2 dB | — |

- The −3.1 dB in the 400 Hz–1.2 kHz band is the variant lead in bars 48–55 that we are removing. Bar 72 matches drop 1's bar 16 within 0.8 dB.
- The splice is masked by the downbeat kick 2 ms later.
- A hard cut with no crossfade made a +7.6 dB click above 8 kHz, so keep `XF_MS ≥ 10`.

Other cut points I measured:
- **Same 24-bar cut at bar 52 → 76:** this also gives 115.825 s, but it changes the lead melody mid-phrase.
- **Bars 49–55:** these joins have a weaker match on one side (correlation 0.86–0.91).
- **Bar 56:** this jumps from body level into the −26 LUFS tail, a −12 dB drop.
- **One-cut alternative if a longer film is wanted:** remove 20 bars, source bar 52 → 72 (bar 52 against bar 72: correlation 0.917, residual −7.8 dB). The length is **123.925 s (2:03.9)**. The cost is a 12-bar phrase (bars 40–51) after drop 2.
- **The 1:56–2:02 window cannot be hit with whole phrases.** The loop is 4 bars (8.1 s), so a cut that keeps the harmony can only give 115.8 s or 123.9 s. A 22-bar cut would land an F#m bar on a D bar.
- **A two-cut version would not help:** every cut that keeps the harmony is a multiple of 4 bars, so it gives the same two lengths.

Mix numbers of the edit (the music is untouched, so these are the track's own):
- **Loudness:** −10.03 LUFS integrated, and +0.26 dBTP true peak (+0.20 dBFS sample peak; the master is hot).
- **Phone speaker (high-pass at 350 Hz):** the drops are at −12.9 LUFS and the breakdown at −17.7 LUFS. No stretch is more than 6 dB under the body for longer than one bar, apart from the one-bar pre-drop dip (bar 39).
- **Mono fold-down:** −0.8 dB.
- Follow the owner's ep14 rule: do not loudnorm or limit the music. Turn only the SFX down where the sum clips.

## 4. Bar grid of the edited timeline (`bgm_cut.wav`)
The formula is unchanged across the splice: **downbeat(n) = 0.400 + 2.025·n s for n = 0…57**. Edit bar n = source bar n for n ≤ 47, and source bar n+24 for n ≥ 48.

| Edit bar | Source bar | Downbeat (s) | Frame @30 | Marker |
|---|---|---|---|---|
| 0 | 0 | 0.400 | 12 | intro (groove from the first frame) |
| 1 | 1 | 2.425 | 73 |  |
| 2 | 2 | 4.450 | 134 |  |
| 3 | 3 | 6.475 | 194 |  |
| 4 | 4 | 8.500 | 255 |  |
| 5 | 5 | 10.525 | 316 | intro thins out (bass and highs drop) |
| 6 | 6 | 12.550 | 377 |  |
| 7 | 7 | 14.575 | 437 | pre-drop bar; last beat dips to about -20 LUFS |
| 8 | 8 | 16.600 | 498 | **DROP 1**: title. Phrase A1 (src 8) |
| 9 | 9 | 18.625 | 559 |  |
| 10 | 10 | 20.650 | 620 |  |
| 11 | 11 | 22.675 | 680 |  |
| 12 | 12 | 24.700 | 741 |  |
| 13 | 13 | 26.725 | 802 |  |
| 14 | 14 | 28.750 | 863 | bright lift bar |
| 15 | 15 | 30.775 | 923 | bright lift bar (riser) |
| 16 | 16 | 32.800 | 984 | phrase A2 (src 16) |
| 17 | 17 | 34.825 | 1045 |  |
| 18 | 18 | 36.850 | 1106 |  |
| 19 | 19 | 38.875 | 1166 |  |
| 20 | 20 | 40.900 | 1227 |  |
| 21 | 21 | 42.925 | 1288 |  |
| 22 | 22 | 44.950 | 1349 | bright lift bar |
| 23 | 23 | 46.975 | 1409 | bright lift bar (riser) |
| 24 | 24 | 49.000 | 1470 | **BREAKDOWN** (-14.2 LUFS, 5 dB under the body) |
| 25 | 25 | 51.025 | 1531 |  |
| 26 | 26 | 53.050 | 1592 |  |
| 27 | 27 | 55.075 | 1652 |  |
| 28 | 28 | 57.100 | 1713 |  |
| 29 | 29 | 59.125 | 1774 |  |
| 30 | 30 | 61.150 | 1835 |  |
| 31 | 31 | 63.175 | 1895 | riser bar (no bass, centroid 2.7 kHz) |
| 32 | 32 | 65.200 | 1956 | **BUILD** (intro material returns) |
| 33 | 33 | 67.225 | 2017 |  |
| 34 | 34 | 69.250 | 2078 |  |
| 35 | 35 | 71.275 | 2138 |  |
| 36 | 36 | 73.300 | 2199 |  |
| 37 | 37 | 75.325 | 2260 |  |
| 38 | 38 | 77.350 | 2321 |  |
| 39 | 39 | 79.375 | 2381 | pre-drop dip (-14.4 LUFS; -21 on a phone speaker) |
| 40 | 40 | 81.400 | 2442 | **DROP 2**. Phrase A1 again (src 40) |
| 41 | 41 | 83.425 | 2503 |  |
| 42 | 42 | 85.450 | 2564 |  |
| 43 | 43 | 87.475 | 2624 |  |
| 44 | 44 | 89.500 | 2685 |  |
| 45 | 45 | 91.525 | 2746 |  |
| 46 | 46 | 93.550 | 2807 | bright lift bar |
| 47 | 47 | 95.575 | 2867 | bright lift bar (riser) -> splice 2 ms before bar 48 |
| 48 | 72 | 97.600 | 2928 | **final phrase** = src bar 72 (same as drop-1 A2) |
| 49 | 73 | 99.625 | 2989 |  |
| 50 | 74 | 101.650 | 3050 |  |
| 51 | 75 | 103.675 | 3110 |  |
| 52 | 76 | 105.700 | 3171 |  |
| 53 | 77 | 107.725 | 3232 |  |
| 54 | 78 | 109.750 | 3293 | brightest lift bar |
| 55 | 79 | 111.775 | 3353 | brightest lift bar (riser): last climax |
| 56 | 80 | 113.800 | 3414 | **STOP**: the song ends on this downbeat (src 80); chord tail, fade over this bar |
| 57 | 81 | 115.825 | 3475 | end of file |

**Key times for the film (edited timeline):**
- Title on drop 1: **16.600 s** (frame 498).
- Breakdown: **49.000** (frame 1470).
- Riser: 63.175.
- Build: **65.200** (frame 1956).
- Pre-drop dip: 79.375.
- **Drop 2: 81.400** (frame 2442).
- Final phrase: 97.600.
- Last lift bars: 109.750 and 111.775.
- **Song stop: 113.800** (frame 3414).
- End: **115.825** (frame 3475). The film is 3475 frames.
- Phrase starts every 16.2 s: 0.4, 16.6, 32.8, 49.0, 65.2, 81.4, 97.6, 113.8.

## Notes for the edit and picture
- **Drops 1 and 2 are the same loudness.** Drop 2 feels bigger only because of the 32 s of breakdown, build and dip in front of it. Give it a picture pause in bar 39 (79.375–81.400), with the image gathering and then holding on the last beat at 80.894, and put the film's biggest image on 81.400.
- **The brightest moments are the lift bars before each phrase start:** 28.75–32.8, 44.95–49.0, 93.55–97.6 and 109.75–113.8. They are natural risers into the next reveal.
- **The last climax is bars 54–55**, followed by the hard stop on 113.800. The final punchline or end-card slam belongs on 113.800. After that, nothing on the picture or in the SFX should get brighter or louder (owner, ep29). The tail fades to silence on 115.825.
- **Tonal SFX:** tune them to F# minor −32 cents (F# ≈ 363 Hz, C# ≈ 544 Hz). Avoid G, which clashes with the F#m bars.
