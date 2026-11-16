#!/bin/bash
# remux.sh <video.mp4> <audio.wav> <out.mp4> [audio_kbps=160]
# Keeps the video stream as it is and swaps the sound for an already mastered track (no loudness processing here).
# The audio is padded / cut to the picture's length and written as stereo (the mono track on both channels at full
# level: what a player does with a mono file anyway, so the loudness figure below is the one other videos are measured by;
# a mono file of the same sound reads 3 LU lower). Prints size, frames, duration, loudness and true peak.
set -euo pipefail
V=$1; A=$2; OUT=$3; KB=${4:-160}
VDUR=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$V" | head -1 | cut -d, -f1)
ffmpeg -hide_banner -loglevel error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -af "apad=whole_dur=$VDUR,pan=stereo|c0=c0|c1=c0" -t "$VDUR" -c:a aac -b:a ${KB}k -ar 48000 -movflags +faststart "$OUT"
n=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$OUT" | head -1 | cut -d, -f1)
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
l=$(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A16 "Summary" | grep -E "I:|Peak:" | tr -s ' ' | tr '\n' ' ')
echo "$(basename "$OUT"): $(du -m "$OUT" | cut -f1) MB, $n frames, $d s, $l"
