#!/usr/bin/env python3
"""Sound effects for 《最后一面》, delivered as an independent layer the owner can keep or drop.

    python3 scripts/sfx.py

Every sound is synthesised here (no third-party samples): whooshes, impacts, sub drops, risers, ticks, counters,
pops, a chime, glitches, a slash, an error buzz. CUES lists when each one plays (film seconds, matched to the picture).

Writes, in out/sfx/:
  最后一面_音效轨.wav      the whole SFX layer on its own, 48 kHz stereo, starts at 0:00 (drop it under the video)
  最后一面_音效.srt         a cue sheet in SRT form (one entry per effect, so they can be seen and deleted in an editor)
  clips/NN_<name>.wav      every effect as a separate file, named by cue number
and out/最后一面_含音效预览.mp4 (picture + music + effects) for listening.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'out' / 'sfx'
(OUT / 'clips').mkdir(parents=True, exist_ok=True)
SR = 48000
rng = np.random.default_rng(7)
B = json.loads((ROOT / 'src/music.json').read_text())['beats']
fb = lambda i: B[i] - B[16]
END = fb(206) + 0.3


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, r, shape=3.0):
    """attack a s, then exponential-ish release over the rest"""
    x = np.ones(n)
    na = max(1, int(a * SR))
    x[:na] = np.linspace(0, 1, na)
    rest = n - na
    if rest > 0:
        x[na:] = np.exp(-shape * np.linspace(0, 1, rest) * (r if r else 1))
    return x


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def stereo(m, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([m * l * 1.41, m * r * 1.41], 1)


def reverb(x, secs=1.6, mix=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.linspace(0, 6, n))[:, None]
    ir = lp(ir.T, 6000).T
    wet = np.stack([np.pad(fftconvolve(x[:, c], ir[:, c]), (0, 1))[: len(x) + n] for c in range(2)], 1)
    dry = np.vstack([x, np.zeros((n, 2))])
    wet /= np.max(np.abs(wet)) + 1e-9
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def norm(x, peak_db):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


# ------------------------------------------------------------------ the sounds
def whoosh(d=0.6, pan_from=-0.8, pan_to=0.8, lo=300, hi=4000):
    n = int(d * SR); t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    # sweep a band through the noise: several short filtered segments cross-faded
    seg = 32; out = np.zeros(n)
    for i in range(seg):
        a, z = i * n // seg, (i + 1) * n // seg
        u = (i + 0.5) / seg
        c = lo * (hi / lo) ** np.sin(np.pi * u)
        out[a:z] = bp(noise, max(60, c * 0.6), min(SR / 2 - 100, c * 1.6))[a:z]
    out *= np.sin(np.pi * t) ** 1.6
    m = np.zeros((n, 2))
    pan = pan_from + (pan_to - pan_from) * t
    m[:, 0] = out * np.cos((pan + 1) * np.pi / 4); m[:, 1] = out * np.sin((pan + 1) * np.pi / 4)
    return reverb(m, 0.8, 0.18)


def impact(big=1.0, tail=1.6):
    d = 0.9 + tail
    t = t_(d)
    f = 40 + 70 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 / big))
    crack = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 40)
    body = bp(rng.standard_normal(len(t)), 80, 600) * np.exp(-t * 9)
    m = sub * 1.0 + crack * 0.5 + body * 0.35
    return reverb(stereo(np.tanh(m * 1.6)), tail, 0.3)


def subdrop(d=1.6):
    t = t_(d); f = 70 * np.exp(-t * 1.6) + 28
    return stereo(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.01, 1, 2.2))


def riser(d=3.0):
    t = t_(d); u = t / d
    f = 200 * (8 ** u)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    n = rng.standard_normal(len(t))
    nz = np.zeros_like(n); seg = 24
    for i in range(seg):
        a, z = i * len(n) // seg, (i + 1) * len(n) // seg
        c = 400 * (12 ** ((i + 0.5) / seg)); nz[a:z] = bp(n, c * 0.7, min(20000, c * 1.4))[a:z]
    m = (tone + nz * 0.6) * (u ** 2.2)
    m[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return reverb(stereo(m), 0.6, 0.15)


def tick(f=2400, d=0.05):
    t = t_(d)
    return stereo((np.sin(2 * np.pi * f * t) * 0.8 + hp(rng.standard_normal(len(t)), 3000) * 0.25) * np.exp(-t * 120))


def roll(d=1.2, n0=28):
    out = np.zeros((int(d * SR) + SR // 10, 2))
    times = d * (np.linspace(0, 1, n0) ** 1.6)
    for k, tt in enumerate(times):
        c = tick(1800 + 600 * (k % 3), 0.04)
        a = int(tt * SR); out[a:a + len(c)] += c * (0.6 + 0.4 * (k % 2))
    return out


def pop(f0=700, d=0.18):
    t = t_(d); f = f0 * np.exp(-t * 9) + f0 * 0.4
    return reverb(stereo(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 1, 5)), 0.4, 0.15)


def chime(f=880, d=2.2):
    t = t_(d)
    m = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * (1.6 + r)) for r, a in [(1, 1), (2.01, 0.45), (2.76, 0.3), (5.4, 0.12)])
    return reverb(stereo(m * env(len(t), 0.003, 0, 0)), 2.0, 0.35)


def glitch(d=0.35):
    n = int(d * SR); out = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(0.012, 0.05) * SR)
        if rng.random() < 0.65:
            f = rng.choice([180, 360, 720, 1440, 2880])
            seg = np.sign(np.sin(2 * np.pi * f * np.arange(L) / SR)) * rng.uniform(0.3, 1)
            step = int(rng.integers(2, 12)); seg = np.repeat(seg[::step], step)[:L]
            out[i:i + L] = seg[: n - i]
        i += L
    return stereo(lp(out, 7000) * 0.7)


def slash(d=0.25):
    t = t_(d); n = rng.standard_normal(len(t))
    m = np.zeros_like(n); seg = 12
    for i in range(seg):
        a, z = i * len(n) // seg, (i + 1) * len(n) // seg
        c = 6000 * (0.25 ** ((i + 0.5) / seg)); m[a:z] = bp(n, c * 0.7, min(20000, c * 1.3))[a:z]
    return reverb(stereo(m * np.sin(np.pi * t / d) ** 0.6, 0.3), 0.5, 0.2)


def buzz(d=0.3):
    t = t_(d)
    return stereo(lp(np.sign(np.sin(2 * np.pi * 110 * t)) * 0.6, 2500) * env(len(t), 0.005, 1, 3))


def scan(d=2.4):
    t = t_(d); f = 300 * (4 ** (t / d))
    return stereo(np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 * np.sin(np.pi * t / d) ** 0.5)


def stream(d=2.4, rate=22):
    out = np.zeros((int(d * SR) + SR // 10, 2))
    for k in range(int(d * rate)):
        c = tick(rng.choice([1600, 2200, 3100]), 0.03) * rng.uniform(0.3, 0.9)
        a = int((k / rate + rng.uniform(0, 0.02)) * SR); out[a:a + len(c)] += c
    return out


def drone(d=3.0, f=55):
    t = t_(d)
    saw = 2 * ((f * t) % 1) - 1 + 2 * ((f * 1.007 * t) % 1) - 1
    return reverb(stereo(lp(saw, 400) * np.sin(np.pi * t / d) ** 2 * 0.5), 1.5, 0.3)


def tone_down(d=1.6):
    t = t_(d); f = 900 * (0.25 ** (t / d))
    return reverb(stereo(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.5), 0.8, 0.2)


# ------------------------------------------------------------------ cues: [time, name (中文), sound, peak dB]
T = {'title': fb(32), 'intro': fb(36), 'model': fb(46), 'net': fb(82), 'atus': fb(106), 'dunbar': fb(128), 'drop': fb(161), 'pay': fb(177), 'end': fb(197)}
CUES = []
add = lambda t, name, snd, db: CUES.append((round(t, 3), name, snd, db))
# hook
def seq(times, make):
    out = np.zeros((int((max(times) + 0.5) * SR), 2))
    for j, tt in enumerate(times):
        c = make(j); a = int(tt * SR); out[a:a + len(c)] += c
    return out


add(0.05, '字母逐个敲出', lambda: seq([i * 0.055 for i in range(19) if 'LAST MEETING THEORY'[i] != ' '], lambda j: tick(2600, 0.035)), -16)
add(1.1, '点赞数滚动', lambda: roll(1.2), -14)
add(2.8, '课题进度上升', lambda: riser(2.4), -12)
add(5.2, '100% 叮', lambda: chime(1046, 1.6), -14)
add(5.6, '两点甩开', lambda: whoosh(1.8, 0, 0, 200, 3000), -8)
add(6.1, 'P(重逢)=0 故障', lambda: glitch(0.4), -12)
add(T['title'] - 1.2, '标题前蓄力', lambda: riser(1.2), -12)
add(T['title'], '标题重击', lambda: impact(1.3, 2.0), -4)
add(T['title'] + 0.3, '“面”落下', lambda: pop(320, 0.2), -16)
# intro
add(T['intro'] - 0.25, '甩镜', lambda: whoosh(0.55), -4)
add(11.1, '划掉“宇宙安排”', lambda: slash(0.28), -12)
add(12.4, '公式雨', lambda: stream(1.6, 14), -18)
add(14.0, '“?”弹出', lambda: pop(900, 0.18), -14)
add(T['model'] - 0.3, '推进穿越', lambda: whoosh(0.65, -0.2, 0.2, 150, 2500), -3)
# model
add(15.6, '31 根柱子落下', lambda: seq([k * 0.16 for k in range(31)], lambda j: tick(900 + 40 * j, 0.05)), -13)
add(22.6, '上限出现', lambda: scan(0.9), -24)
add(23.8, '“5次”重击', lambda: impact(0.8, 1.2), -9)
add(26.4, '扫描线', lambda: scan(2.5), -16)
add(28.9, '最后一面 标记', lambda: chime(660, 1.6), -16)
add(30.0, '400 段关系填充', lambda: stream(2.4, 26), -15)
add(T['net'] - 0.3, '推进穿越（红点）', lambda: whoosh(0.65, 0.3, -0.3, 150, 3000), -3)
# network
add(33.9, '年份跳动 1→7', lambda: seq([(40.2 - 33.9) * (y / 7) - 0.05 for y in range(1, 8)], lambda j: tick(1500, 0.06)), -13)
add(40.7, '48% 深重击（音乐空拍）', lambda: impact(1.6, 2.6), -8)
add(42.4, '关系拉远', lambda: drone(3.2, 49), -16)
add(T['atus'] - 0.25, '甩镜', lambda: whoosh(0.55), -4)
# ATUS
add(49.7, '滑到30岁', lambda: whoosh(0.7, -0.2, 0.4, 500, 2500), -13)
add(52.3, '滑到40岁', lambda: whoosh(0.7, -0.2, 0.4, 500, 2500), -13)
add(54.4, '时间流失', lambda: tone_down(1.8), -13)
add(T['dunbar'] - 0.25, '垂直甩镜', lambda: whoosh(0.55, 0, 0, 250, 3500), -4)
# dunbar → drop
add(67.3, '“友情，更依赖见面”', lambda: pop(500, 0.22), -13)
add(70.4, '张力上升', lambda: riser(T['drop'] - 70.4), -11)
add(T['drop'], '第二段重拍 重击', lambda: impact(1.5, 2.2), -6)
add(T['drop'], '低频下坠', lambda: subdrop(1.8), -9)
add(77.4, '“宇宙安排 ✕”', lambda: buzz(0.3), -14)
add(77.4, '“宇宙安排 ✕”重音', lambda: impact(0.6, 0.8), -12)
add(79.7, '“只是 不再约”', lambda: impact(0.7, 1.0), -10)
add(T['pay'] - 0.3, '旋转推进', lambda: whoosh(0.7, 0.6, -0.6, 200, 3000), -4)
# payoff
add(86.4, '冲向对方', lambda: riser(1.5), -14)
add(87.3, '两点相撞', lambda: whoosh(0.6, -0.5, 0.5, 300, 4000), -12)
add(87.9, '重逢', lambda: impact(0.9, 1.4), -8)
add(87.9, '重逢 叮', lambda: chime(784, 2.4), -12)
add(T['end'] - 0.3, '推进到片尾', lambda: whoosh(0.65), -6)
add(T['end'] + 0.2, '片尾标题', lambda: pop(320, 0.2), -18)

# ------------------------------------------------------------------ render
import re
import zipfile

CATS = {'whoosh': '1_呼啸甩镜', 'impact': '2_重击', 'subdrop': '3_低频下坠', 'riser': '4_张力上升', 'tick': '5_嗒嗒计数', 'roll': '5_嗒嗒计数',
        'stream': '5_嗒嗒计数', 'pop': '6_叮与弹出', 'chime': '6_叮与弹出', 'glitch': '7_故障划痕', 'slash': '7_故障划痕', 'buzz': '7_故障划痕',
        'scan': '8_氛围音', 'drone': '8_氛围音', 'tone_down': '8_氛围音'}


def cat_of(fn):
    names = fn.__code__.co_names
    for n in names:
        if n in CATS and n != 'seq':
            return CATS[n]
    return '5_嗒嗒计数'


def safe(name):
    """file names that unzip cleanly on Windows / macOS / phones: CJK, letters, digits, underscore only"""
    name = name.replace('%', '百分').replace('→', '到').replace('✕', '叉')
    return re.sub(r'_+', '_', re.sub(r'[^0-9A-Za-z\u4e00-\u9fff]+', '_', name)).strip('_')


def wav(path, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', str(path)], input=x.astype(np.float32).tobytes(), check=True)


for old in (OUT / 'clips').glob('*.wav'):
    old.unlink()
(OUT / 'stems').mkdir(exist_ok=True)
for old in (OUT / 'stems').glob('*.wav'):
    old.unlink()
N = int(END * SR)
stem = np.zeros((N + 3 * SR, 2))
stems = {}
srt, rows = [], []
CUES.sort(key=lambda c: c[0])
ts = lambda s: f'{int(s // 3600):02d}:{int(s // 60) % 60:02d}:{int(s) % 60:02d},{int(round((s % 1) * 1000)) % 1000:03d}'
for i, (t0, name, snd, db) in enumerate(CUES, 1):
    x = norm(snd(), db)
    cat = cat_of(snd)
    a = int(t0 * SR); z = min(len(stem), a + len(x))
    stem[a:z] += x[: z - a]
    stems.setdefault(cat, np.zeros_like(stem))[a:z] += x[: z - a]
    fname = f'{i:02d}_{safe(name)}.wav'
    wav(OUT / 'clips' / fname, x)
    dur = len(x) / SR
    srt.append(f'{i}\n{ts(t0)} --> {ts(t0 + min(dur, 2.5))}\n[音效 {i:02d}] {name}\n')
    rows.append(f'{i:02d}\t{ts(t0)[:-4]}.{ts(t0)[-3:]}\t{cat[2:]}\t{name}\t{fname}')
stem = stem[:N]
g = min(1.0, 0.89 / (np.max(np.abs(stem)) + 1e-9))
wav(OUT / '最后一面_音效轨_全部.wav', stem * g)
for cat, x in stems.items():
    wav(OUT / 'stems' / f'音效分轨_{cat}.wav', x[:N] * g)
(OUT / '最后一面_音效.srt').write_text('\n'.join(srt), encoding='utf-8')
readme = ['《最后一面》音效包（全部为程序合成，无第三方素材）', '',
          '用法：所有整轨（音效轨_全部，和“分轨_每类一条”里的 8 条）都和视频一样长、从 0 秒开始，放到时间线最开头即对齐。',
          '用全部那一条，或者用 8 条分轨（二选一，别同时用，否则音量翻倍）。不想要某一类：删掉对应分轨即可。单个音效在“单个音效”文件夹，按编号对应下表和 音效.srt。', '',
          '编号\t时间\t类别\t名称\t文件']
(OUT / '音效清单.txt').write_text('\n'.join(readme + rows) + '\n', encoding='utf-8')
# zip with UTF-8 file names (flag set by zipfile for non-ASCII names) so Chinese names survive on every system
pack = ROOT / 'out' / '最后一面_音效包.zip'
with zipfile.ZipFile(pack, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in ['音效清单.txt', '最后一面_音效.srt', '最后一面_音效轨_全部.wav']:
        zf.write(OUT / f, f'最后一面_音效包/{f}')
    for f in sorted((OUT / 'stems').glob('*.wav')):
        zf.write(f, f'最后一面_音效包/分轨_每类一条/{f.name}')
    for f in sorted((OUT / 'clips').glob('*.wav')):
        zf.write(f, f'最后一面_音效包/单个音效/{f.name}')
print(len(CUES), 'cues;', len(stems), 'category stems; gain', round(20 * np.log10(g), 1), 'dB; pack', round(pack.stat().st_size / 1e6, 1), 'MB')
