#!/usr/bin/env python3
"""ep45 proofs: frames (render.mjs, on /dev/shm) → mp4 with the music cut to the same range, contact sheet (1 frame / 0.5 s),
camera-speed check (max screen displacement of a 9x5 grid between frames, px/frame) and the beat events from meta.json.
usage: make_proof.py NAME SCENE T0 T1 [--keep]"""
import json, math, os, shutil, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
HERE = Path(__file__).resolve().parent
name, scene, T0, T1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
FPS = 30; SHM = Path('/dev/shm/p45'); FR = SHM / name
OUT = Path('/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/proofs'); OUT.mkdir(parents=True, exist_ok=True)
AUDIO = HERE.parent / 'audio' / 'bgm_cut45_150.wav'
if not (FR / 'meta.json').exists():
    subprocess.run(['node', str(HERE / 'render.mjs'), str(SHM / 'proof.html'), scene, str(T0), str(T1), str(FR), '2'], check=True)
i0, i1 = round(T0 * FPS), round(T1 * FPS)
mp4 = OUT / f'{name}.mp4'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-start_number', str(i0), '-i', str(FR / 'f%05d.png'),
    '-ss', f'{i0 / FPS:.4f}', '-t', f'{(i1 - i0) / FPS:.4f}', '-i', str(AUDIO),
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(mp4)], check=True)
# contact sheet, 1 frame per 0.5 s
frames = list(range(i0, i1, FPS // 2)); W, H, cols = 480, 270, 4
rows = math.ceil(len(frames) / cols); sheet = Image.new('RGB', (cols * W, rows * (H + 22)), (16, 16, 16)); d = ImageDraw.Draw(sheet)
try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
except Exception: fnt = None
for k, i in enumerate(frames):
    im = Image.open(FR / f'f{i:05d}.png').convert('RGB').resize((W, H), Image.LANCZOS); x, y = (k % cols) * W, (k // cols) * (H + 22)
    sheet.paste(im, (x, y + 22)); d.text((x + 6, y + 3), f'{i / FPS:.2f} s  (f{i})', fill=(230, 220, 200), font=fnt)
sheet_p = OUT / f'{name}_contact.jpg'; sheet.save(sheet_p, quality=88)
# camera speed: grid points pushed through consecutive cameras
meta = json.loads((FR / 'meta.json').read_text()); meta = {int(k): v for k, v in meta.items()}
def spd(c1, c2):
    m = 0
    for gx in range(9):
        for gy in range(5):
            sx, sy = gx * 1920 / 8, gy * 1080 / 4
            wx, wy = c1['x'] + (sx - 960) / c1['z'], c1['y'] + (sy - 540) / c1['z']
            m = max(m, math.hypot(960 + (wx - c2['x']) * c2['z'] - sx, 540 + (wy - c2['y']) * c2['z'] - sy))
    return m
rep = {'mp4': str(mp4), 'sheet': str(sheet_p)}
for key in ['cam', 'camB2', 'camC']:
    sp = [(i, spd(meta[i][key], meta[i + 1][key])) for i in range(i0, i1 - 1) if key in meta.get(i, {}) and key in meta.get(i + 1, {}) and meta[i].get('camId', 0) == meta[i + 1].get('camId', 0)]
    if sp: mx = max(sp, key=lambda a: a[1]); rep[f'max_{key}_px_per_frame'] = [round(mx[1], 2), mx[0], round(mx[0] / FPS, 3)]
ev = {}
for i in range(i0, i1):
    for e in meta.get(i, {}).get('events', []):
        for k in e: ev.setdefault(k, []).append(i)
rep['event_frames'] = {k: [v[0], v[-1], round(v[0] / FPS, 3)] for k, v in ev.items()}
# luma of the first frame
im = Image.open(FR / f'f{i0:05d}.png').convert('L'); rep['luma_first'] = round(sum(im.getdata()) / (1920 * 1080), 1)
print(json.dumps(rep, ensure_ascii=False, indent=1))
(OUT / f'{name}_report.json').write_text(json.dumps(rep, ensure_ascii=False, indent=1))
if '--keep' not in sys.argv: shutil.rmtree(FR)
