import sys, numpy as np
from PIL import Image
sys.path.insert(0, '../case01')
from case_art import mode_down
def cut(name):
    src = Image.open(f'art_src/{name}_sheet.webp').convert('RGB')
    out = []
    for k in range(4):
        x, y = (k % 2) * 512, (k // 2) * 512
        c = src.crop((x, y, x + 512, y + 512))
        im = mode_down(c, 4, 40).convert('RGBA')
        a = np.array(im); bg = a[1, 1, :3].astype(int)
        h, w = a.shape[:2]; seen = np.zeros((h, w), bool)
        st = [(i, j) for i in range(w) for j in (0, h - 1)] + [(i, j) for j in range(h) for i in (0, w - 1)]
        while st:
            i, j = st.pop()
            if not (0 <= i < w and 0 <= j < h) or seen[j, i]: continue
            if np.abs(a[j, i, :3].astype(int) - bg).sum() > 36: continue
            seen[j, i] = True; st += [(i+1, j), (i-1, j), (i, j+1), (i, j-1)]
        a[seen] = 0
        for _ in range(2):   # light fringe left by anti-aliasing against the backdrop
            tr = a[..., 3] == 0
            near = np.zeros_like(tr)
            near[1:] |= tr[:-1]; near[:-1] |= tr[1:]; near[:, 1:] |= tr[:, :-1]; near[:, :-1] |= tr[:, 1:]
            fr = near & ~tr & (np.abs(a[..., :3].astype(int) - bg).sum(2) < 90)
            a[fr] = 0
        out.append(Image.fromarray(a, 'RGBA'))
    return out
if __name__ == '__main__':
    for n in sys.argv[1:]:
        cs = cut(n)
        sheet = Image.new('RGBA', (128 * 4 + 12, 128), (60, 60, 70, 255))
        for k, c in enumerate(cs):
            c.save(f'art_src/{n}_c{k}.png'); sheet.alpha_composite(c, (k * 132, 0))
        sheet.resize((sheet.width * 3, 384), Image.NEAREST).save(f'art_src/{n}_cells.png')
