# Reference 2026-10-23: 「两千年来，总有人抬头问：为什么」 (3:20, flat silhouette relay)

**Structure.** One question per scientist, in chronological order, ending back on a black hole.
- Opens on the 2019 black-hole image.
- **Rewind montage.** A fast reverse montage (12.3–17.4 s) jumps one scene per beat (108 BPM ≈ 0.56 s). Each jump is labelled with its year: 1976, 1935, 1905, 1898, 1895, 1859, 1831, 1687, 1632, 1543, 480. It lands on a cream "light" frame.
- **The relay.** It starts around 250 BC with Archimedes (Εὕρηκα).
- **The scenes** follow in order:
  - 祖冲之 (π digits on the moon)
  - Copernicus
  - Galileo
  - Newton (the apple)
  - Faraday (the magnet)
  - Darwin (the "I think" tree)
  - Mendel (peas)
  - Mendeleev (the periodic table)
  - Pasteur
  - Röntgen (the x-ray hand)
  - Curie
  - Einstein (the clocks)
  - Schrödinger (the box)
  - Franklin / Watson / Crick (photo 51)
  - 屠呦呦 (青蒿)
  - 袁隆平 (rice)
  - Hawking (the black hole)
- **Pacing.** About 9–10 s per scene, roughly 4 bars.
- **Ending.** All of them walk in one line: "For two thousand years, someone has always looked up and asked: why?" → "Now, it's your turn." → end card "如果只能问宇宙一个问题，你会问什么？", a call to comment.

**Core principles**
1. **One continuous world.** The same silhouette style, the same horizon line and the same camera move run through every era. A walking figure carries you from one scene to the next, with soft dissolves and almost no hard cuts. 3:20 feels like one shot.
2. **A relay of questions.** Every person is reduced to ONE question, written in their own language with a Chinese line under it. History becomes "people asking why", and the native languages make it feel global and true.
3. **One iconic object per scene, alive.** π digits counting up on the moon, the apple, the needle on the magnet, the "I think" tree sketch, the x-ray hand, the two clocks, the box, the rice. The object animates and does the explaining.
4. **Object hand-offs.** One scene's object becomes the next scene's: Mendel's paper → library card → Mendeleev's element cards flying. A dissolve through a shared shape.
5. **The rewind hook.** In the first 17 s you see the whole film backwards, one scene per beat, with the year ticking down. It promises the journey and shows the production value, then the slow story begins. This is the film's only fast-cut "density" section; everything after it is calm.
6. **Bookends and a loop.** It begins and ends on the black hole, then hands the question to the viewer ("Now, it's your turn" plus a comment prompt).
7. **Steady emotional music.** About 108 BPM with flat dynamics: dips at about 78 s and 180 s, a fade at 192 s. Scenes change on bar lines, not on hits.
8. **A tiny, consistent label.** Top-left: a red dash, the year, the name, the place. Subtitles bottom-centre: original language over Chinese.

**How we replicate it in our engine**
- **2D world kit.** Gradient skies, silhouettes of cities and landmarks per era, a walking silhouette, parallax layers and one camera pan. Every scene shares the horizon line, so a dissolve plus the walk joins any two scenes.
- **One `Scene` = {year, name, place, native-language line, Chinese line, background set, hero object animation}.** About 4 bars each.
- **Rewind opener.** Render one key frame per scene and play them in reverse on the beat with a year counter. It's cheap because it reuses the scenes.
- **Hand-off transitions.** The outgoing object morphs or zooms into the incoming one.
- **Native-language lines need verification** (a researcher plus a native check). Use real quotes only where they are documented; otherwise use a paraphrased question.
- **Ending.** All the silhouettes line up and walk together, then the question goes to the viewer.

## Voice-over vs music (measured 2026-10-23)
- **How much voice.** Subtitles are on screen about 64 % of the time: 26 windows of 5–6 s each, with about 3 s of music only between scenes.
  - The spectrogram shows speech harmonics through most of each window.
  - Each scene's voice is about 5 s: the question in the native language plus one sentence of story, not just a short quote. Voice is on air for roughly 55 % of the film.
- **How loud.**
  - The music ducks only slightly under the voice: the low band (< 150 Hz) is 1.4 dB lower while subtitles show.
  - The speech band (300–3400 Hz) is no louder with voice than without. The voice sits about level with, to a few dB under, the music.
  - Loudness is −11.1 LUFS during lines and −13.1 LUFS between them; −11.7 LUFS integrated.
  - It is a music-forward mix: the voice is a texture you can follow, and the Chinese subtitles carry the meaning.
- **For our films.**
  - Put voice about 3 LU under the BGM's loudness, compressed so it does not need loud peaks. The BGM is not ducked (house rule).
  - Write about 5 s of native-language voice per scene (quote + one line of story) to match the reference's density.
