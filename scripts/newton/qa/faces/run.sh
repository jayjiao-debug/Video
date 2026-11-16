#!/bin/bash
# FACE vs HUD checker for NewtonFilm (headless: no GL, no browser, no render queue). See the header of check.ts.
#   bash scripts/newton/qa/faces/run.sh                     the whole film -> /home/user/newton_work/film/check/whole/faces/faces.txt
#   bash scripts/newton/qa/faces/run.sh --seg F,G           some scenes      --from 4380 --to 4420   a range
#   ... [--out DIR] [--step 1] [--gap 4] [--min 1] [--pad 0] [--zone skin|face|head] [--dump F,G] [--quiet]
# Poses the real World per frame the way scripts/kit/qa/clearance does (it reuses that tool's headless stubs, read only).
# Runs niced: the machine's cores belong to the renders.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../../.." && pwd)"
cd "$REPO"
B=${FACES_BUILD:-${TMPDIR:-/tmp}/newton_faces_$(id -u)}
mkdir -p "$B"
NODE_PATH="$REPO/node_modules${NODE_PATH:+:$NODE_PATH}" node_modules/.bin/esbuild "$HERE/check.ts" --bundle --platform=node --format=cjs \
  --outfile="$B/check.js" --log-level=error --define:process.env.NODE_ENV='"production"' --banner:js="$(cat "$REPO/scripts/kit/qa/clearance/stub.js")"
exec nice -n 10 node --max-old-space-size=3000 "$B/check.js" "$@" 2> >(grep -v "getInputProps\|To hide this\|typeof window" >&2) | grep -v "getInputProps\|To hide this\|typeof window"
