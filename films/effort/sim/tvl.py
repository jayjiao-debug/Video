"""Talent vs Luck (Pluchino, Biondo & Rapisarda 2018), with the paper's parameters:
N = 1000 agents on a 201x201 torus, talent ~ N(0.6, 0.1) clipped to [0, 1], capital starts at 10,
NE = 500 events (50 % lucky) doing random walks of 2 patches per step, 80 steps of six months (40 years).
An event hits an agent inside radius 1. Lucky: with probability = talent the capital doubles. Unlucky: it halves.
Writes src/tvl.json: positions, talents, capital per step, every hit, event tracks (for drawing).
Usage: python3 sim/tvl.py [--search] [seed]"""
import json, sys
import numpy as np

N, NE, STEPS, L = 1000, 500, 80, 201

def run(seed, keep=False):
    rng = np.random.default_rng(seed)
    pos = rng.integers(0, L, size=(N, 2)).astype(float)
    tal = np.clip(rng.normal(0.6, 0.1, N), 0, 1)
    cap = np.full(N, 10.0)
    ev = rng.uniform(0, L, size=(NE, 2))
    lucky = np.arange(NE) < NE // 2
    caps, hits, tracks = [cap.copy()], [], [ev.copy()]
    for s in range(STEPS):
        a = rng.uniform(0, 2 * np.pi, NE)
        ev = (ev + 2 * np.stack([np.cos(a), np.sin(a)], 1)) % L
        d = np.abs(pos[:, None, :] - ev[None, :, :])
        d = np.minimum(d, L - d)
        near = (d ** 2).sum(-1) <= 1.0
        for i, e in zip(*np.nonzero(near)):
            if lucky[e]:
                took = rng.uniform() < tal[i]
                if took: cap[i] *= 2
                hits.append((s + 1, int(i), int(e), 1 if took else 2))  # 1 lucky taken, 2 lucky missed
            else:
                cap[i] /= 2
                hits.append((s + 1, int(i), int(e), 0))
        caps.append(cap.copy())
        if keep: tracks.append(ev.copy())
    return dict(pos=pos, tal=tal, caps=np.array(caps), hits=hits, tracks=tracks, lucky=lucky)

def summary(r):
    c = r['caps'][-1]; top = int(np.argmax(c)); best = int(np.argmax(r['tal']))
    share = np.sort(c)[::-1]; top20 = share[: N // 5].sum() / share.sum()
    return top, best, c[top], r['tal'][top], c[best], r['tal'][best], top20

if __name__ == '__main__':
    if '--search' in sys.argv:
        for seed in range(400):
            r = run(seed); top, best, ct, tt, cb, tb, t20 = summary(r)
            if 0.59 <= tt <= 0.63 and ct >= 1280 and cb < 1.3:
                print(seed, f'top cap {ct:.0f} talent {tt:.3f} | most talented {tb:.3f} cap {cb:.3f} | top20% hold {t20:.0%}')
        sys.exit()
    seed = int(sys.argv[1])
    r = run(seed, keep=True); top, best, ct, tt, cb, tb, t20 = summary(r)
    print(f'seed {seed}: top #{top} cap {ct:.0f} talent {tt:.3f}; most talented #{best} {tb:.3f} cap {cb:.3f}; top 20% hold {t20:.0%}')
    out = dict(seed=seed, L=L, steps=STEPS, top=top, best=best,
               pos=r['pos'].astype(int).tolist(), tal=[round(float(x), 3) for x in r['tal']],
               logcap=[[round(float(np.log2(v / 10)), 2) for v in row] for row in r['caps']],
               hits=r['hits'],
               tracks=[[[round(float(x), 1), round(float(y), 1)] for x, y in t] for t in r['tracks']],
               lucky=r['lucky'].astype(int).tolist(), top20=round(float(t20), 3))
    json.dump(out, open('src/tvl.json', 'w'), separators=(',', ':'))
