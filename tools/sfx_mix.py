#!/usr/bin/env python3
"""Build a sound-effects stem from a cue list, then optionally mix it under the music.

usage: sfx_mix.py <cues.json> <film_seconds> <out_stem.wav> [--music bgm.wav --out mix.wav]

cues.json is a list of {"t": seconds, "file": path, "db": gain in dB, "len": max seconds (optional),
"fin": fade-in s (default 0.008), "fout": fade-out s (default 0.15), "from": start offset inside the file (optional)}.
Every cue is trimmed, faded (no clicks), delayed to its time and summed without normalisation, so the
dB values in the cue list are the real levels. The stem is 48 kHz stereo.
"""
import json
import subprocess
import sys


def main():
    cues = json.load(open(sys.argv[1]))
    dur = float(sys.argv[2])
    out = sys.argv[3]
    args = sys.argv[4:]
    inputs, chains, labels = [], [], []
    for i, c in enumerate(cues):
        inputs += ['-i', c['file']]
        ln = c.get('len', 30.0)
        fin, fout = c.get('fin', 0.008), c.get('fout', 0.15)
        st = c.get('from', 0.0)
        ms = int(round(c['t'] * 1000))
        chains.append(
            f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={st}:duration={ln},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d={fin},afade=t=out:st={max(0.0, ln - fout)}:d={fout},volume={c['db']}dB,adelay={ms}|{ms}[c{i}]")
        labels.append(f'[c{i}]')
    fc = ';'.join(chains) + ';' + ''.join(labels) + f"amix=inputs={len(cues)}:normalize=0:dropout_transition=0,apad,atrim=duration={dur}[s]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[s]', '-ar', '48000', '-c:a', 'pcm_s16le', out], check=True)
    if '--music' in args:
        music, mix = args[args.index('--music') + 1], args[args.index('--out') + 1]
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', music, '-i', out, '-filter_complex',
                        f"[0:a]aresample=48000,aformat=channel_layouts=stereo[m];[m][1:a]amix=inputs=2:normalize=0,atrim=duration={dur}[x]",
                        '-map', '[x]', '-ar', '48000', '-c:a', 'pcm_s16le', mix], check=True)
    print(out)


if __name__ == '__main__':
    main()
