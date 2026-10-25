#!/usr/bin/env python3
"""r5 一体 check at phone size. Needs <name>.png and <name>_mask.png (build.py name name@MASK; in the mask the bare neck is green,
the mane red, head + ears blue). Both are taken to 400 px wide; the regions are eroded 1 px (at 400) so the copper rim and the
anti-aliased edges don't count; where a hero is small (H1b, A4, D6a) and the eroded neck is empty, pixels ≥ 75 % covered are
used instead. A full-size (1920) number, eroded 3 px, is printed alongside. Reports the mean luma of the mane, of the bare neck it sits on, and of the face (head minus ears).
Also the 90th percentile of each (the lit parts: a lighter 'hairpiece' shows here first). Target (owner r4 note): |mane − neck| ≤ 10.   usage: mane400.py name [name ...]"""
import sys, numpy as np
from PIL import Image, ImageFilter
D = '/home/claude/video/episodes/45-mashou/style/v4/'
for n in sys.argv[1:]:
    A = Image.open(f'{D}{n}.png').convert('RGB'); M = np.asarray(Image.open(f'{D}{n}_mask.png').convert('RGB')).astype(int)
    a = np.asarray(A.resize((400, 225), Image.LANCZOS).convert('L'), float)
    af = np.asarray(A.convert('L'), float)
    def region(cond):
        m = Image.fromarray((cond * 255).astype(np.uint8)).resize((400, 225), Image.BOX)
        r = np.asarray(m.filter(ImageFilter.MinFilter(3))) > 250
        return r if r.sum() >= 12 else np.asarray(m) > 190
    def full(cond): return np.asarray(Image.fromarray((cond * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))) > 250
    R, G, B = M[..., 0], M[..., 1], M[..., 2]
    mane = region((R > 200) & (G < 60) & (B < 60)); neck = region((G > 200) & (R < 60) & (B < 60)); head = region((B > 200) & (R < 60) & (G < 60))
    mm, nm, hm = a[mane].mean(), a[neck].mean(), a[head].mean()
    cm, cn = (R > 200) & (G < 60) & (B < 60), (G > 200) & (R < 60) & (B < 60); fm, fn = af[full(cm)].mean(), af[full(cn)].mean()
    print(f'{n}: mane {mm:.1f} (n={mane.sum()}), neck {nm:.1f} (n={neck.sum()}), face {hm:.1f} | mane − neck {mm - nm:+.1f} (target |Δ| ≤ 10) {"PASS" if abs(mm - nm) <= 10 else "FAIL"} | p90 mane {np.percentile(a[mane], 90):.0f} vs neck {np.percentile(a[neck], 90):.0f} | at 1920: mane {fm:.1f}, neck {fn:.1f}, Δ {fm - fn:+.1f}')
