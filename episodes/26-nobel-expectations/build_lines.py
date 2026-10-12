import json
# (text, seconds on screen); segments are laid out between fixed music anchors
SEG = [
 (0.0, 16.40, [
  "老板说：明年给你涨工资",
  "钱还没到，你今晚就多花了一点",
  "让你花钱的，不是钱，是[预期]",
  "说白了：老板给你[画了个饼]",
  "饼还没到手，你就先吃上了",
  "今年的诺贝尔经济学奖，就讲这个",
 ]),
 (20.75, 48.95, [
  "1978年，经济学家[霍尔]发现",
  "钱到账那天，人并不多花",
  "多花，是在[听说]要涨的那天",
  "你花的不是钱，是[以后]",
  "全国几亿人，都这样花钱",
  "所以一句话，能让全国一起掏钱",
  "反过来也一样：听说要[裁员]",
  "你今晚，就少花了一点",
  "你少花，楼下的店就少赚",
  "店少赚，就真的要裁人",
  "越怕，就越[真]会出事",
 ]),
 (49.05, 63.15, [
  "2012年，整个欧洲掉进这个漩涡",
  "西班牙借钱，利息冲破[7%]",
  "这时，欧洲央行的[德拉吉]画了个饼",
  "“不惜[一切代价]”",
  "“相信我，这就够了”",
 ]),
 (63.25, 79.35, [
  "饼还没兑现，怕的人先少了",
  "利息开始往下掉",
  "比德国多付的利息，不到一年[砍半]",
  "漩涡，慢慢停了",
  "那么，这个饼，央行掏了多少钱？",
 ]),
 (81.45, 115.80, [
  "[一分钱都没有]",
  "那个计划，一次都没用过",
  "因为大家[信]了：它真会出手",
  "[伍德福德]说：央行要说“我保证”",
  "而不是“我觉得”",
  "回到你：老板的饼，你还信吗？",
  "如果上次说涨薪，他没兑现",
  "这次，你一分都不会多花",
  "饼有没有用，不看画得多大",
  "看画饼的人，[说话算不算数]",
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
