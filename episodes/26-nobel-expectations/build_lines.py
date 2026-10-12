import json
# (text, seconds on screen); segments are laid out between fixed music anchors
SEG = [
 (0.0, 16.40, [
  "老板说：明年给你涨工资",
  "钱还没到，你今晚就多花了一点",
  "让你花钱的，不是钱，是[预期]",
  "2012年，有人只说了一句话",
  "一分钱没花，欧洲的危机就[降温]了",
  "今年诺贝尔经济学奖，讲的就是这个",
 ]),
 (20.75, 48.95, [
  "先说[霍尔]：人花钱，看的是以后",
  "1978年：钱到账那天，并不多花",
  "听说要涨工资那天，你就变了",
  "全国几亿人，都是这样的你",
  "管住[预期]，经济就更稳",
  "再说[伍德福德]：央行该怎么说话",
  "2012年，西班牙急着借钱",
  "大家越怕它还不上",
  "借给它的利息就越高：冲破[7%]",
  "利息越高，它就越还不上",
  "越怕，就越[真]会出事",
 ]),
 (49.05, 63.15, [
  "这时，欧洲央行的[德拉吉]上台",
  "只说了一句：“不惜[一切代价]”",
  "“相信我，这就够了”",
  "意思是：没人敢借给它，我借",
  "钱还没出，先给一个[承诺]",
 ]),
 (63.25, 79.35, [
  "后来又说：借多少，[不设上限]",
  "怕的人，一下子少了",
  "利息开始往下掉",
  "比德国多付的利息，不到一年[砍半]",
  "那么，央行最后借出去多少？",
 ]),
 (81.45, 115.80, [
  "[一分钱都没有]",
  "那个计划，一次都没用过",
  "因为大家[信]了：它真会出手",
  "伍德福德说：央行要给[承诺]",
  "要说“我保证”，不是“我觉得”",
  "但这招有个[前提]",
  "话要有人[信]，才算数",
  "说了做不到，下次就没人信",
  "预期能救经济，也能拖垮它",
  "回到你：老板说的加薪",
  "你信不信，决定你今晚怎么花",
  "一句话值多少钱？看[多少人信]",
 ]),
]
import re
def n(s): return len(re.findall(r'[一-鿿]|[A-Za-z]+|\d+(?:[.,]\d+)*', re.sub(r'[\[\]]','',s)))
out=[]
for a,b,lines in SEG:
    need=[0.5+n(t)/7+0.6 for t in lines]; gap=0.1
    span=b-a-gap*(len(lines)-1); k=span/sum(need)
    t=a
    for txt,nd in zip(lines,need):
        d=nd*k; out.append([round(t,2),round(t+d,2),txt]); t+=d+gap
json.dump(out,open('lines_arr.json','w'),ensure_ascii=False)
json.dump([{'start':s,'end':e,'text':x} for s,e,x in out],open('lines.json','w'),ensure_ascii=False,indent=1)
for s,e,x in out:
    L=len(x.replace('[','').replace(']',''))
    print(f'{s:6.2f}-{e:6.2f} {L:2d} {x}')
