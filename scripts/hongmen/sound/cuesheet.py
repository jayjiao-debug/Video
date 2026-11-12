#!/usr/bin/env python3
"""Hongmen's cue sheet table. The resolver moved to the shared kit (scripts/kit/sound/cuesheet.py); this keeps the old
command and its defaults:  cuesheet.py [beats.json] [cues.json]   (default /home/user/hm_work/sound/beats.json and the
cues.json beside this file)."""
import os, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "../../kit/sound"))
from cuesheet import *            # noqa: F401,F403  (lookup, resolve, line_at, shot_at, table)
from cuesheet import table
import json

BEATS = "/home/user/hm_work/sound/beats.json"
CUES = os.path.join(HERE, "cues.json")

if __name__ == "__main__":
    b = json.load(open(sys.argv[1] if len(sys.argv) > 1 else BEATS, encoding="utf8"))
    s = json.load(open(sys.argv[2] if len(sys.argv) > 2 else CUES, encoding="utf8"))
    print(table(b, s))
