# ep57 music map (owner's BGM, sent 2026-11-03 00:25: Nato Kitch, "i will feel alive"; the audio is NOT committed)

**Owner (00:25):** use this song; it is short, so make it longer as seamlessly as possible; scene changes timed to the beat.

## The track
- 108.67 s, stereo 44.1 kHz, −10.1 LUFS.
- **143.6 BPM**: beat 0.418 s, **bar 1.672 s**. Downbeats are every 4th tracked beat starting at beat 2: **first downbeat 1.161 s** (the chord changes all fall on this phase; the kick agrees).
- Bar-level sections (similarity + energy): bars 0–3 intro · 4–15 verse (louder from bar 8) · 16–23 quieter section · 24–30 build · **bar 31 a near-silent break (−18 dB)** · bar 32 re-entry · 32–39 verse-like · **40–55 chorus (two matching 8-bar halves)** · 56–61 outro, fading out by about 104 s.

## The extension (bed_v1: 162.33 s, −13.7 LUFS, true peak −1.8 dBTP)
Two jumps, both on downbeats, chosen for the highest bar-similarity of what follows (score 0.93); each splice is a 40 ms equal-power crossfade, the destination nudged ±25 ms to match the waveform.

| Film time (bed) | Source | What plays |
|---|---|---|
| 0.00–58.24 | 0.00–58.24 | intro, verse, quiet section, build, break (53.0), re-entry (54.7) |
| 58.24–127.03 | 17.96–86.75 | verse 2 / quiet / build / break again (93.3), re-entry (95.0), chorus from 108.6 |
| 127.03–162.33 | 73.32–108.62 | the last chorus half again, **bar 48 (chorus second half) at 135.42**, outro from about 148.5, out by about 157 |

Checks: the beat grid stays at 0.418 s across both splices (beat tracking on the output); the level step at each splice equals the original's step at the same downbeats (+5.6 dB and −1.2/−2.0 dB), so the joins sound like the song's own bar changes. Loudness was normalised to the house −14 LUFS target (−13.7 integrated, −1.8 dBTP).

## Cue points for the edit (bed time)
- Downbeats: every 1.672 s; the main phrase grid is 4 bars (6.69 s).
- Title: verse start, bar 4 (about 7.85 s).
- Natural drops (break → re-entry): 53.0 → 54.7 and 93.3 → 95.0.
- Chorus start: 108.6. **The payoff 「39735公里」: bar 48 at 135.42** (chorus second half). Outro from about 148.5, so the end card sits on the outro.
- Each 咔嚓 lands on a downbeat; each stop's arrival 「XXX欢迎你」 lands on a phrase start.

## Shutter sound
Android Open Source Project `camera_click.ogg` (Apache-2.0; credit in the end-card line), layered with a short 95 Hz thunk and a 4 ms transient; a 0.48 s instant-camera eject motor follows.
