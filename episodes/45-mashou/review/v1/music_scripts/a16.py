import numpy as np, pyloudnorm as pyln, json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.signal import butter, sosfilt
from common import *
x=load_bed(); t=np.arange(len(x))/SR
m=pyln.Meter(SR)
def kw(s):
    for f in m._filters.values(): s=np.stack([f.apply_filter(s[:,c]) for c in range(2)],1)
    return s
DROP=116.043
g=np.ones(len(x)); li=np.clip((t-106.986)/P,0,1); li[t>=DROP]=0; g*=10**(-2*li/20)
up=np.clip((t-(DROP-2*P))/P,0,1); w=0.5-0.5*np.cos(np.pi*up); w[t>=DROP]=0; g*=10**(-3*w/20)
a,b=int(98*SR),int(130*SR)
hp=butter(4,250,'hp',fs=SR,output='sos')
fig,ax=plt.subplots(figsize=(16,5))
for lab,s in [('full band (now)',x[a:b]),('phone sim HPF250 (now)',sosfilt(hp,x[a:b],axis=0)),('phone sim, proposed lead-in -2 / breath -8',sosfilt(hp,(x*g[:,None])[a:b],axis=0))]:
    k=kw(s); h=int(0.1*SR); w4=int(0.4*SR)
    L=[-0.691+10*np.log10((k[i:i+w4]**2).mean(0).sum()+1e-12) for i in range(0,len(k)-w4,h)]
    ax.plot(98+np.arange(len(L))*0.1+0.2,L,label=lab,lw=1)
for v,l in [(105.29,'stop HIT'),(106.986,'re-entry'),(114.911,'breath'),(116.043,'DROP'),(125.10,'coda')]: ax.axvline(v,c='r',lw=.6); ax.text(v,-8,l,fontsize=8,rotation=90)
ax.set_ylim(-45,-5); ax.legend(); ax.grid(alpha=.3); ax.set_title('momentary loudness 400 ms, 98-130 s'); plt.tight_layout()
plt.savefig('/home/claude/video/episodes/45-mashou/review/v1/music_drop_phone.png',dpi=65)
# cuts table
cuts=json.load(open('cuts.json'))
json.dump([{'cut':c,'nearest_beat':round(bt,3),'offset_ms':o,'beat_of_bar':p+1} for c,bt,o,p in cuts],open('/home/claude/video/episodes/45-mashou/review/v1/music_cuts.json','w'),indent=1)
