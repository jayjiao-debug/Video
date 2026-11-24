#!/usr/bin/env python3
"""Set chosen lines' character times by hand, in seconds of the line's own trimmed clip (<take dir>/lines/<id>.wav).

  python3 scripts/romeo/voice/retime_chars.py <take dir>

(v7.2, the owner on the v7 cut, f5609: "the interview is already saying something but the subtitles are slow".)
use_retakes.py gives a retake the voice service's character times, and those count time for the audio tags in
brackets as if they were spoken: H03's "[whispers, voice shaking]" put 红 1.3 s after her voice starts, so her note came
up late; H05's second tag, in the middle of the line, put the second 拍 (where the phone is thrown) 0.45 s after she
says it. The times below are read off each clip's loudness (10 ms frames): a burst per syllable or per phrase, the
characters spread over their burst. They are written into <take dir>/line_cuts.json in the clip's file time
("kept"[0] added), which is how assemble.py reads them.
"""
import json, os, sys

HAND = {
    # 红的，| 是因为她 | 还活着！  (three bursts, 0.10-1.05, 1.13-1.95, 2.12-3.32)
    "H03": [["红", 0.10, 0.55], ["的", 0.55, 0.95], ["，", 0.95, 1.13], ["是", 1.13, 1.32], ["因", 1.32, 1.50], ["为", 1.50, 1.68],
            ["她", 1.68, 1.95], ["还", 2.12, 2.50], ["活", 2.50, 2.80], ["着", 2.80, 3.10], ["！", 3.10, 3.35]],
    # 我只拍 (0.18-0.95) …… (silence to 1.37) 拍不下去了 (1.37-2.62)
    "H05": [["我", 0.18, 0.31], ["只", 0.32, 0.52], ["拍", 0.57, 0.95], ["…", 0.95, 1.16], ["…", 1.16, 1.37],
            ["拍", 1.37, 1.60], ["不", 1.61, 1.82], ["下", 1.83, 1.98], ["去", 2.00, 2.22], ["了", 2.23, 2.45], ["。", 2.45, 2.65]],
}

take = sys.argv[1]
p = os.path.join(take, "line_cuts.json")
cuts = json.load(open(p))
for c in cuts:
    if c["id"] in HAND:
        k0 = c["kept"][0]
        c["chars"] = [[ch, round(a + k0, 3), round(b + k0, 3)] for ch, a, b in HAND[c["id"]]]
        c["retimed"] = "retime_chars.py (v7.2): read off the clip's loudness"
        print(c["id"], "retimed:", " ".join(f"{ch}{a:.2f}" for ch, a, _ in HAND[c["id"]]))
json.dump(cuts, open(p, "w"), ensure_ascii=False)
