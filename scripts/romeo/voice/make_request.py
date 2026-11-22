#!/usr/bin/env python3
"""The voice farm request for 采访罗密欧与朱丽叶: one multi-speaker dialogue take per scene, from romeo_lines.json.

  python3 scripts/romeo/voice/make_request.py <request id> <out request.json> [--seed 1597] [--only A,C] [--lines C08,H05]
          [--also] [--retake-seed 2584]

Each scene becomes a "dialogue" item named dlg_<scene>_s<seed> whose inputs are the scene's lines in order (cut_lines.py
matches the take's voice segments to the scene's lines in that order). C08's other half (Romeo's "Juliet… Juliet…",
said at the same moment as Juliet's in the split screen) is its own one-line take, also_C08_s<seed>.
--lines makes single-line retakes instead (one item per line, rt_<id>_s<seed>), for lines that came out wrong.
The voices are public ElevenLabs library voices (cast in voices.json); the reporter keeps the series voice.
"""
import argparse, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("id"); ap.add_argument("out")
ap.add_argument("--seed", type=int, default=1597)
ap.add_argument("--only", default="", help="scenes to take (default all)")
ap.add_argument("--lines", default="", help="single-line retakes of these line ids instead of scene takes")
ap.add_argument("--also", action="store_true", help="with --only/--lines: add C08's other half too")
ap.add_argument("--stability", type=float, default=0.5)
a = ap.parse_args()

D = json.load(open(os.path.join(HERE, "romeo_lines.json")))
CAST = json.load(open(os.path.join(HERE, "voices.json")))["cast"]
L = D["lines"]


def voice(who): c = CAST[who]; return {"owner": c["owner"], "voice_id": c["voice_id"], "name": c["name"]}


def item(name, lines):
    return {"type": "dialogue", "name": name, "model": "eleven_v4", "seed": a.seed, "settings": {"stability": a.stability},
            "lines": [{"text": t, "voice": voice(w)} for w, t in lines]}


items = []
if a.lines:
    want = a.lines.split(",")
    for l in L:
        if l["id"] in want: items.append(item(f"rt_{l['id']}_s{a.seed}", [(l["who"], l["tts"])]))
else:
    only = set(filter(None, a.only.split(",")))
    for sc in D["scenes"]:   # A..I in order
        if only and sc not in only: continue
        items.append(item(f"dlg_{sc}_s{a.seed}", [(l["who"], l["tts"]) for l in L if l["scene"] == sc]))
if not (a.only or a.lines) or a.also:
    for l in L:
        if l.get("also"): items.append(item(f"also_{l['id']}_s{a.seed}", [(l["also"]["who"], l["also"]["tts"])]))
req = {"id": a.id, "own_branch": True, "model_prefs": ["eleven_v4"], "words": True, "items": items}
json.dump(req, open(a.out, "w"), ensure_ascii=False, indent=1)
chars = sum(len(x["text"]) for it in items for x in it["lines"])
print(f"wrote {a.out}: {len(items)} takes, {chars} characters (about {chars} credits)")
