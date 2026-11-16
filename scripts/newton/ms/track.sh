#!/bin/bash
# Re-probe Humphrey's head over skin A's banner and write src/videos/newton/hud/ms/track.ts (see track.ts here).
#   bash scripts/newton/ms/track.sh [--dry]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
cd "$REPO"
B=${TMPDIR:-/tmp}/newton_track_$(id -u)
mkdir -p "$B"
NODE_PATH="$REPO/node_modules${NODE_PATH:+:$NODE_PATH}" node_modules/.bin/esbuild "$HERE/track.ts" --bundle --platform=node --format=cjs \
  --outfile="$B/track.js" --log-level=error --define:process.env.NODE_ENV='"production"' \
  --banner:js="$(cat "$REPO/scripts/kit/qa/clearance/stub.js")"
nice -n 10 node --max-old-space-size=3000 "$B/track.js" "$@" 2> >(grep -v "getInputProps\|To hide this\|typeof window" >&2) | grep -v "getInputProps\|To hide this\|typeof window"
