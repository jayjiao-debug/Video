"""ep57 title card v6 (owner 2026-11-03 12:35: "nah doesnt work, maybe sticker vibes? Photos can be bigger and overlap but must
still be recognisable"). One bar on the kraft page: the seven places slap down as big die-cut photo stickers (white border, rounded
corners, drop shadow, a name tag each), overlapping in two rows, then the title lands on top as two fat lettering stickers.
Each sticker is one transparent layer for demo_v6; preview with `python3 title_v6.py`."""
INK = '#2A211B'
# (key, name, centre x, centre y, rotation, background-position of the crop)
PH = [('chichen', '奇琴伊察', 300, 250, -7, '40% 55%'), ('machu2', '马丘比丘', 760, 215, 5, '45% 40%'), ('christ', '基督像', 1180, 240, -4, '50% 30%'),
      ('colosseum', '斗兽场', 1620, 230, 6, '45% 60%'), ('petra2', '佩特拉', 470, 820, 6, '50% 35%'), ('taj', '泰姬陵', 960, 850, -5, '50% 40%'),
      ('greatwall2', '长城', 1450, 820, 4, '45% 50%')]
PW, PHH, BD = 500, 330, 16

def photo(src, name, cx, cy, rot, pos):
    """a die-cut photo sticker: the picture, a white border, rounded corners, a shadow and a name tag"""
    x, y = cx - PW / 2 - BD, cy - PHH / 2 - BD
    return (f'<div style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;width:{PW}px;height:{PHH}px;padding:{BD}px;background:#FFFFFF;border-radius:30px;'
            f'box-shadow:0 12px 26px rgba(40,25,10,.38);transform:rotate({rot}deg)">'
            f'<div style="width:{PW}px;height:{PHH}px;border-radius:18px;background:url(\'file://{src}\') {pos}/cover no-repeat"></div>'
            f'<div style="position:absolute;left:{BD + 14}px;bottom:{BD + 14}px;padding:4px 18px 6px;border-radius:999px;background:#FFFFFF;border:4px solid {INK};'
            f'font-family:\'Noto Sans CJK SC\';font-weight:900;font-size:30px;color:{INK}">{name}</div></div>')

def lettering(text, cx, cy, size, fill, rot, sub=None):
    """fat lettering as one die-cut sticker: coloured letters, ink outline, a thick white border and a shadow (SVG strokes, painted under)"""
    st = (f'font-family="Noto Sans CJK SC" font-weight="900" font-size="{size}" text-anchor="middle" dominant-baseline="central" '
          f'stroke-linejoin="round" paint-order="stroke"')
    return (f'<svg width="1920" height="1080" style="position:absolute;left:0;top:0;overflow:visible"><defs><filter id="ls" x="-20%" y="-40%" width="140%" height="180%">'
            f'<feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#28190A" flood-opacity=".42"/></filter></defs>'
            f'<g transform="translate({cx},{cy}) rotate({rot})"><g filter="url(#ls)"><text {st} x="0" y="0" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="{size * .36:.0f}">{text}</text></g>'
            f'<text {st} x="0" y="0" fill="{fill}" stroke="{INK}" stroke-width="{size * .11:.0f}">{text}</text>'
            f'<text {st} x="-3" y="-4" fill="none" stroke="#FFFFFF" stroke-width="{size * .025:.1f}" opacity=".55">{text}</text></g></svg>')

def title():
    return [lettering('新世界七大奇迹', 960, 470, 150, '#F2C66E', -3), lettering('你去过几个？', 1010, 640, 132, '#FF7A59', 2.5)]

if __name__ == '__main__':
    import sys
    sys.argv = ['x']
    import kf7 as K
    from playwright.sync_api import sync_playwright
    S = K.S
    kraft = ('<rect width="1920" height="1080" fill="#E9DCC3"/>' + ''.join(f'<circle cx="{(i * 733) % 1920}" cy="{(i * 389) % 1080}" r="{2 + i % 4}" fill="#D8C8AA" opacity=".6"/>' for i in range(220)))
    body = K.svgw(kraft) + ''.join(photo(K.drawn(k, fig=False), nm, x, y, r, pos) for k, nm, x, y, r, pos in PH) + ''.join(title())
    fn = f'{S}/farm57/title_v6.html'; open(fn, 'w').write(K.HEAD + body + '</div></body></html>')
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080}); pg.goto('file://' + fn)
        pg.wait_for_timeout(500); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(200)
        pg.screenshot(path=f'{S}/farm57/title_v6.jpg', type='jpeg', quality=88); br.close()
    print('ok')
