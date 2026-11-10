#!/bin/bash
# usage: shot.sh <preview-entry.ts> <out.png> [render.mjs options]   one still (see render.mjs)
exec node "$(dirname "$0")/render.mjs" "$@"
