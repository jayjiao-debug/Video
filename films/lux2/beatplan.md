# lux2 beat plan (bgm.mp3, 0–122.43 s)

Machine data: `beats.json` (same folder). This file is the edit guide.

## Grid

- Tempo **118.518 BPM** (constant, programmed). Beat 0.50625 s, bar 2.0250 s, 4-bar phrase 8.100 s.
- `t(beat k) = 0.4058 + k × 0.50625`. Downbeats at k % 4 = 0, phrases at k % 16 = 0. Real onsets sit within about 1 ms of this grid.
- **Correction to the earlier numbers:** the old grid (0.334 + n·2.035) was too slow and drifts by up to 0.25 s. Use these times: first sound **0.402** (not 0.334), title hit **8.505** (not 8.473), break **49.008** (not 49.17), build hit **65.206** (not 65.45). The drop at **81.404** is confirmed.
- Film end 122.43 falls 18 ms after beat 241 (122.412), one beat into the last phrase. Put the final cut at 121.904 or hold the end card from it.

Verification (RMS in 40 ms windows / 1 ms envelope):
- 8.505: 8.44 window −17.7 dB, then 8.48 −9.8, 8.52 −5.6; high-band attack at 8.503.
- 49.008: not a hit. A high-band tick at 49.006, then level falls −10.5 → −16 dB over 49.04–49.20 (a drop-out).
- 65.206: −34.4 dB (65.14) → −3.9 (65.22); attack at 65.204. This is the largest jump in the film (+30 dB).
- 81.404: −22.8 dB (81.34 window) → −9.2 (81.38) → −4.0 (81.46); attack at 81.402–81.405.

## Sections

| section | start – end | bars | level | character |
|---|---|---|---|---|
| intro | 0.402 – 8.505 | 0–3 | −11.4 dB | punchy kick/snare pattern, no hats, many syncopated hits |
| intro_b | 8.505 – 16.603 | 4–7 | −14.0 dB | lull after the title hit, thinner |
| verse | 16.603 – 49.008 | 8–23 | −9.9 dB | full groove, hats on 8ths, fills in bars 15 and 23 |
| break | 49.008 – 63.180 | 24–30 | −16.7 dB | quiet, one soft kick+snare per bar downbeat |
| riser | 63.180 – 65.206 | 31 | −14.8 dB | bass out, rising stabs |
| build | 65.206 – 79.384 | 32–38 | −11.4 dB | intro pattern returns, the most transient section |
| pre-drop gap | 79.384 – 81.404 | 39 | −17.9 dB | suck-out bar |
| drop | 81.404 – 113.806 | 40–55 | −9.8 dB | full groove (verse layout), fills in bars 47 and 55 |
| peak | 113.806 – 122.43 | 56–60 | −9.3 dB | loudest; continues in the track to 146.2 (outro 146.2–164.5 is not in the film) |

## The 25 moments (tiered)

Strength is the acoustic accent score from 0 to 1 (attack + contrast + loudness). The tier also weighs where the moment sits in the structure. Use **A** for big slams, flashes and scene changes. Use **B** for clean cuts or a new shot. Use **C** for small accents only: a prop tick, a subtitle pop or a light flicker. Never use C for a camera slam.

| # | time (s) | str | tier | what it is | suits |
|---|---|---|---|---|---|
| 1 | **0.402** | 0.95 | A | first sound out of silence | cold-open cut from black, first image lands |
| 2 | 4.457 | 0.90 | B | intro half-phrase downbeat (bar 2) | cut inside the cold open |
| 3 | **8.505** | 0.81 | A | title hit (phrase 1) | **gold title card slam** |
| 4 | 9.265 | 0.87 | C | off-beat low hit just after the title | small push or settle on the title, not a cut |
| 5 | **16.603** | 1.00 | A | verse entry, strongest onset in the film | big slam into scene 1 / story start |
| 6 | 24.707 | 0.71 | B | phrase 3 | cut |
| 7 | **32.806** | 0.77 | A | lands after the bar-15 snare fill (30.78–32.55) | slam / new scene; let the fill ride up to it |
| 8 | 37.616 | 0.79 | C | off-beat kick (beat 73.5) | small accent: number tick, object knock |
| 9 | 40.907 | 0.60 | B | phrase 5 (a soft pickup comes 30 ms earlier) | cut |
| 10 | **49.008** | 0.33 | A* | break: energy falls away, no hit | cut **to calm** (wide, dark, slow); no flash |
| 11 | 57.106 | 0.52 | B | break phrase 7, soft kick+snare | gentle cut / dissolve |
| 12 | 63.180 | 0.78 | B | riser starts, bass drops out | cut to a tension shot; start a push-in |
| 13 | 64.699 | 0.92 | C | riser stabs 64.447 / 64.699 / 64.952 | stutter of three small flickers or zooms leading to #14 |
| 14 | **65.206** | 0.94 | A | build hit, +30 dB from near-silence | big slam / flash |
| 15 | 69.257 | 0.93 | B | build half-phrase (bar 34) | hard cut |
| 16 | 73.304 | 0.82 | B | build phrase 9 | cut |
| 17 | 77.356 | 0.94 | B | last big build hit (bar 38) | strong cut; final escalation before the gap |
| 18 | 79.384 | 0.25 | B* | pre-drop gap: energy pulls out | cut to black or freeze / hold breath; no hit |
| 19 | **81.404** | 0.99 | A | **the drop** | biggest slam of the film: reveal, flash, camera hit |
| 20 | 86.215 | 0.78 | C | off-beat kick in the drop (beat 169.5) | small accent |
| 21 | 89.508 | 0.70 | B | drop phrase 11 | cut |
| 22 | **97.606** | 0.78 | A | after the bar-47 fill (95.58–97.35), second half of the drop | slam / second reveal |
| 23 | 105.707 | 0.60 | B | drop phrase 13 (soft pickup 30 ms before) | cut |
| 24 | **113.806** | 0.70 | A | peak entry after the bar-55 fill (111.53–113.55) | slam into the final act / answer |
| 25 | 121.904 | 0.68 | B | last phrase downbeat (film ends 122.43) | final cut to the end card |

\* 49.008 and 79.384 are strong structural moments but not acoustic hits. Cut on them to quiet or dark material. A flash there would hit nothing.

The A-tier slams are 9 in about 122 s, roughly one every 13 s. Do not add more. The B cuts fill the phrases between them.

## Where cuts feel natural (4-bar phrases, 8.10 s)

| phrase | time | section | note |
|---|---|---|---|
| 0 | 0.402 | intro | open |
| 1 | 8.505 | intro_b | title |
| 2 | 16.603 | verse | big entry |
| 3 | 24.707 | verse | |
| 4 | 32.806 | verse | after fill |
| 5 | 40.907 | verse | |
| 6 | 49.008 | break | drop-out |
| 7 | 57.106 | break | |
| 8 | 65.206 | build | big entry |
| 9 | 73.304 | build | |
| 10 | 81.404 | drop | biggest entry |
| 11 | 89.508 | drop | |
| 12 | 97.606 | drop | after fill |
| 13 | 105.707 | drop | |
| 14 | 113.806 | peak | after fill |
| 15 | 121.904 | peak | last; film ends 122.43 |

Half-phrase (2-bar) points are fine for a secondary cut inside a long scene: 4.457, 12.556, 20.657, 28.758, 36.857, 44.957, 53.057, 61.157, 69.257, 77.356, 85.457, 93.556, 101.657, 109.757, 117.857.

## Notes for the edit

- **Fills lead into slams.** Snare rolls run in the bar before 32.806, 49.008, 97.606 and 113.806 (fill times are in `snares`). Let motion build through the fill and land the slam on the downbeat, not on the fill hits.
- **Intro and build are the "busy" sections.** They have syncopated hits at 1.165, 2.938, 3.950, 5.975, 6.987 (and the same pattern repeating at +64.80 s in the build). Use one or two for small prop accents. Hitting all of them makes the edit look mechanical.
- **Verse and drop** keep a steady pulse with few standout hits. Cut on phrase or half-phrase downbeats. Continuous actions should keep their own clock (edit-rhythm skill).
- **Kicks** are cleanly separable only in the intro, build, break and riser. In the verse, drop and peak the low end is a sustained, ducked bass, so use `beats` for pulse there. `snares` includes the fill rolls.
