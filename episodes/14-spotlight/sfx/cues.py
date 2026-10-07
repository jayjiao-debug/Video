import json,math
BT=0.5062;D1=12.40;bt=lambda i:D1+BT*i;D2=D1+156*BT;bt2=lambda j:D2+BT*j;RB=D2-20*BT;bt3=lambda k:RB+BT*k
ease=lambda t:(lambda t:4*t*t*t if t<.5 else 1-(-2*t+2)**3/2)(min(1,max(0,t)))
seg=lambda t,a,b:ease((t-a)/(b-a))
C=[]
import random;random.seed(3)
def typing(t0,dur,n,g=.5):
    for k in range(1,n+1):C.append([t0+dur*k/n+random.uniform(-.012,.012),'key',g,random.uniform(-.2,.2)])
# opening: wrong group
C+= [[0.30,'error',.8],[1.30,'pop',.35],[1.85,'tap',.6],[2.15,'buzz',.9]]
# read receipts climbing (own clock: ticks when the count crosses each integer)
def read(t):return 0 if t<3.3 else (19*seg(t,3.3,5.8) if t<5.9 else 19+33*seg(t,5.9,7.4))
last=0;t=3.3
while t<7.45:
    r=int(read(t))
    if r>last:
        if r%2==0 or r>=50:C.append([t,'tick',.55 if r<52 else .9,0])
        last=r
    t+=1/240
C.append([7.42,'pop',.5])
# panic search
typing(8.95,1.5,12,.55);C+= [[bt(-3),'tap',.6],[bt(-3)+.08,'whoosh',.25]]
# into the article (page push), highlighter, scroll to Study 1
C+= [[15.15,'tap',.6],[15.3,'whoosh',.35],[bt(8),'marker',.7],[18.47,'whoosh',.2]]
# T-shirt
C+= [[22.52,'whoosh',.45]]+[[bt(i),'pop',.35] for i in (22,23)]+[[bt(i),'tick',.8] for i in (24,25,26,27)]+[[bt(28),'thud',.9]]
# door, eye-lines, out, question
C+= [[29.65,'whoosh',.35],[35.45,'thud',.6],[35.69,'pop',.45]]
# bars and multipliers, shirt flip
C+= [[38.72,'whoosh',.25],[41.76,'whoosh',.2],[bt(60),'pop',.5],[44.6,'whoosh',.4],[47.84,'whoosh',.25],[50.87,'whoosh',.2],[bt(78),'pop',.5]]
C+= [[bt(84),'receive',.35,-.4],[bt(84)+.5,'receive',.25,.4]]
# imagined small group: messages come in, then the stamp
C+= [[bt(i),'receive',.55,(-.2 if i%2 else .2)] for i in (89,90,91,92)]+[[bt(93),'thud',.85]]
# notes draft typing, redaction
typing(60.6,.6,7,.45);typing(61.35,.6,6,.45);typing(62.1,.5,4,.45);C.append([bt(100),'thud',.45])
# slider: friction ticks slowing down, then 52
t=64.1
while t<65.0:C.append([t,'tick',.35,0]);t+=0.05+0.12*(t-64.1)
C+= [[bt(104),'pop',.5]]
# real score counts up 52->69, avatar pops back, +17
for v in range(53,70):
    tv=67.1+0.8*(v-52)/17;C.append([tv,'tick',.4,0])
C+= [[bt(109),'pop',.55],[bt(110),'chime',.55]]
# the whole you
C+= [[bt(116),'shimmer',.6]]
# 1:15 chat: three sent messages
C+= [[bt(i),'send',.55] for i in (124,126,128)]
# liking gap bars
C+= [[bt(136),'whoosh',.25],[bt3(4),'pop',.4],[bt3(6),'pop',.45]]
# a term of her messages arriving
C.append([bt3(12),'receive',.45])
for i in range(1,6):
    t=bt3(13)
    while seg(t,bt3(13),bt3(13)+BT*6.2)*5<i-1+1e-3 and t<91:t+=1/240
    C.append([t,'receive',.42,(-.2 if i%2 else .2)])
# drop 2: six phones, banners arrive, swiped away
C+= [[D2+.17,'receive',.4,-.3],[D2+.27,'receive',.3,.3]]
for i in range(6):C.append([bt2(2)+i*BT/2,'send',.28-.03*i,(-.5+.2*i)])
# your message buried: fast scroll
C+= [[95.6,'whoosh',.3]]
# morning: type, send, replies
typing(99.95,.45,10,.5);C+= [[bt2(18),'send',.6],[bt2(19),'receive',.55,-.2],[bt2(20),'receive',.55,.2]]
# end card
C+= [[103.6,'chime',.35]]
C=[[round(c[0],4)]+c[1:] for c in C]
json.dump(sorted(C),open('cues.json','w'),indent=0);print(len(C))
