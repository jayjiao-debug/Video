# Music review, round 2: ep29 v3 cut (`out/为什么好听_v3_高清原片.mp4`)

All numbers below were measured on the muxed cut, not taken from the script.

**Verdict:** pass. The sync problem is gone, the mix is clean, and all three masterclass moves work and are in key. Three small tweaks remain; each is a soundtrack re-run plus mux, with no picture change.

## Verified

| Check | Result |
|---|---|
| Song beat vs the film's grid (onset fold, 10 blocks of 8 bars) | 0 to +2 ms in every block (v2 drifted −250 to +246 ms) |
| Drop vs title | Audio jump at **81.055 s**; picture burst on frame 81.067. Same frame. |
| Other visual hits | On-bar hits at 27.9, 29.9, 36.1, 38.1, 62.6, 64.7, 70.9, 103.6, 130.5, 132.5 and 134.6 s. They lead the bar by 16–45 ms (one frame), which is allowed. |
| Loudness | −14.0 LUFS, LRA 5.6. Mux is linear (film vs wav −0.01 dB, p1 −0.09). |
| Energy curve | No stretch more than 6 dB under the body (−14.3). The loudest short-term moment is at 82.5 s, on the title. |
| Mono fold | Median −0.5 dB. Worst is −6.7 dB at 71.6–71.7 s (the 18 ms precedence comb, by design). The centre cancel no longer collapses. |
| Mute (54.50–55.52) | The right ear's 369 Hz tone falls about 40 dB (−27 → −66/−71 dB) on the downbeat. No click: the transient at 54.50 is in both channels, so it is the song's own downbeat. Picture motion drops in the same window (0.84 → 0.29 → 0.87), so the S6Bin wobble stops with it. Audible and on the grid. |
| Inhale (80.29–81.06) | Energy above 4 kHz rises +12 dB in the last 0.55 s (−57 → −45 dB) while the Shepard stops at 80.56. The total level dips 4.4 dB, then the drop hits. It reads as an inhale, not a stop. |
| Return (146.9–155.1) | In tune with every chord under it. Bars 72–73 are F#–F–C#; bar 74 is D–C#–F#–A; bar 75 is E–D#–B–A#. Our F#/C# are chord tones or 9th/6th/maj7 colours throughout. |
| Finale line-up | The particles move from 148.93 to about 150.5, starting on OB(73). |

## Fixes (ranked)

1. **MINOR: delivered true peak is −1.4 dBTP.** The AAC encode adds 0.1 dB on top of the wav's −1.5 dBTP, so the target of ≤ −1.5 is missed, with no margin for Douyin's re-encode.
   - Fix in `process_v3.py`, limiter line: change `10 ** (-1.6 / 20)` to `10 ** (-2.1 / 20)`.
   - Integrated loudness stays −14.0.

2. **MINOR: the inhale peaks about 0.15 s early and sags just before the hit.**
   - Measured, swell vs the rest of the mix: −2.8 / −0.8 / +2.9 dB over 80.69–80.89 s, then **−7.7 dB in the last 60 ms** (80.99–81.05).
   - Cause: the reversed reverb's final samples are the convolution's quiet start.
   - Fix, after `wet = wet[:, -L1:] * ...`:
     ```python
     env = np.convolve(np.abs(wet).sum(0), np.ones(441) / 441, 'same')
     sh = L1 - 1 - int(0.012 * SR) - int(np.argmax(env))
     wet = np.roll(wet, sh, axis=1)
     wet[:, :max(sh, 0)] = 0
     ```
     The swell then peaks 12 ms before OB(40) and runs straight into the hit.

3. **MINOR: the "return" pad is subliminal rather than a voice entering.**
   - Octave and fifth vs their critical band: −6.4 / −6.8 dB at the peak (bars 73–74), −9 to −16 dB on the ramps.
   - For the chills effect it should be noticed. Raise `note(2*ROOT, …, level=0.05)` to 0.08 and the fifth from 0.045 to 0.07. That is +4 dB, about −2.5 dB vs the band, still under the melody.
   - Optionally shorten `att=BAR` to `att=BAR*0.5`, so it arrives as the picture lines up at OB(73).

4. **POLISH: the gotcha arrow handover is smeared around the bar.** The audio switches ears in 50 ms on the bar (66.76, 68.80). The picture changes at −156/−166 ms and +211 ms, which is the old arrow leaving early and the new one easing in.
   - Fix in Film29 `S8Gotcha`: take the old arrow out over `b - 0.12 → b - 0.02` and bring the new one in over `b → b + 0.10`, so the new arrow lands with the sound. Re-render 64.5–70.5 s.

5. **Note for the producer, not music:** the subtitle at 127.61 s changed its words, from 最易起鸡皮疙瘩 to 更易起鸡皮疙瘩. The brief says the words are fixed, so confirm the owner approved this (it reads like a fact-check edit).

`music/bgm_conformed.wav` (29 MB) is the conformed song cache; keep it for re-runs. My temporary files are deleted.
