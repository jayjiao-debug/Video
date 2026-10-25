import numpy as np, librosa, json
from scipy.signal import butter, sosfilt
from common import *
x=load_bed(); mono=x.mean(1); song=load_song(); sm=song.mean(1)
fb=film_beats(); bt=np.array([b[0] for b in fb]); bk=[b[1] for b in fb]; bs=[b[2] for b in fb]
hop=480
C=librosa.feature.chroma_cqt(y=mono,sr=SR,hop_length=hop)
M=librosa.feature.mfcc(y=mono,sr=SR,n_mfcc=13,hop_length=hop)
lo=sosfilt(butter(4,100,'lp',fs=SR,output='sos'),mono)
def fidx(t): return int(t*SR/hop)
# per-beat chroma change (harmonic change) and kick energy
rows=[]
for i in range(len(bt)-1):
    a,b=fidx(bt[i]),fidx(bt[i+1])
    rows.append((C[:,a:b].mean(1),M[:,a:b].mean(1)))
hc=[0]+[1-np.dot(rows[i][0],rows[i-1][0])/np.linalg.norm(rows[i][0])/np.linalg.norm(rows[i-1][0]) for i in range(1,len(rows))]
kick=[10*np.log10((lo[int(t*SR):int((t+0.1)*SR)]**2).mean()+1e-12) for t in bt[:-1]]
def pos(k,s): return (k-2)%4 if 182.2<=s<=252.2 else (k-1)%4
for nm,a,b in [('intro',0.5,17.6),('part1 body',21,75),('valley',75.3,105),('part2 lead/drop',107,125),('coda',125.1,136)]:
    hcp={p:[] for p in range(4)}; kp={p:[] for p in range(4)}
    for i in range(len(rows)):
        if a<=bt[i]<b: hcp[pos(bk[i],bs[i])].append(hc[i]); kp[pos(bk[i],bs[i])].append(kick[i])
    print('%-16s harm-change by pos %s  kick dB by pos %s'%(nm,{p:round(np.mean(v),3) for p,v in hcp.items()},{p:round(np.mean(v),1) for p,v in kp.items()}))
# bar-level novelty (using bars from pos0) to find section boundaries
bars=[bt[i] for i in range(len(rows)) if pos(bk[i],bs[i])==0]
feat=[]
for i in range(len(bars)-1):
    a,b=fidx(bars[i]),fidx(bars[i+1]); f=np.concatenate([C[:,a:b].mean(1)*3,M[1:,a:b].mean(1)/20, [10*np.log10((mono[int(bars[i]*SR):int(bars[i+1]*SR)]**2).mean())/10]]); feat.append(f)
feat=np.array(feat)
nov=[0]+[np.linalg.norm(feat[i]-feat[i-1]) for i in range(1,len(feat))]
print('bar starts with high novelty (top 18):')
lines=json.load(open('/home/claude/video/episodes/45-mashou/lines_v3_meta.json'))
for i in np.argsort(nov)[::-1][:18]:
    t=bars[i]; near=[(l['id'],round(l['a']-t,2)) for l in lines if abs(l['a']-t)<1.2]
    print('  bar %.3f nov %.2f  lines near: %s'%(t,nov[i],near))
json.dump({'bars':[float(b) for b in bars],'nov':[float(v) for v in nov]},open('bars.json','w'))
