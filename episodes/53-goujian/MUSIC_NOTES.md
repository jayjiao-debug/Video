# ep53 music contract (fixed: build the picture to this)

The bed is cut and measured. **The timeline is `lines_bars.json`** (it replaces the timing in `lines_read.json`; same text, same format `[start, end, text, N|Q]`). Every line is at least as long as before. The film is now **113.633 s = 3409 frames at 30 fps** (was 104.25). Do not move a line or a hit without asking the music specialist: the bed is cut to these numbers.

- Bed: `music/ep53_bed.wav` (48 kHz, 24-bit stereo, 113.633 s, −14.0 LUFS, true peak −2.2 dBTP, no limiter). Gitignored: never commit wav/mp3.
- Rebuild: `cd music && python3 build53.py && python3 retime53.py && python3 measure53.py`.
- Map of every bar, join, level and landmark: `music/music_map_ep53.json`. Curves: `music/ep53_bed_curves.png`.

## Grid (one grid for the whole film)
- Beat **P = 0.56605 s** (106.0 bpm), 4/4, bar = 2.2642 s.
- Downbeats **DA(k) = 0.4432 + 2.2642·k** (k = 0 … 49). Beats: **0.4432 + 0.56605·n**.
- The grid never breaks. The hush is exactly 2 bars, from DA(31) to DA(33), and has no pulse.
- Put `DA(k)`, `beatAt(n) = 0.4432 + 0.56605·n` and `frameOf(t) = Math.round(t·30)` in the master; both parts import them.
- Measured: all 50 film downbeats sit within 3.3 ms of the formula (mean 0.8 ms). The drum transients start 1.5–7.5 ms before it.
- **A hit is complete on its frame.** The plaque is opaque and at scale 1.0, the bloom is lit, the seal touches: all on `frameOf(beat)`, with no ease that lands 2–4 frames later. That was ep51's title and seal note.

## Landmarks (film s · frame)
| What | Time | Frame | Music | Picture |
|---|---|---|---|---|
| First downbeat | 0.443 | f13 | bar 20 kick (frame 0 starts inside the bar before: music already moving) | rust blooms on the knife |
| **TITLE** | **9.500 → 11.764** | f285 | bar-24 re-entry after a 1-beat deep break (8.93–9.50: bass and kick drop out) | 「越王勾践剑 / 真的没锈吗？」 slams onto the case glass. Contact on f285. Use the break for the wind-up. |
| Lull | 18.557 | f557 | one valley hit, then kick and hats fall away (S3 row 2) | the 「镀了铬」 sheen washes on this hit |
| **DIVE (S4)** | **20.821** | f625 | B pre starts: bright pedal, crash; off-beat kicks pull into it | the camera falls through the ring centre |
| Wind-up | 41.199 | f1236 | bar-15 fill | the hand lifts the sheath, water rinses |
| **DRAW (D6)** | **43.463** | f1304 | chorus downbeat; a reversed swell rises from 42.46 into it | the cold flash runs down the blade on f1304 |
| M1 | 61.577 | f1847 | deep break 61.01–61.58, then a valley hit (dark, no hats) | the macro zoom begins |
| **HUSH (M3)** | **70.633 → 74.412** | f2119 | drums stop; the song's own drumless piano at −4.5 dB, fading from 73.46 | camera drifts to a stop, light dims |
| Near silence | **74.412 → 75.162** | f2232 | ring + a breath in (lowest −37 LUFS-M at 74.7) | one slow breath of the lens: no event, no cut, keep moving slightly |
| **T1 (hardest drop)** | **75.162** | f2255 | the drop: the song's most sub, out of near silence (+17.9 dB contrast) | the first green rust bloom ON f2255 |
| Arrival | 84.219 | f2527 | key change lands (B♭ minor), inside T3 | the rewind lands: the sword settles in the coffin |
| R2 | 95.540 | f2866 | bar line | camera breaks the surface → museum floor |
| Lift | 97.804 | f2934 | a 2-bar lift | camera rises into the case |
| **P1 (peak)** | **102.332 → 107.993** | f3070 | the arrival chord again, +2 dB: the loudest sustained bars of the film | the final pull-back starts on f3070 |
| Air | 107.993 → 109.125 | f3240 | held on the dominant (F) | the kitchen holds |
| **END CARD** | **109.125 → 113.125** | f3274 | the fall: drums stop, F → B♭m | card + J seal contact on f3274 |
| Music silent | 113.549 | f3406 | coda faded out | 0.5 s fade to black; film ends at f3409 |

## Lines (`lines_bars.json`)
| # | Line | Start | End | Start on |
|---|---|---|---|---|
| 1 | H1 你家菜刀… | 0.000 | 5.538 | frame 0 |
| 2 | H2 主人，是卧薪尝胆… | 5.538 | 9.500 | DA(2) beat 2 |
| — | TITLE | 9.500 | 11.764 | DA(4) |
| 3 | S1 如今它在湖北省博物馆… | 11.764 | 16.293 | DA(5) |
| 4 | S3 有一种流传很广的说法… | 16.293 | 20.821 | DA(7) |
| 5 | S4 是不是真的？… | 20.821 | 24.217 | DA(9) DIVE |
| 6 | D1 1965年冬… | 24.217 | 28.746 | DA(10) b3 |
| 7 | D2 其中一座，深10.8米… | 28.746 | 33.274 | DA(12) b3 |
| 8 | D3 两千多年，从没被盗过。 | 33.274 | 36.104 | DA(14) b3 |
| 9 | D4 木椁里，套着两层棺。 | 36.104 | 38.935 | DA(15) b4 |
| 10 | D5 内棺里，墓主人左边… | 38.935 | 43.463 | DA(17) |
| 11 | D6 洗净剑鞘，拔出来… | 43.463 | 47.425 | DA(19) DRAW |
| 12 | I0 越王鸠浅，自作用剑。 | 47.425 | 51.954 | DA(20) b4 |
| 13 | I1 十几位学者… | 51.954 | 56.482 | DA(22) b4 |
| 14 | B1 1977年拍科教片… | 56.482 | 61.577 | DA(24) b4 |
| 15 | M1 不锈的原因之一… | 61.577 | 66.105 | DA(27) |
| 16 | M2 镀铬？博物馆研究了7年多… | 66.105 | 70.633 | DA(29) |
| 17 | M3 那它，到底为什么不锈？ | 70.633 | 74.412 | DA(31) HUSH |
| 18 | T1 其实，它也[锈]了。 | 75.162 | 77.992 | DA(33) DROP |
| 19 | T2 只是锈得很轻… | 77.992 | 81.954 | DA(34) b2 |
| 20 | T3 保住它的… | 81.954 | 86.483 | DA(36) |
| 21 | E1 同一座墓里的其他剑… | 86.483 | 90.445 | DA(38) |
| 22 | L1 剑鞘、两层棺… | 90.445 | 95.540 | DA(39) b4 |
| 23 | R2 出土几十年… | 95.540 | 98.936 | DA(42) |
| 24 | R3 再好的保管… | 98.936 | 102.332 | DA(43) b3 |
| 25 | P1 它不是不会锈… | 102.332 | 107.993 | DA(45) PEAK |
| 26 | END 你第一次见到它，是在哪？ | 109.125 | 113.125 | DA(48) |

Most growth is in P1 (+1.41 s, the final pull-back), M3 (+0.78 s, the hush), D5 and T3 (+0.53 s each). The title runs 2.26 s.

## Picture hits on beats (land each on its frame)
- **Hook:**
  - rust bloom 0.443;
  - the knife → bronze match completes on beat 3, 1.575 (f47);
  - [亮] pulses on DA(1) 2.707 (f81).
- **Title:** slam contact on 9.500 (f285), then it slides out with the camera. The plaque is not on screen during the break (8.93–9.50); the break is the wind-up.
- **「镀了铬」 sheen:** on the lull hit, 18.557.
- **Dive:** 20.821. The stamp 2026 → 1965 rolls on its own clock across the fall.
- **D4 lifts:** the 椁 roof, then lid 1, then lid 2, with the tag counting:
  - roof on the line start, 36.104 (f1083);
  - lid 1 on DA(16), 36.670 (f1100);
  - lid 2 on 37.803 (f1134);
  - D5's top-down settle on DA(17), 38.935 (f1168).
- **Draw:** 43.463. The flash runs guard → tip, starting on the frame.
- **I0 glyph pairs:** light one per half-bar from DA(21): 47.991, 49.123, 50.255, … (1.132 s apart).
- **I1:**
  - the 信 counter ticks once per beat;
  - 鸠浅 ＝ 勾践 resolves on DA(24), 54.784 (f1644).
- **B1:**
  - film light clicks on at DA(25), 57.048;
  - clapper at 58.180;
  - the blade passes through the stack on DA(26), 59.312;
  - the halves fall in the deep break, 61.01–61.58.
- **M1:** the zoom begins on 61.577; the 「原因之一：料好」 bar lands on DA(28), 63.841.
- **M2:**
  - 「镀铬？」 tag returns on 66.105;
  - section cut opens at 67.237;
  - 「热镀锡 · 2025研究」 on DA(30), 68.369.
- **T1:** the first bloom on f2255; 2–3 more on the following beats 75.728 / 76.860 (sparse, not every beat).
- **T3:** the ◀◀ rewind starts on 81.954; the sword settles on the arrival, 84.219.
- **E1:** other swords light one per half-bar from 86.483.
- **L1:** the six layers close one per beat from DA(40), 91.011: 91.011 / 91.577 / 92.143 / 92.709 / 93.275 / 93.841. The depth tag runs on its own clock.
- **R2:** surface → floor on 95.540.
- **P1:**
  - pull-back starts 102.332;
  - the glass reflection resolves into the kitchen by DA(47), 106.861.
- **End card:** card and seal contact on 109.125 (f3274).

## On their own clock (do not lock to the beat)
These stay smooth and continuous:
- the camera's travel (glides, the descent at ~1.2 m/s, the pushes);
- snow;
- the depth tag (0 → 10.8 → 0);
- letters fluttering;
- the year rolls in the stamp;
- air dots;
- the brightness gauge slipping;
- the slow drift in the hush.

Never pulse the whole frame on the beat; only the thing that appears lands on it.

## For the sound pass
- **Keys:**
  - 0–74.4 A minor (2-beat chords F, E, Am, C; chorus F-G | C | Dm-E | Am-C);
  - 75.16–84.2 an E pedal (the drop);
  - from 84.22 B♭ minor (G♭-F | B♭m-D♭);
  - the end card is on B♭m.
- **Tuning:**
  - the sword ring at 43.46 sits on the chorus F chord (tune to F/A/C);
  - the T1 crackle sits on E;
  - the J seal at 109.125 sits on B♭m (F or B♭).
- **The hush stays clean:** keep 74.41–75.16 free of effects. The bed already breathes in. T1's crackle sits on 75.162.
