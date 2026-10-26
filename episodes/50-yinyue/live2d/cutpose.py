"""Cut a pose into rig layers (v3).
final = full picture (original head pasted on), noarm = the same pose redrawn without arms.
  head  : the original head; its outline-less chin fades into the neck.
  body  : the armless body with the redrawn head removed by its own outline (as cutcat), plus a fur neck
          extruded from the chest colours, hidden under the chin.
  arms  : fur of the final picture between the paw and the armless body's outline, plus only the outline that
          hugs that fur. The root sits on the body and never moves (the renderer bends limbs, it doesn't rotate them).
  tail, legs: from the armless picture; legs run up under the body.
Alpha is soft only on the character's outer silhouette; every internal cut is hard.
python3 cutpose.py <pose> <final.png> <noarm.png> <s> <mx> <my> <outdir>"""
import sys, json, numpy as np; from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
pose, fF, fA, s, mx, my, out = sys.argv[1], sys.argv[2], sys.argv[3], *map(float, sys.argv[4:7]), sys.argv[7]
F = np.asarray(Image.open(fF).convert('RGB')).astype(float); A = np.asarray(Image.open(fA).convert('RGB')).astype(float)
yy, xx = np.mgrid[0:1024, 0:1024]; P = np.c_[xx.ravel(), yy.ravel()]
poly = lambda pts: Path(pts).contains_points(P).reshape(1024, 1024)
def charmask(im):
    seal = nd.binary_dilation(im.min(2) < 235, iterations=4)
    lab, _ = nd.label(~seal); bg = lab == lab[2, 2]
    return ~nd.binary_dilation(bg, iterations=4)
def largest(m):
    lab, n = nd.label(m)
    return lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1) if n else m
cA, cF = charmask(A), charmask(F)
darkA, darkF = A.mean(2) < 110, F.mean(2) < 110
softA = nd.gaussian_filter(cA.astype(float), .8); softF = nd.gaussian_filter(cF.astype(float), .8)
info = {'pose': pose, 'pivots': {}, 'boxes': {}, 'deform': {}}
def save(name, rgb, alpha):
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8); m = a > 4
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a])[y0:y1, x0:x1]).save(f'{out}/{pose}_{name}.png')
    info['boxes'][name] = [int(x0), int(y0), int(x1), int(y1)]
CFG = {
 'sit':   dict(tail=[(742,620),(875,620),(875,905),(756,905),(756,700),(742,690)], tailPivot=(768,868),
              arms={'armL': dict(y0=572, yjoin=708, seed=(215, 680), pivot=(330, 640)),
                    'armR': dict(y0=572, yjoin=708, seed=(812, 680), pivot=(694, 640))},
              legs={}),
 'stand': dict(tail=[(735,600),(870,600),(870,875),(690,875),(712,800),(735,760)], tailPivot=(722,838),
              arms={'armL': dict(y0=580, yjoin=738, seed=(300, 700), pivot=(352, 618)),
                    'armR': dict(y0=580, yjoin=738, seed=(724, 700), pivot=(672, 618))},
              legs={'legL': ([(368,835),(515,835),(515,1010),(368,1010)], (440, 870)),
                    'legR': ([(515,835),(662,835),(662,1010),(515,1010)], (590, 870))}),
}[pose]
# ---------- head: original layer under the paste transform; chin fades out over the neck
h = Image.open('../l2d/band/cream_head.png'); full = Image.new('RGBA', (1024, 1024)); full.paste(h, (153, 76))
inv = (1 / s, 0, 512.9 - mx / s, 0, 1 / s, 438.45 - my / s)
Hd = np.asarray(full.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC)).astype(float)
head = Hd[..., 3] > 127; hsolid = nd.binary_opening(head, iterations=6)
ybot = np.full(1024, -1)
for x in np.where(hsolid.any(0))[0]: ybot[x] = np.where(hsolid[:, x])[0].max()
ha = Hd[..., 3] / 255.
chinfade = np.ones((1024, 1024))
for x in np.where(ybot > 0)[0]:
    if abs(x - mx) < 130 * s: chinfade[:, x] = np.clip((ybot[x] - yy[:, x]) / 12., 0, 1) * 0 + np.clip((ybot[x] + 1 - yy[:, x]) / 12., 0, 1)
save('head', Hd[..., :3], ha * chinfade)
hb = int(ybot.max())
# ---------- the redrawn head inside the armless picture (cutcat's method)
solid = nd.binary_opening(cA, iterations=9)
rows = range(int(my) + 120, int(my) + 300); wid = [solid[y].sum() for y in rows]; neckY = rows[int(np.argmin(wid))]
xsN = np.where(solid[neckY])[0]; ncx = (xsN.min() + xsN.max()) / 2
hw = max(solid[y].sum() for y in range(int(my) - 150, neckY)) / 2
ry = (neckY - (my - 300 * s)) / 2 + 4; cy = neckY - ry + 2; rx = hw + 4
inside = ((xx - ncx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
Ahead = cA & (inside | (yy < neckY - 30))
# ---------- tail
white = A.min(2) > 246; tp = poly(CFG['tail'])
tail = largest(nd.binary_closing(cA & tp & ~Ahead & ~white, iterations=3) & cA & ~white)
save('tail', A, tail * softA); info['pivots']['tail'] = CFG['tailPivot']
# ---------- legs (stand): below the hip line, running up under the body; crotch line stays with the body
legs = {k: cA & poly(p) for k, (p, _) in CFG['legs'].items()}
xs = np.arange(1024); crotch = (xs > 440) & (xs < 600) & ~cA[940]
for k in legs:
    legs[k] &= ~((yy > 878) & crotch[None, :])
    save(k, A, legs[k] * softA); info['pivots'][k] = CFG['legs'][k][1]
# ---------- body
ybmap = np.where(ybot[None, :] > 0, ybot[None, :], 0)
Hcover = hsolid | (nd.binary_dilation(hsolid, iterations=7) & (yy < ybmap - 15))   # no margin along the chin/cheek bottom: nothing to clean there, and a margin would open a gap
body = cA & ~(Ahead & Hcover) & ~tail & ~(tp & white)      # remove the redrawn head only where the real head covers it
if legs:
    legzone = np.any([poly(p) for p, _ in CFG['legs'].values()], 0)
    body &= ~(legzone & (yy > 878) & ~crotch[None, :])
row = np.where(body[neckY + 25])[0]; half = (row.max() - row.min()) / 2 * .92; bcx = (row.max() + row.min()) / 2
neck = Hcover & cA & (yy > my + 50) & (np.abs(xx - bcx) < half)   # chin-shaped: fills exactly what the head removal took, under the chin
B = A.copy()
src_row = A[neckY + 25]
for x in range(int(bcx - half), int(bcx + half) + 1):           # extrude the chest colours up into the neck
    col = neck[:, x]
    if col.any(): B[col, x] = src_row[x]
bm = body | neck
core = nd.binary_opening(bm, iterations=5); bm &= nd.binary_dilation(core, iterations=6); bm = largest(bm)
save('body', B, bm * np.where(neck, 1, softA))
# ---------- arms
def edge_of(dark, y, side):
    """inner side of the armless body's outline on this row, found by scanning out from the body centre"""
    r = dark[y]; rng = range(500, 140, -1) if side == 'L' else range(524, 884)
    hit = [x for x in rng if r[x]]
    return hit[0] if hit else None
for k, c in CFG['arms'].items():
    side = k[-1]; region = np.zeros((1024, 1024), bool)
    for y in range(c['y0'], c['yjoin'] + 40):
        e = edge_of(darkA & cA & ~Ahead & ~nd.binary_dilation(tail | tp, iterations=6), y, side)
        if e is None: continue
        lim = e + (8 if y <= c['yjoin'] else -22) * (1 if side == 'L' else -1)
        if side == 'L': region[y, :lim] = True
        else: region[y, lim:] = True
    region &= cF
    fur = region & ~darkF
    lab, _ = nd.label(fur); fur = lab == lab[c['seed'][1], c['seed'][0]]
    fur = nd.binary_fill_holes(fur)                                   # toe lines stay inside the paw
    arm = fur | (region & darkF & nd.binary_dilation(fur, iterations=13))
    arm = nd.binary_closing(arm, iterations=2) & region
    rgb = F.copy()
    furcol = np.median(F[fur & ~darkF], 0)
    wh = arm & darkF & (Hd[..., 3] > 60) & ~nd.binary_dilation(~cF, iterations=3)   # head whiskers across the arm
    rgb[nd.binary_dilation(wh, iterations=1) & fur] = furcol
    inner = nd.binary_erosion(cA, iterations=2)                      # cut edge on the body: hard; silhouette: soft
    save(k, rgb, arm * np.where(inner, 1, softF))
    info['pivots'][k] = c['pivot']
info['head'] = {'scale': s, 'neckY': hb, 'eyes': [[mx - 138.6 * s, my], [mx + 138.6 * s, my]]}
info['deform'] = {'arm': [38, 125], 'tail': [18, 130], 'leg': [868, 930]}
json.dump(info, open(f'{out}/{pose}.json', 'w'), indent=1)
print(pose, 'neckY(A)', neckY, info['boxes'])
