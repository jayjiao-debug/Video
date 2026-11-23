#!/bin/bash
# The hand easing's table (src/videos/romeo/shots/ease.data.ts), made from the film's own motion, and its check.
#   bash scripts/romeo/ease/run.sh [out dir]     (default /home/user/romeo_work/film/qa/ease)
# 1 the film without the easing, measured;  2 the table of jumps (make.py);  3 the film with it, measured;  4 the report.
# Run it again after ANY change to a shot: the table holds frame numbers and hand positions.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../../.." && pwd)"; OUT=${1:-/home/user/romeo_work/film/qa/ease}
mkdir -p "$OUT"; cd "$REPO"
build() { NODE_PATH="$REPO/node_modules" node_modules/.bin/esbuild "$HERE/motion.ts" --bundle --platform=node --format=cjs --outfile="$OUT/motion.js" --log-level=error --define:process.env.NODE_ENV='"production"' --banner:js="$(cat scripts/kit/qa/clearance/stub.js)"; }
run() { nice -n 10 node --max-old-space-size=3000 "$OUT/motion.js" "$@" 2>&1 | grep -v "getInputProps\|To hide\|typeof window\|toNonIndexed\|world built" || true; }
build; run "$OUT/raw.json" --raw
python3 "$HERE/make.py" table "$OUT/raw.json" src/videos/romeo/shots/ease.data.ts > "$OUT/table.txt"; tail -4 "$OUT/table.txt"
build; run "$OUT/eased.json"
python3 "$HERE/make.py" check "$OUT/eased.json" > "$OUT/check.txt"; tail -6 "$OUT/check.txt"
