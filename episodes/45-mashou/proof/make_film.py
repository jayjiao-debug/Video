#!/usr/bin/env python3
"""ep45 full film: render the master timeline (scene 'film') in segments to /dev/shm, encode each segment (frames deleted after),
join, mux the music (bgm_cut45_150.wav cut to the film end, fade 132.77 → end), write the master, the send version, a contact sheet
(1 frame / 2 s) and a check report (camera speed per shot, beat events, black / frozen frames).
usage: make_film.py [--from SEG] [--only-finish]"""
import json, math, os, shutil, subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
SHM = Path('/dev/shm/p45/film'); SHM.mkdir(parents=True, exist_ok=True)
OUT = Path('/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep45_final'); OUT.mkdir(parents=True, exist_ok=True)
AUDIO = HERE.parent / 'audio' / 'bgm_cut45_150.wav'
FPS, END, FADE0 = 30, 134.798, 132.77
NF = round(END * FPS)            # 4044 frames
SEG = 500
NAME = '七个回国一个回家_v1'
segs = [(a, min(NF, a + SEG)) for a in range(0, NF, SEG)]
start = int(sys.argv[sys.argv.index('--from') + 1]) if '--from' in sys.argv else 0
VENC = ['-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', str(FPS)]
if '--only-finish' not in sys.argv:
    subprocess.run(['python3', str(HERE / 'build_proof.py'), '/dev/shm/p45/proof.html'], check=True)
    for k, (a, b) in enumerate(segs):
        if k < start: continue
        fr = SHM / f'seg{k:02d}'
        subprocess.run(['node', str(HERE / 'render.mjs'), '/dev/shm/p45/proof.html', 'film', str(a / FPS), str(b / FPS), str(fr), '2'], check=True)
        shutil.copy(fr / 'meta.json', SHM / f'meta{k:02d}.json')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-start_number', str(a), '-i', str(fr / 'f%05d.png'), *VENC, str(SHM / f'seg{k:02d}.mp4')], check=True)
        shutil.rmtree(fr)
        print('segment', k, a, b, 'done', flush=True)
# join + music
(SHM / 'list.txt').write_text(''.join(f"file '{SHM / f'seg{k:02d}.mp4'}'\n" for k in range(len(segs))))
master = OUT / f'{NAME}.mp4'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(SHM / 'list.txt'), '-i', str(AUDIO), '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-af', f'atrim=0:{END},afade=t=out:st={FADE0}:d={END - FADE0:.3f}', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
    '-t', f'{END}', '-movflags', '+faststart', str(master)], check=True)
send = OUT / f'{NAME}_send.mp4'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(master), '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-b:v', '1250k', '-maxrate', '1600k', '-bufsize', '2500k',
    '-preset', 'slow', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', str(send)], check=True)
# contact sheet, 1 frame / 2 s
from PIL import Image, ImageDraw, ImageFont
tmp = SHM / 'sheet'; tmp.mkdir(exist_ok=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(master), '-vf', 'fps=1/2,scale=480:270', str(tmp / 's%03d.png')], check=True)
ims = sorted(tmp.glob('s*.png')); cols, W, H = 6, 480, 270
sheet = Image.new('RGB', (cols * W, math.ceil(len(ims) / cols) * (H + 22)), (16, 16, 16)); d = ImageDraw.Draw(sheet)
fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
for i, p in enumerate(ims):
    x, y = (i % cols) * W, (i // cols) * (H + 22); sheet.paste(Image.open(p).convert('RGB'), (x, y + 22)); d.text((x + 6, y + 3), f'{i * 2:.0f} s', fill=(230, 220, 200), font=fnt)
sheet.save(OUT / f'{NAME}_contact.jpg', quality=86); shutil.rmtree(tmp)
# checks: camera speed per shot (camId), events, black / frozen frames
meta = {}
for k in range(len(segs)):
    p = SHM / f'meta{k:02d}.json'
    if p.exists(): meta.update({int(a): b for a, b in json.loads(p.read_text()).items()})
def spd(c1, c2):
    m = 0
    for gx in range(9):
        for gy in range(5):
            sx, sy = gx * 240, gy * 270; wx, wy = c1['x'] + (sx - 960) / c1['z'], c1['y'] + (sy - 540) / c1['z']
            m = max(m, math.hypot(960 + (wx - c2['x']) * c2['z'] - sx, 540 + (wy - c2['y']) * c2['z'] - sy))
    return m
sp = {}
for i in range(NF - 1):
    a, b = meta.get(i), meta.get(i + 1)
    if not a or not b or 'cam' not in a or 'cam' not in b or a.get('camId') != b.get('camId'): continue
    v = spd(a['cam'], b['cam']); cid = a.get('camId', 0)
    if v > sp.get(cid, (0, 0))[0]: sp[cid] = (round(v, 2), round(i / FPS, 3))
ev = {}
for i in sorted(meta):
    for e in meta[i].get('events', []):
        for k in e:
            if k not in ev: ev[k] = (i, round(i / FPS, 3))
bd = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(master), '-vf', 'blackdetect=d=0.1:pix_th=0.06,freezedetect=n=0.0005:d=0.5', '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
black = [l.strip() for l in bd.splitlines() if 'black_start' in l]; freeze = [l.strip() for l in bd.splitlines() if 'freeze_start' in l or 'freeze_duration' in l]
probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,pix_fmt,color_range,color_space,sample_rate,channels,bit_rate', '-of', 'json', str(master)], capture_output=True, text=True).stdout
rep = {'master': str(master), 'send': str(send), 'send_MB': round(send.stat().st_size / 1e6, 2), 'max_cam_px_per_frame_by_shot': sp, 'events_first_frame': ev, 'black': black, 'freeze': freeze, 'probe': json.loads(probe)}
(OUT / f'{NAME}_report.json').write_text(json.dumps(rep, ensure_ascii=False, indent=1))
print(json.dumps({k: v for k, v in rep.items() if k != 'probe'}, ensure_ascii=False, indent=1))
