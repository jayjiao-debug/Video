#!/usr/bin/env python3
"""finish_v9.py <pic.mp4> <中文名> : master (picture copied, music at -14 LUFS) + 发送版 (< 30 MB) + QA."""
import subprocess, sys, numpy as np
from pathlib import Path
pic, name = Path(sys.argv[1]), sys.argv[2]
out = Path('out'); master = out / f'{name}.mp4'; send = out / f'{name}_发送版.mp4'; log = f'/tmp/claude-0/x264_{pic.stem}'
run = lambda c: subprocess.run(c, check=True, capture_output=True, text=True)
run(['ffmpeg', '-v', 'error', '-y', '-i', str(pic), '-i', (sys.argv[3] if len(sys.argv) > 3 else 'out/music_v8.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
     '-movflags', '+faststart', '-shortest', str(master)])
for p in (1, 2):
    c = ['ffmpeg', '-v', 'error', '-y', '-i', str(master), '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-b:v', '1020k', '-maxrate', '2400k', '-bufsize', '4800k',
         '-x264-params', 'aq-mode=3', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-pass', str(p), '-passlogfile', log]
    c += ['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(send)]
    run(c)
for f in (master, send):
    d = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', str(f)]).stdout.strip()
    print(f.name, d)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(send), '-vf', 'scale=96:54,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 54, 96).astype(float); dd = np.abs(np.diff(fr, axis=0)).mean((1, 2))
print('frames', len(fr), 'single-frame glitches', [round((i + 1) / 30, 2) for i in range(1, len(dd) - 2) if dd[i] > 6 and dd[i + 1] > 6 and dd[i - 1] < 2 and dd[i + 2] < 2][:8])
print(run(['ffmpeg', '-hide_banner', '-i', str(send), '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr.split('Summary:')[-1].replace('\n', ' ')[:300])
