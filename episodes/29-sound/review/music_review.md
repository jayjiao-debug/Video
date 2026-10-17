# Music review: ep29 《为什么好听？》 v2 (soundtrack v3, film 163.2 s)

Reviewer: music specialist. I measured everything below; I did not listen. Times are on the **film timeline**.
Plots are in `review/music/`. A tested patch is in `review/music/process_v3_proposed.py`, a copy of `music/process_v2.py` with every change tagged `# FIX n`. I ran it and measured its output. No existing file was modified.

## Verdict

The concept and the effect chain are strong, but the cut has one structural fault that undermines every effect that is meant to land on the music. **The whole soundtrack and picture run on the wrong beat grid.** `process_v2.py` uses `BEAT = 0.510839` (117.45 bpm). The song is **118.52 bpm** (beat 0.50625 s, phase-stable to ±2 ms across all 80 bars). All `OB(k)` times therefore drift 18 ms per bar behind the real bars:

- At the **title**, the gap is +0.74 s. The song's real drop hits at **80.34 s**. The title, burst and shake hit at 81.06 s. In between, the orbiting dot has faded and the subtitle has ended, so the picture idles while the drop plays (`03_drop_zoom.png`). This is very likely what the owner felt as "awkward 卡顿". Removing the 0.42 s silence did not cure it, because the picture still waits ¾ s after the music.
- By the end card, the gap is +1.48 s.
- Subtitles land on a real downbeat 4/55 times now, against 27/55 on the intended grid.

The same file was measured in owner-notes row 66 (bars 2.0248 s, drop at 81.38 s source). Row 49 already warned that this "Slowed" track is 118.5 bpm, not ~117.9.

The fix tonight is on the soundtrack side only. A pitch-preserving rubberband stretch of 0.90 % moves the song onto the film's grid. Bar times change by ≤ 4 ms, so Film29, the subtitles and the timing JSON stay as they are. After that, the main remaining problems are mix-level ones the earbud listener would feel:

- The Shepard "endless rise" is inaudible.
- The 360° rotations are only a ±4 dB sway.
- The demo sines are masked.
- The centre-cancel is anti-phase: louder than the "合回来！" slam on earbuds, and silent on a phone speaker.
- The delivery loudnorm silently ran in dynamic mode and flattened the build.

All of these are fixed and verified in the proposed script.

Measured targets, v2 → proposed v3:

| | v2 delivered | v3 proposed |
|---|---|---|
| Song beat vs film grid (per 8 bars) | −250…+246 ms (drifting) | −2 ms everywhere |
| Song's drop onset vs title (81.06) | 80.34 (−0.72 s) | 81.05 |
| Integrated loudness / true peak | −14.0 LUFS / −1.1 dBTP (dynamic loudnorm) | −14.0 / −1.5 dBTP, linear, limiter ≤ 3 dB |
| Shepard vs rest of mix (73–80.5 s) | −24 → −9 dB | −4…−7 dB, +3 in last bar |
| 360° L/R swing (p5/p95) | ±3.7 dB (slow), ±3.2 (finale) | ±7.6, ±6.1 |
| Centre cancel, mono-sum loss | −40 dB (phone = silence) | −3 dB |
| Demo tones vs their critical band (root / octave / fifth / clash) | −9.3 / −3.5 / −3.7 / −11.1 dB | −4.1 / −3.1 / −3.2 / −7.5 dB |
| Track's own F# leaking into the binaural band | −18 dB re band | −42 dB |
| Build first 2 bars vs body (earbud weighting) | −7.8 dB | −5.8 dB |

Plots:
- `review/music/01_overview.png`: loudness, bands, stereo and picture activity of the delivered film, with effect windows shaded.
- `review/music/02_beat_grid_drift.png`: the grid error and the folded onset map (diagonals = drift).
- `review/music/03_drop_zoom.png`: song drop at 80.34 against the title at 81.06.
- `review/music/04_v2_vs_v3_proposed.png`: the loudness, L−R and mono-sum curves before and after the patch.

---

## MAJOR

### 1. Every "on the bar" moment is late, growing to 1.5 s; the title misses the drop by 0.74 s
- **Where:** whole film. Code bar vs real bar: bar 8 (15.68) +155 ms; bar 24 (48.37, binaural) +449 ms; bar 32 (64.72, gotcha) +595 ms; **bar 40 (81.06, title) +742 ms**; bar 56 (113.76) +1036 ms; bar 64 (130.54, recap) +1183 ms; bar 80 +1477 ms.
- **Evidence:**
  - Fine tempo search (onset autocorrelation, whole song): best beat 0.50625 s with b0 0.410. Score 2.21, against 0.125 for the code grid. Local phase is 0 ms in every 32-beat block.
  - Film audio: the biggest 25 ms level jump around the drop is at 80.34 s (+17 dB). Picture change at 80.34 is flat (3.4/frame); the burst comes at 81.07 (22/frame). See `03_drop_zoom.png`.
  - Consequences:
    - Ping-pong ear switches (10–15 s) land 96–140 ms after each kick, so the kick starts in one ear and its body jumps to the other.
    - Gotcha switches (64.75 / 66.72 / 68.75) land 63–118 ms after a beat.
    - Shepard eighths sit −91…+90 ms off the hats.
    - The kick "pump" ducks the off-beat.
    - The −2-semitone sad slowdown starts 2 beats into bar 59.
    - The gotcha arrow pulse lands 93–130 ms after each real beat.
    - Subtitles on a real downbeat: 4/55 now, against 27/55 as designed.
- **Fix (FIX 1, done in the proposed script):** conform the song to the film grid instead of moving the picture.
  1. Top of `process_v2.py`: load `bgm_conformed.wav`, made once with `ffmpeg -i bgm.mp3 -af rubberband=tempo=0.991017:transients=crisp:detector=percussive:pitchq=quality`.
  2. Keep `BEAT = 0.5108390`. Set `B0 = 0.414`, measured on the conformed file.
  3. Set `ROOT = 362.8`, the measured tonic (−34 cents).
  - Pitch is preserved (tuning −35 cents before and after).
  - Transients soften slightly: onset peak/median 17.0 → 15.1, the cost of the stretch.
  - Verified: song beat vs code grid −2 ms in all ten 8-bar blocks; drop onset at 81.050.
  - `timing_v2.json` bars move by −3…−4 ms, so `Film29.tsx`, `lines_v2_arr.json` and `T.drop` need no change.
- **Re-render:** regenerate `build/live29.json` (`python3 build/live29.py <new wav>`), because the ear glows, rings and spectrum read it.
  - Minimum re-render: 0–87.6 s (S1–S11 plus title) and 130.4–140.75 s (recap spectrum and rings).
  - The 87.6–130.4 and 140.6–end segments use live data only for ear-glow levels and the 1.4 % Air breathing, which is not visible enough to matter. Re-render them too if the farm has time.

### 2. Delivery loudnorm silently ran in dynamic mode and re-rode the mix (build flattened ~3 dB)
- **Where:** whole film; worst at 30–34 (−2.4 dB), 38–42 (−1.9 dB) and **72.9–77 (+3.2 dB lift on the quiet start of the build)**.
- **Evidence:**
  - `soundtrack_v3_raw.wav` measures −15.9 LUFS with **+0.4 dBTP** true peak (peak-normalised at line 231).
  - A linear +1.9 dB to reach −14 would put the true peak at +2.3. ffmpeg's two-pass `loudnorm … linear=true` therefore falls back to dynamic mode.
  - Gain film/raw per 400 ms block: median +1.96 dB, range −0.44…+5.16 dB.
  - Delivered true peak is −1.1 dBTP, above the −1.5 target.
  - The raw overs come from the HP section (30.2–31.4, ×2.3 gain) and the centre cancel (38.6–42.0, ×3).
- **Fix (FIX 12, done):** at the end of the script, replace `y / max * 0.95` with:
  1. pyloudnorm to −14 LUFS;
  2. a 4× oversampled look-ahead limiter at −1.6 dBFS (4 ms look-ahead, 80 ms release);
  3. a 24-bit write.

  Then mux without loudnorm. Even if a loudnorm pass runs, it now stays linear.
  - The gotcha gain is lowered from 1.35 to 1.12 (it hit the limiter).
  - Verified: −14.0 LUFS, −1.5 dBTP, limiter ≤ 3.0 dB everywhere (the script now prints where it acts).

### 3. The "endless rising tone" (Dunkirk trick) is inaudible under its own subtitle
- **Where:** 72.89–80.56 s. Subtitle 一个永远在上升的音—— at 75.89; label ① 永远在上升的音阶 from 72.89.
- **Evidence:** projecting the film onto the exact Shepard signal gives these levels against the rest of the mix: −24.4 dB (73–75), −17.2 (75–77), −11.4 (77–79), −8.6 (79–80.5). While the line is on screen it is 11–17 dB under the music, so it reads as nothing.
  - Cause: `sh *= 0.06 * cres`, with `cres` starting at 0.15, then the whole-mix crescendo multiplies it by 0.6.
- **Fix (FIX 2, done):** `sh *= 0.17 * cres` with `cres = cosr(...)*0.6 + 0.4`. Verified −4.3 / −7.4 / −4.5 / +3.4 dB against the rest: audible from the first note, on top in the last bar.

### 4. Centre cancel is pure anti-phase: louder than the "slam back" on earbuds, silent on a phone speaker
- **Where:** 38.15–42.24 (删掉正中间：主旋律不见了) and recap 134.63–136.67 (去掉中间).
- **Evidence:**
  - `np.stack([sd, -sd]) * 3.0` gives L/R correlation −1.00 and mono-sum loss −75 dB.
  - On a phone speaker those 4 s plus 2 s are silence (−24.7 / −45.9 dB against the body, phone weighting).
  - On earbuds the cancel is +4.0 dB over the body. The "合回来！主音约360赫兹" return at 42.24 is then about 4 dB quieter (back+8×: −0.2 dB), so the slam lands as a drop in level.
- **Fix (FIX 3, done):** right ear = 90° phase-shifted copy, `np.imag(hilbert(sd))`, gain 1.8, in both places. It is just as hollow and wide on earbuds and flat in mono. Verified: mono-sum loss −3.0 dB; cancel −1.4 dB, then the return at +1.1 dB is a 2.5 dB lift.

### 5. The 360° rotations are a gentle sway (±4 dB), not "around your head"
- **Where:** build 74.93–81.06, 慢慢绕着你转 113.76–130.54, finale 138.71–159.15.
- **Evidence:**
  - L−R level p5/p95: ±3.7 dB in the slow turn and ±3.2 in the finale. The 50 ms ping-pong demo swings ±16.5 dB.
  - In `rotate()` the far ear is only −5 dB (`1 - 0.45*far`), the head shadow is at 1800 Hz, and 15–32 % of the dry centred mix stays in.
  - "Back" is a flat −3 dB, which earbuds cannot read as behind.
  - This is the effect the film cites for frisson (Honda 2020) at 127.6, so it has to be unmistakable.
- **Fix (FIX 6, done):**
  - Far ear `1 - 0.72*far` (−11 dB).
  - `sosL` at 1200 Hz.
  - Wet blend `0.95*amount`.
  - Behind the head, both ears blend toward the dull copy (`+0.6*back`), a pinna-style front/back cue.
  - Output gain 1.15.

  Verified ±7.6 dB (slow) and ±6.1 dB (finale). The picture uses the same `thBuild/thSlow/thEnd`, so it stays in sync.

### 6. The harmony demo tones are masked; the octave enters 2 s after it is announced
- **Where:** 87.19–106.1. 先听它的主音 87.19, 再加一个高八度—— 89.18, 如果只差一点点 103.54, 两个波总对不齐，听着发酸 105.84.
- **Evidence (lock-in at the exact frequency against the music in the same critical band):**
  - The root is −9.3 dB under its band and only +2 dB above the track's own F# line, so "a tone appears" is not heard.
  - The clash tone (385 Hz) is −11.1 dB, so the 22 Hz roughness ("发酸") is weak.
  - The octave note starts at `E['oct'][0]` = 91.28, but the subtitle and the S12 label "＋ 高八度 727 Hz" say it at 89.18.
- **Fix (FIX 8, done):**
  - `note()` gets soft harmonics (1, .45, .3, .15), so the octave/fifth "lock" and the semitone roughness show up across bands.
  - Levels: root 0.10, octave 0.07, fifth 0.08, clash 0.10 / 0.09.
  - The song is ducked 5 dB under the demo (`kd`, OB(43)−0.3 → OB(52)+BEAT).
  - The octave enters at `OCT_IN = OB(44)` (89.24).
  - Verified against the band: root −4.1, octave −3.1, fifth −3.2, clash −7.5 dB. The two clash tones are within 1.3 dB of each other, so the beating is full-depth.
  - If the earbud check still isn't plainly sour, deepen the duck for the clash bar only (`0.44 → 0.65` between OB(51) and OB(52)+BEAT).
  - **Film29 (optional, re-render 88–96 s), S12Harm:**
    - Change `w2 = r(t, oA - 0.6, oA + 0.2)` to `r(t, OB(44) - 0.1, OB(44) + 0.5)`.
    - Change `drawK(oA)` to `drawK(OB(44))`.

    The 727 wave then appears with the sound.

## MINOR

### 7. Binaural: the track's own F# is in both ears and the tones are low
- **Where:** 48.37–57.54. Subtitle 两只耳朵里，都没有它 at 54.27.
- **Evidence:**
  - Tones are −3.6 dB under their band and −8.5 dB under the full channel.
  - The track's F#4 (362.7 Hz) sits in the right ear at −45 dB, so the right ear contains a weak real ~6.6 Hz beat. The subtitle is then not strictly true.
- **Fix (FIX 4, done):** an STFT notch of 338–394 Hz on the music for the binaural window (in `gains()`), music duck 0.3 → 0.4, tones 0.09 → 0.13 at exactly 363.0 / 369.0 (the subtitle's numbers). Verified: leak −42 dB against the band; tones −3.1 dB against the band.

### 8. Bass-only is nearly silent on earbuds, treble-only is harsh, and they swing 12 dB at 29.98
- **Where:** 25.89–29.98 (只留最低的鼓声), 29.98–34.07 (只留高音), recap 130.54–134.63.
- **Evidence, against the body with earbud / phone weighting:**
  - LP220: −9.4 / −31.3 dB.
  - HP3k: +2.6 / +5.7 dB. ×2.3 also caused the true-peak overs in item 2.
- **Fix (FIX 5, done):** `lpg(220) * 1.25` (was 0.85) and `hpg(3000) * 1.6` (was 2.3), in both the scene and the recap. Verified −4.5 / +1.8 dB (earbud). A phone speaker will never play 45 Hz; the on-screen 45 Hz ring carries that bar.

### 9. Build starts in a 7–8 dB hole for two bars
- **Where:** 72.89–77.0.
- **Evidence:** −6.7 dB studio and −7.8 dB earbud against the body. That is over the owner's "no more than ~6 dB under the body for longer than a bar" rule (row 50); on a phone it is −15.5 dB.
- **Fix (FIX 7, done):** crescendo floor 0.6 → 0.78; `E['open']` filter starts at 800 Hz instead of 500. Verified −5.8 dB earbud. The song's own hush bar (bar 39) now sits under 79.02–81.06 after FIX 1. That gives the anticipation before the drop with no stop.

### 10. The age high-cut starts 2.7 s before its line, under the binaural payoff
- **Where:** 57.54. 它是你大脑自己算出来的 is still on screen; 年纪越大 comes at 60.24; S7Age comes in at 60.1.
- **Fix (FIX 9, done):** `E['age'] = (OB(30) - 0.4, OB(31) + 0.3, OB(32))`. `S7Age`/`ageFc` read `T.age`, so the curtain follows with no code change. Re-render 57–64.7 s.

### 11. The precedence explanation plays after the precedence demo has ended
- **Where:** the demo audio is 68.80–72.89, but 大脑只信先到的那只耳朵 runs 73.2–75.79. The first precedence bar also sits under 骗你的！.
- **Fix (FIX 11, done):** hold the "left late" state through bar 36 (`k2 = win(OB(35), OB(37), 0.05, 0.3)`). S9Prec already shows that state until 75.1. No Film change.

### 12. The "pump" ducks the kick itself
- **Where:** 15.68–25.89.
- **Evidence:** `y *= pump` takes the whole mix down −4.2 dB at the beat, including the kick, so the push on the speaker is softened, not emphasised.
- **Fix (FIX 10, done):** sidechain style. Split at 150 Hz, `y = low + (y - low) * pump`, depth 0.45. The kick punches and the rest breathes, in time with S3Pump's compressions.

### 13. "放回去，又低了下来" is read 1.15 s before the pitch comes down
- **Where:** the subtitle starts at 7.20; the varispeed return starts at 8.35 (S1Wave label 放回原速 at 8.45).
- **Fix:** timing only, words unchanged. In `lines_v2_arr.json`, line 3 end 7.1 → 7.8 and line 4 start 7.2 → 7.9. That leaves 1.5 s for 9 characters (the 7 cps budget needs 1.3 s), and the pitch drops 0.45 s into the line. Re-render 4.9–9.5 s.

## POLISH

14. **`beatPh` in Film29 uses a constant BEAT from OB(8).** After the sad slowdown (bars 59–61 are 0.436 s longer), beat-locked visuals run ~74 ms early. This matters for the recap ping-pong rings at 136.67–138.71. Fix: derive the phase from `T.bars`: find k with OB(k) ≤ t, then use `(t-OB(k))/((OB(k+1)-OB(k))/4/div) % 1`. Re-render 130.4–140.75.
15. **S8Gotcha `Arrow` scales 4 % on every beat (`pulse`).** That is a metronome (edit-rhythm: "nothing pulses on beats"; owner row 54). Drop `pulse`, or pulse only on the bar line.
16. **Ping-pong, gotcha and recap switches sit exactly on the beat with ~9 ms smoothing.** Start each switch 15 ms early (e.g. `win(OB(32)-0.015, …)`) so the whole kick lands in the new ear.
17. **The 18 ms precedence delay combs in mono:** −3.5 dB with notches every 56 Hz on a phone speaker for 2 bars. Acceptable as a demo; 12 ms would be gentler and still well inside the precedence window.
18. **The muxed audio stream is 163.186 s against the 163.234 s soundtrack:** the last 48 ms of the tape-stop is cut. Harmless, but pad the video by 2 frames or trim the stop to end at 163.15.

## Tonight, in order (one engineer)

1. From `music/`, run `python3 ../review/music/process_v3_proposed.py soundtrack_v4_raw.wav timing_v4.json`. This takes ~1 min and writes `bgm_conformed.wav` (29 MB) once.
2. Check that `timing_v4.json` bars equal `timing_v2.json` within 5 ms (they do: −3…−4 ms). Keep or copy `timing29.json` as you prefer; only `age` and `prec` changed.
3. Run `python3 build/live29.py music/soundtrack_v4_raw.wav` from the episode folder.
4. Optional Film edits: S12Harm octave (item 6) and the line 3/4 timing (item 13). Per owner-notes row 75, send the owner the before/after stills or clip for these picture changes before re-rendering.
5. Re-render 0–87.6 s and 130.4–140.75 s, plus 88–96 s if step 4 was done. A full re-render is better if time allows.
6. Mux the new wav as is (it is already −14 LUFS / −1.5 dBTP; **no loudnorm**), then the send version.
7. Spot-check:
   - On earbuds: 10–15, 38–45, 72–86, 103–108, 114–130.
   - On the phone speaker: 26–45.

## Masterclass techniques (to add after the fixes, in order of payoff)

1. **Reverse-reverb "suck-in" into the title, 80.55 → 81.06.**
   - After FIX 1, the song's own hush bar (true bar 39, −6 dB, bass out) sits at 79.02–81.06. That is anticipation without a stop, which fits the owner's no-stutter rule.
   - Add one beat of reversed reverb of the drop's first hit, ending exactly at `OB(40)`. In code: take `y[:, i40:i40+1.2 s]`, convolve it with a 1.2 s exponentially decaying noise IR, reverse it, fade it in over one BEAT, and mix it at about −8 dB against the body.
   - The music then visibly inhales into the particle slam; this is the anticipation-then-release that Salimpoor 2011 measured as the dopamine peak.
2. **Binaural A/B proof at 54.27 (两只耳朵里，都没有它).** Mute the right tone (369) for two beats from `OB(27)`, then bring it back. The wobble stops and returns, which proves it lives in the head. S6Bin already shows 只有 363 / 只有 369 at 54.3, so no picture change is needed.
3. **"Everything returns" in the final chorus, bar 72 (146.89) → bar 73 (148.93).**
   - Measured: the song's last section is the brightest since the drop (+5 dB above 4 kHz against bars 56–71).
   - Layer the octave and fifth from the harmony demo (F#–C#–F#, `note()` at −12 dB, 1-bar attack) under 每秒几十到上万次的振动 / 正在你耳朵里，排成一首歌. Open the `wide` effect to 0.5 and let `rot_end` settle to the front at bar 73.
   - In Film29 S15Fin, start the "line up into one wave" (`m = sm(lin(t, 148.6, 150.3))`) at `OB(73)` = 148.93.
   - A familiar voice re-entering, plus harmonic resolution plus spectral expansion, is the strongest frisson trigger available here, and it lands on the film's thesis line.
4. **Sidechain breathing (FIX 10) as a feature in the pump scene, 15.68–25.89.** The rest of the track ducks under each kick exactly when S3Pump's compression wave leaves the cone, so the viewer hears "the air being pushed" in the music itself.
5. **Front/back cue in the rotations (FIX 6).** A darker top when the source is behind the head is the cheapest stand-in for HRTF pinna cues. It turns the slow 360° under 慢慢绕着你转，最易起鸡皮疙瘩 (127.6) from a left-right sway into an actual orbit on earbuds.
