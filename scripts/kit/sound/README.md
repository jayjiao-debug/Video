# sound/: mix, verify, measure, mux

The film's sound is built on this machine from named beats and put on the picture at the very end (the farm renders
the picture muted). Shared kit; built for Hongmen. A film keeps its OWN `build.sh` (the one command: beats -> mix ->
listening copies -> verify), `cues.json` and its beats dumper; the tools below are the shared part.
Hongmen's `scripts/hongmen/sound/{mix,verify,measure}.py`, `mux.sh` and `cuesheet.py` are wrappers around these.

| tool | command | what |
|---|---|---|
| `mix.py` | `python3 scripts/kit/sound/mix.py <narration.wav> <beats.json> <cues.json> <clips dir> <out prefix> [--timing t.json] [--lufs -14.5] [--sfx-db 0] [--bed-db 0] [--guard 3]` | narration + spot effects + ambience beds -> one mastered LOOPING track; writes `<out>.wav`, the three stems, `<out>_48k.wav` (the file to mux, exactly the film's length), `<out>_cues.txt/.json`, `<out>_words.txt` |
| `cuesheet.py` | `python3 scripts/kit/sound/cuesheet.py <beats.json> <cues.json>` | resolves cues tied to NAMED beats (`HIT.x`, `TAG.x`, `BEAT.x`, `SHOT.12b`, `LINE.6`, `CAP.15.2`, `PIC.A.title`, `FILM.end`, + `off`) to frames; no frame number is ever typed in a cue |
| `verify.py` | `python3 scripts/kit/sound/verify.py <mix.wav> <narration.wav> <beats.json>` | the mix against the rules: length to the sample, loudness and true peak, stems add up, the narration untouched inside, no click or bare moment at the loop joint |
| `measure.py` | `python3 scripts/kit/sound/measure.py <clips dir> [report.json ...]` | measures delivered effect clips (onset, peak, ring, hits, level, band energy) to pick takes without ears |
| `mux.sh` | `bash scripts/kit/sound/mux.sh <silent picture.mp4> <mix_48k.wav> <out.mp4> [kbps]` | puts the mix on the picture: picture copied, sound neither padded nor trimmed, `-movie_timescale 48000`, `-aac_pns 0`; FAILS if picture and sound differ in length |

Hongmen's one command (it calls the tools above): `bash scripts/hongmen/sound/build.sh` (Chinese) or
`--lang en` (the English narration). The cut (`scripts/kit/cut`) calls the film's `sound.build` and `sound.mux` from
kit.json.

Rules (hm_notes/s_sound.md): beds hold one gain per stretch and never duck; the voice sits 14 to 22 dB over everything
under it; a bed longer than its clip loops with 0.6 s equal-power crossfades; the film loops, so everything is placed
on a ring as long as the film (a bed may run over the loop point); no music; no audio in the repo.
Phase 2 of the kit: make `build.sh`, `dump_beats` and the beats format general (they need a beats contract; Arthur has
no beats.ts).
