#!/usr/bin/env python3
"""ep45 proof scenes: inline the approved key-frame kit (style/v4/src, exactly as build.py does) + the proof modules into one
self-contained page with window.renderAt(t, scene). Also bundles proof/staff_walk.ts (the H1b staff on the film rig, with
walk + push states) for the drop. usage: build_proof.py [OUT_HTML]   (default /dev/shm/p45/proof.html)"""
import base64, re, subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'style' / 'v4' / 'src'
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else '/dev/shm/p45/proof.html'); OUT.parent.mkdir(parents=True, exist_ok=True)
FONT = Path('/home/claude/video/episodes/43-qingming/film/fonts/cormorant-garamond-latin-600-normal.woff2')
WK = Path('/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai')
JSEAL = 'data:image/png;base64,' + base64.b64encode(Path('/home/claude/video/docs/history-video-style/jseal.png').read_bytes()).decode()
ESB = HERE.parent / 'film' / 'node_modules' / '.bin' / 'esbuild'

kit = ''.join((SRC / f).read_text() + '\n' for f in ['kit.js', 'hero.js', 'figs.js', 'bros.js', 'v4.js', 'hero2.js', 'hero3.js', 'skin.js', 'staff45.js', 'v7.js'])
kit += 'window.H1B_STAFF = ' + (SRC / 'h1b_staff.json').read_text() + ';\n'
kit += 'window.LINES45 = ' + (HERE.parent / 'lines_v8s.json').read_text() + ';\n'
walk_js = OUT.parent / 'staff_walk.js'
subprocess.run([str(ESB), str(HERE / 'staff_walk.ts'), '--bundle', '--format=iife', '--platform=neutral', f'--outfile={walk_js}', '--log-level=warning'], check=True)
mods = ['p45_core.js', 'p45_ring.js', 'p45_hook.js', 'p45_london.js', 'p45_drop.js', 'p45_payoff.js']
proof = walk_js.read_text() + '\n' + ''.join((HERE / m).read_text() + '\n' for m in mods)

def wenkai_css(text):
    """inline only the LXGW WenKai Bold subsets that cover the characters used (stamps)"""
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

font = base64.b64encode(FONT.read_bytes()).decode()
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Cormorant Garamond';src:url(data:font/woff2;base64,{font}) format('woff2');font-weight:600}}
{wenkai_css(proof + (SRC / 'skin.js').read_text())}
html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}}
#art{{position:absolute;inset:0}}
</style></head><body><script>window.JSEAL='{JSEAL}';</script><script>{kit}</script><script>{proof}</script>
<script>window.READY = true;</script></body></html>"""
OUT.write_text(html)
print(OUT, len(html) // 1024, 'KB')
