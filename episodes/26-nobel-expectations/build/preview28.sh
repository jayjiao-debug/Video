#!/bin/bash
# preview28.sh out.mp4 "a1 b1" "a2 b2" ...  -> renders each range with its music and joins them
set -e
out=$1; shift; i=0; list=""
for r in "$@"; do i=$((i+1)); set -- $r
  REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/film28.mjs video pv_$i.mp4 $1 $2 > /dev/null 2>&1
  d=$(python3 -c "print($2-$1)")
  ffmpeg -v error -y -i pv_$i.mp4 -ss $1 -t $d -i /home/claude/diji/public/bgm.mp3 -filter_complex "[1:a]afade=t=in:d=0.2,afade=t=out:st=$(python3 -c "print($d-0.4)"):d=0.4[a]" -map 0:v -map "[a]" -c:v libx264 -crf 20 -preset fast -c:a aac -b:a 160k -shortest pvm_$i.mp4
  list="$list file 'pvm_$i.mp4'\n"
done
printf "$list" > pv_list.txt; ffmpeg -v error -y -f concat -safe 0 -i pv_list.txt -c copy $out; rm -f pv_*.mp4 pvm_*.mp4 pv_list.txt
