"""The score of 《开往零点的列车》: every note of every track, in absolute seconds, from the tempo map.

build(sections=None) → Score with .tracks {track: [events]} and .vis [picture events].
Track kinds are defined in mix_train.TRACKS. Times come only from tempo.py, so picture and sound share one clock.
Key: D minor / F major. Horn motif (leitmotif): D5 C5 A4 D5, rhythm 1.5 0.5 1 1 beats.
"""
import sys, os, math, random
from collections import defaultdict
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import tempo as T

R = random.Random(20261027)

# MIDI helpers
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def m(s):
    """'D5' → 74 (C4 = 60)."""
    name, octv = (s[:2], s[2:]) if len(s) > 2 and s[1] in '#b' else (s[:1], s[1:])
    return 12 * (int(octv) + 1) + NOTE[name]


CHORDS = {   # voicings around middle C, bass root separately
    'Dm': ['D4', 'F4', 'A4'], 'Dm9': ['F3', 'A3', 'C4', 'E4'], 'Bb': ['D4', 'F4', 'Bb4'], 'Bbmaj7': ['D4', 'F4', 'A4', 'Bb4'],
    'F': ['C4', 'F4', 'A4'], 'C': ['C4', 'E4', 'G4'], 'Gm9': ['F3', 'Bb3', 'D4', 'A4'], 'Gm': ['D4', 'G4', 'Bb4'],
    'A7sus': ['D4', 'E4', 'G4', 'A4'], 'A7': ['C#4', 'E4', 'G4', 'A4'], 'A': ['C#4', 'E4', 'A4'], 'Am': ['C4', 'E4', 'A4'],
}
ROOT = {'Dm': 'D', 'Dm9': 'D', 'Bb': 'Bb', 'Bbmaj7': 'Bb', 'F': 'F', 'C': 'C', 'Gm9': 'G', 'Gm': 'G', 'A7sus': 'A', 'A7': 'A', 'A': 'A', 'Am': 'A'}
MOTIF = [('D5', 1.5), ('C5', 0.5), ('A4', 1.0), ('D5', 1.0)]


def root(ch, octave=2):
    return m(ROOT[ch] + str(octave))


def subroot(ch):
    """sub / 808 root folded into MIDI 31–42 (49–92 Hz): low enough to feel, high enough for phones."""
    k = m(ROOT[ch] + '1')
    while k < 31:
        k += 12
    while k > 42:
        k -= 12
    return k


class Score:
    def __init__(self):
        self.tracks = defaultdict(list)
        self.vis = []

    def add(self, track, **ev):
        self.tracks[track].append(ev)

    def see(self, t, kind, **kw):
        self.vis.append({'t': round(t, 4), 'kind': kind, **kw})

    # time of quarter-note beat `b` from the start of bar `bar` of section `seg`
    def T(self, seg, bar=0, b=0.0):
        return T.t_of(seg, bar, b)

    def dur(self, seg, bar, b0, b1):
        return self.T(seg, bar, b1) - self.T(seg, bar, b0)


def hum(t, ms=6):
    return t + R.uniform(-ms, ms) / 1000


def hv(v, d=6):
    return max(1, min(127, v + R.randint(-d, d)))


# ------------------------------------------------------------------------------------------------
# rail kit: 哐 on every beat (teaching layer = exact)
def rail(S, seg, bars=None, vel=100, every=1.0, muffle=False, tag='clack'):
    r = T.seg(seg)
    s = r['seg']
    n = s.bars if bars is None else bars
    k = 0
    b = 0.0
    while b < n * s.beats_per_bar - 1e-9:
        t = r['start'] + s.time_at(b)
        S.add('clack', t=t, vel=vel if k % 4 else min(127, vel + 10), muffle=muffle)
        S.see(t, tag)
        b += every
        k += 1


# ------------------------------------------------------------------------------------------------
def hook(S):
    """0:00–0:11.5 哐当: boom-bap at 96 on the rail kit, accelerando 96→120, underpass bar, burst."""
    prog = [('hook.96', 0, 'Dm9'), ('hook.accel', 0, 'Bbmaj7'), ('hook.accel', 1, 'Gm9'), ('hook.accel', 2, 'A7sus')]
    # rail clacks on every beat through bar 0–3 (the accelerando is the riser)
    rail(S, 'hook.96', vel=105)
    rail(S, 'hook.accel', vel=110)
    for seg, bar, ch in prog:
        t0, t1 = S.T(seg, bar, 0), S.T(seg, bar, 4)
        # FM-piano chord (Rhodes-ish), soft, on 1 and pushed on the "& of 2"
        for b, v, d in ((0, 70, 1.8), (2.5, 58, 1.3)):
            for k, note in enumerate(CHORDS[ch]):
                S.add('ep', t=hum(S.T(seg, bar, b) + 0.008 * k, 3), key=m(note), vel=hv(v, 4), dur=S.dur(seg, bar, b, b + d))
        # boom-bap drums: felt kick on 1, 2&, 3¾; the sub follows the kick (no drone)
        for b, v, d in ((0, 112, 1.2), (1.5, 88, 0.9), (2.75, 96, 1.0)):
            S.add('drums', t=hum(S.T(seg, bar, b), 4), d='kick', vel=hv(v))
            S.add('sub', t=S.T(seg, bar, b), note=subroot(ch), dur=S.dur(seg, bar, b, b + d), gain=0.8)
        if not (seg == 'hook.96'):
            for b in (1, 3):
                S.add('drums', t=hum(S.T(seg, bar, b), 4), d='snare', vel=hv(104))
        for e in range(8):   # hats, swung a touch (boom-bap)
            b = e * 0.5 + (0.06 if e % 2 else 0)
            S.add('drums', t=hum(S.T(seg, bar, b), 5), d='hh', vel=hv(70 if e % 2 else 86, 8))
    # snare build in the last accelerando bar: 8ths then 16ths
    for i in range(8):
        S.add('drums', t=S.T('hook.accel', 2, 2 + i * 0.25), d='snare', vel=60 + i * 7)
    S.add('riser', t=S.T('hook.accel', 0, 0), dur=S.T('hook.underpass') - S.T('hook.accel'), f1=7000, gain=0.25)
    S.add('filter_open', t=S.T('hook.accel'), t1=S.T('hook.underpass'))
    # underpass: drums and clacks out, bass + sub muffled on A, tunnel whoosh; reverse crash into the drop
    tu, tt = S.T('hook.underpass'), S.T('title')
    S.add('sub', t=tu, note=subroot('A'), dur=tt - tu, gain=0.6, muffle=True)
    S.add('bass', t=tu, key=m('A1'), vel=80, dur=tt - tu - 0.05, muffle=True)
    S.add('whoosh', t=tu - 0.15, dur=tt - tu + 0.3, gain=0.35)
    S.add('revcrash', t=tt, gain=0.55)
    S.see(tu, 'underpass_dark')
    S.see(tt, 'burst')


def title(S):
    """0:11.5–0:15.5 title drop: drumline pop-rock, brass motif, impact. Second-loudest moment."""
    seg = 'title'
    t0 = S.T(seg)
    S.add('impact', t=t0, note=m('D2'), gain=0.8)
    S.add('drums', t=t0, d='crash', vel=125)
    S.add('drums', t=t0, d='crash2', vel=118)
    rail(S, seg, vel=112)
    chords = [('Dm', 0, 4), ('Bb', 4, 6), ('C', 6, 8)]
    for ch, b0, b1 in chords:
        for note in CHORDS[ch]:
            S.add('strings', t=S.T(seg, 0, b0), key=m(note) + 12, vel=96, dur=S.dur(seg, 0, b0, b1))
            S.add('strings_lo', t=S.T(seg, 0, b0), key=m(note) - 12, vel=92, dur=S.dur(seg, 0, b0, b1))
        S.add('bass', t=S.T(seg, 0, b0), key=root(ch, 2), vel=110, dur=S.dur(seg, 0, b0, b1) * 0.95)
        S.add('sub', t=S.T(seg, 0, b0), note=subroot(ch), dur=S.dur(seg, 0, b0, b1) * 0.95, gain=0.7)
    # brass: motif in bar 1 (trumpets + horns), answer stabs in bar 2
    b = 0.0
    for note, d in MOTIF:
        for trk, oct_ in (('trumpet', 0), ('horn', -12), ('trombone', -12)):
            S.add(trk, t=S.T(seg, 0, b), key=m(note) + oct_, vel=118, dur=S.dur(seg, 0, b, b + d) * 0.92)
        b += d
    for bb, ch in ((4.0, 'Bb'), (5.5, 'Bb'), (6.0, 'C'), (7.5, 'C')):
        for note in CHORDS[ch]:
            S.add('trumpet_stac', t=S.T(seg, 0, bb), key=m(note) + 12, vel=118, dur=0.2)
            S.add('trombone_stac', t=S.T(seg, 0, bb), key=m(note) - 12, vel=115, dur=0.2)
    # drums: big pop-rock with a drumline snare layer, tom fill into 硬座
    for bar in range(2):
        for bb, v in ((0, 125), (1.5, 100), (2, 118), (2.5, 96)):
            S.add('drums', t=S.T(seg, bar, bb), d='kick', vel=hv(v, 3))
        for bb in (1, 3):
            S.add('drums', t=S.T(seg, bar, bb), d='snare', vel=hv(124, 2))
            S.add('claps', t=S.T(seg, bar, bb), key=60, vel=110)
        for e in range(8):
            S.add('drums', t=hum(S.T(seg, bar, e * 0.5), 3), d='hh_semi' if bar == 0 else 'ride', vel=hv(92 if e % 2 == 0 else 74))
        for s16 in range(16):  # drumline snare: 16ths with accents on beats
            S.add('drumline', t=S.T(seg, bar, s16 * 0.25), key=60, vel=hv(100 if s16 % 4 == 0 else 62, 5))
    for i, d in enumerate(('tom1', 'tom1', 'tom2', 'tom2', 'tom3', 'tom3')):
        S.add('drums', t=S.T(seg, 1, 2.5 + i * 0.25), d=d, vel=100 + i * 4)
    S.see(t0, 'title_plaque')


# ------------------------------------------------------------------------------------------------
CHANT = [('啤', 'A3'), ('酒', 'A3'), ('饮', 'G3'), ('料', 'G3'), ('矿', 'F3'), ('泉', 'G3'), ('水', 'A3')]
POEM1 = ['花', '生', '瓜', '子', '八', '宝', '粥']
POEM2 = ['两', '个', '黄', '鹂', '鸣', '翠', '柳']


def chant_bar(S, seg, bar, syllables, lead=True, eighths=7, accents=(0, 2, 4), lead_track='sax', breath=False):
    """one chant bar in 7/8 (or 4/4 with a breath on the 8th eighth)."""
    for i in range(eighths if not breath else 7):
        syl, note = syllables[i] if isinstance(syllables[i], tuple) else (syllables[i], CHANT[i][1])
        t = S.T(seg, bar, i * 0.5)
        last = i == 6
        d = (1.0 if breath else 0.5) if last else 0.5
        if lead:
            S.add(lead_track, t=t, key=m(note), vel=118 if i in accents else 96, dur=S.dur(seg, bar, i * 0.5, i * 0.5 + d) * 0.9)
        S.see(t, 'syllable', text=syl, big=i in accents, idx=i, lead=lead)
    if breath:
        S.see(S.T(seg, bar, 3.5), 'breath')


def seven_groove(S, seg, bar, full=True, brass=True, bass=True, chord='Dm'):
    """7/8 breakbeat, 2+2+3: kick on eighths 1 3 5, snare 4 and 7, hats every eighth, bottles on 1/3/5."""
    for i in range(7):
        t = S.T(seg, bar, i * 0.5)
        S.add('drums', t=hum(t, 3), d='hh' if i not in (0, 2, 4) else 'hh_shank', vel=hv(96 if i in (0, 2, 4) else 70))
        S.add('woodblock', t=t, key=61, vel=50 if i not in (0, 2, 4) else 70, gain=0.4)   # trolley wheel clicks
        if i in (0, 2, 4):
            S.add('drums', t=t, d='kick', vel=124 if i == 0 else 108)
            S.add('kick_e', t=t, gain=0.7 if i == 0 else 0.55)
            S.add('bottle', t=t, gain=0.5 if i == 0 else 0.35)
            S.see(t, 'bottle', idx=i)
        if i in (3, 6) and full:
            S.add('drums', t=t, d='snare', vel=hv(120, 3))
            S.add('claps', t=t, key=60, vel=100)
    if bass:
        # distorted riff bass, 2+2+3: D D | F F | G G A
        riff = [('D2', 0), ('D3', 0.5), ('F2', 1.0), ('F3', 1.5), ('G2', 2.0), ('G3', 2.5), ('A2', 3.0)]
        if chord == 'C':
            riff = [('C2', 0), ('C3', 0.5), ('E2', 1.0), ('E3', 1.5), ('G2', 2.0), ('G3', 2.5), ('A2', 3.0)]
        for note, b in riff:
            S.add('bass_dist', t=S.T(seg, bar, b), key=m(note), vel=110, dur=S.dur(seg, bar, b, b + 0.45))
        S.add('sub', t=S.T(seg, bar, 0), note=subroot('Dm' if chord == 'Dm' else 'C'), dur=S.dur(seg, bar, 0, 1.0), gain=0.7)
    if brass:
        stabs = {'Dm': [('D4', 'F4', 'A4'), ('D4', 'F4', 'A4'), ('E4', 'G4', 'C5')], 'C': [('C4', 'E4', 'G4'), ('C4', 'E4', 'G4'), ('D4', 'F4', 'A4')]}[chord]
        for (b, notes) in zip((0, 1.0, 2.0), stabs):
            for note in notes:
                S.add('trumpet_stac', t=S.T(seg, bar, b), key=m(note) + 12, vel=112, dur=0.18)
                S.add('trombone_stac', t=S.T(seg, bar, b), key=m(note) - 12, vel=108, dur=0.18)
            S.add('tuba_stac', t=S.T(seg, bar, b), key=m(notes[0]) - 24, vel=110, dur=0.2)


def trolley(S):
    """3:42.25–4:06.68 啤酒饮料矿泉水: 8 with a breath, then 7 without (2+2+3), poem, your turn, 来——腿收一下."""
    # 2 bars 4/4 at 140 with a breath on the 8th eighth
    for bar in range(2):
        chant_bar(S, 'trolley.breath', bar, CHANT, breath=True)
        for i in range(8):
            t = S.T('trolley.breath', bar, i * 0.5)
            S.add('woodblock', t=t, key=61, vel=60, gain=0.4)
            S.add('drums', t=hum(t, 3), d='hh', vel=hv(80 if i % 2 == 0 else 62))
        for b in (0, 2):
            S.add('drums', t=S.T('trolley.breath', bar, b), d='kick', vel=110)
        S.add('drums', t=S.T('trolley.breath', bar, 3.5), d='rim', vel=90)   # the breath = a rimshot gap
        S.add('bottle', t=S.T('trolley.breath', bar, 0), gain=0.5)
        S.add('bass', t=S.T('trolley.breath', bar, 0), key=m('D2'), vel=100, dur=S.dur('trolley.breath', bar, 0, 3.4))
        S.add('sub', t=S.T('trolley.breath', bar, 0), note=subroot('Dm'), dur=S.dur('trolley.breath', bar, 0, 1.5), gain=0.6)
    # 不换气: 4 bars 7/8
    for bar in range(4):
        chant_bar(S, 'trolley.nobreath', bar, CHANT)
        seven_groove(S, 'trolley.nobreath', bar, chord='Dm' if bar % 2 == 0 else 'C')
    # 花生瓜子八宝粥 ×2, 两个黄鹂鸣翠柳 ×2 (same melody, new words)
    for bar in range(4):
        syl = POEM1 if bar < 2 else POEM2
        chant_bar(S, 'trolley.poem', bar, [(s, CHANT[i][1]) for i, s in enumerate(syl)])
        seven_groove(S, 'trolley.poem', bar, chord='Dm' if bar % 2 == 0 else 'C')
    # count-in: woodblock 1-2 · 1-2 · 1-2-3, groove thinned (no brass)
    for i in range(7):
        t = S.T('trolley.countin', 0, i * 0.5)
        S.add('woodblock', t=t, key=60, vel=120 if i in (0, 2, 4) else 84, gain=1.0)
        S.see(t, 'countin', idx=i)
    seven_groove(S, 'trolley.countin', 0, full=False, brass=False)
    # your turn: the chant lead drops out, everything else keeps going; amber syllables
    for bar in range(4):
        chant_bar(S, 'trolley.yourturn', bar, CHANT, lead=False)
        seven_groove(S, 'trolley.yourturn', bar, chord='Dm' if bar % 2 == 0 else 'C')
    # 来—— (held pad, drums out for half a bar) then 腿收一下 (two-beat build) → bridge drop
    tl = S.T('trolley.lai')
    S.add('pad', t=tl, notes=[m('A3'), m('D4'), m('E4')], dur=S.dur('trolley.lai', 0, 0, 3.5), gain=0.5)
    S.add('sax', t=tl, key=m('A3'), vel=110, dur=S.dur('trolley.lai', 0, 0, 1.5))
    S.see(tl, 'lai')
    S.see(S.T('trolley.lai', 0, 1.5), 'tuck_legs')
    for i in range(8):
        S.add('drums', t=S.T('trolley.lai', 0, 1.5 + i * 0.25), d='snare', vel=70 + i * 7)
    S.add('riser', t=S.T('trolley.lai', 0, 1.5), dur=S.dur('trolley.lai', 0, 1.5, 3.5), f0=400, f1=9000, gain=0.35)
    S.add('revcrash', t=S.T('zero.drift1'), gain=0.5)


# ------------------------------------------------------------------------------------------------
def chant_over_44(S, seg_names, lead_tracks=('brass_lead', 'lead_saw'), vel=112):
    """the 7/8 chant looping over 4/4 bars: 7 eighths per chant, continuous across sections."""
    t_start = T.seg(seg_names[0])['start']
    t_end = T.seg(seg_names[-1])['end']
    eighth = 60 / 140 / 2
    n = int(round((t_end - t_start) / eighth))
    for k in range(n):
        i = k % 7
        t = t_start + k * eighth
        syl, note = CHANT[i]
        for trk in lead_tracks:
            S.add(trk, t=t, key=m(note) + 12, vel=vel + (8 if i in (0, 2, 4) else 0), dur=eighth * (0.9 if i < 6 else 0.95))
        if i == 0:
            S.see(t, 'red_lantern', chant=k // 7)
        S.see(t, 'syllable', text=syl, big=i in (0, 2, 4), idx=i, lead=True)


def festival_bar(S, seg, bar, ch, gong=False, fill=False, power=1.0):
    t0 = S.T(seg, bar, 0)
    for b in range(4):
        S.add('kick_e', t=S.T(seg, bar, b), gain=0.9 * power)
        S.add('drums', t=S.T(seg, bar, b), d='kick', vel=118)
        S.add('drums', t=S.T(seg, bar, b + 0.5), d='hh_open' if b % 2 else 'hh', vel=96)
    for b in (1, 3):
        S.add('drums', t=S.T(seg, bar, b), d='snare', vel=124)
        S.add('claps', t=S.T(seg, bar, b), key=60, vel=118)
    for b in (0, 2.5):
        S.add('bigdrum', t=S.T(seg, bar, b), key=63, vel=120)    # concert bass drum = 大鼓
    if gong:
        S.add('gong', t=t0, key=60, vel=120)
        S.see(t0, 'gong')
    if fill:
        for i in range(8):
            S.add('cracker', t=hum(S.T(seg, bar, 3 + i * 0.125), 4), gain=0.35 + 0.05 * i)
        for i in range(4):
            S.add('drums', t=S.T(seg, bar, 3 + i * 0.25), d=('tom1', 'tom2', 'tom3', 'tom3')[i], vel=118)
    S.add('808', t=t0, note=subroot(ch), dur=S.dur(seg, bar, 0, 2) * 0.98, gain=0.8 * power)
    S.add('808', t=S.T(seg, bar, 2.5), note=subroot(ch), dur=S.dur(seg, bar, 2.5, 4) * 0.95, gain=0.7 * power)
    for note in CHORDS[ch]:
        S.add('supersaw', t=t0, notes=[m(note) + 12], dur=S.dur(seg, bar, 0, 4), gain=0.22 * power)
        S.add('strings', t=t0, key=m(note) + 12, vel=100, dur=S.dur(seg, bar, 0, 4))
        S.add('strings_lo', t=t0, key=m(note) - 12, vel=96, dur=S.dur(seg, bar, 0, 4))


def zero(S):
    """4:06.68–4:44.39 the bridge: 4/4 rails + white lamps vs 7/8 chant + red lanterns; 零点; the drop.
    Energy plan: drift 1 open (rails, kick on 1 and 3, bass, chant on sax) → drift 2 builds (snare, hats, timpani,
    strings up an octave, brass joins the chant, last bar a snare roll) → one beat of breath → 零点 → the drop."""
    prog = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C']     # bVII → i into 零点 (no A major: the chant's F would clash)
    for seg in ('zero.drift1', 'zero.drift2'):
        two = seg == 'zero.drift2'
        rail(S, seg, vel=114)
        for bar in range(7):
            ch = prog[bar]
            t0 = S.T(seg, bar, 0)
            S.see(t0, 'white_lamp', bar=bar)
            for b in ((0, 2) if not two else (0, 1.5, 2, 3.5)):
                S.add('drums', t=S.T(seg, bar, b), d='kick', vel=116 if b in (0, 2) else 92)
            if two and bar < 6:
                for b in (1, 3):
                    S.add('drums', t=S.T(seg, bar, b), d='snare', vel=112 + 2 * bar)
                for e in range(8):
                    S.add('drums', t=hum(S.T(seg, bar, e * 0.5), 3), d='hh', vel=hv(84 if e % 2 == 0 else 66))
                    S.add('shaker', t=S.T(seg, bar, e * 0.5 + 0.25), key=60, vel=70, gain=0.6)
            elif not two:
                S.add('drums', t=S.T(seg, bar, 3), d='rim', vel=86)
            S.add('bass', t=t0, key=root(ch, 2), vel=100, dur=S.dur(seg, bar, 0, 2) * 0.95)
            S.add('bass', t=S.T(seg, bar, 2.5), key=root(ch, 2), vel=92, dur=S.dur(seg, bar, 2.5, 4) * 0.9)
            S.add('sub', t=t0, note=subroot(ch), dur=S.dur(seg, bar, 0, 2) * 0.95, gain=0.5)
            for note in CHORDS[ch]:
                S.add('strings', t=t0, key=m(note) + (12 if two else 0), vel=(70 if not two else 86) + 3 * bar, dur=S.dur(seg, bar, 0, 4))
            if two:
                S.add('strings_lo', t=t0, key=root(ch, 3), vel=88 + 3 * bar, dur=S.dur(seg, bar, 0, 4))
                S.add('timpani', t=t0, key=m('D2') if ch in ('Dm', 'Bb') else m('A1'), vel=88 + 5 * bar, dur=1.0)
    chant_over_44(S, ['zero.drift1'], lead_tracks=('sax',), vel=100)
    chant_over_44(S, ['zero.drift2'], lead_tracks=('sax', 'brass_lead'), vel=108)
    # first alignment (preview): crash + gong + one firework
    ta = S.T('zero.drift2')
    S.add('drums', t=ta, d='crash', vel=124)
    S.add('gong', t=ta, key=61, vel=105)
    S.see(ta, 'align', n=1)
    S.see(ta, 'firework', style='single')
    # last bar: countdown 3 · 2 · 1 with a snare roll 16ths → 32nds, riser; one beat of breath before 零点
    for i, b in enumerate((0, 1, 2)):
        S.see(S.T('zero.drift2', 6, b), 'countdown', n=3 - i)
    for i in range(12):
        bb = i * 0.25 if i < 8 else 2 + (i - 8) * 0.25
        S.add('drums', t=S.T('zero.drift2', 6, bb), d='snare', vel=72 + 4 * i)
    for i in range(8):
        S.add('drums', t=S.T('zero.drift2', 6, 2 + i * 0.125), d='snare', vel=100 + 3 * i)
    S.add('riser', t=S.T('zero.drift2', 4, 0), dur=S.dur('zero.drift2', 4, 0, 11), f0=250, f1=11000, gain=0.45)
    tz = T.ZERO
    tb = S.T('zero.drift2', 6, 3)
    S.add('mute_drums', t=tb, t1=tz)
    S.add('mute_all', t=tb, t1=tz)
    S.add('pad', t=tb, notes=[m('G3'), m('C4'), m('E4')], dur=tz - tb + 0.25, gain=0.35, nomute=True)
    S.add('revcrash', t=tz, gain=0.8)
    S.see(tb, 'breath_snow')
    # 零点: the hardest hit
    S.add('impact', t=tz, note=m('D2'), gain=1.1)
    S.add('gong', t=tz, key=60, vel=127)
    S.add('drums', t=tz, d='crash', vel=127)
    S.add('drums', t=tz, d='crash2', vel=127)
    S.add('crackers', t=tz, dur=1.6, gain=0.8)
    S.see(tz, 'zero')
    S.see(tz, 'align', n=2)
    # drop: 8 bars 国潮 festival, the chant on brass + saw lead + zither over 4/4
    drop = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'Dm']
    for bar, ch in enumerate(drop):
        festival_bar(S, 'zero.drop', bar, ch, gong=bar % 2 == 0, fill=bar in (3, 7))
        S.see(S.T('zero.drop', bar), 'white_lamp', bar=bar)
        for e in range(16):
            S.add('tambourine', t=S.T('zero.drop', bar, e * 0.25), key=60, vel=88 if e % 2 else 60, gain=0.5)
    chant_over_44(S, ['zero.drop'], lead_tracks=('brass_lead', 'lead_saw', 'zither'), vel=118)
    for ev in list(S.tracks['kick_e']):
        if T.seg('zero.drop')['start'] <= ev['t'] < T.seg('zero.drop')['end']:
            S.see(ev['t'], 'firework', style='peony_gold')


# section energy (dB, applied to the whole mix before the master; linear between points). 零点 is the top.
ENERGY = [
    ('hook.96', 0, -3.0), ('hook.accel', 0, -3.0), ('hook.underpass', 0, -2.0), ('title', 0, -0.5), ('title', 2, -1.5),
    ('trolley.breath', 0, -5.0), ('trolley.nobreath', 0, -3.0), ('trolley.yourturn', 4, -3.0), ('trolley.lai', 0, -4.0),
    ('zero.drift1', 0, -7.0), ('zero.drift1', 7, -6.0), ('zero.drift2', 0, -5.0), ('zero.drift2', 7, -2.5),
    ('zero.drop', 0, 0.0), ('zero.drop', 8, 0.0),
]


def energy(S):
    for seg, bar, db in ENERGY:
        r = T.seg(seg)
        t = r['end'] if bar >= r['seg'].bars else S.T(seg, bar, 0)
        S.add('level', t=t, db=db)


SECTIONS = {'hook': hook, 'title': title, 'trolley': trolley, 'zero': zero, 'energy': energy}


def build(sections=None):
    S = Score()
    for name, fn in SECTIONS.items():
        if sections is None or name in sections:
            fn(S)
    for k in S.tracks:
        S.tracks[k].sort(key=lambda e: e['t'])
    S.vis.sort(key=lambda e: e['t'])
    return S


if __name__ == '__main__':
    S = build()
    for k, v in sorted(S.tracks.items()):
        print(f'{k:14s} {len(v):5d} events  {v[0]["t"]:7.2f} – {v[-1]["t"]:7.2f} s')
    print('vis', len(S.vis))
