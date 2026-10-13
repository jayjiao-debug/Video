# Pixel pilot

A 35-second test of a pixel-art book explainer where **one script file drives everything**.

```
lines.json            the script: each line's text, gold keyword, chapter, camera and events
tools/voice.py        one TTS clip per line -> public/audio/voice.wav + src/timeline.json
tools/art.py          the asset library, drawn in code on a 480x270 grid -> public/sprites/
tools/sound.py        chiptune bed + a sound effect on every cue + ducking -> public/audio/mix.wav
src/                  Remotion: World (room, camera, props, narrator) and UI (templates)
```

Build:

```bash
npm install
python3 tools/voice.py && python3 tools/art.py && python3 tools/sound.py
npx remotion render src/index.ts Pilot out/raw.mp4 --codec=h264 --crf=14
ffmpeg -i out/raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/pixel_pilot_1080p.mp4
```

Templates (event `do` values): `prop_in`, `prop_out`, `pose`, `clock_spin`, `stat_card` / `stat_set` / `stat_card_out`,
`book_reveal`, `title_card`, `skill_card`, `fx`. Events fire at a line's `start`, its `key`word, or its `end`.

Crisp pixels: the world is 480x270 and the camera only rests on integer zooms (4, 5, 6, 8 screen pixels per
art pixel); every sprite uses nearest-neighbour scaling and whole-pixel positions.

Placeholders to replace for production: the voice (free Google Translate TTS, read at 1.18x), the keyword
timing (estimated per character; swap in a forced aligner), and the synthesised music bed.
Fonts: Fusion Pixel (OFL, see public/fonts/OFL.txt).
