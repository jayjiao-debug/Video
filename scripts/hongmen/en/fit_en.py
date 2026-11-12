#!/usr/bin/env python3
"""Hongmen's English fit. The fitter moved to the shared kit (scripts/kit/lang/fit_lang.py, README.md there); this keeps
the old command (same arguments) and adds Hongmen's paths:
  fit_en.py <clips dir> <report.json> <out narration.wav> <out en_timing.json> [line=take ...] [line@tmax ...] [--takes ab] ..."""
import os, runpy, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "../../.."))
DEFAULTS = {"script": os.path.join(HERE, "script_en.json"), "captions": os.path.join(ROOT, "src/videos/hongmen/captions.ts"),
            "slots": "/home/user/hm_work/voice/v4/voice_timing_v4.json", "frames": "2092", "fps": "30",
            "film": "hongmen", "lang": "en", "hold": "9,21"}
for k, v in DEFAULTS.items():
    if "--" + k not in sys.argv: sys.argv += ["--" + k, v]
K = os.path.join(ROOT, "scripts/kit/lang/fit_lang.py")
sys.argv[0] = K
runpy.run_path(K, run_name="__main__")
