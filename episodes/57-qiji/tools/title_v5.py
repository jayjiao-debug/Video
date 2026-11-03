"""ep57 title card v5 (owner 2026-11-03 12:29: "make the title card quicker with the title more fitting and handmade feeling").
One bar: a torn notepaper strip slaps onto the kraft scrapbook page and the title is written on it by hand, character by character
(brush-pen font, each glyph slightly tilted and off the line), the seven polaroids slam in on the 8th notes, and on the last beat a
red marker loop circles 「几个」. Layers are HTML snippets for demo_v5 (P/T layers); preview with `python3 title_v5.py`."""
import math

BRUSH = 'file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/brush/MaShanZheng-Regular.woff'
FACE = f"<style>@font-face{{font-family:'MaShan';src:url('{BRUSH}')}}</style>"
INK, RED = '#2A211B', '#C0392B'
L1, L2 = '新世界七大奇迹，', '你去过几个？'
S1, S2 = 118, 132                     # glyph sizes
X1, Y1 = 960 - len(L1) * S1 / 2 + 20, 58      # line 1 left/top (the comma's half-empty cell pulls the optical centre left)
X2, Y2 = 960 - len(L2) * S2 / 2 + 30, 186
JIT = [(-2.5, 3), (1.5, -2), (-1, 4), (2.5, 0), (-2, -3), (1, 2), (-1.5, -1), (2, 3), (-3, 1), (1.5, -3), (-1, 2), (2.5, -1), (-2, 0), (1, 3)]

def paper():
    """the torn notepaper strip + two washi tapes (one layer)"""
    import random
    R = random.Random(7); x0, x1, y0, y1 = 470, 1450, 40, 352
    top = ' '.join(f'L{x:.0f},{y0 + R.uniform(-5, 5):.0f}' for x in range(x0, x1 + 1, 18))
    bot = ' '.join(f'L{x:.0f},{y1 + R.uniform(-7, 7):.0f}' for x in range(x1, x0 - 1, -14))
    d = f'M{x0},{y0} {top} L{x1},{y1} {bot} Z'
    lines = ''.join(f'<line x1="{x0 + 10}" y1="{y}" x2="{x1 - 10}" y2="{y}" stroke="#A9C3D9" stroke-width="2" opacity=".55"/>' for y in range(96, 340, 44))
    tape = lambda cx, cy, rot: (f'<g transform="translate({cx},{cy}) rotate({rot})"><rect x="-80" y="-22" width="160" height="44" fill="#E9B44C" opacity=".72"/>'
                                f'<path d="M-80,-22 l-6,8 l6,7 l-6,8 l6,7 l-6,8 l6,6 M80,-22 l6,8 l-6,7 l6,8 l-6,7 l6,8 l-6,6" stroke="#E9B44C" stroke-width="3" fill="none" opacity=".72"/></g>')
    return (f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><defs><filter id="pb" x="-10%" y="-10%" width="120%" height="140%"><feGaussianBlur stdDeviation="8"/></filter></defs><g transform="rotate(-1.6 960 196)">'
            f'<path d="{d}" fill="#000" opacity=".22" transform="translate(6,12)" filter="url(#pb)"/><path d="{d}" fill="#FBF7EC"/>'
            f'<line x1="{x0 + 70}" y1="{y0}" x2="{x0 + 70}" y2="{y1}" stroke="#E7A8A0" stroke-width="2.5" opacity=".7"/>{lines}</g>'
            f'{tape(520, 52, -24)}{tape(1408, 60, 18)}</svg>')

def glyphs():
    """[(html, line)] one transparent layer per character, in writing order"""
    out = []
    for li, (txt, x0, y0, sz, col) in enumerate(((L1, X1, Y1, S1, INK), (L2, X2, Y2, S2, RED))):
        for i, ch in enumerate(txt):
            r, dy = JIT[(i + 5 * li) % len(JIT)]
            x = x0 + i * sz - (.38 * sz if ch == '，' else 0)          # the comma sits close, as handwriting would
            out.append((FACE + f'<div style="position:absolute;left:{x:.0f}px;top:{y0 + dy:.0f}px;width:{sz}px;text-align:center;'
                               f'font-family:MaShan;font-size:{sz}px;line-height:1;color:{col};transform:rotate({r}deg)">{ch}</div>', li))
    return out

def loop(frac):
    """the red marker loop round 「几个」, drawn up to `frac` (0..1)"""
    cx, cy = X2 + 3.5 * S2 + 34, Y2 + S2 * .55; rx, ry = S2 * 1.12, S2 * .6
    pts = []
    n = 60
    for i in range(int(n * frac) + 1):
        a = -2.6 + 2 * math.pi * 1.12 * i / n; wob = 1 + .05 * math.sin(3 * a)
        pts.append((cx + rx * wob * math.cos(a), cy + ry * wob * math.sin(a) + 6 * i / n))
    if len(pts) < 2: return ''
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return (f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><path d="{d}" fill="none" stroke="{RED}" stroke-width="9" '
            f'stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg>')

def doodle():
    """a pencil plane and its dashed route under the title, pointing at the photos"""
    return (f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><path d="M1480,250 C1580,250 1640,300 1660,350" fill="none" stroke="{INK}" stroke-width="4" '
            f'stroke-dasharray="12 10" stroke-linecap="round" opacity=".75"/><g transform="translate(1474,248) rotate(180)"><path d="M0,0 L34,-12 L26,0 L34,12 Z" fill="#FBF7EC" stroke="{INK}" '
            f'stroke-width="3.5" stroke-linejoin="round"/><path d="M26,0 L10,0" stroke="{INK}" stroke-width="3"/></g></svg>')

if __name__ == '__main__':
    import sys, os
    sys.argv = ['x']
    import kf7 as K
    from playwright.sync_api import sync_playwright
    S = K.S
    kraft = ('<rect width="1920" height="1080" fill="#E9DCC3"/>' + ''.join(f'<circle cx="{(i * 733) % 1920}" cy="{(i * 389) % 1080}" r="{2 + i % 4}" fill="#D8C8AA" opacity=".6"/>' for i in range(220)))
    STOPS = [('chichen', '奇琴伊察'), ('machu2', '马丘比丘'), ('christ', '基督像'), ('colosseum', '斗兽场'), ('petra2', '佩特拉'), ('taj', '泰姬陵'), ('greatwall2', '长城')]
    POS = [(250, 390, -8), (640, 360, 5), (1030, 390, -4), (1420, 360, 7), (440, 700, 6), (830, 720, -6), (1220, 700, 4)]
    pol = ''.join(K.polaroid_html(K.drawn(k, fig=False), x, y, 280, rot=r, caption=nm) for (k, nm), (x, y, r) in zip(STOPS, POS))
    html = K.HEAD + K.svgw(kraft) + pol + paper() + ''.join(h for h, _ in glyphs()) + loop(1.0) + '</div></body></html>'
    fn = f'{S}/farm57/title_v5.html'; open(fn, 'w').write(html)
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080}); pg.goto('file://' + fn)
        pg.wait_for_timeout(500); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(200)
        pg.screenshot(path=f'{S}/farm57/title_v5.jpg', type='jpeg', quality=88); br.close()
    print('ok')
