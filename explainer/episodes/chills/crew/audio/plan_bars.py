"""The edit plan in measured bars (bar b = beats 4b..4b+3 of the refined beat list). Prints the segment table in film time."""
import json
B = json.load(open('audio/beats.json'))
bar = lambda b: B[4 * b]
# (id, kind, track bars [first, last] or None for silence, n_bars for silence, fx, gain_db)
PLAN = [
    ('hook',   'E0 original: build+breath',        (36, 39), 'none', 0),
    ('title',  'E0 the hardest drop (title)',       (40, 41), 'none', 0),
    ('bed1',   'BED loud after the drop',            (42, 48), 'none', -8),
    ('cut1',   'E1 build+breath, drop deleted',      (37, 39), 'none', 0),
    ('sil1',   'E1 silence where the drop was',      None,     'silence', 0),
    ('bed2',   'BED quiet break',                    (24, 27), 'none', 0),
    ('cut2',   'E2 quiet bars, no build',            (27, 29), 'none', 0),
    ('drop2',  'E2 drop with no build',              (40, 41), 'none', 0),
    ('bed3',   'BED loud',                           (42, 47), 'none', -8),
    ('cut3',   'E4 build',                           (37, 38), 'none', 0),
    ('wait3',  'E4 the breath x3 (drop 2 bars late)',(39, 39), 'repeat3', 0),
    ('drop3',  'E4 the late drop',                   (40, 41), 'none', 0),
    ('bed4',   'BED loud',                           (42, 46), 'none', -8),
    ('cut4',   'E5 build+breath muffled',            (38, 39), 'lowpass', 0),
    ('drop4',  'E5 the drop muffled',                (40, 41), 'lowpass', 0),
    ('bed5',   'BED muffled',                        (42, 45), 'lowpass', -6),
    ('sweep',  'payoff: build, filter opens',        (37, 38), 'sweep', 0),
    ('breath', 'payoff: the original breath',        (39, 39), 'none', 0),
    ('final',  'payoff: the full drop',              (40, 43), 'none', 0),
    ('outro',  'outro bars + fade',                  (78, 80), 'fade', -6),
]
def table():
    t = 0.0; out = []
    for sid, kind, bars, fx, g in PLAN:
        if bars is None:
            d = bar(40) - bar(39)          # one bar of silence
            seg = dict(id=sid, kind=kind, film_from=t, film_to=t + d, track=None, fx=fx, gain=g)
        else:
            a, b = bars
            reps = 3 if fx == 'repeat3' else 1
            end_beat = min(4 * (b + 1), len(B) - 1)
            d = (B[end_beat] - bar(a)) * reps if end_beat < len(B) - 1 else (164.49 - bar(a))
            seg = dict(id=sid, kind=kind, film_from=t, film_to=t + d, track=[bar(a), B[end_beat] if end_beat < len(B) - 1 else 164.49], reps=reps, fx=fx, gain=g)
        out.append(seg); t += d
    return out
if __name__ == '__main__':
    segs = table()
    for s in segs: print(f"{s['id']:<7} {s['film_from']:7.2f} {s['film_to']:7.2f}  ({s['film_to']-s['film_from']:5.2f}s)  track {s['track']}  {s['fx']} {s['gain']}  {s['kind']}")
    print('total', round(segs[-1]['film_to'], 2))
    json.dump(segs, open('audio/segments.json', 'w'), indent=1)
