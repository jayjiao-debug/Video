#!/bin/bash
# final_v3.sh <picture.mp4> <tag>   → out/三千年_<tag>.mp4 (HD master) + out/三千年_<tag>_发送版.mp4 (< 30 MB)
set -e
PIC=$1; TAG=$2; EP=/home/claude/video/episodes/41-sanqiannian; OUT=$EP/out; MIX=$EP/audio/ep41_v3_mix.wav; TGT=${LUFS:--15}
mkdir -p $OUT; TMP=$(mktemp -d)
J=$(ffmpeg -hide_banner -i $MIX -af loudnorm=I=$TGT:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
read II ITP ILRA ITH OFF <<< "$mi"
ffmpeg -loglevel error -y -i $MIX -af loudnorm=I=$TGT:TP=-1.0:LRA=11:measured_I=$II:measured_TP=$ITP:measured_LRA=$ILRA:measured_thresh=$ITH:offset=$OFF:linear=true,aresample=48000 -c:a pcm_s24le $TMP/a.wav
ffmpeg -loglevel error -y -i $PIC -i $TMP/a.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT/三千年_$TAG.mp4"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/三千年_$TAG.mp4")
VB=$(python3 -c "print(int((${SEND_MIB:-26.5}*8*1024*1024/ $D - 128000)/1000))")k
cd $TMP && ffmpeg -loglevel error -y -i $PIC -c:v libx264 -preset slow -b:v $VB -pass 1 -an -f null /dev/null && ffmpeg -loglevel error -y -i $PIC -i $TMP/a.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v $VB -pass 2 -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT/三千年_${TAG}_发送版.mp4"
ls -la "$OUT/三千年_$TAG.mp4" "$OUT/三千年_${TAG}_发送版.mp4"; ffmpeg -hide_banner -i "$OUT/三千年_${TAG}_发送版.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak"
rm -rf $TMP
