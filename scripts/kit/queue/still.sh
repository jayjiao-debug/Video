#!/bin/bash
# One render at a time on this machine (parallel renders crash). Usage:
#   bash scripts/kit/queue/still.sh <entry.ts> <out.png | outdir> [render.mjs options...]
# Wraps scripts/rig3d/render.mjs (the three.js harness: any film's preview entry) with the machine-wide render queue,
# the house font and a 100 s page timeout. Run from anywhere; relative paths are taken from the REPO (this script cd's
# there), so give an absolute out path when you mean somewhere else. Long frame sequences (--pick / --frames with more
# than ~40 frames) must be started in the background.
#
# THE QUEUE (q.sh next to this file): waiting jobs are ordered SHORTEST FIRST:
#   cost = 10 s + frames x 1.4 s (540 wide) or x 6 s (1080 wide); film segment previews (preview/film*.ts) count half;
#   every second of waiting takes 0.2 s off, so a long job is delayed, never starved.
# So: small batches at 540x960 start within a minute or two; 1080x1920 sheets and long sequences wait. Render at
# 540x960 unless you truly need 1080, and never more frames than you will look at.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
cd "$REPO" || exit 2
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
has_opts=0; has_to=0
for a in "$@"; do [ "$a" = "--opts" ] && has_opts=1; [ "$a" = "--timeout" ] && has_to=1; done
extra=()
[ $has_opts = 0 ] && extra+=(--opts "{\"font\":\"$REPO/public/bt/sans700.ttf\"}")
[ $has_to = 0 ] && extra+=(--timeout 100)

# ---- cost estimate
n=1; per=14; prev=""
for a in "$@"; do
  case "$prev" in
    --pick) c="${a//[^,]/}"; n=$(( ${#c} + 1 ));;
    --frames) [[ "$a" =~ ^[0-9]+$ ]] && n=$a;;
    --size) [[ "$a" == 1080x* || "$a" == *x1920 ]] && per=60;;
  esac
  prev="$a"
done
case "$*" in *1080*) per=60;; esac
cost=$(( 100 + n * per ))                       # tenths of a second
case "$1" in *preview/film*.ts|*/seg/*) cost=$(( cost / 2 ));; esac

exec "$HERE/q.sh" "$cost" node scripts/rig3d/render.mjs "$@" "${extra[@]}"
