#!/usr/bin/env python3
"""ep61 v2 score: ONE continuous piece on the v2 timeline (owner 2026-11-06 20:41: "the music is non-coherent, that deep humming and
tunes are not very enjoyable").

Why v1 failed: 15 different library loops at 3 tempos (78 / 104 / 112 BPM), switching every 7-10 s, plus drone pads (the hum).
v2: the ep60 ensemble and composer (hijaz60: ney, oud, qanun, darbuka, riq, frame drum, gong; D Hijaz; the leitmotif THEME and the
riff), ONE tempo (120 BPM, bar = 2.0 s), ONE bar grid from film 0.0 to the end, every section starting on a bar line, the drone
removed from every module (H.drone is a no-op here). Each section is a window of a mood module (its bars b0..), rendered as its own
take with a 4 s tail so notes and reverb ring across the next bar line, levelled to its mood loudness, and overlap-added.
Arc: hook (gong on the title, 6.0) -> calm creation -> the theme (Geb & Nut) -> the riff builds to Shu's push (bar 25 = 50.0) -> the
theme up an octave (air) -> the riff (curse) -> playful (Thoth) -> the theme in full (the children) -> tension (the box) -> bright
(Isis) -> calm (underworld) -> the riff (80 years) -> calm (Anubis) -> tension stops on F# at 158 -> 2 s of nothing (Sekhmet roars
alone) -> the riff (rampage) -> playful (Bastet) -> the theme (the tree) -> the resolution, final D on 190.0, ringing into the card.

    python3 score61.py OUT.wav      -> OUT.wav (48 kHz float), OUT.json (sections, levels)
"""
import os, sys, json, math, numpy as np, soundfile as sf
T60 = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '60-xinzang', 'tools'); sys.path.insert(0, T60)
import egypt_cues as E
import hijaz60 as H
H.drone = lambda *a, **k: None          # no hum (owner): every module loses its drone pad
SR = 48000; BAR = H.BAR; assert abs(BAR - 2.0) < 1e-9, BAR
FILM = 191.83

class Win:
    """a module window: module time m plays at take time m - off; only events with g0 <= m < g1 are kept"""
    def __init__(self, T, off, g0, g1): self.T, self.off, self.g0, self.g1 = T, off, g0, g1
    def __getattr__(self, k): return getattr(self.T, k)
    def put(self, stem, sig, t, pan=0.0, g=1.0):
        if self.g0 - 1e-6 <= t < self.g1 - 1e-6: self.T.put(stem, sig, t - self.off, pan, g)

MOOD = {   # composer, module bars, mood loudness (LUFS, before the music bus)
 'hook': (H.m_hook, 4, -21.0), 'calm': (H.m_calm, 8, -22.0), 'calm2': (lambda T: H.m_calm(T, book=True), 8, -21.0),
 'danger': (H.m_danger, 4, -19.5), 'theme': (H.m_theme, 8, -20.0), 'tension': (H.m_tension, 8, -19.0),
 'playful': (H.m_playful, 8, -20.0), 'bright': (H.m_bright, 8, -19.5), 'resolution': (H.m_resolution, 6, -20.5),
}
# (film start s, film end s, mood, first module bar, extra dB, fade-in s)
SECTIONS = [   # v2.1 after the review: fewer, longer sections (no 4-s mood cues), entries on phrase starts except the two builds
 (0, 8, 'hook', 0, 0, 0),          # 1-2: the 1500 gods; gong + D5 on bar 3 = 6.0 = the title
 (8, 28, 'calm', 0, 0, 0),         # 3-8: black water ... Tefnut (10 bars: the calm melody, then its opening again)
 (28, 44, 'calm2', 0, 0, 0),       # 9-12: Geb & Nut, the same melody with qanun
 (44, 52, 'tension', 4, 0, 0),     # 13-15: the build to Shu's push on bar 7 = 50.0
 (52, 56, 'bright', 0, 0, 0),      # 16: air: the theme an octave up (the build's release)
 (56, 64, 'danger', 0, 0, 0),      # 17-18: Ra's curse: the riff
 (64, 84, 'playful', 0, 0, 0),     # 19-23: Thoth, the moon, 365, the curse bounces off (10 bars)
 (84, 108, 'theme', 0, 0, 0),      # 24-29: the children, the reign (12 bars)
 (108, 120, 'tension', 0, 0, 0),   # 30-32: the plot, the box, the nails
 (120, 128, 'bright', 0, 0, 0),    # 33-34: Isis revives him, Horus
 (128, 136, 'calm', 0, -0.5, 0),   # 35-36: king of the dead, episode 1
 (136, 146, 'danger', 0, 0, 0),    # 37-38: 80 years in court
 (146, 154, 'calm2', 4, -0.5, 0),  # 39-40: Anubis
 (154, 158, 'tension', 6, 0, 0),   # 41: the climb, stops on F#
 (160, 164, 'danger', 0, 0, 0.8),  # 43: after the roar: the rampage
 (164, 172, 'playful', 0, -0.5, 0),# 44-45: Bastet, Ma'at
 (172, 182, 'theme', 0, 0, 0),     # 46-47: Thoth writes the tree
 (182, FILM, 'resolution', 0, 0, 0),  # 48 + card: the final D on 190.0
]

def section(s0, s1, mood, b0, seed):
    """render the module window bars b0.. for (s1 - s0) s; repeat the module (instance k starts at module time k·N·BAR) to fill it"""
    fn, N, _ = MOOD[mood]; dur = s1 - s0; nb = int(math.ceil(dur / BAR - 1e-6)); T = H.Take(nb, loop=False, pre=0.0, tail=4.0, seed=seed)
    k = 0
    while k * N * BAR < b0 * BAR + dur:
        base = k * N * BAR; fn(Win(T, b0 * BAR - base, b0 * BAR - base, b0 * BAR + dur - base)); k += 1
    full, _, _ = H.mixdown(T); return full

def render(out):
    y = np.zeros((int((FILM + 6) * SR), 2)); meta = []
    for i, (s0, s1, mood, b0, db, fin) in enumerate(SECTIONS):
        x = section(s0, s1, mood, b0, 100 + i); body = x[:int((s1 - s0) * SR)]
        g = 10 ** ((MOOD[mood][2] + db - E.lufs(body)) / 20) if len(body) > SR else 1.0; x = x * g
        if fin: f = int(fin * SR); x[:f] *= np.linspace(0, 1, f)[:, None] ** 2
        i0 = int(round(s0 * SR)); j = min(len(y), i0 + len(x)); y[i0:j] += x[:j - i0]
        meta.append(dict(t0=s0, t1=s1, mood=mood, bar0=b0, lufs=round(E.lufs(x[:int((s1 - s0) * SR)]), 1))); E._KS.clear(); print('section', i + 1, mood, s0, s1, flush=True)
    y = y[:int(FILM * SR)]
    sf.write(out, y.astype(np.float32), SR, subtype='FLOAT'); json.dump(meta, open(out[:-4] + '.json', 'w'), indent=1); print('score', out, round(E.lufs(y), 1), 'LUFS')

if __name__ == '__main__':
    render(sys.argv[1])
