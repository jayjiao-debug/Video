#!/bin/bash
# usage: pick.sh <preview-entry.ts> <outdir> <w> <h> <frame> [frame ...]   renders only the listed frames
set -e
E=$1; O=$2; W=$3; H=$4; shift 4
exec node "$(dirname "$0")/render.mjs" "$E" "$O" --pick "$(echo "$*" | tr ' ' ',')" --size "${W}x${H}"
