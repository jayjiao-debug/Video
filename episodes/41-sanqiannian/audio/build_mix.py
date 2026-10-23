"""ep41 mix: the owner's BGM (cut 119.35 s → +128.6 s, 2-bar fade out, no other processing) + native-language VO.
Voice level follows the reference (rec_1023): voice sits about level with the music in the speech band, so each
clip is set to the BGM's own loudness minus 1 LU; the BGM is not ducked (house rule — ask the owner first)."""
import numpy as np, subprocess, pyloudnorm as pyln, soundfile as sf, sys, os
SR = 48000; A = os.path.dirname(os.path.abspath(__file__))
IN, DUR, FADE = 119.35, 128.6, 2 * 2.5125
def load(path, extra=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', extra] if extra else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
bgm = load(f'{A}/bgm.mp3')[int(IN * SR): int((IN + DUR) * SR)]
n = len(bgm); t = np.arange(n) / SR
bgm *= np.clip((DUR - t) / FADE, 0, 1)[:, None] ** 1.5
meter = pyln.Meter(SR)
L_bgm = meter.integrated_loudness(bgm[: int((DUR - FADE) * SR)])
VO = {  # film time, clip, treatment
    '01_shang': (15.093, ''), '02_du': (25.156, ''), '03_morse': (35.218, ''),
    '04_scott': (45.280, 'highpass=f=320,lowpass=f=2800,acrusher=bits=10:mix=0.25'),     # an 1860 soot-paper recording
    '05_bell': (55.971, ''), '06_marconi': (67.920, ''),
    '07_kline': (76.096, 'highpass=f=300,lowpass=f=3400'),                              # over a phone line
    '08_beijing': (85.8825, ''), '09_voyager': (95.304, 'aecho=0.8:0.6:180|340:0.25|0.15'),
}
vo_bus = np.zeros_like(bgm); rep = []
for name, (at, fx) in VO.items():
    dyn = 'acompressor=threshold=-30dB:ratio=6:attack=3:release=80:makeup=4,alimiter=limit=0.35:attack=2:release=40:level=disabled'
    c = load(f'{A}/vo01/{name}.mp3', ','.join(x for x in (fx, dyn) if x))
    L = meter.integrated_loudness(c); g = min(10 ** ((L_bgm - 1.0 - L) / 20), 10 ** (-3.5 / 20) / np.abs(c).max()); c *= g   # loudness match, but never above −3.5 dBFS
    i0 = int(at * SR); vo_bus[i0: i0 + len(c)] += c[: max(0, n - i0)]
    rep.append(f'{name}: at {at:.2f}s, {len(c)/SR:.2f}s, voice vs music {meter.integrated_loudness(c) - L_bgm:+.1f} LU')
mix = bgm + vo_bus
L = meter.integrated_loudness(mix); g = 10 ** ((-14.0 - L) / 20); mix *= g
peak = 20 * np.log10(np.abs(mix).max())
if peak > -1.0: mix *= 10 ** ((-1.0 - peak) / 20)
sf.write(f'{A}/ep41_mix.wav', mix, SR, subtype='PCM_24')
speech = sum(len(load(f'{A}/vo01/{k}.mp3')) for k in VO) / SR
print(f'BGM {L_bgm:.1f} LUFS; mix → {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS')
print(f'voice on air {speech:.1f}s of {DUR}s = {100*speech/DUR:.0f} %'); print('\n'.join(rep))
