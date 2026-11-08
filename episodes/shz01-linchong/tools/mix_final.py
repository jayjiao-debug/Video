"""Final mix: BGM bed (static -9 dB, fade-out only) + narration + synthesised cues, then one static gain to
-14 LUFS and a 4x-oversampled true-peak limiter at -1.5 dBTP (no dynamic loudness normalisation).
usage: mix_final.py <vo_dir> <bgm> <timeline.json> <sfx.wav> <out.wav> [sfx_gain_db]"""
import sys, json, subprocess, os, re
vo, bgm, tl, sfx, out = sys.argv[1:6]
sfx_db = float(sys.argv[6]) if len(sys.argv) > 6 else 0.0
T = json.load(open(tl))
tempo = T['tempo']
work = os.path.dirname(out)
dur = 148.506
parts = []
for ln in T['lines']:
    src = ln.get('file', ln['id'])          # a retake can point at another clip
    tp = ln.get('tempo', tempo)
    dst = os.path.join(work, f"{src}_{tp}.wav")
    if not os.path.exists(dst):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(vo, src + '.mp3'), '-af',
                        f'atempo={tp},loudnorm=I=-17:TP=-3:LRA=7,aresample=48000', '-ac', '1', dst], check=True)
    parts.append((dst, ln['start']))
inputs, filt = [], []
for k, (p, st) in enumerate(parts):
    inputs += ['-i', p]
    ms = int(round(st * 1000))
    filt.append(f'[{k}:a]adelay={ms}|{ms},apad[v{k}]')
n = len(parts)
filt.append(''.join(f'[v{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest[vo]')
inputs += ['-i', bgm, '-i', sfx]
filt.append(f'[{n}:a]aresample=48000,volume=-9dB,afade=t=out:st={dur - 2.5}:d=2.5[bed]')
filt.append(f'[{n + 1}:a]aresample=48000,volume={sfx_db}dB[fx]')
filt.append(f'[bed][vo][fx]amix=inputs=3:normalize=0:duration=first,atrim=0:{dur:.3f}[out]')
raw = out.replace('.wav', '_raw.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_f32le', raw], check=True)


def loud(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
    P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
    return I, P


I, P = loud(raw)
g = -14.0 - I
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
                f'volume={g:.2f}dB,aresample=192000,alimiter=limit={10 ** (-1.6 / 20):.4f}:attack=2:release=60:level=false,aresample=48000',
                '-c:a', 'pcm_s24le', out], check=True)
I2, P2 = loud(out)
print(f'raw I={I:.1f} peak={P:.1f}; gain {g:+.2f} dB -> I={I2:.1f} LUFS, true peak {P2:.1f} dBTP: {out}')
