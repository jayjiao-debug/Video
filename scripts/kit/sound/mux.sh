#!/bin/bash
# mux.sh <silent picture.mp4> <mix_48k.wav> <out.mp4> [audio kbps = 160]
# Puts the finished mix on the silent picture. The picture stream is copied; the sound is neither padded nor trimmed:
# the 48 kHz mix is exactly the film's length (2092 frames x 1600 samples), so no -shortest, no apad, no -t.
# -movie_timescale 48000: the mp4's own clock counts in audio samples; with ffmpeg's default (1/1000 s) the sound's
# edit would be rounded down to the millisecond (16 samples short of the picture).
# The mono mix goes to both channels at full level (what a player does with a mono file), AAC, 48 kHz.
# -aac_pns 0: ffmpeg's AAC encoder otherwise replaces noise-like bands by generated noise, DIFFERENT in each channel
# (left and right of this mono mix then differ by up to -12 dBFS above 4 kHz); without it the two channels are the same
# to -47 dBFS. The last line printed is that difference.
# Prints frames, samples, duration, loudness (stereo reading) and true peak of the result, and FAILS if the picture
# and the sound are not the same length.
set -euo pipefail
V=$1; A=$2; OUT=$3; KB=${4:-160}
ffmpeg -hide_banner -loglevel error -y -i "$V" -i "$A" -map 0:v:0 -map 1:a:0 -c:v copy -af "pan=stereo|c0=c0|c1=c0" -c:a aac -aac_pns 0 -b:a ${KB}k -ar 48000 -movie_timescale 48000 -movflags +faststart "$OUT"
vf=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$OUT" | head -1 | cut -d, -f1)
fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$OUT" | head -1 | cut -d, -f1)
as=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration_ts -of csv=p=0 "$OUT" | head -1 | cut -d, -f1)
l=$(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A16 "Summary" | grep -E "I:|Peak:" | tr -s ' ' | tr '\n' ' ')
want=$(python3 -c "from fractions import Fraction as F; print(int($vf * 48000 / F('$fps')))")
echo "$(basename "$OUT"): $vf frames at $fps fps, audio $as samples at 48 kHz (the picture's length is $want samples), $l"
[ "$as" = "$want" ] || { echo "MISMATCH: the sound is not exactly as long as the picture"; exit 1; }
lr=$(ffmpeg -hide_banner -nostats -i "$OUT" -af "pan=mono|c0=0.5*c0-0.5*c1,astats=metadata=0:measure_perchannel=none:measure_overall=Peak_level" -f null - 2>&1 | grep "Peak level" | tail -1 | sed 's/.*: //' | awk '{printf "%.1f", $1}')
echo "left minus right: peak $lr dBFS (the two channels carry the same sound when this is under -40)"
