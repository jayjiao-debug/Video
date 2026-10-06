#!/usr/bin/env python3
"""The short, sparse SFX layer for the BGM-only cut of 《最后一面》: 8 effects, each under ~1 s, quiet, only where the
picture makes a hard move (the title, three camera dives/whips, the two big numbers/drops, the reunion).
Reuses the synthesisers in sfx.py. Writes out/sfx_select/ (stem, cue .srt, clips) and out/sfx_select.wav.

    python3 scripts/sfx_select.py
"""
import re
import subprocess
from pathlib import Path

src = (Path(__file__).parent / 'sfx.py').read_text()
exec(src[: src.index('# ------------------------------------------------------------------ cues')])  # the synthesisers

OUT = ROOT / 'out' / 'sfx_select'
(OUT / 'clips').mkdir(parents=True, exist_ok=True)
for f in (OUT / 'clips').glob('*.wav'):
    f.unlink()
cut = {'title': fb(32), 'intro': fb(36), 'model': fb(46), 'net': fb(82), 'b48': fb(96), 'drop': fb(161), 'pay': fb(177)}
SEL = [
    (cut['title'], '标题落下', lambda: impact(0.9, 0.7), -11),
    (cut['intro'] - 0.2, '甩镜', lambda: whoosh(0.45, -0.6, 0.6, 400, 3500), -17),
    (cut['model'] - 0.22, '推进', lambda: whoosh(0.5, -0.2, 0.2, 200, 2600), -16),
    (cut['net'] - 0.22, '推进到红点', lambda: whoosh(0.5, 0.2, -0.2, 200, 2600), -16),
    (cut['b48'], '48百分', lambda: impact(0.8, 0.9), -12),
    (cut['drop'], '第二次重拍', lambda: impact(1.0, 0.9), -10),
    (cut['pay'] - 0.22, '旋转推进', lambda: whoosh(0.5, 0.5, -0.5, 250, 3000), -17),
    (87.9, '重逢', lambda: chime(784, 1.0), -18),
]
N = int(END * SR)
stem = np.zeros((N + 3 * SR, 2)); srt = []
ts = lambda s: f'{int(s // 3600):02d}:{int(s // 60) % 60:02d}:{int(s) % 60:02d},{int(round((s % 1) * 1000)) % 1000:03d}'
for i, (t0, name, snd, db) in enumerate(SEL, 1):
    x = norm(snd(), db)
    # keep every effect short: fade the tail out by 1.0 s at most
    L = min(len(x), int(1.0 * SR)); x = x[:L].copy(); f = int(0.25 * SR); x[-f:] *= np.linspace(1, 0, f)[:, None]
    a = int(t0 * SR); stem[a:a + L] += x
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', str(OUT / 'clips' / f'{i:02d}_{name}.wav')], input=x.astype(np.float32).tobytes(), check=True)
    srt.append(f'{i}\n{ts(t0)} --> {ts(t0 + L / SR)}\n[音效 {i:02d}] {name}\n')
stem = stem[:N]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', str(OUT / '最后一面_精选音效轨.wav')], input=stem.astype(np.float32).tobytes(), check=True)
(OUT / '最后一面_精选音效.srt').write_text('\n'.join(srt), encoding='utf-8')
print(len(SEL), 'effects; stem peak', round(20 * np.log10(np.max(np.abs(stem)) + 1e-9), 1), 'dBFS')
