#!/bin/bash
# usage: frames.sh <preview-entry.ts> <outdir> <frames> [w h]   the entry must pass `frames` to rigLab
set -e
E=$1; O=$2; N=$3; shift 3
if [ -n "$2" ]; then exec node "$(dirname "$0")/render.mjs" "$E" "$O" --frames "$N" --size "$1x$2"; fi
exec node "$(dirname "$0")/render.mjs" "$E" "$O" --frames "$N"
