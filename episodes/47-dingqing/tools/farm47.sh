#!/bin/bash
# farm47.sh <name> <startFrame> <endFrame> [chunks]
# Sync the ep47 sources into the render-farm checkout, push render.json, wait for render-output to carry our id,
# then join the parts into episodes/47-dingqing/out/<name>_pic.mp4. Retries if another job cancels ours (the farm
# workflow uses cancel-in-progress). gh isn't authorised here, so we poll the render-output branch with git.
set -u
NAME=$1; A=$2; B=$3; CH=${4:-20}
SRC=/home/claude/video/episodes/37-qiqing/remotion/src
FARM=/home/claude/vibe-render
OUT=/home/claude/video/episodes/47-dingqing/out; mkdir -p $OUT
sync() {
  cd $FARM
  git fetch -q origin render-farm && git reset -q --hard origin/render-farm
  mkdir -p src/qq47 src/qq44 src/qq42 src/qq
  cp $SRC/qq47/*.ts* src/qq47/
  cp $SRC/qq44/figure44.tsx $SRC/qq44/kit44.tsx src/qq44/
  cp $SRC/qq42/kit42.tsx src/qq42/
  cp $SRC/qq/gaits.ts src/qq/
  printf "// Remotion entry (the render farm requires this file to mention registerRoot): ./qq47/film47 calls registerRoot() itself.\nimport './qq47/film47';\n" > src/index.ts
}
for attempt in 1 2 3 4; do
  sync
  ID="$NAME-$(date +%s)"
  printf '{\n  "id": "%s",\n  "composition": "FILM47",\n  "start": %s,\n  "end": %s,\n  "chunks": %s,\n  "output": "%s"\n}\n' "$ID" "$A" "$B" "$CH" "$NAME" > render.json
  git add -A && git commit -qm "render $NAME (FILM47 $A-$B)" && git push -q origin HEAD:render-farm || { echo "push failed, retry"; sleep 20; continue; }
  echo "pushed $ID ($(git rev-parse --short HEAD)) attempt $attempt"
  T0=$(date +%s); OK=0
  while [ $(( $(date +%s) - T0 )) -lt 3000 ]; do
    sleep 45
    # our job got cancelled if someone else pushed a newer render.json to render-farm
    git fetch -q origin render-farm 2>/dev/null
    CUR=$(git show origin/render-farm:render.json 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])" 2>/dev/null)
    git fetch -q --depth 1 origin render-output 2>/dev/null
    RID=$(git show FETCH_HEAD:result.json 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])" 2>/dev/null)
    echo "$(( $(date +%s) - T0 ))s farm=$CUR output=$RID"
    if [ "$RID" = "$ID" ]; then OK=1; break; fi
    if [ -n "$CUR" ] && [ "$CUR" != "$ID" ]; then echo "superseded by $CUR; waiting for it to finish before retrying";
      while [ $(( $(date +%s) - T0 )) -lt 3000 ]; do sleep 60; git fetch -q --depth 1 origin render-output; R2=$(git show FETCH_HEAD:result.json 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])" 2>/dev/null); [ "$R2" = "$CUR" ] && break; done
      break; fi
  done
  if [ $OK = 1 ]; then
    TMP=$(mktemp -d); git -C $TMP init -q; git -C $TMP fetch -q --depth 1 https://github.com/jayjiao-debug/video render-output
    git -C $TMP checkout -q FETCH_HEAD
    cat $TMP/$NAME.mp4.part* > $OUT/${NAME}_pic.mp4; rm -rf $TMP
    ls -la $OUT/${NAME}_pic.mp4; ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 $OUT/${NAME}_pic.mp4
    echo FARM_DONE; exit 0
  fi
done
echo FARM_FAILED; exit 1
