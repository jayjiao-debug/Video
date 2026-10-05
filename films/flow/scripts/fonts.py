#!/usr/bin/env python3
"""Subset the CJK/Latin fonts to the characters this film uses -> public/fonts/*.woff2.

    python3 scripts/fonts.py

Characters are collected from every .ts/.tsx/.json file under src/. Source fonts come from
explainer/models/fonts (fetched by explainer/setup.sh). Run again whenever lines change.
"""
import glob, os, re
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '..', '..', 'explainer', 'models', 'fonts')
OUT = os.path.join(ROOT, 'public', 'fonts')
FONTS = {'sans': 'NotoSansSC[wght].ttf', 'serif': 'NotoSerifSC[wght].ttf', 'latin': 'CormorantGaramond[wght].ttf', 'latin-italic': 'CormorantGaramond-Italic[wght].ttf'}
BASE = ''.join(chr(c) for c in range(0x20, 0x7F)) + '，。、：；！？“”‘’「」『』《》（）【】—…·％×÷→←↑↓°≈√∞'
chars = set(BASE)
for p in glob.glob(os.path.join(ROOT, 'src', '**', '*.*'), recursive=True):
    if p.endswith(('.ts', '.tsx', '.json')):
        chars |= set(re.findall(r'[ -⯿　-鿿＀-￯]', open(p, encoding='utf-8').read()))
os.makedirs(OUT, exist_ok=True)
text = ''.join(sorted(chars))
for key, name in FONTS.items():
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']
    f = subset.load_font(os.path.join(SRC, name), opts)
    s = subset.Subsetter(opts); s.populate(text=text); s.subset(f)
    subset.save_font(f, os.path.join(OUT, f'{key}.woff2'), opts)
print(len(text), 'glyphs ->', OUT)
