import numpy as np, json
from common import *
fb=film_beats(); bt=np.array([b[0] for b in fb]); bk=np.array([b[1] for b in fb])
cuts=json.load(open('/home/claude/video/episodes/45-mashou/review/v1/probe.json'))['hard_cuts']
lines=json.load(open('/home/claude/video/episodes/45-mashou/lines_v3_meta.json'))
# the probe reports cut at frame time; frame k shows t in [k/30,(k+1)/30). report offset to nearest beat
fps=30
for c in cuts:
    i=np.argmin(np.abs(bt-c)); d=c-bt[i]
    pos=(bk[i]-1)%4  # 0 = downbeat (bar phase from song grid; part2 differs)
    ln=[l['id'] for l in lines if abs(l['a']-c)<0.07]
    print('%7.2f  beat %.3f  off %+5.0f ms (%+.1f fr)  %s'%(c,bt[i],1000*d,d*fps,' line '+','.join(ln) if ln else ''))
print()
for l in lines:
    i=np.argmin(np.abs(bt-l['a'])); d=l['a']-bt[i]
    if abs(d)>0.04: print('line',l['id'],l['a'],'off beat by %+.0f ms'%(1000*d))
