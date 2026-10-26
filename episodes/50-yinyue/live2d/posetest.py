import json, math, sys; from PIL import Image
def layer(pose, k): return Image.open(f'{pose}_{k}.png')
def place(canvas, pose, k, info, ang=0, dx=0, dy=0, pivot=None):
    im = layer(pose, k); x0, y0, x1, y1 = info['boxes'][k]
    full = Image.new('RGBA', (1024, 1024)); full.paste(im, (x0, y0))
    if ang or dx or dy:
        px, py = pivot or info['pivots'][k]
        full = full.rotate(ang, resample=Image.BICUBIC, center=(px, py), translate=(dx, dy))
    canvas.alpha_composite(full)
def build(pose, P):
    info = json.load(open(f'{pose}.json')); c = Image.new('RGBA', (1024, 1024), (236, 228, 214, 255))
    order = ['tail', 'legL', 'legR', 'body', 'armL', 'armR', 'head']
    for k in order:
        if k in info['boxes']: place(c, pose, k, info, *P.get(k, (0, 0, 0)), pivot=(512, info['head']['neckY']) if k == 'head' else None)
    return c.convert('RGB')
rest = {}
moved = {'armL': (-35, 0, 0), 'armR': (40, 0, 0), 'tail': (14, 0, 0), 'head': (6, 0, 0), 'legL': (0, 0, -18), 'legR': (6, 0, 0)}
up = {'armL': (35, 0, 0), 'armR': (-30, 0, 0), 'tail': (-12, 0, 0), 'head': (-5, 0, 0), 'legR': (0, 0, -18)}
row = [build(p, P) for p in ('sit', 'stand') for P in (rest, moved, up)]
out = Image.new('RGB', (6 * 512, 512))
for i, im in enumerate(row): out.paste(im.resize((512, 512)), (i * 512, 0))
out.save('posetest.jpg', quality=88)
