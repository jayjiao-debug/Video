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
    # a calm, identity-free sculpted face: oval head, eyes closed, a soft neutral mouth (premium, not cartoon, not staring)
    w = 0.80 + 0.06 * np.clip(y, -1, 1)
    r = (x / w) ** 2 + (y / 1.15) ** 2
    base = np.sqrt(np.clip(1 - r, 0, 1)) * 0.50
    z = base.copy()
    z += g(x, y, 0, 0.02, 0.06, 0.30, 0.09)                           # a slim nose bridge
    z += g(x, y, 0, -0.17, 0.09, 0.08, 0.12)                          # nose tip
    z -= g(x, y, -0.29, 0.22, 0.13, 0.09, 0.07) + g(x, y, 0.29, 0.22, 0.13, 0.09, 0.07)   # soft eye sockets
    z += g(x, y, -0.29, 0.21, 0.09, 0.055, 0.045) + g(x, y, 0.29, 0.21, 0.09, 0.055, 0.045) # closed lids
    z -= smile(x - 0.29, y, 0.185, -0.9, 0.09, 0.010, 0.018) + smile(x + 0.29, y, 0.185, -0.9, 0.09, 0.010, 0.018)  # lid creases
    z += g(x, y, -0.30, 0.40, 0.15, 0.04, 0.035) + g(x, y, 0.30, 0.40, 0.15, 0.04, 0.035) # brow ridge
    z += g(x, y, -0.40, -0.20, 0.18, 0.16, 0.05) + g(x, y, 0.40, -0.20, 0.18, 0.16, 0.05) # cheekbones
    z += smile(x, y, -0.48, 0.18, 0.20, 0.050, 0.045)                 # lips
    z -= smile(x, y, -0.475, 0.18, 0.19, 0.012, 0.022)                # the mouth line, a hint of a smile
    z += g(x, y, 0, -0.84, 0.20, 0.10, 0.05)                          # chin
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
