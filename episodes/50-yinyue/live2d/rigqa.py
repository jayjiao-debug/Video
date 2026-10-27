"""Rig QA: stress every part of a layered pose, on backgrounds that expose holes and seams, and auto-flag problems.
python3 rigqa.py <rigdir> <pose> <outdir>
Writes <pose>_qa_*.png sheets (full figure + 2x zoom of each joint) and <pose>_qa.json (auto findings)."""
import sys, json, os, numpy as np; from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd
R, pose, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
info = json.load(open(f'{R}/{pose}.json')); P = info['pivots']; nk = info['head']['neckY']
L = {k: (Image.open(f'{R}/{pose}_{k}.png'), v[0], v[1]) for k, v in info['boxes'].items()}
ORDER = ['tail', 'legL', 'legR', 'body', 'armL', 'armR', 'head']
FONT = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-DemiLight.ttc', 22)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rigrender import Rig
RIG = Rig(R, pose)
def compose(T): return RIG.compose(T)
# stress set: each part alone at both extremes, then everything at once
ext = {'head': [(9, 0, -12), (-9, 0, 8)], 'armL': [(45,), (-45,)], 'armR': [(-45,), (45,)],
       'earL': [(14,), (-14,)], 'earR': [(14,), (-14,)], 'tail': [(16,), (-16,)], 'legL': [(22,), (8,)], 'legR': [(22,), (8,)], 'body': [(0, .06), (0, -.03)]}
cases = [('rest', {})]
for k, vs in ext.items():
    if k in RIG.L or k in ('head', 'body') or (k.startswith('ear') and info['head'].get('ears')):
        for i, v in enumerate(vs): cases.append((f'{k}{"+-"[i]}', {k: v}))
cases.append(('all+', {k: vs[0] for k, vs in ext.items()})); cases.append(('all-', {k: vs[1] for k, vs in ext.items()}))
joints = {'neck': (512, nk), **{f'ear{s}': (e['notch'][0] + d, 150) for s, d, e in zip('LR', (-60, 60), info['head'].get('ears', []))}, **{k: tuple(P[k]) for k in ('armL', 'armR', 'tail', 'legL', 'legR') if k in P}}
rest = compose({})
CORE = nd.binary_erosion(np.asarray(RIG.L['torso'])[..., 3] > 200, iterations=4)   # moving parts may uncover background; the body itself never may
findings = []
def check(name, comp, T=None):
    a = np.asarray(comp)[..., 3] / 255.; rgb = np.asarray(comp)[..., :3].astype(float)
    core = nd.binary_erosion(np.asarray(RIG.compose(T or {}, order=['torso']))[..., 3] > 200, iterations=4)
    see = core & (a < .93)                                   # background shows through inside the figure
    lab, n = nd.label(nd.binary_dilation(see, iterations=2))
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(ys) > 25: findings.append({'case': name, 'type': 'see-through', 'px': int(len(ys)), 'at': [int(xs.mean()), int(ys.mean())]})
    nearedge = (a > .5) & (nd.distance_transform_edt(a > .5) < 10)
    speck = nearedge & (rgb.min(2) > 244) & (rgb.max(2) - rgb.min(2) <= 6)   # neutral white = background left between strokes (fur is warm cream)
    lab, n = nd.label(speck)
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if 2 <= len(ys) <= 80: findings.append({'case': name, 'type': 'matte-speck', 'px': int(len(ys)), 'at': [int(xs.mean()), int(ys.mean())]})
    if T and set(T) <= {'earL', 'earR'} and info['head'].get('ears'):       # an ear bend must leave the skull top between the notches alone
        nl, nr = (e['notch'][0] for e in info['head']['ears']); lo, hi = sorted((nl, nr))
        dif = np.abs(rgb - np.asarray(rest)[..., :3].astype(float)).max(2)[60:240, lo + 12:hi - 11] > 40
        if dif.sum() > 6: findings.append({'case': name, 'type': 'skull-moved', 'px': int(dif.sum()), 'at': [512, 150]})
    dark = (rgb.mean(2) < 120) & (a > .5)
    lab, n = nd.label(dark); sizes = nd.sum(dark, lab, range(1, n + 1))
    for i, sz in enumerate(sizes, 1):
        if 20 < sz < 140:                                         # tiny dark specks / line stubs
            ys, xs = np.where(lab == i)
            findings.append({'case': name, 'type': 'stray-fragment', 'px': int(sz), 'at': [int(xs.mean()), int(ys.mean())]})
def on(comp, col):
    bg = Image.new('RGBA', (1024, 1024), col + (255,)); bg.alpha_composite(comp); return bg.convert('RGB')
sheets = []
for name, T in cases:
    comp = compose(T); check(name, comp, T)
    row = [on(comp, (255, 0, 255)).resize((340, 340))]
    for j, (jx, jy) in joints.items():
        jx, jy = int(jx), int(jy); box = (max(0, jx - 110), max(0, jy - 110), min(1024, jx + 110), min(1024, jy + 110))
        for col in ((255, 0, 255), (30, 34, 52)):
            row.append(on(comp, col).crop(box).resize((340, 340), Image.LANCZOS))
    sheets.append((name, row))
# one sheet per 4 cases, labelled
for si in range(0, len(sheets), 4):
    chunk = sheets[si:si + 4]; w = len(chunk[0][1]) * 344; img = Image.new('RGB', (w, len(chunk) * 380 + 10), (250, 250, 250))
    d = ImageDraw.Draw(img)
    for r, (name, row) in enumerate(chunk):
        d.text((6, r * 380 + 4), f'{pose} · {name} · cols: full, then each joint ({", ".join(joints)}) on magenta / dark', font=FONT, fill=(0, 0, 0))
        for c_, im in enumerate(row): img.paste(im, (c_ * 344, r * 380 + 36))
    img.save(f'{OUT}/{pose}_qa_{si // 4}.png')
json.dump({'pose': pose, 'cases': [c[0] for c in cases], 'joints': list(joints), 'findings': findings}, open(f'{OUT}/{pose}_qa.json', 'w'), indent=1)
from collections import Counter
print(pose, 'sheets', (len(sheets) + 3) // 4, 'findings', Counter(f['type'] for f in findings))
