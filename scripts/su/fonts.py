#!/usr/bin/env python3
"""Fetch the Su film's two display faces (ZCOOL KuaiLe, Zhi Mang Xing: both SIL Open Font License) as small subsets
holding only the characters the skin draws: the STRINGS in src/videos/su/hud/fonts.ts plus its punctuation. Writes
public/su/fonts/kuaile.woff2 and xing.woff2 (tens of KB each). Run it again after adding a string there."""
import json, os, re, subprocess, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, "src/videos/su/hud/fonts.ts"), encoding="utf-8").read()
block = re.search(r"const STRINGS = \[(.*?)\];", src, re.S).group(1)
strings = re.findall(r'"([^"]*)"', block)
extra = re.search(r'\.replace\(/\\s/g, ""\) \+ "([^"]*)"', src).group(1)
text = "".join(dict.fromkeys(re.sub(r"\s", "", "".join(strings)) + extra))
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
out = os.path.join(ROOT, "public/su/fonts"); os.makedirs(out, exist_ok=True)
for fam, name in (("ZCOOL KuaiLe", "kuaile"), ("Zhi Mang Xing", "xing")):
    url = "https://fonts.googleapis.com/css2?" + urllib.parse.urlencode({"family": fam, "text": text, "display": "block"})
    css = subprocess.check_output(["curl", "-sS", "-A", UA, url]).decode()
    srcs = re.findall(r"url\((https://[^)]+)\)", css)
    assert len(srcs) == 1, f"{fam}: expected one subset file, got {len(srcs)}"
    path = os.path.join(out, name + ".woff2")
    subprocess.check_call(["curl", "-sS", "-o", path, srcs[0]])
    print(fam, "->", path, os.path.getsize(path), "bytes,", len(text), "characters")
json.dump({"text": text}, open(os.path.join(out, "subset.json"), "w"), ensure_ascii=False)
