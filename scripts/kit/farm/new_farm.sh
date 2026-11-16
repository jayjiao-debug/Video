#!/bin/bash
# Prepares the farm files of a new film's render-farm-<film> branch. Writes FILES ONLY, into a folder outside the repo;
# it creates no branch, commits nothing, pushes nothing (the repo is public: pushing is the owner's call). README.md.
#   bash scripts/kit/farm/new_farm.sh --film arthur2 [--comp Arthur2Film] [--end 2091] [--chunks 20] [--out /tmp/farm_arthur2]
#        --comp / --end default to kit.json's composition and story.ts TOTAL - 1 when src/videos/<film>/kit.json exists.
# Writes <out>/.github/workflows/render-<film>.yml (from render-film.yml.tmpl) and <out>/render.json, then prints the
# git commands that make the branch from them.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../../.." && pwd)"
film=""; comp=""; end=""; chunks=20; out=""
while [ $# -gt 0 ]; do case "$1" in
  --film) film="$2"; shift 2;; --comp) comp="$2"; shift 2;; --end) end="$2"; shift 2;;
  --chunks) chunks="$2"; shift 2;; --out) out="$2"; shift 2;; *) echo "unknown argument $1" >&2; exit 2;; esac; done
[[ "$film" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "--film <name> (lower case letters, digits, -)" >&2; exit 2; }
cfg="$REPO/src/videos/$film/kit.json"
if [ -z "$comp" ] && [ -f "$cfg" ]; then comp=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["composition"])' "$cfg"); fi
if [ -z "$end" ] && [ -f "$cfg" ]; then
  dir=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["dir"])' "$cfg")
  js=$(mktemp /tmp/kit_total.XXXX.cjs)
  echo "import { TOTAL } from \"$REPO/$dir/story\"; console.log(TOTAL);" | (cd "$REPO" && node_modules/.bin/esbuild --bundle --platform=node --format=cjs --log-level=error \
    --banner:js='for (const k of ["document","Image","OffscreenCanvas"]) if (typeof globalThis[k]==="undefined") globalThis[k]=new Proxy(function(){},{get:(t,p)=>p===Symbol.toPrimitive?()=>0:t,apply:()=>({}),construct:()=>({})});' > "$js")
  end=$(( $(node "$js" 2>/dev/null | tail -1) - 1 )) || true; rm -f "$js"
fi
[ -n "$comp" ] && [ -n "$end" ] || { echo "give --comp and --end (no readable src/videos/$film/kit.json)" >&2; exit 2; }
out="${out:-/tmp/kit_farm_$film}"
mkdir -p "$out/.github/workflows"
sed "s/__FILM__/$film/g" "$HERE/render-film.yml.tmpl" | grep -v "^# TEMPLATE\|^# on the film's render-farm\|outside .github/workflows, so that it never runs" > "$out/.github/workflows/render-$film.yml"
printf '{"id":"%s-01","composition":"%s","start":0,"end":%s,"chunks":%s,"concurrency":1,"timeout":900000,"output":"%s_v1","flags":"--crf=14"}\n' \
  "$film" "$comp" "$end" "$chunks" "$film" > "$out/render.json"
echo "wrote $out/.github/workflows/render-$film.yml and $out/render.json ($comp, frames 0-$end, $chunks chunks)"
cat <<TXT

To make the farm branch (only with the owner's go-ahead: the repo is public, and the push starts a render):
  git switch -c render-farm-$film <the film's branch>
  cp -r $out/.github $out/render.json .
  git add .github/workflows/render-$film.yml render.json && git commit -m "farm: render the $film film ($comp, frames 0-$end, $chunks chunks)"
  git push -u origin render-farm-$film            # the push of render.json starts the run
Each later render: change render.json (a new "id" and "output"; e.g. "flags": "--crf=14 --props={\\"lang\\":\\"en\\"}"), commit, push.
When it is done: git fetch origin render-output-$film && git show origin/render-output-$film:result.json, then
  mkdir -p /home/user/${film}_work      # outside the repo: never write the video into the (public) repo
  for p in \$(git ls-tree --name-only origin/render-output-$film | grep part); do git show origin/render-output-$film:\$p; done > /home/user/${film}_work/picture.mp4
  bash scripts/kit/sound/mux.sh /home/user/${film}_work/picture.mp4 <the film's mix_48k.wav> /home/user/${film}_work/${film}_final_1080.mp4
TXT
