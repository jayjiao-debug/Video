# Arthur short: narration loudness and sound effects

The picture is rendered silent. The sound is built here from the narration and a cue sheet, then put on the video.

- `cues.json`: the sounds (which clip, which point of it lands on the frame, its level against the narration) and the
  cues (film frame, sound, optional trim in dB, pitch in semitones, length and fades in frames). 42 cues, 14 clips.
- `narr_master.py`: the narration to a target loudness: 3:1 compression, a gain, then a soft clipper (4x oversampled)
  that rounds off only the highest peaks. It prints how much of the signal it touched.
- `sfx_mix.py`: narration + cues -> `_narr.wav`, `_sfx.wav` (effects alone) and `_mix.wav`. Every effect is levelled
  against the narration's loud syllables, measured above 150 Hz (what a phone speaker plays); sharp hits are held back
  by their peak. `--sfx-db N` moves all effects up or down together.
- `remux.sh`: keeps a finished video stream and swaps its sound for the mix (stereo, both channels the same).

```
python3 sfx_mix.py narration.mp3 cues.json <folder with the clips> out --dur 66.3667 --lufs -12.5
bash remux.sh picture_or_phone.mp4 out_mix.wav film_with_sound.mp4 160
```

The narration itself is assembled in `../voice/` (the track in use is `voice_timing_v3.json`).

Loudness: the mix is mono at -12.5 LUFS; written as stereo it reads -9.5 LUFS (a mono file of the same sound reads
3 LU lower than its stereo copy, so compare like with like).

The clips are ElevenLabs sound effects made on the voice farm (requests `arthur-sfx-01`, `arthur-sfx-02`; results on
the `voice-output` branch under `out/<id>/`, each with the labels an AudioSet tagger gave it). They are not kept in
this branch.

Cue frames come from the shot tables (`T` / `F` in `src/videos/arthur/shots/seg*.ts`): the sword home f66 / f1066 /
f1466, the stone lands f232, Kay's slaps f554 / f560, the knocks f618 / 622 / 626, the pulls come free f808, 1236,
1327, 1518, 1598, 1681, a stamp hits 3 frames after its `at`, the crown lands f1884, the rewind starts f1905.
