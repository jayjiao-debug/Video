#!/usr/bin/env python3
"""Inline kit.js + hero.js + figs.js (+ the Cormorant font, + any __IMG:file.png__ as a data URI) into self-contained
1920x1080 HTML frames, then render PNGs with render_html.py.
usage: build.py [--out DIR] name [name ...]   (reads src/<name>.js, writes src/<name>.html and DIR/<name>.png; DIR defaults to src/../)"""
import base64, re, subprocess, sys
from pathlib import Path
SRC = Path(__file__).resolve().parent
FONT = Path('/home/claude/video/episodes/43-qingming/film/fonts/cormorant-garamond-latin-600-normal.woff2')
RENDER = '/home/claude/video/.claude/skills/production-crew/scripts/render_html.py'
args = sys.argv[1:]; out_dir = SRC.parent
if args and args[0] == '--out': out_dir = Path(args[1]); args = args[2:]
font = base64.b64encode(FONT.read_bytes()).decode()
kit = ''.join((SRC / f).read_text() + '\n' for f in ['kit.js', 'hero.js', 'figs.js'] if (SRC / f).exists())
img = lambda m: 'data:image/png;base64,' + base64.b64encode((SRC / m.group(1)).read_bytes()).decode()
out = []
for n in args:
    body = re.sub(r'__IMG:([\w.\-]+)__', img, (SRC / f'{n}.js').read_text())
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Cormorant Garamond';src:url(data:font/woff2;base64,{font}) format('woff2');font-weight:600}}
html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}}
#art{{position:absolute;inset:0}}
</style></head><body><script>{kit}</script><script>{body}</script></body></html>"""
    p = SRC / f'{n}.html'; p.write_text(html); out.append(str(p))
subprocess.run(['python3', RENDER, *out, '--out', str(out_dir)], check=True)
