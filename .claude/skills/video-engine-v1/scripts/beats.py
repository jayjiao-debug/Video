#!/usr/bin/env python3
"""Beat grid + section markers for the background track -> src/music.json.

    python3 beats.py public/bgm.mp3 src/music.json

Uses the analyser in explainer/pipeline/music.py (constant-tempo grid by autocorrelation,
phase by onset alignment; markers: break / build / drop / outro). Scenes then refer to
beats as b(i) = beats[i]; check the drops by ear before building on them.
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]          # .../video (repo root)
sys.path.insert(0, str(REPO / 'explainer'))
from pipeline.music import analyse                     # noqa: E402

src, dst = sys.argv[1], sys.argv[2]
a = analyse(src)
out = {'beats': [round(float(x), 3) for x in a['beats']]}
for k in ('markers', 'tempo', 'duration'):
    if k in a:
        out[k] = a[k]
Path(dst).write_text(json.dumps(out, ensure_ascii=False))
print(f"{len(out['beats'])} beats, tempo {a.get('tempo')}, markers {a.get('markers')}")
