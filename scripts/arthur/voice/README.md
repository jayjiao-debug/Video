# Arthur short: the narration

21 lines (`arthur_lines.json`), one ElevenLabs clip per line from the voice farm, joined into one track whose line
starts and ends drive the picture (`../gen_timing.py` reads the timing json).

- `assemble_arthur.py <voice k|j> <out.mp3> <timing.json> [line=take ...]`: speeds every line up, joins the lines with
  short gaps and writes the timing json. It reads the processed takes from `av1/proc/<voice><nn><take>.wav` (the farm
  clips with the silence at both ends trimmed and the pauses inside shortened; the clips are not kept in this branch).
  - `--rate 5.5`: characters per second to aim for (each line's speed-up is held between 1.08 and 1.36).
  - `--fit other_timing.json`: give every line the slot it has in another timing file, so a new narration drops onto a
    picture that is already rendered.
  - `--engine rubberband | atempo`: how the speed-up is done. `rubberband` is a phase vocoder; `atempo` is the
    overlap-add method players use for 1.25x. At this much speed-up (about 1.27x on average) the owner found `atempo`
    the more natural of the two.
  - `--norm loudnorm | gain`: `gain` is one fixed gain to -16 LUFS with no dynamics processing (the loudness is set
    later by `../sound/narr_master.py`).
- `voice_timing_v1.json`: the timing the picture was rendered with (voice Julia, `rubberband`).
- `voice_timing_v3.json`: the narration in use (voice Julia, `atempo`), fitted to the v1 slots: every line starts where
  it did and ends within 0.02 s of where it did.

The narration in use:

```
python3 assemble_arthur.py j narration_v3.mp3 voice_timing_v3.json 2=b 5=c 15=b 16=b 18=b \
  --fit voice_timing_v1.json --engine atempo --norm gain
```

Voice: ElevenLabs "Julia" (a native Mandarin voice from the shared library) on the v4 model at speed 1.2, the fastest
the API offers. At that setting Mandarin voices read about 4.0 to 4.6 characters a second once the pauses are trimmed;
the film needs 5.4, which is why every line is sped up afterwards.
