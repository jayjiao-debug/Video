#!/usr/bin/env python3
"""Freeze the exact code behind a finished video.

Usage:  python3 archive.py TAG VIDEO [COMPOSITION] [--note "..."]
  e.g.  python3 archive.py ep3-v3-final out/它在瞄准谁_v3.mp4 V3Film

It commits everything, tags the commit TAG, records the video's checksum in ARCHIVE.md,
and writes out/archive/TAG_source.zip (a runnable copy of the project at that commit).
Rebuild later with:  git checkout TAG && npm ci && npx remotion render COMPOSITION
"""
import argparse, hashlib, subprocess, datetime, json
from pathlib import Path

import os
ROOT = Path(os.environ.get('VE_PROJECT', '.')).resolve()
sh = lambda *c: subprocess.run(c, cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()

ap = argparse.ArgumentParser()
ap.add_argument('tag'); ap.add_argument('video'); ap.add_argument('composition', nargs='?', default='')
ap.add_argument('--note', default='')
a = ap.parse_args()
video = (ROOT / a.video).resolve()
md5 = hashlib.md5(video.read_bytes()).hexdigest()
probe = json.loads(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=width,height', '-of', 'json', str(video)))
dur = float(probe['format']['duration']); st = probe['streams'][0]

sh('git', 'add', '-A')
if sh('git', 'status', '--porcelain'):
    sh('git', 'commit', '-q', '-m', f'Snapshot {a.tag}: code behind {video.name}')
sha = sh('git', 'rev-parse', '--short', 'HEAD')
sh('git', 'tag', '-f', a.tag)
log = ROOT / 'ARCHIVE.md'
if not log.exists():
    log.write_text('# 成片存档\n\n每个成片对应的代码版本。重渲：`git checkout <标签> && npm ci && npx remotion render <合成>`\n\n'
                   '| 标签 | 日期 | 提交 | 合成 | 成片 | 规格 | MD5 | 备注 |\n|---|---|---|---|---|---|---|---|\n')
with log.open('a') as f:
    f.write(f'| {a.tag} | {datetime.date.today()} | {sha} | {a.composition} | {video.name} | {st.get("width")}×{st.get("height")} · {dur:.1f}s | {md5} | {a.note} |\n')
sh('git', 'add', 'ARCHIVE.md'); sh('git', 'commit', '-q', '-m', f'Archive entry for {a.tag}')
sh('git', 'tag', '-f', a.tag)
out = ROOT / 'out' / 'archive'; out.mkdir(parents=True, exist_ok=True)
sh('git', 'archive', '--format=zip', '-o', str(out / f'{a.tag}_source.zip'), a.tag)
print(f'{a.tag} -> {sha}  ({video.name}, md5 {md5})')
print(f'source: {out / (a.tag + "_source.zip")}')
