#!/bin/bash
# THE ONE COMMAND that rebuilds the Hongmen film's sound after a beat moved (or a cue / a clip changed):
#     bash /home/user/jayjiao-debug/video/scripts/hongmen/sound/build.sh            # -> /home/user/hm_work/sound/mix_v1.*
#     bash .../build.sh --publish                                                   # also copies the finals to the library (the mix,
#                                                                                   # its 48 kHz copy = the file to mux, the two mp3s)
#     bash .../build.sh --lang en                                                   # THE ENGLISH VERSION: the same cues and clips with
#                                                                                   # the English narration -> /home/user/hm_work/en/mix_en.*
#        (defaults then: NARR=/home/user/hm_work/en/narration_en.wav  TIMING=/home/user/hm_work/en/en_timing.json  NAME=mix_en
#         OUT=/home/user/hm_work/en  MIXARGS="--lufs -15.0"; --publish is refused: the library folder holds the Chinese finals. See scripts/hongmen/en/README.md)
# Steps: 1. dump_beats.sh evaluates src/videos/hongmen/beats.ts + story.ts -> beats.json (HIT, TAG, BEAT, the shots)
#           and the animated segments' own picture beats (PIC.A.x = segA.ts T.x, PIC.B.x = segB.ts B.x)
#        2. mix.py resolves cues.json against it and mixes narration + effects + beds (stems, cue table, log)
#        3. mp3 of the mix, and the mix twice in a row (to listen to the loop)
#        4. verify.py: length to the sample, loudness, true peak, the loop joint
# Environment (all optional): NAME=mix_v1  WORK=/home/user/hm_work/sound  CLIPS=$WORK/clips  OUT=$WORK (where the mix goes)
#   NARR=/home/user/hm_work/voice/v4/narration_v4.wav  TIMING=/home/user/hm_work/voice/v4/voice_timing_v4.json
#   MIXARGS="--sfx-db -2 --bed-db 0 --lufs -14.5 --guard 3"   PUB=/mnt/project-files/next-video/hongmen/audio
# Nothing is written into the repo (it is public: no audio there).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
HMLANG=zh; PUBLISH=0
while [ $# -gt 0 ]; do case "$1" in --lang) HMLANG="$2"; shift 2;; --publish) PUBLISH=1; shift;; *) echo "build.sh: unknown argument $1" >&2; exit 2;; esac; done
if [ "$HMLANG" = "en" ]; then
  [ "$PUBLISH" = 1 ] && { echo "build.sh: --publish is for the Chinese finals only" >&2; exit 2; }
  NAME="${NAME:-mix_en}"; NARR="${NARR:-/home/user/hm_work/en/narration_en.wav}"; TIMING="${TIMING:-/home/user/hm_work/en/en_timing.json}"; OUT="${OUT:-/home/user/hm_work/en}"
  MIXARGS="${MIXARGS:---lufs -15.0}"   # the English voice has taller peaks: at -15.0 its limiter works about as hard as the Chinese one at -14.5 (as Arthur's English)
fi
NAME="${NAME:-mix_v1}"; WORK="${WORK:-/home/user/hm_work/sound}"; CLIPS="${CLIPS:-$WORK/clips}"; OUT="${OUT:-$WORK}"
NARR="${NARR:-/home/user/hm_work/voice/v4/narration_v4.wav}"; TIMING="${TIMING:-/home/user/hm_work/voice/v4/voice_timing_v4.json}"
PUB="${PUB:-/mnt/project-files/next-video/hongmen/audio}"; MIXARGS="${MIXARGS:-}"
mkdir -p "$WORK" "$OUT"; O="$OUT/$NAME"
# the English picture's beats differ a little (segB/segE follow the English quote times): its own beats file, never the Chinese one
BEATS="$WORK/beats.json"; [ "$HMLANG" = "en" ] && BEATS="$OUT/beats_en.json"
HM_LANG="$HMLANG" bash "$HERE/dump_beats.sh" "$BEATS"
python3 "$HERE/mix.py" "$NARR" "$BEATS" "$HERE/cues.json" "$CLIPS" "$O" --timing "$TIMING" $MIXARGS | tee "$O"_log.txt | grep -v "^  \|^ *[0-9]\+ \|^frame" || true
# listening copies (mono, as the wav): the mix, and the mix twice in a row = one pass through the loop point
ffmpeg -v error -y -i "$O.wav" -c:a libmp3lame -b:a 160k "$O.mp3"
ffmpeg -v error -y -i "$O.wav" -i "$O.wav" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -c:a libmp3lame -b:a 160k "${O}_looped_twice.mp3"
python3 "$HERE/verify.py" "$O.wav" "$NARR" "$BEATS" | tee -a "$O"_log.txt
echo "to mux: bash $HERE/mux.sh <silent picture.mp4> ${O}_48k.wav <out.mp4>"
echo "cue table: ${O}_cues.txt   words under sound: ${O}_words.txt   log: ${O}_log.txt"
if [ "$PUBLISH" = 1 ]; then
  mkdir -p "$PUB"; cp "$O.wav" "${O}_48k.wav" "$O.mp3" "${O}_looped_twice.mp3" "$PUB/"; sleep 10
  for f in "$NAME.wav" "${NAME}_48k.wav" "$NAME.mp3" "${NAME}_looped_twice.mp3"; do
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$PUB/$f"); echo "published $PUB/$f ($d s)"
  done
fi
