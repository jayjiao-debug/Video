#!/bin/bash
# Render the whole 林冲 film in 2 parallel segments, then mux the mix and encode the master + send version.
#   bash film/assemble.sh <workdir> <name> <mix.wav> [segments]
# Output: <workdir>/<name>_高清原片.mp4 (x264 crf 17, AAC 256k) and <workdir>/<name>_发送版.mp4 (1280x720, < 30 MB).
set -e
D=${1:-/dev/shm/shz01/out}; N=${2:-林冲_v1}; MIX=${3:-/dev/shm/shz01/audio/mix_final.wav}; SEGS=${4:-2}
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$D"
NF=4455
STEP=$(( (NF + SEGS - 1) / SEGS ))
PIDS=()
for ((i = 0; i < SEGS; i++)); do
  F0=$(( i * STEP )); F1=$(( F0 + STEP )); [ $F1 -gt $NF ] && F1=$NF
  (cd "$HERE" && node render.mjs video "$D/seg$i.mp4" $F0 $F1 > "$D/seg$i.log" 2>&1) &
  PIDS+=($!)
done
for p in "${PIDS[@]}"; do wait $p; done
: > "$D/list.txt"
for ((i = 0; i < SEGS; i++)); do echo "file '$D/seg$i.mp4'" >> "$D/list.txt"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$D/list.txt" -c copy "$D/picture.mp4"
ffmpeg -y -loglevel error -i "$D/picture.mp4" -i "$MIX" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -t 148.5 -movflags +faststart "$D/${N}_高清原片.mp4"
ffmpeg -y -loglevel error -i "$D/${N}_高清原片.mp4" -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -b:v 1250k -maxrate 1700k -bufsize 2500k -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 160k -ar 48000 -ac 2 -movflags +faststart "$D/${N}_发送版.mp4"
ls -la "$D"/*.mp4
