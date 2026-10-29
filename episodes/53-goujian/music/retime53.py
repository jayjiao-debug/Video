"""Retime episodes/53-goujian/lines_read.json to the ep53 music grid -> lines_bars.json (same format).

Grid: DA(k) = 0.4432 + 2.2642k, beat P = 0.56605 (one grid for the whole film; see build53.py / MUSIC_NOTES.md).
Rule: every line keeps a window >= its lines_read length; landmarks sit on downbeats; other lines start on beats
(whole beats added only where a landmark forces it). Start of each line = (grid bar, beat) below.

  line  start (bar.beat)   beats  landmark
  H1    0.000 (frame 0)    -      the subtitle is on frame 0; the first downbeat DA(0) 0.443 = rust bloom
  H2    DA(2) b2            7     ends on the title
  ---   DA(4)  TITLE        4     title card on the bar-24 re-entry (first hard drop), 1 bar
  S1    DA(5)               8
  S3    DA(7)               8     DA(8) = the lull bar under row 2
  S4    DA(9)               6     DIVE (B pre downbeat)
  D1    DA(10) b3           8
  D2    DA(12) b3           8
  D3    DA(14) b3           5
  D4    DA(15) b4           5
  D5    DA(17)              8     DA(18) = the bar-15 fill (wind-up: the sheath is lifted and rinsed)
  D6    DA(19)              7     DRAW on the chorus downbeat
  I0    DA(20) b4           8
  I1    DA(22) b4           8
  B1    DA(24) b4           9     the film light clicks on at DA(25)
  M1    DA(27)              8     valley hit after the deep break: the macro zoom begins
  M2    DA(29)              8     valley hit
  M3    DA(31)              -     HUSH: ends 0.75 s before T1 (music faded out by then)
  ---   near silence 0.75 s
  T1    DA(33)              5     the hardest drop (bar 84)
  T2    DA(34) b2           7
  T3    DA(36)              8     the arrival (bar 88) at DA(37) is inside T3: the rewind lands
  E1    DA(38)              7
  L1    DA(39) b4           9
  R2    DA(42)              6
  R3    DA(43) b3           6     DA(43) = the 94-95 lift
  P1    DA(45)             10     the emotional peak; then 2 beats of air on bar 98's F
  END   DA(48)              4.0 s end card on the fall; film = END + 4.5 s = 3409 frames at 30 fps
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.join(HERE, '..')
P = 0.56605; BAR = 4 * P
DA = lambda k: 0.4432 + k * BAR
at = lambda bar, beat=1: DA(bar) + (beat - 1) * P

old = json.load(open(os.path.join(EP, 'lines_read.json')))
starts = [0.0, at(2, 2), at(5), at(7), at(9), at(10, 3), at(12, 3), at(14, 3), at(15, 4), at(17), at(19), at(20, 4),
          at(22, 4), at(24, 4), at(27), at(29), at(31), at(33), at(34, 2), at(36), at(38), at(39, 4), at(42), at(43, 3),
          at(45), at(48)]
ends = starts[1:] + [None]
ends[1] = at(4)                    # H2 ends on the title
ends[16] = at(33) - 0.75           # M3 ends 0.75 s before T1
ends[24] = at(47, 3)               # P1 ends; air = 2 beats on bar 98's F
ends[25] = at(48) + 4.0            # end card 4.0 s
assert len(starts) == len(old) == 26
new = []
for (s0, e0, txt, spk), s1, e1 in zip(old, starts, ends):
    s1r, e1r = round(s1, 3), round(e1, 3)
    assert e1r - s1r >= (e0 - s0) - 1e-9, (txt, e1r - s1r, e0 - s0)
    new.append([s1r, e1r, txt, spk])
for a, b in zip(new, new[1:]):
    assert b[0] >= a[1] - 1e-9
json.dump(new, open(os.path.join(EP, 'lines_bars.json'), 'w'), ensure_ascii=False, indent=0)
FILM = 3409 / 30
print('film', round(FILM, 4), 'title', round(at(4), 3), '-', round(at(5), 3), 'hush gap', round(at(33) - 0.75, 3), '-', round(at(33), 3),
      'air', round(at(47, 3), 3), '-', round(at(48), 3))
for (s0, e0, txt, spk), (s1, e1, _, _) in zip(old, new):
    print(f'{s0:7.2f}-{e0:7.2f} ({e0 - s0:4.2f})  ->  {s1:8.3f}-{e1:8.3f} ({e1 - s1:5.3f}, +{(e1 - s1) - (e0 - s0):4.2f})  {txt.splitlines()[0]}')
