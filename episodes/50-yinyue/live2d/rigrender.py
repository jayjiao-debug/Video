"""Shared renderer for layered kittens: one place for draw order and masks.
compose(rig, T, scale) -> RGBA figure.  T: part -> (angle_deg, dx, dy) in master (1024) pixels.
Masks: each arm's root zone (near its shoulder pivot) is clipped to the body+head silhouette of the same frame,
so the arm always grows out of the body and never pokes out past the shoulder."""
import json, numpy as np; from PIL import Image
ORDER = ['tail', 'legL', 'legR', 'body', 'armL', 'armR', 'head']
ROOT_IN, ROOT_OUT = 46, 78          # clip fully inside ROOT_IN of the pivot, fade out to ROOT_OUT
class Rig:
    def __init__(self, rigdir, pose, scale=1.0):
        self.info = json.load(open(f'{rigdir}/{pose}.json')); self.k = scale
        self.size = int(round(1024 * scale)); self.L = {}
        for name, (x0, y0, x1, y1) in self.info['boxes'].items():
            im = Image.open(f'{rigdir}/{pose}_{name}.png')
            if scale != 1: im = im.resize((max(1, round(im.size[0] * scale)), max(1, round(im.size[1] * scale))), Image.LANCZOS)
            full = Image.new('RGBA', (self.size, self.size)); full.paste(im, (round(x0 * scale), round(y0 * scale)))
            self.L[name] = full
        self.piv = {k: tuple(v) for k, v in self.info['pivots'].items()}; self.piv['head'] = (512, self.info['head']['neckY'])
        yy, xx = np.mgrid[0:self.size, 0:self.size]; self.yy, self.xx = yy / scale, xx / scale
    def part(self, name, T):
        ang, dx, dy = T.get(name, (0, 0, 0)); im = self.L[name]
        if ang or dx or dy:
            px, py = self.piv.get(name, (512, 512))
            im = im.rotate(ang, resample=Image.BICUBIC, center=(px * self.k, py * self.k), translate=(dx * self.k, dy * self.k))
        return im
    def compose(self, T=None, order=ORDER):
        T = T or {}; c = Image.new('RGBA', (self.size, self.size)); parts = {}
        for n in order:
            if n in self.L: parts[n] = self.part(n, T)
        host = np.maximum(np.asarray(parts['body'])[..., 3], np.asarray(parts['head'])[..., 3]).astype(float) / 255.
        for n in order:
            if n not in parts: continue
            im = parts[n]
            if n.startswith('arm'):
                ang, dx, dy = T.get(n, (0, 0, 0)); px, py = self.piv[n]; px += dx; py += dy
                d = np.hypot(self.xx - px, self.yy - py)
                w = np.clip((d - ROOT_IN) / (ROOT_OUT - ROOT_IN), 0, 1)          # 0 at the root, 1 away from it
                a = np.asarray(im).astype(float); a[..., 3] *= w + (1 - w) * host
                im = Image.fromarray(a.astype(np.uint8))
            c.alpha_composite(im)
        return c
