#!/usr/bin/env python3
"""Render a composition on the GitHub Actions render farm and bring the result back.

Usage:
  python3 cloud_render.py COMPOSITION OUTPUT_NAME [--start N] [--end N] [--chunks N]
      [--music-start SECONDS] [--fade-in S] [--fade-out S]

What it does:
  1. copies src/ and public/ (minus the music) into the render-farm checkout,
  2. writes render.json and pushes it to the render-farm branch of $VE_REPO,
  3. polls the GitHub check runs until the combine job finishes,
  4. fetches the picture from the render-output branch into out/OUTPUT_NAME_pic.mp4,
  5. if --music-start is given, muxes the music from public/bgm.mp3 into out/OUTPUT_NAME.mp4.
"""
import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

import os
# Configure with environment variables (defaults are the ones used for 《应该没事吧》):
#   VE_PROJECT  the Remotion project (has src/, public/, package.json)
#   VE_FARM     a checkout of the render-farm branch (has .github/workflows/render.yml, scripts/plan.mjs)
#   VE_REPO     owner/repo that runs the farm
PROJECT = Path(os.environ.get('VE_PROJECT', '/home/claude/diji'))
FARM = Path(os.environ.get('VE_FARM', '/home/claude/vibe-render'))
REPO = os.environ.get('VE_REPO', 'jayjiao-debug/video')
FPS = 30


def sh(cmd, cwd=None, check=True):
    r = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if check and r.returncode != 0:
        sys.exit(f'command failed: {cmd}\n{r.stdout}\n{r.stderr}')
    return r.stdout.strip()


def sync_sources():
    for sub in ('src',):
        shutil.rmtree(FARM / sub, ignore_errors=True)
        shutil.copytree(PROJECT / sub, FARM / sub)
    for f in (PROJECT / 'public').iterdir():
        if f.name.startswith('bgm') and f.suffix == '.mp3':
            continue  # music never leaves this machine; the farm keeps silent stand-ins
        dst = FARM / 'public' / f.name
        if f.is_dir():
            shutil.rmtree(dst, ignore_errors=True)
            shutil.copytree(f, dst)
        else:
            shutil.copy2(f, dst)
    for f in ('package.json', 'package-lock.json', 'tsconfig.json'):
        shutil.copy2(PROJECT / f, FARM / f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('composition')
    ap.add_argument('output')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, required=True, help='last frame, inclusive')
    ap.add_argument('--chunks', type=int, default=16)
    ap.add_argument('--music-start', type=float, default=None)
    ap.add_argument('--fade-in', type=float, default=0.0)
    ap.add_argument('--fade-out', type=float, default=0.5)
    a = ap.parse_args()

    sync_sources()
    job_id = f'{a.output}-{int(time.time())}'
    (FARM / 'render.json').write_text(json.dumps({
        'id': job_id, 'composition': a.composition, 'start': a.start, 'end': a.end,
        'chunks': a.chunks, 'output': a.output,
    }, indent=2) + '\n')
    sh('git add -A', cwd=FARM)
    sh(['git', 'commit', '-qm', f'render {a.output} ({a.composition} {a.start}-{a.end})'], cwd=FARM)
    sh('git fetch -q origin render-farm && git rebase -q origin/render-farm', cwd=FARM)
    sh('git push -q origin render-farm', cwd=FARM)
    sha = sh('git rev-parse HEAD', cwd=FARM)
    print(f'pushed {sha[:7]}; job {job_id}', flush=True)

    t0 = time.time()
    while True:
        time.sleep(30)
        raw = sh(['gh', 'api', f'repos/{REPO}/commits/{sha}/check-runs?per_page=100', '--jq',
                  '[.check_runs[] | {n: .name, s: .status, c: .conclusion}]'], check=False)
        try:
            runs = json.loads(raw)
        except json.JSONDecodeError:
            continue
        done = sum(r['s'] == 'completed' for r in runs)
        bad = [r['n'] for r in runs if r['c'] not in (None, 'success', 'skipped')]
        print(f'{int(time.time() - t0):4d}s  {done}/{len(runs)} done', flush=True)
        if bad:
            sys.exit(f'render failed: {bad}')
        if any(r['n'] == 'combine' and r['s'] == 'completed' for r in runs):
            break
        if time.time() - t0 > 60 * 60:
            sys.exit('timed out after 60 minutes')

    tmp = Path('/tmp/claude-0/render-output')
    shutil.rmtree(tmp, ignore_errors=True)
    sh(f'git clone -q --depth 1 --branch render-output https://github.com/{REPO} {tmp}')
    result = json.loads((tmp / 'result.json').read_text())
    if result['id'] != job_id:
        sys.exit(f'render-output holds {result["id"]}, expected {job_id}')
    pic = PROJECT / 'out' / f'{a.output}_pic.mp4'
    with open(pic, 'wb') as fo:
        for part in sorted(tmp.glob(f'{a.output}.mp4.part*')):
            fo.write(part.read_bytes())
    frames = sh(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                 'stream=nb_read_packets', '-of', 'csv=p=0', str(pic)])
    print(f'picture: {pic} ({frames} frames, farm wall-clock {(result["finished"] - result["started"]) / 60:.1f} min)')

    if a.music_start is not None:
        dur = (a.end - a.start + 1) / FPS
        af = []
        if a.fade_in > 0:
            af.append(f'afade=t=in:st=0:d={a.fade_in}')
        if a.fade_out > 0:
            af.append(f'afade=t=out:st={dur - a.fade_out:.3f}:d={a.fade_out}')
        final = PROJECT / 'out' / f'{a.output}.mp4'
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(pic), '-ss', str(a.music_start), '-t', f'{dur:.3f}',
               '-i', str(PROJECT / 'public' / 'bgm.mp3'), '-map', '0:v', '-map', '1:a',
               '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_range', 'tv',
               '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-shortest']
        if af:
            cmd[cmd.index('-c:a'):cmd.index('-c:a')] = ['-af', ','.join(af)]
        cmd.append(str(final))
        sh(cmd)
        print(f'final: {final}')


if __name__ == '__main__':
    main()
