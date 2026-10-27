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
        # layers are always composed at full size and the finished figure is scaled once: scaling layers one by one
        # makes their hard cuts partly transparent and lets the background show through the seams
        self.info = json.load(open(f'{rigdir}/{pose}.json')); self.out_scale = scale; self.k = k = 1.0; self.N = N = 1024
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
    @staticmethod
    def _pre(img):
        o = img.copy(); o[..., :3] *= img[..., 3:] / 255.; return o
    @staticmethod
    def _post(img):
        o = img.copy(); a = np.maximum(img[..., 3:], 1e-3) / 255.; o[..., :3] = np.where(img[..., 3:] > 0, img[..., :3] / a, 0); return o
    def remap(self, img, mx, my):
        # resample premultiplied colour, so colour hidden in transparent pixels never bleeds into the edge
        o = cv2.remap(self._pre(img), mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        return self._post(o)
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
    def earbend(self, img, ear, ang):
        """bend one ear about its base: the tip moves most, the skull between the ears stays still"""
        if not ang: return img
        px, py, tipy = ear[:3]
        along = smooth((py - self.yy) / (py - tipy))                       # 0 at the base, 1 at the tip
        if len(ear) == 5:                                                 # [.., x_full, x_zero]: the whole ear turns as one piece,
            side = smooth((ear[4] - self.xx) / (ear[4] - ear[3]))         # fading out only toward the skull centre
        else: side = np.exp(-((self.xx - px) / ear[3]) ** 2)
        t = -np.radians(ang) * along * side; c, s = np.cos(t), np.sin(t)
        dx, dy = self.xx - px, self.yy - py
        return self.remap(img, px + c * dx - s * dy, py + s * dx + c * dy)
    def shift(self, img, dy):
        if not dy: return img
        M = np.float32([[1, 0, 0], [0, 1, dy * self.k]])
        return self._post(cv2.warpAffine(self._pre(img), M, (self.N, self.N), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0))
    def compose(self, T=None, order=ORDER):
        T = T or {}; out = np.zeros((self.N, self.N, 4), np.float32)
        bdy, squash = T.get('body', (0, 0))
        for n in order:
            if n not in self.L: continue
            img = self.L[n]
            if n in ('armL', 'armR'):
                ang = T.get(n, (0,))[0]
                lim = self.info.get('limits', {}).get(n)
                if lim: ang = float(np.clip(ang, *lim))                 # e.g. standing arms never swing into the body
                if ang and n + '_edge' in self.L:              # inner-edge outline fades in as the arm bends away
                    e = self.L[n + '_edge'].copy(); e[..., 3] *= min(1, abs(ang) / 6.)
                    a = e[..., 3:] / 255.; img = img.copy(); img[..., :3] = e[..., :3] * a + img[..., :3] * (1 - a)
                img = self.twirl(img, self.piv[n], ang, *self.D[n])
            elif n == 'tail':
                ang = T.get(n, (0,))[0]
                if ang > 0 and 'tail_edge' in self.L:          # outline on the tail's hidden inner edge, only as it swings out
                    e = self.L['tail_edge'].copy(); e[..., 3] *= min(1, ang / 5.)
                    a = e[..., 3:] / 255.; img = img.copy(); img[..., :3] = e[..., :3] * a + img[..., :3] * (1 - a)
                img = self.twirl(img, self.piv[n], ang, *self.D['tail'])
            elif n in ('legL', 'legR'): img = self.lift(img, T.get(n, (0,))[0], *self.D['leg'])
            elif n == 'torso':
                for side, ear in zip(('earL', 'earR'), self.info['head'].get('ears', [])):
                    img = self.earbend(img, ear, T.get(side, (0,))[0])   # ears bend first, then ride along with the head
                img = self.headwarp(img, *T.get('head', (0, 0, 0)))
            if squash: img = self.remap(img, self.xx, self.feet + (self.yy - self.feet) / (1 - squash))
            img = self.shift(img, bdy)
            a = img[..., 3:] / 255.
            out[..., :3] = img[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:] = 255 * a + out[..., 3:] * (1 - a)
        im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
        if self.out_scale != 1:
            s_ = int(round(1024 * self.out_scale)); pre = self._pre(out); pre = cv2.resize(pre, (s_, s_), interpolation=cv2.INTER_AREA)
            im = Image.fromarray(np.clip(self._post(pre), 0, 255).astype(np.uint8))
        return im
