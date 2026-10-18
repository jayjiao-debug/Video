# Music review: ep29 《为什么好听？》 soundtrack v5

**What was measured.** `process_v4.py` was re-run at 10:19, after `sv5.wav` was rendered at 10:16. The current output is `music/soundtrack_v5_raw.wav` (170.95 s), which matches `timing_v5.json` (`end` = 170.9467). I regenerated it in the scratchpad and the result is bit-identical. It is also sample-identical to `sv5.wav` up to 165.85 s; only the tail is longer.

- All numbers below are from that file unless marked otherwise.
- Plots are in `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/r5/`.
- I tested the proposed fixes in scratch copies of the generator: `r5/proc_fix6.py` renders to `r5/fix6.wav`. No project file was changed.

## Verdict

**Not ready. One structural bug and two impact problems.**

1. **The remix's bar grid is off by 3 eighths.** `RD = 77.23` is not the remix drop. The drop kick is at **76.579 s** in the source, both in `remix.mp3` and in the tuned stems. Because of this:
   - the real drop lands at **140.79 s**, 0.65 s before the picture's `rdrop` (141.44);
   - the reverse-reverb inhale swells *through* the drop;
   - every recap cut and recap label sits on eighth 3 instead of the downbeat.
2. **The title drop (84.22) no longer hits.**
   - On a phone speaker the music gets quieter at the title (200 ms phone-weighted loudness −14 → −20).
   - Full-band, the jump is only +0.3 dB.
3. **The outro opens with a high-frequency lift:** +7 dB above 5 kHz on the first bar after the splice. The owner asked for no such "return".

Everything else the owner asked for is met and measurable: binaural, dyads, the smooth 1:20, the reverb bloom, the opening weld on a true downbeat, and the splice phase. Loudness and true peak are clean.

## Owner's requests: status

| # | Request | Result (measured) |
|---|---|---|
| 1 | 若如初见 opening, vocal circling the head, seamless weld at ~3.58 | **Partly met.**<br>• Rotation reads in the vocal-dominated bins: ILD swings −14 … +13 dB and tracks the model `−12·sin θ`. The back is 5.4 dB darker above 2.5 kHz.<br>• But the vocal sits **−5.4 dB under the instrumental in 300 Hz–4 kHz** (−13.6 dB broadband), so the circling voice does not lead.<br>• The weld is on a true remix downbeat: remix kick 3.579, `Pd` 3.577, song kick 3.582. No click.<br>• M400 −18.8 → −11.0 (a deliberate 0.3 s suck, then the hit).<br>• The tempo jumps 138 → 117.45 bpm at the weld (MINOR 6). |
| 2 | Dying outro, no HF "return" | **Not met.**<br>• It dies smoothly at about 3 dB per remix bar, down to −85 dBFS at the end. No truncation.<br>• But the first outro bar is **+7 dB brighter above 5 kHz** than the last recap bar (centroid 342 → 1124 Hz).<br>• It does not "break apart": kick and hats stay intact until −35 LUFS. It is the remix's mastered fade. |
| 3 | 和声/混响 in the centre cancel (`verb`, 43.36–45.40) | **Met.**<br>• +0.8 LU over the cancel bar; >5 kHz share −4.1 → −2.8 dB; ILD now moves ±3 dB.<br>• The slam at 45.40 cuts it on the downbeat (+10 dB).<br>• The bloom reads more as hiss than as harmony (POLISH). |
| 4 | Binaural 363/369 with no single-ear beating | **Met.**<br>• Envelope modulation at 6 Hz, in 340–395 Hz: L 0.0 %, R 0.0 %; mono sum 65.8 %.<br>• The song is 46–52 dB under each tone inside 300–430 Hz.<br>• The other ear's tone leaks at less than −100 dB. |
| 5 | Smoother 1:20–1:21 | **Met, with a cost.**<br>• The loudness rises monotonically from 82.2 to 84.0 s (−17.0 → −11.0, 200 ms windows). No dip or gap; v4 had −20.5 at 83.8.<br>• The cost is the title impact (MAJOR 2). |
| 6 | Ratio demo: struck dyads, no constant buzz | **Met.**<br>• Each strike is +8 … +16 dB over the ducked song in its own ⅓-octave band (minimum +1 dB for the root).<br>• The clash's 21.6 Hz roughness is 28 dB above the background modulation (root-only bar: 6.8 dB).<br>• Strikes come every 2 beats with τ 1.1 s, so the pad pulses by 8–10 dB and never goes quiet (POLISH). |
| 7 | Longer sad section → breakdown → `rdrop` → recap → splice into outro | **Structure met, timing broken.**<br>• Slowdown holds 123.05 → 134.48.<br>• The breakdown is welded mid-bar, the drop is 0.65 s early, and the recap is on eighth 3 (MAJOR 1).<br>• The splice itself is clean: kicks stay on the eighth grid within ±6 ms across 153.61, M400 −12.6 / −12.5, chroma cosine 0.97. |

## Mix numbers

- **Loudness:** −14.2 LUFS integrated (ffmpeg and pyloudnorm agree); LRA 6.9 LU. True peak −2.10 dBTP (4× oversampled); ffmpeg reads −2.0. Sample peak −2.11.
- **Tuning:**
  - Song: −35 cents.
  - Remix stems: −42 / −43 cents (7 cents apart, inaudible).
  - Sines at ROOT 362.8 Hz: −34 cents.
  - The slowed sad section is exactly −2 semitones at the same tuning.
  - Chroma cosine across the welds: open 0.90, W 0.97, splice 0.97. D, F# and C# are shared at W.
- **Limiter gain reduction:**

  | Section | Max GR | Time > 1 dB | Crest factor |
  |---|---|---|---|
  | Title drop | 3.9 dB | 36 % | 12.9 → 10.2 dB |
  | Recap high-pass bar (144.9–146.65) | 4.1 dB | — | — |
  | Recap rotation | 2.7 dB | — | — |
  | Everything else | ≤ 2.3 dB | — | — |

- **Mono fold:**
  - Median −0.8 dB.
  - Worst points: −5.1 dB at 36.0 (high-pass demo), −4.3 at 74.9 (precedence, by design), −4.0 at 85.3 (`wide` on the drop).
  - Cancel and recap-cancel are −3.0 dB (the Hilbert trick works).
- **No clicks:**
  - Every high second-difference outlier is the song's own hats; they are present at the song stage with the same d2.
  - Welds and splice: no discontinuity above the music's own transients.
- **Phone weighting** (HPF 300 Hz, mono), relative to the whole film:

  | Section | Phone level |
  |---|---|
  | Title drop | ±0.0 |
  | "mid" (109–117) | +2.7 |
  | Remix drop bar | +2.6 |
  | rot_slow | −2.1 |
  | Sad section | −2.9 |
  | Breakdown | −5.1 |

  On a phone the title drop is **not** the biggest moment, and 117–141 s is a 24 s sag.

---

## Ranked fixes

### MAJOR 1: the remix drop and bar grid are off by 3 eighths (134.48–171)

**Evidence**

- **Source kick onsets** (low band <120 Hz), remix:
  - 76.579 (huge: lows return from −45 dB after the pre-drop gap), 77.883, 78.75…
  - At 77.23 there is no kick.
  - Grid from `R0` 0.1001 + 44·RB = 76.597. The opening downbeats at 0.102 and 3.579 confirm the grid.
  - Plot: `r5/06_remix_drop_src.png`.
- **In the output:**
  - The jump is at **140.786**: M400 −19.4 → −11.8; bands +11 dB lows, +10 dB highs; 10 ms envelope −35 → −9 dB.
  - At the timing's `rdrop` 141.436: −13.5 → −13.7, i.e. nothing.
  - Plot: `r5/03_weld_W.png`.
- **The inhale** (`rinhale`, 140.57–141.42) is a reversed reverb of mid-bar material, peaking 0.65 s after the real hit.
- **Recap kicks** fall on eighth 3 of the timing bars. So the picture's recap cuts and the labels 低音 / 高音 / 去掉中间 / 左右跳 / 绕着你转 (143.17 … 150.13) are +649…+655 ms late against the true downbeats.
- **`W` (134.48)** welds the song's downbeat to eighth 3 of remix bar 40, not to the breakdown's first downbeat.

**Fix** (`process_v4.py` lines 321 and 323):

```python
RD = 76.579                    # remix drop = kick onset after the pre-drop gap (was 77.23, 3 eighths late)
RT = 122.422 - 0.651 + RB      # same "+20 bars" splice target, moved with RD (RT2 → 123.509)
```

`desc = 126.4 - RT2` can stay; it is a remix-time point.

**Result (verified in `r5/fix6.wav`)**

- The drop lands exactly on 141.436: kick at 141.44, eighth 0; M400 −17.7 → −12.8; bands +9.7 dB lows, +6.5 dB highs.
- Recap kicks are on eighth 0 at 144.91, 146.63 and 148.39.
- The splice keeps phase: kicks within ±5 ms.
- `W` now meets the breakdown's first downbeat.
- **None of the picture keys change** (`W`, `rdrop`, `recap`, `splice`, bars 100–110 are all derived from `Wo + k·RB`).
- What changes:
  - `end` 170.95 → **171.60**; `outro_desc` → 156.50.
  - Bars 111+ now really are the remix downbeats.
  - The three outro lines (156.46, 159.06, 161.76) should re-snap to bars 112 / 113–114 / 116 = 157.08 / 158.82 / 162.30.

### MAJOR 2: the title drop (84.22) lost its hit; on a phone it gets quieter

**Evidence**

- Bands, 0.4 s before vs after OB(40):

  | Version | <150 Hz | 150 Hz–1 kHz | 1–5 kHz | >5 kHz |
  |---|---|---|---|---|
  | v4 | +12.2 | +4.6 | +6.8 | +6.0 |
  | v5 | +5.4 | −2.3 | −1.0 | **−11.8** |

  The riser (−12 dB re the mix, swept to 9 kHz and beyond) and the inhale (−8 dB, peaking 12 ms before the hit) are brighter and louder than the drop.
- **200 ms loudness, phone weighting:**
  - v5: −16, −14 | **−20**, −19 (a 5 dB *fall* on the title).
  - v4: −28, −22 | −19 (a rise).
- Full-band M400: −11.4 → −11.1.
- This conflicts with owner rows 26 and 84 ("title lands ON the hardest drop … slam").
- Plot: `r5/10_build_drop.png`.

**Fix** (all tested together in `r5/proc_fix6.py`):

1. **In `gains()`**, before the `bright` line (113), cut the bass over the last beat. It is zero-phase, so no comb. Do *not* do `y - lowpass(y)`: the Butterworth phase boosts around the cutoff.
   ```python
   if OB(40) - BEAT < tf < OB(40):
       kb = float(cosr((tf - (OB(40) - BEAT)) / (0.6 * BEAT))); g *= (1 - kb) + kb * hpg(200)
   ```
2. **Riser** (line 249): change `-12 / 20` to `-18 / 20`. After `nz *= (uu ** 2.2) / …` add:
   ```python
   nz *= np.clip((b - 0.06 - (a + np.arange(i1 - i0) / SR)) / 0.12, 0, 1)   # gone 60 ms before the hit
   ```
3. **Before** `# --- the drop: wider stereo`, add a −4.5 dB "suck" over the last ¾ beat. It is not a stop: the groove keeps playing.
   ```python
   kd_ = cosr((t - (OB(40) - BEAT * 0.75)) / (BEAT * 0.6)) * (t < OB(40) - 0.004)
   y *= (1 - 0.4 * kd_).astype(np.float32)
   ```
4. **Inhale** (lines 298–303):
   - High-pass the wet at 250 Hz: `wet = sosfilt(butter(2, 250, 'high', fs=SR, output='sos'), wet, axis=1)`.
   - Make it quieter: `-8 / 20` → `-14 / 20`.
   - Peak it 70 ms early: `int(0.012 * SR)` → `int(0.07 * SR)`.

**Result**

- Full-band 200 ms: −14, **−16 | −10** (+6 dB on the hit).
- Phone: −21 | −19 (a rise instead of a 5 dB fall).
- Lows +8.3 dB, >5 kHz −3.5 dB (was −11.8).
- Integrated −14.20 LUFS and GR 4.1 dB are both unchanged.

I also tried two other things:

- **`bright` 0.41 → 1.0:** limiter GR went to 5.7 dB and the remix level match shifted. Rejected.
- **Layering the remix's own crash:** inaudible gain. Rejected.

### MAJOR 3: a high-frequency "return" at the start of the outro (153.61–155.3), and the outro does not "break apart"

**Evidence**

- **Energy above 5 kHz per bar** around the splice (absolute dB):

  | Bar | −2 | −1 | **+0** | +1 | +2 | +3 |
  |---|---|---|---|---|---|---|
  | >5 kHz energy (dB) | 30.8 | 31.1 | **37.9** | 33.5 | 32.3 | 28.0 |

  Centroid 342 → 1124 Hz.
  - Cause: the last two recap bars are rotated mono through the 1.2 kHz head-shadow low-pass (dark). The splice then opens onto the remix's full-band fill bar.
  - After the MAJOR 1 fix, the splice enters that fill bar on its downbeat: one-bar loudness −15.9 → −10.8 LUFS, M400 +3 dB.
- **Outro per bar:**

  | | Bar 1 | Bar 2 | Bar 3 | Bar 4 | Bar 5 | Bar 6 | Bar 7 | Bar 8 |
  |---|---|---|---|---|---|---|---|---|
  | LUFS | −12.3 | −16.3 | −17.0 | −20.1 | −22.0 | −25.5 | −28.8 | −33.9 |

  - The >5 kHz share stays −13 … −15 dB and the <150 Hz share −1.6 dB throughout.
  - So it is the same groove, uniformly fading. Nothing drops out, nothing darkens.
- Plot: `r5/04_splice_outro.png`.

**Fix:** in section 4, right after `tl *= ramp(n2, 0, int(0.03 * SR))` (line 417), and before the rotation, make brightness only go down from the splice and let the elements fall away:

```python
Zt = np.stack([librosa.stft(tl[c], n_fft=4096, hop_length=1024) for c in range(2)])
ft = librosa.fft_frequencies(sr=SR, n_fft=4096); uq = np.linspace(0, 1, Zt.shape[2])
fc_lp = np.exp(np.log(3500) + (np.log(450) - np.log(3500)) * uq ** 0.8)      # top closes 3.5 kHz → 450 Hz
fc_hp = 20 + 230 * np.clip((uq - 0.45) / 0.55, 0, 1) ** 1.5                 # kick thins out over the second half
G = (1 / np.sqrt(1 + (ft[:, None] / fc_lp[None]) ** 4)) / np.sqrt(1 + (fc_hp[None] / np.maximum(ft[:, None], 1)) ** 4)
tl = np.stack([librosa.istft(Zt[c] * G, hop_length=1024, length=n2) for c in range(2)]).astype(np.float32)
```

- 3.5 kHz with a 2nd-order slope takes about 8–10 dB off >5 kHz on the first bar, which brings it under the recap's last bar.
- Also raise the last-breath reverb in steps, so the sound dissolves instead of only fading: `put(reverb(tl[:, -int(2.5 * SR):], 3.2, 139) * 0.5, …)` → take the last **6 s** at 0.7.
- Optional, if the +3 dB fill bar still feels like a lift: `RT = RS1 + 21 * RB` (splice straight into the outro's first bar 72, skipping the fill). Then check the chroma and onset match again.

### MINOR 4: the circling voice in the opening does not lead (0–3.58)

**Evidence**

- Vocal vs instrumental in 300 Hz–4 kHz: **−5.4 dB**; broadband −13.6 dB.
- The rotation is only visible in the vocal-masked ILD; the full-mix ILD swings just ±3–5 dB.
- Plots: `r5/05_vocal_rotation.png`, `r5/02_open.png`.

**Fix:**

- Line 357: `oi = RI[...] * 0.8` → `* 0.65`.
- Line 361: `ov = RV.mean(0)[:n_op] * 1.15` → `* 1.8`.

This gives about +0.3 dB vocal-over-instrumental in its band, with card loudness about the same.

### MINOR 5: phone sag at 117–141 s (rot_slow → sad → breakdown)

**Evidence**

- Phone-weighted loudness: −2.1 / −2.9 / −5.1 dB under the film average.
- The sad section is very bass-heavy (centroid 93 Hz).
- The breakdown is −19.3 LUFS for 3+ bars, about 7 dB under the body. That is owner row 50 ("sounds like the music broke").
- Breakdown front/back cue is only 2.9 dB (opening: 5.4 dB).

**Fix:**

1. Line 383: `sv.mean(0) * 1.1` → `* 1.6` (+3.3 dB). The rotating vocal fills the breakdown and the rotation reads better; the instrumental drop contrast stays.
2. In `rotate()`, `back` shading `0.6 * back` → `0.9 * back`.
3. In `gains()`, during `slow` (`OB(59)`…W), add a +2 dB presence lift at 300 Hz–3 kHz (or a −3 dB shelf below 90 Hz plus make-up gain), so the sad section reaches the average on a phone.

### MINOR 6: tempo jump at the opening weld (3.58)

**Evidence**

- 138 → 117.45 bpm, i.e. the beat goes from 0.435 to 0.511 s.
- The vocal echo throws (`echo_out(…, 3*0.4346/2 …)`, line 367) keep the remix's 0.652 s spacing over the song's first bar. They land −107 / +34 / −176 / −335 ms off the song's beats. They are quiet (≈ −26 dB under the bed), so this is a smear rather than a flam.

**Fix:**

- Echo delay `3 * 0.4346 / 2` → `1.5 * BEAT` (0.766 s, the song's dotted quarter).
- For the real "无缝" weld, see Masterclass 2.

### MINOR 7: limiter on the climax

**Evidence**

- 3.9 dB gain reduction on the title drop (36 % of the time above 1 dB; kick crest −2.7 dB).
- 4.1 dB on the recap high-pass bar (`hp_ * 1.7`).

**Fix:**

- Line 396: `* 1.7` → `* 1.3` (the song's own high-pass demo uses 1.6 with 2.1 dB GR).
- Before the limiter, add a 4× oversampled soft clip on the kick tips: `y = np.tanh(y / 0.63) * 0.63` on the upsampled signal, applied only where `pk > 0.6`. This brings the brickwall to about 1.5 dB.

### POLISH

- **Integrated −14.2 LUFS.** The limiter takes 0.2 dB after normalising. Normalise to −13.8 before limiting, or iterate once.
- **`verb` bloom is mostly hiss.** Filter the wet before mixing: HPF 250 Hz, LPF 6 kHz, 1/8-note pre-delay `0.255 s`, t60 2.6 → 3.5 s. Then the harmony blooms, not the noise.
- **Binaural on a phone speaker.** The mono sum beats acoustically (66 % at 6 Hz), so "两只耳朵里，都没有它" is only true on headphones. The headphones card covers it; keep it.
- **Dyads.**
  - The pad never decays more than 8–10 dB between strikes. If the owner still hears a drone, strike the root-alone bar (90.35–92.40) once per bar.
  - Or use `tau=0.8`: about 12 dB breathing, and the lock/sourness is still audible with the dyads struck together.
- **`wide` on the drop.** Mono fold −4.0 dB at 85.3. Use `0.8 → 0.5`, or apply the side boost only above 300 Hz.
- **Subtitles ahead of the grid** (inherited from v4): 109.00 (−250 ms, an eighth early), 57.43 (−226 ms), 76.36 (−197 ms). Snap them to the beat if they are re-timed anyway.

---

## Masterclass techniques

1. **Pre-drop suck at 84.22** (bass cut over the last beat, the riser and inhale gone 60 ms early, −4.5 dB duck). The ear empties out without stopping, so the title's kick and bass come back as the biggest thing in the film. Measured: +6 dB on the hit (it was +0.3). The groove never stops, which respects "不用那一段awkward的卡顿".
2. **Tempo-ramped weld at 1.84–3.58.** Time-stretch (pitch-preserving rubberband, `--timemap`) the remix's second bar, ramping 138 → 117.45 bpm, so its last beats already sit on the song's pulse when the song's downbeat lands at `Pd`. This is what a DJ does with two tracks at different tempos. It is the literal "无缝焊接": smooth (no meter jolt), then 爽 (the kick).
3. **Breakdown rotation that lands in front on the true drop (134.48 → 141.44).** After MAJOR 1, `thv` completes its turn exactly on the drop kick. Add a pinna notch (−6 dB around 8 kHz) while the voice is behind, on top of the darkening. Honda 2020 links slow rotation to chills; the voice arriving dead-centre *on* the drop is the anticipation → release moment the film is about (预期 → 多巴胺).
4. **A "disintegration" outro (153.6 → end)** that matches the particles dissolving into one wave. Close the top 3.5 kHz → 450 Hz, take the kick out with a rising high-pass in the second half, raise the reverb send, and widen into a diffuse cloud. Every bar loses something and nothing ever gets brighter: "breaking apart, slowly dying", with no return.
5. **Bookend voice.** The last audible event should be the same vocal syllable that circled the head at 0:00: one echo throw, low-passed at 1 kHz, a full slow turn, into the 3 s reverb. The film opens and closes on the same voice around your head, which is the film's thesis ("正在你耳朵里，排成一首歌").
6. **Harmonic bloom in the cancel (43.36).** A filtered, pre-delayed side-signal reverb (see POLISH), reverse-swelled into the slam on 45.40. The harmony swells around the head, then "合回来！" cuts it on the downbeat: a mini anticipation → release that sets up the big one at 84.22.

## Plots

All in `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/r5/`:

- `01_energy.png`: loudness (momentary and short-term, v4 overlaid) and brightness over the whole film.
- `02_open.png`: the opening weld.
- `03_weld_W.png`: the weld into the breakdown and the real drop at 140.79.
- `04_splice_outro.png`: the splice and the outro.
- `05_vocal_rotation.png`: vocal-masked ILD and the front/back cue.
- `06_remix_drop_src.png`: the true remix drop at 76.58 vs `RD` 77.23.
- `08_ratio_demo.png`: the struck dyads.
- `09_mono.png`: mono fold-down.
- `10_build_drop.png`: the build into the title drop.
- `11_cancel_verb.png`: the centre cancel and reverb bloom.

Test renders in the same folder:

- `fix6.wav` and `proc_fix6.py`: MAJOR 1 plus MAJOR 2.
- `re.wav`: a bit-identical reproduction of `soundtrack_v5_raw.wav`.
