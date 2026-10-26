"""Cut a pose into rig layers (v4: deform, don't cut).
final = the reference picture (original head pasted on), noarm = the same pose redrawn without arms.
  torso : the reference picture itself (head + body + whiskers) with the arms and tail taken out. The area the arms
          covered is filled from the armless picture, colour-matched. The head moves by WARPING inside this layer
          (renderer), so there is no head/body seam at all.
  armL/R: the reference picture's arm, cut along the armless body's outline; drawn over the torso.
          armX_edge: an outline along the arm's inner cut, faded in by the renderer only while the arm bends away.
  tail  : from the armless picture, extended under the body so a bend never pulls its root out.
  legL/R: from the reference picture below the hip, running up under the torso.
Alpha is soft only on the outer silhouette (with the white matte fringe removed); internal cuts are hard.
python3 cutpose.py <pose> <final.png> <noarm.png> <s> <mx> <my> <outdir>"""
import sys, json, numpy as np; from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
pose, fF, fA, s, mx, my, out = sys.argv[1], sys.argv[2], sys.argv[3], *map(float, sys.argv[4:7]), sys.argv[7]
F = np.asarray(Image.open(fF).convert('RGB')).astype(float); A = np.asarray(Image.open(fA).convert('RGB')).astype(float)
yy, xx = np.mgrid[0:1024, 0:1024]; P = np.c_[xx.ravel(), yy.ravel()]
poly = lambda pts: Path(pts).contains_points(P).reshape(1024, 1024)
INK = np.array([79., 34., 30.]); LINE = 10
def charmask(im):
    seal = nd.binary_dilation(im.min(2) < 235, iterations=4)
    lab, _ = nd.label(~seal); bg = lab == lab[2, 2]
    return ~nd.binary_dilation(bg, iterations=4)
def largest(m):
    lab, n = nd.label(m)
    return lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1) if n else m
def decontam(rgb, m):
    """replace the outer 3 px (anti-aliased against white) with the nearest inner colour: no white fringe"""
    inner = nd.binary_erosion(m, iterations=3)
    _, (iy, ix) = nd.distance_transform_edt(~inner, return_indices=True)
    o = rgb.copy(); ring = m & ~inner; o[ring] = rgb[iy[ring], ix[ring]]; return o
cA, cF = charmask(A), charmask(F)
darkA, darkF = A.mean(2) < 110, F.mean(2) < 110
softF = nd.gaussian_filter(cF.astype(float), .8); softA = nd.gaussian_filter(cA.astype(float), .8)
info = {'pose': pose, 'pivots': {}, 'boxes': {}, 'deform': {}}
def save(name, rgb, alpha):
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8); m = a > 4
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a])[y0:y1, x0:x1]).save(f'{out}/{pose}_{name}.png')
    info['boxes'][name] = [int(x0), int(y0), int(x1), int(y1)]
CFG = {
 'sit':   dict(tail=[(742,620),(875,620),(875,905),(756,905),(756,700),(742,690)], tailPivot=(768,868),
              arms={'armL': dict(y0=560, yjoin=708, seed=(215, 680), pivot=(330, 640)),
                    'armR': dict(y0=560, yjoin=708, seed=(812, 680), pivot=(694, 640))},
              legs={}, hipY=None),
 'stand': dict(tail=[(735,600),(870,600),(870,875),(690,875),(712,800),(735,760)], tailPivot=(722,838),
              arms={'armL': dict(y0=560, yjoin=738, seed=(300, 700), pivot=(352, 618)),
                    'armR': dict(y0=560, yjoin=738, seed=(724, 700), pivot=(672, 618))},
              legs={'legL': ([(368,835),(515,835),(515,1010),(368,1010)], (440, 870)),
                    'legR': ([(515,835),(662,835),(662,1010),(515,1010)], (590, 870))}, hipY=878),
}[pose]
# the real head's silhouette (keeps head pixels out of the arms; sets the head warp zone)
h = Image.open('../l2d/band/cream_head.png'); full = Image.new('RGBA', (1024, 1024)); full.paste(h, (153, 76))
inv = (1 / s, 0, 512.9 - mx / s, 0, 1 / s, 438.45 - my / s)
Hd = np.asarray(full.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC)).astype(float)
hsolid = nd.binary_opening(Hd[..., 3] > 127, iterations=6)
# the armless picture's own head (cutcat's method), to know where its body is
solid = nd.binary_opening(cA, iterations=9)
rows = range(int(my) + 120, int(my) + 300); neckY = rows[int(np.argmin([solid[y].sum() for y in rows]))]
xsN = np.where(solid[neckY])[0]; ncx = (xsN.min() + xsN.max()) / 2
hw = max(solid[y].sum() for y in range(int(my) - 150, neckY)) / 2
ry = (neckY - (my - 300 * s)) / 2 + 4; cy = neckY - ry + 2; rx = hw + 4
Ahead = cA & ((((xx - ncx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1) | (yy < neckY - 30))
# ---------- tail (armless picture), extended under the body
white = A.min(2) > 246; tp = poly(CFG['tail'])
gapF = (F.min(2) > 246) & nd.binary_dilation(tp, iterations=25)      # enclosed white between body, paw and tail = background
tail = largest(nd.binary_closing(cA & tp & ~Ahead & ~white, iterations=3) & cA & ~white)
Abody = cA & ~Ahead & ~tail & ~(tp & white)
under = nd.binary_dilation(tail, iterations=24) & nd.binary_erosion(Abody, iterations=12)     # hidden behind the torso
tailx = tail | under
_, (iy, ix) = nd.distance_transform_edt(~tail, return_indices=True)
T_rgb = A.copy(); T_rgb[under] = A[iy[under], ix[under]]
save('tail', decontam(T_rgb, tailx), tailx * np.where(under, 1, softA)); info['pivots']['tail'] = CFG['tailPivot']
# ---------- arms (reference picture), cut along the armless body's outline
def edge_of(dark, y, side):
    r = dark[y]; rng = range(500, 140, -1) if side == 'L' else range(524, 884)
    hit = [x for x in rng if r[x]]
    return hit[0] if hit else None
arms = {}
for k, c in CFG['arms'].items():
    side = k[-1]; region = np.zeros((1024, 1024), bool)
    for y in range(c['y0'], c['yjoin'] + 40):
        e = edge_of(darkA & cA & ~Ahead & ~nd.binary_dilation(tail | tp, iterations=6), y, side)
        if e is None: continue
        lim = e + (8 if y <= c['yjoin'] else -22) * (1 if side == 'L' else -1)
        if side == 'L': region[y, :lim] = True
        else: region[y, lim:] = True
    region &= cF & ~hsolid                          # never take head pixels: the head stays in the torso
    fur = region & ~darkF & ~gapF
    lab, _ = nd.label(fur); fur = lab == lab[c['seed'][1], c['seed'][0]]
    fur = nd.binary_fill_holes(fur)
    arm = fur | (region & darkF & nd.binary_dilation(fur, iterations=13))
    arm = nd.binary_closing(arm, iterations=2) & region & ~hsolid & ~gapF
    arms[k] = arm
    inner = nd.binary_erosion(cA, iterations=2) & ~nd.binary_dilation(~cF, iterations=2)
    save(k, decontam(F, arm), arm * np.where(inner, 1, softF))
    # the arm's cut edge that lies on the body: an outline shown only while the arm bends away
    cut = arm & ~nd.binary_erosion(arm, iterations=1) & nd.binary_erosion(Abody, iterations=6) & ~nd.binary_dilation(hsolid, iterations=10)
    stroke = nd.binary_dilation(cut, iterations=4) & arm
    save(k + '_edge', np.broadcast_to(INK, F.shape).copy(), nd.gaussian_filter(stroke.astype(float), .8) * arm)
    L = float(np.hypot(c['seed'][0] - c['pivot'][0], c['seed'][1] - c['pivot'][1]))
    info['pivots'][k] = c['pivot']; info['deform'][k] = [round(.18 * L, 1), round(.58 * L, 1)]
# ---------- legs (reference picture), behind the torso
legs = {}; crotch = None
if CFG['legs']:
    xs = np.arange(1024); crotch = (xs > 440) & (xs < 600) & ~cA[940]
    for k, (p, pv) in CFG['legs'].items():
        m = cF & poly(p) & ~((yy > CFG['hipY']) & crotch[None, :]); legs[k] = m
        save(k, decontam(F, m), m * softF); info['pivots'][k] = pv
    feet = int(np.where(np.any(list(legs.values()), 0).any(1))[0].max())
    info['deform']['leg'] = [CFG['hipY'] - 6, CFG['hipY'] + .45 * (feet - CFG['hipY'])]
# ---------- torso: the reference picture minus arms, tail and legs; the arm areas filled from the armless picture
allarm = np.any(list(arms.values()), 0)
T = (cF | (Abody & allarm)) & ~(tp & ~nd.binary_dilation(Abody, iterations=2)) & ~tail
if legs:
    legzone = np.any([poly(p) for p, _ in CFG['legs'].values()], 0)
    T &= ~(legzone & (yy > CFG['hipY']) & ~crotch[None, :])
T &= ~(allarm & ~Abody)                              # where only the arm was, nothing is left behind it
T &= ~(gapF & ~Abody)
T = largest(T)
fill = allarm & Abody
ring = nd.binary_dilation(fill, iterations=14) & ~allarm & Abody & ~darkF & ~darkA
gain = (np.median(F[ring], 0) + 1) / (np.median(A[ring], 0) + 1)       # colour-match the armless fill to the reference
Tr = F.copy(); Tr[fill] = np.clip(A[fill] * gain, 0, 255)
save('torso', decontam(Tr, T), T * np.where(nd.binary_erosion(cF | cA, iterations=2), 1, np.maximum(softF, softA)))
# ---------- head warp zone: full head motion above warp[1], none below warp[0] (shoulders and arm roots stay put)
y_arm = min(c['y0'] for c in CFG['arms'].values())
info['head'] = {'scale': s, 'neckY': int(neckY), 'pivot': [float(mx), float(neckY - 20)],
                'warp': [float(y_arm + 15), float(my + 60)], 'eyes': [[mx - 138.6 * s, my], [mx + 138.6 * s, my]]}
info['deform']['tail'] = [26, 120]
json.dump(info, open(f'{out}/{pose}.json', 'w'), indent=1)
print(pose, 'neckY', neckY, info['boxes'])
