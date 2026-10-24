#!/bin/bash
# farm46.sh <output_name> [start_frame] [end_frame] [chunks]
# Render ep46 (FILM46) on the GitHub Actions render farm (render-farm branch of jayjiao-debug/Video) and fetch the
# picture into /tmp/claude-0/r46/<output_name>_pic.mp4. Polls the render-output branch (gh CLI is not authenticated
# in this sandbox, so no check-runs API). Music never goes to the farm.
set -e
OUT=$1; S=${2:-0}; E=${3:-4692}; CH=${4:-20}
SRC=/home/claude/video/episodes/37-qiqing/remotion; FARM=/home/claude/vibe-render
[ -d $FARM ] || git clone -q --depth 1 --branch render-farm https://github.com/jayjiao-debug/Video $FARM
cd $FARM && git fetch -q --depth 1 origin render-farm && git reset -q --hard origin/render-farm
for d in qq qq42 qq44 qq46; do rm -rf src/$d; cp -r $SRC/src/$d src/$d; done
printf "// Remotion entry (the render farm requires this file to mention registerRoot): ./qq46/FILM46 calls registerRoot() itself.\nimport './qq46/FILM46';\n" > src/index.ts
cp $SRC/package.json $SRC/package-lock.json $SRC/tsconfig.json .
ID="$OUT-$(date +%s)"
printf '{\n  "id": "%s",\n  "composition": "FILM46",\n  "start": %s,\n  "end": %s,\n  "chunks": %s,\n  "output": "%s"\n}\n' "$ID" "$S" "$E" "$CH" "$OUT" > render.json
git add -A && git commit -qm "render $OUT (FILM46 $S-$E)" && git push -q origin HEAD:render-farm
echo "pushed job $ID"
T0=$(date +%s); TMP=/tmp/claude-0/render-output
while true; do
  sleep 45
  rm -rf $TMP; git clone -q --depth 1 --branch render-output https://github.com/jayjiao-debug/Video $TMP 2>/dev/null || true
  GOT=$(python3 -c "import json;print(json.load(open('$TMP/result.json'))['id'])" 2>/dev/null || echo none)
  echo "$(( $(date +%s) - T0 ))s render-output holds: $GOT"
  [ "$GOT" = "$ID" ] && break
  [ $(( $(date +%s) - T0 )) -gt 3600 ] && { echo "timed out"; exit 1; }
done
mkdir -p /tmp/claude-0/r46; cat $TMP/$OUT.mp4.part* > /tmp/claude-0/r46/${OUT}_pic.mp4
ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 /tmp/claude-0/r46/${OUT}_pic.mp4
rm -rf $TMP
