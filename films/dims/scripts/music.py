#!/usr/bin/env python3
"""Cut the owner's track to ~2:04 in whole half-phrases (16 beats on the pipeline's grid, 117.94 BPM, beat0 0.334):
drop orig [32.89, 49.17] (the main section's second half) and [114.29, 138.71] (three half-phrases of the peak).
Joins are butt splices with 8 ms fades (no overlap, so every later beat stays exactly on the grid). Then -14 LUFS."""
import json, re, subprocess
SRC, OUT = 'public/bgm_src.mp3', 'out/music.wav'
KEEP = [(0, 32.89), (49.17, 114.29), (138.71, 164.49)]
F = 0.008
parts = []
for i, (a, b) in enumerate(KEEP):
    fi = f'afade=t=in:st=0:d={F},' if i else ''
    fo = f',afade=t=out:st={b - a - F:.3f}:d={F}' if i < len(KEEP) - 1 else ''
    parts.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,{fi}anull{fo}[s{i}]')
fc = ';'.join(parts) + ';' + ''.join(f'[s{i}]' for i in range(len(KEEP))) + f'concat=n={len(KEEP)}:v=0:a=1[m]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-filter_complex', fc, '-map', '[m]', '-ar', '48000', '-c:a', 'pcm_s16le', '/tmp/claude-0/dims_raw.wav'], check=True)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', '/tmp/claude-0/dims_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
d = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', m, re.S).group(0))
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/dims_raw.wav', '-af', ln, '-ar', '48000', '-c:a', 'pcm_s16le', OUT], check=True)
print('film length', sum(b - a for a, b in KEEP))
