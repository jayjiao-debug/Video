#!/bin/bash
# THE ONE COMMAND that rebuilds the Wanbi film's sound after a beat moved (or a cue / a clip changed):
#     bash /home/user/video/scripts/wanbi/sound/build.sh               # Chinese -> /home/user/wanbi_work/sound/mix_zh.*
#     bash /home/user/video/scripts/wanbi/sound/build.sh --lang en     # the same cues and clips with the English
#                                                                      # narration -> /home/user/wanbi_work/sound/mix_en.*
# A copy of scripts/hongmen/sound/build.sh for a film that does NOT loop. Steps:
#   1. dump_beats.sh evaluates src/videos/wanbi/beats.ts + story.ts -> beats.json (HIT, TAG, BEAT, HOLD, the shots, the
#      lines, the caption groups) and the segments' own picture beats (PIC.A.x = shots/segA_ov.ts T.x, PIC.HOOK.x =
#      shots/hook.ts FEINT1)
#   2. expand_cues.py: cues.json -> the kit's plain cue sheet (the "series" lines unrolled; every cue that could run past
#      the film's end stops on it: the kit mixer would wrap it round to frame 0)
#   3. the kit mixer (scripts/kit/sound/mix.py): narration + effects + beds, stems, cue table, word report; then this
#      script refuses the mix if any sound still runs over the end
#   4. finish.py: the short tail fade to silence on the mix and its stems (no loop), the 48 kHz copy (the file to mux,
#      exactly the film's length) made again from the faded mix
#   5. an mp3 listening copy; verify.py (no loop); the kit's verify_narration.py on the Chinese mix (BUILD_PLAN WP12's
#      check: its "SOUND BEFORE?" flags there are the beds and effects in the pauses, by design; it cannot read English)
# Environment (all optional): WORK=/home/user/wanbi_work/sound  CLIPS=$WORK/clips  OUT=$WORK  NAME=mix_<lang>
#   NARR / TIMING (zh: /home/user/wanbi_work/voice/zh_v1/{narration.wav,voice_timing.json};
#                  en: /home/user/wanbi_work/voice/en_v1/narration.wav and the first of en_v1/{voice_timing_en,en_timing,voice_timing}.json)
#   MIXARGS (zh: "--lufs -14.5"; en: "--lufs -15.0", the English voice has taller peaks, as Hongmen's and Arthur's)
#   TAIL_MS=400 (the fade at the end)
# Nothing is written into the repo (it is public: no audio there). The clips: $CLIPS holds the Hongmen and Arthur
# libraries (out/hongmen-sfx-01..03 as they are, out/arthur-sfx-01..03 with the prefix arthur_) and Wanbi's own
# (out/wanbi-sfx-01, prefix wanbi_), all from the voice-output branch: see fetch_clips.sh.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
KIT="$(cd "$HERE/../../kit" && pwd)"
WLANG=zh
while [ $# -gt 0 ]; do case "$1" in --lang) WLANG="$2"; shift 2;; *) echo "build.sh: unknown argument $1" >&2; exit 2;; esac; done
WORK="${WORK:-/home/user/wanbi_work/sound}"; CLIPS="${CLIPS:-$WORK/clips}"; OUT="${OUT:-$WORK}"; TAIL_MS="${TAIL_MS:-400}"
case "$WLANG" in
  zh) NARR="${NARR:-/home/user/wanbi_work/voice/zh_v1/narration.wav}"; TIMING="${TIMING:-/home/user/wanbi_work/voice/zh_v1/voice_timing.json}"; MIXARGS="${MIXARGS:---lufs -14.5}";;
  en) NARR="${NARR:-/home/user/wanbi_work/voice/en_v1/narration.wav}"
      if [ -z "${TIMING:-}" ]; then for t in voice_timing_en.json en_timing.json voice_timing.json timing.json; do [ -f "/home/user/wanbi_work/voice/en_v1/$t" ] && { TIMING="/home/user/wanbi_work/voice/en_v1/$t"; break; }; done; fi
      TIMING="${TIMING:-}"; MIXARGS="${MIXARGS:---lufs -15.0}";;
  *) echo "build.sh: --lang zh or en" >&2; exit 2;;
esac
[ -f "$NARR" ] || { echo "build.sh: no narration at $NARR" >&2; exit 1; }
NAME="${NAME:-mix_$WLANG}"; mkdir -p "$WORK" "$OUT"; O="$OUT/$NAME"
BEATS="$WORK/beats_$WLANG.json"; CUES="$WORK/cues_$WLANG.json"
WANBI_LANG="$WLANG" bash "$HERE/dump_beats.sh" "$BEATS"
python3 "$HERE/expand_cues.py" "$HERE/cues.json" "$BEATS" "$CLIPS" "$CUES"
TARGS=(); [ -n "$TIMING" ] && TARGS=(--timing "$TIMING")
python3 "$KIT/sound/mix.py" "$NARR" "$BEATS" "$CUES" "$CLIPS" "$O" "${TARGS[@]}" $MIXARGS > "$O"_log.txt
grep -v "^  \|^ *[0-9]\+ \|^frame\|^the loop point\|^ *both limiters" "$O"_log.txt || true
if grep -q "runs over the loop point" "$O"_log.txt; then
  echo "build.sh: a sound still runs over the film's end (it would wrap to frame 0):"; grep "runs over the loop point" "$O"_log.txt; exit 1
fi
FARGS=(); [ -n "$TIMING" ] && FARGS=(--timing "$TIMING")
python3 "$HERE/finish.py" "$O" "$BEATS" --tail-ms "$TAIL_MS" "${FARGS[@]}" | tee -a "$O"_log.txt
ffmpeg -v error -y -i "$O.wav" -c:a libmp3lame -b:a 160k "$O.mp3"
python3 "$HERE/verify.py" "$O.wav" "$NARR" "$BEATS" $TIMING | tee -a "$O"_log.txt
if [ "$WLANG" = en ]; then
  echo "verify_narration.py: not run for English (it counts Chinese characters and reads the Chinese timing format)" | tee -a "$O"_log.txt
elif [ -n "$TIMING" ]; then
  # the kit's narration check reads speech_end, which Wanbi's timing json does not carry (= the last line's end): a copy
  # with it goes beside the mix. Its loop-joint lines are Hongmen's (this film does not loop): read them as the two ends.
  TCHK="$WORK/timing_check_$WLANG.json"
  python3 -c 'import json,sys; j=json.load(open(sys.argv[1],encoding="utf8")); j.setdefault("speech_end", max(l["end"] for l in j["lines"])); j.setdefault("frames", int(sys.argv[3])); json.dump(j, open(sys.argv[2],"w",encoding="utf8"), ensure_ascii=False)' "$TIMING" "$TCHK" "$(node -e 'console.log(require(process.argv[1]).total)' "$BEATS")"
  echo "verify_narration.py on the mix (BUILD_PLAN WP12): beds and effects in the pauses show as SOUND BEFORE? by design" | tee -a "$O"_log.txt
  python3 "$KIT/voice/verify_narration.py" "$(dirname "$O")" "$(basename "$O").wav" "$TCHK" > "$O"_narrcheck.txt 2>&1 \
    && grep "^flags\|^level\|^head" "$O"_narrcheck.txt | tee -a "$O"_log.txt \
    || { echo "verify_narration.py: exited non-zero (see ${O}_narrcheck.txt)" | tee -a "$O"_log.txt; tail -n 3 "$O"_narrcheck.txt; }
fi
echo "to mux: bash $KIT/sound/mux.sh <silent picture.mp4> ${O}_48k.wav <out.mp4>"
echo "cue table: ${O}_cues.txt   words under sound: ${O}_words.txt   log: ${O}_log.txt   narration check: ${O}_narrcheck.txt   listen: ${O}.mp3"
