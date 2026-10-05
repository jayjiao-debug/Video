#!/usr/bin/env python3
"""Create an episode folder from the crew templates.
usage: new_episode.py <NN-slug> "<working title>" [--root /home/claude/diji/episodes]"""
import argparse, datetime
from pathlib import Path

ap = argparse.ArgumentParser(); ap.add_argument('slug'); ap.add_argument('title'); ap.add_argument('--root', default='/home/claude/diji/episodes')
a = ap.parse_args()
tpl = Path(__file__).resolve().parent.parent / 'templates'
ep = Path(a.root) / a.slug
(ep / 'style').mkdir(parents=True, exist_ok=True)
for f in ['brief.md', 'facts.md', 'script.md', 'storyboard.md']:
    dst = ep / f
    if not dst.exists():
        dst.write_text((tpl / f).read_text().replace('<片名 working title>', a.title).replace('<片名>', a.title))
log = ep / 'crew_log.md'
if not log.exists():
    log.write_text(f'# Crew log: {a.title}\n\n| Time | Step | Who | Result | Minutes |\n|---|---|---|---|---|\n| {datetime.datetime.now():%Y-%m-%d %H:%M} | folder created | producer | | |\n')
print(ep)
