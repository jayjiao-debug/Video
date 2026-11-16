#!/bin/bash
# One real film frame with overlays, captions and grade (about 30 s), through the machine-wide render queue (q.sh).
#   bash scripts/kit/queue/remotion_still.sh <CompositionId> <frame> <out.png> [extra remotion flags]
#   e.g. --props='{"lang":"en"}'  --props='{"cover":true}'  --scale=1 (default 0.5: 540 wide for a 1080 film)
# KIT_CHROME: the headless Chromium (default: the one installed in this container).
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
cd "$REPO" || exit 2
HS="${KIT_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
comp="$1"; frame="$2"; out="$3"; shift 3
scale="--scale=0.5"; for a in "$@"; do case "$a" in --scale=*) scale="";; esac; done
exec "$HERE/q.sh" 400 npx remotion still src/index.ts "$comp" "$out" --frame="$frame" --gl=swangle $scale --browser-executable=$HS --timeout=600000 --log=error "$@"
