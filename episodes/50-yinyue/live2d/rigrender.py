"""Shared renderer for layered kittens (v2): deformers instead of rigid rotations, so no joint ever opens.
compose(T) -> RGBA.  T (all optional):
  head: (angle_deg, dx, dy)            rigid, about the neck point
  armL/armR/tail: (angle_deg,)         bend: no motion within r0 of the pivot, full angle beyond r1 (twirl deformer)
  legL/legR: (lift_px,)                the foot lifts, the hip stays (vertical deformer from hip to foot)
  body: (dy, squash)                   whole figure offset (dy) and squash about the feet (squash 0.04 = 4 % shorter)
All parts move with the body offset; the head adds its own bob on top."""
import json, numpy as np, cv2; from PIL import Image
ORDER = ['tail', 'legL', 'legR', 'body', 'armL', 'armR', 'head']
def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
class Rig:
    def __init__(self, rigdir, pose, scale=1.0):
        self.info = json.load(open(f'{rigdir}/{pose}.json')); self.k = k = scale; self.N = N = int(round(1024 * k))
        self.L = {}
        for name, (x0, y0, x1, y1) in self.info['boxes'].items():
            im = Image.open(f'{rigdir}/{pose}_{name}.png')
            full = Image.new('RGBA', (1024, 1024)); full.paste(im, (x0, y0))
            if k != 1: full = full.resize((N, N), Image.LANCZOS)
            self.L[name] = np.asarray(full).astype(np.float32)
        self.piv = {n: np.array(v, float) * k for n, v in self.info['pivots'].items()}
        self.neck = np.array([512, self.info['head']['neckY']], float) * k
        d = self.info['deform']; self.arm_r = np.array(d['arm']) * k; self.tail_r = np.array(d['tail']) * k; self.leg_y = np.array(d['leg']) * k
        self.feet = max(b[3] for b in self.info['boxes'].values()) * k
        yy, xx = np.mgrid[0:N, 0:N].astype(np.float32); self.xx, self.yy = xx, yy
    def remap(self, img, mx, my):
        return cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    def twirl(self, img, piv, ang, r0, r1):
        if not ang: return img
        dx, dy = self.xx - piv[0], self.yy - piv[1]; r = np.hypot(dx, dy)
        t = -np.radians(ang) * smooth((r - r0) / (r1 - r0))       # inverse map: rotate back by the local angle
        c, s = np.cos(t), np.sin(t)
        return self.remap(img, piv[0] + c * dx - s * dy, piv[1] + s * dx + c * dy)
    def lift(self, img, amt, y0, y1):
        if not amt: return img
        w = smooth((self.yy - y0) / (y1 - y0))
        return self.remap(img, self.xx, self.yy + amt * self.k * w)
    def rigid(self, img, piv, ang, dx, dy):
        if not (ang or dx or dy): return img
        M = cv2.getRotationMatrix2D((float(piv[0]), float(piv[1])), ang, 1.0); M[:, 2] += (dx * self.k, dy * self.k)
        return cv2.warpAffine(img, M, (self.N, self.N), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    def compose(self, T=None, order=ORDER):
        T = T or {}; out = np.zeros((self.N, self.N, 4), np.float32)
        bdy, squash = T.get('body', (0, 0))
        for n in order:
            if n not in self.L: continue
            img = self.L[n]
            if n in ('armL', 'armR'): img = self.twirl(img, self.piv[n], T.get(n, (0,))[0], *self.arm_r)
            elif n == 'tail': img = self.twirl(img, self.piv[n], T.get(n, (0,))[0], *self.tail_r)
            elif n in ('legL', 'legR'): img = self.lift(img, T.get(n, (0,))[0], *self.leg_y)
            elif n == 'head':
                a, dx, dy = T.get('head', (0, 0, 0)); img = self.rigid(img, self.neck, a, dx, dy)
            if squash and n != 'head':                                  # squash about the feet
                sy = 1 - squash; img = self.remap(img, self.xx, self.feet + (self.yy - self.feet) / sy)
            elif squash and n == 'head':                                # the head rides down with the squashed neck
                img = self.rigid(img, self.neck, 0, 0, (self.feet - self.neck[1]) * squash / self.k)
            if bdy: img = self.rigid(img, (0, 0), 0, 0, bdy)
            a = img[..., 3:] / 255.
            out[..., :3] = img[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:] = 255 * a + out[..., 3:] * (1 - a)
        return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
