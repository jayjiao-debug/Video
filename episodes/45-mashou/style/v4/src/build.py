#!/usr/bin/env python3
"""ep45 v4 key frames: inline kit.js + hero.js + figs.js + bros.js + v4.js (+ Cormorant) into self-contained 1920x1080 HTML,
then render PNGs with render_html.py into style/v4/.  usage: build.py name [name ...]   (reads src/<name>.js)"""
import base64, subprocess, sys
from pathlib import Path
SRC = Path(__file__).resolve().parent
FONT = Path('/home/claude/video/episodes/43-qingming/film/fonts/cormorant-garamond-latin-600-normal.woff2')
RENDER = '/home/claude/video/.claude/skills/production-crew/scripts/render_html.py'
font = base64.b64encode(FONT.read_bytes()).decode()
kit = ''.join((SRC / f).read_text() + '\n' for f in ['kit.js', 'hero.js', 'figs.js', 'bros.js', 'v4.js', 'hero2.js', 'hero3.js', 'skin.js', 'staff45.js'] if (SRC / f).exists())
kit += 'window.H1B_STAFF = ' + (SRC / 'h1b_staff.json').read_text() + ';\n'
import re
WK = Path('/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai')
JSEAL = 'data:image/png;base64,' + base64.b64encode(Path('/home/claude/video/docs/history-video-style/jseal.png').read_bytes()).decode()
def wenkai_css(text):
    """inline only the LXGW WenKai Bold subsets that cover the characters used by this frame"""
    cps = {ord(c) for c in text if ord(c) > 127} | set(range(32, 127))
    css = []
    for blk in re.findall(r'@font-face\s*\{(.*?)\}', (WK / 'wenkai-bold.css').read_text(), re.S):
        src = re.search(r"url\('\./(files/[^']+)'\)", blk).group(1); rng = re.search(r'unicode-range:\s*([^;}]+)', blk).group(1)
        hit = False
        for part in rng.split(','):
            a, _, b = part.strip()[2:].partition('-'); a = int(a, 16); b = int(b, 16) if b else a
            if any(a <= c <= b for c in cps): hit = True; break
        if hit: css.append("@font-face{font-family:'LXGW WenKai';font-weight:700;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (base64.b64encode((WK / src).read_bytes()).decode(), rng.strip()))
    return '\n'.join(css)
out = []
for n in sys.argv[1:]:
    pre = ''
    if n.endswith('@NOHERO'): n = n[:-7]; pre = 'window.NOHERO = true;'
    if n.endswith('@MASK'): n = n[:-5]; pre = 'window.HERO_MASK = true;'   # r5: hero regions in flat colours (neck green, mane red, head blue)
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Cormorant Garamond';src:url(data:font/woff2;base64,{font}) format('woff2');font-weight:600}}
{wenkai_css((SRC / f'{n}.js').read_text() + (SRC / 'skin.js').read_text())}
html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}}
#art{{position:absolute;inset:0}}
</style></head><body><script>window.JSEAL='{JSEAL}';{pre}</script><script>{kit}</script><script>{(SRC / f'{n}.js').read_text()}</script></body></html>"""
    p = SRC / (f'{n}_mask.html' if 'MASK' in pre else f'{n}_nohero.html' if pre else f'{n}.html'); p.write_text(html); out.append(str(p))
subprocess.run(['python3', RENDER, *out, '--out', str(SRC.parent)], check=True)
