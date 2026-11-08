"""Look B: painted ink plates (image model) under code-drawn furniture:
paper grain, calligraphy, seals, snow, subtitles. Usage: plate_looks.py <platedir> <outdir>"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ink import *
from looks import subtitle
from PIL import Image


def load_plate(path):
    im = Image.open(path).convert('RGB').resize((W, H), Image.LANCZOS)
    img = np.asarray(im, np.float32) / 255
    pp = paper(seed=7)
    return np.clip(img * (pp / pp.mean(axis=(0, 1))) ** 0.6, 0, 1)   # same paper grain as look A


def main(pd, out):
    os.makedirs(out, exist_ok=True)
    h, w = H, W
    img = load_plate(os.path.join(pd, 'p_wall_1107.webp'))
    I = text_mask(h, w, '八十万禁军枪棒教头', 'xing', 78, (985, 120), True, spacing=1.0)
    img = apply_ink(img, calligraphy(I, 0.9, seed=51, bleed=1.0, rough=1.6))
    I2 = text_mask(h, w, '豹头环眼\n燕颔虎须', 'kai', 46, (872, 140), True, spacing=1.08, colgap=1.5)
    img = apply_ink(img, calligraphy(I2, 0.8, seed=52))
    img = apply_ink(img, seal(h, w, (985, 880), 80, '豹子头', 'kai', True, seed=53), CINNABAR)
    img = subtitle(img, '八十万禁军枪棒教头——林冲。')
    save(img, os.path.join(out, 'B_portrait.png'))

    img = load_plate(os.path.join(pd, 'p_fist_3301.webp'))
    img = subtitle(img, '书里只写了五个字：先自手软了。', y=1500)
    save(img, os.path.join(out, 'B_fist.png'))

    img = load_plate(os.path.join(pd, 'p_snow_2210.webp'))
    img = apply_light(img, snowflakes(h, w, 700, 58, 0.8, 2.2, blur=0.6) * 0.7)
    img = apply_light(img, snowflakes(h, w, 160, 59, 2.0, 4.5, blur=1.0) * 0.8)
    img = subtitle(img, '那一夜大雪，草屋被雪压塌了。')
    save(img, os.path.join(out, 'B_snow.png'))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
