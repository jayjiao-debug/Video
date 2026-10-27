"""Unit tests for the maths the film states on screen (treatment §3 and Appendix B). Run: python3 -m pytest -q"""
import math
import tempo as T


def near(a, b, tol=0.02):
    return abs(a - b) <= tol


def test_section_times_match_treatment():
    want = {
        'hook.accel': 2.81, 'hook.underpass': 9.51, 'title': 11.51, 'yingzuo.bpm': 15.51,
        'wopu.limp': 61.51, 'wopu.waltz': 65.51, 'wopu.phone': 83.51, 'window.house': 87.51,
        'window.trap': 105.51, 'overtake.approach': 121.51, 'overtake.brakes': 145.51,
        'dining.red': 151.05, 'dining.swing': 155.05, 'dining.accel': 185.05,
        'dumpling.puzzle': 187.80, 'dumpling.reveal': 192.85, 'dumpling.tunnel': 197.91,
        'dumpling.ramp': 218.12, 'trolley.breath': 222.25, 'trolley.nobreath': 225.68,
        'trolley.poem': 231.68, 'trolley.countin': 237.68, 'trolley.lai': 245.18,
        'zero.drift1': 246.68, 'zero.drift2': 258.68, 'zero.drop': 270.68, 'arrive.ritard': 284.40,
    }
    for name, t in want.items():
        assert near(T.seg(name)['start'], t), (name, T.seg(name)['start'], t)
    assert near(T.END, 297.33)


def test_zero_is_4_30_68():
    assert near(T.ZERO, 270.68)


def test_bpm_speed():
    # BPM = km/h × 4/3 on 12.5 m rails
    for bpm, kmh in [(96, 72), (120, 90), (95, 71.25), (140, 105)]:
        assert near(T.kmh_for_bpm(bpm), kmh, 1e-9)


def test_trackside_spacing():
    # 1 / 2 / 4 / 8 per beat → 12.5 / 6.25 / 3.125 / 1.5625 m, at any speed
    for bpm in (96, 120, 140):
        for per, m in [(1, 12.5), (2, 6.25), (4, 3.125), (8, 1.5625)]:
            assert near(T.spacing_m(bpm, per), m, 1e-9)


def test_lantern():
    L = T.lantern_length(0.5)                 # bottom passes 0.5 s apart = straight eighths at 60
    assert near(L, 0.2485, 5e-4)
    hook = 0.75 * L                            # cord catches 3/4 of the way down
    short = 0.25 * L
    half_short = math.pi * math.sqrt(short / T.G)   # half period of the short side
    assert near(half_short, 0.25, 1e-3)        # long side 0.5 s + short side 0.25 s = 2:1
    assert near(60 / (0.5 + 0.25), 80, 1e-6)   # one beat at 80
    assert near(hook, 0.186, 1e-3)


def test_swing_positions():
    # swung eighths sit on triplet positions 1 and 3 of each beat
    assert near(T.swing_pos(0), 0.0, 1e-9)
    assert near(T.swing_pos(1), 2 / 3, 1e-9)
    assert near(T.swing_pos(2), 1.0, 1e-9)


def test_tresillo_and_seven():
    assert T.euclid(3, 8) == [0, 2, 5] or sorted(T.euclid(3, 8)) == [0, 2, 5]
    # the film's split is 3+3+2 → accents on eighths 1, 4, 7 (0-based 0, 3, 6)
    groups = [3, 3, 2]
    acc = [sum(groups[:i]) for i in range(len(groups))]
    assert acc == [0, 3, 6]
    seven = [2, 2, 3]
    assert [sum(seven[:i]) for i in range(3)] == [0, 2, 4]   # pulses 1, 3, 5


def test_polymeter_realigns_every_12s():
    eighth = 60 / 140 / 2
    assert near(56 * eighth, 12.0, 1e-9)
    assert 7 * 50 == 8 * 43.75 == 350
    # drift1 and drift2 are 7 bars of 4/4 each = 8 chants of 7/8 each
    for name in ('zero.drift1', 'zero.drift2'):
        r = T.seg(name)
        assert near(r['end'] - r['start'], 12.0, 1e-6)


def test_countdown():
    assert T.countdown(0.0) == '04:30'
    assert T.countdown(T.seg('dining.red')['start']) == '01:59'
    assert T.countdown(T.seg('zero.drift2')['start']) == '00:12'
    assert T.countdown(T.ZERO) == '00:00'


def test_waltz_bar_is_1_5s_and_seven_eight_bar_is_1_5s():
    w = T.seg('wopu.waltz')
    assert near((w['end'] - w['start']) / 12, 1.5, 1e-9)
    s = T.seg('trolley.nobreath')
    assert near((s['end'] - s['start']) / 4, 1.5, 1e-9)
