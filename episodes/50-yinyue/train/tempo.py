"""Tempo map for 《开往零点的列车》. One table of sections drives music, picture, LED and subtitles.

Beats are quarter notes everywhere. A 7/8 bar is 3.5 beats and a 3/4 bar is 3 beats.
A tempo ramp is linear in beat position, so a ramp of B beats from T0 to T1 lasts 60*B/(T1-T0)*ln(T1/T0) s.
The film starts 0.31 s before the first 哐 (frame 0 is already moving).
"""
import math
from dataclasses import dataclass, field

OFFSET = 0.31            # the first 哐 lands here (s)
RAIL_M = 12.5            # standard rail length (m): one joint per beat
G = 9.81


@dataclass
class Seg:
    name: str            # section id (chapter.part)
    bars: int
    num: int = 4         # meter numerator
    den: int = 4         # meter denominator
    t0: float = 120.0    # tempo at start (quarter notes per minute)
    t1: float = None     # tempo at end (None = steady)
    swing: float = 0.0   # 0 = straight; 1/3 = triplet swing (2:1)
    tags: dict = field(default_factory=dict)

    @property
    def beats_per_bar(self):
        return self.num * 4 / self.den

    @property
    def beats(self):
        return self.bars * self.beats_per_bar

    @property
    def tend(self):
        return self.t0 if self.t1 is None else self.t1

    def dur(self):
        return self.time_at(self.beats)

    def time_at(self, b):
        """seconds from segment start to beat b (0..beats)."""
        if self.t1 is None or abs(self.t1 - self.t0) < 1e-9:
            return 60.0 * b / self.t0
        k = (self.t1 - self.t0) / self.beats
        return 60.0 / k * math.log((self.t0 + k * b) / self.t0)

    def beat_at(self, t):
        if self.t1 is None or abs(self.t1 - self.t0) < 1e-9:
            return t * self.t0 / 60.0
        k = (self.t1 - self.t0) / self.beats
        return self.t0 * (math.exp(k * t / 60.0) - 1) / k

    def tempo_at(self, b):
        if self.t1 is None:
            return self.t0
        return self.t0 + (self.t1 - self.t0) * b / self.beats


# The film, in order. Names match the treatment's beat sheet (§4) and tempo map (Appendix A).
SEGS = [
    Seg('hook.96', 1, t0=96),
    Seg('hook.accel', 3, t0=96, t1=120),
    Seg('hook.underpass', 1, t0=120),
    Seg('title', 2, t0=120),
    Seg('yingzuo.bpm', 4, t0=120),
    Seg('yingzuo.baba', 6, t0=120),
    Seg('yingzuo.ban', 4, t0=120),            # 2 bars 一板一眼 (2/4 feel) + 2 bars 一板三眼
    Seg('yingzuo.dongci', 4, t0=120),
    Seg('yingzuo.countin', 1, t0=120),
    Seg('yingzuo.yourturn', 2, t0=120),
    Seg('yingzuo.he', 2, t0=120),
    Seg('wopu.limp', 2, t0=120),
    Seg('wopu.waltz', 12, num=3, den=4, t0=120),
    Seg('wopu.phone', 2, t0=120),
    Seg('window.house', 8, t0=120),
    Seg('window.build', 1, t0=120),
    Seg('window.trap', 8, t0=120),
    Seg('overtake.approach', 2, t0=120),
    Seg('overtake.offbeat', 4, t0=120),
    Seg('overtake.countin', 1, t0=120),
    Seg('overtake.yourturn', 2, t0=120),
    Seg('overtake.sync', 3, t0=120),
    Seg('overtake.brakes', 2, t0=120, t1=60),
    Seg('dining.red', 1, t0=60),
    Seg('dining.swing', 10, t0=80, swing=1 / 3),
    Seg('dining.accel', 1, t0=80, t1=95),
    Seg('dumpling.puzzle', 2, t0=95),
    Seg('dumpling.reveal', 2, t0=95),
    Seg('dumpling.tunnel', 8, t0=95),
    Seg('dumpling.ramp', 2, t0=95, t1=140),
    Seg('trolley.breath', 2, t0=140),
    Seg('trolley.nobreath', 4, num=7, den=8, t0=140),
    Seg('trolley.poem', 4, num=7, den=8, t0=140),
    Seg('trolley.countin', 1, num=7, den=8, t0=140),
    Seg('trolley.yourturn', 4, num=7, den=8, t0=140),
    Seg('trolley.lai', 1, num=7, den=8, t0=140),
    Seg('zero.drift1', 7, t0=140),
    Seg('zero.drift2', 7, t0=140),
    Seg('zero.drop', 8, t0=140),
    Seg('arrive.ritard', 4, t0=140, t1=70),
    Seg('arrive.end', 1, t0=70),
]


def build(segs=SEGS, offset=OFFSET):
    """→ list of dicts with absolute start/end seconds and global bar numbers."""
    out, t, bar = [], offset, 0
    for s in segs:
        d = s.dur()
        out.append({'seg': s, 'name': s.name, 'start': t, 'end': t + d, 'bar0': bar})
        t += d
        bar += s.bars
    return out


TABLE = build()
END = TABLE[-1]['end']
ZERO = next(r['end'] for r in TABLE if r['name'] == 'zero.drift2')   # 零点 = 4:30.68


def seg(name):
    return next(r for r in TABLE if r['name'] == name)


def t_of(name, bar=0, beat=0.0):
    """absolute time of (bar, beat) inside a section; beat in quarter notes from the bar line."""
    r = seg(name)
    s = r['seg']
    return r['start'] + s.time_at(bar * s.beats_per_bar + beat)


def tempo_at_time(t):
    for r in TABLE:
        if r['start'] <= t < r['end']:
            s = r['seg']
            return s.tempo_at(s.beat_at(t - r['start']))
    return TABLE[-1]['seg'].tend


def beat_at_time(t):
    """continuous quarter-note count since the first 哐 (beat 0 at OFFSET). Negative before it."""
    if t < TABLE[0]['start']:
        return (t - TABLE[0]['start']) * TABLE[0]['seg'].t0 / 60.0
    b = 0.0
    for r in TABLE:
        s = r['seg']
        if t < r['end']:
            return b + s.beat_at(t - r['start'])
        b += s.beats
    return b + (t - END) * TABLE[-1]['seg'].tend / 60.0


def train_x(t):
    """distance the train has travelled (m) at film time t: one 12.5 m rail per beat, so a wheel set that
    starts on a joint at the first 哐 crosses a joint exactly on every beat."""
    return RAIL_M * beat_at_time(t)


def countdown(t):
    """「距零点」 LED string at film time t (real time, counts down to 零点)."""
    left = max(0.0, ZERO - t)
    m, sec = divmod(int(left), 60)      # floor, like a real clock
    return f'{m:02d}:{sec:02d}'


def kmh_for_bpm(bpm):
    """one rail joint per beat on 12.5 m rails."""
    return bpm * RAIL_M * 3.6 / 60


def spacing_m(bpm, per_beat):
    """trackside spacing so that `per_beat` objects pass per beat at the train speed for `bpm`."""
    return kmh_for_bpm(bpm) / 3.6 * 60 / bpm / per_beat


def lantern_length(half_period):
    """simple pendulum length whose bottom passes are `half_period` s apart."""
    return G * (2 * half_period / (2 * math.pi)) ** 2


def euclid(k, n):
    """Bjorklund / Euclidean rhythm E(k, n) as onset indices (0-based), rotated to start on 0."""
    pts = sorted({math.floor(i * n / k) for i in range(k)})
    return pts


def swing_pos(eighth_index, swing=1 / 3):
    """position in beats of the n-th eighth note under swing (1/3 = triplet 2:1)."""
    beat, off = divmod(eighth_index, 2)
    return beat + (0.0 if off == 0 else 0.5 + swing / 2 * 1.0)  # 1/3 swing → off-beat at 2/3


def fmt(t):
    m, s = divmod(t, 60)
    return f'{int(m)}:{s:05.2f}'


if __name__ == '__main__':
    for r in TABLE:
        s = r['seg']
        tt = f"{s.t0:g}" + (f"→{s.t1:g}" if s.t1 else '')
        print(f"{fmt(r['start'])}–{fmt(r['end'])}  bar {r['bar0']:3d}  {s.bars:2d}×{s.num}/{s.den}  {tt:>8}  {r['name']}")
    print('END', fmt(END), ' 零点', fmt(ZERO))
