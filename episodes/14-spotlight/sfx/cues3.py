import json,random
random.seed(5)
BT=0.5062;D1=12.40;bt=lambda i:D1+BT*i;D2=D1+156*BT;bt2=lambda j:D2+BT*j;RB=D2-20*BT;bt3=lambda k:RB+BT*k
ease=lambda u:(lambda u:4*u*u*u if u<.5 else 1-(-2*u+2)**3/2)(min(1,max(0,u)))
C=[]
def typing(t0,d,n):
    for k in range(1,n+1):C.append([t0+d*k/n+random.uniform(-.012,.012),'key',.5,random.uniform(-.15,.15)])
def meter(t0,t1,v0,v1,step=2,g=.32):  # one detent per `step` units as the bar/slider moves (eased like the picture)
    last=v0;t=t0
    while t<=t1:
        v=v0+(v1-v0)*ease((t-t0)/(t1-t0))
        if abs(v-last)>=step:C.append([t,'tick',g,0]);last=v
        t+=1/600
# typing
typing(8.95,1.5,12);typing(60.6,.6,7);typing(61.35,.6,6);typing(62.1,.5,4);typing(99.95,.45,10)
# chat messages
for i in (89,90,91,92):C.append([bt(i),'msg',.6,(-.15 if i%2 else .15)])
for i in (124,126,128):C.append([bt(i),'msg',.55,.1])
C.append([bt3(12),'msg',.5,-.1])
for i in range(1,6):
    t=bt3(13)
    while ease((t-bt3(13))/(BT*6.2))*5<i-1+1e-3:t+=1/600
    C.append([t,'msg',.5,(-.15 if i%2 else .15)])
for j,pn in ((18,.1),(19,-.15),(20,.15)):C.append([bt2(j),'msg',.6,pn])
# bar meters (scroll detents)
meter(38.72,39.3,0,46);meter(41.76,42.4,0,23);meter(47.84,48.5,0,48);meter(50.87,51.4,0,8,1)
meter(bt(136),bt(136)+1.2,0,62,3);meter(bt3(4),bt3(4)+1.0,48,64,1);meter(67.1,67.9,52,69,1)
json.dump(sorted([[round(c[0],4)]+c[1:] for c in C]),open('cues3.json','w'));print(len(C))
