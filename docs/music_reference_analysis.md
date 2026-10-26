# Music series: what the 「节奏 · Rhythm」 reference does well, and how we make our own (2026-10-26)

Source: three screen recordings from the owner (about 10 min, landscape, GarageBand-like). Analysed from contact sheets
(1 frame per 5 s), 10 fps strips of three scenes, and the audio (tempo per 10 s window; audio onsets vs frame-difference energy).

## Measured
- **Real genre tempos.** Heartbeat about 70 BPM; funk about 99–103; disco/rock 117–129; trap 152 (felt half-time, 76).
  The tempo changes per chapter, and the on-screen BPM number changes with it.
- **The picture is locked to the sound.** Frame changes correlate with audio onsets in every scene tested (peak corr 0.19–0.54).
  The picture lands **1–3 frames before** the sound (33–100 ms). Part of that may be the screen recorder's own offset, but it
  matches the animator's rule: the hit is drawn a frame early so the eye and ear meet together.
- Loudness about −11 LUFS (louder than our −14 target).

## Why it works
1. **One clock drives everything.** Notes, characters, lights and numbers all come from the same beat grid, so nothing moves
   off the music.
2. **Two modes alternate.**
   - *Teach:* a calm paper page, one idea, one big number (BPM, 3+3+2, 7/8), one caption line with red keywords.
   - *Feel:* a full-bleed illustrated genre scene that shows the same rhythm as a world.
   - The lane strip stays at the bottom in both modes, so the viewer always knows where the beat is.
3. **A fixed playhead with notes scrolling in** (about 25 % from the left). You see the next hit coming, so you can predict it
   and tap along. That prediction is what makes it feel intuitive. A hit turns red, pops, and the string wobbles.
4. **Each instrument owns one movement in the scene.** For example, kick = light/ground thump, snare = the dancer's lock or
   the skater's ollie, hats = small sparkles. The mapping stays fixed inside a scene, so the viewer learns which sound goes
   with which motion without being told.
5. **Intensity = how many layers are on.** More layers make more things move and the palette brighten; a breakdown empties
   the scene; the drop moves everything.
6. **Restraint.** Warm paper, flat shapes, simple characters, and one accent colour (red) used only for "now" and keywords.
7. **Pedagogy.** One new concept per chapter, each built on the last: hear it alone → see it on the page → feel it in a genre.
8. **Musical transitions.**
   - The playhead line grows into the cut.
   - A circle expands on the downbeat.
   - A scribble covers the fill.
   - Cuts land on bar 1.
9. **A closed loop.** The finale runs a medley through every scene and ends back on the heartbeat it opened with.

## What we do differently (so it is ours, not a copy)
- **3-minute episodes, a series:** one concept and 1–2 genres per episode.
- **The viewer takes part:** 「跟着拍」 prompts, and a tap challenge at the end of each episode.
- **A through-line:**
  - 从零做一首歌: every episode adds one layer to *our* song (beat → bass → chords → melody).
  - The last episode plays the whole track we built together.
- **A Chinese angle the reference doesn't have:**
  - 京剧板眼: 板 = strong beat, 眼 = weak beat. 一板一眼 = 2/4; 一板三眼 = 4/4.
  - 锣鼓经 as a strong/weak drill.
- **Our own look:** our own palette, accent and motifs; not paper + red. Propose 2–3 looks for the owner to pick.
- **Real recorded sounds only:**
  - TR-707 samples (public domain);
  - CC0 recorded instruments;
  - the owner's own recordings.
  - No AI SFX.

## How we build it (engine we already have)
- `score.py` writes every hit once (instrument, time, velocity) and renders the audio from real samples. `renderAt(t)` reads
  the same hits for the picture. This was proven in the ep50 vertical demo; the series moves it to 1920×1080.
- **Layout:**
  - lane strip at the bottom (about 22 % of the height), playhead at x ≈ 25 %, notes scroll right to left;
  - caption top-left; the big number top-right;
  - keep clear of the phone crop (≥ 120 px from the sides).
- **Scene reaction table:** per scene, `instrument → action` with a short envelope (e.g. kick: squash 8 %, 0.25 s decay;
  snare: pose switch; hats: sparkle). Hits are drawn 1 frame early.
- **Intensity:** the number of active layers drives scene brightness, crowd size and camera energy.
- **Checks:** beat hits within 1 frame (reuse the ep45 check), camera ≤ 25 px per frame, −14 LUFS.

## Draft episode map (total beginner)
1. 心跳 → 拍子, BPM (count along; 60 vs 120)
2. 强弱 → 2/4 3/4 4/4 (板眼) → march, waltz, rock
3. 切开拍子: 8ths, 16ths → disco, trap
4. 反拍, 切分 → reggae, funk
5. 三连音, swing → blues, jazz, lo-fi
6. 3+3+2 → reggaeton, bossa nova
7. 奇数拍 7/8 → prog
8. 我们的歌: the whole track we built
