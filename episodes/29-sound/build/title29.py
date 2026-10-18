"""ep29 title as particles: sample the ink of 为什么好听？ on a grid → title29.json (1920×1080 coords).
The ink box is centred (not the advance box), so the trailing full-width ？ sits optically centred."""
import json, numpy as np
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc', 300, index=2)
im = Image.new('L', (1400, 500), 0); d = ImageDraw.Draw(im); d.text((40, 40), '上头', font=F, fill=255)
a = np.array(im) > 128
ys, xs = np.nonzero(a); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
STEP = 6; rng = np.random.default_rng(29); pts = []
for y in range(y0, y1 + 1, STEP):
    for x in range(x0, x1 + 1, STEP):
        if a[y, x]:
            jx, jy = rng.uniform(-1.5, 1.5, 2)
            pts.append([round(960 + (x - cx) + jx, 1), round(440 + (y - cy) + jy, 1)])
json.dump({'pts': pts, 'w': int(x1 - x0), 'h': int(y1 - y0)}, open('build/title29.json', 'w'))
print(len(pts), x1 - x0, y1 - y0)
