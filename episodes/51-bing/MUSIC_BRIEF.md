# ep51 music bed brief (music specialist)

Owner (2026-10-26 12:05): "use the same BGM, you are given the option to sample/slice etc to make it more whole but it should still be smooth."

## Goal
Cut the owner's track into a bed for ep51 《古代没有冰箱，夏天怎么吃冰？》 that feels like **one whole piece of music** (an arc with a beginning, a build, a quiet valley, a peak and an ending), with no audible seams, fitted exactly to the fixed picture timeline below. You may slice, repeat and reorder bars, provided every splice lands on bar lines (or under a hit), the key and groove stay continuous, and nothing sounds chopped. No added instruments, no time-stretching of the song, no pitch changes, no sidechain ducking. Fades and crossfades are fine.

## Inputs
- **Song:** `/home/claude/video/episodes/50-qian/music/bgm.mp3` (バケモノの唄 instrumental, 254.1 s; the same file as ep50). Copy it to `/home/claude/video/episodes/51-bing/music/bgm.mp3`. Never commit audio; `episodes/*/music/*.wav|mp3` are gitignored.
- **ep50's bed (approved):** `/home/claude/video/episodes/50-qian/music/build50.py`. Its docstring holds the song's measured grid and form: part-1 downbeats `0.5688 + 2.2642k` for bars 0–79, part-2 downbeats `1.1348 + 2.2642k` for bars 80–110, the bar map, repeated-bar correlations and the splice method. Also see `measure50.py` and `music_map_ep50.json`. Reuse the method and the tools.
- **Timeline:** `/home/claude/video/episodes/51-bing/lines_read.json`. The "Music and sound" section of `script.md` has the energy notes.

## Fixed contract (the picture is being built to this right now; do not move it)
Film = 119.25 s (118.75 + a 0.5 s fade). Beat 0.56605 s.
- **Grid A, 0–70.63:** film downbeats `DA(k) = 0.4432 + 2.2642k`.
  - Something must land in the first second: the first downbeat, at 0.44, is the fridge door. The film starts with music already moving: a pickup or a cut into a phrase, not a slow intro.
  - **DA(4) = 9.50 is the title: the first hard drop / re-entry**, the strongest landing in the first half. The bars just before it (7.0–9.5) can thin or break.
  - Keep energy up through 周/战国 (12.5–41.75). There is a tense hold for 先猜？ (35.0–37.25) and a release on 酒 at 37.25.
  - Then Tang and Song stay bright: the ice goes up, then out on the street.
  - 清 night from 62.75 is darker or lower.
- **Hush, 70.63–74.26:** the one quiet stretch, under the melt time-lapse. The music stops or thins to near silence at 70.63 (a stop bar or ring-out like ep50's 96.45 hush is ideal), and a breath or inhale leads back.
- **Grid B, from 74.26:** film downbeats `DB(k) = 74.2586 + 2.2642k`.
  - The music comes back on DB(0) = 74.26, on 「剩下[一份]」.
  - It builds through 清 → 乾隆 → 19世纪 → the numbers (94.75–106).
  - **The peak runs from DB(14) = 105.957** (P1 「古人的“冰箱”里，装的是[冬天]」) through P2 and the 1.0 s of air (111.75–112.75). This is the film's emotional peak, the arrival.
  - **End card on DB(17) = 112.75:** a clear fall (drums stop or a hit on the downbeat). Then the song's own coda or a soft ending under the 6 s card, faded to silence by 119.25 (like ep50's coda).
- **Picture hits will land on these beats** (wipes, chisel strikes, title slam, the 冰票 stamp, the bowls). So the grid must be exact: film downbeats within ±10 ms of the formulas.

## Deliver
- `episodes/51-bing/music/build51.py` (documented like build50.py, with the film layout table: film span → song span → bars → splice type and correlation), `ep51_bed.wav` (48 kHz, 24-bit, stereo, 119.25 s, −14 LUFS integrated, true peak ≤ −1.5 dBTP), and `music_map_ep51.json` (grid, sections, every splice, loudness per section).
- Measure every splice (correlation, lag, no click) and listen-check by measurement: spectrum and energy curves over the seams, short-term loudness per section. Show the energy curve with the section marks: `ep51_bed_curves.png`.
- Also make `ep51_bed_untouched.wav`, the owner's track as one continuous stretch with a fade-out only, aligned so its strongest drop sits as close to 9.5 as possible. This is offered as an alternative, as in ep50.
- **Report:** the layout table, where each contract point lands (measured), any compromise, and what you'd change if the picture could move. Budget about 60 minutes. Don't commit audio; you may commit build51.py and music_map_ep51.json.
