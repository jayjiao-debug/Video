#!/bin/bash
# final47.sh <tag>  — out/<tag>_pic.mp4 + audio/bed_v2.wav → out/<tag>.mp4 (mixed), out/<tag>_上传版.mp4 (upload master:
# ≥ 8 Mbps, −14 LUFS, ≤ −1.5 dBTP) and out/<tag>_发送版.mp4 (720p, < 28 MB, for chat)
set -e
TAG=$1; EP=/home/claude/video/episodes/47-dingqing; OUT=$EP/out; PIC=$OUT/${TAG}_pic.mp4; BED=$EP/audio/bed_v2.wav
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$PIC")
ffmpeg -loglevel error -y -i "$PIC" -i "$BED" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a pcm_s24le -t "$D" "$OUT/${TAG}_mix.mov"
ffmpeg -loglevel error -y -i "$OUT/${TAG}_mix.mov" -c:v copy -c:a aac -b:a 320k -movflags +faststart "$OUT/${TAG}.mp4"
python3 /home/claude/video/.claude/skills/production-crew/scripts/upload_master.py "$OUT/${TAG}.mp4" --out "$OUT/${TAG}_上传版.mp4" --keep
# chat version: 1280x720, 2-pass to ~27 MB
VB=$(python3 -c "print(int((27*8*1024*1024/ $D - 160000)/1000))")k
TMP=$(mktemp -d); cd $TMP
ffmpeg -loglevel error -y -i "$OUT/${TAG}_上传版.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -b:v $VB -pass 1 -an -f null /dev/null
ffmpeg -loglevel error -y -i "$OUT/${TAG}_上传版.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -b:v $VB -pass 2 -c:a aac -b:a 160k -movflags +faststart "$OUT/${TAG}_发送版.mp4"
cd - >/dev/null; rm -rf $TMP "$OUT/${TAG}_mix.mov"
ls -la "$OUT/${TAG}.mp4" "$OUT/${TAG}_上传版.mp4" "$OUT/${TAG}_发送版.mp4"
ffmpeg -hide_banner -i "$OUT/${TAG}_发送版.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak"
