#!/bin/bash
# Renders every picture of the character design sheet (gate 1) into <out dir>, one at a time through the queue.
#   bash src/videos/romeo/preview/design_sheet.sh <abs out dir>
# Then: python3 src/videos/romeo/preview/design_sheet.py <abs out dir> <abs sheet dir>
OUT="$1"; [ -z "$OUT" ] && { echo "usage: design_sheet.sh <abs out dir>"; exit 2; }
mkdir -p "$OUT"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$HERE/../../../.." && pwd)"; cd "$REPO" || exit 2
E=src/videos/romeo/preview/people_lineup.ts; FONT="$REPO/public/bt/sans700.ttf"
BG='"bg":"#efe3c8","ground":"#d8c6a2"'
r() { # name size opts
  local w="${2%x*}" h="${2#*x}"
  bash scripts/kit/queue/still.sh $E "$OUT/$1.png" --size "$2" --opts "{\"font\":\"$FONT\",\"w\":$w,\"h\":$h,$BG,$3}" > "$OUT/$1.log" 2>&1
  grep -E "RULE|FAILED|rror" "$OUT/$1.log" | head -5; grep -E "^wrote" "$OUT/$1.log"
}
HERO='[{"who":"romeo","hands":[[-0.2,0.95,0.14],[0.04,0.87,0.115]],"tilt":-6,"expr":"puppy"},{"who":"juliet","hands":[[-0.105,0.64,0.03],[0.2,0.78,0.16]],"expr":"bossy","tilt":4},{"who":"friar","hands":[[-0.16,0.93,0.1],null],"expr":"weary"}]'
LINE='"gap":0.9,"margin":1.15,"tall":1.8,"cy":0.87,"fov":24'
r hero 1800x1400 "$LINE,\"slots\":$HERO"
r hero_black 1800x1400 "$LINE,\"slots\":$HERO,\"black\":true,\"raw\":true"
r turn34 1800x1400 "$LINE,\"view\":\"34\""
r back 1800x1400 "$LINE,\"slots\":[{\"who\":\"romeo\",\"facing\":3.14159,\"turn\":1},{\"who\":\"juliet\",\"facing\":3.14159,\"turn\":1},{\"who\":\"friar\",\"facing\":3.14159,\"turn\":1}]"
EX='"gap":0.64,"noGround":true'
r ex_romeo 2000x606 "$EX,\"camPose\":{\"pos\":[0,1.34,2.35],\"look\":[0,1.3,0],\"fov\":24},\"slots\":[{\"who\":\"romeo\",\"expr\":\"puppy\"},{\"who\":\"romeo\",\"expr\":\"dreamy\",\"tilt\":-6},{\"who\":\"romeoCry\",\"expr\":\"wail\"},{\"who\":\"romeo\",\"expr\":\"blank\"},{\"who\":\"romeo\",\"expr\":\"hollow\"}]"
r ex_juliet 2000x606 "$EX,\"camPose\":{\"pos\":[0,1.2,2.35],\"look\":[0,1.14,0],\"fov\":24},\"slots\":[{\"who\":\"juliet\",\"expr\":\"sure\"},{\"who\":\"juliet\",\"expr\":\"bossy\"},{\"who\":\"juliet\",\"expr\":\"swoon\",\"tilt\":5},{\"who\":\"juliet\",\"expr\":\"caught\"},{\"who\":\"juliet\",\"expr\":\"brave\"}]"
r ex_friar 2000x606 "$EX,\"camPose\":{\"pos\":[0,1.22,2.35],\"look\":[0,1.16,0],\"fov\":24},\"slots\":[{\"who\":\"friar\",\"expr\":\"weary\"},{\"who\":\"friar\",\"expr\":\"dry\"},{\"who\":\"friar\",\"expr\":\"worried\"},{\"who\":\"friar\",\"expr\":\"warn\"},{\"who\":\"friar\",\"expr\":\"caught\"}]"
r options 2000x606 "$EX,\"camPose\":{\"pos\":[0,1.24,2.35],\"look\":[0,1.18,0],\"fov\":24},\"slots\":[{\"who\":\"romeo\"},{\"who\":\"romeoBare\"},{\"who\":\"friar\"},{\"who\":\"friarGoatee\"},{\"who\":\"friarBare\"}]"
# the interview frame: one figure, 9:16, as the reporter's camera sees them
B='"gap":0.6,"fov":30'
r bust_romeo 720x1280 "$B,\"camPose\":{\"pos\":[0,1.3,1.9],\"look\":[0,1.2,0],\"fov\":30},\"slots\":[{\"who\":\"romeo\",\"hands\":[[-0.19,1.0,0.16],[0.04,0.89,0.115]],\"tilt\":-6,\"expr\":\"puppy\"}]"
r bust_juliet 720x1280 "$B,\"camPose\":{\"pos\":[0,1.2,1.75],\"look\":[0,1.1,0],\"fov\":30},\"slots\":[{\"who\":\"juliet\",\"hands\":[[-0.105,0.64,0.03],[0.2,0.8,0.16]],\"expr\":\"bossy\",\"tilt\":4}]"
r bust_friar 720x1280 "$B,\"camPose\":{\"pos\":[0,1.22,1.75],\"look\":[0,1.12,0],\"fov\":30},\"slots\":[{\"who\":\"friar\",\"hands\":[[-0.16,0.95,0.1],null],\"expr\":\"dry\"}]"
