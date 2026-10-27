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
def poprock_bar(S, seg, bar, ch, kick=((0, 118), (1.5, 96), (2, 112)), snare=True, claps=False, hats='hh',
                bass=True, piano=True, vel=1.0, air='shaker'):
    """the 硬座 groove: drumline pop-rock at 120. Pumping 8th bass, piano on the beats, rail tick under it."""
    for b, v in kick:
        S.add('drums', t=hum(S.T(seg, bar, b), 3), d='kick', vel=hv(int(v * vel), 3))
    if snare:
        for b in (1, 3):
            S.add('drums', t=hum(S.T(seg, bar, b), 2), d='snare', vel=hv(int(120 * vel), 3))
    if claps:
        for b in (1, 3):
            S.add('claps', t=S.T(seg, bar, b), key=60, vel=112)
    if hats:
        for e in range(8):
            S.add('drums', t=hum(S.T(seg, bar, e * 0.5), 4), d=hats, vel=hv(88 if e % 2 == 0 else 70, 6))
    if bass:
        for e in range(8):
            S.add('bass', t=S.T(seg, bar, e * 0.5), key=root(ch, 2) + (12 if e == 7 else 0), vel=hv(104 if e % 2 == 0 else 90, 4),
                  dur=S.dur(seg, bar, e * 0.5, e * 0.5 + 0.42))
        S.add('sub', t=S.T(seg, bar, 0), note=subroot(ch), dur=S.dur(seg, bar, 0, 1.4), gain=0.5)
        S.add('sub', t=S.T(seg, bar, 2), note=subroot(ch), dur=S.dur(seg, bar, 2, 3.4), gain=0.45)
    if air:     # top end: a shaker on the 16ths (phones lose the low end; the groove has to live up here too)
        for x in range(16):
            S.add('shaker' if air == 'shaker' else 'tambourine', t=hum(S.T(seg, bar, x * 0.25), 3), key=60,
                  vel=hv(92 if x % 2 else 70, 6), gain=0.7)
    if piano:
        for b in range(4):
            for k, note in enumerate(CHORDS[ch]):
                S.add('piano', t=hum(S.T(seg, bar, b) + 0.006 * k, 3), key=m(note), vel=hv(78 if b % 2 == 0 else 66, 4),
                      dur=S.dur(seg, bar, b, b + 0.8))


def brass_motif(S, seg, bar, octave=0, vel=112, tracks=('trumpet', 'horn')):
    b = 0.0
    for note, d in MOTIF:
        for trk in tracks:
            S.add(trk, t=S.T(seg, bar, b), key=m(note) + octave - (12 if trk in ('horn', 'trombone') else 0), vel=vel,
                  dur=S.dur(seg, bar, b, b + d) * 0.9)
        b += d


def yingzuo(S):
    """0:15.51–1:01.51 硬座: BPM, 八拍, 一板一眼, 动次打次, your turn (打 on 2 & 4), 合. Drumline pop-rock at 120."""
    # BPM: 4 bars. The groove settles under the LED 「哐 120 次/分」; a rail tick on every beat.
    for bar, ch in enumerate(['Dm', 'Bb', 'F', 'C']):
        poprock_bar(S, 'yingzuo.bpm', bar, ch, vel=0.92)
        for note in CHORDS[ch]:
            S.add('strings_lo', t=S.T('yingzuo.bpm', bar), key=m(note) - 12, vel=74, dur=S.dur('yingzuo.bpm', bar, 0, 4))
    rail(S, 'yingzuo.bpm', vel=92)
    S.add('drums', t=S.T('yingzuo.bpm'), d='crash', vel=110)
    brass_motif(S, 'yingzuo.bpm', 2, vel=104)
    # 八拍: 6 bars = 3 groups of 8. The glock counts every beat; the first count of a group (the group number) rings
    # loudest with a crash and a timpani, so 「第一个数，在数第几组」 is heard.
    seg = 'yingzuo.baba'
    for bar, ch in enumerate(['Dm', 'Bb', 'F', 'C', 'Gm', 'A7']):
        poprock_bar(S, seg, bar, ch, claps=bar >= 4)
        for b in range(4):
            n = (bar % 2) * 4 + b          # 0..7 inside the 八拍
            grp = bar // 2
            t = S.T(seg, bar, b)
            top = n == 0
            S.add('glock', t=t, key=m('A5') if top else m('D5') if b == 0 else m('A4'), vel=120 if top else 92 if b == 0 else 72)
            S.see(t, 'count', n=n + 1, group=grp + 1, size=1.0 if b == 0 else 0.62, obj=('tea', 'thermos', 'noodle', 'mandarin')[b])
            if top:
                S.add('drums', t=t, d='crash', vel=112)
                S.add('timpani', t=t, key=m('D2'), vel=104, dur=1.0)
    rail(S, seg, vel=86)
    brass_motif(S, seg, 2, vel=108)
    brass_motif(S, seg, 4, vel=114, tracks=('trumpet', 'horn', 'trombone'))
    # 一板一眼: 2 bars of march, oom-pah (tuba on 板, trumpet stabs on 眼), bass drum + marching snare.
    seg = 'yingzuo.ban'
    for bar, ch in enumerate(['Dm', 'A']):
        for b in range(4):
            t = S.T(seg, bar, b)
            strong = b % 2 == 0
            if strong:
                S.add('bigdrum', t=t, key=63, vel=122)
                S.add('drums', t=t, d='kick', vel=112)
                S.add('tuba_stac', t=t, key=root(ch, 1) + 12, vel=118, dur=0.3)
                S.add('trombone_stac', t=t, key=root(ch, 2) + 12, vel=104, dur=0.25)
            else:
                for note in CHORDS[ch]:
                    S.add('trumpet_stac', t=t, key=m(note) + 12, vel=104, dur=0.18)
                S.add('drumline', t=t, key=60, vel=112)
            S.see(t, 'ban', strong=strong, text='板' if strong else '眼')
        for e in range(8):     # marching snare taps under it
            S.add('drumline', t=S.T(seg, bar, e * 0.5 + 0.25), key=60, vel=hv(52, 6))
    # 一板三眼: strong · weak · medium · weak. Cups big / small / medium / small.
    for bar, ch in enumerate(['Bb', 'C'], start=2):
        poprock_bar(S, seg, bar, ch, kick=((0, 126), (2, 106)), snare=False, hats='hh', piano=False)
        for b, (lvl, v) in enumerate((('板', 126), ('眼', 72), ('眼', 104), ('眼', 72))):
            t = S.T(seg, bar, b)
            if b == 0:
                S.add('drums', t=t, d='crash', vel=118)
                S.add('timpani', t=t, key=root(ch, 2), vel=118, dur=1.2)
            if b == 2:
                S.add('drums', t=t, d='ride_bell', vel=104)
            for k, note in enumerate(CHORDS[ch]):
                S.add('piano', t=t + 0.006 * k, key=m(note), vel=v, dur=S.dur(seg, bar, b, b + 0.9))
            S.add('drums', t=t, d='snare' if b % 2 else 'rim', vel=v - 10 if b % 2 else 70)
            S.see(t, 'ban', strong=b == 0, medium=b == 2, text=lvl, size=(1.0, 0.45, 0.75, 0.45)[b])
    rail(S, seg, vel=82)
    # 动次打次: the pop beat spelled out. 动 = kick on 1 & 3, 次 = hat on every "&", 打 = snare + card slap on 2 & 4.
    seg = 'yingzuo.dongci'
    for bar, ch in enumerate(['Dm', 'Bb', 'F', 'C']):
        poprock_bar(S, seg, bar, ch, kick=((0, 122), (2, 118)), hats=None, claps=bar >= 2)
        for e in range(8):
            t = S.T(seg, bar, e * 0.5)
            syl = '动次打次'[e % 4]
            if e % 2:
                S.add('drums', t=t, d='hh_semi', vel=hv(104, 4))
                S.see(t, 'ci', idx=e)                        # the tea-jar lid rattles
            S.see(t, 'dongci', text=syl, idx=e % 4)
            if syl == '打':
                S.see(t, 'cards', idx=e)
    rail(S, seg, vel=80)
    brass_motif(S, seg, 0, vel=108)
    brass_motif(S, seg, 2, vel=114, tracks=('trumpet', 'horn', 'trombone'))
    # count-in: 预备 ● ● ● ● woodblock; the band holds back (kick + bass only)
    seg = 'yingzuo.countin'
    poprock_bar(S, seg, 0, 'A7sus', kick=((0, 110), (2, 100)), snare=False, hats=None, piano=False, air=None)
    for b in range(4):
        t = S.T(seg, 0, b)
        S.add('woodblock', t=t, key=60, vel=124 if b == 0 else 108, gain=1.0)
        S.see(t, 'countin', idx=b)
    S.add('riser', t=S.T(seg), dur=S.dur(seg, 0, 0, 4), f0=500, f1=6000, gain=0.2)
    # your turn: 动 次 [打] 次. Snare and claps drop out; kick, bass, hats, brass keep going. The amber 打 fills on 2 & 4.
    seg = 'yingzuo.yourturn'
    for bar, ch in enumerate(['Dm', 'Bb']):
        poprock_bar(S, seg, bar, ch, kick=((0, 122), (2, 118)), snare=False, hats=None)
        for e in range(8):
            t = S.T(seg, bar, e * 0.5)
            if e % 2:
                S.add('drums', t=t, d='hh_semi', vel=hv(100, 4))
            S.see(t, 'dongci', text='动次打次'[e % 4], idx=e % 4, yourturn=True)
            if e % 4 == 2:
                S.see(t, 'yourturn_hit', text='打')
    brass_motif(S, seg, 0, vel=106)
    # 合: full band + crowd claps return, cards slam; the band stops dead on the last beat at the sleeper door.
    seg = 'yingzuo.he'
    S.add('drums', t=S.T(seg), d='crash', vel=124)
    S.add('drums', t=S.T(seg), d='crash2', vel=116)
    for bar, ch in enumerate(['F', 'C']):
        poprock_bar(S, seg, bar, ch, kick=((0, 124), (1.5, 100), (2, 118)), claps=True, hats='hh_semi', air='tambourine')
        for b in (1, 3):
            S.add('claps', t=S.T(seg, bar, b) + 0.012, key=62, vel=120)      # a second clap layer = the crowd
            S.see(S.T(seg, bar, b), 'cards', slam=True)
        for note in CHORDS[ch]:
            S.add('strings', t=S.T(seg, bar), key=m(note) + 12, vel=96, dur=S.dur(seg, bar, 0, 4))
    brass_motif(S, seg, 0, vel=120, tracks=('trumpet', 'horn', 'trombone'))
    tl = S.T(seg, 1, 3)
    for note in CHORDS['C']:
        S.add('trumpet_stac', t=tl, key=m(note) + 12, vel=124, dur=0.3)
        S.add('trombone_stac', t=tl, key=m(note) - 12, vel=120, dur=0.3)
    S.add('drums', t=tl, d='crash', vel=120)
    S.add('drums', t=tl, d='kick', vel=124)
    rail(S, seg, vel=96)
    S.see(S.T('wopu.limp'), 'door_closed')


# ------------------------------------------------------------------------------------------------
# 生日歌 (public domain) in F. (note, beats). Phrase k starts with its two-note pickup "hap-py".
BDAY = [
    [('C4', .75), ('C4', .25), ('D4', 1), ('C4', 1), ('F4', 1), ('E4', 2)],
    [('C4', .75), ('C4', .25), ('D4', 1), ('C4', 1), ('G4', 1), ('F4', 2)],
    [('C4', .75), ('C4', .25), ('C5', 1), ('A4', 1), ('F4', 1), ('E4', 1), ('D4', 1)],
    [('Bb4', .75), ('Bb4', .25), ('A4', 1), ('F4', 1), ('G4', 1), ('F4', 3)],
]
WALTZ_CH = ['C7', 'F', 'F7', 'Bb', 'C7', 'F', 'F', 'C7', 'C7', 'F', 'Bb', 'C7']
CHORDS.update({'C7': ['Bb3', 'E4', 'G4'], 'F7': ['A3', 'Eb4', 'F4'], 'Gm7': ['F3', 'Bb3', 'D4']})
ROOT.update({'C7': 'C', 'F7': 'F', 'Gm7': 'G'})


def melody_at(S, seg, bar, beat, notes, tracks, vel=100, oct_=0, per_bar=3, **kw):
    """lay (note, beats) from (bar, beat) onward, wrapping bars of per_bar beats; returns (bar, beat) after."""
    for note, d in notes:
        b0 = bar * per_bar + beat
        t0 = T.t_of(seg, 0, b0)
        t1 = T.t_of(seg, 0, b0 + d)
        for trk in tracks:
            S.add(trk, t=t0, key=m(note) + oct_, vel=vel, dur=(t1 - t0) * 0.95, **kw)
        beat += d
        while beat >= per_bar - 1e-9:
            beat -= per_bar
            bar += 1
    return bar, beat


def wopu(S):
    """1:01.51–1:27.51 卧铺: 生日歌 limping in 4/4 behind the door → a jazz-waltz lullaby in 3/4 → a phone on 公放."""
    # limp: 2 bars of 4/4. Phrase 1 crammed into 4/4, each phrase padded by a stumbling beat. Muffled by the door.
    seg = 'wopu.limp'
    muf = dict(muffle='door')
    lim = [('C4', .75), ('C4', .25), ('D4', 1), ('C4', 1), ('F4', 1), ('E4', 1), (None, 1), ('C4', .75), ('C4', .25)]
    b = 0.0
    for note, d in lim:
        if note:
            for trk, o in (('vibes', 12), ('glock', 12), ('piano', 12)):
                S.add(trk, t=S.T(seg, 0, b), key=m(note) + o, vel=112, dur=S.dur(seg, 0, b, b + d), **muf)
        b += d
    for bar, ch in enumerate(['F', 'C7']):
        for bb in range(4):
            S.add('pizz_bass' if bb % 2 == 0 else 'pizz_hi', t=S.T(seg, bar, bb), key=root(ch, 2) if bb % 2 == 0 else m(CHORDS[ch][1]),
                  vel=90, dur=0.3, **muf)
        S.see(S.T(seg, bar), 'limp_bar', bar=bar)
    for bar, ch in enumerate(['F', 'C7']):          # what leaks through a door: the low end
        for bb in range(4):
            S.add('kick_e', t=S.T(seg, bar, bb), gain=0.7, **muf)
        S.add('bass', t=S.T(seg, bar), key=root(ch, 2), vel=104, dur=S.dur(seg, bar, 0, 3.6), **muf)
        for note in CHORDS[ch]:
            S.add('strings', t=S.T(seg, bar), key=m(note), vel=90, dur=S.dur(seg, bar, 0, 4), **muf)
    S.see(S.T(seg, 1, 2), 'stumble')
    S.add('clack', t=S.T(seg), vel=80, muffle=True)
    S.add('clack', t=S.T(seg, 1), vel=80, muffle=True)
    # waltz: 12 bars of 3/4. 蓬 = pizz bass + low harp + the rail on 1; 嚓 嚓 = string chords + brushes on 2, 3.
    seg = 'wopu.waltz'
    S.add('door_slide', t=S.T(seg) - 0.25, gain=0.6)
    S.see(S.T(seg), 'door_open')
    for bar, ch in enumerate(WALTZ_CH):
        t1 = S.T(seg, 0, bar * 3)
        S.add('pizz_bass', t=t1, key=root(ch, 2), vel=112, dur=0.5)
        S.add('harp', t=t1, key=root(ch, 3), vel=96, dur=1.4)
        S.add('clack', t=t1, vel=96)
        S.add('drums', t=t1, d='kick_soft', vel=70)
        S.see(t1, 'peng', bar=bar, berth='lower')
        for k, bb in enumerate((1, 2)):
            tb = S.T(seg, 0, bar * 3 + bb)
            for note in CHORDS[ch]:
                S.add('pizz_hi', t=tb, key=m(note) + 12, vel=86 - 6 * k, dur=0.4)
                S.add('strings', t=tb, key=m(note), vel=70 - 6 * k, dur=S.dur(seg, 0, bar * 3 + bb, bar * 3 + bb + 0.8))
            S.add('drums', t=hum(tb, 4), d='snare', vel=hv(30, 4))          # brushes: ghost snare + a shaker swish
            S.add('shaker', t=tb - 0.04, key=60, vel=70, gain=0.6)
            S.see(tb, 'cha', bar=bar, berth=('middle', 'upper')[k])
        # harp arpeggio up through the chord on the "&"s, the music box glints on top
        for j, note in enumerate(CHORDS[ch]):
            S.add('harp', t=S.T(seg, 0, bar * 3 + 0.5 + j), key=m(note) + 12, vel=70, dur=0.8)
        for note in CHORDS[ch]:
            S.add('strings_lo', t=t1, key=m(note) - 12, vel=66 + (bar >= 6) * 12, dur=S.dur(seg, 0, bar * 3, bar * 3 + 3))
    # melody: phrase 2 picks up from the limp, then the song plays through in 3/4 (bars 0–5), then the strings take
    # the tune an octave up with the music box answering (bars 6–11).
    bar, beat = melody_at(S, seg, 0, 0.0, BDAY[1][2:] + [('C4', .75), ('C4', .25)], ('vibes', 'glock'), vel=104, oct_=12)
    bar, beat = melody_at(S, seg, bar, beat, BDAY[2][2:] + BDAY[3][:2], ('vibes', 'glock'), vel=104, oct_=12)
    bar, beat = melody_at(S, seg, bar, beat, BDAY[3][2:], ('vibes', 'glock'), vel=104, oct_=12)
    tune = [n for ph in BDAY for n in ph]
    melody_at(S, seg, 6, 0.0, tune[2:12], ('violin_solo', 'flute'), vel=96, oct_=12)
    S.see(S.T(seg, 0, 6 * 3), 'strings_take_tune')
    # phone 公放: 2 bars of tinny 广场舞 DJ through a phone speaker, under a quilt
    seg = 'wopu.phone'
    ph = dict(phone=True)
    S.see(S.T(seg), 'phone_glow')
    for bar, ch in enumerate(['Dm', 'C']):
        for bb in range(4):
            S.add('kick_e', t=S.T(seg, bar, bb), gain=0.9, **ph)
            S.add('hat_e', t=S.T(seg, bar, bb + 0.5), gain=1.0, **ph)
            if bb % 2:
                S.add('clap_e', t=S.T(seg, bar, bb), gain=0.9, **ph)
            S.see(S.T(seg, bar, bb), 'phone_pulse')
        for e8, note in enumerate(['D5', 'D5', 'F5', 'D5', 'A5', 'G5', 'F5', 'E5'] if bar == 0 else ['C5', 'C5', 'E5', 'C5', 'G5', 'F5', 'E5', 'D5']):
            S.add('cheap_lead', t=S.T(seg, bar, e8 * 0.5), key=m(note), dur=S.dur(seg, bar, e8 * 0.5, e8 * 0.5 + 0.4), gain=1.0, **ph)
    rail(S, seg, vel=84)


# ------------------------------------------------------------------------------------------------
def window(S):
    """1:27.51–2:01.51 窗外的细分: the phone's tinny DJ upgrades into a real house record (poles = kick, fence posts =
    8th hats, slats = 16th shaker, layered in one by one), a 1-bar build, then trap in half time (32nd rolls = ribbons)."""
    seg = 'window.house'
    prog = ['Dm9', 'Gm9', 'Bbmaj7', 'A7sus'] * 2
    S.add('impact', t=S.T(seg), note=m('D2'), gain=0.5)
    S.add('drums', t=S.T(seg), d='crash', vel=120)
    for bar, ch in enumerate(prog):
        for b in range(4):
            t = S.T(seg, bar, b)
            S.add('kick_e', t=t, gain=1.0)
            S.add('drums', t=t, d='kick', vel=112)
            S.see(t, 'pole', bar=bar, beat=b)                        # 电线杆：一拍一根
            if bar >= 2:
                to = S.T(seg, bar, b + 0.5)
                S.add('drums', t=to, d='hh_open', vel=hv(104, 4))    # 栅栏桩：一拍两根 (open on the "&")
                S.add('drums', t=t, d='hh', vel=hv(70, 4))
                S.see(t, 'post', bar=bar, idx=2 * b); S.see(to, 'post', bar=bar, idx=2 * b + 1)
            if bar >= 4:
                for k in range(4):
                    tk = S.T(seg, bar, b + 0.25 * k)
                    S.add('shaker', t=tk, key=60, vel=hv(100 if k % 2 else 76, 5), gain=0.9)   # 栅栏板：一拍四片
                    S.see(tk, 'slat', bar=bar, idx=4 * b + k)
            if bar >= 1 and b in (1, 3):
                S.add('claps', t=t, key=60, vel=108)
        # octave bass on the 8ths, off-beat accent (house pump)
        for e in range(8):
            S.add('bass', t=S.T(seg, bar, e * 0.5), key=root(ch, 2) + (12 if e % 2 else 0), vel=hv(112 if e % 2 else 96, 3),
                  dur=S.dur(seg, bar, e * 0.5, e * 0.5 + 0.4))
        S.add('sub', t=S.T(seg, bar, 0), note=subroot(ch), dur=S.dur(seg, bar, 0, 3.9), gain=0.45)
        # house piano stabs (syncopated), from bar 2; string stabs from bar 6
        if bar >= 2:
            for b in (0.5, 1.5, 2.25, 3.0, 3.5):
                for k, note in enumerate(CHORDS[ch]):
                    S.add('piano', t=S.T(seg, bar, b) + 0.004 * k, key=m(note) + 12, vel=hv(100, 4), dur=S.dur(seg, bar, b, b + 0.3))
        if bar >= 6:
            for b in (0, 1.5, 3):
                for note in CHORDS[ch]:
                    S.add('strings', t=S.T(seg, bar, b), key=m(note) + 12, vel=112, dur=S.dur(seg, bar, b, b + 0.35))
        if bar >= 4:
            S.add('ep', t=S.T(seg, bar, 0), key=m(CHORDS[ch][0]) + 12, vel=70, dur=S.dur(seg, bar, 0, 3.5))
    brass_motif(S, seg, 6, vel=104, tracks=('horn',))
    rail(S, seg, vel=72)
    # build: snare roll 16th → 32nd, the window lights dip, then half a beat of nothing
    seg = 'window.build'
    for i in range(8):
        S.add('drums', t=S.T(seg, 0, i * 0.25), d='snare', vel=70 + 4 * i)
    for i in range(12):
        S.add('drums', t=S.T(seg, 0, 2 + i * 0.125), d='snare', vel=100 + 2 * i)
    S.add('riser', t=S.T(seg), dur=S.dur(seg, 0, 0, 3.5), f0=300, f1=10000, gain=0.4)
    S.add('sub', t=S.T(seg), note=subroot('A7sus'), dur=S.dur(seg, 0, 0, 3.5), gain=0.4)
    S.add('mute_drums', t=S.T(seg, 0, 3.5), t1=S.T('window.trap'))
    S.see(S.T(seg), 'lights_dip')
    S.see(S.T(seg, 0, 3.5), 'lift')
    # trap: half-time, clap on 3, 808 tuned to the key, 16th hats with 32nd and triplet rolls, the horn motif as a pluck
    seg = 'window.trap'
    S.add('drums', t=S.T(seg), d='crash', vel=124)
    S.add('impact', t=S.T(seg), note=m('D2'), gain=0.7)
    tprog = ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'A7sus', 'A7sus']
    for bar, ch in enumerate(tprog):
        pat = [(0, 1.5), (1.75, 0.7), (2.5, 1.4)] if bar % 2 == 0 else [(0, 1.0), (1.0, 0.5), (2.5, 0.6), (3.25, 0.7)]
        for b, d in pat:
            t = S.T(seg, bar, b)
            S.add('808', t=t, note=subroot(ch), dur=S.dur(seg, bar, b, b + d), gain=0.9)
            S.add('kick_e', t=t, gain=0.8)
            S.add('drums', t=t, d='kick', vel=104)
        S.add('claps', t=S.T(seg, bar, 2), key=60, vel=120)
        S.add('clap_e', t=S.T(seg, bar, 2), gain=0.8)
        S.add('drums', t=S.T(seg, bar, 2), d='snare', vel=118)
        # hats: 16ths, with a roll every bar: 32nds (8 per beat) or triplets (6 per beat)
        roll_b, kind = ((3.0, 8) if bar % 2 == 0 else (1.0, 6))
        for x in range(16):
            b = x * 0.25
            if roll_b <= b < roll_b + 1:
                continue
            S.add('drums', t=hum(S.T(seg, bar, b), 2), d='hh', vel=hv(96 if x % 2 == 0 else 74, 4))
            S.add('hat_e', t=S.T(seg, bar, b), gain=0.5)
        for k in range(kind):
            b = roll_b + k / kind
            S.add('drums', t=S.T(seg, bar, b), d='hh', vel=70 + 6 * k)
            S.add('hat_e', t=S.T(seg, bar, b), gain=0.35 + 0.05 * k)
        S.see(S.T(seg, bar, roll_b), 'ribbon', per_beat=kind, dur=S.dur(seg, bar, roll_b, roll_b + 1))
        if bar % 2 == 0:
            S.add('pad', t=S.T(seg, bar), notes=[m(n) for n in CHORDS[ch]], dur=S.dur(seg, bar, 0, 8), gain=0.35)
    # the horn motif as a pluck, call and answer
    for bar in (0, 2, 4, 6):
        b = 0.0
        for note, d in MOTIF:
            S.add('pluck', t=S.T(seg, bar, b), key=m(note) + (0 if bar < 4 else 2 if note != 'A4' else 1), dur=0.3, gain=0.8)
            b += d
    for bar in range(8):
        S.add('clack', t=S.T(seg, bar), vel=88)


# ------------------------------------------------------------------------------------------------
CHORDS.update({'F7': ['A3', 'Eb4', 'F4'], 'Bb7': ['Ab3', 'D4', 'F4'], 'C7': ['Bb3', 'E4', 'G4'], 'A7': ['C#4', 'E4', 'G4', 'A4'],
               'Gm': ['D4', 'G4', 'Bb4']})
ROOT.update({'F7': 'F', 'Bb7': 'Bb', 'A7': 'A'})


def ska_bar(S, seg, bar, ch, skank=True, drums=True, bass=True, early=False):
    """ska at 120: kick on every beat, rim on 2 & 4, piano + EP chops on every "&" (= the slow train's lit windows)."""
    for b in range(4):
        t = S.T(seg, bar, b)
        if drums:
            S.add('drums', t=hum(t, 3), d='kick', vel=hv(108 if b % 2 == 0 else 96, 3))
            if b % 2:
                S.add('drums', t=hum(t, 2), d='rim', vel=hv(112, 3))
            S.add('drums', t=hum(S.T(seg, bar, b + 0.5), 3), d='hh', vel=hv(84, 5))
        if bass:
            walk = [0, 7, 9, 7][b]
            S.add('bass', t=t, key=root(ch, 2) + walk, vel=hv(106, 3), dur=S.dur(seg, bar, b, b + 0.85))
        ta = S.T(seg, bar, b + 0.5)
        if skank:
            for k, note in enumerate(CHORDS[ch]):
                S.add('piano', t=ta + 0.003 * k, key=m(note) + 12, vel=hv(104, 3), dur=0.11)
                S.add('ep', t=ta, key=m(note) + 12, vel=88, dur=0.12)
        S.see(ta, 'slow_lit', bar=bar, beat=b, sounding=skank)
    S.add('sub', t=S.T(seg, bar), note=subroot(ch), dur=S.dur(seg, bar, 0, 3.8), gain=0.35)


def overtake(S):
    """2:01.5–2:31.05 超车: ska. The slow train's windows light up between our 哐s (off-beat); your turn on 嚓;
    syncopated brass pushes across the bar line; then the brakes: a squeal in the key and a ritard 120 → 60."""
    seg = 'overtake.approach'
    for bar, ch in enumerate(['Bb', 'C']):
        ska_bar(S, seg, bar, ch, skank=False)
    brass_motif(S, seg, 0, vel=106, tracks=('trumpet', 'trombone'))
    rail(S, seg, vel=104)
    for seg, prog in (('overtake.offbeat', ['F', 'Dm', 'Bb', 'C']),):
        for bar, ch in enumerate(prog):
            ska_bar(S, seg, bar, ch)
        rail(S, seg, vel=104)
    seg = 'overtake.countin'
    ska_bar(S, seg, 0, 'F', drums=False)
    for b in range(4):
        S.add('woodblock', t=S.T(seg, 0, b), key=60, vel=124 if b == 0 else 108, gain=1.0)
        S.see(S.T(seg, 0, b), 'countin', idx=b)
    rail(S, seg, vel=100)
    seg = 'overtake.yourturn'
    for bar, ch in enumerate(['Dm', 'Bb']):
        ska_bar(S, seg, bar, ch, skank=False)
        for b in range(4):
            S.see(S.T(seg, bar, b + 0.5), 'yourturn_hit', text='嚓')
    rail(S, seg, vel=104)
    seg = 'overtake.sync'
    for bar, ch in enumerate(['C', 'F', 'Bb']):
        ska_bar(S, seg, bar, ch)
        nxt = ['F', 'Bb', 'C7'][bar]
        tp = S.T(seg, bar, 3.5)
        for note in CHORDS[nxt]:          # the push: lands on the "&" of 4, tied over the bar line
            S.add('trumpet', t=tp, key=m(note) + 12, vel=118, dur=S.dur(seg, bar, 3.5, 5.2))
            S.add('trombone', t=tp, key=m(note) - 12, vel=114, dur=S.dur(seg, bar, 3.5, 5.2))
        S.add('drums', t=tp, d='crash', vel=112)
        S.see(tp, 'slow_lit_early', bar=bar)
    rail(S, seg, vel=104)
    # brakes: 2 bars of ritard 120 → 60
    seg = 'overtake.brakes'
    ska_bar(S, seg, 0, 'Bb', drums=True)
    for note in CHORDS['C7']:
        S.add('strings', t=S.T(seg, 1), key=m(note), vel=84, dur=S.dur(seg, 1, 0, 4) + 0.5)
    S.add('bass', t=S.T(seg, 1), key=m('C2'), vel=96, dur=S.dur(seg, 1, 0, 4))
    S.add('squeal', t=S.T(seg, 0, 1), key=m('F6'), dur=S.dur(seg, 0, 1, 7.5), gain=0.8)
    S.add('squeal', t=S.T(seg, 0, 2.5), key=m('C7'), dur=S.dur(seg, 0, 2.5, 7.8), gain=0.5)
    S.see(S.T(seg, 0, 1), 'brakes')
    S.see(S.T(seg, 1, 2), 'red_signal')
    rail(S, seg, vel=96)


BOOGIE = [0, 4, 7, 9, 10, 9, 7, 4]     # 8-to-the-bar left hand over a dominant 7th: 1 3 5 6 b7 6 5 3


def boogie_bar(S, seg, bar, ch, rh=None, hats='shuffle', vel=1.0):
    """slow blues / boogie at 80, swung 2:1: piano left hand 8-to-the-bar, walking pizz bass, brushes, shuffle hats."""
    r = root(ch, 2)
    for i, iv in enumerate(BOOGIE):
        b = T.swing_pos(i)
        for trk in ('piano', 'oldpiano'):    # the grand doubled by the honky-tonk upright: the boogie's bite
            S.add(trk, t=hum(S.T(seg, bar, b), 4), key=r + iv, vel=hv(int((112 if i % 2 == 0 else 98) * vel), 4),
                  dur=S.dur(seg, bar, b, b + 0.4))
    for b, iv in enumerate([0, 4, 7, 9]):
        S.add('pizz_bass', t=S.T(seg, bar, b), key=r + iv - 12, vel=hv(104, 4), dur=0.6)
        S.add('drums', t=hum(S.T(seg, bar, b), 3), d='kick_soft' if b % 2 else 'kick', vel=hv(64 if b % 2 else 84, 4))
        if b % 2:
            S.add('drums', t=hum(S.T(seg, bar, b), 3), d='snare', vel=hv(44, 4))       # brush swish
            S.add('shaker', t=S.T(seg, bar, b) - 0.05, key=60, vel=70, gain=0.7)
        if hats == 'shuffle':
            for k, pos in enumerate((0.0, 2 / 3)):
                S.add('drums', t=hum(S.T(seg, bar, b + pos), 3), d='ride', vel=hv(78 if k == 0 else 62, 4))
        elif hats == 'triplets':          # 哗 啦 啦: all three cells of the beat
            for k in range(3):
                S.add('drums', t=hum(S.T(seg, bar, b + k / 3), 2), d='ride', vel=hv((84, 60, 70)[k], 3))
    if rh:
        n0 = len(S.tracks['piano'])
        rh(S, seg, bar, ch)
        for e in S.tracks['piano'][n0:]:
            e['vel'] = min(127, e['vel'] + 14)
            S.add('oldpiano', **dict(e, vel=max(1, e['vel'] - 8)))


def rh_stabs(S, seg, bar, ch):
    for b in (T.swing_pos(1), T.swing_pos(5)):
        for note in CHORDS[ch]:
            S.add('piano', t=S.T(seg, bar, b), key=m(note) + 12, vel=hv(96, 4), dur=S.dur(seg, bar, b, b + 0.3))


def rh_whistle(S, seg, bar, ch):
    """train-whistle tremolo: a dyad against the blue note, alternating in triplets for two beats."""
    lo, hi = [m('A4'), m('C5')], m('Eb5') + root(ch, 0) - m('F0')
    for k in range(6):
        b = 2 + k / 3
        keys = lo if k % 2 == 0 else [hi]
        for kk in keys:
            S.add('piano', t=S.T(seg, bar, b), key=kk + (root(ch, 2) - m('F2')), vel=92, dur=0.25)
    S.add('toywhistle', t=S.T(seg, bar, 2), key=60, vel=100, dur=S.dur(seg, bar, 2, 4), gain=0.6)


def rh_crossing(S, seg, bar, ch):
    """the crossing-bell figure: a high note pair hammered in triplets."""
    top = m(CHORDS[ch][-1]) + 24
    for k in range(9):
        S.add('piano', t=S.T(seg, bar, 1 + k / 3), key=top - (3 if k % 2 else 0), vel=96 - 2 * k, dur=0.18)


def rh_lick(S, seg, bar, ch):
    """a blues lick in triplets: 5 b7 1 b3 3 (… 5)."""
    r = root(ch, 4)
    for k, iv in enumerate([7, 10, 12, 15, 16, 19]):
        S.add('piano', t=S.T(seg, bar, 2 + k / 3), key=r + iv, vel=96, dur=0.22)


def dining(S):
    """2:31.05–3:07.80 餐车: red signal (1 low bar at 60, the bell even) → slow blues / boogie at 80 swung 2:1,
    the lantern bell long-short (叮——叮), triplets 哗啦啦 then swing (cells 1 and 3) → accel 80 → 95."""
    seg = 'dining.red'
    for b in range(4):
        t = S.T(seg, 0, b)
        S.add('handchime', t=t, key=84, vel=110, dur=1.0)
        S.see(t, 'bell', style='even')
        S.add('claves', t=S.T(seg, 0, b + 0.5), key=60, vel=50, gain=0.5)       # the ticking
    for k in ('F1', 'C2', 'F2', 'A3', 'Eb4'):
        S.add('piano', t=S.T(seg) + 0.01 * len(k), key=m(k), vel=92, dur=S.dur(seg, 0, 0, 4))
    S.add('strings_lo', t=S.T(seg), key=m('F2'), vel=96, dur=S.dur(seg, 0, 0, 4))
    S.add('pad', t=S.T(seg), notes=[m('A3'), m('Eb4'), m('F4')], dur=S.dur(seg, 0, 0, 4), gain=0.45)
    S.add('bass', t=S.T(seg), key=m('F1'), vel=100, dur=S.dur(seg, 0, 0, 3.9))
    S.see(S.T(seg), 'red_light')
    seg = 'dining.swing'
    S.see(S.T(seg), 'green_light')
    S.add('drums', t=S.T(seg), d='crash', vel=96)
    prog = ['F7', 'F7', 'Bb7', 'F7', 'Bb7', 'Bb7', 'F7', 'F7', 'C7', 'Bb7']
    rhs = [rh_stabs, rh_whistle, rh_stabs, rh_lick, rh_stabs, rh_lick, rh_whistle, rh_stabs, rh_crossing, rh_lick]
    for bar, ch in enumerate(prog):
        hats = 'triplets' if bar in (4, 5) else 'shuffle'
        boogie_bar(S, seg, bar, ch, rh=rhs[bar], hats=hats)
        for b in range(4):      # the lantern bell, caught by the hook: 叮——叮 (long on the beat, short on the swung "&")
            S.add('handchime', t=S.T(seg, bar, b), key=84, vel=92, dur=0.9)
            S.add('handchime', t=S.T(seg, bar, b + 2 / 3), key=84, vel=70, dur=0.25)
            S.see(S.T(seg, bar, b), 'bell', style='long')
            S.see(S.T(seg, bar, b + 2 / 3), 'bell', style='short')
            if bar in (4, 5):
                for k in range(3):
                    S.see(S.T(seg, bar, b + k / 3), 'triplet_cell', idx=k)
            if bar in (6, 7):
                for k in (0, 2):
                    S.see(S.T(seg, bar, b + k / 3), 'swing_cell', idx=k)
        if bar in (1, 5, 8):
            for note in CHORDS[ch]:
                S.add('horn', t=S.T(seg, bar), key=m(note), vel=80, dur=S.dur(seg, bar, 0, 3.5))
    # accel 80 → 95: a turnaround onto A7 (V of D minor), a rising triplet run, a drum fill; the steamer lid lifts
    seg = 'dining.accel'
    boogie_bar(S, seg, 0, 'A7', hats='triplets')
    for k in range(12):
        S.add('piano', t=S.T(seg, 0, k / 3), key=m('A4') + [0, 3, 4, 7, 9, 10, 12, 15, 16, 19, 21, 22][k], vel=90 + k, dur=0.2)
    for i, d in enumerate(('tom1', 'tom1', 'tom2', 'tom2', 'tom3', 'tom3')):
        S.add('drums', t=S.T(seg, 0, 2 + i / 3), d=d, vel=96 + 4 * i)
    S.add('steam', t=S.T(seg, 0, 3.5), dur=0.9, gain=1.0)
    S.see(S.T(seg, 0, 3.5), 'steamer_lid')


def dembow_bar(S, seg, bar, ch, lesson=True, full=True, pluck=None):
    """reggaeton at 95: kick on every beat; the dembow snare (3+3+2 in 16ths, each half bar); the lesson layer =
    marimba + 808 on eighths 1, 4, 7 of the bar (the bar-level tresillo = 3+3+2 dumplings)."""
    for b in range(4):
        t = S.T(seg, bar, b)
        S.add('kick_e', t=t, gain=0.85)
        S.add('drums', t=t, d='kick', vel=110)
        if full:
            S.add('drums', t=hum(S.T(seg, bar, b + 0.5), 2), d='hh', vel=hv(80, 5))
            S.add('steam', t=S.T(seg, bar, b + 0.5), dur=0.18, gain=0.5)       # steam puffs = the shaker
    if full:
        for x in (3, 6, 11, 14):
            t = S.T(seg, bar, x * 0.25)
            S.add('drums', t=t, d='snare', vel=hv(116, 3))
            S.add('clap_e', t=t, gain=0.5)
    for i, e8 in enumerate((0, 3, 6)):
        t = S.T(seg, bar, e8 * 0.5)
        d = (1.5, 1.5, 1.0)[i]
        if lesson:
            S.add('808', t=t, note=subroot(ch), dur=S.dur(seg, bar, e8 * 0.5, e8 * 0.5 + d) * 0.95, gain=0.85)
            for note in CHORDS[ch][:2]:
                S.add('marimba', t=t, key=m(note) + 12, vel=118, dur=0.4)
        S.see(t, 'tresillo', idx=i, eighth=e8)
    for note in CHORDS[ch]:
        S.add('pad', t=S.T(seg, bar), notes=[m(note)], dur=S.dur(seg, bar, 0, 4), gain=0.18)


def dumpling(S):
    """3:07.80–3:42.25 分饺子: 8 dumplings for 3 people = 3+3+2 → reggaeton in the tunnel → the ramp 95 → 140."""
    seg = 'dumpling.puzzle'
    for bar, ch in enumerate(['Dm', 'A7sus']):
        for e in range(8):
            t = S.T(seg, bar, e * 0.5)
            S.add('marimba', t=t, key=m(['D5', 'F5', 'A5', 'D6', 'A5', 'F5', 'D5', 'A4'][e]), vel=82 if bar == 0 else 70, dur=0.3)
            S.see(t, 'dumpling_bounce', idx=e, bar=bar)
        for b in (0, 2):
            S.add('drums', t=S.T(seg, bar, b), d='kick', vel=104)
        for b in range(4):
            S.add('drums', t=S.T(seg, bar, b + 0.5), d='hh', vel=74)
        for note in CHORDS[ch]:
            S.add('strings', t=S.T(seg, bar), key=m(note), vel=86, dur=S.dur(seg, bar, 0, 4))
            S.add('pad', t=S.T(seg, bar), notes=[m(note)], dur=S.dur(seg, bar, 0, 4), gain=0.2)
    S.add('bass', t=S.T(seg), key=m('D2'), vel=90, dur=S.dur(seg, 0, 0, 3.8))
    seg = 'dumpling.reveal'
    for bar, ch in enumerate(['Dm', 'Dm']):
        for e in range(8):
            t = S.T(seg, bar, e * 0.5)
            heavy = e in (0, 3, 6)
            S.add('marimba', t=t, key=m(['D5', 'F5', 'A5', 'D5', 'F5', 'A5', 'D5', 'F5'][e]) + (12 if heavy else 0), vel=124 if heavy else 76, dur=0.3)
            S.see(t, 'dumpling_hop', idx=e, bowl='AAABBBCC'[e], heavy=heavy, bar=bar)
            if heavy:
                S.add('808', t=t, note=subroot(ch), dur=S.dur(seg, bar, e * 0.5, e * 0.5 + (1.5 if e < 6 else 1.0)) * 0.95,
                      gain=0.7 if bar == 0 else 1.0)
                S.add('steam', t=t, dur=0.5, gain=0.8)
                S.add('drums', t=t, d='kick', vel=118)
                S.add('kick_e', t=t, gain=0.6 + 0.3 * bar)
            S.add('drums', t=hum(t, 2), d='hh', vel=hv(80, 4))
        S.add('claps', t=S.T(seg, bar, 3), key=60, vel=110)
    S.add('riser', t=S.T(seg, 1), dur=S.dur(seg, 1, 0, 4), f0=300, f1=8000, gain=0.3)
    # tunnel drop
    seg = 'dumpling.tunnel'
    S.add('impact', t=S.T(seg), note=m('D2'), gain=0.8)
    S.add('drums', t=S.T(seg), d='crash', vel=124)
    S.add('whoosh', t=S.T(seg) - 0.3, dur=1.5, gain=0.5)
    prog = ['Dm', 'Gm', 'Bb', 'A7'] * 2
    for bar, ch in enumerate(prog):
        dembow_bar(S, seg, bar, ch)
        for k in range(8):
            S.see(S.T(seg, bar, k * 0.5), 'tunnel_lamp', idx=k, red=k in (0, 3, 6))
    # the plucks: a hook in D minor riding the tresillo, from bar 2
    hook = [('A5', 0), ('F5', 0.75), ('D5', 1.5), ('E5', 2.25), ('F5', 3.0), ('E5', 3.5)]
    for bar in range(2, 8):
        for note, b in hook:
            S.add('pluck', t=S.T(seg, bar, b), key=m(note) - (2 if prog[bar] == 'Gm' and note == 'E5' else 0), dur=0.25, gain=0.7)
    brass_motif(S, seg, 4, vel=104, tracks=('horn', 'trombone'))
    brass_motif(S, seg, 6, vel=112, tracks=('trumpet', 'horn'))
    rail(S, seg, vel=90)
    # ramp 95 → 140: the train speeds up for 零点. Snare roll, chromatic bass climb, riser; into the trolley at 140
    seg = 'dumpling.ramp'
    for bar, ch in enumerate(['Bb', 'A7']):
        dembow_bar(S, seg, bar, ch, full=bar == 0)
    for i in range(16):
        S.add('drums', t=S.T('dumpling.ramp', 0, 4 + i * 0.25), d='snare', vel=70 + 3 * i)
    for i, k in enumerate(['D2', 'Eb2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2']):
        S.add('bass', t=S.T(seg, 0, i), key=m(k), vel=100 + i, dur=S.dur(seg, 0, i, i + 0.9))
    S.add('riser', t=S.T(seg), dur=S.dur(seg, 0, 0, 8), f0=200, f1=9000, gain=0.4)
    S.see(S.T(seg), 'speed_up')
    rail(S, seg, vel=100)


def arrive(S):
    """4:44.40–4:57.33 终点站：家. 4 bars of ritard 140 → 70, one layer drops out per bar; the last 哐 on the final
    downbeat with a steam puff and a station chime. Nothing gets louder or brighter after 零点."""
    seg = 'arrive.ritard'
    prog = ['Dm', 'Bb', 'F', 'C']
    rail(S, seg, vel=104)
    for bar, ch in enumerate(prog):
        t0 = S.T(seg, bar)
        if bar < 2:
            for b in range(4):
                S.add('drums', t=S.T(seg, bar, b), d='kick', vel=104 - 20 * bar)
            for b in (1, 3):
                S.add('drums', t=S.T(seg, bar, b), d='snare', vel=100 - 24 * bar)
        if bar < 3:
            S.add('bass', t=t0, key=root(ch, 2), vel=96 - 10 * bar, dur=S.dur(seg, bar, 0, 3.8))
        for note in CHORDS[ch]:
            S.add('strings', t=t0, key=m(note) + (12 if bar < 2 else 0), vel=88 - 6 * bar, dur=S.dur(seg, bar, 0, 4))
            S.add('piano', t=t0, key=m(note), vel=80 - 6 * bar, dur=S.dur(seg, bar, 0, 3.5))
    brass_motif(S, seg, 0, vel=100, tracks=('horn',))
    S.add('squeal', t=S.T(seg, 2), key=m('F6'), dur=S.dur(seg, 2, 0, 8), gain=0.35)
    S.see(S.T(seg), 'arrive')
    seg = 'arrive.end'
    te = S.T(seg)
    S.add('clack', t=te, vel=110)
    S.add('steam', t=te + 0.05, dur=1.4, gain=1.0)
    for k, note in enumerate(CHORDS['Dm9']):
        S.add('ep', t=te + 0.012 * k, key=m(note) + 12, vel=72, dur=3.0)
    for k, note in enumerate(['F5', 'A5', 'C6']):
        S.add('handchime', t=te + 0.6 + 0.45 * k, key=m(note), vel=84, dur=2.0)
    S.add('pizz_bass', t=te, key=m('D2'), vel=96, dur=1.0)
    S.see(te, 'last_clack')
    S.see(te + 0.05, 'steam_puff')


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
    ('yingzuo.bpm', 0, -3.5), ('yingzuo.baba', 0, -3.0), ('yingzuo.baba', 6, -2.0), ('yingzuo.ban', 0, -3.0),
    ('yingzuo.dongci', 0, -2.5), ('yingzuo.countin', 0, -4.0), ('yingzuo.yourturn', 0, -3.0), ('yingzuo.he', 0, -1.0),
    ('yingzuo.he', 2, -1.5),
    ('wopu.limp', 0, -2.0), ('wopu.waltz', 0, -2.5), ('wopu.waltz', 6, -2.0), ('wopu.waltz', 12, -2.0),
    ('wopu.phone', 0, -2.5), ('wopu.phone', 2, -2.5),
    ('window.house', 0, -4.0), ('window.house', 4, -3.0), ('window.house', 8, -2.0), ('window.trap', 0, -1.5),
    ('window.trap', 8, -2.0),
    ('overtake.approach', 0, -3.0), ('overtake.offbeat', 0, -2.5), ('overtake.countin', 0, -3.5), ('overtake.yourturn', 0, -3.0),
    ('overtake.sync', 0, -2.0), ('overtake.brakes', 0, -3.0), ('overtake.brakes', 2, -6.0),
    ('dining.red', 0, -2.0), ('dining.swing', 0, -0.5), ('dining.swing', 10, -1.0), ('dining.accel', 1, -1.5),
    ('dumpling.puzzle', 0, -2.5), ('dumpling.reveal', 0, -1.0), ('dumpling.tunnel', 0, -1.5), ('dumpling.tunnel', 8, -1.5),
    ('dumpling.ramp', 0, -2.5), ('dumpling.ramp', 2, -3.5),
    ('trolley.breath', 0, -3.5), ('trolley.nobreath', 0, -2.0), ('trolley.yourturn', 4, -2.0), ('trolley.lai', 0, -3.5),
    ('zero.drift1', 0, -5.0), ('zero.drift1', 7, -4.5), ('zero.drift2', 0, -5.0), ('zero.drift2', 7, -2.5),
    ('zero.drop', 0, 0.0), ('zero.drop', 8, 0.0), ('arrive.ritard', 0, -1.5), ('arrive.ritard', 4, -8.0), ('arrive.end', 1, -9.0),
]


def energy(S):
    for seg, bar, db in ENERGY:
        r = T.seg(seg)
        t = r['end'] if bar >= r['seg'].bars else S.T(seg, bar, 0)
        S.add('level', t=t, db=db)


SECTIONS = {'hook': hook, 'title': title, 'yingzuo': yingzuo, 'wopu': wopu, 'window': window, 'overtake': overtake, 'dining': dining, 'dumpling': dumpling,
            'trolley': trolley, 'zero': zero, 'arrive': arrive, 'energy': energy}


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
