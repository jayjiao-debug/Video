#!/bin/bash
# Headless clearance (clipping) checker of the Hongmen film. See README.md next to this file.
#   bash scripts/hongmen/qa/clearance/run.sh                    whole film -> /home/user/hm_work/qa/clearance/{A..E}.json/.txt
#   bash scripts/hongmen/qa/clearance/run.sh --seg D            one segment (or --seg C,D)
#   bash scripts/hongmen/qa/clearance/run.sh --from 1400 --to 1500 [--tol 1] [--step 1] [--out DIR] [--seed] [--quiet]
# Runs niced (the machine's cores belong to the renders); no GL, no browser, nothing is drawn.
set -e
cd /home/user/jayjiao-debug/video
HERE=scripts/hongmen/qa/clearance
B=${CLEARANCE_BUILD:-/tmp/hm_clearance_$(id -u)}
mkdir -p "$B"
node_modules/.bin/esbuild $HERE/check.ts --bundle --platform=node --format=cjs --outfile="$B/check.js" --log-level=error \
  --define:process.env.NODE_ENV='"production"' --banner:js="$(cat $HERE/stub.js)"
exec nice -n 10 node --max-old-space-size=3000 "$B/check.js" "$@" 2> >(grep -v "getInputProps\|To hide this\|typeof window" >&2) | grep -v "getInputProps\|To hide this\|typeof window"
