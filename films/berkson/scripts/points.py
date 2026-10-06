"""The film's 1000 people: looks (x) and personality (y), independent N(0,1), seed 10. Kept = x + y > 1.0.
Writes src/points.json as [[x, y, kept], ...] normalised to [0,1] over ±3σ."""
import json, numpy as np
rng = np.random.default_rng(10); n = 1000
x = rng.normal(0, 1, n); y = rng.normal(0, 1, n)
keep = (x + y) > 1.0
r0 = np.corrcoef(x, y)[0, 1]; r1 = np.corrcoef(x[keep], y[keep])[0, 1]
print(f"r_all={r0:.3f} kept={keep.sum()} r_kept={r1:.3f}")
norm = lambda v: np.clip((v + 3) / 6, 0.01, 0.99)
json.dump({"r_all": round(float(r0), 3), "r_kept": round(float(r1), 3), "kept": int(keep.sum()), "thr": 1.0,
           "pts": [[round(float(a), 4), round(float(b), 4), int(k)] for a, b, k in zip(norm(x), norm(y), keep)]}, open('src/points.json', 'w'))
