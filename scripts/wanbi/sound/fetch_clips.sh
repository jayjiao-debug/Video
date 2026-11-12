#!/bin/bash
# fetch_clips.sh [clips dir]   (default /home/user/wanbi_work/sound/clips)
# The effect clips the Wanbi mix uses, from the voice-output branch of jayjiao-debug/video (nothing goes into the repo):
#   out/hongmen-sfx-01..03  as they are (whoosh_1.mp3, jade_r3.mp3, ...)
#   out/arthur-sfx-01..03   with the prefix arthur_ (arthur_crown_2.mp3, ...)
#   out/wanbi-sfx-01..      with the prefix wanbi_  (wanbi_drone_1.mp3, ...): the sounds the two libraries lack
#                           (scripts/wanbi/sound/make_request.py)
# Each round's report.json is kept beside as <id>.report.json (what was asked, the AudioSet tags). Files already there
# are not fetched again. Then: python3 scripts/kit/sound/measure.py <clips dir> <clips dir>/*.report.json
set -euo pipefail
CLIPS="${1:-/home/user/wanbi_work/sound/clips}"; mkdir -p "$CLIPS"
R="repos/jayjiao-debug/video/contents/out"
for id in hongmen-sfx-01 hongmen-sfx-02 hongmen-sfx-03 arthur-sfx-01 arthur-sfx-02 arthur-sfx-03 ${WANBI_SFX:-wanbi-sfx-01 wanbi-sfx-02 wanbi-sfx-03}; do
  case "$id" in arthur-*) pre=arthur_;; wanbi-*) pre=wanbi_;; *) pre=;; esac
  names=$(gh api "$R/$id?ref=voice-output" --jq '.[] | select((.name|endswith(".mp3")) or .name=="report.json") | .name' 2>/dev/null) || { echo "fetch_clips: $id is not on voice-output (yet)"; continue; }
  k=0
  for f in $names; do
    dst="$CLIPS/$pre$f"; [ "$f" = report.json ] && dst="$CLIPS/$id.report.json"
    [ -s "$dst" ] || { gh api "$R/$id/$f?ref=voice-output" -H "Accept: application/vnd.github.raw" > "$dst.part" && mv "$dst.part" "$dst"; k=$((k+1)); }
  done
  echo "fetch_clips: $id: $(echo "$names" | wc -w) files, $k new"
done
