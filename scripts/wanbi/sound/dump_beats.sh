#!/bin/bash
# dump_beats.sh [out.json]   (default /home/user/wanbi_work/sound/beats.json)
# Evaluates src/videos/wanbi/beats.ts + story.ts (esbuild bundle -> node) and writes HIT, TAG, BEAT, HOLD, the shots,
# the lines and the caption groups as JSON, plus PIC = the segment builders' own picture beats (dump_beats.mjs).
# Nothing is written into the repo: the bundle goes beside the output. WANBI_LANG=en: the English film's beats.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${1:-/home/user/wanbi_work/sound/beats.json}"; mkdir -p "$(dirname "$OUT")"
JS="$(dirname "$OUT")/.dump_beats.cjs"
node "$HERE/dump_beats.mjs" "$JS"
node "$JS" > "$OUT.tmp" 2> "$OUT.err" || { echo "dump_beats: the film's beats could not be evaluated:"; grep -v "getInputProps\|typeof window" "$OUT.err" | head -12; rm -f "$OUT.tmp"; exit 1; }
mv "$OUT.tmp" "$OUT"; grep "^dump_beats:" "$OUT.err" || true; rm -f "$OUT.err"
node -e 'const b=require(process.argv[1]);console.log(`beats: ${b.total} frames, ${b.shots.length} shots, ${Object.keys(b.HIT).length} hits, ${Object.keys(b.TAG).length} tags, picture beats ${Object.entries(b.PIC).map(([k,v])=>k+":"+Object.keys(v).length).join(" ")} -> ${process.argv[1]}`)' "$OUT"
