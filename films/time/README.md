# 《越过越快》 — why time feels faster as we grow up

A voice-over data essay (the format of the owner's reference: one study per chapter, an animated chart for each,
the voice carries the argument and the picture carries the numbers). 1920×1080, ~131 s, Mandarin AI voice
(edge-tts zh-CN-YunxiNeural, +15 %), the owner's track ducked under the voice.

Pipeline:
1. `script/vo.json` — the voice lines: [chapter, id, text spoken, text shown (or null)].
2. Voice: generated on GitHub Actions (the workspace cannot reach the TTS service) into `public/vo/<id>.mp3`
   + `words.json` (word boundaries); trimmed to `public/vo/<id>.wav` (not committed).
3. `python3 scripts/timeline.py` → `src/timeline.json` (line starts, caption chunks, chapter cuts on beats,
   title on the track's first drop, end card).
4. `python3 scripts/mix.py` → `out/mix.wav` (voice + ducked music, −14 LUFS, true peak ≤ −1.5 dBTP).
5. Picture on the render farm: `scripts/cloud_render.py Time <name> --end <frames-1>`; then
   `scripts/finish.py out/<name>_pic.mp4 <tag> scenes.json` (music = out/mix.wav).

Facts and sources: `research/facts.md`. "16 岁过一半" is a model estimate (√(3×80)), labelled on screen.
Dates (day 279, 76.4 %, 86 days left) assume posting on 2026-10-06.
