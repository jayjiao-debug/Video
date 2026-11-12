#!/usr/bin/env python3
"""The Hongmen film's cue sheet: cues.json names beats, this resolves them to frames.
usage: cuesheet.py [beats.json] [cues.json]     prints the resolved table (no audio needed)
   beats.json  written by dump_beats.sh from src/videos/hongmen/beats.ts + story.ts (default /home/user/hm_work/sound/beats.json)
   cues.json   beside this file

A cue never holds a typed film frame. It says WHERE by name:
   "at": "HIT.title"            a hit            "at": "HIT.jade.1"    the second jade raise (a list: index from 0)
   "at": "TAG.fanZeng"          a name tag       "at": "BEAT.privyBack"
   "at": "SHOT.12b"             a shot's first frame;  "SHOT_END.12b" = the first frame after it (= the next cut)
   "at": "LINE.6" / "LINE_END.6"  a narration line's first frame / the first frame after its speech
   "at": "CAP.15.2" / "CAP_END.15.2"  caption group k of a line (生的 = 15.2) / the first frame after its speech
   "at": "OPEN.change"          the opening gesture (sets/privy.ts OPENING): change, turn, trace, chin
   "at": "PIC.A.title"          the PICTURE's own beat: segment A's private table (segA.ts `T.title` = the frame the title
                                lands on), "PIC.B.hit2" = segB.ts `B.hit2` ... (dump_beats.mjs reads those tables while
                                bundling). Use these wherever a segment is animated: the sound then lands where the picture
                                lands, and follows when the animator moves it. HIT.x is only the caption group's first frame.
   "at": "FILM.start" / "FILM.end"
   "off": 3 | "stamp"           frames added to it: a number, or a name of "vars" (one place to change, e.g. how many
                                frames after its beat a stamp lands)
   "to": "SHOT_END.7", "to_off": 0    where a bed (or a long effect) stops, the same way. If `to` is earlier in the film
                                than `at`, the cue runs over the film's end and on from frame 0 (the loop).
The mixer puts the sound's ANCHOR (its onset, its loudest point or its start: see mix.py) on that frame."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BEATS = "/home/user/hm_work/sound/beats.json"
CUES = os.path.join(HERE, "cues.json")

def lookup(beats, name):
    """'HIT.jade.1' -> the number in beats.json; raises with the name when it is not there (a renamed beat)"""
    ns, _, rest = name.partition(".")
    cur = beats.get(ns) if ns.isupper() else None
    if cur is None or not rest:
        raise KeyError(f"cue sheet: '{name}' is not NAMESPACE.name (namespaces: {', '.join(k for k in beats if k.isupper())})")
    if isinstance(cur, dict) and rest in cur:            # shot ids and caption keys: the rest of the name is one key ("CAP.15.2")
        cur = cur[rest]
    else:
        for part in rest.split("."):
            if isinstance(cur, list) and part.isdigit() and int(part) < len(cur): cur = cur[int(part)]
            elif isinstance(cur, dict) and part in cur: cur = cur[part]
            else: raise KeyError(f"cue sheet: the film has no beat '{name}' (was it renamed in beats.ts" + (f", or in the beat table of shots/seg{rest[0]}.ts" if ns == "PIC" else "") + "?)")
    if isinstance(cur, bool) or not isinstance(cur, (int, float)):
        raise KeyError(f"cue sheet: '{name}' is not a frame (it is a {type(cur).__name__})")
    return cur

def _off(v, vars_):
    if v is None: return 0
    if isinstance(v, str):
        if v not in vars_: raise KeyError(f"cue sheet: no var '{v}'")
        return vars_[v]
    return v

def resolve(beats, sheet):
    """the cues with frames: adds f (the anchor's frame), f_to (or None), dur_f (frames from f to f_to, over the loop
    point if f_to <= f), wrap (True when it runs over the film's end). Cues with "on": false are left out."""
    total, vars_ = beats["total"], sheet.get("vars", {})
    out = []
    for i, c in enumerate(sheet["cues"]):
        if c.get("on") is False: continue
        if c["s"] not in sheet["sounds"]: raise KeyError(f"cue {i}: no sound '{c['s']}'")
        f = lookup(beats, c["at"]) + _off(c.get("off"), vars_)
        r = dict(c); r["i"] = i; r["f"] = f; r["ref"] = c["at"] + (f"{_off(c.get('off'), vars_):+g}" if c.get("off") else "")
        if c.get("to"):
            ft = lookup(beats, c["to"]) + _off(c.get("to_off"), vars_)
            r["f_to"] = ft; r["wrap"] = ft <= f; r["dur_f"] = ft - f + (total if ft <= f else 0)
            r["ref_to"] = c["to"] + (f"{_off(c.get('to_off'), vars_):+g}" if c.get("to_off") else "")
        else:
            r["f_to"] = None; r["wrap"] = False
        if not (-total < f < 2 * total): raise ValueError(f"cue {i} ({c['s']} at {c['at']}): frame {f} is outside the film")
        out.append(r)
    return out

def line_at(beats, f):
    """the narration line and the caption text spoken on frame f ('' in a pause)"""
    f = f % beats["total"]
    for c in beats["captions"]:
        if c["from"] <= f <= c["end"]: return c["line"], c["text"].replace("【", "").replace("】", "")
    return None, ""

def shot_at(beats, f):
    f = f % beats["total"]; s = beats["shots"][0]
    for x in beats["shots"]:
        if f >= x["from"]: s = x
    return s

def table(beats, sheet, rows=None):
    """a text table of the cues in film order. rows = extra columns from the mixer, keyed by the cue's index i"""
    cues = sorted(resolve(beats, sheet), key=lambda c: (c["f"] % beats["total"] if not c["wrap"] else c["f"], c["i"]))
    L = [f"{'frame':>5} {'s':>6}  {'sound':8} {'file':24} {'tied to':22} {'shot':4} {'until':>5}  {'under the words':18} note"]
    for c in cues:
        s = sheet["sounds"][c["s"]]; sh = shot_at(beats, c["f"]); _, words = line_at(beats, c["f"])
        until = f"{c['f_to']:5d}" if c["f_to"] is not None else "     "
        extra = ("  | " + rows[c["i"]]) if rows and c["i"] in rows else ""
        L.append(f"{c['f']:5d} {c['f'] / beats['fps']:6.2f}  {c['s']:8} {s.get('file', '?'):24} {c['ref']:22} {sh['id']:4} {until}  {words[:9]:<9}{'':9} {c.get('note', '')}{extra}")
    return "\n".join(L)

if __name__ == "__main__":
    b = json.load(open(sys.argv[1] if len(sys.argv) > 1 else BEATS, encoding="utf8"))
    s = json.load(open(sys.argv[2] if len(sys.argv) > 2 else CUES, encoding="utf8"))
    print(table(b, s))
