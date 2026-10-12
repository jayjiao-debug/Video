import json
# (text, seconds on screen); segments are laid out between fixed music anchors
SEG = [
 (0.0, 16.40, [
  "老板说：明年给你涨工资",
  "钱还没到，你今晚就多花了一点",
  "让你花钱的，是[预期]",
  "2012年，有人只说了一句话",
  "西班牙借钱多付的利息，[砍半]",
  "今年的诺贝尔经济学奖，讲的就是它",
 ]),
 (20.75, 48.95, [
  "先说[霍尔]：人花钱，看的是以后",
  "1978年：钱到账那天，并不多花",
  "听到消息那天，你已经变了",
  "一个国家，就是亿万个这样的你",
  "管住[预期]，经济就更稳",
  "再说[伍德福德]：央行该怎么说话",
  "2012年夏天，欧元区",
  "西班牙借10年的钱，利息冲破[7%]",
  "越怕它还不上，利息越高",
  "利息越高，就越还不上",
 ]),
 (49.05, 63.15, [
  "7月26日，伦敦，央行行长[德拉吉]",
  "“不惜[一切代价]，保住欧元”",
  "“相信我，这就够了”",
  "没说买多少，也没说怎么买",
  "只给了一个[承诺]",
 ]),
 (63.25, 79.35, [
  "9月，细则公布：买债[不设上限]",
  "利息开始往下掉",
  "西班牙比德国多付：[6]个多点",
  "不到一年：降到不到[3]个点",
  "那么，这个计划买了多少？",
 ]),
 (81.45, 115.80, [
  "[一次都没买]",
  "一分钱没花，利息照样降了",
  "因为大家[相信]：它真的会买",
  "伍德福德：要给[承诺]，不只是预测",
  "但这招有个[前提]",
  "话要被[相信]，才算数",
  "说了做不到，下一次就没人信",
  "预期能稳住经济，也能拖垮它",
  "回到你：老板说的加薪",
  "你信不信，决定你今晚怎么花",
  "一句话的分量，在于[有人信]",
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
