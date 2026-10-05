#!/usr/bin/env python3
"""Run every automatic check on one cut and write auto_checks.md for the reviewer.

usage: review.py --video FILM.mp4 --out DIR [--lines lines.json] [--script SCRIPT.md] [--src SRC_DIR] [--every 5]
"""
import argparse, json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def run(args):
    r = subprocess.run([sys.executable, *map(str, args)], capture_output=True, text=True)
    return (r.stdout + ('\n' + r.stderr if r.returncode else '')).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--lines'); ap.add_argument('--script'); ap.add_argument('--src'); ap.add_argument('--every', default='5')
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    parts = [f'# Automatic checks: {Path(a.video).name}\n']
    parts.append('## Technical (probe.py)\n```\n' + run([HERE / 'probe.py', a.video, '--out', out]) + '\n```\n')
    probe = json.loads((out / 'probe.json').read_text())
    if a.lines:
        parts.append('## Reading pace (pace.py)\n```\n' + run([HERE / 'pace.py', a.lines, '--film-end', probe['duration']]) + '\n```\n')
    if a.script:
        fa = [HERE / 'facts.py', a.script] + (['--lines', a.lines] if a.lines else []) + (['--src', a.src] if a.src else [])
        parts.append('## Sources (facts.py)\n```\n' + run(fa) + '\n```\n')
    if a.src:
        hits = subprocess.run(['grep', '-rn', '-e', 'Juno 出品', '-e', 'JUNO.credit', '-e', 'wikipedia', a.src], capture_output=True, text=True).stdout.strip()
        parts.append('## Brand rule (never "Juno 出品" on screen)\n```\n' + (hits or 'no hits') + '\n```\n')
    fr = [HERE / 'frames.py', a.video, '--out', out, '--every', a.every, '--probe', out / 'probe.json'] + (['--lines', a.lines] if a.lines else [])
    parts.append('## Frames for the visual pass (frames.py)\n```\n' + run(fr) + '\n```\n')
    sheets = json.loads((out / 'sheets.json').read_text())
    parts.append('Sheets to look at, in order:\n' + '\n'.join(f'- {s}' for s in sheets) + '\n')
    (out / 'auto_checks.md').write_text('\n'.join(parts))
    print('\n'.join(parts))


if __name__ == '__main__':
    main()
