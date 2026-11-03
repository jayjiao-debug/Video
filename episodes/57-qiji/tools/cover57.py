"""ep57 Douyin covers (owner 13:43): 横版 1440x1080 and 竖版 1080x1440 in the film's own sticker look (the title card and the
album): the seven real photos from the film (with 「你」 in them) as die-cut photo stickers on the kraft page, a fat lettering hook
(「绕地球一圈」 / 「打卡7大奇迹」) and a small 「你去过几个？」 tag. Renders are never committed. `python3 cover57.py`"""
import sys, os
sys.argv = ['x']
import kf7 as K
from playwright.sync_api import sync_playwright
S = K.S; D4 = f'{S}/sb57/demo4'; OUT = f'{S}/farm57'
INK = '#2A211B'
PH = {'chichen': (f'{D4}/card_chichen.jpg', '奇琴伊察'), 'machu2': (f'{D4}/card_machu2.jpg', '马丘比丘'), 'christ': (f'{D4}/card_christ.jpg', '基督像'),
      'colosseum': (f'{D4}/card_colosseum.jpg', '斗兽场'), 'petra2': (f'{D4}/card_petra2.jpg', '佩特拉'), 'taj': (f'{D4}/card_taj.jpg', '泰姬陵'),
      'greatwall2': (f'{S}/sb57/comp_greatwall2.jpg', '长城')}

def photo(k, cx, cy, w, rot, pos='50% 50%', tag=34):
    src, name = PH[k]; h = w * 2 / 3; bd = w * .035
    return (f'<div style="position:absolute;left:{cx - w / 2 - bd:.0f}px;top:{cy - h / 2 - bd:.0f}px;width:{w:.0f}px;height:{h:.0f}px;padding:{bd:.0f}px;background:#FFF;'
            f'border-radius:{w * .06:.0f}px;box-shadow:0 14px 30px rgba(40,25,10,.4);transform:rotate({rot}deg)">'
            f'<div style="width:{w:.0f}px;height:{h:.0f}px;border-radius:{w * .035:.0f}px;background:url(\'file://{src}\') {pos}/cover no-repeat"></div>'
            f'<div style="position:absolute;left:{bd + 12:.0f}px;bottom:{bd + 12:.0f}px;padding:3px 16px 5px;border-radius:999px;background:#FFF;border:4px solid {INK};'
            f'font-family:\'Noto Sans CJK SC\';font-weight:900;font-size:{tag}px;color:{INK}">{name}</div></div>')

def letters(text, cx, cy, size, fill, rot):
    st = f'font-family="Noto Sans CJK SC" font-weight="900" font-size="{size}" text-anchor="middle" dominant-baseline="central" stroke-linejoin="round" paint-order="stroke"'
    return (f'<svg width="2000" height="2000" style="position:absolute;left:0;top:0;overflow:visible"><defs><filter id="ls{cy}" x="-20%" y="-40%" width="140%" height="180%">'
            f'<feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#28190A" flood-opacity=".45"/></filter></defs><g transform="translate({cx},{cy}) rotate({rot})">'
            f'<g filter="url(#ls{cy})"><text {st} fill="#FFF" stroke="#FFF" stroke-width="{size * .36:.0f}">{text}</text></g>'
            f'<text {st} fill="{fill}" stroke="{INK}" stroke-width="{size * .11:.0f}">{text}</text></g></svg>')

def pill(text, cx, cy, size, rot):
    return (f'<div style="position:absolute;left:{cx}px;top:{cy}px;transform:translate(-50%,-50%) rotate({rot}deg);padding:{size * .22:.0f}px {size * .6:.0f}px;border-radius:999px;'
            f'background:{INK};border:{size * .12:.0f}px solid #FFF;box-shadow:0 10px 24px rgba(40,25,10,.45);font-family:\'Noto Sans CJK SC\';font-weight:900;'
            f'font-size:{size}px;color:#F2C66E;white-space:nowrap">{text}</div>')

def kraft(w, h):
    dots = ''.join(f'<circle cx="{(i * 733) % w}" cy="{(i * 389) % h}" r="{2 + i % 4}" fill="#D8C8AA" opacity=".6"/>' for i in range(260))
    return f'<svg width="{w}" height="{h}" style="position:absolute;left:0;top:0"><rect width="{w}" height="{h}" fill="#E9DCC3"/>{dots}</svg>'

def wide():
    W, H = 1440, 1080
    body = kraft(W, H)
    for k, x, y, w, r in [('chichen', 230, 190, 430, -7), ('machu2', 720, 160, 440, 4), ('christ', 1210, 195, 430, -5),
                          ('petra2', 200, 900, 420, 6), ('taj', 720, 915, 430, -4), ('greatwall2', 1230, 890, 430, 5), ('colosseum', 1250, 545, 330, 8)]:
        body += photo(k, x, y, w, r, tag=30)
    body += letters('绕地球一圈', 610, 470, 190, '#F2C66E', -3) + letters('打卡7大奇迹', 640, 680, 172, '#FF7A59', 2)
    body += pill('你去过几个？', 1150, 760, 52, -6)
    return W, H, body

def tall():
    W, H = 1080, 1440
    body = kraft(W, H)
    for k, x, y, w, r in [('chichen', 250, 175, 440, -7), ('machu2', 800, 160, 440, 5), ('christ', 230, 470, 400, 5), ('colosseum', 830, 470, 420, -6),
                          ('petra2', 240, 1170, 400, -5), ('taj', 820, 1180, 420, 6), ('greatwall2', 540, 1310, 380, -2)]:
        body += photo(k, x, y, w, r, tag=30)
    body += letters('绕地球一圈', 540, 700, 168, '#F2C66E', -3) + letters('打卡7大奇迹', 540, 890, 150, '#FF7A59', 2)
    body += pill('你去过几个？', 700, 1030, 50, -5)
    return W, H, body

if __name__ == '__main__':
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        for name, fn in (('横版_4x3', wide), ('竖版_3x4', tall)):
            W, H, body = fn(); html = K.HEAD.replace('width:1920px;height:1080px', f'width:{W}px;height:{H}px') + body + '</div></body></html>'
            p = f'{OUT}/cover_{name}.html'; open(p, 'w').write(html)
            pg = br.new_page(viewport={'width': W, 'height': H}); pg.goto('file://' + p); pg.wait_for_timeout(600); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(200)
            pg.screenshot(path=f'{OUT}/新世界七大奇迹_封面_{name}.png', clip={'x': 0, 'y': 0, 'width': W, 'height': H}); pg.close()
        br.close()
    print('ok')
