"""ep57: the key-frame storyboard page for script v7 (from kf7.py's frames + kf7.json).
Usage: python3 kf7_page.py <notes.html>   (writes scratchpad sb57/page7/keyframes.html + page7/f/kNN.jpg)"""
import json, os, re, sys, html
from PIL import Image
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57'
OUT = f'{S}/page7'; os.makedirs(f'{OUT}/f', exist_ok=True)
P = json.load(open(f'{S}/kf7/kf7.json'))
for i in range(len(P)):
    Image.open(f'{S}/kf7/k{i + 1:02d}.jpg').resize((1280, 720), Image.LANCZOS).save(f'{OUT}/f/k{i + 1:02d}.jpg', quality=80)
assess = open(sys.argv[1]).read() if len(sys.argv) > 1 else ''

def hl(t): return re.sub(r'\[([^\]]+)\]', r'<u>\1</u>', html.escape(t, quote=False))
ACTS = [('出发', '0:00 – 0:16', '机场第一视角、片名、押注问题、空相册', range(0, 5)),
        ('七站', '0:18 – 2:02', '每站：「XXX欢迎你」→ 手绘场景讲历史 → 取景框 → 咔嚓（卡重拍）→ 拍立得显影 → 贴进相册', range(5, 33)),
        ('回家', '2:03 – 2:40', '里程赛跑、答案、欢迎回家、完整相册、片尾', range(33, 41))]
acts = ''
for name, span, sub, idx in ACTS:
    cards = ''
    for i in idx:
        p = P[i]; snap = ('拍立得' in p['tag']) or ('咔嚓' in p['tag']) or ('相册' in p['tag'])
        lines = ''.join(f'<p class="sub">{hl(l)}</p>' for l in p['lines'])
        cards += (f'<article class="frame" id="f{i + 1:02d}"><img src="f/k{i + 1:02d}.jpg" alt="第 {i + 1} 格：{html.escape(p["tag"])}" loading="lazy" width="1280" height="720">'
                  f'<div class="meta"><span class="no">{i + 1:02d}</span><span class="tc">{p["time"]}</span><span class="chip{" snap" if snap else ""}">{html.escape(p["tag"])}</span></div>'
                  f'<div class="subs">{lines}</div><p class="pic">{html.escape(p["pic"])}</p></article>')
    acts += f'<section class="act"><header class="acthead"><h2>{name}</h2><span class="span">{span}</span><span class="actsub">{sub}</span></header><div class="grid">{cards}</div></section>'

page = f'''<title>七大奇迹 关键帧</title>
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
    <span class="kicker">ep57 · 关键帧 v1（脚本 v7）· 41 帧 · 约 2:40 · 2026-11-03</span>
    <h1>《新世界七大奇迹，你去过几个？》</h1>
    <p class="lede">整片串起来的样子：机场第一视角出发 → 6 站（每站落地时 AI 用当地语言说「XXX欢迎你」，代码画的场景讲这座奇迹为什么建、谁建的，然后举起拍立得咔嚓，相纸显影成真实照片，飞下一站时贴进相册）→ 回到长城「欢迎回家」→ 完整相册。所有场景和历史画面都是代码画的（自己的线条和配色），照片只在咔嚓之后出现。BGM 用加长版（2:42），转场和咔嚓都卡在小节重拍上。</p>
  </div>
  {assess}
  {acts}
  <p class="foot">距离按大圆直线计算：北京首都机场出发，经 6 处，回到长城八达岭；720 种顺序中最短（39,735 公里，差 340 公里绕满一圈）。历史画面的事实来源：Britannica、National Geographic、Smarthistory、History Hit、Yale（Kleiner 讲座）。照片：Pexels 等（片尾署名）。</p>
</div>'''
open(f'{OUT}/keyframes.html', 'w').write(page)
print('ok', sum(os.path.getsize(f'{OUT}/f/' + f) for f in os.listdir(f'{OUT}/f')) // 1024, 'KB')
