#!/bin/bash
# finish46.sh <picture.mp4> <tag>
# → /tmp/claude-0/r46/汉柏的孩子_<tag>.mp4 (HD master: picture + the ep46 bed, −14 LUFS, TP ≤ −1.5)
# → /tmp/claude-0/r46/汉柏的孩子_<tag>_发送版.mp4 (≤ 28 MB, 2-pass) ; then the QA numbers.
# Videos and the BGM never go into git (public repo).
set -e
PIC=$1; TAG=$2; OUT=/tmp/claude-0/r46; BED=/home/claude/video/episodes/46-hanbai/audio/ep46_bed_v1.wav
[ -f $BED ] || python3 /home/claude/video/episodes/46-hanbai/music/build46.py
mkdir -p $OUT; TMP=$(mktemp -d)
J=$(ffmpeg -hide_banner -i $BED -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
read II ITP ILRA ITH OFF <<< "$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
ffmpeg -loglevel error -y -i $BED -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$II:measured_TP=$ITP:measured_LRA=$ILRA:measured_thresh=$ITH:offset=$OFF:linear=true,aresample=48000 -c:a pcm_s24le $TMP/a.wav
M="$OUT/汉柏的孩子_$TAG.mp4"; S="$OUT/汉柏的孩子_${TAG}_发送版.mp4"
ffmpeg -loglevel error -y -i $PIC -i $TMP/a.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -movflags +faststart "$M"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$M")
VB=$(python3 -c "print(int((26.5*8*1024*1024/ $D - 130000)/1000))")k
cd $TMP && ffmpeg -loglevel error -y -i $PIC -c:v libx264 -preset slow -b:v $VB -pass 1 -an -f null /dev/null && \
  ffmpeg -loglevel error -y -i $PIC -i $TMP/a.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v $VB -pass 2 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$S"
ls -la "$M" "$S"
for f in "$M" "$S"; do ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E " I:|Peak:" | tr -s ' '; done
ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$M"
rm -rf $TMP
