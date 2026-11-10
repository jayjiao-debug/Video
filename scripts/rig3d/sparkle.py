# Per-pixel one-frame sparkle count: pixels that differ from both neighbours in time while the neighbours agree.
# A thin line moving across the picture also scores, so read the numbers against a baseline clip of the same move.
# usage: python3 sparkle.py <frames dir> [<baseline frames dir>]
import sys, glob
import numpy as np
from PIL import Image
def load(d):
    return [np.asarray(Image.open(p).convert('L'), np.int16) for p in sorted(glob.glob(d + '/f*.png'))]
def score(fr):
    out = []
    for k in range(1, len(fr) - 1):
        a, b, c = fr[k - 1], fr[k], fr[k + 1]
        m = (np.minimum(np.abs(b - a), np.abs(b - c)) > 45) & (np.abs(a - c) < 12)
        out.append(int(m.sum()))
    return np.array(out)
A = score(load(sys.argv[1]))
print('frames', len(A) + 2, 'sparkle px per frame: mean %.1f  median %d  p95 %d  max %d (frame %d)' % (A.mean(), np.median(A), np.percentile(A, 95), A.max(), int(A.argmax()) + 1))
if len(sys.argv) > 2:
    B = score(load(sys.argv[2]))
    print('baseline          : mean %.1f  median %d  p95 %d  max %d (frame %d)' % (B.mean(), np.median(B), np.percentile(B, 95), B.max(), int(B.argmax()) + 1))
    n = min(len(A), len(B)); d = A[:n] - B[:n]
    worst = np.argsort(-d)[:6]
    print('largest rise over baseline:', [(int(i) + 1, int(A[i]), int(B[i])) for i in worst])
