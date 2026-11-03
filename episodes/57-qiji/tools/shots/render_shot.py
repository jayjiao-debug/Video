"""Render one animated shot page and measure how much it moves.
The page must define window.DUR (seconds) and window.render(t) (deterministic: the whole frame for time t).
usage: render_shot.py page.html outdir [fps=30]
writes outdir/f/0000.jpg..., outdir/sheet.jpg (1 frame per 0.25 s) and prints the motion score:
  motion = mean |frame-to-frame difference| on 480x270 grey (0-255 scale), and the stillest 0.5 s window.
Pass mark (calibrated 2026-11-03 on demo v2): shot mean >= 2.5 and every 0.5 s window >= 1.2
(v2's history shots, called 'PPT' by the owner, scored mean ~0.6)."""
import sys, os, numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
page, out = sys.argv[1], sys.argv[2]; fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
os.makedirs(f'{out}/f', exist_ok=True)
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
    pg.goto('file://' + os.path.abspath(page)); pg.wait_for_timeout(500); pg.evaluate('document.fonts.ready')
    dur = pg.evaluate('window.DUR'); n = int(round(dur * fps))
    for i in range(n):
        pg.evaluate(f'window.render({i / fps})'); pg.locator('#f').screenshot(path=f'{out}/f/{i:04d}.jpg', type='jpeg', quality=90)
    br.close()
g = [np.asarray(Image.open(f'{out}/f/{i:04d}.jpg').convert('L').resize((480, 270)), np.float32) for i in range(n)]
d = np.array([np.abs(g[i + 1] - g[i]).mean() for i in range(n - 1)]); w = max(1, fps // 2)
win = min(d[i:i + w].mean() for i in range(0, len(d) - w + 1)) if len(d) >= w else d.mean()
print(f'frames {n}  motion mean {d.mean():.2f}  stillest 0.5s {win:.2f}  ' + ('PASS' if d.mean() >= 2.5 and win >= 1.2 else 'FAIL (too static)'))
ts = list(range(0, n, max(1, fps // 4))); C = 5; W, H = 384, 216
sh = Image.new('RGB', (C * W, H * ((len(ts) + C - 1) // C)), 'white'); dr = ImageDraw.Draw(sh)
for j, i in enumerate(ts):
    sh.paste(Image.open(f'{out}/f/{i:04d}.jpg').resize((W, H)), ((j % C) * W, (j // C) * H)); dr.text(((j % C) * W + 5, (j // C) * H + 4), f'{i / fps:.2f}s', fill='yellow')
sh.save(f'{out}/sheet.jpg', quality=82)
