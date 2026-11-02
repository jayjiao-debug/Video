"""ep57: build the storyboard page (HTML artifact) from sb57's frames + panels.json.
Usage: python3 sb_page.py <assessment.html>   (writes scratchpad sb57/page/storyboard.html + page/f/pNN.jpg)"""
import json, os, re, sys, html
from PIL import Image
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57'
OUT = f'{S}/page'; os.makedirs(f'{OUT}/f', exist_ok=True)
P = json.load(open(f'{S}/panels.json'))
for i in range(len(P)):
    Image.open(f'{S}/frames/p{i + 1:02d}.jpg').resize((1280, 720), Image.LANCZOS).save(f'{OUT}/f/p{i + 1:02d}.jpg', quality=80)
assess = open(sys.argv[1]).read() if len(sys.argv) > 1 else ''

def hl(t): return re.sub(r'\[([^\]]+)\]', r'<u>\1</u>', html.escape(t, quote=False))
ACTS = [('开场', '0:00 – 0:28', '钩子、登机、埋下两个问题', range(0, 6)),
        ('七站', '0:29 – 1:56', '每站：手绘 → 取景框 → 咔嚓 → 真实打卡照', range(6, 21)),
        ('答案', '2:00 – 2:32', '里程揭晓、七张合集、片尾', range(21, 25))]
acts = ''
for name, span, sub, idx in ACTS:
    cards = ''
    for i in idx:
        p = P[i]; snap = '打卡照' in p['tag']
        lines = ''.join(f'<p class="sub">{hl(l)}</p>' for l in p['lines'])
        cards += (f'<article class="frame" id="f{i + 1:02d}"><img src="f/p{i + 1:02d}.jpg" alt="第 {i + 1} 格：{html.escape(p["tag"])}" loading="lazy" width="1280" height="720">'
                  f'<div class="meta"><span class="no">{i + 1:02d}</span><span class="tc">{p["time"]}</span><span class="chip{" snap" if snap else ""}">{html.escape(p["tag"])}</span></div>'
                  f'<div class="subs">{lines}</div><p class="pic">{html.escape(p["pic"])}</p></article>')
    acts += f'<section class="act"><header class="acthead"><h2>{name}</h2><span class="span">{span}</span><span class="actsub">{sub}</span></header><div class="grid">{cards}</div></section>'

page = f'''<title>七大奇迹 粗分镜</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Sans+SC:wght@400;700;900&family=Noto+Serif+SC:wght@700;900&display=swap">
<style>
/* layout: a screening-room contact sheet, frames in story order, grouped by act; one warm dark look taken from the film's own end card */
:root {{
  --ground: #16110D; --panel: #211913; --ink: #F6EBDD; --muted: #B5A592; --gold: #F2C66E; --rule: rgba(246,235,221,.13);
  --display: "Noto Serif SC", "Songti SC", serif; --body: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: dark;
}}
body {{ background: var(--ground); color: var(--ink); font-family: var(--body); line-height: 1.6; }}
.wrap {{ max-width: 1240px; margin: 0 auto; padding-block: 40px 80px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: flex; flex-direction: column; gap: 48px; }}
.top {{ display: flex; flex-direction: column; gap: 12px; }}
.kicker {{ font-family: var(--mono); font-size: 13px; letter-spacing: .08em; color: var(--muted); text-transform: uppercase; }}
h1 {{ font-family: var(--display); font-weight: 900; font-size: clamp(30px, 5vw, 52px); line-height: 1.2; margin: 0; text-wrap: balance; }}
.lede {{ color: var(--muted); max-width: 62ch; margin: 0; font-size: 15px; }}
.assess {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }}
.assess section {{ background: var(--panel); border: 1px solid var(--rule); border-radius: 10px; padding: 20px 22px; min-width: 0; }}
.assess h3 {{ font-family: var(--display); font-size: 19px; margin: 0 0 10px; }}
.assess ul {{ margin: 0; padding-left: 1.1em; display: flex; flex-direction: column; gap: 8px; font-size: 15px; }}
.assess .verdict {{ grid-column: 1 / -1; }}
.assess .verdict p {{ margin: 0; font-size: 16px; }}
.score {{ font-family: var(--mono); color: var(--gold); }}
.act {{ display: flex; flex-direction: column; gap: 20px; }}
.acthead {{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; border-bottom: 1px solid var(--rule); padding-bottom: 10px; }}
.acthead h2 {{ font-family: var(--display); font-size: 28px; margin: 0; }}
.span {{ font-family: var(--mono); color: var(--gold); font-size: 14px; }}
.actsub {{ color: var(--muted); font-size: 14px; }}
.grid {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 28px; }}
@media (max-width: 760px) {{ .grid {{ grid-template-columns: minmax(0, 1fr); }} }}
.frame {{ display: flex; flex-direction: column; gap: 10px; min-width: 0; }}
.frame img {{ width: 100%; height: auto; aspect-ratio: 16 / 9; border-radius: 6px; display: block; background: var(--panel); }}
.meta {{ display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }}
.no {{ font-family: var(--mono); font-size: 13px; color: var(--muted); }}
.tc {{ font-family: var(--mono); font-size: 15px; color: var(--ink); }}
.chip {{ font-size: 12px; letter-spacing: .04em; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--rule); color: var(--muted); }}
.chip.snap {{ background: var(--gold); color: #2A1E12; border-color: var(--gold); font-weight: 700; }}
.subs {{ display: flex; flex-direction: column; gap: 2px; }}
.sub {{ margin: 0; font-weight: 700; font-size: 17px; }}
.sub u {{ text-decoration: none; border-bottom: 3px solid var(--gold); }}
.pic {{ margin: 0; color: var(--muted); font-size: 14px; max-width: 62ch; }}
.foot {{ color: var(--muted); font-size: 13px; border-top: 1px solid var(--rule); padding-top: 16px; }}
</style>
<div class="wrap">
  <div class="top">
    <span class="kicker">ep57 · 粗分镜 v1 · 25 格 · 约 2:32 · 2026-11-02</span>
    <h1>《新世界七大奇迹，你去过几个？》</h1>
    <p class="lede">按脚本 v5 一拍一格。实拍格 = Pexels 照片 + 「你」（D+ 可爱，身上不印字）；手绘格是把同一张照片色块化的占位，最终按 Juno 画风重画；字幕、打卡计数、里程表都是片中样式。抠掉原来游客的地方只是粗修。</p>
  </div>
  {assess}
  {acts}
  <p class="foot">照片：Pexels（成片片尾署名摄影师）。距离按大圆直线计算，5040 种顺序中最短。F3–F5、F8、F9 五条事实还没核实。</p>
</div>'''
open(f'{OUT}/storyboard.html', 'w').write(page)
print('ok', sum(os.path.getsize(f'{OUT}/f/' + f) for f in os.listdir(f'{OUT}/f')) // 1024, 'KB')
