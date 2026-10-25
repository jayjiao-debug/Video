#!/bin/bash
# ep44 final v3: join the 4 local segments, encode the HD master and the send version with the final bed.
set -e
S=/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad
D=$S/final44v3; OUT=/home/claude/video/episodes/44-naozi/out; BED=$S/music44/ep44_bed_final.wav
cd $D
printf "file 'local_0_15.mp4'\nfile 'local_15_28.mp4'\nfile 'local_28_96.mp4'\nfile 'local_96_164.5.mp4'\n" > list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i list.txt -c copy pic.mp4
TAGS="-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
VF="scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p"
ffmpeg -loglevel error -y -i pic.mp4 -i $BED -map 0:v -map 1:a -vf "$VF" -c:v libx264 -preset slow -crf 17 -profile:v high $TAGS \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT/你是爱因斯坦的大脑_高清原片.mp4"
ffmpeg -loglevel error -y -i pic.mp4 -i $BED -map 0:v -map 1:a -vf "scale=1280:720:in_range=full:out_range=tv:out_color_matrix=bt709:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -b:v 1250k -maxrate 2000k -bufsize 4000k -profile:v high $TAGS -c:a aac -b:a 160k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT/你是爱因斯坦的大脑_发送版.mp4"
ls -la $OUT/*.mp4
