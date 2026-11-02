import sys
from playwright.sync_api import sync_playwright
svgf, out = sys.argv[1], sys.argv[2]
svg = open(svgf).read().replace('width="1900" height="1604"', 'width="980" height="827"')
wk = '/home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai'
import glob; fs = sorted(glob.glob(wk + '/*'))
ff = f"@font-face{{font-family:WK;src:url('file://{fs[0]}')}}" if fs else ''
html = f'''<html><head><style>{ff} body{{margin:0}} .sub{{position:absolute;left:150px;top:96px;font:700 65px 'Noto Sans CJK SC';color:#FFF6E6;line-height:1.35;text-shadow:0 2px 18px rgba(0,0,0,.55)}}
.u{{border-bottom:5px solid #7FB79C;padding-bottom:2px}} .stamp{{position:absolute;right:150px;top:70px;text-align:right;color:#F3E6CC;font-family:WK,'Noto Serif CJK SC'}}
.cnt{{position:absolute;left:150px;bottom:62px;color:#F3E6CC;font:600 34px 'Noto Sans CJK SC';opacity:.85}}</style></head><body>
<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(ellipse at 56% 60%,#4a3826 0%,#22180f 45%,#0d0a07 80%)">
<div style="position:absolute;left:640px;top:925px;width:760px;height:56px;border-radius:50%;background:radial-gradient(#000b,#0000 70%)"></div>
<div style="position:absolute;left:520px;top:140px">{svg}</div>
<div class="sub">这匹马，<br>你肯定<span class="u">见过</span>。</div>
<div class="stamp"><div style="font-size:40px">今天 · 甘肃省博物馆</div><div style="width:330px;height:2px;background:#C9A27A;margin:10px 0 10px auto"></div><div style="font-size:32px;opacity:.9">中国旅游标志 · 1983年起</div></div>
<div class="cnt">今天</div></div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080}); pg.set_content(html); pg.wait_for_timeout(500)
    pg.locator('#f').screenshot(path=out); b.close()
