"""ep42 music constants shared by build_v2.py (song, SR, B, P, STOP).

Rebuilt from the documented grid (script.md "Timing grid", music_map_ep42.json "grid"):
beat 0.56605 s, first downbeat 0.5688 s. B(k) is the song time of beat k, counted from 1,
so B(21)=11.890, B(33)=18.682, B(129)=73.023, B(265)=150.006, B(320)=181.139,
B(354)=200.384, B(426)=241.140 -- the SPANS in the map. The 5-beat stop bar (317-321)
only moves the bar phase, not the beat times, so one linear grid covers the whole song.
"""
from load import load, SONG, SR

P = 0.56605          # beat period (s)
T0 = 0.5688          # beat 1 (song bar 1 downbeat)
STOP = 252.128       # coda dead stop (song time)

def B(k):
    """Song time of beat k (1-based) on the main grid."""
    return T0 + (k - 1) * P

song = load(SONG)
