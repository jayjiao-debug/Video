"""Cut a pose into rig layers (v2).
final = full picture (original head pasted on), noarm = the same pose redrawn without arms.
Layers: head (original art), body (from noarm), tail, legs (stand), arms (fur from final + a fresh outline).
Rules: soft alpha only on the character's outer silhouette; every internal cut is hard and parts overlap,
so no seam ever shows when parts move.
python3 cutpose.py <pose> <final.png> <noarm.png> <s> <mx> <my> <outdir>"""
import sys, json, numpy as np; from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
pose, fF, fA, s, mx, my, out = sys.argv[1], sys.argv[2], sys.argv[3], *map(float, sys.argv[4:7]), sys.argv[7]
F = np.asarray(Image.open(fF).convert('RGB')).astype(float); A = np.asarray(Image.open(fA).convert('RGB')).astype(float)
yy, xx = np.mgrid[0:1024, 0:1024]; P = np.c_[xx.ravel(), yy.ravel()]
poly = lambda pts: Path(pts).contains_points(P).reshape(1024, 1024)
INK = np.array([79., 34., 30.]); LINE = 10           # outline colour and width measured on the art
def charmask(im):
    seal = nd.binary_dilation(im.min(2) < 235, iterations=4)
    lab, _ = nd.label(~seal); bg = lab == lab[2, 2]
    return ~nd.binary_dilation(bg, iterations=4)
def largest(m):
    lab, n = nd.label(m)
    return lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1) if n else m
# head: the original head layer under the paste transform
h = Image.open('../l2d/band/cream_head.png'); full = Image.new('RGBA', (1024, 1024)); full.paste(h, (153, 76))
inv = (1 / s, 0, 512.9 - mx / s, 0, 1 / s, 438.45 - my / s)
Hd = np.asarray(full.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC)).astype(float)
head = Hd[..., 3] > 127; hb = int(np.where(head.any(1))[0].max())
CFG = {
 'sit': dict(tail=[(742,620),(875,620),(875,905),(756,905),(756,700),(742,690)], tailPivot=(765,860),
             arms={'armL': ([(150,595),(325,595),(350,640),(352,705),(150,765)], (330,650)),
                   'armR': ([(700,595),(880,595),(880,765),(675,705),(678,640)], (695,650))},
             legs={}),
 'stand': dict(tail=[(735,600),(870,600),(870,875),(690,875),(712,800),(735,760)], tailPivot=(720,830),
             arms={'armL': ([(240,600),(362,600),(392,660),(335,765),(240,765)], (345,630)),
                   'armR': ([(662,600),(792,600),(792,765),(695,765),(632,660)], (678,630))},
             legs={'legL': ([(368,835),(515,835),(515,1010),(368,1010)], (432,880)),
                   'legR': ([(515,835),(662,835),(662,1010),(515,1010)], (597,880))}),
}[pose]
cA = charmask(A); cF = charmask(F)
soft = nd.gaussian_filter(cA.astype(float), .8)      # soft outer edge of the armless character
white = A.min(2) > 246; tp = poly(CFG['tail'])
tail = largest(nd.binary_closing(cA & tp & ~head & ~white, iterations=3) & cA & ~white)
info = {'pose': pose, 'pivots': {}, 'boxes': {}}
def save(name, rgb, alpha):
    a = np.clip(alpha * 255, 0, 255).astype(np.uint8); m = a > 8
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), a])[y0:y1, x0:x1]).save(f'{out}/{pose}_{name}.png')
    info['boxes'][name] = [int(x0), int(y0), int(x1), int(y1)]
# ---- legs: everything of the character below the hip line, running up under the body (drawn behind it)
legs = {k: cA & poly(p) for k, (p, _) in CFG['legs'].items()}
if legs:
    xs = np.arange(1024); crotch0 = (xs > 440) & (xs < 600) & ~cA[940]
    for k in legs: legs[k] &= ~((yy > 878) & crotch0[None, :])
for k, m in legs.items():
    save(k, A, m * soft); info['pivots'][k] = CFG['legs'][k][1]
# ---- tail (behind the body): hard where it meets the body, soft outside
save('tail', A, tail * soft); info['pivots']['tail'] = CFG['tailPivot']
# ---- body: the armless body below the chin + a plain-fur neck band inside the head outline
hb0 = hb; chin = head & (yy > hb0 - 40) & (yy < hb0 - 8) & (np.abs(xx - mx) < 60)
furc = np.median(Hd[..., :3][chin], 0)
body = cA & ~tail & ~(tp & white)
# the redrawn head is removed column by column: keep the body from 12 px above the pasted head's lower edge
hsolid = nd.binary_opening(head, iterations=6)                 # head without whiskers
ybot = np.full(1024, -1); cols = np.where(hsolid.any(0))[0]
for x in cols: ybot[x] = np.where(hsolid[:, x])[0].max()
keep = np.ones((1024, 1024), bool)
for x in cols: keep[:ybot[x] - 12, x] = False
neckw = 175 * s
band = np.zeros((1024, 1024), bool)
for x in cols:
    if abs(x - mx) < neckw: band[ybot[x] - 12: ybot[x] + 7, x] = True
bm = body & keep
# crotch: the gap between the legs stays with the body so a lifted leg never splits the line
if CFG['legs']:
    crotch = np.zeros(1024, bool); xs = np.arange(1024); crotch[(xs > 440) & (xs < 600) & ~cA[940]] = True
    legzone = np.any([poly(p) for p, _ in CFG['legs'].values()], 0)
    bm &= ~(legzone & (yy > 878) & ~crotch[None, :])
core = nd.binary_opening(bm, iterations=5); bm &= nd.binary_dilation(core, iterations=6); bm = largest(bm)
B = A.copy(); B[band & bm] = furc          # plain fur where the chin overlaps the neck
save('body', B, bm * np.where(band, 1, soft))
# ---- arms: the arm's own fur from the final picture (toe lines kept), and a fresh outline drawn round it
diff = np.abs(F - A).max(2) > 40
orangeF = (F[..., 0] > 200) & (F[..., 2] < 170) & (F[..., 0] - F[..., 2] > 70)
whiteF = F.min(2) >= 248; darkF = F.mean(2) < 140
for k, (p, pv) in CFG['arms'].items():
    region = ((cF & ~cA) | (diff & ~(tp & orangeF))) & poly(p) & ~whiteF
    fur = nd.binary_opening(region & ~darkF & ~(tp & orangeF), iterations=2)
    fur = largest(fur)
    fur = nd.binary_fill_holes(nd.binary_closing(fur, iterations=3))     # keeps the toe lines inside the paw
    fur = nd.binary_opening(fur, iterations=3)
    if pose != 'sit' or k != 'armL':
        continue                        # one master arm: the clean sitting left arm; the rest are copies of it
    furcol = np.median(F[fur & ~darkF], 0)
    px, py = pv; d = np.hypot(xx - px, yy - py)
    rootR = 34
    # extend the arm to the pivot only within its own width: convex hull of its root part + a small disc
    from scipy.spatial import ConvexHull
    pts = np.c_[np.where(fur & (d < rootR + 40))[::-1]]
    pts = np.r_[pts, [[px + 12 * np.cos(t_), py + 12 * np.sin(t_)] for t_ in np.linspace(0, 2 * np.pi, 16)]]
    hull = Path(pts[ConvexHull(pts).vertices]).contains_points(P).reshape(1024, 1024)
    shape = nd.binary_closing(fur | hull, iterations=4)
    ring = nd.binary_dilation(shape, iterations=LINE) & ~shape
    fade = np.clip((d - rootR - 4) / 26., 0, 1)                         # no outline at the shoulder joint
    sil = np.maximum(nd.gaussian_filter(shape.astype(float), 1.0), nd.gaussian_filter(ring.astype(float), 1.0) * fade)
    fsoft = nd.gaussian_filter(shape.astype(float), .9)
    rgb = F.copy(); rgb[shape & ~fur] = furcol
    wh = fur & darkF & nd.binary_dilation((Hd[..., 3] > 40), iterations=2); rgb[wh] = furcol
    edge = np.clip(fsoft + (1 - fade), 0, 1)                            # near the root the edge stays fur-coloured
    rgb = rgb * edge[..., None] + INK * (1 - edge[..., None])
    ARM = np.dstack([np.clip(rgb, 0, 255), sil * 255]).astype(np.uint8)
    Image.fromarray(ARM).save(f'{out}/arm_master_full.png'); json.dump({'pivot': pv}, open(f'{out}/arm_master.json', 'w'))
# place the master arm (and its mirror) at this pose's shoulders
ARM = Image.open(f'{out}/arm_master_full.png'); apv = json.load(open(f'{out}/arm_master.json'))['pivot']
REST = {'sit': {'armL': (0, 1.0), 'armR': (0, 1.0)}, 'stand': {'armL': (-34, .965), 'armR': (-34, .965)}}[pose]
for k, (p, pv) in CFG['arms'].items():
    ang, sc = REST[k]
    im = ARM if k == 'armL' else ARM.transpose(Image.FLIP_LEFT_RIGHT)
    src = apv if k == 'armL' else (1023 - apv[0], apv[1])
    if k == 'armR': ang = -ang
    # rotate + scale about the master pivot, then move that pivot onto this shoulder
    c, sn = np.cos(np.radians(ang)) / sc, np.sin(np.radians(ang)) / sc
    # inverse map: output (x,y) -> input
    a_, b_ = c, sn; d_, e_ = -sn, c
    cx_, cy_ = pv
    inv = (a_, b_, src[0] - a_ * cx_ - b_ * cy_, d_, e_, src[1] - d_ * cx_ - e_ * cy_)
    placed = np.asarray(im.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC)).astype(float)
    save(k, placed[..., :3], placed[..., 3] / 255.); info['pivots'][k] = pv

save('head', Hd[..., :3], Hd[..., 3] / 255.)
info['head'] = {'scale': s, 'neckY': hb, 'eyes': [[mx - 138.6 * s, my], [mx + 138.6 * s, my]]}
json.dump(info, open(f'{out}/{pose}.json', 'w'), indent=1)
print(pose, info['boxes'])
