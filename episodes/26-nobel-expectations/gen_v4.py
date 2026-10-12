import json,re,sys
exec(open('lines_v4.py').read())
VER=sys.argv[1] if len(sys.argv)>1 else 'v4'
def n(s): return len(re.findall(r'[一-鿿]|[A-Za-z]+|\d+(?:[.,]\d+)*', re.sub(r'[\[\]“”？]','',s)))
out=[]
for a,b,L in SEG:
    need=[0.6+n(t)/6+0.8 for t,_,_ in L]; gap=0.1
    k=(b-a-gap*(len(L)-1))/sum(need); t=a
    for (txt,pic,f),nd in zip(L,need):
        d=nd*k; out.append([round(t,2),round(t+d,2),txt,pic,f]); t+=d+gap
json.dump([o[:3] for o in out],open('lines_arr.json','w'),ensure_ascii=False)
json.dump([{'start':s,'end':e,'text':x} for s,e,x,_,_ in out],open('lines.json','w'),ensure_ascii=False,indent=1)
for i,(s,e,x,_,_) in enumerate(out,1):
    L=len(re.sub(r'[\[\]]','',x)); print(f'{i:2d} {s:6.2f}-{e:6.2f} {e-s:4.1f}s {L:2d}{" LONG" if L>16 else ""} {x}')
hdr=f'''# Script: 画饼，到底有没有用？（ep26 · {VER} 2026-10-12 · 全长 BGM 2:42）

**Owner notes:** 16:51「和我有什么关系」→ 老板的饼贯穿全片；17:01 能代入、能用、好懂；17:07「不惜一切代价」看不懂 → 大白话；17:08 放慢、尽量讲清楚，BGM 全长 2:42；17:15 18–23 岁、没有金融背景能不能懂。
**v4:** full track; ~4 字/秒; why the crisis stopped; promise vs forecast with two everyday comparisons; fear spiral after the reveal.
**v4.1 (no finance background):** bridge 老板 → 管着全国钱的人; why a country borrows (旧债要借新钱来还); what the central bank is (管着欧元，能印钱), which is also why its promise is believable.
**Music anchors:** title 16.625 · breakdown 49.0 · build 63.2 · silent gap 79.4–81.4 · drop 2 81.432 · end card 154.34 → ~163.
**Takeaway:** 饼有没有用，看他说话算不算数；你的话也一样，看你兑现过几次。
**Title:** 画饼，到底有没有用？（备选：一句话，值多少钱？）· sub-line 2026 诺贝尔经济学奖 · 霍尔 & 伍德福德 · end-card question: 老板画的饼，你吃过几次？

## Lines and picture
| # | Start | End | Subtitle | Picture | Facts |
|---|---|---|---|---|---|
'''
open('script.md','w').write(hdr+'\n'.join(f'| {i} | {s:.2f} | {e:.2f} | {x} | {p} | {f} |' for i,(s,e,x,p,f) in enumerate(out,1))+'\n| E | 154.34 | ~163 | *(片尾卡)* | 「老板画的饼，你吃过几次？」 | — |\n')
o=[f'# 《画饼，到底有没有用？》剧本 {VER}','','2026 诺贝尔经济学奖 · 霍尔 & 伍德福德 · 全片约 2 分 43 秒（BGM 全长）· 纯字幕','',
'**核心一句：** 饼有没有用，看他说话算不算数；你的话也一样，看你兑现过几次。','','**备选标题：** 《一句话，值多少钱？》','','**片尾提问：** 老板画的饼，你吃过几次？','',
'字幕中【】内的词为高亮。每句约 3 秒，每秒约 4 个字。','']
for i,(s,e,x,p,f) in enumerate(out,1):
    if i==7: o+=['## 标题卡（16.6–20.7 秒）','','《画饼，到底有没有用？》，副题：2026 诺贝尔经济学奖 · 霍尔 & 伍德福德','']
    if x.startswith('[一分钱'): o+=['## 静默两秒（79.4–81.4 秒）','','没有字幕，画面是一只还没打开的金库。','']
    if i in SEC:
        if i>1 and o[-1]!='': o.append('')
        o+=[f'## {SEC[i]}','','| # | 时间 | 字幕 | 画面 |','|---|---|---|---|']
    o.append(f'| {i} | {s:.1f}–{e:.1f} | {x.replace("[","【").replace("]","】")} | {p} |')
o+=['','## 片尾（154.3 秒 – 结束）','','Juno 片尾卡：「老板画的饼，你吃过几次？」','','## 事实依据','',
'- 霍尔 1978：消费只随“关于未来的新消息”变化（Hall, *Journal of Political Economy*, 1978）',
'- 2012 年 7 月，西班牙 10 年期国债利率冲破 7%，借钱越来越难（Bloomberg，2012 年 7 月 19 日）；“旧债借新钱来还”是示意',
'- 德拉吉 2012 年 7 月 26 日伦敦讲话：“在职责范围内，欧洲央行会不惜一切代价保住欧元。相信我，这就够了。”（BIS 讲话稿）片中用的是大意：“我来借”',
'- “要多少给多少”：同年 9 月 6 日公布的买债计划（OMT）不设上限（欧洲央行新闻稿）',
'- 大家不慌了：西班牙比德国多付的利息，从 6 个多点降到不到 3 个点，2012.7 → 2013.5（欧洲央行，2013 年 6 月 11 日）',
'- 说好的借钱一次都没借过：OMT 从未启用（欧盟法院总法律顾问意见，2015 年 1 月 14 日）',
'- 伍德福德：央行要给“承诺”，不只是“预测”（2012 年杰克逊霍尔会议论文）；《利息与价格》（2003）',
'- 天气预报、签字两个比喻，以及发工资、裁员、楼下小店这几段，是示意，不是数据']
open(f'剧本_画饼_{VER}.md','w').write('\n'.join(o)+'\n')
