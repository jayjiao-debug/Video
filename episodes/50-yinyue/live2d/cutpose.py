"""Cut a pose into rig layers.  final = full picture (original head pasted), noarm = same pose drawn without arms.
Layers: head (original art), body (from noarm, head + tail + legs removed), tail, legs (stand), arms (from final).
python3 cutpose.py <pose> <final.png> <noarm.png> <s> <mx> <my> <outdir>"""
import sys, json, numpy as np; from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
pose, fF, fA, s, mx, my, out = sys.argv[1], sys.argv[2], sys.argv[3], *map(float, sys.argv[4:7]), sys.argv[7]
F = np.asarray(Image.open(fF).convert('RGB')).astype(int); A = np.asarray(Image.open(fA).convert('RGB')).astype(int)
yy, xx = np.mgrid[0:1024, 0:1024]; P = np.c_[xx.ravel(), yy.ravel()]
poly = lambda pts: Path(pts).contains_points(P).reshape(1024, 1024)
def charmask(im):
    # seal small gaps in the outline before flooding the background, so near-white fur (legs) stays inside
    seal = nd.binary_dilation(im.min(2) < 235, iterations=4)
    lab, _ = nd.label(~seal); bg = lab == lab[2, 2]
    return ~nd.binary_dilation(bg, iterations=4)
# head: the original head layer under the same transform used for the paste
h = Image.open('../l2d/band/cream_head.png'); full = Image.new('RGBA', (1024, 1024)); full.paste(h, (153, 76))
inv = (1 / s, 0, 512.9 - mx / s, 0, 1 / s, 438.45 - my / s)
Hd = np.asarray(full.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC))
head = Hd[..., 3] > 127
CFG = {
 'sit': dict(tail=[(742,620),(875,620),(875,905),(756,905),(756,700),(742,690)], tailPivot=(765,860),
             arms={'armL': ([(150,595),(325,595),(350,640),(352,705),(150,765)], (330,650)),
                   'armR': ([(700,595),(880,595),(880,765),(675,705),(678,640)], (695,650))},
             legs={}),
 'stand': dict(tail=[(735,600),(870,600),(870,875),(690,875),(712,800),(735,760)], tailPivot=(720,830),
             arms={'armL': ([(240,600),(362,600),(392,660),(335,765),(240,765)], (345,630)),
                   'armR': ([(662,600),(792,600),(792,765),(695,765),(632,660)], (678,630))},
             legs={'legL': ([(360,878),(505,878),(505,1010),(360,1010)], (432,880)),
                   'legR': ([(525,878),(672,878),(672,1010),(525,1010)], (597,880))}),
}[pose]
cA = charmask(A); cF = charmask(F)
white = A.min(2) > 246
tp = poly(CFG['tail'])
tail = cA & tp & ~head & ~white
tail = nd.binary_closing(tail, iterations=3) & cA & ~white
lab, n = nd.label(tail); tail = lab == (np.argmax(nd.sum(tail, lab, range(1, n + 1))) + 1)
legs = {k: cA & poly(p) for k, (p, _) in CFG['legs'].items()}
body = cA & ~tail & ~(tp & white)   # the white gap between tail and body is background
for m in legs.values(): body &= ~m
# neck band under the head stays body (plain fur) so a nodding head never shows a hole
info = {'pose': pose, 'pivots': {}, 'boxes': {}}
def save(name, rgb, m, feather=.7):
    a = (nd.gaussian_filter(m.astype(float), feather) * 255).astype(np.uint8)
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(np.dstack([rgb.astype(np.uint8), a])[y0:y1, x0:x1]).save(f'{out}/{pose}_{name}.png'); info['boxes'][name] = [int(x0), int(y0), int(x1), int(y1)]
# arms from the final picture: where final differs from the armless picture, inside the arm box
diff = (np.abs(F - A).max(2) > 40) & cF
orangeF = (F[..., 0] > 200) & (F[..., 2] < 170) & (F[..., 0] - F[..., 2] > 70)
whiteF = F.min(2) >= 248
for k, (p, pv) in CFG['arms'].items():
    m = ((cF & ~cA) | (diff & ~(tp & orangeF))) & poly(p) & ~whiteF
    m = nd.binary_closing(m, iterations=6) & ~whiteF
    lab, n = nd.label(~m); holes = np.isin(lab, [i for i in range(1, n + 1) if (lab == i).sum() < 400]); m |= holes   # only small holes
    core = nd.binary_opening(m, iterations=5); m &= nd.binary_dilation(core, iterations=6)   # drop thin strays (whiskers, body lines)
    darkF = F.mean(2) < 140
    fur = m & ~darkF & ~(tp & orangeF)
    fur = nd.binary_opening(fur, iterations=2)
    lab, n = nd.label(fur); fur = lab == (np.argmax(nd.sum(fur, lab, range(1, n + 1))) + 1)
    near = nd.binary_dilation(fur, iterations=13)
    m = fur | (m & darkF & near)          # the arm's own fur + only the outline hugging it
    m = nd.binary_closing(m, iterations=2) & (fur | darkF | nd.binary_dilation(fur, iterations=2))
    # whiskers drawn across the arm belong to the head: paint them out of the arm with the arm's fur colour
    Fa = F.copy(); wh = m & darkF & (Hd[..., 3] > 40)
    wh = nd.binary_dilation(wh, iterations=1) & m
    Fa[wh] = np.median(F[fur], 0)
    save(k, Fa, m); info['pivots'][k] = pv
# body: fill the head area with the fur colour just below the chin so the neck never opens up
hb0 = int(np.where(head.any(1))[0].max())
chin = head & (yy > hb0 - 40) & (yy < hb0 - 8) & (np.abs(xx - mx) < 60)
furc = np.median(Hd[..., :3][chin], 0)          # the head's own fur just above the chin edge
B = A.copy(); neckband = head & body & (yy > my + 90) & (np.abs(xx - mx) < 190 * s); B[head] = furc
hb = int(np.where(head.any(1))[0].max())
bm = body & (yy >= hb - 40) | neckband     # nothing of the redrawn head survives in the body layer
core = nd.binary_opening(bm, iterations=5); bm &= nd.binary_dilation(core, iterations=6)
lab, n = nd.label(bm); bm = lab == (np.argmax(nd.sum(bm, lab, range(1, n + 1))) + 1)
save('body', B, bm)
save('tail', A, tail); info['pivots']['tail'] = CFG['tailPivot']
for k, m in legs.items(): save(k, A, m); info['pivots'][k] = CFG['legs'][k][1]
save('head', Hd[..., :3], head, .5)
info['head'] = {'eyes': [[mx - 138.6 * s, my], [mx + 138.6 * s, my]], 'scale': s, 'neckY': int(np.where(head.any(1))[0].max())}
json.dump(info, open(f'{out}/{pose}.json', 'w'), indent=1)
# debug sheet: layers coloured
dbg = np.full((1024, 1024, 3), 255, np.uint8); cols = {'body': (150,150,255), 'tail': (120,230,120), 'head': (255,150,150), 'armL': (255,200,0), 'armR': (255,120,0), 'legL': (0,200,200), 'legR': (0,140,200)}
for k, c in cols.items():
    if k in info['boxes']:
        im = np.asarray(Image.open(f'{out}/{pose}_{k}.png')); x0, y0, x1, y1 = info['boxes'][k]; m = im[..., 3] > 127
        sub = dbg[y0:y1, x0:x1]; sub[m] = (sub[m] * .3 + np.array(c) * .7).astype(np.uint8)
Image.fromarray(dbg).save(f'{out}/{pose}_debug.png'); print(pose, {k: v for k, v in info['boxes'].items()})
