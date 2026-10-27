"""The proof-of-concept music: film 0:00–0:15.5 (opening + title) | cut | 3:42.25–4:44.4 (trolley 7/8 → bridge → 零点 → drop).
Rendered without per-window normalisation, joined, then mastered together so the relative levels are the film's."""
import numpy as np, soundfile as sf, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mix_train as M
import tempo as T
SR = M.SR
OUT = '/home/user/renders/train'
a = M.mix((0.0, T.seg('yingzuo.bpm')['start'] + 0.6), None, verbose=False, norm=False)
b = M.mix((T.seg('trolley.breath')['start'] - 0.05, T.seg('zero.drop')['end'] + 1.0), None, verbose=False, norm=False)
fa = int(0.6 * SR); a[-fa:] *= np.linspace(1, 0, fa)[:, None] ** 2          # tail of the title into the cut
fb = int(1.0 * SR); b[-fb:] *= np.linspace(1, 0, fb)[:, None] ** 2
gap = np.zeros((int(0.35 * SR), 2), 'float32')
x = np.concatenate([a, gap, b])
y = M.finish(x)
sf.write(f'{OUT}/poc_music.wav', y, SR, subtype='PCM_24')
print('A', len(a) / SR, 'B', len(b) / SR, 'total', len(y) / SR, 'LUFS', M.lufs(y), 'peak', 20 * np.log10(np.abs(y).max()))
print('B starts in file at', (len(a) + len(gap)) / SR, 's = film', T.seg('trolley.breath')['start'] - 0.05)
