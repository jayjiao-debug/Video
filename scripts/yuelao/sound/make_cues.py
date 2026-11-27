#!/usr/bin/env python3
"""采访月老的一天: writes scripts/yuelao/sound/cues.json (the kit's build.py reads it) from the plan below, the voice
timing (word times), so every spoken hit sits on its word, and the picture's own event frames (events.ts writes them),
so every hit on something SEEN (a stamp, the slam, the whip, the spool, the mitten, the power-off) sits on its frame.
   make_cues.py <voice_timing.json> [<events.json>, default /home/user/yuelao_work/film/sound/events.json]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
T = {l["id"]: l for l in json.load(open(sys.argv[1]))["lines"]}
EV = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "/home/user/yuelao_work/film/sound/events.json"))
SEG = {"A": 0, "B": 672, "C": 1560, "D": 2693, "E": 3215, "F": 3952, "G": 4544, "H": 4984, "I": 5644, "J": 6546}   # voice.ts SEGMENT_RAW

def P(ev, off_f=0):
    """anchor on a picture event (a key of events.json), off_f frames after it: the scene it falls in, from its first frame"""
    f = EV[ev] + off_f; sc = max(k for k, v in SEG.items() if v <= f)
    return [sc, "from", round((f - SEG[sc]) / 30, 3)]

def w(lid, word, off=0.0):
    """anchor at the first character of `word` in the line"""
    l = T[lid]; s = "".join(c[0] for c in l["words"]); i = s.index(word)
    return [lid, "start", round(l["words"][i][1] - l["start"] + off, 3)]
def frac(lid, k): l = T[lid]; return [lid, "start", round(k * (l.get("speech_end", l["end"]) - l["start"]), 3)]

MUS, AMB, HIT = -21.0, -40.0, -20.0
beds = [
 dict(label="A-D the bureau's tune", clip="mus_office", at=["A01", "start", -0.6], until=["D", "to", 0.0], loop=True, fade=0.3, fade_out=1.2, gain=MUS),
 dict(label="E-F the city version", clip="mus_city", at=["E", "from", 0.3], until=["F06", "start", -0.2], loop=True, fade=0.4, fade_out=1.5, gain=MUS - 1),
 dict(label="G night pad", clip="mus_night", at=["G", "from", 0.2], until=["H03", "start", 0.0], loop=True, fade=0.8, fade_out=2.5, gain=MUS - 3),
 dict(label="H-I the tune, slow", clip="mus_tender", at=["H03", "end", -1.0], until=["I04", "start", -0.2], loop=False, fade=1.5, fade_out=2.0, gain=MUS - 1),
 dict(label="I-J the tune, warm, to the end", clip="mus_warm", at=["I04", "start", -0.3], until=["J03", "end", 2.9], loop=False, fade=0.3, fade_out=0.3, gain=MUS + 2),
 dict(label="office room", clip="amb_office", at=["A", "from", 0.0], until=["E", "from", 0.0], loop=True, fade=0.05, fade_out=0.3, gain=AMB),
 dict(label="her office", clip="amb_work", at=["E", "from", 0.0], until=["F", "from", 0.0], loop=True, fade=0.2, fade_out=0.3, gain=AMB + 4),
 dict(label="the street", clip="amb_street", at=["F", "from", 0.0], until=["J03", "end", 2.9], loop=True, fade=0.2, fade_out=0.1, gain=AMB + 5),
]
H = lambda label, clip, at, g=0.0, **k: dict(label=label, clip=clip, at=at, gain=HIT + g, **k)
hits = [
 H("REC beep", "sfx_rec_beep", ["A", "from", 0.033], -4),
 H("A card in", "sfx_whoosh", ["A02", "end", 0.1]), H("A card seal", "sfx_stamp", ["A02", "end", 0.52]), H("A card target", "sfx_pop", ["A02", "end", 2.45], -3),
 H("A yank", "sfx_twang", P("yank")), H("A title thread", "sfx_whoosh", P("titleThread", -2), -2), H("A title paper", "sfx_pop", P("titlePaper", 3), -8),
 H("A title seal", "sfx_stamp", P("titleSeal")),
 H("B 007", "sfx_pop", w("B01", "零零七")), H("B 18000", "sfx_pop", ["B03", "end", 0.0]), H("B 7500", "sfx_boing", w("B04", "七"), -3), H("B snip", "sfx_snap", w("B05", "剪")), H("B one short", "sfx_stamp", w("B06", "差"), -2),
 H("B-C whip", "sfx_whoosh", P("whipBC", -3), -2),
 H("C file 1", "sfx_whoosh", P("cFile1", -2), -3), H("C stamp 1", "sfx_stamp", P("cStamp1")),
 H("C file 2", "sfx_whoosh", P("cFile2", -2), -3), H("C butterflies", "sfx_sparkle", P("butterflies"), -6), H("C stamp 2", "sfx_stamp", P("cStamp2")),
 H("C file 3", "sfx_whoosh", P("cFile3", -2), -3), H("C stamp 3", "sfx_stamp", P("cStamp3")),
 H("C file 4", "sfx_whoosh", P("cFile4", -2), -3), H("C stamp 4", "sfx_stamp", P("cStamp4")), H("C shake", "sfx_boing", w("C07", "抖"), -4),
 H("C drawer slam", "sfx_stamp", P("slam"), -1, rate=0.72, lp=[2400]),
 H("C file 5", "sfx_whoosh", P("cFile5", -2), -3), H("C stamp 5", "sfx_stamp", P("cStamp5")), H("C -300", "sfx_boing", w("C11", "三百"), -3),
 H("D order bell", "sfx_ding", ["D01", "start", -0.45]), H("D whip", "sfx_whoosh", ["D01", "start", -0.17], -2), H("D slip", "sfx_pop", ["D02", "start", 0.3], -3),
 H("D catches the slip", "sfx_pop", P("dGot"), -4), H("D slip seal", "sfx_stamp", P("dSlipSeal"), -2),
 H("D spool thrown", "sfx_whoosh", P("dThrown", -1), -3), H("D spool on the lens", "sfx_pop", P("dLand"), -2, rate=0.8),
 H("E tie", "sfx_twang", ["E02", "start", -0.4]), H("E snap 1", "sfx_snap", P("eHit1")), H("E snap 2", "sfx_snap", P("eHit2")), H("E snap 3", "sfx_snap", P("eHit3")),
 H("E stamp", "sfx_stamp", P("eStamp"), 2),
 H("F sure", "sfx_pop", w("F01", "稳")), H("F thread drops", "sfx_snap", ["F05", "end", 0.1], -2, rate=0.7), H("F stamp", "sfx_stamp", P("fStamp"), 2),
 H("F mitten on the lens", "sfx_pop", P("mitten"), -6, rate=0.6, lp=[900]),
 H("G where", "sfx_pop", ["G01", "start", 0.15]), H("G turn", "sfx_whoosh", ["G03", "start", -0.4], -4), H("G over", "sfx_boing", w("G05", "完了"), -3, rate=0.8),
 H("I the old thread", "sfx_sparkle", w("I01", "这根", 0.2), -5), H("I name", "sfx_sparkle", w("I05", "名字")), H("I target met", "sfx_ding", ["I05", "end", 0.27]),
 H("I done!", "sfx_pop", ["I06", "start", 0.05]), H("I stamp ok", "sfx_stamp", P("iStamp"), 2), H("I stamp ok shine", "sfx_sparkle", P("iStamp", 2), -4),
 H("J her thread", "sfx_sparkle", ["J02", "end", 0.1], -2), H("power off", "sfx_poweroff", P("off"), 4),
]
out = dict(note="采访月老的一天 sound plan v2 (27 Nov): everything is made in code (make_sound.py). Hits on things seen sit on the picture's own frames (events.ts). Scene H01-H02 has only the street and the night pad's tail.",
           cards=dict(clip="sfx_ding", gain=HIT - 2), beds=beds, hits=hits)
json.dump(out, open(os.path.join(HERE, "cues.json"), "w"), ensure_ascii=False, indent=1)
print(len(beds), "beds", len(hits), "hits")
