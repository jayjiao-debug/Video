#!/usr/bin/env python3
"""Finish a film from its rendered picture track.

    python3 finish.py out/<name>_pic.mp4 <tag> scenes.json

scenes.json: {"title": "应该没事吧", "music": "public/bgm.mp3", "scenes": [["S1_开头", 0.0, 28.793], ...]}

1. Muxes the music (bgm.mp3, 0 -> film length, fade out over the last second) at -14 LUFS (two-pass loudnorm).
2. Send version (< 30 MB): two-pass x264 at 1600k + 160k AAC.
3. QA: single-frame glitch scan, unexpected black frames.
4. One clip per scene (with music) into out/应该没事吧_<tag>_分场景/.

To change one scene later: render only its frame range (cloud_render.py <Comp> <name> --start A --end B) and
run splice.py to drop it into the picture track, then run this script again.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(os.environ.get('VE_PROJECT', '.')).resolve()
PIC = Path(sys.argv[1])
TAG = sys.argv[2]
CFG = json.loads(Path(sys.argv[3]).read_text())
FPS = 30
TITLE = CFG['title']
MUSIC = ROOT / CFG.get('music', 'public/bgm.mp3')
SCENES = [tuple(s) for s in CFG['scenes']]
OUT = ROOT / 'out'
SCR = Path(os.environ.get('VE_TMP', '/tmp/video-engine'))
SCR.mkdir(parents=True, exist_ok=True)


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


n = int(run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
             'stream=nb_read_packets', '-of', 'csv=p=0', str(PIC)]).stdout.strip().strip(','))
dur = n / FPS
print(f'picture: {n} frames, {dur:.3f} s')

# 1. music
wav = SCR / f'{TAG}_music.wav'
run(['ffmpeg', '-v', 'error', '-y', '-i', str(MUSIC), '-t', f'{dur:.3f}',
     '-af', f'afade=t=out:st={dur - 1.0:.3f}:d=1.0', '-c:a', 'pcm_s16le', str(wav)])
meas = run(['ffmpeg', '-hide_banner', '-i', str(wav), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json',
            '-f', 'null', '-']).stderr
d = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', meas, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:"
      f"measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
film = OUT / f'{TITLE}_{TAG}.mp4'
run(['ffmpeg', '-v', 'error', '-y', '-i', str(PIC), '-i', str(wav), '-af', ln, '-ar', '48000', '-c:v', 'copy',
     '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', str(film)])
print('film:', film, f'{film.stat().st_size / 1e6:.1f} MB')

# 2. send version
send = OUT / f'{TITLE}_{TAG}_发送版.mp4'
for p in (1, 2):
    # fit under the 30 MB chat limit whatever the length (1600k for a 130 s film; less for longer ones)
    vk = min(1600, int(28.6e6 * 8 / dur / 1000) - 160)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(film), '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{vk}k',
           '-pass', str(p), '-passlogfile', str(SCR / f'{TAG}_x264')]
    cmd += ['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(send)]
    run(cmd)
print('send:', send, f'{send.stat().st_size / 1e6:.1f} MB')

# 3. QA
W, H = 192, 108
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(PIC), '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                     capture_output=True, check=True).stdout
f = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.float32)
d_prev = np.abs(f[1:-1] - f[:-2]).mean(axis=(1, 2))
d_next = np.abs(f[1:-1] - f[2:]).mean(axis=(1, 2))
d_skip = np.abs(f[2:] - f[:-2]).mean(axis=(1, 2))
spike = np.minimum(d_prev, d_next) - d_skip
bad = [(i + 1, round(float(spike[i]), 1)) for i in range(len(spike)) if spike[i] > 4.0]
print('single-frame glitches:', bad if bad else 'none')
lum = f.mean(axis=(1, 2))
odd = [i for i in range(len(lum)) if lum[i] < 2 and 0.3 * FPS < i < len(lum) - 2 * FPS]
print('unexpected black frames:', odd if odd else 'none')

# 4. scene clips (review quality, small enough to send)
cd = OUT / f'{TITLE}_{TAG}_分场景'
cd.mkdir(exist_ok=True)
for name, a, b in SCENES:
    fa, fb = round(a * FPS), min(round(b * FPS), n)
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{fa / FPS:.4f}', '-i', str(film), '-t', f'{(fb - fa) / FPS:.4f}',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-maxrate', '6M', '-bufsize', '12M', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(cd / f'{name}.mp4')])
for p in sorted(cd.glob('S*.mp4')):
    print(f'  {p.name}  {p.stat().st_size / 1e6:.1f} MB')
