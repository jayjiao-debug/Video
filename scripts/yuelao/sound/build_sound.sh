#!/bin/bash
# 采访月老的一天: the whole sound mix from the repo and the voice farm's public takes, anywhere (the Mac studio included).
#   bash scripts/yuelao/sound/build_sound.sh <work dir> <out mix.wav>        (run from a clone of jayjiao-debug/video)
# 1. the 63 voice lines: fetched from the farm branches and cut by the committed cut list (scripts/yuelao/voice/takes.py,
#    takes.json): every line exactly the length the picture was timed to
# 2. laid by the kit's assemble.py with the committed character times (line_cuts.json); STOPS if the result is out of step
#    with timing_ref.json (the timing voice.ts / captions.ts were made from)
# 3. the music, room tones and effects made in code (make_sound.py), the cues in cues.json (make_cues.py: hits on the
#    picture's own frames, events.ts). v6: NOT HEARD by default (voices only, see below); YL_SOUND=code for the v5 bed
# 4. the voice ridden under the bed (voice_ride.py), then the kit's build.py: mono 48 kHz, about -19 LUFS, true peak under -1.8 dBTP
# Needs python3 with numpy, ffmpeg, git. Writes only under <work dir> and <out mix.wav>.
set -euo pipefail
W=$1; OUT=$2
mkdir -p "$W"
python3 scripts/yuelao/voice/takes.py fetch scripts/yuelao/voice/takes.json "$W/runs"
python3 scripts/yuelao/voice/takes.py render scripts/yuelao/voice/takes.json "$W/runs" "$W/lines"
python3 scripts/kit/day/voice/assemble.py --film yuelao "$W/lines" "$W/voice" scripts/yuelao/voice/line_cuts.json
python3 - "$W/voice/voice_timing.json" scripts/yuelao/voice/timing_ref.json <<'PY'
import json, sys
t = json.load(open(sys.argv[1])); r = json.load(open(sys.argv[2]))
got = [[l["id"], l["start"], l["end"]] for l in t["lines"]]
bad = [(a, b) for a, b in zip(got, r["lines"]) if a[0] != b[0] or abs(a[1] - b[1]) > 0.0005 or abs(a[2] - b[2]) > 0.0005]
if bad or len(got) != len(r["lines"]) or t["frames"] != r["frames"]:
    sys.exit("build_sound: the rebuilt voice is out of step with timing_ref.json: %s" % (bad[:3] or "line count / frames"))
print("build_sound: voice timing matches the picture (%d lines, %d frames)" % (len(got), t["frames"]))
PY
python3 scripts/yuelao/sound/make_sound.py "$W/clips"
B="python3 scripts/kit/day/sound/build.py --film yuelao --work $W --timing $W/voice/voice_timing.json --clips $W/clips --cues scripts/yuelao/sound/cues.json"
# v6 (28 Nov): the owner heard the music and effects made in code as mechanical (review notes 2 and 11), so the v6 cut
# carries the VOICES ONLY until real recordings are picked (the music card). make_sound.py still runs: the cue table needs
# its clip files to exist, but nothing it makes is heard. YL_SOUND=code brings the v5 bed back.
if [ "${YL_SOUND:-voice}" = "voice" ]; then
  # (the camera's own REC beep and power-off stay: cues_v6.json)
  python3 scripts/kit/day/sound/build.py --film yuelao --work "$W" --timing "$W/voice/voice_timing.json" --clips "$W/clips" --cues scripts/yuelao/sound/cues_v6.json \
    --voice "$W/voice/voice_48k.wav" --only voice,sfx --out "$OUT"
  exit 0
fi
$B --voice "$W/voice/voice_48k.wav" --only music,amb,sfx --nolimit --out "$W/bed.wav"
python3 scripts/yuelao/sound/voice_ride.py "$W/voice/voice_48k.wav" "$W/bed.wav" "$W/voice/voice_48k_ride.wav"
$B --voice "$W/voice/voice_48k_ride.wav" --out "$OUT"
