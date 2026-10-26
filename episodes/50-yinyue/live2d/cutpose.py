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
def decontam(rgb, m, bg=None):
    """edge pixels facing the background were anti-aliased against white: give them the darkest colour nearby
    (every silhouette in this art is an outline), and colour the pixels just outside the mask the same way so a
    soft alpha never shows a pale rim. Internal cuts (not facing the background) are left alone."""
    bgm = ~m if bg is None else bg
    ring = nd.binary_dilation(bgm, iterations=3) & m
    out_ = nd.binary_dilation(m, iterations=2) & ~m
    lum = rgb.mean(2); dk = lum < 75
    src = m & dk
    o = rgb.copy()
    if src.any():
        _, (iy, ix) = nd.distance_transform_edt(~src, return_indices=True)
        near = nd.distance_transform_edt(~src) < 5
        sel = (ring & near & (lum > 75)) | out_
        o[sel] = rgb[iy[sel], ix[sel]]
    return o
def fill_specks(im):
    dk = im.mean(2) < 110
    sp = nd.binary_closing(dk, iterations=3) & ~dk & (im.min(2) > 190)
    o = im.copy(); o[sp] = INK; return o
F = fill_specks(F); A = fill_specks(A)
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
              arms={'armL': dict(y0=560, yjoin=708, seed=(215, 680), pivot=(330, 640), shoulder=(368, 652), rest=(0, 1.0)),
                    'armR': dict(y0=560, yjoin=708, seed=(812, 680), pivot=(694, 640), shoulder=(656, 652), rest=(0, 1.0))},
              masterPivot=(368, 652), legs={}, hipY=None),
 'stand': dict(tail=[(735,600),(870,600),(870,875),(690,875),(712,800),(735,760)], tailPivot=(722,838),
              arms={'armL': dict(y0=560, yjoin=738, seed=(300, 700), pivot=(352, 618), shoulder=(395, 645), rest=(23, .72)),
                    'armR': dict(y0=560, yjoin=738, seed=(724, 700), pivot=(672, 618), shoulder=(629, 645), rest=(23, .72))},
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
gapF = (F.min(2) >= 246) & (F.max(2) - F.min(2) <= 5) & nd.binary_dilation(tp, iterations=30)      # enclosed white between body, paw and tail = background
cand = cF & (F.min(2) >= 246) & (F.max(2) - F.min(2) <= 5) & (nd.distance_transform_edt(cF) < 20)   # neutral white (background, not cream fur)
lab_, n_ = nd.label(cand); sz_ = nd.sum(cand, lab_, range(1, n_ + 1))
pocket = np.isin(lab_, [i + 1 for i, v in enumerate(sz_) if v <= 120])   # only small pockets trapped between strokes
gapF |= pocket
gapF |= nd.binary_dilation(gapF, iterations=2) & (F.mean(2) > 170) & ~(F.mean(2) < 110)   # its anti-aliased rim too
cF = cF & ~pocket
tail = largest(nd.binary_closing(cA & tp & ~Ahead & ~white, iterations=3) & cA & ~white)
neutralA = (A.min(2) >= 246) & (A.max(2) - A.min(2) <= 5)
Abody = cA & ~Ahead & ~tail & ~(tp & white) & ~(neutralA & nd.binary_dilation(tp, iterations=30))   # enclosed background is not body
tpv = np.array(CFG['tailPivot']); near_root = np.hypot(xx - tpv[0], yy - tpv[1]) < 55
under = nd.binary_dilation(tail, iterations=24) & nd.binary_erosion(Abody, iterations=2) & near_root   # hidden behind the torso
tailx = tail | under
_, (iy, ix) = nd.distance_transform_edt(~tail, return_indices=True)
T_rgb = A.copy(); T_rgb[under] = A[iy[under], ix[under]]
bgA = ~cA | (tp & white) | (nd.binary_dilation(tp, iterations=30) & (A.min(2) >= 246) & (A.max(2) - A.min(2) <= 5))
save('tail', decontam(T_rgb, tailx, bgA), np.maximum(tailx * np.where(nd.binary_dilation(bgA, iterations=2), nd.gaussian_filter(tailx.astype(float), .8), 1), 0)); info['pivots']['tail'] = CFG['tailPivot']
tcut = tail & ~nd.binary_erosion(tail, iterations=1) & nd.binary_dilation(Abody, iterations=3) & ~near_root
tstroke = nd.binary_dilation(tcut, iterations=4) & tail & ~darkA
if tstroke.sum() > 20: save('tail_edge', np.broadcast_to(INK, F.shape).copy(), nd.gaussian_filter(tstroke.astype(float), .7) * tail)
# ---------- arms (reference picture), cut along the armless body's outline
def edge_of(dark, y, side):
    r = dark[y]; rng = range(500, 140, -1) if side == 'L' else range(524, 884)
    hit = [x for x in rng if r[x]]
    return hit[0] if hit else None
arms = {}
for k, c in CFG['arms'].items():
    side = k[-1]; region = np.zeros((1024, 1024), bool)
    ys_ = list(range(c['y0'], c['yjoin'] + 40)); dk = darkA & cA & ~Ahead & ~nd.binary_dilation(tail | tp, iterations=6)
    es = [edge_of(dk, y, side) for y in ys_]
    good = [i for i, e in enumerate(es) if e is not None]
    es = np.interp(range(len(ys_)), good, [es[i] for i in good])
    es = nd.median_filter(es, size=9, mode='nearest')                     # a smooth cut line, not a staircase
    for y, e in zip(ys_, es):
        e = int(round(e))
        lim = e + ((8 if pose == 'sit' else 20) if y <= c['yjoin'] else -22) * (1 if side == 'L' else -1)
        if side == 'L': region[y, :lim] = True
        else: region[y, lim:] = True
    region &= cF & ~hsolid                          # never take head pixels: the head stays in the torso
    fur = region & ~darkF & ~gapF
    lab, _ = nd.label(fur); fur = lab == lab[c['seed'][1], c['seed'][0]]
    fur = nd.binary_fill_holes(fur)
    arm = fur | (region & darkF & nd.binary_dilation(fur, iterations=13))
    arm = nd.binary_closing(arm, iterations=2) & region & ~hsolid & ~gapF
    arms[k] = arm
    if pose == 'sit' and k == 'armL':
        # the master arm: the clean sitting left arm, completed into a whole limb whose root reaches a pivot
        # well inside the shoulder (hidden behind the torso at any angle), with one clean outline all round
        pm = np.array(CFG['masterPivot'], float); d = np.hypot(xx - pm[0], yy - pm[1])
        from scipy.spatial import ConvexHull
        pts = np.c_[np.where(arm & (d < 120))[::-1]]
        pts = np.r_[pts, [[pm[0] + 26 * np.cos(t_), pm[1] + 26 * np.sin(t_)] for t_ in np.linspace(0, 2 * np.pi, 20)]]
        hull = Path(pts[ConvexHull(pts).vertices]).contains_points(P).reshape(1024, 1024)
        armfur = nd.binary_erosion(arm, iterations=LINE) | (fur & arm)
        shape = nd.binary_closing(armfur | (hull & ~nd.binary_dilation(arm, iterations=0)) | fur, iterations=3)
        shape = nd.binary_fill_holes(shape | nd.binary_erosion(hull, iterations=LINE))
        ring = nd.binary_dilation(shape, iterations=LINE) & ~shape
        furc = np.median(F[fur & ~darkF], 0)
        rgb = np.where(fur[..., None], F, furc)                         # fur (with toe lines) from the art, filled root
        rgb = np.where((arm & darkF & ~fur)[..., None], F, rgb)          # the art's own outline where it has one
        full_ = shape | ring
        rgb = np.where((ring & ~(arm & darkF))[..., None], INK, rgb)    # a fresh outline where it had none (the root)
        sil = nd.gaussian_filter(full_.astype(float), .9)
        rgb = np.where((~full_)[..., None], INK, rgb)
        Image.fromarray(np.dstack([np.clip(rgb, 0, 255), sil * 255]).astype(np.uint8)).save(f'{out}/arm_master.png')
        json.dump({'pivot': list(map(float, pm))}, open(f'{out}/arm_master.json', 'w'))
# 2) place the master arm (mirrored for the right) at each pose's shoulder pivots; arms are drawn BEHIND the torso
MA = Image.open(f'{out}/arm_master.png'); pm = json.load(open(f'{out}/arm_master.json'))['pivot']
for k, c in CFG['arms'].items():
    ang, sc = c['rest']; pv = c['shoulder']
    im = MA if k == 'armL' else MA.transpose(Image.FLIP_LEFT_RIGHT)
    src = pm if k == 'armL' else (1023 - pm[0], pm[1])
    if k == 'armR': ang = -ang
    t = np.radians(ang); cs, sn = np.cos(t) / sc, np.sin(t) / sc        # inverse map: output -> master
    inv_ = (cs, -sn, src[0] - cs * pv[0] + sn * pv[1], sn, cs, src[1] - sn * pv[0] - cs * pv[1])
    placed = np.asarray(im.transform((1024, 1024), Image.AFFINE, inv_, resample=Image.BICUBIC)).astype(float)
    save(k, placed[..., :3], placed[..., 3] / 255.)
    info['pivots'][k] = list(pv); info['deform'][k] = [0, 1]          # rigid swing about the hidden pivot
    info.setdefault('limits', {})[k] = ([-40, 40] if pose == 'sit' else ([-6, 45] if k == 'armL' else [-45, 6]))
# ---------- legs (reference picture), behind the torso
legs = {}; crotch = None
if CFG['legs']:
    xs = np.arange(1024); crotch = (xs > 440) & (xs < 600) & ~cA[940]
    for k, (p, pv) in CFG['legs'].items():
        m = cF & poly(p) & ~((yy > CFG['hipY']) & crotch[None, :]); legs[k] = m
        bgL = ~cF
        save(k, decontam(F, m, bgL), m * np.where(nd.binary_dilation(bgL, iterations=2), softF, 1)); info['pivots'][k] = pv
    feet = int(np.where(np.any(list(legs.values()), 0).any(1))[0].max())
    info['deform']['leg'] = [CFG['hipY'] + 12, CFG['hipY'] + 12 + .4 * (feet - CFG['hipY'])]
# ---------- torso: the reference picture minus arms, tail and legs; the arm areas filled from the armless picture
allarm = np.any(list(arms.values()), 0)
T = (cF | (Abody & allarm)) & ~(tp & ~nd.binary_dilation(Abody, iterations=2)) & ~tail
if legs:
    legzone = np.any([poly(p) for p, _ in CFG['legs'].values()], 0)
    T &= ~(legzone & (yy > CFG['hipY']) & ~(crotch[None, :] & (yy < CFG['hipY'] + 28)))
headzone = nd.binary_dilation(Hd[..., 3] > 60, iterations=16 if pose == 'stand' else 3)   # standing: the shoulder fur under the cheek stays with the torso
keepcheek = (darkF & nd.binary_dilation(hsolid, iterations=16)) if pose == 'stand' else np.zeros_like(T)
T &= ~(allarm & ~Abody & ~headzone & ~keepcheek)   # remove the arm, keep the head (and, standing, its cheek outline)
T &= ~(gapF & ~Abody)
outside = T & ~Abody & ~headzone
lab_, n_ = nd.label(outside); sz_ = nd.sum(outside, lab_, range(1, n_ + 1))
T &= ~np.isin(lab_, [i + 1 for i, v in enumerate(sz_) if v < 400])      # stubs / chips of the old arm outline
T = largest(T)
import cv2
zone = np.zeros((1024, 1024), bool)
for k, c in CFG['arms'].items():
    side = k[-1]
    for y in range(c['y0'], c['yjoin'] + 6):
        e = edge_of(darkA & cA & ~Ahead & ~nd.binary_dilation(tail | tp, iterations=6), y, side)
        if e is None: continue
        if side == 'L': zone[y, :e + 44] = True
        else: zone[y, e - 44:] = True
zone &= Abody & ~hsolid
orangeF = (F[..., 0] > 200) & (F[..., 2] < 170) & (F[..., 0] - F[..., 2] > 60)
protect = (nd.binary_dilation(darkF, iterations=4) | nd.binary_dilation(orangeF, iterations=2)) & ~nd.binary_dilation(allarm, iterations=4)
zone &= ~protect                                  # other strokes (cheek-line tips) and body patches stay as drawn
zone |= allarm & Abody
furmed = np.median(F[Abody & ~darkF & ~zone & (yy > neckY)], 0)
Fs = F.copy(); Fs[~Abody] = furmed; Fs[nd.binary_dilation(darkF, iterations=3)] = furmed   # paint from fur only, never smear strokes
paint = cv2.inpaint(np.clip(Fs, 0, 255).astype(np.uint8), (zone | (allarm & ~Abody)).astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA).astype(float)
outlineA = darkA & zone
w = nd.gaussian_filter(zone.astype(float), 3) * zone                      # feather into the reference fur
Tr = F * (1 - w[..., None]) + paint * w[..., None]
aA = nd.gaussian_filter(outlineA.astype(float), .7)[..., None]
Tr = Tr * (1 - aA) + A * aA                                                # the armless body's side outline
bgT = ~(cF | cA) | (allarm & ~Abody) | gapF | (~T & nd.binary_dilation(tp, iterations=30) & ~tail)
Ta = T * np.where(nd.binary_dilation(bgT, iterations=2), nd.gaussian_filter(T.astype(float), .8), 1)
save('torso', decontam(Tr, T, bgT), Ta)
# ---------- head warp zone: full head motion above warp[1], none below warp[0] (shoulders and arm roots stay put)
y_arm = min(c['y0'] for c in CFG['arms'].values())
info['head'] = {'scale': s, 'neckY': int(neckY), 'pivot': [float(mx), float(neckY - 20)],
                'warp': [float(y_arm + 15), float(my - 40)], 'eyes': [[mx - 138.6 * s, my], [mx + 138.6 * s, my]]}
info['deform']['tail'] = [26, 120]
json.dump(info, open(f'{out}/{pose}.json', 'w'), indent=1)
print(pose, 'neckY', neckY, info['boxes'])
