"""A stylized, identity-free 3D face as a height field z(x, y) (x: −1…1 left-right, y: −1.35…1.35 bottom-top),
sampled as (a) a point cloud for the dot-projector look and (b) contour lines for the topographic look.
Writes build/face_pts.json (x, y, z per point, z = depth toward the camera, 0 = far edge … 1 = nose tip)."""
import numpy as np, json
def g(x, y, cx, cy, sx, sy, a): return a * np.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))
def smile(x, y, cy, curve, wdt, thick, a):
    """a ridge along a smiling curve y = cy + curve·x² (|x| < wdt)"""
    yc = cy + curve * x ** 2
    return a * np.exp(-((y - yc) / thick) ** 2) * np.exp(-(x / wdt) ** 6)
def height(x, y):
    # a friendly, round head: rounder outline, full cheeks, small nose, a gentle smile
    w = 0.88 + 0.04 * np.clip(y, -1, 1)
    r = (x / w) ** 2 + (y / 1.12) ** 2
    base = np.sqrt(np.clip(1 - r, 0, 1)) * 0.50
    z = base.copy()
    z += g(x, y, 0, -0.05, 0.075, 0.22, 0.10)                         # a short, soft nose bridge
    z += g(x, y, 0, -0.14, 0.11, 0.09, 0.16)                          # a round nose tip
    z -= g(x, y, -0.31, 0.24, 0.12, 0.10, 0.10) + g(x, y, 0.31, 0.24, 0.12, 0.10, 0.10)   # shallow eye hollows
    z += g(x, y, -0.31, 0.24, 0.075, 0.07, 0.09) + g(x, y, 0.31, 0.24, 0.075, 0.07, 0.09) # round eyes
    z += g(x, y, -0.31, 0.43, 0.15, 0.035, 0.04) + g(x, y, 0.31, 0.43, 0.15, 0.035, 0.04) # soft brows
    z += g(x, y, -0.45, -0.22, 0.20, 0.18, 0.11) + g(x, y, 0.45, -0.22, 0.20, 0.18, 0.11) # apple cheeks
    z += smile(x, y, -0.50, 0.55, 0.30, 0.045, 0.06)                  # smiling lips
    z -= smile(x, y, -0.52, 0.55, 0.28, 0.018, 0.035)                 # the smile line
    z += g(x, y, 0, -0.86, 0.22, 0.10, 0.05)                          # chin
    return np.where(r < 1, z, np.nan)
if __name__ == '__main__':
    # a structured-light dot grid (hexagonal, like a dot projector), kept where it lands on the face
    pts = []; sp = 0.028
    for j, y in enumerate(np.arange(-1.3, 1.3, sp * 0.866)):
        for x in np.arange(-0.95 + (j % 2) * sp / 2, 0.95, sp):
            z = height(np.array(x), np.array(y))
            if not np.isnan(z): pts.append([float(x), float(y), float(z)])
    P = np.array(pts); P[:, 2] = (P[:, 2] - P[:, 2].min()) / (P[:, 2].max() - P[:, 2].min())
    json.dump({'pts': np.round(P, 4).tolist()}, open('build/face_pts.json', 'w'))
    print(len(P), 'points')
