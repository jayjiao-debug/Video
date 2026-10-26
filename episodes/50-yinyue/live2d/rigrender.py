"""Shared renderer for layered kittens (v3: deform, don't cut).
compose(T) -> RGBA.  T (all optional):
  head: (angle_deg, dx, dy)     warps the head inside the torso: full motion above warp[1], none below warp[0]
  armL/armR: (angle_deg,)       bend about the shoulder: no motion within r0, full angle beyond r1 (paw stays rigid)
  tail: (angle_deg,)            the same bend about the tail root
  legL/legR: (lift_px,)         the foot lifts as a block; the hip stays
  body: (dy, squash)            whole-figure offset and squash about the feet
Draw order: tail, legs, torso (with head), arms.  The arm's inner-edge outline fades in with the bend."""
import json, numpy as np, cv2; from PIL import Image
ORDER = ['tail', 'legL', 'legR', 'armL', 'armR', 'torso']
def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
class Rig:
    def __init__(self, rigdir, pose, scale=1.0):
        self.info = json.load(open(f'{rigdir}/{pose}.json')); self.k = k = scale; self.N = N = int(round(1024 * k))
        self.L = {}
        for name, (x0, y0, x1, y1) in self.info['boxes'].items():
            im = Image.open(f'{rigdir}/{pose}_{name}.png'); full = Image.new('RGBA', (1024, 1024)); full.paste(im, (x0, y0))
            if k != 1: full = full.resize((N, N), Image.LANCZOS)
            self.L[name] = np.asarray(full).astype(np.float32)
        self.piv = {n: np.array(v, float) * k for n, v in self.info['pivots'].items()}
        self.D = {n: np.array(v, float) * k for n, v in self.info['deform'].items()}
        hd = self.info['head']; self.hpiv = np.array(hd['pivot']) * k; self.hwarp = np.array(hd['warp']) * k
        self.feet = max(b[3] for b in self.info['boxes'].values()) * k
        yy, xx = np.mgrid[0:N, 0:N].astype(np.float32); self.xx, self.yy = xx, yy
    def remap(self, img, mx, my):
        return cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    def twirl(self, img, piv, ang, r0, r1):
        if not ang: return img
        dx, dy = self.xx - piv[0], self.yy - piv[1]; r = np.hypot(dx, dy)
        t = -np.radians(ang) * smooth((r - r0) / (r1 - r0)); c, s = np.cos(t), np.sin(t)
        return self.remap(img, piv[0] + c * dx - s * dy, piv[1] + s * dx + c * dy)
    def lift(self, img, amt, y0, y1):
        if not amt: return img
        return self.remap(img, self.xx, self.yy + amt * self.k * smooth((self.yy - y0) / (y1 - y0)))
    def headwarp(self, img, ang, dx, dy):
        if not (ang or dx or dy): return img
        w = smooth((self.hwarp[0] - self.yy) / (self.hwarp[0] - self.hwarp[1]))   # 1 on the head, 0 at the shoulders
        px, py = self.hpiv; t = -np.radians(ang) * w; c, s = np.cos(t), np.sin(t)
        X, Y = self.xx - dx * self.k * w - px, self.yy - dy * self.k * w - py
        return self.remap(img, px + c * X - s * Y, py + s * X + c * Y)
    def shift(self, img, dy):
        if not dy: return img
        M = np.float32([[1, 0, 0], [0, 1, dy * self.k]])
        return cv2.warpAffine(img, M, (self.N, self.N), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    def compose(self, T=None, order=ORDER):
        T = T or {}; out = np.zeros((self.N, self.N, 4), np.float32)
        bdy, squash = T.get('body', (0, 0))
        for n in order:
            if n not in self.L: continue
            img = self.L[n]
            if n in ('armL', 'armR'):
                ang = T.get(n, (0,))[0]
                if ang and n + '_edge' in self.L:              # inner-edge outline fades in as the arm bends away
                    e = self.L[n + '_edge'].copy(); e[..., 3] *= min(1, abs(ang) / 6.)
                    a = e[..., 3:] / 255.; img = img.copy(); img[..., :3] = e[..., :3] * a + img[..., :3] * (1 - a)
                img = self.twirl(img, self.piv[n], ang, *self.D[n])
            elif n == 'tail':
                ang = T.get(n, (0,))[0]
                if ang and 'tail_edge' in self.L:              # the tail's hidden inner edge gets its outline as it swings out
                    e = self.L['tail_edge'].copy(); e[..., 3] *= min(1, abs(ang) / 5.)
                    a = e[..., 3:] / 255.; img = img.copy(); img[..., :3] = e[..., :3] * a + img[..., :3] * (1 - a)
                img = self.twirl(img, self.piv[n], ang, *self.D['tail'])
            elif n in ('legL', 'legR'): img = self.lift(img, T.get(n, (0,))[0], *self.D['leg'])
            elif n == 'torso': img = self.headwarp(img, *T.get('head', (0, 0, 0)))
            if squash: img = self.remap(img, self.xx, self.feet + (self.yy - self.feet) / (1 - squash))
            img = self.shift(img, bdy)
            a = img[..., 3:] / 255.
            out[..., :3] = img[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:] = 255 * a + out[..., 3:] * (1 - a)
        return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
