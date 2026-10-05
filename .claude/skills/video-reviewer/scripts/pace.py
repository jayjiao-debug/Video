#!/usr/bin/env python3
"""Reading-pace check for subtitle-only films (owner's rule: about 7 characters a second).

on screen ≈ 0.5 s to notice + chars / 7 + 0.6 s to look at the picture.
TOO FAST: the line leaves before it can be read.  WAIT: the viewer finished reading and is waiting.
GAP: no subtitle for > 2 s (fine only for a named visual beat: title, the drop, the end card).

usage: pace.py lines.json [--cps 7] [--film-end SECONDS]
lines.json: [[start, end, "text"], ...]  (brackets like [重点] are stripped)
"""
import argparse, json, re


def chars(s):
    s = re.sub(r'[\[\]{}]', '', s)
    return len(re.findall(r'[一-鿿]|[A-Za-z]+|\d+(?:[.,]\d+)*', s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('lines'); ap.add_argument('--cps', type=float, default=7.0); ap.add_argument('--film-end', type=float)
    a = ap.parse_args()
    lines = json.load(open(a.lines))
    lines.sort(key=lambda l: l[0])
    wait_total, flags = 0.0, []
    print(f"{'time':>12}  {'n':>3} {'on':>5} {'need':>5}  text")
    for i, (s, e, txt) in enumerate(lines):
        n = chars(txt); on = e - s; need = 0.5 + n / a.cps + 0.6
        tag = ''
        if on < need - 0.25:
            tag = 'TOO FAST'; flags.append(['MAJOR', f'{s:.1f}s "{txt}" shows {on:.1f}s, needs {need:.1f}s'])
        elif on - need > 1.2:
            tag = 'WAIT'; wait_total += on - need; flags.append(['MINOR', f'{s:.1f}s "{txt}" holds {on - need:.1f}s after it is read'])
        print(f'{s:6.1f}-{e:5.1f}  {n:3d} {on:5.1f} {need:5.1f}  {txt}  {tag}')
        if i + 1 < len(lines):
            gap = lines[i + 1][0] - e
            if gap > 2.0:
                flags.append(['CHECK', f'no subtitle {e:.1f}–{lines[i + 1][0]:.1f}s ({gap:.1f}s): is a named visual beat happening here?'])
    end = a.film_end or lines[-1][1]
    print(f'\nwaiting after reading: {wait_total:.1f}s = {100 * wait_total / end:.0f}% of the film (target ≤ 12%)')
    if wait_total / end > 0.12:
        flags.append(['MAJOR', f'{100 * wait_total / end:.0f}% of the runtime is waiting: tighten lines or add story'])
    json.dump(flags, open(a.lines.replace('.json', '_pace_flags.json'), 'w'), ensure_ascii=False)
    for sev, m in flags:
        print(f'  [{sev}] {m}')


if __name__ == '__main__':
    main()
