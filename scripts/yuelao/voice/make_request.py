#!/usr/bin/env python3
"""The voice request for 采访月老的一天: one single-line take per line (named by the line id), from yuelao_lines.json.
  python3 scripts/yuelao/voice/make_request.py <request id> <out request.json> [--seed 2026] [--lines A01,B03] [--tag s7]"""
import argparse, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("id"); ap.add_argument("out"); ap.add_argument("--seed", type=int, default=2026)
ap.add_argument("--lines", default=""); ap.add_argument("--tag", default=""); ap.add_argument("--stability", type=float, default=0.5)
a = ap.parse_args()
D = json.load(open(os.path.join(HERE, "yuelao_lines.json"))); CAST = json.load(open(os.path.join(HERE, "voices.json")))["cast"]
want = set(filter(None, a.lines.split(",")))
items = []
for l in D["lines"]:
    if want and l["id"] not in want: continue
    c = CAST[l["who"]]
    items.append({"type": "dialogue", "name": l["id"] + (("_" + a.tag) if a.tag else ""), "model": "eleven_v4", "seed": a.seed, "settings": {"stability": a.stability},
                  "lines": [{"text": l.get("tts", l["zh"]), "voice": {"owner": c["owner"], "voice_id": c["voice_id"], "name": c["name"]}}]})
json.dump({"id": a.id, "own_branch": True, "model_prefs": ["eleven_v4"], "words": True, "items": items}, open(a.out, "w"), ensure_ascii=False, indent=1)
print(len(items), "takes,", sum(len(i["lines"][0]["text"]) for i in items), "characters")
