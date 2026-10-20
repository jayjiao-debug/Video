"""ep31 intro v2 (owner: "gradually get squeaky, add more and faster faster").
40 original 薄肌 clips, hard cuts, no black. Each clip is played faster AND higher (speed and pitch together, like
a tape sped up): ×1.0 at the start → ×3.0 at the end, so the voices turn squeaky. The cuts
shrink from 0.60 s to ~0.13 s. The ending is the full 「薄肌圣经」 slowed to 0.6× (deep), the squeaky → deep contrast.
Every source window always contains the whole 薄肌 (the tight span from cuts2.json + margin)."""
import json, subprocess, numpy as np, soundfile as sf, os, shutil
FPS = 30; W, H = 1920, 1080; N = 30
C = json.load(open('cuts2.json')); A = json.load(open('asr.json'))
DROP = {'11_00-57-56', '16_00-58-27', '71_02-50-54', '41_02-03-24', '42_02-03-25', '43_02-03-27'}   # 41–43: Joe Rogan 「练搏击的」 sounds like boxing
SENT = {'27_01-18-15', '29_01-18-44', '30_01-18-46', '68_02-50-16', '84_04-17-18', '28_01-18-16', '82_03-00-53'}
ok = {k: o for k, o in C.items() if o['ok'] and k not in DROP and k not in SENT}
tight = {k: (ok[k]['start_range'][1], ok[k]['end_range'][0]) for k in ok}
tl = lambda k: tight[k][1] - tight[k][0]
keys = sorted(ok); pick = [keys[round(i * (len(keys) - 1) / (N - 1))] for i in range(N)]
half = N // 2
late = sorted(pick, key=tl)[:half]; early = [k for k in pick if k not in late]
CLEAR = ('理论', '论', '圣经', '教', '版')                         # words that make it unmistakably 薄肌 (not boxing)
early.sort(key=lambda k: (-any(w in A[k]['text'] for w in CLEAR), -len(A[k]['text']))); late.sort(key=lambda k: -tl(k)); pick = early + late
x = np.linspace(0, 1, N)
speed = 1.0 + 1.5 * x ** 2.5                                   # ×1.0 → ×2.5, almost flat for the first half (owner: 慢点变 squeaky)
src_target = 0.65 * (0.45 / 0.65) ** (x ** 0.8)                # source window 0.65 s → 0.45 s
outd = []
for i, k in enumerate(pick):
    src = max(src_target[i], tl(k) + 0.08)
    outd.append(max(2, round(src / speed[i] * FPS)) / FPS)
for i in range(N - 2, -1, -1): outd[i] = max(outd[i], outd[i + 1])   # never longer than the clip before
shutil.rmtree('intro4', ignore_errors=True); os.makedirs('intro4'); segs = []
for i, k in enumerate(pick):
    sp = float(speed[i]); d_out = outd[i]; d_src = d_out * sp
    s, e = tight[k]; L = A[k]['dur']; core = e - s
    if d_src >= L: a0 = 0.0; d_src = L; d_out = round(L / sp * FPS) / FPS; d_src = d_out * sp
    else:
        pre = max(0.0, (d_src - core)) * 0.45; a0 = max(0.0, s - pre)
        if a0 + d_src > L: a0 = max(0.0, L - d_src)
    a, sr = sf.read(f'wav/{k}.wav', dtype='float32'); seg = a[int(a0 * sr):int((a0 + d_src) * sr)]
    g = min(-18 - 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9), -1 - 20 * np.log10(np.abs(seg).max() + 1e-9))
    f = min(0.006, d_out / 6)
    out = f'intro4/{i:02d}_{k}.mov'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'in/word/{k}.mp4', '-filter_complex',
        f'[0:v]trim=start={a0:.4f}:duration={d_src:.4f},setpts=(PTS-STARTPTS)/{sp:.4f},scale={W}:{H}:flags=lanczos,fps={FPS}[v];'
        f'[0:a]atrim=start={a0:.4f}:duration={d_src:.4f},asetpts=PTS-STARTPTS,aresample=48000,asetrate={int(48000 * sp)},aresample=48000,'
        f'volume={g:.2f}dB,afade=t=in:d={f:.4f},afade=t=out:st={d_out - f:.4f}:d={f:.4f}[a]',
        '-map', '[v]', '-map', '[a]', '-t', f'{d_out:.4f}', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p',
        '-c:a', 'pcm_s16le', out], check=True)
    segs.append((out, k, A[k]['text'], d_out, sp))
# ending: clip 84 「搏击圣经」 at 0.6× (deep), slow push-in
k = '84_04-17-18'; v = A[k]; t0 = max(0, v['ts'][0] - 0.10); t1 = min(v['dur'], v['ts'][3] + 0.32); SL = 0.6
a, sr = sf.read(f'wav/{k}.wav', dtype='float32'); seg = a[int(t0 * sr):int(t1 * sr)]
g = min(-17 - 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9), -1 - 20 * np.log10(np.abs(seg).max() + 1e-9))
dslow = (t1 - t0) / SL
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'in/word/{k}.mp4', '-filter_complex',
    f'[0:v]trim=start={t0}:end={t1},setpts=(PTS-STARTPTS)/{SL},scale={W}:{H}:flags=lanczos,'
    f'minterpolate=fps={FPS}:mi_mode=blend,zoompan=z=\'1+0.08*on/{int(dslow * FPS)}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d=1:s={W}x{H}:fps={FPS}[v];'
    f'[0:a]atrim=start={t0}:end={t1},asetpts=PTS-STARTPTS,aresample=48000,asetrate={int(48000 * SL)},aresample=48000,volume={g:.2f}dB,'
    f'aecho=0.8:0.5:60|120:0.25|0.15,afade=t=in:d=0.006,afade=t=out:st={dslow - 0.25:.3f}:d=0.25[a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', 'intro4/99_slow.mov'], check=True)
segs.append(('intro4/99_slow.mov', k, v['text'] + ' (slowed 0.6×)', dslow, SL))
with open('intro4/list.txt', 'w') as fh:
    for p, *_ in segs: fh.write(f"file '{os.path.basename(p)}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'intro4/list.txt', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', 'intro_v4.mp4'], check=True)
t = 0
for p, k, txt, d, sp in segs: print(f'{t:6.2f}s  {d:5.2f}s  ×{sp:.2f}  {k}  {txt}'); t += d
print(f'total {t:.2f}s')
