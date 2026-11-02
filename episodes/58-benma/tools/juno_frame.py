"""ep58 Juno-style still: museum set + the horse (from horse_juno.json) + layout-D subtitle, stamp, counter, J seal.
usage: juno_frame.py horse_juno.json out.png mode(sil|col) 'row1|row2' [hl=word]"""
import sys, json, base64, glob
from playwright.sync_api import sync_playwright
P = json.load(open(sys.argv[1])); out, mode = sys.argv[2], sys.argv[3]; rows = sys.argv[4].split('|')
hl = next((a[3:] for a in sys.argv[5:] if a.startswith('hl=')), '')
W, H = P['W'], P['H']; HW = 860; HH = HW * H / W; HX, HY = 760, 990 - HH
seal = base64.b64encode(open('/home/claude/video/docs/history-video-style/jseal.png', 'rb').read()).decode()
wk = sorted(glob.glob('/home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/*'))
ff = f"@font-face{{font-family:WK;src:url('file://{wk[0]}')}}" if wk else ''
sub = '<br>'.join(r.replace(hl, f'<span class="u">{hl}</span>') if hl else r for r in rows)
sil = mode == 'sil'
horse = (f'<path d="{P["sil"]}" fill="#120E0B"/>' if sil else
 f'''<path d="{P["sil"]}" fill="#7CC7A2" opacity=".55" filter="url(#halo)"/>
 <path d="{P["sil"]}" fill="url(#body)"/>
 <path d="{P["shadow"]}" fill="#1B3229" opacity=".72" filter="url(#soft)"/>
 <path d="{P["high"]}" fill="#86BB9E" opacity=".62" filter="url(#soft)"/>
 <path d="{P["top"]}" fill="#CBE6D3" opacity=".55" filter="url(#soft2)"/>
 <path d="{P["det"]}" fill="#0F1C16" opacity=".42" filter="url(#soft2)"/>
 <path d="{P["rim"]}" fill="#F6DCA8" opacity=".8"/>''')
bg_wall = ('radial-gradient(ellipse at 52% 46%,#FFE3B0 0%,#E0A866 18%,#7A4E2C 46%,#2A1C12 75%,#120C08 100%)' if sil else
           'radial-gradient(ellipse at 52% 40%,#4A3A2C 0%,#2A211A 40%,#15110D 78%,#0B0907 100%)')
html = f'''<html><head><style>{ff} body{{margin:0}}
.sub{{position:absolute;left:150px;top:96px;font:700 65px 'Noto Sans CJK SC';color:#FFF6E6;line-height:1.38;text-shadow:0 2px 20px rgba(0,0,0,.6)}}
.u{{box-shadow:inset 0 -6px 0 rgba(124,199,162,.85)}} .stamp{{position:absolute;right:150px;top:62px;text-align:right;color:#F3E6CC;font-family:WK}}
.cnt{{position:absolute;left:150px;bottom:60px;color:#F3E6CC;font:600 32px 'Noto Sans CJK SC';opacity:.8}}</style></head><body>
<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:{bg_wall}">
<svg width="1920" height="1080" style="position:absolute;left:0;top:0"><defs>
 <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5F937A"/><stop offset=".55" stop-color="#3F6A57"/><stop offset="1" stop-color="#263F35"/></linearGradient>
 <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE2B0" stop-opacity="{.0 if sil else .22}"/><stop offset="1" stop-color="#FFE2B0" stop-opacity="0"/></linearGradient>
 <linearGradient id="plinth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2E25"/><stop offset="1" stop-color="#17120E"/></linearGradient>
 <filter id="halo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="38"/></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="soft2"><feGaussianBlur stdDeviation="2"/></filter>
 <filter id="rimglow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="haze"><feGaussianBlur stdDeviation="30"/></filter>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .9 0"/></filter>
</defs>
 <polygon points="960,-40 1300,-40 1560,1080 660,1080" fill="url(#beam)"/>
 <ellipse cx="1190" cy="1004" rx="520" ry="38" fill="#000" opacity="{.25 if sil else .45}" filter="url(#haze)"/>
 <rect x="800" y="985" width="780" height="140" rx="6" fill="url(#plinth)"/><rect x="800" y="985" width="780" height="5" fill="#C99C6A" opacity="{.25 if sil else .55}"/>
 <g transform="translate({HX},{HY}) scale({HW / W})">{horse}</g>
 <g opacity="{.0 if sil else .5}">{''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#FFE9C4" opacity="{o}"/>' for x, y, r, o in [(840,300,2,.5),(1210,220,1.6,.4),(990,160,1.2,.5),(1320,420,2.2,.3),(760,520,1.4,.4),(1100,380,1.1,.5)])}</g>
 <rect width="1920" height="1080" filter="url(#grain)" opacity=".07"/>
 <rect width="1920" height="1080" fill="url(#vig)"/>
</svg>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.55) 100%)"></div>
<div class="sub">{sub}</div>
<div class="stamp"><div style="font-size:40px">今天 · 甘肃省博物馆</div><div style="width:320px;height:2px;background:#C9A27A;margin:10px 0 10px auto"></div><div style="font-size:30px;opacity:.9">中国旅游标志 · 1983年起</div></div>
<div class="cnt">今天</div>
<img src="data:image/png;base64,{seal}" style="position:absolute;right:120px;bottom:58px;width:74px;opacity:.9;transform:rotate(-6deg)"></div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1920, 'height': 1080}); pg.set_content(html); pg.wait_for_timeout(600)
    pg.locator('#f').screenshot(path=out); b.close()
print('ok', out)
