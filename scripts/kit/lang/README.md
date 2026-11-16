# lang/: a second-language version of a film (the recipe)

The picture stays the original film, frame for frame; everything in the new language is behind the input prop
`lang` (`src/kit/film/lang.ts`: `EN`, `L(zh, en)`). Built for Hongmen's English version (`scripts/hongmen/en/`).

## The recipe

1. **Switch.** The film's `lang.ts` re-exports `LANG / EN / L` from the kit. Every on-screen string becomes
   `L(zh, en)` next to its builder; shared strings go in the film's `TXT`. Layout that depends on the language (edge
   margins: English corner tags keep 96 px from the edges, phones cut the sides of 9:16; Latin capitals are wider) is
   behind `EN` too. Without the prop the film must render exactly as before (check with two stills).
2. **Script** `scripts/<film>/en/script_en.json`: one group per ORIGINAL caption group (the picture's beats sit on
   their first frames), spoken words `t`, caption chunks `cap` (【】 = gold), `who` / `syl` for quoted characters,
   `alt` wordings, `say` (name respellings for the voice, same word count as the name), `loop` (required by the fit: `{"lines": [<last line>, 1], "take_name": "x0122"}`, the lines that are one
   take across the film's loop point, and the clip name of that take without its take letter). Write to the time each group has; do not translate word for word.
3. **Voice** from the voice farm (`elevenlabs-voiceover` skill), one clip per line and take, `"words": true`.
4. **Fit** with this folder's tool (any film; Hongmen's `scripts/hongmen/en/fit_en.py` fills in its paths):
   ```
   python3 scripts/kit/lang/fit_lang.py <clips dir> <report.json> <out narration.wav> <out timing.json> \
     --script scripts/<film>/en/script_en.json --captions src/videos/<film>/captions.ts \
     --slots <original voice_timing.json> --frames <TOTAL> [--fps 30] [--film x] [--lang en] [--hold 9,21] \
     [--takes abc] [8@1.18] [13=b]
   ```
   Per group a tempo (0.97 to 1.15; `8@1.18` lets line 8 go faster), pauses trimmed, each group as near as possible to
   its original window, lines ending 0.08 s before the next original line (`--hold`: these keep the original's hold).
   The loop take is written round the end of the track (sample-continuous through the seam).
5. **Captions** `captions_en.ts` generated from the timing (Hongmen: `scripts/hongmen/en/gen_en.py`; 72 px, smaller when
   a chunk would pass 730 px).
6. **Sound** the film's build with the new narration (Hongmen: `bash scripts/hongmen/sound/build.sh --lang en`).
7. **Render** on the farm with `"flags": "--crf=14 --props={\"lang\":\"en\"}"` in render.json
   (`scripts/kit/farm/README.md`), then mux locally (`scripts/kit/sound/mux.sh`).
8. **Cover** in the new language (`scripts/kit/cover`, a spec with the English hook).

Hongmen numbers: 22 lines, 67 groups, four voice requests, group starts 3.4 frames from their windows on average,
90 % within 7 frames. Full story: `scripts/hongmen/en/README.md`, `/home/user/hm_notes/en_version.md`.
