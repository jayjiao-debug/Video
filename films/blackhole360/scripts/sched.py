"""The fall, as one schedule shared by the plate renderer (python) and the 360 compositor (js).
r is in units of M (horizon r = 2, so 倍半径 = r / 2). Keypoints follow the storyboard; log r is interpolated
monotonically (PCHIP), so the black hole only ever grows and the fall speeds up towards the horizon.
Exposure: auto exposure measured at fixed r (99.3th percentile of the bloomed frame), interpolated in log r, so
there is no frame-to-frame flicker and every chunk agrees.
    python3 scripts/sched.py v360/sched.json"""
import json, sys, math, numpy as np
from scipy.interpolate import PchipInterpolator
FPS = 30
KEY = [(0, 36), (30, 24), (54, 12), (65, 7), (73, 3.2), (81.4, 2.0)]
# measured p99.3 → exposure factor min(2.5, 2.2/p) at these r (scripts: calibration run 2026-10-10)
EXPO = [(44, .41), (40, .376), (36, .347), (32, .313), (28, .284), (24, .253), (20, .223), (16, .196), (12, .173), (9, .159), (6, .177),
        (4.5, .147), (3.2, .09), (2.5, .064), (2.08, .047)]
T = np.array([k[0] for k in KEY]); R = np.log([k[1] for k in KEY])
f = PchipInterpolator(T, R)
er = np.log([e[0] for e in EXPO][::-1]); ev = np.log([e[1] for e in EXPO][::-1])
def r_at(t): return float(np.exp(f(min(max(t, 0), KEY[-1][0]))))
def expo_at(r): return 0.85 * float(np.exp(np.interp(math.log(r), er, ev)))
if __name__ == '__main__':
    n = int(KEY[-1][0] * FPS) + 1
    rs = [round(r_at(i / FPS), 5) for i in range(n)]
    json.dump(dict(fps=FPS, r=rs, expo=[round(expo_at(r), 5) for r in rs]), open(sys.argv[1], 'w'))
    for t in (0, 10, 20, 30, 54, 73, 81.4): print(t, round(r_at(t), 2), round(expo_at(r_at(t)), 3))
