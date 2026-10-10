#!/usr/bin/env python3
"""小J's voice: cute robot babble, one blip per character, written out together with the exact reveal time of every
character so the speech bubble types in sync with the sound.

    python3 scripts/voice.py lines.json out/robot.wav src/voice.json

Each blip: 58 ms, a soft pulse/sine mix whose pitch comes from the character itself (so the same character always
"sounds" the same, like a tiny language), a small upward glide, fast attack and an exponential tail.
Commas pause, a line ending in 。 ends on a falling "boop", ？ on a rising chirp, …… on a slow wobbling slide down."""
import json, sys, math, hashlib, numpy as np, scipy.io.wavfile as wf

SR = 48000
SCALE = [0, 2, 4, 7, 9, 12, 14, 16]  # major pentatonic over ~1.5 octaves
BASE = 760.0
CPS = 13.5  # characters per second while typing

def pitch_of(ch: str) -> float:
    h = int(hashlib.md5(ch.encode()).hexdigest()[:6], 16)
    return BASE * 2 ** (SCALE[h % len(SCALE)] / 12)

def blip(f0, dur=0.058, glide=1.08, amp=0.32):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + (glide - 1) * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sq = np.tanh(3.2 * np.sin(ph))  # soft square: robotic but round
    w = 0.55 * np.sin(ph) + 0.45 * sq + 0.12 * np.sin(2 * ph)
    env = np.minimum(1, t / 0.003) * np.exp(-t / 0.028)
    return amp * w * env

def slide(f_from, f_to, dur, amp=0.28, wobble=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f_from * (f_to / f_from) ** (t / dur) * (1 + wobble * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = 0.6 * np.sin(ph) + 0.4 * np.tanh(3 * np.sin(ph))
    env = np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.04)
    return amp * w * env

def whoosh(dur=0.8, amp=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(3); x = rng.standard_normal(n)
    # a sweeping band-pass made from two one-pole filters
    y = np.zeros(n); lp = 0; lp2 = 0
    for i in range(n):
        fc = 300 + 2600 * (i / n) ** 1.5; a = math.exp(-2 * math.pi * fc / SR)
        lp = (1 - a) * x[i] + a * lp; lp2 = (1 - a * 0.6) * lp + a * 0.6 * lp2; y[i] = lp - lp2 * 0.6
    env = np.sin(np.pi * t / dur) ** 1.5
    return amp * y / (np.abs(y).max() + 1e-9) * env

def main(lines_path, wav_path, json_path, total=10.0):
    spec = json.load(open(lines_path))
    out = np.zeros(int(total * SR) + SR)
    def put(sig, at):
        i = int(at * SR); out[i:i + len(sig)] += sig[: max(0, len(out) - i)]
    timing = []
    for fx in spec.get('fx', []):
        if fx['k'] == 'whoosh': put(whoosh(fx.get('dur', 0.8)), fx['t'])
        if fx['k'] == 'pop': put(blip(1400, 0.05, 1.5, 0.25), fx['t'])
    for line in spec['lines']:
        t = line['t']; text = line['text']; reveal = []
        i = 0
        while i < len(text):
            ch = text[i]
            if text[i:i + 2] == '……':
                reveal += [t, t + 0.12]; put(slide(900, 520, 0.42, wobble=0.04), t); t += 0.5; i += 2; continue
            reveal.append(t)
            if ch in '，、；：': t += 0.2
            elif ch in '。！？': t += 0.08
            else:
                put(blip(pitch_of(ch)), t); t += 1 / CPS
            i += 1
        end = text.rstrip()[-1]
        if end == '？': put(slide(700, 1300, 0.16), t)
        elif end == '。': put(slide(980, 640, 0.13, amp=0.22), t)
        timing.append(dict(t=line['t'], end=line['end'], text=text, reveal=[round(r, 3) for r in reveal], typed=round(t, 3)))
    out = out[: int(total * SR)]
    out = out / max(1.0, np.abs(out).max() / 0.9)
    wf.write(wav_path, SR, (np.stack([out, out], -1) * 32767).astype(np.int16))
    json.dump(dict(lines=timing), open(json_path, 'w'), ensure_ascii=False, indent=1)
    for l in timing: print(f"{l['t']:5.2f} → typed {l['typed']:5.2f}, shown until {l['end']:5.2f}  {l['text']}")

if __name__ == '__main__':
    main(*sys.argv[1:4], *([float(sys.argv[4])] if len(sys.argv) > 4 else []))
