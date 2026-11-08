"""Mix narration over the owner's BGM. usage: mix_audio.py <vo_dir> <bgm> <timeline.json> <out.wav>
Narration: each clip time-stretched by the timeline tempo, levelled to the same loudness,
placed at its start time. BGM: one static gain (no ducking, no other processing), a fade-out
over the last 2.5 s. Final: loudnorm to -14 LUFS, true peak <= -1 dBTP."""
import sys, json, subprocess, os
vo, bgm, tl, out = sys.argv[1:5]
T = json.load(open(tl))
tempo = T['tempo']
work = os.path.dirname(out)
parts = []
for ln in T['lines']:
    src = os.path.join(vo, ln['id'] + '.mp3')
    dst = os.path.join(work, ln['id'] + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
                    f'atempo={tempo},loudnorm=I=-17:TP=-3:LRA=7,aresample=48000', '-ac', '1', dst], check=True)
    parts.append((dst, ln['start']))
inputs, filt = [], []
for k, (p, st) in enumerate(parts):
    inputs += ['-i', p]
    ms = int(round(st * 1000))
    filt.append(f'[{k}:a]adelay={ms}|{ms},apad[v{k}]')
n = len(parts)
filt.append(''.join(f'[v{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0:duration=longest[vo]')
inputs += ['-i', bgm]
dur = 148.506
filt.append(f'[{n}:a]aresample=48000,volume=-9dB,afade=t=out:st={dur-2.5}:d=2.5[bed]')
filt.append('[bed][vo]amix=inputs=2:normalize=0:duration=first,atrim=0:%.3f,loudnorm=I=-14:TP=-1.5:LRA=11[out]' % dur)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', '-ar', '48000', '-ac', '2', out], check=True)
print('ok', out)
