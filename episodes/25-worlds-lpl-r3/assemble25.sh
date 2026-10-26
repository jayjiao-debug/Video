#!/bin/bash
# ep25: render intro (frames 0..618) + Manim film (619..3898), mix, encode. Run from the ep25 folder.
set -e; S=$(pwd); OUT=$S/out; mkdir -p $OUT; rm -rf $S/fr; mkdir -p $S/fr
(cd intro && node ../m2/rec.mjs intro.html $S/fr 0 619) &
(cd m2 && node rec.mjs film.html $S/fr 619 2259) &
(cd m2 && node rec.mjs film.html $S/fr 2259 3899) &
wait
python3 sfx25.py
ffmpeg -y -v error -framerate 30 -i fr/%05d.jpg -c:v libx264 -pix_fmt yuv420p -preset slow -b:v 1500k -pass 1 -an -f mp4 /dev/null
ffmpeg -y -v error -framerate 30 -i fr/%05d.jpg -i mix25.wav -c:v libx264 -pix_fmt yuv420p -preset slow -b:v 1500k -pass 2 -c:a aac -b:a 160k -shortest $OUT/ep25_send.mp4
ffmpeg -y -v error -framerate 30 -i fr/%05d.jpg -i mix25.wav -c:v libx264 -pix_fmt yuv420p -preset slow -crf 16 -c:a aac -b:a 256k -shortest $OUT/ep25_hd.mp4
ls -la $OUT
