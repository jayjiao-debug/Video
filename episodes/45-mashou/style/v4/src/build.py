#!/usr/bin/env python3
"""ep45 v4 key frames: inline kit.js + hero.js + figs.js + bros.js + v4.js (+ Cormorant) into self-contained 1920x1080 HTML,
then render PNGs with render_html.py into style/v4/.  usage: build.py name [name ...]   (reads src/<name>.js)"""
import base64, subprocess, sys
from pathlib import Path
SRC = Path(__file__).resolve().parent
FONT = Path('/home/claude/video/episodes/43-qingming/film/fonts/cormorant-garamond-latin-600-normal.woff2')
RENDER = '/home/claude/video/.claude/skills/production-crew/scripts/render_html.py'
font = base64.b64encode(FONT.read_bytes()).decode()
kit = ''.join((SRC / f).read_text() + '\n' for f in ['kit.js', 'hero.js', 'figs.js', 'bros.js', 'v4.js'] if (SRC / f).exists())
out = []
for n in sys.argv[1:]:
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Cormorant Garamond';src:url(data:font/woff2;base64,{font}) format('woff2');font-weight:600}}
html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}}
#art{{position:absolute;inset:0}}
</style></head><body><script>{kit}</script><script>{(SRC / f'{n}.js').read_text()}</script></body></html>"""
    p = SRC / f'{n}.html'; p.write_text(html); out.append(str(p))
subprocess.run(['python3', RENDER, *out, '--out', str(SRC.parent)], check=True)
