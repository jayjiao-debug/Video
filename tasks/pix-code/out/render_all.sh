#!/usr/bin/env bash
# usage: ./render_all.sh OUT.mp4   (needs node/npm, python3 with playwright+chromium, numpy, pillow, ffmpeg)
set -euo pipefail
OUT="${1:?usage: render_all.sh OUT.mp4}"
cd "$(dirname "$0")"
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT" ;; esac
# deps (not committed)
[ -d scene/node_modules/three ] || (cd scene && npm install three@0.160.0 --no-save)
if [ ! -f font/package/fusion-pixel.ttf ]; then
  mkdir -p font
  npm pack @fontpkg/fusion-pixel
  tar xzf fontpkg-fusion-pixel-*.tgz -C font
  rm -f fontpkg-fusion-pixel-*.tgz
fi
FRAMES="$(mktemp -d "${TMPDIR:-/tmp}/pixframes.XXXXXX")"
trap 'rm -rf "$FRAMES"' EXIT          # frames are deleted when done
python3 render_frames.py --out "$FRAMES"
python3 pix.py video "$OUT" --frames "$FRAMES"
echo "wrote $OUT"
