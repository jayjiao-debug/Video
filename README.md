# vibe-render

Render farm for the 「Vibe知识大赏」 3D episodes (Remotion + three.js).

- Edit `render.json` and push to the `render-farm` branch to start a render.
- Frames are split into chunks, each rendered on its own GitHub Actions runner.
- The joined picture (no audio) is pushed to the `render-output` branch; music is added afterwards.
- No music files are stored here; `public/bgm*.mp3` are one-second silent stand-ins.
