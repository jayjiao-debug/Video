# ep58 music map (owner's BGM, sent 2026-11-02 19:10; the audio is NOT committed)

**Owner decisions (2026-11-02):**
- **Don't cut or split the track.** It plays from the start, continuously.
- **Fade the last second** so the film ends at **2:59.5** (179.5 s), just before the track's own hard stop.
- **Raise the volume to −14 LUFS.** No other processing. **Not needed after all:** the −17.2 LUFS was measured on the mono file. As the stereo bed (the same mono signal on both channels), the first 180 s measure **−14.1 LUFS, true peak −2.9 dBFS**, so no gain is applied.
- The bed is built with: `atrim=start=0.5:end=180.0, afade=t=out:st=178.5:d=1.0, aresample=48000, pan=stereo|c0=c0|c1=c0`, length 179.5 s (scratchpad `ep58music/bed_v1.wav`).

## The track
- 254.1 s, mono, 44.1 kHz, about 71 kbps; −17.2 LUFS integrated, peak −2.9 dBFS.
- 0.0–0.5 s of silence at the head. **Film t = file t − 0.5** (only the silence is trimmed).
- **107.7 BPM**: beat 0.557 s, bar (4 beats) 2.229 s. Downbeats from the beat tracker at file ≈ 0.60 + 2.229·n, so film ≈ 0.10 + 2.229·n (re-check on the final mix).
- **The first part ends in a hard stop at file 180.55 (film 180.05).** It is at full level to 180.5, then silence to 182.2, when a second part starts. We use only the first part.

## Sections (film time, snapped to the nearest bar; energy from 4 s RMS)
| Film t | Section | Energy | Use |
|---|---|---|---|
| 0.0–9.1 | intro (music enters at 0.0) | rising, ~−18 dB | hook lines 1–3, frame-0 subtitle |
| 9.1–17.9 | A | full, ~−15.5 | the title can land here (by ~14 s, hold ≥ 2.5 s) |
| 17.9–36.0 | B | ~−17.5 | the found-in-1969 story or the set-up |
| **36.0** | **main section starts** | full, ~−15.5, steady for 109 s | **put the second question 「一只脚，怎么站得住？」 on this downbeat** (30–60 s rule) |
| 36.0–144.7 | main | steady | the body: balance, iron bones, gait, discovery, the name fight, the bird readings |
| **144.7–163.0** | quiet break | drops to ~−19 | 「至今没有定论」: the bird readings land softly |
| **163.0–178.5** | final build | ~−17 → −14 | the payoff (the bird is what lets it fly), the end question, the end card |
| 178.5–179.5 | **fade to silence** (owner) | | the film's last frame at 179.5 = 5,385 frames at 30 fps |

## Rules for the edit
- Film length **exactly 179.5 s** (≤ 2:59; 何尊's 181.7 s fell into Douyin's 3–5 min group).
- The end card must be fully on screen by ~173.5 so it holds ≥ 5.5 s inside the music before the fade.
- Re-run the beat tracker on the final mix and snap cuts to bars (edit-rhythm skill: continuous actions keep their own clock).
