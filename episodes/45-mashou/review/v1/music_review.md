# ep45 《马首回家，用了160年》 v1: music and picture-to-music review

The film's audio is the bed itself. It is sample-aligned (0 ms lag) and the gain difference is −0.004 dB, so every
measurement here was taken on `music/ep45_film_bed.wav` and checked against the decoded mp4.
The bed is mono: bgm2.mp3 has one channel, L/R correlation is 1.000, and there are no stereo issues.
I measured everything and listened to nothing. Scripts are in `review/v1/music_scripts/`.

Plots:
- `music_energy.png`: 400 ms momentary and 3 s short-term LUFS, centroid, and sub vs 2–5 kHz over the whole film
- `music_joins.png`: 10 ms RMS and spectrogram ±1 s around each of the 8 joins
- `music_hits.png`: band envelopes at the title, the final hit, the drop and the dead stop
- `music_drop_phone.png`: drop contrast, full band vs phone speaker (HPF 250 Hz), now vs proposed
- `music_hammer_sync.png`: the 56.6 s break / 57.175 s re-entry hit, and the 79.8 s valley boom
- `music_strip_*.png`: picture at each landmark
- `music_cuts.json`: every hard cut with its offset from the nearest beat and its beat-of-bar

## Verdict

**Technically clean, musically under-used. Fix 4 MAJOR items before the morning; none of them needs a re-render
of the music except MAJOR 2 (two gain lines).**
- **The bed passes.** No join clicks, no level jumps that aren't the song's own downbeats. −14.0 LUFS integrated,
  −1.97 dBTP true peak, LRA 4.8.
- **The planned hits mostly land.** The title crash, the drop, the coda cut, the stop hit and the final hit are all
  within 30 ms on the picture.
- **The film misses four of the hits the music hands it:**
  1. the hammer is 0.65 s early on the music's own 1-beat break;
  2. the drop does not lift on a phone speaker;
  3. the picture freezes through two music holes (105.7–110.4 and 135.1–137.8);
  4. K1 cuts 0.53 s before the first note it was meant to sit on.

## Measured answers to the five questions

**(1) Joins.** All are inaudible as edits. The two that are audible are audible by design.

| Join | Level step (50 ms pre→post) | Song's own step at that point | Click (max sample step / local p99.9) | Verdict |
|---|---|---|---|---|
| 5.097 | −1.9 dB | −4.5 dB | 0.017 / 0.044 | inaudible (flux 7th pct of body beats) |
| 9.626 | −1.9 dB | −4.4 dB | 0.022 / 0.044 | inaudible |
| 20.947 | +4.7 dB | +4.0 dB (B section downbeat) | 0.098 / 0.086, HF burst −4.6 dB under local p95 | inaudible: reads as the song's own downbeat (flux 37th pct) |
| 75.287 | +5.1 dB | +8.4 dB (valley 808 boom) | 0.149 / 0.086; the song's own transient there is 0.095; 2 ms HF +3 dB over the song's | inaudible under the boom (POLISH 13) |
| 106.42 | inside the silence (−84 dBFS) | — | — | inaudible |
| 125.10 | −5.4 dB, mel distance 8.8 dB | — | 0.026 / 0.096 | **audible on purpose** (drop → coda with a 2.5 s tail). No click. Works for 只有你 |
| 136.09 | −9.9 dB | −22 dB (the song's own dead stop) | none | the intended dead stop, carried by a reverb tail |
| 137.77 | −3.8 dB step inside the reverb tail | 0 | none | **the line-27 −3 dB gain step cuts into the tail** (POLISH 10) |

**(2) Landmarks vs measured onsets.**

| Landmark | Measured attack | Picture | Verdict |
|---|---|---|---|
| Title 18.115 | Crash (>4 kHz) attack −9 ms; full band +3 ms; sub +36 ms; loudness peak +51 ms. The momentary max of the whole film (−9.5 LUFS) follows at about 18.3 s. | Title card cut at 18.133 (+18 ms) | It is the hardest early hit: the title bar is −11.8 LUFS against a body of −13.4 |
| DROP 116.04 | Attack +9 ms (sub +6, HF −3) | Cut at 116.067 (+24 ms) | **On time, but does not lift on a phone** (MAJOR 2) |
| Coda cut 125.10 | Step down at 125.100 by construction; the drop's last transient is at 125.02 | H4 at 125.10 (0 ms) | ✓. The twist lands on the music thinning out, which suits 只有你 |
| Final hit 146.82 | Identical to the title: attack +3 ms, crash −9 ms | Cut at 146.833 (+10 ms) | **On time, but the gavel is already down on the cut frame** (MINOR 8) |
| Stop HIT 105.29 | 105.290 (0 ms); 4th-strongest onset in the film (3.9× median) | E4 at 105.29 | ✓ |
| "Re-entry HIT 63.97" (script v3 header) | **No hit at 63.97**: onset 0.8× the median beat. The real re-entry hit (song 54.910) is at **57.175**: 3.6× median, +16.6 dB after a 1-beat break 56.609–57.175 | D4 at 63.97 | The script mapped A_valley film time +9.056 instead of song +2.264 (MAJOR 1) |
| Intro return 137.77 | 137.77 is song 0.0. **The first note is at 138.332** (onset 4.0×, +27.6 dB) | K1 cut at 137.80 | 531 ms early (MAJOR 3) |
| Dead STOP 136.09 | Drops to −28 dBFS at 136.10 | No picture event: frame diff 0.000 from 135.07 to 137.80 | MAJOR 3 |

**(3) Hard cuts vs beats.** The full table is in `music_cuts.json`.
- **On the grid (31 cuts).** These are within +0…+33 ms of a beat, median about +12 ms: the frame lands just after the beat, which is fine.
- **The rewind flashes 17.57–18.07** are off-grid by design. They run exactly 1 beat and end on the title crash ✓.
- **Off-grid (3 cuts):**
  - **41.70**: −191 ms before beat 41.891. This is a one-frame sky change from blue to sepia (frame diff 20.7).
  - **114.73**: −181 ms before 114.911, which is exactly where the breath starts. This is a one-frame sky change from night to dawn.
  - **137.80**: −531 ms before the first note.
- **On a weak beat.** The 6 cold-open cuts (3.40 … 14.73) all sit on **beat 2** of their bar. Also 24.93, 52.10, 81.53 and 99.63 (beat 4), and 84.93 and 121.17 (beat 2). In the coda, the cuts at 127.93 and 131.33 sit on a grid the music does not follow (MINOR 7).

**(4) Loudness.**
- **Film:** −14.01 LUFS integrated, −1.97 dBTP true peak (sample peak −1.99, at the title), LRA 4.8 ✓.
- **2–5 kHz:** −15 to −21 dB relative in every section; no harshness.
- **Low end:** the drop is sub-dominated (<80 Hz is only 3.6 dB under the total). This is why it disappears on phones.
- **Quiet stretches** (more than 6 dB under the body for more than 1 s):
  - 105.95–106.98: digital silence, 1.03 s;
  - **136.2–138.4: 2.2 s, minimum −44 LUFS momentary**;
  - 151.7–153.9: the final fade, fine.
- **The intro return** (137.8–146.8) averages −19.1 LUFS momentary against a body of −13.4. That is 5.7 dB under for 4 bars, at the edge of row 50's ~6 dB.

**(5) The 1-s silence at 105.98.**
- **The silence itself works.** It is 1.03 s of true silence (−84 dBFS) after the stop hit, under 他没等到 and the empty armchair. It is the film's only full sound pause, as pauses.md asks.
- **It fails in two ways:**
  - **The picture is practically frozen:** mean frame diff 0.06 from 105.67 to 110.40, against a film median of 0.18. Silence plus a still frame is exactly row 91's "reads as the video lagging".
  - **Nothing happens on the picture when the music comes back at 106.986.** That re-entry is the single strongest onset in the film (8.4× the median beat, +65 dB from silence). The picture holds still for 3.4 s more, until the cut at 110.40, so the pause never resolves into a hit (MAJOR 4).

---

## Ranked fix list

### MAJOR

**1. 0:55.5–0:57.2: the hammer falls 0.65 s before the music's built-in hammer.**
- **Evidence:**
  - D2 「锤子落下，你被台湾收藏家买走」 starts at 55.476.
  - The auctioneer's arm drops at 56.43–56.53 (frame diff 0.5–0.7; the `music_strip_d2gavel.png` tiles at 56.0 and 56.6).
  - The music then **breaks for exactly one beat** (−11 → −31 dBFS from 56.61 to 57.14) and re-enters with a hit at **57.175**: 3.6× the median onset, +16.6 dB, the 5th-strongest beat of the film. At that moment the picture is still (diff 0.2). See `music_hammer_sync.png`.
- **Cause.** The script v3 header lists "re-entry HIT 63.97 (D4 hammer)". That is song 54.910 + 9.056, the A_valley offset; under build45film's SPANS the correct offset is +2.264. At 63.97 the onset is 0.8× the median, so nothing is there.
- **Fix:**
  - In the D2 scene, keep the gavel **raised** from about 56.04 (beat) through the break: a ½-beat wind-up with a slight tremble, per pauses.md §1.
  - **Strike on frame 1715 (57.167 s).** Give the gavel/block a 3-frame jolt (the object only, row 54), and switch the "41" paddle and the price slip on the strike.
  - D4 at 63.97 can stay as a plain downbeat strike.
  - Correct the script.md header landmark to "re-entry HIT 57.175 (D2 hammer)" so later edits don't chase a hit that isn't there.

**2. 1:56.04: the DROP does not lift on a phone speaker, and its biggest bars get a near-still picture.**
- **Phone-speaker evidence** (HPF 250 Hz + K-weighting, `music_drop_phone.png`):
  - lead-in 106.99–114.91: −16.4 LUFS;
  - breath 115.48–116.04: −20.6;
  - **drop bar 116.04–118.31: −16.9**.
  - So on a phone the drop is **0.6 dB quieter than the lead-in** and only 3.6 dB over the breath. Full band it is +2.1 dB, but that gain is all under 80 Hz.
- **Picture evidence:**
  - The drop's loudest bars are 120.57–125.10 (−12.4/−12.7 LUFS per bar, the loudest sustained music in the film).
  - Under them the picture is near-static: 118.93–121.17 and 121.43–125.10 (3.7 s), mean frame diff about 0.
  - The hero is a small pavilion in a field (`music_strip_drop.png`). Row 88 asks for the most spectacular frame on the emotional peak.
- **Audio fix,** in `build45film.py` after line 26, before the loudnorm on line 30:
  ```python
  li = np.clip((t - (DROP - 16*P)) / P, 0, 1); li[t >= DROP] = 0; g *= 10 ** (-2 * li / 20)   # lead-in -2 dB from 106.986
  ```
  and change the breath depth on line 26 from `-5*w` to `-8*w`.
  - Simulated on the phone: drop vs breath goes from +3.6 to **+8.6 dB**, and drop vs lead-in from −0.6 to **+1.4 dB**. Integrated loudness moves −0.05 dB and line 30 re-normalises it.
  - Nothing moves in time.
- **Picture fix** (the drop scene, 116.04–125.10):
  - On 116.043, slam the head into its pavilion niche: fast scale-down plus a damped jolt on the head only.
  - Then run one continuous slow push from the wide shot to the head over 116–125. It should end with the head filling about ⅓ of the frame by 125.10, ready for the H4 reveal.
  - Land H2 160年 (118.873) and H3 七个 (121.137, an onset at 2.0×) as reveals on the object, not as frame cuts.

**3. 2:15.1–2:18.3: dead stop → K1. A 2.2 s decaying tail over a fully frozen frame, and K1 cuts 0.53 s before its note.**
- **Evidence:**
  - The music stops at 136.088. The reverb tail falls from −28 to −46 dBFS, and the momentary level goes down to −44 LUFS.
  - The picture is static to the pixel (frame diff 0.000) from 135.07 to 137.80: 2.7 s.
  - K1 cuts at 137.80, but the intro's first note is at **138.332** (song 0.555 s of lead-in silence), so the cut lands in near-silence and the note arrives on a still frame.
  - Rows 50 and 91.
- **Fix, picture only:**
  - **On 136.088 (the stop), do something to the thing.** The highlight ring around the curled ear snaps shut, and the key light narrows to a single spot on the ear.
  - **Then a slow push into the ear** through the tail (about 3 % scale over 2.2 s).
  - **K1 cut on frame 4150 (138.333 s),** the first note.
  - **Re-time the K lines to keep the reading speed:** K1 138.332–141.728, K2 141.728–144.569 (141.728 is beat 3, a half-bar), K4 and K5 unchanged.
    - K1 then has 3.40 s, enough for `typed` (it needs 3.36).
    - K2 has 2.84 s for 2.67 s of need.
  - In `plan45.py` this means:
    - K1 anchor `137.77` → `138.332`;
    - add an anchor of `141.728` on K2 (currently `None`).

**4. 1:45.3–1:50.4: the silence works, but the picture is frozen through it, and the strongest re-entry in the film goes unanswered.**
- **Evidence:** as in (5) above. Frame diff is 0.06 from 105.67 to 110.40; the re-entry at 106.986 is 8.4×, +65 dB, and the picture does nothing until 110.40.
- **Fix:**
  - **During the silence (105.95–106.98),** keep one tiny living motion so nobody thinks the player hung: dust in the lamp cone, or the star in the window visibly breathing. Don't use blur, dimming or a whole-frame push (row 54).
  - **On 106.986, the lamp switches off**: a light event on the object.
  - **Then the window star starts to grow and slide.** On the bar line 109.250 (frame 3277/3278), match-cut it into the truck's headlight on the 2020.12.1 night road.
  - **Move H1a's start from 110.40 to 109.25** (`plan45.py` anchor `110.40` → `109.250`). E4 still gets 3.96 s.
  - **Moving H1a also fixes POLISH 11's twin,** because 110.38 is only a half-bar.

### MINOR

**5. 1:19.25 and 1:24.91: the punches sit one beat off the valley's 808 booms.**
- **Evidence:** the valley has an 808 boom every 2 bars, at 75.287, **79.815**, **84.344** and 88.872. The <120 Hz band is at −14 dB on each boom and −40 between them.
  - D8 (75.29) and D12 (88.87) are on booms ✓.
  - **D9 「6910万港元」 appears at 79.25–79.27, 565 ms before its boom.**
  - D11's cut at 84.93 comes 566 ms after a boom.
- **Fix:** in `plan45.py`, anchor D9 at `79.815` and D11 at `84.344`. The windows still read:
  - D8 4.53 s;
  - D9 1.70 s (it needs 1.67);
  - D10 2.83 s (it needs 2.67);
  - D11 4.53 s.
  - The 6910 counter should land its last digit on 79.815.

**6. 0:41.70 and 1:54.73: one-frame sky/grade jumps between beats.**
- **41.70** is 191 ms before beat 41.891: a blue → sepia jump with frame diff 20.7 in one frame.
- **114.73** is 181 ms before 114.911, the beat where the breath begins.
- They read as glitches, and they are off the grid (row 49).
- **Fix:**
  - Make each one a 1-beat ramp that *ends* on a beat: 41.325 → 41.891, and 114.345 → 114.911.
  - The dawn ramp then finishes exactly as the pre-drop breath starts, giving a picture pause plus a sound pause into the drop.

**7. 2:05.1–2:16.1: the coda is in free time; cut on its chords, not the grid.**
- **Evidence:** in the coda only 12 of 20 grid beats carry an onset. Their median offset is −29 ms, and onset strength is flat across the 8th-note positions (0.67–1.43), so there is no pulse.
- **The measured chord changes** (chroma novelty, matching the ep42 map +2.265) are 126.24, 127.30, 128.18, 129.30, 130.45, **131.59**, 132.70, 133.84 and **134.99**.
- **Fix:** move these starts onto chords:
  - H5 127.93 → **128.16**;
  - H7 131.33 → **131.64**;
  - H8 134.72 → **134.98**.
- Every window still holds its reading need (the H4 window grows). In `plan45.py`, give these three explicit anchors.

**8. 2:26.82: the final hammer has no strike, and the ending gets brighter after the climax (row 95).**
- **Evidence:**
  - At the cut frame (146.85) the auctioneer's gavel is already down, and from 147.20 to 150.80 the frame is static (3.6 s).
  - After the hit, the centroid jumps from 1012 Hz (return) to 2496 Hz and the momentary level rises from −19.1 to −15.4 LUFS. This is the only post-climax lift.
  - It stays under the drop (−12.9), so it is a risk, not a breach.
- **Picture fix:** the cut on 146.823 shows the gavel at the top of its arc, and it strikes 2 frames later with a 3-frame jolt on the block. Then the "?" plinth light pulses once on 147.389, the next downbeat (onset 2.0×).
- **Audio fix (optional,** the cheapest way to honour row 95 inside `build45film.py`): a one-pole low-pass on the final fade only, from `i` on line 28. Sweep the cutoff from 12 kHz to 1.5 kHz over the last 2 bars so the end "falls apart" instead of ringing bright.

**9. Owner-rule risk on the bed's structure.**
- **The bed chops bgm2:**
  - 2 intro loops;
  - 3 section skips;
  - a 1-s silence;
  - a dead stop with a 1.7 s gap;
  - a song restart;
  - −5/−3 dB gain moves and synthetic reverb tails.
- **Rows 51 and 64 (ep14)** say "don't chop the owner's track into stops, silences and re-builds" and "1 coherent untouched BGM".
- **Row 112 / pauses.md (2026-10-22)** later endorsed one or two real sound pauses per film.
- The owner has only heard the 0–34.5 s demo bed, so the stop/gap/restart structure is unheard by him.
- **Fix:** none tonight, because the edits are inaudible as edits. In the delivery message, say in one line that the music is the ep42 cut with one silence and a dead stop, so he can veto it.

### POLISH

**10. 2:17.763: the bookend −3 dB step cuts into the reverb tail.**
- `build45film.py` line 27 applies `g[jr:] *= 10**(-3/20)` as an instant step to everything, including the ir2 tail still ringing from the dead stop: −3.8 dB in 50 ms at −42 dBFS.
- **Fix:** ramp it over the gap instead:
  ```python
  r = np.clip((t - joins[6]) / (joins[7] - joins[6]), 0, 1); g *= 10 ** (-3 * r / 20)
  ```

**11. The cold-open cuts all sit on beat 2.** 3.40, 5.66, 7.93, 10.19, 12.46 and 14.72 are each 1 beat after the downbeats and chord changes (0.6, 5.1, 7.39, 9.63, 11.92, 14.17).
- The intro has no kick (<150 Hz at −40 dB), and the offset is consistent, so it reads as syncopation, not error.
- Moving them breaks C1's reading time (it would get 2.83 s and needs 3.2 s). **Leave it.**

**12. Cuts land +10 to +33 ms after the beat** (median +12 ms), because cut frames are rounded up.
- Picture slightly late is perceptually fine.
- For the 5 hero hits (18.115, 57.175, 116.043, 138.332, 146.823), round the cut frame **down** (`floor(t*30)`) so the image leads the sound by under 1 frame.

**13. 75.287: the join adds a 2 ms high-frequency tick** (+3 dB over the song's own transient at the same point; sample step 0.149 vs 0.095). It is buried under the 808 boom.
- If the bed is rebuilt anyway, `XF[3]` 0.010 → 0.020.

**Not music, but in the probe:** the file is 116 MB at 5.8 Mbps. Owner row 21 says deliver ≤28 MB (~2 Mbps, 2-pass) for the chat. The probe's "upload ≥8 Mbps" flag contradicts the owner's rule.

---

## Masterclass techniques

1. **Hammer as the film's rhythmic motif** (57.175 → 88.872 → 146.823). Give the gavel the music's three real accents: the re-entry after the 1-beat break, the valley crash, and the final crash. Each time it rises on the beat before and strikes on the hit. The viewer learns "hammer = the music hits" by the second auction, so the last one (the dragon, 真假说不清) lands as the theme's last word.

2. **Inhale before the drop** (114.911–116.043). This is the gain carve in MAJOR 2, plus a reversed reverb of the drop's first hit swelling under the breath, using `tail_at` with `ir2[::-1]` from song 191.328 placed to end at DROP, at −15 dB. Row 96's "bridge with an inhale, then hit" gives 你回到圆明园 the biggest physical arrival in the film, and on a phone it is the contrast, not the sub, that is heard.

3. **The silence as negative space with one living thing** (105.95–106.986). Keep the true 1-s silence; one breathing star in the window keeps the frame alive. On the re-entry the lamp goes out, so the absence becomes visible. This is pauses.md's combined pause (picture holds, music stops, then the light event lands), used once in the film, on the death of the man who brought the horse home.

4. **Free-time coda edited to the harmony** (125.10–136.09). Cut on the measured chord changes (128.16, 131.64, 134.98), not on a metric grid that isn't there. The three discoveries (幸存, 卷了, 被撞过) each arrive as the harmony turns, which is what makes a rubato coda feel inevitable instead of loose.

5. **Freeze-on-the-thing at the dead stop, then a memory match-cut on the first note** (136.088 → 138.332). The ring snaps shut on the curled ear as the music dies, the camera creeps in through the reverb, and the noon fountain arrives with the intro's first note. Musically this is a recapitulation, and the picture recapitulates with it (正午十二点 from 34.53), so the bookend is heard and seen at once.

6. **The ending falls apart** (147.389–154.18). A low-pass that closes over the last 2 bars under the end card, so nothing gets brighter after the last climax (row 95). The question 该花钱买回来吗 then sits in a darkening sound, not a bright tail.
