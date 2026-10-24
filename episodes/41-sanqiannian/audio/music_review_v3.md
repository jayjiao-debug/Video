# ep41 v3 soundtrack review (`ep41_v3_mix.wav`, 188.06 s), music pass, 2026-10-24

All numbers below are measured. I rebuilt the stems (music bed after ducking, VO bus) with the exact `build_v3.py`
logic. The rebuild matches the delivered wav to −129 dB residual, and the builder's final scalar is −2.03 dB.
Plots: `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/m41/`
(`overview.png` loudness, brightness and duck envelope; `joins.png` both splices; `crash_climax.png` 142.5–158.5;
`scott_spec.png`; `vo_ends.png`).

## Verdict

The mix is clean but ships too quiet, and its energy shape is upside down. The voice is intelligible everywhere except the Scott recording.

- **Loudness.** It is −17.5 LUFS at −0.96 dBTP. The builder's peak cap stopped it 3 dB short of its own −14.5 target, and the true peak breaks the ≤ −1 dBTP limit.
- **Music shape.** The music's big moments (the title drop and the climax's free bar) are the quietest stretches of the film, about 3 LU under the narrated passages around them.
- **Ducking.** The duck pumps (+2–3 dB swells) in 29 sentence gaps.
- **First splice.** The splice at 54.84 puts the groove 215 ms off the bar grid.
- **Climax drop.** The real drop is at **154.755**, not 154.095.
- **Scott 1860.** The recording is effectively inaudible on a phone.

Everything below is fixable inside `build_v3.py` and `lines_v3.json`, without touching the song's content.

## Answers to the 7 questions

1. **Loudness.** Integrated −17.54 LUFS, true peak −0.96 dBTP, LRA 3.4 LU. All the peaks are voice plosives: 169.20 (09_fin_n1b), 147.58 (J1), 75.48 (C1), 77.27 (C2). The voice bus peaks at −0.9 dBFS while the music stem peaks at −10.2.
   - `loudnorm` without a limiter in front falls back to **dynamic** mode (I measured `normalization_type: dynamic`), which rides the gain over the whole film. Don't use it that way.
   - I tested `aresample=192000,volume=3.6dB,alimiter=limit=0.79:attack=3:release=60:level=false,aresample=48000`. It gives **−13.9 LUFS, −2.0 dBTP, LRA 3.5**. Gain reduction is > 1 dB in only 3.8 % of 50 ms blocks and > 3 dB in 0.6 %.
   - **Recommendation:** do it after the mix fixes below, and re-measure. Run the true-peak limiter first, then two-pass `loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_*=…` (the second pass stays linear). Target −14 LUFS and −1.5 dBTP; that leaves room for the AAC encode.
2. **Voice vs music, per line.** The table shows how loud the voice is against the music while the voice is speaking (gated, K-weighted LU), plus the voice-over-music margin in the 1–4 kHz speech band:

   | Section | Voice minus music (gated) | Speech-band margin | Note |
   |---|---|---|---|
   | Full sections, 19–143 s | +4.5…+7 LU | +4.8…+14 dB | Lowest: M3 63.30 (4.8 dB), B2 101.60 (4.9), K2 116.0 (5.9), M1 55.3 (6.0). Intelligible. |
   | ARPANET "Yes" answers, 140.5 / 142.8 | +3.8 / +3.3 | +13 / +14 dB | Fine; the phone band-pass keeps them clear. |
   | Voice far above a quiet bed | +8.5…+11 | | H1/H2 0.35–9 (+9.0/+8.6), K1 110.75 (+8.5), J1/J2 146–153.6 (+9.5/+9.6), **O1b 173.3 (+11.0)**, greet 178.4 (+9.8), O3 184.0 (+9.2). The duck pulls an already quiet pad down another 3 dB, so the music disappears. |
   | **Music masks the voice** | | | **Only CQ_cut, Scott 80.80–85.55: −10.4 dB** (see 3). |

   Voice clips cover 70.6 % of the runtime. The owner's reference film has voice/subtitles on 55–64 %, so this film leaves the music fewer windows to be heard in.
3. **Scott 1860 (80.80–85.55).** It was normalised to −15 LUFS like the narration. The loudness all comes from 50–300 Hz, and its pitch (pyin) sits at 139–149 Hz. Per band, against the music under it:

   | Band | Scott vs music |
   |---|---|
   | 50–150 Hz | **+6.8 dB** |
   | 300–600 Hz | **−9.4 dB** |
   | 600–1200 Hz | −11.2 dB |
   | 1.2–2.5 kHz | −8.5 dB |
   | 2.5–5 kHz | −10.3 dB |

   A phone speaker plays almost nothing below about 200 Hz, so the singing vanishes. You hear music plus a faint hiss. The clip also starts on a −30 dBFS sample, which makes an edge click.
   - **Fix (MAJOR #4).** Low-shelf −6 dB at 180 Hz, +5 dB peak at 900 Hz (Q 1), +3 dB at 2.2 kHz. Set its gain by its 300–3400 Hz band level, matched to narration C2 minus 2 dB, instead of by LUFS (about +10 dB in that band; follow with a limiter).
   - Dip the music −9 dB from 80.6 to 85.6, with a 0.25 s ramp into the clip. Bring it back over 0.4 s so it is fully back for C3 at 86.10.
4. **Silence, 144.165–145.70.** It is truly silent: the music stem sits at −93…−97 dBFS (the mp3 noise floor) from **144.11 to 145.645** (1.535 s). The song's own decay ends about 144.10 (a natural ~150 ms tail). No click at the stop or at A3_cut's onset (the clip starts at −78 dBFS). The HF burst at 145.65–145.70 (+9.8 dB) is the song's own re-entry attack, not an edit.
   - **Problem 1: no air after the line.** "Then the system crashed." speaks from 144.33 to 145.60, and the music re-enters 50 ms after "crashed".
   - **Problem 2: the re-entry pumps.** The music comes back at −3 dB because A3_cut is still flagged as speaking until 145.70. It swells +2.9 dB over 145.70–146.05, then ducks again for J1 at 146.2. That pump sits on the most exposed moment of the film.
   - The brief's landmarks are 40–55 ms late (see POLISH #15).
5. **Climax vs the quote.** The quote is **not buried**: JQ sits +6.2 LU over the music (gated) with a +6.5 dB speech-band margin. But nothing hits at 154.095. That is the end of the filtered section.
   - The real drop, where kick and bass enter at 30–120 Hz and the low band jumps +25 dB, is at **154.755**. The voice starts at 154.19, so the drop lands about 0.56 s into the first words.
   - The drop happens while the music is ducked −3 dB.
   - The duck also released (+2.9 dB) at 153.56–154.0 and pulled down again just before the drop. That is the opposite of a "pause before the hit".
   - See MAJOR #6.
6. **The splices.**
   - **54.835–54.875** (the actual crossfade; the brief says 54.875): no click or dip, because it sits inside the song's own 0.45 s stop. But the incoming groove is **215 ms late against the bar grid**. To measure it I correlated the onset envelope 3–6 bars back across the join. The best match is at +0.215 s (r = 0.79), against r = −0.14 at 0; inside a single section the same test gives δ = 0.000 ± 0.002 s (r 0.83–0.98). The cut also enters mid-note: source 91.41 is a sustained chord at −19 dB, and its real re-entry hit is at source **91.70**. Audible as a stumbled re-entry after the stop. MAJOR #3.
   - **172.855–172.895** (the brief says 172.935): it lands on a bar line, exactly 7.99 bars after the 154.755 drop, and on the eighth grid (predicted 172.866). But the level falls 8–10 dB in 40 ms and everything above 3 kHz (cymbals, tails) stops dead (`joins.png`, right column). The duck had just released (+3 dB over 172.16–172.855), which makes the step bigger. Audible as a hard edit. MINOR #8.
7. **Ducking pumping.** Yes. There are 29 release-and-re-duck cycles of +2.1…+3.0 dB in gaps of 0.19–1.44 s. The duck's attack time constant is 42 ms and its release is 175 ms. Examples: 22.52–23.0, 24.90–25.40, 45.08–45.50, 115.56–116.0, 128.36–128.75, 132.03–132.25, **139.15–144.25 (4 pumps in 4 s across the "Did you get the L/O" exchange)**, 145.70–146.20, 150.24–150.60, 153.56–154.10. The owner's reference ducks only about 1.4 dB. MAJOR #2.

## Ranked fixes

### MAJOR

**1. The energy curve is inverted, so the music's big moments are the quietest parts of the film.**
- *Evidence* (integrated LUFS of the mix):
  - Title, music only, 9.3–19.3: **−20.3**, against −17.3 for the hook and −17.6 for 商.
  - Climax free bar, 158.95–161.15: **−20.0**, against −16.6 for JQ and −16.8 for the 1977 line.
  - The climax (raw −16.7 LUFS) is no louder than the body (−16.5…−16.9), and the duck holds it −3 dB under narration for about 15.2 of its 18.1 s. Its spectral centroid is lower than the verses' (`overview.png`, middle panel).
- *Fix in `build_v3.py`:*
  - Raise the bed: `bgm *= 10 ** ((VO_L - 2 - L_b) / 20)` (was `VO_L - 4`).
  - Add a gain-automation list multiplied into `env`, with 150 ms raised-cosine ramps placed on downbeats:
    `LIFT = [(9.05, 19.2, +1.5), (154.54, 172.6, +1.5)]`. These times assume fix #3; without it, use 154.755–172.855.
  - Through the climax, apply no broadband duck at all, only the spectral duck from fix #2.
- *Acceptance:* short-term loudness in the music-only windows is within ±1 LU of the narrated windows next to them. The climax is the loudest music in the film. Nothing after it is louder (owner: endings fall apart).

**2. Replace the pumping broadband duck with a bridged, shallow, spectral duck.**
- *Evidence:* 29 swings, listed in answer 7 above; `overview.png`, bottom panel.
- *Fix:* replace the per-sample `for i in range(n)` loop:
  ```python
  from scipy.ndimage import binary_closing, uniform_filter1d
  from scipy.signal import butter, sosfiltfilt
  sp = binary_closing(speaking > 0, structure=np.ones(int(1.2 * SR)))           # no release in gaps < 1.2 s
  depth = np.full(n, 10 ** (-2 / 20))                                            # 2 dB broadband (was 3)
  for a, b in QUIET: depth[int(a*SR):int(b*SR)] = 1.0                            # no duck on quiet beds / climax
  tgt = np.where(sp, depth, 1.0)
  env = uniform_filter1d(uniform_filter1d(tgt, int(0.25 * SR)), int(0.25 * SR)) # zero-phase: starts ~250 ms early, no pump
  mid_t = np.where(sp, 10 ** (-3 / 20), 1.0)
  env_mid = uniform_filter1d(uniform_filter1d(mid_t, int(0.25 * SR)), int(0.25 * SR))
  mid = sosfiltfilt(butter(2, [900, 4500], btype='band', fs=SR, output='sos'), bgm, axis=0)
  bgm = bgm * env[:, None] - mid * (env[:, None] * (1 - env_mid[:, None]))     # carve the speech band only
  ```
  - `QUIET` (post-fix-#3 times) = `[(0, 9.0), (145.43, 154.4), (154.54, 172.6), (172.6, 188)]`. The intro, filtered section and outro get no broadband duck. The climax gets only the band carve.
- *Predicted result:* the music body is 3 dB louder under speech. The speech-band margin is unchanged (+2 bed, +1 shallower duck, −3 band carve), so the worst lines (M3, B2) keep about 4.8 dB. Voice minus music (K-weighted) drops from about +6 to about +4 LU, closer to the owner's reference.

**3. Splice 1 is 215 ms off the bar grid and enters mid-note.**
- *Fix:* `SPANS = [(0.0, 54.905), (91.695, 209.47), (238.0, 253.2)]`, with a **10 ms** crossfade for join 1. `xf` becomes per-join: `XF = [0.010, 0.040]`.
  - The song's own re-entry hit (source 54.91) is replaced by the matching hit at source 91.70, landing at film 54.90. The grid continues and the attack stays whole.
- *Consequences:*
  - Every music event after 54.9 moves **−0.215 s**: silence 143.895–145.43, drop **154.54**, splice 2 at **172.64** (still exactly 8 bars after the drop).
  - The film becomes 187.84 s.
  - Shift every `at` > 54.9 in `lines_v3.json` by −0.215 s, plus the extra moves in #6 and MINOR #9.
- *Verify:* re-run the cross-correlation across the join. Pass: δ = 0 ± 10 ms.

**4. The Scott 1860 recording is masked (speech-band margin −10.4 dB).**
- *Fix:* the EQ, band-matched gain and −9 dB music dip described in answer 3.
- *Implementation:* give CQ_cut its own fx key, e.g. `"fx": "SCOTT"` with `SCOTT = 'lowshelf=f=180:g=-6,equalizer=f=900:t=q:w=1:g=5,equalizer=f=2200:t=q:w=1:g=3,afade=t=in:d=0.015'`. In the LINES loop, measure loudness on `highpass=300,lowpass=3400` copies instead of the raw clip. Add the dip `(80.6, 85.6, -9)` to `LIFT`, with a 0.25 s ramp in and 0.4 s out.
- *Acceptance:* speech-band margin ≥ +3 dB on CQ_cut. Check it on a phone speaker.

**5. The delivery loudness misses the spec.**
- *Evidence:* −17.5 LUFS, −0.96 dBTP.
- *Fix:* replace the last scalar line of `build_v3.py` with a 4× oversampled limiter at −2 dBFS followed by linear loudnorm to −14 LUFS / −1.5 dBTP (answer 1). Without a limiter, loudnorm goes dynamic.

**6. The climax hit is at 154.755 (154.54 after fix #3), not 154.095.**
- *Evidence:* `crash_climax.png`. The 30–120 Hz band rises +25 dB at 154.755, and the kick pattern starts there.
- *Fix, in the post-#3 timeline:*
  - Move JQ_cut to `at = 155.02` so the voice starts at 155.11, one beat (0.566 s) after the drop. The drop is heard in the clear and the quote rides the climax.
  - Leave J2 ending at 153.35 (post-shift). Treat 153.35–154.54 as a pre-drop window: broadband −5 dB on the bed with a 1-beat ramp, released to 0 dB *on* the drop.
  - **Tell the animator: the picture's climax hit belongs at the drop frame (154.54 post-shift / 154.755 now), not 154.095.**

### MINOR

**7. Clicks and truncation at voice-clip edges.**
- *End-of-file spikes* (TTS end artefact; `vo_ends.png` shows a sharp spike in the last ~1 ms). Size of the final-sample step: B1 94.02 (−14.3 dBFS), K1 115.56 (−16.7), **K3 128.36 (−12.3)**, 09_fin_n1b 172.16 (−18.9).
- *Ends that stop mid-sound:* M1 58.26 (−24.6), C2 79.96 (−25.0), C3 88.34 (−22.0), K2 119.52 (−20.6), A2_cut 139.15 (−20.6), BQb 99.12 (−28.2). M1 and C3 still have voiced sound in the final 300 ms, so the last syllable may be clipped; check by ear and re-export with 150 ms of tail if it is.
- *Abrupt starts:* S1 19.40 (−18 dBFS in the first 3 ms), C2 77.00, CQ_cut 80.80, M3 63.30, JQ_cut 154.10.
- *Fix:* in the LINES loop after `load()`, trim spikes with `c = c[:-144]`, then fade the edges:
  `c[:240] *= np.linspace(0, 1, 240)[:, None]; c[-720:] *= np.linspace(1, 0, 720)[:, None]` (5 ms in, 15 ms out).

**8. Splice 2 (172.855, or 172.64 after #3) is a hard cut.**
- *Evidence:* −8…−10 dB in 40 ms, and everything above 3 kHz stops instantly. It is on a bar line, so it can stay a cut if the picture cuts there.
- *Fix:* keep the climax's tail ringing.
  1. Take the last 0.3 s of span 2 (source 209.17–209.47).
  2. Convolve it with a 2.5 s exponentially decaying noise impulse response.
  3. Mix it in at −12 dB from the splice onward. It decays under the outro pad.
  4. Hold the duck through 172.16–173.3 (the bridging in #2 already does this), so the music doesn't swell just before the drop-off.

**9. The crash line has no air after it, and the re-entry pumps.**
- *Fix:* `A3_cut at = 143.935` (post-shift; = 144.15 without #3). Its voice then sits 0.12 s after the music stops and finishes 0.145 s before the re-entry. The bridged duck from #2 keeps the re-entry steady.
- Picture: the freeze or glitch belongs at the music's real stop, 144.11 (143.895 post-shift).

**10. The voice sits too high over quiet beds** (+8.5…+11 LU: hook, Marconi K1, Beijing J1/J2, outro).
- Fixed by the `QUIET` list in #2 (no broadband duck there) together with the +2 dB bed. Expect about +6…+8 LU, still voice-forward, as the ending note asks.

**11. The voice bus is boomy.**
- *Evidence:* the voice bus's 60–120 Hz band is only 4.8 dB under its 120–250 Hz band (much of it from the Scott clip and the male narrators). This adds mud under the song's bass.
- *Fix:* put `highpass=f=90` at the front of `dyn` (Scott is handled by its own shelf).

**12. Voice covers 70.6 % of the runtime**, against the reference's 55–64 %. This is not a mix fix. If the editor trims lines, give the freed time to the bars right after the drop and after the title.

### POLISH

**13. ECHO** (`aecho=0.7:0.5:60:0.25`, used at 23.0 and 45.5) is a single 60 ms slap, which sounds like a flam or comb filter on the voice. Use a short multi-tap instead: `aecho=0.8:0.6:37|61|89:0.30|0.22|0.15`.

**14. The music source is a 67 kbps mono MP3** with a brick-wall cut at 16 kHz (−59 dB at 16 kHz). The whole mix is mono (L/R correlation 1.00). If the owner has a better file, ask for it. Do not fake stereo on the song.

**15. Correct the brief's landmarks.** The brief ignores the crossfade overlaps: film time is source − 36.575 for span 2 and source − 65.145 for span 3, not −36.535 / −65.065.
- Corrected (current build): silence **144.11–145.645**, drop **154.755**, outro splice **172.855**.
- The title's low end enters at **9.05** (+17 dB in 50 ms; the brief says 9.30). Confirm on the waveform which frame the title slams on.

**16. The ending.** Span 3 stops at source 253.2 and then fades over 1.6 s; the song itself runs to 254.12. If the song's last note decays naturally, let it end on its own and shorten the fade to 0.5 s. That follows the owner's "endings fall apart" note.

## Masterclass techniques

1. **Spectral ducking (dynamic EQ) instead of level ducking, whole film.** Carve 900–4500 Hz −3 dB only while someone speaks and leave the bass and drums alone. The music feels louder and fuller (the owner's "a tad louder", and the reference's ~1.4 dB duck), while the consonants keep the same margin. This is the broadcast-standard way to keep score up under dialogue.
2. **Air before the hit (153.35–154.54, post-shift).** Dip the bed −5 dB for the two beats before the drop, release it on the drop frame, and start the quote one beat later. It is the owner's own "pause before the hit" rule: the email that was stuck for six days finally breaks through, and the music has to break through first.
3. **The score steps back for the archive (Scott, 80.6–85.6).** Pull the song −9 dB under the 1860 recording and bring it back with C3 at 86.1. For five seconds the oldest recorded voice in history is alone; the line "nobody heard it for 148 years" only lands if the viewer actually leans in and hears it.
4. **Reverb bloom on the climax-to-outro cut (172.64, post-shift).** The climax's last beat rings out for about 2.5 s under the quiet pad instead of being chopped. It mirrors the picture: the call that ended in an engagement echoes out toward the Golden Record. It also follows the owner's "endings fall apart and fade slowly".
5. **The only stereo moment: the Golden Record greeting (178.4).** The film is otherwise fully mono. Keep the dry voice centred (mono-safe) and send the SPACE echoes ping-pong, 180 ms left and 340 ms right, with high-frequency damping (`lowpass=f=5000` on the wet path). On earbuds the greeting opens out into space at the exact moment the voice leaves Earth.
6. **Silence locked to the picture (143.895 post-shift).** Freeze or crash the ARPANET screen on the frame where the music's decay ends, not on the brief's 144.165. Then the line "Then the system crashed." becomes the only sound in the world for 1.4 s, and the music's return becomes the cut to Beijing 1987.
