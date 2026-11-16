# voice/: narration helpers

| file | what |
|---|---|
| `audio.py` | small audio helpers (numpy + ffmpeg): `decode`, `read_wav` / `write_wav`, `env_db` (level envelope), `runs_below`, `cjk` / `strip`, `configure(raw, work)` (`HM_VOICE_RAW` / `HM_VOICE_WORK`). Hongmen's `scripts/hongmen/voice/hmaudio.py` is this very module under its old name |
| `verify_narration.py` | `python3 scripts/kit/voice/verify_narration.py <folder> [narration.wav] [timing.json]`: line edges against the timing json, levels, the silences between lines, word times, the loop joint (defaults: Hongmen's `narration_v4.wav`, `voice_timing_v4.json`) |

The narration itself comes from the voice farm (the `elevenlabs-voiceover` skill); a film's assembler stays in the film
(Hongmen: `scripts/hongmen/voice/assemble_hongmen.py` with `hongmen_lines.json`). For a second language see
`scripts/kit/lang/README.md`.
