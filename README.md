# Vasa (1628): render farm

Render farm for the Vasa warship short (the whole film, v3: 75.1 s, 2254 frames at 1080x1920). Same flow as the other `render-farm-*` branches:

- Edit `render.json` and push to `render-farm-vasa` to start a render.
- Frames are split into chunks, each rendered on its own GitHub Actions runner (`--gl=swangle`).
- The joined picture (no audio) is pushed to the `render-output-vasa` branch. The voice-over is added afterwards.

The 3D toon pipeline in `src/videos/vasa` (sky, water, town, ink pass, lens blur, grade, billboard characters) is adapted
from [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT, see
`LICENSE-claude-animated-shorts`). The ship, costumes, story and cameras are new for this episode.
