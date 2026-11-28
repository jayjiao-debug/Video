#!/usr/bin/env python3
"""采访月老的一天: writes scripts/yuelao/sound/cues_v7.json (the kit's build.py reads it) from the plan below, the voice
timing (word times), so every spoken hit sits on its word, and the picture's own event frames (events.ts writes them),
so every hit on something SEEN (the token, the cord, the plaque, the books, the stamps, the spool, the mitten, the
strands, the power-off) sits on its frame.
   make_cues.py <voice_timing.json> <events.json>
v7 (28 Nov): every sound but the camera's own two (the series' REC beep and power-off, make_sound.py) is an ElevenLabs
recording (the owner: "sound generate using Eleven labs"): the clips el.json cuts from the voice farm's sealed runs
(make_el.py). Music: one composition in four sections (the bureau theme, its city version, tender, the warm ending),
the night piece in G, none in H (the turn). Every bed has ONE static gain (music is never ducked: the owner's rule)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
T = {l["id"]: l for l in json.load(open(sys.argv[1]))["lines"]}
EV = json.load(open(sys.argv[2]))
SEG = {k[4:]: v for k, v in EV.items() if k.startswith("seg_")}   # the scenes' first frames (story.ts seg)

def P(ev, off_f=0):
    """anchor on a picture event (a key of events.json), off_f frames after it: the scene it falls in, from its first frame"""
    f = EV[ev] + off_f; sc = max((k for k, v in SEG.items() if v <= f), key=lambda k: SEG[k])
    return [sc, "from", round((f - SEG[sc]) / 30, 3)]

def w(lid, word, off=0.0):
    """anchor at the first character of `word` in the line"""
    l = T[lid]; s = "".join(c[0] for c in l["words"]); i = s.index(word)
    return [lid, "start", round(l["words"][i][1] - l["start"] + off, 3)]

# levels: el.json normalises the clips: hits to a -1.3 dBFS peak, music to -16 LUFS, room tones to a -1.3 dBFS peak (their
# loudness then differs: office -28.3, her office -27.4, street -18.0 LUFS, so each room's gain below puts it where v5's was)
MUS, HIT = -26.0, -20.0   # (v7 mix check: the voice sits a median 17.5 dB over the rest, the house rule is 14 to 22)
AMB = {"amb_office": -27.6, "amb_work": -26.5, "amb_street": -36.1}
beds = [
 # the bureau theme from the first word through the urgent order, looped on its bars (one static gain)
 dict(label="A-D the bureau theme", clip="mus_bureau", at=["A01", "start", -0.6], until=["D", "to", 0.0], fade=0.3, fade_out=1.2, gain=MUS),
 dict(label="E-F the city version", clip="mus_city", at=["E", "from", 0.3], until=["F06", "start", -0.2], fade=0.4, fade_out=1.5, gain=MUS - 1),
 dict(label="G the night piece", clip="mus_night", at=["G", "from", 0.2], until=["H", "from", 0.0], fade=0.8, fade_out=1.5, gain=MUS - 2),
 # H: no music (the turn). I-J: tender from the scene's first frame, the warm ending lands with 成了 (one continuous stretch)
 dict(label="I-J tender into the warm ending", clip="mus_end", at=["I", "from", 0.0], until=["J", "to", 0.0], fade=1.5, fade_out=0.3, gain=MUS - 0.5),
 dict(label="office room", clip="amb_office", at=["A", "from", 0.0], until=["E", "from", 0.0], fade=0.05, fade_out=0.3, gain=AMB["amb_office"]),
 dict(label="her office", clip="amb_work", at=["E", "from", 0.0], until=["F", "from", 0.0], fade=0.2, fade_out=0.3, gain=AMB["amb_work"]),
 dict(label="the street", clip="amb_street", at=["F", "from", 0.0], until=["J", "to", 0.0], fade=0.2, fade_out=0.1, gain=AMB["amb_street"]),
]
H = lambda label, clip, at, g=0.0, **k: dict(label=label, clip=clip, at=at, gain=HIT + g, **k)
hits = [
 # A · the cold open: the token on its cord, the cord parting, the plaque and its seal
 H("REC beep", "sfx_rec_beep", ["A", "from", 0.033], -4),
 H("A token comes down", "sfx_whoosh", P("tokenIn"), -7), H("A token slip", "sfx_paper", P("tokenSlip"), -11),
 H("A the cord snaps", "sfx_snap", P("snap"), 1), H("A the cord rings", "sfx_twang", P("snap"), -8),
 H("A the plaque drops", "sfx_whoosh", P("titleDrop", -2), -4), H("A the plaque's seal", "sfx_stamp_a", P("titleSeal")),
 # B · the bureau's numbers
 H("B 007", "sfx_pop", w("B01", "零零七")), H("B 18000", "sfx_pop", ["B03", "end", 0.0], -2), H("B 7500", "sfx_boing", w("B04", "七"), -4),
 H("B snip", "sfx_snip", w("B05", "剪"), 1), H("B one short", "sfx_stamp_b", w("B06", "差"), -4),
 H("B-C whip", "sfx_whoosh", P("whipBC", -3), -2),
 # C · the five case books
 *[H(f"C book {i + 1} flies out", "sfx_whoosh", P(f"cLeave{i}", -1), -7) for i in range(5)],
 *[H(f"C book {i + 1} pops up", "sfx_paper", P(f"cOpen{i}"), -10) for i in range(4)],
 H("C 1 flicked home", "sfx_whoosh", P("cBack0"), -7), H("C 1 in its drawer", "sfx_thump", P("cIn0"), -11),
 H("C 2 butterflies", "sfx_sparkle", P("butterflies"), -7), H("C 2 shut on 这单", "sfx_bookshut", P("cHide"), -2), H("C 2 dropped behind him", "sfx_thump", P("cDrop1"), -9),
 H("C 3 the slips climb", "sfx_paper", P("slips"), -6), H("C 3 the slips flutter", "sfx_paper", P("slips", 7), -10), H("C 3 dropped at his feet", "sfx_thump", P("cDrop2"), -5),
 H("C 4 手一抖", "sfx_boing", w("C07", "抖"), -4), H("C 4 lands on 宝钗", "sfx_pop", P("cChai"), -7),
 H("C 4 the letters burst", "sfx_pops", P("letters"), -2), H("C 4 the letters' paper", "sfx_paper", P("letters", 1), -6),
 H("C 4 hurled home", "sfx_whoosh", P("cBack3"), -3), H("C 4 in its drawer", "sfx_thump", P("cIn3"), -7),
 H("C 5 the jade seal rises", "sfx_ding", P("sealUp"), -8),
 H("C 5 the seal slams", "sfx_stamp_c", P("sealSlam"), 2, rate=0.82), H("C 5 the book shuts", "sfx_bookshut", P("sealSlam"), -3),
 H("C 5 flies home", "sfx_whoosh", P("cBack4"), -5), H("C 5 in its drawer", "sfx_thump", P("cIn4"), -9),
 # D · the urgent order
 H("D the burner pings", "sfx_ding", P("dPing")), H("D off he runs", "sfx_whoosh", ["D01", "start", -0.17], -4),
 H("D catches the slip", "sfx_pop", P("dGot"), -4), H("D slip seal", "sfx_stamp_a", P("dSlipSeal"), -2),
 H("D spool thrown", "sfx_whoosh", P("dThrown", -1), -3), H("D spool on the lens", "sfx_thump", P("dLand"), -2),
 # E · her office: the bow, three swipes, three snaps
 H("E the thread ties", "sfx_twang", ["E02", "start", -0.4], -4),
 H("E snap 1", "sfx_snap", P("eHit1")), H("E snap 2", "sfx_snap", P("eHit2")), H("E snap 3", "sfx_snap", P("eHit3")),
 H("E stamp", "sfx_stamp_b", P("eStamp")),
 # F · the blind date
 H("F 稳", "sfx_pop", w("F01", "稳")), H("F his thread slips off", "sfx_twang", P("fFreeR"), -7, rate=1.15), H("F her thread slips off", "sfx_twang", P("fFreeL"), -6, rate=1.15),
 H("F stamp", "sfx_stamp_c", P("fStamp")), H("F mitten on the lens", "sfx_thump", P("mitten"), -5),
 # G · the strands picked off her lens; 完了
 *[H(f"G strand {i}", "sfx_snap", P(f"gPull{i}"), -13, rate=1.2) for i in range(1, 5)],
 H("G the rider calls", "sfx_whoosh", ["G03", "start", -0.4], -8), H("G 完了", "sfx_boing", w("G05", "完"), -7, rate=0.8),
 # I · the old thread, the name, 成了
 H("I the old thread", "sfx_sparkle", w("I01", "这根", 0.2), -6), H("I name", "sfx_sparkle", w("I05", "名字"), -3), H("I target met", "sfx_ding", ["I05", "end", 0.27], -1),
 H("I 成了", "sfx_pop", ["I06", "start", 0.05]), H("I stamp ok", "sfx_stamp_a", P("iStamp")), H("I stamp ok shine", "sfx_sparkle", P("iStamp", 2), -5),
 # J · her own thread; the camera goes off
 H("J her thread", "sfx_sparkle", ["J02", "end", 0.1], -3), H("power off", "sfx_poweroff", P("off"), 4),
]
# a sound used again is played a little higher or lower each time (sampler-style "rate", within about 1.5 semitones), so
# no two pops, whooshes or stamps are the same recording note for note (the gate's repeat check; and it sounds less
# mechanical, the owner's v5 note)
VARY = [1.0, 0.94, 1.06, 0.97, 1.09, 0.91, 1.03, 0.96, 1.05]
seen = {}
for h in hits:
    c = h["clip"]
    if c in ("sfx_rec_beep", "sfx_poweroff"): continue
    i = seen[c] = seen.get(c, -1) + 1
    if i: h["rate"] = round(h.get("rate", 1.0) * VARY[i % len(VARY)], 3)
# the music's steady bass on every beat (about half its energy under 120 Hz, a 0.6 s pulse: the gate's thump check) is
# out of a phone's reach and only muddies it: ONE fixed high-pass for each theme bed's whole length (build.py "hp")
for b in beds:
    if b["clip"] in ("mus_bureau", "mus_city", "mus_end"): b["hp"] = [120, 2]
out = dict(note="采访月老的一天 sound plan v7 (28 Nov): ElevenLabs music and effects (el.json, make_el.py); the REC beep and power-off are the series' own (make_sound.py). Hits on things seen sit on the picture's own frames (events.ts). H has no music.",
           cards=dict(clip="sfx_ding", gain=HIT - 9), beds=beds, hits=hits)
json.dump(out, open(os.path.join(HERE, "cues_v7.json"), "w"), ensure_ascii=False, indent=1)
print(len(beds), "beds", len(hits), "hits")
