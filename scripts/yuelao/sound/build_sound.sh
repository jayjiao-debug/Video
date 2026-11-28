#!/bin/bash
# 采访月老的一天: the whole sound mix from the repo and the voice farm's public takes, anywhere (the Mac studio included).
#   bash scripts/yuelao/sound/build_sound.sh <work dir> <out mix.wav>        (run from a clone of jayjiao-debug/video)
# 1. the 63 voice lines: fetched from the farm branches and cut by the committed cut list (scripts/yuelao/voice/takes.py,
#    takes.json): every line exactly the length the picture was timed to
# 2. laid by the kit's assemble.py with the committed character times (line_cuts.json); STOPS if the result is out of step
#    with timing_ref.json (the timing voice.ts / captions.ts were made from)
# 3. v7 (default, YL_SOUND=el): the music, room tones and effects recorded with ElevenLabs (the owner, 28 Nov: "sound
#    generate using Eleven labs"): make_el.py fetches the voice farm's SEALED runs that el.json names, opens them with the
#    private key $YL_SOUND_KEY (default ~/Claude/keys/yuelao_sound.pem) and cuts the clips; the cues are cues_v7.json
#    (make_cues.py: hits on the picture's own frames, events.ts). Of the clips made in code (make_sound.py) only the
#    camera's own REC beep and power-off are heard. YL_SOUND=voice: voices only (v6); YL_SOUND=code: v5's bed made in code
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
# v6 (28 Nov): the owner heard the music and effects made in code as mechanical (review notes 2 and 11), so v6 carried
# the VOICES ONLY (YL_SOUND=voice). v7: the ElevenLabs recordings (the default, below); make_sound.py still runs first for
# the REC beep and the power-off, and make_el.py writes its clips over the rest. YL_SOUND=code brings the v5 bed back.
MODE=${YL_SOUND:-el}
if [ "$MODE" = "voice" ]; then
  # (the camera's own REC beep and power-off stay: cues_v6.json)
  python3 scripts/kit/day/sound/build.py --film yuelao --work "$W" --timing "$W/voice/voice_timing.json" --clips "$W/clips" --cues scripts/yuelao/sound/cues_v6.json \
    --voice "$W/voice/voice_48k.wav" --only voice,sfx --out "$OUT"
  exit 0
fi
if [ "$MODE" = "el" ]; then
  python3 scripts/yuelao/sound/make_el.py fetch scripts/yuelao/sound/el.json "$W/el/sealed"
  python3 scripts/yuelao/sound/make_el.py open scripts/yuelao/sound/el.json "$W/el/sealed" "$W/el/opened"
  python3 scripts/yuelao/sound/make_el.py clips scripts/yuelao/sound/el.json "$W/el/opened" "$W/clips"
  B="python3 scripts/kit/day/sound/build.py --film yuelao --work $W --timing $W/voice/voice_timing.json --clips $W/clips --cues scripts/yuelao/sound/cues_v7.json"
fi
$B --voice "$W/voice/voice_48k.wav" --only music,amb,sfx --nolimit --out "$W/bed.wav"
python3 scripts/yuelao/sound/voice_ride.py "$W/voice/voice_48k.wav" "$W/bed.wav" "$W/voice/voice_48k_ride.wav"
$B --voice "$W/voice/voice_48k_ride.wav" --out "$OUT"
