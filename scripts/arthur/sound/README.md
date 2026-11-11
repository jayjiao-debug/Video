# Arthur short: narration loudness and sound effects

The picture is rendered silent. The sound is built here from the narration and a cue sheet, then put on the video.

- `cues.json`: the sounds (which clip, which point of it lands on the frame, its level against the narration) and the
  cues (film frame, sound, optional trim in dB, pitch in semitones, length and fades in frames). 53 cues, 21 clips:
  42 spot effects and 11 pieces of ambience. A sound with `"bed": true` is ambience under a whole shot: it is levelled
  by its average, `even` flattens its swells, `tame` rounds off clap spikes, and a cue can start inside the clip
  (`off_s`). Beds sit only where the picture shows a crowd, and start and stop on the cuts: the tournament crowd under
  the three field scenes (f452-606, f843-1027, f1908-end), a cheer on the two cutaways to the field (f640, f762), low
  talk and then angry voices when the lords gather and fume (f1265-1454), birdsong and a few claps in spring
  (f1565-1633), the town murmuring before the sixth pull (f1648), the commons shouting (f1717-1806) cut to silence by
  the kneeling.
- `narr_master.py`: the narration to a target loudness. Default `--mode limit`: one gain, then a look-ahead peak
  limiter (a smooth gain change around the peaks; the waveform is never bent). `--mode clip` is the louder chain used
  for v2 / v3 (3:1 compression + soft clipper to -12.5 LUFS mono): it bent the loud syllables (distortion louder than
  -25 dB under the voice in 16 % of the 50 ms windows) and the owner heard the voice break, so it is kept only for
  reference.
- `sfx_mix.py`: narration + cues -> `_narr.wav`, `_sfx.wav` (effects alone) and `_mix.wav`. Every effect is levelled
  against the narration's loud syllables, measured above 150 Hz (what a phone speaker plays); sharp hits are held back
  by their peak. `--sfx-db N` moves everything up or down together, `--bed-db N` only the ambience. The log lists, for
  every bed, how far the voice sits above what plays under it (10 to 16 dB in v4).
- `remux.sh`: keeps a finished video stream and swaps its sound for the mix (stereo, both channels the same).

```
python3 sfx_mix.py narration.mp3 cues.json <folder with the clips> out --dur 66.3667 --lufs -14.5
bash remux.sh picture_or_phone.mp4 out_mix.wav film_with_sound.mp4 160
```

The narration itself is assembled in `../voice/`.

Loudness: v4 is mono at -14.5 LUFS; written as stereo it reads -11.5 LUFS (a mono file of the same sound reads 3 LU
lower than its stereo copy, so compare like with like). On the same footing v1 was -12.5 ("a bit soft") and v2 / v3
-9.5 ("too loud, the voice breaks").

The clips are ElevenLabs sound effects made on the voice farm (requests `arthur-sfx-01`, `arthur-sfx-02` for the spot
effects, `arthur-sfx-03` for the ambience; results on the `voice-output` branch under `out/<id>/`, each with the
labels an AudioSet tagger gave it). They are not kept in this branch. A wind bed was generated too and dropped: the
clips were nearly silent and the tagger did not hear wind.

Cue frames come from the shot tables (`T` / `F` in `src/videos/arthur/shots/seg*.ts`): the sword home f66 / f1066 /
f1466, the stone lands f232, Kay's slaps f554 / f560, the knocks f618 / 622 / 626, the pulls come free f808, 1236,
1327, 1518, 1598, 1681, a stamp hits 3 frames after its `at`, the crown lands f1884, the rewind starts f1905.
