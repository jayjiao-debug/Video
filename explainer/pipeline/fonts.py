"""Subset the CJK/Latin fonts down to the characters an episode actually uses.

Noto Serif SC is ~25 MB; an episode needs a few hundred glyphs, so each render
loads a ~100 KB woff2 instead (fast, offline, deterministic). Characters are
collected from the episode script plus every .tsx file the episode can render.
"""

import glob
import hashlib
import os
import re

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "models", "fonts")
FONTS = {
    "serif": "NotoSerifSC[wght].ttf",
    "sans": "NotoSansSC[wght].ttf",
    "latin": "CormorantGaramond[wght].ttf",
    "latin-italic": "CormorantGaramond-Italic[wght].ttf",
}
BASE = ("".join(chr(c) for c in range(0x20, 0x7F))
        + "，。、：；！？“”‘’「」『』《》（）【】—…·①②③④⑤⑥⑦⑧⑨⑩％×÷→←↑↓·°")
CJK_IN_CODE = re.compile(r"[ -⯿　-鿿＀-￯①-⓿]")


def episode_chars(ep_dir, extra_text=""):
    chars = set(BASE) | set(extra_text)
    sources = glob.glob(os.path.join(ep_dir, "*.yaml"))
    sources += glob.glob(os.path.join(ep_dir, "**", "*.tsx"), recursive=True)
    sources += glob.glob(os.path.join(ROOT, "src", "**", "*.tsx"), recursive=True)
    for path in sources:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        chars |= set(text) if path.endswith(".yaml") else set(CJK_IN_CODE.findall(text))
    return "".join(sorted(c for c in chars if c.isprintable()))


def build(ep_dir, out_dir):
    text = episode_chars(ep_dir)
    key = hashlib.sha1(text.encode()).hexdigest()[:12]
    stamp = os.path.join(out_dir, f".subset-{key}")
    if os.path.exists(stamp):
        return len(text)
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(os.path.join(out_dir, ".subset-*")):
        os.remove(old)
    for name, file in FONTS.items():
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(os.path.join(SRC, file), opts)
        sub = subset.Subsetter(opts)
        sub.populate(text=text)
        sub.subset(font)
        subset.save_font(font, os.path.join(out_dir, f"{name}.woff2"), opts)
    open(stamp, "w").close()
    return len(text)
