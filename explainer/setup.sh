#!/usr/bin/env bash
# One-time setup: Node deps, Python deps, and the source fonts (subset per episode at build time).
set -euo pipefail
cd "$(dirname "$0")"

npm install --no-audit --no-fund
python3 -m pip install -q numpy pillow pyyaml fonttools brotli

mkdir -p models/fonts
base=https://raw.githubusercontent.com/google/fonts/main/ofl
for f in "notoserifsc/NotoSerifSC[wght].ttf" "notosanssc/NotoSansSC[wght].ttf" \
         "cormorantgaramond/CormorantGaramond[wght].ttf" "cormorantgaramond/CormorantGaramond-Italic[wght].ttf"; do
  out="models/fonts/$(basename "$f")"
  [ -s "$out" ] || curl -fsSL --retry 3 -o "$out" "$base/$(echo "$f" | sed 's/\[/%5B/; s/\]/%5D/')"
done

command -v ffmpeg >/dev/null || echo "warning: ffmpeg not found (needed for music analysis and the final mix)"
echo "setup done. Put your track at assets/music/bgm.mp3, then: python3 make.py survivorship --plan"
